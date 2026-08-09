'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

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
