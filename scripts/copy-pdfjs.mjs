// Copies pdf.js into public/pdfjs so the web app can load it at runtime.
// The web PDF viewer (src/features/media/PdfViewer.web.tsx) imports it from
// /pdfjs/ instead of bundling it, which keeps it out of the iPhone and Android
// apps. Runs after every `npm install`, including Vercel's.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The legacy build also supports older iPhones (Safari 16 and up).
const from = join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build');
const to = join(root, 'public', 'pdfjs');
mkdirSync(to, { recursive: true });
for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) copyFileSync(join(from, file), join(to, file));
console.log('pdf.js copied to public/pdfjs');
