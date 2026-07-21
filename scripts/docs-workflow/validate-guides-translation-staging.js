#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
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
  'plugins/lark-docs/meta/reports',
])
const VALIDATION_COMMANDS = Object.freeze(VALIDATION_SPECS.map(spec => Object.freeze({ id: spec.id, command: spec.executable, args: spec.args, rendered: spec.command })))

function isolatedEnvironment() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-validation-env-'))); fs.chmodSync(root, 0o700)
  const xdg = path.join(root, 'xdg'), corepack = path.join(root, 'corepack'), cache = path.join(root, 'npm-cache'); fs.mkdirSync(xdg); fs.mkdirSync(corepack); fs.mkdirSync(cache)
  const userNpmrc = path.join(root, 'user-npmrc'), globalNpmrc = path.join(root, 'global-npmrc'); fs.writeFileSync(userNpmrc, ''); fs.writeFileSync(globalNpmrc, '')
  const environment = {}
  for (const key of ['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'TZ', 'TERM', 'SSL_CERT_FILE', 'SSL_CERT_DIR']) if (process.env[key] !== undefined) environment[key] = process.env[key]
  Object.assign(environment, { HOME: root, XDG_CONFIG_HOME: xdg, CI: 'true', NO_UPDATE_NOTIFIER: '1', GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', NPM_CONFIG_USERCONFIG: userNpmrc, NPM_CONFIG_GLOBALCONFIG: globalNpmrc, NPM_CONFIG_CACHE: cache, COREPACK_HOME: corepack, YARN_RC_FILENAME: path.join(root, 'yarnrc.yml') })
  return { root, environment }
}
function git(repository, args, environment, buffer = false) {
  return execFileSync('git', ['-C', repository, ...args], { encoding: buffer ? null : 'utf8', env: environment, maxBuffer: 16 * 1024 * 1024 })
}
function sha(value, label) { if (typeof value !== 'string' || !/^[0-9a-f]{40}$/.test(value)) throw new Error(`${label} must be a lowercase Git SHA`) }
function nul(bytes) { return bytes.toString('utf8').split('\0').filter(Boolean) }
function allowed(relative) { return RESTORE_PATHS.some(root => relative === root || relative.startsWith(`${root}/`)) }
function bounded(value) { return String(value || 'unknown failure').replace(/[\0-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) }
function deepFreeze(value) { for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child); return Object.freeze(value) }

function repositoryRoot(repository, environment) {
  if (typeof repository !== 'string' || !path.isAbsolute(repository) || /[\0\r\n]/.test(repository)) throw new Error('repository must be an absolute path')
  const resolved = path.resolve(repository), stat = fs.lstatSync(resolved)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) throw new Error('repository must be a real directory without symlink ancestors')
  const root = fs.realpathSync(git(resolved, ['rev-parse', '--show-toplevel'], environment).trim())
  if (root !== resolved) throw new Error('repository must be the exact worktree root')
  return resolved
}

function stagedStateProof(repository, masterSha, stagedSha, environment) {
  sha(masterSha, 'masterSha'); sha(stagedSha, 'stagedSha')
  if (git(repository, ['rev-parse', 'HEAD'], environment).trim() !== masterSha) throw new Error('repository HEAD does not match masterSha')
  if (git(repository, ['rev-parse', '--verify', `${stagedSha}^{commit}`], environment).trim() !== stagedSha) throw new Error('stagedSha is not an exact commit')
  for (const root of RESTORE_PATHS) if (!git(repository, ['ls-tree', '-d', '--name-only', stagedSha, '--', root], environment).trim()) throw new Error(`required staged generated root is missing: ${root}`)
  const generatedUntracked = nul(git(repository, ['ls-files', '--others', '-z', '--', ...RESTORE_PATHS], environment, true))
  if (generatedUntracked.length) throw new Error(`untracked generated file is not allowed in restored state: ${generatedUntracked[0]}`)
  const untracked = nul(git(repository, ['ls-files', '--others', '--exclude-standard', '-z'], environment, true))
  if (untracked.length) throw new Error(`untracked file is not allowed in restored state: ${untracked[0]}`)
  const changed = nul(git(repository, ['diff', '--name-only', '-z', 'HEAD', '--'], environment, true))
  const outside = changed.find(relative => !allowed(relative))
  if (outside) throw new Error(`restored state changes a path outside the allowed generated roots: ${outside}`)
  const inventory = git(repository, ['ls-tree', '-r', '-z', stagedSha, '--', ...RESTORE_PATHS], environment, true)
  const entries = nul(inventory), expectedIndex = entries.map(entry => { const match = /^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/.exec(entry); if (!match) throw new Error('staged generated state contains a symlink or special file'); return { mode: match[1], oid: match[2], path: match[3] } })
  const actualIndex = nul(git(repository, ['ls-files', '-s', '-z', '--', ...RESTORE_PATHS], environment, true)).map(entry => entry.replace(/ 0\t/, '\t'))
  if (JSON.stringify(actualIndex) !== JSON.stringify(expectedIndex.map(entry => `${entry.mode} ${entry.oid}\t${entry.path}`))) throw new Error('restored generated index does not exactly match stagedSha')
  const blobOutput = execFileSync('git', ['-C', repository, 'cat-file', '--batch'], { input: expectedIndex.map(entry => entry.oid).join('\n') + '\n', env: environment, maxBuffer: 256 * 1024 * 1024 })
  let offset = 0
  for (const expected of expectedIndex) {
    const newline = blobOutput.indexOf(10, offset), header = blobOutput.subarray(offset, newline).toString('utf8'), size = Number(header.split(' ')[2]); offset = newline + 1
    const blob = blobOutput.subarray(offset, offset + size); offset += size + 1
    if (!Number.isSafeInteger(size)) throw new Error('invalid staged blob batch response')
    const target = path.join(repository, ...expected.path.split('/')), stat = fs.lstatSync(target)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`restored generated path is not a regular file: ${expected.path}`)
    const descriptor = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0)); let bytes
    try { const pinned = fs.fstatSync(descriptor); if (pinned.dev !== stat.dev || pinned.ino !== stat.ino) throw new Error('restored file identity changed'); bytes = fs.readFileSync(descriptor) } finally { fs.closeSync(descriptor) }
    if (!bytes.equals(blob)) throw new Error(`restored raw bytes differ from stagedSha: ${expected.path}`)
    const executable = Boolean(stat.mode & 0o111)
    if (executable !== (expected.mode === '100755')) throw new Error(`restored generated executable mode differs from stagedSha: ${expected.path}`)
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
  const isolation = isolatedEnvironment(), environment = isolation.environment
  let repository, proof
  try { repository = repositoryRoot(options.repository, environment); proof = stagedStateProof(repository, options.masterSha, options.stagedSha, environment) } catch (error) { fs.rmSync(isolation.root, { recursive: true, force: true }); throw error }
  const executor = options.executor || defaultExecutor, receipts = []
  let failureDetail = null
  try {
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
  } finally { fs.rmSync(isolation.root, { recursive: true, force: true }) }
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!['--repository', '--master-sha', '--staged-sha', '--output', '--trusted-root'].includes(flag) || !value || Object.hasOwn(values, flag)) throw new Error('CLI requires each strict flag exactly once')
    values[flag] = value
  }
  if (Object.keys(values).length !== 5) throw new Error('CLI requires repository, master SHA, staged SHA, output, and trusted root')
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
function validateTrustedOutputRoot(value, target) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error('trustedRoot is required and must be absolute')
  const root = path.resolve(value), stat = fs.lstatSync(root)
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(root) !== root || (stat.mode & 0o777) !== 0o700 || (process.getuid && stat.uid !== process.getuid())) throw new Error('trustedRoot must be a real private owned 0700 directory')
  if (path.dirname(target) !== root) throw new Error('output must be directly inside trustedRoot')
}
function writeValidationResult(file, result, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || !Object.hasOwn(options, 'trustedRoot') || Object.keys(options).some(key => !['trustedRoot', 'beforeTempCreate', 'beforeRename'].includes(key)) || ['beforeTempCreate', 'beforeRename'].some(key => options[key] !== undefined && typeof options[key] !== 'function')) throw new Error('output write options require trustedRoot')
  const target = path.resolve(file), parent = path.dirname(target)
  if (!path.isAbsolute(file) || fs.realpathSync(parent) !== parent) throw new Error('output path must be absolute without symlink ancestors')
  validateTrustedOutputRoot(options.trustedRoot, target)
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
    try { verifyOutputParent(pin); fs.rmSync(temporary, { force: true }) } catch {}
    fs.closeSync(pin.descriptor)
  }
}
function main() {
  const args = parseArgs(process.argv.slice(2))
  const result = runGuidesTranslationValidation({ repository: args['--repository'], masterSha: args['--master-sha'], stagedSha: args['--staged-sha'] })
  writeValidationResult(args['--output'], result, { trustedRoot: args['--trusted-root'] })
  if (result.result !== 'success') process.exitCode = 1
}
if (require.main === module) { try { main() } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1 } }

module.exports = { runGuidesTranslationValidation, writeValidationResult, VALIDATION_COMMANDS, RESTORE_PATHS }
