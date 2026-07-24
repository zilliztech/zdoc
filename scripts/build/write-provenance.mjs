import {createHash, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const provenanceFile = 'build-provenance.json';
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
  return execFileSync('git', ['ls-files', '-z'], {cwd: repositoryRoot, encoding: 'utf8'})
    .split('\0').filter(Boolean);
}

function hashRequiredFile(repositoryRoot, relativePath, label) {
  return hashBytes(secureReadRegularFile(repositoryRoot, relativePath, label).bytes);
}

function hashContentManifests(repositoryRoot, manifests) {
  const tracked = new Set(trackedFiles(repositoryRoot));
  return [...new Set(manifests)].sort(compareBinary).map(relativePath => {
    const normalized = normalizeRelativePath(relativePath);
    confinedPath(repositoryRoot, normalized, 'content manifest');
    const {bytes, mode} = secureReadRegularFile(repositoryRoot, normalized, 'content manifest');
    if (!tracked.has(normalized)) {
      throw new Error(`Content manifest must be a checked-in file: ${relativePath}`);
    }
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
  return execFileSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'}).trim();
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
  const requestedBuildRelative = path.relative(requestedRoot, path.resolve(buildDirectory));
  const buildRoot = resolveBuildDirectory(root, site, path.resolve(root, requestedBuildRelative));
  const selectionMode = contentManifests === undefined ? 'discovered' : 'explicit';
  const selectedContentManifests = contentManifests ?? discoverContentManifests(root, parsedProfile);
  const contentManifestRecords = hashContentManifests(root, selectedContentManifests);
  if (parsedProfile.content.length > 0 && contentManifestRecords.length === 0) {
    throw new Error(`Site profile ${site} declares content roots and requires at least one selected content manifest`);
  }
  const {records: artifactRecords, routes} = walkArtifactTree(root, buildRoot);
  const selectedEnvironment = Object.fromEntries(
    allowedEnvironmentFields
      .filter(name => environment[name] !== undefined)
      .map(name => [name, String(environment[name])]),
  );
  const commit = git(root, ['rev-parse', 'HEAD']);
  if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`Git returned an invalid commit: ${commit}`);
  const workingTree = git(root, ['status', '--porcelain', '--untracked-files=normal']).length === 0 ? 'clean' : 'dirty';

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
    componentHashes: {
      profile: hashCanonical(parsedProfile),
      lockfile: hashRequiredFile(root, 'pnpm-lock.yaml', 'pnpm lockfile'),
      dependencies: hashRequiredFile(root, 'migration/dependencies.json', 'dependency ledger'),
      legacyFiles: hashRequiredFile(root, 'migration/legacy-files.json', 'legacy file ledger'),
      contentManifests: hashCanonical(contentManifestRecords),
      routes: hashCanonical(routes),
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
  const roots = profile.content.map(content => `${content.sourcePath}/`);
  const generatedRoot = `generated/${profile.id}/manifests/`;
  return [...new Set(trackedFiles(repositoryRoot).filter(file => {
    if (file.startsWith(generatedRoot) && file.endsWith('.json')) return true;
    if (!roots.some(root => file.startsWith(root))) return false;
    const basename = path.posix.basename(file);
    return basename.startsWith('content-manifest') && basename.endsWith('.json');
  }))].sort(compareBinary);
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
