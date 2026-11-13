// Manual report entry exercises the same offline replay the operator runs, on a bounded ZIP fixture.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { deflateRawSync } from 'node:zlib'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const oid = n => n.toString(16).padStart(40, '0')
const digest = n => n.toString(16).padStart(64, '0')
function zip(files) {
  const chunks = [], central = []; let offset = 0
  for (const [name, input] of Object.entries(files)) {
    const bytes = Buffer.from(input), compressed = deflateRawSync(bytes), nameBytes = Buffer.from(name); let crc = 0xffffffff
    for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0) }
    crc = (crc ^ 0xffffffff) >>> 0
    const local = Buffer.alloc(30), entry = Buffer.alloc(46)
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(8, 8); local.writeUInt16LE(nameBytes.length, 26)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(bytes.length, 22)
    entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(8, 10); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(bytes.length, 24); entry.writeUInt16LE(nameBytes.length, 28); entry.writeUInt32LE(offset, 42)
    chunks.push(local, nameBytes, compressed); central.push(entry, nameBytes); offset += local.length + nameBytes.length + compressed.length
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(central.length / 2, 8); end.writeUInt16LE(central.length / 2, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, directory, end])
}

test('report entry authenticates the ZIP and reports stale heads with no Check observation', async () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-guides-report-'))
  try {
    const bundle = join(root, 'writer-contract.mjs')
    execFileSync(join(process.cwd(), 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
      [join(process.cwd(), 'scripts/docs-workflow/shared-guides-update/writer-contract.ts'), '--bundle', '--platform=node', '--format=esm', '--target=node22', '--log-level=error', '--outfile=' + bundle])
    const c = await import(pathToFileURL(resolve(bundle))), canon = v => Buffer.from(c.canonicalBytes(v))
    const { loadTypeScript } = createRequire(import.meta.url)('../../lib/load-typescript.js')
    const { fixtureMaterial } = loadTypeScript(join(process.cwd(), 'packages/docs-tooling/src/shared-docs/testing/updates/fixtures/manual-provider.ts'))
    const master = oid(3), dev = oid(4), current = oid(5), target = oid(6)
    const subject = { kind: 'guides-page', group: 'guides', pageId: 'json-field-overview' }
    const members = [{ logicalId: 'json-field-overview', manualId: 'guides', token: 'shared-json-field-overview', outputPath: 'content/en/guides/json-field-overview.mdx', origin: 'upstream', current: true, next: true }]
    const report = structuredClone(fixtureMaterial({ subject, master, current, target, members }).collectedReport)
    report.pins.dev = dev
    Object.assign(report.pins.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
    Object.assign(report.semanticProjection.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
    report.semanticInputSha256 = c.digest('semantic', report.semanticProjection)
    const reportBytes = canon(report), reportSha = sha256(reportBytes)
    const proof = Buffer.from('synthetic proof'), patch = Buffer.from('synthetic patch'), lock = Buffer.from('next: ' + target + '\n')
    const plan = { kind: 'shared-update-unit', schemaVersion: 1, unitKey: 'guides:' + sha256(canon([subject])), subjects: [subject],
      membersSha256: c.digest('unit-members', [{ subject, memberSetSha256: report.memberSetSha256 }]),
      reports: [{ path: 'blobs/' + reportSha, sha256: reportSha, bytes: reportBytes.length }],
      nextEdits: [{ subject, before: { path: 'shared-docs/guides/pages/json-field-overview/lock.yaml', current, next: current, sha256: digest(7) }, target, afterBlob: { path: 'blobs/' + sha256(lock), sha256: sha256(lock), bytes: lock.length } }],
      disposition: 'candidate', holdReasons: [], semanticInputSha256: c.digest('unit-semantic', [{ subject, semanticInputSha256: report.semanticInputSha256 }]) }
    const planBytes = canon(plan)
    const provenance = { kind: 'shared-update-producer', schemaVersion: 1, repositoryId: 660446555, transactionId: digest(9),
      unitKey: plan.unitKey, planSha256: c.digest('plan', plan), proofSha256: sha256(proof), master, dev, preparedBase: master,
      candidate: target, candidateTree: oid(10), previousSeal: null, preservedHumanHeads: [], runId: 43170134677, runAttempt: 1,
      seal: oid(11), requestId: 'json-field-overview/produce/43170134677/1', tools: master, workflowDefinitionSha256: digest(12),
      members: [{ name: 'plan.json', sha256: sha256(planBytes), bytes: planBytes.length }, { name: 'proof.json', sha256: sha256(proof), bytes: proof.length },
        { name: 'patch.raw', sha256: sha256(patch), bytes: patch.length }, { name: 'reports/' + reportSha + '.json', sha256: reportSha, bytes: reportBytes.length },
        { name: 'locks/' + sha256(lock) + '.yaml', sha256: sha256(lock), bytes: lock.length }] }
    const files = { 'plan.json': planBytes, 'proof.json': proof, 'patch.raw': patch, ['reports/' + reportSha + '.json']: reportBytes, ['locks/' + sha256(lock) + '.yaml']: lock, 'provenance.json': canon(provenance) }
    const archive = zip(files)
    const registration = { repositoryId: 660446555, repositoryFullName: 'zilliztech/zdoc',
      producer: { tools: master, workflowId: 414826845, workflowPath: '.github/workflows/shared-guides-update.yml', workflowDefinitionSha256: digest(12), actorId: 105278390, event: 'schedule', protocol: 'shared-update-producer-v1' },
      runId: 43170134677, runAttempt: 1, archiveSha256: sha256(archive) }
    const zipPath = join(root, 'producer.zip'), regPath = join(root, 'registration.json')
    writeFileSync(zipPath, archive); writeFileSync(regPath, JSON.stringify(registration))
    const run = args => {
      const out = execFileSync(process.execPath, ['scripts/docs-workflow/shared-guides-update/report.mjs', zipPath, ...args, '--registration', regPath],
        { env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH } }).toString()
      return JSON.parse(out)
    }
    const fresh = run([master, dev, target])
    assert.equal(fresh.summary, 'FRESH: all pins match the observed heads')
    assert.equal(fresh.check.status, 'unobserved')
    assert.equal(fresh.producer.event, 'schedule')
    const stale = run([oid(99), oid(98), oid(97)])
    assert.deepEqual(stale.staleReasons, ['STALE_MASTER', 'STALE_DEV', 'STALE_SOURCE'])

    // Tamper regressions: forged run/attempt, forged unit key, removed proof + empty members.
    const fails = (mutate) => {
      const forged = structuredClone(provenance); mutate(forged)
      const forgedFiles = { ...files, 'provenance.json': canon(forged) }
      const forgedZip = zip(forgedFiles)
      const fz = join(root, 'forged.zip'); writeFileSync(fz, forgedZip)
      const reg2 = { ...registration, archiveSha256: sha256(forgedZip) }
      const rz = join(root, 'forged-reg.json'); writeFileSync(rz, JSON.stringify(reg2))
      try { execFileSync(process.execPath, ['scripts/docs-workflow/shared-guides-update/report.mjs', fz, master, dev, target, '--registration', rz], { env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH } }); return null }
      catch (e) { return e.status }
    }
    assert.equal(fails(p => { p.runId = 1; p.runAttempt = 99 }), 1)       // RUN_BINDING
    assert.equal(fails(p => { p.unitKey = 'guides:forged' }), 1)          // UNIT_BINDING
    assert.equal(fails(p => { p.members = [] }), 1)                        // member inventory / proof missing
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
