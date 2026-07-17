'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createGuidesStageArtifact, restoreGuidesStageArtifact, validateGuidesStageArtifact } = require('./guides-stage-artifact')

const SHA = 'a'.repeat(40)
function write(root, relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value) }
function json(root, relative, value) { write(root, relative, JSON.stringify(value)) }

function validSnapshot() {
  return {
    schema_version: 3,
    manual: 'guides',
    build_env: 'uat',
    records: [
      {
        placement_type: 'canonical',
        doc_token: 'doc',
        source_file: 'doc.json',
      },
    ],
    navigation_records: [{ record_id: 'rec-doc', table_id: 'tbl', placement_type: 'canonical' }],
    table_digests: { tbl: 'a'.repeat(64) },
  }
}

function renderableSource() {
  return { node_token: 'doc', title: 'Doc', blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'body', block_type: 2 }] } }
}

function validMediaPrefetchReport() {
  return {
    schemaVersion: 1,
    generated_at: '2026-07-17T00:00:00.000Z',
    mode: 'incremental',
    cacheState: 'valid',
    metrics: {
      canonicalReferencesRequired: 0,
      selectedReferences: 0,
      validatedManifestReuse: 0,
      committedDocsReconstruction: 0,
      resolvedByNetwork: 0,
      staleEntriesDropped: 0,
      finalManifestEntries: 0,
    },
  }
}

function prepareSourceWorkspace(root, { report = validMediaPrefetchReport() } = {}) {
  const workspace = path.join(root, 'workspace')
  const baseline = path.join(root, 'baseline')
  const artifact = path.join(root, 'artifact')
  fs.mkdirSync(workspace)
  fs.mkdirSync(baseline)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', renderableSource())
  json(workspace, 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json', validSnapshot())
  json(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', { schemaVersion: 1, entries: [] })
  write(workspace, 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json', '{}')
  if (report !== null) json(workspace, 'plugins/lark-docs/meta/reports/guides-media-prefetch.json', report)
  return { workspace, baseline, artifact }
}

test('creates, validates, and restores a source artifact', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact'), target = path.join(root, 'target')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline); fs.mkdirSync(target)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', renderableSource())
  write(workspace, 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json', '{}')
  await assert.rejects(
    createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' }),
    /snapshot candidate/i,
  )
  json(workspace, 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json', validSnapshot())
  json(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', {
    schemaVersion: 1,
    entries: [{ id: 'feishu-image:image', type: 'feishu-image', token: 'image', objectKey: 'image.png' }],
  })
  json(workspace, 'plugins/lark-docs/meta/reports/guides-media-prefetch.json', validMediaPrefetchReport())
  const manifest = await createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' })
  assert.equal(manifest.stage, 'source')
  assert.equal((await validateGuidesStageArtifact(artifact)).files.length, 6)
  await restoreGuidesStageArtifact({ artifact, target })
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(target, 'plugins/lark-docs/meta/sources/guides/doc.json'), 'utf8')), renderableSource())
  assert.equal(fs.existsSync(path.join(target, 'plugins/lark-docs/meta/media-cache/guides.json')), true)
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(target, 'plugins/lark-docs/meta/reports/guides-media-prefetch.json'), 'utf8')),
    validMediaPrefetchReport(),
  )
})

test('source artifact requires a semantic media prefetch report', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-media-report-'))
  const { workspace, baseline, artifact } = prepareSourceWorkspace(root, { report: null })
  await assert.rejects(
    createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' }),
    /media prefetch report/i,
  )
})

test('source artifact rejects malformed media prefetch report contracts', async (t) => {
  const valid = validMediaPrefetchReport()
  const cases = [
    ['extra root key', { ...valid, extra: true }, /unexpected|exact|key/i],
    ['invalid schema', { ...valid, schemaVersion: 2 }, /schema/i],
    ['invalid mode', { ...valid, mode: 'full' }, /mode/i],
    ['invalid cache state', { ...valid, cacheState: 'unknown' }, /cache state|cacheState/i],
    ['invalid timestamp', { ...valid, generated_at: 'yesterday' }, /generated|timestamp/i],
    ['negative counter', { ...valid, metrics: { ...valid.metrics, selectedReferences: -1 } }, /nonnegative|selectedReferences/i],
    ['non-reconciling metrics', { ...valid, metrics: { ...valid.metrics, finalManifestEntries: 1 } }, /reconcile|inventory/i],
    ['extra metric key', { ...valid, metrics: { ...valid.metrics, unknown: 0 } }, /unexpected|missing counters/i],
  ]
  for (const [name, report, expected] of cases) {
    await t.test(name, async () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-invalid-media-report-'))
      const fixture = prepareSourceWorkspace(root, { report })
      await assert.rejects(
        createGuidesStageArtifact({ stage: 'source', workspace: fixture.workspace, baselineDir: fixture.baseline, output: fixture.artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' }),
        expected,
      )
    })
  }
})

test('source artifact validation rejects semantic report tampering even with a matching checksum', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-rehashed-media-report-'))
  const fixture = prepareSourceWorkspace(root)
  await createGuidesStageArtifact({ stage: 'source', workspace: fixture.workspace, baselineDir: fixture.baseline, output: fixture.artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' })
  const relative = 'plugins/lark-docs/meta/reports/guides-media-prefetch.json'
  const payload = path.join(fixture.artifact, 'payload', relative)
  const invalid = Buffer.from(JSON.stringify({ ...validMediaPrefetchReport(), cacheState: 'unknown' }))
  fs.writeFileSync(payload, invalid)
  const manifestPath = path.join(fixture.artifact, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const entry = manifest.files.find(file => file.path === relative)
  entry.size = invalid.length
  entry.sha256 = crypto.createHash('sha256').update(invalid).digest('hex')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  await assert.rejects(validateGuidesStageArtifact(fixture.artifact), /cache state|cacheState/i)
})

test('source artifact validation still rejects media prefetch payload checksum tampering', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-tampered-media-report-'))
  const fixture = prepareSourceWorkspace(root)
  await createGuidesStageArtifact({ stage: 'source', workspace: fixture.workspace, baselineDir: fixture.baseline, output: fixture.artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' })
  fs.writeFileSync(path.join(fixture.artifact, 'payload/plugins/lark-docs/meta/reports/guides-media-prefetch.json'), '{}')
  await assert.rejects(validateGuidesStageArtifact(fixture.artifact), /checksum|size/i)
})

test('source artifact requires the shared media manifest', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-media-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', renderableSource())
  json(workspace, 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json', validSnapshot())

  await assert.rejects(
    createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' }),
    /media manifest/i,
  )
})

test('source artifact creation rejects an incomplete candidate source graph', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json', validSnapshot())

  await assert.rejects(
    createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' }),
    /incomplete.*0\/1 canonical sources/i,
  )
})

test('enforces stage ownership and rejects tampering', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline)
  write(workspace, 'docs/tutorials/a.md', 'A')
  await assert.rejects(createGuidesStageArtifact({ stage: 'byoc', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA }), /no files/i)
  await createGuidesStageArtifact({ stage: 'saas', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA })
  fs.writeFileSync(path.join(artifact, 'payload/docs/tutorials/a.md'), 'tampered')
  await assert.rejects(validateGuidesStageArtifact(artifact), /checksum|size/i)
})
