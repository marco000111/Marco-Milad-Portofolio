import { mkdir, writeFile } from 'node:fs/promises';
const folder = 'M:/My Portofolio/.work/immersive/baseline';
await mkdir(folder, { recursive: true });
const [page] = await fetch('http://127.0.0.1:9224/json').then((response) => response.json());
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (!message.id) return; const item = pending.get(message.id); if (!item) return; pending.delete(message.id); item.resolve(message.result); });
const call = (method, params = {}) => new Promise((resolve) => { const requestId = ++id; pending.set(requestId, { resolve }); socket.send(JSON.stringify({ id: requestId, method, params })); });
const evaluate = async (expression) => (await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function shot(name) { await sleep(600); const data = await call('Page.captureScreenshot', { format: 'png', fromSurface: true }); await writeFile(`${folder}/${name}.png`, Buffer.from(data.data, 'base64')); }
await call('Page.enable'); await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await evaluate("localStorage.removeItem('portfolio-language')");
await call('Page.navigate', { url: 'http://127.0.0.1:5173/' }); await sleep(1600);
const baseline = await evaluate(`({ title: document.title, sections: [...document.querySelectorAll('main > section')].map((item) => item.id || item.className), imageLoaded: document.querySelector('.hero-portrait')?.naturalWidth > 0, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth })`);
await shot('desktop-home');
for (const [selector, name] of [['#projects','desktop-projects'],['#about','desktop-about'],['.skills-section','desktop-skills'],['#contact','desktop-contact']]) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({ behavior:'instant', block:'start' })`); await sleep(500); await shot(name); }
await call('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true });
await evaluate("window.scrollTo({top:0,behavior:'instant'})"); await sleep(400); await shot('360-home');
baseline.mobileWidth = await evaluate('({ documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth })');
await writeFile(`${folder}/baseline.json`, JSON.stringify(baseline, null, 2));
console.log(JSON.stringify(baseline)); socket.close();
