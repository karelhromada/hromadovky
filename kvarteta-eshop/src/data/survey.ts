// Možnosti otázky „Jak jste se o nás dozvěděli?" v dotazníku spokojenosti (/dotaznik).
// `key` se ukládá do order_surveys.source — DB hlídá jen formát [a-z0-9_]{1,40},
// takže kanály lze přidávat/ubírat tady bez migrace. Už použité klíče nepřejmenovávat
// (rozbila by se návaznost starších odpovědí), jen měnit `label`.

export interface SurveySource {
  key: string;
  label: string;
}

/** Klíč volby „Jiné" — zobrazí textové pole pro upřesnění. */
export const SURVEY_SOURCE_OTHER = 'jine';

// TODO(Karel): uprav podle kanálů, kde Hromadovky reálně jsou vidět.
export const SURVEY_SOURCES: readonly SurveySource[] = [
  { key: 'doporuceni', label: 'Doporučení od známých' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'google', label: 'Vyhledávač (Google, Seznam)' },
  { key: 'heureka_zbozi', label: 'Heureka nebo Zboží.cz' },
  { key: 'darek', label: 'Dostal/a jsem karty jako dárek' },
  { key: SURVEY_SOURCE_OTHER, label: 'Jinde' },
];

export const SURVEY_RATING_LABELS: Readonly<Record<number, string>> = {
  1: 'Nic moc',
  2: 'Šlo to',
  3: 'Dobré',
  4: 'Moc fajn',
  5: 'Nadšení',
};

export const SURVEY_COMMENT_MAX = 2000;
export const SURVEY_SOURCE_OTHER_MAX = 200;
