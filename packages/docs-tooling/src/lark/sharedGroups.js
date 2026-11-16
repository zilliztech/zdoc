'use strict'

// Per-group facts for the shared-page lanes, derived from the manuals registry
// and the core shared-docs group authority. The Guides values are byte-identical
// to the pre-generalization literals; wiring a new group is a registry + core
// authority change, not fresh literals in every lane module. `treeRoot` is the
// manual's own page tree in the dev tree (Guides manuals own their contentRoot,
// reference manuals own their outputDir below the shared `reference` root).

const path = require('node:path')
const {loadTypeScript} = require('../../../../scripts/lib/load-typescript')
const {resolveManualPublication, manualRegistry} = loadTypeScript(path.resolve(__dirname, '../manuals/registry.ts'))
const {canonicalPublicationGroupForManual} = loadTypeScript(path.resolve(__dirname, '../workflows/groups.ts'))
const {isSharedDocGroup} = loadTypeScript(path.resolve(__dirname, '../shared-docs/core/groups.ts'))

// Receipt policy: the upstream repository each group's receipts must pin. Must
// match the `repository` field of the group's pinned shared-docs source.yaml.
const UPSTREAM_REPOSITORY = Object.freeze({
  guides: 'milvus-io/milvus-docs',
  node: 'milvus-io/web-content',
})
// Receipt policy: the physical output shapes each group may publish. Guides keeps
// its legacy Feishu tutorials shape; other groups publish pages directly below
// their own dev page tree.
const GUIDES_OUTPUT_PATTERN = /^content\/en\/(guides|byoc)\/tutorials\/.+\.mdx?$/
function outputPathPattern(group) {
  if (group === 'guides') return GUIDES_OUTPUT_PATTERN
  const roots = [...new Set([...sharedGroupConfig(group).byManual.values()].map(entry => entry.treeRoot))].sort()
  return new RegExp(`^(?:${roots.map(root => root.replace(/[.*+?${}()|[\]\\]/g, '\\$&')).join('|')})/[^/]+\\.mdx?$`)
}

function sharedGroupConfig(group = 'guides') {
  if (!isSharedDocGroup(group)) throw new Error(`Unsupported shared-docs group: ${group}`)
  const manuals = manualRegistry
    .filter(manual => manual.publications.en && canonicalPublicationGroupForManual('en', manual.id) === group)
    .map(manual => manual.id)
  const byManual = new Map(manuals.map(manual => {
    const resolved = resolveManualPublication(manual, 'en')
    return [manual, {
      contentRoot: resolved.publication.contentRoot,
      treeRoot: resolved.manual.kind === 'guides' ? resolved.publication.contentRoot : resolved.publication.outputDir,
      generatorTarget: resolved.publication.generatorTarget,
      sidebarPath: resolved.publication.sidebarPath,
      snapshotPath: resolved.source.snapshotPath,
    }]
  }))
  const primary = byManual.get(group)
  return {
    group,
    manuals,
    byManual,
    upstreamRepository: UPSTREAM_REPOSITORY[group],
    overlayRoot: `shared-docs/${group}`,
    manifestDir: `generated/en/manifests/shared-pages/${group}`,
    publicationPath: `generated/en/manifests/shared-pages/${group}/_publication.json`,
    bundleRoot: `tmp/docs-tooling/en/shared-pages/${group}`,
    snapshotPath: primary?.snapshotPath ?? null,
  }
}

module.exports = {sharedGroupConfig, outputPathPattern, isSharedDocGroup}
