#!/usr/bin/env node
'use strict'

const path = require('node:path')
const { Command } = require('commander')
const { loadTypeScript } = require('../../../../scripts/lib/load-typescript')
const larkDocsPlugin = require('./index.js')

async function run(argv = process.argv.slice(2)) {
  const manuals = loadTypeScript(path.resolve(__dirname, '../../../../config/lark-docs.config.ts'))
  const command = new Command().name('docs-tooling-lark-standalone').exitOverride()
  larkDocsPlugin(null, manuals).extendCli(command)
  await command.parseAsync(argv, { from: 'user' })
}

if (require.main === module) {
  run().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

module.exports = { run }
