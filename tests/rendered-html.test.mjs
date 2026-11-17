import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const { default: worker } = await import("../dist/server/index.js");

async function renderPage(path) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200, `${path} should render`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  // Assert against the server-rendered page, excluding duplicate content in hydration payloads.
  return (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

test("renders development preview metadata", async () => {
  const html = await renderPage("/");
  assert.match(html, /<meta(?=[^>]*\bname="codex-preview")(?=[^>]*\bcontent="development")[^>]*>/i);
});

test("offers both hero films, a poster, and a playback control", async () => {
  const html = await renderPage("/");
  const film = html.match(/<video\b[\s\S]*?<\/video>/i)?.[0];
  assert.ok(film, "visitors should see the Deldiet film in the hero");
  assert.match(film, /\bposter="\/deldiet-hero-motion-poster\.webp"/i);
  assert.match(film, /\bmuted\b/i);
  assert.match(film, /\bplaysinline\b/i);
  const sources = [...film.matchAll(/<source\b[^>]*>/gi)].map(([tag]) => tag);
  assert.match(sources[0], /\bsrc="\/deldiet-hero-motion-mobile\.mp4"/i);
  assert.match(sources[0], /\bmedia="\(max-width:\s*\d+px\)"/i);
  assert.match(sources[1], /\bsrc="\/deldiet-hero-motion\.mp4"/i);
  assert.match(html, /<button\b[^>]*aria-label="[^"]*(?:pause|play)[^"]*"/i);
});

test("links the tasting counter to the selected profile and keeps the official social channels", async () => {
  const page = await renderPage("/");
  const flavourButtons = [...page.matchAll(/<button\b[^>]*aria-controls="tasting-notes"[^>]*>/gi)];
  assert.equal(flavourButtons.length, 3);
  assert.equal(flavourButtons.filter(([tag]) => tag.includes('aria-pressed="true"')).length, 1);
  assert.ok(/href="\/origins\?origin=[a-z-]+#origin-profile"/.test(page));
  for (const url of ["https://www.instagram.com/deldietcoffee/", "https://x.com/deldietcoffee", "https://www.youtube.com/@deldietcoffee"]) {
    assert.ok(page.includes(`href="${url}"`), `The homepage should link to ${url}`);
  }
});

const primaryPaths = ["/", "/coffeehouse", "/origins", "/build-a-cup", "/coffee-at-home", "/shop"];
const supportingPages = new Map([
  ["/discover", /aria-label="Choose your Deldiet goal"/i],
  ["/events", /<button\b[^>]*aria-label="Register interest in East Africa cupping table"/i],
  ["/tasteprint", /<input\b[^>]*type="radio"[^>]*name="brew"/i],
  ["/standards", /<details\b[\s\S]*?href="\/passport\?tab=finder"/i],
  ["/clarity", /caffeine-free[\s\S]*?Add interest to bag/i],
  ["/trace", /<input\b[^>]*placeholder="ET-GUJI-2608"/i],
  ["/business", /wholesale[\s\S]*?href="\/passport\?tab=teams"/i],
  ["/journal", /<select\b[^>]*id="ds-origin-example"/i],
  ["/passport", /aria-label="Passport sections"/i],
  ["/accessibility", /accessib/i],
  ["/privacy", /retention/i],
  ["/terms", /confirmation/i],
]);
const navigationPaths = [...primaryPaths.slice(1), "/origin-bar", "/origin-exchange"];

test("gives each main destination one heading and complete primary navigation", async () => {
  for (const path of primaryPaths) {
    const html = await renderPage(path);
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, `${path} should have one main heading`);
    const navigation = html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
    assert.ok(navigation, `${path} should expose its primary navigation`);
    for (const href of navigationPaths) {
      assert.ok(navigation.includes(`href="${href}"`), `${path} should link to ${href}`);
    }
    if (path !== "/") {
      const link = [...navigation.matchAll(/<a\b[^>]*>/gi)].find(([tag]) => tag.includes(`href="${path}"`));
      assert.match(link[0], /aria-current="page"/i, `${path} should identify the current page`);
    }
    for (const [, id] of html.matchAll(/<a\b[^>]*\bhref="#([^"#]+)"/gi)) {
      assert.ok(html.includes(`id="${id}"`), `${path} should resolve its #${id} link`);
    }
  }
});

test("ships the local photography used on every redesigned destination", async () => {
  const photos = new Set();
  for (const path of [...primaryPaths, ...supportingPages.keys()]) {
    const html = await renderPage(path);
    for (const [, src] of html.matchAll(/<img\b[^>]*?\ssrc="([^"#]+)"/gi)) {
      const url = new URL(src.replaceAll("&amp;", "&"), "http://localhost");
      const asset = url.searchParams.get("url") ?? url.pathname;
      if (url.origin === "http://localhost" && /\.(png|jpe?g|webp|svg)$/i.test(asset)) photos.add(asset);
    }
  }
  assert.ok(photos.size > 0, "should find the on-page images");
  for (const asset of photos) {
    const info = await stat(new URL(`../public${asset}`, import.meta.url));
    assert.ok(info.isFile() && info.size > 0, `${asset} should be a shipped asset`);
  }
});

test("renders each destination's interactive controls and onward links", async () => {
  const controls = [
    ["/coffeehouse", [
      /<input\b[^>]*type="search"/i,
      /<option\b[^>]*value="Dine in"/i,
      /<button\b[^>]*aria-label="Add [^"]+ to coffeehouse order"/i,
      /Register visit interest/i,
    ]],
    ["/origins", [
      /<button\b[^>]*aria-label="Previous origin"/i,
      /<button\b[^>]*aria-label="Next origin"/i,
      /<article\b[^>]*id="origin-profile"/i,
      /<a\b[^>]*href="\/build-a-cup\?origin=[a-z-]+"/i,
    ]],
    ["/build-a-cup", [
      /<input\b[^>]*name="Coffee origin"/i,
      /<input\b[^>]*name="Serving temperature"/i,
      /Add to coffeehouse order/i,
      /Save Brewprint on this device/i,
    ]],
    ["/coffee-at-home", [
      /<select\b[^>]*id="hm-machine"/i,
      /Save setup to Passport/i,
      /aria-label="Filter product formats"/i,
      /<button\b[^>]*aria-label="Add [^"]+ to bag/i,
      /href="\/passport\?tab=brew"/i,
    ]],
    ["/shop", [
      /<input\b[^>]*type="search"/i,
      /<button\b[^>]*aria-label="Choose options for [^"]+"/i,
      /<button\b[^>]*aria-label="Quick add [^"]+"/i,
    ]],
  ];
  for (const [path, expectations] of controls) {
    const page = await renderPage(path);
    for (const expected of expectations) assert.ok(expected.test(page), `${path} should render ${expected}`);
  }
});

test("keeps supporting pages readable and connected to home", async () => {
  for (const [path, focusedContent] of supportingPages) {
    const page = await renderPage(path);
    assert.ok(focusedContent.test(page), `${path} should render its focused experience`);
    assert.equal([...page.matchAll(/<h1\b/gi)].length, 1, `${path} should have a single page heading`);
    assert.ok(/<main\b/i.test(page), `${path} should have a main landmark`);
    assert.ok(page.includes('href="/"'), `${path} should provide a route home`);
    if (["/privacy", "/terms", "/accessibility"].includes(path)) {
      assert.ok(/<h2\b/i.test(page), `${path} should keep its notice sections`);
    }
  }
});

test("preserves Origin Bar and Exchange as distinct destinations", async () => {
  for (const [path, expected] of [["/origin-bar", /Craft a cup/i], ["/origin-exchange", /Follow the bean/i]]) {
    const page = await renderPage(path);
    assert.ok(expected.test(page), `${path} should render its original focused experience`);
    assert.doesNotMatch(page, /<main\b[^>]*class="[^"]*\bed-shell\b/i);
  }
});

test("the PWA fallback explains the offline state without requiring a network resource", async () => {
  const offlinePage = await readFile(new URL("../public/offline.html", import.meta.url), "utf8");
  assert.match(offlinePage, /<main\b/i);
  assert.match(offlinePage, /<h1\b/i);
  assert.match(offlinePage, /offline/i);
  assert.match(offlinePage, /<a\b[^>]*href="\/"/i);
  assert.doesNotMatch(offlinePage, /<(?:script|link|img|source)\b[^>]*(?:src|href)="(?!data:)/i);
});
