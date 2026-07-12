'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildAggregateInput } = require('./build-aggregate-input')

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

test('maps producer, publisher, and translator failures to aggregate terminal states', () => {
  const failedFetch = buildAggregateInput({ SELECTED_GROUP: 'guides', FINAL_VERIFICATION: 'failed', GUIDES_PRODUCER: 'failed' })
  assert.equal(failedFetch.groups.guides.source, 'fetch_failed')
  const failedPublish = buildAggregateInput({ SELECTED_GROUP: 'java', FINAL_VERIFICATION: 'passed', JAVA_PRODUCER: 'artifact_ready', JAVA_SOURCE: 'failed' })
  assert.equal(failedPublish.groups.java.source, 'publish_failed')
  const failedTranslation = buildAggregateInput({ SELECTED_GROUP: 'go', FINAL_VERIFICATION: 'passed', GO_PRODUCER: 'artifact_ready', GO_SOURCE: 'no_changes', GO_TRANSLATOR: 'failed' })
  assert.equal(failedTranslation.groups.go.translation, 'translation_failed')
})
