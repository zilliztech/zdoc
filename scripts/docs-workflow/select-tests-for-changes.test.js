'use strict'

const assert = require('node:assert/strict')
const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {branchPolicy, changedFilesBetween, loadMatrix, loadOwnershipContract, matchesPattern, normalizeRepositoryPath, resolveCommit, selectTests} = require('./select-tests-for-changes')

const repositoryRoot = path.resolve(__dirname, '../..')

function patternHasMatch(pattern) {
  if (pattern.endsWith('/**')) return fs.existsSync(path.join(repositoryRoot, pattern.slice(0, -3)))
  if (!pattern.endsWith('*')) return fs.existsSync(path.join(repositoryRoot, pattern))
  const prefix = pattern.slice(0, -1)
  const directory = path.dirname(prefix)
  const basename = path.basename(prefix)
  const absoluteDirectory = path.join(repositoryRoot, directory)
  return fs.existsSync(absoluteDirectory) && fs.readdirSync(absoluteDirectory).some(entry => entry.startsWith(basename))
}

test('matrix entries have unique identities, existing path roots, and nonempty reasons', () => {
  const matrix = loadMatrix()
  const ownership = loadOwnershipContract()
  const packageScripts = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8')).scripts
  assert.equal(new Set(matrix.entries.map(entry => entry.id)).size, matrix.entries.length)
  for (const entry of matrix.entries) {
    assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
    assert.equal(typeof entry.reason === 'string' && entry.reason.length > 0, true, entry.id)
    assert.equal(Array.isArray(entry.paths) && entry.paths.length > 0, true, entry.id)
    for (const pattern of entry.paths) {
      const declaredRoot = pattern.replace(/(?:\/\*\*|\*)$/u, '')
      const declaredByOwnership = ownership.devOwnedPaths.includes(declaredRoot) || ownership.masterAuthoritativePaths.includes(declaredRoot)
      assert.equal(patternHasMatch(pattern) || declaredByOwnership, true, `${entry.id}: ${pattern}`)
    }
    for (const key of ['focusedTests', 'harnesses', 'gates']) assert.equal(Array.isArray(entry[key]), true, `${entry.id}: ${key}`)
    for (const command of [...entry.focusedTests, ...entry.harnesses, ...entry.gates]) {
      const packageScript = /^pnpm (?:run )?(test:[A-Za-z0-9:-]+)$/u.exec(command)?.[1]
      if (packageScript) assert.equal(typeof packageScripts[packageScript], 'string', `${entry.id}: ${packageScript}`)
      for (const match of command.matchAll(/[A-Za-z0-9_./-]+\.test\.(?:js|mjs)/gu)) {
        assert.equal(fs.existsSync(path.join(repositoryRoot, match[0])), true, `${entry.id}: ${match[0]}`)
      }
    }
  }
})

test('path matching supports exact, prefix-star, and recursive directory entries', () => {
  assert.equal(matchesPattern('.github/workflows/fetch-docs.yml', '.github/workflows/**'), true)
  assert.equal(matchesPattern('scripts/docs-workflow/publication-contracts.test.js', 'scripts/docs-workflow/publication-contracts*'), true)
  assert.equal(matchesPattern('scripts/docs-workflow/publication-scheduler.js', 'scripts/docs-workflow/publication-contracts*'), false)
  assert.equal(matchesPattern('README.md', 'README.md'), true)
})

test('branch policy derives master, dev, preserved exceptions, and candidate-derived ownership from the sync contract', () => {
  const contract = loadOwnershipContract()
  assert.deepEqual(branchPolicy('scripts/docs-workflow/publication-contracts.js', contract), {
    file: 'scripts/docs-workflow/publication-contracts.js', owner: 'master-tooling', targetBranch: 'master',
    rule: 'Modify through a reviewed master PR, then promote with master-to-dev tooling sync when production needs it.',
  })
  assert.equal(branchPolicy('content/en/reference/api/python/generated.md', contract).owner, 'dev-published-state')
  assert.equal(branchPolicy('content/en/reference/api/python/python/python.md', contract).owner, 'master-authoritative-exception')
  assert.equal(branchPolicy('deploy/contracts/localization-inputs.inventory.json', contract).owner, 'sync-candidate-derived')
})

test('selector maps shared contracts and recovery changes to focused, replay, and policy commands', () => {
  const selected = selectTests([
    'scripts/docs-workflow/publication-contracts.js',
    'scripts/docs-workflow/translation-recovery-planner.js',
  ])
  assert.deepEqual(selected.areas.map(area => area.id), [
    'shared-publication-contracts',
    'translation-recovery',
  ])
  assert.deepEqual(selected.branchPolicies.map(policy => policy.targetBranch), ['master', 'master'])
  for (const command of ['pnpm test:replay:all', 'pnpm test:translation', 'pnpm test:workflow-policy', 'git diff --check']) {
    assert.equal(selected.commands.includes(command), true, command)
  }
  assert.equal(selected.commands.includes('pnpm test:replay:recovery'), false)
})

test('workflow and replay infrastructure changes select structural and aggregate gates', () => {
  const selected = selectTests(['.github/workflows/replay-tests.yml', 'package.json'])
  assert.deepEqual(selected.areas.map(area => area.id), ['workflow-yaml', 'replay-infrastructure'])
  assert.equal(selected.commands.includes('pnpm test:replay:all'), true)
  assert.equal(selected.commands.includes('node --test deploy/contracts/fetch-translation-workflow.test.mjs deploy/contracts/site-validation-workflow.test.mjs deploy/contracts/master-tooling-sync-workflow.test.mjs'), true)
})

test('selector rejects unsafe or unmapped paths so matrix gaps cannot pass silently', () => {
  for (const value of ['/tmp/file', '../escape', 'scripts\\file.js']) assert.throws(() => normalizeRepositoryPath(value), /repository-relative|normalized/u)
  assert.throws(() => selectTests(['unmapped/new-pipeline.js']), /no entry/u)
  assert.throws(() => selectTests([]), /At least one/u)
})

test('CLI accepts the pnpm argument separator and emits the selected command plan', () => {
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'select-tests-for-changes.js'),
    '--',
    'scripts/docs-workflow/translation-recovery-planner.js',
  ], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /translation-recovery/u)
  assert.match(result.stdout, /pnpm test:replay:recovery/u)
})

test('Git affected-file mode resolves immutable commits without shell interpolation', () => {
  const head = resolveCommit('HEAD', repositoryRoot)
  assert.match(head, /^[0-9a-f]{40}$/u)
  assert.deepEqual(changedFilesBetween(head, head, repositoryRoot), [])
  assert.throws(() => resolveCommit('--upload-pack=unsafe', repositoryRoot), /unsafe/u)
})
