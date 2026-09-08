'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {test} = require('node:test')

const {auditJapaneseCacheProvenance, buildJapanesePublicationManifest, readSourceEvidence} = require('./migrate-ja-publication-manifest')

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
  const audit = auditJapaneseCacheProvenance({repositoryRoot: root, revision: 'dev', git: badGit, recoverHistoricalAliases: false})
  assert.equal(audit.accepted.length, 0)
  assert.match(audit.rejected[0].reason, /absent from target publication commit/)
  assert.throws(() => buildJapanesePublicationManifest({repositoryRoot: root, sourceCommit: SOURCE_COMMIT, revision: 'dev', git: badGit, recoverHistoricalAliases: false}), /audit rejected/)
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


test('recovers a legacy path only from a cache version with matching source and target bytes', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ja-publication-manifest-history-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const legacyPath = 'docs/tutorials/page.md'
  const historicalSource = '# historical source\n'
  const translated = '# translated\n'
  write(root, sourcePath, '# current source\n')
  write(root, targetPath, translated)
  for (const dir of ['content/en/byoc/tutorials', 'content/en/reference']) fs.mkdirSync(path.join(root, dir), {recursive: true})
  const cache = {files: {[legacyPath]: {sourceHash: hash(historicalSource), targetPath, translatedAt: '2026-01-01T00:00:00.000Z'}}}
  write(root, '.translation-cache/ja-JP.json', `${JSON.stringify(cache)}\n`)
  const newest = 'c'.repeat(40)
  const matching = 'd'.repeat(40)
  const git = (_command, args) => {
    if (args[0] === 'log' && args[1] === '--format=@@%H') return `@@${newest}\n\n${targetPath}\n`
    if (args[0] === 'log' && args[1] === '--format=%H') return `${newest}\n${matching}\n`
    if (args[0] === 'ls-tree') return `${legacyPath}\0${targetPath}\0`
    if (args[0] === 'show' && args[1].endsWith(':.translation-cache/ja-JP.json')) return JSON.stringify(cache)
    if (args[0] === 'show' && args[1] === `${newest}:${sourcePath}`) throw new Error('missing canonical path')
    if (args[0] === 'show' && args[1] === `${newest}:${legacyPath}`) return '# wrong source\n'
    if (args[0] === 'show' && args[1] === `${matching}:${legacyPath}`) return historicalSource
    if (args[0] === 'show' && args[1].endsWith(`:${targetPath}`)) return translated
    throw new Error(`unexpected git call: ${args.join(' ')}`)
  }
  const audit = auditJapaneseCacheProvenance({repositoryRoot: root, revision: 'HEAD', git})
  assert.equal(audit.rejected.length, 0)
  assert.equal(audit.accepted[0].publicationCommit, matching)
  assert.equal(audit.accepted[0].sourcePathAtCommit, legacyPath)
})


function retainedEvidence(overrides = {}) {
  return {
    sourcePath,
    sourcePathAtCommit: sourcePath,
    targetPath,
    sourceCommit: SOURCE_COMMIT,
    sourceHash: hash('# historical source\n'),
    targetHash: hash('# translated\n'),
    runId: '123456789',
    reportArtifact: 'translation-report-ja-JP-guides-123456789-batch-1',
    artifactId: 123,
    artifactDigest: `sha256:${'e'.repeat(64)}`,
    artifactExpired: false,
    status: 'translated',
    ...overrides,
  }
}

test('recovers a rejected cache record from authenticated retained report evidence', t => {
  const {root, git} = fixture(t)
  const evidenceGit = (command, args, options) => {
    if (args[0] === 'show' && args[1] === `${COMMIT}:${sourcePath}`) return Buffer.from('# wrong source\n')
    if (args[0] === 'show' && args[1] === `${SOURCE_COMMIT}:${sourcePath}`) return Buffer.from('# historical source\n')
    return git(command, args, options)
  }
  const audit = auditJapaneseCacheProvenance({
    repositoryRoot: root,
    revision: 'dev',
    git: evidenceGit,
    recoverHistoricalAliases: false,
    sourceEvidence: [retainedEvidence()],
  })
  assert.equal(audit.rejected.length, 0)
  assert.equal(audit.accepted[0].publicationCommit, SOURCE_COMMIT)
  assert.equal(audit.accepted[0].retainedReport.runId, '123456789')
})

test('rejects retained evidence whose target hash does not match the current publication', t => {
  const {root, git} = fixture(t)
  const evidenceGit = (command, args, options) => {
    if (args[0] === 'show' && args[1] === `${COMMIT}:${sourcePath}`) return Buffer.from('# wrong source\n')
    return git(command, args, options)
  }
  const audit = auditJapaneseCacheProvenance({
    repositoryRoot: root,
    revision: 'dev',
    git: evidenceGit,
    recoverHistoricalAliases: false,
    sourceEvidence: [retainedEvidence({targetHash: hash('# forged target\n')})],
  })
  assert.equal(audit.accepted.length, 0)
  assert.match(audit.rejected[0].reason, /does not match the current cache and target/)
})


test('requires retained report evidence to identify a live artifact with its digest', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ja-publication-evidence-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const evidencePath = path.join(root, 'evidence.json')
  fs.writeFileSync(evidencePath, JSON.stringify({schemaVersion: 1, records: [retainedEvidence({artifactExpired: true})]}))
  assert.throws(() => readSourceEvidence(evidencePath), /invalid Japanese source evidence record/i)
  fs.writeFileSync(evidencePath, JSON.stringify({schemaVersion: 1, records: [retainedEvidence()]}))
  assert.equal(readSourceEvidence(evidencePath).length, 1)
})
