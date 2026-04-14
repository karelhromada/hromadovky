# Performance Audit — kvarteta-eshop

**Date:** 2026-04-14
**Build output:** `npm run build` succeeded (Vite 7.3.1, TypeScript clean)

---

## Build Output Summary

| Asset | Raw size | Gzip |
|---|---|---|
| `dist/assets/index-*.js` | 700 KB | **212 KB** |
| `dist/assets/index-*.css` | 103 KB | **20 KB** |
| `dist/index.html` | 0.64 KB | 0.38 KB |

Budget target per rules: JS < 150 KB gzip (landing), < 300 KB (app). The single JS chunk at **212 KB gzip exceeds the landing-page budget** and sits near the app-page limit with zero code splitting in place.

---

## 1. Dependencies Review

### canvas — HIGH

`canvas` (^3.2.1) is listed as a production `dependency`. It is a Node.js native addon that builds a C++ binding to Cairo. It cannot run in the browser. A search of all `.ts` / `.tsx` files under `src/` found **zero imports of `canvas`**. It lives exclusively in the many `.cjs` image-processing scripts in the project root (`process_crop_exact.cjs`, etc.). Keeping it in `dependencies` instead of a devDependency causes `npm run build` to include it in Vite's module graph traversal (2228 modules transformed), potentially contributing to bundle bloat, and inflates the production `node_modules` unnecessarily. Risk if removed from `dependencies`: zero for the browser bundle. It should move to `devDependencies` or a separate tooling `package.json`.

### sharp — HIGH

`sharp` (^0.34.5) is a Node.js native image processing library. Same situation as `canvas`: found in root `.cjs` scripts only, **zero browser imports**. Bundling it as a production dependency is incorrect and creates the same risk profile. Move to `devDependencies`.

### framer-motion — MEDIUM

Imported in 6 files (`HomePage.tsx`, `Navbar.tsx`, `FeaturesSection.tsx`, `FeaturesSectionKarty.tsx`, `FeaturesSectionPexeso.tsx`, `ProductShowcasePexeso.tsx`). All imports are eager, at module load time. Framer-motion v12 is ~100 KB gzip on its own. Because there is no code splitting, every route downloads it on first load even if the visitor never sees an animated component. Actual animation usage is appropriate (transform, opacity, spring) — the library choice is fine; the loading strategy is not.

### lucide-react — LOW

Version ^0.575.0 with named imports (`Swords`, `BookOpen`, `Sparkles`, etc.) is fine. Lucide-react supports per-icon tree shaking and the imports are already specific. No action required here.

### @supabase/supabase-js — LOW

Used only in `src/lib/supabase.ts`, `src/context/AuthContext.tsx`, `src/pages/AuthPage.tsx`, and `src/pages/CheckoutPage.tsx`. It is legitimately a browser dependency. However, it is imported eagerly in every route because `AuthContext` wraps the entire app in `App.tsx`. Since auth state is lightweight, this is acceptable, but the supabase client itself could be lazy-initialised if bundle size becomes critical.

---

## 2. Bundle Concerns — HIGH

**No code splitting exists.** The entire application ships as a single 700 KB / 212 KB gzip JS chunk. Vite itself warns: *"Some chunks are larger than 500 kB after minification."*

Specific problems:
- All 7 routes (`HomePage`, `KvartetaPage`, `PexesoPage`, `HraciKartyPage`, `RulesPage`, `CheckoutPage`, `AuthPage`) are eagerly imported in `App.tsx`. None use `React.lazy()`.
- `CardCreator.tsx` is **1016 lines** and imported eagerly on the Kvarteta route. It contains large inline data arrays (20 background URLs, 30+ front image URLs hardcoded).
- `products.ts` and `backgrounds.ts` data files are included in the main chunk even on routes that do not use them, because all pages are bundled together.
- No `build.rollupOptions.output.manualChunks` configuration in `vite.config.ts`.
- The config file is effectively empty — only the React plugin, no optimisation hints.

---

## 3. Image Strategy — MEDIUM

**Format:** Card images are correctly served as `.webp`. Hero images in `public/images/` are `.png` files (56–114 KB each). PNG is uncompressed compared to WebP or AVIF. Converting hero PNGs to WebP would yield ~30–50% size reduction.

**Missing `width` and `height` attributes:** Nearly every `<img>` tag in the codebase is missing explicit `width` and `height`. Only `FamilyCardConfigurator.tsx` applies `loading="lazy"` on one image. All hero card images, product images, logo images, and cart thumbnails have no intrinsic dimensions declared. This is a CLS risk (see section 8).

**No `loading="lazy"` on below-fold images:** The exploding hero cards in `HomePage.tsx` (9 images, 48–115 KB each), hero card stacks in `HeroSection.tsx` (5 images), and product images in `ProductShowcase.tsx` load eagerly with no lazy loading.

**No `fetchpriority="high"` on LCP candidate.** The hero logo (`/logo.webp`, 68 KB) or the first card image are likely the LCP element. Neither has `fetchpriority="high"` nor a `<link rel="preload">` in `index.html`.

**No responsive `srcset`.** All images use a single URL with no responsive sizing. On mobile, the same full-resolution image is fetched as on desktop.

**Card library size:** `public/cards/` weighs **505 MB** total. These are served as static assets, so only requested images are downloaded, but the sheer volume means many cards are being shipped that may never be viewed.

---

## 4. Asset Size — MEDIUM

| Asset | File size | Notes |
|---|---|---|
| `public/logo.webp` | 68 KB | Loaded eagerly on every page (Navbar + Footer) |
| `public/favicon-512x512.png` | 272 KB | Only used as favicon; not web-served to users normally |
| `public/images/hero_family_joy.png` | 114 KB | PNG, no dimensions declared |
| `public/images/home_hero_v3.png` | 75 KB | PNG, not referenced in any src/ file found |
| `public/cards/drag_full_1.webp` | 115 KB | Hero card, loaded eagerly on every render |
| `public/cards/baby_full_1.webp` | 89 KB | Hero card, loaded eagerly |
| `public/cards/mytologie_v4/thor_v4_*.webp` | 48 KB | Appropriately sized |

The `public/images/*.png` hero images appear unused in the final source; no `src/` import or reference to `journey_*.png`, `home_hero_v3.png`, `home_artisan_v3.png`, or `process_v5_packaging.png` was found in the current tsx files. These may be legacy assets adding to the deployed bundle unnecessarily.

---

## 5. Font Loading — MEDIUM

Both fonts are loaded via a Google Fonts `@import` at the top of `index.css`:

```
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Bricolage+Grotesque:wght@500;700;800&display=swap');
```

Issues:
- `@import` inside CSS is **render-blocking**. The browser must download and parse `index.css`, then issue a second network request for the Google Fonts stylesheet, then download the font files. This adds two serial round-trips before text can render.
- No `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` in `index.html`.
- No `<link rel="preload">` for the critical font weight (Outfit 400 or 600 which renders body text).
- `display=swap` is included in the Google Fonts URL which is correct.
- Four weights of Outfit (300, 400, 600, 800) and three weights of Bricolage Grotesque (500, 700, 800) are requested. If 300 and 500 are used minimally, consider subsetting to the weights actually used.

---

## 6. CSS — LOW

The build outputs **103 KB / 20 KB gzip** of CSS. With 23 separate CSS files all bundled into one, there is a high probability of unused rules on any given route. Some observations:
- `FamilyCardConfigurator.css` is referenced in `FamilyCardConfigurator.tsx` which is only rendered inside `CardCreator`, yet all its rules are in the global CSS bundle loaded on every page.
- `HeroSectionKarty.css` and `HeroSectionPexeso.css` apply only on the Karty and Pexeso routes but are bundled globally.
- `FeaturesSectionKarty.css` and `FeaturesSectionPexeso.css` are route-specific but globally loaded.
- Component-scoped CSS (CSS Modules or styled-components) would eliminate dead rule loading, but adopting it is a larger refactor.
- `background-attachment: fixed` on `body` in `index.css` disables GPU compositing of the background on mobile browsers (iOS Safari), causing scroll repaint on every frame. This is a known performance trap.

---

## 7. Animation Performance — MEDIUM

### Framer-motion usage is broadly correct

Motion is applied to compositor-friendly properties: `transform`, `opacity`, `scale`, `rotate`, `x`, `y`. No layout-thrashing properties (`width`, `height`, `top`, `left`) are animated.

### Concerns

**`Math.random()` inside JSX render (HIGH risk for INP).** `HomePage.tsx` lines 111 and 115 call `Math.random()` directly inside the `animate` prop of Framer `motion.div` components. Since these are inside the render function, new random values are generated on every re-render, causing Framer to see changed animation targets and re-trigger motion. This also means animations are not deterministic and cannot be memoised.

**Persistent full-page blob animation.** `index.css` animates three large pseudo-elements with `filter: blur(40px)` and `will-change: transform` for the pastel mesh background. These run continuously on every page for the app's entire lifetime. `filter: blur()` on large elements (80vw × 80vw) is GPU-intensive. The comment in the code acknowledges reducing from `blur(80px)` to `40px` already, but the effect still creates three permanent compositor layers consuming VRAM.

**`window.addEventListener('resize', ...)` without debouncing** in `HomePage.tsx` (lines 27–40) fires `setState` on every resize event, which triggers React re-renders at high frequency during window resize. This directly increases INP during interactive resize.

**`setInterval` rotating card stack** in `HeroSection.tsx` fires every 3000ms and calls `setRotation`, causing a re-render of the entire `HeroSection` including re-calculating `card-pos-*` class assignments for 5 cards. This is minor but avoidable with CSS animation instead.

**`will-change: transform, opacity` applied broadly** across many CSS classes (`exploding-card`, `main-deck-wrapper`, `sub-btn-fan`, product cards, pexeso creator items). This is overused. `will-change` should be applied narrowly and removed after animation completes. Broad application promotes every flagged element to its own compositor layer, increasing VRAM usage.

---

## 8. Core Web Vitals Risk

### LCP — HIGH risk

- Hero is a React SPA; the initial HTML contains only an empty `<div id="root">`. The browser must download (212 KB gzip JS), parse, and execute the bundle before any content renders. On a mid-range mobile device on 4G, this likely pushes LCP beyond 3 s.
- No SSR or pre-rendering is configured.
- The LCP candidate (hero heading or logo) has no `fetchpriority="high"` hint.
- No `<link rel="preload">` for the logo or first card image.

### CLS — MEDIUM risk

- `<img>` tags without `width`/`height` attributes cause layout shifts as images load. This affects hero cards, product images, and cart thumbnails.
- The `setIsOpen` state change in `HomePage` rearranges the exploding deck, but it is user-triggered so CLS score is not affected.
- The `AnimatePresence` fan buttons animate positionally (absolute positioned via Framer), so they should not contribute to CLS.

### INP — MEDIUM risk

- `Math.random()` calls during render (see section 7) lengthen render work.
- Resize handler without debounce fires React state updates at full event frequency.
- `CardCreator.tsx` at 1016 lines with multiple `useState` and `useCallback` hooks renders an expensive tree on interaction — though it is not on the landing route.

---

## 9. Quick Wins

| Priority | Win | Effort | Risk | Estimated Impact |
|---|---|---|---|---|
| 1 | **Route-level code splitting** — wrap all page imports in `React.lazy()` and `<Suspense>`. Add `build.rollupOptions.output.manualChunks` in `vite.config.ts` to split vendor (framer-motion, supabase) from app code. | ~2 h | Safe | JS initial load drops from 212 KB to ~80–100 KB gzip; LCP improves ~0.5–1 s |
| 2 | **Debounce the resize handler** in `HomePage.tsx` and stabilise `Math.random()` values outside render (use `useRef` or `useMemo`). | ~30 min | Safe | Eliminates unnecessary re-renders; INP improvement ~30–50 ms |
| 3 | **Add `<link rel="preconnect">` and swap Google Fonts `@import` for `<link>` tags in `index.html`**, plus add `<link rel="preload">` for the Outfit 400 woff2. | ~20 min | Safe | Removes 1–2 serial round-trips; FCP improvement ~200–400 ms |
| 4 | **Add `width` and `height` to all `<img>` tags** (or set `aspect-ratio` in CSS for cards). | ~1 h | Safe | Eliminates CLS from image layout shifts; CLS score improves |
| 5 | **Move `canvas` and `sharp` to `devDependencies`** (they are already unused in browser code). | 5 min | Safe | Reduces production `node_modules` size; eliminates risk of Vite accidentally trying to resolve native addons |

---

## Summary

| Area | Severity | Status |
|---|---|---|
| Single 212 KB JS bundle, no code splitting | HIGH | Vite warns; exceeds landing budget |
| `canvas` and `sharp` in production dependencies | HIGH | Unused in browser; misclassified |
| Missing `React.lazy` / dynamic imports | HIGH | All routes eagerly bundled |
| Hero images without `loading="eager" fetchpriority="high"` | MEDIUM | LCP unoptimised |
| `<img>` tags missing `width`/`height` | MEDIUM | CLS risk on every page |
| Google Fonts via CSS `@import` (render-blocking) | MEDIUM | Extra round-trips before text renders |
| `Math.random()` in render / undebounced resize handler | MEDIUM | INP degradation |
| Pervasive `will-change` in CSS | MEDIUM | Excess compositor layers |
| PNG hero images (should be WebP) | LOW | ~30–50% size saving available |
| `background-attachment: fixed` on mobile | LOW | Disables GPU compositing on iOS Safari |
| Route-specific CSS loaded globally | LOW | ~20–30 KB of unused CSS per route |
