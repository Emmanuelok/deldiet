import { drizzle } from "drizzle-orm/d1";
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

export async function getDb() {
  const database = await getCloudflareDb();
  if (!database) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(database, { schema });
}
