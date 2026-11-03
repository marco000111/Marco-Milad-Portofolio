import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');

await mkdir(output, { recursive: true });
await Promise.all(
  ['assets', 'demos'].map((directory) =>
    cp(resolve(root, directory), resolve(output, directory), { recursive: true }),
  ),
);
await Promise.all(
  ['robots.txt', 'sitemap.xml'].map((file) =>
    cp(resolve(root, file), resolve(output, file)),
  ),
);
