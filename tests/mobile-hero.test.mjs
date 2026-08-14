import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("keeps cinematic hero motion available on mobile", async () => {
  const [experience, styles, video] = await Promise.all([
    readFile(new URL("../app/deldiet-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    stat(new URL("../public/deldiet-hero-motion-mobile.mp4", import.meta.url)),
  ]);

  assert.match(experience, /media="\(max-width: 640px\)" src="\/deldiet-hero-motion-mobile\.mp4"/);
  assert.match(experience, /className="hero-mobile-motion"/);
  assert.doesNotMatch(styles, /\.hero-video\s*\{\s*display:\s*none/);
  assert.ok(video.size > 500_000, "mobile hero video should contain the cinematic sequence");
  assert.ok(video.size < 2_000_000, "mobile hero video should remain lightweight enough for phones");
});
