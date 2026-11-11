import { constants } from 'node:fs'
import { lstat, open, readdir, readlink, realpath, symlink, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { release, userInfo } from 'node:os'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import * as z from 'zod'
import { load as loadYaml } from 'js-yaml'
import { canonicalBytes, compareUtf8, digest, parseStrictJson } from '../../core/updates/canonical'
import { BlobRef, DigestSchema, GitShaSchema, RepoPathSchema, ToolsetMaterial, ToolsetMaterialSchema, validateBlobBytes } from '../../core/updates/envelope'
import { createOwnedDirectory, writeOwnedBlob, rawSha256, type EvidenceStore } from './evidence'

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
    } else if (!(entry.path.startsWith('deps/') || entry.path.startsWith('runtime/python-stdlib/') || entry.path.startsWith('runtime/lookup-scopes/')) || entry.linkTextBase64 !== null) throw new Error('Invalid installed symlink')
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
  const canonicalRoot = await realpath(root)
  if (canonicalRoot !== await realpath(cwd)) throw new Error('Launcher must run from trusted root')
  const nodePrefix = dirname(dirname(await realpath(process.execPath))), home = userInfo().homedir
  const managerConfig = process.platform === 'darwin' ? join(home, 'Library/Preferences/pnpm/rc') : join(home, '.config/pnpm/rc')
  // npm_execpath is observational metadata only: never load it, execute it, or use it
  // as a trust anchor. It may only corroborate the discarded node-gyp sibling path.
  const managerEntry = environment.npm_execpath
  const managerRoot = managerEntry && isAbsolute(managerEntry) && basename(managerEntry) === 'pnpm.cjs' && basename(dirname(managerEntry)) === 'bin' ? dirname(dirname(managerEntry)) : null
  const managerLayout = managerRoot && (basename(managerRoot) === 'pnpm' || managerRoot.endsWith('/pnpm/10.33.0'))
  const defaults: Record<string, string | null> = {
    npm_config_npm_globalconfig: join(nodePrefix, 'etc/npmrc'), npm_config_globalconfig: managerConfig,
    npm_config_registry: 'https://registry.npmjs.org/', npm_config__jsr_registry: 'https://npm.jsr.io/',
    PNPM_SCRIPT_SRC_DIR: canonicalRoot, npm_config_dir: canonicalRoot, npm_config_prefix: canonicalRoot,
    npm_config_node_gyp: managerLayout ? join(managerRoot!, 'dist/node_modules/node-gyp/bin/node-gyp.js') : null,
  }
  for (const [name, value] of Object.entries(environment)) {
    if (!value) continue
    // Pinned pnpm's non-executable invocation metadata is validated then discarded.
    // In particular, dependency verification must already be disabled; no linking/install is authorized here.
    if ((name === 'npm_config_verify_deps_before_run' || name === 'pnpm_config_verify_deps_before_run') && value === 'false') continue
    if (name === 'npm_config_user_agent' && value === `pnpm/10.33.0 npm/? node/${process.version} ${process.platform} ${process.arch}`) continue
    if (name === 'PNPM_PACKAGE_NAME' && /^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) continue
    if (Object.hasOwn(defaults, name) && defaults[name] !== null && value === defaults[name]) continue
    if (name === 'GIT_PAGER' && value === 'cat') continue
    if (name === 'JITI_CACHE' && value === 'false') continue
    if (/^JITI_/i.test(name)) throw new Error(`Forbidden ambient loader setting: ${name}`)
    if (/^(NODE_OPTIONS|NODE_PATH|LD_|DYLD_|PYTHON|DEVELOPER_DIR|SDKROOT|GIT_)/i.test(name) || /^(npm_config_|pnpm_)/i.test(name)) throw new Error(`Forbidden ambient execution setting: ${name}`)
  }
  if (flags.some(f => !flagSet.has(f))) throw new Error('Forbidden Node execution flag')
  // Deliberately neither read .env nor inherit HOME/PATH/package-manager settings.
  return { LANG: 'C', LC_ALL: 'C', TZ: 'UTC', JITI_CACHE: 'false', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0' }
}
const exec = promisify(execFile)
const limit = 512 * 1024 * 1024
const contains = (root: string, path: string) => { const r = relative(root, path); return r === '' || !isAbsolute(r) && r !== '..' && !r.startsWith(`..${sep}`) }
const absent = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT'
type AccessPin = { dev: string; ino: string; mode: number; uid: number; gid: number }
type AccessEvidence = { identity: LocalIdentity | null; pins: Map<string, AccessPin>; homeRestriction: { path: string; ace: 'group:everyone deny delete' } | null }
const safeOwner = (uid: number) => uid === 0 || uid === process.geteuid?.()
function accessInspectors(): [string, string][] {
  if (process.platform === 'darwin') return [['runtime/access-inspector', '/bin/ls'], ['runtime/identity-resolver', '/usr/bin/dscl']]
  if (process.platform === 'linux') return [['runtime/acl-inspector', '/usr/bin/getfacl'], ['runtime/capability-inspector', '/usr/sbin/getcap']]
  throw new Error('Unsupported access inspection platform')
}
/** Strict parser for fixed ls -lde output. No caller-provided inspection result grants a capability. */
export function parseDarwinAccess(output: string, paths: string[]): Map<string, string[]> {
  const required = new Set<string>(), pending = new Set(paths), result = new Map<string, string[]>(); let current: string | undefined
  for (const line of output.split('\n')) {
    if (!line) continue
    if (/^\s+\d+:/.test(line)) {
      if (!current) throw new Error('Unknown ACL inspector output')
      const ace = /^ (\d+): (.+)$/.exec(line), list = result.get(current)!
      if (!ace || Number(ace[1]) !== list.length) throw new Error('Unknown ACL syntax')
      list.push(ace[2]); continue
    }
    const match = /^[-dl][rwxStTs-]{9}([+@ ]).*? (\/.*)$/.exec(line)
    const printed = match?.[2], path = printed && [...pending].find(path => printed === path || printed.startsWith(`${path} -> `))
    if (!match || !path || !pending.delete(path)) throw new Error('Unknown or duplicate access inspector output')
    current = path; result.set(current, [])
    // A '+' must be accompanied by parsed ACE evidence, checked below.
    if (match[1] === '+') required.add(current)
  }
  if (pending.size || [...required].some(path => !result.get(path)?.length)) throw new Error('Missing access inspector evidence')
  return result
}
/** Pure safety-policy validation; inspection and host identity acquisition remain private. */
export function validateDarwinAccess(output: string, paths: string[], home: string, materialPaths: Set<string>) {
  let homeRestriction: AccessEvidence['homeRestriction'] = null
  for (const [path, aces] of parseDarwinAccess(output, paths)) if (aces.length) {
    if (path !== home || materialPaths.has(path) || aces.join('\n') !== 'group:everyone deny delete') throw new Error(`Unsupported ACL access: ${path}`)
    homeRestriction = { path, ace: 'group:everyone deny delete' }
  }
  return homeRestriction
}
export function assertNoExtendedAccess(stdout: string, stderr: string) {
  if (stdout.trim() || stderr) throw new Error('Unsupported ACL or filesystem capability access')
}
export function validateAccessMode(stat: { uid: number; mode: number }, kind: 'file' | 'directory' | 'symlink', material: boolean) {
  if (!safeOwner(stat.uid)) throw new Error('Unsafe access owner')
  if (kind !== 'symlink' && stat.mode & 0o6022) throw new Error('Unsafe access mode')
}
type LocalIdentity = {
  profile: Record<string, string[]>;
  users: { names: string[]; uid: number; gid: number; guid: string }[];
  groups: { names: string[]; gid: number; members: string[]; guids: string[]; nested: string[] }[];
  userIndex: Record<string, number>; groupIndex: Record<string, number>;
  credentials: { uid: number; euid: number; gid: number; egid: number; groups: number[] };
}
/** Pure diagnostic policy only. Real capabilities acquire every observation internally. */
export function assertStableAccessIdentity(before: unknown, after: unknown) {
  if (!Buffer.from(canonicalBytes(before)).equals(Buffer.from(canonicalBytes(after)))) throw new Error('Local identity policy changed')
}
export function validateLocalIdentity(value: LocalIdentity, gids: number[]): Map<number, number[]> {
  const { profile, users, groups, credentials: c } = value
  if (!c || c.uid !== c.euid || c.gid !== c.egid || !Number.isSafeInteger(c.euid)) throw new Error('Unsupported identity provisioning context')
  if (Object.keys(profile).sort().join(',') !== 'CSPSearchPath,LSPSearchPath,NSPSearchPath,SearchPolicy' ||
      profile.SearchPolicy?.join(',') !== 'dsAttrTypeStandard:NSPSearchPath' || ['CSPSearchPath','LSPSearchPath','NSPSearchPath'].some(key => profile[key]?.join(',') !== '/Local/Default')) throw new Error('Unsupported identity source coverage')
  if (!users.length || !groups.length) throw new Error('Missing identity observations')
  const names = new Map<string, number>(), guids = new Map<string, number>(), uids = new Set<number>()
  for (const user of users) {
    if (!user.names.length || !user.guid || uids.has(user.uid) || guids.has(user.guid)) throw new Error('Ambiguous user identity')
    uids.add(user.uid); guids.set(user.guid, user.uid)
    for (const name of user.names) { if (names.has(name)) throw new Error('Ambiguous user name'); names.set(name, user.uid) }
  }
  if (!uids.has(0) || !uids.has(c.euid)) throw new Error('Missing trusted principal records')
  if (users.find(user=>user.uid===c.euid)?.gid !== c.egid) throw new Error('Contradictory primary-group observation')
  const checkIndex = (index: Record<string, number>, records: { names: string[] }[], mapping: Map<string, number>) => {
    if (Object.keys(index).length !== records.length || records.some(record => record.names.filter(name => Object.hasOwn(index,name)).length !== 1)) throw new Error('Incomplete identity enumeration')
    for (const [name,id] of Object.entries(index)) if (mapping.get(name) !== id) throw new Error('Inconsistent identity enumeration')
  }
  checkIndex(value.userIndex, users, names)
  const groupNames = new Map<string, number>()
  for (const group of groups) for (const name of group.names) { if (groupNames.has(name)) throw new Error('Ambiguous group name'); groupNames.set(name, group.gid) }
  checkIndex(value.groupIndex, groups, groupNames)
  const result = new Map<number, number[]>()
  for (const gid of gids) {
    const matching = groups.filter(group => group.gid === gid), principals = new Set(users.filter(user => user.gid === gid).map(user => user.uid))
    if (!matching.length) throw new Error('Missing GID records')
    for (const group of matching) {
      if (group.nested.length) throw new Error('Unsupported nested membership')
      const byName = group.members.map(name => { const uid = names.get(name); if (uid === undefined) throw new Error('Unresolved name membership'); return uid }).sort((a,b)=>a-b)
      const byGuid = group.guids.map(guid => { const uid = guids.get(guid); if (uid === undefined) throw new Error('Unresolved GUID membership'); return uid }).sort((a,b)=>a-b)
      if (new Set(byName).size !== byName.length || new Set(byGuid).size !== byGuid.length || byName.join(',') !== byGuid.join(',')) throw new Error('Name/GUID membership mismatch')
      for (const uid of byName) principals.add(uid)
    }
    if ([...principals].some(uid => uid !== 0 && uid !== c.euid) || c.groups.includes(gid) && !principals.has(c.euid)) throw new Error('Untrusted or contradictory group principal')
    result.set(gid, [...principals].sort((a,b)=>a-b))
  }
  return result
}
/** Deliberately limited plist grammar: no DTD fetching, entities, executable parsing or coercion. */
export function parseIdentityPlist(input: string): unknown {
  const declaration = '<?xml version="1.0" encoding="UTF-8"?>', doctype = '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
  let source = input.trim()
  if (!source.startsWith(declaration)) throw new Error('Missing identity plist declaration')
  source = source.slice(declaration.length).trimStart()
  if (!source.startsWith(doctype)) throw new Error('Unknown identity plist declaration')
  source = source.slice(doctype.length).trimStart()
  const tokens = source.match(/<[^>]*>|[^<]+/g) ?? []; let at = 0
  const skip = () => { while (tokens[at] && /^\s+$/.test(tokens[at])) at++ }
  const take = (expected: string) => { skip(); if (tokens[at++] !== expected) throw new Error('Malformed identity plist') }
  const string = (tag: string) => { take(`<${tag}>`); let value = ''; while (tokens[at] && !tokens[at].startsWith('<')) value += tokens[at++]; take(`</${tag}>`); if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(value)) throw new Error('Unknown identity entity'); return value.replace(/&(amp|lt|gt|quot|apos);/g, (_, key: string) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[key]!) }
  const parse = (depth: number): unknown => {
    if (depth > 5) throw new Error('Identity plist nesting bound')
    skip(); const token = tokens[at]
    if (token === '<string>') return string('string')
    if (token === '<array/>') { at++; return [] }
    if (token === '<array>') { at++; const values = []; while ((skip(), tokens[at]) !== '</array>') { if (at >= tokens.length) throw new Error('Truncated identity plist'); values.push(parse(depth+1)) } at++; return values }
    if (token === '<dict>') { at++; const value: Record<string, unknown> = Object.create(null); while ((skip(), tokens[at]) !== '</dict>') { const key = string('key'); if (Object.hasOwn(value,key)) throw new Error('Duplicate identity field'); value[key] = parse(depth+1) } at++; return value }
    throw new Error('Unknown identity plist value')
  }
  take('<plist version="1.0">'); const value = parse(0); take('</plist>'); skip(); if (at !== tokens.length) throw new Error('Trailing identity plist data'); return value
}
async function acquireLocalIdentity(environment: NodeJS.ProcessEnv): Promise<LocalIdentity> {
  if (process.platform !== 'darwin' || !process.geteuid || !process.getuid || !process.getgid || !process.getegid || !process.getgroups) throw new Error('Unsupported local identity profile')
  // Bootstrap this resolver using root/current-owned, non-group-writable paths before any exception.
  const native = await captureTrustedNativeFiles([{name:'runtime/identity-resolver',path:'/usr/bin/dscl'}])
  await inspectAccess(native.physical, environment)
  const args = [
    ['-plist','/Search','-read','/','SearchPolicy','CSPSearchPath','NSPSearchPath','LSPSearchPath'],
    ['-plist','/Local/Default','-readall','/Users','UniqueID','GeneratedUID','PrimaryGroupID','RecordName'],
    ['-plist','/Local/Default','-readall','/Groups','PrimaryGroupID','GroupMembership','GroupMembers','NestedGroups','RecordName'],
    ['/Local/Default','-list','/Users','UniqueID'], ['/Local/Default','-list','/Groups','PrimaryGroupID'],
  ]
  const outputs = await Promise.all(args.map(async argv => { const result = await exec('/usr/bin/dscl',argv,{env:environment,timeout:10000,maxBuffer:4*1024*1024}); if (result.stderr) throw new Error('Identity resolver error'); return result.stdout }))
  const record = (raw: unknown): Record<string,string[]> => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid identity record')
    const result: Record<string,string[]> = Object.create(null)
    for (const [key,value] of Object.entries(raw)) { if (!key.startsWith('dsAttrTypeStandard:') || !Array.isArray(value) || value.some(item=>typeof item!=='string')) throw new Error('Invalid identity field'); result[key.slice(19)] = value }
    return result
  }
  const number = (value: string | undefined) => { if (!value || !/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Invalid numeric identity'); return Number(value) }
  const one = (value: string[] | undefined) => { if (value?.length !== 1) throw new Error('Ambiguous identity value'); return value[0] }
  const records = (source: string) => { const raw = parseIdentityPlist(source); if (!Array.isArray(raw) || !raw.length) throw new Error('Missing identity records'); return raw.map(record) }
  const index = (source: string) => { const result: Record<string,number> = Object.create(null); for (const line of source.trim().split('\n')) { const match = /^(\S+)\s+(-?\d+)$/.exec(line); if (!match || Object.hasOwn(result,match[1])) throw new Error('Invalid identity index'); result[match[1]]=number(match[2]) } return result }
  return { profile:record(parseIdentityPlist(outputs[0])), users:records(outputs[1]).map(value=>({names:value.RecordName,uid:number(one(value.UniqueID)),gid:number(one(value.PrimaryGroupID)),guid:one(value.GeneratedUID)})),
    groups:records(outputs[2]).map(value=>({names:value.RecordName,gid:number(one(value.PrimaryGroupID)),members:value.GroupMembership??[],guids:value.GroupMembers??[],nested:value.NestedGroups??[]})),
    userIndex:index(outputs[3]),groupIndex:index(outputs[4]),credentials:{uid:process.getuid(),euid:process.geteuid(),gid:process.getgid(),egid:process.getegid(),groups:process.getgroups().sort((a,b)=>a-b)} }
}

async function recheckAccess(evidence: AccessEvidence) {
  for (const [path, pin] of evidence.pins) {
    const now = await lstat(path, {bigint:true})
    if (String(now.dev) !== pin.dev || String(now.ino) !== pin.ino || Number(now.mode) !== pin.mode || Number(now.uid) !== pin.uid || Number(now.gid) !== pin.gid) throw new Error('Trusted access identity changed')
  }
}
/** Resolve a path component by component, following symlinks at any depth and
 * returning every traversed directory and symlink hop, so access inspection
 * cannot skip a writable directory introduced or left behind (`..`) along the
 * path. Relative targets resolve against the already-resolved parent. Missing
 * components, an over-long chain and a genuine loop all fail rather than
 * returning partial evidence. */
async function resolveSymlinkHops(path: string): Promise<string[]> {
  const visited: string[] = []
  const seen = new Set<string>()
  const absolute = isAbsolute(path) ? path : resolve(path)
  const root = posix.parse(absolute).root
  let current = root
  let queue = absolute.slice(root.length).split('/').filter(c => c !== '' && c !== '.')
  let hops = 0
  while (queue.length) {
    const component = queue.shift()!
    if (component === '..') { visited.push(current); current = posix.dirname(current); continue }
    const candidate = posix.join(current, component)
    let st
    try {
      st = await lstat(candidate)
    } catch (e) {
      if (!absent(e)) throw e
      throw new Error(`Missing path component in native lookup: ${candidate}`)
    }
    if (st.isSymbolicLink()) {
      visited.push(candidate)
      if (++hops > 64) throw new Error('Symbolic link chain exceeds depth limit')
      const target = await readlink(candidate)
      const targetComponents = target.split('/').filter(c => c !== '' && c !== '.')
      if (isAbsolute(target)) {
        current = posix.parse(target).root
        queue = [...target.slice(posix.parse(target).root.length).split('/').filter(c => c !== '' && c !== '.'), ...queue]
      } else {
        queue = [...targetComponents, ...queue]
      }
      const key = `${candidate}\u0000${queue.join('/')}`
      if (seen.has(key)) throw new Error('Symbolic link loop in native lookup path')
      seen.add(key)
      continue
    }
    current = candidate
  }
  visited.push(current)
  return visited
}

async function inspectAccess(material: Map<string, string>, environment: NodeJS.ProcessEnv): Promise<AccessEvidence> {
  const paths = new Set<string>(), materialPaths = new Set(material.keys())
  for (const full of material.keys()) for (const start of await resolveSymlinkHops(full)) for (let path = start; ; path = dirname(path)) { if (paths.has(path)) break; paths.add(path); if (dirname(path) === path) break }
  const pins: AccessEvidence['pins'] = new Map(), files = new Set<string>(), writableGroups = new Set<number>()
  for (const path of paths) {
    if (/[\x00-\x1f\x7f]/.test(path)) throw new Error('Unsupported access path')
    const raw = await lstat(path, {bigint:true})
    const st = { dev:String(raw.dev),ino:String(raw.ino),mode:Number(raw.mode),uid:Number(raw.uid),gid:Number(raw.gid),isFile:()=>raw.isFile(),isDirectory:()=>raw.isDirectory(),isSymbolicLink:()=>raw.isSymbolicLink() }
    if (!safeOwner(st.uid) || !(st.isFile() || st.isDirectory() || st.isSymbolicLink())) throw new Error(`Unsafe access owner/type: ${path}`)
    // Symlink mode is not writable target authority; its parent and resolved target are inspected.
    const groupAncestor = st.isDirectory() && !materialPaths.has(path) && !!(st.mode & 0o020)
    if (groupAncestor) writableGroups.add(st.gid)
    try { validateAccessMode({ uid: st.uid, mode: groupAncestor ? st.mode & ~0o020 : st.mode }, st.isSymbolicLink() ? 'symlink' : st.isDirectory() ? 'directory' : 'file', materialPaths.has(path)) } catch (error) { throw new Error(`${(error as Error).message}: ${path}`) }
    // Every traversed symlink and its canonical target ancestry are pinned. Retargeting holds on recheck.
    pins.set(path, { dev: st.dev, ino: st.ino, mode: st.mode, uid: st.uid, gid: st.gid }); if (st.isFile()) files.add(path)
  }
  const identity = writableGroups.size ? await acquireLocalIdentity(environment) : null
  if (identity) validateLocalIdentity(identity, [...writableGroups])
  const home = await realpath(userInfo().homedir), ordered = [...paths].sort(compareUtf8)
  let homeRestriction: AccessEvidence['homeRestriction'] = null
  // Both argv bytes and entry counts are bounded; the inspector never reads candidate commands/config.
  for (let i = 0; i < ordered.length;) {
    const batch: string[] = []; let bytes = 0
    while (i < ordered.length && batch.length < 128 && bytes + Buffer.byteLength(ordered[i]) < 48 * 1024) { bytes += Buffer.byteLength(ordered[i]); batch.push(ordered[i++]) }
    if (!batch.length) throw new Error('Access path exceeds argv bound')
    if (process.platform === 'darwin') {
      const { stdout, stderr } = await exec('/bin/ls', ['-lde', ...batch], { env: environment, timeout: 10000, maxBuffer: 8 * 1024 * 1024 })
      if (stderr) throw new Error('Incomplete ACL inspection')
      homeRestriction = validateDarwinAccess(stdout, batch, home, materialPaths) ?? homeRestriction
    } else {
      const acl = await exec('/usr/bin/getfacl', ['--absolute-names', '--skip-base', '--', ...batch], { env: environment, timeout: 10000, maxBuffer: 8 * 1024 * 1024 })
      assertNoExtendedAccess(acl.stdout,acl.stderr)
      const regular = batch.filter(path => files.has(path))
      if (regular.length) { const caps = await exec('/usr/sbin/getcap', ['-n', ...regular], { env: environment, timeout: 10000, maxBuffer: 8 * 1024 * 1024 }); assertNoExtendedAccess(caps.stdout,caps.stderr) }
    }
  }
  if (identity && !Buffer.from(canonicalBytes(identity)).equals(Buffer.from(canonicalBytes(await acquireLocalIdentity(environment))))) throw new Error('Local identity policy changed during capture')
  const evidence = { identity, pins, homeRestriction }; await recheckAccess(evidence); return evidence
}
async function verifyRuntimeBytes(state: CapturePrivate) {
  const expected = new Map(state.closure.entries.map(entry => [entry.path, entry]))
  const seeds: { name: string; path: string }[] = []
  for (const [full, logical] of state.physical) if (logical.startsWith('runtime/')) {
    const entry = expected.get(logical)
    if (entry?.state !== 'file') continue
    const content = await fileBytes(full)
    if (content.mode !== entry.mode || rawSha256(content.bytes) !== entry.sha256) throw new Error('Trusted runtime changed before inspection')
    if (nativeDependencies(content.bytes)) seeds.push({ name: logical, path: full })
  }
  // Re-resolve native imports without executing changed binaries or trusting stale loader targets.
  const native = await captureTrustedNativeFiles(seeds)
  for (const entry of native.entries) if (entry.state === 'file' && JSON.stringify(entry) !== JSON.stringify(expected.get(entry.path))) throw new Error('Trusted native resolution changed')
  for (const [path, logical] of native.physical) if (state.physical.get(path) !== logical) throw new Error('Trusted native target identity changed')
  const access = await inspectAccess(new Map([...native.physical, ...[...native.accessPaths].map(path => [path, 'resolution'] as [string, string])]), state.environment)
  if (state.access.identity) assertStableAccessIdentity(state.access.identity, access.identity ?? await acquireLocalIdentity(state.environment))
}

/** Trusted install files may be hardlinked by pnpm; bytes are rehashed, never trusted from SRI alone. */
async function fileBytes(path: string) {
  const before = await lstat(path,{bigint:true})
  if (!before.isFile() || before.isSymbolicLink() || before.size > limit || before.mode & 0o6022n || !safeOwner(Number(before.uid))) throw new Error(`Unsafe trusted file: ${path}`)
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try {
    const st = await handle.stat({bigint:true})
    if (st.ino !== before.ino || st.dev !== before.dev || st.size !== before.size || st.mode !== before.mode || st.uid !== before.uid || st.gid !== before.gid) throw new Error('Trusted file replaced')
    const buffer = Buffer.alloc(Number(st.size)); let offset = 0
    while (offset < buffer.length) { const r = await handle.read(buffer, offset, buffer.length - offset, offset); if (!r.bytesRead) throw new Error('Trusted file truncated'); offset += r.bytesRead }
    const tail = Buffer.alloc(1); if ((await handle.read(tail, 0, 1, offset)).bytesRead) throw new Error('Trusted file grew')
    const after = await handle.stat({bigint:true}), current = await lstat(path,{bigint:true})
    if (after.mtimeNs !== st.mtimeNs || after.ctimeNs !== st.ctimeNs || current.ino !== st.ino || current.dev !== st.dev || current.isSymbolicLink()) throw new Error('Trusted file changed')
    return { bytes: Uint8Array.from(buffer), mode: (st.mode & 0o111n ? '100755' : '100644') as '100755' | '100644' }
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
  const commitBytes = await gitBytes(binary, root, ['cat-file', 'commit', commit], env)
  requireObjectHash(commit, 'commit', commitBytes)
  const rootTree = /^tree ([a-f0-9]{40})\n/.exec(commitBytes.toString('utf8'))?.[1]
  if (!rootTree) throw new Error('Invalid commit tree')
  const treeObjects: TreeEntry[] = [{ path: '', mode: '040000', type: 'tree', oid: rootTree }]
  const bytes = await gitBytes(binary, root, ['ls-tree', '-r', '-t', '-z', commit], env)
  const result = new Map<string, TreeEntry>(), aliases = new Set<string>()
  for (const line of new TextDecoder('utf8', { fatal: true }).decode(bytes).split('\0').filter(Boolean)) {
    const match = /^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line); if (!match) throw new Error('Invalid tree record')
    const [, mode, type, oid, path] = match; RepoPathSchema.parse(path)
    const folded = path.toLowerCase(); if (aliases.has(folded)) throw new Error('Case alias in Git tree'); aliases.add(folded)
    if (mode === '040000' && type === 'tree') { treeObjects.push({ path, mode, type, oid }); continue }
    if (!['100644', '100755', '120000'].includes(mode) || type !== 'blob') throw new Error('Unsupported Git special/submodule mode')
    result.set(path, { path, mode, type, oid })
  }
  await blobObjects(binary, root, treeObjects, env)
  return result
}
function requireObjectHash(oid: string, type: string, bytes: Uint8Array) {
  if (createHash('sha1').update(`${type} ${bytes.length}\0`).update(bytes).digest('hex') !== oid) throw new Error('Git object hash mismatch')
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
    const end = bytes.indexOf(10, offset), line = bytes.subarray(offset, end).toString(), match = /^([a-f0-9]{40}) (blob|tree) (\d+)$/.exec(line)
    if (!match || match[1] !== oid || match[2] !== entries.find(e => e.oid === oid)!.type || Number(match[3]) > limit) throw new Error('Invalid bounded Git blob')
    const length = Number(match[3]); offset = end + 1
    if (offset + length >= bytes.length || bytes[offset + length] !== 10) throw new Error('Truncated Git batch')
    requireObjectHash(oid, match[2], bytes.subarray(offset, offset + length)); values.set(oid, Uint8Array.from(bytes.subarray(offset, offset + length))); offset += length + 1
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
  helpers?: ('gh' | 'python3')[]
  resolutions?: { from: string; specifier: string; kind: 'require' | 'loader'; conditions: string[] }[]
}
export interface TrustedToolsetCapture extends ReturnType<typeof bindClosure> {
  readonly root: string
}
type LookupState = { scopes: Map<string, Map<string, string>>; packages: {physical:string;logical:string;name:string}[] }
type CapturePrivate = { lookup: LookupState; access: AccessEvidence; rootIdentity: { dev: number; ino: number }; gitVersion: string; flags: string[]; sha256: string; closure: ExecutableClosure; hostExclusions: string[]; options: CaptureOptions; git: string; environment: NodeJS.ProcessEnv; tree: Map<string, TreeEntry>; physical: Map<string, string> }
const captures = new WeakMap<TrustedToolsetCapture, CapturePrivate>()
async function captureRepository(root: string, commit: string, git: string, env: NodeJS.ProcessEnv, entries: Map<string, ClosureEntry>, physical: Map<string, string>) {
  const all = await tree(git, root, commit, env), selected = [...all.values()].filter(e => protectedToolsetPath(e.path)), blobs = await blobObjects(git, root, selected, env)
  for (const e of selected) {
    const path = `repo/${e.path}`, bytes = blobs.get(e.oid)!, full = join(root, e.path)
    if (e.mode === '120000') {
      const literal = new TextDecoder('utf8', { fatal: true }).decode(bytes)
      if (isAbsolute(literal) || /[\\\0\r\n]/.test(literal)) throw new Error('Escaped repository symlink')
      const target = posix.normalize(posix.join(posix.dirname(path), literal)); logical.parse(target)
      if (!target.startsWith('repo/') || !contains(root, await realpath(full)) || await readlink(full) !== literal) throw new Error('Repository symlink drift')
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
        if (basename(path) === 'node_modules') {
          if (!/^(?:apps|packages)\/[^/]+\/node_modules$/.test(path) || !all.has(`${dirname(path)}/package.json`)) throw new Error(`Unknown dependency discovery scope: ${path}`)
          return false
        }
        if (!stat.isDirectory() && !all.has(path)) throw new Error(`Untracked executable material: ${path}`)
      })
    } catch (e) { if (!absent(e)) throw e }
  }
  for (const name of await readdir(root)) if (protectedToolsetPath(name) && !all.has(name) && !protectedRoots.includes(name) && !optional.includes(name)) throw new Error(`Untracked execution config: ${name}`)
  return { all, blobs }
}
function yaml(bytes: Uint8Array): any { const value = loadYaml(new TextDecoder('utf8', { fatal: true }).decode(bytes)); if (!value || typeof value !== 'object') throw new Error('Invalid trusted lock material'); return value }
// Installed package JSON uses Node's JSON grammar (including decimal config values).
// Only identity fields are projected; the entire original file is separately byte-bound.
function json(bytes: Uint8Array): any { const value = JSON.parse(new TextDecoder('utf8', { fatal: true }).decode(bytes)); if (!value || typeof value !== 'object') throw new Error('Invalid package material'); return value }
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
    if (!contains(virtual, packageRoot) || !/^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || await realpath(packageRoot) !== packageRoot) throw new Error('Aliased installed package root')
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
    if (stat.isDirectory()) { entries.set(path, { path, state: 'directory', mode: '040000' }); physical.set(full, path); return }
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
      if (typeof specification !== 'string') throw new Error('Invalid lock dependency locator')
      const expectedTarget = specification.startsWith('link:') ? resolve(pkg.physical, specification.slice(5)) : null
      const expectedKey = lock.snapshots[specification] ? specification : `${name}@${specification}`
      if (expectedTarget ? target !== expectedTarget : destination.key !== expectedKey) throw new Error(`Installed dependency resolution differs from lock: ${pkg.key} -> ${name}`)
      resolutions.push({ from: workspace ? `repo/${pkg.key.slice(10) === '.' ? '' : pkg.key.slice(10) + '/'}package.json` : `${pkg.logical}/package.json`, specifier: name, kind: 'require', conditions: ['node', 'require', 'default'], target: destination.logical })
    }
  }
  const lookup = await captureLookupScopes(root, packages, entries, physical, resolutions, mapPhysical)
  for(const locator of locators)if(locator.root==='repo'||locator.root.startsWith('repo/')) {const inventory=[...entries.values()].filter(entry=>entry.path.startsWith(`${locator.root}/`)).sort((a,b)=>compareUtf8(a.path,b.path));locator.integrity=`sha256-${Buffer.from(rawSha256(canonicalBytes(inventory)),'hex').toString('base64')}`}
  return { locators, mapPhysical, nativeTargets, lookup }
}
async function captureLookupScopes(root: string, packages: LookupState['packages'], entries: Map<string,ClosureEntry>, physical: Map<string,string>, resolutions: ExecutableClosure['resolutions'], mapPhysical: (path:string)=>string): Promise<LookupState> {
  const scopes = new Map<string,Map<string,string>>(), pending = new Map<string,string>()
  for (const pkg of packages) {
    const workspace=pkg.logical==='repo'||pkg.logical.startsWith('repo/')
    const directory=workspace?join(pkg.physical,'node_modules'):pkg.physical.slice(0,pkg.physical.length-pkg.name.length-1)
    pending.set(directory,`runtime/lookup-scopes/${workspace?pkg.logical:`store/${pkg.logical.slice(5)}`}`)
  }
  pending.set(join(root,'node_modules/.pnpm/node_modules'),'runtime/lookup-scopes/hoisted')
  // Bundled package scopes are covered by their containing installed package's complete bytes.
  for (const [full,logical] of physical) if (logical.startsWith('deps/') && basename(full)==='node_modules') pending.set(full,`runtime/lookup-scopes/bundled/${logical.slice(5)}`)
  const checked=new Set<string>()
  for(const [file,name] of physical) if(name.startsWith('repo/')) for(let directory=dirname(file);contains(root,directory);directory=dirname(directory)) {
    if(checked.has(directory))break;checked.add(directory);const scope=join(directory,'node_modules')
    const manifest=join(directory,'package.json'),manifestPath=`repo/${relative(root,manifest).split(sep).join('/')}`,present=await lstat(manifest).catch(error=>{if(absent(error))return null;throw error})
    if(present&&!entries.has(manifestPath))throw new Error('Untracked ancestor package configuration')
    if(!present&&!entries.has(manifestPath))entries.set(manifestPath,{path:manifestPath,state:'absent'})
    if(!pending.has(scope)&&await lstat(scope).catch(error=>{if(absent(error))return null;throw error}))throw new Error('Unknown source dependency discovery scope')
    if(directory===root)break
  }
  const packageAt=new Map(packages.map(pkg=>[pkg.physical,pkg]))
  for (const [directory,logical] of pending) {
    const stat=await lstat(directory).catch(error=>{if(absent(error))return null;throw error})
    if (!stat) { entries.set(logical,{path:logical,state:'absent'}); continue }
    if (!stat.isDirectory()||stat.isSymbolicLink()||await realpath(directory)!==directory) throw new Error('Aliased dependency discovery scope')
    entries.set(logical,{path:logical,state:'directory',mode:'040000'}); addDirectories(entries,logical); if(!physical.has(directory))physical.set(directory,logical)
    const scope=new Map<string,string>();scopes.set(directory,scope)
    async function bindFile(full:string,path:string) {
      const old=physical.get(full); if(old)return old
      const stat=await lstat(full)
      if(stat.isSymbolicLink()) {const target=mapPhysical(await realpath(full));entries.set(path,{path,state:'symlink',mode:'120000',policy:'installed-logical',linkTextBase64:null,target});physical.set(full,path);return path}
      const content=await fileBytes(full);entries.set(path,fileEntry(path,content.bytes,content.mode));addDirectories(entries,path);physical.set(full,path);return path
    }
    // A completed Vite ESM config load leaves this exact empty directory behind.
    // Bind its absence/presence and inspect access; never authorize cached code.
    if (directory === join(root, 'node_modules')) {
      const cache = join(directory, '.vite-temp'), cachePath = `${logical}/.vite-temp`
      const stat = await lstat(cache).catch(error => { if (absent(error)) return null; throw error })
      if (!stat) entries.set(cachePath, { path: cachePath, state: 'absent' })
      else {
        if (!stat.isDirectory() || stat.isSymbolicLink() || await realpath(cache) !== cache || (await readdir(cache)).length)
          throw new Error('Expected an empty, unaliased Vite config directory after Vite exits')
        entries.set(cachePath, { path: cachePath, state: 'directory', mode: '040000' }); physical.set(cache, cachePath)
      }
    }
    for(const name of (await readdir(directory)).sort(compareUtf8)) {
      const full=join(directory,name)
      if(name==='.bin') {
        const stat=await lstat(full);if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error('Unsafe installed bin scope');entries.set(`${logical}/.bin`,{path:`${logical}/.bin`,state:'directory',mode:'040000'})
        for(const child of (await readdir(full)).sort(compareUtf8)) {RepoPathSchema.parse(child);const target=await bindFile(join(full,child),`${logical}/.bin/${child}`);resolutions.push({from:logical,specifier:`.bin/${child}`,kind:'binary',conditions:['installed'],target})}
        continue
      }
      if(directory===join(root,'node_modules') && name==='.pnpm')continue
      if(directory===join(root,'node_modules') && name==='.vite-temp')continue // Empty/absent state was bound above.
      // Vite's unused cache is not an executable target in this launcher; child file guards deny it.
      if(directory===join(root,'node_modules') && name==='.vite') {const st=await lstat(full);if(!st.isDirectory()||st.isSymbolicLink())throw new Error('Unsafe non-loadable cache');continue}
      if(directory===join(root,'node_modules') && ['.modules.yaml','.pnpm-workspace-state-v1.json'].includes(name)) {await bindFile(full,`${logical}/${name}`);continue}
      if(name==='.pnpm'&&logical.startsWith('runtime/lookup-scopes/bundled/'))continue // Its full bundled bytes and nested scopes were captured above.
      if(name.startsWith('.'))throw new Error(`Unknown dependency discovery entry: ${name}`)
      const names=name.startsWith('@')?(await readdir(full)).sort(compareUtf8).map(child=>`${name}/${child}`):[name]
      if(name.startsWith('@')) {const st=await lstat(full);if(!st.isDirectory()||st.isSymbolicLink())throw new Error('Aliased package scope')}
      for(const request of names) {
        RepoPathSchema.parse(request);const source=join(directory,request), target=await realpath(source), mapped=mapPhysical(target)
        if(!entries.has(mapped))throw new Error('Unmeasured dependency discovery target')
        const bundled=logical.startsWith('runtime/lookup-scopes/bundled/')
        if(!bundled&&!packageAt.has(target))throw new Error('Unknown dependency discovery package')
        scope.set(request,target)
        resolutions.push({from:logical,specifier:request,kind:'require',conditions:['node','lookup'],target:mapped})
        const st=await lstat(source)
        if(st.isSymbolicLink()&&!physical.has(source)) {const path=`${logical}/${request}`;entries.set(path,{path,state:'symlink',mode:'120000',policy:'installed-logical',linkTextBase64:null,target:mapped});physical.set(source,path)}
      }
    }
  }
  const installedLock=join(root,'node_modules/.pnpm/lock.yaml')
  try {const content=await fileBytes(installedLock),path='runtime/lookup-scopes/installed-lock.yaml';entries.set(path,fileEntry(path,content.bytes,content.mode));physical.set(installedLock,path)} catch(error){if(!absent(error))throw error;entries.set('runtime/lookup-scopes/installed-lock.yaml',{path:'runtime/lookup-scopes/installed-lock.yaml',state:'absent'})}
  return {scopes,packages}
}

export async function captureTrustedToolset(options: CaptureOptions): Promise<TrustedToolsetCapture> {
  // Fail closed before any capture or helper execution: the Linux native-closure
  // contract (ELF interpreter identity and full search-path binding) is not yet
  // implemented, so no Linux runtime may be captured or trusted.
  if (process.platform === 'linux') throw new Error('Trusted toolset capture is not yet supported on Linux')
  const root = await realpath(options.root), flags = options.flags ?? process.execArgv, environment = await trustedLauncherEnvironment(root, options.cwd ?? process.cwd(), options.environment ?? process.env, flags)
  const rootIdentity = await lstat(root)
  const entries = new Map<string, ClosureEntry>(), physical = new Map<string, string>()
  const { git, resolutions: runtimeResolutions, hostExclusions, accessPaths } = await captureRuntime(entries, physical, environment)
  const { all } = await captureRepository(root, options.commit, git, environment, entries, physical)
  const resolutions: ExecutableClosure['resolutions'] = runtimeResolutions
  const { locators, mapPhysical, nativeTargets, lookup } = await captureDependencies(root, all, entries, physical, resolutions)
  const helpers = options.helpers ?? [...(all.has('packages/docs-tooling/src/shared-docs/adapters/updates/github.ts') ? ['gh'] : []), ...(all.has('packages/docs-tooling/src/shared-docs/adapters/updates/lifecycle.ts') ? ['python3'] : [])]
  for (const helper of helpers) {
    if (helper === 'python3') {
      const python = await capturePython(entries, physical, environment)
      nativeTargets.push(...python.nativeTargets); resolutions.push(...python.resolutions); for (const path of python.accessPaths) accessPaths.add(path); continue
    }
    if (helper !== 'gh') throw new Error('Unknown trusted runtime helper')
    nativeTargets.push({ name: 'runtime/gh', path: process.platform === 'darwin' ? process.arch === 'arm64' ? '/opt/homebrew/bin/gh' : '/usr/local/bin/gh' : '/usr/bin/gh' })
    resolutions.push({ from: all.has('packages/docs-tooling/src/shared-docs/adapters/updates/github.ts') ? 'repo/packages/docs-tooling/src/shared-docs/adapters/updates/github.ts' : 'repo/scripts/docs-tooling.js', specifier: 'gh api --hostname github.com --method GET', kind: 'binary', conditions: [], target: 'runtime/gh' })
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
  for (const [name,bytes] of guardFiles) { const path=`runtime/launch/${name}`; entries.set(path,fileEntry(path,bytes,'100644')); addDirectories(entries,path); resolutions.push({from:'runtime/node',specifier:`fixed-child-policy/${name}`,kind:'loader',conditions:['node'],target:path}) }
  entries.set('runtime/launch/guides-worker.cjs', fileEntry('runtime/launch/guides-worker.cjs', guidesWorker, '100644')); addDirectories(entries, 'runtime/launch/guides-worker.cjs')
  if (!all.has(guidesWorkerModule)) entries.set(`repo/${guidesWorkerModule}`, { path: `repo/${guidesWorkerModule}`, state: 'absent' })
  else for (const target of ['scripts/lib/load-typescript.js', 'packages/docs-tooling/src/shared-docs/core/updates/canonical.ts', guidesWorkerModule]) {
    if (entries.get(`repo/${target}`)?.state !== 'file') throw new Error('Fixed Guides worker dependency is unavailable')
    resolutions.push({ from: 'runtime/launch/guides-worker.cjs', specifier: target === guidesWorkerModule ? `${target}#collectGuidesWorker` : target, kind: 'loader', conditions: ['jiti', 'interopDefault'], target: `repo/${target}` })
  }
  const mergedResolutions = new Map<string, ExecutableClosure['resolutions'][number]>()
  for (const edge of resolutions) { const key = Buffer.from(canonicalBytes(resolutionKey(edge))).toString('utf8'); const prior = mergedResolutions.get(key); if (prior && prior.target !== edge.target) throw new Error('Conflicting executable resolution'); mergedResolutions.set(key, edge) }
  const closure: ExecutableClosure = { kind: 'shared-update-executable-closure', schemaVersion: 1, hostTcb: { kind: 'host-os-tcb', schemaVersion: 1, policy: 'host-os-tcb-v1', platform: process.platform, release: release(), architecture: process.arch, systemLibraries: 'trusted-host-unmeasured' }, entries: [...entries.values()].sort((a, b) => compareUtf8(a.path, b.path)), packageLocators: locators.sort((a, b) => compareUtf8(a.root, b.root)), resolutions: [...mergedResolutions.values()].sort((a, b) => tupleCompare(resolutionKey(a), resolutionKey(b))) }
  const result = { ...bindClosure(closure, { kind: 'shared-update-toolset', schemaVersion: 1, runtime: { name: 'node', version: process.version, platform: process.platform, architecture: process.arch }, flags: [...flags], environment: ['JITI_CACHE', 'LANG', 'LC_ALL', 'TZ'].map(name => ({ name, value: environment[name]! })), dependencies: locators.map(p => ({ name: p.name, version: p.version, integrity: p.integrity, resolvedPath: p.root })).sort((a, b) => compareUtf8(a.resolvedPath, b.resolvedPath)) }), root }
  const currentRoot = await lstat(root)
  if (!currentRoot.isDirectory() || currentRoot.ino !== rootIdentity.ino || currentRoot.dev !== rootIdentity.dev) throw new Error('Trusted root identity changed during capture')
  const access = await inspectAccess(new Map([...physical, ...[...accessPaths, ...native.accessPaths].map(path => [path, 'resolution'] as [string, string])]), environment)
  const gitVersion = (await exec(git, ['--version'], { env: environment, timeout: 10000 })).stdout.trim()
  captures.set(result, { lookup, access, rootIdentity: { dev: rootIdentity.dev, ino: rootIdentity.ino }, gitVersion, flags: [...flags], sha256: result.toolsetSha256, closure: validateClosure(result.closure), hostExclusions: [...new Set(hostExclusions)].sort(compareUtf8), options: { ...options, root }, git, environment, tree: all, physical }); return result
}
function captured(value: TrustedToolsetCapture) { const state = captures.get(value); if (!state) throw new Error('Missing independently captured trusted toolset'); return state }
/** Recollect immediately before K or any new compiler load. Serialized manifests cannot authorize this. */
export async function verifyTrustedToolset(value: TrustedToolsetCapture) {
  const state = captured(value), root = await lstat(state.options.root)
  if (!root.isDirectory() || root.isSymbolicLink() || root.ino !== state.rootIdentity.ino || root.dev !== state.rootIdentity.dev) throw new Error('Trusted root identity changed')
  await recheckAccess(state.access)
  await verifyRuntimeBytes(state)
  const fresh = await captureTrustedToolset(state.options)
  if (fresh.root !== state.options.root || fresh.toolsetSha256 !== state.sha256) throw new Error('Trusted executable closure changed')
  assertStableAccessIdentity(state.access.identity, captured(fresh).access.identity)
  if (JSON.stringify(state.access.homeRestriction) !== JSON.stringify(captured(fresh).access.homeRestriction)) throw new Error('Ancestor ACL changed')
}
export async function compareCandidateToolset(value: TrustedToolsetCapture, candidate: { root: string; commit: string; dataPaths: string[] }) {
  const state = captured(value)
  await recheckAccess(state.access); await verifyRuntimeBytes(state)
  const actual = await tree(state.git, await realpath(candidate.root), candidate.commit, state.environment)
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
  await recheckAccess(state.access); await verifyRuntimeBytes(state)
  await inspectAccess(new Map([[target, edge.target]]), state.environment)
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
const darwinSystemLibraries = new Set(['libutil.dylib', 'libSystem.B.dylib', 'libc++.1.dylib', 'libz.1.dylib', 'libiconv.2.dylib', 'libobjc.A.dylib', 'libresolv.9.dylib', 'libncurses.5.4.dylib', 'libsqlite3.dylib', 'libxml2.2.dylib', 'libxcselect.dylib', 'libbz2.1.0.dylib', 'liblzma.5.dylib', 'libcrypto.44.dylib', 'libssl.46.dylib', 'libedit.3.dylib', 'libffi.dylib', 'libpanel.5.4.dylib'])
const darwinFrameworks = new Set(['DirectoryService', 'CoreFoundation', 'CoreServices', 'Security', 'Foundation', 'SystemConfiguration', 'ApplicationServices', 'AppKit', 'IOKit', 'CFNetwork', 'CoreGraphics', 'CoreText', 'Tcl', 'Tk'])
function systemLibrary(path: string) {
  if (process.platform === 'darwin') {
    if (dirname(path) === '/usr/lib' && darwinSystemLibraries.has(basename(path))) return true
    if (path === '/System/Library/PrivateFrameworks/TrustEvaluationAgent.framework/Versions/A/TrustEvaluationAgent') return true
    const m = /^\/System\/Library\/Frameworks\/([^/]+)\.framework\/Versions\/(?:[A-Z]|8\.5)\/([^/]+)$/.exec(path)
    return !!m && m[1] === m[2] && darwinFrameworks.has(m[1])
  }
  return /^\/(usr\/)?lib(?:64|\/x86_64-linux-gnu|\/aarch64-linux-gnu)?\/(?:lib(?:c|m|dl|rt|pthread|resolv|util|z|pcre2-8|gcc_s|stdc\+\+)\.so\.[0-9.]+|ld-linux-(?:x86-64|aarch64)\.so\.[0-9]+)$/.test(path)
}
/** Fixed xcrun discovery is only a location policy; bytes/native/access checks still apply. */
async function resolveDarwinDeveloperTool(tool: 'git' | 'python3', environment: NodeJS.ProcessEnv) {
  const refusal = tool === 'git' ? 'Unknown system Git provisioning' : 'Unknown Python provisioning'
  const output = (await exec('/usr/bin/xcrun', ['--find', tool], { env: environment, timeout: 10000 })).stdout
  const lexical = output.endsWith('\n') ? output.slice(0, -1) : output
  const match = /^(\/Library\/Developer\/CommandLineTools|\/Applications\/Xcode(?:_[0-9]+(?:\.[0-9]+)*)?\.app\/Contents\/Developer)\/usr\/bin\/(git|python3)$/.exec(lexical)
  if (/[\x00-\x20\x7f]/.test(lexical) || !match || match[2] !== tool) throw new Error(refusal)
  const target = await realpath(lexical)
  if (/[\x00-\x20\x7f]/.test(target) || !isAbsolute(target) || resolve(target) !== target || !contains(match[1], target) || target === match[1]) throw new Error(refusal)
  return { lexical, target }
}
async function captureRuntime(entries: Map<string, ClosureEntry>, physical: Map<string, string>, environment: NodeJS.ProcessEnv) {
  const node = await realpath(process.execPath), binaries = new Map<string, string>([['runtime/node', node]])
  const resolutions: ExecutableClosure['resolutions'] = [], developerAccessPaths = new Set<string>()
  for (const [name, path] of accessInspectors()) { binaries.set(name, path); resolutions.push({ from: 'runtime/node', specifier: name, kind: 'binary', conditions: [], target: name }) }
  let git = '/usr/bin/git'
  if (process.platform === 'darwin') {
    binaries.set('runtime/git-resolver', '/usr/bin/xcrun'); binaries.set('runtime/git-shim', '/usr/bin/git')
    const resolved = await resolveDarwinDeveloperTool('git', environment)
    git = resolved.target; developerAccessPaths.add(resolved.lexical)
    resolutions.push({ from: 'runtime/git-resolver', specifier: 'git', kind: 'binary', conditions: [], target: 'runtime/git' })
    resolutions.push({ from: 'runtime/git-shim', specifier: 'xcrun', kind: 'binary', conditions: [], target: 'runtime/git-resolver' })
  } else if (process.platform !== 'linux') throw new Error('Unsupported trusted runtime platform')
  git = await realpath(git); binaries.set('runtime/git', git)
  if (process.platform === 'darwin') {
    const profile = '/Library/Preferences/OpenDirectory/Configurations/Search.plist', content = await fileBytes(profile), logical = 'runtime/identity-profile/Search.plist'
    entries.set(logical, fileEntry(logical, content.bytes, content.mode)); physical.set(profile, logical); addDirectories(entries, logical)
    resolutions.push({ from: 'runtime/identity-resolver', specifier: 'trusted-local-principal-v1/search-configuration', kind: 'loader', conditions: [], target: logical })
  }
  const native = await captureTrustedNativeFiles([...binaries].map(([name, path]) => ({ name, path })))
  for (const entry of native.entries) entries.set(entry.path, entry)
  for (const [full, path] of native.physical) physical.set(full, path)
  return { git, resolutions: [...resolutions, ...native.resolutions], hostExclusions: native.hostExclusions, accessPaths: new Set([...native.accessPaths, ...developerAccessPaths]) }
}

/** Bind the nearest existing ancestor of an absent search candidate so access
 * inspection still rejects a writable lookup location that dyld/ld.so would
 * prefer over the measured library. Returns the LEXICAL path (never the resolved
 * target), so inspection both walks the directory that holds any symlink and,
 * via realpath, the directory it points to. A dangling symlink — the candidate
 * file itself or a path component — cannot be authenticated and is rejected. */
async function nearestExistingDirectory(path: string): Promise<string> {
  // The candidate file itself may be a symlink whose target is absent; reject it.
  let fileIsLink = false
  try {
    fileIsLink = (await lstat(path)).isSymbolicLink()
  } catch (e) {
    if (!absent(e)) throw e
  }
  if (fileIsLink) {
    try {
      await realpath(path)
    } catch (e) {
      if (absent(e)) throw new Error(`Dangling symbolic link in native lookup candidate: ${path}`)
      throw e
    }
  }
  // Walk up to the nearest existing directory or symlink, keeping the lexical path.
  let current = dirname(path)
  for (;;) {
    const parent = dirname(current)
    let exists = false
    try {
      const st = await lstat(current)
      exists = true
      if (st.isDirectory() || st.isSymbolicLink()) {
        // A symlink component is returned lexically; inspectAccess follows it and
        // checks both the holding directory and the target. A dangling one is rejected.
        if (st.isSymbolicLink()) {
          try {
            await realpath(current)
          } catch (e) {
            if (absent(e)) throw new Error(`Dangling symbolic link in native lookup path: ${current}`)
            throw e
          }
        }
        return current
      }
    } catch (e) {
      if (!absent(e)) throw e
    }
    if (exists) { current = parent; continue }
    if (parent === current) throw new Error(`No existing ancestor directory for native lookup candidate: ${path}`)
    current = parent
  }
}

/** Internal bootstrap inventory only; this result is material, never a trusted-capture capability. */
export async function captureTrustedNativeFiles(seeds: { name: string; path: string }[]) {
  const node = await realpath(process.execPath)
  const entries = new Map<string, ClosureEntry>(), physical = new Map<string, string>(), hostExclusions: string[] = []
  const resolutions: ExecutableClosure['resolutions'] = []
  const binaries = new Map(seeds.map(s => [logical.parse(s.name), s.path]))
  const accessPaths = new Set<string>(seeds.map(seed => seed.path))
  const visited = new Set<string>(), logicalByPhysical = new Map([...binaries].map(([name, path]) => [path, name]))
  const pending = [...binaries].map(([name, path]) => ({ name, path, inherited: [] as string[], executable: '' }))
  while (pending.length) {
    const item = pending.shift()!, full = await realpath(item.path)
    if (visited.has(full)) continue; visited.add(full)
    const content = await fileBytes(full); entries.set(item.name, fileEntry(item.name, content.bytes, content.mode)); physical.set(full, item.name); addDirectories(entries, item.name)
    const native = nativeDependencies(content.bytes)
    if (!native) throw new Error(`Unsupported runtime executable: ${item.name}`)
    const executable = item.executable || (isMachExecutable(content.bytes) ? dirname(full) : dirname(node))
    const expand = (path: string) => path.replace(/^@loader_path(?=\/|$)/, dirname(full)).replace(/^@executable_path(?=\/|$)/, executable).replace(/^\$\{?ORIGIN\}?(?=\/|$)/, dirname(full))
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
          try { const actual = await realpath(choice); if (!systemLibrary(actual)) throw new Error('System-library alias escape'); const stat = await lstat(actual); if (stat.uid !== 0 || stat.mode & 0o022) throw new Error('Unsafe system library') } catch (e) { if (!absent(e)) throw e; for (const hop of await resolveSymlinkHops(await nearestExistingDirectory(choice))) accessPaths.add(hop); if (process.platform !== 'darwin') continue }
          trustedSystem = true; break
        }
        try { resolved = await realpath(choice); accessPaths.add(choice); break } catch (e) { if (!absent(e)) throw e; for (const hop of await resolveSymlinkHops(await nearestExistingDirectory(choice))) accessPaths.add(hop) }
      }
      if (trustedSystem) { hostExclusions.push(choices.find(systemLibrary)!); continue }
      if (!resolved) throw new Error(`Missing non-system runtime dependency: ${dependency}`)
      const name = logicalByPhysical.get(resolved) ?? `runtime/libraries/${basename(resolved)}`
      const conflict = [...logicalByPhysical].find(([p, n]) => n === name && p !== resolved); if (conflict) throw new Error('Ambiguous runtime library alias')
      logicalByPhysical.set(resolved, name)
      resolutions.push({ from: item.name, specifier: isAbsolute(dependency) ? `native/${basename(dependency)}` : dependency, kind: 'binary', conditions: [], target: name })
      pending.push({ name, path: resolved, inherited: search, executable })
    }
  }
  return { entries: [...entries.values()].sort((a, b) => compareUtf8(a.path, b.path)), physical, resolutions, hostExclusions, accessPaths }
}


/** Transaction-local provenance; absolute paths never enter semantic closure bytes. */
export function describeTrustedToolset(value: TrustedToolsetCapture) {
  const state = captured(value)
  return { access: { inspected: state.access.pins.size, identity: state.access.identity ? { policy: 'trusted-local-principal-v1', source: '/Local/Default', users: state.access.identity.users.length, groupRecords: state.access.identity.groups.length } : null, homeRestriction: state.access.homeRestriction, inspectors: accessInspectors().map(([name, path]) => ({ name, path })) }, root: state.options.root, commit: state.options.commit, git: state.git, gitVersion: state.gitVersion, runtime: [...state.physical].filter(([, path]) => path.startsWith('runtime/')).map(([physical, path]) => ({ path, physical })), hostExclusions: [...state.hostExclusions] }
}

/** Persist private validation observations only through the capability-owned 0600 blob store. */
export async function retainTrustedAccessEvidence(value: TrustedToolsetCapture, evidence: EvidenceStore): Promise<BlobRef> {
  await verifyTrustedToolset(value)
  const state = captured(value)
  return writeOwnedBlob(evidence, canonicalBytes({ kind: 'shared-update-access-validation', schemaVersion: 1, policy: 'trusted-local-principal-v1', commit: state.options.commit, toolsetSha256: state.sha256,
    identity: state.access.identity, homeRestriction: state.access.homeRestriction, paths: [...state.access.pins].sort(([a],[b])=>compareUtf8(a,b)).map(([path,pin])=>({path,...pin})) }))
}

const pythonWrapper = Buffer.from('#!/bin/sh\nexec "${0%/*}/python-real" -I -S -B "$@"\n')
function isMachExecutable(input: Uint8Array) {
  let b = Buffer.from(input)
  if (b.length < 16) return false
  if (b.readUInt32BE(0) === 0xcafebabe) {
    const cpu = process.arch === 'arm64' ? 0x100000c : 0x1000007, count = b.readUInt32BE(4)
    for (let i = 0; i < count; i++) { const p = 8 + i * 20; if (b.readUInt32BE(p) === cpu) { b = b.subarray(b.readUInt32BE(p + 8)); break } }
  }
  return b.length >= 16 && b.readUInt32LE(0) === 0xfeedfacf && b.readUInt32LE(12) === 2
}
async function capturePython(entries: Map<string, ClosureEntry>, physical: Map<string, string>, environment: NodeJS.ProcessEnv) {
  let binary = '/usr/bin/python3'
  const nativeTargets = [{ name: 'runtime/shell', path: '/bin/sh' }], resolutions: ExecutableClosure['resolutions'] = [], accessPaths = new Set<string>()
  if (process.platform === 'darwin') {
    const resolved = await resolveDarwinDeveloperTool('python3', environment)
    binary = resolved.target; accessPaths.add(resolved.lexical)
    nativeTargets.push({ name: 'runtime/python3-shim', path: '/usr/bin/python3' })
    resolutions.push({ from: 'runtime/git-resolver', specifier: 'python3', kind: 'binary', conditions: [], target: 'runtime/python3' })
  }
  binary = await realpath(binary)
  const version = /^python(3\.\d+)$/.exec(basename(binary))?.[1]
  if (!version) throw new Error('Unsupported Python installation layout')
  const prefix = dirname(dirname(binary)), stdlib = join(prefix, 'lib', `python${version}`)
  if (await realpath(stdlib) !== stdlib) throw new Error('Aliased Python standard library')
  nativeTargets.push({ name: 'runtime/python3', path: binary }); physical.set(binary, 'runtime/python3')
  physical.set(stdlib, 'runtime/python-stdlib')
  entries.set('runtime/python-stdlib', { path: 'runtime/python-stdlib', state: 'directory', mode: '040000' })
  const links: { path: string; full: string }[] = []
  await walk(stdlib, async (suffix, stat) => {
    if (suffix === 'site-packages' || suffix === 'dist-packages') return false // -S excludes site initialization and .pth execution.
    const full = join(stdlib, suffix), path = `runtime/python-stdlib/${suffix}`
    if (stat.isDirectory()) { entries.set(path, { path, state: 'directory', mode: '040000' }); physical.set(full, path); return }
    if (stat.isSymbolicLink()) { links.push({ path, full }); return false }
    const content = await fileBytes(full); entries.set(path, fileEntry(path, content.bytes, content.mode)); physical.set(full, path)
    if (nativeDependencies(content.bytes)) nativeTargets.push({ name: path, path: full })
  })
  for (const link of links) {
    const target = await realpath(link.full)
    if (!contains(stdlib, target) && !(process.platform === 'darwin' && target === join(prefix, 'Python3'))) throw new Error('Python standard-library link escape')
    const logicalTarget = contains(stdlib, target) ? `runtime/python-stdlib/${relative(stdlib, target).split(sep).join('/')}` : 'runtime/python-core'
    if (logicalTarget === 'runtime/python-core' && !nativeTargets.some(t => t.name === logicalTarget)) nativeTargets.push({ name: logicalTarget, path: target })
    entries.set(link.path, { path: link.path, state: 'symlink', mode: '120000', policy: 'installed-logical', linkTextBase64: null, target: logicalTarget })
  }
  const archive = join(prefix, 'lib', `python${version.replace('.', '')}.zip`)
  try { const content = await fileBytes(archive); entries.set('runtime/python-stdlib.zip', fileEntry('runtime/python-stdlib.zip', content.bytes, content.mode)); physical.set(archive, 'runtime/python-stdlib.zip') }
  catch (e) { if (!absent(e)) throw e; entries.set('runtime/python-stdlib.zip', { path: 'runtime/python-stdlib.zip', state: 'absent' }) }
  entries.set('runtime/launch/python3', fileEntry('runtime/launch/python3', pythonWrapper, '100755')); addDirectories(entries, 'runtime/launch/python3')
  resolutions.push({ from: 'runtime/launch/python3', specifier: 'shell-interpreter', kind: 'binary', conditions: [], target: 'runtime/shell' },
    { from: 'runtime/launch/python3', specifier: 'python-real', kind: 'binary', conditions: ['-I', '-S', '-B'], target: 'runtime/python3' },
    { from: 'runtime/python3', specifier: 'isolated-standard-library', kind: 'import', conditions: ['-I', '-S', '-B'], target: 'runtime/python-stdlib' })
  return { nativeTargets, resolutions, accessPaths }
}

/** Launch existing consumers in a separate process; never mutate the parent environment. */
export async function prepareTrustedLauncher(value: TrustedToolsetCapture, evidence: EvidenceStore) {
  const state = captured(value), owned = await createOwnedDirectory(evidence), temporary = await createOwnedDirectory(evidence), targets = new Map<string, string>()
  for (const [full, path] of state.physical) if (['runtime/node', 'runtime/git', 'runtime/gh', 'runtime/python3'].includes(path)) targets.set(path, full)
  const links = new Map<string, string>()
  for (const [name, logical] of [['node', 'runtime/node'], ['git', 'runtime/git'], ['gh', 'runtime/gh'], ['python-real', 'runtime/python3']] as const) {
    const target = targets.get(logical); if (!target) continue
    await owned.verify(); await symlink(target, join(owned.root, name)); links.set(name, target); await owned.verify()
  }
  if (targets.has('runtime/python3')) { await owned.verify(); await writeFile(join(owned.root, 'python3'), pythonWrapper, { flag: 'wx', mode: 0o700 }); await owned.verify() }
  await owned.verify(); await writeFile(join(owned.root, 'guides-worker.cjs'), guidesWorker, { flag: 'wx', mode: 0o600 }); await owned.verify()
  const files: Record<string,{sha256:string;bytes:number;mode:string}>=Object.create(null)
  const byLogical=new Map(state.closure.entries.map(entry=>[entry.path,entry]))
  for(const [path,logical] of state.physical) {const entry=byLogical.get(logical);if(entry?.state==='file')files[path]={sha256:entry.sha256,bytes:entry.bytes,mode:entry.mode}}
  for(const [name,bytes] of [...guardFiles,['guides-worker.cjs',guidesWorker] as [string,Buffer]]) {
    const path=join(owned.root,name);files[path]={sha256:rawSha256(bytes),bytes:bytes.length,mode:'100644'}
    if(name!=='guides-worker.cjs') {await owned.verify();await writeFile(path,bytes,{flag:'wx',mode:0o600})}
  }
  const mapBytes=canonicalBytes({root:state.options.root,files,scopes:Object.fromEntries([...state.lookup.scopes].map(([path,scope])=>[path,Object.fromEntries(scope)])),packages:state.lookup.packages.map(pkg=>({root:pkg.physical,name:pkg.name})).sort((a,b)=>b.root.length-a.root.length)})
  await owned.verify();await writeFile(join(owned.root,'resolution-map.json'),mapBytes,{flag:'wx',mode:0o600})
  const environment: NodeJS.ProcessEnv = { ...state.environment, PATH: owned.root, TMPDIR: temporary.root, TMP: temporary.root, TEMP: temporary.root }
  const guardedFlags=[...state.flags,'--require',join(owned.root,'resolution-bootstrap.cjs')]
  async function verifyLauncher() {
    await owned.verify();await temporary.verify()
    const expected = ['guides-worker.cjs', 'resolution-map.json', ...guardFiles.keys(), ...links.keys(), ...(targets.has('runtime/python3') ? ['python3'] : [])].sort(compareUtf8)
    if ((await readdir(owned.root)).sort(compareUtf8).join('\0') !== expected.join('\0')) throw new Error('Launcher inventory changed')
    for(const [name,bytes] of [...guardFiles,['resolution-map.json',Buffer.from(mapBytes)] as [string,Buffer]]) {const current=await fileBytes(join(owned.root,name));if(current.mode!=='100644'||!Buffer.from(current.bytes).equals(bytes))throw new Error('Launcher resolution policy changed')}
    const worker = await fileBytes(join(owned.root, 'guides-worker.cjs')); if (worker.mode !== '100644' || !Buffer.from(worker.bytes).equals(guidesWorker)) throw new Error('Launcher worker changed')
    for (const [name, target] of links) if (await readlink(join(owned.root, name)) !== target || await realpath(join(owned.root, name)) !== target) throw new Error('Launcher target changed')
    if (targets.has('runtime/python3')) { const actual = await fileBytes(join(owned.root, 'python3')); if (actual.mode !== '100755' || !Buffer.from(actual.bytes).equals(pythonWrapper)) throw new Error('Launcher wrapper changed') }
    await inspectAccess(new Map([[owned.root, 'launcher'], ...expected.map(name => [join(owned.root, name), 'launcher'] as [string, string])]), state.environment)
    await owned.verify()
  }
  return {
    bin: owned.root, cwd: state.options.root, environment: { ...environment },
    async runGuidesCollector(data: unknown, secrets: { GH_TOKEN?: string } = {}, signal?: AbortSignal) {
      signal?.throwIfAborted()
      if (state.closure.entries.find(e => e.path === `repo/${guidesWorkerModule}`)?.state !== 'file') throw new Error('Fixed Guides worker module is missing')
      if (Object.keys(secrets).some(name => name !== 'GH_TOKEN')) throw new Error('Unsupported child credential setting')
      const input = canonicalBytes(data)
      if (input.length > workerLimit) throw new Error('Guides worker input exceeds byte bound')
      await owned.verify(); await verifyTrustedToolset(value); await verifyLauncher()
      signal?.throwIfAborted()
      return invokeGuidesWorker(targets.get('runtime/node')!, [...guardedFlags, join(owned.root, 'guides-worker.cjs'), state.options.root], state.options.root, { ...environment, ...secrets }, input, signal)
    },
    async run(script: string, args: string[], secrets: { GH_TOKEN?: string } = {}) {
      RepoPathSchema.parse(script)
      if (Object.keys(secrets).some(name => name !== 'GH_TOKEN')) throw new Error('Unsupported child credential setting')
      if (state.closure.entries.find(e => e.path === `repo/${script}`)?.state !== 'file' || !/\.[cm]?js$/.test(script)) throw new Error('Child entry is not captured trusted JavaScript')
      await owned.verify(); await verifyTrustedToolset(value); await verifyLauncher()
      return exec(targets.get('runtime/node')!, [...guardedFlags, join(state.options.root, script), ...args], { cwd: state.options.root,
        env: { ...environment, ...secrets }, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 120_000 })
    },
  }
}


// Fixed child policies: neither module/export choices nor the physical allow-map come from requests.
const resolutionPolicy=Buffer.from(String.raw`'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),url=require('node:url'),mod=require('node:module');
module.exports=function createPolicy(data){
 const within=(root,file)=>{const r=path.relative(root,file);return r===''||r!=='..'&&!r.startsWith('..'+path.sep)&&!path.isAbsolute(r)};
 const owner=file=>data.packages.find(pkg=>within(pkg.root,file));
 return function check(request,parent,target,esm=false){
  if(mod.isBuiltin(request)||target.startsWith('node:'))return;
  const file=target.startsWith('file:')?url.fileURLToPath(target):target;
  if(!path.isAbsolute(file))throw Error('Unmeasured executable URL');
  const real=fs.realpathSync(file),entry=data.files[real];if(!entry)throw Error('Unmeasured executable target');
  const from=parent&&(parent.startsWith('file:')?url.fileURLToPath(parent):parent);
  const relative=request.startsWith('./')||request.startsWith('../');
  if(request.startsWith('#')) {
   const pkg=from&&owner(from);if(!pkg||!within(pkg.root,real))throw Error('Unsupported package import escape');
   const manifest=path.join(pkg.root,'package.json'),bound=data.files[manifest];if(!bound)throw Error('Unmeasured package import configuration');
   const bytes=fs.readFileSync(manifest,{flag:fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW});if(crypto.createHash('sha256').update(bytes).digest('hex')!==bound.sha256)throw Error('Package import configuration changed');
   const imports=JSON.parse(bytes).imports;if(!imports||typeof imports!=='object')throw Error('Missing package import map');
   const definitions=Object.hasOwn(imports,request)?[imports[request]]:Object.entries(imports).filter(([key])=>{const parts=key.split('*');return parts.length===2&&request.startsWith(parts[0])&&request.endsWith(parts[1])}).map(([,value])=>value);
   const local=value=>value===null||typeof value==='string'&&value.startsWith('./')&&!value.includes('%')&&!value.includes('\\')&&!value.split('/').includes('..')||Array.isArray(value)&&value.every(local)||value&&typeof value==='object'&&Object.values(value).every(local);
   if(!definitions.length||!definitions.every(local))throw Error('Unsupported nonlocal package import map');
  }
  else if(!relative&&!path.isAbsolute(request)&&!request.startsWith('file:')) {
   if(!from||!data.files[from])throw Error('Unknown executable parent');
   const parts=request.split('/'),name=request.startsWith('@')?parts.slice(0,2).join('/'):parts[0];
   if(!/^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name))throw Error('Unknown executable package specifier');
   const self=owner(from);let expected=self&&self.name===name?self.root:null;
   for(let directory=path.dirname(from);within(data.root,directory);directory=path.dirname(directory)) {
    const scopePath=path.join(directory,'node_modules'),scope=data.scopes[scopePath];
    if(fs.existsSync(scopePath)&&!scope)throw Error('Unknown executable lookup scope');
    if(scope) {const candidate=path.join(scopePath,name);if(fs.existsSync(candidate)&&!Object.hasOwn(scope,name))throw Error('Unknown executable lookup entry');if(!expected&&Object.hasOwn(scope,name)){expected=scope[name];if(fs.realpathSync(candidate)!==expected)throw Error('Executable scope target changed')}}
    if(directory===data.root)break;
   }
   if(!expected||!within(expected,real)||esm&&!fs.statSync(expected).isDirectory())throw Error('Unknown executable lookup scope or fallback');
  } else {
   const lexical=request.startsWith('file:')?url.fileURLToPath(request):path.resolve(from?path.dirname(from):data.root,request);
   if(!within(data.root,lexical)&&!data.files[lexical])throw Error('Executable path escapes trusted discovery roots');
  }
  const st=fs.lstatSync(real);if(!st.isFile()||st.isSymbolicLink()||st.size!==entry.bytes||(st.mode&0o111?'100755':'100644')!==entry.mode)throw Error('Executable target changed');
  const bytes=fs.readFileSync(real,{flag:fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW});
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Executable bytes changed');
 };
};
`)
const resolutionBootstrap=Buffer.from(`'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),mod=require('node:module');
if(process.env.JITI_CACHE!=='false')throw Error('Fixed loader cache policy missing');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'resolution-map.json'),'utf8'));
const check=require('./resolution-policy.cjs')(data),original=mod._resolveFilename,lookup=mod._resolveLookupPaths;
if(typeof lookup!=='function')throw Error('Unsupported trusted CommonJS lookup hooks');
mod._resolveLookupPaths=function(request,parent){const paths=Reflect.apply(lookup,this,[request,parent]);if(mod.isBuiltin(request)||request.startsWith('.')||request.startsWith('#')||path.isAbsolute(request))return paths;return paths.filter(scope=>Object.hasOwn(data.scopes,scope))};
mod._resolveFilename=function(request,parent,...rest){const target=Reflect.apply(original,this,[request,parent,...rest]);check(request,parent&&parent.filename,target);return target};
if(typeof mod.register!=='function')throw Error('Unsupported trusted Node loader hooks');
mod.register(url.pathToFileURL(path.join(__dirname,'resolution-loader.mjs')),{data});
`)
const resolutionLoader=Buffer.from(`import createPolicy from './resolution-policy.cjs';
let check;
export function initialize(data){check=createPolicy(data)}
export async function resolve(specifier,context,nextResolve){const result=await nextResolve(specifier,context);check(specifier,context.parentURL,result.url,true);return result}
`)
const guardFiles=new Map<string,Buffer>([['resolution-policy.cjs',resolutionPolicy],['resolution-bootstrap.cjs',resolutionBootstrap],['resolution-loader.mjs',resolutionLoader]])

const workerLimit = 32 * 1024 * 1024
// The complete Guides result includes both base64 blobs and original detail text.
// Keep its fixed capacity separate from request and diagnostic stream limits.
const workerResultLimit = 128 * 1024 * 1024
const guidesWorkerModule = 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts'
// The executable text and every module/export choice are fixed policy, never request data.
const guidesWorker = Buffer.from(`'use strict';
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const root=process.argv[2],limit=33554432,resultLimit=${workerResultLimit},chunks=[];let total=0;
  for(;;){const chunk=Buffer.alloc(65536),count=fs.readSync(0,chunk,0,chunk.length,null);if(!count)break;total+=count;if(total>limit)throw Error('Guides worker input exceeds byte bound');chunks.push(chunk.subarray(0,count));}
  const load=require(path.join(root,'scripts/lib/load-typescript.js')).loadTypeScript;
  const common=load(path.join(root,'packages/docs-tooling/src/shared-docs/core/updates/canonical.ts'));
  const data=common.parseStrictJson(Buffer.concat(chunks));
  const provider=load(path.join(root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts'));
  if(typeof provider.collectGuidesWorker!=='function')throw Error('Fixed Guides worker export is unavailable');
  const result=common.canonicalBytes(await provider.collectGuidesWorker(data));
  if(result.length>resultLimit)throw Error('Guides worker result exceeds byte bound');
  fs.writeFileSync(3,result);
})().catch(error=>{console.error(String(error));process.exitCode=1});
`)
export interface GuidesWorkerSettlement {
  pid: number | null
  born: boolean
  close: {code: number | null; signal: NodeJS.Signals | null} | null
  group: 'absent' | 'unknown'
  signals: {signal: NodeJS.Signals; at: number}[]
  cleanupErrors: {operation: string; code: string | null; message: string}[]
}
/** Own only the group born from this actual handle; a parent cannot clean up after
 * its own fatal death, or certify descendants that deliberately leave the group. */
async function invokeGuidesWorker(binary: string, args: string[], cwd: string, environment: NodeJS.ProcessEnv,
  input: Uint8Array, signal?: AbortSignal): Promise<{value: unknown; stdout: string; stderr: string; settlement: GuidesWorkerSettlement}> {
  signal?.throwIfAborted()
  const child = spawn(binary, args, {cwd, env: environment, stdio: ['pipe', 'pipe', 'pipe', 'pipe'], detached: true})
  const receipt: GuidesWorkerSettlement = {pid: child.pid ?? null, born: false, close: null, group: 'unknown', signals: [], cleanupErrors: []}
  const output: Buffer[][] = [[], [], []], sizes = [0, 0, 0]
  let primary: Error | null = null, exitFailure: Error | null = null, terminal = false
  let birthDone!: () => void, closeDone!: () => void, finishRequested!: () => void
  const birth = new Promise<void>(resolve => {birthDone = resolve}), closed = new Promise<void>(resolve => {closeDone = resolve})
  const requested = new Promise<void>(resolve => {finishRequested = resolve})
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const errorOf = (value: unknown) => value instanceof Error ? value : new Error(String(value))
  const latch = (value: unknown) => { primary ??= errorOf(value) }
  const diagnostic = (operation: string, error: unknown) => {
    const value = errorOf(error)
    receipt.cleanupErrors.push({operation, code: (error as NodeJS.ErrnoException)?.code ?? null, message: value.message})
  }
  const fail = (error: unknown) => { latch(error); finishRequested() }
  const guarded = <T extends unknown[]>(fn: (...args: T) => void) => (...args: T) => { if (terminal) return; try {fn(...args)} catch (error) {fail(error)} }
  const abort = () => fail(signal?.reason ?? new Error('Guides worker cancelled'))
  const interrupt = () => fail(new Error('Guides worker interrupted: SIGINT'))
  const terminate = () => fail(new Error('Guides worker interrupted: SIGTERM'))
  const later = (fn: () => void, ms: number) => { const timer = setTimeout(fn, ms); timers.add(timer); return timer }
  const bounded = async (promise: Promise<void>) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try { await Promise.race([promise, new Promise<void>(resolve => {timer = later(resolve, 1000)})]) }
    finally { if (timer) {clearTimeout(timer); timers.delete(timer)} }
  }
  const probe = (): boolean | null => {
    if (!receipt.born) return receipt.pid === null ? false : null
    if (receipt.pid === null) return null
    try { process.kill(-receipt.pid, 0); return true } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false
      diagnostic('probe', error); return null
    }
  }
  const grace = async () => {
    const deadline = performance.now() + 1000
    while (performance.now() < deadline) await new Promise<void>(resolve => later(resolve, Math.min(25, deadline - performance.now())))
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  let response: {value: unknown; stdout: string; stderr: string; settlement: GuidesWorkerSettlement} | undefined
  try {
    child.on('spawn', guarded(() => { receipt.born = true; birthDone(); if (!primary) child.stdin.end(input) }))
    child.on('error', guarded(error => {birthDone(); fail(error)}))
    child.stdin.on('error', guarded(fail))
    for (const [i, stream] of [child.stdout, child.stderr, child.stdio[3]].entries()) stream!.on('error', guarded(fail)).on('data', guarded((bytes: Buffer) => {
      // exit can precede final stderr data. Retain bounded diagnostics through
      // close even after a failure, but stop accumulating result/stdout bytes.
      if (primary && i !== 1) return
      sizes[i] += bytes.length
      if (sizes[i] > (i === 2 ? workerResultLimit : workerLimit)) fail(new Error('Guides worker output exceeds byte bound'))
      else output[i].push(bytes)
    }))
    child.on('exit', guarded((code: number | null) => {
      if (code !== 0 && !primary) {exitFailure = new Error('Guides worker failed:'); latch(exitFailure)}
      // A descendant can retain pipes after leader exit; do not wait600s for close.
      finishRequested()
    }))
    child.on('close', guarded((code: number | null, killedBy: NodeJS.Signals | null) => {
      receipt.close = {code, signal: killedBy}; closeDone(); finishRequested()
    }))
    timer = later(() => fail(new Error('Guides worker timeout')), 600_000)
    signal?.addEventListener('abort', abort, {once: true})
    process.on('SIGINT', interrupt); process.on('SIGTERM', terminate)
    if (signal?.aborted) abort()
    await requested
  } catch (error) { latch(error) }
  // One awaited finalizer owns every terminal path. Its errors cannot strand an
  // unobserved promise or bypass listener/timer cleanup.
  try {
    try {
      await bounded(birth)
      if (!receipt.born && receipt.pid !== null) diagnostic('birth', new Error('Child birth was not acknowledged'))
      if (timer) clearTimeout(timer)
      let alive = probe()
      if (alive === true && !primary) latch(new Error('Guides worker left a surviving process group'))
      if (alive === null) latch(new Error('Guides worker group settlement is unknown'))
      if (alive === true) for (const command of ['SIGTERM', 'SIGKILL'] as const) {
        try { process.kill(-receipt.pid!, command); receipt.signals.push({signal: command, at: performance.now()}) }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ESRCH') {alive = false; break}
          diagnostic('signal:' + command, error); alive = null; break
        }
        await grace()
        alive = probe()
        if (alive !== true) break
      }
      receipt.group = alive === false ? 'absent' : 'unknown'
    } catch (error) { diagnostic('settle-group', error); latch(error) }
    try { await bounded(closed) } catch (error) { diagnostic('join-close', error); latch(error) }
    if (!receipt.close) diagnostic('join-close', new Error('Guides worker close was not observed within settlement allowance'))
    if (receipt.group !== 'absent' || !receipt.close) latch(new Error('Guides worker settlement is unknown'))
    try {
      const stderr = Buffer.concat(output[1]).toString('utf8')
      if (exitFailure && primary === exitFailure) exitFailure.message += ` ${stderr.slice(0, 4096)}`
      if (!primary) response = {value: parseStrictJson(Uint8Array.from(Buffer.concat(output[2]))),
        stdout: Buffer.concat(output[0]).toString('utf8'), stderr, settlement: receipt}
    } catch (error) { diagnostic('finalize-output', error); latch(error) }
  } catch (error) { diagnostic('finalize', error); latch(error) }
  finally {
    const cleanup = (operation: string, fn: () => void) => { try {fn()} catch (error) {diagnostic(operation, error); latch(error)} }
    cleanup('remove-abort', () => signal?.removeEventListener('abort', abort))
    cleanup('remove-SIGINT', () => {process.removeListener('SIGINT', interrupt)})
    cleanup('remove-SIGTERM', () => {process.removeListener('SIGTERM', terminate)})
    for (const timer of timers) cleanup('clear-timer', () => clearTimeout(timer))
    terminal = true
  }
  if (primary) throw Object.assign(new Error((primary as Error).message, {cause: primary}), {settlement: receipt})
  return response!
}
