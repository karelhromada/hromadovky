// Unit testy pro buildSurveyEmail(). Pouští se přes:
//   node scripts/survey-email.test.mjs
// Žádná dependency — node:assert.

import assert from 'node:assert/strict';
import { buildSurveyEmail } from './survey-email.mjs';
import { buildCode, claimCode, workflow } from './build-survey-workflow.mjs';

// Spustí kód n8n Code nodu se stuby za $input / $env / this.helpers.
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const runNode = (code, { items = [], env = {}, httpRequest } = {}) =>
  new AsyncFunction('$input', '$env', 'console', code).call(
    { helpers: { httpRequest } },
    { all: () => items },
    env,
    { log: () => {} },
  );

const ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const TOKEN = 'ab12'.repeat(16);
const base = { kind: 'first', orderId: ID, token: TOKEN, firstName: 'Jana', orderNumber: 'ORD-1', itemNames: ['Kvarteto'] };

const hrefs = (html) => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

const tests = [
  {
    name: 'obsahuje právě 5 hodnoticích odkazů h=1..5 se správným id a tokenem',
    run: () => {
      const { html } = buildSurveyEmail(base);
      const rating = hrefs(html).filter((h) => h.includes('&h='));
      assert.deepEqual(
        rating,
        [1, 2, 3, 4, 5].map((n) => `https://www.hromadovky.cz/dotaznik?o=${ID}&t=${TOKEN}&h=${n}`),
      );
    },
  },
  {
    name: 'všechny odkazy míří jen na www.hromadovky.cz nebo mailto obchodu',
    run: () => {
      for (const kind of ['first', 'reminder']) {
        const { html } = buildSurveyEmail({ ...base, kind });
        for (const href of hrefs(html)) {
          assert.ok(
            href.startsWith('https://www.hromadovky.cz/') || href === 'mailto:obchod@hromadovky.cz',
            `nečekaný odkaz: ${href}`,
          );
        }
        const imgs = [...html.matchAll(/src="([^"]*)"/g)].map((m) => m[1]);
        assert.deepEqual(imgs, ['https://www.hromadovky.cz/email/logo.png']);
      }
    },
  },
  {
    name: 'XSS: jméno, položky a číslo objednávky jsou escapované v HTML',
    run: () => {
      const payload = '<script>alert(1)</script>"\'><img src=x onerror=alert(1)>';
      const { html } = buildSurveyEmail({ ...base, firstName: payload, orderNumber: payload, itemNames: [payload] });
      assert.ok(!html.includes('<script>alert'), 'neescapovaný <script>');
      assert.ok(!html.includes('<img src=x'), 'neescapovaný <img>');
      assert.ok(!html.includes('onerror=alert(1)>'), 'neescapovaný atribut');
      assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    },
  },
  {
    name: 'neplatné orderId / token / kind vyhodí chybu (nic se neodešle)',
    run: () => {
      assert.throws(() => buildSurveyEmail({ ...base, orderId: `${ID}"><script>` }), /orderId/);
      assert.throws(() => buildSurveyEmail({ ...base, orderId: undefined }), /orderId/);
      assert.throws(() => buildSurveyEmail({ ...base, token: 'abc' }), /token/);
      assert.throws(() => buildSurveyEmail({ ...base, token: `${'a'.repeat(63)}"` }), /token/);
      assert.throws(() => buildSurveyEmail({ ...base, kind: 'third' }), /kind/);
    },
  },
  {
    name: 'first: nabízí odhlášení z připomínky; reminder: už ne',
    run: () => {
      const first = buildSurveyEmail(base);
      const reminder = buildSurveyEmail({ ...base, kind: 'reminder' });
      assert.ok(first.html.includes('&odhlasit=1'));
      assert.ok(first.text.includes('&odhlasit=1'));
      assert.ok(!reminder.html.includes('odhlasit'));
      assert.ok(!reminder.text.includes('odhlasit'));
      assert.notEqual(first.subject, reminder.subject);
    },
  },
  {
    name: 'oslovení: křestní jméno, jinak Dobrý den',
    run: () => {
      assert.ok(buildSurveyEmail(base).html.includes('Ahoj Jana,'));
      assert.ok(buildSurveyEmail({ ...base, firstName: '  ' }).html.includes('Dobrý den,'));
      assert.ok(buildSurveyEmail({ ...base, firstName: null }).text.startsWith('Dobrý den,'));
    },
  },
  {
    name: 'položky: max 3 názvy + počet zbylých; bez položek řádek chybí',
    run: () => {
      const many = buildSurveyEmail({ ...base, itemNames: ['A', 'B', 'C', 'D', 'E'] });
      assert.ok(many.html.includes('A, B, C a další (2)'));
      const none = buildSurveyEmail({ ...base, itemNames: [] });
      assert.ok(!none.html.includes('Týká se:'));
      assert.ok(!buildSurveyEmail({ ...base, itemNames: undefined }).text.includes('Týká se:'));
    },
  },
  {
    name: 'bez čísla objednávky nevypíše "null"',
    run: () => {
      const { html } = buildSurveyEmail({ ...base, orderNumber: null });
      assert.ok(!html.includes('null') && !html.includes('undefined'));
      assert.ok(html.includes('vaše objednávka'));
    },
  },
  {
    name: 'text verze obsahuje všech 5 odkazů',
    run: () => {
      const { text } = buildSurveyEmail(base);
      for (let n = 1; n <= 5; n += 1) assert.ok(text.includes(`&h=${n}`));
    },
  },
  // === n8n Code nody (generované build-survey-workflow.mjs) ===
  {
    name: 'n8n Build: platný řádek → e-mail; vadný řádek → build_error a neshodí ostatní',
    run: async () => {
      const row = { kind: 'first', order_submission_id: ID, token: TOKEN, email: 'a@example.com', first_name: 'Jana', order_number: 'ORD-1', item_names: ['Kvarteto'] };
      const out = await runNode(buildCode, { items: [{ json: { ...row, token: 'spatny' } }, { json: row }] });
      assert.equal(out.length, 2);
      assert.equal(out[0].json.html, '');
      assert.match(out[0].json.build_error, /token/);
      assert.equal(out[0].json.order_number, 'ORD-1');
      assert.equal(out[1].json.to, 'a@example.com');
      assert.deepEqual(
        { subject: out[1].json.subject, html: out[1].json.html, text: out[1].json.text },
        buildSurveyEmail(base),
      );
    },
  },
  {
    name: 'n8n Vyber příjemce: volá RPC se service klíčem a vrací řádky jako items',
    run: async () => {
      let request;
      const out = await runNode(claimCode, {
        env: { SUPABASE_SERVICE_KEY: 'k' },
        httpRequest: async (req) => { request = req; return [{ kind: 'first' }, { kind: 'reminder' }]; },
      });
      assert.deepEqual(out, [{ json: { kind: 'first' } }, { json: { kind: 'reminder' } }]);
      assert.equal(request.method, 'POST');
      assert.ok(request.url.endsWith('/rest/v1/rpc/claim_due_survey_emails'));
      assert.equal(request.headers.Authorization, 'Bearer k');
    },
  },
  {
    name: 'n8n Vyber příjemce: prázdný seznam → [], ale chyby vždy vyhodí (žádné tiché selhání)',
    run: async () => {
      const env = { SUPABASE_SERVICE_KEY: 'k' };
      assert.deepEqual(await runNode(claimCode, { env, httpRequest: async () => [] }), []);
      await assert.rejects(runNode(claimCode, { env: {}, httpRequest: async () => [] }), /SUPABASE_SERVICE_KEY/);
      await assert.rejects(runNode(claimCode, { env, httpRequest: async () => ({ message: 'permission denied' }) }), /nečekanou odpověď/);
      await assert.rejects(runNode(claimCode, { env, httpRequest: async () => { throw new Error('ECONNRESET'); } }), /ECONNRESET/);
    },
  },
  {
    name: 'n8n workflow: každé spojení míří na existující node a chyby vedou do alertu',
    run: () => {
      const names = new Set(workflow.nodes.map((n) => n.name));
      for (const [from, outputs] of Object.entries(workflow.connections)) {
        assert.ok(names.has(from), `neznámý zdroj ${from}`);
        for (const target of outputs.main.flat()) assert.ok(names.has(target.node), `neznámý cíl ${target.node}`);
      }
      for (const from of ['Vyber příjemce', 'Build', 'Sestaveno?', 'Email zákazníkovi']) {
        assert.equal(workflow.connections[from].main[1][0].node, 'Alert adminovi', `${from} nemá chybovou větev`);
      }
    },
  },
];

let failed = 0;
for (const t of tests) {
  try {
    await t.run();
    console.log(`  ✓ ${t.name}`);
  } catch (e) {
    failed += 1;
    console.error(`  ✗ ${t.name}\n    ${e.message}`);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} testů prošlo`);
if (failed > 0) process.exit(1);
