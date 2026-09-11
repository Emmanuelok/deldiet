import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { eq } from "drizzle-orm";
import { createD1HttpCallback, readD1HttpConfig, RequestDatabaseUnavailableError } from "../db/d1-http.ts";
import { serviceRequests } from "../db/schema.ts";

const config = {
  accountId: "a".repeat(32),
  databaseId: "12345678-1234-1234-1234-123456789abc",
  apiToken: "test-only-token-never-a-live-credential",
};
const response = (rows) => Response.json({ success: true, result: [{ success: true, results: { rows } }] });

test("requires all server configuration and rejects identifiers containing URL syntax", () => {
  assert.equal(readD1HttpConfig({}), null);
  assert.throws(() => readD1HttpConfig({ CLOUDFLARE_ACCOUNT_ID: config.accountId }), RequestDatabaseUnavailableError);
  assert.throws(() => readD1HttpConfig({ CLOUDFLARE_ACCOUNT_ID: "../elsewhere", CLOUDFLARE_D1_DATABASE_ID: config.databaseId, CLOUDFLARE_D1_API_TOKEN: config.apiToken }), RequestDatabaseUnavailableError);
  assert.deepEqual(readD1HttpConfig({ CLOUDFLARE_ACCOUNT_ID: config.accountId, CLOUDFLARE_D1_DATABASE_ID: config.databaseId, CLOUDFLARE_D1_API_TOKEN: config.apiToken }), config);
});

test("keeps parameters separate, rejects redirects, bypasses cache and follows Drizzle row modes", async () => {
  const callback = createD1HttpCallback(config, { fetch: async (url, init) => {
    assert.equal(url, `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/raw`);
    assert.equal(init.headers.Authorization, `Bearer ${config.apiToken}`);
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    assert.deepEqual(JSON.parse(init.body), { sql: "select ?, ?, ?", params: ["O'Brien", 42, null] });
    return response([["O'Brien", 42, null]]);
  } });
  assert.deepEqual(await callback("select ?, ?, ?", ["O'Brien", 42, null], "all"), { rows: [["O'Brien", 42, null]] });
  assert.deepEqual(await callback("select ?, ?, ?", ["O'Brien", 42, null], "get"), { rows: ["O'Brien", 42, null] });
  const empty = createD1HttpCallback(config, { fetch: async () => response([]) });
  assert.equal((await empty("select 1 where 0", [], "get")).rows, undefined);
});

test("provider errors, malformed responses and timeouts fail closed without leaking details or retrying", async () => {
  for (const result of [
    new Response("sensitive provider details", { status: 429 }),
    Response.json({ success: false, errors: [{ message: config.apiToken }] }),
    Response.json({ success: true, result: [{ success: false, error: config.apiToken }] }),
    Response.json({ success: true, result: [{ success: true, results: { rows: [{ contact_email: "private@example.com" }] } }] }),
    Response.json({ success: true, result: [] }),
    new Response("not-json", { status: 200 }),
  ]) {
    let calls = 0;
    const callback = createD1HttpCallback(config, { fetch: async () => { calls++; return result; } });
    await assert.rejects(callback("insert secret", ["private@example.com"], "all"), { name: "RequestDatabaseUnavailableError", message: "The request database is unavailable." });
    assert.equal(calls, 1);
  }
  const timeout = createD1HttpCallback(config, { timeoutMs: 5, fetch: async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener("abort", () => reject(new Error("provider timeout with secrets")), { once: true });
  }) });
  await assert.rejects(timeout("select 1", [], "all"), RequestDatabaseUnavailableError);
});

test("rejects interactive transaction statements before contacting the database", async () => {
  const callback = createD1HttpCallback(config, { fetch: async () => { assert.fail("must not fetch"); } });
  await assert.rejects(callback("begin immediate", [], "run"), /Interactive transactions/);
});

test("real SQLite preserves request insert/returning, idempotency uniqueness and timestamp mapping through the HTTP adapter", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile(new URL("../drizzle/0000_tiresome_moondragon.sql", import.meta.url), "utf8"));
  const callback = createD1HttpCallback(config, { fetch: async (_url, init) => {
    const { sql, params } = JSON.parse(init.body);
    const stmt = sqlite.prepare(sql);
    return response(stmt.all(...params).map((row) => Object.values(row)));
  } });
  const db = drizzle(callback);
  const createdAt = new Date("2026-09-10T12:00:00.000Z");
  const values = {
    id: "test-id", publicReference: "DL-ASK-01234567890123456789", idempotencyKey: "private-token-hash", requestType: "concierge",
    source: "adapter-test", status: "submitted_for_review", customerName: null, customerEmail: "test@example.com", currency: "CAD",
    estimatedSubtotalCents: null, payloadJson: "{}", createdAt, updatedAt: createdAt,
  };
  try {
    const first = await db.insert(serviceRequests).values(values).onConflictDoNothing({ target: [serviceRequests.requestType, serviceRequests.idempotencyKey] }).returning();
    assert.equal(first.length, 1);
    assert.deepEqual(first[0].createdAt, createdAt);
    assert.equal(first[0].estimatedSubtotalCents, null);
    const duplicate = await db.insert(serviceRequests).values({ ...values, id: "different-id", publicReference: "DL-ASK-98765432109876543210" }).onConflictDoNothing({ target: [serviceRequests.requestType, serviceRequests.idempotencyKey] }).returning();
    assert.deepEqual(duplicate, []);
    const tracked = await db.select({ reference: serviceRequests.publicReference, createdAt: serviceRequests.createdAt }).from(serviceRequests).where(eq(serviceRequests.idempotencyKey, values.idempotencyKey)).get();
    assert.deepEqual(tracked, { reference: values.publicReference, createdAt });
    assert.equal(await db.select().from(serviceRequests).where(eq(serviceRequests.id, "missing")).get(), undefined);
  } finally {
    sqlite.close();
  }
});
