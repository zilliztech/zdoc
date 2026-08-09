#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const {getContentGroup} = require('../docs-workflow/content-groups')
const {translationOwnedPaths} = require('../docs-workflow/validate-checkpoint-artifact')

function safeRoot(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error(`${label} must be an absolute path`)
  const resolved = fs.realpathSync(value)
  if (!fs.lstatSync(resolved).isDirectory()) throw new Error(`${label} must be a directory`)
  return resolved
}

function safeRelative(root, relative, label) {
  if (typeof relative !== 'string' || !relative || path.posix.normalize(relative) !== relative || path.isAbsolute(relative) || relative.includes('\\')) {
    throw new Error(`${label} must be a safe repository-relative path`)
  }
  const resolved = path.resolve(root, ...relative.split('/'))
  if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes its root`)
  return resolved
}

function validateRegularTree(target, label) {
  let stat
  try { stat = fs.lstatSync(target) }
  catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }
  if (stat.isSymbolicLink()) throw new Error(`${label} must not contain symlinks`)
  if (stat.isFile()) return
  if (!stat.isDirectory()) throw new Error(`${label} must contain only regular files and directories`)
  for (const entry of fs.readdirSync(target)) validateRegularTree(path.join(target, entry), label)
}

function assertDestinationChain(root, target, label) {
  const relative = path.relative(root, path.dirname(target))
  let current = root
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    let stat
    try { stat = fs.lstatSync(current) }
    catch (error) {
      if (error.code === 'ENOENT') break
      throw error
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} has an unsafe destination ancestor`)
  }
}

function canonicalizeOwnedPaths(ownedPaths) {
  return ownedPaths.filter(relative => !ownedPaths.some(candidate => candidate !== relative && relative.startsWith(`${candidate}/`)))
}

function createParentDirectories(repositoryRoot, destination, created) {
  const relative = path.relative(repositoryRoot, path.dirname(destination))
  let current = repositoryRoot
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    if (fs.existsSync(current)) continue
    fs.mkdirSync(current)
    created.push(current)
  }
}

function removeCreatedParents(created) {
  for (const directory of [...created].reverse()) {
    try { fs.rmdirSync(directory) }
    catch (error) {
      if (!['ENOENT', 'ENOTEMPTY'].includes(error.code)) throw error
    }
  }
}

function materializeTranslationBaseline({repositoryRoot, baselineRoot, target, group, dependencies = {}}) {
  const repository = safeRoot(repositoryRoot, 'Translation repository')
  const baseline = safeRoot(baselineRoot, 'Translation target baseline')
  if (repository === baseline || repository.startsWith(`${baseline}${path.sep}`) || baseline.startsWith(`${repository}${path.sep}`)) {
    throw new Error('Translation repository and target baseline must not overlap')
  }
  const copyTree = dependencies.copyTree || ((source, destination, options) => fs.cpSync(source, destination, options))
  const rename = dependencies.rename || ((source, destination) => fs.renameSync(source, destination))
  const ownedPaths = canonicalizeOwnedPaths(translationOwnedPaths(target, getContentGroup(group)))
  const operations = ownedPaths.map((relative, index) => {
    const source = safeRelative(baseline, relative, 'Translation baseline path')
    const destination = safeRelative(repository, relative, 'Translation destination path')
    const label = `Translation baseline ${relative}`
    validateRegularTree(source, label)
    assertDestinationChain(repository, destination, label)
    validateRegularTree(destination, `Translation destination ${relative}`)
    return {relative, source, destination, exists: fs.existsSync(source), index}
  })
  const transaction = fs.mkdtempSync(path.join(path.dirname(repository), `.${path.basename(repository)}.translation-baseline-`))
  const stagedRoot = path.join(transaction, 'staged')
  const backupRoot = path.join(transaction, 'backup')
  const committed = []
  const createdParents = []
  const materialized = []
  const removed = []
  try {
    fs.mkdirSync(stagedRoot)
    fs.mkdirSync(backupRoot)
    for (const operation of operations) {
      if (!operation.exists) continue
      operation.staged = path.join(stagedRoot, String(operation.index).padStart(4, '0'))
      copyTree(operation.source, operation.staged, {recursive: true, dereference: false, errorOnExist: true})
      validateRegularTree(operation.staged, `Staged Translation baseline ${operation.relative}`)
    }
    for (const operation of operations) {
      const record = {operation, backupMoved: false, stagedMoved: false}
      committed.push(record)
      createParentDirectories(repository, operation.destination, createdParents)
      if (fs.existsSync(operation.destination)) {
        operation.backup = path.join(backupRoot, String(operation.index).padStart(4, '0'))
        rename(operation.destination, operation.backup)
        record.backupMoved = true
      }
      if (operation.exists) {
        rename(operation.staged, operation.destination)
        record.stagedMoved = true
        materialized.push(operation.relative)
      } else {
        removed.push(operation.relative)
      }
    }
  } catch (error) {
    for (const record of [...committed].reverse()) {
      if (record.stagedMoved && fs.existsSync(record.operation.destination)) {
        fs.rmSync(record.operation.destination, {recursive: true, force: true})
      }
      if (record.backupMoved && fs.existsSync(record.operation.backup)) rename(record.operation.backup, record.operation.destination)
    }
    removeCreatedParents(createdParents)
    throw error
  } finally {
    fs.rmSync(transaction, {recursive: true, force: true})
  }
  return Object.freeze({target, group, materialized: Object.freeze(materialized), removed: Object.freeze(removed)})
}

function parseArgs(argv) {
  const allowed = new Set(['--repository', '--baseline', '--target', '--group'])
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || values.has(flag)) throw new Error('materialize-translation-baseline arguments are invalid')
    values.set(flag, value)
  }
  for (const flag of allowed) if (!values.get(flag)) throw new Error(`${flag} is required`)
  return values
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const result = materializeTranslationBaseline({
    repositoryRoot: args.get('--repository'),
    baselineRoot: args.get('--baseline'),
    target: args.get('--target'),
    group: args.get('--group'),
  })
  process.stdout.write(`${JSON.stringify(result)}\n`)
  return result
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {materializeTranslationBaseline, parseArgs}
