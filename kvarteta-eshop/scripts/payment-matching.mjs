// Pure rozhodovací logika pro párování Fio bankovních transakcí s fakturami.
// Tento modul je zdroj pravdy — stejný kód si Karel zkopíruje do n8n Code nodu
// `decide-match-action` v workflow `fio-payment-matcher`.
//
// Důvod, proč to máme jako samostatný .mjs modul:
//   1. Testovatelné v Node bez n8n (scripts/payment-matching.test.mjs)
//   2. Versioned v repu — když změníš pravidla, git diff je explicitní
//   3. n8n Code node je read-only z pohledu CI; tady běží linting + testy
//
// Při změně pravidel:
//   a) Edituj decideMatchAction() níže
//   b) Aktualizuj testy v scripts/payment-matching.test.mjs
//   c) Spusť `node scripts/payment-matching.test.mjs` — všechny musí projít
//   d) Zkopíruj funkci do n8n Code nodu (Edit → Save → Activate)

/**
 * @typedef {Object} FioTransaction
 * @property {string} fioId           - Fio API column22.value (UNIQUE per účet)
 * @property {number} amount          - column1.value (kladné = příchozí, záporné = odchozí)
 * @property {string|null} vs         - column5.value (variabilní symbol nebo null)
 * @property {string} date            - column0.value ("YYYY-MM-DD+HHMM")
 * @property {string} counterAccount  - column2.value
 * @property {string} note            - column16.value
 */

/**
 * @typedef {Object} InvoiceLookup
 * @property {string} id              - UUID
 * @property {string} status          - 'unpaid' | 'paid' | 'cancelled' | 'refunded'
 * @property {number} total           - amount due (CZK)
 * @property {string} customerEmail
 * @property {string} number          - faktura number (např. "2026-0042")
 */

/**
 * @typedef {Object} MatchAction
 * @property {'mark_paid'|'unmatched'|'mark_paid_with_overpayment'} action
 * @property {string} reason          - kódový důvod (matchuje payment_unmatched.reason check)
 * @property {string} humanReason     - lidsky čitelný popis pro email/log
 */

// Konstanty pro byznys pravidla — změň zde, ne v inline kódu uvnitř funkce
export const TOLERANCE_KC = 1.00;  // ±1 Kč = stále considered "přesná shoda"

/**
 * Rozhodne, co dělat s příchozí Fio transakcí na základě stavu faktury.
 *
 * Pravidla (viz docs/n8n-fio-matching.md, sekce "Edge case matrix"):
 *   1. Faktura neexistuje                          → unmatched (no_invoice_match)
 *   2. Faktura paid (už spárováno)                 → unmatched (duplicate_payment)
 *   3. Faktura cancelled/refunded                  → unmatched (payment_to_cancelled)
 *   4. amount < total - TOLERANCE (nedoplatek)     → unmatched (underpayment), nechat unpaid
 *   5. amount > total + TOLERANCE (přeplatek)      → mark_paid_with_overpayment + log
 *   6. |amount - total| ≤ TOLERANCE                → mark_paid (standardní happy path)
 *
 * @param {number} amount - paid amount z Fio transakce (CZK)
 * @param {InvoiceLookup|null} invoice - výsledek SELECT FROM invoices WHERE vs=? AND type='invoice', nebo null
 * @returns {MatchAction}
 */
export function decideMatchAction(amount, invoice) {
  // 1) Faktura podle VS neexistuje
  if (!invoice) {
    return {
      action: 'unmatched',
      reason: 'no_invoice_match',
      humanReason: `Příchozí platba ${amount} Kč nemá v DB fakturu se stejným VS. Možný klient bez objednávky, špatně opsaný VS, nebo zaslaná platba na nesouvisející věc.`,
    };
  }

  // 2) Faktura už zaplacená — duplikovaná platba (klient zaplatil dvakrát)
  if (invoice.status === 'paid') {
    return {
      action: 'unmatched',
      reason: 'duplicate_payment',
      humanReason: `Faktura ${invoice.number} je už označená jako zaplacená, ale přišla další platba ${amount} Kč se stejným VS. Pravděpodobně klient zaplatil omylem dvakrát — zvaž vrácení.`,
    };
  }

  // 3) Faktura zrušená nebo v dobropisu — neměla bys vůbec dostat platbu
  if (invoice.status === 'cancelled' || invoice.status === 'refunded') {
    return {
      action: 'unmatched',
      reason: 'payment_to_cancelled',
      humanReason: `Faktura ${invoice.number} je ve stavu '${invoice.status}', ale přišla platba ${amount} Kč. Kontaktuj klienta a vrať peníze, nebo vystav novou fakturu.`,
    };
  }

  // 4) Nedoplatek nad tolerancí — fakturu nechat unpaid, log pro admin
  const diff = amount - invoice.total;
  if (diff < -TOLERANCE_KC) {
    return {
      action: 'unmatched',
      reason: 'underpayment',
      humanReason: `Faktura ${invoice.number}: zaplaceno ${amount} Kč, ale celkem ${invoice.total} Kč. Chybí ${Math.abs(diff).toFixed(2)} Kč. Kontaktuj klienta na doplatek nebo akceptuj ručně.`,
    };
  }

  // 5) Přeplatek nad tolerancí — fakturu paid, ale log pro admin (možné vrácení)
  if (diff > TOLERANCE_KC) {
    return {
      action: 'mark_paid_with_overpayment',
      reason: 'overpayment',
      humanReason: `Faktura ${invoice.number}: zaplaceno ${amount} Kč, celkem ${invoice.total} Kč. Přeplatek ${diff.toFixed(2)} Kč. Faktura označena jako paid, zvaž vrácení přeplatku.`,
    };
  }

  // 6) Happy path — částka sedí v rámci tolerance
  return {
    action: 'mark_paid',
    reason: 'paid',  // (info-only, do unmatched se nepíše)
    humanReason: `Faktura ${invoice.number} zaplacena (${amount} Kč).`,
  };
}
