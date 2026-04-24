import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  productSchema?: {
    name: string;
    price: number;
    description: string;
    image: string;
  };
}

const DEFAULT_TITLE = 'Northernwest — Cyberpunk Computer Accessories';
const DEFAULT_DESC =
  'Shop premium mechanical keyboards, gaming mice, and headphones. Northernwest — gear up your setup.';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = 'https://northernwest.io';

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  productSchema,
}: SEOHeadProps) {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | Northernwest`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Northernwest',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.png`,
    sameAs: [
      'https://twitter.com/northernwest',
      'https://instagram.com/northernwest',
    ],
  };

  const productJsonLd = productSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productSchema.name,
        description: productSchema.description,
        image: productSchema.image,
        offers: {
          '@type': 'Offer',
          price: productSchema.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="mechanical keyboard, gaming mouse, gaming headphones, computer accessories, cyberpunk peripherals, Northernwest"
      />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Northernwest" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      {productJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      )}
    </Helmet>
  );
}
