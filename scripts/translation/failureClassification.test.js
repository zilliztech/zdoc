'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {PARTIAL_SUCCESS_FAILURE_CATEGORIES, classifyFailure, failureRecord} = require('./failureClassification')

test('classifies retained provider timeout and transport fixtures structurally', () => {
  const timeout = new Error('litellm.APITimeoutError: Request timed out after 240.0s')
  timeout.name = 'APITimeoutError'
  assert.equal(classifyFailure(timeout), 'provider_timeout')
  assert.equal(classifyFailure(new Error('stream disconnected before completion: stream closed before response.completed')), 'provider_transport')
  assert.equal(classifyFailure(Object.assign(new Error('HTTP 408'), {status: 408})), 'provider_timeout')
})

test('distinguishes review, locale, protected, and real contract conflicts', () => {
  assert.equal(classifyFailure({review: {pass: false, issues: [{type: 'accuracy_mistranslation'}]}}), 'review_failed')
  assert.equal(classifyFailure({validationErrors: ['Locale contract requires entity to use Entity']}), 'locale_contract_failed')
  assert.equal(classifyFailure({error: 'Unexpected protected inline_code at line 1'}), 'protected_content_failed')
  assert.equal(classifyFailure({failureCategory: 'contract_conflict'}), 'contract_conflict')
  assert.equal(classifyFailure({review: {pass: false, contractConflicts: [{issue: {type: 'terminology'}}]}}), 'contract_conflict')
  assert.equal(classifyFailure({review: {pass: false, localeContractIssues: [{type: 'terminology'}]}}), 'locale_contract_failed')
  assert.equal(classifyFailure({review: {pass: false, issues: [{type: 'accuracy_mistranslation'}]}}), 'review_failed')
  assert.equal(classifyFailure(new Error('opaque failure')), 'unknown')
})

test('creates bounded structured retry evidence without parsing downstream text', () => {
  assert.deepEqual(failureRecord({attempt: 2, failure: Object.assign(new Error('HTTP 408'), {status: 408})}), {
    attempt: 2,
    category: 'provider_timeout',
    error: 'HTTP 408',
  })
})

test('prefers explicit structured categories and timeout codes over opaque messages', () => {
  assert.equal(classifyFailure(Object.assign(new Error('opaque'), {failureCategory: 'provider_transport'})), 'provider_transport')
  assert.equal(classifyFailure(Object.assign(new Error('opaque'), {code: 'CHUNK_TIMEOUT', timeoutMs: 900000})), 'provider_timeout')
  assert.equal(classifyFailure(Object.assign(new Error('opaque'), {code: 'PROVIDER_TIMEOUT'})), 'provider_timeout')
  assert.equal(classifyFailure(Object.assign(new Error('opaque'), {code: 'PROVIDER_TRANSPORT'})), 'provider_transport')
  assert.equal(classifyFailure(Object.assign(new Error('opaque'), {code: 'SEMANTIC_RESPONSE_COUNT_MISMATCH'})), 'semantic_response_failed')
})

test('allows only proven file-level categories for partial success and reclassifies the retained semantic count mismatch', () => {
  assert.deepEqual(PARTIAL_SUCCESS_FAILURE_CATEGORIES, [
    'provider_timeout',
    'provider_transport',
    'review_failed',
    'locale_contract_failed',
    'protected_content_failed',
    'semantic_response_failed',
    'contract_conflict',
  ])
  assert.equal(classifyFailure({
    failureCategory: 'unknown',
    error: 'Semantic unit response entry count mismatch',
  }), 'semantic_response_failed')
  assert.equal(classifyFailure({failureCategory: 'unknown', error: 'opaque retained failure'}), 'unknown')
})
