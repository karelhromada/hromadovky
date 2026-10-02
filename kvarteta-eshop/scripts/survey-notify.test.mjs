// Unit testy Code nodů workflow „Dotazník: notifikace odpovědi". Pouští se přes:
//   node scripts/survey-notify.test.mjs

import assert from 'node:assert/strict';
import { buildCode, claimCode, workflow } from './build-survey-notify-workflow.mjs';

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const runNode = (code, { items = [{ json: {} }], env = { SUPABASE_SERVICE_KEY: 'k' }, httpRequest } = {}) =>
  new AsyncFunction('$input', '$env', 'console', code).call(
    { helpers: { httpRequest } },
    { all: () => items, first: () => items[0] },
    env,
    { log: () => {} },
  );

const ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const webhookItem = (record) => [{ json: { body: { type: 'UPDATE', record } } }];
const row = {
  order_number: 'ORD-1', variable_symbol: '2000000001', customer_name: 'Jana Nováková', rating: 4,
  source: 'instagram', source_other: null, comment: 'Krásné karty', answered: true, item_names: ['Kvarteto', 'Pexeso'],
};

const tests = [
  {
    name: 'claim: z webhooku pošle jen id objednávky',
    run: async () => {
      let request;
      const out = await runNode(claimCode, {
        items: webhookItem({ order_submission_id: ID, rating: 5, comment: 'podvržený text' }),
        httpRequest: async (req) => { request = req; return [row]; },
      });
      assert.deepEqual(request.body, { p_id: ID });
      assert.ok(request.url.endsWith('/rest/v1/rpc/claim_survey_notifications'));
      assert.deepEqual(out, [{ json: row }]);
    },
  },
  {
    name: 'claim: webhook bez platného id se ignoruje a RPC se vůbec nezavolá',
    run: async () => {
      for (const record of [undefined, {}, { order_submission_id: 'abc' }, { order_submission_id: `${ID}' or 1=1` }]) {
        let called = false;
        const out = await runNode(claimCode, {
          items: record === undefined ? [{ json: { body: {} } }] : webhookItem(record),
          httpRequest: async () => { called = true; return []; },
        });
        assert.deepEqual(out, []);
        assert.equal(called, false, 'RPC se nemělo volat');
      }
    },
  },
  {
    name: 'claim: bez těla (denní zametání) volá RPC s p_id = null',
    run: async () => {
      let request;
      await runNode(claimCode, { httpRequest: async (req) => { request = req; return []; } });
      assert.deepEqual(request.body, { p_id: null });
    },
  },
  {
    name: 'claim: chyby vždy vyhodí (jdou do alertu)',
    run: async () => {
      await assert.rejects(runNode(claimCode, { env: {}, httpRequest: async () => [] }), /SUPABASE_SERVICE_KEY/);
      await assert.rejects(runNode(claimCode, { httpRequest: async () => ({ message: 'denied' }) }), /nečekanou odpověď/);
      await assert.rejects(runNode(claimCode, { httpRequest: async () => { throw new Error('ECONNRESET'); } }), /ECONNRESET/);
    },
  },
  {
    name: 'build: plná odpověď — hvězdičky, popisek kanálu, vzkaz',
    run: async () => {
      const [{ json }] = await runNode(buildCode, { items: [{ json: row }] });
      assert.equal(json.subject, 'Dotazník: 4/5 ★★★★ — ORD-1');
      assert.ok(json.text.includes('Hodnocení: ★★★★☆ (4/5)'));
      assert.ok(json.text.includes('Zákazník: Jana Nováková'));
      assert.ok(json.text.includes('Položky: Kvarteto, Pexeso'));
      assert.ok(json.text.includes('Jak se o nás dozvěděl/a: Instagram'));
      assert.ok(json.text.includes('Vzkaz: Krásné karty'));
    },
  },
  {
    name: 'build: jen hvězdička — bez zdroje a vzkazu, s vysvětlením',
    run: async () => {
      const [{ json }] = await runNode(buildCode, {
        items: [{ json: { ...row, answered: false, source: null, comment: null } }],
      });
      assert.ok(json.text.includes('jen klikl na hvězdičku'));
      assert.ok(!json.text.includes('Vzkaz:'));
      assert.ok(!json.text.includes('null'));
    },
  },
  {
    name: 'build: „jinde" s upřesněním, neznámý klíč kanálu, chybějící údaje',
    run: async () => {
      const [a, b, c] = await runNode(buildCode, {
        items: [
          { json: { ...row, source: 'jine', source_other: 'vánoční trh' } },
          { json: { ...row, source: 'tiktok' } },
          { json: { rating: null, answered: true, order_number: null, variable_symbol: '2000000009' } },
        ],
      });
      assert.ok(a.json.text.includes('Jinde — vánoční trh'));
      assert.ok(b.json.text.includes('dozvěděl/a: tiktok'));
      assert.ok(c.json.text.includes('Objednávka: VS 2000000009'));
      assert.ok(c.json.text.includes('Hodnocení: bez hodnocení'));
      assert.ok(c.json.text.includes('Vzkaz: (bez vzkazu)'));
      assert.ok(!c.json.text.includes('undefined') && !c.json.text.includes('null'));
    },
  },
  {
    name: 'workflow: spojení míří na existující nody, e-maily jsou prostý text',
    run: () => {
      const names = new Set(workflow.nodes.map((n) => n.name));
      for (const [from, outputs] of Object.entries(workflow.connections)) {
        assert.ok(names.has(from), `neznámý zdroj ${from}`);
        for (const target of outputs.main.flat()) assert.ok(names.has(target.node), `neznámý cíl ${target.node}`);
      }
      for (const node of workflow.nodes.filter((n) => n.type.endsWith('emailSend'))) {
        assert.equal(node.parameters.emailFormat, 'text', `${node.name} musí být text`);
        assert.equal(node.parameters.html, undefined);
      }
      assert.equal(workflow.connections['Vyzvedni odpovědi'].main[1][0].node, 'Alert adminovi');
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
