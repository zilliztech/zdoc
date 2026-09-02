#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const UNIT_KEY = 'translation/zh-CN-reference/python'
const SOURCE_ROOT = 'content/en/reference/api/python'
const TARGET_ROOT = 'content/zh-CN/reference/api/python'
const STATE_PATH = 'generated/zh-CN/manifests/reference-translations.json'
const SOURCE_STATE_PATH = 'generated/en/manifests/reference.json'
const TRUSTED_DERIVED_PATH = /^generated\/(?:en|zh-CN)\/(?:manifests\/reference(?:-translations)?\.json|sidebars\/[A-Za-z0-9_-]+\.sidebar\.js)$/u
const CANDIDATE_REF_PREFIX = 'refs/heads/offline-reference-candidates/python/'
const SHA = /^[0-9a-f]{40}$/u
const SHA256 = /^[0-9a-f]{64}$/u
const RECEIPT_KEYS = Object.freeze([
  'schemaVersion', 'document', 'unitKey', 'toolingSha', 'sourceCheckpointSha', 'targetBaselineSha',
  'files', 'receiptSha256',
])
const FILE_KEYS = Object.freeze(['sourcePath', 'sourceSha256', 'targetPath', 'baseTargetSha256', 'targetSha256'])

function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  throw new Error('offline Reference receipt contains an unsupported JSON value')
}

function checksum(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) {
    throw new Error(`${label} keys must be exactly: ${expected.join(', ')}`)
  }
}

function safePath(value, label) {
  if (typeof value !== 'string' || !value || path.posix.isAbsolute(value) || value.includes('\\') ||
      value.normalize('NFC') !== value || value.split('/').some(part => !part || part === '.' || part === '..') ||
      /[\u0000-\u001f\u007f]/u.test(value)) throw new Error(`${label} is not a safe repository-relative path`)
  return value
}

function expectedTargetPath(sourcePath) {
  safePath(sourcePath, 'sourcePath')
  if (!sourcePath.startsWith(`${SOURCE_ROOT}/`) || !/\.mdx?$/u.test(sourcePath)) {
    throw new Error(`offline Reference source is outside the fixed Python root: ${sourcePath}`)
  }
  return `${TARGET_ROOT}/${sourcePath.slice(SOURCE_ROOT.length + 1)}`
}

function validateReceipt(input) {
  exactKeys(input, RECEIPT_KEYS, 'offline Reference receipt')
  if (input.schemaVersion !== 1 || input.document !== 'offline-reference-translation-receipt' || input.unitKey !== UNIT_KEY) {
    throw new Error('offline Reference receipt header is invalid')
  }
  for (const key of ['toolingSha', 'sourceCheckpointSha', 'targetBaselineSha']) {
    if (!SHA.test(input[key] || '')) throw new Error(`offline Reference receipt ${key} is invalid`)
  }
  if (!Array.isArray(input.files) || input.files.length === 0) throw new Error('offline Reference receipt files must be non-empty')
  let previous = ''
  for (const [index, file] of input.files.entries()) {
    exactKeys(file, FILE_KEYS, `offline Reference receipt file[${index}]`)
    const targetPath = expectedTargetPath(file.sourcePath)
    if (file.targetPath !== targetPath) throw new Error(`offline Reference canonical target mismatch: ${file.sourcePath}`)
    for (const key of ['sourceSha256', 'targetSha256']) if (!SHA256.test(file[key] || '')) throw new Error(`offline Reference receipt ${key} is invalid`)
    if (file.baseTargetSha256 !== null && !SHA256.test(file.baseTargetSha256 || '')) throw new Error('offline Reference receipt baseTargetSha256 is invalid')
    if (previous && previous >= file.sourcePath) throw new Error('offline Reference receipt files must be unique and sorted')
    previous = file.sourcePath
  }
  if (!SHA256.test(input.receiptSha256 || '')) throw new Error('offline Reference receipt checksum is invalid')
  const {receiptSha256, ...body} = input
  if (checksum(canonicalJson(body)) !== receiptSha256) throw new Error('offline Reference receipt checksum mismatch')
  return Object.freeze(JSON.parse(JSON.stringify(input)))
}

function git(repository, args, options = {}) {
  const environment = {}
  for (const [key, value] of Object.entries(process.env)) if (!key.startsWith('GIT_')) environment[key] = value
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: options.buffer ? null : 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: {...environment, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null'},
  })
}

function blob(repository, commit, relative, nullable = false) {
  let entry
  try { entry = git(repository, ['ls-tree', '-z', commit, '--', relative], {buffer: true}).toString('utf8').replace(/\0$/u, '') } catch (error) {
    if (nullable) return null
    throw error
  }
  if (!entry) {
    if (nullable) return null
    throw new Error(`required path is missing at ${commit}: ${relative}`)
  }
  const match = /^(100644) blob ([0-9a-f]{40})\t(.+)$/u.exec(entry)
  if (!match || match[3] !== relative) throw new Error(`offline Reference path must be one regular non-executable file: ${relative}`)
  const bytes = git(repository, ['show', `${commit}:${relative}`], {buffer: true})
  return Object.freeze({path: relative, blobSha: match[2], sha256: checksum(bytes), bytes})
}

function changedPaths(repository, baselineSha, candidateSha) {
  const fields = git(repository, ['diff-tree', '-r', '--no-commit-id', '--no-renames', '--name-status', '-z', baselineSha, candidateSha], {buffer: true})
    .toString('utf8').split('\0').filter(Boolean)
  if (fields.length % 2 !== 0) throw new Error('offline Reference candidate diff is malformed')
  const paths = []
  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index]
    const relative = fields[index + 1]
    if (!['A', 'M'].includes(status) || !relative.startsWith(`${TARGET_ROOT}/`) || !/\.mdx?$/u.test(relative)) {
      throw new Error(`offline Reference candidate contains a forbidden ${status} change: ${relative}`)
    }
    paths.push(relative)
  }
  if (paths.length === 0 || new Set(paths).size !== paths.length) throw new Error('offline Reference candidate path inventory is empty or duplicated')
  return paths.sort()
}

function exactCommit(repository, value, label) {
  if (!SHA.test(value || '')) throw new Error(`${label} must be a lowercase Git SHA`)
  let resolved
  try { resolved = git(repository, ['rev-parse', '--verify', `${value}^{commit}`]).trim() } catch { throw new Error(`${label} is not an exact commit`) }
  if (resolved !== value) throw new Error(`${label} is not an exact commit`)
}

function inspectOfflineReferenceCandidate(options) {
  exactKeys(options, ['repositoryRoot', 'candidateSha', 'targetBaselineSha', 'sourceCheckpointSha', 'toolingSha', 'receipt'], 'offline Reference candidate options')
  const repository = fs.realpathSync(options.repositoryRoot)
  if (git(repository, ['rev-parse', '--show-toplevel']).trim() !== repository) throw new Error('repositoryRoot must be the exact Git worktree root')
  for (const key of ['candidateSha', 'targetBaselineSha', 'sourceCheckpointSha', 'toolingSha']) exactCommit(repository, options[key], key)
  const receipt = validateReceipt(options.receipt)
  for (const key of ['targetBaselineSha', 'sourceCheckpointSha', 'toolingSha']) if (receipt[key] !== options[key]) {
    throw new Error(`offline Reference receipt ${key} mismatch`)
  }
  const parents = git(repository, ['rev-list', '--parents', '-n', '1', options.candidateSha]).trim().split(/\s+/u)
  if (parents.length !== 2 || parents[1] !== options.targetBaselineSha) throw new Error('offline Reference candidate must be one commit on the exact target baseline')
  const paths = changedPaths(repository, options.targetBaselineSha, options.candidateSha)
  const receiptPaths = receipt.files.map(file => file.targetPath).sort()
  if (paths.join('\0') !== receiptPaths.join('\0')) throw new Error('offline Reference candidate paths do not exactly match the receipt')
  for (const file of receipt.files) {
    const source = blob(repository, options.sourceCheckpointSha, file.sourcePath)
    const target = blob(repository, options.candidateSha, file.targetPath)
    const baseline = blob(repository, options.targetBaselineSha, file.targetPath, true)
    if (source.sha256 !== file.sourceSha256) throw new Error(`offline Reference source checksum mismatch: ${file.sourcePath}`)
    if (target.sha256 !== file.targetSha256 || target.bytes.length === 0) throw new Error(`offline Reference target checksum mismatch: ${file.targetPath}`)
    if ((baseline?.sha256 || null) !== file.baseTargetSha256) throw new Error(`offline Reference target baseline diverged: ${file.targetPath}`)
  }
  return Object.freeze({repositoryRoot: repository, ...options, receipt, paths})
}

function copyAuthenticatedTargets(candidate, workspace) {
  for (const relative of candidate.paths) {
    const source = blob(candidate.repositoryRoot, candidate.candidateSha, relative)
    const target = path.join(workspace, ...relative.split('/'))
    fs.mkdirSync(path.dirname(target), {recursive: true})
    fs.writeFileSync(target, source.bytes, {flag: fs.existsSync(target) ? 'w' : 'wx', mode: 0o644})
  }
}

function stageAuthenticatedManifestRecords(candidate, workspace, sourceManifestCommit) {
  const manifestPath = path.join(workspace, STATE_PATH)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const updates = new Map(candidate.receipt.files.map(file => [file.sourcePath, file]))
  let updated = 0
  manifest.records = (manifest.records || []).map(record => {
    const file = updates.get(record.sourcePath)
    if (!file) return record
    if (record.manual !== 'python' || record.targetPath !== file.targetPath) throw new Error(`trusted Reference manifest staging mapping mismatch: ${file.sourcePath}`)
    updated += 1
    return {...record, sourceCommit: sourceManifestCommit, sourceHash: file.sourceSha256, targetHash: file.targetSha256, status: file.sourceSha256 === file.targetSha256 ? 'unchanged' : 'translated'}
  })
  manifest.pendingRecords = (manifest.pendingRecords || []).filter(record => {
    const file = updates.get(record.sourcePath)
    if (!file) return true
    if (record.manual !== 'python' || record.targetPath !== file.targetPath) throw new Error(`trusted Reference pending manifest staging mapping mismatch: ${file.sourcePath}`)
    manifest.records.push({manual: 'python', sourcePath: file.sourcePath, targetPath: file.targetPath, sourceCommit: sourceManifestCommit, sourceHash: file.sourceSha256, targetHash: file.targetSha256, status: file.sourceSha256 === file.targetSha256 ? 'unchanged' : 'translated'})
    updated += 1
    return false
  })
  const compare = (left, right) => Buffer.from(left).compare(Buffer.from(right))
  manifest.records.sort((left, right) => compare(left.manual, right.manual) || compare(left.sourcePath, right.sourcePath) || compare(left.targetPath, right.targetPath))
  if (updated !== updates.size) throw new Error('trusted Reference manifest staging could not find every selected Python record')
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

function assembleTrustedCandidate(options) {
  exactKeys(options, [
    'repositoryRoot', 'candidateSha', 'targetBaselineSha', 'sourceCheckpointSha', 'toolingSha', 'receipt',
    'workspace', 'commandEnvironment',
  ], 'offline Reference assembly options')
  const candidate = inspectOfflineReferenceCandidate({
    repositoryRoot: options.repositoryRoot, candidateSha: options.candidateSha, targetBaselineSha: options.targetBaselineSha,
    sourceCheckpointSha: options.sourceCheckpointSha, toolingSha: options.toolingSha, receipt: options.receipt,
  })
  const workspace = fs.realpathSync(options.workspace)
  if (git(workspace, ['rev-parse', '--show-toplevel']).trim() !== workspace) throw new Error('workspace must be an exact Git worktree root')
  if (git(workspace, ['rev-parse', 'HEAD']).trim() !== candidate.targetBaselineSha || git(workspace, ['status', '--porcelain', '--untracked-files=no']).trim()) {
    throw new Error('trusted assembly workspace must be clean at the exact target baseline')
  }
  copyAuthenticatedTargets(candidate, workspace)
  const sourceManifestCommit = JSON.parse(fs.readFileSync(path.join(workspace, SOURCE_STATE_PATH), 'utf8')).sourceCommit || candidate.sourceCheckpointSha
  if (!SHA.test(sourceManifestCommit)) throw new Error('trusted Reference source manifest commit is invalid')
  stageAuthenticatedManifestRecords(candidate, workspace, sourceManifestCommit)
  const command = [
    'docs-tooling', 'reference-manifest', '--source', 'content/en/reference', '--target',
    'content/zh-CN/reference', '--source-commit', candidate.sourceCheckpointSha, '--write',
  ]
  try {
    execFileSync('pnpm', command, {cwd: workspace, stdio: 'pipe', encoding: 'utf8', env: {...process.env, ...(options.commandEnvironment || {})}})
  } catch (error) {
    throw new Error(`trusted Reference manifest assembly failed: ${String(error.stderr || error.stdout || error.message).trim()}`)
  }
  const fields = git(workspace, ['diff', '--name-status', '-z', candidate.targetBaselineSha, '--']).split('\0').filter(Boolean)
  if (fields.length % 2 !== 0) throw new Error('trusted Reference assembly diff is malformed')
  const changes = []
  for (let index = 0; index < fields.length; index += 2) {
    const status = fields[index]
    const relative = fields[index + 1]
    if (!['A', 'M'].includes(status) || (!candidate.paths.includes(relative) && !TRUSTED_DERIVED_PATH.test(relative))) {
      throw new Error(`trusted Reference assembly changed a forbidden ${status} path: ${relative}`)
    }
    changes.push(relative)
  }
  if (!changes.includes(STATE_PATH) || !changes.includes(SOURCE_STATE_PATH)) throw new Error('trusted Reference assembly must rebuild both Reference manifests')
  const state = JSON.parse(fs.readFileSync(path.join(workspace, STATE_PATH), 'utf8'))
  const records = new Map((state.records || []).map(record => [record.sourcePath, record]))
  for (const file of candidate.receipt.files) {
    const record = records.get(file.sourcePath)
    if (!record || record.manual !== 'python' || record.targetPath !== file.targetPath ||
        record.sourceCommit !== sourceManifestCommit || record.sourceHash !== file.sourceSha256 ||
        record.targetHash !== file.targetSha256 || !['translated', 'unchanged'].includes(record.status)) {
      throw new Error(`trusted Reference manifest record mismatch: ${file.sourcePath}`)
    }
  }
  const selectedSources = new Set(candidate.receipt.files.map(file => file.sourcePath))
  const pending = (state.pendingRecords || []).filter(record => record.manual === 'python' && selectedSources.has(record.sourcePath))
  if (pending.length) throw new Error('trusted Reference assembly left selected Python sources pending')
  return Object.freeze({candidate, workspace, changes: changes.sort(), statePath: STATE_PATH, validationCommands: Object.freeze([
    `pnpm docs-tooling reference-manifest --source content/en/reference --target content/zh-CN/reference --source-commit ${candidate.sourceCheckpointSha}`,
    'pnpm docs-tooling validate-reference --site zh-CN',
    'pnpm build:zh-CN',
  ])})
}

module.exports = {
  CANDIDATE_REF_PREFIX, SOURCE_ROOT, SOURCE_STATE_PATH, STATE_PATH, TARGET_ROOT, UNIT_KEY,
  assembleTrustedCandidate, canonicalJson, checksum, expectedTargetPath, inspectOfflineReferenceCandidate, validateReceipt,
}
