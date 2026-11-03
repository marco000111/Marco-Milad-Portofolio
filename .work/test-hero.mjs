import sharp from 'sharp';
for(const [width,quality,name] of [[1280,68,'hero-1280.webp'],[1200,64,'hero-1200.webp'],[960,68,'hero-960.webp']]){
  await sharp('demos/restaurant/assets/hero.webp').resize({width}).webp({quality,effort:6}).toFile(`.work/${name}`);
}
