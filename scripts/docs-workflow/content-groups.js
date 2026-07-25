'use strict';

const GROUP_ORDER = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);

function deepFreeze(value) {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') deepFreeze(child);
  }
  return Object.freeze(value);
}

const CONTENT_GROUPS = deepFreeze({
  guides: {
    manuals: ['guides'], snapshotManual: 'guides', translate: true, durableTranslationBatchSize: 30,
    ownedPaths: ['docs', 'docs-byoc', 'config/generated/guides.sidebar.js', 'config/generated/guides-byoc.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', 'packages/docs-tooling/src/lark/meta/assembly/guides.json', 'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json', 'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.md', 'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.csv', 'packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', 'packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.md', 'packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json'],
    commitMessage: 'docs(guides): publish fetched content',
  },
  python: {
    manuals: ['python', 'pymilvus25', 'pymilvus26', 'pymilvus30'], snapshotManual: 'pymilvus30', translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/api/python/python', 'config/generated/python.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json'],
    commitMessage: 'docs(python): publish SDK reference',
  },
  java: {
    manuals: ['javaV2', 'javaV225', 'javaV226', 'javaV230'], snapshotManual: 'javaV230', translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/api/java/java/v2', 'reference/api/java/java/java.md', 'config/generated/java.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/javaV230-uat-last-success.json'],
    commitMessage: 'docs(java): publish SDK reference',
  },
  node: {
    manuals: ['node', 'nodejs25', 'nodejs26', 'nodejs30'], snapshotManual: 'nodejs30', translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/api/nodejs/nodejs', 'config/generated/node.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/nodejs30-uat-last-success.json'],
    commitMessage: 'docs(node): publish SDK reference',
  },
  go: {
    manuals: ['gov226', 'gov230'], snapshotManual: 'gov230', translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/api/go/go/v2', 'reference/api/go/go/go.md', 'config/generated/go.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/gov230-uat-last-success.json'],
    commitMessage: 'docs(go): publish SDK reference',
  },
  cli: {
    manuals: ['cliv13', 'cliv14'], snapshotManual: 'cliv14', translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/cli/cli', 'config/generated/cli.sidebar.js', 'packages/docs-tooling/src/lark/meta/snapshots/cliv14-uat-last-success.json'],
    commitMessage: 'docs(cli): publish CLI reference',
  },
  rest: {
    manuals: [], snapshotManual: null, translate: true, durableTranslationBatchSize: 0,
    ownedPaths: ['reference/api/restful/restful', 'config/generated/restful.sidebar.js'],
    commitMessage: 'docs(rest): publish REST reference',
  },
});

for (const [name, group] of Object.entries(CONTENT_GROUPS)) {
  if (!Number.isInteger(group.durableTranslationBatchSize) || group.durableTranslationBatchSize < 0) {
    throw new Error(`Invalid durable translation batch size for ${name}`);
  }
}

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

function listContentGroups() {
  return GROUP_ORDER;
}

function getContentGroup(name) {
  if (!Object.hasOwn(CONTENT_GROUPS, name)) throw new Error(`Unknown content group: ${name}`);
  return CONTENT_GROUPS[name];
}

function assertDisjointOwnership() {
  validateDisjointOwnership(Object.fromEntries(GROUP_ORDER.map((name) => [name, CONTENT_GROUPS[name].ownedPaths])));
}

module.exports = { assertDisjointOwnership, getContentGroup, listContentGroups, validateDisjointOwnership };
