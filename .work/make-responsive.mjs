import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const variants={
  'demos/restaurant/assets':[
    ['hero.webp','hero-720.webp',720],['dish-hummus.webp','dish-hummus-sm.webp',520],['dish-pasta.webp','dish-pasta-sm.webp',520],['dish-salad.webp','dish-salad-sm.webp',520],['dish-grill.webp','dish-grill-sm.webp',520],['dish-vegetables.webp','dish-vegetables-sm.webp',520],['dish-dessert.webp','dish-dessert-sm.webp',520],
  ],
  'demos/clinic/assets':[
    ['hero.webp','hero-720.webp',720],['clinic.webp','clinic-sm.webp',800],['care.webp','care-sm.webp',800],['doctor-noura.webp','doctor-noura-sm.webp',450],['doctor-karim.webp','doctor-karim-sm.webp',450],
  ],
  'demos/store/assets':[
    ...['mug','linen','vase','vases','bowls','shelf','dish','candle','plant','tray','basket','storage'].map(name=>[`${name}.webp`,`${name}-sm.webp`,500]),
  ],
};
for(const [folder,files] of Object.entries(variants))for(const [source,target,width] of files){
  const output=path.join(folder,target);await sharp(path.join(folder,source)).resize({width,withoutEnlargement:true}).webp({quality:74,effort:6}).toFile(output);console.log(`${output}: ${(await fs.stat(output)).size}`);
}
