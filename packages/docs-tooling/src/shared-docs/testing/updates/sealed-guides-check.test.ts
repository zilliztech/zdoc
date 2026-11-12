// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

const reader = resolve('packages/docs-tooling/src/shared-docs/adapters/updates/sealed-guides-check.mjs')
const b64 = (s: string) => Buffer.from(s).toString('base64')
const sum = (algorithm: string, s: string) => createHash(algorithm).update(s).digest('hex')
function fixture() {
  const base = '1'.repeat(40), candidate = '2'.repeat(40), tree = '3'.repeat(40)
  const report = JSON.stringify({
    schemaVersion: 1, scope: 'private-unsealed-draft-head', mode: 'report-only', sealed: false, targetCheckPublished: false,
    verification: { kind: 'shared-update-draft-head-report', schemaVersion: 1, status: 'verified', scope: 'single-guides-lock',
      repositoryId: 11, prNumber: 1, base, head: candidate, proofSha256: '4'.repeat(64) },
  })
  const reportSha256 = sum('sha256', report), message = 'Qualification of ' + reportSha256
  const headers = ['tree ' + tree, 'parent ' + candidate, 'author Bot <bot@localhost> 1 +0000', 'committer Hub <hub@localhost> 1 +0000']
  const signature = '-----BEGIN PGP SIGNATURE-----\n\nfixture\n-----END PGP SIGNATURE-----'
  const signed = [...headers, ...signature.split('\n').map((s, i) => (i ? ' ' : 'gpgsig ') + s)].join('\n') + '\n\n' + message
  const seal = sum('sha1', `commit ${Buffer.byteLength(signed)}\0` + signed)
  const check = { id: 51, check_suite: { id: 61 }, app: { id: 41 }, name: 'Check the signed lock update', head_sha: seal,
    external_id: 'producer-7-validator-8-' + seal, details_url: 'https://github.com/test/example/actions/runs/8', status: 'completed', conclusion: 'success' }
  return { mode: 'check', expected: { repositoryId: 11, prNumber: 1, base, candidate, candidateTree: tree, seal, message,
    writerActorId: 21, platformSignerActorId: 31, reportSha256 }, observed: { repositoryId: 11, prNumber: 1, base, head: seal, stagingHead: seal },
  reportBase64: b64(report), rawCommitBase64: b64(signed), signature: { oid: seal, parents: [candidate], tree,
    signatureValid: true, signatureState: 'VALID', wasSignedByGitHub: true, authorActorId: 21, signerActorId: 31,
    payload: headers.join('\n') + '\n\n' + message, signature: signature + '\n' },
  expectedCheck: { id: check.id, suiteId: check.check_suite.id, appId: check.app.id, name: check.name,
    externalId: check.external_id, detailsUrl: check.details_url }, check, suite: { id: 61, head_sha: seal, app: { id: 41 } } }
}

function run(f: ReturnType<typeof fixture>) {
  return spawnSync(process.execPath, [reader], { input: JSON.stringify(f), encoding: 'utf8' })
}

it.each(['stage', 'seal', 'reserved', 'check'])('binds the signed object and the observed target in %s mode', mode => {
  const f = fixture()
  f.mode = mode
  if (mode === 'stage') f.observed.head = f.expected.candidate
  if (mode === 'reserved') Object.assign(f.check, { status: 'in_progress', conclusion: null })
  const result = run(f)
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout)).toMatchObject({ mode, seal: f.expected.seal, candidate: f.expected.candidate, status: 'verified' })
  if (mode === 'reserved' || mode === 'check')
    expect(JSON.parse(result.stdout).check).toMatchObject({ id: f.check.id, suiteId: f.suite.id, head: f.expected.seal, conclusion: f.check.conclusion })
  else expect(JSON.parse(result.stdout)).not.toHaveProperty('check')
})

const other = '9'.repeat(40)
const negatives: [string, (f: ReturnType<typeof fixture>) => void][] = [
  ['different repository', f => { f.observed.repositoryId++ }],
  ['stale PR head', f => { f.observed.head = other }],
  ['different PR base', f => { f.observed.base = other }],
  ['unexpected staging tip', f => { f.mode = 'stage'; f.observed.head = f.expected.candidate; f.observed.stagingHead = other }],
  ['copied report', f => { f.reportBase64 = b64('{}') }],
  ['other report head with matching report digest', f => {
    const report = JSON.parse(Buffer.from(f.reportBase64, 'base64').toString())
    report.verification.head = other
    const bytes = JSON.stringify(report)
    f.reportBase64 = b64(bytes)
    f.expected.reportSha256 = sum('sha256', bytes)
  }],
  ['unverified signature', f => { f.signature.signatureValid = false }],
  ['other signer', f => { f.signature.signerActorId++ }],
  ['other author', f => { f.signature.authorActorId++ }],
  ['different signature bytes', f => { f.signature.signature += 'replacement' }],
  ['different signed payload', f => { f.signature.payload += '\n' }],
  ['other parent', f => { f.signature.parents = [other] }],
  ['different raw tree with agreed API facts', f => { f.signature.tree = f.expected.candidateTree = other }],
  ['different intent message', f => { f.expected.message += '\n' }],
  ['different object bytes', f => { f.rawCommitBase64 = b64(Buffer.from(f.rawCommitBase64, 'base64').toString() + '\n') }],
  ['check from another commit', f => { f.check.head_sha = f.expected.candidate }],
  ['copied name and old ID', f => { f.check.id++ }],
  ['other check application', f => { f.check.app.id++ }],
  ['different request', f => { f.check.external_id += '-other' }],
  ['other validator URL', f => { f.check.details_url += '1' }],
  ['a suite from the workflow checkout', f => { f.suite.head_sha = other }],
  ['wrong suite ID', f => { f.check.check_suite.id++ }],
  ['wrong suite app', f => { f.suite.app.id++ }],
  ['successful check where reservation expected', f => { f.mode = 'reserved' }],
  ['pending target', f => { f.check.status = 'in_progress' }],
  ['failed target', f => { f.check.conclusion = 'failure' }],
]
it.each(negatives)('rejects %s without emitting a successful report', (_name, mutation) => {
  const f = fixture()
  mutation(f)
  const r = run(f)
  expect(r.status).toBe(1)
  expect(r.stdout).toBe('')
})
