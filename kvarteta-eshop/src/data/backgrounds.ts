// Zdroj pravdy: /zadni_strany/{karty,pexeso}/manifest.json (generovano scripts/migrate_backs.mjs)
// Prehled URL: /zadni_strany/karty/webp/<id>.webp nebo /zadni_strany/pexeso/webp/<id>.webp
// Zkopirovano do kvarteta-eshop/public/zadni_strany/ pomoci scripts/sync-backs.mjs (predev/prebuild).

export type BackCategory =
  | 'epic'
  | 'drak'
  | 'rytir'
  | 'kocka'
  | 'dinosaurus'
  | 'mytologie'
  | 'minecraft'
  | 'neutralni'
  | 'pexeso';

export type BackGame = 'karty' | 'pexeso';

export interface Background {
  id: string;
  name: string;
  url: string;
  category: BackCategory;
  games: BackGame[];
}

const KARTY: Array<Omit<Background, 'url' | 'games'>> = [
  // EPIC - pojmenovane
  { id: 'epic_zlate_supiny',      name: 'Zlaté šupiny (Epic)',      category: 'epic' },
  { id: 'epic_magicky_pergamen',  name: 'Magický pergamen (Epic)',  category: 'epic' },
  { id: 'epic_ledovy_krystal',    name: 'Ledový krystal (Epic)',    category: 'epic' },
  { id: 'epic_lavovy_proud',      name: 'Lávový proud (Epic)',      category: 'epic' },
  { id: 'epic_runovy_obsidian',   name: 'Runový obsidián (Epic)',   category: 'epic' },
  // EPIC - varianta 1-10
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `epic_varianta_${i + 1}`,
    name: `Epic – varianta ${i + 1}`,
    category: 'epic' as const,
  })),
  // DRAK
  { id: 'drak_krvave_supiny', name: 'Krvavé šupiny',   category: 'drak' },
  { id: 'drak_kovove_supiny', name: 'Kovový drak',     category: 'drak' },
  { id: 'drak_zelene_supiny', name: 'Zelené šupiny',   category: 'drak' },
  { id: 'drak_zlate_supiny',  name: 'Zlatý drak',      category: 'drak' },
  { id: 'drak_platovani',     name: 'Dračí plátování', category: 'drak' },
  // RYTIR
  { id: 'rytir_ocelovy_plat',     name: 'Ocelový plát',      category: 'rytir' },
  { id: 'rytir_rytirsky_erb',     name: 'Rytířský erb',      category: 'rytir' },
  { id: 'rytir_hradni_brana',     name: 'Hradní brána',      category: 'rytir' },
  { id: 'rytir_zamecky_vzor',     name: 'Zámecký vzor',      category: 'rytir' },
  { id: 'rytir_medene_platovani', name: 'Měděné plátování',  category: 'rytir' },
  { id: 'rytir_zlate_platovani',  name: 'Zlaté plátování',   category: 'rytir' },
  { id: 'rytir_roztomily',        name: 'Roztomilý rytíř',   category: 'rytir' },
  // KOCKA
  { id: 'kocka_zrzava_srst',   name: 'Zrzavá srst',      category: 'kocka' },
  { id: 'kocka_stribrna_srst', name: 'Stříbrná srst',    category: 'kocka' },
  { id: 'kocka_tribarevna',    name: 'Tříbarevná kočka', category: 'kocka' },
  // DINOSAURUS
  { id: 'dinosaurus_jantar',   name: 'Dinosauří jantar',   category: 'dinosaurus' },
  { id: 'dinosaurus_krystaly', name: 'Dinosauří krystaly', category: 'dinosaurus' },
  { id: 'dinosaurus_priroda',  name: 'Dinosauří příroda',  category: 'dinosaurus' },
  { id: 'dinosaurus_hnizdo',   name: 'Dinosauří hnízdo',   category: 'dinosaurus' },
  { id: 'dinosaurus_oaza',     name: 'Dinosauří oáza',     category: 'dinosaurus' },
  // MYTOLOGIE
  { id: 'mytologie_emblem',  name: 'Mytologie – emblém', category: 'mytologie' },
  { id: 'mytologie_runy',    name: 'Mytologie – runy',   category: 'mytologie' },
  { id: 'mytologie_gateway', name: 'Mytologie – brána',  category: 'mytologie' },
  // MINECRAFT
  { id: 'minecraft_tmava',  name: 'Minecraft – tmavá',  category: 'minecraft' },
  { id: 'minecraft_svetla', name: 'Minecraft – světlá', category: 'minecraft' },
  // NEUTRALNI
  { id: 'neutralni_magicky_rubin',  name: 'Magický rubín',    category: 'neutralni' },
  { id: 'neutralni_tajemny_vzor',   name: 'Tajemný vzor',     category: 'neutralni' },
  { id: 'neutralni_cukrova_poleva', name: 'Cukrová poleva',   category: 'neutralni' },
  { id: 'neutralni_nocni_obloha',   name: 'Noční obloha',     category: 'neutralni' },
  { id: 'neutralni_temny_gradient', name: 'Temný gradient',   category: 'neutralni' },
];

const PEXESO_BACKS: Array<Omit<Background, 'url' | 'games'>> = [
  { id: 'pexeso_klasicke_platno', name: 'Klasické plátno', category: 'pexeso' },
  { id: 'pexeso_hvezdna_noc',     name: 'Hvězdná noc',     category: 'pexeso' },
  { id: 'pexeso_modre_diamanty',  name: 'Modré diamanty',  category: 'pexeso' },
  { id: 'pexeso_cervene_vzory',   name: 'Červené vzory',   category: 'pexeso' },
];

export const backgrounds: Background[] = [
  ...KARTY.map((b) => ({
    ...b,
    url: `/zadni_strany/karty/webp/${b.id}.webp`,
    games: ['karty'] as BackGame[],
  })),
  ...PEXESO_BACKS.map((b) => ({
    ...b,
    url: `/zadni_strany/pexeso/webp/${b.id}.webp`,
    games: ['pexeso'] as BackGame[],
  })),
];

export const getBackgroundByUrl = (url: string) =>
  backgrounds.find((bg) => bg.url === url);

export const getBackgroundById = (id: string) =>
  backgrounds.find((bg) => bg.id === id);

export const getBackgroundsForGame = (game: BackGame) =>
  backgrounds.filter((bg) => bg.games.includes(game));

// ---------- Migrace starych URL z kosiku (localStorage) ----------
// Kosik z predchozich navstev muze obsahovat stare cesty jako /cards/dragon_scales_vibrant.webp.
// Tento mapping je prepisuje na nove ID-based URL, aby se karta v kosiku stale zobrazovala.
const LEGACY_URL_TO_ID: Record<string, string> = {
  // EPIC
  '/cards/backs/epic_gold_scales.webp': 'epic_zlate_supiny',
  '/cards/backs/epic_arcane_parchment.webp': 'epic_magicky_pergamen',
  '/cards/backs/epic_ice_crystal.webp': 'epic_ledovy_krystal',
  '/cards/backs/epic_lava_flow.webp': 'epic_lavovy_proud',
  '/cards/backs/epic_runed_obsidian.webp': 'epic_runovy_obsidian',
  // DRAK
  '/cards/dragon_scales_vibrant.webp': 'drak_krvave_supiny',
  '/cards/dragon_scales_metallic.webp': 'drak_kovove_supiny',
  '/cards/dragon_scales_realistic_1.webp': 'drak_zelene_supiny',
  '/cards/dragon_scales_realistic_2.webp': 'drak_zlate_supiny',
  '/cards/dragon_scales_seamless.webp': 'drak_platovani',
  // KOCKA
  '/cards/cat_fur_orange.webp': 'kocka_zrzava_srst',
  '/cards/cat_fur_silver.webp': 'kocka_stribrna_srst',
  '/cards/cat_fur_calico.webp': 'kocka_tribarevna',
  // RYTIR
  '/cards/knight_back_iron_steel.webp': 'rytir_ocelovy_plat',
  '/cards/knight_back_crest.webp': 'rytir_rytirsky_erb',
  '/cards/knight_back_gate.webp': 'rytir_hradni_brana',
  '/cards/knight_back_pattern.webp': 'rytir_zamecky_vzor',
  // NEUTRALNI
  '/cards/neutral_back_ruby_formatted.webp': 'neutralni_magicky_rubin',
  '/cards/card_back_pattern.webp': 'neutralni_tajemny_vzor',
  '/cards/sugar_glaze_pattern.webp': 'neutralni_cukrova_poleva',
  '/cards/neutral_back_stars.webp': 'neutralni_nocni_obloha',
  '/cards/neutral_back_gradient.webp': 'neutralni_temny_gradient',
  // PEXESO
  '/cards/pexeso_back_linen.webp': 'pexeso_klasicke_platno',
  '/cards/pexeso_back_stars.webp': 'pexeso_hvezdna_noc',
  '/cards/pexeso_back_blue_geo.webp': 'pexeso_modre_diamanty',
  '/cards/pexeso_back_red_geo.webp': 'pexeso_cervene_vzory',
  // MINECRAFT (prechodne PNG cesty)
  '/cards/minecraft-prsi/back_dark.png': 'minecraft_tmava',
  '/cards/minecraft-prsi/back_light.png': 'minecraft_svetla',
};

export function migrateLegacyBackUrl(url: string | undefined | null): string | undefined {
  if (!url) return url ?? undefined;
  if (url.startsWith('/zadni_strany/')) return url;
  const id = LEGACY_URL_TO_ID[url];
  if (!id) return url;
  const bg = getBackgroundById(id);
  return bg?.url ?? url;
}
