'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { loadTypeScript } = require('./lib/load-typescript')

const repositoryRoot = path.resolve(__dirname, '..')
const outputPath = path.join(repositoryRoot, 'config/translation/reconciliation-policy.json')
const { generateReconciliationPolicyJson } = loadTypeScript(path.resolve(repositoryRoot, 'packages/docs-tooling/src/manuals/derive/reconciliationPolicy.ts'))
const bytes = generateReconciliationPolicyJson()

if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) {
  throw new Error('Usage: generate-reconciliation-policy.js [--check]')
}

if (process.argv[2] === '--check') {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : ''
  if (current !== bytes) {
    throw new Error('config/translation/reconciliation-policy.json is stale; run pnpm generate:reconciliation-policy')
  }
} else {
  fs.writeFileSync(outputPath, bytes)
}

