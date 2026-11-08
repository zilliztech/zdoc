'use strict'

// Reply protocol for the GA4 404 remediation triage loop.
//
// An operator (or, from PR3 on, the triage interpreter on their behalf)
// answers a triage comment with one machine-readable block; the issue_comment
// executor extracts it and feeds it to apply mode. The block sits between the
// ga4-404-reply-data markers and carries exactly the apply --mapping schema,
// so the executor and the operator's local file path share one validation and
// one generator.
//
// Loop safety contract: the ONLY comments allowed to carry reply markers are
// operator replies. The bot's own comments never contain these markers — the
// triage comment carries the ga4-404-triage markers instead, and executor
// confirmations/rejections carry no markers at all — so a bot comment can
// never re-trigger an apply.

const REPLY_BEGIN_MARKER_PATTERN = /<!--\s*ga4-404-reply-data begin[^>]*-->/u
const REPLY_END_MARKER_PATTERN = /<!--\s*ga4-404-reply-data end[^>]*-->/u
const FENCE_PATTERN = /```(?:json)?[ \t]*\r?\n([\s\S]*?)```/u

function extractReplyBlock(body) {
  if (typeof body !== 'string' || body === '') return {ok: false, reason: 'comment body is not text'}
  const beginMatch = REPLY_BEGIN_MARKER_PATTERN.exec(body)
  if (!beginMatch) return {ok: false, reason: 'no ga4-404-reply-data block found'}
  const innerStart = beginMatch.index + beginMatch[0].length
  const endMatch = REPLY_END_MARKER_PATTERN.exec(body.slice(innerStart))
  if (!endMatch) return {ok: false, reason: 'ga4-404-reply-data block is not closed'}
  const inner = body.slice(innerStart, innerStart + endMatch.index)
  const fence = FENCE_PATTERN.exec(inner)
  if (!fence) return {ok: false, reason: 'ga4-404-reply-data block has no fenced payload'}
  return {ok: true, payload: fence[1].trim()}
}

// Shape gate shared with the apply --mapping file loader: the reply grammar is
// the mapping grammar, so one drift cannot split the two entry points.
function validateMappingShape(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return 'reply payload must be a JSON object'
  if (raw.schema_version !== 1) return 'reply schema_version must be 1'
  for (const key of ['mappings', 'declined', 'denylist']) {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) return `reply ${key} must be an array`
  }
  if (!Array.isArray(raw.mappings ?? undefined) && !Array.isArray(raw.declined ?? undefined) && !Array.isArray(raw.denylist ?? undefined)) {
    return 'reply must contain at least one of mappings, declined, denylist'
  }
  for (const entry of raw.mappings ?? []) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return 'every mapping entry must be an object'
    if (typeof entry.from !== 'string' || entry.from === '') return 'every mapping entry needs a string from'
    if (typeof entry.to !== 'string' || entry.to === '') return 'every mapping entry needs a string to'
  }
  for (const key of ['declined', 'denylist']) {
    for (const entry of raw[key] ?? []) {
      if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return `every ${key} entry must be an object`
      if (typeof entry.from !== 'string' || entry.from === '') return `every ${key} entry needs a string from`
    }
  }
  return null
}

function parseReplyMapping(body) {
  const extracted = extractReplyBlock(body)
  if (!extracted.ok) return extracted
  let raw
  try {
    raw = JSON.parse(extracted.payload)
  } catch (error) {
    return {ok: false, reason: `reply payload is not valid JSON: ${error.message}`}
  }
  const invalid = validateMappingShape(raw)
  if (invalid) return {ok: false, reason: invalid}
  return {ok: true, mapping: raw}
}

// The executor's cheap pre-gate: a comment carrying the triage block (the
// bot's own triage post, or a full quote of it) is never treated as a reply.
function looksLikeTriageComment(body) {
  return typeof body === 'string' && /ga4-404-triage:v1/u.test(body)
}

module.exports = {
  REPLY_BEGIN_MARKER_PATTERN,
  REPLY_END_MARKER_PATTERN,
  extractReplyBlock,
  looksLikeTriageComment,
  parseReplyMapping,
  validateMappingShape,
}
