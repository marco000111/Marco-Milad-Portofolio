import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const sites = [
  ['portfolio','http://localhost:8000/'],
  ['restaurant','http://localhost:8000/demos/restaurant/'],
  ['clinic','http://localhost:8000/demos/clinic/'],
  ['store','http://localhost:8000/demos/store/'],
];
const report = { capturedAt: new Date().toISOString(), sites: [] };
await fs.mkdir('.work/motion-baseline',{recursive:true});
for (const [name,url] of sites) {
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const consoleErrors=[]; const consoleWarnings=[]; const pageErrors=[]; const failedRequests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());if(m.type()==='warning')consoleWarnings.push(m.text());});
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('requestfailed',r=>{if(!r.url().includes('fonts.googleapis.com'))failedRequests.push(`${r.url()}: ${r.failure()?.errorText}`);});
  const response=await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`.work/motion-baseline/${name}-en-1440.png`,fullPage:true});
  const initial=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,dir:document.documentElement.dir,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,bodyText:document.body.innerText.length,buttons:document.querySelectorAll('button').length,forms:document.querySelectorAll('form').length}));
  const test={name,status:response.status(),initial,consoleErrors,consoleWarnings,pageErrors,failedRequests};
  if(name==='portfolio') {
    await page.locator('#lang').click();
    test.language={lang:await page.locator('html').getAttribute('lang'),dir:await page.locator('html').getAttribute('dir')};
    await page.setViewportSize({width:390,height:844});
    await page.locator('#menu').click();
    test.mobileNav={expanded:await page.locator('#menu').getAttribute('aria-expanded'),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
    await page.screenshot({path:'.work/motion-baseline/portfolio-ar-390.png',fullPage:true});
  } else {
    await page.locator('.language-toggle').click();
    test.language={lang:await page.locator('html').getAttribute('lang'),dir:await page.locator('html').getAttribute('dir')};
    await page.setViewportSize({width:390,height:844});
    test.mobile={overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
    await page.screenshot({path:`.work/motion-baseline/${name}-ar-390.png`,fullPage:true});
  }
  report.sites.push(test);
  await page.close();
}
const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
for(const [name,url] of sites){await noJs.goto(url,{waitUntil:'domcontentloaded'});const result=await noJs.evaluate(()=>({site:location.pathname,text:document.body.innerText.length,bodyVisible:getComputedStyle(document.body).visibility,opacity:getComputedStyle(document.body).opacity}));report.noJavaScript??=[];report.noJavaScript.push(result);}
await noJs.close();
await browser.close();
await fs.writeFile('.work/motion-baseline/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
