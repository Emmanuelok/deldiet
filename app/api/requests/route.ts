import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { serviceRequests } from "@/db/schema";
import { normalizeServiceRequest, publicStatusMessage, type ServiceRequestType } from "@/lib/service-requests";

const MAX_BODY_BYTES = 72_000;

function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function typeCode(type: ServiceRequestType): string {
  const codes: Record<ServiceRequestType, string> = {
    reservation: "VISIT",
    newsletter: "FIELD",
    concierge: "ASK",
    home_order_review: "HOME",
    founding_batch: "FOUND",
    wholesale: "WHOLE",
    workplace: "WORK",
    producer: "GROW",
    origin_bar_request: "BAR",
    origin_exchange_order_review: "SHOP",
    origin_exchange_trade_inquiry: "TRADE",
    subscription_plan: "RHYTHM",
    gift_build: "GIFT",
    workplace_program: "TEAM",
  };
  return codes[type];
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function routeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("service_requests")) {
    return "The request service is being initialized. Please try again shortly.";
  }
  return "Deldiet could not save this request. Please try again.";
}

function storedRequestMeta(payloadJson: string): { requestHash: string; customerPhone: string | null } | null {
  try {
    const payload = JSON.parse(payloadJson) as unknown;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const meta = (payload as Record<string, unknown>)._requestMeta;
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
    const record = meta as Record<string, unknown>;
    return {
      requestHash: typeof record.requestHash === "string" ? record.requestHash : "",
      customerPhone: typeof record.customerPhone === "string" ? record.customerPhone : null,
    };
  } catch { return null; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin submissions are not accepted." }, { status: 403 });

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ error: "Request details are too large." }, { status: 413 });

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return Response.json({ error: "Request details are too large." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = normalizeServiceRequest(body, request.headers.get("idempotency-key"));
  if (!parsed.ok) return Response.json({ error: parsed.error, field: parsed.field }, { status: 400 });

  try {
    const db = await getDb();
    const now = new Date();
    // The high-entropy idempotency key also acts as the private tracking token.
    // Keeping only its hash in D1 lets a safe retry recover the same receipt
    // without storing a reusable public lookup secret in plaintext.
    const trackingToken = parsed.value.idempotencyKey;
    const idempotencyHash = await sha256(parsed.value.idempotencyKey);
    const requestHash = await sha256(stableStringify({
      type: parsed.value.type,
      source: parsed.value.source,
      customer: parsed.value.customer,
      currency: parsed.value.currency,
      estimatedSubtotalCents: parsed.value.estimatedSubtotalCents,
      payload: parsed.value.payload,
    }));
    const row = {
      id: crypto.randomUUID(),
      publicReference: `DL-${typeCode(parsed.value.type)}-${randomHex(10).toUpperCase()}`,
      idempotencyKey: idempotencyHash,
      requestType: parsed.value.type,
      source: parsed.value.source,
      status: parsed.value.initialStatus,
      customerName: parsed.value.customer.name,
      customerEmail: parsed.value.customer.email,
      currency: parsed.value.currency,
      estimatedSubtotalCents: parsed.value.estimatedSubtotalCents,
      payloadJson: JSON.stringify({ ...parsed.value.payload, _requestMeta: { requestHash, customerPhone: parsed.value.customer.phone } }),
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await db
      .insert(serviceRequests)
      .values(row)
      .onConflictDoNothing({ target: [serviceRequests.requestType, serviceRequests.idempotencyKey] })
      .returning({
        publicReference: serviceRequests.publicReference,
        requestType: serviceRequests.requestType,
        source: serviceRequests.source,
        status: serviceRequests.status,
        payloadJson: serviceRequests.payloadJson,
        createdAt: serviceRequests.createdAt,
      });

    if (inserted[0]) {
      const created = inserted[0];
      const type = created.requestType as ServiceRequestType;
      return Response.json({
        request: {
          reference: created.publicReference,
          trackingToken,
          status: created.status,
          type,
          createdAt: created.createdAt.toISOString(),
          message: publicStatusMessage(created.status, type),
          duplicate: false,
        },
      }, { status: 201, headers: { "Cache-Control": "no-store", "X-Request-Reference": created.publicReference } });
    }

    const existing = await db
      .select({
        publicReference: serviceRequests.publicReference,
        requestType: serviceRequests.requestType,
        source: serviceRequests.source,
        status: serviceRequests.status,
        payloadJson: serviceRequests.payloadJson,
        createdAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.requestType, parsed.value.type), eq(serviceRequests.idempotencyKey, idempotencyHash)))
      .limit(1);

    const existingMeta = existing[0] ? storedRequestMeta(existing[0].payloadJson) : null;
    if (!existing[0] || existing[0].requestType !== parsed.value.type || existing[0].source !== parsed.value.source || existingMeta?.requestHash !== requestHash) {
      return Response.json({ error: "This submission changed after its request key was created. Please submit it again." }, { status: 409 });
    }

    return Response.json({
      request: {
        reference: existing[0].publicReference,
        trackingToken: parsed.value.idempotencyKey,
        status: existing[0].status,
        type: existing[0].requestType as ServiceRequestType,
        createdAt: existing[0].createdAt.toISOString(),
        message: publicStatusMessage(existing[0].status, existing[0].requestType as ServiceRequestType),
        duplicate: true,
      },
    }, { headers: { "Cache-Control": "no-store", "X-Request-Reference": existing[0].publicReference } });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference")?.trim().toUpperCase() ?? "";
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!/^DL-[A-Z]+-[A-F0-9]{20}$/.test(reference) || token.length < 24 || token.length > 128) {
    return Response.json({ error: "A valid reference and tracking token are required." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const tokenHash = await sha256(token);
    const rows = await db
      .select({
        publicReference: serviceRequests.publicReference,
        requestType: serviceRequests.requestType,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
        updatedAt: serviceRequests.updatedAt,
      })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.publicReference, reference), eq(serviceRequests.idempotencyKey, tokenHash)))
      .limit(1);

    if (!rows[0]) return Response.json({ error: "Request not found." }, { status: 404 });
    const type = rows[0].requestType as ServiceRequestType;
    return Response.json({
      request: {
        reference: rows[0].publicReference,
        type,
        status: rows[0].status,
        createdAt: rows[0].createdAt.toISOString(),
        updatedAt: rows[0].updatedAt.toISOString(),
        message: publicStatusMessage(rows[0].status, type),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 503 });
  }
}
