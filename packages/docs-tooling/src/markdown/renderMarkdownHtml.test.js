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
