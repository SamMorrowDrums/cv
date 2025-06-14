// Utility functions for SEO and social media previews

/**
 * Extract the first image URL from markdown content
 * @param {string} content - Markdown content
 * @returns {string|null} - First image URL or null if none found
 */
export function extractFirstImage(content) {
  if (!content) return null;
  
  // Match markdown image syntax: ![alt](url) or ![alt](url "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)"]*?)(?:\s+"([^"]*)")?\)/;
  const match = content.match(imageRegex);
  
  if (match && match[2]) {
    const imageUrl = match[2].trim();
    // Return full URL if it's already absolute, otherwise make it relative to the site
    return imageUrl.startsWith('http') ? imageUrl : imageUrl;
  }
  
  return null;
}

/**
 * Generate SEO-friendly excerpt from content
 * @param {string} content - Content to excerpt
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} - Generated excerpt
 */
export function generateSEOExcerpt(content, maxLength = 160) {
  if (!content) return '';
  
  // Remove markdown formatting
  const cleanContent = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/`([^`]+)`/g, '$1') // Remove code formatting
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // If no good sentence break, find last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Generate a fallback social media image URL for a blog post
 * @param {string} title - Blog post title
 * @param {string} baseUrl - Base URL of the site
 * @param {string} slug - Blog post slug for static images
 * @returns {string} - URL to generated image
 */
export function generateFallbackImage(title, baseUrl = 'https://sam-morrow.com', slug = null) {
  // Use pre-generated static images instead of dynamic API
  if (slug) {
    return `${baseUrl}/og-images/${slug}.png`;
  }
  
  // For non-blog posts, use a generic fallback
  const encodedTitle = encodeURIComponent(title);
  return `${baseUrl}/api/og-image?title=${encodedTitle}`;
}

/**
 * Get social media meta information for a blog post
 * @param {Object} post - Blog post object with title, content, excerpt, etc.
 * @param {string} baseUrl - Base URL of the site
 * @returns {Object} - Meta information for social sharing
 */
export function getBlogPostMeta(post, baseUrl = 'https://sam-morrow.com') {
  const title = post.title;
  const description = post.excerpt || generateSEOExcerpt(post.content);
  const url = `/blog/${post.slug}`;
  
  // Try to extract image from content, or use from frontmatter
  let image = post.image || extractFirstImage(post.content);
  
  // If no image found, generate a fallback using the slug for static images
  if (!image) {
    image = generateFallbackImage(title, baseUrl, post.slug);
  } else if (!image.startsWith('http')) {
    // Make relative URLs absolute
    image = `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  }
  
  return {
    title,
    description,
    image,
    url,
    type: 'article'
  };
}