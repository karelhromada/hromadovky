import { useEffect, useState } from 'react';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import { AdminNav } from '../components/admin/AdminNav';
import { DailyVisitsChart } from '../components/admin/analytics/DailyVisitsChart';
import {
    Configurators,
    Devices,
    Funnel,
    KpiTiles,
    PagesTable,
    ProductsTable,
    SourcesTable,
} from '../components/admin/analytics/AnalyticsSections';
import { fetchReport, formatCzk, rangeFor, type AnalyticsReport, type RangeDays } from '../lib/analyticsReport';
import './AdminAnalyticsPage.css';

const RANGES: readonly { days: RangeDays; label: string }[] = [
    { days: 7, label: '7 dní' },
    { days: 30, label: '30 dní' },
    { days: 90, label: '90 dní' },
];

type LoadResult =
    | { days: RangeDays; status: 'error'; message: string }
    | { days: RangeDays; status: 'ready'; report: AnalyticsReport };

export default function AdminAnalyticsPage() {
    const [days, setDays] = useState<RangeDays>(30);
    const [result, setResult] = useState<LoadResult | null>(null);
    // Načítá se, dokud výsledek nepatří k právě zvolenému období (bez setState v effectu).
    const state = result && result.days === days ? result : ({ status: 'loading' } as const);

    useEffect(() => {
        let cancelled = false;
        fetchReport(rangeFor(days))
            .then((report) => {
                if (!cancelled) setResult({ days, status: 'ready', report });
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const message = error instanceof Error ? error.message : 'Neznámá chyba';
                setResult({ days, status: 'error', message });
            });
        return () => {
            cancelled = true;
        };
    }, [days]);

    return (
        <div className="an-page">
            <PageHead {...SEO.adminAnalytics} />
            <AdminNav />
            <header className="an-header">
                <div>
                    <h1>Analytika</h1>
                    <p className="an-muted">
                        Vlastní měření bez cookies: započítá každou návštěvu. Jedna návštěva = jedno zařízení za den.
                    </p>
                </div>
                <div className="an-range" role="group" aria-label="Období">
                    {RANGES.map((r) => (
                        <button
                            key={r.days}
                            type="button"
                            className={r.days === days ? 'an-range-btn is-active' : 'an-range-btn'}
                            aria-pressed={r.days === days}
                            onClick={() => setDays(r.days)}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </header>

            {state.status === 'loading' && <p className="an-empty">Načítám statistiky…</p>}
            {state.status === 'error' && (
                <p className="an-error" role="alert">
                    Statistiky se nepodařilo načíst ({state.message}). Zkuste stránku obnovit; pokud chyba trvá,
                    nejspíš ještě není v databázi nasazená migrace analytiky.
                </p>
            )}
            {state.status === 'ready' && <Dashboard report={state.report} />}
        </div>
    );
}

function Dashboard({ report }: { report: AnalyticsReport }) {
    return (
        <>
            <KpiTiles totals={report.totals} />

            <section className="an-card">
                <h2>Návštěvy po dnech</h2>
                <DailyVisitsChart rows={report.daily} />
                <details className="an-details">
                    <summary>Zobrazit jako tabulku</summary>
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr>
                                    <th>Den</th>
                                    <th className="an-num">Návštěvy</th>
                                    <th className="an-num">Zobrazení</th>
                                    <th className="an-num">Objednávky</th>
                                    <th className="an-num">Tržby</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.daily.map((d) => (
                                    <tr key={d.day}>
                                        <td>{d.day}</td>
                                        <td className="an-num">{d.visits}</td>
                                        <td className="an-num">{d.pageviews}</td>
                                        <td className="an-num">{d.orders}</td>
                                        <td className="an-num">{formatCzk(d.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>
            </section>

            <section className="an-card">
                <h2>Odkud lidé přicházejí</h2>
                <p className="an-muted">
                    Tržby jsou za zboží (bez dopravy) podle skutečných objednávek. „Nespárováno“ = objednávka, u které
                    web nezachytil návštěvu (např. blokátor reklam).
                </p>
                <SourcesTable sources={report.sources} />
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Nákupní trychtýř</h2>
                    <Funnel funnel={report.funnel} />
                </section>
                <section className="an-card">
                    <h2>Zařízení</h2>
                    <Devices devices={report.devices} />
                </section>
            </div>

            <section className="an-card">
                <h2>Karty z vlastních fotek</h2>
                <Configurators rows={report.configurators} />
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Nejnavštěvovanější stránky</h2>
                    <PagesTable pages={report.pages} />
                </section>
                <section className="an-card">
                    <h2>Produkty</h2>
                    <ProductsTable products={report.products} />
                </section>
            </div>
        </>
    );
}
