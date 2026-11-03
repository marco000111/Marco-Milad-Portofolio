import fs from 'node:fs/promises';
import path from 'node:path';

const groups = {
  'demos/restaurant/assets': {
    'hero.jpg':'photo-1766589152660-897cd4ef5222',
    'story.jpg':'photo-1765646772493-7b5341714eea',
    'dish-hummus.jpg':'photo-1637949907734-d5583aa35b41',
    'dish-pasta.jpg':'photo-1553621043-f607bfbf6640',
    'dish-salad.jpg':'photo-1778705635126-861a174e9ba6',
    'dish-grill.jpg':'photo-1761315414500-a72142016572',
    'dish-vegetables.jpg':'photo-1541013406133-94ed77ee8ba8',
    'dish-dessert.jpg':'photo-1692624570201-77b2f1b8311e',
    'gallery-1.jpg':'photo-1520252729650-ddced2015543',
  },
  'demos/clinic/assets': {
    'hero.jpg':'photo-1777331903190-341a3dd0441b',
    'clinic.jpg':'photo-1643660527190-4f401370f788',
    'care.jpg':'photo-1662837625421-5fd8ed6131a0',
    'doctor-noura.jpg':'pexels:37458351',
    'doctor-karim.jpg':'pexels:37458045',
  },
  'demos/store/assets': {
    'mug.jpg':'photo-1615421382532-c24c45a12a34',
    'linen.jpg':'photo-1770731206301-43a9683f3438',
    'vase.jpg':'photo-1607200711767-5f91ad860ae0',
    'vases.jpg':'photo-1776928161455-420d318efbb8',
    'bowls.jpg':'photo-1759847365004-8c17665602a6',
    'shelf.jpg':'photo-1764072396689-953cc059db86',
    'dish.jpg':'photo-1772453609632-2f4aa857f56e',
    'candle.jpg':'photo-1608263153703-caa6b0fd7bc7',
    'plant.jpg':'photo-1601916862476-8bbfd397ba8a',
    'tray.jpg':'photo-1774167656563-3abd810e9d72',
    'basket.jpg':'photo-1777566131330-8f2c8b497847',
    'storage.jpg':'photo-1757087997434-9e07ce7cf9f2',
  }
};

for (const [folder, files] of Object.entries(groups)) {
  await fs.mkdir(folder, {recursive:true});
  for (const [name, id] of Object.entries(files)) {
    const url = id.startsWith('pexels:')
      ? `https://images.pexels.com/photos/${id.split(':')[1]}/pexels-photo-${id.split(':')[1]}.jpeg?auto=compress&cs=tinysrgb&w=1800`
      : `https://images.unsplash.com/${id}?auto=format&fit=crop&fm=jpg&q=88&w=1800`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length < 5000) throw new Error(`Suspicious image: ${url}`);
    await fs.writeFile(path.join(folder, name), data);
    console.log(`${folder}/${name}: ${data.length}`);
  }
}
