import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { AtlasOrigin } from "./origins-atlas";

const journeys = {
  taste: { label: "Find a flavour", image: "/editorial/notes-floral.webp", name: "Tasteprint", copy: "Choose the flavours you enjoy and see which origin to try first.", href: "/tasteprint", primary: "Find my coffee", secondaryHref: "/origins", secondary: "Browse all origins" },
  cafe: { label: "Visit the coffeehouse", image: "/editorial/coffeehouse-interior.webp", name: "At the counter", copy: "Browse drinks and food, prepare an order for review, or register interest in a visit.", href: "/coffeehouse", primary: "Explore the coffeehouse", secondaryHref: "/events", secondary: "See planned tastings" },
  home: { label: "Brew at home", image: "/editorial/home-brewing.webp", name: "Your home brew", copy: "Find the coffee formats that fit your brewer, from whole beans to single-serve cups.", href: "/coffee-at-home", primary: "Match my brewer", secondaryHref: "/shop", secondary: "Visit the shop" },
  trade: { label: "Source for business", image: "/atlas/coffee-lots.webp", name: "Origin Exchange", copy: "Explore green coffee lots, review the sourcing information and prepare a trade enquiry.", href: "/origin-exchange", primary: "Enter the Exchange", secondaryHref: "/business", secondary: "Explore business services" },
} as const;
export type JourneyIntent = keyof typeof journeys;

export function DiscoverRoutes({ intent, onIntent }: { intent: JourneyIntent; onIntent: (value: JourneyIntent) => void }) {
  const route = journeys[intent];
  return <section className="ds-story ds-discover" id="journey" aria-labelledby="ds-doors">
    <div className="ds-route-picker">
      <h2 id="ds-doors">Four useful <em>doors.</em></h2>
      <div role="group" aria-label="Choose your Deldiet goal" className="ds-route-list">
        {(Object.keys(journeys) as JourneyIntent[]).map((key) => <button type="button" key={key} aria-pressed={key === intent} onClick={() => onIntent(key)}>
          <span>{journeys[key].label}</span><ArrowRight size={22}/>
        </button>)}
      </div>
    </div>
    <div className="ds-destination" aria-live="polite" data-intent={intent}>
      <Image src={route.image} alt="" width={820} height={410} unoptimized/>
      <div className="ds-destination-copy"><h3>{route.name}</h3><p>{route.copy}</p>
        <div className="ds-actions"><a className="ds-button" href={route.href}>{route.primary} <ArrowRight size={17}/></a>
          <a className="ds-link" href={route.secondaryHref}>{route.secondary} <ArrowUpRight size={16}/></a></div>
      </div>
    </div>
  </section>;
}

const sessions = [
  { title: "East Africa cupping table", type: "Guided tasting", detail: "Compare proposed coffees from Ethiopia, Kenya and Rwanda. Taste them side by side and practise putting words to aroma, body and finish.", image: "/products/world-flight.webp" },
  { title: "Home espresso clinic", type: "Brew workshop", detail: "Work through a home espresso routine, from adjusting grind and dose to steaming milk for the drink you like.", image: "/products/espresso-pair.webp" },
  { title: "The producer room", type: "Conversation", detail: "An open conversation about growing, processing and selling coffee. Guest details will accompany the programme when confirmed.", image: "/atlas/coffee-lots.webp" },
];
export function EventProgramme({ onRegister }: { onRegister: (session: string) => void }) {
  return <section className="ds-story ds-events" id="events" aria-labelledby="ds-events-heading">
    <header className="ds-intro"><h2 id="ds-events-heading">The <em>programme.</em></h2><p>These sessions are in planning. Register interest in the one you’d like to attend. Dates and places are still to be confirmed.</p></header>
    <div className="ds-sessions">{sessions.map((session) => <article className="ds-session" key={session.title}>
      <div className="ds-session-image"><Image src={session.image} alt="" width={350} height={270} unoptimized/></div>
      <div className="ds-session-body"><span className="ds-caption">{session.type}</span><h3>{session.title}</h3>
        <p>{session.detail}</p><button type="button" className="ds-link" aria-label={`Register interest in ${session.title}`} onClick={() => onRegister(session.title)}>Register interest <ArrowRight size={17}/></button>
      </div>
    </article>)}</div>
    <a className="ds-link" href="/coffeehouse#plan-your-visit">Plan a coffeehouse visit <ArrowUpRight size={16}/></a>
  </section>;
}

const tasteOptions = {
  feel: ["Bright", "Balanced", "Bold"],
  note: ["Fruit-forward", "Chocolate & nuts", "Floral & tea-like"],
  brew: ["Pour-over", "Espresso", "French press"],
} as const;
type Taste = { [K in keyof typeof tasteOptions]: (typeof tasteOptions)[K][number] };
const matchTable: Record<Taste["note"], Record<Taste["feel"], string>> = {
  "Fruit-forward": { Bright: "kenya-nyeri", Balanced: "rwanda-nyamasheke", Bold: "colombia-huila" },
  "Chocolate & nuts": { Bright: "costa-rica-tarrazu", Balanced: "brazil-cerrado", Bold: "indonesia-sumatra" },
  "Floral & tea-like": { Bright: "ethiopia-guji", Balanced: "ethiopia-guji", Bold: "ethiopia-guji" },
};
const brewTips = {
  "Pour-over": "Try a small pour-over and taste it again as it cools.",
  "Espresso": "Taste the espresso on its own before adding milk or water.",
  "French press": "Let the grounds settle, decant the pot and compare the first and last sips.",
};
const tastePrompts = { feel: "How should the cup feel?", note: "Which flavours call to you?", brew: "How do you brew?" };
export function TasteFinder({ origins }: { origins: AtlasOrigin[] }) {
  const [taste, setTaste] = useState<Taste>({ feel: "Bright", note: "Fruit-forward", brew: "Pour-over" });
  const [revealed, setRevealed] = useState(false);
  const origin = origins.find((item) => item.id === matchTable[taste.note][taste.feel]);
  const image = taste.note === "Chocolate & nuts" ? "/editorial/notes-nutty.webp" : taste.note === "Floral & tea-like" ? "/editorial/notes-floral.webp" : "/products/world-flight.webp";
  return <section className="ds-story ds-taste" id="tasteprint" aria-labelledby="ds-profile">
    <header className="ds-intro"><h2 id="ds-profile">Make a <em>Tasteprint.</em></h2><p>Choose a flavour, a feel and your brewer. Your picks lead to an origin from the tasting library and a way to explore it.</p></header>
    <div className="ds-taste-layout">
      <form className="ds-quiz" onSubmit={(event) => { event.preventDefault(); setRevealed(true); }}>
        {(Object.keys(tasteOptions) as (keyof Taste)[]).map((key) => <fieldset key={key}>
          <legend>{tastePrompts[key]}</legend><div className="ds-choices">{tasteOptions[key].map((option) => <label key={option}>
            <input type="radio" name={key} checked={taste[key] === option} value={option} onChange={() => setTaste({ ...taste, [key]: option })}/>
            <span>{option}{taste[key] === option && <Check size={15}/>}</span>
          </label>)}</div>
        </fieldset>)}
        {!revealed && <button type="submit" className="ds-button">Find my coffee <ArrowRight size={17}/></button>}
      </form>
      <div className="ds-taste-card" aria-live="polite">
        <Image src={image} alt="" width={720} height={400} unoptimized/>
        <div>{revealed && origin ? <>
          <span className="ds-caption">Your origin match</span><h3>{origin.country}</h3><p>{origin.region} · {origin.roast} roast</p>
          <p>Tasting notes include {origin.notes.join(", ")}. {brewTips[taste.brew]}</p>
          <div className="ds-actions"><a className="ds-button" href={`/origins?origin=${origin.id}#origin-profile`}>Read the profile <ArrowRight size={16}/></a><a className="ds-link" href={`/build-a-cup?origin=${origin.id}`}>Build a cup <ArrowUpRight size={16}/></a></div>
        </> : <><span className="ds-caption">Your tasting card</span><h3>{taste.feel}</h3><p>{taste.note} · {taste.brew}</p></>}</div>
      </div>
    </div>
  </section>;
}

export function FieldJournal({ origins }: { origins: AtlasOrigin[] }) {
  const examples = origins.filter((item) => ["ethiopia-guji", "brazil-cerrado", "colombia-huila"].includes(item.id));
  const [selectedId, setSelectedId] = useState("ethiopia-guji");
  const sample = examples.find((item) => item.id === selectedId);
  return <article className="ds-story ds-journal" id="journal" aria-labelledby="ds-altitude">
    <div className="ds-article">
      <span className="ds-caption">Growing conditions</span><h2 id="ds-altitude">Why altitude <em>matters.</em></h2>
      <p className="ds-standfirst">An elevation range on a coffee bag gives you a clue about how the coffee grew. Read it alongside the process and the tasting notes.</p>
      <h3>What the research says</h3>
      <p>A review of 73 studies found that higher growing elevations were often associated with better sensory ratings. The researchers also found differences across locations and growing practices. Two coffees grown at the same height can taste quite different.</p>
      <a className="ds-link" href="https://doi.org/10.3389/fpls.2021.708013">Read the 2021 study <ArrowUpRight size={16}/></a>
      <h3>Try the comparison</h3><p>Choose two origin profiles. Read their elevation ranges, processing methods and tasting notes. When you brew them, keep the method and coffee-to-water ratio the same. Write down the first aroma or flavour you notice before you look at the labels again.</p>
    </div>
    <aside className="ds-field-card">
      <p className="ds-caption">From the tasting library</p><h3>Read an <em>origin label.</em></h3>
      <label htmlFor="ds-origin-example">Choose a catalogue example</label>
      <select id="ds-origin-example" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{examples.map((origin) => <option key={origin.id} value={origin.id}>{origin.country} · {origin.region}</option>)}</select>
      {sample && <div aria-live="polite"><strong>{sample.elevation}</strong><p>Growing elevation</p>
        <dl><div><dt>Process</dt><dd>{sample.process}</dd></div><div><dt>Tasting notes</dt><dd>{sample.notes.join(", ")}</dd></div></dl>
        <a className="ds-link" href={`/origins?origin=${sample.id}#origin-profile`}>Open the profile <ArrowUpRight size={16}/></a>
      </div>}
    </aside>
  </article>;
}
