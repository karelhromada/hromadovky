import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import {
  SURVEY_COMMENT_MAX,
  SURVEY_RATING_LABELS,
  SURVEY_SOURCE_OTHER,
  SURVEY_SOURCE_OTHER_MAX,
  SURVEY_SOURCES,
} from '../data/survey';
import { getSurveyForView, submitSurveyAnswers, submitSurveyRating, surveyOptOut } from '../lib/survey';
import { parseSurveyLink } from '../lib/surveyParams';
import './SurveyPage.css';

type Status = 'loading' | 'invalid' | 'form' | 'done' | 'optedOut' | 'error';

const RATINGS = [1, 2, 3, 4, 5] as const;
const CONTACT_EMAIL = 'obchod@hromadovky.cz';

// Dotazník spokojenosti — otevírá se odkazem z e-mailu po doručení objednávky.
// Hodnocení z ?h=N ukládá až tento skript (ne samotný GET), takže skenery odkazů
// v poštovních klientech za zákazníka nehlasují.
export default function SurveyPage() {
  const { search } = useLocation();
  const link = useMemo(() => parseSurveyLink(search), [search]);

  const [status, setStatus] = useState<Status>(link ? 'loading' : 'invalid');
  const [rating, setRating] = useState<number | null>(link?.rating ?? null);
  const [source, setSource] = useState<string | null>(null);
  const [sourceOther, setSourceOther] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!link) return;
    let cancelled = false;

    const load = async (): Promise<Status> => {
      if (link.optOut) {
        return (await surveyOptOut(link.orderId, link.token)) ? 'optedOut' : 'invalid';
      }
      const view = await getSurveyForView(link.orderId, link.token);
      if (!view) return 'invalid';
      if (view.answered) return 'done';
      if (link.rating !== null) {
        // Jen pojistka pro případ, že zákazník formulář nedokončí — selhání nesmí
        // shodit stránku; hodnocení se stejně uloží znovu při odeslání formuláře.
        await submitSurveyRating(link.orderId, link.token, link.rating).catch(() => false);
      } else if (view.rating !== null && !cancelled) {
        setRating(view.rating);
      }
      return 'form';
    };

    load()
      .then(next => {
        if (!cancelled) setStatus(next);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [link]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!link) return;
    if (rating === null) {
      setFormError('Vyberte prosím počet hvězdiček.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const ok = await submitSurveyAnswers(link.orderId, link.token, {
        rating,
        source,
        sourceOther: source === SURVEY_SOURCE_OTHER ? sourceOther : '',
        comment,
      });
      setStatus(ok ? 'done' : 'invalid');
    } catch {
      setFormError(`Odpověď se nepodařilo uložit. Zkuste to prosím znovu, nebo nám napište na ${CONTACT_EMAIL}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="survey-page">
      <PageHead {...SEO.dotaznik} />
      <div className="survey-card">
        <p className="survey-suits" aria-hidden="true">♠ ♥ ♦ ♣</p>

        {status === 'loading' && <p className="survey-muted">Načítám dotazník…</p>}

        {status === 'invalid' && (
          <>
            <h1>Odkaz se nepodařilo ověřit</h1>
            <p>
              Zkuste prosím otevřít odkaz přímo z e-mailu. Kdyby to nešlo, napište nám na{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <Link to="/" className="btn-primary survey-cta">Na úvodní stránku</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>Něco se pokazilo</h1>
            <p>
              Dotazník se teď nepodařilo načíst. Zkuste to prosím za chvíli znovu, nebo nám napište na{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </>
        )}

        {status === 'optedOut' && (
          <>
            <h1>Rozumíme</h1>
            <p>Další připomínku k dotazníku už vám nepošleme. Ať se vám s kartami dobře hraje!</p>
            <Link to="/" className="btn-primary survey-cta">Na úvodní stránku</Link>
          </>
        )}

        {status === 'done' && (
          <>
            <h1>Děkujeme!</h1>
            <p>Vaše odpovědi nám pomáhají dělat karty, které dělají radost. Vážíme si toho.</p>
            <Link to="/" className="btn-primary survey-cta">Prohlédnout další sady</Link>
          </>
        )}

        {status === 'form' && (
          <form onSubmit={handleSubmit} noValidate>
            <h1>Jak se vám s kartami hraje?</h1>
            <p className="survey-muted">Zabere to půl minuty. Povinné jsou jen hvězdičky.</p>

            <fieldset className="survey-field">
              <legend>Jak jste s objednávkou spokojeni?</legend>
              {/* Nativní radio (skryté vizuálně): šipky a jeden tab stop zadarmo. */}
              <div className="survey-stars">
                {RATINGS.map(value => (
                  <label
                    key={value}
                    className={`survey-star${rating !== null && value <= rating ? ' is-on' : ''}`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => setRating(value)}
                      aria-label={`${value} z 5 — ${SURVEY_RATING_LABELS[value]}`}
                    />
                    <span aria-hidden="true">★</span>
                  </label>
                ))}
              </div>
              <p className="survey-rating-label" aria-live="polite">
                {rating !== null ? SURVEY_RATING_LABELS[rating] : ' '}
              </p>
            </fieldset>

            <fieldset className="survey-field">
              <legend>Jak jste se o nás dozvěděli?</legend>
              <div className="survey-options">
                {SURVEY_SOURCES.map(option => (
                  <label key={option.key} className={`survey-option${source === option.key ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="source"
                      value={option.key}
                      checked={source === option.key}
                      onChange={() => setSource(option.key)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {source === SURVEY_SOURCE_OTHER && (
                <input
                  type="text"
                  className="survey-input"
                  placeholder="Kde přesně?"
                  aria-label="Kde jste se o nás dozvěděli"
                  maxLength={SURVEY_SOURCE_OTHER_MAX}
                  value={sourceOther}
                  onChange={e => setSourceOther(e.target.value)}
                />
              )}
            </fieldset>

            <label className="survey-field survey-comment">
              <span className="survey-legend">Chcete nám něco vzkázat? (nepovinné)</span>
              <textarea
                className="survey-input"
                rows={4}
                maxLength={SURVEY_COMMENT_MAX}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Co se povedlo, co bychom měli zlepšit…"
              />
            </label>

            {formError && <p className="survey-error" role="alert">{formError}</p>}

            <button type="submit" className="btn-primary survey-cta" disabled={submitting}>
              {submitting ? 'Odesílám…' : 'Odeslat odpovědi'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
