import { visit, SKIP } from 'unist-util-visit'

export default function remarkLinkImages() {
  return (tree) => {
    visit(tree, 'image', (node, index, parent) => {
      if (!parent || index == null) return
      if (parent.type === 'link') return

      const link = {
        type: 'link',
        url: node.url,
        title: node.title || null,
        children: [node],
        data: {
          hProperties: {
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': node.alt ? `Open image: ${node.alt}` : 'Open image in new tab',
          },
        },
      }

      parent.children[index] = link
      return [SKIP, index + 1]
    })
  }
}
