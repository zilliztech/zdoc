'use strict'

const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const {applyCheckpointArtifact} = require('./apply-checkpoint-artifact')
const {definePublicationStrategy} = require('./publication-strategy-registry')
const {loadTypeScript} = require('../lib/load-typescript')
const {resolveTranslationTarget} = loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts')

const SHA = /^[0-9a-f]{40}$/u
const activeWorktrees = new Map()

function command(cwd, executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: options.buffer ? null : 'utf8',
    env: options.environment || process.env,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (!options.allowFailure && result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : result.stderr
    const stdout = Buffer.isBuffer(result.stdout) ? result.stdout.toString('utf8') : result.stdout
    const error = new Error(stderr.trim() || stdout.trim() || `${executable} exited ${result.status}`)
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

function createWorktree(repositoryRoot, runnerTemp, prefix, sha) {
  const destination = fs.mkdtempSync(path.join(runnerTemp, prefix))
  fs.rmdirSync(destination)
  git(repositoryRoot, ['worktree', 'add', '--detach', destination, sha])
  return destination
}

function removeWorktree(repositoryRoot, worktree) {
  if (!worktree) return
  git(repositoryRoot, ['worktree', 'remove', '--force', worktree], {allowFailure: true})
  fs.rmSync(worktree, {recursive: true, force: true})
  git(repositoryRoot, ['worktree', 'prune'], {allowFailure: true})
}

function linkDependencies(repositoryRoot, validationWorktree) {
  const roots = [
    path.join(repositoryRoot, 'node_modules'),
    ...['apps', 'packages'].flatMap(directory => {
      const root = path.join(repositoryRoot, directory)
      if (!fs.existsSync(root)) return []
      return fs.readdirSync(root, {withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(root, entry.name, 'node_modules'))
    }),
  ]
  for (const source of roots) {
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) continue
    const relative = path.relative(repositoryRoot, source)
    const destination = path.join(validationWorktree, relative)
    if (fs.existsSync(destination)) continue
    fs.mkdirSync(path.dirname(destination), {recursive: true})
    fs.symlinkSync(source, destination)
  }
}

function manifestMap(manifest) {
  return new Map(manifest.files.map(entry => [entry.path, entry]))
}

function payloadFile(manifest, relative) {
  return path.join(manifest.resolvedDir, 'payload', ...relative.split('/'))
}

function readPayload(manifest, relative) {
  const entry = manifestMap(manifest).get(relative)
  return entry ? fs.readFileSync(payloadFile(manifest, relative)) : null
}

function readTarget(root, relative) {
  const target = path.join(root, ...relative.split('/'))
  try {
    const stat = fs.lstatSync(target)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Translation content target must be a regular file: ${relative}`)
    return fs.readFileSync(target)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null
    throw error
  }
}

function sameBytes(left, right) {
  return left === null || right === null ? left === right : left.equals(right)
}

function contentPaths(checkpoint, baseline, statePath) {
  return [...new Set([
    ...baseline.files.map(entry => entry.path),
    ...checkpoint.files.map(entry => entry.path),
    ...checkpoint.deletions,
  ])].filter(relative => relative !== statePath).sort()
}

function captureContentPlan(checkpoint, baseline, worktree, statePath) {
  const plan = []
  for (const relative of contentPaths(checkpoint, baseline, statePath)) {
    const before = readPayload(baseline, relative)
    const after = checkpoint.deletions.includes(relative) ? null : readPayload(checkpoint, relative)
    const target = readTarget(worktree, relative)
    if (sameBytes(after, before)) {
      plan.push({relative, preserve: target})
      continue
    }
    if (!sameBytes(target, before) && !sameBytes(target, after)) {
      throw new Error(`Translation content conflict: ${relative}`)
    }
  }
  return plan
}

function restorePreservedContent(worktree, plan) {
  for (const item of plan) {
    const target = path.join(worktree, ...item.relative.split('/'))
    if (item.preserve === null) fs.rmSync(target, {recursive: true, force: true})
    else {
      fs.mkdirSync(path.dirname(target), {recursive: true})
      fs.writeFileSync(target, item.preserve)
    }
  }
}

function commitBody(unit) {
  return [
    `target: ${unit.target}`,
    `group: ${unit.group}`,
    `sourceCheckpointSha: ${unit.sourceCheckpointSha}`,
    `toolingSha: ${unit.toolingSha}`,
  ].join('\n')
}

function validateInputs(inputs, latestDevSha) {
  if (!SHA.test(latestDevSha || '')) throw new Error('latestDevSha must be a lowercase 40-character SHA')
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) throw new Error('Translation checkpoint inputs are required')
  const {checkpoint, baseline, unit} = inputs
  if (!checkpoint?.resolvedDir || !baseline?.resolvedDir) throw new Error('Authenticated checkpoint and baseline payloads are required')
  if (!unit || unit.strategy !== 'checkpoint' || !unit.target || !unit.group) throw new Error('Translation checkpoint unit metadata is required')
  for (const key of ['group', 'translationTarget', 'sourceCheckpointSha', 'toolingSha']) {
    const expected = key === 'translationTarget' ? unit.target : unit[key]
    if (checkpoint[key] !== expected || baseline[key] !== expected) throw new Error(`Translation checkpoint ${key} mismatch`)
  }
  return inputs
}

function cleanupCandidate(candidate) {
  const state = activeWorktrees.get(candidate.candidateSha)
  if (!state) return
  activeWorktrees.delete(candidate.candidateSha)
  removeWorktree(state.repositoryRoot, state.publicationWorktree)
}

async function compose({latestDevSha, inputs: rawInputs}) {
  const inputs = validateInputs(rawInputs, latestDevSha)
  const repositoryRoot = fs.realpathSync(inputs.repositoryRoot)
  const runnerTemp = fs.realpathSync(inputs.runnerTemp)
  const unit = inputs.unit
  const now = typeof inputs.now === 'function' ? inputs.now : () => new Date()
  let publicationWorktree = null
  try {
    publicationWorktree = createWorktree(repositoryRoot, runnerTemp, 'translation-checkpoint.', latestDevSha)
    const statePath = resolveTranslationTarget(unit.target).state.path
    const contentPlan = captureContentPlan(inputs.checkpoint, inputs.baseline, publicationWorktree, statePath)
    await (inputs.dependencies?.applyCheckpointArtifact || applyCheckpointArtifact)({
      artifactDir: inputs.checkpoint.resolvedDir,
      baselineDir: path.join(inputs.baseline.resolvedDir, 'payload'),
      targetDir: publicationWorktree,
    })
    restorePreservedContent(publicationWorktree, contentPlan)
    git(publicationWorktree, ['add', '--all'])
    if (git(publicationWorktree, ['diff', '--cached', '--quiet'], {allowFailure: true}).status === 0) {
      removeWorktree(repositoryRoot, publicationWorktree)
      return Object.freeze({status: 'no_changes'})
    }
    git(publicationWorktree, ['config', 'user.name', inputs.authorName || 'docs-publish-bot'])
    git(publicationWorktree, ['config', 'user.email', inputs.authorEmail || 'docs-publish-bot@users.noreply.github.com'])
    const commitEnvironment = {
      ...process.env,
      GIT_AUTHOR_DATE: now().toISOString(),
      GIT_COMMITTER_DATE: now().toISOString(),
    }
    command(publicationWorktree, 'git', ['commit', '-m', unit.commitMessage, '-m', commitBody(unit)], {environment: commitEnvironment})
    const candidateSha = git(publicationWorktree, ['rev-parse', 'HEAD']).stdout.trim()
    activeWorktrees.set(candidateSha, {repositoryRoot, publicationWorktree})
    return Object.freeze({
      status: 'candidate',
      candidateSha,
      commitShas: Object.freeze([candidateSha]),
      publicationWorktree,
      repositoryRoot,
      dependencyRoot: inputs.dependencyRoot || repositoryRoot,
      runnerTemp,
      checkpoint: inputs.checkpoint,
      unit,
      environment: Object.freeze({...process.env, ...(inputs.environment || {}), ...unit.environment}),
      now,
    })
  } catch (error) {
    removeWorktree(repositoryRoot, publicationWorktree)
    throw error
  }
}

async function validate({candidate}) {
  let validationWorktree = null
  const receipts = []
  try {
    validationWorktree = createWorktree(candidate.repositoryRoot, candidate.runnerTemp, 'translation-validation.', candidate.unit.toolingSha)
    linkDependencies(candidate.dependencyRoot, validationWorktree)
    command(validationWorktree, 'bash', [path.join(__dirname, '../restore-generated-state.sh'), '--exact', '--ref', candidate.candidateSha], {
      environment: candidate.environment,
    })
    for (const validationCommand of candidate.unit.validationCommands) {
      const startedAt = candidate.now().toISOString()
      const result = command(validationWorktree, 'bash', ['-o', 'errexit', '-o', 'nounset', '-o', 'pipefail', '-c', validationCommand], {
        allowFailure: true,
        environment: candidate.environment,
      })
      const receipt = Object.freeze({
        command: validationCommand,
        exitCode: result.status,
        startedAt,
        completedAt: candidate.now().toISOString(),
        candidateSha: candidate.candidateSha,
        target: candidate.unit.target,
        group: candidate.unit.group,
        sourceCheckpointSha: candidate.unit.sourceCheckpointSha,
        toolingSha: candidate.unit.toolingSha,
      })
      receipts.push(receipt)
      if (result.status !== 0) {
        const error = new Error(result.stderr.trim() || result.stdout.trim() || `${validationCommand} exited ${result.status}`)
        error.validationReceipts = Object.freeze([...receipts])
        throw error
      }
    }
    return Object.freeze({validationReceipts: Object.freeze(receipts)})
  } catch (error) {
    cleanupCandidate(candidate)
    throw error
  } finally {
    removeWorktree(candidate.repositoryRoot, validationWorktree)
  }
}

async function promote(context) {
  try {
    const result = await context.promoteCandidate({
      candidate: context.candidate,
      expectedDevSha: context.expectedDevSha,
      worktree: context.candidate.publicationWorktree,
    })
    return result || Object.freeze({status: 'published'})
  } finally {
    cleanupCandidate(context.candidate)
  }
}

const translationCheckpointStrategy = definePublicationStrategy({name: 'checkpoint', compose, validate, promote})

module.exports = {translationCheckpointStrategy}
