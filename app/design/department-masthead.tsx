import Image from "next/image";
import type { CSSProperties } from "react";

const departments = {
  discover: {label:"Discover Deldiet", title:"Find your", emphasis:"coffee ritual.", copy:"Here for a drink, a bag of beans or a better brew? Pick where you’d like to start.", image:"/editorial/home-brewing.webp", alt:"Glass and ceramic pour-over equipment in warm window light", accent:"#e6f65b", action:"Choose your route", href:"#journey"},
  events: {label:"Coffeehouse events", title:"Around the", emphasis:"cupping table.", copy:"Explore planned tastings, hands-on brewing sessions and conversations about the coffees we drink.", image:"/editorial/coffeehouse-interior.webp", alt:"The tables and coffee bar of the Deldiet coffeehouse concept", accent:"#ff895f", action:"Explore the programme", href:"#events"},
  tasteprint: {label:"Tasteprint", title:"Find your", emphasis:"flavour.", copy:"Start with three choices about what you like to drink. Discover an origin that fits your taste.", image:"/editorial/notes-floral.webp", alt:"Jasmine flowers, bergamot and peach tasting-note still life", accent:"#ffd3be", action:"Start my Tasteprint", href:"#tasteprint"},
  journal: {label:"The Field Journal", title:"Notes from", emphasis:"the field.", copy:"A closer look at the places, processes and small details that shape a cup of coffee.", image:"/editorial/green-coffee.webp", alt:"Sacks of green coffee in a sunlit room", accent:"#b6c6ab", action:"Read the journal", href:"#journal"},
  standards: {label:"Deldiet standards", title:"Inside", emphasis:"Deldiet.", copy:"See how our recommendations work, what a request records and which services are still being developed.", image:"/products/field-notebook.webp", alt:"Deldiet field notebooks and a pencil", accent:"#eddaac", action:"Read our standards", href:"#standards"},
  clarity: {label:"Clarity by Deldiet", title:"A different", emphasis:"daily ritual.", copy:"Explore the idea behind Clarity, a caffeine-free drink in development.", image:"/products/format-clarity-sticks.webp", alt:"The proposed Clarity stick pack format", accent:"#d9c2e8", action:"Explore the concept", href:"#clarity"},
  trace: {label:"Coffee traceability", title:"From farm", emphasis:"to cup.", copy:"Explore a sample lot record and the evidence behind each stop on a coffee’s journey.", image:"/editorial/green-coffee.webp", alt:"Green coffee beans in open sacks", accent:"#b8cba5", action:"Look up a lot", href:"#trace"},
  business: {label:"Deldiet for business", title:"Coffee for", emphasis:"every table.", copy:"Plan coffee for your workplace, a hospitality programme, an event or your own label.", image:"/editorial/coffeehouse-interior.webp", alt:"Seating and equipment in the coffeehouse concept", accent:"#ff9c79", action:"Explore programmes", href:"#business"}
} as const;

export type Department = keyof typeof departments;

export default function DepartmentMasthead({view}: {view:Department}) {
  const info = departments[view];
  return <section className="ed-department" aria-labelledby="department-heading" style={{"--department-accent":info.accent} as CSSProperties}>
    <div className="ed-department-type">
      <p className="ed-kicker"><i aria-hidden="true"/>{info.label}</p>
      <h1 id="department-heading">{info.title}<br/><em>{info.emphasis}</em></h1>
      <p>{info.copy}</p>
      <a href={info.href}>{info.action}<span aria-hidden="true">↓</span></a>
    </div>
    <div className="ed-department-photo"><Image src={info.image} alt={info.alt} fill unoptimized priority sizes="(max-width: 650px) 100vw, 48vw" /></div>
  </section>;
}
