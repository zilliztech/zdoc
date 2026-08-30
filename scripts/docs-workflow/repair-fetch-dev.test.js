'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {repairFetchDev, MANIFEST_PATHS, INVENTORY_PATH, sidebarPaths, validateGroups} = require('./repair-fetch-dev')

const REPAIR_PATHS = [INVENTORY_PATH, ...MANIFEST_PATHS, ...sidebarPaths()]

function git(repository, args, options = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  if (!options.allowFailure) assert.equal(result.status, 0, result.stderr)
  return options.result ? result : result.stdout.trim()
}

function transactionFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repair-fetch-dev-'))
  const remote = path.join(root, 'remote.git')
  const repository = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  git(root, ['init', '--bare', remote])
  git(root, ['clone', remote, repository])
  git(repository, ['switch', '-c', 'dev'])
  git(repository, ['config', 'user.email', 'repair-fetch-dev@example.com'])
  git(repository, ['config', 'user.name', 'Repair Fetch Dev Test'])
  for (const relative of [...MANIFEST_PATHS, ...sidebarPaths().filter(p => p.includes('python') || p.includes('java')), 'scripts/restore-generated-state.sh']) {
    const absolute = path.join(repository, relative)
    fs.mkdirSync(path.dirname(absolute), {recursive: true})
    fs.writeFileSync(absolute, relative.endsWith('.json') ? '{"version":0}\n' : `${relative}\n`)
  }
  // A stale inventory: repair must overwrite it with the regenerated state.
  fs.mkdirSync(path.dirname(path.join(repository, INVENTORY_PATH)), {recursive: true})
  fs.writeFileSync(path.join(repository, INVENTORY_PATH), '{"version": 0, "stale": true}\n')
  fs.chmodSync(path.join(repository, 'scripts/restore-generated-state.sh'), 0o755)
  git(repository, ['add', '--all'])
  git(repository, ['commit', '-m', 'baseline'])
  git(repository, ['push', '-u', 'origin', 'dev'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return {root, remote, repository, runnerTemp, baseline}
}

function deterministicRepairCommands(calls, options = {}) {
  return ({cwd, executable, args}) => {
    calls.push({cwd, executable, args: [...args]})
    if (executable === 'bash' && args[0].endsWith('restore-generated-state.sh')) {
      const ref = args[args.indexOf('--ref') + 1]
      for (const relative of REPAIR_PATHS) {
        const shown = git(cwd, ['show', `${ref}:${relative}`], {result: true, allowFailure: true})
        if (shown.status === 0) fs.writeFileSync(path.join(cwd, relative), shown.stdout)
      }
      return {status: 0, stdout: '', stderr: ''}
    }
    if (executable === 'pnpm' && args[0] === 'generate:localization-input-inventory') {
      fs.writeFileSync(path.join(cwd, INVENTORY_PATH), '{"version":1,"repaired":true}\n')
      return {status: 0, stdout: '', stderr: ''}
    }
    if (executable === 'pnpm' && args[1] === 'reference-manifest') {
      for (const relative of [...MANIFEST_PATHS, ...sidebarPaths()]) {
        fs.writeFileSync(path.join(cwd, relative), `${relative} repaired\n`)
      }
      if (options.extraGeneratedPath) fs.writeFileSync(path.join(cwd, options.extraGeneratedPath), 'unauthorized\n')
      return {status: 0, stdout: '', stderr: ''}
    }
    if (executable === 'pnpm' && args[0] === 'check:localization-input-inventory') {
      if (options.inventoryCheckFailure) throw new Error('injected inventory check failure')
      return {status: 0, stdout: '', stderr: ''}
    }
    if (executable === 'pnpm' && args[1] === 'validate-reference') {
      if (options.validationFailure) throw new Error('injected validate-reference failure')
      return {status: 0, stdout: '', stderr: ''}
    }
    if (executable === 'pnpm' && args[1] === 'validate-revision-inventory') {
      return {status: 0, stdout: '', stderr: ''}
    }
    throw new Error(`unexpected repair command: ${executable} ${args.join(' ')}`)
  }
}

function assertNoRepairWorktrees(setup) {
  const worktrees = git(setup.repository, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter(line => line.startsWith('worktree '))
    .map(line => fs.realpathSync(line.slice('worktree '.length)))
  assert.deepEqual(worktrees, [fs.realpathSync(setup.repository)])
  assert.deepEqual(fs.readdirSync(setup.runnerTemp), [])
}

test('repair regenerates inventory, manifests, and every reference sidebar in one reconcile commit', async t => {
  const setup = transactionFixture(t)
  const calls = []
  const outcome = await repairFetchDev({
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    groups: 'all',
    transactionContext: {dependencies: {toolingSha: setup.baseline, runCommand: deterministicRepairCommands(calls)}},
  })

  assert.equal(outcome.status, 'published')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], outcome.resultSha)
  assert.deepEqual(
    git(setup.repository, ['diff-tree', '--no-commit-id', '--name-only', '-r', outcome.resultSha]).split('\n').sort(),
    [...REPAIR_PATHS].sort(),
  )
  assert.equal(git(setup.repository, ['log', '-1', '--pretty=%s', outcome.resultSha]), 'chore(i18n): reconcile Fetch Reference state')
  assert.equal(git(setup.repository, ['log', '-1', '--pretty=%b', outcome.resultSha]).trim(), `sourceSha: ${setup.baseline}`)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'reference-manifest').length, 1)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[0] === 'check:localization-input-inventory').length, 1)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'validate-reference').length, 1)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'validate-revision-inventory').length, 1)
  assertNoRepairWorktrees(setup)
})

test('repair is a no_changes pass when derived state is already current', async t => {
  const setup = transactionFixture(t)
  const outcome = await repairFetchDev({
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    groups: 'all',
    transactionContext: {dependencies: {
      toolingSha: setup.baseline,
      runCommand: ({cwd, executable, args}) => {
        if (executable === 'bash' && args[0].endsWith('restore-generated-state.sh')) return {status: 0, stdout: '', stderr: ''}
        return {status: 0, stdout: '', stderr: ''}
      },
    }},
  })

  assert.equal(outcome.status, 'no_changes')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
  assertNoRepairWorktrees(setup)
})

test('repair fails closed when generation touches a path outside the allowlist', async t => {
  const setup = transactionFixture(t)
  const outcome = await repairFetchDev({
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    groups: 'all',
    transactionContext: {dependencies: {
      toolingSha: setup.baseline,
      runCommand: deterministicRepairCommands([], {extraGeneratedPath: 'generated/en/sidebars/unauthorized.sidebar.js'}),
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.failure.code, 'COMPOSITION_FAILED')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
  assertNoRepairWorktrees(setup)
})

test('repair validates before pushing and leaves the remote tip untouched when validation fails', async t => {
  const setup = transactionFixture(t)
  const outcome = await repairFetchDev({
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    groups: 'all',
    transactionContext: {dependencies: {
      toolingSha: setup.baseline,
      runCommand: deterministicRepairCommands([], {validationFailure: true}),
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.failure.code, 'VALIDATION_FAILED')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
  assertNoRepairWorktrees(setup)
})

test('repair links workspace dependencies into the stage-2 validation worktree', async t => {
  const setup = transactionFixture(t)
  // The validation worktree is a fresh checkout with no node_modules; the
  // repair must symlink the installed workspace dependencies (jiti loader
  // included) into it or every `pnpm` validation command fails with
  // MODULE_NOT_FOUND before it can check anything.
  const repositoryNodeModules = path.join(setup.repository, 'node_modules')
  fs.mkdirSync(path.join(repositoryNodeModules, 'jiti'), {recursive: true})
  fs.writeFileSync(path.join(repositoryNodeModules, 'jiti', 'package.json'), '{"name":"jiti"}\n')
  let validationWorktree = null
  let linkedJitiVerified = false
  const outcome = await repairFetchDev({
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    groups: 'all',
    transactionContext: {dependencies: {
      toolingSha: setup.baseline,
      runCommand: ({cwd, executable, args}) => {
        if (executable === 'pnpm' &&
            (args[0] === 'check:localization-input-inventory' || args[1] === 'validate-reference' || args[1] === 'validate-revision-inventory')) {
          validationWorktree = cwd
          if (!linkedJitiVerified) {
            // The worktree is a fresh checkout; without the dependency link the
            // jiti loader is unresolvable and every validation command fails.
            assert.equal(fs.realpathSync(path.join(cwd, 'node_modules', 'jiti')),
              fs.realpathSync(path.join(setup.repository, 'node_modules', 'jiti')),
              `validation worktree ${cwd} jiti is not linked to the installed package`)
            linkedJitiVerified = true
          }
        }
        return deterministicRepairCommands([])({cwd, executable, args})
      },
    }},
  })

  assert.equal(outcome.status, 'published')
  assert.ok(linkedJitiVerified, 'expected a stage-2 validation command to run in the linked worktree')
  assert.ok(validationWorktree, 'expected a stage-2 validation worktree')
  assertNoRepairWorktrees(setup)
})

test('repair rejects unknown groups before any git write', () => {
  assert.throws(() => validateGroups('bogus'), /Unknown publication group: bogus/)
})

test('repair CLI writes terminal GitHub outputs for the published result', async t => {
  const setup = transactionFixture(t)
  const outputFile = path.join(setup.root, 'github-output')
  const outcome = await require('./repair-fetch-dev').main([
    'repair', '--repository-root', setup.repository, '--runner-temp', setup.runnerTemp, '--groups', 'all', '--remote', 'origin',
  ], {...process.env, TOOLING_SHA: setup.baseline, GITHUB_OUTPUT: outputFile}, {
    runCommand: deterministicRepairCommands([]),
  })

  assert.equal(outcome.status, 'published')
  assert.equal(fs.readFileSync(outputFile, 'utf8'), `status=${outcome.status}\nfinal_target_sha=${outcome.resultSha}\n`)
})
