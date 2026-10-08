// Sekce dashboardu /admin/analytika. Jedna série = jedna barva (zlatá), text v barvách písma.
import { listProducts, type ProductCategory } from '../../../data/catalog';
import {
    formatCzk,
    formatPercent,
    mediumLabel,
    ratePercent,
    sourceLabel,
    type AnalyticsReport,
} from '../../../lib/analyticsReport';

interface BarRowProps {
    label: string;
    value: number;
    max: number;
    note?: string;
}

/** Vodorovný pruh: popisek, pruh úměrný hodnotě, číslo za koncem pruhu. */
export function BarRow({ label, value, max, note }: BarRowProps) {
    const pct = max > 0 ? Math.max(value > 0 ? 1 : 0, (value / max) * 100) : 0;
    return (
        <div className="an-barrow">
            <span className="an-barrow-label">{label}</span>
            <span className="an-barrow-track">
                <span className="an-barrow-fill" style={{ width: `${pct}%` }} />
                <span className="an-barrow-value">
                    {value.toLocaleString('cs-CZ')}
                    {note && <span className="an-muted"> · {note}</span>}
                </span>
            </span>
        </div>
    );
}

const PRODUCT_NAMES: ReadonlyMap<string, string> = new Map(
    (['kvarteta', 'pexeso', 'karty'] as ProductCategory[]).flatMap((category) =>
        listProducts(category).map((product) => [product.id, product.name] as const),
    ),
);

const CONFIGURATOR_LABELS = {
    'custom-kvarteto': 'Vlastní kvarteto',
    'custom-pexeso': 'Pexeso z fotek',
    'custom-karty': 'Hrací karty z fotek',
} as const;

const DEVICE_LABELS: Record<string, string> = { mobile: 'Mobil', desktop: 'Počítač', tablet: 'Tablet' };

export function KpiTiles({ totals }: { totals: AnalyticsReport['totals'] }) {
    const tiles = [
        { label: 'Návštěvy', value: totals.visits.toLocaleString('cs-CZ') },
        { label: 'Zobrazení stránek', value: totals.pageviews.toLocaleString('cs-CZ') },
        { label: 'Objednávky', value: totals.orders.toLocaleString('cs-CZ') },
        { label: 'Tržby za zboží', value: formatCzk(totals.revenue) },
        { label: 'Konverzní poměr', value: formatPercent(ratePercent(totals.orders, totals.visits)) },
    ];
    return (
        <div className="an-kpis">
            {tiles.map((tile) => (
                <div key={tile.label} className="an-kpi">
                    <span className="an-kpi-label">{tile.label}</span>
                    <span className="an-kpi-value">{tile.value}</span>
                </div>
            ))}
        </div>
    );
}

export function SourcesTable({ sources }: { sources: AnalyticsReport['sources'] }) {
    const max = Math.max(0, ...sources.map((s) => s.visits));
    if (sources.length === 0) return <p className="an-empty">Zatím žádné návštěvy.</p>;
    return (
        <div className="an-table-wrap">
            <table className="an-table">
                <thead>
                    <tr>
                        <th>Zdroj</th>
                        <th>Typ</th>
                        <th className="an-wide">Návštěvy</th>
                        <th className="an-num">Objednávky</th>
                        <th className="an-num">Tržby</th>
                        <th className="an-num">Konverze</th>
                    </tr>
                </thead>
                <tbody>
                    {sources.map((s) => (
                        <tr key={`${s.source}|${s.medium}`}>
                            <td>{sourceLabel(s.source)}</td>
                            <td className="an-muted">{s.source === 'neznámý' ? '–' : mediumLabel(s.medium)}</td>
                            <td className="an-wide">
                                <BarRow label="" value={s.visits} max={max} />
                            </td>
                            <td className="an-num">{s.orders}</td>
                            <td className="an-num">{formatCzk(s.revenue)}</td>
                            <td className="an-num">{formatPercent(ratePercent(s.orders, s.visits))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Funnel({ funnel }: { funnel: AnalyticsReport['funnel'] }) {
    const steps = [
        { label: 'Návštěva webu', value: funnel.visits },
        { label: 'Prohlédl si produkt', value: funnel.view_item },
        { label: 'Přidal do košíku', value: funnel.add_to_cart },
        { label: 'Otevřel pokladnu', value: funnel.begin_checkout },
        { label: 'Objednal', value: funnel.purchase },
    ];
    return (
        <div className="an-bars">
            {steps.map((step, i) => (
                <BarRow
                    key={step.label}
                    label={step.label}
                    value={step.value}
                    max={funnel.visits}
                    note={i === 0 ? undefined : `${formatPercent(ratePercent(step.value, funnel.visits))} návštěv`}
                />
            ))}
        </div>
    );
}

export function PagesTable({ pages }: { pages: AnalyticsReport['pages'] }) {
    if (pages.length === 0) return <p className="an-empty">Zatím žádná data.</p>;
    const max = Math.max(...pages.map((p) => p.pageviews));
    return (
        <div className="an-bars">
            {pages.map((p) => (
                <BarRow key={p.path} label={p.path} value={p.pageviews} max={max} note={`${p.visits.toLocaleString('cs-CZ')} návštěv`} />
            ))}
        </div>
    );
}

export function ProductsTable({ products }: { products: AnalyticsReport['products'] }) {
    if (products.length === 0) return <p className="an-empty">Zatím nikdo neotevřel detail produktu.</p>;
    return (
        <div className="an-table-wrap">
            <table className="an-table">
                <thead>
                    <tr>
                        <th>Produkt</th>
                        <th className="an-num">Zobrazení detailu</th>
                        <th className="an-num">Do košíku</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.product_id}>
                            <td>{PRODUCT_NAMES.get(p.product_id) ?? p.product_id}</td>
                            <td className="an-num">{p.views}</td>
                            <td className="an-num">{p.added}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Configurators({ rows }: { rows: AnalyticsReport['configurators'] }) {
    return (
        <div className="an-table-wrap">
            <table className="an-table">
                <thead>
                    <tr>
                        <th>Konfigurátor</th>
                        <th className="an-num">Nahráli fotku</th>
                        <th className="an-num">Přidali do košíku</th>
                        <th className="an-num">Dokončení</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((c) => (
                        <tr key={c.kind}>
                            <td>{CONFIGURATOR_LABELS[c.kind]}</td>
                            <td className="an-num">{c.starts}</td>
                            <td className="an-num">{c.added}</td>
                            <td className="an-num">{formatPercent(ratePercent(c.added, c.starts))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Devices({ devices }: { devices: AnalyticsReport['devices'] }) {
    const total = devices.reduce((sum, d) => sum + d.visits, 0);
    if (total === 0) return <p className="an-empty">Zatím žádná data.</p>;
    return (
        <div className="an-bars">
            {devices.map((d) => (
                <BarRow
                    key={d.device}
                    label={DEVICE_LABELS[d.device] ?? d.device}
                    value={d.visits}
                    max={total}
                    note={formatPercent(ratePercent(d.visits, total))}
                />
            ))}
        </div>
    );
}
