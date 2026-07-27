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
  'scripts/docs-workflow/run-content-group.js',
  'config/generated/guides.sidebar.js',
]);
const retiredRoots = ['docs', 'docs-byoc', 'reference', 'config/generated', 'i18n/zh-CN'];
const sourceReferenceExemptions = [
  /^scripts\/architecture\/verify-retired-layout\.mjs$/,
  /^migration\//,
  /^\.claude\/superpowers\/plans\/2026-07-27-new-architecture-retirement\.md$/,
];
const nonProductionRoles = [
  /^\.claude\//,
  /^\.translation-cache\//,
  /^content\//,
  /^i18n\//,
  /^generated\//,
  /^scripts\/migration\//,
  /(?:^|\/)(?:reports|fixtures|snapshots|__fixtures__|__snapshots__|cache|caches|generated)\//,
];
const productionRoots = [/^\.github\//, /^scripts\//, /^config\//, /^deploy\//, /^apps\//, /^packages\//, /^plugins\//];
const filesystemFieldNames = [
  'sourcePath', 'sourceRoot', 'contentRoot', 'outputDir', 'outputPath', 'sidebarPath',
  'overridePath', 'docSourceDir', 'fallbackSourceDir', 'imageDir', 'folder', 'cwd', 'working-directory',
];
const pathValuedField = new RegExp(
  `(?:^|[{,\\n])\\s*["']?(${filesystemFieldNames.join('|')})["']?\\s*[:=]\\s*(?:(["'\\\`])([^"'\\\`\\n]+)\\2|([^\\s,;}\\]]+))`,
  'gm',
);
const shellChangeDirectory = /\bcd\s+(?:(["'])([^"']+)\1|([^\s;&|]+))/g;
const quotedString = /(["'`])([^"'`\n]+)\1/g;
const repositoryRootPathCall = /\bpath\.(?:join|resolve)\(\s*(?:repositoryRoot|repoRoot|root|process\.cwd\(\))\s*,([\s\S]*?)\)/g;
const commanderOption = /\.option\(\s*(["'])([^"']+)\1\s*,\s*(["'])([^"']*)\3\s*,\s*(["'])([^"']+)\5\s*\)/g;
const pathProducingAssignment = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*\([^;\n]*\)/g;
const retiredLiteralAssignment = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(["'`])([^"'`\n]+)\2/g;

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function isRetiredPath(relativePath) {
  return retiredPaths.has(relativePath)
    || retiredRoots.some(root => relativePath === root || relativePath.startsWith(`${root}/`));
}

function isReferenceExempt(relativePath) {
  return sourceReferenceExemptions.some(pattern => pattern.test(relativePath));
}

function isProductionControlFile(relativePath) {
  if (!controlFilePattern.test(relativePath) || /\.(?:test|spec)\.[^.]+$/.test(relativePath)) return false;
  if (isReferenceExempt(relativePath) || nonProductionRoles.some(pattern => pattern.test(relativePath))) return false;
  if (relativePath.endsWith('.md')) return relativePath.startsWith('.github/');
  if (!relativePath.includes('/')) return true;
  return productionRoots.some(pattern => pattern.test(relativePath));
}

function targetsRetiredRoot(relativePath) {
  const normalized = path.posix.normalize(relativePath.replaceAll('\\', '/')).replace(/^\.\//, '');
  return retiredRoots.some(root => normalized === root || normalized.startsWith(`${root}/`));
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function finding(source, match, reference) {
  return {line: lineNumber(source, match.index), reference};
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isFilesystemConsumer(source, identifier) {
  const name = escapeRegExp(identifier);
  return new RegExp(`\\bpath\\.(?:join|resolve)\\([^;\\n]*\\b${name}\\b`).test(source)
    || new RegExp(`\\bfs\\.(?:readFile|writeFile|mkdir|readdir|rm|stat|unlink|copyFile|rename)(?:Sync)?\\([^;\\n]*\\b${name}\\b`).test(source);
}

function functionBody(source, functionName) {
  const header = new RegExp(`\\bfunction\\s+${escapeRegExp(functionName)}\\s*\\([^)]*\\)\\s*\\{`).exec(source);
  if (!header) return null;
  const openingBrace = header.index + header[0].lastIndexOf('{');
  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return {start: openingBrace + 1, source: source.slice(openingBrace + 1, index)};
  }
  return null;
}

function hasRetiredReference(relativePath, source) {
  const retiredRunner = /run-content-group\.js/.exec(source);
  if (retiredRunner) return finding(source, retiredRunner, retiredRunner[0]);

  for (const match of source.matchAll(pathValuedField)) {
    const reference = match[3] ?? match[4];
    if (targetsRetiredRoot(reference)) return finding(source, match, `${match[1]}: ${reference}`);
  }

  for (const match of source.matchAll(shellChangeDirectory)) {
    const reference = match[2] ?? match[3];
    if (targetsRetiredRoot(reference)) return finding(source, match, `cd ${reference}`);
  }

  for (const match of source.matchAll(repositoryRootPathCall)) {
    const segments = [...match[1].matchAll(quotedString)].map(value => value[2]);
    const reference = segments.join('/');
    if (targetsRetiredRoot(reference)) return finding(source, match, reference);
  }

  for (const match of source.matchAll(commanderOption)) {
    const flags = match[2];
    const reference = match[6];
    if (/--(?:output(?:[_-](?:path|dir))?|target[_-]path|destination)\b/.test(flags)
      && targetsRetiredRoot(reference)) return finding(source, match, reference);
  }

  for (const match of source.matchAll(retiredLiteralAssignment)) {
    const identifier = match[1];
    const reference = match[3];
    if (targetsRetiredRoot(reference) && isFilesystemConsumer(source, identifier)) {
      return finding(source, match, reference);
    }
  }

  for (const match of source.matchAll(pathProducingAssignment)) {
    const [, producedPath, producer] = match;
    if (!isFilesystemConsumer(source, producedPath)) continue;
    const body = functionBody(source, producer);
    if (!body) continue;
    for (const literal of body.source.matchAll(quotedString)) {
      if (targetsRetiredRoot(literal[2])) {
        return finding(source, {index: body.start + literal.index}, literal[2]);
      }
    }
  }

  for (const match of source.matchAll(quotedString)) {
    const reference = match[2];
    if (reference.startsWith('./') || reference.startsWith('../')) {
      const destination = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), reference));
      if (targetsRetiredRoot(destination)) return finding(source, match, reference);
    }
  }
  return null;
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
    let source;
    try {
      source = await readFile(path.join(repositoryRoot, relativePath), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    const match = hasRetiredReference(relativePath, source);
    if (match) violations.push(`Retired layout reference in: ${relativePath}:${match.line} (${match.reference})`);
  }

  if (violations.length > 0) throw new Error(`Retired layout violations:\n${violations.join('\n')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyRetiredLayout(process.cwd()).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
