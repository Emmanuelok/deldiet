import InfoPage from "../design/info-pages";

export default function PrivacyPage() {
  return (
    <InfoPage
      id="privacy"
      label="Deldiet privacy notice"
      title="Your details and your coffee."
      intro="Deldiet uses the contact details and selections you submit to process your request or order. Origin Atelier uses Stripe Checkout to collect payment details and confirm payment status."
      sections={[
        {
          heading: "Atelier payments",
          body: "When you continue to Stripe Checkout, your recipe, selected items and collection details are sent to Stripe with the checkout session. Payment and contact information entered at checkout is processed by Stripe. Authorized Deldiet staff can view the order and recipe in Stripe to arrange fulfilment. Deldiet’s Atelier does not receive or store your full card number.",
        },
        {
          heading: "Recipes on this device",
          body: "The Atelier can remember your draft recipe in this browser so you can return to it. Guest Passport preferences also use browser storage. You can clear these saved preferences through your browser’s site-data controls. A secure session cookie associates your Stripe checkout with this browser so the return page can check your payment status.",
        },
        {
          heading: "Other requests",
          body: "When you submit an interest, concierge, order-review, gift, workplace or Origin Exchange request, Deldiet stores the contact details and selections you provide, a timestamp and a reference. Those details support staff review and help prevent duplicate submissions.",
        },
        {
          heading: "Request retention and access",
          body: "For the existing request-intake service, automated retention, deletion, staff assignment and email notification are not connected yet. Deldiet must configure authorized staff access, a retention schedule, deletion handling and a verified privacy contact before operating that service publicly. Stripe transaction records are managed through the merchant account.",
        },
        {
          heading: "Your choices",
          body: "You can explore the Atelier and other catalogue pages without providing contact or payment information. Stripe collects checkout information when you proceed to payment. Keep your payment receipt or request reference for any follow-up with Deldiet.",
        },
      ]}
      note="Last updated 17 November 2026. Stripe’s privacy notice is available on its checkout page."
    />
  );
}
