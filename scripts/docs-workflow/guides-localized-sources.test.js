'use strict'

const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const workflow = require('./guides-localized-sources')

function writeRel(root, rel, content) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function initRepo(root, branch) {
  git(root, 'init', '--quiet', `--initial-branch=${branch}`)
  git(root, 'config', 'user.name', 'Test Bot')
  git(root, 'config', 'user.email', 'test@example.com')
}

function commitAll(root, msg) {
  git(root, 'add', '.')
  git(root, 'commit', '--quiet', '-m', msg)
  return git(root, 'rev-parse', 'HEAD')
}

function pageYaml(page) {
  return `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: ${page}
sync_policy: independent
`
}

function baseRecord(recordId, page, pageUrl, docLink = `https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/${page}`) {
  return {
    record_id: recordId,
    base_table_id: 'tbl-zh',
    base_table_name: '从这里开始',
    base_record_index: 0,
    fields: {
      'Placement Type': 'canonical',
      Labels: `标签 ${page}`,
      Slug: page,
      'Page URL': pageUrl,
      Progress: 'Published',
      Targets: ['zilliz.saas'],
      Docs: { text: page, link: docLink },
    },
  }
}

function makeFixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-localized-sources-')))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  const master = path.join(root, 'master')
  const baseline = path.join(root, 'baseline')
  const workspace = path.join(root, 'workspace')
  fs.mkdirSync(master)
  fs.mkdirSync(baseline)
  fs.mkdirSync(workspace)

  initRepo(master, 'master')
  writeRel(master, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn' }))
  writeRel(master, 'localized-docs/zh-CN/guides/pages/alpha/page.yaml', pageYaml('alpha'))
  writeRel(master, 'localized-docs/zh-CN/guides/pages/alpha/source.md', '# Alpha 页面\n\n使用 {{var.endpoint}} 访问 <UI>集群</UI>。\n')
  writeRel(master, 'localized-docs/zh-CN/guides/pages/beta/page.yaml', pageYaml('beta'))
  writeRel(master, 'localized-docs/zh-CN/guides/pages/beta/source.md', '# Beta 页面\n\n正常兄弟页面内容。\n')
  const masterCommit = commitAll(master, 'initial localized pages')

  initRepo(baseline, 'dev')
  writeRel(baseline, 'content/zh-CN/guides/tutorials/home.md', '---\ntitle: Home\n---\n# Home\n')
  const devCommit = commitAll(baseline, 'initial dev baseline')

  return { root, master, baseline, workspace, masterCommit, devCommit }
}

test('clean no-op when zero localized-page records and zero active pages exist', async t => {
  const fx = makeFixture(t)
  const out = path.join(fx.root, 'out-noop')
  const records = [
    baseRecord('rec-feishu', 'ordinary', 'tutorials/get-started/ordinary', 'https://zilliverse.feishu.cn/wiki/feishutok1'),
  ]
  const bundle = await workflow.generateLocalizedSources({
    records,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: fx.masterCommit,
    devCommit: fx.devCommit,
    out,
    runId: '100',
  })
  assert.equal(bundle, null)
  assert.equal(fs.existsSync(out), false)
})

test('generates, finalizes, validates, reuses zero-drift, and rebuilds on Git source delta', async t => {
  const fx = makeFixture(t)
  const records = [
    baseRecord('rec-a', 'alpha', 'tutorials/manage-data/alpha'),
    baseRecord('rec-b', 'beta', 'tutorials/manage-data/beta'),
  ]

  // Round 1: cold generation + finalize + validate
  const out1 = path.join(fx.root, 'bundle-1')
  const b1 = await workflow.generateLocalizedSources({
    records,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: fx.masterCommit,
    devCommit: fx.devCommit,
    out: out1,
    runId: '101',
  })
  assert.equal(b1.cache_eligible, true)
  assert.deepEqual(b1.outcomes.map(o => [o.page, o.status]), [['alpha', 'success'], ['beta', 'success']])

  const fin1 = workflow.finalizeLocalizedPublication({
    workspace: fx.baseline,
    bundleRoot: out1,
    masterSha: fx.masterCommit,
    devBaselineSha: fx.devCommit,
  })
  assert.equal(fin1.outputPaths.length, 2)
  assert.equal(workflow.validateLocalizedPublication({ workspace: fx.baseline }).activeCount, 2)
  const devCommit2 = commitAll(fx.baseline, 'publish round 1')

  // Round 2: identical pinned inputs (even with changed record_id!) => zero-drift reuse
  const recordsMovedId = [
    baseRecord('rec-a-MOVED', 'alpha', 'tutorials/manage-data/alpha'),
    baseRecord('rec-b-MOVED', 'beta', 'tutorials/manage-data/beta'),
  ]
  const out2 = path.join(fx.root, 'bundle-2')
  const b2 = await workflow.generateLocalizedSources({
    records: recordsMovedId,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: fx.masterCommit,
    devCommit: devCommit2,
    out: out2,
    runId: '102',
  })
  assert.deepEqual(b2.outcomes.map(o => [o.page, o.status]), [['alpha', 'reused'], ['beta', 'reused']])
  assert.equal(b2.effective_active.pages.find(p => p.page === 'alpha').last_seen_record_id, 'rec-a-MOVED')

  // Round 3: Feishu unchanged, Git Chinese source updated on alpha => rebuilds alpha, reuses beta
  writeRel(fx.master, 'localized-docs/zh-CN/guides/pages/alpha/source.md', '# Alpha 页面\n\n更新后的中文内容，使用 {{var.endpoint}}。\n')
  const masterCommit2 = commitAll(fx.master, 'update alpha source')
  const out3 = path.join(fx.root, 'bundle-3')
  const b3 = await workflow.generateLocalizedSources({
    records: recordsMovedId,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: masterCommit2,
    devCommit: devCommit2,
    out: out3,
    runId: '103',
  })
  assert.deepEqual(b3.outcomes.map(o => [o.page, o.status]), [['alpha', 'success'], ['beta', 'reused']])
  assert.notEqual(b3.outcomes[0].output.sha256, b1.outcomes[0].output.sha256)
  assert.equal(b3.outcomes[1].output.sha256, b1.outcomes[1].output.sha256)
})

test('single-page failure falls back by page_url without blocking sibling and survives record_id change', async t => {
  const fx = makeFixture(t)
  const records = [
    baseRecord('rec-a', 'alpha', 'tutorials/manage-data/alpha'),
    baseRecord('rec-b', 'beta', 'tutorials/manage-data/beta'),
  ]
  const out1 = path.join(fx.root, 'bundle-seed')
  await workflow.generateLocalizedSources({
    records,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: fx.masterCommit,
    devCommit: fx.devCommit,
    out: out1,
    runId: '201',
  })
  workflow.finalizeLocalizedPublication({ workspace: fx.baseline, bundleRoot: out1 })
  const devCommit2 = commitAll(fx.baseline, 'seed dev')
  const alphaBaselineBytes = fs.readFileSync(path.join(fx.baseline, 'content/zh-CN/guides/tutorials/manage-data/alpha.md'))

  // Corrupt alpha source.md AND update beta source.md AND change record_id!
  writeRel(fx.master, 'localized-docs/zh-CN/guides/pages/alpha/source.md', '---\nslug: /forbidden-shell\n---\n# Broken\n')
  writeRel(fx.master, 'localized-docs/zh-CN/guides/pages/beta/source.md', '# Beta 更新\n\n兄弟页正常发布。\n')
  const masterCommit2 = commitAll(fx.master, 'corrupt alpha update beta')

  const movedRecords = [
    baseRecord('rec-a-NEW-ID', 'alpha', 'tutorials/manage-data/alpha'),
    baseRecord('rec-b-NEW-ID', 'beta', 'tutorials/manage-data/beta'),
  ]
  const out2 = path.join(fx.root, 'bundle-fallback')
  const b2 = await workflow.generateLocalizedSources({
    records: movedRecords,
    repositoryRoot: fx.master,
    baselineRoot: fx.baseline,
    masterCommit: masterCommit2,
    devCommit: devCommit2,
    out: out2,
    runId: '202',
  })

  assert.equal(b2.cache_eligible, false)
  const alphaOutcome = b2.outcomes.find(o => o.page_url === 'tutorials/manage-data/alpha')
  const betaOutcome = b2.outcomes.find(o => o.page_url === 'tutorials/manage-data/beta')
  assert.equal(alphaOutcome.status, 'fallback')
  assert.equal(alphaOutcome.code, 'SOURCE_SHELL_FORBIDDEN')
  assert.equal(betaOutcome.status, 'success')

  workflow.finalizeLocalizedPublication({ workspace: fx.workspace, bundleRoot: out2 })
  assert.deepEqual(
    fs.readFileSync(path.join(fx.workspace, 'content/zh-CN/guides/tutorials/manage-data/alpha.md')),
    alphaBaselineBytes,
  )
  assert.match(
    fs.readFileSync(path.join(fx.workspace, 'content/zh-CN/guides/tutorials/manage-data/beta.md'), 'utf8'),
    /兄弟页正常发布/,
  )
  assert.equal(workflow.validateLocalizedPublication({ workspace: fx.workspace }).activeCount, 2)
})
