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

function getStandaloneUrl(node) {
  if (node.children.length !== 1) return null
  const child = node.children[0]

  if (child.type === 'text') return child.value.trim()

  // remark-gfm autolinks bare URLs, so a standalone URL arrives as a link whose text is the URL
  if (
    child.type === 'link' &&
    child.children.length === 1 &&
    child.children[0].type === 'text' &&
    child.children[0].value.trim() === child.url
  ) {
    return child.url
  }

  return null
}

export default function remarkYouTubeEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      const url = getStandaloneUrl(node)
      const videoId = url && extractVideoId(url)

      if (videoId) {
        parent.children[index] = createYouTubeIframe(videoId)
      }
    })
  }
}