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
function freeze(value) { if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value)} return value }
function validateBundle(files, expected = {}) {
  if (!files.size) return null
  if (files.size > 8192 || [...files.values()].reduce((sum, bytes) => sum + bytes.length, 0) > LIMIT) fail('payload limit exceeded')
  for (const [file, bytes] of files) if (!safeHandoffPath(file) || bytes.length > FILE_LIMIT) fail('unsafe path or file size')
  if (files.has('continuation.json')) return require('./sharedPagePublication').validateContinuation(files, expected)
  const used = new Set()
  function read(file, hash) {
    if (!safeHandoffPath(file) || used.has(file) || !files.has(file)) fail(`missing, duplicate or unsafe file ${file}`)
    used.add(file); const bytes = files.get(file)
    if (hash && digest(bytes) !== hash) fail(`digest mismatch ${file}`)
    return bytes
  }
  const bundle = JSON.parse(read('bundle.json'))
  if (bundle.schema_version !== 1 || !/^[a-f0-9]{40}$/.test(bundle.master_commit) || !/^[a-f0-9]{40}$/.test(bundle.dev_commit)) fail('identity')
  if (expected.masterSha && expected.masterSha !== bundle.master_commit || expected.devBaselineSha && expected.devBaselineSha !== bundle.dev_commit) fail('commit binding')
  const prep = bundle.preparation
  if (!prep || prep.master_commit !== bundle.master_commit || prep.dev_commit !== bundle.dev_commit || !equal(prep.navigation, bundle.navigation)
    || !equal(prep.active, bundle.baseline_active) || !Array.isArray(prep.records) || !Array.isArray(prep.errors) || !Array.isArray(prep.dev_files)) fail('preparation evidence')
  validateActiveState(bundle.baseline_active); validateActiveState(bundle.effective_active)
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
      if (outcome.activation.firstActivation) activations.pages.push(outcome.activation.entry)
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
  }
  if (seen.size !== expectedRecords.size || used.size !== files.size || !equal(activations, bundle.effective_active)) fail('incomplete or extra bundle evidence')
  // Validation has no mutation of the authenticated source candidate or identity.
  return {bundle: freeze(bundle), files, routing: require('./sharedPageFetch').restoreRouting({...prep, active: bundle.effective_active})}
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
function loadBundle(root, expected) {
  if (fs.realpathSync(root) !== path.resolve(root)) fail('symlink root ancestor')
  const files = new Map(); let total = 0
  const visit = (directory, relative = '') => {
    if (fs.lstatSync(directory).isSymbolicLink()) fail('symlink directory')
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = relative ? `${relative}/${entry.name}` : entry.name, full = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) fail('symlink file')
      if (entry.isDirectory()) visit(full, file)
      else {
        const size = fs.statSync(full).size
        if (!entry.isFile() || size > FILE_LIMIT || (total += size) > LIMIT || files.size >= 8192) fail('file limit')
        files.set(file, fs.readFileSync(full))
      }
    }
  }
  visit(root); return validateBundle(files, expected)
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
module.exports = {ROOT, LIMIT, FILE_LIMIT, validateBundle, fromPayload, loadBundle, emitPrebuilt, restoreTableFallbacks}
