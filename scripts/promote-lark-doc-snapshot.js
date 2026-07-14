#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const { promoteCandidateSnapshot, writeSnapshot } = require('../plugins/lark-docs/sourceSnapshot')

function parseArgs(argv) {
  const result = {}, seen = new Set()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || seen.has(flag)) throw new Error('Invalid arguments')
    seen.add(flag); result[flag.slice(2)] = value
  }
  return result
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  for (const required of ['candidate', 'output', 'manual', 'build-env', 'source-dir', 'targets-built', 'source-branch', 'publish-url', 'link-check-remote']) {
    if (!args[required]) throw new Error(`--${required} is required`)
  }
  const candidate = JSON.parse(fs.readFileSync(args.candidate, 'utf8'))
  const promoted = promoteCandidateSnapshot(candidate, {
    manual: args.manual,
    buildEnv: args['build-env'],
    sourceDir: args['source-dir'],
    targetsBuilt: args['targets-built'].split(',').map(value => value.trim()).filter(Boolean),
    sourceBranch: args['source-branch'],
    publishUrl: args['publish-url'],
    linkCheckRemote: args['link-check-remote'],
  })
  writeSnapshot(args.output, promoted)
  console.log(`[snapshot] Promoted candidate ${args.candidate} -> ${args.output}`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { parseArgs }
