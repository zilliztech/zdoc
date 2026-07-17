'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const pluginPath = require.resolve('../../plugins/lark-docs/index.js')
const { generateSidebarTargets, writeSidebarPairTransactional } = require('../../plugins/lark-docs/index.js')
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
    sourceIndex: Object.freeze({
      id: 'shared-index',
      find() {},
      findAnyToken() {},
      findBaseSourceMeta() {},
    }),
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
    async writeSidebarPair(outputs) {
      writes.push(...outputs)
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
    ['incremental plan mode', { incrementalPlanOnly: true }],
  ]
  for (const [name, overrides] of cases) {
    await t.test(name, async () => {
      await assert.rejects(() => generateSidebarTargets(validHelperOptions({
        writerFactory() { throw new Error('writer must not be created') },
        writeSidebarPair() {},
        ...overrides,
      })), /sidebarTargets|Guides|offline|skipSourceDown|mediaManifest|target|incremental/i)
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
        async writeSidebarPair() {
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

test('generateSidebarTargets requires the complete immutable source index API', async () => {
  await assert.rejects(() => generateSidebarTargets(validHelperOptions({
    sourceIndex: Object.freeze({ find() {}, findAnyToken() {} }),
    writerFactory() { throw new Error('writer must not be created') },
    writeSidebarPair() {},
  })), /source index.*findBaseSourceMeta|findBaseSourceMeta.*source index/i)
})

function sidebarPair() {
  return [
    { sidebarPath: './config/generated/guides.sidebar.js', sidebarItems: [{ id: 'saas' }] },
    { sidebarPath: './config/generated/guides-byoc.sidebar.js', sidebarItems: [{ id: 'paas' }] },
  ]
}

function sidebarFiles(workspace) {
  return sidebarPair().map(output => path.join(workspace, output.sidebarPath))
}

function transactionResidue(workspace) {
  const dir = path.join(workspace, 'config/generated')
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(name => name.includes('.tmp-') || name.includes('.backup-'))
    : []
}

test('transactional sidebar pair writes exact bytes and replaces both existing files without residue', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-pair-'))
  const files = sidebarFiles(workspace)
  fs.mkdirSync(path.dirname(files[0]), { recursive: true })
  fs.writeFileSync(files[0], 'old saas')
  fs.writeFileSync(files[1], 'old paas')
  try {
    writeSidebarPairTransactional({ workspace, outputs: sidebarPair() })
    assert.equal(fs.readFileSync(files[0], 'utf8'), 'module.exports = [\n  {\n    "id": "saas"\n  }\n]\n')
    assert.equal(fs.readFileSync(files[1], 'utf8'), 'module.exports = [\n  {\n    "id": "paas"\n  }\n]\n')
    assert.deepEqual(transactionResidue(workspace), [])
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true })
  }
})

test('transactional sidebar pair rolls back both originals on staged write and second commit failures', async t => {
  for (const failure of ['stage', 'commit']) {
    await t.test(failure, () => {
      const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-pair-rollback-'))
      const files = sidebarFiles(workspace)
      fs.mkdirSync(path.dirname(files[0]), { recursive: true })
      fs.writeFileSync(files[0], 'old saas')
      fs.writeFileSync(files[1], 'old paas')
      let writeCalls = 0
      let renameCalls = 0
      const fsImpl = new Proxy(fs, {
        get(target, property) {
          if (property === 'writeFileSync') return function (...args) {
            writeCalls += 1
            if (failure === 'stage' && writeCalls === 2) throw new Error('second staged write failed')
            return target.writeFileSync(...args)
          }
          if (property === 'renameSync') return function (...args) {
            renameCalls += 1
            if (failure === 'commit' && renameCalls === 4) throw new Error('second commit rename failed')
            return target.renameSync(...args)
          }
          return target[property]
        },
      })
      try {
        assert.throws(
          () => writeSidebarPairTransactional({ workspace, outputs: sidebarPair(), fsImpl }),
          failure === 'stage' ? /second staged write failed/ : /second commit rename failed/,
        )
        assert.equal(fs.readFileSync(files[0], 'utf8'), 'old saas')
        assert.equal(fs.readFileSync(files[1], 'utf8'), 'old paas')
        assert.deepEqual(transactionResidue(workspace), [])
      } finally {
        fs.rmSync(workspace, { recursive: true, force: true })
      }
    })
  }
})

test('transactional sidebar pair rejects symlink final files and symlink ancestors', async t => {
  await t.test('final file', () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-pair-symlink-'))
    const files = sidebarFiles(workspace)
    fs.mkdirSync(path.dirname(files[0]), { recursive: true })
    fs.writeFileSync(path.join(workspace, 'target.js'), 'target')
    fs.symlinkSync(path.join(workspace, 'target.js'), files[0])
    try {
      assert.throws(() => writeSidebarPairTransactional({ workspace, outputs: sidebarPair() }), /symlink/i)
    } finally {
      fs.rmSync(workspace, { recursive: true, force: true })
    }
  })

  await t.test('ancestor directory', () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-pair-parent-symlink-'))
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-pair-outside-'))
    fs.mkdirSync(path.join(workspace, 'config'))
    fs.symlinkSync(outside, path.join(workspace, 'config/generated'))
    try {
      assert.throws(() => writeSidebarPairTransactional({ workspace, outputs: sidebarPair() }), /symlink/i)
    } finally {
      fs.rmSync(workspace, { recursive: true, force: true })
      fs.rmSync(outside, { recursive: true, force: true })
    }
  })
})

test('existing docToken action keeps writer arguments and fetch/write_subtree flow when sidebarTargets is absent', async () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-doc-token-regression-'))
  const sourceDir = path.join(workspace, 'sources')
  const outputDir = path.join(workspace, 'docs/tutorials')
  const imageDir = path.join(workspace, 'static/img')
  const events = []
  const writerArgs = []
  const originalLoad = Module._load
  const originalRepoBranch = process.env.REPO_BRANCH
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
    if (parent?.filename === pluginPath && request === './larkSourceIndex') return {
      load() { events.push(['index-load']); throw new Error('docToken must not load an index') },
    }
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
    assert.equal(events.some(event => event[0] === 'index-load'), false)
  } finally {
    Module._load = originalLoad
    delete require.cache[pluginPath]
    for (const listener of process.listeners('SIGINT')) if (!beforeSigint.has(listener)) process.removeListener('SIGINT', listener)
    for (const listener of process.listeners('SIGTERM')) if (!beforeSigterm.has(listener)) process.removeListener('SIGTERM', listener)
    if (originalRepoBranch === undefined) delete process.env.REPO_BRANCH
    else process.env.REPO_BRANCH = originalRepoBranch
    fs.rmSync(workspace, { recursive: true, force: true })
  }
})

test('combined action keeps validation and canonical audit flags on the path to both sidebar writes', { concurrency: false }, async () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-combined-action-'))
  const previousCwd = process.cwd()
  const originalLoad = Module._load
  const originalRepoBranch = process.env.REPO_BRANCH
  const events = []

  class FakeScraper {
    constructor() { this.records = null; events.push(['scraper']) }
    async validate_content_links() { events.push(['validate-links']) }
    async __base() { this.records = []; events.push(['base']) }
  }
  class FakeWriter {
    constructor(...args) { this.target = args[5]; events.push(['writer', this.target, args[10]]) }
    async generate_sidebar() { events.push(['generate', this.target]); return [{ target: this.target }] }
    destroy() { events.push(['destroy', this.target]) }
  }
  const sharedIndex = Object.freeze({ find() {}, findAnyToken() {}, findBaseSourceMeta() {} })

  Module._load = function mockedLoad(request, parent, isMain) {
    if (parent?.filename === pluginPath && request === './larkDocScraper.js') return FakeScraper
    if (parent?.filename === pluginPath && request === './larkDocWriter.js') return FakeWriter
    if (parent?.filename === pluginPath && request === './larkSourceIndex') return {
      load(sourceDir) { events.push(['index-load', sourceDir]); return sharedIndex },
    }
    if (parent?.filename === pluginPath && request === './offlineMediaResolver') return {
      createOfflineMediaResolver() { events.push(['media-resolver']); return Object.freeze({}) },
    }
    if (parent?.filename === pluginPath && request === './canonicalLinkAuditor') return {
      runCanonicalLinkAudit() {
        events.push(['canonical-audit'])
        return { report: {}, paths: { markdownPath: 'audit.md' } }
      },
    }
    return originalLoad.call(this, request, parent, isMain)
  }
  delete require.cache[pluginPath]

  try {
    process.chdir(workspace)
    const plugin = require(pluginPath)
    let action
    const cli = {
      command() { return this }, option() { return this },
      action(callback) { action = callback; return this },
    }
    plugin({}, { guides: manualFixture(workspace) }).extendCli(cli)
    await action({
      manual: 'guides', sidebarOnly: true, sidebarTargets: 'zilliz.saas,zilliz.paas',
      skipSourceDown: true, offline: true, mediaManifest: 'manifest.json',
      validateLinks: true, auditCanonicalLinks: true,
    })

    assert.equal(events.filter(event => event[0] === 'validate-links').length, 1)
    assert.equal(events.filter(event => event[0] === 'canonical-audit').length, 1)
    assert.equal(events.filter(event => event[0] === 'index-load').length, 1)
    assert.deepEqual(events.filter(event => event[0] === 'generate').map(event => event[1]), ['zilliz.saas', 'zilliz.paas'])
    assert.equal(events.filter(event => event[0] === 'destroy').length, 2)
    assert.equal(fs.readFileSync(path.join(workspace, 'config/generated/guides.sidebar.js'), 'utf8'),
      'module.exports = [\n  {\n    "target": "zilliz.saas"\n  }\n]\n')
    assert.equal(fs.readFileSync(path.join(workspace, 'config/generated/guides-byoc.sidebar.js'), 'utf8'),
      'module.exports = [\n  {\n    "target": "zilliz.paas"\n  }\n]\n')

    const eventCount = events.length
    fs.rmSync(path.join(workspace, 'config'), { recursive: true, force: true })
    await assert.rejects(() => action({
      manual: 'guides', sidebarOnly: true, sidebarTargets: 'zilliz.saas,zilliz.paas',
      skipSourceDown: true, offline: true, mediaManifest: 'manifest.json', incrementalPlanOnly: true,
    }), /incrementalPlanOnly.*sidebarTargets|sidebarTargets.*incrementalPlanOnly/i)
    assert.equal(events.length, eventCount)
    assert.equal(fs.existsSync(path.join(workspace, 'config')), false)
  } finally {
    process.chdir(previousCwd)
    Module._load = originalLoad
    delete require.cache[pluginPath]
    if (originalRepoBranch === undefined) delete process.env.REPO_BRANCH
    else process.env.REPO_BRANCH = originalRepoBranch
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

test('wrapper rejects a symlink sidebar output ancestor before spawn', () => {
  const fixture = wrapperFixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'wrapper-sidebar-parent-'))
  fs.mkdirSync(path.join(fixture.workspace, 'config'))
  fs.symlinkSync(outside, path.join(fixture.workspace, 'config/generated'))
  try {
    assert.throws(() => generateGuidesSidebars({
      ...fixture,
      spawnSync() { throw new Error('must not spawn') },
    }), /ancestor.*symlink|symlink.*ancestor/i)
  } finally {
    fs.rmSync(fixture.workspace, { recursive: true, force: true })
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

function writeOriginalSidebars(workspace) {
  const outputs = ['config/generated/guides.sidebar.js', 'config/generated/guides-byoc.sidebar.js']
  fs.mkdirSync(path.join(workspace, 'config/generated'), { recursive: true })
  fs.writeFileSync(path.join(workspace, outputs[0]), 'original saas')
  fs.writeFileSync(path.join(workspace, outputs[1]), 'original paas')
  return outputs.map(output => path.join(workspace, output))
}

function assertOriginalSidebars(files) {
  assert.equal(fs.readFileSync(files[0], 'utf8'), 'original saas')
  assert.equal(fs.readFileSync(files[1], 'utf8'), 'original paas')
}

function wrapperResidue(workspace) {
  const dir = path.join(workspace, 'config/generated')
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => name.includes('.backup-')) : []
}

test('wrapper zero-exit no-op and one-output children fail and restore quarantined originals', async t => {
  for (const mode of ['no-op', 'one-output']) {
    await t.test(mode, () => {
      const fixture = wrapperFixture()
      const files = writeOriginalSidebars(fixture.workspace)
      try {
        assert.throws(() => generateGuidesSidebars({
          ...fixture,
          spawnSync() {
            if (mode === 'one-output') fs.writeFileSync(files[0], 'fresh saas')
            return { status: 0, signal: null }
          },
        }), /sidebar|fresh|missing/i)
        assertOriginalSidebars(files)
        assert.deepEqual(wrapperResidue(fixture.workspace), [])
      } finally {
        fs.rmSync(fixture.workspace, { recursive: true, force: true })
      }
    })
  }
})

test('wrapper child failure after creating outputs restores both originals', () => {
  const fixture = wrapperFixture()
  const files = writeOriginalSidebars(fixture.workspace)
  try {
    assert.throws(() => generateGuidesSidebars({
      ...fixture,
      spawnSync() {
        fs.writeFileSync(files[0], 'fresh saas')
        fs.writeFileSync(files[1], 'fresh paas')
        return { status: 9, signal: null }
      },
    }), /status 9/)
    assertOriginalSidebars(files)
    assert.deepEqual(wrapperResidue(fixture.workspace), [])
  } finally {
    fs.rmSync(fixture.workspace, { recursive: true, force: true })
  }
})

test('wrapper manifest replacement or byte change during spawn fails and restores originals', async t => {
  for (const mode of ['replace', 'change']) {
    await t.test(mode, () => {
      const fixture = wrapperFixture()
      const files = writeOriginalSidebars(fixture.workspace)
      const manifestPath = path.join(fixture.workspace, fixture.mediaManifest)
      try {
        assert.throws(() => generateGuidesSidebars({
          ...fixture,
          spawnSync() {
            fs.writeFileSync(files[0], 'fresh saas')
            fs.writeFileSync(files[1], 'fresh paas')
            if (mode === 'replace') {
              fs.rmSync(manifestPath)
              fs.writeFileSync(manifestPath, '{"replacement":true}')
            } else {
              fs.writeFileSync(manifestPath, '{"changed":true}')
            }
            return { status: 0, signal: null }
          },
        }), /manifest.*changed|identity|hash/i)
        assertOriginalSidebars(files)
        assert.deepEqual(wrapperResidue(fixture.workspace), [])
      } finally {
        fs.rmSync(fixture.workspace, { recursive: true, force: true })
      }
    })
  }
})

test('wrapper successful fresh pair replaces originals and removes quarantine backups', () => {
  const fixture = wrapperFixture()
  const files = writeOriginalSidebars(fixture.workspace)
  try {
    generateGuidesSidebars({
      ...fixture,
      spawnSync() {
        fs.writeFileSync(files[0], 'fresh saas')
        fs.writeFileSync(files[1], 'fresh paas')
        return { status: 0, signal: null }
      },
    })
    assert.equal(fs.readFileSync(files[0], 'utf8'), 'fresh saas')
    assert.equal(fs.readFileSync(files[1], 'utf8'), 'fresh paas')
    assert.deepEqual(wrapperResidue(fixture.workspace), [])
  } finally {
    fs.rmSync(fixture.workspace, { recursive: true, force: true })
  }
})
