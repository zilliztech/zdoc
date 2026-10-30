'use strict'
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const yaml = require('js-yaml')
const {safeHandoffPath, validateSharedReceipt, validateActiveState} = require('./sharedPageRouting')
const {loadTypeScript} = require('../../../../scripts/lib/load-typescript')
const {finalizeFetchFrontMatter} = loadTypeScript(path.resolve(__dirname, '../shared-docs/core/site/front-matter.ts'))
const ROOT = 'tmp/docs-tooling/en/shared-pages/guides'
const LIMIT = 256 * 1024 * 1024, FILE_LIMIT = 32 * 1024 * 1024
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const fail = message => {throw new Error(`Invalid shared source bundle: ${message}`)}
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) {Object.values(value).forEach(freeze); Object.freeze(value)} return value }
function checkFileLimits(file, size, count, total) {
  const name = JSON.stringify(file)
  if (!safeHandoffPath(file)) fail(`unsafe path: ${name}`)
  if (size > FILE_LIMIT) fail(`file size limit exceeded: ${name} has ${size} bytes; limit ${FILE_LIMIT}`)
  if (count > 8192) fail(`file count limit exceeded at ${name}: ${count} files; limit 8192`)
  if (total > LIMIT) fail(`payload size limit exceeded at ${name}: ${total} bytes; limit ${LIMIT}`)
}
// v2 changes only the wire representation. Hash the exact JSON (including key
// order): input/receipt identities still use their original evidence bytes.
const EVIDENCE_KEYS = ['master_commit', 'dev_commit', 'files', 'dev_files', 'navigation']
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const keysAre = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
const jsonSize = value => Buffer.byteLength(JSON.stringify(value))
function evidenceBytes(value) {
  if (!keysAre(value, EVIDENCE_KEYS)) fail('common evidence shape')
  const bytes = JSON.stringify(value)
  if (Buffer.byteLength(bytes) > FILE_LIMIT) fail('common evidence size limit exceeded')
  return bytes
}
function encodeBundle(bundle) {
  if (bundle.schema_version !== 1 || Object.hasOwn(bundle, 'common_evidence')) fail('encoder requires logical v1 bundle')
  const pool = new Map()
  const reference = evidence => {
    const bytes = evidenceBytes(evidence), id = digest(bytes)
    if (pool.has(id) && JSON.stringify(pool.get(id)) !== bytes) fail('conflicting common evidence')
    pool.set(id, evidence)
    return id
  }
  const inputs = Object.fromEntries(Object.entries(bundle.preparation.inputs).map(([id, input]) =>
    [id, {...input, evidence: {evidence_ref: reference(input.evidence)}}]))
  const outcomes = bundle.outcomes.map(outcome => {
    if (outcome.status !== 'success') return outcome
    const {upstream, ...evidence} = outcome.input_context
    return {...outcome, input_context: {evidence_ref: reference(evidence), upstream}}
  })
  const wire = {...bundle, schema_version: 2, preparation: {...bundle.preparation, inputs}, outcomes,
    common_evidence: [...pool].map(([sha256, value]) => ({sha256, value}))}
  // Reject amplification at the producer too, before reporting a usable handoff.
  decodeBundle(wire)
  return wire
}
function decodeBundle(wire, otherBytes = 0) {
  if (wire.schema_version === 1) {
    if (Object.hasOwn(wire, 'common_evidence')) fail('unexpected v1 common evidence')
    return wire
  }
  if (wire.schema_version !== 2) fail('identity')
  if (!Array.isArray(wire.common_evidence) || wire.common_evidence.length > 4096
    || !object(wire.preparation?.inputs) || Object.keys(wire.preparation.inputs).length > 2048
    || !Array.isArray(wire.outcomes) || wire.outcomes.length > 2048) fail('evidence reference counts')
  const pool = new Map(), used = new Set()
  for (const entry of wire.common_evidence) {
    if (!keysAre(entry, ['sha256', 'value']) || !/^[a-f0-9]{64}$/.test(entry.sha256) || pool.has(entry.sha256)) fail('duplicate or invalid common evidence')
    if (digest(evidenceBytes(entry.value)) !== entry.sha256) fail('common evidence digest mismatch')
    pool.set(entry.sha256, entry.value)
  }
  const {common_evidence, ...bundle} = wire
  bundle.schema_version = 1
  let expanded = jsonSize(bundle) + otherBytes
  const budget = () => {if (expanded > LIMIT) fail(`expanded payload size limit exceeded: ${expanded} bytes; limit ${LIMIT}`)}
  budget()
  const restore = (wrapper, context = false) => {
    if (!keysAre(wrapper, context ? ['evidence_ref', 'upstream'] : ['evidence_ref'])
      || typeof wrapper.evidence_ref !== 'string' || !pool.has(wrapper.evidence_ref)) fail('missing or invalid evidence reference')
    used.add(wrapper.evidence_ref)
    const evidence = pool.get(wrapper.evidence_ref)
    const restored = context ? {...evidence, upstream: wrapper.upstream} : evidence
    expanded += jsonSize(restored) - jsonSize(wrapper)
    budget() // Check logical bytes before attaching the expanded reference.
    return restored
  }
  bundle.preparation = {...wire.preparation, inputs: Object.fromEntries(Object.entries(wire.preparation.inputs).map(([id, input]) => {
    if (!object(input)) fail('input evidence reference')
    return [id, {...input, evidence: restore(input.evidence)}]
  }))}
  bundle.outcomes = wire.outcomes.map(outcome => {
    if (!object(outcome)) fail('outcomes')
    return outcome.status === 'success' ? {...outcome, input_context: restore(outcome.input_context, true)} : outcome
  })
  if (used.size !== pool.size) fail('unused common evidence')
  return bundle
}
function validateBundle(files, expected = {}) {
  if (!files.size) return null
  let count = 0, total = 0
  for (const [file, bytes] of files) checkFileLimits(file, bytes.length, ++count, total += bytes.length)
  if (files.has('continuation.json')) return require('./sharedPagePublication').validateContinuation(files, expected)
  const used = new Set()
  function read(file, hash) {
    if (!safeHandoffPath(file) || used.has(file) || !files.has(file)) fail(`missing, duplicate or unsafe file ${file}`)
    used.add(file); const bytes = files.get(file)
    if (hash && digest(bytes) !== hash) fail(`digest mismatch ${file}`)
    return bytes
  }
  const bytes = read('bundle.json')
  const bundle = decodeBundle(JSON.parse(bytes), total - bytes.length)
  if (bundle.schema_version !== 1 || !/^[a-f0-9]{40}$/.test(bundle.master_commit) || !/^[a-f0-9]{40}$/.test(bundle.dev_commit)) fail('identity')
  if (expected.masterSha && expected.masterSha !== bundle.master_commit || expected.devBaselineSha && expected.devBaselineSha !== bundle.dev_commit) fail('commit binding')
  const prep = bundle.preparation
  if (!prep || prep.master_commit !== bundle.master_commit || prep.dev_commit !== bundle.dev_commit || !equal(prep.navigation, bundle.navigation)
    || !equal(prep.active, bundle.baseline_active) || !Array.isArray(prep.records) || !Array.isArray(prep.errors) || !Array.isArray(prep.dev_files)) fail('preparation evidence')
  validateActiveState(bundle.baseline_active); validateActiveState(bundle.effective_active)
  const aliases = require('./sharedPageAliases')
  aliases.authenticate({devCommit: bundle.dev_commit, evidence: prep.alias_evidence})
  const recovered = aliases.recover({active: bundle.baseline_active, previousSnapshot: prep.previous_snapshot, evidence: prep.alias_evidence, recordIds: Object.keys(prep.inputs)})
  const records = new Set()
  for (const record of prep.records) {if (!record.record_id || records.has(record.record_id)) fail('duplicate Base record'); records.add(record.record_id)}
  const inventory = new Map()
  for (const item of prep.dev_files) {
    if (!safeHandoffPath(item.path) || inventory.has(item.path) || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.size) || item.size < 0) fail('baseline inventory')
    inventory.set(item.path, item)
  }
  const baseline = (file, original, hash) => {
    const entry = inventory.get(original), bytes = read(file, hash)
    if (!entry || entry.sha256 !== digest(bytes) || entry.size !== bytes.length) fail(`baseline byte binding ${original}`)
    return bytes
  }
  if (prep.previous_snapshot) {
    if (bundle.previous_snapshot_file !== 'baseline/snapshot.json') fail('snapshot file path')
    if (!equal(JSON.parse(baseline(bundle.previous_snapshot_file, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json')), prep.previous_snapshot)) fail('prior snapshot')
  } else if (bundle.previous_snapshot_file) fail('unexpected prior snapshot')
  if (bundle.baseline_active.pages.length) {
    if (bundle.baseline_active_file?.file !== 'baseline/active.json') fail('active file path')
    if (!equal(JSON.parse(baseline(bundle.baseline_active_file?.file, 'generated/en/manifests/shared-pages/guides/active.json', bundle.baseline_active_file?.sha256)), bundle.baseline_active)) fail('baseline active')
  } else if (bundle.baseline_active_file) fail('unexpected active file')
  // Reconstruct every inspected link and active ID, never alias-only state.
  const routing = require('./sharedPageFetch').restoreRouting(prep)
  const expectedRecords = new Set([...Object.keys(prep.inputs), ...prep.errors.map(error => error.record_id)])
  const seen = new Set(), outputs = new Set(), activations = structuredClone(bundle.baseline_active)
  if (!Array.isArray(bundle.outcomes) || bundle.outcomes.length > 2048) fail('outcomes')
  for (const outcome of bundle.outcomes) {
    if (!expectedRecords.has(outcome.record_id) || seen.has(outcome.record_id)) fail('duplicate or unselected outcome')
    seen.add(outcome.record_id)
    let descriptors
    if (outcome.status === 'success') {
      const input = prep.inputs[outcome.record_id]
      if (!input || !equal(input.identity, outcome.identity) || outcome.page !== input.identity.page || routing.routesByRecordId.get(outcome.record_id)?.page !== outcome.page) fail('route identity')
      if (!equal(input.evidence.dev_files, prep.dev_files) || input.evidence.master_commit !== bundle.master_commit || input.evidence.dev_commit !== bundle.dev_commit) fail('input evidence')
      if (!equal(outcome.input_context, {...input.evidence, upstream: outcome.input_context.upstream})) fail('input context')
      if (outcome.receipt !== `pages/${outcome.page}/receipt-draft.json`) fail('receipt file path')
      const receipt = JSON.parse(read(outcome.receipt)); validateSharedReceipt(receipt, outcome.identity)
      if (receipt.inputs.zdoc.commit !== bundle.master_commit || receipt.inputs.dev.commit !== bundle.dev_commit
        || receipt.inputs.fetch.image_base_url !== outcome.image_base_url || receipt.inputs.fetch.navigation !== digest(JSON.stringify(bundle.navigation))) fail('receipt binding')
      if (outcome.identity.inputs_sha256 !== digest(JSON.stringify(receipt.inputs))) fail('input digest')
      descriptors = outcome.outputs
      if (!Array.isArray(descriptors) || descriptors.length !== 2 || !equal([...descriptors.map(o => o.manual)].sort(), ['guides', 'guides-byoc']) || !Array.isArray(outcome.targets) || outcome.targets.length !== 2) fail('incomplete paired output')
      for (const output of descriptors) {
        if (!safeHandoffPath(output.file)) fail('unsafe output file')
        const target = outcome.targets.find(target => target.manual === output.manual)
        const root = `content/en/${output.manual === 'guides' ? 'guides' : 'byoc'}`
        if (!target || output.file !== `pages/${outcome.page}/${output.manual}${target.extension}` || output.path !== `${root}/${target.path}${target.extension}` || !['.md', '.mdx'].includes(target.extension)
          || !receipt.outputs.some(row => row.manual === output.manual && row.path === output.path && row.sha256 === output.sha256)) fail('publish path')
      }
      if (!Array.isArray(outcome.images) || !equal(receipt.inputs.images, outcome.images.map(image => ({source: image.original, sha256: image.sha256, object: image.address})))) fail('image manifest')
      for (const image of outcome.images) if (!new RegExp(`^shared/${image.sha256}\\.[a-z0-9]+$`).test(image.address) || !/^[a-f0-9]{64}$/.test(image.sha256)) fail('image address')
      const entry = outcome.activation.entry, old = activations.pages.find(row => row.record === outcome.record_id)
      if (old) {
        if (outcome.activation.firstActivation) fail('existing activation marked new')
        aliases.verifyEnrichment(old, entry, recovered.aliases[outcome.record_id] || [])
        activations.pages[activations.pages.indexOf(old)] = entry
      } else {
        if (!outcome.activation.firstActivation || entry.record !== outcome.record_id || entry.page !== outcome.page) fail('activation identity')
        const previous = prep.previous_snapshot?.records?.find(row => row.record_id === outcome.record_id)
        if (entry.feishu_token !== (previous?.doc_token || previous?.node_token || null)
          || !equal(entry.feishu_aliases, recovered.aliases[outcome.record_id] || [])) fail('activation aliases')
        activations.pages.push(entry)
      }
    } else if (outcome.status === 'fallback') {
      const prior = prep.previous_snapshot?.records?.find(record => record.record_id === outcome.record_id)
      descriptors = outcome.baseline.outputs
      if (!Array.isArray(descriptors) || !equal([...descriptors.map(o => o.path)].sort(), [...(prior?.output_paths || [])].sort())) fail('incomplete baseline outputs')
      const active = bundle.baseline_active.pages.find(entry => entry.record === outcome.record_id) || null
      if (!equal(active, outcome.baseline.active)) fail('fallback activation')
      const receipt = outcome.baseline.receipt
      if (Boolean(receipt) !== Boolean(active)) fail('fallback receipt')
      if (receipt) {
        if (receipt.file !== `fallback/${outcome.record_id}/receipt.json` || receipt.path !== `generated/en/manifests/shared-pages/guides/${active.page}.json`) fail('baseline receipt path')
        validateSharedReceipt(JSON.parse(baseline(receipt.file, receipt.path, receipt.sha256)), {group: 'guides', page: active.page})
      }
    } else fail('unknown outcome')
    for (const output of descriptors) {
      if (!safeHandoffPath(output.path) || !/^content\/en\/(guides|byoc)\/tutorials\/[^/]+\/.+\.mdx?$/.test(output.path) || outputs.has(output.path) || !/^[a-f0-9]{64}$/.test(output.sha256)) fail('duplicate or unsafe output')
      outputs.add(output.path)
      if (outcome.status === 'fallback') {
        if (output.file !== `fallback/${outcome.record_id}/${output.path}`) fail('fallback file path')
        baseline(output.file, output.path, output.sha256)
      }
      else read(output.file, output.sha256)
    }
    if (outcome.status === 'success') {
      const receipt = JSON.parse(files.get(outcome.receipt))
      if (receipt.inputs.fetch.render_targets || outcome.regeneration) {
        if (!equal(receipt.inputs.fetch.render_targets?.targets, outcome.targets)) fail('frozen render targets mismatch')
        require('../../../../scripts/docs-workflow/guides-shared-regeneration').validateRegenerationEvidence(outcome.regeneration, receipt, descriptors.map(output => ({...output, bytes: files.get(output.file)})))
      }
    }
  }
  if (seen.size !== expectedRecords.size || used.size !== files.size || !equal(activations, bundle.effective_active)) fail('incomplete or extra bundle evidence')
  // Validation has no mutation of the authenticated source candidate or identity.
  return {bundle: freeze(bundle), files, routing: require('./sharedPageFetch').restoreRouting({...prep, active: bundle.effective_active, effective_routing: true})}
}
function fromPayload(payload, expected) {
  const files = new Map([...payload].filter(([file]) => file.startsWith(`${ROOT}/`)).map(([file, bytes]) => [file.slice(ROOT.length + 1), bytes]))
  const candidateBytes = payload.get('packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json')
  if (!files.size && candidateBytes && JSON.parse(candidateBytes).records?.some(record => record.source_kind === 'shared-page')) fail('shared snapshot requires bundle')
  const handoff = validateBundle(files, expected)
  if (handoff && candidateBytes) {
    if (handoff.continuation) {if (require('./sourceCompleteness').hashSnapshot(JSON.parse(candidateBytes)) !== handoff.continuation.candidate_sha256) fail('requested continuation candidate mismatch')}
    else require('./sharedPageFetch').pendingSourceSnapshot(JSON.parse(candidateBytes), handoff.routing)
  }
  return handoff
}
// Stat the complete directory before reading payloads. The producer uses the same
// bounds so an unusable handoff fails generation rather than the next audit step.
function checkBundleLimits(root) {
  if (fs.realpathSync(root) !== path.resolve(root)) fail('symlink root ancestor')
  const files = []; let total = 0
  const visit = (directory, relative = '') => {
    if (fs.lstatSync(directory).isSymbolicLink()) fail('symlink directory')
    for (const entry of fs.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = relative ? `${relative}/${entry.name}` : entry.name, full = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) fail('symlink file')
      if (entry.isDirectory()) visit(full, file)
      else {
        if (!entry.isFile()) fail(`non-regular file: ${JSON.stringify(file)}`)
        const size = fs.statSync(full).size
        checkFileLimits(file, size, files.length + 1, total += size)
        files.push({file, full})
      }
    }
  }
  visit(root); return files
}
function loadBundle(root, expected) {
  const files = new Map(checkBundleLimits(root).map(({file, full}) => [file, fs.readFileSync(full)]))
  return validateBundle(files, expected)
}
function emitPrebuilt(writer, request) {
  const handoff = writer.sharedBundle
  if (!handoff) return false
  const source = writer.__fetch_base_source_meta(request.page_title, request.page_slug, request.page_token)
  const outcome = handoff.bundle.outcomes.find(outcome => outcome.record_id === source?.base_record_id)
  if (!outcome) return false
  if (outcome.status === 'inherited') fail('requested render touched an inherited shared owner')
  if (outcome.status === 'fallback') return true // Table completion restores exact prior paths, including moves.
  const manual = String(writer.targets).includes('zilliz.paas') ? 'guides-byoc' : 'guides'
  const output = outcome.outputs.find(output => output.manual === manual), target = outcome.targets.find(target => target.manual === manual)
  const configPath = `shared-docs/guides/pages/${outcome.page}/page.yaml`
  const configBytes = require('./sharedPageFetch').regularBytes(writer.sharedWorkspace, configPath)
  const configInput = outcome.input_context.files.find(file => file.path === configPath)
  if (!configInput || configInput.sha256 !== digest(configBytes) || configInput.size !== configBytes.length) fail('pinned publish configuration drift')
  const publish = yaml.load(configBytes.toString('utf8')).publish
  if (!Array.isArray(publish) || publish.filter(entry => entry.manual === manual && entry.path === target.path).length !== 1) fail('configured publish path mismatch')
  const contentRoot = `content/en/${manual === 'guides' ? 'guides' : 'byoc'}`
  const {resolveManualPublication} = loadTypeScript(path.resolve(__dirname, '../manuals/registry.ts'))
  const calculation = Object.create(writer)
  calculation.sidebarOutputDir = resolveManualPublication(manual, 'en').publication.outputDir
  const relative = calculation.__doc_id_for_token(request.page_token, contentRoot)
  if (`${contentRoot}/${relative}${target.extension}` !== output.path || request.page_slug !== outcome.page) fail('writer path changed after source decision')
  const destination = path.resolve(request.path, `${request.page_slug}${target.extension}`)
  const expectedDestination = path.resolve(writer.sharedWorkspace, `tmp/docs-tooling/en/${manual}/${output.path}`)
  if (destination !== expectedDestination) fail('writer destination mismatch')
  const original = handoff.files.get(output.file).toString('utf8')
  const frontLines = original.split('\n'), frontEnd = frontLines.indexOf('---', 1)
  if (frontLines[0] !== '---' || frontEnd < 0) fail('shared output requires complete front matter')
  const front = yaml.load(frontLines.slice(1, frontEnd).join('\n'))
  const finalized = finalizeFetchFrontMatter(original, {pageId: outcome.page, customEditUrl: front.custom_edit_url,
    navigation: {sidebar_label: request.sidebar_label || request.page_title, sidebar_position: request.sidebar_position}, releaseChannel: request.page_channel})
  // Source and table use exactly the same navigation finalizer and frozen inputs.
  if (digest(Buffer.from(finalized)) !== output.sha256) fail('writer navigation changed after source decision')
  fs.mkdirSync(path.dirname(destination), {recursive: true}); fs.writeFileSync(destination, finalized)
  return true
}
function restoreTableFallbacks(handoff, workspace, ownedPath) {
  if (!handoff) return []
  const emitted = []
  for (const outcome of handoff.bundle.outcomes) if (outcome.status === 'fallback') for (const output of outcome.baseline.outputs) {
    const manual = output.path.startsWith('content/en/guides/') ? 'guides' : 'guides-byoc'
    const relative = `tmp/docs-tooling/en/${manual}/${output.path}`
    if (!relative.startsWith(`${ownedPath}/`)) continue
    const destination = path.join(workspace, relative)
    fs.mkdirSync(path.dirname(destination), {recursive: true}); fs.writeFileSync(destination, handoff.files.get(output.file)); emitted.push(relative)
  }
  return emitted
}
module.exports = {ROOT, LIMIT, FILE_LIMIT, encodeBundle, decodeBundle, validateBundle, fromPayload, checkBundleLimits, loadBundle, emitPrebuilt, restoreTableFallbacks}
