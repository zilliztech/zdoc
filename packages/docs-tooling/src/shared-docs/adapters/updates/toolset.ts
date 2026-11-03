import { constants } from 'node:fs'
import { lstat, open, readdir, readlink, realpath } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { release } from 'node:os'
import { createRequire } from 'node:module'
import * as z from 'zod'
import { load as loadYaml } from 'js-yaml'
import { canonicalBytes, compareUtf8, digest, parseStrictJson } from '../../core/updates/canonical'
import { BlobRef, DigestSchema, GitShaSchema, RepoPathSchema, ToolsetMaterial, ToolsetMaterialSchema, validateBlobBytes } from '../../core/updates/envelope'
import { rawSha256 } from './evidence'

export type ClosureEntry =
  | { path: string; state: 'absent' }
  | { path: string; state: 'file'; mode: '100644' | '100755'; sha256: string; bytes: number }
  | { path: string; state: 'directory'; mode: '040000' }
  | { path: string; state: 'symlink'; mode: '120000'; policy: 'repository-literal' | 'installed-logical'; linkTextBase64: string | null; target: string }
export interface ExecutableClosure {
  kind: 'shared-update-executable-closure'; schemaVersion: 1; hostTcb: { kind: 'host-os-tcb'; schemaVersion: 1; policy: 'host-os-tcb-v1'; platform: string; release: string; architecture: string; systemLibraries: 'trusted-host-unmeasured' }; entries: ClosureEntry[]
  packageLocators: { root: string; lockKey: string; name: string; version: string; integrity: string; peerContext: { name: string; locator: string }[] }[]
  resolutions: { from: string; specifier: string; kind: 'import' | 'require' | 'loader' | 'binary'; conditions: string[]; target: string }[]
}
const logical = RepoPathSchema.refine(p => p === 'repo' || /^(repo|deps|runtime)\//.test(p), 'Unknown closure namespace')
const text = z.string().min(1).refine(value => !/[\x00-\x1f\x7f-\x9f]/.test(value), 'Invalid closure text')
const entrySchema = z.discriminatedUnion('state', [
  z.strictObject({ path: logical, state: z.literal('absent') }),
  z.strictObject({ path: logical, state: z.literal('file'), mode: z.enum(['100644', '100755']), sha256: DigestSchema, bytes: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }),
  z.strictObject({ path: logical, state: z.literal('directory'), mode: z.literal('040000') }),
  z.strictObject({ path: logical, state: z.literal('symlink'), mode: z.literal('120000'), policy: z.enum(['repository-literal', 'installed-logical']), linkTextBase64: z.string().nullable(), target: logical }),
])
const closureSchema = z.strictObject({ kind: z.literal('shared-update-executable-closure'), schemaVersion: z.literal(1), hostTcb: z.strictObject({ kind: z.literal('host-os-tcb'), schemaVersion: z.literal(1), policy: z.literal('host-os-tcb-v1'), platform: text, release: text, architecture: text, systemLibraries: z.literal('trusted-host-unmeasured') }), entries: z.array(entrySchema),
  packageLocators: z.array(z.strictObject({ root: logical, lockKey: text, name: text, version: text, integrity: text, peerContext: z.array(z.strictObject({ name: text, locator: text })) })),
  resolutions: z.array(z.strictObject({ from: logical, specifier: text, kind: z.enum(['import', 'require', 'loader', 'binary']), conditions: z.array(text), target: logical })),
})
const tupleCompare = (a: string[], b: string[]) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const n = compareUtf8(a[i] ?? '', b[i] ?? ''); if (n) return n } return 0 }
const resolutionKey = (r: ExecutableClosure['resolutions'][number]) => [r.from, r.specifier, r.kind, Buffer.from(canonicalBytes(r.conditions)).toString('utf8')]
function ordered<T>(values: T[], key: (v: T) => string[]) { for (let i = 1; i < values.length; i++) if (tupleCompare(key(values[i - 1]), key(values[i])) >= 0) throw new Error('Duplicate or noncanonical closure order') }
export function validateClosure(value: unknown): ExecutableClosure {
  const c = closureSchema.parse(value) as ExecutableClosure
  ordered(c.entries, e => [e.path]); ordered(c.packageLocators, e => [e.root]); ordered(c.resolutions, resolutionKey)
  const entries = new Map(c.entries.map(e => [e.path, e]))
  for (const locator of c.packageLocators) {
    ordered(locator.peerContext, p => [p.name, p.locator])
    if (entries.get(locator.root)?.state !== 'directory') throw new Error('Missing locator directory')
    const { root, ...facts } = locator
    if (root.startsWith('deps/') && root !== `deps/${rawSha256(canonicalBytes(facts))}`) throw new Error('Locator digest mismatch')
  }
  for (const entry of c.entries) if (entry.state === 'symlink') {
    if (entry.policy === 'repository-literal') {
      if (!entry.path.startsWith('repo/') || entry.linkTextBase64 === null || Buffer.from(entry.linkTextBase64, 'base64').toString('base64') !== entry.linkTextBase64) throw new Error('Invalid literal symlink')
      const literal = new TextDecoder('utf8', { fatal: true }).decode(Buffer.from(entry.linkTextBase64, 'base64'))
      if (isAbsolute(literal) || /[\\\0\r\n]/.test(literal) || posix.normalize(posix.join(posix.dirname(entry.path), literal)) !== entry.target || !entry.target.startsWith('repo/')) throw new Error('Escaped literal symlink')
    } else if (!entry.path.startsWith('deps/') || entry.linkTextBase64 !== null) throw new Error('Invalid installed symlink')
    const seen = new Set([entry.path]); let target = entries.get(entry.target)
    while (target?.state === 'symlink') { if (seen.has(target.path)) throw new Error('Symlink cycle'); seen.add(target.path); target = entries.get(target.target) }
    if (!target || target.state === 'absent') throw new Error('Unmeasured symlink target')
  }
  for (const r of c.resolutions) if (!entries.has(r.from) || !entries.has(r.target) || entries.get(r.target)?.state === 'absent') throw new Error('Unmeasured resolution')
  return c
}
export const serializeClosure = (value: unknown) => Uint8Array.from(canonicalBytes(validateClosure(value)))
export function bindClosure(value: unknown, facts: Omit<ToolsetMaterial, 'files'> | ToolsetMaterial) {
  const closure = validateClosure(value), bytes = serializeClosure(closure)
  if (closure.hostTcb.platform !== facts.runtime.platform || closure.hostTcb.architecture !== facts.runtime.architecture) throw new Error('Host TCB/runtime mismatch')
  const material = ToolsetMaterialSchema.parse({ ...facts, files: [{ path: 'toolset/closure-v1.json', sha256: rawSha256(bytes), bytes: bytes.length }] })
  return { closure, bytes, material, toolsetSha256: digest('toolset', material) }
}
export function verifyClosureBinding(materialValue: unknown, ref: BlobRef, bytes: Uint8Array, expected: string) {
  const material = ToolsetMaterialSchema.parse(materialValue); validateBlobBytes(ref, bytes)
  const file = material.files.find(f => f.path === 'toolset/closure-v1.json')
  if (material.files.length !== 1 || !file || file.sha256 !== ref.sha256 || file.bytes !== ref.bytes || digest('toolset', material) !== expected) throw new Error('Closure material binding mismatch')
  const closure = validateClosure(parseStrictJson(bytes))
  if (closure.hostTcb.platform !== material.runtime.platform || closure.hostTcb.architecture !== material.runtime.architecture) throw new Error('Host TCB/runtime mismatch')
  if (!Buffer.from(serializeClosure(closure)).equals(Buffer.from(bytes))) throw new Error('Noncanonical closure bytes')
  return closure
}
const flagSet = new Set(['--enable-source-maps', '--no-warnings', '--disable-warning=ExperimentalWarning'])
export async function trustedLauncherEnvironment(root: string, cwd: string, environment: NodeJS.ProcessEnv = process.env, flags = process.execArgv): Promise<NodeJS.ProcessEnv> {
  if (await realpath(root) !== await realpath(cwd)) throw new Error('Launcher must run from trusted root')
  for (const [name, value] of Object.entries(environment)) if (value && (/^(NODE_OPTIONS|NODE_PATH|LD_|DYLD_|DEVELOPER_DIR|SDKROOT|GIT_)/i.test(name) || /^(npm_config_|pnpm_)/i.test(name))) throw new Error(`Forbidden ambient execution setting: ${name}`)
  if (flags.some(f => !flagSet.has(f))) throw new Error('Forbidden Node execution flag')
  // Deliberately neither read .env nor inherit HOME/PATH/package-manager settings.
  return { LANG: 'C', LC_ALL: 'C', TZ: 'UTC', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0' }
}
const exec = promisify(execFile)
const limit = 128 * 1024 * 1024
const contains = (root: string, path: string) => { const r = relative(root, path); return r === '' || !isAbsolute(r) && r !== '..' && !r.startsWith(`..${sep}`) }
const absent = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT'
/** Trusted install files may be hardlinked by pnpm; bytes are rehashed, never trusted from SRI alone. */
async function fileBytes(path: string) {
  const before = await lstat(path)
  if (!before.isFile() || before.isSymbolicLink() || before.size > limit || before.mode & 0o6000 || before.mode & 0o002) throw new Error(`Unsafe trusted file: ${path}`)
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try {
    const st = await handle.stat(); if (st.ino !== before.ino || st.dev !== before.dev || st.size !== before.size) throw new Error('Trusted file replaced')
    const buffer = Buffer.alloc(st.size); let offset = 0
    while (offset < buffer.length) { const r = await handle.read(buffer, offset, buffer.length - offset, offset); if (!r.bytesRead) throw new Error('Trusted file truncated'); offset += r.bytesRead }
    const tail = Buffer.alloc(1); if ((await handle.read(tail, 0, 1, offset)).bytesRead) throw new Error('Trusted file grew')
    const after = await handle.stat(), current = await lstat(path)
    if (after.mtimeMs !== st.mtimeMs || after.ctimeMs !== st.ctimeMs || current.ino !== st.ino || current.dev !== st.dev || current.isSymbolicLink()) throw new Error('Trusted file changed')
    return { bytes: Uint8Array.from(buffer), mode: (st.mode & 0o111 ? '100755' : '100644') as '100755' | '100644' }
  } finally { await handle.close() }
}
async function gitBytes(binary: string, root: string, args: string[], env: NodeJS.ProcessEnv, input?: string): Promise<Buffer> {
  if (!['cat-file', 'ls-tree', 'rev-parse', '--version'].includes(args[0])) throw new Error('Unsupported Git read')
  const argv = ['--no-replace-objects', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-C', root, ...args]
  if (input === undefined) return (await exec(binary, argv, { env, encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, timeout: 30_000 })).stdout
  return new Promise((yes, no) => {
    const child = spawn(binary, argv, { env, stdio: ['pipe', 'pipe', 'pipe'] }), chunks: Buffer[] = []; let total = 0, errors = ''
    const timer = setTimeout(() => { child.kill(); no(new Error('Git read timeout')) }, 30_000)
    child.stdout.on('data', b => { total += b.length; if (total > 256 * 1024 * 1024) { child.kill(); no(new Error('Git read bound exceeded')) } else chunks.push(b) })
    child.stderr.on('data', b => { errors = (errors + b.toString()).slice(0, 4096) })
    child.on('error', e => { clearTimeout(timer); no(e) }); child.on('close', code => { clearTimeout(timer); code === 0 ? yes(Buffer.concat(chunks)) : no(new Error(`Git read failed: ${errors}`)) }); child.stdin.end(input)
  })
}
type TreeEntry = { path: string; mode: string; type: string; oid: string }
async function tree(binary: string, root: string, commit: string, env: NodeJS.ProcessEnv) {
  GitShaSchema.parse(commit)
  if ((await gitBytes(binary, root, ['cat-file', '-t', commit], env)).toString().trim() !== 'commit') throw new Error('Expected exact commit object')
  const bytes = await gitBytes(binary, root, ['ls-tree', '-r', '-z', commit], env)
  const result = new Map<string, TreeEntry>(), aliases = new Set<string>()
  for (const line of bytes.toString('utf8').split('\0').filter(Boolean)) {
    const match = /^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line); if (!match) throw new Error('Invalid tree record')
    const [, mode, type, oid, path] = match; RepoPathSchema.parse(path)
    const folded = path.toLowerCase(); if (aliases.has(folded)) throw new Error('Case alias in Git tree'); aliases.add(folded)
    if (!['100644', '100755', '120000'].includes(mode) || type !== 'blob') throw new Error('Unsupported Git special/submodule mode')
    result.set(path, { path, mode, type, oid })
  }
  return result
}
const protectedRoots = ['packages', 'apps', 'scripts', '.github', 'deploy', 'patches']
const optional = ['.npmrc', '.env', '.pnpmfile.cjs', '.pnpmfile.js', 'pnpmfile.cjs', '.node-version', '.nvmrc', '.tool-versions', '.pnp.cjs', '.pnp.loader.mjs', 'bunfig.toml', '.yarnrc', '.yarnrc.yml', 'deno.json', 'deno.jsonc']
export function protectedToolsetPath(path: string) {
  return /(?:^|\/)\.env(?:\.|$)/.test(path) || /\.(?:[cm]?[jt]sx?|node|sh|py|rb|pl)$/.test(path) || protectedRoots.some(r => path === r || path.startsWith(`${r}/`)) || optional.includes(path) || /(^|\/)(package\.json|\.gitattributes|\.gitmodules|tsconfig[^/]*\.json)$/.test(path) || !path.includes('/') && (/\.(?:[cm]?[jt]sx?|ya?ml|json|toml)$/.test(path) || path.includes('lock'))
}
async function blobObjects(binary: string, root: string, entries: TreeEntry[], env: NodeJS.ProcessEnv) {
  const values = new Map<string, Uint8Array>(); if (!entries.length) return values
  const oids = [...new Set(entries.map(e => e.oid))], bytes = await gitBytes(binary, root, ['cat-file', '--batch'], env, oids.join('\n') + '\n'); let offset = 0
  for (const oid of oids) {
    const end = bytes.indexOf(10, offset), line = bytes.subarray(offset, end).toString(), match = /^([a-f0-9]{40}) blob (\d+)$/.exec(line)
    if (!match || match[1] !== oid || Number(match[2]) > limit) throw new Error('Invalid bounded Git blob')
    const length = Number(match[2]); offset = end + 1
    if (offset + length >= bytes.length || bytes[offset + length] !== 10) throw new Error('Truncated Git batch')
    values.set(oid, Uint8Array.from(bytes.subarray(offset, offset + length))); offset += length + 1
  }
  if (offset !== bytes.length) throw new Error('Extra Git batch bytes'); return values
}
async function walk(root: string, visit: (path: string, stat: Awaited<ReturnType<typeof lstat>>) => Promise<boolean | void>, suffix = '') {
  const names = (await readdir(join(root, suffix))).sort(compareUtf8), folded = new Set<string>()
  for (const name of names) {
    if (folded.has(name.toLowerCase())) throw new Error('Case alias in trusted files'); folded.add(name.toLowerCase())
    const path = suffix ? `${suffix}/${name}` : name; RepoPathSchema.parse(path)
    const stat = await lstat(join(root, path)); const recurse = await visit(path, stat)
    if (stat.isDirectory() && !stat.isSymbolicLink() && recurse !== false) await walk(root, visit, path)
  }
}
const fileEntry = (path: string, bytes: Uint8Array, mode: '100644' | '100755'): ClosureEntry => ({ path, state: 'file', mode, sha256: rawSha256(bytes), bytes: bytes.length })
function addDirectories(entries: Map<string, ClosureEntry>, path: string) {
  for (let p = posix.dirname(path); p.includes('/'); p = posix.dirname(p)) if (!entries.has(p)) entries.set(p, { path: p, state: 'directory', mode: '040000' })
}
// pnpm 10's dependency-path layout (120-character virtual-store names). Unsupported layouts hold.
function pnpmDirectory(key: string) {
  let value = key.replace(/[\\/:*?"<>|#]/g, '+').replace(/\)$/, '').replace(/\)\(|\(|\)/g, '_')
  if (value.length > 120 || value !== value.toLowerCase() && !value.startsWith('file+')) value = `${value.slice(0, 87)}_${rawSha256(Buffer.from(value)).slice(0, 32)}`
  return value
}
export interface CaptureOptions {
  /** Internal trusted bootstrap values. Never deserialize these from candidate/request/evidence JSON. */
  root: string; commit: string; cwd?: string; environment?: NodeJS.ProcessEnv; flags?: string[]
  helpers?: ('gh')[]
  resolutions?: { from: string; specifier: string; kind: 'require' | 'loader'; conditions: string[] }[]
}
export interface TrustedToolsetCapture extends ReturnType<typeof bindClosure> {
  readonly root: string
}
type CapturePrivate = { sha256: string; closure: ExecutableClosure; hostExclusions: string[]; options: CaptureOptions; git: string; environment: NodeJS.ProcessEnv; tree: Map<string, TreeEntry>; physical: Map<string, string> }
const captures = new WeakMap<TrustedToolsetCapture, CapturePrivate>()
async function captureRepository(root: string, commit: string, git: string, env: NodeJS.ProcessEnv, entries: Map<string, ClosureEntry>, physical: Map<string, string>) {
  const all = await tree(git, root, commit, env), selected = [...all.values()].filter(e => protectedToolsetPath(e.path)), blobs = await blobObjects(git, root, selected, env)
  for (const e of selected) {
    const path = `repo/${e.path}`, bytes = blobs.get(e.oid)!, full = join(root, e.path)
    if (e.mode === '120000') {
      const literal = new TextDecoder('utf8', { fatal: true }).decode(bytes)
      if (isAbsolute(literal) || /[\\\0\r\n]/.test(literal)) throw new Error('Escaped repository symlink')
      const target = posix.normalize(posix.join(posix.dirname(path), literal)); logical.parse(target)
      if (!target.startsWith('repo/') || await readlink(full) !== literal) throw new Error('Repository symlink drift')
      entries.set(path, { path, state: 'symlink', mode: '120000', policy: 'repository-literal', linkTextBase64: Buffer.from(bytes).toString('base64'), target })
    } else {
      if (!contains(root, await realpath(full))) throw new Error('Repository path escape')
      const actual = await fileBytes(full)
      if (actual.mode !== e.mode || !Buffer.from(actual.bytes).equals(Buffer.from(bytes))) throw new Error(`Uncommitted protected material: ${e.path}`)
      entries.set(path, fileEntry(path, bytes, actual.mode)); physical.set(full, path)
    }
    addDirectories(entries, path)
  }
  for (const path of optional) if (!all.has(path)) {
    try { await lstat(join(root, path)); throw new Error(`Untracked execution config: ${path}`) } catch (e) { if (!absent(e)) throw e }
    entries.set(`repo/${path}`, { path: `repo/${path}`, state: 'absent' })
  }
  // Inventory all protected discovery roots; ignored/untracked source cannot become a loader input.
  for (const prefix of protectedRoots) {
    try {
      const st = await lstat(join(root, prefix)); if (!st.isDirectory() || st.isSymbolicLink()) throw new Error('Unsafe discovery root')
      entries.set(`repo/${prefix}`, { path: `repo/${prefix}`, state: 'directory', mode: '040000' })
      await walk(join(root, prefix), async (suffix, stat) => {
        const path = `${prefix}/${suffix}`
        if (basename(path) === 'node_modules') return false
        if (!stat.isDirectory() && !all.has(path)) throw new Error(`Untracked executable material: ${path}`)
      })
    } catch (e) { if (!absent(e)) throw e }
  }
  for (const name of await readdir(root)) if (protectedToolsetPath(name) && !all.has(name) && !protectedRoots.includes(name) && !optional.includes(name)) throw new Error(`Untracked execution config: ${name}`)
  return { all, blobs }
}
function yaml(bytes: Uint8Array): any { const value = loadYaml(new TextDecoder('utf8', { fatal: true }).decode(bytes)); if (!value || typeof value !== 'object') throw new Error('Invalid trusted lock material'); return value }
function json(bytes: Uint8Array): any { const value = parseStrictJson(bytes); if (!value || typeof value !== 'object') throw new Error('Invalid package material'); return value }
async function captureDependencies(root: string, all: Map<string, TreeEntry>, entries: Map<string, ClosureEntry>, physical: Map<string, string>, resolutions: ExecutableClosure['resolutions']) {
  const lock = yaml((await fileBytes(join(root, 'pnpm-lock.yaml'))).bytes)
  if (String(lock.lockfileVersion) !== '9.0' || !lock.packages || !lock.snapshots || !lock.importers) throw new Error('Unsupported pnpm lock layout')
  const virtual = join(root, 'node_modules/.pnpm')
  if ((await lstat(virtual)).isSymbolicLink() || await realpath(virtual) !== virtual) throw new Error('External pnpm store must be independently materialized inside trusted root')
  const expected = new Map<string, string>()
  for (const key of Object.keys(lock.snapshots)) { const dir = pnpmDirectory(key); if (expected.has(dir)) throw new Error('Ambiguous pnpm locator directory'); expected.set(dir, key) }
  const locators: ExecutableClosure['packageLocators'] = [], packages: { physical: string; logical: string; name: string; version: string; key: string }[] = []
  for (const directory of (await readdir(virtual)).sort(compareUtf8)) {
    if (directory === 'node_modules' || directory === 'lock.yaml') continue
    const key = expected.get(directory); if (!key) throw new Error(`Unrecognized pnpm virtual-store locator: ${directory}`)
    const baseKey = key.split('(')[0], at = baseKey.lastIndexOf('@'), name = baseKey.slice(0, at), version = baseKey.slice(at + 1), record = lock.packages[baseKey]
    if (!name || !version || !record?.resolution?.integrity || record.resolution.tarball?.startsWith('file:')) throw new Error('Unsupported trusted lock locator')
    const packageRoot = join(virtual, directory, 'node_modules', name)
    if (await realpath(packageRoot) !== packageRoot) throw new Error('Aliased installed package root')
    const manifest = json((await fileBytes(join(packageRoot, 'package.json'))).bytes)
    if (manifest.name !== name || manifest.version !== version) throw new Error('Installed package differs from lock identity')
    const snapshot = lock.snapshots[key], peers: { name: string; locator: string }[] = []
    for (const peerName of Object.keys(record.peerDependencies ?? {}).sort(compareUtf8)) {
      const peerVersion = snapshot.dependencies?.[peerName] ?? snapshot.optionalDependencies?.[peerName]
      if (peerVersion) peers.push({ name: peerName, locator: `${peerName}@${peerVersion}` })
      else if (!record.peerDependenciesMeta?.[peerName]?.optional) throw new Error('Missing lock peer context')
    }
    const facts = { lockKey: key, name, version, integrity: record.resolution.integrity, peerContext: peers }, logicalRoot = `deps/${rawSha256(canonicalBytes(facts))}`
    locators.push({ root: logicalRoot, ...facts }); packages.push({ physical: packageRoot, logical: logicalRoot, name, version, key })
    physical.set(packageRoot, logicalRoot); entries.set(logicalRoot, { path: logicalRoot, state: 'directory', mode: '040000' })
  }
  // Workspaces have no registry SRI: derive one from their committed inventory.
  for (const path of [...all.keys()].filter(p => p === 'package.json' || /^(apps|packages)\/[^/]+\/package\.json$/.test(p))) {
    const dir = dirname(path) === '.' ? '' : dirname(path), logicalRoot = dir ? `repo/${dir}` : 'repo'
    const manifest = json((await fileBytes(join(root, path))).bytes)
    if (!manifest.name || !manifest.version) throw new Error(`Workspace identity unavailable: ${path}`)
    if (!entries.has(logicalRoot)) entries.set(logicalRoot, { path: logicalRoot, state: 'directory', mode: '040000' })
    const inventory = [...entries.values()].filter(e => e.path.startsWith(dir ? `repo/${dir}/` : 'repo/')).sort((a, b) => compareUtf8(a.path, b.path))
    const integrity = `sha256-${Buffer.from(rawSha256(canonicalBytes(inventory)), 'hex').toString('base64')}`
    locators.push({ root: logicalRoot, lockKey: `workspace:${dir || '.'}`, name: manifest.name, version: manifest.version, integrity, peerContext: [] })
    packages.push({ physical: join(root, dir), logical: logicalRoot, name: manifest.name, version: manifest.version, key: `workspace:${dir || '.'}` })
  }
  const packageRoots = packages.filter(p => !p.key.startsWith('workspace:')).sort((a, b) => b.physical.length - a.physical.length)
  function mapPhysical(path: string) {
    const exact = physical.get(path); if (exact) return exact
    for (const p of packageRoots) if (contains(p.physical, path)) return `${p.logical}/${relative(p.physical, path).split(sep).join('/')}`
    if (contains(root, path)) { const logicalPath = `repo/${relative(root, path).split(sep).join('/')}`; if (entries.has(logicalPath)) return logicalPath }
    throw new Error(`Unmeasured dependency escape: ${path}`)
  }
  const links: { path: string; physical: string }[] = [], nativeTargets: { name: string; path: string }[] = []
  for (const pkg of packageRoots) await walk(pkg.physical, async (suffix, stat) => {
    const full = join(pkg.physical, suffix), path = `${pkg.logical}/${suffix}`
    if (stat.isSymbolicLink()) { links.push({ path, physical: full }); return false }
    if (stat.isDirectory()) { entries.set(path, { path, state: 'directory', mode: '040000' }); return }
    if (!stat.isFile()) throw new Error('Unsupported installed file type')
    const content = await fileBytes(full); entries.set(path, fileEntry(path, content.bytes, content.mode)); physical.set(full, path)
    if (nativeDependencies(content.bytes)) nativeTargets.push({ name: path, path: full })
  })
  for (const link of links) {
    const target = mapPhysical(await realpath(link.physical)); entries.set(link.path, { path: link.path, state: 'symlink', mode: '120000', policy: 'installed-logical', linkTextBase64: null, target }); physical.set(link.physical, link.path)
  }
  const packageAt = new Map(packages.map(p => [p.physical, p]))
  for (const pkg of packages) {
    const workspace = pkg.key.startsWith('workspace:'), record = workspace ? lock.importers[pkg.key.slice(10)] : lock.snapshots[pkg.key]
    if (!record) { if (workspace) continue; throw new Error('Missing installed snapshot') }
    const declarations = { ...record.dependencies, ...(workspace ? record.devDependencies : {}), ...record.optionalDependencies }
    for (const name of Object.keys(declarations).sort(compareUtf8)) {
      const specification = workspace ? declarations[name].version : declarations[name]
      const link = join(workspace ? pkg.physical : dirname(pkg.physical.slice(0, pkg.physical.length - pkg.name.length)), 'node_modules', name)
      // A package's own parent node_modules is pnpm's dependency lookup scope.
      const lookup = workspace ? link : join(pkg.physical.slice(0, pkg.physical.length - pkg.name.length), name)
      let target: string
      try { target = await realpath(lookup) } catch (e) { if (absent(e) && Object.hasOwn(record.optionalDependencies ?? {}, name)) continue; throw e }
      const destination = packageAt.get(target)
      if (!destination) throw new Error('Dependency resolution escapes captured packages')
      if (typeof specification !== 'string' || !specification.startsWith('link:') && destination.key !== `${name}@${specification}`) throw new Error('Installed dependency resolution differs from lock')
      resolutions.push({ from: workspace ? `repo/${pkg.key.slice(10) === '.' ? '' : pkg.key.slice(10) + '/'}package.json` : `${pkg.logical}/package.json`, specifier: name, kind: 'require', conditions: ['node', 'require', 'default'], target: destination.logical })
    }
  }
  return { locators, mapPhysical, nativeTargets }
}
export async function captureTrustedToolset(options: CaptureOptions): Promise<TrustedToolsetCapture> {
  const root = await realpath(options.root), flags = options.flags ?? process.execArgv, environment = await trustedLauncherEnvironment(root, options.cwd ?? process.cwd(), options.environment ?? process.env, flags)
  const entries = new Map<string, ClosureEntry>(), physical = new Map<string, string>()
  const { git, resolutions: runtimeResolutions, hostExclusions } = await captureRuntime(entries, physical, environment)
  const { all } = await captureRepository(root, options.commit, git, environment, entries, physical)
  const resolutions: ExecutableClosure['resolutions'] = runtimeResolutions
  const { locators, mapPhysical, nativeTargets } = await captureDependencies(root, all, entries, physical, resolutions)
  const helpers = options.helpers ?? (all.has('packages/docs-tooling/src/shared-docs/adapters/updates/github.ts') ? ['gh'] : [])
  for (const helper of helpers) {
    if (helper !== 'gh') throw new Error('Unknown trusted runtime helper')
    nativeTargets.push({ name: 'runtime/gh', path: process.platform === 'darwin' ? process.arch === 'arm64' ? '/opt/homebrew/bin/gh' : '/usr/local/bin/gh' : '/usr/bin/gh' })
    resolutions.push({ from: 'repo/packages/docs-tooling/src/shared-docs/adapters/updates/github.ts', specifier: 'gh api --hostname github.com --method GET', kind: 'binary', conditions: [], target: 'runtime/gh' })
  }
  const native = await captureTrustedNativeFiles(nativeTargets)
  for (const entry of native.entries) { const existing = entries.get(entry.path); if (existing && Buffer.from(canonicalBytes(existing)).compare(Buffer.from(canonicalBytes(entry))) !== 0) throw new Error('Native material drift'); entries.set(entry.path, entry) }
  for (const [full, logical] of native.physical) { const old = physical.get(full); if (old && old !== logical) throw new Error('Native resolution alias'); physical.set(full, logical) }
  resolutions.push(...native.resolutions); hostExclusions.push(...native.hostExclusions)
  const requests = [
    { from: 'repo/apps/docs/package.json', specifier: 'jiti', kind: 'loader' as const, conditions: ['node', 'require', 'default'] },
    ...['@mdx-js/mdx', 'remark-math'].filter(() => all.has('packages/docs-tooling/src/shared-docs/adapters/mdx.ts')).map(specifier => ({ from: 'repo/packages/docs-tooling/src/shared-docs/adapters/mdx.ts', specifier, kind: 'loader' as const, conditions: ['node', 'require', 'default'] })),
    ...['@zilliz/mdtomd/blocks.js', '@zilliz/mdtomd/preprocess.js'].filter(() => all.has('packages/docs-tooling/src/shared-docs/adapters/md2md.ts')).map(specifier => ({ from: 'repo/packages/docs-tooling/src/shared-docs/adapters/md2md.ts', specifier, kind: 'require' as const, conditions: ['node', 'require', 'default'] })),
    ...options.resolutions ?? [],
  ]
  // Require app-local provisioning explicitly: ancestor/root-only fallback is insufficient.
  await realpath(join(root, 'apps/docs/node_modules/jiti'))
  for (const request of requests) {
    if (!request.from.startsWith('repo/') || !entries.has(request.from) || request.conditions.join(',') !== 'node,require,default') throw new Error('Unsupported trusted resolver request')
    const full = createRequire(join(root, request.from.slice(5))).resolve(request.specifier)
    const target = mapPhysical(await realpath(full))
    if (entries.get(target)?.state !== 'file') throw new Error('Unmeasured loader target')
    resolutions.push({ ...request, target })
  }
  const mergedResolutions = new Map<string, ExecutableClosure['resolutions'][number]>()
  for (const edge of resolutions) { const key = Buffer.from(canonicalBytes(resolutionKey(edge))).toString('utf8'); const prior = mergedResolutions.get(key); if (prior && prior.target !== edge.target) throw new Error('Conflicting executable resolution'); mergedResolutions.set(key, edge) }
  const closure: ExecutableClosure = { kind: 'shared-update-executable-closure', schemaVersion: 1, hostTcb: { kind: 'host-os-tcb', schemaVersion: 1, policy: 'host-os-tcb-v1', platform: process.platform, release: release(), architecture: process.arch, systemLibraries: 'trusted-host-unmeasured' }, entries: [...entries.values()].sort((a, b) => compareUtf8(a.path, b.path)), packageLocators: locators.sort((a, b) => compareUtf8(a.root, b.root)), resolutions: [...mergedResolutions.values()].sort((a, b) => tupleCompare(resolutionKey(a), resolutionKey(b))) }
  const result = { ...bindClosure(closure, { kind: 'shared-update-toolset', schemaVersion: 1, runtime: { name: 'node', version: process.version, platform: process.platform, architecture: process.arch }, flags: [...flags], environment: ['LANG', 'LC_ALL', 'TZ'].map(name => ({ name, value: environment[name]! })), dependencies: locators.map(p => ({ name: p.name, version: p.version, integrity: p.integrity, resolvedPath: p.root })).sort((a, b) => compareUtf8(a.resolvedPath, b.resolvedPath)) }), root }
  captures.set(result, { sha256: result.toolsetSha256, closure: validateClosure(result.closure), hostExclusions: [...new Set(hostExclusions)].sort(compareUtf8), options: { ...options, root }, git, environment, tree: all, physical }); return result
}
function captured(value: TrustedToolsetCapture) { const state = captures.get(value); if (!state) throw new Error('Missing independently captured trusted toolset'); return state }
/** Recollect immediately before K or any new compiler load. Serialized manifests cannot authorize this. */
export async function verifyTrustedToolset(value: TrustedToolsetCapture) {
  const state = captured(value), fresh = await captureTrustedToolset(state.options)
  if (fresh.toolsetSha256 !== state.sha256) throw new Error('Trusted executable closure changed')
}
export async function compareCandidateToolset(value: TrustedToolsetCapture, candidate: { root: string; commit: string; dataPaths: string[] }) {
  const state = captured(value), actual = await tree(state.git, await realpath(candidate.root), candidate.commit, state.environment)
  // dataPaths must come from the authenticated provider's exact ownership inventory, never a request.
  const data = new Set(candidate.dataPaths.map(p => RepoPathSchema.parse(p)))
  for (const path of new Set([...state.tree.keys(), ...actual.keys()])) {
    const before = state.tree.get(path), after = actual.get(path)
    if (before?.oid === after?.oid && before?.mode === after?.mode) continue
    if (protectedToolsetPath(path) || !data.has(path) || after && !['100644', '100755'].includes(after.mode)) throw new Error(`Unreviewed protected candidate drift: ${path}`)
    if (!/\.(?:md|mdx|json|ya?ml|png|jpe?g|svg|webp)$/.test(path)) throw new Error(`Unknown candidate data extension: ${path}`)
  }
}
/** Authenticate the exact fixed resolver edge and bytes before trusted code loads it. */
export async function authorizeTrustedResolution(value: TrustedToolsetCapture, request: ExecutableClosure['resolutions'][number], physicalTarget: string) {
  const state = captured(value)
  const edge = state.closure.resolutions.find(r => tupleCompare(resolutionKey(r), resolutionKey(request)) === 0)
  const target = await realpath(physicalTarget)
  if (!edge || edge.target !== request.target || state.physical.get(target) !== edge.target) throw new Error('Unknown dynamic executable edge')
  const entry = state.closure.entries.find(e => e.path === edge.target), bytes = await fileBytes(target)
  if (entry?.state !== 'file' || entry.mode !== bytes.mode || entry.sha256 !== rawSha256(bytes.bytes) || entry.bytes !== bytes.bytes.length) throw new Error('Loaded executable bytes changed')
}

/** Parse load commands as bytes; never run ldd, package binaries, or a candidate tool. */
export function nativeDependencies(input: Uint8Array, platform = process.platform, architecture = process.arch): { needed: string[]; rpaths: string[] } | null {
  let b = Buffer.from(input)
  if (b.length < 4) return null
  const string = (offset: number, end: number) => { const zero = b.indexOf(0, offset); if (offset < 0 || zero < offset || zero >= end || end > b.length) throw new Error('Malformed native string'); return new TextDecoder('utf8', { fatal: true }).decode(b.subarray(offset, zero)) }
  if (platform === 'darwin') {
    if (b.readUInt32BE(0) === 0xcafebabe) {
      const count = b.readUInt32BE(4); if (count > 32 || 8 + count * 20 > b.length) throw new Error('Malformed fat binary')
      const cpu = architecture === 'arm64' ? 0x100000c : architecture === 'x64' ? 0x1000007 : 0
      let selected: Buffer | undefined
      for (let i = 0; i < count; i++) { const off = 8 + i * 20; if (b.readUInt32BE(off) === cpu) { const start = b.readUInt32BE(off + 8), size = b.readUInt32BE(off + 12); if (start + size > b.length) throw new Error('Malformed fat slice'); selected = b.subarray(start, start + size) } }
      if (!selected) return null; b = selected
    }
    if (b.readUInt32LE(0) !== 0xfeedfacf) return null
    const cpu = b.readUInt32LE(4); if (cpu !== (architecture === 'arm64' ? 0x100000c : 0x1000007)) return null
    if (b.length < 32) throw new Error('Malformed Mach-O header')
    const count = b.readUInt32LE(16), end = 32 + b.readUInt32LE(20), needed: string[] = [], rpaths: string[] = []
    if (count > 10000 || end > b.length) throw new Error('Malformed Mach-O commands')
    let offset = 32
    for (let i = 0; i < count; i++) {
      if (offset + 8 > end) throw new Error('Truncated Mach-O command')
      const command = b.readUInt32LE(offset), size = b.readUInt32LE(offset + 4)
      if (size < 8 || offset + size > end) throw new Error('Malformed Mach-O command')
      if ([0xc, 0x80000018, 0x8000001f, 0x20, 0x80000023].includes(command)) needed.push(string(offset + b.readUInt32LE(offset + 8), offset + size))
      if (command === 0x8000001c) rpaths.push(string(offset + b.readUInt32LE(offset + 8), offset + size))
      offset += size
    }
    return { needed, rpaths }
  }
  if (platform !== 'linux' || b.subarray(0, 4).toString('hex') !== '7f454c46') return null
  if (b[4] !== 2 || b[5] !== 1 || b.length < 64) throw new Error('Unsupported ELF encoding')
  const machine = b.readUInt16LE(18); if (machine !== (architecture === 'arm64' ? 183 : 62)) return null
  const num = (offset: number) => { const n = Number(b.readBigUInt64LE(offset)); if (!Number.isSafeInteger(n)) throw new Error('Unsafe ELF offset'); return n }
  const phoff = num(32), entsize = b.readUInt16LE(54), count = b.readUInt16LE(56), segments: { type: number; offset: number; address: number; size: number }[] = []
  if (entsize < 56 || count > 1024 || phoff + count * entsize > b.length) throw new Error('Malformed ELF program headers')
  for (let i = 0; i < count; i++) { const p = phoff + i * entsize; segments.push({ type: b.readUInt32LE(p), offset: num(p + 8), address: num(p + 16), size: num(p + 32) }) }
  const dynamic = segments.find(s => s.type === 2); if (!dynamic) return { needed: [], rpaths: [] }
  if (dynamic.offset + dynamic.size > b.length) throw new Error('Malformed ELF dynamic section')
  let table = -1, size = 0; const neededOffsets: number[] = [], pathOffsets: number[] = []
  for (let p = dynamic.offset; p + 16 <= dynamic.offset + dynamic.size; p += 16) { const tag = num(p), val = num(p + 8); if (!tag) break; if (tag === 5) table = val; if (tag === 10) size = val; if (tag === 1) neededOffsets.push(val); if (tag === 15 || tag === 29) pathOffsets.push(val) }
  const load = segments.find(s => s.type === 1 && table >= s.address && table < s.address + s.size)
  if (!load) throw new Error('Missing ELF string table'); const base = load.offset + table - load.address
  return { needed: neededOffsets.map(o => string(base + o, base + size)), rpaths: pathOffsets.flatMap(o => string(base + o, base + size).split(':')) }
}
const darwinSystemLibraries = new Set(['libSystem.B.dylib', 'libc++.1.dylib', 'libz.1.dylib', 'libiconv.2.dylib', 'libobjc.A.dylib', 'libresolv.9.dylib', 'libncurses.5.4.dylib', 'libsqlite3.dylib', 'libxml2.2.dylib', 'libxcselect.dylib'])
const darwinFrameworks = new Set(['CoreFoundation', 'CoreServices', 'Security', 'Foundation', 'SystemConfiguration', 'ApplicationServices', 'AppKit', 'IOKit'])
function systemLibrary(path: string) {
  if (process.platform === 'darwin') {
    if (dirname(path) === '/usr/lib' && darwinSystemLibraries.has(basename(path))) return true
    const m = /^\/System\/Library\/Frameworks\/([^/]+)\.framework\/Versions\/[A-Z]\/([^/]+)$/.exec(path)
    return !!m && m[1] === m[2] && darwinFrameworks.has(m[1])
  }
  return /^\/(usr\/)?lib(?:64|\/x86_64-linux-gnu|\/aarch64-linux-gnu)?\/(?:lib(?:c|m|dl|rt|pthread|resolv|util|z|pcre2-8|gcc_s|stdc\+\+)\.so\.[0-9.]+|ld-linux-(?:x86-64|aarch64)\.so\.[0-9]+)$/.test(path)
}
async function captureRuntime(entries: Map<string, ClosureEntry>, physical: Map<string, string>, environment: NodeJS.ProcessEnv) {
  const node = await realpath(process.execPath), binaries = new Map<string, string>([['runtime/node', node]])
  const resolutions: ExecutableClosure['resolutions'] = []
  let git = '/usr/bin/git'
  if (process.platform === 'darwin') {
    binaries.set('runtime/git-resolver', '/usr/bin/xcrun'); binaries.set('runtime/git-shim', '/usr/bin/git')
    git = (await exec('/usr/bin/xcrun', ['--find', 'git'], { env: environment, timeout: 10000 })).stdout.trim()
    if (!git.startsWith('/Library/Developer/') && !git.startsWith('/Applications/Xcode.app/')) throw new Error('Unknown system Git provisioning')
    resolutions.push({ from: 'runtime/git-resolver', specifier: 'git', kind: 'binary', conditions: [], target: 'runtime/git' })
    resolutions.push({ from: 'runtime/git-shim', specifier: 'xcrun', kind: 'binary', conditions: [], target: 'runtime/git-resolver' })
  } else if (process.platform !== 'linux') throw new Error('Unsupported trusted runtime platform')
  git = await realpath(git); binaries.set('runtime/git', git)
  const native = await captureTrustedNativeFiles([...binaries].map(([name, path]) => ({ name, path })))
  for (const entry of native.entries) entries.set(entry.path, entry)
  for (const [full, path] of native.physical) physical.set(full, path)
  return { git, resolutions: [...resolutions, ...native.resolutions], hostExclusions: native.hostExclusions }
}

/** Internal bootstrap inventory only; this result is material, never a trusted-capture capability. */
export async function captureTrustedNativeFiles(seeds: { name: string; path: string }[]) {
  const node = await realpath(process.execPath)
  const entries = new Map<string, ClosureEntry>(), physical = new Map<string, string>(), hostExclusions: string[] = []
  const resolutions: ExecutableClosure['resolutions'] = []
  const binaries = new Map(seeds.map(s => [logical.parse(s.name), s.path]))
  const visited = new Set<string>(), logicalByPhysical = new Map([...binaries].map(([name, path]) => [path, name]))
  const pending = [...binaries].map(([name, path]) => ({ name, path, inherited: [] as string[] }))
  while (pending.length) {
    const item = pending.shift()!, full = await realpath(item.path)
    if (visited.has(full)) continue; visited.add(full)
    const content = await fileBytes(full); entries.set(item.name, fileEntry(item.name, content.bytes, content.mode)); physical.set(full, item.name); addDirectories(entries, item.name)
    const native = nativeDependencies(content.bytes)
    if (!native) throw new Error(`Unsupported runtime executable: ${item.name}`)
    const expand = (path: string) => path.replace(/^@loader_path(?=\/|$)/, dirname(full)).replace(/^@executable_path(?=\/|$)/, dirname(node)).replace(/^\$\{?ORIGIN\}?(?=\/|$)/, dirname(full))
    const search = [...native.rpaths.map(expand), ...item.inherited]
    for (const dependency of [...new Set(native.needed)]) {
      let choices: string[]
      if (dependency.startsWith('@rpath/')) choices = search.map(p => join(p, dependency.slice(7)))
      else if (isAbsolute(dependency) || dependency.startsWith('@loader_path/') || dependency.startsWith('@executable_path/')) choices = [expand(dependency)]
      else if (process.platform === 'linux' && !dependency.includes('/')) choices = [...search, '/lib/x86_64-linux-gnu', '/usr/lib/x86_64-linux-gnu', '/lib/aarch64-linux-gnu', '/usr/lib/aarch64-linux-gnu', '/lib64', '/usr/lib64', '/lib', '/usr/lib'].map(p => join(p, dependency))
      else throw new Error(`Unknown non-system runtime dependency: ${dependency}`)
      let resolved: string | null = null, trustedSystem = false
      for (const choice of choices) {
        if (!isAbsolute(choice)) throw new Error('Unresolved runtime search path')
        if (systemLibrary(choice)) {
          try { const actual = await realpath(choice); if (!systemLibrary(actual)) throw new Error('System-library alias escape'); const stat = await lstat(actual); if (stat.uid !== 0 || stat.mode & 0o022) throw new Error('Unsafe system library') } catch (e) { if (!absent(e) || process.platform !== 'darwin') throw e }
          trustedSystem = true; break
        }
        try { resolved = await realpath(choice); break } catch (e) { if (!absent(e)) throw e }
      }
      if (trustedSystem) { hostExclusions.push(choices.find(systemLibrary)!); continue }
      if (!resolved) throw new Error(`Missing non-system runtime dependency: ${dependency}`)
      const name = logicalByPhysical.get(resolved) ?? `runtime/libraries/${basename(resolved)}`
      const conflict = [...logicalByPhysical].find(([p, n]) => n === name && p !== resolved); if (conflict) throw new Error('Ambiguous runtime library alias')
      logicalByPhysical.set(resolved, name)
      resolutions.push({ from: item.name, specifier: dependency, kind: 'binary', conditions: [], target: name })
      pending.push({ name, path: resolved, inherited: search })
    }
  }
  return { entries: [...entries.values()].sort((a, b) => compareUtf8(a.path, b.path)), physical, resolutions, hostExclusions }
}


/** Transaction-local provenance; absolute paths never enter semantic closure bytes. */
export function describeTrustedToolset(value: TrustedToolsetCapture) {
  const state = captured(value)
  return { root: value.root, commit: state.options.commit, git: state.git, runtime: [...state.physical].filter(([, path]) => path.startsWith('runtime/')).map(([physical, path]) => ({ path, physical })), hostExclusions: [...state.hostExclusions] }
}
