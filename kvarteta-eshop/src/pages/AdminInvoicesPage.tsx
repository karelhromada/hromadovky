import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Invoice, InvoiceStatus, InvoiceType } from '../types/invoice';
import {
  listInvoices,
  markInvoiceCancelled,
  markInvoicePaid,
  openInvoiceView,
  type InvoiceFilters,
} from '../lib/invoices';
import { CreditNoteModal } from '../components/admin/CreditNoteModal';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import './AdminInvoicesPage.css';

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  unpaid: 'Neuhrazená',
  paid: 'Uhrazená',
  cancelled: 'Zrušená',
  refunded: 'Vrácená (dobropis)',
};

const TYPE_LABEL: Record<InvoiceType, string> = {
  invoice: 'Faktura',
  credit_note: 'Dobropis',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(
    amount,
  );

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ');

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>({ type: 'all', status: 'all', search: '' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creditNoteFor, setCreditNoteFor] = useState<Invoice | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInvoices(filters);
      setInvoices(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst faktury.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleMarkPaid = async (invoice: Invoice) => {
    if (!confirm(`Označit fakturu ${invoice.number} jako zaplacenou?`)) return;
    setBusyId(invoice.id);
    try {
      await markInvoicePaid(invoice.id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Operace selhala.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (invoice: Invoice) => {
    if (!confirm(`Označit fakturu ${invoice.number} jako zrušenou?\nZrušení použij pro neuhrazené, které zákazník stornoval.`)) return;
    setBusyId(invoice.id);
    try {
      await markInvoiceCancelled(invoice.id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Operace selhala.');
    } finally {
      setBusyId(null);
    }
  };

  const handleView = (invoice: Invoice) => {
    openInvoiceView(invoice);
  };

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        if (inv.type === 'invoice') {
          acc.invoiceCount += 1;
          if (inv.status === 'unpaid') acc.unpaidTotal += Number(inv.total);
          if (inv.status === 'paid') acc.paidTotal += Number(inv.total);
        } else {
          acc.creditNoteCount += 1;
          acc.refundedTotal += Math.abs(Number(inv.total));
        }
        return acc;
      },
      { invoiceCount: 0, creditNoteCount: 0, unpaidTotal: 0, paidTotal: 0, refundedTotal: 0 },
    );
  }, [invoices]);

  return (
    <div className="admin-invoices-container">
      <PageHead {...SEO.adminInvoices} />
      <header className="admin-invoices-header">
        <h1>Faktury a dobropisy</h1>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Faktur</span>
            <span className="stat-value">{stats.invoiceCount}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Dobropisů</span>
            <span className="stat-value">{stats.creditNoteCount}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Neuhrazeno</span>
            <span className="stat-value warning">{formatCurrency(stats.unpaidTotal)}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Uhrazeno</span>
            <span className="stat-value success">{formatCurrency(stats.paidTotal)}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Vráceno</span>
            <span className="stat-value danger">{formatCurrency(stats.refundedTotal)}</span>
          </div>
        </div>
      </header>

      <section className="admin-filters glass-panel">
        <div className="filter-row">
          <label>
            Typ
            <select
              value={filters.type ?? 'all'}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value as InvoiceType | 'all' }))}
            >
              <option value="all">Vše</option>
              <option value="invoice">Faktury</option>
              <option value="credit_note">Dobropisy</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={filters.status ?? 'all'}
              onChange={(e) =>
                setFilters((p) => ({ ...p, status: e.target.value as InvoiceStatus | 'all' }))
              }
            >
              <option value="all">Vše</option>
              <option value="unpaid">Neuhrazené</option>
              <option value="paid">Uhrazené</option>
              <option value="cancelled">Zrušené</option>
              <option value="refunded">Vrácené</option>
            </select>
          </label>
          <label>
            Od
            <input
              type="date"
              value={filters.fromDate ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value || undefined }))}
            />
          </label>
          <label>
            Do
            <input
              type="date"
              value={filters.toDate ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value || undefined }))}
            />
          </label>
          <label className="filter-search">
            Hledat
            <input
              type="search"
              placeholder="Číslo, email, příjmení, VS"
              value={filters.search ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </label>
        </div>
      </section>

      {loading && <p className="admin-empty">Načítám…</p>}
      {error && <p className="admin-empty admin-error">{error}</p>}

      {!loading && !error && (
        <div className="admin-invoices-table-wrap glass-panel">
          <table className="admin-invoices-table">
            <thead>
              <tr>
                <th>Číslo</th>
                <th>Typ</th>
                <th>Datum vystavení</th>
                <th>Splatnost</th>
                <th>Zákazník</th>
                <th>Částka</th>
                <th>Status</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Žádné záznamy odpovídající filtrům.
                  </td>
                </tr>
              )}
              {invoices.map((invoice) => {
                const customerName =
                  invoice.customer.companyName ||
                  `${invoice.customer.firstName} ${invoice.customer.lastName}`.trim();
                const isCreditNote = invoice.type === 'credit_note';
                return (
                  <tr key={invoice.id} className={isCreditNote ? 'row-credit-note' : ''}>
                    <td className="cell-number">{invoice.number}</td>
                    <td>{TYPE_LABEL[invoice.type]}</td>
                    <td>{formatDate(invoice.issued_at)}</td>
                    <td>{formatDate(invoice.due_at)}</td>
                    <td>
                      <div className="customer-cell">
                        <span>{customerName || '—'}</span>
                        <span className="customer-email">{invoice.customer.email}</span>
                      </div>
                    </td>
                    <td className={isCreditNote ? 'amount-negative' : ''}>
                      {formatCurrency(Number(invoice.total))}
                    </td>
                    <td>
                      <span className={`status-pill status-${invoice.status}`}>
                        {STATUS_LABEL[invoice.status]}
                      </span>
                    </td>
                    <td className="cell-actions">
                      {invoice.type === 'invoice' && invoice.status === 'unpaid' && (
                        <>
                          <button
                            type="button"
                            className="btn-action btn-success"
                            disabled={busyId === invoice.id}
                            onClick={() => void handleMarkPaid(invoice)}
                          >
                            Zaplaceno
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-warning"
                            disabled={busyId === invoice.id}
                            onClick={() => void handleCancel(invoice)}
                          >
                            Zrušit
                          </button>
                        </>
                      )}
                      {invoice.type === 'invoice' && invoice.status === 'paid' && (
                        <button
                          type="button"
                          className="btn-action btn-danger"
                          onClick={() => setCreditNoteFor(invoice)}
                        >
                          Dobropis
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-action btn-secondary"
                        title="Zobrazit fakturu"
                        onClick={() => handleView(invoice)}
                      >
                        Zobrazit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creditNoteFor && (
        <CreditNoteModal
          invoice={creditNoteFor}
          onClose={() => setCreditNoteFor(null)}
          onCreated={async () => {
            setCreditNoteFor(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}
