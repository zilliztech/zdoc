'use strict'

const crypto = require('node:crypto')
const {
  POLICY_EXCEPTIONS_PATH,
  validateReconciliationPolicyExceptions,
} = require('../translation/reconciliation-policy')
const {
  buildReviewPullRequest,
  validateReviewArtifact,
} = require('./reconciliation-review-pr')

const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`)
  return value.trim()
}

function timestamp(value, label) {
  if (!TIMESTAMP.test(value || '') || new Date(value).toISOString() !== value) throw new Error(`${label} must be an exact UTC timestamp`)
  return value
}

function policyExceptionFromReview({reviewArtifact, reviewer, rationale, approvedAt}) {
  const review = validateReviewArtifact(reviewArtifact)
  return {
    target: review.target,
    group: review.group,
    policyId: review.policyId,
    planSha256: review.planSha256,
    operations: review.operations.map(operation => ({
      kind: operation.kind,
      sourcePath: operation.sourcePath,
      targetPath: operation.targetPath,
      replacementSourcePath: operation.replacementSourcePath,
      replacementTargetPath: operation.replacementTargetPath,
      reason: operation.reason,
    })),
    authorization: {
      method: 'human',
      identity: required(reviewer, 'reviewer'),
      rationale: required(rationale, 'rationale'),
    },
    approvedAt: timestamp(approvedAt, 'approvedAt'),
  }
}

function policyExceptionsDocument(existingExceptions, exception) {
  const policyId = exception.policyId
  const value = {
    schemaVersion: 1,
    document: 'translation-reconciliation-policy-exceptions',
    policyId,
    exceptions: Array.isArray(existingExceptions) ? [...existingExceptions] : [],
  }
  const validated = validateReconciliationPolicyExceptions(value)
  if (validated.some(item => item.planSha256 === exception.planSha256)) return null
  return {
    schemaVersion: 1,
    document: 'translation-reconciliation-policy-exceptions',
    policyId,
    exceptions: [...validated, exception],
  }
}

function policyExceptionsDocumentBytes(exception, existingExceptions = null) {
  const document = policyExceptionsDocument(existingExceptions, exception)
  return document ? Buffer.from(`${JSON.stringify(document, null, 2)}\n`) : null
}

function policyExceptionSha256(exception) {
  const {approvedAt, authorization, ...body} = exception
  const value = {...body, authorization, approvedAt}
  return `sha256:${crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')}`
}

async function fetchJson(fetchImpl, url, token, options = {}) {
  const response = await fetchImpl(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  })
  const text = typeof response?.text === 'function' ? await response.text() : ''
  if (response?.status === 404) return {status: 404, body: null}
  if (!response?.ok) throw new Error(`GitHub API request failed (${response?.status || 'unknown'}): ${text.slice(0, 500)}`)
  return {status: response.status, body: JSON.parse(text)}
}

async function existingPolicyExceptions({repository, token, baseBranch, fetchImpl}) {
  const path = `repos/${repository}/contents/${POLICY_EXCEPTIONS_PATH}?ref=${encodeURIComponent(baseBranch)}`
  const result = await fetchJson(fetchImpl, `https://api.github.com/${path}`, token)
  if (result.status === 404) return null
  if (!result.body?.content) throw new Error('Policy exceptions file content is unavailable')
  return validateReconciliationPolicyExceptions(JSON.parse(Buffer.from(result.body.content, 'base64').toString('utf8')))
}

async function createDurablePolicyExceptionPullRequest({
  reviewArtifact,
  sourceRunId,
  repository,
  token,
  reviewer,
  rationale = 'Approved from the Feishu reconciliation card',
  approvedAt = new Date().toISOString(),
  baseBranch = 'master',
  fetchImpl = globalThis.fetch,
}) {
  repository = required(repository, 'repository')
  token = required(token, 'GitHub token')
  if (!REPOSITORY.test(repository)) throw new Error('repository is invalid')
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required')
  const review = validateReviewArtifact(reviewArtifact)
  const exception = policyExceptionFromReview({reviewArtifact: review, reviewer, rationale, approvedAt})
  const pr = buildReviewPullRequest({
    reviewArtifact: review,
    sourceRunId,
    targetBaselineSha: review.targetBaselineSha,
    repository,
    durable: true,
    baseBranch,
  })

  const existing = await existingPolicyExceptions({repository, token, baseBranch, fetchImpl})
  if (existing?.some(item => item.planSha256 === exception.planSha256)) {
    return {alreadyExists: true, branch: pr.branch, exceptionSha256: policyExceptionSha256(exception)}
  }
  const document = policyExceptionsDocument(existing, exception)
  const bytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`)

  const refResult = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/ref/heads/${encodeURIComponent(baseBranch)}`, token)
  const baseSha = refResult.body?.object?.sha
  if (!baseSha) throw new Error('Base branch SHA is unavailable')
  const commitResult = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/commits/${baseSha}`, token)
  const baseTree = commitResult.body?.tree?.sha || commitResult.body?.commit?.tree?.sha
  if (!baseTree) throw new Error('Base branch tree SHA is unavailable')

  const blobResult = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/blobs`, token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content: bytes.toString('base64'), encoding: 'base64'}),
  })
  const treeResult = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/trees`, token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({base_tree: baseTree, tree: [{path: POLICY_EXCEPTIONS_PATH, mode: '100644', type: 'blob', sha: blobResult.body.sha}]}),
  })
  const newCommit = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/commits`, token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: pr.title, tree: treeResult.body.sha, parents: [baseSha]}),
  })
  await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/git/refs`, token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ref: `refs/heads/${pr.branch}`, sha: newCommit.body.sha}),
  })
  const pullResult = await fetchJson(fetchImpl, `https://api.github.com/repos/${repository}/pulls`, token, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({title: pr.title, head: pr.branch, base: baseBranch, body: pr.body}),
  })
  return {
    alreadyExists: false,
    branch: pr.branch,
    prNumber: pullResult.body?.number,
    prUrl: pullResult.body?.html_url,
    exceptionSha256: policyExceptionSha256(exception),
  }
}

module.exports = {
  createDurablePolicyExceptionPullRequest,
  existingPolicyExceptions,
  policyExceptionFromReview,
  policyExceptionsDocument,
  policyExceptionsDocumentBytes,
  policyExceptionSha256,
}
