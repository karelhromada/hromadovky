// Invoice HTML template — server-side, used by Vercel serverless PDF function.
// Mirrors the n8n archive HTML so the rendered PDF matches the stored archive byte-for-byte.

export interface InvoiceCustomer {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  zip?: string;
  isB2B?: boolean;
  companyName?: string;
  ico?: string;
  dic?: string;
  payment?: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  backName?: string;
  size?: string;
}

export interface InvoiceRow {
  number: string;
  type: 'invoice' | 'credit_note';
  variable_symbol: string;
  issued_at: string;
  taxable_supply_at: string;
  due_at: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number | string;
  shipping_fee: number | string;
  cod_fee: number | string;
  total: number | string;
  payment_method: 'transfer' | 'cod';
  credit_reason?: string | null;
  original_invoice_id?: string | null;
}

const escape = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatMoney = (n: number | string): string =>
  Number(n).toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' Kč';

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('cs-CZ');

function customerLines(customer: InvoiceCustomer): string[] {
  const lines: string[] = [];
  const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
  if (customer.isB2B) {
    if (customer.companyName) lines.push(escape(customer.companyName));
    if (fullName) lines.push(escape(fullName));
  } else if (fullName) {
    lines.push(escape(fullName));
  }
  if (customer.street) lines.push(escape(customer.street));
  const cityLine = `${customer.zip ?? ''} ${customer.city ?? ''}`.trim();
  if (cityLine) lines.push(escape(cityLine));
  if (customer.isB2B && customer.ico) lines.push(`IČO: ${escape(customer.ico)}`);
  if (customer.isB2B && customer.dic) lines.push(`DIČ: ${escape(customer.dic)}`);
  if (lines.length === 0) lines.push('Zákazník neznámý');
  return lines;
}

export function renderInvoiceHtml(invoice: InvoiceRow): string {
  const isCreditNote = invoice.type === 'credit_note';
  const isCod = invoice.payment_method === 'cod';
  const total = Number(invoice.total);
  const subtotal = Number(invoice.subtotal);
  const shipping = Number(invoice.shipping_fee);
  const cod = Number(invoice.cod_fee);

  const title = isCreditNote
    ? 'OPRAVNÝ ÚČETNÍ DOKLAD — DOBROPIS'
    : 'FAKTURA — daňový doklad neplátce DPH';

  const customer = customerLines(invoice.customer);
  const items = (invoice.items ?? [])
    .map((it) => {
      const subParts: string[] = [];
      if (it.backName) subParts.push(`Zadní strana: ${escape(it.backName)}`);
      if (it.size) subParts.push(`Velikost: ${escape(it.size)}`);
      const sub = subParts.length
        ? `<div style="font-size:9pt;color:#666;margin-top:2px;">${subParts.join(' · ')}</div>`
        : '';
      return `<tr>
  <td>${escape(it.name)}${sub}</td>
  <td class="num">${it.quantity}</td>
  <td class="num">${formatMoney(it.unitPrice)}</td>
  <td class="num">${formatMoney(it.total)}</td>
</tr>`;
    })
    .join('');

  const codRow =
    cod !== 0
      ? `<div class="row"><span>Příplatek za dobírku:</span><span>${formatMoney(cod)}</span></div>`
      : '';

  const qrUrl =
    `https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=2202858274` +
    `&bankCode=6210&prefix=670100` +
    `&amount=${Math.abs(total).toFixed(2)}` +
    `&currency=CZK&vs=${encodeURIComponent(invoice.variable_symbol)}&size=220`;

  const paymentBlock = !isCod && !isCreditNote
    ? `<div class="payment">
  <div class="payment-info">
    <h3>Údaje pro platbu převodem</h3>
    <div>Bankovní účet: <strong>670100-2202858274 / 6210</strong> (mBank)</div>
    <div>IBAN: <strong>CZ07 6210 0000 0022 0285 8274</strong></div>
    <div>Variabilní symbol: <strong>${escape(invoice.variable_symbol)}</strong></div>
    <div>Splatnost: <strong>${formatDate(invoice.due_at)}</strong></div>
  </div>
  <div class="qr">
    <img src="${qrUrl}" alt="QR Platba" />
    <small>QR Platba — naskenujte pro rychlou platbu</small>
  </div>
</div>`
    : '';

  const creditBlock = isCreditNote
    ? `<div class="credit-block">
  ${
    invoice.original_invoice_id
      ? `<p>Vztahuje se k původní faktuře (ID ${escape(invoice.original_invoice_id)}).</p>`
      : ''
  }
  ${
    invoice.credit_reason
      ? `<p><strong>Důvod opravy:</strong> ${escape(invoice.credit_reason)}</p>`
      : ''
  }
  <p>Vrácená částka ${formatMoney(Math.abs(total))} bude zaslána zákazníkovi do 14 dnů.</p>
</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<title>${escape(invoice.number)} – Hromadovky</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 11pt; padding: 0; margin: 0; background: #fff; }
  .invoice { padding: 36px 44px; max-width: 800px; margin: 0 auto; }
  .doc-title { font-size: 18pt; font-weight: 700; margin: 0 0 4px; letter-spacing: 0.02em; ${isCreditNote ? 'color:#c33;' : ''} }
  .doc-subtitle { font-size: 10pt; color: #666; margin-bottom: 24px; }
  .top-grid { display: flex; gap: 24px; margin-bottom: 24px; }
  .party { flex: 1; }
  .party h3 { font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin: 0 0 6px; font-weight: 600; }
  .party div { line-height: 1.5; }
  .meta { background: #f7f5ee; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px; }
  .meta-row { display: flex; justify-content: space-between; padding: 3px 0; }
  .meta-row span:first-child { color: #666; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e5e2d6; vertical-align: top; }
  th { background: #f7f5ee; font-weight: 600; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.04em; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-left: auto; width: 50%; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid ${isCreditNote ? '#c33' : '#1a1a1a'}; padding-top: 8px; margin-top: 8px; font-weight: 700; font-size: 13pt; ${isCreditNote ? 'color:#c33;' : ''} }
  .payment { display: flex; gap: 24px; margin: 28px 0; padding: 16px; background: #f7f5ee; border-radius: 8px; }
  .payment-info { flex: 2; }
  .payment-info h3 { margin: 0 0 8px; font-size: 10.5pt; }
  .payment-info div { line-height: 1.6; }
  .qr { flex: 1; text-align: center; }
  .qr img { width: 160px; height: 160px; }
  .qr small { display: block; font-size: 8.5pt; color: #666; margin-top: 4px; }
  .footer-note { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e2d6; font-size: 9pt; color: #888; line-height: 1.6; }
  .credit-block { background: #fff5f5; border-left: 4px solid #c33; border-radius: 4px; padding: 14px 16px; margin: 0 0 24px; }
  .credit-block p { margin: 4px 0; font-size: 10.5pt; }
</style>
</head>
<body>
<div class="invoice">
  <h1 class="doc-title">${title}</h1>
  <p class="doc-subtitle">Číslo dokladu: <strong>${escape(invoice.number)}</strong></p>
  ${creditBlock}
  <div class="top-grid">
    <div class="party">
      <h3>Dodavatel</h3>
      <div><strong>Karel Hromada</strong></div>
      <div>Zeyerova alej 20</div>
      <div>160 00 Praha 6</div>
      <div>IČO: 76137767</div>
      <div>Není plátce DPH dle §6 ZDPH</div>
      <div style="margin-top:8px; color:#666; font-size: 9.5pt;">info@hromadovky.cz</div>
    </div>
    <div class="party">
      <h3>Odběratel</h3>
      ${customer.map((l) => `<div>${l}</div>`).join('')}
    </div>
  </div>
  <div class="meta">
    <div class="meta-row"><span>Datum vystavení:</span><strong>${formatDate(invoice.issued_at)}</strong></div>
    <div class="meta-row"><span>Datum uskutečnění zdanitelného plnění (DUZP):</span><strong>${formatDate(invoice.taxable_supply_at)}</strong></div>
    ${
      !isCreditNote
        ? `<div class="meta-row"><span>Datum splatnosti:</span><strong>${formatDate(invoice.due_at)}</strong></div>`
        : ''
    }
    <div class="meta-row"><span>Forma úhrady:</span><strong>${isCod ? 'Dobírka' : 'Bankovní převod'}</strong></div>
    <div class="meta-row"><span>Variabilní symbol:</span><strong>${escape(invoice.variable_symbol)}</strong></div>
  </div>
  <table>
    <thead><tr>
      <th>Popis</th>
      <th class="num">Množství</th>
      <th class="num">Cena/ks</th>
      <th class="num">Celkem</th>
    </tr></thead>
    <tbody>${items}</tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Mezisoučet:</span><span>${formatMoney(subtotal)}</span></div>
    ${shipping !== 0 ? `<div class="row"><span>Doprava:</span><span>${formatMoney(shipping)}</span></div>` : ''}
    ${codRow}
    <div class="row grand"><span>${isCreditNote ? 'Vrácená částka:' : 'Celkem k úhradě:'}</span><span>${formatMoney(total)}</span></div>
  </div>
  ${paymentBlock}
  <div class="footer-note">
    Dodavatel není plátcem DPH dle §6 zákona č. 235/2004 Sb. o dani z přidané hodnoty.
    Tento ${isCreditNote ? 'opravný účetní doklad' : 'doklad'} je vystaven podle §11 zákona č. 563/1991 Sb. o účetnictví.
  </div>
</div>
</body>
</html>`;
}
