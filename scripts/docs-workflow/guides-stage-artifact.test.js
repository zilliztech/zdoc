'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createGuidesStageArtifact, restoreGuidesStageArtifact, validateGuidesStageArtifact } = require('./guides-stage-artifact')

const SHA = 'a'.repeat(40)
function write(root, relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value) }

test('creates, validates, and restores a source artifact', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-stage-'))
  const workspace = path.join(root, 'workspace'), baseline = path.join(root, 'baseline'), artifact = path.join(root, 'artifact'), target = path.join(root, 'target')
  fs.mkdirSync(workspace); fs.mkdirSync(baseline); fs.mkdirSync(target)
  write(workspace, 'plugins/lark-docs/meta/sources/guides/doc.json', '{"title":"Doc"}')
  write(workspace, 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json', '{}')
  const manifest = await createGuidesStageArtifact({ stage: 'source', workspace, baselineDir: baseline, output: artifact, masterSha: SHA, devBaselineSha: SHA })
  assert.equal(manifest.stage, 'source')
  assert.equal((await validateGuidesStageArtifact(artifact)).files.length, 2)
  await restoreGuidesStageArtifact({ artifact, target })
  assert.equal(fs.readFileSync(path.join(target, 'plugins/lark-docs/meta/sources/guides/doc.json'), 'utf8'), '{"title":"Doc"}')
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
