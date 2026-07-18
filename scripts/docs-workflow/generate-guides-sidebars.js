#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const crypto = require('node:crypto')
const path = require('node:path')
const { spawnSync: defaultSpawnSync } = require('node:child_process')

const SIDEBAR_OUTPUTS = Object.freeze([
  'config/generated/guides.sidebar.js',
  'config/generated/guides-byoc.sidebar.js',
])

function parseArgs(argv) {
  if (argv.length !== 2) throw new Error('Exactly one --media-manifest argument is required')
  if (argv[0] !== '--media-manifest') throw new Error(`Unknown argument: ${argv[0]}`)
  if (!argv[1]) throw new Error('--media-manifest requires a path')
  return { mediaManifest: argv[1] }
}

function requireRepoRelativeRegularFile(workspace, relativePath, label, fsImpl = fs) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  const normalized = path.normalize(relativePath)
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  let root
  try {
    root = fsImpl.realpathSync(workspace)
  } catch (_) {
    throw new Error('workspace must exist')
  }
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository workspace`)

  let stat
  try {
    stat = fsImpl.lstatSync(target)
  } catch (error) {
    throw new Error(`${label} does not exist: ${relativePath}`)
  }
  if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symlink: ${relativePath}`)
  if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`)
  const realTarget = fsImpl.realpathSync(target)
  if (realTarget !== target || !realTarget.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} must not traverse symlinks: ${relativePath}`)
  }
  return target
}

function ensureSafeOutputPath(workspace, relativePath, fsImpl = fs) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new Error(`Unsafe sidebar output path: ${relativePath}`)
  }
  const normalized = path.normalize(relativePath)
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new Error(`Unsafe sidebar output path: ${relativePath}`)
  const root = fsImpl.realpathSync(workspace)
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Sidebar output escapes workspace: ${relativePath}`)
  let current = root
  for (const segment of path.relative(root, path.dirname(target)).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    let stat
    try {
      stat = fsImpl.lstatSync(current)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      fsImpl.mkdirSync(current)
      stat = fsImpl.lstatSync(current)
    }
    if (stat.isSymbolicLink()) throw new Error(`Sidebar output ancestor must not be a symlink: ${current}`)
    if (!stat.isDirectory()) throw new Error(`Sidebar output ancestor must be a directory: ${current}`)
  }
  return target
}

function uniqueBackupPath(finalPath, fsImpl = fs) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = `${finalPath}.backup-${process.pid}-${Date.now()}-${attempt}`
    try {
      fsImpl.lstatSync(candidate)
    } catch (error) {
      if (error.code === 'ENOENT') return candidate
      throw error
    }
  }
  throw new Error(`Cannot allocate sidebar backup path for ${finalPath}`)
}

function removeIfPresent(target, fsImpl = fs) {
  try {
    const stat = fsImpl.lstatSync(target)
    fsImpl.rmSync(target, { recursive: stat.isDirectory(), force: true })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function operationError(operation, target, error) {
  return new Error(`${operation} (${target}): ${error.message}`, { cause: error })
}

function aggregateFailure(label, primaryError, recoveryErrors) {
  if (recoveryErrors.length === 0) return primaryError
  const errors = [primaryError, ...recoveryErrors]
  return new AggregateError(errors, `${label}: ${errors.map(error => error.message).join('; ')}`, { cause: primaryError })
}

function attempt(errors, operation, target, callback) {
  try {
    callback()
    return true
  } catch (error) {
    errors.push(operationError(operation, target, error))
    return false
  }
}

function recordOutputDirectoryIdentity(workspace, finalPath, fsImpl = fs) {
  const root = fsImpl.realpathSync(workspace)
  const directory = path.dirname(finalPath)
  const stat = fsImpl.lstatSync(directory)
  const realDirectory = fsImpl.realpathSync(directory)
  if (stat.isSymbolicLink() || !stat.isDirectory() || realDirectory !== directory
    || (realDirectory !== root && !realDirectory.startsWith(`${root}${path.sep}`))) {
    throw new Error(`Sidebar output parent must be a real workspace directory: ${directory}`)
  }
  return Object.freeze({ directory, realDirectory, device: stat.dev, inode: stat.ino })
}

function verifyOutputDirectoryIdentity(identity, fsImpl = fs) {
  let stat
  let realDirectory
  try {
    stat = fsImpl.lstatSync(identity.directory)
    realDirectory = fsImpl.realpathSync(identity.directory)
  } catch (error) {
    throw new Error(`Sidebar output directory identity unavailable for ${identity.directory}: ${error.message}`, { cause: error })
  }
  if (stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== identity.device
    || stat.ino !== identity.inode || realDirectory !== identity.realDirectory) {
    throw new Error(`Sidebar output directory identity changed: ${identity.directory}`)
  }
}

function removeEntryPathIfPresent(entry, target, fsImpl) {
  verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
  removeIfPresent(target, fsImpl)
  verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
}

function quarantineSidebarOutputs(workspace, fsImpl = fs) {
  const entries = []
  try {
    for (const relativePath of SIDEBAR_OUTPUTS) {
      const finalPath = ensureSafeOutputPath(workspace, relativePath, fsImpl)
      const directoryIdentity = recordOutputDirectoryIdentity(workspace, finalPath, fsImpl)
      const entry = { relativePath, finalPath, backupPath: null, backupMade: false, hadOriginal: false, directoryIdentity }
      let stat
      try {
        stat = fsImpl.lstatSync(finalPath)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      if (!stat) {
        entries.push(entry)
        continue
      }
      if (stat.isSymbolicLink()) throw new Error(`Sidebar output must not be a symlink: ${relativePath}`)
      if (!stat.isFile()) throw new Error(`Sidebar output must be a regular file: ${relativePath}`)
      entry.hadOriginal = true
      entry.backupPath = uniqueBackupPath(finalPath, fsImpl)
      entries.push(entry)
      verifyOutputDirectoryIdentity(directoryIdentity, fsImpl)
      fsImpl.renameSync(finalPath, entry.backupPath)
      entry.backupMade = true
      verifyOutputDirectoryIdentity(directoryIdentity, fsImpl)
    }
    return entries
  } catch (primaryError) {
    const recoveryErrors = restoreQuarantinedOutputs(entries.reverse(), fsImpl)
    throw aggregateFailure('Sidebar quarantine and recovery failed', primaryError, recoveryErrors)
  }
}

function restoreQuarantinedOutputs(entries, fsImpl = fs) {
  const recoveryErrors = []
  for (const entry of entries) {
    if (entry.hadOriginal && !entry.backupMade) continue
    const removed = attempt(recoveryErrors, 'remove fresh sidebar during recovery', entry.finalPath, () => {
      removeEntryPathIfPresent(entry, entry.finalPath, fsImpl)
    })
    if (removed && entry.backupMade) {
      const restored = attempt(recoveryErrors, 'restore quarantined sidebar', `${entry.backupPath} -> ${entry.finalPath}`, () => {
        verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
        fsImpl.renameSync(entry.backupPath, entry.finalPath)
        entry.backupMade = false
        verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
      })
      if (restored) entry.backupPath = null
    }
  }
  return recoveryErrors
}

function openManifestIdentity(workspace, mediaManifest, fsImpl = fs) {
  const target = requireRepoRelativeRegularFile(workspace, mediaManifest, 'Guides media manifest', fsImpl)
  for (const flag of ['O_NOFOLLOW', 'O_NONBLOCK']) {
    if (typeof fsImpl.constants[flag] !== 'number') throw new Error(`Secure media manifest reads require ${flag}`)
  }
  const descriptor = fsImpl.openSync(target, fsImpl.constants.O_RDONLY | fsImpl.constants.O_NOFOLLOW | fsImpl.constants.O_NONBLOCK)
  try {
    const stat = fsImpl.fstatSync(descriptor)
    if (!stat.isFile()) throw new Error('Guides media manifest must be a regular file')
    const bytes = fsImpl.readFileSync(descriptor)
    return {
      descriptor,
      target,
      device: stat.dev,
      inode: stat.ino,
      hash: crypto.createHash('sha256').update(bytes).digest('hex'),
    }
  } catch (primaryError) {
    try {
      fsImpl.closeSync(descriptor)
    } catch (closeError) {
      throw aggregateFailure('Guides media manifest read and close failed', primaryError, [
        operationError('close Guides media manifest descriptor', target, closeError),
      ])
    }
    throw primaryError
  }
}

function verifyManifestIdentity(identity, workspace, mediaManifest, fsImpl = fs) {
  const current = openManifestIdentity(workspace, mediaManifest, fsImpl)
  let primaryError = null
  try {
    if (current.device !== identity.device || current.inode !== identity.inode || current.hash !== identity.hash) {
      throw new Error('Guides media manifest identity or hash changed during sidebar generation')
    }
  } catch (error) {
    primaryError = error
  } finally {
    try {
      fsImpl.closeSync(current.descriptor)
    } catch (closeError) {
      const wrapped = operationError('close verified Guides media manifest descriptor', current.target, closeError)
      primaryError = primaryError
        ? aggregateFailure('Guides media manifest verification and close failed', primaryError, [wrapped])
        : wrapped
    }
  }
  if (primaryError) throw primaryError
}

function generateGuidesSidebars({ workspace, mediaManifest, spawnSync = defaultSpawnSync, fsImpl = fs }) {
  if (!workspace) throw new Error('workspace is required')
  let identity
  let quarantined = []
  let primaryError = null
  let committed = false
  try {
    identity = openManifestIdentity(workspace, mediaManifest, fsImpl)
    quarantined = quarantineSidebarOutputs(workspace, fsImpl)
    const args = [
      'docusaurus', 'fetch-lark-docs',
      '--manual', 'guides',
      '--sidebarOnly',
      '--skipSourceDown',
      '--offline',
      '--sidebarTargets', 'zilliz.saas,zilliz.paas',
      '--mediaManifest', mediaManifest,
    ]
    const result = spawnSync('npx', args, { cwd: workspace, stdio: 'inherit', env: process.env })
    if (result.error) throw new Error(`Guides sidebar generation could not spawn: ${result.error.message}`)
    if (result.signal) throw new Error(`Guides sidebar generation failed with signal ${result.signal}`)
    if (result.status !== 0) throw new Error(`Guides sidebar generation failed with status ${result.status}`)
    verifyManifestIdentity(identity, workspace, mediaManifest, fsImpl)
    for (const entry of quarantined) {
      verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
      requireRepoRelativeRegularFile(workspace, entry.relativePath, `Fresh generated sidebar ${entry.relativePath}`, fsImpl)
      verifyOutputDirectoryIdentity(entry.directoryIdentity, fsImpl)
    }
    committed = true
    const cleanupErrors = []
    for (const entry of quarantined) {
      if (!entry.backupMade) continue
      const removed = attempt(cleanupErrors, 'remove committed quarantine backup residue', entry.backupPath, () => {
        removeEntryPathIfPresent(entry, entry.backupPath, fsImpl)
      })
      if (removed) {
        entry.backupMade = false
        entry.backupPath = null
      }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(cleanupErrors, `Guides sidebars committed but backup cleanup failed: ${cleanupErrors.map(error => error.message).join('; ')}`)
    }
  } catch (error) {
    primaryError = error
    if (!committed) {
      primaryError = aggregateFailure(
        'Guides sidebar generation and recovery failed',
        primaryError,
        restoreQuarantinedOutputs(quarantined, fsImpl),
      )
    }
  } finally {
    if (identity) {
      try {
        fsImpl.closeSync(identity.descriptor)
      } catch (error) {
        const wrapped = operationError('close original Guides media manifest descriptor', identity.target, error)
        primaryError = primaryError
          ? aggregateFailure('Guides sidebar transaction and manifest close failed', primaryError, [wrapped])
          : wrapped
      }
    }
  }
  if (primaryError) throw primaryError
  return { outputs: [...SIDEBAR_OUTPUTS] }
}

if (require.main === module) {
  try {
    const { mediaManifest } = parseArgs(process.argv.slice(2))
    generateGuidesSidebars({ workspace: process.cwd(), mediaManifest })
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  generateGuidesSidebars,
  parseArgs,
  requireRepoRelativeRegularFile,
  SIDEBAR_OUTPUTS,
  openManifestIdentity,
  quarantineSidebarOutputs,
}
