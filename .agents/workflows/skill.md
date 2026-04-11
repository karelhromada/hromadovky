---
name: Přidání hotové sady karet na web a do tiskového konfigurátoru
description: Kompletní postup přidání nové sady hracích karet (Prší), kvartet nebo pexes do e-shopu Hromadovky na webu (React/Vite) a do globálního Duplex Konfigurátor PRO pro tisk. Použij tento skill vždy, kdy chceš přidat hotové karty do systému.
---

# Přidání hotové sady karet na web a do tisku

## Přehled systému

Projekt se nachází v:
```
/Users/karelhromada/Documents/Antigravity projekty/Kvarteta_vyšší bere/
```

Klíčové složky:
| Složka | Účel |
|--------|------|
| `hraci_karty/` | Finální obrázky hracích karet (Prší) |
| `kvarteta/` | Finální obrázky kvartet |
| `pexeso/` | Finální obrázky pexes |
| `kvarteta-eshop/public/cards/` | Veřejné assets pro web (sem se kopíruje) |
| `kvarteta-eshop/src/data/products.ts` | Konfigurace produktů pro web |
| `tiskove_archy/duplex_konfigurator_pro.html` | Globální tiskový konfigurátor |

---

## KROK 1: Příprava – složka s hotovými kartami

Uživatel vytvoří složku v jednom z těchto umístění:
- `hraci_karty/<název sady>/Finální karty generátor/` – pro Prší sady z nového generátoru
- `hraci_karty/<název sady>/Karty finále/` – pro Prší sady (starší formát)
- `kvarteta/<název sady>/finalni_karty/` – pro Kvarteta
- `pexeso/<název sady>/` – pro Pexesa

Do této složky vloží všechny hotové karty jako PNG nebo JPG soubory.

> **STANDARD POJMENOVÁNÍ KARET (od dubna 2026)**
> Nový generátor produkuje karty ve formátu `{Barva}_{Hodnota}.png` s diakritikou:
> - Barvy: `Červené` (=Srdce ♥), `Zelené` (=Listy ♠), `Kule` (=Kule ♦), `Žaludy` (=Žaludy ♣)
> - Hodnoty: `7`, `8`, `9`, `10`, `Spodek`, `Svršek`, `Král`, `Eso`
> - Příklad: `Červené_Eso.png`, `Žaludy_Král.png`, `Kule_10.png`
> 
> Pro web se diakritika VŽDY odstraňuje: `Cervene_Eso.png`, `Zaludy_Kral.png`

> **DŮLEŽITÉ**: Názvy souborů nesmí obsahovat diakritiku (písmena s háčky/čárkami), protože jsou použity v URL adresách. Pokud diakritiku obsahují, je nutné je přejmenovat.
> Příklad: `karta_Srdce_Král.png` → `karta_Srdce_Kral.png`

Přejmenování přes terminál (pozor na macovské NFD vs linuxové NFC překódování na Vercelu):
```bash
cd "<cesta ke složce>"
# Odstraní veškerou diakritiku a převede mezery na podtržítka (KRITICKÉ PRO VERCEL)
node -e "const fs=require('fs'); const path=require('path'); fs.readdirSync('.').forEach(f => { if(fs.statSync(f).isFile()){ let n = f.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'); if(n!==f){ fs.renameSync(f, n); console.log(f + ' -> ' + n); } } })"
```

> **🔥 KRITICKÉ VAROVÁNÍ PRO VERCEL (MAC VS LINUX) 🔥**
> Pokud nasazujete z macOS (který ukládá Unicode v NFD formátu - "e" + "ˇ") na Vercel (Linux - NFC formát "ě"), **cesty k obrázkům a složkám s diakritikou způsobí 404 Not Found**. 
> VŽDY musí platit: **Složka i všechny soubory nesmí mít ani stopu po diakritice nebo mezerách** (např. `obrazky_draku/Ignis_rexx.png`). Pokud jste při odstraňování diakritiky přejmenovali složku, nezapomeňte přidat novou složku do gitu (`git add <novy_nazev>`) a smazat starou (`git rm <stary_nazev>`), jinak nová zůstane jen lokálně a Vercel nahlásí 404!


---

## KROK 2: Kopírování do public assets eshopu

```bash
mkdir -p "kvarteta-eshop/public/cards/<nazev-sady>"
cp "hraci_karty/<Název sady>/Karty finále/"*.png \
   "kvarteta-eshop/public/cards/<nazev-sady>/"
```

Konvence pojmenování složky v `public/cards/`:
- Hrací karty: `minecraft-prsi`, `epicka-draci-edice`, `carodejnice`, `zivot-na-zamku`
- Kvarteta: `mytologie`, `dinosauri`, `baby-dracci`
- Vše malými písmeny bez diakritiky, mezery jako pomlčky.

---

## KROK 3: Přidání produktu do webu (`products.ts`)

Soubor: `kvarteta-eshop/src/data/products.ts`

Existují dvě pole:
- **`kartyProducts`** – pro Hrací karty (Prší) → přidávej sem
- **`kvartetaProducts`** – pro Kvarteta → přidávej sem

### Šablona pro hrací karty (Prší):

```typescript
{
    id: 'karty-tema-<id>',          // jedinečné ID, bez mezer, bez diakritiky
    name: 'Hrací karty: <Název>',   // zobrazovaný název (česky, malá písmena mimo první)
    description: '<Popis sady...>', // krátký text pod názvem
    price: 349,                     // cena v Kč
    themeColor: '#4CAF50',          // barva tématická (hex), použita pro ohraničení a akcenty
    images: [                       // 3 náhledy pro hover efekt na produktové kartě
        '/cards/<nazev-sady>/Cervene_Eso.png',
        '/cards/<nazev-sady>/Zelene_Kral.png',
        '/cards/<nazev-sady>/Kule_Svrsek.png'
    ],
    boxImage: '/cards/<nazev-sady>/Cervene_Eso.png', // karta zobrazená "v čele" balíčku
    isThematic: true,
    sampleValue: 'K',               // hodnota zobrazená u ukázkové karty
    sampleSuit: '♥',                // symbol barvy (♥ ❤ ♦ ♣ ♠)
    allCards: [                     // VŠECHNY karty v sadě (32 karet), organizované po barvách
        // Červené/Srdce (8 karet: Eso, Král, Svršek, Spodek, 10, 9, 8, 7)
        '/cards/<nazev>/Cervene_Eso.png', '/cards/<nazev>/Cervene_Kral.png', '/cards/<nazev>/Cervene_Svrsek.png', ...
        // Zelené/Listy
        '/cards/<nazev>/Zelene_Eso.png', ...
        // Žaludy
        '/cards/<nazev>/Zaludy_Eso.png', ...
        // Kule
        '/cards/<nazev>/Kule_Eso.png', ...
    ]
}
```

### Šablona pro kvarteta:

```typescript
{
    id: 'kvarteto-<id>',
    name: 'Kvarteto: <Název>',
    description: '<Popis...>',
    price: 349,
    themeColor: '#fde047',
    badges: [
        { id: 1, text: 'Horká novinka', icon: Sparkles, color: '#fde047' }
    ],
    image: [                        // náhledové obrázky pro carousel (libovolný počet)
        '/cards/<nazev>/karta_1.png',
        '/cards/<nazev>/karta_2.png',
        ...
    ]
}
```

> **POZOR**: Pole `kartyProducts` a `kvartetaProducts` jsou uzavřena `];`. Nový produkt přidej vždy PŘED toto uzavření – dovnitř pole, oddělený čárkou.

---

## KROK 4: Přidání do Duplex Konfigurátor PRO (pro tisk)

Soubor: `tiskove_archy/duplex_konfigurator_pro.html`

### Kde přidat:
V sekci `PRODUCTS` (cca řádek 290):

```javascript
const PRODUCTS = {
    // ... ostatní sady ...
    
    "hraci_<id>": {                                        // klíč musí začínat 'hraci_' pro hrací karty
        name: "Hrací karty: <Název>",
        htmlFile: "../hraci_karty/<Název sady>/tiskovy_arch_<id>.html",
        basePath: "../hraci_karty/<Název sady>/",
        w: 63, h: 105,                                     // rozměry karty v mm (Prší = 63×105)
        cols: 3, rows: 2,                                  // mřížka na A4 (3×2 = 6 karet/strana)
        marginL: 9, marginT: 14,                           // okraje v mm od levého/horního okraje
        gapX: 66, gapY: 108,                               // rozestup středů karet v mm
        zoom: 100
    },
};
```

### Rozměry pro různé typy sad:
| Typ | w | h | cols | rows | marginL | marginT | gapX | gapY |
|-----|---|---|------|------|---------|---------|------|------|
| Hrací karty (Prší) 63×105mm | 63 | 105 | 3 | 2 | 9 | 14 | 66 | 108 |
| Kvarteto standardní 60×85mm | 60 | 85 | 3 | 3 | 10 | 15 | 63 | 88 |
| Pexeso (čtvercové) 70×70mm | 70 | 70 | 4 | 4 | 10 | 14 | 73 | 73 |

> **Poznámka**: Konfigurátor načítá karty ze zdrojového HTML archu (`htmlFile`). Pokud ještě neexistuje tiskový arch pro novou sadu, musí se nejprve vytvořit. Prozatím lze tento krok přeskočit, pokud tisk není okamžitě potřeba.

---

## KROK 5: Ověření na webu

```bash
# Spuštění dev serveru (pokud ještě neběží)
cd kvarteta-eshop
npm run dev
# Otevřít http://localhost:5173/karty nebo /kvarteta
```

Zkontrolovat:
- [ ] Nová sada se zobrazuje v sekci
- [ ] Obrázky se načítají (žádné broken images)
- [ ] Hover efekt na kartách funguje
- [ ] Náhled "Prohlédnout karty" zobrazuje všechny karty celé (bez ořezu)

---

## Nejčastější problémy a opravy

### Diakritika a mezery v názvech souborů/složek (Vercel 404 TypeError)
**Problém:** Obrázky karet se zobrazují na lokálním prostředí, ale na produkčním URL (Vercel konfigurátoru nebo webu) vracejí chybu `404 Not Found` a chybí vizuál.
**Příčina:** Téměř vždy jde o **rozdílný Unicode encoding mezi macOS (NFD) a Vercelem/Linuxem (NFC)** u jmen s diakritikou (nebo kvůli `encodeURI` z mezer např. `%20`). Pokud se přes git nasadí složka jako `Obrázky draků`, tak ji Vercel nemusí najít, pokud v kódu zavoláte `Obrázky draků`. Druhou možností je, že složky sice byly přejmenovány, ale `git add` se neprovedl nad novou bez-diakritickou variantou, takže zůstaly pouze lokálně untracked.
**Řešení:** Přejmenovat CELOU cestu i názvy souborů tak, aby neobsahovaly mezery a diakritiku (`obrazky_draku/Ignis_rexx.png`). Promítnout tuto změnu v HTML a následně ujistit trackování v gitu (`git add slozka_bez_diakritiky && git commit`).

### Karty jsou oříznuté v náhledu
**Problém:** CSS používá `background-size: cover` s nesprávným `aspect-ratio`.
**Řešení:** Dimenze v `products.ts` jsou jen pro produktový display. Poměr stran karet ovládá CSS v:
- `kvarteta-eshop/src/components/ProductShowcaseKarty.css`
- Selector `.karty-modal-card-item` – pro modální náhled
- Selector `.karty-deck-box` – pro náhled na produktové kartě

Pro hrací karty 63×105: `aspect-ratio: 63 / 105`
Pro kvarteto 60×85: `aspect-ratio: 60 / 85`

### Syntax error v products.ts
**Problém:** Po přidání produktu naskočí error `Expected "]" but found "}"`.
**Řešení:** Zkontrolovat, zda nový produkt je ukončen `}` a oddělen čárkou od dalšího záznamu. Pole musí být uzavřeno `];` (ne `}}];`).

### Produkt se nezobrazuje na webu
**Příčina:** Vite má zacachovanou starou verzi souboru.
**Řešení:** V terminálu s dev serverem stiskni `r` + Enter pro restart.

---

## Kontrolní seznam (checklist)

```
[ ] 1. Hotové karty jsou ve složce hraci_karty/ nebo kvarteta/
[ ] 2. Názvy VŠECH souborů a celé i cesty nesmí obsahovat diakritiku ani mezery (Mac NFD vs Linux NFC problém)
[ ] 3. Přejmenované cesty a podsložky byly úspěšně přidány do Gitu (`git status` a `git add`)
[ ] 4. Soubory zkopírovány do kvarteta-eshop/public/cards/<nazev>/
[ ] 4. Záznam přidán do products.ts (do správného pole)
[ ] 5. Cesty v products.ts odpovídají přejmenovaným souborům
[ ] 6. Web ověřen přes npm run dev – karty viditelné a celé
[ ] 7. (Volitelně) Záznam přidán do duplex_konfigurator_pro.html
```
