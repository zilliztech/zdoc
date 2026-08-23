'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { loadTypeScript } = require('./lib/load-typescript')

const repositoryRoot = path.resolve(__dirname, '..')
const outputPath = path.join(repositoryRoot, 'config/lark-docs.config.ts')
const { manualRegistry } = loadTypeScript(path.resolve(repositoryRoot, 'packages/docs-tooling/src/manuals/registry.ts'))
const { generateLarkDocsConfig } = loadTypeScript(path.resolve(repositoryRoot, 'packages/docs-tooling/src/manuals/derive/larkConfig.ts'))
const bytes = generateLarkDocsConfig(manualRegistry)

if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) {
  throw new Error('Usage: generate-lark-docs-config.js [--check]')
}

if (process.argv[2] === '--check') {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : ''
  if (current !== bytes) {
    throw new Error('config/lark-docs.config.ts is stale; run pnpm generate:lark-config')
  }
} else {
  fs.writeFileSync(outputPath, bytes)
}
