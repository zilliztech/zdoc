'use strict'
const fs = require('node:fs/promises')
const {constants} = require('node:fs')
const path = require('node:path')
const {pathToFileURL} = require('node:url')
const {createHash, createPublicKey, generateKeyPairSync, sign} = require('node:crypto')
const {deepStrictEqual, equal, match, rejects} = require('node:assert/strict')
const {execFileSync, spawnSync} = require('node:child_process')
// Run against a clean committed checkout with the already-installed workspace dependencies.
const cwd = path.resolve(__dirname, '../../..')
const args = process.argv.slice(2)
const flags = new Set(args.slice(2)), simulate = flags.has('--simulate-free-space'), compact = flags.has('--compact-handoff'), manual = flags.has('--manual-fetch')
if (args[0] !== '--out' || !args[1] || flags.size !== args.length - 2 || flags.size !== Number(simulate) + Number(compact) + Number(manual)) {
  throw Error('Usage: node batch-candidate-replay.fixture.cjs --out <fresh-directory> [--simulate-free-space] [--compact-handoff] [--manual-fetch]')
}
const lane = path.resolve(args[1]), out = path.join(lane, 'owned')
const git = (root, ...args) => execFileSync('/usr/bin/git', ['-C', root, ...args], {
  env: {PATH: '/usr/bin:/bin', GIT_NO_LAZY_FETCH: '1', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C'},
  maxBuffer: 128 * 1024 * 1024,
})
const {loadTypeScript} = require(path.join(cwd, 'scripts/lib/load-typescript.js'))
const load = name => loadTypeScript(path.join(cwd, 'packages/docs-tooling/src/shared-docs', name))
const actualStatfs = fs.statfs
const write = (name, data) => fs.writeFile(path.join(lane, name), JSON.stringify(data, null, 2) + '\n')
async function main() {
  if (process.platform !== 'darwin') throw Error('Measured fixture capture requires the supported local macOS toolset')
  if (git(cwd, 'status', '--porcelain', '--untracked-files=no').length) throw Error('Expected clean committed inputs')
  const code = git(cwd, 'rev-parse', 'HEAD').toString().trim()
  await fs.mkdir(lane, {mode: 0o700})
  const tools = path.join(lane, 'tools')
  await fs.mkdir(tools, {mode: 0o700})
  const stat = await actualStatfs(lane, {bigint: true})
  await write('capacity.json', {code, actualFreeBytes: Number(stat.bsize * stat.bavail), simulatedFreeSpace: simulate, productionCapacityClaim: false})
  execFileSync('/usr/bin/tar', ['-x', '--exclude=shared-docs/guides', '-C', tools], {input: git(cwd, 'archive', code)})
  const dependencyRoots = ['node_modules']
  for (const group of ['apps', 'packages']) for (const entry of await fs.readdir(path.join(cwd, group), {withFileTypes: true})) {
    if (entry.isDirectory()) dependencyRoots.push(path.join(group, entry.name, 'node_modules'))
  }
  for (const relative of dependencyRoots) {
    const original = path.join(cwd, relative), copied = path.join(tools, relative)
    if (!(await fs.lstat(original).catch(() => null))?.isDirectory()) continue
    execFileSync('/bin/cp', ['-cRP', original, copied])
    // This copy is owned by the fixture. Capture only package inputs and preserve
    // any generated tool caches outside the executable checkout.
    for (const cache of ['.cache', '.vite', '.vite-temp']) {
      const source = path.join(copied, cache)
      if (await fs.lstat(source).then(() => true, () => false)) await fs.rename(source, path.join(lane, relative.replaceAll('/', '_') + cache))
    }
  }
  git(tools, 'init', '--quiet', '--template=', '-b', 'master')
  git(tools, 'add', '.')
  git(tools, '-c', 'user.name=Local fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'Committed executable fixture')
  // This fixture exercises the actual measured subprocesses and Git/signature flow.
  // The free-space observation alone is synthetic because the host is below the unchanged gate.
  if (simulate) fs.statfs = async (target, options) => {
    const original = await actualStatfs(target, options)
    if (options?.bigint && (target === lane || target === out)) original.bavail = (8n * 1024n ** 3n) / original.bsize
    return original
  }
  const {rawBatchLifecycleFixture} = load('testing/updates/fixtures/batch-qualification.ts')
  const f = await rawBatchLifecycleFixture(lane, tools, {mixedTargets: true, mergedPull: true, manualFetch: manual})
  const generated = path.join(f.tools, 'packages/chat-ui/dist')
  if (await fs.lstat(generated).then(() => true, () => false)) {
    await fs.rename(generated, path.join(lane, 'generated-chat-ui-dist'))
  }
  await fs.writeFile(path.join(lane, 'replay-fixture.json'), f.fixtureBytes)
  const {captureTrustedToolset, describeTrustedToolset} = load('adapters/updates/toolset.ts')
  const capture = await captureTrustedToolset({root: f.tools, commit: f.master, cwd: f.tools})
  const {prepareObservedBatchHandoff, prepareReplayBatchHandoffFixture, prepareReplayGuidesBatchCandidate} = load('adapters/updates/batch-collection.ts')
  const optionsForReplay = {sourceRepository: f.upstream, zdocRepository: f.tools, out,
    capture, fixtureBytes: f.fixtureBytes, replayClockMs: f.replayClockMs}
  if (compact) {
    const wrongOrigin = await prepareObservedBatchHandoff(optionsForReplay)
    equal(wrongOrigin.status, 'held')
    deepStrictEqual(wrongOrigin.reasons, ['BATCH_LAUNCH_BINDING_INVALID'])
    equal(wrongOrigin.handoff, undefined)
  }
  const result = await (compact ? prepareReplayBatchHandoffFixture : prepareReplayGuidesBatchCandidate)(optionsForReplay)
  await write('result.json', result)
  equal(result.status, 'collected', JSON.stringify(result))
  equal(result.writeEligible, false)
  deepStrictEqual(result.operations, [])
  const candidate = result.localCandidate
  equal(candidate.status, 'candidate')
  equal(candidate.observation, 'replay')
  const {initializeEvidence} = load('adapters/updates/evidence.ts')
  const evidence = await initializeEvidence({root: out, repositories: [f.tools, f.upstream], owner: 'guides-batch-replay', resume: true, maxBytes: 64 * 1024 * 1024})
  const {createScratchTransaction} = load('adapters/updates/transactions.ts')
  const transaction = await createScratchTransaction({evidence, gitBinary: describeTrustedToolset(capture).git, resume: true})
  const value = async ref => JSON.parse(Buffer.from(await evidence.readBlob(ref)).toString('utf8'))
  const {canonicalBytes} = load('core/updates/canonical.ts')
  const put = value => evidence.writeBlob(canonicalBytes(value))
  const [binding, plan, proof] = await Promise.all([candidate.binding, candidate.plan, candidate.proof].map(value))
  deepStrictEqual(binding.pages.map(p => [p.pageId, p.disposition]), [['json-field-overview', 'advance'], ['member-b', 'advance'], ['member-c', 'noop']])
  deepStrictEqual(plan.subjects.map(s => s.pageId), f.pages)
  deepStrictEqual(plan.nextEdits.map(e => e.subject.pageId), f.pages.slice(0, 2))
  equal(binding.base.origin.kind, 'replay')
  const refs = await Promise.all(plan.reports.map(value))
  equal(refs.every(report => report.authority.evidence.some(ref => ref.sha256 === candidate.binding.sha256)), true)
  const roots = {base: binding.base, run: binding.run, discoveryRef: binding.discovery.ref, discoveryDigest: binding.discovery.digest,
    closureRef: binding.closure.ref, groupSha256: binding.closure.digest, materialRoot: binding.materials.ref, materialDigest: binding.materials.digest,
    scopeRef: binding.scope.ref, scopeDigest: binding.scope.digest, qualifierRef: binding.qualification.ref, qualifierDigest: binding.qualification.digest,
    profileDigest: binding.method.profileSha256, indexRef: binding.index.ref, indexDigest: binding.index.digest}
  const {openLocalBatchBaseline} = load('adapters/updates/batch-source.ts')
  const baseline = await openLocalBatchBaseline({repository: f.tools, git: describeTrustedToolset(capture).git, master: f.master, dev: f.sampledDev, checkLocalDev: true})
  const {inspectSignedBatchCandidate, prepareQualifiedBatchCandidate, prepareQualifiedBatchCandidateHandoff} = load('adapters/updates/batch-candidate.ts')
  const options = {roots, evidence, transaction, baseline, bindingRef: candidate.binding, planRef: candidate.plan, proofRef: candidate.proof,
    sealRef: candidate.seal, sealOid: candidate.sealOid, publicKey: createPublicKey(candidate.publicKey),
    executableClosure: await evidence.writeBlob(capture.bytes), toolset: capture.material, budget() {}}
  const exact = await inspectSignedBatchCandidate(options)
  if (compact) {
    await rejects(prepareQualifiedBatchCandidateHandoff(binding), /BATCH_LAUNCH_BINDING_INVALID/)
    await verifyCompactHandoff({result, evidence, candidate, binding, plan, proof, baseline, exact, canonicalBytes, tools: f.tools, executableClosure: options.executableClosure})
  } else equal(result.handoff, undefined)
  const negatives = [
    ['missing noop', {bindingRef: await put({...binding, pages: binding.pages.slice(0, -1)})}, /BATCH_CANDIDATE_BINDING/],
    ['substituted qualification', {bindingRef: await put({...binding, qualification: binding.closure})}, /BATCH_CANDIDATE_BINDING/],
    ['substituted report', {planRef: await put({...plan, reports: [...plan.reports.slice(0, 2), plan.reports[0]]})}, /BATCH_CANDIDATE_PLAN/],
    ['substituted authenticated pins', {bindingRef: await put({...binding, pages: binding.pages.map((row, i) => i ? row : {...row, qualifiedPinsRef: binding.pages[1].qualifiedPinsRef})})}, /BATCH_CANDIDATE_BINDING/],
    ['substituted proof', {proofRef: await put({...proof, candidateTree: proof.prepared.tree})}, /PREPARED_TREE_BINDING/],
    ['wrong profile digest', {roots: {...roots, profileDigest: '0'.repeat(64)}}, /BATCH_CANDIDATE_QUALIFICATION/],
    ['wrong executable closure', {executableClosure: await put({kind: 'substituted-closure'})}, /Closure material binding mismatch/],
    ['wrong verification key', {publicKey: generateKeyPairSync('ed25519').publicKey}, /BATCH_CANDIDATE_SIGNATURE/],
    ['absent seal', {sealRef: candidate.proof}, /BATCH_CANDIDATE_SEAL/],
  ]
  for (const [, input, reason] of negatives) await rejects(inspectSignedBatchCandidate({...options, ...input}), reason)
  await rejects(prepareQualifiedBatchCandidate(binding), /BATCH_LAUNCH_BINDING_INVALID/)
  const qualification = await value(binding.qualification.ref)
  const {verifyBatchFinalFreshness} = load('adapters/updates/batch-github.ts')
  await rejects(verifyBatchFinalFreshness({scanStartMs: qualification.scanStartMs, sourceJobId: qualification.rows[0].sourceJobId, run: qualification.run,
    sourceArtifact: qualification.sourceArtifact, publicationArtifact: qualification.publicationArtifact, selectionArtifact: qualification.selectionArtifact, pins: binding.base.pins},
  qualification.scanStartMs + 37 * 3600_000, f.fixture.finalPass), /BATCH_FRESHNESS_EXPIRED/)
  const index = await value(binding.index.ref), closure = await value(binding.closure.ref)
  // The standalone graph probe reconstructs locator fields for the retained
  // evidence. It cannot recreate the original active process acknowledgements.
  async function probeGraph() {
    const root = await fs.open(out, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
    try {
      const blobs = await fs.open(path.join(out, 'blobs'), constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
      try {
        const identity = async fd => {
          const stat = await fd.stat({bigint: true})
          return {dev: String(stat.dev), ino: String(stat.ino)}
        }
        const graphInput = canonicalBytes({kind: 'guides-batch-verify-control-v1', ...roots, receiptsRoot: index.receiptsRoot,
          qualifierRequestSha256: '0'.repeat(64), qualifierRequestBytes: 1, rootIdentity: await identity(root), blobsIdentity: await identity(blobs)})
        return spawnSync('/usr/bin/python3', ['-I', '-S', '-B',
          path.join(f.tools, 'scripts/docs-workflow/shared-guides-update/prepare.py'), 'verify-batch-collection'], {
          input: graphInput, stdio: ['pipe', 'pipe', 'pipe', 'pipe', root.fd, blobs.fd], encoding: 'utf8',
        })
      } finally {await blobs.close()}
    } finally {await root.close()}
  }
  const verified = await probeGraph()
  equal(verified.status, 0, verified.stderr)
  const leaves = [index.receiptsRoot.pages[0].receiptRef, index.receiptsRoot.pages[0].outputs[0].ref, closure.obligationRefs[0]]
  for (const ref of leaves) {
    const original = path.join(out, ref.path), held = path.join(lane, 'held-' + ref.sha256)
    await fs.rename(original, held)
    try {
      const failed = await probeGraph()
      equal(failed.status, 1, failed.stderr)
      equal(failed.output[3], '')
    } finally {await fs.rename(held, original)}
  }
  const replay = await replayDraft({f, options, inspectSignedBatchCandidate, binding, candidate, plan, evidence, qualification,
    verifyBatchFinalFreshness, graphProbe: async () => {
      if ((await probeGraph()).status !== 0) throw Error('BATCH_DRAFT_GRAPH_REJECTED')
    }, missingRef: index.receiptsRoot.pages[2].receiptRef})
  await write('draft-replay.json', replay)
  const scratchRefs = git(transaction.repository, 'for-each-ref').toString()
  const scratchObjects = git(transaction.repository, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname)').toString().trim().split('\n')
  equal(scratchObjects.includes(f.master) || scratchObjects.includes(f.sampledDev), false)
  equal(scratchObjects.includes(candidate.candidate) && scratchObjects.includes(candidate.sealOid), true)
  equal(git(transaction.repository, 'count-objects', '-v').toString().split('\n').includes('in-pack: 0'), true)
  deepStrictEqual(git(f.tools, 'rev-parse', 'refs/heads/master', 'refs/heads/dev').toString().trim().split('\n'), [f.master, f.sampledDev])
  equal(git(f.upstream, 'rev-parse', 'refs/heads/v3.0.x').toString().trim(), f.target)
  equal(scratchRefs, '')
  await write('independent.json', {code, exact: {status: exact.status, candidate: exact.candidate, seal: exact.seal}, negatives: negatives.map(([name]) => name), expired: true, scratchObjects: scratchObjects.length, missingGraphLeavesRejected: 3, replayCannotGrantObserved: true})
  console.log(JSON.stringify({code, fixtureMaster: f.master, out, status: replay.draft.status, drafts: replay.draftCount, simulation: simulate}))
}

async function verifyCompactHandoff({result, evidence, candidate, binding, plan, proof, baseline, exact, canonicalBytes, tools, executableClosure}) {
  const {batchRef} = load('adapters/updates/batch-collection-contract.ts')
  const {inspectObservedBatchHandoff, inspectReplayBatchHandoff} = load('adapters/updates/batch-handoff.ts')
  const {compareUtf8} = load('core/updates/canonical.ts')
  const bytes = Buffer.from(await evidence.readBlob(result.handoff))
  const frame = JSON.parse(bytes)
  const {pins} = binding.base
  const expected = {ref: result.handoff, pins, executableClosure}
  const input = {bytes, expected, baseline: {
    read: (oid, type) => baseline.read(oid, type),
    async verifyConnected(commits) {
      deepStrictEqual(commits, [pins.master, pins.dev])
      await baseline.verifyPins(pins.master, pins.dev)
      git(tools, 'fsck', '--connectivity-only', '--no-dangling', ...commits)
    },
  }}
  const verified = await inspectReplayBatchHandoff(input)
  const {manifest} = verified
  equal(verified.status, 'verified-witness')
  equal(verified.observation, 'replay')
  equal(verified.writeEligible, false)
  deepStrictEqual(verified.operations, [])
  deepStrictEqual(verified.proof, proof)
  deepStrictEqual(verified.plan, plan)
  const closure = JSON.parse(Buffer.from(await evidence.readBlob(binding.closure.ref)).toString('utf8'))
  const pullSeeds = closure.seedKeys.filter(seed => seed.startsWith('pr:')).map(seed => Number(seed.slice(3))).sort((a, b) => a - b)
  const commitSeeds = closure.seedKeys.filter(seed => seed.startsWith('commit:')).map(seed => seed.slice('commit:'.length))
  equal(pullSeeds.length + commitSeeds.length > 0, true)
  deepStrictEqual(verified.upstream, {pulls: pullSeeds, directCommits: commitSeeds})
  for (const row of verified.nextLocks) {
    const edit = plan.nextEdits.find(edit => edit.subject.pageId === row.pageId)
    if (edit) deepStrictEqual([row.before, row.after], [edit.before.next, edit.target])
    else equal(row.before, row.after)
  }
  deepStrictEqual(manifest.base, binding.base)
  equal(manifest.groupSha256, binding.closure.digest)
  deepStrictEqual(manifest.binding, {ref: candidate.binding, digest: candidate.bindingDigest})
  deepStrictEqual(manifest.members.map(row => [row.pageId, row.disposition]), binding.pages.map(row => [row.pageId, row.disposition]))
  deepStrictEqual(verified.objects.map(o => o.oid).sort(), exact.objects.map(o => o.oid).sort())
  equal(verified.objects.some(o => o.oid === candidate.sealOid), false)
  equal(frame.documents.some(d => d.ref.sha256 === proof.executableClosure.sha256), false)
  const pointer = JSON.parse(await fs.readFile(path.join(out, 'index.json')))
  deepStrictEqual(manifest.collection, pointer)
  equal(createHash('sha256').update(await fs.readFile(path.join(out, pointer.archive.path))).digest('hex'), pointer.archive.sha256)
  equal(JSON.parse(await fs.readFile(path.join(out, 'measurement.json'))).observation, 'replay')
  await rejects(() => inspectObservedBatchHandoff(input), /BATCH_HANDOFF_ORIGIN/)
  await rejects(() => inspectReplayBatchHandoff({...input, expected: {...expected, pins: {...pins, dev: pins.master}}}),
    /BATCH_HANDOFF_PINS/)

  const legacy = canonicalBytes({...frame, documents: frame.documents.filter(item => item.ref.sha256 !== binding.closure.ref.sha256)})
  const legacyResult = await inspectReplayBatchHandoff({...input, bytes: legacy, expected: {...expected, ref: batchRef(legacy)}})
  deepStrictEqual(legacyResult.upstream, {pulls: [], directCommits: []})
  deepStrictEqual(legacyResult.nextLocks, verified.nextLocks)

  const negatives = []
  async function tamper(name, mutate, reason) {
    const changed = structuredClone(frame)
    mutate(changed)
    const changedBytes = canonicalBytes(changed)
    await rejects(() => inspectReplayBatchHandoff({...input, bytes: changedBytes, expected: {...expected, ref: batchRef(changedBytes)}}), reason)
    negatives.push(name)
  }
  await tamper('missing noop', changed => changed.manifest.members.pop(), /BATCH_HANDOFF_CLOSURE/)
  await tamper('missing report', changed => {
    changed.documents = changed.documents.filter(item => item.ref.sha256 !== changed.manifest.members[0].report.sha256)
  }, /BATCH_HANDOFF_DOCUMENT/)
  await tamper('substituted report', changed => {
    changed.manifest.members[0].report = changed.manifest.members[1].report
  }, /BATCH_HANDOFF_MEMBERS/)
  await tamper('substituted attribution closure', changed => {
    const source = changed.documents.find(item => item.ref.sha256 === binding.closure.ref.sha256)
    const raw = Buffer.from(source.base64, 'base64').toString('utf8')
    source.base64 = Buffer.from(raw.replace(/"(?:pr|commit):/, prefix => `"x${prefix.slice(2)}`)).toString('base64')
    equal(source.base64 === frame.documents.find(item => item.ref.sha256 === binding.closure.ref.sha256).base64, false)
  }, /BLOB_BINDING/)
  await tamper('extra document', changed => {
    const raw = Buffer.from('null')
    changed.documents.push({ref: batchRef(raw), base64: raw.toString('base64')})
    changed.documents.sort((a, b) => compareUtf8(a.ref.sha256, b.ref.sha256))
  }, /BATCH_HANDOFF_INVENTORY/)
  await tamper('changed Git bytes', changed => {
    changed.objects[0].base64 = Buffer.from('wrong object').toString('base64')
  }, /BATCH_HANDOFF_GIT_BINDING/)
  await tamper('changed root tree', changed => {
    changed.manifest.candidateTree = changed.manifest.candidate
  }, /BATCH_HANDOFF_PROOF/)
  await tamper('extra Git object', changed => {
    const raw = Buffer.from('unrequested object')
    const oid = createHash('sha1').update('blob ' + raw.length + '\0').update(raw).digest('hex')
    changed.objects.push({oid, type: 'blob', base64: raw.toString('base64')})
    changed.objects.sort((a, b) => compareUtf8(a.oid, b.oid))
  }, /BATCH_HANDOFF_GIT_INVENTORY/)
  await write('compact-handoff-verification.json', {ref: result.handoff, candidate: verified.proof.candidate, tree: verified.proof.candidateTree,
    group: manifest.groupSha256, documents: frame.documents.length, objects: verified.objects.length,
    members: manifest.members.map(row => [row.pageId, row.disposition]), bytes: bytes.length,
    rawPatchBytes: verified.rawPatch.length, observation: verified.observation, upstream: verified.upstream, nextLocks: verified.nextLocks, negatives})
}

async function replayDraft({f, options, inspectSignedBatchCandidate, binding, candidate, plan, evidence, qualification,
  verifyBatchFinalFreshness, graphProbe, missingRef}) {
  const writerPath = path.join(f.tools, 'scripts/docs-workflow/shared-guides-update/batch-draft.mjs')
  const {createIsolatedBatchDraft, initializeIsolatedBatchDraft, sealIsolatedBatchTransport} = await import(pathToFileURL(writerPath).href)
  const {privateKey, publicKey} = generateKeyPairSync('ed25519')
  const destination = initializeIsolatedBatchDraft(lane, f.tools)
  const {root, repository} = destination
  const publicVerificationKey = publicKey.export({type: 'spki', format: 'pem'})
  await fs.writeFile(path.join(lane, 'transport-public-key.pem'), publicVerificationKey)
  const key = createPublicKey(publicVerificationKey)
  const identity = {binding: candidate.binding, plan: candidate.plan, proof: candidate.proof, index: binding.index.ref,
    qualification: binding.qualification.ref, candidate: candidate.candidate, seal: candidate.sealOid,
    sealKeySha256: createHash('sha256').update(candidate.publicKey).digest('hex')}
  const changedIds = plan.nextEdits.map(edit => edit.subject.pageId)
  const subjectIds = plan.subjects.map(subject => subject.pageId)
  const refs = [identity.binding, identity.plan, identity.proof, identity.index, identity.qualification,
    ...binding.pages.flatMap(row => [row.qualifiedReportRef, row.qualifiedPinsRef]), ...plan.reports]
  const verifyEvidence = async () => {
    await graphProbe()
    const verified = await inspectSignedBatchCandidate(options)
    const seal = {type: 'commit', oid: candidate.sealOid, bytes: await evidence.readBlob(candidate.seal)}
    const documents = await Promise.all(refs.map(async ref => ({ref, bytes: await evidence.readBlob(ref)})))
    return {identity, objects: [...verified.objects, seal], documents, pins: binding.base.pins, changedIds, subjectIds}
  }
  const archive = sealIsolatedBatchTransport(await verifyEvidence(), privateKey)
  await fs.writeFile(path.join(lane, 'signed-transport.json'), archive, {mode: 0o600})
  const verifyFreshAt = async (pins, time) => {
    const target = git(f.upstream, 'rev-parse', 'refs/heads/v3.0.x').toString().trim()
    if (target !== pins.source) throw Error('BATCH_DRAFT_TRACK_CHANGED')
    await verifyBatchFinalFreshness({scanStartMs: qualification.scanStartMs, sourceJobId: qualification.rows[0].sourceJobId,
      run: qualification.run, sourceArtifact: qualification.sourceArtifact, publicationArtifact: qualification.publicationArtifact,
      selectionArtifact: qualification.selectionArtifact, pins},
    time, f.fixture.finalPass)
  }

  // The fake retains one PR row across fresh client instances and models a
  // creation whose response can disappear after the write is committed.
  const prPath = path.join(root, 'pull-requests.json')
  let createRequests = 0
  function api({loseResponse = false} = {}) {
    const findUpdate = async () => {
      try {return JSON.parse(await fs.readFile(prPath, 'utf8'))}
      catch (error) {if (error.code === 'ENOENT') return null; throw error}
    }
    return {
      findUpdate,
      async createDraft(request) {
        createRequests++
        const record = {number: 1, ...request}
        await fs.writeFile(prPath, JSON.stringify(record) + '\n', {flag: 'wx', mode: 0o600, flush: true})
        if (loseResponse) throw Error('SIMULATED_ACK_LOSS')
        return record
      },
      async readDraft(number) {
        const record = await findUpdate()
        if (record?.number !== number) throw Error('Readback identity missing')
        return record
      },
    }
  }
  const common = {destination, archive, publicKey: key, verifyEvidence,
    verifyFresh: pins => verifyFreshAt(pins, f.replayClockMs)}
  const state = () => [
    git(repository, 'for-each-ref', '--format=%(refname) %(objectname)').toString(),
    git(repository, 'count-objects', '-v').toString(),
    createRequests,
  ]
  const negatives = {}
  async function holds(label, overrides, reason) {
    const before = state()
    const result = await createIsolatedBatchDraft({...common, api: api(), ...overrides})
    equal(result.status, 'held', JSON.stringify(result))
    equal(result.reason, reason)
    deepStrictEqual(state(), before)
    negatives[label] = result.reason
  }

  await holds('expired evidence', {verifyFresh: pins => verifyFreshAt(pins, qualification.scanStartMs + 37 * 3600_000)}, 'BATCH_FRESHNESS_EXPIRED')
  await holds('untrusted signature key', {publicKey: generateKeyPairSync('ed25519').publicKey}, 'BATCH_TRANSPORT_SIGNATURE')
  await holds('oversized archive', {archive: Buffer.alloc(2 * 1024 * 1024 + 1)}, 'BATCH_TRANSPORT_LIMIT')
  const payload = JSON.parse(archive.toString()).payload
  const forged = structuredClone(payload)
  forged.qualification = forged.index
  const resign = value => Buffer.from(JSON.stringify({payload: value,
    signature: sign(null, Buffer.concat([Buffer.from('zdoc:isolated-guides-batch-transport:v1\0'), Buffer.from(JSON.stringify(value))]), privateKey).toString('base64')}))
  await holds('substituted qualification with valid transport signature', {archive: resign(forged)}, 'BATCH_TRANSPORT_EVIDENCE')
  const partial = structuredClone(payload)
  partial.documents.splice(9, 1)
  await holds('missing retained no-op document', {archive: resign(partial)}, 'BATCH_TRANSPORT_EVIDENCE')
  const original = path.join(out, missingRef.path), absent = path.join(lane, 'held-draft-receipt')
  await fs.rename(original, absent)
  try {await holds('missing receipt in the retained graph', {}, 'BATCH_DRAFT_GRAPH_REJECTED')}
  finally {await fs.rename(absent, original)}
  git(repository, 'update-ref', 'refs/heads/dev', f.master, f.sampledDev)
  try {await holds('destination dev moved', {}, 'BATCH_DRAFT_HEAD_CHANGED')}
  finally {git(repository, 'update-ref', 'refs/heads/dev', f.sampledDev, f.master)}
  git(repository, 'update-ref', 'refs/heads/master', f.sampledDev, f.master)
  try {await holds('destination master moved', {}, 'BATCH_DRAFT_HEAD_CHANGED')}
  finally {git(repository, 'update-ref', 'refs/heads/master', f.master, f.sampledDev)}
  git(f.upstream, 'update-ref', 'refs/heads/v3.0.x', f.current, f.target)
  try {await holds('source track moved', {}, 'BATCH_DRAFT_TRACK_CHANGED')}
  finally {git(f.upstream, 'update-ref', 'refs/heads/v3.0.x', f.target, f.current)}

  const existing = api()
  await fs.writeFile(prPath, JSON.stringify({number: 12, state: 'open', draft: true}) + '\n', {mode: 0o600, flag: 'wx'})
  try {await holds('pre-existing update PR', {api: existing}, 'BATCH_DRAFT_EXISTING_UPDATE')}
  finally {await fs.unlink(prPath)}
  await fs.writeFile(path.join(root, 'isolated-draft.lock'), '', {mode: 0o600, flag: 'wx'})
  try {await holds('concurrent writer reservation', {}, 'BATCH_DRAFT_BUSY')}
  finally {await fs.unlink(path.join(root, 'isolated-draft.lock'))}

  const journalPath = path.join(root, 'isolated-draft-journal.jsonl')
  const sentinel = path.join(lane, 'journal-outside-destination.txt')
  await fs.writeFile(sentinel, 'untouched fixture witness\n', {flag: 'wx', mode: 0o600})
  await fs.symlink(sentinel, journalPath)
  try {
    await holds('journal symlink', {}, 'BATCH_DRAFT_JOURNAL')
    equal(await fs.readFile(sentinel, 'utf8'), 'untouched fixture witness\n')
  } finally {await fs.unlink(journalPath)}
  await rejects(createIsolatedBatchDraft({...common, destination: {...destination}, api: api()}), /BATCH_DRAFT_DESTINATION/)

  const acquired = Promise.withResolvers(), resume = Promise.withResolvers()
  let freshnessReads = 0
  const candidateWriter = createIsolatedBatchDraft({...common, api: api({loseResponse: true}), async verifyFresh(pins) {
    if (++freshnessReads === 2) {
      acquired.resolve()
      await resume.promise
    }
    await common.verifyFresh(pins)
  }})
  await Promise.race([acquired.promise, candidateWriter.then(result => {throw Error(JSON.stringify(result))})])
  try {await holds('competing invocation', {}, 'BATCH_DRAFT_BUSY')}
  finally {resume.resolve()}
  const draft = await candidateWriter
  equal(draft.status, 'created', JSON.stringify(draft))
  equal(draft.responseLost, true)
  equal(draft.draft, true)
  equal(draft.head, candidate.sealOid)
  equal(draft.base, f.master)
  deepStrictEqual(draft.changedPages, f.pages.slice(0, 2))
  deepStrictEqual(draft.subjects, f.pages)
  equal(createRequests, 1)
  const expectedPaths = changedIds.map(id => 'shared-docs/guides/pages/' + id + '/lock.yaml')
  const actualPaths = git(repository, 'diff', '--name-only', f.master, draft.head).toString().trim().split('\n')
  deepStrictEqual(actualPaths, expectedPaths)
  equal(git(repository, 'rev-parse', draft.head + '^').toString().trim(), candidate.candidate)
  const patch = git(repository, 'diff', '--unified=0', f.master, draft.head).toString()
  deepStrictEqual(patch.split('\n').filter(line => /^[+-](?![+-])/.test(line)).map(line => line.slice(1).split(':')[0]), ['next', 'next', 'next', 'next'])
  await fs.writeFile(path.join(lane, 'verified-lock.patch'), patch)
  await holds('repeat', {}, 'BATCH_DRAFT_EXISTING_UPDATE')
  equal(createRequests, 1)
  const journal = await fs.readFile(path.join(root, 'isolated-draft-journal.jsonl'), 'utf8')
  match(journal, /"state":"confirmed","operation":"open-draft","number":1/)
  // A late change can occur after this writer created its ref but during a
  // PR-discovery response. Only the new sibling lane receives the fault.
  const staleDestination = initializeIsolatedBatchDraft(lane, f.tools, 'draft-stale')
  let discoveries = 0, lateCreates = 0
  const stale = await createIsolatedBatchDraft({...common, destination: staleDestination, api: {
    async findUpdate() {
      if (++discoveries === 3) {
        git(staleDestination.repository, 'update-ref', 'refs/heads/master', f.sampledDev, f.master)
      }
      return null
    },
    async createDraft() {lateCreates++; throw Error('MUTATION_AFTER_LATE_MASTER_CHANGE')},
  }})
  equal(stale.status, 'unknown', JSON.stringify(stale))
  equal(stale.reason, 'BATCH_DRAFT_HEAD_CHANGED')
  equal(lateCreates, 0)
  const staleJournal = await fs.readFile(path.join(staleDestination.root, 'isolated-draft-journal.jsonl'), 'utf8')
  equal(staleJournal.includes('"operation":"open-draft"'), false)

  const uncertainDestination = initializeIsolatedBatchDraft(lane, f.tools, 'draft-uncertain')
  let uncertainChecks = 0
  const uncertainApi = {
    async findUpdate() {return null},
    async createDraft() {lateCreates++; throw Error('MUTATION_AFTER_UNKNOWN_RESULT')},
  }
  const uncertainOptions = {...common, destination: uncertainDestination, api: uncertainApi}
  const unknown = await createIsolatedBatchDraft({...uncertainOptions, async verifyFresh(pins) {
    if (++uncertainChecks === 3) throw Error('SIMULATED_FRESHNESS_READ_LOSS')
    await common.verifyFresh(pins)
  }})
  equal(unknown.status, 'unknown', JSON.stringify(unknown))
  equal(unknown.reason, 'SIMULATED_FRESHNESS_READ_LOSS')
  const uncertainSnapshot = () => [
    git(uncertainDestination.repository, 'for-each-ref', '--format=%(refname) %(objectname)').toString(),
    git(uncertainDestination.repository, 'count-objects', '-v').toString(),
    lateCreates,
  ]
  const previous = uncertainSnapshot()
  equal(previous[0].includes('automation/wp12-guides-batch-'), false)
  const reconcile = await createIsolatedBatchDraft(uncertainOptions)
  deepStrictEqual(reconcile, {status: 'held', reason: 'BATCH_DRAFT_RECONCILE'})
  deepStrictEqual(uncertainSnapshot(), previous)
  equal(lateCreates, 0)
  return {draft, draftCount: createRequests, archiveBytes: archive.length, changedPaths: actualPaths, negatives, repository,
    lateHeadChange: stale, uncertainImport: unknown, retryAfterUncertainImport: reconcile}
}

main().catch(error => {console.error(error); process.exitCode = 1})
