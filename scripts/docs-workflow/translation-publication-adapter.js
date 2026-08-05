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
  const keys = Object.hasOwn(value, 'selectionSha256') ? SELECTION_KEYS : SELECTION_KEYS.filter(key => key !== 'selectionSha256')
  helpers.exactKeys(value, keys, 'root', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  helpers.assertSha(value.initialTargetSha, 'initialTargetSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.exactKeys(value.inputs, ['selectedGroup', 'publish', 'runTranslations'], 'inputs', document)
  if (typeof value.inputs.publish !== 'boolean' || typeof value.inputs.runTranslations !== 'boolean') helpers.invalid(document, 'input booleans are invalid')
  if (!Array.isArray(value.units) || !value.units.length) helpers.invalid(document, 'units must be a non-empty array')
  value.units.forEach((unit, index) => validateTranslationUnit(unit, value, index, helpers))
  const unitKeys = value.units.map(unit => unit.unitKey)
  if (new Set(unitKeys).size !== unitKeys.length) helpers.invalid(document, 'unit keys must be unique')
  const artifacts = value.units.flatMap(unit => [unit.artifacts.checkpoint, unit.artifacts.baseline].filter(Boolean))
  if (new Set(artifacts).size !== artifacts.length) helpers.invalid(document, 'artifact names must be unique')
}

function validateTranslationReady(value, {selection}, helpers) {
  const document = helpers.DOCUMENTS.ready
  helpers.exactKeys(value, READY_KEYS, 'root', document)
  helpers.assertString(value.unitKey, 'unitKey', document)
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
  projectResults(results) { return results },
})

module.exports = {translationPublicationAdapter}
