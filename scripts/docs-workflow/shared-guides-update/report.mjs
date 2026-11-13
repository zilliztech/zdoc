// Manual read-only report entry for the json-field-overview shared update.
//
// Two modes:
//   observed (default, zero args) — reads the producer run/attempt, artifact, zdoc master/dev,
//       the Milvus track head and the target Check from trusted readers (no caller-supplied SHAs).
//   replay (`--replay <zip> <master> <dev> <milvus>`) — replays the pinned historical archive
//       against injected historical observations, labelled replay.
//
// The producer registration is pinned in reviewed-producer.json next to this entry and cannot be
// overridden by the caller. No Check is written; a read-only credential is sufficient.
//
//   node report.mjs
//   node report.mjs --replay <producer-zip> <master-sha> <dev-sha> <milvus-track-head-sha>
import { createHash } from 'node:crypto'
import { readFileSync, mkdtempSync, openSync, readSync, closeSync, fstatSync, realpathSync, constants } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const fail = message => { throw new Error(message) }
const ARCHIVE_LIMIT = 16 * 1024 * 1024 // REMOTE_LIMITS.archiveBytes
const oidRe = /^[0-9a-f]{40}$/

// Trusted checkout: resolve the reviewed entry and toolchain against this module's own root.
const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')

// Read at most ARCHIVE_LIMIT bytes from a regular file descriptor before any hashing/parsing.
// Open nonblocking so a no-writer FIFO is rejected promptly instead of blocking the reader.
export function readBoundedZip(zipPath) {
  const fd = openSync(zipPath, constants.O_RDONLY | constants.O_NONBLOCK)
  try {
    if (!fstatSync(fd).isFile()) fail('NOT_REGULAR_FILE')
    const buf = Buffer.alloc(ARCHIVE_LIMIT + 1)
    let total = 0
    while (total < ARCHIVE_LIMIT + 1) {
      const n = readSync(fd, buf, total, ARCHIVE_LIMIT + 1 - total, total)
      if (n === 0) break
      total += n
    }
    if (total > ARCHIVE_LIMIT) fail('ZIP_LIMIT')
    return buf.subarray(0, total)
  } finally { closeSync(fd) }
}

// Authenticate the six-member archive from its member map; returns { provenance, plan, report, pins }.
export function verifyArchive(c, registration, producerDef, members) {
  const provenanceBytes = members.get('provenance.json'); if (!provenanceBytes) fail('PROVENANCE_MISSING')
  const provenance = c.ProducerBundleReceiptSchema.parse(c.parseStrictJson(provenanceBytes))
  if (!Buffer.from(provenanceBytes).equals(c.canonicalBytes(provenance))) fail('PROVENANCE_NONCANONICAL')
  if (provenance.repositoryId !== registration.repositoryId) fail('REPOSITORY_BINDING')
  if (provenance.runId !== registration.runId || provenance.runAttempt !== registration.runAttempt) fail('RUN_BINDING')
  if (provenance.tools !== producerDef.tools || provenance.workflowDefinitionSha256 !== producerDef.workflowDefinitionSha256) fail('PRODUCER_DEFINITION')
  const names = new Set(['provenance.json'])
  for (const member of provenance.members) {
    if (names.has(member.name)) fail('BUNDLE_DUPLICATE')
    names.add(member.name)
    const bytes = members.get(member.name); if (!bytes) fail('MEMBER_MISSING ' + member.name)
    if (bytes.length !== member.bytes || sha256(bytes) !== member.sha256) fail('MEMBER_DIGEST ' + member.name)
  }
  if (names.size !== members.size) fail('MEMBER_EXTRA')
  const planBytes = members.get('plan.json'); if (!planBytes) fail('PLAN_MISSING')
  const plan = c.parseStrictJson(planBytes)
  if (!Buffer.from(planBytes).equals(c.canonicalBytes(plan))) fail('PLAN_NONCANONICAL')
  if (c.digest('plan', plan) !== provenance.planSha256) fail('PLAN_DIGEST')
  const proofBytes = members.get('proof.json'); if (!proofBytes) fail('PROOF_MISSING')
  if (sha256(proofBytes) !== provenance.proofSha256) fail('PROOF_DIGEST')
  const reportValues = plan.reports.map(ref => {
    if (ref.path !== 'blobs/' + ref.sha256) fail('REPORT_REF_PATH')
    const bytes = members.get('reports/' + ref.sha256 + '.json'); if (!bytes) fail('REPORT_MISSING')
    c.validateBlobBytes(ref, bytes)
    const report = c.parseStrictJson(bytes)
    if (!Buffer.from(bytes).equals(c.canonicalBytes(report))) fail('REPORT_NONCANONICAL')
    return report
  })
  const unit = c.validateUnitReports(plan, reportValues)
  if (unit.disposition !== 'candidate') fail('PLAN_NOT_CANDIDATE')
  if (unit.unitKey !== provenance.unitKey) fail('UNIT_BINDING')
  for (const edit of plan.nextEdits) c.validateBlobBytes(edit.afterBlob, members.get('locks/' + edit.afterBlob.sha256 + '.yaml') ?? fail('LOCK_MISSING'))
  if (plan.subjects.length !== 1 || plan.subjects[0].pageId !== 'json-field-overview') fail('PILOT_PAGE')
  const report = reportValues[0]
  const src = report.pins.source
  if (src.repository !== 'https://github.com/milvus-io/milvus-docs' || src.track !== 'v3.0.x') fail('SOURCE_IDENTITY')
  if (src.target !== src.observedTrackHead) fail('SOURCE_TARGET_MISMATCH')
  if (report.pins.master !== provenance.master || report.pins.dev !== provenance.dev) fail('PROVENANCE_PINS')
  return { provenance, plan, report, pins: { master: report.pins.master, dev: report.pins.dev, source: src.observedTrackHead } }
}

export function freshnessReport(pins, observed, check) {
  const stale = []
  for (const field of ['master', 'dev', 'source']) {
    if (pins[field] !== observed[field]) stale.push({ field, expected: pins[field], observed: observed[field] })
  }
  return { freshness: { pins, observed }, staleReasons: stale.map(s => 'STALE_' + s.field.toUpperCase()), stale, check,
    summary: stale.length ? `HOLD: ${stale.map(s => s.field).join(', ')} moved` : 'FRESH: all pins match the observed heads' }
}

// Read a single commit ref through the shared authenticated transport: fixed GitHub origin,
// explicit TLS roots, proxy independence, redirect rejection, deadline and streaming size cap.
export async function readFixedGitHubRef(c, repository, track) {
  const m = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(repository)
  if (!m) fail('SOURCE_REPOSITORY')
  if (!/^[A-Za-z0-9_.-]+$/.test(track)) fail('SOURCE_TRACK')
  const fullName = m[1] + '/' + m[2]
  const transport = c.createRemoteTransport({ repositoryFullName: fullName })
  const response = await transport({ method: 'GET', path: '/repos/' + fullName + '/git/ref/heads/' + track, maximum: 1024 * 1024, signal: AbortSignal.timeout(30000) })
  if (response.status !== 200) fail('MILVUS_REF_UNAVAILABLE')
  const body = c.parseStrictJson(response.body)
  if (body.ref !== 'refs/heads/' + track) fail('MILVUS_REF_IDENTITY')
  const object = body.object
  if (!object || object.type !== 'commit' || typeof object.sha !== 'string' || !oidRe.test(object.sha)) fail('MILVUS_REF_OBJECT')
  return object.sha
}

function validateArgs() {
  const argv = process.argv.slice(2)
  if (argv.length === 0) return { replay: false, args: [] }
  if (argv.length === 5 && argv[0] === '--replay' && argv.slice(2).every(a => oidRe.test(a))) {
    return { replay: true, args: argv.slice(1) }
  }
  process.stderr.write('USAGE: report.mjs (no arguments) or report.mjs --replay <zip> <master> <dev> <milvus>\n')
  process.exitCode = 2
  process.exit()
}

async function main() {
  const { replay, args } = validateArgs()
  const bundle = join(mkdtempSync(join(tmpdir(), 'shared-guides-report-')), 'writer-contract.mjs')
  execFileSync(join(repoRoot, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
    [join(repoRoot, 'scripts/docs-workflow/shared-guides-update/writer-contract.ts'), '--bundle', '--platform=node', '--format=esm',
      '--target=node22', '--log-level=error', '--outfile=' + bundle])
  const c = await import(pathToFileURL(resolve(bundle)))
  const registration = c.parseStrictJson(readFileSync(join(moduleRoot, 'reviewed-producer.json')))
  const policy = c.RemotePolicySchema.parse(registration.policy)
  const producers = registration.producers.map(p => c.ApprovedProducerDefinitionSchema.parse(p))
  const producerDef = producers[0]

  const runResult = replay
    ? (() => {
        const zipBytes = readBoundedZip(args[0])
        if (sha256(zipBytes) !== registration.archiveSha256) fail('ARCHIVE_DIGEST')
        const members = c.parseRemoteZip(zipBytes)
        const { provenance, plan, pins } = verifyArchive(c, registration, producerDef, members)
        const observed = { master: args[1], dev: args[2], source: args[3] }
        return { observation: 'replay', producer: { runId: provenance.runId, runAttempt: provenance.runAttempt, event: producerDef.event, workflowId: producerDef.workflowId, actorId: producerDef.actorId, workflowDefinitionSha256: producerDef.workflowDefinitionSha256, seal: provenance.seal },
          authenticatedEvidence: [{ evidence: 'archive', sha256: registration.archiveSha256, verified: true }, { evidence: 'provenance.json', members: provenance.members.length }, { evidence: 'plan.json', planSha256: c.digest('plan', plan) }],
          ...freshnessReport(pins, observed, { status: 'unobserved', published: false }) }
      })()
    : await (async () => {
        const evidence = await c.initializeEvidence({ root: mkdtempSync(join(realpathSync(tmpdir()), 'shared-guides-evidence-')), repositories: [], owner: 'report-observed' })
        const reads = c.createRemoteReads({ policy, evidence, approvedProducers: producers })
        const run = await reads.readRun({ id: registration.runId, attempt: registration.runAttempt, role: 'producer' })
        if (run.kind !== 'found') fail('PRODUCER_RUN_' + run.kind.toUpperCase())
        const artifact = await reads.readArtifact({ runId: registration.runId, attempt: registration.runAttempt, name: policy.producerArtifactName })
        if (artifact.kind !== 'found') fail('ARTIFACT_' + artifact.kind.toUpperCase())
        if (artifact.value.archive.sha256 !== registration.archiveSha256) fail('ARCHIVE_DIGEST')
        const master = await reads.readRef('master'), dev = await reads.readRef('dev')
        if (master.kind !== 'found' || dev.kind !== 'found') fail('REFS_UNAVAILABLE')
        const { provenance, plan, report, pins } = verifyArchive(c, registration, producerDef, artifact.value.members)
        const milvus = await readFixedGitHubRef(c, report.pins.source.repository, report.pins.source.track)
        const observed = { master: master.value.oid, dev: dev.value.oid, source: milvus }
        const checks = await reads.readChecks(provenance.seal)
        const target = checks.kind === 'found'
          ? (() => { const matches = checks.value.filter(ch => ch.appId === policy.checkAppId && ch.name === policy.checkName && ch.head === provenance.seal); return matches.length ? { status: 'found', id: matches[0].id, suiteId: matches[0].suiteId } : { status: 'absent' } })()
          : { status: checks.kind === 'absent' ? 'absent' : 'unknown' }
        return { observation: 'observed', producer: { runId: run.value.id, runAttempt: run.value.attempt, event: run.value.event, workflowId: run.value.workflowId, actorId: run.value.actorId, workflowDefinitionSha256: run.value.workflowDefinitionSha256, seal: provenance.seal },
          authenticatedEvidence: [{ evidence: 'run', id: run.value.id, attempt: run.value.attempt }, { evidence: 'artifact', id: artifact.value.id, name: artifact.value.name }, { evidence: 'provenance.json', members: provenance.members.length }, { evidence: 'plan.json', planSha256: c.digest('plan', plan) }],
          ...freshnessReport(pins, observed, { status: target.status, published: false, observed: checks.kind }) }
      })()
  process.stdout.write(JSON.stringify(runResult, null, 2) + '\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const code = error instanceof Error && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.message) ? error.message : 'INVALID_INPUT'
    process.stderr.write(code + '\n')
    process.exitCode = 1
  })
}
