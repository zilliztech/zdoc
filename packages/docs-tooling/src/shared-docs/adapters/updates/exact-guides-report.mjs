// Standalone reader for a trusted workflow. All Git and proof bytes arrive as data on stdin.
import { createHash } from 'node:crypto'

const maxBlobBytes = 1024 * 1024
const maxInputBytes = 5 * maxBlobBytes

function requireFact(value, code) {
  if (!value) throw new Error(code)
}

function decodeBytes(value, maxBytes) {
  requireFact(typeof value === 'string' && value.length <= 4 * Math.ceil(maxBytes / 3), 'BYTE_INPUT_LIMIT')
  const bytes = Buffer.from(value, 'base64')
  requireFact(bytes.length > 0 && bytes.length <= maxBytes && bytes.toString('base64') === value, 'INVALID_BASE64')
  return bytes
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function gitBlobOid(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

function validOid(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value)
}

function positiveId(value) {
  return Number.isSafeInteger(value) && value > 0
}

function matchesBlob(ref, bytes) {
  const hash = sha256(bytes)
  return ref?.path === 'blobs/' + hash && ref.sha256 === hash && ref.bytes === bytes.length
}

function report({ target, observed, source, proofBase64, beforeBase64, afterBase64, rawDiffBase64 }) {
  const { repositoryId, prNumber, pageId, base, head } = target
  requireFact(positiveId(repositoryId) && positiveId(prNumber) && typeof pageId === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId), 'INVALID_TARGET')
  requireFact(validOid(base) && validOid(head) && head !== base &&
    observed.repositoryId === repositoryId && observed.prNumber === prNumber &&
    observed.base === base && observed.head === head, 'PR_TARGET_CHANGED')
  requireFact(Array.isArray(observed.parents) && observed.parents.length === 1 &&
    observed.parents[0] === base, 'HEAD_PARENT_CHANGED')

  // The trusted caller obtains the proof digest from the authenticated producer,
  // independently of the Git objects and lock bytes supplied by the candidate.
  const proofBytes = decodeBytes(proofBase64, maxBlobBytes)
  requireFact(sha256(proofBytes) === source.proofSha256, 'PROOF_DIGEST_MISMATCH')
  const proof = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(proofBytes))
  requireFact(validOid(source.master) && validOid(source.candidate) && proof.prepared?.kind === 'new' &&
    proof.prepared.master === source.master && proof.prepared.base === source.master &&
    proof.candidate === source.candidate && Array.isArray(proof.preservedHumanHeads) &&
    proof.preservedHumanHeads.length === 0, 'SOURCE_CANDIDATE_MISMATCH')
  requireFact(Array.isArray(proof.nextEdits) && proof.nextEdits.length === 1, 'EXPECTED_SINGLE_GUIDES_EDIT')
  const [edit] = proof.nextEdits
  const path = `shared-docs/guides/pages/${pageId}/lock.yaml`
  requireFact(edit.subject?.kind === 'guides-page' && edit.subject.group === 'guides' &&
    edit.subject.pageId === pageId && edit.before?.path === path, 'GUIDES_SUBJECT_MISMATCH')
  const { current, next: oldNext } = edit.before
  requireFact(validOid(current) && validOid(oldNext) && validOid(edit.target) &&
    edit.target !== oldNext, 'INVALID_LOCK_ADVANCE')

  // The producer already verified the YAML edit. Bind both exact blobs to that proof
  // without interpreting candidate YAML or executing a candidate checkout.
  const before = decodeBytes(beforeBase64, maxBlobBytes)
  const after = decodeBytes(afterBase64, maxBlobBytes)
  const rawDiff = decodeBytes(rawDiffBase64, 4096)
  requireFact(sha256(before) === edit.before.sha256 && matchesBlob(edit.afterBlob, after), 'LOCK_BYTES_MISMATCH')
  requireFact(matchesBlob(proof.patch, rawDiff), 'RAW_DIFF_PROOF_MISMATCH')

  // Compare the entire, unfiltered NUL-delimited Git diff. Any extra entry,
  // including a second file, different mode or path, changes these bytes.
  const beforeOid = gitBlobOid(before)
  const afterOid = gitBlobOid(after)
  requireFact(beforeOid !== afterOid && ['100644', '100755'].some(mode =>
    rawDiff.equals(Buffer.from(`:${mode} ${mode} ${beforeOid} ${afterOid} M\0${path}\0`))), 'UNEXPECTED_GIT_DIFF')

  return {
    kind: 'shared-update-draft-head-report', schemaVersion: 1, status: 'verified', scope: 'single-guides-lock',
    repositoryId, prNumber, pageId, base, head, sourceMaster: source.master, sourceCandidate: source.candidate,
    proofSha256: source.proofSha256, path, current, oldNext, next: edit.target,
    beforeSha256: edit.before.sha256, afterSha256: edit.afterBlob.sha256, rawDiffSha256: proof.patch.sha256,
  }
}

async function readInput() {
  const chunks = []
  let size = 0
  for await (const chunk of process.stdin) {
    size += chunk.length
    requireFact(size <= maxInputBytes, 'INPUT_LIMIT')
    chunks.push(chunk)
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)))
}

try {
  process.stdout.write(JSON.stringify(report(await readInput())) + '\n')
} catch (error) {
  const code = error instanceof Error && /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'INVALID_REPORT_INPUT'
  process.stderr.write(code + '\n')
  process.exitCode = 1
}
