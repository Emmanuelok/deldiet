import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, MapPin, Plus, Search, ShoppingBag, X } from "lucide-react";

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

const counterPicks = [
  { id: "harbour-mocha", label: "Hot", photo: "/editorial/coffeehouse/harbour-mocha.webp" },
  { id: "orange-blossom-cold", label: "Iced", photo: "/editorial/coffeehouse/orange-cold-brew.webp" },
  { id: "morning-bun", label: "Bakery", photo: "/editorial/coffeehouse/cocoa-bun.webp" },
];

const serviceModes = [
  { value: "Dine in", label: "Dine in" },
  { value: "Pickup now", label: "Counter pickup" },
  { value: "Schedule", label: "Scheduled pickup" },
  { value: "Table QR", label: "Tableside" },
];

function ServicePicker({ serviceMode, onChange }: {serviceMode: string; onChange: (value: string) => void}) {
  return <label className="house-service">
    <span>Service preference</span>
    <span className="house-select"><select value={serviceMode} onChange={(event) => onChange(event.target.value)}>
      {serviceModes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
    </select><ChevronDown size={15} aria-hidden="true"/></span>
  </label>;
}

export default function Coffeehouse({
  menu, categories, serviceMode, orderCount, onServiceChange, onAdd, onOpenBag, onPlanVisit,
}: CoffeehouseProps) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState(counterPicks[0]);
  const [lastAdded, setLastAdded] = useState({ id: "", action: 0 });
  const searchTerm = query.trim().toLowerCase();
  const filtered = menu.filter((item) => (category === "All" || item.category === category) &&
    [item.name, item.detail, item.category, item.tag].join(" ").toLowerCase().includes(searchTerm));
  const menuGroups = categories.filter((name) => name !== "All").map((name) => ({
    name, items: filtered.filter((item) => item.category === name),
  })).filter((group) => group.items.length > 0);
  const special = menu.find((item) => item.id === pick.id);
  const price = (item: CafeItem) => `$${item.price.toFixed(2)}`;

  useEffect(() => {
    if (!lastAdded.id) return;
    const timer = window.setTimeout(() => setLastAdded({ id: "", action: 0 }), 1300);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);

  function add(item: CafeItem) {
    onAdd(item);
    setLastAdded((previous) => ({ id: item.id, action: previous.action + 1 }));
  }

  return <div className="house" id="coffeehouse">
    <section className="house-scene" aria-labelledby="house-title">
      <Image className="house-interior" src="/editorial/coffeehouse-interior.webp" alt="A concept view of the Deldiet coffeehouse, with harbour windows, walnut shelves and an espresso bar." width={1672} height={941} priority unoptimized/>
      <div className="house-scene-content">
        <div className="house-welcome">
          <p className="house-location"><MapPin size={16}/> St. John’s, Newfoundland</p>
          <h1 id="house-title">The Coffeehouse</h1>
          <p className="house-lede">A table by the harbour. Espresso from the bar.<br className="house-wide"/> Something warm from the bakery.</p>
          <div className="house-links">
            <a className="house-gold" href="#cafe-menu">Browse the menu <ArrowDown size={16}/></a>
            <a className="house-textlink" href="#plan-your-visit">Plan a visit <ArrowUpRight size={16}/></a>
          </div>
        </div>

        {special && <aside className="house-counter-window" aria-labelledby="counter-title">
          <div className="house-window-heading"><h2 id="counter-title">At the counter</h2><span>Menu preview</span></div>
          <div className="house-switch" role="group" aria-label="Choose a counter favourite">{counterPicks.map((item) =>
            <button type="button" key={item.id} aria-pressed={pick.id === item.id} onClick={() => setPick(item)}>{item.label}</button>)}
          </div>
          <div className="house-special" aria-live="polite">
            <Image key={special.id} src={pick.photo} alt="" width={144} height={144} unoptimized/>
            <div><h3>{special.name}</h3><p>{special.detail}</p><span>{price(special)} CAD</span></div>
          </div>
          <div className="house-window-actions">
            <ServicePicker serviceMode={serviceMode} onChange={onServiceChange}/>
            <button type="button" className="house-quick-add" aria-label={`Add featured ${special.name} to coffeehouse order`} onClick={() => add(special)}>
              {lastAdded.id === special.id ? <Check size={19}/> : <Plus size={19}/>} <span>{lastAdded.id === special.id ? "Added" : "Add"}</span>
            </button>
          </div>
        </aside>}
      </div>
    </section>

    <section className="house-menu" id="cafe-menu" aria-labelledby="cafe-menu-title">
      <header className="house-menu-heading">
        <div><p className="house-rubric">Coffeehouse menu preview</p><h2 id="cafe-menu-title">The café menu</h2></div>
        <p>Build an order for the team to review. Prices are estimates in Canadian dollars.</p>
      </header>
      <div className="house-catalogue">
        <aside className="house-index">
          <h3>On the menu</h3>
          <div className="house-index-list" role="group" aria-label="Filter coffeehouse menu">
            {categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>
              <span>{name === "All" ? "Full menu" : name}</span><span>{name === "All" ? menu.length : menu.filter((item) => item.category === name).length}</span>
            </button>)}
          </div>
          <label className="house-mobile-index"><span>Menu section</span><select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((name) => <option value={name} key={name}>{name === "All" ? "Full menu" : name}</option>)}
          </select></label>
          <div className="house-builder-link"><a className="house-textlink" href="/build-a-cup">Build a custom cup <ArrowUpRight size={16}/></a></div>
        </aside>
        <div className="house-menu-main">
          <div className="house-menu-tools">
            <div className="house-search"><Search size={18} aria-hidden="true"/><input type="search" aria-label="Search coffeehouse menu" value={query} placeholder="Find a drink or something to eat" onChange={(event) => setQuery(event.target.value)}/>
              {query && <button type="button" aria-label="Clear coffeehouse search" onClick={() => setQuery("")}><X size={16}/></button>}</div>
            <button className="house-bag" type="button" onClick={onOpenBag}><ShoppingBag size={18}/> View bag{orderCount > 0 && ` (${orderCount})`}</button>
          </div>
          <div className="house-menu-summary"><span role="status">{filtered.length} {filtered.length === 1 ? "item" : "items"}</span><ServicePicker serviceMode={serviceMode} onChange={onServiceChange}/></div>
          {menuGroups.length === 0 ? <div className="house-empty"><h3>No matching items.</h3><p>Try another search or browse the full menu.</p>
            <button className="house-textlink" type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Reset filters <ArrowRight size={16}/></button>
          </div> : menuGroups.map((group, index) => <details className="house-menu-group" key={`${group.name}-${category}-${Boolean(searchTerm)}`} open={Boolean(searchTerm) || category !== "All" || index === 0}>
            <summary><h3>{group.name}</h3><ChevronDown size={20}/></summary>
            <ul>{group.items.map((item) => <li key={item.id}>
              <div><h4>{item.name}</h4><p>{item.detail}</p></div><span>{price(item)}</span>
              <button type="button" className="house-item-add" aria-label={`Add ${item.name} to coffeehouse order`} data-added={lastAdded.id === item.id} onClick={() => add(item)}>
                {lastAdded.id === item.id ? <Check size={18}/> : <Plus size={18}/>}
              </button>
            </li>)}</ul>
          </details>)}
          <p className="house-smallprint">Whole, oat, almond and coconut milk options. Ask the team about ingredients and allergens before ordering.</p>
        </div>
      </div>
    </section>

    <section className="house-visit" id="plan-your-visit" aria-labelledby="house-visit-title">
      <div className="house-visit-photo"><Image src="/editorial/coffeehouse/coffee-and-bakery.webp" alt="A mocha, iced citrus coffee and cocoa morning bun on a sunlit café table." width={1536} height={1024} unoptimized/></div>
      <div className="house-visit-copy"><p className="house-rubric"><MapPin size={14}/> St. John’s, Newfoundland</p>
        <h2 id="house-visit-title">A seat at <em>our table.</em></h2><p>Register interest in a table or a guided tasting at our planned coffeehouse. The address, opening hours and access details will follow once confirmed.</p>
        <div className="house-links"><button type="button" className="house-gold" onClick={onPlanVisit}>Register visit interest <ArrowRight size={16}/></button><a className="house-textlink" href="/events">Tastings and events <ArrowUpRight size={15}/></a></div>
        <a className="house-origin-link" href="/origin-bar">Explore Origin Atelier <ArrowUpRight size={14}/></a>
      </div>
    </section>
  </div>;
}
