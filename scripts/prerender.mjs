// Writes a separate dist/landing.html with the statically-rendered landing
// page markup injected, so crawlers get real content in the initial HTML
// response for "/" specifically. dist/index.html is left untouched (the
// clean SPA shell) so every other route doesn't briefly flash landing-page
// markup before React mounts the real page — vercel.json routes "/" to
// landing.html and everything else to index.html.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const ssrEntryPath = path.join(root, 'dist-ssr', 'entry-server.js');
const { render } = await import(pathToFileURL(ssrEntryPath).href);

const html = render();

const indexPath = path.join(root, 'dist', 'index.html');
const template = readFileSync(indexPath, 'utf-8');
const injected = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

if (injected === template) {
  throw new Error('Prerender: <div id="root"></div> not found in dist/index.html — check the template.');
}

writeFileSync(path.join(root, 'dist', 'landing.html'), injected);
rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log('✓ Landingpagina geprerenderd in dist/landing.html');
