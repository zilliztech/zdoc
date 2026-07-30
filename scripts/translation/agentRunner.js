'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const { loadTypeScript } = require('../lib/load-typescript')
const { applyMdxPatches, validateMdxStructure } = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const { chunkDocument, DEFAULT_MAX_CHARS, DEFAULT_TARGET_CHARS } = require('./chunker')
const { readCache, writeCache, writeJsonAtomic } = require('./manifest')
const { assembleRestDocument, loadPrompt, parseRestDocument, promptNamesFor, translateRestSpecs } = require('./restSpecLocalization')
const { resolveTranslationTarget } = loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts')
const { assertSafeRepositoryRelativePath } = loadTypeScript('../../packages/docs-tooling/src/validation/ownership.ts')
const {
  assertSafeRepositoryPathChain,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
} = loadTypeScript('../../packages/docs-tooling/src/reference/translationManifest.ts')
const { validateTranslatedSidebarFragment } = loadTypeScript('../../packages/docs-tooling/src/translation/candidates.ts')
const { defaultReferenceManualForPath } = loadTypeScript('../../packages/docs-tooling/src/cli.ts')

const DEFAULT_MANIFEST = 'tmp/translation-manifest.json'
const DEFAULT_PROVIDER_RETRIES = 3
const DEFAULT_FILE_RETRIES = 1
const DEFAULT_PROVIDER_TIMEOUT_MS = 300000
const DEFAULT_FILE_TIMEOUT_MS = 900000
const REFERENCE_LANDING_SOURCE_ROOT = 'content/en/reference/'
const REFERENCE_LANDING_PROSE_SAFETY_FACTOR = 1.2

let referenceLandingContracts

function loadReferenceLandingContracts() {
  if (referenceLandingContracts) return referenceLandingContracts
  const configPath = path.resolve(__dirname, '../../config/reference-navigation.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  if (!Array.isArray(config?.targets)) throw new Error('Reference navigation config must contain a targets array')
  const contracts = new Map()
  for (const target of config.targets) {
    if (
      typeof target?.landingPage !== 'string' ||
      !Number.isInteger(target.minimumProseCharacters) || target.minimumProseCharacters <= 0 ||
      !Number.isInteger(target.minimumHeadingCount) || target.minimumHeadingCount <= 0
    ) {
      throw new Error('Reference navigation landing contracts must declare valid paths, prose minimums, and heading minimums')
    }
    const sourcePath = `${REFERENCE_LANDING_SOURCE_ROOT}${target.landingPage}`
    if (contracts.has(sourcePath)) throw new Error(`Duplicate Reference landing contract: ${sourcePath}`)
    contracts.set(sourcePath, {
      minimumHeadingCount: target.minimumHeadingCount,
      minimumProseCharacters: target.minimumProseCharacters,
      targetProseCharacters: Math.ceil(target.minimumProseCharacters * REFERENCE_LANDING_PROSE_SAFETY_FACTOR),
    })
  }
  referenceLandingContracts = contracts
  return contracts
}

function formatReferenceLandingContract(target, sourcePath) {
  if (target !== 'zh-CN-reference') return ''
  const contract = loadReferenceLandingContracts().get(sourcePath)
  if (!contract) return ''
  return [
    'Reference landing-page contract from config/reference-navigation.json:',
    `- The final translated file must contain at least ${contract.minimumHeadingCount} Markdown headings.`,
    `- Validator minimum meaningful prose: ${contract.minimumProseCharacters} Unicode letters or digits after front matter, code fences, imports, and standalone JSX tags are excluded.`,
    `- Aim for at least ${contract.targetProseCharacters} meaningful prose characters (20% safety margin) without repetitive filler.`,
    '- Preserve all source facts and structure while expanding concise phrasing naturally when needed.',
    '- The reviewer must return pass=false if the translated draft does not satisfy this contract.',
    '',
  ].join('\n')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseNonNegativeInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function loadChunkLimits(env = process.env) {
  const targetChars = parsePositiveInteger(env.TRANSLATION_CHUNK_TARGET_CHARS, DEFAULT_TARGET_CHARS)
  const maxChars = parsePositiveInteger(env.TRANSLATION_CHUNK_MAX_CHARS, DEFAULT_MAX_CHARS)
  if (maxChars < targetChars) {
    throw new Error('TRANSLATION_CHUNK_MAX_CHARS must be greater than or equal to TRANSLATION_CHUNK_TARGET_CHARS')
  }
  return { targetChars, maxChars }
}

function normalizeBaseUrl(raw) {
  const base = String(raw || '').replace(/\/+$/, '')
  return base.endsWith('/v1') ? base : `${base}/v1`
}

function stripCodeFence(text) {
  const trimmed = String(text || '').trim()
  const wrapped = trimmed.match(/^```(?:json|markdown|mdx)?[\t ]*\r?\n([\s\S]*)\r?\n```$/i)
  return wrapped ? wrapped[1].trim() : trimmed
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
    error?.name === 'AbortError' ||
    /aborted|connection error|fetch failed|network|timeout|timed out|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message)
}

async function createProviderCall(agentConfigs, options = {}) {
  const maxRetries = Number.isFinite(options.maxRetries) ? options.maxRetries : DEFAULT_PROVIDER_RETRIES
  const retryDelayMs = Number.isFinite(options.retryDelayMs) ? options.retryDelayMs : 1000
  const timeoutMs = parsePositiveInteger(options.timeoutMs, DEFAULT_PROVIDER_TIMEOUT_MS)

  return async function callModel({ agent, messages }) {
    const config = agentConfigs[agent]
    if (!config?.baseUrl || !config?.apiKey || !config?.model) {
      throw new Error(`Missing provider config for ${agent} agent`)
    }

    let lastError
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
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
          signal: controller.signal,
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
      } finally {
        clearTimeout(timeout)
      }
    }
    throw lastError
  }
}

async function withTimeout(promise, timeoutMs, message) {
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

function summarizeFailedResult(result) {
  if (result?.error) return String(result.error)
  if (Array.isArray(result?.validationErrors) && result.validationErrors.length) return result.validationErrors.join('; ')
  if (Array.isArray(result?.review?.issues) && result.review.issues.length) {
    return result.review.issues.map(issue => issue?.comment || issue?.type || JSON.stringify(issue)).join('; ')
  }
  return 'translation returned failed status'
}

async function processItemWithRetry(item, options) {
  const maxRetries = parseNonNegativeInteger(options.maxRetries, DEFAULT_FILE_RETRIES)
  const failures = []

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let result
    try {
      result = await options.processItem(item, attempt)
    } catch (error) {
      result = { ...item, status: 'failed', error: String(error?.message || error) }
    }

    if (result.status === 'translated') {
      return failures.length ? { ...result, attempts: attempt + 1, retryFailures: failures } : result
    }

    failures.push({ attempt: attempt + 1, error: summarizeFailedResult(result) })
    if (attempt < maxRetries) {
      options.log?.warn?.(`[translation-agent] retrying ${item.sourcePath} after failed attempt ${attempt + 1}/${maxRetries + 1}: ${failures.at(-1).error}`)
    } else {
      return { ...result, attempts: attempt + 1, retryFailures: failures }
    }
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

function formatDocumentContext(chunkContext) {
  if (!chunkContext) return ''
  const lines = [
    `Chunk: ${chunkContext.index + 1} of ${chunkContext.total}`,
    chunkContext.documentTitle ? `Document title: ${chunkContext.documentTitle}` : null,
    chunkContext.previousTranslatedHeading ? `Previous translated heading: ${chunkContext.previousTranslatedHeading}` : null,
  ].filter(Boolean)
  return `${lines.join('\n')}\n`
}

function buildTranslationMessages({ target, sourcePath, sourceContent, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const instruction = chunkContext
    ? 'Translate this consecutive MDX/Markdown section:'
    : 'Translate this complete MDX/Markdown file:'
  return [
    { role: 'system', content: loadPrompt(promptNamesFor(target).translation) },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n${context}\n${instruction}\n\n${sourceContent}`,
    },
  ]
}

function buildReviewMessages({ target, sourcePath, sourceContent, translatedContent, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  return [
    { role: 'system', content: loadPrompt(promptNamesFor(target).review) },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n${context}\nEnglish source${chunkContext ? ' section' : ''}:\n${sourceContent}\n\nTranslated draft${chunkContext ? ' section' : ''}:\n${translatedContent}`,
    },
  ]
}

function correctionPromptFor(target) {
  if (target === 'ja-JP') return loadPrompt('codex-correction-agent.md')
  return `${loadPrompt(promptNamesFor(target).translation)}\n\nRevise the current translation to fix every issue in the supplied review JSON. Prefer surgical correction and return only the corrected content.`
}

function buildCorrectionMessages({ target, sourcePath, sourceContent, translatedContent, review, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  return [
    {
      role: 'system',
      content: correctionPromptFor(target),
    },
    {
      role: 'user',
      content: `Locale: ${locale}\nSource path: ${sourcePath}\n${context}\nEnglish source${chunkContext ? ' section' : ''}:\n${sourceContent}\n\nCurrent translation${chunkContext ? ' section' : ''}:\n${translatedContent}\n\nReview JSON:\n${JSON.stringify(review, null, 2)}`,
    },
  ]
}

function extractDocumentTitle(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  try {
    const frontmatter = yaml.load(match[1])
    return typeof frontmatter?.title === 'string' ? frontmatter.title : null
  } catch {
    return null
  }
}

function extractFirstHeading(content) {
  return content.match(/^ {0,3}#{1,6}[\t ]+(.+)$/m)?.[1]?.trim() || null
}

function restoreBoundaryWhitespace(sourceContent, translatedContent) {
  const leading = sourceContent.match(/^\s*/)?.[0] || ''
  const trailing = sourceContent.match(/\s*$/)?.[0] || ''
  return `${leading}${String(translatedContent || '').trim()}${trailing}`
}

function stabilizeBareUrlFormatting(content) {
  return String(content).replace(
    /\*\*(https?:\/\/[^\s]+?)\*\*(?=[\u3000-\u303f\uff00-\uffef])/gu,
    '**`$1`**',
  )
}

function protectEsmStatements(content) {
  const statements = []
  const pattern = /^[\t ]*(?:import|export)\b[^\r\n]*(?:\r?\n|$)/gm
  const protectedContent = String(content).replace(pattern, statement => {
    const index = statements.push(statement) - 1
    const newline = statement.endsWith('\r\n') ? '\r\n' : statement.endsWith('\n') ? '\n' : ''
    return `<!-- zdoc-preserved-esm:${index} -->${newline}`
  })
  return { content: protectedContent, statements }
}

function restoreProtectedEsm(content, protectedEsm) {
  let restored = String(content)
  for (let index = 0; index < protectedEsm.statements.length; index++) {
    const marker = `<!-- zdoc-preserved-esm:${index} -->`
    if (restored.split(marker).length !== 2) throw new Error(`Protected ESM marker ${index} was changed during translation`)
    restored = restored.replace(marker, protectedEsm.statements[index].replace(/\r?\n$/, ''))
  }
  if (/<!--\s*zdoc-preserved-esm:/i.test(restored)) throw new Error('Unexpected protected ESM marker remained after translation')
  return restored
}

function headingAnchorIds(content) {
  return [...String(content).matchAll(/\\?\{#([A-Za-z0-9][\w.-]*)\}/g)].map(match => match[1])
}

function validateHeadingAnchorIdentity(sourceContent, translatedContent) {
  const source = headingAnchorIds(sourceContent)
  const translated = headingAnchorIds(translatedContent)
  return JSON.stringify(source) === JSON.stringify(translated)
    ? []
    : [`Heading anchor identity changed: expected ${JSON.stringify(source)}, received ${JSON.stringify(translated)}`]
}

function restoreEsmStatements(sourceContent, translatedContent) {
  const pattern = /^[\t ]*(?:import|export)\b[^\r\n]*(?:\r?\n|$)/gm
  const sourceStatements = String(sourceContent).match(pattern) || []
  const translatedStatements = String(translatedContent).match(pattern) || []
  if (sourceStatements.length !== translatedStatements.length) return translatedContent
  let index = 0
  return String(translatedContent).replace(pattern, () => sourceStatements[index++])
}

async function translateAndReviewUnit({
  target,
  sourcePath,
  sourceContent,
  locale,
  callModel,
  maxReviewRounds,
  chunkContext,
}) {
  const protectedEsm = protectEsmStatements(sourceContent)
  const modelSourceContent = protectedEsm.content
  let translatedContent = restoreBoundaryWhitespace(modelSourceContent, stripCodeFence(await callModel({
    agent: 'translation',
    messages: buildTranslationMessages({ target, sourcePath, sourceContent: modelSourceContent, locale, chunkContext }),
  })))

  let review = { pass: false, issues: [] }
  for (let round = 0; round <= maxReviewRounds; round++) {
    review = parseReview(await callModel({
      agent: 'review',
      messages: buildReviewMessages({ target, sourcePath, sourceContent: modelSourceContent, translatedContent, locale, chunkContext }),
    }))
    if (review.pass || round === maxReviewRounds) break
    translatedContent = restoreBoundaryWhitespace(modelSourceContent, stripCodeFence(await callModel({
      agent: 'correction',
      messages: buildCorrectionMessages({ target, sourcePath, sourceContent: modelSourceContent, translatedContent, review, locale, chunkContext }),
    })))
  }
  return { translatedContent: restoreProtectedEsm(translatedContent, protectedEsm), review }
}

function collectSidebarFragments(value, key, matches = []) {
  if (Array.isArray(value)) {
    for (const child of value) collectSidebarFragments(child, key, matches)
    return matches
  }
  if (!value || typeof value !== 'object') return matches
  if (value.key === key) matches.push(value)
  collectSidebarFragments(value.items, key, matches)
  return matches
}

function readToolsSidebarFragment(siteDir, item) {
  const target = resolveTranslationTarget('zh-CN-tools')
  if (item.target !== target.id) throw new Error('Sidebar fragment pseudo-paths are supported only for zh-CN-tools')
  if (item.sourcePath !== target.sidebarSource || item.targetPath !== target.sidebarTarget) {
    throw new Error('Sidebar fragment paths must match the zh-CN-tools target registry')
  }
  const [relativePath, key, extra] = item.sourcePath.split('#')
  if (!relativePath || !key || extra !== undefined) throw new Error(`Invalid sidebar fragment pseudo-path: ${item.sourcePath}`)
  const absolutePath = assertSafeRepositoryPathChain(siteDir, relativePath, 'Tools sidebar source module')
  const resolved = require.resolve(absolutePath)
  delete require.cache[resolved]
  const loaded = require(resolved)
  const sidebar = loaded && typeof loaded === 'object' && 'default' in loaded ? loaded.default : loaded
  const matches = collectSidebarFragments(sidebar, key)
  if (matches.length === 0) throw new Error(`Missing sidebar fragment ${key}`)
  if (matches.length > 1) throw new Error(`Ambiguous sidebar fragment ${key}`)
  return matches[0]
}

async function processToolsSidebarFragment({siteDir, item, callModel, maxReviewRounds}) {
  const sourceFragment = readToolsSidebarFragment(siteDir, item)
  const sourceContent = `${JSON.stringify(sourceFragment, null, 2)}\n`
  const unit = await translateAndReviewUnit({
    target: item.target,
    sourcePath: item.sourcePath,
    sourceContent,
    locale: item.locale,
    callModel,
    maxReviewRounds,
    chunkContext: null,
  })
  if (!unit.review.pass) return {...item, status: 'failed', review: unit.review, validationErrors: []}

  let translatedFragment
  try {
    translatedFragment = JSON.parse(unit.translatedContent)
    validateTranslatedSidebarFragment(sourceFragment, translatedFragment)
  } catch (error) {
    return {
      ...item,
      status: 'failed',
      review: unit.review,
      validationErrors: [`Sidebar fragment validation failed: ${String(error?.message || error)}`],
    }
  }

  const absTargetPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(absTargetPath), {recursive: true})
  fs.writeFileSync(absTargetPath, `'use strict'\n\nmodule.exports = ${JSON.stringify([translatedFragment], null, 2)}\n`, 'utf8')
  return {...item, status: 'translated', review: unit.review, validationErrors: [], chunks: {total: 1}}
}

async function processManifestItem({
  siteDir,
  item,
  callModel,
  maxReviewRounds = 2,
  chunkTargetChars = DEFAULT_TARGET_CHARS,
  chunkMaxChars = DEFAULT_MAX_CHARS,
  validate = validateTranslatedContent,
}) {
  if (item.sourcePath.includes('#')) {
    return processToolsSidebarFragment({siteDir, item, callModel, maxReviewRounds})
  }
  const absSourcePath = path.join(siteDir, item.sourcePath)
  const absTargetPath = path.join(siteDir, item.targetPath)
  const sourceContent = fs.readFileSync(absSourcePath, 'utf8')
  const restDocument = (
    item.sourcePath.startsWith('content/en/reference/api/restful/restful/') ||
    item.sourcePath.startsWith('reference/api/restful/restful/')
  ) ? parseRestDocument(sourceContent) : null
  if (restDocument) {
    const shell = await translateAndReviewUnit({
      target: item.target,
      sourcePath: item.sourcePath,
      sourceContent: restDocument.prefix,
      locale: item.locale,
      callModel,
      maxReviewRounds,
      chunkContext: null,
    })
    if (!shell.review.pass) return { ...item, status: 'failed', review: shell.review, validationErrors: [] }
    const specResult = await translateRestSpecs({
      sourceSpecs: restDocument.sourceSpecs,
      target: item.target,
      locale: item.locale,
      callModel,
    })
    const translatedContent = stabilizeBareUrlFormatting(assembleRestDocument({
      translatedPrefix: shell.translatedContent,
      localizedSpecs: specResult.localized,
      suffix: restDocument.suffix,
      locale: item.locale,
    }))
    const validationErrors = await validate(translatedContent)
    if (validationErrors.length) return { ...item, status: 'failed', review: shell.review, validationErrors, restSpecEntries: specResult.translatedCount }
    fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
    fs.writeFileSync(absTargetPath, translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`, 'utf8')
    return { ...item, status: 'translated', review: shell.review, validationErrors: [], chunks: { total: 1 }, restSpecEntries: specResult.translatedCount }
  }
  const chunks = chunkDocument(sourceContent, { targetChars: chunkTargetChars, maxChars: chunkMaxChars })
  const documentTitle = extractDocumentTitle(sourceContent)
  const translatedChunks = []
  let previousTranslatedHeading = null
  let lastReview = { pass: true, issues: [] }

  for (const chunk of chunks) {
    const chunkContext = chunks.length > 1
      ? {
          index: chunk.index,
          total: chunks.length,
          documentTitle,
          previousTranslatedHeading,
        }
      : null
    const unit = await translateAndReviewUnit({
      target: item.target,
      sourcePath: item.sourcePath,
      sourceContent: chunk.source,
      locale: item.locale,
      callModel,
      maxReviewRounds,
      chunkContext,
    })
    lastReview = unit.review
    if (!unit.review.pass) {
      return {
        ...item,
        status: 'failed',
        chunk: { index: chunk.index, total: chunks.length, start: chunk.start, end: chunk.end },
        review: unit.review,
        validationErrors: [],
      }
    }
    translatedChunks.push(unit.translatedContent)
    previousTranslatedHeading = extractFirstHeading(unit.translatedContent) || previousTranslatedHeading
  }

  const translatedContent = await applyMdxPatches(stabilizeBareUrlFormatting(
    restoreEsmStatements(sourceContent, translatedChunks.join('')),
  ), { repairInvalidMdxEsmProse: true })

  const validationErrors = [
    ...validateHeadingAnchorIdentity(sourceContent, translatedContent),
    ...await validate(translatedContent),
  ]
  if (validationErrors.length) {
    return {
      ...item,
      status: 'failed',
      review: lastReview,
      validationErrors,
      chunks: { total: chunks.length },
    }
  }

  fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
  fs.writeFileSync(absTargetPath, translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`, 'utf8')
  return {
    ...item,
    status: 'translated',
    review: lastReview,
    validationErrors: [],
    chunks: { total: chunks.length },
  }
}

function assertExactKeys(value, allowedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  const unexpected = Object.keys(value).filter(key => !allowedKeys.includes(key))
  if (unexpected.length) throw new Error(`${label} must use the exact schema; unexpected field(s): ${unexpected.join(', ')}`)
}

function mappedTargetPath(target, sourcePath) {
  if (target.id === 'ja-JP') {
    for (const mapping of target.mappings) {
      if (sourcePath.startsWith(`${mapping.sourceRoot}/`)) {
        return `${mapping.targetRoot}/${sourcePath.slice(mapping.sourceRoot.length + 1)}`
      }
    }
    return null
  }
  if (target.id === 'zh-CN-tools' && sourcePath === target.sidebarSource) return target.sidebarTarget
  if (!sourcePath.startsWith(`${target.sourceRoot}/`)) return null
  return `${target.targetRoot}/${sourcePath.slice(target.sourceRoot.length + 1)}`
}

function expectedItemType(target, sourcePath) {
  if (target.id === 'zh-CN-reference') return 'reference'
  if (target.id === 'zh-CN-tools') return sourcePath === target.sidebarSource ? 'sidebar' : 'tools'
  if (sourcePath.startsWith(`${target.mappings[0].sourceRoot}/`)) return 'guides'
  if (sourcePath.startsWith(`${target.mappings[1].sourceRoot}/`)) return 'byoc'
  if (sourcePath.startsWith(`${target.mappings[2].sourceRoot}/`)) return 'reference'
  return null
}

function validateTranslationManifest(manifest) {
  assertExactKeys(manifest, ['target', 'locale', 'group', 'sourceCheckpointSha', 'generatedAt', 'items', 'source_delta', 'batch'], 'Translation manifest')
  if (typeof manifest.target !== 'string') throw new Error('Translation manifest target is required')
  let target
  try {
    target = resolveTranslationTarget(manifest.target)
  } catch {
    throw new Error(`Unsupported translation target: ${manifest.target}`)
  }
  promptNamesFor(manifest.target)
  if (manifest.locale !== target.locale) throw new Error(`Translation manifest locale must be ${target.locale} for target ${target.id}`)
  if (!Array.isArray(manifest.items)) throw new Error('Translation manifest items must be an array')
  for (const [index, item] of manifest.items.entries()) {
    const label = `Translation manifest item ${index}`
    assertExactKeys(item, ['sourcePath', 'targetPath', 'sourceHash', 'locale', 'type', 'reason'], label)
    if (item.locale !== target.locale) throw new Error(`${label} locale must be ${target.locale}`)
    if (!(target.id === 'zh-CN-tools' && item.sourcePath === target.sidebarSource)) {
      try {
        assertSafeRepositoryRelativePath(item.sourcePath, `${label} source path`)
      } catch {
        throw new Error(`${label} source path must be a safe normalized repository-relative path`)
      }
    }
    try {
      assertSafeRepositoryRelativePath(item.targetPath, `${label} target path`)
    } catch {
      throw new Error(`${label} target path must be a safe normalized repository-relative path`)
    }
    const expectedTargetPath = mappedTargetPath(target, item.sourcePath)
    if (!expectedTargetPath) throw new Error(`${label} source path is outside target ${target.id}`)
    if (item.targetPath !== expectedTargetPath) throw new Error(`${label} target path must be ${expectedTargetPath}`)
    const expectedType = expectedItemType(target, item.sourcePath)
    if (item.type !== expectedType) throw new Error(`${label} type must be ${expectedType}`)
    if (!/^[0-9a-f]{64}$/.test(item.sourceHash || '')) throw new Error(`${label} sourceHash must be 64 lowercase hex characters`)
    if (!['current_delta', 'missing_target', 'stale_source'].includes(item.reason)) throw new Error(`${label} has an unsupported reason`)
  }
  return manifest
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

async function runWorkerPool(items, options) {
  const concurrency = parsePositiveInteger(options.concurrency, 4)
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      if (options.shouldStopAssigning?.()) return
      const index = cursor
      cursor += 1
      const item = items[index]
      let result
      try {
        result = await options.processItem(item, index)
      } catch (error) {
        result = {
          ...item,
          status: 'failed',
          error: String(error?.message || error),
        }
      }
      results[index] = result
      await options.onResult?.(result, index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

function readJsonIfPresent(siteDir, relativePath, fallback) {
  const absolutePath = path.join(siteDir, relativePath)
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : fallback
}

function loadProgressState(siteDir, manifest, cacheOverride) {
  const target = resolveTranslationTarget(manifest.target)
  if (target.state.kind === 'cache') {
    return {
      kind: 'cache',
      path: target.state.path,
      target,
      value: cacheOverride || readCache(siteDir, target.locale),
    }
  }
  const value = readJsonIfPresent(siteDir, target.state.path, {schemaVersion: 1, records: []})
  return {
    kind: target.state.kind,
    path: target.state.path,
    target,
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    value: target.state.kind === 'reference-manifest' ? parseReferenceTranslationManifest(value) : value,
  }
}

function targetFileHash(siteDir, targetPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(siteDir, targetPath))).digest('hex')
}

function compareCanonicalText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function updateReferenceProgressState(siteDir, progressState, result) {
  const sourceManifest = parseReferenceSourceManifest(readJsonIfPresent(
    siteDir,
    'generated/en/manifests/reference.json',
    null,
  ))
  const previous = progressState.value.records.find(record => record.sourcePath === result.sourcePath)
  const sourceRecord = sourceManifest.records.find(record => record.sourcePath === result.sourcePath)
  const manual = sourceRecord?.manual || previous?.manual || defaultReferenceManualForPath(result.sourcePath)
  const targetHash = targetFileHash(siteDir, result.targetPath)
  const record = {
    manual,
    sourcePath: result.sourcePath,
    targetPath: result.targetPath,
    sourceCommit: progressState.sourceCheckpointSha,
    sourceHash: result.sourceHash,
    targetHash,
    status: result.sourceHash === targetHash ? 'unchanged' : 'translated',
  }
  progressState.value = parseReferenceTranslationManifest({
    ...progressState.value,
    records: [
      ...progressState.value.records.filter(existing => existing.sourcePath !== result.sourcePath),
      record,
    ].sort((left, right) => (
      compareCanonicalText(left.manual, right.manual) ||
      compareCanonicalText(left.sourcePath, right.sourcePath) ||
      compareCanonicalText(left.targetPath, right.targetPath)
    )),
  })
}

function updateToolsProgressState(progressState, result) {
  const previous = progressState.value.records.find(record => record.sourcePath === result.sourcePath) || {}
  const record = {
    ...previous,
    sourcePath: result.sourcePath,
    targetPath: result.targetPath,
    sourceHash: result.sourceHash,
    status: 'translated',
    ...(result.type === 'sidebar' ? {kind: 'sidebar'} : {}),
  }
  progressState.value = {
    ...progressState.value,
    schemaVersion: 1,
    records: [
      ...progressState.value.records.filter(existing => existing.sourcePath !== result.sourcePath),
      record,
    ].sort((left, right) => (
      left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath)
    )),
  }
}

function updateProgressState(siteDir, progressState, result, translatedAt) {
  if (progressState.kind === 'cache') {
    progressState.value.files[result.sourcePath] = {
      sourceHash: result.sourceHash,
      targetPath: result.targetPath,
      translatedAt,
    }
    return
  }
  if (progressState.kind === 'reference-manifest') {
    updateReferenceProgressState(siteDir, progressState, result)
    return
  }
  updateToolsProgressState(progressState, result)
}

function writeProgressState(siteDir, progressState) {
  if (progressState.kind === 'cache') {
    writeCache(siteDir, progressState.target.locale, progressState.value)
    return
  }
  writeJsonAtomic(path.join(siteDir, progressState.path), progressState.value)
}

function createProgressCoordinator(options) {
  const results = new Array(options.manifest.items.length)
  const progressState = loadProgressState(options.siteDir, options.manifest, options.cache)
  const checkpointFiles = parsePositiveInteger(options.checkpointFiles, 10)
  const checkpointIntervalMs = parsePositiveInteger(options.checkpointIntervalMs, 300000)
  const absReportPath = path.join(options.siteDir, options.reportPath)
  let completedSinceCheckpoint = 0
  let lastCheckpointAt = options.now?.() || Date.now()

  function metadata() {
    const processed = results.filter(Boolean).length
    return {
      target: options.manifest.target,
      processed,
      remaining: options.manifest.items.length - processed,
      translated: results.filter(result => result?.status === 'translated').length,
      failed: results.filter(result => result && result.status !== 'translated').length,
      generatedAt: new Date(options.now?.() || Date.now()).toISOString(),
    }
  }

  async function checkpoint(force = false) {
    const currentTime = options.now?.() || Date.now()
    if (!force && completedSinceCheckpoint < checkpointFiles && currentTime - lastCheckpointAt < checkpointIntervalMs) return false
    const checkpointMetadata = metadata()
    writeProgressState(options.siteDir, progressState)
    writeJsonAtomic(absReportPath, {
      target: options.manifest.target,
      locale: options.manifest.locale,
      results: results.filter(Boolean),
      checkpoint: checkpointMetadata,
    })
    completedSinceCheckpoint = 0
    lastCheckpointAt = currentTime
    await options.onCheckpoint?.(checkpointMetadata)
    return true
  }

  async function record(result, index) {
    const targetResult = {...result, target: options.manifest.target}
    results[index] = targetResult
    if (targetResult.status === 'translated') updateProgressState(
      options.siteDir,
      progressState,
      targetResult,
      new Date(options.now?.() || Date.now()).toISOString(),
    )
    completedSinceCheckpoint += 1
    await checkpoint(false)
  }

  return {
    cache: progressState.kind === 'cache' ? progressState.value : undefined,
    checkpoint,
    metadata,
    record,
    results,
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
  const maxProviderRetries = parsePositiveInteger(process.env.TRANSLATION_AGENT_RETRIES, DEFAULT_PROVIDER_RETRIES)
  const providerTimeoutMs = parsePositiveInteger(process.env.TRANSLATION_AGENT_TIMEOUT_MS, DEFAULT_PROVIDER_TIMEOUT_MS)
  const fileTimeoutMs = parsePositiveInteger(process.env.TRANSLATION_FILE_TIMEOUT_MS, DEFAULT_FILE_TIMEOUT_MS)
  const fileRetries = parseNonNegativeInteger(process.env.TRANSLATION_FILE_RETRIES ?? DEFAULT_FILE_RETRIES, DEFAULT_FILE_RETRIES)
  const concurrency = parsePositiveInteger(process.env.TRANSLATION_CONCURRENCY, 4)
  const checkpointFiles = parsePositiveInteger(process.env.TRANSLATION_CHECKPOINT_FILES, 10)
  const checkpointIntervalMs = parsePositiveInteger(process.env.TRANSLATION_CHECKPOINT_INTERVAL_MS, 300000)
  const softDeadlineMs = parsePositiveInteger(process.env.TRANSLATION_SOFT_DEADLINE_MS, 18000000)
  const chunkLimits = loadChunkLimits()
  const allowPartial = String(process.env.TRANSLATION_ALLOW_PARTIAL || '').toLowerCase() === 'true'
  const manifest = validateTranslationManifest(JSON.parse(fs.readFileSync(path.join(siteDir, manifestPath), 'utf8')))
  const callModel = await createProviderCall(loadAgentConfigsFromEnv(), {
    maxRetries: maxProviderRetries,
    timeoutMs: providerTimeoutMs,
  })
  const coordinator = createProgressCoordinator({
    siteDir,
    manifest,
    reportPath,
    checkpointFiles,
    checkpointIntervalMs,
    onCheckpoint: metadata => console.log(`[translation-agent] checkpoint translated=${metadata.translated} failed=${metadata.failed} remaining=${metadata.remaining}`),
  })
  const startedAt = Date.now()
  let stopRequested = false
  const requestStop = signal => {
    stopRequested = true
    console.warn(`[translation-agent] received ${signal}; stopping new file assignments after active workers finish`)
  }
  const onSigint = () => requestStop('SIGINT')
  const onSigterm = () => requestStop('SIGTERM')
  process.once('SIGINT', onSigint)
  process.once('SIGTERM', onSigterm)

  console.log(`[translation-agent] workers=${concurrency} manifest=${manifest.items.length} softDeadlineMs=${softDeadlineMs}`)
  try {
    await runWorkerPool(manifest.items, {
      concurrency,
      shouldStopAssigning: () => stopRequested || Date.now() - startedAt >= softDeadlineMs,
      processItem: async item => {
        console.log(`[translation-agent] ${item.sourcePath}`)
        const targetItem = {...item, target: manifest.target}
        const result = await processItemWithRetry(targetItem, {
          maxRetries: fileRetries,
          log: console,
          processItem: () => withTimeout(
            processManifestItem({
              siteDir,
              item: targetItem,
              callModel,
              maxReviewRounds,
              chunkTargetChars: chunkLimits.targetChars,
              chunkMaxChars: chunkLimits.maxChars,
            }),
            fileTimeoutMs,
            `Timed out translating ${item.sourcePath} after ${fileTimeoutMs}ms`,
          ),
        })
        if (result.status !== 'translated') console.error(`[translation-agent] failed ${item.sourcePath}: ${summarizeFailedResult(result)}`)
        return result
      },
      onResult: coordinator.record,
    })
  } finally {
    process.removeListener('SIGINT', onSigint)
    process.removeListener('SIGTERM', onSigterm)
    await coordinator.checkpoint(true)
  }

  const results = coordinator.results.filter(Boolean)
  const failed = results.filter(result => result.status !== 'translated')
  const translatedCount = results.length - failed.length
  const remainingCount = manifest.items.length - results.length
  console.log(`[translation-agent] translated=${translatedCount} failed=${failed.length} remaining=${remainingCount}`)
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `translated_count=${translatedCount}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed_count=${failed.length}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `remaining_count=${remainingCount}\n`)
  }
  if ((failed.length && !allowPartial) || (remainingCount > 0 && translatedCount === 0)) process.exit(1)
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
  createProgressCoordinator,
  isRetryableProviderError,
  loadChunkLimits,
  normalizeBaseUrl,
  parseReview,
  parsePositiveInteger,
  parseNonNegativeInteger,
  promptNamesFor,
  processItemWithRetry,
  processManifestItem,
  protectEsmStatements,
  runWorkerPool,
  restoreBoundaryWhitespace,
  restoreEsmStatements,
  restoreProtectedEsm,
  stabilizeBareUrlFormatting,
  stripCodeFence,
  validateTranslationManifest,
  validateTranslatedContent,
  withTimeout,
}
