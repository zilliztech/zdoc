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
  const workspace = path.join(root, 'workspace')
  const staleEnglish = 'content/en/reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'
  const staleI18n = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'
  write(workspace, staleEnglish)
  write(workspace, 'content/en/reference/api/restful/restful/versioning.md', '# Versioning old\n')
  write(workspace, 'generated/en/sidebars/restful.sidebar.js', 'module.exports = ["stale"]\n')
  write(workspace, staleI18n)
  write(workspace, 'content/en/reference/api/python/python/keep.md')

  const preservedContentByPath = new Map([
    ['content/en/reference/api/restful/restful/restful.md', '# REST\n'],
    ['content/en/reference/api/restful/restful/versioning.md', '# Versioning\n'],
    ['content/en/reference/api/restful/restful/v1/error-codes.md', '# Error codes\n'],
    ['content/en/reference/api/restful/restful/v2/error-codes-v2.md', '# Error codes v2\n'],
    ['content/en/reference/content-manifest.json', '{"schemaVersion":1}\n'],
  ])

  const result = prepareContentGroupWorkspace({
    group: 'rest',
    cwd: workspace,
    restSidebarContent: 'module.exports = ["master"]\n',
    preservedContentByPath,
  })

  assert.deepEqual(result.removed.sort(), [
    'content/en/reference/api/restful/restful',
    'generated/en/sidebars/restful.sidebar.js',
  ])
  assert.equal(fs.existsSync(path.join(workspace, staleEnglish)), false)
  assert.equal(fs.readFileSync(path.join(workspace, 'content/en/reference/api/restful/restful/versioning.md'), 'utf8'), '# Versioning\n')
  assert.equal(fs.readFileSync(path.join(workspace, 'generated/en/sidebars/restful.sidebar.js'), 'utf8'), 'module.exports = ["master"]\n')
  assert.equal(fs.existsSync(path.join(workspace, staleI18n)), true)
  assert.equal(fs.existsSync(path.join(workspace, 'content/en/reference/api/python/python/keep.md')), true)
})
