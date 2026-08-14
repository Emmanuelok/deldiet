import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders every focused Deldiet destination", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("routes", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const routes = [
    ["/", "Every experience"],
    ["/discover", "Four useful doors"],
    ["/coffeehouse", "Coffeehouse menu preview"],
    ["/events", "East Africa cupping table"],
    ["/origins", "Global coffee library"],
    ["/build-a-cup", "Your Brewprint"],
    ["/tasteprint", "Tasteprint"],
    ["/coffee-at-home", "Machine Match"],
    ["/shop", "All merchandise"],
    ["/standards", "Deldiet operating values"],
    ["/clarity", "Clarity is a caffeine-free"],
    ["/trace", "ET-GUJI-2608"],
    ["/business", "Wholesale studio"],
    ["/journal", "Why altitude"],
    ["/origin-bar", "Craft a cup"],
    ["/origin-exchange", "Follow the bean"],
    ["/passport", "Deldiet Passport"],
  ];

  for (const [path, expected] of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(response.status, 200, `${path} should render`);
    assert.match(await response.text(), new RegExp(expected, "i"), `${path} should include its focused experience`);
  }
});
