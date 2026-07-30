'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {preflightCheckpointArchive, safeArchivePath} = require('./preflight-checkpoint-archive')

const TOOLING_SHA = '1'.repeat(40)
const SOURCE_SHA = '2'.repeat(40)

function manifest(overrides = {}) {
  return {
    schemaVersion: 1,
    stage: 'translation',
    group: 'python',
    masterSha: TOOLING_SHA,
    devBaselineSha: SOURCE_SHA,
    createdAt: '2026-07-27T00:00:00.000Z',
    ownershipVersion: 1,
    files: [],
    deletions: [],
    snapshotManual: 'pymilvus30',
    validation: {commands: [], passed: true},
    translationTarget: 'zh-CN-reference',
    sourceSite: 'en',
    targetSite: 'zh-CN',
    sourceCheckpointSha: SOURCE_SHA,
    toolingSha: TOOLING_SHA,
    ...overrides,
  }
}

function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'checkpoint-archive-preflight-')))
  const content = path.join(root, 'content')
  fs.mkdirSync(path.join(content, 'checkpoint-group/payload'), {recursive: true})
  fs.writeFileSync(path.join(content, 'checkpoint-group/manifest.json'), `${JSON.stringify(manifest())}\n`)
  fs.writeFileSync(path.join(content, 'checkpoint-group/payload/a.md'), '# translated\n')
  return {root, content, archive: path.join(root, 'checkpoint-group.tar')}
}

function options(f, overrides = {}) {
  return {
    archive: f.archive,
    manifestOutput: path.join(f.root, 'manifest-output.json'),
    group: 'python',
    masterSha: TOOLING_SHA,
    translationTarget: 'zh-CN-reference',
    sourceCheckpointSha: SOURCE_SHA,
    toolingSha: TOOLING_SHA,
    sourceSite: 'en',
    targetSite: 'zh-CN',
    ...overrides,
  }
}

test('extracts only one verified checkpoint manifest before full payload extraction', () => {
  const f = fixture()
  try {
    execFileSync('tar', ['-cf', f.archive, '-C', f.content, 'checkpoint-group'])
    const result = preflightCheckpointArchive(options(f))
    assert.equal(result.manifest.translationTarget, 'zh-CN-reference')
    assert.equal(fs.readFileSync(options(f).manifestOutput, 'utf8'), `${JSON.stringify(manifest())}\n`)
    assert.equal(fs.existsSync(path.join(f.root, 'payload')), false)
  } finally { fs.rmSync(f.root, {recursive: true, force: true}) }
})

test('rejects duplicate normalized archive paths including duplicate manifests', () => {
  const f = fixture()
  try {
    execFileSync('tar', ['-cf', f.archive, '-C', f.content, 'checkpoint-group/manifest.json', '-C', f.content, 'checkpoint-group/manifest.json'])
    assert.throws(() => preflightCheckpointArchive(options(f)), /duplicate normalized archive path/i)
  } finally { fs.rmSync(f.root, {recursive: true, force: true}) }
})

test('rejects absolute and parent-traversal archive paths', () => {
  for (const unsafe of ['/checkpoint-group/manifest.json', '../checkpoint-group/manifest.json', 'checkpoint-group/../manifest.json']) {
    assert.throws(() => safeArchivePath(unsafe), /archive path/i)
  }
})

test('rejects links before reading the checkpoint manifest', () => {
  const f = fixture()
  try {
    fs.symlinkSync('manifest.json', path.join(f.content, 'checkpoint-group/manifest-link.json'))
    execFileSync('tar', ['-cf', f.archive, '-C', f.content, 'checkpoint-group'])
    assert.throws(() => preflightCheckpointArchive(options(f)), /archive entry type/i)
  } finally { fs.rmSync(f.root, {recursive: true, force: true}) }
})

test('rejects translation identity mismatch before full extraction', () => {
  const f = fixture()
  try {
    execFileSync('tar', ['-cf', f.archive, '-C', f.content, 'checkpoint-group'])
    assert.throws(() => preflightCheckpointArchive(options(f, {translationTarget: 'ja-JP'})), /translation target/i)
  } finally { fs.rmSync(f.root, {recursive: true, force: true}) }
})
