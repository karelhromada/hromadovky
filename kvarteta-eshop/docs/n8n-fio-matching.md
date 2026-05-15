# n8n workflows: Fio payment matching (dual-channel)

> Od **2026-05-15** běží párování plateb ve **dvou kanálech současně**, oba sdílí identickou match logiku a DB-level idempotenci:
>
> 1. **Primární — `Hromadovky – Fio Email Matcher`**: Gmail Trigger sleduje label `fio-platby`, kam Fio Hlásič posílá emaily o příchozích platbách. Latence < 5 min. Žádný polling Fio API ani Supabase při klidovém stavu.
> 2. **Záloha — `Hromadovky – Fio Payment Matcher`** (legacy polling): běží 4× denně (po 6 h), volá Fio `/periods/` a procesí transakce za posledních 7 dní. Slouží jako safety net pro výpadek Hlásiče / Gmail filtru.
>
> Idempotence (`fio_transaction_id UNIQUE` + `ON CONFLICT DO NOTHING` + `WHERE status='unpaid'`) zajišťuje, že platba zachycená oběma kanály se zpracuje právě jednou.

## Architektonický kontext

- **Stack:** n8n (self-hosted, `n8n.hromadovky.cz`) → Gmail API (primary) / Fio REST API (backup) → Supabase Postgres
- **Trigger primary:** Gmail Trigger (label `fio-platby`, poll 2 min) — Fio API webhooky nepodporuje, ale Hlásič → email je nejbližší ekvivalent
- **Trigger backup:** Schedule Trigger každých 6 h (Fio limit 1 dotaz / 30 s — máme obří rezervu, frekvence je daná pouze potřebou recovery, ne rate-limity)
- **Idempotence:** `fio_transaction_id UNIQUE` v DB + `/periods/{from}/{to}/` endpoint (ne `/last/`, který posunuje kurzor)
- **Rolback po výpadku:** `from = today - 7d` — backup workflow zachytí všechny transakce z období, kdy email kanál nezachytil
- **Token (jen backup):** uložen v **n8n environment variable `FIO_API_TOKEN`** (nikoli v credentials, protože n8n z bezpečnostních důvodů nedovoluje číst credential hodnoty v expressions). V repu ani v client buildu token NIKDY není.
- **Související soubory v repu:**
  - `kvarteta-eshop/scripts/payment-matching.mjs` — pure rozhodovací logika `decideMatchAction()` (zdroj pravdy, sdílená oběma kanály)
  - `kvarteta-eshop/scripts/payment-matching.test.mjs` — unit testy match logiky
  - `kvarteta-eshop/scripts/fio-email-parser.mjs` — parser Fio Hlásič emailu (primary kanál)
  - `kvarteta-eshop/scripts/fio-email-parser.test.mjs` — unit testy parseru
  - `kvarteta-eshop/scripts/fixtures/fio-email-sample.txt` — vzor reálného emailu pro fixture testů
  - `kvarteta-eshop/scripts/test-fio.mjs` — lokální ověření Fio API tokenu
  - `kvarteta-eshop/supabase/migrations/20260514120000_fio_payment_matching.sql` — DB schema

## Primary: `Hromadovky – Fio Email Matcher` (2026-05-15+)

Trigger emailem od Fio Hlásiče. Bez polling, latence < 5 min od přijetí platby.

```
[Gmail Trigger] (label: fio-platby, poll 2 min)
   subject "Fio banka - prijem na konte"
        │
        ▼
[Code: parse-fio-email]
   parseFioEmail(emailBody) → { fioId, amount, vs, date, counterAccount, note }
   Zdroj pravdy: scripts/fio-email-parser.mjs
        │
        ▼
[IF: parsed !== null]
        ├── FALSE ──► [STOP] (mail není platební nebo parsing selhal)
        └── TRUE  ──┐
                    ▼
            [Code: Process + Match] (stejný jako v polling matcher, jen vstupem je 1 transakce z parseru, ne pole z Fio JSON)
                    │
                    ▼
            [stejné větve: IF emailType / Drive PDF / SMTP customer / SMTP admin]
```

**Gmail credentials:** vyžaduje nový OAuth credential v n8n typu `gmailOAuth2` pro účet `karel.hromada30@gmail.com`. Scope: read-only (`https://www.googleapis.com/auth/gmail.readonly`).

## Backup (legacy): `Hromadovky – Fio Payment Matcher` (běží 4×/den)

> **Update 2026-05-14:** Workflow nově **posílá fakturu emailem až po úspěšném spárování platby** (před tím přicházela hned po objednávce). Po `mark_paid` se stáhne PDF faktury z Google Drive (přes `pdf_path` uložený v `invoices` během workflow `objednavka`) a připojí se k emailu zákazníkovi. Admin emaily (`unmatched`, `overpayment`) jdou separátní SMTP větví bez přílohy.
>
> **Update 2026-05-15:** Frekvence Schedule Trigger snížena z 1 min na 6 h. Slouží jako záloha pro výpadek emailového kanálu — DB idempotence (`fio_transaction_id UNIQUE`) zajišťuje, že žádná platba nebude zpracována dvakrát ani při souběhu obou kanálů.

```
[Schedule Trigger] (each 6 hours)
        │
        ▼
[HTTP Request: Fio /periods/]
   URL: https://fioapi.fio.cz/v1/rest/periods/{{ $env.FIO_API_TOKEN }}/{{ $now.minus({days: 7}).toFormat('yyyy-MM-dd') }}/{{ $now.toFormat('yyyy-MM-dd') }}/transactions.json
   Method: GET
   Retry on fail: 3× s 35 s gap (>30s Fio rate-limit okno)
        │
        ▼
[Code: parse-transactions] ───► viz "Code node 1" níže
        │
        ▼
[IF: transactions.length === 0]
        ├── TRUE  ──► [STOP] (drží execution log clean — žádný spam s prázdnými runy)
        │
        └── FALSE ──┐
                    ▼
            [Split In Batches] velikost = 1
                    │
                    ▼
            [Postgres: SELECT invoice WHERE vs = $1 AND type='invoice' LIMIT 1]
                    │
                    ▼
            [Code: decide-match-action] ───► viz "Code node 2" níže (pure logika)
                    │
                    ▼
            [Switch] na základě action z předchozího node:
                ├── 'mark_paid'                      ──► [Postgres UPDATE invoice paid] ──► [Email zákazníkovi]
                ├── 'mark_paid_with_overpayment'     ──► [Postgres UPDATE invoice paid] ──► [Postgres INSERT unmatched (overpayment)] ──► [Email Karlovi]
                └── 'unmatched'                      ──► [Postgres INSERT unmatched]                                                  ──► [Email Karlovi]
        │
        ▼
[Error Trigger workflow] → email Karlovi pokud cokoli failne (retry už proběhl 3×)
```

## Code node 1 — `parse-transactions`

Vstup: `$json` z HTTP Request (Fio API JSON response).
Výstup: pole `{json: FioTransaction}` pro každý příchozí pohyb s VS.

```js
const raw = $input.first().json;
const transactions = raw?.accountStatement?.transactionList?.transaction ?? [];

const items = transactions
  .filter(t => Number(t.column1?.value) > 0)         // jen příchozí
  .filter(t => t.column5?.value != null)              // jen s VS
  .map(t => ({
    json: {
      fioId: String(t.column22.value),
      amount: Number(t.column1.value),
      vs: String(t.column5.value),
      date: String(t.column0?.value ?? '').slice(0, 10),  // "YYYY-MM-DD"
      counterAccount: String(t.column2?.value ?? ''),
      note: String(t.column16?.value ?? ''),
    },
  }));

return items;
```

## Code node 2 — `decide-match-action`

Vstup: `$json` z Postgres SELECT (může být null pokud faktura neexistuje) + transakce z předchozího kontextu.
Výstup: rozhodnutí, co dělat (jeden ze 3 actions).

**👉 ZDROJ PRAVDY je `kvarteta-eshop/scripts/payment-matching.mjs`. Tady je kopie pro n8n. Při změně pravidel:**
1. Edituj `scripts/payment-matching.mjs` v repu
2. Aktualizuj testy v `scripts/payment-matching.test.mjs`
3. Spusť `node scripts/payment-matching.test.mjs` lokálně — všechny musí projít
4. Zkopíruj funkci `decideMatchAction` SEM do n8n Code nodu
5. Commit + push repo

```js
// === ZAČÁTEK kopie z scripts/payment-matching.mjs ===
const TOLERANCE_KC = 1.00;

function decideMatchAction(amount, invoice) {
  if (!invoice) {
    return { action: 'unmatched', reason: 'no_invoice_match',
      humanReason: `Příchozí platba ${amount} Kč nemá v DB fakturu se stejným VS.` };
  }
  if (invoice.status === 'paid') {
    return { action: 'unmatched', reason: 'duplicate_payment',
      humanReason: `Faktura ${invoice.number} už paid, ale přišla další platba ${amount} Kč. Možná dvojí platba klienta.` };
  }
  if (invoice.status === 'cancelled' || invoice.status === 'refunded') {
    return { action: 'unmatched', reason: 'payment_to_cancelled',
      humanReason: `Faktura ${invoice.number} ve stavu ${invoice.status}, ale přišla platba ${amount} Kč. Vrať peníze.` };
  }
  const diff = amount - invoice.total;
  if (diff < -TOLERANCE_KC) {
    return { action: 'unmatched', reason: 'underpayment',
      humanReason: `Faktura ${invoice.number}: zaplaceno ${amount} Kč, chybí ${Math.abs(diff).toFixed(2)} Kč.` };
  }
  if (diff > TOLERANCE_KC) {
    return { action: 'mark_paid_with_overpayment', reason: 'overpayment',
      humanReason: `Faktura ${invoice.number}: zaplaceno ${amount} Kč, přeplatek ${diff.toFixed(2)} Kč.` };
  }
  return { action: 'mark_paid', reason: 'paid',
    humanReason: `Faktura ${invoice.number} zaplacena (${amount} Kč).` };
}
// === KONEC kopie ===

// Wire-up: $input.all()[0] je z Postgres SELECT, $input.all()[1] je transakce.
// (V n8n se to dělá přes "Merge" node nebo přes kontext.)
const invoice = $('Postgres: SELECT invoice').first().json ?? null;
const tx = $('parse-transactions').item.json;

const decision = decideMatchAction(tx.amount, invoice);

return [{ json: { ...tx, invoice, ...decision } }];
```

## SQL queries (Postgres nodes)

Všechny parametrizované (Postgres node v n8n: `Query Parameters` tab):

### `SELECT invoice`
```sql
SELECT id, status, total, customer ->> 'email' AS customer_email, number
FROM invoices
WHERE variable_symbol = $1 AND type = 'invoice'
LIMIT 1;
```
Parametr: `$1 = {{ $json.vs }}`

### `UPDATE invoice paid`
```sql
UPDATE invoices
SET status = 'paid',
    paid_at = now(),
    paid_amount = $1,
    fio_transaction_id = $2
WHERE id = $3 AND status = 'unpaid'
RETURNING id, number, customer ->> 'email' AS customer_email;
```
Parametry: `$1 = {{ $json.amount }}`, `$2 = {{ $json.fioId }}`, `$3 = {{ $json.invoice.id }}`

> **Důležité:** `WHERE status = 'unpaid'` zajistí, že workflow nepřepíše ručně nastavený paid status (idempotence + ochrana před race condition při dvojím spuštění).

### `INSERT unmatched`
```sql
INSERT INTO payment_unmatched (
  fio_transaction_id, amount, variable_symbol, counter_account,
  note, transaction_date, reason, matched_invoice_id
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (fio_transaction_id) DO NOTHING;
```
Parametry: `$1..$8` z `{{ $json.fioId }}` atd. `$8` je `{{ $json.invoice.id ?? null }}`.

## Email šablony

### Zákazníkovi (po úspěšném zaplacení)
- **To:** `{{ $json.invoice.customer_email }}`
- **Subject:** `Vaše objednávka {{ $json.invoice.number }} je zaplacena`
- **Body:** "Děkujeme, vaše platba ${{ $json.amount }} Kč byla úspěšně přijata. Fakturu najdete v emailu z {{ $json.invoice.issued_at }}."

### Karlovi (každý unmatched / problém)
- **To:** `karel.hromada30@gmail.com`
- **Subject:** `[hromadovky] Platba ke spárování: {{ $json.reason }}`
- **Body:** Tabulka s `fioId`, `amount`, `vs`, `counterAccount`, `note`, `humanReason` + link do Supabase Studio (URL pevně daná).

## Edge case matrix (testovací plán)

| # | Stav faktury | Částka vs total | Akce | reason v unmatched |
|---|---|---|---|---|
| 1 | unpaid | přesně sedí | `mark_paid` | — |
| 2 | unpaid | +0.50 Kč (v toleranci) | `mark_paid` | — |
| 3 | unpaid | +5 Kč (přeplatek) | `mark_paid_with_overpayment` | `overpayment` |
| 4 | unpaid | -5 Kč (nedoplatek) | `unmatched` | `underpayment` |
| 5a | paid, paid_amount ≈ amount, paid_at < 24h | tatáž částka | **`noop`** (same_payment_seen) — žádný email, žádný DB zápis | — |
| 5b | paid, paid_amount JINÁ NEBO paid_at > 24h | jakákoli | `unmatched` | `duplicate_payment` |
| 6 | cancelled | jakákoli | `unmatched` | `payment_to_cancelled` |
| 7 | refunded | jakákoli | `unmatched` | `payment_to_cancelled` |
| 8 | (neexistuje) | jakákoli | `unmatched` | `no_invoice_match` |
| 9 | stejný `fio_transaction_id` 2× | — | DB UNIQUE constraint blokuje druhý INSERT/UPDATE |

**Pravidlo 5a (přidáno 2026-05-15):** Polling Fio API vrací `/periods/last 7 days/`, takže každý běh vidí staré paid platby znovu. Email kanál (Gmail Trigger) může zachytit stejnou platbu paralelně s polling. Pravidlo 5a tento case detekuje a **silently skipuje** — žádný admin email, žádný řádek v `payment_unmatched`. Klíčové parametry: `TOLERANCE_KC=1.00`, `SAME_PAYMENT_WINDOW_MS=24*60*60*1000` (24h). Past tense check: `now - paid_at` musí být >= 0 a < 24h. Po 24h se opětovné zachycení považuje za real duplicate (klient si vzpomněl po dnech).

Všechny scénáře jsou pokryté v `scripts/payment-matching.test.mjs`. Spusť před každou změnou:
```bash
cd kvarteta-eshop && node scripts/payment-matching.test.mjs
```

## Mock test bez peněz

V n8n dočasně dej Code node 1 (`parse-transactions`) **Disable** a před něj vlož **Set node** s hardcoded Fio JSON:

```json
{
  "accountStatement": {
    "transactionList": {
      "transaction": [{
        "column0":{"value":"2026-05-14+0200"},
        "column1":{"value":250},
        "column5":{"value":"<VS_TESTOVACÍ_FAKTURY>"},
        "column22":{"value":99999999},
        "column2":{"value":"1234567890/2010"},
        "column16":{"value":"test"}
      }]
    }
  }
}
```

Pak změň propojení a klikni "Execute Workflow". Po testu Set node smaž a Code node enable.

## Real-money test (1 Kč)

1. Aplikuj migraci v Supabase Studio
2. Vyplň `.env.local` s Fio tokenem, spusť `node scripts/test-fio.mjs` → musí vrátit OK
3. Vytvoř credential `hromadovky_fio` v n8n, vlož token
4. Postav workflow podle této dokumentace, NECHEJ VYPNUTÝ
5. Udělej test objednávku v eshopu, zaplaceno přes "transfer"
6. Ověř v Supabase: `SELECT id, variable_symbol, total, status FROM invoices ORDER BY created_at DESC LIMIT 1` → status `unpaid`, máš VS
7. **Zapni workflow** (Active toggle)
8. Z osobního účtu pošli 1 Kč na Fio firemní s VS z bodu 6
9. Počkej ≤ 1 min
10. Ověř: status=paid, paid_at≈now, paid_amount=1.00, fio_transaction_id vyplněno
11. Klikni "Execute Workflow" znovu — nic se nezmění (idempotence ✓)

## Token storage: n8n environment variable

n8n NEUMÍ číst credential hodnoty v URL expressions (security restriction, n8n GitHub #6716).
`$credentials.headerAuth.value` v expressi tiše vrátí prázdný string — workflow pak volá `/periods//.../.../...` (dvojitý slash) a Fio API odpoví 404 "resource not found".

**Řešení: token v env var `FIO_API_TOKEN`, čtený přes `$env.FIO_API_TOKEN` v URL.**

### Docker compose setup (předpokládáno na n8n.hromadovky.cz)

Edit `docker-compose.yml` na n8n hostingu, sekce `services.n8n.environment`:

```yaml
services:
  n8n:
    environment:
      - FIO_API_TOKEN=${FIO_API_TOKEN}
      # ostatní env vars...
```

Edit `.env` ve stejné složce (gitignored):

```
FIO_API_TOKEN=<reálný_token_z_Fio_IB>
```

Restart kontejneru:

```bash
docker compose up -d n8n
```

Nebo bez Docker compose, pokud n8n běží jako systemd unit:

```ini
# /etc/systemd/system/n8n.service
[Service]
Environment="FIO_API_TOKEN=<reálný_token>"
```

Pak `sudo systemctl daemon-reload && sudo systemctl restart n8n`.

### Token rotation (každých 90 dní)

1. Vygeneruj nový token ve Fio IB (Nastavení → API → Nový token)
2. SSH na n8n host, edit `.env` (nebo systemd unit), nahraď `FIO_API_TOKEN`
3. Restart: `docker compose up -d n8n` (nebo `systemctl restart n8n`)
4. Ručně spusť workflow "Execute Workflow" v n8n — musí projít
5. **Až teď** vymaž starý token ve Fio IB

Pokud máš podezření na únik: okamžitě vymaž token ve Fio IB. Útočník mohl číst pohyby, ale **nemůže krást peníze** (read-only token nezadává platby).

## Failure handling

- HTTP Request retry: 3× s 35s gap (>30s Fio rate-limit okno)
- Error Trigger workflow: email Karlovi pokud cokoli failne i po retry
- DB UNIQUE constraint: druhý pokus o INSERT/UPDATE stejné `fio_transaction_id` selže tiše (`ON CONFLICT DO NOTHING`)
- 7-day window v `/periods/`: kdyby workflow stálo týden, doběhne po obnovení a zachytí všechny transakce
- `WHERE status = 'unpaid'` v UPDATE: chrání před přepsáním ručně nastaveného paid

## Co tato dokumentace explicitně neřeší (fáze 2+)

- Admin UI `/admin/payments` pro řešení záznamů v `payment_unmatched`
- RPC `resolve_payment(unmatched_id, invoice_id)` pro ruční přiřazení
- Vícenásobné účty (EUR, sekundární CZK)
- Monitoring „kolik plateb prošlo emailem vs polling backupem" — vhodné pro odhalení tichého výpadku Hlásiče
- CAMT.053 / ISDOC účetní export
