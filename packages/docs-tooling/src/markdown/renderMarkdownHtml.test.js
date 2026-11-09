const assert = require('node:assert/strict')
const test = require('node:test')
const {renderMarkdownHtml} = require('./renderMarkdownHtml')

test('renders the markdown subset used by Lark table cells', () => {
  assert.equal(
    renderMarkdownHtml('**bold** and [docs](https://example.com)').trim(),
    '<p><strong>bold</strong> and <a href="https://example.com">docs</a></p>',
  )
  assert.match(renderMarkdownHtml('- one\n- two'), /<ul>[\s\S]*<li>one<\/li>[\s\S]*<li>two<\/li>[\s\S]*<\/ul>/)
  assert.match(renderMarkdownHtml('`code`'), /<code>code<\/code>/)
})

test('wraps protected Admonition placeholders for Lark table restoration', () => {
  assert.equal(renderMarkdownHtml('%%ADMONITION_0%%').trim(), '<p>%%ADMONITION_0%%</p>')
})

test('escapes dollars inside inline-code chips for MDX JSX cells', () => {
  // remark-math pairs `$` across <code> tags once backticks are gone; the
  // escaped dollar survives MDX text parsing and renders as a literal `$`.
  assert.equal(renderMarkdownHtml('`$meta`'), '<p><code>\\$meta</code></p>\n')
  assert.equal(
    renderMarkdownHtml('via `$meta`: `$meta["dynamic_key"]`'),
    '<p>via <code>\\$meta</code>: <code>\\$meta[&quot;dynamic_key&quot;]</code></p>\n',
  )
  // Prose dollars are untouched here; the writer text_run path already
  // escapes those as &#36; before this renderer runs.
  assert.equal(renderMarkdownHtml('price is $5'), '<p>price is $5</p>\n')
})
