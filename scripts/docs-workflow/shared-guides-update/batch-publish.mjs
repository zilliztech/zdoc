// Private filesystem publisher, invoked only by batch-report.mjs with a bounded stdin frame.
// The kernel cwd anchors every mutation even if the parent namespace is replaced.
import { lstatSync, readdirSync, readSync, mkdirSync, rmdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { basename, isAbsolute, join, parse, sep } from 'node:path'

const LIMIT = 16 * 1024 * 1024, METADATA_LIMIT = 4096
class Changed extends Error {}
const changed = () => { throw new Changed() }
const same = (a, b) => a && b && a.dev === b.dev && a.ino === b.ino
let output, outputIdentity, created = false
const files = []

// Cleanup binds a second kernel cwd to the owned leaf, since its basename can also be
// replaced. It only unlinks known files; it never recursively traverses a resolved leaf.
const cleanupProgram = `// Owned-directory cleanup
import { lstatSync, readFileSync, unlinkSync } from 'node:fs';
try {
  const value = JSON.parse(readFileSync(0, 'utf8'));
  const same = (a, b) => a.dev === b.dev && a.ino === b.ino;
  if (!same(lstatSync('.'), value.directory)) throw Error();
  for (const file of value.files) {
    if (!['batch-report.json', 'batch-report.md'].includes(file.name)) throw Error();
    let now; try { now = lstatSync(file.name); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (!now.isFile() || !same(now, file)) continue;
    unlinkSync(file.name);
  }
} catch { process.exitCode = 1; }`
const writeProgram = `// Owned-directory writes
import { lstatSync, readdirSync, readSync, openSync, fstatSync, writeFileSync, closeSync } from 'node:fs';
const records = []; let ok = false;
try {
  const read = size => {
    const bytes = Buffer.alloc(size); let at = 0;
    while (at < size) { const n = readSync(0, bytes, at, size - at, null); if (!n) throw Error(); at += n; }
    return bytes;
  };
  const size = read(4).readUInt32BE(0); if (size > 4096) throw Error();
  const value = JSON.parse(read(size).toString('utf8')), here = lstatSync('.');
  if (here.dev !== value.directory.dev || here.ino !== value.directory.ino || readdirSync('.').length ||
      ![value.jsonBytes, value.markdownBytes].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 16 * 1024 * 1024)) throw Error();
  for (const [name, length] of [['batch-report.json', value.jsonBytes], ['batch-report.md', value.markdownBytes]]) {
    const bytes = read(length), fd = openSync(name, 'wx+', 0o600);
    try {
      const info = fstatSync(fd); records.push({ name, dev: info.dev, ino: info.ino, bytes: length });
      writeFileSync(fd, bytes);
      if (fstatSync(fd).size !== length) throw Error();
      const verified = Buffer.alloc(length); let at = 0;
      while (at < length) { const n = readSync(fd, verified, at, length - at, at); if (!n) throw Error(); at += n; }
      if (!verified.equals(bytes)) throw Error();
    }
    finally { closeSync(fd); }
  }
  if (records.length !== 2 || readdirSync('.').length !== 2 || records.some(file => {
    const now = lstatSync(file.name); return !now.isFile() || now.dev !== file.dev || now.ino !== file.ino || now.size !== file.bytes;
  })) throw Error();
  ok = true;
} catch {}
process.stdout.write(JSON.stringify({ ok, records }));`
const childEnvironment = () => ({ PATH: process.env.PATH, LC_ALL: 'C' })
function cleanup(name, identity) {
  if (!name || !identity) return
  try {
    execFileSync(process.execPath, ['--input-type=module', '-e', cleanupProgram], { cwd: name,
      env: childEnvironment(), timeout: 5000, maxBuffer: 1024,
      input: JSON.stringify({ directory: { dev: identity.dev, ino: identity.ino }, files }), stdio: ['pipe', 'pipe', 'pipe'] })
    // Nonrecursive rmdir cannot traverse a replacement symlink or remove another directory's files.
    if (created) rmdirSync(name)
  } catch {} // Fail closed; retain bounded private residue when ownership cannot be rebound.
}
function writeOwned(json, markdown) {
  const metadata = Buffer.from(JSON.stringify({ directory: { dev: outputIdentity.dev, ino: outputIdentity.ino },
    jsonBytes: json.length, markdownBytes: markdown.length }))
  const header = Buffer.alloc(4); header.writeUInt32BE(metadata.length)
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', writeProgram], { cwd: output,
    env: childEnvironment(), timeout: 10_000, maxBuffer: 1024,
    input: Buffer.concat([header, metadata, json, markdown]), stdio: ['pipe', 'pipe', 'pipe'] })
  const written = JSON.parse(result.toString())
  files.push(...written.records)
  if (written.ok !== true) throw new Error()
}

function namespace(path) {
  if (!isAbsolute(path)) changed()
  const root = parse(path).root
  let cursor = root, info = lstatSync(root)
  for (const part of path.slice(root.length).split(sep).filter(Boolean)) {
    if (!info.isDirectory()) changed()
    cursor = join(cursor, part); info = lstatSync(cursor)
    if (info.isSymbolicLink()) changed()
  }
  return info
}
function targetInfo(name) {
  try { return lstatSync(name) } catch (error) { if (error.code === 'ENOENT') return null; throw error }
}
function checkParent(metadata) {
  try {
    if (!same(lstatSync('.'), metadata.parentIdentity) || !same(namespace(metadata.parent), metadata.parentIdentity)) changed()
  } catch { changed() }
}
function checkTarget(metadata) {
  const now = targetInfo(metadata.target)
  if (Boolean(now) !== Boolean(metadata.targetIdentity) || now &&
      (!same(now, metadata.targetIdentity) || !now.isDirectory() || readdirSync(metadata.target).length)) changed()
}
function frame() {
  const buffer = Buffer.alloc(4 + METADATA_LIMIT + 2 * LIMIT + 1)
  let length = 0
  while (length < buffer.length) {
    const count = readSync(0, buffer, length, buffer.length - length, null)
    if (!count) break
    length += count
  }
  if (length < 4 || length === buffer.length) throw new Error()
  const bytes = buffer.readUInt32BE(0)
  if (bytes > METADATA_LIMIT || length < 4 + bytes) throw new Error()
  const metadata = JSON.parse(buffer.subarray(4, 4 + bytes).toString('utf8'))
  if (Object.keys(metadata).sort().join(',') !== 'jsonBytes,markdownBytes,parent,parentIdentity,target,targetIdentity' ||
      typeof metadata.parent !== 'string' || typeof metadata.target !== 'string' || !metadata.target ||
      basename(metadata.target) !== metadata.target || ['.', '..'].includes(metadata.target) ||
      ![metadata.jsonBytes, metadata.markdownBytes].every(n => Number.isSafeInteger(n) && n >= 0 && n <= LIMIT) ||
      length !== 4 + bytes + metadata.jsonBytes + metadata.markdownBytes) throw new Error()
  return { metadata, json: buffer.subarray(4 + bytes, 4 + bytes + metadata.jsonBytes),
    markdown: buffer.subarray(4 + bytes + metadata.jsonBytes, length) }
}

try {
  const { metadata, json, markdown } = frame()
  // Spawn's cwd resolution can itself race. Bind '.' before the first filesystem write.
  checkParent(metadata); checkTarget(metadata)
  if (!metadata.targetIdentity) { mkdirSync(metadata.target, { mode: 0o700 }); created = true }
  output = metadata.target; outputIdentity = metadata.targetIdentity ?? lstatSync(output)
  writeOwned(json, markdown)
  checkParent(metadata)
  if (!same(targetInfo(output), outputIdentity)) changed()
  if (readdirSync(output).length !== 2 || files.some(file => {
    const now = lstatSync(join(output, file.name))
    return !now.isFile() || !same(now, file) || now.size !== file.bytes
  })) changed()
} catch (error) {
  // Cleanup rebinds the owned directory itself; no absolute or recursive cleanup.
  cleanup(output, outputIdentity)
  process.stderr.write(error instanceof Changed ? 'OUTPUT_CHANGED\n' : 'OUTPUT_WRITE_FAILED\n')
  process.exitCode = 1
}
