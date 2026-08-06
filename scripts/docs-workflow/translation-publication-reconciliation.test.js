'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {reconcileTranslationPublication} = require('./translation-publication-reconciliation')

function git(repository, args) {
  const value = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(value.status, 0, value.stderr)
  return value.stdout.trim()
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-reconciliation-'))
  const remote = path.join(root, 'remote.git')
  const repository = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  git(root, ['init', '--bare', remote])
  git(root, ['clone', remote, repository])
  git(repository, ['switch', '-c', 'dev'])
  git(repository, ['config', 'user.email', 'translation-reconciliation@example.com'])
  git(repository, ['config', 'user.name', 'Translation Reconciliation Test'])
  fs.mkdirSync(path.join(repository, 'deploy/contracts'), {recursive: true})
  fs.mkdirSync(path.join(repository, 'generated/zh-CN/sidebars'), {recursive: true})
  fs.mkdirSync(path.join(repository, 'generated/zh-CN/manifests'), {recursive: true})
  fs.mkdirSync(path.join(repository, 'scripts'), {recursive: true})
  fs.writeFileSync(path.join(repository, 'deploy/contracts/localization-inputs.inventory.json'), '{"version":1}\n')
  fs.writeFileSync(path.join(repository, 'generated/zh-CN/sidebars/python.sidebar.js'), 'module.exports = ["old"]\n')
  fs.writeFileSync(path.join(repository, 'generated/zh-CN/manifests/reference-translations.json'), `${JSON.stringify({
    schemaVersion: 1,
    records: [{manual: 'python', sourcePath: 'content/en/reference/a.md', targetPath: 'content/zh-CN/reference/a.md', sourceCommit: 'c'.repeat(40)}],
  }, null, 2)}\n`)
  fs.writeFileSync(path.join(repository, 'scripts/restore-generated-state.sh'), '#!/usr/bin/env bash\nexit 0\n')
  fs.chmodSync(path.join(repository, 'scripts/restore-generated-state.sh'), 0o755)
  git(repository, ['add', '--all'])
  git(repository, ['commit', '-m', 'baseline'])
  git(repository, ['push', '-u', 'origin', 'dev'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return {root, remote, repository, runnerTemp, baseline}
}

function selection(baseline, units) {
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: 77,
    runAttempt: 1,
    toolingSha: baseline,
    targetBranch: 'dev',
    initialTargetSha: baseline,
    sourceBaselineSha: baseline,
    inputs: {selectedGroup: units[0].group, publish: true, runTranslations: true},
    units,
  })
}

function unit(baseline, target = 'zh-CN-reference', group = 'python') {
  return {
    unitKey: `translation/${target}/${group}`,
    producerJob: `translate:${target}/${group}`,
    strategy: 'checkpoint',
    target,
    group,
    sourceGroup: group,
    toolingSha: baseline,
    sourceBaselineSha: baseline,
    sourceCheckpointSha: 'c'.repeat(40),
    targetBranch: 'dev',
    artifacts: {checkpoint: `checkpoint-${target}-${group}`, baseline: `baseline-${target}-${group}`},
    commitMessage: `publish ${target} ${group}`,
    validationCommands: [`validate ${target} ${group}`],
    environment: target === 'zh-CN-reference' ? {ZDOC_SITE: 'zh-CN'} : {},
  }
}

function results(selected, baseline, overrides = {}) {
  const units = selected.units.map((selectedUnit, index) => ({
    unitKey: selectedUnit.unitKey,
    producerJobId: index + 1,
    producerCompletedAt: `2026-08-05T08:00:0${index}.000Z`,
    readyAt: `2026-08-05T08:01:0${index}.000Z`,
    sequence: index + 1,
    publishStartedAt: `2026-08-05T08:02:0${index}.000Z`,
    publishCompletedAt: `2026-08-05T08:03:0${index}.000Z`,
    baseSha: baseline,
    resultSha: baseline,
    commitShas: [],
    attempts: 1,
    status: 'no_changes',
    failure: null,
  }))
  return validatePublicationResults({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: 'dev',
    initialTargetSha: baseline,
    finalTargetSha: overrides.finalTargetSha || baseline,
    startedAt: '2026-08-05T08:00:00.000Z',
    completedAt: '2026-08-05T09:00:00.000Z',
    overallStatus: 'success',
    units,
    orchestratorFailure: null,
  }, {selection: selected})
}

function deterministicCommands(calls, options = {}) {
  return ({cwd, executable, args}) => {
    calls.push([executable, ...args].join(' '))
    if (executable === 'pnpm' && args[0] === 'generate:localization-input-inventory') {
      fs.writeFileSync(path.join(cwd, 'deploy/contracts/localization-inputs.inventory.json'), '{"version":2}\n')
      if (options.writeUnexpected) {
        fs.writeFileSync(path.join(cwd, 'unexpected.txt'), 'not allowed\n')
        if (options.stageUnexpected) git(cwd, ['add', 'unexpected.txt'])
      }
    }
    if (executable === 'pnpm' && args[1] === 'reference-sidebar') {
      const group = args[args.indexOf('--group') + 1]
      const sidebar = group === 'rest' ? 'restful' : group
      fs.writeFileSync(path.join(cwd, `generated/zh-CN/sidebars/${sidebar}.sidebar.js`), `module.exports = [${JSON.stringify(group)}]\n`)
    }
    return {status: 0, stdout: '', stderr: ''}
  }
}

test('reconciles inventory and only successful Chinese Reference sidebars in one CAS commit', async t => {
  const setup = fixture(t)
  const selected = selection(setup.baseline, [unit(setup.baseline)])
  const published = results(selected, setup.baseline)
  const calls = []
  const reconciled = await reconcileTranslationPublication({
    selection: selected,
    results: published,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicCommands(calls)}},
  })

  assert.equal(reconciled.status, 'published')
  assert.equal(reconciled.commitShas.length, 1)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], reconciled.resultSha)
  assert.deepEqual(calls.filter(command => !command.startsWith('bash ')), [
    'pnpm generate:localization-input-inventory',
    'pnpm check:localization-input-inventory',
    'pnpm docs-tooling reference-sidebar --group python --write',
    'pnpm docs-tooling validate-reference --site zh-CN',
    'pnpm docs-tooling validate-revision-inventory --site en',
  ])
  assert.doesNotMatch(calls.join('\n'), /reference-manifest/)
  const manifest = JSON.parse(git(setup.repository, ['show', `${reconciled.resultSha}:generated/zh-CN/manifests/reference-translations.json`]))
  assert.equal(manifest.records[0].sourceCommit, 'c'.repeat(40))
  assert.deepEqual(git(setup.repository, ['diff-tree', '--no-commit-id', '--name-only', '-r', reconciled.resultSha]).split('\n').sort(), [
    'deploy/contracts/localization-inputs.inventory.json',
    'generated/zh-CN/sidebars/python.sidebar.js',
  ])

  const second = await reconcileTranslationPublication({
    selection: selected,
    results: results(selected, setup.baseline, {finalTargetSha: reconciled.resultSha}),
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicCommands([])}},
  })
  assert.equal(second.status, 'no_changes')
  assert.equal(second.resultSha, reconciled.resultSha)
})

test('Japanese-only reconciliation skips Reference sidebar generation but keeps inventory validation semantics', async t => {
  const setup = fixture(t)
  const selected = selection(setup.baseline, [unit(setup.baseline, 'ja-JP')])
  const calls = []
  const reconciled = await reconcileTranslationPublication({
    selection: selected,
    results: results(selected, setup.baseline),
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicCommands(calls)}},
  })
  assert.equal(reconciled.status, 'published')
  assert.equal(calls.some(command => command.includes('reference-sidebar')), false)
  assert.deepEqual(calls.filter(command => !command.startsWith('bash ')), [
    'pnpm generate:localization-input-inventory',
    'pnpm check:localization-input-inventory',
    'pnpm docs-tooling validate-reference --site zh-CN',
    'pnpm docs-tooling validate-revision-inventory --site en',
  ])
})

test('rejects any reconciliation write outside the inventory and applicable sidebar allowlist', async t => {
  const setup = fixture(t)
  const selected = selection(setup.baseline, [unit(setup.baseline)])
  const reconciled = await reconcileTranslationPublication({
    selection: selected,
    results: results(selected, setup.baseline),
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicCommands([], {writeUnexpected: true})}},
  })
  assert.equal(reconciled.status, 'publish_failed')
  assert.match(reconciled.failure.message, /unexpected\.txt|allowed/i)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
})

test('rejects unexpected paths even when a command stages them', async t => {
  const setup = fixture(t)
  const selected = selection(setup.baseline, [unit(setup.baseline)])
  const reconciled = await reconcileTranslationPublication({
    selection: selected,
    results: results(selected, setup.baseline),
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicCommands([], {
      writeUnexpected: true,
      stageUnexpected: true,
    })}},
  })
  assert.equal(reconciled.status, 'publish_failed')
  assert.match(reconciled.failure.message, /unexpected\.txt|allowed/i)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
})
