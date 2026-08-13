import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE", color: "#221611", padding: "48px 20px", fontFamily: "Albert Sans, system-ui, sans-serif" }}>
      <article style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #E6DFD3", padding: "clamp(28px,6vw,64px)" }}>
        <Link href="/" style={{ color: "#6F3E1E", fontWeight: 700, textDecoration: "none" }}>← Deldiet home</Link>
        <p style={{ marginTop: 42, color: "#8F5E20", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>Privacy notice · operational preview</p>
        <h1 style={{ margin: "10px 0 18px", fontFamily: "Georgia, serif", fontSize: "clamp(38px,7vw,68px)", fontWeight: 400, lineHeight: 1 }}>What Deldiet stores.</h1>
        <p style={{ color: "#6F6257", fontSize: 17, lineHeight: 1.7 }}>When you send an interest, concierge, order-review, replenishment-plan, gift, workplace, Origin Bar or Origin Exchange request, Deldiet stores the contact details and selections you submit, plus a timestamp and reference. Card and banking details are not collected by this build.</p>
        <h2>Passport on this device</h2><p>The guest Passport preview can store non-contact preferences—such as taste choices, brewer type and saved catalogue identifiers—in your browser&apos;s local storage. It does not store your request email, phone, message, tracking token or Origin Bar cup name. You can clear it using your browser&apos;s site-data controls.</p>
        <h2>Purpose</h2><p>Request data is stored only to identify the request, prevent duplicate submissions, and support future follow-up by authorized Deldiet staff. It is not a confirmed reservation, order, subscription, quote or payment.</p>
        <h2>Retention and access</h2><p>Automated retention, deletion, staff assignment and email notification are not connected yet. Avoid entering sensitive information. Before public launch, Deldiet must configure authorized staff access, a retention schedule, deletion handling and a verified privacy contact.</p>
        <h2>Your choices</h2><p>You can use the catalogue, Taste Graph and Brew Lab without submitting contact details. Contact details are required only when you ask Deldiet to save a request for review. If you submit, keep the reference shown on screen. A formal access or deletion request channel will be published before public operations begin.</p>
        <p style={{ marginTop: 34, paddingTop: 20, borderTop: "1px solid #E6DFD3", color: "#7A6A5C", fontSize: 13 }}>Last updated 10 August 2026 · This notice describes the current platform build and must be replaced or approved by Deldiet before commercial launch.</p>
      </article>
    </main>
  );
}
