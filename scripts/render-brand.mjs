import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
await sharp('public/brand/og-deldiet.svg').png({palette:true,colors:128}).toFile('public/brand/og-deldiet.png');
for (const size of [32, 180, 192, 512]) await sharp('public/favicon.svg').resize(size,size).png().toFile(`public/icons/icon-${size}.png`);
const logo = await sharp('public/brand/deldiet-wordmark.png').resize({width:352}).png().toBuffer();
await sharp({create:{width:512,height:512,channels:4,background:'#f6f2e8'}}).composite([{input:logo,gravity:'center'}]).png().toFile('public/icons/icon-maskable-512.png');
