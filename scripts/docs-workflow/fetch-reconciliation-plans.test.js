'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {
  planArtifactName,
  prepareFetchReconciliationPlans,
  sourceCheckpointsFromFetchResults,
  translationUnitsForFetch,
} = require('./fetch-reconciliation-plans')
const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')

const SHA = character => character.repeat(40)

function git(repository, args) {
  return execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8'}).trim()
}

function write(repository, relative, bytes) {
  const file = path.join(repository, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, bytes)
}

function repositoryFixture(group = 'guides', options = {}) {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-reconciliation-plans-'))
  git(repository, ['init', '-q'])
  git(repository, ['config', 'user.name', 'Fetch Reconciliation Plans Test'])
  git(repository, ['config', 'user.email', 'fetch-reconciliation@example.com'])
  const policy = fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json'))
  write(repository, 'config/translation/reconciliation-policy.json', policy)
  if (group === 'guides') {
    for (let index = 0; index < 5; index += 1) write(repository, `content/en/guides/tutorials/doc-${index}.md`, `# Doc ${index}\n`)
    write(repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/doc-0.md', '# 翻訳\n')
    if (options.orphan) write(repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/orphan.md', '# 翻訳\n')
  } else {
    const sourceRoot = `content/en/reference/api/${group}/${group}/v2`
    const targetRoot = `content/zh-CN/reference/api/${group}/${group}/v2`
    for (let index = 0; index < 5; index += 1) write(repository, `${sourceRoot}/doc-${index}.md`, `# Doc ${index}\n`)
    write(repository, `${targetRoot}/doc-0.md`, '# 翻译\n')
  }
  write(repository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  git(repository, ['add', '.'])
  git(repository, ['commit', '-qm', 'baseline'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])
  const sourcePath = group === 'guides'
    ? 'content/en/guides/tutorials/doc-0.md'
    : `content/en/reference/api/${group}/${group}/v2/doc-0.md`
  fs.rmSync(path.join(repository, sourcePath))
  git(repository, ['add', '-u'])
  git(repository, ['commit', '-qm', 'checkpoint'])
  const checkpoint = git(repository, ['rev-parse', 'HEAD'])
  return {repository, baseline, checkpoint}
}

function selectionFixture(group, baseline) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    initialTargetSha: baseline,
    sourceBaselineSha: baseline,
    selectedGroup: group,
    publish: true,
    runTranslations: true,
  })
}

function sourceCheckpoints(selection, checkpoint) {
  return Object.fromEntries(translationUnitsForFetch(selection)
    .map(unit => unit.sourceGroup)
    .filter((group, index, all) => all.indexOf(group) === index)
    .map(group => [group, {sourceBaselineSha: selection.sourceBaselineSha, sourceCheckpointSha: checkpoint}]))
}

test('prepares approved plans for Japanese Guides from exact source checkpoint identities', () => {
  const fixture = repositoryFixture('guides')
  try {
    const selection = selectionFixture('guides', fixture.baseline)
    const outputDir = path.join(fixture.repository, 'tmp/plans')
    const summary = prepareFetchReconciliationPlans({
      selection,
      repository: fixture.repository,
      targetBaselineSha: fixture.baseline,
      sourceCheckpoints: sourceCheckpoints(selection, fixture.checkpoint),
      outputDir,
    })
    assert.equal(summary.status, 'approved')
    assert.equal(summary.planCount, 1)
    assert.equal(summary.records[0].operationCount, 1)
    const plan = JSON.parse(fs.readFileSync(path.join(outputDir, planArtifactName('ja-JP', 'guides')), 'utf8'))
    assert.equal(plan.operations[0].kind, 'delete_target')
  } finally {
    fs.rmSync(fixture.repository, {recursive: true, force: true})
  }
})

test('prepares an authenticated empty plan when the source checkpoint is unchanged even with a target orphan', () => {
  const fixture = repositoryFixture('guides', {orphan: true})
  try {
    const selection = selectionFixture('guides', fixture.baseline)
    const outputDir = path.join(fixture.repository, 'tmp/plans')
    const summary = prepareFetchReconciliationPlans({
      selection,
      repository: fixture.repository,
      targetBaselineSha: fixture.baseline,
      sourceCheckpoints: {guides: {sourceBaselineSha: fixture.baseline, sourceCheckpointSha: fixture.baseline}},
      outputDir,
    })
    assert.equal(summary.status, 'approved')
    assert.equal(summary.records[0].operationCount, 0)
  } finally {
    fs.rmSync(fixture.repository, {recursive: true, force: true})
  }
})

test('approves Chinese SDK deletions automatically and writes plans', () => {
  const fixture = repositoryFixture('java')
  try {
    const selection = selectionFixture('java', fixture.baseline)
    const outputDir = path.join(fixture.repository, 'tmp/plans')
    const reviewDir = path.join(fixture.repository, 'tmp/reviews')
    const summary = prepareFetchReconciliationPlans({
      selection,
      repository: fixture.repository,
      targetBaselineSha: fixture.baseline,
      sourceCheckpoints: sourceCheckpoints(selection, fixture.checkpoint),
      outputDir,
      reviewOutputDir: reviewDir,
    })
    assert.equal(summary.status, 'approved')
    assert.equal(summary.reviewRequired, 0)
    assert.equal(summary.approved, 2)
    assert.equal(fs.existsSync(path.join(outputDir, 'translation-reconciliation-plan-ja-JP-java.json')), true)
    assert.equal(fs.existsSync(path.join(outputDir, 'translation-reconciliation-plan-zh-CN-reference-java.json')), true)
  } finally {
    fs.rmSync(fixture.repository, {recursive: true, force: true})
  }
})

test('projects source checkpoints from validated Fetch results', () => {
  const fixture = repositoryFixture('guides')
  try {
    const selection = selectionFixture('guides', fixture.baseline)
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
      initialTargetSha: fixture.baseline,
      finalTargetSha: fixture.checkpoint,
      startedAt: '2026-08-15T00:00:00.000Z',
      completedAt: '2026-08-15T00:01:00.000Z',
      overallStatus: 'success',
      units: selection.units.map((unit, index) => ({
        unitKey: unit.unitKey,
        producerJobId: index + 1,
        producerCompletedAt: '2026-08-15T00:00:01.000Z',
        readyAt: '2026-08-15T00:00:02.000Z',
        sequence: index + 1,
        publishStartedAt: '2026-08-15T00:00:03.000Z',
        publishCompletedAt: '2026-08-15T00:00:04.000Z',
        baseSha: fixture.baseline,
        resultSha: fixture.checkpoint,
        commitShas: [fixture.checkpoint],
        attempts: 1,
        status: 'published',
        failure: null,
      })),
      orchestratorFailure: null,
    }, {selection})
    assert.deepEqual(sourceCheckpointsFromFetchResults({selection, results}), {
      guides: {sourceBaselineSha: fixture.baseline, sourceCheckpointSha: fixture.checkpoint},
    })
  } finally {
    fs.rmSync(fixture.repository, {recursive: true, force: true})
  }
})
