// Zdroj pravdy: /zadni_strany/manifest.json (generovany scripts/migrate_final_backs.mjs)
// Manifest se kopiruje do src/data/backs-manifest.json pomoci scripts/sync-backs.mjs (predev / prebuild).
// URL: /zadni_strany/{kvarteta|hraci_karty|pexeso}/webp/<id>.webp

import manifestData from './backs-manifest.json';

export type BackGame = 'kvarteta' | 'hraci_karty' | 'pexeso';

export type BackCategory =
  | 'drak'
  | 'dinosaurus'
  | 'rytir'
  | 'kocka'
  | 'mytologie'
  | 'epic'
  | 'priroda'
  | 'neutralni'
  | 'led'
  | 'auta'
  | 'pexeso';

export interface Background {
  id: string;
  name: string;
  url: string;
  category: BackCategory;
  game: BackGame;
  width: number;
  height: number;
  aspectRatio: string;
}

interface ManifestItem {
  id: string;
  name: string;
  file: string;
  width: number;
  height: number;
}

interface ManifestCategory {
  size: string;
  aspect_ratio: number;
  items: ManifestItem[];
}

interface Manifest {
  version: number;
  generated_at: string;
  categories: Record<BackGame, ManifestCategory>;
}

const manifest = manifestData as Manifest;

function deriveCategory(id: string): BackCategory {
  const prefix = id.split('_')[0];
  const known: BackCategory[] = [
    'drak',
    'dinosaurus',
    'rytir',
    'kocka',
    'mytologie',
    'epic',
    'priroda',
    'neutralni',
    'led',
    'auta',
    'pexeso',
  ];
  return (known.find((cat) => cat === prefix) ?? 'neutralni') as BackCategory;
}

function buildBackgrounds(): Background[] {
  const result: Background[] = [];
  for (const game of ['kvarteta', 'hraci_karty', 'pexeso'] as const) {
    const category = manifest.categories[game];
    if (!category) continue;
    for (const item of category.items) {
      result.push({
        id: item.id,
        name: item.name,
        url: `/zadni_strany/${game}/webp/${item.id}.webp`,
        category: deriveCategory(item.id),
        game,
        width: item.width,
        height: item.height,
        aspectRatio: `${item.width} / ${item.height}`,
      });
    }
  }
  return result;
}

export const backgrounds: Background[] = buildBackgrounds();

export const getBackgroundByUrl = (url: string): Background | undefined =>
  backgrounds.find((bg) => bg.url === url);

export const getBackgroundById = (id: string, game?: BackGame): Background | undefined => {
  if (game) {
    return backgrounds.find((bg) => bg.id === id && bg.game === game);
  }
  return backgrounds.find((bg) => bg.id === id);
};

export const getBackgroundsForGame = (game: BackGame): Background[] =>
  backgrounds.filter((bg) => bg.game === game);

// ---------- Migrace starych URL z kosiku (localStorage) ----------
// Stara struktura pouzivala /zadni_strany/karty/webp/<id>.webp s ID jako epic_varianta_1, drak_kovove_supiny atd.
// Nova struktura ma 3 kategorie a uplne jine ID. Stare URL/ID jiz neexistuji - fallback na default.

const LEGACY_URL_PREFIXES = [
  '/cards/',
  '/zadni_strany/karty/',
  '/zadni_strany/pexeso/webp/pexeso_klasicke_platno',
  '/zadni_strany/pexeso/webp/pexeso_hvezdna_noc',
  '/zadni_strany/pexeso/webp/pexeso_modre_diamanty',
  '/zadni_strany/pexeso/webp/pexeso_cervene_vzory',
];

function isLegacyUrl(url: string): boolean {
  return LEGACY_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function getDefaultUrl(game: BackGame): string | undefined {
  return getBackgroundsForGame(game)[0]?.url;
}

export function migrateLegacyBackUrl(
  url: string | undefined | null,
  game: BackGame = 'kvarteta'
): string | undefined {
  if (!url) return url ?? undefined;
  if (url.startsWith(`/zadni_strany/${game}/`)) return url;
  if (isLegacyUrl(url)) {
    return getDefaultUrl(game);
  }
  return url;
}
