// Simple SVG-based Open Graph image generation

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

export default function handler(req, res) {
  const { title = 'Sam Morrow', subtitle = 'Blog Post' } = req.query;
  
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
  const svg = `
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

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.status(200).send(svg);
}