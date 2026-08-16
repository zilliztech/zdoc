#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const {ownedSourcePaths} = require('./reconciliation-discovery')
const {createSdkCliCompletenessReceipt} = require('./sdkCliCompletenessReceipt')

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function collectSourceInventory(repository, roots) {
  const files = []
  function visit(root, relative) {
    const absolute = path.join(repository, relative)
    let stat
    try { stat = fs.lstatSync(absolute) }
    catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    if (stat.isSymbolicLink()) throw new Error(`SDK/CLI completeness inventory must not contain symlinks: ${relative}`)
    if (stat.isFile()) {
      const bytes = fs.readFileSync(absolute)
      files.push({path: relative, sha256: sha256(bytes), size: bytes.length})
      return
    }
    if (!stat.isDirectory()) throw new Error(`SDK/CLI completeness inventory contains an unsupported entry: ${relative}`)
    for (const entry of fs.readdirSync(absolute, {withFileTypes: true})) visit(root, `${relative}/${entry.name}`)
  }
  for (const root of roots) visit(root, root)
  return files.sort((left, right) => left.path.localeCompare(right.path))
}

function createSdkCliReceiptFromWorkspace({repository, group, toolingSha, sourceBaselineSha, sourceCheckpointSha}) {
  const files = collectSourceInventory(repository, ownedSourcePaths(group, 'zh-CN-reference'))
  return createSdkCliCompletenessReceipt({
    manifest: {
      schemaVersion: 1,
      stage: 'source',
      group,
      masterSha: toolingSha,
      devBaselineSha: sourceCheckpointSha,
      files,
      deletions: [],
      validation: {passed: true, commands: []},
    },
    sourceBaselineSha,
    sourceCheckpointSha,
  })
}

function parseArgs(argv) {
  const names = new Map([
    ['--repository', 'repository'], ['--group', 'group'], ['--tooling-sha', 'toolingSha'],
    ['--source-baseline-sha', 'sourceBaselineSha'], ['--source-checkpoint-sha', 'sourceCheckpointSha'],
    ['--output', 'output'],
  ])
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = names.get(argv[index])
    if (!key || argv[index + 1] === undefined || Object.hasOwn(result, key)) throw new Error('Invalid SDK/CLI receipt creation arguments')
    result[key] = argv[index + 1]
  }
  for (const key of names.values()) if (!result[key]) throw new Error(`Missing SDK/CLI receipt argument: ${key}`)
  return result
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const receipt = createSdkCliReceiptFromWorkspace({
    repository: path.resolve(args.repository),
    group: args.group,
    toolingSha: args.toolingSha,
    sourceBaselineSha: args.sourceBaselineSha,
    sourceCheckpointSha: args.sourceCheckpointSha,
  })
  const output = path.resolve(args.output)
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(receipt)}\n`)
  return receipt
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {createSdkCliReceiptFromWorkspace, parseArgs}
