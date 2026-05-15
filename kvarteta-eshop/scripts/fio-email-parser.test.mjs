// Unit testy pro parseFioEmail() a czechDateToIso(). Pouští se přes:
//   node scripts/fio-email-parser.test.mjs
// Žádná dependency — node:assert + node:fs.

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseFioEmail, czechDateToIso } from './fio-email-parser.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, 'fixtures', 'fio-email-sample.txt');
const fixtureExists = existsSync(FIXTURE_PATH);
const fixture = fixtureExists ? readFileSync(FIXTURE_PATH, 'utf8') : null;

// Hodnoty z reálného fixture (2026-05-15) — slouží jako regrese.
// Když Fio změní formát Hlásič emailu, parsování selže a test selže.
const EXTERNAL = { fioId: '19764abc123def', date: '2026-05-15' };

const tests = [
  // === Vstupní sanitace ===
  {
    name: 'sanitace: null/undefined → null',
    run: () => {
      assert.equal(parseFioEmail(null), null);
      assert.equal(parseFioEmail(undefined), null);
    },
  },
  {
    name: 'sanitace: prázdný / whitespace string → null',
    run: () => {
      assert.equal(parseFioEmail(''), null);
      assert.equal(parseFioEmail('   '), null);
    },
  },
  {
    name: 'sanitace: ne-string vstup → null',
    run: () => {
      assert.equal(parseFioEmail(123), null);
      assert.equal(parseFioEmail({ subject: 'Fio banka' }), null);
    },
  },
  {
    name: 'sanitace: non-Fio email (bez "Částka:") → null',
    run: () => {
      const out = parseFioEmail('Subject: Newsletter\n\nDobrý den, máme akci na keramiku!');
      assert.equal(out, null);
    },
  },

  // === czechDateToIso helper ===
  {
    name: 'czechDateToIso: "15.05.2026" → "2026-05-15"',
    run: () => assert.equal(czechDateToIso('15.05.2026'), '2026-05-15'),
  },
  {
    name: 'czechDateToIso: "5.5.2026" → "2026-05-05"',
    run: () => assert.equal(czechDateToIso('5.5.2026'), '2026-05-05'),
  },
  {
    name: 'czechDateToIso: neplatný formát → ""',
    run: () => {
      assert.equal(czechDateToIso('2026-05-15'), '');
      assert.equal(czechDateToIso(''), '');
      assert.equal(czechDateToIso(null), '');
    },
  },

  // === Real fixture: 2026-05-15, 10 Kč test platba ===
  {
    name: 'fixture: parser vrátí non-null FioTransaction',
    skip: !fixtureExists,
    skipReason: 'Chybí scripts/fixtures/fio-email-sample.txt',
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.notEqual(out, null, 'parser vrátil null — zkontroluj fixture nebo parser');
    },
  },
  {
    name: 'fixture: amount=10 (Kč) — desetinná čárka správně zparsovaná',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.amount, 10);
    },
  },
  {
    name: 'fixture: vs="1778790461" (string, ne number)',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.vs, '1778790461');
      assert.equal(typeof out.vs, 'string');
    },
  },
  {
    name: 'fixture: counterAccount="670100-2202858274/6210"',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.counterAccount, '670100-2202858274/6210');
    },
  },
  {
    name: 'fixture: note="PLATBA" (ze Zprávy příjemci)',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.note, 'PLATBA');
    },
  },
  {
    name: 'fixture: external.fioId má přednost před fallback',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.fioId, '19764abc123def');
    },
  },
  {
    name: 'fixture: external.date má přednost před dnešním datem',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture, EXTERNAL);
      assert.equal(out.date, '2026-05-15');
    },
  },

  // === Fallback chování (external chybí) ===
  {
    name: 'fallback: bez external.fioId → deterministic fb- prefix',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture);
      assert.match(out.fioId, /^fb-10-1778790461-/);
    },
  },
  {
    name: 'fallback: bez external.date → dnešek (YYYY-MM-DD)',
    skip: !fixtureExists,
    run: () => {
      const out = parseFioEmail(fixture);
      assert.match(out.date, /^\d{4}-\d{2}-\d{2}$/);
    },
  },

  // === Edge cases (mutace fixture) ===
  {
    name: 'edge: tělo bez VS → vs: null, ostatní pole zůstávají',
    skip: !fixtureExists,
    run: () => {
      const withoutVs = fixture.replace(/^VS:.*$/m, '');
      const out = parseFioEmail(withoutVs, EXTERNAL);
      assert.notEqual(out, null);
      assert.equal(out.vs, null);
      assert.equal(out.amount, 10);
    },
  },
  {
    name: 'edge: amount s mezerou v tisícech "1 250,00" → 1250',
    run: () => {
      const body = 'Příjem na kontě: 123\nČástka: 1 250,00\nVS: 999\n';
      const out = parseFioEmail(body, EXTERNAL);
      assert.notEqual(out, null);
      assert.equal(out.amount, 1250);
    },
  },
  {
    name: 'edge: záporná částka (odchozí) → null',
    run: () => {
      const body = 'Částka: -10,00\nVS: 999\n';
      const out = parseFioEmail(body, EXTERNAL);
      assert.equal(out, null);
    },
  },
  {
    name: 'edge: částka 0 → null (Hlásič posílá jen reálné platby, ale safety)',
    run: () => {
      const body = 'Částka: 0,00\nVS: 999\n';
      const out = parseFioEmail(body, EXTERNAL);
      assert.equal(out, null);
    },
  },
];

// === Test runner ===
let pass = 0;
let fail = 0;
let skip = 0;
const failures = [];

for (const t of tests) {
  if (t.skip) {
    skip++;
    console.log(`  SKIP  ${t.name}${t.skipReason ? ` (${t.skipReason})` : ''}`);
    continue;
  }
  try {
    t.run();
    pass++;
    console.log(`   OK   ${t.name}`);
  } catch (err) {
    fail++;
    failures.push({ name: t.name, message: err.message });
    console.log(`  FAIL  ${t.name}`);
    console.log(`        ${err.message}`);
  }
}

console.log('');
console.log(`Výsledek: ${pass} OK, ${fail} FAIL, ${skip} SKIP (z ${tests.length} celkem)`);

if (fail > 0) process.exit(1);
process.exit(0);
