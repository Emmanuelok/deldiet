# Deldiet request storage proposal

Copy `db/d1-http.ts`, `db/index.ts` and `tests/d1-http.test.mjs` into matching repository paths. `db/schema.ts` here is an unmodified test copy; do not replace it. `verify/`, the `node_modules` link, and the `drizzle` link are local verification scaffolding, not deliverables to copy.

The original Cloudflare Worker `DB` binding takes precedence. On Vercel, the adapter uses these server-only environment variables:

| Variable | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Existing owning Cloudflare account ID |
| `CLOUDFLARE_D1_DATABASE_ID` | Existing Deldiet D1 database UUID |
| `CLOUDFLARE_D1_API_TOKEN` | Account-scoped API token with D1 write permission |

Never use `NEXT_PUBLIC_` for these settings. Do not print token values or place them in source. No new database, token, or hosted resource was created by this investigation. No production request has been written or verified.

The existing migration `drizzle/0000_tiresome_moondragon.sql` creates the request table and required uniqueness indexes. Apply it to the intended D1 database through authenticated administration before enabling submissions. Keep preview deployment credentials pointed at a separate preview database. Do not auto-migrate from public request handlers.

Without the Worker binding or valid complete HTTP configuration, `getDb()` throws and existing handlers return HTTP 503. An upstream failure, unexpected payload, malformed JSON, or timeout also fails closed. There is no disk/memory fallback, manufactured receipt, or automatic retry. Customers should retry with the same idempotency key, because a timed-out write may already have committed.

The HTTP transport supports the app's single-statement inserts and reads. It rejects interactive BEGIN/COMMIT transactions because independent HTTP calls do not form one transaction. `db.batch()` is not enabled. Implement and test a single server batch request before introducing an atomic multi-statement workflow.

The raw D1 API returns ordered row arrays; the adapter preserves them for Drizzle and uses a flat first row for `.get()`. Parameters remain separate from SQL. The endpoint is fixed to Cloudflare, redirects are refused, and no provider error body is exposed. [Cloudflare D1 raw query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/)

The REST API has a shared account/user budget of 1,200 calls per five minutes, so this is a practical low-volume compatibility path. A production store at sustained volume should use a dedicated authenticated Worker service or a database driver intended for that hosting environment; do not treat REST as unlimited. [Cloudflare API limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/)

## API review

- Existing request receipts and status lookups omit contact data and payloads; keep that property.
- Existing GET sends the tracking secret in a URL query parameter, which may reach access logs. Prefer `X-Request-Token` for the new tracking client and endpoint; retaining a legacy query fallback is a compatibility decision. Send `Cache-Control: no-store` for error responses as well as success.
- There is no application rate limiting. Same-origin rejection mitigates browser cross-origin posting but does not stop bots. Configure a deployment-level rate limit for POST and lookup requests, or add a distributed limiter with explicit credentials. A per-instance memory counter alone does not provide global limits on Vercel.
- Idempotency validation accepts 16–128 characters while GET currently requires 24–128. Align them to prevent accepted custom keys from producing untrackable receipts. The built-in client generates longer keys; changing validation must include existing tests.
- Public submissions mean the claimed email is not verified ownership. Do not use an unverified contact email to authenticate customer history or staff operations.
- Backend support does not implement staff queues, notification delivery, payments, fulfilment, or live availability. Existing review-only status language should remain.

## Verification

`node --test tests/d1-http.test.mjs` passed 5 tests. They cover missing/malformed configuration, fixed authenticated endpoint and row modes, fail-closed errors/timeouts, interactive transaction rejection, and a real SQLite request lifecycle through mock D1 responses with uniqueness and timestamp decoding.

An isolated TypeScript check also passed for the proposed database code and an unchanged copy of the current request API. `getDb()` deliberately returns the common typed `BaseSQLiteDatabase` interface: an inferred union of D1/proxy types breaks Drizzle's overloaded `.select()` and `.returning()` calls.
