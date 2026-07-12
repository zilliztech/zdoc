'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  classifyResult,
  collectExternalLinks,
  evaluateBaseline,
  extractExternalLinks,
} = require('./check-404')

test('excludes markdown images from external page links', () => {
  const content = '![diagram](https://cdn.example.com/diagram.png "diagram title")'
  assert.deepEqual(extractExternalLinks(content), [])
})

test('removes an optional markdown title from a page URL', () => {
  const content = '[Guide](https://example.com/guide "Guide title")'
  assert.deepEqual(extractExternalLinks(content), [{ url: 'https://example.com/guide', line: 1 }])
})

test('ignores links inside fenced code blocks and placeholder URLs', () => {
  const content = [
    '```md',
    '[Example](https://example.com/not-a-real-link)',
    '```',
    '[Template](https://{cluster-id}.example.com)',
    '[Real](https://example.com/real)',
  ].join('\n')

  assert.deepEqual(extractExternalLinks(content), [{ url: 'https://example.com/real', line: 5 }])
})

test('collects every source location for a duplicated URL', () => {
  const links = collectExternalLinks([
    { file: 'docs/one.md', content: '[One](https://example.com/page)' },
    { file: 'docs/two.md', content: '\n[Two](https://example.com/page)' },
  ])

  assert.deepEqual(links, [{
    url: 'https://example.com/page',
    sources: [
      { file: 'docs/one.md', line: 1 },
      { file: 'docs/two.md', line: 2 },
    ],
  }])
})

test('classifies only confirmed missing responses as broken', () => {
  assert.equal(classifyResult({ status: 404 }), 'broken')
  assert.equal(classifyResult({ status: 410 }), 'broken')
  assert.equal(classifyResult({ status: 403 }), 'blocked')
  assert.equal(classifyResult({ status: 429 }), 'transient')
  assert.equal(classifyResult({ status: 503 }), 'transient')
  assert.equal(classifyResult({ code: 'ECONNABORTED' }), 'transient')
  assert.equal(classifyResult({ status: 200 }), 'ok')
  assert.equal(classifyResult({ status: 301 }), 'redirected')
})

test('baseline allows known defects to shrink but rejects new broken URLs', () => {
  assert.deepEqual(evaluateBaseline(
    ['https://example.com/known', 'https://example.com/new'],
    ['https://example.com/fixed', 'https://example.com/known'],
  ), {
    newBroken: ['https://example.com/new'],
    resolved: ['https://example.com/fixed'],
  })
})
