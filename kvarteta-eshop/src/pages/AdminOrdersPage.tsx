import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrderItem, OrderSubmission } from '../types/order';
import {
  downloadAllImages,
  downloadOrderImage,
  getSignedImageUrls,
  listOrderSubmissions,
  type OrderFilters,
} from '../lib/orders';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import { buildCardBackRef, resolveBackName } from '../data/backgrounds';
import { listProducts } from '../data/catalog';
import './AdminOrdersPage.css';

// Líc hotových sad se dohledává z katalogu podle id položky (custom položky v katalogu nejsou —
// jejich líc jsou rendery/originály níže).
const PRODUCT_BY_ID = new Map(
  (['kvarteta', 'karty', 'pexeso'] as const).flatMap(c => listProducts(c)).map(p => [p.id, p]),
);

const STATUS_LABEL: Record<string, string> = {
  received: 'Přijatá',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ');
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' });

const pathBasename = (path: string) => path.split('/').pop() ?? path;
const pathExt = (path: string) => pathBasename(path).split('.').pop() ?? 'jpg';

/** Cesty k originálům fotek položky (per-item pole s fallbackem na starší tvary) */
const itemPhotoPaths = (item: OrderItem): string[] =>
  item.photoPaths ?? [...(item.customPhotoPaths ?? []), ...Object.values(item.customPhotos ?? {})];

const itemRenderPaths = (item: OrderItem): string[] => item.renderedCardPaths ?? [];

interface GalleryProps {
  title: string;
  entries: Array<{ path: string; filename: string }>;
  signedUrls: Map<string, string>;
  downloadKey: string;
  downloadingKey: string | null;
  onDownloadAll: (key: string, entries: Array<{ path: string; filename: string }>) => void;
}

function ImageGallery({ title, entries, signedUrls, downloadKey, downloadingKey, onDownloadAll }: GalleryProps) {
  if (entries.length === 0) return null;
  const busy = downloadingKey !== null;
  return (
    <div className="admin-orders-gallery-section">
      <div className="gallery-section-header">
        <h4>
          {title} <span className="gallery-count">({entries.length})</span>
        </h4>
        <button
          type="button"
          className="btn-action btn-secondary"
          disabled={busy}
          onClick={() => onDownloadAll(downloadKey, entries)}
        >
          {downloadingKey === downloadKey ? 'Stahuji…' : 'Stáhnout vše'}
        </button>
      </div>
      <div className="admin-orders-gallery">
        {entries.map(({ path, filename }) => {
          const url = signedUrls.get(path);
          return (
            <figure key={path} className="gallery-item">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" title="Otevřít v plné kvalitě">
                  <img src={url} alt={filename} loading="lazy" />
                </a>
              ) : (
                <div className="gallery-missing">Nedostupné</div>
              )}
              <figcaption>
                <span className="gallery-filename" title={filename}>{filename}</span>
                {url && (
                  <button
                    type="button"
                    className="btn-action btn-secondary"
                    disabled={busy}
                    onClick={() => void downloadOrderImage(path, filename).catch(() => alert('Stažení selhalo.'))}
                  >
                    Stáhnout
                  </button>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({ search: '' });
  const [selected, setSelected] = useState<OrderSubmission | null>(null);
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  const [signedError, setSignedError] = useState<string | null>(null);
  const [signedLoading, setSignedLoading] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrderSubmissions(filters);
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst objednávky.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Při otevření detailu podepsat všechny cesty jedním batch requestem
  useEffect(() => {
    if (!selected) return;
    const allPaths = [
      ...(selected.rendered_paths ?? []),
      ...(selected.photo_paths ?? []),
      ...selected.items.flatMap(item => [...itemRenderPaths(item), ...itemPhotoPaths(item)]),
    ];
    setSignedUrls(new Map());
    setSignedError(null);
    setSignedLoading(true);
    getSignedImageUrls(allPaths)
      .then(setSignedUrls)
      .catch(e => setSignedError(e instanceof Error ? e.message : 'Nepodařilo se načíst obrázky.'))
      .finally(() => setSignedLoading(false));
  }, [selected]);

  const handleDownloadAll = useCallback(
    (key: string, entries: Array<{ path: string; filename: string }>) => {
      setDownloadingKey(key);
      void downloadAllImages(entries)
        .then(failed => {
          if (failed.length > 0) alert(`Nepodařilo se stáhnout ${failed.length} souborů.`);
        })
        .finally(() => setDownloadingKey(null));
    },
    [],
  );

  const stats = useMemo(
    () => ({
      count: orders.length,
      total: orders.reduce((sum, o) => sum + Number(o.total_to_pay || 0), 0),
    }),
    [orders],
  );

  // Cesty z root polí, které nepokrývá žádná položka (starší objednávky bez per-item polí)
  const leftoverEntries = useMemo(() => {
    if (!selected) return { renders: [], photos: [] };
    const covered = new Set(selected.items.flatMap(item => [...itemRenderPaths(item), ...itemPhotoPaths(item)]));
    const vs = selected.variable_symbol;
    return {
      renders: (selected.rendered_paths ?? [])
        .filter(p => !covered.has(p))
        .map(p => ({ path: p, filename: `VS${vs}-${pathBasename(p)}` })),
      photos: (selected.photo_paths ?? [])
        .filter(p => !covered.has(p))
        .map((p, i) => ({ path: p, filename: `VS${vs}-original-${String(i + 1).padStart(2, '0')}.${pathExt(p)}` })),
    };
  }, [selected]);

  if (selected) {
    const vs = selected.variable_symbol;
    const customer = selected.customer;
    const customerName = customer.companyName || `${customer.firstName} ${customer.lastName}`.trim();
    return (
      <div className="admin-orders-container">
        <PageHead {...SEO.adminOrders} />
        <button type="button" className="btn-action btn-secondary back-btn" onClick={() => setSelected(null)}>
          ← Zpět na seznam
        </button>

        <header className="admin-orders-header">
          <h1>Objednávka VS {vs}</h1>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="stat-label">Datum</span>
              <span className="stat-value">{formatDateTime(selected.created_at)}</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-label">Status</span>
              <span className={`status-pill status-${selected.status}`}>
                {STATUS_LABEL[selected.status] ?? selected.status}
              </span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-label">Celkem k úhradě</span>
              <span className="stat-value success">{formatCurrency(Number(selected.total_to_pay))}</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-label">Doprava / platba</span>
              <span className="stat-value small">
                {selected.delivery_method ?? '—'} / {selected.payment_method ?? '—'}
              </span>
            </div>
          </div>
        </header>

        <section className="glass-panel customer-panel">
          <h3>Zákazník</h3>
          <p>
            <strong>{customerName || '—'}</strong> · {customer.email} · {customer.phone}
            <br />
            {customer.street}, {customer.zip} {customer.city}
            {customer.isB2B && (
              <>
                <br />
                IČO: {customer.ico ?? '—'} · DIČ: {customer.dic ?? '—'}
              </>
            )}
            {selected.pickup_point && (
              <>
                <br />
                Výdejní místo: {selected.pickup_point}
              </>
            )}
            {selected.note && (
              <>
                <br />
                Poznámka: {selected.note}
              </>
            )}
          </p>
        </section>

        {signedLoading && <p className="admin-empty">Načítám obrázky…</p>}
        {signedError && <p className="admin-empty admin-error">{signedError}</p>}

        {selected.items.map((item, idx) => {
          const renderEntries = itemRenderPaths(item).map(p => ({
            path: p,
            filename: `VS${vs}-${pathBasename(p)}`,
          }));
          const photoEntries = itemPhotoPaths(item).map((p, i) => ({
            path: p,
            filename: `VS${vs}-original-${String(i + 1).padStart(2, '0')}.${pathExt(p)}`,
          }));
          const product = PRODUCT_BY_ID.get(item.id);
          // Starší objednávky mají cardBackRef null, ale options.back nese URL/název rubu
          const backRef = item.cardBackRef ?? buildCardBackRef(item.options?.back) ?? null;
          return (
            <section key={`${item.id}-${idx}`} className="glass-panel item-panel">
              <h3>
                {item.name} <span className="item-qty">×{item.quantity}</span>
                <span className="item-price">{formatCurrency(Number(item.total ?? item.price))}</span>
              </h3>
              {item.options && (
                <p className="item-options">
                  {item.options.size && <>Rozměr: {item.options.size} · </>}
                  {item.options.packaging && <>Balení: {item.options.packaging} · </>}
                  {item.options.back && <>Rub: {resolveBackName(item.options.back)}</>}
                  {item.options.note && (
                    <>
                      <br />
                      Poznámka: {item.options.note}
                    </>
                  )}
                </p>
              )}
              {product && (
                <div className="admin-orders-gallery-section">
                  <div className="gallery-section-header">
                    <h4>
                      🃏 Líc — {product.name} <span className="gallery-count">(náhled z katalogu)</span>
                    </h4>
                  </div>
                  <div className="admin-orders-gallery">
                    {product.gallery.slice(0, 4).map(img => {
                      const url = encodeURI(img);
                      return (
                        <figure key={img} className="gallery-item">
                          <a href={url} target="_blank" rel="noopener noreferrer" title="Otevřít v plné kvalitě">
                            <img src={url} alt={product.name} loading="lazy" />
                          </a>
                        </figure>
                      );
                    })}
                  </div>
                </div>
              )}
              <ImageGallery
                title="🎴 Karty k tisku"
                entries={renderEntries}
                signedUrls={signedUrls}
                downloadKey={`renders-${idx}`}
                downloadingKey={downloadingKey}
                onDownloadAll={handleDownloadAll}
              />
              <ImageGallery
                title="🖼️ Originály fotek"
                entries={photoEntries}
                signedUrls={signedUrls}
                downloadKey={`photos-${idx}`}
                downloadingKey={downloadingKey}
                onDownloadAll={handleDownloadAll}
              />
              {backRef?.publicUrl && (
                <div className="admin-orders-gallery-section">
                  <div className="gallery-section-header">
                    <h4>🎨 Rub karet — {backRef.name}</h4>
                  </div>
                  <div className="admin-orders-gallery">
                    <figure className="gallery-item">
                      <a href={backRef.publicUrl} target="_blank" rel="noopener noreferrer">
                        <img src={backRef.publicUrl} alt={backRef.name} loading="lazy" />
                      </a>
                      <figcaption>
                        <span className="gallery-filename">{backRef.name}</span>
                      </figcaption>
                    </figure>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {(leftoverEntries.renders.length > 0 || leftoverEntries.photos.length > 0) && (
          <section className="glass-panel item-panel">
            <h3>Další soubory objednávky</h3>
            <ImageGallery
              title="🎴 Karty k tisku"
              entries={leftoverEntries.renders}
              signedUrls={signedUrls}
              downloadKey="leftover-renders"
              downloadingKey={downloadingKey}
              onDownloadAll={handleDownloadAll}
            />
            <ImageGallery
              title="🖼️ Originály fotek"
              entries={leftoverEntries.photos}
              signedUrls={signedUrls}
              downloadKey="leftover-photos"
              downloadingKey={downloadingKey}
              onDownloadAll={handleDownloadAll}
            />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <PageHead {...SEO.adminOrders} />
      <header className="admin-orders-header">
        <h1>Objednávky</h1>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Objednávek</span>
            <span className="stat-value">{stats.count}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Součet k úhradě</span>
            <span className="stat-value success">{formatCurrency(stats.total)}</span>
          </div>
        </div>
      </header>

      <section className="admin-filters glass-panel">
        <div className="filter-row">
          <label>
            Od
            <input
              type="date"
              value={filters.fromDate ?? ''}
              onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value || undefined }))}
            />
          </label>
          <label>
            Do
            <input
              type="date"
              value={filters.toDate ?? ''}
              onChange={e => setFilters(p => ({ ...p, toDate: e.target.value || undefined }))}
            />
          </label>
          <label className="filter-search">
            Hledat
            <input
              type="search"
              placeholder="VS, email, příjmení"
              value={filters.search ?? ''}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </label>
        </div>
      </section>

      {loading && <p className="admin-empty">Načítám…</p>}
      {error && <p className="admin-empty admin-error">{error}</p>}

      {!loading && !error && (
        <div className="admin-orders-table-wrap glass-panel">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>VS</th>
                <th>Datum</th>
                <th>Zákazník</th>
                <th>Položky</th>
                <th>Fotek</th>
                <th>Celkem</th>
                <th>Status</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Žádné objednávky odpovídající filtrům.
                  </td>
                </tr>
              )}
              {orders.map(order => {
                const customerName =
                  order.customer.companyName ||
                  `${order.customer.firstName} ${order.customer.lastName}`.trim();
                const itemsSummary = order.items.map(i => `${i.name} ×${i.quantity}`).join(', ');
                const photoCount = (order.photo_paths ?? []).length;
                const renderCount = (order.rendered_paths ?? []).length;
                return (
                  <tr key={order.id}>
                    <td className="cell-number">{order.variable_symbol}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <div className="customer-cell">
                        <span>{customerName || '—'}</span>
                        <span className="customer-email">{order.customer.email}</span>
                      </div>
                    </td>
                    <td className="cell-items" title={itemsSummary}>
                      {itemsSummary}
                    </td>
                    <td>
                      {photoCount + renderCount > 0 ? `${renderCount} + ${photoCount}` : '—'}
                    </td>
                    <td>{formatCurrency(Number(order.total_to_pay))}</td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn-action btn-secondary"
                        onClick={() => setSelected(order)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
