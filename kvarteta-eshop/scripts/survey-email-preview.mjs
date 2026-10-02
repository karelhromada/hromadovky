// Náhled dotazníkového e-mailu: node scripts/survey-email-preview.mjs <výstupní složka>
// Zapíše first.html a reminder.html (logo se načítá z produkce — musí být nasazené).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSurveyEmail } from './survey-email.mjs';

const outDir = process.argv[2];
if (!outDir) {
  process.stderr.write('Použití: node scripts/survey-email-preview.mjs <výstupní složka>\n');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
for (const kind of ['first', 'reminder']) {
  const { html } = buildSurveyEmail({
    kind,
    orderId: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
    token: 'a'.repeat(64),
    firstName: 'Jana',
    orderNumber: 'ORD-1790000000000',
    itemNames: ['Kvarteto Veselá rodina', 'Pexeso Dinosauři'],
  });
  writeFileSync(join(outDir, `${kind}.html`), html);
}
process.stdout.write(`Náhledy zapsány do ${outDir}\n`);
