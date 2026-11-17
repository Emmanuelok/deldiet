import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { CSSProperties } from "react";
import "./department.css";

const departments = {
  discover: { label: "Discover Deldiet", heading: "Where will you start?", copy: "A drink at the counter, beans for home or a new origin to explore.", alt: "Espresso in a glazed teal cup at a coffee bar", accent: "#9be1cf", action: "Choose your route", href: "#journey", position: "68%", alignment: "left" },
  events: { label: "Coffeehouse events", heading: "At the cupping table", copy: "Explore planned tastings, hands-on brewing sessions and conversations about coffee.", alt: "An illustrative coffee tasting around a wooden table", accent: "#ffd79d", action: "Explore the programme", href: "#events", position: "30%", alignment: "right" },
  tasteprint: { label: "Tasteprint", heading: "What tastes good to you?", copy: "Three choices about what you enjoy will lead you to an origin to try.", alt: "Peach, bergamot, coffee beans and jasmine blossoms", accent: "#ffb1a5", action: "Start my Tasteprint", href: "#tasteprint", position: "76%", alignment: "left" },
  journal: { label: "The Field Journal", heading: "Notes from the field", copy: "Places, processes and small details that shape what ends up in your cup.", alt: "Red coffee cherries overlooking a sunlit coffee-growing landscape", accent: "#d8e998", action: "Read the journal", href: "#journal", position: "77%", alignment: "left" },
  standards: { label: "Deldiet standards", heading: "Behind the counter", copy: "How our recommendations work, what a request records and which services are in development.", alt: "Tasting spoons, coffee samples and a notebook at a roasting bench", accent: "#e7cc95", action: "Read our standards", href: "#standards", position: "78%", alignment: "left" },
  clarity: { label: "Clarity by Deldiet", heading: "A quieter daily ritual", copy: "Meet Clarity, our concept for a caffeine-free coffee-style drink.", alt: "An illustrative sachet and a warm dark drink in mauve afternoon light", accent: "#f2c9ef", action: "Explore the concept", href: "#clarity", position: "23%", alignment: "right" },
  trace: { label: "Coffee traceability", heading: "Follow a coffee lot", copy: "Open a sample lot record and explore the evidence behind each stop on its journey.", alt: "Green coffee beans spilling from a tagged sack beside a copper scoop", accent: "#bfdcb6", action: "Look up a lot", href: "#trace", position: "80%", alignment: "left" },
  business: { label: "Deldiet for business", heading: "Coffee at your table", copy: "Plan coffee for a workplace, a hospitality programme, an event or your own label.", alt: "Coffee being poured from a silver carafe at a breakfast table", accent: "#ffd1a3", action: "Explore programmes", href: "#business", position: "23%", alignment: "right" },
} as const;

export type Department = keyof typeof departments;

export default function DepartmentMasthead({ view }: { view: Department }) {
  const page = departments[view];
  return <section className={`dept-film dept-${page.alignment} dept-${view}`} style={{ "--dept-accent": page.accent, "--dept-focus": page.position } as CSSProperties} aria-labelledby="department-heading">
    <Image className="dept-still" src={`/departments/${view}.webp`} alt={page.alt} fill priority sizes="100vw" unoptimized />
    <div className="dept-veil" aria-hidden="true" />
    <div className="dept-content">
      <p className="dept-label">{page.label}</p>
      <h1 id="department-heading">{page.heading}</h1>
      <p className="dept-description">{page.copy}</p>
      <a href={page.href}>{page.action}<ArrowDown size={16} aria-hidden="true" /></a>
    </div>
  </section>;
}
