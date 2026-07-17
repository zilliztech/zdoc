'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const pluginPath = require.resolve('../../plugins/lark-docs/index.js')
const { generateSidebarTargets } = require('../../plugins/lark-docs/index.js')
const { generateGuidesSidebars, parseArgs } = require('./generate-guides-sidebars')

function manualFixture(root = '.') {
  return {
    root: 'root-token',
    base: 'base-token:*',
    sourceType: 'wiki',
    displayedSidebar: 'default',
    docSourceDir: path.join(root, 'sources'),
    contentRoot: 'docs',
    sidebarPath: './config/generated/guides.sidebar.js',
    targets: {
      zilliz: {
        saas: { outputDir: 'docs/tutorials', imageDir: 'static/img' },
        paas: {
          outputDir: 'docs-byoc/tutorials',
          imageDir: 'static/img',
          sidebarPath: './config/generated/guides-byoc.sidebar.js',
        },
      },
    },
  }
}

function validHelperOptions(overrides = {}) {
  return {
    manualName: 'guides',
    manual: manualFixture(),
    targetNames: ['zilliz.saas', 'zilliz.paas'],
    sourceIndex: Object.freeze({ id: 'shared-index' }),
    sidebarOnly: true,
    skipSourceDown: true,
    offline: true,
    mediaManifest: 'plugins/lark-docs/meta/media-cache/guides.json',
    linkShim: null,
    mediaResolver: Object.freeze({ id: 'media' }),
    ...overrides,
  }
}

test('generateSidebarTargets creates distinct writers sharing one index and writes exact sidebar paths', async () => {
  const writers = []
  const writes = []
  const options = validHelperOptions({
    writerFactory(...args) {
      const writer = {
        args,
        mutable: [],
        destroyed: false,
        async generate_sidebar(outputDir, contentRoot) {
          this.mutable.push(args[5])
          return [{ target: args[5], outputDir, contentRoot }]
        },
        destroy() { this.destroyed = true },
      }
      writers.push(writer)
      return writer
    },
    async writeSidebar(sidebarPath, sidebarItems) {
      writes.push({ sidebarPath, sidebarItems })
    },
  })

  await generateSidebarTargets(options)

  assert.equal(writers.length, 2)
  assert.notEqual(writers[0], writers[1])
  assert.equal(writers[0].args[10], options.sourceIndex)
  assert.equal(writers[1].args[10], options.sourceIndex)
  assert.notEqual(writers[0].mutable, writers[1].mutable)
  assert.deepEqual(writers.map(writer => writer.args[5]), ['zilliz.saas', 'zilliz.paas'])
  assert.deepEqual(writes.map(write => write.sidebarPath), [
    './config/generated/guides.sidebar.js',
    './config/generated/guides-byoc.sidebar.js',
  ])
  assert.deepEqual(writes.map(write => write.sidebarItems[0].contentRoot), ['docs', 'docs-byoc'])
  assert.deepEqual(writers.map(writer => writer.destroyed), [true, true])
})

test('generateSidebarTargets rejects invalid target sets and use outside combined Guides offline sidebar mode', async t => {
  const cases = [
    ['duplicate target', { targetNames: ['zilliz.saas', 'zilliz.saas'] }],
    ['unknown target', { targetNames: ['zilliz.saas', 'milvus'] }],
    ['missing pair member', { targetNames: ['zilliz.saas'] }],
    ['non-Guides manual', { manualName: 'python' }],
    ['non-sidebar mode', { sidebarOnly: false }],
    ['source fetching enabled', { skipSourceDown: false }],
    ['online mode', { offline: false }],
    ['missing media manifest', { mediaManifest: null }],
  ]
  for (const [name, overrides] of cases) {
    await t.test(name, async () => {
      await assert.rejects(() => generateSidebarTargets(validHelperOptions({
        writerFactory() { throw new Error('writer must not be created') },
        writeSidebar() {},
        ...overrides,
      })), /sidebarTargets|Guides|offline|skipSourceDown|mediaManifest|target/i)
    })
  }
})

test('generateSidebarTargets destroys every created writer on generation and write failures', async t => {
  for (const failure of ['generate', 'write']) {
    await t.test(failure, async () => {
      const writers = []
      let generated = 0
      const options = validHelperOptions({
        writerFactory() {
          const writer = {
            destroyCount: 0,
            async generate_sidebar() {
              generated += 1
              if (failure === 'generate' && generated === 1) throw new Error('generation failed')
              return []
            },
            destroy() { this.destroyCount += 1 },
          }
          writers.push(writer)
          return writer
        },
        async writeSidebar() {
          if (failure === 'write' && writers.length === 2) throw new Error('write failed')
        },
      })

      await assert.rejects(
        () => generateSidebarTargets(options),
        failure === 'generate' ? /generation failed/ : /write failed/,
      )
      assert.equal(writers.length, 2)
      assert.deepEqual(writers.map(writer => writer.destroyCount), [1, 1])
    })
  }
})

test('existing docToken action keeps writer arguments and fetch/write_subtree flow when sidebarTargets is absent', async () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-doc-token-regression-'))
  const sourceDir = path.join(workspace, 'sources')
  const outputDir = path.join(workspace, 'docs/tutorials')
  const imageDir = path.join(workspace, 'static/img')
  const events = []
  const writerArgs = []
  const originalLoad = Module._load
  const beforeSigint = new Set(process.listeners('SIGINT'))
  const beforeSigterm = new Set(process.listeners('SIGTERM'))

  class FakeScraper {
    constructor(...args) { events.push(['scraper', ...args]) }
    async fetch(...args) { events.push(['fetch', ...args]) }
  }
  class FakeWriter {
    constructor(...args) { writerArgs.push(args) }
    async write_subtree(...args) { events.push(['write_subtree', ...args]) }
    destroy() { events.push(['destroy']) }
  }

  Module._load = function mockedLoad(request, parent, isMain) {
    if (parent?.filename === pluginPath && request === './larkDocScraper.js') return FakeScraper
    if (parent?.filename === pluginPath && request === './larkDocWriter.js') return FakeWriter
    return originalLoad.call(this, request, parent, isMain)
  }
  delete require.cache[pluginPath]

  try {
    const plugin = require(pluginPath)
    let action
    const cli = {
      command() { return this },
      option() { return this },
      action(callback) { action = callback; return this },
    }
    plugin({}, { guides: {
      ...manualFixture(workspace),
      docSourceDir: sourceDir,
      targets: { zilliz: { saas: { outputDir, imageDir } } },
    } }).extendCli(cli)

    await action({
      manual: 'guides', pubTarget: 'zilliz.saas', docToken: 'leaf-token',
      skipSourceDown: false, skipImageDown: true, uploadToS3: true, linkShim: 'shim.json',
    })

    assert.equal(writerArgs.length, 1)
    assert.equal(writerArgs[0].length, 10)
    assert.deepEqual(writerArgs[0], [
      'root-token', 'base-token:*', 'default', sourceDir, imageDir,
      'zilliz.saas', true, true, 'shim.json', null,
    ])
    assert.ok(events.some(event => event[0] === 'fetch' && event[1] === true && event[2] === 'leaf-token'))
    assert.ok(events.some(event => event[0] === 'write_subtree' && event[1] === outputDir && event[2] === 'leaf-token'))
    assert.equal(events.filter(event => event[0] === 'destroy').length, 1)
  } finally {
    Module._load = originalLoad
    delete require.cache[pluginPath]
    for (const listener of process.listeners('SIGINT')) if (!beforeSigint.has(listener)) process.removeListener('SIGINT', listener)
    for (const listener of process.listeners('SIGTERM')) if (!beforeSigterm.has(listener)) process.removeListener('SIGTERM', listener)
    fs.rmSync(workspace, { recursive: true, force: true })
  }
})

function wrapperFixture() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-guides-sidebars-'))
  const mediaManifest = 'plugins/lark-docs/meta/media-cache/guides.json'
  fs.mkdirSync(path.join(workspace, path.dirname(mediaManifest)), { recursive: true })
  fs.writeFileSync(path.join(workspace, mediaManifest), '{}')
  return { workspace, mediaManifest }
}

function writeSidebarOutputs(workspace) {
  for (const output of ['config/generated/guides.sidebar.js', 'config/generated/guides-byoc.sidebar.js']) {
    fs.mkdirSync(path.join(workspace, path.dirname(output)), { recursive: true })
    fs.writeFileSync(path.join(workspace, output), 'module.exports = []\n')
  }
}

test('wrapper spawns the exact combined Guides command and validates both outputs', () => {
  const fixture = wrapperFixture()
  let command
  try {
    generateGuidesSidebars({
      ...fixture,
      spawnSync(bin, args, options) {
        command = { bin, args, options }
        writeSidebarOutputs(fixture.workspace)
        return { status: 0, signal: null }
      },
    })
    assert.equal(command.bin, 'npx')
    assert.deepEqual(command.args, [
      'docusaurus', 'fetch-lark-docs',
      '--manual', 'guides',
      '--sidebarOnly',
      '--skipSourceDown',
      '--offline',
      '--sidebarTargets', 'zilliz.saas,zilliz.paas',
      '--mediaManifest', fixture.mediaManifest,
    ])
    assert.equal(command.options.cwd, fixture.workspace)
    assert.equal(command.options.shell, undefined)
  } finally {
    fs.rmSync(fixture.workspace, { recursive: true, force: true })
  }
})

test('wrapper CLI accepts exactly one --media-manifest value', () => {
  assert.deepEqual(parseArgs(['--media-manifest', 'plugins/lark-docs/meta/media-cache/guides.json']), {
    mediaManifest: 'plugins/lark-docs/meta/media-cache/guides.json',
  })
  for (const argv of [
    [],
    ['--media-manifest'],
    ['--unknown', 'value'],
    ['--media-manifest', 'a', '--media-manifest', 'b'],
    ['--media-manifest', 'a', 'extra'],
  ]) assert.throws(() => parseArgs(argv), /media-manifest|argument|duplicate|unknown/i)
})

test('wrapper rejects unsafe or non-regular media manifest paths', () => {
  const fixture = wrapperFixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-guides-outside-'))
  const symlink = path.join(fixture.workspace, 'manifest-link.json')
  fs.symlinkSync(path.join(fixture.workspace, fixture.mediaManifest), symlink)
  try {
    for (const mediaManifest of [
      path.join(fixture.workspace, fixture.mediaManifest),
      '../outside.json',
      'missing.json',
      'manifest-link.json',
    ]) {
      assert.throws(() => generateGuidesSidebars({
        workspace: fixture.workspace, mediaManifest, spawnSync() { throw new Error('must not spawn') },
      }), /relative|unsafe|regular|symlink|exist/i)
    }
  } finally {
    fs.rmSync(fixture.workspace, { recursive: true, force: true })
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('wrapper propagates child start, signal, and nonzero failures', () => {
  for (const result of [
    { error: new Error('spawn failed'), status: null, signal: null },
    { status: null, signal: 'SIGTERM' },
    { status: 7, signal: null },
  ]) {
    const fixture = wrapperFixture()
    try {
      assert.throws(() => generateGuidesSidebars({ ...fixture, spawnSync() { return result } }), /spawn|signal|status|failed/i)
    } finally {
      fs.rmSync(fixture.workspace, { recursive: true, force: true })
    }
  }
})

test('wrapper requires both sidebar outputs to be regular non-symlink files after success', () => {
  for (const invalidOutput of ['missing', 'directory', 'symlink']) {
    const fixture = wrapperFixture()
    try {
      assert.throws(() => generateGuidesSidebars({
        ...fixture,
        spawnSync() {
          writeSidebarOutputs(fixture.workspace)
          const target = path.join(fixture.workspace, 'config/generated/guides-byoc.sidebar.js')
          if (invalidOutput === 'missing') fs.rmSync(target)
          if (invalidOutput === 'directory') {
            fs.rmSync(target)
            fs.mkdirSync(target)
          }
          if (invalidOutput === 'symlink') {
            fs.rmSync(target)
            fs.symlinkSync(path.join(fixture.workspace, 'config/generated/guides.sidebar.js'), target)
          }
          return { status: 0, signal: null }
        },
      }), /sidebar|regular|symlink|missing/i)
    } finally {
      fs.rmSync(fixture.workspace, { recursive: true, force: true })
    }
  }
})
