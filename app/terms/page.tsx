import InfoPage from "../design/info-pages";

export default function TermsPage() {
  return (
    <InfoPage
      id="terms"
      label={"Platform terms · operational preview"}
      title={"Requests are not orders."}
      intro={"The current Deldiet experience is an interactive concept catalogue with durable request intake. A reference confirms only that data was stored; it does not confirm inventory, a reservation, preparation, delivery, certification, quote, market price, tax, payment or purchase."}
      sections={[
        {
          heading: "Catalogue information",
          body: "Unless a field explicitly names a verified source and timestamp, products, lots, claims, prices, reviews, certifications, addresses, hours and fulfilment details are illustrative.",
        },
        {
          heading: "Plans, gifts and programmes",
          body: "A Deldiet Rhythm, gift or workplace reference records a proposed configuration only. It does not activate recurring billing, schedule a shipment, send a gift, reserve staff or equipment, confirm an event, create a corporate account or commit either party to a purchase.",
        },
        {
          heading: "Final confirmation",
          body: "Deldiet staff must separately verify availability, ingredients and allergens, final pricing, tax, fulfilment, scheduling and payment terms before any purchase, shipment, booking or preparation.",
        },
        {
          heading: "Market data",
          body: "Origin Exchange displays custom numeric market data only when an entitled provider, public-display licence, valid contract identity, source and freshness metadata are configured. Otherwise numbers remain unavailable.",
        },
      ]}
      note={"Last updated 10 August 2026 · Legal review is required before commercial launch."}
    />
  );
}
