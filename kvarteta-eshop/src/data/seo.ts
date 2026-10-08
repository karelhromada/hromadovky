import {
  CATEGORY_INFO,
  PEXESO_PRICE_RANGE,
  listProducts,
  productPath,
  type CatalogProduct,
  type ProductCategory,
} from './catalog';
import { faqs } from './faq';
import { customCardFaqs } from './customCards';

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
  /** Intrinsic rozměry ogImage; bez nich PageHead použije 1200×630 defaultního OG obrázku. */
  ogImageWidth?: number;
  ogImageHeight?: number;
  jsonLd?: JsonLdSchema | JsonLdSchema[];
}

// Pozor: kopie žije i v index.html (globální fallback) — při změně upravit obojí.
const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hromadovky',
  legalName: 'Karel Hromada',
  description:
    'Rodinný český e-shop s ručně malovanými kvartety, pexesy a hracími kartami. Vyrábí i kvarteta, pexesa a hrací karty z vlastních fotografií zákazníka.',
  url: `${SITE.url}/`,
  logo: `${SITE.url}/logo.webp`,
  email: 'info@hromadovky.cz',
  identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: '76137767' },
  address: { '@type': 'PostalAddress', addressLocality: 'Praha', addressCountry: 'CZ' },
  areaServed: 'CZ',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@hromadovky.cz',
    availableLanguage: 'cs',
  },
  sameAs: ['https://www.instagram.com/hromadovky/'],
};

const SELLER = { '@type': 'Organization', name: 'Hromadovky' } as const;

// Doprava a vrácení pro Product schéma (Google je ukazuje u produktu ve výsledcích
// i v Nákupech). Ceny dopravy drž v sync s CheckoutPage + scripts/generate-feeds.mjs.
const deliveryTime = {
  '@type': 'ShippingDeliveryTime',
  handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
  transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
} as const;
const SHIPPING_DETAILS = [79, 99].map((price) => ({
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: price, currency: 'CZK' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CZ' },
  deliveryTime,
})); // Zásilkovna 79 Kč, PPL 99 Kč

// 14 dní na odstoupení, vrácení poštou na náklady kupujícího (viz TermsPage).
const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'CZ',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
} as const;

// Kategorie = ItemList odkazující na produktové stránky; Product schéma žije na detailech.
const categoryItemListLd = (category: ProductCategory) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: listProducts(category).map((product, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: product.name,
    url: `${SITE.url}${productPath(category, product)}`,
  })),
});

const faqPageLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const customCardsFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: customCardFaqs.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const truncateDescription = (text: string, max = 155): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
};

/** SEO data pro detail produktu (/kvarteta/<slug> apod.) vč. Product + Breadcrumb schémat. */
export const productPageSeo = (category: ProductCategory, product: CatalogProduct): PageSeo => {
  const path = productPath(category, product);
  const info = CATEGORY_INFO[category];
  const offers =
    category === 'pexeso'
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'CZK',
          lowPrice: PEXESO_PRICE_RANGE.low,
          highPrice: PEXESO_PRICE_RANGE.high,
          availability: 'https://schema.org/InStock',
          seller: SELLER,
          // shippingDetails/hasMerchantReturnPolicy Google podporuje jen na Offer, ne AggregateOffer
        }
      : {
          '@type': 'Offer',
          priceCurrency: 'CZK',
          price: product.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: SELLER,
          shippingDetails: SHIPPING_DETAILS,
          hasMerchantReturnPolicy: RETURN_POLICY,
        };
  return {
    title: `${product.name} | Hromadovky`,
    description: truncateDescription(product.description),
    path,
    // encodeURI kvůli mezerám a diakritice v názvech souborů (např. /pexeso/draci/Ignis Rex.png)
    ogImage: encodeURI(product.gallery[0] ?? SITE.defaultOgImage),
    ogImageWidth: product.imgWidth,
    ogImageHeight: product.imgHeight,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        // sku = ID ve feedech (heureka/zbozi/google.xml) → Merchant Center spáruje stránku s položkou
        sku: product.id,
        image: product.gallery.slice(0, 4).map((img) => `${SITE.url}${encodeURI(img)}`),
        url: `${SITE.url}${path}`,
        brand: { '@type': 'Brand', name: 'Hromadovky' },
        offers,
      },
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: info.label, path: info.path },
        { name: product.name, path },
      ]),
    ],
  };
};

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
      categoryItemListLd('kvarteta'),
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
      categoryItemListLd('pexeso'),
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
      categoryItemListLd('karty'),
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: 'Hrací karty', path: '/karty' },
      ]),
    ],
  },
  customCards: {
    title: 'Pexeso, kvarteto a hrací karty z vlastních fotek | Hromadovky',
    description:
      'Vytvořte si pexeso, kvarteto nebo hrací karty z vlastních fotografií. Online editor s náhledem, tisk na fotopapír s laminací, doručení do 5 pracovních dnů.',
    path: '/vlastni-karty',
    jsonLd: [
      customCardsFaqLd,
      breadcrumbLd([
        { name: 'Domů', path: '/' },
        { name: 'Karty z vlastních fotek', path: '/vlastni-karty' },
      ]),
    ],
  },
  faq: {
    title: 'Často kladené otázky | Hromadovky',
    description:
      'Odpovědi na nejčastější otázky o objednávce, dodání, vlastních kartách s fotkami a vrácení zboží. Vše, co potřebujete vědět o Hromadovkách.',
    path: '/faq',
    jsonLd: faqPageLd,
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
  dotaznik: {
    title: 'Dotazník spokojenosti | Hromadovky',
    description: 'Krátký dotazník spokojenosti s objednávkou z e-shopu Hromadovky.',
    path: '/dotaznik',
    noindex: true,
  },
  adminInvoices: {
    title: 'Administrace faktur | Hromadovky',
    description: 'Administrace faktur.',
    path: '/admin/invoices',
    noindex: true,
  },
  adminOrders: {
    title: 'Administrace objednávek | Hromadovky',
    description: 'Administrace objednávek.',
    path: '/admin/objednavky',
    noindex: true,
  },
  adminAnalytics: {
    title: 'Analytika | Hromadovky',
    description: 'Statistiky návštěvnosti a prodejů.',
    path: '/admin/analytika',
    noindex: true,
  },
  notFound: {
    title: 'Stránka nenalezena (404) | Hromadovky',
    description: 'Požadovaná stránka neexistuje nebo byla přesunuta.',
    path: '/404',
    noindex: true,
  },
} as const satisfies Record<string, PageSeo>;

// Paths exposed to crawlers. NOTE: scripts/routes.mjs duplicates the STATIC list (with
// lastmod metadata) because Node ESM cannot import the TS source — keep those in sync when
// adding/removing static routes. Product paths are derived from products.ts on both sides.
export const INDEXABLE_PATHS: readonly string[] = [
  ...Object.values<PageSeo>(SEO)
    .filter((p) => !p.noindex)
    .map((p) => p.path),
  ...(['kvarteta', 'karty', 'pexeso'] as const).flatMap((category) =>
    listProducts(category).map((product) => productPath(category, product)),
  ),
];
