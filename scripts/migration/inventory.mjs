#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPOSITORIES = new Set(['zdoc', 'zdoc_cn']);
const OWNERS = new Set(['app', 'site-config', 'tooling', 'ui', 'adapter', 'content', 'deploy']);
const DISPOSITIONS = new Set(['migrate', 'rewrite', 'retire', 'defer']);
const CAPABILITY_DISPOSITIONS = new Set(['preserve', 'change', 'retire']);
const DEPENDENCY_CLASSES = new Set(['dependencies', 'devDependencies', 'optionalDependencies']);
const REVIEW_STATUSES = new Set(['pending', 'review', 'approved']);
const USAGE_CLASSES = new Set(['runtime', 'build', 'dev']);
const RESOLUTION_STATUSES = new Set(['resolved', 'workspace-link', 'stale-lock', 'unresolved']);
const EXCLUDED_ROOTS = new Set(['.git', '.docusaurus', '.zdoc-assembled', '.zdoc-upstream', 'build', 'node_modules', 'playwright-report', 'test-results']);
const SHA = /^[0-9a-f]{40}$/;

function fail(field, detail = 'is invalid') { throw new Error(`${field} ${detail}`); }
function requireString(value, field) { if (typeof value !== 'string' || value.length === 0) fail(field, 'must be a nonempty string'); }
function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.length === 0 || value.some(item => typeof item !== 'string' || item.length === 0)) fail(field, 'must be a nonempty string array');
}
function requireOptionalStringArray(value, field) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || item.length === 0)) fail(field, 'must be a string array');
}
function validateRelativePath(value, field) {
  requireString(value, field);
  if (value.includes('\\') || value.includes('\0') || path.posix.isAbsolute(value) || path.posix.normalize(value) !== value || value === '..' || value.startsWith('../')) fail(field, 'must be a normalized repository-relative path');
}

export function validateLegacyEntry(entry) {
  if (!entry || typeof entry !== 'object') fail('entry');
  if (!REPOSITORIES.has(entry.sourceRepository)) fail('sourceRepository');
  validateRelativePath(entry.sourcePath, 'sourcePath');
  if (!SHA.test(entry.sourceCommit || '')) fail('sourceCommit', 'must be a 40-character lowercase Git SHA');
  if (!SHA.test(entry.sourceBlobId || '')) fail('sourceBlobId', 'must be a 40-character lowercase Git blob ID');
  if (!DISPOSITIONS.has(entry.disposition)) fail('disposition');
  if (!OWNERS.has(entry.owner)) fail('owner');
  requireStringArray(entry.evidence, 'evidence');
  if (entry.targetPath !== undefined) validateRelativePath(entry.targetPath, 'targetPath');
  return entry;
}

export function validateManifest(entries, options = {}) {
  if (!Array.isArray(entries)) fail('manifest', 'must be an array');
  const keys = entries.map(entry => {
    validateLegacyEntry(entry);
    if (options.cutover && entry.disposition === 'defer') fail('disposition', 'cannot be defer in cutover mode');
    return `${entry.sourceRepository}\0${entry.sourcePath}`;
  });
  if (new Set(keys).size !== keys.length) fail('manifest', 'contains a duplicate source key');
  const sorted = [...keys].sort(compareText);
  if (keys.some((key, index) => key !== sorted[index])) fail('manifest', 'must be sorted by source repository and path');
  return entries;
}

export function validateCapability(capability) {
  if (!capability || typeof capability !== 'object') fail('capability');
  requireString(capability.id, 'id');
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(capability.id)) fail('id');
  if (!OWNERS.has(capability.owner)) fail('owner');
  for (const field of ['consumers', 'contracts', 'legacyEntryPoints', 'replacementEntryPoints', 'acceptanceEvidence']) requireStringArray(capability[field], field);
  if (!CAPABILITY_DISPOSITIONS.has(capability.disposition)) fail('disposition');
  return capability;
}

export function validateDependency(dependency) {
  if (!dependency || typeof dependency !== 'object') fail('dependency');
  requireString(dependency.package, 'package');
  requireString(dependency.requestedRange, 'requestedRange');
  if (dependency.lockedVersion !== null && (typeof dependency.lockedVersion !== 'string' || dependency.lockedVersion.length === 0)) fail('lockedVersion');
  if (dependency.lockedVersion === undefined) fail('lockedVersion');
  if (dependency.lockLocator !== null && (typeof dependency.lockLocator !== 'string' || dependency.lockLocator.length === 0)) fail('lockLocator');
  requireString(dependency.importingWorkspacePackage, 'importingWorkspacePackage');
  validateRelativePath(dependency.importingWorkspacePath, 'importingWorkspacePath');
  if (!USAGE_CLASSES.has(dependency.usageClass)) fail('usageClass');
  if (!OWNERS.has(dependency.owner)) fail('owner');
  requireString(dependency.capability, 'capability');
  for (const field of ['licenseReview', 'vulnerabilityReview']) {
    const review = dependency[field];
    if (!review || !['pending', 'reviewed'].includes(review.status)) fail(`${field}.status`);
    requireStringArray(review.evidence, `${field}.evidence`);
  }
  requireString(dependency.licenseReview.license, 'licenseReview.license');
  requireString(dependency.replacesLegacyDependency, 'replacesLegacyDependency');
  const mapping = dependency.sourceMapping;
  if (!mapping || !REPOSITORIES.has(mapping.sourceRepository)) fail('sourceMapping.sourceRepository');
  if (!SHA.test(mapping.sourceRevision || '')) fail('sourceMapping.sourceRevision');
  validateRelativePath(mapping.sourcePackageManifest, 'sourceMapping.sourcePackageManifest');
  if (!DEPENDENCY_CLASSES.has(mapping.dependencyClass)) fail('sourceMapping.dependencyClass');
  validateRelativePath(mapping.lockfilePath, 'sourceMapping.lockfilePath');
  if (!RESOLUTION_STATUSES.has(mapping.resolutionStatus)) fail('sourceMapping.resolutionStatus');
  requireStringArray(mapping.evidence, 'sourceMapping.evidence');
  if (dependency.lockedVersion === null && mapping.resolutionStatus !== 'unresolved') fail('lockedVersion', 'may be null only when resolutionStatus is unresolved');
  if (!REVIEW_STATUSES.has(dependency.reviewStatus)) fail('reviewStatus');
  if (dependency.reviewStatus === 'approved') {
    if (dependency.licenseReview.status !== 'reviewed' || dependency.vulnerabilityReview.status !== 'reviewed') fail('approval', 'requires completed license and vulnerability review');
    const approval = dependency.approval;
    if (!approval) fail('approval');
    for (const field of ['approvedBy', 'approvedAt', 'reason']) requireString(approval[field], `approval.${field}`);
    requireStringArray(approval.evidence, 'approval.evidence');
  } else if (dependency.approval !== undefined) fail('approval', 'is only valid for approved records');
  return dependency;
}

export function validateDependencies(dependencies) {
  if (!Array.isArray(dependencies)) fail('dependencies', 'must be an array');
  const keys = dependencies.map(dependency => {
    validateDependency(dependency);
    return [dependency.sourceMapping.sourceRepository, dependency.importingWorkspacePath, dependency.sourceMapping.dependencyClass, dependency.package].join('\0');
  });
  if (new Set(keys).size !== keys.length) fail('dependencies', 'contains a duplicate record');
  const sorted = [...keys].sort(compareText);
  if (keys.some((key, index) => key !== sorted[index])) fail('dependencies', 'must be sorted deterministically');
  return dependencies;
}

export function validateOverlayOperation(operation) {
  if (!operation || typeof operation !== 'object') fail('overlayOperation');
  requireString(operation.id, 'id');
  if (!['copy', 'patch'].includes(operation.type)) fail('type');
  if (operation.sourceRepository !== 'zdoc_cn') fail('sourceRepository');
  if (!SHA.test(operation.sourceRevision || '')) fail('sourceRevision');
  validateRelativePath(operation.sourcePath, 'sourcePath');
  if (operation.type === 'copy') validateRelativePath(operation.targetPath, 'targetPath');
  else if (operation.targetPath !== undefined) fail('targetPath', 'is not valid for patch operations');
  if (typeof operation.optional !== 'boolean') fail('optional');
  if (!DISPOSITIONS.has(operation.disposition)) fail('disposition');
  if (!OWNERS.has(operation.owner)) fail('owner');
  requireOptionalStringArray(operation.trackedSourcePaths, 'trackedSourcePaths');
  operation.trackedSourcePaths.forEach(item => validateRelativePath(item, 'trackedSourcePaths'));
  requireStringArray(operation.evidence, 'evidence');
  return operation;
}

function overlayIdentity(type, source, target) { return type === 'copy' ? `copy:${source}=>${target}` : `patch:${source}`; }

export function validateOverlayCoverage(operations, overlayManifest) {
  if (!Array.isArray(operations)) fail('overlay coverage');
  operations.forEach(validateOverlayOperation);
  const ids = operations.map(item => item.id);
  if (new Set(ids).size !== ids.length) fail('overlay coverage', 'contains duplicate operation identities');
  const sorted = [...ids].sort(compareText);
  if (ids.some((id, index) => id !== sorted[index])) fail('overlay coverage', 'must be sorted');
  const expected = [
    ...(overlayManifest.copy || []).map(item => overlayIdentity('copy', item.from, item.to)),
    ...(overlayManifest.patches || []).map(item => overlayIdentity('patch', item.path)),
  ].sort(compareText);
  if (ids.length !== expected.length || ids.some((id, index) => id !== expected[index])) fail('overlay coverage', 'does not exactly cover the pinned overlay manifest');
  return operations;
}

function compareText(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function gitRaw(root, args) { return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}); }
function git(root, args) { return gitRaw(root, args).trim(); }
function gitShow(root, revision, sourcePath) { return gitRaw(root, ['show', `${revision}:${sourcePath}`]); }
function gitPathExists(root, revision, sourcePath) {
  return spawnGit(root, ['cat-file', '-e', `${revision}:${sourcePath}`]);
}
function spawnGit(root, args) {
  try { execFileSync('git', ['-C', root, ...args], {stdio: 'ignore'}); return true; } catch { return false; }
}
function included(sourcePath) { return !EXCLUDED_ROOTS.has(sourcePath.split('/')[0]); }

function ownerFor(sourcePath) {
  if (/^(docs|i18n|versioned_docs|rest-overrides|content-config|site-profile)(?:\/|$)/.test(sourcePath) || /\.(md|mdx)$/.test(sourcePath)) return 'content';
  if (/^(static|src\/components|src\/theme|packages\/chat-ui)\//.test(sourcePath)) return 'ui';
  if (/^(Dockerfile|nginx(?:\/|$)|docker-entrypoint(?:\/|$)|ci(?:\/|$)|\.github(?:\/|$)|Jenkinsfile)/.test(sourcePath)) return 'deploy';
  if (/^(plugins\/adapters(?:\/|$)|plugins\/cn-publish-normalizer(?:\/|$))/.test(sourcePath)) return 'adapter';
  if (/^(scripts|plugins)(?:\/|$)/.test(sourcePath)) return 'tooling';
  if (/^(docusaurus\.config|sidebars|config(?:\/|$)|babel\.config|tsconfig)/.test(sourcePath)) return 'site-config';
  return 'app';
}

function dispositionFor(sourcePath) {
  return /(^|\/)(coverage|generated-cache|cache)(\/|$)/.test(sourcePath) ? 'retire' : 'defer';
}

function listTracked(repository) {
  if (!SHA.test(repository.revision || '')) fail(`${repository.id}.revision`, 'must be an explicit 40-character source pin');
  const commit = git(repository.root, ['rev-parse', `${repository.revision}^{commit}`]);
  if (commit !== repository.revision) fail(`${repository.id}.revision`, 'must resolve exactly to the pinned commit');
  const output = gitRaw(repository.root, ['ls-tree', '-r', '-z', '--full-tree', commit]);
  const entries = output ? output.split('\0').filter(Boolean).map(record => {
    const match = /^(\d+)\s+blob\s+([0-9a-f]{40})\t([\s\S]+)$/.exec(record);
    if (!match) return null;
    const sourcePath = match[3];
    if (!included(sourcePath)) return null;
    return {
      sourceRepository: repository.id,
      sourcePath,
      sourceCommit: commit,
      sourceBlobId: match[2],
      disposition: dispositionFor(sourcePath),
      owner: ownerFor(sourcePath),
      evidence: [`Git blob ${match[2]} at ${repository.id} pinned commit ${commit}.`, `Revision pin source: ${repository.revisionSource || 'generateInventory input'}.`],
    };
  }).filter(Boolean) : [];
  return entries;
}

function dependencyCapability(packageName) {
  if (/docusaurus|remark|rehype|mdx|prism|search/.test(packageName)) return 'site.runtime';
  if (/react|lucide|clsx|inkeep|chat-ui/.test(packageName)) return 'ui.runtime';
  if (/aws|oss|axios|fetch|xml|yaml|dotenv/.test(packageName)) return 'publication.adapters';
  if (/playwright|vitest|testing-library|jsdom|typescript|types/.test(packageName)) return 'quality.gates';
  return 'docs.tooling';
}

function dependencyOwner(packageName) {
  const capability = dependencyCapability(packageName);
  if (capability === 'ui.runtime') return 'ui';
  if (capability === 'publication.adapters') return 'adapter';
  if (capability === 'site.runtime') return 'site-config';
  return 'tooling';
}

function manifestPaths(repository) {
  const paths = gitRaw(repository.root, ['ls-tree', '-r', '--name-only', repository.revision]).split('\n').filter(Boolean);
  return paths.filter(item => item === 'package.json' || /^packages\/[^/]+\/package\.json$/.test(item) || /^apps\/[^/]+\/package\.json$/.test(item));
}

function scalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) return trimmed.slice(1, -1);
  return trimmed;
}

function parsePnpmImporters(text) {
  const importers = {};
  let inImporters = false, importer = null, dependencyClass = null, packageName = null;
  for (const line of text.split('\n')) {
    if (line === 'importers:') { inImporters = true; continue; }
    if (inImporters && /^\S/.test(line) && line !== 'importers:') break;
    if (!inImporters || !line.trim()) continue;
    let match;
    if ((match = /^    (dependencies|devDependencies|optionalDependencies):$/.exec(line))) { dependencyClass = match[1]; importers[importer][dependencyClass] = {}; packageName = null; continue; }
    if (dependencyClass && (match = /^      (\S.*):$/.exec(line))) { packageName = scalar(match[1]); importers[importer][dependencyClass][packageName] = {}; continue; }
    if (packageName && (match = /^        (specifier|version):\s*(.+)$/.exec(line))) importers[importer][dependencyClass][packageName][match[1]] = scalar(match[2]);
    else if ((match = /^  (\S.*):$/.exec(line))) { importer = scalar(match[1]); importers[importer] = {}; dependencyClass = null; packageName = null; }
  }
  return importers;
}

function lockedVersionFromLocator(locator, repository) {
  if (!locator) return null;
  if (locator.startsWith('link:')) {
    const target = locator.slice(5);
    const manifest = JSON.parse(gitShow(repository.root, repository.revision, `${target}/package.json`));
    return manifest.version || null;
  }
  const withoutPeers = locator.split('(')[0];
  if (withoutPeers.startsWith('npm:')) return withoutPeers.slice(withoutPeers.lastIndexOf('@') + 1);
  return withoutPeers.replace(/^\//, '') || null;
}

function loadLock(repository) {
  const preferred = repository.lockfilePath || (gitPathExists(repository.root, repository.revision, 'pnpm-lock.yaml') ? 'pnpm-lock.yaml' : 'package-lock.json');
  if (!gitPathExists(repository.root, repository.revision, preferred)) return {path: preferred, type: 'missing', data: null};
  const text = gitShow(repository.root, repository.revision, preferred);
  return preferred.endsWith('.yaml') ? {path: preferred, type: 'pnpm', data: parsePnpmImporters(text)} : {path: preferred, type: 'npm', data: JSON.parse(text)};
}

function resolveLock(repository, lock, workspacePath, dependencyClass, packageName, requestedRange) {
  if (lock.type === 'pnpm') {
    const record = lock.data[workspacePath]?.[dependencyClass]?.[packageName];
    const locator = record?.version || null;
    return {lockedVersion: lockedVersionFromLocator(locator, repository), lockLocator: locator, license: 'unknown', status: locator?.startsWith('link:') ? 'workspace-link' : locator ? (repository.lockConsistency === 'stale' ? 'stale-lock' : 'resolved') : 'unresolved'};
  }
  if (lock.type === 'npm') {
    const node = lock.data.packages?.[`node_modules/${packageName}`];
    const rootRange = lock.data.packages?.[workspacePath === '.' ? '' : workspacePath]?.[dependencyClass]?.[packageName];
    const manifestMatches = rootRange === requestedRange;
    return {lockedVersion: node?.version || null, lockLocator: node?.version || null, license: node?.license || 'unknown', status: node && manifestMatches ? (repository.lockConsistency === 'stale' ? 'stale-lock' : 'resolved') : 'unresolved'};
  }
  return {lockedVersion: null, lockLocator: null, license: 'unknown', status: 'unresolved'};
}

function usageClass(packageName, dependencyClass) {
  if (dependencyClass === 'devDependencies') return 'dev';
  return /(?:aws-sdk|smithy|axios|bottleneck|cheerio|dotenv|inquirer|js-yaml|node-fetch|nunjucks|showdown|slugify|xml2js|zod-to-json-schema|ali-oss|fast-xml-parser)/.test(packageName) ? 'build' : 'runtime';
}

function listDependencies(repository) {
  const records = [], lock = loadLock(repository);
  for (const manifestPath of manifestPaths(repository)) {
    const manifest = JSON.parse(gitShow(repository.root, repository.revision, manifestPath));
    const workspacePath = manifestPath === 'package.json' ? '.' : path.posix.dirname(manifestPath);
    for (const dependencyClass of DEPENDENCY_CLASSES) for (const [packageName, requestedRange] of Object.entries(manifest[dependencyClass] || {})) {
      const resolution = resolveLock(repository, lock, workspacePath, dependencyClass, packageName, requestedRange);
      const evidence = resolution.status === 'unresolved'
        ? [`${lock.path} at ${repository.revision} does not provide a trustworthy matching direct resolution. Any literal locator is retained only as source evidence; no replacement version was inferred.`]
        : [`${lock.path} direct importer resolution at pinned commit ${repository.revision}.`, ...(repository.lockConsistency === 'stale' ? ['Task 1 identified the repository lockfile as stale; the recorded locator is not an approved clean-install gate.'] : [])];
      records.push({
        package: packageName, requestedRange, lockedVersion: resolution.lockedVersion, lockLocator: resolution.lockLocator,
        importingWorkspacePackage: manifest.name || workspacePath, importingWorkspacePath: workspacePath,
        usageClass: usageClass(packageName, dependencyClass), owner: dependencyOwner(packageName), capability: dependencyCapability(packageName),
        licenseReview: {status: 'pending', license: resolution.license, evidence: [`License review is required before approval; lock metadata reports ${resolution.license}.`]},
        vulnerabilityReview: {status: 'pending', evidence: ['Run and retain the Task 14 vulnerability gate before approval.']},
        replacesLegacyDependency: `${repository.id}:${manifestPath}:${dependencyClass}:${packageName}`,
        sourceMapping: {sourceRepository: repository.id, sourceRevision: repository.revision, sourcePackageManifest: manifestPath, dependencyClass, lockfilePath: lock.path, resolutionStatus: resolution.status, evidence},
        reviewStatus: 'pending',
      });
    }
  }
  return records;
}

function capability(id, owner, legacy, replacement, disposition, contracts, evidence) {
  return {id, owner, consumers: ['documentation maintainers', 'release engineering'], contracts, legacyEntryPoints: legacy, replacementEntryPoints: replacement, disposition, acceptanceEvidence: evidence};
}

export function seedCapabilities() {
  const future = command => [`Required future gate: ${command}; this inventory does not claim it has passed.`];
  return [
    capability('workspace.commands', 'app', ['pnpm install --frozen-lockfile', 'package.json#scripts.build', 'package.json#scripts.typecheck', 'package.json#scripts.test:frontend'], ['package.json#scripts'], 'change', ['Install, build, typecheck, and test commands preserve nonzero exit behavior on failure.'], future('pnpm install --frozen-lockfile && pnpm build && pnpm typecheck && pnpm test:frontend')),
    capability('site.docusaurus-application', 'app', ['docusaurus.config.ts', 'src/pages'], ['apps/docs/docusaurus.config.ts'], 'preserve', ['Docusaurus application and registered plugins render the documentation site.'], future('pnpm --filter @zdoc/docs build')),
    capability('site.shared-configuration', 'site-config', ['docusaurus.config.ts', 'config', 'sidebars*.ts'], ['packages/site-config'], 'change', ['Shared configuration and plugin registration are centralized without route loss.'], future('node scripts/migration/verify-site-config.mjs')),
    capability('content.english', 'content', ['docs', 'docusaurus.config.ts#plugins', 'sidebarsTutorial.ts', 'sidebarsByoc.ts', 'sidebarsReference.ts'], ['apps/docs/content/en'], 'preserve', ['English content plugins, routes, sidebars, and navigation remain available.'], future('node scripts/migration/verify-routes.mjs --locale en')),
    capability('content.chinese', 'content', ['zdoc_cn:docs', 'zdoc_cn:i18n', 'zdoc_cn:docusaurus.config.js#plugins', 'zdoc_cn:sidebarsTutorial.js', 'zdoc_cn:sidebarsReference.js', 'zdoc_cn:sidebarsAgents.js', 'zdoc_cn:sidebarsOnPremise.js'], ['apps/docs/content/zh-CN'], 'preserve', ['Chinese content plugins, routes, sidebars, and navigation remain available.'], future('node scripts/migration/verify-routes.mjs --locale zh-CN')),
    capability('feature.search', 'site-config', ['@easyops-cn/docusaurus-search-local', '@inkeep/docusaurus'], ['packages/site-config/search'], 'preserve', ['Search integrations remain configured by environment.'], future('pnpm test:e2e --grep search')),
    capability('feature.embedded-markdown', 'ui', ['src/components/Markdown', '@mdx-js/react'], ['packages/docs-ui/embedded-markdown'], 'preserve', ['Embedded Markdown and MDX render safely.'], future('pnpm test --filter embedded-markdown')),
    capability('feature.llms-txt', 'tooling', ['plugins/llms-txt'], ['packages/docs-tooling/llms-txt'], 'preserve', ['llms.txt outputs are deterministic and route-complete.'], future('node scripts/migration/verify-llms-txt.mjs')),
    capability('feature.structured-data', 'site-config', ['docusaurus.config.ts', 'src/theme'], ['packages/site-config/structured-data'], 'preserve', ['Structured data remains valid for published pages.'], future('node scripts/migration/verify-structured-data.mjs')),
    capability('feature.web-metadata', 'site-config', ['static/robots.txt', 'docusaurus.config.ts', 'nginx.conf'], ['packages/site-config/web-metadata'], 'preserve', ['Metadata, robots directives, and redirects retain intended behavior.'], future('node scripts/migration/verify-metadata-robots-redirects.mjs')),
    capability('generation.lark-manuals', 'tooling', ['plugins/lark-docs', 'scripts/docs-workflow'], ['packages/docs-tooling/lark'], 'change', ['Manual generation preserves content-group ownership, bounded concurrency, and atomic publication.'], future('node scripts/migration/verify-publication-atomicity.mjs')),
    capability('generation.reference-rest', 'tooling', ['plugins/apifox-docs'], ['packages/docs-tooling/reference-rest'], 'preserve', ['REST generation preserves provenance and translation coverage.'], future('node scripts/migration/verify-reference-rest.mjs')),
    capability('generation.reference-sdk', 'tooling', ['plugins/lark-docs', 'sidebarsReference.ts'], ['packages/docs-tooling/reference-sdk'], 'preserve', ['SDK generation preserves supported language/version coverage and provenance.'], future('node scripts/migration/verify-reference-sdk.mjs')),
    capability('chinese.normalization', 'adapter', ['zdoc_cn:plugins/cn-publish-normalizer'], ['packages/publication-adapters/chinese-normalizer'], 'preserve', ['Chinese normalization remains deterministic.'], future('pnpm test --filter chinese-normalizer')),
    capability('chinese.rest-replacements', 'adapter', ['zdoc_cn:config/cn-publish-replacements.js', 'zdoc_cn:rest-overrides/zh-CN'], ['packages/publication-adapters/chinese-rest'], 'preserve', ['Chinese REST replacements remain explicit and validated.'], future('node scripts/migration/verify-cn-rest-replacements.mjs')),
    capability('chinese.storage', 'adapter', ['zdoc_cn:plugins/adapters/aliyun-oss'], ['packages/publication-adapters/storage'], 'change', ['Storage publication preserves failure and retry behavior without embedding credentials.'], future('pnpm test --filter publication-storage')),
    capability('deploy.container', 'deploy', ['Dockerfile', 'docker-entrypoint.d'], ['apps/docs/Dockerfile'], 'preserve', ['Container build and runtime environment injection remain functional.'], future('docker build -t unified-docs:test .')),
    capability('deploy.nginx-health', 'deploy', ['nginx.conf', 'zdoc_cn:nginx/zh-CN'], ['apps/docs/nginx'], 'preserve', ['Nginx routing and health checks serve both locales.'], future('node scripts/migration/verify-container-health.mjs')),
    capability('deploy.jenkins-pipelines', 'deploy', ['vdc-jenkins:zilliz-docs/zilliz-docs-dev.groovy', 'vdc-jenkins:zilliz-docs/zilliz-docs-prod.groovy', 'vdc-jenkins:zilliz-docs/zilliz-docs-cn-dev.groovy', 'vdc-jenkins:zilliz-docs/zilliz-docs-cn-prod.groovy'], ['ci/jenkins'], 'change', ['Four English/Chinese development and production pipelines preserve rebuild behavior, specified-image production mode, immutable image selection, and rollback behavior.'], future('node scripts/migration/verify-jenkins-pipelines.mjs')),
    capability('legacy.upstream-materialization', 'tooling', ['zdoc_cn:scripts/upstream/materialize.js'], ['migration/archive/upstream-materialization'], 'retire', ['Retire only after unified source cutover and archive verification.'], future('node scripts/migration/verify-retirement-readiness.mjs')),
    capability('legacy.assembly-overlay', 'tooling', ['zdoc_cn:scripts/upstream/assemble.js', 'zdoc_cn:scripts/upstream/validate-assembled.js', 'zdoc_cn:overlay-manifest.json'], ['migration/archive/overlay-manifest.json'], 'retire', ['Assembly, overlay validation, and copy behavior are retired after parity gates.'], future('node scripts/migration/verify-overlay-parity.mjs')),
    capability('legacy.overlay-patching', 'tooling', ['zdoc_cn:patches/upstream/0001-cn-build-normalizer.patch'], ['packages/publication-adapters/chinese-normalizer'], 'retire', ['Patch behavior is replaced by first-class extension points before retirement.'], future('node scripts/migration/verify-patch-replacement.mjs')),
  ].sort((a, b) => compareText(a.id, b.id));
}

function buildOverlayOperations(repository, legacyFiles) {
  if (!repository || !gitPathExists(repository.root, repository.revision, 'overlay-manifest.json')) return {manifest: {copy: [], patches: []}, operations: []};
  const manifest = JSON.parse(gitShow(repository.root, repository.revision, 'overlay-manifest.json'));
  const downstreamFiles = legacyFiles.filter(entry => entry.sourceRepository === repository.id);
  const operations = [];
  for (const copy of manifest.copy || []) {
    const tracked = downstreamFiles.filter(entry => entry.sourcePath === copy.from || entry.sourcePath.startsWith(`${copy.from}/`));
    const id = overlayIdentity('copy', copy.from, copy.to);
    for (const entry of tracked) {
      const suffix = entry.sourcePath === copy.from ? '' : entry.sourcePath.slice(copy.from.length + 1);
      entry.targetPath = suffix ? `${copy.to}/${suffix}` : copy.to;
      entry.disposition = 'migrate';
      entry.evidence.push(`Covered by pinned overlay operation ${id}.`);
    }
    operations.push({id, type: 'copy', sourceRepository: repository.id, sourceRevision: repository.revision, sourcePath: copy.from, targetPath: copy.to, optional: Boolean(copy.optional), disposition: 'migrate', owner: ownerFor(copy.from), trackedSourcePaths: tracked.map(entry => entry.sourcePath).sort(compareText), evidence: [`overlay-manifest.json at ${repository.revision} declares this copy operation.`, tracked.length ? `${tracked.length} tracked source path(s) are represented in legacy entries.` : 'The optional source is absent at the pinned revision; the operation remains explicitly dispositioned.']});
  }
  for (const patch of manifest.patches || []) {
    const tracked = downstreamFiles.filter(entry => entry.sourcePath === patch.path);
    const id = overlayIdentity('patch', patch.path);
    for (const entry of tracked) { entry.disposition = 'rewrite'; entry.evidence.push(`Covered by pinned overlay operation ${id}.`); }
    operations.push({id, type: 'patch', sourceRepository: repository.id, sourceRevision: repository.revision, sourcePath: patch.path, optional: false, disposition: 'rewrite', owner: 'tooling', trackedSourcePaths: tracked.map(entry => entry.sourcePath), evidence: [`overlay-manifest.json at ${repository.revision} declares this patch operation.`, `Legacy reason: ${patch.reason || 'not recorded'}`, `Retirement condition: ${patch.removeWhen || 'must be reviewed'}`]});
  }
  operations.sort((a, b) => compareText(a.id, b.id));
  validateOverlayCoverage(operations, manifest);
  return {manifest, operations};
}

export function generateInventory({repositories}) {
  if (!Array.isArray(repositories) || repositories.length === 0) fail('repositories', 'must provide explicit source pins');
  for (const repository of repositories) {
    if (!REPOSITORIES.has(repository.id)) fail('repository.id');
    if (!SHA.test(repository.revision || '')) fail(`${repository.id}.revision`, 'must be an explicit 40-character source pin');
    requireString(repository.revisionSource, `${repository.id}.revisionSource`);
    if (repository.evidence !== undefined) requireStringArray(repository.evidence, `${repository.id}.evidence`);
  }
  const legacyFiles = repositories.flatMap(listTracked).sort((a, b) => compareText(`${a.sourceRepository}\0${a.sourcePath}`, `${b.sourceRepository}\0${b.sourcePath}`));
  const overlay = buildOverlayOperations(repositories.find(item => item.id === 'zdoc_cn'), legacyFiles);
  const dependencies = repositories.flatMap(listDependencies).sort((a, b) => compareText([a.sourceMapping.sourceRepository, a.importingWorkspacePath, a.sourceMapping.dependencyClass, a.package].join('\0'), [b.sourceMapping.sourceRepository, b.importingWorkspacePath, b.sourceMapping.dependencyClass, b.package].join('\0')));
  const capabilities = seedCapabilities();
  validateManifest(legacyFiles);
  validateDependencies(dependencies);
  capabilities.forEach(validateCapability);
  const sourceSnapshots = repositories.map(repository => ({sourceRepository: repository.id, revision: repository.revision, revisionSource: repository.revisionSource, evidence: repository.evidence || [`Explicit generateInventory source pin for ${repository.id}.`], lockfilePath: repository.lockfilePath || (gitPathExists(repository.root, repository.revision, 'pnpm-lock.yaml') ? 'pnpm-lock.yaml' : 'package-lock.json'), lockConsistency: repository.lockConsistency || 'unreviewed'})).sort((a, b) => compareText(a.sourceRepository, b.sourceRepository));
  return {sourceSnapshots, legacyFiles, overlayOperations: overlay.operations, capabilities, dependencies};
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--write') result.write = true;
    else if (['--zdoc', '--zdoc-cn', '--snapshots', '--zdoc-revision', '--zdoc-cn-revision'].includes(arg)) result[arg.slice(2)] = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!result.zdoc || !result['zdoc-cn']) throw new Error('Usage: inventory.mjs --zdoc <path> --zdoc-cn <path> [--snapshots <json>] [--zdoc-revision <sha> --zdoc-cn-revision <sha>] --write');
  return result;
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), {recursive: true});
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main(argv) {
  const args = parseArgs(argv);
  const zdocRoot = path.resolve(args.zdoc);
  const snapshotPath = path.resolve(args.snapshots || path.join(zdocRoot, 'migration/source-snapshots.json'));
  const config = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  if (config.schemaVersion !== 1 || !Array.isArray(config.repositories)) fail('source snapshot config');
  const configured = new Map(config.repositories.map(item => [item.id, item]));
  const repositories = [
    {id: 'zdoc', root: zdocRoot, override: args['zdoc-revision']},
    {id: 'zdoc_cn', root: path.resolve(args['zdoc-cn']), override: args['zdoc-cn-revision']},
  ].map(item => {
    const pin = configured.get(item.id);
    if (!pin && !item.override) fail(`${item.id}.revision`, 'is missing from source snapshot config');
    return {...pin, id: item.id, root: item.root, revision: item.override || pin.revision, revisionSource: item.override ? `CLI --${item.id === 'zdoc_cn' ? 'zdoc-cn' : 'zdoc'}-revision` : path.relative(zdocRoot, snapshotPath).split(path.sep).join('/')};
  });
  const result = generateInventory({repositories});
  if (!args.write) return process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  const migrationRoot = path.join(zdocRoot, 'migration');
  writeJson(path.join(migrationRoot, 'legacy-files.json'), {schemaVersion: 2, generatedBy: 'scripts/migration/inventory.mjs', snapshotConfig: path.relative(zdocRoot, snapshotPath).split(path.sep).join('/'), sourceSnapshots: result.sourceSnapshots, overlayOperations: result.overlayOperations, entries: result.legacyFiles});
  writeJson(path.join(migrationRoot, 'capabilities.json'), {schemaVersion: 1, capabilities: result.capabilities});
  writeJson(path.join(migrationRoot, 'dependencies.json'), {schemaVersion: 2, kind: 'direct-dependency-allowlist', sourceSnapshots: result.sourceSnapshots, policy: 'Entries are not allowed until reviewStatus is approved with audited license, vulnerability, and approval evidence. Pinned lock resolution is source evidence, not approval.', dependencies: result.dependencies});
  writeJson(path.join(migrationRoot, 'approved-differences.json'), {schemaVersion: 1, context: 'Unified documentation migration acceptance allowlist. Entries require explicit review, owner, reason, and bounded scope.', differences: []});
  process.stdout.write(JSON.stringify({legacyFiles: result.legacyFiles.length, overlayOperations: result.overlayOperations.length, capabilities: result.capabilities.length, dependencies: result.dependencies.length}) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
