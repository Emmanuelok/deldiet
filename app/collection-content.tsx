"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Bookmark, Check, Coffee, FileText, Fingerprint, Globe2, Heart, LoaderCircle, Search, ShieldCheck, Trash2, WandSparkles } from "lucide-react";
import { downloadJson, mergePassport, passportData, readLocal, writeLocal } from "@/lib/local-state";

type CatalogueProduct = { id: string; name: string; category: string; description?: string };
type Brewprint = { id: string; name: string; cup: Record<string, string>; createdAt: string };
type Receipt = { reference: string; type: string; status: string; createdAt: string; message: string; updatedAt?: string };
type Collection = { products: string[]; lots: string[]; brewprints: Brewprint[]; receipts: Receipt[] };
type Tab = "products" | "brewprints" | "lots" | "requests";
const RECEIPTS_KEY = "deldiet-receipts-v1";
const EMPTY: Collection = { products: [], lots: [], brewprints: [], receipts: [] };
const TABS = [
  { id: "products" as const, title: "Saved objects", icon: Heart },
  { id: "brewprints" as const, title: "My Brewprints", icon: Coffee },
  { id: "lots" as const, title: "Origin records", icon: Globe2 },
  { id: "requests" as const, title: "My requests", icon: FileText },
];
const REQUEST_LABELS: Record<string, string> = {
  reservation: "Visit interest", newsletter: "Field Notes", concierge: "Concierge question", home_order_review: "Coffee & shop review", founding_batch: "Founding batch", wholesale: "Wholesale enquiry", workplace: "Workplace enquiry", producer: "Producer enquiry", origin_bar_request: "Origin Bar cup", origin_exchange_order_review: "Exchange review", origin_exchange_trade_inquiry: "Trade enquiry", subscription_plan: "Deldiet Rhythm", gift_build: "Gift request", workplace_program: "Team programme",
};
const STATUS_LABELS: Record<string, string> = { submitted_for_review: "Awaiting review", submitted_for_staff_review: "Awaiting staff review", submitted_for_trade_review: "Awaiting trade review", staff_confirmed: "Staff confirmed", payment_required: "Payment instructions pending", paid: "Payment confirmed", preparing: "Preparing", ready: "Ready", cancelled: "Cancelled" };

function record(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
function strings(value: unknown): string[] { return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 180))].slice(0, 100) : []; }
function cleanReceipt(value: unknown): Receipt | null {
  if (!record(value) || typeof value.reference !== "string" || !/^DL-[A-Z]+-[A-F0-9]{20}$/.test(value.reference)) return null;
  if (typeof value.type !== "string" || typeof value.status !== "string" || typeof value.createdAt !== "string") return null;
  return { reference: value.reference, type: value.type.slice(0, 80), status: value.status.slice(0, 80), createdAt: value.createdAt.slice(0, 50), message: typeof value.message === "string" ? value.message.slice(0, 1000) : "Keep this reference for follow-up with Deldiet.", ...(typeof value.updatedAt === "string" ? { updatedAt: value.updatedAt.slice(0, 50) } : {}) };
}
function readCollection(): Collection {
  const saved = passportData();
  const brewprints: Brewprint[] = Array.isArray(saved.brewprints) ? saved.brewprints.filter((item): item is Brewprint => record(item) && typeof item.id === "string" && item.id.length <= 180 && typeof item.name === "string" && record(item.cup) && typeof item.createdAt === "string").slice(0, 100).map((item) => ({ id: item.id, name: item.name.slice(0, 160), createdAt: item.createdAt.slice(0, 50), cup: Object.fromEntries(Object.entries(item.cup).filter(([key, value]) => ["origin", "style", "milk", "finish", "temperature"].includes(key) && typeof value === "string").map(([key, value]) => [key, String(value).slice(0, 180)])) })) : [];
  const raw = readLocal<unknown>(RECEIPTS_KEY, []);
  const receipts = Array.isArray(raw) ? raw.map(cleanReceipt).filter((item): item is Receipt => item !== null).slice(0, 100) : [];
  return { products: strings(saved.savedProducts), lots: strings(saved.savedLots), brewprints, receipts };
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" });
}
function readable(value: string) { return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default function CollectionContent({ products = [], productImages = {}, onOpenProduct }: { products?: CatalogueProduct[]; productImages?: Record<string, string>; onOpenProduct?: (id: string) => void }) {
  const [collection, setCollection] = useState<Collection>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [notice, setNotice] = useState("");
  const [reference, setReference] = useState("");
  const [token, setToken] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [result, setResult] = useState<Receipt | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const sync = () => { setCollection(readCollection()); setHydrated(true); };
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener("storage", sync);
    window.addEventListener("deldiet:storage", sync);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("storage", sync); window.removeEventListener("deldiet:storage", sync); controller.current?.abort(); controller.current = null; };
  }, []);

  const total = collection.products.length + collection.lots.length + collection.brewprints.length;
  function remove(kind: Tab, id: string) {
    let success = false;
    if (kind === "requests") success = writeLocal(RECEIPTS_KEY, collection.receipts.filter((item) => item.reference !== id));
    else if (kind === "products") success = mergePassport({ savedProducts: collection.products.filter((item) => item !== id) });
    else if (kind === "lots") success = mergePassport({ savedLots: collection.lots.filter((item) => item !== id) });
    else success = mergePassport({ brewprints: collection.brewprints.filter((item) => item.id !== id) });
    setNotice(success ? kind === "requests" ? "Receipt removed from this device. The submitted request is unchanged." : "Removed from your collection." : "This device could not update your collection. Please try again.");
  }
  function exportCollection() {
    const saved = passportData();
    const taste = record(saved.taste) ? Object.fromEntries(Object.entries(saved.taste).filter(([key, value]) => ["note", "roast", "brew", "adventure"].includes(key) && typeof value === "string")) : undefined;
    downloadJson("deldiet-my-collection.json", { format: "deldiet-collection-v1", exportedAt: new Date().toISOString(), savedProducts: collection.products.map((id) => ({ id, name: products.find((item) => item.id === id)?.name || readable(id) })), savedLots: collection.lots, brewprints: collection.brewprints, taste, brewer: typeof saved.brewer === "string" ? saved.brewer : undefined, requests: collection.receipts });
    setNotice("Your collection export is ready. It contains preferences, saved items and public request details.");
  }
  async function trackRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tracking) return;
    const normalizedReference = reference.trim().toUpperCase();
    const privateToken = token.trim();
    setTrackingError(""); setResult(null);
    if (!/^DL-[A-Z]+-[A-F0-9]{20}$/.test(normalizedReference) || privateToken.length < 16 || privateToken.length > 128) { setTrackingError("Enter the complete request reference and its private tracking token."); return; }
    const active = new AbortController();
    controller.current = active;
    const timeout = window.setTimeout(() => active.abort(), 15000);
    setTracking(true);
    try {
      const query = new URLSearchParams({ reference: normalizedReference });
      const response = await fetch(`/api/requests?${query.toString()}`, { signal: active.signal, cache: "no-store", headers: { Accept: "application/json", "X-Request-Token": privateToken }, referrerPolicy: "no-referrer" });
      const body: unknown = await response.json();
      const receipt = record(body) ? cleanReceipt(body.request) : null;
      if (!response.ok || !receipt) throw new Error(record(body) && typeof body.error === "string" ? body.error : "The request status could not be retrieved. Please try again.");
      setResult(receipt);
      setReference(receipt.reference);
    } catch (error) {
      if (controller.current === active) setTrackingError(active.signal.aborted ? "The lookup took too long. Please try again." : error instanceof Error ? error.message : "The request status could not be retrieved.");
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === active) { controller.current = null; setTracking(false); setToken(""); }
    }
  }

  return <section className="dc-collection" id="my-collection" aria-labelledby="collection-title">
    <div className="dc-collection-heading">
      <div><p className="dc-kicker"><Bookmark size={16} /> YOUR PERSONAL COFFEE SHELF</p><h2 id="collection-title">Keep the things<br /><em>you come back to.</em></h2><p>A favourite object. A cup made your way. An origin worth remembering. Your Deldiet collection lives here, on this device.</p></div>
      <div className="dc-collection-summary"><div className="dc-summary-orbit" aria-hidden="true"><i /><i /><Coffee size={30} /></div><strong>{String(total).padStart(2, "0")}</strong><span>things worth keeping</span><button className="dc-outline-button" onClick={exportCollection} disabled={!hydrated}><ArrowDownToLine size={17} /> Export collection</button></div>
    </div>

    <div className="dc-collection-tabs" role="group" aria-label="Collection categories">{TABS.map(({ id, title, icon: Icon }) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => { setTab(id); setNotice(""); }} className={tab === id ? "is-active" : ""}><Icon size={19} /><span>{title}</span><b>{collection[id === "requests" ? "receipts" : id].length}</b></button>)}</div>
    {notice && <p className="dc-collection-notice" role="status"><Check size={17} />{notice}</p>}

    {!hydrated ? <div className="dc-collection-loading" role="status"><LoaderCircle size={24} /> Opening your collection…</div> : <>
      {tab === "products" && (collection.products.length ? <div className="dc-saved-grid">{collection.products.map((id) => {
        const product = products.find((item) => item.id === id);
        const image = (typeof productImages[id] === "string" ? productImages[id] : undefined);
        return <article className="dc-saved-card" key={id}><div className="dc-saved-art">{image ? <Image src={image} alt={product?.name || readable(id)} fill unoptimized sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw" /> : <Coffee size={58} strokeWidth={1} />}<span><Heart size={14} fill="currentColor" /> SAVED</span></div><div className="dc-saved-body"><p className="dc-kicker">{product?.category || "Deldiet collection"}</p><h3>{product?.name || readable(id)}</h3><p>{product?.description || "A little something for your daily coffee ritual."}</p><div className="dc-card-actions">{onOpenProduct && product ? <button onClick={() => onOpenProduct(id)}>View object <ArrowRight size={17} /></button> : <Link href="/shop">Explore the shop <ArrowRight size={17} /></Link>}<button className="dc-remove-button" onClick={() => remove("products", id)} aria-label={`Remove ${product?.name || readable(id)} from saved objects`}><Trash2 size={17} /></button></div></div></article>;
      })}</div> : <Empty icon={Heart} title="Find your next everyday favourite." copy="Tap Save for later on a shop product to keep it here. Build a small collection of coffee, equipment and objects you love." href="/shop" action="Explore the shop" />)}

      {tab === "brewprints" && (collection.brewprints.length ? <div className="dc-brewprint-grid">{collection.brewprints.map((brewprint, index) => <article className="dc-brewprint-card" key={brewprint.id}><div className="dc-brewprint-top"><span>BREWPRINT / {String(index + 1).padStart(2, "0")}</span><Fingerprint size={35} strokeWidth={1.2} /></div><h3>{brewprint.name || "My signature cup"}</h3><p>{brewprint.cup.origin || "Your chosen origin"}</p><dl>{Object.entries(brewprint.cup).filter(([key]) => key !== "origin").map(([key, value]) => <div key={key}><dt>{readable(key)}</dt><dd>{value}</dd></div>)}</dl><div className="dc-brewprint-bottom"><span>Saved {dateLabel(brewprint.createdAt)}</span><div className="dc-card-actions"><Link href={`/build-a-cup?recipe=${encodeURIComponent(brewprint.id)}`}>Make it again <ArrowRight size={17} /></Link><button className="dc-remove-button" onClick={() => remove("brewprints", brewprint.id)} aria-label={`Remove Brewprint ${brewprint.name}`}><Trash2 size={17} /></button></div></div></article>)}</div> : <Empty icon={WandSparkles} title="Your signature cup starts here." copy="Choose an origin, drink, milk and finish in Build a cup, then save your recipe as a Brewprint. Come back and make it your way." href="/build-a-cup" action="Build my first Brewprint" />)}

      {tab === "lots" && (collection.lots.length ? <div className="dc-lot-list">{collection.lots.map((lot) => <article className="dc-lot-card" key={lot}><div className="dc-lot-mark" aria-hidden="true"><Globe2 size={44} strokeWidth={1} /></div><div><p className="dc-kicker">SAVED ORIGIN RECORD</p><h3>{lot === "ET-GUJI-2608" ? "Ethiopia · Guji" : readable(lot)}</h3><code>{lot}</code><p>Illustrative sourcing record. Producer, harvest and roast evidence still require verification.</p></div><div className="dc-lot-actions"><Link href="/trace">Explore traceability <ArrowRight size={17} /></Link><button className="dc-remove-button" onClick={() => remove("lots", lot)} aria-label={`Remove origin record ${lot}`}><Trash2 size={17} /></button></div></article>)}</div> : <Empty icon={Globe2} title="Every cup has a place." copy="Explore how a coffee lot connects to its origin, processing and roast, then save an illustrative record to revisit the story." href="/trace" action="Explore an origin record" />)}

      {tab === "requests" && <div className="dc-request-layout"><div className="dc-request-history"><div className="dc-section-title"><div><p className="dc-kicker">YOUR REFERENCE FILE</p><h3>Keep the next step close.</h3></div>{collection.receipts.length > 0 && <button className="dc-quiet-button" onClick={() => downloadJson("deldiet-request-references.json", { exportedAt: new Date().toISOString(), requests: collection.receipts })}><ArrowDownToLine size={17} /> Export</button>}</div><p className="dc-history-note">These are saved request details from this device. A reference records a submission; it does not by itself confirm an order, booking or payment.</p>{collection.receipts.length ? collection.receipts.map((receipt) => <article className="dc-receipt-card" key={receipt.reference}><div className="dc-receipt-top"><span>{REQUEST_LABELS[receipt.type] || readable(receipt.type)}</span><small>{STATUS_LABELS[receipt.status] || readable(receipt.status)}</small></div><code>{receipt.reference}</code><p>{receipt.message}</p><div className="dc-receipt-bottom"><span>{dateLabel(receipt.createdAt)} · saved status</span><div><button onClick={() => { setReference(receipt.reference); document.getElementById("collection-tracking-token")?.focus(); }} aria-label={`Look up request ${receipt.reference}`}><Search size={17} /></button><button onClick={() => downloadJson(`deldiet-${receipt.reference.toLowerCase()}.json`, receipt)} aria-label={`Download request ${receipt.reference}`}><ArrowDownToLine size={17} /></button><button onClick={() => remove("requests", receipt.reference)} aria-label={`Remove local receipt ${receipt.reference}`}><Trash2 size={17} /></button></div></div></article>) : <div className="dc-request-empty"><FileText size={32} strokeWidth={1.2} /><h4>Your references will live here.</h4><p>After a request is successfully saved, its public reference can appear in this collection. Removing a receipt here does not cancel a submitted request.</p></div>}</div>
        <aside className="dc-tracking-card"><div className="dc-tracking-icon"><ShieldCheck size={26} /></div><p className="dc-kicker">PRIVATE STATUS LOOKUP</p><h3>Pick up where<br /><em>you left off.</em></h3><p>Use your request reference and private tracking token to retrieve the status from Deldiet.</p><form onSubmit={trackRequest}><label htmlFor="collection-tracking-reference">Request reference<input id="collection-tracking-reference" required maxLength={60} autoComplete="off" spellCheck={false} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="DL-HOME-…" /></label><label htmlFor="collection-tracking-token">Private tracking token<input id="collection-tracking-token" type="password" required minLength={16} maxLength={128} autoComplete="off" spellCheck={false} value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste your private token" /></label><p className="dc-token-note">Your token is used only for this lookup. It is not saved in your collection or included in exports.</p><button type="submit" className="dc-primary-button" disabled={tracking} aria-busy={tracking}>{tracking ? <LoaderCircle size={18} /> : <Search size={18} />}{tracking ? "Checking status…" : "Check my request"}</button></form>{trackingError && <p className="dc-tracking-error" role="alert">{trackingError}</p>}{result && <div className="dc-tracking-result" role="status"><span><Check size={16} /> LATEST STATUS</span><h4>{STATUS_LABELS[result.status] || readable(result.status)}</h4><p>{result.message}</p><small>Updated {dateLabel(result.updatedAt || result.createdAt)}</small><button onClick={() => downloadJson(`deldiet-${result.reference.toLowerCase()}.json`, result)}><ArrowDownToLine size={16} /> Download status</button></div>}</aside></div>}
    </>}
    <div className="dc-collection-footer"><ShieldCheck size={19} /><p><b>Your collection, on this device.</b> Saved favourites and recipes stay in this browser. Export a copy to keep them, and avoid saving personal preferences on a shared device.</p><Link href="/passport">Open my Passport <ArrowRight size={16} /></Link></div>
  </section>;
}

function Empty({ icon: Icon, title, copy, href, action }: { icon: typeof Heart; title: string; copy: string; href: string; action: string }) {
  return <div className="dc-collection-empty"><div className="dc-empty-symbol" aria-hidden="true"><i /><Icon size={40} strokeWidth={1.1} /></div><p className="dc-kicker">A LITTLE ROOM FOR DISCOVERY</p><h3>{title}</h3><p>{copy}</p><Link className="dc-primary-button" href={href}>{action}<ArrowRight size={18} /></Link></div>;
}
