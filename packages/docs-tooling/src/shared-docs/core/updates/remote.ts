import { createHash } from 'node:crypto'
import * as z from 'zod'
import { canonicalBytes, compareUtf8, isValidUnicode, parseStrictJson } from './canonical'
import { DigestSchema, GitShaSchema, GitTreeOidSchema, ObservedPrSchema, type BlobRef } from './envelope'

/** Consistency contracts only: adapters authenticate provenance; JSON grants no authority. */
export const REMOTE_LIMITS = Object.freeze({ text: 256, path: 512, reasons: 64, evidence: 64,
  heads: 16, observations: 32, members: 64, payloadBytes: 65536, outputBytes: 1048576, archiveBytes: 16777216 })
const text = z.string().min(1).max(REMOTE_LIMITS.text).refine(isValidUnicode)
  .refine(value => !/[\x00-\x1f\x7f-\x9f]/.test(value))
const path = z.string().min(1).max(REMOTE_LIMITS.path).refine(isValidUnicode)
  .refine(value => !/[\x00-\x1f\x7f-\x9f\\]/.test(value) && !/^[a-z]:/i.test(value)
    && value.split('/').every(part => part !== '' && part !== '.' && part !== '..'))
const positive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const size = (maximum: number) => z.number().int().min(0).max(maximum).refine(value => !Object.is(value, -0))
const blob = (maximum: number) => z.strictObject({ path, sha256: DigestSchema, bytes: size(maximum) })
const evidenceBlob = blob(REMOTE_LIMITS.archiveBytes)
const evidence = z.array(evidenceBlob).min(1).max(REMOTE_LIMITS.evidence)
const reason = text.max(128)
const reasons = z.array(reason).min(1).max(REMOTE_LIMITS.reasons)
// Explicit unions retain required fields despite the repository's non-strict null mode.
export type RemoteReadResult<T> = { kind: 'found'; value: T } | { kind: 'absent'; evidence: BlobRef[] }
  | { kind: 'unknown'; reasons: string[] }
export type ReadResult<T> = RemoteReadResult<T>
export const readResultSchema = <T>(schema: z.ZodType<T>): z.ZodType<RemoteReadResult<T>> => z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('found'), value: schema }),
  z.strictObject({ kind: z.literal('absent'), evidence }),
  z.strictObject({ kind: z.literal('unknown'), reasons }),
]) as z.ZodType<RemoteReadResult<T>>
export type Decision = { status: 'accepted'; evidence: BlobRef[] } | { status: 'hold'; reasons: string[] }
export const DecisionSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('accepted'), evidence }), z.strictObject({ status: z.literal('hold'), reasons }),
]) as z.ZodType<Decision>
const ReadObservationSchema = z.strictObject({ status: z.enum(['success', 'not-found', 'forbidden', 'rate-limited', 'server-error', 'timeout', 'graphql-error']),
  repositoryReadable: z.boolean(), endpointScopeVerified: z.boolean(), paginationComplete: z.boolean(),
  exactInventoryMatches: size(REMOTE_LIMITS.observations), value: z.unknown(), evidence: z.array(evidenceBlob).max(REMOTE_LIMITS.evidence) })
/** A 404 alone cannot establish absence. No transport exceptions or raw diagnostics enter here. */
export function classifyRemoteRead(input: unknown): RemoteReadResult<unknown> {
  const parsed = ReadObservationSchema.safeParse(input)
  if (!parsed.success || !Object.prototype.hasOwnProperty.call(input, 'value')) return { kind: 'unknown', reasons: ['READ_MALFORMED'] }
  const value = parsed.data
  if (!value.repositoryReadable || !value.endpointScopeVerified || !value.paginationComplete || !value.evidence.length)
    return { kind: 'unknown', reasons: ['READ_UNAUTHENTICATED_OR_INCOMPLETE'] }
  if (value.exactInventoryMatches > 1) return { kind: 'unknown', reasons: ['READ_AMBIGUOUS'] }
  if (value.status === 'success' && value.exactInventoryMatches === 1 && value.value != null)
    return { kind: 'found', value: value.value }
  if (value.status === 'not-found' && value.exactInventoryMatches === 0 && value.value === null)
    return { kind: 'absent', evidence: value.evidence as BlobRef[] }
  return { kind: 'unknown', reasons: ['READ_NOT_ESTABLISHED'] }
}
const identityFields = { actorId: positive, workflowId: positive, workflowPath: path, workflowDefinitionSha256: DigestSchema }
// The validator is always dispatched; the producer may be a scheduled upstream-update run.
const producerEvent = z.enum(['workflow_dispatch', 'schedule'])
const IdentitySchema = z.strictObject({ ...identityFields, event: z.literal('workflow_dispatch') })
const ProducerIdentitySchema = z.strictObject({ ...identityFields, event: producerEvent })
export const RemotePolicySchema = z.strictObject({ host: z.literal('github.com'), repositoryId: positive, repositoryFullName: path,
  baseRef: z.literal('master'), writerActorId: positive, sealIdentity: z.strictObject({ scheme: z.literal('github-app-author-v1'), platformSignerActorId: positive }), allowedHeadPrefixes: z.array(text).min(1).max(16), checkAppId: positive,
  checkName: text, producerArtifactName: text, validatorArtifactName: text, producer: ProducerIdentitySchema, validator: IdentitySchema })
export interface RemotePolicy extends Required<z.infer<typeof RemotePolicySchema>> {}
export const ExactValidationExpectedSchema = z.strictObject({ repositoryId: positive, prNumber: positive, branch: text,
  base: GitShaSchema, seal: GitShaSchema, master: GitShaSchema, dev: GitShaSchema, tools: GitShaSchema,
  unitKey: text, planSha256: DigestSchema, proofSha256: DigestSchema, transactionId: DigestSchema,
  preparedBase: GitShaSchema, candidate: GitShaSchema, candidateTree: GitTreeOidSchema,
  previousSeal: GitShaSchema.nullable(), preservedHumanHeads: z.array(GitShaSchema).max(REMOTE_LIMITS.heads),
  requestId: text, validatorRunId: positive, validatorRunAttempt: positive,
  producerRequestId: text, producerRunId: positive, producerRunAttempt: positive })
export interface ExactValidationExpected extends Required<z.infer<typeof ExactValidationExpectedSchema>> {}
const sealShape = { repositoryId: positive, transactionId: DigestSchema, unitKey: text, planSha256: DigestSchema,
  proofSha256: DigestSchema, master: GitShaSchema, dev: GitShaSchema, preparedBase: GitShaSchema,
  candidate: GitShaSchema, candidateTree: GitTreeOidSchema, previousSeal: GitShaSchema.nullable(),
  preservedHumanHeads: z.array(GitShaSchema).max(REMOTE_LIMITS.heads), runId: positive, runAttempt: positive }
export const RemoteSealV1Schema = z.strictObject({ kind: z.literal('shared-update-seal'), schemaVersion: z.literal(1), ...sealShape })
export interface RemoteSealV1 extends Required<z.infer<typeof RemoteSealV1Schema>> {}
const targetShape = { targetCheckId: positive, targetSuiteId: positive, targetCheckAppId: positive, targetCheckHead: GitShaSchema }
export const ExactValidationReceiptV1Schema = z.strictObject({ kind: z.literal('shared-update-exact-validation'), schemaVersion: z.literal(1),
  repositoryId: positive, prNumber: positive, head: GitShaSchema, master: GitShaSchema, dev: GitShaSchema,
  tools: GitShaSchema, unitKey: text, planSha256: DigestSchema, seal: GitShaSchema, requestId: text,
  runId: positive, runAttempt: positive, workflowPath: path, workflowDefinitionSha256: DigestSchema,
  ...targetShape, outputDigest: DigestSchema, conclusion: text })
export interface ExactValidationReceiptV1 extends Required<z.infer<typeof ExactValidationReceiptV1Schema>> {}
const runShape = { id: positive, attempt: positive, repositoryId: positive, headRepositoryId: positive,
  ...IdentitySchema.shape, toolingHead: GitShaSchema, status: text, conclusion: text, evidence }
const producerRunShape = { id: positive, attempt: positive, repositoryId: positive, headRepositoryId: positive,
  ...ProducerIdentitySchema.shape, toolingHead: GitShaSchema, status: text, conclusion: text, evidence }
export const ProducerRunFactSchema = z.strictObject(producerRunShape)
export const ValidatorRunFactSchema = z.strictObject({ ...runShape, workflowSuiteId: positive, workflowSuiteHead: GitShaSchema })
export const ArtifactFactSchema = z.strictObject({ id: positive, name: text, runId: positive, runAttempt: positive,
  expired: z.boolean(), archiveApiDigest: DigestSchema, archiveActualDigest: DigestSchema,
  archive: blob(REMOTE_LIMITS.archiveBytes) })
/** The trusted adapter authenticates unique membership and safe extraction, never this pure function. */
export const ArtifactMemberFactSchema = z.strictObject({ artifactId: positive, archiveDigest: DigestSchema,
  memberPath: path, actualDigest: DigestSchema, member: blob(REMOTE_LIMITS.outputBytes) })
export const ProducerProvenanceFactSchema = z.strictObject({ ...sealShape, seal: GitShaSchema, requestId: text,
  receipt: blob(REMOTE_LIMITS.payloadBytes), artifactId: positive, memberPath: path })
export const ValidationCheckAssociationFactSchema = z.strictObject({ repositoryId: positive, runId: positive,
  runAttempt: positive, requestId: text, ...targetShape, receipt: blob(REMOTE_LIMITS.payloadBytes), artifactId: positive, memberPath: path })
const collection = <T>(schema: z.ZodType<T>) => readResultSchema(z.array(schema).max(REMOTE_LIMITS.observations))
export const RemoteFactsSchema = z.strictObject({ host: z.literal('github.com'), repositoryId: positive, repositoryFullName: path,
  pr: ObservedPrSchema.refine(value => z.array(evidenceBlob).max(REMOTE_LIMITS.evidence).safeParse(value.metadataEvidence).success), baseRepositoryId: positive, headRepositoryId: positive, baseRef: text, headRef: text,
  master: GitShaSchema, dev: GitShaSchema, evidence,
  producerRuns: collection(ProducerRunFactSchema), validatorRuns: collection(ValidatorRunFactSchema),
  producerProvenance: collection(ProducerProvenanceFactSchema), associations: collection(ValidationCheckAssociationFactSchema),
  checks: collection(z.strictObject({ id: positive, name: text, appId: positive, suiteId: positive, head: GitShaSchema,
    status: text, conclusion: text, evidence })), artifacts: collection(ArtifactFactSchema),
  members: readResultSchema(z.array(ArtifactMemberFactSchema).max(REMOTE_LIMITS.members)),
  seal: readResultSchema(z.strictObject({ oid: GitShaSchema, parents: z.array(GitShaSchema).max(2), tree: GitTreeOidSchema,
    signatureValid: z.boolean(), signatureState: z.literal('VALID'), wasSignedByGitHub: z.boolean(),
    signerActorId: positive.nullable(), authorActorId: positive.nullable(), writerAttribution: z.strictObject({ role: z.literal('author'), actorId: positive }), metadata: RemoteSealV1Schema, evidence })),
  output: blob(REMOTE_LIMITS.outputBytes) })
export interface RemoteFacts extends Required<z.infer<typeof RemoteFactsSchema>> {}
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const equal = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))

/** Pure consistency decision. Receipt bytes are bounded, strict canonical JSON; no credential/capability is created. */
export function acceptExactValidation(expected: unknown, apiFacts: unknown, receipt: unknown, policy: unknown): Decision {
  return checkExactValidation(expected, apiFacts, receipt, policy, 'completed')
}

/** Read-only decision before completing the specific Check reserved by the validator. */
export function inspectReservedValidation(expected: unknown, apiFacts: unknown, receipt: unknown, policy: unknown):
  { status: 'ready-to-publish'; evidence: BlobRef[] } | { status: 'hold'; reasons: string[] } {
  const decision = checkExactValidation(expected, apiFacts, receipt, policy, 'in_progress')
  if (decision.status === 'hold') return decision
  return { status: 'ready-to-publish', evidence: decision.evidence }
}

function checkExactValidation(expected: unknown, apiFacts: unknown, receipt: unknown, policy: unknown,
  checkStatus: 'completed' | 'in_progress'): Decision {
  const e = ExactValidationExpectedSchema.safeParse(expected), f = RemoteFactsSchema.safeParse(apiFacts), p = RemotePolicySchema.safeParse(policy)
  const failures: string[] = []
  if (!e.success) failures.push('EXPECTED_MALFORMED')
  if (!f.success) failures.push('FACTS_MALFORMED')
  if (!p.success) failures.push('POLICY_MALFORMED')
  let r: ExactValidationReceiptV1
  try {
    if (!(receipt instanceof Uint8Array) || receipt.length > REMOTE_LIMITS.payloadBytes) throw new Error()
    const parsed = ExactValidationReceiptV1Schema.parse(parseStrictJson(receipt))
    if (!Buffer.from(receipt).equals(Buffer.from(canonicalBytes(parsed)))) throw new Error()
    r = parsed as ExactValidationReceiptV1
  } catch { failures.push('RECEIPT_MALFORMED') }
  if (!e.success || !f.success || !p.success || failures.length) return { status: 'hold', reasons: failures }
  const intent = e.data, facts = f.data, rules = p.data
  const checkBinding = (condition: unknown, code: string) => { if (!condition && !failures.includes(code)) failures.push(code) }
  const matches = (actual: object, wanted: object, prefix: string) => {
    for (const [key, value] of Object.entries(wanted)) checkBinding(equal((actual as Record<string, unknown>)[key], value), `${prefix}_${key.toUpperCase()}`)
  }
  matches(facts, { host: rules.host, repositoryId: rules.repositoryId, repositoryFullName: rules.repositoryFullName,
    baseRepositoryId: rules.repositoryId, headRepositoryId: rules.repositoryId, baseRef: rules.baseRef,
    headRef: intent.branch, master: intent.master, dev: intent.dev }, 'REMOTE')
  checkBinding(intent.repositoryId === rules.repositoryId, 'EXPECTED_REPOSITORYID')
  checkBinding(intent.tools === intent.master, 'EXPECTED_TOOLS')
  checkBinding(intent.base === intent.master, 'EXPECTED_BASE')
  checkBinding(rules.allowedHeadPrefixes.some(prefix => intent.branch.startsWith(prefix)), 'BRANCH_POLICY')
  matches(facts.pr, { repositoryId: rules.repositoryId, number: intent.prNumber, base: intent.base,
    head: intent.seal, state: 'open', draft: true, actorId: rules.writerActorId }, 'PR')
  matches(r, { repositoryId: intent.repositoryId, prNumber: intent.prNumber, head: intent.seal, seal: intent.seal,
    master: intent.master, dev: intent.dev, tools: intent.tools, unitKey: intent.unitKey, planSha256: intent.planSha256,
    requestId: intent.requestId, runId: intent.validatorRunId, runAttempt: intent.validatorRunAttempt,
    workflowPath: rules.validator.workflowPath, workflowDefinitionSha256: rules.validator.workflowDefinitionSha256,
    targetCheckAppId: rules.checkAppId, targetCheckHead: intent.seal, outputDigest: facts.output.sha256, conclusion: 'success' }, 'RECEIPT')
  const found = <T>(value: RemoteReadResult<T>, code: string): T | undefined => {
    if (value.kind !== 'found') { checkBinding(false, code); return undefined }
    return value.value
  }
  const one = <T>(values: T[] | undefined, predicate: (value: T) => boolean, code: string): T | undefined => {
    if (!values) return undefined
    const selected = values.filter(predicate)
    checkBinding(selected.length === 1, code)
    return selected.length === 1 ? selected[0] : undefined
  }
  const producer = one(found(facts.producerRuns, 'PRODUCER_READ'), run => run.id === intent.producerRunId, 'PRODUCER_AMBIGUOUS_OR_MISSING')
  const validator = one(found(facts.validatorRuns, 'VALIDATOR_READ'), run => run.id === intent.validatorRunId, 'VALIDATOR_AMBIGUOUS_OR_MISSING')
  if (producer) matches(producer, { ...rules.producer, id: intent.producerRunId, attempt: intent.producerRunAttempt,
    repositoryId: rules.repositoryId, headRepositoryId: rules.repositoryId, toolingHead: intent.master,
    status: 'completed', conclusion: 'success' }, 'PRODUCER')
  if (validator) matches(validator, { ...rules.validator, id: intent.validatorRunId, attempt: intent.validatorRunAttempt,
    repositoryId: rules.repositoryId, headRepositoryId: rules.repositoryId, toolingHead: intent.master,
    workflowSuiteHead: intent.master, status: 'completed', conclusion: 'success' }, 'VALIDATOR')
  const seal = found(facts.seal, 'SEAL_READ')
  const sealExpected = { repositoryId: intent.repositoryId, transactionId: intent.transactionId, unitKey: intent.unitKey,
    planSha256: intent.planSha256, proofSha256: intent.proofSha256, master: intent.master, dev: intent.dev,
    preparedBase: intent.preparedBase, candidate: intent.candidate, candidateTree: intent.candidateTree,
    previousSeal: intent.previousSeal, preservedHumanHeads: intent.preservedHumanHeads,
    runId: intent.producerRunId, runAttempt: intent.producerRunAttempt }
  if (seal) {
    matches(seal, { oid: intent.seal, parents: [intent.candidate], tree: intent.candidateTree,
      signatureValid: true, signatureState: 'VALID', wasSignedByGitHub: true, authorActorId: rules.writerActorId, signerActorId: rules.sealIdentity.platformSignerActorId, writerAttribution: { role: 'author', actorId: rules.writerActorId } }, 'SEAL')
    matches(seal.metadata, sealExpected, 'SEAL_METADATA')
    checkBinding(canonicalBytes(seal.metadata).length <= REMOTE_LIMITS.payloadBytes, 'SEAL_SIZE')
  }
  const provenance = one(found(facts.producerProvenance, 'PROVENANCE_READ'), value => value.runId === intent.producerRunId, 'PROVENANCE_AMBIGUOUS_OR_MISSING')
  if (provenance) matches(provenance, { ...sealExpected, seal: intent.seal, requestId: intent.producerRequestId }, 'PROVENANCE')
  const association = one(found(facts.associations, 'ASSOCIATION_READ'), value => value.runId === intent.validatorRunId, 'ASSOCIATION_AMBIGUOUS_OR_MISSING')
  if (association) matches(association, { repositoryId: intent.repositoryId, runId: intent.validatorRunId,
    runAttempt: intent.validatorRunAttempt, requestId: intent.requestId, targetCheckId: r.targetCheckId,
    targetSuiteId: r.targetSuiteId, targetCheckAppId: rules.checkAppId, targetCheckHead: intent.seal,
    receipt: { ...association.receipt, sha256: hash(receipt as Uint8Array), bytes: (receipt as Uint8Array).length } }, 'ASSOCIATION')
  const check = one(found(facts.checks, 'CHECK_READ'), value => value.id === r.targetCheckId, 'CHECK_AMBIGUOUS_OR_MISSING')
  if (check) matches(check, { name: rules.checkName, appId: rules.checkAppId, suiteId: r.targetSuiteId,
    head: intent.seal, status: checkStatus, conclusion: checkStatus === 'completed' ? 'success' : 'pending' }, 'CHECK')
  const artifacts = found(facts.artifacts, 'ARTIFACT_READ'), members = found(facts.members, 'MEMBER_READ')
  const bindArtifact = (owner: { artifactId?: number; memberPath?: string; receipt?: BlobRef }, runId: number, runAttempt: number, name: string, code: string) => {
    const artifact = one(artifacts, value => value.runId === runId && value.name === name, `${code}_ARTIFACT_AMBIGUOUS_OR_MISSING`)
    if (!artifact) return
    matches(artifact, { id: owner.artifactId, runAttempt, expired: false, archiveActualDigest: artifact.archiveApiDigest }, `${code}_ARTIFACT`)
    checkBinding(artifact.archive.sha256 === artifact.archiveApiDigest, `${code}_ARCHIVE_DIGEST`)
    const member = one(members, value => value.artifactId === artifact.id && value.memberPath === owner.memberPath, `${code}_MEMBER_AMBIGUOUS_OR_MISSING`)
    if (member) matches(member, { archiveDigest: artifact.archiveApiDigest, actualDigest: owner.receipt.sha256,
      member: owner.receipt }, `${code}_MEMBER`)
  }
  if (provenance) bindArtifact(provenance, intent.producerRunId, intent.producerRunAttempt, rules.producerArtifactName, 'PRODUCER')
  if (association) bindArtifact(association, intent.validatorRunId, intent.validatorRunAttempt, rules.validatorArtifactName, 'VALIDATOR')
  if (failures.length) return { status: 'hold', reasons: failures.slice(0, REMOTE_LIMITS.reasons) }
  // Retain the complete observation references. Deduplication must not hide conflicting identities.
  const retained: BlobRef[] = [...facts.evidence as BlobRef[], ...facts.pr.metadataEvidence, ...producer.evidence as BlobRef[],
    ...validator.evidence as BlobRef[], ...seal.evidence as BlobRef[], ...check.evidence as BlobRef[], provenance.receipt, association.receipt, facts.output as BlobRef,
    ...artifacts.map(value => value.archive as BlobRef), ...members.map(value => value.member as BlobRef)]
  const unique = new Map<string, BlobRef>()
  for (const ref of retained) {
    const previous = unique.get(ref.path)
    if (previous && !equal(previous, ref)) return { status: 'hold', reasons: ['EVIDENCE_CONFLICT'] }
    unique.set(ref.path, { ...ref })
  }
  if (unique.size > REMOTE_LIMITS.evidence) return { status: 'hold', reasons: ['EVIDENCE_LIMIT'] }
  return { status: 'accepted', evidence: [...unique.values()].sort((a, b) => compareUtf8(a.path, b.path)) }
}

/** Raw read observations. These schemas are consistency only; adapter membership is private. */
export const RemoteRepositorySchema = z.strictObject({ id: positive, fullName: path, evidence })
export const RemoteRefSchema = z.strictObject({ ref: text, oid: GitShaSchema, evidence })
export const RemotePullSchema = z.strictObject({ number: positive, repositoryId: positive, baseRepositoryId: positive,
  headRepositoryId: positive, baseRef: text, headRef: text, base: GitShaSchema, head: GitShaSchema,
  actorId: positive, state: z.enum(['open','closed','merged']), draft: z.boolean(), createdAt: z.iso.datetime(), evidence })
export const RemoteCommitSchema = z.strictObject({ oid: GitShaSchema, tree: GitTreeOidSchema,
  parents: z.array(GitShaSchema).max(2), authorActorId: positive.nullable(), committerActorId: positive.nullable(),
  signerActorId: positive.nullable(), signatureValid: z.boolean(), signatureState: text,
  wasSignedByGitHub: z.boolean(), payload: z.string().max(REMOTE_LIMITS.payloadBytes * 2).nullable(),
  signature: z.string().max(16384).nullable(), evidence })
export const ApprovedProducerDefinitionSchema = z.strictObject({ tools: GitShaSchema, ...ProducerIdentitySchema.shape,
  protocol: z.literal('shared-update-producer-v1') })
export const ProducerBundleReceiptSchema = z.strictObject({ kind: z.literal('shared-update-producer'), schemaVersion: z.literal(1),
  ...sealShape, seal: GitShaSchema, requestId: text, tools: GitShaSchema, workflowDefinitionSha256: DigestSchema,
  members: z.array(z.strictObject({ name: path, sha256: DigestSchema, bytes: size(REMOTE_LIMITS.outputBytes) })).max(63) })
export type RemoteRepository = Required<z.infer<typeof RemoteRepositorySchema>>
export type RemoteRef = Required<z.infer<typeof RemoteRefSchema>>
export type RemotePull = Required<z.infer<typeof RemotePullSchema>>
export type RemoteCommit = Required<z.infer<typeof RemoteCommitSchema>>
export type ApprovedProducerDefinition = Required<z.infer<typeof ApprovedProducerDefinitionSchema>>
export type ProducerBundleReceipt = Required<z.infer<typeof ProducerBundleReceiptSchema>>
export const REMOTE_IO_LIMITS = Object.freeze({ jsonBytes: 1048576, pages: 20, pageSize: 100, calls: 512,
  requestMilliseconds: 30000, inspectionMilliseconds: 120000, expandedBytes: 16777216, objectBytes: 67108864 })
export function githubSealMessage(value: RemoteSealV1): {headline: string; body: string} {
  const bytes = canonicalBytes(RemoteSealV1Schema.parse(value))
  if (bytes.length > REMOTE_LIMITS.payloadBytes) throw new Error('SEAL_LIMIT')
  return { headline: 'Seal shared update', body: `Shared-Update-Seal: v1.${Buffer.from(bytes).toString('base64url')}` }
}
export function encodeSealMessage(value: RemoteSealV1): string {
  const { headline, body } = githubSealMessage(value)
  return `${headline}\n\n${body}\n`
}
export function hasSealTrailer(bytes: Uint8Array): boolean {
  if (bytes.length > REMOTE_LIMITS.payloadBytes * 2) throw new Error('SEAL_LIMIT')
  return /shared-update-seal[ \t]*:/i.test(new TextDecoder('utf8', {fatal: true, ignoreBOM: true}).decode(bytes))
}
export function parseSealMessage(bytes: Uint8Array): RemoteSealV1 | null {
  if (!hasSealTrailer(bytes)) return null
  const source = Buffer.from(bytes)
  const match = /^Seal shared update\n\nShared-Update-Seal: v1\.([A-Za-z0-9_-]+)\n$/.exec(source.toString('utf8'))
  if (!match) throw new Error('SEAL_MESSAGE_INVALID')
  const parsed = RemoteSealV1Schema.parse(parseStrictJson(Buffer.from(match[1], 'base64url'))) as RemoteSealV1
  if (!source.equals(Buffer.from(encodeSealMessage(parsed)))) throw new Error('SEAL_MESSAGE_INVALID')
  return parsed
}
/** After authentication of the original signed Git object, accept GitHub's framing without its terminal LF. */
export function parseSignedGitHubSealMessage(bytes: Uint8Array): RemoteSealV1 | null {
  if (bytes.length > REMOTE_LIMITS.payloadBytes * 2) throw new Error('SEAL_LIMIT')
  if (bytes[bytes.length - 1] === 0x0a) return parseSealMessage(bytes)
  return parseSealMessage(Buffer.concat([bytes, Buffer.from('\n')]))
}

/** Frozen request identity, never authority. Mutable observations belong in a separate journal. */
const transactionBranch = text.regex(/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)+$/)
export const RemoteTransactionIntentSchema = z.strictObject({
  kind: z.literal('shared-update-remote-intent'), schemaVersion: z.literal(1),
  repositoryId: positive, repositoryFullName: path, master: GitShaSchema, dev: GitShaSchema,
  transactionId: DigestSchema, unitKey: text, planSha256: DigestSchema, proofSha256: DigestSchema, plan: blob(REMOTE_LIMITS.outputBytes), proof: blob(REMOTE_LIMITS.outputBytes),
  preparedBase: GitShaSchema, candidate: GitShaSchema, candidateTree: GitTreeOidSchema,
  previousSeal: GitShaSchema.nullable(), preservedHumanHeads: z.array(GitShaSchema).max(REMOTE_LIMITS.heads),
  targetRef: transactionBranch, expectedHead: GitShaSchema.nullable(), stagingRef: transactionBranch,
  pulls: z.array(z.strictObject({ number: positive, head: GitShaSchema, headRef: transactionBranch,
    createdAt: z.iso.datetime(), state: z.enum(['open','closed']) })).max(REMOTE_LIMITS.heads),
  producerRunId: positive, producerRunAttempt: positive, producerRequestId: text,
  requestId: text,
}).superRefine((value, context) => {
  if (value.stagingRef !== `shared-update-staging/${value.transactionId}` || value.targetRef === value.stagingRef)
    context.addIssue({code:'custom',message:'Transaction ref identity'})
  if (new Set(value.pulls.map(pull=>pull.number)).size !== value.pulls.length || new Set(value.preservedHumanHeads).size !== value.preservedHumanHeads.length)
    context.addIssue({code:'custom',message:'Duplicate transaction heads'})
})
export type RemoteTransactionIntent = Required<z.infer<typeof RemoteTransactionIntentSchema>>
export const RemoteTransactionJournalSchema = z.strictObject({ kind:z.literal('shared-update-remote-journal'),schemaVersion:z.literal(1),
  intentSha256:DigestSchema,transactionId:DigestSchema,sequence:size(2048),phase:z.enum(['before','after','hold','reconcile']),
  action:text,observation:blob(REMOTE_LIMITS.archiveBytes).nullable(),reasons:z.array(reason).max(REMOTE_LIMITS.reasons) })
