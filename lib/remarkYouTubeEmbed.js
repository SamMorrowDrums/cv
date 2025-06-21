import { visit } from 'unist-util-visit'

const YOUTUBE_REGEX = /^https?:\/\/(?:www\.)?(youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S+)?$/

function extractVideoId(url) {
  const match = url.match(YOUTUBE_REGEX)
  if (!match) return null
  
  // Handle youtube.com/watch?v= or youtube.com/live/
  if (match[0].includes('youtube.com/watch?v=')) {
    const urlParams = new URLSearchParams(new URL(url).search)
    return urlParams.get('v')
  }
  
  // Handle youtube.com/live/ or youtu.be/
  return match[2]
}

function createYouTubeIframe(videoId) {
  return {
    type: 'html',
    value: `<div class="youtube-embed"><iframe 
      src="https://www.youtube.com/embed/${videoId}" 
      title="YouTube video player" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen>
    </iframe></div>`
  }
}

export default function remarkYouTubeEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      // Check if paragraph contains a single text node with a YouTube URL
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const text = node.children[0].value.trim()
        const videoId = extractVideoId(text)
        
        if (videoId) {
          // Replace the paragraph with iframe HTML
          parent.children[index] = createYouTubeIframe(videoId)
        }
      }
    })
  }
}