// Jednotný pohled na produkty všech tří kategorií pro produktové stránky a SEO.
// Zdroj dat: products.ts (kvarteta/karty mají různé tvary polí — zde se normalizují).
import { kartyProducts, kvartetaProducts, pexesoProducts } from './products';

export type ProductCategory = 'kvarteta' | 'karty' | 'pexeso';

export interface CatalogProduct {
    id: string;
    slug: string;
    name: string;
    description: string;
    longDescription: string;
    price: number;
    themeColor: string;
    /** Všechny obrázky produktu (absolutní cesty z public rootu). */
    gallery: string[];
    /** Intrinsic rozměry prvního obrázku galerie (pro width/height atributy → žádný CLS). */
    imgWidth: number;
    imgHeight: number;
}

export interface CategoryInfo {
    path: string;
    /** Název kategorie, např. „Kvarteta" (breadcrumb, odkazy). */
    label: string;
    /** Cena zobrazená na detailu: fixní → „349 Kč", rozsah → „od 199 Kč". */
    priceFrom: boolean;
    specs: ReadonlyArray<{ label: string; value: string }>;
}

export const CATEGORY_INFO: Record<ProductCategory, CategoryInfo> = {
    kvarteta: {
        path: '/kvarteta',
        label: 'Kvarteta',
        priceFrom: false,
        specs: [
            { label: 'Počet karet', value: '32 karet (8 rodin po 4)' },
            { label: 'Rozměr karty', value: '65 × 95 mm' },
            { label: 'Papír', value: 'lesklý fotopapír 220 µm' },
            { label: 'Povrch', value: 'oboustranná laminace 200 µm' },
            { label: 'Zadní strana', value: 'na výběr z desítek motivů' },
            { label: 'Výroba a doručení', value: 'do 5 pracovních dnů' },
        ],
    },
    karty: {
        path: '/karty',
        label: 'Hrací karty',
        priceFrom: false,
        specs: [
            { label: 'Počet karet', value: '32 listů (mariášové barvy, 7–eso)' },
            { label: 'Rozměr karty', value: '63 × 105 mm' },
            { label: 'Papír', value: 'lesklý fotopapír 220 µm' },
            { label: 'Povrch', value: 'oboustranná laminace 200 µm' },
            { label: 'Zadní strana', value: 'na výběr z desítek motivů' },
            { label: 'Výroba a doručení', value: 'do 5 pracovních dnů' },
        ],
    },
    pexeso: {
        path: '/pexeso',
        label: 'Pexesa',
        priceFrom: true,
        specs: [
            { label: 'Počet karet', value: '16 / 32 / 64 karet (8–32 párů)' },
            { label: 'Rozměr kartičky', value: '50 × 50, 60 × 60 nebo 80 × 80 mm' },
            { label: 'Papír', value: 'lesklý fotopapír 220 µm' },
            { label: 'Povrch', value: 'oboustranná laminace 200 µm' },
            { label: 'Zadní strana', value: 'na výběr z desítek motivů' },
            { label: 'Výroba a doručení', value: 'do 5 pracovních dnů' },
        ],
    },
};

/** Cenové rozpětí pexesa podle počtu karet (viz deckSizeOptions v ProductShowcasePexeso). */
export const PEXESO_PRICE_RANGE = { low: 199, high: 399 } as const;

// Rozměry PRVNÍHO obrázku galerie (změřeno sharp-em; při výměně obrázku aktualizovat).
// Aplikují se jako width/height na všechny náhledy produktu — pokud by budoucí galerie
// míchala poměry stran, sekundární náhledy dostanou lehce nepřesný box (object-fit to kryje).
const IMG_DIMS: Record<string, [number, number]> = {
    'kvarteto-mytologie': [442, 600],
    'kvarteto-dinosauri': [908, 1284],
    'kvarteto-dracci': [908, 1284],
    'kvarteto-draci': [709, 1004],
    'kvarteto-rytiri': [424, 600],
    'kvarteto-kocky': [908, 1284],
    'kvarteto-lesni-bytosti': [741, 1083],
    'kvarteto-zvireci-auta': [741, 1083],
    'karty-tema-draku': [359, 600],
    'karty-tema-carodejnice': [359, 600],
    'karty-tema-zamek': [717, 1197],
    'karty-tema-minecraft': [359, 600],
    'karty-tema-star-wars': [717, 1197],
    'karty-tema-prsi-car-a-kouzel': [717, 1197],
    'pexeso-dinosauri': [1024, 1024],
    'pexeso-dracci': [896, 1344],
    'pexeso-draci': [1024, 1024],
    'pexeso-kocky': [896, 1344],
    'pexeso-frozen': [684, 684],
    'pexeso-dravci': [1024, 1024],
};

interface RawProduct {
    id: string;
    slug?: string;
    name: string;
    description: string;
    longDescription?: string;
    price: number;
    themeColor: string;
    image?: string[];
    images?: string[];
    allCards?: string[];
}

function normalize(raw: RawProduct): CatalogProduct {
    const gallery = raw.allCards ?? raw.image ?? raw.images ?? [];
    const [imgWidth, imgHeight] = IMG_DIMS[raw.id] ?? [741, 1083];
    return {
        id: raw.id,
        slug: raw.slug ?? raw.id,
        name: raw.name,
        description: raw.description,
        longDescription: raw.longDescription ?? raw.description,
        price: raw.price,
        themeColor: raw.themeColor,
        gallery,
        imgWidth,
        imgHeight,
    };
}

const PRODUCTS_BY_CATEGORY: Record<ProductCategory, CatalogProduct[]> = {
    kvarteta: kvartetaProducts.map(normalize),
    karty: kartyProducts.map(normalize),
    pexeso: pexesoProducts.map(normalize),
};

export function listProducts(category: ProductCategory): CatalogProduct[] {
    return PRODUCTS_BY_CATEGORY[category];
}

export function getProductBySlug(category: ProductCategory, slug: string): CatalogProduct | undefined {
    return PRODUCTS_BY_CATEGORY[category].find((p) => p.slug === slug);
}

/** Cesta na detail produktu, např. /kvarteta/lesni-bytosti. */
export function productPath(category: ProductCategory, product: Pick<CatalogProduct, 'slug'>): string {
    return `${CATEGORY_INFO[category].path}/${product.slug}`;
}
