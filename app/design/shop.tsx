import Image from "next/image";
import { ArrowDown, ArrowRight, Check, Plus, Search, X } from "lucide-react";
import { useId } from "react";

type SupplyItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  price: number;
  variants: string[];
};

type ShopProps<T extends SupplyItem> = {
  products: T[];
  visibleProducts: T[];
  categories: string[];
  category: string;
  query: string;
  photos: Record<string, string>;
  onCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onOpen: (item: T) => void;
  onQuickAdd: (item: T) => void;
};

const fieldObjects = [
  { id: "heavy-hoodie", x: "26%", y: "44%" },
  { id: "origin-tee", x: "66%", y: "29%" },
  { id: "five-panel", x: "49%", y: "80%" },
  { id: "canvas-tote", x: "81%", y: "69%" },
];

const passportLinks = [
  { title: "Coffee on repeat", href: "/passport?tab=rhythm", copy: "Build a replenishment request around your brewer and routine." },
  { title: "Gifts for coffee people", href: "/passport?tab=gifts", copy: "Choose coffees and objects for a gift box." },
  { title: "Coffee for teams", href: "/passport?tab=teams", copy: "Plan coffee for a workplace, an event or a hospitality team." },
];

export function ShopSpread<T extends SupplyItem>(props: ShopProps<T>) {
  const { products, visibleProducts, categories, category, query, photos, onCategory, onSearch, onOpen, onQuickAdd } = props;

  function showCategory(value: string) {
    onSearch("");
    onCategory(value);
  }

  return (
    <section className="supply-store" id="merch" aria-labelledby="supply-title">
      <div className="supply-hero">
        <div className="supply-hero-copy">
          <p className="supply-label">Deldiet Supply</p>
          <h1 id="supply-title">Coffee<br /><em>&amp; objects.</em></h1>
          <p className="supply-deck">From a bag of Guji Reserve to the mug you reach for every morning. Coffee, tools and fieldwear from Deldiet.</p>
          <a className="supply-cta" href="#shop-catalogue" onClick={() => showCategory("All")}>Shop the catalogue <ArrowDown size={18} aria-hidden="true" /></a>
        </div>
        <figure className="supply-look">
          <div className="supply-look-image">
            <Image
              src="/editorial/shop-fieldwear.webp" alt="Black hoodie, cream tee, olive cap and canvas tote laid out together."
              width={1448} height={1086} sizes="(max-width: 760px) 100vw, 58vw" unoptimized priority
            />
            {fieldObjects.map(({ id, x, y }) => {
              const item = products.find((product) => product.id === id);
              if (!item) return null;
              return (
                <button className="supply-pin" key={id} type="button" aria-label={`View ${item.name}`} style={{ left: x, top: y }} onClick={() => onOpen(item)}>
                  <Plus size={19} aria-hidden="true" /><span aria-hidden="true">{item.name}</span>
                </button>
              );
            })}
          </div>
          <figcaption>
            <span>The field collection</span>
            <a href="#shop-catalogue" onClick={() => showCategory("Apparel")}>Explore apparel <ArrowRight size={16} aria-hidden="true" /></a>
          </figcaption>
        </figure>
      </div>

      <section className="supply-catalogue" id="shop-catalogue" aria-labelledby="supply-catalogue-title">
        <div className="supply-toolbar">
          <div><p className="supply-label">All merchandise</p><h2 id="supply-catalogue-title">The catalogue<span>.</span></h2></div>
          <div className="supply-search">
            <Search size={20} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => onSearch(event.target.value)} placeholder="Search the catalogue" aria-label="Search Deldiet shop" />
            {query && <button type="button" aria-label="Clear search" onClick={() => onSearch("")}><X size={17} aria-hidden="true" /></button>}
          </div>
        </div>
        <div className="supply-controls">
          <div className="supply-filters" role="group" aria-label="Filter merchandise by category">
            {categories.map((value) => <button type="button" key={value} aria-pressed={category === value} onClick={() => onCategory(value)}>{value === "All" ? "All objects" : value}</button>)}
          </div>
          <label className="supply-category-select">Category
            <select value={category} onChange={(event) => onCategory(event.target.value)}>
              {categories.map((value) => <option key={value} value={value}>{value === "All" ? "All objects" : value}</option>)}
            </select>
          </label>
          <p className="supply-count" aria-live="polite" aria-atomic="true">{visibleProducts.length} {visibleProducts.length === 1 ? "item" : "items"}</p>
        </div>
        {visibleProducts.length === 0 ? (
          <div className="supply-empty">
            <h3>No matches.</h3><p>Try another search or browse all categories.</p>
            <button className="supply-cta" type="button" onClick={() => showCategory("All")}>Show all objects <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        ) : (
          <div className="supply-grid">
            {visibleProducts.map((item) => (
              <article className="supply-item" key={item.id}>
                <button type="button" className="supply-item-image" aria-label={`View ${item.name}`} onClick={() => onOpen(item)}>
                  <Image src={photos[item.id]} alt="" width={627} height={627} unoptimized sizes="(max-width: 650px) 50vw, (max-width: 1000px) 33vw, 25vw" />
                </button>
                <div className="supply-item-meta"><span>{item.category}</span><span>{item.id === "gift-card" ? "From " : ""}${item.price}</span></div>
                <h3><button type="button" onClick={() => onOpen(item)}>{item.name}</button></h3>
                <p>{item.description}</p>
                <div className="supply-item-actions">
                  <button type="button" aria-label={`Choose options for ${item.name}`} onClick={() => onOpen(item)}>View options <ArrowRight size={15} aria-hidden="true" /></button>
                  <button type="button" className="supply-quick" title={`Add ${item.variants[0]} to bag`} aria-label={`Quick add ${item.name}, ${item.variants[0]}`} onClick={() => onQuickAdd(item)}><Plus size={18} aria-hidden="true" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <nav className="supply-services" aria-label="Deldiet shopping services">
        {passportLinks.map((link) => <a href={link.href} key={link.href}><h2>{link.title}</h2><p>{link.copy}</p><ArrowRight size={22} aria-hidden="true" /></a>)}
      </nav>
    </section>
  );
}

export function ShopProductSheet({ product, image, variant, onVariant, onAdd, onSave, onClose }: {
  product: SupplyItem;
  image: string;
  variant: string;
  onVariant: (variant: string) => void;
  onAdd: (price: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const groupName = useId();
  const price = product.id === "gift-card" && product.variants.includes(variant) ? Number(variant.slice(1)) : product.price;
  return (
    <div className="supply-sheet">
      <button className="supply-sheet-close" type="button" aria-label="Close product details" onClick={onClose}><X size={21} aria-hidden="true" /></button>
      <div className="supply-sheet-visual"><Image src={image} alt={product.name} width={627} height={627} unoptimized /></div>
      <div className="supply-sheet-copy">
        <div className="supply-sheet-meta"><span>{product.category}</span><span>{product.code}</span></div>
        <h2 id="product-title">{product.name}</h2>
        <p className="supply-sheet-description">{product.description}</p>
        <p className="supply-sheet-price" aria-live="polite">${price} <span>CAD</span></p>
        <fieldset className="supply-variants"><legend>Choose an option</legend>
          {product.variants.map((value) => (
            <label key={value}>
              <input type="radio" name={groupName} checked={variant === value} onChange={() => onVariant(value)} />
              <span>{value}{variant === value && <Check size={16} aria-hidden="true" />}</span>
            </label>
          ))}
        </fieldset>
        <button className="supply-cta" type="button" onClick={() => onAdd(price)}>Add to shop bag · ${price}<Plus size={18} aria-hidden="true" /></button>
        <button className="supply-save" type="button" onClick={onSave}>Save to my Passport</button>
        <p className="supply-availability">{product.id === "clarity-sticks" ? "Clarity is in development. Submit an interest request through your bag." : "Deldiet confirms availability, final price and fulfilment when reviewing your request."}</p>
      </div>
    </div>
  );
}
