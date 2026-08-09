"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Origin = {
  id: string;
  country: string;
  region: string;
  continent: "Africa" | "Americas" | "Asia Pacific";
  code: string;
  notes: string[];
  process: string;
  elevation: string;
  producer: string;
  roast: string;
  price: number;
  accent: string;
};

type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
  channel: "cafe" | "shop";
  image?: string;
};

type CafeItem = {
  id: string;
  name: string;
  detail: string;
  category: string;
  price: number;
  tag?: string;
};

type RetailProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  badge?: string;
  variants: string[];
  tone: string;
  code: string;
  fulfilment: string;
};

const origins: Origin[] = [
  {
    id: "ethiopia-guji",
    country: "Ethiopia",
    region: "Guji · Hambela",
    continent: "Africa",
    code: "ET",
    notes: ["jasmine", "bergamot", "peach"],
    process: "Washed",
    elevation: "2,050–2,200 m",
    producer: "Smallholder collective",
    roast: "Light",
    price: 24,
    accent: "#ff7657",
  },
  {
    id: "kenya-nyeri",
    country: "Kenya",
    region: "Nyeri · Karatina",
    continent: "Africa",
    code: "KE",
    notes: ["blackcurrant", "grapefruit", "brown sugar"],
    process: "Washed",
    elevation: "1,750–1,950 m",
    producer: "Karatina growers",
    roast: "Light",
    price: 25,
    accent: "#ffb84d",
  },
  {
    id: "rwanda-nyamasheke",
    country: "Rwanda",
    region: "Nyamasheke · Kivu",
    continent: "Africa",
    code: "RW",
    notes: ["red apple", "hibiscus", "cacao"],
    process: "Honey",
    elevation: "1,700–2,000 m",
    producer: "Kivu women growers",
    roast: "Light-medium",
    price: 23,
    accent: "#e25b8d",
  },
  {
    id: "colombia-huila",
    country: "Colombia",
    region: "Huila · Pitalito",
    continent: "Americas",
    code: "CO",
    notes: ["caramel", "red berries", "cacao nib"],
    process: "Washed",
    elevation: "1,650–1,900 m",
    producer: "Pitalito family lots",
    roast: "Medium",
    price: 22,
    accent: "#f4d15d",
  },
  {
    id: "brazil-cerrado",
    country: "Brazil",
    region: "Cerrado Mineiro",
    continent: "Americas",
    code: "BR",
    notes: ["hazelnut", "milk chocolate", "dried fig"],
    process: "Natural",
    elevation: "1,000–1,250 m",
    producer: "Cerrado estate lot",
    roast: "Medium",
    price: 20,
    accent: "#b8d56a",
  },
  {
    id: "costa-rica-tarrazu",
    country: "Costa Rica",
    region: "Tarrazú · Los Santos",
    continent: "Americas",
    code: "CR",
    notes: ["orange", "honey", "almond"],
    process: "Red honey",
    elevation: "1,500–1,800 m",
    producer: "Micro-mill selection",
    roast: "Light-medium",
    price: 24,
    accent: "#66c7a5",
  },
  {
    id: "indonesia-sumatra",
    country: "Indonesia",
    region: "Sumatra · Gayo",
    continent: "Asia Pacific",
    code: "ID",
    notes: ["cedar", "cacao", "sweet spice"],
    process: "Wet-hulled",
    elevation: "1,300–1,600 m",
    producer: "Gayo cooperative",
    roast: "Medium-dark",
    price: 22,
    accent: "#56a79b",
  },
  {
    id: "papua-wahgi",
    country: "Papua New Guinea",
    region: "Wahgi Valley",
    continent: "Asia Pacific",
    code: "PG",
    notes: ["tropical fruit", "toffee", "cocoa"],
    process: "Washed",
    elevation: "1,500–1,800 m",
    producer: "Highlands garden lots",
    roast: "Medium",
    price: 23,
    accent: "#a98ce0",
  },
];

const products = [
  { id: "whole", name: "Whole bean", detail: "Fresh-roasted · 340 g", format: "Bean", price: 22, tone: "clay" },
  { id: "ground", name: "Ground to order", detail: "Matched to your brewer · 340 g", format: "Ground", price: 22, tone: "oat" },
  { id: "nespresso", name: "Origin capsules", detail: "OriginalLine compatible · 10", format: "Pods", price: 12, tone: "moss" },
  { id: "kcup", name: "Brew cups", detail: "K-Cup compatible · 12", format: "Pods", price: 14, tone: "amber" },
  { id: "drip", name: "Pocket pour-over", detail: "Single-serve filter bags · 5", format: "Single serve", price: 13, tone: "berry" },
  { id: "concentrate", name: "Cold brew atelier", detail: "Concentrate · 500 ml", format: "Ready to drink", price: 18, tone: "ink" },
  { id: "rtd", name: "Black / Bright", detail: "Cold coffee · 250 ml × 4", format: "Ready to drink", price: 16, tone: "sky" },
  { id: "clarity", name: "Clarity", detail: "Caffeine-free coffee ritual · 10 sticks", format: "Functional", price: 29, tone: "violet" },
];

const formatImages: Record<string, string> = {
  whole: "/products/format-whole-bean.webp",
  ground: "/products/format-ground.webp",
  nespresso: "/products/format-origin-capsules.webp",
  kcup: "/products/format-brew-cups.webp",
  drip: "/products/format-pocket-pour.webp",
  concentrate: "/products/format-cold-brew-concentrate.webp",
  rtd: "/products/format-rtd-cans.webp",
  clarity: "/products/format-clarity-sticks.webp",
};

const formats = ["All", "Bean", "Ground", "Pods", "Single serve", "Ready to drink", "Functional"];

const cafeMenu: CafeItem[] = [
  { id: "espresso", name: "Espresso", detail: "House No. 01 · double", category: "Espresso bar", price: 3.75, tag: "House" },
  { id: "cortado", name: "Cortado", detail: "Double espresso · textured milk", category: "Espresso bar", price: 4.75 },
  { id: "flat-white", name: "Flat white", detail: "Origin espresso · microfoam", category: "Espresso bar", price: 5.75, tag: "Popular" },
  { id: "cappuccino", name: "Cappuccino", detail: "Espresso · milk · deep foam", category: "Espresso bar", price: 5.25 },
  { id: "guji-pour", name: "Guji pour-over", detail: "Jasmine · bergamot · peach", category: "Brew bar", price: 7.5, tag: "Barista pick" },
  { id: "origin-flight", name: "Origin flight", detail: "Three 120 ml coffees · guided card", category: "Brew bar", price: 12 },
  { id: "jebena", name: "Jebena service", detail: "Ethiopian-style shared coffee ritual", category: "Brew bar", price: 18, tag: "For two" },
  { id: "cold-brew", name: "Cold brew", detail: "18-hour extraction · still", category: "Cold", price: 5.75 },
  { id: "flash-brew", name: "Flash brew", detail: "Bright seasonal origin · over ice", category: "Cold", price: 6.25 },
  { id: "espresso-tonic", name: "Espresso tonic", detail: "Citrus tonic · espresso · orange", category: "Cold", price: 6.5 },
  { id: "harbour-mocha", name: "Harbour mocha", detail: "Single-origin cacao · sea salt", category: "Signatures", price: 6.75, tag: "Deldiet" },
  { id: "maple-cardamom", name: "Maple cardamom latte", detail: "Pure maple · green cardamom", category: "Signatures", price: 6.5, tag: "Deldiet" },
  { id: "cascara-spritz", name: "Cascara spritz", detail: "Coffee cherry · hibiscus · soda", category: "Signatures", price: 5.75 },
  { id: "single-cacao", name: "Single-origin chocolate", detail: "Ecuador cacao · steamed milk", category: "Beyond coffee", price: 5.5 },
  { id: "masala-chai", name: "Masala chai", detail: "Whole spices · Assam tea · milk", category: "Beyond coffee", price: 5.5 },
  { id: "hibiscus-cooler", name: "Hibiscus cooler", detail: "Hibiscus · citrus · mint", category: "Beyond coffee", price: 4.75 },
  { id: "croissant", name: "Butter croissant", detail: "Laminated in-house · baked daily", category: "Bakery", price: 4.25 },
  { id: "morning-bun", name: "Cocoa morning bun", detail: "Cacao nib · brown sugar", category: "Bakery", price: 4.75 },
];

const cafeCategories = ["All", "Espresso bar", "Brew bar", "Cold", "Signatures", "Beyond coffee", "Bakery"];

const retailProducts: RetailProduct[] = [
  { id: "guji-reserve", name: "Guji Reserve", category: "Coffee", description: "Washed Ethiopian micro-lot with jasmine, bergamot and peach.", price: 24, badge: "New harvest", variants: ["Whole bean · 250 g", "Whole bean · 1 kg", "Pour-over grind · 250 g", "Espresso grind · 250 g"], tone: "coral", code: "ET / 01", fulfilment: "Roasted to order · ships in 1–2 days" },
  { id: "house-01", name: "House No. 01", category: "Coffee", description: "Our chocolate-forward Brazil and Colombia espresso blend.", price: 21, badge: "Bestseller", variants: ["Whole bean · 340 g", "Whole bean · 1 kg", "Espresso grind · 340 g", "Filter grind · 340 g"], tone: "ink", code: "DL / 01", fulfilment: "Roasted weekly · café pickup available" },
  { id: "world-flight", name: "World flight", category: "Coffee", description: "Four 100 g single origins with guided tasting cards.", price: 42, badge: "Gift-ready", variants: ["Whole bean", "Filter grind"], tone: "berry", code: "04 / LOT", fulfilment: "Ships nationally · free pickup" },
  { id: "huila-decaf", name: "Huila Decaf", category: "Coffee", description: "Sugarcane-decaffeinated Colombia with caramel and red berries.", price: 23, variants: ["Whole bean · 340 g", "Filter grind · 340 g", "Espresso grind · 340 g"], tone: "sand", code: "CO / DF", fulfilment: "Roasted weekly · café pickup available" },
  { id: "origin-capsules", name: "Origin capsules", category: "Coffee formats", description: "Aluminium capsules matched to rotating single-origin espresso.", price: 12, badge: "10 pack", variants: ["Nespresso Original compatible", "Decaf · Nespresso Original compatible"], tone: "moss", code: "CAP / 10", fulfilment: "Recycling return bag included" },
  { id: "brew-cups", name: "Brew cups", category: "Coffee formats", description: "K-Cup-compatible single serves filled with House No. 01.", price: 14, variants: ["House · 12", "Origin variety · 12", "Decaf · 12"], tone: "amber", code: "CUP / 12", fulfilment: "Ships or café pickup" },
  { id: "pocket-pour", name: "Pocket pour-over", category: "Coffee formats", description: "A real specialty pour-over with no equipment required.", price: 13, badge: "Travel", variants: ["Guji · 5", "World variety · 5", "House · 5"], tone: "sky", code: "PO / 05", fulfilment: "Letterbox-friendly shipping" },
  { id: "cold-box", name: "Cold brew box", category: "Coffee formats", description: "Four immersion packs sized for a one-litre home batch.", price: 18, variants: ["House · 4", "Fruity origin · 4"], tone: "ink", code: "CB / 04", fulfilment: "Ships or café pickup" },
  { id: "clarity-sticks", name: "Clarity ritual", category: "Functional", description: "Caffeine-free black-coffee-inspired ritual in single-serve sticks.", price: 29, badge: "Founding batch", variants: ["10 sticks", "30 sticks"], tone: "violet", code: "CLR / 10", fulfilment: "Interest list · formulation under review" },
  { id: "stoneware-mug", name: "Café stoneware mug", category: "Drinkware", description: "Hand-finished 300 ml mug used at the Deldiet coffeehouse.", price: 28, badge: "Café object", variants: ["Chalk", "Espresso", "Moss"], tone: "sand", code: "MUG / 30", fulfilment: "Boxed for shipping · café pickup" },
  { id: "espresso-pair", name: "Espresso cup pair", category: "Drinkware", description: "Two stackable 90 ml cups with softly fluted walls.", price: 32, variants: ["Chalk", "Espresso"], tone: "clay", code: "ESP / 02", fulfilment: "Protective gift box included" },
  { id: "field-tumbler", name: "Field tumbler", category: "Drinkware", description: "Vacuum-insulated 355 ml tumbler with leak-resistant lid.", price: 38, badge: "Bestseller", variants: ["Olive", "Graphite", "Oat"], tone: "moss", code: "FLD / 12", fulfilment: "Ships or café pickup" },
  { id: "cold-cup", name: "Reusable cold cup", category: "Drinkware", description: "Clear 475 ml cup, soft-touch sleeve and reusable straw.", price: 24, variants: ["Lime", "Smoke"], tone: "sky", code: "CLD / 16", fulfilment: "Ships or café pickup" },
  { id: "deldiet-dripper", name: "Deldiet dripper", category: "Brew gear", description: "Fast-flow flat-bed brewer designed for transparent cups.", price: 46, badge: "Designed in-house", variants: ["Porcelain · chalk", "Porcelain · black"], tone: "paper", code: "DRP / 01", fulfilment: "Recipe card and filters included" },
  { id: "precision-kettle", name: "Precision kettle", category: "Brew gear", description: "Temperature-control gooseneck kettle for repeatable brewing.", price: 158, variants: ["Matte black", "Bone"], tone: "ink", code: "KTL / 01", fulfilment: "Canada shipping · 1-year warranty" },
  { id: "field-grinder", name: "Field hand grinder", category: "Brew gear", description: "38 mm burrs, stepped adjustment and travel case.", price: 118, variants: ["Graphite", "Olive"], tone: "moss", code: "GRD / 01", fulfilment: "Calibration card included" },
  { id: "brew-scale", name: "Brew scale", category: "Brew gear", description: "Fast 0.1 g response, timer and quiet tactile controls.", price: 84, variants: ["Black", "Stone"], tone: "slate", code: "SCL / 01", fulfilment: "USB-C cable included" },
  { id: "heavy-hoodie", name: "Seed heavyweight hoodie", category: "Apparel", description: "470 gsm brushed cotton with the Deldiet seed emblem.", price: 92, badge: "New", variants: ["Black · XS", "Black · S", "Black · M", "Black · L", "Black · XL"], tone: "ink", code: "HD / 01", fulfilment: "Ships or coffeehouse pickup" },
  { id: "origin-tee", name: "Origin field tee", category: "Apparel", description: "Heavy cotton tee with a minimal origin coordinate print.", price: 42, variants: ["Cream · XS", "Cream · S", "Cream · M", "Cream · L", "Cream · XL"], tone: "paper", code: "TEE / 08", fulfilment: "Ships or coffeehouse pickup" },
  { id: "five-panel", name: "Roastery five-panel", category: "Apparel", description: "Washed cotton cap with embroidered seed mark.", price: 36, variants: ["Olive", "Black", "Oat"], tone: "moss", code: "CAP / 01", fulfilment: "Adjustable · one size" },
  { id: "bar-apron", name: "Bar apron", category: "Apparel", description: "Cross-back canvas apron based on our coffeehouse uniform.", price: 68, variants: ["Olive", "Espresso"], tone: "clay", code: "APR / 01", fulfilment: "Ships or coffeehouse pickup" },
  { id: "canvas-tote", name: "Market canvas tote", category: "Lifestyle", description: "Structured organic canvas with reinforced coffee-bag base.", price: 32, badge: "Everyday", variants: ["Natural", "Black"], tone: "paper", code: "TOTE / 01", fulfilment: "Ships or coffeehouse pickup" },
  { id: "field-notebook", name: "Coffee field notebook", category: "Lifestyle", description: "Dot grid, tasting templates and origin index pages.", price: 18, variants: ["Moss", "Clay", "Black"], tone: "moss", code: "NOTE / 80", fulfilment: "FSC paper · 160 pages" },
  { id: "roastery-candle", name: "Roastery candle", category: "Lifestyle", description: "Cedar, cacao shell and warm stone—without a sweet fragrance.", price: 34, variants: ["200 g"], tone: "amber", code: "CND / 01", fulfilment: "Plant wax · 40 hour burn" },
  { id: "origin-print", name: "Guji origin print", category: "Lifestyle", description: "Numbered topographic artwork from the current coffee atlas.", price: 28, badge: "Limited", variants: ["A3 unframed", "A2 unframed"], tone: "coral", code: "PRT / ET", fulfilment: "Ships flat · limited to 250" },
  { id: "home-kit", name: "Home brew kit", category: "Gifts", description: "Dripper, filters, field tumbler and matched 340 g coffee.", price: 98, badge: "Complete kit", variants: ["Bright", "Balanced", "Bold"], tone: "sky", code: "KIT / 01", fulfilment: "Gift note available" },
  { id: "celebration-box", name: "Celebration box", category: "Gifts", description: "Two coffees, cup pair, tasting chocolate and field cards.", price: 86, variants: ["Discovery", "Espresso", "Decaf"], tone: "berry", code: "GFT / 04", fulfilment: "Scheduled delivery available" },
  { id: "gift-card", name: "Deldiet gift card", category: "Gifts", description: "One balance for café drinks, merchandise and online coffee.", price: 25, badge: "Omnichannel", variants: ["$25", "$50", "$100", "$200"], tone: "lime", code: "GIFT / ∞", fulfilment: "Digital now or physical by post" },
];

const retailImages: Record<string, string> = {
  "guji-reserve": "/products/guji-reserve.webp",
  "house-01": "/products/house-01.webp",
  "world-flight": "/products/world-flight.webp",
  "huila-decaf": "/products/huila-decaf.webp",
  "origin-capsules": "/products/origin-capsules.webp",
  "brew-cups": "/products/brew-cups.webp",
  "pocket-pour": "/products/pocket-pour.webp",
  "cold-box": "/products/cold-brew-box.webp",
  "clarity-sticks": "/products/clarity-sticks.webp",
  "stoneware-mug": "/products/stoneware-mug.webp",
  "espresso-pair": "/products/espresso-pair.webp",
  "field-tumbler": "/products/field-tumbler.webp",
  "cold-cup": "/products/cold-cup.webp",
  "deldiet-dripper": "/products/deldiet-dripper.webp",
  "precision-kettle": "/products/precision-kettle.webp",
  "field-grinder": "/products/field-grinder.webp",
  "brew-scale": "/products/brew-scale.webp",
  "heavy-hoodie": "/products/heavy-hoodie.webp",
  "origin-tee": "/products/origin-tee.webp",
  "five-panel": "/products/five-panel.webp",
  "bar-apron": "/products/bar-apron.webp",
  "canvas-tote": "/products/canvas-tote.webp",
  "field-notebook": "/products/field-notebook.webp",
  "roastery-candle": "/products/roastery-candle.webp",
  "origin-print": "/products/origin-print.webp",
  "home-kit": "/products/home-kit.webp",
  "celebration-box": "/products/celebration-box.webp",
  "gift-card": "/products/gift-card.webp",
};

function resolveCartImage(item: CartItem) {
  if (item.image) return item.image;
  if (item.channel === "cafe") return "/products/cafe-order.webp";
  if (formatImages[item.id]) return formatImages[item.id];
  const retailId = Object.keys(retailImages).find((id) => item.id.startsWith(`shop-${id}-`));
  return retailId ? retailImages[retailId] : "/products/format-whole-bean.webp";
}

const shopCategories = ["All", "Coffee", "Coffee formats", "Functional", "Drinkware", "Brew gear", "Apparel", "Lifestyle", "Gifts"];

const machineMatches: Record<string, string[]> = {
  "Whole bean grinder": ["Whole bean", "Refillable tin", "Discovery box", "Cold-brew packs"],
  "Nespresso Original": ["Origin capsules", "Decaf capsules", "Tasting sleeve", "Return bag"],
  "Keurig brewer": ["Brew cups", "Compostable filter cups", "Office case", "Variety pack"],
  "Pour-over setup": ["Ground to order", "Pocket pour-over", "Whole bean", "Brew guide"],
  "No equipment": ["Pocket pour-over", "Brew bags", "Instant sticks", "Ready-to-drink"],
};

const cupOptions = {
  origin: ["Ethiopia · Guji", "Kenya · Nyeri", "Colombia · Huila", "Brazil · Cerrado", "Indonesia · Gayo"],
  style: ["Pour-over", "Flat white", "Espresso", "Cappuccino", "Long black", "Cold brew"],
  milk: ["No milk", "Whole milk", "Oat", "Almond", "Coconut"],
  finish: ["Pure", "Cacao", "Vanilla bean", "Brown sugar", "Cinnamon"],
};

const journeyPaths = {
  taste: {
    label: "Find my coffee",
    eyebrow: "Taste-led discovery",
    title: "Start with what you love—not coffee jargon.",
    copy: "Build a Tasteprint from flavour, mood and brew method. Deldiet turns it into a transparent origin recommendation you can taste in the coffeehouse or buy for home.",
    primary: "Take the Tasteprint",
    target: "tasteprint",
    secondary: "Explore the origin atlas",
    secondaryTarget: "origins",
    stat: "3 questions · editable result",
  },
  cafe: {
    label: "Visit the coffeehouse",
    eyebrow: "In-house experience",
    title: "Choose the place, pace and cup before you arrive.",
    copy: "Browse the café menu, choose dine-in or pickup, build an origin-specific drink and reserve a tasting—all inside one connected coffeehouse journey.",
    primary: "Open coffeehouse ordering",
    target: "coffeehouse",
    secondary: "Build at Origin Bar",
    secondaryHref: "/origin-bar",
    stat: "Dine in · pickup · events",
  },
  home: {
    label: "Brew at home",
    eyebrow: "Machine-matched retail",
    title: "Take the same origin home in the format you actually use.",
    copy: "Match whole beans, grind, capsules, brew cups, filter bags, cold brew and gifts to your equipment—then keep the exact coffee in your Deldiet Passport.",
    primary: "Match my machine",
    target: "formats",
    secondary: "Shop all formats",
    secondaryTarget: "shop-catalogue",
    stat: "One origin · every compatible format",
  },
  trade: {
    label: "Source for business",
    eyebrow: "Wholesale and green coffee",
    title: "Move from discovery to a documented sourcing enquiry.",
    copy: "Origin Exchange separates roasted retail from green-lot sourcing, with sample requests, verification status, document checklists and quote-based logistics.",
    primary: "Enter Origin Exchange",
    href: "/origin-exchange",
    secondary: "Explore business services",
    secondaryTarget: "ecosystem",
    stat: "Retail checkout · separate trade enquiry",
  },
} as const;

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7V4h6v3"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <><path d="M5 12h14"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z"/><path d="m18 15 .7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15Z"/></>,
    pin: <><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    clock: <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    leaf: <><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z"/><path d="M7 17c3-4 6-7 11-10"/></>,
    play: <path d="m9 7 8 5-8 5V7Z"/>,
    pause: <><path d="M9 7v10"/><path d="M15 7v10"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [region, setRegion] = useState("All origins");
  const [activeOrigin, setActiveOrigin] = useState(origins[0]);
  const [format, setFormat] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [cup, setCup] = useState({ origin: cupOptions.origin[0], style: cupOptions.style[0], milk: cupOptions.milk[0], finish: cupOptions.finish[0], temperature: "Hot" });
  const [taste, setTaste] = useState({ mood: "Bright", note: "Fruit-forward", brew: "Pour-over" });
  const [tasteResult, setTasteResult] = useState("");
  const [machine, setMachine] = useState("Whole bean grinder");
  const [experience, setExperience] = useState<"coffeehouse" | "shop">("coffeehouse");
  const [serviceMode, setServiceMode] = useState("Pickup now");
  const [cafeCategory, setCafeCategory] = useState("All");
  const [shopCategory, setShopCategory] = useState("All");
  const [shopSearch, setShopSearch] = useState("");
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationTime, setReservationTime] = useState("Morning");
  const [selectedProduct, setSelectedProduct] = useState<RetailProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [journeyIntent, setJourneyIntent] = useState<keyof typeof journeyPaths>("taste");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("deldiet-cart");
      if (stored) {
        try {
          const saved = JSON.parse(stored) as Array<CartItem & { channel?: "cafe" | "shop" }>;
          setCart(saved.map((item) => ({ ...item, channel: item.channel || "shop" })));
        } catch { /* ignore malformed local data */ }
      }
      setCartHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (cartHydrated) window.localStorage.setItem("deldiet-cart", JSON.stringify(cart));
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroVideoRef.current?.pause();
      const frame = window.requestAnimationFrame(() => setHeroPlaying(false));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  const visibleOrigins = region === "All origins" ? origins : origins.filter((item) => item.continent === region);
  const visibleProducts = format === "All" ? products : products.filter((item) => item.format === format);
  const visibleCafeMenu = cafeCategory === "All" ? cafeMenu : cafeMenu.filter((item) => item.category === cafeCategory);
  const visibleShopProducts = retailProducts.filter((item) => {
    const inCategory = shopCategory === "All" || item.category === shopCategory;
    const haystack = `${item.name} ${item.category} ${item.description} ${item.code}`.toLowerCase();
    return inCategory && haystack.includes(shopSearch.trim().toLowerCase());
  });
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cafeCart = cart.filter((item) => item.channel === "cafe");
  const shopCart = cart.filter((item) => item.channel === "shop");
  const cafeTotal = cafeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shopTotal = shopCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cupPrice = useMemo(() => {
    let price = 5.5;
    if (cup.style === "Flat white" || cup.style === "Cappuccino") price += 1.25;
    if (cup.style === "Cold brew") price += 0.75;
    if (cup.milk !== "No milk" && cup.milk !== "Whole milk") price += 0.9;
    if (cup.finish !== "Pure") price += 0.65;
    return price;
  }, [cup]);

  function addToCart(item: Omit<CartItem, "quantity" | "channel"> & { channel?: "cafe" | "shop" }) {
    const normalized = { ...item, channel: item.channel || "shop" } as Omit<CartItem, "quantity">;
    setCart((current) => {
      const exists = current.find((entry) => entry.id === normalized.id);
      if (exists) return current.map((entry) => entry.id === normalized.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      return [...current, { ...normalized, quantity: 1 }];
    });
    setToast(`${normalized.name} added to your ${normalized.channel === "cafe" ? "coffeehouse order" : "shop bag"}`);
  }

  function openProduct(product: RetailProduct) {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0]);
  }

  function switchExperience(next: "coffeehouse" | "shop") {
    setExperience(next);
    scrollToId(next === "coffeehouse" ? "coffeehouse" : "merch");
  }

  function updateQuantity(id: string, delta: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }

  function calculateTasteprint() {
    const match = taste.note === "Fruit-forward" ? "Ethiopia · Guji" : taste.note === "Chocolate & nuts" ? "Brazil · Cerrado" : "Rwanda · Nyamasheke";
    setTasteResult(`${match} · ${taste.mood === "Bold" ? "medium" : "light"} roast · ${taste.brew}`);
  }

  function toggleHeroMotion() {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setHeroPlaying(true);
    } else {
      video.pause();
      setHeroPlaying(false);
    }
  }

  const activeJourney = journeyPaths[journeyIntent];

  return (
    <main className="deldiet-home">
      <div className="announcement">
        <span><i className="live-dot" /> Coffeehouse experience · interactive preview</span>
        <span className="announcement-copy">St. John&apos;s, Newfoundland · location and opening details to be confirmed</span>
        <button onClick={() => switchExperience("coffeehouse")}>Order ahead <Icon name="arrow" size={15} /></button>
      </div>

      <header className="site-header">
        <button className="brand" aria-label="Deldiet home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brand-seed" />
          <span>deldiet</span>
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
          <button onClick={() => { scrollToId("coffeehouse"); setMenuOpen(false); }}>Coffeehouse</button>
          <a href="/origin-bar" onClick={() => setMenuOpen(false)}>Origin Bar</a>
          <a href="/origin-exchange" onClick={() => setMenuOpen(false)}>Origin Exchange</a>
          <button onClick={() => { scrollToId("formats"); setMenuOpen(false); }}>Coffee at home</button>
          <button onClick={() => { scrollToId("merch"); setMenuOpen(false); }}>Merch</button>
          <button onClick={() => { scrollToId("events"); setMenuOpen(false); }}>Events</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button desktop-only" aria-label="Search" onClick={() => setToast("Search is ready for the complete catalogue")}><Icon name="search" /></button>
          <button className="icon-button desktop-only" aria-label="Account" onClick={() => setToast("Your Deldiet Passport is ready for sign-in integration")}><Icon name="user" /></button>
          <button className="bag-button" aria-label={`Shopping bag with ${cartCount} items`} onClick={() => setCartOpen(true)}>
            <Icon name="bag" /><span>{cartCount}</span>
          </button>
          <button className="menu-button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
        </div>
      </header>

      <div className="experience-switch" role="group" aria-label="Choose Deldiet experience">
        <div className="experience-switch-label"><span className="brand-seed" /><b>One Deldiet</b><small>One profile · three ways to experience it</small></div>
        <button className={experience === "coffeehouse" ? "active" : ""} onClick={() => switchExperience("coffeehouse")}><Icon name="pin" size={18} /><span><b>Coffeehouse</b><small>Dine in · order ahead · events</small></span></button>
        <a href="/origin-bar"><Icon name="spark" size={18} /><span><b>Origin Bar</b><small>Build an in-store cup from origin</small></span></a>
        <button className={experience === "shop" ? "active" : ""} onClick={() => switchExperience("shop")}><Icon name="bag" size={18} /><span><b>Shop online</b><small>Coffee · gear · apparel · gifts</small></span></button>
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" />
        <video
          ref={heroVideoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://deldiet-experience.elkings.chatgpt.site/deldiet-hero-motion-poster.webp"
          aria-hidden="true"
        >
          <source src="https://deldiet-experience.elkings.chatgpt.site/deldiet-hero-motion.mp4" type="video/mp4" />
        </video>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow light">From altitude to aroma · one connected coffee world</p>
          <h1 id="hero-title">The world,<br /><em>brewed live.</em></h1>
          <p className="hero-copy">Choose a real origin, watch it become your exact cup, then take that same coffee home as beans, grounds, capsules, brew cups, filter bags or a subscription built around your brewer.</p>
          <div className="hero-actions">
            <a className="button button-light" href="/origin-bar">Enter the Origin Bar <Icon name="arrow" /></a>
            <button className="text-link light" onClick={() => scrollToId("journey")}>Find my Deldiet path <Icon name="arrow" size={17} /></button>
          </div>
          <div className="hero-route" aria-label="The Deldiet coffee journey">
            {[["01","Origin"],["02","Roast"],["03","Craft"],["04","Take home"]].map(([number,label]) => <span key={number}><b>{number}</b><small>{label}</small></span>)}
          </div>
        </div>
        <div className="hero-origin-card glass-card">
          <div>
            <span className="micro-label">Now in the visual journey</span>
            <strong>Bloom → pour</strong>
            <p>Macro brewing study · motion loops silently</p>
          </div>
          <button aria-label={heroPlaying ? "Pause hero motion" : "Play hero motion"} aria-pressed={!heroPlaying} onClick={toggleHeroMotion}>{heroPlaying ? <Icon name="pause" /> : <Icon name="play" />}</button>
        </div>
        <div className="hero-index" aria-hidden="true"><span>Origin</span><i /><span>Cup</span></div>
      </section>

      <section className="promise-strip" aria-label="Deldiet commitments">
        <div><Icon name="pin" /><span><b>Destination coffeehouse</b> dine in or order ahead</span></div>
        <div><Icon name="leaf" /><span><b>18 traceable origins</b> selected by real place</span></div>
        <div><Icon name="spark" /><span><b>30+ product families</b> coffee, objects and apparel</span></div>
        <div><Icon name="clock" /><span><b>One shared Passport</b> in-store and online</span></div>
      </section>

      <section className="journey-planner" id="journey" aria-labelledby="journey-title">
        <div className="journey-planner-copy">
          <p className="eyebrow light">Your way into Deldiet</p>
          <h2 id="journey-title">One coffee world.<br/><em>Four useful doors.</em></h2>
          <p>Choose what you are here to do. The platform reshapes the next step around your goal instead of making you search through a conventional menu.</p>
          <div className="journey-tabs" role="tablist" aria-label="Choose your Deldiet goal">
            {(Object.keys(journeyPaths) as Array<keyof typeof journeyPaths>).map((key, index) => <button key={key} role="tab" aria-selected={journeyIntent === key} className={journeyIntent === key ? "active" : ""} onClick={() => setJourneyIntent(key)}><span>0{index + 1}</span>{journeyPaths[key].label}</button>)}
          </div>
        </div>
        <div className="journey-result" role="tabpanel" aria-live="polite">
          <div className="journey-result-top"><span>{activeJourney.eyebrow}</span><b>{activeJourney.stat}</b></div>
          <h3>{activeJourney.title}</h3>
          <p>{activeJourney.copy}</p>
          <div className="journey-result-actions">
            {"href" in activeJourney ? <a className="button button-lime" href={activeJourney.href}>{activeJourney.primary}<Icon name="arrow"/></a> : <button className="button button-lime" onClick={() => scrollToId(activeJourney.target)}>{activeJourney.primary}<Icon name="arrow"/></button>}
            {"secondaryHref" in activeJourney ? <a className="text-link light" href={activeJourney.secondaryHref}>{activeJourney.secondary}<Icon name="arrow" size={16}/></a> : <button className="text-link light" onClick={() => scrollToId(activeJourney.secondaryTarget)}>{activeJourney.secondary}<Icon name="arrow" size={16}/></button>}
          </div>
          <div className="journey-orbit" aria-hidden="true"><i/><i/><i/><span className="brand-seed"/></div>
        </div>
      </section>

      <section className="section coffeehouse-section" id="coffeehouse">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">01 / Deldiet Coffeehouse</p><h2>A room built<br /><em>around coffee.</em></h2></div>
          <div className="section-intro"><p>Stay for a careful pour, meet friends over a flight, or order ahead. Every in-house cup is linked to the same origin library, taste profile and rewards you use online.</p><button className="text-link" onClick={() => setReservationOpen(true)}>Plan your visit <Icon name="arrow" /></button></div>
        </div>

        <div className="coffeehouse-stage">
          <div className="coffeehouse-photo" role="img" aria-label="Warm Deldiet specialty coffeehouse interior with a coffee bar and retail wall">
            <div className="photo-status glass-card"><span className="live-dot"/><div><b>Flagship concept</b><small>St. John&apos;s · final location to be announced</small></div><strong>PREVIEW</strong></div>
          </div>
          <aside className="visit-console">
            <div className="visit-console-head"><span className="micro-label">Coffeehouse service preview</span><b>Order your way</b><p>Explore how dine-in, pickup, scheduled and table ordering will work. Live availability appears when café systems are connected.</p></div>
            <div className="service-modes" role="group" aria-label="Coffeehouse service mode">
              {[{name:"Dine in",meta:"Table service flow"},{name:"Pickup now",meta:"Counter handoff flow"},{name:"Schedule",meta:"Choose a future time"},{name:"Table QR",meta:"Order from your seat"}].map((mode) => <button key={mode.name} className={serviceMode === mode.name ? "active" : ""} onClick={() => setServiceMode(mode.name)}><span>{mode.name}</span><small>{mode.meta}</small></button>)}
            </div>
            <div className="live-operations">
              <div><span>Service mode</span><b>Demo</b><small>{serviceMode}</small></div>
              <div><span>Live timing</span><b>Connect</b><small>POS / kitchen display</small></div>
              <div><span>Availability</span><b>TBA</b><small>published at launch</small></div>
            </div>
            <div className="visit-details">
              <span><Icon name="pin" size={18}/><b>St. John&apos;s flagship</b><small>Address and accessibility details pending site confirmation</small></span>
              <span><Icon name="clock" size={18}/><b>Hours to be published</b><small>The platform will show holiday and slow-bar hours</small></span>
              <span><Icon name="spark" size={18}/><b>Amenities to be verified</b><small>Only confirmed facilities will appear at launch</small></span>
            </div>
            <button className="button button-lime" onClick={() => { window.location.href = "/origin-bar"; }}>Build at Deldiet Origin Bar <Icon name="arrow" /></button>
          </aside>
        </div>

        <div className="cafe-menu" id="cafe-menu">
          <div className="cafe-menu-heading"><div><p className="eyebrow">Today&apos;s coffeehouse menu</p><h3>Crafted here. Built around your origin.</h3></div><div className="menu-service-summary"><span>Ordering for</span><b>{serviceMode}</b><button onClick={() => setServiceMode("Pickup now")}>Change</button></div></div>
          <div className="filter-row" role="group" aria-label="Filter coffeehouse menu">{cafeCategories.map((item) => <button key={item} className={cafeCategory === item ? "filter-pill active" : "filter-pill"} onClick={() => setCafeCategory(item)}>{item}</button>)}</div>
          <div className="cafe-menu-grid">
            {visibleCafeMenu.map((item) => <article key={item.id}>
              <div className="cafe-menu-index">{item.tag ? <span>{item.tag}</span> : <span>{item.category}</span>}<i className="brand-seed"/></div>
              <div><h4>{item.name}</h4><p>{item.detail}</p></div>
              <button aria-label={`Add ${item.name} to coffeehouse order`} onClick={() => addToCart({ id: `cafe-${serviceMode}-${item.id}`, name: item.name, detail: `${serviceMode} · ${item.detail}`, price: item.price, channel: "cafe", image: "/products/cafe-order.webp" })}><span>${item.price.toFixed(2)}</span><Icon name="plus" size={18}/></button>
            </article>)}
          </div>
          <div className="menu-footnote"><span>Milks: whole · oat · almond · coconut</span><span>Ask about ingredients and allergens before ordering.</span><button onClick={() => { window.location.href = "/origin-bar"; }}>Open Deldiet Origin Bar <Icon name="arrow" size={16}/></button></div>
        </div>

        <div className="experience-calendar" id="events">
          <div className="calendar-intro"><p className="eyebrow light">At the coffeehouse</p><h3>Taste. Learn.<br/><em>Meet the world.</em></h3><p>The cupping room hosts small-group tastings, practical classes and live conversations with the people behind each lot.</p><button className="button button-light" onClick={() => setReservationOpen(true)}>View all experiences <Icon name="arrow" /></button></div>
          <div className="event-list">
            <article><div><span>01 / PREVIEW</span><small>Sample experience · schedule TBA</small></div><h4>East Africa cupping table</h4><p>Compare Ethiopia, Kenya and Rwanda with a Deldiet sensory guide.</p><button onClick={() => setReservationOpen(true)}>Join interest list <Icon name="arrow" size={17}/></button></article>
            <article><div><span>02 / PREVIEW</span><small>Sample experience · schedule TBA</small></div><h4>Home espresso clinic</h4><p>Dial in grind, dose and milk texture on a range of home machines.</p><button onClick={() => setReservationOpen(true)}>Join interest list <Icon name="arrow" size={17}/></button></article>
            <article><div><span>03 / PREVIEW</span><small>Sample experience · schedule TBA</small></div><h4>The producer room</h4><p>A planned conversation format connecting guests with verified producer partners.</p><button onClick={() => setReservationOpen(true)}>Join interest list <Icon name="arrow" size={17}/></button></article>
          </div>
        </div>
      </section>

      <section className="section origins-section" id="origins">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">01 / Global coffee library</p><h2>Begin with<br /><em>a place.</em></h2></div>
          <div className="section-intro"><p>Every coffee is a living record of altitude, variety, climate, processing and people. Explore the current harvest by origin—not by vague flavour labels.</p><button className="text-link" onClick={() => setTraceOpen(true)}>How sourcing works <Icon name="arrow" /></button></div>
        </div>
        <div className="filter-row" role="group" aria-label="Filter coffee origins">
          {["All origins", "Africa", "Americas", "Asia Pacific"].map((item) => <button key={item} className={region === item ? "filter-pill active" : "filter-pill"} onClick={() => setRegion(item)}>{item}</button>)}
        </div>
        <div className="origin-layout">
          <div className="origin-list">
            {visibleOrigins.map((item, index) => (
              <button key={item.id} className={activeOrigin.id === item.id ? "origin-row active" : "origin-row"} onClick={() => setActiveOrigin(item)}>
                <span className="origin-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="origin-code" style={{ background: item.accent }}>{item.code}</span>
                <span className="origin-name"><strong>{item.country}</strong><small>{item.region}</small></span>
                <span className="origin-notes">{item.notes.join(" · ")}</span>
                <span className="origin-arrow"><Icon name="arrow" /></span>
              </button>
            ))}
          </div>
          <aside className="origin-detail" style={{ "--origin-accent": activeOrigin.accent } as React.CSSProperties}>
            <div className="topographic-lines" aria-hidden="true"><i/><i/><i/><i/></div>
            <div className="origin-detail-top"><span>{activeOrigin.code}</span><p>Limited harvest<br />Lot 26.08</p></div>
            <div className="origin-detail-main"><p className="micro-label">Selected origin</p><h3>{activeOrigin.country}</h3><p>{activeOrigin.region}</p></div>
            <div className="note-cloud">{activeOrigin.notes.map((note) => <span key={note}>{note}</span>)}</div>
            <dl>
              <div><dt>Process</dt><dd>{activeOrigin.process}</dd></div>
              <div><dt>Elevation</dt><dd>{activeOrigin.elevation}</dd></div>
              <div><dt>Producer</dt><dd>{activeOrigin.producer}</dd></div>
              <div><dt>Profile roast</dt><dd>{activeOrigin.roast}</dd></div>
            </dl>
            <button className="button button-dark" onClick={() => addToCart({ id: activeOrigin.id, name: `${activeOrigin.country} · ${activeOrigin.region.split(" · ")[0]}`, detail: "Whole bean · 340 g", price: activeOrigin.price, image: "/products/format-whole-bean.webp" })}>Add 340 g · ${activeOrigin.price} <Icon name="plus" /></button>
          </aside>
        </div>
      </section>

      <section className="build-section" id="build">
        <div className="build-intro">
          <p className="eyebrow light">02 / The Deldiet experience</p>
          <h2>Your coffee.<br /><em>Precisely yours.</em></h2>
          <p>Start with a real origin, then make every decision—from extraction to finish. Your recipe is saved as a Brewprint you can order in-store, online or from a Deldiet self-order station.</p>
          <div className="build-meta"><span>Estimated build time</span><strong>45 sec</strong></div>
        </div>
        <div className="cup-builder">
          <div className="builder-progress"><span className="active">Origin</span><i/><span>Drink</span><i/><span>Milk</span><i/><span>Finish</span></div>
          <div className="builder-grid">
            <div className="builder-options">
              <OptionGroup label="01 · Choose an origin" options={cupOptions.origin} value={cup.origin} onChange={(value) => setCup({ ...cup, origin: value })} />
              <OptionGroup label="02 · Choose your drink" options={cupOptions.style} value={cup.style} onChange={(value) => setCup({ ...cup, style: value })} />
              <OptionGroup label="03 · Choose milk" options={cupOptions.milk} value={cup.milk} onChange={(value) => setCup({ ...cup, milk: value })} />
              <OptionGroup label="04 · Choose a finish" options={cupOptions.finish} value={cup.finish} onChange={(value) => setCup({ ...cup, finish: value })} />
              <div className="temperature-toggle" role="group" aria-label="Temperature"><span>05 · Temperature</span>{["Hot", "Iced"].map((item) => <button key={item} className={cup.temperature === item ? "active" : ""} onClick={() => setCup({ ...cup, temperature: item })}>{item}</button>)}</div>
            </div>
            <aside className="cup-receipt">
              <div className={cup.temperature === "Iced" ? "cup-visual iced" : "cup-visual"} aria-hidden="true"><span className="cup-steam one"/><span className="cup-steam two"/><div className="cup-liquid"/></div>
              <p className="micro-label">Your Brewprint</p>
              <h3>{cup.style}</h3>
              <ul><li><span>Origin</span><b>{cup.origin}</b></li><li><span>Milk</span><b>{cup.milk}</b></li><li><span>Finish</span><b>{cup.finish}</b></li><li><span>Serve</span><b>{cup.temperature}</b></li></ul>
              <div className="cup-confidence"><span>Illustrative caffeine range</span><b>{cup.style === "Espresso" ? "60–90 mg" : cup.style === "Cold brew" ? "120–180 mg" : "80–140 mg"}</b><span>Selected milk</span><b>{cup.milk === "No milk" ? "None selected · shared equipment" : cup.milk}</b><span>Preparation time</span><b>Confirmed by the bar</b></div>
              <button className="button button-lime" onClick={() => addToCart({ id: `cup-${Object.values(cup).join("-")}`, name: `Custom ${cup.style}`, detail: `${serviceMode} · ${cup.origin} · ${cup.milk} · ${cup.temperature}`, price: cupPrice, channel: "cafe", image: "/products/cafe-order.webp" })}>Add to coffeehouse order · ${cupPrice.toFixed(2)} <Icon name="plus" /></button>
              <button className="save-recipe" onClick={() => setToast("Brewprint saved on this device")}><Icon name="spark" size={17}/> Save this Brewprint</button>
            </aside>
          </div>
        </div>
      </section>

      <section className="section taste-section" id="tasteprint">
        <div className="taste-card">
          <div className="taste-copy"><p className="eyebrow">Tasteprint™</p><h2>Not sure where<br />to begin?</h2><p>Three choices create a starting profile. We&apos;ll keep learning as you rate each cup.</p></div>
          <div className="taste-quiz">
            <Choice label="I want something" options={["Bright", "Balanced", "Bold"]} value={taste.mood} onChange={(value) => setTaste({ ...taste, mood: value })}/>
            <Choice label="I usually enjoy" options={["Fruit-forward", "Chocolate & nuts", "Floral & tea-like"]} value={taste.note} onChange={(value) => setTaste({ ...taste, note: value })}/>
            <Choice label="I brew with" options={["Pour-over", "Espresso", "French press"]} value={taste.brew} onChange={(value) => setTaste({ ...taste, brew: value })}/>
            <button className="button button-dark" onClick={calculateTasteprint}>Find my coffee <Icon name="arrow" /></button>
            {tasteResult && <div className="taste-result"><span>Your first match</span><strong>{tasteResult}</strong><button onClick={() => { const found = origins.find((item) => tasteResult.includes(item.country)); if (found) setActiveOrigin(found); scrollToId("origins"); }}>View the lot</button></div>}
          </div>
        </div>
      </section>

      <section className="section format-section" id="formats">
        <div className="section-heading split-heading align-end">
          <div><p className="eyebrow">03 / The format library</p><h2>One origin.<br /><em>Every ritual.</em></h2></div>
          <p className="section-intro">Choose your coffee first, then take it home exactly the way you brew: beans, ground, capsules, brew cups, filters, concentrate or ready-to-drink.</p>
        </div>
        <div className="filter-row product-filters" role="group" aria-label="Filter product formats">{formats.map((item) => <button key={item} className={format === item ? "filter-pill active" : "filter-pill"} onClick={() => setFormat(item)}>{item}</button>)}</div>
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className={`product-card tone-${product.tone}`} key={product.id}>
              <div className="product-visual">
                <Image className="catalogue-photo" src={formatImages[product.id]} alt={`${product.name} product photograph`} fill unoptimized sizes="(max-width: 540px) 100vw, (max-width: 820px) 50vw, 25vw" />
              </div>
              <div className="product-info"><div><span>{product.format}</span><h3>{product.name}</h3><p>{product.detail}</p></div><button aria-label={`Add ${product.name} to bag`} onClick={() => addToCart({ id: product.id, name: product.name, detail: product.detail, price: product.price, image: formatImages[product.id] })}><span>${product.price}</span><Icon name="plus" /></button></div>
            </article>
          ))}
        </div>
        <div className="format-spectrum">
          <div><p className="eyebrow">The complete packaging system</p><h3>From roastery shelf<br/>to any machine.</h3></div>
          <div className="format-tags">{["Whole bean bags", "Ground coffee bags", "Refillable tins", "Nespresso Original", "K-Cup compatible", "Dolce Gusto compatible", "ESE 44 mm pods", "Soft coffee pads", "Drip filter bags", "Immersion brew bags", "Instant sticks", "Instant jars", "Cold-brew concentrate", "RTD bottles", "RTD cans", "Nitro", "Foodservice packs", "Wholesale bulk"].map((item, index) => <span key={item}><i>{String(index + 1).padStart(2,"0")}</i>{item}</span>)}</div>
        </div>
        <div className="compatibility-lab">
          <div className="compatibility-copy"><p className="eyebrow light">Machine Match™</p><h3>Tell us what you brew with.</h3><p>Deldiet automatically shows the formats, grind and recipes that work—so the wrong capsule or grind never reaches your bag.</p></div>
          <div className="machine-picker" role="group" aria-label="Choose your brewing equipment">{Object.keys(machineMatches).map((item) => <button key={item} className={machine === item ? "active" : ""} onClick={() => setMachine(item)}>{item}<Icon name="arrow" size={16}/></button>)}</div>
          <div className="machine-results"><span className="micro-label">Your compatible formats</span>{machineMatches[machine].map((item, index) => <div key={item}><i>{index + 1}</i><b>{item}</b><span>Compatible</span></div>)}<button onClick={() => setToast(`${machine} saved to your Passport`)}>Save my brewer <Icon name="plus"/></button></div>
        </div>
      </section>

      <section className="section merch-section" id="merch">
        <div className="section-heading split-heading align-end">
          <div><p className="eyebrow">05 / Deldiet Supply</p><h2>The complete<br /><em>Deldiet store.</em></h2></div>
          <div className="section-intro"><p>Fresh coffee in every format, café drinkware, serious brew gear, apparel, field objects, gift sets and subscriptions—one catalogue, one bag, one Deldiet Passport.</p></div>
        </div>

        <div className="merch-feature">
          <div className="merch-feature-image" role="img" aria-label="Deldiet black hoodie, cream tee, olive cap and natural canvas tote" />
          <div className="merch-feature-copy">
            <span className="drop-label"><i className="live-dot"/> Field collection · Drop 01</span>
            <h3>Uniforms for<br/><em>coffee people.</em></h3>
            <p>Heavyweight, quietly marked and built to live in. The first Deldiet apparel collection carries the same seed emblem used throughout the coffeehouse.</p>
            <div className="feature-products"><button onClick={() => openProduct(retailProducts.find((item) => item.id === "heavy-hoodie")!)}><span>Heavyweight hoodie</span><b>$92</b></button><button onClick={() => openProduct(retailProducts.find((item) => item.id === "origin-tee")!)}><span>Origin field tee</span><b>$42</b></button><button onClick={() => openProduct(retailProducts.find((item) => item.id === "canvas-tote")!)}><span>Market canvas tote</span><b>$32</b></button></div>
            <button className="button button-dark" onClick={() => { setShopCategory("Apparel"); scrollToId("shop-catalogue"); }}>Shop the field collection <Icon name="arrow"/></button>
          </div>
        </div>

        <div className="shop-catalogue" id="shop-catalogue">
          <div className="shop-toolbar">
            <div className="catalogue-title"><span className="micro-label">All merchandise</span><h3>{visibleShopProducts.length} products</h3></div>
            <label className="shop-search"><Icon name="search" size={18}/><input type="search" value={shopSearch} onChange={(event) => setShopSearch(event.target.value)} placeholder="Search coffee, gear, apparel…" aria-label="Search Deldiet shop"/>{shopSearch && <button aria-label="Clear search" onClick={() => setShopSearch("")}><Icon name="close" size={15}/></button>}</label>
          </div>
          <div className="filter-row shop-filters" role="group" aria-label="Filter Deldiet merchandise">{shopCategories.map((item) => <button key={item} className={shopCategory === item ? "filter-pill active" : "filter-pill"} onClick={() => setShopCategory(item)}>{item}</button>)}</div>
          {visibleShopProducts.length === 0 ? <div className="no-results"><span className="brand-seed"/><h3>No objects found.</h3><p>Try a broader term or reset the shop filters.</p><button className="button button-dark" onClick={() => { setShopSearch(""); setShopCategory("All"); }}>Show everything</button></div> : <div className="merch-grid">
            {visibleShopProducts.map((product) => <article className={`merch-card merch-tone-${product.tone}`} key={product.id}>
              <button className="merch-visual" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
                <Image className="catalogue-photo" src={retailImages[product.id]} alt="" fill unoptimized sizes="(max-width: 540px) 100vw, (max-width: 820px) 50vw, 25vw" />
                <span className="merch-code">{product.code}</span>
                {product.badge && <span className="merch-badge">{product.badge}</span>}
                <span className="merch-view">View object <Icon name="arrow" size={15}/></span>
              </button>
              <div className="merch-info"><div><span>{product.category}</span><h4>{product.name}</h4><p>{product.description}</p></div><div className="merch-card-actions"><button onClick={() => openProduct(product)}>Details</button><button aria-label={`Quick add ${product.name}`} onClick={() => addToCart({ id: `shop-${product.id}-${product.variants[0]}`, name: product.name, detail: product.variants[0], price: product.price, channel: "shop", image: retailImages[product.id] })}><b>${product.price}</b><Icon name="plus" size={18}/></button></div></div>
            </article>)}
          </div>}
        </div>

        <div className="store-services">
          <article><span>01 / Never run out</span><h3>Build a subscription</h3><p>Choose discovery or favourites, any format, quantity and cadence. Swap, skip or pause before every shipment.</p><button onClick={() => setToast("Subscription Studio opened")}>Open Subscription Studio <Icon name="arrow"/></button></article>
          <article><span>02 / Make it theirs</span><h3>Gifts that adapt</h3><p>Schedule a box or send a taste quiz. The recipient chooses roast, grind, format and delivery timing.</p><button onClick={() => { setShopCategory("Gifts"); scrollToId("shop-catalogue"); }}>Build a gift <Icon name="arrow"/></button></article>
          <article><span>03 / Coffee for teams</span><h3>Office &amp; hospitality</h3><p>Smart replenishment, equipment, training, consolidated billing and per-location inventory.</p><button onClick={() => setToast("Workplace coffee planner opened")}>Plan a programme <Icon name="arrow"/></button></article>
        </div>

        <div className="store-capability-strip">
          <span><Icon name="clock"/><b>Freshness promise</b><small>Roast and ship dates shown before checkout</small></span>
          <span><Icon name="pin"/><b>Flexible fulfilment</b><small>Ship, local delivery or coffeehouse pickup</small></span>
          <span><Icon name="leaf"/><b>Return &amp; recycle</b><small>Compatibility and local recovery guidance</small></span>
          <span><Icon name="spark"/><b>Passport connected</b><small>Points, lot stamps and one-tap reorders</small></span>
        </div>
      </section>

      <section className="clarity-section" id="clarity">
        <div className="clarity-orbit" aria-hidden="true"><i/><i/><i/><span>C</span></div>
        <div className="clarity-content">
          <p className="eyebrow light">04 / Deldiet function</p>
          <h2>When coffee<br /><em>isn&apos;t the answer.</em></h2>
          <p className="clarity-lede">Clarity is a caffeine-free, black-coffee-flavoured ritual being developed for focused work—without adding another stimulant to your day.</p>
          <div className="ingredient-row"><span><b>L-Tyrosine</b><small>Amino acid</small></span><span><b>L-Theanine</b><small>Tea amino acid</small></span><span><b>Neurofactor™*</b><small>Botanical extract</small></span></div>
          <div className="clarity-actions"><button className="button button-light" onClick={() => addToCart({ id: "clarity", name: "Clarity · Founding batch", detail: "Interest list · 10 sticks", price: 0, image: "/products/clarity-sticks.webp" })}>Join the founding batch <Icon name="arrow" /></button><span>*Final formulation and claims subject to regulatory review.</span></div>
        </div>
      </section>

      <section className="section trace-section" id="trace">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">05 / Proof, not promises</p><h2>Follow every<br /><em>bean home.</em></h2></div>
          <div className="section-intro"><p>Scan the code on a cup or pack to see the lot, producer, process, harvest, roast date and journey. Transparency becomes part of the product—not a paragraph in the footer.</p></div>
        </div>
        <div className="trace-console">
          <div className="trace-map">
            <div className="route-line" aria-hidden="true"><i/><i/><i/><i/><i/></div>
            <div className="trace-title"><span className="micro-label">Live lot journey</span><strong>ET-GUJI-2608</strong></div>
            <div className="trace-stops">
              <span><i>01</i><b>Hambela farm lots</b><small>Guji, Ethiopia</small></span>
              <span><i>02</i><b>Washing station</b><small>Washed · 36 hr</small></span>
              <span><i>03</i><b>Export & arrival</b><small>New harvest</small></span>
              <span><i>04</i><b>Deldiet roastery</b><small>Roasted Aug 04</small></span>
              <span><i>05</i><b>Your cup</b><small>Today</small></span>
            </div>
          </div>
          <div className="trace-panel">
            <p className="micro-label">Look up your coffee</p><h3>Enter a lot code</h3><div className="trace-input"><input aria-label="Lot code" defaultValue="ET-GUJI-2608"/><button onClick={() => setTraceOpen(true)}><Icon name="arrow" /></button></div>
            <div className="trace-proof"><span><Icon name="leaf"/><b>Verified origin</b></span><span><Icon name="clock"/><b>Roast freshness</b></span><span><Icon name="pin"/><b>Journey record</b></span></div>
          </div>
        </div>
      </section>

      <section className="membership-section" id="membership">
        <div className="membership-heading"><p className="eyebrow light">06 / Deldiet Passport</p><h2>A new country,<br /><em>at your cadence.</em></h2><p>Set your taste, format and frequency. Skip, swap or pause any shipment. Every delivery unlocks its origin story and brew guide.</p></div>
        <div className="membership-cards">
          <article><span className="plan-number">01</span><p className="micro-label">Explorer</p><h3>Two origins</h3><p>2 × 250 g or 20 capsules<br/>every four weeks</p><strong>$38<small> / delivery</small></strong><button onClick={() => setToast("Explorer added to your shortlist")}>Choose Explorer <Icon name="arrow" /></button></article>
          <article className="featured"><span className="plan-tag">Most immersive</span><span className="plan-number">02</span><p className="micro-label">Atlas</p><h3>Four origins</h3><p>Four rotating micro-lots, paired<br/>tasting cards and digital cupping</p><strong>$68<small> / delivery</small></strong><button onClick={() => setToast("Atlas added to your shortlist")}>Choose Atlas <Icon name="arrow" /></button></article>
          <article><span className="plan-number">03</span><p className="micro-label">House</p><h3>Your constant</h3><p>Your chosen origin and format<br/>on a schedule that fits</p><strong>from $20<small> / delivery</small></strong><button onClick={() => setToast("House plan added to your shortlist")}>Choose House <Icon name="arrow" /></button></article>
        </div>
        <div className="passport-strip"><div><Icon name="pin"/><span><b>6</b> countries tasted</span></div><div><Icon name="spark"/><span><b>1,240</b> Passport points</span></div><div><Icon name="leaf"/><span><b>4</b> verified lots saved</span></div><div className="passport-next"><span>Next reward</span><b>Rare-lot early access</b><i><em/></i></div></div>
      </section>

      <section className="section ecosystem-section" id="ecosystem">
        <div className="section-heading split-heading"><div><p className="eyebrow">07 / Beyond the cup</p><h2>Deldiet for<br /><em>every table.</em></h2></div><p className="section-intro">A connected coffee system for homes, workplaces, hospitality teams, retailers and producers.</p></div>
        <div className="ecosystem-grid">
          <article><span>01</span><h3>Wholesale studio</h3><p>Curated menus, equipment planning, training, service and live inventory for cafés and hotels.</p><button onClick={() => setToast("Wholesale enquiry opened")}>For hospitality <Icon name="arrow" /></button></article>
          <article><span>02</span><h3>Office coffee</h3><p>Flexible coffee plans by headcount, brewer and team taste—managed from one workplace dashboard.</p><button onClick={() => setToast("Workplace planner opened")}>Plan your workplace <Icon name="arrow" /></button></article>
          <article><span>03</span><h3>Private label</h3><p>Create an origin-led coffee, functional line or gifting programme with Deldiet sourcing and production.</p><button onClick={() => setToast("Private-label brief opened")}>Build a product <Icon name="arrow" /></button></article>
          <article><span>04</span><h3>Cupping room</h3><p>Book guided origin flights, sensory workshops and producer conversations at the Deldiet café.</p><button onClick={() => setToast("Experience calendar opened")}>Book an experience <Icon name="arrow" /></button></article>
        </div>
      </section>

      <section className="journal-banner"><div><p className="eyebrow light">The field journal · No. 08</p><h2>Why altitude<br/>changes everything.</h2><button className="button button-light" onClick={() => setToast("Field Journal is coming next")}>Read the story <Icon name="arrow" /></button></div><div className="journal-rings" aria-hidden="true"><i/><i/><i/><i/></div></section>

      <footer>
        <div className="footer-top"><div><div className="footer-brand"><span className="brand-seed"/>deldiet</div><p>The world in your cup.<br/>St. John&apos;s · Newfoundland</p></div><div><span>Explore</span><button onClick={() => scrollToId("origins")}>Coffee origins</button><button onClick={() => { window.location.href = "/origin-bar"; }}>Origin Bar</button><button onClick={() => scrollToId("build")}>Build a cup</button><button onClick={() => { window.location.href = "/origin-exchange"; }}>Origin Exchange</button><button onClick={() => scrollToId("formats")}>All formats</button><button onClick={() => scrollToId("trace")}>Trace a lot</button></div><div><span>Deldiet</span><button onClick={() => setToast("Our sourcing page is coming next")}>Our sourcing</button><button onClick={() => setToast("Wholesale studio opened")}>Wholesale</button><button onClick={() => setToast("Producer portal opened")}>Producer portal</button><button onClick={() => setToast("Careers page opened")}>Careers</button></div><div className="newsletter"><span>From origin to inbox</span><p>New harvests, café experiences and field notes. No noise.</p><div><input aria-label="Email address" placeholder="Email address" type="email"/><button aria-label="Subscribe" onClick={() => setToast("Welcome to the field notes")}><Icon name="arrow" /></button></div></div></div>
        <div className="footer-bottom"><span>© 2026 Deldiet Coffee Company</span><span>Canada / CAD</span><span>Privacy · Terms · Accessibility</span></div>
      </footer>

      <button className="concierge-button" onClick={() => setConciergeOpen(!conciergeOpen)} aria-expanded={conciergeOpen}><Icon name="spark"/><span>Ask Deldiet</span></button>
      {conciergeOpen && <div className="concierge-panel"><div><span><Icon name="spark"/> Coffee concierge</span><button aria-label="Close concierge" onClick={() => setConciergeOpen(false)}><Icon name="close"/></button></div><h3>What are you in the mood for?</h3><p>I can match an origin, help with a brewer, rebuild a café favourite or explain any lot.</p><div className="quick-prompts"><button onClick={() => { setTaste({ ...taste, note: "Chocolate & nuts" }); setConciergeOpen(false); scrollToId("origins"); }}>Smooth & chocolatey</button><button onClick={() => { setCup({ ...cup, style: "Flat white" }); setConciergeOpen(false); scrollToId("build"); }}>Build a flat white</button><button onClick={() => { setConciergeOpen(false); scrollToId("trace"); }}>Trace my coffee</button></div><div className="concierge-input"><input aria-label="Ask Deldiet" placeholder="Ask about coffee…"/><button aria-label="Send"><Icon name="arrow"/></button></div><small>Concierge preview · human support always available</small></div>}

      {cartOpen && <>
        <button className="drawer-backdrop" aria-label="Close bag" onClick={() => setCartOpen(false)}/>
        <aside className="cart-drawer" aria-label="Deldiet orders">
          <div className="drawer-header"><div><p className="micro-label">One bag · split fulfilment</p><h2>Your Deldiet · {cartCount}</h2></div><button aria-label="Close bag" onClick={() => setCartOpen(false)}><Icon name="close"/></button></div>
          {cart.length === 0 ? <div className="empty-cart"><div className="empty-bean"/><h3>Your bag is waiting.</h3><p>Start a coffeehouse order or explore the full Deldiet store.</p><div className="empty-actions"><button className="button button-dark" onClick={() => { setCartOpen(false); scrollToId("coffeehouse"); }}>Order a drink</button><button className="button" onClick={() => { setCartOpen(false); scrollToId("merch"); }}>Shop online</button></div></div> : <>
            <div className="cart-items split-cart">
              {cafeCart.length > 0 && <section className="cart-channel"><div className="cart-channel-head"><span><Icon name="pin" size={17}/><b>Coffeehouse order preview</b></span><small>{serviceMode} · St. John&apos;s concept</small></div>{cafeCart.map((item) => <article key={item.id}><div className="cart-thumb cafe"><Image src={resolveCartImage(item)} alt="" fill unoptimized sizes="66px" /></div><div><h3>{item.name}</h3><p>{item.detail}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={15}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={15}/></button></div></div><strong>${(item.price * item.quantity).toFixed(2)}</strong></article>)}<div className="channel-subtotal"><span>Illustrative prepared-order subtotal</span><b>${cafeTotal.toFixed(2)}</b></div></section>}
              {shopCart.length > 0 && <section className="cart-channel"><div className="cart-channel-head"><span><Icon name="bag" size={17}/><b>Online shop</b></span><small>Ship, deliver or pick up</small></div>{shopCart.map((item) => <article key={item.id}><div className="cart-thumb"><Image src={resolveCartImage(item)} alt="" fill unoptimized sizes="66px" /></div><div><h3>{item.name}</h3><p>{item.detail}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={15}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={15}/></button></div></div><strong>{item.price === 0 ? "—" : `$${(item.price * item.quantity).toFixed(2)}`}</strong></article>)}<div className="channel-subtotal"><span>Shippable subtotal</span><b>${shopTotal.toFixed(2)}</b></div></section>}
            </div>
            <div className="cart-summary"><div><span>Combined merchandise value</span><strong>${cartTotal.toFixed(2)}</strong></div><p>Prepared items and shippable products keep separate fulfilment and checkout timing.</p>{cafeCart.length > 0 && <button className="button button-lime" onClick={() => setToast("Coffeehouse checkout is ready for POS connection")}>Place coffeehouse order <Icon name="arrow"/></button>}{shopCart.length > 0 && <button className="button button-dark" onClick={() => setToast("Online checkout is ready for your payment and shipping providers")}>Checkout shop items <Icon name="arrow"/></button>}</div>
          </>}
        </aside>
      </>}

      {reservationOpen && <div className="modal-wrap" role="dialog" aria-modal="true" aria-labelledby="reservation-title"><button className="modal-backdrop" aria-label="Close reservation" onClick={() => setReservationOpen(false)}/><div className="reservation-modal"><button className="modal-close" aria-label="Close" onClick={() => setReservationOpen(false)}><Icon name="close"/></button><div className="reservation-copy"><p className="eyebrow light">St. John&apos;s flagship concept</p><h2 id="reservation-title">Make room<br/><em>for coffee.</em></h2><p>Preview table, guided-flight and experience requests. Dates, location and availability become bookable only after the reservation service is connected.</p><div><span><i className="live-dot"/><b>Interest-list mode</b></span><span><Icon name="clock" size={17}/><b>No live availability yet</b></span></div></div><div className="reservation-form"><label><span>Visit type</span><select defaultValue="Table reservation"><option>Table reservation</option><option>East Africa cupping table</option><option>Home espresso clinic</option><option>The producer room</option><option>Private tasting</option></select></label><div><label><span>Preferred date</span><input type="date"/></label><label><span>Party</span><select defaultValue="2 people"><option>1 person</option><option>2 people</option><option>3 people</option><option>4 people</option><option>5–8 people</option></select></label></div><label><span>Preferred time</span><div className="reservation-times">{["Morning", "Midday", "Afternoon", "Evening"].map((time) => <button type="button" key={time} className={reservationTime === time ? "active" : ""} onClick={() => setReservationTime(time)}>{time}</button>)}</div></label><label><span>Name</span><input placeholder="Your name"/></label><label><span>Email</span><input type="email" placeholder="you@example.com"/></label><button className="button button-lime" onClick={() => { setReservationOpen(false); setToast(`Interest recorded for ${reservationTime} · demo only`); }}>Preview interest request <Icon name="arrow"/></button><small>Interactive prototype: this does not create a live reservation or charge a card.</small></div></div></div>}

      {selectedProduct && <div className="modal-wrap" role="dialog" aria-modal="true" aria-labelledby="product-title"><button className="modal-backdrop" aria-label="Close product" onClick={() => setSelectedProduct(null)}/><div className="product-modal"><button className="modal-close" aria-label="Close" onClick={() => setSelectedProduct(null)}><Icon name="close"/></button><div className={`product-modal-art merch-tone-${selectedProduct.tone}`}><Image className="catalogue-photo" src={retailImages[selectedProduct.id]} alt={`${selectedProduct.name} product photograph`} fill unoptimized sizes="(max-width: 820px) 100vw, 50vw" /><span className="merch-code">{selectedProduct.code}</span>{selectedProduct.badge && <span className="merch-badge">{selectedProduct.badge}</span>}<div className="product-art-meta"><span>Object / {selectedProduct.id}</span><span>Designed for the Deldiet system</span></div></div><div className="product-modal-info"><p className="eyebrow">{selectedProduct.category}</p><h2 id="product-title">{selectedProduct.name}</h2><p className="product-description">{selectedProduct.description}</p><div className="product-price"><b>${selectedProduct.price}</b><span>CAD · taxes calculated at checkout</span></div><fieldset className="variant-picker"><legend>Choose an option</legend>{selectedProduct.variants.map((variant) => <button type="button" key={variant} className={selectedVariant === variant ? "active" : ""} onClick={() => setSelectedVariant(variant)}>{variant}<span/></button>)}</fieldset><div className="fulfilment-card"><Icon name="pin"/><div><b>Fulfilment</b><p>{selectedProduct.fulfilment}</p><span>Ship · local delivery · coffeehouse pickup, when eligible</span></div></div><button className="button button-lime" onClick={() => { addToCart({ id: `shop-${selectedProduct.id}-${selectedVariant}`, name: selectedProduct.name, detail: selectedVariant, price: selectedProduct.price, channel: "shop", image: retailImages[selectedProduct.id] }); setSelectedProduct(null); }}>Add to shop bag · ${selectedProduct.price} <Icon name="plus"/></button><button className="product-save" onClick={() => setToast(`${selectedProduct.name} saved to your Passport`)}><Icon name="spark" size={17}/> Save for later</button></div></div></div>}

      {traceOpen && <div className="modal-wrap" role="dialog" aria-modal="true" aria-labelledby="trace-modal-title"><button className="modal-backdrop" aria-label="Close trace details" onClick={() => setTraceOpen(false)}/><div className="trace-modal"><button className="modal-close" aria-label="Close" onClick={() => setTraceOpen(false)}><Icon name="close"/></button><p className="eyebrow">Verified lot record</p><h2 id="trace-modal-title">Ethiopia · Guji</h2><p className="modal-lede">Lot ET-GUJI-2608 connects the coffee in your hand to its place, process and roast record.</p><div className="record-grid"><div><span>Origin</span><b>Hambela, Guji</b></div><div><span>Harvest</span><b>2025/26 main crop</b></div><div><span>Process</span><b>Washed</b></div><div><span>Roasted</span><b>04 Aug 2026</b></div><div><span>Roast profile</span><b>Light · filter</b></div><div><span>Freshness window</span><b>07–28 days</b></div></div><div className="record-note"><Icon name="leaf"/><p><b>What this record will include at launch</b><br/>Producer identity and consent, farm or cooperative, variety, elevation, processing detail, purchase transparency, quality score, shipment and roast data.</p></div><button className="button button-dark" onClick={() => { setTraceOpen(false); setToast("Lot record saved to your Passport"); }}>Save to my Passport <Icon name="plus"/></button></div></div>}
      {toast && <div className="toast" role="status"><span className="brand-seed"/>{toast}</div>}
    </main>
  );
}

function OptionGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <fieldset className="option-group"><legend>{label}</legend><div>{options.map((option) => <button type="button" key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}><span>{option}</span>{value === option && <i/>}</button>)}</div></fieldset>;
}

function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="choice"><span>{label}</span><div>{options.map((option) => <button key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}</button>)}</div></div>;
}
