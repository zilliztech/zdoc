// Isolated replay writer. The destination is an owned local bare repository,
// and Draft creation goes through a stateful local fake. There is no hosted transport.
import { execFileSync } from 'node:child_process'
import { createHash, sign, verify } from 'node:crypto'
import { appendFileSync, closeSync, constants, fstatSync, lstatSync, mkdirSync, openSync, realpathSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const MAX_BYTES = 2 * 1024 * 1024
const MAX_MEMBERS = 64
const REF_PREFIX = 'refs/heads/automation/wp12-guides-batch-'
const oid = value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value)
const sum = bytes => createHash('sha256').update(bytes).digest('hex')
const stable = value => Buffer.from(JSON.stringify(value))
const domain = Buffer.from('zdoc:isolated-guides-batch-transport:v1\0')

function need(condition, reason) {
  if (!condition) throw Error(reason)
}

function objectRecord(type, gitOid, raw) {
  const bytes = Buffer.from(raw)
  const computed = createHash('sha1').update(type + ' ' + bytes.length + '\0').update(bytes).digest('hex')
  need(['blob', 'tree', 'commit'].includes(type) && oid(gitOid) && computed === gitOid, 'BATCH_TRANSPORT_OBJECT')
  return { type, oid: gitOid, base64: bytes.toString('base64') }
}

function payloadFor(evidence) {
  const { binding, plan, proof, index, qualification, candidate, seal, sealKeySha256, ...rest } = evidence.identity
  need(Object.keys(rest).length === 0 && [candidate, seal].every(oid) && /^[0-9a-f]{64}$/.test(sealKeySha256), 'BATCH_TRANSPORT_IDENTITY')
  need(evidence.documents.length + evidence.objects.length <= MAX_MEMBERS, 'BATCH_TRANSPORT_LIMIT')
  const documents = evidence.documents.map(({ ref, bytes }) => {
    const raw = Buffer.from(bytes)
    need(ref.path === 'blobs/' + ref.sha256 && raw.length === ref.bytes && sum(raw) === ref.sha256, 'BATCH_TRANSPORT_DOCUMENT')
    return { ref, base64: raw.toString('base64') }
  })
  need([binding, plan, proof, index, qualification].every((ref, i) => stable(ref).equals(stable(documents[i]?.ref ?? null))) &&
    new Set(documents.map(d => d.ref.sha256)).size === documents.length, 'BATCH_TRANSPORT_INVENTORY')
  const objects = evidence.objects.map(object => objectRecord(object.type, object.oid, object.bytes))
  need(objects.length >= 2 && new Set(objects.map(o => o.oid)).size === objects.length &&
    objects.at(-2).oid === candidate && objects.at(-2).type === 'commit' &&
    objects.at(-1).oid === seal && objects.at(-1).type === 'commit', 'BATCH_TRANSPORT_INVENTORY')
  return { kind: 'isolated-guides-batch-transport-v1', binding, plan, proof, index, qualification, candidate, seal, sealKeySha256, documents, objects }
}

export function sealIsolatedBatchTransport(evidence, privateKey) {
  const payload = payloadFor(evidence)
  const bytes = stable(payload)
  need(privateKey.type === 'private' && privateKey.asymmetricKeyType === 'ed25519' && bytes.length <= MAX_BYTES, 'BATCH_TRANSPORT_LIMIT')
  const signature = sign(null, Buffer.concat([domain, bytes]), privateKey).toString('base64')
  const archive = stable({ payload, signature })
  need(archive.length <= MAX_BYTES, 'BATCH_TRANSPORT_LIMIT')
  return archive
}

async function openTransport(archive, publicKey, verifyEvidence) {
  need(Buffer.isBuffer(archive) && archive.length <= MAX_BYTES, 'BATCH_TRANSPORT_LIMIT')
  const wire = Buffer.from(archive)
  let envelope
  try { envelope = JSON.parse(wire) } catch { throw Error('BATCH_TRANSPORT_FORMAT') }
  need(envelope && typeof envelope.payload === 'object' && envelope.payload !== null &&
    typeof envelope.signature === 'string' && Object.keys(envelope).length === 2 && stable(envelope).equals(wire), 'BATCH_TRANSPORT_FORMAT')
  const { payload, signature } = envelope
  const bytes = stable(payload), decoded = Buffer.from(signature, 'base64')
  need(publicKey.type === 'public' && publicKey.asymmetricKeyType === 'ed25519' &&
    decoded.length === 64 && decoded.toString('base64') === signature &&
    verify(null, Buffer.concat([domain, bytes]), publicKey, decoded), 'BATCH_TRANSPORT_SIGNATURE')
  // Signature verifies the transport. Re-derive these exact bytes from the
  // retained, independently authenticated batch, including all no-op subjects.
  const evidence = await verifyEvidence()
  const expected = payloadFor(evidence)
  need(bytes.equals(stable(expected)), 'BATCH_TRANSPORT_EVIDENCE')
  return { evidence, objects: expected.objects, archiveSha256: sum(wire) }
}

const destinationTokens = new WeakMap()
const gitEnvironment = { PATH: '/usr/bin:/bin', LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_LAZY_FETCH: '1', GIT_ALLOW_PROTOCOL: 'file' }
const sameFile = (first, second) => first.ino === second.ino && first.dev === second.dev

function runGit(args, input) {
  return execFileSync('/usr/bin/git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    input, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: MAX_BYTES, timeout: 20_000, env: gitEnvironment,
  }).toString().trim()
}

export function initializeIsolatedBatchDraft(parent, baseline) {
  const parentStat = lstatSync(parent)
  need(realpathSync(parent) === parent && realpathSync(baseline) === baseline && parentStat.isDirectory() &&
    parentStat.uid === process.getuid() && (parentStat.mode & 0o777) === 0o700 && baseline === join(parent, 'tools'),
  'BATCH_DRAFT_DESTINATION')
  const root = join(parent, 'draft-destination')
  const repository = join(root, 'isolated-draft.git')
  mkdirSync(root, { mode: 0o700 })
  runGit(['-C', root, 'clone', '--bare', '--quiet', '--local', baseline, repository])
  const git = (args, input) => runGit(['--git-dir', repository, ...args], input)
  git(['remote', 'remove', 'origin'])
  const initialRoot = lstatSync(root), initialRepo = lstatSync(repository)
  const checkOwned = () => {
    need(sameFile(initialRoot, lstatSync(root)) && sameFile(initialRepo, lstatSync(repository)) &&
      realpathSync(root) === root && realpathSync(repository) === repository && git(['rev-parse', '--is-bare-repository']) === 'true' &&
      git(['remote']) === '' && git(['for-each-ref', 'refs/replace']) === '', 'BATCH_DRAFT_DESTINATION')
  }
  checkOwned()
  const destination = Object.freeze({ root, repository })
  destinationTokens.set(destination, { git, checkOwned })
  return destination
}

export async function createIsolatedBatchDraft({ destination, archive, publicKey, verifyEvidence, verifyFresh, api }) {
  const local = destinationTokens.get(destination)
  need(local, 'BATCH_DRAFT_DESTINATION')
  const { git, checkOwned } = local
  const { root } = destination
  checkOwned()
  let fresh, expected, branch, objects, archiveSha256, expectedDev
  try {
    const opened = await openTransport(archive, publicKey, verifyEvidence)
    const { identity, pins, subjectIds, changedIds } = opened.evidence
    archiveSha256 = opened.archiveSha256
    objects = opened.objects
    const { master, dev, source } = pins
    expectedDev = dev
    need([master, dev, source].every(oid) && subjectIds.length > 1 && changedIds.length >= 2 &&
      new Set(subjectIds).size === subjectIds.length && new Set(changedIds).size === changedIds.length &&
      changedIds.every(id => subjectIds.includes(id)) && /^[0-9a-f]{64}$/.test(identity.binding.sha256), 'BATCH_DRAFT_INVENTORY')
    branch = REF_PREFIX + identity.binding.sha256
    expected = { base: master, head: identity.seal, branch, state: 'open', draft: true, merged: false,
      binding: identity.binding.sha256, qualification: identity.qualification.sha256,
      subjects: subjectIds, changedPages: changedIds }
    fresh = async () => {
      await verifyFresh(pins)
      checkOwned()
      need(git(['rev-parse', 'refs/heads/master', 'refs/heads/dev']) === master + '\n' + dev, 'BATCH_DRAFT_HEAD_CHANGED')
    }
    await fresh()
    need(!(await api.findUpdate()) && !git(['for-each-ref', REF_PREFIX + '*']), 'BATCH_DRAFT_EXISTING_UPDATE')
  } catch (error) {
    return { status: 'held', reason: error.message }
  }

  const lock = join(root, 'isolated-draft.lock'), journal = join(root, 'isolated-draft-journal.jsonl')
  let fd
  try { fd = openSync(lock, 'wx', 0o600) } catch (error) {
    if (error.code === 'EEXIST') return { status: 'held', reason: 'BATCH_DRAFT_BUSY' }
    throw error
  }
  let requested = false, journalFd
  const record = (state, operation, data = {}) => appendFileSync(journalFd, stable({ state, operation, ...data }).toString() + '\n',
    { flush: true })
  try {
    need(!(await api.findUpdate()) && !git(['for-each-ref', REF_PREFIX + '*']), 'BATCH_DRAFT_EXISTING_UPDATE')
    await fresh()
    try {
      journalFd = openSync(journal, constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK, 0o600)
      const stat = fstatSync(journalFd)
      need(stat.isFile() && stat.nlink === 1 && stat.uid === process.getuid() && (stat.mode & 0o777) === 0o600 &&
        sameFile(stat, lstatSync(journal)), 'BATCH_DRAFT_JOURNAL')
    } catch { throw Error('BATCH_DRAFT_JOURNAL') }
    record('requested', 'import-objects', { archiveSha256 })
    requested = true
    for (const object of objects) {
      need(git(['hash-object', '-w', '-t', object.type, '--stdin'], Buffer.from(object.base64, 'base64')) === object.oid,
        'BATCH_DRAFT_OBJECT_IMPORT')
    }
    git(['fsck', '--connectivity-only', '--no-dangling', expected.head])
    record('acknowledged', 'import-objects')
    await fresh()
    record('requested', 'create-ref', { branch, head: expected.head })
    git(['update-ref', '--stdin'], 'start\nverify refs/heads/master ' + expected.base + '\nverify refs/heads/dev ' +
      expectedDev + '\ncreate ' + branch + ' ' + expected.head + '\nprepare\ncommit\n')
    need(git(['rev-parse', branch]) === expected.head, 'BATCH_DRAFT_REF_READBACK')
    record('acknowledged', 'create-ref', { branch, head: expected.head })
    await fresh()
    need(!(await api.findUpdate()), 'BATCH_DRAFT_EXISTING_UPDATE')
    record('requested', 'open-draft', { branch, head: expected.head })
    let response
    try {
      response = await api.createDraft(expected)
      record('acknowledged', 'open-draft', { number: response.number })
    } catch (error) {
      record('unacknowledged', 'open-draft', { reason: error.message })
    }
    // Read the matching Draft even if the create response was lost. Never
    // repeat the request to resolve an uncertain remote outcome.
    const existing = await api.findUpdate()
    need(existing && Number.isSafeInteger(existing.number) && existing.number > 0 &&
      (!response || response.number === existing.number), 'BATCH_DRAFT_READBACK')
    const readback = await api.readDraft(existing.number)
    const { number, ...draft } = readback
    need(number === existing.number && stable(draft).equals(stable(expected)) &&
      git(['rev-parse', branch]) === expected.head, 'BATCH_DRAFT_READBACK')
    await fresh()
    record('confirmed', 'open-draft', { number, head: expected.head })
    return { status: 'created', archiveSha256, number, ...expected, responseLost: !response }
  } catch (error) {
    if (!requested) return { status: 'held', reason: error.message }
    record('stopped', 'writer', { reason: error.message })
    return { status: 'unknown', reason: error.message, branch, archiveSha256 }
  } finally {
    if (journalFd !== undefined) closeSync(journalFd)
    closeSync(fd)
    unlinkSync(lock)
  }
}
