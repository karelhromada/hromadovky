# Zadní strany karet – sjednocená knihovna

Tato složka je **jediný zdroj pravdy** pro zadní strany karet napříč eshopem i tiskem.

## Struktura

```
zadni_strany/
├── karty/                 # hrací karty + kvarteta (ratio ~1:1.42)
│   ├── webp/              # WebP soubory
│   └── manifest.json      # seznam všech zadních stran pro karty
└── pexeso/                # pexeso (čtvercový poměr 1:1)
    ├── webp/
    └── manifest.json
```

## Jak přidat novou zadní stranu

1. **Zdrojový soubor** umísti do jedné ze zdrojových složek (např. `kvarteta-eshop/public/cards/`, `kvarteta/backs/`, …).
2. Do `scripts/migrate_backs.mjs` přidej záznam do pole `KARTY` nebo `PEXESO`:
   - `src` – relativní cesta od rootu repa
   - `id` – ASCII bez diakritiky, formát `kategorie_nazev_varianta`
   - `name` – zobrazovaný název v UI
   - `category` – `epic | drak | rytir | kocka | dinosaurus | mytologie | minecraft | neutralni | pexeso`
   - `strategy`:
     - `pattern-crop` – zdroj je pattern (1:1), ořízne se na card ratio
     - `native` – zdroj už má správný ratio, jen převod formátu
     - `keep-1to1` – obrazový zdroj (Minecraft apod.), ponechá se 1:1
     - `square` – pexeso, čtverec
3. Spusť:
   ```bash
   npm run migrate:backs
   ```
4. Napojení:
   - **Eshop** čte `kvarteta-eshop/src/data/backgrounds.ts` – je potřeba doplnit novou položku (a spustit `pnpm dev` / `pnpm build`, které zkopíruje WebP do `public/zadni_strany/`).
   - **Tisk** čte manifest automaticky při generování tiskových archů.
   - **Duplex konfigurátor** má BACKS pole v HTML mezi značkami `// BACKS:START` / `// BACKS:END` – migrace je udržuje v synchronizaci.

## Pravidla

- Formát **vždy WebP** (tiskárna nepřijímá PNG).
- Jména souborů **bez diakritiky**, `snake_case`, formát `kategorie_nazev`.
- **Bez upscalu** – držíme nativní rozlišení zdroje.
- Staré zdroje zůstávají na disku (úklid proběhne v samostatném PR).
