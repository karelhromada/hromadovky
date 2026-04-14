# AUDIT 00 — Mapa projektu

**Repo:** `/Users/karelhromada/Documents/Antigravity projekty/Kvarteta_vyšší bere`
**Datum:** 2026-04-14
**Větev:** `revize/audit`

---

## 1. Živé subprojekty

### kvarteta-eshop/ (1.1 GB) — HLAVNÍ React aplikace
- React 19 + TypeScript + Vite + Supabase + React Router 7 + Framer Motion
- Entry: `kvarteta-eshop/index.html` → `src/main.tsx`
- Scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`
- **Deploy:** root `vercel.json` staví `kvarteta-eshop/dist` a publikuje na doménu
- Obsahuje `.env` (POZOR — secrets; ověřit, že není commitnutý)

### tisk-karet-deploy/ (3.6 GB) — samostatný static Vercel projekt
- **Nested git repo** (`tisk-karet-deploy/.git`) s vlastním remote — `karelhromada/tisk-karet`
- `vercel.json`: `{version: 2, name: "tisk-karet", cleanUrls: true, framework: null}`
- Statické stránky, `editor/` (Duplex Konfigurátor PRO), předgenerované HTML archy
- Částečný duplikát `kvarteta/`, `hraci_karty/`, `pexeso/` z rootu

## 2. Artefakty / build output

- `kvarteta-eshop/dist/` — Vite build output (má být v `.gitignore`, je)
- `kvarteta-eshop/dist/cards/temp_pdf_extract/venv/` — Python venv v dist, pravděpodobně omyl
- `tisk-karet-deploy/` — pre-rendered static site (3.6 GB, obsahuje mirror assets)

## 3. Asset stores

### Zdrojové
- `kvarteta/` — prvotní zdroj karet (baby_dracci, draci, kocky, dinosauri, mytologie, rytiri, backs)
- `hraci_karty/epicka_draci_edice/` — Excel + download pipeline
- `pexeso/draci/` — pexeso varianty

### Zpracované / distribuované
- `kvarteta-eshop/public/cards/` — web-optimized PNGs
- `tisk-karet-deploy/kvarteta|hraci_karty|pexeso/` — zrcadlo s HTML print sheets

### Legacy / záloha
- `Záloha karet/` (801 MB) — PDFs a podklady, duplicitní s `kvarteta/`
- `_archive/card_generator_flat/`, `_archive/eshop_cards_legacy/`, `_archive/zaloha_kod/`

## 4. Entry points (HTML)

| Soubor | Účel |
|--------|------|
| `kvarteta-eshop/index.html` | React SPA — "Hromadovky" |
| `tisk-karet-deploy/index.html` | Statická homepage s nástroji |
| `tisk-karet-deploy/editor/index.html` | Editor karet |
| `all_cards.html`, `all_baby_dragons.html` (root) | Statické HTML náhledy — nejsou v žádném vercel.json |
| `kvarteta/*/all_*.html` | Prints/previews pro jednotlivé edice |

## 5. Root-level skripty

### kvarteta-eshop/ (13 .cjs/.js skriptů)
Jednorázové pipeline utility (viz Fáze 2 pro dead-code klasifikaci):
- `create_witch_cards.cjs`, `add_symbols.cjs`, `generate_rytiri_v3.cjs` — generátory
- `optimize_all_for_web.js` — image optimalizace (pravděpodobně aktivní)
- `fix_dragon_seven.cjs`, `fix_last_two.cjs` — one-off fixy
- `process_princezny_ciselne_{7,8,9,10}.cjs` — per-card patche
- `process_new_bases.cjs`, `copy_bases.cjs`, `move_new_symbols.cjs` — asset management
- `scripts/sync-sets.js` — Supabase sync helper

### Root repa
- `copy_cards.js` — kopíruje PNG s odstraněním diakritiky
- `app_server.py` — lokální Python HTTP server (port 8001) pro ukládání projektů editoru

## 6. Deploy konfigurace

**Root `vercel.json`** — deploy React eshopu:
```json
{
  "buildCommand": "cd kvarteta-eshop && npm install && npm run build",
  "outputDirectory": "kvarteta-eshop/dist",
  "framework": "vite",
  "rewrites": [{"source": "/(.*)", "destination": "/"}]
}
```

**`tisk-karet-deploy/vercel.json`** — separátní static site (vlastní git remote, nikoli nested submodule).

## 7. Podezřelé / kandidáti na úklid (pro Fázi 2)

1. `_archive/` (763 MB) — staré prototypy
2. `Záloha karet/` (801 MB) — duplicitní PDF zálohy
3. `tisk-karet-deploy/` (3.6 GB) — pokud je to separátní repo, **nemá být uvnitř** hlavního repa
4. `kvarteta-eshop/dist/cards/temp_pdf_extract/venv/` — Python venv v dist
5. Duplicity mezi `kvarteta/` a `tisk-karet-deploy/kvarteta/`
6. `kvarteta-generator-pro-standalone/`, `generator_karet/` — nejasný status
7. One-off `fix_*.cjs`, `process_princezny_*.cjs` — pravděpodobně již nepotřebné

## 8. Git metrika

- `.git` v rootu: **2.3 GB**
- Tracked soubory: 3050
- Největší adresáře v gitu: `kvarteta-eshop` (957 souborů), `Záloha karet` (360), `kvarteta` (239), `_archive` (238)
- `tisk-karet-deploy` v hlavním gitu: **1 soubor** (samotná složka) — zbytek patří nested gitu
