const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const RealLarkDocWriter = require('./larkDocWriter')

function renderArgs({ manual, target, stage, outputDir, contentRoot, sidebarPath }) {
  return [
    '--manual', manual,
    '--site', 'en',
    '--source', 'english',
    '--generator-manual', 'guides',
    '--snapshot-path', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
    '--generator-target', target,
    '--source-type', 'wiki',
    '--root', 'root-token',
    '--base', 'base-token:*',
    '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/guides',
    '--stage', stage,
    '--output-dir', outputDir,
    '--content-root', contentRoot,
    '--sidebar-path', sidebarPath,
    '--override-path', `sidebar-overrides/en/${manual}.json`,
    '--reuse-source',
  ]
}

test('recent incremental plan reuse requires an explicit render request and validated seeded-stage capability', () => {
  const plugin = require('./index')
  assert.equal(typeof plugin.shouldReuseRecentIncrementalPlan, 'function')
  if (typeof plugin.shouldReuseRecentIncrementalPlan !== 'function') return
  const ready = {stageSeeded: true, stageValidated: true}
  assert.equal(plugin.shouldReuseRecentIncrementalPlan({skipSourceDown: true, incrementalRender: true, capability: ready}), true)
  assert.equal(plugin.shouldReuseRecentIncrementalPlan({skipSourceDown: true, incrementalRender: false, capability: ready}), false)
  assert.equal(plugin.shouldReuseRecentIncrementalPlan({skipSourceDown: true, incrementalRender: true, capability: {stageSeeded: true, stageValidated: false}}), false)
  assert.equal(plugin.shouldReuseRecentIncrementalPlan({skipSourceDown: true, incrementalRender: true, capability: {stageSeeded: false, stageValidated: true}}), false)
  assert.equal(plugin.shouldReuseRecentIncrementalPlan({skipSourceDown: false, incrementalRender: true, capability: ready}), false)
})

test('recent source-only delta plans still fully render empty SaaS and PaaS stages', async () => {
  const originalLoad = Module._load
  const originalCwd = process.cwd()
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-tooling-guides-integration-'))
  const sourceDir = path.join(root, 'packages/docs-tooling/src/lark/meta/sources/guides')
  const baselinePath = path.join(root, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json')
  const candidatePath = path.join(root, 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json')
  const seenTargets = []
  const completenessSnapshots = []
  const sourceTokenFetches = []
  const fullWrites = []
  const subtreeWrites = []
  const sidebarCalls = []
  let fullSourceFetchCalls = 0
  let failingTarget = null
  let sourcePlan = {
    manual: 'guides',
    mode: 'incremental',
    expanded_tokens: [],
    changed_tokens: [],
    removed_records: [],
    reasons_by_token: {},
    source_dir: 'packages/docs-tooling/src/lark/meta/sources/guides',
    build_env: 'uat',
  }

  const saasOnlyRecord = {
    base_placement_type: 'canonical',
    base_targets: ['zilliz.saas'],
    base_status: 'Draft',
  }

  class FakeScraper {
    constructor(_root, _base, _sourceType, configuredSourceDir) {
      this.docSourceDir = configuredSourceDir
      this.base_app_token = 'base-token'
      this.records = null
    }

    async __base() {
      this.records = [{record_id: 'saas-only', fields: {}}]
    }

    async fetch(recursive) {
      assert.equal(recursive, true)
      fullSourceFetchCalls += 1
      throw new Error('valid incremental source-only plan must not reset the complete source cache')
    }

    async fetch_wiki_node_metadata() { return new Map() }
    async fetch_source_tokens(tokens) { sourceTokenFetches.push([...tokens]) }
    async validate_content_links() { return {broken_links: []} }
  }

  class FakeWriter {
    constructor(_root, _base, _sidebar, _sources, _images, target) {
      this.target = target
      seenTargets.push(target)
    }

    async write_docs(outputDir) {
      if (this.target === failingTarget) throw new Error(`render failed for ${this.target}`)
      fullWrites.push(this.target)
      fs.mkdirSync(outputDir, {recursive: true})
      fs.writeFileSync(path.join(outputDir, 'shared.md'), '# Shared guide\n')
      const publishable = RealLarkDocWriter.prototype.__base_source_is_publishable.call(
        {targets: this.target},
        saasOnlyRecord,
      )
      if (publishable) fs.writeFileSync(path.join(outputDir, 'saas-only.md'), '# SaaS only\n')
    }

    async write_subtree(outputDir, token) {
      subtreeWrites.push([this.target, token])
      fs.mkdirSync(outputDir, {recursive: true})
      fs.writeFileSync(path.join(outputDir, `${token}.md`), `# ${token}\n`)
    }

    async generate_sidebar(outputDir, contentRoot) {
      sidebarCalls.push([this.target, outputDir, contentRoot])
      return [{type: 'doc', id: `${this.target}-shared`}]
    }

    destroy() {}
  }

  class FakeUtils {
    pre_process_file_paths(outputDir) {
      fs.rmSync(outputDir, {recursive: true, force: true})
      fs.mkdirSync(outputDir, {recursive: true})
    }
    post_process_file_paths() {}
  }

  Module._load = function patchedLoad(request, parent) {
    if (parent?.filename?.endsWith('/packages/docs-tooling/src/lark/index.js')) {
      if (request === './larkDocScraper.js') return FakeScraper
      if (request === './larkDocWriter.js') return FakeWriter
      if (request === './larkUtils.js') return FakeUtils
      if (request === './incrementalFetchPlanner') return {
        planIncrementalFetch() {
          return {...sourcePlan, generated_at: new Date().toISOString()}
        },
        writeIncrementalFetchPlanReports(plan, prefix) {
          fs.mkdirSync(path.dirname(prefix), {recursive: true})
          fs.writeFileSync(`${prefix}.json`, `${JSON.stringify(plan)}\n`)
          fs.writeFileSync(`${prefix}.md`, '# plan\n')
          return {jsonPath: `${prefix}.json`, markdownPath: `${prefix}.md`}
        },
      }
      if (request === './incrementalReconciliation') return {cleanupRemovedIncrementalRecords() {}}
      if (request === './sourceSnapshot') return {
        readSnapshot(file) {
          return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
        },
        createSourceSnapshot({docSourceDir}) {
          return {manual: 'guides', build_env: 'uat', source_dir: path.resolve(docSourceDir), records: []}
        },
        validateCandidateSnapshot() {},
        writeSnapshot(file, snapshot) {
          fs.mkdirSync(path.dirname(file), {recursive: true})
          fs.writeFileSync(file, `${JSON.stringify(snapshot)}\n`)
        },
      }
      if (request === './sourceCompleteness') return {
        validateSourceCompleteness() { return {complete: true, validCanonicalSources: 1, expectedCanonicalSources: 1} },
        assertSourceCompleteness({sourceDir: configuredSourceDir, snapshot}) {
          completenessSnapshots.push(snapshot.source_dir)
          assert.equal(snapshot.source_dir, path.resolve(configuredSourceDir))
          assert.equal(fs.existsSync(path.join(configuredSourceDir, 'root-token.json')), true)
        },
      }
    }
    return originalLoad.apply(this, arguments)
  }

  try {
    process.chdir(root)
    fs.mkdirSync(sourceDir, {recursive: true})
    fs.writeFileSync(path.join(sourceDir, 'root-token.json'), JSON.stringify({
      node_token: 'root-token', node_type: 'folder', title: 'Guides', children: [],
    }))
    fs.mkdirSync(path.dirname(baselinePath), {recursive: true})
    fs.writeFileSync(baselinePath, `${JSON.stringify({
      manual: 'guides', build_env: 'uat', source_dir: path.resolve(sourceDir), records: [],
    })}\n`)
    delete require.cache[require.resolve('./index')]
    delete require.cache[require.resolve('./cli')]
    const {parseArgs, run, runtimeInvocation} = require('./cli')
    const sourceArgs = [
      '--manual', 'guides',
      '--site', 'en',
      '--source', 'english',
      '--generator-manual', 'guides',
      '--snapshot-path', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
      '--generator-target', 'zilliz.saas',
      '--source-type', 'wiki',
      '--root', 'root-token',
      '--base', 'base-token:*',
      '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/guides',
      '--stage', 'tmp/docs-tooling/en/guides/source',
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
    ]
    const saasArgs = renderArgs({
      manual: 'guides', target: 'zilliz.saas', stage: 'tmp/docs-tooling/en/guides',
      outputDir: 'content/en/guides/tutorials', contentRoot: 'content/en/guides',
      sidebarPath: 'generated/en/sidebars/guides.sidebar.js',
    })
    const paasArgs = renderArgs({
      manual: 'guides-byoc', target: 'zilliz.paas', stage: 'tmp/docs-tooling/en/guides-byoc',
      outputDir: 'content/en/byoc/tutorials', contentRoot: 'content/en/byoc',
      sidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js',
    })

    assert.equal(fs.existsSync(candidatePath), false)
    await run(sourceArgs)
    assert.equal(fs.existsSync(candidatePath), true)
    assert.deepEqual(sourceTokenFetches, [[]])
    assert.equal(fullSourceFetchCalls, 0)

    for (const args of [saasArgs, paasArgs]) {
      const invocation = runtimeInvocation(parseArgs(args))
      assert.equal(invocation.generatorArgs.includes('--skipSourceDown'), true)
      assert.equal(invocation.generatorArgs.includes('--incremental'), false)
      await run(args)
    }

    const saasOutput = path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials')
    const paasOutput = path.join(root, 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials')
    assert.equal(fs.existsSync(path.join(saasOutput, 'shared.md')), true)
    assert.equal(fs.existsSync(path.join(saasOutput, 'saas-only.md')), true)
    assert.equal(fs.existsSync(path.join(paasOutput, 'shared.md')), true)
    assert.equal(fs.existsSync(path.join(paasOutput, 'saas-only.md')), false)
    assert.equal(fs.existsSync(path.join(root, 'tmp/docs-tooling/en/guides/generated/en/sidebars/guides.sidebar.js')), true)
    assert.equal(fs.existsSync(path.join(root, 'tmp/docs-tooling/en/guides-byoc/generated/en/sidebars/guides-byoc.sidebar.js')), true)
    assert.deepEqual(seenTargets, ['zilliz.saas', 'zilliz.paas'])
    assert.deepEqual(fullWrites, ['zilliz.saas', 'zilliz.paas'])
    assert.deepEqual(subtreeWrites, [])
    assert.deepEqual(sidebarCalls.slice(0, 2), [
      ['zilliz.saas', 'tmp/docs-tooling/en/guides/content/en/guides/tutorials', 'tmp/docs-tooling/en/guides/content/en/guides'],
      ['zilliz.paas', 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials', 'tmp/docs-tooling/en/guides-byoc/content/en/byoc'],
    ])
    assert.equal(completenessSnapshots.length, 3)
    assert.equal(new Set(completenessSnapshots).size, 1)
    assert.match(completenessSnapshots[0], /packages\/docs-tooling\/src\/lark\/meta\/sources\/guides$/)

    const writesBeforeSidebarOnly = fullWrites.length
    await run([...saasArgs, '--sidebar-only'])
    assert.equal(fullWrites.length, writesBeforeSidebarOnly)
    assert.deepEqual(sidebarCalls.at(-1), [
      'zilliz.saas',
      'tmp/docs-tooling/en/guides/content/en/guides/tutorials',
      'tmp/docs-tooling/en/guides/content/en/guides',
    ])

    sourcePlan = {
      ...sourcePlan,
      expanded_tokens: ['changed-token'],
      changed_tokens: ['changed-token'],
      reasons_by_token: {'changed-token': ['content changed']},
    }
    await run(sourceArgs)
    assert.deepEqual(sourceTokenFetches, [[], ['changed-token']])
    fs.rmSync(path.join(root, 'tmp/docs-tooling/en/guides'), {recursive: true, force: true})
    await run(saasArgs)
    assert.equal(fs.existsSync(path.join(saasOutput, 'shared.md')), true)
    assert.equal(fs.existsSync(path.join(saasOutput, 'saas-only.md')), true)
    assert.deepEqual(fullWrites, ['zilliz.saas', 'zilliz.paas', 'zilliz.saas'])
    assert.deepEqual(subtreeWrites, [])
    assert.equal(fullSourceFetchCalls, 0)

    failingTarget = 'zilliz.paas'
    fs.rmSync(path.join(root, 'tmp/docs-tooling/en/guides-byoc'), {recursive: true, force: true})
    await assert.rejects(() => run(paasArgs), /render failed for zilliz\.paas/)
    assert.equal(fullSourceFetchCalls, 0)
  } finally {
    process.chdir(originalCwd)
    Module._load = originalLoad
    delete require.cache[require.resolve('./index')]
    delete require.cache[require.resolve('./cli')]
    fs.rmSync(root, {recursive: true, force: true})
  }
})
