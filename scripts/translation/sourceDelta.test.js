'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  classifySourceDelta,
  mapEnglishToI18nPath,
  parseGitNameStatus,
} = require('./sourceDelta')

test('maps docs and reference paths to ja-JP i18n paths', () => {
  assert.equal(
    mapEnglishToI18nPath('docs/tutorials/get-started/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/get-started/a.md',
  )
  assert.equal(
    mapEnglishToI18nPath('docs-byoc/tutorials/deployment/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/deployment/a.md',
  )
  assert.equal(
    mapEnglishToI18nPath('reference/api/restful/restful/v2/a.mdx'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/a.mdx',
  )
  assert.equal(mapEnglishToI18nPath('config/generated/restful.sidebar.js'), null)
})

test('parses added, modified, deleted, and renamed git name-status lines', () => {
  assert.deepEqual(parseGitNameStatus([
    'A\tdocs/tutorials/new.md',
    'M\treference/api/python/python/changed.md',
    'D\treference/api/restful/restful/old.mdx',
    'R100\tdocs/tutorials/old.md\tdocs/tutorials/moved.md',
    '',
  ].join('\n')), [
    { status: 'A', path: 'docs/tutorials/new.md' },
    { status: 'M', path: 'reference/api/python/python/changed.md' },
    { status: 'D', path: 'reference/api/restful/restful/old.mdx' },
    { status: 'R100', oldPath: 'docs/tutorials/old.md', newPath: 'docs/tutorials/moved.md' },
  ])
})

test('classifies deleted and changed files for a selected group', () => {
  const result = classifySourceDelta({
    group: 'rest',
    changes: [
      { status: 'D', path: 'reference/api/restful/restful/old.mdx' },
      { status: 'A', path: 'reference/api/restful/restful/new.mdx' },
      { status: 'M', path: 'reference/api/python/python/other.md' },
    ],
  })

  assert.deepEqual(result.deletedI18n, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx',
  ])
  assert.deepEqual(result.changedEnglish, [
    'reference/api/restful/restful/new.mdx',
  ])
  assert.deepEqual(result.renamed, [])
})

test('classifies a rename as an old i18n deletion and a new translation', () => {
  const result = classifySourceDelta({
    group: 'guides',
    changes: [{
      status: 'R095',
      oldPath: 'docs/tutorials/old.md',
      newPath: 'docs/tutorials/new.md',
    }],
  })

  assert.deepEqual(result.deletedI18n, [
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md',
  ])
  assert.deepEqual(result.changedEnglish, ['docs/tutorials/new.md'])
  assert.deepEqual(result.renamed, [{
    oldPath: 'docs/tutorials/old.md',
    newPath: 'docs/tutorials/new.md',
    oldI18nPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md',
    newI18nPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
  }])
})

test('rejects malformed name-status input', () => {
  assert.throws(() => parseGitNameStatus('X\tdocs/tutorials/a.md\n'), /Unsupported git status/)
  assert.throws(() => parseGitNameStatus('R100\tdocs/tutorials/a.md\n'), /Malformed rename/)
})
