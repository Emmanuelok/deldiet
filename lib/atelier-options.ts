// Options for exploring a recipe. Current prices and orderability come from Stripe.

export const ROASTS = [
  { id: "light", name: "Light", color: "#C98B43", liquid: "#A4682F", desc: "Floral, tea-like, vivid acidity" },
  { id: "medium", name: "Medium", color: "#9C5F2E", liquid: "#7A4521", desc: "Caramel, balanced, crowd-pleasing" },
  { id: "meddark", name: "Medium-Dark", color: "#6F3E1E", liquid: "#52301A", desc: "Bittersweet cocoa, syrupy body" },
  { id: "dark", name: "Dark", color: "#432717", liquid: "#332012", desc: "Smoky, bold, low acidity" },
];

export const BEAN_NAMES = { A: "Arabica", R: "Robusta", L: "Liberica", E: "Excelsa" };

export const ORIGINS = {
  "Africa": [
    { n: "Ethiopia", f: "🇪🇹", b: ["A"], t: "jasmine · blueberry · bergamot", m: "1,900–2,200 masl", x: "Birthplace of coffee" },
    { n: "Kenya", f: "🇰🇪", b: ["A"], t: "blackcurrant · winey · bright", m: "1,700–2,100 masl" },
    { n: "Rwanda", f: "🇷🇼", b: ["A"], t: "orange blossom · honey · silky", m: "1,700–2,000 masl" },
    { n: "Burundi", f: "🇧🇮", b: ["A"], t: "red berry · sweet · clean", m: "1,700–2,000 masl" },
    { n: "Tanzania", f: "🇹🇿", b: ["A", "R"], t: "citrus snap · peaberry · lively", m: "1,400–1,800 masl" },
    { n: "Uganda", f: "🇺🇬", b: ["R", "A"], t: "deep cocoa · earthy · full", m: "1,200–1,500 masl" },
    { n: "DR Congo", f: "🇨🇩", b: ["A", "R"], t: "wild berry · dark chocolate", m: "1,400–1,800 masl" },
    { n: "Cameroon", f: "🇨🇲", b: ["R", "A"], t: "woody · molasses · round", m: "1,000–1,400 masl" },
    { n: "Côte d'Ivoire", f: "🇨🇮", b: ["R"], t: "bold · rugged · roasty", m: "200–500 masl" },
    { n: "Malawi", f: "🇲🇼", b: ["A"], t: "delicate · sweet citrus", m: "1,200–1,700 masl" },
    { n: "Zambia", f: "🇿🇲", b: ["A"], t: "caramel · bright · tidy", m: "1,300–1,700 masl" },
  ],
  "South America": [
    { n: "Colombia", f: "🇨🇴", b: ["A"], t: "caramel · red apple · balanced", m: "1,200–2,000 masl" },
    { n: "Brazil", f: "🇧🇷", b: ["A", "R"], t: "chocolate · hazelnut · smooth", m: "800–1,300 masl", x: "World's largest grower" },
    { n: "Peru", f: "🇵🇪", b: ["A"], t: "soft cocoa · mellow · gentle", m: "1,200–1,900 masl", x: "Organic pioneer" },
    { n: "Ecuador", f: "🇪🇨", b: ["A"], t: "floral · crisp · fine", m: "1,200–1,800 masl" },
    { n: "Bolivia", f: "🇧🇴", b: ["A"], t: "clean · sweet grape · airy", m: "1,500–2,300 masl" },
    { n: "Venezuela", f: "🇻🇪", b: ["A"], t: "mild · rich · classic", m: "1,000–1,500 masl" },
  ],
  "Central America & Caribbean": [
    { n: "Costa Rica", f: "🇨🇷", b: ["A"], t: "honey-process · brown sugar", m: "1,200–1,700 masl" },
    { n: "Guatemala", f: "🇬🇹", b: ["A"], t: "cocoa · spice · soft smoke", m: "1,300–2,000 masl" },
    { n: "Honduras", f: "🇭🇳", b: ["A"], t: "toffee · round · easy", m: "1,100–1,600 masl" },
    { n: "El Salvador", f: "🇸🇻", b: ["A"], t: "creamy · plum · pacamara", m: "1,100–1,500 masl" },
    { n: "Nicaragua", f: "🇳🇮", b: ["A"], t: "nougat · citrus · supple", m: "1,100–1,500 masl" },
    { n: "Panama", f: "🇵🇦", b: ["A"], t: "Geisha — jasmine · papaya", m: "1,400–1,800 masl", x: "Home of Geisha" },
    { n: "Mexico", f: "🇲🇽", b: ["A"], t: "almond · light cocoa · soft", m: "900–1,400 masl" },
    { n: "Jamaica", f: "🇯🇲", b: ["A"], t: "Blue Mountain — silk · mild", m: "900–1,500 masl", x: "Blue Mountain estate" },
    { n: "Dominican Republic", f: "🇩🇴", b: ["A"], t: "soft · sweet tobacco leaf", m: "600–1,200 masl" },
    { n: "Cuba", f: "🇨🇺", b: ["A"], t: "earthy · sweet pipe smoke", m: "350–750 masl" },
    { n: "Haiti", f: "🇭🇹", b: ["A"], t: "blue-lineage · mellow", m: "300–1,200 masl" },
  ],
  "Asia–Pacific": [
    { n: "Indonesia", f: "🇮🇩", b: ["A", "R"], t: "Sumatra — cedar · earth · syrup", m: "900–1,500 masl" },
    { n: "Vietnam", f: "🇻🇳", b: ["R", "A", "E"], t: "bold cocoa · robusta power", m: "500–1,500 masl", x: "Robusta heartland" },
    { n: "India", f: "🇮🇳", b: ["A", "R"], t: "monsooned malabar · spice", m: "700–1,500 masl" },
    { n: "Papua New Guinea", f: "🇵🇬", b: ["A"], t: "mango · bright sugar", m: "1,300–1,900 masl" },
    { n: "China · Yunnan", f: "🇨🇳", b: ["A"], t: "soft caramel · plum", m: "900–1,700 masl" },
    { n: "Thailand", f: "🇹🇭", b: ["A", "R"], t: "mountain florals · clean", m: "800–1,500 masl" },
    { n: "Philippines", f: "🇵🇭", b: ["L", "E", "R"], t: "Barako — smoky jackfruit", m: "300–1,200 masl", x: "Liberica heartland" },
    { n: "Laos", f: "🇱🇦", b: ["A", "R"], t: "dark honey · herbs", m: "800–1,300 masl" },
    { n: "Myanmar", f: "🇲🇲", b: ["A"], t: "grape · brown sugar", m: "1,000–1,600 masl" },
    { n: "Timor-Leste", f: "🇹🇱", b: ["A"], t: "hybrid heritage · cocoa", m: "800–1,600 masl" },
    { n: "Hawai'i · USA", f: "🇺🇸", b: ["A"], t: "Kona — butter · gentle", m: "150–900 masl", x: "Kona belt" },
    { n: "Australia", f: "🇦🇺", b: ["A"], t: "soft nut · rare lots", m: "200–600 masl" },
  ],
  "Middle East": [
    { n: "Yemen", f: "🇾🇪", b: ["A"], t: "the original Mocha — wine · dried fruit", m: "1,500–2,400 masl", x: "Where coffee was first traded" },
  ],
};

export const CLASSICS = [
  { n: "Espresso", d: "A single, syrupy origin shot", fam: "espresso", sh: 1 },
  { n: "Doppio", d: "Double shot, twice the story", fam: "espresso", sh: 2 },
  { n: "Ristretto", d: "Short pull — sweet and dense", fam: "espresso", sh: 1 },
  { n: "Lungo", d: "Long pull — gentler, longer", fam: "espresso", sh: 1 },
  { n: "Americano", d: "Shots opened up with hot water", fam: "espresso", sh: 2 },
  { n: "Long Black", d: "Water first — the crema stays", fam: "espresso", sh: 2 },
  { n: "Latte", d: "Silky steamed milk, thin foam", fam: "espresso", sh: 2, milk: true },
  { n: "Cappuccino", d: "Equal thirds, deep dry foam", fam: "espresso", sh: 2, milk: true, foam: true },
  { n: "Flat White", d: "Velvet microfoam, strong heart", fam: "espresso", sh: 2, milk: true },
  { n: "Cortado", d: "Half espresso, half warm milk", fam: "espresso", sh: 2, milk: true },
  { n: "Macchiato", d: "Espresso marked with foam", fam: "espresso", sh: 2 },
  { n: "Caramel Macchiato", d: "Vanilla milk, marked + caramel net", fam: "espresso", sh: 2, milk: true, driz: "#B5722F" },
  { n: "Mocha", d: "Origin espresso meets real cacao", fam: "espresso", sh: 2, milk: true },
  { n: "White Mocha", d: "Sweet white-cacao comfort", fam: "espresso", sh: 2, milk: true },
  { n: "Café au Lait", d: "Brewed coffee + steamed milk", fam: "brewed", sh: 0, milk: true },
  { n: "Pour-Over / Drip", d: "Your origin, brewed clean", fam: "brewed", sh: 0 },
  { n: "Red Eye", d: "Drip with an espresso heartbeat", fam: "brewed", sh: 1 },
  { n: "Double-Double", d: "Brewed, two cream two sugar — a Canadian classic", fam: "brewed", sh: 0, milk: true },
  { n: "Cold Brew", d: "18-hour slow steep, no bitterness", fam: "cold", sh: 0 },
  { n: "Nitro Cold Brew", d: "Cascading, naturally creamy", fam: "cold", sh: 0 },
  { n: "Iced Latte", d: "Espresso over ice and cold milk", fam: "espresso", sh: 2, milk: true, iced: true },
  { n: "Frosted Blend", d: "Ice-blended, frappé-style", fam: "blended", sh: 1, milk: true },
  { n: "Affogato", d: "Espresso poured over vanilla gelato", fam: "espresso", sh: 1, foam: true },
  { n: "Espresso con Panna", d: "A shot under whipped cream", fam: "espresso", sh: 1, whip: true },
  { n: "Vienna", d: "Espresso, whipped cream, cocoa dust", fam: "espresso", sh: 2, whip: true },
  { n: "Turkish", d: "Fine-ground, unfiltered, ancient", fam: "brewed", sh: 0 },
];

export const SIGNATURES = [
  { n: "Golden Sunrise Latte", d: "Turmeric, raw honey, oat silk", fam: "espresso", sh: 2, milk: true, tag: ["turmeric", "honey"] },
  { n: "Lavender Cloud", d: "Lavender mist under vanilla cold foam", fam: "espresso", sh: 2, milk: true, foam: true, tag: ["lavender"] },
  { n: "Maple Woods Cortado", d: "Québec maple, a whisper of smoked salt", fam: "espresso", sh: 2, milk: true, tag: ["maple", "smoked salt"] },
  { n: "Sahara Gold", d: "Cardamom, date syrup, saffron dust", fam: "espresso", sh: 2, milk: true, tag: ["cardamom", "date"] },
  { n: "Rose Velvet Mocha", d: "Rose water folded into white cacao", fam: "espresso", sh: 2, milk: true, tag: ["rose", "white cacao"] },
  { n: "Midnight Cherry Mocha", d: "70% cacao with tart cherry", fam: "espresso", sh: 2, milk: true, tag: ["cherry", "dark cacao"] },
  { n: "Coconut Cascade", d: "Cold brew under a coconut-cream cloud", fam: "cold", sh: 0, foam: true, tag: ["coconut"] },
  { n: "Brown Sugar Shaken Oat", d: "Espresso shaken with brown sugar, oat", fam: "espresso", sh: 2, milk: true, iced: true, tag: ["brown sugar"] },
  { n: "Pistachio Silk", d: "Stone-ground pistachio, velvet foam", fam: "espresso", sh: 2, milk: true, tag: ["pistachio"] },
  { n: "Ube Dream", d: "Purple yam and coconut milk", fam: "espresso", sh: 2, milk: true, tag: ["ube", "coconut"] },
  { n: "Matcha Eclipse", d: "Ceremonial matcha meets espresso", fam: "espresso", sh: 1, milk: true, tag: ["matcha"] },
  { n: "Orange Blossom Tonic", d: "Espresso over botanical tonic, orange oil", fam: "espresso", sh: 1, iced: true, tag: ["orange", "botanical"] },
  { n: "Tiramisu Cloud", d: "Mascarpone foam, cocoa dust", fam: "espresso", sh: 2, milk: true, foam: true, tag: ["mascarpone"] },
  { n: "Azteca Chili Mocha", d: "Raw cacao, cinnamon, gentle chili warmth", fam: "espresso", sh: 2, milk: true, tag: ["cacao", "chili"] },
  { n: "Honey Fig Cappuccino", d: "Fig reduction and wildflower honey", fam: "espresso", sh: 2, milk: true, foam: true, tag: ["fig", "honey"] },
  { n: "Forest Mint Mocha", d: "Fresh mint leaf, dark cacao", fam: "espresso", sh: 2, milk: true, tag: ["mint", "dark cacao"] },
];

export const MILKS = [
  { n: "Organic whole" }, { n: "Organic 2%" }, { n: "Skim" },
  { n: "Lactose-free" }, { n: "A2 milk" }, { n: "Half & half" },
  { n: "Oat (barista)", v: true }, { n: "Almond", v: true }, { n: "Soy", v: true },
  { n: "Coconut", v: true }, { n: "Cashew", v: true }, { n: "Macadamia", v: true },
  { n: "Hemp", v: true }, { n: "Pea (barista)", v: true }, { n: "Rice", v: true },
  { n: "None — black", none: true },
];

export const EXTRACTIONS = {
  espresso: ["Espresso machine"],
  blended: ["Espresso machine"],
  brewed: ["Pour-over V60", "Chemex", "French press", "AeroPress", "Siphon", "Batch drip"],
  cold: ["18-hr slow steep", "Nitro-charged"],
};

export const CAFFEINE = ["Regular", "Half-caf", "Decaf · Swiss Water"];

export const BOOSTERS = [
  { n: "Collagen peptides", d: "unflavoured protein add-in" },
  { n: "Plant protein", d: "pea + pumpkin seed blend" },
  { n: "MCT oil", d: "coconut-derived creamer" },
  { n: "Grass-fed ghee", d: "buttery texture" },
  { n: "Lion's mane", d: "earthy mushroom extract" },
  { n: "Chaga", d: "roasted mushroom extract" },
  { n: "Reishi", d: "earthy mushroom extract" },
  { n: "Cordyceps", d: "mild mushroom extract" },
  { n: "Ashwagandha", d: "botanical extract" },
  { n: "Maca root", d: "malty root powder" },
  { n: "Panax ginseng", d: "botanical extract" },
  { n: "L-theanine", d: "tea-derived amino acid" },
  { n: "Raw cacao nibs", d: "cacao crunch" },
  { n: "Bee pollen", d: "floral granules · allergen" },
  { n: "Vitamin B12", d: "vitamin add-in" },
  { n: "Electrolyte minerals", d: "unflavoured mineral blend" },
];

export const SYRUPS = [
  "Vanilla bean", "Caramel", "Hazelnut", "Mocha sauce", "White chocolate",
  "Lavender", "Rose", "Brown-sugar cinnamon", "Maple", "Pumpkin spice",
  "Peppermint", "Toffee nut", "Honeycomb", "Coconut",
];

export const SWEETENERS = ["None", "Raw cane sugar", "Wildflower honey", "Maple syrup", "Agave", "Coconut sugar", "Date syrup", "Stevia leaf", "Monk fruit"];

export const TOPPINGS = [
  { n: "Whipped cream", whip: true },
  { n: "Vanilla cold foam", foam: true },
  { n: "Cinnamon dust" },
  { n: "Cocoa dust" },
  { n: "Nutmeg" },
  { n: "Caramel drizzle", driz: "#B5722F" },
  { n: "Dark-chocolate shavings", driz: "#3A2417" },
  { n: "Flaked sea salt" },
  { n: "Dried rose petals" },
  { n: "Orange zest" },
  { n: "Toasted coconut" },
];

export const SIZES = [
  { id: "seed", n: "Seed", oz: 8 },
  { id: "sprout", n: "Sprout", oz: 12 },
  { id: "bloom", n: "Bloom", oz: 16 },
  { id: "harvest", n: "Harvest", oz: 20 },
];

export const CUPS = [
  { n: "For here · ceramic" },
  { n: "To go · compostable" },
  { n: "Bring your own", eco: true },
];

export const FRESH = {
  origin: null, roast: "medium", drink: null, tab: "classics",
  milk: "Organic whole", milkTouched: false, extraShots: 0, temp: "Hot", extraction: "Espresso machine",
  caffeine: "Regular", boosters: [], syrups: [], sweetener: "None", sweetLevel: 2,
  toppings: [], size: "sprout", cup: "For here · ceramic", name: "", safetyAck: false,
};
