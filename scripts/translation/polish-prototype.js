'use strict'

/**
 * Polish prototype: translate (deepseek-v4-pro) -> polish (qwen-max) for EN->zh-CN,
 * producing before/after files for human fluency judgement.
 *
 * Throwaway evaluation script — does not touch production code paths.
 */

const fs = require('node:fs')
const path = require('node:path')

const SITE_DIR = path.resolve(__dirname, '../..')

const { buildTranslationMessages } = require('./agentRunner')
const { loadLocaleContract, formatLocaleContract } = require('./localeContract')
const { protectTranslationInput, reprotectTranslationInput, restoreProtectedContent } = require('./protectedContent')
const { collectSemanticUnits, protectSemanticUnits, restoreSemanticUnitResponse, patchSemanticUnits } = require('./semanticUnits')

const TARGET = 'zh-CN-reference'
const LOCALE = 'zh-CN'
const TRANSLATE_MODEL = 'deepseek-v4-pro'
const POLISH_MODEL = 'deepseek-v4-pro'

const SAMPLES = [
  'content/en/reference/api/python/python/MilvusClient/MilvusClient-Vector/Vector-search.md',
  'content/en/reference/api/go/go/v1/v1-Collection/v1-Collection-SearchParams.md',
  'content/en/reference/api/python/python/ORM/ORM-Collection/Collection-search.md',
]

const POLISH_SYSTEM = `You are a translation polisher for Simplified Chinese technical documentation. Improve the fluency and naturalness of the Chinese translation while strictly preserving:

1. Meaning: do not add, remove, or change any information from the source.
2. Terminology: keep all locale-contract terms exactly as approved.
3. Protected markers: never modify, reorder, duplicate, or remove any <!-- ZDOC-PROTECTED:... --> marker. The bytes they stand for are locked.

Rewrite only wording, sentence flow, and naturalness — phrase it the way a native Chinese technical writer would. Return the full polished translation, preserving every protected marker exactly and nothing else.`

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

async function chat(env, model, messages, extra) {
  const res = await fetch(`${env.TRANSLATION_AGENT_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TRANSLATION_AGENT_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0, ...extra }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content returned')
  return { content: content.trim(), usage: data?.usage || {} }
}

async function translate(env, sourcePath, sourceContent, localeContract) {
  const units = await collectSemanticUnits(sourceContent, { idPrefix: 'document' })
  if (!units.length) return { translatedContent: sourceContent, manifest: null, elapsed: 0 }
  const protectedOptions = { literalTokens: localeContract.doNotTranslate }
  const protectedSource = protectTranslationInput(sourceContent, protectedOptions)
  const sourceUnits = protectSemanticUnits(units, u => u.source, protectedOptions)
  const sourceUnitPayload = sourceUnits.map(u => ({ id: u.id, kind: u.kind, text: u.protection.content }))

  const t0 = Date.now()
  const { content } = await chat(env, TRANSLATE_MODEL, buildTranslationMessages({ target: TARGET, sourcePath, sourceContent: protectedSource.content, sourceDocument: markerFreeDocumentContext(protectedSource.content), semanticUnits: sourceUnitPayload, locale: LOCALE, chunkContext: null, retryFeedback: null }), { thinking: { type: 'disabled' } })
  const elapsed = Date.now() - t0
  const currentUnits = restoreSemanticUnitResponse(content, { field: 'translations', protectedUnits: sourceUnits, localeContract })
  const translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  return { translatedContent, manifest: protectedSource.manifest, protectedSourceContent: protectedSource.content, elapsed }
}

async function polish(env, sourceProtected, draftProtected, localeContract) {
  const t0 = Date.now()
  const system = `${POLISH_SYSTEM}\n\n${formatLocaleContract(localeContract)}`
  const user = `<source>\n${sourceProtected}\n</source>\n\n<draft>\n${draftProtected}\n</draft>`
  const { content, usage } = await chat(env, POLISH_MODEL, [{ role: 'system', content: system }, { role: 'user', content: user }], { thinking: { type: 'disabled' } })
  const elapsed = Date.now() - t0
  return { polishedProtected: content, elapsed, usage }
}

async function main() {
  const env = loadDotEnv()
  const localeContract = loadLocaleContract(TARGET)
  const outDir = path.join(SITE_DIR, 'tmp', `polish-${Date.now()}`)
  fs.mkdirSync(outDir, { recursive: true })

  const summary = []
  for (const sample of SAMPLES) {
    const base = sample.split('/').pop()
    const sourceContent = fs.readFileSync(path.join(SITE_DIR, sample), 'utf8')
    console.log(`\n===== ${base} =====`)
    try {
      const tr = await translate(env, sample, sourceContent, localeContract)
      // reprotect translated output so protected bytes are locked before polishing
      const draftProtected = reprotectTranslationInput(tr.translatedContent, tr.manifest)
      const pol = await polish(env, tr.protectedSourceContent, draftProtected.content, localeContract)
      const polishedContent = restoreProtectedContent(pol.polishedProtected, tr.manifest)

      fs.mkdirSync(path.join(outDir, 'translated'), { recursive: true })
      fs.mkdirSync(path.join(outDir, 'polished'), { recursive: true })
      fs.writeFileSync(path.join(outDir, 'translated', base), tr.translatedContent.endsWith('\n') ? tr.translatedContent : `${tr.translatedContent}\n`, 'utf8')
      fs.writeFileSync(path.join(outDir, 'polished', base), polishedContent.endsWith('\n') ? polishedContent : `${polishedContent}\n`, 'utf8')

      const rec = { sample: base, translateMs: tr.elapsed, polishMs: pol.elapsed, polishPrompt: pol.usage?.prompt_tokens, polishCompletion: pol.usage?.completion_tokens }
      summary.push(rec)
      console.log(`  翻译 ${tr.elapsed}ms | polish ${pol.elapsed}ms (prompt=${rec.polishPrompt} completion=${rec.polishCompletion})`)
    } catch (e) {
      summary.push({ sample: base, error: String(e.message).slice(0, 200) })
      console.log(`  ERROR ${String(e.message).slice(0, 200)}`)
    }
  }

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
  console.log(`\n对比输出 -> ${outDir} (translated/ vs polished/)`)
}

main().catch(error => {
  console.error('FATAL', error)
  process.exit(1)
})
