import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AUTOMATION_CONFIG } from '../../config/payment';
import type { Invoice } from '../../types/invoice';
import './CreditNoteModal.css';

interface CreditNoteModalProps {
  invoice: Invoice;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(
    amount,
  );

export function CreditNoteModal({ invoice, onClose, onCreated }: CreditNoteModalProps) {
  const [reason, setReason] = useState('');
  const [scope, setScope] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPartialAmount(Number(invoice.total).toString());
  }, [invoice.total]);

  const validate = (): { ok: true; amount: number } | { ok: false; reason: string } => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      return { ok: false, reason: 'Důvod opravy musí mít alespoň 5 znaků (zákonná povinnost).' };
    }
    if (scope === 'full') {
      return { ok: true, amount: Number(invoice.total) };
    }
    const parsed = Number(partialAmount.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { ok: false, reason: 'Zadejte částku větší než 0.' };
    }
    if (parsed > Number(invoice.total)) {
      return { ok: false, reason: 'Částečný dobropis nesmí přesáhnout původní fakturu.' };
    }
    return { ok: true, amount: parsed };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validate();
    if (!validation.ok) {
      setError(validation.reason);
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error('Chybí přihlašovací token. Přihlas se prosím znovu.');
      }

      const response = await fetch(AUTOMATION_CONFIG.N8N_CREDIT_NOTE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          original_invoice_id: invoice.id,
          original_invoice_number: invoice.number,
          reason: reason.trim(),
          scope,
          amount: validation.amount,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`n8n vrátilo ${response.status}: ${text || 'neznámá chyba'}`);
      }

      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Vystavení dobropisu selhalo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="credit-note-overlay" onClick={onClose}>
      <div className="credit-note-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <header className="credit-note-header">
          <h2>Vystavit dobropis</h2>
          <p>
            K faktuře <strong>{invoice.number}</strong> ze dne {new Date(invoice.issued_at).toLocaleDateString('cs-CZ')}, celková částka{' '}
            <strong>{formatCurrency(Number(invoice.total))}</strong>.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="credit-note-form">
          <div className="form-group">
            <label htmlFor="cn-reason">Důvod opravy</label>
            <textarea
              id="cn-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Např. Odstoupení od smlouvy v 14denní lhůtě, reklamace, oprava chyby v účtování."
              required
            />
            <span className="form-hint">
              Povinná položka opravného účetního dokladu — bude zobrazena na PDF dobropisu.
            </span>
          </div>

          <div className="form-group">
            <span className="form-group-label">Rozsah dobropisu</span>
            <label className="radio-row">
              <input
                type="radio"
                name="scope"
                value="full"
                checked={scope === 'full'}
                onChange={() => setScope('full')}
              />
              <span>Plný dobropis ({formatCurrency(Number(invoice.total))})</span>
            </label>
            <label className="radio-row">
              <input
                type="radio"
                name="scope"
                value="partial"
                checked={scope === 'partial'}
                onChange={() => setScope('partial')}
              />
              <span>Částečný dobropis</span>
            </label>
            {scope === 'partial' && (
              <input
                type="number"
                min="1"
                max={Number(invoice.total)}
                step="1"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                className="partial-amount-input"
                placeholder="Částka v Kč"
              />
            )}
          </div>

          {error && <p className="credit-note-error">{error}</p>}

          <div className="credit-note-actions">
            <button type="button" className="btn-text" onClick={onClose} disabled={submitting}>
              Zrušit
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Vystavuji…' : 'Vystavit dobropis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
