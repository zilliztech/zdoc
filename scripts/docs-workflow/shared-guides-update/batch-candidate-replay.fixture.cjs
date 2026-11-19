'use strict'
const fs = require('node:fs/promises')
const {constants} = require('node:fs')
const path = require('node:path')
const {createPublicKey, generateKeyPairSync} = require('node:crypto')
const {deepStrictEqual, equal, rejects} = require('node:assert/strict')
const {execFileSync, spawnSync} = require('node:child_process')
// Run against a clean committed checkout with the already-installed workspace dependencies.
const cwd = path.resolve(__dirname, '../../..')
const args = process.argv.slice(2)
if (args[0] !== '--out' || !args[1] || (args.length !== 2 && (args.length !== 3 || args[2] !== '--simulate-free-space'))) {
  throw Error('Usage: node batch-candidate-replay.fixture.cjs --out <fresh-directory> [--simulate-free-space]')
}
const lane = path.resolve(args[1]), out = path.join(lane, 'owned'), simulate = args[2] === '--simulate-free-space'
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
  const f = await rawBatchLifecycleFixture(lane, tools, {mixedTargets: true, mergedPull: true})
  const generated = path.join(f.tools, 'packages/chat-ui/dist')
  if (await fs.lstat(generated).then(() => true, () => false)) {
    await fs.rename(generated, path.join(lane, 'generated-chat-ui-dist'))
  }
  await fs.writeFile(path.join(lane, 'replay-fixture.json'), f.fixtureBytes)
  const {captureTrustedToolset, describeTrustedToolset} = load('adapters/updates/toolset.ts')
  const capture = await captureTrustedToolset({root: f.tools, commit: f.master, cwd: f.tools})
  const {prepareReplayGuidesBatchCandidate} = load('adapters/updates/batch-collection.ts')
  const result = await prepareReplayGuidesBatchCandidate({sourceRepository: f.upstream, zdocRepository: f.tools, out,
    capture, fixtureBytes: f.fixtureBytes, replayClockMs: f.replayClockMs})
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
  const {inspectSignedBatchCandidate, prepareQualifiedBatchCandidate} = load('adapters/updates/batch-candidate.ts')
  const options = {roots, evidence, transaction, baseline, bindingRef: candidate.binding, planRef: candidate.plan, proofRef: candidate.proof,
    sealRef: candidate.seal, sealOid: candidate.sealOid, publicKey: createPublicKey(candidate.publicKey),
    executableClosure: await evidence.writeBlob(capture.bytes), toolset: capture.material, budget() {}}
  const exact = await inspectSignedBatchCandidate(options)
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
    sourceArtifact: qualification.sourceArtifact, publicationArtifact: qualification.publicationArtifact, pins: binding.base.pins},
  qualification.scanStartMs + 37 * 3600_000, f.fixture.finalPass), /BATCH_FRESHNESS_EXPIRED/)
  const index = await value(binding.index.ref), closure = await value(binding.closure.ref)
  const root = await fs.open(out, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
  const blobs = await fs.open(path.join(out, 'blobs'), constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
  try {
    const identity = async fd => {
      const stat = await fd.stat({bigint: true})
      return {dev: String(stat.dev), ino: String(stat.ino)}
    }
    // The standalone graph probe reconstructs locator fields for the retained
    // evidence. It cannot recreate the original active process acknowledgements.
    const graphInput = canonicalBytes({kind: 'guides-batch-verify-control-v1', ...roots, receiptsRoot: index.receiptsRoot,
      qualifierRequestSha256: '0'.repeat(64), qualifierRequestBytes: 1, rootIdentity: await identity(root), blobsIdentity: await identity(blobs)})
    const verifyGraph = () => spawnSync('/usr/bin/python3', ['-I', '-S', '-B',
      path.join(f.tools, 'scripts/docs-workflow/shared-guides-update/prepare.py'), 'verify-batch-collection'], {
      input: graphInput, stdio: ['pipe', 'pipe', 'pipe', 'pipe', root.fd, blobs.fd], encoding: 'utf8',
    })
    const verified = verifyGraph()
    equal(verified.status, 0, verified.stderr)
    const leaves = [index.receiptsRoot.pages[0].receiptRef, index.receiptsRoot.pages[0].outputs[0].ref, closure.obligationRefs[0]]
    for (const ref of leaves) {
      const original = path.join(out, ref.path), held = path.join(lane, 'held-' + ref.sha256)
      await fs.rename(original, held)
      try {
        const failed = verifyGraph()
        equal(failed.status, 1, failed.stderr)
        equal(failed.output[3], '')
      } finally {await fs.rename(held, original)}
    }
  } finally {await blobs.close(); await root.close()}
  const scratchRefs = git(transaction.repository, 'for-each-ref').toString()
  const scratchObjects = git(transaction.repository, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname)').toString().trim().split('\n')
  equal(scratchObjects.includes(f.master) || scratchObjects.includes(f.sampledDev), false)
  equal(scratchObjects.includes(candidate.candidate) && scratchObjects.includes(candidate.sealOid), true)
  equal(git(transaction.repository, 'count-objects', '-v').toString().split('\n').includes('in-pack: 0'), true)
  deepStrictEqual(git(f.tools, 'rev-parse', 'refs/heads/master', 'refs/heads/dev').toString().trim().split('\n'), [f.master, f.sampledDev])
  equal(git(f.upstream, 'rev-parse', 'refs/heads/v3.0.x').toString().trim(), f.target)
  equal(scratchRefs, '')
  await write('independent.json', {code, exact, negatives: negatives.map(([name]) => name), expired: true, scratchObjects: scratchObjects.length, missingGraphLeavesRejected: 3, replayCannotGrantObserved: true})
  console.log(JSON.stringify({code, fixtureMaster: f.master, out, status: candidate.status, simulation: simulate}))
}
main().catch(error => {console.error(error); process.exitCode = 1})
