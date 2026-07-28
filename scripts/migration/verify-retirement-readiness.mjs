#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, lstatSync, mkdtempSync, rmSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {compareRouteInventories} from './compare-routes.mjs';

const TARGET_PREFIXES = ['content/', 'generated/', 'i18n/ja-JP/', 'apps/docs/', 'packages/'];
const OID = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const OCI_DIGEST = /^sha256:[0-9a-f]{64}$/;
const RETIREMENT_REASON_CODES = new Set([
  'site-owned-dockerfiles-replace-root-image', 'site-owned-runtime-replaces-root-runtime',
  'docusaurus-sample-content-retired', 'content-inventory-reviewed', 'profile-configuration-replaced',
  'profile-search-replaced', 'reference-generator-replaced', 'lark-tooling-replaced',
  'cli-side-effect-plugin-replaced', 'site-provider-replaced', 'run-content-group-adapter-replaced',
  'upstream-materialization-retired', 'workspace-tooling-replaced', 'pipeline-provider-replaced',
  'downstream-overlay-provider-retired', 'historical-generated-artifact-retired',
  'independent-chinese-content-root-replaces-i18n',
]);

async function readJson(root, relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

function requireOid(value, label) {
  if (!OID.test(value || '')) throw new Error(`${label} must be an exact lowercase 40-character Git object ID`);
}

function parseRevisionTree(output, revision) {
  const entries = output.toString('utf8').split('\0').filter(Boolean).map(record => {
    const match = /^(\d+) blob ([0-9a-f]{40})\t([\s\S]+)$/.exec(record);
    if (!match) throw new Error(`Unexpected git ls-tree record at ${revision}: ${record}`);
    return {path: match[3], blob: match[2]};
  });
  return Object.freeze({
    entries,
    byPath: Object.fromEntries(entries.map(entry => [entry.path, entry.blob])),
  });
}

function gitOutput(args, options = {}) {
  return execFileSync('git', args, {encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, ...options});
}

function loadRevisionTree(root, revision) {
  requireOid(revision, 'reviewedAtRevision');
  return parseRevisionTree(gitOutput(['-C', root, 'ls-tree', '-r', '-z', '--full-tree', revision]), revision);
}

function loadSourceTree(args, revision, treeObjectId) {
  requireOid(revision, 'source snapshot revision');
  requireOid(treeObjectId, 'source snapshot treeObjectId');
  const resolvedCommit = gitOutput([...args, 'rev-parse', `${revision}^{commit}`]).toString('utf8').trim();
  if (resolvedCommit !== revision) throw new Error(`Pinned source commit mismatch at ${revision}`);
  const resolvedTree = gitOutput([...args, 'rev-parse', `${revision}^{tree}`]).toString('utf8').trim();
  if (resolvedTree !== treeObjectId) throw new Error(`Pinned source tree mismatch at ${revision}`);
  return {...parseRevisionTree(gitOutput([...args, 'ls-tree', '-r', '-z', '--full-tree', revision]), revision), treeObjectId: resolvedTree};
}

function verifiedTrustedSource(root, snapshot) {
  const explicit = process.env.ZDOC_CN_TRUSTED_SOURCE;
  const automaticRepositories = [path.resolve(root, '../zdoc_cn'), path.resolve(root, '../../../../zdoc_cn')];
  const automaticRepository = automaticRepositories.find(candidate => existsSync(path.join(candidate, '.git')));
  const automaticBundle = path.join(root, '.claude/archives/zdoc-cn-pre-merge.bundle');
  const source = explicit || automaticRepository || (existsSync(automaticBundle) ? automaticBundle : null);
  if (!source) return {tree: null, anchor: null, error: 'zdoc_cn:independent-anchor-unavailable'};
  const explicitSource = explicit !== undefined;
  try {
    if (!path.isAbsolute(source) || path.resolve(source) !== source) throw new Error('trusted source path must be normalized and absolute');
    const stat = lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error('trusted source path must not be a symlink');
    if (stat.isDirectory()) {
      return {
        tree: loadSourceTree(['-C', source], snapshot.revision, snapshot.treeObjectId),
        anchor: explicitSource ? 'verified-explicit-repository' : 'verified-auto-repository',
        error: null,
      };
    }
    if (!stat.isFile()) throw new Error('trusted source must be a repository or bundle file');
    gitOutput(['-C', root, 'bundle', 'verify', source]);
    const temporary = mkdtempSync(path.join(tmpdir(), 'zdoc-cn-trusted-bundle-'));
    try {
      const bareRepository = path.join(temporary, 'repository.git');
      gitOutput(['clone', '--bare', '--quiet', '--', source, bareRepository]);
      return {
        tree: loadSourceTree(['--git-dir', bareRepository], snapshot.revision, snapshot.treeObjectId),
        anchor: explicitSource ? 'verified-explicit-bundle' : 'verified-auto-bundle',
        error: null,
      };
    } finally {
      rmSync(temporary, {recursive: true, force: true});
    }
  } catch (_) {
    return {tree: null, anchor: null, error: 'zdoc_cn:independent-anchor-invalid'};
  }
}

export async function loadRetirementEvidence(rootUrl = pathToFileURL(`${process.cwd()}${path.sep}`)) {
  const root = fileURLToPath(rootUrl);
  const [legacyFiles, sourceSnapshotConfig, capabilities, dependencies, approvedDifferences, shadowEn, shadowZhCn,
    routesEnLegacy, routesEnReplacement, routesZhCnLegacy, routesZhCnReplacement] = await Promise.all([
    readJson(root, 'migration/legacy-files.json'),
    readJson(root, 'migration/source-snapshots.json'),
    readJson(root, 'migration/capabilities.json'),
    readJson(root, 'migration/dependencies.json'),
    readJson(root, 'migration/approved-differences.json'),
    readJson(root, 'migration/reports/shadow-en.json'),
    readJson(root, 'migration/reports/shadow-zh-CN.json'),
    readJson(root, 'migration/reports/routes-en-legacy.json'),
    readJson(root, 'migration/reports/routes-en-replacement.json'),
    readJson(root, 'migration/reports/routes-zh-CN-legacy.json'),
    readJson(root, 'migration/reports/routes-zh-CN-replacement.json'),
  ]);
  if (sourceSnapshotConfig?.schemaVersion !== 1 || !Array.isArray(sourceSnapshotConfig.repositories)) {
    throw new Error('Invalid migration/source-snapshots.json');
  }
  const configuredSnapshots = new Map(sourceSnapshotConfig.repositories.map(snapshot => [snapshot.id, snapshot]));
  for (const snapshot of sourceSnapshotConfig.repositories) {
    requireOid(snapshot.revision, `${snapshot.id} source snapshot revision`);
    requireOid(snapshot.treeObjectId, `${snapshot.id} source snapshot treeObjectId`);
  }
  const revisions = new Set([legacyFiles.review?.reviewedAtRevision]);
  for (const entry of legacyFiles.entries) {
    revisions.add(entry.replacementReview?.reviewedAtRevision);
    revisions.add(entry.retirementReview?.reviewedAtRevision);
  }
  revisions.delete(undefined);
  for (const revision of revisions) requireOid(revision, 'reviewedAtRevision');
  const revisionTrees = Object.fromEntries([...revisions].map(revision => [revision, loadRevisionTree(root, revision).byPath]));
  const zdocSnapshot = configuredSnapshots.get('zdoc');
  const zdocCnSnapshot = configuredSnapshots.get('zdoc_cn');
  const sourceInventoryEvidence = {};
  if (zdocCnSnapshot?.treeInventoryPath !== 'migration/source-tree-inventories/zdoc_cn.json') {
    throw new Error('zdoc_cn treeInventoryPath must name the tracked canonical inventory');
  }
  sourceInventoryEvidence.zdoc_cn = await readJson(root, zdocCnSnapshot.treeInventoryPath);
  const sourceTrees = {};
  const sourceInventoryAnchors = {};
  const sourceTreeErrors = {};
  if (zdocSnapshot) sourceTrees.zdoc = loadSourceTree(['-C', root], zdocSnapshot.revision, zdocSnapshot.treeObjectId);
  if (zdocCnSnapshot) {
    const downstream = verifiedTrustedSource(root, zdocCnSnapshot);
    sourceTrees.zdoc_cn = downstream.tree;
    sourceInventoryAnchors.zdoc_cn = downstream.anchor;
    sourceTreeErrors.zdoc_cn = downstream.error;
  }
  return {
    root, legacyFiles, sourceSnapshotConfig, sourceInventoryEvidence, sourceTrees, sourceInventoryAnchors, sourceTreeErrors,
    capabilities, dependencies, approvedDifferences, revisionTrees,
    shadows: {en: shadowEn, 'zh-CN': shadowZhCn},
    routes: {
      en: {legacy: routesEnLegacy, replacement: routesEnReplacement},
      'zh-CN': {legacy: routesZhCnLegacy, replacement: routesZhCnReplacement},
    },
  };
}

function inventoryDigest(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    hash.update(entry.path);
    hash.update('\0');
    hash.update(entry.blob);
    hash.update('\0');
  }
  return hash.digest('hex');
}

function treeInventoryDigest(entries) {
  const hash = createHash('sha256');
  for (const entry of [...entries].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    hash.update(entry.mode);
    hash.update('\0');
    hash.update(entry.path);
    hash.update('\0');
    hash.update(entry.blob);
    hash.update('\0');
  }
  return hash.digest('hex');
}

function reconstructedTreeObjectId(entries) {
  const root = {directories: new Map(), blobs: new Map()};
  for (const entry of entries) {
    let directory = root;
    const parts = entry.path.split('/');
    const name = parts.pop();
    for (const part of parts) {
      if (!directory.directories.has(part)) directory.directories.set(part, {directories: new Map(), blobs: new Map()});
      directory = directory.directories.get(part);
    }
    if (directory.blobs.has(name) || directory.directories.has(name)) throw new Error(`Duplicate tree inventory path: ${entry.path}`);
    directory.blobs.set(name, entry);
  }

  function hashDirectory(directory) {
    const records = [
      ...[...directory.blobs].map(([name, entry]) => ({name, sortName: name, mode: entry.mode, oid: entry.blob})),
      ...[...directory.directories].map(([name, child]) => ({name, sortName: `${name}/`, mode: '40000', oid: hashDirectory(child)})),
    ].sort((left, right) => Buffer.compare(Buffer.from(left.sortName), Buffer.from(right.sortName)));
    const body = Buffer.concat(records.flatMap(record => [
      Buffer.from(`${record.mode} ${record.name}\0`),
      Buffer.from(record.oid, 'hex'),
    ]));
    return createHash('sha1').update(Buffer.from(`tree ${body.length}\0`)).update(body).digest('hex');
  }
  return hashDirectory(root);
}

function downstreamInventoryEvidenceErrors(evidence, snapshot, ledger) {
  const errors = [];
  const inventory = evidence.sourceInventoryEvidence?.zdoc_cn;
  if (!inventory || inventory.schemaVersion !== 1 || inventory.sourceRepository !== 'zdoc_cn'
    || inventory.revision !== snapshot.revision || inventory.treeObjectId !== snapshot.treeObjectId
    || inventory.inventoryEntryCount !== snapshot.inventoryEntryCount
    || inventory.inventorySha256 !== snapshot.inventorySha256
    || inventory.treeInventorySha256 !== snapshot.treeInventorySha256
    || !Array.isArray(inventory.entries)) return ['zdoc_cn:inventory-evidence-schema'];
  const entries = inventory.entries;
  const paths = entries.map(entry => entry.path);
  const sortedPaths = [...paths].sort();
  if (new Set(paths).size !== paths.length || paths.some((item, index) => item !== sortedPaths[index])) {
    errors.push('zdoc_cn:inventory-evidence-order');
  }
  if (entries.some(entry => !['100644', '100755'].includes(entry.mode) || typeof entry.path !== 'string'
    || entry.path.length === 0 || entry.path.includes('\0') || path.posix.isAbsolute(entry.path)
    || path.posix.normalize(entry.path) !== entry.path || !OID.test(entry.blob || ''))) {
    errors.push('zdoc_cn:inventory-evidence-entry');
  }
  if (entries.length !== snapshot.inventoryEntryCount || inventoryDigest(entries) !== snapshot.inventorySha256) {
    errors.push('zdoc_cn:inventory-evidence-completeness');
  }
  if (!SHA256.test(snapshot.treeInventorySha256 || '')
    || treeInventoryDigest(entries) !== snapshot.treeInventorySha256) {
    errors.push('zdoc_cn:inventory-evidence-hash');
  }
  try {
    if (reconstructedTreeObjectId(entries) !== snapshot.treeObjectId) errors.push('zdoc_cn:tracked-tree-object');
  } catch (_) {
    errors.push('zdoc_cn:tracked-tree-object');
  }
  const ledgerInventory = ledger.map(entry => ({path: entry.sourcePath, blob: entry.sourceBlobId}));
  if (JSON.stringify(ledgerInventory) !== JSON.stringify(entries.map(entry => ({path: entry.path, blob: entry.blob})))) {
    errors.push('zdoc_cn:inventory-evidence-ledger');
  }
  return errors;
}

function sourceInventoryErrors(evidence) {
  const errors = [];
  const snapshots = evidence.sourceSnapshotConfig?.repositories;
  if (!Array.isArray(snapshots)) return ['source-snapshots:missing'];
  const snapshotIds = snapshots.map(snapshot => snapshot.id);
  if (snapshotIds.length !== 2 || new Set(snapshotIds).size !== 2
    || snapshotIds[0] !== 'zdoc' || snapshotIds[1] !== 'zdoc_cn') errors.push('source-snapshots:repositories');
  const configured = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]));
  const embedded = new Map((evidence.legacyFiles.sourceSnapshots || []).map(snapshot => [snapshot.sourceRepository, snapshot]));
  const keys = evidence.legacyFiles.entries.map(entry => `${entry.sourceRepository}\0${entry.sourcePath}`);
  const sortedKeys = [...keys].sort();
  if (evidence.legacyFiles.entries.some(entry => !['zdoc', 'zdoc_cn'].includes(entry.sourceRepository))) {
    errors.push('source-inventory:repository');
  }
  if (new Set(keys).size !== keys.length) errors.push('source-inventory:duplicate-key');
  if (keys.some((key, index) => key !== sortedKeys[index])) errors.push('source-inventory:sort');

  for (const id of ['zdoc', 'zdoc_cn']) {
    const snapshot = configured.get(id);
    if (!snapshot || !OID.test(snapshot.revision || '') || !OID.test(snapshot.treeObjectId || '')
      || !Number.isSafeInteger(snapshot.inventoryEntryCount) || snapshot.inventoryEntryCount < 0
      || !SHA256.test(snapshot.inventorySha256 || '')) {
      errors.push(`${id}:snapshot-metadata`);
      continue;
    }
    if (embedded.get(id)?.revision !== snapshot.revision) errors.push(`${id}:snapshot-pin`);
    const ledger = evidence.legacyFiles.entries.filter(entry => entry.sourceRepository === id);
    const canonical = [];
    for (const entry of ledger) {
      if (!OID.test(entry.sourceCommit || '') || entry.sourceCommit !== snapshot.revision) errors.push(`${id}:source-commit:${entry.sourcePath}`);
      if (typeof entry.sourcePath !== 'string' || entry.sourcePath.length === 0 || entry.sourcePath.includes('\0')
        || path.posix.isAbsolute(entry.sourcePath) || path.posix.normalize(entry.sourcePath) !== entry.sourcePath
        || !OID.test(entry.sourceBlobId || '') || entry.sourceBlobId === '0'.repeat(40)) {
        errors.push(`${id}:source-entry:${entry.sourcePath}`);
      }
      canonical.push({path: entry.sourcePath, blob: entry.sourceBlobId});
    }
    if (ledger.length !== snapshot.inventoryEntryCount) errors.push(`${id}:entry-count`);
    if (inventoryDigest(canonical) !== snapshot.inventorySha256) errors.push(`${id}:inventory-sha256`);
    if (id === 'zdoc_cn') errors.push(...downstreamInventoryEvidenceErrors(evidence, snapshot, ledger));
    const tree = evidence.sourceTrees?.[id];
    if (id === 'zdoc' && !tree) errors.push('zdoc:source-tree-missing');
    if (id === 'zdoc_cn' && !tree) errors.push(evidence.sourceTreeErrors?.zdoc_cn || 'zdoc_cn:independent-anchor-unavailable');
    if (tree) {
      if (tree.treeObjectId !== snapshot.treeObjectId || tree.entries.length !== snapshot.inventoryEntryCount
        || inventoryDigest(tree.entries) !== snapshot.inventorySha256) errors.push(`${id}:pinned-tree-metadata`);
      if (ledger.some(entry => tree.byPath[entry.sourcePath] !== entry.sourceBlobId)) errors.push(`${id}:pinned-tree-entry`);
    }
  }
  return errors;
}

function pathExists(tree, candidate) {
  const pathOnly = candidate.split('#', 1)[0];
  return tree[pathOnly] !== undefined || Object.keys(tree).some(item => item.startsWith(`${pathOnly}/`));
}

function hasReplacementEvidence(entry, evidence, capabilitiesById) {
  const reviewRevision = evidence.legacyFiles.review?.reviewedAtRevision;
  if (entry.disposition === 'retire') {
    const review = entry.retirementReview;
    const capability = capabilitiesById.get(review?.capabilityId);
    const tree = evidence.revisionTrees?.[review?.reviewedAtRevision];
    if (review?.status !== 'reviewed' || review.reviewedAtRevision !== reviewRevision || !tree
      || tree[entry.sourcePath] !== undefined || !capability
      || !RETIREMENT_REASON_CODES.has(review.reasonCode) || typeof review.reason !== 'string' || review.reason.length === 0
      || !['replaced', 'retired'].includes(review.providerDisposition)
      || !Array.isArray(review.replacementEntryPoints)) return false;
    if (review.providerDisposition === 'retired') {
      return capability.disposition === 'retire' && review.replacementEntryPoints.length === 0;
    }
    return review.replacementEntryPoints.length > 0
      && review.replacementEntryPoints.every(item =>
        capability.replacementEntryPoints.includes(item) && pathExists(tree, item));
  }
  const review = entry.replacementReview;
  const targetPath = entry.retainedControlPath === true ? entry.sourcePath : entry.targetPath;
  const tree = evidence.revisionTrees?.[review?.reviewedAtRevision];
  if (review?.status !== 'reviewed' || review.reviewedAtRevision !== reviewRevision || !tree
    || review.targetPath !== targetPath || tree[targetPath] !== review.targetObjectId) return false;
  if (entry.retainedControlPath === true) return entry.disposition === 'rewrite' && review.evidenceKind === 'retained-control';
  if (typeof entry.targetPath !== 'string' || !TARGET_PREFIXES.some(prefix => entry.targetPath.startsWith(prefix))) return false;
  if (!['exact-blob', 'reviewed-rewrite'].includes(review.evidenceKind)
    || (entry.disposition === 'migrate' && review.evidenceKind !== 'exact-blob')) return false;
  return review.evidenceKind !== 'exact-blob' || review.targetObjectId === entry.sourceBlobId;
}

function routeEvidenceErrors(evidence) {
  const errors = [];
  if (!evidence.approvedDifferences || evidence.approvedDifferences.reviewedRevision !== evidence.legacyFiles.review?.reviewedAtRevision) {
    errors.push('approved-differences:reviewed-revision');
    return errors;
  }
  for (const site of ['en', 'zh-CN']) {
    try {
      const replacement = site === 'en'
        ? {...evidence.routes.en.replacement, routes: evidence.routes.en.replacement.routes.filter(item => !item.route.startsWith('/ja-JP'))}
        : evidence.routes['zh-CN'].replacement;
      compareRouteInventories({
        legacy: evidence.routes[site].legacy,
        replacement,
        approved: evidence.approvedDifferences,
        site,
        failOnDifferences: true,
      });
    } catch (error) {
      errors.push(`routes:${site}:${error.message}`);
    }
  }
  const english = evidence.routes.en.replacement.routes.filter(item => !item.route.startsWith('/ja-JP')).map(item => item.route).sort();
  const japanese = evidence.routes.en.replacement.routes.filter(item => item.route.startsWith('/ja-JP'))
    .map(item => item.route.slice('/ja-JP'.length) || '/').sort();
  if (JSON.stringify(english) !== JSON.stringify(japanese)) errors.push('routes:en:japanese-parity');
  return errors;
}

function expectedTask12CapabilityEvidence(site, sourceSha) {
  const locale = site === 'en' ? 'en' : 'zh-CN';
  const shadowReport = site === 'en' ? 'shadow-en.json' : 'shadow-zh-CN.json';
  const routeReport = site === 'en' ? 'routes-en-replacement.json' : 'routes-zh-CN-replacement.json';
  return [
    `Task 11 site build and bounded route comparison passed for ${locale}; see migration/reports/${routeReport} and migration/approved-differences.json.`,
    `Task 12 clean-checkout site build, local image build, image smoke, and runtime inspection passed at source SHA ${sourceSha}; see migration/reports/${shadowReport}.`,
    'External registry digest, UAT release, shadow observation, and approved immutable external archive storage and owner acceptance remain pending.',
  ];
}

function isPlainRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function hasExactKeys(value, expected) {
  if (!isPlainRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function exactArray(actual, expected) {
  return Array.isArray(actual) && JSON.stringify(actual) === JSON.stringify(expected);
}

function exactStringSet(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length
    && actual.every(item => typeof item === 'string')
    && new Set(actual).size === actual.length
    && [...actual].sort().every((item, index) => item === [...expected].sort()[index]);
}

function task12ShadowContract(site, sourceSha) {
  const english = site === 'en';
  const tag = english ? 'zdoc-en:retirement' : 'zdoc-zh-cn:retirement';
  const buildId = `local-retirement-${site}`;
  const artifact = `build/${site}`;
  return {
    tag,
    buildId,
    buildKeys: ['status', 'command', 'exitStatus', 'artifact', 'artifactHash', 'provenance', 'dependencyInstall',
      'publicationNetworkFence', ...(english ? [] : ['ssgMemoryControl']), 'imageBuildCommand'],
    buildCommand: `pnpm build:${site}`,
    artifact,
    provenance: `${artifact}/build-provenance.json`,
    imageBuildCommand: `docker build --file deploy/${site}/Dockerfile --build-arg ZDOC_SHA=${sourceSha} --build-arg ZDOC_SITE=${site} --build-arg JENKINS_BUILD_ID=${buildId} --tag ${tag} .`,
    smokeCommand: `bash deploy/contracts/smoke.sh ${tag} ${site}`,
    artifactChecks: english ? [
      'build/en/index.html exists',
      'build/en/docs/home.html exists',
      'build/en/ja-JP/docs/home.html exists',
      'Japanese and canonical English inventories each contain 1885 routes',
    ] : [
      'build/zh-CN/index.html exists',
      'build/zh-CN/docs/home.html exists',
      'replacement inventory contains 1620 Chinese routes',
      'Chinese build contains no /ja-JP route inventory',
    ],
    completedImageChecks: english ? [
      'OCI source and revision labels',
      'Jenkins identity label',
      '/healthz',
      '/docs/home',
      '/ja-JP/docs/home',
      'temporary container cleanup',
      'runtime image excludes /app, Node, npm, pnpm, node_modules, .git, translation caches, reports, migration evidence, and repository source roots',
    ] : [
      'OCI source and revision labels',
      'Jenkins identity label',
      '/healthz',
      '/docs/home',
      'representative guide, BYOC, on-premise, Agent, and reference routes',
      '/ja-JP/docs/home returns 404',
      'temporary container cleanup',
      'runtime image excludes /app, Node, npm, pnpm, node_modules, Markdown, .git, translation caches, reports, migration evidence, and repository source roots',
    ],
    differentialKeys: english
      ? ['legacyCanonicalRoutes', 'replacementCanonicalRoutes', 'japaneseRoutes', 'approvedCanonicalDifferences', 'japaneseMissing', 'japaneseExtra', 'evidence']
      : ['legacyRoutes', 'replacementRoutes', 'approvedExactDifferences', 'evidence'],
    differentialEvidence: english ? [
      'migration/reports/routes-en-legacy.json',
      'migration/reports/routes-en-replacement.json',
      'migration/approved-differences.json',
    ] : [
      'migration/reports/routes-zh-CN-legacy.json',
      'migration/reports/routes-zh-CN-replacement.json',
      'migration/approved-differences.json',
    ],
    warnings: english ? [
      'Known Docusaurus broken-link and broken-anchor diagnostics remained non-blocking during the current site build.',
      'No repository source roots or builder tools are present in the runtime image; the 3764 route-aligned .md files under /usr/share/nginx/html are intentional embed-markdown static outputs copied from build/en for CopyPage and View source functionality.',
      'The image is local-only, so no registry repository digest is claimed.',
      'External UAT, shadow observation, and approved immutable external archive acceptance remain pending.',
    ] : [
      'Known broken-link, broken-anchor, one-page HTML-minifier, KaTeX Unicode, and lunr diagnostics remained non-blocking during the current site build.',
      'The runtime image contains no repository Markdown or source roots and no builder tools or mutable repository state.',
      'The image is local-only, so no registry repository digest is claimed.',
      'External UAT, shadow observation, and approved immutable external archive storage and owner acceptance remain pending.',
    ],
    uatPipeline: english ? 'zilliz-docs-dev' : 'zilliz-docs-cn-dev',
    requiredEvidence: english ? [
      `registry digest for exact source SHA ${sourceSha}`,
      'UAT release record',
      'shadow hostname',
      'English and Japanese synthetic-check output',
      'observation window',
      'owner approval',
    ] : [
      `registry digest for exact source SHA ${sourceSha}`,
      'Chinese UAT release record',
      'shadow hostname',
      'Chinese synthetic-check output',
      'observation window',
      'owner approval',
      'approved immutable external archive location with reverified archive SHA-256 and owner acceptance',
    ],
  };
}

function expectedShadowDifferential(evidence, site) {
  try {
    if (site === 'en') {
      const canonicalReplacement = {
        ...evidence.routes.en.replacement,
        routes: evidence.routes.en.replacement.routes.filter(item => !item.route.startsWith('/ja-JP')),
      };
      const comparison = compareRouteInventories({
        legacy: evidence.routes.en.legacy,
        replacement: canonicalReplacement,
        approved: evidence.approvedDifferences,
        site,
        failOnDifferences: true,
      });
      const canonicalRoutes = new Set(canonicalReplacement.routes.map(item => item.route));
      const japaneseRoutes = new Set(evidence.routes.en.replacement.routes.filter(item => item.route.startsWith('/ja-JP'))
        .map(item => item.route.slice('/ja-JP'.length) || '/'));
      return {
        legacyCanonicalRoutes: evidence.routes.en.legacy.routes.length,
        replacementCanonicalRoutes: canonicalReplacement.routes.length,
        japaneseRoutes: japaneseRoutes.size,
        approvedCanonicalDifferences: comparison.approvalsUsed.length,
        japaneseMissing: [...canonicalRoutes].filter(route => !japaneseRoutes.has(route)).length,
        japaneseExtra: [...japaneseRoutes].filter(route => !canonicalRoutes.has(route)).length,
      };
    }
    const comparison = compareRouteInventories({
      legacy: evidence.routes['zh-CN'].legacy,
      replacement: evidence.routes['zh-CN'].replacement,
      approved: evidence.approvedDifferences,
      site,
      failOnDifferences: true,
    });
    return {
      legacyRoutes: evidence.routes['zh-CN'].legacy.routes.length,
      replacementRoutes: evidence.routes['zh-CN'].replacement.routes.length,
      approvedExactDifferences: comparison.approvalsUsed.length,
    };
  } catch (_) {
    return null;
  }
}

function task12ShadowReportIsValid(shadow, site, evidence) {
  if (!hasExactKeys(shadow, ['schemaVersion', 'site', 'sourceRepository', 'sourceSha', 'evidenceRecordedAt',
    'localImage', 'build', 'localSmoke', 'differential', 'warnings', 'externalShadow'])
    || shadow.schemaVersion !== 1 || shadow.site !== site || shadow.sourceRepository !== 'zdoc'
    || !OID.test(shadow.sourceSha || '')
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(shadow.evidenceRecordedAt || '')
    || !Number.isFinite(Date.parse(shadow.evidenceRecordedAt))) return false;
  const contract = task12ShadowContract(site, shadow.sourceSha);
  const localImage = shadow.localImage;
  const runtime = localImage?.runtimeInspection;
  if (!hasExactKeys(localImage, ['status', 'tag', 'imageId', 'configDigest', 'repoDigest', 'sizeBytes', 'buildId',
    'embeddedProvenanceArtifactHash', 'runtimeInspection'])
    || !hasExactKeys(runtime, ['status', 'builderToolchainAbsent', 'repositorySourceRootsAbsent', 'forbiddenStateAbsent'])
    || localImage.status !== 'built-and-smoked' || localImage.tag !== contract.tag
    || !OCI_DIGEST.test(localImage.imageId || '') || !OCI_DIGEST.test(localImage.configDigest || '')
    || localImage.configDigest !== localImage.imageId || localImage.repoDigest !== null
    || !Number.isSafeInteger(localImage.sizeBytes) || localImage.sizeBytes <= 0
    || localImage.buildId !== contract.buildId
    || !SHA256.test(localImage.embeddedProvenanceArtifactHash || '')
    || runtime.status !== 'passed' || runtime.builderToolchainAbsent !== true
    || runtime.repositorySourceRootsAbsent !== true || runtime.forbiddenStateAbsent !== true) return false;
  const build = shadow.build;
  if (!hasExactKeys(build, contract.buildKeys)
    || build.status !== 'site-build-passed' || build.command !== contract.buildCommand || build.exitStatus !== 0
    || build.artifact !== contract.artifact || !SHA256.test(build.artifactHash || '')
    || build.provenance !== contract.provenance
    || build.dependencyInstall !== 'pnpm install --frozen-lockfile in a brand-new detached clean worktree'
    || build.publicationNetworkFence !== true || build.imageBuildCommand !== contract.imageBuildCommand
    || (site === 'zh-CN' && build.ssgMemoryControl !== 'DOCUSAURUS_SSG_WORKER_THREAD_COUNT=2 with a 4096 MiB V8 heap')) return false;
  const smoke = shadow.localSmoke;
  if (!hasExactKeys(smoke, ['status', 'imageCommand', 'imageExitStatus', 'artifactChecks', 'completedImageChecks'])
    || smoke.status !== 'image-smoke-passed' || smoke.imageCommand !== contract.smokeCommand || smoke.imageExitStatus !== 0
    || !exactArray(smoke.artifactChecks, contract.artifactChecks)
    || !exactArray(smoke.completedImageChecks, contract.completedImageChecks)) return false;
  const differential = shadow.differential;
  const countKeys = contract.differentialKeys.filter(key => key !== 'evidence');
  const expectedDifferential = expectedShadowDifferential(evidence, site);
  if (!hasExactKeys(differential, contract.differentialKeys)
    || !expectedDifferential
    || countKeys.some(key => !Number.isSafeInteger(differential[key]) || differential[key] < 0
      || differential[key] !== expectedDifferential[key])
    || !exactArray(differential.evidence, contract.differentialEvidence)) return false;
  if (!exactArray(shadow.warnings, contract.warnings)) return false;
  const external = shadow.externalShadow;
  return hasExactKeys(external, ['status', 'uatPipeline', 'blocker', 'requiredEvidence'])
    && external.status === 'not-executed' && external.uatPipeline === contract.uatPipeline
    && typeof external.blocker === 'string' && external.blocker.length >= 50 && external.blocker.length <= 500
    && /outside repository control/i.test(external.blocker)
    && exactStringSet(external.requiredEvidence, contract.requiredEvidence);
}

function capabilityVerificationErrors(evidence) {
  const errors = new Set(evidence.capabilities.capabilities
    .filter(capability => capability.verificationStatus !== 'verified').map(capability => capability.id));
  for (const [capabilityId, site] of [['content.english', 'en'], ['content.chinese', 'zh-CN']]) {
    const capability = evidence.capabilities.capabilities.find(({id}) => id === capabilityId);
    const shadow = evidence.shadows?.[site];
    const acceptanceEvidenceMatches = Array.isArray(capability?.acceptanceEvidence)
      && OID.test(capability?.verifiedAtRevision || '')
      && JSON.stringify(capability.acceptanceEvidence) === JSON.stringify(expectedTask12CapabilityEvidence(site, capability.verifiedAtRevision));
    if (!capability || !shadow || capability.verificationStatus !== 'verified'
      || capability.verificationScope !== 'task12-local-image-acceptance'
      || capability.releaseGateStatus !== 'local-accepted-external-release-pending'
      || shadow.sourceSha !== capability.verifiedAtRevision
      || !task12ShadowReportIsValid(shadow, site, evidence)
      || !acceptanceEvidenceMatches) errors.add(capabilityId);
  }
  return [...errors];
}

export function collectRetirementReadiness(evidence) {
  const {legacyFiles, capabilities, dependencies} = evidence;
  const capabilitiesById = new Map(capabilities.capabilities.map(capability => [capability.id, capability]));
  const providersWithoutDisposition = legacyFiles.entries
    .filter(entry => entry.disposition !== 'defer' && !hasReplacementEvidence(entry, evidence, capabilitiesById))
    .map(entry => `${entry.sourceRepository}:${entry.sourcePath}`);
  const routeErrors = routeEvidenceErrors(evidence);
  const inventoryErrors = sourceInventoryErrors(evidence);
  const retiredRuntimeImports = dependencies.dependencies.filter(dependency => {
    if (!Array.isArray(dependency.currentImporters)) return true;
    if (dependency.currentImporters.length === 0) return dependency.retirementReview?.status !== 'reviewed';
    return dependency.currentImporters.some(importer =>
      importer !== 'apps/docs' && !importer.startsWith('packages/'),
    );
  }).length;

  return {
    deferredEntries: legacyFiles.entries.filter(entry => entry.disposition === 'defer').length,
    missingReplacementEvidence: providersWithoutDisposition.length + routeErrors.length,
    sourceInventoryErrors: inventoryErrors,
    sourceInventoryAnchors: evidence.sourceInventoryAnchors,
    retiredRuntimeImports,
    unverifiedCapabilities: capabilityVerificationErrors(evidence).length,
    providersWithoutDisposition,
    routeEvidenceErrors: routeErrors,
  };
}

async function main() {
  const evidence = await loadRetirementEvidence();
  const summary = collectRetirementReadiness(evidence);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (summary.deferredEntries || summary.missingReplacementEvidence
    || summary.retiredRuntimeImports || summary.unverifiedCapabilities
    || summary.sourceInventoryErrors.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
