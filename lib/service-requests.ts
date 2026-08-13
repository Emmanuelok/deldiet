export const SERVICE_REQUEST_TYPES = [
  "reservation",
  "newsletter",
  "concierge",
  "home_order_review",
  "founding_batch",
  "wholesale",
  "workplace",
  "producer",
  "origin_bar_request",
  "origin_exchange_order_review",
  "origin_exchange_trade_inquiry",
  "subscription_plan",
  "gift_build",
  "workplace_program",
] as const;

export type ServiceRequestType = (typeof SERVICE_REQUEST_TYPES)[number];

export type RequestCustomer = {
  name: string | null;
  email: string | null;
  phone: string | null;
};

export type NormalizedServiceRequest = {
  type: ServiceRequestType;
  source: string;
  idempotencyKey: string;
  customer: RequestCustomer;
  currency: "CAD";
  estimatedSubtotalCents: number | null;
  payload: Record<string, unknown>;
  initialStatus: "submitted_for_review" | "submitted_for_staff_review" | "submitted_for_trade_review";
};

export type ValidationResult =
  | { ok: true; value: NormalizedServiceRequest }
  | { ok: false; error: string; field?: string };

const TYPE_SET = new Set<string>(SERVICE_REQUEST_TYPES);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9:_-]{16,128}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= max ? normalized : null;
}

function email(value: unknown): string | null {
  const normalized = text(value, 254)?.toLowerCase() ?? null;
  return normalized && EMAIL_PATTERN.test(normalized) ? normalized : null;
}

function requireText(payload: Record<string, unknown>, key: string, label: string, max = 300): ValidationResult | null {
  if (!text(payload[key], max)) return { ok: false, error: `${label} is required.`, field: key };
  return null;
}

function validItems(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 80) return false;
  return value.every((item) => {
    if (!isRecord(item)) return false;
    const id = text(item.id ?? item.key ?? item.no, 160);
    const name = text(item.name ?? item.origin, 180);
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    return Boolean(id && name && Number.isInteger(quantity) && quantity >= 1 && quantity <= 500);
  });
}

const PROVINCES = new Set(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]);
const ORIGIN_BAR_ORIGINS = new Set("Ethiopia|Kenya|Rwanda|Burundi|Tanzania|Uganda|DR Congo|Cameroon|Côte d'Ivoire|Malawi|Zambia|Colombia|Brazil|Peru|Ecuador|Bolivia|Venezuela|Costa Rica|Guatemala|Honduras|El Salvador|Nicaragua|Panama|Mexico|Jamaica|Dominican Republic|Cuba|Haiti|Indonesia|Vietnam|India|Papua New Guinea|China · Yunnan|Thailand|Philippines|Laos|Myanmar|Timor-Leste|Hawai'i · USA|Australia|Yemen".split("|"));
const ORIGIN_BAR_DRINKS = new Set("Espresso|Doppio|Ristretto|Lungo|Americano|Long Black|Latte|Cappuccino|Flat White|Cortado|Macchiato|Caramel Macchiato|Mocha|White Mocha|Café au Lait|Pour-Over / Drip|Red Eye|Double-Double|Cold Brew|Nitro Cold Brew|Iced Latte|Frosted Blend|Affogato|Espresso con Panna|Vienna|Turkish|Golden Sunrise Latte|Lavender Cloud|Maple Woods Cortado|Sahara Gold|Rose Velvet Mocha|Midnight Cherry Mocha|Coconut Cascade|Brown Sugar Shaken Oat|Pistachio Silk|Ube Dream|Matcha Eclipse|Orange Blossom Tonic|Tiramisu Cloud|Azteca Chili Mocha|Honey Fig Cappuccino|Forest Mint Mocha".split("|"));
const ORIGIN_BAR_MILKS = new Set("Organic whole|Organic 2%|Skim|Lactose-free|A2 milk|Half & half|Oat (barista)|Almond|Soy|Coconut|Cashew|Macadamia|Hemp|Pea (barista)|Rice|None — black".split("|"));
const ORIGIN_BAR_EXTRACTIONS = new Set("Espresso machine|Pour-over V60|Chemex|French press|AeroPress|Siphon|Batch drip|18-hr slow steep|Nitro-charged".split("|"));
const ORIGIN_BAR_BOOSTERS = new Set("Collagen peptides|Plant protein|MCT oil|Grass-fed ghee|Lion's mane|Chaga|Reishi|Cordyceps|Ashwagandha|Maca root|Panax ginseng|L-theanine|Raw cacao nibs|Bee pollen|Vitamin B12|Electrolyte minerals".split("|"));
const ORIGIN_BAR_SYRUPS = new Set("Vanilla bean|Caramel|Hazelnut|Mocha sauce|White chocolate|Lavender|Rose|Brown-sugar cinnamon|Maple|Pumpkin spice|Peppermint|Toffee nut|Honeycomb|Coconut".split("|"));
const ORIGIN_BAR_SWEETENERS = new Set("None|Raw cane sugar|Wildflower honey|Maple syrup|Agave|Coconut sugar|Date syrup|Stevia leaf|Monk fruit".split("|"));
const ORIGIN_BAR_TOPPINGS = new Set("Whipped cream|Vanilla cold foam|Cinnamon dust|Cocoa dust|Nutmeg|Caramel drizzle|Dark-chocolate shavings|Flaked sea salt|Dried rose petals|Orange zest|Toasted coconut".split("|"));

function enumValue(value: unknown, allowed: Set<string>, max = 180): string | null {
  const normalized = text(value, max);
  return normalized && allowed.has(normalized) ? normalized : null;
}

function enumArray(value: unknown, allowed: Set<string>, max: number): string[] | null {
  if (!Array.isArray(value) || value.length > max) return null;
  const normalized = value.map((item) => enumValue(item, allowed));
  if (normalized.some((item) => !item)) return null;
  const items = normalized as string[];
  return new Set(items).size === items.length ? items : null;
}

function normalizedItems(value: unknown) {
  if (!validItems(value)) return null;
  return value.map((item) => ({
    id: text(item.id ?? item.key ?? item.no, 160),
    displayNameSnapshot: text(item.name ?? item.origin, 180),
    variantSnapshot: text(item.variant ?? item.detail, 180),
    quantity: Number(item.quantity ?? item.qty ?? 1),
  }));
}

function normalizedDestination(value: unknown) {
  if (!isRecord(value)) return null;
  const address = text(value.address, 180);
  const city = text(value.city, 120);
  const province = enumValue(value.province, PROVINCES, 2);
  const postalCode = text(value.postalCode, 12)?.toUpperCase() ?? null;
  if (!address || !city || !province || !postalCode || !/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(postalCode)) return null;
  return { address, city, province, postalCode, country: "CA" };
}

function normalizePayload(type: ServiceRequestType, payload: Record<string, unknown>): Record<string, unknown> | null {
  if (type === "newsletter") return { list: "field-notes", consent: true };

  if (type === "reservation") {
    const visitType = enumValue(payload.visitType, new Set(["Table reservation", "East Africa cupping table", "Home espresso clinic", "The producer room", "Private tasting"]));
    const preferredDate = text(payload.preferredDate, 20);
    const party = enumValue(payload.party, new Set(["1 person", "2 people", "3 people", "4 people", "5–8 people"]));
    const preferredTime = enumValue(payload.preferredTime, new Set(["Morning", "Midday", "Afternoon", "Evening"]));
    if (!visitType || !preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !party || !preferredTime) return null;
    return { visitType, preferredDate, party, preferredTime, availabilityState: "interest_list_no_live_inventory" };
  }

  if (type === "concierge") {
    const message = text(payload.message, 1200);
    if (!message) return null;
    return {
      message,
      journeyIntent: text(payload.journeyIntent, 40),
      activeOriginId: text(payload.activeOriginId, 60),
      machine: text(payload.machine, 120),
      serviceMode: text(payload.serviceMode, 80),
    };
  }

  if (type === "home_order_review" || type === "origin_exchange_order_review") {
    const items = normalizedItems(payload.items);
    if (!items) return null;
    if (type === "home_order_review") {
      const channel = enumValue(payload.channel, new Set(["cafe", "shop"]), 10);
      if (!channel) return null;
      const serviceMode = channel === "cafe" ? enumValue(payload.serviceMode, new Set(["Dine in", "Pickup now", "Schedule", "Table QR"]), 40) : null;
      if (channel === "cafe" && !serviceMode) return null;
      return { items, channel, serviceMode, pricingState: "illustrative_pending_staff_review" };
    }
    const fulfilmentPreference = enumValue(payload.fulfilmentPreference, new Set(["standard", "express", "pickup"]), 20);
    const destination = normalizedDestination(payload.destination);
    if (!fulfilmentPreference || !destination) return null;
    return { items, fulfilmentPreference, destination, pricingState: "illustrative_pending_availability_review" };
  }

  if (type === "origin_bar_request") {
    if (payload.schemaVersion !== 1 || payload.catalogueVersion !== "origin-bar-concept-v1" || payload.safetyAcknowledged !== true || !isRecord(payload.selection)) return null;
    const selection = payload.selection;
    const normalized = {
      origin: enumValue(selection.origin, ORIGIN_BAR_ORIGINS),
      roast: enumValue(selection.roast, new Set(["light", "medium", "meddark", "dark"]), 20),
      drink: enumValue(selection.drink, ORIGIN_BAR_DRINKS),
      drinkMenu: enumValue(selection.drinkMenu, new Set(["classics", "signatures"]), 20),
      milk: enumValue(selection.milk, ORIGIN_BAR_MILKS),
      extraShots: Number(selection.extraShots),
      temperature: enumValue(selection.temperature, new Set(["Hot", "Extra hot", "Iced", "Blended"]), 20),
      extraction: enumValue(selection.extraction, ORIGIN_BAR_EXTRACTIONS),
      caffeine: enumValue(selection.caffeine, new Set(["Regular", "Half-caf", "Decaf · Swiss Water"]), 40),
      boosters: enumArray(selection.boosters, ORIGIN_BAR_BOOSTERS, 2),
      syrups: enumArray(selection.syrups, ORIGIN_BAR_SYRUPS, 14),
      sweetener: enumValue(selection.sweetener, ORIGIN_BAR_SWEETENERS),
      sweetLevel: Number(selection.sweetLevel),
      toppings: enumArray(selection.toppings, ORIGIN_BAR_TOPPINGS, 11),
      size: enumValue(selection.size, new Set(["seed", "sprout", "bloom", "harvest"]), 20),
      cup: enumValue(selection.cup, new Set(["For here · ceramic", "To go · compostable", "Bring your own"])),
      cupName: text(selection.cupName, 80) ?? "",
    };
    if (Object.values(normalized).some((value) => value === null) || !Number.isInteger(normalized.extraShots) || normalized.extraShots < 0 || normalized.extraShots > 4 || !Number.isInteger(normalized.sweetLevel) || normalized.sweetLevel < 1 || normalized.sweetLevel > 4) return null;
    return { schemaVersion: 1, catalogueVersion: "origin-bar-concept-v1", safetyAcknowledged: true, selection: normalized, pricingState: "illustrative_pending_staff_review" };
  }

  if (type === "origin_exchange_trade_inquiry") {
    const items = normalizedItems(payload.items);
    const requestType = enumValue(payload.requestType, new Set(["sample", "quote"]), 20);
    if (!items || !requestType || !isRecord(payload.profile)) return null;
    const company = text(payload.profile.company, 180);
    const destination = text(payload.profile.destination, 180);
    if (!company || !destination) return null;
    return { items, requestType, profile: { company, destination, notes: text(payload.profile.notes, 1000) }, verificationState: "supplier_evidence_and_availability_pending" };
  }

  if (type === "subscription_plan") {
    const plan = enumValue(payload.plan, new Set(["Explorer", "Atlas", "House"]), 40);
    const format = enumValue(payload.format, new Set(["Whole bean", "Filter ground", "Espresso ground", "Nespresso Original compatible", "K-Cup compatible", "Pocket pour-over"]), 60);
    const cadence = enumValue(payload.cadence, new Set(["Every week", "Every 2 weeks", "Every 4 weeks", "Every 6 weeks"]), 40);
    const brewMethod = enumValue(payload.brewMethod, new Set(["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine", "Single-serve brewer"]), 60);
    const quantity = Number(payload.quantity);
    const selectionMode = enumValue(payload.selectionMode, new Set(["Deldiet chooses", "I choose", "Taste Graph chooses"]), 40);
    if (!plan || !format || !cadence || !brewMethod || !selectionMode || !Number.isInteger(quantity) || quantity < 1 || quantity > 8) return null;
    return { plan, format, cadence, brewMethod, quantity, selectionMode, pricingState: "plan_request_pending_availability_and_final_price" };
  }

  if (type === "gift_build") {
    const giftType = enumValue(payload.giftType, new Set(["Origin journey", "Café ritual", "Brew kit", "Digital drink gift"]), 50);
    const occasion = enumValue(payload.occasion, new Set(["Birthday", "Thank you", "Celebration", "Client gift", "Just because"]), 40);
    const deliveryWindow = enumValue(payload.deliveryWindow, new Set(["As soon as available", "Within 2 weeks", "Within 1 month", "Choose with Deldiet"]), 50);
    const recipientMode = enumValue(payload.recipientMode, new Set(["Let recipient take the Taste Graph", "I will choose for them"]), 60);
    const budget = Number(payload.budget);
    if (!giftType || !occasion || !deliveryWindow || !recipientMode || !Number.isInteger(budget) || budget < 25 || budget > 2500) return null;
    return { giftType, occasion, deliveryWindow, recipientMode, budgetCad: budget, message: text(payload.message, 500), fulfilmentState: "gift_request_pending_recipient_and_delivery_confirmation" };
  }

  if (type === "workplace_program") {
    const programme = enumValue(payload.programme, new Set(["Office coffee", "Event coffee bar", "Hospitality programme", "Training & equipment"]), 60);
    const serviceCadence = enumValue(payload.serviceCadence, new Set(["One-time", "Weekly", "Every 2 weeks", "Monthly", "Not sure yet"]), 40);
    const brewSetup = enumValue(payload.brewSetup, new Set(["We need equipment", "Espresso machine", "Batch brewer", "Single-serve", "Mixed setup"]), 40);
    const headcount = Number(payload.headcount);
    const city = text(payload.city, 120);
    if (!programme || !serviceCadence || !brewSetup || !Number.isInteger(headcount) || headcount < 5 || headcount > 5000 || !city) return null;
    return { programme, serviceCadence, brewSetup, headcount, city, notes: text(payload.notes, 1000), quoteState: "programme_request_pending_scope_and_quote" };
  }

  if (["founding_batch", "wholesale", "workplace", "producer"].includes(type)) return {};
  return null;
}

function validateByType(type: ServiceRequestType, customer: RequestCustomer, payload: Record<string, unknown>): ValidationResult | null {
  if (type === "newsletter") {
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    if (payload.consent !== true) return { ok: false, error: "Newsletter consent is required.", field: "payload.consent" };
    return null;
  }

  if (type === "reservation") {
    if (!customer.name) return { ok: false, error: "Your name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    return (
      requireText(payload, "visitType", "Visit type", 120) ||
      requireText(payload, "preferredDate", "Preferred date", 20) ||
      requireText(payload, "party", "Party size", 40) ||
      requireText(payload, "preferredTime", "Preferred time", 40)
    );
  }

  if (type === "concierge") {
    if (!customer.email) return { ok: false, error: "A valid email address is required so the team can reply.", field: "customer.email" };
    return requireText(payload, "message", "Question", 1200);
  }

  if (["home_order_review", "origin_exchange_order_review"].includes(type)) {
    if (!customer.name) return { ok: false, error: "Your name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    if (!validItems(payload.items)) return { ok: false, error: "At least one valid item is required.", field: "payload.items" };
    return null;
  }

  if (type === "origin_bar_request") {
    if (!isRecord(payload.selection)) return { ok: false, error: "A complete cup selection is required.", field: "payload.selection" };
    for (const [key, label] of [["origin", "Origin"], ["roast", "Roast"], ["drink", "Drink"], ["size", "Size"], ["cup", "Cup"]] as const) {
      if (!text(payload.selection[key], 180)) return { ok: false, error: `${label} is required.`, field: `payload.selection.${key}` };
    }
    if (payload.safetyAcknowledged !== true) return { ok: false, error: "The ingredient safety acknowledgement is required.", field: "payload.safetyAcknowledged" };
    return null;
  }

  if (type === "origin_exchange_trade_inquiry") {
    if (!customer.name) return { ok: false, error: "A contact name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid business email is required.", field: "customer.email" };
    if (!validItems(payload.items)) return { ok: false, error: "Add at least one valid lot.", field: "payload.items" };
    if (!isRecord(payload.profile) || !text(payload.profile.company, 180)) return { ok: false, error: "Company or roastery name is required.", field: "payload.profile.company" };
    if (!new Set(["sample", "quote"]).has(String(payload.requestType))) return { ok: false, error: "Choose sample or verified quote.", field: "payload.requestType" };
    return null;
  }

  if (type === "subscription_plan") {
    if (!customer.name) return { ok: false, error: "Your name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    return requireText(payload, "plan", "Plan", 40) || requireText(payload, "format", "Format", 60) || requireText(payload, "cadence", "Cadence", 40);
  }

  if (type === "gift_build") {
    if (!customer.name) return { ok: false, error: "Your name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    return requireText(payload, "giftType", "Gift type", 50) || requireText(payload, "occasion", "Occasion", 40);
  }

  if (type === "workplace_program") {
    if (!customer.name) return { ok: false, error: "A contact name is required.", field: "customer.name" };
    if (!customer.email) return { ok: false, error: "A valid business email is required.", field: "customer.email" };
    return requireText(payload, "programme", "Programme", 60) || requireText(payload, "city", "City", 120);
  }

  if (["founding_batch", "wholesale", "workplace", "producer"].includes(type)) {
    if (!customer.email) return { ok: false, error: "A valid email address is required.", field: "customer.email" };
    return null;
  }

  return null;
}

export function normalizeServiceRequest(value: unknown, headerIdempotencyKey?: string | null): ValidationResult {
  if (!isRecord(value)) return { ok: false, error: "Request body must be a JSON object." };

  const typeValue = text(value.type, 80);
  if (!typeValue || !TYPE_SET.has(typeValue)) return { ok: false, error: "Unsupported request type.", field: "type" };
  const type = typeValue as ServiceRequestType;

  const source = text(value.source, 120);
  if (!source) return { ok: false, error: "Request source is required.", field: "source" };

  const idempotencyKey = text(headerIdempotencyKey, 128) ?? text(value.idempotencyKey, 128);
  if (!idempotencyKey || !IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
    return { ok: false, error: "A valid idempotency key is required.", field: "idempotencyKey" };
  }

  const customerInput = isRecord(value.customer) ? value.customer : {};
  const rawEmailProvided = typeof customerInput.email === "string" && customerInput.email.trim().length > 0;
  const customer: RequestCustomer = {
    name: text(customerInput.name, 160),
    email: email(customerInput.email),
    phone: text(customerInput.phone, 60),
  };
  if (rawEmailProvided && !customer.email) return { ok: false, error: "Enter a valid email address under 254 characters.", field: "customer.email" };
  if (typeof customerInput.phone === "string" && customerInput.phone.trim() && !customer.phone) return { ok: false, error: "Phone number is too long.", field: "customer.phone" };

  const rawPayload = isRecord(value.payload) ? value.payload : {};
  const typeError = validateByType(type, customer, rawPayload);
  if (typeError) return typeError;
  const payload = normalizePayload(type, rawPayload);
  if (!payload) return { ok: false, error: "Request details do not match the current Deldiet catalogue or workflow." };

  // Browser catalogue totals are never authoritative. Validate their shape, but
  // do not persist them until a server-side catalogue/pricing service exists.
  if (value.estimatedSubtotalCents !== undefined && value.estimatedSubtotalCents !== null) {
    const amount = Number(value.estimatedSubtotalCents);
    if (!Number.isInteger(amount) || amount < 0 || amount > 100_000_000) {
      return { ok: false, error: "Estimated subtotal must be a valid amount in cents.", field: "estimatedSubtotalCents" };
    }
  }
  const estimatedSubtotalCents: number | null = null;

  const payloadJson = JSON.stringify(payload);
  if (new TextEncoder().encode(payloadJson).byteLength > 64_000) {
    return { ok: false, error: "Request details are too large." };
  }

  const initialStatus = type === "origin_bar_request"
    ? "submitted_for_staff_review"
    : type === "origin_exchange_trade_inquiry"
      ? "submitted_for_trade_review"
      : "submitted_for_review";

  return {
    ok: true,
    value: {
      type,
      source,
      idempotencyKey,
      customer,
      currency: "CAD",
      estimatedSubtotalCents,
      payload,
      initialStatus,
    },
  };
}

export function publicStatusMessage(status: string, type: ServiceRequestType): string {
  if (status === "submitted_for_staff_review") return "Your cup request is saved. Keep this reference and show it to Deldiet staff for review.";
  if (status === "submitted_for_trade_review") return "Your sourcing enquiry is saved. Keep this reference for follow-up with the Deldiet trade team.";
  if (status === "staff_confirmed") return "A Deldiet team member has confirmed your request.";
  if (status === "payment_required") return "Your request is confirmed and payment instructions are pending.";
  if (status === "paid") return "Payment is confirmed.";
  if (status === "preparing") return "Your order is being prepared.";
  if (status === "ready") return "Your order is ready.";
  if (status === "cancelled") return "This request was cancelled.";
  if (type === "newsletter") return "Your subscription request is saved.";
  if (type === "subscription_plan") return "Your replenishment plan request is saved for Deldiet review. No billing or shipment has started.";
  if (type === "gift_build") return "Your gift request is saved for Deldiet review. Nothing has been charged or sent.";
  if (type === "workplace_program") return "Your programme brief is saved for Deldiet review. Availability, scope and pricing are still pending.";
  return "Your request is saved. Keep the reference for follow-up with the Deldiet team.";
}
