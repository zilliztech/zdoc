'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {
  classifySourceDelta,
  collectGitSourceChanges,
  mapEnglishToI18nPath,
  mapSourcePathForTarget,
  parseGitNameStatus,
} = require('./sourceDelta')

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

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
    group: 'python',
    target: 'zh-CN-reference',
    changes: [{
      status: 'R100',
      oldPath: 'content/en/reference/api/python/python/old.md',
      newPath: 'content/en/reference/api/python/python/new.md',
    }],
  })
  assert.deepEqual(result.deletedI18n, [])
  assert.deepEqual(result.renamed, [])
  assert.deepEqual(result.changedEnglish, ['content/en/reference/api/python/python/new.md'])
  assert.deepEqual(result.retirementCandidates, [{
    sourcePath: 'content/en/reference/api/python/python/old.md',
    targetPath: 'content/zh-CN/reference/api/python/python/old.md',
    changeKind: 'source_renamed',
  }])
})

test('Chinese Reference source delta is restricted to the selected SDK group', () => {
  const result = classifySourceDelta({
    group: 'python',
    target: 'zh-CN-reference',
    changes: [
      { status: 'M', path: 'content/en/reference/api/python/python/changed.md' },
      { status: 'D', path: 'content/en/reference/api/python/python/retired.md' },
      { status: 'M', path: 'content/en/reference/api/java/java/v2/changed.md' },
      { status: 'D', path: 'content/en/reference/api/java/java/v2/retired.md' },
    ],
  })

  assert.deepEqual(result.changedEnglish, [
    'content/en/reference/api/python/python/changed.md',
  ])
  assert.deepEqual(result.retirementCandidates, [{
    sourcePath: 'content/en/reference/api/python/python/retired.md',
    targetPath: 'content/zh-CN/reference/api/python/python/retired.md',
    changeKind: 'source_deleted',
  }])
})

test('preserved landing pages remain active candidates but never retirement effects', () => {
  const result = classifySourceDelta({
    group: 'python',
    target: 'zh-CN-reference',
    changes: [
      {status: 'D', path: 'content/en/reference/api/python/python/python.md'},
      {status: 'D', path: 'content/en/reference/api/python/python/removed.md'},
    ],
  })

  assert.deepEqual(result.retirementCandidates, [{
    sourcePath: 'content/en/reference/api/python/python/removed.md',
    targetPath: 'content/zh-CN/reference/api/python/python/removed.md',
    changeKind: 'source_deleted',
  }])
})

test('Git-backed source collection disables rename detection for a moved batch', () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-source-delta-'))
  git(repository, ['init', '-b', 'main'])
  git(repository, ['config', 'user.email', 'source-delta@example.com'])
  git(repository, ['config', 'user.name', 'Source Delta Test'])
  const root = path.join(repository, 'content/en/reference/api/python/python')
  fs.mkdirSync(root, {recursive: true})
  for (let index = 1; index <= 9; index += 1) {
    fs.writeFileSync(path.join(root, `old-${index}.md`), `document ${index}\n`, 'utf8')
  }
  git(repository, ['add', '.'])
  git(repository, ['commit', '-m', 'baseline'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])
  for (let index = 1; index <= 9; index += 1) {
    fs.renameSync(path.join(root, `old-${index}.md`), path.join(root, `new-${index}.md`))
  }
  git(repository, ['add', '-A'])
  git(repository, ['commit', '-m', 'checkpoint'])
  const checkpoint = git(repository, ['rev-parse', 'HEAD'])

  const changes = collectGitSourceChanges({
    repository,
    sourceBaselineSha: baseline,
    sourceCheckpointSha: checkpoint,
    target: 'zh-CN-reference',
    group: 'python',
  })
  assert.equal(changes.filter(change => change.status === 'D').length, 9)
  assert.equal(changes.filter(change => change.status === 'A').length, 9)
  assert.equal(changes.some(change => change.status.startsWith('R')), false)
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

test('declares detected orphan translations as source reconciliation deletions', () => {
  const orphan = 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/orphan.md'
  const result = classifySourceDelta({
    group: 'guides',
    changes: [],
    orphanTranslations: [orphan],
  })

  assert.deepEqual(result.deletedI18n, [orphan])
})

test('rejects malformed name-status input', () => {
  assert.throws(() => parseGitNameStatus('X\tcontent/en/guides/tutorials/a.md\n'), /Unsupported git status/)
  assert.throws(() => parseGitNameStatus('R100\tcontent/en/guides/tutorials/a.md\n'), /Malformed rename/)
})
