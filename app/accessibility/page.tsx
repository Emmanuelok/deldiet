import InfoPage from "../design/info-pages";

export default function AccessibilityPage() {
  return (
    <InfoPage
      id="accessibility"
      label={"Accessibility"}
      title={"Coffee for every guest."}
      intro={"Deldiet is building keyboard, screen-reader, reduced-motion, high-contrast and responsive support into the platform. Forms use visible labels, status messages and large touch targets; atmospheric video is optional and carries no essential information."}
      sections={[
        {
          heading: "Current limitations",
          body: "The physical flagship location, service accommodations, accessible entrance, washroom, seating and communication options have not been verified and are not presented as available yet.",
        },
        {
          heading: "Before launch",
          body: "Deldiet must complete assistive-technology testing, publish a verified accessibility contact, document physical accommodations and establish a process for responding to barriers.",
        },
      ]}
      note={"Last updated 10 August 2026 · This statement tracks the current platform preview."}
    />
  );
}
