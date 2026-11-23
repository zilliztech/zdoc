import {execFileSync, fork} from 'node:child_process'
import {createHash} from 'node:crypto'
import {appendFileSync, closeSync, constants, fstatSync, lstatSync, mkdirSync, openSync, readdirSync, readSync,
  realpathSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {isAbsolute, join, relative, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const repository = 'zilliztech/zdoc'
const workflow = '.github/workflows/shared-guides-update.yml'
const sourceUrl = 'https://github.com/milvus-io/milvus-docs.git'
const checkout = fileURLToPath(new URL('../../../', import.meta.url))
const script = fileURLToPath(import.meta.url)
// Keep this outer archive allowance aligned with BATCH_HANDOFF_LIMITS.
const handoffLimit = 2 * 1024 ** 2
const memberLimit = 1024 ** 2
const resultLimit = 65536
const pageResponseLimit = 128 * 1024 ** 2
const materialPhases = new Set(['discovery-retention', 'launcher', 'allocation', 'worker', 'page-retention', 'projection', 'closure'])
const fixedEnvironment = {PATH: '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin', LANG: 'C', LC_ALL: 'C', TZ: 'UTC', JITI_CACHE: 'false'}
const gitEnvironment = {...fixedEnvironment, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_REPLACE_OBJECTS: '1', GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_ALLOW_PROTOCOL: ''}
const contextKeys = ['GITHUB_ACTIONS', 'GITHUB_SERVER_URL', 'GITHUB_API_URL', 'GITHUB_REPOSITORY', 'GITHUB_REPOSITORY_ID',
  'GITHUB_REF', 'GITHUB_REF_PROTECTED', 'GITHUB_SHA', 'GITHUB_WORKFLOW_SHA', 'GITHUB_WORKFLOW_REF', 'GITHUB_JOB',
  'GITHUB_RUN_ATTEMPT', 'GITHUB_RUN_ID', 'GITHUB_EVENT_NAME', 'GITHUB_WORKSPACE', 'RUNNER_TEMP']

const check = (condition, code) => { if (!condition) throw Error(code) }
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const validText = value => typeof value === 'string' && !/[\x00-\x1f\x7f]/.test(value)
const digest = value => typeof value === 'string' && value.length === 64 && /^[a-f0-9]{64}$/.test(value)
const oid = value => typeof value === 'string' && value.length === 40 && /^[a-f0-9]{40}$/.test(value) && !/^0+$/.test(value)
const positive = n => Number.isSafeInteger(n) && n > 0
const count = n => Number.isSafeInteger(n) && n >= 0
const pageId = id => typeof id === 'string' && id.length <= 255 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const shape = (value, names) => isRecord(value) && Object.keys(value).length === names.length &&
  names.every(name => Object.hasOwn(value, name))
const origin = value => shape(value, ['kind', 'purpose']) && value.kind === 'observed' && value.purpose === 'isolated-candidate'
const noWrites = value => value.writeEligible === false && Array.isArray(value.operations) && value.operations.length === 0

export function prepareContext(env) {
  const run = Number(env.GITHUB_RUN_ID)
  check(env.GITHUB_ACTIONS === 'true' && env.GITHUB_SERVER_URL === 'https://github.com' &&
    env.GITHUB_API_URL === 'https://api.github.com' && env.GITHUB_REPOSITORY === repository &&
    env.GITHUB_REPOSITORY_ID === '660446555' && env.GITHUB_REF === 'refs/heads/master' &&
    env.GITHUB_REF_PROTECTED === 'true' && oid(env.GITHUB_SHA) && env.GITHUB_WORKFLOW_SHA === env.GITHUB_SHA &&
    env.GITHUB_WORKFLOW_REF === repository + '/' + workflow + '@refs/heads/master' &&
    env.GITHUB_JOB === 'prepare_batch' && env.GITHUB_RUN_ATTEMPT === '1' &&
    ['schedule', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME) &&
    positive(run) && String(run) === env.GITHUB_RUN_ID, 'BATCH_PREPARE_CONTEXT')
  return {master: env.GITHUB_SHA, run}
}

function physicalDirectory(path, code, privateMode = false) {
  check(validText(path) && isAbsolute(path) && resolve(path) === path && realpathSync(path) === path, code)
  const stat = lstatSync(path)
  check(stat.isDirectory() && stat.uid === process.getuid() &&
    (stat.mode & (privateMode ? 0o077 : 0o022)) === 0, code)
  return stat
}

function inside(path, root) {
  const rel = relative(root, path)
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('../'))
}

export function preparePaths(env, ctx, workspace = resolve(checkout), cwd = process.cwd()) {
  check(env.GITHUB_WORKSPACE === workspace && cwd === workspace, 'BATCH_PREPARE_WORKSPACE')
  physicalDirectory(workspace, 'BATCH_PREPARE_WORKSPACE')
  physicalDirectory(env.RUNNER_TEMP, 'BATCH_PREPARE_TEMP')
  check(!inside(env.RUNNER_TEMP, workspace) && !inside(workspace, env.RUNNER_TEMP), 'BATCH_PREPARE_TEMP')
  const root = join(env.RUNNER_TEMP, `shared-guides-batch-prepare-${ctx.run}-1`)
  const source = join(root, 'source.git'), evidence = join(root, 'evidence'), upload = join(root, 'upload')
  physicalDirectory(root, 'BATCH_PREPARE_STAGE', true)
  physicalDirectory(source, 'BATCH_PREPARE_SOURCE')
  const entries = readdirSync(root)
  check(entries.length === 1 && entries[0] === 'source.git', 'BATCH_PREPARE_STAGE')
  return {workspace, root, source, evidence, upload}
}

function git(directory, argv) {
  return execFileSync('/usr/bin/git', ['-C', directory, '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', ...argv],
    {env: gitEnvironment, encoding: 'utf8', timeout: 30000, maxBuffer: resultLimit}).trim()
}

function verifyStores(paths, ctx) {
  check(git(paths.workspace, ['rev-parse', '--verify', 'HEAD^{commit}']) === ctx.master &&
    git(paths.workspace, ['rev-parse', '--is-shallow-repository']) === 'false' &&
    oid(git(paths.workspace, ['rev-parse', '--verify', 'refs/remotes/origin/dev^{commit}'])) &&
    git(paths.workspace, ['status', '--porcelain=v1', '--untracked-files=no', '--ignore-submodules=none']) === '',
    'BATCH_PREPARE_CHECKOUT')
  check(git(paths.source, ['rev-parse', '--is-bare-repository']) === 'true' &&
    git(paths.source, ['rev-parse', '--is-shallow-repository']) === 'false' &&
    git(paths.source, ['config', '--local', '--get-all', 'remote.origin.url']) === sourceUrl &&
    oid(git(paths.source, ['rev-parse', '--verify', 'refs/heads/v3.0.x^{commit}'])), 'BATCH_PREPARE_SOURCE')
}

function checkedReference(ref, limit = handoffLimit) {
  check(shape(ref, ['path', 'sha256', 'bytes']) && digest(ref.sha256) && ref.path === 'blobs/' + ref.sha256 &&
    positive(ref.bytes) && ref.bytes <= limit, 'BATCH_PREPARE_REFERENCE')
  return ref
}

function sameReference(a, b) {
  const ref = checkedReference(a)
  return ref.path === b.path && ref.sha256 === b.sha256 && ref.bytes === b.bytes
}

function ownedBytes(path, bytes) {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const stat = fstatSync(fd)
    check(stat.isFile() && stat.uid === process.getuid() && stat.nlink === 1 && (stat.mode & 0o022) === 0 &&
      stat.size === bytes, 'BATCH_PREPARE_BLOB_IDENTITY')
    const raw = Buffer.alloc(bytes + 1)
    let read = 0
    while (read < raw.length) {
      const count = readSync(fd, raw, read, raw.length - read, null)
      if (!count) break
      read += count
    }
    const after = lstatSync(path)
    check(read === bytes && stat.dev === after.dev && stat.ino === after.ino && stat.size === after.size &&
      stat.mtimeMs === after.mtimeMs && stat.ctimeMs === after.ctimeMs,
      'BATCH_PREPARE_BLOB_BINDING')
    return raw.subarray(0, read)
  } finally {
    closeSync(fd)
  }
}

function ownedBlob(path, ref) {
  const raw = ownedBytes(path, ref.bytes)
  check(hash(raw) === ref.sha256, 'BATCH_PREPARE_BLOB_BINDING')
  return raw
}

// Only project bounded public fields from the settled evidence into the
// decision artifact. No log, worker text, local path or capability leaves here.
export function readBatchMeasurements(paths) {
  const path = join(paths.evidence, 'measurement.json')
  physicalDirectory(paths.root, 'BATCH_PREPARE_STAGE', true)
  let stat
  try { stat = lstatSync(path) }
  catch (error) { if (error.code === 'ENOENT') return undefined; throw error }
  physicalDirectory(paths.evidence, 'BATCH_PREPARE_EVIDENCE', true)
  check(stat.isFile() && positive(stat.size) && stat.size <= resultLimit, 'BATCH_PREPARE_MEASUREMENT')
  const value = json(ownedBytes(path, stat.size))
  check(value?.kind === 'guides-batch-measurement-v1' && value.observation === 'observed' &&
    Array.isArray(value.pages) && count(value.elapsedMs), 'BATCH_PREPARE_MEASUREMENT')
  const seen = new Set()
  const pages = value.pages.map(({pageId: id, elapsedMs, responseBytes, materialBytes}) => {
    check(pageId(id) && !seen.has(id) && count(elapsedMs) && positive(responseBytes) && responseBytes <= pageResponseLimit &&
      positive(materialBytes) && materialBytes <= 64 * 1024 ** 2, 'BATCH_PREPARE_MEASUREMENT')
    seen.add(id)
    return {pageId: id, elapsedMs, responseBytes, materialBytes}
  })
  const result = {elapsedMs: value.elapsedMs, pages}
  if (value.materialFailure !== undefined) {
    const {phase, pageId: id, completedPages, phaseElapsedMs} = value.materialFailure
    check(materialPhases.has(phase) && (id === null || pageId(id) && !seen.has(id)) &&
      completedPages === pages.length && count(phaseElapsedMs), 'BATCH_PREPARE_MEASUREMENT')
    result.materialFailure = {phase, pageId: id, completedPages, phaseElapsedMs}
  }
  return result
}

function readRetained(evidence, ref) {
  checkedReference(ref)
  return ownedBlob(join(evidence, ref.path), ref)
}

function json(raw) {
  return JSON.parse(new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(raw))
}

function validateIndex(index, master) {
  check(isRecord(index) && index.kind === 'guides-batch-collection-index-v1' && origin(index.base?.origin) &&
    digest(index.base.session) && index.base.pins?.master === master && index.base.pins?.trustedTools === master &&
    oid(index.base.pins?.dev) && oid(index.base.pins?.source) && digest(index.base.pins?.toolsetSha256) &&
    digest(index.groupSha256) && noWrites(index) && positive(index.run?.id) &&
    index.run.attempt === 1 && oid(index.run.head) && Array.isArray(index.pages) &&
    index.pages.length > 0 && index.pages.length <= 64, 'BATCH_PREPARE_INDEX')
  let changed = 0
  for (const [i, page] of index.pages.entries()) {
    check(typeof page?.pageId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.pageId) &&
      (i === 0 || index.pages[i - 1].pageId < page.pageId) && ['advance', 'noop'].includes(page.disposition),
      'BATCH_PREPARE_INDEX')
    if (page.disposition === 'advance') changed++
  }
  return changed
}

function validateFrame(frame, index, indexRaw, indexRef, candidate) {
  check(shape(frame, ['manifest', 'documents', 'objects']) && Array.isArray(frame.documents) && Array.isArray(frame.objects) &&
    frame.documents.length > 0 && frame.objects.length > 0 &&
    frame.documents.length <= 7 + 3 * index.pages.length &&
    frame.objects.length <= 5 + 2 * index.pages.filter(page => page.disposition === 'advance').length, 'BATCH_PREPARE_HANDOFF')
  const m = frame.manifest
  const p = index.base.pins
  check(m?.kind === 'guides-batch-compact-handoff-v2' && origin(m.base?.origin) &&
    m.base.session === index.base.session && m.base.pins?.master === p.master && m.base.pins.trustedTools === p.trustedTools &&
    m.base.pins.dev === p.dev && m.base.pins.source === p.source && m.base.pins.toolsetSha256 === p.toolsetSha256 &&
    m.groupSha256 === index.groupSha256 && origin(m.collection?.origin) && digest(m.collection.controlDigest) &&
    sameReference(m.collection.indexRef, indexRef) &&
    m.collection.indexDigest === hash(Buffer.concat([Buffer.from('zdoc/guides-batch/index/v1\n'), indexRaw])) &&
    m.fetch?.run?.id === index.run.id && m.fetch.run.attempt === index.run.attempt && m.fetch.run.head === index.run.head &&
    m.candidate === candidate.candidate && oid(m.candidateTree) && m.toolset?.sha256 === p.toolsetSha256 &&
    m.binding?.digest === candidate.bindingDigest && sameReference(m.binding.ref, candidate.binding) &&
    sameReference(m.plan, candidate.plan) && sameReference(m.proof, candidate.proof) &&
    Array.isArray(m.members) && m.members.length === index.pages.length, 'BATCH_PREPARE_HANDOFF')
  const requiredDocuments = [indexRef, index.closureRef, m.binding.ref, m.plan, m.proof, m.patch, m.qualification?.ref]
  for (const [i, page] of index.pages.entries()) {
    const retained = m.members[i]
    check(retained?.pageId === page.pageId && retained.disposition === page.disposition &&
      checkedReference(retained.report), 'BATCH_PREPARE_HANDOFF_MEMBER')
    requiredDocuments.push(retained.report, retained.context)
  }
  const documents = new Map()
  for (const entry of frame.documents) {
    check(shape(entry, ['ref', 'base64']), 'BATCH_PREPARE_HANDOFF_MEMBER')
    const ref = checkedReference(entry.ref, memberLimit), bytes = decodeMember(entry.base64)
    check(ref.bytes === bytes.length && ref.sha256 === hash(bytes) && !documents.has(ref.sha256),
      'BATCH_PREPARE_HANDOFF_MEMBER')
    documents.set(ref.sha256, {ref, bytes})
  }
  function document(ref) {
    const entry = documents.get(checkedReference(ref, memberLimit).sha256)
    check(entry && sameReference(ref, entry.ref), 'BATCH_PREPARE_HANDOFF_MEMBER')
    return entry.bytes
  }
  for (const ref of requiredDocuments) document(ref)
  const bindingRaw = document(m.binding.ref), binding = json(bindingRaw)
  check(binding?.kind === 'guides-batch-candidate-binding-v1' && sameReference(binding.index?.ref, indexRef) &&
    binding.index.digest === m.collection.indexDigest &&
    sameReference(binding.closure?.ref, index.closureRef) && binding.closure.digest === m.groupSha256 &&
    m.groupSha256 === hash(Buffer.concat([Buffer.from('zdoc/guides-batch/closure/v1\n'), document(index.closureRef)])) &&
    m.binding.digest === hash(Buffer.concat([Buffer.from('zdoc/guides-batch/candidate-binding/v1\n'), bindingRaw])) &&
    sameReference(binding.qualification?.ref, m.qualification.ref) &&
    sameReference(m.qualification.ref, checkedReference(index.qualifierRef)) &&
    Array.isArray(binding.pages) && binding.pages.length === index.pages.length, 'BATCH_PREPARE_HANDOFF_BINDING')
  for (const [i, page] of index.pages.entries()) {
    const row = binding.pages[i], member = m.members[i], context = json(document(member.context))
    check(row?.pageId === page.pageId && row.disposition === page.disposition &&
      sameReference(row.qualifiedReportRef, checkedReference(page.reportRef)) &&
      context?.subject?.kind === 'guides-page' && context.subject.pageId === page.pageId &&
      sameReference(context.reportBlob, member.report), 'BATCH_PREPARE_HANDOFF_MEMBER')
  }
  const objects = new Map()
  for (const entry of frame.objects) {
    check(shape(entry, ['oid', 'type', 'base64']) && oid(entry.oid) &&
      ['commit', 'tree', 'blob'].includes(entry.type) && !objects.has(entry.oid), 'BATCH_PREPARE_HANDOFF_OBJECT')
    const bytes = decodeMember(entry.base64)
    check(createHash('sha1').update(`${entry.type} ${bytes.length}\0`).update(bytes).digest('hex') === entry.oid,
      'BATCH_PREPARE_HANDOFF_OBJECT')
    objects.set(entry.oid, entry.type)
  }
  check(objects.get(m.candidate) === 'commit' && objects.get(m.candidateTree) === 'tree', 'BATCH_PREPARE_HANDOFF_OBJECT')
}

function decodeMember(value) {
  check(typeof value === 'string' && value.length <= Math.ceil(memberLimit / 3) * 4, 'BATCH_PREPARE_HANDOFF_MEMBER')
  const raw = Buffer.from(value, 'base64')
  check(raw.length <= memberLimit && raw.toString('base64') === value, 'BATCH_PREPARE_HANDOFF_MEMBER')
  return raw
}

// The trusted collector is the only producer. Rebind its settled index and
// handoff outside the collector before exposing a file to the upload step.
export function settleBatchPrepare(result, paths, ctx) {
  check(isRecord(result) && result.kind === 'guides-batch-collection-v1' && result.observation === 'observed' &&
    noWrites(result) && Array.isArray(result.reasons) && result.reasons.length <= 32 &&
    result.reasons.every(code => typeof code === 'string' && code.length <= 96 && /^[A-Z][0-9A-Z_]*$/.test(code)),
    'BATCH_PREPARE_RESULT')
  if (result.status === 'held' || result.status === 'no-group') {
    check(!Object.hasOwn(result, 'handoff') && !Object.hasOwn(result, 'localCandidate') &&
      (result.status === 'held' ? result.reasons.length > 0 : result.index === null), 'BATCH_PREPARE_RESULT')
    return {status: result.status, reasons: result.reasons}
  }
  const candidate = result.localCandidate
  check(result.status === 'collected' && result.reasons.length === 0 && candidate?.observation === 'observed',
    'BATCH_PREPARE_RESULT')
  physicalDirectory(paths.root, 'BATCH_PREPARE_STAGE', true)
  physicalDirectory(paths.evidence, 'BATCH_PREPARE_EVIDENCE', true)
  physicalDirectory(join(paths.evidence, 'blobs'), 'BATCH_PREPARE_EVIDENCE', true)
  const indexRaw = readRetained(paths.evidence, result.index), index = json(indexRaw)
  const changed = validateIndex(index, ctx.master)
  const summary = {pageCount: index.pages.length, changeCount: changed}
  if (candidate.status === 'no-change') {
    check(!Object.hasOwn(result, 'handoff') && changed === 0, 'BATCH_PREPARE_RESULT')
    return {status: 'unchanged', ...summary}
  }
  check(candidate.status === 'candidate' && changed > 0 && oid(candidate.candidate) && digest(candidate.bindingDigest),
    'BATCH_PREPARE_RESULT')
  for (const ref of [candidate.binding, candidate.plan, candidate.proof]) checkedReference(ref)
  const raw = readRetained(paths.evidence, result.handoff)
  validateFrame(json(raw), index, indexRaw, result.index, candidate)

  mkdirSync(paths.upload, {mode: 0o700})
  const handoffPath = join(paths.upload, 'handoff.json')
  writeFileSync(handoffPath, raw, {flag: 'wx', mode: 0o600})
  physicalDirectory(paths.upload, 'BATCH_PREPARE_UPLOAD', true)
  const entries = readdirSync(paths.upload)
  check(entries.length === 1 && entries[0] === 'handoff.json' &&
    raw.equals(ownedBlob(handoffPath, result.handoff)), 'BATCH_PREPARE_UPLOAD')
  return {status: 'prepared', ...summary, handoffPath, handoffSha256: result.handoff.sha256}
}

export function collectorEnvironment(env) {
  check(validText(env.GH_TOKEN) && env.GH_TOKEN.length > 0, 'BATCH_PREPARE_TOKEN')
  return {...fixedEnvironment, ...Object.fromEntries(contextKeys.map(key => [key, env[key]])), GH_TOKEN: env.GH_TOKEN}
}

function collect(env, workspace) {
  return new Promise((resolveResult, reject) => {
    const worker = fork(script, [], {cwd: workspace, env: collectorEnvironment(env), execArgv: [],
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'], timeout: 76 * 60000, killSignal: 'SIGKILL'})
    let result, messages = 0
    worker.on('message', message => {
      messages++
      if (messages === 1 && typeof message === 'string' && Buffer.byteLength(message) <= resultLimit) result = message
    })
    worker.once('error', reject)
    worker.once('close', code => {
      if (code === 0 && messages === 1 && result !== undefined) resolveResult(result)
      else reject(Error('BATCH_PREPARE_COLLECTOR'))
    })
  }).then(jsonText => JSON.parse(jsonText))
}

async function collectInternal(paths) {
  const require = createRequire(import.meta.url)
  const {loadTypeScript} = require('../../lib/load-typescript.js')
  const {prepareObservedBatchHandoff} = loadTypeScript(
    join(paths.workspace, 'packages/docs-tooling/src/shared-docs/adapters/updates/batch-collection.ts'))
  const result = JSON.stringify(await prepareObservedBatchHandoff({sourceRepository: paths.source, out: paths.evidence}))
  check(Buffer.byteLength(result) <= resultLimit, 'BATCH_PREPARE_RESULT_LIMIT')
  await new Promise((resolveSend, reject) => process.send(result, error => error ? reject(error) : resolveSend()))
  process.disconnect()
}

function workflowOutputPath(env) {
  const path = env.GITHUB_OUTPUT, commandRoot = join(env.RUNNER_TEMP, '_runner_file_commands')
  physicalDirectory(commandRoot, 'BATCH_PREPARE_WORKFLOW_OUTPUT')
  check(validText(path) && path.startsWith(commandRoot + '/set_output_') && !relative(commandRoot, path).includes('/') &&
    realpathSync(path) === path, 'BATCH_PREPARE_WORKFLOW_OUTPUT')
  const stat = lstatSync(path)
  check(stat.isFile() && stat.uid === process.getuid() && stat.nlink === 1 && (stat.mode & 0o022) === 0,
    'BATCH_PREPARE_WORKFLOW_OUTPUT')
  return path
}

async function main(env) {
  check(process.argv.length === 2, 'BATCH_PREPARE_ARGUMENTS')
  const ctx = prepareContext(env), paths = preparePaths(env, ctx)
  if (process.send) {
    await collectInternal(paths)
    return
  }
  verifyStores(paths, ctx)
  const output = workflowOutputPath(env), collected = await collect(env, paths.workspace)
  const measurements = readBatchMeasurements(paths)
  const result = settleBatchPrepare(collected, paths, ctx)
  const {handoffPath, handoffSha256, ...summary} = result
  writeFileSync(join(paths.root, 'summary.json'), JSON.stringify({...summary, measurements}) + '\n', {flag: 'wx', mode: 0o600})
  let values = 'status=' + result.status + '\n'
  if (result.status === 'prepared') values += `handoff_path=${handoffPath}\nhandoff_sha256=${handoffSha256}\n`
  check(workflowOutputPath(env) === output, 'BATCH_PREPARE_WORKFLOW_OUTPUT')
  appendFileSync(output, values, {flag: constants.O_WRONLY | constants.O_APPEND | constants.O_NOFOLLOW | constants.O_NONBLOCK})
  console.log(JSON.stringify(summary))
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    await main(process.env)
  } catch (error) {
    const code = typeof error?.message === 'string' && /^BATCH_PREPARE_[A-Z_]+$/.test(error.message)
      ? error.message : 'BATCH_PREPARE_FAILED'
    console.error(code)
    process.exitCode = 1
  }
}
