'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const { validateMdxStructure } = require('../../plugins/mdx-parse/mdxPatcher')
const { readCache, writeCache } = require('./manifest')

const DEFAULT_MANIFEST = 'tmp/translation-manifest.json'
const DEFAULT_PROVIDER_RETRIES = 3

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeBaseUrl(raw) {
  const base = String(raw || '').replace(/\/+$/, '')
  return base.endsWith('/v1') ? base : `${base}/v1`
}

function loadPrompt(name) {
  const promptPath = path.join(process.cwd(), '.github', 'prompts', name)
  return fs.readFileSync(promptPath, 'utf8')
}

function stripCodeFence(text) {
  return String(text || '').trim().replace(/^```(?:json|markdown|mdx)?\s*/i, '').replace(/\s*```$/, '').trim()
}

function parseReview(text) {
  const cleaned = stripCodeFence(text)
  try {
    const parsed = JSON.parse(cleaned)
    return {
      pass: parsed.pass === true,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    }
  } catch {
    return {
      pass: false,
      issues: [{ severity: 'high', type: 'review_parse_error', comment: cleaned.slice(0, 500) }],
    }
  }
}

function isRetryableProviderError(error) {
  const message = String(error?.message || error)
  return /\b(408|409|425|429|500|502|503|504)\b/.test(message) ||
    /connection error|fetch failed|network|timeout|timed out|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message)
}

async function createProviderCall(agentConfigs, options = {}) {
  const maxRetries = Number.isFinite(options.maxRetries) ? options.maxRetries : DEFAULT_PROVIDER_RETRIES
  const retryDelayMs = Number.isFinite(options.retryDelayMs) ? options.retryDelayMs : 1000

  return async function callModel({ agent, messages }) {
    const config = agentConfigs[agent]
    if (!config?.baseUrl || !config?.apiKey || !config?.model) {
      throw new Error(`Missing provider config for ${agent} agent`)
    }

    let lastError
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            temperature: agent === 'review' ? 0 : 0.1,
          }),
        })
        const data = await res.json().catch(() => ({}))
        const content = data?.choices?.[0]?.message?.content
        if (!res.ok || !content) {
          throw new Error(`${agent} agent failed with HTTP ${res.status}: ${JSON.stringify(data).slice(0, 500)}`)
        }
        return content.trim()
      } catch (error) {
        lastError = error
        if (attempt >= maxRetries || !isRetryableProviderError(error)) break
        const waitMs = retryDelayMs * (2 ** attempt)
        console.warn(`[translation-agent] ${agent} call failed; retrying in ${waitMs}ms (${attempt + 1}/${maxRetries}): ${error.message}`)
        await sleep(waitMs)
      }
    }
    throw lastError
  }
}

async function validateTranslatedContent(content) {
  const errors = []
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fmMatch) {
    try {
      yaml.load(fmMatch[1])
    } catch (error) {
      errors.push(`YAML frontmatter error: ${error.message.split('\n')[0]}`)
    }
  }
  try {
    const { compile } = await import('@mdx-js/mdx')
    await compile(content, { development: false })
  } catch (error) {
    errors.push(`MDX compile error: ${String(error.message || error).split('\n')[0]}`)
  }
  const structureErrors = validateMdxStructure(content)
  if (structureErrors.length) errors.push(...structureErrors)
  return errors
}

function buildTranslationMessages({ sourcePath, sourceContent, locale }) {
  return [
    { role: 'system', content: loadPrompt('codex-translation-agent.md') },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n\nTranslate this complete MDX/Markdown file:\n\n${sourceContent}`,
    },
  ]
}

function buildReviewMessages({ sourcePath, sourceContent, translatedContent, locale }) {
  return [
    { role: 'system', content: loadPrompt('codex-review-agent.md') },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n\nEnglish source:\n${sourceContent}\n\nTranslated draft:\n${translatedContent}`,
    },
  ]
}

function buildCorrectionMessages({ sourcePath, sourceContent, translatedContent, review, locale }) {
  return [
    { role: 'system', content: loadPrompt('codex-correction-agent.md') },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n\nEnglish source:\n${sourceContent}\n\nCurrent translation:\n${translatedContent}\n\nReview JSON:\n${JSON.stringify(review, null, 2)}`,
    },
  ]
}

async function processManifestItem({
  siteDir,
  item,
  callModel,
  maxReviewRounds = 2,
  validate = validateTranslatedContent,
}) {
  const absSourcePath = path.join(siteDir, item.sourcePath)
  const absTargetPath = path.join(siteDir, item.targetPath)
  const sourceContent = fs.readFileSync(absSourcePath, 'utf8')
  let translatedContent = stripCodeFence(await callModel({
    agent: 'translation',
    messages: buildTranslationMessages({
      sourcePath: item.sourcePath,
      sourceContent,
      locale: item.locale,
    }),
  }))

  let review = { pass: false, issues: [] }
  for (let round = 0; round <= maxReviewRounds; round++) {
    review = parseReview(await callModel({
      agent: 'review',
      messages: buildReviewMessages({
        sourcePath: item.sourcePath,
        sourceContent,
        translatedContent,
        locale: item.locale,
      }),
    }))
    if (review.pass) break
    if (round === maxReviewRounds) break
    translatedContent = stripCodeFence(await callModel({
      agent: 'correction',
      messages: buildCorrectionMessages({
        sourcePath: item.sourcePath,
        sourceContent,
        translatedContent,
        review,
        locale: item.locale,
      }),
    }))
  }

  const validationErrors = await validate(translatedContent)
  if (!review.pass || validationErrors.length) {
    return {
      ...item,
      status: 'failed',
      review,
      validationErrors,
    }
  }

  fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
  fs.writeFileSync(absTargetPath, translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`, 'utf8')
  return {
    ...item,
    status: 'translated',
    review,
    validationErrors: [],
  }
}

function loadAgentConfigsFromEnv() {
  return {
    translation: {
      baseUrl: process.env.TRANSLATION_AGENT_BASE_URL,
      apiKey: process.env.TRANSLATION_AGENT_API_KEY,
      model: process.env.TRANSLATION_AGENT_MODEL,
    },
    review: {
      baseUrl: process.env.REVIEW_AGENT_BASE_URL,
      apiKey: process.env.REVIEW_AGENT_API_KEY,
      model: process.env.REVIEW_AGENT_MODEL,
    },
    correction: {
      baseUrl: process.env.REVIEW_AGENT_BASE_URL,
      apiKey: process.env.REVIEW_AGENT_API_KEY,
      model: process.env.REVIEW_AGENT_MODEL,
    },
  }
}

async function main() {
  require('dotenv/config')
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) {
    args.set(process.argv[i], process.argv[i + 1])
  }
  const siteDir = process.cwd()
  const manifestPath = args.get('--manifest') || DEFAULT_MANIFEST
  const reportPath = args.get('--report') || 'tmp/translation-report.json'
  const maxReviewRounds = Number(args.get('--max-review-rounds') || process.env.TRANSLATION_MAX_REVIEW_ROUNDS || 2)
  const maxProviderRetries = Number(process.env.TRANSLATION_AGENT_RETRIES || DEFAULT_PROVIDER_RETRIES)
  const allowPartial = String(process.env.TRANSLATION_ALLOW_PARTIAL || '').toLowerCase() === 'true'
  const manifest = JSON.parse(fs.readFileSync(path.join(siteDir, manifestPath), 'utf8'))
  const callModel = await createProviderCall(loadAgentConfigsFromEnv(), { maxRetries: maxProviderRetries })
  const cache = readCache(siteDir, manifest.locale)
  const results = []
  const absReportPath = path.join(siteDir, reportPath)

  function persistProgress() {
    writeCache(siteDir, manifest.locale, cache)
    fs.mkdirSync(path.dirname(absReportPath), { recursive: true })
    fs.writeFileSync(absReportPath, JSON.stringify({ locale: manifest.locale, results }, null, 2) + '\n')
  }

  for (const item of manifest.items) {
    console.log(`[translation-agent] ${item.sourcePath}`)
    let result
    try {
      result = await processManifestItem({ siteDir, item, callModel, maxReviewRounds })
    } catch (error) {
      result = {
        ...item,
        status: 'failed',
        error: String(error?.message || error),
      }
      console.error(`[translation-agent] failed ${item.sourcePath}: ${result.error}`)
    }
    results.push(result)
    if (result.status === 'translated') {
      cache.files[item.sourcePath] = {
        sourceHash: item.sourceHash,
        targetPath: item.targetPath,
        translatedAt: new Date().toISOString(),
      }
    }
    persistProgress()
  }

  const failed = results.filter(result => result.status !== 'translated')
  const translatedCount = results.length - failed.length
  console.log(`[translation-agent] translated=${translatedCount} failed=${failed.length}`)
  if (failed.length && (!allowPartial || translatedCount === 0)) process.exit(1)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}

module.exports = {
  buildCorrectionMessages,
  buildReviewMessages,
  buildTranslationMessages,
  createProviderCall,
  isRetryableProviderError,
  normalizeBaseUrl,
  parseReview,
  processManifestItem,
  stripCodeFence,
  validateTranslatedContent,
}
