export const PASSPORT_KEY = "deldiet-passport-v1";

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}

export function writeLocal(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("deldiet:storage", { detail: key }));
    return true;
  } catch { return false; }
}

export function passportData(): Record<string, unknown> {
  const value = readLocal<unknown>(PASSPORT_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mergePassport(value: Record<string, unknown>): boolean {
  return writeLocal(PASSPORT_KEY, { ...passportData(), ...value });
}

export function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function validCartItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.detail === "string" && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99 && (!item.channel || ["shop", "cafe"].includes(item.channel))).slice(0, 150).map((item) => ({ ...item, channel: item.channel || "shop", image: typeof item.image === "string" && item.image.startsWith("/products/") ? item.image : undefined }));
}

export const canonicalBrewer = (value: string) => ({ "Whole bean grinder": "Pour-over", "Ground coffee brewer": "Batch brewer", "Nespresso Original": "Capsule machine", "Nespresso Vertuo": "Capsule machine", "K-Cup compatible": "Single-serve brewer", "No equipment": "Pour-over", "Keurig brewer": "Single-serve brewer", "Pour-over setup": "Pour-over" }[value] || value);
