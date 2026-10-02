// Parsování odkazu z dotazníkového e-mailu: /dotaznik?o=<uuid>&t=<hmac>&h=<1-5>&odhlasit=1
// Čistá funkce bez závislosti na Supabase klientovi (kvůli unit testům).

export interface SurveyLinkParams {
  orderId: string;
  token: string;
  /** Hodnocení předvybrané klikem na hvězdičku v e-mailu. */
  rating: number | null;
  optOut: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[0-9a-f]{64}$/;

export function parseRating(value: string | null): number | null {
  if (value === null || !/^[1-5]$/.test(value)) return null;
  return Number(value);
}

/** Vrací null, když odkaz nemá platný tvar (nic se pak na server neposílá). */
export function parseSurveyLink(search: string): SurveyLinkParams | null {
  const params = new URLSearchParams(search);
  const orderId = params.get('o') ?? '';
  const token = params.get('t') ?? '';
  if (!UUID_RE.test(orderId) || !TOKEN_RE.test(token)) return null;
  return {
    orderId,
    token,
    rating: parseRating(params.get('h')),
    optOut: params.get('odhlasit') === '1',
  };
}
