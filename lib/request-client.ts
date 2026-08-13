import type { ServiceRequestType } from "./service-requests";

export type ServiceRequestInput = {
  type: ServiceRequestType;
  source: string;
  customer?: { name?: string; email?: string; phone?: string };
  payload?: Record<string, unknown>;
  estimatedSubtotalCents?: number;
};

export type ServiceRequestReceipt = {
  reference: string;
  trackingToken: string;
  status: string;
  type: ServiceRequestType;
  createdAt: string;
  message: string;
  duplicate: boolean;
};

export class ServiceRequestError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ServiceRequestError";
    this.status = status;
  }
}

type SubmitOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export function createIdempotencyKey(scope: string): string {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${scope}:${id}`;
}

export async function submitServiceRequest(
  input: ServiceRequestInput,
  idempotencyKey = createIdempotencyKey(input.type),
  options: SubmitOptions = {},
): Promise<ServiceRequestReceipt> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15_000;
  const forwardAbort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) forwardAbort();
  else options.signal?.addEventListener("abort", forwardAbort, { once: true });
  const timer = window.setTimeout(() => controller.abort("Request timed out"), timeoutMs);

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ ...input, idempotencyKey }),
      signal: controller.signal,
    });

    const result = await response.json().catch(() => null) as { request?: ServiceRequestReceipt; error?: string } | null;
    if (!response.ok || !result?.request) {
      throw new ServiceRequestError(result?.error || "Deldiet could not save this request. Please try again.", response.status);
    }
    return result.request;
  } catch (error) {
    if (error instanceof ServiceRequestError) throw error;
    if (controller.signal.aborted) {
      throw new ServiceRequestError("The request took too long to save. Your selections are still here—please try again.");
    }
    throw new ServiceRequestError(error instanceof Error ? error.message : "Deldiet could not save this request. Please try again.");
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}
