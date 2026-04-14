# AUDIT 02 — Chyby & kvalita kódu

**Projekt:** kvarteta-eshop
**Datum:** 2026-04-14

`tsc --noEmit` (strict mode, noUnusedLocals, noUnusedParameters): **clean, 0 chyb**.
ESLint: nespuštěn v této seanci (Bash permission) — manuální review pokryl stejné kategorie.

---

## 🚨 CRITICAL

### C-1 — `.env` s reálnými secrets v gitu (OVĚŘENO)

- `kvarteta-eshop/.env` je **tracked** (`git ls-files` potvrzeno)
- `.gitignore` ho NEzachycuje (obsahuje jen `*.local`)
- V souboru: `VITE_N8N_WEBHOOK_URL`, `VITE_N8N_API_KEY` (JWT), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Akce ihned:**
1. **Rotovat** Supabase anon key v Supabase dashboard
2. **Rotovat** n8n API key
3. `git rm --cached kvarteta-eshop/.env`
4. Přidat `.env` do `.gitignore`
5. Zvážit `git filter-repo` pro odstranění z historie (jen pokud je repo veřejný/sdílený)

**Riziko opravy:** safe.

### C-2 — `fetchOrders` bez `user_id` filtru

- `src/pages/AuthPage.tsx:105-108`
- `from('orders').select('*').order('created_at', ...)` — bez `.eq('user_id', user.id)`
- Pokud Supabase RLS na tabulce `orders` **není** aktivní → každý přihlášený uživatel vidí **všechny** objednávky (jména, adresy, položky)

**Fix:** přidat `.eq('user_id', user.id)` + ověřit RLS policy v Supabase dashboardu.
**Riziko:** safe (zužení query).

---

## HIGH

### H-1 — Hardcoded Zásilkovna API klíč + merchant ID
`src/config/payment.ts:9,14` — `ZASILKOVNA_API_KEY: 'abc123test'`, `MERCHANT_ID: 'M1HTTEST'`.
Fix: přesunout do `import.meta.env`. Pro platební klíče zvážit backend proxy. Safe.

### H-2 — `JSON.parse(localStorage)` bez try/catch
`src/App.tsx:44` — korupt/zmanipulovaný localStorage → `SyntaxError` v `useState` inicializátoru → blank screen.
Fix: `try { return JSON.parse(saved) } catch { return [] }`. Safe.

### H-3 — `handleSignOut` bez try/catch → zaseknutý spinner
`src/pages/AuthPage.tsx:59-62` — když `signOut()` rejectne, `setLoading(false)` se nezavolá.
Fix: `finally { setLoading(false) }`. Safe.

### H-4 — Profil se po editu neobnoví v kontextu
`src/pages/AuthPage.tsx:82-100` — po `.update()` není volán `refreshProfile()`. UI drží stale data.
Fix: přidat `refreshProfile()` z `useAuth()` po `setEditing(false)`. Safe.

### H-5 — Checkout spolkne chybu insertu objednávky
`src/pages/CheckoutPage.tsx:225-249` — `orders.insert` v try/catch jen s `console.error`; i při selhání běží `setIsSuccess(true)` s fake order number.
Fix: při selhání abortnout success flow, zobrazit chybu. **Riziko: MEDIUM** (mění success flow, otestovat obě auth cesty).

### H-6 — Variable symbol kolize (Unix seconds)
`src/pages/CheckoutPage.tsx:174` — `Math.floor(Date.now()/1000)` → dvě objednávky za stejnou sekundu = stejný VS = nemožná párovací rekonciliace.
Fix: milisekundy nebo server-side generování. Safe lokálně; pokud délka VS je konstrain bank formátu, koordinovat s n8n.

### H-7 — Plošné `any` v data-citlivých cestách
`AuthPage.tsx:14,17,52,96`, `CheckoutPage.tsx:99,108,134,151`, `CardCreator.tsx:153,159,167-172`, `ProductShowcase.tsx:15`, `FamilyCardConfigurator.tsx:7`.
`useState<any[]>` pro orders, `(err: any)` v catch, `(item: any)` v renderingu.
Fix: definovat `Order` / `OrderItem` interface, `unknown` + narrow v catch. Safe (additive typing).

---

## MEDIUM

### M-1 — Zásilkovna + PPL scripty bez SRI
`CheckoutPage.tsx:74-76, 89-92` — `widget.packeta.com`, `www.ppl.cz` injektovány bez `integrity` atributu na stránce s platbou. Low.

### M-2 — Timery v HeroSectionPexeso se neuklízí
`HeroSectionPexeso.tsx:53-107` — `setTimeout` uvnitř `setInterval` nemá collected IDs, při unmount volá `setCards` na unmounted komponentu.
Fix: sbírat IDs do refu a clearovat v cleanup. Safe.

### M-3 — `timerRef` jako `any`
`HeroSectionPexeso.tsx:20` — má být `useRef<ReturnType<typeof setInterval> | null>(null)`. Safe.

### M-4 — `suit.id as any` zbytečný cast
`FamilyCardConfigurator.tsx:61` — hodnota už odpovídá union `'H'|'D'|'C'|'S'`. Safe.

### M-5 — PPL event listener duplikovaně na window + document
`CheckoutPage.tsx:114-115` — stejný handler, fires 2× (bubbling).
Fix: registrovat jen na `window`. Safe.

### M-6 — `console.log` v checkout produkční cestě
`CheckoutPage.tsx:100,197,246,259` — jeden loguje celý PPL event (může obsahovat PII adresy).
Fix: odstranit. Safe.

### M-7 — Hardcoded n8n webhook URL jako fallback
`src/config/payment.ts:18` — expozice interního hostname `n8n.srv1051339.hstgr.cloud` v bundlu.
Fix: throw at startup pokud env chybí, žádný fallback. Safe.

### M-8 — Order number na success screen je random
`CheckoutPage.tsx:289` — `Math.floor(100000 + Math.random() * 900000)` místo `orderVS`.
Fix: zobrazit `orderVS`. Safe (UI only).

---

## LOW

### L-1 — `key={idx}` v order history
`AuthPage.tsx:267` — index jako React key. Fix: stable ID. Safe.

### L-2 — Lokální `backgrounds` v CardCreator duplikuje sdílený
`CardCreator.tsx:5-26` — může driftovat od `../data/backgrounds` použitého v ostatních creatorech.
Fix: importovat sdílený. Low.

### L-3 — Prázdný `setTimeout` s okomentovaným tělem
`CheckoutPage.tsx:261-263` — dead code běží při každé kartě. Fix: odstranit. Safe.

---

## Souhrn

| Severity | Počet |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 7 |
| MEDIUM | 8 |
| LOW | 3 |

**Verdict: BLOCK** dokud nejsou opravené C-1, C-2 a rotované klíče.
