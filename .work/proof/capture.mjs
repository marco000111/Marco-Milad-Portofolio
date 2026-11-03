import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const root = 'M:/My Portofolio/.work/proof';
await mkdir(root, { recursive: true });
const pages = await fetch('http://127.0.0.1:9224/json').then((response) => response.json());
const page = pages.find((item) => item.type === 'page');
if (!page) throw new Error('No Edge page target found on port 9224.');

let nextId = 0;
const pending = new Map();
const screencastFrames = [];
const browserErrors = [];
const networkIssues = [];
const requests = new Map();
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') browserErrors.push(message.params.entry.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) networkIssues.push({ status: message.params.response.status, url: message.params.response.url });
  if (message.method === 'Network.requestWillBeSent') requests.set(message.params.requestId, message.params.request.url);
  if (message.method === 'Network.loadingFailed') networkIssues.push({ error: message.params.errorText, url: requests.get(message.params.requestId) });
  if (message.method === 'Page.screencastFrame') {
    screencastFrames.push(message.params.data);
    void send('Page.screencastFrameAck', { sessionId: message.params.sessionId });
    return;
  }
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function wait(ms = 800) { await new Promise((resolve) => setTimeout(resolve, ms)); }

async function screenshot(name) {
  await wait(500);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  await writeFile(`${root}/${name}.png`, Buffer.from(shot.data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await evaluate(`localStorage.removeItem('portfolio-language')`);
await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
await wait(2200);
await screenshot('desktop-home');

const initialState = await evaluate(`(() => ({
  title: document.title,
  heroImage: { complete: document.querySelector('.hero-portrait')?.complete, naturalWidth: document.querySelector('.hero-portrait')?.naturalWidth, opacity: getComputedStyle(document.querySelector('.hero-portrait')).opacity },
  heroName: { opacity: getComputedStyle(document.querySelector('.hero-name')).opacity, rect: document.querySelector('.hero-name').getBoundingClientRect().toJSON() },
  sections: [...document.querySelectorAll('main > section')].map((section) => section.id || section.className),
  width: { inner: innerWidth, document: document.documentElement.scrollWidth }
}))()`);

for (const [id, name] of [['projects', 'desktop-projects'], ['about', 'desktop-about'], ['.manifesto-scene', 'desktop-manifesto'], ['skills', 'desktop-skills'], ['resume', 'desktop-resume'], ['contact', 'desktop-contact']]) {
  await evaluate(`(() => { document.querySelector(${JSON.stringify(id.startsWith('.') ? id : `#${id}`)})?.scrollIntoView({ behavior: 'instant', block: 'start' }); return true; })()`);
  await wait(1600);
  await screenshot(name);
}

const interactionResults = {};
await evaluate(`(() => document.querySelector('.project-filter button:nth-child(2)')?.click())()`);
await wait(500);
interactionResults.websiteFilterCount = await evaluate(`document.querySelectorAll('.project-card').length`);
await evaluate(`(() => document.querySelector('.project-action-detail')?.click())()`);
await wait(500);
interactionResults.projectDialogOpened = await evaluate(`Boolean(document.querySelector('[role="dialog"]'))`);
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
await wait(400);
interactionResults.projectDialogClosed = await evaluate(`!document.querySelector('[role="dialog"]')`);
await evaluate(`(() => document.querySelector('.project-filter button:first-child')?.click())()`);
await wait(350);
const railBefore = await evaluate(`document.querySelector('.projects-grid').scrollLeft`);
await evaluate(`(() => document.querySelector('.project-rail-controls button:last-child')?.click())()`);
await wait(750);
interactionResults.projectRailAdvanced = await evaluate(`document.querySelector('.projects-grid').scrollLeft !== ${railBefore}`);
await evaluate(`(() => document.querySelector('.contact-form button[type="submit"]')?.click())()`);
await wait(250);
interactionResults.requiredContactFieldsPreventSubmit = await evaluate(`Boolean(document.querySelector('.contact-form :invalid'))`);
await evaluate(`(() => document.querySelector('.language-switcher button[aria-pressed="false"]')?.click())()`);
await wait(600);
interactionResults.arabicDirection = await evaluate(`({ lang: document.documentElement.lang, dir: document.documentElement.dir, overflow: document.documentElement.scrollWidth <= innerWidth })`);
await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
await wait(1400);
await screenshot('desktop-arabic-home');

for (const width of [360, 768]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: width === 360 ? 800 : 1024, deviceScaleFactor: 1, mobile: width === 360 });
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await wait(650);
  await screenshot(`${width}-home-rtl`);
  interactionResults[`overflow-${width}`] = await evaluate(`document.documentElement.scrollWidth <= innerWidth`);
}
await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
interactionResults.reducedMotionDisablesMarquee = await evaluate(`getComputedStyle(document.querySelector('.manifesto-marquee-track')).animationDuration === '1e-05s' || getComputedStyle(document.querySelector('.manifesto-marquee-track')).animationDuration === '0.00001s'`);
await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await evaluate(`(() => document.querySelector('.language-switcher button[aria-pressed="false"]')?.click())()`);
await wait(500);
await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
await wait(700);
await send('Page.startScreencast', { format: 'jpeg', quality: 68, maxWidth: 1280, maxHeight: 800, everyNthFrame: 5 });
await wait(1300);
for (const [selector, delay] of [
  ['.desktop-nav a[href="#projects"]', 1900],
  ['.desktop-nav a[href="#about"]', 2100],
  ['#main .manifesto-scene', 2200],
  ['.desktop-nav a[href="#skills"]', 2500],
  ['.desktop-nav a[href="#resume"]', 2100],
  ['.desktop-nav a[href="#contact"]', 2300],
  ['.desktop-nav a[href="#home"]', 1900],
]) {
  await evaluate(`(() => { const item = document.querySelector(${JSON.stringify(selector)}); if (item instanceof HTMLAnchorElement) item.click(); else item?.scrollIntoView({ behavior: 'smooth', block: 'start' }); })()`);
  await wait(delay);
}
await send('Page.stopScreencast');
await wait(300);
interactionResults.recordedFrames = screencastFrames.length;

const webmPath = `${root}/marco-milad-reference-experience.webm`;
const recorderHtml = `<!doctype html><meta charset="utf-8"><title>Building motion proof</title><canvas width="1280" height="800"></canvas><script type="module">
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const frames = ${JSON.stringify(screencastFrames.map((_, index) => `/frame/${index}`))};
const images = await Promise.all(frames.map((src) => { const image = new Image(); image.src = src; return image.decode().then(() => image); }));
const stream = canvas.captureStream(12);
const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2200000 });
const chunks = [];
recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
recorder.onstop = async () => { const blob = new Blob(chunks, { type: 'video/webm' }); await fetch('/save', { method: 'POST', body: blob }); document.body.dataset.saved = 'true'; };
recorder.start();
for (const frame of images) { context.drawImage(frame, 0, 0, canvas.width, canvas.height); await new Promise((resolve) => setTimeout(resolve, 1000 / 12)); }
recorder.stop();
</script>`;
const recordServer = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1:4175');
  if (request.method === 'GET' && url.pathname === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(recorderHtml);
    return;
  }
  if (request.method === 'GET' && url.pathname.startsWith('/frame/')) {
    const index = Number(url.pathname.split('/').at(-1));
    const frame = screencastFrames[index];
    if (!frame) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=3600' });
    response.end(Buffer.from(frame, 'base64'));
    return;
  }
  if (request.method === 'POST' && url.pathname === '/save') {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    await writeFile(webmPath, Buffer.concat(chunks));
    response.writeHead(201, { 'content-type': 'text/plain' });
    response.end('saved');
    return;
  }
  response.writeHead(404).end();
});
await new Promise((resolve) => recordServer.listen(4175, '127.0.0.1', resolve));
await send('Page.navigate', { url: 'http://127.0.0.1:4175/' });
for (let attempt = 0; attempt < 80 && !await import('node:fs/promises').then(({ stat }) => stat(webmPath).then(() => true, () => false)); attempt++) await wait(500);
const recording = await import('node:fs/promises').then(({ stat }) => stat(webmPath));
interactionResults.recordingBytes = recording.size;
interactionResults.browserErrors = browserErrors;
interactionResults.networkIssues = networkIssues;
recordServer.close();

console.log(JSON.stringify({ initialState, interactionResults }, null, 2));
socket.close();
