// Manual report entry exercises the same offline replay the operator runs, on a bounded fixture.
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const oid = n => n.toString(16).padStart(40, '0')
const digest = n => n.toString(16).padStart(64, '0')

test('report entry authenticates the producer bundle and reports stale master/dev with no Check', async () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-guides-report-'))
  try {
    const bundle = join(root, 'writer-contract.mjs')
    execFileSync('node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild',
      ['scripts/docs-workflow/shared-guides-update/writer-contract.ts', '--bundle', '--platform=node', '--format=esm',
        '--target=node22', '--log-level=error', '--outfile=' + bundle])
    const c = await import(pathToFileURL(resolve(bundle))), canon = v => Buffer.from(c.canonicalBytes(v))
    const require = createRequire(import.meta.url)
    const { loadTypeScript } = require('../../lib/load-typescript.js')
    const { fixtureMaterial } = loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/testing/updates/fixtures/manual-provider.ts'))
    const master = oid(3), dev = oid(4), current = oid(5), target = oid(6)
    const subject = { kind: 'guides-page', group: 'guides', pageId: 'json-field-overview' }
    const members = [{ logicalId: 'json-field-overview', manualId: 'guides', token: 'shared-json-field-overview',
      outputPath: 'content/en/guides/json-field-overview.mdx', origin: 'upstream', current: true, next: true }]
    const report = structuredClone(fixtureMaterial({ subject, master, current, target, members }).collectedReport)
    report.pins.dev = dev
    Object.assign(report.pins.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
    Object.assign(report.semanticProjection.source, { repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
    report.semanticInputSha256 = c.digest('semantic', report.semanticProjection)
    const reportBytes = canon(report), reportSha = sha256(reportBytes)
    const plan = { kind: 'shared-update-unit', schemaVersion: 1, unitKey: 'guides:' + sha256(canon([subject])),
      subjects: [subject], membersSha256: c.digest('unit-members', [{ subject, memberSetSha256: report.memberSetSha256 }]),
      reports: [{ path: 'blobs/' + reportSha, sha256: reportSha, bytes: reportBytes.length }],
      nextEdits: [{ subject, before: { path: 'shared-docs/guides/pages/json-field-overview/lock.yaml', current, next: current, sha256: digest(7) },
        target, afterBlob: { path: 'blobs/' + digest(8), sha256: digest(8), bytes: 10 } }],
      disposition: 'candidate', holdReasons: [],
      semanticInputSha256: c.digest('unit-semantic', [{ subject, semanticInputSha256: report.semanticInputSha256 }]) }
    const planBytes = canon(plan)
    const proof = Buffer.from('synthetic proof'), patch = Buffer.from('synthetic patch'), lock = Buffer.from('next: ' + target + '\n')
    const provenance = { kind: 'shared-update-producer', schemaVersion: 1, repositoryId: 660446555,
      transactionId: oid(9), unitKey: plan.unitKey, planSha256: c.digest('plan', plan), proofSha256: sha256(proof),
      master, dev, preparedBase: master, candidate: target, candidateTree: oid(10), previousSeal: null,
      preservedHumanHeads: [], runId: 43170134677, runAttempt: 1, seal: oid(11), requestId: 'json-field-overview/produce/43170134677/1',
      tools: master, workflowDefinitionSha256: oid(12),
      members: [{ name: 'plan.json', sha256: sha256(planBytes), bytes: planBytes.length },
        { name: 'proof.json', sha256: sha256(proof), bytes: proof.length },
        { name: 'patch.raw', sha256: sha256(patch), bytes: patch.length },
        { name: 'reports/' + reportSha + '.json', sha256: reportSha, bytes: reportBytes.length },
        { name: 'locks/' + sha256(lock) + '.yaml', sha256: sha256(lock), bytes: lock.length }] }
    const dir = join(root, 'archive')
    mkdirSync(join(dir, 'reports'), { recursive: true }); mkdirSync(join(dir, 'locks'), { recursive: true })
    writeFileSync(join(dir, 'plan.json'), planBytes)
    writeFileSync(join(dir, 'proof.json'), proof)
    writeFileSync(join(dir, 'patch.raw'), patch)
    writeFileSync(join(dir, 'reports', reportSha + '.json'), reportBytes)
    writeFileSync(join(dir, 'locks', sha256(lock) + '.yaml'), lock)
    writeFileSync(join(dir, 'provenance.json'), canon(provenance))

    const run = (m, d, s) => {
      const out = execFileSync(process.execPath, ['scripts/docs-workflow/shared-guides-update/report.mjs', dir, m, d, s],
        { env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH } }).toString()
      return JSON.parse(out)
    }
    const fresh = run(master, dev, target)
    assert.equal(fresh.summary, 'FRESH: all pins match the observed heads')
    assert.equal(fresh.check.status, 'none')
    const stale = run(oid(99), oid(98), target)
    assert.deepEqual(stale.staleReasons, ['STALE_MASTER', 'STALE_DEV'])
    assert.deepEqual(stale.stale.map(s => s.field), ['master', 'dev'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
