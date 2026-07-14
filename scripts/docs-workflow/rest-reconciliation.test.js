'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { prepareContentGroupWorkspace } = require('./prepare-content-group-workspace')

function write(root, relativePath, content = 'fixture\n') {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

test('rest reconciliation removes stale restored output before full generation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-reconciliation-'))
  const baseline = path.join(root, 'baseline')
  const workspace = path.join(root, 'workspace')
  const staleEnglish = 'reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'
  const staleI18n = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'
  write(baseline, staleEnglish)
  write(baseline, 'config/generated/restful.sidebar.js', 'module.exports = []\n')
  write(baseline, staleI18n)
  write(baseline, 'reference/api/python/python/keep.md')
  fs.cpSync(baseline, workspace, { recursive: true })

  const result = prepareContentGroupWorkspace({ group: 'rest', cwd: workspace })

  assert.deepEqual(result.removed.sort(), [
    'config/generated/restful.sidebar.js',
    'reference/api/restful/restful',
  ])
  assert.equal(fs.existsSync(path.join(workspace, staleEnglish)), false)
  assert.equal(fs.existsSync(path.join(workspace, 'config/generated/restful.sidebar.js')), false)
  assert.equal(fs.existsSync(path.join(workspace, staleI18n)), true)
  assert.equal(fs.existsSync(path.join(workspace, 'reference/api/python/python/keep.md')), true)
})
