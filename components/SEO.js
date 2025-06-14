import Head from 'next/head';

export default function SEO({
  title = 'Sam Morrow',
  description = 'Drummer, software engineer and online-learning fanatic.',
  image = '/homepage-preview.jpg',
  url = '',
  type = 'website',
  twitterCard = 'summary_large_image'
}) {
  const siteName = 'Sam Morrow';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const fullUrl = url ? `https://sammorrow.dev${url}` : 'https://sammorrow.dev';
  const fullImageUrl = image.startsWith('http') ? image : `https://sammorrow.dev${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}