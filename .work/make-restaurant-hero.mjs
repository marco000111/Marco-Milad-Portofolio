import sharp from 'sharp';
const input='demos/restaurant/assets/hero.webp';
await sharp(input).resize(1440,770,{fit:'cover',position:'centre'}).webp({quality:72,effort:6}).toFile('demos/restaurant/assets/hero-desktop.webp');
await sharp(input).resize(800,1200,{fit:'cover',position:'centre'}).webp({quality:72,effort:6}).toFile('demos/restaurant/assets/hero-mobile.webp');
