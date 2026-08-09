#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {promptContractSha256} = require('./recovery-artifact')
const {analyzeRecoveryCompatibility} = require('./recovery-preflight')

const SHA = /^[0-9a-f]{40}$/u

function repositoryPath(value, label) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || value.includes('\\') || value.includes('\0') ||
      path.posix.normalize(value) !== value || value.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error(`${label} is not a safe repository-relative path`)
  }
  return value
}

function git(repository, args, options = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: options.encoding, maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(String(result.stderr || result.stdout || `git exited ${result.status}`).trim())
  return result.stdout
}

function writeSource(repository, sourceSha, workspace, sourcePath) {
  const relative = repositoryPath(sourcePath, 'Recovery source path')
  const bytes = git(repository, ['show', `${sourceSha}:${relative}`])
  const destination = path.join(workspace, ...relative.split('/'))
  fs.mkdirSync(path.dirname(destination), {recursive: true})
  fs.writeFileSync(destination, bytes)
}

function replayRetainedRecovery({repository, sourceSha, recoveryArtifact, executionToolingSha, output}) {
  const repositoryRoot = fs.realpathSync(repository)
  const artifactRoot = fs.realpathSync(recoveryArtifact)
  if (!SHA.test(sourceSha || '') || !SHA.test(executionToolingSha || '')) throw new Error('Replay SHAs must be exact lowercase commits')
  git(repositoryRoot, ['cat-file', '-e', `${sourceSha}^{commit}`], {encoding: 'utf8'})
  const toolingCheckout = fs.realpathSync(process.cwd())
  const actualExecutionToolingSha = String(git(toolingCheckout, ['rev-parse', 'HEAD'], {encoding: 'utf8'})).trim()
  if (!SHA.test(actualExecutionToolingSha) || actualExecutionToolingSha !== executionToolingSha) {
    throw new Error(`Execution tooling checkout HEAD mismatch: expected ${executionToolingSha}, actual ${actualExecutionToolingSha || 'invalid'}`)
  }
  const metadata = JSON.parse(fs.readFileSync(path.join(artifactRoot, 'metadata.json'), 'utf8'))
  const artifactManifest = JSON.parse(fs.readFileSync(path.join(artifactRoot, 'manifest.json'), 'utf8'))
  if (metadata.schemaVersion !== 2 || artifactManifest.schemaVersion !== 2 || !Array.isArray(artifactManifest.files) || artifactManifest.files.length === 0) {
    throw new Error('Retained recovery artifact must be a non-empty schema-v2 artifact')
  }
  if (metadata.sourceSha !== sourceSha || metadata.translated !== artifactManifest.files.length || metadata.failed !== artifactManifest.failures.length) {
    throw new Error('Retained recovery artifact identity does not match the requested replay')
  }
  const target = metadata.locale === 'zh-CN' ? 'zh-CN-reference' : metadata.locale === 'ja-JP' ? 'ja-JP' : null
  if (!target || typeof metadata.group !== 'string' || typeof metadata.model !== 'string') throw new Error('Retained recovery locale, group, or model is invalid')
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-retained-replay.'))
  try {
    const items = artifactManifest.files.map(record => ({
      sourcePath: repositoryPath(record.sourcePath, 'Recovery record source path'),
      targetPath: repositoryPath(record.targetPath, 'Recovery record target path'),
      sourceHash: record.sourceHash,
      locale: metadata.locale,
      type: target === 'zh-CN-reference' ? 'reference' : 'docs',
      reason: 'stale_source',
    }))
    for (const sourcePath of new Set(items.map(item => item.sourcePath))) writeSource(repositoryRoot, sourceSha, workspace, sourcePath)
    const manifest = {target, locale: metadata.locale, group: metadata.group, sourceCheckpointSha: sourceSha, items}
    const analysis = analyzeRecoveryCompatibility({
      siteDir: workspace,
      manifest,
      artifacts: [artifactRoot],
      promptContractSha256: promptContractSha256(target, process.cwd()),
      model: metadata.model,
      executionToolingSha: actualExecutionToolingSha,
      allowFullRetranslate: false,
    })
    const first = items[0]
    let fullRetranslationGuardVerified = false
    let guardMessage = null
    try {
      analyzeRecoveryCompatibility({
        siteDir: workspace,
        manifest: {...manifest, items: [{...first, targetPath: `${first.targetPath}.guard-pending`}]},
        artifacts: [artifactRoot],
        promptContractSha256: promptContractSha256(target, process.cwd()),
        model: metadata.model,
        executionToolingSha: actualExecutionToolingSha,
        allowFullRetranslate: false,
      })
    } catch (error) {
      guardMessage = String(error.message || error)
      fullRetranslationGuardVerified = Boolean(error.analysis?.fullRetranslation && /explicit.*authorization/i.test(guardMessage))
    }
    if (!fullRetranslationGuardVerified) throw new Error('Full-retranslation admission guard replay did not fail closed')
    const evidence = Object.freeze({
      schemaVersion: 1,
      kind: 'translation-recovery-retained-replay',
      sourceSha,
      artifactToolingSha: metadata.toolingSha,
      expectedExecutionToolingSha: executionToolingSha,
      executionToolingSha: actualExecutionToolingSha,
      candidateCount: analysis.candidateCount,
      recoveredCount: analysis.recoveredCount,
      pendingCount: analysis.pendingCount,
      rejectedCount: analysis.rejectedCount,
      rejections: analysis.rejected.map(item => Object.freeze({sourcePath: item.sourcePath, reason: item.reason})),
      compatibilityMode: analysis.compatibilityMode,
      modelInvocationCount: 0,
      fullRetranslationGuardVerified,
      guardMessage,
    })
    fs.mkdirSync(path.dirname(path.resolve(output)), {recursive: true})
    fs.writeFileSync(path.resolve(output), `${JSON.stringify(evidence, null, 2)}\n`)
    process.stdout.write(`${JSON.stringify(evidence)}\n`)
    return evidence
  } finally {
    fs.rmSync(workspace, {recursive: true, force: true})
  }
}

function parseArgs(argv) {
  const allowed = new Set(['--repository', '--source-sha', '--recovery-artifact', '--execution-tooling-sha', '--output'])
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || values.has(flag)) throw new Error('Recovery replay arguments are invalid')
    values.set(flag, value)
  }
  for (const flag of allowed) if (!values.get(flag)) throw new Error(`${flag} is required`)
  return values
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  return replayRetainedRecovery({
    repository: args.get('--repository'),
    sourceSha: args.get('--source-sha'),
    recoveryArtifact: args.get('--recovery-artifact'),
    executionToolingSha: args.get('--execution-tooling-sha'),
    output: args.get('--output'),
  })
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {parseArgs, replayRetainedRecovery}
