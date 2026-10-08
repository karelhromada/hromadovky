import { describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({ supabase: { rpc: vi.fn() } }));

import { formatPercent, mediumLabel, niceScale, parseReport, rangeFor, ratePercent, sourceLabel } from '../analyticsReport';

describe('niceScale', () => {
    it.each([
        [0, 4, 1],
        [1, 1, 1],
        [3, 3, 1],
        [123, 150, 50],
        [1834, 2000, 500],
        [7, 8, 2],
    ])('max %i → osa do %i po %i', (max, top, step) => {
        expect(niceScale(max)).toEqual({ top, step });
    });
});

describe('ratePercent', () => {
    it('počítá na jedno desetinné místo', () => {
        expect(ratePercent(3, 120)).toBe(2.5);
        expect(ratePercent(1, 3)).toBe(33.3);
    });

    it('bez základu vrací null (ne NaN ani nekonečno)', () => {
        expect(ratePercent(5, 0)).toBeNull();
        expect(ratePercent(Number.NaN, 10)).toBeNull();
        expect(formatPercent(null)).toBe('–');
    });
});

describe('rangeFor', () => {
    it('7 dní = dnešek a 6 předchozích', () => {
        expect(rangeFor(7, new Date(2026, 9, 8))).toEqual({ from: '2026-10-02', to: '2026-10-08' });
    });

    it('přes přelom měsíce', () => {
        expect(rangeFor(30, new Date(2026, 9, 8))).toEqual({ from: '2026-09-09', to: '2026-10-08' });
    });
});

describe('popisky', () => {
    it('známé zdroje a typy přeloží, neznámé nechá', () => {
        expect(sourceLabel('zbozi')).toBe('Zboží.cz');
        expect(mediumLabel('cpc')).toBe('Placená reklama');
        expect(sourceLabel('rodinnyblog.cz')).toBe('rodinnyblog.cz');
    });
});

describe('parseReport', () => {
    it('převezme odpověď RPC', () => {
        const report = parseReport({
            totals: { visits: 10, pageviews: 25, orders: 1, revenue: 698 },
            daily: [{ day: '2026-10-08', visits: 10, pageviews: 25, orders: 1, revenue: 698 }],
            sources: [{ source: 'google', medium: 'cpc', visits: 4, orders: 1, revenue: 698 }],
            pages: [{ path: '/kvarteta', pageviews: 9, visits: 6 }],
            devices: [{ device: 'mobile', visits: 7 }],
            funnel: { visits: 10, view_item: 5, add_to_cart: 2, begin_checkout: 1, purchase: 1 },
            products: [{ product_id: 'kvarteto-dinosauri', views: 5, added: 2 }],
            configurators: [{ kind: 'custom-pexeso', starts: 2, added: 1 }],
        });
        expect(report.totals.revenue).toBe(698);
        expect(report.sources[0]).toEqual({ source: 'google', medium: 'cpc', visits: 4, orders: 1, revenue: 698 });
        expect(report.configurators).toEqual([{ kind: 'custom-pexeso', starts: 2, added: 1 }]);
    });

    it('rozbitá nebo prázdná odpověď nespadne a dá nuly', () => {
        const report = parseReport(null);
        expect(report.totals).toEqual({ visits: 0, pageviews: 0, orders: 0, revenue: 0 });
        expect(report.daily).toEqual([]);
        expect(parseReport({ daily: 'x', configurators: [{ kind: 'hack', starts: 1 }] }).configurators).toEqual([]);
    });
});
