'use strict'

const {definePublicationWorkflowAdapter} = require('./publication-workflow-adapters')

const SELECTION_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'toolingSha',
  'targetBranch', 'initialTargetSha', 'sourceBaselineSha', 'inputs', 'units', 'selectionSha256',
]
const SELECTION_UNIT_KEYS = [
  'unitKey', 'producerJob', 'strategy', 'target', 'group', 'sourceGroup',
  'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBranch',
  'artifacts', 'commitMessage', 'validationCommands', 'environment',
]
const READY_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256',
  'unitKey', 'producerJob', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha',
  'targetBranch', 'artifacts', 'outcome',
]
const TRANSLATION_SELECTED_GROUPS = Object.freeze([
  'all', 'guides', 'python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings',
])
const TRANSLATION_PUBLICATION_UNIT_KEYS = Object.freeze([
  'translation/ja-JP/guides',
  'translation/ja-JP/python',
  'translation/ja-JP/java',
  'translation/ja-JP/node',
  'translation/ja-JP/go',
  'translation/ja-JP/cli',
  'translation/ja-JP/rest',
  'translation/zh-CN-reference/python',
  'translation/zh-CN-reference/java',
  'translation/zh-CN-reference/node',
  'translation/zh-CN-reference/go',
  'translation/zh-CN-reference/cli',
  'translation/zh-CN-reference/rest',
  'translation/zh-CN-reference/reference-landings',
])

function boundedReconciliationFailure(reconciliation) {
  const failure = reconciliation?.failure || {}
  const code = typeof failure.code === 'string' && failure.code.trim() && !/[\0\r\n]/u.test(failure.code)
    ? failure.code.trim()
    : 'RECONCILIATION_FAILED'
  const details = [
    failure.message || 'Translation reconciliation failed',
    typeof failure.phase === 'string' && failure.phase ? `failurePhase=${failure.phase}` : null,
    typeof reconciliation?.remoteState === 'string' && reconciliation.remoteState
      ? `remoteState=${reconciliation.remoteState}`
      : null,
  ].filter(Boolean).join('; ').replace(/[\0\r\n]+/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 1000)
  return Object.freeze({
    code,
    phase: 'reconciliation',
    message: details || 'Translation reconciliation failed',
    retryable: typeof failure.retryable === 'boolean' ? failure.retryable : false,
  })
}

function validateTranslationUnit(unit, selection, index, helpers) {
  const document = helpers.DOCUMENTS.selection
  helpers.exactKeys(unit, SELECTION_UNIT_KEYS, `unit ${index}`, document)
  helpers.assertString(unit.unitKey, `unit ${index} unitKey`, document)
  helpers.assertString(unit.producerJob, `unit ${index} producerJob`, document)
  if (!['checkpoint', 'ja-guides'].includes(unit.strategy)) helpers.invalid(document, `unit ${index} strategy is invalid`)
  helpers.assertString(unit.target, `unit ${index} target`, document)
  helpers.assertString(unit.group, `unit ${index} group`, document)
  helpers.assertString(unit.sourceGroup, `unit ${index} sourceGroup`, document)
  const expectedUnitKey = `translation/${unit.target}/${unit.group}`
  if (unit.unitKey !== expectedUnitKey) helpers.invalid(document, `unit ${index} unitKey mismatch`)
  if (!TRANSLATION_PUBLICATION_UNIT_KEYS.includes(unit.unitKey)) helpers.invalid(document, `unit ${index} unitKey is not a supported Translation publication unit`)
  if (unit.strategy === 'ja-guides' && unit.unitKey !== 'translation/ja-JP/guides') helpers.invalid(document, 'ja-guides is only valid for translation/ja-JP/guides')
  helpers.assertSha(unit.toolingSha, `unit ${index} toolingSha`, document)
  helpers.assertSha(unit.sourceBaselineSha, `unit ${index} sourceBaselineSha`, document)
  helpers.assertSha(unit.sourceCheckpointSha, `unit ${index} sourceCheckpointSha`, document)
  if (unit.toolingSha !== selection.toolingSha) helpers.invalid(document, `unit ${index} toolingSha mismatch`)
  helpers.assertTargetBranch(unit.targetBranch, document)
  if (unit.targetBranch !== selection.targetBranch) helpers.invalid(document, `unit ${index} targetBranch mismatch`)
  helpers.exactKeys(unit.artifacts, ['checkpoint', 'baseline'], `unit ${index} artifacts`, document)
  helpers.assertArtifactName(unit.artifacts.checkpoint, `unit ${index} checkpoint artifact`, document)
  helpers.assertArtifactName(unit.artifacts.baseline, `unit ${index} baseline artifact`, document, true)
  helpers.assertString(unit.commitMessage, `unit ${index} commitMessage`, document)
  if (!Array.isArray(unit.validationCommands) || !unit.validationCommands.length) helpers.invalid(document, `unit ${index} validationCommands must be non-empty`)
  for (const command of unit.validationCommands) helpers.assertString(command, `unit ${index} validation command`, document)
  helpers.validateEnvironment(unit.environment, `unit ${index} environment`, document)
}

function validateTranslationSelection(value, helpers) {
  const document = helpers.DOCUMENTS.selection
  const keys = helpers.requireChecksum ? SELECTION_KEYS : SELECTION_KEYS.filter(key => key !== 'selectionSha256')
  helpers.exactKeys(value, keys, 'root', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  helpers.assertSha(value.initialTargetSha, 'initialTargetSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.exactKeys(value.inputs, ['selectedGroup', 'publish', 'runTranslations'], 'inputs', document)
  if (!TRANSLATION_SELECTED_GROUPS.includes(value.inputs.selectedGroup)) helpers.invalid(document, 'selectedGroup is invalid')
  if (typeof value.inputs.publish !== 'boolean' || typeof value.inputs.runTranslations !== 'boolean') helpers.invalid(document, 'input booleans are invalid')
  if (!Array.isArray(value.units) || !value.units.length) helpers.invalid(document, 'units must be a non-empty array')
  value.units.forEach((unit, index) => validateTranslationUnit(unit, value, index, helpers))
  if (value.inputs.selectedGroup !== 'all' && value.units.some(unit => unit.group !== value.inputs.selectedGroup)) {
    helpers.invalid(document, 'selectedGroup units must match the selected group')
  }
  const unitKeys = value.units.map(unit => unit.unitKey)
  if (new Set(unitKeys).size !== unitKeys.length) helpers.invalid(document, 'unit keys must be unique')
  const artifacts = value.units.flatMap(unit => [unit.artifacts.checkpoint, unit.artifacts.baseline].filter(Boolean))
  if (new Set(artifacts).size !== artifacts.length) helpers.invalid(document, 'artifact names must be unique')
}

function validateTranslationReady(value, {selection}, helpers) {
  const document = helpers.DOCUMENTS.ready
  helpers.exactKeys(value, READY_KEYS, 'root', document)
  helpers.assertString(value.unitKey, 'unitKey', document)
  if (!TRANSLATION_PUBLICATION_UNIT_KEYS.includes(value.unitKey)) helpers.invalid(document, 'unitKey is not a supported Translation publication unit')
  helpers.assertString(value.producerJob, 'producerJob', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.assertSha(value.sourceCheckpointSha, 'sourceCheckpointSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  helpers.exactKeys(value.artifacts, ['checkpoint', 'baseline'], 'artifacts', document)
  helpers.validateArtifactIdentity(value.artifacts.checkpoint, 'checkpoint artifact', document)
  if (value.artifacts.baseline !== null) helpers.validateArtifactIdentity(value.artifacts.baseline, 'baseline artifact', document)
  if (!['candidate', 'no_changes_candidate'].includes(value.outcome)) helpers.invalid(document, 'outcome is invalid')
  if (!selection) return
  const selected = selection.units.find(unit => unit.unitKey === value.unitKey)
  if (!selected) helpers.invalid(document, 'unitKey is not selected')
  for (const key of ['producerJob', 'toolingSha', 'sourceBaselineSha', 'sourceCheckpointSha', 'targetBranch']) {
    if (value[key] !== selected[key]) helpers.invalid(document, `${key} mismatch with selected unit`)
  }
  if (value.artifacts.checkpoint.name !== selected.artifacts.checkpoint) helpers.invalid(document, 'checkpoint artifact mismatch with selected unit')
  if ((value.artifacts.baseline?.name || null) !== selected.artifacts.baseline) helpers.invalid(document, 'baseline artifact mismatch with selected unit')
}

const translationPublicationAdapter = definePublicationWorkflowAdapter({
  workflow: 'translation',
  validateSelection: validateTranslationSelection,
  validateReady: validateTranslationReady,
  normalizeJobs(jobs) { return jobs },
  resolveCandidate(context) { return context.resolveCandidate(context) },
  publishUnit(context) { return context.publishUnit(context) },
  async projectResults(results, context) {
    const {validateTranslationPublicationDocuments} = require('./translation-publication-results')
    const value = validateTranslationPublicationDocuments({selection: context.selection, results})
    if (value.results.mode !== 'publish' || value.results.overallStatus === 'orchestrator_failed' ||
        value.results.units.some(unit => unit.status === 'ready')) return value.results
    const reconcile = context.transactionContext?.reconcileTranslationPublication ||
      require('./translation-publication-reconciliation').reconcileTranslationPublication
    let reconciliation
    try {
      reconciliation = await reconcile({
        selection: value.selection,
        results: value.results,
        repositoryRoot: context.repositoryRoot,
        runnerTemp: context.runnerTemp,
        transactionContext: context.transactionContext,
      })
    } catch (error) {
      reconciliation = {
        status: 'publish_failed',
        remoteState: error.remoteState,
        failure: {
          code: error.code,
          phase: error.phase,
          message: error.message || String(error),
          retryable: error.retryable,
        },
      }
    }
    if (['published', 'no_changes'].includes(reconciliation?.status)) {
      return validateTranslationPublicationDocuments({
        selection: value.selection,
        results: {...value.results, finalTargetSha: reconciliation.resultSha},
      }).results
    }
    return validateTranslationPublicationDocuments({
      selection: value.selection,
      results: {
        ...value.results,
        overallStatus: 'orchestrator_failed',
        orchestratorFailure: boundedReconciliationFailure(reconciliation),
      },
    }).results
  },
})

module.exports = {translationPublicationAdapter}
