'use strict';

const { loadTypeScript } = require('../lib/load-typescript');
const { resolveBootstrapSite } = loadTypeScript('../../packages/site-config/src/resolve.ts');
const {
  canonicalPublicationGroupForManual,
  listPublicationGroups,
  resolvePublicationGroupWorkflow,
} = loadTypeScript('../../packages/docs-tooling/src/workflows/groups.ts');

const REFERENCE_LANDING_PATHS = Object.freeze([
  'content/en/reference/api/python/python/python.md',
  'content/en/reference/api/java/java/java.md',
  'content/en/reference/api/nodejs/nodejs/nodejs.md',
  'content/en/reference/api/go/go/go.md',
  'content/en/reference/api/cpp/cpp/cpp.md',
  'content/en/reference/cli/cli/Overview.md',
]);

const REFERENCE_LANDINGS_GROUP = Object.freeze({
  site: 'en',
  manuals: Object.freeze([]),
  snapshotManual: 'reference-landings',
  translate: true,
  durableTranslationBatchSize: 0,
  ownedPaths: REFERENCE_LANDING_PATHS,
  forceTranslationPaths: REFERENCE_LANDING_PATHS,
  preservedPaths: Object.freeze([]),
  protectedPaths: Object.freeze([]),
  publicationManifest: null,
  commitMessage: 'i18n(zh-CN): complete reference landing pages',
});

function normalizeOwnershipPath(path) {
  if (typeof path !== 'string' || path === '' || path.startsWith('/') || path.endsWith('/')) {
    throw new Error(`Invalid ownership path: ${path}`);
  }
  const segments = path.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(`Invalid ownership path: ${path}`);
  }
  return segments.join('/');
}

function validateDisjointOwnership(groups) {
  const entries = [];
  for (const [group, paths] of Object.entries(groups)) {
    for (const path of paths) {
      const normalized = normalizeOwnershipPath(path);
      for (const existing of entries) {
        if (existing.group !== group && (normalized === existing.path || normalized.startsWith(`${existing.path}/`) || existing.path.startsWith(`${normalized}/`))) {
          throw new Error(`Content group ownership overlap: ${group}:${path} and ${existing.group}:${existing.path}`);
        }
      }
      entries.push({ group, path: normalized });
    }
  }
}

function defaultSite() {
  return resolveBootstrapSite(undefined);
}

function listContentGroups(site = defaultSite()) {
  return listPublicationGroups(site);
}

function getContentGroup(name, site = defaultSite()) {
  if (site === 'en' && name === 'reference-landings') return REFERENCE_LANDINGS_GROUP;
  const workflow = resolvePublicationGroupWorkflow(site, name);
  return Object.freeze({
    site,
    manuals: workflow.sourceManuals,
    sourceSnapshots: workflow.sourceSnapshots,
    snapshotManual: workflow.snapshotManual,
    translate: workflow.translate,
    durableTranslationBatchSize: workflow.durableTranslationBatchSize,
    ownedPaths: workflow.checkpointPaths,
    preservedPaths: workflow.preservedPaths,
    protectedPaths: workflow.group.protectedPaths || Object.freeze([]),
    publicationManifest: workflow.group.publicationManifest || null,
    commitMessage: workflow.commitMessage,
  });
}

function assertDisjointOwnership(site = defaultSite()) {
  validateDisjointOwnership(Object.fromEntries(listContentGroups(site).map((name) => [name, resolvePublicationGroupWorkflow(site, name).group.ownedPaths])));
}

module.exports = {
  assertDisjointOwnership,
  canonicalPublicationGroupForManual,
  getContentGroup,
  listContentGroups,
  validateDisjointOwnership,
};
