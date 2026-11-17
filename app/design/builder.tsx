"use client";

import Image from "next/image";
import { ArrowRight, Bookmark, Check, Plus, Snowflake, Sun } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";

type Origin = {
  id: string;
  country: string;
  region: string;
  code: string;
  accent: string;
  roast: string;
  notes: string[];
};

type Recipe = {
  origin: string;
  style: string;
  milk: string;
  finish: string;
  temperature: string;
};

type OrderItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  channel: "cafe";
  image: string;
};

const styles = ["Pour-over", "Flat white", "Espresso", "Cappuccino", "Long black", "Cold brew"];
const milks = ["No milk", "Whole milk", "Oat", "Almond", "Coconut"];
const finishes = ["Pure", "Cacao", "Vanilla bean", "Brown sugar", "Cinnamon"];
const temperatures = ["Hot", "Iced"];
const sections = ["Origin", "Drink", "Milk & finish"];
const storageKey = "deldiet-brewprint-v1";

function recipePrice(recipe: Recipe) {
  let cents = 550;
  if (recipe.style === "Flat white" || recipe.style === "Cappuccino") cents += 125;
  if (recipe.style === "Cold brew") cents += 75;
  if (recipe.milk !== "No milk" && recipe.milk !== "Whole milk") cents += 90;
  if (recipe.finish !== "Pure") cents += 65;
  return cents / 100;
}

function readRecipe(origins: Origin[]): Recipe | null {
  const stored: Partial<Recipe> | null = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (!stored || !origins.some(origin => origin.id === stored.origin) ||
      !styles.includes(stored.style ?? "") || !milks.includes(stored.milk ?? "") ||
      !finishes.includes(stored.finish ?? "") || !temperatures.includes(stored.temperature ?? "")) return null;
  return stored as Recipe;
}

function sameRecipe(a: Recipe, b: Recipe | null) {
  return !!b && a.origin === b.origin && a.style === b.style && a.milk === b.milk &&
    a.finish === b.finish && a.temperature === b.temperature;
}

function ChoiceRow({ label, choices, value, onChange }: {
  label: string; choices: string[]; value: string; onChange: (value: string) => void;
}) {
  return (
    <fieldset className="cs-field">
      <legend>{label}</legend>
      <div>
        {choices.map(choice => (
          <label key={choice} className={value === choice ? "cs-token is-picked" : "cs-token"}>
            <input type="radio" name={label} checked={value === choice} onChange={() => onChange(choice)} />
            {choice}{value === choice && <Check size={15} aria-hidden="true" />}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CupStudio({ origins, serviceMode, onAdd, notify }: {
  origins: Origin[]; serviceMode: string; onAdd: (item: OrderItem) => void; notify: (message: string) => void;
}) {
  const [recipe, setRecipe] = useState<Recipe>({
    origin: origins[0].id, style: styles[0], milk: milks[0], finish: finishes[0], temperature: temperatures[0],
  });
  const [saved, setSaved] = useState<Recipe | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedId = new URLSearchParams(window.location.search).get("origin");
      const requested = origins.find(origin => origin.id === requestedId);
      let previous: Recipe | null = null;
      try { previous = readRecipe(origins); } catch { /* The builder also works without local storage. */ }
      setSaved(previous);
      setRecipe(current => ({
        ...(previous || current),
        origin: requested?.id ?? previous?.origin ?? current.origin,
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [origins]);

  const origin = origins.find(item => item.id === recipe.origin) ?? origins[0];
  const region = origin.region.split(" · ")[0];
  const originName = origin.country + " · " + region;
  const iced = recipe.temperature === "Iced";
  const price = recipePrice(recipe);
  const isSaved = sameRecipe(recipe, saved);
  const cupImage = iced ? "/menu/deldiet-cold-cup.webp" : "/menu/deldiet-hot-cup.webp";

  function update(key: keyof Recipe, value: string) {
    setRecipe(current => ({ ...current, [key]: value }));
  }

  function saveRecipe() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(recipe));
      setSaved(recipe);
      notify("Brewprint saved. It will load next time on this device.");
    } catch {
      notify("Your browser could not save this Brewprint on this device.");
    }
  }

  function addOrder() {
    onAdd({
      id: `cup-${originName}-${recipe.style}-${recipe.milk}-${recipe.finish}-${recipe.temperature}`,
      name: "Custom " + recipe.style,
      detail: [serviceMode, originName, recipe.milk, recipe.finish, recipe.temperature].join(" · "),
      price, channel: "cafe", image: cupImage,
    });
  }

  return (
    <section id="build" className="cup-studio" aria-labelledby="cs-title">
      <div className="cs-shell">
        <header className="cs-intro">
          <h1 id="cs-title">Build a <em>cup.</em></h1>
          <p>Pick your origin, dial in the drink and give it your own finish.</p>
        </header>

        <div className="cs-art" style={{ "--cs-accent": origin.accent } as CSSProperties}>
          <span className="cs-code" aria-hidden="true" key={origin.code}>{origin.code}</span>
          <span className="cs-halo" aria-hidden="true" />
          <Image key={cupImage} src={cupImage} alt="" width={iced ? 306 : 341} height={iced ? 560 : 520}
            priority unoptimized className={iced ? "cs-cup is-iced" : "cs-cup"} />
          <div className="cs-art-head"><span>{origin.country}</span><span>{origin.roast} roast</span></div>
          <div className="cs-art-foot">
            <span className="cs-art-style">{recipe.style}</span>
            <fieldset className="cs-temp">
              <legend className="cs-sr">Serving temperature</legend>
              {temperatures.map(temp => (
                <label key={temp} className={recipe.temperature === temp ? "is-served" : ""}>
                  <input type="radio" name="Serving temperature" checked={recipe.temperature === temp} onChange={() => update("temperature", temp)} />
                  {temp === "Hot" ? <Sun size={16} aria-hidden="true" /> : <Snowflake size={15} aria-hidden="true" />}{temp}
                </label>
              ))}
            </fieldset>
          </div>
        </div>

        <section className="cs-controls" aria-label="Customize your cup">
          <div className="cs-nav" aria-label="Recipe sections" role="group">
            {sections.map((section, i) => (
              <button key={section} type="button" aria-pressed={step === i} aria-controls="cs-options"
                onClick={() => setStep(i)}>{section}</button>
            ))}
          </div>
          <div className="cs-panel" id="cs-options" key={step}>
            {step === 0 && (
              <fieldset className="cs-origin-options">
                <legend>Choose an origin</legend>
                <div className="cs-origin-grid">
                  {origins.map(item => (
                    <label key={item.id} className={origin.id === item.id ? "cs-origin is-picked" : "cs-origin"}>
                      <input type="radio" name="Coffee origin" checked={origin.id === item.id} onChange={() => update("origin", item.id)} />
                      <span className="cs-letter" style={{backgroundColor: item.accent}}>{item.code}</span>
                      <span className="cs-origin-name">{item.country}<small>{item.region.split(" · ")[0]}</small></span>
                      {origin.id === item.id && <Check size={15} aria-hidden="true" />}
                    </label>
                  ))}
                </div>
                <p className="cs-tasting"><strong>Tasting notes</strong><span>{origin.notes.join(" · ")}</span></p>
              </fieldset>
            )}
            {step === 1 && <ChoiceRow label="Choose your drink" choices={styles} value={recipe.style} onChange={value => update("style", value)} />}
            {step === 2 && <>
              <ChoiceRow label="Choose your milk" choices={milks} value={recipe.milk} onChange={value => update("milk", value)} />
              <ChoiceRow label="Choose your finish" choices={finishes} value={recipe.finish} onChange={value => update("finish", value)} />
              <p className="cs-note">Drinks are prepared on shared equipment.</p>
            </>}
            {step < 2 && <button type="button" className="cs-next" onClick={() => setStep(step + 1)}>
              {step === 0 ? "Choose your drink" : "Choose milk & finish"} <ArrowRight size={19} aria-hidden="true" />
            </button>}
          </div>
        </section>

        <aside className="cs-ticket" aria-labelledby="cs-ticket-title">
          <div className="cs-ticket-heading"><h2 id="cs-ticket-title">Your Brewprint</h2><span>Estimated · CAD</span></div>
          <div className="cs-ticket-name"><h3>{recipe.style}</h3><strong>${price.toFixed(2)}</strong></div>
          <p className="cs-ticket-origin">{originName}</p>
          <dl><div><dt>Milk</dt><dd>{recipe.milk}</dd></div><div><dt>Finish</dt><dd>{recipe.finish}</dd></div><div><dt>Serve</dt><dd>{recipe.temperature}</dd></div></dl>
          <div className="cs-ticket-actions">
            <button type="button" className="cs-add" onClick={addOrder}>Add to coffeehouse order <Plus size={19} aria-hidden="true" /></button>
            <button type="button" className="cs-save" onClick={saveRecipe} disabled={isSaved}>
              {isSaved ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
              {isSaved ? "Saved on this device" : "Save Brewprint on this device"}
            </button>
          </div>
          <details className="cs-prep">
            <summary>Preparation details</summary>
            <p>Illustrative caffeine range: {recipe.style === "Espresso" ? "60–90" : recipe.style === "Cold brew" ? "120–180" : "80–140"} mg. The bar confirms preparation time and the final price when reviewing your order.</p>
          </details>
        </aside>
      </div>
    </section>
  );
}
