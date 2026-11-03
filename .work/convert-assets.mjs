import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

for (const folder of ['demos/restaurant/assets','demos/clinic/assets','demos/store/assets']) {
  for (const file of await fs.readdir(folder)) {
    if (!file.endsWith('.jpg')) continue;
    const input = path.join(folder, file);
    const output = input.replace(/\.jpg$/, '.webp');
    const width = file==='hero.jpg' ? 1440 : ['story.jpg','clinic.jpg','care.jpg'].includes(file) ? 1400 : 900;
    await sharp(input).rotate().resize({width, withoutEnlargement:true}).webp({quality:78, effort:6}).toFile(output);
    console.log(`${output}: ${(await fs.stat(output)).size}`);
    await fs.unlink(input);
  }
}
