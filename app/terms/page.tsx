import InfoPage from "../design/info-pages";

export default function TermsPage() {
  return (
    <InfoPage
      id="terms"
      label="Deldiet terms"
      title="Ordering with Deldiet."
      intro="Origin Atelier displays ordering availability alongside your recipe. When ordering is available, review your selections, collection information and current price before continuing to Stripe Checkout. A payment confirmation is shown after Stripe verifies the payment."
      sections={[
        {
          heading: "Origin Atelier prices and payment",
          body: "Orderable recipes use Deldiet’s active CAD prices from Stripe. The itemised recipe is checked again when checkout starts. Stripe Checkout displays the final amount and any configured tax before payment. Recipe changes with unavailable prices cannot proceed to payment. A payment confirmation records payment status; the collection information explains fulfilment.",
        },
        {
          heading: "Availability and ingredients",
          body: "Review the collection location and instructions before paying. Tell staff about ingredient requirements or allergies before ordering. Saved recipes do not reserve ingredients. The Atelier identifies when ordering is closed or a combination is unavailable.",
        },
        {
          heading: "Catalogue and requests elsewhere on the site",
          body: "Other Deldiet catalogue information, prices, lots, addresses and hours remain illustrative unless a field names a verified source. A saved interest, order-review, gift, Rhythm or workplace reference records a request for staff review. Staff must confirm availability, price, tax, scheduling and fulfilment before those requests become purchases or bookings.",
        },
        {
          heading: "Market data",
          body: "Origin Exchange displays numeric market data when a configured provider supplies display permission, contract identity, source and freshness metadata. The Atelier’s selling prices are maintained in Deldiet’s payment catalogue.",
        },
      ]}
      note="Last updated 17 November 2026. Ordering availability and the payment summary are shown before checkout."
    />
  );
}
