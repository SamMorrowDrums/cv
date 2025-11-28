import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://sam-morrow.com';
const SITE_TITLE = 'Sam Morrow';
const SITE_DESCRIPTION = 'Drummer, software engineer and online-learning fanatic.';

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssItem(post) {
  const link = `${SITE_URL}/blog/${post.slug}`;
  const pubDate = new Date(post.date).toUTCString();
  
  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt || '')}</description>
    </item>`;
}

function generateRssFeed(posts) {
  const lastBuildDate = new Date().toUTCString();
  
  const items = posts.map(generateRssItem).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

async function generateRss() {
  console.log('Starting RSS feed generation...');
  
  const publicDir = path.join(process.cwd(), 'public');
  
  try {
    // Import the ES6 module
    const { getAllBlogPosts } = await import('../lib/api.js');
    
    // Get all blog posts
    const blogPosts = getAllBlogPosts();
    console.log(`Found ${blogPosts.length} blog posts`);
    
    // Generate RSS feed
    const rssFeed = generateRssFeed(blogPosts);
    
    // Write to public directory
    const rssPath = path.join(publicDir, 'rss.xml');
    fs.writeFileSync(rssPath, rssFeed, 'utf-8');
    console.log(`Generated RSS feed: ${rssPath}`);
    
    console.log('RSS feed generation complete!');
    
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    // Don't exit with error code - let the build continue
    console.log('RSS feed generation failed, but continuing with build...');
  }
}

// Run the script
generateRss();

export { generateRss, generateRssFeed };
