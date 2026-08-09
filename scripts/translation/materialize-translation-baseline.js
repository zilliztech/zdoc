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
  if (!fs.existsSync(target)) return
  const stat = fs.lstatSync(target)
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
    if (!fs.existsSync(current)) break
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} has an unsafe destination ancestor`)
  }
}

function copyExact(source, destination, repositoryRoot, label) {
  validateRegularTree(source, label)
  assertDestinationChain(repositoryRoot, destination, label)
  fs.rmSync(destination, {recursive: true, force: true})
  if (!fs.existsSync(source)) return false
  fs.mkdirSync(path.dirname(destination), {recursive: true})
  fs.cpSync(source, destination, {recursive: true, dereference: false, errorOnExist: true})
  validateRegularTree(destination, label)
  return true
}

function materializeTranslationBaseline({repositoryRoot, baselineRoot, target, group}) {
  const repository = safeRoot(repositoryRoot, 'Translation repository')
  const baseline = safeRoot(baselineRoot, 'Translation target baseline')
  if (repository === baseline || repository.startsWith(`${baseline}${path.sep}`) || baseline.startsWith(`${repository}${path.sep}`)) {
    throw new Error('Translation repository and target baseline must not overlap')
  }
  const ownedPaths = translationOwnedPaths(target, getContentGroup(group))
  const materialized = []
  const removed = []
  for (const relative of ownedPaths) {
    const source = safeRelative(baseline, relative, 'Translation baseline path')
    const destination = safeRelative(repository, relative, 'Translation destination path')
    if (copyExact(source, destination, repository, `Translation baseline ${relative}`)) materialized.push(relative)
    else removed.push(relative)
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
