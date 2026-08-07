"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee, Leaf, Search, ShoppingCart, Plus, Minus, X, Check,
  ChevronLeft, TrendingUp, TrendingDown, Package, CreditCard,
  Wallet, Landmark, Truck, Star, Filter, Globe,
  BadgeCheck, Gift, Banknote, Sparkles, MapPin, Clock, Box,
  Settings, ArrowRight
} from "lucide-react";

/* ============================================================
   ORIGIN EXCHANGE — the world's coffee, traded openly.
   Companion to the Origin Bar kiosk: a marketplace + live trade
   desk prototype. Every brand, price, index and lot shown here is
   illustrative until Deldiet connects its operating catalogue.
   ============================================================ */

const C = {
  esp: "#221611", espSoft: "#33241B", paper: "#F7F4EE", card: "#FFFFFF",
  ink: "#221611", sub: "#7A6A5C", line: "#E6DFD3", leaf: "#4D7C57",
  leafBg: "#EAF2EC", up: "#3E7C4F", down: "#B3402F", brass: "#C98B43",
  brassDeep: "#8F5E20", cream: "#F2E8D8", tick: "#171008"
};
const F = {
  disp: "'Young Serif', Georgia, serif",
  body: "'Albert Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace"
};
const ROAST_NAME = { light: "Light", medium: "Medium", meddark: "Med-Dark", dark: "Dark" };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Young+Serif&family=Albert+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
@keyframes oexTape { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes oexFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes oexPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.oex-fade { animation: oexFade .35s ease both; }
.oex-card { transition: transform .15s ease, box-shadow .15s ease; }
.oex-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(34,22,17,.10); }
.oex-input:focus { outline: none; border-color: #C98B43 !important; box-shadow: 0 0 0 3px rgba(201,139,67,.18); }
.oex-scroll { scrollbar-width: none; }
.oex-scroll::-webkit-scrollbar { display: none; }
.oex-product-photo { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .35s ease; }
.oex-card:hover .oex-product-photo { transform: scale(1.035); }
.oex-back-deldiet { display: inline-flex; align-items: center; gap: 8px; color: #D9FF66; text-decoration: none; font-family: ${F.mono}; font-size: 12px; letter-spacing: .15em; font-weight: 600; }
.oex-back-deldiet:hover { color: #FFFFFF; }
.oex-label-short { display: none; }
@media (max-width: 640px) {
  .oex-back-deldiet { gap: 5px; font-size: 12px; letter-spacing: .08em; }
  .oex-label-wide { display: none; }
  .oex-label-short { display: inline; }
}
@media (prefers-reduced-motion: reduce) {
  .oex-fade, .oex-card, .oex-product-photo { animation: none; transition: none; }
}
`;

/* ----------------------------- market tape ----------------------------- */
const MARKET0 = [
  { sym: "KC ARABICA", unit: "¢/lb", price: 252.4 },
  { sym: "ROBUSTA LDN", unit: "$/t", price: 4480 },
  { sym: "COLOMBIA EXC", unit: "$/kg", price: 9.42 },
  { sym: "ETHIOPIA YIRG G1", unit: "$/kg", price: 14.85 },
  { sym: "BRAZIL SANTOS", unit: "$/kg", price: 7.08 },
  { sym: "KENYA AB", unit: "$/kg", price: 13.55 },
  { sym: "SUMATRA G1", unit: "$/kg", price: 8.9 },
  { sym: "VIETNAM R G2", unit: "$/kg", price: 4.28 },
  { sym: "GEISHA AUCTION", unit: "$/kg", price: 162.0 }
];

const REGIONS = [
  { id: "all", name: "All origins" },
  { id: "africa", name: "Africa" },
  { id: "southam", name: "South America" },
  { id: "central", name: "Central Am. & Caribbean" },
  { id: "asia", name: "Asia–Pacific" },
  { id: "mideast", name: "Middle East" },
  { id: "multi", name: "Blends" }
];

const CATS = [
  { id: "all", name: "Everything", icon: Globe },
  { id: "beans", name: "Roasted beans", icon: Coffee },
  { id: "pods", name: "Pods & capsules", icon: Box },
  { id: "instant", name: "Instant & concentrate", icon: Clock },
  { id: "infused", name: "Infused & functional", icon: Sparkles },
  { id: "machines", name: "Machines & grinders", icon: Settings },
  { id: "gear", name: "Brew gear", icon: Package }
];

/* ------------------------------ catalogue ------------------------------ */
const PRODUCTS = [
  /* roasted beans */
  { id: "b1", cat: "beans", name: "Yirgacheffe Washed", roaster: "Solstice Coffee Co.", origin: "Ethiopia", flag: "🇪🇹", region: "africa", roast: "light", type: "arabica", organic: true, notes: "jasmine · bergamot · white peach", rating: 4.9, reviews: 1208, badge: "Top rated", sizes: [{ l: "250 g", p: 24.5 }, { l: "500 g", p: 45 }, { l: "1 kg", p: 84 }] },
  { id: "b2", cat: "beans", name: "Sidamo Natural", roaster: "Northbound Roasters", origin: "Ethiopia", flag: "🇪🇹", region: "africa", roast: "medium", type: "arabica", organic: true, notes: "blueberry · cocoa nib · syrupy", rating: 4.8, reviews: 842, sizes: [{ l: "250 g", p: 23 }, { l: "500 g", p: 42 }, { l: "1 kg", p: 78 }] },
  { id: "b3", cat: "beans", name: "Kenya AA Auction Lot", roaster: "Highline Coffee", origin: "Kenya", flag: "🇰🇪", region: "africa", roast: "light", type: "arabica", organic: false, notes: "blackcurrant · tomato-jam acidity", rating: 4.8, reviews: 611, badge: "Auction lot", sizes: [{ l: "250 g", p: 26 }, { l: "500 g", p: 48 }, { l: "1 kg", p: 89 }] },
  { id: "b4", cat: "beans", name: "Huila Supremo", roaster: "Casa Mirador", origin: "Colombia", flag: "🇨🇴", region: "southam", roast: "medium", type: "arabica", organic: true, notes: "caramel · red apple · round", rating: 4.7, reviews: 1990, badge: "Best seller", sizes: [{ l: "250 g", p: 21 }, { l: "500 g", p: 38 }, { l: "1 kg", p: 70 }] },
  { id: "b5", cat: "beans", name: "Cerrado Estate", roaster: "Atlas & Ember", origin: "Brazil", flag: "🇧🇷", region: "southam", roast: "meddark", type: "arabica", organic: false, notes: "hazelnut · milk chocolate", rating: 4.6, reviews: 1404, sizes: [{ l: "250 g", p: 18 }, { l: "500 g", p: 33 }, { l: "1 kg", p: 59 }] },
  { id: "b6", cat: "beans", name: "Antigua Valley", roaster: "Casa Mirador", origin: "Guatemala", flag: "🇬🇹", region: "central", roast: "medium", type: "arabica", organic: true, notes: "cocoa · orange zest · soft smoke", rating: 4.7, reviews: 733, sizes: [{ l: "250 g", p: 22 }, { l: "500 g", p: 40 }, { l: "1 kg", p: 74 }] },
  { id: "b7", cat: "beans", name: "Tarrazú Honey", roaster: "Solstice Coffee Co.", origin: "Costa Rica", flag: "🇨🇷", region: "central", roast: "medium", type: "arabica", organic: false, notes: "wild honey · plum · clean", rating: 4.7, reviews: 502, sizes: [{ l: "250 g", p: 24 }, { l: "500 g", p: 44 }, { l: "1 kg", p: 82 }] },
  { id: "b8", cat: "beans", name: "Geisha Reserve", roaster: "Highline Coffee", origin: "Panama", flag: "🇵🇦", region: "central", roast: "light", type: "arabica", organic: true, notes: "jasmine tea · papaya · silk", rating: 5.0, reviews: 187, badge: "Micro-lot", sizes: [{ l: "100 g", p: 39 }, { l: "250 g", p: 89 }] },
  { id: "b9", cat: "beans", name: "Mandheling Triple-Pick", roaster: "Northbound Roasters", origin: "Sumatra, Indonesia", flag: "🇮🇩", region: "asia", roast: "dark", type: "arabica", organic: true, notes: "cedar · dark cocoa · earth", rating: 4.6, reviews: 958, sizes: [{ l: "250 g", p: 21 }, { l: "500 g", p: 39 }, { l: "1 kg", p: 72 }] },
  { id: "b10", cat: "beans", name: "Highland Robusta", roaster: "Atlas & Ember", origin: "Vietnam", flag: "🇻🇳", region: "asia", roast: "dark", type: "robusta", organic: false, notes: "bold · walnut · crema bomb", rating: 4.5, reviews: 1267, badge: "Espresso pick", sizes: [{ l: "250 g", p: 16 }, { l: "500 g", p: 29 }, { l: "1 kg", p: 52 }] },
  { id: "b11", cat: "beans", name: "Monsooned Malabar", roaster: "Atlas & Ember", origin: "India", flag: "🇮🇳", region: "asia", roast: "meddark", type: "arabica", organic: false, notes: "baking spice · pipe tobacco · low acid", rating: 4.5, reviews: 388, sizes: [{ l: "250 g", p: 19 }, { l: "500 g", p: 35 }, { l: "1 kg", p: 64 }] },
  { id: "b12", cat: "beans", name: "Mokha Haraz Heritage", roaster: "Highline Coffee", origin: "Yemen", flag: "🇾🇪", region: "mideast", roast: "medium", type: "arabica", organic: false, notes: "dried fruit · wine · cardamom", rating: 4.9, reviews: 96, badge: "Heritage", sizes: [{ l: "100 g", p: 32 }, { l: "250 g", p: 74 }] },
  { id: "b13", cat: "beans", name: "Blue Mountain Estate", roaster: "Highline Coffee", origin: "Jamaica", flag: "🇯🇲", region: "central", roast: "medium", type: "arabica", organic: false, notes: "silky · mild · sweet cane", rating: 4.9, reviews: 141, sizes: [{ l: "100 g", p: 45 }, { l: "250 g", p: 105 }] },
  { id: "b14", cat: "beans", name: "Exchange Espresso Blend", roaster: "Origin Exchange Roastworks", origin: "Multi-origin", flag: "🌐", region: "multi", roast: "meddark", type: "blend", organic: true, notes: "toffee · brown sugar · syrupy", rating: 4.7, reviews: 2310, badge: "House blend", sizes: [{ l: "250 g", p: 18 }, { l: "500 g", p: 33 }, { l: "1 kg", p: 60 }] },
  { id: "b15", cat: "beans", name: "Swiss Water Decaf Huila", roaster: "Casa Mirador", origin: "Colombia", flag: "🇨🇴", region: "southam", roast: "medium", type: "arabica", organic: true, decaf: true, notes: "cocoa · graham · gentle", rating: 4.6, reviews: 654, sizes: [{ l: "250 g", p: 22 }, { l: "500 g", p: 40 }] },
  /* pods & capsules */
  { id: "p1", cat: "pods", name: "Espresso Pods · Intensity 8", roaster: "Origin Exchange Roastworks", origin: "Colombia", flag: "🇨🇴", roast: "meddark", type: "arabica", organic: true, notes: "compostable capsule · fits major machines", rating: 4.6, reviews: 1842, badge: "Compostable", sizes: [{ l: "10 pods", p: 9.5 }, { l: "30 pods", p: 26 }, { l: "60 pods", p: 48 }] },
  { id: "p2", cat: "pods", name: "Lungo Pods · Intensity 6", roaster: "Origin Exchange Roastworks", origin: "Brazil", flag: "🇧🇷", roast: "medium", type: "arabica", organic: true, notes: "compostable capsule · long pour", rating: 4.5, reviews: 903, sizes: [{ l: "10 pods", p: 9.5 }, { l: "30 pods", p: 26 }, { l: "60 pods", p: 48 }] },
  { id: "p3", cat: "pods", name: "Decaf Pods · Intensity 5", roaster: "Origin Exchange Roastworks", origin: "Peru", flag: "🇵🇪", roast: "medium", type: "arabica", organic: true, decaf: true, notes: "Swiss Water process · evening safe", rating: 4.4, reviews: 466, sizes: [{ l: "10 pods", p: 9.9 }, { l: "30 pods", p: 27 }] },
  { id: "p4", cat: "pods", name: "Vanilla Bean Pods", roaster: "Origin Exchange Roastworks", origin: "Multi-origin", flag: "🌐", roast: "medium", type: "blend", organic: false, notes: "real vanilla · no artificial flavour", rating: 4.3, reviews: 351, sizes: [{ l: "10 pods", p: 10.5 }, { l: "30 pods", p: 29 }] },
  { id: "p5", cat: "pods", name: "World Tour Variety Pack", roaster: "Origin Exchange Roastworks", origin: "6 origins", flag: "🌐", roast: "medium", type: "arabica", organic: true, notes: "Ethiopia → Panama in 30 pods", rating: 4.7, reviews: 612, badge: "Starter", sizes: [{ l: "30 pods", p: 27.5 }] },
  /* instant & concentrate */
  { id: "i1", cat: "instant", name: "Freeze-Dried Huila Sachets", roaster: "Casa Mirador", origin: "Colombia", flag: "🇨🇴", roast: "medium", type: "arabica", organic: true, notes: "8 single sachets · just add water", rating: 4.5, reviews: 720, sizes: [{ l: "8 sachets", p: 14 }] },
  { id: "i2", cat: "instant", name: "Specialty Instant Canister", roaster: "Solstice Coffee Co.", origin: "Ethiopia", flag: "🇪🇹", roast: "light", type: "arabica", organic: true, notes: "90 g · ~30 cups · bright & floral", rating: 4.4, reviews: 388, sizes: [{ l: "90 g", p: 19 }] },
  { id: "i3", cat: "instant", name: "Cold Brew Concentrate", roaster: "Northbound Roasters", origin: "Brazil + Colombia", flag: "🌐", roast: "meddark", type: "blend", organic: true, notes: "946 ml · dilute 1:1 · 18-hr steep", rating: 4.7, reviews: 1105, badge: "Best seller", sizes: [{ l: "946 ml", p: 15.5 }] },
  { id: "i4", cat: "instant", name: "Espresso Concentrate", roaster: "Atlas & Ember", origin: "Vietnam + Brazil", flag: "🌐", roast: "dark", type: "blend", organic: false, notes: "473 ml · lattes in 30 seconds", rating: 4.3, reviews: 274, sizes: [{ l: "473 ml", p: 13 }] },
  /* infused & functional */
  { id: "f1", cat: "infused", name: "Collagen Coffee", roaster: "Origin Exchange Labs", origin: "Colombia", flag: "✨", roast: "medium", type: "arabica", organic: false, notes: "10 g grass-fed collagen per serving", rating: 4.6, reviews: 980, badge: "Best seller", sizes: [{ l: "340 g", p: 32 }] },
  { id: "f2", cat: "infused", name: "Lion's Mane Focus Blend", roaster: "Origin Exchange Labs", origin: "Ethiopia", flag: "✨", roast: "light", type: "arabica", organic: true, notes: "500 mg fruiting-body extract per cup", rating: 4.7, reviews: 731, sizes: [{ l: "300 g", p: 29 }] },
  { id: "f3", cat: "infused", name: "MCT Keto Coffee", roaster: "Origin Exchange Labs", origin: "Brazil", flag: "✨", roast: "meddark", type: "arabica", organic: false, notes: "C8 MCT oil powder · creamy body", rating: 4.5, reviews: 644, sizes: [{ l: "300 g", p: 27 }] },
  { id: "f4", cat: "infused", name: "Protein Mocha", roaster: "Origin Exchange Labs", origin: "Multi-origin", flag: "✨", roast: "medium", type: "blend", organic: false, notes: "20 g plant protein + raw cacao", rating: 4.4, reviews: 512, sizes: [{ l: "680 g", p: 39 }] },
  { id: "f5", cat: "infused", name: "Calm Evening Decaf", roaster: "Origin Exchange Labs", origin: "Peru", flag: "✨", roast: "medium", type: "arabica", organic: true, decaf: true, notes: "ashwagandha + reishi · wind-down cup", rating: 4.6, reviews: 423, sizes: [{ l: "300 g", p: 28 }] },
  { id: "f6", cat: "infused", name: "Electrolyte Cold Brew Packs", roaster: "Origin Exchange Labs", origin: "Colombia", flag: "✨", roast: "medium", type: "arabica", organic: false, notes: "6 steep packs + sea-salt minerals", rating: 4.3, reviews: 287, sizes: [{ l: "6 packs", p: 21 }] },
  { id: "f7", cat: "infused", name: "Maca Morning Blend", roaster: "Origin Exchange Labs", origin: "Peru", flag: "✨", roast: "medium", type: "arabica", organic: true, notes: "gelatinized maca · malty lift", rating: 4.4, reviews: 198, sizes: [{ l: "300 g", p: 26 }] },
  { id: "f8", cat: "infused", name: "B12 Energy Instant Sticks", roaster: "Origin Exchange Labs", origin: "Multi-origin", flag: "✨", roast: "medium", type: "blend", organic: false, notes: "10 sticks · methylated B12", rating: 4.2, reviews: 163, sizes: [{ l: "10 sticks", p: 18 }] },
  /* machines & grinders */
  { id: "m1", cat: "machines", name: "Lumen E1 Espresso Machine", roaster: "Lumen Machines", notes: "single boiler · PID · 9-bar profile", rating: 4.7, reviews: 512, badge: "Staff pick", sizes: [{ l: "Unit", p: 649 }] },
  { id: "m2", cat: "machines", name: "Lumen E2 Dual Boiler", roaster: "Lumen Machines", notes: "dual boiler · flow control · shot timer", rating: 4.9, reviews: 204, sizes: [{ l: "Unit", p: 1899 }] },
  { id: "m3", cat: "machines", name: "Vetta 64 Flat Burr Grinder", roaster: "Vetta Grind Co.", notes: "64 mm flat burrs · single-dose hopper", rating: 4.8, reviews: 688, badge: "Best seller", sizes: [{ l: "Unit", p: 329 }] },
  { id: "m4", cat: "machines", name: "Vetta Hand Grinder", roaster: "Vetta Grind Co.", notes: "steel conical burr · 40 click settings", rating: 4.7, reviews: 941, sizes: [{ l: "Unit", p: 89 }] },
  { id: "m5", cat: "machines", name: "Daybreak 8-Cup Brewer", roaster: "Lumen Machines", notes: "certified brewer · bloom cycle · thermal carafe", rating: 4.6, reviews: 433, sizes: [{ l: "Unit", p: 219 }] },
  { id: "m6", cat: "machines", name: "Cold Brew Tower", roaster: "Glasshaus", notes: "slow-drip · 1 L · adjustable valve", rating: 4.5, reviews: 152, sizes: [{ l: "Unit", p: 189 }] },
  { id: "m7", cat: "machines", name: "Gooseneck Kettle · Temp Control", roaster: "Lumen Machines", notes: "±1° hold · 600 ml · counterweight handle", rating: 4.8, reviews: 1240, sizes: [{ l: "Unit", p: 129 }] },
  { id: "m8", cat: "machines", name: "Auto Milk Frother", roaster: "Lumen Machines", notes: "hot + cold foam · oat-milk mode", rating: 4.4, reviews: 376, sizes: [{ l: "Unit", p: 59 }] },
  { id: "m9", cat: "machines", name: "Capsule Machine One", roaster: "Lumen Machines", notes: "19-bar · fits standard capsules", rating: 4.5, reviews: 590, sizes: [{ l: "Unit", p: 159 }] },
  /* brew gear */
  { id: "g1", cat: "gear", name: "Ceramic Cone Dripper 02", roaster: "Glasshaus", notes: "spiral ribs · 1–4 cup", rating: 4.8, reviews: 822, sizes: [{ l: "Unit", p: 32 }] },
  { id: "g2", cat: "gear", name: "Paper Filters 02 × 100", roaster: "Glasshaus", notes: "oxygen-bleached · tabbed", rating: 4.7, reviews: 1530, sizes: [{ l: "100 pack", p: 8.5 }] },
  { id: "g3", cat: "gear", name: "Glass Server 600 ml", roaster: "Glasshaus", notes: "borosilicate · heat-proof handle", rating: 4.6, reviews: 419, sizes: [{ l: "Unit", p: 28 }] },
  { id: "g4", cat: "gear", name: "Precision Brew Scale", roaster: "Vetta Grind Co.", notes: "0.1 g · built-in timer · USB-C", rating: 4.7, reviews: 980, badge: "Staff pick", sizes: [{ l: "Unit", p: 79 }] },
  { id: "g5", cat: "gear", name: "58 mm Tamper", roaster: "Vetta Grind Co.", notes: "flat stainless base · walnut handle", rating: 4.8, reviews: 264, sizes: [{ l: "Unit", p: 45 }] },
  { id: "g6", cat: "gear", name: "Milk Pitcher 600 ml", roaster: "Lumen Machines", notes: "sharp spout for latte art", rating: 4.6, reviews: 388, sizes: [{ l: "Unit", p: 24 }] },
  { id: "g7", cat: "gear", name: "Airtight Vault Canister", roaster: "Glasshaus", notes: "one-way CO₂ valve · date dial", rating: 4.7, reviews: 716, sizes: [{ l: "1.2 L", p: 34 }] },
  { id: "g8", cat: "gear", name: "Cupping Spoon Set (6)", roaster: "Origin Exchange Roastworks", notes: "deep bowl · competition weight", rating: 4.9, reviews: 92, sizes: [{ l: "Set of 6", p: 39 }] },
  { id: "g9", cat: "gear", name: "Barista Cleaning Tablets × 30", roaster: "Lumen Machines", notes: "backflush + capsule machines", rating: 4.5, reviews: 503, sizes: [{ l: "30 tabs", p: 16 }] },
  { id: "g10", cat: "gear", name: "Double-Wall Mugs (2)", roaster: "Glasshaus", notes: "250 ml · hand-blown glass", rating: 4.6, reviews: 344, sizes: [{ l: "Pair", p: 29 }] }
];

/* --------------------------- green coffee lots -------------------------- */
const LOTS0 = [
  { id: "L1", no: "LOT-ETH-0427", origin: "Ethiopia", flag: "🇪🇹", grade: "Yirgacheffe G1", process: "Washed", crop: "2025/26", score: 88.25, base: 14.8, bags: 42, certs: ["ORGANIC", "FAIRTRADE"] },
  { id: "L2", no: "LOT-COL-1180", origin: "Colombia", flag: "🇨🇴", grade: "Excelso EP", process: "Washed", crop: "2025/26", score: 86.0, base: 9.4, bags: 120, certs: ["RAINFOREST"] },
  { id: "L3", no: "LOT-BRA-2210", origin: "Brazil", flag: "🇧🇷", grade: "Santos NY2", process: "Natural", crop: "2025/26", score: 84.5, base: 7.1, bags: 300, certs: [] },
  { id: "L4", no: "LOT-KEN-0093", origin: "Kenya", flag: "🇰🇪", grade: "AB FAQ", process: "Washed", crop: "2025/26", score: 87.5, base: 13.6, bags: 35, certs: [] },
  { id: "L5", no: "LOT-GTM-0556", origin: "Guatemala", flag: "🇬🇹", grade: "SHB EP", process: "Washed", crop: "2025/26", score: 86.5, base: 9.9, bags: 80, certs: ["ORGANIC"] },
  { id: "L6", no: "LOT-VNM-3304", origin: "Vietnam", flag: "🇻🇳", grade: "Robusta G2", process: "Natural", crop: "2025/26", score: 81.0, base: 4.3, bags: 400, certs: [] },
  { id: "L7", no: "LOT-PAN-0008", origin: "Panama", flag: "🇵🇦", grade: "Geisha Auction", process: "Natural", crop: "2025/26", score: 93.0, base: 168.0, bags: 4, certs: ["ORGANIC"] },
  { id: "L8", no: "LOT-HND-0712", origin: "Honduras", flag: "🇭🇳", grade: "SHG", process: "Honey", crop: "2025/26", score: 85.5, base: 8.7, bags: 150, certs: ["FAIRTRADE", "ORGANIC"] }
];

/* ------------------------- payments & logistics ------------------------- */
const PAYMENTS = [
  { id: "card", name: "Credit / Debit card", sub: "Visa · Mastercard · Amex · Discover · JCB · UnionPay", icon: CreditCard },
  { id: "applepay", name: "Apple Pay", sub: "Wallet sheet on your device", icon: Wallet },
  { id: "googlepay", name: "Google Pay", sub: "Wallet sheet on your device", icon: Wallet },
  { id: "paypal", name: "PayPal", sub: "Sign in to your PayPal account", icon: Wallet },
  { id: "interac", name: "Interac e-Transfer", sub: "Canada · secure instructions after review", icon: Landmark },
  { id: "wire", name: "Bank wire / EFT", sub: "Approved wholesale and green-lot orders", icon: Landmark },
  { id: "gift", name: "Gift card", sub: "Redeem a Deldiet code", icon: Gift },
  { id: "pickup", name: "Pay at pickup", sub: "Debit · Water Street coffeehouse", icon: Banknote }
];

const SHIPPING = [
  { id: "standard", name: "Standard · 2–5 days", note: "Free over $75" },
  { id: "express", name: "Express · 1–2 days", note: "$19.95 flat" },
  { id: "pickup", name: "Water Street pickup", note: "Free · ready in 2 hrs" },
  { id: "freight", name: "Pallet freight · green lots", note: "Quoted & invoiced after booking" }
];

const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

const fmt = (n) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
const r2 = (n) => Math.round(n * 100) / 100;

/* ============================ shared pieces ============================ */
function Delta({ d, dark }) {
  const up = d >= 0;
  const col = dark ? (up ? "#8CC79B" : "#E2907F") : (up ? C.up : C.down);
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1" style={{ color: col, fontFamily: F.mono, fontSize: 13, fontWeight: 600 }}>
      <Icon size={12} /> {up ? "+" : ""}{d.toFixed(2)}%
    </span>
  );
}

function Ticker({ market }) {
  const renderRow = (suffix) => market.map((m, i) => (
    <span key={suffix + i} className="inline-flex items-center gap-2" style={{ padding: "0 22px", fontFamily: F.mono, fontSize: 13 }}>
      <span style={{ color: "#C8B69B", letterSpacing: ".06em" }}>{m.sym}</span>
      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>
        {m.unit === "$/t" ? Math.round(m.price).toLocaleString("en-CA") : m.price.toFixed(2)}
      </span>
      <span style={{ color: "#6E5B49" }}>{m.unit}</span>
      <Delta d={m.delta} dark />
    </span>
  ));
  return (
    <div style={{ background: C.tick, borderBottom: "1px solid #2A1D12", overflow: "hidden" }}>
      <div className="flex items-center">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2" style={{ background: "#241710", borderRight: "1px solid #2A1D12", flexShrink: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "#67D08B", boxShadow: "0 0 8px #67D08B", animation: "oexPulse 2.4s ease infinite" }} />
          <span style={{ color: "#C8B69B", fontFamily: F.mono, fontSize: 12, letterSpacing: ".18em" }}>LIVE BOARD</span>
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ display: "inline-flex", whiteSpace: "nowrap", width: "max-content", animation: "oexTape 48s linear infinite", padding: "8px 0" }}>
            {renderRow("a")}{renderRow("b")}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data }) {
  const w = 88, h = 26;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={up ? C.up : C.down} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const PRODUCT_VISUALS = {
  beans: "/origin-exchange-coffee-products.png",
  pods: "/origin-exchange-coffee-products.png",
  instant: "/origin-exchange-instant-functional.png",
  infused: "/origin-exchange-instant-functional.png",
  machines: "/origin-exchange-equipment.png",
  gear: "/origin-exchange-brew-gear.png"
};

function ProductArt({ p, detail = false }) {
  const n = Number(String(p.id).replace(/\D/g, "")) || 0;
  const focusSets = {
    beans: ["12% 50%", "34% 50%", "57% 50%", "82% 50%"],
    pods: ["78% 68%", "88% 58%", "70% 55%"],
    instant: ["12% 50%", "34% 50%", "58% 50%"],
    infused: ["42% 50%", "70% 50%", "88% 50%"],
    machines: ["13% 52%", "38% 50%", "63% 48%", "87% 52%"],
    gear: ["12% 52%", "34% 52%", "57% 50%", "82% 52%"]
  };
  const set = focusSets[p.cat] || ["50% 50%"];
  const focus = detail ? "50% 50%" : set[n % set.length];
  return (
    <div style={{ position: "relative", width: "100%", height: detail ? 430 : 220, overflow: "hidden", background: C.cream }}>
      <Image className="oex-product-photo" src={PRODUCT_VISUALS[p.cat] || PRODUCT_VISUALS.beans} alt={`${p.name} product photograph`} fill unoptimized sizes={detail ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} style={{ objectPosition: focus }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, padding: "6px 9px", borderRadius: 999, background: "rgba(23,16,8,.78)", color: "#FFFFFF", fontFamily: F.mono, fontSize: 12, letterSpacing: ".11em", textTransform: "uppercase", backdropFilter: "blur(8px)" }}>
        {p.origin || p.roaster}
      </div>
    </div>
  );
}

function Stars({ r, n }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={12} color={C.brass} fill={i < Math.round(r) ? C.brass : "transparent"} strokeWidth={1.5} />
        ))}
      </span>
      <span style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>{r.toFixed(1)} ({n.toLocaleString("en-CA")})</span>
    </span>
  );
}

function Tag({ children, leaf }) {
  return (
    <span className="rounded-full px-2.5 py-1" style={{
      fontFamily: F.mono, fontSize: 12, fontWeight: 500, letterSpacing: ".03em",
      background: leaf ? C.leafBg : "#F3EEE4", color: leaf ? C.leaf : C.sub,
      border: `1px solid ${leaf ? "#CFE2D4" : C.line}`
    }}>{children}</span>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="rounded-full px-3 py-1.5" style={{
      fontFamily: F.body, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
      border: `1.5px solid ${active ? C.esp : C.line}`,
      background: active ? C.esp : "#FFFFFF", color: active ? C.cream : C.ink, cursor: "pointer"
    }}>{children}</button>
  );
}

function Stepper({ qty, setQty }) {
  return (
    <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.line}`, background: "#FFFFFF" }}>
      <button aria-label="Decrease quantity" onClick={() => setQty(qty - 1)} className="px-2.5 py-2" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }}><Minus size={13} /></button>
      <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 14, minWidth: 30, textAlign: "center" }}>{qty}</span>
      <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)} className="px-2.5 py-2" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }}><Plus size={13} /></button>
    </div>
  );
}

function ProductCard({ p, onOpen, onQuickAdd }) {
  const from = Math.min(...p.sizes.map((s) => s.p));
  return (
    <div className="oex-card rounded-2xl overflow-hidden cursor-pointer" style={{ background: C.card, border: `1px solid ${C.line}` }} onClick={() => onOpen(p)}>
      <div className="relative overflow-hidden" style={{ background: C.cream }}>
        <ProductArt p={p} />
      </div>
      <div className="p-4">
        <div className="mb-1.5" style={{ minHeight: 18 }}>
          {p.badge && <span className="rounded-full px-2 py-0.5" style={{ background: C.leafBg, color: C.leaf, fontFamily: F.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".08em" }}>{p.badge.toUpperCase()}</span>}
        </div>
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.25 }}>{p.name}</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, marginTop: 2 }}>{p.roaster}{p.origin ? ` · ${p.origin}` : ""}</div>
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.brassDeep, marginTop: 6, minHeight: 28 }}>{p.notes}</div>
        <div className="mt-2"><Stars r={p.rating} n={p.reviews} /></div>
        <div className="flex items-center justify-between mt-3">
          <div style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.ink }}>{p.sizes.length > 1 ? "from " : ""}{fmt(from)}</div>
          <button onClick={(e) => { e.stopPropagation(); onQuickAdd(p); }} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ cat, f, setF, count }) {
  const showBean = cat === "beans" || cat === "all";
  const set = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="oex-fade rounded-2xl p-3 mb-5 flex flex-wrap items-center gap-2" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <Filter size={14} color={C.sub} />
      {showBean && REGIONS.map((r) => <Chip key={r.id} active={f.region === r.id} onClick={() => set("region", r.id)}>{r.name}</Chip>)}
      {showBean && <span style={{ width: 1, height: 20, background: C.line }} />}
      {showBean && ["all", "light", "medium", "meddark", "dark"].map((r) => (
        <Chip key={r} active={f.roast === r} onClick={() => set("roast", r)}>{r === "all" ? "Any roast" : ROAST_NAME[r]}</Chip>
      ))}
      <Chip active={f.org} onClick={() => set("org", !f.org)}>
        <span className="inline-flex items-center gap-1"><Leaf size={12} /> Organic</span>
      </Chip>
      <select value={f.sort} onChange={(e) => set("sort", e.target.value)} className="rounded-full px-3 py-1.5 ml-auto" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, border: `1.5px solid ${C.line}`, background: "#FFFFFF", color: C.ink, cursor: "pointer" }}>
        <option value="featured">Featured</option>
        <option value="rating">Top rated</option>
        <option value="asc">Price: low to high</option>
        <option value="desc">Price: high to low</option>
      </select>
      <span style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>{count} items</span>
    </div>
  );
}

function ProductDetail({ p, onBack, onAdd }) {
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const v = p.sizes[vi];
  const regionName = p.region ? (REGIONS.find((r) => r.id === p.region) || {}).name : null;
  return (
    <div className="oex-fade">
      <button onClick={onBack} className="inline-flex items-center gap-1 mb-4" style={{ background: "none", border: "none", color: C.sub, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <ChevronLeft size={15} /> Back to browsing
      </button>
      <div className="grid md:grid-cols-2 gap-8 rounded-3xl p-6 md:p-8" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
        <div className="overflow-hidden rounded-2xl" style={{ background: C.cream }}>
          <ProductArt p={p} detail />
        </div>
        <div>
          {p.badge && <span className="rounded-full px-2.5 py-1" style={{ background: C.leafBg, color: C.leaf, fontFamily: F.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".08em" }}>{p.badge.toUpperCase()}</span>}
          <h1 style={{ fontFamily: F.disp, fontSize: 30, color: C.ink, margin: "10px 0 2px", lineHeight: 1.15 }}>{p.name}</h1>
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
            {p.roaster}{p.origin ? ` · ${p.flag} ${p.origin}` : ""}{regionName ? ` · ${regionName}` : ""}
          </div>
          <div className="mt-2"><Stars r={p.rating} n={p.reviews} /></div>
          <p style={{ fontFamily: F.mono, fontSize: 14, color: C.brassDeep, marginTop: 12 }}>{p.notes}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.roast && ROAST_NAME[p.roast] && <Tag>{ROAST_NAME[p.roast]} roast</Tag>}
            {p.type && <Tag>{p.type}</Tag>}
            {p.organic && <Tag leaf>Certified organic</Tag>}
            {p.decaf && <Tag>Swiss Water decaf</Tag>}
            {p.cat === "infused" && <Tag>Food-grade actives · not medical advice</Tag>}
            {p.cat === "pods" && <Tag leaf>Commercially compostable</Tag>}
          </div>
          <div className="mt-5" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.sub, letterSpacing: ".05em" }}>SIZE / FORMAT</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.sizes.map((s, i) => (
              <button key={i} onClick={() => { setVi(i); }} className="rounded-xl px-3.5 py-2" style={{
                border: `2px solid ${i === vi ? C.brass : C.line}`,
                background: i === vi ? "#FDF6EB" : "#FFFFFF",
                fontFamily: F.mono, fontSize: 14, fontWeight: 600, cursor: "pointer", color: C.ink
              }}>{s.l} · {fmt(s.p)}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Stepper qty={qty} setQty={(q) => setQty(Math.max(1, Math.min(99, q)))} />
            <button onClick={() => onAdd(p, v, qty)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3" style={{ background: C.brass, color: "#241405", fontFamily: F.body, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>
              <ShoppingCart size={16} /> Add to cart · {fmt(r2(v.p * qty))}
            </button>
          </div>
          <div className="mt-3" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>
            Roasted to order · ships from St. John&apos;s · free standard shipping over {fmt(75)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LotCard({ lot, onAdd }) {
  const [bags, setBags] = useState(1);
  const crop = ["12% 50%", "32% 50%", "52% 50%", "74% 50%", "90% 50%"][Number(lot.id.replace(/\D/g, "")) % 5];
  return (
    <div className="oex-card rounded-2xl p-4 overflow-hidden" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div role="img" aria-label={`Green coffee lot from ${lot.origin}`} style={{ height: 130, margin: "-16px -16px 15px", backgroundImage: "linear-gradient(0deg, rgba(24,15,10,.36), transparent 66%), url('/origin-exchange-green-lots.png')", backgroundSize: "cover", backgroundPosition: crop }} />
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.brassDeep, letterSpacing: ".08em" }}>{lot.no}</span>
        <div className="flex gap-1">
          {lot.certs.map((c) => <span key={c} className="rounded-full px-2 py-0.5" style={{ background: C.leafBg, color: C.leaf, fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{c}</span>)}
        </div>
      </div>
      <div className="mt-1.5" style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{lot.flag} {lot.origin} — {lot.grade}</div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Tag>{lot.process}</Tag><Tag>Crop {lot.crop}</Tag><Tag leaf={lot.score >= 87}>SCA {lot.score.toFixed(2)}</Tag>
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 21, fontWeight: 600, color: C.ink }}>
            {lot.price.toFixed(2)} <span style={{ fontSize: 13, color: C.sub }}>C$/kg</span>
          </div>
          <Delta d={lot.delta} />
        </div>
        <Sparkline data={lot.hist} />
      </div>
      <div className="mt-1" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>{lot.bags} × 60 kg jute available · MOQ 1 bag</div>
      <div className="flex items-center gap-2 mt-3">
        <Stepper qty={bags} setQty={(q) => setBags(Math.max(1, Math.min(lot.bags, q)))} />
        <button onClick={() => onAdd(lot, bags)} className="flex-1 rounded-xl px-3 py-2.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Book {bags} bag{bags > 1 ? "s" : ""} · {fmt(r2(lot.price * 60 * bags))}
        </button>
      </div>
    </div>
  );
}

function TradeDesk({ lots, onAddLot }) {
  return (
    <div className="oex-fade">
      <div className="rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center gap-3" style={{ background: C.tick, border: "1px solid #2A1D12" }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: "#67D08B", boxShadow: "0 0 8px #67D08B", animation: "oexPulse 2.4s ease infinite" }} />
        <span style={{ fontFamily: F.mono, fontSize: 13, color: "#C8B69B", letterSpacing: ".14em" }}>GREEN COFFEE TRADE DESK</span>
        <span style={{ fontFamily: F.mono, fontSize: 13, color: "#6E5B49" }}>indicative C$/kg · 60 kg jute · price locks when you book</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((l) => <LotCard key={l.id} lot={l} onAdd={onAddLot} />)}
      </div>
      <div className="rounded-2xl p-4 mt-5 flex items-start gap-3" style={{ background: "#FFFFFF", border: `1px dashed ${C.line}` }}>
        <Truck size={18} color={C.brassDeep} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
          Green lots ship on pallets from bonded warehouses. Freight is quoted after booking and invoiced separately — most traders pay by bank wire or Interac e-Transfer at checkout. Samples (200 g) available on request for any lot.
        </div>
      </div>
    </div>
  );
}

/* ============================ cart & checkout ============================ */
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.sub, letterSpacing: ".03em" }}>{label}</span>
      <input className="oex-input w-full rounded-xl px-3.5 py-2.5 mt-1" type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ border: `1.5px solid ${C.line}`, fontFamily: F.body, fontSize: 14, background: "#FFFFFF", color: C.ink }} />
    </label>
  );
}

function CartView({ cart, setQty, removeItem, ship, setShip, totals, hasLot, onCheckout, onShop }) {
  if (!cart.length) {
    return (
      <div className="oex-fade rounded-3xl p-10 text-center" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
        <div className="flex justify-center mb-3"><ShoppingCart size={34} color={C.sub} strokeWidth={1.4} /></div>
        <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Your cart is empty</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, marginTop: 6 }}>Browse the catalogue or book a green lot from the trade desk.</div>
        <button onClick={onShop} className="mt-5 rounded-xl px-5 py-2.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Start shopping</button>
      </div>
    );
  }
  return (
    <div className="oex-fade md:flex gap-6 items-start">
      <div className="flex-1">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
          {cart.map((it, idx) => (
            <div key={it.key} className="flex items-center gap-3 p-4" style={{ borderTop: idx ? `1px solid ${C.line}` : "none" }}>
              <div className="rounded-xl overflow-hidden" style={{ width: 54, height: 54, background: C.cream, flexShrink: 0, position: "relative" }}>
                <Image src={it.kind === "lot" ? "/origin-exchange-green-lots.png" : (PRODUCT_VISUALS[it.cat] || PRODUCT_VISUALS.beans)} alt="" fill unoptimized sizes="54px" style={{ objectFit: "cover" }} />
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{it.name}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>{it.sub} · {fmt(it.unit)} ea</div>
              </div>
              <Stepper qty={it.qty} setQty={(q) => setQty(it.key, q)} />
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 14, minWidth: 76, textAlign: "right", color: C.ink }}>{fmt(r2(it.unit * it.qty))}</div>
              <button onClick={() => removeItem(it.key)} aria-label="Remove item" style={{ background: "none", border: "none", cursor: "pointer", color: C.sub }}><X size={16} /></button>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-4 mt-4" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.sub, letterSpacing: ".05em" }}>DELIVERY</div>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {SHIPPING.map((s) => {
              const active = ship === s.id;
              return (
                <button key={s.id} onClick={() => setShip(s.id)} className="rounded-xl p-3 text-left" style={{ border: `2px solid ${active ? C.brass : C.line}`, background: active ? "#FDF6EB" : "#FFFFFF", cursor: "pointer" }}>
                  <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{s.name}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub, marginTop: 2 }}>{s.note}</div>
                </button>
              );
            })}
          </div>
          {hasLot && ship !== "freight" && ship !== "pickup" && (
            <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 13, color: C.down }}>Green lots in cart — choose pallet freight or warehouse pickup for the 60 kg bags.</div>
          )}
        </div>
      </div>
      <div className="md:w-80 mt-4 md:mt-0 rounded-2xl p-5" style={{ background: "#FFFFFF", border: `1px solid ${C.line}`, flexShrink: 0 }}>
        <div style={{ fontFamily: F.disp, fontSize: 18, color: C.ink }}>Order summary</div>
        <div className="mt-3">
          {[["Subtotal", fmt(totals.sub)], ["Shipping", totals.shipLabel], ["Estimated HST (15%)", fmt(totals.gst)]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1" style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
              <span>{k}</span><span style={{ fontFamily: F.mono, color: C.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 mt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>Total</span>
          <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 18, color: C.ink }}>{fmt(totals.total)}</span>
        </div>
        {ship === "freight" && <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}>Pallet freight is quoted after booking and invoiced separately.</div>}
        <button onClick={onCheckout} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 mt-4" style={{ background: C.brass, color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Check out · {fmt(totals.total)} <ArrowRight size={15} />
        </button>
        <div className="mt-2 text-center" style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}>Cards · wallets · Interac · approved wire · gift card</div>
      </div>
    </div>
  );
}

function ContactStep({ contact, setContact, onBack, onNext }) {
  const set = (k) => (v) => setContact({ ...contact, [k]: v });
  const ok = contact.name && contact.email.includes("@") && contact.addr && contact.city && contact.postal;
  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Contact & delivery</div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Input label="Full name" value={contact.name} onChange={set("name")} placeholder="Avery Nguyen" />
        <Input label="Email" type="email" value={contact.email} onChange={set("email")} placeholder="you@roastery.ca" />
        <Input label="Phone (optional)" value={contact.phone} onChange={set("phone")} placeholder="(709) 555-0192" />
        <Input label="Street address" value={contact.addr} onChange={set("addr")} placeholder="48 Water Street" />
        <Input label="City" value={contact.city} onChange={set("city")} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.sub, letterSpacing: ".03em" }}>Province</span>
            <select value={contact.prov} onChange={(e) => set("prov")(e.target.value)} className="oex-input w-full rounded-xl px-3 py-2.5 mt-1" style={{ border: `1.5px solid ${C.line}`, fontFamily: F.body, fontSize: 14, background: "#FFFFFF", color: C.ink }}>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <Input label="Postal code" value={contact.postal} onChange={set("postal")} placeholder="A1C 1A3" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-5">
        <button onClick={onBack} className="inline-flex items-center gap-1" style={{ background: "none", border: "none", color: C.sub, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}><ChevronLeft size={14} /> Cart</button>
        <button disabled={!ok} onClick={onNext} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5" style={{ background: ok ? C.brass : "#E5D9C6", color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: ok ? "pointer" : "not-allowed" }}>
          Continue to payment <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function PayStep({ pm, setPm, pf, setPf, totals, contact, onBack, onNext }) {
  const set = (k) => (v) => setPf({ ...pf, [k]: v });
  const cardOk = pf.num.replace(/\s/g, "").length === 16 && pf.name && pf.exp.length >= 4 && pf.cvc.length >= 3;
  const ok = pm && (pm !== "card" || cardOk);
  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between">
        <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Payment</div>
        <span className="rounded-full px-3 py-1" style={{ background: C.cream, fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.brassDeep }}>Due {fmt(totals.total)}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-4">
        {PAYMENTS.map((m) => {
          const Icon = m.icon; const active = pm === m.id;
          return (
            <button key={m.id} onClick={() => setPm(m.id)} className="rounded-xl p-3 text-left flex items-start gap-2.5" style={{ border: `2px solid ${active ? C.brass : C.line}`, background: active ? "#FDF6EB" : "#FFFFFF", cursor: "pointer" }}>
              <Icon size={16} color={active ? C.brassDeep : C.sub} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                <span style={{ display: "block", fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{m.name}</span>
                <span style={{ display: "block", fontFamily: F.mono, fontSize: 12, color: C.sub, marginTop: 2 }}>{m.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      {pm === "card" && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["VISA", "MASTERCARD", "AMEX", "DISCOVER", "JCB", "UNIONPAY"].map((b) => (
              <span key={b} className="rounded px-2 py-1" style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, border: `1px solid ${C.line}`, color: C.sub, letterSpacing: ".06em" }}>{b}</span>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input label="Card number" value={pf.num} onChange={(v) => set("num")(v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))} placeholder="4242 4242 4242 4242" />
            </div>
            <Input label="Name on card" value={pf.name} onChange={set("name")} placeholder="As printed" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Expiry" value={pf.exp} onChange={(v) => set("exp")(v.replace(/[^\d/]/g, "").slice(0, 5))} placeholder="MM/YY" />
              <Input label="CVC" value={pf.cvc} onChange={(v) => set("cvc")(v.replace(/\D/g, "").slice(0, 4))} placeholder="123" />
            </div>
          </div>
        </div>
      )}
      {(pm === "applepay" || pm === "googlepay" || pm === "paypal") && (
        <div className="mt-4 rounded-2xl p-5 text-center" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
          {pm === "applepay" && <button className="rounded-xl px-6 py-3" style={{ background: "#000000", color: "#FFFFFF", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Pay with Apple Pay</button>}
          {pm === "googlepay" && <button className="rounded-xl px-6 py-3" style={{ background: "#FFFFFF", color: "#1F1F1F", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "1.5px solid #DADCE0", cursor: "pointer" }}>Pay with Google Pay</button>}
          {pm === "paypal" && <button className="rounded-xl px-6 py-3" style={{ background: "#FFC439", color: "#003087", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Pay with PayPal</button>}
          <div className="mt-3" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>The wallet sheet is simulated in this prototype — continue to review to place the order.</div>
        </div>
      )}
      {pm === "interac" && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Input label="Your e-Transfer email" value={pf.interacEmail || contact.email} onChange={set("interacEmail")} placeholder="you@bank.ca" />
          <div className="rounded-xl p-3" style={{ background: C.paper, border: `1px dashed ${C.line}`, fontFamily: F.mono, fontSize: 13, color: C.sub }}>
            Secure payment instructions are issued after order review. No banking details are stored in this prototype.
          </div>
        </div>
      )}
      {pm === "wire" && (
        <div className="mt-4 rounded-2xl p-4" style={{ background: C.paper, border: `1px dashed ${C.line}`, fontFamily: F.mono, fontSize: 13, color: C.ink }}>
          Wire payment is released only after a wholesale account and lot booking are approved. Secure banking instructions appear on the formal invoice.
        </div>
      )}
      {pm === "gift" && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3 items-end">
          <Input label="Gift card code" value={pf.giftcode} onChange={(v) => set("giftcode")(v.toUpperCase())} placeholder="OEX-XXXX-XXXX" />
          <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub, paddingBottom: 10 }}>Balance applies before tax · any remainder falls to a second method at capture.</div>
        </div>
      )}
      {pm === "pickup" && (
        <div className="mt-4 rounded-2xl p-4 flex items-start gap-3" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
          <MapPin size={18} color={C.brassDeep} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.ink }}>
            <span style={{ fontWeight: 700 }}>Deldiet Coffeehouse · 48 Water Street, St. John&apos;s NL</span>
            <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub, marginTop: 3 }}>Mon–Sun 7–8 · bring your order number · debit at the counter</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-5">
        <button onClick={onBack} className="inline-flex items-center gap-1" style={{ background: "none", border: "none", color: C.sub, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}><ChevronLeft size={14} /> Contact</button>
        <button disabled={!ok} onClick={onNext} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5" style={{ background: ok ? C.brass : "#E5D9C6", color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: ok ? "pointer" : "not-allowed" }}>
          Review order <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function ReviewStep({ cart, totals, ship, pm, pf, contact, onBack, onPlace }) {
  const shipName = (SHIPPING.find((s) => s.id === ship) || {}).name || "";
  const payName = (PAYMENTS.find((p) => p.id === pm) || {}).name || "";
  const payDetail = pm === "card" && pf.num ? ` ···· ${pf.num.replace(/\s/g, "").slice(-4)}` : "";
  return (
    <div className="rounded-3xl p-6" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Review & place order</div>
      <div className="rounded-2xl overflow-hidden mt-4" style={{ border: `1px solid ${C.line}` }}>
        {cart.map((it, i) => (
          <div key={it.key} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <span style={{ fontFamily: F.body, fontSize: 14, color: C.ink }}>{it.qty} × {it.name} <span style={{ color: C.sub, fontFamily: F.mono, fontSize: 13 }}>({it.sub})</span></span>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.ink }}>{fmt(r2(it.unit * it.qty))}</span>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {[["DELIVER TO", `${contact.name} · ${contact.addr}, ${contact.city} ${contact.prov} ${contact.postal}`], ["DELIVERY", shipName], ["PAYMENT", payName + payDetail]].map(([k, v]) => (
          <div key={k} className="rounded-xl p-3" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.sub, letterSpacing: ".12em" }}>{k}</div>
            <div className="mt-1" style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.ink }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="md:flex items-end justify-between mt-5 gap-6">
        <div className="flex-1">
          {[["Subtotal", fmt(totals.sub)], ["Shipping", totals.shipLabel], ["Estimated HST (15%)", fmt(totals.gst)]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-0.5" style={{ fontFamily: F.body, fontSize: 14, color: C.sub, maxWidth: 280 }}>
              <span>{k}</span><span style={{ fontFamily: F.mono, color: C.ink }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1" style={{ borderTop: `1px solid ${C.line}`, maxWidth: 280 }}>
            <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>Total</span>
            <span style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 17, color: C.ink }}>{fmt(totals.total)}</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <button onClick={onPlace} className="inline-flex items-center gap-2 rounded-xl px-6 py-3" style={{ background: C.brass, color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
            <Check size={16} /> Place order · {fmt(totals.total)}
          </button>
          <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}>Prototype checkout — nothing is charged.</div>
        </div>
      </div>
      <div className="mt-4">
        <button onClick={onBack} className="inline-flex items-center gap-1" style={{ background: "none", border: "none", color: C.sub, fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}><ChevronLeft size={14} /> Payment</button>
      </div>
    </div>
  );
}

function DoneView({ order, onShop, onTrade }) {
  return (
    <div className="oex-fade rounded-3xl p-10 text-center" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
      <div className="flex justify-center">
        <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: C.leafBg }}>
          <Check size={30} color={C.leaf} strokeWidth={2.5} />
        </div>
      </div>
      <div style={{ fontFamily: F.disp, fontSize: 26, marginTop: 14, color: C.ink }}>Order placed</div>
      <div className="mt-1" style={{ fontFamily: F.mono, fontSize: 14, color: C.brassDeep, fontWeight: 600, letterSpacing: ".06em" }}>{order.num}</div>
      <div className="mt-3" style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
        {fmt(order.total)} · confirmation sent to {order.email || "your inbox"}.
      </div>
      {(order.pm === "wire" || order.pm === "interac") && (
        <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>
          Complete your {order.pm === "wire" ? "bank wire" : "e-Transfer"} using {order.num} as the reference — items are held 3 business days.
        </div>
      )}
      {order.ship === "pickup" && (
        <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>Ready in about 2 hours at Deldiet Coffeehouse · 48 Water Street.</div>
      )}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button onClick={onShop} className="rounded-xl px-5 py-2.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Continue shopping</button>
        <button onClick={onTrade} className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5" style={{ background: "none", color: C.ink, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: `1.5px solid ${C.line}`, cursor: "pointer" }}><TrendingUp size={14} /> View trade desk</button>
      </div>
    </div>
  );
}

/* ================================= app ================================= */
const STEP_LABEL = { contact: "CONTACT", pay: "PAYMENT", review: "REVIEW" };

export default function OriginExchangeHub() {
  const [view, setView] = useState("home");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [f, setF] = useState({ region: "all", roast: "all", org: false, sort: "featured" });
  const [detail, setDetail] = useState(null);
  const [cart, setCart] = useState([]);
  const [ship, setShip] = useState("standard");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", addr: "", city: "St. John's", prov: "NL", postal: "" });
  const [pm, setPm] = useState(null);
  const [pf, setPf] = useState({ num: "", name: "", exp: "", cvc: "", giftcode: "", interacEmail: "" });
  const [step, setStep] = useState("contact");
  const [order, setOrder] = useState(null);
  const [market, setMarket] = useState(() => MARKET0.map((m) => ({ ...m, base: m.price, delta: 0 })));
  const [lots, setLots] = useState(() => LOTS0.map((l) => {
    const hist = Array.from({ length: 12 }, (_, i) => r2(l.base * (1 + Math.sin(i * 1.7) * 0.012 + (i - 6) * 0.0015)));
    return { ...l, price: l.base, delta: 0, hist };
  }));

  useEffect(() => {
    const t = setInterval(() => {
      setMarket((ms) => ms.map((x) => {
        const next = Math.max(0.01, x.price * (1 + (Math.random() - 0.5) * 0.006));
        return { ...x, price: next, delta: ((next / x.base) - 1) * 100 };
      }));
      setLots((ls) => ls.map((l) => {
        const next = Math.max(0.5, r2(l.price * (1 + (Math.random() - 0.5) * 0.005)));
        return { ...l, price: next, delta: ((next / l.base) - 1) * 100, hist: [...l.hist.slice(1), next] };
      }));
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => {
    let xs = PRODUCTS.filter((p) => cat === "all" || p.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      xs = xs.filter((p) => `${p.name} ${p.origin || ""} ${p.notes} ${p.roaster}`.toLowerCase().includes(q));
    }
    if (f.region !== "all") xs = xs.filter((p) => p.region === f.region);
    if (f.roast !== "all") xs = xs.filter((p) => p.roast === f.roast);
    if (f.org) xs = xs.filter((p) => p.organic);
    if (f.sort === "asc") xs = [...xs].sort((a, b) => a.sizes[0].p - b.sizes[0].p);
    else if (f.sort === "desc") xs = [...xs].sort((a, b) => b.sizes[0].p - a.sizes[0].p);
    else if (f.sort === "rating") xs = [...xs].sort((a, b) => b.rating - a.rating);
    else xs = [...xs].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);
    return xs;
  }, [cat, query, f]);

  const hasLot = cart.some((it) => it.kind === "lot");
  const count = cart.reduce((s, it) => s + it.qty, 0);

  const totals = useMemo(() => {
    const sub = r2(cart.reduce((s, it) => s + it.unit * it.qty, 0));
    let shipCost = 0, shipLabel = "Free";
    if (ship === "standard") { shipCost = sub >= 75 || sub === 0 ? 0 : 9.95; shipLabel = shipCost === 0 ? "Free" : fmt(9.95); }
    if (ship === "express") { shipCost = 19.95; shipLabel = fmt(19.95); }
    if (ship === "pickup") { shipLabel = "Free"; }
    if (ship === "freight") { shipLabel = "Quoted"; }
    const gst = r2((sub + shipCost) * 0.15);
    return { sub, shipCost, shipLabel, gst, total: r2(sub + shipCost + gst) };
  }, [cart, ship]);

  const goBrowse = (c) => { setCat(c); setF({ region: "all", roast: "all", org: false, sort: "featured" }); setView("browse"); window.scrollTo(0, 0); };
  const goView = (v) => { setView(v); window.scrollTo(0, 0); };
  const openDetail = (p) => { setDetail(p); setView("product"); window.scrollTo(0, 0); };
  const addItem = (p, v, qty = 1) => {
    const key = `${p.id}|${v.l}`;
    setCart((c) => {
      const ex = c.find((it) => it.key === key);
      if (ex) return c.map((it) => (it.key === key ? { ...it, qty: it.qty + qty } : it));
      return [...c, { key, kind: "item", id: p.id, cat: p.cat, name: p.name, sub: v.l, flag: p.flag, unit: v.p, qty }];
    });
  };
  const quickAdd = (p) => addItem(p, p.sizes[0], 1);
  const addLot = (lot, bags) => {
    const key = `lot|${lot.id}`;
    const unit = r2(lot.price * 60);
    setCart((c) => {
      const ex = c.find((it) => it.key === key);
      if (ex) return c.map((it) => (it.key === key ? { ...it, qty: it.qty + bags } : it));
      return [...c, { key, kind: "lot", id: lot.id, cat: "lot", name: `${lot.origin} ${lot.grade} · ${lot.no}`, sub: `60 kg jute @ ${lot.price.toFixed(2)} C$/kg`, flag: lot.flag, unit, qty: bags }];
    });
  };
  const setQty = (key, q) => setCart((c) => (q <= 0 ? c.filter((it) => it.key !== key) : c.map((it) => (it.key === key ? { ...it, qty: Math.min(999, q) } : it))));
  const removeItem = (key) => setCart((c) => c.filter((it) => it.key !== key));
  const goCheckout = () => {
    if (!cart.length) return;
    if (hasLot && (ship === "standard" || ship === "express")) setShip("freight");
    setStep("contact"); goView("checkout");
  };
  const placeOrder = () => {
    const num = `OEX-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrder({ num, total: totals.total, email: contact.email, pm, ship });
    setCart([]); setPm(null); goView("done");
  };

  return (
    <div className="oex-app" style={{ background: C.paper, minHeight: "100vh", color: C.ink, fontFamily: F.body }}>
      <style>{STYLES}</style>
      <header style={{ background: C.esp }}>
        <div style={{ borderBottom: "1px solid #3A2818" }}>
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <Link href="/" className="oex-back-deldiet"><ChevronLeft size={13} /><span className="oex-label-wide">DELDIET COFFEEHOUSE &amp; STORE</span><span className="oex-label-short">DELDIET HOME</span></Link>
            <Link href="/origin-bar" className="oex-back-deldiet"><span className="oex-label-wide">BUILD AT ORIGIN BAR</span><span className="oex-label-short">ORIGIN BAR</span><ArrowRight size={13} /></Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => goView("home")} className="flex items-center gap-2.5" style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <span className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: C.brass }}>
              <Coffee size={18} color="#241405" />
            </span>
            <span className="text-left">
              <span style={{ display: "block", fontFamily: F.disp, fontSize: 17, color: C.cream, lineHeight: 1 }}>Deldiet Origin Exchange</span>
              <span className="hidden sm:block" style={{ fontFamily: F.mono, fontSize: 12, color: "#C8B69B", letterSpacing: ".22em", marginTop: 3 }}>THE WORLD&apos;S COFFEE, TRADED OPENLY</span>
            </span>
          </button>
          <div className="flex-1 relative" style={{ maxWidth: 460, marginLeft: "auto" }}>
            <Search size={14} color="#9A8772" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (view !== "browse") { setView("browse"); setCat("all"); } }}
              placeholder="Search beans, origins, machines…"
              className="oex-input w-full rounded-full py-2"
              style={{ paddingLeft: 34, paddingRight: 14, border: "1.5px solid #3A2818", background: "#2C1D12", color: C.cream, fontFamily: F.body, fontSize: 14 }}
            />
          </div>
          <button onClick={() => goView("trade")} className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2" style={{ border: `1.5px solid ${C.brass}`, color: C.brass, background: "none", fontFamily: F.mono, fontSize: 13, fontWeight: 600, letterSpacing: ".06em", cursor: "pointer", flexShrink: 0 }}>
            <TrendingUp size={13} /> TRADE DESK
          </button>
          <button onClick={() => goView("cart")} className="relative rounded-full p-2.5" style={{ background: "#2C1D12", border: "1.5px solid #3A2818", cursor: "pointer", flexShrink: 0 }} aria-label="Open cart">
            <ShoppingCart size={17} color={C.cream} />
            {count > 0 && (
              <span className="absolute flex items-center justify-center rounded-full" style={{ top: -4, right: -4, minWidth: 18, height: 18, background: C.brass, color: "#241405", fontFamily: F.mono, fontSize: 12, fontWeight: 700, padding: "0 4px" }}>{count}</span>
            )}
          </button>
        </div>
      </header>
      <Ticker market={market} />
      <div style={{ background: C.paper, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto oex-scroll">
          {CATS.map((c) => <Chip key={c.id} active={view === "browse" && cat === c.id} onClick={() => goBrowse(c.id)}>{c.name}</Chip>)}
          <Chip active={view === "trade"} onClick={() => goView("trade")}>
            <span className="inline-flex items-center gap-1"><TrendingUp size={12} /> Trade desk</span>
          </Chip>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-24 pt-6">
        {view === "home" && (
          <div className="oex-fade">
            <div className="grid md:grid-cols-2 gap-8 items-center rounded-3xl p-6 md:p-10" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.brassDeep, letterSpacing: ".18em" }}>COMMODITY DESK · ROASTERY · OUTFITTER</div>
                <h1 style={{ fontFamily: F.disp, fontSize: 40, lineHeight: 1.08, margin: "12px 0 0", color: C.ink }}>Every coffee on Earth. One exchange.</h1>
                <p style={{ fontFamily: F.body, fontSize: 15, color: C.sub, marginTop: 12, maxWidth: 440 }}>
                  Roasted micro-lots, green coffee by the 60 kg bag, pods to kilo tins, functional blends, machines and every tool of the trade — settled in whatever currency you carry.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button onClick={() => goBrowse("beans")} className="inline-flex items-center gap-2 rounded-xl px-5 py-3" style={{ background: C.brass, color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                    Shop roasted beans <ArrowRight size={15} />
                  </button>
                  <button onClick={() => goView("trade")} className="inline-flex items-center gap-2 rounded-xl px-5 py-3" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                    <TrendingUp size={15} /> Open the trade desk
                  </button>
                </div>
              </div>
              <div className="rounded-3xl p-6 flex items-end" style={{ minHeight: 430, backgroundImage: "linear-gradient(0deg, rgba(20,12,8,.72), rgba(20,12,8,.02) 64%), url('/origin-exchange-hero.png')", backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden" }}>
                <div className="rounded-2xl p-4 flex items-center justify-between" style={{ width: "100%", background: "rgba(34,22,17,.88)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(10px)" }}>
                  <div>
                    <div style={{ fontFamily: F.mono, fontSize: 12, color: "#C8B69B", letterSpacing: ".14em" }}>KC ARABICA · ¢/LB</div>
                    <div style={{ fontFamily: F.mono, fontSize: 24, color: "#FFFFFF", fontWeight: 600 }}>{market[0].price.toFixed(2)}</div>
                  </div>
                  <Delta d={market[0].delta} dark />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[[BadgeCheck, "Certified lots", "organic · fairtrade · rainforest"], [Globe, "40+ origins", "africa to the pacific"], [Truck, "Ships worldwide", "from St. John's"], [Landmark, "Secure payment choices", "card · wallet · Interac · wire"]].map(([Icon, t, s]) => (
                <div key={t} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
                  <Icon size={17} color={C.brassDeep} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{t}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 12, color: C.sub, marginTop: 2 }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              {CATS.filter((c) => c.id !== "all").map((c) => {
                const Icon = c.icon; const n = PRODUCTS.filter((p) => p.cat === c.id).length;
                return (
                  <button key={c.id} onClick={() => goBrowse(c.id)} className="oex-card rounded-2xl p-4 text-left" style={{ background: "#FFFFFF", border: `1px solid ${C.line}`, cursor: "pointer" }}>
                    <Icon size={18} color={C.brassDeep} />
                    <div className="mt-2" style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{c.name}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 12, color: C.sub, marginTop: 2 }}>{n} listings</div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-10 mb-4">
              <h2 style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Featured on the floor</h2>
              <button onClick={() => goBrowse("all")} className="inline-flex items-center gap-1" style={{ background: "none", border: "none", color: C.brassDeep, fontFamily: F.body, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                See everything <ArrowRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4).map((p) => <ProductCard key={p.id} p={p} onOpen={openDetail} onQuickAdd={quickAdd} />)}
            </div>
          </div>
        )}

        {view === "browse" && (
          <div className="oex-fade">
            <div className="flex items-baseline justify-between mb-4">
              <h2 style={{ fontFamily: F.disp, fontSize: 24, color: C.ink }}>{(CATS.find((c) => c.id === cat) || {}).name}</h2>
              {query && <span style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>matching “{query}”</span>}
            </div>
            <FilterBar cat={cat} f={f} setF={setF} count={list.length} />
            {list.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map((p) => <ProductCard key={p.id} p={p} onOpen={openDetail} onQuickAdd={quickAdd} />)}
              </div>
            ) : (
              <div className="rounded-3xl p-10 text-center" style={{ background: "#FFFFFF", border: `1px dashed ${C.line}` }}>
                <div style={{ fontFamily: F.disp, fontSize: 18, color: C.ink }}>Nothing matches those filters</div>
                <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, marginTop: 4 }}>Clear a filter or search a different origin.</div>
              </div>
            )}
          </div>
        )}

        {view === "product" && detail && (
          <ProductDetail p={detail} onBack={() => setView("browse")} onAdd={(p, v, q) => { addItem(p, v, q); goView("cart"); }} />
        )}

        {view === "trade" && <TradeDesk lots={lots} onAddLot={(l, b) => { addLot(l, b); goView("cart"); }} />}

        {view === "cart" && (
          <CartView cart={cart} setQty={setQty} removeItem={removeItem} ship={ship} setShip={setShip} totals={totals} hasLot={hasLot} onCheckout={goCheckout} onShop={() => goBrowse("all")} />
        )}

        {view === "checkout" && (
          <div className="oex-fade" style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="flex items-center gap-2 mb-4" style={{ fontFamily: F.mono, fontSize: 13, letterSpacing: ".1em" }}>
              {["contact", "pay", "review"].map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && <span style={{ color: C.line }}>——</span>}
                  <span style={{ color: step === s ? C.brassDeep : C.sub, fontWeight: step === s ? 700 : 500 }}>{i + 1} {STEP_LABEL[s]}</span>
                </React.Fragment>
              ))}
            </div>
            {step === "contact" && <ContactStep contact={contact} setContact={setContact} onBack={() => goView("cart")} onNext={() => { setStep("pay"); window.scrollTo(0, 0); }} />}
            {step === "pay" && <PayStep pm={pm} setPm={setPm} pf={pf} setPf={setPf} totals={totals} contact={contact} onBack={() => setStep("contact")} onNext={() => { setStep("review"); window.scrollTo(0, 0); }} />}
            {step === "review" && <ReviewStep cart={cart} totals={totals} ship={ship} pm={pm} pf={pf} contact={contact} onBack={() => setStep("pay")} onPlace={placeOrder} />}
          </div>
        )}

        {view === "done" && order && <DoneView order={order} onShop={() => goBrowse("all")} onTrade={() => goView("trade")} />}
      </main>

      <footer className="py-8 text-center" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="px-4" style={{ fontFamily: F.mono, fontSize: 12, color: C.sub, letterSpacing: ".06em" }}>
          DELDIET ORIGIN EXCHANGE — interactive prototype · prices, indices &amp; lots are illustrative · HST estimate shown for Newfoundland and Labrador
        </div>
      </footer>
    </div>
  );
}
