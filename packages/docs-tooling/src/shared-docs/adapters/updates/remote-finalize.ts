import { createHash } from 'node:crypto'
import type { BlobRef } from '../../core/updates/envelope'
import { canonicalBytes, parseStrictJson } from '../../core/updates/canonical'
import { acceptExactValidation, ApprovedProducerDefinitionSchema, ExactValidationReceiptV1Schema, inspectReservedValidation, RemotePolicySchema,
  type ApprovedProducerDefinition, type RemotePolicy } from '../../core/updates/remote'
import type { CheckRunObservation, RemoteReads, ReservedCheck } from './remote-github'

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

export interface TargetCheckFinalize {
  status: 'accepted' | 'hold'
  reasons?: string[]
  evidence?: BlobRef[]
  completed?: { id: number; suiteId: number }
}

export interface CheckCompleteWriter {
  complete(input: { reservation: ReservedCheck; headSha: string }): Promise<CheckRunObservation>
}

export interface CheckReserveWriter {
  reserve(input: { headSha: string }): Promise<ReservedCheck>
}

export interface TargetCheckRegistration {
  status: 'ready'
  policy: RemotePolicy
  producers: ApprovedProducerDefinition[]
  finalizer: RemotePolicy['validator']
}
export type TargetCheckRegistrationResult = TargetCheckRegistration | { status: 'held'; reasons: string[] }

/** Load and validate the reviewed target-Check registration. Missing or incomplete registration
 * holds before any write; production identity is never inferred from candidate content. */
export function loadTargetCheckRegistration(registration: unknown, toolingHead?: string): TargetCheckRegistrationResult {
  if (registration === null || typeof registration !== 'object') return { status: 'held', reasons: ['REGISTRATION_MISSING'] }
  const reg = registration as Record<string, unknown>
  if (reg.status !== 'registered') return { status: 'held', reasons: ['REGISTRATION_UNREGISTERED'] }
  try {
    const policy = RemotePolicySchema.parse(reg.policy)
    const finalizer = RemotePolicySchema.shape.validator.parse(reg.finalizer)
    const producers = toolingHead === undefined
      ? (reg.producers as unknown[]).map(value => ApprovedProducerDefinitionSchema.parse(value))
      : [ApprovedProducerDefinitionSchema.parse({tools: toolingHead, ...policy.producer, protocol:'shared-update-producer-v1'})]
    if ([policy.producer,policy.validator,finalizer].some(value => /^0+$/.test(value.workflowDefinitionSha256))) return { status:'held', reasons:['REGISTRATION_INCOMPLETE'] }
    if (producers.length !== 1) return { status: 'held', reasons: ['REGISTRATION_INCOMPLETE'] }
    return { status: 'ready', policy, producers, finalizer }
  } catch {
    return { status: 'held', reasons: ['REGISTRATION_INCOMPLETE'] }
  }
}

/** Finalizer entry: load the reviewed registration (held when missing), then finalize the target
 * Check against independently supplied facts. The low-level finalizeTargetCheck enforces the
 * read-back reservation, receipt binding and ready prepublish before any completion write. */
export async function finalizeTargetCheckEntry(input: {
  registration: unknown
  reads: Pick<RemoteReads, 'readChecks'>
  writer: CheckCompleteWriter
  expected: { seal: string }
  receipt: Uint8Array
  facts: unknown
}): Promise<TargetCheckFinalize> {
  const registration = loadTargetCheckRegistration(input.registration)
  if (registration.status === 'held') return { status: 'hold', reasons: registration.reasons }
  return finalizeTargetCheck({
    reads: input.reads, writer: input.writer, expected: input.expected,
    policy: registration.policy,
    receipt: input.receipt, facts: input.facts,
  })
}

/** Validator entry: load the reviewed registration (held when missing), independently authenticate
 * the producer/seal/freshness before any write, reserve the in_progress Check on the authenticated
 * seal, then encode and archive the receipt/output bound to the read-back Check. */
export async function validateTargetCheckEntry(input: {
  registration: unknown
  authenticate: () => Promise<{ headSha: string } | { status: 'hold'; reasons: string[] }>
  writer: CheckReserveWriter
  encodeReceipt: (reservation: ReservedCheck) => { receipt: Uint8Array; output: Uint8Array }
  archive: (members: { name: string; bytes: Uint8Array }[]) => Promise<void>
}): Promise<{ status: 'prepared'; reservation: ReservedCheck } | { status: 'hold'; reasons: string[] }> {
  const registration = loadTargetCheckRegistration(input.registration)
  if (registration.status === 'held') return { status: 'hold', reasons: registration.reasons }
  const authenticated = await input.authenticate()
  if ('reasons' in authenticated) return { status: 'hold', reasons: authenticated.reasons }
  const reservation = await input.writer.reserve({ headSha: authenticated.headSha })
  const { receipt, output } = input.encodeReceipt(reservation)
  // The archived receipt must be a valid, canonical ExactValidationReceiptV1 bound to the reserved
  // Check and App, with the output digest matching; arbitrary bytes never reach the archive.
  const parsed = (() => { try { return ExactValidationReceiptV1Schema.safeParse(parseStrictJson(receipt)) } catch { return { success: false as const } } })()
  if (!parsed.success || !Buffer.from(receipt).equals(canonicalBytes(parsed.data))) return { status: 'hold', reasons: ['RECEIPT_INVALID'] }
  if (parsed.data.targetCheckId !== reservation.id || parsed.data.targetSuiteId !== reservation.suiteId ||
      parsed.data.targetCheckAppId !== registration.policy.checkAppId ||
      parsed.data.targetCheckHead !== authenticated.headSha) return { status: 'hold', reasons: ['RECEIPT_BINDING'] }
  if (sha256(output) !== parsed.data.outputDigest) return { status: 'hold', reasons: ['RECEIPT_OUTPUT_DIGEST'] }
  await input.archive([{ name: 'receipt.json', bytes: receipt }, { name: 'output.json', bytes: output }])
  return { status: 'prepared', reservation }
}

/** Finalizer for the target Check. The reserved Check is read back independently through readChecks,
 * bound to the authenticated receipt's targetCheckId/suite/App/head, and must still be in_progress.
 * prepublish is run against the same read-back Check, and completion is authorized only after
 * ready-to-publish. A decoded JSON reservation never reaches the writer: only the read-back Check
 * id/suite/App/name/head plus a ready prepublish gates the single PATCH. The completed Check is
 * then re-read and acceptExactValidation runs against the completed phase. */
export async function finalizeTargetCheck(input: {
  reads: Pick<RemoteReads, 'readChecks'>
  writer: CheckCompleteWriter
  expected: { seal: string }
  policy: unknown
  receipt: Uint8Array
  facts: unknown
}): Promise<TargetCheckFinalize> {
  const seal = input.expected.seal
  const checkAppId = (input.policy as { checkAppId: number }).checkAppId
  const checkName = (input.policy as { checkName: string }).checkName
  const receipt = ExactValidationReceiptV1Schema.parse(parseStrictJson(input.receipt))
  const checks = await input.reads.readChecks(seal)
  if (checks.kind !== 'found') return { status: 'hold', reasons: ['CHECK_READ'] }
  const matches = checks.value.filter(ch => ch.appId === checkAppId && ch.name === checkName && ch.head === seal)
  if (matches.length !== 1) return { status: 'hold', reasons: ['CHECK_AMBIGUOUS_OR_MISSING'] }
  const reserved = matches[0]
  // Bind the read-back Check to the authenticated receipt before any write.
  if (reserved.id !== receipt.targetCheckId || reserved.suiteId !== receipt.targetSuiteId ||
      reserved.appId !== receipt.targetCheckAppId || reserved.head !== receipt.targetCheckHead) {
    return { status: 'hold', reasons: ['CHECK_RECEIPT_BINDING'] }
  }
  if (reserved.status !== 'in_progress') return { status: 'hold', reasons: ['CHECK_NOT_RESERVED'] }
  // prepublish validates the same read-back Check the writer will complete.
  const withCheck = { ...(input.facts as Record<string, unknown>), checks: { kind: 'found', value: [frozenCheck(reserved)] } }
  const prepublish = inspectReservedValidation(input.expected as unknown, withCheck, input.receipt, input.policy)
  if (prepublish.status !== 'ready-to-publish') return { status: 'hold', reasons: prepublish.reasons }
  const reservation: ReservedCheck = { id: reserved.id, suiteId: reserved.suiteId, appId: reserved.appId, name: reserved.name, head: reserved.head }
  const completed = await input.writer.complete({ reservation, headSha: seal })
  const after = await input.reads.readChecks(seal)
  if (after.kind !== 'found' || !after.value.some(ch => ch.id === completed.id && ch.status === 'completed' && ch.conclusion === 'success')) {
    return { status: 'hold', reasons: ['CHECK_READBACK'] }
  }
  const accept = acceptExactValidation(input.expected as unknown, { ...(input.facts as Record<string, unknown>), checks: {kind:'found',value:after.value.map(frozenCheck)} }, input.receipt, input.policy)
  if (accept.status !== 'accepted') return { status: 'hold', reasons: accept.reasons }
  return { status: 'accepted', evidence: accept.evidence, completed: { id: completed.id, suiteId: completed.suiteId } }
}

function frozenCheck(check: import('./remote-github').RemoteCheck) {
  const {externalId: _externalId,...fact}=check
  return fact
}
