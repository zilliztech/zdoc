import {createHash, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const provenanceFile = 'build-provenance.json';
const externalSnapshotWorktree = 'external-snapshot';
const toolRepositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const requireFromApp = createRequire(path.join(toolRepositoryRoot, 'apps/docs/package.json'));
const jiti = requireFromApp('jiti')(fileURLToPath(import.meta.url), {interopDefault: true});
const {SiteProfileSchema, resolveSiteProfile} = jiti(
  path.join(toolRepositoryRoot, 'packages/site-config/src/index.ts'),
);
const allowedEnvironmentFields = Object.freeze([
  'BUILD_ID',
  'BUILD_NUMBER',
  'CI',
  'GIT_BRANCH',
  'GIT_COMMIT',
  'JENKINS_URL',
  'NODE_ENV',
]);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort(compareBinary).map(key => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

function hashBytes(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hashCanonical(value) {
  return hashBytes(canonicalJson(value));
}

function compareBinary(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right));
}

function validateJsonSafe(value, location = 'profile', ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${location} must contain only JSON-safe finite numbers`);
    return;
  }
  if (typeof value !== 'object') {
    throw new Error(`${location} contains non-JSON-safe ${typeof value}`);
  }
  if (ancestors.has(value)) throw new Error(`${location} contains a JSON-unsafe cycle`);
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${location} contains a non-plain JSON-unsafe object`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      validateJsonSafe(value[index], `${location}[${index}]`, ancestors);
    }
  } else {
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new Error(`${location} contains a non-JSON-safe symbol key`);
    }
    for (const [key, entry] of Object.entries(value)) {
      validateJsonSafe(entry, `${location}.${key}`, ancestors);
    }
  }
  ancestors.delete(value);
}

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function resolveRepositoryRoot(repositoryRoot) {
  const resolved = fs.realpathSync(path.resolve(repositoryRoot));
  const stat = fs.lstatSync(resolved);
  if (!stat.isDirectory()) throw new Error(`Repository root is not a directory: ${repositoryRoot}`);
  return resolved;
}

function confinedPath(repositoryRoot, relativePath, label) {
  if (typeof relativePath !== 'string' || relativePath.length === 0 || path.isAbsolute(relativePath)) {
    throw new Error(`${label} must be a non-empty repository-relative path`);
  }
  const normalized = path.posix.normalize(relativePath.replaceAll('\\', '/'));
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`${label} escapes the repository: ${relativePath}`);
  }
  const resolved = path.resolve(repositoryRoot, normalized);
  const prefix = `${path.resolve(repositoryRoot)}${path.sep}`;
  if (!resolved.startsWith(prefix)) {
    throw new Error(`${label} escapes the repository: ${relativePath}`);
  }
  return resolved;
}

function assertSafePathChain(repositoryRoot, absolutePath, label) {
  const relativePath = path.relative(repositoryRoot, absolutePath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    throw new Error(`${label} escapes the real repository root`);
  }
  let current = repositoryRoot;
  for (const segment of relativePath.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error?.code === 'ENOENT') throw new Error(`Missing required ${label}: ${normalizeRelativePath(relativePath)}`);
      throw error;
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} path must not contain a symbolic link: ${normalizeRelativePath(path.relative(repositoryRoot, current))}`);
    }
  }
  const realPath = fs.realpathSync(absolutePath);
  const prefix = `${repositoryRoot}${path.sep}`;
  if (realPath !== repositoryRoot && !realPath.startsWith(prefix)) {
    throw new Error(`${label} real path escapes the repository root`);
  }
  return fs.lstatSync(absolutePath);
}

function secureReadRegularFile(repositoryRoot, relativePath, label) {
  const absolutePath = confinedPath(repositoryRoot, relativePath, label);
  const preStat = assertSafePathChain(repositoryRoot, absolutePath, label);
  const noFollow = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
  const descriptor = fs.openSync(absolutePath, fs.constants.O_RDONLY | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`);
    if (preStat.dev !== stat.dev || preStat.ino !== stat.ino) {
      throw new Error(`${label} changed before it could be read safely: ${relativePath}`);
    }
    const bytes = fs.readFileSync(descriptor);
    const postStat = assertSafePathChain(repositoryRoot, absolutePath, label);
    if (postStat.dev !== stat.dev || postStat.ino !== stat.ino) {
      throw new Error(`${label} changed while it was being read: ${relativePath}`);
    }
    return {bytes, mode: stat.mode & 0o777};
  } finally {
    fs.closeSync(descriptor);
  }
}

function trackedFiles(repositoryRoot) {
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
    .split('\0').filter(Boolean);
}

function pathInRoot(relativePath, root) {
  return relativePath === root || relativePath.startsWith(`${root}/`);
}

function walkReleaseInputRoot(repositoryRoot, relativeRoot, files = []) {
  const absoluteRoot = confinedPath(repositoryRoot, relativeRoot, 'localization input root');
  if (!fs.existsSync(absoluteRoot)) return files;
  const rootStat = assertSafePathChain(repositoryRoot, absoluteRoot, 'localization input root');
  if (!rootStat.isDirectory()) throw new Error(`Localization input root must be a directory: ${relativeRoot}`);
  const visit = (current) => {
    for (const child of fs.readdirSync(current).sort(compareBinary)) {
      const absolutePath = path.join(current, child);
      const relativePath = normalizeRelativePath(path.relative(repositoryRoot, absolutePath));
      const stat = fs.lstatSync(absolutePath);
      if (stat.isSymbolicLink()) throw new Error(`Localization input must not be a symbolic link: ${relativePath}`);
      if (stat.isDirectory()) visit(absolutePath);
      else if (stat.isFile()) files.push(relativePath);
      else throw new Error(`Localization input contains an unsupported entry: ${relativePath}`);
    }
  };
  visit(absoluteRoot);
  return files;
}

function releaseInputDefinition(site) {
  if (site === 'en') {
    return {
      roots: ['generated/en/sidebars', 'i18n/ja-JP'],
      required: ['.translation-cache/ja-JP.json'],
    };
  }
  return {
    roots: ['content/zh-CN/guides/tutorials/tools'],
    required: [
      'config/tools-retirements.json',
      'generated/zh-CN/manifests/tools-translations.json',
      'generated/zh-CN/sidebars/tools.sidebar.js',
    ],
  };
}

export function assertNoInputPathCollisions(relativePaths) {
  const casePaths = new Map();
  const nfcPaths = new Map();
  for (const relativePath of relativePaths) {
    const caseKey = relativePath.toLocaleLowerCase('en-US');
    const caseExisting = casePaths.get(caseKey);
    if (caseExisting && caseExisting !== relativePath) {
      throw new Error(`Localization input case collision: ${caseExisting} and ${relativePath}`);
    }
    casePaths.set(caseKey, relativePath);

    const nfcKey = relativePath.normalize('NFC');
    const nfcExisting = nfcPaths.get(nfcKey);
    if (nfcExisting && nfcExisting !== relativePath) {
      throw new Error(`Localization input Unicode normalization collision: ${nfcExisting} and ${relativePath}`);
    }
    nfcPaths.set(nfcKey, relativePath);
  }
}

function hashLocalizationInputs(repositoryRoot, site, {externalSnapshot = false} = {}) {
  const definition = releaseInputDefinition(site);
  const discovered = [
    ...definition.roots.flatMap(root => walkReleaseInputRoot(repositoryRoot, root)),
    ...definition.required,
  ];
  const actual = [...new Set(discovered)].sort(compareBinary);
  const tracked = externalSnapshot ? undefined : new Set(trackedFiles(repositoryRoot));
  const selected = tracked
    ? [...tracked].filter(relativePath => (
      definition.required.includes(relativePath) ||
      definition.roots.some(root => pathInRoot(relativePath, root))
    )).sort(compareBinary)
    : actual;
  assertNoInputPathCollisions(selected);
  if (tracked) {
    const actualSet = new Set(actual);
    const untracked = actual.filter(relativePath => !tracked.has(relativePath));
    if (untracked.length > 0) {
      throw new Error(`Localization input must be tracked: ${untracked[0]}`);
    }
    const missing = selected.filter(relativePath => !actualSet.has(relativePath));
    if (missing.length > 0) throw new Error(`Missing tracked localization input: ${missing[0]}`);
  }
  for (const required of definition.required) {
    if (!selected.includes(required)) throw new Error(`Missing required localization input: ${required}`);
  }
  return selected.map(relativePath => {
    const {bytes, mode} = secureReadRegularFile(repositoryRoot, relativePath, 'localization input');
    return {path: relativePath, mode, sha256: hashBytes(bytes)};
  });
}

function hashRequiredFile(repositoryRoot, relativePath, label) {
  return hashBytes(secureReadRegularFile(repositoryRoot, relativePath, label).bytes);
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort(compareBinary);
  const wanted = [...expected].sort(compareBinary);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} must contain exactly: ${wanted.join(', ')}`);
  }
}

function validateContentManifest(bytes, content, site, relativePath) {
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`Content manifest is not valid JSON: ${relativePath}`);
  }
  assertExactKeys(manifest, ['schemaVersion', 'site', 'plugin', 'source', 'inventory'], 'content manifest');
  if (manifest.schemaVersion !== 1) throw new Error(`Content manifest schemaVersion must be 1: ${relativePath}`);
  if (manifest.site !== site) throw new Error(`Content manifest site must be ${site}: ${relativePath}`);
  if (manifest.plugin !== content.id) {
    throw new Error(`Content manifest plugin must be ${content.id}: ${relativePath}`);
  }
  assertExactKeys(manifest.source, ['repository', 'legacyPath', 'commit', 'treeId'], 'content manifest source');
  if (typeof manifest.source.repository !== 'string' || manifest.source.repository.length === 0) {
    throw new Error(`Content manifest source repository is invalid: ${relativePath}`);
  }
  const legacyPath = manifest.source.legacyPath;
  if (
    typeof legacyPath !== 'string' || legacyPath.length === 0 || legacyPath.startsWith('/') ||
    legacyPath.includes('\\') || legacyPath.split('/').some(segment => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error(`Content manifest legacyPath is invalid: ${relativePath}`);
  }
  if (!/^[0-9a-f]{40}$/u.test(manifest.source.commit)) {
    throw new Error(`Content manifest source commit is invalid: ${relativePath}`);
  }
  if (!/^[0-9a-f]{40}$/u.test(manifest.source.treeId)) {
    throw new Error(`Content manifest source treeId is invalid: ${relativePath}`);
  }
  assertExactKeys(manifest.inventory, ['trackedFileCount', 'gitLsTreeSha256'], 'content manifest inventory');
  if (!Number.isSafeInteger(manifest.inventory.trackedFileCount) || manifest.inventory.trackedFileCount < 0) {
    throw new Error(`Content manifest inventory trackedFileCount is invalid: ${relativePath}`);
  }
  if (!/^[0-9a-f]{64}$/u.test(manifest.inventory.gitLsTreeSha256)) {
    throw new Error(`Content manifest inventory gitLsTreeSha256 is invalid: ${relativePath}`);
  }
}

function hashContentManifests(repositoryRoot, manifests, profile, tracked = new Set(trackedFiles(repositoryRoot))) {
  const expected = new Map(profile.content.map(content => [
    `${content.sourcePath}/content-manifest.json`,
    content,
  ]));
  const counts = new Map();
  for (const relativePath of manifests) {
    const normalized = normalizeRelativePath(relativePath);
    assertSafePathChain(
      repositoryRoot,
      confinedPath(repositoryRoot, normalized, 'content manifest'),
      'content manifest',
    );
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  for (const [relativePath, content] of expected) {
    if (counts.get(relativePath) !== 1) {
      throw new Error(`Content plugin ${content.id} at ${content.sourcePath} requires exactly one tracked root content manifest`);
    }
  }
  for (const relativePath of counts.keys()) {
    if (!expected.has(relativePath)) {
      throw new Error(`Content manifest is not the declared root manifest of a profile content plugin: ${relativePath}`);
    }
  }
  return [...counts.keys()].sort(compareBinary).map(relativePath => {
    const normalized = normalizeRelativePath(relativePath);
    confinedPath(repositoryRoot, normalized, 'content manifest');
    const {bytes, mode} = secureReadRegularFile(repositoryRoot, normalized, 'content manifest');
    if (!tracked.has(normalized)) {
      throw new Error(`Content manifest must be a checked-in file: ${relativePath}`);
    }
    validateContentManifest(bytes, expected.get(normalized), profile.id, normalized);
    return {
      path: normalized,
      mode,
      sha256: hashBytes(bytes),
    };
  });
}

function routeForHtml(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'/index.html'.length)}`;
  return `/${normalized.slice(0, -'.html'.length)}`;
}

function routeInventories(site, routes, repositoryRoot) {
  if (site === 'en') {
    return {
      en: routes.filter(route => !pathInRoot(route, '/ja-JP')),
      jaJP: routes.filter(route => pathInRoot(route, '/ja-JP')),
    };
  }
  const toolsRoot = 'content/zh-CN/guides/tutorials/tools';
  const toolFiles = walkReleaseInputRoot(repositoryRoot, toolsRoot)
    .filter(relativePath => /\.mdx?$/u.test(relativePath));
  const sidebarPath = 'generated/zh-CN/sidebars/tools.sidebar.js';
  const sidebarAbsolute = confinedPath(repositoryRoot, sidebarPath, 'Tools sidebar');
  secureReadRegularFile(repositoryRoot, sidebarPath, 'Tools sidebar');
  const resolvedSidebar = requireFromApp.resolve(sidebarAbsolute);
  delete requireFromApp.cache[resolvedSidebar];
  const loaded = requireFromApp(resolvedSidebar);
  const sidebar = loaded?.default ?? loaded;
  const sidebarDocIds = new Set();
  const visitSidebar = value => {
    if (Array.isArray(value)) {
      for (const child of value) visitSidebar(child);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (value.type === 'doc' && typeof value.id === 'string') sidebarDocIds.add(value.id);
    visitSidebar(value.items);
  };
  visitSidebar(sidebar);
  if ([...sidebarDocIds].some(id => id === 'docs-agents' || id.startsWith('docs-agents/'))) {
    throw new Error('Chinese Tools sidebar must not contain a docs-agents node');
  }
  const routeSet = new Set(routes);
  if (routes.some(route => route === '/docs-agents' || route.startsWith('/docs-agents/'))) {
    throw new Error('Chinese build must not contain a docs-agents route');
  }
  const tools = toolFiles.map(relativePath => {
    const text = secureReadRegularFile(repositoryRoot, relativePath, 'Chinese Tools document').bytes.toString('utf8');
    const frontmatter = /^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/u.exec(text)?.[1] ?? '';
    const rawSlug = /^slug:\s*['"]?([^'"\n]+)['"]?\s*$/mu.exec(frontmatter)?.[1]?.trim();
    const docId = relativePath.slice('content/zh-CN/guides/'.length).replace(/\.mdx?$/u, '');
    if (!sidebarDocIds.has(docId)) throw new Error(`Chinese Tools document is not reachable from the composed sidebar: ${relativePath}`);
    const slug = rawSlug ? rawSlug.replace(/^\/+|\/+$/gu, '') : docId;
    const route = `/docs/${slug}`.replace(/\/{2,}/gu, '/');
    if (!routeSet.has(route)) throw new Error(`Chinese Tools document route is missing from the final build: ${route}`);
    return route;
  }).sort(compareBinary);
  return {tools, toolsSidebarReachable: [...tools]};
}

function walkArtifactTree(repositoryRoot, root, current = root, records = [], routeSources = new Map()) {
  const relative = path.relative(root, current);
  const stat = assertSafePathChain(repositoryRoot, current, 'artifact tree');
  if (relative && normalizeRelativePath(relative) !== provenanceFile) {
    const record = {path: normalizeRelativePath(relative), mode: stat.mode & 0o777, type: stat.isDirectory() ? 'directory' : 'file'};
    if (stat.isFile()) {
      const repositoryRelative = normalizeRelativePath(path.relative(repositoryRoot, current));
      record.hash = hashBytes(secureReadRegularFile(repositoryRoot, repositoryRelative, 'artifact file').bytes);
      if (relative.endsWith('.html')) {
        const route = routeForHtml(relative);
        const existing = routeSources.get(route);
        if (existing && existing !== record.path) {
          throw new Error(`Route collision for ${route}: ${existing} and ${record.path}`);
        }
        routeSources.set(route, record.path);
      }
    } else if (!stat.isDirectory()) {
      throw new Error(`Artifact tree contains unsupported entry: ${record.path}`);
    }
    records.push(record);
  }
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(current).sort(compareBinary)) {
      if (!relative && child === provenanceFile) continue;
      walkArtifactTree(repositoryRoot, root, path.join(current, child), records, routeSources);
    }
  }
  return {records, routes: [...routeSources.keys()].sort(compareBinary)};
}

function resolveBuildDirectory(repositoryRoot, site, buildDirectory) {
  if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported site: ${site}`);
  const expected = path.resolve(repositoryRoot, 'build', site);
  const actual = path.resolve(buildDirectory);
  if (actual !== expected) {
    throw new Error(`Build directory must be confined to build/${site}`);
  }
  const stat = assertSafePathChain(repositoryRoot, actual, 'build directory');
  if (!stat.isDirectory()) throw new Error(`Build path is not a directory: build/${site}`);
  return actual;
}

function secureWriteProvenance(repositoryRoot, buildRoot, bytes) {
  assertSafePathChain(repositoryRoot, buildRoot, 'build directory');
  const outputPath = path.join(buildRoot, provenanceFile);
  const temporaryPath = path.join(
    buildRoot,
    `.${provenanceFile}.${process.pid}.${randomUUID()}.tmp`,
  );
  const noFollow = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
  let descriptor;
  try {
    descriptor = fs.openSync(
      temporaryPath,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | noFollow,
      0o600,
    );
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Build provenance output must be a regular file');
    fs.writeFileSync(descriptor, bytes);
    fs.fsyncSync(descriptor);
    fs.fchmodSync(descriptor, 0o644);
    fs.closeSync(descriptor);
    descriptor = undefined;
    assertSafePathChain(repositoryRoot, buildRoot, 'build directory');
    fs.renameSync(temporaryPath, outputPath);

    let directoryDescriptor;
    try {
      directoryDescriptor = fs.openSync(buildRoot, fs.constants.O_RDONLY);
      fs.fsyncSync(directoryDescriptor);
    } catch (error) {
      if (!['EINVAL', 'ENOTSUP', 'EISDIR'].includes(error?.code)) throw error;
    } finally {
      if (directoryDescriptor !== undefined) fs.closeSync(directoryDescriptor);
    }
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    try {
      fs.unlinkSync(temporaryPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  assertSafePathChain(repositoryRoot, outputPath, 'build provenance output');
  return outputPath;
}

function git(repositoryRoot, args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function resolveExternalSnapshot(environment) {
  const hasCommit = Object.hasOwn(environment, 'ZDOC_PROVENANCE_COMMIT');
  const hasWorktree = Object.hasOwn(environment, 'ZDOC_PROVENANCE_WORKTREE');
  if (!hasCommit && !hasWorktree) return undefined;
  if (!hasCommit || !hasWorktree) {
    throw new Error('External snapshot provenance requires both commit and worktree mode');
  }
  const commit = String(environment.ZDOC_PROVENANCE_COMMIT);
  const workingTree = String(environment.ZDOC_PROVENANCE_WORKTREE);
  if (workingTree !== externalSnapshotWorktree) {
    throw new Error(`External snapshot provenance worktree mode must be ${externalSnapshotWorktree}`);
  }
  if (!/^[0-9a-f]{40}$/u.test(commit)) {
    throw new Error('External snapshot provenance commit must be a 40-character lowercase Git SHA');
  }
  return {commit, workingTree};
}

function declaredContentManifests(profile) {
  return profile.content
    .map(content => `${content.sourcePath}/content-manifest.json`)
    .sort(compareBinary);
}

export function writeBuildProvenance({
  repositoryRoot,
  site,
  buildDirectory,
  profile,
  contentManifests,
  environment = process.env,
  pnpmVersion,
}) {
  const requestedRoot = path.resolve(repositoryRoot);
  const root = resolveRepositoryRoot(requestedRoot);
  validateJsonSafe(profile);
  const parsedProfile = SiteProfileSchema.parse(profile);
  if (parsedProfile.id !== site) {
    throw new Error(`Resolved profile site ${parsedProfile.id} does not match requested site ${site}`);
  }
  if (parsedProfile.outputDir !== `build/${site}`) {
    throw new Error(`Resolved profile outputDir must be build/${site}`);
  }
  const externalSnapshot = resolveExternalSnapshot(environment);
  const requestedBuildRelative = path.relative(requestedRoot, path.resolve(buildDirectory));
  const buildRoot = resolveBuildDirectory(root, site, path.resolve(root, requestedBuildRelative));
  const selectionMode = contentManifests === undefined
    ? (externalSnapshot ? 'profile-declared' : 'discovered')
    : 'explicit';
  const selectedContentManifests = contentManifests ?? (
    externalSnapshot ? declaredContentManifests(parsedProfile) : discoverContentManifests(root, parsedProfile)
  );
  const snapshotDeclaredManifests = externalSnapshot
    ? new Set(declaredContentManifests(parsedProfile))
    : undefined;
  const contentManifestRecords = hashContentManifests(
    root,
    selectedContentManifests,
    parsedProfile,
    snapshotDeclaredManifests,
  );
  const {records: artifactRecords, routes} = walkArtifactTree(root, buildRoot);
  const localizationInputRecords = hashLocalizationInputs(root, site, {
    externalSnapshot: Boolean(externalSnapshot),
  });
  const finalRouteInventories = routeInventories(site, routes, root);
  const selectedEnvironment = Object.fromEntries(
    allowedEnvironmentFields
      .filter(name => environment[name] !== undefined)
      .map(name => [name, String(environment[name])]),
  );
  const commit = externalSnapshot?.commit ?? git(root, ['rev-parse', 'HEAD']);
  if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`Git returned an invalid commit: ${commit}`);
  const workingTree = externalSnapshot?.workingTree ?? (
    git(root, ['status', '--porcelain', '--untracked-files=normal']).length === 0 ? 'clean' : 'dirty'
  );

  const manifest = {
    schemaVersion: 1,
    repository: 'zdoc',
    commit,
    workingTree,
    site,
    contentManifests: {
      mode: selectionMode,
      records: contentManifestRecords,
    },
    localizationInputs: {
      records: localizationInputRecords,
    },
    routeInventories: finalRouteInventories,
    componentHashes: {
      profile: hashCanonical(parsedProfile),
      lockfile: hashRequiredFile(root, 'pnpm-lock.yaml', 'pnpm lockfile'),
      dependencies: hashRequiredFile(root, 'migration/dependencies.json', 'dependency ledger'),
      legacyFiles: hashRequiredFile(root, 'migration/legacy-files.json', 'legacy file ledger'),
      contentManifests: hashCanonical(contentManifestRecords),
      localizationInputs: hashCanonical(localizationInputRecords),
      routes: hashCanonical(routes),
      routeInventories: hashCanonical(finalRouteInventories),
      environment: hashCanonical(selectedEnvironment),
    },
    environmentFields: Object.keys(selectedEnvironment).sort(),
    routes,
    toolchain: {
      node: process.versions.node,
      pnpm: pnpmVersion ?? execFileSync('pnpm', ['--version'], {cwd: root, encoding: 'utf8'}).trim(),
    },
    artifactHash: hashCanonical(artifactRecords),
  };
  const outputPath = secureWriteProvenance(root, buildRoot, canonicalJson(manifest));
  return {manifest: canonicalize(manifest), outputPath};
}

function parseArguments(argv) {
  const options = {contentManifests: []};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--site') options.site = value;
    else if (argument === '--build') options.buildDirectory = value;
    else if (argument === '--content-manifest') options.contentManifests.push(value);
    else throw new Error(`Unknown argument: ${argument}`);
    if (value === undefined) throw new Error(`Missing value for ${argument}`);
    index += 1;
  }
  if (!options.site) throw new Error('Missing required --site');
  if (!options.buildDirectory) throw new Error('Missing required --build');
  return options;
}

export function discoverContentManifests(repositoryRoot, profile) {
  const tracked = new Set(trackedFiles(repositoryRoot));
  return profile.content
    .map(content => `${content.sourcePath}/content-manifest.json`)
    .filter(relativePath => tracked.has(relativePath))
    .sort(compareBinary);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const repositoryRoot = toolRepositoryRoot;
  const profile = resolveSiteProfile(options.site);
  writeBuildProvenance({
    repositoryRoot,
    site: options.site,
    buildDirectory: path.resolve(process.cwd(), options.buildDirectory),
    profile,
    contentManifests: options.contentManifests.length > 0 ? options.contentManifests : undefined,
  });
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
