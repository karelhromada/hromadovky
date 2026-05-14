# hromadovky.cz

Eshop pro autorské hrací karty, kvarteta a pexeso.

## Stack

- **Frontend:** React 19 + Vite (`kvarteta-eshop/`)
- **Auth + DB + Storage:** Supabase
- **Automatizace:** self-hosted n8n (`n8n.hromadovky.cz`)
- **Platby:** Fio Banka REST API (auto-párování) + GP Webpay (volitelně)
- **Hosting:** Vercel

## Vercel build

Build command (nastavený v Vercel UI Project Settings → Build and Deployment):

```bash
cd kvarteta-eshop && PUPPETEER_SKIP_DOWNLOAD=true npm install && npm run build:no-prerender
```

`PUPPETEER_SKIP_DOWNLOAD=true` skipne 200 MB Chromium download (Puppeteer používá jen lokální prerender, na Vercel se nepoužívá). `build:no-prerender` skipne static prerender 9 routes — react-helmet-async funguje runtime.

## Lokální development

```bash
cd kvarteta-eshop
npm install
npm run dev   # localhost:5173
```

Pro full build s prerenderem (lokálně, ne na Vercel):
```bash
npm run build
```
