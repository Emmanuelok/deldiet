"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { OriginAtlas, type AtlasOrigin as Origin } from "./design/origins-atlas";
import Image from "next/image";
import CoffeeAtHome from "./design/formats";
import { ShopProductSheet, ShopSpread } from "./design/shop";
import Link from "next/link";
import HomeCounter from "./design/home-counter";
import DepartmentMasthead, {type Department} from "./design/department-masthead";
import "./design/editorial.css";
import "./design/coffeehouse.css";
import "./design/shop.css";
import "./design/origins.css";
import "./design/builder.css";
import "./design/formats.css";
import "./design/guides.css";
import "./design/stories.css";
import CupStudio from "./design/builder";
import { BusinessGuide, ClarityGuide, StandardsGuide, TraceGuide } from "./design/guides";
import { createIdempotencyKey, submitServiceRequest, type ServiceRequestInput } from "@/lib/request-client";
import Coffeehouse, { type CafeItem } from "./design/coffeehouse";
import { DiscoverRoutes, EventProgramme, FieldJournal, TasteFinder, type JourneyIntent } from "./design/stories";

const socialProfiles = [
  { name: "Instagram", icon: "instagram", href: "https://www.instagram.com/deldietcoffee/" },
  { name: "X", icon: "x", href: "https://x.com/deldietcoffee" },
  { name: "YouTube", icon: "youtube", href: "https://www.youtube.com/@deldietcoffee" },
] as const;

type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
  channel: "cafe" | "shop";
  image?: string;
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
  { id: "americano", name: "Americano", detail: "Double espresso · hot water", category: "Espresso bar", price: 4.25 },
  { id: "piccolo", name: "Piccolo", detail: "Ristretto · silky milk · 120 ml", category: "Espresso bar", price: 4.5 },
  { id: "long-black", name: "Long black", detail: "Hot water · double espresso", category: "Espresso bar", price: 4.5 },
  { id: "guji-pour", name: "Guji pour-over", detail: "Jasmine · bergamot · peach", category: "Brew bar", price: 7.5, tag: "Barista pick" },
  { id: "origin-flight", name: "Origin flight", detail: "Three 120 ml coffees · guided card", category: "Brew bar", price: 12 },
  { id: "jebena", name: "Jebena service", detail: "Ethiopian-style shared coffee ritual", category: "Brew bar", price: 18, tag: "For two" },
  { id: "daily-v60", name: "Daily V60", detail: "Rotating verified lot · hand poured", category: "Brew bar", price: 6.75 },
  { id: "batch-brew", name: "Field batch brew", detail: "Seasonal origin · brewed throughout service", category: "Brew bar", price: 4.25 },
  { id: "cold-brew", name: "Cold brew", detail: "18-hour extraction · still", category: "Cold", price: 5.75 },
  { id: "flash-brew", name: "Flash brew", detail: "Bright seasonal origin · over ice", category: "Cold", price: 6.25 },
  { id: "espresso-tonic", name: "Espresso tonic", detail: "Citrus tonic · espresso · orange", category: "Cold", price: 6.5 },
  { id: "nitro-cold", name: "Nitro cold brew", detail: "Slow steep · nitrogen texture", category: "Cold", price: 6.5 },
  { id: "orange-blossom-cold", name: "Orange blossom cold brew", detail: "Cold brew · orange blossom · tonic", category: "Cold", price: 6.75, tag: "Deldiet" },
  { id: "harbour-mocha", name: "Harbour mocha", detail: "Single-origin cacao · sea salt", category: "Signatures", price: 6.75, tag: "Deldiet" },
  { id: "maple-cardamom", name: "Maple cardamom latte", detail: "Pure maple · green cardamom", category: "Signatures", price: 6.5, tag: "Deldiet" },
  { id: "honey-oat", name: "Honey oat latte", detail: "Wildflower honey · oat · cinnamon", category: "Signatures", price: 6.5, tag: "Deldiet" },
  { id: "saffron-vanilla", name: "Saffron vanilla flat white", detail: "Vanilla bean · saffron · microfoam", category: "Signatures", price: 7, tag: "Deldiet" },
  { id: "cascara-spritz", name: "Cascara spritz", detail: "Coffee cherry · hibiscus · soda", category: "Signatures", price: 5.75 },
  { id: "single-cacao", name: "Single-origin chocolate", detail: "Ecuador cacao · steamed milk", category: "Beyond coffee", price: 5.5 },
  { id: "masala-chai", name: "Masala chai", detail: "Whole spices · Assam tea · milk", category: "Beyond coffee", price: 5.5 },
  { id: "hibiscus-cooler", name: "Hibiscus cooler", detail: "Hibiscus · citrus · mint", category: "Beyond coffee", price: 4.75 },
  { id: "ceremonial-matcha", name: "Matcha latte", detail: "Ceremonial-style matcha · milk", category: "Beyond coffee", price: 6 },
  { id: "hojicha", name: "Hojicha latte", detail: "Roasted green tea · milk · maple", category: "Beyond coffee", price: 6 },
  { id: "lemon-ginger", name: "Lemon ginger tisane", detail: "Fresh ginger · lemon · honey", category: "Beyond coffee", price: 4.75 },
  { id: "london-fog", name: "Vanilla Earl Grey", detail: "Earl Grey · vanilla bean · steamed milk", category: "Beyond coffee", price: 5.75 },
  { id: "croissant", name: "Butter croissant", detail: "Laminated in-house · baked daily", category: "Bakery", price: 4.25 },
  { id: "morning-bun", name: "Cocoa morning bun", detail: "Cacao nib · brown sugar", category: "Bakery", price: 4.75 },
  { id: "almond-croissant", name: "Almond croissant", detail: "Almond cream · toasted almond", category: "Bakery", price: 5.5 },
  { id: "blueberry-scone", name: "Blueberry lemon scone", detail: "Wild blueberry · lemon zest", category: "Bakery", price: 4.75 },
  { id: "breakfast-bun", name: "Deldiet breakfast bun", detail: "Egg · aged cheddar · tomato relish", category: "Breakfast", price: 8.5 },
  { id: "oat-bowl", name: "Maple field oats", detail: "Rolled oats · berries · seeds · maple", category: "Breakfast", price: 7.75 },
  { id: "mushroom-melt", name: "Mushroom melt", detail: "Roasted mushroom · cheddar · sourdough", category: "Lunch", price: 10.5 },
  { id: "harissa-chicken", name: "Harissa chicken ciabatta", detail: "Roasted chicken · harissa · greens", category: "Lunch", price: 11.75 },
  { id: "cucumber-labneh", name: "Cucumber labneh toast", detail: "Labneh · cucumber · dill · sourdough", category: "Lunch", price: 9.75 },
];

const cafeCategories = ["All", "Espresso bar", "Brew bar", "Cold", "Signatures", "Beyond coffee", "Breakfast", "Lunch", "Bakery"];

const cafeMenuVisuals = {
  hot: { src: "/menu/deldiet-hot-cup.webp", width: 341, height: 520 },
  cold: { src: "/menu/deldiet-cold-cup.webp", width: 306, height: 560 },
  bakery: { src: "/menu/deldiet-takeaway-bag.webp", width: 480, height: 480 },
} as const;

const cafeMenuVisualFor = (item: CafeItem): keyof typeof cafeMenuVisuals => {
  if (["Bakery", "Breakfast", "Lunch"].includes(item.category)) return "bakery";
  if (item.category === "Cold" || item.id === "cascara-spritz" || item.id === "hibiscus-cooler") return "cold";
  return "hot";
};

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


function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7V4h6v3"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>,
    diagonal: <><path d="M6 18 18 6M6 6h12v12"/></>,
    sunburst: <><path d="M12 1v22M1 12h22M4.2 4.2l15.6 15.6M19.8 4.2 4.2 19.8"/></>,
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
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
    x: <><path d="m4 3 12.5 18H20L7.5 3H4Z"/><path d="m20 3-7 8M4 21l7-8"/></>,
    youtube: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function DeldietMark({ className = "" }: { className?: string }) {
  return (
    <span className={`deldiet-product-mark ${className}`.trim()} aria-hidden="true">
      <Image src="/brand/deldiet-wordmark.png" alt="" width={432} height={129} unoptimized />
    </span>
  );
}

function AccessibleDialog({ labelledBy, onClose, children }: { labelledBy: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector = "button:not([disabled]):not([tabindex='-1']), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]:not([tabindex='-1']), [tabindex]:not([tabindex='-1'])";
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, []);

  return <div ref={dialogRef} className="modal-wrap" role="dialog" aria-modal="true" aria-labelledby={labelledBy}><button className="modal-backdrop" tabIndex={-1} aria-label="Close dialog" onClick={onClose}/>{children}</div>;
}

export type DeldietView =
  | "home"
  | "discover"
  | "coffeehouse"
  | "events"
  | "origins"
  | "build"
  | "tasteprint"
  | "formats"
  | "shop"
  | "standards"
  | "clarity"
  | "trace"
  | "business"
  | "journal";

function hasDepartmentMasthead(view: DeldietView): view is Department {
  return ["discover", "events", "tasteprint", "journal", "standards", "clarity", "trace", "business"].includes(view);
}

export default function DeldietExperience({ view = "home" }: { view?: DeldietView }) {
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
  const [machine, setMachine] = useState("Whole bean grinder");
  const [serviceMode, setServiceMode] = useState("Pickup now");
  const [shopCategory, setShopCategory] = useState("All");
  const [shopSearch, setShopSearch] = useState("");
  const [reservationOpen, setReservationOpen] = useState(false);
  const [visitType, setVisitType] = useState("Table reservation");
  const [reservationTime, setReservationTime] = useState("Morning");
  const [selectedProduct, setSelectedProduct] = useState<RetailProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [journeyIntent, setJourneyIntent] = useState<JourneyIntent>("taste");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [conciergeMessage, setConciergeMessage] = useState("");
  const [conciergeEmail, setConciergeEmail] = useState("");
  const [cartReviewChannel, setCartReviewChannel] = useState<"cafe" | "shop" | null>(null);
  const [reviewContact, setReviewContact] = useState({ name: "", email: "", phone: "" });
  const [requestPending, setRequestPending] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestErrorScope, setRequestErrorScope] = useState("");
  const [lastReceipt, setLastReceipt] = useState<{ reference: string; message: string } | null>(null);
  const requestKeysRef = useRef<Record<string, { key: string; fingerprint: string }>>({});
  const requestInFlightRef = useRef(new Set<string>());
  const mobileMenuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    const video = heroVideoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;

    const syncPlaybackState = () => {
      if (!cancelled) setHeroPlaying(!video.paused && !video.ended);
    };
    const startMotion = async () => {
      if (reducedMotion.matches) {
        video.pause();
        syncPlaybackState();
        return;
      }
      video.muted = true;
      try {
        await video.play();
      } catch {
        // Mobile browsers can block autoplay in low-power or data-saving modes.
      }
      syncPlaybackState();
    };
    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        video.pause();
        syncPlaybackState();
      } else {
        void startMotion();
      }
    };

    video.addEventListener("play", syncPlaybackState);
    video.addEventListener("pause", syncPlaybackState);
    video.addEventListener("ended", syncPlaybackState);
    reducedMotion.addEventListener("change", handleMotionPreference);
    void startMotion();

    return () => {
      cancelled = true;
      video.removeEventListener("play", syncPlaybackState);
      video.removeEventListener("pause", syncPlaybackState);
      video.removeEventListener("ended", syncPlaybackState);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const mobileQuery = window.matchMedia("(max-width: 1020px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    mobileQuery.addEventListener("change", closeAtDesktop);
    if (!mobileQuery.matches) {
      const closeFrame = window.requestAnimationFrame(() => setMenuOpen(false));
      return () => {
        window.cancelAnimationFrame(closeFrame);
        mobileQuery.removeEventListener("change", closeAtDesktop);
      };
    }
    const previousOverflow = document.body.style.overflow;
    const shell = document.getElementById("main-content");
    const pageNodes = Array.from(shell?.children || []).filter((node): node is HTMLElement => node instanceof HTMLElement && !node.matches(".site-header"));
    const headerNodes = Array.from(document.querySelectorAll<HTMLElement>(".site-header > .brand, .header-actions > :not(.menu-button)"));
    const backgroundNodes = [...pageNodes, ...headerNodes];
    const previousInert = backgroundNodes.map((node) => node.inert);
    backgroundNodes.forEach((node) => { node.inert = true; });
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => mobileMenuRef.current?.querySelector<HTMLElement>("a")?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const navItems = Array.from(mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []);
      const menuButton = menuButtonRef.current;
      const firstNav = navItems[0];
      const lastNav = navItems[navItems.length - 1];
      if (!menuButton || !firstNav || !lastNav) return;
      if (event.shiftKey && document.activeElement === menuButton) {
        event.preventDefault();
        lastNav.focus();
      } else if (event.shiftKey && document.activeElement === firstNav) {
        event.preventDefault();
        menuButton.focus();
      } else if (!event.shiftKey && document.activeElement === menuButton) {
        event.preventDefault();
        firstNav.focus();
      } else if (!event.shiftKey && document.activeElement === lastNav) {
        event.preventDefault();
        menuButton.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      mobileQuery.removeEventListener("change", closeAtDesktop);
      backgroundNodes.forEach((node, index) => { node.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const visibleOrigins = region === "All origins" ? origins : origins.filter((item) => item.continent === region);
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

  function updateLocalPassport(update: Record<string, unknown>, message: string) {
    try {
      const stored = JSON.parse(window.localStorage.getItem("deldiet-passport-v1") || "{}") as Record<string, unknown>;
      window.localStorage.setItem("deldiet-passport-v1", JSON.stringify({ ...stored, ...update }));
      setToast(message);
    } catch {
      setToast("This device could not update the local Passport preview");
    }
  }

  function saveProductToPassport(product: RetailProduct) {
    let savedProducts: string[] = [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("deldiet-passport-v1") || "{}") as { savedProducts?: unknown };
      if (Array.isArray(stored.savedProducts)) savedProducts = stored.savedProducts.filter((item): item is string => typeof item === "string");
    } catch { /* start a clean local preview */ }
    updateLocalPassport({ savedProducts: [...new Set([...savedProducts, product.id])].slice(-20) }, `${product.name} saved to this device’s Passport preview`);
  }

  function updateQuantity(id: string, delta: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }

  async function toggleHeroMotion() {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = true;
      try {
        await video.play();
        setHeroPlaying(true);
      } catch {
        setHeroPlaying(false);
        setToast("Motion could not start on this device. Check Low Power or data-saving mode.");
      }
    } else {
      video.pause();
      setHeroPlaying(false);
    }
  }

  async function saveRequest(scope: string, input: ServiceRequestInput) {
    if (requestInFlightRef.current.size > 0) return null;
    const fingerprint = JSON.stringify(input);
    const existing = requestKeysRef.current[scope];
    const key = existing?.fingerprint === fingerprint ? existing.key : createIdempotencyKey(scope);
    requestKeysRef.current[scope] = { key, fingerprint };
    requestInFlightRef.current.add(scope);
    setRequestPending(scope);
    setRequestError("");
    setRequestErrorScope("");
    try {
      const receipt = await submitServiceRequest(input, key);
      delete requestKeysRef.current[scope];
      setLastReceipt({ reference: receipt.reference, message: receipt.message });
      return receipt;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 409) delete requestKeysRef.current[scope];
      setRequestError(error instanceof Error ? error.message : "We could not save this request. Your details are still here—please try again.");
      setRequestErrorScope(scope);
      return null;
    } finally {
      requestInFlightRef.current.delete(scope);
      setRequestPending("");
    }
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const receipt = await saveRequest("home-reservation", {
      type: "reservation",
      source: "home-reservation",
      customer: { name: String(data.get("name") || ""), email: String(data.get("email") || "") },
      payload: {
        visitType: String(data.get("visitType") || ""),
        preferredDate: String(data.get("preferredDate") || ""),
        party: String(data.get("party") || ""),
        preferredTime: reservationTime,
        availabilityState: "interest_list_no_live_inventory",
      },
    });
    if (!receipt) return;
    setReservationOpen(false);
    setToast(`Interest request saved · ${receipt.reference}`);
    form.reset();
  }

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const receipt = await saveRequest("home-newsletter", {
      type: "newsletter",
      source: "home-footer",
      customer: { email: newsletterEmail },
      payload: { list: "field-notes", consent: true },
    });
    if (!receipt) return;
    setNewsletterEmail("");
    setToast(`Field Notes signup saved · ${receipt.reference}`);
  }

  async function submitConcierge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const receipt = await saveRequest("home-concierge", {
      type: "concierge",
      source: "home-concierge",
      customer: { email: conciergeEmail },
      payload: {
        message: conciergeMessage,
        journeyIntent,
        activeOriginId: activeOrigin.id,
        machine,
        serviceMode,
      },
    });
    if (!receipt) return;
    setConciergeMessage("");
    setConciergeEmail("");
    setConciergeOpen(false);
    setToast(`Question saved · ${receipt.reference}`);
  }

  async function submitHomeOrderReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cartReviewChannel) return;
    const reviewItems = (cartReviewChannel === "cafe" ? cafeCart : shopCart).map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail,
      quantity: item.quantity,
      channel: item.channel,
      cataloguePriceSnapshotCents: Math.round(item.price * 100),
    }));
    const estimatedSubtotal = cartReviewChannel === "cafe" ? cafeTotal : shopTotal;
    const receipt = await saveRequest(`home-order-${cartReviewChannel}`, {
      type: "home_order_review",
      source: `home-${cartReviewChannel}-cart`,
      customer: reviewContact,
      estimatedSubtotalCents: Math.round(estimatedSubtotal * 100),
      payload: {
        items: reviewItems,
        channel: cartReviewChannel,
        ...(cartReviewChannel === "cafe" ? { serviceMode } : {}),
        pricingState: "illustrative_pending_staff_review",
      },
    });
    if (!receipt) return;
    setCartReviewChannel(null);
    setReviewContact({ name: "", email: "", phone: "" });
    setCartOpen(false);
    setToast(`${cartReviewChannel === "cafe" ? "Coffeehouse" : "Shop"} review saved · ${receipt.reference}`);
  }


  return (
    <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <main id="main-content" className={`deldiet-home ed-shell view-${view}`}>
      <header className="site-header">
        <Link className="brand" aria-label="Deldiet home" href="/">
          <Image className="brand-logo-image" src="/brand/deldiet-wordmark.png" alt="Deldiet" width={432} height={129} priority unoptimized />
        </Link>
        <nav ref={mobileMenuRef} id="primary-navigation" className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Primary navigation">
          <a href="/coffeehouse" aria-current={view === "coffeehouse" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Coffeehouse</a>
          <a href="/origins" aria-current={view === "origins" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Origins</a>
          <a href="/build-a-cup" aria-current={view === "build" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Build a cup</a>
          <a href="/origin-bar" onClick={() => setMenuOpen(false)}>Origin Bar</a>
          <a href="/coffee-at-home" aria-current={view === "formats" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Coffee at home</a>
          <a href="/shop" aria-current={view === "shop" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="/origin-exchange" onClick={() => setMenuOpen(false)}>Exchange</a>
          <a className="mobile-nav-extra" href="/shop#shop-catalogue" onClick={() => setMenuOpen(false)}>Search the shop</a>
          <a className="mobile-nav-extra" href="/passport" onClick={() => setMenuOpen(false)}>Deldiet Passport</a>
        </nav>
        <div className="header-actions">
          <a className="icon-button desktop-only" aria-label="Search the Deldiet shop" href="/shop#shop-catalogue"><Icon name="search" /></a>
          <a className="icon-button desktop-only" aria-label="Open Deldiet Passport" href="/passport"><Icon name="user" /></a>
          <button className="bag-button" aria-label={`Shopping bag with ${cartCount} items`} onClick={() => { setMenuOpen(false); setCartOpen(true); }}>
            <Icon name="bag" /><span>{cartCount}</span>
          </button>
          <button ref={menuButtonRef} className="menu-button" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
        </div>
      </header>

      {hasDepartmentMasthead(view) && <DepartmentMasthead view={view}/>}

      {view === "home" && <>
        <section className="ed-film" aria-labelledby="hero-title">
          <video
            ref={heroVideoRef}
            className="hero-video"
            muted
            loop
            playsInline
            preload="auto"
            poster="/deldiet-hero-motion-poster.webp"
            aria-hidden="true"
            onPlay={() => setHeroPlaying(true)}
            onPause={() => setHeroPlaying(false)}
            onError={() => setHeroPlaying(false)}
          >
            <source media="(max-width: 640px)" src="/deldiet-hero-motion-mobile.mp4" type="video/mp4" />
            <source src="/deldiet-hero-motion.mp4" type="video/mp4" />
          </video>
          <div className="ed-film-veil" />
          <div className="ed-film-inner">
            <p className="ed-kicker"><i aria-hidden="true"/> Specialty coffee <span aria-hidden="true">/</span> St. John’s, NL</p>
            <h1 id="hero-title">Coffee<br/><em>without borders.</em></h1>
            <p className="ed-film-deck">Follow a bean from its origin to your cup. Find your flavour, then make it yours.</p>
            <div className="ed-film-actions">
              <a href="/build-a-cup" className="ed-primary">Build a cup <Icon name="arrow" /></a>
              <a href="/origins" className="ed-link">Explore origins <Icon name="diagonal" size={18}/></a>
            </div>
          </div>
          <div className="ed-film-transport">
            <a href="#tasting-counter" className="ed-scroll"><span aria-hidden="true">↓</span> Discover your flavour</a>
            <button type="button" className="hero-mobile-motion" aria-label={heroPlaying ? "Pause cinematic hero motion" : "Play cinematic hero motion"} aria-pressed={heroPlaying} onClick={toggleHeroMotion}>
              <span className="ed-film-round"><Icon name={heroPlaying ? "pause" : "play"} size={18} /></span>
              <span>{heroPlaying ? "Pause film" : "Play film"}</span>
            </button>
          </div>
        </section>
        <a className="ed-menu-strip" href="/coffeehouse#cafe-menu">
          <span><span className="ed-sun" aria-hidden="true"><Icon name="sunburst" size={30}/></span> At the coffeehouse</span>
          <span className="ed-menu-sample">Espresso <i/> Pour-over <i/> Cold brew</span>
          <span className="ed-menu-end">See the menu <Icon name="arrow" size={19}/></span>
        </a>
        <HomeCounter origins={origins}/>
      </>}

      {view === "discover" && <DiscoverRoutes intent={journeyIntent} onIntent={setJourneyIntent}/>}

      {view === "coffeehouse" && <Coffeehouse
        menu={cafeMenu}
        categories={cafeCategories}
        serviceMode={serviceMode}
        orderCount={cartCount}
        visualFor={(item) => cafeMenuVisuals[cafeMenuVisualFor(item)]}
        onServiceChange={setServiceMode}
        onAdd={(item) => addToCart({
          id: `cafe-${serviceMode}-${item.id}`,
          name: item.name,
          detail: `${serviceMode} · ${item.detail}`,
          price: item.price,
          channel: "cafe",
          image: cafeMenuVisuals[cafeMenuVisualFor(item)].src,
        })}
        onOpenBag={() => setCartOpen(true)}
        onPlanVisit={() => setReservationOpen(true)}
      />}

      {view === "events" && <EventProgramme onRegister={(session) => { setVisitType(session); setReservationOpen(true); }}/>}

      {view === "origins" && <OriginAtlas
        origins={origins}
        visible={visibleOrigins}
        selected={activeOrigin}
        region={region}
        onSelect={setActiveOrigin}
        onRegion={setRegion}
        onTrace={() => setTraceOpen(true)}
        onAdd={(item) => addToCart({ id: item.id, name: `${item.country} · ${item.region.split(" · ")[0]}`, detail: "Whole bean · 340 g", price: item.price, image: "/products/format-whole-bean.webp" })}
      />}

      {view === "build" && <CupStudio origins={origins} serviceMode={serviceMode} onAdd={addToCart} notify={setToast} />}

      {view === "tasteprint" && <TasteFinder origins={origins}/>}

      {view === "formats" && <CoffeeAtHome
        products={products}
        images={formatImages}
        filters={formats}
        machine={machine}
        onMachineChange={setMachine}
        filter={format}
        onFilterChange={setFormat}
        onAdd={(product) => addToCart({ id: product.id, name: product.name, detail: product.detail, price: product.price, image: formatImages[product.id] })}
        onSave={(brewer) => updateLocalPassport({ brewer }, `${machine} saved to this device’s Passport preview`)}
      />}

      {view === "shop" && (
        <ShopSpread
          products={retailProducts} visibleProducts={visibleShopProducts} photos={retailImages}
          categories={shopCategories} category={shopCategory} query={shopSearch}
          onCategory={setShopCategory} onSearch={setShopSearch} onOpen={openProduct}
          onQuickAdd={(product) => addToCart({
            id: `shop-${product.id}-${product.variants[0]}`, name: product.name, detail: product.variants[0],
            price: product.price, channel: "shop", image: retailImages[product.id],
          })}
        />
      )}

      {view === "standards" && <StandardsGuide />}

      {view === "clarity" && <ClarityGuide onInterest={() => addToCart({
        id: "clarity", name: "Clarity · Founding batch", detail: "Interest list · 10 sticks",
        price: 0, image: "/products/clarity-sticks.webp",
      })} />}

      {view === "trace" && <TraceGuide onRecord={() => setTraceOpen(true)} />}

      {view === "business" && <BusinessGuide onEnquiry={(message) => {
        setConciergeMessage(message);
        setConciergeOpen(true);
        window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".concierge-fields input:last-child")?.focus());
      }} />}

      {view === "journal" && <FieldJournal origins={origins}/>}

      <footer>
        <div className="footer-social">
          <div>
            <h2>Coffee in <em>good company.</em></h2>
            <p>Coffee stories, origins and everyday rituals.</p>
          </div>
          <nav className="footer-social-links" aria-label="Deldiet social media">
            {socialProfiles.map((profile) => (
              <a key={profile.name} href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={`Deldiet Coffee on ${profile.name} (opens in a new tab)`}>
                <Icon name={profile.icon} size={21}/>
                <span>{profile.name}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-top">
          <div><Link className="footer-brand" href="/" aria-label="Deldiet home"><Image src="/brand/deldiet-wordmark.png" alt="Deldiet" width={432} height={129} unoptimized/></Link><p>The world in your cup.<br/>St. John&apos;s · Newfoundland</p></div>
          <div><span>Explore</span><a href="/discover">Discover Deldiet</a><a href="/tasteprint">Find my Tasteprint</a><a href="/coffeehouse">Coffeehouse</a><a href="/origins">Coffee origins</a><a href="/origin-bar">Origin Bar</a><a href="/build-a-cup">Build a cup</a><a href="/coffee-at-home">Coffee at home</a><a href="/shop">Shop Deldiet</a><a href="/origin-exchange">Origin Exchange</a><a href="/passport">Deldiet Passport</a></div>
          <div><span>Deldiet</span><a href="/events">Events</a><a href="/trace">Trace a lot</a><a href="/standards">Platform standards</a><a href="/clarity">Clarity</a><a href="/business">Business</a><a href="/journal">Field Journal</a></div>
          <div className="newsletter">
            <span>From origin to inbox</span>
            <p>Save a Field Notes signup request for new harvests, café experiences and sourcing stories. Mailing automation is not connected yet.</p>
            <form onSubmit={submitNewsletter}>
              <input aria-label="Email address" autoComplete="email" placeholder="Email address" type="email" required value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)}/>
              <button type="submit" aria-label="Save Field Notes signup request" disabled={Boolean(requestPending)}><Icon name="arrow" /></button>
            </form>
            {requestErrorScope === "home-newsletter" && <small className="request-error" role="alert">{requestError}</small>}
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 Deldiet Coffee Company</span><span>Canada / CAD</span><span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a></span></div>
      </footer>

      <button aria-label="Ask Deldiet" className="concierge-button" onClick={() => setConciergeOpen(!conciergeOpen)} aria-expanded={conciergeOpen}><Icon name="spark"/><span>Ask Deldiet</span></button>
      {conciergeOpen && <div className="concierge-panel">
        <div><span><Icon name="spark"/> Coffee concierge</span><button aria-label="Close concierge" onClick={() => setConciergeOpen(false)}><Icon name="close"/></button></div>
        <h3>What can we help with?</h3>
        <p>Ask about an origin, brewer, café favourite or lot. We&apos;ll save your question and return a reference; replies and notifications are not connected yet.</p>
        <div className="quick-prompts"><button type="button" onClick={() => { window.location.href = "/tasteprint"; }}>Smooth & chocolatey</button><button type="button" onClick={() => { window.location.href = "/build-a-cup"; }}>Build a flat white</button><button type="button" onClick={() => { window.location.href = "/trace"; }}>Trace my coffee</button></div>
        <form className="concierge-input" onSubmit={submitConcierge}>
          <div className="concierge-fields">
            <input aria-label="Contact email" autoComplete="email" type="email" required placeholder="Email for future follow-up" value={conciergeEmail} onChange={(event) => setConciergeEmail(event.target.value)}/>
            <input aria-label="Ask Deldiet" required maxLength={1000} placeholder="Ask about coffee…" value={conciergeMessage} onChange={(event) => setConciergeMessage(event.target.value)}/>
          </div>
          <button type="submit" aria-label="Save question" disabled={Boolean(requestPending)}><Icon name="arrow"/></button>
        </form>
        {requestErrorScope === "home-concierge" && <small className="request-error" role="alert">{requestError}</small>}
        <small>Concierge request · not live chat. This stores your question and contact email; see <a href="/privacy">privacy details</a>.</small>
      </div>}

      {cartOpen && <AccessibleDialog labelledBy="cart-drawer-title" onClose={() => setCartOpen(false)}>
        <aside className="cart-drawer">
          <div className="drawer-header"><div><p className="micro-label">One bag · split fulfilment</p><h2 id="cart-drawer-title">Your Deldiet · {cartCount}</h2></div><button aria-label="Close bag" onClick={() => setCartOpen(false)}><Icon name="close"/></button></div>
          {cart.length === 0 ? <div className="empty-cart"><div className="empty-bean"/><h3>Your bag is waiting.</h3><p>Start a coffeehouse order or explore the full Deldiet store.</p><div className="empty-actions"><a className="button button-dark" href="/coffeehouse#cafe-menu">Order a drink</a><a className="button" href="/shop">Shop online</a></div></div> : <>
            <div className="cart-items split-cart">
              {cafeCart.length > 0 && <section className="cart-channel"><div className="cart-channel-head"><span><Icon name="pin" size={17}/><b>Coffeehouse order preview</b></span><small>{serviceMode} · St. John&apos;s concept</small></div>{cafeCart.map((item) => <article key={item.id}><div className="cart-thumb cafe"><Image src={resolveCartImage(item)} alt="" fill unoptimized sizes="66px" /><DeldietMark className="deldiet-product-mark-thumb" /></div><div><h3>{item.name}</h3><p>{item.detail}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={15}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={15}/></button></div></div><strong>${(item.price * item.quantity).toFixed(2)}</strong></article>)}<div className="channel-subtotal"><span>Illustrative prepared-order subtotal</span><b>${cafeTotal.toFixed(2)}</b></div></section>}
              {shopCart.length > 0 && <section className="cart-channel"><div className="cart-channel-head"><span><Icon name="bag" size={17}/><b>Online shop</b></span><small>Ship, deliver or pick up</small></div>{shopCart.map((item) => <article key={item.id}><div className="cart-thumb"><Image src={resolveCartImage(item)} alt="" fill unoptimized sizes="66px" /><DeldietMark className="deldiet-product-mark-thumb" /></div><div><h3>{item.name}</h3><p>{item.detail}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={15}/></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={15}/></button></div></div><strong>{item.price === 0 ? "—" : `$${(item.price * item.quantity).toFixed(2)}`}</strong></article>)}<div className="channel-subtotal"><span>Shippable subtotal</span><b>${shopTotal.toFixed(2)}</b></div></section>}
            </div>
            <div className="cart-summary">
              <div><span>Illustrative combined value</span><strong>${cartTotal.toFixed(2)}</strong></div>
              <p>Save either group as a review request and keep its reference for Deldiet staff. This does not place an order, reserve stock or charge a card.</p>
              {cafeCart.length > 0 && <button className="button button-lime" onClick={() => { setRequestError(""); setCartOpen(false); setCartReviewChannel("cafe"); }}>Send coffeehouse order for review <Icon name="arrow"/></button>}
              {shopCart.length > 0 && <button className="button button-dark" onClick={() => { setRequestError(""); setCartOpen(false); setCartReviewChannel("shop"); }}>Send shop bag for review <Icon name="arrow"/></button>}
            </div>
          </>}
        </aside>
      </AccessibleDialog>}

      {cartReviewChannel && <AccessibleDialog labelledBy="order-review-title" onClose={() => setCartReviewChannel(null)}>
        <div className="reservation-modal request-review-modal">
          <button className="modal-close" aria-label="Close" onClick={() => setCartReviewChannel(null)}><Icon name="close"/></button>
          <div className="reservation-copy">
            <p className="eyebrow light">{cartReviewChannel === "cafe" ? "Coffeehouse" : "Deldiet shop"} · staff review</p>
            <h2 id="order-review-title">Save the<br/><em>next step.</em></h2>
            <p>We&apos;ll save this selection and issue a durable reference you can show Deldiet staff. It is not an order confirmation and does not reserve stock, a pickup time or delivery.</p>
            <div><span><i className="live-dot"/><b>Durable request</b></span><span><Icon name="clock" size={17}/><b>Final price pending</b></span></div>
          </div>
          <form className="reservation-form" onSubmit={submitHomeOrderReview}>
            <div className="request-review-summary">
              <span>{cartReviewChannel === "cafe" ? cafeCart.length : shopCart.length} line items</span>
              <strong>${(cartReviewChannel === "cafe" ? cafeTotal : shopTotal).toFixed(2)} <small>illustrative</small></strong>
            </div>
            <label><span>Name</span><input autoComplete="name" maxLength={120} required value={reviewContact.name} onChange={(event) => setReviewContact((current) => ({ ...current, name: event.target.value }))} placeholder="Your name"/></label>
            <label><span>Email</span><input autoComplete="email" type="email" required value={reviewContact.email} onChange={(event) => setReviewContact((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com"/></label>
            <label><span>Phone (optional)</span><input autoComplete="tel" type="tel" maxLength={60} value={reviewContact.phone} onChange={(event) => setReviewContact((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number"/></label>
            {requestErrorScope === `home-order-${cartReviewChannel}` && <small className="request-error" role="alert">{requestError}</small>}
            <button type="submit" className="button button-lime" disabled={Boolean(requestPending)}>{requestPending === `home-order-${cartReviewChannel}` ? "Saving review…" : "Save review request"} <Icon name="arrow"/></button>
            <small>Nothing is charged or reserved. Contact details are stored with the request; see <a href="/privacy">privacy details</a>.</small>
          </form>
        </div>
      </AccessibleDialog>}

      {reservationOpen && <AccessibleDialog labelledBy="reservation-title" onClose={() => setReservationOpen(false)}>
        <div className="reservation-modal">
          <button className="modal-close" aria-label="Close" onClick={() => setReservationOpen(false)}><Icon name="close"/></button>
          <div className="reservation-copy">
            <p className="eyebrow light">St. John&apos;s flagship concept</p>
            <h2 id="reservation-title">Make room<br/><em>for coffee.</em></h2>
            <p>Tell us what you&apos;d like to attend. We&apos;ll save your interest and issue a reference; calendar and email notifications are not connected yet.</p>
            <div><span><i className="live-dot"/><b>Interest-list mode</b></span><span><Icon name="clock" size={17}/><b>No live availability yet</b></span></div>
          </div>
          <form className="reservation-form" onSubmit={submitReservation}>
            <label><span>Visit type</span><select name="visitType" defaultValue={visitType}><option>Table reservation</option><option>East Africa cupping table</option><option>Home espresso clinic</option><option>The producer room</option><option>Private tasting</option></select></label>
            <div><label><span>Preferred date</span><input name="preferredDate" type="date" required/></label><label><span>Party</span><select name="party" defaultValue="2 people"><option>1 person</option><option>2 people</option><option>3 people</option><option>4 people</option><option>5–8 people</option></select></label></div>
            <label><span>Preferred time</span><div className="reservation-times" role="radiogroup" aria-label="Preferred time">{["Morning", "Midday", "Afternoon", "Evening"].map((time) => <button type="button" role="radio" aria-checked={reservationTime === time} key={time} className={reservationTime === time ? "active" : ""} onClick={() => setReservationTime(time)}>{time}</button>)}</div></label>
            <label><span>Name</span><input name="name" autoComplete="name" maxLength={120} required placeholder="Your name"/></label>
            <label><span>Email</span><input name="email" autoComplete="email" type="email" required placeholder="you@example.com"/></label>
            {requestErrorScope === "home-reservation" && <small className="request-error" role="alert">{requestError}</small>}
            <button type="submit" className="button button-lime" disabled={Boolean(requestPending)}>{requestPending === "home-reservation" ? "Saving request…" : "Save interest request"} <Icon name="arrow"/></button>
            <small>This records interest only and stores your contact details. It does not create a reservation; see <a href="/privacy">privacy details</a>.</small>
          </form>
        </div>
      </AccessibleDialog>}

      {selectedProduct && (
        <AccessibleDialog labelledBy="product-title" onClose={() => setSelectedProduct(null)}>
          <ShopProductSheet
            product={selectedProduct} image={retailImages[selectedProduct.id]}
            variant={selectedVariant} onVariant={setSelectedVariant}
            onClose={() => setSelectedProduct(null)} onSave={() => saveProductToPassport(selectedProduct)}
            onAdd={(price) => {
              addToCart({
                id: `shop-${selectedProduct.id}-${selectedVariant}`, name: selectedProduct.name, detail: selectedVariant,
                price, channel: "shop", image: retailImages[selectedProduct.id],
              });
              setSelectedProduct(null);
            }}
          />
        </AccessibleDialog>
      )}

      {traceOpen && <AccessibleDialog labelledBy="trace-modal-title" onClose={() => setTraceOpen(false)}><div className="trace-modal"><button className="modal-close" aria-label="Close" onClick={() => setTraceOpen(false)}><Icon name="close"/></button><p className="eyebrow">Illustrative lot record</p><h2 id="trace-modal-title">Ethiopia · Guji</h2><p className="modal-lede">Concept lot ET-GUJI-2608 demonstrates how a future verified record will connect coffee to place, process and roast data.</p><div className="record-grid"><div><span>Origin</span><b>Hambela, Guji</b></div><div><span>Harvest</span><b>Demonstration field</b></div><div><span>Process</span><b>Washed · example</b></div><div><span>Roasted</span><b>Not yet verified</b></div><div><span>Roast profile</span><b>Light · concept</b></div><div><span>Freshness window</span><b>Pending roast record</b></div></div><div className="record-note"><Icon name="leaf"/><p><b>What a verified record will include</b><br/>Producer identity and consent, farm or cooperative, variety, elevation, processing detail, purchase transparency, quality score, shipment and roast data.</p></div><button className="button button-dark" onClick={() => { updateLocalPassport({ savedLots: ["ET-GUJI-2608"] }, "Illustrative lot saved to this device’s Passport preview"); setTraceOpen(false); }}>Save preview lot <Icon name="plus"/></button></div></AccessibleDialog>}
      {lastReceipt && <aside className="request-receipt" role="status" aria-live="polite"><span>Saved request</span><b>{lastReceipt.reference}</b><p>{lastReceipt.message}</p><div><button onClick={() => void navigator.clipboard?.writeText(lastReceipt.reference)}>Copy reference</button><button onClick={() => setLastReceipt(null)}>Dismiss</button></div></aside>}
      {toast && <div className="toast" role="status"><span className="brand-seed"/>{toast}</div>}
    </main>
    </>
  );
}
