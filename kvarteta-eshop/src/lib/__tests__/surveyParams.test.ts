import { describe, expect, it } from 'vitest';
import { parseRating, parseSurveyLink } from '../surveyParams';

const ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const TOKEN = 'a'.repeat(64);

describe('parseSurveyLink', () => {
  it('přečte platný odkaz s hodnocením', () => {
    expect(parseSurveyLink(`?o=${ID}&t=${TOKEN}&h=4`)).toEqual({
      orderId: ID,
      token: TOKEN,
      rating: 4,
      optOut: false,
    });
  });

  it('odkaz bez hodnocení je platný (tlačítko „Vyplnit dotazník")', () => {
    expect(parseSurveyLink(`?o=${ID}&t=${TOKEN}`)?.rating).toBeNull();
  });

  it('rozpozná odhlášení z připomínky', () => {
    expect(parseSurveyLink(`?o=${ID}&t=${TOKEN}&odhlasit=1`)?.optOut).toBe(true);
    expect(parseSurveyLink(`?o=${ID}&t=${TOKEN}&odhlasit=ano`)?.optOut).toBe(false);
  });

  it.each([
    ['chybí vše', ''],
    ['chybí token', `?o=${ID}`],
    ['id není uuid', `?o=123&t=${TOKEN}`],
    ['krátký token', `?o=${ID}&t=abc`],
    ['token s velkými písmeny / ne-hex', `?o=${ID}&t=${'G'.repeat(64)}`],
    ['injekce v id', `?o=${ID}' OR 1=1 --&t=${TOKEN}`],
    ['script v tokenu', `?o=${ID}&t=<script>alert(1)</script>`],
  ])('odmítne neplatný odkaz: %s', (_name, search) => {
    expect(parseSurveyLink(search)).toBeNull();
  });
});

describe('parseRating', () => {
  it.each(['1', '2', '3', '4', '5'])('přijme %s', value => {
    expect(parseRating(value)).toBe(Number(value));
  });

  it.each([null, '', '0', '6', '4.5', '-1', '5 ', 'pět', '55'])('odmítne %s', value => {
    expect(parseRating(value)).toBeNull();
  });
});
