#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const { cp, lstat, mkdir, mkdtemp, open, realpath, rename, rm, rmdir, statfs } = require('node:fs/promises');
const path = require('node:path');
const { validateCheckpointArtifact } = require('./validate-checkpoint-artifact');

const CACHE = '.translation-cache/ja-JP.json';
function insideOrEqual(parent, child) { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel)); }
function conflicts(a, b) { return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`); }
async function maybeLstat(file) { try { return await lstat(file); } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; } }

async function safeTarget(targetDir) {
  const requested = path.resolve(targetDir);
  const stat = await maybeLstat(requested);
  if (stat?.isSymbolicLink()) throw new Error('Target directory must not be a symlink');
  if (!stat || !stat.isDirectory()) throw new Error('Target must be an existing real directory');
  const canonical = await realpath(requested);
  return canonical;
}

async function assertSafeAncestors(root, rel, includeLeaf = false) {
  const parts = rel.split('/'); let current = root;
  for (let i = 0; i < parts.length - (includeLeaf ? 0 : 1); i++) {
    current = path.join(current, parts[i]); const stat = await maybeLstat(current);
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error(`Target symlink ancestor is not allowed: ${parts.slice(0, i + 1).join('/')}`);
  }
}

async function readNoFollow(file, expectedStat, afterLstat) {
  const initial = await lstat(file);
  if (initial.isSymbolicLink() || !initial.isFile()) throw new Error(`Payload is not a regular file: ${file}`);
  if (expectedStat && (initial.dev !== expectedStat.dev || initial.ino !== expectedStat.ino)) throw new Error(`Payload identity changed: ${file}`);
  await afterLstat?.();
  const handle = await open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.dev !== initial.dev || before.ino !== initial.ino) throw new Error(`Payload identity changed: ${file}`);
    const bytes = await handle.readFile(); const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`Payload changed while applying: ${file}`);
    return bytes;
  } finally { await handle.close(); }
}

function parseObject(bytes, label) {
  let value; try { value = JSON.parse(bytes.toString('utf8')); } catch (error) { throw new Error(`${label} is invalid JSON: ${error.message}`); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a JSON object`);
  return value;
}
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}
function equal(a, b) { return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b)); }
function mergeRecord(baseline, artifact, target, prefix = '') {
  const missing = Symbol('missing'), result = {};
  for (const key of [...new Set([...Object.keys(baseline), ...Object.keys(artifact), ...Object.keys(target)])].sort()) {
    const b = Object.hasOwn(baseline, key) ? baseline[key] : missing, a = Object.hasOwn(artifact, key) ? artifact[key] : missing, t = Object.hasOwn(target, key) ? target[key] : missing;
    const eq = (x, y) => x === missing || y === missing ? x === y : equal(x, y);
    let chosen;
    if (eq(a, b)) chosen = t; else if (eq(t, b) || eq(a, t)) chosen = a; else throw new Error(`Translation cache conflict for key: ${prefix}${key}`);
    if (chosen !== missing) result[key] = chosen;
  }
  return result;
}
function mergeCache(baseline, artifact, target) {
  const caches = [baseline, artifact, target];
  const usesFilesSchema = caches.some((cache) => Object.hasOwn(cache, 'files'));
  let result;
  if (usesFilesSchema) {
    for (const cache of caches) if (!cache.files || typeof cache.files !== 'object' || Array.isArray(cache.files)) throw new Error('Translation cache files must be a JSON object');
    const metadata = caches.map((cache) => Object.fromEntries(Object.entries(cache).filter(([key]) => key !== 'files')));
    result = mergeRecord(metadata[0], metadata[1], metadata[2]);
    result.files = mergeRecord(baseline.files, artifact.files, target.files, 'files.');
  } else {
    result = mergeRecord(baseline, artifact, target);
  }
  return Buffer.from(`${JSON.stringify(canonicalize(result), null, 2)}\n`);
}

async function atomicWrite(target, bytes) {
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${Date.now()}.tmp`);
  const handle = await open(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o600);
  try { await handle.writeFile(bytes); } finally { await handle.close(); }
  try { await rename(temporary, target); } finally { await rm(temporary, { force: true }); }
}

function validateOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object');
  const allowed = new Set(['artifactDir', 'targetDir', 'baselineDir', 'hooks']);
  for (const key of Object.keys(options)) if (!allowed.has(key)) throw new Error(`Unknown option: ${key}`);
  for (const name of ['artifactDir', 'targetDir']) if (typeof options[name] !== 'string' || !options[name]) throw new Error(`${name} must be a non-empty string`);
  if (options.baselineDir !== undefined && (typeof options.baselineDir !== 'string' || !options.baselineDir)) throw new Error('baselineDir must be a non-empty string');
  if (options.hooks !== undefined) {
    if (!options.hooks || typeof options.hooks !== 'object' || Array.isArray(options.hooks)) throw new Error('hooks must be an object');
    const hookNames = new Set(['afterManifestRead', 'beforeCopy', 'afterCopy', 'afterCacheLstat', 'beforeDelete', 'beforeCommit', 'beforeRollback', 'afterJournalCopy', 'statfs']);
    for (const [name, hook] of Object.entries(options.hooks)) { if (!hookNames.has(name)) throw new Error(`Unknown hook: ${name}`); if (typeof hook !== 'function') throw new Error(`Hook ${name} must be a function`); }
  }
}

async function captureGuard(root, rels) {
  const identities = new Map();
  for (const rel of ['', ...rels]) {
    const parts = rel ? rel.split('/') : [], limit = rel ? parts.length - 1 : 0; let current = root;
    for (let i = 0; i <= limit; i++) {
      if (i) current = path.join(current, parts[i - 1]);
      const stat = await maybeLstat(current); if (!stat) break;
      if (stat.isSymbolicLink()) throw new Error(`Target identity guard found symlink: ${path.relative(root, current) || '.'}`);
      if (stat.isDirectory()) identities.set(current, { dev: stat.dev, ino: stat.ino });
    }
  }
  return identities;
}
async function verifyGuard(identities) {
  for (const [full, expected] of identities) { const stat = await maybeLstat(full); if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== expected.dev || stat.ino !== expected.ino) throw new Error(`Target identity lost; manual cleanup may be required: ${full}`); }
}
function minimalPaths(paths) { return [...new Set(paths)].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b)).filter((rel, i, all) => !all.slice(0, i).some((parent) => rel.startsWith(`${parent}/`))); }
async function pathSize(full) { const stat = await maybeLstat(full); if (!stat) return 0; if (stat.isSymbolicLink()) throw new Error(`Symlink cannot be journaled: ${full}`); if (stat.isFile()) return stat.size; let total = 0; for (const name of await require('node:fs/promises').readdir(full)) total += await pathSize(path.join(full, name)); return total; }

async function readCacheNoFollow(root, kind, hooks) {
  await assertSafeAncestors(root, CACHE);
  return readNoFollow(path.join(root, CACHE), undefined, () => hooks?.afterCacheLstat?.({ kind, file: path.join(root, CACHE) }));
}

async function applyCheckpointArtifact(options = {}) {
  validateOptions(options);
  // `hooks` is the sole internal fault-injection surface. It is intentionally unavailable through the CLI.
  const hooks = options.hooks;
  const manifest = await validateCheckpointArtifact(options.artifactDir, { testHooks: hooks?.afterManifestRead ? { afterManifestRead: hooks.afterManifestRead } : undefined });
  const artifact = manifest.resolvedDir;
  const target = await safeTarget(options.targetDir);
  if (insideOrEqual(artifact, target) || insideOrEqual(target, artifact)) throw new Error('Artifact and target must not overlap');
  const payload = path.join(artifact, 'payload');
  const payloadStats = new Map();
  for (const entry of manifest.files) payloadStats.set(entry.path, await lstat(path.join(payload, entry.path)));

  let mergedCache = null;
  const cacheEntry = manifest.files.find((entry) => entry.path === CACHE);
  if (cacheEntry) {
    if (typeof options.baselineDir !== 'string' || !options.baselineDir) throw new Error('baselineDir is required for translation cache merge');
    const baseline = await safeTarget(options.baselineDir);
    if (insideOrEqual(target, baseline) || insideOrEqual(baseline, target) || insideOrEqual(artifact, baseline) || insideOrEqual(baseline, artifact)) throw new Error('Baseline must not overlap artifact or target');
    const [a, b, t] = await Promise.all([
      readNoFollow(path.join(payload, CACHE), payloadStats.get(CACHE), () => hooks?.afterCacheLstat?.({ kind: 'artifact', file: path.join(payload, CACHE) })),
      readCacheNoFollow(baseline, 'baseline', hooks),
      readCacheNoFollow(target, 'target', hooks),
    ]);
    mergedCache = mergeCache(parseObject(b, 'Baseline translation cache'), parseObject(a, 'Artifact translation cache'), parseObject(t, 'Target translation cache'));
  }

  const mutationPaths = minimalPaths([...manifest.deletions, ...manifest.files.map((entry) => entry.path)]);
  let guard = await captureGuard(target, mutationPaths);
  const fsInfo = hooks?.statfs ? await hooks.statfs({ target }) : await statfs(target);
  let journalEstimate = 0; for (const rel of mutationPaths) journalEstimate += await pathSize(path.join(target, rel));
  const requiredBytes = manifest.files.reduce((sum, entry) => sum + entry.size, 0) + journalEstimate;
  const availableBytes = Number(fsInfo.bavail) * Number(fsInfo.bsize);
  if (Number.isFinite(availableBytes) && availableBytes < requiredBytes) throw new Error(`Insufficient disk capacity: need ${requiredBytes} bytes, have ${availableBytes}`);

  const journal = await mkdtemp(path.join(path.dirname(target), `.${path.basename(target)}.apply-`));
  const snapshots = [];
  for (let i = 0; i < mutationPaths.length; i++) { const rel = mutationPaths[i], source = path.join(target, rel), stat = await maybeLstat(source); if (stat) { const saved = path.join(journal, String(i)); await cp(source, saved, { recursive: true, dereference: false, preserveTimestamps: true }); await hooks?.afterJournalCopy?.({ rel }); snapshots.push({ rel, saved, existed: true }); } else snapshots.push({ rel, existed: false }); }
  let complete = false;
  const createdDirs = [];
  try {
    for (const rel of [...manifest.deletions].sort((a, b) => b.split('/').length - a.split('/').length || b.localeCompare(a))) { await hooks?.beforeDelete?.({ rel }); await verifyGuard(guard); await assertSafeAncestors(target, rel); await rm(path.join(target, rel), { recursive: true, force: true }); await verifyGuard(guard); }
    await hooks?.beforeCopy?.();
    for (const entry of manifest.files) {
      const rel = entry.path, destination = path.join(target, rel); await assertSafeAncestors(target, rel);
      const parts = rel.split('/'); let current = target;
      for (let i = 0; i < parts.length - 1; i++) {
        current = path.join(current, parts[i]); const stat = await maybeLstat(current);
        if (stat?.isSymbolicLink()) throw new Error(`Target symlink ancestor is not allowed: ${rel}`);
        if (stat && !stat.isDirectory()) { const conflict = parts.slice(0, i + 1).join('/'); if (!manifest.deletions.some((d) => conflicts(d, conflict))) throw new Error(`Unauthorized target conflict: ${conflict}`); await rm(current, { recursive: true, force: true }); }
        if (!(await maybeLstat(current))) { await verifyGuard(guard); await mkdir(current); createdDirs.push(current); guard = await captureGuard(target, mutationPaths); await verifyGuard(guard); }
      }
      const existing = await maybeLstat(destination);
      if (existing?.isSymbolicLink()) throw new Error(`Target symlink is not allowed: ${rel}`);
      if (existing?.isDirectory()) { if (!manifest.deletions.some((d) => conflicts(d, rel))) throw new Error(`Unauthorized target conflict: ${rel}`); await rm(destination, { recursive: true }); }
      const bytes = rel === CACHE ? mergedCache : await readNoFollow(path.join(payload, rel), payloadStats.get(rel));
      await hooks?.beforeCommit?.({ rel }); await verifyGuard(guard); await atomicWrite(destination, bytes); guard = await captureGuard(target, mutationPaths); await verifyGuard(guard); await hooks?.afterCopy?.({ rel });
    }
    complete = true;
    return Object.freeze({ group: manifest.group, copied: manifest.files.length, deletions: manifest.deletions.length, translationCacheMerged: Boolean(cacheEntry) });
  } finally {
    if (!complete) {
      try {
        await hooks?.beforeRollback?.(); await verifyGuard(guard);
        for (const snapshot of [...snapshots].sort((a, b) => b.rel.split('/').length - a.rel.split('/').length)) { await verifyGuard(guard); const full = path.join(target, snapshot.rel); if (await maybeLstat(full)) await rm(full, { recursive: true, force: true }); await verifyGuard(guard); }
        for (const snapshot of snapshots.filter((x) => x.existed)) { await verifyGuard(guard); await mkdir(path.dirname(path.join(target, snapshot.rel)), { recursive: true }); await cp(snapshot.saved, path.join(target, snapshot.rel), { recursive: true, dereference: false, preserveTimestamps: true }); guard = await captureGuard(target, mutationPaths); await verifyGuard(guard); }
        for (const dir of createdDirs.reverse()) { await verifyGuard(guard); try { await rmdir(dir); } catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTEMPTY') throw error; } guard = await captureGuard(target, mutationPaths); await verifyGuard(guard); }
      } catch (rollbackError) { throw new Error(`Apply failed and safe rollback was refused; manual cleanup may be required: ${rollbackError.message}`); }
    }
    await rm(journal, { recursive: true, force: true });
  }
}

function usage() { return 'Usage: node apply-checkpoint-artifact.js --artifact <dir> --target <dir> [--baseline-dir <dir>]'; }
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  const names = { artifact: 'artifactDir', target: 'targetDir', 'baseline-dir': 'baselineDir' }, result = {}, seen = new Set();
  for (let i = 0; i < args.length; i += 2) { const flag = args[i], value = args[i + 1]; if (!flag?.startsWith('--') || value === undefined) throw new Error(usage()); const key = flag.slice(2); if (!names[key]) throw new Error(`Unknown argument: --${key}`); if (seen.has(key)) throw new Error(`Duplicate argument: --${key}`); seen.add(key); result[names[key]] = value; }
  if (!result.artifactDir || !result.targetDir) throw new Error(usage()); return result;
}
if (require.main === module) (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await applyCheckpointArtifact(args); })().catch((error) => { console.error(`Checkpoint artifact apply failed: ${error.message}`); process.exitCode = 1; });
module.exports = { applyCheckpointArtifact, mergeCache };
