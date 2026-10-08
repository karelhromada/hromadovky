// Vlastní anonymní měření návštěvnosti → Supabase RPC track_event → /admin/analytika.
// Nic neukládá do prohlížeče (žádné cookies ani storage), návštěvníka anonymně pozná až
// server z denně měněného hashe — proto běží bez souhlasu s cookies (na rozdíl od Google tagu).
// Zdroj návštěvy se drží jen v paměti stránky (SPA) od prvního načtení.
import { supabase } from './supabase';

export type SiteEvent =
    | 'pageview'
    | 'view_item'
    | 'add_to_cart'
    | 'begin_checkout'
    | 'purchase'
    | 'configurator_start';

export type Device = 'mobile' | 'tablet' | 'desktop';

export type ConfiguratorKind = 'custom-kvarteto' | 'custom-pexeso' | 'custom-karty';

export interface TrafficSource {
    source: string;
    medium: string;
    campaign: string | null;
    referrerHost: string | null;
}

interface EventOptions {
    productId?: string;
    /** UUID objednávky z create_order_submission — zná ho jen prohlížeč kupujícího. */
    orderId?: string;
}

const OWN_HOST = /(^|\.)hromadovky\.cz$/;

// Pořadí je důležité: specifičtější domény (gemini.google.com, mail.google.com) před obecnými.
const REFERRER_RULES: ReadonlyArray<{ test: RegExp; source: string; medium: string }> = [
    { test: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/, source: 'chatgpt', medium: 'ai' },
    { test: /(^|\.)perplexity\.ai$/, source: 'perplexity', medium: 'ai' },
    { test: /^gemini\.google\.com$/, source: 'gemini', medium: 'ai' },
    { test: /(^|\.)copilot\.microsoft\.com$/, source: 'copilot', medium: 'ai' },
    { test: /(^|\.)claude\.ai$/, source: 'claude', medium: 'ai' },
    { test: /^mail\.google\.com$/, source: 'gmail', medium: 'email' },
    { test: /(^|\.)(email\.seznam\.cz|mail\.seznam\.cz)$/, source: 'seznam-email', medium: 'email' },
    { test: /(^|\.)google\.[a-z.]+$/, source: 'google', medium: 'organic' },
    { test: /(^|\.)seznam\.cz$/, source: 'seznam', medium: 'organic' },
    { test: /(^|\.)bing\.com$/, source: 'bing', medium: 'organic' },
    { test: /(^|\.)duckduckgo\.com$/, source: 'duckduckgo', medium: 'organic' },
    { test: /(^|\.)ecosia\.org$/, source: 'ecosia', medium: 'organic' },
    { test: /(^|\.)heureka\.cz$/, source: 'heureka', medium: 'comparison' },
    { test: /(^|\.)zbozi\.cz$/, source: 'zbozi', medium: 'comparison' },
    { test: /(^|\.)instagram\.com$/, source: 'instagram', medium: 'social' },
    { test: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/, source: 'facebook', medium: 'social' },
    { test: /(^|\.)pinterest\.[a-z.]+$/, source: 'pinterest', medium: 'social' },
    { test: /(^|\.)tiktok\.com$/, source: 'tiktok', medium: 'social' },
    { test: /(^|\.)(youtube\.com|youtu\.be)$/, source: 'youtube', medium: 'social' },
    { test: /(^|\.)(x\.com|twitter\.com|t\.co)$/, source: 'x', medium: 'social' },
];

const DIRECT: TrafficSource = { source: 'direct', medium: 'none', campaign: null, referrerHost: null };

function hostOf(url: string): string | null {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
}

/** Odkud návštěvník přišel: reklama (gclid/utm) > odkazující web > přímo. */
export function classifySource(href: string, referrer: string): TrafficSource {
    let params: URLSearchParams;
    try {
        params = new URL(href).searchParams;
    } catch {
        params = new URLSearchParams();
    }
    const campaign = params.get('utm_campaign');
    const referrerHost = referrer ? hostOf(referrer) : null;
    const externalReferrer = referrerHost && !OWN_HOST.test(referrerHost) ? referrerHost : null;

    if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
        return { source: params.get('utm_source') ?? 'google', medium: 'cpc', campaign, referrerHost: externalReferrer };
    }
    const utmSource = params.get('utm_source');
    if (utmSource) {
        return { source: utmSource, medium: params.get('utm_medium') ?? 'referral', campaign, referrerHost: externalReferrer };
    }
    if (params.has('fbclid')) {
        return { source: 'facebook', medium: 'social', campaign, referrerHost: externalReferrer };
    }
    if (!externalReferrer) return DIRECT;

    const rule = REFERRER_RULES.find((r) => r.test.test(externalReferrer));
    return rule
        ? { source: rule.source, medium: rule.medium, campaign, referrerHost: externalReferrer }
        : { source: externalReferrer.replace(/^www\./, ''), medium: 'referral', campaign, referrerHost: externalReferrer };
}

export function detectDevice(userAgent: string, maxTouchPoints = 0): Device {
    // iPadOS se hlásí jako Macintosh, prozradí ho dotyková obrazovka.
    if (/iPad|Tablet/i.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return 'tablet';
    if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) return 'tablet';
    if (/Mobi|iPhone|Android/i.test(userAgent)) return 'mobile';
    return 'desktop';
}

/** ID z košíku → stabilní ID pro statistiky (zakázkové sady mají v ID časové razítko). */
export function normalizeProductId(id: string): string {
    if (id.startsWith('custom-quartet-')) return 'custom-kvarteto';
    if (id.startsWith('pexeso-custom-')) return 'custom-pexeso';
    if (id.startsWith('rodinne-karty-')) return 'custom-karty';
    return id;
}

let landingSource: TrafficSource | null = null;
const startedConfigurators = new Set<ConfiguratorKind>();

function isTrackingAllowed(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    if (navigator.webdriver) return false; // prerender (Puppeteer) i jiné automaty
    if (import.meta.env.DEV && !import.meta.env.VITE_ANALYTICS_DEV) return false; // vývoj nešpiní produkční data
    return !window.location.pathname.startsWith('/admin');
}

/** Odešle anonymní událost. Nikdy nevyhodí výjimku — měření nesmí rozbít web. */
export function trackSiteEvent(event: SiteEvent, options: EventOptions = {}): void {
    try {
        if (!isTrackingAllowed()) return;
        landingSource ??= classifySource(window.location.href, document.referrer);
        const { source, medium, campaign, referrerHost } = landingSource;
        void supabase
            .rpc('track_event', {
                p_event: event,
                p_path: window.location.pathname,
                p_source: source,
                p_medium: medium,
                p_campaign: campaign,
                p_referrer_host: referrerHost,
                p_device: detectDevice(navigator.userAgent, navigator.maxTouchPoints),
                p_product_id: options.productId ?? null,
                p_order_id: options.orderId ?? null,
            })
            .then(({ error }) => {
                if (error) console.warn('Analytika: událost se neuložila', error.message);
            });
    } catch (error) {
        console.warn('Analytika: událost se neodeslala', error);
    }
}

/** První nahraná fotka v konfigurátoru — počítá se jednou za načtení stránky. */
export function trackConfiguratorStart(kind: ConfiguratorKind): void {
    if (startedConfigurators.has(kind)) return;
    startedConfigurators.add(kind);
    trackSiteEvent('configurator_start', { productId: kind });
}
