'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {
  aggregateSourceGroupsFromFetchResults,
  requireSuccessfulFetchPublication,
  sourcePublicationsFromFetchResults,
  validateFetchPublicationDocuments,
  verifyFetchPublicationRepository,
} = require('./fetch-publication-results')

const SHA = character => character.repeat(40)
const FAILURE = Object.freeze({code: 'INJECTED', phase: 'test', message: 'injected failure', retryable: false})

function selection(selectedGroup = 'all', overrides = {}) {
  return buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId: 123, runAttempt: 2,
    toolingSha: SHA('a'), targetBranch: 'dev', initialTargetSha: SHA('b'), sourceBaselineSha: SHA('b'),
    selectedGroup, publish: true, runTranslations: true, ...overrides,
  })
}

function resultUnit(unit, index, status = 'published', resultSha = String(index + 1).padStart(40, '0')) {
  const failed = ['producer_failed', 'candidate_rejected', 'publish_failed'].includes(status)
  return {
    unitKey: unit.unitKey,
    producerJobId: index + 10,
    producerCompletedAt: `2026-08-04T08:00:${String(index).padStart(2, '0')}.000Z`,
    readyAt: status === 'producer_failed' ? null : `2026-08-04T08:01:${String(index).padStart(2, '0')}.000Z`,
    sequence: index + 1,
    publishStartedAt: ['published', 'no_changes', 'publish_failed'].includes(status) ? `2026-08-04T08:02:${String(index).padStart(2, '0')}.000Z` : null,
    publishCompletedAt: ['published', 'no_changes', 'publish_failed'].includes(status) ? `2026-08-04T08:03:${String(index).padStart(2, '0')}.000Z` : null,
    baseSha: ['published', 'no_changes', 'publish_failed'].includes(status) ? SHA('b') : null,
    resultSha: ['published', 'no_changes'].includes(status) ? resultSha : null,
    commitShas: status === 'published' ? [resultSha] : [],
    attempts: ['published', 'no_changes', 'publish_failed'].includes(status) ? 1 : 0,
    status,
    failure: failed ? FAILURE : null,
  }
}

function results(selected, options = {}) {
  const statuses = options.statuses || {}
  const resultShas = options.resultShas || {}
  const units = selected.units.map((unit, index) => resultUnit(
    unit,
    index,
    statuses[unit.unitKey] || 'published',
    resultShas[unit.unitKey] || String(index + 1).padStart(40, '0'),
  ))
  const failed = units.some(unit => ['producer_failed', 'candidate_rejected', 'publish_failed'].includes(unit.status))
  return validatePublicationResults({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'fetch',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: selected.targetBranch,
    initialTargetSha: selected.initialTargetSha,
    finalTargetSha: options.finalTargetSha || SHA('f'),
    startedAt: '2026-08-04T08:00:00.000Z',
    completedAt: '2026-08-04T09:00:00.000Z',
    overallStatus: failed ? 'failure' : 'success',
    units,
    orchestratorFailure: null,
  }, {selection: selected})
}

function git(repository, args) {
  const value = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(value.status, 0, value.stderr)
  return value.stdout.trim()
}

function commit(repository, message) {
  fs.writeFileSync(path.join(repository, 'state.txt'), `${message}\n`)
  git(repository, ['add', 'state.txt'])
  git(repository, ['commit', '-m', message])
  return git(repository, ['rev-parse', 'HEAD'])
}

test('validates exact selection identity, required unit coverage, and canonical results order', () => {
  const selected = selection('all')
  const published = results(selected)
  assert.equal(validateFetchPublicationDocuments({selection: selected, results: published}).results.overallStatus, 'success')
  assert.throws(() => validateFetchPublicationDocuments({
    selection: selected,
    results: {...published, selectionSha256: '0'.repeat(64)},
  }), /selectionSha256|checksum|identity/i)
  assert.throws(() => validateFetchPublicationDocuments({
    selection: selected,
    results: {...published, units: published.units.slice(0, -1)},
  }), /exactly cover|units/i)
  assert.throws(() => validateFetchPublicationDocuments({
    selection: selected,
    results: {...published, units: [...published.units].reverse()},
  }), /canonical|order/i)

  const javaOnly = selection('java')
  const {selectionSha256, ...javaWithoutChecksum} = javaOnly
  assert.equal(typeof selectionSha256, 'string')
  const invalidAllSelection = finalizePublicationSelection({
    ...javaWithoutChecksum,
    inputs: {...javaOnly.inputs, selectedGroup: 'all'},
  })
  assert.throws(() => validateFetchPublicationDocuments({
    selection: invalidAllSelection,
    results: results(invalidAllSelection),
  }), /selectedGroup|eight|required units/i)
})

test('requires every selected Fetch unit to succeed before barrier or handoff projection', () => {
  const guides = selection('guides')
  assert.equal(requireSuccessfulFetchPublication({selection: guides, results: results(guides)}).results.overallStatus, 'success')
  assert.throws(() => requireSuccessfulFetchPublication({
    selection: guides,
    results: results(guides, {statuses: {'source/guides-zh-CN': 'publish_failed'}}),
  }), /guides-zh-CN|failure|successful/i)
})

test('maps only English Guides into schema-v2 source publications', () => {
  const selected = selection('guides')
  const published = results(selected, {resultShas: {
    'source/guides-en': SHA('c'),
    'source/guides-zh-CN': SHA('d'),
  }})
  const projected = sourcePublicationsFromFetchResults({selection: selected, results: published, locale: 'all', group: 'guides'})
  assert.deepEqual(projected, {guides: {sourceBaselineSha: SHA('b'), sourceCheckpointSha: SHA('c')}})
  assert.doesNotMatch(JSON.stringify(projected), /guides-zh-CN|d{40}/)
})

test('projects canonical group states and preserves later-unit continuation outcomes', () => {
  const selected = selection('all')
  const projected = aggregateSourceGroupsFromFetchResults({
    selection: selected,
    results: results(selected, {statuses: {
      'source/java': 'producer_failed',
      'source/node': 'candidate_rejected',
      'source/go': 'publish_failed',
      'source/guides-en': 'no_changes',
      'source/guides-zh-CN': 'published',
    }, resultShas: {'source/guides-zh-CN': SHA('e')}}),
  })
  assert.deepEqual(projected.requestedGroups, ['guides', 'python', 'java', 'node', 'go', 'cli', 'cpp', 'rest'])
  assert.equal(projected.groups.java.source, 'fetch_failed')
  assert.equal(projected.groups.node.source, 'validation_failed')
  assert.equal(projected.groups.go.source, 'publish_failed')
  assert.deepEqual(projected.groups.guides, {source: 'source_published', sourceCommitSha: SHA('e')})
  assert.equal(projected.groups.python.source, 'source_published')
})

test('verifies successful result ancestry for success and known partial failure targets', () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-publication-results-'))
  git(repository, ['init', '-b', 'main'])
  git(repository, ['config', 'user.email', 'fetch-publication-results@example.com'])
  git(repository, ['config', 'user.name', 'Fetch Publication Results Test'])
  const baseline = commit(repository, 'baseline')
  const english = commit(repository, 'english guides')
  const finalTarget = commit(repository, 'later successful unit')
  const selected = selection('guides', {toolingSha: finalTarget, initialTargetSha: baseline, sourceBaselineSha: baseline})
  const partial = results(selected, {
    statuses: {'source/guides-zh-CN': 'publish_failed'},
    resultShas: {'source/guides-en': english},
    finalTargetSha: finalTarget,
  })
  assert.equal(verifyFetchPublicationRepository({selection: selected, results: partial, repository}).finalTargetSha, finalTarget)

  git(repository, ['checkout', '-b', 'sibling', baseline])
  const sibling = commit(repository, 'sibling')
  const inconsistent = results(selected, {
    statuses: {'source/guides-zh-CN': 'publish_failed'},
    resultShas: {'source/guides-en': sibling},
    finalTargetSha: finalTarget,
  })
  assert.throws(() => verifyFetchPublicationRepository({selection: selected, results: inconsistent, repository}), /ancestor|final target/i)
})

test('final verification resolves and verifies publication results before restoring the target', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_verify-docs.yml'), 'utf8')
  for (const input of ['publication_selection_artifact_name', 'publication_results_artifact_name']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  assert.match(workflow, /name: Download publication selection[\s\S]*inputs\.publication_selection_artifact_name/)
  assert.match(workflow, /name: Download publication results[\s\S]*inputs\.publication_results_artifact_name/)
  assert.match(workflow, /fetch-publication-results\.js verify-documents[\s\S]*FINAL_DEV_SHA=/)
  const materialize = workflow.slice(workflow.indexOf('name: Materialize exact final dev state'))
  assert.match(materialize, /git fetch --no-tags origin "\$FINAL_DEV_SHA"/)
  assert.match(materialize, /fetch-publication-results\.js verify-repository/)
  assert.ok(materialize.indexOf('verify-repository') < materialize.indexOf('restore-generated-state.sh --exact --ref "$FINAL_DEV_SHA"'))
  assert.match(workflow, /pnpm check:localization-input-inventory/)
  assert.match(workflow, /pnpm docs-tooling validate-revision-inventory --site en/)
})
