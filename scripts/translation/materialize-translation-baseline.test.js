'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {materializeTranslationBaseline} = require('./materialize-translation-baseline')

function write(root, relative, contents) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, contents)
}

test('materializes only the selected target baseline translation state before bootstrap resolution', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-target-baseline-'))
  const workspace = path.join(root, 'workspace')
  const baseline = path.join(root, 'baseline')
  fs.mkdirSync(workspace)
  fs.mkdirSync(baseline)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))

  write(workspace, 'content/en/reference/api/python/python/page.md', '# current English source\n')
  write(workspace, 'content/zh-CN/reference/api/python/python/page.md', '# source-checkpoint translation\n')
  write(workspace, 'content/zh-CN/reference/api/java/page.md', '# unrelated current Java\n')
  write(workspace, 'generated/zh-CN/manifests/reference-translations.json', '{"schemaVersion":1,"records":[]}\n')
  write(workspace, 'generated/zh-CN/sidebars/python.sidebar.js', 'module.exports = ["source"]\n')

  write(baseline, 'content/zh-CN/reference/api/python/python/page.md', '# target-baseline translation\n')
  write(baseline, 'content/zh-CN/reference/api/java/page.md', '# unrelated baseline Java\n')
  write(baseline, 'generated/zh-CN/manifests/reference-translations.json', '{"schemaVersion":1,"bootstrapCompletedGroups":["python"],"records":[]}\n')
  write(baseline, 'generated/zh-CN/sidebars/python.sidebar.js', 'module.exports = ["baseline"]\n')

  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'materialize-translation-baseline.js'),
    '--repository', workspace,
    '--baseline', baseline,
    '--target', 'zh-CN-reference',
    '--group', 'python',
  ], {encoding: 'utf8'})

  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.readFileSync(path.join(workspace, 'content/en/reference/api/python/python/page.md'), 'utf8'), '# current English source\n')
  assert.equal(fs.readFileSync(path.join(workspace, 'content/zh-CN/reference/api/python/python/page.md'), 'utf8'), '# target-baseline translation\n')
  assert.equal(fs.readFileSync(path.join(workspace, 'content/zh-CN/reference/api/java/page.md'), 'utf8'), '# unrelated current Java\n')
  assert.match(fs.readFileSync(path.join(workspace, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'), /bootstrapCompletedGroups/)
  assert.equal(fs.readFileSync(path.join(workspace, 'generated/zh-CN/sidebars/python.sidebar.js'), 'utf8'), 'module.exports = ["baseline"]\n')
})

function guidesFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-target-baseline-transaction-'))
  const workspace = path.join(root, 'workspace')
  const baseline = path.join(root, 'baseline')
  fs.mkdirSync(workspace)
  fs.mkdirSync(baseline)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const paths = {
    content: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    nestedHome: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/home.md',
    byoc: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    manifest: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/content-manifest.json',
    state: '.translation-cache/ja-JP.json',
  }
  write(workspace, `${paths.content}/old.md`, '# old content\n')
  write(workspace, paths.nestedHome, '# old home\n')
  write(workspace, `${paths.byoc}/old.md`, '# old byoc\n')
  write(workspace, paths.manifest, '{"version":"old"}\n')
  write(workspace, paths.state, '{"files":{"old":{}}}\n')
  write(baseline, `${paths.content}/new.md`, '# new content\n')
  write(baseline, paths.nestedHome, '# new home\n')
  write(baseline, `${paths.byoc}/new.md`, '# new byoc\n')
  write(baseline, paths.manifest, '{"version":"new"}\n')
  write(baseline, paths.state, '{"files":{"new":{}}}\n')
  return {root, workspace, baseline, paths}
}

function snapshot(setup) {
  return {
    oldContent: fs.readFileSync(path.join(setup.workspace, `${setup.paths.content}/old.md`), 'utf8'),
    home: fs.readFileSync(path.join(setup.workspace, setup.paths.nestedHome), 'utf8'),
    oldByoc: fs.readFileSync(path.join(setup.workspace, `${setup.paths.byoc}/old.md`), 'utf8'),
    manifest: fs.readFileSync(path.join(setup.workspace, setup.paths.manifest), 'utf8'),
    state: fs.readFileSync(path.join(setup.workspace, setup.paths.state), 'utf8'),
  }
}

test('removes a selected path only after every baseline source validates and stages', t => {
  const setup = guidesFixture(t)
  fs.rmSync(path.join(setup.baseline, setup.paths.manifest))
  const result = materializeTranslationBaseline({repositoryRoot: setup.workspace, baselineRoot: setup.baseline, target: 'ja-JP', group: 'guides'})
  assert.equal(fs.existsSync(path.join(setup.workspace, setup.paths.manifest)), false)
  assert.ok(result.removed.includes(setup.paths.manifest))
  assert.equal(fs.readFileSync(path.join(setup.workspace, `${setup.paths.content}/new.md`), 'utf8'), '# new content\n')
  assert.equal(fs.readFileSync(path.join(setup.workspace, setup.paths.nestedHome), 'utf8'), '# new home\n')
})

test('leaves every destination unchanged when a later baseline source is a symlink', t => {
  const setup = guidesFixture(t)
  const before = snapshot(setup)
  fs.rmSync(path.join(setup.baseline, setup.paths.state))
  fs.symlinkSync('/private/tmp', path.join(setup.baseline, setup.paths.state))
  assert.throws(() => materializeTranslationBaseline({
    repositoryRoot: setup.workspace, baselineRoot: setup.baseline, target: 'ja-JP', group: 'guides',
  }), /must not contain symlinks/i)
  assert.deepEqual(snapshot(setup), before)
})

test('leaves every destination unchanged when staging a later source copy fails', t => {
  const setup = guidesFixture(t)
  const before = snapshot(setup)
  let copies = 0
  assert.throws(() => materializeTranslationBaseline({
    repositoryRoot: setup.workspace,
    baselineRoot: setup.baseline,
    target: 'ja-JP',
    group: 'guides',
    dependencies: {
      copyTree(source, destination, options) {
        copies += 1
        if (copies === 2) throw new Error('injected later copy failure')
        fs.cpSync(source, destination, options)
      },
    },
  }), /injected later copy failure/)
  assert.deepEqual(snapshot(setup), before)
})

test('rolls back earlier destinations when a later atomic replacement fails', t => {
  const setup = guidesFixture(t)
  const before = snapshot(setup)
  let stagedReplacements = 0
  assert.throws(() => materializeTranslationBaseline({
    repositoryRoot: setup.workspace,
    baselineRoot: setup.baseline,
    target: 'ja-JP',
    group: 'guides',
    dependencies: {
      rename(source, destination) {
        if (source.includes(`${path.sep}staged${path.sep}`)) {
          stagedReplacements += 1
          if (stagedReplacements === 2) throw new Error('injected later commit failure')
        }
        fs.renameSync(source, destination)
      },
    },
  }), /injected later commit failure/)
  assert.deepEqual(snapshot(setup), before)
})
