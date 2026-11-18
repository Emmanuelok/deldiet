import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const asset = (path) => readFile(new URL("../public/" + path, import.meta.url));

test("old share URLs show the same photograph as the current card", async () => {
  const photo = await asset("brand/crimson/espresso-pour.jpg");
  assert.deepEqual(await asset("brand/og-espresso-pour.jpg"), photo);
  const png = await asset("brand/og-deldiet.png");
  assert.deepEqual(await sharp(png).raw().toBuffer(), await sharp(photo).raw().toBuffer());
  const svg = (await asset("brand/og-deldiet.svg")).toString();
  const embedded = svg.match(/href="data:image\/jpeg;base64,([^"]+)"/);
  assert.ok(embedded, "the standalone legacy SVG must contain its image");
  assert.deepEqual(Buffer.from(embedded[1], "base64"), photo);
});

test("bookmarked favicon and installed-app URLs return the current icons", async () => {
  for (const filename of ["icon-32.png", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
    assert.deepEqual(await asset("icons/" + filename), await asset("brand/crimson/" + filename));
  }
  assert.deepEqual(await asset("apple-touch-icon.png"), await asset("brand/crimson/icon-180.png"));
  assert.deepEqual(await asset("favicon.svg"), await asset("brand/crimson/favicon.svg"));
  const ico = await asset("favicon.ico");
  assert.deepEqual(ico, await asset("brand/crimson/favicon.ico"));
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    const offset = ico.readUInt32LE(entry + 12);
    const length = ico.readUInt32LE(entry + 8);
    assert.deepEqual(ico.subarray(offset, offset + length), await asset(`brand/crimson/icon-${size}.png`));
  }
});
