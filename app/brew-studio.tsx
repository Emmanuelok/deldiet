"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  ArrowDownToLine, ArrowRight, Bookmark, Check, CheckCircle2, ChevronDown,
  Coffee, Droplets, FlaskConical, Gauge, History, Minus, Pause, Play, Plus,
  RotateCcw, SlidersHorizontal, Star, Thermometer, Timer, Trash2,
} from "lucide-react";
import "./brew-studio.css";

type MethodId = "pour-over" | "french-press" | "aeropress" | "espresso" | "cold-brew";
type Taste = "balanced" | "sharp" | "dry" | "weak" | "strong";
type BrewRecipe = {
  method: MethodId;
  dose: number;
  servings: number;
  ratio: number;
  temperature: number;
  seconds: number;
  grindOffset: number;
};
type BrewTimer = { status: "idle" | "running" | "paused" | "complete"; deadline: number | null; remainingMs: number; totalMs: number };
type JournalEntry = { id: string; date: string; coffee: string; notes: string; rating: number; taste: Taste; recipe: BrewRecipe };
type StudioState = { recipe: BrewRecipe; timer: BrewTimer; checked: number[]; coffee: string; notes: string; rating: number; taste: Taste; journal: JournalEntry[] };
type Method = { id: MethodId; name: string; note: string; short: string; ratio: number; ratioMin: number; ratioMax: number; dose: number; temperature: number; seconds: number; grind: string; image: string; prep: string; capacity: string };

const STORAGE_KEY = "deldiet-brew-studio-v1";
const METHODS: Method[] = [
  { id: "pour-over", name: "Pour-over", note: "Clean & expressive", short: "Filter", ratio: 16, ratioMin: 10, ratioMax: 20, dose: 20, temperature: 94, seconds: 180, grind: "Medium-fine", image: "/products/deldiet-dripper.webp", prep: "Rinse your paper filter and warm the brewer. Place it on a scale, add your ground coffee, then tare.", capacity: "For larger batches, check your brewer capacity. The timer is a starting point; drawdown may take longer." },
  { id: "french-press", name: "French press", note: "Round & full-bodied", short: "Immersion", ratio: 15, ratioMin: 10, ratioMax: 20, dose: 25, temperature: 94, seconds: 300, grind: "Medium-coarse", image: "/products/home-kit.webp", prep: "Warm the carafe and weigh your coffee. Make sure the plunger moves freely before adding hot water.", capacity: "Leave space above the water line. Decant after brewing so the coffee does not keep steeping." },
  { id: "aeropress", name: "AeroPress", note: "Smooth & versatile", short: "Pressure", ratio: 14, ratioMin: 8, ratioMax: 18, dose: 16, temperature: 90, seconds: 120, grind: "Medium-fine", image: "/products/brew-scale.webp", prep: "Use the standard upright position. Fit a rinsed filter and place the brewer securely on a sturdy mug.", capacity: "Amounts are per brew. Repeat the recipe for each serving; do not exceed your brewer’s marked capacity." },
  { id: "espresso", name: "Espresso", note: "Rich & concentrated", short: "Extraction", ratio: 2, ratioMin: 1, ratioMax: 3.5, dose: 18, temperature: 93, seconds: 30, grind: "Fine", image: "/products/espresso-pair.webp", prep: "Use a dose that fits your basket. Dry the basket, distribute the grounds and tamp level. Place a tared cup on your scale.", capacity: "Amounts are per extraction. Repeat for each serving; use beverage weight to stop the shot, with time as a guide." },
  { id: "cold-brew", name: "Cold brew", note: "Mellow & unhurried", short: "Slow steep", ratio: 8, ratioMin: 5, ratioMax: 15, dose: 50, temperature: 4, seconds: 43200, grind: "Coarse", image: "/products/cold-brew-box.webp", prep: "Use a clean covered container and cool water. This recipe makes a concentrate to dilute to your preference.", capacity: "Steep in the refrigerator. Leave room for the grounds, then filter and keep the finished concentrate refrigerated." },
];
const TASTES: { id: Taste; name: string; description: string }[] = [
  { id: "balanced", name: "Just right", description: "Sweet, clear, balanced" },
  { id: "sharp", name: "Too sharp", description: "Sour or underdeveloped" },
  { id: "dry", name: "Too bitter", description: "Harsh or drying" },
  { id: "weak", name: "Too light", description: "Thin or watery" },
  { id: "strong", name: "Too intense", description: "More strength than you want" },
];

function methodFor(id: MethodId) { return METHODS.find((method) => method.id === id) ?? METHODS[0]; }
function recipeFor(id: MethodId): BrewRecipe {
  const method = methodFor(id);
  return { method: id, dose: method.dose, servings: 1, ratio: method.ratio, temperature: method.temperature, seconds: method.seconds, grindOffset: 0 };
}
function idleTimer(seconds: number): BrewTimer { return { status: "idle", deadline: null, remainingMs: seconds * 1000, totalMs: seconds * 1000 }; }
function defaultState(): StudioState { const recipe = recipeFor("pour-over"); return { recipe, timer: idleTimer(recipe.seconds), checked: [], coffee: "", notes: "", rating: 0, taste: "balanced", journal: [] }; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function rounded(value: number) { return Math.round(value * 10) / 10; }
function display(value: number) { return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 1 }).format(value); }
function clock(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return seconds >= 3600 ? `${Math.floor(seconds / 3600)}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function bounded(value: unknown, min: number, max: number): value is number { return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max; }
function validRecipe(value: unknown): value is BrewRecipe {
  if (!isObject(value) || !METHODS.some((method) => method.id === value.method)) return false;
  const method = methodFor(value.method as MethodId);
  return bounded(value.dose, 5, 200) && bounded(value.servings, 1, 6) && Number.isInteger(value.servings) && bounded(value.ratio, method.ratioMin, method.ratioMax) && bounded(value.temperature, method.id === "cold-brew" ? 1 : 75, method.id === "cold-brew" ? 5 : 100) && bounded(value.seconds, method.id === "cold-brew" ? 28800 : 10, method.id === "cold-brew" ? 86400 : 900) && bounded(value.grindOffset, -2, 2) && Number.isInteger(value.grindOffset);
}
function validTaste(value: unknown): value is Taste { return TASTES.some((taste) => taste.id === value); }
function validEntry(value: unknown): value is JournalEntry {
  return isObject(value) && typeof value.id === "string" && value.id.length <= 100 && typeof value.date === "string" && Number.isFinite(Date.parse(value.date)) && typeof value.coffee === "string" && value.coffee.length <= 100 && typeof value.notes === "string" && value.notes.length <= 1200 && bounded(value.rating, 0, 5) && Number.isInteger(value.rating) && validTaste(value.taste) && validRecipe(value.recipe);
}
function restoreState(raw: string | null): StudioState {
  const fallback = defaultState();
  if (!raw) return fallback;
  const value: unknown = JSON.parse(raw);
  if (!isObject(value)) return fallback;
  const recipe = validRecipe(value.recipe) ? value.recipe : fallback.recipe;
  let timer = idleTimer(recipe.seconds);
  if (isObject(value.timer) && ["idle", "running", "paused", "complete"].includes(String(value.timer.status)) && bounded(value.timer.remainingMs, 0, 86400000) && value.timer.totalMs === recipe.seconds * 1000 && value.timer.remainingMs <= value.timer.totalMs) {
    const t = value.timer;
    const candidate = { status: t.status, deadline: t.deadline, remainingMs: t.remainingMs, totalMs: t.totalMs } as BrewTimer;
    if (candidate.status === "running" && bounded(candidate.deadline, 1, Date.now() + candidate.totalMs)) {
      const remainingMs = Math.max(0, candidate.deadline - Date.now());
      timer = remainingMs > 0 ? { ...candidate, remainingMs } : { ...candidate, status: "complete", deadline: null, remainingMs: 0 };
    } else if (candidate.status !== "running") timer = { ...candidate, deadline: null };
  }
  const checked = Array.isArray(value.checked) ? value.checked.filter((item): item is number => typeof item === "number" && Number.isInteger(item) && item >= 0 && item < 4) : [];
  const journal = Array.isArray(value.journal) ? value.journal.filter(validEntry).slice(0, 30) : [];
  return { recipe, timer, checked: [...new Set(checked)], journal, coffee: typeof value.coffee === "string" ? value.coffee.slice(0, 100) : "", notes: typeof value.notes === "string" ? value.notes.slice(0, 1200) : "", rating: bounded(value.rating, 0, 5) && Number.isInteger(value.rating) ? value.rating : 0, taste: validTaste(value.taste) ? value.taste : "balanced" };
}

function brewSteps(recipe: BrewRecipe) {
  const batch = recipe.method === "espresso" || recipe.method === "aeropress" ? 1 : recipe.servings;
  const dose = recipe.dose * batch;
  const water = rounded(dose * recipe.ratio);
  if (recipe.method === "pour-over") return [
    { at: 0, title: "Wake up the coffee", copy: `Pour ${display(rounded(dose * 2.5))} g of water to wet the grounds evenly. Give the brewer a gentle swirl.` },
    { at: 0.25, title: "Build the first pour", copy: `Pour in slow circles until the scale reads ${display(rounded(water * 0.55))} g total.` },
    { at: 0.5, title: "Bring it to weight", copy: `Add the remaining water in gentle pulses, finishing at ${display(water)} g total.` },
    { at: 0.75, title: "Let the cup reveal itself", copy: "Let the water drain through. Remove the brewer, swirl the cup and taste once it cools a little." },
  ];
  if (recipe.method === "french-press") return [
    { at: 0, title: "Saturate the grounds", copy: `Add all ${display(water)} g of water over ${display(dose)} g of coffee.` },
    { at: 0.05, title: "Give it a gentle stir", copy: "Make sure the grounds are wet. Set the lid on top with the plunger raised." },
    { at: 0.8, title: "Break the crust", copy: "Gently stir the surface. Skim any foam if you prefer a cleaner cup." },
    { at: 0.93, title: "Press, then decant", copy: "Press slowly without forcing. Pour the coffee into your cups or a separate carafe." },
  ];
  if (recipe.method === "aeropress") return [
    { at: 0, title: "Coffee, then water", copy: `Add ${display(dose)} g of coffee, then ${display(water)} g of water. Stay below your brewer’s maximum fill line.` },
    { at: 0.12, title: "Stir to combine", copy: "Stir gently for about 10 seconds. Insert the plunger slightly to keep the water in the chamber." },
    { at: 0.75, title: "Press with care", copy: "Keeping the brewer upright and stable, press gently for about 20–30 seconds. Do not force it." },
    { at: 0.98, title: "Make it your own", copy: "Stop pressing, remove the brewer and taste. Add a little hot water if you prefer a lighter cup." },
  ];
  if (recipe.method === "espresso") return [
    { at: 0, title: "Begin your extraction", copy: `Start the machine and timer together. Your target is ${display(water)} g of espresso from ${display(dose)} g of coffee.` },
    { at: 0.25, title: "Watch the flow", copy: "Look for an even flow. Note spraying or an uneven stream for your next adjustment." },
    { at: 0.7, title: "Follow the scale", copy: `Watch the beverage weight as it approaches ${display(water)} g. The target weight matters more than the timer.` },
    { at: 0.95, title: "Stop at your target", copy: "Stop the machine at the target weight. Stir, let it cool slightly and record how it tastes." },
  ];
  return [
    { at: 0, title: "Combine coffee & water", copy: `Add ${display(dose)} g of coarse coffee and ${display(water)} g of cool water to a clean container.` },
    { at: 0.0005, title: "Wet every ground", copy: "Stir thoroughly so there are no dry pockets. Cover the container." },
    { at: 0.001, title: "Let time do its thing", copy: "Place in the refrigerator for the rest of the steep. The timer keeps its deadline when this tab is inactive." },
    { at: 1, title: "Filter & find your balance", copy: "When the timer finishes, filter the concentrate. Dilute a little at a time to taste and keep it refrigerated." },
  ];
}

function NumberField({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (next: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const frame = window.requestAnimationFrame(() => { if (document.activeElement !== inputRef.current) setDraft(String(value)); }); return () => window.cancelAnimationFrame(frame); }, [value]);
  return <label className="bs-number-field"><span>{label}</span><div><input ref={inputRef} type="number" inputMode="decimal" min={min} max={max} step={step} value={draft} onChange={(event) => { const next = event.target.value; setDraft(next); const parsed = Number(next); if (next !== "" && Number.isFinite(parsed) && parsed >= min && parsed <= max) onChange(rounded(parsed)); }} onBlur={() => { const parsed = Number(draft); const next = draft.trim() === "" || !Number.isFinite(parsed) ? value : rounded(clamp(parsed, min, max)); setDraft(String(next)); if (next !== value) onChange(next); }} aria-label={label}/><span>{suffix}</span></div></label>;
}

/** Self-contained content area. Render inside DeldietExperience's shared navigation/footer. */
export function BrewStudioContent() {
  const [state, setState] = useState<StudioState>(defaultState);
  const [storage, setStorage] = useState<"loading" | "available" | "unavailable">("loading");
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [journalMethod, setJournalMethod] = useState<MethodId | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const recipeRef = useRef<HTMLDivElement>(null);
  const method = methodFor(state.recipe.method);
  const perExtraction = ["espresso", "aeropress"].includes(method.id);
  const dose = rounded(state.recipe.dose * (perExtraction ? 1 : state.recipe.servings));
  const water = rounded(dose * state.recipe.ratio);
  const steps = useMemo(() => brewSteps(state.recipe), [state.recipe]);
  const remaining = state.timer.status === "running" && state.timer.deadline !== null ? Math.max(0, state.timer.deadline - now) : state.timer.remainingMs;
  const elapsed = clamp(1 - remaining / state.timer.totalMs, 0, 1);
  const activeStep = steps.reduce((result, step, index) => elapsed >= step.at ? index : result, 0);
  const locked = state.timer.status === "running" || state.timer.status === "paused";
  const filteredJournal = state.journal.filter((entry) => journalMethod === "all" || entry.recipe.method === journalMethod);
  const journal = showAll ? filteredJournal : filteredJournal.slice(0, 4);
  const grind = `${method.grind}${state.recipe.grindOffset < 0 ? ` · ${state.recipe.grindOffset === -2 ? "another step" : "slightly"} finer` : state.recipe.grindOffset > 0 ? ` · ${state.recipe.grindOffset === 2 ? "another step" : "slightly"} coarser` : ""}`;

  function commit(next: StudioState) {
    setState(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorage("available"); return true; }
    catch { setStorage("unavailable"); return false; }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try { setState(restoreState(window.localStorage.getItem(STORAGE_KEY))); setStorage("available"); }
      catch { setStorage("unavailable"); }
      setNow(Date.now());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (state.timer.status !== "running" || state.timer.deadline === null) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= (state.timer.deadline ?? Infinity)) {
        const next: StudioState = { ...state, timer: { ...state.timer, status: "complete", deadline: null, remainingMs: 0 } };
        setState(next);
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorage("available"); } catch { setStorage("unavailable"); }
        setNotice("Your brew timer is complete. Taste your cup, then save what you discover.");
      }
    };
    const interval = window.setInterval(tick, 250);
    const onVisible = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", tick);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", tick); };
  }, [state]);

  function changeRecipe(changes: Partial<BrewRecipe>) {
    const recipe = { ...state.recipe, ...changes };
    commit({ ...state, recipe, timer: idleTimer(recipe.seconds), checked: [] });
  }
  function chooseMethod(id: MethodId) {
    const recipe = recipeFor(id);
    commit({ ...state, recipe, timer: idleTimer(recipe.seconds), checked: [], taste: "balanced" });
    setNotice("");
  }
  function toggleTimer() {
    const time = Date.now();
    setNow(time);
    if (state.timer.status === "running") {
      const left = Math.max(0, (state.timer.deadline ?? time) - time);
      commit({ ...state, timer: { ...state.timer, status: left > 0 ? "paused" : "complete", deadline: null, remainingMs: left } });
    } else {
      const left = state.timer.status === "complete" ? state.timer.totalMs : state.timer.remainingMs;
      commit({ ...state, timer: { ...state.timer, status: "running", deadline: time + left, remainingMs: left }, ...(state.timer.status === "complete" ? { checked: [] } : {}) });
    }
  }
  function resetBrew() { commit({ ...state, timer: idleTimer(state.recipe.seconds), checked: [] }); setNotice("Timer and checklist reset. Your recipe is ready."); }

  const tuning = useMemo(() => {
    const recipe = state.recipe;
    const ratioStep = method.id === "espresso" ? 0.2 : 0.5;
    if (state.taste === "weak") return { title: "Try a little more concentration.", copy: `Keep the coffee dose and reduce ${method.id === "espresso" ? "beverage yield" : "water"} to a 1:${display(clamp(recipe.ratio - ratioStep, method.ratioMin, method.ratioMax))} ratio. Taste again before changing anything else.`, changes: { ratio: rounded(clamp(recipe.ratio - ratioStep, method.ratioMin, method.ratioMax)) } };
    if (state.taste === "strong") return { title: "Give your coffee a little more room.", copy: `Try a 1:${display(clamp(recipe.ratio + ratioStep, method.ratioMin, method.ratioMax))} ratio next time. You can also dilute the cup you already brewed, a little at a time.`, changes: { ratio: rounded(clamp(recipe.ratio + ratioStep, method.ratioMin, method.ratioMax)) } };
    if (state.taste === "sharp") return { title: "Explore a slightly finer grind.", copy: "Try one small adjustment finer on your grinder while keeping dose, water and time the same. Some bright acidity is part of the coffee’s character.", changes: { grindOffset: clamp(recipe.grindOffset - 1, -2, 2) } };
    if (state.taste === "dry") return { title: "Try one small step coarser.", copy: "A slightly coarser grind is a useful next experiment. Keep the other settings the same; roast and water can also affect bitterness.", changes: { grindOffset: clamp(recipe.grindOffset + 1, -2, 2) } };
    return { title: "That one belongs in your journal.", copy: "Save this recipe with the coffee name and a few tasting notes. A good cup is worth being able to repeat.", changes: {} };
  }, [state.recipe, state.taste, method]);
  const canTune = Object.entries(tuning.changes).some(([key, value]) => state.recipe[key as keyof BrewRecipe] !== value);

  function saveBrew() {
    const entry: JournalEntry = { id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, date: new Date().toISOString(), coffee: state.coffee.trim() || "My daily brew", notes: state.notes.trim(), rating: state.rating, taste: state.taste, recipe: { ...state.recipe } };
    const saved = commit({ ...state, journal: [entry, ...state.journal].slice(0, 30) });
    setNotice(saved ? `“${entry.coffee}” is saved in your journal on this browser.` : `“${entry.coffee}” is saved for this session. Browser storage is unavailable; export your journal to keep it.`);
  }
  function repeatBrew(entry: JournalEntry) {
    commit({ ...state, recipe: { ...entry.recipe }, timer: idleTimer(entry.recipe.seconds), checked: [], coffee: entry.coffee, notes: entry.notes, rating: entry.rating, taste: entry.taste });
    setNotice(`Loaded “${entry.coffee}”. Your recipe is ready to brew again.`);
    recipeRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
  function exportJournal() {
    const csv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [["Date", "Coffee", "Method", "Dose per serving (g)", "Servings", "Ratio", "Temperature (C)", "Duration (seconds)", "Grind adjustment", "Rating / 5", "Taste", "Notes"].map(csv).join(","), ...state.journal.map((entry) => [entry.date, entry.coffee, methodFor(entry.recipe.method).name, entry.recipe.dose, entry.recipe.servings, entry.recipe.ratio, entry.recipe.temperature, entry.recipe.seconds, entry.recipe.grindOffset, entry.rating || "Unrated", entry.taste, entry.notes].map((value) => csv(typeof value === "string" && /^\s*[=+\-@\t\r]/.test(value) ? `'${value}` : value)).join(","))];
    const url = URL.createObjectURL(new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "deldiet-brew-journal.csv"; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your brew journal export is ready.");
  }

  return <section id="brew-studio" className="bs-studio">
    <div className="bs-hero">
      <div className="bs-hero-copy"><p className="bs-eyebrow"><span/> THE DELDIET BREW STUDIO</p><h1>Your next cup.<br/><em>Dialled in.</em></h1><p>Part science. Part ritual. Find your recipe, follow the pour, and make every cup a little more yours.</p><a className="bs-hero-link" href="#brew-recipe">Let’s make a good cup <ArrowRight size={20}/></a><div className="bs-hero-details"><span><SlidersHorizontal size={16}/> 5 brew methods</span><span><Timer size={16}/> Guided timer</span><span><Bookmark size={16}/> Your brew journal</span></div></div>
      <div className="bs-hero-image"><Image src="/origin-exchange-brew-gear.png" alt="Coffee brewing equipment for your daily ritual" fill sizes="(max-width: 760px) 100vw, 48vw" priority/><div className="bs-image-caption"><span>THE EVERYDAY, ELEVATED.</span><span>01 / YOUR RITUAL</span></div><div className="bs-floating-note"><Coffee size={23}/><div><strong>Better coffee starts here.</strong><span>One thoughtful adjustment at a time.</span></div></div></div>
    </div>

    <div className="bs-workspace" id="brew-recipe" ref={recipeRef}>
      <div className="bs-section-heading"><div><p className="bs-eyebrow">01 / CHOOSE YOUR APPROACH</p><h2>Make it your method.</h2></div><p>A considered starting point.<br/>An open invitation to experiment.</p></div>
      <div className="bs-methods" role="group" aria-label="Brew method">{METHODS.map((item, index) => <button type="button" key={item.id} className={`bs-method ${method.id === item.id ? "bs-selected" : ""}`} aria-pressed={method.id === item.id} disabled={locked || storage === "loading"} onClick={() => chooseMethod(item.id)}><span className="bs-method-top"><span>0{index + 1}</span>{method.id === item.id ? <CheckCircle2 size={21}/> : <Coffee size={21}/>}</span><strong>{item.name}</strong><span>{item.note}</span></button>)}</div>
      {locked && <p className="bs-lock-note"><Timer size={16}/> Your recipe is held while the timer is active. Reset the timer to change it.</p>}

      <div className="bs-brewing-grid">
        <article className="bs-recipe-card"><div className="bs-card-heading"><span className="bs-eyebrow"><SlidersHorizontal size={16}/> YOUR RECIPE</span><span className="bs-tag">{method.short}</span></div><div className="bs-recipe-title"><h3>{method.name}</h3><span>Made to measure.</span></div>
          <fieldset className="bs-recipe-fields" disabled={locked || storage === "loading"}><legend className="bs-sr-only">Recipe measurements</legend>
            <div className="bs-servings"><div><strong>{perExtraction ? "Number of brews" : "Servings"}</strong><span>{perExtraction ? "Repeat this recipe per serving" : "Scale the whole recipe"}</span></div><div className="bs-stepper"><button type="button" aria-label="One fewer serving" onClick={() => changeRecipe({ servings: Math.max(1, state.recipe.servings - 1) })} disabled={state.recipe.servings === 1}><Minus size={17}/></button><output aria-label="Servings">{state.recipe.servings}</output><button type="button" aria-label="One more serving" onClick={() => changeRecipe({ servings: Math.min(6, state.recipe.servings + 1) })} disabled={state.recipe.servings === 6}><Plus size={17}/></button></div></div>
            <div className="bs-numeric-grid"><NumberField key={`${method.id}-dose`} label="Coffee per serving" value={state.recipe.dose} min={5} max={200} step={0.1} suffix="g" onChange={(dose) => changeRecipe({ dose })}/><NumberField key={`${method.id}-ratio`} label={method.id === "espresso" ? "Coffee : beverage" : "Coffee : water"} value={state.recipe.ratio} min={method.ratioMin} max={method.ratioMax} step={0.1} suffix="1 : x" onChange={(ratio) => changeRecipe({ ratio })}/><NumberField key={`${method.id}-temp`} label={method.id === "cold-brew" ? "Refrigerator target" : "Water temperature"} value={state.recipe.temperature} min={method.id === "cold-brew" ? 1 : 75} max={method.id === "cold-brew" ? 5 : 100} suffix="°C" onChange={(temperature) => changeRecipe({ temperature })}/><NumberField key={`${method.id}-duration`} label="Brew duration" value={method.id === "cold-brew" ? state.recipe.seconds / 3600 : state.recipe.seconds} min={method.id === "cold-brew" ? 8 : 10} max={method.id === "cold-brew" ? 24 : 900} step={method.id === "cold-brew" ? 0.5 : 1} suffix={method.id === "cold-brew" ? "hrs" : "sec"} onChange={(duration) => changeRecipe({ seconds: Math.round(duration * (method.id === "cold-brew" ? 3600 : 1)) })}/></div>
            <div className="bs-grind"><Gauge size={22}/><div><span>GRIND STARTING POINT</span><strong>{grind}</strong></div><button type="button" className="bs-text-button" disabled={state.recipe.grindOffset === 0} onClick={() => changeRecipe({ grindOffset: 0 })}>Reset</button></div>
          </fieldset>
          <div className="bs-recipe-totals"><div><span><Coffee size={16}/> COFFEE</span><strong>{display(dose)}<small>g</small></strong></div><div><span><Droplets size={16}/> {method.id === "espresso" ? "BEVERAGE" : "WATER"}</span><strong>{display(water)}<small>g</small></strong></div></div>
          <p className="bs-recipe-footnote">{perExtraction ? `Per ${method.id === "espresso" ? "extraction" : "brew"} · ${state.recipe.servings} ${state.recipe.servings === 1 ? "serving" : "servings"} · ${display(rounded(state.recipe.dose * state.recipe.servings))} g coffee overall. ` : ""}{method.capacity}</p>
        </article>

        <article className={`bs-timer-card ${state.timer.status === "complete" ? "bs-timer-complete" : ""}`}><div className="bs-card-heading"><span className="bs-eyebrow"><Timer size={16}/> A LITTLE TIME. A BETTER CUP.</span><span className="bs-live-dot" data-running={state.timer.status === "running"}/></div><div className="bs-timer-dial" style={{ "--bs-progress": `${elapsed * 360}deg` } as CSSProperties}><div><span className="bs-timer-state">{state.timer.status === "running" ? "YOUR RITUAL IS UNDERWAY" : state.timer.status === "paused" ? "TAKE YOUR TIME" : state.timer.status === "complete" ? "TIME TO TASTE" : "READY WHEN YOU ARE"}</span><span className="bs-timer-value" role="timer" aria-label={`${clock(remaining)} remaining`}>{clock(remaining)}</span><span className="bs-timer-method">{method.name} <span>·</span> 1:{display(state.recipe.ratio)}</span></div></div><div className="bs-timer-actions"><button type="button" className="bs-primary" onClick={toggleTimer} disabled={storage === "loading"}>{state.timer.status === "running" ? <Pause size={18}/> : <Play size={18}/>} {state.timer.status === "running" ? "Pause brew" : state.timer.status === "paused" ? "Continue brew" : state.timer.status === "complete" ? "Brew again" : "Start brewing"}</button><button type="button" className="bs-timer-reset" aria-label="Reset brew timer and checklist" onClick={resetBrew} disabled={storage === "loading"}><RotateCcw size={20}/></button></div><p className="bs-timer-hint">{state.timer.status === "complete" ? "The timer is complete. Finish by taste and your brewer’s guidance." : "The timer keeps its place when you leave this tab."}</p><div className="bs-timer-next"><span>{state.timer.status === "idle" ? "BEFORE YOU BEGIN" : state.timer.status === "complete" ? "A GOOD MOMENT TO PAUSE" : `STEP ${activeStep + 1} OF ${steps.length}`}</span><p>{state.timer.status === "idle" ? method.prep : state.timer.status === "complete" ? "Swirl. Sip. Notice what you love — and what you might change." : steps[activeStep].copy}</p></div></article>
      </div>

      <section className="bs-sequence" aria-labelledby="bs-sequence-title"><div className="bs-section-heading bs-compact-heading"><div><p className="bs-eyebrow">02 / ENJOY THE PROCESS</p><h2 id="bs-sequence-title">Follow the flow.</h2></div><span className="bs-check-count"><CheckCircle2 size={17}/> {state.checked.length} of {steps.length} steps checked</span></div><ol className="bs-steps">{steps.map((step, index) => { const checked = state.checked.includes(index); const current = state.timer.status !== "idle" && activeStep === index; return <li key={`${method.id}-${index}`} className={`${checked ? "bs-step-checked" : ""} ${current ? "bs-step-current" : ""}`}><button className="bs-step-check" type="button" aria-pressed={checked} aria-label={`${checked ? "Uncheck" : "Complete"} step ${index + 1}: ${step.title}`} disabled={storage === "loading"} onClick={() => commit({ ...state, checked: checked ? state.checked.filter((item) => item !== index) : [...state.checked, index] })}>{checked ? <Check size={21}/> : <span>0{index + 1}</span>}</button><span className="bs-step-time">{clock(Math.round(step.at * state.recipe.seconds) * 1000)}{current && <i>NOW</i>}</span><h3>{step.title}</h3><p>{step.copy}</p></li>; })}</ol><p className="bs-sequence-note">Times are gentle guideposts. Check each step as you go; your equipment, coffee and taste have the final say.</p></section>

      <section className="bs-tasting" aria-labelledby="bs-tasting-title"><div className="bs-tasting-intro"><p className="bs-eyebrow">03 / TASTE. NOTICE. REFINE.</p><h2 id="bs-tasting-title">The best recipe<br/>is <em>your recipe.</em></h2><p>Notice how the cup feels. Make one small adjustment, then come back for another taste.</p><div className="bs-taste-illustration" aria-hidden="true"><Coffee size={50} strokeWidth={1}/><span>Curiosity tastes good.</span></div></div><div className="bs-taste-workbench"><h3>How did your cup taste?</h3><div className="bs-taste-options" role="group" aria-label="Cup taste">{TASTES.map((taste) => <button type="button" key={taste.id} className={state.taste === taste.id ? "bs-selected" : ""} aria-pressed={state.taste === taste.id} disabled={storage === "loading"} onClick={() => commit({ ...state, taste: taste.id })}><span>{taste.name}</span><small>{taste.description}</small>{state.taste === taste.id && <Check size={16}/>}</button>)}</div><div className="bs-tuning"><span className="bs-tuning-icon"><FlaskConical size={23}/></span><div><h4>{tuning.title}</h4><p>{tuning.copy}</p>{state.taste !== "balanced" && <button type="button" className="bs-text-button" onClick={() => { changeRecipe(tuning.changes); setNotice("Your next recipe has been adjusted. Save this version if you would like to keep it."); }} disabled={locked || !canTune || storage === "loading"}>{locked ? "Reset timer to adjust recipe" : canTune ? "Apply to my next brew" : "Adjustment limit reached"}<ArrowRight size={17}/></button>}</div></div></div></section>

      <section className="bs-journal" aria-labelledby="bs-journal-title"><div className="bs-section-heading"><div><p className="bs-eyebrow">04 / KEEP THE GOOD ONES</p><h2 id="bs-journal-title">Your coffee, remembered.</h2></div><p>A personal record of the cups<br/>you’ll want to come back to.</p></div><div className="bs-journal-grid"><form className="bs-journal-form" onSubmit={(event) => { event.preventDefault(); saveBrew(); }}><div className="bs-card-heading"><span className="bs-eyebrow"><Bookmark size={16}/> ADD TO YOUR JOURNAL</span><span className="bs-tag">{method.name}</span></div><label><span>Coffee name</span><input type="text" maxLength={100} placeholder="e.g. Guji Reserve, Sunday morning" value={state.coffee} disabled={storage === "loading"} onChange={(event) => commit({ ...state, coffee: event.target.value })}/></label><fieldset className="bs-rating" disabled={storage === "loading"}><legend>How much did you enjoy it?</legend><div>{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={state.rating >= rating ? "bs-star-active" : ""} aria-label={`Rate ${rating} out of 5 stars`} aria-pressed={state.rating === rating} onClick={() => commit({ ...state, rating: state.rating === rating ? 0 : rating })}><Star size={23}/></button>)}<span>{state.rating ? `${state.rating} / 5` : "Your call"}</span></div></fieldset><label><span>Tasting notes <small>optional</small></span><textarea maxLength={1200} rows={4} placeholder="A little peach, a softer finish. Next time…" value={state.notes} disabled={storage === "loading"} onChange={(event) => commit({ ...state, notes: event.target.value })}/></label><button className="bs-primary" type="submit" disabled={storage === "loading"}><Bookmark size={18}/> Save this brew <ArrowRight size={18}/></button><p className="bs-storage-note">{storage === "unavailable" ? "Browser storage is unavailable. Your journal lasts for this session; export it to keep a copy." : "Saved only in this browser on this device. Keep up to 30 brews; export a copy before clearing browser data."}</p></form>

        <div className="bs-journal-entries"><div className="bs-journal-toolbar"><span><History size={18}/> {state.journal.length} {state.journal.length === 1 ? "saved brew" : "saved brews"}</span><button type="button" className="bs-text-button" disabled={state.journal.length === 0} onClick={exportJournal}><ArrowDownToLine size={16}/> Export</button></div>{state.journal.length > 0 && <label className="bs-history-filter"><span>Filter by method</span><select value={journalMethod} onChange={(event) => { setJournalMethod(event.target.value as MethodId | "all"); setShowAll(false); }}><option value="all">All brew methods</option>{METHODS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}{journal.length === 0 ? <div className="bs-empty-journal"><div><Coffee size={33} strokeWidth={1.3}/></div><h3>{state.journal.length ? "A fresh page for this method." : "Every great cup has a story."}</h3><p>{state.journal.length ? "Choose another method to see your saved brews." : "Save your first brew and start a collection of recipes that taste like you."}</p><span>BREW. TASTE. REMEMBER. REPEAT.</span></div> : <div className="bs-history-list">{journal.map((entry) => <article key={entry.id} className="bs-history-entry"><div className="bs-history-top"><span>{methodFor(entry.recipe.method).name}</span><time dateTime={entry.date}>{new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(new Date(entry.date))}</time></div><h3>{entry.coffee}</h3><p className="bs-history-metrics">{display(entry.recipe.dose)} g / serving <span>·</span> 1:{display(entry.recipe.ratio)} <span>·</span> {entry.recipe.temperature}°C <span>·</span> {clock(entry.recipe.seconds * 1000)}</p>{entry.notes && <p className="bs-history-notes">{entry.notes}</p>}<div className="bs-history-bottom"><span className="bs-history-rating"><Star size={14} fill={entry.rating ? "currentColor" : "none"}/>{entry.rating ? `${entry.rating}/5` : "Unrated"}<span>·</span>{TASTES.find((taste) => taste.id === entry.taste)?.name}</span><div><button type="button" className="bs-text-button" disabled={locked} onClick={() => repeatBrew(entry)}><RotateCcw size={15}/> Brew again</button><button type="button" className="bs-delete" aria-label={`Delete ${entry.coffee}`} onClick={() => setDeleteId(deleteId === entry.id ? null : entry.id)}><Trash2 size={16}/></button></div></div>{deleteId === entry.id && <div className="bs-delete-confirm"><span>Remove this saved brew?</span><button type="button" onClick={() => { commit({ ...state, journal: state.journal.filter((item) => item.id !== entry.id) }); setDeleteId(null); setNotice("Brew removed from your journal."); }}>Remove</button><button type="button" onClick={() => setDeleteId(null)}>Keep</button></div>}</article>)}</div>}{filteredJournal.length > 4 && <button type="button" className="bs-show-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer brews" : `Show all ${filteredJournal.length} brews`}<ChevronDown size={17}/></button>}</div>
      </div></section>
      <div className="bs-closing-note"><Thermometer size={20}/><p>These recipes are starting points, ready for your own adjustments. Follow your brewer’s capacity and handling instructions, and let the taste guide you.</p><span>MADE WITH INTENTION.</span></div>
    </div>
    {notice && <div className="bs-notice" role="status"><CheckCircle2 size={20}/><p>{notice}</p><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
  </section>;
}

export default BrewStudioContent;
