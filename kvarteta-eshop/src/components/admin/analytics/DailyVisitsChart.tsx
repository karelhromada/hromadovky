import { useEffect, useRef, useState } from 'react';
import { formatCzk, niceScale, type DailyRow } from '../../../lib/analyticsReport';

interface DailyVisitsChartProps {
    rows: readonly DailyRow[];
}

const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 36 };
const MAX_BAR = 24;
const GAP = 2;
const RADIUS = 4;

/** Sloupec se zaobleným vrcholem a rovnou základnou. */
function columnPath(x: number, y: number, width: number, height: number): string {
    const r = Math.min(RADIUS, width / 2, height);
    const bottom = y + height;
    return `M${x},${bottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${bottom} Z`;
}

const dayLabel = (iso: string): string => {
    const [, m, d] = iso.split('-');
    return `${Number(d)}. ${Number(m)}.`;
};

export function DailyVisitsChart({ rows }: DailyVisitsChartProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(640);
    const [active, setActive] = useState<number | null>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const plotW = width - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const band = rows.length > 0 ? plotW / rows.length : plotW;
    const barW = Math.max(2, Math.min(MAX_BAR, band - GAP));
    const { top, step } = niceScale(Math.max(0, ...rows.map((r) => r.visits)));
    const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
    const labelEvery = Math.max(1, Math.ceil(rows.length / Math.floor(plotW / 56)));
    const activeRow = active === null ? null : rows[active];
    const tooltipLeft = active === null ? 0 : PAD.left + band * active + band / 2;

    return (
        <div className="an-chart" ref={wrapRef} onMouseLeave={() => setActive(null)}>
            <svg width={width} height={HEIGHT} role="img" aria-label="Návštěvy po dnech">
                {ticks.map((t) => {
                    const y = PAD.top + plotH - (t / top) * plotH;
                    return (
                        <g key={t}>
                            <line className="an-grid" x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} />
                            <text className="an-axis" x={PAD.left - 6} y={y} dy="0.32em" textAnchor="end">
                                {t.toLocaleString('cs-CZ')}
                            </text>
                        </g>
                    );
                })}
                {rows.map((row, i) => {
                    const h = (row.visits / top) * plotH;
                    const x = PAD.left + band * i + (band - barW) / 2;
                    return (
                        <g key={row.day}>
                            {h > 0 && (
                                <path
                                    className={i === active ? 'an-bar is-active' : 'an-bar'}
                                    d={columnPath(x, PAD.top + plotH - h, barW, h)}
                                />
                            )}
                            {/* Zásahová plocha přes celý pás — snadný hover i na úzkých sloupcích */}
                            <rect
                                className="an-hit"
                                x={PAD.left + band * i}
                                y={PAD.top}
                                width={band}
                                height={plotH}
                                tabIndex={0}
                                aria-label={`${dayLabel(row.day)}: ${row.visits} návštěv, ${row.orders} objednávek`}
                                onMouseEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onBlur={() => setActive(null)}
                            />
                            {i % labelEvery === 0 && (
                                <text className="an-axis" x={PAD.left + band * i + band / 2} y={HEIGHT - 8} textAnchor="middle">
                                    {dayLabel(row.day)}
                                </text>
                            )}
                        </g>
                    );
                })}
                <line className="an-baseline" x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} />
            </svg>
            {activeRow && (
                <div
                    className="an-tooltip"
                    style={{ left: Math.min(Math.max(tooltipLeft, 90), width - 90), top: PAD.top }}
                    role="status"
                >
                    <strong>{dayLabel(activeRow.day)}</strong>
                    <span>{activeRow.visits.toLocaleString('cs-CZ')} návštěv</span>
                    <span>{activeRow.pageviews.toLocaleString('cs-CZ')} zobrazení</span>
                    <span>
                        {activeRow.orders} obj. · {formatCzk(activeRow.revenue)}
                    </span>
                </div>
            )}
        </div>
    );
}
