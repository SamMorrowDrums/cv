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
  
  // Generate rectangular and square image URLs for better social media coverage
  const isApiImage = image.includes('/api/og-image') || (!image.startsWith('http') && !image.startsWith('/'));
  const rectangularImageUrl = isApiImage ? 
    `https://sam-morrow.com/api/og-image?title=${encodeURIComponent(title)}&format=rectangular` : 
    fullImageUrl;
  
  // For square images, we need to handle both API and static images differently
  let squareImageUrl;
  if (isApiImage) {
    squareImageUrl = `https://sam-morrow.com/api/og-image?title=${encodeURIComponent(title)}&format=square`;
  } else {
    // For static images, try to find the square version by adding -square suffix
    const imageExtension = fullImageUrl.lastIndexOf('.') > -1 ? fullImageUrl.substring(fullImageUrl.lastIndexOf('.')) : '.png';
    const imageBase = fullImageUrl.substring(0, fullImageUrl.lastIndexOf('.') > -1 ? fullImageUrl.lastIndexOf('.') : fullImageUrl.length);
    squareImageUrl = `${imageBase}-square${imageExtension}`;
  }

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
      
      {/* Square image for better social media coverage */}
      <meta property="og:image" content={squareImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
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