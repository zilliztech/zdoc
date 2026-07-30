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
    .requiredOption('--generator-manual <identity>')
    .requiredOption('--snapshot-path <path>')
    .requiredOption('--generator-target <target>')
    .requiredOption('--source-type <type>')
    .requiredOption('--root <token>')
    .requiredOption('--base <token>')
    .requiredOption('--source-dir <dir>')
    .requiredOption('--stage <dir>')
    .option('--version <version>')
    .option('--fallback-source-dir <dir>')
    .option('--output-dir <dir>')
    .option('--content-root <dir>')
    .option('--sidebar-path <path>')
    .option('--override-path <path>')
    .option('--source-only')
    .option('--snapshot-candidate <path>')
    .option('--force-full-fetch')
    .option('--reuse-source')
    .option('--sidebar-only')
  program.parse(argv, {from: 'user'})
  const options = program.opts()
  if (!['en', 'zh-CN'].includes(options.site)) throw new Error(`Unsupported site: ${options.site}`)
  if (!['wiki', 'drive', 'onePager'].includes(options.sourceType)) {
    throw new Error(`Unsupported Lark source type: ${options.sourceType}`)
  }
  if (!['zilliz', 'zilliz.saas', 'zilliz.paas'].includes(options.generatorTarget)) {
    throw new Error(`Unsupported generator target: ${options.generatorTarget}`)
  }
  options.sourceDir = repositoryRelative(options.sourceDir, 'Lark source directory')
  options.stage = repositoryRelative(options.stage, 'Lark stage directory')
  for (const [key, label] of [
    ['fallbackSourceDir', 'Lark fallback source directory'],
    ['outputDir', 'Lark publication output directory'],
    ['contentRoot', 'Lark publication content root'],
    ['sidebarPath', 'Lark publication sidebar path'],
    ['overridePath', 'Lark publication override path'],
  ]) {
    if (options[key]) options[key] = repositoryRelative(options[key], label)
  }
  if (options.snapshotCandidate) {
    options.snapshotCandidate = repositoryRelative(options.snapshotCandidate, 'Lark snapshot candidate')
  }
  options.snapshotPath = repositoryRelative(options.snapshotPath, 'Lark snapshot path')
  if (options.snapshotCandidate && !options.sourceOnly) {
    throw new Error('--snapshot-candidate requires --source-only')
  }
  if (options.reuseSource && (!['guides', 'guides-byoc'].includes(options.manual) || options.sourceOnly)) {
    throw new Error('--reuse-source is only valid for a Guides publication render')
  }
  if (!options.sourceOnly) {
    for (const [key, flag] of [['outputDir', '--output-dir'], ['contentRoot', '--content-root'], ['sidebarPath', '--sidebar-path'], ['overridePath', '--override-path']]) {
      if (!options[key]) throw new Error(`${flag} is required for publication generation`)
    }
    if (options.outputDir !== options.contentRoot && !options.outputDir.startsWith(`${options.contentRoot}/`)) {
      throw new Error('--output-dir must be contained by --content-root')
    }
  }
  return options
}

function runtimeManual(options) {
  const stage = options.stage
  const staged = value => path.posix.join(stage, value)
  const targetConfig = {
    outputDir: options.outputDir ? staged(options.outputDir) : stage,
    ...(options.contentRoot ? {contentRoot: staged(options.contentRoot)} : {}),
    imageDir: path.join(stage, '.assets'),
    ...(options.sidebarPath ? {sidebarPath: staged(options.sidebarPath)} : {}),
    ...(options.overridePath ? {overridePath: options.overridePath} : {}),
  }
  const targets = {}
  const targetParts = options.generatorTarget.split('.')
  let targetParent = targets
  for (const part of targetParts.slice(0, -1)) targetParent = targetParent[part] ??= {}
  targetParent[targetParts.at(-1)] = targetConfig
  return {
    root: options.root,
    base: options.base,
    sourceType: options.sourceType,
    ...(options.version ? {version: options.version} : {}),
    displayedSidebar: DISPLAYED_SIDEBARS[options.manual] || 'default',
    docSourceDir: options.sourceDir,
    ...(options.fallbackSourceDir ? {fallbackSourceDir: options.fallbackSourceDir} : {}),
    ...(options.contentRoot ? {contentRoot: staged(options.contentRoot)} : {}),
    ...(options.sidebarPath ? {sidebarPath: staged(options.sidebarPath)} : {}),
    ...(options.overridePath ? {overridePath: options.overridePath} : {}),
    targets,
  }
}

function runtimeInvocation(options) {
  const manualIdentity = options.generatorManual
  if (options.sourceOnly) {
    return {
      manualIdentity,
      generatorArgs: [
        'fetch-lark-docs',
        '--manual', manualIdentity,
        '--sourceOnly',
        ...(options.snapshotCandidate ? [
        '--incremental',
        '--buildEnv', 'uat',
        '--snapshotPath', options.snapshotPath,
        '--snapshotCandidatePath', options.snapshotCandidate,
        ] : []),
        ...(!options.snapshotCandidate ? ['--snapshotPath', options.snapshotPath] : []),
        ...(options.reuseSource ? ['--skipSourceDown'] : []),
        ...(options.forceFullFetch ? ['--forceFullFetch'] : []),
      ],
    }
  }
  return {
    manualIdentity,
    generatorArgs: [
      'fetch-lark-docs',
      '--manual', manualIdentity,
      '--pubTarget', options.generatorTarget,
      '--uploadToS3',
      '--buildEnv', 'uat',
      '--snapshotPath', options.snapshotPath,
      ...(options.reuseSource ? ['--skipSourceDown'] : []),
      ...(options.forceFullFetch ? ['--forceFullFetch'] : []),
      ...(options.sidebarOnly ? ['--sidebarOnly'] : []),
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
