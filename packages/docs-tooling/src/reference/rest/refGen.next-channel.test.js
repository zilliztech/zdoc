const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const RefGen = require('./refGen')

function buildSpecifications(channel) {
  const op = { summary: 'Staged', tags: ['Vector Operations (V2)'], responses: {} }
  if (channel) op['x-next-channel'] = channel
  return {
    tags: [{ name: 'Vector Operations (V2)' }],
    paths: {
      '/v2/vectordb/entities/staged': { post: op },
    },
  }
}

function generate(target, targetPath, channel) {
  const gen = new RefGen({
    specifications: buildSpecifications(channel),
    lang: 'en-US',
    target,
    target_path: targetPath,
    strings: { 'en-US': {} },
  })
  gen.make_groups()
  return gen.write_refs()
}

function findPage(dir) {
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(e => e.isFile() && e.name.includes('staged'))
    .map(e => path.join(e.parentPath ?? e.path, e.name))[0]
}

test('resolveNextChannel maps the tag vocabulary', () => {
  assert.equal(RefGen.resolveNextChannel('include'), 'next')
  assert.equal(RefGen.resolveNextChannel('exclude'), 'retire-in-next')
  assert.equal(RefGen.resolveNextChannel(undefined), null)
  assert.equal(RefGen.resolveNextChannel('bogus'), null)
})

test('unmarked operations stay on the CURRENT channel', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-channel-'))
  await generate('zilliz', dir, undefined)
  const body = fs.readFileSync(findPage(dir), 'utf8')
  assert.doesNotMatch(body, /^channel:/m)
  assert.doesNotMatch(body, /^\s+channel:/m)
})

test('x-next-channel include emits next channel frontmatter and sidebar customProps', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-channel-'))
  await generate('zilliz', dir, 'include')
  const body = fs.readFileSync(findPage(dir), 'utf8')
  assert.match(body, /^channel: next$/m)
  assert.match(body, /^  channel: next$/m)
})

test('x-next-channel exclude emits retire-in-next', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-channel-'))
  await generate('zilliz', dir, 'exclude')
  const body = fs.readFileSync(findPage(dir), 'utf8')
  assert.match(body, /^channel: retire-in-next$/m)
  assert.match(body, /^  channel: retire-in-next$/m)
})

test('parameter-level marks pass through into the page payload for the runtime gate', async () => {
  const specifications = buildSpecifications(undefined)
  specifications.paths['/v2/vectordb/entities/staged'].post.requestBody = {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            stagedField: { type: 'string', 'x-next-channel': 'include' },
            retiringField: { type: 'string', 'x-next-channel': 'exclude' },
            plainField: { type: 'string' },
          },
        },
      },
    },
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-channel-param-'))
  try {
    const gen = new RefGen({
      specifications,
      lang: 'en-US',
      target: 'zilliz',
      target_path: dir,
      strings: { 'en-US': {} },
    })
    gen.make_groups()
    await gen.write_refs()
    const body = fs.readFileSync(findPage(dir), 'utf8')
    const specs = JSON.parse(body.match(/^export const specs = (.+)$/m)[1])
    const props = specs.requestBody.content['application/json'].schema.properties
    assert.equal(props.stagedField['x-next-channel'], 'include')
    assert.equal(props.retiringField['x-next-channel'], 'exclude')
    assert.equal(props.plainField['x-next-channel'], undefined)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('parameter-level x-next-channel rejects values outside include/exclude', () => {
  const specifications = buildSpecifications(undefined)
  specifications.paths['/v2/vectordb/entities/staged'].post.requestBody = {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            stagedField: { type: 'string', 'x-next-channel': 'next' },
          },
        },
      },
    },
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-channel-invalid-'))
  try {
    assert.throws(
      () => new RefGen({
        specifications,
        lang: 'en-US',
        target: 'zilliz',
        target_path: dir,
        strings: { 'en-US': {} },
      }),
      /Invalid x-next-channel.*expected "include" or "exclude"/s,
    )
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
