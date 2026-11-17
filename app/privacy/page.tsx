import InfoPage from "../design/info-pages";

export default function PrivacyPage() {
  return (
    <InfoPage
      id="privacy"
      label={"Privacy notice · operational preview"}
      title={"What Deldiet stores."}
      intro={"When you send an interest, concierge, order-review, replenishment-plan, gift, workplace, Origin Bar or Origin Exchange request, Deldiet stores the contact details and selections you submit, plus a timestamp and reference. Card and banking details are not collected by this build."}
      sections={[
        {
          heading: "Passport on this device",
          body: "The guest Passport preview can store non-contact preferences—such as taste choices, brewer type and saved catalogue identifiers—in your browser's local storage. It does not store your request email, phone, message, tracking token or Origin Bar cup name. You can clear it using your browser's site-data controls.",
        },
        {
          heading: "Purpose",
          body: "Request data is stored only to identify the request, prevent duplicate submissions, and support future follow-up by authorized Deldiet staff. It is not a confirmed reservation, order, subscription, quote or payment.",
        },
        {
          heading: "Retention and access",
          body: "Automated retention, deletion, staff assignment and email notification are not connected yet. Avoid entering sensitive information. Before public launch, Deldiet must configure authorized staff access, a retention schedule, deletion handling and a verified privacy contact.",
        },
        {
          heading: "Your choices",
          body: "You can use the catalogue, Taste Graph and Brew Lab without submitting contact details. Contact details are required only when you ask Deldiet to save a request for review. If you submit, keep the reference shown on screen. A formal access or deletion request channel will be published before public operations begin.",
        },
      ]}
      note={"Last updated 10 August 2026 · This notice describes the current platform build and must be replaced or approved by Deldiet before commercial launch."}
    />
  );
}
