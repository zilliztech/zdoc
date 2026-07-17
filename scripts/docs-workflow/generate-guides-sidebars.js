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

function requireRepoRelativeRegularFile(workspace, relativePath, label) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  const normalized = path.normalize(relativePath)
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  let root
  try {
    root = fs.realpathSync(workspace)
  } catch (_) {
    throw new Error('workspace must exist')
  }
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository workspace`)

  let stat
  try {
    stat = fs.lstatSync(target)
  } catch (error) {
    throw new Error(`${label} does not exist: ${relativePath}`)
  }
  if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symlink: ${relativePath}`)
  if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`)
  const realTarget = fs.realpathSync(target)
  if (realTarget !== target || !realTarget.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} must not traverse symlinks: ${relativePath}`)
  }
  return target
}

function ensureSafeOutputPath(workspace, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new Error(`Unsafe sidebar output path: ${relativePath}`)
  }
  const normalized = path.normalize(relativePath)
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new Error(`Unsafe sidebar output path: ${relativePath}`)
  const root = fs.realpathSync(workspace)
  const target = path.resolve(root, normalized)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Sidebar output escapes workspace: ${relativePath}`)
  let current = root
  for (const segment of path.relative(root, path.dirname(target)).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    let stat
    try {
      stat = fs.lstatSync(current)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      fs.mkdirSync(current)
      stat = fs.lstatSync(current)
    }
    if (stat.isSymbolicLink()) throw new Error(`Sidebar output ancestor must not be a symlink: ${current}`)
    if (!stat.isDirectory()) throw new Error(`Sidebar output ancestor must be a directory: ${current}`)
  }
  return target
}

function uniqueBackupPath(finalPath) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = `${finalPath}.backup-${process.pid}-${Date.now()}-${attempt}`
    try {
      fs.lstatSync(candidate)
    } catch (error) {
      if (error.code === 'ENOENT') return candidate
      throw error
    }
  }
  throw new Error(`Cannot allocate sidebar backup path for ${finalPath}`)
}

function removeIfPresent(target) {
  try {
    const stat = fs.lstatSync(target)
    fs.rmSync(target, { recursive: stat.isDirectory(), force: true })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function quarantineSidebarOutputs(workspace) {
  const entries = []
  try {
    for (const relativePath of SIDEBAR_OUTPUTS) {
      const finalPath = ensureSafeOutputPath(workspace, relativePath)
      let backupPath = null
      try {
        const stat = fs.lstatSync(finalPath)
        if (stat.isSymbolicLink()) throw new Error(`Sidebar output must not be a symlink: ${relativePath}`)
        if (!stat.isFile()) throw new Error(`Sidebar output must be a regular file: ${relativePath}`)
        backupPath = uniqueBackupPath(finalPath)
        fs.renameSync(finalPath, backupPath)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      entries.push({ relativePath, finalPath, backupPath })
    }
    return entries
  } catch (error) {
    for (const entry of entries.reverse()) {
      try {
        removeIfPresent(entry.finalPath)
        if (entry.backupPath) fs.renameSync(entry.backupPath, entry.finalPath)
      } catch (_) {}
    }
    throw error
  }
}

function restoreQuarantinedOutputs(entries) {
  for (const entry of entries) {
    try {
      removeIfPresent(entry.finalPath)
      if (entry.backupPath) fs.renameSync(entry.backupPath, entry.finalPath)
    } catch (_) {}
  }
}

function openManifestIdentity(workspace, mediaManifest) {
  const target = requireRepoRelativeRegularFile(workspace, mediaManifest, 'Guides media manifest')
  for (const flag of ['O_NOFOLLOW', 'O_NONBLOCK']) {
    if (typeof fs.constants[flag] !== 'number') throw new Error(`Secure media manifest reads require ${flag}`)
  }
  const descriptor = fs.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK)
  try {
    const stat = fs.fstatSync(descriptor)
    if (!stat.isFile()) throw new Error('Guides media manifest must be a regular file')
    const bytes = fs.readFileSync(descriptor)
    return {
      descriptor,
      target,
      device: stat.dev,
      inode: stat.ino,
      hash: crypto.createHash('sha256').update(bytes).digest('hex'),
    }
  } catch (error) {
    fs.closeSync(descriptor)
    throw error
  }
}

function verifyManifestIdentity(identity, workspace, mediaManifest) {
  const current = openManifestIdentity(workspace, mediaManifest)
  try {
    if (current.device !== identity.device || current.inode !== identity.inode || current.hash !== identity.hash) {
      throw new Error('Guides media manifest identity or hash changed during sidebar generation')
    }
  } finally {
    fs.closeSync(current.descriptor)
  }
}

function generateGuidesSidebars({ workspace, mediaManifest, spawnSync = defaultSpawnSync }) {
  if (!workspace) throw new Error('workspace is required')
  let identity
  let quarantined = []
  let primaryError = null
  try {
    identity = openManifestIdentity(workspace, mediaManifest)
    quarantined = quarantineSidebarOutputs(workspace)
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
    verifyManifestIdentity(identity, workspace, mediaManifest)
    for (const output of SIDEBAR_OUTPUTS) {
      requireRepoRelativeRegularFile(workspace, output, `Fresh generated sidebar ${output}`)
    }
    for (const entry of quarantined) {
      if (entry.backupPath) fs.rmSync(entry.backupPath, { force: true })
      entry.backupPath = null
    }
  } catch (error) {
    primaryError = error
    restoreQuarantinedOutputs(quarantined)
  } finally {
    if (identity) {
      try {
        fs.closeSync(identity.descriptor)
      } catch (error) {
        if (!primaryError) primaryError = error
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
