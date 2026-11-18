"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Coffee, Copy, Globe2, Layers3, Minus, Plus, ReceiptText, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { ROASTS, BEAN_NAMES, ORIGINS, CLASSICS, SIGNATURES, MILKS, EXTRACTIONS, CAFFEINE, BOOSTERS, SYRUPS, SWEETENERS, TOPPINGS, SIZES, CUPS } from "@/lib/atelier-options";
import { drinks, places, sizesFor, presets, restoreRecipe, cupPhoto, drinkDefaults, temperaturesFor, recipeRows, allergyNotes } from "./recipes";
import { formatMoney, useAtelierPayment } from "./payment";

const tabs = [
  { id:"recipe", name:"Recipe", icon:Coffee }, {id:"origin",name:"Origin",icon:Globe2},
  {id:"brew",name:"Brew",icon:SlidersHorizontal}, {id:"finish",name:"Finish",icon:Layers3}, {id:"review",name:"Review",icon:ReceiptText},
];
const titles = {recipe:"Craft a cup.",origin:"Find your origin.",brew:"Adjust the brew.",finish:"The finishing touch.",review:"Review your cup."};
const captions = {recipe:"Start with a house recipe, or choose a drink from the menu.",origin:"Explore origins by region, bean and tasting profile.",brew:"Set the roast, extraction, milk and temperature.",finish:"Choose your additions, cup and serving size.",review:"Check the recipe and price before opening Stripe Checkout."};
const draftKey = "deldiet-atelier-recipe-v2";

function Picker({label, value, options, onChange}) {
  return <label className="at-picker"><span>{label}</span><span className="at-select-shell"><select value={value} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
  </select><ChevronDown size={16} aria-hidden="true"/></span></label>;
}

function Choices({label, value, options, onChange, multi = false, max}) {
  const selected = (option) => multi ? value.includes(option) : option === value;
  function choose(option) {
    if (!multi) return onChange(option);
    onChange(selected(option) ? value.filter((item) => item !== option) : [...value,option].sort());
  }
  return <fieldset className="at-choices"><legend>{label}</legend><div>{options.map((option) => <button type="button"
    key={option} aria-pressed={selected(option)} disabled={multi && !selected(option) && max && value.length >= max}
    onClick={() => choose(option)}>{selected(option) && <Check size={14}/>} {option}</button>)}</div></fieldset>;
}

function Quantity({label, value, min, max, onChange}) {
  return <div className="at-quantity"><span>{label}</span><div>
    <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value-1)}><Minus size={15}/></button>
    <output aria-label={label}>{value}</output><button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value+1)}><Plus size={15}/></button>
  </div></div>;
}

function OriginPanel({recipe, patch}) {
  const [region, setRegion] = useState("All regions");
  const [bean, setBean] = useState("All beans");
  const [query, setQuery] = useState("");
  const list = places.filter((item) => (region === "All regions" || item.region === region) && (bean === "All beans" || item.b.includes(bean)) && (item.n+" "+item.t).toLowerCase().includes(query.trim().toLowerCase()));
  const current = places.find((item) => item.n === recipe.origin);
  return <>
    <div className="at-place-note"><span className="at-overline">Selected origin</span><h3>{current.n}</h3><p>{current.t}</p><small>{current.region} · {current.b.map((code) => BEAN_NAMES[code]).join(", ")}</small></div>
    <div className="at-pair"><Picker label="Region" value={region} options={["All regions",...Object.keys(ORIGINS)]} onChange={setRegion}/>
      <Picker label="Bean" value={bean} options={["All beans",...Object.entries(BEAN_NAMES).map(([key,name]) => ({value:key,label:name}))]} onChange={setBean}/></div>
    <label className="at-input"><span>Find an origin or tasting note</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Country or flavour"/></label>
    <div className="at-place-list" role="group" aria-label="Origins">{list.map((item) => <button type="button" key={item.n}
      aria-pressed={item.n === recipe.origin} onClick={() => patch({origin:item.n})}><span><b>{item.n}</b><small>{item.t}</small></span>{item.n === recipe.origin ? <Check size={18}/> : <ChevronRight size={16}/>}</button>)}</div>
    {!list.length && <div className="at-notice">No origins match these filters. <button type="button" onClick={() => {setQuery("");setRegion("All regions");setBean("All beans");}}>Clear filters</button></div>}
  </>;
}

function StatusBanner({payment, onDismiss, onRetry}) {
  if (!payment) return null;
  const states = {
    paid:["Payment received", `Stripe confirmed ${formatMoney(payment.amountTotal,payment.currency)||"your payment"}${payment.reference ? " · "+payment.reference : ""}.`],
    failed:["Payment unsuccessful","The payment could not be completed. Review the recipe and start a new checkout to try again."],
    pending:["Payment processing","Stripe is still confirming this payment."], open:["Checkout is open","Payment has not been confirmed."],
    expired:["Checkout expired","Review your cup to request a fresh price."], cancelled:["Checkout cancelled","Your recipe is ready to edit or review."],
    checking:["Checking payment","Verifying your checkout with Stripe."], unknown:["Payment status unavailable","Check your Stripe receipt or retry verification before placing another order."],
  };
  const [title,body] = states[payment.status] || states.unknown;
  return <div className="at-return" role="status"><div><b>{title}</b><p>{body}</p>
    {payment.status === "paid" && payment.pickup && <p>{[payment.pickup.name,payment.pickup.address].filter(Boolean).join(" · ")}</p>}
    {["unknown","pending","open"].includes(payment.status) && <button type="button" onClick={onRetry}>Check status</button>}</div><button aria-label="Dismiss checkout status" onClick={onDismiss}><X size={18}/></button></div>;
}

export default function Atelier() {
  const [recipe, setRecipe] = useState(presets[0].recipe);
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [ack, setAck] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState("");
  const [menu, setMenu] = useState("Classics");
  const [activePreset, setActivePreset] = useState(presets[0].name);
  const work = useRef(null);
  const saveText = useRef(null);
  const payment = useAtelierPayment(recipe,quantity);
  const tab = tabs[step].id;
  const drink = drinks.find((item) => item.n === recipe.drink);
  const origin = places.find((item) => item.n === recipe.origin);
  const roast = ROASTS.find((item) => item.id === recipe.roast);
  const size = SIZES.find((item) => item.id === recipe.size);
  const rows = recipeRows(recipe);
  const allergens = allergyNotes(recipe);
  const quote = payment.quote;
  const available = Boolean(quote?.available && quote.quoteId && Number.isInteger(quote.subtotal));
  const total = available ? formatMoney(quote.subtotal,quote.currency) : null;
  const liveDrinks = payment.catalogue?.items?.filter((item) => item.kind === "drink" && item.recipe && restoreRecipe(item.recipe)) || [];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(draftKey) || "null");
        const legacy = saved ? null : JSON.parse(window.sessionStorage.getItem("deldiet-origin-bar-draft") || "null");
        const oldRecipe = legacy?.sel;
        const restored = restoreRecipe(saved?.recipe || (oldRecipe && {
          ...presets[0].recipe, ...oldRecipe, origin:oldRecipe.origin || presets[0].recipe.origin, drink:oldRecipe.drink || presets[0].recipe.drink,
        }));
        if (restored) {
          setRecipe(restored); setActivePreset(""); setMenu(SIGNATURES.some((item) => item.n === restored.drink) ? "Signatures" : "Classics");
          if (Number.isInteger(saved?.quantity) && saved.quantity >= 1 && saved.quantity <= 10) setQuantity(saved.quantity);
        }
      } catch { /* Browsing works with storage disabled. */ }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(draftKey,JSON.stringify({recipe,quantity})); } catch { /* Device storage is optional. */ }
  }, [hydrated,recipe,quantity]);

  function go(next) {
    setStep(next); setCopied("");
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 850px)").matches) {
      requestAnimationFrame(() => work.current?.scrollIntoView({behavior:"instant",block:"start"}));
    }
  }
  function patch(values) {
    if (payment.checkout.busy) return;
    setRecipe((current) => ({...current,...values})); setAck(false); setActivePreset(""); setCopied("");
  }
  function apply(next, label) {
    setRecipe(next); setAck(false); setCopied(""); setActivePreset(label);
    setMenu(SIGNATURES.some((item) => item.n === next.drink) ? "Signatures" : "Classics");
  }
  async function copyRecipe() {
    const text = ["Deldiet Origin Atelier",...rows.map(([key,value]) => `${key} — ${value}`),`Quantity — ${quantity}`].join("\n");
    try { await navigator.clipboard.writeText(text); setCopied("Copied to clipboard"); }
    catch { if (saveText.current) {saveText.current.hidden = false; saveText.current.value = text; saveText.current.focus(); saveText.current.select();} setCopied("Select and copy your recipe below"); }
  }

  const priceState = !payment.catalogue ? "Checking pricing…" : payment.catalogue.mode === "unavailable" ? "Live price unavailable" : !quote ? "Updating price…" : !available ? "Price unavailable for this cup" : null;

  return <main className="atelier">
    <a className="at-skip" href="#atelier-controls">Skip to cup controls</a>
    <header className="at-header"><Link href="/" aria-label="Deldiet home"><Image src="/brand/deldiet-wordmark.png" width={432} height={129} alt="Deldiet" priority unoptimized/></Link>
      <nav aria-label="Deldiet navigation"><a href="/coffeehouse">Coffeehouse</a><a href="/origins">Origins</a><a href="/shop">Shop <ArrowUpRight size={15}/></a></nav></header>
    <StatusBanner payment={payment.payment} onRetry={payment.retry} onDismiss={payment.dismissPayment}/>
    <div className="at-workbench">
      <aside className="at-scene" aria-labelledby="atelier-title">
        <Image key={cupPhoto(recipe)} className="at-cup-photo" src={cupPhoto(recipe)} alt={`Cup preview: ${recipe.temp.toLowerCase()} coffee, ${recipe.milk.toLowerCase()}.`} width={627} height={627} priority unoptimized/>
        <div className="at-scene-title"><span className="at-overline">Deldiet coffee studio</span><h1 id="atelier-title">Origin <em>Atelier.</em></h1></div>
        <div className="at-scene-foot"><div><span className="at-overline">Cup preview</span><h2>{recipe.drink}</h2><p>{recipe.origin} · {roast.name} roast · {size.oz} oz</p><small>{recipe.temp} · {recipe.milk}</small></div>
          {(recipe.syrups.length + recipe.toppings.length + recipe.boosters.length > 0 || recipe.sweetener !== "None") && <p className="at-custom-notes">{[...recipe.syrups,...recipe.toppings,...recipe.boosters,...(recipe.sweetener === "None" ? [] : [recipe.sweetener])].join(" · ")}</p>}
          <div className="at-scene-notes">{origin.t.split("·").slice(0,3).map((note) => <span key={note}>{note.trim()}</span>)}</div></div>
      </aside>
      <section className="at-controls" id="atelier-controls" ref={work} aria-labelledby="at-step-title">
        <nav className="at-tabs" aria-label="Recipe steps">{tabs.map((item,index) => <button type="button" key={item.id} aria-current={index === step ? "step" : undefined}
          disabled={payment.checkout.busy} onClick={() => go(index)}><item.icon size={16}/><span>{item.name}</span></button>)}</nav>
        {step > 0 && <div className="at-mobile-cup"><Image src={cupPhoto(recipe)} width={48} height={48} alt="" unoptimized/><div><b>{recipe.drink}</b><span>{recipe.origin} · {recipe.temp} · {size.oz} oz</span></div></div>}
        <div className="at-panel" key={tab}><div className="at-section-intro"><h2 id="at-step-title">{titles[tab]}</h2><p>{captions[tab]}</p></div>
        <fieldset className="at-section-fields" disabled={payment.checkout.busy}><legend className="at-sr">{tabs[step].name} settings</legend>
        {tab === "recipe" && <>
          {liveDrinks.length > 0 && <div className="at-live-menu"><h3>On the priced menu</h3><div>{liveDrinks.map((item) => <button type="button" key={item.id} onClick={() => apply(restoreRecipe(item.recipe),item.id)} aria-pressed={activePreset === item.id}>{item.name} · {formatMoney(item.unitAmount,payment.catalogue.currency)} <ArrowUpRight size={15}/></button>)}</div></div>}
          <div className="at-presets">{presets.map((item) => <button type="button" key={item.name} aria-pressed={activePreset === item.name} onClick={() => apply(item.recipe,item.name)}>
            <Image src={cupPhoto(item.recipe)} width={90} height={90} alt="" unoptimized/><span><b>{item.name}</b><small>{item.note}</small></span>
            {activePreset === item.name && <Check size={15}/>}</button>)}</div>
          <div className="at-menu-select"><div><h3>Drink menu</h3><div className="at-segments" role="group" aria-label="Drink collection">{["Classics","Signatures"].map((group) =>
            <button type="button" key={group} aria-pressed={menu === group} onClick={() => setMenu(group)}>{group}</button>)}</div></div>
            <Picker label={menu === "Classics" ? "House classics" : "Signature recipes"} value={(menu === "Classics" ? CLASSICS : SIGNATURES).some((item) => item.n === recipe.drink) ? recipe.drink : ""}
              options={[{value:"",label:"Choose a drink"},...(menu === "Classics" ? CLASSICS : SIGNATURES).map((item) => item.n)]}
              onChange={(value) => {const item = drinks.find((d) => d.n === value); if(item) patch(drinkDefaults(item));}}/>
            <p className="at-subtle">{drink.d}</p></div>
        </>}
        {tab === "origin" && <OriginPanel recipe={recipe} patch={patch}/>}
        {tab === "brew" && <>
          <fieldset className="at-roast"><legend>Roast profile</legend><div>{ROASTS.map((item) => <button type="button" aria-pressed={recipe.roast === item.id} key={item.id} onClick={() => patch({roast:item.id})}>
            <i style={{background:item.color}} aria-hidden="true"/><span>{item.name}</span></button>)}</div><p>{roast.desc}</p></fieldset>
          <div className="at-pair"><Picker label="Brew method" value={recipe.extraction} options={EXTRACTIONS[drink.fam]} onChange={(extraction) => patch({extraction})}/>
            <Picker label="Milk" value={recipe.milk} options={MILKS.map((item) => item.n)} onChange={(milk) => patch({milk})}/></div>
          <Choices label="Temperature" value={recipe.temp} options={temperaturesFor(drink)} onChange={(temp) => patch({temp})}/>
          <Choices label="Caffeine preference" value={recipe.caffeine} options={CAFFEINE} onChange={(caffeine) => patch({caffeine})}/>
          <div><Quantity label="Extra shots" value={recipe.extraShots} min={0} max={4-drink.sh} onChange={(extraShots) => patch({extraShots})}/><p className="at-brew-count">Total espresso shots · {drink.sh+recipe.extraShots}</p></div>
        </>}
        {tab === "finish" && <>
          <div className="at-pair"><Picker label="Cup size" value={recipe.size} options={sizesFor(drink).map((item) => ({value:item.id,label:`${item.n} · ${item.oz} oz`}))} onChange={(size) => patch({size})}/>
            <Picker label="Cup" value={recipe.cup} options={CUPS.map((item) => item.n)} onChange={(cup) => patch({cup})}/></div>
          <Picker label="Sweetener" value={recipe.sweetener} options={SWEETENERS} onChange={(sweetener) => patch({sweetener,sweetLevel:sweetener==="None"?0:recipe.sweetLevel||2})}/>
          {recipe.sweetener !== "None" && <Quantity label="Sweetness level" min={1} max={4} value={recipe.sweetLevel} onChange={(sweetLevel) => patch({sweetLevel})}/>}
          {[
            {key:"syrups",label:"Flavour syrups",items:SYRUPS}, {key:"toppings",label:"Toppings",items:TOPPINGS.map((item) => item.n)},
            {key:"boosters",label:"Optional add-ins",items:BOOSTERS.map((item) => item.n),max:2},
          ].map((group) => <details className="at-addons" key={group.key}><summary><span><b>{group.label}</b><small>{recipe[group.key].join(", ") || (group.max ? "Choose up to two" : "None selected")}</small></span><ChevronDown size={18}/></summary>
            <Choices label={group.label} value={recipe[group.key]} options={group.items} multi max={group.max} onChange={(items) => patch({[group.key]:items})}/></details>)}
        </>}
        {tab === "review" && <>
          <dl className="at-recipe-list">{rows.map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
          <div className="at-review-inputs"><label className="at-input"><span>Name on the cup <small>(optional)</small></span><input value={name} maxLength={80} autoComplete="off" onChange={(event) => setName(event.target.value)} placeholder="Cup name"/></label>
            <Quantity label="Quantity" min={1} max={10} value={quantity} onChange={(value) => {setQuantity(value);setAck(false);}}/></div>
          <div className="at-allergens"><b>Ingredient review</b><p>{allergens.length ? `Ingredients to check include ${allergens.join(", ")}. ` : ""}The bar uses shared equipment. Ask the team about allergies or dietary requirements before ordering.</p>
            <label><input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)}/> I’ve reviewed my recipe and ingredient information.</label></div>
          {available && <div className="at-lines"><h3>Price breakdown</h3>{(quote.lines||[]).map((line,index) => <div key={line.priceId+"-"+index}><span>{line.name}{line.quantity>1 ? ` × ${line.quantity}` : ""}</span><b>{formatMoney(line.unitAmount*line.quantity,quote.currency)}</b></div>)}
            {payment.catalogue?.pickup && <p>Pickup · {[payment.catalogue.pickup.name,payment.catalogue.pickup.address].filter(Boolean).join(" · ")}</p>}</div>}
          <button type="button" className="at-copy" onClick={copyRecipe}><Copy size={16}/> {copied||"Copy recipe"}</button><textarea aria-label="Copy this recipe" ref={saveText} className="at-copy-area" readOnly hidden/>
        </>}
        </fieldset></div>
        <div className="at-command"><div className="at-price"><span>{total ? `Subtotal · ${quote.currency.toUpperCase()}` : "Recipe price"}</span><strong aria-live="polite">{total || priceState}</strong></div>
          {step < tabs.length-1 ? <button type="button" className="at-next" onClick={() => go(step+1)}>{step === tabs.length-2 ? "Review cup" : `Next · ${tabs[step+1].name}`}<ArrowRight size={17}/></button> :
            <button type="button" className="at-next" disabled={!available || !payment.catalogue?.checkoutAvailable || !ack || payment.checkout.busy} onClick={() => payment.buy(ack,name)}>
              {payment.checkout.busy?"Opening checkout…":"Checkout with Stripe"}<ArrowUpRight size={16}/></button>}</div>
        {step === tabs.length-1 && !available && <div className="at-unavailable"><p>{payment.quote?.message || (payment.catalogue?.mode === "unavailable" ? "You can keep editing or copy this cup while live pricing is unavailable." : "Checkout opens when a current price is available for every selected option.")}</p><button type="button" onClick={payment.retry}><RotateCcw size={14}/> Refresh pricing</button></div>}
        {step === tabs.length-1 && available && !payment.catalogue?.checkoutAvailable && <p className="at-mode-note">{payment.catalogue?.message || "Ordering is temporarily unavailable. You can still copy your recipe."}</p>}
        {payment.catalogue?.mode === "test" && <p className="at-mode-note">Test menu · prices are for testing.</p>}
        {payment.checkout.error && <p role="alert" className="at-error">{payment.checkout.error}</p>}
      </section>
    </div>
    <footer className="at-footer"><a href="/coffeehouse"><ArrowLeft size={16}/> Return to Coffeehouse</a><span>Deldiet Coffee · St. John’s, NL</span><a href="/passport">Coffee Passport <ArrowUpRight size={15}/></a></footer>
  </main>;
}
