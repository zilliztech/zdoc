'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { bootstrapMediaEntries, collectMediaReferences, prefetchGuidesMedia, selectRequiredSourceFiles, selectSourceFiles, writeMediaManifest } = require('./guides-media-prefetch')

function writeSource(root, name, blocks) {
  fs.mkdirSync(root, { recursive: true })
  fs.writeFileSync(path.join(root, name), JSON.stringify({ blocks: { items: blocks } }))
}

test('collects and deduplicates Feishu images, boards, and Figma nodes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-'))
  writeSource(root, 'a.json', [
    { block_id: 'image-a', image: { token: 'img-token', caption: { content: 'Architecture' } } },
    { block_id: 'board-a', board: { token: 'board-token' } },
    { block_id: 'figma-a', iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/file-key/Diagrams?node-id=1-2') } } },
  ])
  writeSource(root, 'b.json', [
    { block_id: 'image-b', image: { token: 'img-token', caption: { content: 'Architecture' } } },
    { block_id: 'figma-b', iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/file-key/Diagrams?node-id=1-2') } } },
    { block_id: 'ignored', iframe: { component: { iframe_type: 2, url: 'https://example.com' } } },
  ])

  assert.deepEqual(collectMediaReferences(root), [
    { id: 'feishu-board:board-token', type: 'feishu-board', token: 'board-token' },
    { caption: 'Architecture', id: 'feishu-image:img-token', objectKey: 'architecture.png', token: 'img-token', type: 'feishu-image' },
    { fileKey: 'file-key', id: 'figma:file-key:1:2', nodeId: '1:2', type: 'figma' },
  ])
})

test('writes a deterministic validated media manifest', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-manifest-'))
  const output = path.join(root, 'nested/guides.json')
  const manifest = writeMediaManifest(output, [
    { id: 'figma:k:1:2', type: 'figma', fileKey: 'k', nodeId: '1:2', caption: 'Diagram', objectKey: 'Diagram.png' },
    { id: 'feishu-board:b', type: 'feishu-board', token: 'b', objectKey: 'b.png' },
  ])

  assert.equal(manifest.schemaVersion, 1)
  assert.deepEqual(manifest.entries.map(entry => entry.id), ['feishu-board:b', 'figma:k:1:2'])
  assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), manifest)
  assert.throws(() => writeMediaManifest(path.join(root, 'invalid.json'), [
    { id: 'feishu-image:x', type: 'feishu-image', token: 'x', objectKey: 'x.png', buffer: 'data:image/png;base64,AAAA' },
  ]), /unexpected media manifest field/i)
})

test('selects explicit incremental tokens, single-doc scope, and every source for full plans', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-selection-'))
  const sourceDir = path.join(root, 'sources')
  writeSource(sourceDir, 'a.json', [])
  writeSource(sourceDir, 'b.json', [])
  writeSource(sourceDir, 'root.json', [])
  const snapshotPath = path.join(root, 'snapshot.json')
  fs.writeFileSync(snapshotPath, JSON.stringify({ records: [
    { doc_token: 'token-a', source_file: 'a.json' },
    { doc_token: 'token-b', source_file: 'b.json' },
  ] }))
  const planPath = path.join(root, 'plan.json')
  fs.writeFileSync(planPath, JSON.stringify({ mode: 'incremental', expanded_tokens: ['token-b'] }))

  assert.deepEqual(selectSourceFiles({ sourceDir, planPath, snapshotPath }), ['b.json'])
  assert.deepEqual(selectSourceFiles({ sourceDir, snapshotPath, docTokens: ['token-a'] }), ['a.json'])
  assert.deepEqual(selectSourceFiles({ sourceDir, snapshotPath }), ['a.json', 'b.json'])
  assert.deepEqual(selectRequiredSourceFiles({ sourceDir, snapshotPath }), ['a.json', 'b.json'])

  fs.writeFileSync(planPath, JSON.stringify({ mode: 'full', expanded_tokens: [] }))
  assert.deepEqual(selectSourceFiles({ sourceDir, planPath, snapshotPath }), ['a.json', 'b.json'])
  assert.deepEqual(selectRequiredSourceFiles({ sourceDir, planPath, snapshotPath }), ['a.json', 'b.json'])
})

test('incremental prefetch fetches changed documents and requires every document in affected tables', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-affected-table-'))
  const sourceDir = path.join(root, 'sources')
  writeSource(sourceDir, 'changed.json', [{ image: { token: 'changed-image' } }])
  writeSource(sourceDir, 'unchanged.json', [{ board: { token: 'unchanged-board' } }])
  writeSource(sourceDir, 'unaffected.json', [{ image: { token: 'unaffected-image' } }])
  const snapshotPath = path.join(root, 'snapshot.json')
  fs.writeFileSync(snapshotPath, JSON.stringify({ records: [
    { doc_token: 'changed', source_file: 'changed.json', table_id: 'affected-table' },
    { doc_token: 'unchanged', source_file: 'unchanged.json', table_id: 'affected-table' },
    { doc_token: 'unaffected', source_file: 'unaffected.json', table_id: 'other-table' },
  ] }))
  const planPath = path.join(root, 'plan.json')
  fs.writeFileSync(planPath, JSON.stringify({
    mode: 'incremental',
    expanded_tokens: ['changed'],
    affected_tables: ['affected-table'],
  }))

  assert.deepEqual(selectSourceFiles({ sourceDir, planPath, snapshotPath }), ['changed.json'])
  assert.deepEqual(selectRequiredSourceFiles({ sourceDir, planPath, snapshotPath }), ['changed.json', 'unchanged.json'])
})

test('incremental prefetch reuses unchanged media and refreshes changed media', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-reuse-'))
  const sourceDir = path.join(root, 'sources')
  const output = path.join(root, 'guides.json')
  writeSource(sourceDir, 'changed.json', [{ image: { token: 'changed', caption: { content: 'Changed' } } }])
  writeSource(sourceDir, 'unchanged.json', [{ iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/key/Name?node-id=1-2') } } }])
  writeMediaManifest(output, [
    { id: 'figma:key:1:2', type: 'figma', fileKey: 'key', nodeId: '1:2', caption: 'Deleted Node', objectKey: 'deleted-node.png' },
  ])
  const calls = []
  const downloader = {
    async __downloadImage(token) { calls.push(`image:${token}`); return Buffer.from('image') },
    async __uploadToS3(_buffer, key) { calls.push(`upload:${key}`) },
    async __fetchCaption() { throw new Error('unchanged Figma media must not be fetched') },
  }

  const manifest = await prefetchGuidesMedia({
    sourceDir,
    output,
    previousManifestPath: output,
    sourceFiles: ['changed.json'],
    requiredSourceFiles: ['changed.json', 'unchanged.json'],
    downloader,
  })

  assert.deepEqual(calls, ['image:changed', 'upload:changed.png'])
  assert.deepEqual(manifest.entries.map(entry => entry.id), ['feishu-image:changed', 'figma:key:1:2'])
})

test('migrated source cache rebuilds missing media from baseline docs and refreshes changed scope', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-migrated-source-'))
  const sourceDir = path.join(root, 'sources')
  const docsDir = path.join(root, 'docs')
  const output = path.join(root, 'guides.json')
  writeSource(sourceDir, 'changed.json', [{ image: { token: 'changed-image', caption: { content: 'Changed Image' } } }])
  writeSource(sourceDir, 'unchanged.json', [{ image: { token: 'unchanged-image', caption: { content: 'Unchanged Image' } } }])
  const unchanged = JSON.parse(fs.readFileSync(path.join(sourceDir, 'unchanged.json'), 'utf8'))
  unchanged.node_token = 'unchanged-token'
  fs.writeFileSync(path.join(sourceDir, 'unchanged.json'), JSON.stringify(unchanged))
  fs.mkdirSync(docsDir)
  fs.writeFileSync(path.join(docsDir, 'unchanged.md'), [
    '---',
    'token: unchanged-token',
    '---',
    '![Unchanged Image](https://images.test/unchanged-image.png "Unchanged Image")',
  ].join('\n'))

  const calls = []
  const downloader = {
    async __downloadImage(token) { calls.push(`image:${token}`); return Buffer.from(token) },
    async __uploadToS3(_buffer, key) { calls.push(`upload:${key}`) },
  }
  const manifest = await prefetchGuidesMedia({
    sourceDir,
    output,
    downloader,
    sourceFiles: ['changed.json'],
    requiredSourceFiles: ['changed.json', 'unchanged.json'],
    bootstrapDocsDirs: [docsDir],
    reuseExisting: false,
  })

  assert.deepEqual(calls, ['image:changed-image', 'upload:changed-image.png'])
  assert.deepEqual(manifest.entries.map(entry => entry.id), [
    'feishu-image:changed-image',
    'feishu-image:unchanged-image',
  ])
})

test('full bootstrap reuses media proven by validated baseline docs and fetches new media', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-bootstrap-'))
  const sourceDir = path.join(root, 'sources')
  const docsDir = path.join(root, 'docs')
  const output = path.join(root, 'guides.json')
  writeSource(sourceDir, 'doc.json', [
    { image: { token: 'old-image', caption: { content: 'Old Image' } } },
    { iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/key/Name?node-id=1-2') } } },
    { image: { token: 'new-image', caption: { content: 'New Image' } } },
  ])
  const source = JSON.parse(fs.readFileSync(path.join(sourceDir, 'doc.json'), 'utf8'))
  source.node_token = 'doc-token'
  fs.writeFileSync(path.join(sourceDir, 'doc.json'), JSON.stringify(source))
  fs.mkdirSync(docsDir)
  fs.writeFileSync(path.join(docsDir, 'doc.md'), [
    '---',
    'token: doc-token',
    '---',
    '![Old Image](https://images.test/old-image.png "Old Image")',
    '![Deleted Figma](https://images.test/deleted-figma.png "Deleted Figma")',
  ].join('\n'))

  assert.deepEqual(bootstrapMediaEntries({ sourceDir, docsDirs: [docsDir] }).map(entry => entry.id), [
    'feishu-image:old-image',
    'figma:key:1:2',
  ])
  const calls = []
  const downloader = {
    async __downloadImage(token) { calls.push(`image:${token}`); return Buffer.from(token) },
    async __uploadToS3(_buffer, key) { calls.push(`upload:${key}`) },
    async __fetchCaption() { throw new Error('deleted baseline Figma node must not be fetched during bootstrap') },
  }
  const manifest = await prefetchGuidesMedia({
    sourceDir,
    output,
    downloader,
    bootstrapDocsDirs: [docsDir],
    reuseExisting: true,
  })

  assert.deepEqual(calls, ['image:new-image', 'upload:new-image.png'])
  assert.deepEqual(manifest.entries.map(entry => entry.id), [
    'feishu-image:new-image',
    'feishu-image:old-image',
    'figma:key:1:2',
  ])
})

test('incremental prefetch fails clearly when neither prior nor fresh media covers an affected table', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-missing-'))
  const sourceDir = path.join(root, 'sources')
  const output = path.join(root, 'guides.json')
  writeSource(sourceDir, 'changed.json', [])
  writeSource(sourceDir, 'unchanged.json', [{ board: { token: 'missing-board' } }])

  await assert.rejects(
    prefetchGuidesMedia({
      sourceDir,
      output,
      sourceFiles: ['changed.json'],
      requiredSourceFiles: ['changed.json', 'unchanged.json'],
      downloader: {},
    }),
    /media manifest coverage is incomplete.*feishu-board:missing-board/i,
  )
  assert.equal(fs.existsSync(output), false)
})

test('prefetches every unique media reference once with bounded concurrency', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-media-prefetch-'))
  const sourceDir = path.join(root, 'sources')
  const output = path.join(root, 'guides.json')
  writeSource(sourceDir, 'a.json', [
    { image: { token: 'img', caption: { content: 'Image' } } },
    { board: { token: 'board' } },
    { iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/key/Name?node-id=1-2') } } },
  ])
  const calls = []
  let active = 0
  let maxActive = 0
  const download = async (label, value) => {
    calls.push(label)
    active += 1
    maxActive = Math.max(maxActive, active)
    await new Promise(resolve => setTimeout(resolve, 10))
    active -= 1
    return Buffer.from(value)
  }
  const downloader = {
    async __downloadImage(token) { return download(`image:${token}`, 'image') },
    async __downloadBoardPreview(token) { return download(`board:${token}`, 'board') },
    async __fetchCaption(key, node) { calls.push(`caption:${key}:${node}`); return { nodes: { [node]: { document: { name: 'Figma Diagram' } } } } },
    async __downloadIframe(key, node) { return download(`figma:${key}:${node}`, 'figma') },
    async __uploadToS3(_buffer, key) { calls.push(`upload:${key}`) },
  }

  const manifest = await prefetchGuidesMedia({ sourceDir, output, downloader, trimBoard: async buffer => buffer, concurrency: 3 })

  assert.deepEqual([...calls].sort(), [
    'board:board', 'upload:board.png',
    'image:img', 'upload:image.png',
    'caption:key:1:2', 'figma:key:1:2', 'upload:figma-diagram.png',
  ].sort())
  assert.ok(maxActive > 1)
  assert.ok(maxActive <= 3)
  assert.deepEqual(manifest.entries.map(entry => entry.id), ['feishu-board:board', 'feishu-image:img', 'figma:key:1:2'])
})
