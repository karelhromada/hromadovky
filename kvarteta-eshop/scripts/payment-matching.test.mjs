// Unit testy pro decideMatchAction(). Pouští se přes:
//   node scripts/payment-matching.test.mjs
// Žádná dependency — používá node:assert.
//
// Pokud upravíš pravidla v payment-matching.mjs, přidej / aktualizuj test níže.

import assert from 'node:assert/strict';
import { decideMatchAction, TOLERANCE_KC } from './payment-matching.mjs';

const fakeInvoice = (overrides = {}) => ({
  id: 'invoice-uuid-1',
  status: 'unpaid',
  total: 250,
  customerEmail: 'test@example.com',
  number: '2026-0042',
  ...overrides,
});

const tests = [
  {
    name: 'happy path: přesná shoda → mark_paid',
    run: () => {
      const out = decideMatchAction(250, fakeInvoice());
      assert.equal(out.action, 'mark_paid');
      assert.equal(out.reason, 'paid');
    },
  },
  {
    name: 'tolerance: rozdíl 0.50 Kč → mark_paid (v rámci ±1 Kč)',
    run: () => {
      assert.equal(decideMatchAction(250.5, fakeInvoice()).action, 'mark_paid');
      assert.equal(decideMatchAction(249.5, fakeInvoice()).action, 'mark_paid');
    },
  },
  {
    name: 'tolerance: přesně ±1 Kč → mark_paid (≤ TOLERANCE)',
    run: () => {
      assert.equal(decideMatchAction(251, fakeInvoice()).action, 'mark_paid');
      assert.equal(decideMatchAction(249, fakeInvoice()).action, 'mark_paid');
    },
  },
  {
    name: 'nedoplatek > 1 Kč → unmatched (underpayment), invoice zůstává unpaid',
    run: () => {
      const out = decideMatchAction(245, fakeInvoice());
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'underpayment');
    },
  },
  {
    name: 'přeplatek > 1 Kč → mark_paid_with_overpayment',
    run: () => {
      const out = decideMatchAction(260, fakeInvoice());
      assert.equal(out.action, 'mark_paid_with_overpayment');
      assert.equal(out.reason, 'overpayment');
    },
  },
  {
    name: 'faktura neexistuje (null) → no_invoice_match',
    run: () => {
      const out = decideMatchAction(250, null);
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'no_invoice_match');
    },
  },
  {
    name: 'faktura paid bez paid_amount metadata → duplicate_payment (legacy fallback)',
    run: () => {
      const out = decideMatchAction(250, fakeInvoice({ status: 'paid' }));
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
    },
  },
  {
    name: 'paid + stejná částka + nedávno (<24h) → noop (same_payment_seen) — cross-run idempotence',
    run: () => {
      const now = new Date('2026-05-15T12:00:00Z');
      const recentPaid = new Date('2026-05-15T11:50:00Z'); // 10 min předtím
      const inv = fakeInvoice({ status: 'paid', paid_amount: 250, paid_at: recentPaid.toISOString() });
      const out = decideMatchAction(250, inv, now);
      assert.equal(out.action, 'noop');
      assert.equal(out.reason, 'same_payment_seen');
    },
  },
  {
    name: 'paid + stejná částka (±0.5 v toleranci) + nedávno → noop',
    run: () => {
      const now = new Date('2026-05-15T12:00:00Z');
      const inv = fakeInvoice({ status: 'paid', paid_amount: 250, paid_at: new Date('2026-05-15T11:30:00Z').toISOString() });
      assert.equal(decideMatchAction(250.5, inv, now).action, 'noop');
      assert.equal(decideMatchAction(249.5, inv, now).action, 'noop');
    },
  },
  {
    name: 'paid + JINÁ částka + nedávno → duplicate_payment (klient zaplatil 2× různě)',
    run: () => {
      const now = new Date('2026-05-15T12:00:00Z');
      const inv = fakeInvoice({ status: 'paid', paid_amount: 250, paid_at: new Date('2026-05-15T11:50:00Z').toISOString() });
      const out = decideMatchAction(100, inv, now);
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
    },
  },
  {
    name: 'paid + stejná částka + dávno (>24h) → duplicate_payment',
    run: () => {
      const now = new Date('2026-05-17T12:00:00Z');
      const inv = fakeInvoice({ status: 'paid', paid_amount: 250, paid_at: new Date('2026-05-15T11:50:00Z').toISOString() });
      const out = decideMatchAction(250, inv, now);
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
    },
  },
  {
    name: 'paid + stejná částka přesně na hranici 24h → duplicate_payment (>= 24h)',
    run: () => {
      const now = new Date('2026-05-16T12:00:00Z');
      const inv = fakeInvoice({ status: 'paid', paid_amount: 250, paid_at: new Date('2026-05-15T12:00:00Z').toISOString() });
      const out = decideMatchAction(250, inv, now);
      assert.equal(out.action, 'unmatched');
    },
  },
  {
    name: 'faktura cancelled → payment_to_cancelled',
    run: () => {
      const out = decideMatchAction(250, fakeInvoice({ status: 'cancelled' }));
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'payment_to_cancelled');
    },
  },
  {
    name: 'faktura refunded → payment_to_cancelled',
    run: () => {
      const out = decideMatchAction(250, fakeInvoice({ status: 'refunded' }));
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'payment_to_cancelled');
    },
  },
  {
    name: 'TOLERANCE_KC je 1.00 Kč (sanity check konstanty)',
    run: () => assert.equal(TOLERANCE_KC, 1.0),
  },

  // --- Dedup napříč běhy a kanály (2026-08) -------------------------------
  // Cron čte Fio API 7 dní zpět, ale okno „tatáž platba" bylo 24 h → každá platba
  // se po dni nahlásila jako duplicitní. Tyhle testy hlídají obě nová pravidla
  // i to, že skutečné duplicity dál projdou.
  {
    name: 'tatáž transakce po 30 dnech (shoda fio_transaction_id) → noop',
    run: () => {
      const paidAt = new Date('2026-07-01T10:00:00Z');
      const out = decideMatchAction(
        349,
        fakeInvoice({ status: 'paid', paid_amount: 349, paid_at: paidAt.toISOString(), fio_transaction_id: '27634272611' }),
        new Date('2026-07-31T10:00:00Z'),
        { fioId: '27634272611', date: '2026-07-01' },
      );
      assert.equal(out.action, 'noop');
      assert.equal(out.reason, 'same_payment_seen');
    },
  },
  {
    name: 'cross-channel: fakturu zaplatil Gmail, cron ji vidí druhý den → noop',
    run: () => {
      const out = decideMatchAction(
        428,
        fakeInvoice({ status: 'paid', paid_amount: 428, paid_at: '2026-07-17T13:09:46Z', fio_transaction_id: '19f7031aba3b3f50' }),
        new Date('2026-07-18T16:00:00Z'),
        { fioId: '27743986325', date: '2026-07-17' },
      );
      assert.equal(out.action, 'noop');
      assert.equal(out.reason, 'same_payment_seen');
    },
  },
  {
    name: 'REGRESE: druhá platba stejné částky ze stejného kanálu → duplicate_payment',
    run: () => {
      const out = decideMatchAction(
        428,
        fakeInvoice({ status: 'paid', paid_amount: 428, paid_at: '2026-07-17T13:09:46Z', fio_transaction_id: '27743986325' }),
        new Date('2026-07-19T16:00:00Z'),
        { fioId: '27799999999', date: '2026-07-19' }, // jiné číselné ID, pozdější den
      );
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
    },
  },
  {
    name: 'REGRESE: přeplatek na už zaplacenou fakturu → duplicate_payment',
    run: () => {
      const out = decideMatchAction(
        10,
        fakeInvoice({ status: 'paid', paid_amount: 349, paid_at: '2026-05-14T20:49:25Z', fio_transaction_id: '27634272611' }),
        new Date('2026-05-15T16:00:00Z'),
        { fioId: '27635752686', date: '2026-05-15' },
      );
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
    },
  },
  {
    name: 'bez tx (starý call site) → chová se jako dřív, 24h okno',
    run: () => {
      const out = decideMatchAction(
        349,
        fakeInvoice({ status: 'paid', paid_amount: 349, paid_at: new Date(Date.now() - 3600_000).toISOString() }),
      );
      assert.equal(out.action, 'noop');
      assert.equal(out.reason, 'same_payment_seen');
    },
  },
];

let passed = 0;
let failed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`  ✓ ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${t.name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed}/${tests.length} passed${failed ? `, ${failed} failed` : ''}`);
if (failed > 0) process.exit(1);
