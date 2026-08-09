'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildSummary } = require('./reportSummary')

test('builds a concise summary from the manifest and translation results', () => {
  const summary = buildSummary({
    manifest: {
      locale: 'ja-JP',
      items: [
        { reason: 'current_delta' },
        { reason: 'missing_target' },
        { reason: 'stale_source' },
      ],
    },
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
  assert.match(summary, /Current English changes: 1/)
  assert.match(summary, /Missing Japanese targets: 1/)
  assert.match(summary, /Stale translations: 1/)
  assert.match(summary, /Translated: 2/)
  assert.match(summary, /Failed: 1/)
  assert.match(summary, /`docs\/c\.md`: provider timeout/)
})

test('reports an empty incremental run', () => {
  const summary = buildSummary({ manifest: { locale: 'ja-JP', items: [] } })
  assert.match(summary, /No documents require translation or translation-state reconciliation\./)
})

test('reports intentionally deferred files from a checkpointed batch', () => {
  const summary = buildSummary({
    manifest: {
      locale: 'ja-JP',
      items: [
        { reason: 'current_delta' },
        { reason: 'current_delta' },
        { reason: 'missing_target' },
        { reason: 'stale_source' },
      ],
    },
    report: {
      results: [
        { sourcePath: 'docs/a.md', status: 'translated' },
        { sourcePath: 'docs/b.md', status: 'translated' },
      ],
      checkpoint: { remaining: 2 },
    },
  })

  assert.match(summary, /Remaining: 2/)
  assert.match(summary, /deferred to the next incremental run/i)
})

test('renders structured failure categories in the Markdown summary', () => {
  const summary = buildSummary({
    manifest: {locale: 'ja-JP', items: [{reason: 'current_delta'}]},
    report: {results: [{sourcePath: 'docs/boost-ranker.md', status: 'failed', failureCategory: 'provider_timeout', error: 'timed out'}]},
  })

  assert.match(summary, /provider_timeout/)
  assert.match(summary, /docs\/boost-ranker\.md/)
})
