// Vercel resolves the exact "/" request to dist/index.html as the implicit
// static document BEFORE any vercel.json rewrite is even considered — a
// rewrite rule targeting "/" specifically has no effect (confirmed: it kept
// serving the plain shell). So instead of fighting that precedence, this
// script embraces it:
//   - dist/index.html becomes the PRERENDERED landing page (what "/"
//     naturally resolves to), with JSON-LD structured data injected into
//     <head> so crawlers get facts about the product without guessing.
//   - dist/app.html is an unmodified copy of the original SPA shell, and
//     vercel.json's catch-all rewrite sends every other route there, so
//     /chat, /profiel, etc. never flash landing-page markup or carry
//     landing-only structured data.
import { readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { FAQS } from '../src/data/faq.js';

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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MamaBuddy',
  url: 'https://mamabuddy.nl',
  logo: 'https://mamabuddy.nl/icon-512.png',
  description:
    'MamaBuddy is een persoonlijke coach-app voor moeders in Nederland en België. Buddy is 24/7 beschikbaar, onthoudt jouw situatie, en helpt bij mama burn-out, dagelijkse stress en mental load.',
  sameAs: ['https://www.instagram.com/mamabuddy_nl', 'https://www.tiktok.com/@mamabuddy.nl'],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MamaBuddy',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web, iOS, Android (PWA)',
  description:
    'Persoonlijke coach-app voor moeders. 24/7 beschikbaar via chat, onthoudt jouw situatie, helpt bij mama burn-out, mental load en dagelijkse stress. Gratis te proberen.',
  offers: [
    { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'EUR' },
    {
      '@type': 'Offer',
      name: 'Premium',
      price: '7.99',
      priceCurrency: 'EUR',
      billingIncrement: 'P1M',
    },
  ],
  // No aggregateRating: never publish fictional review numbers — only add
  // this once there are real, verifiable reviews to report.
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.shortAnswer },
  })),
};

const jsonLdScripts = [organizationJsonLd, softwareJsonLd, faqJsonLd]
  .map(
    (obj) =>
      `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`,
  )
  .join('\n    ');

let injected = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

if (injected === template) {
  throw new Error('Prerender: <div id="root"></div> not found in dist/index.html — check the template.');
}

injected = injected.replace('</head>', `${jsonLdScripts}\n  </head>`);

writeFileSync(indexPath, injected);
rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log('✓ dist/index.html is nu de geprerenderde landingpagina (incl. JSON-LD); dist/app.html is de SPA-shell voor overige routes.');
