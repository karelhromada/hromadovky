# Návod: registrace www.hromadovky.cz do vyhledávačů

Ruční kroky, které za tebe Claude udělat nemůže (vyžadují přihlášení tvým účtem).
Zabere to ~15 minut a je to poslední díl SEO skládačky: bez toho Google/Seznam
nevědí o sitemapě a ty nevidíš, jak se web indexuje.

## 1. Google Search Console (~10 min)

1. Otevři https://search.google.com/search-console a přihlas se Google účtem.
2. Klikni **Přidat službu** → zvol **Doména** a zadej `hromadovky.cz`
   (pokryje www i apex, http i https).
3. Google ti ukáže **TXT záznam** (např. `google-site-verification=...`).
   Ten vlož do DNS u registrátora domény (kde jsi kupoval hromadovky.cz):
   - typ záznamu: **TXT**, název/host: `@` (nebo prázdné), hodnota: zkopírovaný řetězec.
4. Vrať se do Search Console a klikni **Ověřit** (DNS se může propagovat až pár hodin —
   když to hned neprojde, zkus později).
5. Po ověření: v levém menu **Sitemaps** (Soubory Sitemap) → zadej `sitemap.xml` → **Odeslat**.
6. Volitelně urychlení: **Kontrola URL** (lišta nahoře) → vlož `https://www.hromadovky.cz/`
   → **Požádat o indexování**. Totéž můžeš udělat pro /kvarteta, /karty, /pexeso.

**Co sledovat po 1–2 týdnech:** záložka **Indexování → Stránky** (kolik z 29 URL je
zaindexováno), **Výkon** (na jaké dotazy se web zobrazuje, CTR).

> Kdyby DNS ověření dělalo problémy, řekni Claudovi — umí do webu vložit záložní
> ověřovací meta tag (metoda „Předpona adresy URL" → HTML značka).

## 2. Seznam.cz (~5 min)

Seznam je v ČR ~10–15 % vyhledávání a jeho robot je na JS weby citlivější —
právě proto web nově servíruje předrenderované HTML.

1. Otevři https://reporter.seznam.cz a přihlas se (jde použít i e-mail mimo Seznam).
2. Přidej web `https://www.hromadovky.cz` a ověř ho (meta tag → řekni Claudovi,
   vloží ho do webu; nebo DNS TXT stejně jako u Googlu).
3. Po ověření odešli sitemapu: `https://www.hromadovky.cz/sitemap.xml`.

## 3. Náhledy na sociálních sítích (2 min, kdykoli)

Facebook/Instagram/WhatsApp si cachují náhledy odkazů. Po tomto nasazení vynuť obnovu:

1. https://developers.facebook.com/tools/debug/ → vlož `https://www.hromadovky.cz/`
   → **Scrape Again** (Znovu načíst). Zopakuj pro /kvarteta, /karty, /pexeso,
   případně pro produktové stránky, které budeš sdílet.

## Co už je hotové automaticky (nemusíš řešit)

- `sitemap.xml` s 29 URL se generuje při každém buildu a je odkázaná z `robots.txt`.
- Každá stránka má v HTML title, popisek, canonical, Open Graph (náhledy při sdílení)
  a strukturovaná data (Product, FAQ, breadcrumby) — crawleři je vidí bez JavaScriptu.
- Nové produkty se do sitemapy i vyhledávačů propíšou samy s dalším deployem
  (viz recept v CLAUDE.md).
