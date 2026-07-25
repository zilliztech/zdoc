import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {closeSync, lstatSync, openSync, readFileSync, readSync, readdirSync, readlinkSync} from 'node:fs';
import path from 'node:path';

const EXCLUDED_ROOTS = new Set(['.git', '.docusaurus', '.zdoc-assembled', '.zdoc-upstream', 'build', 'node_modules', 'playwright-report', 'test-results']);
const EXCLUDED_PREFIXES = ['.claude/worktrees/', '.worktrees/', '.pnpm-store/', '.codegraph/', 'tmp/'];
const SECRET_FILENAMES = /^(?:\.env(?:\..+)?|credentials?(?:\..+)?|secrets?(?:\..+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|.*\.(?:p12|pfx|jks|keystore))$/i;
const TOKEN_MARKERS = [
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/,
];
const PRIVATE_KEY_MARKER = /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/;
const REPOSITORIES = new Set(['zdoc', 'zdoc_cn']);
const SEVERITY = {
  'secret.filename': 'critical', 'secret.token-marker': 'critical', 'secret.private-key-marker': 'critical',
  'secret.large-binary-quarantine': 'critical', 'allowlist.stale-exception': 'critical',
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

function inspectRegularFile(absolute, size, collectLimit) {
  const hash = createHash('sha256');
  const descriptor = openSync(absolute, 'r');
  const chunk = Buffer.allocUnsafe(64 * 1024);
  const collected = [];
  const decoder = new TextDecoder('utf-8', {fatal: true});
  let rawOverlap = '', tokenMarker = false, privateKeyMarker = false, crlf = false, binary = false, bytesRead;
  try {
    do {
      bytesRead = readSync(descriptor, chunk, 0, chunk.length, null);
      if (!bytesRead) break;
      const bytes = Buffer.from(chunk.subarray(0, bytesRead));
      hash.update(bytes);
      if (size <= collectLimit) collected.push(bytes);
      if (bytes.includes(0)) binary = true;
      const rawWindow = rawOverlap + bytes.toString('latin1');
      tokenMarker ||= TOKEN_MARKERS.some(marker => marker.test(rawWindow));
      privateKeyMarker ||= PRIVATE_KEY_MARKER.test(rawWindow);
      crlf ||= rawWindow.includes('\r\n');
      rawOverlap = rawWindow.slice(-256);
      if (!binary) try { decoder.decode(bytes, {stream: true}); } catch { binary = true; }
    } while (bytesRead);
    if (!binary) try { decoder.decode(); } catch { binary = true; }
  } finally { closeSync(descriptor); }
  return {sha256: hash.digest('hex'), bytes: collected.length ? Buffer.concat(collected) : null, tokenMarker, privateKeyMarker, crlf: !binary && crlf, binary};
}

function referenceLabel(value) { return value.trim().replace(/\s+/g, ' ').toLowerCase(); }

function staticLinks(text) {
  const results = [];
  const occupied = [];
  const occupy = match => occupied.push([match.index, match.index + match[0].length]);
  const overlapsOccupied = match => occupied.some(([start, end]) => match.index < end && match.index + match[0].length > start);
  const inline = /!?(?:\[[^\]]*\])\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of text.matchAll(inline)) {
    results.push(match[1].replace(/^<|>$/g, ''));
    occupy(match);
  }

  const definitions = new Map();
  const definition = /^[ \t]{0,3}\[([^\]\r\n]+)\]:[ \t]*(?:<([^>\r\n]+)>|(\S+))/gm;
  for (const match of text.matchAll(definition)) {
    definitions.set(referenceLabel(match[1]), match[2] || match[3]);
    occupy(match);
  }
  const usage = /!?\[([^\]\r\n]*)\]\[([^\]\r\n]*)\]/g;
  for (const match of text.matchAll(usage)) {
    const target = definitions.get(referenceLabel(match[2] || match[1]));
    if (target) results.push(target);
    occupy(match);
  }
  const shortcut = /!?\[([^\]\r\n]+)\]/g;
  for (const match of text.matchAll(shortcut)) {
    if (overlapsOccupied(match)) continue;
    const target = definitions.get(referenceLabel(match[1]));
    if (target) results.push(target);
  }

  const autolink = /<([a-z][a-z0-9+.-]*:[^<>\s]+)>/gi;
  for (const match of text.matchAll(autolink)) results.push(match[1]);
  const staticAttribute = /(?:^|[<\s])(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`{}]+))/gi;
  for (const match of text.matchAll(staticAttribute)) results.push(match[1] ?? match[2] ?? match[3]);
  return results;
}

function routeAllowed(route, allowedRoutePrefixes, allowedExactRoutes) {
  return allowedExactRoutes.includes(route) || allowedRoutePrefixes.some(prefix => route === prefix || route.startsWith(`${prefix}/`));
}

function classifyStaticTarget(sourcePath, target, contentRoots, allowedRoutePrefixes, allowedExactRoutes) {
  const clean = target.split(/[?#]/, 1)[0];
  if (/^file:\/\//i.test(clean) || /^[A-Za-z]:[\\/]/.test(clean) || clean.startsWith('//') || clean.startsWith('\\\\')) return {rule: 'link.absolute', normalizedTarget: clean};
  if (clean.startsWith('/')) return routeAllowed(clean, allowedRoutePrefixes, allowedExactRoutes) ? null : {rule: 'link.absolute', normalizedTarget: clean};
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith('#') || clean === '') return null;
  const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), clean));
  const containingRoot = contentRoots.filter(root => sourcePath === root || sourcePath.startsWith(`${root}/`)).sort((a, b) => b.length - a.length)[0] || '.';
  const escapedRepository = normalized === '..' || normalized.startsWith('../');
  const escapedContent = containingRoot !== '.' && normalized !== containingRoot && !normalized.startsWith(`${containingRoot}/`);
  return escapedRepository || escapedContent ? {rule: 'link.traversal', normalizedTarget: normalized} : null;
}

function exactKeys(value, expected, label) {
  const actual = Object.keys(value).sort(compareText);
  const wanted = [...expected].sort(compareText);
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) throw new Error(`${label} must contain exactly: ${wanted.join(', ')}`);
}

function validateStringArray(value, label, validator, {allowEmpty = false} = {}) {
  if (!Array.isArray(value) || !allowEmpty && value.length === 0) throw new Error(`${label} must be ${allowEmpty ? 'a' : 'a nonempty'} string array`);
  if (value.some(item => typeof item !== 'string' || !validator(item))) throw new Error(`${label} contains an invalid value`);
  if (new Set(value).size !== value.length) throw new Error(`${label} contains duplicates`);
}

function validContentRoot(value) {
  return value === '.' || value.length > 0 && !value.includes('\\') && !path.posix.isAbsolute(value) && path.posix.normalize(value) === value && value !== '..' && !value.startsWith('../');
}

function validRoute(value, {prefix = false} = {}) {
  return value.startsWith('/') && !value.includes('?') && !value.includes('#') && path.posix.normalize(value) === value && (!prefix || value !== '/') && (value === '/' || !value.endsWith('/'));
}

export function validateScanConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('scan config must be an object');
  exactKeys(config, ['schemaVersion', 'repositories'], 'scan config');
  if (config.schemaVersion !== 1) throw new Error('scan config schemaVersion must be 1');
  if (!Array.isArray(config.repositories) || config.repositories.length === 0) throw new Error('scan config repositories must be a nonempty array');
  const seen = new Set();
  for (const [index, repository] of config.repositories.entries()) {
    if (!repository || typeof repository !== 'object' || Array.isArray(repository)) throw new Error(`scan config repositories[${index}] must be an object`);
    exactKeys(repository, ['id', 'contentRoots', 'allowedRoutePrefixes', 'allowedExactRoutes'], `scan config repositories[${index}]`);
    if (!REPOSITORIES.has(repository.id)) throw new Error(`scan config repositories[${index}].id is invalid`);
    if (seen.has(repository.id)) throw new Error(`scan config contains duplicate repository ${repository.id}`);
    seen.add(repository.id);
    validateStringArray(repository.contentRoots, `scan config ${repository.id}.contentRoots`, validContentRoot);
    validateStringArray(repository.allowedRoutePrefixes, `scan config ${repository.id}.allowedRoutePrefixes`, value => validRoute(value, {prefix: true}), {allowEmpty: true});
    validateStringArray(repository.allowedExactRoutes, `scan config ${repository.id}.allowedExactRoutes`, value => validRoute(value), {allowEmpty: true});
  }
  return config;
}

function validateAllowlist(allowlist) {
  if (!Array.isArray(allowlist)) throw new Error('allowlist must be an array');
  for (const [index, item] of allowlist.entries()) {
    for (const field of ['sourceRepository', 'rule', 'path', 'expectedSha256', 'owner', 'reason']) if (typeof item?.[field] !== 'string' || item[field].length === 0) throw new Error(`allowlist[${index}].${field} must be nonempty`);
    if (!['zdoc', 'zdoc_cn'].includes(item.sourceRepository)) throw new Error(`allowlist[${index}].sourceRepository is invalid`);
    if (path.posix.normalize(item.path) !== item.path || path.posix.isAbsolute(item.path) || item.path.startsWith('../')) throw new Error(`allowlist[${index}].path must be normalized`);
    if (!/^[0-9a-f]{64}$/.test(item.expectedSha256)) throw new Error(`allowlist[${index}].expectedSha256 is invalid`);
  }
}

function finding(rule, relative, hash, detail) {
  return {severity: SEVERITY[rule], status: 'unreviewed', rule, path: relative, sha256: hash, detail};
}

export async function scanIntegrity(rootInput, options = {}) {
  const root = path.resolve(rootInput);
  const repository = options.repository;
  if (!REPOSITORIES.has(repository)) throw new Error('repository must be zdoc or zdoc_cn');
  const maxFileSize = options.maxFileSize ?? 20 * 1024 * 1024;
  const allowlist = options.allowlist ?? [];
  const contentRoots = (options.contentRoots || ['.']).map(item => item.replace(/^\.\/$/, '.'));
  const allowedRoutePrefixes = options.allowedRoutePrefixes || [];
  const allowedExactRoutes = options.allowedExactRoutes || [];
  validateStringArray(contentRoots, 'contentRoots', validContentRoot);
  validateStringArray(allowedRoutePrefixes, 'allowedRoutePrefixes', value => validRoute(value, {prefix: true}), {allowEmpty: true});
  validateStringArray(allowedExactRoutes, 'allowedExactRoutes', value => validRoute(value), {allowEmpty: true});
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
    const inspected = inspectRegularFile(entry.absolute, entry.stats.size, maxFileSize);
    const bytes = inspected.bytes;
    const hash = inspected.sha256;
    if (entry.stats.size > maxFileSize) findings.push(finding('file.too-large', entry.relative, hash, `File size ${entry.stats.size} exceeds limit ${maxFileSize}.`));
    if (entry.stats.size > maxFileSize && inspected.binary) findings.push(finding('secret.large-binary-quarantine', entry.relative, hash, 'Large binary or non-UTF-8 file could not be reliably scanned for embedded secrets and requires quarantine review.'));
    if ((entry.stats.mode & 0o111) !== 0 && !executableAllowed(entry.relative, bytes || Buffer.alloc(0))) findings.push(finding('mode.executable', entry.relative, hash, 'Executable bit is outside the declared executable-path policy.'));
    const trackedMode = trackedModes.get(entry.relative);
    if (trackedMode === '100644' && (entry.stats.mode & 0o111) !== 0 || trackedMode === '100755' && (entry.stats.mode & 0o111) === 0) findings.push(finding('mode.executable-drift', entry.relative, hash, `Working-tree executable bit differs from tracked Git mode ${trackedMode}.`));
    if (SECRET_FILENAMES.test(path.posix.basename(entry.relative))) findings.push(finding('secret.filename', entry.relative, hash, 'Credential-like filename requires removal or explicit review.'));

    if (inspected.crlf && !allowsCrlf(entry.relative, crlfPatterns)) findings.push(finding('line-ending.crlf', entry.relative, hash, 'CRLF is not authorized by checked-in .gitattributes policy.'));
    if (inspected.tokenMarker) findings.push(finding('secret.token-marker', entry.relative, hash, 'A common embedded token marker was detected; value omitted.'));
    if (inspected.privateKeyMarker) findings.push(finding('secret.private-key-marker', entry.relative, hash, 'A private-key marker was detected; value omitted.'));
    if (bytes && !inspected.binary && /\.(?:md|mdx)$/i.test(entry.relative)) {
      const text = bytes.toString('utf8');
      const seenLinks = new Set();
      for (const target of staticLinks(text)) {
        const classified = classifyStaticTarget(entry.relative, target, contentRoots, allowedRoutePrefixes, allowedExactRoutes);
        if (!classified) continue;
        const identity = `${classified.rule}\0${classified.normalizedTarget}`;
        if (seenLinks.has(identity)) continue;
        seenLinks.add(identity);
        findings.push({...finding(classified.rule, entry.relative, hash, classified.rule === 'link.absolute' ? 'Filesystem-absolute static Markdown/MDX link target detected.' : 'Static Markdown/MDX link target escapes the configured content root.'), normalizedTarget: classified.normalizedTarget});
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

  const matchedAllowlist = new Set();
  for (const item of findings) {
    const exception = allowlist.find(candidate => candidate.sourceRepository === repository && candidate.rule === item.rule && candidate.path === item.path && candidate.expectedSha256 === item.sha256);
    if (exception) Object.assign(item, {status: 'allowed', allowance: {owner: exception.owner, reason: exception.reason}});
    if (exception) matchedAllowlist.add(exception);
  }
  for (const exception of allowlist.filter(item => item.sourceRepository === repository && !matchedAllowlist.has(item))) {
    findings.push(finding('allowlist.stale-exception', exception.path, sha256(Buffer.from(`${exception.sourceRepository}\0${exception.rule}\0${exception.path}\0${exception.expectedSha256}`)), 'Relevant allowlist exception did not match the current rule, normalized path, and expected content hash.'));
  }
  findings.sort((a, b) => compareText(`${a.severity}\0${a.rule}\0${a.path}\0${a.normalizedTarget || ''}`, `${b.severity}\0${b.rule}\0${b.path}\0${b.normalizedTarget || ''}`));
  const counts = {};
  for (const item of findings) {
    const key = `${item.severity}:${item.status}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return {schemaVersion: 2, repository, scanContext: {rootLabel: repository, scanMode: 'filesystem', sourceRevision: null, description: 'Filesystem scan of the supplied repository root; no Git commit equivalence is asserted.'}, allowlistDigest: sha256(Buffer.from(JSON.stringify(allowlist))), policy: {maxFileSize, contentRoots, routePolicy: {allowedRoutePrefixes, allowedExactRoutes, staticLinkForms: ['inline Markdown links and images', 'Markdown reference definitions used by reference links or images', 'Markdown autolinks', 'static HTML/MDX href and src attributes'], dynamicJsxExpressions: 'Expression-valued JSX href/src attributes are out of scope for this static scan.'}, excludedRoots: [...EXCLUDED_ROOTS].sort(compareText), excludedOperationalPrefixes: EXCLUDED_PREFIXES, crlfPolicySource: '.gitattributes'}, counts, findings};
}

function hashEntry(entry) {
  if (!entry.absolute || !entry.stats) return sha256(Buffer.from(entry.relative));
  if (entry.stats.isSymbolicLink()) return sha256(Buffer.from(readlinkSync(entry.absolute)));
  return sha256(readFileSync(entry.absolute));
}
