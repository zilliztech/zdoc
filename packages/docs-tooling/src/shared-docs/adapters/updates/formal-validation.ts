// Process boundary for trusted workflows that acquire and authenticate GitHub facts independently.
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod'
import { verifySealSignature } from './verify-seal-signature.mjs'
import { canonicalBytes, digest, parseStrictJson } from '../../core/updates/canonical'
import { GitShaSchema } from '../../core/updates/envelope'
import { acceptExactValidation, encodeSealMessage, githubSealMessage, ExactValidationExpectedSchema, ExactValidationReceiptV1Schema,
  inspectReservedValidation, parseSignedGitHubSealMessage, ProducerBundleReceiptSchema, REMOTE_LIMITS, RemoteSealV1Schema,
  type RemoteSealV1 } from '../../core/updates/remote'

const pins = z.strictObject({ master: GitShaSchema, dev: GitShaSchema, source: GitShaSchema })
type Pins = z.infer<typeof pins>

function freshness(expected: Pins, observed: Pins) {
  const changes = (['master', 'dev', 'source'] as const)
    .filter(field => expected[field] !== observed[field])
    .map(field => ({ field, expected: expected[field], observed: observed[field] }))
  if (changes.length) return { status: 'hold' as const, reasons: changes.map(c => 'STALE_' + c.field.toUpperCase()), changes }
  return { status: 'fresh' as const, pins: expected }
}

function decode(value: unknown, limit: number): Buffer {
  if (typeof value !== 'string' || !value.length || value.length > 4 * Math.ceil(limit / 3)) throw new Error('BYTE_LIMIT')
  const bytes = Buffer.from(value, 'base64')
  if (bytes.length > limit || bytes.toString('base64') !== value) throw new Error('INVALID_BASE64')
  return bytes
}

function encoded(value: unknown) {
  const bytes = canonicalBytes(value)
  if (bytes.length > REMOTE_LIMITS.payloadBytes) throw new Error('PAYLOAD_LIMIT')
  return { status: 'encoded', bytesBase64: Buffer.from(bytes).toString('base64') }
}

function checkInputs(planBase64: unknown, outputBase64: unknown, receipt: {
  planSha256?: string; outputDigest?: string; master?: string; dev?: string
}, observation: unknown) {
  const planBytes = decode(planBase64, REMOTE_LIMITS.outputBytes)
  const plan = parseStrictJson(planBytes)
  if (!planBytes.equals(canonicalBytes(plan)) || digest('plan', plan) !== receipt.planSha256) throw new Error('PLAN_DIGEST')
  // This qualification plan projects one real page onto the private master and source tip.
  const { pins: snapshot } = z.object({ scope: z.literal('private-single-page-projection'), pins }).parse(plan)
  const bytes = decode(outputBase64, REMOTE_LIMITS.outputBytes)
  if (createHash('sha256').update(bytes).digest('hex') !== receipt.outputDigest) throw new Error('OUTPUT_DIGEST')
  const output = parseStrictJson(bytes)
  const report = z.object({ pins }).parse(output)
  if (!bytes.equals(canonicalBytes(output))) throw new Error('OUTPUT_NONCANONICAL')
  if (snapshot.master !== receipt.master || snapshot.dev !== receipt.dev || freshness(snapshot, report.pins).status !== 'fresh') {
    throw new Error('OUTPUT_PINS')
  }
  return freshness(snapshot, pins.parse(observation))
}

export function formalValidation(input: unknown) {
  const v = z.record(z.string(), z.unknown()).parse(input)
  switch (v.op) {
    case 'freshness':
      return freshness(pins.parse(v.expected), pins.parse(v.observed))
    case 'seal': {
      const seal = RemoteSealV1Schema.parse(v.seal) as RemoteSealV1
      return { status: 'encoded', message: encodeSealMessage(seal), githubMessage: githubSealMessage(seal) }
    }
    case 'verify-seal': {
      const expected = RemoteSealV1Schema.parse(v.seal)
      const oid = GitShaSchema.parse(v.expectedOid)
      const signature = z.record(z.string(), z.unknown()).parse(v.signature)
      const { unsignedHeaders, message } = verifySealSignature(decode(v.rawCommitBase64, REMOTE_LIMITS.payloadBytes * 4),
        signature, z.object({ writerActorId: z.number(), platformSignerActorId: z.number() }).parse(v.identity))
      const parents = unsignedHeaders.filter(line => line.startsWith('parent '))
      const trees = unsignedHeaders.filter(line => line.startsWith('tree '))
      if (signature.oid !== oid || signature.tree !== expected.candidateTree ||
          !Array.isArray(signature.parents) || signature.parents.length !== 1 || signature.parents[0] !== expected.candidate ||
          parents.length !== 1 || parents[0] !== 'parent ' + expected.candidate ||
          trees.length !== 1 || trees[0] !== 'tree ' + expected.candidateTree) throw new Error('SEAL_OBJECT_MISMATCH')
      const actual = parseSignedGitHubSealMessage(message)
      if (!actual || !Buffer.from(canonicalBytes(actual)).equals(canonicalBytes(expected))) throw new Error('SEAL_MESSAGE_MISMATCH')
      return { status: 'verified', seal: actual, oid }
    }
    case 'producer':
      return encoded(ProducerBundleReceiptSchema.parse(v.producer))
    case 'receipt': {
      const receipt = ExactValidationReceiptV1Schema.parse(v.receipt)
      if (receipt.conclusion !== 'success' || receipt.tools !== receipt.master ||
          receipt.head !== receipt.seal || receipt.targetCheckHead !== receipt.seal) throw new Error('RECEIPT_BINDING')
      const checked = checkInputs(v.planBase64, v.outputBase64, receipt, v.observed)
      return checked.status === 'hold' ? checked : encoded(receipt)
    }
    case 'prepublish':
    case 'accept': {
      const expected = ExactValidationExpectedSchema.parse(v.expected)
      const receiptBytes = decode(v.receiptBase64, REMOTE_LIMITS.payloadBytes)
      const receipt = ExactValidationReceiptV1Schema.parse(parseStrictJson(receiptBytes))
      const checked = checkInputs(v.planBase64, v.outputBase64, receipt, v.observed)
      if (checked.status === 'hold') return checked
      if (v.op === 'prepublish') return inspectReservedValidation(expected, v.facts, receiptBytes, v.policy)
      return acceptExactValidation(expected, v.facts, receiptBytes, v.policy)
    }
    default:
      throw new Error('UNKNOWN_OPERATION')
  }
}

async function main() {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of process.stdin) {
    size += chunk.length
    if (size > 4 * REMOTE_LIMITS.outputBytes) throw new Error('INPUT_LIMIT')
    chunks.push(chunk)
  }
  const result = formalValidation(parseStrictJson(Buffer.concat(chunks)))
  process.stdout.write(JSON.stringify(result) + '\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const message = error instanceof Error && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.message) ? error.message : 'INVALID_INPUT'
    process.stderr.write(message + '\n')
    process.exitCode = 1
  })
}
