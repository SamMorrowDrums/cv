import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkYouTubeEmbed from './remarkYouTubeEmbed.js'

export default async function markdownToHtml(markdown) {
    const result = await remark()
        .use(remarkYouTubeEmbed)
        .use(remarkHtml, { sanitize: false })
        .process(markdown)
    return result.toString()
}

