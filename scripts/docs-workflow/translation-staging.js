'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const STAGING_PREFIX = 'refs/heads/docs-translation-staging/guides/'
const TRANSLATION_ROOTS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
])
const CACHE_PATH = '.translation-cache/ja-JP.json'
const BOT_NAME = 'Zilliz Docs Translation Bot'
const BOT_EMAIL = 'docs@zilliz.com'
const BOT_DATE = '2000-01-01T00:00:00+0000'
const MAX_DIAGNOSTIC = 240

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  const missing = keys.filter(key => !Object.hasOwn(value, key))
  const unknown = Object.keys(value).filter(key => !keys.includes(key))
  if (missing.length || unknown.length) throw new Error(`${label} has invalid keys`)
}

function frozen(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) frozen(child)
  return Object.freeze(value)
}

function boundedMessage(error, fallback) {
  const raw = [error?.stderr, error?.message].find(value => typeof value === 'string' && value.trim()) || fallback
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_DIAGNOSTIC)
}

function sanitizedGitEnvironment(overrides = {}) {
  const environment = {}
  for (const [key, value] of Object.entries(process.env)) if (!key.startsWith('GIT_')) environment[key] = value
  return { ...environment, GIT_TERMINAL_PROMPT: '0', ...overrides }
}

function git(repository, args, options = {}) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: options.buffer ? null : 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    env: sanitizedGitEnvironment(options.env),
  })
}

function gitResult(repository, args) {
  try { return { ok: true, output: git(repository, args).trim() } } catch (error) { return { ok: false, error } }
}

function validateSha(value, label) {
  if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} must be a lowercase 40-character Git SHA`)
  return value
}

function validateSha256(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) throw new Error('pendingSetSha256 must be a lowercase SHA256')
  return value
}

function runInteger(value, label) {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^[1-9][0-9]*$/.test(String(value))) throw new Error(`${label} must be a positive decimal integer`)
  const number = Number(value)
  if (!Number.isSafeInteger(number)) throw new Error(`${label} exceeds the supported bound`)
  return String(number)
}

function realDirectory(directory, label) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory) || /[\0\r\n]/.test(directory)) throw new Error(`${label} must be an absolute path`)
  const resolved = path.resolve(directory)
  let stat
  try { stat = fs.lstatSync(resolved) } catch { throw new Error(`${label} must be an existing real directory`) }
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) throw new Error(`${label} must be a real directory without symlink ancestors`)
  return resolved
}

function repositoryRoot(repository, label = 'repository') {
  const resolved = realDirectory(repository, label)
  let root
  try { root = fs.realpathSync(git(resolved, ['rev-parse', '--show-toplevel']).trim()) } catch { throw new Error(`${label} must be a Git worktree`) }
  if (root !== resolved) throw new Error(`${label} must be the exact Git worktree root`)
  return resolved
}

function commonDirectory(repository) {
  const value = git(repository, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim()
  return fs.realpathSync(path.isAbsolute(value) ? value : path.resolve(repository, value))
}

function validateWorktree(worktree) {
  return repositoryRoot(worktree, 'worktree')
}

function assertSameRepository(repository, worktree) {
  if (commonDirectory(repository) !== commonDirectory(worktree)) throw new Error('worktree does not belong to repository')
}

function head(repository) { return git(repository, ['rev-parse', 'HEAD']).trim() }

function assertDetached(worktree) {
  if (gitResult(worktree, ['symbolic-ref', '-q', 'HEAD']).ok) throw new Error('staging worktree HEAD must be detached')
}

function assertClean(worktree) {
  if (git(worktree, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { buffer: true }).length) throw new Error('staging worktree must be clean')
}

function assertCommit(repository, sha, label) {
  const result = gitResult(repository, ['rev-parse', '--verify', `${sha}^{commit}`])
  if (!result.ok || result.output !== sha) throw new Error(`${label} is not an exact commit in repository`)
}

function assertAncestor(repository, ancestor, descendant, label) {
  if (!gitResult(repository, ['merge-base', '--is-ancestor', ancestor, descendant]).ok) throw new Error(label)
}

function validateStagingRef(stagingRef) {
  const match = typeof stagingRef === 'string'
    ? new RegExp(`^${STAGING_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([1-9][0-9]*)-([1-9][0-9]*)-([0-9a-f]{12})$`).exec(stagingRef)
    : null
  if (!match) throw new Error('stagingRef is outside the fixed Guides staging namespace or invalid')
  runInteger(match[1], 'stagingRef runId')
  runInteger(match[2], 'stagingRef runAttempt')
  return stagingRef
}

function validateTargetBranch(repository, targetBranch) {
  if (typeof targetBranch !== 'string' || !targetBranch || targetBranch.startsWith('-') || targetBranch.startsWith('refs/') || /[\0\r\n:*?\[\\]/.test(targetBranch)) throw new Error('target branch is invalid')
  if (!gitResult(repository, ['check-ref-format', '--branch', targetBranch]).ok) throw new Error('target branch is invalid')
  return targetBranch
}

function remoteRefSha(repository, ref) {
  const output = git(repository, ['ls-remote', '--refs', 'origin', ref]).trim()
  if (!output) return null
  const lines = output.split('\n').filter(Boolean)
  if (lines.length !== 1) throw new Error(`remote ref lookup was ambiguous: ${ref}`)
  const fields = lines[0].split(/\s+/)
  if (fields.length !== 2 || fields[1] !== ref || !/^[0-9a-f]{40}$/.test(fields[0])) throw new Error(`remote ref lookup was invalid: ${ref}`)
  return fields[0]
}

function deterministicStagingRef(options) {
  exactKeys(options, ['runId', 'runAttempt', 'pendingSetSha256'], 'staging ref options')
  const runId = runInteger(options.runId, 'runId')
  const runAttempt = runInteger(options.runAttempt, 'runAttempt')
  const pending = validateSha256(options.pendingSetSha256)
  return `${STAGING_PREFIX}${runId}-${runAttempt}-${pending.slice(0, 12)}`
}

function safeDestination(worktree) {
  if (typeof worktree !== 'string' || !path.isAbsolute(worktree) || /[\0\r\n]/.test(worktree)) throw new Error('worktree must be an absolute path')
  const resolved = path.resolve(worktree)
  const parent = path.dirname(resolved)
  const realParent = realDirectory(parent, 'worktree parent')
  if (realParent !== parent) throw new Error('worktree path contains a symlink ancestor')
  if (!fs.existsSync(resolved)) return { resolved, removeEmpty: false }
  const stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) throw new Error('worktree destination must be a real empty directory')
  if (fs.readdirSync(resolved).length) throw new Error('worktree destination must be empty')
  return { resolved, removeEmpty: true, mode: stat.mode & 0o7777 }
}

function resolvedDestination(worktree) {
  if (typeof worktree !== 'string' || !path.isAbsolute(worktree) || /[\0\r\n]/.test(worktree)) throw new Error('worktree must be an absolute path')
  return path.resolve(worktree)
}

function overlaps(one, two) {
  const relative = path.relative(one, two)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function prepareStagingWorktree(options) {
  exactKeys(options, ['repository', 'expectedTargetSha', 'worktree'], 'prepare options')
  const repository = repositoryRoot(options.repository)
  const expectedTargetSha = validateSha(options.expectedTargetSha, 'expectedTargetSha')
  const requestedWorktree = resolvedDestination(options.worktree)
  if (overlaps(repository, requestedWorktree) || overlaps(requestedWorktree, repository)) throw new Error('repository and worktree destination must not overlap')
  assertCommit(repository, expectedTargetSha, 'expectedTargetSha')
  const destination = safeDestination(requestedWorktree)
  if (destination.removeEmpty) fs.rmdirSync(destination.resolved)
  try {
    git(repository, ['-c', 'core.hooksPath=/dev/null', 'worktree', 'add', '--detach', destination.resolved, expectedTargetSha])
    const worktree = validateWorktree(destination.resolved)
    assertSameRepository(repository, worktree)
    if (head(worktree) !== expectedTargetSha) throw new Error('staging worktree HEAD does not match expected target SHA')
    assertDetached(worktree)
    assertClean(worktree)
    return frozen({ worktree, headSha: expectedTargetSha, created: true, detached: true })
  } catch (error) {
    const cleanupErrors = []
    const removal = gitResult(repository, ['worktree', 'remove', '--force', destination.resolved])
    if (!removal.ok && fs.existsSync(destination.resolved)) {
      try { fs.rmSync(destination.resolved, { recursive: true, force: true }) } catch (cleanupError) { cleanupErrors.push(cleanupError) }
    }
    const prune = gitResult(repository, ['worktree', 'prune'])
    if (!prune.ok) cleanupErrors.push(prune.error)
    if (destination.removeEmpty) {
      try {
        if (fs.existsSync(destination.resolved)) fs.rmSync(destination.resolved, { recursive: true, force: true })
        fs.mkdirSync(destination.resolved, { mode: destination.mode })
        fs.chmodSync(destination.resolved, destination.mode)
      } catch (cleanupError) { cleanupErrors.push(cleanupError) }
    } else if (fs.existsSync(destination.resolved)) {
      try { fs.rmSync(destination.resolved, { recursive: true, force: true }) } catch (cleanupError) { cleanupErrors.push(cleanupError) }
    }
    const cleanup = cleanupErrors.length ? `; cleanup failed: ${boundedMessage(cleanupErrors[0], 'unknown cleanup failure')}` : ''
    throw new Error(`failed to prepare staging worktree: ${boundedMessage(error, 'git worktree preparation failed')}${cleanup}`)
  }
}

function batchNumber(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label} must be a positive safe integer`)
  return value
}

function nulPaths(bytes) { return bytes.toString('utf8').split('\0').filter(Boolean) }
function allowedMutation(relative) { return relative === CACHE_PATH || TRANSLATION_ROOTS.some(root => relative.startsWith(`${root}/`)) }

function commitAppliedBatch(options) {
  exactKeys(options, ['worktree', 'batchNumber', 'batchCount'], 'commit options')
  const worktree = validateWorktree(options.worktree)
  const number = batchNumber(options.batchNumber, 'batchNumber')
  const count = batchNumber(options.batchCount, 'batchCount')
  if (number > count) throw new Error('batchNumber cannot exceed batchCount')
  assertDetached(worktree)
  const originalHead = head(worktree)
  const stagedBefore = git(worktree, ['diff', '--cached', '--name-only', '-z'], { buffer: true })
  if (stagedBefore.length) throw new Error('staging worktree index must be clean before committing; pre-staged changes are forbidden')
  const changed = new Set([
    ...nulPaths(git(worktree, ['diff', '--name-only', '-z', 'HEAD', '--'], { buffer: true })),
    ...nulPaths(git(worktree, ['ls-files', '--others', '--exclude-standard', '-z'], { buffer: true })),
  ])
  const unrelated = [...changed].find(relative => !allowedMutation(relative))
  if (unrelated) throw new Error(`unrelated change outside fixed translation paths: ${unrelated}`)
  if (changed.size === 0) return frozen({ committed: false, stagedSha: originalHead, batchNumber: number, batchCount: count })
  try { git(worktree, ['add', '-A', '--', '.']) } catch (error) {
    git(worktree, ['reset', '--quiet'])
    throw new Error(`failed to stage applied batch: ${boundedMessage(error, 'git add failed')}`)
  }
  const staged = nulPaths(git(worktree, ['diff', '--cached', '--name-only', '-z'], { buffer: true }))
  if (staged.length !== changed.size || staged.some(relative => !changed.has(relative) || !allowedMutation(relative))) {
    git(worktree, ['reset', '--quiet'])
    throw new Error('staged batch paths do not match the validated translation changes')
  }
  const message = `docs(i18n): apply Guides translation batch ${number}/${count}`
  const env = {
    GIT_AUTHOR_NAME: BOT_NAME,
    GIT_AUTHOR_EMAIL: BOT_EMAIL,
    GIT_COMMITTER_NAME: BOT_NAME,
    GIT_COMMITTER_EMAIL: BOT_EMAIL,
    GIT_AUTHOR_DATE: BOT_DATE,
    GIT_COMMITTER_DATE: BOT_DATE,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
  }
  try {
    git(worktree, [
      '-c', `user.name=${BOT_NAME}`,
      '-c', `user.email=${BOT_EMAIL}`,
      '-c', 'commit.gpgSign=false',
      '-c', 'core.hooksPath=/dev/null',
      'commit', '--no-verify', '--no-gpg-sign', '-m', message,
    ], { env })
  } catch (error) {
    git(worktree, ['reset', '--quiet'])
    if (head(worktree) !== originalHead) throw new Error('batch commit failed after moving HEAD')
    throw new Error(`failed to commit applied batch: ${boundedMessage(error, 'git commit failed')}`)
  }
  const stagedSha = head(worktree)
  if (git(worktree, ['rev-parse', `${stagedSha}^`]).trim() !== originalHead) throw new Error('batch commit did not retain the exact prior staged history')
  assertClean(worktree)
  return frozen({ committed: true, stagedSha, batchNumber: number, batchCount: count })
}

function pushStagingRef(options) {
  exactKeys(options, ['repository', 'worktree', 'stagingRef', 'stagedSha'], 'push options')
  const repository = repositoryRoot(options.repository)
  const worktree = validateWorktree(options.worktree)
  assertSameRepository(repository, worktree)
  const stagingRef = validateStagingRef(options.stagingRef)
  const stagedSha = validateSha(options.stagedSha, 'stagedSha')
  assertCommit(worktree, stagedSha, 'stagedSha')
  assertDetached(worktree)
  if (head(worktree) !== stagedSha) throw new Error('staging worktree HEAD does not match stagedSha')
  assertClean(worktree)
  let existing
  try { existing = remoteRefSha(repository, stagingRef) } catch (error) { throw new Error(`remote staging ref lookup failed: ${boundedMessage(error, 'git ls-remote failed')}`) }
  if (existing && existing !== stagedSha) throw new Error('remote staging ref already exists at a different SHA')
  if (existing === stagedSha) return frozen({ stagingRef, stagedSha, remoteSha: stagedSha, pushed: false })
  try {
    git(repository, ['-c', 'push.default=nothing', '-c', 'core.hooksPath=/dev/null', 'push', '--no-verify', '--porcelain', 'origin', `${stagedSha}:${stagingRef}`])
  } catch (error) { throw new Error(`staging ref push failed: ${boundedMessage(error, 'git push failed')}`) }
  let remoteSha
  try { remoteSha = remoteRefSha(repository, stagingRef) } catch (error) { throw new Error(`remote staging verification failed: ${boundedMessage(error, 'git ls-remote failed')}`) }
  if (remoteSha !== stagedSha) throw new Error('remote staging ref moved unexpectedly during push')
  return frozen({ stagingRef, stagedSha, remoteSha, pushed: true })
}

function fetchTarget(repository, targetBranch) {
  try { git(repository, ['fetch', '--no-tags', 'origin', `refs/heads/${targetBranch}`]) } catch (error) { throw new Error(`target fetch failed: ${boundedMessage(error, 'git fetch failed')}`) }
  const fetched = git(repository, ['rev-parse', 'FETCH_HEAD']).trim()
  validateSha(fetched, 'fetched target SHA')
  return fetched
}

function promoteStaging(options) {
  exactKeys(options, ['repository', 'targetBranch', 'expectedTargetSha', 'stagedSha'], 'promotion options')
  const repository = repositoryRoot(options.repository)
  const targetBranch = validateTargetBranch(repository, options.targetBranch)
  const expectedTargetSha = validateSha(options.expectedTargetSha, 'expectedTargetSha')
  const stagedSha = validateSha(options.stagedSha, 'stagedSha')
  assertCommit(repository, stagedSha, 'stagedSha')
  const current = fetchTarget(repository, targetBranch)
  if (current !== expectedTargetSha) throw new Error(`remote target moved from expected target SHA for ${targetBranch}`)
  assertAncestor(repository, expectedTargetSha, stagedSha, 'staged SHA does not descend from expected target SHA')
  const beforePush = fetchTarget(repository, targetBranch)
  if (beforePush !== expectedTargetSha) throw new Error(`remote target moved before promotion for ${targetBranch}`)
  try {
    git(repository, ['-c', 'push.default=nothing', '-c', 'core.hooksPath=/dev/null', 'push', '--no-verify', '--porcelain', 'origin', `${stagedSha}:refs/heads/${targetBranch}`])
  } catch (error) { throw new Error(`normal target promotion push failed: ${boundedMessage(error, 'git push failed')}`) }
  const publishedSha = fetchTarget(repository, targetBranch)
  if (publishedSha !== stagedSha) throw new Error(`remote target moved during promotion for ${targetBranch}`)
  return frozen({ targetBranch, previousSha: expectedTargetSha, publishedSha, promoted: true })
}

function cleanupDebt(kind, fields) { return frozen({ kind, ...fields }) }

function deleteStagingWithLease(options) {
  exactKeys(options, ['repository', 'stagingRef', 'stagedSha'], 'cleanup options')
  const repository = repositoryRoot(options.repository)
  const stagingRef = validateStagingRef(options.stagingRef)
  const stagedSha = validateSha(options.stagedSha, 'stagedSha')
  let actualSha
  try { actualSha = remoteRefSha(repository, stagingRef) } catch (error) {
    return frozen({
      stagingRef,
      stagedSha,
      deleted: false,
      cleanupDebt: cleanupDebt('lookup_failed', { stagingRef, expectedSha: stagedSha, message: boundedMessage(error, 'staging ref lookup failed') }),
      reason: 'lookup_failed',
    })
  }
  if (!actualSha) return frozen({ stagingRef, stagedSha, deleted: false, cleanupDebt: null, reason: 'absent' })
  if (actualSha !== stagedSha) return frozen({ stagingRef, stagedSha, deleted: false, cleanupDebt: cleanupDebt('lease_mismatch', { stagingRef, expectedSha: stagedSha, actualSha }), reason: 'lease_mismatch' })
  try {
    git(repository, ['-c', 'push.default=nothing', '-c', 'core.hooksPath=/dev/null', 'push', '--no-verify', '--porcelain', `--force-with-lease=${stagingRef}:${stagedSha}`, 'origin', `:${stagingRef}`])
  } catch (error) {
    let after
    try { after = remoteRefSha(repository, stagingRef) } catch (lookupError) {
      return frozen({
        stagingRef,
        stagedSha,
        deleted: false,
        cleanupDebt: cleanupDebt('lookup_failed', { stagingRef, expectedSha: stagedSha, message: boundedMessage(lookupError, 'staging ref verification failed') }),
        reason: 'lookup_failed',
      })
    }
    if (!after) return frozen({ stagingRef, stagedSha, deleted: true, cleanupDebt: null, reason: 'deleted', commandWarning: boundedMessage(error, 'staging ref delete command failed after deletion') })
    const debt = after && after !== stagedSha
      ? cleanupDebt('lease_mismatch', { stagingRef, expectedSha: stagedSha, actualSha: after })
      : cleanupDebt('delete_failed', { stagingRef, expectedSha: stagedSha, message: boundedMessage(error, 'staging ref delete push failed') })
    return frozen({ stagingRef, stagedSha, deleted: false, cleanupDebt: debt, reason: debt.kind })
  }
  let after
  try { after = remoteRefSha(repository, stagingRef) } catch (error) {
    return frozen({
      stagingRef,
      stagedSha,
      deleted: false,
      cleanupDebt: cleanupDebt('lookup_failed', { stagingRef, expectedSha: stagedSha, message: boundedMessage(error, 'staging ref verification failed') }),
      reason: 'lookup_failed',
    })
  }
  if (after) {
    const debt = after !== stagedSha
      ? cleanupDebt('lease_mismatch', { stagingRef, expectedSha: stagedSha, actualSha: after })
      : cleanupDebt('delete_failed', { stagingRef, expectedSha: stagedSha, message: 'staging ref still exists after leased deletion' })
    return frozen({ stagingRef, stagedSha, deleted: false, cleanupDebt: debt, reason: debt.kind })
  }
  return frozen({ stagingRef, stagedSha, deleted: true, cleanupDebt: null, reason: 'deleted' })
}

module.exports = {
  deterministicStagingRef,
  prepareStagingWorktree,
  commitAppliedBatch,
  pushStagingRef,
  promoteStaging,
  deleteStagingWithLease,
}
