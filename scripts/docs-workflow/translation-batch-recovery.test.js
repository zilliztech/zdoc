'use strict'
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { parseArgs, recreateCandidate, recoverGuidesTranslation } = require('./recover-guides-translation')
const { deleteStagingWithLease, promoteStaging } = require('./translation-staging')

const SHA = character => character.repeat(40)
const REF = 'refs/heads/docs-translation-staging/guides/12-2-eeeeeeeeeeee'
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 'Recovery Test', GIT_AUTHOR_EMAIL: 'recovery@example.com', GIT_COMMITTER_NAME: 'Recovery Test', GIT_COMMITTER_EMAIL: 'recovery@example.com', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }

function git(repository, ...args) {
  return execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8', env: GIT_ENV }).trim()
}

function realGitFixture(prefix = 'guides-recovery-git-') {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)))
  const remote = path.join(root, 'origin.git')
  const seed = path.join(root, 'seed')
  const repository = path.join(root, 'repository')
  execFileSync('git', ['init', '--bare', remote], { env: GIT_ENV })
  execFileSync('git', ['init', seed], { env: GIT_ENV })
  fs.writeFileSync(path.join(seed, 'README.md'), 'base\n')
  git(seed, 'add', 'README.md')
  git(seed, 'commit', '-m', 'base')
  git(seed, 'branch', '-M', 'dev')
  git(seed, 'remote', 'add', 'origin', remote)
  git(seed, 'push', '-u', 'origin', 'dev')
  const expectedTargetSha = git(seed, 'rev-parse', 'HEAD')
  fs.writeFileSync(path.join(seed, 'translation.md'), 'candidate\n')
  git(seed, 'add', 'translation.md')
  git(seed, 'commit', '-m', 'translation candidate')
  const stagedSha = git(seed, 'rev-parse', 'HEAD')
  git(seed, 'push', 'origin', `${stagedSha}:${REF}`)
  execFileSync('git', ['clone', '--branch', 'dev', remote, repository], { env: GIT_ENV })
  const trustedRoot = fs.realpathSync(fs.mkdtempSync(path.join(root, 'trusted-')))
  fs.chmodSync(trustedRoot, 0o700)
  return { root, remote, seed, repository, trustedRoot, targetBranch: 'dev', runId: '12', runAttempt: '2', recoveryAttempt: '3', pendingSetSha256: 'e'.repeat(64), stagingRef: REF, stagedSha, expectedTargetSha, sourceCheckpointSha: expectedTargetSha, masterSha: expectedTargetSha, pairsManifest: 'none' }
}

let writerId = 0
function pushCommit(options, baseSha, ref, filename, contents) {
  const writer = path.join(options.root, `writer-${writerId += 1}`)
  execFileSync('git', ['clone', options.remote, writer], { env: GIT_ENV })
  git(writer, 'switch', '--detach', baseSha)
  fs.writeFileSync(path.join(writer, filename), contents)
  git(writer, 'add', filename)
  git(writer, 'commit', '-m', filename)
  const sha = git(writer, 'rev-parse', 'HEAD')
  git(writer, 'push', 'origin', `${sha}:${ref}`)
  return sha
}

function remoteRef(options, ref) {
  try { return git(options.remote, 'show-ref', '--verify', '--hash', ref) } catch { return null }
}

function writePrivateJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 })
  fs.chmodSync(file, 0o600)
}

function fixture() {
  const repository = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-recovery-repo-')))
  const trustedRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-recovery-root-')))
  fs.chmodSync(trustedRoot, 0o700)
  return { repository, trustedRoot, targetBranch: 'dev', runId: '12', runAttempt: '2', recoveryAttempt: '3', pendingSetSha256: 'e'.repeat(64), stagingRef: REF, stagedSha: SHA('d'), expectedTargetSha: SHA('c'), sourceCheckpointSha: SHA('b'), masterSha: SHA('a'), pairsManifest: 'none' }
}

function dependencies(options, overrides = {}) {
  const calls = []
  return { calls, values: {
    remoteRefSha(_repository, ref) { return ref === options.stagingRef ? options.stagedSha : options.expectedTargetSha },
    fetch(_repository, value) { calls.push(`fetch:${value}`) },
    head() { return options.masterSha },
    ancestor(_repository, parent, child) { return parent === options.expectedTargetSha && child === options.stagedSha },
    assertGuidesSourceAuthority() { calls.push('authority') },
    prepareValidationWorktree() { calls.push('prepare-validation'); return '/validation' },
    removeValidationWorktree() { calls.push('remove-validation') },
    restore() { calls.push('restore') },
    validate() { calls.push('validate') },
    promoteStaging() { calls.push('promote'); return { publishedSha: options.stagedSha } },
    deleteStagingWithLease() { calls.push('cleanup'); return { cleanupDebt: null } },
    ...overrides,
  } }
}

test('strict arguments reject missing, duplicate, and unknown recovery identity', () => {
  assert.throws(() => parseArgs([]), /exactly/)
  assert.throws(() => parseArgs(Array(24).fill('--repository')), /invalid|duplicated/)
})

test('recovery identity rejects ref collisions, unsafe manifest paths, target mismatch, and pending-set mismatch', async () => {
  const collision = fixture(); collision.recoveryAttempt = collision.runAttempt
  await assert.rejects(() => recoverGuidesTranslation(collision, dependencies(collision).values), /distinct staging ref/)
  const relative = fixture(); relative.pairsManifest = 'relative.json'
  await assert.rejects(() => recoverGuidesTranslation(relative, dependencies(relative).values), /pairs manifest/)

  const options = fixture(), file = path.join(options.trustedRoot, 'pairs.json')
  const manifest = { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: SHA('8'), pairs: [{ artifactDir: '/a', baselineDir: '/b' }] }
  writePrivateJson(file, manifest); options.pairsManifest = file; options.pairsManifestData = manifest; options.currentTargetSha = SHA('9')
  await assert.rejects(() => recreateCandidate(options, { planTranslationBatchSet() { throw new Error('must not plan') } }), /invalid or incomplete/)
  manifest.expectedTargetSha = options.expectedTargetSha; writePrivateJson(file, manifest)
  await assert.rejects(() => recreateCandidate(options, { async planTranslationBatchSet() { return { pendingSetSha256: 'f'.repeat(64) } } }), /pending-set identity mismatch/)
  await assert.rejects(() => recreateCandidate(options, { async planTranslationBatchSet() { return { pendingSetSha256: options.pendingSetSha256, masterSha: SHA('7') } } }), /master.*identity mismatch/)
})

test('candidate source authority is authenticated independently before validation or cleanup', async () => {
  const options = fixture(), deps = dependencies(options, {
    assertGuidesSourceAuthority({ expectedTargetSha }) {
      deps.calls.push(`authority:${expectedTargetSha}`)
      if (expectedTargetSha === options.stagedSha) throw new Error('candidate source authority drift')
    },
  })
  await assert.rejects(() => recoverGuidesTranslation(options, deps.values), /candidate source authority drift.*candidate retained/)
  assert.deepEqual(deps.calls.filter(call => call.startsWith('authority:')), [`authority:${options.expectedTargetSha}`, `authority:${options.stagedSha}`])
  assert.equal(deps.calls.includes('validate'), false)
  assert.equal(deps.calls.includes('promote'), false)
  assert.equal(deps.calls.includes('cleanup'), false)
})

test('recomposition removes and prunes its mutable worktree after the recovery ref is confirmed', async () => {
  const options = fixture(), file = path.join(options.trustedRoot, 'pairs.json')
  options.pairsManifest = file
  options.currentTargetSha = SHA('9')
  options.pairsManifestData = { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.expectedTargetSha, pairs: [{ artifactDir: '/a', baselineDir: '/b' }] }
  writePrivateJson(file, options.pairsManifestData)
  const calls = []
  const result = await recreateCandidate(options, {
    async planTranslationBatchSet() { return { pendingSetSha256: options.pendingSetSha256, masterSha: options.masterSha } },
    createInitialPublisherState() { return { status: 'planned' } },
    bindPublisherBatchIdentity() { return { status: 'planned' } },
    async applyPhase() { calls.push('apply'); return { status: 'staged', stagingSha: SHA('f') } },
    pushPhase() { calls.push('push'); return { stagingSha: SHA('f'), stagingRef: 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee' } },
    removeRecoveryWorktree() { calls.push('remove-prune') },
  })
  assert.equal(result.stagedSha, SHA('f'))
  assert.deepEqual(calls, ['apply', 'push', 'remove-prune'])
})

test('recomposition failure still removes its worktree and reports cleanup failure diagnostics', async () => {
  const options = fixture(), file = path.join(options.trustedRoot, 'pairs.json')
  options.pairsManifest = file
  options.currentTargetSha = SHA('9')
  options.pairsManifestData = { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.expectedTargetSha, pairs: [{ artifactDir: '/a', baselineDir: '/b' }] }
  writePrivateJson(file, options.pairsManifestData)
  const values = {
    async planTranslationBatchSet() { return { pendingSetSha256: options.pendingSetSha256, masterSha: options.masterSha } },
    createInitialPublisherState() { return { status: 'planned' } },
    bindPublisherBatchIdentity() { return { status: 'planned' } },
    async applyPhase() { throw new Error('composition exploded') },
    removeRecoveryWorktree() { throw new Error('registered worktree remained') },
  }
  await assert.rejects(() => recreateCandidate(options, values), /composition exploded.*cleanup.*registered worktree remained/)
})

test('post-push worktree cleanup failure reports the confirmed recovery ref alongside the original', async () => {
  const options = fixture(), file = path.join(options.trustedRoot, 'pairs.json')
  options.pairsManifest = file
  writePrivateJson(file, { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.expectedTargetSha, pairs: [{ artifactDir: '/a', baselineDir: '/b' }] })
  const recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    recreateCandidate(values) {
      return recreateCandidate(values, {
        async planTranslationBatchSet() { return { pendingSetSha256: options.pendingSetSha256, masterSha: options.masterSha } },
        createInitialPublisherState() { return { status: 'planned' } },
        bindPublisherBatchIdentity() { return { status: 'planned' } },
        async applyPhase() { return { status: 'staged', stagingSha: SHA('f') } },
        pushPhase() { return { stagingSha: SHA('f'), stagingRef: recoveryRef } },
        removeRecoveryWorktree() { throw new Error('post-push cleanup failed') },
      })
    },
  })
  await assert.rejects(() => recoverGuidesTranslation(options, deps.values), error => error.message.includes(REF) && error.message.includes(recoveryRef) && /post-push cleanup failed/.test(error.message))
})

test('pairs manifest is loaded once from the private trusted root before a pathname swap', async () => {
  const options = fixture(), file = path.join(options.trustedRoot, 'pairs.json'), parked = path.join(options.trustedRoot, 'pairs-original.json')
  const outside = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-recovery-outside-')), 'pairs.json')
  const safeManifest = { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.expectedTargetSha, pairs: [{ artifactDir: '/safe-artifact', baselineDir: '/safe-baseline' }] }
  writePrivateJson(file, safeManifest)
  writePrivateJson(outside, { ...safeManifest, pairs: [{ artifactDir: '/substituted-artifact', baselineDir: '/substituted-baseline' }] })
  options.pairsManifest = file
  let swapped = false
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    beforeRecreateCandidate() {
      fs.renameSync(file, parked)
      fs.symlinkSync(outside, file)
      swapped = true
    },
    recreateCandidate(values) {
      return recreateCandidate(values, {
        async planTranslationBatchSet({ pairs }) {
          assert.equal(pairs[0].artifactDir, '/safe-artifact')
          return { pendingSetSha256: options.pendingSetSha256, masterSha: options.masterSha }
        },
        async applyPhase() { return { status: 'no_changes' } },
        removeRecoveryWorktree() {},
      })
    },
  })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(swapped, true)
  assert.equal(result.status, 'no_changes')
})

test('pairs manifest must be a private owned file directly inside the trusted root', async () => {
  const options = fixture(), manifest = { schemaVersion: 1, group: 'guides', sourceCheckpointSha: options.sourceCheckpointSha, expectedTargetSha: options.expectedTargetSha, pairs: [{ artifactDir: '/a', baselineDir: '/b' }] }
  const outside = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-recovery-outside-')), 'pairs.json')
  writePrivateJson(outside, manifest)
  await assert.rejects(() => recoverGuidesTranslation({ ...options, pairsManifest: outside }, dependencies(options).values), /trusted root/)
  const publicFile = path.join(options.trustedRoot, 'pairs.json')
  fs.writeFileSync(publicFile, JSON.stringify(manifest), { mode: 0o644 })
  fs.chmodSync(publicFile, 0o644)
  await assert.rejects(() => recoverGuidesTranslation({ ...options, pairsManifest: publicFile }, dependencies(options).values), /private|0600/)
})

test('default Git fetch and validation worktree paths operate against a local bare remote', async () => {
  const options = realGitFixture()
  const result = await recoverGuidesTranslation(options, {
    assertGuidesSourceAuthority() {},
    restore() {},
    validate() {},
  })
  assert.equal(result.status, 'published')
  assert.equal(git(options.remote, 'rev-parse', 'refs/heads/dev'), options.stagedSha)
  assert.equal(remoteRef(options, options.stagingRef), null)
  assert.equal(fs.existsSync(path.join(options.trustedRoot, 'recovery-validation-worktree')), false)
})

test('real validation failure leaves target unchanged and retained staging ref exact', async () => {
  const options = realGitFixture()
  await assert.rejects(() => recoverGuidesTranslation(options, {
    assertGuidesSourceAuthority() {},
    restore() {},
    validate() { throw new Error('real validation failure') },
  }), /real validation failure.*candidate retained/)
  assert.equal(remoteRef(options, 'refs/heads/dev'), options.expectedTargetSha)
  assert.equal(remoteRef(options, options.stagingRef), options.stagedSha)
  assert.equal(fs.existsSync(path.join(options.trustedRoot, 'recovery-validation-worktree')), false)
})

test('real target advance promotes a recreated candidate descending from the current target and cleans both refs', async () => {
  const options = realGitFixture()
  const currentTargetSha = pushCommit(options, options.expectedTargetSha, 'refs/heads/dev', 'advance.md', 'advance\n')
  const recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  const recoverySha = pushCommit(options, currentTargetSha, recoveryRef, 'recreated.md', 'recreated\n')
  const result = await recoverGuidesTranslation(options, {
    assertGuidesSourceAuthority() {},
    async recreateCandidate(values) {
      assert.equal(values.currentTargetSha, currentTargetSha)
      git(values.repository, 'fetch', 'origin', recoveryRef)
      return { noChanges: false, stagingRef: recoveryRef, stagedSha: recoverySha }
    },
    restore() {},
    validate() {},
  })
  assert.equal(result.status, 'published')
  assert.equal(remoteRef(options, 'refs/heads/dev'), recoverySha)
  assert.equal(remoteRef(options, options.stagingRef), null)
  assert.equal(remoteRef(options, recoveryRef), null)
})

test('real promotion race retains the exact candidate and does not overwrite the concurrent target', async () => {
  const options = realGitFixture()
  let racedSha = null
  await assert.rejects(() => recoverGuidesTranslation(options, {
    assertGuidesSourceAuthority() {},
    restore() {},
    validate() {},
    promoteStaging(values) {
      racedSha = pushCommit(options, options.expectedTargetSha, 'refs/heads/dev', 'race.md', 'race\n')
      return promoteStaging(values)
    },
  }), /target.*moved|promotion|push failed/i)
  assert.equal(remoteRef(options, 'refs/heads/dev'), racedSha)
  assert.equal(remoteRef(options, options.stagingRef), options.stagedSha)
})

test('real cleanup lease race reports debt after publication and preserves the replaced ref', async () => {
  const options = realGitFixture()
  const laterSha = pushCommit(options, options.stagedSha, 'refs/heads/later-candidate', 'later.md', 'later\n')
  const result = await recoverGuidesTranslation(options, {
    assertGuidesSourceAuthority() {},
    restore() {},
    validate() {},
    deleteStagingWithLease(values) {
      git(options.remote, 'update-ref', values.stagingRef, laterSha)
      return deleteStagingWithLease(values)
    },
  })
  assert.equal(result.status, 'published')
  assert.equal(result.cleanupDebt.kind, 'lease_mismatch')
  assert.equal(remoteRef(options, 'refs/heads/dev'), options.stagedSha)
  assert.equal(remoteRef(options, options.stagingRef), laterSha)
})

test('real recovery tolerates shell metacharacters in paths and ignores hostile Git environment overrides', async () => {
  const options = realGitFixture('guides recovery ; hostile -')
  const saved = { count: process.env.GIT_CONFIG_COUNT, key: process.env.GIT_CONFIG_KEY_0, value: process.env.GIT_CONFIG_VALUE_0 }
  process.env.GIT_CONFIG_COUNT = '1'
  process.env.GIT_CONFIG_KEY_0 = `url.${path.join(options.root, 'missing.git')}.insteadOf`
  process.env.GIT_CONFIG_VALUE_0 = options.remote
  try {
    const result = await recoverGuidesTranslation(options, { assertGuidesSourceAuthority() {}, restore() {}, validate() {} })
    assert.equal(result.status, 'published')
  } finally {
    for (const [key, value] of [['GIT_CONFIG_COUNT', saved.count], ['GIT_CONFIG_KEY_0', saved.key], ['GIT_CONFIG_VALUE_0', saved.value]]) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('repository, trusted root, and pairs manifest reject symlinks or non-private identity', async () => {
  const options = fixture()
  fs.chmodSync(options.trustedRoot, 0o755)
  await assert.rejects(() => recoverGuidesTranslation(options, dependencies(options).values), /private 0700/)

  const linkedRoot = `${options.trustedRoot}-link`
  fs.symlinkSync(options.trustedRoot, linkedRoot)
  fs.chmodSync(options.trustedRoot, 0o700)
  await assert.rejects(() => recoverGuidesTranslation({ ...options, trustedRoot: linkedRoot }, dependencies(options).values), /real owned private 0700/)

  const manifest = path.join(options.trustedRoot, 'pairs.json')
  const linkedManifest = path.join(options.trustedRoot, 'pairs-link.json')
  fs.writeFileSync(manifest, '{}')
  fs.symlinkSync(manifest, linkedManifest)
  await assert.rejects(() => recoverGuidesTranslation({ ...options, pairsManifest: linkedManifest }, dependencies(options).values), /pairs manifest/)
})

test('exact retained candidate is validated before normal promotion and leased cleanup', async () => {
  const options = fixture(), deps = dependencies(options)
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.status, 'published')
  assert.deepEqual(deps.calls.slice(-7), ['authority', 'prepare-validation', 'restore', 'validate', 'remove-validation', 'promote', 'cleanup'])
})

test('missing, ambiguous, or replaced retained refs reject with bounded recovery guidance', async () => {
  for (const remote of [null, SHA('e')]) {
    const options = fixture(), deps = dependencies(options, { remoteRefSha() { if (remote === null) throw new Error('missing ref'); return remote } })
    await assert.rejects(() => recoverGuidesTranslation(options, deps.values), error => /candidate retained/.test(error.message) && error.message.length < 700)
  }
})

test('validation failure retains ref and never promotes or cleans it', async () => {
  const options = fixture(), deps = dependencies(options, { validate() { deps.calls.push('validate'); throw new Error('gate failed') } })
  await assert.rejects(() => recoverGuidesTranslation(options, deps.values), /candidate retained/)
  assert.deepEqual(deps.calls.slice(-5), ['authority', 'prepare-validation', 'restore', 'validate', 'remove-validation'])
  assert.equal(deps.calls.includes('promote'), false)
})

test('target movement and source authority drift never promote stale staging', async () => {
  for (const override of [
    { remoteRefSha(_repository, ref) { return ref === REF ? SHA('d') : SHA('9') } },
    { assertGuidesSourceAuthority() { throw new Error('source authority drift') } },
  ]) {
    const options = fixture(), deps = dependencies(options, override)
    await assert.rejects(() => recoverGuidesTranslation(options, deps.values), /candidate retained/)
    assert.equal(deps.calls.includes('promote'), false)
  }
})

test('target movement can recompose complete pairs onto a distinct recovery ref without promoting the old ref', async () => {
  const options = fixture()
  const recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  let promoted
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    async recreateCandidate() { deps.calls.push('recreate'); return { noChanges: false, stagingRef: recoveryRef, stagedSha: SHA('f') } },
    promoteStaging(values) { promoted = values; deps.calls.push('promote'); return { publishedSha: values.stagedSha } },
  })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.stagingRef, recoveryRef)
  assert.equal(promoted.expectedTargetSha, SHA('9'))
  assert.equal(promoted.stagedSha, SHA('f'))
})

test('recreated publication reports cleanup debt for both exact retained refs', async () => {
  const options = fixture(), recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    async recreateCandidate() { return { noChanges: false, stagingRef: recoveryRef, stagedSha: SHA('f') } },
    deleteStagingWithLease({ stagingRef }) { return { cleanupDebt: { kind: 'lease_mismatch', stagingRef } } },
  })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.status, 'published')
  assert.equal(result.cleanupDebt.kind, 'multiple_cleanup_debts')
  assert.deepEqual(result.cleanupDebt.debts.map(item => item.stagingRef), [recoveryRef, REF])
  assert.deepEqual(result.cleanupDebt.debts.map(item => item.cleanupDebt.kind), ['lease_mismatch', 'lease_mismatch'])
})

test('recreated validation failure reports both retained candidate refs', async () => {
  const options = fixture(), recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    async recreateCandidate() { return { noChanges: false, stagingRef: recoveryRef, stagedSha: SHA('f') } },
    validate() { throw new Error('recreated gate failed') },
  })
  await assert.rejects(() => recoverGuidesTranslation(options, deps.values), error => error.message.includes(REF) && error.message.includes(recoveryRef) && /recreated gate failed/.test(error.message))
})

test('recreated promotion race reports both retained candidate refs', async () => {
  const options = fixture(), recoveryRef = 'refs/heads/docs-translation-staging/guides/12-3-eeeeeeeeeeee'
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    async recreateCandidate() { return { noChanges: false, stagingRef: recoveryRef, stagedSha: SHA('f') } },
    promoteStaging() { throw new Error('recreated promotion race') },
  })
  await assert.rejects(() => recoverGuidesTranslation(options, deps.values), error => error.message.includes(REF) && error.message.includes(recoveryRef) && /recreated promotion race/.test(error.message))
})

test('target movement with all-idempotent recomposition reports no_changes without promotion', async () => {
  const options = fixture(), deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : SHA('9') },
    async recreateCandidate() { return { noChanges: true, stagingRef: null, stagedSha: SHA('9') } },
  })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.status, 'no_changes')
  assert.equal(deps.calls.includes('promote'), false)
})

test('promotion race retains candidate while cleanup debt is nonfatal after confirmed publication', async () => {
  const raceOptions = fixture(), race = dependencies(raceOptions, { promoteStaging() { throw new Error('target moved during promotion') } })
  await assert.rejects(() => recoverGuidesTranslation(raceOptions, race.values), /candidate retained/)
  const debtOptions = fixture(), debt = dependencies(debtOptions, { deleteStagingWithLease() { return { cleanupDebt: { kind: 'lease_mismatch' } } } })
  const result = await recoverGuidesTranslation(debtOptions, debt.values)
  assert.equal(result.status, 'published')
  assert.deepEqual(result.cleanupDebt, { kind: 'lease_mismatch' })
  const throwOptions = fixture(), throwing = dependencies(throwOptions, { deleteStagingWithLease() { throw new Error('network down') } })
  const thrownCleanup = await recoverGuidesTranslation(throwOptions, throwing.values)
  assert.equal(thrownCleanup.status, 'published')
  assert.equal(thrownCleanup.cleanupDebt.kind, 'cleanup_failed')
})

test('already-published exact staged SHA is reconciled without a second promotion', async () => {
  const options = fixture(), deps = dependencies(options, { remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : options.stagedSha } })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.status, 'published')
  assert.equal(deps.calls.includes('promote'), false)
  assert.equal(deps.calls.includes('cleanup'), true)
})

test('target descendant containing staged SHA is authenticated then reconciled without rewrite', async () => {
  const options = fixture(), descendant = SHA('9')
  const deps = dependencies(options, {
    remoteRefSha(_repository, ref) { return ref === REF ? options.stagedSha : descendant },
    ancestor(_repository, parent, child) { return parent === options.stagedSha && child === descendant },
  })
  const result = await recoverGuidesTranslation(options, deps.values)
  assert.equal(result.status, 'published')
  assert.equal(result.publishedSha, descendant)
  assert.equal(deps.calls.includes('authority'), true)
  assert.equal(deps.calls.includes('promote'), false)
})
