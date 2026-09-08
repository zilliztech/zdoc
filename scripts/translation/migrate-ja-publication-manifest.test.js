'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {test} = require('node:test')

const {auditJapaneseCacheProvenance, buildJapanesePublicationManifest} = require('./migrate-ja-publication-manifest')

const COMMIT = 'a'.repeat(40)
const SOURCE_COMMIT = 'b'.repeat(40)
const sourcePath = 'content/en/guides/tutorials/page.md'
const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/page.md'
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex') }
function write(root, relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, value) }
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ja-publication-manifest-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  write(root, sourcePath, '# current source\n')
  write(root, targetPath, '# translated\n')
  for (const dir of ['content/en/byoc/tutorials', 'content/en/reference']) fs.mkdirSync(path.join(root, dir), {recursive: true})
  write(root, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {[sourcePath]: {sourceHash: hash('# historical source\n'), targetPath, translatedAt: '2026-01-01T00:00:00.000Z'}}})}\n`)
  const git = (_command, args) => {
    if (args[0] === 'log') return `@@${COMMIT}\n\n${targetPath}\n`
    if (args[0] === 'show' && args[1] === `${COMMIT}:${sourcePath}`) return Buffer.from('# historical source\n')
    throw new Error(`unexpected git call: ${args.join(' ')}`)
  }
  return {root, git}
}

test('binds migrated records to the target publication commit and keeps current drift historical', t => {
  const {root, git} = fixture(t)
  const manifest = buildJapanesePublicationManifest({repositoryRoot: root, sourceCommit: SOURCE_COMMIT, revision: 'dev', git})
  assert.deepEqual(manifest.records, [{manual: 'guides', sourcePath, targetPath, sourceCommit: COMMIT, sourceHash: hash('# historical source\n'), targetHash: hash('# translated\n'), status: 'translated'}])
  assert.deepEqual(manifest.pendingRecords, [])
})

test('creates pending records for a missing Japanese target', t => {
  const {root, git} = fixture(t)
  const missingSource = 'content/en/guides/tutorials/missing.md'
  write(root, missingSource, '# missing\n')
  const manifest = buildJapanesePublicationManifest({repositoryRoot: root, sourceCommit: SOURCE_COMMIT, revision: 'dev', git})
  assert.deepEqual(manifest.pendingRecords, [{manual: 'guides', sourcePath: missingSource, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/missing.md', sourceCommit: SOURCE_COMMIT, sourceHash: hash('# missing\n')}])
})

test('fails closed when cache provenance is not present at the target publication commit', t => {
  const {root, git} = fixture(t)
  const badGit = (command, args, options) => args[0] === 'show' ? Buffer.from('# other source\n') : git(command, args, options)
  const audit = auditJapaneseCacheProvenance({repositoryRoot: root, revision: 'dev', git: badGit})
  assert.equal(audit.accepted.length, 0)
  assert.match(audit.rejected[0].reason, /absent from target publication commit/)
  assert.throws(() => buildJapanesePublicationManifest({repositoryRoot: root, sourceCommit: SOURCE_COMMIT, revision: 'dev', git: badGit}), /audit rejected/)
})

test('prefers the canonical cache key over its legacy alias', t => {
  const {root, git} = fixture(t)
  const cachePath = path.join(root, '.translation-cache/ja-JP.json')
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  cache.files['docs/tutorials/page.md'] = {sourceHash: hash('# obsolete source\n'), targetPath, translatedAt: '2025-01-01T00:00:00.000Z'}
  fs.writeFileSync(cachePath, `${JSON.stringify(cache)}\n`)
  const audit = auditJapaneseCacheProvenance({repositoryRoot: root, revision: 'dev', git})
  assert.equal(audit.accepted.length, 1)
  assert.equal(audit.rejected.length, 0)
  assert.equal(audit.accepted[0].legacyPath, sourcePath)
})
