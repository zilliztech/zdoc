'use strict'

const MarkdownIt = require('markdown-it')

const renderer = new MarkdownIt({html: true, linkify: false, typographer: false})

// Inline-code chips destined for MDX JSX cells lose their backtick protection
// here: the emitted `<code>` tag text is parsed by micromark, which pairs `$`
// delimiters across tags and swallows them into a math node. Escape the dollar
// the way the MDX text layer expects so chips like `$meta` stay literal.
renderer.renderer.rules.code_inline = (tokens, idx) => {
  const content = renderer.utils.escapeHtml(tokens[idx].content)
  return `<code>${content.replace(/\$/g, () => '\\$')}</code>`
}

function renderMarkdownHtml(markdown) {
  return renderer.render(String(markdown || ''))
}

module.exports = {renderMarkdownHtml}
