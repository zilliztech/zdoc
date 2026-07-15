'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createGuidesTableArtifact } = require('./guides-table-artifact')
const { restoreGuidesTableArtifacts } = require('./restore-guides-table-artifacts')

const entry = { table_id: 'tbl-tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.saas', target_name: 'saas', cleanup: false }

async function artifactFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'restore-guides-table-'))
  const source = path.join(root, 'source')
  const artifact = path.join(root, 'artifact')
  await fs.mkdir(path.join(source, 'docs/tutorials/tools'), { recursive: true })
  await fs.writeFile(path.join(source, 'docs/tutorials/tools/page.md'), 'new')
  await createGuidesTableArtifact({ workspace: source, output: artifact, entry, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), sourceArtifactSha256: 'c'.repeat(64) })
  return { root, artifact }
}

test('restores exactly one artifact for every matrix entry', async () => {
  const f = await artifactFixture()
  const target = path.join(f.root, 'target')
  await fs.mkdir(path.join(target, 'docs/tutorials/tools'), { recursive: true })
  await fs.writeFile(path.join(target, 'docs/tutorials/tools/stale.md'), 'stale')
  await restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [f.artifact], target })
  assert.equal(await fs.readFile(path.join(target, 'docs/tutorials/tools/page.md'), 'utf8'), 'new')
  await assert.rejects(() => fs.access(path.join(target, 'docs/tutorials/tools/stale.md')))
})

test('rejects missing, extra, and duplicate table artifacts', async () => {
  const f = await artifactFixture()
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [], target: path.join(f.root, 'target') }), /missing/i)
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [], artifactDirs: [f.artifact], target: path.join(f.root, 'target') }), /extra/i)
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [f.artifact, f.artifact], target: path.join(f.root, 'target') }), /duplicate/i)
  assert.deepEqual(await restoreGuidesTableArtifacts({ matrix: [], artifactDirs: [], target: path.join(f.root, 'target') }), [])
})
