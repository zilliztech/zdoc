import {expect, test} from 'vitest'
import {textFilter} from '../components/RestSpecs/utils.js'
import {renderMarkdownHtml} from './renderMarkdownHtml.js'

test('renders links, lists, code fences, and block HTML for REST content', () => {
  const html = renderMarkdownHtml([
    '[docs](https://example.com)',
    '',
    '- one',
    '- two',
    '',
    '~~~bash',
    'echo hi',
    '~~~',
    '',
    '<div>block</div>',
  ].join('\n'))

  expect(html).toContain('<a href="https://example.com">docs</a>')
  expect(html).toContain('<ul>\n<li>one</li>\n<li>two</li>\n</ul>')
  expect(html).toContain('<pre><code class="language-bash">echo hi\n</code></pre>')
  expect(html.trim()).toMatch(/<div>block<\/div>$/)
})

test('textFilter preserves nested include and exclude tags before rendering REST markdown', () => {
  const html = textFilter([
    'Visible <include target="zilliz">**bold** <exclude target="milvus">and [docs](https://example.com)</exclude></include>',
    '',
    '- one',
    '- two',
    '',
    '~~~bash',
    'echo hi',
    '~~~',
    '',
    '<div>block</div>',
  ].join('\n'), 'zilliz')

  expect(html.trim()).toBe([
    '<p>Visible <strong>bold</strong> and <a href="https://example.com">docs</a></p>',
    '<ul>',
    '<li>one</li>',
    '<li>two</li>',
    '</ul>',
    '<pre><code class="language-bash">echo hi',
    '</code></pre>',
    '<div>block</div>',
  ].join('\n'))
})
