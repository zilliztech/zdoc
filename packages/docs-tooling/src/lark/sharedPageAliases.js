'use strict'

// Bounded local evidence only: never fetch Git history or call Feishu here.
const fs = require('node:fs')
const crypto = require('node:crypto')
const SNAPSHOT = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
const MANIFEST = 'generated/en/manifests/shared-pages/guides'
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const valid = token => typeof token === 'string' && /^[A-Za-z0-9_-]+$/.test(token) && !/^(?:base_|shared-)/.test(token)
function tokens(value) {
  return [...new Set([value?.doc_token, value?.node_token, value?.origin_node_token, value?.obj_token,
    value?.feishu_token, ...(value?.feishu_aliases || [])].filter(valid))].sort()
}
const activeTokens = entry => tokens({feishu_token: entry?.feishu_token, feishu_aliases: entry?.feishu_aliases})
const matches = (entry, token) => !!token && activeTokens(entry).includes(token)
function check(condition, message) {if (!condition) throw new Error(`Shared aliases: ${message}`)}

const objectHash = (type, bytes) => crypto.createHash('sha1').update(Buffer.from(`${type} ${bytes.length}\0`)).update(bytes).digest('hex')
function treeEntry(bytes, name) {
  let offset = 0
  while (offset < bytes.length) {
    const space = bytes.indexOf(32, offset), end = bytes.indexOf(0, space)
    check(space >= offset && end > space && end + 21 <= bytes.length, 'malformed Git tree proof')
    const entry = {mode: bytes.subarray(offset, space).toString(), name: bytes.subarray(space + 1, end).toString(), oid: bytes.subarray(end + 1, end + 21).toString('hex')}
    if (entry.name === name) return entry
    offset = end + 21
  }
  throw new Error('Shared aliases: snapshot path absent from Git proof')
}
function gitProof(root, devCommit, commit, git) {
  const parents = new Map()
  if (devCommit !== commit) {
    const lines = git(root, ['rev-list', '--ancestry-path', '--parents', '--topo-order', '--max-count=2048', `${commit}..${devCommit}`], {stdio: ['ignore', 'pipe', 'pipe']}).toString().trim().split('\n')
    for (const line of lines) {const [id, ...ids] = line.split(' '); parents.set(id, ids)}
  }
  const visited = new Set()
  function route(id) {
    if (id === commit) return [id]
    if (visited.has(id)) return null
    visited.add(id)
    for (const parent of parents.get(id) || []) {const rest = route(parent); if (rest) return [id, ...rest]}
    return null
  }
  const ids = route(devCommit)
  check(ids, 'bounded pinned ancestry proof unavailable')
  const commits = ids.map(oid => ({oid, content: git(root, ['cat-file', 'commit', oid]).toString('utf8')}))
  let tree = /^tree ([a-f0-9]{40})$/m.exec(commits.at(-1).content)?.[1]
  check(tree, 'missing snapshot commit tree')
  const trees = []
  for (const part of SNAPSHOT.split('/')) {
    const bytes = git(root, ['cat-file', 'tree', tree])
    trees.push({oid: tree, content: bytes.toString('base64')})
    tree = treeEntry(bytes, part).oid
  }
  return {commits, trees}
}
function verifyProof(item, devCommit) {
  check(item.proof && Array.isArray(item.proof.commits) && item.proof.commits.length > 0 && item.proof.commits.length <= 2049
    && Array.isArray(item.proof.trees) && item.proof.trees.length === SNAPSHOT.split('/').length, 'invalid Git proof')
  let expected = devCommit
  for (const [index, commit] of item.proof.commits.entries()) {
    check(commit.oid === expected && typeof commit.content === 'string' && objectHash('commit', Buffer.from(commit.content)) === commit.oid, 'unbound snapshot commit proof')
    const next = item.proof.commits[index + 1]
    if (next) {
      check(commit.content.split('\n\n')[0].split('\n').includes(`parent ${next.oid}`), 'unbound snapshot ancestry proof')
      expected = next.oid
    }
  }
  const commit = item.proof.commits.at(-1)
  check(commit.oid === item.commit, 'snapshot commit proof mismatch')
  let tree = /^tree ([a-f0-9]{40})$/m.exec(commit.content)?.[1]
  for (const [index, part] of SNAPSHOT.split('/').entries()) {
    const proof = item.proof.trees[index], bytes = Buffer.from(proof.content, 'base64')
    check(proof.oid === tree && objectHash('tree', bytes) === tree, 'unbound snapshot tree proof')
    const entry = treeEntry(bytes, part)
    check(index === item.proof.trees.length - 1 ? ['100644', '100755'].includes(entry.mode) : entry.mode === '40000', 'unsafe snapshot Git mode')
    tree = entry.oid
  }
  check(objectHash('blob', Buffer.from(item.content)) === tree, 'unbound snapshot blob proof')
}
function legacy(record) {return record && record.source_kind !== 'shared-page' && !record.shared_page}
function recordAt(snapshot, id) {
  const records = (snapshot.records || []).filter(row => row.record_id === id)
  check(records.length <= 1, `conflicting snapshot owner ${id}`)
  return legacy(records[0]) ? records[0] : null
}
const EVIDENCE_LIMIT = 16 * 1024 * 1024
const snapshotSize = item => Buffer.byteLength(JSON.stringify(item))
function collect({baselineRoot, devCommit, active, previousSnapshot, sourceDir, retainedEvidence, recordIds, git, regularBytes}) {
  const evidence = {dev_commit: devCommit, snapshots: [], caches: [], gaps: []}, snapshots = new Map()
  let total = 0
  const gap = (ids, message) => {for (const record_id of ids) evidence.gaps.push({record_id, message})}
  // Retained roots already prove the pinned dev ancestry and exact source hash.
  // Admit them first, so later recovery never evicts previously known evidence.
  if (retainedEvidence) try {
    validateEvidence(retainedEvidence, devCommit)
    evidence.snapshots = [...retainedEvidence.snapshots]
    evidence.caches = [...retainedEvidence.caches]
    for (const item of evidence.snapshots) snapshots.set(item.commit, JSON.parse(item.content))
    total = evidence.snapshots.reduce((sum, item) => sum + snapshotSize(item), 0)
      + evidence.caches.reduce((sum, item) => sum + Buffer.byteLength(item.content), 0)
  } catch (error) {
    gap(recordIds, 'Retained alias evidence has unavailable or unknown provenance')
  }
  function addSnapshot(commit) {
    if (snapshots.has(commit)) return snapshots.get(commit)
    check(evidence.snapshots.length < 257, 'snapshot evidence count limit')
    const content = git(baselineRoot, ['show', `${commit}:${SNAPSHOT}`], {stdio: ['ignore', 'pipe', 'pipe']}).toString('utf8')
    check(Buffer.byteLength(content) <= EVIDENCE_LIMIT, 'snapshot evidence item size limit')
    const snapshot = JSON.parse(content)
    const item = {commit, path: SNAPSHOT, sha256: hash(content), content, proof: gitProof(baselineRoot, devCommit, commit, git)}
    const size = snapshotSize(item)
    check(size <= EVIDENCE_LIMIT && total + size <= EVIDENCE_LIMIT, 'snapshot evidence combined size limit')
    total += size; snapshots.set(commit, snapshot); evidence.snapshots.push(item)
    return snapshot
  }
  if (previousSnapshot) try {addSnapshot(devCommit)} catch (error) {
    gap(recordIds, 'Current pinned snapshot proof is unavailable or exceeds bounded evidence limits')
  }
  for (const id of recordIds) {
    const entry = active.pages.find(row => row.record === id)
    if (!entry || recordAt(previousSnapshot || {}, id)) continue
    try {
      const receipt = JSON.parse(git(baselineRoot, ['show', `${devCommit}:${MANIFEST}/${entry.page}.json`], {stdio: ['ignore', 'pipe', 'pipe']}))
      const pinned = receipt.inputs.dev.commit
      check(/^[a-f0-9]{40}$/.test(pinned), 'invalid receipt dev commit')
      git(baselineRoot, ['merge-base', '--is-ancestor', pinned, devCommit], {stdio: ['ignore', 'pipe', 'pipe']})
      const commits = [pinned, ...git(baselineRoot, ['log', '--format=%H', '--max-count=256', pinned, '--', SNAPSHOT], {stdio: ['ignore', 'pipe', 'pipe']}).toString().trim().split('\n').filter(Boolean)]
      let found = false
      for (const commit of new Set(commits)) {
        const candidate = snapshots.get(commit) || JSON.parse(git(baselineRoot, ['show', `${commit}:${SNAPSHOT}`], {stdio: ['ignore', 'pipe', 'pipe']}))
        if (recordAt(candidate, id)) {addSnapshot(commit); found = true; break}
      }
      if (!found) gap([id], 'Historical Feishu snapshot is unavailable in the bounded pinned dev history')
    } catch (error) {
      gap([id], 'Pinned receipt or local snapshot history is unavailable or exceeds bounded evidence limits')
    }
  }
  const cacheOwners = new Map()
  if (sourceDir && fs.existsSync(sourceDir)) for (const name of fs.readdirSync(sourceDir).filter(name => name.endsWith('.json')).sort()) {
    const bytes = regularBytes(sourceDir, name), source = JSON.parse(bytes)
    if (!legacy(source) || !source.base_record_id) continue
    // Ownership conflicts remain fatal even when recovery evidence is unavailable.
    for (const token of tokens(source)) {
      const owner = cacheOwners.get(token)
      check(!owner || owner === source.base_record_id, `conflicting frozen cache owner for ${token}`)
      cacheOwners.set(token, source.base_record_id)
    }
    if (!recordIds.includes(source.base_record_id) || evidence.caches.some(item => item.path === name)) continue
    const binding = evidence.snapshots.find(item => {
      const old = recordAt(snapshots.get(item.commit), source.base_record_id)
      return old?.source_file === name && old.source_hash === hash(bytes)
    })
    if (binding) {
      if (bytes.length > EVIDENCE_LIMIT || total + bytes.length > EVIDENCE_LIMIT || evidence.caches.length >= 2048) {
        gap([source.base_record_id], `Frozen legacy cache exceeds bounded evidence limits: ${name}`)
        continue
      }
      total += bytes.length
      evidence.caches.push({path: name, sha256: hash(bytes), content: bytes.toString('utf8'), snapshot_commit: binding.commit})
    } else if (tokens(source).some(token => !tokens(recordAt(previousSnapshot || {}, source.base_record_id)).includes(token))) {
      // A self-consistent cache manifest describes bytes; it cannot authorize IDs.
      gap([source.base_record_id], `Frozen legacy cache has unknown provenance (no pinned source_file/source_hash): ${name}`)
    }
  }
  evidence.gaps = [...new Map(evidence.gaps.map(item => [JSON.stringify(item), item])).values()]
  return evidence
}
function validateEvidence(evidence, devCommit = evidence?.dev_commit) {
  if (evidence === undefined) return
  check(evidence && /^[a-f0-9]{40}$/.test(devCommit) && evidence.dev_commit === devCommit, 'invalid evidence dev binding')
  check(Array.isArray(evidence.snapshots) && Array.isArray(evidence.caches) && Array.isArray(evidence.gaps)
    && evidence.snapshots.length <= 257 && evidence.caches.length <= 2048, 'invalid evidence')
  check(evidence.cache_generation === undefined, 'unverified cache generation provenance')
  let bytes = 0
  const snapshots = new Map(), seenCaches = new Set()
  for (const item of evidence.snapshots) {
    check(/^[a-f0-9]{40}$/.test(item.commit) && item.path === SNAPSHOT && typeof item.content === 'string'
      && item.sha256 === hash(item.content) && !snapshots.has(item.commit), 'invalid snapshot evidence')
    verifyProof(item, devCommit)
    snapshots.set(item.commit, JSON.parse(item.content)); bytes += snapshotSize(item)
    check(bytes <= EVIDENCE_LIMIT, 'evidence exceeds size limit')
  }
  for (const item of evidence.caches) {
    check(typeof item.path === 'string' && /^[^/\\]+\.json$/.test(item.path) && !seenCaches.has(item.path)
      && typeof item.content === 'string' && item.sha256 === hash(item.content), 'invalid cache evidence')
    seenCaches.add(item.path); bytes += Buffer.byteLength(item.content)
    check(bytes <= EVIDENCE_LIMIT, 'evidence exceeds size limit')
    const source = JSON.parse(item.content), record = recordAt(snapshots.get(item.snapshot_commit) || {}, source.base_record_id)
    check(legacy(source) && record?.source_file === item.path && record.source_hash === item.sha256, 'unbound cache evidence')
  }
  return evidence
}
function recover({active, previousSnapshot, evidence, recordIds}) {
  validateEvidence(evidence)
  const owners = new Map(), byRecord = new Map()
  function add(id, values) {
    for (const token of values) {
      const owner = owners.get(token)
      check(!owner || owner === id, `conflicting alias owner for ${token}`)
      owners.set(token, id)
      if (!byRecord.has(id)) byRecord.set(id, new Set())
      byRecord.get(id).add(token)
    }
  }
  for (const entry of active.pages) add(entry.record, activeTokens(entry))
  for (const snapshot of [previousSnapshot, ...(evidence?.snapshots || []).map(item => JSON.parse(item.content))]) {
    for (const row of snapshot?.records || []) if (legacy(row)) add(row.record_id, tokens(row))
  }
  for (const item of evidence?.caches || []) {const source = JSON.parse(item.content); add(source.base_record_id, tokens(source))}
  const result = structuredClone(active)
  for (const entry of result.pages) if (recordIds.includes(entry.record)) entry.feishu_aliases = [...(byRecord.get(entry.record) || [])].sort()
  return {active: result, aliases: Object.fromEntries(recordIds.map(id => [id, [...(byRecord.get(id) || [])].sort()]))}
}
function verifyEnrichment(old, current, aliases) {
  check(current && ['page', 'record', 'feishu_token', 'anchors', 'activated_in'].every(key => same(old[key], current[key])), 'baseline active fields changed')
  const known = activeTokens(old), next = activeTokens(current)
  check(known.every(token => next.includes(token)) && next.every(token => known.includes(token) || aliases.includes(token)), 'unverified or dropped alias')
}
function index(context, byRecord) {
  for (const [id, values] of Object.entries(byRecord)) for (const token of values) {
    const owner = context.aliasesByToken.get(token)
    check(!owner || owner === id, `conflicting alias owner for ${token}`)
    for (const [recordId, route] of context.routesByRecordId) check(route.kind !== 'feishu' || route.token !== token || recordId === id, `conflicting alias owner for ${token}`)
    context.aliasesByToken.set(token, id)
  }
}
function authenticate({devCommit, evidence}) {validateEvidence(evidence, devCommit)}

module.exports = {tokens, activeTokens, matches, collect, validateEvidence, recover, verifyEnrichment, authenticate, index}
