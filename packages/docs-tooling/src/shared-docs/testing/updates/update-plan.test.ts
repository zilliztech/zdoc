// @vitest-environment node
import { mkdtemp, realpath, writeFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { git, write } from '../build/demo'
import * as command from '../../commands/update-plan'
import { LocalInputError, type LocalRunResult } from '../../adapters/updates/local-runner'
import * as toolset from '../../adapters/updates/toolset'
import * as evidence from '../../adapters/updates/evidence'
import * as localRunner from '../../adapters/updates/local-runner'
import { LocalTransactionHold } from '../../adapters/updates/transactions'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, {recursive: true, force: true}) })
async function temporary() { const root = await realpath(await mkdtemp(join(tmpdir(), 'update-plan-command-'))); roots.push(root); return root }
async function repository() {
  const root = await temporary()
  await git(root, 'init', '-q', '-b', 'main', '--template=')
  await write(root, 'README.md', 'trusted fixture\n'); await git(root, 'add', '.'); await git(root, 'commit', '-qm', 'initial')
  return root
}
const request = {kind:'shared-update-local-request', schemaVersion:1, repository:'/fixture/repository', devRepository:'/fixture/dev', sourceRepository:'/fixture/source', master:'a'.repeat(40), dev:'b'.repeat(40), sourceTarget:'c'.repeat(40), comparisonConfig:null, subjects:[{kind:'sdk-manual',group:'fixture',manualId:'fixture'}], existing:null, lifecycle:null}
const held: LocalRunResult = {kind:'shared-update-local-result',schemaVersion:1,status:'held',unitKey:null,disposition:null,planSha256:null,candidate:null,reasons:['PROVIDER_NOT_INSTALLED'],operations:[],validation:null,proof:null}

it('reads ordinary loose, packed and detached HEAD using real Git layouts', async () => {
  const root = await repository(), head = await git(root, 'rev-parse', 'HEAD')
  expect(await command.readTrustedCheckoutHead(root)).toBe(head)
  await git(root, 'pack-refs', '--all', '--prune')
  expect(await command.readTrustedCheckoutHead(root)).toBe(head)
  await git(root, 'checkout', '--detach', '-q', head)
  expect(await command.readTrustedCheckoutHead(root)).toBe(head)
})
it('resolves linked-worktree HEAD through its common loose and packed refs', async () => {
  const root = await repository(), linked = join(root, 'linked')
  await git(root, 'worktree', 'add', '-q', '-b', 'linked', linked)
  const head = await git(linked, 'rev-parse', 'HEAD')
  expect(await command.readTrustedCheckoutHead(linked)).toBe(head)
  await git(root, 'pack-refs', '--all', '--prune')
  expect(await command.readTrustedCheckoutHead(linked)).toBe(head)
})
it.each(['ref: ../../escape\n', 'ref: refs/heads/../escape\n', 'ref: refs/heads/.hidden\n', 'ref: refs/heads/main.lock\n', 'a'.repeat(8192), 'not-a-commit\n'])('rejects malformed or escaping HEAD %j', async value => {
  const root = await repository(); await writeFile(join(root, '.git/HEAD'), value)
  await expect(command.readTrustedCheckoutHead(root)).rejects.toThrow()
})
it('rejects symbolic ref loops and symlinked metadata', async () => {
  const root = await repository()
  await writeFile(join(root, '.git/refs/heads/main'), 'ref: refs/heads/loop\n')
  await writeFile(join(root, '.git/refs/heads/loop'), 'ref: refs/heads/main\n')
  await expect(command.readTrustedCheckoutHead(root)).rejects.toThrow(/cycle|depth/iu)
  await rm(join(root, '.git/HEAD')); await symlink('refs/heads/main', join(root, '.git/HEAD'))
  await expect(command.readTrustedCheckoutHead(root)).rejects.toThrow()
})
it('rejects ambiguous packed refs and permits a newer loose ref over an older packed ref', async () => {
  const root = await repository(), old = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'pack-refs', '--all', '--prune')
  await write(root, 'README.md', 'new\n'); await git(root, 'commit', '-qam', 'new')
  expect(await command.readTrustedCheckoutHead(root)).toBe(await git(root, 'rev-parse', 'HEAD'))
  await rm(join(root, '.git/refs/heads/main'))
  await writeFile(join(root, '.git/packed-refs'), `${old} refs/heads/main\n${old} refs/heads/main\n`)
  await expect(command.readTrustedCheckoutHead(root)).rejects.toThrow(/packed/iu)
})
it('does not use a request master when trusted HEAD is unborn or unavailable', async () => {
  const root = await temporary(); await git(root, 'init', '-q', '-b', 'main', '--template=')
  await expect(command.readTrustedCheckoutHead(root)).rejects.toThrow()
})
it('rejects duplicate, unknown, unsafe and missing command arguments', () => {
  for (const args of [[], ['--request','relative','--out','/output'], ['--request','/request','--out','/out/../escape'], ['--request','/request','--out','/out','--resume'], ['--request','/request','--out','/out','--authority','true'], ['--request','/one','--request','/two','--out','/out']]) {
    expect(() => command.parseLocalCommandOptions('update-plan', args)).toThrow(LocalInputError)
  }
})
it('dispatches normalized requests and serializes completed holds with zero operations', async () => {
  const root = await temporary(), file = join(root, 'request.json'), out = join(root, 'out')
  await writeFile(file, JSON.stringify(request))
  let stdout = '', stderr = '', calls = 0
  const code = await command.runUpdatePlan(['--request',file,'--out',out], {write:s=>{stdout+=s},error:s=>{stderr+=s}}, {
    preflight:async()=>{}, createRunner:async()=>({plan:async(value, output)=>{expect(value).toEqual(request);expect(output).toBe(out);calls++;return held},prepare:async()=>{throw new Error('unexpected prepare')}}),
  })
  expect(code).toBe(0); expect(calls).toBe(1); expect(stderr).toBe(''); expect(JSON.parse(stdout)).toEqual(held)
})
it.each([[new LocalInputError('INVALID_OUTPUT'),2],[new Error('acquisition unavailable'),1],[new LocalTransactionHold('PLAN_CHANGED'),0]] as const)('classifies %s without claiming an unowned output', async (failure, expected) => {
  const root = await temporary(), file = join(root, 'request.json'), out = join(root, 'unowned')
  await writeFile(file, JSON.stringify(request)); let stdout = '', stderr = ''
  const code = await command.runUpdatePlan(['--request',file,'--out',out], {write:s=>{stdout+=s},error:s=>{stderr+=s}}, {preflight:async()=>{},createRunner:async()=>{throw failure}})
  expect(code).toBe(expected)
  if (expected === 0) { expect(JSON.parse(stdout)).toMatchObject({status:'held',candidate:null,proof:null,operations:[],reasons:['PLAN_CHANGED']}); expect(stderr).toBe('') }
  else { expect(stdout).toBe(''); expect(stderr).toContain(failure.message) }
  await expect(realpath(out)).rejects.toMatchObject({code:'ENOENT'})
})
it('does not capture tools or open output for malformed request or invalid arguments', async () => {
  const root = await temporary(), file = join(root, 'request.json'); await writeFile(file, '{"schemaVersion":1,"schemaVersion":1}')
  let captures = 0
  const dependencies = {preflight:async()=>{},createRunner:async()=>{captures++;throw new Error('must not capture')}}
  const io = {write:(_s:string)=>{},error:(_s:string)=>{}}
  expect(await command.runUpdatePlan(['--request',file,'--out',join(root,'out')],io,dependencies)).toBe(2)
  expect(await command.runUpdatePlan(['--provider','fixture'],io,dependencies)).toBe(2)
  expect(captures).toBe(0)
})

it('captures independently observed HEAD and rejects a change before constructing the runner', async () => {
  const root = await temporary(), file = join(root, 'request.json')
  await writeFile(file, JSON.stringify(request))
  let captured = false, capturedCommit = '', stdout = '', stderr = ''
  const originalRead = evidence.readRegularBytes
  const preflight = vi.spyOn(toolset, 'trustedLauncherEnvironment').mockResolvedValue({})
  const reads = vi.spyOn(evidence, 'readRegularBytes').mockImplementation(async (path, limit) => {
    if (captured && path.endsWith('/HEAD')) return Buffer.from('d'.repeat(40)+'\n')
    return originalRead(path, limit)
  })
  const capture = vi.spyOn(toolset, 'captureTrustedToolset').mockImplementation(async options => {
    capturedCommit = options.commit
    expect(options.commit).toBe(await git(options.root, 'rev-parse', 'HEAD'))
    expect(options.commit).not.toBe(request.master)
    captured = true
    return {} as Awaited<ReturnType<typeof toolset.captureTrustedToolset>>
  })
  const runner = vi.spyOn(localRunner, 'createLocalUpdateRunner')
  try {
    expect(await command.runUpdatePlan(['--request',file,'--out',join(root,'out')], {write:s=>{stdout+=s},error:s=>{stderr+=s}})).toBe(1)
    expect(capturedCommit).toMatch(/^[a-f0-9]{40}$/); expect(capture).toHaveBeenCalledTimes(1)
    expect(runner).not.toHaveBeenCalled(); expect(stdout).toBe(''); expect(stderr).toContain('HEAD changed')
  } finally { preflight.mockRestore(); reads.mockRestore(); capture.mockRestore(); runner.mockRestore() }
})

it('classifies oversized or symlinked request files as invalid input before tool capture', async () => {
  const root = await temporary(), large = join(root,'large.json'), target = join(root,'target.json'), link = join(root,'link.json')
  await writeFile(large, Buffer.alloc(1024*1024+1,32)); await writeFile(target,JSON.stringify(request)); await symlink(target,link)
  let captures=0, stderr=''
  const dependencies={preflight:async()=>{},createRunner:async()=>{captures++;throw new Error('must not capture')}}
  for (const file of [large,link]) {
    expect(await command.runUpdatePlan(['--request',file,'--out',join(root,'out')],{write:()=>{},error:s=>{stderr+=s}},dependencies)).toBe(2)
  }
  expect(captures).toBe(0);expect(stderr).toContain('INVALID_LOCAL_REQUEST_FILE')
})
