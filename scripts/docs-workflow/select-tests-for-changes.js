#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const MATRIX_FILE = path.join(__dirname, 'test-matrix.json')
const OWNERSHIP_FILE = path.resolve(__dirname, '../../deploy/contracts/master-tooling-sync.json')
const REPOSITORY_ROOT = path.resolve(__dirname, '../..')

function normalizeRepositoryPath(value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || /[\\\0\r\n]/u.test(value)) {
    throw new Error(`Changed path must be repository-relative: ${value}`)
  }
  const normalized = path.posix.normalize(value)
  if (normalized !== value || normalized === '.' || normalized.startsWith('../')) {
    throw new Error(`Changed path must be normalized and repository-relative: ${value}`)
  }
  return normalized
}

function matchesPattern(file, pattern) {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3)
    return file === prefix || file.startsWith(`${prefix}/`)
  }
  if (pattern.endsWith('*')) return file.startsWith(pattern.slice(0, -1))
  return file === pattern
}

function loadMatrix(file = MATRIX_FILE) {
  const matrix = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (matrix.schemaVersion !== 1 || !Array.isArray(matrix.entries) || matrix.entries.length === 0) {
    throw new Error('Workflow test matrix is invalid')
  }
  return matrix
}

function loadOwnershipContract(file = OWNERSHIP_FILE) {
  const contract = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (contract.schemaVersion !== 1 || !Array.isArray(contract.devOwnedPaths) ||
      !Array.isArray(contract.masterAuthoritativePaths) || !Array.isArray(contract.candidateDerivedPaths)) {
    throw new Error('Master/dev ownership contract is invalid')
  }
  return contract
}

function pathMatchesRoot(file, root) {
  return file === root || file.startsWith(`${root}/`)
}

function branchPolicy(file, contract = loadOwnershipContract()) {
  const normalized = normalizeRepositoryPath(file)
  if (contract.candidateDerivedPaths.some(candidate => normalized === candidate)) {
    return Object.freeze({file: normalized, owner: 'sync-candidate-derived', targetBranch: 'dev', rule: 'Regenerate in the validated master-to-dev sync candidate; do not hand-edit.'})
  }
  if (contract.masterAuthoritativePaths.some(root => pathMatchesRoot(normalized, root))) {
    return Object.freeze({file: normalized, owner: 'master-authoritative-exception', targetBranch: 'master', rule: 'Modify through a reviewed master PR, then use master-to-dev tooling sync.'})
  }
  if (contract.devOwnedPaths.some(root => pathMatchesRoot(normalized, root))) {
    return Object.freeze({file: normalized, owner: 'dev-published-state', targetBranch: 'dev', rule: 'Produced or reconciled by the serialized publication workflows; do not modify on master.'})
  }
  return Object.freeze({file: normalized, owner: 'master-tooling', targetBranch: 'master', rule: 'Modify through a reviewed master PR, then promote with master-to-dev tooling sync when production needs it.'})
}

function resolveCommit(reference, cwd = REPOSITORY_ROOT) {
  if (typeof reference !== 'string' || !reference || reference.startsWith('-') || /[\0\r\n]/u.test(reference)) {
    throw new Error(`Git reference is unsafe: ${reference}`)
  }
  return execFileSync('git', ['rev-parse', '--verify', `${reference}^{commit}`], {cwd, encoding: 'utf8'}).trim()
}

function changedFilesBetween(base, head, cwd = REPOSITORY_ROOT) {
  const baseSha = resolveCommit(base, cwd)
  const headSha = resolveCommit(head, cwd)
  const output = execFileSync('git', ['diff', '--name-only', '-z', '--no-renames', `${baseSha}...${headSha}`], {cwd})
  return output.toString('utf8').split('\0').filter(Boolean)
}

function selectTests(files, matrix = loadMatrix(), ownership = loadOwnershipContract()) {
  const normalizedFiles = [...new Set(files.map(normalizeRepositoryPath))]
  if (normalizedFiles.length === 0) throw new Error('At least one changed repository path is required')
  const entries = matrix.entries.filter(entry => normalizedFiles.some(file => entry.paths.some(pattern => matchesPattern(file, pattern))))
  const unmatchedFiles = normalizedFiles.filter(file => !entries.some(entry => entry.paths.some(pattern => matchesPattern(file, pattern))))
  if (unmatchedFiles.length) throw new Error(`Workflow test matrix has no entry for: ${unmatchedFiles.join(', ')}`)
  const collect = key => [...new Set(entries.flatMap(entry => entry[key] || []))]
  const focusedTests = collect('focusedTests')
  const harnesses = collect('harnesses')
  const gates = collect('gates')
  const effectiveHarnesses = harnesses.includes('pnpm test:replay:all') ? ['pnpm test:replay:all'] : harnesses
  return Object.freeze({
    files: Object.freeze(normalizedFiles),
    branchPolicies: Object.freeze(normalizedFiles.map(file => branchPolicy(file, ownership))),
    areas: Object.freeze(entries.map(entry => Object.freeze({id: entry.id, reason: entry.reason}))),
    focusedTests: Object.freeze(focusedTests),
    harnesses: Object.freeze(effectiveHarnesses),
    gates: Object.freeze(gates),
    commands: Object.freeze([...new Set([...focusedTests, ...effectiveHarnesses, ...gates, 'git diff --check'])]),
  })
}

function main(argv = process.argv.slice(2)) {
  const args = argv.filter(value => value !== '--')
  const jsonIndex = args.indexOf('--json')
  const json = jsonIndex !== -1
  if (json) args.splice(jsonIndex, 1)
  const baseIndex = args.indexOf('--base')
  const headIndex = args.indexOf('--head')
  let files
  if (baseIndex !== -1 || headIndex !== -1) {
    if (baseIndex === -1 || headIndex === -1 || !args[baseIndex + 1] || !args[headIndex + 1]) throw new Error('--base and --head must be provided together')
    const consumed = new Set([baseIndex, baseIndex + 1, headIndex, headIndex + 1])
    if (args.some((_value, index) => !consumed.has(index))) throw new Error('Do not mix explicit paths with --base/--head')
    files = changedFilesBetween(args[baseIndex + 1], args[headIndex + 1])
  } else files = args
  const selected = selectTests(files)
  if (json) {
    process.stdout.write(`${JSON.stringify(selected, null, 2)}\n`)
    return selected
  }
  process.stdout.write(`Branch ownership:\n${selected.branchPolicies.map(policy => `- ${policy.file}: ${policy.owner} -> ${policy.targetBranch}; ${policy.rule}`).join('\n')}\n\n`)
  process.stdout.write(`Matched areas:\n${selected.areas.map(area => `- ${area.id}: ${area.reason}`).join('\n')}\n\n`)
  process.stdout.write(`Run in order:\n${selected.commands.map(command => `- ${command}`).join('\n')}\n`)
  return selected
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {branchPolicy, changedFilesBetween, loadMatrix, loadOwnershipContract, matchesPattern, normalizeRepositoryPath, resolveCommit, selectTests}
