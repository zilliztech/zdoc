'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildAggregateInput, parseCandidateCounts } = require('./build-aggregate-input')

const GUIDES_TRANSLATION_CANDIDATES = JSON.stringify({ total: 163, current_delta: 15, missing_target: 18, stale_source: 130 })

test('builds selected terminal result rows and includes SHAs only for publications', () => {
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'python', FINAL_VERIFICATION: 'passed',
    PYTHON_PRODUCER: 'artifact_ready', PYTHON_SOURCE: 'published', PYTHON_SOURCE_SHA: 'a'.repeat(40),
    PYTHON_TRANSLATOR: 'translation_ready', PYTHON_TRANSLATION: 'published', PYTHON_TRANSLATION_SHA: 'b'.repeat(40),
  })
  assert.deepEqual(result, { mode: 'publish', requestedGroups: ['python'], groups: { python: {
    source: 'source_published', translation: 'translation_published', translationRequested: true,
    sourceCommitSha: 'a'.repeat(40), translationCommitSha: 'b'.repeat(40),
  } }, finalVerification: 'passed' })
})

test('builds artifact-only rows directly from producer terminal states', () => {
  assert.deepEqual(buildAggregateInput({ MODE: 'artifact_only', SELECTED_GROUP: 'guides', GUIDES_PRODUCER: 'artifact_ready' }), {
    mode: 'artifact_only', requestedGroups: ['guides'], groups: { guides: { source: 'artifact_ready', translation: 'skipped', translationRequested: false } }, finalVerification: 'skipped',
  })
})

test('includes optional Guides translation candidate counts when supplied', () => {
  const result = buildAggregateInput({
    MODE: 'publish', SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'passed',
    GUIDES_PRODUCER: 'artifact_ready', GUIDES_SOURCE: 'no_changes',
    GUIDES_TRANSLATOR: 'no_changes', GUIDES_TRANSLATION_CANDIDATES,
  })
  assert.deepEqual(result.groups.guides.translationCandidates, {
    total: 163, current_delta: 15, missing_target: 18, stale_source: 130,
  })
})

test('rejects malformed or invalid translation candidate counts', () => {
  for (const value of [
    '{',
    JSON.stringify({ total: 163, current_delta: -1, missing_target: 18, stale_source: 146 }),
    JSON.stringify({ total: 163, current_delta: 15.5, missing_target: 18, stale_source: 129.5 }),
    JSON.stringify({ total: 163, current_delta: 15, missing_target: 18, stale_source: 130, surprise: 0 }),
    JSON.stringify({ total: 164, current_delta: 15, missing_target: 18, stale_source: 130 }),
  ]) assert.throws(() => parseCandidateCounts(value), /translation candidates/i)
})

test('maps producer, publisher, and translator failures to aggregate terminal states', () => {
  const failedFetch = buildAggregateInput({ SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'failed', GUIDES_PRODUCER: 'failed' })
  assert.equal(failedFetch.groups.guides.source, 'fetch_failed')
  const failedPublish = buildAggregateInput({ SELECTED_GROUP: 'java', FINAL_VERIFICATION: 'passed', JAVA_PRODUCER: 'artifact_ready', JAVA_SOURCE: 'failed' })
  assert.equal(failedPublish.groups.java.source, 'publish_failed')
  const failedTranslation = buildAggregateInput({ SELECTED_GROUP: 'go', FINAL_VERIFICATION: 'passed', GO_PRODUCER: 'artifact_ready', GO_SOURCE: 'no_changes', GO_TRANSLATOR: 'failed' })
  assert.equal(failedTranslation.groups.go.translation, 'translation_failed')
})
