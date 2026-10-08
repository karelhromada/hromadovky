// Typy a pomocné funkce pro /admin/analytika (data z RPC admin_analytics_report).
import { supabase } from './supabase';

export interface DailyRow {
    day: string;
    visits: number;
    pageviews: number;
    orders: number;
    revenue: number;
}

export interface SourceRow {
    source: string;
    medium: string;
    visits: number;
    orders: number;
    revenue: number;
}

export interface PageRow {
    path: string;
    pageviews: number;
    visits: number;
}

export interface ProductRow {
    product_id: string;
    views: number;
    added: number;
}

export interface ConfiguratorRow {
    kind: 'custom-kvarteto' | 'custom-pexeso' | 'custom-karty';
    starts: number;
    added: number;
}

export interface AnalyticsReport {
    totals: { visits: number; pageviews: number; orders: number; revenue: number };
    daily: DailyRow[];
    sources: SourceRow[];
    pages: PageRow[];
    devices: { device: string; visits: number }[];
    funnel: { visits: number; view_item: number; add_to_cart: number; begin_checkout: number; purchase: number };
    products: ProductRow[];
    configurators: ConfiguratorRow[];
}

export type RangeDays = 7 | 30 | 90;

const MEDIUM_LABELS: Record<string, string> = {
    none: 'Přímo',
    organic: 'Vyhledávání',
    cpc: 'Placená reklama',
    social: 'Sociální sítě',
    comparison: 'Srovnávače',
    email: 'E-mail',
    ai: 'AI asistent',
    referral: 'Odkaz z webu',
};

const SOURCE_LABELS: Record<string, string> = {
    direct: 'Přímý přístup',
    google: 'Google',
    seznam: 'Seznam',
    bing: 'Bing',
    duckduckgo: 'DuckDuckGo',
    ecosia: 'Ecosia',
    heureka: 'Heureka',
    zbozi: 'Zboží.cz',
    instagram: 'Instagram',
    facebook: 'Facebook',
    pinterest: 'Pinterest',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    x: 'X (Twitter)',
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    gemini: 'Gemini',
    copilot: 'Copilot',
    claude: 'Claude',
    gmail: 'Gmail',
    'seznam-email': 'Seznam e-mail',
    'neznámý': 'Nespárováno',
};

export const mediumLabel = (medium: string): string => MEDIUM_LABELS[medium] ?? medium;

export const sourceLabel = (source: string): string => SOURCE_LABELS[source] ?? source;

/** Podíl v procentech na 1 desetinné místo; null když není z čeho počítat. */
export function ratePercent(part: number, whole: number): number | null {
    if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return null;
    return Math.round((part / whole) * 1000) / 10;
}

export function formatPercent(value: number | null): string {
    return value === null ? '–' : `${value.toLocaleString('cs-CZ')} %`;
}

export function formatCzk(value: number): string {
    return `${Math.round(value).toLocaleString('cs-CZ')} Kč`;
}

/** Lokální datum YYYY-MM-DD (admin je v ČR → odpovídá dnům v DB, které jsou v Europe/Prague). */
export function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function rangeFor(days: RangeDays, today: Date = new Date()): { from: string; to: string } {
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
    return { from: toIsoDate(from), to: toIsoDate(today) };
}

/** Hezké maximum osy (1/2/5 × 10^k) a krok pro ~4 linky mřížky. */
export function niceScale(max: number): { top: number; step: number } {
    if (max <= 0) return { top: 4, step: 1 };
    const rough = max / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const nice = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
    const step = Math.max(1, nice); // počty jsou celá čísla — žádné „0,5 návštěvy" na ose
    const top = Math.max(step, Math.ceil(max / step) * step);
    return { top, step };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : Number(value) || 0);

const arr = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter(isRecord) : []);

/** Odolné převzetí odpovědi RPC — chybějící části se nahradí nulami, ať stránka nespadne. */
export function parseReport(raw: unknown): AnalyticsReport {
    const r = isRecord(raw) ? raw : {};
    const totals = isRecord(r.totals) ? r.totals : {};
    const funnel = isRecord(r.funnel) ? r.funnel : {};
    return {
        totals: {
            visits: num(totals.visits),
            pageviews: num(totals.pageviews),
            orders: num(totals.orders),
            revenue: num(totals.revenue),
        },
        daily: arr(r.daily).map((d) => ({
            day: String(d.day ?? ''),
            visits: num(d.visits),
            pageviews: num(d.pageviews),
            orders: num(d.orders),
            revenue: num(d.revenue),
        })),
        sources: arr(r.sources).map((s) => ({
            source: String(s.source ?? 'direct'),
            medium: String(s.medium ?? 'none'),
            visits: num(s.visits),
            orders: num(s.orders),
            revenue: num(s.revenue),
        })),
        pages: arr(r.pages).map((p) => ({ path: String(p.path ?? ''), pageviews: num(p.pageviews), visits: num(p.visits) })),
        devices: arr(r.devices).map((d) => ({ device: String(d.device ?? 'desktop'), visits: num(d.visits) })),
        funnel: {
            visits: num(funnel.visits),
            view_item: num(funnel.view_item),
            add_to_cart: num(funnel.add_to_cart),
            begin_checkout: num(funnel.begin_checkout),
            purchase: num(funnel.purchase),
        },
        products: arr(r.products).map((p) => ({ product_id: String(p.product_id ?? ''), views: num(p.views), added: num(p.added) })),
        configurators: arr(r.configurators)
            .filter((c) => c.kind === 'custom-kvarteto' || c.kind === 'custom-pexeso' || c.kind === 'custom-karty')
            .map((c) => ({ kind: c.kind as ConfiguratorRow['kind'], starts: num(c.starts), added: num(c.added) })),
    };
}

export async function fetchReport(range: { from: string; to: string }): Promise<AnalyticsReport> {
    const { data, error } = await supabase.rpc('admin_analytics_report', { p_from: range.from, p_to: range.to });
    if (error) throw new Error(error.message);
    return parseReport(data);
}
