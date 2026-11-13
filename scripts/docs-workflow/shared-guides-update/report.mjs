// Manual read-only report entry for the json-field-overview shared update.
//
// Replays the #1250 production input validation against the downloaded producer archive (ZIP),
// a reviewed producer registration, and independently observed master/dev/Milvus heads. It
// authenticates the archive members and reports which evidence is authenticated, which inputs
// are stale, and whether a target Check was observed. It performs no Check mutation and needs
// no write token.
//
// Usage:
//   node scripts/docs-workflow/shared-guides-update/report.mjs \
//     <producer-zip> <master-sha> <dev-sha> <milvus-track-head-sha> [--replay]
//
// The producer registration (tools/workflow/definition/actor/event + run/attempt + archive
// SHA-256) is the reviewed sample pinned in reviewed-producer.json next to this entry.
import { createHash } from 'node:crypto'
import { readFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const fail = message => { throw new Error(message) }

const zipPath = process.argv[2], master = process.argv[3], dev = process.argv[4], source = process.argv[5]
const replay = process.argv.includes('--replay')
const regFlag = process.argv.indexOf('--registration')
const registrationPath = regFlag >= 0 && process.argv[regFlag + 1] ? process.argv[regFlag + 1]
  : join(dirname(fileURLToPath(import.meta.url)), 'reviewed-producer.json')
if (![zipPath, master, dev, source].every(v => typeof v === 'string' && v.length)) {
  process.stderr.write('USAGE: report.mjs <producer-zip> <master-sha> <dev-sha> <milvus-track-head-sha> [--replay] [--registration <path>]\n')
  process.exitCode = 2
  process.exit()
}

// Trusted checkout: resolve the reviewed entry and toolchain against this module's own root,
// never the caller's working directory. A foreign cwd must not substitute esbuild or the entry.
const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')
const esbuildBin = join(repoRoot, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild')
const contractEntry = join(repoRoot, 'scripts/docs-workflow/shared-guides-update/writer-contract.ts')
const bundle = join(mkdtempSync(join(tmpdir(), 'shared-guides-report-')), 'writer-contract.mjs')
execFileSync(esbuildBin, [contractEntry, '--bundle', '--platform=node', '--format=esm', '--target=node22',
  '--log-level=error', '--outfile=' + bundle])
const c = await import(pathToFileURL(resolve(bundle)))
const canon = v => Buffer.from(c.canonicalBytes(v))

// Reviewed producer registration (pinned sample; does not infer future approvals).
const registration = c.parseStrictJson(readFileSync(registrationPath))
c.ApprovedProducerDefinitionSchema.parse(registration.producer)
const producer = registration.producer

// 1. Authenticate the original archive: SHA-256 against the reviewed sample, then a bounded parse.
const zipBytes = readFileSync(zipPath)
if (zipBytes.length === 0) fail('ZIP_EMPTY')
if (sha256(zipBytes) !== registration.archiveSha256) fail('ARCHIVE_DIGEST')
const members = c.parseRemoteZip(zipBytes) // bounded, rejects traversal/symlinks/oversized/duplicates

// 2. Canonical provenance bound to the reviewed run/attempt and producer definition.
const provenanceBytes = members.get('provenance.json'); if (!provenanceBytes) fail('PROVENANCE_MISSING')
const provenance = c.ProducerBundleReceiptSchema.parse(c.parseStrictJson(provenanceBytes))
if (!Buffer.from(provenanceBytes).equals(canon(provenance))) fail('PROVENANCE_NONCANONICAL')
if (provenance.runId !== registration.runId || provenance.runAttempt !== registration.runAttempt) fail('RUN_BINDING')
if (provenance.tools !== producer.tools || provenance.workflowDefinitionSha256 !== producer.workflowDefinitionSha256) fail('PRODUCER_DEFINITION')
if (provenance.repositoryId !== registration.repositoryId) fail('REPOSITORY_BINDING')

// 3. Exact inventory: every provenance member present with its digest, no extra members.
const names = new Set(['provenance.json'])
for (const member of provenance.members) {
  if (names.has(member.name)) fail('BUNDLE_DUPLICATE')
  names.add(member.name)
  const bytes = members.get(member.name); if (!bytes) fail('MEMBER_MISSING ' + member.name)
  if (bytes.length !== member.bytes || sha256(bytes) !== member.sha256) fail('MEMBER_DIGEST ' + member.name)
}
if (names.size !== members.size) fail('MEMBER_EXTRA')

// 4. Plan/proof/report/lock binding (reuse #1250 production input checks).
const planBytes = members.get('plan.json'); if (!planBytes) fail('PLAN_MISSING')
const plan = c.parseStrictJson(planBytes)
if (!Buffer.from(planBytes).equals(canon(plan))) fail('PLAN_NONCANONICAL')
if (c.digest('plan', plan) !== provenance.planSha256) fail('PLAN_DIGEST')
const proofBytes = members.get('proof.json'); if (!proofBytes) fail('PROOF_MISSING')
if (sha256(proofBytes) !== provenance.proofSha256) fail('PROOF_DIGEST')
const reportValues = plan.reports.map(ref => {
  if (ref.path !== 'blobs/' + ref.sha256) fail('REPORT_REF_PATH')
  const bytes = members.get('reports/' + ref.sha256 + '.json'); if (!bytes) fail('REPORT_MISSING')
  c.validateBlobBytes(ref, bytes)
  const report = c.parseStrictJson(bytes)
  if (!Buffer.from(bytes).equals(canon(report))) fail('REPORT_NONCANONICAL')
  return report
})
const unit = c.validateUnitReports(plan, reportValues)
if (unit.disposition !== 'candidate') fail('PLAN_NOT_CANDIDATE')
if (unit.unitKey !== provenance.unitKey) fail('UNIT_BINDING')
for (const edit of plan.nextEdits) c.validateBlobBytes(edit.afterBlob, members.get('locks/' + edit.afterBlob.sha256 + '.yaml') ?? fail('LOCK_MISSING'))

// 5. Pilot scope, source identity and master/dev binding to the producer provenance.
if (plan.subjects.length !== 1 || plan.subjects[0].pageId !== 'json-field-overview') fail('PILOT_PAGE')
const report = reportValues[0]
const src = report.pins.source
if (src.repository !== 'https://github.com/milvus-io/milvus-docs' || src.track !== 'v3.0.x') fail('SOURCE_IDENTITY')
if (report.pins.master !== provenance.master || report.pins.dev !== provenance.dev) fail('PROVENANCE_PINS')

// 6. Freshness: report pins vs independently observed heads.
const pins = { master: report.pins.master, dev: report.pins.dev, source: src.observedTrackHead }
const observed = { master, dev, source }
const stale = []
for (const field of ['master', 'dev', 'source']) {
  if (pins[field] !== observed[field]) stale.push({ field, expected: pins[field], observed: observed[field] })
}

const result = {
  repository: registration.repositoryFullName, repositoryId: registration.repositoryId, page: 'json-field-overview',
  observation: replay ? 'replay' : 'observed',
  producer: { runId: provenance.runId, runAttempt: provenance.runAttempt, event: producer.event,
    workflowId: producer.workflowId, workflowPath: producer.workflowPath, actorId: producer.actorId,
    workflowDefinitionSha256: producer.workflowDefinitionSha256, seal: provenance.seal },
  authenticatedEvidence: [
    { evidence: 'archive', sha256: registration.archiveSha256, verified: true },
    { evidence: 'provenance.json', runId: provenance.runId, runAttempt: provenance.runAttempt, members: provenance.members.length },
    { evidence: 'plan.json', planSha256: c.digest('plan', plan), matchesProvenance: true },
    ...plan.reports.map(ref => ({ evidence: 'reports/' + ref.sha256 + '.json', sha256: ref.sha256, bytes: ref.bytes, canonical: true, validated: true })),
  ],
  freshness: { pins, observed },
  staleReasons: stale.map(s => 'STALE_' + s.field.toUpperCase()),
  stale,
  check: { status: 'unobserved', published: false, reason: 'read-only entry performs no Check lookup and writes nothing' },
  summary: stale.length
    ? `HOLD: ${stale.map(s => s.field).join(', ')} moved (${stale.map(s => s.expected + ' -> ' + s.observed).join('; ')})`
    : 'FRESH: all pins match the observed heads',
}
process.stdout.write(JSON.stringify(result, null, 2) + '\n')
