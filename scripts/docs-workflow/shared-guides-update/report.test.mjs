// Manual report entry core: archive verification, freshness and the bounded ZIP read, on fixtures.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { verifyArchive, freshnessReport, readBoundedZip, readFixedGitHubRef } from './report.mjs'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const oid = n => n.toString(16).padStart(40, '0')
const digest = n => n.toString(16).padStart(64, '0')

async function loadContract(root) {
  const bundle = join(root, 'writer-contract.mjs')
  execFileSync(join(process.cwd(), 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
    [join(process.cwd(), 'scripts/docs-workflow/shared-guides-update/writer-contract.ts'), '--bundle', '--platform=node', '--format=esm', '--target=node22', '--log-level=error', '--outfile=' + bundle])
  const c = await import(pathToFileURL(resolve(bundle)))
  return { ...c, canonicalBytes: v => Buffer.from(c.canonicalBytes(v)) }
}

function buildFixture(c, mutateReport) {
  const { loadTypeScript } = createRequire(import.meta.url)('../../lib/load-typescript.js')
  const { fixtureMaterial } = loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/testing/updates/fixtures/manual-provider.ts'))
  const master = oid(3), dev = oid(4), current = oid(5), target = oid(6)
  const subject = { kind: 'guides-page', group: 'guides', pageId: 'json-field-overview' }
  const members = [{ logicalId: 'json-field-overview', manualId: 'guides', token: 'shared-json-field-overview', outputPath: 'content/en/guides/json-field-overview.mdx', origin: 'upstream', current: true, next: true }]
  const report = structuredClone(fixtureMaterial({ subject, master, current, target, members }).collectedReport)
  report.pins.dev = dev
  Object.assign(report.pins.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
  Object.assign(report.semanticProjection.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
  report.semanticInputSha256 = c.digest('semantic', report.semanticProjection)
  if (mutateReport) { mutateReport(report); report.semanticInputSha256 = c.digest('semantic', report.semanticProjection) }
  const reportBytes = c.canonicalBytes(report), reportSha = sha256(reportBytes)
  const lock = Buffer.from('next: ' + target + '\n')
  const plan = { kind: 'shared-update-unit', schemaVersion: 1, unitKey: 'guides:' + sha256(c.canonicalBytes([subject])), subjects: [subject],
    membersSha256: c.digest('unit-members', [{ subject, memberSetSha256: report.memberSetSha256 }]),
    reports: [{ path: 'blobs/' + reportSha, sha256: reportSha, bytes: reportBytes.length }],
    nextEdits: [{ subject, before: { path: 'shared-docs/guides/pages/json-field-overview/lock.yaml', current, next: current, sha256: digest(7) }, target, afterBlob: { path: 'blobs/' + sha256(lock), sha256: sha256(lock), bytes: lock.length } }],
    disposition: 'candidate', holdReasons: [], semanticInputSha256: c.digest('unit-semantic', [{ subject, semanticInputSha256: report.semanticInputSha256 }]) }
  const planBytes = c.canonicalBytes(plan)
  const proof = Buffer.from('synthetic proof'), patch = Buffer.from('synthetic patch')
  const provenance = { kind: 'shared-update-producer', schemaVersion: 1, repositoryId: 660446555, transactionId: digest(9),
    unitKey: plan.unitKey, planSha256: c.digest('plan', plan), proofSha256: sha256(proof), master, dev, preparedBase: master,
    candidate: target, candidateTree: oid(10), previousSeal: null, preservedHumanHeads: [], runId: 43170134677, runAttempt: 1,
    seal: oid(11), requestId: 'json-field-overview/produce/43170134677/1', tools: master, workflowDefinitionSha256: digest(12),
    members: [{ name: 'plan.json', sha256: sha256(planBytes), bytes: planBytes.length }, { name: 'proof.json', sha256: sha256(proof), bytes: proof.length },
      { name: 'patch.raw', sha256: sha256(patch), bytes: patch.length }, { name: 'reports/' + reportSha + '.json', sha256: reportSha, bytes: reportBytes.length },
      { name: 'locks/' + sha256(lock) + '.yaml', sha256: sha256(lock), bytes: lock.length }] }
  const files = new Map([['plan.json', planBytes], ['proof.json', proof], ['patch.raw', patch], ['reports/' + reportSha + '.json', reportBytes], ['locks/' + sha256(lock) + '.yaml', lock], ['provenance.json', c.canonicalBytes(provenance)]])
  return { c, registration: { runId: 43170134677, runAttempt: 1, repositoryId: 660446555 }, producerDef: { tools: master, workflowDefinitionSha256: digest(12) }, files, provenance, report, master, dev, target }
}

test('verifyArchive authenticates the bundle, rejects tampering and enforces the source.target invariant', async () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-guides-report-'))
  try {
    const c = await loadContract(root)
    const f = buildFixture(c)
    const { provenance, pins } = verifyArchive(c, f.registration, f.producerDef, f.files)
    assert.equal(pins.master, f.master); assert.equal(provenance.runId, 43170134677)
    // forged run/attempt
    assert.throws(() => verifyArchive(c, { runId: 1, runAttempt: 99, repositoryId: 660446555 }, f.producerDef, f.files), /RUN_BINDING/)
    // forged producer repository ID
    const forgedRepo = { ...f.provenance, repositoryId: 1 }
    const fr = new Map(f.files); fr.set('provenance.json', c.canonicalBytes(forgedRepo))
    assert.throws(() => verifyArchive(c, f.registration, f.producerDef, fr), /REPOSITORY_BINDING/)
    // forged unit key (rebuilt provenance + plan digests)
    const forgedUnit = { ...f.provenance, unitKey: 'guides:forged' }
    const ff = new Map(f.files); ff.set('provenance.json', c.canonicalBytes(forgedUnit))
    assert.throws(() => verifyArchive(c, f.registration, f.producerDef, ff), /UNIT_BINDING/)
    // source.target != observedTrackHead
    const tampered = buildFixture(c, r => { r.pins.source.observedTrackHead = oid(99) })
    assert.throws(() => verifyArchive(c, tampered.registration, tampered.producerDef, tampered.files), /SOURCE_TARGET_MISMATCH/)
    // freshness report
    const fresh = freshnessReport(f.pins ?? { master: f.master, dev: f.master, source: f.target }, { master: f.master, dev: f.master, source: f.target }, { status: 'unobserved' })
    assert.equal(fresh.summary, 'FRESH: all pins match the observed heads')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('readBoundedZip rejects a regular oversize file before hashing', () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-guides-zip-'))
  try {
    const big = join(root, 'big.zip'); writeFileSync(big, Buffer.alloc(16 * 1024 * 1024 + 1))
    assert.throws(() => readBoundedZip(big), /ZIP_LIMIT/)
    const small = join(root, 'small.zip'); writeFileSync(small, Buffer.from('ok'))
    assert.equal(readBoundedZip(small).toString(), 'ok')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('readBoundedZip rejects a no-writer FIFO promptly without blocking', () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-guides-fifo-'))
  try {
    const fifo = join(root, 'fifo')
    execFileSync('/usr/bin/mkfifo', [fifo])
    const started = Date.now()
    assert.throws(() => readBoundedZip(fifo), /NOT_REGULAR_FILE/)
    assert.ok(Date.now() - started < 5000, 'FIFO read must not block')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('CLI rejects invalid argument shapes before any setup', () => {
  const report = resolve('scripts/docs-workflow/shared-guides-update/report.mjs')
  const run = args => { try { execFileSync(process.execPath, [report, ...args], { env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH } }); return 0 } catch (e) { return e.status } }
  assert.equal(run(['--registration', 'x.json']), 2)          // retired override
  assert.equal(run(['--replay']), 2)                          // missing zip + refs
  assert.equal(run(['--replay', 'zip.zip']), 2)               // missing refs
  assert.equal(run(['--replay', 'zip.zip', 'bad', 'bad', 'bad']), 2) // invalid OIDs
  assert.equal(run(['extra-arg']), 2)                         // observed takes zero args
  assert.equal(run(['--replay', '--replay', 'zip.zip', oid(1), oid(2), oid(3)]), 2) // repeated flag
  assert.equal(run(['zip.zip', '--replay', oid(1), oid(2), oid(3)]), 2)               // flag in the middle
})

test('readFixedGitHubRef uses the shared transport and rejects a forged or malformed ref', async () => {
  let received = null
  const fakeTransport = async req => { received = req; return { status: 200, headers: {}, body: Buffer.from(JSON.stringify({ ref: 'refs/heads/v3.0.x', object: { type: 'tag', sha: '1'.repeat(40) } })) } }
  const fakeC = { createRemoteTransport: () => fakeTransport, parseStrictJson: b => JSON.parse(Buffer.from(b).toString()) }
  await assert.rejects(() => readFixedGitHubRef(fakeC, 'https://github.com/milvus-io/milvus-docs', 'v3.0.x'), /MILVUS_REF_OBJECT/)
  assert.equal(received.method, 'GET')
  assert.equal(received.path, '/repos/milvus-io/milvus-docs/git/ref/heads/v3.0.x')
  // a non-200 transport status stops as unavailable rather than reporting a moved source
  const unavailable = async () => ({ status: 401, headers: {}, body: Buffer.from('') })
  await assert.rejects(() => readFixedGitHubRef({ ...fakeC, createRemoteTransport: () => unavailable }, 'https://github.com/milvus-io/milvus-docs', 'v3.0.x'), /MILVUS_REF_UNAVAILABLE/)
})
