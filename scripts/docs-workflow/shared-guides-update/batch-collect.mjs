#!/usr/bin/env node
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
const args = process.argv.slice(2), options = {}
const indexFlag = args.indexOf('--dependency-index')
const exportIndex = indexFlag !== -1
if (exportIndex) args.splice(indexFlag, 1)
let valid = args.length === 4
for (let i = 0; i < args.length && valid; i += 2) {
  const key = args[i] === '--source-repo' ? 'sourceRepository' : args[i] === '--out' ? 'out' : null
  if (!key || Object.hasOwn(options, key) || !args[i + 1] || args[i + 1].startsWith('-') || /[\0\r\n]/.test(args[i + 1])) valid = false
  else options[key] = args[i + 1]
}
if (!valid || Object.keys(options).length !== 2) {
  process.stderr.write('Usage: node batch-collect.mjs --source-repo <existing-Git-store> --out <fresh-owned-dir> [--dependency-index]\n')
  process.exitCode = 2
} else {
  try {
    const require = createRequire(import.meta.url)
    const {loadTypeScript} = require('../../lib/load-typescript.js')
    const collector = loadTypeScript(fileURLToPath(new URL('../../../packages/docs-tooling/src/shared-docs/adapters/updates/batch-collection.ts', import.meta.url)))
    const result = exportIndex ? await collector.collectObservedGuidesBatchWithDependencyIndex(options) : await collector.collectObservedGuidesBatch(options)
    const bytes = JSON.stringify(result)
    if (Buffer.byteLength(bytes) > 65536) throw Error('BATCH_SUMMARY_LIMIT')
    process.stdout.write(bytes + '\n')
    process.exitCode = (exportIndex ? result.result.status : result.status) === 'held' ? 1 : 0
  } catch {
    const result = {kind: 'guides-batch-collection-v1', observation: 'observed', status: 'held', writeEligible: false, operations: [], reasons: ['BATCH_COLLECTION_FAILED'], index: null}
    const output = exportIndex ? {schema: 'guides-batch-dependency-export-v1', result, entries: [], unavailable: [], writeEligible: false, operations: []} : result
    process.stdout.write(JSON.stringify(output) + '\n')
    process.exitCode = 1
  }
}
