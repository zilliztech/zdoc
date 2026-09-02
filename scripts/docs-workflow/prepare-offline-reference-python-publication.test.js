'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const test = require('node:test')

const {canonicalJson, checksum, UNIT_KEY} = require('./offline-reference-python-publication')
const {prepareOfflineReferencePythonPublication} = require('./prepare-offline-reference-python-publication')
const {runPublicationCoordinator} = require('./publication-coordinator')
const {validateTranslationCheckpointPair} = require('./validate-checkpoint-artifact')

function git(repository, args) { return execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8'}).trim() }
function write(repository, relative, bytes) {
  const file = path.join(repository, ...relative.split('/'))
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, bytes)
}
function commit(repository, message) { git(repository, ['add', '--all']); git(repository, ['commit', '-m', message]); return git(repository, ['rev-parse', 'HEAD']) }
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-offline-reference-python.'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repository = path.join(root, 'repository')
  fs.mkdirSync(repository)
  git(repository, ['init', '-q'])
  git(repository, ['config', 'user.name', 'Test'])
  git(repository, ['config', 'user.email', 'test@example.com'])
  const sourcePath = 'content/en/reference/api/python/python/page.md'
  const targetPath = 'content/zh-CN/reference/api/python/python/page.md'
  const sourceBytes = Buffer.from('# Source\n')
  const baseBytes = Buffer.from('# 旧译文\n')
  const targetBytes = Buffer.from('# 新译文\n')
  write(repository, sourcePath, sourceBytes)
  write(repository, targetPath, baseBytes)
  write(repository, 'generated/en/manifests/reference.json', '{}\n')
  write(repository, 'generated/zh-CN/manifests/reference-translations.json', JSON.stringify({records: [{manual: 'python', sourcePath, targetPath, sourceCommit: '0'.repeat(40), sourceHash: hash(sourceBytes), targetHash: hash(baseBytes), status: 'translated'}]}) + '\n')
  write(repository, 'generated/en/sidebars/python.sidebar.js', 'module.exports = []\n')
  write(repository, 'generated/zh-CN/sidebars/python.sidebar.js', 'module.exports = []\n')
  const baseline = commit(repository, 'baseline')
  const pnpm = path.join(root, 'pnpm')
  fs.writeFileSync(pnpm, `#!/bin/sh
set -eu
cat > generated/en/manifests/reference.json <<'EOF'
{"records":[]}
EOF
cat > generated/zh-CN/manifests/reference-translations.json <<'EOF'
{"records":[{"manual":"python","sourcePath":"${sourcePath}","targetPath":"${targetPath}","sourceCommit":"${baseline}","sourceHash":"${hash(sourceBytes)}","targetHash":"${hash(targetBytes)}","status":"translated"}],"pendingRecords":[]}
EOF
`, {mode: 0o755})
  write(repository, targetPath, targetBytes)
  const candidate = commit(repository, 'candidate')
  const body = {schemaVersion: 1, document: 'offline-reference-translation-receipt', unitKey: UNIT_KEY, toolingSha: baseline, sourceCheckpointSha: baseline, targetBaselineSha: baseline, files: [{sourcePath, sourceSha256: hash(sourceBytes), targetPath, baseTargetSha256: hash(baseBytes), targetSha256: hash(targetBytes)}]}
  const receipt = {...body, receiptSha256: checksum(canonicalJson(body))}
  const receiptFile = path.join(root, 'receipt.json')
  fs.writeFileSync(receiptFile, `${JSON.stringify(receipt)}\n`)
  const outputRoot = path.join(root, 'evidence')
  fs.mkdirSync(outputRoot, {mode: 0o700})
  fs.chmodSync(outputRoot, 0o700)
  return {root, repository, baseline, candidate, receiptFile, outputRoot, targetPath, pnpm}
}

test('prepares a standard authenticated checkpoint pair and immutable publication documents', async t => {
  const f = fixture(t)
  const result = await prepareOfflineReferencePythonPublication({
    repositoryRoot: f.repository, repository: 'zilliztech/zdoc', candidateSha: f.candidate, targetBaselineSha: f.baseline,
    sourceCheckpointSha: f.baseline, toolingSha: f.baseline, receiptFile: f.receiptFile, targetBranch: 'dev',
    runId: 123, runAttempt: 1, publish: false, outputRoot: f.outputRoot, dependencyRoot: f.repository,
    commandEnvironment: {PATH: `${f.root}:${process.env.PATH}`},
  })
  assert.equal(result.selection.units[0].strategy, 'checkpoint')
  assert.equal(result.selection.units[0].unitKey, UNIT_KEY)
  assert.equal(result.selection.inputs.publish, false)
  assert.ok(result.selection.units[0].validationCommands.includes(
    'git diff --exit-code -- generated/en/manifests/reference.json generated/zh-CN/manifests/reference-translations.json generated/en/sidebars generated/zh-CN/sidebars',
  ))
  assert.equal(result.ready.selectionSha256, result.selection.selectionSha256)
  for (const artifact of [result.checkpoint, result.baseline]) {
    const listing = execFileSync('tar', ['-tf', artifact.archive], {encoding: 'utf8'})
    assert.ok(listing.startsWith('checkpoint-group/'))
    assert.doesNotMatch(listing, /generated\/en/u)
  }
  const extracted = []
  for (const artifact of [result.checkpoint, result.baseline]) {
    const destination = fs.mkdtempSync(path.join(f.root, 'extract.'))
    execFileSync('tar', ['-xf', artifact.archive, '-C', destination])
    extracted.push(path.join(destination, 'checkpoint-group'))
  }
  const pair = await validateTranslationCheckpointPair({checkpointDir: extracted[0], baselineDir: extracted[1]})
  assert.equal(pair.checkpoint.translationTarget, 'zh-CN-reference')
  assert.ok(pair.checkpoint.files.some(file => file.path === f.targetPath))
  assert.ok(pair.checkpoint.files.some(file => file.path === 'generated/zh-CN/manifests/reference-translations.json'))
  assert.ok(pair.checkpoint.files.some(file => file.path === 'generated/zh-CN/sidebars/python.sidebar.js'))
  assert.ok(pair.checkpoint.files.every(file => !file.path.startsWith('generated/en/')))
  assert.deepEqual(pair.checkpoint.deletions, [])
})

test('routes the prepared Python pair through the standard coordinator in artifact-only mode', async t => {
  const f = fixture(t)
  const prepared = await prepareOfflineReferencePythonPublication({
    repositoryRoot: f.repository, repository: 'zilliztech/zdoc', candidateSha: f.candidate, targetBaselineSha: f.baseline,
    sourceCheckpointSha: f.baseline, toolingSha: f.baseline, receiptFile: f.receiptFile, targetBranch: 'dev',
    runId: 123, runAttempt: 1, publish: false, outputRoot: f.outputRoot, dependencyRoot: f.repository,
    commandEnvironment: {PATH: f.root + ':' + process.env.PATH},
  })
  const unit = prepared.selection.units[0]
  const archives = new Map([
    [unit.artifacts.checkpoint, prepared.checkpoint.archive],
    [unit.artifacts.baseline, prepared.baseline.archive],
  ])
  const progress = []
  const uploadedResults = []
  let publisherCalls = 0
  const coordinatorTemp = fs.realpathSync(fs.mkdtempSync(path.join(f.root, 'coordinator-temp.')))
  const outcome = await runPublicationCoordinator({
    selection: prepared.selection,
    mode: 'artifact_only',
    outputDirectory: path.join(f.root, 'coordinator-output'),
    runnerTemp: coordinatorTemp,
    pollMilliseconds: 1,
    sleep: async () => {},
    publishUnit: async () => { publisherCalls += 1 },
    client: {
      async listJobs() {
        return [{id: 1, name: unit.producerJob, run_attempt: prepared.selection.runAttempt, status: 'completed', conclusion: 'success', completed_at: '2026-09-02T00:00:01.000Z'}]
      },
      async downloadReady({unitKey}) {
        assert.equal(unitKey, UNIT_KEY)
        return {descriptor: prepared.ready}
      },
      async downloadArtifactFiles(name, expectedFiles) {
        assert.deepEqual(expectedFiles, ['checkpoint-group.tar'])
        return {files: {'checkpoint-group.tar': archives.get(name)}}
      },
      async uploadProgress({snapshot}) { progress.push(snapshot); return {ok: true, artifactName: 'progress-' + snapshot.revision} },
      async uploadResults({results}) { uploadedResults.push(results); return {artifactName: prepared.names.results, artifactId: 99} },
    },
  })
  assert.equal(publisherCalls, 0)
  assert.ok(progress.length > 0)
  assert.equal(uploadedResults.length, 1)
  assert.equal(outcome.results.overallStatus, 'success', JSON.stringify(outcome.results, null, 2))
  assert.equal(outcome.results.mode, 'artifact_only')
  assert.equal(outcome.results.finalTargetSha, f.baseline)
  assert.deepEqual(outcome.results.units.map(value => [value.unitKey, value.status]), [[UNIT_KEY, 'ready']])
})

test('fails closed when source and target baselines differ', async t => {
  const f = fixture(t)
  await assert.rejects(prepareOfflineReferencePythonPublication({
    repositoryRoot: f.repository, repository: 'zilliztech/zdoc', candidateSha: f.candidate, targetBaselineSha: f.baseline,
    sourceCheckpointSha: f.candidate, toolingSha: f.baseline, receiptFile: f.receiptFile, targetBranch: 'dev',
    runId: 123, runAttempt: 1, publish: false, outputRoot: f.outputRoot, dependencyRoot: f.repository,
  }), /sourceCheckpointSha to equal targetBaselineSha/)
})
