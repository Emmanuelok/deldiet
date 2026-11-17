import Image from "next/image";
import { ArrowDown, ArrowRight, Bookmark, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type FormatProduct = {
  id: string;
  name: string;
  detail: string;
  format: string;
  price: number;
};

const homeSetups = {
  "Whole bean grinder": {
    passport: "Whole bean grinder",
    formats: ["whole"],
    advice: "Grind only what you need for the next cup. Adjust the grind to suit your brewing method.",
  },
  "Nespresso Original": {
    passport: "Capsule machine",
    formats: ["nespresso"],
    advice: "These capsules fit Nespresso Original machines. Vertuo uses a different capsule.",
  },
  "Keurig brewer": {
    passport: "Single-serve brewer",
    formats: ["kcup"],
    advice: "Choose the K-Cup compatible format for your brewer. Each cup makes one serving.",
  },
  "Pour-over setup": {
    passport: "Pour-over",
    formats: ["ground", "drip", "whole"],
    advice: "Choose ground coffee for your dripper or a pocket filter to hang over your cup. Whole beans need grinding first.",
  },
  "No equipment": {
    passport: "No equipment",
    formats: ["rtd", "drip", "concentrate"],
    advice: "Open a chilled can, dilute cold-brew concentrate to taste, or use a pocket filter with hot water and a mug.",
  },
};

type HomeSetup = keyof typeof homeSetups;

type FormatsProps = {
  products: FormatProduct[];
  images: Record<string, string>;
  filters: string[];
  machine: string;
  onMachineChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  onAdd: (product: FormatProduct) => void;
  onSave: (brewer: string) => void;
};

function MatchCard({ products, images, onAdd }: Pick<FormatsProps, "products" | "images" | "onAdd">) {
  const [selected, setSelected] = useState(products[0].id);
  const product = products.find((item) => item.id === selected) || products[0];

  return <div className="hm-match">
    <div className="hm-match-window">
      <Image key={product.id} src={images[product.id]} alt={product.name + " coffee packaging"} width={627} height={627} priority unoptimized className="hm-match-photo" />
    </div>
    <div className="hm-match-slip">
      <div className="hm-slip-heading">
        <div aria-live="polite" aria-atomic="true">
          <p className="hm-small">Your format match</p>
          <h2>{product.name}</h2>
          <p className="hm-package">{product.detail}</p>
        </div>
        <button className="hm-add" aria-label={`Add ${product.name} to bag, ${product.price} Canadian dollars`} onClick={() => onAdd(product)}><span>${product.price}</span><Plus size={17} aria-hidden="true" /></button>
      </div>
      {products.length > 1 && <div className="hm-options" role="group" aria-label="Compatible formats">{products.map((item) =>
        <button key={item.id} aria-pressed={item.id === product.id} onClick={() => setSelected(item.id)}>{item.name}</button>
      )}</div>}
    </div>
  </div>;
}

export default function CoffeeAtHome({ products, images, filters, machine, onMachineChange, filter, onFilterChange, onAdd, onSave }: FormatsProps) {
  const setup = Object.hasOwn(homeSetups, machine) ? homeSetups[machine as HomeSetup] : homeSetups["Whole bean grinder"];
  const matches = setup.formats.flatMap((id) => products.filter((product) => product.id === id));
  const visible = filter === "All" ? products : products.filter((product) => product.format === filter);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem("deldiet-passport-v1") || "{}")?.brewer;
        const previous = Object.entries(homeSetups).find(([name, item]) => saved === name || saved === item.passport);
        if (previous) onMachineChange(previous[0]);
      } catch { /* A new or storage-limited device starts with the default setup. */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [onMachineChange]);

  return <div className="hm-page">
    <section className="hm-hero" aria-labelledby="hm-title" id="formats">
      <div className="hm-hero-layout">
        <div className="hm-copy">
          <p className="hm-kicker">Coffee at home</p>
          <h1 id="hm-title">Morning,<br /><em>your way.</em></h1>
          <p className="hm-lede">From the first turn of the grinder to a can over ice. Find a coffee that fits your kitchen.</p>
          <div className="hm-selector">
            <label htmlFor="hm-machine">Machine Match™ <span>Choose your setup</span></label>
            <div className="hm-select-wrap"><select id="hm-machine" value={machine} onChange={(event) => onMachineChange(event.target.value)}>{Object.keys(homeSetups).map((label) => <option key={label}>{label}</option>)}</select><ChevronDown size={21} aria-hidden="true" /></div>
            <p aria-live="polite">{setup.advice}</p>
            <button className="hm-save" onClick={() => onSave(setup.passport)}><Bookmark size={16} aria-hidden="true" /> Save setup to Passport</button>
          </div>
        </div>
        {matches.length > 0 && <MatchCard key={machine} products={matches} images={images} onAdd={onAdd} />}
      </div>
      <a className="hm-jump" href="#home-format-shelf">Browse all {products.length} formats <ArrowDown size={18} aria-hidden="true" /></a>
    </section>

    <section className="hm-shelf" id="home-format-shelf" aria-labelledby="hm-shelf-title">
      <div className="hm-shelf-heading">
        <h2 id="hm-shelf-title">The format <em>shelf.</em></h2>
        <p>Beans, capsules and coffee to go.<br />Catalogue prices in Canadian dollars.</p>
      </div>
      <div className="hm-filter" role="group" aria-label="Filter product formats">
        {filters.map((label) => <button key={label} aria-pressed={filter === label} onClick={() => onFilterChange(label)}>{label}</button>)}
      </div>
      <span className="sr-only" role="status">{visible.length} formats shown</span>
      <div className="hm-grid">
        {visible.map((product) => <article className="hm-item" key={product.id}>
          <div className="hm-item-image"><Image src={images[product.id]} alt={`${product.name} packaging`} width={627} height={627} unoptimized /></div>
          <div className="hm-item-copy">
            <span className="hm-small">{product.format}</span>
            <h3>{product.name}</h3>
            <p>{product.detail}</p>
            <button onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag, ${product.price} Canadian dollars`}><span>${product.price}</span><span>Add to bag <Plus size={16} aria-hidden="true" /></span></button>
          </div>
        </article>)}
      </div>
      <a className="hm-lab-link" href="/passport?tab=brew"><span>Ready to brew?</span><strong>Open the Brew Lab <ArrowRight size={24} aria-hidden="true" /></strong></a>
    </section>
  </div>;
}
