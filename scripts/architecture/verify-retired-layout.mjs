import {execFileSync} from 'node:child_process';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const controlFilePattern = /\.(?:js|mjs|cjs|ts|tsx|json|yml|yaml|sh|md)$/;
const retiredPaths = new Set([
  'docusaurus.config.ts',
  'Dockerfile',
  'nginx.conf',
  'docker-entrypoint.d/40-zdoc-env.sh',
  ['scripts', 'docs-workflow', ['run-content-group', 'js'].join('.')].join('/'),
  ['config', 'generated', 'guides.sidebar.js'].join('/'),
]);
const retiredDirectories = [
  ['do', 'cs'].join(''),
  [['do', 'cs'].join(''), 'byoc'].join('-'),
  ['re', 'ference'].join(''),
  ['i18n', 'zh-CN'].join('/'),
];
const sourceReferenceExemptions = [
  /^migration\//,
  /^\.claude\/superpowers\/plans\/2026-07-27-new-architecture-retirement\.md$/,
];
const retiredReferenceRoots = [...retiredDirectories.slice(0, 3), ['config', 'generated'].join('/')];
const retiredReferencePattern = retiredReferenceRoots.join('|');
const rootPathReference = new RegExp(`(?:^|[\\s'"\\\`(=:])(?:${retiredReferencePattern})/`, 'm');
const pathFieldReference = new RegExp(
  `\\b(?:sourcePath|sourceRoot|folder|cwd)(?:['"\\\`])?\\s*[:=]\\s*(?:['"\\\`])?(?:${retiredDirectories.slice(0, 3).join('|')})(?:['"\\\`])?(?=\\s*(?:[,;}\\]\\n]|$))`,
  'm',
);
const repositoryRootJoinReference = new RegExp(
  `\\bpath\\.(?:join|resolve)\\(\\s*(?:repositoryRoot|repoRoot|root)\\s*,\\s*['"\\\`](?:${retiredDirectories.slice(0, 3).join('|')})['"\\\`]`,
  'm',
);
const quotedRelativeReference = /(['"`])(\.{1,2}\/[^'"`]+)\1/g;

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function isRetiredPath(relativePath) {
  return retiredPaths.has(relativePath)
    || retiredDirectories.some(directory => relativePath.startsWith(`${directory}/`));
}

function isReferenceExempt(relativePath) {
  return sourceReferenceExemptions.some(pattern => pattern.test(relativePath));
}

function isProductionControlFile(relativePath) {
  return controlFilePattern.test(relativePath) && !/\.(?:test|spec)\.[^.]+$/.test(relativePath);
}

function targetsRetiredRoot(relativePath) {
  return retiredReferenceRoots.some(root => relativePath === root || relativePath.startsWith(`${root}/`));
}

function hasRetiredReference(relativePath, source) {
  if (/run-content-group\.js/.test(source)
    || rootPathReference.test(source)
    || pathFieldReference.test(source)
    || repositoryRootJoinReference.test(source)) return true;

  for (const [, , reference] of source.matchAll(quotedRelativeReference)) {
    const destination = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), reference));
    if (targetsRetiredRoot(destination)) return true;
  }
  return false;
}

async function filesIn(directory, prefix = '') {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path.join(directory, entry.name), relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files;
}

async function trackedFiles(repositoryRoot) {
  try {
    return execFileSync('git', ['-C', repositoryRoot, 'ls-files', '-z'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']})
      .split('\0')
      .filter(Boolean);
  } catch {
    return filesIn(repositoryRoot);
  }
}

export async function verifyRetiredLayout(repositoryRoot) {
  const violations = [];
  const files = (await trackedFiles(repositoryRoot)).map(normalize);

  for (const relativePath of files) {
    if (isRetiredPath(relativePath)) violations.push(`Retired path remains: ${relativePath}`);
  }

  for (const relativePath of files) {
    if (!isProductionControlFile(relativePath) || isReferenceExempt(relativePath)) continue;
    const source = await readFile(path.join(repositoryRoot, relativePath), 'utf8');
    if (hasRetiredReference(relativePath, source)) {
      violations.push(`Retired layout reference in: ${relativePath}`);
    }
  }

  if (violations.length > 0) throw new Error(`Retired layout violations:\n${violations.join('\n')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyRetiredLayout(process.cwd()).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
