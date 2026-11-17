import { execFile } from 'node:child_process'
import { lstat } from 'node:fs/promises'
import { join, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'
import { fetchProducerProfile, fetchProducerProfileV2, fetchTreeLimit, gitBlobOid, parseFetchTree, parseFetchTreeV2, pilotLockPath, validFetchOid, type FetchTreeEntry } from './fetch-producer-profile'

import { guidesRegistryLayout, validateGuidesPage, validateGuidesSource, type AuthenticatedRegistryPage } from './guides-batch-registry'
export type { AuthenticatedRegistryPage } from './guides-batch-registry'
export type BatchProducerMethod = Readonly<{kind: 'fetch-producer-profile-v2'; trustedTools: string; producer: string; profileSha256: string}>
type BatchProfiles = {masterProfile: string; producerProfile: string; ancestor: boolean; registry: readonly AuthenticatedRegistryPage[]}

export type ProducerAuthentication = Readonly<{kind: 'fetch-producer-profile-v1'; trustedTools: string; producer: string; profileSha256: string}>
export type FetchProfileReason = 'FETCH_PROFILE_CONTEXT_UNAVAILABLE' | 'FETCH_PROFILE_MISMATCH' | 'FETCH_PROFILE_ANCESTRY_UNPROVEN'
export type FetchProducerContext = Readonly<{ authenticate(producer: string): Promise<ProducerAuthentication | {reason: FetchProfileReason}>; verify(): Promise<void> }>
const fixedRoot = fileURLToPath(new URL('../../../../../../', import.meta.url))
const contexts = new WeakSet<object>()
export const isFetchProducerContext = (value: unknown): value is FetchProducerContext => typeof value === 'object' && value !== null && contexts.has(value)
const ascii = (bytes: Uint8Array) => { if (bytes.some(byte => byte > 127)) throw new Error('Non-ASCII Git framing'); return Buffer.from(bytes).toString('ascii') }
const unavailable = () => ({reason: 'FETCH_PROFILE_CONTEXT_UNAVAILABLE'} as const)

/** New-path-only raw reader. Each instance owns one authentication's aggregate budget. */
export class FetchGitReader {
  private failed = false
  private reading = false
  private readonly bodies = new Map<string, Buffer>()
  private batchPins?: string
  private batchPromise?: Promise<BatchProfiles>
  private commands = 0
  private output = 0
  private readonly deadline = performance.now() + 60_000
  constructor(private readonly root: string) {}
  async read(args: string[], input?: string, allowNoMergeBase = false, limit = fetchTreeLimit): Promise<Buffer> {
    if (this.reading) { this.failed = true; throw new Error('Overlapping Fetch Git reads') }
    this.reading = true
    try { return await this.readRaw(args, input, allowNoMergeBase, limit) }
    finally { this.reading = false }
  }
  private async readRaw(args: string[], input?: string, allowNoMergeBase = false, limit = fetchTreeLimit): Promise<Buffer> {
    const remaining = Math.floor(this.deadline - performance.now()), capacity = Math.min(limit, fetchTreeLimit, 64 * 1024 * 1024 - this.output)
    if (this.failed || ++this.commands > 16 || remaining <= 0 || capacity <= 0) {this.failed = true; throw new Error('Fetch Git budget exhausted')}
    const env: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, {GIT_NO_LAZY_FETCH: '1', GIT_NO_REPLACE_OBJECTS: '1', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0'})
    const bytes = await new Promise<Buffer>((resolve, reject) => {
      const child = execFile('git', ['--no-replace-objects', '-C', this.root, ...args], {env, encoding: 'buffer', timeout: args[0] === 'rev-parse' ? Math.min(remaining, 30_000) : remaining, maxBuffer: capacity}, (error, stdout) => { if (error && !(allowNoMergeBase && error.code === 1 && stdout.length === 0)) { this.failed = true; reject(error) } else resolve(stdout) })
      child.stdin?.on('error', error => { this.failed = true; reject(error) })
      child.stdin?.end(input)
    })
    this.output += bytes.length
    if (this.failed || this.output > 64 * 1024 * 1024 || performance.now() >= this.deadline) { this.failed = true; throw new Error('Fetch Git budget exhausted') }
    return bytes
  }
  private checkComputationBudget() {
    if (this.failed || performance.now() >= this.deadline) { this.failed = true; throw new Error('Fetch Git budget exhausted') }
  }
  async head() { const head = ascii(await this.read(['rev-parse', '--verify', 'HEAD'], undefined, false, 41)); if (!/^[0-9a-f]{40}\n$/.test(head) || !validFetchOid(head.slice(0, -1))) throw new Error('Invalid fixed head'); return head.slice(0, -1) }
  async historyGuards() {
    const raw = new TextDecoder('utf8', {fatal: true, ignoreBOM: true}).decode(await this.read(['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir']))
    const paths = raw.split('\n')
    if (paths.length !== 3 || paths[2] !== '' || paths.slice(0, 2).some(path => !isAbsolute(path))) throw new Error('Invalid Git metadata')
    for (const directory of new Set(paths.slice(0, 2))) for (const path of ['shallow', 'info/grafts', 'refs/replace']) {
      try { await lstat(join(directory, path)); throw new Error('Unsupported Git history metadata') }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    }
    if ((await this.read(['for-each-ref', '--format=%(refname)', 'refs/replace/'])).length) throw new Error('Unsupported Git replacements')
  }
  async profiles(measured: string, producer: string): Promise<{measured: string; producer: string; ancestor: boolean}> {
    const {lists, sizes} = await this.treeObjects(measured, producer, parseFetchTree)
    const locks = new Map<string, Buffer>()
    for (const list of lists) {
      const oid = list.find(entry => entry.path === pilotLockPath)!.oid
      if (sizes.get(oid)! > 64 * 1024) throw new Error('Oversized pilot lock')
      if (!locks.has(oid)) { const bytes = await this.read(['cat-file', 'blob', oid], undefined, false, Math.max(1, sizes.get(oid)!)); if (bytes.length !== sizes.get(oid)) throw new Error('Pilot lock size mismatch'); locks.set(oid, bytes) }
    }
    const profiles = lists.map(list => {
      const profile = fetchProducerProfile(list, locks.get(list.find(entry => entry.path === pilotLockPath)!.oid)!)
      this.checkComputationBudget()
      return profile
    })
    // merge-base output is independently parsed; disconnected and reverse histories fail closed.
    const bases = ascii(await this.read(['merge-base', '--all', measured, producer], undefined, true))
    return {measured: profiles[0], producer: profiles[1], ancestor: bases === producer + '\n'}
  }
  private async treeObjects(measured: string, producer: string, parser: (bytes: Uint8Array, check?: () => void) => readonly FetchTreeEntry[]) {
    if (!validFetchOid(measured) || !validFetchOid(producer)) throw new Error('Invalid Fetch commit')
    await this.historyGuards()
    // Traverse parents even for F=M, so incomplete local history cannot self-certify.
    const history = ascii(await this.read(['rev-list', '--parents', measured, producer]))
    if (!history.endsWith('\n') || history.split('\n').slice(0, -1).some(line => !/^[0-9a-f]{40}(?: [0-9a-f]{40})*$/.test(line))) throw new Error('Invalid Fetch history')
    const lists: (readonly FetchTreeEntry[])[] = []
    for (const commit of [measured, producer]) {
      const parsed = parser(await this.read(['ls-tree', '-r', '-t', '-z', '--full-tree', commit]), () => this.checkComputationBudget())
      this.checkComputationBudget()
      lists.push(parsed)
    }
    const expected = new Map<string, 'commit' | 'tree' | 'blob'>()
    for (const oid of history.slice(0, -1).split(/[ \n]/)) {
      this.checkComputationBudget()
      if (!validFetchOid(oid)) throw new Error('Invalid Fetch history object')
      expected.set(oid, 'commit')
    }
    if (!expected.has(measured) || !expected.has(producer)) throw new Error('Missing Fetch history endpoints')
    const roots = ascii(await this.read(['rev-parse', `${measured}^{tree}`, `${producer}^{tree}`], undefined, false, 82)).split('\n')
    if (roots.length !== 3 || roots.pop() !== '' || roots.some(oid => !validFetchOid(oid))) throw new Error('Invalid Fetch root trees')
    for (const oid of roots) { if (expected.has(oid) && expected.get(oid) !== 'tree') throw new Error('Conflicting Fetch root object'); expected.set(oid, 'tree') }
    for (const list of lists) for (const entry of list) {
      this.checkComputationBudget()
      if (expected.has(entry.oid) && expected.get(entry.oid) !== entry.type) throw new Error('Conflicting Fetch object types')
      expected.set(entry.oid, entry.type)
    }
    const sizes = await this.checkObjects(expected)
    return {lists, sizes}
  }
  /** A single pinned transaction, including terminal failures. No retry reader. */
  profilesV2(master: string, producer: string): Promise<BatchProfiles> {
    const pins = master + '/' + producer
    if (this.batchPromise) return pins === this.batchPins ? this.batchPromise : Promise.reject(new Error('Fetch batch pins already fixed'))
    this.batchPins = pins
    this.batchPromise = this.batchProfiles(master, producer).catch(error => {this.failed = true; throw error})
    return this.batchPromise
  }
  private async batchProfiles(master: string, producer: string): Promise<BatchProfiles> {
    if (!validFetchOid(master) || !validFetchOid(producer) || await this.head() !== master) throw new Error('Fetch batch pin mismatch')
    const {lists, sizes} = await this.treeObjects(master, producer, parseFetchTreeV2)
    const layout = guidesRegistryLayout(lists[0], () => this.checkComputationBudget()), configWanted = new Map<string, number>()
    for (const entry of [layout.source, ...layout.pages.map(page => page.config)]) configWanted.set(entry.oid, sizes.get(entry.oid)!)
    const config = await this.readBatchBodies(configWanted), decode = (oid: string) => new TextDecoder('utf8', {fatal: true, ignoreBOM: true}).decode(config.get(oid)!)
    validateGuidesSource(decode(layout.source.oid), () => this.checkComputationBudget())
    const destinations = new Set<string>(), registry: AuthenticatedRegistryPage[] = []
    for (const page of layout.pages) {
      this.checkComputationBudget()
      registry.push(validateGuidesPage(page.pageId, decode(page.config.oid), destinations, () => this.checkComputationBudget()))
    }
    const wanted = new Map<string, number>(), byPaths = lists.map(list => new Map(list.map(entry => [entry.path, entry])))
    for (const paths of byPaths) for (const page of registry) {
      const entry = paths.get(page.lockPath)
      if (!entry || entry.mode !== '100644' || entry.type !== 'blob') throw new Error('Missing ordinary Guides lock')
      const size = sizes.get(entry.oid)!
      if (size > 65536) throw new Error('Oversized Guides lock')
      wanted.set(entry.oid, size)
    }
    const locks = await this.readBatchBodies(wanted)
    const profiles = lists.map((list, i) => fetchProducerProfileV2(list,
      new Map(registry.map(page => [page.lockPath, locks.get(byPaths[i].get(page.lockPath)!.oid)!])), () => this.checkComputationBudget()))
    const bases = ascii(await this.read(['merge-base', '--all', master, producer], undefined, true))
    if (await this.head() !== master) throw new Error('Fetch batch pin mismatch')
    this.checkComputationBudget()
    return Object.freeze({masterProfile: profiles[0], producerProfile: profiles[1], ancestor: bases === producer + '\n', registry: Object.freeze(registry)})
  }
  /** Exact ordered Git batch frames, sized from the checked object transaction. */
  async readBatchBodies(wanted: ReadonlyMap<string, number>): Promise<ReadonlyMap<string, Buffer>> {
    try {
      this.checkComputationBudget()
      const missing = new Map<string, number>(), result = new Map<string, Buffer>(), seen = new Set<string>()
      let frameBytes = 0
      for (const [oid, size] of wanted) {
        this.checkComputationBudget()
        if (!validFetchOid(oid) || !Number.isSafeInteger(size) || size < 0 || seen.has(oid)) throw new Error('Invalid Fetch body request')
        seen.add(oid)
        const cached = this.bodies.get(oid)
        if (cached) {
          if (cached.length !== size) throw new Error('Conflicting Fetch body size')
          result.set(oid, Buffer.from(cached)); continue
        }
        frameBytes += Buffer.byteLength(`${oid} blob ${size}\n`) + size + 1
        if (!Number.isSafeInteger(frameBytes) || frameBytes > fetchTreeLimit || frameBytes > 64 * 1024 * 1024 - this.output) throw new Error('Fetch Git body budget exhausted')
        missing.set(oid, size)
      }
      if (!missing.size) return result
      const raw = await this.read(['cat-file', '--batch'], [...missing.keys()].join('\n') + '\n', false, frameBytes)
      if (raw.length !== frameBytes) throw new Error('Invalid Fetch body framing')
      let offset = 0
      for (const [oid, size] of missing) {
        this.checkComputationBudget()
        const header = Buffer.from(`${oid} blob ${size}\n`)
        if (!raw.subarray(offset, offset + header.length).equals(header)) throw new Error('Invalid Fetch body header')
        offset += header.length
        const bytes = raw.subarray(offset, offset + size)
        if (bytes.length !== size || raw[offset + size] !== 10 || gitBlobOid(bytes) !== oid) throw new Error('Invalid Fetch body blob')
        offset += size + 1
        this.bodies.set(oid, Buffer.from(bytes)); result.set(oid, Buffer.from(bytes))
      }
      if (offset !== raw.length) throw new Error('Excess Fetch body frames')
      this.checkComputationBudget()
      return result
    } catch (error) {this.failed = true; throw error}
  }
  async checkObjects(expected: ReadonlyMap<string, 'commit' | 'tree' | 'blob'>) {
    const oids = [...expected.keys()], raw = ascii(await this.read(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], oids.join('\n') + '\n'))
    const lines = raw.split('\n')
    if (lines.pop() !== '' || lines.length !== oids.length) throw new Error('Invalid Fetch batch framing')
    const sizes = new Map<string, number>()
    for (let i = 0; i < oids.length; i++) {
      this.checkComputationBudget()
      const match = /^([0-9a-f]{40}) (commit|tree|blob) (0|[1-9][0-9]*)$/.exec(lines[i])
      if (!match || match[1] !== oids[i] || match[2] !== expected.get(oids[i]) || !Number.isSafeInteger(Number(match[3]))) throw new Error('Unavailable Fetch object')
      sizes.set(oids[i], Number(match[3]))
    }
    return sizes
  }
}

/** The initial/final pin probes are separate ≤30s/41-byte checks. One non-retriable
 * profile transaction starts its own 60s/16-command/64MiB budget inside authenticate.
 * Called only by the measured bootstrap's ordinary callable. Root is source-bound. */
export async function createMeasuredFetchProducerContext(trustedTools: string): Promise<FetchProducerContext> {
  const captured = new FetchGitReader(fixedRoot)
  if (!validFetchOid(trustedTools) || await captured.head() !== trustedTools) throw new Error('Fixed Fetch tools pin mismatch')
  let attempted = false
  const context: FetchProducerContext = Object.freeze({
    async verify() { try { if (await new FetchGitReader(fixedRoot).head() !== trustedTools) throw new Error() } catch { throw new Error('FETCH_PROFILE_CONTEXT_UNAVAILABLE') } },
    async authenticate(producer: string) {
      if (attempted) return unavailable()
      attempted = true
      try {
        const reader = new FetchGitReader(fixedRoot)
        if (await reader.head() !== trustedTools) return unavailable()
        const result = await reader.profiles(trustedTools, producer)
        if (await reader.head() !== trustedTools) return unavailable()
        if (!result.ancestor) return {reason: 'FETCH_PROFILE_ANCESTRY_UNPROVEN'} as const
        if (result.measured !== result.producer) return {reason: 'FETCH_PROFILE_MISMATCH'} as const
        return Object.freeze({kind: 'fetch-producer-profile-v1', trustedTools, producer, profileSha256: result.measured})
      } catch { return unavailable() }
    },
  })
  contexts.add(context)
  return context
}
