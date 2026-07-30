'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  classifySourceDelta,
  mapEnglishToI18nPath,
  mapSourcePathForTarget,
  parseGitNameStatus,
} = require('./sourceDelta')

test('maps docs and reference paths to ja-JP i18n paths', () => {
  assert.equal(
    mapEnglishToI18nPath('content/en/guides/tutorials/get-started/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/get-started/a.md',
  )
  assert.equal(
    mapEnglishToI18nPath('content/en/byoc/tutorials/deployment/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/deployment/a.md',
  )
  assert.equal(
    mapEnglishToI18nPath('content/en/reference/api/restful/restful/v2/a.mdx'),
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/a.mdx',
  )
  assert.equal(mapEnglishToI18nPath('config/generated/restful.sidebar.js'), null)
})

test('maps unified sources for all explicit translation targets', () => {
  assert.equal(
    mapSourcePathForTarget('ja-JP', 'content/en/guides/tutorials/tools/a.md'),
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/tools/a.md',
  )
  assert.equal(
    mapSourcePathForTarget('zh-CN-reference', 'content/en/reference/api/a.md'),
    'content/zh-CN/reference/api/a.md',
  )
  assert.throws(() => mapSourcePathForTarget('zh-CN-tools', 'content/en/guides/tutorials/tools/a.md'), /unknown translation target/i)
})

test('retired Chinese Guides translation target is rejected', () => {
  assert.throws(() => classifySourceDelta({
    target: 'zh-CN-tools',
    changes: [{status: 'D', path: 'content/en/guides/tutorials/tools/old.md'}],
  }), /unknown translation target/i)
})

test('Chinese source renames emit retirement candidates without deletion authority', () => {
  const result = classifySourceDelta({
    target: 'zh-CN-reference',
    changes: [{
      status: 'R100',
      oldPath: 'content/en/reference/old.md',
      newPath: 'content/en/reference/new.md',
    }],
  })
  assert.deepEqual(result.deletedI18n, [])
  assert.deepEqual(result.renamed, [])
  assert.deepEqual(result.changedEnglish, ['content/en/reference/new.md'])
  assert.deepEqual(result.retirementCandidates, [{
    sourcePath: 'content/en/reference/old.md',
    targetPath: 'content/zh-CN/reference/old.md',
    reason: 'source_renamed',
  }])
})

test('parses added, modified, deleted, and renamed git name-status lines', () => {
  assert.deepEqual(parseGitNameStatus([
    'A\tcontent/en/guides/tutorials/new.md',
    'M\tcontent/en/reference/api/python/python/changed.md',
    'D\tcontent/en/reference/api/restful/restful/old.mdx',
    'R100\tcontent/en/guides/tutorials/old.md\tcontent/en/guides/tutorials/moved.md',
    '',
  ].join('\n')), [
    { status: 'A', path: 'content/en/guides/tutorials/new.md' },
    { status: 'M', path: 'content/en/reference/api/python/python/changed.md' },
    { status: 'D', path: 'content/en/reference/api/restful/restful/old.mdx' },
    { status: 'R100', oldPath: 'content/en/guides/tutorials/old.md', newPath: 'content/en/guides/tutorials/moved.md' },
  ])
})

test('classifies deleted and changed files for a selected group', () => {
  const result = classifySourceDelta({
    group: 'rest',
    changes: [
      { status: 'D', path: 'content/en/reference/api/restful/restful/old.mdx' },
      { status: 'A', path: 'content/en/reference/api/restful/restful/new.mdx' },
      { status: 'M', path: 'content/en/reference/api/python/python/other.md' },
    ],
  })

  assert.deepEqual(result.deletedI18n, [
    'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx',
  ])
  assert.deepEqual(result.changedEnglish, [
    'content/en/reference/api/restful/restful/new.mdx',
  ])
  assert.deepEqual(result.renamed, [])
})

test('classifies a rename as an old i18n deletion and a new translation', () => {
  const result = classifySourceDelta({
    group: 'guides',
    changes: [{
      status: 'R095',
      oldPath: 'content/en/guides/tutorials/old.md',
      newPath: 'content/en/guides/tutorials/new.md',
    }],
  })

  assert.deepEqual(result.deletedI18n, [
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md',
  ])
  assert.deepEqual(result.changedEnglish, ['content/en/guides/tutorials/new.md'])
  assert.deepEqual(result.renamed, [{
    oldPath: 'content/en/guides/tutorials/old.md',
    newPath: 'content/en/guides/tutorials/new.md',
    oldI18nPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md',
    newI18nPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
  }])
})

test('rejects malformed name-status input', () => {
  assert.throws(() => parseGitNameStatus('X\tcontent/en/guides/tutorials/a.md\n'), /Unsupported git status/)
  assert.throws(() => parseGitNameStatus('R100\tcontent/en/guides/tutorials/a.md\n'), /Malformed rename/)
})
