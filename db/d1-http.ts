/** Server-side D1 transport for hosts without a Cloudflare Worker binding. */
export type D1HttpConfig = {
  accountId: string;
  databaseId: string;
  apiToken: string;
};

type Environment = Record<string, string | undefined>;
type QueryMethod = "run" | "all" | "values" | "get";
type TransportOptions = { fetch?: typeof fetch; timeoutMs?: number };

export class RequestDatabaseUnavailableError extends Error {
  constructor() {
    super("The request database is unavailable.");
    this.name = "RequestDatabaseUnavailableError";
  }
}

export function readD1HttpConfig(environment: Environment): D1HttpConfig | null {
  const accountId = environment.CLOUDFLARE_ACCOUNT_ID?.trim();
  const databaseId = environment.CLOUDFLARE_D1_DATABASE_ID?.trim();
  const apiToken = environment.CLOUDFLARE_D1_API_TOKEN?.trim();
  if (!accountId && !databaseId && !apiToken) return null;
  if (
    !accountId || !/^[a-f0-9]{32}$/i.test(accountId) ||
    !databaseId || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(databaseId) ||
    !apiToken || /\s/.test(apiToken)
  ) {
    throw new RequestDatabaseUnavailableError();
  }
  return { accountId, databaseId, apiToken };
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rawRows(payload: unknown, method: QueryMethod): unknown[][] {
  if (!record(payload) || payload.success !== true || !Array.isArray(payload.result) || payload.result.length !== 1) {
    throw new RequestDatabaseUnavailableError();
  }
  const result = payload.result[0];
  if (!record(result) || result.success !== true) throw new RequestDatabaseUnavailableError();
  // DDL/non-returning writes may omit results entirely. Reads must return rows.
  if (method === "run" && result.results === undefined) return [];
  if (!record(result.results) || !Array.isArray(result.results.rows) || !result.results.rows.every(Array.isArray)) {
    throw new RequestDatabaseUnavailableError();
  }
  return result.results.rows;
}

export function createD1HttpCallback(config: D1HttpConfig, options: TransportOptions = {}) {
  const requestFetch = options.fetch ?? globalThis.fetch;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/raw`;

  return async (sql: string, params: unknown[], method: QueryMethod): Promise<{ rows: unknown[] }> => {
    // HTTP calls do not share an interactive transaction. Fail before a write
    // instead of implying that BEGIN/COMMIT span independent requests.
    if (/^\s*(begin|commit|rollback|savepoint|release)\b/i.test(sql)) {
      throw new Error("Interactive transactions are unavailable over the D1 HTTP transport.");
    }
    const controller = new AbortController();
    // A duplicate receipt takes two queries; both fit the client's 15s budget.
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 6_000);
    try {
      const response = await requestFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
        body: JSON.stringify({ sql, params }),
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) throw new RequestDatabaseUnavailableError();
      const rows = rawRows(await response.json(), method);
      // sqlite-proxy expects a single flat row for get(), nested rows otherwise.
      // An absent first row remains undefined at runtime, as Drizzle requires.
      return { rows: method === "get" ? rows[0] : rows };
    } catch {
      // Do not surface provider payloads, SQL parameters, or credentials.
      // The caller's idempotency key makes an explicit retry safe after timeout.
      throw new RequestDatabaseUnavailableError();
    } finally {
      clearTimeout(timer);
    }
  };
}
