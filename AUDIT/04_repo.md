# AUDIT 04 — Repo hygiena & Security

**Datum:** 2026-04-14
**Větev:** `revize/audit`

---

## 🚨 CRITICAL — okamžitá akce

### 1. GitHub PAT token exponovaný v `tisk-karet-deploy/.git/config`

Remote URL obsahuje GitHub Personal Access Token:
```
https://github_pat_REDACTED@github.com/karelhromada/tisk-karet.git
```

**Lokace na disku:**
- `tisk-karet-deploy/.git/config`
- `tisk-karet-deploy/.git/logs/HEAD`

**Pozitivní zjištění:** token **není** v hlavním git repu (grep nad všemi blobs vrátil 0 výskytů v hlavní historii). Je jen v nested `.git` na lokálním disku.

**Akce — ihned:**
1. **Revokovat token** na https://github.com/settings/tokens (najít `tisk-karet` PAT a smazat)
2. Vytvořit nový token s expirací
3. Přepsat remote bez tokenu: `cd tisk-karet-deploy && git remote set-url origin https://github.com/karelhromada/tisk-karet.git` a používat `gh auth` nebo SSH klíč
4. Ověřit, že nikdy neuniknul: zkontrolovat https://github.com/karelhromada/tisk-karet commits a GitHub Secret Scanning alerty

**Risk:** HIGH pokud jsi repo `tisk-karet` někdy veřejně pushoval; LOW pokud je privátní, ale stále revokovat.

---

## 2. Nested git repo uvnitř repa

`tisk-karet-deploy/` je samostatný git repo (`.git/` + vlastní remote `karelhromada/tisk-karet`) **uvnitř** hlavního repa. Hlavní git ho trackuje jako 1 soubor (ani ne submodule).

**Následky:**
- 3.6 GB na disku, ale v hlavním repu to není
- Zmatky při `git status`, `git diff`
- Při klonování hlavního repa se `tisk-karet-deploy/` nezmigruje

**Návrhy (k diskusi):**
- **A (doporučené):** vymazat `tisk-karet-deploy/` z hlavního repa (ponechat samostatný deploy ve vlastním worktree mimo tento repo)
- **B:** převést na proper git submodule
- **C:** přidat `tisk-karet-deploy/` do `.gitignore` a fyzicky přesunout jinam

**Risk mazání:** MEDIUM — ověřit, že nic v hlavním repu neodkazuje na `tisk-karet-deploy/*` cesty.

---

## 3. 🚨 CRITICAL: `.env` je **v gitu** s reálnými secrets

**POTVRZENO** (`git ls-files kvarteta-eshop/.env` vrátil soubor):
- Tracked: `kvarteta-eshop/.env`
- Obsahuje: `VITE_N8N_WEBHOOK_URL`, `VITE_N8N_API_KEY` (JWT), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `.gitignore` obsahuje `*.local` ale **ne** `.env`

**Akce ihned:**
1. **Rotovat** Supabase anon key (Supabase Dashboard → Project Settings → API → Reset anon key)
2. **Rotovat** n8n API key
3. `git rm --cached kvarteta-eshop/.env`
4. Přidat `.env`, `.env.*` do `.gitignore` (ponechat `.env.example`)
5. Commit + push
6. Pokud repo někdy byl veřejný → `git filter-repo --path kvarteta-eshop/.env --invert-paths`

---

## Velké adresáře — návrhy na úklid

| Adresář | Velikost | V gitu | Návrh |
|---------|---------:|:------:|-------|
| `tisk-karet-deploy/` | 3.6 GB | ne (nested git) | přesunout mimo repo |
| `kvarteta-eshop/` | 1.1 GB | 957 souborů | zachovat (aktivní) |
| `Záloha karet/` | 801 MB | 360 souborů | přesunout do externího úložiště (iCloud, Drive) — jsou to PDFs a podklady, ne kód |
| `_archive/` | 763 MB | 238 souborů | zvážit `git mv` mimo repo nebo `git-lfs` |
| `hraci_karty/` | 515 MB | 201 souborů | zachovat, ale sjednotit s `kvarteta/` |
| `kvarteta/` | 462 MB | 239 souborů | zachovat |
| `tiskove_archy/` | 151 MB | 178 souborů | zachovat |
| `pexeso/` | 98 MB | 78 souborů | zachovat |

**Velikost `.git` v rootu: 2.3 GB** — velké kvůli historii binárních souborů (PDF, PNG). Cleanup historií (`git filter-repo`) by to výrazně zmenšil, ale je to destruktivní operace na historii → jen pokud chceš.

---

## .gitignore audit

Aktuální stav (rozumný základ):
```
node_modules/, dist/, dist-ssr/, .DS_Store, logs/, *.log, *.local, ~$*.xlsx
```

**Doporučené přidat:**
```
# Secrets
.env
.env.*
!.env.example

# Python
venv/
**/venv/
__pycache__/
*.pyc
.pytest_cache/

# Nested deploy artefakty (pokud zachováš tisk-karet-deploy v repu jako submodule)
tisk-karet-deploy/.git/

# Backup locations
*.bak
*.orig
```

**Risk:** LOW — `.gitignore` je jen prevence, neovlivní již tracked soubory.

---

## `.DS_Store` audit

Již je v `.gitignore`. Zkontrolovat `git ls-files | grep DS_Store` — pokud nějaké jsou (byly committnuty před přidáním do `.gitignore`), doporučit `git rm --cached`.

---

## Doporučené pořadí akcí (po schválení)

1. **TEĎ:** revokovat PAT token (ty, mimo tento nástroj, v GitHub UI)
2. Přepsat `tisk-karet-deploy/.git/config` remote bez tokenu
3. Přidat `.env*`, `venv/` do `.gitignore`
4. Zvážit přesun `Záloha karet/` + `_archive/` mimo repo
5. Rozhodnout o `tisk-karet-deploy/` (submodule vs. přesun)
6. (Volitelně) `git filter-repo` pro historie — jen pokud repo nikdo jiný nemá klonovaný
