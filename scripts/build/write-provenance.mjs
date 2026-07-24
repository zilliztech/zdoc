import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const provenanceFile = 'build-provenance.json';
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
      Object.keys(value).sort().map(key => [key, canonicalize(value[key])]),
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

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join('/');
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

function requiredRegularFile(repositoryRoot, relativePath, label) {
  const absolutePath = confinedPath(repositoryRoot, relativePath, label);
  let stat;
  try {
    stat = fs.lstatSync(absolutePath);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`Missing required ${label}: ${relativePath}`);
    throw error;
  }
  if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symbolic link: ${relativePath}`);
  if (!stat.isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`);
  return {absolutePath, stat};
}

function trackedFiles(repositoryRoot) {
  return execFileSync('git', ['ls-files', '-z'], {cwd: repositoryRoot, encoding: 'utf8'})
    .split('\0').filter(Boolean);
}

function hashRequiredFile(repositoryRoot, relativePath, label) {
  const {absolutePath} = requiredRegularFile(repositoryRoot, relativePath, label);
  return hashBytes(fs.readFileSync(absolutePath));
}

function hashContentManifests(repositoryRoot, manifests) {
  const tracked = new Set(trackedFiles(repositoryRoot));
  const records = [...new Set(manifests)].sort().map(relativePath => {
    const normalized = normalizeRelativePath(relativePath);
    const {absolutePath, stat} = requiredRegularFile(repositoryRoot, normalized, 'content manifest');
    if (!tracked.has(normalized)) {
      throw new Error(`Content manifest must be a checked-in file: ${relativePath}`);
    }
    return {
      path: normalized,
      mode: stat.mode & 0o777,
      hash: hashBytes(fs.readFileSync(absolutePath)),
    };
  });
  return hashCanonical(records);
}

function routeForHtml(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'/index.html'.length)}`;
  return `/${normalized.slice(0, -'.html'.length)}`;
}

function walkArtifactTree(root, current = root, records = [], routes = []) {
  const relative = path.relative(root, current);
  const stat = fs.lstatSync(current);
  if (stat.isSymbolicLink()) {
    throw new Error(`Artifact tree must not contain symbolic links: ${normalizeRelativePath(relative)}`);
  }
  if (relative && normalizeRelativePath(relative) !== provenanceFile) {
    const record = {path: normalizeRelativePath(relative), mode: stat.mode & 0o777, type: stat.isDirectory() ? 'directory' : 'file'};
    if (stat.isFile()) {
      record.hash = hashBytes(fs.readFileSync(current));
      if (relative.endsWith('.html')) routes.push(routeForHtml(relative));
    } else if (!stat.isDirectory()) {
      throw new Error(`Artifact tree contains unsupported entry: ${record.path}`);
    }
    records.push(record);
  }
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(current).sort()) {
      if (!relative && child === provenanceFile) continue;
      walkArtifactTree(root, path.join(current, child), records, routes);
    }
  }
  return {records, routes: [...new Set(routes)].sort()};
}

function resolveBuildDirectory(repositoryRoot, site, buildDirectory) {
  if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported site: ${site}`);
  const expected = path.resolve(repositoryRoot, 'build', site);
  const actual = path.resolve(buildDirectory);
  if (actual !== expected) {
    throw new Error(`Build directory must be confined to build/${site}`);
  }
  let stat;
  try {
    stat = fs.lstatSync(actual);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`Missing required build directory: build/${site}`);
    throw error;
  }
  if (stat.isSymbolicLink()) throw new Error('Build directory must not be a symbolic link');
  if (!stat.isDirectory()) throw new Error(`Build path is not a directory: build/${site}`);
  return actual;
}

function git(repositoryRoot, args) {
  return execFileSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'}).trim();
}

export function writeBuildProvenance({
  repositoryRoot,
  site,
  buildDirectory,
  profile,
  contentManifests = [],
  environment = process.env,
  pnpmVersion,
}) {
  const root = path.resolve(repositoryRoot);
  if (!profile || profile.id !== site) {
    throw new Error(`Resolved profile site ${profile?.id ?? '(missing)'} does not match requested site ${site}`);
  }
  if (profile.outputDir !== `build/${site}`) {
    throw new Error(`Resolved profile outputDir must be build/${site}`);
  }
  const buildRoot = resolveBuildDirectory(root, site, buildDirectory);
  const {records: artifactRecords, routes} = walkArtifactTree(buildRoot);
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
    componentHashes: {
      profile: hashCanonical(profile),
      lockfile: hashRequiredFile(root, 'pnpm-lock.yaml', 'pnpm lockfile'),
      dependencies: hashRequiredFile(root, 'migration/dependencies.json', 'dependency ledger'),
      legacyFiles: hashRequiredFile(root, 'migration/legacy-files.json', 'legacy file ledger'),
      contentManifests: hashContentManifests(root, contentManifests),
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
  const outputPath = path.join(buildRoot, provenanceFile);
  fs.writeFileSync(outputPath, canonicalJson(manifest), {mode: 0o644});
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

function discoverContentManifests(repositoryRoot, profile) {
  const roots = profile.content.map(content => `${content.sourcePath}/`);
  return trackedFiles(repositoryRoot).filter(file =>
    roots.some(root => file.startsWith(root)) && /(?:^|\/)content-manifest(?:\.[^/]+)?\.json$/u.test(file),
  ).sort();
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const requireFromApp = createRequire(path.join(repositoryRoot, 'apps/docs/package.json'));
  const jiti = requireFromApp('jiti')(fileURLToPath(import.meta.url), {interopDefault: true});
  const {resolveSiteProfile} = jiti(path.join(repositoryRoot, 'packages/site-config/src/index.ts'));
  const profile = resolveSiteProfile(options.site);
  const contentManifests = options.contentManifests.length > 0
    ? options.contentManifests
    : discoverContentManifests(repositoryRoot, profile);
  writeBuildProvenance({
    repositoryRoot,
    site: options.site,
    buildDirectory: path.resolve(process.cwd(), options.buildDirectory),
    profile,
    contentManifests,
  });
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
