'use strict'

const {definePublicationWorkflowAdapter} = require('./publication-workflow-adapters')

const FETCH_UNIT_KEYS = Object.freeze([
  'source/java', 'source/node', 'source/go', 'source/cli',
  'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
])
const SELECTION_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'toolingSha',
  'targetBranch', 'initialTargetSha', 'sourceBaselineSha', 'inputs', 'units', 'selectionSha256',
]
const SELECTION_UNIT_KEYS = [
  'unitKey', 'producerJob', 'strategy', 'site', 'group', 'translationSourceGroup', 'toolingSha',
  'sourceBaselineSha', 'targetBranch', 'artifacts', 'commitMessage', 'validationCommands', 'environment',
]
const READY_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256',
  'unitKey', 'producerJob', 'toolingSha', 'sourceBaselineSha', 'targetBranch', 'artifacts', 'outcome',
]

function validateFetchSelectionUnit(unit, selection, index, helpers) {
  const document = helpers.DOCUMENTS.selection
  helpers.exactKeys(unit, SELECTION_UNIT_KEYS, `unit ${index}`, document)
  if (!FETCH_UNIT_KEYS.includes(unit.unitKey)) helpers.invalid(document, `unit ${index} has an unsupported unitKey`)
  helpers.assertString(unit.producerJob, `unit ${index} producerJob`, document)
  if (unit.strategy !== 'checkpoint') helpers.invalid(document, `unit ${index} strategy must be checkpoint`)
  helpers.assertString(unit.site, `unit ${index} site`, document, true)
  helpers.assertString(unit.group, `unit ${index} group`, document)
  helpers.assertString(unit.translationSourceGroup, `unit ${index} translationSourceGroup`, document, true)
  helpers.assertSha(unit.toolingSha, `unit ${index} toolingSha`, document)
  helpers.assertSha(unit.sourceBaselineSha, `unit ${index} sourceBaselineSha`, document)
  if (unit.toolingSha !== selection.toolingSha) helpers.invalid(document, `unit ${index} toolingSha mismatch`)
  if (unit.sourceBaselineSha !== selection.sourceBaselineSha) helpers.invalid(document, `unit ${index} sourceBaselineSha mismatch`)
  helpers.assertTargetBranch(unit.targetBranch, document)
  if (unit.targetBranch !== selection.targetBranch) helpers.invalid(document, `unit ${index} targetBranch mismatch`)
  helpers.exactKeys(unit.artifacts, ['checkpoint', 'baseline'], `unit ${index} artifacts`, document)
  helpers.assertArtifactName(unit.artifacts.checkpoint, `unit ${index} checkpoint artifact`, document)
  helpers.assertArtifactName(unit.artifacts.baseline, `unit ${index} baseline artifact`, document, true)
  helpers.assertString(unit.commitMessage, `unit ${index} commitMessage`, document)
  if (!Array.isArray(unit.validationCommands) || !unit.validationCommands.length) helpers.invalid(document, `unit ${index} validationCommands must be non-empty`)
  for (const command of unit.validationCommands) helpers.assertString(command, `unit ${index} validation command`, document)
  helpers.validateEnvironment(unit.environment, `unit ${index} environment`, document)
  if (unit.unitKey === 'source/guides-zh-CN' && unit.environment.ZDOC_SITE !== 'zh-CN') {
    helpers.invalid(document, 'Chinese Guides must set ZDOC_SITE=zh-CN')
  }
}

function validateFetchSelection(value, helpers) {
  const document = helpers.DOCUMENTS.selection
  const keys = helpers.requireChecksum ? SELECTION_KEYS : SELECTION_KEYS.filter(key => key !== 'selectionSha256')
  helpers.exactKeys(value, keys, 'root', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  helpers.assertSha(value.initialTargetSha, 'initialTargetSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.exactKeys(value.inputs, ['selectedGroup', 'publish', 'runTranslations'], 'inputs', document)
  if (!['all', 'guides', 'java', 'node', 'go', 'cli', 'rest', 'python'].includes(value.inputs.selectedGroup)) helpers.invalid(document, 'selectedGroup is invalid')
  if (typeof value.inputs.publish !== 'boolean' || typeof value.inputs.runTranslations !== 'boolean') helpers.invalid(document, 'input booleans are invalid')
  if (!Array.isArray(value.units) || !value.units.length) helpers.invalid(document, 'units must be a non-empty array')
  value.units.forEach((unit, index) => validateFetchSelectionUnit(unit, value, index, helpers))
  const unitKeys = value.units.map(unit => unit.unitKey)
  if (new Set(unitKeys).size !== unitKeys.length) helpers.invalid(document, 'unit keys must be unique')
  const indices = unitKeys.map(unitKey => FETCH_UNIT_KEYS.indexOf(unitKey))
  if (indices.some((entry, index) => index > 0 && entry <= indices[index - 1])) helpers.invalid(document, 'units must follow canonical order')
  const artifacts = value.units.flatMap(unit => [unit.artifacts.checkpoint, unit.artifacts.baseline].filter(Boolean))
  if (new Set(artifacts).size !== artifacts.length) helpers.invalid(document, 'artifact names must be unique')
}

function validateFetchReady(value, {selection}, helpers) {
  const document = helpers.DOCUMENTS.ready
  helpers.exactKeys(value, READY_KEYS, 'root', document)
  helpers.assertString(value.unitKey, 'unitKey', document)
  helpers.assertString(value.producerJob, 'producerJob', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  helpers.exactKeys(value.artifacts, ['checkpoint', 'baseline'], 'artifacts', document)
  helpers.validateArtifactIdentity(value.artifacts.checkpoint, 'checkpoint artifact', document)
  if (value.artifacts.baseline !== null) helpers.validateArtifactIdentity(value.artifacts.baseline, 'baseline artifact', document)
  if (!['candidate', 'no_changes_candidate'].includes(value.outcome)) helpers.invalid(document, 'outcome is invalid')
  if (!selection) return
  const selected = selection.units.find(unit => unit.unitKey === value.unitKey)
  if (!selected) helpers.invalid(document, 'unitKey is not selected')
  for (const key of ['producerJob', 'toolingSha', 'sourceBaselineSha', 'targetBranch']) {
    if (value[key] !== selected[key]) helpers.invalid(document, `${key} mismatch with selected unit`)
  }
  if (value.artifacts.checkpoint.name !== selected.artifacts.checkpoint) helpers.invalid(document, 'checkpoint artifact mismatch with selected unit')
  if ((value.artifacts.baseline?.name || null) !== selected.artifacts.baseline) helpers.invalid(document, 'baseline artifact mismatch with selected unit')
}

const fetchPublicationAdapter = definePublicationWorkflowAdapter({
  workflow: 'fetch',
  validateSelection: validateFetchSelection,
  validateReady: validateFetchReady,
  normalizeJobs(jobs) { return jobs },
  resolveCandidate(context) { return context.resolveCheckpointCandidate(context) },
  publishUnit(context) { return context.publishCheckpointTransaction(context) },
  projectResults(results) { return results },
})

module.exports = {fetchPublicationAdapter}
