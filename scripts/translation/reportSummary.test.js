'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildSummary } = require('./reportSummary')

test('builds a concise summary from the manifest and translation results', () => {
  const summary = buildSummary({
    manifest: { locale: 'ja-JP', items: [{}, {}, {}] },
    report: {
      results: [
        { sourcePath: 'docs/a.md', status: 'translated' },
        { sourcePath: 'docs/b.md', status: 'translated' },
        { sourcePath: 'docs/c.md', status: 'failed', error: 'provider timeout' },
      ],
    },
  })

  assert.match(summary, /Locale: `ja-JP`/)
  assert.match(summary, /Pending: 3/)
  assert.match(summary, /Translated: 2/)
  assert.match(summary, /Failed: 1/)
  assert.match(summary, /`docs\/c\.md`: provider timeout/)
})

test('reports an empty incremental run', () => {
  const summary = buildSummary({ manifest: { locale: 'ja-JP', items: [] } })
  assert.match(summary, /No changed documents required translation\./)
})

