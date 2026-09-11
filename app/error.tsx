"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="dd-error-page"><span>LET’S TRY THAT AGAIN</span><h1>A small pause<br/><em>in your coffee journey.</em></h1><p>This page couldn’t load correctly. Please try again or return to the homepage.</p><div><button className="button button-dark" onClick={reset}>Try again</button><Link href="/">Back to Deldiet</Link></div></main>;
}
