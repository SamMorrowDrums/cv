import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Helper function to wrap text intelligently for OpenGraph images
function wrapTitle(title, format = 'rectangular', maxLines = 2) {
  // Adjust character limits based on format - more characters for rectangular format
  const maxCharsPerLine = format === 'square' ? 12 : 18;
  
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
function generateSVG(title, subtitle = 'Blog Post', format = 'rectangular') {
  // Determine dimensions based on format
  const isSquare = format === 'square';
  const width = 1200;
  const height = isSquare ? 1200 : 630;
  
  // Wrap the title intelligently based on format
  const titleLines = wrapTitle(title, format);
  const isMultiLine = titleLines.length > 1;
  
  // Adjust positioning and sizing based on format and number of lines
  let titleStartY, subtitleY, titleFontSize, authorY, descY;
  
  if (isSquare) {
    // Square format positioning - more vertical space
    titleStartY = isMultiLine ? 320 : 400;
    subtitleY = isMultiLine ? 520 : 480;
    titleFontSize = isMultiLine ? 64 : 72;
    authorY = 720;
    descY = 760;
  } else {
    // Rectangular format positioning - same as before
    titleStartY = isMultiLine ? 240 : 280;
    subtitleY = isMultiLine ? 380 : 350;
    titleFontSize = 72;
    authorY = 520;
    descY = 560;
  }
  
  // Generate title text elements
  const titleElements = titleLines.map((line, index) => 
    `<text x="100" y="${titleStartY + (index * (titleFontSize + 8))}" font-family="system-ui, -apple-system, sans-serif" font-size="${titleFontSize}" font-weight="900" fill="url(#text)">${line}</text>`
  ).join('\n      ');
  
  // Adjust decorative elements for square format - minimal elements for smaller file size
  const decorativeElements = isSquare ? `
    <circle cx="200" cy="200" r="40" fill="#0ea5e9" opacity="0.06"/>
    <circle cx="1000" cy="300" r="60" fill="#8b5cf6" opacity="0.06"/>
  ` : `
    <circle cx="200" cy="150" r="80" fill="#0ea5e9" opacity="0.1"/>
    <circle cx="1000" cy="200" r="120" fill="#8b5cf6" opacity="0.1"/>
    <circle cx="800" cy="500" r="60" fill="#14b8a6" opacity="0.1"/>
  `;
  
  // Create SVG with appropriate dimensions
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
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
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Decorative elements -->
      ${decorativeElements}
      
      <!-- Main title -->
      ${titleElements}
      
      <!-- Subtitle -->
      <text x="100" y="${subtitleY}" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#94a3b8">
        ${subtitle}
      </text>
      
      <!-- Author -->
      <text x="100" y="${authorY}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#e2e8f0">
        Sam Morrow
      </text>
      
      <!-- Description -->
      <text x="100" y="${descY}" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94a3b8">
        Drummer, software engineer and online-learning fanatic
      </text>
    </svg>
  `;
}

// Generate OG image and save to file
async function generateOGImage(title, outputPath, subtitle = 'Blog Post', format = 'rectangular') {
  try {
    const svg = generateSVG(title, subtitle, format);
    const isSquare = format === 'square';
    
    // Convert SVG to PNG using Sharp with optimization
    // Use more aggressive compression for square images to meet size limits
    const initialQuality = isSquare ? 60 : 80;
    let pngBuffer = await sharp(Buffer.from(svg))
      .png({ 
        compressionLevel: 9,
        quality: initialQuality,
        effort: 10
      })
      .toBuffer();

    // Check file size and optimize if needed to stay under 100KB
    if (pngBuffer.length > 100 * 1024) { // 100KB limit
      pngBuffer = await sharp(Buffer.from(svg))
        .png({ 
          compressionLevel: 9,
          quality: isSquare ? 40 : 50,
          effort: 10
        })
        .toBuffer();
        
      // If still too large, try even more aggressive compression
      if (pngBuffer.length > 100 * 1024) {
        pngBuffer = await sharp(Buffer.from(svg))
          .png({ 
            compressionLevel: 9,
            quality: isSquare ? 30 : 40,
            effort: 10
          })
          .toBuffer();
      }
    }
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`Generated OG image: ${outputPath} (${Math.round(pngBuffer.length / 1024)}KB)`);
    
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
    // Import the ES6 module
    const { getAllBlogPosts } = await import('../lib/api.js');
    
    // Get all blog posts
    const blogPosts = getAllBlogPosts();
    console.log(`Found ${blogPosts.length} blog posts`);
    
    // Generate images for each blog post
    for (const post of blogPosts) {
      const filenameRect = `${post.slug}.png`;
      const filenameSquare = `${post.slug}-square.png`;
      const outputPathRect = path.join(ogImagesDir, filenameRect);
      const outputPathSquare = path.join(ogImagesDir, filenameSquare);
      
      try {
        // Generate rectangular version
        await generateOGImage(post.title, outputPathRect, 'Blog Post', 'rectangular');
        // Generate square version
        await generateOGImage(post.title, outputPathSquare, 'Blog Post', 'square');
      } catch (error) {
        console.warn(`Failed to generate OG images for ${post.slug}:`, error.message);
      }
    }
    
    // Generate default images for static pages
    try {
      await generateOGImage('Blog', path.join(ogImagesDir, 'blog.png'), 'Sam Morrow', 'rectangular');
      await generateOGImage('Blog', path.join(ogImagesDir, 'blog-square.png'), 'Sam Morrow', 'square');
    } catch (error) {
      console.warn('Failed to generate blog OG images:', error.message);
    }
    
    try {
      await generateOGImage('Sam Morrow', path.join(ogImagesDir, 'home.png'), 'Drummer, software engineer and online-learning fanatic', 'rectangular');
      await generateOGImage('Sam Morrow', path.join(ogImagesDir, 'home-square.png'), 'Drummer, software engineer and online-learning fanatic', 'square');
    } catch (error) {
      console.warn('Failed to generate home OG images:', error.message);
    }
    
    console.log('OG image generation complete!');
    
  } catch (error) {
    console.error('Error generating OG images:', error);
    // Don't exit with error code - let the build continue
    console.log('OG image generation failed, but continuing with build...');
  }
}

// Run the script
generateAllOGImages();

export { generateAllOGImages, generateOGImage };