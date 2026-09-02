'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const test = require('node:test')

const {canonicalJson, checksum, inspectOfflineReferenceCandidate, UNIT_KEY, validateReceipt} = require('./offline-reference-python-publication')

function git(repository, args) { return execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8'}).trim() }
function write(repository, relative, bytes) {
  const file = path.join(repository, ...relative.split('/'))
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, bytes)
}
function commit(repository, message) { git(repository, ['add', '--all']); git(repository, ['commit', '-m', message]); return git(repository, ['rev-parse', 'HEAD']) }
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }

function fixture() {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-reference-python.'))
  git(repository, ['init', '-q'])
  git(repository, ['config', 'user.name', 'Test'])
  git(repository, ['config', 'user.email', 'test@example.com'])
  const sourcePath = 'content/en/reference/api/python/python/page.md'
  const targetPath = 'content/zh-CN/reference/api/python/python/page.md'
  const sourceBytes = Buffer.from('# Source\n')
  const baseBytes = Buffer.from('# Old Chinese\n')
  write(repository, sourcePath, sourceBytes)
  write(repository, targetPath, baseBytes)
  write(repository, 'tooling.txt', 'tooling\n')
  const baseline = commit(repository, 'baseline')
  const targetBytes = Buffer.from('# 新译文\n')
  write(repository, targetPath, targetBytes)
  const candidate = commit(repository, 'candidate')
  const body = {
    schemaVersion: 1, document: 'offline-reference-translation-receipt', unitKey: UNIT_KEY,
    toolingSha: baseline, sourceCheckpointSha: baseline, targetBaselineSha: baseline,
    files: [{sourcePath, sourceSha256: hash(sourceBytes), targetPath, baseTargetSha256: hash(baseBytes), targetSha256: hash(targetBytes)}],
  }
  const receipt = {...body, receiptSha256: checksum(canonicalJson(body))}
  return {repository, sourcePath, targetPath, baseline, candidate, receipt}
}

function inspect(f, overrides = {}) {
  return inspectOfflineReferenceCandidate({
    repositoryRoot: f.repository, candidateSha: f.candidate, targetBaselineSha: f.baseline,
    sourceCheckpointSha: f.baseline, toolingSha: f.baseline, receipt: f.receipt, ...overrides,
  })
}

test('authenticates one fixed Python candidate and its worker receipt', () => {
  const f = fixture()
  try { assert.deepEqual(inspect(f).paths, [f.targetPath]) }
  finally { fs.rmSync(f.repository, {recursive: true, force: true}) }
})

test('rejects receipt checksum tampering and non-canonical target mapping', () => {
  const f = fixture()
  try {
    assert.throws(() => validateReceipt({...f.receipt, toolingSha: 'a'.repeat(40)}), /checksum mismatch/)
    const body = {...f.receipt, files: [{...f.receipt.files[0], targetPath: 'content/zh-CN/reference/api/restful/page.mdx'}]}
    delete body.receiptSha256
    assert.throws(() => validateReceipt({...body, receiptSha256: checksum(canonicalJson(body))}), /canonical target mismatch/)
  } finally { fs.rmSync(f.repository, {recursive: true, force: true}) }
})

test('rejects source checksum drift and baseline target divergence', () => {
  const f = fixture()
  try {
    let body = {...f.receipt, files: [{...f.receipt.files[0], sourceSha256: '0'.repeat(64)}]}; delete body.receiptSha256
    assert.throws(() => inspect(f, {receipt: {...body, receiptSha256: checksum(canonicalJson(body))}}), /source checksum mismatch/)
    body = {...f.receipt, files: [{...f.receipt.files[0], baseTargetSha256: null}]}; delete body.receiptSha256
    assert.throws(() => inspect(f, {receipt: {...body, receiptSha256: checksum(canonicalJson(body))}}), /target baseline diverged/)
  } finally { fs.rmSync(f.repository, {recursive: true, force: true}) }
})

test('rejects deletion, extra files, and paths outside Python', t => {
  for (const scenario of ['deletion', 'extra', 'rest']) {
    const f = fixture();
    try {
      git(f.repository, ['reset', '--hard', f.baseline])
      if (scenario === 'deletion') fs.rmSync(path.join(f.repository, f.targetPath))
      if (scenario === 'extra') write(f.repository, 'content/zh-CN/reference/api/python/python/extra.md', '# extra\n')
      if (scenario === 'rest') write(f.repository, 'content/zh-CN/reference/api/restful/page.mdx', '# rest\n')
      f.candidate = commit(f.repository, scenario)
      assert.throws(() => inspect(f), scenario === 'deletion' ? /forbidden D/ : scenario === 'rest' ? /forbidden A/ : /do not exactly match/)
    } finally { fs.rmSync(f.repository, {recursive: true, force: true}) }
  }
})

test('rejects candidates whose only parent is not the target baseline', () => {
  const f = fixture()
  try {
    write(f.repository, f.targetPath, '# second candidate\n')
    f.candidate = commit(f.repository, 'second candidate')
    assert.throws(() => inspect(f), /one commit on the exact target baseline/)
  } finally { fs.rmSync(f.repository, {recursive: true, force: true}) }
})
