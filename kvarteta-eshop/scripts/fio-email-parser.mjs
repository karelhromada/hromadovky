// Parser pro emailové notifikace od Fio Hlásiče.
// Subject emailu: "Fio banka - prijem na konte" (BEZ diakritiky)
// Tělo má diakritiku, viz scripts/fixtures/fio-email-sample.txt.
//
// Tento modul je zdroj pravdy — stejný kód se zkopíruje do n8n Code nodu
// `Process + Match (email)` v workflow `Hromadovky – Fio Email Matcher`.
//
// Při změně pravidel:
//   a) Edituj parseFioEmail() níže
//   b) Aktualizuj testy v scripts/fio-email-parser.test.mjs
//   c) Spusť `node scripts/fio-email-parser.test.mjs` — všechny musí projít
//   d) Zkopíruj funkci do n8n Code nodu (Edit → Save → Activate)

/**
 * @typedef {Object} FioTransaction
 * Kompatibilní s payment-matching.mjs FioTransaction typedef.
 *
 * @property {string} fioId           - unikátní ID (Gmail Message ID v produkci, fallback hash v testech)
 * @property {number} amount          - vždy kladné (Hlásič posílá jen kredit)
 * @property {string|null} vs         - variabilní symbol nebo null
 * @property {string} date            - YYYY-MM-DD
 * @property {string} counterAccount  - protiúčet "12345-67890/0800"
 * @property {string} note            - "Zpráva příjemci" nebo prázdné
 */

/**
 * Parsuje text/plain tělo Fio Hlásič emailu.
 *
 * **Formát emailu (zjištěno z reálné notifikace 2026-05-15):**
 * ```
 * Příjem na kontě: 2202066277
 * Částka: 10,00
 * VS: 1778790461
 * Zpráva příjemci: PLATBA
 * Aktuální zůstatek: 459,00
 * Protiúčet: 670100-2202858274/6210
 * SS: 0000000000
 * KS: 0000
 * ```
 *
 * Email NEOBSAHUJE explicitní ID transakce ani datum — proto `external`
 * dodává `fioId` (Gmail Message ID, unique per email) a `date` (z msg.internalDate).
 *
 * @param {string} emailBody - raw text/plain body
 * @param {{fioId?: string, date?: string}} [external] - metadata z Gmail msg
 * @returns {FioTransaction|null} null = nečitelný / non-Fio email
 */
export function parseFioEmail(emailBody, external = {}) {
  if (typeof emailBody !== 'string' || emailBody.trim() === '') return null;
  const body = emailBody.replace(/ /g, ' ');

  const amountMatch = body.match(/^\s*[ČčC]ástka:\s*([\d\s.,]+?)\s*$/im);
  if (!amountMatch) return null;
  const amount = Number(String(amountMatch[1]).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const vsMatch = body.match(/^\s*VS:\s*(\d+)\s*$/im);
  const vs = vsMatch ? vsMatch[1] : null;

  const accMatch = body.match(/^\s*Protiú[čc]et:\s*(.+?)\s*$/im);
  const counterAccount = accMatch ? accMatch[1] : '';

  const noteMatch = body.match(/^\s*Zpráva\s+příjemci:\s*(.+?)\s*$/im);
  const note = noteMatch ? noteMatch[1] : '';

  const fioId = external.fioId
    ? String(external.fioId)
    : `fb-${amount}-${vs ?? 'novs'}-${counterAccount.replace(/[^\d]/g, '') || 'noacc'}`;
  const date = external.date || new Date().toISOString().slice(0, 10);

  return { fioId, amount, vs, date, counterAccount, note };
}

/**
 * Helper: "DD.MM.YYYY" → "YYYY-MM-DD". Pro budoucí použití (Hlásič aktuálně datum neposílá).
 *
 * @param {string} czechDate
 * @returns {string}
 */
export function czechDateToIso(czechDate) {
  const m = String(czechDate || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
