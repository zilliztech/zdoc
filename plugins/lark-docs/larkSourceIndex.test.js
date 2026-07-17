const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const LarkSourceIndex = require('./larkSourceIndex')

function makeSourceDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-source-index-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

function writeJson(dir, filename, source) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(source))
}

function writeLookupFixtures(dir) {
  writeJson(dir, '01-node.json', {
    title: 'A',
    slug: 'node-a',
    node_token: 'node-a',
    origin_node_token: 'origin-a',
    blocks: { items: [] },
  })
  writeJson(dir, '02-object.json', {
    title: 'A',
    slug: 'object-a',
    node_token: 'duplicate-alias',
    obj_token: 'object-a',
  })
  writeJson(dir, '03-generic.json', {
    title: 'Generic',
    slug: 'generic-a',
    node_token: 'duplicate-alias',
    token: 'generic-a',
  })
  writeJson(dir, '04-base-virtual.json', {
    title: 'Section',
    slug: 'section',
    token: 'base-section',
    base_nav_virtual: true,
    base_record_id: 'rec-section',
  })
}

test('loads source files once and serves node, object, origin, and Base lookups', t => {
  const sourceDir = makeSourceDir(t)
  writeLookupFixtures(sourceDir)
  fs.writeFileSync(path.join(sourceDir, 'ignored.txt'), '{}')
  fs.mkdirSync(path.join(sourceDir, 'nested.json'))
  const reads = []

  const index = LarkSourceIndex.load(sourceDir, { onRead: file => reads.push(file) })

  assert.equal(reads.length, 4)
  assert.equal(index.find('node_token', 'node-a').title, 'A')
  assert.equal(index.find(['token', 'obj_token'], 'object-a').title, 'A')
  assert.equal(index.findAnyToken('origin-a').title, 'A')
  assert.equal(index.findBaseSourceMeta({ title: 'Section', slug: 'section' }).base_record_id, 'rec-section')
  assert.equal(index.findBaseSourceMeta({ title: 'Wrong title', slug: 'wrong-slug', token: 'base-section' }).base_record_id, 'rec-section')
  assert.equal(reads.length, 4)
  assert.deepEqual(reads.map(file => path.basename(file)), [
    '01-node.json',
    '02-object.json',
    '03-generic.json',
    '04-base-virtual.json',
  ])
})

test('reports every source filename when a token alias is ambiguous', t => {
  const sourceDir = makeSourceDir(t)
  writeLookupFixtures(sourceDir)
  const index = LarkSourceIndex.load(sourceDir)

  assert.throws(
    () => index.find('node_token', 'duplicate-alias'),
    error => {
      assert.match(error.message, /02-object\.json/)
      assert.match(error.message, /03-generic\.json/)
      return true
    },
  )
})

test('uses a slug qualifier to select one source from duplicate aliases', t => {
  const sourceDir = makeSourceDir(t)
  writeLookupFixtures(sourceDir)
  const index = LarkSourceIndex.load(sourceDir)

  assert.equal(
    index.find('node_token', 'duplicate-alias', { slug: 'generic-a' }).title,
    'Generic',
  )
  assert.equal(index.find('node_token', 'duplicate-alias', { slug: 'missing' }), undefined)
})

test('reports cross-key collisions in any-token lookups', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'node-source.json', { title: 'Node', node_token: 'shared-token' })
  writeJson(sourceDir, 'generic-source.json', { title: 'Generic', token: 'shared-token' })
  const index = LarkSourceIndex.load(sourceDir)

  assert.throws(
    () => index.findAnyToken('shared-token'),
    /generic-source\.json.*node-source\.json|node-source\.json.*generic-source\.json/,
  )
})

test('array lookup uses the first requested key present on each page', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'precedence.json', {
    title: 'Precedence',
    slug: 'precedence',
    token: 'other-token',
    obj_token: 'object-a',
  })
  const index = LarkSourceIndex.load(sourceDir)
  const types = ['token', 'obj_token']

  assert.throws(() => index.find(types, 'object-a'), /Cannot find/)
  assert.deepEqual(types, ['token', 'obj_token'])
  assert.equal(index.find(['obj_token', 'token'], 'object-a').title, 'Precedence')
})

test('freezes every parsed source recursively', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'frozen.json', {
    title: 'Frozen',
    node_token: 'frozen',
    blocks: { items: [{ block_id: 'one' }] },
  })

  const source = LarkSourceIndex.load(sourceDir).find('node_token', 'frozen')

  assert.equal(Object.isFrozen(source), true)
  assert.equal(Object.isFrozen(source.blocks), true)
  assert.equal(Object.isFrozen(source.blocks.items), true)
  assert.equal(Object.isFrozen(source.blocks.items[0]), true)
})

test('rejects symlink source directories and source files', t => {
  const parent = makeSourceDir(t)
  const realDir = path.join(parent, 'real')
  const linkedDir = path.join(parent, 'linked')
  fs.mkdirSync(realDir)
  fs.symlinkSync(realDir, linkedDir)

  assert.throws(() => LarkSourceIndex.load(linkedDir), /symlink/i)

  writeJson(realDir, 'source.json', { title: 'Source' })
  fs.symlinkSync(path.join(realDir, 'source.json'), path.join(realDir, 'linked.json'))
  assert.throws(() => LarkSourceIndex.load(realDir), /linked\.json.*symlink|symlink.*linked\.json/i)
})

test('rejects malformed JSON with the source filename', t => {
  const sourceDir = makeSourceDir(t)
  fs.writeFileSync(path.join(sourceDir, 'broken.json'), '{')

  assert.throws(() => LarkSourceIndex.load(sourceDir), /broken\.json/)
})

test('returns null for missing any-token and Base metadata lookups', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Source', slug: 'source', node_token: 'source' })
  const index = LarkSourceIndex.load(sourceDir)

  assert.equal(index.findAnyToken('missing'), null)
  assert.equal(index.findBaseSourceMeta({ title: 'Missing', slug: 'missing' }), null)
})
