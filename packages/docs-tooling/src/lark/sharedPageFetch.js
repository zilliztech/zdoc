'use strict'

// Source-job adapters only. The core handoff model remains free of Git/Feishu I/O.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const {loadTypeScript} = require('../../../../scripts/lib/load-typescript')
const routing = require('./sharedPageRouting')
const {createGuidesNavigationState} = require('./sourceSnapshot')
const {extractContentLinks} = require('./canonicalLinkAuditor')
const {guidesCanonicalIsPublishable, guidesRecordPublishTargets, guidesRecordChannel} = require('./guidesBaseRecordSemantics')
const Writer = require('./larkDocWriter')
const aliases = require('./sharedPageAliases')
const SourceIndex = require('./larkSourceIndex')
const {resolveManualPublication} = loadTypeScript(path.resolve(__dirname, '../manuals/registry.ts'))
const {analysisMarkdown} = loadTypeScript(path.resolve(__dirname, '../shared-docs/core/links/anchors.ts'))
const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
function git(root, args, options = {}) {
  return execFileSync('git', ['--no-replace-objects', '-C', root, ...args], {maxBuffer: 256 * 1024 * 1024,
    env: {...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0'}, ...options})
}
function pinnedCommit(root, commit) {
  if (typeof commit !== 'string' || !/^[a-f0-9]{40}$/.test(commit)) throw new Error('A full pinned commit is required')
  if (git(root, ['rev-parse', '--verify', 'HEAD^{commit}']).toString().trim() !== commit) throw new Error('Pinned checkout HEAD mismatch')
}
/** Hash the actual immutable blob bytes in one bounded Git batch, not filenames or synthetic digests. */
function gitInventory(root, commit, paths) {
  const entries = git(root, ['ls-tree', '-r', '-z', commit, '--', ...paths]).toString().split('\0').filter(Boolean).map(line => {
    const match = /^(\d+) blob ([a-f0-9]{40})\t(.+)$/.exec(line)
    if (!match || !['100644', '100755'].includes(match[1]) || !routing.safeHandoffPath(match[3])) throw new Error('Unsafe pinned inventory entry')
    return {path: match[3], oid: match[2]}
  })
  if (entries.length > 20000) throw new Error('Pinned inventory exceeds file limit')
  if (!entries.length) return []
  const data = git(root, ['cat-file', '--batch'], {input: entries.map(entry => entry.oid).join('\n') + '\n'})
  let offset = 0
  return entries.map(entry => {
    const end = data.indexOf(10, offset), header = data.subarray(offset, end).toString().split(' '), size = Number(header[2])
    if (header[0] !== entry.oid || header[1] !== 'blob' || !Number.isSafeInteger(size) || size < 0 || size > 32 * 1024 * 1024) throw new Error('Invalid pinned blob')
    const bytes = data.subarray(end + 1, end + 1 + size)
    if (bytes.length !== size) throw new Error('Truncated pinned blob')
    offset = end + 1 + size + 1
    return {path: entry.path, sha256: digest(bytes), size}
  })
}
function regularBytes(root, relative) {
  if (!routing.safeHandoffPath(relative)) throw new Error('Unsafe input path')
  let current = root
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink input: ${relative}`)
  }
  if (!fs.statSync(current).isFile()) throw new Error(`Not a regular input: ${relative}`)
  return fs.readFileSync(current)
}
function assertInventory(root, inventory) {
  for (const file of inventory) if (digest(regularBytes(root, file.path)) !== file.sha256) throw new Error(`Pinned input drift: ${file.path}`)
}
function prepareSharedSources({records, repositoryRoot, baselineRoot, masterCommit, devCommit, sourceDir, rootToken, site = 'en'}) {
  if (site !== 'en') return null
  pinnedCommit(repositoryRoot, masterCommit); pinnedCommit(baselineRoot, devCommit)
  const active = routing.readActiveState(baselineRoot) || {schema_version: 1, pages: []}
  const previousSnapshot = fs.existsSync(path.join(baselineRoot, snapshotPath)) ? JSON.parse(regularBytes(baselineRoot, snapshotPath)) : null
  const links = records.map(routing.recordLink)
  const availablePages = routing.pinnedSharedPages(repositoryRoot, masterCommit, links)
  const recordIds = records.filter(record => guidesCanonicalIsPublishable(record) && routing.classifySourceRoute(routing.recordLink(record), {availablePages}).kind === 'shared-page').map(record => record.record_id)
  const aliasEvidence = recordIds.length ? aliases.collect({baselineRoot, devCommit, active, previousSnapshot, sourceDir, repositoryRoot, rootToken, recordIds, git, regularBytes}) : undefined
  const recovered = recordIds.length ? aliases.recover({active, previousSnapshot, evidence: aliasEvidence, recordIds}) : {active, aliases: {}}
  const context = routing.createRoutingContext({records, availablePages, active: recovered.active, previousSnapshot})
  aliases.index(context, recovered.aliases)
  // Removing or demoting an activated row would otherwise drop its output while the
  // published receipt still expects it. Retirement belongs to WP14; until then fail
  // the run with a named error, like a revert to Feishu.
  for (const entry of active.pages) {
    const record = records.find(row => row.record_id === entry.record)
    if (!record || !guidesCanonicalIsPublishable(record)) {
      throw Object.assign(new Error(`OWNERSHIP_REVERTED: activated record ${entry.record} (page ${entry.page}) was removed from Base or is no longer a publishable canonical row; restore it until retirement is supported`),
        {code: 'OWNERSHIP_REVERTED', record_id: entry.record})
    }
  }
  const selected = records.filter(record => guidesCanonicalIsPublishable(record) && context.routesByRecordId.get(record.record_id)?.kind === 'shared-page')
  // No config parser, output file or changed legacy payload for an unselected group.
  if (!selected.length && !context.errors.length) return null
  const navigation = createGuidesNavigationState(records, {routingContext: context})
  const devFiles = gitInventory(baselineRoot, devCommit, ['content/en/guides', 'content/en/byoc', snapshotPath, 'generated/en/manifests/shared-pages/guides'])
  assertInventory(baselineRoot, devFiles)
  if (git(baselineRoot, ['status', '--porcelain=v1', '--untracked-files=all', '--', 'content/en/guides', 'content/en/byoc', snapshotPath, 'generated/en/manifests/shared-pages/guides']).length) throw new Error('Immutable dev inventory is dirty')
  const inputs = {}
  for (const record of selected) {
    const route = context.routesByRecordId.get(record.record_id)
    const files = gitInventory(repositoryRoot, masterCommit, ['shared-docs/guides'])
    assertInventory(repositoryRoot, files)
    const evidence = {master_commit: masterCommit, dev_commit: devCommit, files, dev_files: devFiles, navigation}
    const identity = {group: 'guides', page: route.page, inputs_sha256: digest(JSON.stringify(evidence)), record: routing.sharedReceiptPath('guides', route.page)}
    context.sharedInputsByRecordId.set(record.record_id, identity)
    inputs[record.record_id] = {identity, evidence}
  }
  return {context, data: {schema_version: 1, master_commit: masterCommit, dev_commit: devCommit, records, active, alias_evidence: aliasEvidence, previous_snapshot: previousSnapshot,
    available_pages: availablePages, navigation, dev_files: devFiles, inputs, errors: context.errors}}
}
function pendingSourceSnapshot(candidate, context) {
  const records = candidate.records.filter(record => {
    if (record.source_kind !== 'shared-page') return true
    routing.validateSharedSnapshotRecord(record)
    const identity = context?.sharedInputsByRecordId.get(record.record_id)
    const route = context?.routesByRecordId.get(record.record_id)
    if (!identity || route?.kind !== 'shared-page' || JSON.stringify(identity) !== JSON.stringify(record.shared_page)) {
      throw new Error('Unauthenticated pending shared source')
    }
    return false
  })
  return {...candidate, records}
}
function restoreRouting(data) {
  const recovered = data.effective_routing ? {active: data.active, aliases: {}} : aliases.recover({active: data.active, previousSnapshot: data.previous_snapshot, evidence: data.alias_evidence, recordIds: Object.keys(data.inputs)})
  const context = routing.createRoutingContext({records: data.records, active: recovered.active, previousSnapshot: data.previous_snapshot,
    availablePages: data.available_pages, sharedInputsByRecordId: new Map(Object.entries(data.inputs).map(([id, input]) => [id, input.identity]))})
  aliases.index(context, recovered.aliases)
  return context
}
async function initializeSharedScraper(scraper, options) {
  if (options.site !== 'en') return null
  if (!scraper.records) await scraper.__base({progressLabel: '[shared-routes] Base scan'})
  const prepared = prepareSharedSources({...options, rootToken: options.rootToken || scraper.root, records: scraper.records})
  if (!prepared) {
    if (options.output && fs.existsSync(options.output)) {
      if (!fs.lstatSync(options.output).isFile() || fs.lstatSync(options.output).isSymbolicLink()) throw new Error('Unsafe stale preparation file')
      fs.unlinkSync(options.output)
    }
    return null
  }
  scraper.routingContext = prepared.context
  if (options.output) {
    fs.mkdirSync(path.dirname(options.output), {recursive: true})
    fs.writeFileSync(options.output, JSON.stringify(prepared.data, null, 2) + '\n')
  }
  return prepared
}
function writerAdapter(sourceDir, rootToken, manual) {
  // These read-only methods do not need downloader clients, tokens or filesystem writes.
  const writer = Object.create(Writer.prototype)
  Object.assign(writer, {docSourceDir: sourceDir, root_token: rootToken, sidebarOutputDir: resolveManualPublication(manual, 'en').publication.outputDir,
    targets: [resolveManualPublication(manual, 'en').publication.generatorTarget], sourceIndex: SourceIndex.load(sourceDir),
    block_types: Writer.prototype.__block_types(), linkReplacementShim: null, page_blocks: [], blocks: []})
  return writer
}
function planFetchTargets({record, sourceDir, baselineRoot, rootToken, page, navigation, previousSnapshot}) {
  const index = SourceIndex.load(sourceDir)
  // During first activation the record's legacy docx source stays cached beside
  // the new shared source while the old Feishu document must remain readable;
  // the record-id lookup resolves to the shared projection of the record.
  const source = index.find('base_record_id', record.record_id, {where: source => source.source_kind === 'shared-page'})
  if (!source || source.slug !== page) throw new Error(`CONFIG_PATH_UNKNOWN: Base slug does not match ${page}`)
  const parent = index.find('node_token', source.parent_node_token)
  const position = (parent.children || []).filter(child => child && child.obj_type !== 'bitable').findIndex(child => child.node_token === source.node_token) + 1
  if (!position) throw new Error('CONFIG_PATH_UNKNOWN: current Base sibling position is absent')
  const nav = navigation.navigationRecords.find(row => row.record_id === record.record_id)
  const selectedTargets = guidesRecordPublishTargets(record)
  return ['guides', 'guides-byoc'].map(manual => {
    if (!selectedTargets.includes(resolveManualPublication(manual, 'en').publication.generatorTarget)) throw new Error(`CONFIG_PATH_UNKNOWN: current Base excludes ${manual}`)
    const writer = writerAdapter(sourceDir, rootToken, manual)
    const relative = writer.__doc_id_for_token(source.node_token, resolveManualPublication(manual, 'en').publication.contentRoot)
    if (!routing.safeHandoffPath(relative)) throw new Error('CONFIG_PATH_UNKNOWN: unsafe writer output')
    const root = `content/en/${manual === 'guides' ? 'guides' : 'byoc'}`
    const existing = ['.md', '.mdx'].filter(extension => fs.existsSync(path.join(baselineRoot, root, relative + extension)))
    if (existing.length > 1) throw new Error('CONFIG_PATH_UNKNOWN: ambiguous physical extension')
    const retained = (previousSnapshot?.records?.find(entry => entry.record_id === record.record_id)?.output_paths || [])
      .filter(file => typeof file === 'string' && file.startsWith(`${root}/`) && /\.mdx?$/.test(file))
    if (retained.length > 1) throw new Error('CONFIG_PATH_UNKNOWN: ambiguous retained output')
    const extension = retained.length ? path.extname(retained[0]) : existing[0] || '.mdx'
    return {manual, path: relative, extension, navigation: {sidebar_label: nav.labels || nav.title, sidebar_position: position}, channel: guidesRecordChannel(record)}
  })
}
async function fetchActivationHeadings(scraper, token, oldLink = null) {
  const node = await scraper.fetch_wiki_node(token, scraper.__wiki_obj_type_from_link(oldLink))
  if (node.obj_type !== 'docx') throw new Error('Old document is not docx')
  const document = await scraper.fetch_docx_metadata(node.obj_token)
  const result = {}
  // Reuse revision-pinned, paginated reads, without body materialization or sheet/media hydration.
  await scraper.__fetch_block_pages(result, node.obj_token, document.revision_id)
  return {blocks: {items: result.blocks.items.filter(block => /^heading\d+$/.test(scraperHeadingType(block)))}}
}
function scraperHeadingType(block) { return Writer.prototype.__block_types()[block.block_type - 1] }
async function activationDraft({record, page, active, previousSnapshot, currentSources, navigation, pages, sourceDir, rootToken, fetchOld, runId, recoveredAliases}) {
  const existing = active.pages.find(entry => entry.record === record.record_id)
  const old = previousSnapshot?.records?.find(entry => entry.record_id === record.record_id)
  const token = existing?.feishu_token ?? (old?.doc_token || old?.node_token || null)
  const allAliases = [...new Set([...(recoveredAliases || aliases.tokens(old?.source_kind === 'shared-page' ? null : old)), ...aliases.activeTokens(existing), ...(token ? [token] : [])])].sort()
  const references = allAliases.length ? [
    ...currentSources.flatMap(extractContentLinks).filter(link => allAliases.includes(link.token)),
    ...(navigation?.navigationRecords || []).filter(row => row.placement_type === 'ref' && allAliases.includes(row.ref_target_token))
      .map(row => ({token: row.ref_target_token, anchor: row.ref_target_anchor, source_record_id: row.record_id, source_table_id: row.table_id,
        source_slug: row.slug, url: row.ref_target, location: 'Ref Target Doc'})),
  ] : []
  if (existing) return {entry: {...existing, feishu_aliases: allAliases}, firstActivation: false, references}
  try {
    const headings = token && references.some(reference => reference.anchor) ? await fetchOld(token) : null
    const anchors = {}
    for (const reference of references) {
      if (!reference.anchor) continue
      const block = headings?.blocks?.items?.find(block => block.block_id === reference.anchor)
      const type = block && scraperHeadingType(block)
      if (!type || !/^heading\d+$/.test(type)) throw new Error(`Missing current heading block ${reference.anchor}`)
      let matched
      for (const output of pages) {
        const writer = writerAdapter(sourceDir, rootToken, output.manual)
        // The writer repairs trailing standalone anchors and strips heading emphasis.
        // It mutates text runs during repair, so each manual gets isolated evidence.
        const heading = await writer.__heading(structuredClone(block[type]), Number(type.slice('heading'.length)))
        const anchor = writer.__heading_slug(heading.replace(/^#{1,9}\s+/, ''))
        const emitted = [...analysisMarkdown(output.mdx).matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => writer.__heading_slug(writer.__clean_headings(match[1])))
        if (!anchor || !emitted.includes(anchor)) throw new Error(`Missing Git anchor ${anchor} in ${output.manual}`)
        if (matched && matched !== anchor) throw new Error('Manual heading anchors disagree')
        matched = anchor
      }
      anchors[reference.anchor] = matched
    }
    return {entry: {page, record: record.record_id, feishu_token: token, feishu_aliases: allAliases, anchors, activated_in: String(runId)}, firstActivation: true, references}
  } catch (error) {
    throw Object.assign(new Error(`ACTIVATE_CHECK_FAILED: ${error.message}`), {code: 'ACTIVATE_CHECK_FAILED', detail: {old_token: token, links: references, reason: error.message}})
  }
}
module.exports = {digest, gitInventory, regularBytes, assertInventory, pinnedCommit, prepareSharedSources, restoreRouting, initializeSharedScraper, writerAdapter,
  planFetchTargets, activationDraft, fetchActivationHeadings, snapshotPath, git, pendingSourceSnapshot}
