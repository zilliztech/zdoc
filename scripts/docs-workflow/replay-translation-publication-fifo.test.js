'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {createCheckpointArtifact} = require('./create-checkpoint-artifact')
const {getContentGroup} = require('./content-groups')
const {finalizePublicationSelection, writePublicationDocument} = require('./publication-contracts')
const {buildTranslationPublicationReady, buildTranslationPublicationSelection} = require('./translation-publication-selection')
const {translationOwnedPaths} = require('./validate-checkpoint-artifact')
const {
  authenticateAndExtractArchive,
  cleanupGuidesPairs,
  deriveFifoUnitKeys,
  faultInjectRun,
  inspectRun,
  parseArgs,
  prepareGuidesPairs,
  replayRun,
  usage,
  verifyEvidence,
} = require('./replay-translation-publication-fifo')

const SHA = character => character.repeat(40)

function faultEvidence(scenario) {
  const sdk = 'translation/ja-JP/python'
  const guides = 'translation/ja-JP/guides'
  const later = 'translation/ja-JP/java'
  const common = {status: 'complete', overallStatus: 'success'}
  if (scenario === 'sdk-before-guides') return {...common, calculatedOrder: [sdk, guides, later], invoked: [sdk, guides, later]}
  if (scenario === 'guides-before-sdk') return {...common, calculatedOrder: [guides, sdk, later], invoked: [guides, sdk, later]}
  if (scenario === 'cache-conflict') return {
    ...common, overallStatus: 'failure', calculatedOrder: [sdk, guides, later], invoked: [sdk, guides, later], ordinaryFailureContinued: true,
    units: [
      {unitKey: sdk, sequence: 1, status: 'published'},
      {unitKey: guides, sequence: 2, status: 'publish_failed', failure: {code: 'CACHE_CONFLICT'}},
      {unitKey: later, sequence: 3, status: 'published'},
    ],
  }
  if (scenario === 'cas-drift') return {
    ...common,
    cas: {status: 'published', attempts: 2, abandonedCandidateSha: SHA('1'), resultSha: SHA('2'), remoteSha: SHA('2'), remoteRacePreserved: true, failure: null},
  }
  if (scenario === 'ambiguous-push') return {
    ...common,
    exact: {candidateSha: SHA('3'), remoteSha: SHA('3'), containsCandidate: true, status: 'published', attempts: 1},
    descendant: {candidateSha: SHA('4'), remoteSha: SHA('5'), containsCandidate: true, status: 'published', attempts: 1},
  }
  if (scenario === 'reconciliation-failure') return {
    ...common, overallStatus: 'orchestrator_failed', calculatedOrder: [sdk, guides], invoked: [sdk, guides],
    orchestratorFailure: {code: 'RECONCILIATION_FAILED', phase: 'reconciliation', message: 'injected reconciliation failure', retryable: false},
  }
  return {
    ...common, overallStatus: 'orchestrator_failed', calculatedOrder: [sdk, guides, later], invoked: [sdk, guides],
    unknownUnitKey: guides, laterWritesStopped: true,
    units: [
      {unitKey: sdk, sequence: 1, status: 'published'},
      {unitKey: guides, sequence: 2, status: 'publish_failed', remoteState: 'unknown'},
      {unitKey: later, sequence: null, status: 'ready'},
    ],
  }
}

function temporary(prefix) {
  return fs.mkdtempSync(path.join('/private/tmp', prefix))
}

function installFakeGh(t, fixture) {
  const root = temporary('translation-fake-gh-')
  const bin = path.join(root, 'bin')
  const fixtureFile = path.join(root, 'fixture.json')
  const log = path.join(root, 'calls.jsonl')
  fs.mkdirSync(bin)
  fs.writeFileSync(fixtureFile, `${JSON.stringify(fixture)}\n`)
  const executable = path.join(bin, 'gh')
  fs.writeFileSync(executable, `#!/usr/bin/env node
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const fixture = JSON.parse(fs.readFileSync(process.env.TRANSLATION_FAKE_GH_FIXTURE, 'utf8'))
const args = process.argv.slice(2)
fs.appendFileSync(process.env.TRANSLATION_FAKE_GH_LOG, JSON.stringify(args) + '\\n')
if (args[0] === 'repo' && args[1] === 'view') process.stdout.write(fixture.repository + '\\n')
else if (args[0] === 'api') {
  const endpoint = args.at(-1)
  const value = fixture.api[endpoint]
  if (value === undefined) { console.error('unknown fake gh endpoint: ' + endpoint); process.exit(2) }
  process.stdout.write(JSON.stringify(value))
} else if (args[0] === 'run' && args[1] === 'download') {
  const runId = args[2]
  const name = args[args.indexOf('-n') + 1]
  const destination = args[args.indexOf('-D') + 1]
  const source = path.join(fixture.downloadRoot, runId, encodeURIComponent(name))
  fs.mkdirSync(destination, {recursive: true})
  fs.cpSync(source, destination, {recursive: true})
} else { console.error('unknown fake gh command: ' + args.join(' ')); process.exit(2) }
`)
  fs.chmodSync(executable, 0o755)
  const previous = {
    PATH: process.env.PATH,
    TRANSLATION_FAKE_GH_FIXTURE: process.env.TRANSLATION_FAKE_GH_FIXTURE,
    TRANSLATION_FAKE_GH_LOG: process.env.TRANSLATION_FAKE_GH_LOG,
  }
  process.env.PATH = `${bin}:${process.env.PATH}`
  process.env.TRANSLATION_FAKE_GH_FIXTURE = fixtureFile
  process.env.TRANSLATION_FAKE_GH_LOG = log
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    fs.rmSync(root, {recursive: true, force: true})
  })
  return {log, calls: () => fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : []}
}

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim()
}

function put(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, value)
}

function archiveCheckpoint(root, artifactDirectory, name) {
  const staging = path.join(root, `${name}-archive`)
  const archive = path.join(root, `${name}.tar`)
  fs.mkdirSync(staging)
  fs.cpSync(fs.realpathSync(artifactDirectory), path.join(staging, 'checkpoint-group'), {recursive: true})
  execFileSync('tar', ['-cf', archive, '-C', staging, 'checkpoint-group'])
  return archive
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function valueSha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function adversarialCheckpointArchive(root, label, kind) {
  const archive = path.join(root, `${label}.tar`)
  const manifest = kind === 'corrupt-manifest'
    ? '{not-json\n'
    : `${JSON.stringify({schemaVersion: 1, stage: 'source', group: 'python', masterSha: SHA('a')})}\n`
  const script = `
import io, sys, tarfile
archive, kind, manifest = sys.argv[1], sys.argv[2], sys.argv[3].encode()
with tarfile.open(archive, 'w') as tar:
    directory = tarfile.TarInfo('checkpoint-group')
    directory.type = tarfile.DIRTYPE
    tar.addfile(directory)
    item = tarfile.TarInfo('checkpoint-group/manifest.json')
    item.size = len(manifest)
    tar.addfile(item, io.BytesIO(manifest))
    if kind == 'traversal':
        payload = b'escaped'
        item = tarfile.TarInfo('checkpoint-group/../../escaped.txt')
        item.size = len(payload)
        tar.addfile(item, io.BytesIO(payload))
    elif kind == 'symlink':
        item = tarfile.TarInfo('checkpoint-group/payload-link')
        item.type = tarfile.SYMTYPE
        item.linkname = '/private/tmp'
        tar.addfile(item)
`
  execFileSync('python3', ['-c', script, archive, kind, manifest])
  return {archive, manifestSha256: crypto.createHash('sha256').update(manifest).digest('hex')}
}

function copyOwnedPaths(source, destination, ownedPaths) {
  fs.mkdirSync(destination, {recursive: true})
  for (const owned of ownedPaths) {
    const from = path.join(source, owned)
    if (!fs.existsSync(from)) continue
    const to = path.join(destination, owned)
    fs.mkdirSync(path.dirname(to), {recursive: true})
    fs.cpSync(from, to, {recursive: true})
  }
}

function handoff() {
  const unitKeys = [
    'translation/ja-JP/guides',
    'translation/ja-JP/python', 'translation/zh-CN-reference/python',
    'translation/ja-JP/java', 'translation/zh-CN-reference/java',
    'translation/ja-JP/node', 'translation/zh-CN-reference/node',
    'translation/ja-JP/go', 'translation/zh-CN-reference/go',
    'translation/ja-JP/cli', 'translation/zh-CN-reference/cli',
    'translation/ja-JP/rest', 'translation/zh-CN-reference/rest',
  ]
  return {
    schemaVersion: 2,
    locale: 'all',
    group: 'all',
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    targetBaselineSha: SHA('b'),
    units: unitKeys.map((unitKey, publicationOrder) => {
      const [, target, group] = unitKey.split('/')
      return {
        target,
        group,
        sourceGroup: group,
        sourceBaselineSha: SHA('c'),
        sourceCheckpointSha: SHA('d'),
        targetBaselineSha: SHA('b'),
        publicationOrder,
      }
    }),
  }
}

function fixture(t) {
  const root = temporary('translation-publication-replay-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runRoot = path.join(root, 'run')
  const evidenceRoot = path.join(root, 'evidence')
  const bareRemote = path.join(root, 'isolated.git')
  fs.mkdirSync(runRoot)
  fs.mkdirSync(bareRemote)
  const selection = buildTranslationPublicationSelection({
    handoff: handoff(), repository: 'zilliztech/zdoc', runId: 30864046835, runAttempt: 1,
    publish: false, runTranslations: true,
  })
  const jobs = selection.units.map((unit, index) => ({
    id: 1000 + index,
    name: unit.producerJob,
    run_attempt: 1,
    status: 'completed',
    conclusion: 'success',
    completed_at: unit.group === 'guides'
      ? '2026-08-06T00:24:53.000Z'
      : `2026-08-06T00:${String(index).padStart(2, '0')}:00.000Z`,
  }))
  const artifacts = []
  for (const unit of selection.units) {
    const token = unit.unitKey.replaceAll('/', '__')
    const directory = path.join(runRoot, 'artifacts', token)
    fs.mkdirSync(directory, {recursive: true})
    for (const [kind, name] of Object.entries(unit.artifacts)) {
      const archive = path.join(directory, `${kind}.tar`)
      fs.writeFileSync(archive, `${unit.unitKey}:${kind}`)
      artifacts.push({
        unitKey: unit.unitKey, kind, id: artifacts.length + 1, name,
        digest: `sha256:${(kind === 'checkpoint' ? 'e' : 'f').repeat(64)}`,
        archive: path.relative(runRoot, archive),
      })
    }
    const ready = path.join(directory, 'publication-ready.json')
    fs.writeFileSync(ready, '{}\n')
    artifacts.push({
      unitKey: unit.unitKey, kind: 'ready', id: artifacts.length + 1,
      name: `publication-ready-translation-${unit.unitKey.replaceAll('/', '-')}-30864046835-1`,
      digest: `sha256:${'1'.repeat(64)}`, archive: path.relative(runRoot, ready),
    })
  }
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  const guidesBatchFile = path.join(runRoot, 'artifacts', 'guides-batch-1.json')
  fs.writeFileSync(guidesBatchFile, '{"batch":1}\n')
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1,
    runId: selection.runId,
    runAttempt: selection.runAttempt,
    repository: selection.repository,
    toolingSha: selection.toolingSha,
    initialTargetSha: selection.initialTargetSha,
    selectionSha256: selection.selectionSha256,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey),
    fifoUnitKeys: deriveFifoUnitKeys(selection, jobs),
    artifacts,
    guidesBatchArtifacts: [{
      id: 9001, name: 'translation-report-ja-JP-guides-30864046835-batch-1', digest: `sha256:${'9'.repeat(64)}`,
      archive: path.relative(runRoot, guidesBatchFile),
    }],
  }, null, 2)}\n`)
  return {root, runRoot, evidenceRoot, bareRemote, selection, jobs}
}

async function realFaultFixture(t) {
  const root = temporary('translation-publication-real-fault-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const sourceRepository = path.join(root, 'source')
  const sourceRemote = path.join(root, 'source.git')
  const runRoot = path.join(root, 'run')
  const evidenceRoot = path.join(root, 'evidence')
  fs.mkdirSync(runRoot)
  const toolingSha = git(process.cwd(), 'rev-parse', 'HEAD')
  git(root, 'init', '--bare', sourceRemote)
  git(root, 'clone', process.cwd(), sourceRepository)
  git(sourceRepository, 'checkout', '-B', 'dev', toolingSha)
  git(sourceRepository, 'config', 'user.name', 'Replay Test')
  git(sourceRepository, 'config', 'user.email', 'replay@example.com')
  put(sourceRepository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  put(sourceRepository, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/python.md', 'old\n')
  put(sourceRepository, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/java.md', 'old\n')
  git(sourceRepository, 'add', '.')
  git(sourceRepository, 'commit', '-m', 'seed')
  git(sourceRepository, 'remote', 'remove', 'origin')
  git(sourceRepository, 'remote', 'add', 'origin', sourceRemote)
  git(sourceRepository, 'push', '-u', 'origin', 'dev')
  const baselineSha = git(sourceRepository, 'rev-parse', 'HEAD')
  const inputHandoff = handoff()
  inputHandoff.toolingSha = toolingSha
  inputHandoff.targetBaselineSha = baselineSha
  inputHandoff.units = inputHandoff.units.map(unit => ({...unit, sourceBaselineSha: baselineSha, sourceCheckpointSha: baselineSha, targetBaselineSha: baselineSha}))
  const built = buildTranslationPublicationSelection({
    handoff: inputHandoff, repository: 'zilliztech/zdoc', runId: 40000000001, runAttempt: 1,
    publish: false, runTranslations: true,
  })
  const selection = finalizePublicationSelection({
    ...built,
    units: built.units.map(unit => ({...unit, validationCommands: ['true']})),
    selectionSha256: undefined,
  })
  const jobs = selection.units.map((unit, index) => ({
    id: 2000 + index, name: unit.producerJob, run_attempt: 1, status: 'completed', conclusion: 'success',
    completed_at: `2026-08-06T00:${String(index).padStart(2, '0')}:00.000Z`,
  }))
  const artifacts = []
  let selectedSdk = null
  let laterSdk = null
  for (const unit of selection.units) {
    const token = unit.unitKey.replaceAll('/', '__')
    const directory = path.join(runRoot, 'artifacts', token)
    fs.mkdirSync(directory, {recursive: true})
    for (const [kind, name] of Object.entries(unit.artifacts)) {
      const archive = path.join(directory, `${kind}.tar`)
      fs.writeFileSync(archive, `${unit.unitKey}:${kind}`)
      artifacts.push({unitKey: unit.unitKey, kind, id: artifacts.length + 1, name, digest: `sha256:${'a'.repeat(64)}`, archive: path.relative(runRoot, archive)})
    }
    const ready = path.join(directory, 'publication-ready.json')
    fs.writeFileSync(ready, '{}\n')
    artifacts.push({
      unitKey: unit.unitKey, kind: 'ready', id: artifacts.length + 1,
      name: `publication-ready-translation-${unit.unitKey.replaceAll('/', '-')}-40000000001-1`,
      digest: `sha256:${'b'.repeat(64)}`, archive: path.relative(runRoot, ready),
    })
    if (unit.unitKey === 'translation/ja-JP/python') selectedSdk = unit
    if (unit.unitKey === 'translation/ja-JP/java') laterSdk = unit
  }
  async function installRealSdkPair(unit, mutate) {
    const pairRoot = path.join(root, `real-${unit.group}`)
    const baseline = path.join(pairRoot, 'baseline')
    const workspace = path.join(pairRoot, 'workspace')
    fs.mkdirSync(pairRoot)
    const ownedPaths = translationOwnedPaths(unit.target, getContentGroup(unit.group))
    copyOwnedPaths(sourceRepository, baseline, ownedPaths)
    copyOwnedPaths(sourceRepository, workspace, ownedPaths)
    mutate(workspace)
    const pair = {}
    const manifests = {}
    for (const [kind, source] of [['baseline', baseline], ['checkpoint', workspace]]) {
      const output = path.join(pairRoot, `${kind}-artifact`)
      await createCheckpointArtifact({
        group: unit.group, masterSha: toolingSha, devBaselineSha: baselineSha,
        baselineDir: baseline, workspace: source, output, includeTranslationCache: true,
        translationTarget: 'ja-JP', sourceSite: 'en', targetSite: 'en',
        sourceCheckpointSha: baselineSha, toolingSha, validationCommands: ['true'],
      })
      pair[kind] = archiveCheckpoint(pairRoot, output, kind)
      manifests[kind] = path.join(fs.realpathSync(output), 'manifest.json')
      const record = artifacts.find(artifact => artifact.unitKey === unit.unitKey && artifact.kind === kind)
      const destination = path.join(runRoot, record.archive)
      fs.copyFileSync(pair[kind], destination)
      record.digest = `sha256:${sha256(destination)}`
      record.fileSha256 = sha256(destination)
    }
    const ready = buildTranslationPublicationReady({
      selection, unitKey: unit.unitKey,
      checkpointArchive: pair.checkpoint, checkpointManifest: manifests.checkpoint,
      baselineArchive: pair.baseline, baselineManifest: manifests.baseline,
    })
    const readyRecord = artifacts.find(artifact => artifact.unitKey === unit.unitKey && artifact.kind === 'ready')
    const readyFile = path.join(runRoot, readyRecord.archive)
    writePublicationDocument(readyFile, ready, {selection})
    readyRecord.digest = `sha256:${sha256(readyFile)}`
    readyRecord.fileSha256 = sha256(readyFile)
  }
  await installRealSdkPair(selectedSdk, workspace => {
    put(workspace, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/python.md', 'translated\n')
    put(workspace, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {
      'content/en/api/python.md': {
        sourceHash: '1'.repeat(64),
        targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/python.md',
        translatedAt: '2026-08-06T00:00:00.000Z',
      },
    }})}\n`)
  })
  await installRealSdkPair(laterSdk, workspace => {
    put(workspace, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/java.md', 'translated\n')
  })
  const guides = selection.units.find(unit => unit.strategy === 'ja-guides')
  const pendingSetSha256 = '0'.repeat(64)
  const guidesManifest = {
    schemaVersion: 1, stage: 'translation-guides-batch-set', group: 'guides',
    runId: selection.runId, runAttempt: selection.runAttempt,
    sourceCheckpointSha: guides.sourceCheckpointSha, toolingSha: guides.toolingSha,
    targetSha: selection.initialTargetSha, batchCount: 0, pendingSetSha256,
  }
  const guidesPlan = {
    schemaVersion: 1, group: 'guides', batchCount: 0, pendingSetSha256,
    sourceCheckpointSha: guides.sourceCheckpointSha, targetSha: selection.initialTargetSha,
  }
  const guidesPair = {}
  const guidesManifests = {}
  for (const kind of ['checkpoint', 'baseline']) {
    const directory = path.join(root, `guides-${kind}-aggregate`)
    const group = path.join(directory, 'checkpoint-group')
    fs.mkdirSync(group, {recursive: true})
    fs.writeFileSync(path.join(group, 'manifest.json'), `${JSON.stringify(guidesManifest)}\n`)
    fs.writeFileSync(path.join(group, 'translation-plan.json'), `${JSON.stringify(guidesPlan)}\n`)
    const archive = path.join(root, `guides-${kind}.tar`)
    execFileSync('tar', ['-cf', archive, '-C', directory, 'checkpoint-group'])
    guidesPair[kind] = archive
    guidesManifests[kind] = path.join(group, 'manifest.json')
    const record = artifacts.find(artifact => artifact.unitKey === guides.unitKey && artifact.kind === kind)
    const destination = path.join(runRoot, record.archive)
    fs.copyFileSync(archive, destination)
    record.digest = `sha256:${sha256(destination)}`
    record.fileSha256 = sha256(destination)
  }
  const guidesReady = buildTranslationPublicationReady({
    selection, unitKey: guides.unitKey,
    checkpointArchive: guidesPair.checkpoint, checkpointManifest: guidesManifests.checkpoint,
    baselineArchive: guidesPair.baseline, baselineManifest: guidesManifests.baseline,
  })
  const guidesReadyRecord = artifacts.find(artifact => artifact.unitKey === guides.unitKey && artifact.kind === 'ready')
  const guidesReadyFile = path.join(runRoot, guidesReadyRecord.archive)
  writePublicationDocument(guidesReadyFile, guidesReady, {selection})
  guidesReadyRecord.digest = `sha256:${sha256(guidesReadyFile)}`
  guidesReadyRecord.fileSha256 = sha256(guidesReadyFile)
  const guidesBatchFile = path.join(runRoot, 'artifacts', 'guides-batch-1.json')
  fs.writeFileSync(guidesBatchFile, '{"batch":1}\n')
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  fs.cpSync(sourceRemote, path.join(runRoot, 'source.git'), {recursive: true})
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1, runId: selection.runId, runAttempt: selection.runAttempt, repository: selection.repository,
    toolingSha, initialTargetSha: baselineSha, selectionSha256: selection.selectionSha256,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys: deriveFifoUnitKeys(selection, jobs), artifacts,
    guidesBatchArtifacts: [{id: 9002, name: 'translation-report-ja-JP-guides-40000000001-batch-1', digest: `sha256:${'9'.repeat(64)}`, archive: path.relative(runRoot, guidesBatchFile)}],
  }, null, 2)}\n`)
  fs.mkdirSync(evidenceRoot)
  fs.cpSync(runRoot, path.join(evidenceRoot, 'retained-run'), {recursive: true})
  return {root, runRoot, evidenceRoot, selection, selectedSdk, laterSdk}
}

async function realReplayFixture(t) {
  const root = temporary('translation-publication-real-replay-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runRoot = path.join(root, 'run')
  const evidenceRoot = path.join(root, 'evidence')
  const bareRemote = path.join(root, 'replay.git')
  fs.mkdirSync(runRoot)
  const toolingSha = git(process.cwd(), 'rev-parse', 'HEAD')
  const inputHandoff = handoff()
  inputHandoff.toolingSha = toolingSha
  inputHandoff.targetBaselineSha = toolingSha
  inputHandoff.units = inputHandoff.units.map(unit => ({...unit, sourceBaselineSha: toolingSha, sourceCheckpointSha: toolingSha, targetBaselineSha: toolingSha}))
  const built = buildTranslationPublicationSelection({
    handoff: inputHandoff, repository: 'zilliztech/zdoc', runId: 40000000002, runAttempt: 1,
    publish: false, runTranslations: true,
  })
  const selection = finalizePublicationSelection({
    ...built,
    units: built.units.map(unit => ({...unit, validationCommands: ['true']})),
    selectionSha256: undefined,
  })
  const jobs = selection.units.map((unit, index) => ({
    id: 3000 + index, name: unit.producerJob, run_attempt: 1, status: 'completed', conclusion: 'success',
    completed_at: `2026-08-06T00:${String(index).padStart(2, '0')}:00.000Z`,
  }))
  const artifacts = []
  for (const unit of selection.units) {
    const unitRoot = path.join(root, 'pairs', unit.unitKey.replaceAll('/', '__'))
    fs.mkdirSync(unitRoot, {recursive: true})
    let checkpointArchive
    let baselineArchive
    let checkpointManifest
    let baselineManifest
    if (unit.strategy === 'ja-guides') {
      const pendingSetSha256 = '0'.repeat(64)
      const manifest = {
        schemaVersion: 1, stage: 'translation-guides-batch-set', group: 'guides',
        runId: selection.runId, runAttempt: selection.runAttempt,
        sourceCheckpointSha: unit.sourceCheckpointSha, toolingSha: unit.toolingSha,
        targetSha: selection.initialTargetSha, batchCount: 0, pendingSetSha256,
      }
      const plan = {
        schemaVersion: 1, group: 'guides', batchCount: 0, pendingSetSha256,
        sourceCheckpointSha: unit.sourceCheckpointSha, targetSha: selection.initialTargetSha,
      }
      for (const kind of ['checkpoint', 'baseline']) {
        const directory = path.join(unitRoot, `${kind}-aggregate`)
        const group = path.join(directory, 'checkpoint-group')
        fs.mkdirSync(group, {recursive: true})
        fs.writeFileSync(path.join(group, 'manifest.json'), `${JSON.stringify(manifest)}\n`)
        fs.writeFileSync(path.join(group, 'translation-plan.json'), `${JSON.stringify(plan)}\n`)
        const archive = path.join(unitRoot, `${kind}.tar`)
        execFileSync('tar', ['-cf', archive, '-C', directory, 'checkpoint-group'])
        if (kind === 'checkpoint') {
          checkpointArchive = archive
          checkpointManifest = path.join(group, 'manifest.json')
        } else {
          baselineArchive = archive
          baselineManifest = path.join(group, 'manifest.json')
        }
      }
    } else {
      const ownedPaths = translationOwnedPaths(unit.target, getContentGroup(unit.group))
      const baselineWorkspace = path.join(unitRoot, 'baseline-workspace')
      const checkpointWorkspace = path.join(unitRoot, 'checkpoint-workspace')
      copyOwnedPaths(process.cwd(), baselineWorkspace, ownedPaths)
      copyOwnedPaths(process.cwd(), checkpointWorkspace, ownedPaths)
      if (unit.target === 'ja-JP' && !fs.existsSync(path.join(baselineWorkspace, '.translation-cache/ja-JP.json'))) {
        put(baselineWorkspace, '.translation-cache/ja-JP.json', '{"files":{}}\n')
        put(checkpointWorkspace, '.translation-cache/ja-JP.json', '{"files":{}}\n')
      }
      for (const [kind, workspace] of [['baseline', baselineWorkspace], ['checkpoint', checkpointWorkspace]]) {
        const output = path.join(unitRoot, `${kind}-artifact`)
        await createCheckpointArtifact({
          group: unit.group, masterSha: toolingSha, devBaselineSha: toolingSha,
          baselineDir: process.cwd(), workspace, output, includeTranslationCache: true,
          translationTarget: unit.target, sourceCheckpointSha: toolingSha, toolingSha,
          validationCommands: ['true'],
        })
        const archive = archiveCheckpoint(unitRoot, output, kind)
        const manifest = path.join(fs.realpathSync(output), 'manifest.json')
        if (kind === 'checkpoint') {
          checkpointArchive = archive
          checkpointManifest = manifest
        } else {
          baselineArchive = archive
          baselineManifest = manifest
        }
      }
    }
    const ready = buildTranslationPublicationReady({
      selection, unitKey: unit.unitKey, checkpointArchive, checkpointManifest, baselineArchive, baselineManifest,
    })
    const token = unit.unitKey.replaceAll('/', '__')
    const destination = path.join(runRoot, 'artifacts', token)
    fs.mkdirSync(destination, {recursive: true})
    for (const [kind, name, source] of [
      ['checkpoint', unit.artifacts.checkpoint, checkpointArchive],
      ['baseline', unit.artifacts.baseline, baselineArchive],
    ]) {
      const file = path.join(destination, `${kind}.tar`)
      fs.copyFileSync(source, file)
      artifacts.push({
        unitKey: unit.unitKey, kind, id: artifacts.length + 1, name,
        digest: `sha256:${sha256(file)}`, fileSha256: sha256(file), archive: path.relative(runRoot, file),
      })
    }
    const readyFile = path.join(destination, 'publication-ready.json')
    writePublicationDocument(readyFile, ready, {selection})
    artifacts.push({
      unitKey: unit.unitKey, kind: 'ready', id: artifacts.length + 1,
      name: `publication-ready-translation-${unit.unitKey.replaceAll('/', '-')}-${selection.runId}-${selection.runAttempt}`,
      digest: `sha256:${sha256(readyFile)}`, fileSha256: sha256(readyFile), archive: path.relative(runRoot, readyFile),
    })
  }
  const guidesBatchFile = path.join(runRoot, 'artifacts', 'guides-batch-1.json')
  fs.writeFileSync(guidesBatchFile, '{"batch":1}\n')
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1, runId: selection.runId, runAttempt: selection.runAttempt, repository: selection.repository,
    toolingSha, initialTargetSha: toolingSha, selectionSha256: selection.selectionSha256,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys: deriveFifoUnitKeys(selection, jobs), artifacts,
    guidesBatchArtifacts: [{
      id: 9003, name: `translation-report-ja-JP-guides-${selection.runId}-batch-1`,
      digest: `sha256:${sha256(guidesBatchFile)}`, fileSha256: sha256(guidesBatchFile), archive: path.relative(runRoot, guidesBatchFile),
    }],
  }, null, 2)}\n`)
  git(root, 'clone', '--bare', process.cwd(), bareRemote)
  git(root, '--git-dir', bareRemote, 'config', '--remove-section', 'remote.origin')
  git(root, '--git-dir', bareRemote, 'update-ref', 'refs/heads/dev', toolingSha)
  return {root, runRoot, evidenceRoot, bareRemote, selection}
}

function manifestArchive(root, label, manifest) {
  const directory = path.join(root, `${label}-contents`)
  const group = path.join(directory, 'checkpoint-group')
  fs.mkdirSync(group, {recursive: true})
  fs.writeFileSync(path.join(group, 'manifest.json'), `${JSON.stringify(manifest)}\n`)
  const archive = path.join(root, `${label}.tar`)
  execFileSync('tar', ['-cf', archive, '-C', directory, 'checkpoint-group'])
  return archive
}

async function completeLegacyGhFixture(t) {
  const root = temporary('translation-legacy-gh-fixture-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repository = 'zilliztech/zdoc'
  const runId = 40000000004
  const parentRunId = 39999999999
  const runAttempt = 1
  const toolingSha = git(process.cwd(), 'rev-parse', 'HEAD')
  const parentToolingSha = toolingSha
  const sourceCheckpointSha = git(process.cwd(), 'rev-list', '--all', '--max-count=1', '--', 'packages/docs-tooling/src/lark/meta/assembly/guides.json')
  assert.match(sourceCheckpointSha, /^[0-9a-f]{40}$/)
  const sourceRepository = path.join(root, 'source-repository')
  git(root, 'clone', process.cwd(), sourceRepository)
  git(sourceRepository, 'checkout', '--detach', sourceCheckpointSha)
  const targetRepository = path.join(root, 'target-repository')
  git(root, 'clone', process.cwd(), targetRepository)
  git(targetRepository, 'restore', '--source', sourceCheckpointSha, '--staged', '--worktree', '--',
    ...getContentGroup('guides').ownedPaths,
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    '.translation-cache/ja-JP.json')
  git(targetRepository, 'config', 'user.name', 'translation legacy fixture')
  git(targetRepository, 'config', 'user.email', 'translation-legacy-fixture@example.com')
  git(targetRepository, 'commit', '-m', 'test: materialize retained Guides source authority')
  const initialTargetSha = git(targetRepository, 'rev-parse', 'HEAD')
  const previousAlternates = process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES
  const targetObjects = fs.realpathSync(path.join(targetRepository, '.git', 'objects'))
  process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES = previousAlternates
    ? `${targetObjects}${path.delimiter}${previousAlternates}`
    : targetObjects
  t.after(() => {
    if (previousAlternates === undefined) delete process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES
    else process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES = previousAlternates
  })
  const downloadRoot = path.join(root, 'downloads')
  const childArtifacts = []
  const parentArtifacts = []
  let artifactId = 10000
  function addArtifact(run, list, name, file) {
    const directory = path.join(downloadRoot, String(run), encodeURIComponent(name))
    fs.mkdirSync(directory, {recursive: true})
    fs.copyFileSync(file, path.join(directory, path.basename(file)))
    list.push({
      id: artifactId++, name, expired: false, digest: `sha256:${sha256(file)}`,
      created_at: '2026-08-06T00:00:00Z', updated_at: '2026-08-06T00:01:00Z',
    })
  }
  const sourceManifest = group => ({
    schemaVersion: 1, stage: 'source', group, masterSha: parentToolingSha,
    devBaselineSha: group === 'guides' ? sourceCheckpointSha : toolingSha,
    createdAt: '2026-08-06T00:00:00.000Z', ownershipVersion: 1, files: [], deletions: [], snapshotManual: group,
    validation: {commands: [], passed: true},
  })
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest', 'guides']) {
    const suffix = group === 'guides' ? 'guides-en' : group
    addArtifact(parentRunId, parentArtifacts, `docs-checkpoint-${suffix}-${parentRunId}`,
      manifestArchive(root, `parent-${group}`, sourceManifest(group)))
  }
  const jobs = []
  let completionMinute = 1
  for (const target of ['ja-JP', 'zh-CN-reference']) {
    for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
      const output = path.join(root, `${target}-${group}-artifact`)
      await createCheckpointArtifact({
        group, masterSha: toolingSha, devBaselineSha: toolingSha,
        baselineDir: targetRepository, workspace: targetRepository, output, includeTranslationCache: true,
        translationTarget: target, sourceCheckpointSha: toolingSha, toolingSha, validationCommands: ['true'],
      })
      const archive = archiveCheckpoint(root, output, `${target}-${group}`)
      for (const kind of ['checkpoint', 'baseline']) {
        addArtifact(runId, childArtifacts, `translation-${kind}-${target}-${group}-${runId}`, archive)
      }
      jobs.push({
        id: 20000 + jobs.length,
        name: `translate_sdk (${target}, ${group}, ${group}, ${toolingSha}, ${toolingSha}) / translate`,
        run_attempt: runAttempt, status: 'completed', conclusion: 'success',
        completed_at: `2026-08-06T00:${String(completionMinute++).padStart(2, '0')}:00Z`,
      })
    }
  }
  const guidesBaseline = path.join(root, 'guides-baseline-workspace')
  const guidesCheckpoint = path.join(root, 'guides-checkpoint-workspace')
  copyOwnedPaths(sourceRepository, guidesBaseline, translationOwnedPaths('ja-JP', getContentGroup('guides')))
  fs.cpSync(guidesBaseline, guidesCheckpoint, {recursive: true})
  const sourcePath = 'content/en/guides/tutorials/get-started/quickstarts/quick-start.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/get-started/quickstarts/quick-start.md'
  const cachePath = '.translation-cache/ja-JP.json'
  if (!fs.existsSync(path.join(guidesBaseline, cachePath))) put(guidesBaseline, cachePath, '{"files":{}}\n')
  if (!fs.existsSync(path.join(guidesCheckpoint, cachePath))) put(guidesCheckpoint, cachePath, '{"files":{}}\n')
  put(guidesCheckpoint, targetPath, '# Legacy retained Japanese translation\n')
  const cache = JSON.parse(fs.readFileSync(path.join(guidesCheckpoint, cachePath), 'utf8'))
  cache.files[sourcePath] = {
    sourceHash: crypto.createHash('sha256').update(fs.readFileSync(path.join(sourceRepository, sourcePath))).digest('hex'),
    targetPath,
    translatedAt: '2026-08-06T00:00:00.000Z',
  }
  put(guidesCheckpoint, cachePath, `${JSON.stringify(cache, null, 2)}\n`)
  const batch = {batchIndex: 0, batchNumber: 1, batchCount: 1, batchSize: 1, pendingCount: 1, pendingSetSha256: 'c'.repeat(64)}
  const batchInput = path.join(root, 'guides-batch-input.json')
  fs.writeFileSync(batchInput, `${JSON.stringify({
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha,
    batch,
    candidates: [{sourcePath, targetPath, sourceHash: cache.files[sourcePath].sourceHash}],
    sourceDelta: {deletedI18n: [], renamed: [], retirementCandidates: []},
  }, null, 2)}\n`)
  const guidesArtifacts = {}
  for (const [kind, workspace] of [['checkpoint', guidesCheckpoint], ['baseline', guidesBaseline]]) {
    const output = path.join(root, `guides-${kind}-artifact`)
    await createCheckpointArtifact({
      group: 'guides', masterSha: toolingSha, devBaselineSha: sourceCheckpointSha,
      baselineDir: guidesBaseline, workspace, output, includeTranslationCache: true,
      batch, batchInputPath: batchInput,
    })
    guidesArtifacts[kind] = archiveCheckpoint(root, output, `guides-${kind}-batch-1`)
    addArtifact(runId, childArtifacts, `translation-${kind}-ja-JP-guides-${runId}-batch-1`, guidesArtifacts[kind])
  }
  jobs.push({
    id: 29999, name: 'translate_guides_batches (1) / translate', run_attempt: runAttempt,
    status: 'completed', conclusion: 'success', completed_at: '2026-08-06T00:24:45Z',
  })
  const publicationReport = path.join(root, 'publication-report.json')
  fs.writeFileSync(publicationReport, `${JSON.stringify({
    schemaVersion: 1, runId, runAttempt, group: 'guides', masterSha: toolingSha,
    sourceCheckpointSha, expectedTargetSha: initialTargetSha, status: 'published', resultSha: initialTargetSha,
  })}\n`)
  addArtifact(runId, childArtifacts, `docs-translation-publication-guides-${runId}-${runAttempt}`, publicationReport)
  const api = {
    [`repos/${repository}/actions/runs/${runId}`]: {
      id: runId, run_attempt: runAttempt, status: 'completed', conclusion: 'success', head_sha: toolingSha,
      path: '.github/workflows/translate-codex.yml', event: 'workflow_dispatch', repository: {full_name: repository},
      display_title: `translate docs (${parentRunId}-1)`, created_at: '2026-08-06T00:00:00Z',
      updated_at: '2026-08-06T00:30:00Z', run_started_at: '2026-08-06T00:00:00Z',
    },
    [`repos/${repository}/actions/runs/${runId}/attempts/${runAttempt}/jobs?filter=all&per_page=100`]: [{jobs}],
    [`repos/${repository}/actions/runs/${runId}/artifacts?per_page=100`]: [{artifacts: childArtifacts}],
    [`repos/${repository}/actions/runs/${parentRunId}`]: {
      id: parentRunId, run_attempt: 1, status: 'completed', conclusion: 'success', head_sha: parentToolingSha,
      path: '.github/workflows/fetch-docs.yml', event: 'workflow_dispatch', repository: {full_name: repository},
    },
    [`repos/${repository}/actions/runs/${parentRunId}/artifacts?per_page=100`]: [{artifacts: parentArtifacts}],
  }
  return {root, repository, runId, parentRunId, runAttempt, toolingSha, initialTargetSha, targetRepository, downloadRoot, api}
}

test('strict CLI accepts only safe absolute /private/tmp paths and the approved command shapes', () => {
  const root = temporary('translation-path-safety-')
  const escape = path.join(root, 'escape')
  fs.symlinkSync('/Users', escape)
  assert.deepEqual(parseArgs(['inspect-run', '--run-id', '30864046835', '--output-root', '/private/tmp/translation-run']), {
    command: 'inspect-run', help: false, values: {'run-id': '30864046835', 'output-root': '/private/tmp/translation-run'},
  })
  assert.deepEqual(parseArgs(['replay', '--run-root', '/private/tmp/translation-run', '--bare-remote', '/private/tmp/translation.git', '--evidence-root', '/private/tmp/evidence', '--mode', 'publish']).values.mode, 'publish')
  assert.equal(parseArgs(['fault-inject', '--evidence-root', '/private/tmp/evidence', '--scenario', 'sdk-before-guides']).values.scenario, 'sdk-before-guides')
  assert.equal(parseArgs(['verify-evidence', '--evidence-root', '/private/tmp/evidence']).command, 'verify-evidence')
  assert.throws(() => parseArgs(['replay', '--run-root', 'relative', '--bare-remote', '/private/tmp/x.git', '--evidence-root', '/private/tmp/e', '--mode', 'publish']), /absolute.*private\/tmp/i)
  assert.throws(() => parseArgs(['replay', '--run-root', '/private/tmp/r', '--run-root', '/private/tmp/r2', '--bare-remote', '/private/tmp/x.git', '--evidence-root', '/private/tmp/e', '--mode', 'publish']), /duplicate/i)
  assert.throws(() => parseArgs(['replay', '--run-root']), /missing value/i)
  assert.throws(() => parseArgs(['unknown', '--help']), /subcommand/i)
  assert.throws(() => parseArgs(['fault-inject', '--evidence-root', '/private/tmp/e', '--scenario', 'invented']), /scenario/i)
  assert.throws(() => parseArgs(['verify-evidence', '--evidence-root', '/private/tmp/a/../b']), /normalized|lexical/i)
  assert.throws(() => parseArgs(['verify-evidence', '--evidence-root', '/private/tmp/a/./b']), /normalized|lexical/i)
  assert.throws(() => parseArgs(['verify-evidence', '--evidence-root', path.join(escape, 'evidence')]), /outside|private\/tmp/i)
  assert.doesNotMatch(usage('inspect-run'), /30864046835/)
  assert.match(usage('inspect-run'), /--run-id <id>/)
  assert.match(usage('replay'), /\/private\/tmp\/.+\.git/)
})

test('legacy inspect fails closed before downloads when any required artifact is expired', t => {
  const runId = 40000000003
  const parentRunId = 39999999999
  const attempt = 1
  const repository = 'zilliztech/zdoc'
  const runEndpoint = `repos/${repository}/actions/runs/${runId}`
  const jobsEndpoint = `repos/${repository}/actions/runs/${runId}/attempts/${attempt}/jobs?filter=all&per_page=100`
  const artifactsEndpoint = `repos/${repository}/actions/runs/${runId}/artifacts?per_page=100`
  const gh = installFakeGh(t, {
    repository,
    downloadRoot: temporary('translation-fake-gh-downloads-'),
    api: {
      [runEndpoint]: {
        id: runId, run_attempt: attempt, status: 'completed', conclusion: 'success', head_sha: SHA('a'),
        path: '.github/workflows/translate-codex.yml', event: 'workflow_dispatch', repository: {full_name: repository},
        display_title: `translate docs (${parentRunId}-1)`,
      },
      [`repos/${repository}/actions/runs/${parentRunId}`]: {
        id: parentRunId, run_attempt: 1, status: 'completed', conclusion: 'success', head_sha: SHA('a'),
        path: '.github/workflows/fetch-docs.yml', event: 'workflow_dispatch', repository: {full_name: repository},
      },
      [jobsEndpoint]: [{jobs: []}],
      [artifactsEndpoint]: [{artifacts: [{
        id: 1, name: `translation-checkpoint-ja-JP-python-${runId}`, expired: true,
        digest: `sha256:${'1'.repeat(64)}`,
      }]}],
    },
  })
  const outputRoot = temporary('translation-legacy-expired-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId, outputRoot}), /complete unexpired.*external blocker|retention.*expired/i)
  assert.equal(gh.calls().some(args => args[0] === 'run' && args[1] === 'download'), false)
})

test('legacy inspect derives authenticated current selection and ready contracts through the default gh path', async t => {
  const fixture = await completeLegacyGhFixture(t)
  const gh = installFakeGh(t, fixture)
  const outputRoot = temporary('translation-legacy-complete-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  const result = inspectRun({runId: fixture.runId, outputRoot})
  assert.equal(result.legacyDerived, true)
  assert.equal(result.toolingSha, fixture.toolingSha)
  assert.equal(result.initialTargetSha, fixture.initialTargetSha)
  const selection = JSON.parse(fs.readFileSync(path.join(outputRoot, 'publication-selection.json'), 'utf8'))
  assert.equal(selection.units.length, 13)
  const metadata = JSON.parse(fs.readFileSync(path.join(outputRoot, 'run-metadata.json'), 'utf8'))
  assert.equal(metadata.legacyDerived, true)
  assert.equal(metadata.parentRunId, fixture.parentRunId)
  assert.equal(metadata.sourceArtifacts.length, 7)
  assert.equal(metadata.artifacts.length, selection.units.length * 3)
  assert.equal(metadata.artifacts.filter(artifact => artifact.derived).length, selection.units.length + 2)
  assert.deepEqual(Object.keys(metadata.legacyProvenance).sort(), [
    'child', 'derivedArtifacts', 'guidesPublicationReport', 'parent', 'selectionDerivation', 'sourceCheckpointInventory',
  ].sort())
  assert.deepEqual(metadata.legacyProvenance.parent, {
    runId: fixture.parentRunId,
    runAttempt: 1,
    workflow: '.github/workflows/fetch-docs.yml',
    repository: fixture.repository,
    toolingSha: fixture.toolingSha,
  })
  assert.equal(metadata.legacyProvenance.sourceCheckpointInventory.length, 7)
  assert.equal(metadata.legacyProvenance.derivedArtifacts.length, selection.units.length + 2)
  const guidesPlan = JSON.parse(fs.readFileSync(path.join(outputRoot, 'derived', 'guides', 'checkpoint', 'checkpoint-group', 'translation-plan.json'), 'utf8'))
  assert.deepEqual(Object.keys(guidesPlan).sort(), [
    'baselinePayloadSha256', 'batchCount', 'batches', 'devBaselineSha', 'group', 'masterSha',
    'pendingCount', 'pendingSetSha256', 'planSha256', 'schemaVersion', 'sourceCheckpointSha', 'targetSha',
  ].sort())
  assert.equal(guidesPlan.batchCount, 1)
  assert.equal(guidesPlan.batches.length, 1)
  const calls = gh.calls()
  const firstDownload = calls.findIndex(args => args[0] === 'run' && args[1] === 'download')
  const parentInventory = calls.findIndex(args => args[0] === 'api' && args.at(-1).includes(`/runs/${fixture.parentRunId}/artifacts`))
  assert.ok(parentInventory >= 0 && firstDownload > parentInventory, 'all child and parent retention checks must finish before download')
  const evidenceRoot = path.join(path.dirname(outputRoot), `${path.basename(outputRoot)}-evidence`)
  const bareRemote = path.join(path.dirname(outputRoot), `${path.basename(outputRoot)}.git`)
  git(path.dirname(outputRoot), 'clone', '--bare', fixture.targetRepository, bareRemote)
  git(path.dirname(outputRoot), '--git-dir', bareRemote, 'config', '--remove-section', 'remote.origin')
  git(path.dirname(outputRoot), '--git-dir', bareRemote, 'update-ref', 'refs/heads/dev', fixture.initialTargetSha)
  const replay = await replayRun({
    runRoot: outputRoot, bareRemote, evidenceRoot, mode: 'publish',
  })
  assert.equal(replay.status, 'complete')
  assert.equal(verifyEvidence({evidenceRoot}).status, 'complete')

  const metadataFile = path.join(outputRoot, 'run-metadata.json')
  const originalMetadata = fs.readFileSync(metadataFile)
  const tamperCases = [
    value => { value.legacyDerived = false },
    value => { delete value.legacyProvenance.parent.workflow },
    value => { value.legacyProvenance.parent.repository = 'other/repository' },
    value => { value.legacyProvenance.selectionDerivation.selectionSha256 = '0'.repeat(64) },
    value => { value.legacyProvenance.sourceCheckpointInventory.pop() },
    value => { value.legacyProvenance.guidesPublicationReport.resultSha = '0'.repeat(40) },
    value => { value.legacyProvenance.derivedArtifacts[0].sources[0].fileSha256 = '0'.repeat(64) },
  ]
  for (const [index, tamper] of tamperCases.entries()) {
    const value = JSON.parse(originalMetadata)
    tamper(value)
    fs.writeFileSync(metadataFile, `${JSON.stringify(value)}\n`)
    await assert.rejects(replayRun({
      runRoot: outputRoot,
      bareRemote,
      evidenceRoot: `${evidenceRoot}-tamper-${index}`,
      mode: 'publish',
      dependencies: {assertBareRemote() { throw new Error('legacy provenance validation was bypassed') }},
    }), /legacy.*provenance|parent|selection derivation|source checkpoint inventory|Guides publication|derived artifact/i)
  }
  fs.writeFileSync(metadataFile, originalMetadata)
})

test('legacy load binds rehashed handoff source baselines to authenticated parent manifests', async t => {
  const fixture = await completeLegacyGhFixture(t)
  installFakeGh(t, fixture)
  const outputRoot = temporary('translation-legacy-baseline-binding-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  inspectRun({runId: fixture.runId, outputRoot})
  const selectionFile = path.join(outputRoot, 'publication-selection.json')
  const metadataFile = path.join(outputRoot, 'run-metadata.json')
  const originalSelection = fs.readFileSync(selectionFile)
  const originalMetadata = fs.readFileSync(metadataFile)
  const loaded = JSON.parse(originalMetadata)
  assert.ok(loaded.legacyProvenance.sourceCheckpointInventory.every(record => /^[0-9a-f]{40}$/u.test(record.devBaselineSha)))
  assert.ok(loaded.sourceArtifacts.every(record => /^[0-9a-f]{40}$/u.test(record.devBaselineSha)))

  async function rejectsBeforeRemote(label, mutate) {
    fs.writeFileSync(selectionFile, originalSelection)
    const metadata = JSON.parse(originalMetadata)
    mutate(metadata)
    fs.writeFileSync(metadataFile, `${JSON.stringify(metadata)}\n`)
    const evidenceRoot = temporary(`translation-legacy-baseline-${label}-`)
    t.after(() => fs.rmSync(evidenceRoot, {recursive: true, force: true}))
    await assert.rejects(replayRun({
      runRoot: outputRoot,
      bareRemote: path.join(path.dirname(evidenceRoot), `${path.basename(evidenceRoot)}.git`),
      evidenceRoot,
      mode: 'publish',
      dependencies: {assertBareRemote() { throw new Error('REMOTE_SETUP_REACHED') }},
    }), /parent.*baseline|source checkpoint inventory|devBaselineSha/i)
  }

  await rejectsBeforeRemote('missing', metadata => {
    delete metadata.legacyProvenance.sourceCheckpointInventory[0].devBaselineSha
  })
  await rejectsBeforeRemote('tampered', metadata => {
    metadata.sourceArtifacts[0].devBaselineSha = SHA('f')
    metadata.legacyProvenance.sourceCheckpointInventory[0].devBaselineSha = SHA('f')
  })

  fs.writeFileSync(selectionFile, originalSelection)
  const metadata = JSON.parse(originalMetadata)
  const derivation = metadata.legacyProvenance.selectionDerivation
  derivation.handoff.units[0].sourceBaselineSha = SHA('f')
  const rebuilt = buildTranslationPublicationSelection({
    handoff: derivation.handoff,
    repository: metadata.repository,
    runId: metadata.runId,
    runAttempt: metadata.runAttempt,
    publish: false,
    runTranslations: true,
  })
  writePublicationDocument(selectionFile, rebuilt)
  metadata.selectionSha256 = rebuilt.selectionSha256
  metadata.initialTargetSha = rebuilt.initialTargetSha
  metadata.canonicalUnitKeys = rebuilt.units.map(unit => unit.unitKey)
  metadata.selectionArtifact.digest = `sha256:${sha256(selectionFile)}`
  derivation.selectionSha256 = rebuilt.selectionSha256
  derivation.selectionFileSha256 = sha256(selectionFile)
  derivation.handoffSha256 = valueSha256(derivation.handoff)
  derivation.canonicalUnitKeys = metadata.canonicalUnitKeys
  fs.writeFileSync(metadataFile, `${JSON.stringify(metadata)}\n`)
  const evidenceRoot = temporary('translation-legacy-baseline-rehashed-')
  t.after(() => fs.rmSync(evidenceRoot, {recursive: true, force: true}))
  await assert.rejects(replayRun({
    runRoot: outputRoot,
    bareRemote: path.join(path.dirname(evidenceRoot), `${path.basename(evidenceRoot)}.git`),
    evidenceRoot,
    mode: 'publish',
    dependencies: {assertBareRemote() { throw new Error('REMOTE_SETUP_REACHED') }},
  }), /parent.*baseline|source checkpoint inventory|devBaselineSha/i)
})

test('legacy inspect fails closed when retained Guides payload cannot reconstruct the canonical plan', async t => {
  const fixture = await completeLegacyGhFixture(t)
  const name = `translation-checkpoint-ja-JP-guides-${fixture.runId}-batch-1`
  const directory = path.join(fixture.downloadRoot, String(fixture.runId), encodeURIComponent(name))
  const archive = path.join(directory, fs.readdirSync(directory)[0])
  const extracted = temporary('translation-incomplete-guides-')
  t.after(() => fs.rmSync(extracted, {recursive: true, force: true}))
  execFileSync('tar', ['-xf', archive, '-C', extracted])
  fs.rmSync(path.join(extracted, 'checkpoint-group', 'batch-input.json'))
  execFileSync('tar', ['-cf', archive, '-C', extracted, 'checkpoint-group'])
  const artifact = fixture.api[`repos/${fixture.repository}/actions/runs/${fixture.runId}/artifacts?per_page=100`][0].artifacts
    .find(candidate => candidate.name === name)
  artifact.digest = `sha256:${sha256(archive)}`
  installFakeGh(t, fixture)
  const outputRoot = temporary('translation-incomplete-guides-output-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /Guides|batch input|artifact root|plan reconstruction/i)
  assert.equal(fs.existsSync(path.join(outputRoot, 'derived', 'guides', 'plan-inputs')), false)
})

test('legacy inspect removes Guides plan inputs when reading the reconstructed plan fails', async t => {
  const fixture = await completeLegacyGhFixture(t)
  installFakeGh(t, fixture)
  const outputRoot = temporary('translation-invalid-guides-plan-output-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  const originalReadFileSync = fs.readFileSync
  fs.readFileSync = function injectedPlanReadFailure(file, ...args) {
    if (String(file) === path.join(outputRoot, 'derived', 'guides', 'translation-plan.json')) {
      throw new Error('injected reconstructed plan JSON read failure')
    }
    return originalReadFileSync.call(this, file, ...args)
  }
  try {
    assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /injected reconstructed plan JSON read failure/i)
  } finally {
    fs.readFileSync = originalReadFileSync
  }
  assert.equal(fs.existsSync(path.join(outputRoot, 'derived', 'guides', 'plan-inputs')), false)
})

test('legacy inspect rejects ambiguous retained identity before any download', async t => {
  const fixture = await completeLegacyGhFixture(t)
  const endpoint = `repos/${fixture.repository}/actions/runs/${fixture.runId}/artifacts?per_page=100`
  const duplicate = {...fixture.api[endpoint][0].artifacts[0], id: 999999}
  fixture.api[endpoint][0].artifacts.push(duplicate)
  const gh = installFakeGh(t, fixture)
  const outputRoot = temporary('translation-legacy-ambiguous-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /retention.*complete unexpired|ambiguous|exactly once/i)
  assert.equal(gh.calls().some(args => args[0] === 'run' && args[1] === 'download'), false)
})

test('inspect rejects the wrong child workflow identity before any retained download', async t => {
  const fixture = await completeLegacyGhFixture(t)
  fixture.api[`repos/${fixture.repository}/actions/runs/${fixture.runId}`].path = '.github/workflows/fetch-docs.yml'
  const gh = installFakeGh(t, fixture)
  const outputRoot = temporary('translation-wrong-child-workflow-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /child.*workflow|translate-codex/i)
  assert.equal(gh.calls().some(args => args[0] === 'run' && args[1] === 'download'), false)
})

test('legacy inspect rejects the wrong parent Fetch workflow before any retained download', async t => {
  const fixture = await completeLegacyGhFixture(t)
  fixture.api[`repos/${fixture.repository}/actions/runs/${fixture.parentRunId}`].path = '.github/workflows/translate-codex.yml'
  const gh = installFakeGh(t, fixture)
  const outputRoot = temporary('translation-wrong-parent-workflow-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /parent.*workflow|fetch-docs/i)
  assert.equal(gh.calls().some(args => args[0] === 'run' && args[1] === 'download'), false)
})

test('legacy inspect rejects parent tooling SHA mismatch before any retained download', async t => {
  const fixture = await completeLegacyGhFixture(t)
  fixture.api[`repos/${fixture.repository}/actions/runs/${fixture.parentRunId}`].head_sha = SHA('b')
  const gh = installFakeGh(t, fixture)
  const outputRoot = temporary('translation-parent-tooling-mismatch-')
  t.after(() => fs.rmSync(outputRoot, {recursive: true, force: true}))
  assert.throws(() => inspectRun({runId: fixture.runId, outputRoot}), /parent.*tooling|tooling.*mismatch/i)
  assert.equal(gh.calls().some(args => args[0] === 'run' && args[1] === 'download'), false)
})

test('trusted Jobs completion timestamps calculate SDK-before-Guides FIFO independently from canonical order', t => {
  const value = fixture(t)
  const fifo = deriveFifoUnitKeys(value.selection, value.jobs)
  assert.equal(value.selection.units[0].unitKey, 'translation/ja-JP/guides')
  assert.notEqual(fifo[0], 'translation/ja-JP/guides')
  assert.equal(fifo.at(-1), 'translation/ja-JP/guides')
})

test('replay authenticates descriptors and artifacts before exercising canonical and FIFO publication through the coordinator', async t => {
  const value = fixture(t)
  const calls = []
  const published = {canonical: [], fifo: []}
  const result = await replayRun({
    runRoot: value.runRoot,
    bareRemote: value.bareRemote,
    evidenceRoot: value.evidenceRoot,
    mode: 'publish',
    dependencies: {
      assertBareRemote() { calls.push('bare') },
      async authenticateArtifact({artifact}) { calls.push(`auth:${artifact.kind}:${artifact.unitKey}`); return {prepared: {artifact}} },
      async runLane({lane, order}) { published[lane].push(...order); return {finalTargetSha: SHA('7'), results: order.map((unitKey, index) => ({unitKey, status: 'published', sequence: index + 1, resultSha: SHA('7')}))} },
      async verifyLane() { return {tree: SHA('8'), ancestryVerified: true, reconciliationVerified: true} },
    },
  })
  assert.equal(calls.filter(call => call.startsWith('auth:')).length, value.selection.units.length * 3)
  assert.deepEqual(published.canonical, value.selection.units.map(unit => unit.unitKey))
  assert.deepEqual(published.fifo, deriveFifoUnitKeys(value.selection, value.jobs))
  assert.equal(result.ancestryVerified, true)
  assert.equal(result.reconciliationVerified, true)
  assert.throws(() => verifyEvidence({evidenceRoot: value.evidenceRoot}), /structural.*explicit|independent Git/i)
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot, allowStructural: true}).status, 'complete')
})

test('default replay publishes real retained Translation artifacts through canonical and FIFO coordinators on a local bare remote', async t => {
  const value = await realReplayFixture(t)
  const result = await replayRun({
    runRoot: value.runRoot,
    bareRemote: value.bareRemote,
    evidenceRoot: value.evidenceRoot,
    mode: 'publish',
  })
  assert.equal(result.status, 'complete')
  assert.match(result.finalTree, /^[0-9a-f]{40}$/)
  assert.equal(result.ancestryVerified, true)
  assert.equal(result.reconciliationVerified, true)
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).status, 'complete')
  assert.match(git(value.bareRemote, 'rev-parse', 'refs/heads/canonical/dev'), /^[0-9a-f]{40}$/)
  assert.match(git(value.bareRemote, 'rev-parse', 'refs/heads/fifo/dev'), /^[0-9a-f]{40}$/)
  const resultsFile = path.join(value.evidenceRoot, 'replay-results.json')
  const originalResults = fs.readFileSync(resultsFile, 'utf8')
  const corruptedResults = JSON.parse(originalResults)
  corruptedResults.fifo.finalTargetSha = '0'.repeat(40)
  fs.writeFileSync(resultsFile, `${JSON.stringify(corruptedResults)}\n`)
  assert.throws(() => verifyEvidence({evidenceRoot: value.evidenceRoot}), /final target|remote|ancestr|commit/i)
  fs.writeFileSync(resultsFile, originalResults)

  const retainedMetadata = JSON.parse(fs.readFileSync(path.join(value.runRoot, 'run-metadata.json'), 'utf8'))
  const retainedArtifact = path.join(value.evidenceRoot, 'retained-run', retainedMetadata.artifacts[0].archive)
  const originalArtifact = fs.readFileSync(retainedArtifact)
  fs.appendFileSync(retainedArtifact, 'tampered')
  assert.throws(() => verifyEvidence({evidenceRoot: value.evidenceRoot}), /checksum|provenance|artifact/i)
  fs.writeFileSync(retainedArtifact, originalArtifact)
})

test('replay rejects non-isolated remotes, identity drift, incomplete evidence, and divergent final trees', async t => {
  const value = fixture(t)
  await assert.rejects(replayRun({
    runRoot: value.runRoot, bareRemote: value.bareRemote, evidenceRoot: value.evidenceRoot, mode: 'publish',
    dependencies: {assertBareRemote() { throw new Error('remote resolves to github.com/zilliztech/zdoc') }},
  }), /github|isolated/i)

  const drift = fixture(t)
  const metadataPath = path.join(drift.runRoot, 'run-metadata.json')
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
  metadata.selectionSha256 = '0'.repeat(64)
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata)}\n`)
  await assert.rejects(replayRun({runRoot: drift.runRoot, bareRemote: drift.bareRemote, evidenceRoot: drift.evidenceRoot, mode: 'publish'}), /selection.*checksum|identity/i)

  const trees = fixture(t)
  await assert.rejects(replayRun({
    runRoot: trees.runRoot, bareRemote: trees.bareRemote, evidenceRoot: trees.evidenceRoot, mode: 'publish',
    dependencies: {
      assertBareRemote() {}, authenticateArtifact() { return {prepared: {}} },
      runLane: async ({order}) => ({finalTargetSha: SHA('7'), results: order.map(unitKey => ({unitKey, status: 'published'}))}),
      verifyLane: async ({lane}) => ({tree: lane === 'canonical' ? SHA('8') : SHA('9'), ancestryVerified: true, reconciliationVerified: true}),
    },
  }), /tree/i)

  const missingGuidesBatch = fixture(t)
  const missingMetadata = JSON.parse(fs.readFileSync(path.join(missingGuidesBatch.runRoot, 'run-metadata.json'), 'utf8'))
  fs.rmSync(path.join(missingGuidesBatch.runRoot, missingMetadata.guidesBatchArtifacts[0].archive))
  await assert.rejects(replayRun({
    runRoot: missingGuidesBatch.runRoot, bareRemote: missingGuidesBatch.bareRemote,
    evidenceRoot: missingGuidesBatch.evidenceRoot, mode: 'publish',
  }), /Guides batch.*missing|payload.*missing/i)
})

test('authenticated extraction rejects traversal, symlink, and corrupt-manifest archives before writing an extraction target', t => {
  assert.equal(typeof authenticateAndExtractArchive, 'function')
  const root = temporary('translation-authenticated-extraction-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  for (const kind of ['traversal', 'symlink', 'corrupt-manifest']) {
    const value = adversarialCheckpointArchive(root, kind, kind)
    assert.throws(() => authenticateAndExtractArchive({
      archive: value.archive,
      runnerTemp,
      prefix: `extract-${kind}-`,
      apiDigest: `sha256:${sha256(value.archive)}`,
      fileSha256: sha256(value.archive),
      manifestSha256: value.manifestSha256,
      preflight: {group: 'python', masterSha: SHA('a')},
    }), /archive|path|entry|symlink|manifest|JSON/i)
    assert.equal(fs.readdirSync(runnerTemp).some(entry => entry.startsWith(`extract-${kind}-`)), false)
  }
})

test('run loading rejects an artifact whose final path is a symlink', async t => {
  const value = fixture(t)
  const metadataFile = path.join(value.runRoot, 'run-metadata.json')
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'))
  const record = metadata.artifacts[0]
  const target = path.join(value.runRoot, record.archive)
  const real = path.join(path.dirname(target), 'real-archive.tar')
  fs.renameSync(target, real)
  fs.symlinkSync(real, target)
  await assert.rejects(replayRun({
    runRoot: value.runRoot,
    bareRemote: value.bareRemote,
    evidenceRoot: value.evidenceRoot,
    mode: 'publish',
    dependencies: {assertBareRemote() { throw new Error('run loading proceeded past the final artifact path') }},
  }), /final artifact path must not be a symlink/i)
})

test('Guides nested preparation removes every earlier extraction when a later archive fails authentication', t => {
  assert.equal(typeof prepareGuidesPairs, 'function')
  assert.equal(typeof cleanupGuidesPairs, 'function')
  const root = temporary('translation-guides-cleanup-')
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const runnerTemp = path.join(root, 'runner')
  const artifactDir = path.join(root, 'aggregate-checkpoint')
  const baselineDir = path.join(root, 'aggregate-baseline')
  fs.mkdirSync(runnerTemp)
  const pendingSetSha256 = 'd'.repeat(64)
  const targetSha = SHA('c')
  const plan = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: SHA('b'),
    targetSha,
    batchCount: 1,
    pendingSetSha256,
  }
  put(artifactDir, 'translation-plan.json', `${JSON.stringify(plan)}\n`)
  put(baselineDir, 'translation-plan.json', `${JSON.stringify(plan)}\n`)
  const manifest = {
    schemaVersion: 2,
    stage: 'translation',
    group: 'guides',
    masterSha: SHA('a'),
    translationTarget: 'ja-JP',
    sourceCheckpointSha: SHA('b'),
    toolingSha: SHA('a'),
    sourceSite: 'en',
    targetSite: 'en',
  }
  const checkpoint = manifestArchive(root, 'cleanup-checkpoint', manifest)
  const checkpointManifest = path.join(root, 'cleanup-checkpoint-contents', 'checkpoint-group', 'manifest.json')
  const corrupt = adversarialCheckpointArchive(root, 'cleanup-corrupt', 'corrupt-manifest')
  const checkpointTarget = path.join(artifactDir, 'batches', 'batch-1', 'checkpoint-group.tar')
  const baselineTarget = path.join(baselineDir, 'batches', 'batch-1', 'checkpoint-group.tar')
  fs.mkdirSync(path.dirname(checkpointTarget), {recursive: true})
  fs.mkdirSync(path.dirname(baselineTarget), {recursive: true})
  fs.copyFileSync(checkpoint, checkpointTarget)
  fs.copyFileSync(corrupt.archive, baselineTarget)
  const prepared = {
    artifactDir,
    baselineDir,
    batchSetManifest: {
      schemaVersion: 1,
      stage: 'translation-guides-batch-set',
      group: 'guides',
      sourceCheckpointSha: SHA('b'),
      toolingSha: SHA('a'),
      targetSha,
      batchCount: 1,
      pendingSetSha256,
    },
    guidesBatchArtifacts: [
      {
        name: 'translation-checkpoint-ja-JP-guides-40000000001-batch-1',
        digest: `sha256:${sha256(checkpointTarget)}`,
        fileSha256: sha256(checkpointTarget),
        manifestSha256: sha256(checkpointManifest),
      },
      {
        name: 'translation-baseline-ja-JP-guides-40000000001-batch-1',
        digest: `sha256:${sha256(baselineTarget)}`,
        fileSha256: sha256(baselineTarget),
        manifestSha256: corrupt.manifestSha256,
      },
    ],
  }
  assert.throws(() => prepareGuidesPairs(prepared, runnerTemp, {
    group: 'guides', toolingSha: SHA('a'), target: 'ja-JP', sourceCheckpointSha: SHA('b'),
  }), /manifest|JSON/i)
  assert.deepEqual(fs.readdirSync(runnerTemp), [])

  fs.copyFileSync(checkpoint, baselineTarget)
  prepared.guidesBatchArtifacts[1].digest = `sha256:${sha256(baselineTarget)}`
  prepared.guidesBatchArtifacts[1].fileSha256 = sha256(baselineTarget)
  prepared.guidesBatchArtifacts[1].manifestSha256 = sha256(checkpointManifest)
  const successful = prepareGuidesPairs(prepared, runnerTemp, {
    group: 'guides', toolingSha: SHA('a'), target: 'ja-JP', sourceCheckpointSha: SHA('b'),
  })
  assert.equal(successful.cleanupDirectories.length, 2)
  assert.ok(successful.cleanupDirectories.every(directory => fs.existsSync(directory)))
  cleanupGuidesPairs(successful.cleanupDirectories)
  assert.ok(successful.cleanupDirectories.every(directory => !fs.existsSync(directory)))
})

test('fault verification rejects handwritten summaries without retained results, handler logs, and remote evidence', async t => {
  const scenarios = [
    'sdk-before-guides', 'guides-before-sdk', 'cache-conflict', 'cas-drift',
    'ambiguous-push', 'reconciliation-failure', 'unknown-remote-state',
  ]
  for (const scenario of scenarios) {
    const value = fixture(t)
    const result = await faultInjectRun({
      evidenceRoot: value.evidenceRoot,
      scenario,
      dependencies: {async executeScenario({scenario: selected}) {
        return faultEvidence(selected)
      }},
    })
    assert.equal(result.scenario, scenario)
    assert.throws(() => verifyEvidence({evidenceRoot: value.evidenceRoot}), /fault|selection|results|handler|remote|evidence/i)
  }
})

test('default fault injection uses real local CAS retry and exact plus descendant ambiguous-push probes', async t => {
  const cas = await realFaultFixture(t)
  const casResult = await faultInjectRun({evidenceRoot: cas.evidenceRoot, scenario: 'cas-drift'})
  const casPublication = JSON.parse(fs.readFileSync(path.join(cas.evidenceRoot, casResult.results), 'utf8'))
  assert.equal(casPublication.units[0].attempts, 2, JSON.stringify(casResult))
  assert.equal(casResult.cas.remoteRacePreserved, true)
  assert.match(casPublication.units[0].resultSha, /^[0-9a-f]{40}$/)
  assert.notEqual(casResult.cas.abandonedCandidateSha, casPublication.units[0].resultSha)
  assert.equal(verifyEvidence({evidenceRoot: cas.evidenceRoot}).scenario, 'cas-drift')
  git(cas.evidenceRoot, '--git-dir', casResult.bareRemote, 'update-ref', casResult.remoteRef, casResult.initialTargetSha)
  assert.throws(() => verifyEvidence({evidenceRoot: cas.evidenceRoot}), /CAS|remote|result|commit/i)

  const ambiguous = await realFaultFixture(t)
  const ambiguousResult = await faultInjectRun({evidenceRoot: ambiguous.evidenceRoot, scenario: 'ambiguous-push'})
  const exactPublication = JSON.parse(fs.readFileSync(path.join(ambiguous.evidenceRoot, ambiguousResult.exact.results), 'utf8'))
  const descendantPublication = JSON.parse(fs.readFileSync(path.join(ambiguous.evidenceRoot, ambiguousResult.descendant.results), 'utf8'))
  assert.equal(exactPublication.finalTargetSha, ambiguousResult.exact.candidateSha)
  assert.notEqual(descendantPublication.finalTargetSha, ambiguousResult.descendant.candidateSha)
  assert.equal(verifyEvidence({evidenceRoot: ambiguous.evidenceRoot}).scenario, 'ambiguous-push')
  const ambiguousLogFile = path.join(ambiguous.evidenceRoot, ambiguousResult.descendant.handlerLog)
  const ambiguousLog = JSON.parse(fs.readFileSync(ambiguousLogFile, 'utf8'))
  ambiguousLog.events.push({...ambiguousLog.events.at(-1), sequence: ambiguousLog.events.length + 1})
  fs.writeFileSync(ambiguousLogFile, `${JSON.stringify(ambiguousLog)}\n`)
  assert.throws(() => verifyEvidence({evidenceRoot: ambiguous.evidenceRoot}), /ambiguous|handler|duplicate/i)
})

test('default Git fault injection uses the standard git-v1 replay remote without synthetic retained source.git', async t => {
  const value = await realFaultFixture(t)
  const retainedSource = path.join(value.evidenceRoot, 'retained-run', 'source.git')
  const bareRemote = path.join(value.root, 'standard-replay.git')
  fs.renameSync(retainedSource, bareRemote)
  fs.writeFileSync(path.join(value.evidenceRoot, 'evidence-manifest.json'), `${JSON.stringify({
    schemaVersion: 1,
    status: 'complete',
    workflow: 'translation',
    verificationContract: 'git-v1',
    bareRemote,
  })}\n`)
  const cas = await faultInjectRun({evidenceRoot: value.evidenceRoot, scenario: 'cas-drift'})
  assert.equal(JSON.parse(fs.readFileSync(path.join(value.evidenceRoot, cas.results), 'utf8')).units[0].attempts, 2)
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).scenario, 'cas-drift')
  fs.rmSync(path.join(value.evidenceRoot, 'fault-injection.json'))
  const ambiguous = await faultInjectRun({evidenceRoot: value.evidenceRoot, scenario: 'ambiguous-push'})
  assert.equal(JSON.parse(fs.readFileSync(path.join(value.evidenceRoot, ambiguous.exact.results), 'utf8')).units[0].status, 'published')
  assert.equal(JSON.parse(fs.readFileSync(path.join(value.evidenceRoot, ambiguous.descendant.results), 'utf8')).units[0].status, 'published')
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).scenario, 'ambiguous-push')
})

test('default fault injection proves both FIFO orders, ordinary continuation, reconciliation boundary, and unknown-state stop', async t => {
  const seed = await realFaultFixture(t)
  for (const scenario of ['sdk-before-guides', 'guides-before-sdk', 'cache-conflict', 'reconciliation-failure', 'unknown-remote-state']) {
    const evidenceRoot = temporary(`translation-default-fault-${scenario}-`)
    t.after(() => fs.rmSync(evidenceRoot, {recursive: true, force: true}))
    fs.cpSync(path.join(seed.evidenceRoot, 'retained-run'), path.join(evidenceRoot, 'retained-run'), {recursive: true})
    const result = await faultInjectRun({evidenceRoot, scenario})
    assert.equal(verifyEvidence({evidenceRoot}).scenario, scenario)
    assert.equal(result.evidenceContract, 'coordinator-git-v1')
    const selected = JSON.parse(fs.readFileSync(path.join(evidenceRoot, result.selection), 'utf8'))
    const recordedJobs = JSON.parse(fs.readFileSync(path.join(evidenceRoot, result.jobs), 'utf8')).jobs
    const recordedResults = JSON.parse(fs.readFileSync(path.join(evidenceRoot, result.results), 'utf8'))
    const recordedEvents = JSON.parse(fs.readFileSync(path.join(evidenceRoot, result.handlerLog), 'utf8')).events
    const calculatedOrder = deriveFifoUnitKeys(selected, recordedJobs)
    if (scenario === 'sdk-before-guides') {
      assert.match(calculatedOrder[0], /^translation\/(?:ja-JP|zh-CN-reference)\/(?:python|java|node|go|cli|rest)$/)
      assert.ok(calculatedOrder.indexOf('translation/ja-JP/guides') > 0)
    }
    if (scenario === 'guides-before-sdk') assert.equal(calculatedOrder[0], 'translation/ja-JP/guides')
    if (scenario === 'cache-conflict') {
      const failed = recordedResults.units.find(unit => unit.status === 'publish_failed')
      assert.match(failed.failure.message, /cache conflict/i)
      assert.deepEqual(failed.commitShas, [])
      assert.ok(recordedResults.units.some(unit => unit.status === 'published' && unit.sequence > failed.sequence && unit.commitShas.length))
    }
    if (scenario === 'reconciliation-failure') {
      assert.equal(recordedResults.orchestratorFailure.phase, 'reconciliation')
      assert.deepEqual(recordedEvents.slice(-2).map(event => event.type), ['reconciliation_started', 'reconciliation_completed'])
    }
    if (scenario === 'unknown-remote-state') {
      const unknown = recordedResults.units.find(unit => unit.failure?.code === 'REMOTE_STATE_UNKNOWN')
      assert.equal(recordedEvents.filter(event => event.type === 'handler_started').at(-1).unitKey, unknown.unitKey)
      assert.ok(recordedResults.units.some(unit => unit.status === 'ready' && unit.sequence === null && unit.commitShas.length === 0))
    }
    if (scenario === 'sdk-before-guides') {
      recordedEvents[0].unexpected = true
      fs.writeFileSync(path.join(evidenceRoot, result.handlerLog), `${JSON.stringify({schemaVersion: 1, events: recordedEvents})}\n`)
    } else if (scenario === 'guides-before-sdk') {
      recordedEvents.push({...recordedEvents.at(-1), sequence: recordedEvents.length + 1})
      fs.writeFileSync(path.join(evidenceRoot, result.handlerLog), `${JSON.stringify({schemaVersion: 1, events: recordedEvents})}\n`)
    } else if (scenario === 'unknown-remote-state') {
      fs.writeFileSync(path.join(evidenceRoot, result.handlerLog), `${JSON.stringify({schemaVersion: 1, events: recordedEvents, unexpected: true})}\n`)
    } else {
      git(evidenceRoot, '--git-dir', result.bareRemote, 'update-ref', result.remoteRef, result.initialTargetSha)
    }
    assert.throws(() => verifyEvidence({evidenceRoot}), /fault|handler|duplicate|remote|commit|reconciliation/i)
  }
})
