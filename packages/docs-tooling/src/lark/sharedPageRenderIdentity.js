'use strict'

// The render identity decides whether a shared page needs re-rendering. One pure
// recipe serves both sides of the pipeline: Fetch planning
// (sharedPageFetch.prepareSharedSources) and publication receipt projection
// (guides-shared-sources.receiptDraft). Before this module the two sides hashed
// structurally different JSON (planning evidence vs receipt inputs), so even a
// zero-drift round never produced equal digests and every run re-rendered all
// shared pages.
//
// Run-global provenance — master/dev commits, full navigation, full dev content
// hashes, image bed base — stays in the receipt inputs and never enters this
// digest: those fields flip on unrelated edits or run-level inputs and would keep
// cross-run comparison permanently unequal. The upstream pins stand in for the
// pinned milvus-docs inventories: locks are committed immutable content
// addresses, so site/en bytes at a pin cannot drift; the full inventories remain
// receipt evidence and are re-verified by the regeneration replay.

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex')

// Everything the shared build executes or reads from the zdoc tree on the pinned
// master commit. Shared-docs owns the render pipeline (build command, adapters,
// core transforms); manuals owns target resolution; docHeadingTags feeds heading
// rendering; the md2md package version pins the markdown engine.
const ENGINE_PATHS = ['docs-ui/src/shared/utils/docHeadingTags.ts',
  'packages/docs-tooling/src/manuals', 'packages/docs-tooling/src/shared-docs']
// Top-level overlay inputs plus the whole per-page directory: fetch reads exactly
// these (readSharedDocs' single-page restriction). links.yaml deliberately stays
// a global component — per-page extraction would risk missed invalidation.
const OVERLAY_ROOT = 'shared-docs/guides'
const OVERLAY_TOP = ['Variables.json', 'links.yaml', 'presentation/cloud-sdk-tabs.yaml',
  'product-names.yaml', 'source.yaml']
const DEV_PAGE_INDEX = /^content\/en\/(?:guides|byoc)\/.+\.(?:md|mdx)$/

/** Sorted content-addressed projection of an inventory subset. */
function filesProjection(files) {
  return (files || []).map(({path, sha256}) => ({path, sha256})).sort((a, b) => a.path.localeCompare(b.path))
}
function overlayInventory(files, page) {
  const prefix = `${OVERLAY_ROOT}/pages/${page}/`
  return filesProjection((files || []).filter(file => file.path.startsWith(prefix)
    || OVERLAY_TOP.includes(file.path.slice(OVERLAY_ROOT.length + 1))))
}
function devMdPaths(files) {
  return [...new Set((files || []).map(file => file.path || file).filter(path => DEV_PAGE_INDEX.test(path)))].sort()
}
/** Canonical engine inventory digest; receipt inputs carry it as tools.engine_sha256
 *  so every validation context can recompute the identity without a master checkout. */
function engineDigest(files) {
  return digest(JSON.stringify(filesProjection(files)))
}
function receiptImages(images) {
  return (images || []).map(({source, sha256}) => ({source, sha256})).sort((a, b) => a.source.localeCompare(b.source))
}
/** Resolve the installed md2md package version; shared by planning and publication. */
function resolveMd2mdVersion() {
  let packageRoot = path.dirname(require.resolve('@zilliz/mdtomd/blocks.js', {paths: [path.resolve(__dirname, '../..')]}))
  while (!fs.existsSync(path.join(packageRoot, 'package.json'))) {
    const parent = path.dirname(packageRoot)
    if (parent === packageRoot) throw new Error('Cannot identify installed md2md version')
    packageRoot = parent
  }
  const md2mdPackage = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))
  if (md2mdPackage.name !== '@zilliz/mdtomd') throw new Error('Unexpected md2md package identity')
  return md2mdPackage.version
}

/** The identity recipe. Projection fields may be null where a side cannot know
 *  them yet — first-time pages have no render targets, recorded images or active
 *  entry at planning, and legacy receipts carry no engine digest or active entry;
 *  both sides must then simply agree the same way from the next round onward. */
function renderIdentity(projection) {
  const canonical = {
    group: 'guides',
    page: projection.page,
    pins: projection.pins ? {current: projection.pins.current, next: projection.pins.next} : null,
    overlay: filesProjection(projection.overlay),
    engine: {inventory_sha256: projection.engine?.inventory_sha256 || null, md2md: projection.engine?.md2md || null},
    dev_page_index: projection.devPagePaths ? digest(JSON.stringify(devMdPaths(projection.devPagePaths))) : null,
    render_targets: projection.renderTargets || null,
    images: receiptImages(projection.images),
    active: projection.active || null,
  }
  return {group: 'guides', page: projection.page, inputs_sha256: digest(JSON.stringify(canonical)),
    record: require('./sharedPageRouting').sharedReceiptPath('guides', projection.page)}
}

/** Project receipt inputs onto the recipe. `engine` comes from receipt.tools so
 *  validation contexts without a master checkout stay receipt-local. */
function receiptProjection(inputs, page) {
  return {
    page,
    pins: {current: inputs.milvus_docs.current, next: inputs.milvus_docs.next},
    overlay: overlayInventory(inputs.zdoc.files, page),
    engine: {inventory_sha256: inputs.tools.engine_sha256 || null, md2md: inputs.tools.md2md},
    devPagePaths: devMdPaths(inputs.dev.files),
    renderTargets: inputs.fetch.render_targets ? inputs.fetch.render_targets.targets : null,
    images: receiptImages(inputs.images),
    active: Object.hasOwn(inputs.fetch, 'active') ? inputs.fetch.active : null,
  }
}

/** Pre-identity receipts stored digest(JSON.stringify(draftInputs(receipt))). Kept
 *  only to authenticate the one transition round of retained baselines; receipts
 *  written after render identity always carry fetch.active. */
function legacyReceiptInputsDigest(receipt) {
  const inputs = structuredClone(receipt.inputs)
  if (typeof inputs.fetch.navigation !== 'string') inputs.fetch.navigation = digest(JSON.stringify(inputs.fetch.navigation))
  return digest(JSON.stringify(inputs))
}

module.exports = {ENGINE_PATHS, renderIdentity, receiptProjection, overlayInventory, devMdPaths, engineDigest, receiptImages, resolveMd2mdVersion, legacyReceiptInputsDigest}
