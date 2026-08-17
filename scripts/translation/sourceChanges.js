'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {getGroupPaths} = require('../docs-workflow/group-paths')
const {
  collectGitSourceChanges,
  isOwnedPath,
  mapSourcePathForTarget,
  normalizeRelativePath,
  ownedSourcePaths,
} = require('./reconciliation-discovery')

function classifySourceChanges({group, target = 'ja-JP', changes}) {
  if (!Array.isArray(changes)) throw new Error('Source changes must be an array')
  ownedSourcePaths(group, target)
  const ownedPrefixes = ownedSourcePaths(group, target)
  const preservedEnglish = new Set(getGroupPaths(group, 'en').preservedEnglish.map(normalizeRelativePath))
  const changedEnglish = new Set()

  for (const change of changes) {
    if (!['A', 'M'].includes(change.status)) continue
    const filePath = normalizeRelativePath(change.path)
    if (!isOwnedPath(filePath, ownedPrefixes)) continue
    if (preservedEnglish.has(filePath)) continue
    if (!mapSourcePathForTarget(target, filePath)) continue
    changedEnglish.add(filePath)
  }

  return Object.freeze({
    group,
    changedEnglish: Object.freeze([...changedEnglish].sort()),
  })
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) {
      throw new Error('Usage: node scripts/translation/sourceChanges.js --repository <absolute-path> --source-baseline-sha <sha> --source-checkpoint-sha <sha> --target <target> --group <group> --output <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--repository', '--source-baseline-sha', '--source-checkpoint-sha', '--target', '--group', '--output']) {
    if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const group = args.get('--group')
  const target = args.get('--target')
  const repository = path.resolve(args.get('--repository'))
  if (repository !== args.get('--repository')) throw new Error('Source changes repository must be an absolute normalized path')
  const changes = collectGitSourceChanges({
    repository,
    sourceBaselineSha: args.get('--source-baseline-sha'),
    sourceCheckpointSha: args.get('--source-checkpoint-sha'),
    target,
    group,
  })
  const result = classifySourceChanges({group, target, changes})
  const output = path.resolve(args.get('--output'))
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  console.log(`[translation-source-changes] ${result.changedEnglish.length} changed`)
}

module.exports = {classifySourceChanges}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
