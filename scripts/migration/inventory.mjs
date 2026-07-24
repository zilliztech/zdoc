#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPOSITORIES = new Set(['zdoc', 'zdoc_cn']);
const OWNERS = new Set(['app', 'site-config', 'tooling', 'ui', 'adapter', 'content', 'deploy']);
const DISPOSITIONS = new Set(['defer', 'import', 'retire']);
const CAPABILITY_DISPOSITIONS = new Set(['preserve', 'change', 'retire']);
const DEPENDENCY_CLASSES = new Set(['dependencies', 'devDependencies', 'optionalDependencies']);
const REVIEW_STATUSES = new Set(['pending', 'review']);
const EXCLUDED_ROOTS = new Set(['.git', '.docusaurus', '.zdoc-assembled', '.zdoc-upstream', 'build', 'node_modules', 'playwright-report', 'test-results']);
const SHA = /^[0-9a-f]{40}$/;

function fail(field, detail = 'is invalid') { throw new Error(`${field} ${detail}`); }
function requireString(value, field) { if (typeof value !== 'string' || value.length === 0) fail(field, 'must be a nonempty string'); }
function requireStringArray(value, field) {
  if (!Array.isArray(value) || value.length === 0 || value.some(item => typeof item !== 'string' || item.length === 0)) fail(field, 'must be a nonempty string array');
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
  requireString(entry.evidence, 'evidence');
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
  requireString(dependency.versionRange, 'versionRange');
  if (!REPOSITORIES.has(dependency.sourceRepository)) fail('sourceRepository');
  validateRelativePath(dependency.sourcePackageManifest, 'sourcePackageManifest');
  if (!DEPENDENCY_CLASSES.has(dependency.dependencyClass)) fail('dependencyClass');
  if (!OWNERS.has(dependency.owner)) fail('owner');
  requireString(dependency.capability, 'capability');
  if (!REVIEW_STATUSES.has(dependency.reviewStatus)) fail('reviewStatus', 'must remain pending or review until explicitly approved');
  return dependency;
}

export function validateDependencies(dependencies) {
  if (!Array.isArray(dependencies)) fail('dependencies', 'must be an array');
  const keys = dependencies.map(dependency => {
    validateDependency(dependency);
    return [dependency.sourceRepository, dependency.sourcePackageManifest, dependency.dependencyClass, dependency.package].join('\0');
  });
  if (new Set(keys).size !== keys.length) fail('dependencies', 'contains a duplicate record');
  const sorted = [...keys].sort(compareText);
  if (keys.some((key, index) => key !== sorted[index])) fail('dependencies', 'must be sorted deterministically');
  return dependencies;
}

function compareText(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function git(root, args) { return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim(); }
function included(sourcePath) { return !EXCLUDED_ROOTS.has(sourcePath.split('/')[0]); }

function ownerFor(sourcePath) {
  if (/^(docs|i18n|versioned_docs|rest-overrides|content-config|site-profile)\//.test(sourcePath) || /\.(md|mdx)$/.test(sourcePath)) return 'content';
  if (/^(static|src\/components|src\/theme|packages\/chat-ui)\//.test(sourcePath)) return 'ui';
  if (/^(Dockerfile|nginx|docker-entrypoint|ci\/|\.github\/|Jenkinsfile)/.test(sourcePath)) return 'deploy';
  if (/^(plugins\/adapters|plugins\/cn-publish-normalizer)/.test(sourcePath)) return 'adapter';
  if (/^(scripts|plugins)\//.test(sourcePath)) return 'tooling';
  if (/^(docusaurus\.config|sidebars|config\/|babel\.config|tsconfig)/.test(sourcePath)) return 'site-config';
  return 'app';
}

function dispositionFor(sourcePath) {
  return /(^|\/)(coverage|generated-cache|cache)(\/|$)/.test(sourcePath) ? 'retire' : 'defer';
}

function listTracked(repository) {
  const commit = git(repository.root, ['rev-parse', 'HEAD']);
  const output = git(repository.root, ['ls-tree', '-r', '-z', '--full-tree', commit]);
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
      evidence: `Git blob ${match[2]} at ${repository.id} commit ${commit}.`,
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
  const paths = git(repository.root, ['ls-tree', '-r', '--name-only', 'HEAD']).split('\n').filter(Boolean);
  return paths.filter(item => item === 'package.json' || /^packages\/[^/]+\/package\.json$/.test(item) || /^apps\/[^/]+\/package\.json$/.test(item));
}

function listDependencies(repository) {
  const records = [];
  for (const manifestPath of manifestPaths(repository)) {
    const manifest = JSON.parse(git(repository.root, ['show', `HEAD:${manifestPath}`]));
    for (const dependencyClass of DEPENDENCY_CLASSES) {
      for (const [packageName, versionRange] of Object.entries(manifest[dependencyClass] || {})) {
        records.push({
          package: packageName, versionRange, sourceRepository: repository.id,
          sourcePackageManifest: manifestPath, dependencyClass,
          owner: dependencyOwner(packageName), capability: dependencyCapability(packageName), reviewStatus: 'pending',
        });
      }
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

export function generateInventory({repositories}) {
  const legacyFiles = repositories.flatMap(listTracked).sort((a, b) => compareText(`${a.sourceRepository}\0${a.sourcePath}`, `${b.sourceRepository}\0${b.sourcePath}`));
  const dependencies = repositories.flatMap(listDependencies).sort((a, b) => compareText([a.sourceRepository, a.sourcePackageManifest, a.dependencyClass, a.package].join('\0'), [b.sourceRepository, b.sourcePackageManifest, b.dependencyClass, b.package].join('\0')));
  const capabilities = seedCapabilities();
  validateManifest(legacyFiles);
  validateDependencies(dependencies);
  capabilities.forEach(validateCapability);
  return {legacyFiles, capabilities, dependencies};
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--write') result.write = true;
    else if (arg === '--zdoc' || arg === '--zdoc-cn') result[arg.slice(2)] = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!result.zdoc || !result['zdoc-cn']) throw new Error('Usage: inventory.mjs --zdoc <path> --zdoc-cn <path> --write');
  return result;
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), {recursive: true});
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main(argv) {
  const args = parseArgs(argv);
  const zdocRoot = path.resolve(args.zdoc);
  const result = generateInventory({repositories: [{id: 'zdoc', root: zdocRoot}, {id: 'zdoc_cn', root: path.resolve(args['zdoc-cn'])}]});
  if (!args.write) return process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  const migrationRoot = path.join(zdocRoot, 'migration');
  writeJson(path.join(migrationRoot, 'legacy-files.json'), {schemaVersion: 1, generatedBy: 'scripts/migration/inventory.mjs', entries: result.legacyFiles});
  writeJson(path.join(migrationRoot, 'capabilities.json'), {schemaVersion: 1, capabilities: result.capabilities});
  writeJson(path.join(migrationRoot, 'dependencies.json'), {schemaVersion: 1, policy: 'All unified-target decisions remain pending review unless separately approved.', dependencies: result.dependencies});
  writeJson(path.join(migrationRoot, 'approved-differences.json'), {schemaVersion: 1, context: 'Unified documentation migration acceptance allowlist. Entries require explicit review, owner, reason, and bounded scope.', differences: []});
  process.stdout.write(JSON.stringify({legacyFiles: result.legacyFiles.length, capabilities: result.capabilities.length, dependencies: result.dependencies.length}) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
