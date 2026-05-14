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
    name: 'faktura už paid → duplicate_payment',
    run: () => {
      const out = decideMatchAction(250, fakeInvoice({ status: 'paid' }));
      assert.equal(out.action, 'unmatched');
      assert.equal(out.reason, 'duplicate_payment');
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
