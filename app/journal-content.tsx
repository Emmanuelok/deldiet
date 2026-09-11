"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Bookmark, BookOpen, Check, Clock3, X } from "lucide-react";
import { mergePassport, passportData, PASSPORT_KEY } from "@/lib/local-state";
import "./journal-content.css";

type Category = "Brewing" | "Roasting" | "Origins" | "Formats" | "Decaf";
type ArticleSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headings: string[]; rows: string[][] };
  source?: { label: string; url: string };
};
type Article = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  takeaway: string;
  sections: ArticleSection[];
  nextLabel: string;
  nextHref: string;
};

const NESPRESSO_FAQ = "https://www.contact.nespresso.com/faq-3/us/en";
const SWISS_WATER_PROCESS = "https://www.swisswater.com/pages/coffee-decaffeination-process";

export const JOURNAL_ARTICLES: Article[] = [
  {
    id: "brew-ratios", category: "Brewing", title: "Good coffee starts with a useful ratio.",
    summary: "A scale, two numbers, and a repeatable way to make tomorrow’s cup better.",
    image: "/products/brew-scale.webp", imageAlt: "Deldiet coffee brewing scale on a warm stone surface",
    takeaway: "Start with 20 g of coffee and 320 g of brew water. Keep those numbers fixed while you adjust the grind.",
    nextLabel: "Put your ratio to work", nextHref: "/coffee-at-home",
    sections: [
      { title: "Give your recipe a language", paragraphs: ["For filter coffee, a ratio such as 1:16 means one gram of dry coffee for every sixteen grams of water you add. It gives you a recipe you can repeat at another size. A starting point is useful; your preferred flavour is the destination.", "Weighing makes small changes easier to compare. A scoop measures volume, so a heaped spoon and a level spoon can send you in different directions before the kettle is even on."] },
      { title: "Scale the cup you already like", paragraphs: ["Multiply the coffee dose by the second number to find the water amount. Or divide your planned brew water by that number to find the dose. The examples below use 1:16. Your finished drink will weigh less than the water you pour because the grounds retain some of it."], table: { headings: ["Dry coffee", "Brew water", "Starting recipe"], rows: [["15 g", "240 g", "A smaller brew"], ["20 g", "320 g", "An everyday brew"], ["30 g", "480 g", "A larger brew"]] } },
      { title: "Separate strength from flavour balance", paragraphs: ["Strength describes how concentrated the drink feels. Extraction describes what the water has taken from the grounds. They interact, but changing both at once makes a recipe harder to diagnose.", "If a cup tastes balanced but too intense, first try a little hot water in the finished drink. If it tastes thin and sharply sour, check grind, even wetting and brew time before simply adding more coffee. Keep a short note of the change and the result."] },
      { title: "Know when the numbers mean something else", paragraphs: ["Espresso ratios commonly compare dry coffee with the weight of the beverage in the cup. An 18 g dose producing 36 g of espresso is a 1:2 beverage ratio. That is a different convention from a filter recipe measured by water poured.", "Cold-brew concentrate and ready-to-dilute products need their own recipes. Read the label before applying a filter-coffee ratio. When sharing any recipe, name the method and say whether the final number is water added or drink produced."] },
    ],
  },
  {
    id: "reading-roast", category: "Roasting", title: "Read the roast. Then trust your taste.",
    summary: "Light, medium and dark are useful clues. The whole flavour story needs a little more room.",
    image: "/products/house-01.webp", imageAlt: "Deldiet House 01 coffee bag with roasted coffee beans",
    takeaway: "Choose two coffees with different roast descriptions. Brew them at the same ratio and write down what you enjoy, without trying to name every flavour.",
    nextLabel: "Explore coffee by flavour", nextHref: "/discover",
    sections: [
      { title: "Use roast as a direction", paragraphs: ["Roasting transforms green coffee into the aromatic beans we brew. A lighter roast often leaves more room for fruit and floral impressions; darker roasting often brings stronger roast, cocoa and bitter notes. These are tendencies, not promises about every bag.", "There is no universal point where one roaster’s medium becomes another roaster’s dark. Read the tasting notes alongside the roast description and learn how a particular roaster uses its own scale."] },
      { title: "Match the cup to the way you drink it", paragraphs: ["Think about your normal routine. If you add milk, ask whether you prefer a round chocolate-like flavour or a brighter contrast. If you drink coffee black, decide whether a crisp, fruit-like impression or a fuller roast character appeals more.", "An espresso roast label describes the roaster’s intended use. It does not mean the beans can only go into an espresso machine. You can try them in a filter brewer and adjust the recipe to your taste."] },
      { title: "Do not confuse intensity with caffeine", paragraphs: ["An intensity number is a flavour scale whose meaning depends on the brand. Nespresso, for example, defines its intensity through bitterness, body and roast character, rather than caffeine content. Do not use a dark colour or a large intensity number as a caffeine measurement."], source: { label: "Nespresso: how its intensity scale is defined", url: NESPRESSO_FAQ } },
      { title: "Make a comparison you can remember", paragraphs: ["Taste two coffees with the same brewer, dose and water amount. Let each cool a little, then record three plain observations: how bright it seems, how full it feels and whether the finish is pleasant. Everyday comparisons such as cocoa, toast, berry or citrus are enough.", "Change one recipe variable if a coffee does not taste its best on the first attempt. A disappointing brew is not always a disappointing roast. Your notes become more useful when they include the method as well as the bag."] },
    ],
  },
  {
    id: "coffee-processing", category: "Origins", title: "Before the roast, there is the fruit.",
    summary: "Washed, natural and honey: understand what happens between a coffee cherry and a green bean.",
    image: "/origin-exchange-green-lots.png", imageAlt: "Sacks of green coffee with quality-control equipment in an airy coffee warehouse",
    takeaway: "On your next bag, look for the process beside the producer and origin. Treat all three as part of the story.",
    nextLabel: "Explore the coffee collection", nextHref: "/shop",
    sections: [
      { title: "A coffee bean begins inside a cherry", paragraphs: ["What we call a coffee bean is a seed. Before roasting, the fruit around that seed must be removed and the coffee dried. Processing describes that part of the journey. The choices made at this stage can shape the cup, alongside variety, growing conditions and roasting.", "Process names are useful starting points, but they cannot tell you everything about a producer’s work. Drying conditions, sorting and careful handling matter within every method."] },
      { title: "Washed: remove the fruit before drying", paragraphs: ["In a washed process, the skin and much of the fruit are removed, and the remaining sticky mucilage is removed before the parchment-covered coffee is dried. Producers may use fermentation, mechanical equipment or a combination of steps.", "Washed coffees are often described as clear or crisp in the cup. That description is an expectation to explore, not a guarantee of a particular flavour or an automatic quality ranking."] },
      { title: "Natural and honey: different drying choices", paragraphs: ["A natural process dries coffee with the fruit still around the seed. A honey process removes the skin but leaves some mucilage during drying. The word honey describes that sticky fruit material; it does not mean honey has been added.", "These methods can contribute fruit-like sweetness or a different texture, but the result depends on the coffee and how it is handled. Colour labels used for honey processes are not a universal scale across all producers."] },
      { title: "Ask a better question than “which is best?”", paragraphs: ["Ask what you enjoy and what you can learn about the lot. A washed coffee and a natural coffee from the same region can offer a revealing comparison, especially when their roast styles are similar.", "Read a detailed process description when one is available. A term such as anaerobic describes an oxygen-limited stage; it does not replace all the other steps in the processing story. A label with more detail is more useful than one that only sounds unusual."] },
    ],
  },
  {
    id: "grind-troubleshooting", category: "Brewing", title: "Your grinder is a flavour adjustment.",
    summary: "A practical way to investigate a sour, dry or slow cup without changing everything at once.",
    image: "/products/field-grinder.webp", imageAlt: "A black hand coffee grinder beside its carrying case",
    takeaway: "Write down your current dose, water and grind setting. Change the grind by a small step, then compare the cups after they cool.",
    nextLabel: "Open your home brewing tools", nextHref: "/coffee-at-home",
    sections: [
      { title: "Start with a clean, repeatable setup", paragraphs: ["Before moving the grinder dial, check the basics: a clean brewer, a fresh filter if the method uses one, the same coffee dose and the same amount of water. Make sure all the grounds get wet. A tilted bed or a careless pour can make one brew behave differently from the next.", "Grinder numbers are local to the grinder. Setting 12 on one model is not a portable recipe for another. Record the model as well as the setting when you share your brew."] },
      { title: "Use the taste and the flow together", paragraphs: ["Grinding finer exposes more surface area. In a filter brewer it can also slow the water, so one adjustment may change both extraction and contact time. A small step is easier to learn from than a dramatic jump."], bullets: ["Thin and sharply sour, with unusually fast flow: try a little finer while keeping the rest of the recipe steady.", "Dry or harsh, with unusually slow flow: try a little coarser and a gentler pour.", "Both sour and bitter: check for uneven wetting or channeling before chasing a single grind setting."] },
      { title: "Do not let the timer become the judge", paragraphs: ["A drawdown time is a useful observation, not a flavour score. Different coffees, filters, brewers and pouring patterns can give different times. A tasty cup outside someone else’s time window can still be a good recipe.", "If a filter brew stalls, inspect the filter seating, the amount of fine powder and how aggressively you stirred or poured. Changing the grind is one option; controlling agitation may solve the problem without changing the recipe’s strength."] },
      { title: "Keep a small experiment small", paragraphs: ["For the next brew, change only the grind and repeat the other steps. Taste after the cup cools slightly, and record whether the change improved sweetness, balance or texture. If it did, move in the same direction by another small step only if needed.", "For espresso, also keep the dose and target beverage weight steady while checking puck preparation. A sudden fast shot may come from uneven distribution rather than a grind that is simply too coarse."] },
    ],
  },
  {
    id: "coffee-format-guide", category: "Formats", title: "The right coffee for the brewer you own.",
    summary: "Choose a format around your equipment, your routine and the details on the pack.",
    image: "/products/format-origin-capsules.webp", imageAlt: "Deldiet coffee capsules arranged beside their packaging",
    takeaway: "Before choosing a flavour, check the exact machine model or brewing method. Compatibility comes first.",
    nextLabel: "Explore the coffee formats", nextHref: "/shop",
    sections: [
      { title: "Begin with the equipment", paragraphs: ["A flavour you love is only useful if you can brew it. Whole bean coffee needs a grinder. Ground coffee should match the method. A capsule needs the correct capsule system, while instant coffee is designed to dissolve in water.", "Choose the amount of preparation you want to do on an ordinary morning. There is room for a slower weekend brew and a convenient weekday format in the same kitchen."] },
      { title: "Match the format to the job", paragraphs: ["Use this as a planning guide, then read the individual product instructions."], table: { headings: ["Format", "What to check"], rows: [["Whole bean", "A grinder and a suitable brewer"], ["Ground coffee", "The stated grind and brewing method"], ["Capsule", "Exact machine system and model"], ["Drip bag", "A stable cup and the pack’s pour instructions"], ["Instant", "Dose and water amount on the pack"], ["Concentrate", "Dilution and storage instructions"]] } },
      { title: "A brand name is not enough", paragraphs: ["Check the exact capsule family and machine model, rather than assuming that all capsules from one brand fit every machine. Nespresso’s own support guide lists model-specific compatibility for some Vertuo capsule sizes. That is why a product’s compatibility statement matters more than its appearance.", "If a listing says Original-compatible, do not read it as a general promise about every Nespresso machine. Match the pack to your machine’s instructions before buying."], source: { label: "Nespresso: capsule sizes and machine compatibility", url: NESPRESSO_FAQ } },
      { title: "Keep instructions with the coffee", paragraphs: ["Keep the original pack or take a photo of its brew and storage instructions. For a concentrate, record the suggested dilution before you decant it. For pre-ground coffee, remember the intended brewer so the next order is easy to repeat.", "When giving coffee as a gift, ask one small question first: what does the recipient use to make coffee? The answer helps you choose a gift they can enjoy straight away."] },
    ],
  },
  {
    id: "decaf-explained", category: "Decaf", title: "Decaf deserves a place in the tasting.",
    summary: "Understand the process, read the bag and approach decaf with the same curiosity as any other coffee.",
    image: "/products/huila-decaf.webp", imageAlt: "Deldiet Huila decaf coffee packaging with roasted beans",
    takeaway: "Choose decaf by origin, roast and flavour. Use a familiar starting recipe, then adjust it to the cup in front of you.",
    nextLabel: "Discover your next coffee", nextHref: "/discover",
    sections: [
      { title: "The process comes before the roast", paragraphs: ["Decaffeination takes place while the coffee is green, before roasting. In the Swiss Water process, the beans are hydrated and meet a green coffee extract; caffeine moves into the extract, which is filtered and reused. This describes that named process, not a verified claim about every decaf bag on this site."], source: { label: "Swiss Water: its decaffeination process", url: SWISS_WATER_PROCESS } },
      { title: "Read the method on the actual bag", paragraphs: ["Decaf is a category, not a single method. Nespresso, for example, describes water and carbon-dioxide methods for its decaffeinated coffees. If the process matters to your purchase, look for a named method or ask the roaster for the current lot details.", "Do not infer a process from a country name or a tasting note. A specific process claim needs specific product information."], source: { label: "Nespresso: the methods used for its decaf coffees", url: NESPRESSO_FAQ } },
      { title: "Make flavour the useful comparison", paragraphs: ["Look at the producer or region, roast description and flavour notes just as you would with another coffee. Decaf can still be a carefully selected, thoughtfully roasted part of a coffee menu.", "Brew it with a familiar recipe first. If the flow or taste differs from your usual coffee, adjust the grind in a small step and compare again. Avoid judging the whole category from one bag or one unsuccessful brew."] },
      { title: "Use precise language", paragraphs: ["Decaffeinated does not automatically mean no caffeine remains. For questions about the contents of a particular product, use its current label or ask the producer for information instead of inferring an amount from the roast colour.", "For your tasting notes, stay with the experience in the cup: aroma, brightness, texture, sweetness and finish. You can compare a regular and a decaf brew without expecting them to be identical or declaring one a lesser version of the other."] },
    ],
  },
];

const categories: ("All notes" | Category)[] = ["All notes", "Brewing", "Roasting", "Origins", "Formats", "Decaf"];

function readSavedIds(): string[] {
  const value = passportData().savedArticles;
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string"))] : [];
}

function readingMinutes(article: Article) {
  const words = article.sections.flatMap((section) => [section.title, ...section.paragraphs, ...(section.bullets ?? [])]).join(" ").split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 180));
}

export function JournalContent() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All notes");
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const savedFilterRef = useRef<HTMLButtonElement>(null);
  const activeArticle = JOURNAL_ARTICLES.find((article) => article.id === activeId);
  const featured = JOURNAL_ARTICLES[0];
  const visible = JOURNAL_ARTICLES.filter((article) => (category === "All notes" || article.category === category) && (!savedOnly || savedIds.includes(article.id)));
  const savedCount = JOURNAL_ARTICLES.filter((article) => savedIds.includes(article.id)).length;

  useEffect(() => {
    const sync = () => setSavedIds(readSavedIds());
    const onStorage = (event: StorageEvent) => { if (event.key === PASSPORT_KEY || event.key === null) sync(); };
    sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("deldiet:storage", sync);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("deldiet:storage", sync); };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !activeId) return;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    return () => { window.cancelAnimationFrame(frame); document.body.style.overflow = previousOverflow; };
  }, [activeId]);

  function openArticle(id: string) {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveId(id);
  }

  function closeArticle() {
    dialogRef.current?.close();
    setActiveId(null);
    window.requestAnimationFrame(() => {
      const target = triggerRef.current?.isConnected ? triggerRef.current : savedFilterRef.current;
      target?.focus({ preventScroll: true });
    });
  }

  function toggleSaved(article: Article) {
    const current = readSavedIds();
    const removing = current.includes(article.id);
    const next = removing ? current.filter((id) => id !== article.id) : [...current, article.id];
    if (mergePassport({ savedArticles: next })) {
      setSavedIds(next);
      setNotice(removing ? `Removed “${article.title}” from your reading list.` : `Saved “${article.title}” to your reading list on this device.`);
    } else {
      setNotice("Your browser could not save this reading note. Please check that site storage is available.");
    }
  }

  return (
    <section className="dj-journal" id="journal" aria-labelledby="dj-title">
      <div className="dj-masthead"><span>Deldiet / Field Journal</span><span>Notes for the curious coffee drinker</span></div>
      <header className="dj-intro">
        <div><p className="dj-eyebrow">Make room for discovery</p><h2 id="dj-title">A little knowledge.<br /><em>A better daily ritual.</em></h2></div>
        <p>From the fruit on the tree to the way you turn the grinder. Practical ideas, clearly explained, for your next cup.</p>
      </header>

      <article className="dj-feature">
        <button type="button" className="dj-feature-image" onClick={() => openArticle(featured.id)} aria-label={`Read ${featured.title}`}>
          <img src={featured.image} alt={featured.imageAlt} width="900" height="700" loading="lazy" />
          <span className="dj-feature-stamp">The brewing<br /><strong>edition</strong></span>
        </button>
        <div className="dj-feature-copy">
          <div className="dj-meta"><span>Featured field note</span><span><Clock3 size={15} aria-hidden="true" /> {readingMinutes(featured)} min read</span></div>
          <h3>{featured.title}</h3>
          <p>{featured.summary}</p>
          <div className="dj-ratio" aria-label="Example recipe: 20 grams coffee to 320 grams brew water"><span><strong>20<small>g</small></strong>coffee</span><i aria-hidden="true">:</i><span><strong>320<small>g</small></strong>brew water</span></div>
          <button type="button" className="dj-button dj-button-light" onClick={() => openArticle(featured.id)}>Read the field note <ArrowUpRight size={20} aria-hidden="true" /></button>
        </div>
      </article>

      <div className="dj-library-heading"><div><p className="dj-eyebrow">Small reads. Useful discoveries.</p><h3>The reading room</h3></div><span>{JOURNAL_ARTICLES.length.toString().padStart(2, "0")} field notes</span></div>
      <div className="dj-tools">
        <div className="dj-filters" role="group" aria-label="Filter journal articles by category">
          {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <button type="button" className="dj-saved-filter" ref={savedFilterRef} aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Bookmark size={17} aria-hidden="true" /> Saved <span>{savedCount}</span></button>
      </div>
      <div className="dj-results-line"><p aria-live="polite">{visible.length} {visible.length === 1 ? "note" : "notes"}{category !== "All notes" ? ` in ${category.toLowerCase()}` : " to explore"}{savedOnly ? " · saved on this device" : ""}</p><span>Learn something. Try something.</span></div>

      {visible.length ? <div className="dj-grid">
        {visible.map((article) => {
          const isSaved = savedIds.includes(article.id);
          return <article className="dj-card" key={article.id}>
            <div className="dj-card-media">
              <button type="button" className="dj-card-image" onClick={() => openArticle(article.id)} aria-label={`Read ${article.title}`}><img src={article.image} alt={article.imageAlt} width="640" height="500" loading="lazy" /></button>
              <span className="dj-card-number">Note {String(JOURNAL_ARTICLES.indexOf(article) + 1).padStart(2, "0")}</span>
              <button type="button" className="dj-bookmark" onClick={() => toggleSaved(article)} aria-pressed={isSaved} aria-label={`${isSaved ? "Remove" : "Save"} ${article.title}${isSaved ? " from reading list" : " to reading list"}`}>{isSaved ? <Check size={19} aria-hidden="true" /> : <Bookmark size={19} aria-hidden="true" />}</button>
            </div>
            <div className="dj-card-copy"><div className="dj-meta"><span>{article.category}</span><span>{readingMinutes(article)} min read</span></div><h4><button type="button" onClick={() => openArticle(article.id)}>{article.title}</button></h4><p>{article.summary}</p><button type="button" className="dj-read" onClick={() => openArticle(article.id)} aria-label={`Read field note: ${article.title}`}>Read field note <ArrowUpRight size={19} aria-hidden="true" /></button></div>
          </article>;
        })}
      </div> : <div className="dj-empty"><BookOpen size={38} strokeWidth={1.3} aria-hidden="true" /><h4>{savedOnly ? "Your next good read is waiting." : "A fresh page."}</h4><p>{savedOnly ? "Save a field note with its bookmark button. Your reading list stays on this device." : "Choose another category to find your next field note."}</p><button type="button" className="dj-button" onClick={() => { setCategory("All notes"); setSavedOnly(false); }}>Explore all field notes <ArrowRight size={18} aria-hidden="true" /></button></div>}

      <aside className="dj-bottom-note"><BookOpen size={28} strokeWidth={1.4} aria-hidden="true" /><div><h3>Your coffee knowledge, one cup at a time.</h3><p>Keep the notes you want to revisit. Bookmarks are saved in your Coffee Passport on this device.</p></div><a href="/passport">Open your Passport <ArrowUpRight size={19} aria-hidden="true" /></a></aside>
      <p className="dj-notice" role="status">{notice}</p>

      <dialog className="dj-reader" ref={dialogRef} aria-labelledby="dj-reader-title" onCancel={(event) => { event.preventDefault(); closeArticle(); }} onClose={() => setActiveId(null)} onClick={(event) => { if (event.target === event.currentTarget) closeArticle(); }}>
        {activeArticle && <article className="dj-reader-article">
          <div className="dj-reader-toolbar"><span>Deldiet / Field Journal</span><div><button type="button" className="dj-reader-save" aria-pressed={savedIds.includes(activeArticle.id)} onClick={() => toggleSaved(activeArticle)}>{savedIds.includes(activeArticle.id) ? <Check size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}<span>{savedIds.includes(activeArticle.id) ? "Saved" : "Save note"}</span></button><button type="button" className="dj-reader-close" aria-label="Close field note" onClick={closeArticle}><X size={23} aria-hidden="true" /></button></div></div>
          <header className="dj-reader-header"><p className="dj-eyebrow">{activeArticle.category} <span aria-hidden="true">/</span> {readingMinutes(activeArticle)} min read</p><h2 id="dj-reader-title" ref={headingRef} tabIndex={-1}>{activeArticle.title}</h2><p>{activeArticle.summary}</p></header>
          <div className="dj-reader-photo"><img src={activeArticle.image} alt={activeArticle.imageAlt} width="1000" height="600" /></div>
          <div className="dj-reader-body">
            {activeArticle.sections.map((section, index) => <section key={section.title} className="dj-article-section"><span className="dj-section-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}{section.table && <div className="dj-table-wrap" role="region" aria-label={section.title} tabIndex={0}><table><thead><tr>{section.table.headings.map((heading) => <th scope="col" key={heading}>{heading}</th>)}</tr></thead><tbody>{section.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>}{section.source && <p className="dj-source">Source: <a href={section.source.url} target="_blank" rel="noopener noreferrer">{section.source.label}<ArrowUpRight size={14} aria-hidden="true" /><span className="dj-sr-only"> (opens in a new tab)</span></a></p>}</div></section>)}
            <aside className="dj-takeaway"><p className="dj-eyebrow">For your next cup</p><p>{activeArticle.takeaway}</p><a href={activeArticle.nextHref}>{activeArticle.nextLabel} <ArrowUpRight size={19} aria-hidden="true" /></a></aside>
            <div className="dj-reader-footer"><button type="button" className="dj-read" onClick={closeArticle}>Back to the reading room <ArrowRight size={19} aria-hidden="true" /></button><button type="button" className="dj-read" onClick={() => { const index = JOURNAL_ARTICLES.indexOf(activeArticle); setActiveId(JOURNAL_ARTICLES[(index + 1) % JOURNAL_ARTICLES.length].id); }}>Next field note <ArrowUpRight size={19} aria-hidden="true" /></button></div>
            <p className="dj-reader-notice" role="status">{notice}</p>
          </div>
        </article>}
      </dialog>
    </section>
  );
}

export default JournalContent;
