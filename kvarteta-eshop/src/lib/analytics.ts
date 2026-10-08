// Google tag (Google Ads konverze + GA4) s Consent Mode v2, napojený na CookieBanner.
// ID služeb jsou v src/config/tracking.ts — dokud jsou prázdná, modul nic nedělá.
import { TRACKING } from '../config/tracking';

/** Hodnota z cookie lišty (localStorage `hromadovky_cookie_consent`); null = ještě nerozhodnuto. */
export type ConsentValue = 'all' | 'necessary';

type ConsentFlag = 'granted' | 'denied';

export interface GoogleConsentState {
    ad_storage: ConsentFlag;
    ad_user_data: ConsentFlag;
    ad_personalization: ConsentFlag;
    analytics_storage: ConsentFlag;
}

export interface PurchaseItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Purchase {
    /** Variabilní symbol objednávky — Google podle něj deduplikuje opakované konverze. */
    transactionId: string;
    /** Hodnota zboží bez dopravy (pro ROAS se počítá jen to, co se prodalo). */
    value: number;
    items: readonly PurchaseItem[];
}

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js';
let initialized = false;
let scriptInjected = false;

const isEnabled = (): boolean => Boolean(TRACKING.GOOGLE_ADS_ID || TRACKING.GA4_MEASUREMENT_ID);

// Prerender (Puppeteer) má navigator.webdriver = true. Tag nesmí skončit ve statickém HTML
// snapshotu, jinak by se gtag.js načetl každému návštěvníkovi ještě před souhlasem.
const isAutomatedBrowser = (): boolean => typeof navigator !== 'undefined' && navigator.webdriver === true;

export function consentStateFor(consent: ConsentValue | null): GoogleConsentState {
    const flag: ConsentFlag = consent === 'all' ? 'granted' : 'denied';
    return { ad_storage: flag, ad_user_data: flag, ad_personalization: flag, analytics_storage: flag };
}

/**
 * Smí se gtag.js stáhnout pro daný stav souhlasu?
 *
 * Consent Mode má dvě varianty:
 * - „basic": skript se načte AŽ po souhlasu. Bez souhlasu Google nedostane vůbec nic
 *   → právně nejčistší, ale konverze odmítnuvších návštěvníků Google nevidí ani nemodeluje.
 * - „advanced": skript se načte hned, ale bez souhlasu posílá jen anonymní pingy bez cookies
 *   → Google z nich dopočítá (modeluje) ztracené konverze, chytré nabídky se učí rychleji.
 *   Pingy ale nesou IP a user-agent, a to ÚOOÚ i část právníků vidí jako zpracování bez souhlasu.
 */
export function shouldLoadGoogleTag(consent: ConsentValue | null): boolean {
    // Rozhodnutí 2026-10-08: basic — bez výslovného souhlasu se Google skript vůbec nestáhne.
    return consent === 'all';
}

function ensureGtag(): (...args: unknown[]) => void {
    window.dataLayer = window.dataLayer ?? [];
    if (!window.gtag) {
        window.gtag = function gtag() {
            // gtag.js zpracuje jen objekt `arguments` — pole z rest parametrů tiše ignoruje.
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer!.push(arguments);
        };
    }
    return window.gtag;
}

function injectScript(): void {
    if (scriptInjected) return;
    scriptInjected = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `${GTAG_SRC}?id=${encodeURIComponent(TRACKING.GA4_MEASUREMENT_ID || TRACKING.GOOGLE_ADS_ID)}`;
    document.head.appendChild(script);
}

/** Volá se jednou po startu aplikace s uloženým souhlasem (nebo null). */
export function initAnalytics(consent: ConsentValue | null): void {
    if (initialized || typeof window === 'undefined' || !isEnabled() || isAutomatedBrowser()) return;
    initialized = true;

    const gtag = ensureGtag();
    // Výchozí stav MUSÍ jít před config — jinak by první hit odešel bez consent signálu.
    gtag('consent', 'default', { ...consentStateFor(null), wait_for_update: 500 });
    gtag('set', 'ads_data_redaction', true);
    if (consent) gtag('consent', 'update', consentStateFor(consent));
    gtag('js', new Date());
    if (TRACKING.GOOGLE_ADS_ID) gtag('config', TRACKING.GOOGLE_ADS_ID);
    if (TRACKING.GA4_MEASUREMENT_ID) gtag('config', TRACKING.GA4_MEASUREMENT_ID);

    if (shouldLoadGoogleTag(consent)) injectScript();
}

/** Volá CookieBanner po kliknutí na „Přijmout vše" / „Pouze nezbytné". */
export function updateConsent(consent: ConsentValue): void {
    if (!initialized || !window.gtag) return;
    window.gtag('consent', 'update', consentStateFor(consent));
    if (shouldLoadGoogleTag(consent)) injectScript();
}

/** Konverze „Nákup" pro Google Ads + GA4 `purchase`. Volá se po úspěšném uložení objednávky. */
export function trackPurchase(purchase: Purchase): void {
    if (!initialized || !window.gtag) return;
    // Měření nesmí nikdy shodit pokladnu — objednávka je v tu chvíli už uložená.
    try {
        sendPurchase(purchase);
    } catch (error) {
        console.error('Odeslání konverze selhalo:', error);
    }
}

function sendPurchase({ transactionId, value, items }: Purchase): void {
    if (!window.gtag) return;
    if (TRACKING.GOOGLE_ADS_ID && TRACKING.GOOGLE_ADS_PURCHASE_LABEL) {
        window.gtag('event', 'conversion', {
            send_to: `${TRACKING.GOOGLE_ADS_ID}/${TRACKING.GOOGLE_ADS_PURCHASE_LABEL}`,
            value,
            currency: 'CZK',
            transaction_id: transactionId,
        });
    }
    if (TRACKING.GA4_MEASUREMENT_ID) {
        window.gtag('event', 'purchase', {
            transaction_id: transactionId,
            value,
            currency: 'CZK',
            items: items.map((item) => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    }
}
