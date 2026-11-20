// @vitest-environment node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readdir, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { createBatchHandoffInventory, BATCH_HANDOFF_LIMITS } from '../../adapters/updates/batch-handoff'
import { initializeEvidence } from '../../adapters/updates/evidence'
import { inspectNewGuidesBatchCandidate, planNewGuidesObjectTransfer } from '../../adapters/updates/remote-transaction'
import { createScratchTransaction, type CandidateInput } from '../../adapters/updates/transactions'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { METADATA_LIMITS, parseRevisionMessage } from '../../core/updates/metadata'
import { planUpdateUnit } from '../../core/updates/unit-plan'
import { git, write } from '../build/demo'
import { fixtureBlob, fixtureMaterial } from './fixtures/manual-provider'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

function rawGit(repo: string, args: string[], input?: Uint8Array) {
  return execFileSync('/usr/bin/git', ['--no-replace-objects', '-C', repo, ...args], {
    input, stdio: ['pipe', 'pipe', 'pipe'],
    env: { PATH: '/usr/bin:/bin', LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_NO_LAZY_FETCH: '1' },
  })
}

async function guidesBatch(sharedLeaf = false) {
  const root = await mkdtemp(join(await realpath(tmpdir()), 'local-guides-batch-'))
  roots.push(root)
  const repository = join(root, 'input'), sourceTarget = '4'.repeat(40)
  const contexts = ['alpha', 'alpha-extra', 'stable'].map((pageId, index) => structuredClone(fixtureMaterial({
    subject: { kind: 'guides-page', group: 'guides', pageId }, current: (sharedLeaf && index === 1 ? '1' : String(index + 1)).repeat(40), target: sourceTarget,
    disposition: pageId === 'stable' ? 'noop' : 'candidate',
    members: [{ logicalId: pageId, manualId: 'guides', token: 'shared-' + pageId, outputPath: 'content/en/guides/' + pageId + '.mdx', origin: 'upstream', current: true, next: true }],
  })))
  const foreign = 'shared-docs/guides/pages/alpha/page.yaml'
  for (const context of contexts) await write(repository, context.lock.path, context.lock.before.text)
  if (!sharedLeaf) await write(repository, foreign, 'other data inside an edited subtree\n')
  await write(repository, 'README.md', 'repository data outside the edited subtree\n')
  await git(repository, 'init', '-q', '-b', 'master', '--template=')
  await git(repository, 'add', '.')
  await git(repository, 'commit', '-qm', 'master')
  const master = await git(repository, 'rev-parse', 'HEAD')
  await git(repository, 'checkout', '-qb', 'dev')
  await git(repository, 'commit', '-qm', 'dev', '--allow-empty')
  const dev = await git(repository, 'rev-parse', 'HEAD')
  const evidence = await initializeEvidence({ root: join(root, 'evidence'), repositories: [repository], owner: 'batch-transaction-fixture' })
  const transaction = await createScratchTransaction({ evidence, gitBinary: '/usr/bin/git' })
  await transaction.importObjects(repository, [master, dev])
  const lockPaths = contexts.map(context => context.lock.path)
  const base = await transaction.prepare({ master, donorHeads: [], lockPaths, dataPaths: lockPaths })
  for (const context of contexts) {
    Object.assign(context.collectedReport.pins, { master, dev, trustedTools: master, configSnapshot: master, configTreeOid: base.prepared.tree })
    Object.assign(context.reportBlob, await evidence.writeBlob(canonicalBytes(context.collectedReport)))
    await evidence.writeBlob(Buffer.from(context.lock.before.text))
    if (context.lock.preparedNext) await evidence.writeBlob(Buffer.from(context.lock.preparedNext.text))
  }
  const plan = planUpdateUnit(contexts.map(context => context.collectedReport), contexts)
  const executableClosure = await evidence.writeBlob(Buffer.from('synthetic batch transaction closure\n'))
  const value: CandidateInput = { base, plan, trustedTools: master, dev, toolsetSha256: contexts[0].collectedReport.pins.toolsetSha256, executableClosure,
    revision: { kind: 'shared-update-revision', schemaVersion: 1, unitKey: plan.unitKey, subjects: plan.subjects, parentHead: master, master, dev, tools: master,
      memberSetSha256: plan.membersSha256, planSha256: digest('plan', plan), previousBotCommit: null, preservedHumanHeads: [],
      lockDeltas: plan.nextEdits.map(edit => ({ path: edit.before.path, current: edit.before.current, oldNext: edit.before.next, next: edit.target })) } }
  const proof = await transaction.createCandidate(value)
  const baseline = {
    async verifyConnected(commits: readonly string[]) { rawGit(repository, ['fsck', '--connectivity-only', '--no-dangling', ...commits]) },
    async read(oid: string, type: 'blob' | 'tree' | 'commit') { return rawGit(repository, ['cat-file', type, oid]) },
  }
  const trustedToolset = { sha256: value.toolsetSha256, executableClosure }
  const input = { master, dev, sourceTarget, trustedToolset, contexts, plan, proof, source: transaction, baseline }
  const run = (args: string[], stdin?: Uint8Array) => rawGit(transaction.repository, args, stdin).toString().trim()
  const commitWithTree = async (tree: string, parent = master) => {
    const raw = await transaction.read(proof.candidate, 'commit')
    return run(['hash-object', '-t', 'commit', '-w', '--stdin'], Buffer.from(raw.toString().replace(
      'tree ' + proof.candidateTree + '\nparent ' + master + '\n', 'tree ' + tree + '\nparent ' + parent + '\n')))
  }
  const counterfeit = async (path: string, bytes: string | null, mode = '100644', parent = master) => {
    run(['read-tree', proof.candidate])
    if (bytes === null) run(['update-index', '--index-info'], Buffer.from('0 ' + '0'.repeat(40) + '\t' + path + '\n'))
    else {
      const blob = run(['hash-object', '-t', 'blob', '-w', '--stdin'], Buffer.from(bytes))
      run(['update-index', '--add', '--cacheinfo', [mode, blob, path].join(',')])
    }
    const tree = run(['write-tree'])
    const candidate = await commitWithTree(tree, parent)
    const patch = await evidence.writeBlob(await transaction.rawDiff(parent, candidate))
    return { ...input, proof: { ...proof, candidate, candidateTree: tree, patch } }
  }
  return { input, value, transaction, repository, evidence, counterfeit, foreign, commitWithTree }
}

it('verifies one connected candidate for two next edits and a required noop in Git raw diff order', async () => {
  const { input, value, transaction, repository, evidence } = await guidesBatch()
  const baseline = vi.spyOn(input.baseline, 'verifyConnected')
  const delta = await inspectNewGuidesBatchCandidate(input)
  expect(baseline).toHaveBeenCalledExactlyOnceWith([input.master, input.dev])
  expect(delta.candidate.oid).toBe(input.proof.candidate)
  expect(delta.candidate.parents).toEqual([input.master])
  expect(parseRevisionMessage(delta.candidate.message)).toEqual(value.revision)
  expect(input.plan.subjects).toEqual(input.contexts.map(context => context.subject))
  expect(input.plan.reports).toEqual(input.contexts.map(context => context.reportBlob))
  expect(delta.rawDiff).toEqual(await transaction.rawDiff(input.master, input.proof.candidate))
  expect(delta.rawDiff).toEqual(Buffer.from(await evidence.readBlob(input.proof.patch)))
  expect(delta.rawDiff.toString().split('\0').filter((_, index) => index % 2 === 1)).toEqual(input.contexts.slice(0, 2).reverse().map(context => context.lock.path))
  for (const context of input.contexts) {
    const edited = input.plan.nextEdits.some(edit => edit.before.path === context.lock.path)
    expect(await transaction.blobAt(input.proof.candidate, context.lock.path)).toEqual(Buffer.from(edited ? context.lock.preparedNext!.text : context.lock.before.text))
  }
  expect(delta.objects.map(object => object.type)).toEqual(['blob', 'tree', 'blob', 'tree', 'tree', 'tree', 'tree', 'tree', 'commit'])
  for (const object of delta.objects) {
    for (const dep of object.dependencies) expect(rawGit(repository, ['cat-file', '-t', dep.oid]).toString().trim()).toBe(dep.type)
    expect(rawGit(repository, ['hash-object', '-t', object.type, '-w', '--stdin'], object.bytes).toString().trim()).toBe(object.oid)
  }
  expect(rawGit(repository, ['fsck', '--connectivity-only', '--no-dangling', input.proof.candidate])).toHaveLength(0)
  expect(await git(repository, 'rev-parse', 'master', 'dev')).toBe(input.master + '\n' + input.dev)
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
  await expect(planNewGuidesObjectTransfer(input)).rejects.toThrow('PLAN_BINDING')
}, 30_000)

it('holds substituted or incomplete plans, proofs, pins and required noop material', async () => {
  const { input, transaction, value } = await guidesBatch()
  const partial = input.plan.nextEdits.slice(0, 1)
  for (const variant of [
    { ...input, contexts: input.contexts.slice(0, 2) },
    { ...input, plan: { ...input.plan, reports: input.plan.reports.slice().reverse() } },
    { ...input, plan: { ...input.plan, nextEdits: partial }, proof: { ...input.proof, nextEdits: partial } },
    { ...input, proof: { ...input.proof, nextEdits: partial } },
    { ...input, proof: { ...input.proof, patch: input.trustedToolset.executableClosure } },
    { ...input, proof: { ...input.proof, executableClosure: input.proof.patch } },
    { ...input, proof: { ...input.proof, candidateTree: input.proof.prepared.tree } },
    { ...input, sourceTarget: '5'.repeat(40) },
    { ...input, dev: input.master },
  ]) await expect(inspectNewGuidesBatchCandidate(variant)).rejects.toThrow()
  const contexts = structuredClone(input.contexts)
  const noop = contexts[2], competingTip = '5'.repeat(40)
  noop.collectedReport.pins.source.observedTrackHead = competingTip
  Object.assign(noop.reportBlob, fixtureBlob(canonicalBytes(noop.collectedReport)))
  Object.assign(noop, { history: [...noop.history!, { oid: competingTip, parents: [input.sourceTarget] }] })
  const inconsistentPlan = planUpdateUnit(contexts.map(context => context.collectedReport), contexts)
  expect(inconsistentPlan.disposition).toBe('candidate')
  await expect(inspectNewGuidesBatchCandidate({ ...input, contexts, plan: inconsistentPlan })).rejects.toThrow('COLLECTED_PINS_CHANGED')

  const wrongNoopLock = structuredClone(input.contexts)
  const text = ' ' + wrongNoopLock[2].lock.before.text
  Object.assign(wrongNoopLock[2].lock.before, { text, blob: fixtureBlob(text) })
  expect(planUpdateUnit(wrongNoopLock.map(context => context.collectedReport), wrongNoopLock)).toEqual(input.plan)
  await expect(inspectNewGuidesBatchCandidate({ ...input, contexts: wrongNoopLock })).rejects.toThrow('BlobRef byte length mismatch')
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
}, 30_000)

it('rejects any missing, unchanged, foreign, extra or incorrectly written lock', async () => {
  const { input, counterfeit, foreign, transaction, value } = await guidesBatch()
  const [edit, , noop] = input.contexts, after = edit.lock.preparedNext!.text
  for (const [path, bytes, mode, reason] of [
    [edit.lock.path, null, undefined, 'CANDIDATE_NOT_NEXT_ONLY'],
    [edit.lock.path, edit.lock.before.text, undefined, 'CANDIDATE_NOT_NEXT_ONLY'],
    [edit.lock.path, after, '100755', 'CANDIDATE_NOT_NEXT_ONLY'],
    [edit.lock.path, after, '120000', 'CANDIDATE_NOT_NEXT_ONLY'],
    [edit.lock.path, after.replace(input.sourceTarget, '5'.repeat(40)), undefined, 'LOCK_NOT_NEXT_ONLY'],
    [edit.lock.path, after.replace(edit.collectedReport.pins.source.current, '5'.repeat(40)), undefined, 'LOCK_NOT_NEXT_ONLY'],
    [noop.lock.path, noop.lock.preparedNext!.text, undefined, 'CANDIDATE_NOT_NEXT_ONLY'],
    [foreign, 'unexpected data\n', undefined, 'CANDIDATE_NOT_NEXT_ONLY'],
    ['unexpected.md', 'extra root entry\n', undefined, 'CANDIDATE_NOT_NEXT_ONLY'],
  ] as const) await expect(inspectNewGuidesBatchCandidate(await counterfeit(path, bytes, mode))).rejects.toThrow(reason)
  await expect(inspectNewGuidesBatchCandidate(await counterfeit(edit.lock.path, after, undefined, input.dev))).rejects.toThrow('CANDIDATE_BINDING')
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
}, 30_000)

it('stops before candidate reads when the receiver cannot prove connectivity', async () => {
  const { input } = await guidesBatch()
  const source = { read: vi.fn(input.source.read) }
  await expect(inspectNewGuidesBatchCandidate({ ...input, source, baseline: { ...input.baseline,
    async verifyConnected() { throw Error('incomplete connected base') },
  } })).rejects.toThrow('incomplete connected base')
  expect(source.read).not.toHaveBeenCalled()
}, 30_000)

it('refuses an all-noop unit before reading candidate objects', async () => {
  const { input } = await guidesBatch()
  const contexts = input.contexts.slice(2)
  const plan = planUpdateUnit(contexts.map(context => context.collectedReport), contexts)
  expect(plan.disposition).toBe('noop')
  expect(plan.nextEdits).toEqual([])
  const source = { read: vi.fn(input.source.read) }
  await expect(inspectNewGuidesBatchCandidate({ ...input, contexts, plan, source })).rejects.toThrow('PLAN_BINDING')
  expect(source.read).not.toHaveBeenCalled()
}, 30_000)

it('requires the captured toolset even when the substituted reports, candidate and proof agree', async () => {
  const { input, transaction, value } = await guidesBatch()
  const contexts = structuredClone(input.contexts), toolsetSha256 = 'a'.repeat(64)
  for (const context of contexts) {
    const report = context.collectedReport
    report.pins.toolsetSha256 = toolsetSha256
    report.semanticProjection!.toolsetSha256 = toolsetSha256
    report.semanticInputSha256 = digest('semantic', report.semanticProjection)
    Object.assign(context.reportBlob, fixtureBlob(canonicalBytes(report)))
  }
  const plan = planUpdateUnit(contexts.map(context => context.collectedReport), contexts)
  const proof = await transaction.createCandidate({ ...value, plan, toolsetSha256,
    revision: { ...value.revision, planSha256: digest('plan', plan) } })
  const source = { read: vi.fn(input.source.read) }
  await expect(inspectNewGuidesBatchCandidate({ ...input, contexts, plan, proof, source })).rejects.toThrow('TOOLSET_BINDING')
  expect(source.read).not.toHaveBeenCalled()
}, 30_000)

it('rejects oversized material, plan and proof inventories before parsing their members', async () => {
  const { input } = await guidesBatch()
  const subjects = Array(METADATA_LIMITS.subjects + 1).fill(null)
  const edits = Array(METADATA_LIMITS.lockDeltas + 1).fill(null)
  for (const variant of [
    { ...input, contexts: Array(METADATA_LIMITS.subjects + 1).fill(input.contexts[0]) },
    { ...input, plan: { ...input.plan, subjects } },
    { ...input, plan: { ...input.plan, reports: subjects } },
    { ...input, plan: { ...input.plan, nextEdits: edits } },
    { ...input, proof: { ...input.proof, nextEdits: edits } },
  ]) await expect(inspectNewGuidesBatchCandidate(variant)).rejects.toThrow('BATCH_CANDIDATE_LIMIT')
}, 30_000)

it('authenticates shared lock blobs and subtrees once while preserving both changed paths', async () => {
  const { input, transaction } = await guidesBatch(true)
  const source = { read: vi.fn(input.source.read) }
  const baseline = { ...input.baseline, read: vi.fn(input.baseline.read) }
  const delta = await inspectNewGuidesBatchCandidate({ ...input, source, baseline })
  expect(delta.rawDiff).toEqual(await transaction.rawDiff(input.master, input.proof.candidate))
  expect(delta.rawDiff.toString().split('\0').filter((_, index) => index % 2 === 1)).toEqual(input.plan.nextEdits.map(edit => edit.before.path))
  expect(delta.objects.map(object => object.type)).toEqual(['blob', 'tree', 'tree', 'tree', 'tree', 'tree', 'commit'])
  expect(source.read.mock.calls.map(([oid]) => oid)).toEqual([...new Set(source.read.mock.calls.map(([oid]) => oid))])
  expect(baseline.read.mock.calls.map(([oid]) => oid)).toEqual([...new Set(baseline.read.mock.calls.map(([oid]) => oid))])
}, 30_000)

it('rejects noncanonical tree ordering even at a Git-authenticated candidate OID', async () => {
  const { input, transaction, commitWithTree } = await guidesBatch()
  const raw = await transaction.read(input.proof.candidateTree, 'tree')
  // The root contains README.md and shared-docs. Reverse the two raw entries.
  const end = raw.indexOf(0) + 21
  const candidateTree = rawGit(transaction.repository, ['hash-object', '--literally', '-t', 'tree', '-w', '--stdin'],
    Buffer.concat([raw.subarray(end), raw.subarray(0, end)])).toString().trim()
  const candidate = await commitWithTree(candidateTree)
  await expect(inspectNewGuidesBatchCandidate({ ...input, proof: { ...input.proof, candidate, candidateTree } })).rejects.toThrow('TREE_ORDER')
}, 30_000)

it('reserves batch scratch initialization and rejects history imports or ref writes', async () => {
  const root = await mkdtemp(join(await realpath(tmpdir()), 'local-guides-batch-pack-'))
  roots.push(root)
  const input = join(root, 'input')
  await write(input, 'README.md', 'A pack that needs explicit admission.\n')
  await git(input, 'init', '-q', '-b', 'master', '--template=')
  await git(input, 'add', '.')
  await git(input, 'commit', '-qm', 'master')
  const master = await git(input, 'rev-parse', 'HEAD')
  const evidence = await initializeEvidence({root: join(root, 'evidence'), repositories: [input], owner: 'batch-pack-fixture'})
  const allocations: {bytes: number; entries: number}[] = []
  const transaction = await createScratchTransaction({evidence, gitBinary: '/usr/bin/git', batch: {async reserve(bytes, entries) {
    allocations.push({bytes, entries})
  }}})
  await expect(transaction.importObjects(input, [master])).rejects.toThrow('BATCH_SCRATCH_IMPORT_DISABLED')
  await expect(transaction.install('0'.repeat(64), master, null)).rejects.toThrow('BATCH_SCRATCH_REF_WRITE_DISABLED')
  expect(allocations).toEqual([{bytes: 4096, entries: 32}])
  expect(await readdir(join(transaction.repository, 'objects', 'pack'))).toEqual([])
}, 30_000)

it('uses a pinned local baseline and leaves unrelated missing objects outside scratch', async () => {
  const {input, value, repository, evidence} = await guidesBatch()
  const {openLocalBatchBaseline} = await import('../../adapters/updates/batch-source')
  const {preparePinnedLocalGuidesBatchCandidate, inspectPinnedLocalGuidesBatchCandidate} = await import('../../adapters/updates/remote-transaction')
  await git(repository, 'symbolic-ref', 'HEAD', 'refs/heads/master')
  const lost = await git(repository, 'rev-parse', input.master + ':README.md')
  const missing = (oid: string) => join(repository, '.git', 'objects', oid.slice(0, 2), oid.slice(2))
  await rm(missing(lost))
  const baseline = await openLocalBatchBaseline({repository, git: '/usr/bin/git', master: input.master, dev: input.dev, checkLocalDev: true})
  const localEvidence = await initializeEvidence({root: join(evidence.root, 'bounded'), repositories: [repository], owner: 'bounded-batch-fixture'})
  const scratch = await createScratchTransaction({evidence: localEvidence, gitBinary: '/usr/bin/git', batch: {async reserve() {}}})
  const options = {...input, baseline, source: scratch}
  const proof = await preparePinnedLocalGuidesBatchCandidate({...options, revision: value.revision,
    write: (type, bytes, oid) => scratch.retainBatchObject(type, bytes, oid), readBlob: ref => evidence.readBlob(ref),
    retainPatch: bytes => localEvidence.writeBlob(bytes)})
  const verified = await inspectPinnedLocalGuidesBatchCandidate({...options, proof})
  expect(proof.candidate).toBe(input.proof.candidate)
  expect(proof.candidateTree).toBe(input.proof.candidateTree)
  await expect(scratch.read(lost, 'blob')).rejects.toThrow()
  await expect(scratch.read(input.master, 'commit')).rejects.toThrow()
  expect(rawGit(scratch.repository, ['for-each-ref'])).toHaveLength(0)
  expect(await git(repository, 'rev-parse', 'refs/heads/master', 'refs/heads/dev')).toBe(input.master + '\n' + input.dev)
  expect(() => rawGit(repository, ['cat-file', 'commit', proof.candidate])).toThrow()
  expect(rawGit(scratch.repository, ['cat-file', '--batch-all-objects', '--batch-check=%(objectname)']).toString().trim().split('\n').sort())
    .toEqual(verified.objects.map(o => o.oid).sort())
  // The untouched member is required even though its subtree and blob stay in the baseline.
  const noop = input.contexts[2]
  const noopOid = await git(repository, 'rev-parse', input.master + ':' + noop.lock.path)
  await rm(missing(noopOid))
  const incomplete = await openLocalBatchBaseline({repository, git: '/usr/bin/git', master: input.master, dev: input.dev, checkLocalDev: true})
  await expect(inspectPinnedLocalGuidesBatchCandidate({...options, baseline: incomplete, proof})).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
  const drifted = await openLocalBatchBaseline({repository, git: '/usr/bin/git', master: input.master, dev: input.dev, checkLocalDev: true})
  await git(repository, 'update-ref', 'refs/heads/dev', input.master)
  await expect(inspectPinnedLocalGuidesBatchCandidate({...options, baseline: drifted, proof})).rejects.toThrow('BATCH_PIN_CHANGED')
  await git(repository, 'update-ref', 'refs/heads/dev', input.dev)
  await git(repository, 'symbolic-ref', 'HEAD', 'refs/heads/dev')
  await expect(drifted.verifyPins(input.master, input.dev)).rejects.toThrow('BATCH_PIN_CHANGED')
  await git(repository, 'symbolic-ref', 'HEAD', 'refs/heads/master')
  await write(repository, '.git/objects/info/alternates', join(scratch.repository, 'objects') + '\n')
  await expect(openLocalBatchBaseline({repository, git: '/usr/bin/git', master: input.master, dev: input.dev, checkLocalDev: true}))
    .rejects.toThrow('GIT_METADATA_INVALID')
}, 30_000)


it('bounds the compact candidate inventory by decoded entries, bytes and the final encoded frame', () => {
  const inventory = createBatchHandoffInventory()
  const raw = Buffer.from('raw Git blob, not JSON')
  const oid = createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex')
  const ref = fixtureBlob(Buffer.from('witness document'))
  inventory.document(ref, Buffer.from('witness document'))
  inventory.document(ref, Buffer.from('witness document'))
  expect(() => inventory.document(ref, Buffer.from('wrong document'))).toThrow('BATCH_HANDOFF_BLOB_BINDING')
  expect(() => inventory.object({ oid, type: 'tree', bytes: raw })).toThrow('BATCH_HANDOFF_GIT_BINDING')
  inventory.object({ oid, type: 'blob', bytes: raw })
  const frames = inventory.frames()
  expect(frames.documents.map(item => item.ref)).toEqual([ref])
  expect(frames.objects).toEqual([{ oid, type: 'blob', base64: raw.toString('base64') }])
  expect(() => inventory.object({ oid, type: 'blob', bytes: raw })).toThrow('BATCH_HANDOFF_GIT_BINDING')

  const memberLimit = createBatchHandoffInventory()
  for (let i = 0; i < BATCH_HANDOFF_LIMITS.members - 1; i++) {
    const bytes = Buffer.from(String(i))
    memberLimit.document(fixtureBlob(bytes), bytes)
  }
  expect(() => memberLimit.document(ref, Buffer.from('witness document'))).toThrow('BATCH_HANDOFF_LIMIT')
  const entryLimit = createBatchHandoffInventory()
  const tooLarge = Buffer.alloc(BATCH_HANDOFF_LIMITS.entryBytes + 1)
  expect(() => entryLimit.document(fixtureBlob(tooLarge), tooLarge)).toThrow('BATCH_HANDOFF_LIMIT')
  const byteLimit = createBatchHandoffInventory()
  const half = Buffer.alloc(BATCH_HANDOFF_LIMITS.entryBytes)
  byteLimit.document(fixtureBlob(half), half)
  expect(() => byteLimit.encode({ padding: 'p'.repeat(BATCH_HANDOFF_LIMITS.entryBytes) })).toThrow('BATCH_HANDOFF_LIMIT')
  const other = Buffer.alloc(BATCH_HANDOFF_LIMITS.entryBytes, 1)
  expect(() => byteLimit.document(fixtureBlob(other), other)).toThrow('BATCH_HANDOFF_LIMIT')
})
