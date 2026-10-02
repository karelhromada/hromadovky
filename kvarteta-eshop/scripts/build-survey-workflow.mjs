// Vygeneruje definici n8n workflow „Hromadovky – Dotazník spokojenosti" z otestované
// šablony scripts/survey-email.mjs (n8n neumí importovat z repa — kód se do Code nodu vkládá).
//
//   node scripts/build-survey-workflow.mjs
//   → docs/n8n/dotaznik-spokojenosti.workflow.json (import v n8n: Workflows → Import from File)
//
// Po změně šablony: spustit testy, znovu vygenerovat a v n8n nahradit kód nodu „Build".

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'docs', 'n8n', 'dotaznik-spokojenosti.workflow.json');

const SMTP_CREDENTIAL = { smtp: { id: '2ZX1mt7TBeAJBY0M', name: 'info@hromadovky' } };
const FROM_EMAIL = 'info@hromadovky.cz';
const ADMIN_EMAILS = 'karel.hromada30@gmail.com, nikola.hromadova@seznam.cz';

const templateSource = readFileSync(join(__dirname, 'survey-email.mjs'), 'utf8');
const fnStart = templateSource.indexOf('export function buildSurveyEmail');
if (fnStart < 0) throw new Error('V survey-email.mjs chybí export function buildSurveyEmail');
const buildFunction = templateSource.slice(fnStart).replace('export function', 'function').trimEnd();

export const claimCode = `// Atomicky vybere a OZNAČÍ e-maily k odeslání (RPC claim_due_survey_emails).
// Claim před odesláním = opakovaný běh nikdy nepošle e-mail dvakrát.
// Chyba = throw (jde do „Alert adminovi"), nikdy tiché return [].
const SUPABASE_URL = 'https://fwknpaigohaesqyimgvt.supabase.co';
const SB_SECRET = $env.SUPABASE_SERVICE_KEY;
if (!SB_SECRET) throw new Error('Chybí $env.SUPABASE_SERVICE_KEY');

let rows;
try {
  rows = await this.helpers.httpRequest({
    method: 'POST',
    url: \`\${SUPABASE_URL}/rest/v1/rpc/claim_due_survey_emails\`,
    headers: {
      apikey: SB_SECRET,
      Authorization: \`Bearer \${SB_SECRET}\`,
      'Content-Type': 'application/json',
    },
    body: {},
    json: true,
  });
} catch (e) {
  throw new Error(\`claim_due_survey_emails selhal: \${e.message}\`);
}
if (!Array.isArray(rows)) {
  throw new Error(\`claim_due_survey_emails vrátil nečekanou odpověď: \${JSON.stringify(rows).slice(0, 300)}\`);
}
if (rows.length === 0) {
  console.log('Dotazník: dnes nic k odeslání.');
  return [];  // běžný stav — většinu dní není komu psát
}
return rows.map((row) => ({ json: row }));`;

export const buildCode = `// Sestaví e-mail pro každého příjemce. Šablona = scripts/survey-email.mjs v repu
// (generuje scripts/build-survey-workflow.mjs — needitovat ručně tady).
// Chyba jedné položky nesmí shodit ostatní: položka bez html jde přes IF do alertu.
${buildFunction}

return $input.all().map((item) => {
  const row = item.json;
  const meta = { kind: row.kind, order_number: row.order_number, variable_symbol: row.variable_symbol, to: row.email };
  try {
    const mail = buildSurveyEmail({
      kind: row.kind,
      orderId: row.order_submission_id,
      token: row.token,
      firstName: row.first_name,
      orderNumber: row.order_number,
      itemNames: Array.isArray(row.item_names) ? row.item_names : [],
    });
    return { json: { ...meta, subject: mail.subject, html: mail.html, text: mail.text } };
  } catch (e) {
    return { json: { ...meta, html: '', build_error: e.message } };
  }
});`;

// Záměrně PROSTÝ TEXT: adresa zákazníka i text chyby SMTP jsou nedůvěryhodný vstup
// a v HTML alertu by šly zneužít k podvržení odkazu adminovi.
const alertText =
  '=Dotazník spokojenosti se nepodařilo odeslat.\n\n' +
  "Objednávka: {{ $json.order_number || ($json.variable_symbol ? 'VS ' + $json.variable_symbol : 'neznámá') }}\n" +
  "Typ: {{ $json.kind || '—' }}\n" +
  "Příjemce: {{ $json.to || '—' }}\n" +
  "Chyba: {{ $json.build_error || ($json.error && $json.error.message) || $json.message || JSON.stringify($json.error || 'neznámá') }}\n\n" +
  'E-mail je v databázi už označený jako odeslaný (ochrana proti duplicitám), takže se sám nezopakuje.\n' +
  'Když chybí i číslo objednávky, selhal výběr příjemců — zkontroluj běh workflow v n8n.';

export const workflow = {
  name: 'Hromadovky – Dotazník spokojenosti',
  nodes: [
    {
      id: 'survey-trigger',
      name: 'Denně 9:30',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.3,
      position: [0, 0],
      parameters: { rule: { interval: [{ field: 'cronExpression', expression: '30 9 * * *' }] } },
      notes: 'Denně 9:30 Europe/Prague. 1. e-mail 2 dny po doručení, připomínka 7. den (pravidla jsou v SQL funkci claim_due_survey_emails).',
    },
    {
      id: 'survey-claim',
      name: 'Vyber příjemce',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [220, 0],
      parameters: { jsCode: claimCode },
      onError: 'continueErrorOutput',
    },
    {
      id: 'survey-build',
      name: 'Build',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [440, -100],
      parameters: { jsCode: buildCode },
      onError: 'continueErrorOutput',
    },
    {
      id: 'survey-built-ok',
      name: 'Sestaveno?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2.2,
      position: [660, -100],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
          conditions: [
            {
              id: 'survey-has-html',
              leftValue: '={{ $json.html }}',
              rightValue: '',
              operator: { type: 'string', operation: 'notEmpty', singleValue: true },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
    },
    {
      id: 'survey-send',
      name: 'Email zákazníkovi',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [880, -200],
      parameters: {
        fromEmail: FROM_EMAIL,
        toEmail: '={{ $json.to }}',
        subject: '={{ $json.subject }}',
        emailFormat: 'both',
        text: '={{ $json.text }}',
        html: '={{ $json.html }}',
        options: { appendAttribution: false },
      },
      credentials: SMTP_CREDENTIAL,
      onError: 'continueErrorOutput',
    },
    {
      id: 'survey-alert',
      name: 'Alert adminovi',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [1100, 100],
      parameters: {
        fromEmail: FROM_EMAIL,
        toEmail: ADMIN_EMAILS,
        subject: "=⚠️ Dotazník spokojenosti se neodeslal — {{ $json.order_number || 'viz n8n' }}",
        emailFormat: 'text',
        text: alertText,
        options: { appendAttribution: false },
      },
      credentials: SMTP_CREDENTIAL,
    },
  ],
  connections: {
    'Denně 9:30': { main: [[{ node: 'Vyber příjemce', type: 'main', index: 0 }]] },
    'Vyber příjemce': {
      main: [
        [{ node: 'Build', type: 'main', index: 0 }],
        [{ node: 'Alert adminovi', type: 'main', index: 0 }],
      ],
    },
    Build: {
      main: [
        [{ node: 'Sestaveno?', type: 'main', index: 0 }],
        [{ node: 'Alert adminovi', type: 'main', index: 0 }],
      ],
    },
    'Sestaveno?': {
      main: [
        [{ node: 'Email zákazníkovi', type: 'main', index: 0 }],
        [{ node: 'Alert adminovi', type: 'main', index: 0 }],
      ],
    },
    'Email zákazníkovi': {
      main: [[], [{ node: 'Alert adminovi', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'Europe/Prague',
    saveDataErrorExecution: 'all',
    // Úspěšné běhy neukládat: výstup obsahuje e-maily a neexpirující tokeny odkazů.
    saveDataSuccessExecution: 'none',
  },
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(workflow, null, 2)}\n`);
  process.stdout.write(`Zapsáno: ${OUT_PATH}\n`);
}
