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
.oex-app button,.oex-app input,.oex-app select { min-height:44px; }
.oex-app input,.oex-app select { font-size:16px !important; }
.oex-truth-banner { padding:11px 16px; display:flex; justify-content:center; gap:10px; background:#FFF1CF; border-bottom:1px solid #D9C28D; color:#5D431E; font-family:${F.body}; font-size:13px; line-height:1.45; text-align:center; }
.oex-exchange-hero { min-height:610px; padding:clamp(34px,6vw,76px); position:relative; overflow:hidden; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr); gap:clamp(28px,6vw,90px); align-items:end; color:#fff; background-image:linear-gradient(90deg,rgba(19,11,7,.95) 0%,rgba(19,11,7,.76) 48%,rgba(19,11,7,.25) 100%),url('/origin-exchange-hero.png'); background-size:cover; background-position:center; box-shadow:0 28px 80px rgba(34,22,17,.12); }
.oex-exchange-hero h1 { max-width:780px; margin:14px 0 20px; font-family:${F.disp}; font-size:clamp(52px,7vw,96px); font-weight:400; line-height:.92; letter-spacing:-.045em; }
.oex-exchange-hero p { max-width:680px; margin:0; color:#D7C8B7; font-size:17px; line-height:1.7; }
.oex-mode-switch { margin-top:34px; display:grid; grid-template-columns:1fr 1fr; max-width:680px; border:1px solid rgba(255,255,255,.22); }
.oex-mode-switch button { min-height:92px; padding:17px; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; gap:6px; border:0; border-right:1px solid rgba(255,255,255,.22); background:rgba(20,12,8,.48); color:#fff; text-align:left; cursor:pointer; }
.oex-mode-switch button:last-child { border-right:0; }.oex-mode-switch button:hover{background:#C98B43;color:#241405}.oex-mode-switch b{font-size:15px}.oex-mode-switch small{font-size:12px;opacity:.72;line-height:1.4}
.oex-verification-ledger { padding:24px; border:1px solid rgba(255,255,255,.22); background:rgba(28,17,12,.78); backdrop-filter:blur(18px); }
.oex-verification-ledger > span { color:#C98B43; font-family:${F.mono}; font-size:12px; letter-spacing:.13em; text-transform:uppercase; }
.oex-verification-ledger h2 { margin:18px 0 20px; font-family:${F.disp}; font-size:38px; font-weight:400; }
.oex-verification-ledger div { min-height:58px; display:grid; grid-template-columns:1fr auto; gap:12px; align-items:center; border-top:1px solid rgba(255,255,255,.16); font-size:14px; }.oex-verification-ledger small{color:#BBA890;font-size:12px;text-align:right}
.oex-status-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:18px; }.oex-status-grid article{min-height:130px;padding:18px;background:#fff;border:1px solid #E6DFD3}.oex-status-grid b{display:block;margin:12px 0 5px;font-size:15px}.oex-status-grid span{color:#7A6A5C;font-family:${F.mono};font-size:12px;line-height:1.45}
.oex-inquiry-view { display:grid; grid-template-columns:minmax(0,1fr) minmax(290px,360px); gap:24px; align-items:start; }.oex-inquiry-panel{padding:22px;background:#fff;border:1px solid #E6DFD3}.oex-inquiry-item{padding:16px 0;display:grid;grid-template-columns:1fr auto auto;gap:14px;align-items:center;border-bottom:1px solid #E6DFD3}.oex-inquiry-item:first-child{border-top:1px solid #E6DFD3}.oex-document-grid{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.oex-document-grid span{min-height:54px;padding:10px;display:flex;flex-direction:column;justify-content:center;border:1px solid #E6DFD3;background:#F7F4EE;font-size:13px}.oex-document-grid small{margin-top:3px;color:#9A6C2B;font-size:11px}
.oex-app button:focus-visible,.oex-app a:focus-visible,.oex-app input:focus-visible,.oex-app select:focus-visible,.oex-app textarea:focus-visible{outline:3px solid #D9FF66;outline-offset:3px}.oex-product-grid{display:grid}.oex-cart-item{display:flex;align-items:center;gap:12px}
@media (max-width: 640px) {
  .oex-back-deldiet { gap: 5px; font-size: 12px; letter-spacing: .08em; }
  .oex-label-wide { display: none; }
  .oex-label-short { display: inline; }
  .oex-exchange-hero{min-height:760px;padding:50px 22px;grid-template-columns:1fr;align-items:end;background-image:linear-gradient(0deg,rgba(19,11,7,.97) 0%,rgba(19,11,7,.78) 62%,rgba(19,11,7,.22) 100%),url('/origin-exchange-hero.png')}.oex-exchange-hero h1{font-size:56px}.oex-exchange-hero p{font-size:15px}.oex-mode-switch{grid-template-columns:1fr}.oex-mode-switch button{border-right:0;border-bottom:1px solid rgba(255,255,255,.22)}.oex-mode-switch button:last-child{border-bottom:0}.oex-status-grid{grid-template-columns:1fr 1fr}.oex-inquiry-view{grid-template-columns:1fr}.oex-inquiry-item{grid-template-columns:1fr auto}.oex-inquiry-item>div:first-child{grid-column:1/-1}.oex-document-grid{grid-template-columns:1fr}.oex-truth-banner{text-align:left}
}
@media (max-width: 480px) {
  .oex-product-grid{grid-template-columns:1fr!important}.oex-cart-item{display:grid;grid-template-columns:54px minmax(0,1fr) auto}.oex-cart-item .oex-cart-copy{grid-column:2/-1}.oex-cart-item .oex-cart-price{grid-column:2}.oex-status-grid{grid-template-columns:1fr}.oex-exchange-hero h1{font-size:48px}
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
  { id: "p3", cat: "pods", name: "Decaf Pods · Intensity 5", roaster: "Origin Exchange Roastworks", origin: "Peru", flag: "🇵🇪", roast: "medium", type: "arabica", organic: true, decaf: true, notes: "decaf process and caffeine specification pending", rating: 4.4, reviews: 466, sizes: [{ l: "10 pods", p: 9.9 }, { l: "30 pods", p: 27 }] },
  { id: "p4", cat: "pods", name: "Vanilla Bean Pods", roaster: "Origin Exchange Roastworks", origin: "Multi-origin", flag: "🌐", roast: "medium", type: "blend", organic: false, notes: "real vanilla · no artificial flavour", rating: 4.3, reviews: 351, sizes: [{ l: "10 pods", p: 10.5 }, { l: "30 pods", p: 29 }] },
  { id: "p5", cat: "pods", name: "World Tour Variety Pack", roaster: "Origin Exchange Roastworks", origin: "6 origins", flag: "🌐", roast: "medium", type: "arabica", organic: true, notes: "Ethiopia → Panama in 30 pods", rating: 4.7, reviews: 612, badge: "Starter", sizes: [{ l: "30 pods", p: 27.5 }] },
  /* instant & concentrate */
  { id: "i1", cat: "instant", name: "Freeze-Dried Huila Sachets", roaster: "Casa Mirador", origin: "Colombia", flag: "🇨🇴", roast: "medium", type: "arabica", organic: true, notes: "8 single sachets · just add water", rating: 4.5, reviews: 720, sizes: [{ l: "8 sachets", p: 14 }] },
  { id: "i2", cat: "instant", name: "Specialty Instant Canister", roaster: "Solstice Coffee Co.", origin: "Ethiopia", flag: "🇪🇹", roast: "light", type: "arabica", organic: true, notes: "90 g · ~30 cups · bright & floral", rating: 4.4, reviews: 388, sizes: [{ l: "90 g", p: 19 }] },
  { id: "i3", cat: "instant", name: "Cold Brew Concentrate", roaster: "Northbound Roasters", origin: "Brazil + Colombia", flag: "🌐", roast: "meddark", type: "blend", organic: true, notes: "946 ml · dilute 1:1 · 18-hr steep", rating: 4.7, reviews: 1105, badge: "Best seller", sizes: [{ l: "946 ml", p: 15.5 }] },
  { id: "i4", cat: "instant", name: "Espresso Concentrate", roaster: "Atlas & Ember", origin: "Vietnam + Brazil", flag: "🌐", roast: "dark", type: "blend", organic: false, notes: "473 ml · lattes in 30 seconds", rating: 4.3, reviews: 274, sizes: [{ l: "473 ml", p: 13 }] },
  /* infused & functional */
  { id: "f1", cat: "infused", name: "Concept · Collagen Coffee", roaster: "Origin Exchange Labs", origin: "Colombia", flag: "✨", roast: "medium", type: "arabica", organic: false, notes: "formula, serving quantity and sourcing pending review", rating: 4.6, reviews: 980, badge: "Concept", sizes: [{ l: "340 g", p: 32 }] },
  { id: "f2", cat: "infused", name: "Concept · Lion's Mane Blend", roaster: "Origin Exchange Labs", origin: "Ethiopia", flag: "✨", roast: "light", type: "arabica", organic: true, notes: "ingredient identity, amount and testing pending review", rating: 4.7, reviews: 731, sizes: [{ l: "300 g", p: 29 }] },
  { id: "f3", cat: "infused", name: "Concept · Coffee with MCT", roaster: "Origin Exchange Labs", origin: "Brazil", flag: "✨", roast: "meddark", type: "arabica", organic: false, notes: "formula, allergens and serving quantity pending review", rating: 4.5, reviews: 644, sizes: [{ l: "300 g", p: 27 }] },
  { id: "f4", cat: "infused", name: "Concept · Plant Protein Mocha", roaster: "Origin Exchange Labs", origin: "Multi-origin", flag: "✨", roast: "medium", type: "blend", organic: false, notes: "formula, allergens and serving quantity pending review", rating: 4.4, reviews: 512, sizes: [{ l: "680 g", p: 39 }] },
  { id: "f5", cat: "infused", name: "Concept · Botanical Decaf", roaster: "Origin Exchange Labs", origin: "Peru", flag: "✨", roast: "medium", type: "arabica", organic: true, decaf: true, notes: "ingredient, interaction and caffeine review required", rating: 4.6, reviews: 423, sizes: [{ l: "300 g", p: 28 }] },
  { id: "f6", cat: "infused", name: "Concept · Mineral Cold Brew Packs", roaster: "Origin Exchange Labs", origin: "Colombia", flag: "✨", roast: "medium", type: "arabica", organic: false, notes: "formula, mineral specification and testing pending review", rating: 4.3, reviews: 287, sizes: [{ l: "6 packs", p: 21 }] },
  { id: "f7", cat: "infused", name: "Concept · Maca Coffee Blend", roaster: "Origin Exchange Labs", origin: "Peru", flag: "✨", roast: "medium", type: "arabica", organic: true, notes: "ingredient identity, amount and testing pending review", rating: 4.4, reviews: 198, sizes: [{ l: "300 g", p: 26 }] },
  { id: "f8", cat: "infused", name: "Concept · Coffee with B12", roaster: "Origin Exchange Labs", origin: "Multi-origin", flag: "✨", roast: "medium", type: "blend", organic: false, notes: "formula, amount and regulatory review required", rating: 4.2, reviews: 163, sizes: [{ l: "10 sticks", p: 18 }] },
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
  { id: "card", name: "Credit / Debit card", sub: "Provider integration pending · demo fields only", icon: CreditCard },
  { id: "applepay", name: "Apple Pay", sub: "Concept wallet option · not connected", icon: Wallet },
  { id: "googlepay", name: "Google Pay", sub: "Concept wallet option · not connected", icon: Wallet },
  { id: "paypal", name: "PayPal", sub: "Concept wallet option · not connected", icon: Wallet },
  { id: "interac", name: "Interac e-Transfer", sub: "Concept Canadian payment path", icon: Landmark },
  { id: "wire", name: "Approved business account", sub: "Retail account workflow · integration pending", icon: Landmark },
  { id: "gift", name: "Gift card", sub: "Concept redemption flow", icon: Gift },
  { id: "pickup", name: "Pay at pickup", sub: "Flagship location to be confirmed", icon: Banknote }
];

const SHIPPING = [
  { id: "standard", name: "Illustrative standard delivery", note: "Calculated after provider connection" },
  { id: "express", name: "Illustrative express delivery", note: "Availability and rate not yet connected" },
  { id: "pickup", name: "Coffeehouse pickup", note: "Location and readiness confirmed at launch" }
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

function Ticker({ market, paused, onToggle }) {
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
          <span style={{ width: 7, height: 7, borderRadius: 99, background: C.brass }} />
          <span style={{ color: "#C8B69B", fontFamily: F.mono, fontSize: 12, letterSpacing: ".12em" }}>INDICATIVE DEMO BOARD</span>
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ display: "inline-flex", whiteSpace: "nowrap", width: "max-content", animation: "oexTape 48s linear infinite", animationPlayState: paused ? "paused" : "running", padding: "8px 0" }}>
            {renderRow("a")}{renderRow("b")}
          </div>
        </div>
        <button onClick={onToggle} aria-pressed={paused} style={{ minWidth: 74, border: 0, borderLeft: "1px solid #2A1D12", background: "#241710", color: "#C8B69B", fontFamily: F.mono, fontSize: 12, cursor: "pointer" }}>{paused ? "Play" : "Pause"}</button>
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

function Stars() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={12} color={C.brass} fill="transparent" strokeWidth={1.5} />
        ))}
      </span>
      <span style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>review layer · awaiting verified customer data</span>
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
    <article className="oex-card rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="relative overflow-hidden" style={{ background: C.cream }}>
        <ProductArt p={p} />
      </div>
      <div className="p-4">
        <div className="mb-1.5" style={{ minHeight: 18 }}>
          {p.badge && <span className="rounded-full px-2 py-0.5" style={{ background: C.leafBg, color: C.leaf, fontFamily: F.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".08em" }}>CONCEPT · {p.badge.toUpperCase()}</span>}
        </div>
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.25 }}>{p.name}</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, marginTop: 2 }}>{p.roaster}{p.origin ? ` · ${p.origin}` : ""}</div>
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.brassDeep, marginTop: 6, minHeight: 28 }}>{p.notes}</div>
        <div className="mt-2"><Stars /></div>
        <div className="flex items-center justify-between mt-3">
          <div style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.ink }}>{p.sizes.length > 1 ? "from " : ""}{fmt(from)}</div>
          <div className="flex items-center gap-1.5">
          <button onClick={() => onOpen(p)} className="rounded-full px-3 py-1.5" style={{ background: "none", color: C.ink, fontFamily: F.body, fontSize: 14, fontWeight: 700, border: `1.5px solid ${C.line}`, cursor: "pointer" }}>Details</button>
          <button onClick={() => onQuickAdd(p)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> Add
          </button>
          </div>
        </div>
      </div>
    </article>
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
        <span className="inline-flex items-center gap-1"><Leaf size={12} /> Organic claim</span>
      </Chip>
      <select value={f.sort} onChange={(e) => set("sort", e.target.value)} className="rounded-full px-3 py-1.5 ml-auto" style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, border: `1.5px solid ${C.line}`, background: "#FFFFFF", color: C.ink, cursor: "pointer" }}>
        <option value="featured">Featured</option>
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
          {p.badge && <span className="rounded-full px-2.5 py-1" style={{ background: C.leafBg, color: C.leaf, fontFamily: F.mono, fontSize: 12, fontWeight: 600, letterSpacing: ".08em" }}>CONCEPT · {p.badge.toUpperCase()}</span>}
          <h1 style={{ fontFamily: F.disp, fontSize: 30, color: C.ink, margin: "10px 0 2px", lineHeight: 1.15 }}>{p.name}</h1>
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
            {p.roaster}{p.origin ? ` · ${p.flag} ${p.origin}` : ""}{regionName ? ` · ${regionName}` : ""}
          </div>
          <div className="mt-2"><Stars /></div>
          <p style={{ fontFamily: F.mono, fontSize: 14, color: C.brassDeep, marginTop: 12 }}>{p.notes}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.roast && ROAST_NAME[p.roast] && <Tag>{ROAST_NAME[p.roast]} roast</Tag>}
            {p.type && <Tag>{p.type}</Tag>}
            {p.organic && <Tag leaf>Organic claim · unverified</Tag>}
            {p.decaf && <Tag>Decaf-process claim · unverified</Tag>}
            {p.cat === "infused" && <Tag>Concept formula · ingredient and regulatory review required</Tag>}
            {p.cat === "pods" && <Tag leaf>Compatibility / compostability claims · verify</Tag>}
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
            Catalogue price, inventory, roast date, ingredients, allergens and fulfilment are illustrative until verified provider records are connected.
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
        <span className="rounded-full px-2 py-0.5" style={{ background: "#F3EEE4", color: C.sub, fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>ILLUSTRATIVE LOT</span>
      </div>
      <div className="mt-1.5" style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{lot.flag} {lot.origin} — {lot.grade}</div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Tag>{lot.process} · sample field</Tag><Tag>Crop {lot.crop} · unverified</Tag><Tag>Sample score {lot.score.toFixed(2)}</Tag>
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
      <div className="mt-1" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>Sample availability: {lot.bags} × 60 kg jute · operational stock not connected</div>
      <div className="flex items-center gap-2 mt-3">
        <Stepper qty={bags} setQty={(q) => setBags(Math.max(1, Math.min(lot.bags, q)))} />
        <button onClick={() => onAdd(lot, bags)} className="flex-1 rounded-xl px-3 py-2.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Add {bags} bag{bags > 1 ? "s" : ""} to sourcing enquiry
        </button>
      </div>
    </div>
  );
}

function TradeDesk({ lots, onAddLot, inquiryCount, onOpenInquiry }) {
  return (
    <div className="oex-fade">
      <div className="rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center gap-3" style={{ background: C.tick, border: "1px solid #2A1D12" }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: C.brass }} />
        <span style={{ fontFamily: F.mono, fontSize: 13, color: "#C8B69B", letterSpacing: ".14em" }}>GREEN COFFEE TRADE DESK</span>
        <span style={{ fontFamily: F.mono, fontSize: 13, color: "#8D7763" }}>illustrative C$/kg · 60 kg jute · no live feed or inventory connection</span>
        <button onClick={onOpenInquiry} style={{ marginLeft: "auto", border: "1px solid #C98B43", borderRadius: 999, background: "none", color: "#C98B43", padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sourcing enquiry · {inquiryCount}</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lots.map((l) => <LotCard key={l.id} lot={l} onAdd={onAddLot} />)}
      </div>
      <div className="rounded-2xl p-4 mt-5 flex items-start gap-3" style={{ background: "#FFFFFF", border: `1px dashed ${C.line}` }}>
        <Truck size={18} color={C.brassDeep} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
          Retail checkout and green-coffee sourcing are deliberately separate. Trade lots create a sample or quote enquiry; Deldiet must verify the supplier, lot documents, inventory, destination, incoterm, freight, tax and payment terms before any transaction.
        </div>
      </div>
    </div>
  );
}

function TradeInquiryView({ items, setQty, removeItem, onBack, onSubmit }) {
  const [requestType, setRequestType] = useState("sample");
  const [profile, setProfile] = useState({ company: "", name: "", email: "", destination: "", notes: "" });
  const set = (key) => (value) => setProfile((current) => ({ ...current, [key]: value }));
  const canSubmit = items.length > 0 && profile.name.trim() && profile.email.includes("@") && profile.destination.trim();
  if (!items.length) return <div className="oex-fade oex-inquiry-panel" style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: 50 }}><Search size={30} color={C.brassDeep} style={{ margin: "0 auto" }}/><h1 style={{ margin: "16px 0 6px", fontFamily: F.disp, fontSize: 34, fontWeight: 400 }}>No lots in your sourcing enquiry</h1><p style={{ color: C.sub, fontSize: 15 }}>Open the Trade Desk to add illustrative lots for comparison, sampling or a formal quote request.</p><button onClick={onBack} style={{ marginTop: 18, border: 0, borderRadius: 999, background: C.esp, color: C.cream, padding: "11px 18px", fontWeight: 700, cursor: "pointer" }}>Open Trade Desk</button></div>;
  return (
    <div className="oex-fade">
      <button onClick={onBack} className="inline-flex items-center gap-1 mb-4" style={{ border: 0, background: "none", color: C.sub, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><ChevronLeft size={15}/> Trade Desk</button>
      <div className="oex-inquiry-view">
        <section className="oex-inquiry-panel">
          <div style={{ fontFamily: F.mono, color: C.brassDeep, fontSize: 12, letterSpacing: ".13em", textTransform: "uppercase" }}>Trade workflow · no checkout</div>
          <h1 style={{ margin: "10px 0 8px", fontFamily: F.disp, fontSize: 40, fontWeight: 400 }}>Build a sourcing enquiry</h1>
          <p style={{ margin: "0 0 22px", color: C.sub, fontSize: 15, lineHeight: 1.65 }}>Compare sample lots, choose the kind of response you need, and request verification. This does not reserve inventory or create a purchase.</p>
          {items.map((item) => <article key={item.key} className="oex-inquiry-item"><div><b style={{ display: "block", fontSize: 15 }}>{item.name}</b><span style={{ display: "block", marginTop: 4, color: C.sub, fontFamily: F.mono, fontSize: 12 }}>{item.sub}</span></div><Stepper qty={item.qty} setQty={(qty) => setQty(item.key, qty)}/><button onClick={() => removeItem(item.key)} aria-label={`Remove ${item.name}`} style={{ border: 0, background: "none", color: C.sub, cursor: "pointer" }}><X size={16}/></button></article>)}
          <h2 style={{ margin: "28px 0 8px", fontFamily: F.disp, fontSize: 28, fontWeight: 400 }}>Required due-diligence record</h2>
          <p style={{ margin: 0, color: C.sub, fontSize: 14, lineHeight: 1.6 }}>Every field stays pending until a named supplier or authorized source provides evidence.</p>
          <div className="oex-document-grid">{[["Lot identity","Pending verification"],["Cupping report","Not supplied"],["Certification evidence","Not supplied"],["Inventory / crop","Pending verification"],["Export & logistics","Quote required"],["Producer consent","Pending verification"]].map(([name,status]) => <span key={name}><b>{name}</b><small>{status}</small></span>)}</div>
        </section>
        <aside className="oex-inquiry-panel" style={{ position: "sticky", top: 18 }}>
          <h2 style={{ margin: 0, fontFamily: F.disp, fontSize: 30, fontWeight: 400 }}>What should Deldiet prepare?</h2>
          <div className="grid grid-cols-2 gap-2" style={{ marginTop: 16 }}>{[["sample","Sample request"],["quote","Verified quote"]].map(([id,label]) => <button key={id} aria-pressed={requestType === id} onClick={() => setRequestType(id)} style={{ border: `2px solid ${requestType === id ? C.brass : C.line}`, background: requestType === id ? "#FDF6EB" : "#fff", color: C.ink, padding: 10, fontWeight: 700, cursor: "pointer" }}>{label}</button>)}</div>
          {["company","name","email","destination"].map((key) => <label key={key} style={{ display: "block", marginTop: 14 }}><span style={{ display: "block", color: C.sub, fontFamily: F.mono, fontSize: 12, textTransform: "uppercase" }}>{key === "destination" ? "Destination country / city" : key}</span><input value={profile[key]} type={key === "email" ? "email" : "text"} onChange={(event) => set(key)(event.target.value)} style={{ width: "100%", marginTop: 5, border: `1.5px solid ${C.line}`, background: C.paper, padding: "10px 12px", color: C.ink }}/></label>)}
          <label style={{ display: "block", marginTop: 14 }}><span style={{ display: "block", color: C.sub, fontFamily: F.mono, fontSize: 12, textTransform: "uppercase" }}>Sourcing notes</span><textarea value={profile.notes} onChange={(event) => set("notes")(event.target.value)} rows={3} style={{ width: "100%", marginTop: 5, border: `1.5px solid ${C.line}`, background: C.paper, padding: "10px 12px", color: C.ink, font: "inherit", resize: "vertical" }}/></label>
          <button disabled={!canSubmit} onClick={() => onSubmit({ requestType, profile })} style={{ width: "100%", minHeight: 52, marginTop: 20, border: 0, borderRadius: 999, background: canSubmit ? C.brass : "#DDD2C1", color: "#241405", fontWeight: 750, cursor: canSubmit ? "pointer" : "not-allowed" }}>Create demo enquiry reference</button>
          <small style={{ display: "block", marginTop: 10, color: C.sub, fontSize: 12, lineHeight: 1.5 }}>Prototype only: no supplier is contacted and no stock, price, freight or payment term is promised.</small>
        </aside>
      </div>
    </div>
  );
}

function TradeInquiryDone({ reference, onTrade }) {
  return <div className="oex-fade oex-inquiry-panel" style={{ maxWidth: 720, margin: "0 auto", padding: 54, textAlign: "center" }}><div style={{ width: 64, height: 64, margin: "0 auto", display: "grid", placeItems: "center", borderRadius: "50%", background: C.leafBg }}><Check size={28} color={C.leaf}/></div><div style={{ marginTop: 18, color: C.brassDeep, fontFamily: F.mono, fontSize: 13, letterSpacing: ".12em" }}>LOCAL DEMO REFERENCE · {reference}</div><h1 style={{ margin: "12px 0 8px", fontFamily: F.disp, fontSize: 42, fontWeight: 400 }}>Your sourcing brief is structured</h1><p style={{ margin: "0 auto", maxWidth: 540, color: C.sub, fontSize: 15, lineHeight: 1.65 }}>Nothing has been sent or reserved. In production, this workflow would route the brief for supplier verification, samples, documents, landed-cost calculation and a formal quote.</p><button onClick={onTrade} style={{ marginTop: 24, border: 0, borderRadius: 999, background: C.esp, color: C.cream, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>Return to Trade Desk</button></div>;
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

function CartView({ cart, setQty, removeItem, ship, setShip, totals, onCheckout, onShop }) {
  if (!cart.length) {
    return (
      <div className="oex-fade rounded-3xl p-10 text-center" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
        <div className="flex justify-center mb-3"><ShoppingCart size={34} color={C.sub} strokeWidth={1.4} /></div>
        <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Your cart is empty</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, marginTop: 6 }}>Browse the retail catalogue. Green-lot sourcing stays in its own enquiry workflow.</div>
        <button onClick={onShop} className="mt-5 rounded-xl px-5 py-2.5" style={{ background: C.esp, color: C.cream, fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Start shopping</button>
      </div>
    );
  }
  return (
    <div className="oex-fade md:flex gap-6 items-start">
      <div className="flex-1">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: `1px solid ${C.line}` }}>
          {cart.map((it, idx) => (
            <div key={it.key} className="oex-cart-item p-4" style={{ borderTop: idx ? `1px solid ${C.line}` : "none" }}>
              <div className="rounded-xl overflow-hidden" style={{ width: 54, height: 54, background: C.cream, flexShrink: 0, position: "relative" }}>
                <Image src={PRODUCT_VISUALS[it.cat] || PRODUCT_VISUALS.beans} alt="" fill unoptimized sizes="54px" style={{ objectFit: "cover" }} />
              </div>
              <div className="oex-cart-copy flex-1" style={{ minWidth: 0 }}>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.ink }}>{it.name}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>{it.sub} · {fmt(it.unit)} ea</div>
              </div>
              <Stepper qty={it.qty} setQty={(q) => setQty(it.key, q)} />
              <div className="oex-cart-price" style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 14, minWidth: 76, textAlign: "right", color: C.ink }}>{fmt(r2(it.unit * it.qty))}</div>
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
        <button onClick={onCheckout} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 mt-4" style={{ background: C.brass, color: "#241405", fontFamily: F.body, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Review demo checkout · {fmt(totals.total)} <ArrowRight size={15} />
        </button>
        <div className="mt-2 text-center" style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}>No provider is connected and nothing will be charged.</div>
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
        <Input label="Street address" value={contact.addr} onChange={set("addr")} placeholder="Street address" />
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
          <div className="mt-3" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>The wallet sheet is simulated in this prototype — continue only to preview the review state.</div>
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
            <span style={{ fontWeight: 700 }}>Deldiet flagship coffeehouse · concept pickup path</span>
            <div style={{ fontFamily: F.mono, fontSize: 13, color: C.sub, marginTop: 3 }}>Location, service hours and readiness promise must be connected before launch.</div>
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
      <div style={{ fontFamily: F.disp, fontSize: 22, color: C.ink }}>Review checkout prototype</div>
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
            <Check size={16} /> Complete demo · {fmt(totals.total)}
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
      <div style={{ fontFamily: F.disp, fontSize: 26, marginTop: 14, color: C.ink }}>Checkout prototype complete</div>
      <div className="mt-1" style={{ fontFamily: F.mono, fontSize: 14, color: C.brassDeep, fontWeight: 600, letterSpacing: ".06em" }}>{order.num}</div>
      <div className="mt-3" style={{ fontFamily: F.body, fontSize: 14, color: C.sub }}>
        Illustrative total {fmt(order.total)} · no confirmation was sent and nothing was charged.
      </div>
      <div className="mt-2" style={{ fontFamily: F.mono, fontSize: 13, color: C.sub }}>Local demo reference only. Inventory, fulfilment and payment require live integrations.</div>
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
  const [tickerPaused, setTickerPaused] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [tradeItems, setTradeItems] = useState([]);
  const [inquiryReference, setInquiryReference] = useState("");
  const [market] = useState(() => MARKET0.map((m) => ({ ...m, base: m.price, delta: 0 })));
  const [lots] = useState(() => LOTS0.map((l) => {
    const hist = Array.from({ length: 12 }, (_, i) => r2(l.base * (1 + Math.sin(i * 1.7) * 0.012 + (i - 6) * 0.0015)));
    return { ...l, price: l.base, delta: 0, hist };
  }));

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setTickerPaused(reduceMotion.matches);
    reduceMotion.addEventListener?.("change", syncMotion);
    let savedCart = null;
    try {
      const saved = window.localStorage.getItem("deldiet-origin-exchange-retail-cart");
      if (saved) savedCart = JSON.parse(saved);
    } catch { /* ignore malformed local catalogue data */ }
    const frame = window.requestAnimationFrame(() => {
      syncMotion();
      if (savedCart) setCart(savedCart);
      setCartReady(true);
    });
    return () => { window.cancelAnimationFrame(frame); reduceMotion.removeEventListener?.("change", syncMotion); };
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try { window.localStorage.setItem("deldiet-origin-exchange-retail-cart", JSON.stringify(cart)); } catch { /* local persistence is optional */ }
  }, [cart, cartReady]);

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
    else xs = [...xs].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || a.name.localeCompare(b.name));
    return xs;
  }, [cat, query, f]);

  const count = cart.reduce((s, it) => s + it.qty, 0);
  const tradeCount = tradeItems.reduce((sum, item) => sum + item.qty, 0);

  const totals = useMemo(() => {
    const sub = r2(cart.reduce((s, it) => s + it.unit * it.qty, 0));
    let shipCost = 0, shipLabel = "Free";
    if (ship === "standard") { shipCost = sub >= 75 || sub === 0 ? 0 : 9.95; shipLabel = shipCost === 0 ? "Free" : fmt(9.95); }
    if (ship === "express") { shipCost = 19.95; shipLabel = fmt(19.95); }
    if (ship === "pickup") { shipLabel = "Free"; }
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
    setTradeItems((c) => {
      const ex = c.find((it) => it.key === key);
      if (ex) return c.map((it) => (it.key === key ? { ...it, qty: it.qty + bags } : it));
      return [...c, { key, id: lot.id, name: `${lot.flag} ${lot.origin} ${lot.grade} · ${lot.no}`, sub: `60 kg jute · sample price field ${lot.price.toFixed(2)} C$/kg · verification pending`, qty: bags }];
    });
  };
  const setQty = (key, q) => setCart((c) => (q <= 0 ? c.filter((it) => it.key !== key) : c.map((it) => (it.key === key ? { ...it, qty: Math.min(999, q) } : it))));
  const removeItem = (key) => setCart((c) => c.filter((it) => it.key !== key));
  const setTradeQty = (key, q) => setTradeItems((items) => (q <= 0 ? items.filter((it) => it.key !== key) : items.map((it) => (it.key === key ? { ...it, qty: Math.min(999, q) } : it))));
  const removeTradeItem = (key) => setTradeItems((items) => items.filter((it) => it.key !== key));
  const goCheckout = () => {
    if (!cart.length) return;
    setStep("contact"); goView("checkout");
  };
  const placeOrder = () => {
    const num = `OEX-DEMO-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    setOrder({ num, total: totals.total, email: contact.email, pm, ship });
    setCart([]); setPm(null); setPf({ num: "", name: "", exp: "", cvc: "", giftcode: "", interacEmail: "" }); goView("done");
  };
  const submitTradeInquiry = () => {
    setInquiryReference(`SOURCE-DEMO-${Date.now().toString(36).slice(-6).toUpperCase()}`);
    setTradeItems([]);
    goView("inquiry-done");
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
              <span className="hidden sm:block" style={{ fontFamily: F.mono, fontSize: 12, color: "#C8B69B", letterSpacing: ".18em", marginTop: 3 }}>DISCOVER SENSORY · SOURCE WITH EVIDENCE</span>
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
          <button onClick={() => goView("inquiry")} className="relative rounded-full p-2.5" style={{ background: "#2C1D12", border: "1.5px solid #3A2818", cursor: "pointer", flexShrink: 0 }} aria-label="Open sourcing enquiry">
            <BadgeCheck size={17} color={C.brass} />
            {tradeCount > 0 && <span className="absolute flex items-center justify-center rounded-full" style={{ top: -4, right: -4, minWidth: 18, height: 18, background: "#D9FF66", color: "#241405", fontFamily: F.mono, fontSize: 12, fontWeight: 700, padding: "0 4px" }}>{tradeCount}</span>}
          </button>
          <button onClick={() => goView("cart")} className="relative rounded-full p-2.5" style={{ background: "#2C1D12", border: "1.5px solid #3A2818", cursor: "pointer", flexShrink: 0 }} aria-label="Open cart">
            <ShoppingCart size={17} color={C.cream} />
            {count > 0 && (
              <span className="absolute flex items-center justify-center rounded-full" style={{ top: -4, right: -4, minWidth: 18, height: 18, background: C.brass, color: "#241405", fontFamily: F.mono, fontSize: 12, fontWeight: 700, padding: "0 4px" }}>{count}</span>
            )}
          </button>
        </div>
      </header>
      <div className="oex-truth-banner" role="status"><BadgeCheck size={16} style={{ flexShrink: 0, marginTop: 2 }}/><span><strong>Interactive concept catalogue.</strong> Products, lots, prices, reviews, certifications, availability and logistics are illustrative unless a field explicitly shows a verified source and date.</span></div>
      <Ticker market={market} paused={tickerPaused} onToggle={() => setTickerPaused((paused) => !paused)} />
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
            <section className="oex-exchange-hero">
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.brass, letterSpacing: ".18em" }}>SENSORY ATLAS × PRIVATE TRADE FLOOR</div>
                <h1>Follow the bean. Choose the path.</h1>
                <p>Explore a warm, sensory retail catalogue—or shift into a disciplined sourcing workspace where every lot, document and cost stays pending until evidence is attached.</p>
                <div className="oex-mode-switch" aria-label="Choose marketplace mode">
                  <button onClick={() => goBrowse("beans")}><b>Shop roasted coffee →</b><small>Find by origin, roast, notes, format and brew method</small></button>
                  <button onClick={() => goView("trade")}><b>Source green lots →</b><small>Compare samples, request documents and build an enquiry</small></button>
                </div>
              </div>
              <aside className="oex-verification-ledger">
                <span>Exchange status</span><h2>Evidence before claims.</h2>
                <div><b>Catalogue records</b><small>Illustrative demo</small></div>
                <div><b>Lot documents</b><small>Pending / not supplied</small></div>
                <div><b>Market data</b><small>Static sample · no feed</small></div>
                <div><b>Display currency</b><small>CAD · indicative only</small></div>
              </aside>
            </section>
            <div className="oex-status-grid">
              {[[Coffee, "Retail catalogue", "interactive concept inventory"], [TrendingUp, "Trade workflow", "separate sample / quote enquiry"], [BadgeCheck, "Verification", "field-level status before claims"], [Truck, "Fulfilment", "provider and location pending"]].map(([Icon, t, s]) => <article key={t}><Icon size={18} color={C.brassDeep}/><b>{t}</b><span>{s}</span></article>)}
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
            <div className="oex-product-grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS.filter((product) => product.badge).slice(0, 4).map((p) => <ProductCard key={p.id} p={p} onOpen={openDetail} onQuickAdd={quickAdd} />)}
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
              <div className="oex-product-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {view === "trade" && <TradeDesk lots={lots} onAddLot={addLot} inquiryCount={tradeCount} onOpenInquiry={() => goView("inquiry")} />}

        {view === "inquiry" && <TradeInquiryView items={tradeItems} setQty={setTradeQty} removeItem={removeTradeItem} onBack={() => goView("trade")} onSubmit={submitTradeInquiry} />}

        {view === "inquiry-done" && inquiryReference && <TradeInquiryDone reference={inquiryReference} onTrade={() => goView("trade")} />}

        {view === "cart" && (
          <CartView cart={cart} setQty={setQty} removeItem={removeItem} ship={ship} setShip={setShip} totals={totals} onCheckout={goCheckout} onShop={() => goBrowse("all")} />
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
          DELDIET ORIGIN EXCHANGE — interactive prototype · retail checkout and trade sourcing are separate · prices, reviews, claims, indices, lots and fulfilment are illustrative · HST display is an estimate
        </div>
      </footer>
    </div>
  );
}
