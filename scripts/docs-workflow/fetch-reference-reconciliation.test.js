'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {planFetchReferenceReconciliation, reconcileFetchReferencePublication} = require('./fetch-reference-reconciliation')

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/run-30996821699-node-reference.json'), 'utf8'))
const partialFixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/run-31587351048-fetch-partial-reference.json'), 'utf8'))
const retirementRegistry = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/reference-retirements.json'), 'utf8'))
const MANIFEST_PATHS = [
  'generated/en/manifests/reference.json',
  'generated/zh-CN/manifests/reference-translations.json',
]

function sidebarPaths(group) {
  const file = group === 'rest' ? 'restful' : group
  return [`generated/en/sidebars/${file}.sidebar.js`, `generated/zh-CN/sidebars/${file}.sidebar.js`]
}

function git(repository, args, options = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  if (!options.allowFailure) assert.equal(result.status, 0, result.stderr)
  return options.result ? result : result.stdout.trim()
}

function transactionFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-reference-transaction-'))
  const remote = path.join(root, 'remote.git')
  const repository = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  git(root, ['init', '--bare', remote])
  git(root, ['clone', remote, repository])
  git(repository, ['switch', '-c', 'dev'])
  git(repository, ['config', 'user.email', 'fetch-reconciliation@example.com'])
  git(repository, ['config', 'user.name', 'Fetch Reconciliation Test'])
  for (const relative of [
    ...MANIFEST_PATHS,
    ...sidebarPaths('python'),
    ...sidebarPaths('java'),
    'scripts/restore-generated-state.sh',
  ]) {
    const absolute = path.join(repository, relative)
    fs.mkdirSync(path.dirname(absolute), {recursive: true})
    fs.writeFileSync(absolute, relative.endsWith('.json') ? '{"version":1}\n' : `${relative}\n`)
  }
  fs.chmodSync(path.join(repository, 'scripts/restore-generated-state.sh'), 0o755)
  git(repository, ['add', '--all'])
  git(repository, ['commit', '-m', 'baseline'])
  git(repository, ['push', '-u', 'origin', 'dev'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  return {root, remote, repository, runnerTemp, baseline}
}

function transactionDocuments(baseline, statuses = {python: 'no_changes', java: 'producer_failed'}) {
  const canonicalGroups = ['java', 'node', 'go', 'cli', 'rest', 'python']
  const groups = canonicalGroups.filter(group => Object.hasOwn(statuses, group))
  const units = groups.map(group => ({
    unitKey: `source/${group}`,
    producerJob: `produce_${group}`,
    strategy: 'checkpoint',
    site: 'en',
    group,
    translationSourceGroup: group,
    toolingSha: baseline,
    sourceBaselineSha: baseline,
    targetBranch: 'dev',
    artifacts: {checkpoint: `checkpoint-${group}`, baseline: null},
    commitMessage: `publish ${group}`,
    validationCommands: ['node validate.js'],
    environment: {ZDOC_SITE: 'en'},
  }))
  const selection = finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'fetch',
    repository: 'zilliztech/zdoc',
    runId: 31587351048,
    runAttempt: 1,
    toolingSha: baseline,
    targetBranch: 'dev',
    initialTargetSha: baseline,
    sourceBaselineSha: baseline,
    inputs: {selectedGroup: groups.length === 1 ? groups[0] : 'all', publish: true, runTranslations: false},
    units,
  })
  const resultUnits = units.map((unit, index) => {
    const status = statuses[unit.translationSourceGroup]
    const successful = ['published', 'no_changes'].includes(status)
    return {
      unitKey: unit.unitKey,
      producerJobId: index + 1,
      producerCompletedAt: `2026-08-12T01:00:0${index}.000Z`,
      readyAt: successful ? `2026-08-12T01:01:0${index}.000Z` : null,
      sequence: index + 1,
      publishStartedAt: successful ? `2026-08-12T01:02:0${index}.000Z` : null,
      publishCompletedAt: successful ? `2026-08-12T01:03:0${index}.000Z` : null,
      baseSha: successful ? baseline : null,
      resultSha: successful ? baseline : null,
      commitShas: [],
      attempts: successful ? 1 : 0,
      status,
      failure: successful ? null : {code: 'PRODUCER_FAILED', phase: 'produce', message: `${unit.unitKey} failed`, retryable: false},
    }
  })
  const overallStatus = resultUnits.every(unit => ['published', 'no_changes'].includes(unit.status)) ? 'success' : 'failure'
  const results = validatePublicationResults({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'fetch',
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    selectionSha256: selection.selectionSha256,
    mode: 'publish',
    targetBranch: 'dev',
    initialTargetSha: baseline,
    finalTargetSha: baseline,
    startedAt: '2026-08-12T01:00:00.000Z',
    completedAt: '2026-08-12T02:00:00.000Z',
    overallStatus,
    units: resultUnits,
    orchestratorFailure: null,
  }, {selection})
  return {selection, results}
}

function deterministicTransactionCommands(calls, options = {}) {
  return ({cwd, executable, args}) => {
    calls.push({cwd, executable, args: [...args]})
    if (executable === 'bash' && args[0].endsWith('restore-generated-state.sh')) {
      const ref = args[args.indexOf('--ref') + 1]
      for (const relative of [...MANIFEST_PATHS, ...sidebarPaths('python'), ...sidebarPaths('java')]) {
        const shown = git(cwd, ['show', `${ref}:${relative}`], {result: true, allowFailure: true})
        if (shown.status === 0) fs.writeFileSync(path.join(cwd, relative), shown.stdout)
      }
    }
    if (executable === 'pnpm' && args[1] === 'reference-manifest') {
      if (options.noGenerationChanges) return {status: 0, stdout: '', stderr: ''}
      const sourceSha = args[args.indexOf('--source-commit') + 1]
      for (const relative of [...MANIFEST_PATHS, ...sidebarPaths('python')]) {
        fs.writeFileSync(path.join(cwd, relative), `${relative} source=${sourceSha}\n`)
      }
      if (options.writeFailedGroup) {
        for (const relative of sidebarPaths('java')) fs.writeFileSync(path.join(cwd, relative), 'unauthorized failed group\n')
      }
    }
    if (executable === 'pnpm' && args[1] === 'validate-reference') {
      const candidateRestore = [...calls].reverse().find(call => call.executable === 'bash' && call.args.includes('--exact'))
      const candidateSha = candidateRestore?.args[candidateRestore.args.indexOf('--ref') + 1]
      assert.match(candidateSha || '', /^[0-9a-f]{40}$/)
      assert.equal(fs.readFileSync(path.join(cwd, MANIFEST_PATHS[0]), 'utf8').trim(), git(cwd, ['show', `${candidateSha}:${MANIFEST_PATHS[0]}`]))
      if (options.validationFailure || options.noChangesValidationFailure) throw new Error('injected exact candidate validation failure')
    }
    return {status: 0, stdout: '', stderr: ''}
  }
}

function advanceRemote(setup, message) {
  fs.appendFileSync(path.join(setup.repository, 'remote-advance.txt'), `${message}\n`)
  git(setup.repository, ['add', 'remote-advance.txt'])
  git(setup.repository, ['commit', '-m', message])
  git(setup.repository, ['push', 'origin', 'dev'])
  return git(setup.repository, ['rev-parse', 'HEAD'])
}

function rejectedPush(worktree) {
  const result = git(worktree, ['push', 'origin', 'HEAD:refs/heads/dev'], {result: true, allowFailure: true})
  assert.notEqual(result.status, 0)
  throw new Error(result.stderr.trim() || 'push rejected')
}

function assertNoFetchReconciliationWorktrees(setup) {
  const worktrees = git(setup.repository, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter(line => line.startsWith('worktree '))
    .map(line => fs.realpathSync(line.slice('worktree '.length)))
  assert.deepEqual(worktrees, [fs.realpathSync(setup.repository)])
  assert.deepEqual(fs.readdirSync(setup.runnerTemp), [])
}

test('run 31587351048 reconciles five published Reference units plus REST no_changes after Guides fail', () => {
  assert.equal(partialFixture.provenance.selectionArtifactId, 9137678806)
  assert.equal(partialFixture.provenance.resultsArtifactId, 9138354567)
  assert.equal(partialFixture.results.overallStatus, 'failure')
  assert.equal(partialFixture.results.orchestratorFailure, null)
  assert.deepEqual(
    partialFixture.results.units.filter(unit => unit.status === 'published').map(unit => unit.unitKey),
    ['source/java', 'source/node', 'source/go', 'source/cli', 'source/python'],
  )
  assert.deepEqual(
    partialFixture.results.units.filter(unit => unit.status === 'producer_failed').map(unit => unit.unitKey),
    ['source/guides-en', 'source/guides-zh-CN'],
  )

  const plan = planFetchReferenceReconciliation({
    selection: partialFixture.selection,
    results: partialFixture.results,
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: partialFixture.provenance.finalTargetSha,
    targetBranch: 'dev',
    changedUnitKeys: [
      'source/java', 'source/node', 'source/go', 'source/cli', 'source/rest', 'source/python',
    ],
    publicationPaths: [
      ...MANIFEST_PATHS,
      ...sidebarPaths('java'),
      ...sidebarPaths('node'),
      ...sidebarPaths('go'),
      ...sidebarPaths('cli'),
      ...sidebarPaths('rest'),
      ...sidebarPaths('python'),
    ],
  })
})

test('mixed Fetch outcomes publish manifests and only successful Reference group sidebars', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'all'},
      targetBranch: 'dev',
      units: [
        {unitKey: 'source/python', site: 'en', translationSourceGroup: 'python'},
        {unitKey: 'source/java', site: 'en', translationSourceGroup: 'java'},
      ],
    },
    results: {
      mode: 'publish',
      overallStatus: 'failure',
      finalTargetSha: 'd'.repeat(40),
      units: [
        {unitKey: 'source/python', status: 'published'},
        {unitKey: 'source/java', status: 'producer_failed'},
      ],
    },
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: 'd'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: ['source/python'],
    publicationPaths: [...MANIFEST_PATHS, ...sidebarPaths('python')],
  })
  assert.doesNotMatch(JSON.stringify(plan.publicationPaths), /java\.sidebar/)
})

test('run 30996821699 Node artifact requires Reference reconciliation when translations are disabled', () => {
  assert.equal(fixture.provenance.archiveSha256, '63bec9932981afbe7d8ece4f7e716452b9eb7bc5d5961f4b595f67d6357510fb')
  assert.equal(fixture.evidence.createdTokens, 25)
  assert.equal(fixture.evidence.deletedTokens, 17)
  assert.equal(fixture.evidence.deletedTokenPaths.length, 15)
  assert.equal(fixture.evidence.checkpointDeletions.length, 20)
  assert.equal(fixture.evidence.targetOnlyAfterPublication, 20)

  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: fixture.selection,
      targetBranch: fixture.selection.targetBranch,
      units: [{unitKey: 'source/node', site: 'en', translationSourceGroup: 'node'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: fixture.selection.finalTargetSha,
      units: [{unitKey: 'source/node', status: fixture.selection.nodeStatus}],
    },
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: fixture.selection.finalTargetSha,
    targetBranch: 'dev',
    changedUnitKeys: ['source/node'],
    publicationPaths: [...MANIFEST_PATHS, ...sidebarPaths('node')],
  })
})

test('run 30996821699 reviewed target-only Node paths have explicit retirement decisions', () => {
  const registered = new Map(retirementRegistry.retirements.map(record => [record.sourcePath, record]))
  const missing = fixture.evidence.checkpointDeletions.filter(sourcePath => !registered.has(sourcePath))

  assert.deepEqual(missing, [])
  for (const sourcePath of fixture.evidence.checkpointDeletions) {
    const record = registered.get(sourcePath)
    assert.equal(record.manual, 'node')
    assert.equal(record.targetPath, sourcePath.replace('content/en/', 'content/zh-CN/'))
  }
})

test('Reference reconciliation is a no-op when only non-Reference source units publish', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'guides'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/guides-en', site: 'en', translationSourceGroup: 'guides'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: 'a'.repeat(40),
      units: [{unitKey: 'source/guides-en', status: 'published'}],
    },
  })

  assert.deepEqual(plan, {
    required: false,
    sourceCommitSha: 'a'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: [],
    publicationPaths: [],
  })
})

test('successful selected Reference no_changes still requires reconciliation', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'rest'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/rest', site: 'en', translationSourceGroup: 'rest'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'success',
      finalTargetSha: 'b'.repeat(40),
      units: [{unitKey: 'source/rest', status: 'no_changes'}],
    },
  })

  assert.deepEqual(plan, {
    required: true,
    sourceCommitSha: 'b'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: ['source/rest'],
    publicationPaths: [...MANIFEST_PATHS, ...sidebarPaths('rest')],
  })
})

test('failed selected Reference unit does not require reconciliation', () => {
  const plan = planFetchReferenceReconciliation({
    selection: {
      inputs: {publish: true, runTranslations: false, selectedGroup: 'rest'},
      targetBranch: 'dev',
      units: [{unitKey: 'source/rest', site: 'en', translationSourceGroup: 'rest'}],
    },
    results: {
      mode: 'publish',
      overallStatus: 'failure',
      finalTargetSha: 'c'.repeat(40),
      units: [{unitKey: 'source/rest', status: 'producer_failed'}],
    },
  })

  assert.deepEqual(plan, {
    required: false,
    sourceCommitSha: 'c'.repeat(40),
    targetBranch: 'dev',
    changedUnitKeys: [],
    publicationPaths: [],
  })
})

test('Reference reconciliation rejects an orchestrator failure before planning any write', () => {
  assert.throws(() => planFetchReferenceReconciliation({
    selection: partialFixture.selection,
    results: {
      ...partialFixture.results,
      overallStatus: 'orchestrator_failed',
      orchestratorFailure: {
        code: 'REMOTE_STATE_UNKNOWN',
        phase: 'push_probe',
        message: 'remote state is unknown',
        retryable: false,
      },
    },
  }), /orchestrator|unknown remote|unsafe/i)
})

test('Reference reconciliation requires every selected Fetch unit to be terminal', () => {
  assert.throws(() => planFetchReferenceReconciliation({
    selection: partialFixture.selection,
    results: {
      ...partialFixture.results,
      units: partialFixture.results.units.map(unit => unit.unitKey === 'source/guides-en'
        ? {...unit, status: 'ready'}
        : unit),
    },
  }), /every selected.*terminal|terminal.*selected/i)
})

test('publishes one exactly validated Fetch Reference reconciliation candidate to a bare remote', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  const calls = []
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicTransactionCommands(calls)}},
  })

  assert.equal(outcome.status, 'published')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], outcome.resultSha)
  assert.deepEqual(git(setup.repository, ['diff-tree', '--no-commit-id', '--name-only', '-r', outcome.resultSha]).split('\n').sort(), [
    ...MANIFEST_PATHS,
    ...sidebarPaths('python'),
  ].sort())
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'reference-manifest').length, 1)
  const exactRestore = calls.find(call => call.executable === 'bash' && call.args.includes(outcome.resultSha))
  const validation = calls.find(call => call.executable === 'pnpm' && call.args[1] === 'validate-reference')
  assert.ok(exactRestore && validation)
  assert.ok(calls.indexOf(exactRestore) < calls.indexOf(validation))
})

test('recomposes and revalidates Fetch Reference reconciliation after known target drift', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  const calls = []
  let promotions = 0
  let driftSha
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands(calls),
      promoteCandidate({worktree}) {
        promotions += 1
        if (promotions === 1) {
          driftSha = advanceRemote(setup, 'drift before Fetch reconciliation')
          return rejectedPush(worktree)
        }
        git(worktree, ['push', 'origin', 'HEAD:refs/heads/dev'])
        return {status: 'published'}
      },
    }},
  })

  assert.equal(outcome.status, 'published')
  assert.equal(promotions, 2)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'reference-manifest').length, 2)
  assert.equal(calls.filter(call => call.executable === 'pnpm' && call.args[1] === 'validate-reference').length, 2)
  assert.equal(git(setup.repository, ['rev-parse', `${outcome.resultSha}^`]), driftSha)
})

test('treats an ambiguous Fetch reconciliation push as published when the remote contains the exact candidate', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  let candidateSha
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands([]),
      promoteCandidate({candidate, worktree}) {
        candidateSha = candidate.candidateSha
        git(worktree, ['push', 'origin', 'HEAD:refs/heads/dev'])
        throw new Error('connection closed after successful push')
      },
    }},
  })

  assert.equal(outcome.status, 'published')
  assert.equal(outcome.resultSha, candidateSha)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], candidateSha)
})

test('returns known PUSH_FAILED when a Fetch reconciliation push fails and the remote remains at the base', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands([]),
      promoteCandidate() { throw new Error('injected ordinary push failure') },
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.remoteState, 'known')
  assert.equal(outcome.failure.code, 'PUSH_FAILED')
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
})

test('stops Fetch reconciliation with unknown remote state when every post-push probe fails', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  let promotions = 0
  let probes = 0
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {maxProbeAttempts: 2, dependencies: {
      runCommand: deterministicTransactionCommands([]),
      promoteCandidate() { promotions += 1; throw new Error('ambiguous push') },
      probeRemoteCandidate() { probes += 1; throw new Error('probe unavailable') },
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.remoteState, 'unknown')
  assert.equal(outcome.failure.code, 'REMOTE_STATE_UNKNOWN')
  assert.equal(promotions, 1)
  assert.equal(probes, 2)
})

test('does not push when exact Fetch reconciliation candidate validation fails', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  let promotions = 0
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands([], {validationFailure: true}),
      promoteCandidate() { promotions += 1; return {status: 'published'} },
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.failure.code, 'VALIDATION_FAILED')
  assert.equal(promotions, 0)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
  assertNoFetchReconciliationWorktrees(setup)
})

test('validation failure reports candidate cleanup debt without leaking either reconciliation worktree', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  const cleanupAttempts = []
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands([], {validationFailure: true}),
      afterWorktreeCleanup({worktree}) {
        cleanupAttempts.push(path.basename(worktree))
        if (worktree.includes('fetch-reference-publication.')) throw new Error('injected candidate cleanup warning')
      },
    }},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.failure.code, 'VALIDATION_FAILED')
  assert.deepEqual(cleanupAttempts.sort(), [
    cleanupAttempts.find(name => name.startsWith('fetch-reference-publication.')),
    cleanupAttempts.find(name => name.startsWith('fetch-reference-validation.')),
    cleanupAttempts.find(name => name.startsWith('fetch-reference-generation.')),
  ].sort())
  assert.equal(outcome.cleanupDebt.length, 1)
  assert.match(outcome.cleanupDebt[0].message, /injected candidate cleanup warning/)
  assertNoFetchReconciliationWorktrees(setup)
})

test('publishes only successful group paths when generation also touches a failed Reference group', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline)
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {
      runCommand: deterministicTransactionCommands([], {writeFailedGroup: true}),
    }},
  })

  assert.equal(outcome.status, 'published')
  const changed = git(setup.repository, ['diff-tree', '--no-commit-id', '--name-only', '-r', outcome.resultSha]).split('\n')
  assert.deepEqual(changed.sort(), [...MANIFEST_PATHS, ...sidebarPaths('python')].sort())
  assert.doesNotMatch(changed.join('\n'), /java\.sidebar/)
})

test('reconcile CLI writes terminal GitHub outputs for the authenticated exact result', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline, {python: 'producer_failed'})
  const selectionFile = path.join(setup.root, 'selection.json')
  const resultsFile = path.join(setup.root, 'results.json')
  const outputFile = path.join(setup.root, 'github-output')
  fs.writeFileSync(selectionFile, `${JSON.stringify(documents.selection)}\n`)
  fs.writeFileSync(resultsFile, `${JSON.stringify(documents.results)}\n`)
  const outcome = await require('./fetch-reference-reconciliation').main([
    'reconcile', '--selection', selectionFile, '--results', resultsFile,
    '--repository-root', setup.repository, '--runner-temp', setup.runnerTemp, '--remote', 'origin',
  ], {...process.env, GITHUB_OUTPUT: outputFile})

  assert.ok(['published', 'no_changes'].includes(outcome.status))
  assert.equal(fs.readFileSync(outputFile, 'utf8'), `status=${outcome.status}\nfinal_target_sha=${outcome.resultSha}\n`)
})

test('required zero-diff Fetch reconciliation validates the exact latest target before no_changes', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline, {python: 'no_changes'})
  const calls = []
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicTransactionCommands(calls, {noGenerationChanges: true})}},
  })

  assert.equal(outcome.status, 'no_changes')
  assert.equal(outcome.resultSha, setup.baseline)
  assert.deepEqual(outcome.validationReceipts, [{kind: 'fetch_reference_exact_target', targetSha: setup.baseline}])
  const restore = calls.find(call => call.executable === 'bash' && call.args.includes(setup.baseline))
  const validation = calls.find(call => call.executable === 'pnpm' && call.args[1] === 'validate-reference')
  assert.ok(restore && validation)
  assert.ok(calls.indexOf(restore) < calls.indexOf(validation))
  assertNoFetchReconciliationWorktrees(setup)
})

test('required zero-diff Fetch reconciliation fails closed when exact target validation fails', async t => {
  const setup = transactionFixture(t)
  const documents = transactionDocuments(setup.baseline, {python: 'no_changes'})
  const outcome = await reconcileFetchReferencePublication({
    ...documents,
    repositoryRoot: setup.repository,
    runnerTemp: setup.runnerTemp,
    transactionContext: {dependencies: {runCommand: deterministicTransactionCommands([], {
      noGenerationChanges: true,
      noChangesValidationFailure: true,
    })}},
  })

  assert.equal(outcome.status, 'publish_failed')
  assert.equal(outcome.failure.code, 'VALIDATION_FAILED')
  assert.equal(outcome.resultSha, null)
  assert.equal(git(setup.repository, ['ls-remote', '--heads', 'origin', 'dev']).split(/\s+/)[0], setup.baseline)
  assertNoFetchReconciliationWorktrees(setup)
})
