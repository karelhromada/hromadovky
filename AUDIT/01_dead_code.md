# Dead Code Audit — kvarteta-eshop

**Date:** 2026-04-14
**Target:** `/Users/karelhromada/Documents/Antigravity projekty/Kvarteta_vyšší bere/kvarteta-eshop`
**Stack:** React 19 + TypeScript + Vite + Supabase
**node_modules:** present

> **Note on tooling:** `npx knip`, `npx depcheck`, and `npx ts-prune` require Bash execution, which was unavailable in this session. This audit is based on manual static analysis: full `src/` file scan, cross-reference grep, and content inspection of all root-level scripts.
> To run automated tool confirmation: `cd kvarteta-eshop && npx knip && npx depcheck && npx ts-prune`

---

## Tier A: Jistě mrtvé (zero references, safe to delete)

### A1 — `src/assets/react.svg`
- **Path:** `kvarteta-eshop/src/assets/react.svg`
- **Evidence:** grep across all `src/` files finds zero imports or references. Vite scaffold leftover.
- **Action:** Delete.
- **RISK:** None.

### A2 — `src/utils/qrUtils.ts` (entire file)
- **Path:** `kvarteta-eshop/src/utils/qrUtils.ts`
- **Evidence:** Exports `getQRPaymentImageUrl`, `generateSPAYDString`, `QRPaymentOptions`. Zero import sites found across all `src/` files. No dynamic require pattern referencing it.
- **Action:** Delete file.
- **RISK:** None — file has never been wired into any component or page.

### A3 — `src/components/KartyCreator.tsx` + `src/components/KartyCreator.css`
- **Path:** `kvarteta-eshop/src/components/KartyCreator.tsx` and `KartyCreator.css`
- **Evidence:** `KartyCreator` is exported as default but is never imported anywhere in the project. The `HraciKartyPage` uses `FamilyCardConfigurator` instead. `KartyCreator.css` is only referenced from within `KartyCreator.tsx` itself.
- **Action:** Delete both files.
- **RISK:** Low — superseded by `FamilyCardConfigurator`. Confirm no lazy import exists (none found).

### A4 — All 34 root-level image-processing scripts (`.cjs` / `.js`)
These are one-shot card-image generation and manipulation scripts. **None** are referenced in `package.json scripts`, **none** are imported by any other file in the project, and **all** hardcode absolute paths to `/Users/air2024/.gemini/antigravity/brain/...` or local source directories (confirming they were run ad-hoc). They are not part of the Vite build or application runtime.

| File | Purpose (from content) | Key evidence |
|---|---|---|
| `add_stats_bar.cjs` | Draws stat bars on card images using `canvas` | Hardcoded paths, no package.json entry |
| `add_symbols.cjs` | Adds suit symbols via `sharp` | Hardcoded source paths |
| `copy_bases.cjs` | Copies witch card bases from AI brain dir | src: `/Users/air2024/...` |
| `copy_images.cjs` | Copies/renames image files | Hardcoded paths |
| `copy_only.cjs` | Copies files between dirs | Hardcoded paths |
| `create_witch_cards.cjs` | Generates witch card variants | Ad-hoc |
| `crop_one.cjs` | Crops a single image | Ad-hoc |
| `fix_dragon_seven.cjs` | Fixes specific dragon seven card | One-shot fix |
| `fix_last_two.cjs` | Fixes last two cards | One-shot fix |
| `generate_rytiri_v3.cjs` | Generates knight v3 cards; uses `/tmp/sharp-fix/` path | One-shot, temp path |
| `make_ruby_back.cjs` | Creates ruby card back | Ad-hoc |
| `move_new_symbols.cjs` | Moves symbol overlays | Ad-hoc |
| `optimize_all_for_web.js` | Batch WebP optimization via `sharp` | Utility; not in scripts |
| `process_crop_exact.cjs` | Exact-crop processing | Ad-hoc |
| `process_crop_final.cjs` | Final crop pass | Ad-hoc |
| `process_crop_only.cjs` | Crop-only pass | Ad-hoc |
| `process_crop_smart.cjs` | Smart-crop pass | Ad-hoc |
| `process_eights_bohemian.cjs` | Processes bohemian 8s | Ad-hoc |
| `process_knight_backs.cjs` | Knight card backs | Ad-hoc |
| `process_new_aces.cjs` | New ace cards | Ad-hoc |
| `process_new_bases.cjs` | New base images | Ad-hoc |
| `process_new_tens.cjs` | New ten cards | Ad-hoc |
| `process_nines_bohemian.cjs` | Bohemian 9s | Ad-hoc |
| `process_princezny_ciselne_7.cjs` | Princess number 7 | src: `/Users/air2024/...` |
| `process_princezny_ciselne_8.cjs` | Princess number 8 | src: `/Users/air2024/...` |
| `process_princezny_ciselne_9.cjs` | Princess number 9 | src: `/Users/air2024/...` |
| `process_princezny_ciselne_10.cjs` | Princess number 10 | src: `/Users/air2024/...` |
| `process_princezny_esy.cjs` | Princess aces | Ad-hoc |
| `process_princezny_kralove.cjs` | Princess kings | Ad-hoc |
| `process_princezny_spodky_temp.cjs` | Princess jacks (temp) | src: `/Users/air2024/...` |
| `process_princezny_svrsky.cjs` | Princess queens | Ad-hoc |
| `process_sedmicky.cjs` | Sevens processing | Ad-hoc |
| `process_sevens_bohemian.cjs` | Bohemian 7s | Ad-hoc |
| `process_tens_bohemian.cjs` | Bohemian 10s | Ad-hoc |
| `process_witch_cards.cjs` | Witch card processing | Ad-hoc |

- **Action:** Move to `_archive/` or delete. If any card generation needs to be reproduced, the output assets are already in `public/`.
- **RISK:** None for application runtime. Confirm output assets exist before deleting.

### A5 — `scripts/sync-sets.js`
- **Path:** `kvarteta-eshop/scripts/sync-sets.js`
- **Evidence:** Not referenced in `package.json scripts`. No import found in any `.ts`/`.tsx` file. The script syncs card image sets between directories — a one-time or CI utility.
- **Action:** Move to `_archive/` or document as a manual utility in package.json scripts.
- **RISK:** Low if assets are already synced. Medium if cards need re-sync after new art.

### A6 — `used_assets.txt`
- **Path:** `kvarteta-eshop/used_assets.txt`
- **Evidence:** Plain text file listing card asset paths. Not imported or referenced anywhere in source code or package.json. Appears to be a debugging artifact from a prior asset-sync run.
- **Action:** Delete.
- **RISK:** None.

---

## Tier B: Pravděpodobně mrtvé (needs user confirmation)

### B1 — `src/utils/qrUtils.ts` — `generateSPAYDString` export
Already covered in A2 (full file dead), but worth noting: even `getQRPaymentImageUrl` is unused — the CheckoutPage uses a direct bank-transfer UI with no QR code rendering wired up. The entire QR payment flow exists only in this unused utility.

### B2 — `src/config/payment.ts` — `PAYMENT_CONFIG.MERCHANT_ID` and `PAYMENT_CONFIG.GATEWAY_URL`
- **Evidence:** `PAYMENT_CONFIG` is imported in `CheckoutPage.tsx`. However, `GATEWAY_URL` and `MERCHANT_ID` are only referenced in a `console.log` (line 259: `console.log('Redirecting to GP Webpay...', PAYMENT_CONFIG.GATEWAY_URL)`), not in any real redirect or API call. The GP Webpay integration is not implemented — it's a placeholder.
- **Also flagged:** `ZASILKOVNA_API_KEY: 'abc123test'` — hardcoded test key, not a real secret but a placeholder.
- **Action:** Confirm whether GP Webpay integration is planned. If not, remove the dead fields. Replace `abc123test` with an env variable before production.
- **RISK:** Medium — `payment.ts` IS imported and used (the N8N webhook and Zásilkovna widget are live), so partial cleanup only.

### B3 — Root-level orphan scripts at project root (not inside `kvarteta-eshop/`)

| File | Evidence |
|---|---|
| `copy_cards.js` | No reference found in any JSON, JS, TS, or MD file in the project root. Standalone copy utility. |
| `app_server.py` | Referenced only in `.claude/settings.local.json` of two sibling projects (`kvarteta-generator-pro-standalone`, `generator_karet`) as a Claude tool allow-list entry. Not part of the eshop build. |
| `all_cards.html` | Generated output file from `kvarteta/draci/generate_cards.js` and archive scripts. Not linked from eshop. |
| `all_baby_dragons.html` | Generated output file from `kvarteta/baby_dracci/generate_baby_dragons.js`. Not linked from eshop. |

- **Action:** These belong to the card-generator tooling layer, not the eshop. They should remain in that layer or move to `generator_karet/`. Confirm whether they are still actively used.
- **RISK:** Low for eshop. Medium if they are still part of the print workflow.

---

## Tier C: Nejasné (keep for now)

### C1 — `src/data/backgrounds.ts` — `getBackgroundByUrl` and `getBackgroundById`
- **Evidence:** The `backgrounds` array itself is used by six components. The two helper functions (`getBackgroundByUrl`, `getBackgroundById`) are exported but no import of them was found in `src/`. However, they may be used via dynamic evaluation or planned for future use.
- **Action:** Keep for now. Run `npx ts-prune` or `npx knip` to confirm definitively.
- **RISK:** Low — harmless exports; tree-shaking removes them from the bundle.

### C2 — `src/context/AuthContext.tsx` — `refreshProfile` export
- **Evidence:** `useAuth()` is consumed in three places (`AuthPage`, `CheckoutPage`, `Navbar`). Those callers destructure `user`, `profile`, `signOut`, `loading` — but `refreshProfile` is never destructured or called.
- **Action:** Keep until auth flows are finalized. Low bundle impact.
- **RISK:** Low.

### C3 — `optimize_all_for_web.js` (re-noted from Tier A)
This one uses `sharp` (a native dep in package.json) and is a legitimate utility for batch-optimizing card images. It is NOT in `package.json scripts` but is more "operational" than the one-shot `.cjs` files. Consider adding it as `"optimize": "node optimize_all_for_web.js"`.

---

## Tier D: Unused npm Dependencies

> Automated `depcheck` could not be run. Analysis is based on grep of `src/` imports.

| Package | Listed in | Used in src/? | Evidence |
|---|---|---|---|
| `canvas` | `dependencies` | No | Only used in `add_stats_bar.cjs` (root-level dead script, not in src/) |
| `sharp` | `dependencies` | No | Only used in root-level `.cjs` scripts, not imported anywhere in `src/` |
| `@supabase/supabase-js` | `dependencies` | Yes | `src/lib/supabase.ts` |
| `framer-motion` | `dependencies` | Yes | `HomePage.tsx` |
| `lucide-react` | `dependencies` | Yes | Multiple components |
| `react-router-dom` | `dependencies` | Yes | `App.tsx` and pages |
| `react`, `react-dom` | `dependencies` | Yes | Core framework |

**Flagged:**
- **`canvas`** — Installed as a production dependency (`dependencies`, not `devDependencies`) but is never imported by any TypeScript/React source. It is only used by the dead `add_stats_bar.cjs` script. This is a native module that adds significant install overhead (native binary compilation). Move to a `tools/` package.json or remove.
- **`sharp`** — Same situation as `canvas`. Production dependency used only by dead root-level scripts. Move out or remove.

Both `canvas` and `sharp` being in `dependencies` (not `devDependencies`) means they ship to any deployment that installs production deps, which is incorrect for image-processing CLI tools.

---

## Tier E: Unused Exports in src/

> Automated `ts-prune`/`knip` could not be run. Manual analysis below.

| Export | File | Referenced? | Notes |
|---|---|---|---|
| `generateSPAYDString` | `src/utils/qrUtils.ts` | No | See A2 |
| `getQRPaymentImageUrl` | `src/utils/qrUtils.ts` | No | See A2 |
| `QRPaymentOptions` (interface) | `src/utils/qrUtils.ts` | No | See A2 |
| `getBackgroundByUrl` | `src/data/backgrounds.ts` | No import found | See C1 |
| `getBackgroundById` | `src/data/backgrounds.ts` | No import found | See C1 |
| `refreshProfile` (via `useAuth`) | `src/context/AuthContext.tsx` | Not destructured | See C2 |

---

## Summary

| Tier | Count | Estimated effort |
|---|---|---|
| A — Safe to delete | 38 items (2 src files + 35 scripts + 1 txt) | 1 hour |
| B — Confirm then delete | 4 items | 30 min |
| C — Keep / revisit | 3 items | — |
| D — Wrong dependency type | 2 packages (`canvas`, `sharp`) | 15 min |
| E — Unused exports | 6 exports (all in already-flagged files) | Covered by A2/C1 |

**Highest impact action:** Remove `canvas` and `sharp` from `dependencies` (they are native modules adding unnecessary production install weight) and move all 34+ root-level `.cjs` scripts out of the eshop repo root.
