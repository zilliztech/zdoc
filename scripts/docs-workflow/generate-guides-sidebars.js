#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
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

function generateGuidesSidebars({ workspace, mediaManifest, spawnSync = defaultSpawnSync }) {
  if (!workspace) throw new Error('workspace is required')
  requireRepoRelativeRegularFile(workspace, mediaManifest, 'Guides media manifest')

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

  for (const output of SIDEBAR_OUTPUTS) {
    requireRepoRelativeRegularFile(workspace, output, `Generated sidebar ${output}`)
  }
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

module.exports = { generateGuidesSidebars, parseArgs, requireRepoRelativeRegularFile, SIDEBAR_OUTPUTS }
