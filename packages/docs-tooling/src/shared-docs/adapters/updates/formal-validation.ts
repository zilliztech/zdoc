// Process boundary for trusted workflows that acquire and authenticate GitHub facts independently.
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod'
import { verifySealSignature } from './verify-seal-signature.mjs'
import { canonicalBytes, digest, parseStrictJson } from '../../core/updates/canonical'
import { GitShaSchema, validateUnitReports } from '../../core/updates/envelope'
import { acceptExactValidation, encodeSealMessage, githubSealMessage, ExactValidationExpectedSchema, ExactValidationReceiptV1Schema,
  inspectReservedValidation, parseSignedGitHubSealMessage, ProducerBundleReceiptSchema, REMOTE_LIMITS, RemotePolicySchema, RemoteSealV1Schema,
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

// Trusted caller context: the repository this validation runs for. It selects the allowed plan
// format and can never be downgraded by a caller-supplied scope, receipt repository ID or flag.
const productionRepositoryId = 660446555
const trustedContext = z.strictObject({ repositoryId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) })
const reportMembers = z.array(z.strictObject({ name: z.string().min(1).max(REMOTE_LIMITS.path),
  bytesBase64: z.string().min(1) })).max(REMOTE_LIMITS.members)
const reportRef = z.strictObject({ path: z.string(), sha256: z.string(), bytes: z.number() })
const unitSourcePins = z.object({ repository: z.string(), track: z.string(), observedTrackHead: GitShaSchema, target: GitShaSchema })

// Bind the trusted repository identity against the declared request identities. Request fields can
// only reject — they can never grant production identity. Without a trusted context, a receipt /
// expected / policy that declares the production repository ID is rejected rather than downgraded.
function bindRepository(repositoryId: number | undefined, declared: number[]): void {
  if (repositoryId === undefined) {
    if (declared.includes(productionRepositoryId)) throw new Error('REPOSITORY_BINDING')
    return
  }
  if (declared.some(id => id !== repositoryId)) throw new Error('REPOSITORY_BINDING')
}

// Production path: a shared-update-unit plan whose reports are authenticated by path/size/SHA-256,
// validated canonically and cross-checked with validateUnitReports. master/dev/source anchors come
// from the report's pins; the validator's own output remains an independent digest/pin comparison.
function checkUnitInputs(plan: unknown, outputBase64: unknown, reportsBase64: unknown, receipt: {
  planSha256?: string; outputDigest?: string; master?: string; dev?: string; unitKey?: string
}, observation: unknown) {
  const members = reportMembers.parse(reportsBase64)
  const refs = z.array(reportRef).parse((plan as { reports: unknown }).reports)
  if (members.length !== refs.length) throw new Error('REPORT_COUNT')
  const reportValues = members.map((member, index) => {
    const ref = refs[index]
    if (ref.path !== 'blobs/' + ref.sha256) throw new Error('REPORT_REF_PATH')
    if (member.name !== 'reports/' + ref.sha256 + '.json') throw new Error('REPORT_MEMBER_NAME')
    const bytes = decode(member.bytesBase64, REMOTE_LIMITS.outputBytes)
    if (bytes.length !== ref.bytes) throw new Error('REPORT_SIZE')
    if (createHash('sha256').update(bytes).digest('hex') !== ref.sha256) throw new Error('REPORT_DIGEST')
    const report = parseStrictJson(bytes)
    if (!bytes.equals(canonicalBytes(report))) throw new Error('REPORT_NONCANONICAL')
    return report
  })
  const unit = validateUnitReports(plan, reportValues)
  if (unit.unitKey !== receipt.unitKey) throw new Error('UNIT_KEY_BINDING')
  if (unit.disposition !== 'candidate') throw new Error('PLAN_NOT_CANDIDATE')
  if (unit.subjects.length !== 1 || unit.subjects[0].kind !== 'guides-page' || unit.subjects[0].pageId !== 'json-field-overview') throw new Error('PILOT_PAGE')
  const source = unitSourcePins.parse((reportValues[0] as { pins: { source: unknown } }).pins.source)
  if (source.repository !== 'https://github.com/milvus-io/milvus-docs' || source.track !== 'v3.0.x') throw new Error('SOURCE_IDENTITY')
  if (source.target !== source.observedTrackHead) throw new Error('SOURCE_TARGET_MISMATCH')
  const report = reportValues[0] as { pins: { master: string; dev: string } }
  const snapshot = { master: report.pins.master, dev: report.pins.dev, source: source.observedTrackHead }
  const bytes = decode(outputBase64, REMOTE_LIMITS.outputBytes)
  if (createHash('sha256').update(bytes).digest('hex') !== receipt.outputDigest) throw new Error('OUTPUT_DIGEST')
  const output = parseStrictJson(bytes)
  const outputPins = z.object({ pins }).parse(output)
  if (!bytes.equals(canonicalBytes(output))) throw new Error('OUTPUT_NONCANONICAL')
  if (snapshot.master !== receipt.master || snapshot.dev !== receipt.dev || freshness(snapshot, outputPins.pins).status !== 'fresh') {
    throw new Error('OUTPUT_PINS')
  }
  return freshness(snapshot, pins.parse(observation))
}

// Private projection path, unchanged: the plan itself carries the three pins and the output must echo them.
function checkProjectionInputs(plan: unknown, outputBase64: unknown, receipt: {
  planSha256?: string; outputDigest?: string; master?: string; dev?: string
}, observation: unknown) {
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

function checkInputs(planBase64: unknown, outputBase64: unknown, reportsBase64: unknown, receipt: {
  planSha256?: string; outputDigest?: string; master?: string; dev?: string; unitKey?: string
}, observation: unknown, repositoryId: number | undefined) {
  const planBytes = decode(planBase64, REMOTE_LIMITS.outputBytes)
  const plan = parseStrictJson(planBytes)
  if (!planBytes.equals(canonicalBytes(plan)) || digest('plan', plan) !== receipt.planSha256) throw new Error('PLAN_DIGEST')
  const isUnit = typeof plan === 'object' && plan !== null && (plan as { kind?: unknown }).kind === 'shared-update-unit'
  if (repositoryId === productionRepositoryId) {
    if (!isUnit) throw new Error('PRODUCTION_REQUIRES_UNIT_PLAN')
    return checkUnitInputs(plan, outputBase64, reportsBase64, receipt, observation)
  }
  if (isUnit) throw new Error('PRIVATE_REQUIRES_PROJECTION')
  return checkProjectionInputs(plan, outputBase64, receipt, observation)
}

export function formalValidation(input: unknown, trusted?: unknown) {
  const v = z.record(z.string(), z.unknown()).parse(input)
  // The production repository identity is fixed at the trusted call entry, never read from the
  // request JSON. A request field cannot downgrade a production invocation to private validation.
  const repositoryId = trusted === undefined ? undefined : trustedContext.parse(trusted).repositoryId
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
      bindRepository(repositoryId, [receipt.repositoryId])
      const checked = checkInputs(v.planBase64, v.outputBase64, v.reportsBase64, receipt, v.observed, repositoryId)
      return checked.status === 'hold' ? checked : encoded(receipt)
    }
    case 'prepublish':
    case 'accept': {
      const expected = ExactValidationExpectedSchema.parse(v.expected)
      const receiptBytes = decode(v.receiptBase64, REMOTE_LIMITS.payloadBytes)
      const receipt = ExactValidationReceiptV1Schema.parse(parseStrictJson(receiptBytes))
      const policy = RemotePolicySchema.parse(v.policy)
      bindRepository(repositoryId, [receipt.repositoryId, expected.repositoryId, policy.repositoryId])
      const checked = checkInputs(v.planBase64, v.outputBase64, v.reportsBase64, receipt, v.observed, repositoryId)
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
  const result = formalValidation(parseStrictJson(Buffer.concat(chunks)),
    process.env.GITHUB_REPOSITORY_ID === undefined ? undefined : trustedContext.parse({ repositoryId: Number(process.env.GITHUB_REPOSITORY_ID) }))
  process.stdout.write(JSON.stringify(result) + '\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const message = error instanceof Error && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.message) ? error.message : 'INVALID_INPUT'
    process.stderr.write(message + '\n')
    process.exitCode = 1
  })
}
