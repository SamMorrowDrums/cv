import Head from 'next/head';

export default function SEO({
  title = 'Sam Morrow',
  description = 'Drummer, software engineer and online-learning fanatic.',
  image = '/homepage-preview.png',
  url = '',
  type = 'website',
  twitterCard = 'summary_large_image'
}) {
  const siteName = 'Sam Morrow';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const fullUrl = url ? `https://sam-morrow.com${url}` : 'https://sam-morrow.com';
  const fullImageUrl = image.startsWith('http') ? image : `https://sam-morrow.com${image}`;
  
  // Generate rectangular image URL for primary use (guaranteed to be under 100KB)
  const isApiImage = image.includes('/api/og-image') || (!image.startsWith('http') && !image.startsWith('/'));
  const rectangularImageUrl = isApiImage ? 
    `https://sam-morrow.com/api/og-image?title=${encodeURIComponent(title)}&format=rectangular` : 
    fullImageUrl;

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
      
      {/* Primary rectangular image for best compatibility */}
      <meta property="og:image" content={rectangularImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={rectangularImageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />
      
      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}