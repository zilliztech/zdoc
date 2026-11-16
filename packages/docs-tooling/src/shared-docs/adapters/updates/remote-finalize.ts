import type { BlobRef } from '../../core/updates/envelope'
import { parseStrictJson } from '../../core/updates/canonical'
import { acceptExactValidation, ExactValidationReceiptV1Schema, inspectReservedValidation } from '../../core/updates/remote'
import type { CheckRunObservation, RemoteReads, ReservedCheck } from './remote-github'

export interface TargetCheckFinalize {
  status: 'accepted' | 'hold'
  reasons?: string[]
  evidence?: BlobRef[]
  completed?: { id: number; suiteId: number }
}

export interface CheckCompleteWriter {
  complete(input: { reservation: ReservedCheck; headSha: string }): Promise<CheckRunObservation>
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
  policy: { checkAppId: number; checkName: string }
  receipt: Uint8Array
  facts: unknown
}): Promise<TargetCheckFinalize> {
  const seal = input.expected.seal
  const receipt = ExactValidationReceiptV1Schema.parse(parseStrictJson(input.receipt))
  const checks = await input.reads.readChecks(seal)
  if (checks.kind !== 'found') return { status: 'hold', reasons: ['CHECK_READ'] }
  const matches = checks.value.filter(ch => ch.appId === input.policy.checkAppId && ch.name === input.policy.checkName && ch.head === seal)
  if (matches.length !== 1) return { status: 'hold', reasons: ['CHECK_AMBIGUOUS_OR_MISSING'] }
  const reserved = matches[0]
  // Bind the read-back Check to the authenticated receipt before any write.
  if (reserved.id !== receipt.targetCheckId || reserved.suiteId !== receipt.targetSuiteId ||
      reserved.appId !== receipt.targetCheckAppId || reserved.head !== receipt.targetCheckHead) {
    return { status: 'hold', reasons: ['CHECK_RECEIPT_BINDING'] }
  }
  if (reserved.status !== 'in_progress') return { status: 'hold', reasons: ['CHECK_NOT_RESERVED'] }
  // prepublish validates the same read-back Check the writer will complete.
  const withCheck = { ...(input.facts as Record<string, unknown>), checks: { kind: 'found', value: [reserved] } }
  const prepublish = inspectReservedValidation(input.expected as unknown, withCheck, input.receipt, input.policy as unknown)
  if (prepublish.status !== 'ready-to-publish') return { status: 'hold', reasons: prepublish.reasons }
  const reservation: ReservedCheck = { id: reserved.id, suiteId: reserved.suiteId, appId: reserved.appId, name: reserved.name, head: reserved.head }
  const completed = await input.writer.complete({ reservation, headSha: seal })
  const after = await input.reads.readChecks(seal)
  if (after.kind !== 'found' || !after.value.some(ch => ch.id === completed.id && ch.status === 'completed' && ch.conclusion === 'success')) {
    return { status: 'hold', reasons: ['CHECK_READBACK'] }
  }
  const accept = acceptExactValidation(input.expected as unknown, { ...(input.facts as Record<string, unknown>), checks: after }, input.receipt, input.policy as unknown)
  if (accept.status !== 'accepted') return { status: 'hold', reasons: accept.reasons }
  return { status: 'accepted', evidence: accept.evidence, completed: { id: completed.id, suiteId: completed.suiteId } }
}
