import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function readPngDimensions(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", `${file} must be a PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.byteLength,
  };
}

test("Deldiet favicon set is branded and complete", () => {
  const svg = fs.readFileSync(path.join(root, "app/icon.svg"), "utf8");
  assert.match(svg, /viewBox="0 0 64 64"/);
  assert.match(svg, /Deldiet origin sunrise/);
  assert.doesNotMatch(svg, /#2E9EFF|#0C79D8|#68C4FF/i);

  const ico = fs.readFileSync(path.join(root, "app/favicon.ico"));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.ok(ico.readUInt16LE(4) >= 3, "favicon.ico should include 16, 32 and 48px images");

  assert.deepEqual(readPngDimensions("app/apple-icon.png").width, 180);
  assert.deepEqual(readPngDimensions("app/apple-icon.png").height, 180);
});

test("Open Graph and Twitter cards use production-safe dimensions", () => {
  for (const file of ["app/opengraph-image.png", "app/twitter-image.png"]) {
    const image = readPngDimensions(file);
    assert.equal(image.width, 1200);
    assert.equal(image.height, 630);
    assert.ok(image.bytes > 150_000, `${file} should contain the full cinematic artwork`);
    assert.ok(image.bytes < 5_000_000, `${file} should stay below social-platform limits`);
  }

  for (const file of ["app/opengraph-image.alt.txt", "app/twitter-image.alt.txt"]) {
    const alt = fs.readFileSync(path.join(root, file), "utf8").trim();
    assert.ok(alt.length >= 40 && alt.length <= 200, `${file} should contain concise alt text`);
  }
});

test("root metadata declares absolute Open Graph and Twitter cards", () => {
  const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/deldiet\.vercel\.app"\)/);
  assert.match(layout, /openGraph:\s*\{/);
  assert.match(layout, /twitter:\s*\{/);
  assert.match(layout, /card:\s*"summary_large_image"/);
});
