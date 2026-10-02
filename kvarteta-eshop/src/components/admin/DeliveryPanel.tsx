import { useState } from 'react';
import type { OrderSubmission } from '../../types/order';
import { markOrderDelivered, unmarkOrderDelivered } from '../../lib/orders';
import { SURVEY_SOURCES } from '../../data/survey';
import './DeliveryPanel.css';

// Musí odpovídat pravidlům v SQL funkci claim_due_survey_emails().
const FIRST_EMAIL_AFTER_DAYS = 2;
const REMINDER_AFTER_DAYS = 7;
const MAX_DELIVERY_AGE_DAYS = 30;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const SOURCE_LABEL = new Map(SURVEY_SOURCES.map(s => [s.key, s.label]));

// Vše se počítá v pražských kalendářních dnech (YYYY-MM-DD) — stejně jako SQL,
// nezávisle na časovém pásmu prohlížeče.
const PRAGUE_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague' });
const DAY_MS = 86_400_000;

const pragueDay = (value: Date | string): string => PRAGUE_DATE.format(new Date(value));
const dayToMs = (day: string): number => Date.parse(`${day}T00:00:00Z`);
const addDays = (day: string, days: number): string =>
  new Date(dayToMs(day) + days * DAY_MS).toISOString().slice(0, 10);
const daysBetween = (from: string, to: string): number => Math.round((dayToMs(to) - dayToMs(from)) / DAY_MS);
const formatDay = (day: string): string => {
  const [year, month, date] = day.split('-').map(Number);
  return `${date}. ${month}. ${year}`;
};

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === 'object' && e !== null && 'message' in e
    ? String((e as { message: unknown }).message)
    : 'Akce se nezdařila.';

/** Co se stane s prvním e-mailem — zrcadlí podmínky claim_due_survey_emails(). */
function firstEmailLabel(deliveredDay: string, today: string, hasValidEmail: boolean): string {
  if (!hasValidEmail) return 'Dotazník se nepošle — objednávka nemá platný e-mail';
  if (daysBetween(deliveredDay, today) >= MAX_DELIVERY_AGE_DAYS) {
    return `Dotazník se nepošle — doručení je starší než ${MAX_DELIVERY_AGE_DAYS} dní`;
  }
  const due = addDays(deliveredDay, FIRST_EMAIL_AFTER_DAYS);
  return due > today
    ? `Dotazník odejde ${formatDay(due)} v 9:30`
    : 'Dotazník odejde při nejbližším rozesílání (denně v 9:30)';
}

interface DeliveryPanelProps {
  order: OrderSubmission;
  onChange: (order: OrderSubmission) => void;
}

export function DeliveryPanel({ order, onChange }: DeliveryPanelProps) {
  const today = pragueDay(new Date());
  const [date, setDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const survey = order.order_surveys;
  const sequenceStarted = Boolean(survey?.first_sent_at);
  const hasValidEmail = EMAIL_RE.test(order.customer.email ?? '');
  const deliveredDay = order.delivered_at ? pragueDay(order.delivered_at) : null;
  const responded = survey?.rating != null || Boolean(survey?.answered_at);

  const run = async (action: () => Promise<OrderSubmission>) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleMark = () =>
    run(async () => ({ ...order, delivered_at: await markOrderDelivered(order.id, date) }));

  const handleUnmark = () =>
    run(async () => {
      await unmarkOrderDelivered(order.id);
      return { ...order, delivered_at: null };
    });

  const reminderLabel = (day: string): string => {
    if (survey?.reminder_sent_at) return `Připomínka odeslána ${formatDay(pragueDay(survey.reminder_sent_at))}`;
    if (responded) return 'Připomínka není potřeba — zákazník odpověděl';
    if (survey?.opted_out_at) return 'Připomínku si zákazník nepřeje';
    return `Připomínka odejde nejdříve ${formatDay(addDays(day, REMINDER_AFTER_DAYS))}, pokud neodpoví`;
  };

  return (
    <section className="glass-panel delivery-panel">
      <h3>Doručení a dotazník spokojenosti</h3>

      {!hasValidEmail && (
        <p className="delivery-warning">Objednávka nemá platný e-mail — dotazník se nepošle.</p>
      )}

      {!deliveredDay && (
        <>
          <p className="delivery-hint">
            Po označení doručení odejde zákazníkovi za {FIRST_EMAIL_AFTER_DAYS} dny dotazník spokojenosti
            a {REMINDER_AFTER_DAYS}. den připomínka, pokud neodpoví.
          </p>
          <div className="delivery-actions">
            <label>
              Datum doručení
              <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} />
            </label>
            <button type="button" className="btn-action btn-deliver" disabled={busy || !date} onClick={() => void handleMark()}>
              {busy ? 'Ukládám…' : 'Označit jako doručeno'}
            </button>
          </div>
        </>
      )}

      {deliveredDay && (
        <>
          <ul className="delivery-timeline">
            <li className="is-done">Doručeno {formatDay(deliveredDay)}</li>
            <li className={survey?.first_sent_at ? 'is-done' : ''}>
              {survey?.first_sent_at
                ? `Dotazník odeslán ${formatDay(pragueDay(survey.first_sent_at))}`
                : firstEmailLabel(deliveredDay, today, hasValidEmail)}
            </li>
            <li className={survey?.reminder_sent_at ? 'is-done' : ''}>{reminderLabel(deliveredDay)}</li>
          </ul>

          {survey?.rating != null && (
            <div className="delivery-answers">
              <p className="delivery-stars" aria-label={`Hodnocení ${survey.rating} z 5`}>
                {'★'.repeat(survey.rating)}
                <span className="delivery-stars-off">{'★'.repeat(5 - survey.rating)}</span>
                {!survey.answered_at && <span className="delivery-note"> (jen klik v e-mailu, formulář neodeslán)</span>}
              </p>
              {survey.source && (
                <p>
                  <strong>Dozvěděl/a se:</strong> {SOURCE_LABEL.get(survey.source) ?? survey.source}
                  {survey.source_other && ` — ${survey.source_other}`}
                </p>
              )}
              {survey.comment && (
                <p className="delivery-comment">
                  <strong>Vzkaz:</strong> {survey.comment}
                </p>
              )}
            </div>
          )}

          {!sequenceStarted && (
            <button type="button" className="btn-action btn-secondary" disabled={busy} onClick={() => void handleUnmark()}>
              {busy ? 'Ukládám…' : 'Zrušit označení doručení'}
            </button>
          )}
        </>
      )}

      {error && <p className="delivery-error" role="alert">{error}</p>}
    </section>
  );
}
