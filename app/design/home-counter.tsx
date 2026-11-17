"use client";

import Image from "next/image";
import { ArrowDownRight, ArrowLeftRight, ArrowRight, ArrowUpRight, Maximize2, Minimize2 } from "lucide-react";
import { useState, type CSSProperties, type PointerEvent } from "react";
import "./home-counter.css";

type TastingOrigin = {
  id: string;
  country: string;
  region: string;
  roast: string;
  process: string;
  notes: string[];
};

const tastings = [
  { id: "ethiopia-guji", label: "Bright & floral", photo: "floral", place: "Guji", accent: "#ffad68", light: "#69492c", position: "50% 47%", alt: "Peach and bergamot beside jasmine flowers" },
  { id: "brazil-cerrado", label: "Rich & nutty", photo: "nutty", place: "Cerrado", accent: "#ffafb8", light: "#643642", position: "50% 55%", alt: "Fig, hazelnuts and shards of milk chocolate" },
  { id: "indonesia-sumatra", label: "Deep & spiced", photo: "spiced", place: "Gayo", accent: "#efd17c", light: "#68502b", position: "50% 60%", alt: "Cocoa beans, cedar and whole star anise" },
] as const;

function FlavourStudio({ origins }: { origins: TastingOrigin[] }) {
  const [selected, setSelected] = useState(0);
  const [magnified, setMagnified] = useState(false);
  const tasting = tastings[selected];
  const origin = origins.find((item) => item.id === tasting.id);
  if (!origin) return null;

  function setFocalPoint(event: PointerEvent<HTMLButtonElement>) {
    if (!magnified || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--studio-x", `${100 * (event.clientX - rect.left) / rect.width}%`);
    event.currentTarget.style.setProperty("--studio-y", `${100 * (event.clientY - rect.top) / rect.height}%`);
  }

  return <section className="flavour-studio" id="tasting-counter" aria-labelledby="tasting-title"
    style={{ "--studio-accent": tasting.accent, "--studio-light": tasting.light } as CSSProperties}>
    <div className="flavour-workspace">
      <div className="flavour-intro">
        <p className="studio-caption"><i aria-hidden="true" /> The tasting room</p>
        <h2 id="tasting-title">Find your<br /> <em>flavour.</em></h2>
        <p className="flavour-intro-text">Choose the tasting notes you love and discover a coffee that carries them.</p>
      </div>
      <div className="flavour-choices" role="group" aria-label="Choose a flavour profile">
        {tastings.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === index}
          aria-controls="tasting-notes" onClick={() => { setSelected(index); setMagnified(false); }}>
          <span className="flavour-swatch" aria-hidden="true"><Image src={`/editorial/notes-${item.photo}.webp`} width={58} height={58} alt="" unoptimized /></span>
          <span>{item.label}</span><ArrowRight size={16} aria-hidden="true" />
        </button>)}
      </div>
      <div className="flavour-optics">
        <div className="flavour-orbit" aria-hidden="true" />
        <button key={tasting.id} type="button" className={`flavour-lens${magnified ? " is-magnified" : ""}`}
          onClick={() => setMagnified(!magnified)} aria-label={`${magnified ? "Zoom out of" : "Magnify"} the ${tasting.label.toLowerCase()} tasting photograph`}
          aria-pressed={magnified} onPointerMove={setFocalPoint} onPointerLeave={(event) => {
            event.currentTarget.style.removeProperty("--studio-x"); event.currentTarget.style.removeProperty("--studio-y");
          }}>
          <Image src={`/editorial/notes-${tasting.photo}.webp`} alt={tasting.alt} width={512} height={1024} unoptimized
            style={{objectPosition: tasting.position}} />
          <span className="flavour-lens-glass" aria-hidden="true"/>
          <span className="flavour-magnify" aria-hidden="true">{magnified ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{magnified ? "Zoom out" : "Look closer"}</span>
        </button>
      </div>
      <article className="flavour-reading" aria-live="polite" aria-atomic="true" id="tasting-notes">
        <div key={origin.id} className="flavour-read-in">
          <p className="studio-caption">{origin.country}</p>
          <h3>{tasting.place}</h3>
          <p className="flavour-notes">{origin.notes.join(" · ")}</p>
          <dl className="flavour-specs"><div><dt>Roast</dt><dd>{origin.roast}</dd></div><div><dt>Process</dt><dd>{origin.process}</dd></div></dl>
          <a className="flavour-build" href={`/build-a-cup?origin=${origin.id}`}>Build with this coffee <ArrowRight size={17} aria-hidden="true" /></a>
          <a className="flavour-origin" href={`/origins?origin=${origin.id}#origin-profile`}>Read the origin profile <ArrowUpRight size={15} aria-hidden="true"/></a>
        </div>
      </article>
    </div>
  </section>;
}

function RitualRooms() {
  const [split, setSplit] = useState(53);
  return <section className="ritual-rooms" aria-labelledby="rooms-title">
    <header className="ritual-heading">
      <div><p className="ritual-kicker"><ArrowDownRight size={16} aria-hidden="true"/> The daily ritual</p>
        <h2 id="rooms-title">Where will you <em>brew?</em></h2></div>
      <p id="rooms-hint">Slide between the coffeehouse and the kitchen counter.</p>
    </header>
    <div className="ritual-compare" style={{ "--room-split": `${split}%` } as CSSProperties}>
      <div className="ritual-frame ritual-kitchen"><Image src="/editorial/home-brewing.webp" alt="A sunlit kitchen counter set with a dripper, pitcher and coffee cups" fill unoptimized sizes="100vw" /></div>
      <div className="ritual-frame ritual-cafe"><Image src="/editorial/coffeehouse-interior.webp" alt="An espresso bar beside tall windows and a lounge in the coffeehouse concept" fill unoptimized sizes="100vw" /></div>
      <div className="ritual-divider" aria-hidden="true"><span><ArrowLeftRight size={20}/></span></div>
      <input type="range" min={0} max={100} value={split} onChange={(event) => setSplit(Number(event.target.value))}
        aria-label="Compare the coffeehouse and kitchen photographs" aria-describedby="rooms-hint"
        aria-valuetext={`${split}% coffeehouse, ${100 - split}% kitchen`} />
    </div>
    <div className="ritual-routes">
      <a href="/coffeehouse"><div><small>St. John’s, Newfoundland</small><span>Visit the coffeehouse</span></div><ArrowUpRight aria-hidden="true"/></a>
      <a href="/coffee-at-home"><div><small>Beans, capsules &amp; more</small><span>Brew at home</span></div><ArrowUpRight aria-hidden="true"/></a>
    </div>
  </section>;
}

export default function HomeCounter({ origins }: { origins: TastingOrigin[] }) {
  return <>
    <FlavourStudio origins={origins} />
    <RitualRooms />
    <section className="roast-collection" aria-labelledby="roast-title">
      <Image src="/editorial/shop-roast-edit.webp" alt="Two coffee bags and a ceramic espresso cup under a shaft of light" fill unoptimized sizes="100vw"/>
      <div className="roast-collection-inner"><p className="studio-caption">Deldiet Supply</p>
        <h2 id="roast-title">The roastery <em>shelf.</em></h2>
        <a href="/shop">Shop coffee &amp; objects <ArrowRight size={18} aria-hidden="true"/></a>
      </div>
    </section>
  </>;
}
