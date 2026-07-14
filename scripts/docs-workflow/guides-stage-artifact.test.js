'use strict'

const assert = require('node:assert/strict')
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
    schema_version: 2,
    manual: 'guides',
    build_env: 'uat',
    records: [
      {
        placement_type: 'canonical',
        doc_token: 'doc',
        source_file: 'doc.json',
      },
    ],
  }
}

test('creates, validates, and restores a source artifact', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact'), target = path.join(root, 'target')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline); fs.mkdirSync(target)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', { node_token: 'doc', title: 'Doc' })
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
  const manifest = await createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA, rootToken: 'root' })
  assert.equal(manifest.stage, 'source')
  assert.equal((await validateGuidesStageArtifact(artifact)).files.length, 5)
  await restoreGuidesStageArtifact({ artifact, target })
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(target, 'plugins/lark-docs/meta/sources/guides/doc.json'), 'utf8')), { node_token: 'doc', title: 'Doc' })
  assert.equal(fs.existsSync(path.join(target, 'plugins/lark-docs/meta/media-cache/guides.json')), true)
})

test('source artifact requires the shared media manifest', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-media-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline)
  json(workspace, 'plugins/lark-docs/meta/sources/guides/root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  json(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', { node_token: 'doc', title: 'Doc' })
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
