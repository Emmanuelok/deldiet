import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE", color: "#221611", padding: "48px 20px", fontFamily: "Albert Sans, system-ui, sans-serif" }}>
      <article style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #E6DFD3", padding: "clamp(28px,6vw,64px)" }}>
        <Link href="/" style={{ color: "#6F3E1E", fontWeight: 700, textDecoration: "none" }}>← Deldiet home</Link>
        <p style={{ marginTop: 42, color: "#8F5E20", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>Accessibility</p>
        <h1 style={{ margin: "10px 0 18px", fontFamily: "Georgia, serif", fontSize: "clamp(38px,7vw,68px)", fontWeight: 400, lineHeight: 1 }}>Coffee for every guest.</h1>
        <p style={{ color: "#6F6257", fontSize: 17, lineHeight: 1.7 }}>Deldiet is building keyboard, screen-reader, reduced-motion, high-contrast and responsive support into the platform. Forms use visible labels, status messages and large touch targets; atmospheric video is optional and carries no essential information.</p>
        <h2>Current limitations</h2><p>The physical flagship location, service accommodations, accessible entrance, washroom, seating and communication options have not been verified and are not presented as available yet.</p>
        <h2>Before launch</h2><p>Deldiet must complete assistive-technology testing, publish a verified accessibility contact, document physical accommodations and establish a process for responding to barriers.</p>
        <p style={{ marginTop: 34, paddingTop: 20, borderTop: "1px solid #E6DFD3", color: "#7A6A5C", fontSize: 13 }}>Last updated 10 August 2026 · This statement tracks the current platform preview.</p>
      </article>
    </main>
  );
}
