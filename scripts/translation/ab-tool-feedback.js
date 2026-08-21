'use strict'

/**
 * Head-to-head A/B: baseline (blind review+correction, the current pipeline)
 * vs tool-assisted (real deterministic validators feeding correction).
 *
 * Both arms share identical preprocessing + chunking:
 *   chunkDocument -> collectSemanticUnits -> protectTranslationInput -> translate
 * The ONLY difference is the feedback loop that drives correction:
 *   - baseline:      a reviewer LLM call (blind) + deterministic issues
 *   - tool-assisted: deterministic issues only (no reviewer LLM call)
 *
 * Per-step latency + per-call token usage (cached/miss split) are collected.
 *
 * Throwaway experiment script — does not touch production code paths.
 */

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const SITE_DIR = path.resolve(__dirname, '../..')

const { applyMdxPatches } = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const {
  buildTranslationMessages,
  buildReviewMessages,
  buildCorrectionMessages,
  validateTranslatedContent,
} = require('./agentRunner')
const { chunkDocument, DEFAULT_TARGET_CHARS, DEFAULT_MAX_CHARS } = require('./chunker')
const { loadLocaleContract } = require('./localeContract')
const { protectTranslationInput, reprotectTranslationInput, validateProtectedContent } = require('./protectedContent')
const {
  collectSemanticUnits,
  deterministicSemanticIssues,
  patchSemanticUnits,
  protectSemanticUnits,
  reprotectSemanticUnits,
  restoreSemanticUnitResponse,
  bindSemanticReviewEvidence,
} = require('./semanticUnits')
const { parseAndValidateReviewEvidence } = require('./reviewEvidence')

// ---- config ----
const MODELS = { translation: 'deepseek-v4-flash', review: 'deepseek-v4-pro', correction: 'deepseek-v4-pro' }
const TEMPERATURE = { translation: 0.1, review: 0, correction: 0.1 }
const MAX_REVIEW_ROUNDS = 2
const CALL_TIMEOUT_MS = 300000

const SAMPLES = [
  'content/en/reference/cli/cli/DataOperations/DataOperations-Vector/Vector-hybridsearch.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Vector/Vector-search.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection.md',
  'content/en/reference/api/go/go/v1/v1-Collection/v1-Collection-SearchParams.md',
  'content/en/reference/api/python/python/ORM/ORM-Collection/Collection-search.md',
]
const TARGETS = [
  { id: 'ja-JP', locale: 'ja-JP' },
  { id: 'zh-CN-reference', locale: 'zh-CN' },
]
const ARMS = ['baseline', 'tool-assisted']

// ---- helpers ----
function loadDotEnv() {
  const p = path.join(SITE_DIR, '.env')
  if (!fs.existsSync(p)) return {}
  const out = {}
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

function markerFreeDocumentContext(content) {
  return String(content).replace(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->(?:\r?\n)?/g, '')
}

function extractDocumentTitle(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  try { const fm = yaml.load(m[1]); return typeof fm?.title === 'string' ? fm.title : null } catch { return null }
}

function extractFirstHeading(content) {
  return content.match(/^ {0,3}#{1,6}[\t ]+(.+)$/m)?.[1]?.trim() || null
}

function batchSemanticReviewPairs(sourceUnits, draftUnits, targetChars, maxChars) {
  const draftById = new Map(draftUnits.map(unit => [unit.id, unit]))
  const pairs = sourceUnits.map(sourceUnit => {
    const draftUnit = draftById.get(sourceUnit.id)
    if (!draftUnit) throw new Error(`Missing draft semantic unit ${sourceUnit.id}`)
    return { sourceUnit, draftUnit, chars: sourceUnit.text.length + draftUnit.text.length }
  })
  const batches = []
  let current = []
  let currentChars = 0
  for (const pair of pairs) {
    if (current.length && (currentChars >= targetChars || currentChars + pair.chars > maxChars)) {
      batches.push(current)
      current = []
      currentChars = 0
    }
    current.push(pair)
    currentChars += pair.chars
  }
  if (current.length) batches.push(current)
  return batches
}

// ---- provider call with instrumentation + retry ----
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504])

function makeCallModel({ baseUrl, apiKey, metrics }) {
  const normalized = baseUrl.replace(/\/+$/, '').endsWith('/v1') ? baseUrl.replace(/\/+$/, '') : `${baseUrl.replace(/\/+$/, '')}/v1`
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  return async function callModel({ agent, messages }) {
    const model = MODELS[agent]
    if (!model) throw new Error(`Unknown agent ${agent}`)
    const maxAttempts = 2
    let lastError
    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      const t0 = process.hrtime.bigint()
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(new Error(`call timeout ${CALL_TIMEOUT_MS}ms`)), CALL_TIMEOUT_MS)
      let status, data, ms
      let transportError = null
      try {
        const res = await fetch(`${normalized}/chat/completions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, temperature: TEMPERATURE[agent], seed: Math.floor(Math.random() * 1000000) }),
          signal: controller.signal,
        })
        status = res.status
        data = await res.json().catch(() => ({}))
      } catch (error) {
        transportError = error
        status = 0
        data = {}
      } finally {
        clearTimeout(timer)
        ms = Number(process.hrtime.bigint() - t0) / 1e6
      }
      const u = data?.usage || {}
      metrics.calls.push({
        agent,
        model,
        attempt,
        ms: Math.round(ms),
        status,
        prompt: u.prompt_tokens || 0,
        cached: u.prompt_cache_hit_tokens ?? u.prompt_tokens_details?.cached_tokens ?? 0,
        miss: u.prompt_cache_miss_tokens ?? 0,
        completion: u.completion_tokens || 0,
        reasoning: u.completion_tokens_details?.reasoning_tokens || 0,
      })
      if (status === 200) {
        const content = data?.choices?.[0]?.message?.content
        if (content) return content.trim()
        lastError = new Error(`No content: ${JSON.stringify(data).slice(0, 200)}`)
      } else {
        lastError = transportError || new Error(`HTTP ${status}: ${JSON.stringify(data).slice(0, 300)}`)
        const retryable = transportError || RETRYABLE_STATUS.has(status)
        if (!retryable || attempt >= maxAttempts) break
        const waitMs = 3000 * (2 ** attempt)
        console.warn(`[ab] ${agent} attempt ${attempt + 1} failed (${status}), retrying in ${waitMs}ms`)
        await sleep(waitMs)
      }
    }
    throw lastError
  }
}

function timed(metrics, step, fn) {
  const t0 = process.hrtime.bigint()
  const out = fn()
  const ms = Number(process.hrtime.bigint() - t0) / 1e6
  metrics.steps[step] = (metrics.steps[step] || 0) + ms
  return out
}

async function timedAsync(metrics, step, fn) {
  const t0 = process.hrtime.bigint()
  const out = await fn()
  const ms = Number(process.hrtime.bigint() - t0) / 1e6
  metrics.steps[step] = (metrics.steps[step] || 0) + ms
  return out
}

// ---- shared translation of one chunk's semantic units ----
async function translateChunk({ target, sourcePath, sourceContent, locale, chunkContext, callModel, metrics }) {
  const localeContract = loadLocaleContract(target)
  const idPrefix = chunkContext ? `chunk.${String(chunkContext.index + 1).padStart(4, '0')}` : 'document'
  const units = await timedAsync(metrics, 'collectSemanticUnits', () => collectSemanticUnits(sourceContent, { idPrefix }))
  if (!units.length) {
    return { translatedContent: sourceContent, units: [], sourceUnits: [], sourceUnitPayload: [], localeContract, protectedSource: null }
  }
  const protectedOptions = { literalTokens: localeContract.doNotTranslate }
  const protectedSource = timed(metrics, 'protectTranslationInput', () => protectTranslationInput(sourceContent, protectedOptions))
  const sourceUnits = timed(metrics, 'protectSemanticUnits', () => protectSemanticUnits(units, unit => unit.source, protectedOptions))
  const sourceUnitPayload = sourceUnits.map(unit => ({ id: unit.id, kind: unit.kind, text: unit.protection.content }))
  const response = await callModel({
    agent: 'translation',
    messages: buildTranslationMessages({
      target,
      sourcePath,
      sourceContent: protectedSource.content,
      sourceDocument: markerFreeDocumentContext(protectedSource.content),
      semanticUnits: sourceUnitPayload,
      locale,
      chunkContext,
      retryFeedback: null,
    }),
  })
  const currentUnits = restoreSemanticUnitResponse(response, { field: 'translations', protectedUnits: sourceUnits, localeContract })
  const translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  return { translatedContent, units, sourceUnits, sourceUnitPayload, currentUnits, localeContract, protectedSource }
}

// ---- feedback loop: baseline (blind review) vs tool-assisted (deterministic only) ----
async function reviewAndCorrect({ arm, shared, target, sourcePath, sourceContent, locale, chunkContext, callModel, metrics }) {
  let { translatedContent, units, sourceUnits, sourceUnitPayload, currentUnits, localeContract, protectedSource } = shared
  let review = { pass: false, issues: [] }
  let rounds = 0
  for (let round = 0; round <= MAX_REVIEW_ROUNDS; round++) {
    rounds = round
    const draftUnits = reprotectSemanticUnits(sourceUnits, currentUnits)
    const draftUnitPayload = draftUnits.map(unit => ({ id: unit.id, kind: unit.kind, text: unit.protection.content }))
    const protectedDraftDocument = reprotectTranslationInput(translatedContent, protectedSource.manifest)

    let evidence
    if (arm === 'baseline') {
      const reviewBatches = batchSemanticReviewPairs(sourceUnitPayload, draftUnitPayload, Math.floor(DEFAULT_TARGET_CHARS / 2), Math.floor(DEFAULT_MAX_CHARS / 2))
      const evidenceBatches = []
      for (const batch of reviewBatches) {
        const batchSourcePayload = batch.map(pair => pair.sourceUnit)
        const batchDraftPayload = batch.map(pair => pair.draftUnit)
        const batchIds = new Set(batchSourcePayload.map(unit => unit.id))
        const reviewText = await callModel({
          agent: 'review',
          messages: buildReviewMessages({
            target,
            sourcePath,
            sourceContent: protectedSource.content,
            translatedContent: protectedDraftDocument.content,
            sourceDocument: markerFreeDocumentContext(protectedSource.content),
            draftDocument: markerFreeDocumentContext(protectedDraftDocument.content),
            sourceUnits: batchSourcePayload,
            draftUnits: batchDraftPayload,
            locale,
            chunkContext,
          }),
        })
        evidenceBatches.push(bindSemanticReviewEvidence(parseAndValidateReviewEvidence(reviewText, {
          sourceContent: JSON.stringify(batchSourcePayload),
          draftContent: JSON.stringify(batchDraftPayload),
          localeContract,
        }), sourceUnits.filter(unit => batchIds.has(unit.id)), draftUnits.filter(unit => batchIds.has(unit.id))))
      }
      evidence = {
        fatal: evidenceBatches.some(item => item.fatal),
        issueUnits: evidenceBatches.flatMap(item => item.issueUnits),
        unsupportedIssues: evidenceBatches.flatMap(item => item.unsupportedIssues),
        contractConflicts: evidenceBatches.flatMap(item => item.contractConflicts),
        reviewerPass: evidenceBatches.every(item => item.reviewerPass),
        error: evidenceBatches.map(item => item.error).filter(Boolean).join('; ') || null,
      }
    } else {
      evidence = { fatal: false, issueUnits: [], unsupportedIssues: [], contractConflicts: [], reviewerPass: true, error: null }
    }

    const deterministic = timed(metrics, 'deterministicIssues', () => deterministicSemanticIssues(sourceUnits, draftUnits, localeContract))
    const issues = []
    const issueUnits = []
    const seen = new Set()
    for (const binding of [...evidence.issueUnits, ...deterministic.issueUnits]) {
      const issue = binding.issue
      const key = JSON.stringify(issue)
      if (seen.has(key)) continue
      seen.add(key)
      issues.push(issue)
      issueUnits.push(binding)
    }
    for (const issue of deterministic.issues) {
      const key = JSON.stringify(issue)
      if (seen.has(key)) continue
      seen.add(key)
      issues.push(issue)
    }
    review = {
      pass: !evidence.fatal && issues.length === 0 && evidence.unsupportedIssues.length === 0 &&
        evidence.contractConflicts.length === 0 && evidence.error === null,
      issues,
      unsupportedIssues: evidence.unsupportedIssues,
      contractConflicts: evidence.contractConflicts,
      localeContractIssues: deterministic.issues,
      reviewerPass: evidence.reviewerPass,
      error: evidence.error,
    }
    if (review.pass || round === MAX_REVIEW_ROUNDS) break
    if (evidence.fatal || issues.length === 0) break
    const authorizedIds = [...new Set(issueUnits.map(item => item.unitId))]
    if (!authorizedIds.length) break

    const authorizedDraftUnits = draftUnits.filter(unit => authorizedIds.includes(unit.id))
    const authorizedSourcePayload = sourceUnitPayload.filter(unit => authorizedIds.includes(unit.id))
    const authorizedDraftPayload = draftUnitPayload.filter(unit => authorizedIds.includes(unit.id))
    const correctionBatches = batchSemanticReviewPairs(authorizedSourcePayload, authorizedDraftPayload, Math.floor(DEFAULT_TARGET_CHARS / 2), Math.floor(DEFAULT_MAX_CHARS / 2))
    const correctedUnits = []
    for (const batch of correctionBatches) {
      const batchIds = new Set(batch.map(pair => pair.sourceUnit.id))
      const batchDraftUnits = authorizedDraftUnits.filter(unit => batchIds.has(unit.id))
      const authorizedPayload = batch.map(pair => ({ id: pair.sourceUnit.id, source: pair.sourceUnit.text, draft: pair.draftUnit.text }))
      const batchIssues = issues.filter(issue => [...batchIds].some(id => issue.location === id || issue.location.startsWith(`${id};`)))
      const correctedResponse = await callModel({
        agent: 'correction',
        messages: buildCorrectionMessages({
          target,
          sourcePath,
          sourceContent: protectedSource.content,
          translatedContent: protectedDraftDocument.content,
          sourceDocument: markerFreeDocumentContext(protectedSource.content),
          draftDocument: markerFreeDocumentContext(protectedDraftDocument.content),
          authorizedUnits: authorizedPayload,
          review: { pass: false, issues: batchIssues },
          locale,
          chunkContext,
        }),
      })
      correctedUnits.push(...restoreSemanticUnitResponse(correctedResponse, { field: 'corrections', protectedUnits: batchDraftUnits, localeContract }))
    }
    const correctedById = new Map(correctedUnits.map(unit => [unit.id, unit.translation]))
    currentUnits = currentUnits.map(unit => correctedById.has(unit.id) ? { ...unit, translation: correctedById.get(unit.id) } : unit)
    translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  }
  review.rounds = rounds
  return { translatedContent, review, rounds }
}

// ---- one full file, one arm ----
async function runFile({ arm, sample, targetId, locale, callModel, metrics }) {
  const sourcePath = path.join(SITE_DIR, sample)
  const sourceContent = fs.readFileSync(sourcePath, 'utf8')
  const target = targetId
  metrics.steps.chunkDocument = 0
  const chunks = timed(metrics, 'chunkDocument', () => chunkDocument(sourceContent))
  const documentTitle = extractDocumentTitle(sourceContent)
  const translatedChunks = []
  let previousTranslatedHeading = null
  let lastReview = { pass: true, issues: [] }

  for (const chunk of chunks) {
    const chunkContext = chunks.length > 1
      ? { index: chunk.index, total: chunks.length, documentTitle, previousTranslatedHeading }
      : null
    const shared = await translateChunk({ target, sourcePath: sample, sourceContent: chunk.source, locale, chunkContext, callModel, metrics })
    const unit = await reviewAndCorrect({ arm, shared, target, sourcePath: sample, sourceContent: chunk.source, locale, chunkContext, callModel, metrics })
    lastReview = unit.review
    if (!unit.review.pass) break
    translatedChunks.push(unit.translatedContent)
    previousTranslatedHeading = extractFirstHeading(unit.translatedContent) || previousTranslatedHeading
  }

  const joined = translatedChunks.join('')
  const patched = await timedAsync(metrics, 'applyMdxPatches', () => applyMdxPatches(joined, { repairInvalidMdxEsmProse: true }))
  const finalErrors = await timedAsync(metrics, 'validate_mdx', () => validateTranslatedContent(patched))
  // Protected-content integrity is enforced per semantic unit during
  // restoreSemanticUnitResponse (throws on violation); no doc-level check here.
  return { translatedContent: patched, lastReview, finalErrors, chunks: chunks.length }
}

async function main() {
  const env = loadDotEnv()
  const baseUrl = env.TRANSLATION_AGENT_BASE_URL || process.env.TRANSLATION_AGENT_BASE_URL
  const apiKey = env.TRANSLATION_AGENT_API_KEY || process.env.TRANSLATION_AGENT_API_KEY
  if (!baseUrl || !apiKey) throw new Error('Missing TRANSLATION_AGENT_BASE_URL / TRANSLATION_AGENT_API_KEY')

  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const onlySample = args.get('--sample')
  const onlyTarget = args.get('--target')
  const onlyArm = args.get('--arm')
  const outDir = args.get('--out') || path.join(SITE_DIR, 'tmp', `ab-${Date.now()}`)

  const samples = onlySample ? [onlySample] : SAMPLES
  const targets = onlyTarget ? TARGETS.filter(t => t.id === onlyTarget || t.locale === onlyTarget) : TARGETS
  const arms = onlyArm ? [onlyArm] : ARMS

  fs.mkdirSync(outDir, { recursive: true })
  const results = []

  for (const sample of samples) {
    for (const target of targets) {
      for (const arm of arms) {
        const metrics = { steps: {}, calls: [] }
        const run = { sample, target: target.id, locale: target.locale, arm, status: 'ok' }
        const t0 = process.hrtime.bigint()
        try {
          const callModel = makeCallModel({ baseUrl, apiKey, metrics })
          const out = await runFile({ arm, sample, targetId: target.id, locale: target.locale, callModel, metrics })
          run.chunks = out.chunks
          run.reviewPass = out.lastReview.pass
          run.reviewIssues = (out.lastReview.issues || []).length
          run.finalErrors = out.finalErrors.length
          run.protectedErrors = 0 // enforced per-unit; a violation throws -> status=error
          run.rounds = out.lastReview.rounds !== undefined ? out.lastReview.rounds : null
          // write translated output for manual spot-check
          const flat = sample.replace(/[\/\\]/g, '__')
          fs.writeFileSync(path.join(outDir, `${target.locale}__${arm}__${flat}`), out.translatedContent, 'utf8')
        } catch (error) {
          run.status = 'error'
          run.error = String(error?.message || error).slice(0, 500)
        }
        run.totalMs = Math.round(Number(process.hrtime.bigint() - t0) / 1e6)
        run.steps = Object.fromEntries(Object.entries(metrics.steps).map(([k, v]) => [k, Math.round(v)]))
        run.calls = metrics.calls
        run.callCount = metrics.calls.length
        run.promptTokens = metrics.calls.reduce((s, c) => s + c.prompt, 0)
        run.cachedTokens = metrics.calls.reduce((s, c) => s + c.cached, 0)
        run.completionTokens = metrics.calls.reduce((s, c) => s + c.completion, 0)
        results.push(run)
        console.log(`[${run.status}] ${sample.split('/').pop()} | ${target.locale} | ${arm} | ${run.totalMs}ms | calls=${run.callCount} | prompt=${run.promptTokens} (cached=${run.cachedTokens}) | completion=${run.completionTokens} | mdxErr=${run.finalErrors} protErr=${run.protectedErrors}`)
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
  console.log(`\nResults -> ${path.join(outDir, 'results.json')}`)
}

main().catch(error => {
  console.error('FATAL', error)
  process.exit(1)
})
