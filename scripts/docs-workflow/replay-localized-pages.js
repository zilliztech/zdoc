#!/usr/bin/env node
// Hermetic isolated bare-remote replay harness for localized zh-CN Guides Fetch wiring (ZH-WP6b).
// NEVER pushes to real `origin` or modifies real `dev` — every Git remote is a local temporary bare repository.
'use strict'

const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const localizedRouting = require('../../packages/docs-tooling/src/lark/localizedPageRouting')
const sharedRouting = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
const { createSourceSnapshot, validateCandidateSnapshot } = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const { planIncrementalFetch } = require('../../packages/docs-tooling/src/lark/incrementalFetchPlanner')
const { validateGuidesBasePreflight } = require('../../packages/docs-tooling/src/lark/guidesBasePreflight')
const localizedWorkflow = require('./guides-localized-sources')
const { createCheckpointArtifact } = require('./create-checkpoint-artifact')
const { publishCheckpointTransaction } = require('./checkpoint-publication')

const TOOLING = path.resolve(__dirname, '../..')
const FIXED_TIME = '2026-11-27T08:00:00.000Z'
const EN_CURRENT_SHA = '1'.repeat(64)
const EN_NEXT_SHA = '2'.repeat(64)
const EN_NEXT_SHIFTED_SHA = '9'.repeat(64)

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function writeRel(root, rel, content) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function initGit(root, branch) {
  git(root, 'init', '--quiet', `--initial-branch=${branch}`)
  git(root, 'config', 'user.name', 'ZH Replay Bot')
  git(root, 'config', 'user.email', 'zh-replay@example.test')
}

function commitAll(root, msg) {
  git(root, 'add', '-A')
  git(root, 'commit', '--quiet', '-m', msg)
  return git(root, 'rev-parse', 'HEAD')
}

function makePageYaml(page) {
  return `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: ${page}
sync_policy: independent
`
}

function makeBaselineJson(page, sourceMd, devCommit, nextSha = EN_NEXT_SHA) {
  const crypto = require('node:crypto')
  const sourceSha = crypto.createHash('sha256').update(sourceMd, 'utf8').digest('hex')
  return JSON.stringify(
    {
      schema_version: 1,
      page_id: page,
      en_baseline: {
        manual: 'guides',
        shared_page: page,
        dev_commit: devCommit,
        en_path: `content/en/guides/tutorials/manage-data/${page}.md`,
        manifest_path: `generated/en/manifests/shared-pages/guides/${page}.json`,
        file_sha256: EN_CURRENT_SHA,
        channels: {
          current_sha256: EN_CURRENT_SHA,
          next_sha256: nextSha,
        },
      },
      zh_reviewed: {
        source_sha256: sourceSha,
        reviewed_pr: 1526,
        updated_at: FIXED_TIME,
      },
      last_notified_en_sha: null,
      sections: [],
    },
    null,
    2,
  )
}

function zhBaseRecord(recordId, page, pageUrl, { docLink = null, channel = 'CURRENT', order = 0 } = {}) {
  return {
    record_id: recordId,
    base_table_id: 'tbl-zh-guides',
    base_table_name: '从这里开始',
    base_record_index: order,
    fields: {
      'Placement Type': 'canonical',
      Labels: `中文标签 ${page}`,
      Slug: page,
      'Page URL': pageUrl,
      Progress: 'Published',
      Targets: ['zilliz.saas'],
      'Release Channel': channel,
      Docs: {
        text: page,
        link: docLink || `https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/${page}`,
      },
    },
  }
}

function createIsolatedFixture(t, { pages = ['delete-entities', 'insert-entities'] } = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'zh-wp6b-replay-')))
  if (t) t.after(() => fs.rmSync(root, { recursive: true, force: true }))

  const masterRoot = path.join(root, 'master')
  const devRoot = path.join(root, 'dev')
  const bareRemote = path.join(root, 'remote.git')
  const sourceDir = path.join(root, 'sources')

  for (const dir of [masterRoot, devRoot, sourceDir]) fs.mkdirSync(dir, { recursive: true })

  // 1. Seed isolated `dev` baseline with protected trees to prove strict write-boundary isolation
  initGit(devRoot, 'dev')
  writeRel(devRoot, 'content/en/guides/tutorials/manage-data/en-untouched.md', '---\ntitle: EN Untouched\n---\nEN guides body.\n')
  writeRel(devRoot, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/ja-untouched.md', '---\ntitle: JA Untouched\n---\nJA guides body.\n')
  writeRel(devRoot, 'content/zh-CN/reference/api/restful/restful/rest-untouched.md', '---\ntitle: ZH REST\n---\nZH REST body.\n')
  writeRel(devRoot, 'content/zh-CN/guides/tutorials/tools/cli-untouched.md', '---\ntitle: ZH Tools\n---\nAgent-owned tools.\n')
  writeRel(devRoot, 'content/zh-CN/guides/tutorials/home.md', '---\ntitle: ZH Home\n---\nExternally owned Chinese Guides home.\n')
  writeRel(devRoot, 'generated/zh-CN/sidebars/guides.sidebar.js', 'module.exports = [];\n')
  writeRel(devRoot, 'generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'module.exports = [];\n')
  writeRel(devRoot, 'generated/zh-CN/sidebars/tools.sidebar.js', 'module.exports = [];\n')
  const devCommit = commitAll(devRoot, 'initial isolated dev baseline')

  // Create local temporary bare Git remote and assert it is strictly local!
  git(root, 'init', '--bare', '--quiet', bareRemote)
  git(devRoot, 'remote', 'add', 'replay', bareRemote)
  git(devRoot, 'push', '--quiet', 'replay', 'HEAD:refs/heads/dev')
  for (const remote of git(devRoot, 'remote').split('\n').filter(Boolean)) {
    const url = git(devRoot, 'remote', 'get-url', remote)
    assert.ok(path.isAbsolute(url) && url.startsWith(root), `Replay remote must stay strictly local: ${url}`)
  }

  // 2. Seed isolated `master` repository with pinned localized zh-CN Guides sources
  initGit(masterRoot, 'master')
  writeRel(
    masterRoot,
    'localized-docs/zh-CN/guides/Variables.json',
    JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn', region: 'ali-cn-hangzhou' }, null, 2),
  )
  writeRel(masterRoot, 'localized-docs/zh-CN/guides/fragments/cn-tip.md', '中国站专属提示（v1）。\n')

  const defaultSourceByPage = {
    'delete-entities': `# 删除实体

使用 {{var.endpoint}} 在 <UI>数据管理</UI> 中删除实体（地域：{{var.region}}）。

<NextChannel action="exclude">
旧版删除过滤说明。
</NextChannel>

<NextChannel action="include">
新版删除过滤说明，支持更严格的表达式校验。
</NextChannel>

<!-- localized-docs:authored-channel:cn-keep -->
<NextChannel action="include">
作者手工保留的中国站通道块。
</NextChannel>
`,
    'insert-entities': `# 插入实体

使用 {{var.endpoint}} 插入向量数据到 <UI>Collection</UI>。
`,
  }

  for (const page of pages) {
    const md = defaultSourceByPage[page] || `# ${page}\n\n使用 {{var.endpoint}}。\n`
    writeRel(masterRoot, `localized-docs/zh-CN/guides/pages/${page}/page.yaml`, makePageYaml(page))
    writeRel(masterRoot, `localized-docs/zh-CN/guides/pages/${page}/source.md`, md)
    writeRel(
      masterRoot,
      `localized-docs/zh-CN/guides/pages/${page}/.baseline.json`,
      makeBaselineJson(page, md, devCommit),
    )
  }
  const masterCommit = commitAll(masterRoot, 'initial pinned localized sources')

  const records = pages.map((page, idx) =>
    zhBaseRecord(`rec-zh-${idx}`, page, `tutorials/manage-data/${page}`, { order: idx }),
  )

  return {
    root,
    masterRoot,
    devRoot,
    bareRemote,
    sourceDir,
    masterCommit,
    devCommit,
    records,
    sequence: 0,
  }
}

async function runLocalizedRound(fixture, {
  records = fixture.records,
  promoteByPageUrl = null,
  promoteByPage = null,
  expectNoChange = false,
  runId = null,
} = {}) {
  fixture.sequence += 1
  const roundDir = path.join(fixture.root, `round-${fixture.sequence}`)
  const bundleDir = path.join(roundDir, 'bundle')
  const assemblyDir = path.join(roundDir, 'assembly')
  const checkpointDir = path.join(roundDir, 'checkpoint')
  fs.mkdirSync(roundDir, { recursive: true })

  // 1. Source stage: generate localized bundle strictly from pinned masterCommit + devCommit
  const bundle = await localizedWorkflow.generateLocalizedSources({
    records,
    repositoryRoot: fixture.masterRoot,
    baselineRoot: fixture.devRoot,
    masterCommit: fixture.masterCommit,
    devCommit: fixture.devCommit,
    out: bundleDir,
    runId: runId || `replay-${fixture.sequence}`,
    promoteByPageUrl,
    promoteByPage,
  })
  assert.ok(bundle, 'Expected non-null localized bundle')

  // 2. Assembly stage: fresh detached checkout of devCommit + finalize localized publication
  git(fixture.root, 'clone', '--quiet', fixture.devRoot, assemblyDir)
  git(assemblyDir, 'checkout', '--quiet', '--detach', fixture.devCommit)

  const finalized = localizedWorkflow.finalizeLocalizedPublication({
    workspace: assemblyDir,
    bundleRoot: bundleDir,
    masterSha: fixture.masterCommit,
    devBaselineSha: fixture.devCommit,
  })
  assert.ok(finalized)

  // Validate finalized outputs before checkpointing
  const validated = localizedWorkflow.validateLocalizedPublication({ workspace: assemblyDir })
  assert.equal(validated.valid, true)

  // 3. Create checkpoint artifact under site=zh-CN group=guides
  const prevSite = process.env.ZDOC_SITE
  process.env.ZDOC_SITE = 'zh-CN'
  const validateCmd = `node '${path.join(__dirname, 'guides-localized-sources.js').replaceAll("'", "'\\''")}' --operation validate --workspace .`
  let manifest
  try {
    manifest = await createCheckpointArtifact({
      group: 'guides',
      masterSha: fixture.masterCommit,
      devBaselineSha: fixture.devCommit,
      baselineDir: fixture.devRoot,
      workspace: assemblyDir,
      output: checkpointDir,
      validationCommands: [validateCmd],
      createdAt: FIXED_TIME,
    })
  } finally {
    if (prevSite === undefined) delete process.env.ZDOC_SITE
    else process.env.ZDOC_SITE = prevSite
  }

  // 4. Publish checkpoint atomically to the isolated local bare remote (`replay`)
  git(fixture.devRoot, 'fetch', '--quiet', fixture.masterRoot, fixture.masterCommit)
  const runnerTemp = path.join(roundDir, 'runner-temp')
  fs.mkdirSync(runnerTemp, { recursive: true })

  const phases = []
  const pubResult = await publishCheckpointTransaction({
    repositoryRoot: fixture.devRoot,
    dependencyRoot: TOOLING,
    artifactDir: checkpointDir,
    remote: 'replay',
    runnerTemp,
    unit: {
      unitKey: 'source/guides-zh-CN',
      group: 'guides',
      toolingSha: fixture.masterCommit,
      sourceBaselineSha: fixture.devCommit,
      targetBranch: 'dev',
      commitMessage: `docs(guides-zh-CN): localized replay round ${fixture.sequence}`,
      validationCommands: [validateCmd],
      environment: { SITE: 'zh-CN', ZDOC_SITE: 'zh-CN' },
    },
    log: line => phases.push(line),
  })

  if (expectNoChange) {
    assert.equal(pubResult.status, 'no_changes', JSON.stringify(pubResult))
    assert.deepEqual(pubResult.commitShas, [])
    assert.equal(pubResult.resultSha, fixture.devCommit)
    assert.equal(git(fixture.bareRemote, 'rev-parse', 'refs/heads/dev'), fixture.devCommit)
    return { bundle, finalized, manifest, pubResult, changed: [], phases }
  }

  assert.equal(pubResult.status, 'published', JSON.stringify(pubResult))
  assert.equal(pubResult.commitShas.length, 1)
  assert.equal(git(fixture.bareRemote, 'rev-parse', 'refs/heads/dev'), pubResult.resultSha)

  const changed = git(fixture.devRoot, 'diff-tree', '--no-commit-id', '--name-only', '-r', pubResult.resultSha)
    .split('\n')
    .filter(Boolean)

  // Fast-forward local devRoot to the new isolated bare remote tip
  git(fixture.devRoot, 'merge', '--quiet', '--ff-only', pubResult.resultSha)
  fixture.devCommit = pubResult.resultSha

  return { bundle, finalized, manifest, pubResult, changed, phases }
}

function assertStrictWriteBoundaryIsolation(fixture, commitSha, baseCommitSha) {
  const changed = git(fixture.devRoot, 'diff-tree', '--no-commit-id', '--name-only', '-r', commitSha)
    .split('\n')
    .filter(Boolean)
  for (const file of changed) {
    const allowed =
      (file.startsWith('content/zh-CN/guides/') &&
        !file.startsWith('content/zh-CN/guides/tutorials/tools/') &&
        file !== 'content/zh-CN/guides/tutorials/home.md' &&
        file !== 'content/zh-CN/guides/home.md' &&
        file !== 'content/zh-CN/guides/index.md') ||
      file.startsWith('generated/zh-CN/manifests/localized-pages/guides/')
    assert.ok(allowed, `Checkpoint commit violated zh-CN Guides write boundary: ${file}`)
  }

  const protectedFiles = [
    'content/en/guides/tutorials/manage-data/en-untouched.md',
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/ja-untouched.md',
    'content/zh-CN/reference/api/restful/restful/rest-untouched.md',
    'content/zh-CN/guides/tutorials/tools/cli-untouched.md',
    'content/zh-CN/guides/tutorials/home.md',
  ]
  for (const file of protectedFiles) {
    assert.equal(
      git(fixture.devRoot, 'show', `${commitSha}:${file}`),
      git(fixture.devRoot, 'show', `${baseCommitSha}:${file}`),
      `Protected file must remain byte-identical: ${file}`,
    )
  }
}

async function runAllReplayScenarios({ evidenceRoot = null } = {}) {
  const report = {
    kind: 'localized-pages-isolated-bare-remote-replay',
    generated_at: FIXED_TIME,
    scenarios: [],
  }

  const fx = createIsolatedFixture(null)
  const initialDevSha = fx.devCommit

  try {
    // Scenario 1: Cold publish + Warm zero-drift reuse
    const r1 = await runLocalizedRound(fx, { runId: 's1-cold' })
    assert.deepEqual(r1.bundle.outcomes.map(o => [o.page, o.status]), [
      ['delete-entities', 'success'],
      ['insert-entities', 'success'],
    ])
    assertStrictWriteBoundaryIsolation(fx, r1.pubResult.resultSha, initialDevSha)

    const r1Warm = await runLocalizedRound(fx, { expectNoChange: true, runId: 's1-warm' })
    assert.deepEqual(r1Warm.bundle.outcomes.map(o => [o.page, o.status]), [
      ['delete-entities', 'reused'],
      ['insert-entities', 'reused'],
    ])
    assert.ok(r1Warm.phases.some(line => line.includes('phase=noop_short_circuit')))
    report.scenarios.push({
      id: 1,
      name: 'cold-and-warm-zero-drift-reuse',
      status: 'passed',
      coldSha: r1.pubResult.resultSha,
      warmStatus: r1Warm.pubResult.status,
      changedFiles: r1.changed.length,
    })

    // Scenario 2: Feishu unchanged, Git Chinese source updated (plus dirty worktree ignored!)
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cn-v2.zilliz.com.cn', region: 'ali-cn-shanghai' }, null, 2))
    fx.masterCommit = commitAll(fx.masterRoot, 'update Chinese Variables.json without Feishu change')
    // Inject dirty uncommitted bytes that MUST be ignored!
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/insert-entities/source.md', '# DIRTY UNCOMMITTED\n')
    const r2 = await runLocalizedRound(fx, { runId: 's2-git-delta' })
    assert.deepEqual(r2.bundle.outcomes.map(o => [o.page, o.status]), [
      ['delete-entities', 'success'],
      ['insert-entities', 'success'],
    ])
    const publishedInsert = fs.readFileSync(
      path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/insert-entities.md'),
      'utf8',
    )
    assert.match(publishedInsert, /https:\/\/cn-v2\.zilliz\.com\.cn/)
    assert.doesNotMatch(publishedInsert, /DIRTY UNCOMMITTED/)
    git(fx.masterRoot, 'checkout', '--', 'localized-docs/zh-CN/guides/pages/insert-entities/source.md')
    report.scenarios.push({
      id: 2,
      name: 'feishu-unchanged-git-source-updated',
      status: 'passed',
      resultSha: r2.pubResult.resultSha,
    })

    // Scenario 3: Single-page build failure fallback while healthy sibling publishes
    const deleteBeforeFallback = fs.readFileSync(
      path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
    )
    const deleteOrigSource = fs.readFileSync(
      path.join(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md'),
      'utf8',
    )
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', '---\nslug: /forbidden\n---\n# Broken\n')
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/insert-entities/source.md', '# 插入实体 v2\n\n兄弟页面正常发布（{{var.endpoint}}）。\n')
    fx.masterCommit = commitAll(fx.masterRoot, 'corrupt delete-entities and update sibling')
    const r3 = await runLocalizedRound(fx, { runId: 's3-single-fallback' })
    assert.equal(r3.bundle.cache_eligible, false)
    assert.equal(r3.bundle.outcomes.find(o => o.page === 'delete-entities').status, 'fallback')
    assert.equal(r3.bundle.outcomes.find(o => o.page === 'insert-entities').status, 'success')
    assert.deepEqual(
      fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
      deleteBeforeFallback,
    )
    assert.match(
      fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/insert-entities.md'), 'utf8'),
      /兄弟页面正常发布/,
    )
    // Restore healthy delete-entities source
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', deleteOrigSource)
    fx.masterCommit = commitAll(fx.masterRoot, 'restore healthy delete-entities')
    report.scenarios.push({
      id: 3,
      name: 'single-page-failure-fallback-sibling-publishes',
      status: 'passed',
      resultSha: r3.pubResult.resultSha,
    })

    // Scenario 4: Ownership violations (OWNERSHIP_REVERTED, OWNERSHIP_PATH_MISMATCH EN & zh-CN, duplicate page-id)
    const bareBeforeViolations = git(fx.bareRemote, 'rev-parse', 'refs/heads/dev')
    // 4a: OWNERSHIP_REVERTED
    await assert.rejects(
      localizedWorkflow.generateLocalizedSources({
        records: [
          zhBaseRecord('rec-zh-0', 'delete-entities', 'tutorials/manage-data/delete-entities', {
            docLink: 'https://zilliverse.feishu.cn/wiki/reverted-token',
          }),
        ],
        repositoryRoot: fx.masterRoot,
        baselineRoot: fx.devRoot,
        masterCommit: fx.masterCommit,
        devCommit: fx.devCommit,
        out: path.join(fx.root, 'violation-reverted'),
        runId: 's4-reverted',
      }),
      { code: 'OWNERSHIP_REVERTED' },
    )
    // 4b: OWNERSHIP_PATH_MISMATCH (shared-docs on zh-CN and localized-docs on en)
    assert.equal(
      localizedRouting.classifyLocalizedSourceRoute(
        'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/delete-entities',
        { site: 'zh-CN', availablePages: ['delete-entities'] },
      ).code,
      'OWNERSHIP_PATH_MISMATCH',
    )
    assert.equal(
      sharedRouting.classifySourceRoute(
        'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities',
      ).code,
      'OWNERSHIP_PATH_MISMATCH',
    )
    // 4c: Duplicate <page-id> across two page_urls
    const dupCtx = localizedRouting.createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities'],
      records: [
        zhBaseRecord('rec-dup-1', 'delete-entities', 'tutorials/manage-data/delete-entities'),
        zhBaseRecord('rec-dup-2', 'delete-entities', 'tutorials/manage-data/delete-entities-dup'),
      ],
    })
    assert.equal(dupCtx.errors.length, 1)
    assert.match(dupCtx.errors[0].message, /Duplicate localized page owner/)
    assert.equal(git(fx.bareRemote, 'rev-parse', 'refs/heads/dev'), bareBeforeViolations)
    report.scenarios.push({
      id: 4,
      name: 'duplicate-activation-and-ownership-violations',
      status: 'passed',
    })

    // Scenario 5: record_id change immunity (recOLD -> recNEW) for BOTH normal publish AND fallback
    const movedRecords = [
      zhBaseRecord('rec-MOVED-ALPHA', 'delete-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
      zhBaseRecord('rec-MOVED-BETA', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
    ]
    const r5Reuse = await runLocalizedRound(fx, { records: movedRecords, runId: 's5-moved-id' })
    assert.deepEqual(r5Reuse.bundle.outcomes.map(o => [o.page, o.status]), [
      ['delete-entities', 'reused'],
      ['insert-entities', 'reused'],
    ])
    const activeAfterMove = localizedRouting.readLocalizedActiveState(fx.devRoot)
    assert.equal(activeAfterMove.pages.find(p => p.page === 'delete-entities').last_seen_record_id, 'rec-MOVED-ALPHA')
    assert.equal(activeAfterMove.pages.find(p => p.page === 'insert-entities').last_seen_record_id, 'rec-MOVED-BETA')

    // Fallback also works with changed record_id!
    const insertBaselineBytes = fs.readFileSync(
      path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/insert-entities.md'),
    )
    const insertOrigSource = fs.readFileSync(
      path.join(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/insert-entities/source.md'),
      'utf8',
    )
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/insert-entities/source.md', 'import Bad from "x";\n# Broken\n')
    fx.masterCommit = commitAll(fx.masterRoot, 'break insert-entities after record_id move')
    const movedAgainRecords = [
      zhBaseRecord('rec-MOVED-ALPHA-2', 'delete-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
      zhBaseRecord('rec-MOVED-BETA-2', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
    ]
    const r5Fallback = await runLocalizedRound(fx, { records: movedAgainRecords, runId: 's5-moved-fallback' })
    assert.equal(r5Fallback.bundle.outcomes.find(o => o.page === 'insert-entities').status, 'fallback')
    assert.deepEqual(
      fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/insert-entities.md')),
      insertBaselineBytes,
    )
    writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/insert-entities/source.md', insertOrigSource)
    fx.masterCommit = commitAll(fx.masterRoot, 'restore insert-entities after s5')
    report.scenarios.push({
      id: 5,
      name: 'record-id-change-immunity-normal-and-fallback',
      status: 'passed',
      resultSha: r5Fallback.pubResult.resultSha,
    })

    // Scenario 6: Rename & deletion protection
    // 6a: Active page_url points to a renamed <page-id>
    const renamedRecords = [
      zhBaseRecord('rec-rename', 'insert-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
      zhBaseRecord('rec-keep', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
    ]
    const r6Rename = await localizedWorkflow.generateLocalizedSources({
      records: renamedRecords,
      repositoryRoot: fx.masterRoot,
      baselineRoot: fx.devRoot,
      masterCommit: fx.masterCommit,
      devCommit: fx.devCommit,
      out: path.join(fx.root, 's6-rename'),
      runId: 's6-rename',
    })
    assert.equal(
      r6Rename.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities').status,
      'fallback',
    )
    assert.equal(
      r6Rename.effective_active.pages.find(p => p.page_url === 'tutorials/manage-data/delete-entities').page,
      'delete-entities',
    )

    // 6b: Active page omitted from Base records (deletion protection)
    const r6Delete = await localizedWorkflow.generateLocalizedSources({
      records: [zhBaseRecord('rec-only-one', 'insert-entities', 'tutorials/manage-data/insert-entities')],
      repositoryRoot: fx.masterRoot,
      baselineRoot: fx.devRoot,
      masterCommit: fx.masterCommit,
      devCommit: fx.devCommit,
      out: path.join(fx.root, 's6-delete'),
      runId: 's6-delete',
    })
    const delOutcome = r6Delete.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities')
    assert.equal(delOutcome.status, 'fallback')
    assert.equal(delOutcome.code, 'OWNERSHIP_DELETION_PROTECTED')
    assert.ok(delOutcome.baseline.output)
    assert.ok(r6Delete.effective_active.pages.some(p => p.page === 'delete-entities'))

    // 6c: Pinned master directory deleted
    fs.rmSync(path.join(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities'), { recursive: true, force: true })
    const deletedDirSha = commitAll(fx.masterRoot, 'delete pinned master page dir')
    const r6MissingDir = await localizedWorkflow.generateLocalizedSources({
      records: movedAgainRecords,
      repositoryRoot: fx.masterRoot,
      baselineRoot: fx.devRoot,
      masterCommit: deletedDirSha,
      devCommit: fx.devCommit,
      out: path.join(fx.root, 's6-missing-dir'),
      runId: 's6-missing-dir',
    })
    assert.equal(
      r6MissingDir.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities').code,
      'OWNERSHIP_CONFIG_MISSING',
    )
    assert.ok(r6MissingDir.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities').baseline.output)
    // Restore master to pre-deletion commit
    git(fx.masterRoot, 'checkout', fx.masterCommit, '--', 'localized-docs/zh-CN/guides/pages/delete-entities')
    fx.masterCommit = commitAll(fx.masterRoot, 'restore deleted dir for s7')
    report.scenarios.push({
      id: 6,
      name: 'rename-and-deletion-protection',
      status: 'passed',
    })

    // Scenario 7: Reviewed NEXT channel Promote (success + PROMOTE_EN_MISMATCH fallback)
    const beforePromoteBytes = fs.readFileSync(
      path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
    )
    // 7a: Shifted EN NEXT -> PROMOTE_EN_MISMATCH preserves previous live Chinese!
    const r7Mismatch = await runLocalizedRound(fx, {
      records: movedAgainRecords,
      promoteByPageUrl: {
        'tutorials/manage-data/delete-entities': { expectedEnNextSha: EN_NEXT_SHIFTED_SHA },
      },
      runId: 's7-mismatch',
    })
    assert.equal(
      r7Mismatch.bundle.outcomes.find(o => o.page === 'delete-entities').code,
      'PROMOTE_EN_MISMATCH',
    )
    assert.deepEqual(
      fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
      beforePromoteBytes,
    )

    // 7b: Matching EN NEXT -> unwraps include, removes exclude, preserves authored marker, publishes!
    const r7Ok = await runLocalizedRound(fx, {
      records: movedAgainRecords,
      promoteByPageUrl: {
        'tutorials/manage-data/delete-entities': { expectedEnNextSha: EN_NEXT_SHA },
      },
      runId: 's7-promote-ok',
    })
    const promotedOutcome = r7Ok.bundle.outcomes.find(o => o.page === 'delete-entities')
    assert.equal(promotedOutcome.status, 'success')
    assert.equal(promotedOutcome.promoted.unwrappedIncludeCount, 1)
    assert.equal(promotedOutcome.promoted.removedExcludeCount, 1)
    assert.deepEqual(promotedOutcome.promoted.preservedAuthoredBlockIds, ['cn-keep'])
    const promotedText = fs.readFileSync(
      path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
      'utf8',
    )
    assert.match(promotedText, /新版删除过滤说明/)
    assert.doesNotMatch(promotedText, /旧版删除过滤说明/)
    assert.match(promotedText, /作者手工保留的中国站通道块/)
    report.scenarios.push({
      id: 7,
      name: 'reviewed-next-channel-promote-and-mismatch-guard',
      status: 'passed',
      resultSha: r7Ok.pubResult.resultSha,
    })

    // Scenario 8: Strict write-boundary isolation (checkpoint + hostile page_url rejection)
    assertStrictWriteBoundaryIsolation(fx, fx.devCommit, initialDevSha)
    for (const forbiddenUrl of ['tutorials/tools/evil-tool', 'home', 'tutorials/home', 'index']) {
      assert.throws(
        () => localizedRouting.resolveLocalizedGuidesOutputPath(forbiddenUrl),
        { code: 'OWNERSHIP_PATH_MISMATCH' },
      )
    }
    report.scenarios.push({
      id: 8,
      name: 'strict-write-boundary-isolation',
      status: 'passed',
      finalDevSha: fx.devCommit,
    })

    report.final_dev_sha = fx.devCommit
    report.master_sha = fx.masterCommit
    report.scenario_count = report.scenarios.length
    report.all_passed = report.scenarios.every(s => s.status === 'passed')

    if (evidenceRoot) {
      const resolvedEvidence = path.resolve(evidenceRoot)
      fs.mkdirSync(resolvedEvidence, { recursive: true })
      fs.writeFileSync(
        path.join(resolvedEvidence, 'localized-pages-replay-report.json'),
        `${JSON.stringify(report, null, 2)}\n`,
      )
    }

    return report
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true })
  }
}

if (require.main === module) {
  const argv = process.argv.slice(2)
  let evidenceRoot = null
  for (let i = 0; i < argv.length; i += 2) {
    if (argv[i] === '--evidence-root' && argv[i + 1]) {
      evidenceRoot = argv[i + 1]
    }
  }
  runAllReplayScenarios({ evidenceRoot })
    .then(report => {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
    })
    .catch(error => {
      console.error(error.stack || error.message)
      process.exitCode = 1
    })
}

module.exports = {
  createIsolatedFixture,
  runLocalizedRound,
  assertStrictWriteBoundaryIsolation,
  runAllReplayScenarios,
  zhBaseRecord,
  EN_CURRENT_SHA,
  EN_NEXT_SHA,
  EN_NEXT_SHIFTED_SHA,
  writeRel,
  commitAll,
  git,
}
