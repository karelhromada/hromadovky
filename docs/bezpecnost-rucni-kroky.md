# Bezpečnost — kroky, které musí udělat Karel ručně

Tři věci, které nejdou z kódu ani přes MCP, protože vyžadují přihlášení do Supabase
konzole nebo n8n UI. Dohromady ~10 minut. Seřazeno podle důležitosti.

Stav k 2026-08-03: všechno ostatní z bezpečnostního auditu je hotové a nasazené.

---

## 1. HMAC podpis auth webhooků (~5 min)

**Proč:** webhook `supabase-auth-email` (obnova hesla) dnes ověřuje, že příjemce je
skutečný uživatel v databázi — kdo zná `user.id` + e-mail existujícího uživatele, může
tomu uživateli pořád nechat poslat e-mail z `info@hromadovky.cz`. Podpis od Supabase to
uzavře nadobro: bez platného podpisu požadavek neprojde.

**Kroky:**

1. **Supabase → Authentication → Hooks → Send Email Hook** — u nastaveného hooku je
   secret ve tvaru `v1,whsec_XXXXXXXX`. Zkopíruj ho.
2. **n8n → Settings → Variables** (nebo do `.env` n8n instance podle toho, jak běží):
   přidej proměnnou `SUPABASE_AUTH_HOOK_SECRET` s tou hodnotou. Restartuj n8n, pokud
   používáš `.env`.
3. **n8n → workflow „Hromadovky – Zapomenuté heslo" → node `Webhook`:** v Options zapni
   **Raw Body**. (Bez toho se HMAC počítá nad re-serializovaným JSONem a nikdy nesedí.)
4. Do nodu `Build Email` **na začátek** vlož:

```js
// Ověření podpisu od Supabase (Standard Webhooks). Bez platného podpisu neprojde nic.
const crypto = require('crypto');
const hookSecret = $env.SUPABASE_AUTH_HOOK_SECRET;
if (hookSecret) {
  const h = $input.item.json.headers || {};
  const id = h['webhook-id'];
  const ts = h['webhook-timestamp'];
  const sigHeader = h['webhook-signature'] || '';
  if (!id || !ts || !sigHeader) throw new Error('Chybí podpisové hlavičky.');
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) throw new Error('Podpis je starší 5 minut.');

  const raw = typeof $input.item.json.body === 'string'
    ? $input.item.json.body
    : JSON.stringify($input.item.json.body);
  const secret = Buffer.from(String(hookSecret).replace(/^v1,whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', secret).update(`${id}.${ts}.${raw}`).digest('base64');

  const ok = String(sigHeader).split(' ').some((part) => {
    const val = part.split(',')[1] || '';
    return val.length === expected.length
      && crypto.timingSafeEqual(Buffer.from(val), Buffer.from(expected));
  });
  if (!ok) throw new Error('Neplatný podpis webhooku.');
}
```

   Podmínka `if (hookSecret)` znamená, že dokud proměnnou nenastavíš, chová se workflow
   jako dnes — takže se nic nerozbije, ať uděláš kroky v jakémkoli pořadí.

5. **Ověření:** klikni na webu na „Zapomenuté heslo" — e-mail musí přijít. Pak zkus
   podvržený požadavek (musí selhat):
   ```bash
   curl -X POST https://n8n.hromadovky.cz/webhook/supabase-auth-email \
     -H 'Content-Type: application/json' \
     -d '{"user":{"id":"cd214e43-40fa-4dba-b1e7-4d843abeaffe","email":"karel.hromada@seznam.cz"},"email_data":{"email_action_type":"recovery","token_hash":"x"}}'
   ```
   Po nasazení podpisu musí skončit chybou a **žádný e-mail nesmí dorazit**.

Stejný postup lze později použít i pro webhook `new-user` (Supabase → Database →
Webhooks → přidat hlavičku `X-Hook-Secret` a v nodu `Build` ji porovnat).

---

## 2. Ochrana proti prolomeným heslům (~1 min)

**Supabase → Authentication → Policies → zapnout „Leaked password protection".**

Supabase pak při registraci i změně hesla porovnává heslo proti databázi úniků
(HaveIBeenPwned) a odmítne známá hesla. Bezpečnostní kontrola to hlásí jako varování;
tvůj účet má roli `admin`, takže jeho kompromitace znamená přístup k fakturám a dobropisům.

---

## 3. Odvolaný service klíč v n8n (~2 min)

**n8n → Credentials → „Supabase Service (sb_secret)" (`xvVp9kBukxE6t40C`).**

Tenhle credential má **neplatný klíč** — keep-alive workflow na něm 27 dní padal na
`401 Unregistered API key` a Supabase projekt mezitím nedostával žádnou aktivitu
(hrozila pauza free tieru). Keep-alive je od 2026-08-03 přepsaný tak, aby používal
proměnnou `SUPABASE_SERVICE_KEY`, takže credential už nikdo nepotřebuje.

Buď ho **smaž**, nebo do něj vlož platný service klíč (Supabase → Settings → API →
`service_role`). Nechávat ho tam s mrtvým klíčem znamená, že ho někdo v budoucnu
znovu použije a bude se divit.

**Kontrola, že keep-alive funguje** (spouští se ve 4:17, 10:17, 16:17 a 22:17):

```sql
select pinged_at, now() - pinged_at as jak_stare from keep_alive;
```
`jak_stare` musí být pod 6 hodin. Pokud roste, keep-alive zase nepíše — podívej se do
n8n na běhy workflow „Hromadovky – Supabase Keep-Alive".

*Ověřeno 2026-08-03 ve 22:17: automatický běh zapsal, keep-alive po přepsání do Code
nodu funguje. Credential už tedy nikde není potřeba.*

---

## Co se stane, když to neuděláš

| Krok | Riziko při odložení |
|---|---|
| 1. HMAC podpis | Kdo zná ID a e-mail existujícího uživatele, může mu nechat poslat e-mail z tvé domény. Obsah e-mailu podvrhnout nejde (escapuje se), příjemce také ne. |
| 2. Ochrana hesel | Admin účet může mít heslo z úniku dat. |
| 3. Service klíč | Nic akutního — jen mrtvý credential, na který se dá znovu naletět. |
