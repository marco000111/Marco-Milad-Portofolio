import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname.endsWith('/')) pathname += 'index.html';
    const target = resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + sep)) throw new Error('Invalid path');
    const content = await readFile(target);
    const compressible = /\.(?:html|css|js|mjs|svg|xml|txt)$/i.test(target);
    const compressed = compressible && /\bgzip\b/.test(request.headers['accept-encoding'] || '') ? gzipSync(content) : content;
    response.writeHead(200, {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      ...(compressed !== content ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}),
    });
    response.end(compressed);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(8000, () => console.log('Portfolio preview: http://localhost:8000'));
