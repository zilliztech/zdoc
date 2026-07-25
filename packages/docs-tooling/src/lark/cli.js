#!/usr/bin/env node
'use strict'

const path = require('node:path')
const { Command } = require('commander')
const larkDocsPlugin = require('./index.js')

const DISPLAYED_SIDEBARS = Object.freeze({
  cli: 'cliSidebar',
  go: 'goSidebar',
  guides: 'default',
  'guides-byoc': 'default',
  java: 'javaSidebar',
  node: 'nodeSidebar',
  python: 'pythonSidebar',
})

function repositoryRelative(value, label) {
  const segments = typeof value === 'string' ? value.split('/') : []
  const invalid =
    typeof value !== 'string' || value.length === 0 || value !== value.trim() ||
    path.posix.isAbsolute(value) || path.win32.isAbsolute(value) || value.includes('\\') ||
    segments.some(segment => segment === '' || segment === '.' || segment === '..')
  if (invalid) throw new Error(`${label} must be a normalized repository-relative path`)
  return value
}

function parseArgs(argv) {
  const program = new Command()
    .name('docs-tooling-lark')
    .exitOverride()
    .requiredOption('--manual <id>')
    .requiredOption('--site <site>')
    .requiredOption('--source <identity>')
    .requiredOption('--source-type <type>')
    .requiredOption('--root <token>')
    .requiredOption('--base <token>')
    .requiredOption('--source-dir <dir>')
    .requiredOption('--stage <dir>')
    .option('--version <version>')
    .option('--source-only')
    .option('--snapshot-candidate <path>')
    .option('--force-full-fetch')
  program.parse(argv, {from: 'user'})
  const options = program.opts()
  if (!['en', 'zh-CN'].includes(options.site)) throw new Error(`Unsupported site: ${options.site}`)
  if (!['wiki', 'drive', 'onePager'].includes(options.sourceType)) {
    throw new Error(`Unsupported Lark source type: ${options.sourceType}`)
  }
  options.sourceDir = repositoryRelative(options.sourceDir, 'Lark source directory')
  options.stage = repositoryRelative(options.stage, 'Lark stage directory')
  if (options.snapshotCandidate) {
    options.snapshotCandidate = repositoryRelative(options.snapshotCandidate, 'Lark snapshot candidate')
  }
  if (options.sourceOnly && !options.snapshotCandidate) {
    throw new Error('--source-only requires --snapshot-candidate')
  }
  if (options.snapshotCandidate && !options.sourceOnly) {
    throw new Error('--snapshot-candidate requires --source-only')
  }
  return options
}

function runtimeManual(options) {
  const stage = options.stage
  return {
    root: options.root,
    base: options.base,
    sourceType: options.sourceType,
    ...(options.version ? {version: options.version} : {}),
    displayedSidebar: DISPLAYED_SIDEBARS[options.manual] || 'default',
    docSourceDir: options.sourceDir,
    contentRoot: stage,
    targets: {
      stage: {
        outputDir: stage,
        imageDir: path.join(stage, '.assets'),
      },
    },
  }
}

function runtimeInvocation(options) {
  const sourceIdentity = `${options.manual}:${options.site}:${options.source}`
  if (options.sourceOnly) {
    return {
      manualIdentity: options.manual,
      generatorArgs: [
        'fetch-lark-docs',
        '--manual', options.manual,
        '--sourceOnly',
        '--incremental',
        '--buildEnv', 'uat',
        '--snapshotCandidatePath', options.snapshotCandidate,
        ...(options.forceFullFetch ? ['--forceFullFetch'] : []),
      ],
    }
  }
  return {
    manualIdentity: sourceIdentity,
    generatorArgs: [
      'fetch-lark-docs',
      '--manual', sourceIdentity,
      '--pubTarget', 'stage',
      '--uploadToS3',
      '--incremental',
      '--buildEnv', 'uat',
      ...(options.forceFullFetch ? ['--forceFullFetch'] : []),
    ],
  }
}

async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  const {manualIdentity, generatorArgs} = runtimeInvocation(options)
  const command = new Command().name('docs-tooling-lark-runtime').exitOverride()
  larkDocsPlugin(null, {[manualIdentity]: runtimeManual(options)}).extendCli(command)
  await command.parseAsync(generatorArgs, {from: 'user'})
}

if (require.main === module) {
  run().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

module.exports = {parseArgs, run, runtimeInvocation, runtimeManual}
