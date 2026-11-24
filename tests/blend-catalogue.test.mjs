import assert from "node:assert/strict";
import test from "node:test";
import { filterBlends } from "../lib/blend-catalogue.ts";

const testBlends = [
  { id: "example-a", name: "Café Example", collection: "First group", notes: "Bergamot & cacao", roast: "Light" },
  { id: "example-b", name: "Café Example", collection: "Second group", notes: "Cacao", roast: "Dark" },
  { id: "example-c", name: "Different example", collection: "Second group", pack: "Coffee tin" },
];

test("blend search ignores accents and applies all terms", () => {
  assert.deepEqual(filterBlends(testBlends, "  cafe BERGAMOT ").map((blend) => blend.id), ["example-a"]);
});

test("duplicate display names keep their separate catalogue records", () => {
  assert.deepEqual(filterBlends(testBlends, "café").map((blend) => blend.id), ["example-a", "example-b"]);
});

test("collection selection intersects with search and optional details", () => {
  assert.deepEqual(filterBlends(testBlends, "cacao", "Second group").map((blend) => blend.id), ["example-b"]);
  assert.deepEqual(filterBlends(testBlends, "coffee tin", "Second group").map((blend) => blend.id), ["example-c"]);
  assert.deepEqual(filterBlends(testBlends, "missing", "Second group"), []);
});

test("empty search returns the full collection in source order", () => {
  assert.deepEqual(filterBlends(testBlends, ""), testBlends);
});

test("only the visually cleared concepts and original WebP assets are public", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const { default: sharp } = await import("sharp");
  const catalogueString = await readFile(new URL("../lib/deldiet-source-catalogue.json", import.meta.url), "utf8");
  const { blends, formats } = JSON.parse(catalogueString);
  assert.deepEqual(blends.map(({ id }) => id), ["blend-95"]);
  assert.deepEqual(formats.map(({ id }) => id), ["packaging-24"]);
  assert.doesNotMatch(catalogueString, /FDA|anti.inflammatory|treat(?:ment|s)|cure|boost|relief|theanine|potenc|psilocybin|\bCBD\b|price|inventory|checkout/i);
  const directory = new URL("../public/products/concepts/", import.meta.url);
  const files = await readdir(directory);
  assert.deepEqual(files.sort(), ["obsidian-tasting-vault.webp", "truffle-mocha.webp"]);
  for (const { media } of [...blends, ...formats]) {
    assert.equal(media.original, media.preview);
    const binary = await readFile(new URL(media.original.split("/").at(-1), directory));
    const meta = await sharp(binary).metadata();
    assert.deepEqual([meta.format, meta.width, meta.height], ["webp", media.width, media.height]);
  }
});

test("concept cards are mode-isolated, browse-only and keep retail purchase actions in the existing grid", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/design/shop.tsx", import.meta.url), "utf8");
  const concept = source.split(") : sourceCategory ? (")[1].split(") : (")[0];
  assert.match(concept, /Design catalogue · not currently for sale/);
  assert.match(concept, /View full image/);
  assert.doesNotMatch(concept, /onQuickAdd|onOpen|price|checkout|request|purchase|cart/i);
  assert.match(source, /listedProducts\.map/);
  assert.match(source, /onQuickAdd\(item\)/);
});
