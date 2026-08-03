// Vercel resolves the exact "/" request to dist/index.html as the implicit
// static document BEFORE any vercel.json rewrite is even considered — a
// rewrite rule targeting "/" specifically has no effect (confirmed: it kept
// serving the plain shell). So instead of fighting that precedence, this
// script embraces it:
//   - dist/index.html becomes the PRERENDERED landing page (what "/"
//     naturally resolves to).
//   - dist/app.html is an unmodified copy of the original SPA shell, and
//     vercel.json's catch-all rewrite sends every other route there, so
//     /chat, /profiel, etc. never flash landing-page markup.
import { readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const ssrEntryPath = path.join(root, 'dist-ssr', 'entry-server.js');
const { render } = await import(pathToFileURL(ssrEntryPath).href);

const html = render();

const indexPath = path.join(root, 'dist', 'index.html');
const appShellPath = path.join(root, 'dist', 'app.html');

const template = readFileSync(indexPath, 'utf-8');

// Preserve the original, unmodified shell for every non-root route.
copyFileSync(indexPath, appShellPath);

const injected = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

if (injected === template) {
  throw new Error('Prerender: <div id="root"></div> not found in dist/index.html — check the template.');
}

writeFileSync(indexPath, injected);
rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log('✓ dist/index.html is nu de geprerenderde landingpagina; dist/app.html is de SPA-shell voor overige routes.');
