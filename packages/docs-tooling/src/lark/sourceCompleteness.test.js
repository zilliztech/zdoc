'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { hashSnapshot, validateSourceCompleteness, assertSourceCompleteness } = require('./sourceCompleteness')

function write(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value, null, 2))
  return file
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'source-complete-'))
  const sourceDir = path.join(root, 'sources')
  const rootSource = { node_token: 'root-token', has_child: true, children: [{ node_token: 'doc-1' }, { node_token: 'doc-2' }] }
  const doc1 = {
    node_token: 'doc-1',
    origin_node_token: 'doc-1',
    title: 'One',
    blocks: { items: [{ block_id: 'page-1', block_type: 1 }, { block_id: 'body-1', block_type: 2 }] },
  }
  const doc2 = {
    node_token: 'doc-2',
    origin_node_token: 'doc-2',
    title: 'Two',
    blocks: { items: [{ block_id: 'page-2', block_type: 1 }, { block_id: 'body-2', block_type: 2 }] },
  }
  write(sourceDir, 'root-token.json', rootSource)
  write(sourceDir, 'doc-1.json', doc1)
  write(sourceDir, 'doc-2.json', doc2)
  const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(sourceDir, file))).digest('hex')
  const snapshot = {
    schema_version: 2,
    manual: 'guides',
    build_env: 'uat',
    records: [
      { placement_type: 'canonical', doc_token: 'doc-1', source_file: 'doc-1.json', source_hash: digest('doc-1.json') },
      { placement_type: 'canonical', doc_token: 'doc-2', source_file: 'doc-2.json', source_hash: digest('doc-2.json') },
    ],
  }
  return { root, sourceDir, snapshot }
}

test('validates a complete canonical source graph', () => {
  const f = fixture()
  const result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.equal(result.complete, true)
  assert.equal(result.expectedCanonicalSources, 2)
  assert.equal(result.validCanonicalSources, 2)
  assert.match(result.snapshotHash, /^[0-9a-f]{64}$/)
  assert.deepEqual(result.missingFiles, [])
  assert.equal(hashSnapshot(f.snapshot), result.snapshotHash)
})

test('reports missing, corrupt, hash-mismatched, and token-mismatched sources', () => {
  const f = fixture()
  fs.rmSync(path.join(f.sourceDir, 'doc-1.json'))
  fs.writeFileSync(path.join(f.sourceDir, 'doc-2.json'), '{bad json')
  let result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.deepEqual(result.missingFiles, ['doc-1.json'])
  assert.deepEqual(result.corruptFiles, ['doc-2.json'])

  write(f.sourceDir, 'doc-1.json', { node_token: 'wrong-token' })
  write(f.sourceDir, 'doc-2.json', { node_token: 'doc-2' })
  result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.equal(result.hashMismatches.length, 2)
  assert.deepEqual(result.tokenMismatches, ['doc-1.json'])
  assert.throws(() => assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot }), /incomplete/i)
})

test('rejects missing roots, identity mismatches, traversal, and symlinks', () => {
  const f = fixture()
  fs.rmSync(path.join(f.sourceDir, 'root-token.json'))
  let result = validateSourceCompleteness({ manual: 'other', buildEnv: 'prod', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.match(result.rootError, /missing/i)
  assert.equal(result.identityErrors.length, 2)

  f.snapshot.records[0].source_file = '../escape.json'
  result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.deepEqual(result.unsafeFiles, ['../escape.json'])

  f.snapshot.records[0].source_file = 'doc-link.json'
  fs.symlinkSync(path.join(f.sourceDir, 'doc-2.json'), path.join(f.sourceDir, 'doc-link.json'))
  result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.deepEqual(result.unsafeFiles, ['doc-link.json'])
})

test('rejects canonical sources that cannot render a page body', () => {
  const cases = [
    ['virtual.json', { node_token: 'doc-1', base_nav_virtual: true }],
    ['missing-page.json', { node_token: 'doc-1', blocks: { items: [{ block_id: 'body', block_type: 2 }] } }],
    ['empty-body.json', { node_token: 'doc-1', blocks: { items: [{ block_id: 'page', block_type: 1 }] } }],
  ]

  for (const [file, source] of cases) {
    const f = fixture()
    write(f.sourceDir, file, source)
    f.snapshot.records = [{ placement_type: 'canonical', doc_token: 'doc-1', source_file: file }]
    const result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
    assert.equal(result.complete, false, file)
    assert.equal(result.validCanonicalSources, 0, file)
    assert.deepEqual(result.nonRenderableCanonicalFiles, [file], file)
  }
})

test('allows virtual section, link, and ref navigation sources', () => {
  const f = fixture()
  f.snapshot.records.push(
    { placement_type: 'section', source_file: 'section.json' },
    { placement_type: 'link', source_file: 'link.json' },
    { placement_type: 'ref', source_file: 'ref.json' },
  )
  write(f.sourceDir, 'section.json', { node_token: 'base:tbl:section', base_nav_virtual: true })
  write(f.sourceDir, 'link.json', { node_token: 'base:tbl:link', base_nav_virtual: true })
  write(f.sourceDir, 'ref.json', { node_token: 'base:tbl:ref', base_nav_virtual: true })

  const result = validateSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken: 'root-token', sourceDir: f.sourceDir, snapshot: f.snapshot })
  assert.equal(result.complete, true)
  assert.deepEqual(result.nonRenderableCanonicalFiles, [])
})
