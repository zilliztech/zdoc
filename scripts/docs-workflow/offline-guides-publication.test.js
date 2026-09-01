'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {execFileSync} = require('node:child_process')

const {
  createOfflineEvidence,
  createOfflineGuidesStrategy,
  inspectOfflineCandidate,
  validateOfflineArtifactPair,
  validateOfflineManifest,
} = require('./offline-guides-publication')
const {finalizePublicationSelection} = require('./publication-contracts')
const {publishJapaneseGuidesTransaction, resolveJapaneseGuidesCandidate, removePrepared} = require('./publication-coordinator')
const {VALIDATION_SPECS} = require('./translation-publication-report')

function git(repository, args) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  }).trim()
}

function write(repository, relative, contents) {
  const target = path.join(repository, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, contents)
}

function commit(repository, message) {
  git(repository, ['add', '-A'])
  git(repository, ['commit', '-m', message])
  return git(repository, ['rev-parse', 'HEAD'])
}

function validation(executionToolingSha, targetBaselineSha, candidateSha) {
  return {
    schemaVersion: 1,
    masterSha: executionToolingSha,
    expectedTargetSha: targetBaselineSha,
    stagedSha: candidateSha,
    proof: {
      repositoryHeadSha: executionToolingSha,
      expectedTargetSha: targetBaselineSha,
      stagedSha: candidateSha,
      generatedStateSha256: 'a'.repeat(64),
    },
    receipts: VALIDATION_SPECS.map(spec => ({id: spec.id, command: spec.command, result: 'success'})),
    result: 'success',
    failureDetail: null,
  }
}

function orphanFixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'offline-guides-orphan-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repository = path.join(root, 'repository')
  const remote = path.join(root, 'remote.git')
  fs.mkdirSync(repository)
  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Test'])
  git(repository, ['config', 'user.email', 'test@example.com'])
  write(repository, 'content/en/guides/tutorials/new.md', '# new v1\n')
  write(repository, 'content/en/guides/tutorials/kept.md', '# kept v1\n')
  write(repository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  const sourceToolingSha = commit(repository, 'source tooling')
  const sourceBaselineSha = sourceToolingSha
  const sourceCheckpointSha = sourceToolingSha
  write(repository, 'tooling-marker.txt', 'execution tooling\n')
  const executionToolingSha = commit(repository, 'execution tooling')
  const orphanPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/orphan.md'
  write(repository, orphanPath, '# orphan ja\n')
  const keptPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/kept.md'
  write(repository, keptPath, '# kept ja\n')
  const keptHash = crypto.createHash('sha256').update('# kept v1\n').digest('hex')
  const orphanCache = JSON.stringify({files: {
    'docs/tutorials/orphan.md': {sourceHash: 'a'.repeat(64), targetPath: orphanPath, translatedAt: '2026-09-01T00:00:00.000Z'},
    'docs/tutorials/kept.md': {sourceHash: keptHash, targetPath: keptPath, translatedAt: '2026-09-01T00:00:00.000Z'},
  }}, null, 2) + '\n'
  write(repository, '.translation-cache/ja-JP.json', orphanCache)
  const targetBaselineSha = commit(repository, 'target baseline')
  execFileSync('git', ['init', '--bare', remote])
  git(repository, ['remote', 'add', 'origin', remote])
  git(repository, ['push', 'origin', targetBaselineSha + ':refs/heads/dev'])
  git(repository, ['checkout', '--detach', executionToolingSha])
  const newPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md'
  const newHash = crypto.createHash('sha256').update('# new v1\n').digest('hex')
  const options = {
    repositoryRoot: repository,
    repository: 'zilliztech/zdoc',
    sourceToolingSha,
    executionToolingSha,
    sourceBaselineSha,
    sourceCheckpointSha,
    targetBranch: 'dev',
    targetBaselineSha,
    expectedMdxCount: 1,
  }
  return {root, repository, remote, options, orphanPath, keptPath, keptHash, newPath, newHash}
}

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'offline-guides-publication-')))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repository = path.join(root, 'repository')
  const remote = path.join(root, 'remote.git')
  fs.mkdirSync(repository)
  git(repository, ['init'])
  git(repository, ['config', 'user.name', 'Test'])
  git(repository, ['config', 'user.email', 'test@example.com'])
  write(repository, 'content/en/guides/tutorials/a.md', '# source v1\n')
  write(repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/existing.md', '# existing\n')
  write(repository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  const sourceToolingSha = commit(repository, 'source tooling')
  write(repository, 'content/en/guides/tutorials/a.md', '# source v2\n')
  const sourceCheckpointSha = commit(repository, 'source checkpoint')
  const sourceBaselineSha = sourceToolingSha
  write(repository, 'tooling-marker.txt', 'execution tooling\n')
  const executionToolingSha = commit(repository, 'execution tooling')
  write(repository, 'target-marker.txt', 'dev baseline\n')
  const targetBaselineSha = commit(repository, 'target baseline')
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'
  const sourceHash = crypto.createHash('sha256').update('# source v2\n').digest('hex')
  write(repository, targetPath, '# 日本語\n')
  write(repository, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {
    'docs/tutorials/a.md': {sourceHash, targetPath, translatedAt: '2026-09-01T00:00:00.000Z'},
  }}, null, 2)}\n`)
  const candidateSha = commit(repository, 'offline candidate')
  execFileSync('git', ['init', '--bare', remote])
  git(repository, ['remote', 'add', 'origin', remote])
  git(repository, ['push', 'origin', `${targetBaselineSha}:refs/heads/dev`])
  const candidateRef = 'refs/heads/offline-translation-candidates/test'
  git(repository, ['push', 'origin', `${candidateSha}:${candidateRef}`])
  git(repository, ['checkout', '--detach', executionToolingSha])
  const options = {
    repositoryRoot: repository,
    repository: 'zilliztech/zdoc',
    sourceToolingSha,
    executionToolingSha,
    sourceBaselineSha,
    sourceCheckpointSha,
    targetBranch: 'dev',
    targetBaselineSha,
    candidateRef,
    candidateSha,
    expectedMdxCount: 1,
  }
  return {root, repository, remote, options, targetPath}
}

function selection(candidate, runId = 123, runAttempt = 1) {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: candidate.repository,
    runId,
    runAttempt,
    toolingSha: candidate.executionToolingSha,
    targetBranch: candidate.targetBranch,
    initialTargetSha: candidate.targetBaselineSha,
    sourceBaselineSha: candidate.targetBaselineSha,
    inputs: {selectedGroup: 'guides', publish: true, runTranslations: false},
    units: [{
      unitKey: 'translation/ja-JP/guides', producerJob: 'prepare_offline_candidate', strategy: 'ja-guides',
      target: 'ja-JP', group: 'guides', sourceGroup: 'guides', toolingSha: candidate.executionToolingSha,
      sourceBaselineSha: candidate.sourceBaselineSha, sourceCheckpointSha: candidate.sourceCheckpointSha,
      targetBranch: candidate.targetBranch,
      artifacts: {checkpoint: `offline-checkpoint-${runId}`, baseline: `offline-baseline-${runId}`},
      commitMessage: 'i18n(ja-JP): publish offline Guides translations',
      validationCommands: VALIDATION_SPECS.map(spec => spec.command), environment: {},
    }],
  })
}

test('strictly authenticates one exact offline candidate commit and its cache sourceHash', t => {
  const value = fixture(t)
  const candidate = inspectOfflineCandidate(value.options)
  assert.deepEqual(candidate.paths, ['.translation-cache/ja-JP.json', value.targetPath])
  assert.deepEqual(candidate.translationPaths, [value.targetPath])
  assert.equal(candidate.files.length, 2)
})

test('rejects target drift, non-single-parent identity, deletions, symlinks, and out-of-scope paths', async t => {
  const value = fixture(t)
  assert.throws(() => inspectOfflineCandidate({...value.options, targetBaselineSha: value.options.sourceCheckpointSha}), /remote target/i)

  for (const [name, mutate, pattern] of [
    ['deletion', () => fs.rmSync(path.join(value.repository, 'tooling-marker.txt')), /forbidden D change/i],
    ['symlink', () => fs.symlinkSync('current/tutorials/a.md', path.join(value.repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json')), /regular non-executable file/i],
    ['outside', () => write(value.repository, 'README.md', 'unexpected\n'), /outside the fixed allowlist/i],
    ['cache-root', () => {
      const cache = JSON.parse(fs.readFileSync(path.join(value.repository, '.translation-cache/ja-JP.json'), 'utf8'))
      cache.files['docs-byoc/tutorials/a.md'] = cache.files['docs/tutorials/a.md']
      delete cache.files['docs/tutorials/a.md']
      write(value.repository, '.translation-cache/ja-JP.json', `${JSON.stringify(cache, null, 2)}\n`)
    }, /source and target roots do not correspond/i],
  ]) {
    git(value.repository, ['checkout', '--detach', value.options.targetBaselineSha])
    write(value.repository, value.targetPath, git(value.repository, ['show', `${value.options.candidateSha}:${value.targetPath}`]))
    write(value.repository, '.translation-cache/ja-JP.json', git(value.repository, ['show', `${value.options.candidateSha}:.translation-cache/ja-JP.json`]))
    mutate()
    const candidateSha = commit(value.repository, name)
    const candidateRef = `refs/heads/offline-translation-candidates/${name}`
    git(value.repository, ['push', 'origin', `${candidateSha}:${candidateRef}`])
    git(value.repository, ['checkout', '--detach', value.options.executionToolingSha])
    assert.throws(() => inspectOfflineCandidate({...value.options, candidateSha, candidateRef}), pattern)
  }
})

test('accepts a reconciliation orphan deletion that removes the orphan and its cache key', async t => {
  const value = orphanFixture(t)
  git(value.repository, ['checkout', '--detach', value.options.targetBaselineSha])
  fs.rmSync(path.join(value.repository, value.orphanPath))
  write(value.repository, value.newPath, '# new ja\n')
  const cache = JSON.parse(fs.readFileSync(path.join(value.repository, '.translation-cache/ja-JP.json'), 'utf8'))
  delete cache.files['docs/tutorials/orphan.md']
  cache.files['docs/tutorials/new.md'] = {sourceHash: value.newHash, targetPath: value.newPath, translatedAt: '2026-09-01T00:00:00.000Z'}
  write(value.repository, '.translation-cache/ja-JP.json', `${JSON.stringify(cache, null, 2)}\n`)
  const candidateSha = commit(value.repository, 'orphan delete + add')
  const candidateRef = 'refs/heads/offline-translation-candidates/orphan-delete'
  git(value.repository, ['push', 'origin', `${candidateSha}:${candidateRef}`])
  git(value.repository, ['checkout', '--detach', value.options.executionToolingSha])
  const candidate = inspectOfflineCandidate({...value.options, candidateSha, candidateRef})
  assert.deepEqual(candidate.deletions, [value.orphanPath])
  assert.deepEqual(candidate.deletedCacheKeys, ['docs/tutorials/orphan.md'])
  assert.deepEqual(candidate.translationPaths, [value.newPath])
})

test('rejects an orphan deletion whose source still exists at the source checkpoint', async t => {
  const value = orphanFixture(t)
  git(value.repository, ['checkout', '--detach', value.options.targetBaselineSha])
  fs.rmSync(path.join(value.repository, value.keptPath))
  write(value.repository, value.newPath, '# new ja\n')
  const cache = JSON.parse(fs.readFileSync(path.join(value.repository, '.translation-cache/ja-JP.json'), 'utf8'))
  delete cache.files['docs/tutorials/kept.md']
  cache.files['docs/tutorials/new.md'] = {sourceHash: value.newHash, targetPath: value.newPath, translatedAt: '2026-09-01T00:00:00.000Z'}
  write(value.repository, '.translation-cache/ja-JP.json', `${JSON.stringify(cache, null, 2)}\n`)
  const candidateSha = commit(value.repository, 'kept delete + add')
  const candidateRef = 'refs/heads/offline-translation-candidates/kept-delete'
  git(value.repository, ['push', 'origin', `${candidateSha}:${candidateRef}`])
  git(value.repository, ['checkout', '--detach', value.options.executionToolingSha])
  assert.throws(() => inspectOfflineCandidate({...value.options, candidateSha, candidateRef}), /orphan deletion source still exists at source checkpoint/)
})

test('creates authenticated checkpoint, baseline, and publication-ready evidence without a batch-set contract', t => {
  const value = fixture(t)
  const inspected = inspectOfflineCandidate(value.options)
  const candidate = Object.freeze({...inspected, validation: validation(inspected.executionToolingSha, inspected.targetBaselineSha, inspected.candidateSha)})
  const document = selection(candidate)
  const outputRoot = path.join(value.root, 'evidence')
  fs.mkdirSync(outputRoot, {mode: 0o700})
  const evidence = createOfflineEvidence({candidate, selection: document, outputRoot})
  assert.equal(evidence.checkpoint.manifest.stage, 'translation-guides-offline-import')
  assert.equal(evidence.baseline.manifest.kind, 'baseline')
  assert.equal(evidence.ready.outcome, 'candidate')
  assert.ok(fs.statSync(evidence.checkpoint.archive).size > 0)

  const extracted = []
  for (const artifact of [evidence.checkpoint, evidence.baseline]) {
    const root = fs.mkdtempSync(path.join(value.root, 'extract-'))
    execFileSync('tar', ['-xf', artifact.archive, '-C', root])
    extracted.push({artifactDir: path.join(root, 'checkpoint-group'), manifest: artifact.manifest})
  }
  const pair = validateOfflineArtifactPair({checkpoint: extracted[0], baseline: extracted[1], selection: document, unit: document.units[0]})
  assert.equal(pair.checkpoint.candidateSha, candidate.candidateSha)
})

test('publication coordinator resolves the offline artifact pair without parsing a translation batch set', async t => {
  const value = fixture(t)
  const inspected = inspectOfflineCandidate(value.options)
  const candidate = Object.freeze({...inspected, validation: validation(inspected.executionToolingSha, inspected.targetBaselineSha, inspected.candidateSha)})
  const document = selection(candidate)
  const outputRoot = path.join(value.root, 'coordinator-evidence')
  fs.mkdirSync(outputRoot, {mode: 0o700})
  const evidence = createOfflineEvidence({candidate, selection: document, outputRoot})
  const artifacts = new Map([
    [document.units[0].artifacts.checkpoint, evidence.checkpoint.archive],
    [document.units[0].artifacts.baseline, evidence.baseline.archive],
  ])
  const resolved = await resolveJapaneseGuidesCandidate({
    selection: document,
    unit: document.units[0],
    runnerTemp: value.root,
    client: {
      async downloadReady() { return {descriptor: evidence.ready} },
      async downloadArtifactFiles(name) { return {files: {'checkpoint-group.tar': artifacts.get(name)}} },
    },
  })
  assert.equal(resolved.status, 'ready')
  assert.equal(resolved.prepared.offlineManifest.stage, 'translation-guides-offline-import')
  const transaction = await publishJapaneseGuidesTransaction({
    selection: document,
    unit: document.units[0],
    prepared: resolved.prepared,
    repositoryRoot: value.repository,
    runnerTemp: value.root,
    strategies: {'ja-guides': {
      name: 'ja-guides',
      async compose() { return {status: 'no_changes'} },
      async validate() { throw new Error('not reached') },
      async promote() { throw new Error('not reached') },
    }},
    transactionContext: {readTargetTip: async () => candidate.targetBaselineSha},
  })
  assert.equal(transaction.status, 'no_changes', JSON.stringify(transaction))
  removePrepared(resolved.prepared)
})

test('offline strategy retains staging on validation failure and deletes it only after confirmed promotion', async t => {
  const value = fixture(t)
  const inspected = inspectOfflineCandidate(value.options)
  const manifest = {
    ...createOfflineEvidenceForManifest(t, value, inspected),
  }
  validateOfflineManifest(manifest, {kind: 'checkpoint'})
  const calls = []
  const strategy = createOfflineGuidesStrategy({
    inspectOfflineCandidate: () => inspected,
    pushDiagnosticStagingCandidate: input => calls.push(['push', input]),
    promoteStaging: input => { calls.push(['promote', input]); return {publishedSha: input.stagedSha} },
    deleteDiagnosticStagingWithLease: input => { calls.push(['delete', input]); return {cleanupDebt: null} },
  })
  const inputs = {
    manifest, repositoryRoot: value.repository, dependencyRoot: value.repository, runnerTemp: value.root,
    runId: 123, runAttempt: 1, selectionSha256: 'b'.repeat(64), validationOutput: path.join(value.root, 'validation.json'),
  }
  const composed = await strategy.compose({latestDevSha: inspected.targetBaselineSha, inputs})
  const checked = await strategy.validate({candidate: composed})
  assert.equal(checked.validationReceipts.length, 7)
  let cleanup
  const promoted = await strategy.promote({candidate: composed, expectedDevSha: inspected.targetBaselineSha, deferConfirmedPromotionCleanup: callback => { cleanup = callback }})
  assert.equal(promoted.resultSha, inspected.candidateSha)
  assert.deepEqual(calls.map(call => call[0]), ['push', 'promote'])
  await cleanup()
  assert.deepEqual(calls.map(call => call[0]), ['push', 'promote', 'delete'])
})

function createOfflineEvidenceForManifest(t, value, inspected) {
  const candidate = Object.freeze({...inspected, validation: validation(inspected.executionToolingSha, inspected.targetBaselineSha, inspected.candidateSha)})
  const document = selection(candidate)
  const outputRoot = path.join(value.root, `strategy-evidence-${Math.random().toString(16).slice(2)}`)
  fs.mkdirSync(outputRoot, {mode: 0o700})
  return createOfflineEvidence({candidate, selection: document, outputRoot}).checkpoint.manifest
}
