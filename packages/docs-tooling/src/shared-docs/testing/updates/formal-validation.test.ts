// @vitest-environment node
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { formalValidation } from '../../adapters/updates/formal-validation'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { fixtureMaterial } from './fixtures/manual-provider'
import type { UpdateReportEnvelope } from '../../core/updates/envelope'

// All validator/Check facts and the synthetic plan/report below are TEST DATA, never the retained
// #1236 producer archive (replayed separately). The production repository ID selects the unit-plan
// path; a caller-supplied scope/receipt ID/flag can never downgrade it.

const oid = (n: number) => n.toString(16).padStart(40, '0')
const digestN = (n: number) => n.toString(16).padStart(64, '0')
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const blob = (path: string, sha = digestN(1), bytes = 10) => ({ path, sha256: sha, bytes })
const found = <T>(value: T) => ({ kind: 'found' as const, value })
const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')

const prod = { repositoryId: 660446555 }
const subject = { kind: 'guides-page' as const, group: 'guides' as const, pageId: 'json-field-overview' }
const members = [{ logicalId: 'json-field-overview', manualId: 'guides', token: 'shared-json-field-overview',
  outputPath: 'content/en/guides/json-field-overview.mdx', origin: 'upstream' as const, current: true, next: true }]
const lockPath = 'shared-docs/guides/pages/json-field-overview/lock.yaml'

const master = oid(3), dev = oid(4), current = oid(5), target = oid(6)

function makeReport(): UpdateReportEnvelope {
  const report = structuredClone(fixtureMaterial({ subject, master, current, target, members }).collectedReport) as UpdateReportEnvelope
  report.pins.dev = dev
  Object.assign(report.pins.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
  Object.assign(report.semanticProjection!.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
  report.semanticInputSha256 = digest('semantic', report.semanticProjection)
  return report
}

// Rebuild the plan/reference around a (possibly mutated) report so the test reaches the semantic
// checks after byte authentication: plan reference `blobs/<sha256>`, ZIP member `reports/<sha256>.json`.
function build(report: UpdateReportEnvelope, mutatePlan?: (plan: any) => void) {
  const reportBytes = canonicalBytes(report)
  const reportRef = { path: 'blobs/' + sha256(reportBytes), sha256: sha256(reportBytes), bytes: reportBytes.length }
  const plan: any = { kind: 'shared-update-unit', schemaVersion: 1, unitKey: 'guides:' + sha256(canonicalBytes([subject])),
    subjects: [subject], membersSha256: digest('unit-members', [{ subject, memberSetSha256: report.memberSetSha256 }]),
    reports: [reportRef], nextEdits: [{ subject, before: { path: lockPath, current, next: current, sha256: digestN(7) },
      target, afterBlob: blob('blobs/' + digestN(8)) }], disposition: 'candidate', holdReasons: [],
    semanticInputSha256: digest('unit-semantic', [{ subject, semanticInputSha256: report.semanticInputSha256 }]) }
  mutatePlan?.(plan)
  const planBytes = canonicalBytes(plan)
  return { report, reportBytes, reportRef, plan, planBytes, planSha256: digest('plan', plan),
    pins: { master, dev, source: target } }
}

// Synthetic validator/Check facts, receipt, expected and policy for the production repository.
function productionRemote() {
  const identity = { actorId: 7, workflowId: 8, workflowPath: '.github/workflows/producer.yml',
    workflowDefinitionSha256: digestN(2), event: 'workflow_dispatch' as const }
  const policy = { host: 'github.com' as const, repositoryId: 660446555, repositoryFullName: 'zilliztech/zdoc',
    baseRef: 'master' as const, allowedHeadPrefixes: ['shared-update/'], writerActorId: 27,
    sealIdentity: { scheme: 'github-app-author-v1', platformSignerActorId: 99 }, checkAppId: 9,
    checkName: 'exact-validation', producerArtifactName: 'producer', validatorArtifactName: 'validation',
    producer: identity, validator: { ...identity, actorId: 17, workflowId: 18, workflowPath: '.github/workflows/validate.yml', workflowDefinitionSha256: digestN(3) } }
  const expected = { repositoryId: 660446555, prNumber: 1236, branch: 'shared-update/71913de6', base: master, seal: oid(2),
    master, dev, tools: master, unitKey: 'guides:unit', planSha256: digestN(4), proofSha256: digestN(5),
    transactionId: digestN(6), preparedBase: oid(5), candidate: oid(6), candidateTree: oid(7), previousSeal: null as string | null,
    preservedHumanHeads: [oid(8)], requestId: 'validation-request', validatorRunId: 31, validatorRunAttempt: 2,
    producerRequestId: 'producer-request', producerRunId: 30, producerRunAttempt: 1 }
  const seal = { kind: 'shared-update-seal' as const, schemaVersion: 1 as const, repositoryId: 660446555,
    transactionId: expected.transactionId, unitKey: expected.unitKey, planSha256: expected.planSha256,
    proofSha256: expected.proofSha256, master, dev, preparedBase: expected.preparedBase,
    candidate: expected.candidate, candidateTree: expected.candidateTree, previousSeal: null,
    preservedHumanHeads: expected.preservedHumanHeads, runId: 30, runAttempt: 1 }
  const receipt = { kind: 'shared-update-exact-validation' as const, schemaVersion: 1 as const, repositoryId: 660446555,
    prNumber: 1236, head: expected.seal, master, dev, tools: master, unitKey: expected.unitKey,
    planSha256: expected.planSha256, seal: expected.seal, requestId: expected.requestId, runId: 31, runAttempt: 2,
    workflowPath: policy.validator.workflowPath, workflowDefinitionSha256: policy.validator.workflowDefinitionSha256,
    targetCheckId: 41, targetSuiteId: 51, targetCheckAppId: 9, targetCheckHead: expected.seal,
    outputDigest: digestN(10), conclusion: 'success' }
  const receiptBytes = canonicalBytes(receipt), receiptBlob = blob('validation/receipt.json', sha256(receiptBytes), receiptBytes.length)
  const producerBlob = blob('producer/receipt.json', digestN(11))
  const run = { id: 30, attempt: 1, repositoryId: 660446555, headRepositoryId: 660446555, ...identity,
    toolingHead: master, status: 'completed', conclusion: 'success', evidence: [blob('producer/run.json')] }
  const artifacts = [{ id: 61, name: 'producer', runId: 30, runAttempt: 1, expired: false, archiveApiDigest: digestN(12),
    archiveActualDigest: digestN(12), archive: blob('producer/archive.zip', digestN(12), 100) },
    { id: 62, name: 'validation', runId: 31, runAttempt: 2, expired: false, archiveApiDigest: digestN(13),
      archiveActualDigest: digestN(13), archive: blob('validation/archive.zip', digestN(13), 200) }]
  const { kind: _k, schemaVersion: _v, ...producerSeal } = seal
  const facts = { host: 'github.com' as const, repositoryId: 660446555, repositoryFullName: 'zilliztech/zdoc',
    baseRepositoryId: 660446555, headRepositoryId: 660446555,
    pr: { repositoryId: 660446555, number: 1236, base: expected.base, head: expected.seal, state: 'open' as const, draft: true, actorId: 27, metadataEvidence: [blob('pr/metadata.json')] },
    baseRef: 'master', headRef: expected.branch, master, dev, evidence: [blob('repo/facts.json')],
    producerRuns: found([run]),
    validatorRuns: found([{ ...run, ...policy.validator, id: 31, attempt: 2, workflowSuiteId: 50, workflowSuiteHead: master, evidence: [blob('validation/run.json')] }]),
    producerProvenance: found([{ ...producerSeal, seal: expected.seal, requestId: expected.producerRequestId, receipt: producerBlob, artifactId: 61, memberPath: 'receipt.json' }]),
    associations: found([{ repositoryId: 660446555, runId: 31, runAttempt: 2, requestId: expected.requestId, targetCheckId: 41, targetSuiteId: 51, targetCheckAppId: 9, targetCheckHead: expected.seal, receipt: receiptBlob, artifactId: 62, memberPath: 'receipt.json' }]),
    checks: found([{ id: 41, name: policy.checkName, appId: 9, suiteId: 51, head: expected.seal, status: 'completed', conclusion: 'success', evidence: [blob('validation/check.json')] }]),
    artifacts: found(artifacts),
    members: found([{ artifactId: 61, archiveDigest: digestN(12), memberPath: 'receipt.json', actualDigest: producerBlob.sha256, member: producerBlob },
      { artifactId: 62, archiveDigest: digestN(13), memberPath: 'receipt.json', actualDigest: receiptBlob.sha256, member: receiptBlob }]),
    seal: found({ oid: expected.seal, parents: [expected.candidate], tree: expected.candidateTree, signatureValid: true,
      signatureState: 'VALID' as const, wasSignedByGitHub: true, signerActorId: 99, authorActorId: 27,
      writerAttribution: { role: 'author' as const, actorId: 27 }, metadata: seal, evidence: [blob('seal/facts.json')] }),
    output: blob('validation/output.json', digestN(10)) }
  return { expected, policy, facts, receipt }
}

// Bind a synthetic plan/report to the synthetic remote facts so the three operations share one input.
function productionFormal(mutateReport?: (report: UpdateReportEnvelope) => void, mutatePlan?: (plan: any) => void) {
  const report = makeReport()
  if (mutateReport) { mutateReport(report); report.semanticInputSha256 = digest('semantic', report.semanticProjection) }
  const built = build(report, mutatePlan)
  const remote = productionRemote()
  const { expected, policy, facts, receipt } = remote
  expected.planSha256 = receipt.planSha256 = built.planSha256
  expected.unitKey = receipt.unitKey = built.plan.unitKey
  facts.seal.value.metadata.planSha256 = built.planSha256
  facts.seal.value.metadata.unitKey = built.plan.unitKey
  facts.producerProvenance.value[0].planSha256 = built.planSha256
  facts.producerProvenance.value[0].unitKey = built.plan.unitKey
  const output = canonicalBytes({ pins: built.pins })
  facts.output = blob('validation/output.json', sha256(output), output.length)
  receipt.outputDigest = facts.output.sha256
  const receiptBytes = canonicalBytes(receipt)
  const ref = blob('validation/receipt.json', sha256(receiptBytes), receiptBytes.length)
  facts.associations.value[0].receipt = facts.members.value[1].member = ref
  facts.members.value[1].actualDigest = ref.sha256
  return { ...built, expected, policy, facts, receipt, planBase64: b64(built.planBytes),
    reportsBase64: [{ name: 'reports/' + built.reportRef.sha256 + '.json', bytesBase64: b64(built.reportBytes) }],
    outputBase64: b64(output), receiptBase64: b64(receiptBytes), observed: built.pins }
}

describe('production shared-update-unit validation', () => {
  it('accepts the production plan/report and returns an encoded receipt', () => {
    const f = productionFormal()
    expect(formalValidation({ ...f, op: 'receipt' }, prod)).toEqual({ status: 'encoded', bytesBase64: f.receiptBase64 })
  })

  it('separates reserved Check readiness from completed Check acceptance', () => {
    const f = productionFormal()
    const check = f.facts.checks.value[0]
    check.status = 'in_progress'; check.conclusion = 'pending'
    expect(formalValidation({ ...f, op: 'prepublish' }, prod).status).toBe('ready-to-publish')
    expect(formalValidation({ ...f, op: 'accept' }, prod).status).toBe('hold')
    check.status = 'completed'; check.conclusion = 'success'
    expect(formalValidation({ ...f, op: 'prepublish' }, prod).status).toBe('hold')
    expect(formalValidation({ ...f, op: 'accept' }, prod).status).toBe('accepted')
  })

  it.each(['master', 'dev', 'source'] as const)('holds on %s movement with the stale reason', field => {
    const f = productionFormal()
    const observed = { ...f.observed, [field]: oid(999) }
    const hold = { status: 'hold', reasons: ['STALE_' + field.toUpperCase()], changes: [{ field, expected: f.observed[field], observed: oid(999) }] }
    expect(formalValidation({ op: 'freshness', expected: f.observed, observed })).toEqual(hold)
    for (const op of ['receipt', 'prepublish', 'accept']) expect(formalValidation({ ...f, op, observed }, prod)).toEqual(hold)
  })

  it('rejects a tampered report byte, size, member name and reference path', () => {
    const f = productionFormal()
    const tamper = (bytes: Buffer, mutate: (b: Buffer) => Buffer) => ({ name: f.reportsBase64[0].name, bytesBase64: b64(mutate(bytes)) })
    expect(() => formalValidation({ ...f, op: 'receipt',
      reportsBase64: [tamper(Buffer.from(f.reportBytes), b => { b[0] ^= 0xff; return b })] }, prod)).toThrow('REPORT_DIGEST')
    expect(() => formalValidation({ ...f, op: 'receipt',
      reportsBase64: [tamper(Buffer.from(f.reportBytes), b => Buffer.concat([b, Buffer.from([0])]))] }, prod)).toThrow('REPORT_SIZE')
    expect(() => formalValidation({ ...f, op: 'receipt',
      reportsBase64: [{ name: 'reports/' + '0'.repeat(64) + '.json', bytesBase64: f.reportsBase64[0].bytesBase64 }] }, prod)).toThrow('REPORT_MEMBER_NAME')
  })

  it('rejects a misnamed reference path and missing/extra report inputs', () => {
    const f = productionFormal()
    const rp = productionFormal(undefined, plan => { plan.reports[0].path = 'blobs/' + '0'.repeat(64) })
    expect(() => formalValidation({ ...rp, op: 'receipt' }, prod)).toThrow('REPORT_REF_PATH')
    expect(() => formalValidation({ ...f, op: 'receipt', reportsBase64: [] }, prod)).toThrow('REPORT_COUNT')
    expect(() => formalValidation({ ...f, op: 'receipt', reportsBase64: [...f.reportsBase64, f.reportsBase64[0]] }, prod)).toThrow('REPORT_COUNT')
  })

  it('rejects a non-candidate unit and a mismatched unit key', () => {
    const nonCandidate = productionFormal(undefined, plan => { plan.disposition = 'report-only'; plan.nextEdits = [] })
    expect(() => formalValidation({ ...nonCandidate, op: 'receipt' }, prod)).toThrow('PLAN_NOT_CANDIDATE')
    const badKey = productionFormal(undefined, plan => { plan.unitKey = 'guides:wrong' })
    expect(() => formalValidation({ ...badKey, op: 'receipt' }, prod)).toThrow()
  })

  it('rejects a report from another source repository/track with matching SHA values', () => {
    const f = productionFormal(report => {
      Object.assign(report.pins.source, { repository: 'https://github.com/other/repo', track: 'other' })
      Object.assign(report.semanticProjection!.source, { repository: 'https://github.com/other/repo', track: 'other' })
    })
    expect(() => formalValidation({ ...f, op: 'receipt' }, prod)).toThrow('SOURCE_IDENTITY')
  })

  it('binds the plan unit key to the receipt and rejects a consistently foreign key in all three operations', () => {
    // Plan and report remain authentic; only the receipt and remote facts point at another key.
    const f = productionFormal()
    const receipt = { ...f.receipt, unitKey: 'guides:other' }
    const expected = { ...f.expected, unitKey: 'guides:other' }
    const facts = structuredClone(f.facts)
    facts.seal.value.metadata.unitKey = 'guides:other'
    facts.producerProvenance.value[0].unitKey = 'guides:other'
    const forged = { ...f, receipt, expected, facts, receiptBase64: b64(canonicalBytes(receipt)) }
    expect(() => formalValidation({ ...forged, op: 'receipt' }, prod)).toThrow('UNIT_KEY_BINDING')
    expect(() => formalValidation({ ...forged, op: 'prepublish' }, prod)).toThrow('UNIT_KEY_BINDING')
    expect(() => formalValidation({ ...forged, op: 'accept' }, prod)).toThrow('UNIT_KEY_BINDING')
  })

  it('rejects production identity with a private-format plan and vice versa', () => {
    const f = productionFormal()
    const privatePlanObj = { scope: 'private-single-page-projection', pins: f.pins }
    const privatePlan = canonicalBytes(privatePlanObj)
    const privateOutput = canonicalBytes({ pins: f.pins })
    const forged = { ...f, planBase64: b64(privatePlan), outputBase64: b64(privateOutput),
      receipt: { ...f.receipt, planSha256: digest('plan', privatePlanObj), outputDigest: sha256(privateOutput) } }
    expect(() => formalValidation({ ...forged, op: 'receipt' }, prod)).toThrow('PRODUCTION_REQUIRES_UNIT_PLAN')
    // production unit in a private/test context (trusted entry and receipt agree on a test repository)
    expect(() => formalValidation({ ...f, op: 'receipt', receipt: { ...f.receipt, repositoryId: 100 } },
      { repositoryId: 100 })).toThrow('PRIVATE_REQUIRES_PROJECTION')
    // trusted entry disagrees with the receipt repository -> repository binding
    expect(() => formalValidation({ ...f, op: 'receipt', receipt: { ...f.receipt, repositoryId: 100 } }, prod)).toThrow('REPOSITORY_BINDING')
  })

  it('cannot be downgraded by a repository field in the request JSON', () => {
    const f = productionFormal()
    // The request JSON claims a test repository, but the trusted entry fixes production.
    expect(formalValidation({ ...f, op: 'receipt', repository: { id: 100 } }, prod))
      .toEqual({ status: 'encoded', bytesBase64: f.receiptBase64 })
    // The request JSON claims production, but the trusted entry is a test repository -> private path.
    const privatePlanObj = { scope: 'private-single-page-projection', pins: f.pins }
    const privateOutput = canonicalBytes({ pins: f.pins })
    const privateReceipt = { ...f.receipt, repositoryId: 100, planSha256: digest('plan', privatePlanObj), outputDigest: sha256(privateOutput) }
    expect(formalValidation({ ...f, op: 'receipt', repository: { id: 660446555 },
      planBase64: b64(canonicalBytes(privatePlanObj)), outputBase64: b64(privateOutput), receipt: privateReceipt },
      { repositoryId: 100 })).toEqual({ status: 'encoded', bytesBase64: b64(canonicalBytes(privateReceipt)) })
  })

  it('rejects a forged private receipt presented to a production caller via repository binding', () => {
    const f = productionFormal()
    expect(() => formalValidation({ ...f, op: 'receipt', receipt: { ...f.receipt, repositoryId: 100 } }, prod)).toThrow('REPOSITORY_BINDING')
  })

  it('rejects a production repository ID declared only in request fields when the trusted context is absent', () => {
    // A private-format plan whose receipt/expected/policy all declare the production repository ID,
    // supplied with no trusted context (the CLI case where GITHUB_REPOSITORY_ID is unset). Request
    // fields cannot grant production identity, so all three operations must reject.
    const f = productionFormal()
    const privatePlanObj = { scope: 'private-single-page-projection', pins: f.pins }
    const privateOutput = canonicalBytes({ pins: f.pins })
    const receipt = { ...f.receipt, repositoryId: 660446555, planSha256: digest('plan', privatePlanObj), outputDigest: sha256(privateOutput) }
    const receiptBase64 = b64(canonicalBytes(receipt))
    const expected = { ...f.expected, repositoryId: 660446555 }
    const policy = { ...f.policy, repositoryId: 660446555 }
    expect(() => formalValidation({ op: 'receipt', planBase64: b64(canonicalBytes(privatePlanObj)),
      outputBase64: b64(privateOutput), receipt, observed: f.observed })).toThrow('REPOSITORY_BINDING')
    expect(() => formalValidation({ op: 'prepublish', expected, planBase64: b64(canonicalBytes(privatePlanObj)),
      outputBase64: b64(privateOutput), receiptBase64, observed: f.observed, facts: f.facts, policy })).toThrow('REPOSITORY_BINDING')
    expect(() => formalValidation({ op: 'accept', expected, planBase64: b64(canonicalBytes(privatePlanObj)),
      outputBase64: b64(privateOutput), receiptBase64, observed: f.observed, facts: f.facts, policy })).toThrow('REPOSITORY_BINDING')
  })
})
