import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import remarkYouTubeEmbed from './remarkYouTubeEmbed.js'

export default async function markdownToHtml(markdown) {
    const result = await remark()
        .use(remarkGfm)
        .use(remarkYouTubeEmbed)
        .use(remarkHtml, { sanitize: false })
        .process(markdown)
    return result.toString()
}

