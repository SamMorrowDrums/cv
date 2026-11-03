import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const textWidthCache = new Map();

// Measure rendered width with the build machine's fonts, which differ between
// local, CI and Netlify, so wrapping never relies on guessed character widths.
async function measureText(text, fontSize, fontWeight) {
  const key = `${fontSize}:${fontWeight}:${text}`;
  if (!textWidthCache.has(key)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(fontSize * (text.length + 2))}" height="${fontSize * 2}"><text x="${fontSize}" y="${Math.round(fontSize * 1.4)}" font-family="${FONT_FAMILY}" font-size="${fontSize}" font-weight="${fontWeight}">${escapeXml(text)}</text></svg>`;
    const { info } = await sharp(Buffer.from(svg)).trim().toBuffer({ resolveWithObject: true });
    textWidthCache.set(key, info.width);
  }
  return textWidthCache.get(key);
}

async function wrapToWidth(text, fontSize, fontWeight, maxWidth) {
  const lines = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || await measureText(candidate, fontSize, fontWeight) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const LAYOUTS = {
  square: {
    titleSizes: [128, 112, 100, 88, 80, 72],
    maxLines: 4,
    subtitleFontSize: 44,
    regionTop: 100,
    regionHeight: 860,
    authorY: 1040,
    authorFontSize: 40,
    descY: 1090,
    descFontSize: 28,
  },
  rectangular: {
    titleSizes: [72, 64, 56],
    maxLines: 3,
    subtitleFontSize: 32,
    regionTop: 50,
    regionHeight: 420,
    authorY: 520,
    authorFontSize: 28,
    descY: 560,
    descFontSize: 20,
  },
};

// Use the largest title size that fits the whole title within the image.
async function fitTitle(title, sizes, maxLines, maxWidth) {
  for (const fontSize of sizes) {
    const lines = await wrapToWidth(title, fontSize, 900, maxWidth);
    const widths = await Promise.all(lines.map((line) => measureText(line, fontSize, 900)));
    if (lines.length <= maxLines && widths.every((width) => width <= maxWidth)) {
      return { lines, fontSize };
    }
  }
  const fontSize = sizes[sizes.length - 1];
  const lines = await wrapToWidth(title, fontSize, 900, maxWidth);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] += '…';
  }
  return { lines, fontSize };
}

// Lay out the full title as large as space allows.
async function getLayout(title, subtitle, format) {
  const config = LAYOUTS[format];
  const maxWidth = 1000;
  const { lines, fontSize } = await fitTitle(title, config.titleSizes, config.maxLines, maxWidth);
  const lineHeight = Math.round(fontSize * 1.1);

  let subtitleFontSize = config.subtitleFontSize;
  const subtitleWidth = await measureText(subtitle, subtitleFontSize, 400);
  if (subtitleWidth > maxWidth) {
    subtitleFontSize = Math.floor(subtitleFontSize * maxWidth / subtitleWidth);
  }

  // Centre the title and subtitle between the top edge and the author footer.
  const subtitleGap = Math.round(fontSize * 0.35) + subtitleFontSize;
  const blockHeight = Math.round(fontSize * 0.75) + (lines.length - 1) * lineHeight + subtitleGap;
  const titleStartY = Math.round(config.regionTop + (config.regionHeight - blockHeight) / 2 + fontSize * 0.75);

  return {
    titleLines: lines,
    titleFontSize: fontSize,
    lineHeight,
    titleStartY,
    subtitleY: titleStartY + (lines.length - 1) * lineHeight + subtitleGap,
    subtitleFontSize,
    authorY: config.authorY,
    authorFontSize: config.authorFontSize,
    descY: config.descY,
    descFontSize: config.descFontSize,
  };
}

// Generate SVG for OG image
async function generateSVG(title, subtitle = 'Blog Post', format = 'rectangular') {
  // Determine dimensions based on format
  const isSquare = format === 'square';
  const width = 1200;
  const height = isSquare ? 1200 : 630;
  
  const layout = await getLayout(title, subtitle, isSquare ? 'square' : 'rectangular');
  const { titleLines, titleFontSize, lineHeight, titleStartY, subtitleY, subtitleFontSize, authorY, authorFontSize, descY, descFontSize } = layout;
  
  // Generate title text elements
  const titleElements = titleLines.map((line, index) => 
    `<text x="100" y="${titleStartY + (index * lineHeight)}" font-family="${FONT_FAMILY}" font-size="${titleFontSize}" font-weight="900" fill="url(#text)">${escapeXml(line)}</text>`
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
      <text x="100" y="${subtitleY}" font-family="${FONT_FAMILY}" font-size="${subtitleFontSize}" fill="#94a3b8">
        ${escapeXml(subtitle)}
      </text>
      
      <!-- Author -->
      <text x="100" y="${authorY}" font-family="${FONT_FAMILY}" font-size="${authorFontSize}" font-weight="600" fill="#e2e8f0">
        Sam Morrow
      </text>
      
      <!-- Description -->
      <text x="100" y="${descY}" font-family="${FONT_FAMILY}" font-size="${descFontSize}" fill="#94a3b8">
        Drummer, software engineer and online-learning fanatic
      </text>
    </svg>
  `;
}

// Generate OG image and save to file
async function generateOGImage(title, outputPath, subtitle = 'Blog Post', format = 'rectangular') {
  try {
    const svg = await generateSVG(title, subtitle, format);
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

// Generate OG image from a content image (letterboxed to OG dimensions)
async function generateOGImageFromContent(imagePath, outputPath, format = 'rectangular') {
  try {
    const isSquare = format === 'square';
    const width = 1200;
    const height = isSquare ? 1200 : 630;
    
    const publicDir = path.join(process.cwd(), 'public');
    const fullImagePath = path.join(publicDir, imagePath);
    
    if (!fs.existsSync(fullImagePath)) {
      return false;
    }
    
    const ext = path.extname(fullImagePath).toLowerCase();
    const isPng = ext === '.png';
    const bgColor = isPng ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 31, g: 41, b: 55, alpha: 1 }; // transparent or charcoal
    
    let pngBuffer = await sharp(fullImagePath)
      .resize(width, height, {
        fit: 'contain',
        background: bgColor,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    // Ensure under 100KB
    if (pngBuffer.length > 100 * 1024) {
      pngBuffer = await sharp(fullImagePath)
        .resize(width, height, {
          fit: 'contain',
          background: bgColor,
        })
        .png({ compressionLevel: 9, quality: 60 })
        .toBuffer();
    }
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`Generated OG image from content: ${outputPath} (${Math.round(pngBuffer.length / 1024)}KB)`);
    return true;
  } catch (error) {
    console.warn(`Failed to generate OG from content image: ${error.message}`);
    return false;
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
  
  // Import the ES6 modules
  const { getAllBlogPosts } = await import('../lib/api.mjs');
  const { extractFirstImage } = await import('../lib/seo.mjs');

  const blogPosts = getAllBlogPosts();
  console.log(`Found ${blogPosts.length} blog posts`);

  for (const post of blogPosts) {
    const outputPathRect = path.join(ogImagesDir, `${post.slug}.png`);
    const outputPathSquare = path.join(ogImagesDir, `${post.slug}-square.png`);
    const contentImage = extractFirstImage(post.content);

    if (contentImage && !contentImage.startsWith('http')) {
      const usedRect = await generateOGImageFromContent(contentImage, outputPathRect, 'rectangular');
      const usedSquare = await generateOGImageFromContent(contentImage, outputPathSquare, 'square');
      if (usedRect && usedSquare) continue;
    }

    // Fallback to generated SVG OG image
    await generateOGImage(post.title, outputPathRect, 'Blog Post', 'rectangular');
    await generateOGImage(post.title, outputPathSquare, 'Blog Post', 'square');
  }

  await generateOGImage('Blog', path.join(ogImagesDir, 'blog.png'), 'Sam Morrow', 'rectangular');
  await generateOGImage('Blog', path.join(ogImagesDir, 'blog-square.png'), 'Sam Morrow', 'square');
  await generateOGImage('Sam Morrow', path.join(ogImagesDir, 'home.png'), 'Drummer, software engineer and online-learning fanatic', 'rectangular');
  await generateOGImage('Sam Morrow', path.join(ogImagesDir, 'home-square.png'), 'Drummer, software engineer and online-learning fanatic', 'square');

  console.log('OG image generation complete!');
}

// Run the script
generateAllOGImages().catch((error) => {
  console.error('Error generating OG images:', error);
  process.exitCode = 1;
});

export { generateAllOGImages, generateOGImage };