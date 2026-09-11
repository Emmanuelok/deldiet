"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Search, X, Download, Compass } from "lucide-react";
import { downloadJson } from "@/lib/local-state";

const destinations = [
  ["Coffeehouse", "Menu, drinks, food and visit planning", "/coffeehouse", "Visit"],
  ["Tasteprint", "Find coffee that matches what you love", "/tasteprint", "Discover"],
  ["Origin Bar", "Build your cup, from bean to finishing touch", "/origin-bar", "Create"],
  ["Build a cup", "Quick custom recipe and saved Brewprints", "/build-a-cup", "Create"],
  ["Brew Studio", "Recipe calculator, timer and brew journal", "/brew-lab", "Create"],
  ["Coffee at home", "Coffee formats and machine compatibility", "/coffee-at-home", "Shop"],
  ["Deldiet Supply", "Coffee, equipment, apparel and gifts", "/shop", "Shop"],
  ["My collection", "Saved products, recipes and request history", "/my-collection", "For you"],
  ["My Passport", "Taste profile and brewing preferences", "/passport", "For you"],
  ["Rhythm", "Plan your coffee replenishment", "/passport?tab=rhythm", "For you"],
  ["Gift Studio", "Personal coffee gifts and discovery boxes", "/passport?tab=gifts", "For you"],
  ["Origin Exchange", "Retail catalogue and trade sourcing", "/origin-exchange", "Business"],
  ["Deldiet for business", "Hospitality, office and private label", "/business", "Business"],
  ["Experiences", "Cuppings, workshops and conversations", "/events", "Learn"],
  ["Field Journal", "Coffee stories, brew guides and learning", "/journal", "Learn"],
  ["Trace a lot", "Origin evidence and traceability records", "/trace", "Learn"],
  ["Clarity", "Explore the caffeine-free concept", "/clarity", "Discover"],
  ["Our standards", "Current capabilities and verification", "/standards", "Learn"],
];

export default function PlatformTools() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [recovery, setRecovery] = useState<{ kind: string; data: unknown } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const launch = () => setOpen(true);
    const clearPrivate = () => setRecovery(null);
    window.addEventListener("deldiet:clear-private", clearPrivate);
    const keys = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(v => !v); }
    };
    const save = (event: Event) => setRecovery({ kind: "receipt", data: (event as CustomEvent).detail });
    const failed = (event: Event) => setRecovery({ kind: "draft", data: (event as CustomEvent).detail });
    window.addEventListener("deldiet:search", launch);
    window.addEventListener("deldiet:receipt", save);
    window.addEventListener("deldiet:unsent", failed);
    document.addEventListener("keydown", keys);
    return () => { window.removeEventListener("deldiet:clear-private", clearPrivate); window.removeEventListener("deldiet:search", launch); window.removeEventListener("deldiet:receipt", save); window.removeEventListener("deldiet:unsent", failed); document.removeEventListener("keydown", keys); };
  }, []);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); input.current?.focus(); }
    else dialog.current?.close();
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = before; };
  }, [open]);
  useEffect(() => { const frame = window.requestAnimationFrame(() => setRecovery(null)); return () => window.cancelAnimationFrame(frame); }, [pathname]);
  useEffect(() => { if (!recovery) return; const timeout = window.setTimeout(() => setRecovery(null), 60000); return () => window.clearTimeout(timeout); }, [recovery]);
  const results = destinations.filter(d => (category === "All" || d[3] === category) && d.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <>
    {pathname !== "/origin-bar" && <button className="dd-explore-button" aria-label="Explore all Deldiet tools" onClick={() => setOpen(true)}><Compass size={19}/><span>Explore</span></button>}
    <dialog className="dd-search-dialog" ref={dialog} onCancel={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }} aria-labelledby="dd-search-title">
      <div className="dd-search-content"><div className="dd-search-heading"><div><p className="eyebrow">THE DELDIET WORLD</p><h2 id="dd-search-title">Where will curiosity take you?</h2></div><button aria-label="Close search" onClick={() => setOpen(false)}><X/></button></div>
        <label className="dd-global-search"><Search size={22}/><input ref={input} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try ‘brew timer’, ‘gifts’, ‘coffee’…" aria-label="Search Deldiet destinations"/><kbd>⌘ K</kbd></label>
        <div className="dd-search-categories">{["All", "Discover", "Create", "Shop", "For you", "Learn", "Business"].map(c => <button key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <div className="dd-search-results">{results.map(([title, copy, href, group]) => <Link key={href} href={href} onClick={() => { setOpen(false); setQuery(""); }}><div><small>{group}</small><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={22}/></Link>)}{results.length === 0 && <p className="dd-empty">No destinations match. Try “coffee” or choose another category.</p>}</div>
      </div>
    </dialog>
    {recovery && <aside className="dd-recovery" role="status"><button className="dd-recovery-close" aria-label="Dismiss request notice" onClick={() => setRecovery(null)}><X size={18}/></button><b>{recovery.kind === "receipt" ? "Keep your private receipt" : "Submission not confirmed"}</b><p>{recovery.kind === "receipt" ? "Download the receipt with its private tracking key. Keep it safe to check your request later." : "We could not confirm the submission. Download a private recovery copy with the original retry key. Retrying unchanged selections uses that same key."}</p><button onClick={() => downloadJson(recovery.kind === "receipt" ? "deldiet-private-receipt.json" : "deldiet-unconfirmed-request.json", recovery.data)}><Download size={16}/>{recovery.kind === "receipt" ? "Download private receipt" : "Download recovery copy"}</button></aside>}
  </>;
}
