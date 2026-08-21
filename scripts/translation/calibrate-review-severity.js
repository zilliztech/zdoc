'use strict'

/**
 * Severity calibration + negative control.
 *
 * For each sample:
 *   1. translate (flash, thinking off) — the production baseline
 *   2. annotate with judge (pro) and reviewer (flash) — baseline (expect ~0)
 *   3. inject a known omission (blank out a substantive numeric unit) — negative control
 *   4. re-annotate — do judge/reviewer catch the injected omission?
 *
 * Throwaway evaluation script — does not touch production code paths.
 */

const fs = require('node:fs')
const path = require('node:path')

const SITE_DIR = path.resolve(__dirname, '../..')

const { buildReviewMessages, buildTranslationMessages } = require('./agentRunner')
const { loadLocaleContract } = require('./localeContract')
const { protectTranslationInput, reprotectTranslationInput } = require('./protectedContent')
const { collectSemanticUnits, protectSemanticUnits, reprotectSemanticUnits, restoreSemanticUnitResponse, patchSemanticUnits } = require('./semanticUnits')
const { parseAndValidateReviewEvidence } = require('./reviewEvidence')

const SAMPLES = [
  'content/en/reference/cli/cli/DataOperations/DataOperations-Vector/Vector-hybridsearch.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Vector/Vector-search.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection.md',
]
const TARGET = 'ja-JP'
const LOCALE = 'ja-JP'
const JUDGE_MODEL = 'deepseek-v4-pro'
const REVIEW_MODEL = 'deepseek-v4-flash'
const TRANSLATION_MODEL = 'deepseek-v4-flash'

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

async function chat(baseUrl, apiKey, { model, messages }) {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0, thinking: { type: 'disabled' } }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content returned')
  return content.trim()
}

async function prepareFile(env, sourcePath, sourceContent, target, locale) {
  const localeContract = loadLocaleContract(target)
  const units = await collectSemanticUnits(sourceContent, { idPrefix: 'document' })
  if (!units.length) return null
  const protectedOptions = { literalTokens: localeContract.doNotTranslate }
  const protectedSource = protectTranslationInput(sourceContent, protectedOptions)
  const sourceUnits = protectSemanticUnits(units, u => u.source, protectedOptions)
  const sourceUnitPayload = sourceUnits.map(u => ({ id: u.id, kind: u.kind, text: u.protection.content }))

  const translation = await chat(env.TRANSLATION_AGENT_BASE_URL, env.TRANSLATION_AGENT_API_KEY, {
    model: TRANSLATION_MODEL,
    messages: buildTranslationMessages({ target, sourcePath, sourceContent: protectedSource.content, sourceDocument: markerFreeDocumentContext(protectedSource.content), semanticUnits: sourceUnitPayload, locale, chunkContext: null, retryFeedback: null }),
  })
  const currentUnits = restoreSemanticUnitResponse(translation, { field: 'translations', protectedUnits: sourceUnits, localeContract })
  const translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  return { localeContract, protectedSource, units, sourceContent, sourceUnits, sourceUnitPayload, currentUnits, translatedContent }
}

function buildDraft(prepared) {
  const { protectedSource, sourceUnits, currentUnits, translatedContent } = prepared
  const draftUnits = reprotectSemanticUnits(sourceUnits, currentUnits)
  const draftUnitPayload = draftUnits.map(u => ({ id: u.id, kind: u.kind, text: u.protection.content }))
  const protectedDraftDocument = reprotectTranslationInput(translatedContent, protectedSource.manifest)
  return { draftUnits, draftUnitPayload, protectedDraftDocument }
}

async function annotate(env, model, prepared, { target, sourcePath, locale }, extraSystem = '') {
  const { localeContract, protectedSource, sourceUnitPayload } = prepared
  const { draftUnits, draftUnitPayload, protectedDraftDocument } = buildDraft(prepared)
  const messages = buildReviewMessages({
    target, sourcePath,
    sourceContent: protectedSource.content,
    translatedContent: protectedDraftDocument.content,
    sourceDocument: markerFreeDocumentContext(protectedSource.content),
    draftDocument: markerFreeDocumentContext(protectedDraftDocument.content),
    sourceUnits: sourceUnitPayload,
    draftUnits: draftUnitPayload,
    locale, chunkContext: null,
  })
  if (extraSystem) messages[0].content += '\n\n' + extraSystem
  const reviewText = await chat(env.REVIEW_AGENT_BASE_URL, env.REVIEW_AGENT_API_KEY, {
    model,
    messages,
  })
  const evidence = parseAndValidateReviewEvidence(reviewText, {
    sourceContent: JSON.stringify(sourceUnitPayload),
    draftContent: JSON.stringify(draftUnitPayload),
    localeContract,
  })
  return evidence.validatedIssues || []
}

// Inject a known omission: leave a substantive numeric unit untranslated (English).
function injectOmission(prepared) {
  const { units, sourceContent, currentUnits } = prepared
  const target = currentUnits.find(u => (u.source || '').length > 80 && /\d/.test(u.source || '') && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(u.source || ''))
  if (!target) return null
  const injectedUnits = currentUnits.map(u => u.id === target.id ? { ...u, translation: u.source } : u)
  const translatedContent = patchSemanticUnits(sourceContent, units, injectedUnits)
  return { ...prepared, currentUnits: injectedUnits, translatedContent, injectedUnitId: target.id, injectedType: 'untranslated_prose' }
}

async function main() {
  const env = loadDotEnv()
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const onlySample = args.get('--sample')
  const samples = onlySample ? [onlySample] : SAMPLES

  const results = []
  for (const sample of samples) {
    const sourcePath = path.join(SITE_DIR, sample)
    const sourceContent = fs.readFileSync(sourcePath, 'utf8')
    console.log(`\n===== ${sample.split('/').pop()} =====`)
    const prepared = await prepareFile(env, sample, sourceContent, TARGET, LOCALE)
    if (!prepared) { console.log('  (no semantic units)'); continue }

    const opts = { target: TARGET, sourcePath: sample, locale: LOCALE }

    // baseline (no injection)
    const judgeBase = await annotate(env, JUDGE_MODEL, prepared, opts)
    const reviewBase = await annotate(env, REVIEW_MODEL, prepared, opts)

    // negative control (inject omission)
    const injected = injectOmission(prepared)
    const EXTRA = 'A semantic unit whose draft text is still English (identical to its source) is an untranslated_prose issue — report it. Identical source and draft quotes are valid evidence for untranslated_prose.'
    let judgeInj = []
    let reviewInj = []
    let reviewInjFixed = []
    if (injected) {
      judgeInj = await annotate(env, JUDGE_MODEL, injected, opts)
      reviewInj = await annotate(env, REVIEW_MODEL, injected, opts)
      reviewInjFixed = await annotate(env, REVIEW_MODEL, injected, opts, EXTRA)
    }

    const findInjected = issues => issues.filter(i => i.location === injected?.injectedUnitId || i.location?.startsWith(`${injected?.injectedUnitId};`))

    results.push({
      sample, target: TARGET, locale: LOCALE,
      judgeBase: judgeBase.length, reviewBase: reviewBase.length,
      injectedUnitId: injected?.injectedUnitId ?? null,
      judgeInj: judgeInj.length, reviewInj: reviewInj.length, reviewInjFixed: reviewInjFixed.length,
      judgeCaughtInjection: injected ? findInjected(judgeInj).map(i => `${i.type}/${i.severity}`) : [],
      reviewCaughtInjection: injected ? findInjected(reviewInj).map(i => `${i.type}/${i.severity}`) : [],
      reviewFixedCaughtInjection: injected ? findInjected(reviewInjFixed).map(i => `${i.type}/${i.severity}`) : [],
    })

    console.log(`  基线(无注入): judge=${judgeBase.length} review=${reviewBase.length}`)
    if (injected) {
      console.log(`  注入漏译 @${injected.injectedUnitId}: judge=${judgeInj.length} review=${reviewInj.length} review(修正prompt)=${reviewInjFixed.length}`)
      console.log(`  judge 报出注入错误: ${JSON.stringify(findInjected(judgeInj).map(i => `${i.type}/${i.severity}`))}`)
      console.log(`  review 报出注入错误: ${JSON.stringify(findInjected(reviewInj).map(i => `${i.type}/${i.severity}`))}`)
      console.log(`  review(修正prompt) 报出注入错误: ${JSON.stringify(findInjected(reviewInjFixed).map(i => `${i.type}/${i.severity}`))}`)
    } else {
      console.log('  未找到可注入的数值单元')
    }
  }

  const out = path.join(SITE_DIR, 'tmp', `calibrate-${Date.now()}.json`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(results, null, 2))
  console.log(`\nResults -> ${out}`)
}

main().catch(error => {
  console.error('FATAL', error)
  process.exit(1)
})
