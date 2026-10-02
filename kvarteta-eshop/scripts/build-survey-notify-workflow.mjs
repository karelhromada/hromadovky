// Vygeneruje definici n8n workflow „Hromadovky – Dotazník: notifikace odpovědi".
//
//   node scripts/build-survey-notify-workflow.mjs
//   → docs/n8n/dotaznik-notifikace.workflow.json
//
// Spouští ho DB trigger "survey-answered-webhook" (migrace 20261002140000) a denní zametání.
// Kód Code nodů je tady kvůli testům (scripts/survey-notify.test.mjs); po změně
// přegenerovat a v n8n nahradit kód příslušného nodu.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'docs', 'n8n', 'dotaznik-notifikace.workflow.json');

const SMTP_CREDENTIAL = { smtp: { id: '2ZX1mt7TBeAJBY0M', name: 'info@hromadovky' } };
const FROM_EMAIL = 'info@hromadovky.cz';
const ADMIN_EMAILS = 'karel.hromada30@gmail.com, nikola.hromadova@seznam.cz';

export const claimCode = `// Vyzvedne odpovědi k oznámení (RPC claim_survey_notifications) — atomicky je označí,
// takže žádná odpověď nepřijde dvakrát. Webhooku se nevěří: bere se z něj jen id objednávky.
// Bez těla (denní zametání) se vyzvednou odpovědi, jejichž webhook nedorazil.
const SUPABASE_URL = 'https://fwknpaigohaesqyimgvt.supabase.co';
const SB_SECRET = $env.SUPABASE_SERVICE_KEY;
if (!SB_SECRET) throw new Error('Chybí $env.SUPABASE_SERVICE_KEY');

const body = $input.first().json.body;
let orderId = null;
if (body !== undefined) {
  orderId = String((body && body.record && body.record.order_submission_id) || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    console.log('Notifikace dotazníku: webhook bez platného id, ignoruji.');
    return [];
  }
}

let rows;
try {
  rows = await this.helpers.httpRequest({
    method: 'POST',
    url: \`\${SUPABASE_URL}/rest/v1/rpc/claim_survey_notifications\`,
    headers: {
      apikey: SB_SECRET,
      Authorization: \`Bearer \${SB_SECRET}\`,
      'Content-Type': 'application/json',
    },
    body: { p_id: orderId },
    json: true,
  });
} catch (e) {
  throw new Error(\`claim_survey_notifications selhal: \${e.message}\`);
}
if (!Array.isArray(rows)) {
  throw new Error(\`claim_survey_notifications vrátil nečekanou odpověď: \${JSON.stringify(rows).slice(0, 300)}\`);
}
return rows.map((row) => ({ json: row }));`;

export const buildCode = `// Sestaví notifikaci adminům. Záměrně PROSTÝ TEXT — vzkaz zákazníka je nedůvěryhodný vstup.
// Popisky kanálů zrcadlí src/data/survey.ts (neznámý klíč se vypíše tak, jak je).
const SOURCE_LABELS = {
  doporuceni: 'Doporučení od známých',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Vyhledávač (Google, Seznam)',
  heureka_zbozi: 'Heureka nebo Zboží.cz',
  darek: 'Dostal/a jsem karty jako dárek',
  jine: 'Jinde',
};

return $input.all().map((item) => {
  const r = item.json;
  const rating = Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 ? r.rating : null;
  const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : 'bez hodnocení';
  const order = r.order_number || (r.variable_symbol ? 'VS ' + r.variable_symbol : 'neznámá objednávka');
  const items = Array.isArray(r.item_names) ? r.item_names.filter(Boolean).join(', ') : '';
  const source = r.source
    ? (SOURCE_LABELS[r.source] || r.source) + (r.source_other ? ' — ' + r.source_other : '')
    : 'neuvedeno';

  const lines = [
    'Přišla odpověď z dotazníku spokojenosti.',
    '',
    'Hodnocení: ' + stars + (rating ? ' (' + rating + '/5)' : ''),
    'Objednávka: ' + order,
    'Zákazník: ' + (r.customer_name || 'neuvedeno'),
    items ? 'Položky: ' + items : null,
    '',
    r.answered
      ? 'Jak se o nás dozvěděl/a: ' + source
      : 'Zákazník zatím jen klikl na hvězdičku v e-mailu, formulář neodeslal.',
    r.answered ? 'Vzkaz: ' + (r.comment || '(bez vzkazu)') : null,
    '',
    'Detail: https://www.hromadovky.cz/admin/objednavky',
  ].filter((line) => line !== null);

  return {
    json: {
      subject: 'Dotazník: ' + (rating ? rating + '/5 ' + '★'.repeat(rating) : 'odpověď') + ' — ' + order,
      text: lines.join('\\n'),
    },
  };
});`;

export const workflow = {
  name: 'Hromadovky – Dotazník: notifikace odpovědi',
  nodes: [
    {
      id: 'notify-webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [0, 0],
      parameters: { httpMethod: 'POST', path: 'survey-answered', responseMode: 'onReceived', options: {} },
      webhookId: 'survey-answered',
      notes: 'Volá DB trigger "survey-answered-webhook" na order_surveys. Odpoví hned; obsahu se nevěří (viz Vyzvedni odpovědi).',
    },
    {
      id: 'notify-sweep',
      name: 'Denně 9:40 (zametání)',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.3,
      position: [0, 220],
      parameters: { rule: { interval: [{ field: 'cronExpression', expression: '40 9 * * *' }] } },
      notes: 'Pojistka: oznámí odpovědi starší 30 minut, jejichž webhook nedorazil (výpadek n8n).',
    },
    {
      id: 'notify-rating-only',
      name: 'Jen hvězdička?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2.2,
      position: [220, 0],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
          conditions: [
            {
              id: 'notify-no-answer',
              leftValue: "={{ $json.body?.record?.answered_at ?? '' }}",
              rightValue: '',
              operator: { type: 'string', operation: 'empty', singleValue: true },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
    },
    {
      id: 'notify-wait',
      name: 'Počkej 10 minut',
      type: 'n8n-nodes-base.wait',
      typeVersion: 1.1,
      position: [440, -120],
      parameters: { amount: 10, unit: 'minutes' },
      webhookId: 'survey-answered-wait',
      notes: 'Zákazník klikl jen na hvězdičku — dát mu čas dokončit formulář, ať nepřijdou dvě notifikace.',
    },
    {
      id: 'notify-claim',
      name: 'Vyzvedni odpovědi',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [660, 100],
      parameters: { jsCode: claimCode },
      onError: 'continueErrorOutput',
    },
    {
      id: 'notify-build',
      name: 'Build',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [880, 0],
      parameters: { jsCode: buildCode },
    },
    {
      id: 'notify-send',
      name: 'Email adminům',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [1100, 0],
      parameters: {
        fromEmail: FROM_EMAIL,
        toEmail: ADMIN_EMAILS,
        subject: '={{ $json.subject }}',
        emailFormat: 'text',
        text: '={{ $json.text }}',
        options: { appendAttribution: false },
      },
      credentials: SMTP_CREDENTIAL,
    },
    {
      id: 'notify-alert',
      name: 'Alert adminovi',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [880, 240],
      parameters: {
        fromEmail: FROM_EMAIL,
        toEmail: ADMIN_EMAILS,
        subject: '⚠️ Notifikace dotazníku selhala',
        emailFormat: 'text',
        text:
          '=Nepodařilo se vyzvednout odpověď z dotazníku spokojenosti.\n\n' +
          "Chyba: {{ ($json.error && $json.error.message) || $json.message || JSON.stringify($json.error || 'neznámá') }}\n\n" +
          'Odpověď je uložená a je vidět v detailu objednávky v /admin/objednavky. Denní zametání (9:40) ji zkusí oznámit znovu.',
        options: { appendAttribution: false },
      },
      credentials: SMTP_CREDENTIAL,
    },
  ],
  connections: {
    Webhook: { main: [[{ node: 'Jen hvězdička?', type: 'main', index: 0 }]] },
    'Denně 9:40 (zametání)': { main: [[{ node: 'Vyzvedni odpovědi', type: 'main', index: 0 }]] },
    'Jen hvězdička?': {
      main: [
        [{ node: 'Počkej 10 minut', type: 'main', index: 0 }],
        [{ node: 'Vyzvedni odpovědi', type: 'main', index: 0 }],
      ],
    },
    'Počkej 10 minut': { main: [[{ node: 'Vyzvedni odpovědi', type: 'main', index: 0 }]] },
    'Vyzvedni odpovědi': {
      main: [
        [{ node: 'Build', type: 'main', index: 0 }],
        [{ node: 'Alert adminovi', type: 'main', index: 0 }],
      ],
    },
    Build: { main: [[{ node: 'Email adminům', type: 'main', index: 0 }]] },
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'Europe/Prague',
    saveDataErrorExecution: 'all',
    // Úspěšné běhy neukládat: obsahují jméno zákazníka a jeho vzkaz.
    saveDataSuccessExecution: 'none',
  },
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(workflow, null, 2)}\n`);
  process.stdout.write(`Zapsáno: ${OUT_PATH}\n`);
}
