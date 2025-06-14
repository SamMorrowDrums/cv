import Head from 'next/head';

export default function SEO({
  title = 'Sam Morrow',
  description = 'Drummer, software engineer and online-learning fanatic.',
  image = '/homepage-preview.png',
  url = '',
  type = 'website',
  twitterCard = 'summary_large_image',
  author = null,
  publishedTime = null
}) {
  const siteName = 'Sam Morrow';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const fullUrl = url ? `https://sam-morrow.com${url}` : 'https://sam-morrow.com';
  const fullImageUrl = image.startsWith('http') ? image : `https://sam-morrow.com${image}`;
  
  // Generate rectangular and square image URLs for better social media coverage
  // Since we're using static export, all images should be static files
  const rectangularImageUrl = fullImageUrl;
  
  // For square images, try to find the square version by adding -square suffix
  const imageExtension = fullImageUrl.lastIndexOf('.') > -1 ? fullImageUrl.substring(fullImageUrl.lastIndexOf('.')) : '.png';
  const imageBase = fullImageUrl.substring(0, fullImageUrl.lastIndexOf('.') > -1 ? fullImageUrl.lastIndexOf('.') : fullImageUrl.length);
  const squareImageUrl = `${imageBase}-square${imageExtension}`;

  // JSON-LD structured data for better social media and search engine recognition
  const structuredData = type === 'article' && author && publishedTime ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": fullTitle,
    "description": description,
    "image": [rectangularImageUrl, squareImageUrl],
    "datePublished": publishedTime,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://sam-morrow.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "Sam Morrow",
      "url": "https://sam-morrow.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  } : {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "description": description,
    "url": fullUrl,
    "image": [rectangularImageUrl, squareImageUrl],
    "author": {
      "@type": "Person",
      "name": "Sam Morrow",
      "url": "https://sam-morrow.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "Sam Morrow",
      "url": "https://sam-morrow.com"
    }
  };

  return (
    <Head>
      {/* Static site indicator for debugging */}
      <meta name="static-site" content="true" />
      
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
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      
      {/* Square image for better social media coverage */}
      <meta property="og:image" content={squareImageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:alt" content={fullTitle} />
      
      <meta property="og:site_name" content={siteName} />
      
      {/* Article-specific metadata for blog posts */}
      {type === 'article' && author && (
        <>
          <meta property="article:author" content={author} />
          <meta name="author" content={author} />
        </>
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@SamMorrowDrums" />
      <meta name="twitter:creator" content="@SamMorrowDrums" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={rectangularImageUrl} />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <meta name="twitter:image:alt" content={fullTitle} />
      

      
      {/* JSON-LD structured data for better recognition */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}