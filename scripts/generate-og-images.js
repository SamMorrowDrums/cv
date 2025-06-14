const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Helper function to wrap text intelligently for OpenGraph images
function wrapTitle(title, maxCharsPerLine = 15, maxLines = 2) {
  if (!title || title.length <= maxCharsPerLine) {
    return [title || ''];
  }

  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is longer than max chars, truncate it
        lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
        currentLine = '';
      }
      
      // Stop if we've reached max lines
      if (lines.length >= maxLines) {
        break;
      }
    }
  }
  
  // Add remaining text to last line
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  
  // If we have remaining words and are at max lines, truncate last line
  if (lines.length === maxLines && (currentLine || words.length > 0)) {
    const lastLine = lines[lines.length - 1];
    if (lastLine.length > maxCharsPerLine - 3) {
      lines[lines.length - 1] = lastLine.substring(0, maxCharsPerLine - 3) + '...';
    } else if (!lastLine.endsWith('...')) {
      lines[lines.length - 1] = lastLine + '...';
    }
  }
  
  return lines.filter(line => line.length > 0);
}

// Generate SVG for OG image
function generateSVG(title, subtitle = 'Blog Post') {
  // Wrap the title intelligently
  const titleLines = wrapTitle(title);
  const isMultiLine = titleLines.length > 1;
  
  // Adjust positioning based on number of lines
  const titleStartY = isMultiLine ? 240 : 280;
  const subtitleY = isMultiLine ? 380 : 350;
  
  // Generate title text elements
  const titleElements = titleLines.map((line, index) => 
    `<text x="100" y="${titleStartY + (index * 80)}" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="url(#text)">${line}</text>`
  ).join('\n      ');
  
  // Create a simple SVG image with the title
  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="25%" style="stop-color:#1e293b"/>
          <stop offset="50%" style="stop-color:#334155"/>
          <stop offset="75%" style="stop-color:#475569"/>
          <stop offset="100%" style="stop-color:#64748b"/>
        </linearGradient>
        <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#0ea5e9"/>
          <stop offset="50%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#14b8a6"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Decorative elements -->
      <circle cx="200" cy="150" r="80" fill="#0ea5e9" opacity="0.1"/>
      <circle cx="1000" cy="200" r="120" fill="#8b5cf6" opacity="0.1"/>
      <circle cx="800" cy="500" r="60" fill="#14b8a6" opacity="0.1"/>
      
      <!-- Main title -->
      ${titleElements}
      
      <!-- Subtitle -->
      <text x="100" y="${subtitleY}" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#94a3b8">
        ${subtitle}
      </text>
      
      <!-- Author -->
      <text x="100" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#e2e8f0">
        Sam Morrow
      </text>
      
      <!-- Description -->
      <text x="100" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94a3b8">
        Drummer, software engineer and online-learning fanatic
      </text>
    </svg>
  `;
}

// Generate OG image and save to file
async function generateOGImage(title, outputPath, subtitle = 'Blog Post') {
  try {
    const svg = generateSVG(title, subtitle);
    
    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`Generated OG image: ${outputPath}`);
    
  } catch (error) {
    console.error(`Error generating OG image for "${title}":`, error);
    throw error;
  }
}

// Main function to generate all OG images
async function generateAllOGImages() {
  console.log('Starting OG image generation...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const ogImagesDir = path.join(publicDir, 'og-images');
  
  // Ensure og-images directory exists
  if (!fs.existsSync(ogImagesDir)) {
    fs.mkdirSync(ogImagesDir, { recursive: true });
  }
  
  try {
    // Dynamically import the ES6 module
    const { getAllBlogPosts } = await import('../lib/api.js');
    
    // Get all blog posts
    const blogPosts = getAllBlogPosts();
    console.log(`Found ${blogPosts.length} blog posts`);
    
    // Generate images for each blog post
    for (const post of blogPosts) {
      const filename = `${post.slug}.png`;
      const outputPath = path.join(ogImagesDir, filename);
      
      await generateOGImage(post.title, outputPath, 'Blog Post');
    }
    
    // Generate default images for static pages
    await generateOGImage('Blog', path.join(ogImagesDir, 'blog.png'), 'Sam Morrow');
    await generateOGImage('Sam Morrow', path.join(ogImagesDir, 'home.png'), 'Drummer, software engineer and online-learning fanatic');
    
    console.log('OG image generation complete!');
    
  } catch (error) {
    console.error('Error generating OG images:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateAllOGImages();
}

module.exports = { generateAllOGImages, generateOGImage };