// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

const reader = resolve('packages/docs-tooling/src/shared-docs/adapters/updates/exact-guides-report.mjs')
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const blob = (bytes: Buffer) => ({ path: 'blobs/' + hash(bytes), sha256: hash(bytes), bytes: bytes.length })

function fixture() {
  const pageId = 'json-field-overview'
  const path = `shared-docs/guides/pages/${pageId}/lock.yaml`
  const current = '1'.repeat(40), oldNext = '2'.repeat(40), next = '3'.repeat(40)
  const base = '4'.repeat(40), head = '5'.repeat(40), master = '6'.repeat(40), candidate = '7'.repeat(40)
  const before = Buffer.from(`schema_version: 1\ncurrent: ${current}\nnext: '${oldNext}'\n`)
  const after = Buffer.from(before.toString().replace(oldNext, next))
  const raw = Buffer.from(`:100644 100644 ${gitBlob(before)} ${gitBlob(after)} M\0${path}\0`)
  const proof = { candidate, prepared: { kind: 'new', base: master, master }, preservedHumanHeads: [],
    nextEdits: [{ before: { current, next: oldNext, path, sha256: hash(before) },
      afterBlob: blob(after), subject: { group: 'guides', kind: 'guides-page', pageId }, target: next }], patch: blob(raw) }
  const proofBytes = Buffer.from(JSON.stringify(proof))
  return {
    target: { repositoryId: 1, prNumber: 7, pageId, base, head },
    observed: { repositoryId: 1, prNumber: 7, base, head, parents: [base] },
    source: { master, candidate, proofSha256: hash(proofBytes) }, proofBase64: proofBytes.toString('base64'),
    beforeBase64: before.toString('base64'), afterBase64: after.toString('base64'), rawDiffBase64: raw.toString('base64'),
  }
}
type Input = ReturnType<typeof fixture>
function run(input: Input) {
  return spawnSync(process.execPath, [reader], { input: JSON.stringify(input), encoding: 'utf8' })
}

it('binds the exact unsealed head, proof, blobs and complete Git diff to a single-page report', () => {
  const input = fixture()
  const result = run(input)
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout)).toMatchObject({
    kind: 'shared-update-draft-head-report', scope: 'single-guides-lock', status: 'verified',
    head: input.target.head, base: input.target.base, sourceCandidate: input.source.candidate,
    path: 'shared-docs/guides/pages/json-field-overview/lock.yaml', proofSha256: input.source.proofSha256,
    next: '3'.repeat(40), oldNext: '2'.repeat(40), current: '1'.repeat(40),
  })
})

const changedObservations: [string, (input: Input) => void][] = [
  ['wrong repository', input => { input.observed.repositoryId++ }],
  ['wrong PR', input => { input.observed.prNumber++ }],
  ['moved head', input => { input.observed.head = input.source.candidate }],
  ['moved base', input => { input.observed.base = input.source.master }],
  ['extra parent', input => { input.observed.parents.push(input.source.master) }],
  ['different source candidate', input => { input.source.candidate = input.target.head }],
  ['forged proof', input => { input.proofBase64 = Buffer.from('{}').toString('base64') }],
  ['wrong page', input => { input.target.pageId = 'a-different-page' }],
  ['different lock bytes', input => { input.afterBase64 = input.beforeBase64 }],
  ['noncanonical base64', input => { input.afterBase64 += '\n' }],
]
it.each(changedObservations)('rejects %s without emitting a success report', (_, change) => {
  const input = fixture()
  change(input)
  const result = run(input)
  expect(result.status).toBe(1)
  expect(result.stdout).toBe('')
})

it.each(['second file', 'mode change', 'wrong Git blob'])('rejects %s even if the proof binds the raw diff', kind => {
  const input = fixture()
  const raw = Buffer.from(input.rawDiffBase64, 'base64')
  const actual = kind === 'second file' ? Buffer.concat([raw, raw]) :
    Buffer.from(raw.toString().replace(kind === 'mode change' ? '100644' : gitBlob(Buffer.from(input.beforeBase64, 'base64')),
      kind === 'mode change' ? '120000' : input.target.base))
  const proof = JSON.parse(Buffer.from(input.proofBase64, 'base64').toString())
  proof.patch = blob(actual)
  const forged = Buffer.from(JSON.stringify(proof))
  input.rawDiffBase64 = actual.toString('base64')
  input.proofBase64 = forged.toString('base64')
  input.source.proofSha256 = hash(forged)
  const result = run(input)
  expect(result.status).toBe(1)
  expect(result.stderr.trim()).toBe('UNEXPECTED_GIT_DIFF')
  expect(result.stdout).toBe('')
})
