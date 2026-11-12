// The trusted workflow authenticates live API observations, run receipts and the archived draft report.
import { createHash } from 'node:crypto'
import { verifySealSignature } from './verify-seal-signature.mjs'

const positiveId = value => Number.isSafeInteger(value) && value > 0
const oid = value => typeof value === 'string' && value.length === 40 && /^[0-9a-f]+$/.test(value)
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

function requireFact(ok, code) {
  if (!ok) throw new Error(code)
}

function bytes(value, limit) {
  requireFact(typeof value === 'string' && value.length <= 4 * Math.ceil(limit / 3), 'INPUT_BYTES_LIMIT')
  const data = Buffer.from(value, 'base64')
  requireFact(data.length > 0 && data.length <= limit && data.toString('base64') === value, 'INVALID_BYTES')
  return data
}

function reportBinding(base64, expected) {
  const data = bytes(base64, 1024 * 1024)
  requireFact(sha256(data) === expected.reportSha256, 'DRAFT_REPORT_DIGEST')
  const report = JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(data))
  const v = report.verification
  requireFact(report.schemaVersion === 1 && report.scope === 'private-unsealed-draft-head' &&
    report.mode === 'report-only' && report.sealed === false && report.targetCheckPublished === false &&
    v?.kind === 'shared-update-draft-head-report' && v.schemaVersion === 1 && v.status === 'verified' &&
    v.scope === 'single-guides-lock' && v.repositoryId === expected.repositoryId && v.prNumber === expected.prNumber &&
    v.base === expected.base && v.head === expected.candidate && typeof v.proofSha256 === 'string' &&
    v.proofSha256.length === 64 && /^[0-9a-f]+$/.test(v.proofSha256), 'DRAFT_REPORT_TARGET')
  return v.proofSha256
}

function bindCheck(mode, expected, check, suite, seal) {
  requireFact(positiveId(expected.id) && positiveId(expected.appId) && positiveId(expected.suiteId) &&
    [expected.name, expected.externalId, expected.detailsUrl].every(v => typeof v === 'string' && v.length > 0),
  'CHECK_EXPECTATION')
  requireFact(check.id === expected.id && check.name === expected.name && check.head_sha === seal &&
    check.external_id === expected.externalId && check.details_url === expected.detailsUrl &&
    check.app?.id === expected.appId && check.check_suite?.id === expected.suiteId &&
    suite.id === expected.suiteId && suite.head_sha === seal && suite.app?.id === expected.appId, 'CHECK_BINDING')
  const isReservation = mode === 'reserved'
  requireFact(check.status === (isReservation ? 'in_progress' : 'completed') &&
    check.conclusion === (isReservation ? null : 'success'), 'CHECK_RESULT')
  return { id: check.id, suiteId: suite.id, appId: check.app.id, name: check.name, head: check.head_sha,
    externalId: check.external_id, detailsUrl: check.details_url, status: check.status, conclusion: check.conclusion }
}

function verify(input) {
  const { mode, expected, observed, signature } = input
  const { repositoryId, prNumber, base, candidate, candidateTree, seal, message, reportSha256 } = expected
  requireFact(['stage', 'seal', 'reserved', 'check'].includes(mode), 'UNKNOWN_MODE')
  requireFact(positiveId(repositoryId) && positiveId(prNumber) && [base, candidate, candidateTree, seal].every(oid) &&
    new Set([base, candidate, seal]).size === 3 && typeof message === 'string' && message.length > 0, 'SEAL_EXPECTATION')
  requireFact(observed.repositoryId === repositoryId && observed.prNumber === prNumber && observed.base === base &&
    (mode === 'stage' ? observed.head === candidate && observed.stagingHead === seal : observed.head === seal),
  'PR_TARGET_CHANGED')
  const proofSha256 = reportBinding(input.reportBase64, expected)
  requireFact(signature.oid === seal && signature.tree === candidateTree && Array.isArray(signature.parents) &&
    signature.parents.length === 1 && signature.parents[0] === candidate, 'SEAL_API_TARGET')

  const signed = verifySealSignature(bytes(input.rawCommitBase64, 256 * 1024), signature, expected)
  const trees = signed.unsignedHeaders.filter(line => line.startsWith('tree '))
  const parents = signed.unsignedHeaders.filter(line => line.startsWith('parent '))
  requireFact(trees.length === 1 && trees[0] === 'tree ' + candidateTree &&
    parents.length === 1 && parents[0] === 'parent ' + candidate, 'SEAL_GIT_TARGET')
  requireFact(signed.message.equals(Buffer.from(message)), 'SEAL_MESSAGE')
  const result = { schemaVersion: 1, kind: 'shared-update-sealed-draft-report', mode, status: 'verified',
    repositoryId, prNumber, base, candidate, seal, tree: candidateTree, reportSha256, proofSha256 }
  if (mode === 'reserved' || mode === 'check')
    result.check = bindCheck(mode, input.expectedCheck, input.check, input.suite, seal)
  return result
}

try {
  let size = 0
  const chunks = []
  for await (const chunk of process.stdin) {
    size += chunk.length
    requireFact(size <= 3 * 1024 * 1024, 'INPUT_LIMIT')
    chunks.push(chunk)
  }
  const input = JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(Buffer.concat(chunks)))
  process.stdout.write(JSON.stringify(verify(input)) + '\n')
} catch (error) {
  const code = error instanceof Error && /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'INVALID_INPUT'
  process.stderr.write(code + '\n')
  process.exitCode = 1
}
