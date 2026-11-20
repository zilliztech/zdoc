import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync,
  symlinkSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import assert from 'node:assert/strict'
import test from 'node:test'
import {collectorEnvironment, prepareContext, preparePaths, settleBatchPrepare} from './batch-prepare.mjs'

const master = '1'.repeat(40)
const producer = '2'.repeat(40)
const run = 43700000000
const ctx = {master, run}
const script = fileURLToPath(new URL('./batch-prepare.mjs', import.meta.url))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const ref = raw => ({path: 'blobs/' + hash(raw), sha256: hash(raw), bytes: raw.length})
const batchOrigin = {kind: 'observed', purpose: 'isolated-candidate'}
const validEnv = {GITHUB_ACTIONS: 'true', GITHUB_SERVER_URL: 'https://github.com', GITHUB_API_URL: 'https://api.github.com',
  GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_REPOSITORY_ID: '660446555', GITHUB_REF: 'refs/heads/master',
  GITHUB_REF_PROTECTED: 'true', GITHUB_SHA: master, GITHUB_WORKFLOW_SHA: master,
  GITHUB_WORKFLOW_REF: 'zilliztech/zdoc/.github/workflows/shared-guides-update.yml@refs/heads/master',
  GITHUB_JOB: 'prepare_batch', GITHUB_RUN_ID: String(run), GITHUB_RUN_ATTEMPT: '1', GITHUB_EVENT_NAME: 'schedule'}

function stage(t) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'wp12-prepare-test-'))
  t.after(() => rmSync(root, {recursive: true, force: true}))
  const workspace = join(root, 'workspace'), temp = join(root, 'runner')
  const batchRoot = join(temp, `shared-guides-batch-prepare-${run}-1`)
  mkdirSync(workspace, {mode: 0o700})
  mkdirSync(temp, {mode: 0o700})
  mkdirSync(batchRoot, {mode: 0o700})
  mkdirSync(join(batchRoot, 'source.git'), {mode: 0o700})
  return {workspace, temp, batchRoot, env: {...validEnv, GITHUB_WORKSPACE: workspace, RUNNER_TEMP: temp}}
}

function fixture(t, {change = true, batchPages} = {}) {
  const s = stage(t), paths = preparePaths(s.env, ctx, s.workspace, s.workspace)
  mkdirSync(join(paths.evidence, 'blobs'), {recursive: true, mode: 0o700})
  const retain = value => {
    const raw = Buffer.from(JSON.stringify(value))
    const reference = ref(raw)
    writeFileSync(join(paths.evidence, reference.path), raw, {mode: 0o600})
    return {reference, raw}
  }
  const base = {origin: batchOrigin, session: '3'.repeat(64), pins: {
    master, trustedTools: master, dev: '4'.repeat(40), source: '5'.repeat(40), toolsetSha256: '6'.repeat(64)}}
  const documents = []
  const document = raw => {
    const reference = ref(raw)
    documents.push({ref: reference, base64: raw.toString('base64')})
    return reference
  }
  const doc = value => document(Buffer.from(value))
  const object = (type, value) => {
    const raw = Buffer.from(value), oid = createHash('sha1').update(`${type} ${raw.length}\0`).update(raw).digest('hex')
    return {oid, type, base64: raw.toString('base64')}
  }
  const commit = object('commit', 'commit bytes'), tree = object('tree', 'tree bytes')
  const reportRef = ref(Buffer.from('qualified report')), qualifierRef = doc('qualification'), disposition = change ? 'advance' : 'noop'
  const pages = batchPages?.map(pageId => ({pageId, disposition, reportRef})) ??
    [{pageId: 'example-a', disposition, reportRef}, {pageId: 'example-b', disposition: 'noop', reportRef}]
  const index = {kind: 'guides-batch-collection-index-v1', base, run: {id: run - 100, attempt: 1, head: producer},
    groupSha256: '7'.repeat(64), qualifierRef, pages, writeEligible: false, operations: []}
  const {reference: indexRef, raw: indexRaw} = retain(index)
  document(indexRaw)
  const indexDigest = hash(Buffer.concat([Buffer.from('zdoc/guides-batch/index/v1\n'), indexRaw]))
  const bindingRaw = Buffer.from(JSON.stringify({kind: 'guides-batch-candidate-binding-v1', index: {ref: indexRef, digest: indexDigest},
    qualification: {ref: qualifierRef}, pages: index.pages.map(page => ({pageId: page.pageId, disposition: page.disposition,
      qualifiedReportRef: page.reportRef}))}))
  const localCandidate = {status: change ? 'candidate' : 'no-change', observation: 'observed',
    candidate: commit.oid, bindingDigest: hash(Buffer.concat([Buffer.from('zdoc/guides-batch/candidate-binding/v1\n'), bindingRaw])),
    binding: document(bindingRaw),
    plan: doc('plan'), proof: doc('proof')}
  const frame = {manifest: {kind: 'guides-batch-compact-handoff-v2', base, groupSha256: index.groupSha256,
    collection: {origin: batchOrigin, controlDigest: 'a'.repeat(64), indexRef, indexDigest},
    fetch: {run: index.run}, candidate: localCandidate.candidate, candidateTree: tree.oid,
    toolset: {sha256: base.pins.toolsetSha256}, binding: {digest: localCandidate.bindingDigest, ref: localCandidate.binding},
    plan: localCandidate.plan, proof: localCandidate.proof, patch: doc('patch'), qualification: {ref: qualifierRef}, members: index.pages.map(page => {
      const report = doc('collected report for ' + page.pageId)
      const context = doc(JSON.stringify({subject: {kind: 'guides-page', pageId: page.pageId}, reportBlob: report}))
      return {pageId: page.pageId, disposition: page.disposition, report, context}
    })},
    documents, objects: [commit, tree]}
  const result = {...held('collected', []), index: indexRef, localCandidate}
  if (batchPages) {
    for (const pageId of batchPages) {
      doc('history for ' + pageId)
      frame.objects.push(object('blob','lock for ' + pageId),object('tree','tree for ' + pageId))
    }
    // Four shared changed directories include the root tree already in the frame.
    frame.objects.push(...['shared-docs','guides','pages'].map(path => object('tree',path)))
  }
  return {paths, frame, retain, result}
}

function held(status = 'held', reasons = ['STALE_MASTER']) {
  return {kind: 'guides-batch-collection-v1', observation: 'observed', status, reasons, index: null, writeEligible: false, operations: []}
}

test('binds the initial scheduled or dispatched production prepare job', () => {
  assert.deepEqual(prepareContext(validEnv), ctx)
  assert.deepEqual(prepareContext({...validEnv, GITHUB_EVENT_NAME: 'workflow_dispatch'}), ctx)
  for (const [key, value] of Object.entries({GITHUB_REPOSITORY_ID: '42', GITHUB_REPOSITORY: 'liyun95/zdoc',
    GITHUB_JOB: 'prepare', GITHUB_RUN_ATTEMPT: '2', GITHUB_RUN_ID: '0' + run, GITHUB_EVENT_NAME: 'pull_request_target',
    GITHUB_REF: 'refs/heads/feature', GITHUB_REF_PROTECTED: 'false', GITHUB_WORKFLOW_SHA: producer,
    GITHUB_WORKFLOW_REF: 'zilliztech/zdoc/.github/workflows/other.yml@refs/heads/master'})) {
    assert.throws(() => prepareContext({...validEnv, [key]: value}), /BATCH_PREPARE_CONTEXT/, key)
  }
  const badCommand = spawnSync(process.execPath, [script, '--replay'], {env: validEnv, encoding: 'utf8'})
  assert.equal(badCommand.status, 1)
  assert.equal(badCommand.stdout, '')
  assert.match(badCommand.stderr, /BATCH_PREPARE_ARGUMENTS/)
})

test('requires distinct physical workspace and runner temp and a fresh private staging root', t => {
  const {env, workspace, temp, batchRoot} = stage(t)
  assert.deepEqual(preparePaths(env, ctx, workspace, workspace), {workspace, root: batchRoot, source: join(batchRoot, 'source.git'),
    evidence: join(batchRoot, 'evidence'), upload: join(batchRoot, 'upload')})
  assert.throws(() => preparePaths(env, ctx, workspace, temp), /BATCH_PREPARE_WORKSPACE/)
  const tempAlias = join(temp, 'temp-link')
  symlinkSync(temp, tempAlias)
  assert.throws(() => preparePaths({...env, RUNNER_TEMP: tempAlias}, ctx, workspace, workspace), /BATCH_PREPARE_TEMP/)
  symlinkSync(workspace, join(batchRoot, 'upload'))
  assert.throws(() => preparePaths(env, ctx, workspace, workspace), /BATCH_PREPARE_STAGE/)
})

test('drops unrelated credentials and executable configuration from the collector environment', () => {
  const child = collectorEnvironment({...validEnv, GH_TOKEN: 'test-read-only-token', GITHUB_TOKEN: 'ignore',
    NODE_OPTIONS: '--require anything', JITI_CACHE: 'true', HTTPS_PROXY: 'ignore', PYTHONPATH: 'ignore', GIT_CONFIG_COUNT: '1'})
  assert.equal(child.GH_TOKEN, 'test-read-only-token')
  assert.equal(child.JITI_CACHE, 'false')
  assert.equal(child.GITHUB_SHA, master)
  for (const key of ['GITHUB_TOKEN', 'NODE_OPTIONS', 'HTTPS_PROXY', 'PYTHONPATH', 'GIT_CONFIG_COUNT']) {
    assert.equal(Object.hasOwn(child, key), false)
  }
  assert.throws(() => collectorEnvironment({...validEnv, GH_TOKEN: 'bad\nvalue'}), /BATCH_PREPARE_TOKEN/)
})

test('retains only the positively bound handoff and exposes only counts', t => {
  const {paths, result, frame, retain} = fixture(t)
  const {reference, raw} = retain(frame)
  const settled = settleBatchPrepare({...result, handoff: reference}, paths, ctx)
  assert.deepEqual(settled, {status: 'prepared', pageCount: 2, changeCount: 1,
    handoffPath: join(paths.upload, 'handoff.json'), handoffSha256: reference.sha256})
  assert.deepEqual(readdirSync(paths.upload), ['handoff.json'])
  assert.deepEqual(readFileSync(settled.handoffPath), raw)
})

test('a 12-page candidate fits the same bounded transport with its full inventory', t => {
  const batchPages = Array.from({length:12},(_,i) => 'page-' + String(i).padStart(2,'0'))
  const {paths,result,frame,retain} = fixture(t,{batchPages})
  assert.equal(1 + frame.documents.length + frame.objects.length,72)
  const tooMany = structuredClone(frame)
  tooMany.objects.push({oid:'1'.repeat(40),type:'tree',base64:'eA=='})
  assert.throws(() => settleBatchPrepare({...result,handoff:retain(tooMany).reference},paths,ctx), /BATCH_PREPARE_HANDOFF/)
  const {reference} = retain(frame)
  assert.equal(settleBatchPrepare({...result,handoff:reference},paths,ctx).pageCount,12)
})

test('keeps holds, no group, and a no-op out of the upload directory', t => {
  const {paths, result} = fixture(t, {change: false})
  assert.deepEqual(settleBatchPrepare(held(), paths, ctx), {status: 'held', reasons: ['STALE_MASTER']})
  assert.deepEqual(settleBatchPrepare(held('no-group', []), paths, ctx), {status: 'no-group', reasons: []})
  assert.deepEqual(settleBatchPrepare(result, paths, ctx), {status: 'unchanged', pageCount: 2, changeCount: 0})
  assert.throws(() => settleBatchPrepare({...held(), localCandidate: result.localCandidate}, paths, ctx), /BATCH_PREPARE_RESULT/)
  assert.throws(() => settleBatchPrepare(held('held', ['credential=raw']), paths, ctx), /BATCH_PREPARE_RESULT/)
  assert.equal(existsSync(paths.upload), false)
})

test('rejects replay, mismatched measured data, CAS aliases, and tampering before upload', t => {
  const {paths, result, frame, retain} = fixture(t)
  const {reference, raw} = retain(frame)
  const ready = {...result, handoff: reference}
  const fail = (mutated, reason, context = ctx) => assert.throws(() => settleBatchPrepare(mutated, paths, context), reason)
  fail({...ready, observation: 'replay'}, /BATCH_PREPARE_RESULT/)
  fail(ready, /BATCH_PREPARE_INDEX/, {...ctx, master: producer})
  fail({...ready, handoff: {...reference, path: 'blobs/../../escape'}}, /BATCH_PREPARE_REFERENCE/)
  fail({...ready, handoff: {...reference, bytes: reference.bytes + 1}}, /BATCH_PREPARE_BLOB_IDENTITY/)
  fail({...ready, handoff: {...reference, bytes: 2 * 1024 ** 2 + 1}}, /BATCH_PREPARE_REFERENCE/)
  const substitutions = [
    [value => { value.manifest.collection.origin = {kind: 'replay'} }, /BATCH_PREPARE_HANDOFF/],
    [value => { value.manifest.collection.indexDigest = 'c'.repeat(64) }, /BATCH_PREPARE_HANDOFF/],
    [value => { value.manifest.fetch.run.head = master }, /BATCH_PREPARE_HANDOFF/],
    [value => { value.manifest.candidate = producer }, /BATCH_PREPARE_HANDOFF/],
    [value => { value.manifest.members[0].pageId = 'unrelated' }, /BATCH_PREPARE_HANDOFF_MEMBER/],
    [value => { value.manifest.members[0].report = value.manifest.members[1].report }, /BATCH_PREPARE_HANDOFF_MEMBER/],
    [value => { value.documents.splice(1, 1) }, /BATCH_PREPARE_HANDOFF_MEMBER/],
    [value => { value.documents[0].base64 = 'YXNk' }, /BATCH_PREPARE_HANDOFF_MEMBER/],
    [value => { value.objects[0].base64 = 'YXNk' }, /BATCH_PREPARE_HANDOFF_OBJECT/],
  ]
  for (const [mutate, reason] of substitutions) {
    const altered = structuredClone(frame)
    mutate(altered)
    fail({...ready, handoff: retain(altered).reference}, reason)
  }
  const path = join(paths.evidence, reference.path)
  raw[0] = 32
  writeFileSync(path, raw)
  fail(ready, /BATCH_PREPARE_BLOB_BINDING/)
  rmSync(path)
  symlinkSync(join(paths.evidence, result.index.path), path)
  fail(ready, /ELOOP/)
  assert.equal(existsSync(paths.upload), false)
})
