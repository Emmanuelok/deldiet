"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Coffee, Leaf, ChevronLeft, ChevronRight, Check, Plus, Minus,
  Snowflake, MapPin, Clock, Heart
} from "lucide-react";

/* ============================================================
   ORIGIN BAR — a bean-to-cup coffee experience kiosk
   Flow: Welcome → Origin → Drink → Craft → Enhance → Finish → Review → Done
   ============================================================ */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Young+Serif&family=Albert+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
@keyframes riseIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }
@keyframes pour { from { transform:scaleY(0);} to { transform:scaleY(1);} }
.rise { animation: riseIn .45s ease both; }
.rise-1 { animation: riseIn .45s .08s ease both; }
.rise-2 { animation: riseIn .45s .16s ease both; }
.ob-utility { min-height: 38px; padding: 7px 18px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; background: #17100C; border-bottom: 1px solid #4A372B; }
.ob-utility a { display: inline-flex; align-items: center; gap: 6px; color: #D8C4A8; font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; letter-spacing: .13em; text-decoration: none; text-transform: uppercase; }
.ob-utility a:last-child { justify-self: end; color: #D9FF66; }
.ob-utility > span { display: inline-flex; align-items: center; gap: 6px; color: #8F7D69; font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.ob-label-short { display: none; }
.ob-welcome { background-image: linear-gradient(90deg, rgba(20,12,8,.96) 0%, rgba(20,12,8,.88) 42%, rgba(20,12,8,.40) 100%), url('/deldiet-cafe-interior.png'); background-size: cover; background-position: center; }
.ob-welcome-panel { width: min(620px, 100%); margin-right: auto; display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
@media (max-width: 640px) {
  .ob-utility { grid-template-columns: 1fr 1fr; padding: 8px 12px; }
  .ob-utility > span { display: none; }
  .ob-utility a { font-size: 12px; letter-spacing: .09em; }
  .ob-label-wide { display: none; }
  .ob-label-short { display: inline; }
  .ob-welcome { background-image: linear-gradient(0deg, rgba(20,12,8,.98) 0%, rgba(20,12,8,.78) 64%, rgba(20,12,8,.32) 100%), url('/deldiet-cafe-interior.png'); background-position: 55% center; }
  .ob-welcome-panel { align-items: center; text-align: center; }
}
.ok-scroll::-webkit-scrollbar { width: 6px; }
.ok-scroll::-webkit-scrollbar-thumb { background: #d8cfc2; border-radius: 99px; }
`;

const C = {
  espresso: "#221611",
  ink: "#2A1F18",
  faint: "#8A7A6C",
  paper: "#F7F4EE",
  card: "#FFFFFF",
  line: "#E7DFD3",
  leaf: "#4D7C57",
  leafSoft: "#EAF1EB",
  cream: "#F3E9DA",
};

const F = {
  disp: "'Young Serif', Georgia, serif",
  body: "'Albert Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
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

/* ============================ UI ATOMS ============================ */

function Tag({ children, color = C.faint, bg = "transparent", border = C.line }) {
  return (
    <span style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 0.6, color, background: bg, border: `1px solid ${border}`, borderRadius: 999, padding: "3px 9px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function SectionTitle({ kicker, title, sub, accent }) {
  return (
    <div className="rise" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: accent, textTransform: "uppercase", marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontFamily: F.disp, fontSize: "clamp(24px, 3.4vw, 34px)", color: C.ink, lineHeight: 1.15, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontFamily: F.body, color: C.faint, fontSize: 14, marginTop: 8, maxWidth: 560 }}>{sub}</p>}
    </div>
  );
}

function Pill({ active, onClick, children, accent }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: F.body, fontSize: 14, fontWeight: 600, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
      border: `1.5px solid ${active ? accent : C.line}`, background: active ? accent : C.card, color: active ? "#fff" : C.ink,
      transition: "all .15s ease", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Card({ active, onClick, accent, children, pad = 14, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-disabled={disabled} className="text-left w-full" style={{
      position: "relative", background: C.card, borderRadius: 14, padding: pad, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.48 : 1,
      border: `1.5px solid ${active ? accent : C.line}`, boxShadow: active ? `0 0 0 3px ${accent}22` : "0 1px 2px rgba(34,22,17,.04)",
      transition: "border-color .15s ease, box-shadow .15s ease", fontFamily: F.body, color: C.ink,
    }}>
      {active && (
        <span style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 999, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={12} color="#fff" strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}

function Qty({ value, onMinus, onPlus, min = 0, max = 4, accent }) {
  const btn = (dis) => ({
    width: 30, height: 30, borderRadius: 999, border: `1.5px solid ${dis ? C.line : accent}`,
    color: dis ? C.line : accent, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: dis ? "default" : "pointer",
  });
  return (
    <div className="flex items-center gap-3">
      <button style={btn(value <= min)} onClick={() => value > min && onMinus()}><Minus size={14} /></button>
      <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 600, minWidth: 18, textAlign: "center", color: C.ink }}>{value}</span>
      <button style={btn(value >= max)} onClick={() => value < max && onPlus()}><Plus size={14} /></button>
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
    <div className="ob-utility">
      <Link href="/"><ChevronLeft size={12} /><span className="ob-label-wide">Deldiet Coffeehouse &amp; Store</span><span className="ob-label-short">Deldiet Home</span></Link>
      <span><MapPin size={11} /> In-store kiosk · 48 Water Street</span>
      <Link href="/origin-exchange"><span className="ob-label-wide">Shop Origin Exchange</span><span className="ob-label-short">Origin Exchange</span><ChevronRight size={12} /></Link>
    </div>
  );
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

function Welcome({ onBegin }) {
  return (
    <div className="ob-welcome flex items-center px-6 sm:px-10 lg:px-16" style={{ minHeight: "100%", paddingTop: 48, paddingBottom: 48 }}>
      <div className="ob-welcome-panel">
        <div className="rise"><Tag color="#D8C4A8" border="#6A503C" bg="rgba(34,22,17,.72)">Traceable lots · custom craft · barista prepared</Tag></div>
        <div className="rise-1" style={{ margin: "26px 0 16px", padding: "12px 22px", borderRadius: 999, background: "rgba(247,244,238,.94)", boxShadow: "0 18px 50px rgba(0,0,0,.24)" }}>
          <CupSVG uid="hero" roast={ROASTS[1]} hasMilk foam sizeIdx={2} width={116} />
        </div>
        <div className="rise-1" style={{ fontFamily: F.mono, fontSize: 12, color: "#D9FF66", letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>Deldiet Coffeehouse · Water Street</div>
        <h1 className="rise-1" style={{ fontFamily: F.disp, color: "#F5EDE2", fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02, margin: 0 }}>
          Deldiet Origin Bar
        </h1>
        <p className="rise-2" style={{ fontFamily: F.body, color: "#D6C6B2", fontSize: 15, maxWidth: 510, marginTop: 14, lineHeight: 1.65 }}>
          Build your cup from the bean upward. Choose the origin, roast, drink, milk, extraction and finishing details while your cup and price update live.
        </p>
        <button onClick={onBegin} className="rise-2" style={{
          marginTop: 30, fontFamily: F.body, fontWeight: 700, fontSize: 16, color: "#241405",
          background: "#D9FF66", border: "none", borderRadius: 999, padding: "15px 38px", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(217,255,102,.20)",
        }}>
          Begin your cup →
        </button>
        <div className="rise-2" style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.4, color: "#A9957E", marginTop: 26, textTransform: "uppercase" }}>
          41 origins · 4 bean species · 42 drinks · live cup preview
        </div>
      </div>
    </div>
  );
}

function OriginStep({ sel, set, accent }) {
  const [continent, setContinent] = useState("Africa");
  const [beanFilter, setBeanFilter] = useState("All");
  const list = ORIGINS[continent].filter((c) => beanFilter === "All" || c.b.includes(beanFilter[0]));
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 1 · Origin & roast"
        title="Where should your beans come from?"
        sub="Explore the current demonstration catalogue across five growing regions. Availability changes by harvest; pick the place, then set the roast." />
      <div className="flex flex-wrap gap-2 rise" style={{ marginBottom: 10 }}>
        {["All", "Arabica", "Robusta", "Liberica", "Excelsa"].map((b) => (
          <Pill key={b} active={beanFilter === b} accent={accent} onClick={() => setBeanFilter(b)}>{b}</Pill>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 rise" style={{ marginBottom: 14 }}>
        {Object.keys(ORIGINS).map((ct) => (
          <Pill key={ct} active={continent === ct} accent={accent} onClick={() => setContinent(ct)}>{ct}</Pill>
        ))}
      </div>
      {list.length === 0 && (
        <p style={{ fontFamily: F.body, color: C.faint, fontSize: 14, padding: "20px 4px" }}>
          No {beanFilter} lots on this continent right now — try another region or clear the filter.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((c) => {
          const active = sel.origin?.n === c.n;
          return (
            <Card key={c.n} active={active} accent={accent} onClick={() => set({ origin: { ...c, continent } })}>
              <div className="flex items-start gap-3">
                <span style={{ fontSize: 26, lineHeight: 1 }}>{c.f}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.n}</div>
                  {c.x && <div style={{ fontFamily: F.body, fontSize: 14, color: accent, fontWeight: 600 }}>{c.x}</div>}
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint, marginTop: 5 }}>{c.t}</div>
                  <div className="flex flex-wrap items-center gap-1.5" style={{ marginTop: 8 }}>
                    {c.b.map((bt) => <Tag key={bt}>{BEAN_NAMES[bt]}</Tag>)}
                    <Tag>{c.m}</Tag>
                    {c.p > 0 && <Tag color={accent} border={`${accent}66`}>+{money(c.p)}</Tag>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Choose your roast — the room warms with it</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
  const list = sel.tab === "classics" ? CLASSICS : SIGNATURES;
  const pick = (d) => {
    const temp = d.fam === "cold" || d.iced ? "Iced" : d.fam === "blended" ? "Blended" : "Hot";
    set({
      drink: d, extraShots: 0, temp,
      extraction: EXTRACTIONS[d.fam][0],
      milk: d.milk ? (sel.milkTouched ? sel.milk : "Organic whole") : "None — black",
    });
  };
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 2 · The make"
        title="Now — what are we making?"
        sub="Every house classic from the world's great coffee menus, or one of our signature creations. Your origin and roast carry through either way." />
      <div className="flex gap-2 rise" style={{ marginBottom: 16 }}>
        <Pill active={sel.tab === "classics"} accent={accent} onClick={() => set({ tab: "classics" })}>House classics · {CLASSICS.length}</Pill>
        <Pill active={sel.tab === "signatures"} accent={accent} onClick={() => set({ tab: "signatures" })}>Signature creations · {SIGNATURES.length}</Pill>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((d) => {
          const active = sel.drink?.n === d.n;
          return (
            <Card key={d.n} active={active} accent={accent} onClick={() => pick(d)}>
              <div className="flex items-baseline justify-between gap-2" style={{ paddingRight: active ? 22 : 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{d.n}</span>
                <span style={{ fontFamily: F.mono, fontSize: 14, color: C.faint }}>{money(d.pr)}</span>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 5, lineHeight: 1.45 }}>{d.d}</div>
              <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                {d.fam === "cold" && <Tag><Snowflake size={9} style={{ display: "inline", marginRight: 3 }} />cold</Tag>}
                {d.fam === "blended" && <Tag>blended</Tag>}
                {(d.tag || []).map((t) => <Tag key={t} color={accent} border={`${accent}55`}>{t}</Tag>)}
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
  const tempOptions = d.fam === "cold" ? ["Iced"] : d.fam === "blended" ? ["Blended"] : ["Hot", "Extra hot", "Iced"];
  const ext = EXTRACTIONS[d.fam];
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 3 · The craft"
        title="Dial in how it's made"
        sub={`Milk, shots, heat and extraction for your ${d.n || "drink"} — small choices, big difference.`} />
      <div className="grid lg:grid-cols-2 gap-x-8 gap-y-7">
        <div className="rise">
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Milk & alternatives</div>
          <div className="grid grid-cols-2 gap-2">
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
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Espresso shots</div>
            <div className="flex items-center justify-between" style={{ background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "12px 14px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.sh} included{sel.extraShots > 0 ? ` + ${sel.extraShots} extra` : ""}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint, marginTop: 2 }}>extra shot +{money(EXTRA_SHOT)}</div>
              </div>
              <Qty value={sel.extraShots} min={0} max={maxExtraShots} accent={accent}
                onMinus={() => set({ extraShots: sel.extraShots - 1 })}
                onPlus={() => set({ extraShots: sel.extraShots + 1 })} />
            </div>
          </div>
          <div className="rise-1">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Temperature</div>
            <Seg options={tempOptions} value={sel.temp} onChange={(v) => set({ temp: v })} accent={accent} />
          </div>
          <div className="rise-2">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Extraction</div>
            {ext.length === 1
              ? <Tag color={C.ink} bg={C.cream} border={C.line}>{ext[0]} — set by your drink</Tag>
              : <Seg options={ext} value={sel.extraction} onChange={(v) => set({ extraction: v })} accent={accent} />}
          </div>
          <div className="rise-2">
            <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Caffeine</div>
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
        title="Flavours, optional add-ins & finishing touches"
        sub="Choose syrups, sweeteners, toppings and up to two optional functional ingredients. Bar staff confirm ingredient availability and suitability." />
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Optional add-ins · choose up to 2</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 rise">
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
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Flavour syrups · +{money(SYRUP_PRICE)} each</div>
          <div className="flex flex-wrap gap-2">
            {SYRUPS.map((s) => <Pill key={s} active={sel.syrups.includes(s)} accent={accent} onClick={() => toggle("syrups", s)}>{s}</Pill>)}
          </div>
        </div>
        <div className="rise-1">
          <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Sweetener · on the house</div>
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
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Toppings</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
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
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 5 · Finish"
        title="Size it and send it"
        sub="Our sizes grow like the plant does — seed to harvest. Bringing your own cup earns a little back." />
      <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Cup size</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise">
        {SIZES.map((s, i) => (
          <Card key={s.id} active={sel.size === s.id} accent={accent} onClick={() => set({ size: s.id })}>
            <div className="flex items-end gap-3">
              <span style={{ width: 16, height: 16 + i * 9, background: accent, borderRadius: 4, display: "inline-block", opacity: 0.85, transition: "height .2s ease" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.n}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.faint }}>{s.oz} oz{s.p > 0 ? ` · +${money(s.p)}` : ""}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 26 }} className="rise-1">
        <div style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.4, color: accent, textTransform: "uppercase", marginBottom: 10 }}>Your cup, your way</div>
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
    <div className="flex items-baseline justify-between gap-4" style={{ padding: "7px 0", borderBottom: `1px dashed ${C.line}` }}>
      <span style={{ fontFamily: F.body, fontSize: 14, color: C.faint, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.ink, textAlign: "right" }}>{value}</span>
      {price !== undefined && <span style={{ fontFamily: F.mono, fontSize: 14, color: green ? C.leaf : C.faint, flexShrink: 0, minWidth: 52, textAlign: "right" }}>{price}</span>}
    </div>
  );
}

function ReviewGroup({ g, children, accent, onJump }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.3, color: accent, textTransform: "uppercase" }}>{g.t}</span>
        <button onClick={() => onJump(g.step)} style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1, color: C.faint, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>EDIT</button>
      </div>
      {children}
    </div>
  );
}

function ReviewStep({ sel, set, accent, parts, cupProps, tags, onJump }) {
  const o = sel.origin, d = sel.drink;
  const sizeObj = SIZES.find((s) => s.id === sel.size);
  const groups = [
    { t: "Origin & roast", step: 1 }, { t: "Drink", step: 2 }, { t: "Craft", step: 3 },
    { t: "Enhance", step: 4 }, { t: "Finish", step: 5 },
  ];
  return (
    <div>
      <SectionTitle accent={accent} kicker="Step 6 · Review" title="One last look before we pour" />
      <div className="grid lg:grid-cols-5 gap-6 items-start">
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
            <span style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: C.faint }}>TOTAL · CAD</span>
            <span style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 600, color: accent }}>{money(parts.total)}</span>
          </div>
        </div>
        <div className="lg:col-span-2 rise-1" style={{ background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: 18, textAlign: "center" }}>
          <CupSVG uid="review" {...cupProps.svg} width={170} />
          <div className="flex flex-wrap justify-center gap-1.5" style={{ marginTop: 12 }}>
            {tags.map((t) => <Tag key={t} color={accent} border={`${accent}55`}>{t}</Tag>)}
          </div>
          <div style={{ marginTop: 18, textAlign: "left" }}>
            <label style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.3, color: C.faint, textTransform: "uppercase" }}>A name for your cup</label>
            <input value={sel.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Amara"
              style={{ width: "100%", marginTop: 6, fontFamily: F.body, fontSize: 15, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.line}`, outline: "none", background: C.paper, color: C.ink, boxSizing: "border-box" }} />
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.faint, marginTop: 10 }}>
              Create the order request below. A barista confirms ingredients, allergens, availability and payment at the counter before preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoneScreen({ sel, accent, cupProps, orderNo, onReset }) {
  const sizeObj = SIZES.find((s) => s.id === sel.size);
  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "100%", paddingTop: 40, paddingBottom: 40 }}>
      <div className="rise" style={{ width: 56, height: 56, borderRadius: 999, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 28px ${accent}55` }}>
        <Check size={28} color="#fff" strokeWidth={3} />
      </div>
      <div className="rise-1" style={{ fontFamily: F.mono, fontSize: 14, letterSpacing: 2, color: C.faint, marginTop: 22, textTransform: "uppercase" }}>Kiosk request {orderNo}</div>
      <h2 className="rise-1" style={{ fontFamily: F.disp, fontSize: "clamp(26px,4vw,38px)", color: C.ink, margin: "8px 0 0" }}>
        {sel.name ? `${sel.name}, your` : "Your"} cup is in good hands
      </h2>
      <p className="rise-1" style={{ fontFamily: F.body, color: C.faint, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
        {sel.drink.n} · {sizeObj.n} ({sizeObj.oz} oz) · {sel.origin.n} beans, {ROASTS.find((r) => r.id === sel.roast).name.toLowerCase()} roast. A barista will review the request; estimated preparation after confirmation is <Clock size={13} style={{ display: "inline", verticalAlign: -2 }} /> 4–6 minutes.
      </p>
      <div className="rise-2" style={{ marginTop: 20 }}>
        <CupSVG uid="done" {...cupProps.svg} width={140} />
      </div>
      <button onClick={onReset} className="rise-2" style={{
        marginTop: 24, fontFamily: F.body, fontWeight: 700, fontSize: 15, color: accent,
        background: "transparent", border: `2px solid ${accent}`, borderRadius: 999, padding: "12px 28px", cursor: "pointer",
      }}>
        Craft another cup
      </button>
      <div className="rise-2 flex items-center gap-1.5" style={{ marginTop: 22, fontFamily: F.mono, fontSize: 12, letterSpacing: 1.2, color: C.faint, textTransform: "uppercase" }}>
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
  toppings: [], size: "sprout", cup: "For here · ceramic", name: "",
};

export default function OriginBarKiosk() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState(FRESH);
  const [orderNo, setOrderNo] = useState("");
  const set = (patch) => setSel((s) => ({ ...s, ...patch }));

  const roastObj = ROASTS.find((r) => r.id === sel.roast) || ROASTS[1];
  const accent = roastObj.color;

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

  const canNext = step === 1 ? !!sel.origin : step === 2 ? !!sel.drink : true;
  const go = (n) => { setStep(n); const el = document.getElementById("ob-scroll"); if (el) el.scrollTop = 0; };
  const next = () => {
    if (!canNext) return;
    if (step === 6) { setOrderNo("DLB-" + (1000 + Math.floor(Math.random() * 9000))); go(7); }
    else go(step + 1);
  };
  const reset = () => { setSel(FRESH); go(0); };

  const screen =
    step === 1 ? <OriginStep sel={sel} set={set} accent={accent} /> :
    step === 2 ? <DrinkStep sel={sel} set={set} accent={accent} /> :
    step === 3 ? <CraftStep sel={sel} set={set} accent={accent} /> :
    step === 4 ? <EnhanceStep sel={sel} set={set} accent={accent} /> :
    step === 5 ? <FinishStep sel={sel} set={set} accent={accent} /> :
    step === 6 ? <ReviewStep sel={sel} set={set} accent={accent} parts={parts} cupProps={cupProps} tags={tags} onJump={go} /> :
    step === 7 ? <DoneScreen sel={sel} accent={accent} cupProps={cupProps} orderNo={orderNo} onReset={reset} /> : null;

  return (
    <div className="origin-bar-app flex flex-col" style={{ height: "100dvh", background: C.paper, fontFamily: F.body }}>
      <style>{FONTS}</style>
      <UtilityBar />
      {step === 0 ? (
        <div className="flex-1 overflow-y-auto"><Welcome onBegin={() => go(1)} /></div>
      ) : (
        <>
          <header className="flex items-center justify-between px-4 sm:px-6" style={{ background: C.espresso, height: 54, flexShrink: 0 }}>
            <div className="flex items-center gap-2">
              <Coffee size={16} color="#D8C4A8" />
              <span style={{ fontFamily: F.disp, color: "#F5EDE2", fontSize: 17 }}>Origin Bar</span>
            </div>
            {step <= 6 && (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline" style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.4, color: "#BBA890", textTransform: "uppercase" }}>
                  {step}/6 · {STEP_LABELS[step - 1]}
                </span>
                <div className="flex gap-1.5">
                  {STEP_LABELS.map((l, i) => (
                    <span key={l} style={{ width: 7, height: 7, borderRadius: 999, background: i < step ? accent : "#4A372B", transition: "background .2s ease" }} />
                  ))}
                </div>
              </div>
            )}
          </header>
          <main id="ob-scroll" className="flex-1 overflow-y-auto ok-scroll">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
              {step >= 1 && step <= 5 ? (
                <div className="lg:grid lg:gap-8" style={{ gridTemplateColumns: "1fr 250px" }}>
                  <div style={{ minWidth: 0 }}>{screen}</div>
                  <aside className="hidden lg:block">
                    <div className="sticky" style={{ top: 0, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
                      <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.6, color: C.faint, textTransform: "uppercase", marginBottom: 10 }}>Your cup · live</div>
                      <CupSVG uid="rail" {...cupProps.svg} width={130} />
                      <div style={{ marginTop: 10, fontFamily: F.body, fontSize: 14, color: C.ink, fontWeight: 600 }}>
                        {sel.drink ? sel.drink.n : "—"}
                      </div>
                      <div style={{ fontFamily: F.mono, fontSize: 12, color: C.faint, marginTop: 2 }}>
                        {sel.origin ? `${sel.origin.f} ${sel.origin.n}` : "origin pending"}
                      </div>
                      <div className="flex flex-wrap justify-center gap-1" style={{ marginTop: 10 }}>
                        {tags.map((t) => <Tag key={t} color={accent} border={`${accent}55`}>{t}</Tag>)}
                      </div>
                      <div style={{ borderTop: `1px dashed ${C.line}`, marginTop: 12, paddingTop: 10, fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: accent }}>
                        {money(parts.total)}
                      </div>
                    </div>
                  </aside>
                </div>
              ) : screen}
            </div>
          </main>
          {step >= 1 && step <= 6 && (
            <footer className="flex items-center justify-between gap-3 px-4 sm:px-6" style={{ background: C.espresso, height: 68, flexShrink: 0 }}>
              <button onClick={() => go(step - 1)} className="flex items-center gap-1" style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: "#BBA890", background: "none", border: "none", cursor: "pointer", padding: "10px 4px" }}>
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-3">
                <div className="sm:block hidden"><CupSVG uid="foot" {...cupProps.svg} width={34} /></div>
                <div className="text-right">
                  <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: 1.6, color: "#7A6A58", textTransform: "uppercase" }}>Total · CAD</div>
                  <div style={{ fontFamily: F.mono, fontSize: 19, fontWeight: 600, color: "#F5EDE2" }}>{money(parts.total)}</div>
                </div>
              </div>
              <button onClick={next} disabled={!canNext} className="flex items-center gap-1.5" style={{
                fontFamily: F.body, fontWeight: 700, fontSize: 15, color: "#fff",
                background: canNext ? accent : "#4A372B", border: "none", borderRadius: 999, padding: "13px 22px",
                cursor: canNext ? "pointer" : "default", opacity: canNext ? 1 : 0.7, transition: "background .2s ease",
              }}>
                {step === 6 ? "Create order request" : `Next · ${STEP_LABELS[step]}`} <ChevronRight size={16} />
              </button>
            </footer>
          )}
        </>
      )}
    </div>
  );
}
