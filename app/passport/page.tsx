"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Award, Building2, Check, ChevronRight, Coffee,
  Compass, Gift, Gauge, Heart, MapPin, Package, Pause, Play, RefreshCw,
  RotateCcw, Sparkles, Timer, UserRound, WandSparkles,
} from "lucide-react";
import { createIdempotencyKey, submitServiceRequest, type ServiceRequestInput } from "@/lib/request-client";
import styles from "./passport.module.css";

type Tab = "overview" | "finder" | "rhythm" | "brew" | "gifts" | "teams";
type TasteProfile = { note: string; roast: string; brew: string; adventure: string };
type Contact = { name: string; email: string; phone: string };
type PlanState = { plan: string; format: string; cadence: string; brewMethod: string; quantity: string; selectionMode: string };
type GiftState = { giftType: string; occasion: string; deliveryWindow: string; recipientMode: string; budget: string; message: string };
type TeamState = { programme: string; serviceCadence: string; brewSetup: string; headcount: string; city: string; notes: string };

const TABS: Array<{ id: Tab; label: string; short: string; icon: typeof Compass }> = [
  { id: "overview", label: "My Passport", short: "Home", icon: Compass },
  { id: "finder", label: "Taste Graph", short: "Taste", icon: WandSparkles },
  { id: "rhythm", label: "Deldiet Rhythm", short: "Rhythm", icon: RefreshCw },
  { id: "brew", label: "Brew Lab", short: "Brew", icon: Gauge },
  { id: "gifts", label: "Gift Studio", short: "Gifts", icon: Gift },
  { id: "teams", label: "Teams & Events", short: "Teams", icon: Building2 },
];

const COFFEES = [
  { id: "guji", name: "Guji Reserve", origin: "Ethiopia · Guji", note: "Floral & citrus", roast: "Light", methods: ["Pour-over", "AeroPress"], adventure: 4, notes: "Jasmine · bergamot · peach", why: "A transparent, high-aroma cup for exploratory filter brewing.", price: 24, image: "/products/guji-reserve.webp" },
  { id: "house", name: "House No. 01", origin: "Brazil · Colombia", note: "Chocolate & nuts", roast: "Medium", methods: ["Espresso machine", "French press", "Batch brewer"], adventure: 1, notes: "Chocolate · praline · caramel", why: "A familiar, forgiving profile that holds its shape with milk.", price: 21, image: "/products/house-01.webp" },
  { id: "huila", name: "Huila Decaf", origin: "Colombia · Huila", note: "Caramel & sweet", roast: "Medium", methods: ["Espresso machine", "Pour-over"], adventure: 2, notes: "Caramel · red berries · cocoa", why: "A rounded caffeine-conscious option for espresso or filter.", price: 23, image: "/products/huila-decaf.webp" },
  { id: "sumatra", name: "Sumatra Field Lot", origin: "Indonesia · Aceh", note: "Deep & earthy", roast: "Medium-dark", methods: ["French press", "Batch brewer"], adventure: 3, notes: "Cedar · cacao · dried spice", why: "Full-bodied and low-toned, especially expressive in immersion brewing.", price: 25, image: "/products/world-flight.webp" },
  { id: "panama", name: "Panama Discovery", origin: "Panama · Boquete", note: "Fruit-forward", roast: "Light", methods: ["Pour-over", "AeroPress"], adventure: 5, notes: "Tropical fruit · honey · florals", why: "A limited-style discovery profile for curious, aroma-led drinkers.", price: 29, image: "/products/world-flight.webp" },
] as const;

const BREW_METHODS = {
  "Pour-over": { ratio: 16, dose: 20, temp: 94, seconds: 180, grind: "Medium-fine", steps: ["Rinse filter and warm the brewer", "Bloom with 2× the coffee weight", "Pour in slow, even pulses", "Finish when the bed drains flat"] },
  "French press": { ratio: 15, dose: 30, temp: 94, seconds: 240, grind: "Coarse", steps: ["Add coffee, then all the water", "Stir gently at the surface", "Steep without plunging", "Break crust, skim, then press slowly"] },
  "AeroPress": { ratio: 13, dose: 16, temp: 88, seconds: 105, grind: "Medium-fine", steps: ["Rinse the paper filter", "Add coffee and water", "Stir for ten seconds", "Cap, wait, then press gently"] },
  "Espresso": { ratio: 2.2, dose: 18, temp: 93, seconds: 30, grind: "Fine", steps: ["Purge and dry the basket", "Distribute and tamp level", "Start extraction immediately", "Stop at the target beverage weight"] },
  "Cold brew": { ratio: 8, dose: 80, temp: 20, seconds: 43200, grind: "Very coarse", steps: ["Combine coffee and cool water", "Stir until every ground is wet", "Cover and steep for 12 hours", "Filter, chill and dilute to taste"] },
} as const;

const ORIGIN_STAMPS = [
  ["ET", "Ethiopia", "Floral altitude"], ["CO", "Colombia", "Balanced sweetness"],
  ["BR", "Brazil", "Cacao structure"], ["KE", "Kenya", "Juicy acidity"],
] as const;

function fingerprint(value: unknown) {
  return JSON.stringify(value);
}

export default function PassportPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [taste, setTaste] = useState<TasteProfile>({ note: "Chocolate & nuts", roast: "Medium", brew: "Espresso machine", adventure: "2" });
  const [brewer, setBrewer] = useState("Espresso machine");
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "" });
  const [plan, setPlan] = useState({ plan: "Explorer", format: "Whole bean", cadence: "Every 4 weeks", brewMethod: "Espresso machine", quantity: "2", selectionMode: "Taste Graph chooses" });
  const [gift, setGift] = useState({ giftType: "Origin journey", occasion: "Birthday", deliveryWindow: "Within 2 weeks", recipientMode: "Let recipient take the Taste Graph", budget: "75", message: "" });
  const [team, setTeam] = useState({ programme: "Office coffee", serviceCadence: "Every 2 weeks", brewSetup: "We need equipment", headcount: "25", city: "St. John’s", notes: "" });
  const [brewMethod, setBrewMethod] = useState<keyof typeof BREW_METHODS>("Pour-over");
  const [servings, setServings] = useState(1);
  const [strength, setStrength] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState<number>(BREW_METHODS["Pour-over"].seconds);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pending, setPending] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const keys = useRef<Record<string, { key: string; signature: string }>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("tab") as Tab | null;
      if (requested && TABS.some((item) => item.id === requested)) setTab(requested);
      try {
        const stored = JSON.parse(window.localStorage.getItem("deldiet-passport-v1") || "null") as { taste?: TasteProfile; brewer?: string } | null;
        const savedTaste = stored?.taste;
        if (savedTaste && ["Chocolate & nuts", "Caramel & sweet", "Floral & citrus", "Fruit-forward", "Deep & earthy"].includes(savedTaste.note) && ["Light", "Medium", "Medium-dark"].includes(savedTaste.roast) && ["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine"].includes(savedTaste.brew) && ["1", "2", "3", "4", "5"].includes(savedTaste.adventure)) setTaste(savedTaste);
        if (stored?.brewer && ["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine", "Single-serve brewer"].includes(stored.brewer)) setBrewer(stored.brewer);
      } catch { /* local preview may be empty */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("deldiet-passport-v1", JSON.stringify({ taste, brewer }));
  }, [taste, brewer]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((value) => {
      if (value <= 1) { setTimerRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  const matches = useMemo(() => COFFEES.map((coffee) => {
    const method = taste.brew === "Capsule machine" ? "Espresso machine" : taste.brew;
    const score = (coffee.note === taste.note ? 4 : 0) + (coffee.roast === taste.roast ? 3 : 0) + (coffee.methods.includes(method as never) ? 3 : 0) + Math.max(0, 3 - Math.abs(coffee.adventure - Number(taste.adventure)));
    return { ...coffee, score };
  }).sort((a, b) => b.score - a.score), [taste]);

  const recipe = BREW_METHODS[brewMethod];
  const ratioAdjust = strength === 1 ? 1.1 : strength === 3 ? 0.9 : 1;
  const dose = Math.round(recipe.dose * servings);
  const water = Math.round(dose * recipe.ratio * ratioAdjust);
  const timeLabel = secondsLeft >= 3600
    ? `${Math.floor(secondsLeft / 3600)}:${String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`
    : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  function chooseTab(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", `/passport?tab=${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateTaste(key: keyof TasteProfile, value: string) {
    setTaste((current) => ({ ...current, [key]: value }));
  }

  function setMethod(method: keyof typeof BREW_METHODS) {
    setBrewMethod(method);
    setSecondsLeft(BREW_METHODS[method].seconds);
    setTimerRunning(false);
  }

  async function save(scope: string, input: ServiceRequestInput) {
    const signature = fingerprint(input);
    if (!keys.current[scope] || keys.current[scope].signature !== signature) keys.current[scope] = { key: createIdempotencyKey(scope), signature };
    setPending(scope);
    setNotice(null);
    try {
      const receipt = await submitServiceRequest(input, keys.current[scope].key);
      setNotice({ tone: "success", text: `Request saved · ${receipt.reference}. ${receipt.message}` });
      return true;
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Deldiet could not save this request." });
      return false;
    } finally {
      setPending("");
    }
  }

  function addMatchToBag() {
    const top = matches[0];
    try {
      const raw = JSON.parse(window.localStorage.getItem("deldiet-cart") || "[]") as Array<Record<string, unknown>>;
      const id = `passport-${top.id}-whole`;
      const existing = raw.find((item) => item.id === id);
      if (existing) existing.quantity = Math.min(20, Number(existing.quantity || 0) + 1);
      else raw.push({ id, name: top.name, detail: "Whole bean · 250 g · Taste Graph match", price: top.price, quantity: 1, channel: "shop", image: top.image });
      window.localStorage.setItem("deldiet-cart", JSON.stringify(raw));
      setNotice({ tone: "success", text: `${top.name} was added to your Deldiet shop bag.` });
    } catch {
      setNotice({ tone: "error", text: "The local shop bag could not be updated on this device." });
    }
  }

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save("passport-rhythm", { type: "subscription_plan", source: "passport-rhythm", customer: contact, payload: { ...plan, quantity: Number(plan.quantity) } });
  }

  async function submitGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save("passport-gift", { type: "gift_build", source: "passport-gift-studio", customer: contact, payload: { ...gift, budget: Number(gift.budget) } });
  }

  async function submitTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save("passport-team", { type: "workplace_program", source: "passport-team-planner", customer: contact, payload: { ...team, headcount: Number(team.headcount) } });
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Deldiet home"><Image src="/brand/deldiet-wordmark.png" alt="Deldiet" width={432} height={129} priority unoptimized /></Link>
        <div className={styles.headerTitle}><span>Deldiet Passport</span><small>Your coffee, connected</small></div>
        <nav aria-label="Deldiet experiences"><Link href="/origin-bar">Origin Bar</Link><Link href="/origin-exchange">Origin Exchange</Link><Link href="/"><ArrowLeft size={15}/> Home</Link></nav>
      </header>

      <div className={styles.statusBar}><span><i/> Interactive customer preview</span><p>Taste and brewer preferences save only on this device. Account sync, payment and automatic fulfilment are not connected yet.</p></div>

      <div className={styles.appGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}><span className={styles.avatar}><UserRound size={21}/></span><div><b>Guest Passport</b><small>Local device profile</small></div></div>
          <nav aria-label="Passport sections">{TABS.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? styles.active : ""} onClick={() => chooseTab(id)} aria-current={tab === id ? "page" : undefined}><Icon size={18}/><span>{label}</span><ChevronRight size={15}/></button>)}</nav>
          <div className={styles.sidebarFoot}><Award size={19}/><div><b>Circle preview</b><small>Rewards activate when a verified account programme launches.</small></div></div>
        </aside>

        <section className={styles.workspace}>
          {notice && <div className={`${styles.notice} ${notice.tone === "error" ? styles.noticeError : styles.noticeSuccess}`} role={notice.tone === "error" ? "alert" : "status"}><span>{notice.tone === "success" ? <Check size={17}/> : <RotateCcw size={17}/>}</span><p>{notice.text}</p><button aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}

          {tab === "overview" && <Overview taste={taste} brewer={brewer} setBrewer={setBrewer} onNavigate={chooseTab} onReorder={addMatchToBag} topMatch={matches[0]} />}
          {tab === "finder" && <TasteGraph taste={taste} updateTaste={updateTaste} matches={matches} onAdd={addMatchToBag} onContinue={() => { setPlan((current) => ({ ...current, brewMethod: taste.brew })); chooseTab("rhythm"); }} />}
          {tab === "rhythm" && <RhythmForm plan={plan} setPlan={setPlan} contact={contact} setContact={setContact} pending={pending} onSubmit={submitPlan} />}
          {tab === "brew" && <BrewLab method={brewMethod} setMethod={setMethod} recipe={recipe} servings={servings} setServings={setServings} strength={strength} setStrength={setStrength} dose={dose} water={water} timeLabel={timeLabel} running={timerRunning} secondsLeft={secondsLeft} setRunning={setTimerRunning} reset={() => { setSecondsLeft(recipe.seconds); setTimerRunning(false); }} />}
          {tab === "gifts" && <GiftForm gift={gift} setGift={setGift} contact={contact} setContact={setContact} pending={pending} onSubmit={submitGift} />}
          {tab === "teams" && <TeamForm team={team} setTeam={setTeam} contact={contact} setContact={setContact} pending={pending} onSubmit={submitTeam} />}
        </section>
      </div>

      <nav className={styles.mobileNav} aria-label="Passport sections">{TABS.map(({ id, short, icon: Icon }) => <button key={id} className={tab === id ? styles.active : ""} onClick={() => chooseTab(id)}><Icon size={18}/><span>{short}</span></button>)}</nav>
    </main>
  );
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className={styles.pageIntro}><p>{eyebrow}</p><h1>{title}</h1><span>{copy}</span></div>;
}

function Overview({ taste, brewer, setBrewer, onNavigate, onReorder, topMatch }: { taste: TasteProfile; brewer: string; setBrewer: (value: string) => void; onNavigate: (tab: Tab) => void; onReorder: () => void; topMatch: typeof COFFEES[number] & { score: number } }) {
  return <>
    <PageIntro eyebrow="One profile · every Deldiet experience" title="Good morning, coffee person." copy="Your Passport connects discovery, brewing, replenishment and origin learning. This guest preview keeps preferences on this device until verified accounts launch." />
    <div className={styles.metricRow}>
      <article><Compass size={20}/><span>Countries explored</span><b>4</b><small>Preview stamps</small></article>
      <article><Heart size={20}/><span>Current taste</span><b>{taste.note}</b><small>{taste.roast} roast</small></article>
      <article><Award size={20}/><span>Circle balance</span><b>0</b><small>Programme not active</small></article>
      <article><Package size={20}/><span>Next rhythm</span><b>Not scheduled</b><small>Build a request</small></article>
    </div>
    <div className={styles.overviewGrid}>
      <article className={styles.matchCard}>
        <div><p className={styles.kicker}>Your current match</p><h2>{topMatch.name}</h2><span>{topMatch.origin}</span><p>{topMatch.notes}</p><div className={styles.actionRow}><button className={styles.primary} onClick={onReorder}>Add match to bag <ArrowRight size={16}/></button><button className={styles.secondary} onClick={() => onNavigate("finder")}>Retake Taste Graph</button></div></div>
        <div className={styles.matchArt}><Image src={topMatch.image} alt={`${topMatch.name} coffee package`} fill unoptimized sizes="(max-width: 700px) 100vw, 360px"/><span>Deldiet match</span></div>
      </article>
      <article className={styles.compatibilityCard}><p className={styles.kicker}>Machine & format match</p><h2>What do you brew with?</h2><p>Save one brewer to filter recommendations and prevent incompatible formats.</p><label><span>Primary brewer</span><select value={brewer} onChange={(event) => setBrewer(event.target.value)}>{["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine", "Single-serve brewer"].map((item) => <option key={item}>{item}</option>)}</select></label><div className={styles.compatible}><Check size={15}/><span>{brewer === "Capsule machine" ? "Nespresso Original-compatible capsules" : brewer === "Single-serve brewer" ? "K-Cup-compatible brew cups" : "Whole bean and correctly matched grind"}</span></div></article>
    </div>
    <div className={styles.sectionHeading}><div><p className={styles.kicker}>Origin Passport</p><h2>A map made by tasting.</h2></div><button onClick={() => onNavigate("finder")}>Find the next country <ArrowRight size={16}/></button></div>
    <div className={styles.stampGrid}>{ORIGIN_STAMPS.map(([code, country, note]) => <article key={code} className={styles.stampMuted}><span>{code}</span><div><b>{country}</b><small>{note}</small></div><em>Preview</em></article>)}</div>
    <div className={styles.capabilityGrid}>{[
      [WandSparkles, "Taste Graph", "A recommendation that changes with your ratings and rituals.", "finder"],
      [RefreshCw, "Deldiet Rhythm", "A flexible replenishment request with swap, skip and pause controls planned.", "rhythm"],
      [Timer, "Brew Lab", "Method recipes, ratio calculator and a guided timer.", "brew"],
      [Gift, "Gift Studio", "Scheduled journeys and recipient-led taste discovery.", "gifts"],
    ].map(([Icon, title, copy, target]) => { const C = Icon as typeof Compass; return <button key={String(title)} onClick={() => onNavigate(target as Tab)}><C size={21}/><b>{String(title)}</b><span>{String(copy)}</span><ArrowRight size={16}/></button>; })}</div>
  </>;
}

const QUESTION_OPTIONS: Array<{ key: keyof TasteProfile; label: string; options: string[] }> = [
  { key: "note", label: "Which flavours pull you in?", options: ["Chocolate & nuts", "Caramel & sweet", "Floral & citrus", "Fruit-forward", "Deep & earthy"] },
  { key: "roast", label: "Choose your roast direction", options: ["Light", "Medium", "Medium-dark"] },
  { key: "brew", label: "How will you make it?", options: ["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine"] },
  { key: "adventure", label: "How far should Deldiet take you?", options: ["1", "2", "3", "4", "5"] },
];

function TasteGraph({ taste, updateTaste, matches, onAdd, onContinue }: { taste: TasteProfile; updateTaste: (key: keyof TasteProfile, value: string) => void; matches: Array<typeof COFFEES[number] & { score: number }>; onAdd: () => void; onContinue: () => void }) {
  return <>
    <PageIntro eyebrow="Adaptive coffee finder" title="Build your Taste Graph." copy="Four transparent choices create a first recommendation. Save future cup ratings to make the graph more useful over time." />
    <div className={styles.finderGrid}>
      <div className={styles.questionStack}>{QUESTION_OPTIONS.map((question, index) => <fieldset key={question.key}><legend><span>{String(index + 1).padStart(2, "0")}</span>{question.label}</legend><div className={styles.choiceGrid}>{question.options.map((option) => <button type="button" key={option} className={taste[question.key] === option ? styles.selected : ""} aria-pressed={taste[question.key] === option} onClick={() => updateTaste(question.key, option)}>{question.key === "adventure" ? <><b>{option}</b><small>{option === "1" ? "Comforting" : option === "5" ? "Surprise me" : ""}</small></> : option}</button>)}</div></fieldset>)}</div>
      <aside className={styles.resultPanel}><p className={styles.kicker}>Live recommendation</p><div className={styles.tasteRadar} aria-label={`Taste profile: ${taste.note}, ${taste.roast}, adventure ${taste.adventure} of 5`}><i style={{ "--taste": `${Number(taste.adventure) * 20}%` } as CSSProperties}/><span>{taste.adventure}/5</span></div><h2>{matches[0].name}</h2><p className={styles.resultOrigin}>{matches[0].origin}</p><strong>{matches[0].notes}</strong><p>{matches[0].why}</p><div className={styles.actionRow}><button className={styles.primary} onClick={onAdd}>Add 250 g to bag</button><button className={styles.secondary} onClick={onContinue}>Build a Rhythm</button></div><div className={styles.runnerUps}><span>Also suited</span>{matches.slice(1, 3).map((item) => <div key={item.id}><b>{item.name}</b><small>{item.origin}</small></div>)}</div></aside>
    </div>
  </>;
}

function ContactFields({ contact, setContact }: { contact: Contact; setContact: (value: Contact) => void }) {
  return <div className={styles.contactGrid}><label><span>Name</span><input required autoComplete="name" maxLength={160} value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })}/></label><label><span>Email</span><input required type="email" autoComplete="email" maxLength={254} value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })}/></label><label><span>Phone <small>optional</small></span><input autoComplete="tel" maxLength={60} value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })}/></label></div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className={styles.selectField}><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function RhythmForm({ plan, setPlan, contact, setContact, pending, onSubmit }: { plan: PlanState; setPlan: (value: PlanState) => void; contact: Contact; setContact: (value: Contact) => void; pending: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const estimate = plan.plan === "Atlas" ? 68 : plan.plan === "Explorer" ? 38 : 22;
  return <>
    <PageIntro eyebrow="Flexible replenishment" title="Set your Deldiet Rhythm." copy="Choose the coffee, format and timing. This creates a plan request for Deldiet review; it does not start billing or an automatic shipment." />
    <form className={styles.formGrid} onSubmit={onSubmit}>
      <div className={styles.formBody}>
        <fieldset className={styles.planPicker}><legend>Choose a plan</legend>{[["Explorer", "Two coffees chosen around your graph"], ["Atlas", "Four rotating origins and tasting lessons"], ["House", "One familiar coffee, repeated your way"]].map(([name, copy]) => <button type="button" key={name} className={plan.plan === name ? styles.selected : ""} aria-pressed={plan.plan === name} onClick={() => setPlan({ ...plan, plan: name })}><span>{name}</span><small>{copy}</small></button>)}</fieldset>
        <div className={styles.formFields}>
          <SelectField label="Coffee format" value={plan.format} options={["Whole bean", "Filter ground", "Espresso ground", "Nespresso Original compatible", "K-Cup compatible", "Pocket pour-over"]} onChange={(value) => setPlan({ ...plan, format: value })}/>
          <SelectField label="Brew method" value={plan.brewMethod} options={["Espresso machine", "Pour-over", "French press", "AeroPress", "Batch brewer", "Capsule machine", "Single-serve brewer"]} onChange={(value) => setPlan({ ...plan, brewMethod: value })}/>
          <SelectField label="Cadence" value={plan.cadence} options={["Every week", "Every 2 weeks", "Every 4 weeks", "Every 6 weeks"]} onChange={(value) => setPlan({ ...plan, cadence: value })}/>
          <SelectField label="Coffee selection" value={plan.selectionMode} options={["Taste Graph chooses", "Deldiet chooses", "I choose"]} onChange={(value) => setPlan({ ...plan, selectionMode: value })}/>
          <label className={styles.selectField}><span>Quantity per delivery</span><input type="number" min="1" max="8" required value={plan.quantity} onChange={(event) => setPlan({ ...plan, quantity: event.target.value })}/></label>
        </div>
        <div className={styles.contactBlock}><h2>Where should Deldiet follow up?</h2><ContactFields contact={contact} setContact={setContact}/></div>
      </div>
      <aside className={styles.summaryCard}><p className={styles.kicker}>Plan preview</p><h2>{plan.plan}</h2><dl><div><dt>Format</dt><dd>{plan.format}</dd></div><div><dt>Cadence</dt><dd>{plan.cadence}</dd></div><div><dt>Quantity</dt><dd>{plan.quantity}</dd></div><div><dt>Selection</dt><dd>{plan.selectionMode}</dd></div></dl><strong>Estimated from ${estimate}<small> CAD / delivery</small></strong><p>Availability, taxes, shipping, final price and payment are confirmed only after review.</p><button className={styles.primary} type="submit" disabled={Boolean(pending)}>{pending === "passport-rhythm" ? "Saving…" : "Save plan request"}<ArrowRight size={16}/></button></aside>
    </form>
  </>;
}

function BrewLab({ method, setMethod, recipe, servings, setServings, strength, setStrength, dose, water, timeLabel, running, secondsLeft, setRunning, reset }: { method: keyof typeof BREW_METHODS; setMethod: (value: keyof typeof BREW_METHODS) => void; recipe: typeof BREW_METHODS[keyof typeof BREW_METHODS]; servings: number; setServings: (value: number) => void; strength: number; setStrength: (value: number) => void; dose: number; water: number; timeLabel: string; running: boolean; secondsLeft: number; setRunning: (value: boolean) => void; reset: () => void }) {
  return <>
    <PageIntro eyebrow="Interactive recipe studio" title="Brew with fewer guesses." copy="Scale a Deldiet starting recipe, follow the sequence and use the built-in timer. Grinder, water and coffee age can change the result—adjust by taste." />
    <div className={styles.methodTabs} role="group" aria-label="Choose brew method">{Object.keys(BREW_METHODS).map((item) => <button key={item} className={method === item ? styles.selected : ""} onClick={() => setMethod(item as keyof typeof BREW_METHODS)} aria-pressed={method === item}>{item}</button>)}</div>
    <div className={styles.brewGrid}>
      <article className={styles.brewControls}><p className={styles.kicker}>Recipe controls</p><div className={styles.stepper}><span>Servings</span><button aria-label="Decrease servings" onClick={() => setServings(Math.max(1, servings - 1))}>−</button><b>{servings}</b><button aria-label="Increase servings" onClick={() => setServings(Math.min(8, servings + 1))}>+</button></div><fieldset><legend>Strength</legend><div className={styles.threeWay}>{[[1, "Gentle"], [2, "Balanced"], [3, "Bold"]].map(([value, label]) => <button key={value} onClick={() => setStrength(Number(value))} className={strength === value ? styles.selected : ""} aria-pressed={strength === value}>{label}</button>)}</div></fieldset><div className={styles.recipeMetrics}><span><small>Coffee</small><b>{dose} g</b></span><span><small>{method === "Espresso" ? "Beverage" : "Water"}</small><b>{water} g</b></span><span><small>Temperature</small><b>{recipe.temp}°C</b></span><span><small>Grind</small><b>{recipe.grind}</b></span></div></article>
      <article className={styles.timerCard}><p className={styles.kicker}>Guided timer</p><div className={styles.timerFace}><span>{timeLabel}</span><small>{secondsLeft === 0 ? "Recipe complete" : running ? "Timer running" : "Ready when you are"}</small></div><div className={styles.timerButtons}><button className={styles.primary} onClick={() => setRunning(!running)} disabled={secondsLeft === 0}>{running ? <Pause size={17}/> : <Play size={17}/>} {running ? "Pause" : "Start"}</button><button className={styles.secondary} onClick={reset}><RotateCcw size={17}/> Reset</button></div></article>
    </div>
    <ol className={styles.brewSteps}>{recipe.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
    <div className={styles.labNote}><Coffee size={18}/><p><b>Dial-in note:</b> if the cup tastes sharp or thin, grind slightly finer; if it tastes dry or harsh, grind slightly coarser. Espresso equipment should be used according to its manufacturer instructions.</p></div>
  </>;
}

function GiftForm({ gift, setGift, contact, setContact, pending, onSubmit }: { gift: GiftState; setGift: (value: GiftState) => void; contact: Contact; setContact: (value: Contact) => void; pending: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <>
    <PageIntro eyebrow="Recipient-led gifting" title="Give a coffee journey, not a guess." copy="Schedule an origin journey, café ritual or brew kit. The recipient can take the Taste Graph before anything is finalized." />
    <form className={styles.editorialForm} onSubmit={onSubmit}>
      <div className={styles.formFields}><SelectField label="Gift format" value={gift.giftType} options={["Origin journey", "Café ritual", "Brew kit", "Digital drink gift"]} onChange={(value) => setGift({ ...gift, giftType: value })}/><SelectField label="Occasion" value={gift.occasion} options={["Birthday", "Thank you", "Celebration", "Client gift", "Just because"]} onChange={(value) => setGift({ ...gift, occasion: value })}/><SelectField label="Timing" value={gift.deliveryWindow} options={["As soon as available", "Within 2 weeks", "Within 1 month", "Choose with Deldiet"]} onChange={(value) => setGift({ ...gift, deliveryWindow: value })}/><SelectField label="Who chooses the coffee?" value={gift.recipientMode} options={["Let recipient take the Taste Graph", "I will choose for them"]} onChange={(value) => setGift({ ...gift, recipientMode: value })}/><label className={styles.selectField}><span>Budget · CAD</span><input type="number" min="25" max="2500" required value={gift.budget} onChange={(event) => setGift({ ...gift, budget: event.target.value })}/></label><label className={`${styles.selectField} ${styles.wide}`}><span>Gift message <small>optional</small></span><textarea maxLength={500} value={gift.message} onChange={(event) => setGift({ ...gift, message: event.target.value })}/></label></div>
      <div className={styles.contactBlock}><h2>Your contact</h2><ContactFields contact={contact} setContact={setContact}/></div>
      <div className={styles.submitStrip}><div><Gift size={22}/><p><b>No gift is charged or sent yet.</b><span>Deldiet will confirm the recipient flow, timing, availability and price.</span></p></div><button className={styles.primary} type="submit" disabled={Boolean(pending)}>{pending === "passport-gift" ? "Saving…" : "Save gift request"}<ArrowRight size={16}/></button></div>
    </form>
  </>;
}

function TeamForm({ team, setTeam, contact, setContact, pending, onSubmit }: { team: TeamState; setTeam: (value: TeamState) => void; contact: Contact; setContact: (value: Contact) => void; pending: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <>
    <PageIntro eyebrow="Coffee for groups" title="Plan the whole coffee system." copy="Scope recurring workplace coffee, hospitality service, an event bar, equipment or training in one structured brief." />
    <div className={styles.teamServices}>{[[Coffee, "Office coffee", "Replenishment by team size, brewer and taste."], [Sparkles, "Event coffee bar", "A staffed Deldiet ritual for gatherings."], [Building2, "Hospitality", "Coffee, equipment and service standards for guest teams."], [Gauge, "Training & equipment", "Brewer planning, setup and practical team guidance."]].map(([Icon, name, copy]) => { const C = Icon as typeof Coffee; return <article key={String(name)}><C size={22}/><b>{String(name)}</b><p>{String(copy)}</p></article>; })}</div>
    <form className={styles.editorialForm} onSubmit={onSubmit}><div className={styles.formFields}><SelectField label="Programme" value={team.programme} options={["Office coffee", "Event coffee bar", "Hospitality programme", "Training & equipment"]} onChange={(value) => setTeam({ ...team, programme: value })}/><SelectField label="Service cadence" value={team.serviceCadence} options={["One-time", "Weekly", "Every 2 weeks", "Monthly", "Not sure yet"]} onChange={(value) => setTeam({ ...team, serviceCadence: value })}/><SelectField label="Current setup" value={team.brewSetup} options={["We need equipment", "Espresso machine", "Batch brewer", "Single-serve", "Mixed setup"]} onChange={(value) => setTeam({ ...team, brewSetup: value })}/><label className={styles.selectField}><span>People served</span><input type="number" min="5" max="5000" required value={team.headcount} onChange={(event) => setTeam({ ...team, headcount: event.target.value })}/></label><label className={styles.selectField}><span>City</span><input required maxLength={120} value={team.city} onChange={(event) => setTeam({ ...team, city: event.target.value })}/></label><label className={`${styles.selectField} ${styles.wide}`}><span>What should Deldiet know? <small>optional</small></span><textarea maxLength={1000} value={team.notes} onChange={(event) => setTeam({ ...team, notes: event.target.value })}/></label></div><div className={styles.contactBlock}><h2>Programme contact</h2><ContactFields contact={contact} setContact={setContact}/></div><div className={styles.submitStrip}><div><MapPin size={22}/><p><b>Scope first, quote second.</b><span>No availability, staffing, equipment or final price is assumed by this request.</span></p></div><button className={styles.primary} type="submit" disabled={Boolean(pending)}>{pending === "passport-team" ? "Saving…" : "Save programme brief"}<ArrowRight size={16}/></button></div></form>
  </>;
}
