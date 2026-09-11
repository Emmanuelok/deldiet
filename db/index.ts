import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleHttp } from "drizzle-orm/sqlite-proxy";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createD1HttpCallback, readD1HttpConfig, RequestDatabaseUnavailableError } from "./d1-http";
import * as schema from "./schema";

type CloudflareRuntime = { env?: { DB?: D1Database } };

async function getCloudflareDb(): Promise<D1Database | null> {
  try {
    const loadModule = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<CloudflareRuntime>;
    const runtime = await loadModule("cloudflare:workers");
    return runtime.env?.DB ?? null;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<BaseSQLiteDatabase<"async", unknown, typeof schema>> {
  const binding = await getCloudflareDb();
  if (binding) return drizzleD1(binding, { schema });

  const config = readD1HttpConfig(typeof process !== "undefined" ? process.env : {});
  if (config) return drizzleHttp(createD1HttpCallback(config), { schema });

  // Never fall back to serverless disk or acknowledge unsaved customer requests.
  throw new RequestDatabaseUnavailableError();
}
