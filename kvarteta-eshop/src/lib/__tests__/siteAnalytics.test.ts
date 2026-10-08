import { afterEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn(() => Promise.resolve({ error: null }));
vi.mock('../supabase', () => ({ supabase: { rpc } }));

type Module = typeof import('../siteAnalytics');

const SITE = 'https://www.hromadovky.cz';

async function loadModule(): Promise<Module> {
    vi.resetModules();
    return import('../siteAnalytics');
}

function stubBrowser(pathname: string, { webdriver = false, href = `${SITE}${pathname}`, referrer = '' } = {}) {
    vi.stubGlobal('window', { location: { pathname, href } });
    vi.stubGlobal('document', { referrer });
    vi.stubGlobal('navigator', { webdriver, userAgent: 'Mozilla/5.0 (iPhone)', maxTouchPoints: 5 });
    vi.stubEnv('DEV', false);
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    rpc.mockClear();
});

describe('classifySource', () => {
    it.each([
        ['reklama Google (gclid)', `${SITE}/vlastni-karty?gclid=abc&utm_campaign=vanoce`, '', 'google', 'cpc', 'vanoce'],
        ['UTM parametry', `${SITE}/?utm_source=newsletter&utm_medium=email`, '', 'newsletter', 'email', null],
        ['Facebook klik (fbclid)', `${SITE}/?fbclid=x`, '', 'facebook', 'social', null],
        ['vyhledávání Google', `${SITE}/`, 'https://www.google.cz/', 'google', 'organic', null],
        ['vyhledávání Seznam', `${SITE}/`, 'https://search.seznam.cz/?q=pexeso', 'seznam', 'organic', null],
        ['Heureka', `${SITE}/kvarteta`, 'https://kvarteta.heureka.cz/', 'heureka', 'comparison', null],
        ['Instagram', `${SITE}/`, 'https://l.instagram.com/', 'instagram', 'social', null],
        ['ChatGPT (GEO)', `${SITE}/`, 'https://chatgpt.com/', 'chatgpt', 'ai', null],
        ['Gemini má přednost před google.*', `${SITE}/`, 'https://gemini.google.com/app', 'gemini', 'ai', null],
        ['Gmail má přednost před google.*', `${SITE}/`, 'https://mail.google.com/', 'gmail', 'email', null],
        ['neznámý web', `${SITE}/`, 'https://www.rodinnyblog.cz/clanek', 'rodinnyblog.cz', 'referral', null],
        ['přímo (bez refereru)', `${SITE}/`, '', 'direct', 'none', null],
        ['vlastní web = přímo', `${SITE}/karty`, 'https://www.hromadovky.cz/', 'direct', 'none', null],
        ['nesmyslný referrer', `${SITE}/`, 'not a url', 'direct', 'none', null],
    ])('%s', async (_label, href, referrer, source, medium, campaign) => {
        const { classifySource } = await loadModule();
        expect(classifySource(href, referrer)).toMatchObject({ source, medium, campaign });
    });
});

describe('detectDevice', () => {
    it.each([
        ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', 0, 'mobile'],
        ['Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari', 0, 'mobile'],
        ['Mozilla/5.0 (Linux; Android 13; SM-X200) Safari', 0, 'tablet'],
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5, 'tablet'],
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 0, 'desktop'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0, 'desktop'],
    ])('%s (%i dotyků) → %s', async (ua, touches, expected) => {
        const { detectDevice } = await loadModule();
        expect(detectDevice(ua, touches)).toBe(expected);
    });
});

describe('normalizeProductId', () => {
    it('zakázkové sady sjednotí bez časového razítka', async () => {
        const { normalizeProductId } = await loadModule();
        expect(normalizeProductId('custom-quartet-1791481897000')).toBe('custom-kvarteto');
        expect(normalizeProductId('pexeso-custom-1791481897000')).toBe('custom-pexeso');
        expect(normalizeProductId('rodinne-karty-1791481897000')).toBe('custom-karty');
        expect(normalizeProductId('kvarteto-dinosauri')).toBe('kvarteto-dinosauri');
    });
});

describe('trackSiteEvent', () => {
    it('pošle událost se zdrojem z první stránky návštěvy', async () => {
        stubBrowser('/vlastni-karty', { href: `${SITE}/vlastni-karty?gclid=abc` });
        const { trackSiteEvent } = await loadModule();
        trackSiteEvent('pageview');
        // další stránka v rámci SPA už gclid v URL nemá, zdroj ale zůstává
        vi.stubGlobal('window', { location: { pathname: '/pexeso', href: `${SITE}/pexeso` } });
        trackSiteEvent('view_item', { productId: 'pexeso-dinosauri' });
        expect(rpc).toHaveBeenCalledTimes(2);
        expect(rpc).toHaveBeenLastCalledWith('track_event', expect.objectContaining({
            p_event: 'view_item',
            p_path: '/pexeso',
            p_source: 'google',
            p_medium: 'cpc',
            p_device: 'mobile',
            p_product_id: 'pexeso-dinosauri',
        }));
    });

    it('nákup posílá UUID objednávky (ne uhodnutelný VS)', async () => {
        stubBrowser('/checkout');
        const { trackSiteEvent } = await loadModule();
        trackSiteEvent('purchase', { orderId: '6f1c2c4e-0000-4000-8000-000000000001' });
        expect(rpc).toHaveBeenCalledWith('track_event', expect.objectContaining({
            p_event: 'purchase',
            p_order_id: '6f1c2c4e-0000-4000-8000-000000000001',
        }));
    });

    it('v prerenderu (webdriver) nic neposílá', async () => {
        stubBrowser('/', { webdriver: true });
        const { trackSiteEvent } = await loadModule();
        trackSiteEvent('pageview');
        expect(rpc).not.toHaveBeenCalled();
    });

    it('administraci neměří', async () => {
        stubBrowser('/admin/analytika');
        const { trackSiteEvent } = await loadModule();
        trackSiteEvent('pageview');
        expect(rpc).not.toHaveBeenCalled();
    });

    it('chyba Supabase klienta neprobublá', async () => {
        stubBrowser('/');
        rpc.mockImplementationOnce(() => {
            throw new Error('offline');
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { trackSiteEvent } = await loadModule();
        expect(() => trackSiteEvent('pageview')).not.toThrow();
        warn.mockRestore();
    });

    it('start konfigurátoru počítá jen jednou za načtení stránky', async () => {
        stubBrowser('/pexeso');
        const { trackConfiguratorStart } = await loadModule();
        trackConfiguratorStart('custom-pexeso');
        trackConfiguratorStart('custom-pexeso');
        trackConfiguratorStart('custom-karty');
        expect(rpc).toHaveBeenCalledTimes(2);
    });
});
