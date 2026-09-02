'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {createReceiptArtifact} = require('./create-offline-reference-python-receipt-artifact')
const {canonicalJson, checksum, UNIT_KEY} = require('./offline-reference-python-publication')

function runFixture() {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-receipt-producer.'))
  const exec = (...args) => require('node:child_process').execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8'}).trim()
  exec('init', '-q'); exec('config', 'user.name', 'Test'); exec('config', 'user.email', 'test@example.com')
  const sourcePath = 'content/en/reference/api/python/python/page.md'
  const targetPath = 'content/zh-CN/reference/api/python/python/page.md'
  fs.mkdirSync(path.dirname(path.join(repository, sourcePath)), {recursive: true})
  fs.mkdirSync(path.dirname(path.join(repository, targetPath)), {recursive: true})
  fs.writeFileSync(path.join(repository, sourcePath), '# source\n')
  fs.writeFileSync(path.join(repository, targetPath), '# base\n')
  exec('add', '--all'); exec('commit', '-m', 'baseline'); const baseline = exec('rev-parse', 'HEAD')
  fs.writeFileSync(path.join(repository, targetPath), '# translated\n')
  exec('add', '--all'); exec('commit', '-m', 'candidate'); const candidate = exec('rev-parse', 'HEAD')
  const digest = value => require('node:crypto').createHash('sha256').update(value).digest('hex')
  const body = {schemaVersion: 1, document: 'offline-reference-translation-receipt', unitKey: UNIT_KEY, toolingSha: baseline, sourceCheckpointSha: baseline, targetBaselineSha: baseline, files: [{sourcePath, sourceSha256: digest('# source\n'), targetPath, baseTargetSha256: digest('# base\n'), targetSha256: digest('# translated\n') }]}
  return {repository, candidate, baseline, receipt: {...body, receiptSha256: checksum(canonicalJson(body))}}
}

test('writes the fixed canonical receipt only after Git authentication', () => {
  const fixture = runFixture(); const output = path.join(fixture.repository, 'tmp', 'offline-reference-python-receipt.json')
  try {
    const result = createReceiptArtifact({repositoryRoot: fixture.repository, candidateRef: 'refs/heads/offline-reference-candidates/python/test', candidateSha: fixture.candidate, toolingSha: fixture.baseline, sourceCheckpointSha: fixture.baseline, targetBaselineSha: fixture.baseline, receiptJsonEnv: 'RECEIPT_JSON', outputFile: output}, {RECEIPT_JSON: JSON.stringify(fixture.receipt)})
    assert.equal(result.outputFile, output)
    assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), fixture.receipt)
  } finally { fs.rmSync(fixture.repository, {recursive: true, force: true}) }
})

test('rejects a mismatched baseline before writing an artifact', () => {
  const fixture = runFixture(); const output = path.join(fixture.repository, 'tmp', 'offline-reference-python-receipt.json')
  try {
    assert.throws(() => createReceiptArtifact({repositoryRoot: fixture.repository, candidateRef: 'refs/heads/offline-reference-candidates/python/test', candidateSha: fixture.candidate, toolingSha: fixture.baseline, sourceCheckpointSha: fixture.candidate, targetBaselineSha: fixture.baseline, receiptJsonEnv: 'RECEIPT_JSON', outputFile: output}, {RECEIPT_JSON: JSON.stringify(fixture.receipt)}), /requires sourceCheckpointSha/)
    assert.equal(fs.existsSync(output), false)
  } finally { fs.rmSync(fixture.repository, {recursive: true, force: true}) }
})
