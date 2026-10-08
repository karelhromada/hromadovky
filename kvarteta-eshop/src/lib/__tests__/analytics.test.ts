import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/tracking', () => ({
    TRACKING: {
        GOOGLE_ADS_ID: 'AW-123',
        GOOGLE_ADS_PURCHASE_LABEL: 'abcLabel',
        GA4_MEASUREMENT_ID: 'G-TEST',
    },
}));

type Analytics = typeof import('../analytics');

interface FakeWindow {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
}

let fakeWindow: FakeWindow;

// Modul drží stav (initialized) — každý test si ho načte načisto.
async function load(webdriver = false): Promise<Analytics> {
    vi.resetModules();
    fakeWindow = {};
    vi.stubGlobal('window', fakeWindow);
    vi.stubGlobal('navigator', { webdriver });
    vi.stubGlobal('document', { createElement: () => ({}), head: { appendChild: vi.fn() } });
    return import('../analytics');
}

// dataLayer obsahuje objekty `arguments` → převod na pole kvůli porovnání
const calls = (): unknown[][] => (fakeWindow.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));

beforeEach(() => {
    vi.unstubAllGlobals();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('consentStateFor', () => {
    it('udělí vše jen při „Přijmout vše"', async () => {
        const { consentStateFor } = await load();
        expect(consentStateFor('all')).toEqual({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        });
    });

    it.each([['necessary' as const], [null]])('odmítne vše pro %s', async (value) => {
        const { consentStateFor } = await load();
        expect(Object.values(consentStateFor(value))).toEqual(['denied', 'denied', 'denied', 'denied']);
    });
});

describe('initAnalytics', () => {
    it('nastaví výchozí odmítnutí PŘED config', async () => {
        const { initAnalytics } = await load();
        initAnalytics(null);
        const commands = calls().map((c) => `${c[0]}:${c[1]}`);
        expect(commands[0]).toBe('consent:default');
        expect(commands.indexOf('consent:default')).toBeLessThan(commands.indexOf('config:AW-123'));
        expect(calls()[0][2]).toMatchObject({ ad_storage: 'denied', analytics_storage: 'denied' });
    });

    it('do dataLayer dává objekt arguments, ne pole (jinak ho gtag.js ignoruje)', async () => {
        const { initAnalytics } = await load();
        initAnalytics(null);
        const first = fakeWindow.dataLayer?.[0];
        expect(Array.isArray(first)).toBe(false);
        expect(Object.prototype.toString.call(first)).toBe('[object Arguments]');
    });

    it('promítne uložený souhlas hned po výchozím stavu', async () => {
        const { initAnalytics } = await load();
        initAnalytics('all');
        expect(calls()[2]).toEqual(['consent', 'update', expect.objectContaining({ ad_storage: 'granted' })]);
    });

    it('v prerenderu (navigator.webdriver) nedělá nic', async () => {
        const { initAnalytics } = await load(true);
        initAnalytics('all');
        expect(fakeWindow.dataLayer).toBeUndefined();
        expect(fakeWindow.gtag).toBeUndefined();
    });

    it('druhé volání (StrictMode) nic nezdvojí', async () => {
        const { initAnalytics } = await load();
        initAnalytics(null);
        const count = calls().length;
        initAnalytics(null);
        expect(calls()).toHaveLength(count);
    });
});

describe('trackPurchase', () => {
    const purchase = {
        transactionId: '2026100801',
        value: 698,
        items: [{ id: 'kvarteto-dinosauri', name: 'Kvarteto: Dinosauři', price: 349, quantity: 2 }],
    };

    it('pošle Ads konverzi s VS jako transaction_id a GA4 purchase', async () => {
        const { initAnalytics, trackPurchase } = await load();
        initAnalytics('all');
        trackPurchase(purchase);
        const events = calls().filter((c) => c[0] === 'event');
        expect(events).toContainEqual([
            'event',
            'conversion',
            { send_to: 'AW-123/abcLabel', value: 698, currency: 'CZK', transaction_id: '2026100801' },
        ]);
        expect(events).toContainEqual([
            'event',
            'purchase',
            expect.objectContaining({
                transaction_id: '2026100801',
                items: [{ item_id: 'kvarteto-dinosauri', item_name: 'Kvarteto: Dinosauři', price: 349, quantity: 2 }],
            }),
        ]);
    });

    it('bez inicializace nic neposílá', async () => {
        const { trackPurchase } = await load();
        trackPurchase(purchase);
        expect(fakeWindow.dataLayer).toBeUndefined();
    });
});

describe('trackPurchase — odolnost', () => {
    it('výjimka z gtag neprobublá do pokladny', async () => {
        const { initAnalytics, trackPurchase } = await load();
        initAnalytics('all');
        fakeWindow.gtag = () => {
            throw new Error('cizí skript přepsal gtag');
        };
        const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => trackPurchase({ transactionId: '1', value: 1, items: [] })).not.toThrow();
        spy.mockRestore();
    });
});

describe('shouldLoadGoogleTag — basic consent mode', () => {
    it('stáhne gtag.js jen po „Přijmout vše"', async () => {
        const { shouldLoadGoogleTag } = await load();
        expect(shouldLoadGoogleTag('all')).toBe(true);
        expect(shouldLoadGoogleTag('necessary')).toBe(false);
        expect(shouldLoadGoogleTag(null)).toBe(false);
    });

    it('bez souhlasu nevloží skript, po souhlasu ano', async () => {
        const { initAnalytics, updateConsent } = await load();
        const appendChild = (document.head.appendChild as ReturnType<typeof vi.fn>);
        initAnalytics(null);
        expect(appendChild).not.toHaveBeenCalled();
        updateConsent('all');
        expect(appendChild).toHaveBeenCalledTimes(1);
    });
});
