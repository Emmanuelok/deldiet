"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Young_Serif, Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import "./origin-bar.css";
import { canVisitOriginBarStep, getDrinkDefaults } from "@/lib/origin-bar-flow.mjs";
import { createIdempotencyKey, submitServiceRequest } from "@/lib/request-client";
import {
  Coffee, Leaf, ChevronLeft, ChevronRight, Check, Plus, Minus,
  Snowflake, MapPin, Heart, ArrowUpRight, ArrowRight, Search, X, RotateCcw, SlidersHorizontal, Sparkles, ChevronDown, ClipboardCheck, Globe2, Layers, CheckCircle2
} from "lucide-react";

/* ============================================================
   ORIGIN BAR — a bean-to-cup coffee experience kiosk
   Flow: Welcome → Origin → Drink → Craft → Enhance → Finish → Review → Done
   ============================================================ */


const coverSerif = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--ob-cover-serif", display: "swap" });
const coverBody = Albert_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--ob-cover-body", display: "swap" });
const coverMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--ob-cover-mono", display: "swap" });

const C = {
  espresso: "#203A2C",
  ink: "#203127",
  faint: "#647165",
  paper: "#F7F5ED",
  card: "#FFFEFA",
  line: "#DEE2D5",
  leaf: "#4D7C57",
  leafSoft: "#EAF1EB",
  cream: "#EEEBDF",
};

const F = {
  disp: "var(--sans)",
  body: "var(--sans)",
  mono: "var(--font-geist-mono), monospace",
};

/* ---------------- ROASTS (drive the accent color) ---------------- */
const ROASTS = [
  { id: "light", name: "Light", color: "#C98B43", liquid: "#A4682F", desc: "Floral, tea-like, vivid acidity" },
  { id: "medium", name: "Medium", color: "#9C5F2E", liquid: "#7A4521", desc: "Caramel, balanced, crowd-pleasing" },
  { id: "meddark", name: "Medium-Dark", color: "#6F3E1E", liquid: "#52301A", desc: "Bittersweet cocoa, syrupy body" },
  { id: "dark", name: "Dark", color: "#432717", liquid: "#332012", desc: "Smoky, bold, low acidity" },
];

/* ---------------- ORIGINS: every coffee-growing continent ----------------
   b: bean types — A Arabica · R Robusta · L Liberica · E Excelsa
   t: tasting notes · m: growing altitude · p: origin premium ($) */
const BEAN_NAMES = { A: "Arabica", R: "Robusta", L: "Liberica", E: "Excelsa" };

const ORIGINS = {
  "Africa": [
    { n: "Ethiopia", f: "🇪🇹", b: ["A"], t: "jasmine · blueberry · bergamot", m: "1,900–2,200 masl", p: 0.75, x: "Birthplace of coffee" },
    { n: "Kenya", f: "🇰🇪", b: ["A"], t: "blackcurrant · winey · bright", m: "1,700–2,100 masl", p: 0.75 },
    { n: "Rwanda", f: "🇷🇼", b: ["A"], t: "orange blossom · honey · silky", m: "1,700–2,000 masl", p: 0.5 },
    { n: "Burundi", f: "🇧🇮", b: ["A"], t: "red berry · sweet · clean", m: "1,700–2,000 masl", p: 0.5 },
    { n: "Tanzania", f: "🇹🇿", b: ["A", "R"], t: "citrus snap · peaberry · lively", m: "1,400–1,800 masl", p: 0.5 },
    { n: "Uganda", f: "🇺🇬", b: ["R", "A"], t: "deep cocoa · earthy · full", m: "1,200–1,500 masl", p: 0 },
    { n: "DR Congo", f: "🇨🇩", b: ["A", "R"], t: "wild berry · dark chocolate", m: "1,400–1,800 masl", p: 0.5 },
    { n: "Cameroon", f: "🇨🇲", b: ["R", "A"], t: "woody · molasses · round", m: "1,000–1,400 masl", p: 0 },
    { n: "Côte d'Ivoire", f: "🇨🇮", b: ["R"], t: "bold · rugged · roasty", m: "200–500 masl", p: 0 },
    { n: "Malawi", f: "🇲🇼", b: ["A"], t: "delicate · sweet citrus", m: "1,200–1,700 masl", p: 0.5 },
    { n: "Zambia", f: "🇿🇲", b: ["A"], t: "caramel · bright · tidy", m: "1,300–1,700 masl", p: 0.5 },
  ],
  "South America": [
    { n: "Colombia", f: "🇨🇴", b: ["A"], t: "caramel · red apple · balanced", m: "1,200–2,000 masl", p: 0.5 },
    { n: "Brazil", f: "🇧🇷", b: ["A", "R"], t: "chocolate · hazelnut · smooth", m: "800–1,300 masl", p: 0, x: "World's largest grower" },
    { n: "Peru", f: "🇵🇪", b: ["A"], t: "soft cocoa · mellow · gentle", m: "1,200–1,900 masl", p: 0.25, x: "Organic pioneer" },
    { n: "Ecuador", f: "🇪🇨", b: ["A"], t: "floral · crisp · fine", m: "1,200–1,800 masl", p: 0.5 },
    { n: "Bolivia", f: "🇧🇴", b: ["A"], t: "clean · sweet grape · airy", m: "1,500–2,300 masl", p: 0.75 },
    { n: "Venezuela", f: "🇻🇪", b: ["A"], t: "mild · rich · classic", m: "1,000–1,500 masl", p: 0.5 },
  ],
  "Central America & Caribbean": [
    { n: "Costa Rica", f: "🇨🇷", b: ["A"], t: "honey-process · brown sugar", m: "1,200–1,700 masl", p: 0.5 },
    { n: "Guatemala", f: "🇬🇹", b: ["A"], t: "cocoa · spice · soft smoke", m: "1,300–2,000 masl", p: 0.5 },
    { n: "Honduras", f: "🇭🇳", b: ["A"], t: "toffee · round · easy", m: "1,100–1,600 masl", p: 0.25 },
    { n: "El Salvador", f: "🇸🇻", b: ["A"], t: "creamy · plum · pacamara", m: "1,100–1,500 masl", p: 0.5 },
    { n: "Nicaragua", f: "🇳🇮", b: ["A"], t: "nougat · citrus · supple", m: "1,100–1,500 masl", p: 0.25 },
    { n: "Panama", f: "🇵🇦", b: ["A"], t: "Geisha — jasmine · papaya", m: "1,400–1,800 masl", p: 6.0, x: "Home of Geisha" },
    { n: "Mexico", f: "🇲🇽", b: ["A"], t: "almond · light cocoa · soft", m: "900–1,400 masl", p: 0.25 },
    { n: "Jamaica", f: "🇯🇲", b: ["A"], t: "Blue Mountain — silk · mild", m: "900–1,500 masl", p: 5.0, x: "Blue Mountain estate" },
    { n: "Dominican Republic", f: "🇩🇴", b: ["A"], t: "soft · sweet tobacco leaf", m: "600–1,200 masl", p: 0.25 },
    { n: "Cuba", f: "🇨🇺", b: ["A"], t: "earthy · sweet pipe smoke", m: "350–750 masl", p: 0.75 },
    { n: "Haiti", f: "🇭🇹", b: ["A"], t: "blue-lineage · mellow", m: "300–1,200 masl", p: 0.5 },
  ],
  "Asia–Pacific": [
    { n: "Indonesia", f: "🇮🇩", b: ["A", "R"], t: "Sumatra — cedar · earth · syrup", m: "900–1,500 masl", p: 0.5 },
    { n: "Vietnam", f: "🇻🇳", b: ["R", "A", "E"], t: "bold cocoa · robusta power", m: "500–1,500 masl", p: 0, x: "Robusta heartland" },
    { n: "India", f: "🇮🇳", b: ["A", "R"], t: "monsooned malabar · spice", m: "700–1,500 masl", p: 0.25 },
    { n: "Papua New Guinea", f: "🇵🇬", b: ["A"], t: "mango · bright sugar", m: "1,300–1,900 masl", p: 0.5 },
    { n: "China · Yunnan", f: "🇨🇳", b: ["A"], t: "soft caramel · plum", m: "900–1,700 masl", p: 0.25 },
    { n: "Thailand", f: "🇹🇭", b: ["A", "R"], t: "mountain florals · clean", m: "800–1,500 masl", p: 0.25 },
    { n: "Philippines", f: "🇵🇭", b: ["L", "E", "R"], t: "Barako — smoky jackfruit", m: "300–1,200 masl", p: 0.75, x: "Liberica heartland" },
    { n: "Laos", f: "🇱🇦", b: ["A", "R"], t: "dark honey · herbs", m: "800–1,300 masl", p: 0.25 },
    { n: "Myanmar", f: "🇲🇲", b: ["A"], t: "grape · brown sugar", m: "1,000–1,600 masl", p: 0.5 },
    { n: "Timor-Leste", f: "🇹🇱", b: ["A"], t: "hybrid heritage · cocoa", m: "800–1,600 masl", p: 0.5 },
    { n: "Hawai'i · USA", f: "🇺🇸", b: ["A"], t: "Kona — butter · gentle", m: "150–900 masl", p: 5.0, x: "Kona belt" },
    { n: "Australia", f: "🇦🇺", b: ["A"], t: "soft nut · rare lots", m: "200–600 masl", p: 1.0 },
  ],
  "Middle East": [
    { n: "Yemen", f: "🇾🇪", b: ["A"], t: "the original Mocha — wine · dried fruit", m: "1,500–2,400 masl", p: 4.0, x: "Where coffee was first traded" },
  ],
};

const DEMO_LOT_PROFILES = {
  Ethiopia: { lotId: "DEMO-ETH-01", region: "Yirgacheffe sample region", producer: "Not supplied", process: "Washed · sample field", harvest: "2025/26 · unverified" },
  Colombia: { lotId: "DEMO-COL-01", region: "Huila sample region", producer: "Not supplied", process: "Washed · sample field", harvest: "2025/26 · unverified" },
  Brazil: { lotId: "DEMO-BRA-01", region: "Cerrado sample region", producer: "Not supplied", process: "Natural · sample field", harvest: "2025/26 · unverified" },
  Rwanda: { lotId: "DEMO-RWA-01", region: "Nyamasheke sample region", producer: "Not supplied", process: "Washed · sample field", harvest: "2025/26 · unverified" },
};

const lotProfileFor = (origin) => DEMO_LOT_PROFILES[origin?.n] || {
  lotId: `DEMO-${(origin?.n || "LOT").replace(/[^A-Z]/gi, "").slice(0, 3).toUpperCase()}-01`,
  region: "Region not supplied", producer: "Not supplied", process: "Not supplied", harvest: "Not verified",
};

/* ---------------- DRINKS ----------------
   family: espresso | brewed | cold | blended · shots: included shots */
const CLASSICS = [
  { n: "Espresso", d: "A single, syrupy origin shot", pr: 3.25, fam: "espresso", sh: 1 },
  { n: "Doppio", d: "Double shot, twice the story", pr: 4.0, fam: "espresso", sh: 2 },
  { n: "Ristretto", d: "Short pull — sweet and dense", pr: 3.5, fam: "espresso", sh: 1 },
  { n: "Lungo", d: "Long pull — gentler, longer", pr: 3.75, fam: "espresso", sh: 1 },
  { n: "Americano", d: "Shots opened up with hot water", pr: 4.25, fam: "espresso", sh: 2 },
  { n: "Long Black", d: "Water first — the crema stays", pr: 4.25, fam: "espresso", sh: 2 },
  { n: "Latte", d: "Silky steamed milk, thin foam", pr: 5.5, fam: "espresso", sh: 2, milk: true },
  { n: "Cappuccino", d: "Equal thirds, deep dry foam", pr: 5.25, fam: "espresso", sh: 2, milk: true, foam: true },
  { n: "Flat White", d: "Velvet microfoam, strong heart", pr: 5.25, fam: "espresso", sh: 2, milk: true },
  { n: "Cortado", d: "Half espresso, half warm milk", pr: 4.75, fam: "espresso", sh: 2, milk: true },
  { n: "Macchiato", d: "Espresso marked with foam", pr: 4.0, fam: "espresso", sh: 2 },
  { n: "Caramel Macchiato", d: "Vanilla milk, marked + caramel net", pr: 6.0, fam: "espresso", sh: 2, milk: true, driz: "#B5722F" },
  { n: "Mocha", d: "Origin espresso meets real cacao", pr: 6.0, fam: "espresso", sh: 2, milk: true },
  { n: "White Mocha", d: "Sweet white-cacao comfort", pr: 6.25, fam: "espresso", sh: 2, milk: true },
  { n: "Café au Lait", d: "Brewed coffee + steamed milk", pr: 4.75, fam: "brewed", sh: 0, milk: true },
  { n: "Pour-Over / Drip", d: "Your origin, brewed clean", pr: 4.0, fam: "brewed", sh: 0 },
  { n: "Red Eye", d: "Drip with an espresso heartbeat", pr: 5.25, fam: "brewed", sh: 1 },
  { n: "Double-Double", d: "Brewed, two cream two sugar — a Canadian classic", pr: 4.25, fam: "brewed", sh: 0, milk: true },
  { n: "Cold Brew", d: "18-hour slow steep, no bitterness", pr: 5.0, fam: "cold", sh: 0 },
  { n: "Nitro Cold Brew", d: "Cascading, naturally creamy", pr: 5.75, fam: "cold", sh: 0 },
  { n: "Iced Latte", d: "Espresso over ice and cold milk", pr: 5.5, fam: "espresso", sh: 2, milk: true, iced: true },
  { n: "Frosted Blend", d: "Ice-blended, frappé-style", pr: 6.5, fam: "blended", sh: 1, milk: true },
  { n: "Affogato", d: "Espresso poured over vanilla gelato", pr: 6.75, fam: "espresso", sh: 1, foam: true },
  { n: "Espresso con Panna", d: "A shot under whipped cream", pr: 4.25, fam: "espresso", sh: 1, whip: true },
  { n: "Vienna", d: "Espresso, whipped cream, cocoa dust", pr: 5.0, fam: "espresso", sh: 2, whip: true },
  { n: "Turkish", d: "Fine-ground, unfiltered, ancient", pr: 4.75, fam: "brewed", sh: 0 },
];

const SIGNATURES = [
  { n: "Golden Sunrise Latte", d: "Turmeric, raw honey, oat silk", pr: 6.75, fam: "espresso", sh: 2, milk: true, tag: ["turmeric", "honey"] },
  { n: "Lavender Cloud", d: "Lavender mist under vanilla cold foam", pr: 6.75, fam: "espresso", sh: 2, milk: true, foam: true, tag: ["lavender"] },
  { n: "Maple Woods Cortado", d: "Québec maple, a whisper of smoked salt", pr: 6.25, fam: "espresso", sh: 2, milk: true, tag: ["maple", "smoked salt"] },
  { n: "Sahara Gold", d: "Cardamom, date syrup, saffron dust", pr: 7.25, fam: "espresso", sh: 2, milk: true, tag: ["cardamom", "date"] },
  { n: "Rose Velvet Mocha", d: "Rose water folded into white cacao", pr: 7.0, fam: "espresso", sh: 2, milk: true, tag: ["rose", "white cacao"] },
  { n: "Midnight Cherry Mocha", d: "70% cacao with tart cherry", pr: 7.0, fam: "espresso", sh: 2, milk: true, tag: ["cherry", "dark cacao"] },
  { n: "Coconut Cascade", d: "Cold brew under a coconut-cream cloud", pr: 6.75, fam: "cold", sh: 0, foam: true, tag: ["coconut"] },
  { n: "Brown Sugar Shaken Oat", d: "Espresso shaken with brown sugar, oat", pr: 6.5, fam: "espresso", sh: 2, milk: true, iced: true, tag: ["brown sugar"] },
  { n: "Pistachio Silk", d: "Stone-ground pistachio, velvet foam", pr: 7.25, fam: "espresso", sh: 2, milk: true, tag: ["pistachio"] },
  { n: "Ube Dream", d: "Purple yam and coconut milk", pr: 7.0, fam: "espresso", sh: 2, milk: true, tag: ["ube", "coconut"] },
  { n: "Matcha Eclipse", d: "Ceremonial matcha meets espresso", pr: 6.75, fam: "espresso", sh: 1, milk: true, tag: ["matcha"] },
  { n: "Orange Blossom Tonic", d: "Espresso over botanical tonic, orange oil", pr: 6.5, fam: "espresso", sh: 1, iced: true, tag: ["orange", "botanical"] },
  { n: "Tiramisu Cloud", d: "Mascarpone foam, cocoa dust", pr: 7.25, fam: "espresso", sh: 2, milk: true, foam: true, tag: ["mascarpone"] },
  { n: "Azteca Chili Mocha", d: "Raw cacao, cinnamon, gentle chili warmth", pr: 7.0, fam: "espresso", sh: 2, milk: true, tag: ["cacao", "chili"] },
  { n: "Honey Fig Cappuccino", d: "Fig reduction and wildflower honey", pr: 6.75, fam: "espresso", sh: 2, milk: true, foam: true, tag: ["fig", "honey"] },
  { n: "Forest Mint Mocha", d: "Fresh mint leaf, dark cacao", pr: 6.75, fam: "espresso", sh: 2, milk: true, tag: ["mint", "dark cacao"] },
];

/* ---------------- CRAFT OPTIONS ---------------- */
const MILKS = [
  { n: "Organic whole", p: 0 }, { n: "Organic 2%", p: 0 }, { n: "Skim", p: 0 },
  { n: "Lactose-free", p: 0.4 }, { n: "A2 milk", p: 0.6 }, { n: "Half & half", p: 0.5 },
  { n: "Oat (barista)", p: 0.8, v: true }, { n: "Almond", p: 0.8, v: true }, { n: "Soy", p: 0.7, v: true },
  { n: "Coconut", p: 0.8, v: true }, { n: "Cashew", p: 0.9, v: true }, { n: "Macadamia", p: 1.0, v: true },
  { n: "Hemp", p: 0.9, v: true }, { n: "Pea (barista)", p: 0.8, v: true }, { n: "Rice", p: 0.7, v: true },
  { n: "None — black", p: 0, none: true },
];

const EXTRACTIONS = {
  espresso: ["Espresso machine"],
  blended: ["Espresso machine"],
  brewed: ["Pour-over V60", "Chemex", "French press", "AeroPress", "Siphon", "Batch drip"],
  cold: ["18-hr slow steep", "Nitro-charged"],
};

const CAFFEINE = ["Regular", "Half-caf", "Decaf · Swiss Water"];

/* ---------------- ENHANCE OPTIONS ---------------- */
const BOOSTERS = [
  { n: "Collagen peptides", p: 2.0, d: "unflavoured protein add-in" },
  { n: "Plant protein", p: 1.75, d: "pea + pumpkin seed blend" },
  { n: "MCT oil", p: 1.5, d: "coconut-derived creamer" },
  { n: "Grass-fed ghee", p: 1.25, d: "buttery texture" },
  { n: "Lion's mane", p: 1.75, d: "earthy mushroom extract" },
  { n: "Chaga", p: 1.75, d: "roasted mushroom extract" },
  { n: "Reishi", p: 1.75, d: "earthy mushroom extract" },
  { n: "Cordyceps", p: 1.75, d: "mild mushroom extract" },
  { n: "Ashwagandha", p: 1.5, d: "botanical extract" },
  { n: "Maca root", p: 1.25, d: "malty root powder" },
  { n: "Panax ginseng", p: 1.5, d: "botanical extract" },
  { n: "L-theanine", p: 1.0, d: "tea-derived amino acid" },
  { n: "Raw cacao nibs", p: 0.75, d: "cacao crunch" },
  { n: "Bee pollen", p: 1.25, d: "floral granules · allergen" },
  { n: "Vitamin B12", p: 0.75, d: "vitamin add-in" },
  { n: "Electrolyte minerals", p: 1.0, d: "unflavoured mineral blend" },
];

const SYRUPS = [
  "Vanilla bean", "Caramel", "Hazelnut", "Mocha sauce", "White chocolate",
  "Lavender", "Rose", "Brown-sugar cinnamon", "Maple", "Pumpkin spice",
  "Peppermint", "Toffee nut", "Honeycomb", "Coconut",
];
const SYRUP_PRICE = 0.8;

const SWEETENERS = ["None", "Raw cane sugar", "Wildflower honey", "Maple syrup", "Agave", "Coconut sugar", "Date syrup", "Stevia leaf", "Monk fruit"];

const TOPPINGS = [
  { n: "Whipped cream", p: 0.75, whip: true },
  { n: "Vanilla cold foam", p: 1.0, foam: true },
  { n: "Cinnamon dust", p: 0.25 },
  { n: "Cocoa dust", p: 0.25 },
  { n: "Nutmeg", p: 0.25 },
  { n: "Caramel drizzle", p: 0.5, driz: "#B5722F" },
  { n: "Dark-chocolate shavings", p: 0.5, driz: "#3A2417" },
  { n: "Flaked sea salt", p: 0.25 },
  { n: "Dried rose petals", p: 0.5 },
  { n: "Orange zest", p: 0.25 },
  { n: "Toasted coconut", p: 0.5 },
];

/* ---------------- FINISH OPTIONS ---------------- */
const SIZES = [
  { id: "seed", n: "Seed", oz: 8, p: 0 },
  { id: "sprout", n: "Sprout", oz: 12, p: 0.6 },
  { id: "bloom", n: "Bloom", oz: 16, p: 1.2 },
  { id: "harvest", n: "Harvest", oz: 20, p: 1.7 },
];

const CUPS = [
  { n: "For here · ceramic", p: 0 },
  { n: "To go · compostable", p: 0 },
  { n: "Bring your own", p: -0.5, eco: true },
];

const EXTRA_SHOT = 1.0;
const STEP_LABELS = ["Origin", "Drink", "Craft", "Enhance", "Finish", "Review"];
const money = (x) => `$${x.toFixed(2)}`;
const readableAccent = (color) => color === ROASTS[0].color ? "#754019" : color;

/* ============================ UI ATOMS ============================ */

function Tag({ children, color = C.faint, bg = "transparent", border = C.line, wrap = false }) {
  return (
    <span className="ob-tag" style={{ maxWidth: wrap ? "100%" : undefined, fontFamily: F.mono, fontSize: 13, lineHeight: wrap ? 1.35 : undefined, letterSpacing: 0.6, color, background: bg, border: `1px solid ${border}`, borderRadius: 999, padding: "3px 9px", textTransform: "uppercase", whiteSpace: wrap ? "normal" : "nowrap", overflowWrap: wrap ? "anywhere" : undefined }}>
      {children}
    </span>
  );
}

function SectionTitle({ kicker, title, sub, accent }) {
  return (
    <div className="ob-section-title rise" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 8 }}>{kicker}</div>
      <h2 className="ob-step-heading" tabIndex={-1} style={{ fontFamily: F.disp, fontSize: "clamp(24px, 3.4vw, 34px)", color: C.ink, lineHeight: 1.15, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontFamily: F.body, color: C.faint, fontSize: 14, marginTop: 8, maxWidth: 560 }}>{sub}</p>}
    </div>
  );
}

function Pill({ active, onClick, children, accent }) {
  const activeText = accent === ROASTS[0].color ? C.espresso : "#fff";
  return (
    <button type="button" className="ob-pill" aria-pressed={active} onClick={onClick} style={{
      fontFamily: F.body, fontSize: 14, fontWeight: 600, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
      border: `1.5px solid ${active ? accent : C.line}`, background: active ? accent : C.card, color: active ? activeText : C.ink,
      transition: "all .15s ease", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Card({ active, onClick, accent, children, pad = 14, disabled = false }) {
  const activeText = accent === ROASTS[0].color ? C.espresso : "#fff";
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-disabled={disabled} aria-pressed={active} className="ob-option text-left w-full" style={{
      position: "relative", background: C.card, borderRadius: 14, padding: pad, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.48 : 1,
      border: `1.5px solid ${active ? accent : C.line}`, boxShadow: active ? `0 0 0 3px ${accent}22` : "0 1px 2px rgba(34,22,17,.04)",
      transition: "border-color .15s ease, box-shadow .15s ease", fontFamily: F.body, color: C.ink,
    }}>
      {active && (
        <span className="ob-selection-check" style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 999, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={12} color={activeText} strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}

function Qty({ value, onMinus, onPlus, min = 0, max = 4, accent, label = "quantity" }) {
  const btn = (dis) => ({
    width: 44, minWidth: 44, height: 44, borderRadius: 999, border: `1.5px solid ${dis ? C.line : accent}`,
    color: dis ? C.faint : accent, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: dis ? "not-allowed" : "pointer",
  });
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} style={btn(value <= min)} onClick={onMinus}><Minus size={16} /></button>
      <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 600, minWidth: 18, textAlign: "center", color: C.ink }}>{value}</span>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} style={btn(value >= max)} onClick={onPlus}><Plus size={16} /></button>
    </div>
  );
}

function Seg({ options, value, onChange, accent }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => <Pill key={o} active={value === o} accent={accent} onClick={() => onChange(o)}>{o}</Pill>)}
    </div>
  );
}

function UtilityBar() {
  return (
    <nav className="ob-topbar" aria-label="Deldiet navigation">
      <Link className="ob-brand" href="/" aria-label="Deldiet home"><Image src="/brand/deldiet-wordmark-ink.svg" alt="Deldiet" width={432} height={129} priority unoptimized /></Link>
      <span className="ob-topbar-context">THE ORIGIN BAR <span>Your coffee atelier</span></span>
      <div className="ob-topbar-links"><Link href="/coffeehouse">Coffeehouse</Link><Link href="/origin-exchange">Origin Exchange<ArrowUpRight size={15}/></Link><button type="button" onClick={() => window.dispatchEvent(new Event("deldiet:search"))} aria-label="Explore Deldiet tools"><Search size={18}/><span>Explore</span></button></div>
    </nav>
  );
}

function ChoiceSearch({ value, onChange, placeholder, label }) {
  return <div className="ob-choice-search"><Search size={19}/><input aria-label={label} type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}/>{value && <button type="button" onClick={() => onChange("")} aria-label={`Clear ${label.toLowerCase()}`}><X size={17}/></button>}</div>;
}

function StepNavigation({ step, sel, submitting, onGo }) {
  const icons = [Globe2, Coffee, SlidersHorizontal, Sparkles, Layers, ClipboardCheck];
  const descriptions = [sel.origin?.n || "Choose your beans", sel.drink?.n || "Find your favourite", "Milk & method", "The little extras", "Size & serve", "Your final look"];
  const navigationRef = useRef(null);
  useEffect(() => {
    const active = navigationRef.current?.querySelector('[aria-current="step"]');
    if (active) navigationRef.current.scrollLeft = Math.max(0, active.offsetLeft - navigationRef.current.offsetLeft - (navigationRef.current.clientWidth - active.clientWidth) / 2);
  }, [step]);
  return <nav className="ob-step-navigation" ref={navigationRef} aria-label="Build your cup steps">{STEP_LABELS.map((label, index) => {
    const number = index + 1;
    const available = canVisitOriginBarStep(number, sel, submitting);
    const StepIcon = icons[index];
    return <button key={label} type="button" aria-current={number === step ? "step" : undefined} disabled={!available} onClick={() => onGo(number)} title={!available ? number === 2 ? "Choose an origin first" : "Choose an origin and drink first" : `Edit ${label.toLowerCase()}`}><span className="ob-step-symbol">{number < step ? <Check size={17}/> : <StepIcon size={18}/>}</span><span><b><small>{String(number).padStart(2,"0")}</small>{label}</b><span>{descriptions[index]}</span></span></button>;
  })}</nav>;
}

function CupSummary({ sel, roastObj, cupProps, parts, tags, safety, onGo, submitting }) {
  return <aside className="ob-cup-summary" aria-label="Your live cup preview">
    <div className="ob-summary-heading"><span>YOUR CUP, COMING TO LIFE</span><Coffee size={18}/></div>
    <div className="ob-live-cup"><div className="ob-cup-halo"/><CupSVG uid="rail" {...cupProps.svg} width={180}/><span className="ob-live-label">Illustrated preview</span></div>
    <div className="ob-summary-name"><span>{sel.origin ? `${sel.origin.f} ${sel.origin.n}` : "A world of possibility"}</span><h2>{sel.name || sel.drink?.n || "A little more you."}</h2><p>{sel.drink ? `${roastObj.name} roast · ${sel.temp.toLowerCase()}` : "Every choice brings your cup a little closer."}</p></div>
    <dl className="ob-summary-recipe"><div><dt>Milk</dt><dd>{sel.milk}</dd></div><div><dt>Method</dt><dd>{sel.drink ? sel.extraction : "Choose a drink"}</dd></div><div><dt>Size</dt><dd>{SIZES.find(size => size.id === sel.size)?.oz} oz · {sel.cup.split(" · ")[0]}</dd></div></dl>
    <div className="ob-summary-notes">{tags.slice(0,3).map(tag => <span key={tag}>{tag}</span>)}</div>
    <div className="ob-summary-total"><span>Estimated subtotal<small>CAD · confirmed by staff</small></span><b aria-live="polite">{money(parts.total)}</b></div>
    {sel.origin && sel.drink && <button type="button" className="ob-summary-review" disabled={submitting} onClick={() => onGo(6)}>Review my cup<ArrowUpRight size={18}/></button>}
    <details className="ob-summary-safety"><summary>Ingredients & caffeine<ChevronDown size={15}/></summary><p>{safety.caffeine}. {safety.allergens.length ? `Selected signals: ${safety.allergens.join(", ")}.` : "No selected allergen signals."} Shared-equipment cross-contact remains possible. Staff verification is required.</p></details>
  </aside>;
}

/* ==================== SIGNATURE: THE LIVE CUP ==================== */

function CupSVG({ uid, roast, hasMilk, foam, whip, iced, blended, drizzle, boosters = 0, sizeIdx = 1, width = 150 }) {
  const s = 0.82 + sizeIdx * 0.07;
  const liquid = blended ? "#C9A47C" : roast.liquid;
  const milkCol = "#F0E4D2";
  const foamCol = "#FBF4E4";
  const hot = !iced && !blended;
  const clip = `cup-${uid}`;
  return (
    <svg viewBox="0 0 140 168" width={width} style={{ display: "block", margin: "0 auto" }} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d="M30 38 L110 38 L101 138 Q100 150 88 150 L52 150 Q40 150 39 138 Z" />
        </clipPath>
      </defs>
      <g transform={`translate(70,156) scale(${s}) translate(-70,-156)`}>
        {hot && (
          <g stroke={C.faint} strokeWidth="2.4" fill="none" opacity="0.45" strokeLinecap="round">
            <path d="M56 26 q5 -7 0 -14" />
            <path d="M74 28 q5 -8 0 -16" />
          </g>
        )}
        {/* layers inside the cup */}
        <g clipPath={`url(#${clip})`}>
          <rect x="20" y="38" width="100" height="120" fill="#FDFBF7" />
          <rect x="20" y={hasMilk ? 96 : 52} width="100" height="110" fill={liquid} style={{ transition: "all .3s ease" }} />
          {hasMilk && <rect x="20" y="52" width="100" height="46" fill={blended ? "#E9D9C2" : milkCol} style={{ transition: "all .3s ease" }} />}
          {foam && <rect x="20" y="44" width="100" height="13" fill={foamCol} />}
          {foam && <g fill={foamCol}><circle cx="42" cy="45" r="5" /><circle cx="58" cy="43" r="6" /><circle cx="76" cy="44" r="5.5" /><circle cx="93" cy="45" r="5" /></g>}
          {iced && (
            <g fill="#FFFFFF" opacity="0.75" stroke="#D9CDBC" strokeWidth="1">
              <rect x="44" y="56" width="16" height="16" rx="3" transform="rotate(-8 52 64)" />
              <rect x="70" y="52" width="16" height="16" rx="3" transform="rotate(10 78 60)" />
              <rect x="58" y="76" width="15" height="15" rx="3" transform="rotate(-14 65 83)" />
            </g>
          )}
          {boosters > 0 && (
            <g fill="#D9A441">
              {[0, 1, 2, 3].slice(0, Math.min(boosters, 4)).map((i) => (
                <path key={i} transform={`translate(${48 + i * 16},${108 - (i % 2) * 14}) scale(.85)`} d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z" />
              ))}
            </g>
          )}
          {drizzle && (
            <g stroke={drizzle} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9">
              <path d="M38 49 q10 5 20 0 q10 -5 20 0 q10 5 20 0" />
              <path d="M42 56 q9 4 18 0 q9 -4 18 0 q9 4 18 0" />
            </g>
          )}
          <g pointerEvents="none">
            <rect x="42" y="116" width="56" height="20" rx="5" fill="#FFFDF6" fillOpacity=".86" stroke="#2A1F18" strokeOpacity=".12" />
            <image href="/brand/deldiet-wordmark-ink.svg" x="47" y="120" width="46" height="13.7" preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>
        {whip && (
          <g fill="#FFF9EE" stroke="#E8DAC2" strokeWidth="1.2">
            <ellipse cx="70" cy="36" rx="34" ry="9" />
            <ellipse cx="70" cy="28" rx="24" ry="8" />
            <ellipse cx="70" cy="21" rx="13" ry="6" />
          </g>
        )}
        {blended && <rect x="76" y="6" width="6" height="44" rx="3" fill={roast.color} opacity="0.85" transform="rotate(8 79 28)" />}
        {/* cup outline + handle + saucer */}
        <path d="M30 38 L110 38 L101 138 Q100 150 88 150 L52 150 Q40 150 39 138 Z" fill="none" stroke={C.espresso} strokeWidth="3.5" strokeLinejoin="round" />
        {hot && !whip && <path d="M110 56 q22 4 16 26 q-5 18 -22 16" fill="none" stroke={C.espresso} strokeWidth="3.5" />}
        <ellipse cx="70" cy="158" rx="46" ry="5" fill="none" stroke={C.espresso} strokeWidth="3" opacity="0.85" />
      </g>
    </svg>
  );
}

/* ============================ SCREENS ============================ */

function Welcome({ onBegin, onTasteMatch }) {
  const F = { disp: "var(--ob-cover-serif)", body: "var(--ob-cover-body)", mono: "var(--ob-cover-mono)" };
  return (
    <section aria-labelledby="ob-welcome-title" className={`ob-welcome flex items-center px-6 sm:px-10 lg:px-16 ${coverSerif.variable} ${coverBody.variable} ${coverMono.variable}`} style={{ minHeight: "100%", paddingTop: 48, paddingBottom: 48 }}>
      <div className="ob-welcome-panel">
        <div className="rise"><Tag wrap color="#D8C4A8" border="#6A503C" bg="rgba(34,22,17,.72)">Origin-led · compatibility-aware · barista confirmed</Tag></div>
        <div className="rise-1" style={{ margin: "26px 0 16px", padding: "12px 22px", borderRadius: 999, background: "rgba(247,244,238,.94)", boxShadow: "0 18px 50px rgba(0,0,0,.24)" }}>
          <CupSVG uid="hero" roast={ROASTS[1]} hasMilk foam sizeIdx={2} width={116} />
        </div>
        <div className="rise-1" style={{ fontFamily: F.mono, fontSize: 13, color: "#D9FF66", letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>Deldiet Coffeehouse · in-store atelier</div>
        <h1 id="ob-welcome-title" className="rise-1" style={{ fontFamily: F.disp, color: "#F5EDE2", fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02, margin: 0 }}>
          Craft a cup<br/>from somewhere real.
        </h1>
        <p className="rise-2" style={{ fontFamily: F.body, color: "#D6C6B2", fontSize: 16, maxWidth: 510, marginTop: 14, lineHeight: 1.65 }}>
          Build your cup from the bean upward. Choose the origin, roast, drink, milk, extraction and finishing details while your cup and price update live.
        </p>
        <div className="ob-welcome-actions rise-2">
          <button type="button" onClick={onBegin} style={{ fontFamily: F.body, color: "#241405", background: "#D9FF66", border: "none", boxShadow: "0 8px 24px rgba(217,255,102,.20)" }}>Build my cup →</button>
          <button type="button" className="ob-secondary" onClick={onTasteMatch}>Match my taste</button>
        </div>
        <div className="rise-2" style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: "#A9957E", marginTop: 26, textTransform: "uppercase" }}>
          Demonstration catalogue · live cup preview · staff confirmation required
        </div>
      </div>
      <aside className="ob-welcome-dossier rise-2" aria-label="What the Origin Bar creates">
        <div><span>THE ORIGIN ATELIER</span><span>01—06</span></div>
        <div>
          <h2>One Cup Passport</h2>
          <p>Your selected origin, roast, method, ingredients, allergen signals, illustrative caffeine range and subtotal stay visible from first choice to counter handoff.</p>
          <div className="ob-welcome-steps">
            <span><b>01</b>Choose a coffee origin<small>place + flavour</small></span>
            <span><b>02</b>Match the drink<small>method + milk</small></span>
            <span><b>03</b>Check the cup<small>safety + subtotal</small></span>
            <span><b>04</b>Confirm with staff<small>demo request</small></span>
          </div>
        </div>
        <small style={{ color: "#9F8D7C", fontFamily: F.mono, fontSize: 13, lineHeight: 1.55 }}>Origin and availability records are illustrative until Deldiet connects verified supplier, inventory and point-of-sale data.</small>
      </aside>
    </section>
  );
}

const TASTE_MATCHES = [
  { id: "bright", label: "Bright & floral", detail: "Jasmine, citrus and a clean finish", country: "Ethiopia", roast: "light", drink: "Pour-Over / Drip", why: "A light roast and filter method preserve the origin's most aromatic notes." },
  { id: "balanced", label: "Caramel & balanced", detail: "Round sweetness with familiar structure", country: "Colombia", roast: "medium", drink: "Flat White", why: "A balanced origin stays distinct while textured milk adds softness." },
  { id: "deep", label: "Deep & chocolatey", detail: "Full body, cocoa and low brightness", country: "Brazil", roast: "meddark", drink: "Americano", why: "A slightly deeper roast and long black format hold body without hiding the coffee." },
  { id: "cold", label: "Cold & refreshing", detail: "Smooth, slow-steeped and easy to customise", country: "Rwanda", roast: "medium", drink: "Cold Brew", why: "The cool extraction softens acidity while keeping a clean fruit-and-cacao profile." },
];

function TasteMatch({ onBack, onApply }) {
  const [selected, setSelected] = useState(TASTE_MATCHES[0]);
  return <main className="ob-taste-screen ob-scroll-region overflow-y-auto">
    <button type="button" className="ob-text-action" onClick={onBack}><ChevronLeft size={17}/>Back to Origin Bar</button>
    <div className="ob-taste-layout"><div><span className="ob-eyebrow">LET’S FIND YOUR STARTING POINT</span><h1>Follow your<br/><em>flavour.</em></h1><p>Pick the one that sounds like you. We’ll suggest a coffee to start with, and you can make every detail your own.</p><div className="ob-taste-options">{TASTE_MATCHES.map((item,index) => <button type="button" key={item.id} aria-pressed={selected.id === item.id} onClick={() => setSelected(item)}><span>0{index+1}</span><div><b>{item.label}</b><small>{item.detail}</small></div>{selected.id === item.id ? <CheckCircle2 size={22}/> : <Plus size={20}/>}</button>)}</div></div>
    <aside className="ob-taste-match"><span className="ob-eyebrow">YOUR STARTING CUP</span><div className="ob-taste-image"><Image src={selected.id === "cold" ? "/menu/deldiet-cold-cup.webp" : "/menu/deldiet-hot-cup.webp"} alt={selected.id === "cold" ? "Deldiet iced coffee" : "Deldiet hot coffee"} fill unoptimized sizes="(max-width: 760px) 90vw, 35vw"/></div><h2>{Object.values(ORIGINS).flat().find(origin => origin.n === selected.country)?.f} {selected.country}</h2><p>{ROASTS.find(roast => roast.id === selected.roast)?.name} roast · {selected.drink}</p><div className="ob-taste-reason"><b>Why this match</b><p>{selected.why}</p></div><button type="button" className="ob-primary-action" onClick={() => onApply(selected)}>Make this cup mine<ArrowRight size={18}/></button><small>A preference match. Every choice remains editable.</small></aside></div>
  </main>;
}

function OriginStep({ sel, set, accent }) {
  const [continent, setContinent] = useState(() => Object.keys(ORIGINS).find(region => ORIGINS[region].some(origin => origin.n === sel.origin?.n)) || "Africa");
  const [query, setQuery] = useState("");
  const [beanFilter, setBeanFilter] = useState("All");
  const source = query.trim() ? Object.entries(ORIGINS).flatMap(([region, origins]) => origins.map(origin => ({ ...origin, continent: region }))) : ORIGINS[continent].map(origin => ({ ...origin, continent }));
  const list = source.filter(c => (beanFilter === "All" || c.b.includes(beanFilter[0])) && `${c.n} ${c.t} ${c.continent} ${c.b.map(bean => BEAN_NAMES[bean]).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const lot = sel.origin ? lotProfileFor(sel.origin) : null;
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 1 · Origin & roast"
        title="Start somewhere extraordinary."
        sub="Choose a place and a flavour that catches your curiosity. Then find the roast you love." />
      <ChoiceSearch value={query} onChange={setQuery} label="Search coffee origins" placeholder="Search country, flavour or bean type…"/>
      <div className="flex flex-wrap gap-2 rise" style={{ marginBottom: 10 }}>
        {["All", "Arabica", "Robusta", "Liberica", "Excelsa"].map((b) => (
          <Pill key={b} active={beanFilter === b} accent={accent} onClick={() => setBeanFilter(b)}>{b}</Pill>
        ))}
      </div>
      <div className="ob-horizontal-scroll flex gap-2 overflow-x-auto pb-2 rise" style={{ marginBottom: 14 }}>
        {Object.keys(ORIGINS).map((ct) => (
          <Pill key={ct} active={continent === ct} accent={accent} onClick={() => { setContinent(ct); setQuery(""); }}>{ct}</Pill>
        ))}
      </div>
      {list.length === 0 && (
        <p style={{ fontFamily: F.body, color: C.faint, fontSize: 14, padding: "20px 4px" }}>
          No origins match these choices. <button type="button" className="ob-inline-reset" onClick={() => { setQuery(""); setBeanFilter("All"); }}>Clear filters</button>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((c) => {
          const active = sel.origin?.n === c.n;
          return (
            <Card key={c.n} active={active} accent={accent} onClick={() => set({ origin: c })}>
              <div className="flex items-start gap-3">
                <span style={{ fontSize: 26, lineHeight: 1 }}>{c.f}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.n}</div>
                  {c.x && <div style={{ fontFamily: F.body, fontSize: 14, color: readableAccent(accent), fontWeight: 600 }}>{c.x}</div>}
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint, marginTop: 5 }}>{c.t}</div>
                  <div className="flex flex-wrap items-center gap-1.5" style={{ marginTop: 8 }}>
                    {c.b.map((bt) => <Tag key={bt}>{BEAN_NAMES[bt]}</Tag>)}
                    <Tag>{c.m}</Tag>
                    {c.p > 0 && <Tag color={readableAccent(accent)} border={`${accent}66`}>+{money(c.p)}</Tag>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {sel.origin && lot && (
        <details className="ob-lot-passport rise-1" aria-label={`Demonstration lot passport for ${sel.origin.n}`}><summary><span>{sel.origin.f} {sel.origin.n} · explore the lot passport</span><ChevronDown size={18}/></summary><div className="ob-lot-expanded">
          <div>
            <div style={{ fontFamily: F.mono, color: "#D9FF66", fontSize: 13, letterSpacing: ".13em", textTransform: "uppercase" }}>Selected origin · field-level verification</div>
            <h3>{sel.origin.f} {sel.origin.n} dossier</h3>
            <p>{sel.origin.t}. These fields demonstrate the future lot passport; they do not verify a producer, crop, process, certification or current inventory.</p>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}><Tag color="#D9FF66" border="#6B5C39">Illustrative record</Tag><Tag color="#F5EDE2" border="#6D5849">Source not supplied</Tag><Tag color="#F5EDE2" border="#6D5849">Availability not connected</Tag></div>
          </div>
          <div className="ob-lot-fields">
            <span><small>Lot ID</small>{lot.lotId}</span><span><small>Region</small>{lot.region}</span>
            <span><small>Producer / co-op</small>{lot.producer}</span><span><small>Process</small>{lot.process}</span>
            <span><small>Harvest</small>{lot.harvest}</span><span><small>Verification</small>Evidence pending</span>
          </div>
        </div></details>
      )}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Choose your roast</div>
      <div className="ob-narrow-stack grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ROASTS.map((r) => (
            <Card key={r.id} active={sel.roast === r.id} accent={r.color} onClick={() => set({ roast: r.id })}>
              <div className="flex items-center gap-2.5">
                <span style={{ width: 18, height: 18, borderRadius: 999, background: r.color, display: "inline-block", border: "2px solid #fff", boxShadow: "0 0 0 1px " + C.line }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 6 }}>{r.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DrinkStep({ sel, set, accent }) {
  const [browseTab, setBrowseTab] = useState(sel.tab);
  const [query, setQuery] = useState("");
  const catalogue = browseTab === "classics" ? CLASSICS : SIGNATURES;
  const list = catalogue.filter(drink => `${drink.n} ${drink.d} ${drink.fam} ${(drink.tag || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const pick = (drink) => set({ ...getDrinkDefaults(drink, sel, EXTRACTIONS), tab: browseTab });
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 2 · The make"
        title="What’s your kind of coffee?"
        sub="A familiar favourite or something a little unexpected. Your chosen beans and roast come along for the ride." />
      <ChoiceSearch value={query} onChange={setQuery} label="Search drinks" placeholder="Search flat white, chocolate, cold brew…"/>
      <div className="ob-choice-tabs flex gap-2 rise" style={{ marginBottom: 16 }}>
        <Pill active={browseTab === "classics"} accent={accent} onClick={() => { setBrowseTab("classics"); setQuery(""); }}><span className="ob-tab-wide">House classics · </span><span className="ob-tab-short">Classics · </span>{CLASSICS.length}</Pill>
        <Pill active={browseTab === "signatures"} accent={accent} onClick={() => { setBrowseTab("signatures"); setQuery(""); }}><span className="ob-tab-wide">Signature creations · </span><span className="ob-tab-short">Signatures · </span>{SIGNATURES.length}</Pill>
      </div>
      <div className="ob-choice-result"><span>{list.length} drinks to discover</span>{sel.drink && <span><CheckCircle2 size={15}/>Selected: {sel.drink.n}</span>}</div>
      {list.length === 0 && <div className="ob-no-results"><Coffee size={28}/><p>No drinks match that search.</p><button type="button" className="ob-inline-reset" onClick={() => setQuery("")}>Show this menu</button></div>}
      <div className="ob-drink-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((d) => {
          const active = sel.drink?.n === d.n;
          return (
            <Card key={d.n} active={active} accent={accent} onClick={() => pick(d)}>
              <span className={`ob-drink-symbol ob-drink-${d.fam}`}>{d.fam === "cold" || d.iced ? <Snowflake size={23}/> : d.fam === "blended" ? <Sparkles size={23}/> : <Coffee size={23}/>}</span>
              <div className="flex items-baseline justify-between gap-2" style={{ paddingRight: active ? 22 : 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{d.n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 14, color: C.faint }}>{money(d.pr)}</span>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 5, lineHeight: 1.45 }}>{d.d}</div>
              <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                {d.fam === "cold" && <Tag><Snowflake size={9} style={{ display: "inline", marginRight: 3 }} />cold</Tag>}
                {d.fam === "blended" && <Tag>blended</Tag>}
                {(d.tag || []).map((t) => <Tag key={t} color={readableAccent(accent)} border={`${accent}55`}>{t}</Tag>)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CraftStep({ sel, set, accent }) {
  const d = sel.drink || { fam: "espresso", sh: 1, n: "" };
  const maxExtraShots = Math.max(0, 4 - d.sh);
  const tempOptions = d.fam === "cold" ? ["Iced"] : d.fam === "blended" ? ["Blended"] : d.n === "Affogato" ? ["Hot"] : ["Hot", "Extra hot", "Iced"];
  const ext = EXTRACTIONS[d.fam];
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 3 · The craft"
        title="Dial in how it's made"
        sub={`Milk, shots, heat and extraction for your ${d.n || "drink"} — small choices, big difference.`} />
      <div className="grid lg:grid-cols-2 gap-x-8 gap-y-7">
        <div className="rise">
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Milk & alternatives</div>
          <div className="ob-narrow-stack grid grid-cols-2 gap-2">
            {MILKS.map((m) => (
              <Card key={m.n} pad={11} active={sel.milk === m.n} accent={accent} onClick={() => set({ milk: m.n, milkTouched: true })}>
                <div className="flex items-baseline justify-between gap-2" style={{ paddingRight: sel.milk === m.n ? 20 : 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.n}</span>
                  {m.p > 0 && <span style={{ fontFamily: F.mono, fontSize: 13, color: C.faint }}>+{money(m.p)}</span>}
                </div>
                {m.v && <div style={{ marginTop: 5 }}><Tag color={C.leaf} border="#CBDCCB">plant-based</Tag></div>}
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div className="rise-1">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Espresso shots</div>
            <div className="flex items-center justify-between" style={{ background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "12px 14px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.sh} included{sel.extraShots > 0 ? ` + ${sel.extraShots} extra` : ""}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint, marginTop: 2 }}>extra shot +{money(EXTRA_SHOT)}</div>
              </div>
              <Qty value={sel.extraShots} min={0} max={maxExtraShots} accent={accent}
                label="extra shots"
                onMinus={() => set({ extraShots: sel.extraShots - 1 })}
                onPlus={() => set({ extraShots: sel.extraShots + 1 })} />
            </div>
          </div>
          <div className="rise-1">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Temperature</div>
            <Seg options={tempOptions} value={sel.temp} onChange={(v) => set({ temp: v })} accent={accent} />
          </div>
          <div className="rise-2">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Extraction</div>
            {ext.length === 1
              ? <span className="ob-extraction-status"><Tag wrap color={C.ink} bg={C.cream} border={C.line}>{ext[0]} — set by your drink</Tag></span>
              : <Seg options={ext} value={sel.extraction} onChange={(v) => set({ extraction: v })} accent={accent} />}
          </div>
          <div className="rise-2">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Caffeine</div>
            <Seg options={CAFFEINE} value={sel.caffeine} onChange={(v) => set({ caffeine: v })} accent={accent} />
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 9, lineHeight: 1.5 }}>Caffeine varies by bean, method, size and shots. Ask the barista for an estimate or choose half-caf or decaf.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhanceStep({ sel, set, accent }) {
  const toggle = (key, val) => {
    if (key === "boosters" && !sel.boosters.includes(val) && sel.boosters.length >= 2) return;
    set({ [key]: sel[key].includes(val) ? sel[key].filter((x) => x !== val) : [...sel[key], val] });
  };
  const boosterLimitReached = sel.boosters.length >= 2;
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 4 · Enhance"
        title="A little something extra?"
        sub="Choose syrups, sweeteners, toppings and up to two optional functional ingredients. Bar staff confirm ingredient availability and suitability." />
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Optional add-ins · choose up to 2</div>
      <div className="ob-narrow-stack grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 rise">
        {BOOSTERS.map((b) => (
          <Card key={b.n} pad={11} active={sel.boosters.includes(b.n)} disabled={!sel.boosters.includes(b.n) && boosterLimitReached} accent={accent} onClick={() => toggle("boosters", b.n)}>
            <div className="flex items-baseline justify-between gap-2" style={{ paddingRight: sel.boosters.includes(b.n) ? 20 : 0 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{b.n}</span>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: C.faint }}>+{money(b.p)}</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 4 }}>{b.d}</div>
          </Card>
        ))}
      </div>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 10, maxWidth: 560 }}>
        Functional ingredients may interact with medicines or be unsuitable for children, pregnancy, allergies or some health conditions. Ask staff before ordering; this menu does not provide medical advice.
      </p>
      <div className="grid lg:grid-cols-2 gap-x-8 gap-y-7" style={{ marginTop: 26 }}>
        <div className="rise-1">
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Flavour syrups · +{money(SYRUP_PRICE)} each</div>
          <div className="flex flex-wrap gap-2">
            {SYRUPS.map((s) => <Pill key={s} active={sel.syrups.includes(s)} accent={accent} onClick={() => toggle("syrups", s)}>{s}</Pill>)}
          </div>
        </div>
        <div className="rise-1">
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Sweetener · on the house</div>
          <div className="flex flex-wrap gap-2">
            {SWEETENERS.map((s) => <Pill key={s} active={sel.sweetener === s} accent={accent} onClick={() => set({ sweetener: s })}>{s}</Pill>)}
          </div>
          {sel.sweetener !== "None" && (
            <div className="flex items-center gap-4" style={{ marginTop: 14 }}>
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.faint }}>Sweetness level</span>
              <Qty value={sel.sweetLevel} min={1} max={4} accent={accent}
                onMinus={() => set({ sweetLevel: sel.sweetLevel - 1 })}
                onPlus={() => set({ sweetLevel: sel.sweetLevel + 1 })} />
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 26 }} className="rise-2">
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Toppings</div>
        <div className="ob-narrow-stack grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {TOPPINGS.map((t) => (
            <Card key={t.n} pad={11} active={sel.toppings.includes(t.n)} accent={accent} onClick={() => toggle("toppings", t.n)}>
              <div className="flex items-baseline justify-between gap-2" style={{ paddingRight: sel.toppings.includes(t.n) ? 20 : 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t.n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 13, color: C.faint }}>+{money(t.p)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinishStep({ sel, set, accent }) {
  const compactDrink = ["Espresso", "Doppio", "Ristretto", "Macchiato", "Affogato", "Espresso con Panna"].includes(sel.drink?.n);
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 5 · Finish"
        title="The finishing details."
        sub="Our sizes grow like the plant does — seed to harvest. Bringing your own cup earns a little back." />
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Cup size</div>
      <div className="ob-narrow-stack grid grid-cols-2 lg:grid-cols-4 gap-3 rise">
        {SIZES.map((s, i) => {
          const disabled = compactDrink && s.id !== "seed";
          return (
          <Card key={s.id} active={sel.size === s.id} accent={accent} disabled={disabled} onClick={() => !disabled && set({ size: s.id })}>
            <div className="flex items-end gap-3">
              <span style={{ width: 16, height: 16 + i * 9, background: accent, borderRadius: 4, display: "inline-block", opacity: 0.85, transition: "height .2s ease" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.n}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint }}>{s.oz} oz{s.p > 0 ? ` · +${money(s.p)}` : ""}{disabled ? " · not compatible" : ""}</div>
              </div>
            </div>
          </Card>
        )})}
      </div>
      <div style={{ marginTop: 26 }} className="rise-1">
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: readableAccent(accent), textTransform: "uppercase", marginBottom: 10 }}>Your cup, your way</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CUPS.map((c) => (
            <Card key={c.n} active={sel.cup === c.n} accent={accent} onClick={() => set({ cup: c.n })}>
              <div className="flex items-center gap-2">
                {c.eco && <Leaf size={15} color={C.leaf} />}
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.n}</span>
              </div>
              {c.p < 0 && <div style={{ fontFamily: F.mono, fontSize: 13, color: C.leaf, marginTop: 5 }}>−{money(-c.p)} thank-you</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, price, green }) {
  if (!value) return null;
  return (
    <div className="ob-review-row">
      <span className="ob-review-label" style={{ fontFamily: F.body, fontSize: 14 }}>{label}</span>
      <span className="ob-review-value" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.ink }}>{value}</span>
      {price !== undefined && <span className="ob-review-price" style={{ fontFamily: F.mono, fontSize: 14, color: green ? C.leaf : C.faint, flexShrink: 0, minWidth: 52, textAlign: "right" }}>{price}</span>}
    </div>
  );
}

function ReviewGroup({ g, children, accent, onJump }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.3, color: readableAccent(accent), textTransform: "uppercase" }}>{g.t}</span>
        <button onClick={() => onJump(g.step)} style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1, color: C.faint, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>EDIT</button>
      </div>
      {children}
    </div>
  );
}

function ReviewStep({ sel, set, accent, parts, cupProps, tags, safety, onJump }) {
  const o = sel.origin, d = sel.drink;
  const sizeObj = SIZES.find((s) => s.id === sel.size);
  const groups = [
    { t: "Origin & roast", step: 1 }, { t: "Drink", step: 2 }, { t: "Craft", step: 3 },
    { t: "Enhance", step: 4 }, { t: "Finish", step: 5 },
  ];
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 6 · Review" title="Your cup. Every detail." />
      <div className="ob-review-layout grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 rise" style={{ background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
          <ReviewGroup g={groups[0]} accent={accent} onJump={onJump}>
            <Row label="Origin" value={`${o.f} ${o.n} · ${o.b.map((b) => BEAN_NAMES[b]).join(" / ")}`} price={o.p > 0 ? `+${money(o.p)}` : "incl."} />
            <Row label="Roast" value={ROASTS.find((r) => r.id === sel.roast).name} price="incl." />
          </ReviewGroup>
          <ReviewGroup g={groups[1]} accent={accent} onJump={onJump}>
            <Row label={sel.tab === "signatures" ? "Signature" : "Classic"} value={d.n} price={money(d.pr)} />
          </ReviewGroup>
          <ReviewGroup g={groups[2]} accent={accent} onJump={onJump}>
            <Row label="Milk" value={sel.milk} price={cupProps.milkP > 0 ? `+${money(cupProps.milkP)}` : "incl."} />
            <Row label="Shots" value={`${d.sh + sel.extraShots} total`} price={sel.extraShots > 0 ? `+${money(sel.extraShots * EXTRA_SHOT)}` : "incl."} />
            <Row label="Temperature" value={sel.temp} />
            <Row label="Extraction" value={sel.extraction} />
            <Row label="Caffeine" value={sel.caffeine} />
          </ReviewGroup>
          <ReviewGroup g={groups[3]} accent={accent} onJump={onJump}>
            {sel.boosters.map((b) => <Row key={b} label="Optional add-in" value={b} price={`+${money(BOOSTERS.find((x) => x.n === b).p)}`} />)}
            {sel.syrups.length > 0 && <Row label="Syrups" value={sel.syrups.join(", ")} price={`+${money(sel.syrups.length * SYRUP_PRICE)}`} />}
            {sel.sweetener !== "None" && <Row label="Sweetener" value={`${sel.sweetener} · level ${sel.sweetLevel}`} price="incl." />}
            {sel.toppings.map((t) => <Row key={t} label="Topping" value={t} price={`+${money(TOPPINGS.find((x) => x.n === t).p)}`} />)}
            {sel.boosters.length + sel.syrups.length + sel.toppings.length === 0 && sel.sweetener === "None" &&
              <Row label="—" value="Kept pure" price="incl." />}
          </ReviewGroup>
          <ReviewGroup g={groups[4]} accent={accent} onJump={onJump}>
            <Row label="Size" value={`${sizeObj.n} · ${sizeObj.oz} oz`} price={sizeObj.p > 0 ? `+${money(sizeObj.p)}` : "incl."} />
            <Row label="Cup" value={sel.cup} price={parts.cupP < 0 ? `−${money(-parts.cupP)}` : "incl."} green={parts.cupP < 0} />
          </ReviewGroup>
          <div className="flex items-baseline justify-between" style={{ paddingTop: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: C.faint }}>ILLUSTRATIVE SUBTOTAL · CAD</span>
            <span style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 600, color: readableAccent(accent) }}>{money(parts.total)}</span>
          </div>
          <div className="ob-safety-rail" style={{ marginTop: 16 }}>
            <b>Cup Passport · safety and verification</b>
            <p><strong>Caffeine:</strong> {safety.caffeine}. <strong>Selected allergen signals:</strong> {safety.allergens.length ? safety.allergens.join(", ") : "none from current selections"}. Shared preparation equipment means cross-contact remains possible; staff must confirm ingredients and availability before preparation.</p>
          </div>
          <label className="ob-safety-ack"><input type="checkbox" checked={sel.safetyAck} onChange={(event) => set({ safetyAck: event.target.checked })}/><span>I understand these are selection signals, not an allergen-free guarantee. A barista must verify ingredients, cross-contact, caffeine options and availability before preparing this cup.</span></label>
        </div>
        <div className="lg:col-span-2 rise-1" style={{ background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: 18, textAlign: "center" }}>
          <CupSVG uid="review" {...cupProps.svg} width={170} />
          <div className="flex flex-wrap justify-center gap-1.5" style={{ marginTop: 12 }}>
            {tags.map((t) => <Tag key={t} color={readableAccent(accent)} border={`${accent}55`}>{t}</Tag>)}
          </div>
          <div style={{ marginTop: 18, textAlign: "left" }}>
            <label htmlFor="ob-cup-name" style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.3, color: C.faint, textTransform: "uppercase" }}>A name for your cup</label>
            <input id="ob-cup-name" value={sel.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Amara"
              style={{ width: "100%", marginTop: 6, fontFamily: F.body, fontSize: 15, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.line}`, outline: "none", background: C.paper, color: C.ink, boxSizing: "border-box" }} />
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 10 }}>
              Send the request below. A barista must confirm ingredients, allergens, cross-contact, availability, tax and payment at the counter before preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoneScreen({ sel, accent, cupProps, receipt, onReset }) {
  const sizeObj = SIZES.find((s) => s.id === sel.size);
  const [copied, setCopied] = useState(false);
  const orderNo = receipt?.reference || "Reference unavailable";
  const onAccent = accent === ROASTS[0].color ? C.espresso : "#fff";
  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(orderNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch { setCopied(false); }
  };
  const shareReference = async () => {
    if (!navigator.share) return copyReference();
    try { await navigator.share({ title: "Deldiet Origin Bar request", text: `Deldiet request ${orderNo}` }); } catch { /* sharing was cancelled */ }
  };
  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "100%", paddingTop: 40, paddingBottom: 40 }}>
      <div className="rise" style={{ width: 56, height: 56, borderRadius: 999, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 28px ${accent}55` }}>
        <Check size={28} color={onAccent} strokeWidth={3} />
      </div>
      <div className="rise-1" style={{ maxWidth: "100%", fontFamily: F.mono, fontSize: 14, letterSpacing: 1.2, color: C.faint, marginTop: 22, textTransform: "uppercase", overflowWrap: "anywhere" }}>Request reference {orderNo}</div>
      <h2 className="rise-1" style={{ fontFamily: F.disp, fontSize: "clamp(26px,4vw,38px)", color: C.ink, margin: "8px 0 0" }}>
        {sel.name ? `${sel.name}, your` : "Your"} cup request was received
      </h2>
      <p className="rise-1" style={{ fontFamily: F.body, color: C.faint, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
        {sel.drink.n} · {sizeObj.n} ({sizeObj.oz} oz) · {sel.origin.n} beans, {ROASTS.find((r) => r.id === sel.roast).name.toLowerCase()} roast. Keep this reference and show it to Deldiet staff. A barista still confirms ingredients, availability, final price and preparation time before making anything.
      </p>
      <p className="rise-1" style={{ fontFamily: F.mono, color: C.faint, fontSize: 13, margin: "8px 0 0", maxWidth: 420, lineHeight: 1.5 }}>
        For kiosk privacy, this receipt clears from this device after 10 minutes. Copy or share the reference now.
      </p>
      <div className="rise-2" style={{ marginTop: 20 }}>
        <CupSVG uid="done" {...cupProps.svg} width={140} />
      </div>
      <div className="rise-2" style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={copyReference} style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "11px 18px", cursor: "pointer" }}>{copied ? "Reference copied" : "Copy reference"}</button>
        <button type="button" onClick={shareReference} style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "11px 18px", cursor: "pointer" }}>Share</button>
      </div>
      <div className="rise-2" style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onReset} style={{
          fontFamily: F.body, fontWeight: 700, fontSize: 15, color: readableAccent(accent),
          background: "transparent", border: `2px solid ${accent}`, borderRadius: 999, padding: "12px 28px", cursor: "pointer",
        }}>
          Craft another cup
        </button>
        <Link href="/passport?tab=brew" style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.ink, textDecoration: "none", border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "13px 22px", background: C.paper }}>
          Open Brew Lab
        </Link>
      </div>
      <div className="rise-2 flex items-center gap-1.5" style={{ marginTop: 22, fontFamily: F.mono, fontSize: 13, letterSpacing: 1.2, color: C.faint, textTransform: "uppercase" }}>
        <Heart size={11} /> crafted at Deldiet Origin Bar
      </div>
    </div>
  );
}

/* ============================ APP SHELL ============================ */

const FRESH = {
  origin: null, roast: "medium", drink: null, tab: "classics",
  milk: "Organic whole", milkTouched: false, extraShots: 0, temp: "Hot", extraction: "Espresso machine",
  caffeine: "Regular", boosters: [], syrups: [], sweetener: "None", sweetLevel: 2,
  toppings: [], size: "sprout", cup: "For here · ceramic", name: "", safetyAck: false,
};
const DRAFT_VERSION = "origin-bar-concept-v1";
const RECEIPT_VERSION = "origin-bar-receipt-v1";
const RECEIPT_TTL_MS = 10 * 60 * 1000;

function restoreOriginBarDraft(value) {
  if (!value || value.version !== DRAFT_VERSION || !value.sel || !Number.isInteger(value.step) || value.step < 1 || value.step > 6) return null;
  const raw = value.sel;
  const origin = Object.values(ORIGINS).flat().find((item) => item.n === raw.origin?.n) || null;
  const drink = [...CLASSICS, ...SIGNATURES].find((item) => item.n === raw.drink?.n) || null;
  if (value.step > 1 && !origin) return null;
  if (value.step > 2 && !drink) return null;
  const allowed = (items, catalogue, max = catalogue.length) => Array.isArray(items) && items.length <= max && items.every((item) => catalogue.includes(item)) && new Set(items).size === items.length ? items : [];
  const boosterNames = BOOSTERS.map((item) => item.n);
  const toppingNames = TOPPINGS.map((item) => item.n);
  const milkNames = MILKS.map((item) => item.n);
  const restored = {
    ...FRESH,
    origin,
    drink,
    roast: ROASTS.some((item) => item.id === raw.roast) ? raw.roast : FRESH.roast,
    tab: drink && SIGNATURES.some((item) => item.n === drink.n) ? "signatures" : "classics",
    milk: milkNames.includes(raw.milk) ? raw.milk : FRESH.milk,
    milkTouched: raw.milkTouched === true,
    extraShots: Number.isInteger(raw.extraShots) && raw.extraShots >= 0 && raw.extraShots <= 4 ? raw.extraShots : 0,
    temp: ["Hot", "Extra hot", "Iced", "Blended"].includes(raw.temp) ? raw.temp : FRESH.temp,
    extraction: Object.values(EXTRACTIONS).flat().includes(raw.extraction) ? raw.extraction : FRESH.extraction,
    caffeine: CAFFEINE.includes(raw.caffeine) ? raw.caffeine : FRESH.caffeine,
    boosters: allowed(raw.boosters, boosterNames, 2),
    syrups: allowed(raw.syrups, SYRUPS),
    sweetener: SWEETENERS.includes(raw.sweetener) ? raw.sweetener : FRESH.sweetener,
    sweetLevel: Number.isInteger(raw.sweetLevel) && raw.sweetLevel >= 1 && raw.sweetLevel <= 4 ? raw.sweetLevel : FRESH.sweetLevel,
    toppings: allowed(raw.toppings, toppingNames),
    size: SIZES.some((item) => item.id === raw.size) ? raw.size : FRESH.size,
    cup: CUPS.some((item) => item.n === raw.cup) ? raw.cup : FRESH.cup,
    name: typeof raw.name === "string" ? raw.name.slice(0, 80) : "",
    safetyAck: raw.safetyAck === true,
  };
  const requestKey = typeof value.requestKey === "string" && /^[A-Za-z0-9:_-]{16,128}$/.test(value.requestKey) ? value.requestKey : "";
  return { sel: restored, step: value.step, requestKey };
}

function restoreOriginBarReceipt(value) {
  if (!value || value.version !== RECEIPT_VERSION || !value.receipt || !value.sel) return null;
  const savedAt = Number(value.savedAt);
  const age = Date.now() - savedAt;
  if (!Number.isFinite(savedAt) || age < 0 || age >= RECEIPT_TTL_MS) return null;
  const reference = typeof value.receipt.reference === "string" ? value.receipt.reference : "";
  const trackingToken = typeof value.receipt.trackingToken === "string" ? value.receipt.trackingToken : "";
  const origin = Object.values(ORIGINS).flat().find((item) => item.n === value.sel.origin?.n) || null;
  const drink = [...CLASSICS, ...SIGNATURES].find((item) => item.n === value.sel.drink?.n) || null;
  if (!reference || !trackingToken || !origin || !drink) return null;
  const draft = restoreOriginBarDraft({ version: DRAFT_VERSION, sel: value.sel, step: 6, requestKey: "" });
  if (!draft) return null;
  return { receipt: { ...value.receipt, savedAt }, sel: draft.sel };
}

export default function OriginBarKiosk() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState(FRESH);
  const [receipt, setReceipt] = useState(null);
  const [tasteMatchOpen, setTasteMatchOpen] = useState(false);
  const [matchReason, setMatchReason] = useState("");
  const [idleWarning, setIdleWarning] = useState(false);
  const [requestState, setRequestState] = useState("idle");
  const [requestError, setRequestError] = useState("");
  const [requestKey, setRequestKey] = useState("");
  const [idleCycle, setIdleCycle] = useState(0);
  const submissionRef = useRef({ generation: 0, controller: null });
  const idleWarningRef = useRef(false);
  const idleDialogRef = useRef(null);
  const idleContinueRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const requestErrorRef = useRef(null);
  const set = (patch) => {
    if (requestState === "submitting") return;
    setRequestError("");
    setRequestKey("");
    setSel((s) => ({ ...s, ...patch }));
  };

  const roastObj = ROASTS.find((r) => r.id === sel.roast) || ROASTS[1];
  const accent = roastObj.color;
  const onAccent = roastObj.id === "light" ? C.espresso : "#fff";

  const cupProps = useMemo(() => {
    const milkObj = MILKS.find((m) => m.n === sel.milk);
    const hasMilk = milkObj && !milkObj.none;
    const topObjs = sel.toppings.map((t) => TOPPINGS.find((x) => x.n === t));
    const driz = topObjs.find((t) => t?.driz)?.driz || sel.drink?.driz || null;
    return {
      milkP: hasMilk ? milkObj.p : 0,
      svg: {
        roast: roastObj,
        hasMilk,
        foam: !!(sel.drink?.foam || topObjs.some((t) => t?.foam)),
        whip: !!(sel.drink?.whip || topObjs.some((t) => t?.whip)),
        iced: sel.temp === "Iced",
        blended: sel.temp === "Blended",
        drizzle: driz,
        boosters: sel.boosters.length,
        sizeIdx: SIZES.findIndex((s) => s.id === sel.size),
      },
    };
  }, [sel, roastObj]);

  const parts = useMemo(() => {
    const sizeP = SIZES.find((s) => s.id === sel.size).p;
    const cupP = CUPS.find((c) => c.n === sel.cup).p;
    const boostP = sel.boosters.reduce((a, b) => a + BOOSTERS.find((x) => x.n === b).p, 0);
    const topP = sel.toppings.reduce((a, t) => a + TOPPINGS.find((x) => x.n === t).p, 0);
    const total = (sel.drink?.pr || 0) + (sel.origin?.p || 0) + sizeP + cupP + boostP + topP +
      cupProps.milkP + sel.extraShots * EXTRA_SHOT + sel.syrups.length * SYRUP_PRICE;
    return { total: Math.max(total, 0), cupP };
  }, [sel, cupProps.milkP]);

  const tags = useMemo(() => {
    const t = [];
    if (sel.origin) t.push(...sel.origin.t.split("·").map((x) => x.trim()).filter((x) => x.length < 16).slice(0, 2));
    t.push(`${roastObj.name.toLowerCase()} roast`);
    if (sel.drink?.tag) t.push(...sel.drink.tag);
    if (sel.syrups[0]) t.push(sel.syrups[0].toLowerCase());
    const milkObj = MILKS.find((m) => m.n === sel.milk);
    if (milkObj?.v) t.push("plant-based");
    return [...new Set(t)].slice(0, 5);
  }, [sel, roastObj]);

  const safety = useMemo(() => {
    const allergens = new Set();
    const milk = sel.milk || "";
    if (["Organic whole", "Organic 2%", "Skim", "Lactose-free", "A2 milk", "Half & half"].includes(milk)) allergens.add("Milk");
    if (["Almond", "Cashew", "Macadamia"].includes(milk) || sel.drink?.n === "Pistachio Silk") allergens.add("Tree nuts");
    if (milk === "Soy") allergens.add("Soy");
    if (milk === "Coconut" || sel.boosters.includes("MCT oil") || sel.toppings.includes("Toasted coconut")) allergens.add("Coconut");
    if (sel.boosters.includes("Grass-fed ghee") || sel.toppings.some((t) => ["Whipped cream", "Vanilla cold foam"].includes(t)) || ["Affogato", "Tiramisu Cloud"].includes(sel.drink?.n)) allergens.add("Milk");
    if (sel.boosters.includes("Bee pollen")) allergens.add("Bee pollen");
    if (sel.boosters.includes("Plant protein")) allergens.add("Pea / seed protein");
    if (sel.syrups.includes("Hazelnut")) allergens.add("Hazelnut ingredient check");
    const shots = (sel.drink?.sh || 0) + sel.extraShots;
    let caffeine = sel.caffeine.startsWith("Decaf") ? "approximately 2–15 mg" : sel.drink?.fam === "cold" ? "approximately 100–200 mg" : shots ? `approximately ${shots * 55}–${shots * 85} mg` : "varies by origin and method";
    if (sel.caffeine === "Half-caf") caffeine = shots ? `approximately ${shots * 28}–${shots * 45} mg` : "approximately half the regular recipe";
    return { allergens: [...allergens], caffeine };
  }, [sel]);

  useEffect(() => {
    let draft = null;
    let savedReceipt = null;
    try {
      const saved = window.sessionStorage.getItem("deldiet-origin-bar-draft");
      if (saved) draft = JSON.parse(saved);
      const success = window.sessionStorage.getItem("deldiet-origin-bar-receipt");
      if (success) savedReceipt = JSON.parse(success);
    } catch { /* start with a clean local kiosk session */ }
    const frame = window.requestAnimationFrame(() => {
      const restoredReceipt = restoreOriginBarReceipt(savedReceipt);
      if (restoredReceipt) {
        setSel(restoredReceipt.sel);
        setReceipt(restoredReceipt.receipt);
        setStep(7);
        return;
      }
      if (savedReceipt) {
        try { window.sessionStorage.removeItem("deldiet-origin-bar-receipt"); } catch { /* ignore unavailable storage */ }
      }
      const restored = restoreOriginBarDraft(draft);
      if (restored) {
        setSel(restored.sel);
        setStep(restored.step);
        setRequestKey(restored.requestKey);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    try {
      if (step >= 1 && step <= 6) window.sessionStorage.setItem("deldiet-origin-bar-draft", JSON.stringify({ version: DRAFT_VERSION, sel, step, requestKey }));
      else window.sessionStorage.removeItem("deldiet-origin-bar-draft");
    } catch { /* the kiosk remains usable when storage is unavailable */ }
  }, [sel, step, requestKey]);

  useEffect(() => {
    idleWarningRef.current = idleWarning;
  }, [idleWarning]);

  useEffect(() => {
    if (!idleWarning) return;
    lastFocusedRef.current = document.activeElement;
    window.requestAnimationFrame(() => idleContinueRef.current?.focus());
    return () => lastFocusedRef.current?.focus?.();
  }, [idleWarning]);

  useEffect(() => {
    if (!requestError) return;
    window.requestAnimationFrame(() => {
      requestErrorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      requestErrorRef.current?.focus();
    });
  }, [requestError]);

  useEffect(() => {
    if (step < 1 || step > 6) return;
    const frame = window.requestAnimationFrame(() => document.querySelector("#ob-scroll .ob-step-heading")?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (step === 0 || step === 7) return;
    let warningTimer;
    let resetTimer;
    const arm = () => {
      if (idleWarningRef.current) return;
      window.clearTimeout(warningTimer); window.clearTimeout(resetTimer);
      warningTimer = window.setTimeout(() => setIdleWarning(true), 240000);
      resetTimer = window.setTimeout(() => {
        submissionRef.current.generation += 1;
        submissionRef.current.controller?.abort();
        submissionRef.current.controller = null;
        setSel(FRESH);
        setStep(0);
        setMatchReason("");
        setIdleWarning(false);
        setRequestState("idle");
        setRequestError("");
        setRequestKey("");
        window.dispatchEvent(new Event("deldiet:clear-private"));
      setReceipt(null);
      }, 300000);
    };
    ["pointerdown", "keydown", "touchstart"].forEach((event) => window.addEventListener(event, arm, { passive: true }));
    arm();
    return () => { window.clearTimeout(warningTimer); window.clearTimeout(resetTimer); ["pointerdown", "keydown", "touchstart"].forEach((event) => window.removeEventListener(event, arm)); };
  }, [step, idleCycle]);

  useEffect(() => {
    if (step !== 7 || !receipt?.savedAt) return;
    const remaining = RECEIPT_TTL_MS - (Date.now() - receipt.savedAt);
    const clearReceipt = () => {
      setSel(FRESH);
      setMatchReason("");
      setTasteMatchOpen(false);
      window.dispatchEvent(new Event("deldiet:clear-private"));
      setReceipt(null);
      setStep(0);
      setRequestState("idle");
      setRequestError("");
      setRequestKey("");
      try { window.sessionStorage.removeItem("deldiet-origin-bar-receipt"); } catch { /* ignore unavailable storage */ }
    };
    if (remaining <= 0) {
      const frame = window.requestAnimationFrame(clearReceipt);
      return () => window.cancelAnimationFrame(frame);
    }
    const timer = window.setTimeout(clearReceipt, remaining);
    return () => window.clearTimeout(timer);
  }, [step, receipt?.savedAt]);

  useEffect(() => () => {
    submissionRef.current.generation += 1;
    submissionRef.current.controller?.abort();
  }, []);

  const submitting = requestState === "submitting";
  const canNext = !submitting && (step === 1 ? !!sel.origin : step === 2 ? !!sel.drink : step === 6 ? sel.safetyAck : true);
  const go = (n) => {
    if (!canVisitOriginBarStep(n, sel, submitting)) return;
    if (n < 6 && step === 6) {
      setSel((current) => ({ ...current, safetyAck: false }));
      setRequestError("");
      setRequestKey("");
    }
    setStep(n);
    const el = document.getElementById("ob-scroll");
    if (el) el.scrollTop = 0;
  };
  const next = async () => {
    if (!canNext || (step === 6 && submissionRef.current.controller)) return;
    if (step !== 6) {
      go(step + 1);
      return;
    }

    const idempotencyKey = requestKey || createIdempotencyKey("origin-bar");
    if (!requestKey) setRequestKey(idempotencyKey);
    submissionRef.current.controller?.abort();
    const controller = new AbortController();
    const generation = submissionRef.current.generation + 1;
    submissionRef.current = { generation, controller };
    setRequestState("submitting");
    setRequestError("");
    try {
      const receipt = await submitServiceRequest({
        type: "origin_bar_request",
        source: "origin-bar",
        customer: { name: sel.name || undefined },
        estimatedSubtotalCents: Math.round(parts.total * 100),
        payload: {
          schemaVersion: 1,
          catalogueVersion: "origin-bar-concept-v1",
          safetyAcknowledged: sel.safetyAck,
          selection: {
            origin: sel.origin?.n,
            roast: sel.roast,
            drink: sel.drink?.n,
            drinkMenu: sel.tab,
            milk: sel.milk,
            extraShots: sel.extraShots,
            temperature: sel.temp,
            extraction: sel.extraction,
            caffeine: sel.caffeine,
            boosters: sel.boosters,
            syrups: sel.syrups,
            sweetener: sel.sweetener,
            sweetLevel: sel.sweetLevel,
            toppings: sel.toppings,
            size: sel.size,
            cup: sel.cup,
            cupName: sel.name.trim(),
          },
          pricingState: "illustrative_pending_staff_review",
        },
      }, idempotencyKey, { signal: controller.signal });
      if (submissionRef.current.generation !== generation || controller.signal.aborted) return;
      const savedAt = Date.now();
      setReceipt({ ...receipt, savedAt });
      setRequestState("idle");
      setStep(7);
      try {
        window.sessionStorage.removeItem("deldiet-origin-bar-draft");
        window.sessionStorage.setItem("deldiet-origin-bar-receipt", JSON.stringify({ version: RECEIPT_VERSION, receipt, sel, savedAt }));
      } catch { /* the on-screen receipt remains available */ }
    } catch (error) {
      if (submissionRef.current.generation !== generation || controller.signal.aborted) return;
      setRequestState("error");
      if (error?.status === 409) setRequestKey("");
      setRequestError(error instanceof Error ? error.message : "We could not save this request. Your cup is still here—please try again.");
    } finally {
      if (submissionRef.current.generation === generation) submissionRef.current.controller = null;
    }
  };
  const reset = () => {
    window.dispatchEvent(new Event("deldiet:clear-private"));
    if (submitting) return;
    setSel(FRESH);
    setMatchReason("");
    setTasteMatchOpen(false);
    setIdleWarning(false);
    setRequestState("idle");
    setRequestError("");
    setRequestKey("");
    setReceipt(null);
    try { window.sessionStorage.removeItem("deldiet-origin-bar-receipt"); } catch { /* ignore unavailable storage */ }
    go(0);
  };
  const continueSession = () => {
    setIdleWarning(false);
    setIdleCycle((cycle) => cycle + 1);
  };
  const handleIdleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      continueSession();
      return;
    }
    if (event.key !== "Tab" || !idleDialogRef.current) return;
    const focusable = [...idleDialogRef.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((item) => !item.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const applyTasteMatch = (match) => {
    const origin = Object.values(ORIGINS).flat().find((item) => item.n === match.country);
    const drink = [...CLASSICS, ...SIGNATURES].find((item) => item.n === match.drink);
    setSel({ ...FRESH, ...getDrinkDefaults(drink, FRESH, EXTRACTIONS), origin, roast: match.roast, tab: SIGNATURES.includes(drink) ? "signatures" : "classics" });
    setMatchReason(`${match.label}: ${match.why}`);
    setTasteMatchOpen(false);
    go(1);
  };

  const screen =
    step === 1 ? <OriginStep sel={sel} set={set} accent={accent} /> :
    step === 2 ? <DrinkStep sel={sel} set={set} accent={accent} /> :
    step === 3 ? <CraftStep sel={sel} set={set} accent={accent} /> :
    step === 4 ? <EnhanceStep sel={sel} set={set} accent={accent} /> :
    step === 5 ? <FinishStep sel={sel} set={set} accent={accent} /> :
    step === 6 ? <ReviewStep sel={sel} set={set} accent={accent} parts={parts} cupProps={cupProps} tags={tags} safety={safety} onJump={go} /> :
    step === 7 ? <DoneScreen sel={sel} accent={accent} cupProps={cupProps} receipt={receipt} onReset={reset} /> : null;

  return (
    <div className="origin-bar-app flex flex-col" style={{ height: "100dvh", background: C.paper, fontFamily: F.body, "--ob-accent": accent }}>
      <UtilityBar />
      {step === 0 ? (
        tasteMatchOpen ? <TasteMatch onBack={() => setTasteMatchOpen(false)} onApply={applyTasteMatch}/> : <div className="ob-scroll-region flex-1 overflow-y-auto"><Welcome onBegin={() => go(1)} onTasteMatch={() => setTasteMatchOpen(true)} /></div>
      ) : (
        <>
          <header className="ob-builder-heading">
            <div><span className="ob-eyebrow">{step <= 6 ? "A LITTLE MORE YOU, IN EVERY CUP" : "YOUR ORIGIN BAR REQUEST"}</span><h1>{step <= 6 ? "Make it yours." : "Beautifully considered."}</h1></div>
            {step <= 6 && <div className="ob-builder-tools"><span className="ob-progress-caption">STEP {step} <span>/ 06</span></span><button type="button" className="ob-reset-button" aria-label="Start over and clear this cup" onClick={reset} disabled={submitting}><RotateCcw size={16}/><span>Start over</span></button></div>}
          </header>
          {step >= 1 && step <= 6 && <StepNavigation step={step} sel={sel} submitting={submitting} onGo={go}/>}
          <main id="ob-scroll" className="ob-scroll-region flex-1 overflow-y-auto ok-scroll">
            <div className="ob-workspace-container">
              <details className="ob-mode-note"><summary><span>Demonstration menu · staff confirmation required</span><ChevronDown size={15}/></summary><p>Requests go to staff for review when the service is connected. Nothing is prepared or charged automatically. Origins, pricing and availability are illustrative until verified lot, inventory and point-of-sale records are connected.</p></details>
              {requestError && <div ref={requestErrorRef} tabIndex={-1} className="ob-truth-note" role="alert" style={{ borderColor: "#B85C4D", background: "#FFF3EF", color: "#6E2E24" }}><span aria-hidden="true">!</span><span><b>Request not saved.</b> {requestError}</span></div>}
              {matchReason && step <= 5 && <div style={{ marginBottom: 18, padding: "12px 14px", borderLeft: `4px solid ${accent}`, background: "#fff", color: C.ink, fontSize: 13, lineHeight: 1.5 }}><b>Taste Match starting point:</b> {matchReason} Every choice remains editable.</div>}
              {step >= 1 && step <= 5 ? (
                <div className="ob-workspace-grid">
                  <div className="ob-choice-workspace" style={{ minWidth: 0 }}>{screen}</div>
                  <CupSummary sel={sel} roastObj={roastObj} cupProps={cupProps} parts={parts} tags={tags} safety={safety} onGo={go} submitting={submitting}/>
                </div>
              ) : screen}
            </div>
          </main>
          {step >= 1 && step <= 5 && (
            <details className="ob-mobile-passport">
              <summary>
                <div><b>{sel.drink?.n || "Build your cup"} · {sel.origin ? `${sel.origin.f} ${sel.origin.n}` : "origin pending"}</b><span>View your cup & ingredients</span></div>
                <strong aria-live="polite">{money(parts.total)}<ChevronDown size={17}/></strong>
              </summary>
              <div className="ob-mobile-passport-panel">
                <div className="ob-mobile-cup"><CupSVG uid="mobile-summary" {...cupProps.svg} width={110}/><span>{roastObj.name} roast · {sel.temp}</span></div>
                <div><small>Your recipe</small><p>{sel.milk}<br/>{sel.extraction}<br/>{SIZES.find(size => size.id === sel.size)?.oz} oz · {sel.cup}</p></div>
                <div><small>Caffeine</small><p>{safety.caffeine}</p></div>
                <div><small>Safety</small><p>{safety.allergens.length ? safety.allergens.join(", ") : "No selected signals"}. Shared-equipment cross-contact remains possible.</p></div>
              </div>
            </details>
          )}
          {step >= 1 && step <= 6 && (
            <footer className="ob-flow-footer flex items-center justify-between gap-3 px-4 sm:px-6" aria-label="Cup builder actions">
              <button type="button" onClick={() => go(step - 1)} disabled={submitting} className="ob-back flex items-center gap-1" style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: "#D8C4A8", background: "none", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? .6 : 1, padding: "10px 4px" }}>
                <ChevronLeft size={16} /> Back
              </button>
              <div className="ob-footer-context"><span>{!canNext && !submitting ? step === 1 ? "Choose an origin to continue" : step === 2 ? "Choose a drink to continue" : "Confirm the ingredient check above" : step === 6 ? "Ready for staff review" : "Your selections stay with you"}</span><b>{money(parts.total)} <small>CAD · estimated</small></b></div>
              <button type="button" onClick={next} disabled={!canNext} aria-busy={submitting} aria-label={step === 6 ? (submitting ? "Sending cup request" : `Send cup request, estimated subtotal ${money(parts.total)}`) : `Continue to ${STEP_LABELS[step]}`} className="ob-next flex items-center gap-1.5" style={{
                fontFamily: F.body, fontWeight: 700, fontSize: 15, color: onAccent,
                background: canNext ? accent : "#4A372B", border: "none", borderRadius: 999, padding: "13px 22px",
                cursor: canNext ? "pointer" : "default", opacity: canNext ? 1 : 0.7, transition: "background .2s ease",
              }}>
                {step === 6 ? (submitting ? "Sending…" : <><span>Send request</span><span className="ob-next-target"> · {money(parts.total)}</span></>) : <><span>Continue</span><span className="ob-next-target"> · {STEP_LABELS[step]}</span></>} <ChevronRight size={16} />
              </button>
            </footer>
          )}
        </>
      )}
      {idleWarning && <div role="alertdialog" aria-modal="true" aria-labelledby="idle-title" style={{ position: "fixed", zIndex: 100, inset: 0, display: "grid", placeItems: "center", padding: "max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left))", background: "rgba(22,14,10,.78)" }}><div ref={idleDialogRef} onKeyDown={handleIdleKeyDown} style={{ width: "min(460px,100%)", padding: 28, background: C.card, border: `2px solid ${accent}`, boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}><div style={{ fontFamily: F.mono, color: readableAccent(accent), fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase" }}>Kiosk privacy reset</div><h2 id="idle-title" style={{ margin: "12px 0 8px", fontFamily: F.disp, fontSize: 36, fontWeight: 400 }}>Still building this cup?</h2><p style={{ margin: 0, color: C.faint, fontSize: 15, lineHeight: 1.6 }}>This local session clears automatically after inactivity so the next guest cannot see your selections.</p><div className="ob-idle-actions" style={{ marginTop: 22 }}><button ref={idleContinueRef} type="button" onClick={continueSession} style={{ flex: 1, border: 0, borderRadius: 999, background: accent, color: onAccent, fontWeight: 700, cursor: "pointer" }}>Continue</button><button type="button" onClick={reset} style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 999, background: C.paper, color: C.ink, fontWeight: 700, cursor: "pointer" }}>Clear session</button></div></div></div>}
    </div>
  );
}
