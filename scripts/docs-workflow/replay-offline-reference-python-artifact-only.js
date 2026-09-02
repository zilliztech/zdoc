#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const {canonicalJson, checksum, UNIT_KEY} = require('./offline-reference-python-publication')
const {prepareOfflineReferencePythonPublication} = require('./prepare-offline-reference-python-publication')
const {runPublicationCoordinator} = require('./publication-coordinator')

const SOURCE_PATH = 'content/en/reference/api/python/python/DataImport/DataImport-BulkFileType.md'
const TARGET_PATH = 'content/zh-CN/reference/api/python/python/DataImport/DataImport-BulkFileType.md'

function command(binary, args, options = {}) {
  const output = execFileSync(binary, args, {cwd: options.cwd, encoding: options.buffer ? null : 'utf8', maxBuffer: 64 * 1024 * 1024, env: options.env || process.env})
  return options.buffer ? output : output.trim()
}
function git(repository, args, options = {}) { return command('git', ['-C', repository, ...args], options) }
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function archiveDescriptor(value) { return {archiveSha256: value.archiveSha256, manifestSha256: value.manifestSha256} }

async function main() {
  const repositoryRoot = fs.realpathSync(process.cwd())
  const baselineSha = git(repositoryRoot, ['rev-parse', 'origin/dev'])
  const toolingSha = git(repositoryRoot, ['rev-parse', 'HEAD'])
  const evidenceRoot = path.resolve(process.argv[2] || path.join(repositoryRoot, '.claude/evidence/offline-zh-reference-python-live-source'))
  fs.mkdirSync(evidenceRoot, {recursive: true, mode: 0o700})
  fs.chmodSync(evidenceRoot, 0o700)
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-reference-python-replay.'))
  const repository = path.join(temporaryRoot, 'repository')
  const remote = path.join(temporaryRoot, 'remote.git')
  try {
    command('git', ['clone', '--no-hardlinks', '--shared', repositoryRoot, repository])
    git(repository, ['config', 'user.name', 'Offline Reference replay'])
    git(repository, ['config', 'user.email', 'offline-reference-replay@example.invalid'])
    git(repository, ['checkout', '--detach', baselineSha])
    command('git', ['init', '--bare', remote])
    git(repository, ['remote', 'set-url', 'origin', remote])
    git(repository, ['push', 'origin', baselineSha + ':refs/heads/dev'])
    const sourceBytes = command('git', ['-C', repository, 'show', baselineSha + ':' + SOURCE_PATH], {buffer: true})
    const baselineBytes = command('git', ['-C', repository, 'show', baselineSha + ':' + TARGET_PATH], {buffer: true})
    const candidateBytes = Buffer.concat([baselineBytes, Buffer.from('\n<!-- offline-reference-python-artifact-only-replay -->\n')])
    fs.writeFileSync(path.join(repository, TARGET_PATH), candidateBytes)
    git(repository, ['add', '--', TARGET_PATH])
    git(repository, ['commit', '-m', 'test: synthetic offline Python Reference candidate'])
    const candidateSha = git(repository, ['rev-parse', 'HEAD'])
    const body = {
      schemaVersion: 1, document: 'offline-reference-translation-receipt', unitKey: UNIT_KEY,
      toolingSha, sourceCheckpointSha: baselineSha, targetBaselineSha: baselineSha,
      files: [{sourcePath: SOURCE_PATH, sourceSha256: hash(sourceBytes), targetPath: TARGET_PATH, baseTargetSha256: hash(baselineBytes), targetSha256: hash(candidateBytes)}],
    }
    const receipt = {...body, receiptSha256: checksum(canonicalJson(body))}
    const receiptFile = path.join(evidenceRoot, 'receipt.json')
    fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + '\n')
    const outputRoot = path.join(evidenceRoot, 'prepared')
    fs.mkdirSync(outputRoot, {recursive: true, mode: 0o700})
    fs.chmodSync(outputRoot, 0o700)
    const prepared = await prepareOfflineReferencePythonPublication({
      repositoryRoot: repository, repository: 'zilliztech/zdoc', candidateSha, targetBaselineSha: baselineSha,
      sourceCheckpointSha: baselineSha, toolingSha, receiptFile, targetBranch: 'dev', runId: 9002001,
      runAttempt: 1, publish: false, outputRoot, dependencyRoot: repositoryRoot,
      commandEnvironment: {PATH: '/opt/homebrew/opt/node@22/bin:' + process.env.PATH},
    })
    const unit = prepared.selection.units[0]
    const archives = new Map([[unit.artifacts.checkpoint, prepared.checkpoint.archive], [unit.artifacts.baseline, prepared.baseline.archive]])
    const coordinatorTemp = fs.realpathSync(fs.mkdtempSync(path.join(temporaryRoot, 'coordinator.')))
    let publishCalls = 0
    const outcome = await runPublicationCoordinator({
      selection: prepared.selection, mode: 'artifact_only', repositoryRoot: repository, dependencyRoot: repositoryRoot,
      remote, outputDirectory: path.join(evidenceRoot, 'coordinator'), runnerTemp: coordinatorTemp,
      pollMilliseconds: 1, sleep: async () => {}, publishUnit: async () => { publishCalls += 1 },
      client: {
        async listJobs() { return [{id: 1, name: unit.producerJob, run_attempt: 1, status: 'completed', conclusion: 'success', completed_at: '2026-09-02T00:00:01.000Z'}] },
        async downloadReady() { return {descriptor: prepared.ready} },
        async downloadArtifactFiles(name) { return {files: {'checkpoint-group.tar': archives.get(name)}} },
        async uploadProgress({snapshot}) { return {ok: true, artifactName: 'local-progress-' + snapshot.revision} },
        async uploadResults() { return {artifactName: prepared.names.results, artifactId: 1} },
      },
    })
    const remoteDevSha = git(repository, ['ls-remote', remote, 'refs/heads/dev']).split(/\s/u)[0]
    if (publishCalls !== 0 || outcome.results.overallStatus !== 'success' || outcome.results.finalTargetSha !== baselineSha || remoteDevSha !== baselineSha) {
      throw new Error('artifact-only replay changed publication state or did not reach success')
    }
    const evidence = {
      schemaVersion: 1, document: 'offline-reference-python-live-source-synthetic-replay',
      toolingSha, baselineSha, candidateSha, candidateParent: git(repository, ['rev-parse', candidateSha + '^']),
      sourcePath: SOURCE_PATH, targetPath: TARGET_PATH, receiptSha256: receipt.receiptSha256,
      selectionSha256: prepared.selection.selectionSha256,
      checkpoint: archiveDescriptor(prepared.checkpoint), baseline: archiveDescriptor(prepared.baseline),
      coordinator: {mode: outcome.results.mode, overallStatus: outcome.results.overallStatus, unitStatus: outcome.results.units[0].status, finalTargetSha: outcome.results.finalTargetSha, publishCalls},
      localRemote: {devShaBefore: baselineSha, devShaAfter: remoteDevSha},
    }
    fs.writeFileSync(path.join(evidenceRoot, 'replay-summary.json'), JSON.stringify(evidence, null, 2) + '\n')
    process.stdout.write(JSON.stringify(evidence, null, 2) + '\n')
  } finally {
    fs.rmSync(temporaryRoot, {recursive: true, force: true})
  }
}

main().catch(error => { process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1 })
