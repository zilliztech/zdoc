'use strict'

const fs = require('node:fs')
const { listContentGroups } = require('./content-groups')

const CANDIDATE_COUNT_KEYS = ['total', 'current_delta', 'missing_target', 'stale_source']

function translationCandidatesError(message) {
  throw new Error(`Invalid translation candidates: ${message}`)
}

function parseCandidateCounts(value) {
  if (!value) return undefined
  let counts
  try { counts = JSON.parse(value) } catch { translationCandidatesError('must be valid JSON') }
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) translationCandidatesError('must be an object')
  const keys = Object.keys(counts)
  if (keys.length !== CANDIDATE_COUNT_KEYS.length || keys.some((key) => !CANDIDATE_COUNT_KEYS.includes(key))) translationCandidatesError('must contain exactly total, current_delta, missing_target, and stale_source')
  for (const key of CANDIDATE_COUNT_KEYS) if (!Number.isSafeInteger(counts[key]) || counts[key] < 0) translationCandidatesError(`${key} must be a safe nonnegative integer`)
  if (counts.total !== counts.current_delta + counts.missing_target + counts.stale_source) translationCandidatesError('total must equal the reason counts')
  return counts
}

function buildAggregateInput(env) {
  const mode = env.MODE === 'artifact_only' ? 'artifact_only' : 'publish'
  const requestedGroups = env.SELECTED_GROUP === 'all' ? listContentGroups() : [env.SELECTED_GROUP]
  const groups = {}
  for (const group of requestedGroups) {
    const prefix = group.toUpperCase()
    const producer = env[`${prefix}_PRODUCER`] || ''
    const publisher = env[`${prefix}_SOURCE`] || ''
    const translator = env[`${prefix}_TRANSLATOR`] || ''
    const translationPublisher = env[`${prefix}_TRANSLATION`] || ''
    let source = mode === 'artifact_only' ? (producer === 'artifact_ready' ? 'artifact_ready' : 'fetch_failed')
      : producer !== 'artifact_ready' ? 'fetch_failed'
      : publisher === 'published' ? 'source_published'
        : publisher === 'no_changes' ? 'no_changes' : 'publish_failed'
    let translation = mode === 'artifact_only' ? 'skipped'
      : !['source_published', 'no_changes'].includes(source) ? 'skipped'
      : translator === 'failed' ? 'translation_failed'
        : translator === 'no_changes' ? 'no_changes'
          : translationPublisher === 'published' ? 'translation_published'
            : translationPublisher === 'no_changes' ? 'no_changes' : 'translation_failed'
    const entry = { source, translation, translationRequested: mode === 'publish' }
    if (source === 'source_published') entry.sourceCommitSha = env[`${prefix}_SOURCE_SHA`]
    if (translation === 'translation_published') entry.translationCommitSha = env[`${prefix}_TRANSLATION_SHA`]
    if (translation === 'no_changes' && env[`${prefix}_TRANSLATION_SHA`]) entry.translationCommitSha = env[`${prefix}_TRANSLATION_SHA`]
    if (group === 'guides') {
      const translationCandidates = parseCandidateCounts(env.GUIDES_TRANSLATION_CANDIDATES)
      if (translationCandidates) entry.translationCandidates = translationCandidates
    }
    groups[group] = entry
  }
  return { mode, requestedGroups, groups, finalVerification: mode === 'artifact_only' ? 'skipped' : (env.FINAL_VERIFICATION === 'passed' ? 'passed' : 'failed') }
}

function main() {
  const index = process.argv.indexOf('--output')
  if (index < 0 || !process.argv[index + 1]) throw new Error('Usage: build-aggregate-input.js --output <json>')
  fs.mkdirSync(require('node:path').dirname(process.argv[index + 1]), { recursive: true })
  fs.writeFileSync(process.argv[index + 1], `${JSON.stringify(buildAggregateInput(process.env), null, 2)}\n`)
}

if (require.main === module) { try { main() } catch (error) { console.error(error.message); process.exitCode = 1 } }
module.exports = { buildAggregateInput, parseCandidateCounts }
