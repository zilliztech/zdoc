'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { canonicalAuditRequestForPlan } = require('./incrementalCanonicalAudit')

test('zero-change incremental plans request a full canonical report', () => {
  assert.deepEqual(canonicalAuditRequestForPlan({ mode: 'incremental', expanded_tokens: [] }), {
    sourceTokens: null,
    reason: 'zero-change-full-audit',
  })
})

test('changed incremental plans scope canonical audit to expanded sources', () => {
  assert.deepEqual(canonicalAuditRequestForPlan({ mode: 'incremental', expanded_tokens: ['doc-a'] }), {
    sourceTokens: ['doc-a'],
    reason: 'incremental-scope',
  })
})
