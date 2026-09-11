import Link from "next/link";
export default function NotFound() {
  return <main className="dd-error-page"><span>DELDIET / 404</span><h1>A little<br/><em>off the beaten path.</em></h1><p>We couldn’t find that page. There’s still a whole world of coffee to explore.</p><div><Link className="button button-dark" href="/">Back to Deldiet</Link><Link href="/shop">Explore the collection</Link></div></main>;
}
