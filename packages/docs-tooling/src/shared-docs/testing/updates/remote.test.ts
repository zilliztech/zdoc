// @vitest-environment node
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { canonicalBytes } from '../../core/updates/canonical'
import { acceptExactValidation, classifyRemoteRead, DecisionSchema, ExactValidationReceiptV1Schema,
  RemoteSealV1Schema, RemotePolicySchema, RemoteFactsSchema, REMOTE_LIMITS } from '../../core/updates/remote'

const oid = (n: number) => n.toString(16).padStart(40, '0')
const digest = (n: number) => n.toString(16).padStart(64, '0')
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const blob = (path: string, sha = digest(1), bytes = 10) => ({ path, sha256: sha, bytes })
const found = <T>(value: T) => ({ kind: 'found' as const, value })
function fixture() {
  const identity = { actorId: 7, workflowId: 8, workflowPath: '.github/workflows/producer.yml', workflowDefinitionSha256: digest(2), event: 'workflow_dispatch' as const }
  const policy = { host: 'github.com' as const, repositoryId: 100, repositoryFullName: 'example/zdoc', baseRef: 'master' as const,
    allowedHeadPrefixes: ['shared-update/'], writerActorId: 27, sealIdentity: { scheme: 'github-app-author-v1', platformSignerActorId: 99 }, checkAppId: 9, checkName: 'exact-validation', producerArtifactName: 'producer',
    validatorArtifactName: 'validation', producer: identity,
    validator: { ...identity, actorId: 17, workflowId: 18, workflowPath: '.github/workflows/validate.yml', workflowDefinitionSha256: digest(3) } }
  const expected = { repositoryId: 100, prNumber: 20, branch: 'shared-update/unit', base: oid(3), seal: oid(2), master: oid(3),
    dev: oid(4), tools: oid(3), unitKey: 'guides:unit', planSha256: digest(4), proofSha256: digest(5), transactionId: digest(6),
    preparedBase: oid(5), candidate: oid(6), candidateTree: oid(7), previousSeal: null as string | null, preservedHumanHeads: [oid(8)],
    requestId: 'validation-request', validatorRunId: 31, validatorRunAttempt: 2, producerRequestId: 'producer-request', producerRunId: 30, producerRunAttempt: 1 }
  const seal = { kind: 'shared-update-seal' as const, schemaVersion: 1 as const, repositoryId: 100, transactionId: expected.transactionId,
    unitKey: expected.unitKey, planSha256: expected.planSha256, proofSha256: expected.proofSha256, master: expected.master, dev: expected.dev,
    preparedBase: expected.preparedBase, candidate: expected.candidate, candidateTree: expected.candidateTree, previousSeal: null,
    preservedHumanHeads: expected.preservedHumanHeads, runId: 30, runAttempt: 1 }
  const receipt = { kind: 'shared-update-exact-validation' as const, schemaVersion: 1 as const, repositoryId: 100, prNumber: 20,
    head: expected.seal, master: expected.master, dev: expected.dev, tools: expected.tools, unitKey: expected.unitKey,
    planSha256: expected.planSha256, seal: expected.seal, requestId: expected.requestId, runId: 31, runAttempt: 2,
    workflowPath: policy.validator.workflowPath, workflowDefinitionSha256: policy.validator.workflowDefinitionSha256,
    targetCheckId: 41, targetSuiteId: 51, targetCheckAppId: 9, targetCheckHead: expected.seal, outputDigest: digest(10), conclusion: 'success' }
  const receiptBytes = canonicalBytes(receipt), receiptBlob = blob('validation/receipt.json', sha256(receiptBytes), receiptBytes.length)
  const producerBlob = blob('producer/receipt.json', digest(11))
  const run = { id: 30, attempt: 1, repositoryId: 100, headRepositoryId: 100, ...identity, toolingHead: expected.master,
    status: 'completed', conclusion: 'success', evidence: [blob('producer/run.json')] }
  const artifacts = [{ id: 61, name: 'producer', runId: 30, runAttempt: 1, expired: false, archiveApiDigest: digest(12), archiveActualDigest: digest(12), archive: blob('producer/archive.zip', digest(12), 100) },
    { id: 62, name: 'validation', runId: 31, runAttempt: 2, expired: false, archiveApiDigest: digest(13), archiveActualDigest: digest(13), archive: blob('validation/archive.zip', digest(13), 200) }]
  const { kind: _kind, schemaVersion: _version, ...producerSeal } = seal
  const facts = { host: 'github.com' as const, repositoryId: 100, repositoryFullName: 'example/zdoc', baseRepositoryId: 100, headRepositoryId: 100,
    pr: { repositoryId: 100, number: 20, base: expected.base, head: expected.seal, state: 'open' as const, draft: true, actorId: 27, metadataEvidence: [blob('pr/metadata.json')] },
    baseRef: 'master', headRef: expected.branch, master: expected.master, dev: expected.dev, evidence: [blob('repo/facts.json')],
    producerRuns: found([run]), validatorRuns: found([{ ...run, ...policy.validator, id: 31, attempt: 2, workflowSuiteId: 50,
      workflowSuiteHead: expected.master, evidence: [blob('validation/run.json')] }]),
    producerProvenance: found([{ ...producerSeal, seal: expected.seal, requestId: expected.producerRequestId,
      receipt: producerBlob, artifactId: 61, memberPath: 'receipt.json' }]),
    associations: found([{ repositoryId: 100, runId: 31, runAttempt: 2, requestId: expected.requestId, targetCheckId: 41, targetSuiteId: 51,
      targetCheckAppId: 9, targetCheckHead: expected.seal, receipt: receiptBlob, artifactId: 62, memberPath: 'receipt.json' }]),
    checks: found([{ id: 41, name: policy.checkName, appId: 9, suiteId: 51, head: expected.seal, status: 'completed', conclusion: 'success', evidence: [blob('validation/check.json')] }]),
    artifacts: found(artifacts), members: found([{ artifactId: 61, archiveDigest: digest(12), memberPath: 'receipt.json', actualDigest: producerBlob.sha256, member: producerBlob },
      { artifactId: 62, archiveDigest: digest(13), memberPath: 'receipt.json', actualDigest: receiptBlob.sha256, member: receiptBlob }]),
    seal: found({ oid: expected.seal, parents: [expected.candidate], tree: expected.candidateTree, signatureValid: true,
      signatureState: 'VALID' as const, wasSignedByGitHub: true, signerActorId: 99, authorActorId: 27, writerAttribution: { role: 'author' as const, actorId: 27 }, metadata: seal, evidence: [blob('seal/facts.json')] }), output: blob('validation/output.json', receipt.outputDigest) }
  return { expected, policy, facts, receipt }
}
type Fixture = ReturnType<typeof fixture>
const decide = (f: Fixture) => acceptExactValidation(f.expected, f.facts, canonicalBytes(f.receipt), f.policy)
function hold(f: Fixture, reason: string) {
  const decision = decide(f)
  expect(decision.status).toBe('hold')
  if (decision.status === 'hold') expect(decision.reasons).toContain(reason)
  expect(DecisionSchema.safeParse(decision).success).toBe(true)
}
it('accepts distinct producer/validator runs, M/S heads, suites, archive/member/output digests', () => {
  const f = fixture()
  expect(f.policy.producer.actorId).not.toBe(f.policy.writerActorId)
  expect(f.expected.base).toBe(f.expected.master)
  expect(f.expected.master).not.toBe(f.expected.seal)
  expect(f.facts.validatorRuns.value[0].workflowSuiteId).not.toBe(f.receipt.targetSuiteId)
  expect(f.facts.artifacts.value[1].archiveApiDigest).not.toBe(f.facts.associations.value[0].receipt.sha256)
  expect(decide(f).status).toBe('accepted')
})
const mutations: [string, (f: Fixture) => void, string][] = [
  ['jointly stale intent and observed base', f => { f.expected.base = oid(99); f.facts.pr.base = oid(99) }, 'EXPECTED_BASE'],
  ['wrong PR writer', f => { f.facts.pr.actorId = f.policy.producer.actorId }, 'PR_ACTORID'],
  ['wrong author with correct attribution', f => { f.facts.seal.value.authorActorId = 28 }, 'SEAL_AUTHORACTORID'],
  ['missing author', f => { f.facts.seal.value.authorActorId = null }, 'SEAL_AUTHORACTORID'],
  ['wrong platform signer', f => { f.facts.seal.value.signerActorId = 27 }, 'SEAL_SIGNERACTORID'],
  ['missing platform signer', f => { f.facts.seal.value.signerActorId = null }, 'SEAL_SIGNERACTORID'],
  ['wrong seal writer', f => { f.facts.seal.value.writerAttribution.actorId = f.policy.producer.actorId }, 'SEAL_WRITERATTRIBUTION'],
  ['head', f => { f.facts.pr.head = oid(99) }, 'PR_HEAD'],
  ['master', f => { f.facts.master = oid(99) }, 'REMOTE_MASTER'],
  ['dev', f => { f.facts.dev = oid(99) }, 'REMOTE_DEV'],
  ['tools', f => { f.receipt.tools = oid(99) }, 'RECEIPT_TOOLS'],
  ['expected tools', f => { f.expected.tools = oid(99) }, 'EXPECTED_TOOLS'],
  ['repository', f => { f.facts.repositoryId++ }, 'REMOTE_REPOSITORYID'],
  ['head repository', f => { f.facts.headRepositoryId++ }, 'REMOTE_HEADREPOSITORYID'],
  ['producer actor', f => { f.facts.producerRuns.value[0].actorId++ }, 'PRODUCER_ACTORID'],
  ['validator actor', f => { f.facts.validatorRuns.value[0].actorId++ }, 'VALIDATOR_ACTORID'],
  ['same-name wrong App', f => { f.facts.checks.value[0].appId++ }, 'CHECK_APPID'],
  ['workflow path', f => { f.facts.validatorRuns.value[0].workflowPath = 'wrong.yml' }, 'VALIDATOR_WORKFLOWPATH'],
  ['workflow definition', f => { f.facts.validatorRuns.value[0].workflowDefinitionSha256 = digest(99) }, 'VALIDATOR_WORKFLOWDEFINITIONSHA256'],
  ['workflow ID', f => { f.facts.validatorRuns.value[0].workflowId++ }, 'VALIDATOR_WORKFLOWID'],
  ['attempt', f => { f.facts.validatorRuns.value[0].attempt-- }, 'VALIDATOR_ATTEMPT'],
  ['request', f => { f.receipt.requestId = 'stale' }, 'RECEIPT_REQUESTID'],
  ['archive actual digest', f => { f.facts.artifacts.value[1].archiveActualDigest = digest(99) }, 'VALIDATOR_ARTIFACT_ARCHIVEACTUALDIGEST'],
  ['archive retained digest', f => { f.facts.artifacts.value[1].archive.sha256 = digest(99) }, 'VALIDATOR_ARCHIVE_DIGEST'],
  ['member digest', f => { f.facts.members.value[1].actualDigest = digest(99) }, 'VALIDATOR_MEMBER_ACTUALDIGEST'],
  ['member archive association', f => { f.facts.members.value[1].archiveDigest = digest(99) }, 'VALIDATOR_MEMBER_ARCHIVEDIGEST'],
  ['output digest', f => { f.facts.output.sha256 = digest(99) }, 'RECEIPT_OUTPUTDIGEST'],
  ['receipt member digest', f => { f.facts.associations.value[0].receipt.sha256 = digest(99) }, 'ASSOCIATION_RECEIPT'],
  ['swapped suite association', f => { f.facts.associations.value[0].targetSuiteId = 50 }, 'ASSOCIATION_TARGETSUITEID'],
  ['stale association', f => { f.facts.associations.value[0].runAttempt-- }, 'ASSOCIATION_RUNATTEMPT'],
  ['swapped check association', f => { f.facts.associations.value[0].targetCheckId++ }, 'ASSOCIATION_TARGETCHECKID'],
  ['wrong producer provenance', f => { f.facts.producerProvenance.value[0].runAttempt++ }, 'PROVENANCE_RUNATTEMPT'],
  ['validator substituted for producer', f => { f.facts.seal.value.metadata.runId = 31 }, 'SEAL_METADATA_RUNID'],
  ['signature', f => { f.facts.seal.value.signatureValid = false }, 'SEAL_SIGNATUREVALID'],
  ['parent', f => { f.facts.seal.value.parents = [oid(99)] }, 'SEAL_PARENTS'],
  ['tree', f => { f.facts.seal.value.tree = oid(99) }, 'SEAL_TREE'],
  ['old successful check', f => { f.facts.checks.value[0].head = oid(99) }, 'CHECK_HEAD'],
  ['workflow suite at wrong head', f => { f.facts.validatorRuns.value[0].workflowSuiteHead = f.expected.seal }, 'VALIDATOR_WORKFLOWSUITEHEAD'],
  ['expired artifact', f => { f.facts.artifacts.value[1].expired = true }, 'VALIDATOR_ARTIFACT_EXPIRED'],
  ['wrong base', f => { f.facts.pr.base = oid(99) }, 'PR_BASE'],
  ['non-draft', f => { f.facts.pr.draft = false }, 'PR_DRAFT'],
  ['wrong branch prefix', f => { f.expected.branch = 'human/unit' }, 'BRANCH_POLICY'],
  ['duplicate runs', f => { f.facts.validatorRuns.value.push(f.facts.validatorRuns.value[0]) }, 'VALIDATOR_AMBIGUOUS_OR_MISSING'],
  ['duplicate artifacts', f => { f.facts.artifacts.value.push(f.facts.artifacts.value[1]) }, 'VALIDATOR_ARTIFACT_AMBIGUOUS_OR_MISSING'],
  ['duplicate members', f => { f.facts.members.value.push(f.facts.members.value[1]) }, 'VALIDATOR_MEMBER_AMBIGUOUS_OR_MISSING'],
  ['missing producer provenance', f => { f.facts.producerProvenance.value = [] }, 'PROVENANCE_AMBIGUOUS_OR_MISSING'],
]
it.each(mutations)('holds %s with a specific reason', (_name, mutate, reason) => { const f = fixture(); mutate(f); hold(f, reason) })
it.each(['pending', 'cancelled', 'skipped', 'failure'])('holds unsuccessful validation %s', status => {
  const f = fixture(); f.facts.validatorRuns.value[0].conclusion = status; hold(f, 'VALIDATOR_CONCLUSION')
})
it('holds unknown and absent facts rather than manufacturing absence or success', () => {
  for (const value of [{ kind: 'unknown', reasons: ['TIMEOUT'] }, { kind: 'absent', evidence: [blob('absent.json')] }]) {
    const f = fixture(); Object.assign(f.facts, { checks: value }); hold(f, 'CHECK_READ')
  }
})
it('rejects missing and extra fields at every nested boundary', () => {
  const examples = [fixture().policy, fixture().facts, fixture().facts.validatorRuns.value[0], fixture().facts.associations.value[0],
    fixture().facts.artifacts.value[0], fixture().facts.members.value[0], fixture().receipt, fixture().facts.seal.value.metadata]
  for (const original of examples) {
    const f = fixture()
    const targets = [f.policy, f.facts, f.facts.validatorRuns.value[0], f.facts.associations.value[0], f.facts.artifacts.value[0],
      f.facts.members.value[0], f.receipt, f.facts.seal.value.metadata]
    const index = examples.indexOf(original), target = targets[index]
    Object.assign(target, { unexpected: true })
    expect(decide(f).status).toBe('hold')
    delete target['unexpected']; delete target[Object.keys(target)[0]]
    expect(decide(f).status).toBe('hold')
  }
})
it('rejects noncanonical, duplicate-key, oversized, malformed and missing receipt bytes without exposing input', () => {
  const f = fixture(), valid = canonicalBytes(f.receipt)
  for (const raw of [undefined, {}, new Uint8Array([255]), new Uint8Array(REMOTE_LIMITS.payloadBytes + 1),
    Buffer.from(JSON.stringify(f.receipt)), Buffer.from(Buffer.from(valid).toString().replace('"schemaVersion":1', '"schemaVersion":1,"schemaVersion":1'))]) {
    expect(acceptExactValidation(f.expected, f.facts, raw, f.policy)).toEqual({ status: 'hold', reasons: ['RECEIPT_MALFORMED'] })
  }
})
it('bounds collections, strings, numeric IDs, paths and payloads', () => {
  for (const mutate of [
    (f: Fixture) => { f.policy.checkName = 'x'.repeat(257) },
    (f: Fixture) => { f.facts.members.value[0].memberPath = '../receipt.json' },
    (f: Fixture) => { f.expected.producerRunId = Number.MAX_SAFE_INTEGER + 1 },
    (f: Fixture) => { f.facts.artifacts.value[0].archive.bytes = REMOTE_LIMITS.archiveBytes + 1 },
    (f: Fixture) => { f.facts.validatorRuns.value = Array(33).fill(f.facts.validatorRuns.value[0]) },
  ]) { const f = fixture(); mutate(f); expect(decide(f).status).toBe('hold') }
  expect(RemoteSealV1Schema.safeParse({ ...fixture().facts.seal.value.metadata, schemaVersion: 2 }).success).toBe(false)
  expect(ExactValidationReceiptV1Schema.safeParse({ ...fixture().receipt, head: 'bad' }).success).toBe(false)
  expect(RemotePolicySchema.safeParse({ ...fixture().policy, host: 'enterprise.example' }).success).toBe(false)
  expect(RemoteFactsSchema.safeParse({ ...fixture().facts, output: blob('output', digest(1), REMOTE_LIMITS.outputBytes + 1) }).success).toBe(false)
})
it('does not mutate deeply frozen input or alias returned evidence', () => {
  const f = fixture(), before = canonicalBytes(f)
  const freeze = (value: unknown) => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) } }
  freeze(f)
  const result = decide(f)
  expect(result.status).toBe('accepted')
  if (result.status === 'accepted') result.evidence[0].path = 'changed'
  expect(canonicalBytes(f)).toEqual(before)
})
const observation = () => ({ status: 'not-found', repositoryReadable: true, endpointScopeVerified: true,
  paginationComplete: true, exactInventoryMatches: 0, value: null, evidence: [blob('read.json')] })
it('classifies only scoped authenticated complete 404 as absent and exact success as found', () => {
  expect(classifyRemoteRead(observation()).kind).toBe('absent')
  expect(classifyRemoteRead({ ...observation(), status: 'success', exactInventoryMatches: 1, value: { id: 1 } })).toEqual({ kind: 'found', value: { id: 1 } })
})
it.each(['forbidden', 'rate-limited', 'server-error', 'timeout', 'graphql-error'])('keeps %s unknown, including GraphQL errors with HTTP 200', status => {
  expect(classifyRemoteRead({ ...observation(), status }).kind).toBe('unknown')
})
it('keeps incomplete, unreadable, unscoped, ambiguous and malformed observations unknown', () => {
  for (const patch of [{ repositoryReadable: false }, { endpointScopeVerified: false }, { paginationComplete: false },
    { exactInventoryMatches: 2 }, { evidence: [] }, { extra: 'Authorization: secret' }, { value: undefined }]) {
    const result = classifyRemoteRead({ ...observation(), ...patch })
    expect(result.kind).toBe('unknown'); expect(JSON.stringify(result)).not.toContain('secret')
  }
})

it('rejects legacy policy and committer attribution without migration defaults',()=>{
  const f=fixture(),{sealIdentity,...legacy}=f.policy
  expect(RemotePolicySchema.safeParse(legacy).success).toBe(false)
  expect(RemotePolicySchema.safeParse({...f.policy,sealIdentity:{...sealIdentity,platformSignerActorId:0}}).success).toBe(false)
  expect(RemoteFactsSchema.safeParse({...f.facts,seal:{kind:'found',value:{...f.facts.seal.value,writerAttribution:{role:'committer',actorId:27}}}}).success).toBe(false)
})
