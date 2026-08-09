'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const { loadTypeScript } = require('../lib/load-typescript')
const { applyMdxPatches, validateMdxStructure } = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const { chunkDocument, DEFAULT_MAX_CHARS, DEFAULT_TARGET_CHARS } = require('./chunker')
const {formatLocaleContract, loadLocaleContract, validateLocaleContractDraft} = require('./localeContract')
const {protectTranslationInput, reprotectTranslationInput, restoreProtectedContent, validateProtectedContent} = require('./protectedContent')
const {REVIEW_RESPONSE_JSON_SCHEMA, parseAndValidateReviewEvidence} = require('./reviewEvidence')
const {
  bindSemanticReviewEvidence,
  collectSemanticUnits,
  deterministicSemanticIssues,
  patchSemanticUnits,
  protectSemanticUnits,
  reprotectSemanticUnits,
  restoreSemanticUnitResponse,
} = require('./semanticUnits')
const { readCache, writeCache, writeJsonAtomic } = require('./manifest')
const { assembleRestDocument, loadPrompt, parseRestDocument, promptNamesFor, translateRestSpecs } = require('./restSpecLocalization')
const {discoverRecoveryArtifacts, promptContractSha256, restoreRecoveryFiles} = require('./recovery-artifact')
const {classifyFailure, failureRecord} = require('./failureClassification')
const {MAX_PARTIAL_ARTIFACT_BYTES, loadAnalysisChunkResume, serializeCompletedChunkCheckpoints} = require('./chunkRecovery')
const {validateRecoveryCandidate} = require('./recoveryValidation')
const { resolveTranslationTarget } = loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts')
const { assertSafeRepositoryRelativePath } = loadTypeScript('../../packages/docs-tooling/src/validation/ownership.ts')
const {
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
} = loadTypeScript('../../packages/docs-tooling/src/reference/translationManifest.ts')
const { defaultReferenceManualForPath } = loadTypeScript('../../packages/docs-tooling/src/cli.ts')

const DEFAULT_MANIFEST = 'tmp/translation-manifest.json'
const DEFAULT_PROVIDER_RETRIES = 3
const DEFAULT_FILE_RETRIES = 1
const DEFAULT_PROVIDER_TIMEOUT_MS = 300000
const DEFAULT_FILE_TIMEOUT_MS = 900000
const REFERENCE_LANDING_SOURCE_ROOT = 'content/en/reference/'
const REFERENCE_LANDING_PROSE_SAFETY_FACTOR = 1.05

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
    `- Validator minimum meaningful prose: ${contract.minimumProseCharacters} units after front matter, code fences, imports, and standalone JSX tags are excluded. Han characters count as 2.5 meaningful prose units; other Unicode letters or digits count as 1.`,
    `- Aim for at least ${contract.targetProseCharacters} meaningful prose units (5% safety margin) without repetitive filler.`,
    '- Preserve all source facts and structure. Natural connective wording is allowed, but do not add source facts or repetitive filler solely to meet the threshold.',
    '- Do not expand headings or move paragraph details into headings to meet prose targets.',
    '- The reviewer must return pass=false if the translated draft does not satisfy this contract.',
    '',
  ].join('\n')
}

function sleep(ms, signal) {
  if (!signal) return new Promise(resolve => setTimeout(resolve, ms))
  if (signal.aborted) return Promise.reject(signal.reason)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', onAbort, {once: true})
  })
}

function categorizedError(message, failureCategory, details = {}) {
  const error = new Error(message)
  error.failureCategory = failureCategory
  Object.assign(error, details)
  return error
}

function structuredErrorDetails(error) {
  const detail = {}
  for (const key of ['name', 'status', 'code']) {
    if (typeof error?.[key] === 'string') detail[key] = error[key].slice(0, 200)
    else if (Number.isFinite(error?.[key])) detail[key] = error[key]
  }
  if (error?.cause && typeof error.cause === 'object') {
    const cause = {}
    for (const key of ['name', 'status', 'code', 'failureCategory']) {
      if (typeof error.cause[key] === 'string') cause[key] = error.cause[key].slice(0, 200)
      else if (Number.isFinite(error.cause[key])) cause[key] = error.cause[key]
    }
    if (Object.keys(cause).length) detail.cause = cause
  }
  return Object.keys(detail).length ? detail : undefined
}

function stripInternalRecoveryFields(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const {recoveryChunkCheckpoints: _internal, ...publicValue} = value
  return publicValue
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

const TRANSIENT_PROVIDER_HTTP_STATUSES = new Set([409, 425, 429, 500, 502, 503, 504])

function isRetryableProviderError(error) {
  const message = String(error?.message || error)
  const status = Number(error?.status ?? error?.statusCode ?? error?.cause?.status)
  if (Number.isInteger(status) && status >= 400) return status === 408 || TRANSIENT_PROVIDER_HTTP_STATUSES.has(status)
  const code = String(error?.code || error?.cause?.code || '')
  if (code === 'PROVIDER_HTTP_ERROR') return false
  if (['PROVIDER_TIMEOUT', 'PROVIDER_TRANSPORT', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(code)) return true
  const category = String(error?.failureCategory || error?.cause?.failureCategory || '')
  if (category) return ['provider_timeout', 'provider_transport'].includes(category)
  return /\b(408|409|425|429|500|502|503|504)\b/.test(message) ||
    error?.name === 'AbortError' ||
    /aborted|connection error|fetch failed|network|timeout|timed out|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message)
}

async function createProviderCall(agentConfigs, options = {}) {
  const maxRetries = Number.isFinite(options.maxRetries) ? options.maxRetries : DEFAULT_PROVIDER_RETRIES
  const retryDelayMs = Number.isFinite(options.retryDelayMs) ? options.retryDelayMs : 1000
  const timeoutMs = parsePositiveInteger(options.timeoutMs, DEFAULT_PROVIDER_TIMEOUT_MS)

  return async function callModel({ agent, messages, signal: externalSignal }) {
    const config = agentConfigs[agent]
    if (!config?.baseUrl || !config?.apiKey || !config?.model) {
      throw new Error(`Missing provider config for ${agent} agent`)
    }

    let lastError
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (externalSignal?.aborted) throw externalSignal.reason
      const controller = new AbortController()
      let providerTimedOut = false
      const providerTimeout = categorizedError(`${agent} agent timed out after ${timeoutMs}ms`, 'provider_timeout', {code: 'PROVIDER_TIMEOUT', timeoutMs})
      const timeout = setTimeout(() => {
        providerTimedOut = true
        controller.abort(providerTimeout)
      }, timeoutMs)
      const onExternalAbort = () => controller.abort(externalSignal.reason)
      externalSignal?.addEventListener('abort', onExternalAbort, {once: true})
      try {
        const requestBody = {
          model: config.model,
          messages,
          temperature: agent === 'review' ? 0 : 0.1,
        }
        if (agent === 'review' && config.structuredOutput === true) {
          requestBody.response_format = {
            type: 'json_schema',
            json_schema: REVIEW_RESPONSE_JSON_SCHEMA,
          }
        }
        const res = await fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        })
        const data = await res.json().catch(() => ({}))
        const content = data?.choices?.[0]?.message?.content
        if (!res.ok) {
          const error = new Error(`${agent} agent failed with HTTP ${res.status}: ${JSON.stringify(data).slice(0, 500)}`)
          error.status = res.status
          const retryableTransport = TRANSIENT_PROVIDER_HTTP_STATUSES.has(res.status)
          error.failureCategory = res.status === 408 ? 'provider_timeout' : retryableTransport ? 'provider_transport' : 'unknown'
          error.code = res.status === 408 ? 'PROVIDER_TIMEOUT' : retryableTransport ? 'PROVIDER_TRANSPORT' : 'PROVIDER_HTTP_ERROR'
          throw error
        }
        if (!content) {
          const error = new Error(`${agent} agent returned no content with HTTP ${res.status}: ${JSON.stringify(data).slice(0, 500)}`)
          error.status = res.status
          error.failureCategory = 'provider_transport'
          error.code = 'PROVIDER_TRANSPORT'
          throw error
        }
        return content.trim()
      } catch (error) {
        lastError = externalSignal?.aborted
          ? externalSignal.reason
          : providerTimedOut
            ? providerTimeout
            : error
        if (!lastError.failureCategory) lastError.failureCategory = classifyFailure(lastError)
        if (externalSignal?.aborted || attempt >= maxRetries || !isRetryableProviderError(lastError)) break
        const waitMs = retryDelayMs * (2 ** attempt)
        console.warn(`[translation-agent] ${agent} call failed; retrying in ${waitMs}ms (${attempt + 1}/${maxRetries}): ${lastError.message}`)
        await sleep(waitMs, externalSignal)
      } finally {
        clearTimeout(timeout)
        externalSignal?.removeEventListener('abort', onExternalAbort)
      }
    }
    lastError.failureCategory = classifyFailure(lastError)
    throw lastError
  }
}

async function withTimeout(operation, timeoutMs, message, details = {}) {
  const controller = new AbortController()
  const timeoutError = categorizedError(message, 'provider_timeout', {code: details.code || 'CHUNK_TIMEOUT', timeoutMs})
  const promise = typeof operation === 'function' ? Promise.resolve().then(() => operation(controller.signal)) : Promise.resolve(operation)
  let timedOut = false
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          timedOut = true
          controller.abort(timeoutError)
          reject(timeoutError)
        }, timeoutMs)
      }),
    ])
  } catch (error) {
    if (!timedOut) throw error
    await promise.catch(() => {})
    throw timeoutError
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

function validatedReviewRetryFeedback(result) {
  if (!Array.isArray(result?.review?.issues)) return null
  const issues = result.review.issues.slice(0, 5).flatMap(issue => {
    if (!issue || typeof issue !== 'object') return []
    const fields = ['severity', 'type', 'location', 'source_quote', 'draft_quote']
    if (fields.some(field => typeof issue[field] !== 'string' || !issue[field])) return []
    return [Object.fromEntries(fields.map(field => [field, issue[field].slice(0, 240)]))]
  })
  return issues.length ? JSON.stringify({kind: 'validated_review_issues', issues}) : null
}

function protectedContentRetryFeedback(failure) {
  const evidence = failure.slice(0, 1000)
  if (!/Unexpected protected inline_code/i.test(failure)) return evidence
  return `${evidence}\nPlain code-like tokens must remain plain text. Never add backticks around text that was not inline code in the supplied semantic unit.`
}

function structuredResponseRetryFeedback(failure) {
  const evidence = failure.slice(0, 1000)
  return `${evidence}\nReturn strict JSON. Escape all control characters inside JSON string values; never emit raw newlines or tabs inside a string.`
}

async function processItemWithRetry(item, options) {
  const maxRetries = parseNonNegativeInteger(options.maxRetries, DEFAULT_FILE_RETRIES)
  const failures = []
  let retryFeedback = null
  const initialChunkCheckpoints = options.initialChunkCheckpoints || []
  if (!Array.isArray(initialChunkCheckpoints)) throw new Error('Initial chunk checkpoints must be an array')
  const chunkCheckpoint = new Map(initialChunkCheckpoints.map((checkpoint, position) => {
    if (checkpoint?.index !== position || checkpoint?.review?.pass !== true || typeof checkpoint?.translatedContent !== 'string') {
      throw new Error('Initial chunk checkpoints must be a reviewed contiguous prefix')
    }
    return [checkpoint.index, checkpoint]
  }))

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let result
    try {
      const executeAttempt = signal => options.processItem(item, attempt, retryFeedback, {
        chunkCheckpoint,
        onChunkCompleted: checkpoint => {
          if (signal?.aborted) throw signal.reason
          chunkCheckpoint.set(checkpoint.index, checkpoint)
        },
        signal,
      })
      result = options.fileTimeoutMs > 0
        ? await withTimeout(
          executeAttempt,
          options.fileTimeoutMs,
          `Timed out translating ${item.sourcePath} after ${options.fileTimeoutMs}ms`,
          {code: 'FILE_TIMEOUT'},
        )
        : await executeAttempt(undefined)
    } catch (error) {
      result = {
        ...stripInternalRecoveryFields(item),
        status: 'failed',
        error: String(error?.message || error),
        failureCategory: classifyFailure(error),
        ...(structuredErrorDetails(error) ? {errorDetails: structuredErrorDetails(error)} : {}),
      }
    }

    if (result.status === 'translated') {
      const publicResult = stripInternalRecoveryFields(result)
      return failures.length ? { ...publicResult, attempts: attempt + 1, retryFailures: failures } : publicResult
    }

    const failure = summarizeFailedResult(result)
    const record = failureRecord({attempt: attempt + 1, failure: result})
    failures.push(record)
    retryFeedback = /Protected (?:marker|content)/i.test(failure)
      ? protectedContentRetryFeedback(failure)
      : /response must be valid JSON/i.test(failure)
        ? structuredResponseRetryFeedback(failure)
      : validatedReviewRetryFeedback(result)
    const retryForbidden = result?.errorDetails?.code === 'CORRECTION_PROTECTED_MARKER_VIOLATION'
    if (attempt < maxRetries && !retryForbidden) {
      options.log?.warn?.(`[translation-agent] retrying ${item.sourcePath} after failed attempt ${attempt + 1}/${maxRetries + 1}: ${failures.at(-1).error}`)
    } else {
      const chunkCheckpoints = serializeCompletedChunkCheckpoints(chunkCheckpoint)
      return {
        ...stripInternalRecoveryFields(result),
        failureCategory: record.category,
        attempts: attempt + 1,
        retryFailures: failures,
        ...(chunkCheckpoints ? {chunkCheckpoints} : {}),
      }
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

function loadSystemPrompt(target, promptName) {
  return `${loadPrompt(promptName)}\n\n${formatLocaleContract(loadLocaleContract(target))}`
}

function buildTranslationMessages({ target, sourcePath, sourceContent, sourceDocument, semanticUnits, locale, chunkContext, retryFeedback }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const instruction = chunkContext
    ? 'Translate this consecutive MDX/Markdown section:'
    : 'Translate this complete MDX/Markdown file:'
  const retry = retryFeedback
    ? `\n<retry_feedback>\n${String(retryFeedback).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}\n</retry_feedback>`
    : ''
  const userContent = semanticUnits
    ? `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}${instruction}\n</translation_context>${retry}\n\n<document_context>\n${sourceDocument}\n</document_context>\n\n<semantic_units>\n${JSON.stringify(semanticUnits, null, 2)}\n</semantic_units>`
    : `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}${instruction}\n</translation_context>${retry}\n\n<source>\n${sourceContent}</source>`
  return [
    { role: 'system', content: loadSystemPrompt(target, promptNamesFor(target).translation) },
    {
      role: 'user',
      content: userContent,
    },
  ]
}

function markerFreeDocumentContext(content) {
  return String(content).replace(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->(?:\r?\n)?/g, '')
}

function markerFreeCorrectionReview(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/g, '[protected content]')
      .replaceAll('ZDOC-PROTECTED', 'protected content')
  }
  if (Array.isArray(value)) return value.map(markerFreeCorrectionReview)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, markerFreeCorrectionReview(child)]))
  }
  return value
}

function buildReviewMessages({ target, sourcePath, sourceContent, translatedContent, sourceDocument, draftDocument, sourceUnits, draftUnits, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const userContent = sourceUnits && draftUnits
    ? `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source_document>\n${sourceDocument}\n</source_document>\n\n<draft_document>\n${draftDocument}\n</draft_document>\n\n<source_units>\n${JSON.stringify(sourceUnits, null, 2)}\n</source_units>\n\n<draft_units>\n${JSON.stringify(draftUnits, null, 2)}\n</draft_units>`
    : `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source>\n${sourceContent}</source>\n\n<draft>\n${translatedContent}</draft>`
  return [
    { role: 'system', content: loadSystemPrompt(target, promptNamesFor(target).review) },
    {
      role: 'user',
      content: userContent,
    },
  ]
}

function correctionPromptFor(target) {
  return loadSystemPrompt(target, promptNamesFor(target).correction)
}

function buildCorrectionMessages({ target, sourcePath, sourceContent, translatedContent, sourceDocument, draftDocument, authorizedUnits, review, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const safeReview = markerFreeCorrectionReview(review)
  const userContent = authorizedUnits
    ? `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source_document>\n${sourceDocument}\n</source_document>\n\n<draft_document>\n${draftDocument}\n</draft_document>\n\n<authorized_units>\n${JSON.stringify(authorizedUnits, null, 2)}\n</authorized_units>\n\n<review_json>\n${JSON.stringify(safeReview, null, 2)}\n</review_json>`
    : `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source>\n${sourceContent}</source>\n\n<draft>\n${translatedContent}</draft>\n\n<review_json>\n${JSON.stringify(safeReview, null, 2)}\n</review_json>`
  return [
    {
      role: 'system',
      content: correctionPromptFor(target),
    },
    {
      role: 'user',
      content: userContent,
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

async function translateAndReviewUnit({
  target,
  sourcePath,
  sourceContent,
  locale,
  callModel,
  maxReviewRounds,
  chunkContext,
  retryFeedback,
  signal,
}) {
  const localeContract = loadLocaleContract(target)
  const idPrefix = chunkContext ? `chunk.${String(chunkContext.index + 1).padStart(4, '0')}` : 'document'
  const units = await collectSemanticUnits(sourceContent, {idPrefix})
  if (!units.length) return {translatedContent: sourceContent, review: {pass: true, issues: []}, semanticUnits: 0}
  const protectedSource = protectTranslationInput(sourceContent)
  const sourceUnits = protectSemanticUnits(units)
  const sourceUnitPayload = sourceUnits.map(unit => ({id: unit.id, kind: unit.kind, text: unit.protection.content}))
  const initialResponse = await callModel({
    agent: 'translation',
    signal,
    messages: buildTranslationMessages({
      target,
      sourcePath,
      sourceContent: protectedSource.content,
      sourceDocument: markerFreeDocumentContext(protectedSource.content),
      semanticUnits: sourceUnitPayload,
      locale,
      chunkContext,
      retryFeedback,
    }),
  })
  let currentUnits = restoreSemanticUnitResponse(initialResponse, {field: 'translations', protectedUnits: sourceUnits, localeContract})
  let translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  let protectedErrors = validateProtectedContent(sourceContent, translatedContent, {sourcePath})
  if (protectedErrors.length) throw categorizedError(protectedErrors.join('; '), 'protected_content_failed', {code: 'PROTECTED_CONTENT_FAILED'})

  let review = { pass: false, issues: [] }
  for (let round = 0; round <= maxReviewRounds; round++) {
    const draftUnits = reprotectSemanticUnits(sourceUnits, currentUnits)
    const draftUnitPayload = draftUnits.map(unit => ({id: unit.id, kind: unit.kind, text: unit.protection.content}))
    const protectedDraftDocument = reprotectTranslationInput(translatedContent, protectedSource.manifest)
    const sourceUnitContent = JSON.stringify(sourceUnitPayload)
    const draftUnitContent = JSON.stringify(draftUnitPayload)
    const evidence = bindSemanticReviewEvidence(parseAndValidateReviewEvidence(await callModel({
      agent: 'review',
      signal,
      messages: buildReviewMessages({
        target,
        sourcePath,
        sourceContent: protectedSource.content,
        translatedContent: protectedDraftDocument.content,
        sourceDocument: protectedSource.content,
        draftDocument: protectedDraftDocument.content,
        sourceUnits: sourceUnitPayload,
        draftUnits: draftUnitPayload,
        locale,
        chunkContext,
      }),
    }), {
      sourceContent: sourceUnitContent,
      draftContent: draftUnitContent,
      localeContract,
    }), sourceUnits, draftUnits)
    const deterministic = deterministicSemanticIssues(sourceUnits, draftUnits, localeContract)
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
    review = {
      pass: !evidence.fatal && issues.length === 0 && evidence.contractConflicts.length === 0,
      issues,
      unsupportedIssues: evidence.unsupportedIssues,
      contractConflicts: evidence.contractConflicts,
      localeContractIssues: deterministic.issues,
      reviewerPass: evidence.reviewerPass,
      error: evidence.error,
    }
    if (review.pass || round === maxReviewRounds) break
    if (evidence.fatal || issues.length === 0) break
    const authorizedIds = [...new Set(issueUnits.map(item => item.unitId))]
    const authorizedDraftUnits = draftUnits.filter(unit => authorizedIds.includes(unit.id))
    const authorizedPayload = authorizedDraftUnits.map(unit => ({
      id: unit.id,
      source: sourceUnits.find(sourceUnit => sourceUnit.id === unit.id).protection.content,
      draft: unit.protection.content,
    }))
    const correctedResponse = await callModel({
      agent: 'correction',
      signal,
      messages: buildCorrectionMessages({
        target,
        sourcePath,
        sourceContent: protectedSource.content,
        translatedContent: protectedDraftDocument.content,
        sourceDocument: markerFreeDocumentContext(protectedSource.content),
        draftDocument: markerFreeDocumentContext(protectedDraftDocument.content),
        authorizedUnits: authorizedPayload,
        review: {pass: false, issues},
        locale,
        chunkContext,
      }),
    })
    let correctedUnits
    try {
      correctedUnits = restoreSemanticUnitResponse(correctedResponse, {field: 'corrections', protectedUnits: authorizedDraftUnits, localeContract})
    } catch (error) {
      if (error?.failureCategory === 'protected_content_failed' && /protected marker/i.test(String(error.message || error))) {
        throw categorizedError(
          `Correction protected marker violation: ${String(error.message || error)}`,
          'protected_content_failed',
          {code: 'CORRECTION_PROTECTED_MARKER_VIOLATION', cause: error},
        )
      }
      throw error
    }
    const correctedById = new Map(correctedUnits.map(unit => [unit.id, unit.translation]))
    currentUnits = currentUnits.map(unit => correctedById.has(unit.id) ? {...unit, translation: correctedById.get(unit.id)} : unit)
    translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
    protectedErrors = validateProtectedContent(sourceContent, translatedContent, {sourcePath})
    if (protectedErrors.length) throw categorizedError(protectedErrors.join('; '), 'protected_content_failed', {code: 'PROTECTED_CONTENT_FAILED'})
  }
  return { translatedContent, review, semanticUnits: units.length }
}

function failedReviewResult(item, review, details = {}) {
  return {
    ...item,
    status: 'failed',
    review,
    failureCategory: classifyFailure({review}),
    validationErrors: [],
    ...details,
  }
}

async function processManifestItem({
  siteDir,
  item,
  callModel,
  maxReviewRounds = 2,
  chunkTargetChars = DEFAULT_TARGET_CHARS,
  chunkMaxChars = DEFAULT_MAX_CHARS,
  chunkCheckpoint = new Map(),
  onChunkCompleted = null,
  validate = validateTranslatedContent,
  retryFeedback = null,
  signal,
}) {
  if (item.sourcePath.includes('#')) throw new Error(`Translation source path must be repository-relative: ${item.sourcePath}`)
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
      retryFeedback,
      signal,
    })
    if (!shell.review.pass) return failedReviewResult(item, shell.review)
    const specResult = await translateRestSpecs({
      sourceSpecs: restDocument.sourceSpecs,
      sourcePath: item.sourcePath,
      target: item.target,
      locale: item.locale,
      callModel,
      maxReviewRounds,
      retryFeedback,
      signal,
    })
    if (!specResult.review.pass) {
      return failedReviewResult(item, specResult.review, {
        restSpecEntries: specResult.translatedCount,
      })
    }
    const translatedContent = stabilizeBareUrlFormatting(assembleRestDocument({
      translatedPrefix: shell.translatedContent,
      localizedSpecs: specResult.localized,
      suffix: restDocument.suffix,
      locale: item.locale,
    }))
    signal?.throwIfAborted()
    const validationErrors = await validate(translatedContent)
    signal?.throwIfAborted()
    if (validationErrors.length) return { ...item, status: 'failed', review: shell.review, validationErrors, restSpecEntries: specResult.translatedCount }
    fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
    fs.writeFileSync(absTargetPath, translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`, 'utf8')
    return {
      ...item,
      status: 'translated',
      review: shell.review,
      restSpecReview: specResult.review,
      validationErrors: [],
      chunks: { total: 1 },
      restSpecEntries: specResult.translatedCount,
    }
  }
  const chunks = chunkDocument(sourceContent, { targetChars: chunkTargetChars, maxChars: chunkMaxChars })
  const documentTitle = extractDocumentTitle(sourceContent)
  const translatedChunks = []
  let reusedChunks = 0
  let previousTranslatedHeading = null
  let lastReview = { pass: true, issues: [] }

  for (const chunk of chunks) {
    signal?.throwIfAborted()
    const chunkContext = chunks.length > 1
      ? {
          index: chunk.index,
          total: chunks.length,
          documentTitle,
          previousTranslatedHeading,
        }
      : null
    const sourceHash = crypto.createHash('sha256').update(chunk.source).digest('hex')
    const cached = chunkCheckpoint.get(chunk.index)
    let unit
    if (cached?.sourceHash === sourceHash && cached?.review?.pass === true && typeof cached.translatedContent === 'string') {
      unit = cached
      reusedChunks += 1
    } else {
      unit = await translateAndReviewUnit({
        target: item.target,
        sourcePath: item.sourcePath,
        sourceContent: chunk.source,
        locale: item.locale,
        callModel,
        maxReviewRounds,
        chunkContext,
        retryFeedback,
        signal,
      })
    }
    signal?.throwIfAborted()
    lastReview = unit.review
    if (!unit.review.pass) {
      return failedReviewResult(item, unit.review, {
        chunk: { index: chunk.index, total: chunks.length, start: chunk.start, end: chunk.end },
      })
    }
    translatedChunks.push(unit.translatedContent)
    const checkpoint = Object.freeze({
      index: chunk.index,
      total: chunks.length,
      sourceHash,
      translatedContent: unit.translatedContent,
      review: unit.review,
      semanticUnits: unit.semanticUnits,
    })
    chunkCheckpoint.set(chunk.index, checkpoint)
    await onChunkCompleted?.(checkpoint)
    previousTranslatedHeading = extractFirstHeading(unit.translatedContent) || previousTranslatedHeading
  }

  let translatedContent
  let validationErrors
  try {
    translatedContent = await applyMdxPatches(stabilizeBareUrlFormatting(
      translatedChunks.join(''),
    ), { repairInvalidMdxEsmProse: true })
    signal?.throwIfAborted()
    validationErrors = [...await validate(translatedContent)]
    signal?.throwIfAborted()
  } catch (error) {
    chunkCheckpoint.clear()
    throw error
  }
  if (validationErrors.length) {
    chunkCheckpoint.clear()
    return {
      ...item,
      status: 'failed',
      review: lastReview,
      validationErrors,
      chunks: { total: chunks.length, reused: reusedChunks },
    }
  }

  fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
  fs.writeFileSync(absTargetPath, translatedContent.endsWith('\n') ? translatedContent : `${translatedContent}\n`, 'utf8')
  return {
    ...item,
    status: 'translated',
    review: lastReview,
    validationErrors: [],
    chunks: { total: chunks.length, reused: reusedChunks },
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
  if (!sourcePath.startsWith(`${target.sourceRoot}/`)) return null
  return `${target.targetRoot}/${sourcePath.slice(target.sourceRoot.length + 1)}`
}

function expectedItemType(target, sourcePath) {
  if (target.id === 'zh-CN-reference') return 'reference'
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
    try {
      assertSafeRepositoryRelativePath(item.sourcePath, `${label} source path`)
    } catch {
      throw new Error(`${label} source path must be a safe normalized repository-relative path`)
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
      structuredOutput: String(process.env.REVIEW_AGENT_STRUCTURED_OUTPUT || '').toLowerCase() === 'true',
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
          failureCategory: classifyFailure(error),
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

function partitionRecoveryWork(manifest, restoredResults = [], pendingResults = []) {
  const restoredBySource = new Map(restoredResults.map(result => [result.sourcePath, result]))
  const pendingByIdentity = new Map(pendingResults.map(result => [recoveryEntryIdentity(result), result]))
  const recovered = []
  const pending = []
  manifest.items.forEach((item, index) => {
    const result = restoredBySource.get(item.sourcePath)
    if (result && result.targetPath === item.targetPath && result.sourceHash === item.sourceHash) {
      const {recoveryTargetHash: _targetHash, recoveryTargetSize: _targetSize, ...publicResult} = result
      recovered.push({index, result: publicResult})
    }
    else {
      const pendingResult = pendingByIdentity.get(recoveryEntryIdentity(item))
      pending.push({
        index,
        item: pendingResult?.recoveryChunkCheckpoints
          ? {...item, recoveryChunkCheckpoints: pendingResult.recoveryChunkCheckpoints}
          : item,
      })
    }
  })
  return {recovered, pending}
}

function buildRecoveryIdentity(manifest, siteDir, env = process.env) {
  return {
    locale: manifest.locale,
    group: manifest.group,
    promptContractSha256: promptContractSha256(manifest.target, siteDir),
    model: env.TRANSLATION_AGENT_MODEL,
    sourceSha: manifest.sourceCheckpointSha,
    toolingSha: env.TOOLING_SHA,
  }
}

function exactRecoveryAnalysisKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`${label} keys are invalid`)
}

function recoveryEntryIdentity(value) {
  return `${value.sourcePath}\0${value.targetPath}`
}

function loadRecoveryAnalysis({file, manifest, siteDir, identity, chunkOptions}) {
  let analysis
  try { analysis = JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch (error) { throw new Error(`Recovery analysis JSON is invalid: ${String(error?.message || error)}`) }
  const rootKeys = [
    'schemaVersion', 'kind', 'target', 'locale', 'group', 'sourceCheckpointSha', 'promptContractSha256', 'model',
    'executionToolingSha', 'candidateCount', 'recoveredCount', 'pendingCount', 'rejectedCount', 'fullRetranslation',
    'restored', 'pending', 'rejected',
  ]
  if (analysis.schemaVersion === 2) rootKeys.push('compatibilityMode')
  const chunkRecoveryKeys = ['resumableFileCount', 'recoveredChunkCount', 'rejectedChunkCount', 'rejectedChunks']
  const hasChunkRecovery = chunkRecoveryKeys.some(key => Object.hasOwn(analysis, key))
  if (hasChunkRecovery) rootKeys.push(...chunkRecoveryKeys)
  exactRecoveryAnalysisKeys(analysis, rootKeys, 'Recovery analysis')
  if (![1, 2].includes(analysis.schemaVersion) || analysis.kind !== 'translation-recovery-analysis') throw new Error('Recovery analysis header is invalid')
  if (analysis.schemaVersion === 2 && !['strict', 'revalidated', 'none'].includes(analysis.compatibilityMode)) throw new Error('Recovery analysis compatibility mode is invalid')
  for (const key of ['target', 'locale', 'group', 'sourceCheckpointSha']) {
    if (analysis[key] !== manifest[key]) throw new Error(`Recovery analysis ${key} does not match the current manifest`)
  }
  const expectedIdentity = {
    promptContractSha256: identity.promptContractSha256,
    model: identity.model,
    executionToolingSha: identity.toolingSha,
  }
  for (const [key, value] of Object.entries(expectedIdentity)) {
    if (analysis[key] !== value) throw new Error(`Recovery analysis ${key} does not match current execution identity`)
  }
  for (const [key, arrayKey] of [['candidateCount', null], ['recoveredCount', 'restored'], ['pendingCount', 'pending'], ['rejectedCount', 'rejected']]) {
    if (!Number.isSafeInteger(analysis[key]) || analysis[key] < 0) throw new Error(`Recovery analysis ${key} is invalid`)
    if (arrayKey && (!Array.isArray(analysis[arrayKey]) || analysis[key] !== analysis[arrayKey].length)) throw new Error(`Recovery analysis ${key} does not match ${arrayKey}`)
  }
  if (!Array.isArray(analysis.restored) || !Array.isArray(analysis.pending) || !Array.isArray(analysis.rejected)) throw new Error('Recovery analysis lists are invalid')
  if (hasChunkRecovery) {
    for (const key of ['resumableFileCount', 'recoveredChunkCount', 'rejectedChunkCount']) {
      if (!Number.isSafeInteger(analysis[key]) || analysis[key] < 0) throw new Error(`Recovery analysis ${key} is invalid`)
    }
    if (!Array.isArray(analysis.rejectedChunks) || analysis.rejectedChunkCount !== analysis.rejectedChunks.length) throw new Error('Recovery analysis rejected chunk count is invalid')
  }
  if (analysis.candidateCount !== manifest.items.length || analysis.recoveredCount + analysis.pendingCount !== analysis.candidateCount) {
    throw new Error('Recovery analysis candidate partition does not match the current manifest')
  }
  const manifestByIdentity = new Map(manifest.items.map(item => [recoveryEntryIdentity(item), item]))
  if (manifestByIdentity.size !== manifest.items.length) throw new Error('Current manifest contains duplicate recovery candidates')
  const seen = new Set()
  const restored = []
  for (const record of analysis.restored) {
    const restoredKeys = ['sourcePath', 'targetPath', 'sourceHash', 'targetHash', 'targetSize']
    if (analysis.schemaVersion === 2) restoredKeys.push('compatibility')
    exactRecoveryAnalysisKeys(record, restoredKeys, 'Recovery analysis restored record')
    if (analysis.schemaVersion === 2 && !['strict', 'revalidated'].includes(record.compatibility)) throw new Error('Recovery analysis restored compatibility is invalid')
    const key = recoveryEntryIdentity(record)
    const candidate = manifestByIdentity.get(key)
    if (!candidate || candidate.sourceHash !== record.sourceHash || seen.has(key)) throw new Error('Recovery analysis restored identity does not match the current manifest')
    if (!/^[0-9a-f]{64}$/u.test(record.targetHash || '') || !Number.isSafeInteger(record.targetSize) || record.targetSize < 0) throw new Error('Recovery analysis restored target identity is invalid')
    assertSafeRepositoryRelativePath(record.targetPath, 'Recovery analysis restored target path')
    const target = path.resolve(siteDir, ...record.targetPath.split('/'))
    const root = path.resolve(siteDir)
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error('Recovery analysis restored target escapes the repository')
    const stat = fs.lstatSync(target)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== record.targetSize || crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex') !== record.targetHash) {
      throw new Error('Recovery analysis restored target payload changed after preflight')
    }
    seen.add(key)
    restored.push({
      ...candidate,
      status: 'translated',
      recovered: true,
      ...(analysis.schemaVersion === 2 ? {recoveryCompatibility: record.compatibility} : {}),
    })
  }
  const pending = []
  let recoveredChunkCount = 0
  let resumableFileCount = 0
  let recoveredChunkBytes = 0
  for (const record of analysis.pending) {
    const pendingKeys = ['sourcePath', 'targetPath', 'sourceHash']
    if (Object.hasOwn(record, 'chunkResume')) pendingKeys.push('chunkResume')
    exactRecoveryAnalysisKeys(record, pendingKeys, 'Recovery analysis pending record')
    const key = recoveryEntryIdentity(record)
    const candidate = manifestByIdentity.get(key)
    if (!candidate || candidate.sourceHash !== record.sourceHash || seen.has(key)) throw new Error('Recovery analysis pending identity does not match the current manifest')
    let recoveryChunkCheckpoints
    if (record.chunkResume) {
      const source = path.resolve(siteDir, ...candidate.sourcePath.split('/'))
      const sourceBytes = fs.readFileSync(source)
      if (crypto.createHash('sha256').update(sourceBytes).digest('hex') !== candidate.sourceHash) throw new Error('Recovery analysis pending source payload changed after preflight')
      recoveryChunkCheckpoints = loadAnalysisChunkResume({
        value: record.chunkResume,
        sourceContent: sourceBytes.toString('utf8'),
        chunkOptions,
        currentIdentity: {
          locale: manifest.locale,
          group: manifest.group,
          promptContractSha256: identity.promptContractSha256,
          model: identity.model,
          sourceSha: manifest.sourceCheckpointSha,
          toolingSha: identity.toolingSha,
          mode: record.chunkResume.artifactExecution?.mode,
        },
        revalidate: input => validateRecoveryCandidate({
          ...input,
          sourcePath: candidate.sourcePath,
          targetPath: candidate.targetPath,
          target: manifest.target,
          locale: manifest.locale,
        }),
      })
      recoveredChunkCount += recoveryChunkCheckpoints.length
      resumableFileCount += 1
      recoveredChunkBytes += recoveryChunkCheckpoints.reduce((total, checkpoint) => total + Buffer.byteLength(checkpoint.translatedContent), 0)
      if (recoveredChunkBytes > MAX_PARTIAL_ARTIFACT_BYTES) throw new Error('Recovery analysis aggregate chunk payload is oversized')
    }
    seen.add(key)
    pending.push(recoveryChunkCheckpoints ? {...candidate, recoveryChunkCheckpoints} : candidate)
  }
  if (seen.size !== manifest.items.length) throw new Error('Recovery analysis does not exactly cover the current manifest')
  const pendingIdentities = new Set(analysis.pending.map(recoveryEntryIdentity))
  for (const record of analysis.rejected) {
    exactRecoveryAnalysisKeys(record, ['sourcePath', 'targetPath', 'reason'], 'Recovery analysis rejected record')
    if (!pendingIdentities.has(recoveryEntryIdentity(record)) || typeof record.reason !== 'string' || !record.reason) throw new Error('Recovery analysis rejected identity is invalid')
  }
  if (hasChunkRecovery) {
    if (analysis.recoveredChunkCount !== recoveredChunkCount || analysis.resumableFileCount !== resumableFileCount) throw new Error('Recovery analysis resumable chunk counts do not match pending records')
    for (const record of analysis.rejectedChunks) {
      exactRecoveryAnalysisKeys(record, ['sourcePath', 'targetPath', 'index', 'reason'], 'Recovery analysis rejected chunk record')
      if (!pendingIdentities.has(recoveryEntryIdentity(record)) || !Number.isSafeInteger(record.index) || record.index < 0 || typeof record.reason !== 'string' || !record.reason) {
        throw new Error('Recovery analysis rejected chunk identity is invalid')
      }
    }
  }
  const expectedFullRetranslation = manifest.items.length > 0 && analysis.recoveredCount === 0 && analysis.pendingCount === manifest.items.length && resumableFileCount === 0
  if (analysis.fullRetranslation !== expectedFullRetranslation) throw new Error('Recovery analysis full-retranslation state is invalid')
  return {restored, pending, rejected: analysis.rejected, rejectedChunks: analysis.rejectedChunks || []}
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
  const recoveryDir = args.get('--recovery-dir') || ''
  const recoveryAnalysis = args.get('--recovery-analysis') || ''
  if (recoveryDir && recoveryAnalysis) throw new Error('Use either --recovery-dir or --recovery-analysis, not both')
  const recoveryIdentity = buildRecoveryIdentity(manifest, siteDir)
  const recovery = recoveryAnalysis
    ? loadRecoveryAnalysis({file: path.resolve(siteDir, recoveryAnalysis), manifest, siteDir, identity: recoveryIdentity, chunkOptions: chunkLimits})
    : recoveryDir
      ? restoreRecoveryFiles({
        siteDir,
        candidates: manifest.items,
        artifacts: discoverRecoveryArtifacts(path.resolve(siteDir, recoveryDir)),
        identity: recoveryIdentity,
        chunkOptions: chunkLimits,
      })
      : {restored: [], pending: manifest.items, rejected: []}
  const work = partitionRecoveryWork(manifest, recovery.restored, recovery.pending)
  const callModel = work.pending.length > 0
    ? await createProviderCall(loadAgentConfigsFromEnv(), {
        maxRetries: maxProviderRetries,
        timeoutMs: providerTimeoutMs,
      })
    : null
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

  for (const recovered of work.recovered) await coordinator.record(recovered.result, recovered.index)
  console.log(`[translation-agent] workers=${concurrency} manifest=${manifest.items.length} recovered=${work.recovered.length} pending=${work.pending.length} softDeadlineMs=${softDeadlineMs}`)
  try {
    await runWorkerPool(work.pending, {
      concurrency,
      shouldStopAssigning: () => stopRequested || Date.now() - startedAt >= softDeadlineMs,
      processItem: async entry => {
        const item = entry.item
        console.log(`[translation-agent] ${item.sourcePath}`)
        const targetItem = {...item, target: manifest.target}
        const result = await processItemWithRetry(targetItem, {
          maxRetries: fileRetries,
          log: console,
          initialChunkCheckpoints: item.recoveryChunkCheckpoints,
          fileTimeoutMs,
          processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
              siteDir,
              item: targetItem,
              callModel,
              maxReviewRounds,
              chunkTargetChars: chunkLimits.targetChars,
              chunkMaxChars: chunkLimits.maxChars,
              chunkCheckpoint: retryContext.chunkCheckpoint,
              onChunkCompleted: retryContext.onChunkCompleted,
              signal: retryContext.signal,
              retryFeedback,
            }),
        })
        if (result.status !== 'translated') console.error(`[translation-agent] failed ${item.sourcePath}: ${summarizeFailedResult(result)}`)
        return result
      },
      onResult: (result, pendingIndex) => coordinator.record(result, work.pending[pendingIndex].index),
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
  buildRecoveryIdentity,
  buildReviewMessages,
  buildTranslationMessages,
  createProviderCall,
  createProgressCoordinator,
  isRetryableProviderError,
  loadChunkLimits,
  loadRecoveryAnalysis,
  normalizeBaseUrl,
  parsePositiveInteger,
  parseNonNegativeInteger,
  partitionRecoveryWork,
  promptNamesFor,
  processItemWithRetry,
  processManifestItem,
  runWorkerPool,
  restoreBoundaryWhitespace,
  stabilizeBareUrlFormatting,
  stripCodeFence,
  validateTranslationManifest,
  validateTranslatedContent,
  withTimeout,
}
