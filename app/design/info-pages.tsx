import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import "./info.css";

const notices = [
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
  { id: "accessibility", label: "Accessibility" },
] as const;

function sectionId(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
}

type InfoPageProps = {
  id: (typeof notices)[number]["id"];
  label: string;
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode }[];
  note: string;
};

export default function InfoPage({ id, label, title, intro, sections, note }: InfoPageProps) {
  return (
    <div className="di-page" data-notice={id} id="policy-top">
      <a className="skip-link" href="#policy-content">Skip to main content</a>
      <header className="di-header">
        <Link href="/" aria-label="Deldiet home"><Image src="/brand/deldiet-wordmark.png" alt="Deldiet" width={432} height={129} priority unoptimized /></Link>
        <Link href="/" className="di-home">← Deldiet home</Link>
      </header>
      <main id="policy-content">
        <div className="di-cover">
          <div><p className="di-label">{label}</p><h1>{title}</h1></div>
          <p className="di-lead">{intro}</p>
        </div>
        <div className="di-reading">
          <nav className="di-outline" aria-label="On this page">
            <p className="di-label">On this page</p>
            {sections.map(({ heading }) => <a key={heading} href={`#${sectionId(heading)}`}>{heading}<span aria-hidden="true">↓</span></a>)}
          </nav>
          <article className="di-article" aria-label={label}>
            {sections.map(({ heading, body }) => <section aria-labelledby={sectionId(heading)} key={heading}><h2 id={sectionId(heading)}>{heading}</h2><p>{body}</p></section>)}
            <p className="di-note">{note}</p>
          </article>
        </div>
      </main>
      <footer className="di-footer">
        <nav aria-label="Deldiet policies">{notices.map((item) => <Link key={item.id} href={`/${item.id}`} aria-current={item.id === id ? "page" : undefined}>{item.label}</Link>)}</nav>
        <a href="#policy-top">Back to top ↑</a>
      </footer>
    </div>
  );
}
