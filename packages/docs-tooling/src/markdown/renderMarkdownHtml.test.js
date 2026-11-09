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

test('re-escapes decoded dollars as entities in all text-bearing rules', () => {
  // markdown-it decodes the writer's `&#36;` prose escape back to a bare `$`;
  // every rendered rule must restore it or remark-math pairs dollars across
  // JSX tags. The escape is `&#36;` — never `\$`, which escapeCurrencyDollars
  // would double-process into a visible literal entity.
  assert.equal(renderMarkdownHtml('`$meta`'), '<p><code>&#36;meta</code></p>\n')
  assert.equal(
    renderMarkdownHtml('via `$meta`: `$meta["dynamic_key"]`'),
    '<p>via <code>&#36;meta</code>: <code>&#36;meta[&quot;dynamic_key&quot;]</code></p>\n',
  )
  assert.equal(renderMarkdownHtml('price is $5'), '<p>price is &#36;5</p>\n')
  assert.equal(renderMarkdownHtml('set $HOME/$PATH first'), '<p>set &#36;HOME/&#36;PATH first</p>\n')
  assert.equal(
    renderMarkdownHtml('```bash\nexport A=$X; echo $Y\n```'),
    '<pre><code class="language-bash">export A=&#36;X; echo &#36;Y\n</code></pre>\n',
  )
  // Braces keep their existing MDX escape at the cell level; entities only
  // cover dollars here.
  assert.equal(renderMarkdownHtml('a {b} `c`'), '<p>a {b} <code>c</code></p>\n')
})
