import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, ChevronDown, Plus, Search, ShoppingBag, X } from "lucide-react";

export type CafeItem = {
  id: string;
  name: string;
  detail: string;
  category: string;
  price: number;
  tag?: string;
};

type MenuVisual = { src: string; width: number; height: number };

type CoffeehouseProps = {
  menu: CafeItem[];
  categories: string[];
  serviceMode: string;
  orderCount: number;
  visualFor: (item: CafeItem) => MenuVisual;
  onServiceChange: (value: string) => void;
  onAdd: (item: CafeItem) => void;
  onOpenBag: () => void;
  onPlanVisit: () => void;
};

const specials = [
  { id: "harbour-mocha", label: "Hot", tone: "citrus" },
  { id: "orange-blossom-cold", label: "Iced", tone: "sky" },
  { id: "morning-bun", label: "Bakery", tone: "apricot" },
];

const serviceModes = [
  { value: "Dine in", label: "Dine in" },
  { value: "Pickup now", label: "Counter pickup" },
  { value: "Schedule", label: "Scheduled pickup" },
  { value: "Table QR", label: "Tableside" },
];

export default function Coffeehouse({
  menu, categories, visualFor, serviceMode, orderCount, onServiceChange, onAdd, onOpenBag, onPlanVisit,
}: CoffeehouseProps) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [special, setSpecial] = useState(specials[0]);
  const searchTerm = query.trim().toLowerCase();
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    return matchesCategory && [item.name, item.detail, item.category, item.tag].join(" ").toLowerCase().includes(searchTerm);
  });
  const menuGroups = categories.filter((name) => name !== "All").map((name) => ({
    name, items: filteredMenu.filter((item) => item.category === name),
  })).filter((group) => group.items.length > 0);
  const featured = menu.find((item) => item.id === special.id);
  const visual = featured && visualFor(featured);

  return (
    <div className="ch-room" id="coffeehouse">
      <section className="ch-cover" aria-labelledby="ch-title">
        <div className="ch-cover-copy">
          <p className="ch-label"><span className="ch-bean" aria-hidden="true"/> Deldiet Coffeehouse</p>
          <h1 id="ch-title">Pull up<br/><em>a chair.</em></h1>
          <p className="ch-deck">Espresso at the counter, a flight to share, or something warm from the bakery.</p>
          <div className="ch-cover-actions">
            <a className="ch-action ch-action-dark" href="#cafe-menu">Explore the menu <ArrowDown size={18}/></a>
            <a className="ch-underlink" href="#plan-your-visit">Plan a visit <ArrowRight size={17}/></a>
          </div>
        </div>
        <figure className="ch-cover-photo">
          <Image src="/editorial/coffeehouse-interior.webp" width={1672} height={941} priority unoptimized alt="Coffeehouse concept with a wood-lined espresso bar and lounge seating beside the harbour."/>
          <figcaption>Coffeehouse concept <span aria-hidden="true">/</span> St. John’s, NL</figcaption>
        </figure>
      </section>

      <section className="ch-menu" id="cafe-menu" aria-labelledby="ch-menu-title">
        <header className="ch-menu-head">
          <div>
            <p className="ch-label">Coffeehouse menu preview</p>
            <h2 id="ch-menu-title">At the <em>counter.</em></h2>
          </div>
          <p>Put together a café order for the team to review. Prices are estimates in Canadian dollars.</p>
        </header>

        <div className="ch-menu-layout">
          {featured && visual && <aside className="ch-feature" data-tone={special.tone} aria-label="Counter favourites">
            <div className="ch-feature-top">
              <h3>Counter favourites</h3>
              <div className="ch-specials" role="group" aria-label="Choose a counter favourite">
                {specials.map((option) => <button type="button" key={option.id} aria-pressed={option.id === special.id} onClick={() => setSpecial(option)}>{option.label}</button>)}
              </div>
            </div>
            <div className="ch-feature-art" aria-hidden="true">
              <div className="ch-saucer"/>
              <Image key={visual.src} src={visual.src} alt="" width={visual.width} height={visual.height} unoptimized/>
            </div>
            <div className="ch-feature-info" aria-live="polite">
              <h4>{featured.name}</h4>
              <p>{featured.detail}</p>
              <button type="button" className="ch-action ch-action-dark" aria-label={`Add featured ${featured.name} to coffeehouse order`} onClick={() => onAdd(featured)}>
                Add to order · ${featured.price.toFixed(2)} <Plus size={18}/>
              </button>
            </div>
          </aside>}

          <div className="ch-counter">
            <div className="ch-controls">
              <div className="ch-search">
                <Search size={19} aria-hidden="true"/>
                <input type="search" aria-label="Search coffeehouse menu" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the menu"/>
                {query && <button className="ch-clear" type="button" onClick={() => setQuery("")} aria-label="Clear coffeehouse search"><X size={17}/></button>}
              </div>
              <label className="ch-service"><span>Service preference</span>
                <select value={serviceMode} onChange={(event) => onServiceChange(event.target.value)}>
                  {serviceModes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
                </select>
              </label>
            </div>
            <div className="ch-filters" role="group" aria-label="Filter coffeehouse menu">
              {categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
            </div>
            <div className="ch-menu-status">
              <span role="status">{filteredMenu.length} menu {filteredMenu.length === 1 ? "item" : "items"}</span>
              <button type="button" onClick={onOpenBag}><ShoppingBag size={17}/> View bag{orderCount > 0 && <span> ({orderCount})</span>}</button>
            </div>

            {menuGroups.length === 0
              ? <div className="ch-empty"><h3>No matching items.</h3><p>Try a different search or browse the whole menu.</p><button type="button" className="ch-underlink" onClick={() => { setQuery(""); setCategory("All"); }}>Reset filters <ArrowRight size={17}/></button></div>
              : menuGroups.map((group, index) => <details className="ch-menu-group" key={`${group.name}-${category}-${Boolean(searchTerm)}`} open={Boolean(searchTerm) || category !== "All" || index === 0}>
                <summary><h3>{group.name}</h3><span>{group.items.length}</span><ChevronDown size={21}/></summary>
                <ul>
                  {group.items.map((item) => <li key={item.id}>
                    <div><h4>{item.name}</h4><p>{item.detail}</p></div>
                    <span className="ch-price">${item.price.toFixed(2)}</span>
                    <button type="button" className="ch-add" aria-label={`Add ${item.name} to coffeehouse order`} onClick={() => onAdd(item)}><Plus size={18}/></button>
                  </li>)}
                </ul>
              </details>)}
            <p className="ch-menu-note">Whole, oat, almond and coconut milk options. Ask the team about ingredients and allergens before ordering.</p>
            <a href="/build-a-cup" className="ch-underlink">Build a custom cup <ArrowRight size={17}/></a>
          </div>
        </div>
      </section>

      <section className="ch-visit" id="plan-your-visit" aria-labelledby="ch-visit-title">
        <div><p className="ch-label"><span className="ch-bean" aria-hidden="true"/> Visit the coffeehouse</p><h2 id="ch-visit-title">Meet in<br/><em>St. John’s.</em></h2></div>
        <div className="ch-visit-copy">
          <p>Register your interest in a table or guided tasting at our planned Newfoundland coffeehouse. The address, opening hours and accessibility details will follow once confirmed.</p>
          <button type="button" className="ch-action ch-action-dark" onClick={onPlanVisit}>Register visit interest <ArrowRight size={18}/></button>
          <div className="ch-visit-links"><a href="/events">Tastings and events <ArrowRight size={16}/></a><a href="/origin-bar">Origin Bar <ArrowRight size={16}/></a></div>
        </div>
      </section>
    </div>
  );
}
