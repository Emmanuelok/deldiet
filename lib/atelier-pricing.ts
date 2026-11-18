import {
  ROASTS, ORIGINS, CLASSICS, SIGNATURES, MILKS, EXTRACTIONS, CAFFEINE,
  BOOSTERS, SYRUPS, SWEETENERS, TOPPINGS, SIZES, CUPS,
} from "./atelier-options";

const choices = {
  origin: Object.values(ORIGINS).flat().map(item => item.n),
  roast: ROASTS.map(item => item.id),
  drink: [...CLASSICS, ...SIGNATURES].map(item => item.n),
  milk: MILKS.map(item => item.n),
  temp: ["Hot", "Extra hot", "Iced", "Blended"],
  extraction: Object.values(EXTRACTIONS).flat(),
  caffeine: CAFFEINE, sweetener: SWEETENERS, size: SIZES.map(item => item.id),
  cup: CUPS.map(item => item.n),
};
const lists = { boosters: BOOSTERS.map(item => item.n), syrups: SYRUPS, toppings: TOPPINGS.map(item => item.n) };
type ScalarField = keyof typeof choices;
type ListField = keyof typeof lists;
type Modifier = Exclude<ScalarField, "drink"> | ListField | "extraShots" | "sweetLevel";
export type Recipe = Record<ScalarField, string> & Record<ListField, string[]> & { extraShots: number; sweetLevel: number };
export type PriceItem = { id: string; priceId: string; name: string; unitAmount: number } & (
  { kind: "drink"; recipe: Recipe } | { kind: "addon"; field: Modifier; value: string; appliesTo: string[] }
);
export type Pickup = { name: string; address: string };
export type Catalogue = {
  currency: "cad"; mode: "test" | "live" | "unavailable"; checkoutAvailable: boolean;
  message: string | null; pickup: Pickup | null; items: PriceItem[];
};
export type QuoteLine = { id: string; priceId: string; name: string; unitAmount: number; quantity: number };
export type Quote = { available: boolean; quoteId: string | null; lines: QuoteLine[]; subtotal: number | null; currency: "cad"; message: string | null };
export class AtelierError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function selected(value: unknown) { return typeof value === "string" ? value : object(value).n; }
function invalidChoice(field: string): never { throw new AtelierError(400, "Choose a valid " + field + " option for this recipe."); }
const scalarFields = Object.keys(choices) as ScalarField[];
const listFields = Object.keys(lists) as ListField[];

export function normalizeRecipe(value: unknown): Recipe {
  const input = object(value);
  const recipe = {} as Recipe;
  for (const field of scalarFields) {
    const choice = field === "origin" || field === "drink" ? selected(input[field]) : input[field];
    if (typeof choice !== "string" || !choices[field].includes(choice)) invalidChoice(field);
    recipe[field] = choice;
  }
  const drink = [...CLASSICS, ...SIGNATURES].find(item => item.n === recipe.drink)!;
  const methods = EXTRACTIONS[drink.fam as keyof typeof EXTRACTIONS];
  if (!methods?.includes(recipe.extraction)) invalidChoice("extraction method");
  const temperatures = drink.fam === "cold" ? ["Iced"] : drink.fam === "blended" ? ["Blended"] :
    drink.n === "Affogato" ? ["Hot"] : ["Hot", "Extra hot", "Iced"];
  if (!temperatures.includes(recipe.temp)) invalidChoice("serving temperature");
  if (["Espresso", "Doppio", "Ristretto", "Macchiato", "Affogato", "Espresso con Panna"].includes(drink.n) && recipe.size !== "seed") invalidChoice("size");
  for (const field of listFields) {
    const entries = input[field];
    const allowed = lists[field];
    if (!Array.isArray(entries) || entries.length > (field === "boosters" ? 2 : allowed.length) ||
        !entries.every(entry => typeof entry === "string" && allowed.includes(entry)) || new Set(entries).size !== entries.length) invalidChoice(field);
    recipe[field] = [...entries].sort();
  }
  const shots = input.extraShots;
  if (typeof shots !== "number" || !Number.isInteger(shots) || shots < 0 || shots + drink.sh > 4) invalidChoice("extra shot");
  recipe.extraShots = shots;
  const level = input.sweetLevel;
  if (typeof level !== "number" || !Number.isInteger(level) || level < (recipe.sweetener === "None" ? 0 : 1) || level > 4) invalidChoice("sweetness");
  recipe.sweetLevel = recipe.sweetener === "None" ? 0 : level;
  return recipe;
}

export function parseQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 10) throw new AtelierError(400, "Choose between 1 and 10 cups.");
  return value;
}

export function parseStripeProduct(input: unknown, live: boolean): PriceItem | null {
  const product = object(input);
  const metadata = object(product.metadata);
  if (metadata.deldiet_surface !== "origin_atelier" || product.active !== true || product.livemode !== live) return null;
  const price = object(product.default_price);
  const amount = price.unit_amount;
  if (typeof metadata.atelier_id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(metadata.atelier_id) ||
      typeof product.name !== "string" || !product.name.trim() || typeof price.id !== "string" || !/^price_[\w]+$/.test(price.id) ||
      price.product !== product.id || price.active !== true || price.livemode !== live || price.currency !== "cad" || price.type !== "one_time" ||
      price.billing_scheme !== "per_unit" || price.custom_unit_amount != null || price.transform_quantity != null ||
      typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 0 || amount > 99999999 ||
      (price.unit_amount_decimal != null && Number(price.unit_amount_decimal) !== amount)) return null;
  const core = { id: metadata.atelier_id, name: product.name.trim(), priceId: price.id, unitAmount: amount };
  if (metadata.atelier_kind === "drink" && amount > 0 && typeof metadata.atelier_recipe === "string") {
    try { return { ...core, kind: "drink", recipe: normalizeRecipe(JSON.parse(metadata.atelier_recipe)) }; }
    catch { return null; }
  }
  if (metadata.atelier_kind !== "addon" || typeof metadata.atelier_field !== "string" ||
      typeof metadata.atelier_value !== "string" || typeof metadata.atelier_applies_to !== "string") return null;
  if (metadata.atelier_field === "drink") return null;
  const field = metadata.atelier_field as Modifier;
  const option = metadata.atelier_value;
  const allowed: Record<Modifier, string[]> = { ...choices, ...lists, extraShots: ["1"], sweetLevel: ["0","1","2","3","4"] };
  if (!Object.hasOwn(allowed,field) || !allowed[field].includes(option)) return null;
  const appliesTo = [...new Set(metadata.atelier_applies_to.split(",").map(id => id.trim()).filter(Boolean))];
  if (!appliesTo.length || !appliesTo.every(id => id === "*" || /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id))) return null;
  return { ...core, kind: "addon", field, value: option, appliesTo };
}

function linesForPreset(preset: Extract<PriceItem,{kind:"drink"}>, items: PriceItem[], recipe: Recipe, cups: number): QuoteLine[] | null {
  const base = preset.recipe;
  if (recipe.drink !== base.drink || recipe.extraShots < base.extraShots) return null;
  const needed: { field: Modifier; value: string; perCup: number }[] = [];
  for (const field of scalarFields) {
    if (field !== "drink" && recipe[field] !== base[field]) needed.push({field,value:recipe[field],perCup:1});
  }
  if (recipe.extraShots > base.extraShots) needed.push({field:"extraShots",value:"1",perCup:recipe.extraShots-base.extraShots});
  if (recipe.sweetLevel !== base.sweetLevel) needed.push({field:"sweetLevel",value:String(recipe.sweetLevel),perCup:1});
  for (const field of listFields) {
    if (base[field].some(item => !recipe[field].includes(item))) return null;
    for (const value of recipe[field]) if (!base[field].includes(value)) needed.push({field,value,perCup:1});
  }
  const line = (item: PriceItem, quantity: number): QuoteLine => ({id:item.id,priceId:item.priceId,name:item.name,unitAmount:item.unitAmount,quantity});
  const lines = [line(preset,cups)];
  for (const requirement of needed) {
    const matches = items.filter(item => item.kind === "addon" && item.field === requirement.field &&
      item.value === requirement.value && (item.appliesTo.includes(preset.id) || item.appliesTo.includes("*")));
    if (matches.length !== 1) return null;
    lines.push(line(matches[0],requirement.perCup*cups));
  }
  return lines;
}

export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,"0")).join("");
}
export async function quoteRecipe(catalogue: Catalogue, recipe: Recipe, quantity: number, pickupTaxRate: string | null): Promise<Quote> {
  const unavailable = (message: string): Quote => ({available:false,quoteId:null,lines:[],subtotal:null,currency:"cad",message});
  if (catalogue.mode === "unavailable" || !catalogue.items.length) return unavailable(catalogue.message || "Live menu prices are currently unavailable.");
  const candidates = catalogue.items.filter(item => item.kind === "drink").flatMap(preset => {
    const lines = linesForPreset(preset,catalogue.items,recipe,quantity);
    if (!lines) return [];
    const subtotal = lines.reduce((sum,line) => sum + line.unitAmount*line.quantity,0);
    return subtotal <= 99999999 ? [{lines,subtotal}] : [];
  });
  if (!candidates.length) return unavailable("This combination has no complete current price. Choose a live menu recipe or adjust your selections.");
  candidates.sort((a,b) => a.subtotal-b.subtotal || a.lines.length-b.lines.length || a.lines[0].id.localeCompare(b.lines[0].id));
  const {lines,subtotal} = candidates[0];
  const quoteId = await digest(JSON.stringify([catalogue.mode,catalogue.pickup,pickupTaxRate,recipe,quantity,lines]));
  return {available:true,quoteId,lines,subtotal,currency:"cad",message:null};
}
