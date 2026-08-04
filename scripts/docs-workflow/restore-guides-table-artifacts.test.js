'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createGuidesTableArtifact } = require('./guides-table-artifact')
const { restoreGuidesTableArtifacts } = require('./restore-guides-table-artifacts')

const entry = { site: 'en', table_id: 'tbl-tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.saas', target_name: 'saas', cleanup: false }

async function artifactFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'restore-guides-table-'))
  const source = path.join(root, 'source')
  const artifact = path.join(root, 'artifact')
  await fs.mkdir(path.join(source, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools'), { recursive: true })
  await fs.writeFile(path.join(source, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools/page.md'), 'new')
  await createGuidesTableArtifact({ workspace: source, output: artifact, entry, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), sourceArtifactSha256: 'c'.repeat(64) })
  return { root, artifact }
}

test('restores exactly one artifact for every matrix entry', async () => {
  const f = await artifactFixture()
  const target = path.join(f.root, 'target')
  await fs.mkdir(path.join(target, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools'), { recursive: true })
  await fs.writeFile(path.join(target, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools/stale.md'), 'stale')
  await restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [f.artifact], target })
  assert.equal(await fs.readFile(path.join(target, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools/page.md'), 'utf8'), 'new')
  await assert.rejects(() => fs.access(path.join(target, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools/stale.md')))
})

test('removes a stale canonical file when a rendered table moves it to a new path', async () => {
  const f = await artifactFixture()
  const target = path.join(f.root, 'target')
  const oldPath = 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/legacy/page.md'
  const newPath = 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools/page.md'
  const canonical = '---\ntoken: canonical-token\n---\nbody\n'
  await fs.mkdir(path.dirname(path.join(target, oldPath)), { recursive: true })
  await fs.writeFile(path.join(target, oldPath), canonical)
  await fs.writeFile(path.join(f.artifact, 'payload', newPath), canonical)
  const manifestPath = path.join(f.artifact, 'manifest.json')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  const bytes = Buffer.from(canonical)
  manifest.files[0] = {
    path: newPath,
    size: bytes.length,
    sha256: require('node:crypto').createHash('sha256').update(bytes).digest('hex'),
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  await restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [f.artifact], target })

  await assert.rejects(() => fs.access(path.join(target, oldPath)))
  assert.equal(await fs.readFile(path.join(target, newPath), 'utf8'), canonical)
})

test('rejects missing, extra, and duplicate table artifacts', async () => {
  const f = await artifactFixture()
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [], target: path.join(f.root, 'target') }), /missing/i)
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [], artifactDirs: [f.artifact], target: path.join(f.root, 'target') }), /extra/i)
  await assert.rejects(() => restoreGuidesTableArtifacts({ matrix: [entry], artifactDirs: [f.artifact, f.artifact], target: path.join(f.root, 'target') }), /duplicate/i)
  assert.deepEqual(await restoreGuidesTableArtifacts({ matrix: [], artifactDirs: [], target: path.join(f.root, 'target') }), [])
})
