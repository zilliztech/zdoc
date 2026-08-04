'use strict'

const MarkdownIt = require('markdown-it')

const renderer = new MarkdownIt({html: true, linkify: false, typographer: false})

function renderMarkdownHtml(markdown) {
  return renderer.render(String(markdown || ''))
}

module.exports = {renderMarkdownHtml}
