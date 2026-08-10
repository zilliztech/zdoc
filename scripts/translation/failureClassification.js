'use strict'

const FAILURE_CATEGORIES = Object.freeze([
  'provider_timeout',
  'provider_transport',
  'review_failed',
  'locale_contract_failed',
  'protected_content_failed',
  'semantic_response_failed',
  'contract_conflict',
  'unknown',
])
const FAILURE_CATEGORY_SET = new Set(FAILURE_CATEGORIES)
const STRUCTURED_SHORT_STRING_KEYS = Object.freeze(['name', 'code'])
const STRUCTURED_STRING_KEYS = Object.freeze(['field', 'semanticUnitId', 'markerId'])
const STRUCTURED_NUMBER_KEYS = Object.freeze([
  'status', 'entryIndex', 'expectedCount', 'actualCount', 'providerAttempts',
  'retryBudgetLimit', 'retryBudgetConsumed', 'retryBudgetRemaining',
  'adaptiveCallLimit', 'adaptiveCallsReserved', 'adaptiveCallsRemaining',
  'adaptiveSubdivisionDepth', 'semanticBatchSize',
  'adaptiveTargetChars', 'adaptiveMaxChars',
])
const STRUCTURED_STRING_ARRAY_KEYS = Object.freeze([
  'expectedFields', 'actualFields', 'expectedIds', 'actualIds', 'missingIds', 'unknownIds', 'duplicateIds',
])
const MAX_STRUCTURED_STRING_LENGTH = 240
const MAX_STRUCTURED_SHORT_STRING_LENGTH = 200

function boundedFailureDetails(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const details = {}
  for (const key of STRUCTURED_SHORT_STRING_KEYS) {
    if (typeof value[key] === 'string') details[key] = value[key].slice(0, MAX_STRUCTURED_SHORT_STRING_LENGTH)
  }
  for (const key of STRUCTURED_STRING_KEYS) {
    if (typeof value[key] === 'string') details[key] = value[key].slice(0, MAX_STRUCTURED_STRING_LENGTH)
  }
  for (const key of STRUCTURED_NUMBER_KEYS) {
    if (Number.isFinite(value[key])) details[key] = value[key]
  }
  for (const key of STRUCTURED_STRING_ARRAY_KEYS) {
    if (Array.isArray(value[key])) {
      details[key] = value[key].filter(item => typeof item === 'string').map(item => item.slice(0, MAX_STRUCTURED_STRING_LENGTH))
    }
  }
  if (Array.isArray(value.occurrences)) {
    details.occurrences = value.occurrences.flatMap(position => (
      Number.isFinite(position?.line) && Number.isFinite(position?.column) && Number.isFinite(position?.offset)
        ? [{line: position.line, column: position.column, offset: position.offset}]
        : []
    ))
  }
  if (value.cause && typeof value.cause === 'object' && !Array.isArray(value.cause)) {
    const cause = {}
    for (const key of ['name', 'code', 'failureCategory']) {
      if (typeof value.cause[key] === 'string') cause[key] = value.cause[key].slice(0, MAX_STRUCTURED_SHORT_STRING_LENGTH)
    }
    if (Number.isFinite(value.cause.status)) cause.status = value.cause.status
    if (Object.keys(cause).length) details.cause = cause
  }
  return Object.keys(details).length ? details : undefined
}

function messageOf(failure) {
  if (failure?.error) return String(failure.error)
  if (failure instanceof Error) return String(failure.message || failure)
  if (Array.isArray(failure?.validationErrors)) return failure.validationErrors.join('; ')
  return String(failure?.message || failure || 'unknown failure')
}

function classifyFailure(failure) {
  if (FAILURE_CATEGORY_SET.has(failure?.failureCategory)) return failure.failureCategory
  if (FAILURE_CATEGORY_SET.has(failure?.cause?.failureCategory)) return failure.cause.failureCategory
  if (Array.isArray(failure?.review?.contractConflicts) && failure.review.contractConflicts.length) return 'contract_conflict'
  if (Array.isArray(failure?.review?.localeContractIssues) && failure.review.localeContractIssues.length) return 'locale_contract_failed'
  const message = messageOf(failure)
  const status = Number(failure?.status || failure?.statusCode || failure?.cause?.status)
  const name = String(failure?.name || failure?.cause?.name || '')
  const code = String(failure?.code || failure?.cause?.code || '')
  if (['CHUNK_TIMEOUT', 'FILE_TIMEOUT', 'PROVIDER_TIMEOUT'].includes(code)) return 'provider_timeout'
  if (code === 'PROVIDER_TRANSPORT') return 'provider_transport'
  if (code.startsWith('SEMANTIC_RESPONSE_')) return 'semantic_response_failed'
  if (status === 408 || name === 'AbortError' || name === 'APITimeoutError' || /APITimeoutError|\btimeout\b|timed out|aborted/i.test(message)) return 'provider_timeout'
  if ([409, 425, 429, 500, 502, 503, 504].includes(status)) return 'provider_transport'
  if (/stream (?:disconnected|closed).*response\.completed|fetch failed|connection error|ECONNRESET|EAI_AGAIN|transport/i.test(message)) return 'provider_transport'
  if (/protected (?:content|inline_code|marker)|Unexpected protected|Missing protected/i.test(message)) return 'protected_content_failed'
  if (/locale contract|mandatory term/i.test(message)) return 'locale_contract_failed'
  if (failure?.review?.pass === false || Array.isArray(failure?.review?.issues) && failure.review.issues.length) return 'review_failed'
  return 'unknown'
}

function failureRecord({attempt, failure}) {
  const code = failure?.errorDetails?.code || failure?.code
  return Object.freeze({
    attempt,
    category: classifyFailure(failure),
    error: messageOf(failure).slice(0, 2000),
    ...(typeof code === 'string' ? {code: code.slice(0, 200)} : {}),
  })
}

module.exports = {FAILURE_CATEGORIES, boundedFailureDetails, classifyFailure, failureRecord, messageOf}
