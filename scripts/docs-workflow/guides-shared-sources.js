#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {loadTypeScript} = require('../lib/load-typescript')
const fetch = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const SourceIndex = require('../../packages/docs-tooling/src/lark/larkSourceIndex')
const aliases = require('../../packages/docs-tooling/src/lark/sharedPageAliases')
const {validateSharedReceipt, readSharedReceipt, readActiveState, safeHandoffPath} = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
const {runBuild, readSharedDocs} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/commands/build.ts'))
const {parseLock} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/core/lock.ts'))
const {parseSourceConfig} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/core/config.ts'))
const {resolveManualPublication} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/manuals/registry.ts'))
const {createGuidesNavigationState} = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const {validateImageBaseUrl} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
const {HttpImageFetcher} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/adapters/images.ts'))
const regeneration = require('./guides-shared-regeneration')
const sharedRoot = 'shared-docs/guides'
function write(root, relative, bytes) {
  if (!safeHandoffPath(relative)) throw new Error('Unsafe source output path')
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, bytes, {flag: 'wx'})
}
function emptyDirectory(root) {
  const absolute = path.resolve(root)
  for (let current = absolute; ; current = path.dirname(current)) {
    if (fs.existsSync(current) && (fs.lstatSync(current).isSymbolicLink() || !fs.statSync(current).isDirectory())) throw new Error('Unsafe source output directory')
    if (path.dirname(current) === current) break
  }
  if (fs.existsSync(root) && fs.readdirSync(root).length) throw new Error('Source output directory must be empty')
}
/** Only Git's explicit no-matching-ref status is recoverable; transport/auth/I/O errors propagate. */
function prepareUpstream({repository, track, out, statusFile}) {
  const run = args => execFileSync('git', ['-c', 'credential.helper=', ...args], {
    encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024,
    env: {...process.env, GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1'},
  })
  run(['check-ref-format', `refs/heads/${track}`])
  emptyDirectory(out)
  const missing = () => {
    const status = {schema_version: 1, status: 'unavailable', code: 'SHARED_UPSTREAM_REF_MISSING', repository, track,
      message: `Configured upstream tracking branch is absent: ${track}`}
    write(path.dirname(statusFile), path.basename(statusFile), JSON.stringify(status, null, 2) + '\n')
    return status
  }
  try { run(['ls-remote', '--exit-code', '--heads', '--', repository, `refs/heads/${track}`]) }
  catch (error) { if (error.status === 2) return missing(); throw error }
  // This is a full-history clone of every branch, without storing a credential.
  run(['clone', '--no-checkout', '--no-tags', '--origin', 'origin', '--', repository, out])
  try { run(['-C', out, 'show-ref', '--verify', '--quiet', `refs/remotes/origin/${track}`]) }
  catch (error) { if (error.status === 1) return missing(); throw error }
  run(['-C', out, 'checkout', '--detach', `refs/remotes/origin/${track}`])
  run(['-C', out, 'branch', '--force', track, `refs/remotes/origin/${track}`])
  const status = {schema_version: 1, status: 'ready', repository, track}
  write(path.dirname(statusFile), path.basename(statusFile), JSON.stringify(status, null, 2) + '\n')
  return status
}
function lockedInventory(repo, commit) {
  try {
    try { fs.lstatSync(repo) }
    catch (error) {
      if (error.code === 'ENOENT') throw Object.assign(new Error('Selected upstream checkout was not prepared'), {code: 'SHARED_UPSTREAM_NOT_PREPARED'})
      throw error
    }
    // Batch-check reports a missing object as data (exit 0); failures of Git itself stay fatal.
    const result = fetch.git(repo, ['cat-file', '--batch-check'], {input: `${commit}^{commit}\n`}).toString().trim()
    if (result === `${commit}^{commit} missing`) throw Object.assign(new Error(`Locked upstream commit is unavailable: ${commit}`), {code: 'SHARED_UPSTREAM_LOCK_MISSING'})
    if (!/^[a-f0-9]{40} commit \d+$/.test(result)) throw Object.assign(new Error('Invalid upstream commit probe'), {hardStop: true})
    return fetch.gitInventory(repo, commit, ['site/en'])
  } catch (error) {
    if (error.status !== undefined || ['ENOENT', 'EACCES', 'ETIMEDOUT'].includes(error.code)) error.hardStop = true
    throw error
  }
}
function readCurrentSources(sourceDir, candidate) {
  return [...new Set(candidate.records.map(record => record.source_file).filter(Boolean))].sort().map(file => JSON.parse(fetch.regularBytes(sourceDir, file)))
}
/** Production snapshots never populate record output_paths, so retained
 * baseline outputs are located through the legacy source's tree position —
 * exactly where the page was published from before the Docs flip. */
function baselinePublicationPaths({recordId, sourceDir, rootToken, baselineRoot}) {
  if (!sourceDir || !rootToken) return []
  const index = SourceIndex.load(sourceDir)
  const legacy = index.find('base_record_id', recordId, {where: source => source.source_kind !== 'shared-page' && !source.shared_page})
  if (!legacy || !legacy.node_token) return []
  const paths = []
  for (const manual of ['guides', 'guides-byoc']) {
    const publication = resolveManualPublication(manual, 'en').publication
    const writer = fetch.writerAdapter(sourceDir, rootToken, manual)
    const relative = writer.__doc_id_for_token(legacy.node_token, publication.contentRoot)
    if (!safeHandoffPath(relative)) continue
    for (const extension of ['.mdx', '.md']) {
      const file = `${publication.contentRoot}/${relative}${extension}`
      if (fs.existsSync(path.join(baselineRoot, file))) { paths.push(file); break }
    }
  }
  return paths
}
function baselineFallback(data, recordId, baselineRoot, out, source = {}) {
  const previous = data.previous_snapshot?.records?.find(record => record.record_id === recordId)
  const active = data.active.pages.find(entry => entry.record === recordId) || null
  const outputs = []
  const declared = (previous?.output_paths || []).filter(file => typeof file === 'string' && /^content\/en\/(guides|byoc)\/.+\.mdx?$/.test(file))
  const derived = baselinePublicationPaths({recordId, baselineRoot, sourceDir: source.sourceDir, rootToken: source.rootToken})
  for (const file of [...new Set([...declared, ...derived])].sort()) {
    if (!safeHandoffPath(file)) throw new Error('Unsafe baseline fallback path')
    const bytes = fetch.regularBytes(baselineRoot, file)
    const destination = `fallback/${recordId}/${file}`
    write(out, destination, bytes)
    outputs.push({path: file, file: destination, sha256: fetch.digest(bytes)})
  }
  let receipt = null
  if (active) {
    const file = `generated/en/manifests/shared-pages/guides/${active.page}.json`
    const bytes = fetch.regularBytes(baselineRoot, file)
    validateSharedReceipt(JSON.parse(bytes), {group: 'guides', page: active.page})
    const destination = `fallback/${recordId}/receipt.json`
    write(out, destination, bytes); receipt = {path: file, file: destination, sha256: fetch.digest(bytes)}
  }
  return {outputs, receipt, active}
}
function receiptDraft({page, input, upstream, lock, outputs, images, channel, imageBaseUrl, renderTargets, notes = []}) {
  const byPath = new Map()
  for (const version of ['current', 'next']) for (const file of upstream[version]) {
    if (!byPath.has(file.path)) byPath.set(file.path, {path: file.path, current: null, next: null})
    byPath.get(file.path)[version] = file.sha256
  }
  let packageRoot = path.dirname(require.resolve('@zilliz/mdtomd/blocks.js', {paths: [path.resolve(__dirname, '../../packages/docs-tooling')]}))
  while (!fs.existsSync(path.join(packageRoot, 'package.json'))) {
    const parent = path.dirname(packageRoot)
    if (parent === packageRoot) throw new Error('Cannot identify installed md2md version')
    packageRoot = parent
  }
  const md2mdPackage = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))
  if (md2mdPackage.name !== '@zilliz/mdtomd') throw new Error('Unexpected md2md package identity')
  return {schema_version: 1, page, token: `shared-${page}`, inputs: {
    milvus_docs: {repository: 'milvus-io/milvus-docs', current: lock.current, next: lock.next, files: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path))},
    zdoc: {repository: 'zilliztech/zdoc', commit: input.evidence.master_commit, files: input.evidence.files.map(({path, sha256}) => ({path, sha256}))},
    dev: {commit: input.evidence.dev_commit, files: input.evidence.dev_files.map(({path, sha256}) => ({path, sha256}))},
    fetch: {navigation: fetch.digest(JSON.stringify(input.evidence.navigation)), image_base_url: imageBaseUrl, render_targets: {schema_version: 1, targets: renderTargets}},
    tools: {zdoc: input.evidence.master_commit, md2md: md2mdPackage.version},
    images: images.map(image => ({source: image.original, sha256: image.sha256, object: image.address})),
  }, outputs, channel: channel === 'current' ? null : channel, notes}
}
function receiptNotes(built) {
  const groups = new Map()
  for (const output of built) for (const note of output.notes) {
    const text = `${note.code}: ${note.message}; fields: ${[...note.fields].sort().join(', ')}`
    if (!groups.has(text)) groups.set(text, new Set())
    groups.get(text).add(output.manual)
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([text, manuals]) => manuals.size === built.length ? text : `${[...manuals].sort().join(', ')}: ${text}`)
}

/** One success/fallback transaction per record. Only scratch holds image bodies; this does not upload or publish. */
async function generateSharedSources(options, dependencies = {}) {
  const {preparation: preparation, repositoryRoot, baselineRoot, repo, sourceDir, candidate, rootToken, out, scratch, runId} = options
  if (!preparation || (!Object.keys(preparation.inputs).length && !preparation.errors.length)) return null
  const data = {...preparation, alias_evidence: aliases.collect({baselineRoot, devCommit: preparation.dev_commit, active: preparation.active,
    previousSnapshot: preparation.previous_snapshot, sourceDir, retainedEvidence: preparation.alias_evidence, recordIds: Object.keys(preparation.inputs), git: dependencies.aliasGit || fetch.git, regularBytes: fetch.regularBytes})}
  const recovered = aliases.recover({active: data.active, previousSnapshot: data.previous_snapshot, evidence: data.alias_evidence, recordIds: Object.keys(data.inputs)})
  const imageBaseUrl = validateImageBaseUrl(options.imageBaseUrl)
  if (!/^\d+$/.test(String(runId))) throw new Error('A numeric Fetch run ID is required')
  fetch.pinnedCommit(repositoryRoot, data.master_commit); fetch.pinnedCommit(baselineRoot, data.dev_commit)
  emptyDirectory(out); emptyDirectory(scratch)
  const context = fetch.restoreRouting(data)
  const effectiveActive = structuredClone(data.active), outcomes = [], referringTables = new Set(), imageNotices = new Map()
  const currentSources = readCurrentSources(sourceDir, candidate)
  const oldReads = new Map()
  const fetchOld = token => {
    if (!oldReads.has(token)) oldReads.set(token, Promise.resolve().then(() => dependencies.fetchOld(token)))
    return oldReads.get(token)
  }
  const selected = data.records.filter(record => data.inputs[record.record_id])
  const scratchRoot = path.resolve(scratch)
  fs.mkdirSync(scratchRoot, {recursive: true})
  for (const record of selected) {
    const input = data.inputs[record.record_id], page = input.identity.page
    const buildOut = path.join(scratchRoot, `build-${page}`)
    try {
      if (options.upstreamStatus?.status === 'unavailable') {
        if (options.upstreamStatus.code !== 'SHARED_UPSTREAM_REF_MISSING') throw Object.assign(new Error('Invalid upstream setup status'), {hardStop: true})
        throw Object.assign(new Error(options.upstreamStatus.message), {code: options.upstreamStatus.code})
      }
      fetch.assertInventory(repositoryRoot, input.evidence.files); fetch.assertInventory(baselineRoot, input.evidence.dev_files)
      const expectedPaths = ['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml', `pages/${page}/page.yaml`, `pages/${page}/lock.yaml`]
      for (const file of expectedPaths) if (!input.evidence.files.some(entry => entry.path === `${sharedRoot}/${file}`)) {
        throw Object.assign(new Error(`Missing pinned input: ${file}`), file === `pages/${page}/page.yaml` ? {code: 'OWNERSHIP_CONFIG_MISSING'} : {})
      }
      const shared = await readSharedDocs(path.join(repositoryRoot, sharedRoot), repositoryRoot, [page])
      if ('errors' in shared) throw Object.assign(new Error('Shared config validation failed'), {detail: shared.errors})
      const source = parseSourceConfig(shared.sourceYaml, {page, channel: 'both'})
      if ('errors' in source) throw new Error(JSON.stringify(source.errors))
      const lockText = shared.pages.get(page)?.lockYaml
      if (!lockText) throw new Error('Fetch requires a committed lock.yaml; branch HEAD cannot replace a lock')
      const parsedLock = parseLock(lockText, {page, channel: 'both'})
      if ('errors' in parsedLock) throw new Error(JSON.stringify(parsedLock.errors))
      const lock = parsedLock.lock
      const upstream = Object.fromEntries(['current', 'next'].map(version => [version, lockedInventory(repo, lock[version])]))
      const targets = fetch.planFetchTargets({record, sourceDir, baselineRoot, rootToken, page, navigation: data.navigation, previousSnapshot: data.previous_snapshot})
      const active = readActiveState(baselineRoot)?.pages.find(entry => entry.record === record.record_id && entry.page === page)
      let previousReceipt = null
      if (active) {
        const previousSnapshot = JSON.parse(fetch.regularBytes(baselineRoot, fetch.snapshotPath))
        const previous = previousSnapshot.records?.find(row => row.record_id === active.record && row.shared_page?.page === page)
        if (!previous) throw new Error('Active shared page has no corresponding baseline snapshot record')
        previousReceipt = readSharedReceipt(baselineRoot, previous.shared_page)
        require('../../packages/docs-tooling/src/lark/sharedPagePublication').validatePublishedReceipt(previousReceipt, previous,
          {workspace: baselineRoot, snapshot: previousSnapshot})
      }
      const recordedImages = new Map((previousReceipt?.inputs.images || []).map(image => [image.source, image.sha256]))
      const acceptedFetcher = new HttpImageFetcher(Math.ceil((options.imageTimeout ?? 120) * 1000))
      const readAcceptedImage = async (source, sha256) => {
        const image = previousReceipt?.inputs.images.find(image => image.source === source && image.sha256 === sha256)
        if (!image) throw new Error(`Missing accepted image object: ${source}`)
        const base = validateImageBaseUrl(previousReceipt.inputs.fetch.image_base_url)
        return (dependencies.readAcceptedImage || (url => acceptedFetcher.fetch(url)))(`${base}/${image.object}`)
      }
      const renderTargets = structuredClone(targets)
      const fetchContext = {page, targets, recordedImages, records: data.navigation.navigationRecords.map(row => ({record_id: row.record_id, slug: row.slug,
        placement_type: row.placement_type, publish_targets: row.targets, output_paths: {}}))}
      let built, log = ''
      const buildErrors = []
      const code = await runBuild({sharedDocs: path.join(repositoryRoot, sharedRoot), repo, dev: baselineRoot, out: buildOut, page,
        imageTimeout: options.imageTimeout ?? 120}, text => { log += text }, {repositoryRoot, fetchContext, fetcher: dependencies.fetcher, readAcceptedImage, onErrors: errors => buildErrors.push(...errors), onBuilt: pages => { built = pages }})
      if (code || !built || built.length !== 2) throw Object.assign(new Error(`Paired shared build failed: ${log}`), {
        code: buildErrors.some(error => error.code === 'OWNERSHIP_PATH_MISMATCH') ? 'OWNERSHIP_PATH_MISMATCH' : 'SHARED_BUILD_FAILED',
        detail: buildErrors.length ? buildErrors : null,
      })
      for (const output of built) for (const address of new Set(output.images.map(image => image.address))) output.mdx = output.mdx.split(address).join(`${imageBaseUrl}/${address}`)
      const activation = await fetch.activationDraft({record, page, active: data.active, previousSnapshot: data.previous_snapshot, currentSources,
        navigation: data.navigation, pages: built, sourceDir, rootToken, fetchOld, runId, recoveredAliases: recovered.aliases[record.record_id]})
      const imageMap = new Map(), imageBytes = new Map()
      for (const output of built) {
        for (const image of output.images) {
          const existing = imageMap.get(image.original)
          if (existing && existing.sha256 !== image.sha256) throw new Error('Inconsistent accepted image')
          imageMap.set(image.original, image)
        }
        for (const image of output.imageContents || []) {
          if (image.bytes.byteLength > 32 * 1024 * 1024 || fetch.digest(image.bytes) !== image.sha256) throw new Error('Invalid accepted image body')
          imageBytes.set(image.sha256, image.bytes)
        }
      }
      if ([...imageBytes.values()].reduce((sum, bytes) => sum + bytes.byteLength, 0) > 256 * 1024 * 1024) throw new Error('Image scratch limit exceeded')
      const images = [...imageMap.values()].sort((a, b) => a.original.localeCompare(b.original))
      const outputs = built.map(output => ({manual: output.manual,
        path: `${resolveManualPublication(output.manual, 'en').publication.contentRoot}/${output.path}${output.extension}`,
        sha256: fetch.digest(Buffer.from(output.mdx))}))
      const receipt = receiptDraft({page, input, upstream, lock, outputs, images, channel: targets[0].channel,
        imageBaseUrl, renderTargets, notes: receiptNotes(built)})
      validateSharedReceipt(receipt, input.identity)
      for (const [sha, bytes] of imageBytes) if (!fs.existsSync(path.join(scratchRoot, 'images', sha))) write(scratchRoot, `images/${sha}`, bytes)
      const proof = await regeneration.regenerateReceipt({receipt, navigation: data.navigation, repositoryRoot, baselineRoot, repo, scratch: scratchRoot,
        outputs: built.map((output, index) => ({...outputs[index], bytes: Buffer.from(output.mdx)})),
        readAcceptedImage: async (source, sha) => {
          if (!receipt.inputs.images.some(image => image.source === source && image.sha256 === sha)) throw new Error(`Missing accepted scratch image: ${source}`)
          return fetch.regularBytes(scratchRoot, `images/${sha}`)
        }}, {assertToolIdentity: dependencies.assertToolIdentity})
      const identity = {...input.identity, inputs_sha256: fetch.digest(JSON.stringify(receipt.inputs))}
      const files = []
      for (const [index, output] of built.entries()) {
        const file = `pages/${page}/${output.manual}${output.extension}`
        write(out, file, output.mdx); files.push({...outputs[index], file})
      }
      write(out, `pages/${page}/receipt-draft.json`, JSON.stringify(receipt, null, 2) + '\n')
      const previousActive = effectiveActive.pages.findIndex(entry => entry.record === record.record_id)
      if (previousActive >= 0) effectiveActive.pages[previousActive] = activation.entry
      else effectiveActive.pages.push(activation.entry)
      if (activation.firstActivation || JSON.stringify(data.active.pages[previousActive]) !== JSON.stringify(activation.entry)) {
        for (const link of activation.references) {
          if (link.source_table_id) referringTables.add(link.source_table_id)
          const linking = link.source_token && candidate.records.find(row => [row.doc_token, row.node_token, row.obj_token].includes(link.source_token))
          if (linking?.table_id) referringTables.add(linking.table_id)
        }
      }
      for (const output of built) for (const notice of output.notices) {
        const row = {code: notice.code, page, source_page: page, url: notice.detail.original,
          recorded: notice.detail.recorded, observed: notice.detail.observed}
        imageNotices.set(JSON.stringify(row), row)
      }
      outcomes.push({record_id: record.record_id, page, status: 'success', identity, outputs: files, images,
        receipt: `pages/${page}/receipt-draft.json`, regeneration: proof, activation, targets, image_base_url: imageBaseUrl, input_context: {...input.evidence, upstream}})
    } catch (error) {
      if (error.hardStop) throw error
      outcomes.push({record_id: record.record_id, page, status: 'fallback', code: error.code || 'SHARED_BUILD_FAILED', message: error.message,
        detail: error.detail || null, baseline: baselineFallback(data, record.record_id, baselineRoot, out, {sourceDir, rootToken})})
    } finally { fs.rmSync(buildOut, {recursive: true, force: true}) }
  }
  for (const error of data.errors) if (!selected.some(record => record.record_id === error.record_id)) {
    outcomes.push({...error, status: 'fallback', baseline: baselineFallback(data, error.record_id, baselineRoot, out, {sourceDir, rootToken})})
  }
  let baselineActiveFile = null
  if (data.active.pages.length) {
    const relative = 'generated/en/manifests/shared-pages/guides/active.json'
    const bytes = fetch.regularBytes(baselineRoot, relative)
    write(out, 'baseline/active.json', bytes)
    baselineActiveFile = {file: 'baseline/active.json', sha256: fetch.digest(bytes)}
  }
  const previousSnapshotFile = data.previous_snapshot ? 'baseline/snapshot.json' : null
  if (previousSnapshotFile) write(out, previousSnapshotFile, fetch.regularBytes(baselineRoot, fetch.snapshotPath))
  const bundle = {preparation: structuredClone(data), previous_snapshot_file: previousSnapshotFile, baseline_active_file: baselineActiveFile, schema_version: 1, master_commit: data.master_commit, dev_commit: data.dev_commit, navigation: data.navigation,
    baseline_active: data.active, effective_active: effectiveActive, outcomes, referring_tables: [...referringTables].sort()}
  // Refresh the observed source projection before the artifact step freezes it.
  // Effective-success snapshot promotion and cache policy remain the later handoff stage.
  for (const outcome of outcomes) if (outcome.status === 'success') {
    context.sharedInputsByRecordId.set(outcome.record_id, outcome.identity)
    bundle.preparation.inputs[outcome.record_id].identity = outcome.identity
    const observed = candidate.records.find(record => record.record_id === outcome.record_id)
    if (!observed) throw new Error(`Missing observed shared candidate: ${outcome.record_id}`)
    observed.shared_page = outcome.identity
    for (const changed of options.plan?.changed_records || []) if (changed.record_id === outcome.record_id) changed.shared_page = outcome.identity
  }
  context.aliasesByToken = fetch.restoreRouting({...data, active: effectiveActive, effective_routing: true}).aliasesByToken
  const finalNavigation = createGuidesNavigationState(data.records, {routingContext: context})
  candidate.navigation_records = finalNavigation.navigationRecords; candidate.table_digests = finalNavigation.tableDigests
  if (options.plan) options.plan.affected_tables = [...new Set([...(options.plan.affected_tables || []), ...bundle.referring_tables,
    ...selected.map(record => record.base_table_id)])].filter(Boolean).sort()
  const notices = [...imageNotices.values()]
  for (const source of currentSources) for (const link of require('../../packages/docs-tooling/src/lark/canonicalLinkAuditor').extractContentLinks(source)) {
    const active = effectiveActive.pages.find(entry => aliases.matches(entry, link.token))
    if (active && link.anchor && !Object.hasOwn(active.anchors, link.anchor)) notices.push({code: 'SHARED_ANCHOR_UNKNOWN', ...link, page: active.page})
  }
  for (const row of data.navigation.navigationRecords) if (row.placement_type === 'ref' && row.ref_target_anchor) {
    const active = effectiveActive.pages.find(entry => aliases.matches(entry, row.ref_target_token))
    if (active && !Object.hasOwn(active.anchors, row.ref_target_anchor)) notices.push({code: 'SHARED_ANCHOR_UNKNOWN',
      source_record_id: row.record_id, source_table_id: row.table_id, source_slug: row.slug, source_page: row.slug || row.record_id, url: row.ref_target,
      token: row.ref_target_token, anchor: row.ref_target_anchor, page: active.page})
  }
  bundle.notices = notices
  bundle.information = (data.alias_evidence.gaps || []).map(gap => `Alias evidence incomplete for ${gap.record_id}: ${gap.message}`)
  for (const line of bundle.information) console.info(`[shared-aliases] ${line}`)
  // Intern exact common evidence only on disk; callers and receipt identities keep
  // the original logical shape. All consumers decode before authenticating it.
  const {encodeBundle, decodeBundle, checkBundleLimits} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
  const wire = encodeBundle(bundle)
  write(out, 'bundle.json', JSON.stringify(wire) + '\n')
  const files = checkBundleLimits(out)
  decodeBundle(wire, files.filter(entry => entry.file !== 'bundle.json').reduce((sum, entry) => sum + fs.statSync(entry.full).size, 0))
  return bundle
}
async function main(argv, dependencies = {}) {
  const options = Object.fromEntries(argv.reduce((pairs, arg, index) => arg.startsWith('--') ? [...pairs, [arg.slice(2), argv[index + 1]]] : pairs, []))
  const preparationFile = options.preparation
  if (!preparationFile || !fs.existsSync(preparationFile)) return
  const preparation = JSON.parse(fs.readFileSync(preparationFile, 'utf8'))
  if (options.operation === 'prepare-upstream') {
    if (!Object.keys(preparation.inputs).length) return
    prepareUpstream({repository: options.upstream, track: options.track, out: options.repo, statusFile: options['upstream-status']})
    return
  }
  if (options.operation === 'tracking') {
    if (!Object.keys(preparation.inputs).length) return
    const {parseSourceConfig} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/core/config.ts'))
    const source = parseSourceConfig(fetch.regularBytes(options.workspace, `${sharedRoot}/source.yaml`).toString(), {channel: 'both'})
    if ('errors' in source) return
    process.stdout.write(source.config.track); return
  }
  const Scraper = require('../../packages/docs-tooling/src/lark/larkDocScraper')
  const scraper = new Scraper(options['root-token'], 'headings:*', 'wiki', options['source-dir'])
  const candidate = JSON.parse(fs.readFileSync(options.snapshot, 'utf8'))
  const plan = options.plan ? JSON.parse(fs.readFileSync(options.plan, 'utf8')) : null
  const upstreamStatus = options['upstream-status'] && fs.existsSync(options['upstream-status']) ? JSON.parse(fs.readFileSync(options['upstream-status'], 'utf8')) : null
  const bundle = await generateSharedSources({preparation, upstreamStatus, repositoryRoot: options.workspace, baselineRoot: options.baseline,
    repo: options.repo, sourceDir: options['source-dir'], candidate, plan, rootToken: options['root-token'],
    out: options.out, scratch: options.scratch, runId: options['run-id'], imageTimeout: Number(options['image-timeout'] || 120), imageBaseUrl: process.env.IMAGE_BED_URL},
  {fetchOld: token => fetch.fetchActivationHeadings(scraper, token, preparation.previous_snapshot?.records?.find(record => record.doc_token === token)?.doc_link), ...dependencies})
  if (bundle) {
    fs.writeFileSync(options.snapshot, JSON.stringify(candidate, null, 2) + '\n')
    if (options.plan) fs.writeFileSync(options.plan, JSON.stringify(plan, null, 2) + '\n')
  }
}
if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(error.stack); process.exitCode = 1 })
module.exports = {prepareUpstream, lockedInventory, generateSharedSources, readCurrentSources, receiptDraft, receiptNotes, baselineFallback, baselinePublicationPaths, main}
