import MarkdownIt from 'markdown-it'

const renderer = new MarkdownIt({html: true, linkify: false, typographer: false})

export function renderMarkdownHtml(markdown) {
  return renderer.render(String(markdown || ''))
}
