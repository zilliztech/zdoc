import { deepEqual, equal, rejects } from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, generateKeyPairSync } from 'node:crypto'
import { mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { createIsolatedBatchDraft, initializeIsolatedBatchDraft, sealIsolatedBatchTransport } from './batch-draft.mjs'

const git = (cwd, ...args) => execFileSync('/usr/bin/git', ['-C', cwd, ...args], {
  env: { PATH: '/usr/bin:/bin', LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test', GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test' },
})
const oid = (cwd, revision) => git(cwd, 'rev-parse', revision).toString().trim()
const sha256 = data => createHash('sha256').update(data).digest('hex')

async function fixture(t, changeCount = 2) {
  const root = await mkdtemp(join(await realpath(tmpdir()), 'isolated-batch-draft-')), baseline = join(root, 'tools')
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(baseline, { mode: 0o700 })
  git(baseline, 'init', '-q', '-b', 'master', '--template=')
  const subjectIds = ['alpha', 'beta', 'noop']
  for (const id of subjectIds) await writeFile(join(baseline, id + '.lock'), 'next: old\n')
  git(baseline, 'add', '.')
  git(baseline, 'commit', '-qm', 'baseline')
  const master = oid(baseline, 'HEAD')
  git(baseline, 'checkout', '-qb', 'dev')
  git(baseline, 'commit', '-qm', 'sampled dev', '--allow-empty')
  const dev = oid(baseline, 'HEAD')
  const destination = initializeIsolatedBatchDraft(root, baseline)
  const changedIds = subjectIds.slice(0, changeCount)
  git(baseline, 'checkout', '-q', 'master')
  for (const id of changedIds) await writeFile(join(baseline, id + '.lock'), 'next: new\n')
  git(baseline, 'commit', '-qam', 'candidate', '--allow-empty')
  const candidate = oid(baseline, 'HEAD')
  git(baseline, 'commit', '-qm', 'seal fixture', '--allow-empty')
  const seal = oid(baseline, 'HEAD')
  const tree = oid(baseline, candidate + '^{tree}'), blob = oid(baseline, candidate + ':alpha.lock')
  const objects = [['blob', blob], ['tree', tree], ['commit', candidate], ['commit', seal]]
    .map(([type, oid]) => ({ type, oid, bytes: git(baseline, 'cat-file', type, oid) }))
  const documents = ['binding', 'plan', 'proof', 'index', 'qualification'].map(name => {
    const bytes = Buffer.from(name), sha = sha256(bytes)
    return { ref: { path: 'blobs/' + sha, sha256: sha, bytes: bytes.length }, bytes }
  })
  const [binding, plan, proof, index, qualification] = documents.map(d => d.ref)
  const identity = { binding, plan, proof, index, qualification, candidate, seal, sealKeySha256: sha256('fixture key') }
  const retained = { identity, documents, objects, subjectIds, changedIds, pins: { master, dev, source: '1'.repeat(40) } }
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const transport = sealIsolatedBatchTransport(retained, privateKey)
  const input = { destination, publicKey, archive: transport, verifyEvidence: async () => retained, verifyFresh: async () => {} }
  const pullPath = join(destination.root, 'test-pr.json')
  const findUpdate = async () => {
    try { return JSON.parse(await readFile(pullPath, 'utf8')) } catch (error) {
      if (error.code === 'ENOENT') return null
      throw error
    }
  }
  let count = 0
  const api = {
    findUpdate,
    async createDraft(row) {
      count++
      await writeFile(pullPath, JSON.stringify({ number: 1, ...row }), { flag: 'wx' })
      throw Error('fixture lost create acknowledgment')
    },
    readDraft: findUpdate,
  }
  return { ...input, api, draftCalls: () => count }
}

test('accepts one locally signed transport, reads back a lost response and holds repeat delivery', async t => {
  const input = await fixture(t)
  const observed = await createIsolatedBatchDraft(input)
  equal(observed.status, 'created', JSON.stringify(observed))
  equal(observed.responseLost, true)
  deepEqual(observed.subjects, ['alpha', 'beta', 'noop'])
  deepEqual(observed.changedPages, ['alpha', 'beta'])
  deepEqual(await createIsolatedBatchDraft(input), { status: 'held', reason: 'BATCH_DRAFT_EXISTING_UPDATE' })
  equal(input.draftCalls(), 1)
})

test('requires the harness capability and blocks an external Git object directory before import', async t => {
  const input = await fixture(t)
  const { destination } = input
  await rejects(createIsolatedBatchDraft({ ...input, destination: { ...destination } }), /BATCH_DRAFT_DESTINATION/)
  const original = join(destination.repository, 'objects'), outside = join(dirname(destination.root), 'outside-store')
  await rename(original, outside)
  await symlink(outside, original, 'dir')
  deepEqual(await createIsolatedBatchDraft(input), { status: 'held', reason: 'BATCH_DRAFT_DESTINATION' })
  equal(input.draftCalls(), 0)
})

test('an unconfirmed import leaves a durable interlock even before a branch exists', async t => {
  const input = await fixture(t)
  let reads = 0
  const first = await createIsolatedBatchDraft({ ...input, async verifyFresh() {
    if (++reads === 3) throw Error('fixture lost freshness response')
  } })
  equal(first.status, 'unknown', JSON.stringify(first))
  equal(git(input.destination.repository, 'for-each-ref', 'refs/heads/automation/').length, 0)
  deepEqual(await createIsolatedBatchDraft(input), { status: 'held', reason: 'BATCH_DRAFT_RECONCILE' })
  equal(input.draftCalls(), 0)
})

test('a master move during the final PR search stops before a Draft request', async t => {
  const input = await fixture(t)
  const { repository } = input.destination
  const master = oid(repository, 'refs/heads/master'), dev = oid(repository, 'refs/heads/dev')
  let reads = 0
  const observed = await createIsolatedBatchDraft({ ...input, api: { ...input.api, async findUpdate() {
    if (++reads === 3) git(repository, 'update-ref', 'refs/heads/master', dev, master)
    return null
  } } })
  equal(observed.status, 'unknown', JSON.stringify(observed))
  equal(observed.reason, 'BATCH_DRAFT_HEAD_CHANGED')
  equal(input.draftCalls(), 0)
})

test('blocks Git common-directory and reflog redirects before reading the candidate', async t => {
  const input = await fixture(t)
  const { repository, root } = input.destination
  const external = join(dirname(root), 'tools', '.git')
  let verifications = 0
  const verifyEvidence = async () => { verifications++; return input.verifyEvidence() }
  const commonDirectory = join(repository, 'commondir')
  await writeFile(commonDirectory, external + '\n', { flag: 'wx' })
  deepEqual(await createIsolatedBatchDraft({ ...input, verifyEvidence }), { status: 'held', reason: 'BATCH_DRAFT_DESTINATION' })
  await rm(commonDirectory)
  await symlink(join(external, 'logs'), join(repository, 'logs'), 'dir')
  deepEqual(await createIsolatedBatchDraft({ ...input, verifyEvidence }), { status: 'held', reason: 'BATCH_DRAFT_DESTINATION' })
  equal(verifications, 0)
  equal(input.draftCalls(), 0)
})

test('admits a multi-subject batch with one lock edit and required no-ops', async t => {
  const input = await fixture(t, 1)
  const draft = await createIsolatedBatchDraft(input)
  equal(draft.status, 'created', JSON.stringify(draft))
  deepEqual(draft.subjects, ['alpha', 'beta', 'noop'])
  deepEqual(draft.changedPages, ['alpha'])
  equal(git(input.destination.repository, 'diff', '--name-only', draft.base, draft.head).toString().trim(), 'alpha.lock')
  equal(input.draftCalls(), 1)
})

test('an all-no-op signed test payload cannot create objects, refs, a journal or a Draft', async t => {
  const input = await fixture(t, 0)
  const { root, repository } = input.destination
  const objects = git(repository, 'count-objects', '-v')
  const refs = git(repository, 'for-each-ref')
  deepEqual(await createIsolatedBatchDraft(input), { status: 'held', reason: 'BATCH_DRAFT_INVENTORY' })
  deepEqual(git(repository, 'count-objects', '-v'), objects)
  deepEqual(git(repository, 'for-each-ref'), refs)
  await rejects(readFile(join(root, 'isolated-draft-journal.jsonl')), { code: 'ENOENT' })
  equal(input.draftCalls(), 0)
})
