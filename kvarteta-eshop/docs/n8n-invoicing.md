# n8n setup pro fakturaci a dobropisy

Tento dokument popisuje, co je potřeba nakonfigurovat v n8n instanci na
`https://n8n.srv1051339.hstgr.cloud`, aby kompletně fungoval fakturační systém
(faktury auto při objednávce, dobropisy z admin UI).

> **Předpoklad:** SQL migrace `supabase/migrations/20260428000000_invoices.sql`
> je už aplikovaná v Supabase a Karlův účet má `app_metadata.role = 'admin'`.

---

## 0. Credentials v n8n (jednou)

V **n8n → Credentials** přidej:

1. **Supabase API** (název např. `hromadovky_supabase_service`):
   - Host: URL tvého Supabase projektu (z dashboardu).
   - Service Role Key: **service role** klíč ze Supabase Settings → API.
     Je to silný klíč (bypass RLS) — používej jen v n8n, nikdy v frontendu.

2. **Postgres** (název např. `hromadovky_postgres`) — pro SQL volání RPC:
   - Host, Database, User (`postgres`), Password, Port `5432` ze Supabase
     Settings → Database → Connection info.
   - SSL: `require`.

3. **SMTP** (název např. `hromadovky_smtp`) — pokud už máš pro objednávky,
   používej stejné. Jinak založ nové (Smtp host hromadovky.cz, port 465,
   uživatelské jméno/heslo).

---

## 1. Rozšíření workflow `objednavka` o vystavení faktury

Otevři existující workflow s webhookem `objednavka` a za poslední aktuální
node (typicky email-notify zákazníkovi) **přidej** následujících 6 nodů.

### Node 1 — Postgres "Generuj číslo faktury"

- Operation: **Execute Query**
- Credential: `hromadovky_postgres`
- Query:
  ```sql
  select next_invoice_number('invoice') as number;
  ```
- Output → uloží se jako `{{ $json.number }}` (např. `2026-0042`).

### Node 2 — Postgres "Vlož řádek faktury"

- Operation: **Execute Query**
- Credential: `hromadovky_postgres`
- Query (parametrizováno přes Expression mode v n8n):
  ```sql
  insert into invoices (
    number, type, variable_symbol, due_at,
    customer, items, subtotal, shipping_fee, cod_fee, total, payment_method
  ) values (
    $1, 'invoice', $2, current_date + interval '7 days',
    $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9
  )
  returning id, number, issued_at, due_at;
  ```
- Parameters (`$1..$9`) sestav z payloadu webhooku z CheckoutPage.tsx:
  - `$1`: `{{ $node["Generuj číslo faktury"].json.number }}`
  - `$2`: `{{ $node["Webhook"].json.variableSymbol }}`
  - `$3`: `{{ JSON.stringify($node["Webhook"].json.customer) }}`
  - `$4`: items zjednodušené pro PDF — viz Code node níže
  - `$5..$9`: částky z webhooku (`totalAmount`, `deliveryCost`, `paymentCost`,
    `totalToPay`, `customer.payment`).

### Node 3 — Code "Připrav data pro HTML"

- Code (JavaScript):
  ```javascript
  const order = $input.first().json;
  const invoice = $node["Vlož řádek faktury"].json;
  const customer = order.customer;

  const items = order.items.map(it => ({
    name: it.name + (it.options?.size ? ` (${it.options.size})` : ''),
    quantity: it.quantity,
    unitPrice: it.price,
    total: it.total,
  }));

  const subtotal = order.totalAmount;
  const shipping = order.deliveryCost ?? 0;
  const cod = order.paymentCost ?? 0;
  const total = order.totalToPay;

  const isB2B = customer.isB2B && customer.ico;
  const customerLines = [
    isB2B ? customer.companyName : `${customer.firstName} ${customer.lastName}`.trim(),
    isB2B ? `${customer.firstName} ${customer.lastName}`.trim() : null,
    customer.street,
    `${customer.zip} ${customer.city}`.trim(),
    isB2B ? `IČO: ${customer.ico}` : null,
    isB2B && customer.dic ? `DIČ: ${customer.dic}` : null,
  ].filter(Boolean);

  // Fio Banka (kód 2010) — Fio účty nemají prefix, proto parametr `prefix` vynechán.
  // POZOR: Při změně bankovního účtu musíš aktualizovat tento Code node v živém n8n
  // workflow `objednavka`, ne jen tento markdown. Markdown je dokumentace.
  //
  // UPDATE 2026-05-14: Email s fakturou (PDF příloha) se NEPOSÍLÁ z tohoto workflow.
  // Připojení `Faktura: Update DB + email body` → `Faktura: Má email?` bylo odebráno.
  // Faktura se vygeneruje, nahraje do Drive a `pdf_path` se uloží do `invoices`,
  // ale email s PDF přílohou se posílá až po spárování platby ve workflow
  // `fio-payment-matcher` (viz docs/n8n-fio-matching.md).
  const qrUrl = `https://api.paylibo.com/paylibo/generator/czech/image?` +
    `accountNumber=2202066277&bankCode=2010` +
    `&amount=${total}&currency=CZK&vs=${order.variableSymbol}&size=220`;

  return [{
    json: {
      number: invoice.number,
      issuedAt: invoice.issued_at,
      dueAt: invoice.due_at,
      customerLines,
      customerEmail: customer.email,
      items,
      subtotal,
      shipping,
      cod,
      total,
      paymentMethod: customer.payment,
      variableSymbol: order.variableSymbol,
      qrUrl,
      // Načteno přes HTML šablonu níže:
      type: 'invoice',
    }
  }];
  ```

### Node 4 — Code "Render HTML"

Vlož níže uvedenou HTML šablonu jako konstantu a vyplň ji daty z předchozího
nodu. Pro jednoduchost použiji stringové nahrazení; pro robustnější řešení lze
nainstalovat `n8n-nodes-handlebars` a použít `{{ }}` syntax.

Šablona v souboru [`templates/invoice.html`](./templates/invoice.html) níže.
Code node:

```javascript
const data = $input.first().json;
const fs = require('fs');

let template = `<!--TEMPLATE-PLACEHOLDER-->`;  // viz invoice.html níže
// Doporučuji uložit šablonu do n8n jako "Static Data" nebo do souboru
// na n8n VPS a načíst ji zde.

const itemsHtml = data.items.map(it => `
  <tr>
    <td>${it.name}</td>
    <td class="num">${it.quantity}</td>
    <td class="num">${it.unitPrice.toLocaleString('cs-CZ')} Kč</td>
    <td class="num">${it.total.toLocaleString('cs-CZ')} Kč</td>
  </tr>
`).join('');

const customerHtml = data.customerLines.map(l => `<div>${l}</div>`).join('');

const isCreditNote = data.type === 'credit_note';
const docTitle = isCreditNote ? 'OPRAVNÝ ÚČETNÍ DOKLAD — DOBROPIS' : 'FAKTURA — daňový doklad neplátce DPH';

const filled = template
  .replace('{{DOC_TITLE}}', docTitle)
  .replace('{{NUMBER}}', data.number)
  .replace('{{ISSUED_AT}}', new Date(data.issuedAt).toLocaleDateString('cs-CZ'))
  .replace('{{DUE_AT}}', new Date(data.dueAt).toLocaleDateString('cs-CZ'))
  .replace('{{CUSTOMER_BLOCK}}', customerHtml)
  .replace('{{ITEMS_ROWS}}', itemsHtml)
  .replace('{{SUBTOTAL}}', data.subtotal.toLocaleString('cs-CZ'))
  .replace('{{SHIPPING}}', data.shipping.toLocaleString('cs-CZ'))
  .replace('{{COD}}', data.cod.toLocaleString('cs-CZ'))
  .replace('{{TOTAL}}', data.total.toLocaleString('cs-CZ'))
  .replace('{{VARIABLE_SYMBOL}}', data.variableSymbol)
  .replace('{{PAYMENT_METHOD}}', data.paymentMethod === 'cod' ? 'Dobírka' : 'Bankovní převod')
  .replace('{{QR_URL}}', data.qrUrl)
  .replace('{{CREDIT_REASON_BLOCK}}',
    isCreditNote && data.creditReason ? `<p><strong>Důvod opravy:</strong> ${data.creditReason}</p>` : '')
  .replace('{{ORIGINAL_REF_BLOCK}}',
    isCreditNote && data.originalNumber ? `<p>Vztahuje se k faktuře č. <strong>${data.originalNumber}</strong> ze dne ${new Date(data.originalIssuedAt).toLocaleDateString('cs-CZ')}.</p>` : '');

return [{ json: { ...data, html: filled } }];
```

### Node 5 — Execute Command "HTML → PDF" (wkhtmltopdf na VPS)

> Předpoklad: na n8n VPS je nainstalovaný `wkhtmltopdf`. Instalace:
> `apt-get install wkhtmltopdf` (Debian/Ubuntu).
> Alternativa: použít komunitní node `n8n-nodes-puppeteer` (vyžaduje Chromium
> a víc paměti, ale funguje bez sudo).

- Command:
  ```bash
  echo {{ JSON.stringify($json.html) }} | wkhtmltopdf --enable-local-file-access -q --page-size A4 --margin-top 12mm --margin-bottom 12mm --margin-left 14mm --margin-right 14mm - /tmp/{{$json.number}}.pdf && cat /tmp/{{$json.number}}.pdf | base64
  ```
- Output: base64 řetězec PDF v `stdout`.

### Node 6 — HTTP Request "Upload do Supabase Storage"

- Method: `POST`
- URL: `https://YOUR_PROJECT.supabase.co/storage/v1/object/invoices/{{ $json.issuedAt.substring(0,4) }}/{{ $json.number }}.pdf`
- Headers:
  - `Authorization: Bearer {{ $credentials.hromadovky_supabase_service.serviceRoleKey }}`
  - `Content-Type: application/pdf`
  - `x-upsert: true`
- Body: `Binary` z předchozího Code nodu, který dekóduje base64 zpět:

  Vlož mezi node 5 a 6 ještě malý Code node:
  ```javascript
  const base64 = $input.first().json.stdout || $input.first().json;
  return [{
    binary: { data: { mimeType: 'application/pdf', data: base64 } },
    json: $input.first().json,
  }];
  ```

### Node 7 — Postgres "Update pdf_path"

- Operation: Execute Query
- Query:
  ```sql
  update invoices
  set pdf_path = $1, pdf_generated_at = now()
  where number = $2;
  ```
- Parametry: `pdf_path` ve formátu `{year}/{number}.pdf`
  (např. `2026/2026-0042.pdf`), `number` z předchozího kroku.

### Node 8 — Email s odkazem na fakturu

Rozšiř existující email node o sekci s odkazem na PDF fakturu. Pro signed URL
přidej HTTP Request:

- Method: `POST`
- URL: `https://YOUR_PROJECT.supabase.co/storage/v1/object/sign/invoices/{{ $json.year }}/{{ $json.number }}.pdf`
- Body (JSON): `{ "expiresIn": 2592000 }` (30 dní)
- Headers: `Authorization: Bearer {service_role_key}`
- Response: `signedURL` (relativní cesta, prefixuj `https://YOUR_PROJECT.supabase.co/storage/v1` — n8n vrátí celé URL v `data.signedURL`).

V emailu zákazníkovi přidej: "Fakturu č. {{number}} si můžete stáhnout zde: {{signedUrl}}".

---

## 2. Nový workflow `dobropis`

Vytvoř nový workflow s webhookem (HTTP Method `POST`, Path `dobropis`).

### Node 1 — Webhook (trigger)

- HTTP Method: `POST`
- Path: `dobropis`
- Authentication: `Header Auth` — header `Authorization: Bearer <jwt>`.
  V n8n Webhook Settings zapni "Authentication: None" a kontrolu provedeš
  v dalším nodu (jednodušší než nastavovat custom auth).

### Node 2 — Code "Ověř admin JWT"

```javascript
const auth = $input.first().json.headers?.authorization || '';
const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
if (!token) {
  throw new Error('Missing Authorization header');
}

// JWT ověření přes Supabase /auth/v1/user endpoint:
const supabaseUrl = 'https://YOUR_PROJECT.supabase.co';
const response = await this.helpers.request({
  method: 'GET',
  uri: `${supabaseUrl}/auth/v1/user`,
  headers: {
    Authorization: `Bearer ${token}`,
    apikey: '<ANON_KEY>',  // anon klíč stačí pro tuto kontrolu
  },
  json: true,
});

if (response.app_metadata?.role !== 'admin') {
  throw new Error('Forbidden: admin role required');
}

return [{ json: { ...$input.first().json.body, adminEmail: response.email } }];
```

### Node 3 — Postgres "Načti původní fakturu"

```sql
select id, number, issued_at, customer, items, subtotal, shipping_fee, cod_fee,
       total, variable_symbol, payment_method
from invoices
where id = $1 and type = 'invoice' and status = 'paid';
```

Pokud žádný řádek → vyhoď chybu "původní faktura neexistuje nebo není
zaplacená".

### Node 4 — Postgres "Generuj číslo dobropisu"

```sql
select next_invoice_number('credit_note') as number;
```

### Node 5 — Postgres "Vlož dobropis"

```sql
insert into invoices (
  number, type, original_invoice_id, variable_symbol,
  taxable_supply_at, due_at,
  customer, items, subtotal, shipping_fee, cod_fee, total, payment_method,
  status, credit_reason
) values (
  $1, 'credit_note', $2, $3,
  current_date, current_date + interval '7 days',
  $4::jsonb, $5::jsonb, $6, 0, 0, $7, $8,
  'paid', $9
)
returning id, number, issued_at, due_at;
```

`$7` = záporná částka (`-amount` z webhook payloadu).
`$9` = `reason` z webhook payloadu.

### Node 6–9 — Stejně jako u faktury

Render HTML (varianta dobropisu s `type='credit_note'` + `creditReason` +
`originalNumber` + `originalIssuedAt`) → PDF → upload → update pdf_path.

### Node 10 — Postgres "Označ původní fakturu jako refunded"

```sql
update invoices set status = 'refunded'
where id = $1;
```

> **Pozn.:** Pro **částečný** dobropis ponech původní fakturu na `paid`.
> Rozhodni se v Code nodu podle `amount === original.total`.

### Node 11 — Email zákazníkovi

"Vystavili jsme dobropis č. {{D-2026-0001}} k faktuře č. {{2026-0042}}.
Vrácená částka {{XYZ}} Kč bude zaslána na váš účet do 14 dnů.
Dobropis si můžete stáhnout zde: {{signedUrl}}".

---

## 3. HTML šablona (uložit jako `docs/templates/invoice.html` v repu)

Šablonu obsluhuje stejný Code node pro fakturu i dobropis — rozdíly jsou jen
v `{{DOC_TITLE}}`, `{{CREDIT_REASON_BLOCK}}` a `{{ORIGINAL_REF_BLOCK}}`.

Obsah šablony je v souboru `docs/templates/invoice.html`.

---

## 4. Test checklist

1. ✅ Migrace SQL aplikovaná v Supabase (`select next_invoice_number('invoice')`
   vrací `2026-0001`).
2. ✅ Karel má `app_metadata.role = 'admin'` → vidí `/admin/invoices`.
3. ✅ Workflow `objednavka` rozšířený, testuj objednávkou na lokále:
   - V Supabase Studio → tabulka `invoices` → nový řádek `unpaid`.
   - V Storage → bucket `invoices` → PDF `2026/2026-0001.pdf`.
   - Email s odkazem dorazil.
4. ✅ Workflow `dobropis` napojený, testuj z `/admin/invoices` u `paid`
   faktury → modal → submit:
   - Nový řádek `credit_note` v Supabase, `total < 0`, `original_invoice_id`
     vyplněné.
   - Původní faktura `status = 'refunded'`.
   - PDF dobropisu v Storage, email dorazil.
5. ✅ Číselná řada — vystavit 3 faktury rychle za sebou → čísla `0001`,
   `0002`, `0003` bez duplicit.
6. ✅ B2B test — checkout s vyplněným IČO `76137767` → ARES vyplní firmu →
   na faktuře vidět `IČO: 76137767`.

---

## 5. Co je mimo n8n (řeší frontend)

- **Označení faktury jako `paid`** — admin UI volá Supabase přímo přes RLS
  policy. n8n s tím nic nedělá.
- **Stažení PDF** — admin UI generuje signed URL přes Supabase JS SDK, n8n
  jen poskytuje obsah ve Storage.
- **Cancellation** — admin UI volá Supabase update přímo.

## 6. Otevřené otázky pro fázi 2

- Auto-detekce platby (mBank API není veřejné — možnosti: Salt Edge, Bank
  Connect, manuální import CAMT.053).
- ISDOC export pro účetní (n8n měsíční cron generuje XML).
- Záloha PDF do Google Drive (n8n měsíční sync).
