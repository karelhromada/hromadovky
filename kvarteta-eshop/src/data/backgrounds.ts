export interface Background {
  id: string;
  name: string;
  url: string;
  category: 'epic' | 'dragon' | 'cat' | 'classic' | 'pattern' | 'knight';
}

export const backgrounds: Background[] = [
  // EPIC SERIES
  { id: 'epic_gold', name: 'Zlaté šupiny (Epic)', url: '/cards/backs/epic_gold_scales.webp', category: 'epic' },
  { id: 'epic_lava', name: 'Lávový proud (Epic)', url: '/cards/backs/epic_lava_flow.webp', category: 'epic' },
  { id: 'epic_ice', name: 'Ledový krystal (Epic)', url: '/cards/backs/epic_ice_crystal.webp', category: 'epic' },
  { id: 'epic_arcane', name: 'Magický pergamen (Epic)', url: '/cards/backs/epic_arcane_parchment.webp', category: 'epic' },
  { id: 'epic_obsidian', name: 'Runový obsidián (Epic)', url: '/cards/backs/epic_runed_obsidian.webp', category: 'epic' },

  // DRAGON SERIES
  { id: 'drag_vibrant', name: 'Krvavé šupiny', url: '/cards/dragon_scales_vibrant.webp', category: 'dragon' },
  { id: 'drag_metallic', name: 'Kovový drak', url: '/cards/dragon_scales_metallic.webp', category: 'dragon' },
  { id: 'drag_real_1', name: 'Zelené šupiny', url: '/cards/dragon_scales_realistic_1.webp', category: 'dragon' },
  { id: 'drag_real_2', name: 'Zlatý drak', url: '/cards/dragon_scales_realistic_2.webp', category: 'dragon' },
  { id: 'drag_seamless', name: 'Dračí plátování', url: '/cards/dragon_scales_seamless.webp', category: 'dragon' },

  // CAT SERIES
  { id: 'cat_orange', name: 'Zrzavý kocour', url: '/cards/cat_fur_orange.webp', category: 'cat' },
  { id: 'cat_silver', name: 'Stříbrná srst', url: '/cards/cat_fur_silver.webp', category: 'cat' },
  { id: 'cat_calico', name: 'Tříbarevná kočka', url: '/cards/cat_fur_calico.webp', category: 'cat' },

  // KNIGHT SERIES
  { id: 'knight_steel', name: 'Ocelový plát', url: '/cards/knight_back_iron_steel.webp', category: 'knight' },
  { id: 'knight_crest', name: 'Rytířský erb', url: '/cards/knight_back_crest.webp', category: 'knight' },
  { id: 'knight_gate', name: 'Hradní brána', url: '/cards/knight_back_gate.webp', category: 'knight' },
  { id: 'knight_pattern', name: 'Zámecký vzor', url: '/cards/knight_back_pattern.webp', category: 'knight' },

  // PATTERNS & CLASSIC
  { id: 'magical_ruby', name: 'Magický rubín', url: '/cards/neutral_back_ruby_formatted.webp', category: 'pattern' },
  { id: 'pattern_dark', name: 'Tajemný vzor', url: '/cards/card_back_pattern.webp', category: 'pattern' },
  { id: 'sugar_glaze', name: 'Cukrová poleva', url: '/cards/sugar_glaze_pattern.webp', category: 'pattern' },
  { id: 'stars_night', name: 'Noční obloha', url: '/cards/neutral_back_stars.webp', category: 'pattern' },
  { id: 'gradient_dark', name: 'Temný gradient', url: '/cards/neutral_back_gradient.webp', category: 'pattern' },
  
  // PEXESO SPECIALS
  { id: 'pexeso_linen', name: 'Klasické plátno', url: '/cards/pexeso_back_linen.webp', category: 'classic' },
  { id: 'pexeso_stars', name: 'Hvězdná noc', url: '/cards/pexeso_back_stars.webp', category: 'classic' },
  { id: 'pexeso_geo_blue', name: 'Modré diamanty', url: '/cards/pexeso_back_blue_geo.webp', category: 'classic' },
  { id: 'pexeso_geo_red', name: 'Červené vzory', url: '/cards/pexeso_back_red_geo.webp', category: 'classic' },

  // MINECRAFT SERIES
  { id: 'minecraft_dark', name: 'Minecraft – tmavá', url: '/cards/minecraft-prsi/back_dark.png', category: 'pattern' },
  { id: 'minecraft_light', name: 'Minecraft – světlá', url: '/cards/minecraft-prsi/back_light.png', category: 'pattern' }
];

export const getBackgroundByUrl = (url: string) => {
  return backgrounds.find(bg => bg.url === url);
};

export const getBackgroundById = (id: string) => {
  return backgrounds.find(bg => bg.id === id);
};
