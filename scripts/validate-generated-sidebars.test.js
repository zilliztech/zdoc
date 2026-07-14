'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  referenceSidebarTargets,
  validateAllGeneratedSidebars,
  validatePreservedEnglishFiles,
  validateReferenceSidebarTargets,
  validateSidebar,
  validateSidebarDocTargets,
} = require('./validate-generated-sidebars')

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

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

test('all tracked generated sidebars have unique document identities and translation keys', () => {
  assert.doesNotThrow(() => validateAllGeneratedSidebars(path.join(process.cwd(), 'config/generated')))
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

test('rejects a missing SDK or CLI landing page', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'preserved-landing-pages-'))
  const landingPages = [
    'reference/api/python/python/python.md',
    'reference/api/java/java/java.md',
    'reference/api/nodejs/nodejs/nodejs.md',
    'reference/api/go/go/go.md',
    'reference/cli/cli/Overview.md',
  ]
  for (const relativePath of landingPages) write(path.join(root, relativePath), '# landing\n')
  fs.rmSync(path.join(root, landingPages[0]))

  assert.throws(
    () => validatePreservedEnglishFiles({ cwd: root }),
    /missing preserved landing pages.*python\.md/is,
  )
})
