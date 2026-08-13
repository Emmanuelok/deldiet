type MarketRuntimeEnv = {
  MARKET_DATA_API_BASE?: string;
  MARKET_DATA_API_KEY?: string;
  MARKET_DATA_PUBLIC_DISPLAY_LICENSE?: string;
  MARKET_DATA_PROVIDER_NAME?: string;
  MARKET_DATA_EXPECTED_MODE?: string;
  MARKET_DATA_ALLOWED_SOURCE_HOSTS?: string;
};

type CloudflareRuntime = { env?: MarketRuntimeEnv };

async function getRuntimeEnv(): Promise<MarketRuntimeEnv> {
  const nodeRuntime = typeof process === "undefined" ? {} : process.env as MarketRuntimeEnv;
  try {
    const loadModule = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<CloudflareRuntime>;
    const cloudflareRuntime = await loadModule("cloudflare:workers");
    return { ...nodeRuntime, ...(cloudflareRuntime.env ?? {}) };
  } catch {
    return nodeRuntime;
  }
}

const MODES = new Set(["REALTIME", "DELAYED", "EOD"]);
const STATUSES = new Set(["OK", "CLOSED", "HALTED", "STALE", "DEGRADED"]);
const QUOTE_TYPES = new Set(["LAST_TRADE", "BID", "ASK", "SETTLEMENT", "MID"]);
const CONTRACT_PATTERN = /^[A-Z0-9]{3,16}$/;
const CONTRACT_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const CONTRACTS = {
  KC: { exchange: "IFUS", nativeUnit: "USC_PER_LB", maxValue: 10_000 },
  RC: { exchange: "IFEU", nativeUnit: "USD_PER_TONNE", maxValue: 100_000 },
} as const;

function unavailable(message: string, status = 200) {
  return Response.json({
    provider: { id: null, name: null, sourceUrl: "https://www.ice.com/agriculture", publicDisplay: false },
    feed: {
      mode: "UNAVAILABLE",
      status: "UNAVAILABLE",
      displayAllowed: false,
      asOf: null,
      delayMinutes: null,
      message,
    },
    instruments: [],
  }, { status, headers: { "Cache-Control": "no-store" } });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validUrl(value: unknown, allowedHosts?: Set<string>): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (!allowedHosts || allowedHosts.has(url.hostname.toLowerCase()));
  } catch { return false; }
}

function validateInstrument(value: unknown, allowedHosts: Set<string>, maxQuoteAgeMs: number, now: number) {
  if (!isRecord(value)) return null;
  const symbol = String(value.symbol) as keyof typeof CONTRACTS;
  const contract = CONTRACTS[symbol];
  const number = Number(value.value);
  const changePct = value.changePct === null || value.changePct === undefined ? null : Number(value.changePct);
  const quoteAt = typeof value.quoteAt === "string" ? value.quoteAt : "";
  const quoteAtMs = Date.parse(quoteAt);
  const contractCode = typeof value.contractCode === "string" ? value.contractCode.trim().toUpperCase() : "";
  const contractMonth = typeof value.contractMonth === "string" ? value.contractMonth.trim() : "";
  const quoteType = typeof value.quoteType === "string" ? value.quoteType.trim().toUpperCase() : "";
  if (!contract || value.exchange !== contract.exchange || value.nativeUnit !== contract.nativeUnit || value.currency !== "USD") return null;
  if (!Number.isFinite(number) || number <= 0 || number > contract.maxValue || !Number.isFinite(quoteAtMs)) return null;
  if (quoteAtMs > now + 60_000 || now - quoteAtMs > maxQuoteAgeMs) return null;
  if (!CONTRACT_PATTERN.test(contractCode) || !CONTRACT_MONTH_PATTERN.test(contractMonth) || !QUOTE_TYPES.has(quoteType)) return null;
  if (changePct !== null && (!Number.isFinite(changePct) || Math.abs(changePct) > 100)) return null;
  if (!validUrl(value.sourceUrl, allowedHosts)) return null;
  return {
    symbol,
    exchange: contract.exchange,
    contractCode,
    contractMonth,
    quoteType,
    value: number,
    currency: "USD",
    nativeUnit: contract.nativeUnit,
    quoteAt: new Date(quoteAt).toISOString(),
    changePct,
    sourceUrl: String(value.sourceUrl),
  };
}

export async function GET() {
  const runtime = await getRuntimeEnv();
  const base = runtime.MARKET_DATA_API_BASE?.trim();
  const apiKey = runtime.MARKET_DATA_API_KEY?.trim();
  const displayLicensed = runtime.MARKET_DATA_PUBLIC_DISPLAY_LICENSE === "true";

  if (!base || !apiKey || !displayLicensed) {
    return unavailable("Market data unavailable · no licensed public-display feed is connected.");
  }

  let endpoint: URL;
  try {
    endpoint = new URL(base);
    if (endpoint.protocol !== "https:") return unavailable("Market provider configuration is invalid.", 503);
  } catch {
    return unavailable("Market provider configuration is invalid.", 503);
  }
  const allowedHosts = new Set([
    endpoint.hostname.toLowerCase(),
    ...(runtime.MARKET_DATA_ALLOWED_SOURCE_HOSTS || "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean),
  ]);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return unavailable("The licensed market feed is temporarily unavailable.", 503);
    const body: unknown = await response.json();
    if (!isRecord(body) || !isRecord(body.feed) || !isRecord(body.provider) || !Array.isArray(body.instruments)) {
      return unavailable("The market provider returned an invalid response.", 503);
    }

    const mode = String(body.feed.mode);
    const status = String(body.feed.status);
    const asOf = typeof body.feed.asOf === "string" ? body.feed.asOf : "";
    const now = Date.now();
    const asOfMs = Date.parse(asOf);
    const sourceUrl = body.provider.sourceUrl;
    const expectedMode = runtime.MARKET_DATA_EXPECTED_MODE?.trim().toUpperCase();
    if (!MODES.has(mode) || (expectedMode && mode !== expectedMode) || !STATUSES.has(status) || !Number.isFinite(asOfMs) || asOfMs > now + 60_000 || !validUrl(sourceUrl, allowedHosts)) {
      return unavailable("The market provider response did not include valid entitlement, source and timing metadata.", 503);
    }

    const delayMinutes = body.feed.delayMinutes === null || body.feed.delayMinutes === undefined ? null : Number(body.feed.delayMinutes);
    if (delayMinutes !== null && (!Number.isFinite(delayMinutes) || delayMinutes < 0 || delayMinutes > 1_440)) {
      return unavailable("The market provider returned invalid delay metadata.", 503);
    }
    if (mode === "DELAYED" && delayMinutes === null) {
      return unavailable("Delayed market data must include its stated delay.", 503);
    }
    const maxFeedAgeMs = mode === "REALTIME"
      ? Math.max(120_000, ((delayMinutes || 0) + 2) * 60_000)
      : mode === "DELAYED"
        ? ((delayMinutes || 0) + 10) * 60_000
        : 36 * 60 * 60_000;
    if (status !== "OK" || now - asOfMs > maxFeedAgeMs) {
      return unavailable(`Market data is currently ${status.toLowerCase()} or outside its licensed freshness window.`, 503);
    }

    const instruments = body.instruments.slice(0, 12).map((instrument) => validateInstrument(instrument, allowedHosts, maxFeedAgeMs, now)).filter(Boolean);
    if (!instruments.length) return unavailable("No displayable licensed coffee contracts are currently available.", 503);

    return Response.json({
      provider: {
        id: typeof body.provider.id === "string" ? body.provider.id.slice(0, 80) : "licensed-provider",
        name: runtime.MARKET_DATA_PROVIDER_NAME || (typeof body.provider.name === "string" ? body.provider.name.slice(0, 120) : "Licensed provider"),
        sourceUrl,
        publicDisplay: true,
      },
      feed: {
        mode,
        status,
        displayAllowed: true,
        asOf: new Date(asOf).toISOString(),
        delayMinutes,
        message: typeof body.feed.message === "string" ? body.feed.message.slice(0, 240) : null,
      },
      instruments,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable("The licensed market feed is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
