import { ROASTS, ORIGINS, CLASSICS, SIGNATURES, MILKS, EXTRACTIONS, CAFFEINE, BOOSTERS, SYRUPS, SWEETENERS, TOPPINGS, SIZES, CUPS } from "@/lib/atelier-options";

export const drinks = [...CLASSICS, ...SIGNATURES];
export const places = Object.entries(ORIGINS).flatMap(([region, items]) => items.map((item) => ({ ...item, region })));
const black = "None — black";
const compact = ["Espresso", "Doppio", "Ristretto", "Macchiato", "Affogato", "Espresso con Panna"];
export const sizesFor = (drink) => compact.includes(drink.n) ? SIZES.filter((item) => item.id === "seed") : SIZES;
export const temperaturesFor = (drink) => drink.fam === "cold" ? ["Iced"] : drink.fam === "blended" ? ["Blended"] : drink.n === "Affogato" ? ["Hot"] : ["Hot", "Extra hot", "Iced"];

export function drinkDefaults(drink) {
  return {
    drink: drink.n, milk: drink.milk ? "Organic whole" : black, extraShots: 0,
    temp: drink.fam === "cold" || drink.iced ? "Iced" : drink.fam === "blended" ? "Blended" : "Hot",
    extraction: EXTRACTIONS[drink.fam][0], ...(compact.includes(drink.n) ? { size: "seed" } : {}),
  };
}

export function makeRecipe(drinkName = "Flat White", patch = {}) {
  const drink = drinks.find((item) => item.n === drinkName) || drinks[0];
  return {
    origin: "Colombia", roast: "medium", size: "sprout", caffeine: CAFFEINE[0], cup: CUPS[0].n,
    sweetener: "None", sweetLevel: 0, syrups: [], toppings: [], boosters: [], ...drinkDefaults(drink), ...patch,
  };
}

export const presets = [
  { name: "Flat white", note: "Round & balanced", recipe: makeRecipe() },
  { name: "Floral pour-over", note: "Light & aromatic", recipe: makeRecipe("Pour-Over / Drip", { origin: "Ethiopia", roast: "light" }) },
  { name: "Cold brew", note: "Smooth & refreshing", recipe: makeRecipe("Cold Brew", { origin: "Rwanda" }) },
  { name: "Deep espresso", note: "Rich & chocolatey", recipe: makeRecipe("Espresso", { origin: "Brazil", roast: "meddark" }) },
];

const single = (raw, options, fallback) => options.includes(raw) ? raw : fallback;
const multiple = (raw, options, max = options.length) => Array.isArray(raw) ? [...new Set(raw.filter((item) => options.includes(item)))].slice(0,max).sort() : [];
const integer = (raw, min, max, fallback) => Number.isInteger(raw) && raw >= min && raw <= max ? raw : fallback;

// An old kiosk draft stores full option objects. Keep only recognised recipe choices.
export function restoreRecipe(raw) {
  if (!raw || typeof raw !== "object") return null;
  const drink = drinks.find((item) => item.n === (raw.drink?.n || raw.drink));
  const origin = places.find((item) => item.n === (raw.origin?.n || raw.origin));
  if (!drink || !origin) return null;
  const base = makeRecipe(drink.n);
  const sweetener = single(raw.sweetener, SWEETENERS, "None");
  return {
    ...base, origin: origin.n, roast: single(raw.roast, ROASTS.map((r) => r.id), base.roast),
    caffeine: single(raw.caffeine, CAFFEINE, base.caffeine), temp: single(raw.temp, temperaturesFor(drink), base.temp),
    extraction: single(raw.extraction, EXTRACTIONS[drink.fam], base.extraction),
    milk: single(raw.milk, MILKS.map((m) => m.n), base.milk), extraShots: integer(raw.extraShots, 0, 4-drink.sh, 0),
    cup: single(raw.cup, CUPS.map((c) => c.n), base.cup), size: single(raw.size, sizesFor(drink).map((s) => s.id), base.size),
    syrups: multiple(raw.syrups, SYRUPS), toppings: multiple(raw.toppings, TOPPINGS.map((t) => t.n)),
    boosters: multiple(raw.boosters, BOOSTERS.map((b) => b.n), 2), sweetener, sweetLevel: sweetener === "None" ? 0 : integer(raw.sweetLevel,1,4,2),
  };
}

export function cupPhoto(recipe) {
  const cold = ["Iced","Blended"].includes(recipe.temp);
  return `/barista/${cold ? "iced" : "hot"}-${recipe.milk === black ? "black" : "milk"}.webp`;
}

export function recipeRows(recipe) {
  const size = SIZES.find((item) => item.id === recipe.size);
  const extras = [...recipe.syrups, ...recipe.toppings, ...recipe.boosters];
  if (recipe.sweetener !== "None") extras.push(`${recipe.sweetener} · level ${recipe.sweetLevel}`);
  return [
    ["Drink", recipe.drink], ["Origin", recipe.origin], ["Roast", ROASTS.find((r) => r.id === recipe.roast)?.name],
    ["Preparation", `${recipe.extraction} · ${recipe.temp}`], ["Milk", recipe.milk], ["Caffeine", recipe.caffeine],
    ...(recipe.extraShots ? [["Extra shots", String(recipe.extraShots)]] : []), ["Additions", extras.join(", ") || "None"],
    ["Serve", `${size?.oz} oz · ${recipe.cup}`],
  ];
}

export function allergyNotes(recipe) {
  const notes = new Set();
  if (["Organic whole","Organic 2%","Skim","Lactose-free","A2 milk","Half & half"].includes(recipe.milk) ||
    recipe.boosters.includes("Grass-fed ghee") || recipe.toppings.some((item) => ["Whipped cream","Vanilla cold foam"].includes(item)) ||
    ["Affogato","Espresso con Panna","Vienna","Tiramisu Cloud"].includes(recipe.drink)) notes.add("milk");
  if (["Almond","Cashew","Macadamia"].includes(recipe.milk) || recipe.drink === "Pistachio Silk" || recipe.syrups.includes("Hazelnut")) notes.add("tree nuts");
  if (recipe.milk === "Soy") notes.add("soy");
  if (recipe.milk === "Coconut" || recipe.drink === "Coconut Cascade" || recipe.drink === "Ube Dream" || recipe.toppings.includes("Toasted coconut") || recipe.syrups.includes("Coconut") || recipe.boosters.includes("MCT oil")) notes.add("coconut");
  if (recipe.milk === "Pea (barista)" || recipe.boosters.includes("Plant protein")) notes.add("pea protein");
  if (recipe.boosters.includes("Plant protein")) notes.add("pumpkin seed protein");
  if (recipe.boosters.includes("Bee pollen")) notes.add("bee pollen");
  return [...notes];
}
