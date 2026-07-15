'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createGuidesTableArtifact, validateGuidesTableArtifact } = require('./guides-table-artifact')

const identity = { table_id: 'tbl-tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.saas', target_name: 'saas', cleanup: false }

test('creates and validates a table-scoped artifact', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'guides-table-artifact-'))
  const output = path.join(workspace, 'artifact')
  await fs.mkdir(path.join(workspace, 'docs/tutorials/tools/agents'), { recursive: true })
  await fs.writeFile(path.join(workspace, 'docs/tutorials/tools/agents/agent.md'), 'agent')
  const manifest = await createGuidesTableArtifact({ workspace, output, entry: identity, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), sourceArtifactSha256: 'c'.repeat(64) })
  assert.deepEqual(manifest.files.map(file => file.path), ['docs/tutorials/tools/agents/agent.md'])
  await validateGuidesTableArtifact(output, identity)
})

test('rejects artifact payload paths outside the owned table directory', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'guides-table-artifact-'))
  const output = path.join(workspace, 'artifact')
  await fs.mkdir(path.join(workspace, 'docs/tutorials/tools'), { recursive: true })
  await fs.writeFile(path.join(workspace, 'docs/tutorials/tools/page.md'), 'page')
  await createGuidesTableArtifact({ workspace, output, entry: identity, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), sourceArtifactSha256: 'c'.repeat(64) })
  const manifestPath = path.join(output, 'manifest.json')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  manifest.files[0].path = 'docs/tutorials/management/escape.md'
  await fs.writeFile(manifestPath, JSON.stringify(manifest))
  await assert.rejects(() => validateGuidesTableArtifact(output, identity), /unauthorized/i)
})

test('allows an empty cleanup artifact', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'guides-table-artifact-'))
  const output = path.join(workspace, 'artifact')
  const entry = { ...identity, cleanup: true }
  const manifest = await createGuidesTableArtifact({ workspace, output, entry, masterSha: 'a'.repeat(40), devBaselineSha: 'b'.repeat(40), sourceArtifactSha256: 'c'.repeat(64) })
  assert.deepEqual(manifest.files, [])
  await validateGuidesTableArtifact(output, entry)
})
