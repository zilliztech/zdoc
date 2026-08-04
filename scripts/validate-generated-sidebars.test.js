'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  parseSite,
  referenceSidebarTargets,
  validateAllGeneratedSidebars,
  validateGeneratedSidebarsForSite,
  validateReferenceSidebarTargets,
  validateSidebar,
  validateSidebarDocTargets,
} = require('./validate-generated-sidebars')

test('rejects duplicate document ids and keys recursively', () => {
  const sidebar = [{
    type: 'category',
    label: 'Collections',
    items: [
      { type: 'doc', id: 'api/java/add-field', key: 'doc:api/java/add-field' },
      { type: 'doc', id: 'api/java/add-field', key: 'doc:api/java/add-field' },
    ],
  }]
  assert.throws(() => validateSidebar(sidebar, 'fixture.sidebar.js'), /duplicate doc id.*duplicate key/is)
})

test('all tracked English sidebars have unique document identities and translation keys', () => {
  assert.doesNotThrow(() => validateAllGeneratedSidebars(path.join(process.cwd(), 'generated/en/sidebars')))
})

test('rejects generated sidebar entries whose document file is missing', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sidebar-targets-'))
  try {
    fs.mkdirSync(path.join(outputDir, 'api/restful/restful/v2/control-plane/cluster-operations-v2'), { recursive: true })
    fs.writeFileSync(
      path.join(outputDir, 'api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2.mdx'),
      '---\ntitle: List Clusters\n---\n',
    )
    const sidebar = [{
      type: 'category',
      label: 'Cluster Operations',
      items: [
        { type: 'doc', id: 'api/restful/restful/v2/control-plane/cluster-operations-v2/list-clusters-v2' },
        { type: 'doc', id: 'api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2' },
      ],
    }]
    assert.throws(
      () => validateSidebarDocTargets({ outputDir, sidebar, idPrefix: 'api/restful/restful', label: 'restful.sidebar.js' }),
      /restful\.sidebar\.js references missing generated document files.*create-on-demand-cluster-v2/s,
    )
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true })
  }
})

test('validates document targets for every generated reference sidebar', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reference-sidebar-targets-'))
  const generatedDir = path.join(root, 'config/generated')
  const referenceDir = path.join(root, 'reference')
  try {
    fs.mkdirSync(generatedDir, { recursive: true })
    for (const target of referenceSidebarTargets) {
      const id = `${target.idPrefix}/missing`
      fs.writeFileSync(
        path.join(generatedDir, target.sidebar),
        `module.exports = [{ type: 'doc', id: ${JSON.stringify(id)} }]\n`,
      )
      assert.throws(
        () => validateReferenceSidebarTargets({ directory: generatedDir, outputDir: referenceDir }),
        new RegExp(`${target.sidebar.replace('.', '\\.')} references missing generated document files`),
      )
      fs.rmSync(path.join(generatedDir, target.sidebar))
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('site-specific validation scans only its own generated sidebar directory', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-sidebars-'))
  for (const site of ['en', 'zh-CN']) fs.mkdirSync(path.join(root, 'generated', site, 'sidebars'), { recursive: true })
  fs.writeFileSync(path.join(root, 'generated/en/sidebars/guides.sidebar.js'), 'module.exports = []\n')
  fs.writeFileSync(path.join(root, 'generated/zh-CN/sidebars/guides.sidebar.js'), 'module.exports = [{type:"doc",id:"same",key:"duplicate"},{type:"doc",id:"same",key:"duplicate"}]\n')

  assert.equal(validateGeneratedSidebarsForSite({ site: 'en', cwd: root }).count, 1)
  assert.throws(() => validateGeneratedSidebarsForSite({ site: 'zh-CN', cwd: root }), /duplicate/i)
  fs.writeFileSync(path.join(root, 'generated/zh-CN/sidebars/guides.sidebar.js'), 'module.exports = []\n')
  assert.deepEqual(validateGeneratedSidebarsForSite({ site: 'zh-CN', cwd: root }).referenceResults, [])
})

test('CLI site parser accepts only en and zh-CN', () => {
  assert.equal(parseSite(['--site', 'en']), 'en')
  assert.equal(parseSite(['--site', 'zh-CN']), 'zh-CN')
  assert.throws(() => parseSite([]), /Usage:/)
  assert.throws(() => parseSite(['--site', 'ja-JP']), /Usage:/)
})
