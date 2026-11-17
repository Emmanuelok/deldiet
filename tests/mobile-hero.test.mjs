import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("ships a lightweight mobile edition of the original hero film and its still poster", async () => {
  const [mobile, desktop, poster] = await Promise.all([
    readFile(new URL("../public/deldiet-hero-motion-mobile.mp4", import.meta.url)),
    stat(new URL("../public/deldiet-hero-motion.mp4", import.meta.url)),
    readFile(new URL("../public/deldiet-hero-motion-poster.webp", import.meta.url)),
  ]);
  assert.equal(mobile.toString("ascii", 4, 8), "ftyp", "the mobile asset should be an MP4");
  assert.ok(mobile.length > 500_000 && mobile.length < 2_000_000, "the mobile film should stay within its existing transfer budget");
  assert.ok(desktop.size > mobile.length, "desktop should retain the full-size film");
  assert.equal(poster.toString("ascii", 0, 4), "RIFF");
  assert.equal(poster.toString("ascii", 8, 12), "WEBP");
});
