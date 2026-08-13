import Link from "next/link";

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE", color: "#221611", padding: "48px 20px", fontFamily: "Albert Sans, system-ui, sans-serif" }}>
      <article style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #E6DFD3", padding: "clamp(28px,6vw,64px)" }}>
        <Link href="/" style={{ color: "#6F3E1E", fontWeight: 700, textDecoration: "none" }}>← Deldiet home</Link>
        <p style={{ marginTop: 42, color: "#8F5E20", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>Platform terms · operational preview</p>
        <h1 style={{ margin: "10px 0 18px", fontFamily: "Georgia, serif", fontSize: "clamp(38px,7vw,68px)", fontWeight: 400, lineHeight: 1 }}>Requests are not orders.</h1>
        <p style={{ color: "#6F6257", fontSize: 17, lineHeight: 1.7 }}>The current Deldiet experience is an interactive concept catalogue with durable request intake. A reference confirms only that data was stored; it does not confirm inventory, a reservation, preparation, delivery, certification, quote, market price, tax, payment or purchase.</p>
        <h2>Catalogue information</h2><p>Unless a field explicitly names a verified source and timestamp, products, lots, claims, prices, reviews, certifications, addresses, hours and fulfilment details are illustrative.</p>
        <h2>Plans, gifts and programmes</h2><p>A Deldiet Rhythm, gift or workplace reference records a proposed configuration only. It does not activate recurring billing, schedule a shipment, send a gift, reserve staff or equipment, confirm an event, create a corporate account or commit either party to a purchase.</p>
        <h2>Final confirmation</h2><p>Deldiet staff must separately verify availability, ingredients and allergens, final pricing, tax, fulfilment, scheduling and payment terms before any purchase, shipment, booking or preparation.</p>
        <h2>Market data</h2><p>Origin Exchange displays custom numeric market data only when an entitled provider, public-display licence, valid contract identity, source and freshness metadata are configured. Otherwise numbers remain unavailable.</p>
        <p style={{ marginTop: 34, paddingTop: 20, borderTop: "1px solid #E6DFD3", color: "#7A6A5C", fontSize: 13 }}>Last updated 10 August 2026 · Legal review is required before commercial launch.</p>
      </article>
    </main>
  );
}
