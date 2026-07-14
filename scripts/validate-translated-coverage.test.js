'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { validateTranslatedCoverage } = require('./validate-translated-coverage')

function write(root, relativePath) {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, '# fixture\n')
}

test('rejects translated files whose English source no longer exists', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translated-coverage-orphan-'))
  write(root, 'reference/api/restful/restful/new.mdx')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/new.mdx')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/orphan.mdx')

  assert.throws(
    () => validateTranslatedCoverage({ group: 'rest', cwd: root }),
    /orphan translated files.*orphan\.mdx/is,
  )
})

test('reports untranslated English files as pending without failing by default', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translated-coverage-pending-'))
  write(root, 'reference/api/restful/restful/translated.mdx')
  write(root, 'reference/api/restful/restful/new-only.mdx')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/translated.mdx')

  const result = validateTranslatedCoverage({ group: 'rest', cwd: root, failOnPending: false })
  assert.deepEqual(result.orphanTranslations, [])
  assert.deepEqual(result.pendingTranslations, ['reference/api/restful/restful/new-only.mdx'])
  assert.throws(
    () => validateTranslatedCoverage({ group: 'rest', cwd: root, failOnPending: true }),
    /pending translations.*new-only\.mdx/is,
  )
})

test('maps both guides roots and ignores non-document assets', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translated-coverage-guides-'))
  write(root, 'docs/tutorials/a.md')
  write(root, 'docs-byoc/tutorials/b.mdx')
  write(root, 'docs/tutorials/image.png')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/b.mdx')
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/image.png')

  const result = validateTranslatedCoverage({ group: 'guides', cwd: root })
  assert.deepEqual(result.orphanTranslations, [])
  assert.deepEqual(result.pendingTranslations, [])
  assert.equal(result.englishDocuments, 2)
  assert.equal(result.translatedDocuments, 2)
})
