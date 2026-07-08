# Heureka.cz a Zboží.cz — návod na registraci obchodu

Web automaticky generuje a publikuje produktové feedy (aktualizují se samy při každém
deployi, nové produkty se propíší bez ruční práce):

- **Heureka:** `https://www.hromadovky.cz/heureka.xml`
- **Zboží.cz:** `https://www.hromadovky.cz/zbozi.xml`

Zbývá jednorázová registrace obchodu na obou portálech (~20 minut, potřebuješ IČO 76137767
a údaje z obchodních podmínek). Oba portály feed po registraci samy stahují (typicky 1× denně).

## 1. Zboží.cz (~10 min) — začni tady, máš už Seznam účet

1. Otevři https://admin.zbozi.cz a přihlas se stejným Seznam účtem jako do Webmasteru.
2. **Přidat provozovnu** → vyplň: název „Hromadovky", web `https://www.hromadovky.cz`,
   IČO, kontaktní e-mail info@hromadovky.cz.
3. V nastavení provozovny → **XML feed** → vlož `https://www.hromadovky.cz/zbozi.xml`.
4. Ulož a počkej na první stažení feedu (může trvat i pár hodin); v administraci pak
   uvidíš „Statistika zpracování feedu" — má hlásit 20 položek bez chyb.
5. Zápis je zdarma (platí se jen volitelný proklikový režim — nemusíš zapínat;
   produkty se i tak zobrazují ve fulltextu Zboží.cz).

## 2. Heureka.cz (~10 min)

1. Otevři https://sluzby.heureka.cz → **Registrace obchodu** (Přidat obchod).
2. Vyplň údaje obchodu: název „Hromadovky", URL `https://www.hromadovky.cz`, IČO,
   e-mail, fakturační údaje. Heureka vyžaduje funkční obchodní podmínky a kontakt
   na webu — obojí máš (/obchodni-podminky, patička).
3. Po schválení (bývá do pár dní) v administraci → **Nastavení → XML feed** →
   vlož `https://www.hromadovky.cz/heureka.xml`.
4. Po prvním stažení zkontroluj **Párování kategorií** — produkty jsou ve feedu
   zařazené do „Dětské zboží | Hračky | Společenské hry (| Karetní hry)"; kdyby
   Heureka něco nespárovala, přiřadíš kategorii ručně jedním kliknutím v administraci.
5. Doporučuji rovnou zapnout **Ověřeno zákazníky** (zdarma) — Heureka po nákupu pošle
   zákazníkovi dotazník a obchod sbírá recenze/certifikát. Chce to jen doplnit
   e-mailovou adresu obchodu a odsouhlasit podmínky.

## Co je ve feedech (pro info)

- 20 produktů (8 kvartet, 6 hracích karet, 6 pexes), název, dlouhý popis, odkaz na
  produktovou stránku, 3 obrázky, cena (pexesa „od 199 Kč" = varianta 16 karet),
  dodání do 5 dnů, doprava Zásilkovna 79 Kč / PPL 99 Kč (dobírka +39 Kč).
- Zdroj dat je `kvarteta-eshop/src/data/products.ts` — generátor
  `scripts/generate-feeds.mjs` běží při každém buildu. Když přidáš produkt podle
  receptu v CLAUDE.md, objeví se ve feedech automaticky s dalším deployem.

## Až to poběží

- Zboží.cz statistiky: admin.zbozi.cz → provozovna → Statistiky.
- Heureka: administrace → Statistiky návštěvnosti; recenze v sekci Ověřeno zákazníky.
- Ceny ve feedu musí sedět s webem — generují se z týchž dat, takže sedí vždy;
  jen kdyby ses rozhodl měnit ceny dopravy v checkoutu, řekni Claudovi, ať je
  aktualizuje i v `scripts/generate-feeds.mjs` (konstanta DELIVERIES).
