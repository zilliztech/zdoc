#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')
const { VALIDATION_SPECS } = require('./translation-publication-report')

const RESTORE_PATHS = Object.freeze([
  'docs',
  'docs-byoc',
  'reference',
  'i18n',
  '.translation-cache',
  'config/generated',
  'plugins/lark-docs/meta/snapshots',
  'plugins/lark-docs/meta/assembly',
])
const VALIDATION_COMMANDS = Object.freeze(VALIDATION_SPECS.map(spec => Object.freeze({ id: spec.id, command: spec.executable, args: spec.args, rendered: spec.command })))

function sanitizedEnvironment() {
  const environment = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('GIT_') || ['NODE_OPTIONS', 'NODE_PATH', 'BASH_ENV', 'ENV', 'SHELLOPTS', 'CDPATH'].includes(key) || /^(npm_config_|npm_|pnpm_|corepack_|yarn_|bun_)/i.test(key)) continue
    environment[key] = value
  }
  return { ...environment, CI: 'true', NO_UPDATE_NOTIFIER: '1', GIT_TERMINAL_PROMPT: '0' }
}
function git(repository, args, buffer = false) {
  return execFileSync('git', ['-C', repository, ...args], { encoding: buffer ? null : 'utf8', env: sanitizedEnvironment(), maxBuffer: 16 * 1024 * 1024 })
}
function gitOk(repository, args) { try { git(repository, args); return true } catch { return false } }
function sha(value, label) { if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} must be a lowercase Git SHA`) }
function nul(bytes) { return bytes.toString('utf8').split('\0').filter(Boolean) }
function allowed(relative) { return RESTORE_PATHS.some(root => relative === root || relative.startsWith(`${root}/`)) }
function bounded(value) { return String(value || 'unknown failure').replace(/[\0-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) }
function deepFreeze(value) { for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child); return Object.freeze(value) }

function repositoryRoot(repository) {
  if (typeof repository !== 'string' || !path.isAbsolute(repository) || /[\0\r\n]/.test(repository)) throw new Error('repository must be an absolute path')
  const resolved = path.resolve(repository), stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) throw new Error('repository must be a real directory without symlink ancestors')
  const root = fs.realpathSync(git(resolved, ['rev-parse', '--show-toplevel']).trim())
  if (root !== resolved) throw new Error('repository must be the exact worktree root')
  return resolved
}

function stagedStateProof(repository, masterSha, stagedSha) {
  sha(masterSha, 'masterSha'); sha(stagedSha, 'stagedSha')
  if (git(repository, ['rev-parse', 'HEAD']).trim() !== masterSha) throw new Error('repository HEAD does not match masterSha')
  if (git(repository, ['rev-parse', '--verify', `${stagedSha}^{commit}`]).trim() !== stagedSha) throw new Error('stagedSha is not an exact commit')
  for (const root of RESTORE_PATHS) if (!git(repository, ['ls-tree', '-d', '--name-only', stagedSha, '--', root]).trim()) throw new Error(`required staged generated root is missing: ${root}`)
  const generatedUntracked = nul(git(repository, ['ls-files', '--others', '-z', '--', ...RESTORE_PATHS], true))
  if (generatedUntracked.length) throw new Error(`untracked generated file is not allowed in restored state: ${generatedUntracked[0]}`)
  const untracked = nul(git(repository, ['ls-files', '--others', '--exclude-standard', '-z'], true))
  if (untracked.length) throw new Error(`untracked file is not allowed in restored state: ${untracked[0]}`)
  const changed = nul(git(repository, ['diff', '--name-only', '-z', 'HEAD', '--'], true))
  const outside = changed.find(relative => !allowed(relative))
  if (outside) throw new Error(`restored state changes a path outside the allowed generated roots: ${outside}`)
  if (!gitOk(repository, ['diff', '--cached', '--quiet', stagedSha, '--', ...RESTORE_PATHS])) throw new Error('restored generated index does not exactly match stagedSha')
  if (!gitOk(repository, ['diff', '--quiet', '--', ...RESTORE_PATHS])) throw new Error('restored generated working tree differs from its staged index')
  const inventory = git(repository, ['ls-tree', '-r', '-z', stagedSha, '--', ...RESTORE_PATHS], true)
  for (const entry of nul(inventory)) {
    const match = /^(100644|100755) blob [0-9a-f]{40}\t(.+)$/.exec(entry)
    if (!match) throw new Error('staged generated state contains a symlink or special file')
    const target = path.join(repository, ...match[2].split('/'))
    const stat = fs.lstatSync(target)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`restored generated path is not a regular file: ${match[2]}`)
    const executable = Boolean(stat.mode & 0o111)
    if (executable !== (match[1] === '100755')) throw new Error(`restored generated executable mode differs from stagedSha: ${match[2]}`)
  }
  return deepFreeze({ repositoryHeadSha: masterSha, stagedSha, generatedStateSha256: crypto.createHash('sha256').update(inventory).digest('hex') })
}

function defaultExecutor(command, args, options) {
  const result = spawnSync(command, args, { cwd: options.cwd, env: options.env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (result.error) throw result.error
  return { status: result.status, signal: result.signal, stderr: result.stderr || '' }
}

function runGuidesTranslationValidation(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('validation options must be an object')
  const keys = Object.keys(options), allowedKeys = ['repository', 'masterSha', 'stagedSha', 'executor']
  if (keys.some(key => !allowedKeys.includes(key)) || !['repository', 'masterSha', 'stagedSha'].every(key => Object.hasOwn(options, key))) throw new Error('validation options have invalid keys')
  if (options.executor !== undefined && typeof options.executor !== 'function') throw new Error('executor must be a function')
  const repository = repositoryRoot(options.repository)
  const proof = stagedStateProof(repository, options.masterSha, options.stagedSha)
  const executor = options.executor || defaultExecutor, environment = sanitizedEnvironment(), receipts = []
  let failureDetail = null
  for (const spec of VALIDATION_COMMANDS) {
    let result
    try { result = executor(spec.command, [...spec.args], { cwd: repository, env: { ...environment } }) } catch (error) {
      receipts.push({ id: spec.id, command: spec.rendered, result: 'failure' })
      failureDetail = bounded(`spawn error: ${error.message}`)
      break
    }
    if (!result || typeof result !== 'object' || Array.isArray(result) || Object.keys(result).length !== 3 || !['status', 'signal', 'stderr'].every(key => Object.hasOwn(result, key)) || (result.status !== null && !Number.isInteger(result.status)) || (result.signal !== null && typeof result.signal !== 'string') || typeof result.stderr !== 'string') throw new Error('executor returned an invalid result keys or values')
    const success = result.status === 0 && result.signal === null
    receipts.push({ id: spec.id, command: spec.rendered, result: success ? 'success' : 'failure' })
    if (!success) {
      failureDetail = bounded(result.signal ? `command terminated by ${result.signal}: ${result.stderr}` : `command exited with exit ${result.status}: ${result.stderr}`)
      break
    }
  }
  return deepFreeze({ schemaVersion: 1, masterSha: options.masterSha, stagedSha: options.stagedSha, proof, receipts, result: failureDetail === null ? 'success' : 'failure', failureDetail })
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!['--repository', '--master-sha', '--staged-sha', '--output'].includes(flag) || !value || Object.hasOwn(values, flag)) throw new Error('CLI requires each strict flag exactly once')
    values[flag] = value
  }
  if (Object.keys(values).length !== 4) throw new Error('CLI requires repository, master SHA, staged SHA, and output')
  return values
}
function pinOutputParent(target) {
  const parent = path.dirname(target), stat = fs.lstatSync(parent)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(parent) !== parent) throw new Error('output parent must be a real directory')
  const descriptor = fs.openSync(parent, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0)), pinned = fs.fstatSync(descriptor)
  if (pinned.dev !== stat.dev || pinned.ino !== stat.ino) { fs.closeSync(descriptor); throw new Error('output parent identity changed') }
  return { parent, descriptor, dev: pinned.dev, ino: pinned.ino }
}
function verifyOutputParent(pin) {
  const stat = fs.lstatSync(pin.parent), descriptor = fs.fstatSync(pin.descriptor)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(pin.parent) !== pin.parent || stat.dev !== pin.dev || stat.ino !== pin.ino || descriptor.dev !== pin.dev || descriptor.ino !== pin.ino) throw new Error('output parent identity changed')
}
function pinnedOutputTemporary(pin, basename) {
  const candidates = [pin.parent, ...fs.readdirSync(path.dirname(pin.parent)).map(name => path.join(path.dirname(pin.parent), name))]
  for (const candidate of candidates) {
    try { const stat = fs.lstatSync(candidate); if (!stat.isSymbolicLink() && stat.isDirectory() && stat.dev === pin.dev && stat.ino === pin.ino) return path.join(candidate, basename) } catch {}
  }
  return null
}
function writeValidationResult(file, result, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).some(key => !['beforeTempCreate', 'beforeRename'].includes(key)) || Object.values(options).some(hook => typeof hook !== 'function')) throw new Error('output write options are invalid')
  const target = path.resolve(file), parent = path.dirname(target)
  if (!path.isAbsolute(file) || fs.realpathSync(parent) !== parent) throw new Error('output path must be absolute without symlink ancestors')
  if (fs.existsSync(target) && (fs.lstatSync(target).isSymbolicLink() || !fs.lstatSync(target).isFile())) throw new Error('output must be a regular file')
  const pin = pinOutputParent(target)
  const temporaryName = `.${path.basename(target)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`, temporary = path.join(parent, temporaryName)
  let descriptor
  try {
    options.beforeTempCreate?.(); verifyOutputParent(pin)
    descriptor = fs.openSync(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o600)
    fs.writeFileSync(descriptor, `${JSON.stringify(result, null, 2)}\n`)
    fs.fsyncSync(descriptor); fs.closeSync(descriptor); descriptor = undefined
    options.beforeRename?.(); verifyOutputParent(pin)
    fs.renameSync(temporary, target)
    verifyOutputParent(pin); fs.fsyncSync(pin.descriptor)
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
    try { const pinned = pinnedOutputTemporary(pin, temporaryName); if (pinned) fs.rmSync(pinned, { force: true }) } catch {}
    fs.closeSync(pin.descriptor)
  }
}
function main() {
  const args = parseArgs(process.argv.slice(2))
  const result = runGuidesTranslationValidation({ repository: args['--repository'], masterSha: args['--master-sha'], stagedSha: args['--staged-sha'] })
  writeValidationResult(args['--output'], result)
  if (result.result !== 'success') process.exitCode = 1
}
if (require.main === module) { try { main() } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1 } }

module.exports = { runGuidesTranslationValidation, writeValidationResult, VALIDATION_COMMANDS, RESTORE_PATHS }
