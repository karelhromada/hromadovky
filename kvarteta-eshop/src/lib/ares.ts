export interface AresResult {
  ico: string;
  dic: string | null;
  companyName: string;
  address: string;
}

const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty';

export function isValidIco(ico: string): boolean {
  const digits = ico.replace(/\s+/g, '');
  if (!/^\d{8}$/.test(digits)) return false;

  const weights = [8, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number.parseInt(digits[i], 10), 0);
  const mod = sum % 11;
  const expected = mod === 0 ? 1 : mod === 1 ? 0 : 11 - mod;
  return expected === Number.parseInt(digits[7], 10);
}

export async function lookupAres(ico: string, signal?: AbortSignal): Promise<AresResult | null> {
  const cleaned = ico.replace(/\s+/g, '');
  if (!isValidIco(cleaned)) return null;

  const response = await fetch(`${ARES_BASE}/${cleaned}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) return null;

  const raw = (await response.json()) as Record<string, unknown>;
  const sidlo = raw.sidlo as Record<string, unknown> | undefined;

  const street = typeof sidlo?.nazevUlice === 'string' ? sidlo.nazevUlice : '';
  const houseNumber =
    typeof sidlo?.cisloDomovni === 'number' || typeof sidlo?.cisloDomovni === 'string'
      ? String(sidlo.cisloDomovni)
      : '';
  const orientationNumber =
    typeof sidlo?.cisloOrientacni === 'number' || typeof sidlo?.cisloOrientacni === 'string'
      ? String(sidlo.cisloOrientacni)
      : '';
  const city = typeof sidlo?.nazevObce === 'string' ? sidlo.nazevObce : '';
  const zip =
    typeof sidlo?.psc === 'number' || typeof sidlo?.psc === 'string' ? String(sidlo.psc) : '';

  const fullStreet = [
    street,
    [houseNumber, orientationNumber].filter(Boolean).join('/'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    ico: cleaned,
    dic: typeof raw.dic === 'string' ? raw.dic : null,
    companyName: typeof raw.obchodniJmeno === 'string' ? raw.obchodniJmeno : '',
    address: [fullStreet, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
  };
}
