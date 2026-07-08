# CLAUDE.md — provozní manuál (vždy číst)

> Tento soubor je závazný kontext pro práci na tomto repu. Drž se ho. Pokud něco z toho
> přestane platit, **aktualizuj tento soubor**.

## Projekt & deploy v kostce

- **Web:** e-shop `kvarteta-eshop/` (React + Vite, SPA). Doména: **www.hromadovky.cz**
  (apex `hromadovky.cz` → 307 redirect na `www.` — při `curl` testech vždy `-L`).
- **Repo:** `karelhromada/hromadovky`, hlavní větev `main`.
- **Deploy = JEN GitHub Actions** workflow `.github/workflows/deploy-vercel.yml`.
  Každý **push na `main`** spustí `vercel pull/build/deploy --prebuilt --prod`
  (token v GH secretu `VERCEL_TOKEN`). Když workflow nepoběží, NIC se nenasadí.
- ⚠️ Vercel **git integrace v projektu EXISTUJE** (zjištěno 2026-07-08 — push spouštěl
  duplicitní build ve Vercel sandboxu, kde prerender padá na chybějícím Chromiu).
  Git buildy jsou vypnuté přes `vercel.json` → `"git": { "deploymentEnabled": false }`.
  NEZAPÍNAT — deploy musí jít jen přes GH Actions (runner má Chrome pro prerender).
- **Build:** produkce staví `npm run build:full` = `build` (tsc + vite, prebuild spustí
  `sync-backs` + `generate-sitemap`) **+ `prerender`** (Puppeteer vyrenderuje každou
  indexovatelnou routu do `dist/<route>/index.html` — crawleři tak dostanou plné HTML).
  Prerender na CI používá systémový Chrome GH runneru (fallback `channel: 'chrome'`
  v `scripts/prerender.mjs`); lokálně cached Chromium. Nouzové vypnutí: `DISABLE_PRERENDER=1`.
  Selhání prerenderu = selhání buildu = deploy se nenasadí (viditelné v Actions).

---

## ★ Přidávání ZADNÍCH STRAN (rubů) karet — krok za krokem

Zadní strany existují ve 3 herních rozměrech: **hrací karty**, **kvarteta**, **pexeso**.
Pipeline (zdroj pravdy → webp → web):

1. **Vlož PNG** do master složky (uvnitř repa, gitignorovaná, jen lokální):
   `Zadní strany_finále_ostatní smažem/`
   - `Hrací karty_rozměr   63x105/`
   - `Kvarteta_rozměr 65x95/`
   - `Pexesa_čtverce/`
   - ⚠️ Složku `Všechny raw zadní strany/` **nepoužívat** (jsou to jen pracovní zdroje).
2. **Přidej řádek** do `scripts/back_rename_map.csv`
   (`kategorie,puvodni_nazev,novy_nazev,popis`). `kategorie` je jedna z:
   `hraci_karty` | `pexeso` | `kvarteta_a_hraci_karty` (poslední = soubor jde do obou).
   `novy_nazev` = finální „hezké" jméno podle vzhledu (např. `drak_zlate_kovove_supiny`).
3. **Vygeneruj webp + manifest:** `node scripts/migrate_final_backs.mjs`
   → vyrobí `zadni_strany/{game}/webp/<id>.webp` (sharp, q90) a přepíše `zadni_strany/manifest.json`.
4. **Sync do eshopu:** `cd kvarteta-eshop && npm run sync-backs`
   → zkopíruje do `public/zadni_strany/` + `src/data/backs-manifest.json`.
5. **🔴 KRITICKÉ — commitni do gitu** a pushni na `main`:
   `git add zadni_strany/{game}/webp/*.webp zadni_strany/manifest.json` → commit → push.
   Bez tohoto deploy ruby **neuvidí** (viz Past #1).
6. (Volitelně) přidej cestu rubu do rotace na homepage:
   `kvarteta-eshop/src/components/FeaturesSectionKarty.tsx`, sekce 03 (pole `images`).

**Jak to web čte:** `src/data/backgrounds.ts` načítá manifest → URL
`/zadni_strany/{game}/webp/<id>.webp`. Konfigurátory (`FamilyCardConfigurator`, `KartyCreator`,
`PexesoCreator`, `ProductShowcase*`) berou ruby odtud.

---

## ★ Přidávání ostatních obrázků (ukázky, produktové fotky)

1. Soubor do `kvarteta-eshop/public/...` (typicky `public/cards/<edice>/`).
2. **Převeď PNG → webp** (menší, rychlejší). Vzor (sharp je v devDependencies):
   ```js
   // cd kvarteta-eshop && node -e "..."
   require('sharp')(src).webp({ quality: 82, effort: 6 }).toFile(dst)  // rozměr zachovat
   ```
   Orientačně: ~2,5 MB PNG → ~150 KB webp při zachování 956×1596 px.
3. V kódu odkazuj **absolutní cestou** z public rootu, např. `/cards/rodina/vesela_rodina.webp`.
4. Smaž původní PNG, commitni webp, **push na `main`** (spustí deploy).

---

## ★ Produktové stránky & SEO (od 2026-07)

Každý produkt má vlastní indexovatelnou URL `/kvarteta|/karty|/pexeso/<slug>`
(`ProductDetailPage.tsx`, data `src/data/catalog.ts` + `src/data/seo.ts::productPageSeo`).

**Při přidání nového produktu do `src/data/products.ts` POVINNĚ:**
1. Přidej pole `slug` (kebab-case, unikátní v rámci kategorie) a `longDescription`
   (~150 slov unikátního textu, `\n\n` odděluje odstavce). Bez slugu **spadne build**
   (guard v `scripts/routes.mjs` porovnává počet `id:` vs `slug:` per export).
2. Doplň rozměry prvního obrázku do `IMG_DIMS` v `src/data/catalog.ts`
   (změř: `node -e "require('sharp')('public/<cesta>').metadata().then(m=>console.log(m.width,m.height))"`).
3. Sitemapa + prerender + ItemList schéma + **feedy pro Heureku/Zboží.cz**
   (`/heureka.xml`, `/zbozi.xml`, generátor `scripts/generate-feeds.mjs` v prebuildu)
   se vygenerují automaticky (čtou slugy/data z products.ts). Pexeso produkty žijí
   taky v products.ts (`pexesoProducts`) — NE inline v komponentě.
   Při změně cen dopravy v checkoutu aktualizovat i DELIVERIES v generate-feeds.mjs.
4. SEO ověření po deployi: `curl -sL https://www.hromadovky.cz/<kategorie>/<slug> | grep '<title>'`
   → musí vrátit title produktu (ne prázdnou SPA slupku).

Deep-link do košíku: `/<kategorie>?pridat=<product-id>#products` otevře back-selection modal
(useEffect v `ProductShowcase*.tsx`). CTA na detailech na tom stojí — neodstraňovat.

**SPA fallback:** Vercel rewrite míří na `/spa-fallback.html` (NE na `/` — index.html je po
prerenderu snapshot homepage). Fallback generuje `postbuild` skript `write-spa-fallback.mjs`
(noindex, bez canonical) a slouží JEN pro neprerenderované routy (/checkout, /login, 404…).

---

## ★ Deploy pravidla & pasti (must-know)

- **Past #1 — ruby musí být v gitu.** `zadni_strany/` NESMÍ být v root `.gitignore`.
  Je to sice „generovaný" obsah, ale deploy běží na CI serveru, který lokální negitované soubory
  nevidí → ruby pak na produkci vrací SPA fallback `index.html` (`200 text/html`) = rozbitý obrázek.
  (Naopak `kvarteta-eshop/public/zadni_strany/` JE gitignorovaný — to je správně, je to sync cíl,
  který se generuje při buildu.)
- **Past #2 — validní workflow YAML.** `.github/workflows/deploy-vercel.yml` musí mít `jobs:`
  na nejvyšší úrovni (sloupec 0). Po každé úpravě ověř:
  ```bash
  python3 -c "import yaml;print('jobs' in yaml.safe_load(open('.github/workflows/deploy-vercel.yml')))"
  ```
  (musí vypsat `True`). Neplatný workflow = push nespustí žádný běh = nic se nenasadí.
- **Past #3 — sdílené CSS na lazy routes.** Stránky jsou lazy-loaded (`React.lazy` v
  `kvarteta-eshop/src/App.tsx`). Pokud komponenta používá sdílené CSS třídy (`.ps-*`, `.section-*`),
  musí mít jejich CSS **importované přímo** (nebo v globálním `src/App.css`), jinak se při
  **hard-refreshi** přímo na dané URL styl nenačte a layout se rozhodí.
- **Ověření po deployi:** počkej ~2-3 min, pak tvrdý refresh (Cmd+Shift+R) na živém webu, nebo
  `curl -sL -o /dev/null -w "%{http_code} %{content_type}" https://www.hromadovky.cz/<cesta>`
  → očekávej `200 image/webp` (NE `text/html`).
- Pozn.: `gh` CLI nemusí být lokálně přihlášený. Stav remote ověřuj přes
  `git ls-remote origin -h refs/heads/main`, deploy v GitHub Actions tabu.

---

## 📒 Log vyřešených problémů (memory)

Vyřešené netriviální problémy se zapisují do **Claude memory** tohoto projektu:
`~/.claude/projects/-Users-karelhromada-Documents-Antigravity-projekty-Kvarteta-vy----bere/memory/`
- Index: `MEMORY.md`
- Detail pipeline rubů + deploy: `project_zadni_strany_pipeline.md`
- Log oprav: `project_resene_problemy.md`

**Pokyn pro Claude:** po vyřešení netriviálního problému připiš stručný záznam
(Problém → Příčina → Oprava → commit/soubor) do `project_resene_problemy.md` a doplň řádek do
`MEMORY.md`. Tak se stejná věc neřeší dvakrát.
