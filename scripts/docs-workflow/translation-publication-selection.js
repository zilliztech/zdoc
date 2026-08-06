#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')

const {
  finalizePublicationSelection,
  readPublicationDocument,
  validatePublicationReady,
  writePublicationDocument,
} = require('./publication-contracts')
const {validateTranslationHandoff} = require('./translation-handoff')

const TRANSLATION_UNIT_KEYS = Object.freeze([
  'translation/ja-JP/guides',
  'translation/ja-JP/python', 'translation/zh-CN-reference/python',
  'translation/ja-JP/java', 'translation/zh-CN-reference/java',
  'translation/ja-JP/node', 'translation/zh-CN-reference/node',
  'translation/ja-JP/go', 'translation/zh-CN-reference/go',
  'translation/ja-JP/cli', 'translation/zh-CN-reference/cli',
  'translation/ja-JP/rest', 'translation/zh-CN-reference/rest',
  'translation/zh-CN-reference/reference-landings',
])

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

function validationCommands(target, group) {
  return [`node scripts/translation/validate-group.js --target ${target} --group ${group}`]
}

function selectionUnit(handoffUnit, input) {
  const unitKey = `translation/${handoffUnit.target}/${handoffUnit.group}`
  const guides = unitKey === 'translation/ja-JP/guides'
  return {
    unitKey,
    producerJob: guides ? 'prepare_guides_publication_ready' : `translate:${handoffUnit.target}/${handoffUnit.group}`,
    strategy: guides ? 'ja-guides' : 'checkpoint',
    target: handoffUnit.target,
    group: handoffUnit.group,
    sourceGroup: handoffUnit.sourceGroup,
    toolingSha: input.handoff.toolingSha,
    sourceBaselineSha: handoffUnit.sourceBaselineSha,
    sourceCheckpointSha: handoffUnit.sourceCheckpointSha,
    targetBranch: input.handoff.targetBranch,
    artifacts: {
      checkpoint: `translation-checkpoint-${handoffUnit.target}-${handoffUnit.group}-${input.runId}`,
      baseline: `translation-baseline-${handoffUnit.target}-${handoffUnit.group}-${input.runId}`,
    },
    commitMessage: `i18n(${handoffUnit.target}): publish ${handoffUnit.group} translations`,
    validationCommands: validationCommands(handoffUnit.target, handoffUnit.group),
    environment: handoffUnit.target === 'zh-CN-reference' ? {ZDOC_SITE: 'zh-CN'} : {},
  }
}

function buildTranslationPublicationSelection(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Translation publication selection input must be an object')
  const handoff = validateTranslationHandoff(input.handoff)
  const selected = new Map(handoff.units.map(unit => [`translation/${unit.target}/${unit.group}`, unit]))
  const units = TRANSLATION_UNIT_KEYS.filter(unitKey => selected.has(unitKey)).map(unitKey => selectionUnit(selected.get(unitKey), { ...input, handoff }))
  if (units.length !== handoff.units.length) throw new Error('Translation handoff contains an unsupported publication unit')
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: input.repository,
    runId: input.runId,
    runAttempt: input.runAttempt,
    toolingSha: handoff.toolingSha,
    targetBranch: handoff.targetBranch,
    initialTargetSha: handoff.targetBaselineSha,
    sourceBaselineSha: handoff.targetBaselineSha,
    inputs: {selectedGroup: handoff.group, publish: input.publish, runTranslations: input.runTranslations},
    units,
  })
}

function parseManifest(bytes, selected, label, {selectionRunId, selectionRunAttempt, selectionInitialTargetSha} = {}) {
  let manifest
  try { manifest = JSON.parse(bytes.toString('utf8')) } catch { throw new Error(`${label} manifest JSON is invalid`) }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error(`${label} manifest must be an object`)
  if (selected.strategy === 'ja-guides') {
    if (manifest.schemaVersion !== 1 || manifest.stage !== 'translation-guides-batch-set' || manifest.group !== 'guides' ||
        manifest.sourceCheckpointSha !== selected.sourceCheckpointSha || manifest.toolingSha !== selected.toolingSha ||
        manifest.runId !== selectionRunId || manifest.runAttempt !== selectionRunAttempt || manifest.targetSha !== selectionInitialTargetSha ||
        !Number.isSafeInteger(manifest.batchCount) || manifest.batchCount < 0 || !/^[a-f0-9]{64}$/u.test(manifest.pendingSetSha256 || '')) {
      throw new Error(`${label} Guides batch-set manifest does not match the selected identity`)
    }
  } else if (manifest.schemaVersion !== 2 || manifest.stage !== 'translation' || manifest.group !== selected.group ||
      manifest.masterSha !== selected.toolingSha || manifest.devBaselineSha !== selected.sourceCheckpointSha ||
      manifest.translationTarget !== selected.target || manifest.sourceCheckpointSha !== selected.sourceCheckpointSha || manifest.toolingSha !== selected.toolingSha ||
      !Array.isArray(manifest.files) || !Array.isArray(manifest.deletions) || manifest.validation?.passed !== true) {
    throw new Error(`${label} translation checkpoint manifest does not match the selected identity`)
  }
  return manifest
}

function buildTranslationPublicationReady({selection, unitKey, checkpointArchive, checkpointManifest, baselineArchive, baselineManifest}) {
  const selected = selection.units.find(unit => unit.unitKey === unitKey)
  if (!selected) throw new Error(`Translation publication unit is not selected: ${unitKey}`)
  const checkpointArchiveBytes = readPinnedFile(checkpointArchive, 'Translation checkpoint archive')
  const checkpointManifestBytes = readPinnedFile(checkpointManifest, 'Translation checkpoint manifest')
  const baselineArchiveBytes = readPinnedFile(baselineArchive, 'Translation baseline archive')
  const baselineManifestBytes = readPinnedFile(baselineManifest, 'Translation baseline manifest')
  const manifestIdentity = {selectionRunId: selection.runId, selectionRunAttempt: selection.runAttempt, selectionInitialTargetSha: selection.initialTargetSha}
  const checkpoint = parseManifest(checkpointManifestBytes, selected, 'Translation checkpoint', manifestIdentity)
  parseManifest(baselineManifestBytes, selected, 'Translation baseline', manifestIdentity)
  return validatePublicationReady({
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'translation',
    repository: selection.repository,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    selectionSha256: selection.selectionSha256,
    unitKey: selected.unitKey,
    producerJob: selected.producerJob,
    toolingSha: selected.toolingSha,
    sourceBaselineSha: selected.sourceBaselineSha,
    sourceCheckpointSha: selected.sourceCheckpointSha,
    targetBranch: selected.targetBranch,
    artifacts: {
      checkpoint: {name: selected.artifacts.checkpoint, archiveSha256: sha256(checkpointArchiveBytes), manifestSha256: sha256(checkpointManifestBytes)},
      baseline: {name: selected.artifacts.baseline, archiveSha256: sha256(baselineArchiveBytes), manifestSha256: sha256(baselineManifestBytes)},
    },
    outcome: selected.strategy === 'ja-guides'
      ? (checkpoint.batchCount === 0 ? 'no_changes_candidate' : 'candidate')
      : checkpoint.files?.length === 0 && checkpoint.deletions?.length === 0 ? 'no_changes_candidate' : 'candidate',
  }, {selection})
}

function parseArguments(argv) {
  const command = argv[0]
  if (command === '--help') return {command: 'help', values: {}}
  if (!['selection', 'ready'].includes(command)) throw new Error('Usage: translation-publication-selection.js <selection|ready> [options]')
  const values = {}
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || Object.hasOwn(values, flag.slice(2))) throw new Error('Invalid Translation publication selection arguments')
    values[flag.slice(2)] = value
  }
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

function main(argv = process.argv.slice(2), env = process.env) {
  const {command, values} = parseArguments(argv)
  if (command === 'help') {
    process.stdout.write('Usage: translation-publication-selection.js <selection|ready> [options]\n')
    return null
  }
  if (command === 'selection') {
    const handoff = JSON.parse(required(values.handoff || env.HANDOFF_JSON, 'handoff'))
    const selection = buildTranslationPublicationSelection({
      handoff,
      repository: required(values.repository || env.GITHUB_REPOSITORY, 'repository'),
      runId: positiveInteger(values['run-id'] || env.GITHUB_RUN_ID, 'run-id'),
      runAttempt: positiveInteger(values['run-attempt'] || env.GITHUB_RUN_ATTEMPT, 'run-attempt'),
      publish: boolean(required(values.publish || env.PUBLISH, 'publish'), 'publish'),
      runTranslations: boolean(required(values['run-translations'] || env.RUN_TRANSLATIONS, 'run-translations'), 'run-translations'),
    })
    writePublicationDocument(required(values.output, 'output'), selection)
    return selection
  }
  const selection = readPublicationDocument(required(values.selection, 'selection'), 'publication-selection')
  const ready = buildTranslationPublicationReady({
    selection,
    unitKey: required(values['unit-key'], 'unit-key'),
    checkpointArchive: required(values['checkpoint-archive'], 'checkpoint-archive'),
    checkpointManifest: required(values['checkpoint-manifest'], 'checkpoint-manifest'),
    baselineArchive: required(values['baseline-archive'], 'baseline-archive'),
    baselineManifest: required(values['baseline-manifest'], 'baseline-manifest'),
  })
  writePublicationDocument(required(values.output, 'output'), ready, {selection})
  return ready
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {
  TRANSLATION_UNIT_KEYS,
  buildTranslationPublicationReady,
  buildTranslationPublicationSelection,
  main,
}
