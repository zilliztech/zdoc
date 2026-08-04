#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync: defaultSpawnSync } = require('node:child_process')
const { resolveBootstrapSite } = require('../../packages/site-config/src/resolve.ts')
const { resolveGuidesSourceConfig } = require('../../packages/docs-tooling/src/manuals/registry.ts')

function tableOutputPath(entry) {
  if (!entry?.table_slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.table_slug)) throw new Error('Invalid Guides table slug')
  const site = resolveBootstrapSite(entry.site)
  const root = entry.target === 'zilliz.saas'
    ? `tmp/docs-tooling/${site}/guides/content/${site}/guides/tutorials`
    : entry.target === 'zilliz.paas'
      ? `tmp/docs-tooling/${site}/guides-byoc/content/${site}/byoc/tutorials`
      : null
  if (!root) throw new Error(`Invalid Guides target: ${entry.target}`)
  return `${root}/${entry.table_slug}`
}

function normalizeChineseTableOutput(root, ownedPath, tableSlug) {
  const entries = fs.readdirSync(root, { withFileTypes: true })
  if (entries.length === 1 && entries[0].name === tableSlug && entries[0].isDirectory()) return
  if (entries.some(entry => entry.name === tableSlug)) throw new Error(`Chinese Guides table output collides with owned directory: ${tableSlug}`)
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error(`Chinese Guides table output must not contain symlinks: ${entry.name}`)
  }
  const staging = path.join(root, `.__table-output-${tableSlug}`)
  fs.mkdirSync(staging)
  try {
    for (const entry of entries) fs.renameSync(path.join(root, entry.name), path.join(staging, entry.name))
    fs.renameSync(staging, ownedPath)
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true })
    throw error
  }
}

function renderGuidesTable(options) {
  const { workspace, spawnSync = defaultSpawnSync } = options
  if (!workspace || !options.table_id) throw new Error('workspace and table_id are required')
  const site = resolveBootstrapSite(options.site)
  const sourceConfig = resolveGuidesSourceConfig(site)
  const outputPath = tableOutputPath(options)
  const absoluteOutput = path.join(workspace, outputPath)
  const outputRoot = path.dirname(absoluteOutput)
  if (site === 'zh-CN' && !options.cleanup) {
    fs.rmSync(outputRoot, { recursive: true, force: true })
    fs.mkdirSync(outputRoot, { recursive: true })
  } else {
    fs.rmSync(absoluteOutput, { recursive: true, force: true })
  }
  if (options.cleanup) return { outputPath, cleanup: true }

  const args = [
    path.join(workspace, 'packages/docs-tooling/src/lark/standalone-cli.js'),
    'fetch-lark-docs', '-man', 'guides', '-tar', options.target,
    '-token', `base:${options.table_id}`, '-skipS', '--buildEnv', 'uat',
    '--snapshotCandidatePath', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
    '--offline', '--mediaManifest', sourceConfig.mediaManifestPath,
  ]
  const result = spawnSync(process.execPath, args, { cwd: workspace, stdio: 'inherit', env: process.env })
  if (result.error) throw new Error(`Guides table render could not start: ${result.error.message}`)
  if (result.status !== 0) throw new Error(`Guides table render failed with status ${result.status}`)
  if (site === 'zh-CN') normalizeChineseTableOutput(outputRoot, absoluteOutput, options.table_slug)
  return { outputPath, cleanup: false }
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value == null) throw new Error('Invalid arguments')
    args[flag.slice(2)] = value
  }
  return args
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const entry = args.entry ? JSON.parse(args.entry) : {}
    renderGuidesTable({
      ...entry,
      workspace: args.workspace || process.cwd(),
      table_id: args['table-id'] || entry.table_id, table_name: args['table-name'] || entry.table_name, table_slug: args['table-slug'] || entry.table_slug,
      target: args.target || entry.target, cleanup: args.cleanup ? args.cleanup === 'true' : Boolean(entry.cleanup),
    })
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { renderGuidesTable, tableOutputPath }
