#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const localized = require('../../packages/docs-tooling/src/lark/localizedPageRouting')
const { guidesRecordChannel } = require('../../packages/docs-tooling/src/lark/guidesBaseRecordSemantics')
const { hashSnapshot } = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const { promoteCandidateSnapshot, writeSnapshot } = require('../../packages/docs-tooling/src/lark/sourceSnapshot')

const LOCALIZED_BUNDLE_ROOT = localized.LOCALIZED_GUIDES_BUNDLE_ROOT
const LOCALIZED_MANIFEST_DIR = localized.LOCALIZED_GUIDES_MANIFEST_DIR
const LOCALIZED_ACTIVE_PATH = localized.localizedActiveStatePath('zh-CN', 'guides')
const LOCALIZED_EFFECTIVE_SNAPSHOT = 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-effective.json'
const LOCALIZED_PUBLICATION_AUTHORITY = `${LOCALIZED_MANIFEST_DIR}/_publication.json`

const BUNDLE_FILE_LIMIT = 16 * 1024 * 1024
const BUNDLE_TOTAL_LIMIT = 128 * 1024 * 1024

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function plain(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return plain(value[0])
  if (typeof value === 'object') return plain(value.text ?? value.name ?? value.value ?? value.link ?? value.url)
  return String(value).trim()
}

function safeWriteExclusive(root, relativePath, bytes) {
  if (!localized.safeHandoffPath(relativePath)) {
    throw new Error(`Unsafe localized handoff write path: ${relativePath}`)
  }
  const resolvedRoot = path.resolve(root)
  const target = path.resolve(resolvedRoot, relativePath)
  if (!target.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Localized write escapes root: ${relativePath}`)
  }
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes, { flag: 'wx' })
}

function safeWriteAtomic(root, relativePath, bytes) {
  if (!localized.safeHandoffPath(relativePath)) {
    throw new Error(`Unsafe localized workspace path: ${relativePath}`)
  }
  const resolvedRoot = path.resolve(root)
  if (fs.lstatSync(resolvedRoot).isSymbolicLink()) {
    throw new Error(`Localized workspace root must not be a symlink: ${resolvedRoot}`)
  }
  const target = path.resolve(resolvedRoot, relativePath)
  if (!target.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Localized write escapes workspace: ${relativePath}`)
  }
  let current = resolvedRoot
  for (const segment of path.posix.dirname(relativePath).split('/').filter(segment => segment && segment !== '.')) {
    current = path.join(current, segment)
    if (fs.existsSync(current)) {
      const stat = fs.lstatSync(current)
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        throw new Error(`Localized write parent must be a real directory: ${current}`)
      }
    } else {
      fs.mkdirSync(current)
    }
  }
  if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) {
    throw new Error(`Localized write destination must not be a symlink: ${relativePath}`)
  }
  const temp = `${target}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  fs.writeFileSync(temp, bytes, { flag: 'wx' })
  fs.renameSync(temp, target)
}

function readRegularBytes(root, relativePath) {
  if (!localized.safeHandoffPath(relativePath)) {
    throw new Error(`Unsafe localized read path: ${relativePath}`)
  }
  const resolvedRoot = path.resolve(root)
  if (fs.lstatSync(resolvedRoot).isSymbolicLink()) {
    throw new Error(`Localized root must not be a symlink: ${resolvedRoot}`)
  }
  const target = path.resolve(resolvedRoot, relativePath)
  if (!target.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Localized read escapes root: ${relativePath}`)
  }
  let current = resolvedRoot
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment)
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink()) {
      throw new Error(`Localized path must not traverse symlinks: ${relativePath}`)
    }
  }
  const stat = fs.lstatSync(target)
  if (!stat.isFile()) {
    throw new Error(`Localized path must be a regular file: ${relativePath}`)
  }
  return fs.readFileSync(target)
}

function ensureEmptyOutputDir(dir) {
  const resolved = path.resolve(dir)
  for (let current = resolved; ; current = path.dirname(current)) {
    if (fs.existsSync(current)) {
      const stat = fs.lstatSync(current)
      if (stat.isSymbolicLink() || !stat.isDirectory()) {
        throw new Error(`Unsafe localized bundle output directory: ${dir}`)
      }
    }
    if (path.dirname(current) === current) break
  }
  if (fs.existsSync(resolved) && fs.readdirSync(resolved).length > 0) {
    throw new Error(`Localized bundle output directory must be empty: ${dir}`)
  }
}

function safeSlugKey(pageUrl) {
  return sha256(pageUrl).slice(0, 16)
}

function extractNavigationFromRecord(record, pageUrl) {
  const fields = record?.fields || {}
  const nav = {}
  const labels = plain(fields.Labels)
  const slugField = plain(fields.Slug)
  const titleField = plain(fields.Title)
  const descField = plain(fields.Description)
  const beta = plain(fields.Beta)
  const addedSince = plain(fields['Added Since'] ?? fields.added_since)
  const lastModified = plain(fields['Last Modified'] ?? fields.last_modified)
  const deprecateSince = plain(fields['Deprecate Since'] ?? fields.deprecate_since)
  const notebookRaw = fields.Notebook ?? fields.notebook
  const customEditUrl = plain(fields['Custom Edit URL'] ?? fields.custom_edit_url)
  const orderRaw = plain(fields['Sidebar Order'] ?? fields['Nav Order'] ?? fields.Order)

  if (labels) nav.sidebar_label = labels
  if (slugField) {
    nav.slug = slugField.startsWith('/') ? slugField : `/${slugField}`
  } else {
    const tail = pageUrl.split('/').at(-1)
    if (tail) nav.slug = `/${tail}`
  }
  if (titleField) nav.title = titleField
  if (descField) nav.description = descField
  if (beta) nav.beta = beta
  if (addedSince) nav.added_since = addedSince
  if (lastModified) nav.last_modified = lastModified
  if (deprecateSince) nav.deprecate_since = deprecateSince
  if (typeof notebookRaw === 'boolean') nav.notebook = notebookRaw
  if (customEditUrl) nav.custom_edit_url = customEditUrl
  if (orderRaw !== '' && Number.isFinite(Number(orderRaw))) {
    nav.sidebar_position = Number(orderRaw)
  } else if (Number.isFinite(Number(record?.base_record_index))) {
    nav.sidebar_position = Number(record.base_record_index) + 1
  }
  return nav
}

function resolvePromoteForPage(options, pageUrl, page) {
  const byUrl = options.promoteByPageUrl
  if (byUrl instanceof Map && byUrl.has(pageUrl)) return byUrl.get(pageUrl)
  if (byUrl && typeof byUrl === 'object' && Object.hasOwn(byUrl, pageUrl)) return byUrl[pageUrl]
  const byPage = options.promoteByPage
  if (byPage instanceof Map && byPage.has(page)) return byPage.get(page)
  if (byPage && typeof byPage === 'object' && Object.hasOwn(byPage, page)) return byPage[page]
  return null
}

/**
 * Resolves exact baseline fallback artifacts by `page_url` (NEVER by `record_id`).
 * Preserves last verified `dev` MDX output and receipt verbatim.
 */
function stageBaselineFallbackByPageUrl({ pageUrl, baselineRoot, baselineActive, previousSnapshot, out }) {
  const activeEntry = baselineActive?.pages?.find(entry => entry.page_url === pageUrl) || null
  const key = safeSlugKey(pageUrl)
  let output = null
  let receipt = null

  if (activeEntry) {
    const receiptRel = localized.localizedReceiptPath('zh-CN', 'guides', activeEntry.page)
    const receiptBytes = readRegularBytes(baselineRoot, receiptRel)
    const parsedReceipt = localized.validateLocalizedReceipt(JSON.parse(receiptBytes.toString('utf8')), {
      locale: 'zh-CN',
      group: 'guides',
      page: activeEntry.page,
      page_url: pageUrl,
    })
    const outputRel = parsedReceipt.output.path
    const outputBytes = readRegularBytes(baselineRoot, outputRel)
    if (sha256(outputBytes) !== parsedReceipt.output.sha256) {
      throw new Error(`Baseline fallback output digest mismatch for "${pageUrl}" (${outputRel})`)
    }
    const stagedOutputFile = `fallback/${key}/output${path.posix.extname(outputRel) || '.md'}`
    const stagedReceiptFile = `fallback/${key}/receipt.json`
    safeWriteExclusive(out, stagedOutputFile, outputBytes)
    safeWriteExclusive(out, stagedReceiptFile, receiptBytes)
    output = { path: outputRel, file: stagedOutputFile, sha256: parsedReceipt.output.sha256 }
    receipt = { path: receiptRel, file: stagedReceiptFile, sha256: sha256(receiptBytes) }
    return { output, receipt, active: activeEntry }
  }

  // Pre-activation fallback: if a previous Feishu snapshot record existed for this page_url,
  // retain its output path from baseline if safely inside content/zh-CN/guides/.
  const prevRecord = (previousSnapshot?.records || []).find(row => {
    const rowUrl = row.localized_page?.page_url || row.page_url || localized.recordPageUrl(row)
    return rowUrl === pageUrl
  })
  const prevOutputPath = (prevRecord?.output_paths || []).find(p => localized.isAllowedLocalizedGuidesOutputPath(p))
  if (prevOutputPath && fs.existsSync(path.join(baselineRoot, prevOutputPath))) {
    const outputBytes = readRegularBytes(baselineRoot, prevOutputPath)
    const stagedOutputFile = `fallback/${key}/output${path.posix.extname(prevOutputPath) || '.md'}`
    safeWriteExclusive(out, stagedOutputFile, outputBytes)
    output = { path: prevOutputPath, file: stagedOutputFile, sha256: sha256(outputBytes) }
  }
  return { output, receipt, active: null }
}

function sourceFilesEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
  const a = [...left].sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0))
  const b = [...right].sort((x, y) => (x.path < y.path ? -1 : x.path > y.path ? 1 : 0))
  return a.every((item, idx) => item.path === b[idx].path && item.sha256 === b[idx].sha256)
}

/**
 * Generates localized Chinese Guides sources strictly from pinned `masterCommit` + `devCommit`.
 * Cleanly exits with `null` (emitting no bundle directory) when there are zero localized pages
 * and zero active localized pages.
 */
async function generateLocalizedSources(options) {
  const {
    records = [],
    repositoryRoot,
    baselineRoot,
    masterCommit,
    devCommit,
    candidate = null,
    previousSnapshot = null,
    out,
    runId,
    imageBaseUrl = localized.DEFAULT_ZH_CN_IMAGE_BASE_URL,
    outputExtension = '.md',
  } = options

  localized.assertPinnedCommitExists(repositoryRoot, masterCommit, 'master_commit')
  localized.assertPinnedCommitExists(baselineRoot, devCommit, 'dev_commit')
  if (typeof runId !== 'string' || !runId.trim() || /[\s\x00-\x1f\x7f]/.test(runId)) {
    throw new Error('A non-empty Fetch runId without whitespace is required')
  }

  const baselineActive = localized.readLocalizedActiveState(baselineRoot)
  const links = records.map(record => localized.recordLink(record)).filter(Boolean)
  const availablePages = localized.pinnedLocalizedPages(repositoryRoot, masterCommit, links)

  const routingContext = localized.createLocalizedRoutingContext({
    site: 'zh-CN',
    records,
    availablePages,
    active: baselineActive,
    previousSnapshot,
  })

  const localizedUrls = [...routingContext.routesByPageUrl.entries()]
    .filter(([, route]) => route.kind === 'localized-page')
    .map(([pageUrl]) => pageUrl)
    .sort((a, b) => a.localeCompare(b))

  const activeEntries = baselineActive?.pages || []
  const missingActiveEntries = activeEntries.filter(entry => !routingContext.recordsByPageUrl.has(entry.page_url))

  const relevantErrors = routingContext.errors.filter(error => {
    const docLink = routingContext.inspectedDocsByPageUrl.get(error.page_url) || ''
    return (
      localized.isLocalizedDocsUrl(docLink) ||
      localized.isSharedDocsUrl(docLink) ||
      routingContext.activePageUrls.has(error.page_url)
    )
  })

  // Clean no-op when no localized-page records, no active localized pages, and no localized errors exist.
  if (localizedUrls.length === 0 && activeEntries.length === 0 && relevantErrors.length === 0) {
    return null
  }

  ensureEmptyOutputDir(out)
  fs.mkdirSync(path.resolve(out), { recursive: true })

  const rawRecordsByPageUrl = new Map()
  for (const record of records) {
    const url = localized.recordPageUrl(record)
    if (url && !rawRecordsByPageUrl.has(url)) {
      rawRecordsByPageUrl.set(url, record)
    }
  }

  const nextActiveByUrl = new Map()
  for (const entry of activeEntries) {
    nextActiveByUrl.set(entry.page_url, structuredClone(entry))
  }

  const outcomes = []
  const updatedIdentitiesByPageUrl = new Map()

  for (const pageUrl of localizedUrls) {
    const route = routingContext.routesByPageUrl.get(pageUrl)
    const rawRecord = rawRecordsByPageUrl.get(pageUrl) || {}
    const recordId = rawRecord.record_id ?? null
    const page = route.page
    const channel = guidesRecordChannel(rawRecord)
    const receiptChannel = channel === 'current' ? null : channel
    const navigation = extractNavigationFromRecord(rawRecord, pageUrl)
    const navigationDigest = localized.computeLocalizedNavigationDigest({ pageUrl, channel, navigation })
    const promote = resolvePromoteForPage(options, pageUrl, page)
    const activeEntry = routingContext.activeByPageUrl.get(pageUrl) || null

    try {
      const pinnedDigests = localized.computePinnedLocalizedInputDigests(repositoryRoot, masterCommit, page)
      const cacheIdentity = localized.computeLocalizedCacheIdentity({
        page,
        pageUrl,
        sourceFiles: pinnedDigests.source_files,
        navigationDigest,
        channel: receiptChannel,
        imageBaseUrl,
        promoteExpectedEnNextSha: promote?.expectedEnNextSha ?? null,
      })

      // Check zero-drift reuse by `page_url` (immune to Feishu `record_id` changes!).
      let reused = null
      if (activeEntry && activeEntry.page === page && !promote) {
        try {
          const prevReceipt = localized.readLocalizedReceipt(baselineRoot, {
            locale: 'zh-CN',
            group: 'guides',
            page,
            page_url: pageUrl,
          })
          const expectedOutputPath = localized.resolveLocalizedGuidesOutputPath(pageUrl, outputExtension)
          if (
            prevReceipt.output.path === expectedOutputPath &&
            prevReceipt.channel === receiptChannel &&
            prevReceipt.inputs.navigation_digest === navigationDigest &&
            prevReceipt.inputs.image_base_url === imageBaseUrl &&
            sourceFilesEqual(prevReceipt.inputs.source_files, pinnedDigests.source_files)
          ) {
            const outputBytes = readRegularBytes(baselineRoot, prevReceipt.output.path)
            if (sha256(outputBytes) === prevReceipt.output.sha256) {
              const receiptRel = localized.localizedReceiptPath('zh-CN', 'guides', page)
              const receiptBytes = readRegularBytes(baselineRoot, receiptRel)
              const stagedOutputFile = `reused/${page}/output${path.posix.extname(prevReceipt.output.path) || '.md'}`
              const stagedReceiptFile = `reused/${page}/receipt.json`
              safeWriteExclusive(out, stagedOutputFile, outputBytes)
              safeWriteExclusive(out, stagedReceiptFile, receiptBytes)
              reused = {
                output: { path: prevReceipt.output.path, file: stagedOutputFile, sha256: prevReceipt.output.sha256 },
                receipt: { path: receiptRel, file: stagedReceiptFile, sha256: sha256(receiptBytes) },
                receiptObject: prevReceipt,
              }
            }
          }
        } catch {
          // Any doubt falls through cleanly to a fresh pinned build.
          reused = null
        }
      }

      if (reused) {
        const nextEntry = {
          ...activeEntry,
          ...(recordId !== null ? { last_seen_record_id: recordId } : {}),
        }
        nextActiveByUrl.set(pageUrl, nextEntry)
        updatedIdentitiesByPageUrl.set(pageUrl, cacheIdentity)
        outcomes.push({
          status: 'reused',
          page,
          page_url: pageUrl,
          record_id: recordId,
          identity: cacheIdentity,
          output: reused.output,
          receipt: reused.receipt,
          promoted: null,
        })
        continue
      }

      const buildResult = await localized.buildLocalizedFetchPage({
        repositoryRoot,
        masterCommit,
        devCommit,
        page,
        pageUrl,
        fetchRunId: String(runId),
        channel,
        navigation,
        imageBaseUrl,
        referenceRecordId: recordId,
        outputExtension,
        promote,
      })

      if (!buildResult.ok) {
        throw Object.assign(new Error(buildResult.message), {
          code: buildResult.code,
          detail: buildResult.errors,
        })
      }

      const outputBytes = Buffer.from(buildResult.mdx, 'utf8')
      const receiptBytes = Buffer.from(`${JSON.stringify(buildResult.receipt, null, 2)}\n`, 'utf8')
      const receiptRel = localized.localizedReceiptPath('zh-CN', 'guides', page)
      const stagedOutputFile = `pages/${page}/output${path.posix.extname(buildResult.outputPath) || '.md'}`
      const stagedReceiptFile = `pages/${page}/receipt-draft.json`

      safeWriteExclusive(out, stagedOutputFile, outputBytes)
      safeWriteExclusive(out, stagedReceiptFile, receiptBytes)

      const fallbackBase = routingContext.getFallbackBaseline(pageUrl)
      const existingToken = activeEntry?.feishu_token
      const primaryToken =
        existingToken !== undefined
          ? existingToken
          : fallbackBase?.doc_token || fallbackBase?.node_token || fallbackBase?.origin_node_token || fallbackBase?.obj_token || null
      const aliasSet = new Set(
        [
          primaryToken,
          ...(activeEntry?.feishu_aliases || []),
          fallbackBase?.doc_token,
          fallbackBase?.node_token,
          fallbackBase?.origin_node_token,
          fallbackBase?.obj_token,
        ].filter(Boolean),
      )

      const nextEntry = localized.validateActiveLocalizedPage({
        page,
        page_url: pageUrl,
        feishu_token: primaryToken,
        ...(aliasSet.size > 0 || activeEntry?.feishu_aliases !== undefined ? { feishu_aliases: [...aliasSet] } : {}),
        anchors: { ...(activeEntry?.anchors || {}) },
        activated_in: activeEntry?.activated_in ?? String(runId),
        ...(recordId !== null ? { last_seen_record_id: recordId } : activeEntry?.last_seen_record_id ? { last_seen_record_id: activeEntry.last_seen_record_id } : {}),
      })
      nextActiveByUrl.set(pageUrl, nextEntry)
      updatedIdentitiesByPageUrl.set(pageUrl, cacheIdentity)

      outcomes.push({
        status: 'success',
        page,
        page_url: pageUrl,
        record_id: recordId,
        identity: cacheIdentity,
        output: { path: buildResult.outputPath, file: stagedOutputFile, sha256: buildResult.outputSha256 },
        receipt: { path: receiptRel, file: stagedReceiptFile, sha256: sha256(receiptBytes) },
        promoted: buildResult.promoted,
      })
    } catch (error) {
      const baseline = stageBaselineFallbackByPageUrl({
        pageUrl,
        baselineRoot,
        baselineActive,
        previousSnapshot,
        out,
      })
      if (baseline.active) {
        nextActiveByUrl.set(pageUrl, baseline.active)
      }
      outcomes.push({
        status: 'fallback',
        page,
        page_url: pageUrl,
        record_id: recordId,
        code: error.code || 'LOCALIZED_BUILD_FAILED',
        message: error.message,
        detail: error.detail || null,
        baseline,
      })
    }
  }

  // Handle routing errors (rename, missing pinned page dir, duplicate owner, shared-docs on zh-CN)
  for (const error of relevantErrors) {
    const normalizedUrl = localized.tryNormalizeLocalizedPageUrl(error.page_url) || error.page_url
    if (outcomes.some(item => item.page_url === normalizedUrl)) continue
    const baseline = normalizedUrl
      ? stageBaselineFallbackByPageUrl({
          pageUrl: normalizedUrl,
          baselineRoot,
          baselineActive,
          previousSnapshot,
          out,
        })
      : { output: null, receipt: null, active: null }
    if (baseline.active) {
      nextActiveByUrl.set(normalizedUrl, baseline.active)
    }
    outcomes.push({
      status: 'fallback',
      page: baseline.active?.page ?? null,
      page_url: normalizedUrl,
      record_id: error.record_id ?? null,
      code: error.code,
      message: error.message,
      detail: null,
      baseline,
    })
  }

  // Deletion protection: active localized pages omitted from current Base records are
  // preserved via baseline fallback rather than silently dropped!
  for (const missingActive of missingActiveEntries) {
    const pageUrl = missingActive.page_url
    if (outcomes.some(item => item.page_url === pageUrl)) continue
    const baseline = stageBaselineFallbackByPageUrl({
      pageUrl,
      baselineRoot,
      baselineActive,
      previousSnapshot,
      out,
    })
    nextActiveByUrl.set(pageUrl, missingActive)
    outcomes.push({
      status: 'fallback',
      page: missingActive.page,
      page_url: pageUrl,
      record_id: missingActive.last_seen_record_id ?? null,
      code: 'OWNERSHIP_DELETION_PROTECTED',
      message: `Active localized page "${missingActive.page}" (${pageUrl}) is missing from Base records; preserving last verified dev output`,
      detail: null,
      baseline,
    })
  }

  const effectiveActive = localized.validateActiveLocalizedRegistry({
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    pages: [...nextActiveByUrl.values()].sort((a, b) => a.page.localeCompare(b.page)),
  })

  const hasFallback = outcomes.some(item => item.status === 'fallback')

  // Refresh candidate snapshot records with updated localized page identities
  if (candidate && Array.isArray(candidate.records)) {
    for (const outcome of outcomes) {
      if (outcome.status !== 'success' && outcome.status !== 'reused') continue
      const match = candidate.records.find(row => {
        const rowUrl = row.localized_page?.page_url || row.page_url || localized.recordPageUrl(row)
        return rowUrl === outcome.page_url
      })
      if (match) {
        match.source_kind = 'localized-page'
        match.doc_token = null
        match.source_file = null
        match.source_hash = null
        match.node_metadata = null
        match.outgoing_tokens = []
        match.page_url = outcome.page_url
        match.localized_page = outcome.identity
        match.output_paths = [outcome.output.path]
      }
    }
  }

  const bundle = {
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    master_commit: masterCommit,
    dev_commit: devCommit,
    run_id: String(runId),
    cache_eligible: !hasFallback,
    baseline_active: baselineActive,
    effective_active: effectiveActive,
    outcomes,
    errors: relevantErrors,
  }

  safeWriteExclusive(out, 'bundle.json', `${JSON.stringify(bundle, null, 2)}\n`)
  return bundle
}

/**
 * Loads and authenticates a localized handoff bundle from disk (or payload map),
 * enforcing SHA binding, checksum integrity, and size/symlink bounds.
 */
function loadLocalizedBundle(bundleRoot, expected = {}) {
  const resolvedRoot = path.resolve(bundleRoot)
  if (fs.lstatSync(resolvedRoot).isSymbolicLink()) {
    throw new Error(`Localized bundle root must not be a symlink: ${resolvedRoot}`)
  }
  const bundleBytes = readRegularBytes(resolvedRoot, 'bundle.json')
  if (bundleBytes.length > BUNDLE_FILE_LIMIT) {
    throw new Error('Localized bundle.json exceeds size limit')
  }
  const bundle = JSON.parse(bundleBytes.toString('utf8'))
  if (bundle.schema_version !== 1 || bundle.locale !== 'zh-CN' || bundle.group !== 'guides') {
    throw new Error('Invalid localized bundle identity')
  }
  if (expected.masterSha && bundle.master_commit !== expected.masterSha) {
    throw new Error(`Localized bundle master SHA mismatch: expected ${expected.masterSha}, got ${bundle.master_commit}`)
  }
  if (expected.devBaselineSha && bundle.dev_commit !== expected.devBaselineSha) {
    throw new Error(`Localized bundle dev baseline SHA mismatch: expected ${expected.devBaselineSha}, got ${bundle.dev_commit}`)
  }
  localized.validateActiveLocalizedRegistry(bundle.effective_active)
  if (bundle.baseline_active !== null) {
    localized.validateActiveLocalizedRegistry(bundle.baseline_active)
  }

  const files = new Map()
  const receiptsByPageUrl = new Map()
  let totalBytes = bundleBytes.length

  const loadRef = (ref, label) => {
    if (!ref) return null
    const bytes = readRegularBytes(resolvedRoot, ref.file)
    if (bytes.length > BUNDLE_FILE_LIMIT || (totalBytes += bytes.length) > BUNDLE_TOTAL_LIMIT) {
      throw new Error(`Localized bundle ${label} exceeds size limit`)
    }
    if (sha256(bytes) !== ref.sha256) {
      throw new Error(`Localized bundle ${label} digest mismatch: ${ref.file}`)
    }
    files.set(ref.file, bytes)
    return bytes
  }

  for (const outcome of bundle.outcomes || []) {
    if (outcome.status === 'success' || outcome.status === 'reused') {
      loadRef(outcome.output, 'output')
      const receiptBytes = loadRef(outcome.receipt, 'receipt')
      const parsedReceipt = localized.validateLocalizedReceipt(JSON.parse(receiptBytes.toString('utf8')), {
        locale: 'zh-CN',
        group: 'guides',
        page: outcome.page,
        page_url: outcome.page_url,
      })
      if (parsedReceipt.output.path !== outcome.output.path || parsedReceipt.output.sha256 !== outcome.output.sha256) {
        throw new Error(`Localized bundle receipt/output mismatch for "${outcome.page}"`)
      }
      receiptsByPageUrl.set(outcome.page_url, parsedReceipt)
    } else if (outcome.status === 'fallback') {
      if (outcome.baseline?.output) {
        loadRef(outcome.baseline.output, 'fallback output')
      }
      if (outcome.baseline?.receipt) {
        const receiptBytes = loadRef(outcome.baseline.receipt, 'fallback receipt')
        const parsedReceipt = localized.validateLocalizedReceipt(JSON.parse(receiptBytes.toString('utf8')), {
          locale: 'zh-CN',
          group: 'guides',
          page: outcome.baseline.active?.page ?? outcome.page,
          page_url: outcome.page_url,
        })
        receiptsByPageUrl.set(outcome.page_url, parsedReceipt)
      }
    } else {
      throw new Error(`Unknown localized bundle outcome status: ${String(outcome.status)}`)
    }
  }

  return { bundle, files, receiptsByPageUrl }
}

/**
 * Validates a localized bundle stored inside a `guides-stage-artifact` payload map.
 */
function validateLocalizedPayload(payloadMap, expected = {}) {
  const bundleKey = `${LOCALIZED_BUNDLE_ROOT}/bundle.json`
  if (!payloadMap.has(bundleKey)) return null
  const bundle = JSON.parse(payloadMap.get(bundleKey).toString('utf8'))
  if (bundle.schema_version !== 1 || bundle.locale !== 'zh-CN' || bundle.group !== 'guides') {
    throw new Error('Invalid localized payload bundle identity')
  }
  if (expected.masterSha && bundle.master_commit !== expected.masterSha) {
    throw new Error('Localized payload master SHA mismatch')
  }
  if (expected.devBaselineSha && bundle.dev_commit !== expected.devBaselineSha) {
    throw new Error('Localized payload dev baseline SHA mismatch')
  }
  localized.validateActiveLocalizedRegistry(bundle.effective_active)

  const checkPayloadRef = (ref, label) => {
    if (!ref) return
    const key = `${LOCALIZED_BUNDLE_ROOT}/${ref.file}`
    const bytes = payloadMap.get(key)
    if (!bytes) throw new Error(`Missing localized payload ${label}: ${key}`)
    if (sha256(bytes) !== ref.sha256) throw new Error(`Localized payload ${label} digest mismatch: ${key}`)
  }

  for (const outcome of bundle.outcomes || []) {
    if (outcome.status === 'success' || outcome.status === 'reused') {
      checkPayloadRef(outcome.output, 'output')
      checkPayloadRef(outcome.receipt, 'receipt')
    } else if (outcome.status === 'fallback') {
      checkPayloadRef(outcome.baseline?.output, 'fallback output')
      checkPayloadRef(outcome.baseline?.receipt, 'fallback receipt')
    }
  }
  return bundle
}

/**
 * Finalizes localized publication inside `workspace`:
 * - Writes succeeded/reused/fallback MDX strictly under `content/zh-CN/guides/...`
 * - Writes validated `<page>.json`, `active.json`, and `_publication.json` under
 *   `generated/zh-CN/manifests/localized-pages/guides/`
 * - Computes and writes `guides-source-snapshot-effective.json` when candidate is given.
 */
function finalizeLocalizedPublication({ workspace, bundleRoot, candidate = null, masterSha = null, devBaselineSha = null }) {
  const resolvedWorkspace = path.resolve(workspace)
  const resolvedBundleRoot = path.resolve(bundleRoot || path.join(resolvedWorkspace, LOCALIZED_BUNDLE_ROOT))
  if (!fs.existsSync(resolvedBundleRoot)) return null

  const loaded = loadLocalizedBundle(resolvedBundleRoot, { masterSha, devBaselineSha })
  const { bundle, files } = loaded

  const outputPaths = []
  const receiptPaths = []

  const assertIsolatedOutputPath = targetPath => {
    if (!localized.isAllowedLocalizedGuidesOutputPath(targetPath)) {
      throw new Error(`Refusing to write localized output outside content/zh-CN/guides/: ${targetPath}`)
    }
    if (
      targetPath === 'content/zh-CN/guides/tutorials/home.md' ||
      targetPath === 'content/zh-CN/guides/tutorials/home.mdx'
    ) {
      throw new Error(`Refusing to overwrite externally owned Chinese Guides home: ${targetPath}`)
    }
  }

  for (const outcome of bundle.outcomes) {
    if (outcome.status === 'success' || outcome.status === 'reused') {
      assertIsolatedOutputPath(outcome.output.path)
      const outputBytes = files.get(outcome.output.file)
      const receiptBytes = files.get(outcome.receipt.file)
      safeWriteAtomic(resolvedWorkspace, outcome.output.path, outputBytes)
      safeWriteAtomic(resolvedWorkspace, outcome.receipt.path, receiptBytes)
      outputPaths.push(outcome.output.path)
      receiptPaths.push(outcome.receipt.path)
    } else if (outcome.status === 'fallback') {
      if (outcome.baseline?.output) {
        assertIsolatedOutputPath(outcome.baseline.output.path)
        const outputBytes = files.get(outcome.baseline.output.file)
        safeWriteAtomic(resolvedWorkspace, outcome.baseline.output.path, outputBytes)
        outputPaths.push(outcome.baseline.output.path)
      }
      if (outcome.baseline?.receipt) {
        const receiptBytes = files.get(outcome.baseline.receipt.file)
        safeWriteAtomic(resolvedWorkspace, outcome.baseline.receipt.path, receiptBytes)
        receiptPaths.push(outcome.baseline.receipt.path)
      }
    }
  }

  const activeBytes = Buffer.from(`${JSON.stringify(bundle.effective_active, null, 2)}\n`, 'utf8')
  safeWriteAtomic(resolvedWorkspace, LOCALIZED_ACTIVE_PATH, activeBytes)

  let effectiveSnapshot = null
  if (candidate) {
    effectiveSnapshot = structuredClone(candidate)
    if (Array.isArray(effectiveSnapshot.records)) {
      const fallbackUrls = new Set(
        bundle.outcomes.filter(item => item.status === 'fallback').map(item => item.page_url),
      )
      effectiveSnapshot.records = effectiveSnapshot.records.filter(row => {
        const rowUrl = row.localized_page?.page_url || row.page_url || localized.recordPageUrl(row)
        if (!fallbackUrls.has(rowUrl)) return true
        // Keep active fallback pages (preserving their baseline active entry); drop failed brand-new pages
        return bundle.effective_active.pages.some(entry => entry.page_url === rowUrl)
      })
    }
    safeWriteAtomic(
      resolvedWorkspace,
      LOCALIZED_EFFECTIVE_SNAPSHOT,
      Buffer.from(`${JSON.stringify(effectiveSnapshot, null, 2)}\n`, 'utf8'),
    )
  }

  const authority = {
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    cache_eligible: bundle.cache_eligible,
    effective_sha256: effectiveSnapshot ? hashSnapshot(effectiveSnapshot) : null,
    pages: bundle.effective_active.pages.map(entry => ({
      page: entry.page,
      page_url: entry.page_url,
      receipt: localized.localizedReceiptPath('zh-CN', 'guides', entry.page),
      output_sha256: loaded.receiptsByPageUrl.get(entry.page_url)?.output?.sha256 ?? null,
    })),
  }
  safeWriteAtomic(
    resolvedWorkspace,
    LOCALIZED_PUBLICATION_AUTHORITY,
    Buffer.from(`${JSON.stringify(authority, null, 2)}\n`, 'utf8'),
  )

  return {
    workspace: resolvedWorkspace,
    activePath: LOCALIZED_ACTIVE_PATH,
    receiptPaths: [...new Set(receiptPaths)].sort(),
    outputPaths: [...new Set(outputPaths)].sort(),
    effectiveSnapshot,
    cacheEligible: bundle.cache_eligible,
    authority,
  }
}

/**
 * Authenticates finalized `active.json`, all `<page>.json` receipts, and written MDX
 * digests in `workspace` (optionally cross-checking against the effective/promoted snapshot).
 */
function validateLocalizedPublication({ workspace, snapshotPath = null }) {
  const resolvedWorkspace = path.resolve(workspace)
  const manifestDir = path.join(resolvedWorkspace, LOCALIZED_MANIFEST_DIR)
  let snapshot = null
  if (snapshotPath) {
    const resolvedSnapshot = path.isAbsolute(snapshotPath)
      ? snapshotPath
      : path.join(resolvedWorkspace, snapshotPath)
    if (fs.existsSync(resolvedSnapshot)) {
      snapshot = JSON.parse(fs.readFileSync(resolvedSnapshot, 'utf8'))
    }
  }
  const hasLocalizedSnapshotRecords = Boolean(
    snapshot?.records?.some(row => row.source_kind === 'localized-page'),
  )
  if (!fs.existsSync(manifestDir) && !hasLocalizedSnapshotRecords) {
    return { valid: true, activeCount: 0, receiptCount: 0 }
  }

  const active = localized.readLocalizedActiveState(resolvedWorkspace)
  if (!active) {
    throw new Error(`Missing localized active state: ${LOCALIZED_ACTIVE_PATH}`)
  }

  const receiptsByPageUrl = new Map()
  for (const entry of active.pages) {
    const receipt = localized.readLocalizedReceipt(resolvedWorkspace, {
      locale: 'zh-CN',
      group: 'guides',
      page: entry.page,
      page_url: entry.page_url,
    })
    const outputBytes = readRegularBytes(resolvedWorkspace, receipt.output.path)
    if (sha256(outputBytes) !== receipt.output.sha256) {
      throw new Error(
        `Localized output digest mismatch for "${entry.page}" (${receipt.output.path}): expected ${receipt.output.sha256}`,
      )
    }
    receiptsByPageUrl.set(entry.page_url, receipt)
  }

  if (snapshot && Array.isArray(snapshot.records)) {
    for (const row of snapshot.records) {
      if (row.source_kind !== 'localized-page') continue
      localized.validateLocalizedSnapshotRecord(row)
      const receipt = receiptsByPageUrl.get(row.localized_page.page_url)
      if (!receipt) {
        throw new Error(`Snapshot localized page "${row.localized_page.page_url}" is missing finalized receipt`)
      }
      if (receipt.page !== row.localized_page.page) {
        throw new Error(`Snapshot localized page ID mismatch for "${row.localized_page.page_url}"`)
      }
    }
  }

  return {
    valid: true,
    activeCount: active.pages.length,
    receiptCount: receiptsByPageUrl.size,
  }
}

/**
 * Validates finalized localized evidence and promotes the effective snapshot cleanly.
 */
function promoteLocalizedSnapshot({ workspace, outputPath, sourceDir, sourceBranch }) {
  const resolvedWorkspace = path.resolve(workspace)
  const effectivePath = path.join(resolvedWorkspace, LOCALIZED_EFFECTIVE_SNAPSHOT)
  if (!fs.existsSync(effectivePath)) return null

  const effective = JSON.parse(fs.readFileSync(effectivePath, 'utf8'))
  const promoted = promoteCandidateSnapshot(effective, {
    manual: 'guides',
    buildEnv: 'uat',
    allowEmptySharedEffective: true,
    sourceDir,
    targetsBuilt: ['zilliz.saas', 'zilliz.paas'],
    sourceBranch,
    publishUrl: 'https://docs.cloud-uat3.zilliz.com.cn',
    linkCheckRemote: 'https://docs.zilliz.com.cn',
  })

  validateLocalizedPublication({ workspace: resolvedWorkspace, snapshotPath: effectivePath })

  const destination = path.isAbsolute(outputPath)
    ? outputPath
    : path.join(resolvedWorkspace, outputPath)
  writeSnapshot(destination, promoted)

  const authorityPath = path.join(resolvedWorkspace, LOCALIZED_PUBLICATION_AUTHORITY)
  if (fs.existsSync(authorityPath)) {
    const authority = JSON.parse(fs.readFileSync(authorityPath, 'utf8'))
    authority.effective_sha256 = hashSnapshot(promoted)
    safeWriteAtomic(
      resolvedWorkspace,
      LOCALIZED_PUBLICATION_AUTHORITY,
      Buffer.from(`${JSON.stringify(authority, null, 2)}\n`, 'utf8'),
    )
  }

  return promoted
}

function parseCliArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i]
    const value = argv[i + 1]
    if (!flag?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid CLI argument near "${String(flag)}"`)
    }
    args[flag.slice(2)] = value
  }
  return args
}

async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv)
  const operation = args.operation || 'generate'
  const workspace = path.resolve(args.workspace || '.')

  if (operation === 'validate') {
    validateLocalizedPublication({
      workspace,
      snapshotPath: args.snapshot || null,
    })
    return
  }

  if (operation === 'finalize') {
    const bundleRoot = args.bundle ? path.resolve(args.bundle) : path.join(workspace, LOCALIZED_BUNDLE_ROOT)
    if (!fs.existsSync(bundleRoot)) return
    const candidate = args.candidate && fs.existsSync(path.resolve(workspace, args.candidate))
      ? JSON.parse(fs.readFileSync(path.resolve(workspace, args.candidate), 'utf8'))
      : null
    finalizeLocalizedPublication({
      workspace,
      bundleRoot,
      candidate,
      masterSha: args['master-sha'] || null,
      devBaselineSha: args['dev-baseline-sha'] || null,
    })
    return
  }

  if (operation === 'promote') {
    promoteLocalizedSnapshot({
      workspace,
      outputPath: args.output,
      sourceDir: args['source-dir'],
      sourceBranch: args['source-branch'],
    })
    return
  }

  if (operation === 'generate') {
    const baselineRoot = path.resolve(args.baseline)
    const masterCommit = args['master-sha'] || process.env.DOCS_TOOLING_SHARED_MASTER_SHA
    const devCommit = args['dev-baseline-sha'] || process.env.DOCS_TOOLING_SHARED_DEV_SHA
    const snapshotFile = args.snapshot ? path.resolve(workspace, args.snapshot) : null
    const candidate = snapshotFile && fs.existsSync(snapshotFile)
      ? JSON.parse(fs.readFileSync(snapshotFile, 'utf8'))
      : null

    let records = []
    if (args.records && fs.existsSync(path.resolve(workspace, args.records))) {
      records = JSON.parse(fs.readFileSync(path.resolve(workspace, args.records), 'utf8'))
    } else if (candidate?.navigation_records) {
      records = candidate.navigation_records.map(nav => ({
        record_id: nav.record_id,
        base_table_id: nav.table_id,
        base_table_name: nav.table_name,
        base_record_index: nav.order,
        placement_type: nav.placement_type,
        page_url: nav.localized_page?.page_url || nav.slug,
        doc_link: nav.doc_link || '',
        fields: {
          'Placement Type': nav.placement_type,
          Labels: nav.labels,
          Slug: nav.slug,
          Progress: nav.progress,
          Targets: nav.targets,
          Docs: nav.doc_link ? { link: nav.doc_link, text: nav.title || nav.labels } : undefined,
        },
      }))
    }

    const previousSnapshotPath = args['previous-snapshot']
      ? path.resolve(baselineRoot, args['previous-snapshot'])
      : null
    const previousSnapshot =
      previousSnapshotPath && fs.existsSync(previousSnapshotPath)
        ? JSON.parse(fs.readFileSync(previousSnapshotPath, 'utf8'))
        : null

    const out = args.out ? path.resolve(workspace, args.out) : path.join(workspace, LOCALIZED_BUNDLE_ROOT)
    const bundle = await generateLocalizedSources({
      records,
      repositoryRoot: workspace,
      baselineRoot,
      masterCommit,
      devCommit,
      candidate,
      previousSnapshot,
      out,
      runId: String(args['run-id'] || process.env.GITHUB_RUN_ID || 'local'),
      imageBaseUrl: args['image-base-url'] || process.env.IMAGE_BED_URL || localized.DEFAULT_ZH_CN_IMAGE_BASE_URL,
    })

    if (bundle && snapshotFile && candidate) {
      fs.writeFileSync(snapshotFile, `${JSON.stringify(candidate, null, 2)}\n`)
    }
    return bundle
  }

  throw new Error(`Unknown localized sources operation: ${operation}`)
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.stack || error.message)
    process.exitCode = 1
  })
}

module.exports = {
  LOCALIZED_BUNDLE_ROOT,
  LOCALIZED_MANIFEST_DIR,
  LOCALIZED_ACTIVE_PATH,
  LOCALIZED_EFFECTIVE_SNAPSHOT,
  LOCALIZED_PUBLICATION_AUTHORITY,
  generateLocalizedSources,
  loadLocalizedBundle,
  validateLocalizedPayload,
  finalizeLocalizedPublication,
  validateLocalizedPublication,
  promoteLocalizedSnapshot,
  main,
}
