'use strict'

/**
 * EN -> zh-CN translation comparison: deepseek-v4-pro vs qwen-max, pure
 * translation (no review/correction), for human side-by-side judgement.
 *
 * Throwaway evaluation script — does not touch production code paths.
 */

const fs = require('node:fs')
const path = require('node:path')

const SITE_DIR = path.resolve(__dirname, '../..')

const { buildTranslationMessages } = require('./agentRunner')
const { loadLocaleContract } = require('./localeContract')
const { protectTranslationInput } = require('./protectedContent')
const { collectSemanticUnits, protectSemanticUnits, restoreSemanticUnitResponse, patchSemanticUnits } = require('./semanticUnits')

const MODELS = [
  { name: 'deepseek-v4-pro', extra: { thinking: { type: 'disabled' } } },
  { name: 'qwen-max', extra: { enable_thinking: false } },
]
const TARGET = 'zh-CN-reference'
const LOCALE = 'zh-CN'

const SAMPLES = [
  'content/en/reference/cli/cli/DataOperations/DataOperations-Vector/Vector-hybridsearch.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Vector/Vector-search.md',
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection.md',
  'content/en/reference/api/go/go/v1/v1-Collection/v1-Collection-SearchParams.md',
  'content/en/reference/api/python/python/ORM/ORM-Collection/Collection-search.md',
]

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

async function translate(env, model, sourcePath, sourceContent) {
  const localeContract = loadLocaleContract(TARGET)
  const units = await collectSemanticUnits(sourceContent, { idPrefix: 'document' })
  if (!units.length) return { translatedContent: sourceContent, elapsed: 0, usage: {} }
  const protectedOptions = { literalTokens: localeContract.doNotTranslate }
  const protectedSource = protectTranslationInput(sourceContent, protectedOptions)
  const sourceUnits = protectSemanticUnits(units, u => u.source, protectedOptions)
  const sourceUnitPayload = sourceUnits.map(u => ({ id: u.id, kind: u.kind, text: u.protection.content }))

  const t0 = Date.now()
  const res = await fetch(`${env.TRANSLATION_AGENT_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TRANSLATION_AGENT_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.name,
      messages: buildTranslationMessages({ target: TARGET, sourcePath, sourceContent: protectedSource.content, sourceDocument: markerFreeDocumentContext(protectedSource.content), semanticUnits: sourceUnitPayload, locale: LOCALE, chunkContext: null, retryFeedback: null }),
      temperature: 0,
      ...model.extra,
    }),
  })
  const data = await res.json().catch(() => ({}))
  const elapsed = Date.now() - t0
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content returned')
  const currentUnits = restoreSemanticUnitResponse(content.trim(), { field: 'translations', protectedUnits: sourceUnits, localeContract })
  const translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  return { translatedContent, elapsed, usage: data?.usage || {} }
}

async function main() {
  const env = loadDotEnv()
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const onlySample = args.get('--sample')
  const samples = onlySample ? [onlySample] : SAMPLES
  const outDir = path.join(SITE_DIR, 'tmp', `compare-${Date.now()}`)
  fs.mkdirSync(outDir, { recursive: true })

  const summary = []
  for (const sample of samples) {
    const sourceContent = fs.readFileSync(path.join(SITE_DIR, sample), 'utf8')
    const base = sample.split('/').pop()
    console.log(`\n===== ${base} =====`)
    for (const model of MODELS) {
      const dir = path.join(outDir, model.name)
      fs.mkdirSync(dir, { recursive: true })
      try {
        const r = await translate(env, model, sample, sourceContent)
        fs.writeFileSync(path.join(dir, base), r.translatedContent.endsWith('\n') ? r.translatedContent : `${r.translatedContent}\n`, 'utf8')
        const u = r.usage || {}
        const rec = {
          sample: base, model: model.name, elapsedMs: r.elapsed,
          prompt: u.prompt_tokens || 0, completion: u.completion_tokens || 0,
          reasoning: u.completion_tokens_details?.reasoning_tokens || 0,
        }
        summary.push(rec)
        console.log(`  ${model.name}: ${r.elapsed}ms | prompt=${rec.prompt} completion=${rec.completion} reasoning=${rec.reasoning}`)
      } catch (e) {
        summary.push({ sample: base, model: model.name, error: String(e.message).slice(0, 200) })
        console.log(`  ${model.name}: ERROR ${String(e.message).slice(0, 200)}`)
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
  console.log(`\n译文输出 -> ${outDir}`)
}

main().catch(error => {
  console.error('FATAL', error)
  process.exit(1)
})
