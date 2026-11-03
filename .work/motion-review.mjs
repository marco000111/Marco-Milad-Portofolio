import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const sites = [
  ['portfolio','http://localhost:8000/'],
  ['restaurant','http://localhost:8000/demos/restaurant/'],
  ['clinic','http://localhost:8000/demos/clinic/'],
  ['store','http://localhost:8000/demos/store/'],
];
const results={sites:[],failureModes:[]};
const sizes=[360,390,768,1024,1440,1920];
await fs.mkdir('.work/motion-after',{recursive:true});
async function scrollAll(page){const height=await page.evaluate(()=>document.documentElement.scrollHeight);const step=Math.max(360,Math.floor(page.viewportSize().height*.76));for(let y=0;y<height;y+=step){await page.evaluate(value=>window.scrollTo(0,value),y);await page.waitForTimeout(38)}await page.waitForTimeout(1350);await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(850)}
async function overflow(page){return await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}
for(const [name,url] of sites){
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];const warnings=[];const pageErrors=[];
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_ABORTED'))errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(e.message));
  if(name==='store')await page.addInitScript(()=>localStorage.clear());
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1600);
  const record={name,consoleErrors:errors,consoleWarnings:warnings,pageErrors,viewports:{},initialTriggers:await page.evaluate(()=>window.ScrollTrigger?.getAll().length??0)};
  const intro=name==='portfolio'?await page.locator('.motion-intro').count():0;
  record.introAfterWatchdog=intro;
  await scrollAll(page);
  await page.screenshot({path:`.work/motion-after/${name}-en-1440.png`,fullPage:true});
  for(const width of sizes){await page.setViewportSize({width,height:900});await page.waitForTimeout(120);record.viewports[`en-${width}`]=await overflow(page);if(record.viewports[`en-${width}`])errors.push(`EN overflow ${width}`)}
  for(let i=0;i<5;i++)await page.locator(name==='portfolio'?'#lang':'.language-toggle').click();
  await page.waitForTimeout(160);
  const afterRapid=await page.evaluate(()=>window.ScrollTrigger?.getAll().length??0);
  await page.locator(name==='portfolio'?'#lang':'.language-toggle').click();await page.waitForTimeout(140);
  const afterSecondCycle=await page.evaluate(()=>window.ScrollTrigger?.getAll().length??0);
  record.language={lang:await page.locator('html').getAttribute('lang'),dir:await page.locator('html').getAttribute('dir'),triggersAfterRapid:afterRapid,triggersAfterSecondCycle:afterSecondCycle};
  if(record.language.lang!=='en'||record.language.dir!=='ltr')errors.push('rapid language switch state mismatch');
  if(afterRapid!==afterSecondCycle)errors.push('ScrollTrigger count changed after repeated language switching');
  await scrollAll(page);
  for(const width of sizes){await page.setViewportSize({width,height:900});await page.waitForTimeout(120);record.viewports[`en2-${width}`]=await overflow(page);if(record.viewports[`en2-${width}`])errors.push(`EN resized overflow ${width}`)}
  await page.locator(name==='portfolio'?'#lang':'.language-toggle').click();await page.waitForTimeout(120);await scrollAll(page);
  record.language.ar={lang:await page.locator('html').getAttribute('lang'),dir:await page.locator('html').getAttribute('dir')};
  for(const width of sizes){await page.setViewportSize({width,height:900});await page.waitForTimeout(120);record.viewports[`ar-${width}`]=await overflow(page);if(record.viewports[`ar-${width}`])errors.push(`AR overflow ${width}`)}
  await page.setViewportSize({width:390,height:844});await scrollAll(page);await page.screenshot({path:`.work/motion-after/${name}-ar-390.png`,fullPage:true});
  if(name==='portfolio'){
    await page.locator('#menu').click();if(await page.locator('#menu').getAttribute('aria-expanded')!=='true')errors.push('mobile navigation failed to open');
    await page.locator('#lang').click();await page.locator('#menu').click();await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact-form [name=name]').fill('Mina Ibrahim');await page.locator('#contact-form [name=need]').selectOption({index:1});await page.locator('#contact-form [name=budget]').selectOption({index:1});await page.locator('#contact-form [name=message]').fill('A bilingual business landing page.');
    await page.evaluate(()=>{window.open=url=>{window.__openedTarget=url;return {closed:false}}});
    await page.locator('#contact-form button[type=submit]').click();record.contactForm=await page.evaluate(()=>window.__openedTarget?.startsWith('https://wa.me/')||false);if(!record.contactForm)errors.push('portfolio form did not open expected follow-up');
  }
  if(name==='restaurant'){
    await page.locator('#restaurant-filters button[data-group="main"]').click();record.filterCount=await page.locator('#restaurant-menu .dish-card').count();
    const form=page.locator('#restaurant-reservation');await form.locator('[name=name]').fill('Mina Ibrahim');await form.locator('[name=phone]').fill('+20 100 123 4567');await form.locator('[name=date]').fill('2027-01-17');await form.locator('[name=people]').selectOption('3');await form.locator('button[type=submit]').click();record.reservation=await form.locator('output a').count()===1;
    if(record.filterCount!==3||!record.reservation)errors.push('restaurant interaction regression');
  }
  if(name==='clinic'){
    const form=page.locator('#clinic-booking');await form.locator('[name=name]').fill('Mina Ibrahim');await form.locator('[name=email]').fill('mina@example.com');await form.locator('[name=phone]').fill('+20 100 123 4567');await form.locator('[name=service]').selectOption('prevention');await form.locator('[name=date]').fill('2027-01-17');await form.locator('[name=time]').selectOption('morning');await form.locator('button[type=submit]').click();record.booking=(await form.locator('output').textContent()).includes('Mina');if(!record.booking)errors.push('clinic booking regression');
  }
  if(name==='store'){
    await page.locator('#store-search').fill('ceramic');record.search=await page.locator('.product-card').count()>0;await page.locator('#store-search').fill('');await page.locator('#store-filters [data-category=table]').click();record.filterCount=await page.locator('.product-card').count();await page.locator('#store-filters [data-category=all]').click();
    for(let i=0;i<3;i++){await page.locator('.product-open').first().click();await page.locator('#product-dialog .dialog-close').click()}
    await page.locator('.quick-add').first().click();record.cartOpen=await page.locator('#cart-panel').evaluate(e=>e.classList.contains('open'));await page.locator('#cart-lines [data-cart-action=plus]').click();record.cartCount=(await page.locator('#cart-count').textContent()).trim();await page.locator('.cart-close').click();await page.locator('#newsletter-email').fill('mina@example.com');await page.locator('#newsletter-form button[type=submit]').click();record.newsletter=(await page.locator('#newsletter-form output').textContent()).length>0;
    if(!record.search||record.filterCount!==3||!record.cartOpen||!record.newsletter)errors.push('store interaction regression');
  }
  record.finalErrors={errors,warnings,pageErrors};results.sites.push(record);await page.close();
}
for(const mode of ['gsap-missing','plugin-missing','reduced-motion','session-storage-blocked','animation-throws']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  if(mode==='reduced-motion')await page.emulateMedia({reducedMotion:'reduce'});
  if(mode==='session-storage-blocked')await page.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}}));
  if(mode==='gsap-missing')await page.route('**/assets/vendor/gsap.min.js',r=>r.abort());
  if(mode==='plugin-missing')await page.route('**/assets/vendor/ScrollTrigger.min.js',r=>r.abort());
  if(mode==='animation-throws')await page.route('**/assets/vendor/gsap.min.js',async r=>{const response=await r.fetch();let body=await response.text();body+='\nwindow.gsap.fromTo=()=>{throw new Error("simulated init failure")};window.gsap.to=()=>{throw new Error("simulated init failure")};';await r.fulfill({response,body})});
  await page.goto('http://localhost:8000/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1700);
  const state=await page.evaluate(()=>({heading:document.querySelector('#headline')?.textContent,headingVisible:!!document.querySelector('#headline')&&getComputedStyle(document.querySelector('#headline')).visibility==='visible',skipCount:document.querySelectorAll('.motion-intro-skip').length,introCount:document.querySelectorAll('.motion-intro').length,triggerCount:window.ScrollTrigger?.getAll().length??0,bodyOpacity:getComputedStyle(document.body).opacity}));
  const item={mode,state};
  if(!state.headingVisible||state.bodyOpacity==='0')item.failure='Portfolio content is not visible';
  if(mode==='reduced-motion'&&(state.introCount||state.triggerCount))item.failure='Motion active under reduced motion';
  if(mode==='session-storage-blocked'&&state.introCount)item.failure='Intro did not fail safely without storage';
  results.failureModes.push(item);await page.close();
}
for(const mode of ['intro-button-skip','intro-escape','intro-session-once']){
  const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto('http://localhost:8000/',{waitUntil:'domcontentloaded'});
  await page.locator('.motion-intro').waitFor({state:'visible'}).catch(()=>{});
  let skipped=false;
  if(mode==='intro-button-skip'){await page.locator('.motion-intro-skip').click();skipped=await page.locator('.motion-intro').count()===0}
  if(mode==='intro-escape'){await page.keyboard.press('Escape');skipped=await page.locator('.motion-intro').count()===0}
  if(mode==='intro-session-once'){await page.waitForTimeout(700);await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(120);skipped=await page.locator('.motion-intro').count()===0}
  results.failureModes.push({mode,passed:skipped});if(!skipped)results.failureModes.at(-1).failure='Intro could not be skipped or session guard failed';await page.close();
}
const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await noJs.goto('http://localhost:8000/',{waitUntil:'domcontentloaded'});results.noJavaScript=await noJs.evaluate(()=>({bodyVisibility:getComputedStyle(document.body).visibility,bodyOpacity:getComputedStyle(document.body).opacity,headlineVisible:getComputedStyle(document.querySelector('#headline')).visibility==='visible'}));await noJs.close();
await fs.writeFile('.work/motion-after/report.json',JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify(results,null,2));
if(results.sites.some(s=>s.finalErrors.errors.length||s.finalErrors.warnings.length||s.finalErrors.pageErrors.length)||results.failureModes.some(x=>x.failure)||results.noJavaScript.bodyVisibility!=='visible'||results.noJavaScript.bodyOpacity==='0'||!results.noJavaScript.headlineVisible)process.exitCode=1;
