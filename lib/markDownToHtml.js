import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import remarkYouTubeEmbed from './remarkYouTubeEmbed.js'
import remarkLinkImages from './remarkLinkImages.js'

export default async function markdownToHtml(markdown) {
    const result = await remark()
        .use(remarkGfm)
        .use(remarkYouTubeEmbed)
        .use(remarkLinkImages)
        .use(remarkHtml, { sanitize: false })
        .process(markdown)
    return result.toString()
}

