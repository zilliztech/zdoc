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
  deriveFifoUnitKeys,
  faultInjectRun,
  parseArgs,
  replayRun,
  usage,
  verifyEvidence,
} = require('./replay-translation-publication-fifo')

const SHA = character => character.repeat(40)

function temporary(prefix) {
  return fs.mkdtempSync(path.join('/private/tmp', prefix))
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
      id: 9001, name: 'translation-checkpoint-ja-JP-guides-30864046835-batch-1', digest: `sha256:${'9'.repeat(64)}`,
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
  git(root, 'init', '--bare', sourceRemote)
  git(root, 'init', sourceRepository)
  git(sourceRepository, 'config', 'user.name', 'Replay Test')
  git(sourceRepository, 'config', 'user.email', 'replay@example.com')
  put(sourceRepository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  put(sourceRepository, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/python.md', 'old\n')
  git(sourceRepository, 'add', '.')
  git(sourceRepository, 'commit', '-m', 'seed')
  git(sourceRepository, 'branch', '-M', 'dev')
  git(sourceRepository, 'remote', 'add', 'origin', sourceRemote)
  git(sourceRepository, 'push', '-u', 'origin', 'dev')
  const baselineSha = git(sourceRepository, 'rev-parse', 'HEAD')
  const toolingSha = git(process.cwd(), 'rev-parse', 'HEAD')
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
  }
  const baseline = path.join(root, 'baseline')
  const workspace = path.join(root, 'workspace')
  fs.cpSync(sourceRepository, baseline, {recursive: true})
  fs.cpSync(sourceRepository, workspace, {recursive: true})
  put(workspace, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/python.md', 'translated\n')
  const pair = {}
  for (const [kind, source] of [['baseline', baseline], ['checkpoint', workspace]]) {
    const output = path.join(root, `${kind}-artifact`)
    await createCheckpointArtifact({
      group: 'python', masterSha: toolingSha, devBaselineSha: baselineSha,
      baselineDir: baseline, workspace: source, output, includeTranslationCache: true,
      translationTarget: 'ja-JP', sourceSite: 'en', targetSite: 'en',
      sourceCheckpointSha: baselineSha, toolingSha, validationCommands: ['true'],
    })
    pair[kind] = archiveCheckpoint(root, output, kind)
  }
  for (const kind of ['checkpoint', 'baseline']) {
    const record = artifacts.find(artifact => artifact.unitKey === selectedSdk.unitKey && artifact.kind === kind)
    fs.copyFileSync(pair[kind], path.join(runRoot, record.archive))
  }
  const guidesBatchFile = path.join(runRoot, 'artifacts', 'guides-batch-1.json')
  fs.writeFileSync(guidesBatchFile, '{"batch":1}\n')
  fs.writeFileSync(path.join(runRoot, 'publication-selection.json'), `${JSON.stringify(selection)}\n`)
  fs.writeFileSync(path.join(runRoot, 'jobs.json'), `${JSON.stringify({jobs})}\n`)
  fs.cpSync(sourceRemote, path.join(runRoot, 'source.git'), {recursive: true})
  fs.writeFileSync(path.join(runRoot, 'run-metadata.json'), `${JSON.stringify({
    schemaVersion: 1, runId: selection.runId, runAttempt: selection.runAttempt, repository: selection.repository,
    toolingSha, initialTargetSha: baselineSha, selectionSha256: selection.selectionSha256,
    canonicalUnitKeys: selection.units.map(unit => unit.unitKey), fifoUnitKeys: deriveFifoUnitKeys(selection, jobs), artifacts,
    guidesBatchArtifacts: [{id: 9002, name: 'translation-checkpoint-ja-JP-guides-40000000001-batch-1', digest: `sha256:${'9'.repeat(64)}`, archive: path.relative(runRoot, guidesBatchFile)}],
  }, null, 2)}\n`)
  fs.mkdirSync(evidenceRoot)
  fs.cpSync(runRoot, path.join(evidenceRoot, 'retained-run'), {recursive: true})
  return {root, runRoot, evidenceRoot, selection, selectedSdk}
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
  assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).status, 'complete')
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

test('fault injection covers Translation ordering, continuation, CAS, ambiguity, reconciliation, and unknown-state stop', async t => {
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
        return {
          status: 'complete',
          overallStatus: selected === 'unknown-remote-state' ? 'orchestrator_failed' : selected === 'reconciliation-failure' ? 'orchestrator_failed' : selected === 'cache-conflict' ? 'failure' : 'success',
          ordinaryFailureContinued: selected === 'cache-conflict',
          laterWritesStopped: selected === 'unknown-remote-state',
        }
      }},
    })
    assert.equal(result.scenario, scenario)
    assert.equal(verifyEvidence({evidenceRoot: value.evidenceRoot}).scenario, scenario)
    if (scenario === 'cache-conflict') assert.equal(result.ordinaryFailureContinued, true)
    if (scenario === 'unknown-remote-state') assert.equal(result.laterWritesStopped, true)
  }
})

test('default fault injection uses real local CAS retry and exact plus descendant ambiguous-push probes', async t => {
  const cas = await realFaultFixture(t)
  const casResult = await faultInjectRun({evidenceRoot: cas.evidenceRoot, scenario: 'cas-drift'})
  assert.equal(casResult.cas.attempts, 2, JSON.stringify(casResult))
  assert.equal(casResult.cas.remoteRacePreserved, true)
  assert.match(casResult.cas.resultSha, /^[0-9a-f]{40}$/)
  assert.notEqual(casResult.cas.abandonedCandidateSha, casResult.cas.resultSha)

  const ambiguous = await realFaultFixture(t)
  const ambiguousResult = await faultInjectRun({evidenceRoot: ambiguous.evidenceRoot, scenario: 'ambiguous-push'})
  assert.equal(ambiguousResult.exact.containsCandidate, true)
  assert.equal(ambiguousResult.exact.remoteSha, ambiguousResult.exact.candidateSha)
  assert.equal(ambiguousResult.descendant.containsCandidate, true)
  assert.notEqual(ambiguousResult.descendant.remoteSha, ambiguousResult.descendant.candidateSha)
})
