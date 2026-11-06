#!/usr/bin/env node
'use strict'

const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const {linkWorkspaceDependencies} = require('./link-workspace-dependencies')

const {applyCheckpointArtifact} = require('./apply-checkpoint-artifact')
const {
  verifyStagedCheckpointPaths,
  writeStagePathFile,
} = require('./checkpoint-stage-paths')
const {createPublicationStrategyRegistry} = require('./publication-strategy-registry')
const {runPublicationStrategyTransaction} = require('./publication-transaction')
const {translationCheckpointStrategy} = require('./translation-checkpoint-strategy')
const {
  validateCheckpointArtifact,
  validateTranslationCheckpointPair,
} = require('./validate-checkpoint-artifact')

const SHA = /^[0-9a-f]{40}$/u
const activeCleanups = new Set()
const checkpointStrategyRegistry = createPublicationStrategyRegistry([translationCheckpointStrategy])

function osTemp() {
  return require('node:os').tmpdir()
}

const BOUNDED_HEAD = 1000
const BOUNDED_TAIL = 4000
function bounded(value) {
  const text = String(value?.stderr || value?.message || value || 'Unknown checkpoint publication failure')
    .replace(/[\u0000-\u001f\u007f]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
  if (text.length <= BOUNDED_HEAD + BOUNDED_TAIL) return text
  // Build failures bury their root cause at the end of the output, so a
  // head-only slice loses it; keep both ends with the omitted size explicit.
  const omitted = text.length - BOUNDED_HEAD - BOUNDED_TAIL
  return `${text.slice(0, BOUNDED_HEAD)} …[truncated ${omitted} chars]… ${text.slice(-BOUNDED_TAIL)}`
}

function failure(code, phase, error, retryable = false) {
  return Object.freeze({code, phase, message: bounded(error), retryable})
}

// The single-line failure message cannot carry a full build log, so the raw
// stdout/stderr of a failed validation command is preserved next to the
// worktrees for the coordinator to upload as a run artifact.
function writeValidationFailureLog(runnerTemp, unit, error) {
  try {
    const token = String(unit.unitKey).replaceAll('/', '-')
    const file = path.join(runnerTemp, `docs-validation-failure-${token}.log`)
    const body = [
      `unitKey: ${unit.unitKey}`,
      `group: ${unit.group}`,
      `toolingSha: ${unit.toolingSha}`,
      `command: ${error?.validationCommand || '(validation phase setup)'}`,
      `exitStatus: ${error?.status ?? 'unknown'}`,
      '',
      '--- stdout ---',
      String(error?.stdout ?? ''),
      '',
      '--- stderr ---',
      String(error?.stderr ?? error?.message ?? ''),
    ].join('\n')
    fs.writeFileSync(file, body)
    if (error && typeof error === 'object') error.validationLog = file
  } catch { /* Diagnostics must never mask the original failure. */ }
}

function transactionResult(values, now) {
  return Object.freeze({
    status: values.status,
    baseSha: values.baseSha ?? null,
    resultSha: values.resultSha ?? null,
    commitShas: Object.freeze([...(values.commitShas || [])]),
    attempts: values.attempts ?? 0,
    failure: values.failure ?? null,
    remoteState: values.remoteState || 'known',
    completedAt: now().toISOString(),
  })
}

function command(cwd, executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    env: options.environment || process.env,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) {
    const error = new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited ${result.status}`)
    error.status = result.status
    error.stderr = result.stderr
    error.stdout = result.stdout
    throw error
  }
  return result
}

function git(cwd, args, options = {}) {
  return command(cwd, 'git', args, options)
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) throw new Error(`${label} must be an integer from 1 to ${maximum}`)
  return number
}

function singleLine(value, label) {
  if (typeof value !== 'string' || !value || value !== value.trim() || /[\0\r\n]/u.test(value)) throw new Error(`${label} must be a non-empty single-line string`)
  return value
}

const LOG_LABEL_LIMIT = 80
function boundedLabel(value) {
  const text = String(value).replace(/[\0\r\n\t]+/gu, ' ').trim()
  return text.length <= LOG_LABEL_LIMIT ? text : `${text.slice(0, LOG_LABEL_LIMIT - 1)}…`
}

function stagePathCount(stagePathFile) {
  if (!fs.statSync(stagePathFile).size) return 0
  return fs.readFileSync(stagePathFile, 'utf8').split('\0').filter(entry => entry.length).length
}

function realDirectory(value, label) {
  if (typeof value !== 'string' || !value || /[\0\r\n]/u.test(value)) throw new Error(`${label} is required`)
  const resolved = path.resolve(value)
  const canonical = fs.realpathSync(resolved)
  if (!fs.statSync(canonical).isDirectory()) throw new Error(`${label} must resolve to a directory`)
  return canonical
}

function validateUnit(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('unit is required')
  const unit = {
    unitKey: singleLine(input.unitKey, 'unit.unitKey'),
    group: singleLine(input.group, 'unit.group'),
    toolingSha: input.toolingSha,
    sourceBaselineSha: input.sourceBaselineSha,
    targetBranch: singleLine(input.targetBranch, 'unit.targetBranch'),
    commitMessage: singleLine(input.commitMessage, 'unit.commitMessage'),
    validationCommands: input.validationCommands,
    environment: input.environment,
    ...(input.strategy !== undefined ? {strategy: input.strategy} : {}),
    ...(input.target !== undefined ? {target: singleLine(input.target, 'unit.target')} : {}),
    ...(input.sourceCheckpointSha !== undefined ? {sourceCheckpointSha: input.sourceCheckpointSha} : {}),
  }
  if (!SHA.test(unit.toolingSha || '')) throw new Error('unit.toolingSha must be a lowercase 40-character SHA')
  if (!SHA.test(unit.sourceBaselineSha || '')) throw new Error('unit.sourceBaselineSha must be a lowercase 40-character SHA')
  if (!Array.isArray(unit.validationCommands) || !unit.validationCommands.length) throw new Error('unit.validationCommands must be non-empty')
  unit.validationCommands = unit.validationCommands.map((value, index) => singleLine(value, `unit.validationCommands[${index}]`))
  if (!unit.environment || typeof unit.environment !== 'object' || Array.isArray(unit.environment)) throw new Error('unit.environment must be an object')
  unit.environment = {...unit.environment}
  for (const [key, value] of Object.entries(unit.environment)) {
    if (!/^[A-Z_][A-Z0-9_]*$/u.test(key) || typeof value !== 'string' || /[\0\r\n]/u.test(value)) throw new Error('unit.environment is invalid')
  }
  if (unit.strategy !== undefined && unit.strategy !== 'checkpoint') throw new Error('unit.strategy must be checkpoint')
  if (unit.sourceCheckpointSha !== undefined && !SHA.test(unit.sourceCheckpointSha)) throw new Error('unit.sourceCheckpointSha must be a lowercase 40-character SHA')
  return Object.freeze(unit)
}

function createTemporaryWorktree(repositoryRoot, runnerTemp, prefix, sha) {
  const destination = fs.mkdtempSync(path.join(runnerTemp, prefix))
  fs.rmdirSync(destination)
  git(repositoryRoot, ['worktree', 'add', '--detach', destination, sha])
  return destination
}

function removeTemporaryWorktree(repositoryRoot, worktree) {
  if (!worktree) return
  git(repositoryRoot, ['worktree', 'remove', '--force', worktree], {allowFailure: true})
  fs.rmSync(worktree, {recursive: true, force: true})
}

function linkDependencies(repositoryRoot, validationWorktree) {
  linkWorkspaceDependencies(repositoryRoot, validationWorktree)
}

function defaultPushCandidate({worktree, remote, branch}) {
  git(worktree, ['push', remote, `HEAD:refs/heads/${branch}`])
}

function probeRemoteCandidate({repositoryRoot, remote, branch, candidateSha}) {
  const ref = `refs/heads/${branch}`
  const lookup = git(repositoryRoot, ['ls-remote', '--refs', remote, ref]).stdout.trim()
  const lines = lookup.split('\n').filter(Boolean)
  if (lines.length !== 1) throw new Error(`Remote target probe was missing or ambiguous: ${ref}`)
  const fields = lines[0].split(/\s+/u)
  if (fields.length !== 2 || fields[1] !== ref || !SHA.test(fields[0])) throw new Error(`Remote target probe was invalid: ${ref}`)
  const remoteSha = fields[0]
  if (remoteSha === candidateSha) return Object.freeze({remoteSha, containsCandidate: true})
  git(repositoryRoot, ['fetch', '--no-tags', remote, `+${ref}:refs/remotes/${remote}/${branch}`])
  const relation = git(repositoryRoot, ['merge-base', '--is-ancestor', candidateSha, remoteSha], {allowFailure: true})
  if (relation.status !== 0 && relation.status !== 1) throw new Error('Unable to determine remote candidate ancestry')
  return Object.freeze({remoteSha, containsCandidate: relation.status === 0})
}

function commitBody(manifest, environment) {
  const lines = [
    `group: ${manifest.group}`,
    `stage: ${manifest.stage}`,
    `masterSha: ${manifest.masterSha}`,
    `devBaselineSha: ${manifest.devBaselineSha}`,
  ]
  if (environment.GITHUB_RUN_ID) lines.push(`GITHUB_RUN_ID: ${environment.GITHUB_RUN_ID}`)
  if (environment.GITHUB_SERVER_URL && environment.GITHUB_REPOSITORY && environment.GITHUB_RUN_ID) {
    lines.push(`GITHUB_RUN_URL: ${environment.GITHUB_SERVER_URL}/${environment.GITHUB_REPOSITORY}/actions/runs/${environment.GITHUB_RUN_ID}`)
  }
  return lines.join('\n')
}

function installSignalCleanup() {
  if (installSignalCleanup.installed) return
  installSignalCleanup.installed = true
  for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
    process.on(signal, () => {
      for (const cleanup of [...activeCleanups]) {
        try { cleanup() } catch {}
      }
      process.exit(code)
    })
  }
}

async function publishGeneralCheckpointTransaction(options = {}) {
  const repositoryRoot = realDirectory(options.repositoryRoot || process.cwd(), 'repositoryRoot')
  const dependencyRoot = options.dependencyRoot ? realDirectory(options.dependencyRoot, 'dependencyRoot') : repositoryRoot
  const artifactDir = realDirectory(options.artifactDir, 'artifactDir')
  const baselineDir = options.baselineDir ? realDirectory(options.baselineDir, 'baselineDir') : null
  const unit = validateUnit(options.unit)
  const site = unit.environment.ZDOC_SITE
  const remote = singleLine(options.remote || 'origin', 'remote')
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(remote)) throw new Error('remote must be a simple configured name')
  const maxAttempts = positiveInteger(options.maxAttempts ?? 3, 'maxAttempts', 10)
  const maxProbeAttempts = positiveInteger(options.maxProbeAttempts ?? 3, 'maxProbeAttempts', 10)
  const runnerTemp = realDirectory(options.runnerTemp || process.env.RUNNER_TEMP || osTemp(), 'runnerTemp')
  const authorName = singleLine(options.authorName || 'docs-publish-bot', 'authorName')
  const authorEmail = singleLine(options.authorEmail || 'docs-publish-bot@users.noreply.github.com', 'authorEmail')
  const validationToolingSha = options.validationToolingSha || unit.toolingSha
  if (!SHA.test(validationToolingSha)) throw new Error('validationToolingSha must be a lowercase 40-character SHA')
  const environment = {...process.env, ...(options.environment || {})}
  const now = typeof options.now === 'function' ? options.now : () => new Date()
  const deps = {
    applyCheckpointArtifact,
    probeRemoteCandidate,
    pushCandidate: defaultPushCandidate,
    validateCheckpointArtifact,
    verifyStagedCheckpointPaths,
    writeStagePathFile,
    ...(options.dependencies || {}),
  }

  git(repositoryRoot, ['rev-parse', '--show-toplevel'])
  git(repositoryRoot, ['check-ref-format', '--branch', unit.targetBranch])
  git(repositoryRoot, ['config', '--get', `remote.${remote}.url`])

  let manifest
  try {
    manifest = await deps.validateCheckpointArtifact(artifactDir, {
      group: unit.group,
      masterSha: unit.toolingSha,
      devBaselineSha: unit.sourceBaselineSha,
      site,
    })
  } catch (error) {
    return transactionResult({
      status: 'publish_failed', attempts: 0, failure: failure('CHECKPOINT_INVALID', 'artifact_validation', error), remoteState: 'known',
    }, now)
  }
  const log = typeof options.log === 'function' ? options.log : null
  if (log) log(`unit=${unit.unitKey} phase=artifact_validation`)

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let publicationWorktree = null
    let validationWorktree = null
    let scratchDirectory = null
    let baseSha = null
    let phase = 'fetch'
    let phaseStarted = log ? process.hrtime.bigint() : null
    const emitPhase = log ? (name, extra = '') => {
      const ended = process.hrtime.bigint()
      const ms = Number(ended - phaseStarted) / 1e6
      phaseStarted = ended
      log(`unit=${unit.unitKey} attempt=${attempt} phase=${name} ms=${ms.toFixed(0)}${extra}`)
    } : null
    const cleanup = () => {
      removeTemporaryWorktree(repositoryRoot, publicationWorktree)
      publicationWorktree = null
      removeTemporaryWorktree(repositoryRoot, validationWorktree)
      validationWorktree = null
      if (scratchDirectory) fs.rmSync(scratchDirectory, {recursive: true, force: true})
      scratchDirectory = null
      git(repositoryRoot, ['worktree', 'prune'], {allowFailure: true})
    }
    activeCleanups.add(cleanup)
    try {
      git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${unit.targetBranch}:refs/remotes/${remote}/${unit.targetBranch}`])
      baseSha = git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${unit.targetBranch}`]).stdout.trim()
      if (emitPhase) emitPhase('target_fetch', ` base=${baseSha.slice(0, 12)}`)
      phase = 'composition'
      publicationWorktree = createTemporaryWorktree(repositoryRoot, runnerTemp, 'docs-publish.', baseSha)

      const publicationApply = await deps.applyCheckpointArtifact({artifactDir, targetDir: publicationWorktree, site, ...(baselineDir ? {baselineDir} : {})})
      if (emitPhase) emitPhase('apply_publication', ` files=${publicationApply?.copied ?? 0} deletions=${publicationApply?.deletions ?? 0}`)

      scratchDirectory = fs.mkdtempSync(path.join(runnerTemp, 'docs-stage-paths.'))
      const stagePathFile = path.join(scratchDirectory, 'paths.bin')
      await deps.writeStagePathFile({artifactDir, worktree: publicationWorktree, output: stagePathFile, site})
      if (fs.statSync(stagePathFile).size) {
        git(publicationWorktree, ['add', '--all', `--pathspec-from-file=${stagePathFile}`, '--pathspec-file-nul'])
      }
      await deps.verifyStagedCheckpointPaths({artifactDir, worktree: publicationWorktree, site})
      if (emitPhase) emitPhase('stage', ` paths=${stagePathCount(stagePathFile)}`)

      // The checkpoint has now been composed onto the exact target tip. When
      // that composition is byte-identical there is nothing to publish, so the
      // expensive validation composition (a second worktree, the managed-path
      // restore, a second apply, and the per-unit validation commands such as
      // a full site build) is skipped: validation protects a commit that will
      // never exist, and a no-op publish must not fail on it.
      if (git(publicationWorktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
        if (emitPhase) emitPhase('noop_short_circuit')
        return transactionResult({status: 'no_changes', baseSha, resultSha: baseSha, commitShas: [], attempts: attempt}, now)
      }

      // Validation composition setup stays in the composition phase so an
      // infrastructure failure here keeps the CHECKPOINT_COMPOSITION_FAILED
      // code the old order produced; the restore script below is the first
      // operation that is uniquely validation.
      validationWorktree = createTemporaryWorktree(repositoryRoot, runnerTemp, 'docs-validation.', validationToolingSha)
      linkDependencies(dependencyRoot, validationWorktree)
      if (emitPhase) emitPhase('validation_worktree')
      phase = 'validation'
      command(validationWorktree, 'bash', [path.join(__dirname, '../restore-generated-state.sh'), '--exact', '--ref', baseSha], {environment})
      if (emitPhase) emitPhase('restore_generated')
      const validationApply = await deps.applyCheckpointArtifact({artifactDir, targetDir: validationWorktree, site, ...(baselineDir ? {baselineDir} : {})})
      if (emitPhase) emitPhase('apply_validation', ` files=${validationApply?.copied ?? 0} deletions=${validationApply?.deletions ?? 0}`)
      for (const validationCommand of unit.validationCommands) {
        const commandStarted = log ? process.hrtime.bigint() : null
        try {
          command(validationWorktree, 'bash', ['-o', 'errexit', '-o', 'nounset', '-o', 'pipefail', '-c', validationCommand], {
            environment: {...environment, ...unit.environment},
          })
        } catch (error) {
          if (error && typeof error === 'object') error.validationCommand = validationCommand
          throw error
        }
        if (log) {
          const ms = Number(process.hrtime.bigint() - commandStarted) / 1e6
          // The command text is last on the line: it is trusted repo-defined
          // shell but free-form, so it must not shadow key=value fields.
          log(`unit=${unit.unitKey} attempt=${attempt} phase=validation_command ms=${ms.toFixed(0)} command=${boundedLabel(validationCommand)}`)
        }
      }

      phase = 'composition'
      git(publicationWorktree, ['config', 'user.name', authorName])
      git(publicationWorktree, ['config', 'user.email', authorEmail])
      git(publicationWorktree, ['commit', '-m', unit.commitMessage, '-m', commitBody(manifest, environment)])
      const candidateSha = git(publicationWorktree, ['rev-parse', 'HEAD']).stdout.trim()
      if (emitPhase) emitPhase('commit', ` sha=${candidateSha.slice(0, 12)}`)
      try {
        await deps.pushCandidate({repositoryRoot, worktree: publicationWorktree, remote, branch: unit.targetBranch, baseSha, candidateSha})
        if (emitPhase) emitPhase('push')
        return transactionResult({status: 'published', baseSha, resultSha: candidateSha, commitShas: [candidateSha], attempts: attempt}, now)
      } catch (pushError) {
        let probe = null
        let probeError = null
        for (let probeAttempt = 1; probeAttempt <= maxProbeAttempts; probeAttempt += 1) {
          try {
            probe = await deps.probeRemoteCandidate({repositoryRoot, remote, branch: unit.targetBranch, baseSha, candidateSha, probeAttempt})
            probeError = null
            break
          } catch (error) {
            probeError = error
          }
        }
        if (!probe) {
          return transactionResult({
            status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: attempt,
            failure: failure('REMOTE_STATE_UNKNOWN', 'push_probe', probeError || pushError), remoteState: 'unknown',
          }, now)
        }
        if (probe.containsCandidate) {
          return transactionResult({status: 'published', baseSha, resultSha: candidateSha, commitShas: [candidateSha], attempts: attempt}, now)
        }
        if (probe.remoteSha !== baseSha) {
          if (attempt < maxAttempts) continue
          return transactionResult({
            status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: attempt,
            failure: failure('TARGET_DRIFT_EXHAUSTED', 'push', pushError), remoteState: 'known',
          }, now)
        }
        return transactionResult({
          status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: attempt,
          failure: failure('PUSH_FAILED', 'push', pushError), remoteState: 'known',
        }, now)
      }
    } catch (error) {
      if (phase === 'validation') writeValidationFailureLog(runnerTemp, unit, error)
      return transactionResult({
        status: 'publish_failed', baseSha, resultSha: null, commitShas: [], attempts: attempt,
        failure: failure(phase === 'validation' ? 'VALIDATION_FAILED' : 'CHECKPOINT_COMPOSITION_FAILED', phase, error),
        remoteState: 'known',
      }, now)
    } finally {
      cleanup()
      activeCleanups.delete(cleanup)
    }
  }
  throw new Error('Checkpoint publication attempt loop exhausted unexpectedly')
}

function translationUnit(input) {
  return input?.strategy === 'checkpoint' && typeof input.target === 'string' && typeof input.sourceCheckpointSha === 'string'
}


function descriptorChecksums(options) {
  const descriptor = options.descriptor || options.artifactDescriptor
  return {
    checkpointManifestSha256: descriptor?.artifacts?.checkpoint?.manifestSha256,
    baselineManifestSha256: descriptor?.artifacts?.baseline?.manifestSha256,
  }
}

function strategyFailureResult(error, now) {
  return Object.freeze({
    status: 'publish_failed',
    baseSha: null,
    resultSha: null,
    commitShas: Object.freeze([]),
    attempts: 0,
    completedAt: now().toISOString(),
    remoteState: 'known',
    validationReceipts: Object.freeze([]),
    cleanupDebt: Object.freeze([]),
    failure: failure('CHECKPOINT_INVALID', 'artifact_validation', error),
  })
}

async function publishTranslationCheckpointTransaction(options = {}) {
  const repositoryRoot = realDirectory(options.repositoryRoot || process.cwd(), 'repositoryRoot')
  const dependencyRoot = options.dependencyRoot ? realDirectory(options.dependencyRoot, 'dependencyRoot') : repositoryRoot
  const artifactDir = realDirectory(options.artifactDir, 'artifactDir')
  const unit = validateUnit(options.unit)
  const now = typeof options.now === 'function' ? options.now : () => new Date()
  if (!options.baselineDir) return strategyFailureResult(new Error('Translation baselineDir is required'), now)
  const baselineDir = realDirectory(options.baselineDir, 'baselineDir')
  const remote = singleLine(options.remote || 'origin', 'remote')
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(remote)) throw new Error('remote must be a simple configured name')
  const runnerTemp = realDirectory(options.runnerTemp || process.env.RUNNER_TEMP || osTemp(), 'runnerTemp')
  const environment = {...process.env, ...(options.environment || {})}
  const deps = {
    applyCheckpointArtifact,
    probeRemoteCandidate,
    pushCandidate: defaultPushCandidate,
    validateTranslationCheckpointPair,
    ...(options.dependencies || {}),
  }

  git(repositoryRoot, ['rev-parse', '--show-toplevel'])
  git(repositoryRoot, ['check-ref-format', '--branch', unit.targetBranch])
  git(repositoryRoot, ['config', '--get', `remote.${remote}.url`])

  let authenticated
  try {
    authenticated = await deps.validateTranslationCheckpointPair({
      checkpointDir: artifactDir,
      baselineDir,
      expected: {
        group: unit.group,
        translationTarget: unit.target,
        sourceCheckpointSha: unit.sourceCheckpointSha,
        toolingSha: unit.toolingSha,
        ...descriptorChecksums(options),
      },
    })
  } catch (error) {
    return strategyFailureResult(error, now)
  }

  const strategy = checkpointStrategyRegistry.require('checkpoint')
  return runPublicationStrategyTransaction({
    strategy,
    maxAttempts: options.maxAttempts ?? 3,
    maxProbeAttempts: options.maxProbeAttempts ?? 3,
    now,
    inputs: {
      repositoryRoot,
      dependencyRoot,
      runnerTemp,
      checkpoint: {...authenticated.checkpoint, resolvedDir: authenticated.checkpoint.resolvedDir},
      baseline: {...authenticated.baseline, resolvedDir: authenticated.baseline.resolvedDir},
      unit,
      authorName: options.authorName,
      authorEmail: options.authorEmail,
      environment,
      now,
      dependencies: {applyCheckpointArtifact: deps.applyCheckpointArtifact},
    },
    async readTargetTip() {
      git(repositoryRoot, ['fetch', '--no-tags', remote, `+refs/heads/${unit.targetBranch}:refs/remotes/${remote}/${unit.targetBranch}`])
      return git(repositoryRoot, ['rev-parse', `refs/remotes/${remote}/${unit.targetBranch}`]).stdout.trim()
    },
    async promoteCandidate({candidate, expectedDevSha, worktree}) {
      await deps.pushCandidate({
        repositoryRoot,
        worktree: worktree || candidate.publicationWorktree,
        remote,
        branch: unit.targetBranch,
        baseSha: expectedDevSha,
        candidateSha: candidate.candidateSha,
      })
      return Object.freeze({status: 'published'})
    },
    async probeRemoteCandidate({candidateSha, expectedDevSha, probeAttempt}) {
      return deps.probeRemoteCandidate({
        repositoryRoot,
        remote,
        branch: unit.targetBranch,
        baseSha: expectedDevSha,
        candidateSha,
        probeAttempt,
      })
    },
  })
}

async function publishCheckpointTransaction(options = {}) {
  if (translationUnit(options.unit)) return publishTranslationCheckpointTransaction(options)
  return publishGeneralCheckpointTransaction(options)
}

module.exports = {
  probeRemoteCandidate,
  publishCheckpointTransaction,
}
