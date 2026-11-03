import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'M:/My Portofolio/.work/immersive/proof';
await mkdir(output, { recursive: true });
const targets = await fetch('http://127.0.0.1:9224/json').then((response) => response.json());
const target = targets.find((item) => item.type === 'page');
if (!target) throw new Error('No Chromium DevTools page target is available on port 9224.');

let messageId = 0;
const pending = new Map();
const frames = { intro: [], hero3d: [], projects3d: [], scroll: [] };
const browserErrors = [];
const networkIssues = [];
const requestUrls = new Map();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') browserErrors.push(message.params.entry.text);
  if (message.method === 'Network.requestWillBeSent') requestUrls.set(message.params.requestId, message.params.request.url);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) networkIssues.push({ status: message.params.response.status, url: message.params.response.url });
  if (message.method === 'Network.loadingFailed' && message.params.errorText !== 'net::ERR_ABORTED') networkIssues.push({ error: message.params.errorText, url: requestUrls.get(message.params.requestId) });
  if (message.method === 'Page.screencastFrame') {
    if (activeClip) frames[activeClip].push({ data: message.params.data, timestamp: Date.now() });
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

let activeClip = null;
function send(method, params = {}) {
  const id = ++messageId;
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(expression, timeout = 4500) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return true;
    await wait(100);
  }
  return false;
}
async function screenshot(name) {
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  await writeFile(`${output}/${name}.png`, Buffer.from(shot.data, 'base64'));
}
async function movePointer(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0, pointerType: 'mouse' });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setTouchEmulationEnabled', { enabled: false });
await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
await wait(550);
await evaluate(`sessionStorage.removeItem('portfolio-welcome-seen'); localStorage.setItem('portfolio-language','en')`);
const timingProbe = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { window.__introTiming={start:null,elapsed:null}; const matches=(node)=>node.nodeType===1&&(node.matches?.('.cinematic-intro')||node.querySelector?.('.cinematic-intro')); const observer=new MutationObserver(records=>{ for(const record of records){ for(const node of record.addedNodes){if(matches(node)&&window.__introTiming.start===null)window.__introTiming.start=performance.now()} for(const node of record.removedNodes){if(matches(node)&&!document.querySelector('.cinematic-intro')&&window.__introTiming.start!==null)window.__introTiming.elapsed=performance.now()-window.__introTiming.start} } }); const observe=()=>{if(document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});else document.addEventListener('DOMContentLoaded',observe,{once:true})}; observe(); })();` });
await send('Page.startScreencast', { format: 'jpeg', quality: 74, maxWidth: 1280, maxHeight: 900, everyNthFrame: 1 });
await send('Page.reload', { ignoreCache: true });
const introFreshSession = await waitFor(`Boolean(document.querySelector('.cinematic-intro'))`);
if (!introFreshSession) throw new Error('Fresh-session intro did not appear in the running app.');
activeClip = 'intro';
const introStartedAt = Date.now();
await wait(1150);
const introAssemblyVisible = await evaluate(`Boolean(document.querySelector('.three-name-scene--intro')?.dataset.threeReady && document.querySelector('.cinematic-intro'))`);
const introThree = await evaluate(`JSON.stringify((() => { const node=document.querySelector('.three-name-scene--intro'); return { renderer:Boolean(node?.querySelector('canvas')),ready:node?.dataset.threeReady,geometry:node?.dataset.geometry,letterCount:node?.dataset.letterCount,extrusionDepth:node?.dataset.extrusionDepth,beveled:node?.dataset.beveled }; })())`);
await wait(830);
await screenshot('cinematic-intro');
await wait(600);
const introTransitionsIntoHero = await evaluate(`!document.querySelector('.cinematic-intro') && document.querySelector('.hero-portrait')?.naturalWidth > 0`);
const introDurationMs = Date.now() - introStartedAt;
const introObservedDurationMs = await evaluate(`window.__introTiming?.elapsed`);
await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: timingProbe.identifier });
activeClip = null;

await send('Page.reload', { ignoreCache: true });
await wait(550);
const introSuppressedForExistingSession = await evaluate(`!document.querySelector('.cinematic-intro')`);
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?intro=force' });
const forceReplayWorks = await waitFor(`Boolean(document.querySelector('.cinematic-intro'))`);
if (!forceReplayWorks) throw new Error('The ?intro=force development replay did not appear.');
await evaluate(`document.querySelector('.preloader-skip')?.click()`);
const introSkipWorks = await waitFor(`!document.querySelector('.cinematic-intro') && sessionStorage.getItem('portfolio-welcome-seen') === '1'`, 1800);
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?intro=force' });
const forcedReplayCompletes = await waitFor(`Boolean(document.querySelector('.cinematic-intro'))`);
if (!forcedReplayCompletes) throw new Error('The second forced intro did not start before hero interaction capture.');
await waitFor(`!document.querySelector('.cinematic-intro')`, 3500);
await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
await wait(450);

activeClip = 'hero3d';
await movePointer(190, 150);
await wait(300);
const heroNameBox = await evaluate(`document.querySelector('.three-name-scene--hero').getBoundingClientRect().toJSON()`);
for (const [fx, fy] of [
  [.12,.35], [.82,.25], [.72,.74], [.27,.68], [.5,.5],
]) {
  await movePointer(heroNameBox.left + heroNameBox.width * fx, heroNameBox.top + heroNameBox.height * fy);
  await wait(300);
}
await movePointer(heroNameBox.left + heroNameBox.width * .76, heroNameBox.top + heroNameBox.height * .58);
await wait(400);
await screenshot('hero-3d-interaction');
const heroPerspective = await evaluate(`(() => { const stage=document.querySelector('.hero-portrait-stage'); const style=getComputedStyle(stage); const scene=document.querySelector('.three-name-scene--hero'); const box=scene?.getBoundingClientRect(); return { perspective: style.perspective, transform: style.transform, depthShiftX: document.querySelector('#home').style.getPropertyValue('--depth-shift-x'), backgroundPlane: Boolean(document.querySelector('.hero-depth-backplane')), depthObjects: document.querySelectorAll('.hero-depth-object').length,threeReady:scene?.dataset.threeReady,geometry:scene?.dataset.geometry,letterCount:scene?.dataset.letterCount,extrusionDepth:scene?.dataset.extrusionDepth,geometryBounds:scene?.dataset.geometryBounds,geometryWidth:scene?.dataset.geometryWidth,geometryHeight:scene?.dataset.geometryHeight,uniformScale:scene?.dataset.uniformScale,cameraDistance:scene?.dataset.cameraDistance,framedWidthRatio:scene?.dataset.framedWidthRatio,sceneBox:box?{x:box.x,y:box.y,width:box.width,height:box.height}:null }; })()`);
const threePointerResponds = await evaluate(`(() => { const scene=document.querySelector('.three-name-scene--hero'); return Boolean(scene?.dataset.pointerX && Math.abs(Number(scene.dataset.pointerX)) > .05); })()`);
await wait(650);
activeClip = null;

await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
await wait(450);
await screenshot('hero-3d-tablet');
const tabletThreeFits = await evaluate(`(() => { const node=document.querySelector('.three-name-scene--hero'); const box=node?.getBoundingClientRect(); return Boolean(node?.dataset.threeReady && box && box.left>=0 && box.right<=innerWidth && Number(node.dataset.framedWidthRatio)<1); })()`);
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await wait(350);

await evaluate(`document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
await wait(700);
const projectRect = await evaluate(`document.querySelector('.project-art').getBoundingClientRect().toJSON()`);
activeClip = 'projects3d';
for (const [fx, fy] of [[.18,.2],[.82,.2],[.8,.8],[.2,.8],[.5,.5],[.7,.35]]) {
  await movePointer(projectRect.left + projectRect.width * fx, projectRect.top + projectRect.height * fy);
  await wait(250);
}
await screenshot('projects-3d-interaction');
const projectLayers = await evaluate(`(() => { const card=document.querySelector('.project-art'); const s=getComputedStyle(card); return { tiltClass: card.classList.contains('is-tilting'), tiltX: card.style.getPropertyValue('--pointer-tilt-x'), tiltY: card.style.getPropertyValue('--pointer-tilt-y'), imageTransform:getComputedStyle(card.querySelector('img')).transform, metadataTransform:getComputedStyle(card.querySelector('.project-art-meta')).transform, reflection:getComputedStyle(card,'::before').backgroundImage }; })()`);
await wait(650);
activeClip = null;

await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
await wait(450);
activeClip = 'scroll';
const sectionProgress = [];
for (let index = 0; index < 15; index += 1) {
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 1000, y: 730, deltaX: 0, deltaY: 570, pointerType: 'mouse' });
  await wait(380);
  sectionProgress.push(await evaluate(`(() => { const active=[...document.querySelectorAll('main > section')].find(s=>{const r=s.getBoundingClientRect();return r.top<=innerHeight*.45&&r.bottom>innerHeight*.45}); const scene=document.querySelector('.manifesto-scene'); const rect=scene?.getBoundingClientRect(); return {y:Math.round(scrollY),active:active?.id||active?.className,pinSpacer:Boolean(scene?.parentElement?.classList.contains('pin-spacer')),pinSceneAtTop:rect ? Math.abs(rect.top-76)<5 : false}; })()`));
}
await wait(550);
activeClip = null;

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
await evaluate(`document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
await wait(700);
const touchRect = await evaluate(`document.querySelector('.project-art').getBoundingClientRect().toJSON()`);
await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchRect.left + touchRect.width / 2, y: touchRect.top + touchRect.height / 2, id: 1 }] });
await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await wait(500);
const mobileProjectTapOpensDetails = await evaluate(`Boolean(document.querySelector('[role="dialog"]'))`);
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);
await wait(450);
await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
await screenshot('mobile-touch-390');
const mobileDocFitsViewport = await evaluate(`document.documentElement.scrollWidth <= innerWidth`);

await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?intro=force' });
await wait(650);
const reducedMotionSkipsIntro = await evaluate(`!document.querySelector('.cinematic-intro')`);
await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

const webglBlocker = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){ if(type==='webgl'||type==='webgl2'||type==='experimental-webgl') return null; return original.call(this,type,...args); }; })();` });
await send('Page.navigate', { url: 'http://127.0.0.1:5173/?intro=force' });
await waitFor(`Boolean(document.querySelector('.three-name-scene.is-fallback'))`, 3500);
const webglFallbackWorks = await evaluate(`Boolean(document.querySelector('.three-name-scene.is-fallback') && document.querySelector('.preloader-skip'))`);
await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: webglBlocker.identifier });

await send('Page.stopScreencast');
const requiredClips = Object.fromEntries(Object.entries(frames).map(([name, list]) => [name, list.length]));
if (Object.values(requiredClips).some((count) => count < 8)) throw new Error(`Insufficient browser frames were captured: ${JSON.stringify(requiredClips)}`);
const assemblyFrame = frames.intro.reduce((closest, frame) =>
  Math.abs(frame.timestamp - (introStartedAt + 1400)) < Math.abs(closest.timestamp - (introStartedAt + 1400)) ? frame : closest,
);
await writeFile(`${output}/three-name-assembly.jpg`, Buffer.from(assemblyFrame.data, 'base64'));

const recorderHtml = `<!doctype html><meta charset="utf-8"><title>Encode browser interaction proof</title><body>Encoding real browser captures…</body><script type="module">
const manifest = ${JSON.stringify(Object.fromEntries(Object.entries(frames).map(([name, list]) => [name, list.map(({ timestamp }) => timestamp)])))};
const canvas=document.createElement('canvas'); canvas.width=1280; canvas.height=800; document.body.append(canvas);
const context=canvas.getContext('2d');
for (const [name,timestamps] of Object.entries(manifest)) {
  const count=timestamps.length;
  const images=await Promise.all(Array.from({length:count},(_,index)=>{const image=new Image();image.src='/frame/'+name+'/'+index;return image.decode().then(()=>image)}));
  const stream=canvas.captureStream(30);
  const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2200000});
  const chunks=[];
  recorder.ondataavailable=(event)=>{if(event.data.size)chunks.push(event.data)};
  const stopped=new Promise(resolve=>{recorder.onstop=resolve});
  recorder.start();
  for(let index=0;index<images.length;index++){context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(images[index],0,0,canvas.width,canvas.height);const delta=index+1<timestamps.length?timestamps[index+1]-timestamps[index]:80;await new Promise(resolve=>setTimeout(resolve,Math.max(16,Math.min(500,delta))))}
  recorder.stop(); await stopped;
  const blob=new Blob(chunks,{type:'video/webm'});
  await fetch('/save/'+name,{method:'POST',body:blob});
  document.body.dataset[name]='saved';
}
document.body.dataset.done='true';
</script>`;
let resolveAllUploads;
const uploadsDone = new Promise((resolve) => { resolveAllUploads = resolve; });
let uploadsRemaining = Object.keys(frames).length;
const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1:4176');
  if (request.method === 'GET' && url.pathname === '/record.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(recorderHtml); return;
  }
  if (request.method === 'GET' && url.pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
  if (request.method === 'GET' && url.pathname.startsWith('/frame/')) {
    const [, , name, index] = url.pathname.split('/'); const frame = frames[name]?.[Number(index)];
    if (!frame) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'no-store' }); response.end(Buffer.from(frame.data, 'base64')); return;
  }
  if (request.method === 'POST' && url.pathname.startsWith('/save/')) {
    const name = url.pathname.split('/').at(-1); const chunks=[]; for await (const chunk of request) chunks.push(chunk);
    await writeFile(`${output}/${name === 'hero3d' ? 'hero-3d-interaction' : name === 'projects3d' ? 'project-3d-interaction' : name === 'scroll' ? 'full-page-scroll' : 'full-cinematic-intro'}.webm`, Buffer.concat(chunks));
    response.writeHead(201, { 'content-type': 'text/plain' }); response.end('saved', () => { uploadsRemaining -= 1; if (!uploadsRemaining) resolveAllUploads(); }); return;
  }
  response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(4176, '127.0.0.1', resolve));
await send('Page.navigate', { url: 'http://127.0.0.1:4176/record.html' });
await Promise.race([uploadsDone, wait(90000).then(() => { throw new Error('Timed out while encoding the browser recordings.'); })]);
await wait(250);
server.close();

const outputSummary = {
  checks: {
    introFreshSession,
    introDurationMs,
    introObservedDurationMs,
    introTransitionsIntoHero,
    introThree: JSON.parse(introThree),
    introAssemblyVisible,
    introSuppressedForExistingSession,
    forceReplayWorks,
    introSkipWorks,
    heroPerspective,
    threePointerResponds,
    tabletThreeFits,
    projectLayers,
    mobileProjectTapOpensDetails,
    mobileDocFitsViewport,
    reducedMotionSkipsIntro,
    webglFallbackWorks,
  },
  sectionProgress,
  capturedFrames: requiredClips,
  browserErrors,
  networkIssues,
};
await writeFile(`${output}/verification-results.json`, JSON.stringify(outputSummary, null, 2));
console.log(JSON.stringify(outputSummary, null, 2));
socket.close();
