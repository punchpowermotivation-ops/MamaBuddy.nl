// Genereert de MamaBuddy PWA-icoons uit het hart-logo (bron: CLAUDE.md).
// Run: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

// Hart-icoon met cream achtergrond — het hart blijft ruim (~59% diameter)
// binnen de veilige maskable-zone, zodat Android het niet afsnijdt.
const heartIconSvg = `
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FDF8F3"/>
  <circle cx="256" cy="256" r="150" stroke="#F2567A" stroke-width="20" fill="none"/>
  <path d="M256 340C256 340 180 288 180 226C180 200 201 179 227 179C240 179 252 185 256 194C260 185 272 179 285 179C311 179 332 200 332 226C332 288 256 340 256 340Z" fill="#F2567A"/>
</svg>
`;

// Los hart-mark (transparante achtergrond) voor de favicon.svg — schaalt scherp op elk formaat.
const heartMarkSvg = `
<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26" cy="26" r="22" stroke="#F2567A" stroke-width="2.8" fill="none"/>
  <path d="M26 38C26 38 15 30.5 15 21.5C15 17.9 17.9 15 21.5 15C23.4 15 25.1 15.8 26 17.1C26.9 15.8 28.6 15 30.5 15C34.1 15 37 17.9 37 21.5C37 30.5 26 38 26 38Z" fill="#F2567A"/>
</svg>
`;

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-16x16.png', size: 16 },
];

for (const { file, size } of targets) {
  await sharp(Buffer.from(heartIconSvg))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, file));
  console.log(`✓ ${file} (${size}x${size})`);
}

writeFileSync(path.join(publicDir, 'favicon.svg'), heartMarkSvg.trim());
console.log('✓ favicon.svg (hart-mark, transparant)');
