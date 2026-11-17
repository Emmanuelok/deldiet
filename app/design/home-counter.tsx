"use client";

import Image from "next/image";
import { useState } from "react";

type TastingOrigin = {
  id: string;
  country: string;
  region: string;
  roast: string;
  process: string;
  notes: string[];
};

const tastings = [
  { id: "ethiopia-guji", label: "Bright & floral", photo: "floral", place: "Guji", alt: "Jasmine, bergamot and peach on a persimmon backdrop" },
  { id: "brazil-cerrado", label: "Rich & nutty", photo: "nutty", place: "Cerrado", alt: "Hazelnuts, milk chocolate and fig against pink" },
  { id: "indonesia-sumatra", label: "Deep & spiced", photo: "spiced", place: "Gayo", alt: "Cacao, cedar and star anise against golden yellow" },
] as const;

function RouteArrow() {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;
}

export default function HomeCounter({ origins }: { origins: TastingOrigin[] }) {
  const [selected, setSelected] = useState(0);
  const tasting = tastings[selected];
  const origin = origins.find((item) => item.id === tasting.id)!;

  return <>
    <section className="ed-tasting" id="tasting-counter" aria-labelledby="tasting-title">
      <div className="ed-taste-intro">
        <div><p className="ed-kicker"><i aria-hidden="true" /> The tasting counter</p>
          <h2 id="tasting-title">What’s your <em>flavour?</em></h2></div>
        <p>Pick the notes you love. We’ll point you to a coffee to explore.</p>
      </div>
      <div className="ed-tasting-spread" data-profile={tasting.photo}>
        <div className="ed-taste-choices" role="group" aria-label="Choose a flavour profile">
          {tastings.map((item, index) => <button type="button" key={item.id} aria-pressed={selected === index} aria-controls="tasting-notes" onClick={() => setSelected(index)}>
            <span className={'ed-swatch ed-swatch-' + item.photo} aria-hidden="true" />{item.label}
            <span aria-hidden="true" className="ed-profile-arrow"><RouteArrow/></span>
          </button>)}
        </div>
        <div className="ed-taste-photo" key={tasting.photo}>
          <Image src={'/editorial/notes-' + tasting.photo + '.webp'} alt={tasting.alt} fill unoptimized sizes="(max-width: 700px) 100vw, 36vw" />
        </div>
        <article className="ed-taste-result" aria-live="polite" aria-atomic="true" id="tasting-notes">
          <p className="ed-kicker">{origin.country} <span aria-hidden="true">/</span> {origin.roast} roast</p>
          <h3>{tasting.place}<span>.</span></h3>
          <p className="ed-notes">{origin.notes.join(" · ")}</p>
          <div className="ed-taste-bottom"><p>{origin.region}<br/>{origin.process} process</p>
            <a href={'/origins?origin=' + origin.id + '#origin-profile'}>Explore this origin <RouteArrow/></a>
          </div>
        </article>
      </div>
    </section>

    <section className="ed-places" aria-labelledby="ed-places-title">
      <h2 id="ed-places-title">Where we’re <em>brewing.</em></h2>
      <div className="ed-spreads">
        <a className="ed-feature ed-cafe-feature" href="/coffeehouse">
          <Image src="/editorial/coffeehouse-interior.webp" alt="A sunlit coffeehouse interior with low chairs and an espresso bar" fill unoptimized sizes="(max-width: 700px) 100vw, 55vw"/>
          <div><p className="ed-kicker">St. John’s, Newfoundland</p><h3>The coffeehouse.</h3><span>Explore the menu <RouteArrow/></span></div>
        </a>
        <a className="ed-feature ed-home-feature" href="/coffee-at-home">
          <Image src="/editorial/home-brewing.webp" alt="Pour-over brewer, glass server and ceramic cups on a sunlit table" fill unoptimized sizes="(max-width: 700px) 100vw, 40vw"/>
          <div><p className="ed-kicker">Your kitchen counter</p><h3>Coffee at home.</h3><span>Find your brew format <RouteArrow/></span></div>
        </a>
      </div>
    </section>
    <a className="ed-supply-band" href="/shop">
      <span className="ed-kicker">Deldiet Supply</span>
      <h2>Shop the <em>collection.</em></h2>
      <span className="ed-band-button"><span>Browse the shop</span><RouteArrow /></span>
    </a>
  </>;
}
