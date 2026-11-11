import { lstat, realpath } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkedAncestors, readRegularBytes } from '../adapters/updates/evidence'
import { createLocalUpdateRunner, LocalInputError, parseLocalUpdateRequest, type LocalRunResult } from '../adapters/updates/local-runner'
import { captureTrustedToolset, trustedLauncherEnvironment } from '../adapters/updates/toolset'

import { LocalTransactionHold } from '../adapters/updates/transactions'

const trustedRoot = fileURLToPath(new URL('../../../../../', import.meta.url)).replace(/\/$/, '')
export interface LocalCommandOptions { request: string; out: string; plan?: string; unit?: string; resume: boolean }
export function parseLocalCommandOptions(action: 'update-plan' | 'update-prepare', args: readonly string[]): LocalCommandOptions {
  const allowed = new Set(action === 'update-plan' ? ['request', 'out'] : ['request', 'out', 'plan', 'unit', 'resume'])
  const values = new Map<string, string>()
  for (let i = 0; i < args.length; i++) {
    const match = /^--([a-z]+)$/.exec(args[i]), key = match?.[1]
    if (!key || !allowed.has(key) || values.has(key)) throw new LocalInputError(`Invalid or duplicate option: ${args[i]}`)
    if (key === 'resume') { values.set(key, 'true'); continue }
    const value = args[++i]
    if (!value || value.startsWith('--') || /[\x00-\x1f\x7f]/.test(value)) throw new LocalInputError(`Missing or invalid --${key}`)
    values.set(key, value)
  }
  for (const key of allowed) {
    if (key === 'resume') continue
    const value = values.get(key)
    if (!value) throw new LocalInputError(`Missing --${key}`)
    if (key !== 'unit' && (!isAbsolute(value) || resolve(value) !== value || value.length > 4096)) throw new LocalInputError(`--${key} must be an absolute canonical path`)
  }
  return { request: values.get('request')!, out: values.get('out')!, plan: values.get('plan'), unit: values.get('unit'), resume: values.has('resume') }
}

const decoder = new TextDecoder('utf8', {fatal: true})
const oid = (value: string) => /^[a-f0-9]{40}$/.test(value) && !/^0+$/.test(value)
const refName = (value: string) => value.startsWith('refs/') && !/[\x00-\x20\x7f~^:?*\[\\]/.test(value)
  && !value.includes('..') && !value.includes('@{') && !value.endsWith('.')
  && value.split('/').every(part => part !== '' && !part.startsWith('.') && !part.endsWith('.lock'))
async function metadataText(file: string, limit = 4096): Promise<string | null> {
  try { return decoder.decode(await readRegularBytes(file, limit)) }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error }
}
async function metadataDirectory(directory: string): Promise<string> {
  await checkedAncestors(directory)
  if (!(await lstat(directory)).isDirectory() || await realpath(directory) !== directory) throw new Error('Unsafe trusted Git directory')
  return directory
}

/** Read only the executing checkout's files before any Git executable is trusted.
 * Supports SHA-1 files-backend checkouts; unfamiliar metadata fails closed. */
export async function readTrustedCheckoutHead(root: string): Promise<string> {
  await metadataDirectory(root)
  const dot = join(root, '.git'), stat = await lstat(dot)
  let gitDirectory: string
  if (stat.isDirectory()) gitDirectory = await metadataDirectory(dot)
  else {
    const pointer = /^gitdir: ([^\x00-\x1f\x7f]+)\n?$/.exec((await metadataText(dot)) ?? '')
    if (!pointer) throw new Error('Invalid trusted Git directory pointer')
    gitDirectory = await metadataDirectory(resolve(root, pointer[1]))
  }
  const commonText = await metadataText(join(gitDirectory, 'commondir'))
  let common = gitDirectory
  if (commonText !== null) {
    const pointer = /^([^\x00-\x1f\x7f]+)\n?$/.exec(commonText)
    if (!pointer) throw new Error('Invalid trusted common directory pointer')
    common = await metadataDirectory(resolve(gitDirectory, pointer[1]))
  }
  let value = (await metadataText(join(gitDirectory, 'HEAD')))?.replace(/\n$/, '')
  const seen = new Set<string>()
  for (let depth = 0; depth < 8; depth++) {
    if (value && oid(value)) return value
    const match = /^ref: (.+)$/.exec(value ?? ''), ref = match?.[1]
    // Per-worktree pseudorefs and alternate ref backends are not bootstrap inputs.
    if (!ref || !refName(ref) || !ref.startsWith('refs/heads/')) throw new Error('Invalid or unsupported trusted HEAD')
    if (seen.has(ref)) throw new Error('Trusted HEAD symbolic ref cycle')
    seen.add(ref)
    const loose = await metadataText(join(common, ref))
    if (loose !== null) { value = loose.replace(/\n$/, ''); continue }
    const packed = await metadataText(join(common, 'packed-refs'), 8 * 1024 * 1024)
    if (packed === null) throw new Error('Trusted HEAD ref is unavailable')
    const refs = new Map<string, string>()
    let previous = false
    for (const line of packed.split('\n')) {
      if (!line || line.startsWith('# pack-refs with:')) { previous = false; continue }
      if (line.startsWith('^') && previous && oid(line.slice(1))) { previous = false; continue }
      const entry = /^([a-f0-9]{40}) (.+)$/.exec(line)
      if (!entry || !oid(entry[1]) || !refName(entry[2]) || refs.has(entry[2])) throw new Error('Invalid or ambiguous packed refs')
      refs.set(entry[2], entry[1]); previous = true
    }
    const head = refs.get(ref)
    if (!head) throw new Error('Trusted HEAD ref is unavailable')
    return head
  }
  throw new Error('Trusted HEAD symbolic ref depth exceeded')
}

export interface LocalCommandIO { write(message: string): void; error(message: string): void }
export interface LocalCommandDependencies {
  preflight(): Promise<void>
  createRunner(): Promise<Pick<ReturnType<typeof createLocalUpdateRunner>, 'plan' | 'prepare'>>
}
const standardIO: LocalCommandIO = {write: message => { process.stdout.write(message) }, error: message => { process.stderr.write(message) }}
const production: LocalCommandDependencies = {
  async preflight() { await trustedLauncherEnvironment(trustedRoot, process.cwd()) },
  async createRunner() {
    const commit = await readTrustedCheckoutHead(trustedRoot)
    const capture = await captureTrustedToolset({root: trustedRoot, commit})
    if (await readTrustedCheckoutHead(trustedRoot) !== commit) throw new Error('Trusted checkout HEAD changed during capture')
    return createLocalUpdateRunner(capture, {GH_TOKEN: process.env.GH_TOKEN})
  },
}

/** Internal dependencies are for library tests only. The CLI always uses production. */
export async function runLocalCommand(action: 'update-plan' | 'update-prepare', args: readonly string[],
  io: LocalCommandIO = standardIO, dependencies: LocalCommandDependencies = production): Promise<number> {
  try {
    const options = parseLocalCommandOptions(action, args)
    await dependencies.preflight()
    const requestFile = await lstat(options.request)
    if (!requestFile.isFile() || requestFile.nlink !== 1 || requestFile.size > 1024 * 1024 || await realpath(options.request) !== options.request) {
      throw new LocalInputError('INVALID_LOCAL_REQUEST_FILE: expected a bounded, canonical regular file')
    }
    const request = parseLocalUpdateRequest(await readRegularBytes(options.request, 1024 * 1024))
    const runner = await dependencies.createRunner()
    const result = action === 'update-plan' ? await runner.plan(request, options.out)
      : await runner.prepare(request, options.plan!, options.unit!, options.out, {resume: options.resume})
    io.write(`${JSON.stringify(result)}\n`)
    return 0
  } catch (error) {
    if (error instanceof LocalTransactionHold) {
      // No output ownership is assumed here. Only the runner may write evidence.
      const result: LocalRunResult = {kind:'shared-update-local-result', schemaVersion:1, status:'held', unitKey:null,
        disposition:null, planSha256:null, candidate:null, reasons:[error.message], operations:[], validation:null, proof:null}
      io.write(`${JSON.stringify(result)}\n`)
      return 0
    }
    io.error(`${error instanceof Error ? error.message : String(error)}\n`)
    return error instanceof LocalInputError ? 2 : 1
  }
}
export function runUpdatePlan(args: readonly string[], io?: LocalCommandIO, dependencies?: LocalCommandDependencies): Promise<number> {
  return runLocalCommand('update-plan', args, io, dependencies)
}
