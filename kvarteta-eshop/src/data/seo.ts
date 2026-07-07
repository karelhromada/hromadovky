export const SITE = {
  url: 'https://www.hromadovky.cz',
  name: 'Hromadovky',
  defaultOgImage: '/og-image.jpg',
} as const;

export type JsonLdSchema = Record<string, unknown>;

export interface PageSeo {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  jsonLd?: JsonLdSchema | JsonLdSchema[];
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hromadovky',
  url: `${SITE.url}/`,
  logo: `${SITE.url}/logo.webp`,
  email: 'info@hromadovky.cz',
  address: { '@type': 'PostalAddress', addressCountry: 'CZ' },
};

interface ProductLdInput {
  name: string;
  description: string;
  path: string;
  image: string;
  lowPrice: number;
  highPrice: number;
}

const productJsonLd = ({ name, description, path, image, lowPrice, highPrice }: ProductLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  image: `${SITE.url}${image}`,
  url: `${SITE.url}${path}`,
  brand: { '@type': 'Brand', name: 'Hromadovky' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'CZK',
    lowPrice,
    highPrice,
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', name: 'Hromadovky' },
  },
});

const breadcrumbLd = (items: ReadonlyArray<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: `${SITE.url}${item.path}`,
  })),
});

// `satisfies` checks shape but preserves literal key types — autocomplete + typo detection.
export const SEO = {
  home: {
    title: 'Hromadovky — české hrací karty, kvarteta, pexesa',
    description:
      'Originální české hrací karty, kvarteta a pexesa s ručně malovanou grafikou. Kvalitní tisk, rychlé dodání. Vytvořte si i karty s vlastními fotkami.',
    path: '/',
    jsonLd: organizationLd,
  },
  kvarteta: {
    title: 'Kvarteta — české kartičkové hry pro rodinu | Hromadovky',
    description:
      'Vyberte si z kolekce ručně malovaných kvartet pro děti i dospělé. Princezny, rytíři, draci, vesmír a další. Kvalitní tisk a rychlé dodání po ČR.',
    path: '/kvarteta',
    jsonLd: [
      productJsonLd({
        name: 'Kvarteta Hromadovky',
        description: 'Originální česká kvarteta s ručně malovanou grafikou. Více motivů na výběr.',
        path: '/kvarteta',
        image: '/og-image.jpg',
        lowPrice: 349,
        highPrice: 349,
      }),
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: 'Kvarteta', path: '/kvarteta' },
      ]),
    ],
  },
  pexeso: {
    title: 'Pexesa — paměťová hra pro celou rodinu | Hromadovky',
    description:
      'Krásně ilustrovaná pexesa pro děti i dospělé. Trénujte paměť s motivy zvířat, princezen, rytířů a dalších. Český produkt, kvalitní tisk.',
    path: '/pexeso',
    jsonLd: [
      productJsonLd({
        name: 'Pexesa Hromadovky',
        description: 'Ručně malovaná česká pexesa pro celou rodinu, varianty 16 / 32 / 64 karet.',
        path: '/pexeso',
        image: '/og-image.jpg',
        lowPrice: 199,
        highPrice: 399,
      }),
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: 'Pexesa', path: '/pexeso' },
      ]),
    ],
  },
  karty: {
    title: 'Hrací karty s českým designem | Hromadovky',
    description:
      'Originální hrací karty s ručně malovanou grafikou. Krásný design, kvalitní papír. Vyberte si motiv pro každou hru i jako dárek.',
    path: '/karty',
    jsonLd: [
      productJsonLd({
        name: 'Hrací karty Hromadovky',
        description: 'Designové české hrací karty s ručně malovanou grafikou.',
        path: '/karty',
        image: '/og-image.jpg',
        lowPrice: 249,
        highPrice: 349,
      }),
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: 'Hrací karty', path: '/karty' },
      ]),
    ],
  },
  faq: {
    title: 'Často kladené otázky | Hromadovky',
    description:
      'Odpovědi na nejčastější otázky o objednávce, dodání, vlastních kartách s fotkami a vrácení zboží. Vše, co potřebujete vědět o Hromadovkách.',
    path: '/faq',
  },
  about: {
    title: 'O nás — příběh rodinných Hromadovek',
    description:
      'Jsme rodinný projekt z Česka. Tvoříme originální kvarteta, pexesa a hrací karty s ručně malovanou grafikou pro radost celé rodiny.',
    path: '/o-nas',
  },
  terms: {
    title: 'Obchodní podmínky | Hromadovky',
    description:
      'Obchodní podmínky e-shopu Hromadovky: informace o objednávce, platebních metodách, dodání zboží, odstoupení od smlouvy a ochraně spotřebitele.',
    path: '/obchodni-podminky',
  },
  returns: {
    title: 'Reklamační řád a vrácení zboží | Hromadovky',
    description:
      'Jak postupovat při reklamaci, jak vrátit zboží do 14 dnů, vaše zákonná práva z vadného plnění a kontakt na zákaznickou podporu Hromadovky.',
    path: '/reklamacni-rad',
  },
  privacy: {
    title: 'Ochrana osobních údajů (GDPR) | Hromadovky',
    description:
      'Jak zpracováváme vaše osobní údaje v souladu s GDPR. Informace o cookies, právech subjektu údajů a kontaktu na správce osobních údajů.',
    path: '/gdpr',
  },
  checkout: {
    title: 'Pokladna | Hromadovky',
    description: 'Dokončete svou objednávku v e-shopu Hromadovky.',
    path: '/checkout',
    noindex: true,
  },
  login: {
    title: 'Přihlášení | Hromadovky',
    description: 'Přihlaste se do svého účtu Hromadovky.',
    path: '/login',
    noindex: true,
  },
  resetPassword: {
    title: 'Obnovení hesla | Hromadovky',
    description: 'Obnova hesla k vašemu účtu.',
    path: '/reset-password',
    noindex: true,
  },
  adminInvoices: {
    title: 'Administrace faktur | Hromadovky',
    description: 'Administrace faktur.',
    path: '/admin/invoices',
    noindex: true,
  },
  notFound: {
    title: 'Stránka nenalezena (404) | Hromadovky',
    description: 'Požadovaná stránka neexistuje nebo byla přesunuta.',
    path: '/404',
    noindex: true,
  },
} as const satisfies Record<string, PageSeo>;

// Paths exposed to crawlers. NOTE: scripts/routes.mjs duplicates this list (with lastmod
// metadata) because Node ESM cannot import the TS source. Keep both lists in sync when
// adding/removing routes.
export const INDEXABLE_PATHS: readonly string[] = Object.values<PageSeo>(SEO)
  .filter((p) => !p.noindex)
  .map((p) => p.path);
