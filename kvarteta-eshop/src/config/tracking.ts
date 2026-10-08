// Google Ads + GA4 — VEŘEJNÉ identifikátory (jsou vidět v každém prohlížeči, nejsou to secrets),
// proto žijí v kódu a ne ve Vercel env (VITE_* proměnné se navíc vkládají do bundlu při buildu).
// Prázdný řetězec = služba vypnutá; dokud jsou prázdné všechny, žádný Google skript se nenačte.
//
// Kde je najít:
// - GOOGLE_ADS_ID + PURCHASE_LABEL: Google Ads → Cíle → Konverze → akce „Nákup" →
//   Nastavení značky → Použít Google tag → „send_to": 'AW-XXXXXXXXX/abcDEF123'
//   (část před lomítkem = ID, za lomítkem = label).
// - GA4_MEASUREMENT_ID: Google Analytics → Správce → Datové proudy → web → „G-XXXXXXXXXX".
export const TRACKING = {
    GOOGLE_ADS_ID: '',
    GOOGLE_ADS_PURCHASE_LABEL: '',
    GA4_MEASUREMENT_ID: '',
} as const;
