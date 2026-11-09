'use strict'

const MarkdownIt = require('markdown-it')

const renderer = new MarkdownIt({html: true, linkify: false, typographer: false})

const DOLLAR = /\$/g

// markdown-it decodes the writer's &#36; escape back to a bare `$` while
// rendering (the writer escapes prose dollars per the #533 prose fix, and this
// decode step silently dropped that protection for table cells). Re-escape the
// decoded dollars on every text-bearing rule so a bare `$` never reaches the
// MDX text layer, where remark-math would pair them across JSX tags.
//
// The escape must be `&#36;`, not `\$`: this output flows into `__mdx_patches`
// whose escapeCurrencyDollars pass rewrites a bare `$` before a digit into
// `&#36;` without checking for a preceding backslash, so a chip rendered as
// `\$5` would become `\&#36;5` and MDX would show the literal entity. MDX
// decodes `&#36;` to a literal `$` in JSX text (inside <code> too) and
// remark-math cannot pair it.
const literalDollars = rule => (...args) => rule(...args).replace(DOLLAR, '&#36;')

for (const name of ['text', 'code_inline', 'code_block', 'fence']) {
  renderer.renderer.rules[name] = literalDollars(renderer.renderer.rules[name])
}

function renderMarkdownHtml(markdown) {
  return renderer.render(String(markdown || ''))
}

module.exports = {renderMarkdownHtml}
