#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const { loadTypeScript } = require('../lib/load-typescript')

const {
  finalizePublicationSelection,
  readPublicationDocument,
  validatePublicationReady,
  writePublicationDocument,
} = require('./publication-contracts')

const { fetchGroupUnitKeys, fetchUnitDefinitions, fetchUnitKeys } =
  loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts')

const FETCH_UNIT_KEYS = fetchUnitKeys()
const DEFINITIONS = Object.freeze(Object.fromEntries(
  fetchUnitDefinitions().map(definition => [definition.unitKey, definition]),
))
const FETCH_GROUP_UNIT_KEYS = fetchGroupUnitKeys()

function selectedUnitKeys(selectedGroup) {
  if (selectedGroup === 'all') return FETCH_UNIT_KEYS
  if (selectedGroup === 'guides') return FETCH_GROUP_UNIT_KEYS.guides
  if (FETCH_GROUP_UNIT_KEYS[selectedGroup]) return FETCH_GROUP_UNIT_KEYS[selectedGroup]
  throw new Error(`Invalid selected group: ${selectedGroup || '<empty>'}`)
}

function validationCommands(site) {
  const commands = [`node scripts/validate-generated-sidebars.js --site ${site}`]
  if (site === 'zh-CN') commands.push('pnpm run build:zh-CN:site')
  return Object.freeze(commands)
}

function checkpointArtifactName(unitKey, runId) {
  const suffix = unitKey.slice('source/'.length)
  return `docs-checkpoint-${suffix}-${runId}`
}

function selectionUnit(unitKey, input) {
  const definition = DEFINITIONS[unitKey]
  return {
    unitKey,
    producerJob: definition.producerJob,
    strategy: 'checkpoint',
    site: definition.site,
    group: definition.group,
    translationSourceGroup: definition.translationSourceGroup,
    toolingSha: input.toolingSha,
    sourceBaselineSha: input.sourceBaselineSha,
    targetBranch: input.targetBranch,
    artifacts: {checkpoint: checkpointArtifactName(unitKey, input.runId), baseline: null},
    commitMessage: definition.commitMessage,
    validationCommands: validationCommands(definition.site),
    environment: {ZDOC_SITE: definition.site},
  }
}

function buildFetchPublicationSelection(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Selection input must be an object')
  const unitKeys = selectedUnitKeys(input.selectedGroup)
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'fetch',
    repository: input.repository,
    runId: input.runId,
    runAttempt: input.runAttempt,
    toolingSha: input.toolingSha,
    targetBranch: input.targetBranch,
    initialTargetSha: input.initialTargetSha,
    sourceBaselineSha: input.sourceBaselineSha,
    inputs: {
      selectedGroup: input.selectedGroup,
      publish: input.publish,
      runTranslations: input.runTranslations,
    },
    units: unitKeys.map(unitKey => selectionUnit(unitKey, input)),
  })
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function readPinnedFile(file, label) {
  if (typeof file !== 'string' || !file || /[\0\r\n]/u.test(file)) throw new Error(`${label} path is invalid`)
  const before = fs.lstatSync(file)
  if (before.isSymbolicLink() || !before.isFile()) throw new Error(`${label} must be a regular non-symlink file`)
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
  try {
    const opened = fs.fstatSync(descriptor)
    if (opened.dev !== before.dev || opened.ino !== before.ino) throw new Error(`${label} identity changed before reading`)
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (after.dev !== opened.dev || after.ino !== opened.ino || after.size !== opened.size) throw new Error(`${label} changed while reading`)
    return bytes
  } finally {
    fs.closeSync(descriptor)
  }
}

function parseCheckpointManifest(bytes, selected) {
  let manifest
  try { manifest = JSON.parse(bytes.toString('utf8')) } catch { throw new Error('Checkpoint manifest JSON is invalid') }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Checkpoint manifest must be an object')
  if (manifest.schemaVersion !== 1 || manifest.stage !== 'source') throw new Error('Checkpoint manifest must be a schema-v1 source artifact')
  if (manifest.group !== selected.group) throw new Error('Checkpoint manifest group mismatch')
  if (manifest.masterSha !== selected.toolingSha) throw new Error('Checkpoint manifest tooling SHA mismatch')
  if (manifest.devBaselineSha !== selected.sourceBaselineSha) throw new Error('Checkpoint manifest source baseline mismatch')
  if (!Array.isArray(manifest.files) || !Array.isArray(manifest.deletions)) throw new Error('Checkpoint manifest files and deletions must be arrays')
  if (!manifest.validation || !Array.isArray(manifest.validation.commands) || manifest.validation.passed !== true) throw new Error('Checkpoint manifest validation is invalid')
  return manifest
}

function buildFetchPublicationReady({selection, unitKey, archive, manifest}) {
  const selected = selection.units.find(unit => unit.unitKey === unitKey)
  if (!selected) throw new Error(`Publication unit is not selected: ${unitKey}`)
  const archiveBytes = readPinnedFile(archive, 'Checkpoint archive')
  const manifestBytes = readPinnedFile(manifest, 'Checkpoint manifest')
  const checkpointManifest = parseCheckpointManifest(manifestBytes, selected)
  return validatePublicationReady({
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'fetch',
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    selectionSha256: selection.selectionSha256,
    unitKey: selected.unitKey,
    producerJob: selected.producerJob,
    toolingSha: selected.toolingSha,
    sourceBaselineSha: selected.sourceBaselineSha,
    targetBranch: selected.targetBranch,
    artifacts: {
      checkpoint: {
        name: selected.artifacts.checkpoint,
        archiveSha256: sha256(archiveBytes),
        manifestSha256: sha256(manifestBytes),
      },
      baseline: null,
    },
    outcome: checkpointManifest.files.length === 0 && checkpointManifest.deletions.length === 0
      ? 'no_changes_candidate'
      : 'candidate',
  }, {selection})
}

function parseArguments(argv) {
  const command = argv[0]
  if (command === '--help') return {command: 'help', values: {}}
  if (!['selection', 'ready'].includes(command)) throw new Error('Usage: fetch-publication-selection.js <selection|ready> [options]')
  const values = {}
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid publication selection arguments')
    const key = flag.slice(2)
    if (Object.hasOwn(values, key)) throw new Error(`Duplicate argument: ${flag}`)
    values[key] = value
  }
  const allowed = command === 'selection'
    ? new Set(['repository', 'run-id', 'run-attempt', 'tooling-sha', 'target-branch', 'initial-target-sha', 'source-baseline-sha', 'selected-group', 'publish', 'run-translations', 'output'])
    : new Set(['selection', 'unit-key', 'archive', 'manifest', 'output'])
  for (const key of Object.keys(values)) if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`)
  return {command, values}
}

function required(value, label) {
  if (value === undefined || value === '') throw new Error(`${label} is required`)
  return value
}

function positiveInteger(value, label) {
  if (!/^[1-9][0-9]*$/u.test(String(value || '')) || !Number.isSafeInteger(Number(value))) throw new Error(`${label} must be a positive integer`)
  return Number(value)
}

function boolean(value, label) {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${label} must be true or false`)
}

function fact(values, key, env, envKey) {
  return values[key] ?? env[envKey]
}

function main(argv = process.argv.slice(2), env = process.env) {
  const {command, values} = parseArguments(argv)
  if (command === 'help') {
    process.stdout.write('Usage: fetch-publication-selection.js <selection|ready> [options]\n')
    return null
  }
  if (command === 'selection') {
    const selection = buildFetchPublicationSelection({
      repository: required(fact(values, 'repository', env, 'GITHUB_REPOSITORY'), 'repository'),
      runId: positiveInteger(fact(values, 'run-id', env, 'GITHUB_RUN_ID'), 'run-id'),
      runAttempt: positiveInteger(fact(values, 'run-attempt', env, 'GITHUB_RUN_ATTEMPT'), 'run-attempt'),
      toolingSha: required(fact(values, 'tooling-sha', env, 'TOOLING_SHA'), 'tooling-sha'),
      targetBranch: required(fact(values, 'target-branch', env, 'TARGET_BRANCH'), 'target-branch'),
      initialTargetSha: required(fact(values, 'initial-target-sha', env, 'INITIAL_TARGET_SHA'), 'initial-target-sha'),
      sourceBaselineSha: required(fact(values, 'source-baseline-sha', env, 'SOURCE_BASELINE_SHA'), 'source-baseline-sha'),
      selectedGroup: required(fact(values, 'selected-group', env, 'SELECTED_GROUP'), 'selected-group'),
      publish: boolean(required(fact(values, 'publish', env, 'PUBLISH'), 'publish'), 'publish'),
      runTranslations: boolean(required(fact(values, 'run-translations', env, 'RUN_TRANSLATIONS'), 'run-translations'), 'run-translations'),
    })
    writePublicationDocument(required(values.output, 'output'), selection)
    return selection
  }
  const selection = readPublicationDocument(required(values.selection, 'selection'), 'publication-selection')
  const ready = buildFetchPublicationReady({
    selection,
    unitKey: required(values['unit-key'], 'unit-key'),
    archive: required(values.archive, 'archive'),
    manifest: required(values.manifest, 'manifest'),
  })
  writePublicationDocument(required(values.output, 'output'), ready, {selection})
  return ready
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  FETCH_UNIT_KEYS,
  buildFetchPublicationReady,
  buildFetchPublicationSelection,
  main,
}
