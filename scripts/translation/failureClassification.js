'use strict'

const FAILURE_CATEGORIES = Object.freeze([
  'provider_timeout',
  'provider_transport',
  'review_failed',
  'locale_contract_failed',
  'protected_content_failed',
  'contract_conflict',
  'unknown',
])
const FAILURE_CATEGORY_SET = new Set(FAILURE_CATEGORIES)

function messageOf(failure) {
  if (failure?.error) return String(failure.error)
  if (failure instanceof Error) return String(failure.message || failure)
  if (Array.isArray(failure?.validationErrors)) return failure.validationErrors.join('; ')
  return String(failure?.message || failure || 'unknown failure')
}

function classifyFailure(failure) {
  if (FAILURE_CATEGORY_SET.has(failure?.failureCategory)) return failure.failureCategory
  const message = messageOf(failure)
  const status = Number(failure?.status || failure?.statusCode || failure?.cause?.status)
  const name = String(failure?.name || failure?.cause?.name || '')
  if (status === 408 || name === 'AbortError' || /APITimeoutError|\btimeout\b|timed out|aborted/i.test(message)) return 'provider_timeout'
  if (/stream (?:disconnected|closed).*response\.completed|fetch failed|connection error|ECONNRESET|EAI_AGAIN|transport/i.test(message)) return 'provider_transport'
  if (/protected (?:content|inline_code|marker)|Unexpected protected|Missing protected/i.test(message)) return 'protected_content_failed'
  if (/locale contract|mandatory term/i.test(message)) return 'locale_contract_failed'
  if (failure?.review?.pass === false || Array.isArray(failure?.review?.issues) && failure.review.issues.length) return 'review_failed'
  return 'unknown'
}

function failureRecord({attempt, failure}) {
  return Object.freeze({
    attempt,
    category: classifyFailure(failure),
    error: messageOf(failure).slice(0, 2000),
  })
}

module.exports = {FAILURE_CATEGORIES, classifyFailure, failureRecord, messageOf}
