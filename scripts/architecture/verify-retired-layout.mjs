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
const retiredDirectories = ['docs', 'docs-byoc', 'reference', ['i18n', 'zh-CN'].join('/')];
const sourceReferenceExemptions = [
  /^migration\//,
  /^\.claude\/superpowers\/plans\/2026-07-27-new-architecture-retirement\.md$/,
];
const forbiddenReferences = [
  /run-content-group\.js/,
  /config\/generated/,
  /(?:^|[\s'"`(=:])docs\//m,
  /(?:^|[\s'"`(=:])docs-byoc\//m,
  /(?:^|[\s'"`(=:])reference\//m,
];

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
    if (forbiddenReferences.some(pattern => pattern.test(source))) {
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
