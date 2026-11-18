import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const publicDir = new URL("../public/", import.meta.url);
const file = (path) => new URL(path, publicDir);
const crimson = "brand/crimson/";
await mkdir(file(crimson), { recursive: true });

const photo = await readFile(file("brand/og-espresso-pour.jpg"));
await writeFile(file(crimson + "espresso-pour.jpg"), photo);

// Older cards can retain either URL. Preserve each format using the approved photograph.
await writeFile(file("brand/og-deldiet.png"), await sharp(photo).png({ compressionLevel: 9 }).toBuffer());
await writeFile(file("brand/og-deldiet.svg"), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>Deldiet — The world in your cup.</title>
  <image width="1200" height="630" href="data:image/jpeg;base64,${photo.toString("base64")}"/>
</svg>
`);

// Outline traced from the first letter of the original public/brand/deldiet-wordmark.png.
const initial = `M141.175 8.289c-.810.976-1.207 27.065-1.420 93.283
  C139.424 204.532 139.902 197.583 131.961 214.729
  C110.897 260.208 62.944 262.372 39.287 218.912
  C33.681 208.613 30.134 196.019 29.735 185
  L29.5 178.5 77.795 178.24 126.091 177.981 125.795 171.24 125.5 164.5 68 164.224
  C36.375 164.072 9.488 164.193 8.25 164.493
  C2.446 165.9 6.823 197.815 15.069 214.228
  C46.443 276.67 131.557 273.109 156.769 208.3
  C162.784 192.84 162.5 198.25 162.5 99
  L162.5 7.5 152.4 7.217
  C144.845 7.005 142.017 7.275 141.175 8.289Z`;

function iconSvg(maskable = false) {
  // The smaller, full-bleed version keeps the entire letter inside the maskable safe circle.
  const transform = maskable ? "translate(70 37) scale(.65)" : "translate(63 27) scale(.73)";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <title>Deldiet</title>
  <defs>
    <linearGradient id="crimson" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop stop-color="#78091b"/><stop offset=".57" stop-color="#ad101d"/><stop offset="1" stop-color="#d82920"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="${maskable ? 0 : 52}" fill="url(#crimson)"/>
  <path transform="${transform}" fill="#fff1d9" stroke="#fff1d9" stroke-width="3.5" stroke-linejoin="round" d="${initial}"/>
</svg>
`;
}

const favicon = Buffer.from(iconSvg());
const fullBleed = Buffer.from(iconSvg(true));
await writeFile(file(crimson + "favicon.svg"), favicon);
await copyFile(file(crimson + "favicon.svg"), file("favicon.svg"));

const frames = [];
for (const size of [16, 32, 48, 180, 192, 512]) {
  const png = await sharp(size === 180 ? fullBleed : favicon, { density: 288 })
    .resize(size, size).png().toBuffer();
  await writeFile(file(crimson + `icon-${size}.png`), png);
  if ([32, 180, 192, 512].includes(size)) await writeFile(file(`icons/icon-${size}.png`), png);
  if (size === 180) await writeFile(file("apple-touch-icon.png"), png);
  if (size <= 48) frames.push({ size, png });
}

const maskable = await sharp(fullBleed, { density: 288 }).resize(512, 512).png().toBuffer();
await writeFile(file(crimson + "icon-maskable-512.png"), maskable);
await writeFile(file("icons/icon-maskable-512.png"), maskable);

// A real multi-resolution ICO contains a directory and the original PNG frame bytes.
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, { size, png }] of frames.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
const ico = Buffer.concat([directory, ...frames.map(({ png }) => png)]);
await writeFile(file(crimson + "favicon.ico"), ico);
await writeFile(file("favicon.ico"), ico);
