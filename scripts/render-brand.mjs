import sharp from 'sharp';
await sharp('public/brand/og-deldiet.svg').png({palette:true,colors:64}).toFile('public/brand/og-deldiet.png');
for (const size of [32, 180, 192, 512]) await sharp('public/favicon.svg').resize(size,size).png().toFile(`public/icons/icon-${size}.png`);
