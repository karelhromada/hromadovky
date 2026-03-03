---
description: Pravidla české gramatiky pro vývojáře webu
---

# Zásady používání velkých písmen v češtině (Czech Capitalization Rules)

Při tvorbě webů, psaní textů a návrhu UI aplikací pro české publikum je absolutně nutné dodržovat pravidla české gramatiky. Anglické "Title Case" zvyklosti (psaní velkých písmen u každého slova v nadpisu) se do češtiny NEPŘENÁŠEJÍ.

## 1. Nadpisy a Tlačítka (Headings & Buttons)
V češtině se velké písmeno píše **pouze na začátku prvního slova** v nadpisu, větě nebo na tlačítku. Ostatní slova se píší malým písmenem (pokud to nejsou vlastní jména).
- ❌ **ŠPATNĚ:** `Co Říkají Malí Hráči A Rodiče` (Anglický styl)
- ❌ **ŠPATNĚ:** `Pravidla Hry`, `Přidat Do Košíku`
- ✅ **SPRÁVNĚ:** `Co říkají malí hráči a rodiče`
- ✅ **SPRÁVNĚ:** `Pravidla hry`, `Přidat do košíku`

## 2. Zákaz vynuceného velkého písma pomocí CSS (text-transform: uppercase)
Čeští uživatelé preferují čistý a standardní text. Nepoužívejte plošně vlastnost `text-transform: uppercase;` pro odznaky (badges), popisky tlačítek nebo nadpisy, pokud si to uživatel výslovně nevyžádá.
- Zobrazovat celá slova velkými písmeny (tzv. "křičení") se nedoporučuje u standardních UI prvků.
- Místo toho text v kódu pište ve standardním tvaru (např. `Novinka`, `Bestseller`, `Ohlasy`) a nechte jej zobrazit s přirozeným počátečním velkým písmenem.

## 3. Vlastní jména a Názvy (Proper Nouns)
Velká písmena uvnitř věty patří pouze vlastním jménům, názvům měst, svátkům a konkrétním produktům (např. jméno hry).
- Vždy respektujte originální zápis (např. "Vyšší bere", "Baby Dráčci").
