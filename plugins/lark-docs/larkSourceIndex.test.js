const assert = require('node:assert/strict')
const childProcess = require('node:child_process')
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
  assert.equal(index.find('token', 'generic-a').title, 'Generic')
  assert.equal(index.findAnyToken('node-a').title, 'A')
  assert.equal(index.findAnyToken('origin-a').title, 'A')
  assert.equal(index.findAnyToken('object-a').title, 'A')
  assert.equal(index.findAnyToken('generic-a').title, 'Generic')
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

test('accepts virtual-only and record-only Base sources independently', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'virtual.json', {
    title: 'Virtual',
    slug: 'virtual',
    token: 'virtual-token',
    base_nav_virtual: true,
  })
  writeJson(sourceDir, 'record.json', {
    title: 'Record',
    slug: 'record',
    token: 'record-token',
    base_record_id: 'rec-record',
  })
  const index = LarkSourceIndex.load(sourceDir)

  assert.equal(
    index.findBaseSourceMeta({ title: 'Virtual', slug: 'virtual' }).base_nav_virtual,
    true,
  )
  assert.equal(
    index.findBaseSourceMeta({ title: 'Wrong', slug: 'wrong', token: 'virtual-token' }).base_nav_virtual,
    true,
  )
  assert.equal(
    index.findBaseSourceMeta({ title: 'Record', slug: 'record' }).base_record_id,
    'rec-record',
  )
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

test('freezes deeply nested sources without overflowing the call stack', t => {
  const sourceDir = makeSourceDir(t)
  const depth = 20_000
  const json = `{"node_token":"deep","nested":${'{"nested":'.repeat(depth)}{}${'}'.repeat(depth)}}`
  fs.writeFileSync(path.join(sourceDir, 'deep.json'), json)

  const source = LarkSourceIndex.load(sourceDir).find('node_token', 'deep')

  let current = source
  for (let index = 0; index <= depth; index += 1) {
    assert.equal(Object.isFrozen(current), true)
    current = current.nested
  }
})

test('reads safely opened bytes before notifying onRead about the source', t => {
  const sourceDir = makeSourceDir(t)
  const sourcePath = path.join(sourceDir, 'source.json')
  const replacementPath = path.join(sourceDir, 'replacement.txt')
  writeJson(sourceDir, 'source.json', { title: 'Original', node_token: 'original' })
  fs.writeFileSync(replacementPath, JSON.stringify({ title: 'Replacement', node_token: 'replacement' }))

  const index = LarkSourceIndex.load(sourceDir, {
    onRead(file) {
      assert.equal(file, fs.realpathSync(sourcePath))
      fs.unlinkSync(file)
      fs.symlinkSync(replacementPath, file)
    },
  })

  assert.equal(index.find('node_token', 'original').title, 'Original')
  assert.equal(index.findAnyToken('replacement'), null)
})

test('opens source files with no-follow and nonblocking descriptor flags', { concurrency: false }, t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Source', node_token: 'source' })
  const openSync = fs.openSync
  let observedFlags
  t.mock.method(fs, 'openSync', function (source, flags, ...args) {
    observedFlags = flags
    return openSync.call(this, source, flags, ...args)
  })

  try {
    LarkSourceIndex.load(sourceDir)
  } finally {
    t.mock.restoreAll()
  }

  assert.equal(observedFlags & fs.constants.O_NOFOLLOW, fs.constants.O_NOFOLLOW)
  assert.equal(observedFlags & fs.constants.O_NONBLOCK, fs.constants.O_NONBLOCK)
})

test('loads a regular source when readdir reports an unknown entry type', { concurrency: false }, t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Unknown Dirent', node_token: 'unknown-dirent' })
  const readdirSync = fs.readdirSync
  t.mock.method(fs, 'readdirSync', function (directory, options) {
    return readdirSync.call(this, directory, options).map(entry => entry.name === 'source.json'
      ? {
          name: entry.name,
          isDirectory: () => false,
          isSymbolicLink: () => false,
          isFile: () => false,
        }
      : entry)
  })

  let index
  try {
    index = LarkSourceIndex.load(sourceDir)
  } finally {
    t.mock.restoreAll()
  }

  assert.equal(index.find('node_token', 'unknown-dirent').title, 'Unknown Dirent')
})

test('rejects a JSON FIFO after nonblocking descriptor validation', { skip: process.platform === 'win32' }, t => {
  const sourceDir = makeSourceDir(t)
  const fifoPath = path.join(sourceDir, 'source.json')
  const result = childProcess.spawnSync('mkfifo', [fifoPath])
  if (result.error || result.status !== 0) {
    t.skip('mkfifo is unavailable')
    return
  }

  const script = `
    const fs = require('node:fs')
    const LarkSourceIndex = require(${JSON.stringify(path.join(__dirname, 'larkSourceIndex'))})
    const openSync = fs.openSync
    let opened = false
    fs.openSync = function (...args) {
      opened = true
      return openSync.apply(this, args)
    }
    try {
      LarkSourceIndex.load(${JSON.stringify(sourceDir)})
      process.exit(2)
    } catch (error) {
      if (!opened) process.exit(4)
      if (!/not a regular file/.test(error.message)) process.exit(3)
    }
  `
  const loadResult = childProcess.spawnSync(process.execPath, ['-e', script], { timeout: 5_000 })

  assert.notEqual(loadResult.error?.code, 'ETIMEDOUT')
  assert.equal(loadResult.status, 0)
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
  assert.throws(
    () => LarkSourceIndex.load(realDir),
    /Cannot open Lark source file.*linked\.json.*symlink/i,
  )
})

test('rejects malformed JSON with the source filename without leaking contents', t => {
  const sourceDir = makeSourceDir(t)
  fs.writeFileSync(path.join(sourceDir, 'broken.json'), 'TOP_SECRET')

  assert.throws(
    () => LarkSourceIndex.load(sourceDir),
    error => {
      assert.match(error.message, /Cannot parse Lark source JSON.*broken\.json/)
      assert.doesNotMatch(error.message, /TOP_SECRET/)
      return true
    },
  )
})

test('reports descriptor read failures separately from JSON parse failures', { concurrency: false }, t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'unreadable.json', { title: 'Unreadable' })
  const readFileSync = fs.readFileSync
  t.mock.method(fs, 'readFileSync', function (source, ...args) {
    if (typeof source === 'number') throw new Error('simulated read failure')
    return readFileSync.call(this, source, ...args)
  })

  try {
    assert.throws(
      () => LarkSourceIndex.load(sourceDir),
      /Cannot read Lark source file.*unreadable\.json.*simulated read failure/,
    )
  } finally {
    t.mock.restoreAll()
  }
})

test('preserves a primary read failure when closing the descriptor also fails', { concurrency: false }, t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Source' })
  const readFileSync = fs.readFileSync
  const closeSync = fs.closeSync
  t.mock.method(fs, 'readFileSync', function (source, ...args) {
    if (typeof source === 'number') throw new Error('primary read failure')
    return readFileSync.call(this, source, ...args)
  })
  t.mock.method(fs, 'closeSync', function (fileDescriptor) {
    closeSync.call(this, fileDescriptor)
    throw new Error('secondary close failure')
  })

  try {
    assert.throws(
      () => LarkSourceIndex.load(sourceDir),
      error => {
        assert.match(error.message, /primary read failure/)
        assert.doesNotMatch(error.message, /secondary close failure/)
        return true
      },
    )
  } finally {
    t.mock.restoreAll()
  }
})

test('reports a close failure when the descriptor read succeeds', { concurrency: false }, t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Source' })
  const closeSync = fs.closeSync
  t.mock.method(fs, 'closeSync', function (fileDescriptor) {
    closeSync.call(this, fileDescriptor)
    throw new Error('simulated close failure')
  })

  try {
    assert.throws(
      () => LarkSourceIndex.load(sourceDir),
      /Cannot close Lark source file.*source\.json.*simulated close failure/,
    )
  } finally {
    t.mock.restoreAll()
  }
})

for (const [shape, value] of [
  ['null', null],
  ['array', []],
  ['string', 'source'],
  ['number', 42],
]) {
  test(`rejects ${shape} Lark source JSON with a filename-qualified shape error`, t => {
    const sourceDir = makeSourceDir(t)
    writeJson(sourceDir, `${shape}.json`, value)

    assert.throws(
      () => LarkSourceIndex.load(sourceDir),
      new RegExp(`Invalid Lark source JSON shape.*${shape}\\.json`),
    )
  })
}

test('rejects direct construction outside the validated loader', () => {
  assert.throws(() => new LarkSourceIndex(), /LarkSourceIndex\.load/)
})

test('returns null for missing any-token and Base metadata lookups', t => {
  const sourceDir = makeSourceDir(t)
  writeJson(sourceDir, 'source.json', { title: 'Source', slug: 'source', node_token: 'source' })
  const index = LarkSourceIndex.load(sourceDir)

  assert.equal(index.findAnyToken('missing'), null)
  assert.equal(index.findBaseSourceMeta({ title: 'Missing', slug: 'missing' }), null)
})
