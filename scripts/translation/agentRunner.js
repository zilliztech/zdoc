'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const { loadTypeScript } = require('../lib/load-typescript')
const { applyMdxPatches, validateMdxStructure } = require('../../packages/docs-tooling/src/mdx/validate.cjs')
const { chunkDocument, DEFAULT_MAX_CHARS, DEFAULT_TARGET_CHARS } = require('./chunker')
const {loadChunkLimits, parsePositiveInteger} = require('./chunkLimits')
const {formatLocaleContract, loadLocaleContract, validateLocaleContractDraft} = require('./localeContract')
const {protectTranslationInput, reprotectTranslationInput, restoreProtectedContent, validateProtectedContent} = require('./protectedContent')
const {parseAndValidateReviewEvidence, successfulReview} = require('./reviewEvidence')
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
const { assembleRestDocument, loadPrompt, parseRestDocument, promptNamesFor, reviewRestSpecsDraft, translateRestSpecs } = require('./restSpecLocalization')
const {discoverRecoveryArtifacts, promptContractSha256, restoreRecoveryFiles, validateRecoveryReviewReceipt} = require('./recovery-artifact')
const {boundedFailureDetails, classifyFailure, failureRecord} = require('./failureClassification')
const {MAX_PARTIAL_ARTIFACT_BYTES, loadAnalysisChunkResume, serializeCompletedChunkCheckpoints} = require('./chunkRecovery')
const {
  MAX_SEMANTIC_CHECKPOINT_AGGREGATE_BYTES,
  filterUsableSemanticCheckpoints,
  loadAnalysisSemanticResume,
  loadSemanticCheckpoints,
  semanticCheckpointBytes,
  serializeRecoverySemanticCheckpoints,
} = require('./semanticRecovery')
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
const DEFAULT_ADAPTIVE_CALL_LIMIT = 32
const DEFAULT_PROVIDER_RETRY_DELAY_MS = 30000
const DEFAULT_PROVIDER_RETRY_MAX_DELAY_MS = 120000
const DEFAULT_PROVIDER_RETRY_JITTER_RATIO = 0.2
const DEFAULT_FILE_RETRIES = 1
const DEFAULT_PROVIDER_TIMEOUT_MS = 300000
const DEFAULT_FILE_TIMEOUT_MS = 900000
const REFERENCE_LANDING_SOURCE_ROOT = 'content/en/reference/'
const REFERENCE_LANDING_PROSE_SAFETY_FACTOR = 1.05
const SEVERITY_RANK = Object.freeze({ high: 3, medium: 2, low: 1 })
const DETERMINISTIC_ISSUE_TYPES = new Set(['mdx_structure', 'protected_content'])

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
  return boundedFailureDetails(error)
}

function stripInternalRecoveryFields(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const {recoveryChunkCheckpoints: _chunkInternal, recoverySemanticCheckpoints: _semanticInternal, ...publicValue} = value
  return publicValue
}

function parseNonNegativeInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function createProviderRetryBudget(limit = DEFAULT_PROVIDER_RETRIES) {
  if (!Number.isInteger(limit) || limit < 0) throw new Error('Provider retry budget must be a non-negative integer')
  return {limit, consumed: 0, remaining: limit}
}

function validateProviderRetryBudget(budget) {
  if (!budget || !Number.isInteger(budget.limit) || budget.limit < 0 ||
      !Number.isInteger(budget.consumed) || budget.consumed < 0 ||
      !Number.isInteger(budget.remaining) || budget.remaining < 0 ||
      budget.consumed + budget.remaining !== budget.limit) {
    throw new Error('Provider retry budget is invalid')
  }
  return budget
}

function providerRetryBudgetDetails(budget) {
  if (!budget) return {}
  validateProviderRetryBudget(budget)
  return {
    retryBudgetLimit: budget.limit,
    retryBudgetConsumed: budget.consumed,
    retryBudgetRemaining: budget.remaining,
  }
}

function consumeProviderRetryBudget(budget) {
  if (!budget) return true
  validateProviderRetryBudget(budget)
  if (budget.remaining === 0) return false
  budget.remaining -= 1
  budget.consumed += 1
  return true
}

function createAdaptiveCallBudget(limit = DEFAULT_ADAPTIVE_CALL_LIMIT) {
  if (!Number.isInteger(limit) || limit < 0) throw new Error('Adaptive call budget must be a non-negative integer')
  return {limit, reserved: 0, remaining: limit}
}

function validateAdaptiveCallBudget(budget) {
  if (!budget || !Number.isInteger(budget.limit) || budget.limit < 0 ||
      !Number.isInteger(budget.reserved) || budget.reserved < 0 ||
      !Number.isInteger(budget.remaining) || budget.remaining < 0 ||
      budget.reserved + budget.remaining !== budget.limit) {
    throw new Error('Adaptive call budget is invalid')
  }
  return budget
}

function adaptiveCallBudgetDetails(budget) {
  if (!budget) return {}
  validateAdaptiveCallBudget(budget)
  return {
    adaptiveCallLimit: budget.limit,
    adaptiveCallsReserved: budget.reserved,
    adaptiveCallsRemaining: budget.remaining,
  }
}

function reserveAdaptiveCallBudget(budget, count) {
  if (!Number.isInteger(count) || count < 0) throw new Error('Adaptive call budget reservation must be a non-negative integer')
  validateAdaptiveCallBudget(budget)
  if (budget.remaining < count) return false
  budget.remaining -= count
  budget.reserved += count
  return true
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
const INCOMPLETE_STREAM_PATTERN = /(?:stream disconnected before completion:\s*)?stream closed before response\.completed/i
const HARD_PROVIDER_TIMEOUT_PATTERN = /Request timed out after 240(?:\.0)?s|timed out after 240000ms/i

function shouldRecommendAdaptiveSubdivision(error, {agent, adaptivePayload}) {
  if (agent !== 'translation' || adaptivePayload !== true) return false
  const message = String(error?.message || error)
  const status = Number(error?.status ?? error?.statusCode ?? error?.cause?.status)
  const code = String(error?.code || error?.cause?.code || '')
  return (status === 408 && code === 'PROVIDER_TIMEOUT') ||
    HARD_PROVIDER_TIMEOUT_PATTERN.test(message) || INCOMPLETE_STREAM_PATTERN.test(message)
}

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

function calculateProviderRetryDelay(attempt, options = {}) {
  const retryDelayMs = Number.isFinite(options.retryDelayMs) && options.retryDelayMs >= 0
    ? options.retryDelayMs
    : DEFAULT_PROVIDER_RETRY_DELAY_MS
  const retryMaxDelayMs = Number.isFinite(options.retryMaxDelayMs) && options.retryMaxDelayMs >= retryDelayMs
    ? options.retryMaxDelayMs
    : DEFAULT_PROVIDER_RETRY_MAX_DELAY_MS
  const retryJitterRatio = Number.isFinite(options.retryJitterRatio) && options.retryJitterRatio >= 0 && options.retryJitterRatio <= 1
    ? options.retryJitterRatio
    : DEFAULT_PROVIDER_RETRY_JITTER_RATIO
  const random = typeof options.random === 'function' ? options.random : Math.random
  const sample = Math.max(0, Math.min(1, Number(random())))
  const exponentialDelay = Math.min(retryMaxDelayMs, retryDelayMs * (2 ** attempt))
  const jitter = exponentialDelay * retryJitterRatio
  return Math.min(retryMaxDelayMs, Math.max(0, Math.round(exponentialDelay - jitter + (2 * jitter * sample))))
}

async function createProviderCall(agentConfigs, options = {}) {
  const maxRetries = Number.isFinite(options.maxRetries) ? options.maxRetries : DEFAULT_PROVIDER_RETRIES
  const retryOptions = {
    retryDelayMs: options.retryDelayMs,
    retryMaxDelayMs: options.retryMaxDelayMs,
    retryJitterRatio: options.retryJitterRatio,
    random: options.random,
  }
  const timeoutMs = parsePositiveInteger(options.timeoutMs, DEFAULT_PROVIDER_TIMEOUT_MS)

  return async function callModel({ agent, messages, signal: externalSignal, retryBudget = null, retryMode = 'normal', adaptivePayload = false, modelCallDeadline = null }) {
    const config = agentConfigs[agent]
    if (!config?.baseUrl || !config?.apiKey || !config?.model) {
      throw new Error(`Missing provider config for ${agent} agent`)
    }

    if (retryBudget) validateProviderRetryBudget(retryBudget)
    if (!['normal', 'adaptive'].includes(retryMode)) throw new Error('Provider retry mode is invalid')
    const perCallRetries = retryBudget
      ? Math.min(maxRetries, 1)
      : maxRetries
    let lastError
    let providerAttempts = 0
    for (let attempt = 0; attempt <= perCallRetries; attempt++) {
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
        admitModelCall(modelCallDeadline, agent)
        if (attempt > 0 && !consumeProviderRetryBudget(retryBudget)) break
        providerAttempts += 1
        const requestBody = {
          model: config.model,
          messages,
          temperature: 0,
        }
        if (config.thinking) {
          if (config.thinkingStyle === 'qwen') {
            requestBody.enable_thinking = config.thinking === 'enabled'
          } else {
            requestBody.thinking = { type: config.thinking }
          }
        }
        if (agent === 'review' && config.structuredOutput === true) {
          requestBody.response_format = { type: 'json_object' }
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
        const message = data?.choices?.[0]?.message || {}
        let content = message.content
        if (!content && typeof message.reasoning_content === 'string' && message.reasoning_content.trim()) {
          content = message.reasoning_content
        }
        if (!res.ok) {
          const responseBody = JSON.stringify(data).slice(0, 500)
          const incompleteStream = INCOMPLETE_STREAM_PATTERN.test(responseBody)
          const error = new Error(`${agent} agent failed with HTTP ${res.status}: ${responseBody}`)
          error.status = res.status
          const retryableTransport = TRANSIENT_PROVIDER_HTTP_STATUSES.has(res.status)
          error.failureCategory = incompleteStream ? 'provider_transport' : res.status === 408 ? 'provider_timeout' : retryableTransport ? 'provider_transport' : 'unknown'
          error.code = incompleteStream ? 'PROVIDER_TRANSPORT' : res.status === 408 ? 'PROVIDER_TIMEOUT' : retryableTransport ? 'PROVIDER_TRANSPORT' : 'PROVIDER_HTTP_ERROR'
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
        if (shouldRecommendAdaptiveSubdivision(lastError, {agent, adaptivePayload})) {
          lastError.adaptiveSubdivisionRecommended = true
          break
        }
        if (externalSignal?.aborted || attempt >= perCallRetries || !isRetryableProviderError(lastError)) break
        try {
          admitModelCall(modelCallDeadline, agent)
        } catch (deadlineError) {
          lastError = deadlineError
          break
        }
        if (retryBudget) {
          validateProviderRetryBudget(retryBudget)
          if (retryBudget.remaining === 0) break
        }
        const waitMs = calculateProviderRetryDelay(attempt, retryOptions)
        console.warn(`[translation-agent] ${agent} call failed; retrying in ${waitMs}ms (${attempt + 1}/${perCallRetries}): ${lastError.message}`)
        await sleep(waitMs, externalSignal)
      } finally {
        clearTimeout(timeout)
        externalSignal?.removeEventListener('abort', onExternalAbort)
      }
    }
    lastError.failureCategory = classifyFailure(lastError)
    Object.assign(lastError, {providerAttempts}, providerRetryBudgetDetails(retryBudget))
    throw lastError
  }
}

function createModelCallCounter(callModel) {
  if (typeof callModel !== 'function') throw new TypeError('Model call counter requires a callModel function')
  const counts = {translation: 0, reviewer: 0, correction: 0, polish: 0, total: 0}
  return Object.freeze({
    callModel: async request => {
      const key = request?.agent === 'review' ? 'reviewer' : request?.agent
      if (!['translation', 'reviewer', 'correction', 'polish'].includes(key)) {
        throw new Error(`Unsupported model agent for call counting: ${request?.agent || 'missing'}`)
      }
      counts[key] += 1
      counts.total += 1
      return callModel(request)
    },
    snapshot: () => Object.freeze({...counts}),
  })
}

function validateModelCallDeadline(deadline) {
  if (typeof deadline.now !== 'function' || !Number.isFinite(deadline.expiresAt) ||
      !Number.isFinite(deadline.providerCallBudgetMs) || deadline.providerCallBudgetMs <= 0) {
    throw new Error('Model call deadline is invalid')
  }
  return deadline
}

function admitModelCall(deadline, agent) {
  if (!deadline) return
  validateModelCallDeadline(deadline)
  const remainingMs = deadline.expiresAt - deadline.now()
  if (remainingMs < deadline.providerCallBudgetMs) {
    throw categorizedError(
      `Cannot start ${agent || 'model'} provider call with ${Math.max(0, remainingMs)}ms remaining; ${deadline.providerCallBudgetMs}ms is required`,
      'provider_timeout',
      {
        code: 'FILE_DEADLINE_INSUFFICIENT',
        remainingMs: Math.max(0, remainingMs),
        providerCallBudgetMs: deadline.providerCallBudgetMs,
      },
    )
  }
}

function withModelCallDeadline(callModel, deadline) {
  if (!deadline) return callModel
  validateModelCallDeadline(deadline)
  return request => {
    admitModelCall(deadline, request?.agent)
    return callModel({...request, modelCallDeadline: deadline})
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
  if (result?.review?.error) return String(result.review.error)
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

function protectedContentRetryFeedback(result, failure) {
  if (result?.errorDetails?.code === 'DUPLICATE_PROTECTED_MARKER') {
    const details = result.errorDetails
    return JSON.stringify({
      kind: 'protected_marker_error',
      code: details.code,
      semanticUnitId: details.semanticUnitId,
      markerId: details.markerId,
      expectedCount: details.expectedCount,
      actualCount: details.actualCount,
      occurrences: details.occurrences,
      instruction: 'Each supplied protected marker must appear exactly once. Do not duplicate, invent, or delete any protected marker. Plain code-like tokens must remain plain text; never add backticks around text that was not inline code in the supplied semantic unit.',
    })
  }
  const evidence = failure.slice(0, 1000)
  if (!/Unexpected protected inline_code/i.test(failure)) return evidence
  return `${evidence}\nPlain code-like tokens must remain plain text. Never add backticks around text that was not inline code in the supplied semantic unit.`
}

function structuredResponseRetryFeedback(failure) {
  const evidence = failure.slice(0, 1000)
  return `${evidence}\nReturn strict JSON. Escape all control characters inside JSON string values; never emit raw newlines or tabs inside a string.`
}

function semanticResponseRetryFeedback(result) {
  const details = result?.errorDetails || {}
  const expectedCount = Number.isFinite(details.expectedCount) ? details.expectedCount : undefined
  const instruction = expectedCount === undefined
    ? 'Return strict JSON using the requested root field and exact entry schema. Escape control characters inside string values. Include every supplied semantic unit ID exactly once; do not duplicate, invent, or omit IDs.'
    : `Return strict JSON with exactly ${expectedCount} entries. Escape control characters inside string values. Include every supplied semantic unit ID exactly once; do not duplicate, invent, or omit IDs.`
  return JSON.stringify({
    kind: 'semantic_response_error',
    ...Object.fromEntries([
      'code', 'field', 'entryIndex', 'expectedCount', 'actualCount', 'expectedFields', 'actualFields',
      'expectedIds', 'actualIds', 'missingIds', 'unknownIds', 'duplicateIds',
    ].flatMap(key => details[key] === undefined ? [] : [[key, details[key]]])),
    instruction,
  })
}

async function processItemWithRetry(item, options) {
  const maxRetries = parseNonNegativeInteger(options.maxRetries, DEFAULT_FILE_RETRIES)
  const failures = []
  let retryFeedback = null
  const providerRetryBudget = options.providerRetryBudget || (
    Number.isInteger(options.providerRetryLimit) ? createProviderRetryBudget(options.providerRetryLimit) : null
  )
  if (providerRetryBudget) validateProviderRetryBudget(providerRetryBudget)
  const adaptiveCallBudget = options.adaptiveCallBudget || createAdaptiveCallBudget(
    Number.isInteger(options.adaptiveCallLimit) ? options.adaptiveCallLimit : DEFAULT_ADAPTIVE_CALL_LIMIT,
  )
  validateAdaptiveCallBudget(adaptiveCallBudget)
  const semanticCheckpoint = loadSemanticCheckpoints(options.initialSemanticCheckpoints, item)
  const restSpecDraft = options.initialSemanticCheckpoints?.restSpecDraft || null
  const initialChunkCheckpoints = options.initialChunkCheckpoints || []
  if (!Array.isArray(initialChunkCheckpoints)) throw new Error('Initial chunk checkpoints must be an array')
  const chunkCheckpoint = new Map(initialChunkCheckpoints.map((checkpoint, position) => {
    if (checkpoint?.index !== position || checkpoint?.review?.pass !== true || typeof checkpoint?.translatedContent !== 'string') {
      throw new Error('Initial chunk checkpoints must be a reviewed contiguous prefix')
    }
    return [checkpoint.index, checkpoint]
  }))
  const now = typeof options.now === 'function' ? options.now : Date.now
  const providerCallBudgetMs = Number.isFinite(options.providerCallBudgetMs) && options.providerCallBudgetMs > 0
    ? options.providerCallBudgetMs
    : DEFAULT_PROVIDER_TIMEOUT_MS

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let result
    try {
      const modelCallDeadline = options.fileTimeoutMs > 0
        ? Object.freeze({
            expiresAt: now() + options.fileTimeoutMs,
            providerCallBudgetMs,
            now,
          })
        : null
      const executeAttempt = signal => options.processItem(item, attempt, retryFeedback, {
        chunkCheckpoint,
        providerRetryBudget,
        adaptiveCallBudget,
        semanticCheckpoint,
        restSpecDraft,
        onSemanticUnitCompleted: checkpoint => semanticCheckpoint.set(checkpoint.id, checkpoint),
        onChunkCompleted: checkpoint => {
          if (signal?.aborted) throw signal.reason
          chunkCheckpoint.set(checkpoint.index, checkpoint)
        },
        modelCallDeadline,
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
    const retryErrorDetails = boundedFailureDetails(result?.errorDetails)
    const hasActionableRetryDetails = typeof retryErrorDetails?.code === 'string'
    const record = Object.freeze({
      ...failureRecord({attempt: attempt + 1, failure: result}),
      ...(hasActionableRetryDetails ? {errorDetails: retryErrorDetails} : {}),
    })
    failures.push(record)
    const semanticRecoveryEligible = ['provider_timeout', 'provider_transport'].includes(record.category)
    if (!semanticRecoveryEligible) semanticCheckpoint.clear()
    const errorCode = result?.errorDetails?.code
    retryFeedback = result?.failureCategory === 'semantic_response_failed' || String(errorCode || '').startsWith('SEMANTIC_RESPONSE_')
      ? semanticResponseRetryFeedback(result)
      : result?.failureCategory === 'protected_content_failed' || /Protected (?:marker|content)/i.test(failure)
        ? protectedContentRetryFeedback(result, failure)
        : /response must be valid JSON/i.test(failure)
        ? structuredResponseRetryFeedback(failure)
      : validatedReviewRetryFeedback(result)
    const providerFailureWithSharedBudget = providerRetryBudget &&
      ['provider_timeout', 'provider_transport'].includes(record.category)
    const retryForbidden = result?.errorDetails?.code === 'CORRECTION_PROTECTED_MARKER_VIOLATION' || providerFailureWithSharedBudget
    if (attempt < maxRetries && !retryForbidden) {
      options.log?.warn?.(`[translation-agent] retrying ${item.sourcePath} after failed attempt ${attempt + 1}/${maxRetries + 1}: ${failures.at(-1).error}`)
    } else {
      const chunkCheckpoints = serializeCompletedChunkCheckpoints(chunkCheckpoint)
      const semanticCheckpoints = semanticRecoveryEligible
        ? serializeRecoverySemanticCheckpoints(semanticCheckpoint, item, restSpecDraft)
        : null
      return {
        ...stripInternalRecoveryFields(result),
        failureCategory: record.category,
        attempts: attempt + 1,
        retryFailures: failures,
        ...(chunkCheckpoints ? {chunkCheckpoints} : {}),
        ...(semanticCheckpoints ? {semanticCheckpoints} : {}),
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
  // Locale contract is placed first so translate/review/correction share an
  // identical stable prefix, maximizing the provider's prompt-cache hit rate.
  return `${formatLocaleContract(loadLocaleContract(target))}\n\n${loadPrompt(promptName)}`
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

function formatSemanticReviewDocument(units) {
  return units.map(unit => [
    `[${unit.id}] (${unit.kind})`,
    markerFreeDocumentContext(unit.text),
  ].join('\n')).join('\n\n')
}

function buildReviewMessages({ target, sourcePath, sourceContent, translatedContent, sourceDocument, draftDocument, sourceUnits, draftUnits, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const userContent = sourceUnits && draftUnits
    ? `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source_document>\n${formatSemanticReviewDocument(sourceUnits)}\n</source_document>\n\n<draft_document>\n${formatSemanticReviewDocument(draftUnits)}\n</draft_document>\n\n<source_units>\n${JSON.stringify(sourceUnits, null, 2)}\n</source_units>\n\n<draft_units>\n${JSON.stringify(draftUnits, null, 2)}\n</draft_units>`
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

function polishPromptFor(target) {
  return loadSystemPrompt(target, promptNamesFor(target).polish)
}

function buildPolishMessages({ target, sourcePath, sourceUnits, draftUnits, locale, chunkContext }) {
  const context = `${formatReferenceLandingContract(target, sourcePath)}${formatDocumentContext(chunkContext)}`
  const userContent = `<translation_context>\nlocale: ${locale}\nsource_path: ${sourcePath}\n${context}</translation_context>\n\n<source_units>\n${JSON.stringify(sourceUnits, null, 2)}\n</source_units>\n\n<draft_units>\n${JSON.stringify(draftUnits, null, 2)}\n</draft_units>`
  return [
    { role: 'system', content: polishPromptFor(target) },
    { role: 'user', content: userContent },
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

function subdivideSemanticBatch(batch, targetChars, maxChars) {
  if (!Array.isArray(batch) || batch.length < 2) return [batch]
  const groups = []
  let current = []
  let currentChars = 0
  for (const unit of batch) {
    const unitChars = String(unit.text || '').length
    if (current.length && (currentChars >= targetChars || currentChars + unitChars > maxChars)) {
      groups.push(current)
      current = []
      currentChars = 0
    }
    current.push(unit)
    currentChars += unitChars
  }
  if (current.length) groups.push(current)
  if (groups.length === 1) {
    const split = Math.ceil(batch.length / 2)
    return [batch.slice(0, split), batch.slice(split)]
  }
  return groups
}

function batchSemanticReviewPairs(sourceUnits, draftUnits, targetChars, maxChars) {
  const draftById = new Map(draftUnits.map(unit => [unit.id, unit]))
  const pairs = sourceUnits.map(sourceUnit => {
    const draftUnit = draftById.get(sourceUnit.id)
    if (!draftUnit) throw new Error(`Missing draft semantic unit ${sourceUnit.id}`)
    return {sourceUnit, draftUnit, chars: sourceUnit.text.length + draftUnit.text.length}
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

async function translateAndReviewUnit({
  target,
  sourcePath,
  sourceContent,
  locale,
  callModel,
  maxReviewRounds,
  chunkContext,
  retryFeedback,
  providerRetryBudget,
  adaptiveCallBudget,
  semanticCheckpoint,
  onSemanticUnitCompleted,
  adaptiveTargetChars,
  adaptiveMaxChars,
  signal,
}) {
  const localeContract = loadLocaleContract(target)
  const idPrefix = chunkContext ? `chunk.${String(chunkContext.index + 1).padStart(4, '0')}` : 'document'
  const units = await collectSemanticUnits(sourceContent, {idPrefix})
  if (!units.length) return {translatedContent: sourceContent, review: successfulReview(), semanticUnits: 0}
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const protectedSource = protectTranslationInput(sourceContent, protectedOptions)
  const sourceUnits = protectSemanticUnits(units, unit => unit.source, protectedOptions)
  const sourceUnitPayload = sourceUnits.map(unit => ({id: unit.id, kind: unit.kind, text: unit.protection.content}))
  const sourceUnitById = new Map(sourceUnits.map(unit => [unit.id, unit]))
  const usableSemanticCheckpoints = filterUsableSemanticCheckpoints(semanticCheckpoint, sourceUnits, localeContract)
  if (semanticCheckpoint) {
    const currentUnitPrefix = `${idPrefix}.`
    for (const id of semanticCheckpoint.keys()) {
      if (id.startsWith(currentUnitPrefix) && !usableSemanticCheckpoints.has(id)) semanticCheckpoint.delete(id)
    }
    for (const [id, checkpoint] of usableSemanticCheckpoints) semanticCheckpoint.set(id, checkpoint)
  }
  const translateBatch = async (batch, depth = 0, adaptive = false, retryMode = 'normal') => {
    const checkpointed = new Map(batch.flatMap(unit => {
      const checkpoint = usableSemanticCheckpoints.get(unit.id)
      return checkpoint ? [[unit.id, {...unit, translation: checkpoint.translation}]] : []
    }))
    const pendingBatch = batch.filter(unit => !checkpointed.has(unit.id))
    if (!pendingBatch.length) return batch.map(unit => checkpointed.get(unit.id))
    const batchIds = new Set(pendingBatch.map(unit => unit.id))
    const protectedBatch = sourceUnits.filter(unit => batchIds.has(unit.id))
    try {
      const response = await callModel({
        agent: 'translation',
        signal,
        retryBudget: providerRetryBudget,
        retryMode,
        adaptivePayload: pendingBatch.length > 1,
        messages: buildTranslationMessages({
          target,
          sourcePath,
          sourceContent: protectedSource.content,
          sourceDocument: markerFreeDocumentContext(protectedSource.content),
          semanticUnits: pendingBatch,
          locale,
          chunkContext,
          retryFeedback,
        }),
      })
      const translated = restoreSemanticUnitResponse(response, {field: 'translations', protectedUnits: protectedBatch, localeContract})
      for (const unit of translated) {
        const sourceUnit = sourceUnitById.get(unit.id)
        const checkpoint = {id: unit.id, sourceHash: crypto.createHash('sha256').update(sourceUnit.source).digest('hex'), translation: unit.translation}
        usableSemanticCheckpoints.set(unit.id, checkpoint)
        onSemanticUnitCompleted?.(checkpoint)
      }
      const translatedById = new Map(translated.map(unit => [unit.id, unit]))
      return batch.map(unit => checkpointed.get(unit.id) || translatedById.get(unit.id))
    } catch (error) {
      const providerFailure = ['provider_timeout', 'provider_transport'].includes(classifyFailure(error))
      const repeatedProviderFailure = error?.adaptiveSubdivisionRecommended === true || Number(error?.providerAttempts) > 1 || Number(error?.retryBudgetConsumed) > 0
      if (providerFailure && pendingBatch.length > 1 && (adaptive || repeatedProviderFailure)) {
        const targetChars = Math.max(1, Math.floor(adaptiveTargetChars / (2 ** depth)))
        const maxChars = Math.max(targetChars, Math.floor(adaptiveMaxChars / (2 ** depth)))
        const subdivisions = subdivideSemanticBatch(pendingBatch, targetChars, maxChars)
        if (subdivisions.length > 1) {
          if (reserveAdaptiveCallBudget(adaptiveCallBudget, subdivisions.length)) {
            const translated = []
            for (const subdivision of subdivisions) {
              translated.push(...await translateBatch(subdivision, depth + 1, true, 'adaptive'))
            }
            if (translated.length === pendingBatch.length) {
              const translatedById = new Map(translated.map(unit => [unit.id, unit]))
              return batch.map(unit => checkpointed.get(unit.id) || translatedById.get(unit.id))
            }
          }
          Object.assign(error, providerRetryBudgetDetails(providerRetryBudget), adaptiveCallBudgetDetails(adaptiveCallBudget))
        }
      }
      if (providerFailure && (adaptive || repeatedProviderFailure)) {
        Object.assign(error, {
          adaptiveSubdivisionDepth: depth,
          semanticBatchSize: pendingBatch.length,
          adaptiveTargetChars: Math.max(1, Math.floor(adaptiveTargetChars / (2 ** Math.max(0, depth - 1)))),
          adaptiveMaxChars: Math.max(1, Math.floor(adaptiveMaxChars / (2 ** Math.max(0, depth - 1)))),
          ...(pendingBatch.length === 1 ? {semanticUnitId: pendingBatch[0].id} : {}),
          completedSemanticUnitCount: usableSemanticCheckpoints.size,
          pendingSemanticUnitCount: sourceUnitPayload.length - usableSemanticCheckpoints.size,
          completedSemanticUnitIds: [...usableSemanticCheckpoints.keys()].slice(0, 100),
          pendingSemanticUnitIds: sourceUnitPayload.filter(unit => !usableSemanticCheckpoints.has(unit.id)).map(unit => unit.id).slice(0, 100),
        }, providerRetryBudgetDetails(providerRetryBudget), adaptiveCallBudgetDetails(adaptiveCallBudget))
      }
      throw error
    }
  }
  let currentUnits = await translateBatch(sourceUnitPayload)
  let translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
  let protectedErrors = validateProtectedContent(sourceContent, translatedContent, {sourcePath})
  if (protectedErrors.length) throw categorizedError(protectedErrors.join('; '), 'protected_content_failed', {code: 'PROTECTED_CONTENT_FAILED'})

  if (process.env.TRANSLATION_POLISH === 'true') {
    const translationUnits = currentUnits
    const draftUnits = reprotectSemanticUnits(sourceUnits, currentUnits)
    const draftUnitPayload = draftUnits.map(unit => ({id: unit.id, kind: unit.kind, text: unit.protection.content}))
    const polishResponse = await callModel({
      agent: 'polish',
      signal,
      retryBudget: providerRetryBudget,
      messages: buildPolishMessages({
        target,
        sourcePath,
        sourceUnits: sourceUnitPayload,
        draftUnits: draftUnitPayload,
        locale,
        chunkContext,
      }),
    })
    const polishedUnits = restoreSemanticUnitResponse(polishResponse, {field: 'translations', protectedUnits: sourceUnits, localeContract})
    // Revert any unit whose polish broke the locale contract back to the
    // translation version — deterministic detection, no forbidden-term guesswork.
    const polishedDraftUnits = reprotectSemanticUnits(sourceUnits, polishedUnits)
    const polishContractIssues = deterministicSemanticIssues(sourceUnits, polishedDraftUnits, localeContract)
    const revertedIds = new Set(polishContractIssues.issueUnits.map(binding => binding.unitId))
    const translationById = new Map(translationUnits.map(unit => [unit.id, unit]))
    currentUnits = polishedUnits.map(unit => revertedIds.has(unit.id) ? (translationById.get(unit.id) || unit) : unit)
    translatedContent = patchSemanticUnits(sourceContent, units, currentUnits)
    protectedErrors = validateProtectedContent(sourceContent, translatedContent, {sourcePath})
    if (protectedErrors.length) throw categorizedError(protectedErrors.join('; '), 'protected_content_failed', {code: 'PROTECTED_CONTENT_FAILED'})
  }

  let review = { pass: false, issues: [] }
  for (let round = 0; round <= maxReviewRounds; round++) {
    const draftUnits = reprotectSemanticUnits(sourceUnits, currentUnits)
    const draftUnitPayload = draftUnits.map(unit => ({id: unit.id, kind: unit.kind, text: unit.protection.content}))
    const protectedDraftDocument = reprotectTranslationInput(translatedContent, protectedSource.manifest)
    const skipBlindReview = process.env.TRANSLATION_SKIP_BLIND_REVIEW === 'true'
    const reviewBatches = batchSemanticReviewPairs(sourceUnitPayload, draftUnitPayload, adaptiveTargetChars, adaptiveMaxChars)
    const evidenceBatches = []
    if (!skipBlindReview) {
      for (const batch of reviewBatches) {
        const batchSourcePayload = batch.map(pair => pair.sourceUnit)
        const batchDraftPayload = batch.map(pair => pair.draftUnit)
        const batchIds = new Set(batchSourcePayload.map(unit => unit.id))
        evidenceBatches.push(bindSemanticReviewEvidence(parseAndValidateReviewEvidence(await callModel({
          agent: 'review',
          signal,
          retryBudget: providerRetryBudget,
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
        }), {
          sourceContent: JSON.stringify(batchSourcePayload),
          draftContent: JSON.stringify(batchDraftPayload),
          localeContract,
        }), sourceUnits.filter(unit => batchIds.has(unit.id)), draftUnits.filter(unit => batchIds.has(unit.id))))
      }
    }
    const evidence = {
      fatal: evidenceBatches.some(item => item.fatal),
      issueUnits: evidenceBatches.flatMap(item => item.issueUnits),
      unsupportedIssues: evidenceBatches.flatMap(item => item.unsupportedIssues),
      contractConflicts: evidenceBatches.flatMap(item => item.contractConflicts),
      reviewerPass: evidenceBatches.every(item => item.reviewerPass),
      error: evidenceBatches.map(item => item.error).filter(Boolean).join('; ') || null,
    }
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
    for (const issue of deterministic.issues) {
      const key = JSON.stringify(issue)
      if (seen.has(key)) continue
      seen.add(key)
      issues.push(issue)
    }
    const minSeverityRank = SEVERITY_RANK[process.env.TRANSLATION_REVIEW_MIN_SEVERITY] ?? 1
    const isActionable = issue => !DETERMINISTIC_ISSUE_TYPES.has(issue.type) && (SEVERITY_RANK[issue.severity] ?? 1) >= minSeverityRank
    const actionableIssues = issues.filter(isActionable)
    const acceptedIssues = issues.filter(issue => !isActionable(issue))
    review = {
      pass: !evidence.fatal && actionableIssues.length === 0 && evidence.unsupportedIssues.length === 0 &&
        evidence.contractConflicts.length === 0 && evidence.error === null,
      issues,
      acceptedIssues,
      unsupportedIssues: evidence.unsupportedIssues,
      contractConflicts: evidence.contractConflicts,
      localeContractIssues: deterministic.issues,
      reviewerPass: evidence.reviewerPass,
      error: evidence.error,
    }
    if (review.pass || round === maxReviewRounds) break
    if (evidence.fatal || actionableIssues.length === 0) break
    const actionableIssueUnits = issueUnits.filter(item => isActionable(item.issue))
    const authorizedIds = [...new Set(actionableIssueUnits.map(item => item.unitId))]
    if (!authorizedIds.length) break
    const authorizedDraftUnits = draftUnits.filter(unit => authorizedIds.includes(unit.id))
    const authorizedSourcePayload = sourceUnitPayload.filter(unit => authorizedIds.includes(unit.id))
    const authorizedDraftPayload = draftUnitPayload.filter(unit => authorizedIds.includes(unit.id))
    const correctionBatches = batchSemanticReviewPairs(authorizedSourcePayload, authorizedDraftPayload, adaptiveTargetChars, adaptiveMaxChars)
    const correctedUnits = []
    for (const batch of correctionBatches) {
      const batchIds = new Set(batch.map(pair => pair.sourceUnit.id))
      const batchDraftUnits = authorizedDraftUnits.filter(unit => batchIds.has(unit.id))
      const authorizedPayload = batch.map(pair => ({
        id: pair.sourceUnit.id,
        source: pair.sourceUnit.text,
        draft: pair.draftUnit.text,
      }))
      const batchIssues = actionableIssues.filter(issue => [...batchIds].some(id => issue.location === id || issue.location.startsWith(`${id};`)))
      const correctedResponse = await callModel({
        agent: 'correction',
        signal,
        retryBudget: providerRetryBudget,
        messages: buildCorrectionMessages({
          target,
          sourcePath,
          sourceContent: protectedSource.content,
          translatedContent: protectedDraftDocument.content,
          sourceDocument: markerFreeDocumentContext(protectedSource.content),
          draftDocument: markerFreeDocumentContext(protectedDraftDocument.content),
          authorizedUnits: authorizedPayload,
          review: {pass: false, issues: batchIssues},
          locale,
          chunkContext,
        }),
      })
      try {
        correctedUnits.push(...restoreSemanticUnitResponse(correctedResponse, {field: 'corrections', protectedUnits: batchDraftUnits, localeContract}))
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
    ...(review?.error ? {error: String(review.error)} : {}),
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
  providerRetryBudget = null,
  adaptiveCallBudget = createAdaptiveCallBudget(),
  semanticCheckpoint = new Map(),
  restSpecDraft = null,
  onSemanticUnitCompleted = null,
  modelCallDeadline = null,
  signal,
}) {
  validateAdaptiveCallBudget(adaptiveCallBudget)
  callModel = withModelCallDeadline(callModel, modelCallDeadline)
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
      providerRetryBudget,
      adaptiveCallBudget,
      semanticCheckpoint,
      onSemanticUnitCompleted,
      adaptiveTargetChars: Math.max(1, Math.floor(chunkTargetChars / 2)),
      adaptiveMaxChars: Math.max(1, Math.floor(chunkMaxChars / 2)),
      signal,
    })
    if (!shell.review.pass) return failedReviewResult(item, shell.review)
    const specResult = await (restSpecDraft ? reviewRestSpecsDraft : translateRestSpecs)({
      sourceSpecs: restDocument.sourceSpecs,
      ...(restSpecDraft ? {draft: restSpecDraft} : {}),
      sourcePath: item.sourcePath,
      target: item.target,
      locale: item.locale,
      callModel,
      maxReviewRounds,
      retryFeedback,
      providerRetryBudget,
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
        providerRetryBudget,
        adaptiveCallBudget,
        semanticCheckpoint,
        onSemanticUnitCompleted,
        adaptiveTargetChars: Math.max(1, Math.floor(chunkTargetChars / 2)),
        adaptiveMaxChars: Math.max(1, Math.floor(chunkMaxChars / 2)),
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

function translationManifestItemType(targetOrId, sourcePath) {
  const target = typeof targetOrId === 'string' ? resolveTranslationTarget(targetOrId) : targetOrId
  if (target.id === 'zh-CN-reference') return 'reference'
  if (sourcePath.startsWith(`${target.mappings[0].sourceRoot}/`)) return 'guides'
  if (sourcePath.startsWith(`${target.mappings[1].sourceRoot}/`)) return 'byoc'
  if (sourcePath.startsWith(`${target.mappings[2].sourceRoot}/`)) return 'reference'
  return null
}

function validateTranslationManifest(manifest) {
  assertExactKeys(manifest, ['target', 'locale', 'group', 'sourceCheckpointSha', 'generatedAt', 'items', 'reconciliation', 'batch'], 'Translation manifest')
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
  const reconciliation = require('./batches').reconciliationMetadata(manifest)
  let normalizedBatch = manifest.batch
  if (manifest.batch) {
    const reconciliationOwner = manifest.batch.reconciliationOwner
    if (typeof reconciliationOwner !== 'boolean') throw new Error('Translation manifest batch reconciliation ownership is required')
    if (reconciliationOwner && !reconciliation?.operationCount) throw new Error('Translation manifest batch cannot own an empty reconciliation plan')
    normalizedBatch = {...manifest.batch, reconciliationOwner}
  }
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
    const expectedType = translationManifestItemType(target, item.sourcePath)
    if (item.type !== expectedType) throw new Error(`${label} type must be ${expectedType}`)
    if (!/^[0-9a-f]{64}$/.test(item.sourceHash || '')) throw new Error(`${label} sourceHash must be 64 lowercase hex characters`)
    if (!['current_delta', 'missing_target', 'stale_source'].includes(item.reason)) throw new Error(`${label} has an unsupported reason`)
  }
  return {
    ...manifest,
    ...(reconciliation && !manifest.reconciliation ? {reconciliation} : {}),
    ...(normalizedBatch ? {batch: normalizedBatch} : {}),
  }
}

function loadAgentConfigsFromEnv() {
  const thinking = process.env.TRANSLATION_AGENT_THINKING
  return {
    translation: {
      baseUrl: process.env.TRANSLATION_AGENT_BASE_URL,
      apiKey: process.env.TRANSLATION_AGENT_API_KEY,
      model: process.env.TRANSLATION_AGENT_MODEL,
      thinking: thinking || 'disabled',
      thinkingStyle: 'deepseek',
    },
    review: {
      baseUrl: process.env.REVIEW_AGENT_BASE_URL,
      apiKey: process.env.REVIEW_AGENT_API_KEY,
      model: process.env.REVIEW_AGENT_MODEL,
      structuredOutput: String(process.env.REVIEW_AGENT_STRUCTURED_OUTPUT || '').toLowerCase() === 'true',
      thinking: process.env.REVIEW_AGENT_THINKING || 'enabled',
      thinkingStyle: 'deepseek',
    },
    correction: {
      baseUrl: process.env.REVIEW_AGENT_BASE_URL,
      apiKey: process.env.REVIEW_AGENT_API_KEY,
      model: process.env.REVIEW_AGENT_MODEL,
      thinking: process.env.CORRECTION_AGENT_THINKING || thinking || 'disabled',
      thinkingStyle: 'deepseek',
    },
    polish: {
      baseUrl: process.env.POLISH_AGENT_BASE_URL || process.env.TRANSLATION_AGENT_BASE_URL,
      apiKey: process.env.POLISH_AGENT_API_KEY || process.env.TRANSLATION_AGENT_API_KEY,
      model: process.env.POLISH_AGENT_MODEL || 'qwen-max',
      thinking: process.env.POLISH_AGENT_THINKING || 'disabled',
      thinkingStyle: 'qwen',
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
  const hadPendingRecords = Object.hasOwn(progressState.value, 'pendingRecords')
  const hadLanguageExcludedRecords = Object.hasOwn(progressState.value, 'languageExcludedRecords')
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
    ...(hadPendingRecords
      ? {pendingRecords: progressState.value.pendingRecords.filter(existing => existing.sourcePath !== result.sourcePath)}
      : {}),
    ...(hadLanguageExcludedRecords
      ? {languageExcludedRecords: progressState.value.languageExcludedRecords.filter(existing => existing.sourcePath !== result.sourcePath)}
      : {}),
  })
}

function updateFailedReferenceProgressState(siteDir, progressState, result) {
  if (fs.existsSync(path.join(siteDir, result.targetPath))) return
  const sourceManifest = parseReferenceSourceManifest(readJsonIfPresent(
    siteDir,
    'generated/en/manifests/reference.json',
    null,
  ))
  const previous = progressState.value.records.find(record => record.sourcePath === result.sourcePath)
  const sourceRecord = sourceManifest.records.find(record => record.sourcePath === result.sourcePath)
  const pendingRecord = {
    manual: sourceRecord?.manual || previous?.manual || defaultReferenceManualForPath(result.sourcePath),
    sourcePath: result.sourcePath,
    targetPath: result.targetPath,
    sourceCommit: progressState.sourceCheckpointSha,
    sourceHash: sourceRecord?.sourceHash || result.sourceHash,
  }
  const hadLanguageExcludedRecords = Object.hasOwn(progressState.value, 'languageExcludedRecords')
  progressState.value = parseReferenceTranslationManifest({
    ...progressState.value,
    records: progressState.value.records.filter(existing => existing.sourcePath !== result.sourcePath),
    pendingRecords: [
      ...(progressState.value.pendingRecords || []).filter(existing => existing.sourcePath !== result.sourcePath),
      pendingRecord,
    ].sort((left, right) => (
      compareCanonicalText(left.manual, right.manual) ||
      compareCanonicalText(left.sourcePath, right.sourcePath) ||
      compareCanonicalText(left.targetPath, right.targetPath)
    )),
    ...(hadLanguageExcludedRecords
      ? {languageExcludedRecords: progressState.value.languageExcludedRecords.filter(existing => existing.sourcePath !== result.sourcePath)}
      : {}),
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
    else if (progressState.kind === 'reference-manifest') updateFailedReferenceProgressState(
      options.siteDir,
      progressState,
      targetResult,
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
      const recoveryChunkCheckpoints = pendingResult?.recoveryChunkCheckpoints || pendingResult?.recoveryChunkResume?.chunks?.map(entry => ({
        index: entry.index,
        total: pendingResult.recoveryChunkResume.totalChunks,
        sourceHash: entry.sourceHash,
        translatedContent: entry.translatedContent,
        review: {pass: true, issues: []},
        semanticUnits: [],
      }))
      const recoverySemanticCheckpoints = pendingResult?.recoverySemanticCheckpoints || pendingResult?.recoverySemanticResume?.report
      pending.push({
        index,
        item: recoveryChunkCheckpoints || recoverySemanticCheckpoints
          ? {
            ...item,
            ...(recoveryChunkCheckpoints ? {recoveryChunkCheckpoints} : {}),
            ...(recoverySemanticCheckpoints ? {recoverySemanticCheckpoints} : {}),
          }
          : item,
      })
    }
  })
  return {recovered, pending}
}

function buildRecoveryIdentity(manifest, siteDir, env = process.env) {
  return {
    target: manifest.target,
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
  const semanticRecoveryKeys = ['semanticResumableFileCount', 'recoveredSemanticUnitCount']
  const hasSemanticRecovery = semanticRecoveryKeys.some(key => Object.hasOwn(analysis, key))
  if (hasSemanticRecovery) rootKeys.push(...semanticRecoveryKeys)
  if (Object.hasOwn(analysis, 'reconciliation')) rootKeys.push('reconciliation')
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
  if (hasSemanticRecovery) {
    for (const key of semanticRecoveryKeys) {
      if (!Number.isSafeInteger(analysis[key]) || analysis[key] < 0) throw new Error(`Recovery analysis ${key} is invalid`)
    }
  }
  if (analysis.candidateCount !== manifest.items.length || analysis.recoveredCount + analysis.pendingCount !== analysis.candidateCount) {
    throw new Error('Recovery analysis candidate partition does not match the current manifest')
  }
  const manifestByIdentity = new Map(manifest.items.map(item => [recoveryEntryIdentity(item), item]))
  if (manifestByIdentity.size !== manifest.items.length) throw new Error('Current manifest contains duplicate recovery candidates')
  const seen = new Set()
  const restored = []
  for (const record of analysis.restored) {
    const restoredKeys = ['sourcePath', 'targetPath', 'sourceHash', 'targetHash', 'targetSize', 'reviewReceipt']
    if (analysis.schemaVersion === 2) restoredKeys.push('compatibility')
    exactRecoveryAnalysisKeys(record, restoredKeys, 'Recovery analysis restored record')
    if (analysis.schemaVersion === 2 && !['strict', 'revalidated'].includes(record.compatibility)) throw new Error('Recovery analysis restored compatibility is invalid')
    const key = recoveryEntryIdentity(record)
    const candidate = manifestByIdentity.get(key)
    if (!candidate || candidate.sourceHash !== record.sourceHash || seen.has(key)) throw new Error('Recovery analysis restored identity does not match the current manifest')
    if (!/^[0-9a-f]{64}$/u.test(record.targetHash || '') || !Number.isSafeInteger(record.targetSize) || record.targetSize < 0) throw new Error('Recovery analysis restored target identity is invalid')
    const receiptFileIdentity = {
      sourcePath: record.sourcePath,
      targetPath: record.targetPath,
      sourceHash: record.sourceHash,
      targetHash: record.targetHash,
      locale: manifest.locale,
      group: manifest.group,
    }
    const receiptExecutionIdentity = {
      promptContractSha256: identity.promptContractSha256,
      model: identity.model,
      toolingSha: identity.toolingSha,
    }
    assertSafeRepositoryRelativePath(record.sourcePath, 'Recovery analysis restored source path')
    const source = path.resolve(siteDir, ...record.sourcePath.split('/'))
    const root = path.resolve(siteDir)
    if (source !== root && !source.startsWith(`${root}${path.sep}`)) throw new Error('Recovery analysis restored source escapes the repository')
    const sourceStat = fs.lstatSync(source)
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) throw new Error('Recovery analysis restored source is not a regular file')
    const sourceBytes = fs.readFileSync(source)
    if (crypto.createHash('sha256').update(sourceBytes).digest('hex') !== candidate.sourceHash) {
      throw new Error('Recovery analysis restored source payload changed after preflight')
    }
    const sourceContent = sourceBytes.toString('utf8')
    const reviewReceipt = validateRecoveryReviewReceipt(record.reviewReceipt, {
      ...receiptFileIdentity,
      ...(analysis.schemaVersion === 1 || record.compatibility === 'strict' ? receiptExecutionIdentity : {}),
    }, {sourceContent})
    if (analysis.schemaVersion === 2 && record.compatibility === 'revalidated' &&
        Object.entries(receiptExecutionIdentity).every(([key, value]) => reviewReceipt[key] === value)) {
      throw new Error('Recovery analysis revalidated reviewer receipt does not retain its original execution identity')
    }
    assertSafeRepositoryRelativePath(record.targetPath, 'Recovery analysis restored target path')
    const target = path.resolve(siteDir, ...record.targetPath.split('/'))
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
      recoveryReviewReceipt: reviewReceipt,
      review: reviewReceipt.review,
      validationErrors: reviewReceipt.validationErrors,
      ...(reviewReceipt.restSpecReview ? {restSpecReview: reviewReceipt.restSpecReview} : {}),
    })
  }
  const pending = []
  let recoveredChunkCount = 0
  let resumableFileCount = 0
  let recoveredChunkBytes = 0
  let semanticResumableFileCount = 0
  let recoveredSemanticUnitCount = 0
  let recoveredSemanticBytes = 0
  for (const record of analysis.pending) {
    const pendingKeys = ['sourcePath', 'targetPath', 'sourceHash']
    if (Object.hasOwn(record, 'chunkResume')) pendingKeys.push('chunkResume')
    if (Object.hasOwn(record, 'semanticResume')) pendingKeys.push('semanticResume')
    exactRecoveryAnalysisKeys(record, pendingKeys, 'Recovery analysis pending record')
    const key = recoveryEntryIdentity(record)
    const candidate = manifestByIdentity.get(key)
    if (!candidate || candidate.sourceHash !== record.sourceHash || seen.has(key)) throw new Error('Recovery analysis pending identity does not match the current manifest')
    let recoveryChunkCheckpoints
    let recoverySemanticCheckpoints
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
    if (record.semanticResume) {
      const source = path.resolve(siteDir, ...candidate.sourcePath.split('/'))
      const sourceBytes = fs.readFileSync(source)
      if (crypto.createHash('sha256').update(sourceBytes).digest('hex') !== candidate.sourceHash) throw new Error('Recovery analysis pending source payload changed after preflight')
      recoverySemanticCheckpoints = loadAnalysisSemanticResume({
        value: record.semanticResume,
        currentIdentity: {
          target: manifest.target,
          locale: manifest.locale,
          group: manifest.group,
          promptContractSha256: identity.promptContractSha256,
          model: identity.model,
          sourceSha: manifest.sourceCheckpointSha,
          toolingSha: identity.toolingSha,
          mode: record.semanticResume.artifactExecution?.mode,
        },
        candidate,
        target: manifest.target,
        sourceContent: sourceBytes.toString('utf8'),
        chunkOptions,
      })
      semanticResumableFileCount += 1
      recoveredSemanticUnitCount += recoverySemanticCheckpoints.entries.length
      recoveredSemanticBytes += semanticCheckpointBytes({report: recoverySemanticCheckpoints})
      if (recoveredSemanticBytes > MAX_SEMANTIC_CHECKPOINT_AGGREGATE_BYTES) throw new Error('Recovery analysis semantic aggregate payload is oversized')
    }
    seen.add(key)
    pending.push(recoveryChunkCheckpoints || recoverySemanticCheckpoints ? {
      ...candidate,
      ...(recoveryChunkCheckpoints ? {recoveryChunkCheckpoints} : {}),
      ...(recoverySemanticCheckpoints ? {recoverySemanticCheckpoints} : {}),
    } : candidate)
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
  if (hasSemanticRecovery && (analysis.recoveredSemanticUnitCount !== recoveredSemanticUnitCount || analysis.semanticResumableFileCount !== semanticResumableFileCount)) {
    throw new Error('Recovery analysis resumable semantic counts do not match pending records')
  }
  const expectedFullRetranslation = manifest.items.length > 0 && analysis.recoveredCount === 0 && analysis.pendingCount === manifest.items.length &&
    resumableFileCount === 0 && semanticResumableFileCount === 0
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
  const adaptiveCallLimit = parsePositiveInteger(process.env.TRANSLATION_ADAPTIVE_CALL_LIMIT, DEFAULT_ADAPTIVE_CALL_LIMIT)
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
          providerRetryLimit: maxProviderRetries,
          adaptiveCallLimit,
          initialSemanticCheckpoints: item.recoverySemanticCheckpoints,
          log: console,
          initialChunkCheckpoints: item.recoveryChunkCheckpoints,
          fileTimeoutMs,
          providerCallBudgetMs: providerTimeoutMs,
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
              providerRetryBudget: retryContext.providerRetryBudget,
              adaptiveCallBudget: retryContext.adaptiveCallBudget,
              semanticCheckpoint: retryContext.semanticCheckpoint,
              restSpecDraft: retryContext.restSpecDraft,
              onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
              modelCallDeadline: retryContext.modelCallDeadline,
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
  buildPolishMessages,
  buildRecoveryIdentity,
  buildReviewMessages,
  buildTranslationMessages,
  calculateProviderRetryDelay,
  createProviderCall,
  createModelCallCounter,
  createAdaptiveCallBudget,
  createProviderRetryBudget,
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
  translationManifestItemType,
  validateTranslationManifest,
  validateTranslatedContent,
  withTimeout,
}
