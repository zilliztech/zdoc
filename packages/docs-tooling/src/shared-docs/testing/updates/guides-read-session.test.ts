// @vitest-environment node
import {beforeEach, afterEach, expect, it, vi} from 'vitest'
import {mkdtemp, mkdir, readFile, writeFile, rm, realpath, lstat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {git, write} from '../build/demo'
import {createGuidesReadSession} from '../../adapters/updates/guides-read-session'
import * as oracle from './fixtures/guides-read-oracle'

const observation = vi.hoisted(() => ({git: [] as {repository: string; args: string[]}[], fs: {lstat: 0, realpath: 0, open: 0},
  log: true, counts: {resolve: 0, commit: 0, blob: 0, inventory: 0},
  fake: null as null | {repo: string; parents: Map<string, string[]>; blobs: Map<string, Uint8Array>; inventory: string},
  fastStats: new Map<string, any>(), fastPaths: new Map<string, string>(),
}))
vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  const {promisify} = await import('node:util')
  const run = promisify(actual.execFile)
  const record = (file: string, args: readonly string[]) => {
    if (file === 'git') {
      const i = args.indexOf('-C'), a = args.slice(i + 2)
      if (observation.log) observation.git.push({repository: args[i + 1], args: [...a]})
      if (a[0] === 'rev-parse' && a[2]?.endsWith('^{commit}')) observation.counts.resolve++
      if (a[0] === 'cat-file' && a[1] === 'commit') observation.counts.commit++
      if (a[0] === 'cat-file' && a[1] === 'blob') observation.counts.blob++
      if (a[0] === 'ls-tree') observation.counts.inventory++
    }
  }
  const synthetic = (file: string, args: string[], options: any) => {
    const f = observation.fake, i = args.indexOf('-C'), a = args.slice(i + 2)
    if (file !== 'git' || !f || args[i + 1] !== f.repo) return null
    let bytes: Uint8Array | string | undefined
    if (a[0] === 'rev-parse' && a[1] === '--verify' && a[2]?.endsWith('^{commit}')) {
      const oid = a[2].slice(0, -9); if (!f.parents.has(oid)) throw Error(`missing ${oid}`); bytes = oid + '\n'
    } else if (a[0] === 'cat-file' && a[1] === 'commit') {
      const ps = f.parents.get(a[2]); if (!ps) throw Error(`missing ${a[2]}`)
      bytes = `tree ${'a'.repeat(40)}\n${ps.map(p => `parent ${p}\n`).join('')}\nsynthetic\n`
    } else if (a[0] === 'cat-file' && a[1] === 'blob') {
      bytes = f.blobs.get(a[2]); if (!bytes) throw Error(`missing ${a[2]}`)
    } else if (a[0] === 'ls-tree') bytes = f.inventory
    else if (a[0] === 'rev-parse' && a[2]?.endsWith('^{tree}')) bytes = 'a'.repeat(40) + '\n'
    else if (a[0] === 'cat-file' && a[1] === '-t') bytes = 'tree\n'
    else return null
    return {stdout: options?.encoding === 'buffer' ? Buffer.from(bytes) : Buffer.from(bytes).toString(), stderr: ''}
  }
  const wrapped = (...args: any[]) => {record(args[0], args[1]); return (actual.execFile as any)(...args)}
  Object.defineProperty(wrapped, promisify.custom, {value: async (...args: any[]) => {record(args[0], args[1]); return synthetic(args[0], args[1], args[2]) ?? (run as any)(...args)}})
  return {...actual, execFile: wrapped}
})
vi.mock('node:fs/promises', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {...actual,
    lstat: async (...args: any[]) => {observation.fs.lstat++; if (observation.fastStats.has(args[0])) {const v = observation.fastStats.get(args[0]); if (!v) throw Object.assign(Error('absent'), {code: 'ENOENT'}); return v} return (actual.lstat as any)(...args)},
    realpath: async (...args: any[]) => {observation.fs.realpath++; return observation.fastPaths.get(args[0]) ?? (actual.realpath as any)(...args)},
    open: (...args: any[]) => {observation.fs.open++; return (actual.open as any)(...args)},
  }
})
let root: string
const retain = (bytes: Uint8Array) => {const sha256 = createHash('sha256').update(bytes).digest('hex'); return {path: `blobs/${sha256}`, sha256, bytes: bytes.byteLength}}
const evidence = (name: string, value: unknown) => writeFile(join(tmpdir(), `guides-read-${name}-${process.pid}.json`), JSON.stringify(value, null, 2), {flag: 'wx'})
beforeEach(async () => {root = await realpath(await mkdtemp(join(tmpdir(), 'guides-reads-'))); observation.git.length = 0; observation.counts = {resolve: 0, commit: 0, blob: 0, inventory: 0}})
afterEach(async () => {observation.fake = null; observation.fastStats.clear(); observation.fastPaths.clear(); observation.log = true; await rm(root, {recursive: true, force: true})})
function objectCounts(repository: string) {
  const rows = observation.git.filter(r => r.repository === repository).map(r => r.args)
  return {resolve: rows.filter(a => a[0] === 'rev-parse' && a[1] === '--verify' && a[2]?.endsWith('^{commit}')).length,
    commit: rows.filter(a => a[0] === 'cat-file' && a[1] === 'commit').length,
    blob: rows.filter(a => a[0] === 'cat-file' && a[1] === 'blob').length}
}
async function graph() {
  await git(root, 'init', '-q', '-b', 'main', '--object-format=sha1')
  await write(root, 'site/en/a.md', '---\nid: a.md\ntitle: A\n---\nA\r\n')
  await write(root, 'site/en/raw.bin', new Uint8Array([0, 255, 13, 10, 32]))
  await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'A')
  const A = await git(root, 'rev-parse', 'HEAD'), tree = await git(root, 'rev-parse', 'HEAD^{tree}')
  const node = (name: string, parents: string[]) => git(root, 'commit-tree', tree, ...parents.flatMap(p => ['-p', p]), '-m', name)
  const B = await node('B', [A]), C = await node('C', [B]), D = await node('D', [B]), M = await node('M', [C, D]), H = await node('H', [M])
  const U = await node('U', []), V = await node('V', [U]), Z = await node('Z', [])
  return {A, B, C, D, M, H, U, V, Z}
}
it('reuses successful parent reads without reusing a stop-specific projection', async () => {
  const g = await graph(), session = createGuidesReadSession(retain)
  observation.git.length = 0
  const first = await session.history(root, g.H, [g.B])
  const coldCounts = objectCounts(root), coldGit = [...observation.git]
  observation.git.length = 0
  expect(first).toEqual(await oracle.history(root, g.H, [g.B]))
  const baselineCounts = objectCounts(root), baselineGit = [...observation.git]
  observation.git.length = 0; observation.fs = {lstat: 0, realpath: 0, open: 0}
  expect(await session.history(root, g.H, [g.B])).toEqual(first)
  console.log(JSON.stringify({control: 'warm-real-history', git: objectCounts(root), filesystem: observation.fs}))
  await evidence('warm-counts', {query: [g.H, g.B], baseline: baselineCounts, cold: coldCounts, warm: objectCounts(root), baselineGit, coldGit, warmGit: observation.git, filesystem: observation.fs})
  expect(objectCounts(root)).toEqual({resolve: 0, commit: 0, blob: 0})
  const loaded = new Set(first.map(x => x.oid)), projections: unknown[] = []
  for (const [head, stops] of [[g.H, [g.A]], [g.H, [g.C, g.D]], [g.H, [g.V]], [g.D, [g.A]]] as const) {
    const expected = await oracle.history(root, head, [...stops]), missing = expected.filter(x => !loaded.has(x.oid))
    observation.git.length = 0
    expect(await session.history(root, head, [...stops])).toEqual(expected)
    expect(objectCounts(root)).toEqual({resolve: missing.length, commit: missing.length, blob: 0})
    projections.push({head, stops, expectedNew: missing.map(x => x.oid), actual: objectCounts(root)})
    expected.forEach(x => loaded.add(x.oid))
  }
  await evidence('projections', projections)
  const unreachable = await session.history(root, g.H, [g.V])
  expect(unreachable.some(x => x.oid === g.V)).toBe(true); expect(unreachable.some(x => x.oid === g.U)).toBe(false)
  session.dispose()
}, 30000)
it('reuses exact raw bytes and inventories while isolating caller mutations and new sessions', async () => {
  const g = await graph(), session = createGuidesReadSession(retain), entries = await session.inventory(root, g.A, ['site/en'])
  const expected = await oracle.readCommitted(root, entries, 'site/en/raw.bin')
  const first = await session.readCommitted(root, entries, 'site/en/raw.bin'); expect(first).toEqual(expected); first![0] = 90
  observation.git.length = 0
  expect(await session.readCommitted(root, entries, 'site/en/raw.bin')).toEqual(expected)
  expect(objectCounts(root).blob).toBe(0)
  expect(await session.readCommitted(root, entries, 'missing')).toBeNull()
  entries[0].path = 'mutated'
  expect(await session.inventory(root, g.A, ['site/en'])).toEqual(await oracle.inventory(root, g.A, ['site/en']))
  const fresh = createGuidesReadSession(retain); observation.git.length = 0
  await fresh.history(root, g.H, [g.B]); expect(objectCounts(root).commit).toBeGreaterThan(0)
  session.dispose(); fresh.dispose()
}, 30000)
it('detects in-place linked-worktree commondir retargeting after real cache warmup', async () => {
  const g = await graph(), linked = join(root, 'linked'), other = join(root, 'other')
  await git(root, 'worktree', 'add', '--detach', linked, g.H)
  await mkdir(other); await git(other, 'init', '--bare', '-q', '--object-format=sha1')
  const session = createGuidesReadSession(retain)
  expect(await session.history(linked, g.H, [g.B])).toEqual(await oracle.history(linked, g.H, [g.B]))
  observation.git.length = 0; await session.history(linked, g.H, [g.B]); expect(objectCounts(linked).commit).toBe(0)
  const metadata = await git(linked, 'rev-parse', '--absolute-git-dir'), pointer = join(metadata, 'commondir'), previous = await lstat(pointer)
  // Rewrite in place; all old metadata directories retain their inodes.
  await writeFile(pointer, other + '\n'); expect((await lstat(pointer)).ino).toBe(previous.ino)
  await expect(oracle.history(linked, g.H, [g.B])).rejects.toThrow()
  await expect(session.history(linked, g.H, [g.B])).rejects.toThrow()
  session.dispose()
}, 30000)
it('does not share same-OID success across repositories or cache a missing-object failure', async () => {
  const g = await graph(), other = join(root, 'other'); await mkdir(other); await git(other, 'init', '-q', '-b', 'main')
  const session = createGuidesReadSession(retain)
  const entries = await session.inventory(root, g.A, ['site/en']), entry = entries.find(x => x.path.endsWith('raw.bin'))!
  const expected = await session.readCommitted(root, entries, entry.path)
  await expect(session.readCommitted(other, entries, entry.path)).rejects.toThrow()
  await write(other, 'restored.bin', expected!); expect(await git(other, 'hash-object', '-w', 'restored.bin')).toBe(entry.oid)
  expect(await session.readCommitted(other, entries, entry.path)).toEqual(expected)
  await expect(session.history(root, g.H, ['e'.repeat(40)])).rejects.toThrow()
  await expect(session.history(root, 'HEAD', [g.A])).resolves.toEqual(await oracle.history(root, 'HEAD', [g.A]))
  await git(root, 'tag', '-a', 'alias', '-m', 'tag', g.A); const tag = await git(root, 'rev-parse', 'alias')
  expect(await session.history(root, tag, [tag])).toEqual(await oracle.history(root, tag, [tag]))
  observation.git.length = 0; await session.history(root, tag, [tag]); expect(objectCounts(root).commit).toBe(1)
  session.dispose()
}, 30000)
it('retains complete discovery evidence once and retries failed decoding without inventing absence', async () => {
  const g = await graph(), retained = new Map<string, Buffer>()
  const keep = (b: Uint8Array) => {const ref = retain(b); retained.set(ref.sha256, Buffer.from(b)); return ref}
  const session = createGuidesReadSession(keep)
  observation.git.length = 0
  const first = await session.sourceSnapshot(root, g.A), cold = [...observation.git]
  const before = [...retained]; observation.git.length = 0
  expect(await session.sourceSnapshot(root, g.A)).toEqual(first)
  expect(objectCounts(root)).toEqual({resolve: 0, commit: 0, blob: 0}); expect([...retained]).toEqual(before)
  await evidence('snapshot-counts', {cold, warm: observation.git, retainedHashes: [...retained.keys()]})
  expect(JSON.parse(retained.get(first.discovery.sha256)!.toString())).toEqual([{path: 'site/en/a.md', metadata: {id: 'a.md', title: 'A'}}])
  await write(root, 'site/en/b.md', new Uint8Array([255])); await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'invalid UTF-8')
  const bad = await git(root, 'rev-parse', 'HEAD')
  await expect(session.sourceSnapshot(root, bad)).rejects.toThrow(); expect([...retained.values()].some(b => b.equals(Buffer.from([255])))).toBe(true)
  await expect(session.sourceSnapshot(root, bad)).rejects.toThrow()
  session.dispose()
}, 30000)
const oid = (n: number) => n.toString(16).padStart(40, '0')
async function synthetic(count: number) {
  await graph()
  // Bounded synthetic IO for capacity/50k controls; no mass Git process workload.
  for (const p of [root, join(root, '.git')]) {observation.fastStats.set(p, await lstat(p)); observation.fastPaths.set(p, p)}
  for (const p of [join(root, '.git/commondir'), join(root, '.git/gitdir')]) observation.fastStats.set(p, null)
  const parents = new Map<string, string[]>(); for (let n = 1; n <= count; n++) parents.set(oid(n), n === 1 ? [] : [oid(n - 1)])
  observation.fake = {repo: root, parents, blobs: new Map(), inventory: ''}; observation.log = false
  observation.counts = {resolve: 0, commit: 0, blob: 0, inventory: 0}
  return observation.fake
}
it('keeps the representative 8478-node parent working set but evicts at the reachable byte cap', async () => {
  await synthetic(9000); const session = createGuidesReadSession(retain)
  await session.history(root, oid(8478), [])
  const first = observation.counts.commit; await session.history(root, oid(8478), [])
  expect(first).toBe(8478); expect(observation.counts.commit).toBe(first)
  // 256 map header + (256 map cell + 282 value/size wrapper + 92 tuple key + 256 array +80 parent) per nonroot.
  const charged8478 = 256 + 8477 * 966 + 886
  expect(charged8478).toBeLessThan(8 * 1024 * 1024)
  session.dispose()
  const bounded = createGuidesReadSession(retain); await bounded.history(root, oid(9000), [])
  const warm = observation.counts.commit; await bounded.history(root, oid(9000), [oid(9000)])
  expect(observation.counts.commit - warm).toBe(1)
  const retained = observation.counts.commit; await bounded.history(root, oid(1), [oid(1)]); expect(observation.counts.commit).toBe(retained)
  console.log(JSON.stringify({control: 'synthetic-parent-capacity', charged8478, byteLimit: 8 * 1024 * 1024, redundantEntryCap: 16384, observedEvictedHead: 9000}))
  await evidence('capacity', {charged8478, byteLimit: 8 * 1024 * 1024, entryCap: 16384, observedEvictedHead: 9000, firstWorkingSetReads: first})
  bounded.dispose()
}, 120000)
it('preserves the exact 50000 traversal check and independently adds unreachable stops', async () => {
  const t0 = Date.now()
  const fake = await synthetic(50001); fake.parents.set(oid(60000), [])
  const session = createGuidesReadSession(retain)
  const t1 = Date.now()
  const expected = await oracle.history(root, oid(50000), [oid(60000)])
  const t2 = Date.now()
  expect(expected).toHaveLength(50001)
  const actual = await session.history(root, oid(50000), [oid(60000)])
  const t3 = Date.now()
  expect(actual).toEqual(expected)
  const t4 = Date.now()
  await expect(session.history(root, oid(50001), [])).rejects.toThrow('Source ancestry exceeds local bound')
  const t5 = Date.now()
  await expect(oracle.history(root, oid(50001), [])).rejects.toThrow('Source ancestry exceeds local bound')
  const t6 = Date.now()
  expect(await session.history(root, oid(50001), [oid(50001)])).toEqual(await oracle.history(root, oid(50001), [oid(50001)]))
  const t7 = Date.now()
  console.log(JSON.stringify({stage: '50000-traversal-timing', syntheticMs: t1 - t0, oracleFullMs: t2 - t1, sessionFullMs: t3 - t2, assertMs: t4 - t3, sessionRejectMs: t5 - t4, oracleRejectMs: t6 - t5, finalMs: t7 - t6, totalMs: t7 - t0}))
  session.dispose()
}, 300000)
it('evicts raw bytes by reachable entry and byte bounds and bypasses oversized values', async () => {
  const f = await synthetic(1), session = createGuidesReadSession(retain)
  const entry = (n: number) => [{path: 'raw', mode: '100644', oid: oid(n)}]
  for (let n = 1; n <= 4097; n++) {f.blobs.set(oid(n), new Uint8Array([n % 256])); await session.readCommitted(root, entry(n), 'raw')}
  let before = observation.counts.blob; await session.readCommitted(root, entry(1), 'raw'); expect(observation.counts.blob - before).toBe(1)
  for (let n = 5000; n < 5032; n++) {f.blobs.set(oid(n), new Uint8Array(512 * 1024)); await session.readCommitted(root, entry(n), 'raw')}
  before = observation.counts.blob; await session.readCommitted(root, entry(5000), 'raw'); expect(observation.counts.blob - before).toBe(1)
  f.blobs.set(oid(6000), new Uint8Array(1024 * 1024)); before = observation.counts.blob
  expect(await session.readCommitted(root, entry(6000), 'raw')).toEqual(await session.readCommitted(root, entry(6000), 'raw'))
  expect(observation.counts.blob - before).toBe(2); session.dispose()
}, 120000)
it('evicts snapshot records and yields to pending timers during fully warm traversal', async () => {
  await synthetic(200); const session = createGuidesReadSession(retain)
  for (let n = 1; n <= 129; n++) await session.inventory(root, oid(n), ['site/en'])
  const before = observation.counts.inventory; expect(await session.inventory(root, oid(1), ['site/en'])).toEqual([])
  expect(observation.counts.inventory - before).toBe(1)
  await session.history(root, oid(200), [])
  let fired = false; const timer = setTimeout(() => {fired = true}, 0)
  try {await session.history(root, oid(200), []); expect(fired).toBe(true)} finally {clearTimeout(timer); session.dispose()}
}, 30000)
it('bypasses oversized parents and snapshots, and reaches snapshot byte eviction before its entry cap', async () => {
  const f = await synthetic(100), session = createGuidesReadSession(retain)
  f.parents.set(oid(100), Array(900).fill(oid(1)))
  let before = observation.counts.commit
  expect(await session.history(root, oid(100), [oid(100)])).toEqual(await session.history(root, oid(100), [oid(100)]))
  expect(observation.counts.commit - before).toBe(2)
  f.inventory = Array.from({length: 100}, (_, n) => `100644 blob ${oid(1)}\tsite/en/${'x'.repeat(1000)}${n}\0`).join('')
  for (let n = 1; n <= 40; n++) await session.inventory(root, oid(n), ['site/en'])
  before = observation.counts.inventory; await session.inventory(root, oid(1), ['site/en']); expect(observation.counts.inventory - before).toBe(1)
  f.inventory = Array.from({length: 1000}, (_, n) => `100644 blob ${oid(1)}\tsite/en/${'x'.repeat(1000)}${n}\0`).join('')
  before = observation.counts.inventory
  expect(await session.inventory(root, oid(99), ['site/en'])).toEqual(await session.inventory(root, oid(99), ['site/en']))
  expect(observation.counts.inventory - before).toBe(2); session.dispose()
}, 30000)
it('bounds disabled repository bookkeeping and conservatively leaves excess realms uncached', async () => {
  const g = await graph(), session = createGuidesReadSession(retain)
  for (let n = 0; n < 3; n++) await expect(session.history(join(root, `absent-${n}`), g.A, [])).rejects.toThrow()
  observation.git.length = 0
  await session.history(root, g.A, []); await session.history(root, g.A, [])
  expect(objectCounts(root).commit).toBe(2)
  expect(observation.git.some(r => r.args.includes('--git-dir'))).toBe(false)
  session.dispose()
}, 30000)
it('detects a same-inode top-level Git pointer retarget instead of returning a warm object', async () => {
  const g = await graph(), linked = join(root, 'linked'), other = join(root, 'other')
  await git(root, 'worktree', 'add', '--detach', linked, g.H); await mkdir(other); await git(other, 'init', '--bare', '-q')
  const session = createGuidesReadSession(retain); await session.history(linked, g.H, [g.B])
  const p = join(linked, '.git'), old = await lstat(p)
  await writeFile(p, `gitdir: ${other}\n`); expect((await lstat(p)).ino).toBe(old.ino)
  await expect(session.history(linked, g.H, [g.B])).rejects.toThrow()
  await expect(oracle.history(linked, g.H, [g.B])).rejects.toThrow(); session.dispose()
}, 30000)
it('returns from a real no-writer FIFO pointer race and falls back without outer cancellation', async () => {
  const g = await graph(), linked = join(root, 'linked')
  await git(root, 'worktree', 'add', '--detach', linked, g.H)
  const pointer = join(await git(linked, 'rev-parse', '--absolute-git-dir'), 'commondir')
  const repoRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
  const harnessPath = new URL('../../../../../../scripts/testing/run-vitest-groups.mjs', import.meta.url).href
  const {supervise} = await import(/* @vite-ignore */ harnessPath)
  const actor = join(root, 'fifo-actor.cjs'), swapped = join(root, 'fifo-swapped'), completed = join(root, 'fifo-completed')
  // Patch only the actor's fs boundary. The real open receives the actual no-writer FIFO.
  // Restore the pathname after open returns so original Git fallback never reads a FIFO.
  const script = `const fs=require('node:fs'),fsp=require('node:fs/promises'),cp=require('node:child_process'),{promisify}=require('node:util');
const assert=require('node:assert/strict'),originalOpen=fsp.open,originalExec=cp.execFile,run=promisify(originalExec);
const pointer=${JSON.stringify(pointer)},swapped=${JSON.stringify(swapped)},completed=${JSON.stringify(completed)};
let armed=false,swaps=0,commits=0,openedMs=null,handleWasFifo=false;
const wrapped=(...args)=>originalExec(...args);
Object.defineProperty(wrapped,promisify.custom,{value:async(...args)=>{if(args[0]==='git'&&args[1].includes('cat-file')&&args[1].includes('commit'))commits++;return run(...args)}});cp.execFile=wrapped;
fsp.open=async(...args)=>{
 if(!armed||args[0]!==pointer)return originalOpen(...args);
 armed=false;swaps++;assert.equal(fs.lstatSync(pointer).isFile(),true);const bytes=fs.readFileSync(pointer);
 fs.unlinkSync(pointer);cp.execFileSync('mkfifo',[pointer]);assert.equal(fs.lstatSync(pointer).isFIFO(),true);
 fs.writeFileSync(swapped,JSON.stringify({kind:'fifo',flags:args[1],writers:0}));const start=performance.now();
 const handle=await originalOpen(...args);openedMs=performance.now()-start;
 handleWasFifo=(await handle.stat()).isFIFO();assert.equal(handleWasFifo,true);
 fs.unlinkSync(pointer);fs.writeFileSync(pointer,bytes);return handle;
};
const {loadTypeScript}=require(${JSON.stringify(join(repoRoot, 'scripts/lib/load-typescript.js'))});
const {createGuidesReadSession}=loadTypeScript(${JSON.stringify(join(repoRoot, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-read-session.ts'))});
(async()=>{const session=createGuidesReadSession(()=>{throw Error('unused retain')});
 const query=()=>session.history(${JSON.stringify(linked)},${JSON.stringify(g.H)},[${JSON.stringify(g.B)}]);
 const expected=await query(),cold=commits;await query();assert.equal(commits,cold);
 armed=true;const start=performance.now();assert.deepEqual(await query(),expected);const fallback=commits-cold;
 assert.equal(swaps,1);assert.equal(fallback,cold);assert.ok(openedMs<5000);
 const before=commits;assert.deepEqual(await query(),expected);assert.equal(commits-before,cold);session.dispose();
 fs.writeFileSync(completed,JSON.stringify({swaps,cold,fallback,disabledNext:commits-before,openedMs,elapsedMs:performance.now()-start,handleWasFifo}));
})().catch(error=>{console.error(error);process.exitCode=1});`
  await writeFile(actor, script)
  let expired = false, stopped = false, swapTime: number | null = null
  const deadline = Date.now() + 15000, budget = {check() {}, get expired() {return expired}, register() {}, release() {}}
  const polling = (async () => {while (!stopped && Date.now() < deadline) {
    if (swapTime === null && await readFile(swapped).then(() => true, () => false)) swapTime = Date.now()
    if (swapTime !== null && Date.now() - swapTime >= 5000) {expired = true; return}
    await new Promise(resolve => setTimeout(resolve, 10))
  }})()
  const directory = join(root, 'fifo-receipt')
  const receipt = await supervise({argv: [process.execPath, actor], cwd: repoRoot, env: {...process.env, JITI_CACHE: 'false'}, directory, deadline, budget, graceMs: 1000})
  stopped = true; await polling
  const outcome = await readFile(completed, 'utf8').then(JSON.parse, () => null)
  await evidence('fifo-race', {script, receipt, raw: JSON.parse(await readFile(join(directory, 'receipt.json'), 'utf8')),
    swapped: await readFile(swapped, 'utf8').then(JSON.parse, () => null), outcome, watchdogExpired: expired,
    stdout: await readFile(join(directory, 'stdout'), 'utf8'), stderr: await readFile(join(directory, 'stderr'), 'utf8')})
  expect(receipt.settled).toBe(true); expect(receipt.cleanupErrors).toEqual([]); expect(receipt.receiptPersistence).toBe('confirmed')
  expect(receipt.success).toBe(true); expect(receipt.signals).toEqual([]); expect(expired).toBe(false)
  expect(outcome).toMatchObject({swaps: 1, cold: 5, fallback: 5, disabledNext: 5, handleWasFifo: true})
}, 30000)
it('joins an owned helper actor cancelled during repeated warm traversal without a completed result', async () => {
  const g = await graph(), repoRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
  const harnessPath = new URL('../../../../../../scripts/testing/run-vitest-groups.mjs', import.meta.url).href
  const {supervise} = await import(/* @vite-ignore */ harnessPath)
  const ready = join(root, 'ready'), after = join(root, 'completed'), actor = join(root, 'actor.cjs')
  const script = `const fs=require('node:fs');const {loadTypeScript}=require(${JSON.stringify(join(repoRoot, 'scripts/lib/load-typescript.js'))});
const {createGuidesReadSession}=loadTypeScript(${JSON.stringify(join(repoRoot, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-read-session.ts'))});
(async()=>{const s=createGuidesReadSession(()=>{throw Error('unused retain')});await s.history(${JSON.stringify(root)},${JSON.stringify(g.H)},[${JSON.stringify(g.B)}]);fs.writeFileSync(${JSON.stringify(ready)},'warm');for(let n=0;n<1000000;n++)await s.history(${JSON.stringify(root)},${JSON.stringify(g.H)},[${JSON.stringify(g.B)}]);fs.writeFileSync(${JSON.stringify(after)},'completed');})().catch(e=>{console.error(e);process.exitCode=1});`
  await writeFile(actor, script)
  let cancel = false
  const deadline = Date.now() + 15000, budget = {check() {}, get expired() {return cancel}, register() {}, release() {}}
  const polling = (async () => {while (Date.now() < deadline && !cancel) {if (await readFile(ready, 'utf8').catch(() => '') === 'warm') {cancel = true; return} await new Promise(resolve => setTimeout(resolve, 10))}})()
  const directory = join(root, 'actor-receipt')
  const receipt = await supervise({argv: [process.execPath, actor], cwd: repoRoot, env: {...process.env, JITI_CACHE: 'false'}, directory, deadline, budget, graceMs: 1000})
  cancel = true; await polling
  expect(await readFile(ready, 'utf8')).toBe('warm'); expect(await readFile(after).catch(() => null)).toBeNull()
  expect(receipt.settled).toBe(true); expect(receipt.signal).toBe('SIGTERM'); expect(receipt.cleanupErrors).toEqual([]); expect(receipt.receiptPersistence).toBe('confirmed')
  await evidence('cancel', {script, receipt, raw: JSON.parse(await readFile(join(directory, 'receipt.json'), 'utf8')), stdout: await readFile(join(directory, 'stdout'), 'utf8'), stderr: await readFile(join(directory, 'stderr'), 'utf8')})
}, 30000)
