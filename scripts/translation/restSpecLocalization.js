'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {applyDeterministicLocaleRepairs, formatLocaleContract, loadLocaleContract, validateLocaleContractDraft} = require('./localeContract')
const {protectTranslationInput, reprotectTranslationInput, restoreProtectedContent, validateProtectedContent} = require('./protectedContent')
const {parseAndValidateReviewEvidence, successfulReview} = require('./reviewEvidence')

const LOCALIZABLE_KEYS = new Set(['summary', 'description', 'title', 'label', 'prompt', 'content'])
const PRESERVED_SUBTREES = new Set(['example', 'examples', 'default', 'enum', 'enums', 'value'])

function protectedContentError(message, cause) {
  const error = new Error(message, cause ? {cause} : undefined)
  error.failureCategory = 'protected_content_failed'
  error.code = 'PROTECTED_CONTENT_FAILED'
  return error
}

const PROMPTS_BY_TARGET = Object.freeze({
  'ja-JP': Object.freeze({
    translation: 'codex-translation-agent.ja-JP.md',
    review: 'codex-review-agent.ja-JP.md',
    correction: 'codex-correction-agent.md',
    rest: 'codex-rest-spec-translation-agent.ja-JP.md',
    restReview: 'codex-rest-spec-review-agent.md',
    restCorrection: 'codex-rest-spec-correction-agent.md',
  }),
  'zh-CN-reference': Object.freeze({
    translation: 'codex-translation-agent.zh-CN-reference.md',
    review: 'codex-review-agent.zh-CN-reference.md',
    correction: 'codex-correction-agent.zh-CN-reference.md',
    rest: 'codex-rest-spec-translation-agent.zh-CN-reference.md',
    restReview: 'codex-rest-spec-review-agent.md',
    restCorrection: 'codex-rest-spec-correction-agent.md',
  }),
})

function promptNamesFor(target) {
  const prompts = PROMPTS_BY_TARGET[target]
  if (!prompts) throw new Error(`Unsupported translation target: ${target}`)
  return prompts
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(process.cwd(), '.github', 'prompts', name), 'utf8')
}

function parseRestDocument(content) {
  const marker = 'export const specs = '
  const start = content.indexOf(marker)
  if (start === -1) return null
  const suffixStart = content.indexOf('\nexport const endpoint', start + marker.length)
  if (suffixStart === -1) throw new Error('REST document has specs but no endpoint export')
  const sourceSpecs = JSON.parse(content.slice(start + marker.length, suffixStart))
  return { prefix: content.slice(0, start), sourceSpecs, suffix: content.slice(suffixStart) }
}

function collectLocalizableEntries(root) {
  const entries = []
  function visit(value, path = []) {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach((child, index) => visit(child, [...path, index]))
      return
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === 'x-i18n') continue
      if (LOCALIZABLE_KEYS.has(key) && typeof child === 'string' && child.trim()) {
        entries.push({ id: JSON.stringify([...path, key]), text: child, objectPath: path, key })
      }
      if (!PRESERVED_SUBTREES.has(key)) visit(child, [...path, key])
    }
  }
  visit(root)
  return entries
}

function protectRestEntries(entries, textForEntry = entry => entry.text, protectionOptions = {}) {
  return entries.map(entry => {
    const protectedText = textForEntry(entry)
    return {...entry, protectedText, protection: protectTranslationInput(protectedText, {...protectionOptions, reorderWithin: entry.id})}
  })
}

function reprotectRestEntries(sourceEntries, translatedEntries) {
  const sourceById = new Map(sourceEntries.map(entry => [entry.id, entry]))
  return translatedEntries.map(entry => {
    const source = sourceById.get(entry.id)
    if (!source || typeof entry.translation !== 'string') throw new Error(`Missing translated REST entry ${entry.id}`)
    return {
      ...entry,
      protectedText: entry.translation,
      protection: reprotectTranslationInput(entry.translation, source.protection.manifest),
    }
  })
}

function diagnosticRestEntryId(id) {
  try {
    const segments = JSON.parse(id)
    if (Array.isArray(segments) && segments.every(segment => typeof segment === 'string' || Number.isInteger(segment))) {
      return segments.join('.')
    }
  } catch {}
  return id
}

function parseTranslationEntries(text, expected, localeContract, {sourcePath = '<REST document>'} = {}) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed) || parsed.length !== expected.length) throw new Error('REST translation response entry count mismatch')
  const byId = new Map()
  for (const entry of parsed) {
    const keys = entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.keys(entry).sort() : []
    if (JSON.stringify(keys) !== JSON.stringify(['id', 'text']) || typeof entry.id !== 'string' || typeof entry.text !== 'string' || byId.has(entry.id)) {
      throw new Error('REST translation response entries must use exactly id and text fields with unique IDs')
    }
    byId.set(entry.id, entry.text)
  }
  return expected.map(entry => {
    if (!byId.has(entry.id)) throw new Error(`Missing REST translation entry ${entry.id}`)
    const entryPath = diagnosticRestEntryId(entry.id)
    const entryLabel = `${sourcePath} REST entry ${entryPath}`
    const modelTranslation = localeContract
      ? applyDeterministicLocaleRepairs(entry.protection.content, byId.get(entry.id), localeContract)
      : byId.get(entry.id)
    let translation
    try {
      translation = restoreProtectedContent(modelTranslation, entry.protection.manifest)
    } catch (error) {
      throw protectedContentError(`REST translation entry ${entry.id} (${entryLabel}) failed protected marker validation: ${error.message}`, error)
    }
    const protectedErrors = validateProtectedContent(entry.protectedText, translation, {
      sourcePath: `${entryLabel} source`,
      targetPath: `${entryLabel} target`,
    })
    if (protectedErrors.length) throw protectedContentError(`REST translation changed protected content for ${entry.id} (${entryLabel}): ${protectedErrors.join('; ')}`)
    const {protectedText, protection, ...restoredEntry} = entry
    return {...restoredEntry, translation}
  })
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }

function applyLocaleEntries(sourceSpecs, entries, locale) {
  const localized = clone(sourceSpecs)
  for (const entry of entries) {
    let target = localized
    for (const segment of entry.objectPath) target = target[segment]
    target['x-i18n'] ||= {}
    const existingLocale = target['x-i18n'][locale]
    if (typeof existingLocale === 'string') target['x-i18n'][locale] = {description: existingLocale}
    else if (!existingLocale || typeof existingLocale !== 'object' || Array.isArray(existingLocale)) target['x-i18n'][locale] = {}
    target['x-i18n'][locale][entry.key] = entry.translation
  }
  return localized
}

function removeLocale(value, locale) {
  const result = clone(value)
  function visit(current) {
    if (!current || typeof current !== 'object') return
    if (Array.isArray(current)) return current.forEach(visit)
    if (current['x-i18n'] && typeof current['x-i18n'] === 'object') {
      delete current['x-i18n'][locale]
      if (Object.keys(current['x-i18n']).length === 0) delete current['x-i18n']
    }
    Object.values(current).forEach(visit)
  }
  visit(result)
  return result
}

function exactRestSpecDraftKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) {
    throw new Error(`${label} schema is invalid`)
  }
}

function validateRestSpecDraft({sourceSpecs, draft, target, locale, sourcePath = '<REST document>'}) {
  exactRestSpecDraftKeys(draft, ['schemaVersion', 'entries'], 'REST recovery draft')
  if (draft.schemaVersion !== 1 || !Array.isArray(draft.entries)) throw new Error('REST recovery draft schema is invalid')
  const expected = collectLocalizableEntries(sourceSpecs)
  if (draft.entries.length !== expected.length) throw new Error('REST recovery draft entry count mismatch')
  const serialized = draft.entries.map(entry => {
    exactRestSpecDraftKeys(entry, ['id', 'translation'], 'REST recovery draft entry')
    if (typeof entry.id !== 'string' || typeof entry.translation !== 'string') throw new Error('REST recovery draft entry is invalid')
    return {id: entry.id, text: entry.translation}
  })
  const localeContract = loadLocaleContract(target)
  const protectedEntries = protectRestEntries(expected, entry => entry.text, {literalTokens: localeContract.doNotTranslate})
  const restored = parseTranslationEntries(JSON.stringify(serialized), protectedEntries, localeContract, {sourcePath})
  for (const [index, entry] of restored.entries()) {
    if (entry.translation !== draft.entries[index].translation) throw new Error(`REST recovery draft does not satisfy the current locale contract for ${entry.id}`)
  }
  return restored
}

function extractRestSpecDraft({sourceSpecs, localizedSpecs, target, locale, sourcePath = '<REST document>'}) {
  assert.deepEqual(removeLocale(localizedSpecs, locale), removeLocale(sourceSpecs, locale), 'Recovered REST specs changed non-locale data')
  const entries = collectLocalizableEntries(sourceSpecs).map(entry => {
    let localized = localizedSpecs
    for (const segment of entry.objectPath) localized = localized?.[segment]
    const translation = localized?.['x-i18n']?.[locale]?.[entry.key]
    if (typeof translation !== 'string') throw new Error(`Recovered REST specs are missing locale entry ${entry.id}`)
    return {id: entry.id, translation}
  })
  const draft = {schemaVersion: 1, entries}
  const restored = validateRestSpecDraft({sourceSpecs, draft, target, locale, sourcePath})
  assert.deepEqual(applyLocaleEntries(sourceSpecs, restored, locale), localizedSpecs, 'Recovered REST specs contain unexpected locale data')
  return draft
}

function batchEntries(entries, maxChars = 12000) {
  const batches = []
  let batch = [], size = 0
  for (const entry of entries) {
    const entrySize = entry.id.length + entry.text.length
    if (batch.length && size + entrySize > maxChars) { batches.push(batch); batch = []; size = 0 }
    batch.push(entry); size += entrySize
  }
  if (batch.length) batches.push(batch)
  return batches
}

function validateRestReviewEvidence(evidence, sourceEntries, draftEntries) {
  const draftById = new Map(draftEntries.map(entry => [entry.id, entry]))
  const validatedIssues = []
  const unsupportedIssues = [...evidence.unsupportedIssues]
  for (const issue of evidence.validatedIssues) {
    const matchingEntry = sourceEntries.find(entry => {
      const draft = draftById.get(entry.id)
      return entry.protection.content.includes(issue.source_quote)
        && draft?.protection.content.includes(issue.draft_quote)
        && issue.location === entry.id
    })
    if (matchingEntry) validatedIssues.push(issue)
    else unsupportedIssues.push({issue, reason: 'Reviewer evidence must identify source and draft quotes from the same REST entry ID'})
  }
  return {
    ...evidence,
    effectivePass: !evidence.fatal && validatedIssues.length === 0,
    validatedIssues,
    unsupportedIssues,
    correctionAuthorized: validatedIssues.length > 0,
  }
}

function deterministicRestIssues(sourceEntries, draftEntries, localeContract) {
  const draftById = new Map(draftEntries.map(entry => [entry.id, entry]))
  return sourceEntries.flatMap(entry => validateLocaleContractDraft(
    entry.protection.content,
    draftById.get(entry.id).protection.content,
    localeContract,
  ).map(issue => Object.freeze({...issue, location: `REST entry ${entry.id}; ${issue.location}`})))
}

function combinedRestIssues(evidence, deterministicIssues) {
  const issues = []
  const seen = new Set()
  for (const issue of [...evidence.validatedIssues, ...deterministicIssues]) {
    const key = JSON.stringify(issue)
    if (seen.has(key)) continue
    seen.add(key)
    issues.push(issue)
  }
  return issues
}

async function reviewAndCorrectRestBatch({entries, target, locale, callModel, localeContract, maxReviewRounds, sourcePath, providerRetryBudget, signal}) {
  const sourceEntries = protectRestEntries(entries, entry => entry.text, {literalTokens: localeContract.doNotTranslate})
  const sourceContent = JSON.stringify(sourceEntries.map(entry => ({id: entry.id, text: entry.protection.content})))
  let currentEntries = entries
  let review = {pass: false, issues: []}

  for (let round = 0; round <= maxReviewRounds; round += 1) {
    const draftEntries = reprotectRestEntries(sourceEntries, currentEntries)
    const draftContent = JSON.stringify(draftEntries.map(entry => ({id: entry.id, text: entry.protection.content})))
    const evidence = validateRestReviewEvidence(parseAndValidateReviewEvidence(await callModel({
      agent: 'review',
      signal,
      retryBudget: providerRetryBudget,
      messages: [
        {role: 'system', content: `${loadPrompt(promptNamesFor(target).restReview)}\n\n${formatLocaleContract(localeContract)}`},
        {role: 'user', content: `Locale: ${locale}\n\n<source>\n${sourceContent}\n</source>\n\n<draft>\n${draftContent}\n</draft>`},
      ],
    }), {sourceContent, draftContent, localeContract}), sourceEntries, draftEntries)
    const localeContractIssues = deterministicRestIssues(sourceEntries, draftEntries, localeContract)
    const issues = combinedRestIssues(evidence, localeContractIssues)
    review = {
      pass: !evidence.fatal && issues.length === 0 && evidence.unsupportedIssues.length === 0 &&
        evidence.contractConflicts.length === 0 && evidence.error === null,
      issues,
      unsupportedIssues: evidence.unsupportedIssues,
      contractConflicts: evidence.contractConflicts,
      localeContractIssues,
      reviewerPass: evidence.reviewerPass,
      error: evidence.error,
    }
    if (review.pass || round === maxReviewRounds) break
    const correctionIssues = issues.filter(issue => issue.evidenceAvailable !== false)
    if (evidence.fatal || correctionIssues.length === 0) break
    const corrected = await callModel({
      agent: 'correction',
      signal,
      retryBudget: providerRetryBudget,
      messages: [
        {role: 'system', content: `${loadPrompt(promptNamesFor(target).restCorrection)}\n\n${formatLocaleContract(localeContract)}`},
        {role: 'user', content: `Locale: ${locale}\n\n<source>\n${sourceContent}\n</source>\n\n<draft>\n${draftContent}\n</draft>\n\n<review_json>\n${JSON.stringify({pass: false, issues: correctionIssues}, null, 2)}\n</review_json>`},
      ],
    })
    currentEntries = parseTranslationEntries(corrected, draftEntries, localeContract, {sourcePath})
  }
  return {entries: currentEntries, review}
}

async function translateRestSpecs({ sourceSpecs, sourcePath = '<REST document>', target, locale, callModel, maxReviewRounds = 2, retryFeedback = null, providerRetryBudget = null, signal }) {
  const promptName = promptNamesFor(target).rest
  if (!promptName) throw new Error(`REST translation is unsupported for translation target ${target}`)
  const localeContract = loadLocaleContract(target)
  const systemPrompt = `${loadPrompt(promptName)}\n\n${formatLocaleContract(localeContract)}`
  const entries = collectLocalizableEntries(sourceSpecs)
  const retry = retryFeedback
    ? `<retry_feedback>\n${String(retryFeedback).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}\n</retry_feedback>\n\n`
    : ''
  const translated = []
  const reviews = []
  for (const batch of batchEntries(entries)) {
    const protectedBatch = protectRestEntries(batch, entry => entry.text, {literalTokens: localeContract.doNotTranslate})
    const response = await callModel({
      agent: 'translation',
      signal,
      retryBudget: providerRetryBudget,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Locale: ${locale}\n\n${retry}${JSON.stringify(protectedBatch.map(({ id, protection }) => ({ id, text: protection.content })))}` },
      ],
    })
    const restored = parseTranslationEntries(response, protectedBatch, localeContract, {sourcePath})
    const reviewed = await reviewAndCorrectRestBatch({
      entries: restored,
      target,
      locale,
      callModel,
      localeContract,
      maxReviewRounds,
      sourcePath,
      providerRetryBudget,
      signal,
    })
    translated.push(...reviewed.entries)
    reviews.push(reviewed.review)
    if (!reviewed.review.pass) break
  }
  const localized = applyLocaleEntries(sourceSpecs, translated, locale)
  assert.deepEqual(removeLocale(localized, locale), removeLocale(sourceSpecs, locale), 'Localized REST specs changed non-locale data')
  const review = {
    pass: reviews.every(item => item.pass),
    issues: reviews.flatMap(item => item.issues),
    unsupportedIssues: reviews.flatMap(item => item.unsupportedIssues),
    contractConflicts: reviews.flatMap(item => item.contractConflicts),
    localeContractIssues: reviews.flatMap(item => item.localeContractIssues),
    reviewerPass: reviews.every(item => item.reviewerPass),
    error: reviews.find(item => item.error)?.error || null,
  }
  return { localized, translatedCount: translated.length, review }
}

async function reviewRestSpecsDraft({sourceSpecs, draft, sourcePath = '<REST document>', target, locale, callModel, maxReviewRounds = 2, providerRetryBudget = null, signal}) {
  const localeContract = loadLocaleContract(target)
  const entries = validateRestSpecDraft({sourceSpecs, draft, target, locale, sourcePath})
  const translated = []
  const reviews = []
  for (const batch of batchEntries(entries)) {
    const reviewed = await reviewAndCorrectRestBatch({
      entries: batch,
      target,
      locale,
      callModel,
      localeContract,
      maxReviewRounds,
      sourcePath,
      providerRetryBudget,
      signal,
    })
    translated.push(...reviewed.entries)
    reviews.push(reviewed.review)
    if (reviewed.review.pass) {
      const correctedById = new Map(reviewed.entries.map(entry => [entry.id, entry.translation]))
      for (const entry of draft.entries) {
        if (correctedById.has(entry.id)) entry.translation = correctedById.get(entry.id)
      }
    }
    if (!reviewed.review.pass) break
  }
  const localized = applyLocaleEntries(sourceSpecs, translated, locale)
  assert.deepEqual(removeLocale(localized, locale), removeLocale(sourceSpecs, locale), 'Reviewed REST specs changed non-locale data')
  const review = reviews.length ? {
    pass: reviews.every(item => item.pass) && translated.length === entries.length,
    issues: reviews.flatMap(item => item.issues),
    unsupportedIssues: reviews.flatMap(item => item.unsupportedIssues),
    contractConflicts: reviews.flatMap(item => item.contractConflicts),
    localeContractIssues: reviews.flatMap(item => item.localeContractIssues),
    reviewerPass: reviews.length > 0 && reviews.every(item => item.reviewerPass),
    error: reviews.find(item => item.error)?.error || null,
  } : successfulReview()
  return {localized, translatedCount: translated.length, review}
}

function assembleRestDocument({ translatedPrefix, localizedSpecs, suffix, locale }) {
  const prefix = translatedPrefix.replace(/lang=(['"])en-US\1/g, `lang="${locale}"`)
  return `${prefix}export const specs = ${JSON.stringify(localizedSpecs)}${suffix}`
}

module.exports = {
  applyLocaleEntries,
  assembleRestDocument,
  batchEntries,
  collectLocalizableEntries,
  extractRestSpecDraft,
  loadPrompt,
  parseRestDocument,
  parseTranslationEntries,
  promptNamesFor,
  removeLocale,
  reviewRestSpecsDraft,
  translateRestSpecs,
  validateRestReviewEvidence,
  validateRestSpecDraft,
}
