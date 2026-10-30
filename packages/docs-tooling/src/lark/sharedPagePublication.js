'use strict'

// Published authority is derived only after authenticated table restore. Drafts never enter this API as receipts.
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const {digest, regularBytes, pendingSourceSnapshot, git, snapshotPath} = require('./sharedPageFetch')
const {validateSharedReceipt, validateSharedSnapshotRecord, validateActiveState} = require('./sharedPageRouting')
const hashSnapshot = snapshot => require('./sourceCompleteness').hashSnapshot(snapshot)
const MANIFEST = 'generated/en/manifests/shared-pages/guides'
const EFFECTIVE = 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-effective.json'
const aliases = require('./sharedPageAliases')
const {validateRegenerationEvidence} = require('../../../../scripts/docs-workflow/guides-shared-regeneration')
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
function check(condition, message) { if (!condition) throw new Error(`Shared publication: ${message}`) }
function json(root, file) { return JSON.parse(regularBytes(root, file)) }
function put(root, file, value) {
  const destination = path.join(root, file)
  fs.mkdirSync(path.dirname(destination), {recursive: true})
  fs.writeFileSync(destination, JSON.stringify(value, null, 2) + '\n')
}
function verifyOutput(root, output, token, read = regularBytes) {
  check(/^content\/en\/(guides|byoc)\/tutorials\/.+\.mdx?$/.test(output.path), 'invalid output path')
  const bytes = read(root, output.path)
  check(digest(bytes) === output.sha256, `output digest mismatch: ${output.path}`)
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(bytes.toString())
  check(front && String(yaml.load(front[1])?.token) === token, `output token mismatch: ${output.path}`)
}
function validatePublishedReceipt(receipt, record, {workspace, snapshot, read = regularBytes} = {}) {
  validateSharedSnapshotRecord(record); validateSharedReceipt(receipt, record.shared_page)
  const navigation = receipt.inputs.fetch.navigation
  check(navigation && typeof navigation === 'object' && Array.isArray(navigation.navigationRecords), 'draft navigation is not publication authority')
  const draftInputs = {...receipt.inputs, fetch: {...receipt.inputs.fetch, navigation: digest(JSON.stringify(navigation))}}
  check(digest(JSON.stringify(draftInputs)) === record.shared_page.inputs_sha256, 'receipt input identity mismatch')
  const nav = navigation.navigationRecords.filter(row => row.record_id === record.record_id)
  check(nav.length === 1 && nav[0].source_kind === 'shared-page' && nav[0].shared_page?.page === record.shared_page.page
    && nav[0].doc_link === record.doc_link && nav[0].slug === record.slug, 'receipt canonical record/navigation mismatch')
  check(equal(receipt.outputs.map(o => o.path).sort(), [...record.output_paths].sort()), 'receipt output set mismatch')
  if (snapshot) {
    const current = snapshot.navigation_records.find(row => row.record_id === record.record_id)
    // The stored immutable projection predates injection of the final input identity.
    const withoutIdentity = row => {const result = structuredClone(row); if (result.shared_page) result.shared_page = {group: result.shared_page.group, page: result.shared_page.page}; return result}
    check(current && equal(withoutIdentity(current), withoutIdentity(nav[0])), 'receipt navigation differs from effective snapshot')
  }
  if (workspace) for (const output of receipt.outputs) verifyOutput(workspace, output, receipt.token, read)
  return receipt
}
function effectiveSnapshot(candidate, handoff) {
  if (!handoff || handoff.continuation) return structuredClone(candidate)
  pendingSourceSnapshot(candidate, handoff.routing)
  const snapshot = structuredClone(candidate), previous = handoff.bundle.preparation.previous_snapshot
  for (const outcome of handoff.bundle.outcomes) {
    if (outcome.status === 'success') {
      const record = snapshot.records.find(row => row.record_id === outcome.record_id)
      check(record && equal(record.shared_page, outcome.identity), 'observed successful identity mismatch')
      record.output_paths = outcome.outputs.map(o => o.path).sort()
    } else {
      snapshot.records = snapshot.records.filter(row => row.record_id !== outcome.record_id)
      snapshot.navigation_records = snapshot.navigation_records.filter(row => row.record_id !== outcome.record_id)
      const old = previous?.records?.find(row => row.record_id === outcome.record_id)
      if (old) {
        snapshot.records.push(structuredClone(old))
        const nav = previous.navigation_records?.find(row => row.record_id === outcome.record_id)
        check(nav, `missing baseline navigation: ${outcome.record_id}`)
        snapshot.navigation_records.push(structuredClone(nav))
      }
    }
  }
  snapshot.records.sort((a, b) => a.record_id.localeCompare(b.record_id))
  snapshot.navigation_records.sort((a, b) => a.table_id.localeCompare(b.table_id) || a.order - b.order || a.record_id.localeCompare(b.record_id))
  snapshot.table_digests = Object.fromEntries([...new Set(snapshot.navigation_records.map(row => row.table_id))].sort().map(id =>
    [id, digest(JSON.stringify(snapshot.navigation_records.filter(row => row.table_id === id)))]))
  return snapshot
}
function finalizePublication({workspace, handoff, candidate}) {
  if (!handoff) return null
  if (handoff.continuation) return finalizeContinuation({workspace, handoff, candidate})
  const {bundle, files} = handoff, snapshot = effectiveSnapshot(candidate, handoff)
  const fallbacks = []
  // Read and verify every byte before writing any new authority.
  const receipts = [], baselineReceipts = [], regeneration = {}
  for (const outcome of bundle.outcomes) {
    if (outcome.status === 'success') {
      const receipt = JSON.parse(files.get(outcome.receipt))
      receipt.inputs.fetch.navigation = structuredClone(bundle.navigation)
      const record = snapshot.records.find(row => row.record_id === outcome.record_id)
      validatePublishedReceipt(receipt, record, {workspace, snapshot})
      if (receipt.inputs.fetch.render_targets || outcome.regeneration) {
        validateRegenerationEvidence(outcome.regeneration, receipt, receipt.outputs.map(output => ({...output, bytes: regularBytes(workspace, output.path)})))
        regeneration[outcome.record_id] = outcome.regeneration
      }
      receipts.push([record.shared_page.record, receipt])
    } else {
      const record = bundle.preparation.previous_snapshot?.records?.find(row => row.record_id === outcome.record_id)
      for (const output of outcome.baseline.outputs) {
        check(digest(regularBytes(workspace, output.path)) === output.sha256, `fallback bytes changed: ${output.path}`)
      }
      if (outcome.baseline.receipt) {
        const receipt = outcome.baseline.receipt, bytes = files.get(receipt.file)
        check(bytes && digest(bytes) === receipt.sha256, 'fallback receipt changed')
        baselineReceipts.push([receipt.path, bytes])
        const retainedReceipt = JSON.parse(bytes)
        if (retainedReceipt.inputs.fetch.render_targets) {
          const authority = JSON.parse(git(workspace, ['show', `${bundle.dev_commit}:${MANIFEST}/_publication.json`]))
          const proof = authority.regeneration?.[outcome.record_id]
          validateRegenerationEvidence(proof, retainedReceipt, retainedReceipt.outputs.map(output => ({...output, bytes: regularBytes(workspace, output.path)})))
          regeneration[outcome.record_id] = proof
        }
      }
      if (record) fallbacks.push({record, outputs: outcome.baseline.outputs.map(({path, sha256}) => ({path, sha256}))})
    }
  }
  validateActiveState(bundle.effective_active)
  aliases.authenticate({workspace, devCommit: bundle.dev_commit, evidence: bundle.preparation.alias_evidence, git})
  const publication = {schema_version: 1, dev_commit: bundle.dev_commit, observed_sha256: hashSnapshot(candidate),
    effective_sha256: hashSnapshot(snapshot), active: bundle.effective_active, cache_eligible: bundle.outcomes.every(row => row.status === 'success'),
    baseline_snapshot: bundle.previous_snapshot_file ? files.get(bundle.previous_snapshot_file).toString('utf8') : null,
    fallbacks, alias_evidence: bundle.preparation.alias_evidence, regeneration}
  // A clean assembly checkout has no dev-owned receipt directory. The bundle
  // binds these exact bytes to the pinned baseline; never reserialize old receipts.
  for (const [file, bytes] of baselineReceipts) {
    const destination = path.join(workspace, file)
    fs.mkdirSync(path.dirname(destination), {recursive: true}); fs.writeFileSync(destination, bytes)
  }
  for (const [file, receipt] of receipts) put(workspace, file, receipt)
  if (bundle.effective_active.pages.length) put(workspace, `${MANIFEST}/active.json`, bundle.effective_active)
  put(workspace, `${MANIFEST}/_publication.json`, publication)
  put(workspace, EFFECTIVE, snapshot)
  put(workspace, 'packages/docs-tooling/src/lark/meta/reports/guides-shared-publication.json', {schema_version: 1, generated_at: new Date().toISOString(), failures: bundle.outcomes.filter(row => row.status === 'fallback').map(({record_id, code, message, detail}) => ({record_id, code, message, detail})), notices: bundle.notices || [], information: bundle.information || []})
  return {snapshot, publication}
}
function publishedEvidence(workspace, snapshot, {verifyFiles = true, files = null} = {}) {
  const read = (root, file) => files ? (check(files.has(file), `missing retained file: ${file}`), files.get(file)) : regularBytes(root, file)
  const readJson = (root, file) => JSON.parse(read(root, file))
  const existsFile = file => files ? files.has(file) : fs.existsSync(path.join(workspace, file))
  const receipts = new Map(), fallbackIds = new Set()
  let active = null
  for (const record of snapshot.records || []) if (record.source_kind === 'shared-page') {
    receipts.set(record.record_id, validatePublishedReceipt(readJson(workspace, record.shared_page.record), record, {workspace: verifyFiles ? workspace : undefined, snapshot, read}))
  }
  const file = `${MANIFEST}/_publication.json`
  if (receipts.size || existsFile(`${MANIFEST}/active.json`)) check(existsFile(file), 'missing final publication authority')
  if (existsFile(file)) {
    const authority = readJson(workspace, file)
    check(authority.schema_version === 1 && authority.effective_sha256 === hashSnapshot(snapshot), 'effective snapshot binding mismatch')
    check(/^[a-f0-9]{40}$/.test(authority.dev_commit) && /^[a-f0-9]{64}$/.test(authority.observed_sha256)
      && typeof authority.cache_eligible === 'boolean' && Array.isArray(authority.fallbacks), 'invalid publication authority')
    const proofs = authority.regeneration || {}
    check(proofs && typeof proofs === 'object' && !Array.isArray(proofs), 'invalid regeneration evidence')
    for (const [id, receipt] of receipts) if (receipt.inputs.fetch.render_targets || Object.hasOwn(proofs, id)) {
      validateRegenerationEvidence(proofs[id], receipt, verifyFiles ? receipt.outputs.map(output => ({...output, bytes: read(workspace, output.path)})) : undefined)
    }
    check(Object.keys(proofs).every(id => receipts.has(id)), 'extra regeneration evidence')
    active = validateActiveState(authority.active)
    if (authority.active.pages.length) check(equal(readJson(workspace, `${MANIFEST}/active.json`), authority.active), 'active state mismatch')
    const oldSnapshot = authority.baseline_snapshot ? JSON.parse(authority.baseline_snapshot) : null
    if (authority.baseline_snapshot) check(git(workspace, ['show', `${authority.dev_commit}:${snapshotPath}`]).toString('utf8') === authority.baseline_snapshot, 'activation baseline snapshot mismatch')
    let oldActive = {schema_version: 1, pages: []}
    const oldActivePath = `${MANIFEST}/active.json`
    const exists = git(workspace, ['ls-tree', authority.dev_commit, '--', oldActivePath]).length
    if (exists) oldActive = validateActiveState(JSON.parse(git(workspace, ['show', `${authority.dev_commit}:${oldActivePath}`])))
    aliases.authenticate({workspace, devCommit: authority.dev_commit, evidence: authority.alias_evidence, git})
    const recovered = aliases.recover({active: oldActive, previousSnapshot: oldSnapshot, evidence: authority.alias_evidence, recordIds: authority.active.pages.map(entry => entry.record)})
    for (const old of oldActive.pages) aliases.verifyEnrichment(old, authority.active.pages.find(entry => entry.record === old.record), recovered.aliases[old.record] || [])
    for (const entry of authority.active.pages) if (!oldActive.pages.some(old => old.record === entry.record)) {
      const record = snapshot.records.find(row => row.record_id === entry.record)
      const previous = oldSnapshot?.records.find(row => row.record_id === entry.record)
      check(record?.source_kind === 'shared-page' && record.shared_page.page === entry.page && entry.feishu_token === (previous?.doc_token || previous?.node_token || null), 'activation provenance mismatch')
      if (entry.feishu_aliases) check(equal(entry.feishu_aliases, recovered.aliases[entry.record] || []), 'activation alias provenance mismatch')
    }
    if (authority.fallbacks.length) {
      check(/^[a-f0-9]{40}$/.test(authority.dev_commit), 'invalid fallback baseline')
      const pinned = git(workspace, ['show', `${authority.dev_commit}:${snapshotPath}`]).toString('utf8')
      check(pinned === authority.baseline_snapshot, 'fallback snapshot is not pinned baseline')
      const previous = JSON.parse(pinned)
      for (const fallback of authority.fallbacks) {
        const old = previous.records.find(row => row.record_id === fallback.record.record_id)
        check(old && equal(old, fallback.record) && equal(old, snapshot.records.find(row => row.record_id === old.record_id)), 'fallback canonical record mismatch')
        check(equal([...old.output_paths].sort(), fallback.outputs.map(o => o.path).sort()), 'fallback output set mismatch')
        for (const output of fallback.outputs) {
          check(digest(git(workspace, ['show', `${authority.dev_commit}:${output.path}`])) === output.sha256, 'fallback is not pinned baseline bytes')
          if (verifyFiles) check(digest(read(workspace, output.path)) === output.sha256, 'published fallback bytes mismatch')
        }
        fallbackIds.add(old.record_id)
      }
    }
  }
  return {receipts, fallbackIds, active}
}
function baselineRefHref(handoff, ref, canonicalSlug, manual, workspace) {
  const rows = handoff.bundle.preparation.previous_snapshot?.navigation_records || []
  const old = rows.find(row => row.record_id === ref.base_record_id)
  if (!old || old.placement_type !== 'ref' || old.ref_target_token !== ref.base_nav_ref_target_token
    || old.ref_target_anchor !== ref.base_nav_ref_target_anchor) return null
  const byId = new Map(rows.map(row => [row.record_id, row])), parts = [], seen = new Set()
  let current = old
  while ((current.parent_record_ids || []).some(id => byId.has(id))) {
    check(!seen.has(current.record_id), 'baseline ref navigation cycle'); seen.add(current.record_id)
    current = byId.get(current.parent_record_ids.find(id => byId.has(id)))
    parts.unshift(current.slug || require('slugify')(current.title, {lower: true, strict: true}))
  }
  const key = `ref:tutorials/${[require('./guidesTableSlugs').guidesTableSlug('en', old.table_name || old.table_id), ...parts, old.slug || canonicalSlug].join('/')}`
  const sidebarPath = `generated/en/sidebars/${manual === 'guides' ? 'guides' : 'guides-byoc'}.sidebar.js`
  const bytes = git(workspace, ['show', `${handoff.bundle.dev_commit}:${sidebarPath}`])
  const sandbox = {module: {exports: {}}}
  require('node:vm').runInNewContext(bytes.toString('utf8'), sandbox, {timeout: 1000})
  const matches = []
  const visit = items => {for (const item of items || []) {if (item.type === 'link' && item.key === key) matches.push(item.href); if (item.items) visit(item.items)}}
  visit(sandbox.module.exports.default || sandbox.module.exports)
  check(matches.length === 1 && typeof matches[0] === 'string', 'missing authenticated baseline ref href')
  return matches[0]
}
function fallbackChannel(handoff, recordId) {
  const nav = handoff.bundle.preparation.previous_snapshot?.navigation_records?.find(row => row.record_id === recordId)
  check(nav, 'missing fallback canonical navigation')
  const record = handoff.bundle.preparation.previous_snapshot.records?.find(row => row.record_id === recordId)
  return ['next', 'retire-in-next'].includes(record?.release_channel) ? record.release_channel : null
}
function projectFallbackSidebar(items, handoff, manual, workspace = null) {
  if (!handoff) return items
  const result = structuredClone(items), previous = handoff.bundle.preparation.previous_snapshot
  // Prefer exact sidebar metadata from the pinned baseline. Older fixtures or
  // retained baselines without a sidebar are reconstructed from authenticated navigation.
  let historical = null
  if (workspace) {
    const file = `generated/en/sidebars/${manual}.sidebar.js`
    if (git(workspace, ['ls-tree', handoff.bundle.dev_commit, '--', file]).length) {
      const sandbox = {module: {exports: {}}}
      require('node:vm').runInNewContext(git(workspace, ['show', `${handoff.bundle.dev_commit}:${file}`]).toString(), sandbox, {timeout: 1000})
      historical = JSON.parse(JSON.stringify(sandbox.module.exports.default || sandbox.module.exports))
    }
  }
  const restoreHistorical = (id) => {
    if (!historical) return false
    const locate = (siblings, chain = []) => {
      for (const item of siblings) {
        const next = [...chain, {item, siblings}]
        if (item.type === 'doc' && item.id === id || item.type === 'category' && item.link?.id === id) return next
        if (item.items) {const found = locate(item.items, next); if (found) return found}
      }
      return null
    }
    const chain = locate(historical)
    if (!chain) return false
    let current = result
    for (const [index, {item, siblings}] of chain.entries()) {
      const key = row => row.key || `${row.type}:${row.id || row.label}`
      let retained = current.find(row => key(row) === key(item))
      if (index === chain.length - 1 && item.type === 'doc') check(!retained, 'duplicate fallback sidebar output')
      if (retained && item.type === 'category') Object.assign(retained, structuredClone({...item, items: retained.items}))
      if (!retained) {
        retained = structuredClone(item)
        if (item.type === 'category') retained.items = []
        const position = siblings.indexOf(item)
        const next = current.findIndex(row => siblings.findIndex(old => key(old) === key(row)) > position)
        current.splice(next < 0 ? current.length : next, 0, retained)
      }
      current = retained.items
    }
    return true
  }
  const rows = previous?.navigation_records || [], byId = new Map(rows.map(row => [row.record_id, row]))
  const slug = row => row.slug || require('slugify')(row.title, {lower: true, strict: true})
  const channel = row => {const retained = fallbackChannel(handoff, row.record_id); return retained ? {customProps: {channel: retained}} : {}}
  const ancestors = row => {
    const parents = [], seen = new Set([row.record_id])
    while ((row.parent_record_ids || []).some(id => byId.has(id))) {
      row = byId.get(row.parent_record_ids.find(id => byId.has(id)))
      check(!seen.has(row.record_id), 'fallback navigation cycle'); seen.add(row.record_id); parents.unshift(row)
    }
    return parents
  }
  const tablePath = row => `tutorials/${require('./guidesTableSlugs').guidesTableSlug('en', row.table_name || row.table_id)}`
  const rowPath = row => [tablePath(row), ...ancestors(row).map(slug), slug(row)].join('/')
  const orders = new Map()
  for (const row of rows) {
    const relative = rowPath(row)
    orders.set(`category:${relative}`, row.order); orders.set(`doc:${relative}`, row.order)
    orders.set(`ref:${relative}`, row.order); orders.set(`link:${relative}`, row.order)
  }
  const insert = (siblings, item, order) => {
    const index = siblings.findIndex(other => Number.isFinite(orders.get(other.key)) && orders.get(other.key) > order)
    siblings.splice(index < 0 ? siblings.length : index, 0, item)
  }
  for (const outcome of handoff.bundle.outcomes) if (outcome.status === 'fallback') {
    const nav = byId.get(outcome.record_id)
    for (const output of outcome.baseline.outputs) {
      const prefix = `content/en/${manual === 'guides' ? 'guides' : 'byoc'}/`
      if (!output.path.startsWith(prefix)) continue
      check(nav, 'missing fallback sidebar navigation')
      const id = output.path.slice(prefix.length).replace(/\.mdx?$/, '')
      if (restoreHistorical(id)) continue
      const parentRows = ancestors(nav)
      const containers = [{key: `category:${tablePath(nav)}`, label: nav.table_name || nav.table_id, order: nav.order},
        ...parentRows.map(row => ({key: `category:${rowPath(row)}`, label: row.labels || row.title, order: row.order, ...channel(row)}))]
      let siblings = result
      for (const descriptor of containers) {
        let container = siblings.find(row => row.type === 'category' && row.key === descriptor.key)
        if (!container) {
          const {order, ...metadata} = descriptor
          container = {type: 'category', ...metadata, items: []}; insert(siblings, container, order)
        }
        siblings = container.items
      }
      const leaf = {type: 'doc', id, label: nav.labels || nav.title, key: `doc:${id}`, ...channel(nav)}
      check(!siblings.some(row => row.key === leaf.key), 'duplicate fallback sidebar output')
      insert(siblings, leaf, nav.order)
    }
  }
  return result
}

// Requested Fetch inherits only publication state proven by the pinned dev tree.
// The source artifact carries those exact bytes so fresh workers need no source generation.
function requestedBaseline(workspace, devCommit, snapshot) {
  if (!snapshot?.records?.some(row => row.source_kind === 'shared-page')) return null
  check(/^[a-f0-9]{40}$/.test(devCommit), 'requested inheritance requires pinned baseline')
  const baselineBytes = git(workspace, ['show', `${devCommit}:${snapshotPath}`])
  check(hashSnapshot(JSON.parse(baselineBytes)) === hashSnapshot(snapshot), 'requested baseline snapshot differs from pinned dev')
  const paths = new Set([snapshotPath, `${MANIFEST}/_publication.json`, `${MANIFEST}/active.json`])
  for (const record of snapshot.records) if (record.source_kind === 'shared-page') {
    paths.add(record.shared_page.record); record.output_paths.forEach(file => paths.add(file))
  }
  const authority = JSON.parse(git(workspace, ['show', `${devCommit}:${MANIFEST}/_publication.json`]))
  for (const fallback of authority.fallbacks || []) fallback.outputs.forEach(output => paths.add(output.path))
  const files = new Map([...paths].sort().map(file => [file, git(workspace, ['show', `${devCommit}:${file}`])]))
  return {files, snapshot, evidence: publishedEvidence(workspace, snapshot, {files}), devCommit}
}
function continuationRouting(records, previous, active) {
  const shared = previous.records.filter(row => row.source_kind === 'shared-page')
  return require('./sharedPageRouting').createRoutingContext({records, previousSnapshot: previous, active,
    availablePages: shared.map(row => `${row.shared_page.group}/${row.shared_page.page}`),
    sharedInputsByRecordId: new Map(shared.map(row => [row.record_id, row.shared_page]))})
}
function validateContinuation(files, expected = {}) {
  const descriptor = JSON.parse(files.get('continuation.json'))
  check(descriptor.schema_version === 1 && /^[a-f0-9]{40}$/.test(descriptor.master_commit)
    && /^[a-f0-9]{40}$/.test(descriptor.dev_commit) && /^[a-f0-9]{64}$/.test(descriptor.candidate_sha256), 'invalid requested continuation identity')
  check(!expected.masterSha || descriptor.master_commit === expected.masterSha, 'requested continuation master mismatch')
  check(!expected.devBaselineSha || descriptor.dev_commit === expected.devBaselineSha, 'requested continuation baseline mismatch')
  check(Array.isArray(descriptor.inventory) && Array.isArray(descriptor.records), 'invalid requested continuation inventory')
  const retained = new Map()
  for (const entry of descriptor.inventory) {
    check(require('./sharedPageRouting').safeHandoffPath(entry.path) && !retained.has(entry.path), 'unsafe requested continuation path')
    const bytes = files.get(`retained/${entry.path}`)
    check(bytes && digest(bytes) === entry.sha256, 'requested continuation digest mismatch')
    retained.set(entry.path, bytes)
  }
  check(files.size === retained.size + 1, 'extra requested continuation files')
  const previous = JSON.parse(retained.get(snapshotPath)), authority = JSON.parse(retained.get(`${MANIFEST}/_publication.json`))
  const allowed = new Set([snapshotPath, `${MANIFEST}/_publication.json`, `${MANIFEST}/active.json`])
  const receipts = new Map()
  for (const record of previous.records) if (record.source_kind === 'shared-page') {
    allowed.add(record.shared_page.record); record.output_paths.forEach(file => allowed.add(file))
    receipts.set(record.record_id, validatePublishedReceipt(JSON.parse(retained.get(record.shared_page.record)), record,
      {workspace: '.', snapshot: previous, read: (_, file) => retained.get(file)}))
  }
  for (const fallback of authority.fallbacks || []) fallback.outputs.forEach(output => allowed.add(output.path))
  check(receipts.size && allowed.size === retained.size && [...allowed].every(file => retained.has(file)), 'requested continuation output set mismatch')
  check(authority.effective_sha256 === hashSnapshot(previous), 'requested continuation authority mismatch')
  validateActiveState(authority.active)
  check(equal(JSON.parse(retained.get(`${MANIFEST}/active.json`)), authority.active), 'requested continuation active mismatch')
  return {continuation: descriptor, retained, receipts, files,
    bundle: {master_commit: descriptor.master_commit, dev_commit: descriptor.dev_commit, effective_active: authority.active,
      navigation: {navigationRecords: previous.navigation_records, tableDigests: previous.table_digests},
      preparation: {records: descriptor.records, previous_snapshot: previous},
      outcomes: previous.records.filter(row => row.source_kind === 'shared-page').map(row => ({record_id: row.record_id, status: 'inherited'}))},
    routing: continuationRouting(descriptor.records, previous, authority.active)}
}
function authenticateContinuation(workspace, handoff, candidate) {
  const {continuation, retained, bundle} = handoff
  check(hashSnapshot(candidate) === continuation.candidate_sha256, 'requested continuation candidate mismatch')
  for (const [file, bytes] of retained) check(git(workspace, ['show', `${continuation.dev_commit}:${file}`]).equals(bytes), `requested continuation is not pinned baseline: ${file}`)
  const previous = bundle.preparation.previous_snapshot
  const navigation = require('./sourceSnapshot').createGuidesNavigationState(bundle.preparation.records, {routingContext: handoff.routing})
  check(equal(navigation.navigationRecords, candidate.navigation_records) && equal(navigation.tableDigests, candidate.table_digests), 'requested continuation raw navigation mismatch')
  const evidence = publishedEvidence(workspace, previous, {files: retained})
  const ids = new Set([...evidence.receipts.keys(), ...evidence.fallbackIds])
  check(candidate.records.filter(row => row.source_kind === 'shared-page').length === evidence.receipts.size, 'requested continuation shared set changed')
  for (const id of ids) {
    check(equal(previous.records.find(row => row.record_id === id), candidate.records.find(row => row.record_id === id)), 'requested continuation changed retained record')
    check(equal(previous.navigation_records.find(row => row.record_id === id), candidate.navigation_records.find(row => row.record_id === id)), 'requested continuation changed retained navigation')
  }
  return evidence
}
function writeContinuation({workspace, baseline, records, candidate, masterCommit}) {
  if (!baseline) return null
  const root = path.join(workspace, require('./sharedPageBundle').ROOT)
  check(!fs.existsSync(root), 'requested continuation destination already exists')
  const descriptor = {schema_version: 1, master_commit: masterCommit, dev_commit: baseline.devCommit,
    candidate_sha256: hashSnapshot(candidate), records,
    inventory: [...baseline.files].map(([path, bytes]) => ({path, sha256: digest(bytes)}))}
  const files = new Map([['continuation.json', Buffer.from(JSON.stringify(descriptor))], ...[...baseline.files].map(([file, bytes]) => [`retained/${file}`, bytes])])
  const handoff = validateContinuation(files)
  authenticateContinuation(workspace, handoff, candidate)
  for (const [file, bytes] of files) {const target = path.join(root, file); fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, bytes)}
  return handoff
}
function finalizeContinuation({workspace, handoff, candidate}) {
  authenticateContinuation(workspace, handoff, candidate)
  // No generated/shared bytes may change in an unrelated requested checkpoint.
  for (const record of candidate.records) if (record.source_kind === 'shared-page') for (const file of record.output_paths) {
    check(regularBytes(workspace, file).equals(handoff.retained.get(file)), 'requested shared output changed')
  }
  for (const [file, bytes] of handoff.retained) if (file.startsWith(`${MANIFEST}/`)) {
    const target = path.join(workspace, file); fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, bytes)
  }
  const authority = JSON.parse(handoff.retained.get(`${MANIFEST}/_publication.json`))
  authority.effective_sha256 = hashSnapshot(candidate); authority.observed_sha256 = hashSnapshot(candidate)
  put(workspace, `${MANIFEST}/_publication.json`, authority); put(workspace, EFFECTIVE, candidate)
  publishedEvidence(workspace, candidate)
  return {snapshot: candidate, publication: authority}
}

module.exports = {requestedBaseline, continuationRouting, validateContinuation, authenticateContinuation, writeContinuation, MANIFEST, EFFECTIVE, validatePublishedReceipt, effectiveSnapshot, finalizePublication, publishedEvidence, projectFallbackSidebar, baselineRefHref, fallbackChannel}
