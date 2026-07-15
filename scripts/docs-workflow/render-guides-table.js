#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync: defaultSpawnSync } = require('node:child_process')

function tableOutputPath(entry) {
  if (!entry?.table_slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.table_slug)) throw new Error('Invalid Guides table slug')
  const root = entry.target === 'zilliz.saas'
    ? 'docs/tutorials'
    : entry.target === 'zilliz.paas'
      ? 'docs-byoc/tutorials'
      : null
  if (!root) throw new Error(`Invalid Guides target: ${entry.target}`)
  return `${root}/${entry.table_slug}`
}

function renderGuidesTable(options) {
  const { workspace, spawnSync = defaultSpawnSync } = options
  if (!workspace || !options.table_id) throw new Error('workspace and table_id are required')
  const outputPath = tableOutputPath(options)
  const absoluteOutput = path.join(workspace, outputPath)
  fs.rmSync(absoluteOutput, { recursive: true, force: true })
  if (options.cleanup) return { outputPath, cleanup: true }

  const args = [
    'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', options.target,
    '-token', `base:${options.table_id}`, '-skipS', '--buildEnv', 'uat',
    '--snapshotCandidatePath', 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    '--offline', '--mediaManifest', 'plugins/lark-docs/meta/media-cache/guides.json',
  ]
  const result = spawnSync('npx', args, { cwd: workspace, stdio: 'inherit', env: process.env })
  if (result.error) throw new Error(`Guides table render could not start: ${result.error.message}`)
  if (result.status !== 0) throw new Error(`Guides table render failed with status ${result.status}`)
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
