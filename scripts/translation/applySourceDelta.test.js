'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { applySourceDelta } = require('./applySourceDelta')

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

test('removes deleted i18n files and source-keyed translation cache entries', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-i18n-delta-'))
  const source = 'reference/api/restful/restful/old.mdx'
  const deleted = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx'
  write(path.join(root, deleted), '# old\n')
  write(path.join(root, '.translation-cache/ja-JP.json'), JSON.stringify({
    files: {
      [source]: { sourceHash: 'old', targetPath: deleted },
      [deleted]: { sourceHash: 'legacy-target-key' },
      keep: { sourceHash: 'keep' },
    },
  }, null, 2))

  const result = applySourceDelta({
    cwd: root,
    delta: { deletedI18n: [deleted], renamed: [], changedEnglish: [] },
  })

  assert.equal(fs.existsSync(path.join(root, deleted)), false)
  const cache = JSON.parse(fs.readFileSync(path.join(root, '.translation-cache/ja-JP.json'), 'utf8'))
  assert.equal(cache.files[source], undefined)
  assert.equal(cache.files[deleted], undefined)
  assert.deepEqual(cache.files.keep, { sourceHash: 'keep' })
  assert.deepEqual(result.deletedI18n, [deleted])
  assert.deepEqual(result.removedCacheKeys, [deleted, source].sort())
  assert.equal(result.hasTranslationMutation, true)
})

test('removes the old source cache key for renamed docs and leaves the new path pending', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-i18n-rename-'))
  const oldPath = 'docs/tutorials/old.md'
  const newPath = 'docs/tutorials/new.md'
  const oldI18nPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'
  const newI18nPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md'
  write(path.join(root, oldI18nPath), '# old\n')
  write(path.join(root, '.translation-cache/ja-JP.json'), JSON.stringify({
    files: { [oldPath]: { sourceHash: 'same', targetPath: oldI18nPath } },
  }))

  applySourceDelta({
    cwd: root,
    delta: {
      deletedI18n: [oldI18nPath],
      changedEnglish: [newPath],
      renamed: [{ oldPath, newPath, oldI18nPath, newI18nPath }],
    },
  })

  const cache = JSON.parse(fs.readFileSync(path.join(root, '.translation-cache/ja-JP.json'), 'utf8'))
  assert.equal(cache.files[oldPath], undefined)
  assert.equal(cache.files[newPath], undefined)
})

test('rejects deletion paths outside ja-JP i18n and symlink ancestors', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-i18n-safe-'))
  write(path.join(root, '.translation-cache/ja-JP.json'), '{"files":{}}')
  assert.throws(() => applySourceDelta({
    cwd: root,
    delta: { deletedI18n: ['../outside.md'], renamed: [], changedEnglish: [] },
  }), /unsafe|ja-JP/i)

  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-i18n-outside-'))
  fs.mkdirSync(path.join(root, 'i18n'), { recursive: true })
  fs.symlinkSync(outside, path.join(root, 'i18n/ja-JP'))
  assert.throws(() => applySourceDelta({
    cwd: root,
    delta: {
      deletedI18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'],
      renamed: [],
      changedEnglish: [],
    },
  }), /symlink/i)
})
