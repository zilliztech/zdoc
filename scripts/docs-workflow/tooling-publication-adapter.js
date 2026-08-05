'use strict'

const {definePublicationWorkflowAdapter} = require('./publication-workflow-adapters')

const SELECTION_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'toolingSha',
  'targetBranch', 'initialTargetSha', 'sourceBaselineSha', 'inputs', 'units', 'selectionSha256',
]
const SELECTION_UNIT_KEYS = [
  'unitKey', 'producerJob', 'strategy', 'toolingSha', 'sourceBaselineSha', 'targetBranch',
  'artifacts', 'commitMessage', 'validationCommands', 'environment',
]
const READY_KEYS = [
  'schemaVersion', 'document', 'workflow', 'repository', 'runId', 'runAttempt', 'selectionSha256',
  'unitKey', 'producerJob', 'toolingSha', 'sourceBaselineSha', 'targetBranch', 'artifacts', 'outcome',
]

function validateToolingUnit(unit, selection, helpers) {
  const document = helpers.DOCUMENTS.selection
  helpers.exactKeys(unit, SELECTION_UNIT_KEYS, 'unit 0', document)
  if (unit.unitKey !== 'tooling/master') helpers.invalid(document, 'tooling unit must be tooling/master')
  helpers.assertString(unit.producerJob, 'unit 0 producerJob', document)
  if (unit.strategy !== 'tooling-merge') helpers.invalid(document, 'tooling unit strategy must be tooling-merge')
  helpers.assertSha(unit.toolingSha, 'unit 0 toolingSha', document)
  helpers.assertSha(unit.sourceBaselineSha, 'unit 0 sourceBaselineSha', document)
  if (unit.toolingSha !== selection.toolingSha) helpers.invalid(document, 'unit 0 toolingSha mismatch')
  if (unit.sourceBaselineSha !== selection.sourceBaselineSha || unit.sourceBaselineSha !== selection.initialTargetSha) {
    helpers.invalid(document, 'unit 0 sourceBaselineSha mismatch with recorded dev baseline')
  }
  helpers.assertTargetBranch(unit.targetBranch, document)
  if (unit.targetBranch !== selection.targetBranch) helpers.invalid(document, 'unit 0 targetBranch mismatch')
  helpers.exactKeys(unit.artifacts, ['checkpoint', 'baseline'], 'unit 0 artifacts', document)
  helpers.assertArtifactName(unit.artifacts.checkpoint, 'unit 0 checkpoint artifact', document)
  helpers.assertArtifactName(unit.artifacts.baseline, 'unit 0 baseline artifact', document, true)
  helpers.assertString(unit.commitMessage, 'unit 0 commitMessage', document)
  if (!Array.isArray(unit.validationCommands) || !unit.validationCommands.length) helpers.invalid(document, 'unit 0 validationCommands must be non-empty')
  for (const command of unit.validationCommands) helpers.assertString(command, 'unit 0 validation command', document)
  helpers.validateEnvironment(unit.environment, 'unit 0 environment', document)
}

function validateToolingSelection(value, helpers) {
  const document = helpers.DOCUMENTS.selection
  const keys = helpers.requireChecksum ? SELECTION_KEYS : SELECTION_KEYS.filter(key => key !== 'selectionSha256')
  helpers.exactKeys(value, keys, 'root', document)
  helpers.assertSha(value.toolingSha, 'toolingSha', document)
  helpers.assertTargetBranch(value.targetBranch, document)
  if (value.targetBranch !== 'dev') helpers.invalid(document, 'targetBranch must be dev')
  helpers.assertSha(value.initialTargetSha, 'initialTargetSha', document)
  helpers.assertSha(value.sourceBaselineSha, 'sourceBaselineSha', document)
  helpers.exactKeys(value.inputs, ['selectedGroup', 'publish', 'runTranslations'], 'inputs', document)
  if (typeof value.inputs.publish !== 'boolean' || typeof value.inputs.runTranslations !== 'boolean') helpers.invalid(document, 'input booleans are invalid')
  if (!Array.isArray(value.units) || value.units.length !== 1) helpers.invalid(document, 'tooling selection must contain exactly one unit')
  validateToolingUnit(value.units[0], value, helpers)
}

function validateToolingReady(value, {selection}, helpers) {
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
  const selected = selection.units[0]
  for (const key of ['unitKey', 'producerJob', 'toolingSha', 'sourceBaselineSha', 'targetBranch']) {
    if (value[key] !== selected[key]) helpers.invalid(document, `${key} mismatch with selected unit`)
  }
  if (value.artifacts.checkpoint.name !== selected.artifacts.checkpoint) helpers.invalid(document, 'checkpoint artifact mismatch with selected unit')
  if ((value.artifacts.baseline?.name || null) !== selected.artifacts.baseline) helpers.invalid(document, 'baseline artifact mismatch with selected unit')
}

const toolingPublicationAdapter = definePublicationWorkflowAdapter({
  workflow: 'tooling',
  validateSelection: validateToolingSelection,
  validateReady: validateToolingReady,
  normalizeJobs(jobs) { return jobs },
  resolveCandidate(context) { return context.resolveCandidate(context) },
  publishUnit(context) { return context.publishUnit(context) },
  projectResults(results) { return results },
})

module.exports = {toolingPublicationAdapter}
