import { Helmet } from 'react-helmet-async';
import { SITE, type JsonLdSchema, type PageSeo } from '../../data/seo';

type PageHeadProps = PageSeo;

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// `JSON.stringify` neeskapuje `</script>` ani HTML komentář `<!--` — pokud by se
// taková sekvence dostala do schema dat (popis produktu apod.), prohlížeč by
// předčasně uzavřel `<script>` tag a interpretoval zbytek jako HTML/JS (XSS).
// Vrací '{}' pro prázdné schéma, aby zaručil platný JSON-LD obsah v <script>.
function safeJsonLd(schema: JsonLdSchema): string {
  const json = JSON.stringify(schema);
  if (!json) return '{}';
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function PageHead({ title, description, path, noindex, ogImage, jsonLd }: PageHeadProps) {
  const url = `${SITE.url}${path}`;
  const image = `${SITE.url}${ogImage ?? SITE.defaultOgImage}`;
  const jsonLdArray = toArray(jsonLd);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdArray.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {safeJsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
}
