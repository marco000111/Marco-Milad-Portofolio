import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';

const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const sizes=[360,390,768,1024,1440,1920];
const pages=['restaurant','clinic','store'];
const errors=[];const metrics=[];
async function decodePageImages(page){await page.evaluate(async()=>{const images=[...document.images];images.forEach(image=>image.loading='eager');await Promise.all(images.map(image=>image.decode().catch(()=>{})));});}
await fs.mkdir('.work/review',{recursive:true});
for(const name of pages){
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(`${name}: ${error.message}`));
  page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('ERR_ABORTED'))errors.push(`${name} console: ${msg.text()}`)});
  const base=`http://localhost:8000/demos/${name}/`;
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('body').waitFor();
  if(name==='store')await page.evaluate(()=>localStorage.clear());
  for(const width of sizes){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(120);
    const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,height:document.documentElement.scrollHeight,dir:document.documentElement.dir}));
    metrics.push({name,lang:'en',...state});
    if(state.scrollWidth>width+1)errors.push(`${name} EN overflow ${width}: ${state.scrollWidth}`);
    if([360,768,1440,1920].includes(width)){await decodePageImages(page);await page.screenshot({path:`.work/review/${name}-en-${width}.png`,fullPage:true});}
  }
  await page.locator('.language-toggle').click();
  await page.waitForTimeout(120);
  for(const width of sizes){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(100);
    const arabic=await page.evaluate(()=>({dir:document.documentElement.dir,scrollWidth:document.documentElement.scrollWidth,width:innerWidth}));
    if(arabic.dir!=='rtl')errors.push(`${name}: language switch failed`);
    if(arabic.scrollWidth>arabic.width+1)errors.push(`${name} AR overflow ${width}: ${arabic.scrollWidth}`);
    metrics.push({name,lang:'ar',...arabic});
    if([360,768,1440,1920].includes(width)){await decodePageImages(page);await page.screenshot({path:`.work/review/${name}-ar-${width}.png`,fullPage:true});}
  }
  if(name==='restaurant'){
    await page.locator('#restaurant-filters button[data-group="main"]').click();
    if(await page.locator('#restaurant-menu .dish-card').count()!==3)errors.push('restaurant filter did not show 3 mains');
    await page.locator('#restaurant-reservation input[name=name]').fill('Mina Ibrahim');
    await page.locator('#restaurant-reservation input[name=phone]').fill('+20 100 123 4567');
    await page.locator('#restaurant-reservation input[name=date]').fill('2027-01-17');
    await page.locator('#restaurant-reservation select[name=people]').selectOption('3');
    await page.locator('#restaurant-reservation button[type=submit]').click();
    if(!(await page.locator('#restaurant-reservation output a').count()))errors.push('restaurant reservation did not offer WhatsApp follow-up');
  }
  if(name==='clinic'){
    const form=page.locator('#clinic-booking');await form.locator('[name=name]').fill('Mina Ibrahim');await form.locator('[name=email]').fill('mina@example.com');await form.locator('[name=phone]').fill('+20 100 123 4567');await form.locator('[name=service]').selectOption('prevention');await form.locator('[name=date]').fill('2027-01-17');await form.locator('[name=time]').selectOption('morning');await form.locator('button[type=submit]').click();
    if(!(await form.locator('output').textContent()).includes('Mina'))errors.push('clinic booking confirmation missing');
  }
  if(name==='store'){
    await page.locator('#store-search').fill('ceramic');if(await page.locator('.product-card').count()<1)errors.push('store search failed');await page.locator('#store-search').fill('');
    await page.locator('#store-filters [data-category=table]').click();if(await page.locator('.product-card').count()!==3)errors.push('store category filter failed');await page.locator('#store-filters [data-category=all]').click();
    await page.locator('.product-card').first().click();await page.locator('#dialog-quantity').fill('2');await page.locator('#dialog-add').click();
    if((await page.locator('#cart-count').textContent()).trim()!=='٢')errors.push('store add to cart count failed');
    await page.locator('#cart-lines [data-cart-action=plus]').click();
    if((await page.locator('#cart-count').textContent()).trim()!=='٣')errors.push('store cart quantity update failed');
    await page.locator('.cart-close').click();await page.locator('#newsletter-email').fill('mina@example.com');await page.locator('#newsletter-form button[type=submit]').click();
    if(!(await page.locator('#newsletter-form output').textContent()).includes('بريدك'))errors.push('store Arabic newsletter response failed');
  }
  await page.close();
}
// Desktop language screenshots used as the portfolio carousel previews.
for(const name of pages){
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await page.goto(`http://localhost:8000/demos/${name}/`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  const png=await page.screenshot({type:'png'});
  const output=`assets/images/concept-${name}.webp`;
  await sharp(png).webp({quality:90,effort:6}).toFile(output);
  await page.close();
}
// Validate the supported dental alias too.
const alias=await browser.newPage({viewport:{width:390,height:844}});await alias.goto('http://localhost:8000/demos/dental/',{waitUntil:'networkidle'});if((await alias.locator('body').getAttribute('data-demo'))!=='clinic')errors.push('dental route unavailable');await alias.close();
await browser.close();
console.log(JSON.stringify({metrics,errors},null,2));
if(errors.length)process.exitCode=1;
