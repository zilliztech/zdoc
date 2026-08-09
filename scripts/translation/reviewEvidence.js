'use strict'

const {issueConflictsWithLocaleContract} = require('./localeContract')

const ROOT_KEYS = ['pass', 'issues']
const ISSUE_KEYS = ['severity', 'type', 'location', 'source_quote', 'draft_quote', 'comment']
const SEVERITIES = new Set(['high', 'medium', 'low'])
const ISSUE_TYPES = new Set([
  'accuracy_omission',
  'accuracy_addition',
  'accuracy_mistranslation',
  'product_claim',
  'terminology',
  'consistency',
  'untranslated_prose',
  'locale_style',
  'mdx_structure',
  'protected_content',
  'link_or_path',
])
const IDENTICAL_QUOTES_INVALID_FOR = new Set(['protected_content', 'link_or_path', 'mdx_structure'])

const REVIEW_RESPONSE_JSON_SCHEMA = deepFreeze({
  name: 'translation_review_evidence',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['pass', 'issues'],
    properties: {
      pass: {type: 'boolean'},
      issues: {
        type: 'array',
        maxItems: 100,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['severity', 'type', 'location', 'source_quote', 'draft_quote', 'comment'],
          properties: {
            severity: {type: 'string', enum: ['high', 'medium', 'low']},
            type: {type: 'string', enum: [...ISSUE_TYPES]},
            location: {type: 'string', minLength: 1, maxLength: 2000},
            source_quote: {type: 'string', minLength: 1, maxLength: 2000},
            draft_quote: {type: 'string', minLength: 1, maxLength: 2000},
            comment: {type: 'string', minLength: 1, maxLength: 2000},
          },
        },
      },
    },
  },
})

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} must use the exact schema; unexpected or missing fields`)
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`)
  if (value.length > 2000) throw new Error(`${label} exceeds the allowed length`)
}

function stripJsonFence(text) {
  const trimmed = String(text || '').trim()
  const match = trimmed.match(/^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i)
  return match ? match[1].trim() : trimmed
}

function parseReviewEvidence(text) {
  const parsed = JSON.parse(stripJsonFence(text))
  exactKeys(parsed, ROOT_KEYS, 'Reviewer response')
  if (typeof parsed.pass !== 'boolean') throw new Error('Reviewer response pass must be boolean')
  if (!Array.isArray(parsed.issues)) throw new Error('Reviewer response issues must be an array')
  if (parsed.issues.length > 100) throw new Error('Reviewer response issues exceeds the allowed count')
  for (const [index, issue] of parsed.issues.entries()) {
    exactKeys(issue, ISSUE_KEYS, `Reviewer issue ${index}`)
    if (!SEVERITIES.has(issue.severity)) throw new Error(`Reviewer issue ${index} has an invalid severity`)
    if (!ISSUE_TYPES.has(issue.type)) throw new Error(`Reviewer issue ${index} has an invalid type`)
    for (const key of ['location', 'source_quote', 'draft_quote', 'comment']) nonEmptyString(issue[key], `Reviewer issue ${index} ${key}`)
  }
  return deepFreeze(parsed)
}

function unsupported(issue, reason) {
  return deepFreeze({issue, reason})
}

function fatalResult(reviewerPass, error, unsupportedIssues = [], contractConflicts = []) {
  return deepFreeze({
    reviewerPass,
    effectivePass: false,
    validatedIssues: [],
    unsupportedIssues,
    contractConflicts,
    correctionAuthorized: false,
    fatal: true,
    error,
  })
}

function validateReviewEvidence(review, {sourceContent, draftContent, localeContract}) {
  const source = String(sourceContent)
  const draft = String(draftContent)
  if (review.pass && review.issues.length) {
    return fatalResult(true, 'Reviewer response cannot set pass=true while reporting issues')
  }

  const validatedIssues = []
  const unsupportedIssues = []
  const contractConflicts = []
  const seen = new Set()
  for (const issue of review.issues) {
    if (!source.includes(issue.source_quote)) {
      unsupportedIssues.push(unsupported(issue, 'source_quote is not a contiguous source substring'))
      continue
    }
    if (!draft.includes(issue.draft_quote)) {
      unsupportedIssues.push(unsupported(issue, 'draft_quote is not a contiguous draft substring'))
      continue
    }
    if (IDENTICAL_QUOTES_INVALID_FOR.has(issue.type) && issue.source_quote === issue.draft_quote) {
      unsupportedIssues.push(unsupported(issue, 'source_quote and draft_quote are identical for a claimed protected-token or structure change'))
      continue
    }
    if (issueConflictsWithLocaleContract(issue, localeContract)) {
      contractConflicts.push(unsupported(issue, 'reviewer issue conflicts with the locale contract'))
      continue
    }
    const key = JSON.stringify(issue)
    if (seen.has(key)) continue
    seen.add(key)
    validatedIssues.push(issue)
  }

  return deepFreeze({
    reviewerPass: review.pass,
    effectivePass: validatedIssues.length === 0 && contractConflicts.length === 0,
    validatedIssues,
    unsupportedIssues,
    contractConflicts,
    correctionAuthorized: validatedIssues.length > 0,
    fatal: false,
    error: null,
  })
}

function parseAndValidateReviewEvidence(text, options) {
  try {
    return validateReviewEvidence(parseReviewEvidence(text), options)
  } catch (error) {
    return fatalResult(false, String(error?.message || error).slice(0, 500))
  }
}

module.exports = {
  REVIEW_RESPONSE_JSON_SCHEMA,
  parseAndValidateReviewEvidence,
  parseReviewEvidence,
  validateReviewEvidence,
}
