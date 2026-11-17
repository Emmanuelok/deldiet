"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";

const values = [
  { title: "Explain the recommendation", status: "Available", copy: "Your taste choices shape your Passport match. Open the finder to see which notes and brew methods informed it.", action: "Explore the taste finder", href: "/passport?tab=finder" },
  { title: "Make brewing repeatable", status: "Available", copy: "Scale a recipe to your serving size and strength, then follow the method with a guided timer.", action: "Open Brew Lab", href: "/passport?tab=brew" },
  { title: "Give every request a reference", status: "Available", copy: "A submitted plan, gift or team brief receives a reference for review. The team confirms availability and pricing separately.", action: "Plan a coffee rhythm", href: "/passport?tab=rhythm" },
  { title: "Show the origin evidence", status: "Design standard", copy: "Source documentation, verification status and catalogue descriptions have separate places in Origin Exchange.", action: "Visit Origin Exchange", href: "/origin-exchange" },
  { title: "Keep guest choices clear", status: "Design standard", copy: "Browse without signing in. Passport identifies preferences saved on this device and asks for contact details when you submit a request.", action: "Read the privacy policy", href: "/privacy" },
  { title: "Return and reuse", status: "In development", copy: "A future programme is intended to connect packaging returns and reusable cup choices to verified rewards.", action: "Explore Deldiet Passport", href: "/passport" },
];

export function StandardsGuide() {
  return <section className="dg-guide dg-standards" id="standards" aria-labelledby="standards-title">
    <div className="dg-intro"><h2 id="standards-title">Deldiet operating values</h2><p>See what you can use today and what the team is still building.</p></div>
    <div className="dg-values">
      {values.map((item, i) => <details key={item.title} open={i === 0}>
        <summary><span className={'dg-status dg-status-' + (i < 3 ? "live" : i < 5 ? "standard" : "future")}>{item.status}</span><h3>{item.title}</h3><Plus size={19} aria-hidden="true" /></summary>
        <div className="dg-detail"><p>{item.copy}</p><a className="dg-link" href={item.href}>{item.action} <ArrowRight size={17} /></a></div>
      </details>)}
    </div>
  </section>;
}

export function ClarityGuide({ onInterest }: { onInterest: () => void }) {
  return <section id="clarity" className="dg-guide dg-clarity">
    <div className="dg-clarity-photo"><Image src="/products/clarity-sticks.webp" alt="Deldiet Clarity stick packaging concept" width={800} height={800} unoptimized /></div>
    <div className="dg-clarity-copy">
      <h2>Inside the <em>blend.</em></h2>
      <p>Clarity is a caffeine-free, black-coffee-flavoured drink in development. The team is exploring three ingredients for its single-serve sticks.</p>
      <dl><div><dt>L-Tyrosine</dt><dd>Amino acid</dd></div><div><dt>L-Theanine</dt><dd>Tea amino acid</dd></div><div><dt>Neurofactor™</dt><dd>Botanical extract</dd></div></dl>
      <p className="dg-small">The formulation and claims are subject to regulatory review. Register your interest in the founding batch through your shop bag.</p>
      <button className="dg-action" onClick={onInterest}>Add interest to bag <Plus size={17} /></button>
    </div>
  </section>;
}

const demoCode = "ET-GUJI-2608";
const stages = [
  ["Farm lots", "Hambela, Guji", "Producer identity and harvest"],
  ["Washing station", "Washed process", "Processing method"],
  ["Shipment", "Export and arrival", "Shipping and arrival records"],
  ["Roastery", "Roast record pending", "Roast date and profile"],
  ["Your cup", "Freshness window pending", "Roast-to-brew interval"],
];

export function TraceGuide({ onRecord }: { onRecord: () => void }) {
  const [code, setCode] = useState("");
  const [missing, setMissing] = useState("");
  function lookUp(event: FormEvent) {
    event.preventDefault();
    const entry = code.trim().toUpperCase();
    if (entry === demoCode) { setMissing(""); onRecord(); }
    else setMissing(entry ? 'There is no published record for “' + entry + '”. Check the code or explore the example below.' : "Enter a lot code to search.");
  }
  return <section className="dg-guide dg-trace" id="trace" aria-labelledby="dg-trace-title">
    <div className="dg-lookup">
      <div><h2 id="dg-trace-title">Look up a <em>lot.</em></h2><p>Enter the code from a cup or pack. The public preview currently contains one illustrative record.</p></div>
      <form onSubmit={lookUp}><label htmlFor="dg-lot">Lot code</label><div className="dg-search"><input type="text" id="dg-lot" maxLength={70} placeholder={demoCode} value={code} onChange={e => { setCode(e.target.value); setMissing(""); }} autoCapitalize="characters" spellCheck={false} /><button type="submit">Look up <ArrowRight size={17} /></button></div>
        {missing && <p role="status" className="dg-search-note">{missing}</p>}
      </form>
    </div>
    <div className="dg-trace-record">
      <div className="dg-ticket-intro"><p className="dg-label">Illustrative lot journey</p><h3>Hambela,<br/><em>Guji.</em></h3><strong>{demoCode}</strong><button className="dg-action" onClick={onRecord}>Open example record <ArrowUpRight size={18}/></button></div>
      <ol>{stages.map(([stage, title, field]) => <li key={stage}><div><span>{stage}</span><h4>{title}</h4></div><small>{field}</small></li>)}</ol>
    </div>
  </section>;
}

export function BusinessGuide({ onEnquiry }: { onEnquiry: (message: string) => void }) {
  return <section id="business" className="dg-guide dg-business" aria-labelledby="dg-business-title">
    <div className="dg-intro"><h2 id="dg-business-title">Find your programme</h2><p>Start with the way you serve coffee. Each enquiry gives the team a brief to review.</p></div>
    <div className="dg-programmes">
      <article className="dg-programme dg-work"><div><h3>Wholesale studio</h3><p>Discuss a coffee menu, equipment and training for your café, restaurant or hotel.</p></div><button onClick={() => onEnquiry("I’d like to discuss a wholesale coffee programme for ")}>Start a wholesale enquiry <ArrowUpRight size={20}/></button></article>
      <article className="dg-programme dg-office"><div><h3>Office coffee</h3><p>Plan coffee around the size of your team, your current brewer and how often you need a delivery.</p></div><a href="/passport?tab=teams">Build a workplace brief <ArrowUpRight size={20}/></a></article>
      <article className="dg-programme dg-private"><div><h3>Private label</h3><p>Share the coffee, format, packaging or gift you have in mind for your own brand.</p></div><button onClick={() => onEnquiry("I’d like to discuss a private-label coffee project for ")}>Discuss a product <ArrowUpRight size={20}/></button></article>
      <article className="dg-programme dg-cupping"><div><h3>Cupping room</h3><p>Explore guided origin flights, sensory workshops and planned café sessions.</p></div><a href="/events">Explore sessions <ArrowUpRight size={20}/></a></article>
    </div>
  </section>;
}
