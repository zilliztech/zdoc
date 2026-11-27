'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const replay = require('./replay-localized-pages')
const localizedRouting = require('../../packages/docs-tooling/src/lark/localizedPageRouting')
const sharedRouting = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
const localizedWorkflow = require('./guides-localized-sources')

const timeout = 120000

test('[ZH-WP6b-1] cold publish and warm zero-drift reuse against isolated local bare remote', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  const initialDev = fx.devCommit

  const cold = await replay.runLocalizedRound(fx, { runId: 'test-1-cold' })
  assert.deepEqual(cold.bundle.outcomes.map(o => [o.page, o.status]), [
    ['delete-entities', 'success'],
    ['insert-entities', 'success'],
  ])
  assert.ok(cold.changed.includes('generated/zh-CN/manifests/localized-pages/guides/active.json'))
  assert.ok(cold.changed.includes('generated/zh-CN/manifests/localized-pages/guides/delete-entities.json'))
  assert.ok(cold.changed.includes('content/zh-CN/guides/tutorials/manage-data/delete-entities.md'))
  replay.assertStrictWriteBoundaryIsolation(fx, cold.pubResult.resultSha, initialDev)

  const warm = await replay.runLocalizedRound(fx, { expectNoChange: true, runId: 'test-1-warm' })
  assert.deepEqual(warm.bundle.outcomes.map(o => [o.page, o.status]), [
    ['delete-entities', 'reused'],
    ['insert-entities', 'reused'],
  ])
  assert.ok(warm.phases.some(line => line.includes('phase=noop_short_circuit')))
})

test('[ZH-WP6b-2] Feishu unchanged while Git Chinese source updates invalidates cache and ignores dirty worktree', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-2-seed' })

  const beforeReceipt = fs.readFileSync(
    path.join(fx.devRoot, 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json'),
    'utf8',
  )
  replay.writeRel(
    fx.masterRoot,
    'localized-docs/zh-CN/guides/Variables.json',
    JSON.stringify({ endpoint: 'https://updated-cn.zilliz.com.cn', region: 'ali-cn-beijing' }, null, 2),
  )
  fx.masterCommit = replay.commitAll(fx.masterRoot, 'update Chinese Variables.json')

  // Dirty uncommitted edit on master must never leak into pinned build
  replay.writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', '# DIRTY_LEAK\n')

  const updated = await replay.runLocalizedRound(fx, { runId: 'test-2-delta' })
  assert.deepEqual(updated.bundle.outcomes.map(o => [o.page, o.status]), [
    ['delete-entities', 'success'],
    ['insert-entities', 'success'],
  ])
  const afterMdx = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
    'utf8',
  )
  assert.match(afterMdx, /https:\/\/updated-cn\.zilliz\.com\.cn/)
  assert.doesNotMatch(afterMdx, /DIRTY_LEAK/)
  assert.notEqual(
    fs.readFileSync(
      path.join(fx.devRoot, 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json'),
      'utf8',
    ),
    beforeReceipt,
  )
})

test('[ZH-WP6b-3] single-page build failure falls back by page_url while healthy sibling publishes cleanly', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-3-seed' })
  const savedDeleteMdx = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
  )
  const savedDeleteReceipt = fs.readFileSync(
    path.join(fx.devRoot, 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json'),
  )

  replay.writeRel(
    fx.masterRoot,
    'localized-docs/zh-CN/guides/pages/delete-entities/source.md',
    '---\nslug: /forbidden-frontmatter\n---\n# Broken\n',
  )
  replay.writeRel(
    fx.masterRoot,
    'localized-docs/zh-CN/guides/pages/insert-entities/source.md',
    '# 插入实体（健康更新）\n\n同批兄弟页面正常发布。\n',
  )
  fx.masterCommit = replay.commitAll(fx.masterRoot, 'break one page and update sibling')

  const round = await replay.runLocalizedRound(fx, { runId: 'test-3-fallback' })
  assert.equal(round.bundle.cache_eligible, false)
  assert.equal(round.bundle.outcomes.find(o => o.page === 'delete-entities').status, 'fallback')
  assert.equal(round.bundle.outcomes.find(o => o.page === 'insert-entities').status, 'success')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    savedDeleteMdx,
  )
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json')),
    savedDeleteReceipt,
  )
  assert.match(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/insert-entities.md'), 'utf8'),
    /同批兄弟页面正常发布/,
  )
})

test('[ZH-WP6b-4] duplicate activation and ownership violations fail closed across zh-CN and en', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-4-seed' })
  const bareTip = replay.git(fx.bareRemote, 'rev-parse', 'refs/heads/dev')

  // OWNERSHIP_REVERTED when active page_url reverts to Feishu
  await assert.rejects(
    localizedWorkflow.generateLocalizedSources({
      records: [
        replay.zhBaseRecord('rec-reverted', 'delete-entities', 'tutorials/manage-data/delete-entities', {
          docLink: 'https://zilliverse.feishu.cn/wiki/old-feishu-doc',
        }),
      ],
      repositoryRoot: fx.masterRoot,
      baselineRoot: fx.devRoot,
      masterCommit: fx.masterCommit,
      devCommit: fx.devCommit,
      out: path.join(fx.root, 'out-reverted'),
      runId: 'test-4-reverted',
    }),
    { code: 'OWNERSHIP_REVERTED' },
  )

  // OWNERSHIP_PATH_MISMATCH symmetrically on zh-CN and en
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

  // Duplicate <page-id> across two page_urls
  const dup = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    availablePages: ['delete-entities'],
    records: [
      replay.zhBaseRecord('rec-1', 'delete-entities', 'tutorials/manage-data/delete-entities'),
      replay.zhBaseRecord('rec-2', 'delete-entities', 'tutorials/manage-data/second-url'),
    ],
  })
  assert.equal(dup.errors.length, 1)
  assert.match(dup.errors[0].message, /Duplicate localized page owner/)
  assert.equal(replay.git(fx.bareRemote, 'rev-parse', 'refs/heads/dev'), bareTip)
})

test('[ZH-WP6b-5] Feishu record_id change (recOLD -> recNEW) preserves normal publish, reuse, and fallback with zero broken links', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-5-seed' })

  const beforeMdx = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
  )
  const movedRecords = [
    replay.zhBaseRecord('recNEW_AFTER_TABLE_MOVE_0', 'delete-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
    replay.zhBaseRecord('recNEW_AFTER_TABLE_MOVE_1', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
  ]

  // Reuse succeeds with new record_id and updates last_seen_record_id strictly as metadata
  const rMove = await replay.runLocalizedRound(fx, { records: movedRecords, runId: 'test-5-moved' })
  assert.deepEqual(rMove.bundle.outcomes.map(o => [o.page, o.status]), [
    ['delete-entities', 'reused'],
    ['insert-entities', 'reused'],
  ])
  const active = localizedRouting.readLocalizedActiveState(fx.devRoot)
  assert.equal(active.pages.find(p => p.page === 'delete-entities').last_seen_record_id, 'recNEW_AFTER_TABLE_MOVE_0')

  // Single-page failure fallback STILL resolves by page_url even after record_id changes again!
  replay.writeRel(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', 'import Bad from "bad";\n# Bad\n')
  fx.masterCommit = replay.commitAll(fx.masterRoot, 'corrupt after record_id move')
  const movedAgain = [
    replay.zhBaseRecord('recNEWER_0', 'delete-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
    replay.zhBaseRecord('recNEWER_1', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
  ]
  const rFallback = await replay.runLocalizedRound(fx, { records: movedAgain, runId: 'test-5-moved-fallback' })
  assert.equal(rFallback.bundle.outcomes.find(o => o.page === 'delete-entities').status, 'fallback')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    beforeMdx,
  )
})

test('[ZH-WP6b-6] rename and deletion protection preserve live Chinese content via fallback', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-6-seed' })
  const savedMdx = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
  )

  // 6a: Active page_url renamed to another <page-id> -> fail-closed fallback
  const renameRound = await replay.runLocalizedRound(fx, {
    records: [
      replay.zhBaseRecord('rec-zh-0', 'insert-entities', 'tutorials/manage-data/delete-entities', { order: 0 }),
      replay.zhBaseRecord('rec-zh-1', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 }),
    ],
    runId: 'test-6-rename',
  })
  assert.equal(renameRound.bundle.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities').status, 'fallback')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    savedMdx,
  )

  // 6b: Active page omitted from Base records -> OWNERSHIP_DELETION_PROTECTED fallback (zero-write to dev)
  const omitRound = await replay.runLocalizedRound(fx, {
    records: [replay.zhBaseRecord('rec-zh-1', 'insert-entities', 'tutorials/manage-data/insert-entities', { order: 1 })],
    expectNoChange: true,
    runId: 'test-6-delete-record',
  })
  const omitted = omitRound.bundle.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities')
  assert.equal(omitted.status, 'fallback')
  assert.equal(omitted.code, 'OWNERSHIP_DELETION_PROTECTED')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    savedMdx,
  )

  // 6c: Pinned master directory deleted -> OWNERSHIP_CONFIG_MISSING fallback (zero-write to dev)
  fs.rmSync(path.join(fx.masterRoot, 'localized-docs/zh-CN/guides/pages/delete-entities'), { recursive: true, force: true })
  fx.masterCommit = replay.commitAll(fx.masterRoot, 'remove page directory on master')
  const delDirRound = await replay.runLocalizedRound(fx, {
    expectNoChange: true,
    runId: 'test-6-delete-dir',
  })
  const delDir = delDirRound.bundle.outcomes.find(o => o.page_url === 'tutorials/manage-data/delete-entities')
  assert.equal(delDir.status, 'fallback')
  assert.equal(delDir.code, 'OWNERSHIP_CONFIG_MISSING')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    savedMdx,
  )
})

test('[ZH-WP6b-7] reviewed NEXT channel Promote unwraps matching EN NEXT and blocks PROMOTE_EN_MISMATCH', { timeout }, async t => {
  const fx = replay.createIsolatedFixture(t)
  await replay.runLocalizedRound(fx, { runId: 'test-7-seed' })
  const liveBeforePromote = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
  )

  // Mismatched EN NEXT SHA -> PROMOTE_EN_MISMATCH preserves live Chinese unchanged
  const mismatch = await replay.runLocalizedRound(fx, {
    promoteByPageUrl: {
      'tutorials/manage-data/delete-entities': { expectedEnNextSha: replay.EN_NEXT_SHIFTED_SHA },
    },
    runId: 'test-7-mismatch',
  })
  assert.equal(mismatch.bundle.outcomes.find(o => o.page === 'delete-entities').code, 'PROMOTE_EN_MISMATCH')
  assert.deepEqual(
    fs.readFileSync(path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md')),
    liveBeforePromote,
  )

  // Matching EN NEXT SHA -> unwraps include, deletes exclude, preserves authored marker
  const ok = await replay.runLocalizedRound(fx, {
    promoteByPageUrl: {
      'tutorials/manage-data/delete-entities': { expectedEnNextSha: replay.EN_NEXT_SHA },
    },
    runId: 'test-7-ok',
  })
  const promoted = ok.bundle.outcomes.find(o => o.page === 'delete-entities')
  assert.equal(promoted.status, 'success')
  assert.equal(promoted.promoted.unwrappedIncludeCount, 1)
  assert.equal(promoted.promoted.removedExcludeCount, 1)
  assert.deepEqual(promoted.promoted.preservedAuthoredBlockIds, ['cn-keep'])
  const promotedText = fs.readFileSync(
    path.join(fx.devRoot, 'content/zh-CN/guides/tutorials/manage-data/delete-entities.md'),
    'utf8',
  )
  assert.match(promotedText, /新版删除过滤说明/)
  assert.doesNotMatch(promotedText, /旧版删除过滤说明/)
  assert.match(promotedText, /作者手工保留的中国站通道块/)
})

test('[ZH-WP6b-8] strict write-boundary isolation and CLI --evidence-root report generation', { timeout }, async t => {
  const evidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zh-wp6b-evidence-'))
  t.after(() => fs.rmSync(evidenceDir, { recursive: true, force: true }))

  const res = spawnSync(
    process.execPath,
    [path.join(__dirname, 'replay-localized-pages.js'), '--evidence-root', evidenceDir],
    { encoding: 'utf8', timeout },
  )
  assert.equal(res.status, 0, res.stderr || res.stdout)

  const reportPath = path.join(evidenceDir, 'localized-pages-replay-report.json')
  assert.equal(fs.existsSync(reportPath), true)
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  assert.equal(report.all_passed, true)
  assert.equal(report.scenario_count, 8)
  assert.deepEqual(
    report.scenarios.map(s => s.id),
    [1, 2, 3, 4, 5, 6, 7, 8],
  )
})
