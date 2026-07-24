#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const EXCLUDED_ROOTS = new Set(['.git', '.docusaurus', '.zdoc-assembled', '.zdoc-upstream', 'build', 'node_modules', 'playwright-report', 'test-results']);
const EXCLUDED_PREFIXES = ['.claude/worktrees/', '.worktrees/', '.pnpm-store/'];
const SECRET_FILENAMES = /^(?:\.env(?:\..+)?|credentials?(?:\..+)?|secrets?(?:\..+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|.*\.(?:p12|pfx|jks|keystore))$/i;
const TOKEN_MARKERS = [
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/,
];
const PRIVATE_KEY_MARKER = /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/;
const SEVERITY = {
  'secret.filename': 'critical', 'secret.token-marker': 'critical', 'secret.private-key-marker': 'critical',
  'symlink.unapproved': 'high', 'link.absolute': 'high', 'link.traversal': 'high',
  'path.case-collision': 'high', 'path.unicode-collision': 'high', 'file.too-large': 'medium',
  'mode.executable': 'medium', 'mode.executable-drift': 'medium', 'line-ending.crlf': 'medium',
};

function compareText(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function normalizedRelative(root, absolute) { return path.relative(root, absolute).split(path.sep).join('/'); }

function gitPaths(root) {
  try { return execFileSync('git', ['-C', root, 'ls-files', '-z'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).split('\0').filter(Boolean); }
  catch { return []; }
}

function gitModes(root) {
  try {
    const records = execFileSync('git', ['-C', root, 'ls-files', '--stage', '-z'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).split('\0').filter(Boolean);
    return new Map(records.flatMap(record => {
      const match = /^(\d+) [0-9a-f]+ \d+\t([\s\S]+)$/.exec(record);
      return match ? [[match[2], match[1]]] : [];
    }));
  } catch { return new Map(); }
}

function walk(root) {
  const entries = [];
  function visit(directory) {
    for (const item of readdirSync(directory, {withFileTypes: true}).sort((a, b) => compareText(a.name, b.name))) {
      const absolute = path.join(directory, item.name);
      const relative = normalizedRelative(root, absolute);
      if (relative.split('/').some(component => EXCLUDED_ROOTS.has(component)) || EXCLUDED_PREFIXES.some(prefix => `${relative}/`.startsWith(prefix))) continue;
      const stats = lstatSync(absolute);
      if (stats.isDirectory()) visit(absolute);
      else entries.push({absolute, relative, stats});
    }
  }
  visit(root);
  return entries;
}

function parseAttributes(root) {
  const file = path.join(root, '.gitattributes');
  try {
    return readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).flatMap(line => {
      const [pattern, ...attributes] = line.split(/\s+/);
      return attributes.includes('eol=crlf') ? [pattern] : [];
    });
  } catch { return []; }
}

function globMatches(pattern, relative) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('**', '\0').replaceAll('*', '[^/]*').replaceAll('?', '[^/]').replaceAll('\0', '.*');
  return new RegExp(`^(?:${escaped}|.*/${escaped})$`).test(relative);
}

function allowsCrlf(relative, patterns) { return patterns.some(pattern => globMatches(pattern, relative)); }
function executableAllowed(relative, bytes) {
  return /^(?:scripts|bin|ci|docker-entrypoint\.d|\.github)\//.test(relative)
    || /(?:^|\/)(?:Dockerfile|Jenkinsfile[^/]*)$/.test(relative)
    || /\.(?:sh|bash|zsh|command)$/.test(relative)
    || bytes.subarray(0, 2).toString() === '#!';
}

function markdownLinks(text) {
  const results = [];
  const matcher = /!?(?:\[[^\]]*\])\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of text.matchAll(matcher)) results.push(match[1].replace(/^<|>$/g, ''));
  return results;
}

function validateAllowlist(allowlist) {
  if (!Array.isArray(allowlist)) throw new Error('allowlist must be an array');
  for (const [index, item] of allowlist.entries()) {
    for (const field of ['rule', 'path', 'owner', 'reason']) if (typeof item?.[field] !== 'string' || item[field].length === 0) throw new Error(`allowlist[${index}].${field} must be nonempty`);
  }
}

function finding(rule, relative, hash, detail) {
  return {severity: SEVERITY[rule], status: 'unreviewed', rule, path: relative, sha256: hash, detail};
}

export async function scanIntegrity(rootInput, options = {}) {
  const root = path.resolve(rootInput);
  const maxFileSize = options.maxFileSize ?? 20 * 1024 * 1024;
  const allowlist = options.allowlist ?? [];
  validateAllowlist(allowlist);
  const entries = walk(root);
  const findings = [];
  const crlfPatterns = parseAttributes(root);
  const trackedModes = gitModes(root);
  const caseGroups = new Map();
  const unicodeGroups = new Map();

  const collisionEntries = new Map(entries.map(entry => [entry.relative, entry]));
  for (const relative of gitPaths(root)) if (!collisionEntries.has(relative) && !relative.split('/').some(component => EXCLUDED_ROOTS.has(component)) && !EXCLUDED_PREFIXES.some(prefix => `${relative}/`.startsWith(prefix))) collisionEntries.set(relative, {relative});
  for (const entry of collisionEntries.values()) {
    const caseKey = entry.relative.toLocaleLowerCase('en-US');
    const unicodeKey = entry.relative.normalize('NFC');
    caseGroups.set(caseKey, [...(caseGroups.get(caseKey) || []), entry]);
    unicodeGroups.set(unicodeKey, [...(unicodeGroups.get(unicodeKey) || []), entry]);
  }

  for (const entry of entries) {
    if (entry.stats.isSymbolicLink()) {
      const linkText = Buffer.from(readlinkSync(entry.absolute));
      findings.push(finding('symlink.unapproved', entry.relative, sha256(linkText), 'Symbolic link requires explicit review; target content was not read.'));
      continue;
    }
    if (!entry.stats.isFile()) continue;
    const bytes = readFileSync(entry.absolute);
    const hash = sha256(bytes);
    if (entry.stats.size > maxFileSize) findings.push(finding('file.too-large', entry.relative, hash, `File size ${entry.stats.size} exceeds limit ${maxFileSize}.`));
    if ((entry.stats.mode & 0o111) !== 0 && !executableAllowed(entry.relative, bytes)) findings.push(finding('mode.executable', entry.relative, hash, 'Executable bit is outside the declared executable-path policy.'));
    const trackedMode = trackedModes.get(entry.relative);
    if (trackedMode === '100644' && (entry.stats.mode & 0o111) !== 0 || trackedMode === '100755' && (entry.stats.mode & 0o111) === 0) findings.push(finding('mode.executable-drift', entry.relative, hash, `Working-tree executable bit differs from tracked Git mode ${trackedMode}.`));
    if (SECRET_FILENAMES.test(path.posix.basename(entry.relative))) findings.push(finding('secret.filename', entry.relative, hash, 'Credential-like filename requires removal or explicit review.'));

    const textCandidate = entry.stats.size <= Math.max(maxFileSize, 2 * 1024 * 1024) && !bytes.includes(0);
    if (!textCandidate) continue;
    const text = bytes.toString('utf8');
    if (text.includes('\r\n') && !allowsCrlf(entry.relative, crlfPatterns)) findings.push(finding('line-ending.crlf', entry.relative, hash, 'CRLF is not authorized by checked-in .gitattributes policy.'));
    if (TOKEN_MARKERS.some(marker => marker.test(text))) findings.push(finding('secret.token-marker', entry.relative, hash, 'A common embedded token marker was detected; value omitted.'));
    if (PRIVATE_KEY_MARKER.test(text)) findings.push(finding('secret.private-key-marker', entry.relative, hash, 'A private-key marker was detected; value omitted.'));
    if (/\.(?:md|mdx)$/i.test(entry.relative)) {
      for (const target of markdownLinks(text)) {
        const targetPath = target.split(/[?#]/, 1)[0];
        if (targetPath.startsWith('/') && !targetPath.startsWith('//')) findings.push(finding('link.absolute', entry.relative, hash, 'Repository-absolute Markdown/MDX link detected.'));
        if (!/^[a-z][a-z0-9+.-]*:/i.test(targetPath) && targetPath.split('/').includes('..')) findings.push(finding('link.traversal', entry.relative, hash, 'Path-traversal Markdown/MDX link detected.'));
      }
    }
  }

  for (const group of caseGroups.values()) {
    const names = new Set(group.map(item => item.relative));
    if (names.size > 1) for (const item of group) findings.push(finding('path.case-collision', item.relative, hashEntry(item), 'Path collides after case folding.'));
  }
  for (const group of unicodeGroups.values()) {
    const names = new Set(group.map(item => item.relative));
    if (names.size > 1) for (const item of group) findings.push(finding('path.unicode-collision', item.relative, hashEntry(item), 'Path collides after Unicode NFC normalization.'));
  }

  for (const item of findings) {
    const exception = allowlist.find(candidate => candidate.rule === item.rule && candidate.path === item.path);
    if (exception) Object.assign(item, {status: 'allowed', allowance: {owner: exception.owner, reason: exception.reason}});
  }
  findings.sort((a, b) => `${a.severity}\0${a.rule}\0${a.path}`.localeCompare(`${b.severity}\0${b.rule}\0${b.path}`));
  const counts = {};
  for (const item of findings) {
    const key = `${item.severity}:${item.status}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return {schemaVersion: 1, root: '.', policy: {maxFileSize, excludedRoots: [...EXCLUDED_ROOTS].sort(compareText), excludedOperationalPrefixes: EXCLUDED_PREFIXES, crlfPolicySource: '.gitattributes'}, counts, findings};
}

function hashEntry(entry) {
  if (!entry.absolute || !entry.stats) return sha256(Buffer.from(entry.relative));
  if (entry.stats.isSymbolicLink()) return sha256(Buffer.from(readlinkSync(entry.absolute)));
  return sha256(readFileSync(entry.absolute));
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (['--root', '--report', '--allowlist', '--max-file-size'].includes(arg)) result[arg.slice(2)] = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!result.root || !result.report) throw new Error('Usage: integrity.mjs --root <path> --report <path> [--allowlist <json>] [--max-file-size <bytes>]');
  return result;
}

async function main(argv) {
  const args = parseArgs(argv);
  const defaultAllowlist = path.resolve('migration/integrity-allowlist.json');
  const allowlistPath = args.allowlist ? path.resolve(args.allowlist) : existsSync(defaultAllowlist) ? defaultAllowlist : null;
  const allowlist = allowlistPath ? JSON.parse(readFileSync(allowlistPath, 'utf8')).exceptions : [];
  const report = await scanIntegrity(args.root, {allowlist, ...(args['max-file-size'] ? {maxFileSize: Number(args['max-file-size'])} : {})});
  const reportPath = path.resolve(args.report);
  mkdirSync(path.dirname(reportPath), {recursive: true});
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report.counts)}\n`);
  if (report.findings.some(item => item.severity === 'critical' && item.status === 'unreviewed')) process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
