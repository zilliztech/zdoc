// @vitest-environment node
import * as fsPromises from 'node:fs/promises'
import * as childProcess from 'node:child_process'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, symlink, chmod, realpath, unlink, cp, rename, chown, readdir, lstat } from 'node:fs/promises'
import { load as loadYaml } from 'js-yaml'
import { tmpdir, release } from 'node:os'
import { dirname, join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createServer } from 'node:net'
import { execFileSync, execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { toMdx } from '../../adapters/mdx'
import { canonicalBytes } from '../../core/updates/canonical'
import { captureTrustedToolset, compareCandidateToolset, verifyTrustedToolset, serializeClosure, bindClosure, verifyClosureBinding, trustedLauncherEnvironment, authorizeTrustedResolution, prepareTrustedLauncher, captureTrustedNativeFiles, nativeDependencies, parseDarwinAccess, validateDarwinAccess, validateAccessMode, validateLocalIdentity, parseIdentityPlist, assertStableAccessIdentity, retainTrustedAccessEvidence, assertNoExtendedAccess } from '../../adapters/updates/toolset'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
const hostTcb = { kind: 'host-os-tcb', schemaVersion: 1, policy: 'host-os-tcb-v1', platform: process.platform, release: release(), architecture: process.arch, systemLibraries: 'trusted-host-unmeasured' }
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
async function put(root: string, path: string, text: string) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text) }
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'update-toolset-')))
  git(root, 'init', '-q')
  for (const [path, text] of Object.entries({ 'scripts/docs-tooling.js': 'throw new Error("must not execute")', 'scripts/lib/load-typescript.js': 'throw new Error("must not load")', 'packages/compiler/index.js': 'throw new Error("must not compile")', 'apps/docs/package.json': '{"name":"docs","version":"1.0.0","dependencies":{"jiti":"1.0.0"}}', 'package.json': '{"name":"fixture","version":"1.0.0","packageManager":"pnpm@10.33.0"}', 'pnpm-workspace.yaml': 'packages: ["apps/*", "packages/*"]', 'pnpm-lock.yaml': 'lockfileVersion: "9.0"\nimporters:\n  apps/docs:\n    dependencies:\n      jiti: {specifier: 1.0.0, version: 1.0.0}\npackages:\n  jiti@1.0.0:\n    resolution: {integrity: sha512-fixture}\nsnapshots:\n  jiti@1.0.0: {}\n', 'content/en/page.mdx': '# data\n' })) await put(root, path, text)
  await put(root, '.gitignore', 'node_modules/\n'); git(root, 'add', '.'); git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'trusted fixture')
  const commit = git(root, 'rev-parse', 'HEAD')
  await put(root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/package.json', '{"name":"jiti","version":"1.0.0","main":"index.js","config":{"factor":0.5}}')
  await put(root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js', 'throw new Error("dependency must not execute")')
  await mkdir(join(root, 'apps/docs/node_modules')); await symlink('../../../node_modules/.pnpm/jiti@1.0.0/node_modules/jiti', join(root, 'apps/docs/node_modules/jiti'))
  return { root, commit, cwd: root, environment: {}, flags: [] }
}
const commitAll = (root: string) => { git(root, 'add', '.'); git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'candidate'); return git(root, 'rev-parse', 'HEAD') }
async function loaderFixture() {
  const a=await fixture(), installed=await realpath(join(process.cwd(),'apps/docs/node_modules/jiti'))
  const version=JSON.parse(await readFile(join(installed,'package.json'),'utf8')).version
  const lockData=loadYaml(await readFile(join(process.cwd(),'pnpm-lock.yaml'),'utf8')) as any
  await cp(installed,join(a.root,`node_modules/.pnpm/jiti@${version}/node_modules/jiti`),{recursive:true,verbatimSymlinks:true})
  const lock=await readFile(join(a.root,'pnpm-lock.yaml'),'utf8')
  await put(a.root,'pnpm-lock.yaml',lock.replace('jiti: {specifier: 1.0.0, version: 1.0.0}',`jiti: {specifier: ${version}, version: ${version}}`).replace('snapshots:',`  jiti@${version}:\n    resolution: {integrity: ${lockData.packages[`jiti@${version}`].resolution.integrity}}\nsnapshots:`)+`  jiti@${version}: {}\n`)
  await unlink(join(a.root,'apps/docs/node_modules/jiti')); await symlink(`../../../node_modules/.pnpm/jiti@${version}/node_modules/jiti`,join(a.root,'apps/docs/node_modules/jiti'))
  for(const path of ['scripts/lib/load-typescript.js','packages/docs-tooling/src/shared-docs/core/updates/canonical.ts'])await put(a.root,path,await readFile(join(process.cwd(),path),'utf8'))
  return a
}
async function poisonJitiCache(cache: string) {
  const directory=join(cache,'node-jiti'), names=await readdir(directory)
  for(const name of names) {const file=join(directory,name), text=await readFile(file,'utf8'), suffix=/ \/\* v7-[a-f0-9]+ \*\/$/.exec(text)?.[0]; if(!suffix)throw Error('Expected actual jiti cache suffix'); await writeFile(file,'module.exports={marker:"CACHE_POISON",collectGuidesWorker:()=>({marker:"CACHE_POISON"})};'+suffix)}
  return names.length
}

// Exercise the real fixed launcher with a captured test provider, not a product
// transport override. Large bytes stay in pipes/memory, never evidence blobs.
async function transportFixture() {
  const a = await loaderFixture(), pidFile = join(a.root, '.claude', 'transport-worker.pid')
  // This existing allowlisted flag is captured in the fixture's toolset. Keep
  // Node-version loader warnings out of exact stdout/stderr boundary assertions.
  a.flags.push('--no-warnings')
  await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', `
import {writeFileSync, writeSync} from 'node:fs'
export async function collectGuidesWorker(data) {
  writeFileSync(${JSON.stringify(pidFile)}, String(process.pid))
  if (typeof data === 'string') return {receivedLength: data.length}
  const write = (fd, bytes) => {
    const chunk = Buffer.alloc(Math.min(bytes, 1024 * 1024), 120)
    for (let left = bytes; left > 0;) left -= writeSync(fd, chunk, 0, Math.min(left, chunk.length))
  }
  if (data.mode === 'result') return 'x'.repeat(data.bytes - 2)
  if (data.mode === 'direct-result') {
    writeFileSync(3, '"'); write(3, data.bytes - 2); writeFileSync(3, '"'); process.exit(0)
  }
  if (data.mode === 'log') {
    const stream = data.fd === 1 ? process.stdout : process.stderr
    const chunk = Buffer.alloc(1024 * 1024, 120)
    for (let left = data.bytes; left > 0;) {
      const bytes = Math.min(left, chunk.length)
      await new Promise((resolve, reject) => stream.write(chunk.subarray(0, bytes), error => error ? reject(error) : resolve()))
      left -= bytes
    }
    return {logged: data.bytes}
  }
  if (data.mode === 'malformed') {writeFileSync(3, data.text); process.exit(0)}
  if (data.mode === 'throw') throw Error('FIXTURE_COLLECTOR_ERROR')
  if (data.mode === 'exit') process.exit(7)
  return {ok: true}
}
`)
  a.commit = commitAll(a.root)
  const capture = await captureTrustedToolset(a)
  const store = await initializeEvidence({root: join(a.root, '.claude', 'transport'), repositories: [a.root], owner: 'transport'})
  const launcher = await prepareTrustedLauncher(capture, store)
  async function stopped() {
    const pid = Number(await readFile(pidFile, 'utf8'))
    expect(Number.isSafeInteger(pid) && pid > 1).toBe(true)
    const exists = (id: number) => {
      try { process.kill(id, 0); return true } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false; throw error }
    }
    const deadline = performance.now() + 5000
    while (exists(pid) || exists(-pid)) {
      if (performance.now() >= deadline) throw Error(`Fixture worker/group ${pid} did not exit`)
      await new Promise(resolve => setTimeout(resolve, 25))
    }
  }
  async function run(data: unknown) {
    // Remove only this fixture's previous PID marker; a missing new marker must
    // fail the settlement assertion rather than checking a previous invocation.
    await unlink(pidFile).catch(error => { if (error.code !== 'ENOENT') throw error })
    try { return await launcher.runGuidesCollector(data) } finally { await stopped() }
  }
  return {capture, launcher, pidFile, run}
}

describe.skipIf(process.platform === 'linux').sequential('fixed Guides FD3 result capacity', () => {
  const resultLimit = 128 * 1024 * 1024, requestAndLogLimit = 32 * 1024 * 1024
  it('accepts the exact 128 MiB result boundary through the real generated worker and receiver', async () => {
    const {run} = await transportFixture()
    const result = await run({mode: 'result', bytes: resultLimit})
    expect(typeof result.value).toBe('string')
    const text = result.value as string
    expect(text.length + 2).toBe(resultLimit)
    expect(text[0]).toBe('x'); expect(text.at(-1)).toBe('x')
    expect(result.stdout.length).toBe(0); expect(result.stderr.length).toBe(0)
  }, 60000)
  it('rejects one byte over 128 MiB in the producer before FD3 publication', async () => {
    const {run} = await transportFixture()
    await expect(run({mode: 'result', bytes: resultLimit + 1})).rejects.toThrow(/Guides worker failed: Error: Guides worker result exceeds byte bound/)
  }, 60000)
  it('independently rejects one byte over 128 MiB written directly to FD3', async () => {
    const {run} = await transportFixture()
    await expect(run({mode: 'direct-result', bytes: resultLimit + 1})).rejects.toThrow('Guides worker output exceeds byte bound')
  }, 60000)
  it('retains the exact 32 MiB request boundary and rejects one extra byte before starting a worker', async () => {
    const {run, launcher, pidFile} = await transportFixture()
    expect((await run('x'.repeat(requestAndLogLimit - 2))).value).toEqual({receivedLength: requestAndLogLimit - 2})
    await unlink(pidFile)
    await expect(launcher.runGuidesCollector('x'.repeat(requestAndLogLimit - 1))).rejects.toThrow('Guides worker input exceeds byte bound')
    await expect(readFile(pidFile)).rejects.toMatchObject({code: 'ENOENT'})
  }, 60000)
  it.each([['stdout', 1], ['stderr', 2]] as const)('retains the exact 32 MiB %s boundary and rejects one extra byte', async (stream, fd) => {
    const {run} = await transportFixture()
    const result = await run({mode: 'log', fd, bytes: requestAndLogLimit})
    expect(result.value).toEqual({logged: requestAndLogLimit})
    expect(result[stream].length).toBe(requestAndLogLimit)
    await expect(run({mode: 'log', fd, bytes: requestAndLogLimit + 1})).rejects.toThrow('Guides worker output exceeds byte bound')
  }, 60000)
  it.each([['{"a":1,"a":2}', /Duplicate JSON key/], ['{"a":', /Expected JSON value/]] as const)('rejects malformed FD3 JSON %s after worker exit', async (text, error) => {
    const {run} = await transportFixture()
    await expect(run({mode: 'malformed', text})).rejects.toThrow(error)
  }, 30000)
  it.each([['throw', /FIXTURE_COLLECTOR_ERROR/], ['exit', /Guides worker failed/]] as const)('retains collector %s failure and settles the worker group', async (mode, error) => {
    const {run} = await transportFixture()
    await expect(run({mode})).rejects.toThrow(error)
  }, 30000)
  it('binds the generated result policy in the executable closure and refuses a changed limit', async () => {
    const {capture, launcher} = await transportFixture(), path = join(launcher.bin, 'guides-worker.cjs'), bytes = await readFile(path)
    expect(capture.closure.entries.find(entry => entry.path === 'runtime/launch/guides-worker.cjs')).toMatchObject({state: 'file', bytes: bytes.length, sha256: rawSha256(bytes)})
    const changed = bytes.toString().replace('resultLimit=134217728', 'resultLimit=134217729')
    expect(changed).not.toBe(bytes.toString())
    await writeFile(path, changed)
    await expect(launcher.runGuidesCollector({})).rejects.toThrow('Launcher worker changed')
  }, 30000)
})
describe.skipIf(process.platform === 'linux').sequential('empty Vite config directory compatibility', () => {
  const logical = 'runtime/lookup-scopes/repo/.vite-temp'
  const cachePath = (root: string) => join(root, 'node_modules/.vite-temp')
  async function assertWorkerStopped(pid: number) {
    const deadline = performance.now() + 5000
    for (;;) {
      let alive = false
      for (const target of [pid, -pid]) {
        try { process.kill(target, 0); alive = true } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error }
      }
      if (!alive) return
      if (performance.now() >= deadline) throw Error(`Fixture worker/group ${pid} did not exit`)
      await new Promise(resolve => setTimeout(resolve, 25))
    }
  }
  it('accepts the empty directory left by an installed Vite ESM config process through both child APIs', async () => {
    const a = await loaderFixture()
    await put(a.root, 'vite.config.mjs', 'export default {define:{CACHE_CONFIG:"settled"}}')
    await put(a.root, 'scripts/probe.cjs', 'console.log("CACHE_CONFIG_OK")')
    await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', 'export function collectGuidesWorker(){return {marker:"CACHE_CONFIG_OK",pid:process.pid}}')
    a.commit = commitAll(a.root)
    const resolver = createRequire(join(process.cwd(), 'package.json'))
    const viteRoot = dirname(createRequire(resolver.resolve('vitest/package.json')).resolve('vite/package.json'))
    // Run the installed loader normally. Waiting for process exit also waits for
    // its asynchronous unlink; resolving loadConfigFromFile alone is insufficient.
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
      const {loadConfigFromFile}=await import(${JSON.stringify(pathToFileURL(join(viteRoot, 'dist/node/index.js')).href)});
      const result=await loadConfigFromFile({command:'build',mode:'test'},'vite.config.mjs',process.cwd());
      if(result?.config.define.CACHE_CONFIG!=='settled')throw Error('Config was not loaded');
      console.log('VITE_CONFIG_LOADED');
    `], {cwd: a.root, env: {...process.env, JITI_CACHE: 'false'}, encoding: 'utf8', timeout: 15000})
    expect(output).toContain('VITE_CONFIG_LOADED')
    const cache = cachePath(a.root), state = await lstat(cache)
    expect(state.isDirectory() && !state.isSymbolicLink()).toBe(true)
    expect(await realpath(cache)).toBe(cache)
    expect(await readdir(cache)).toEqual([])
    const capture = await captureTrustedToolset(a)
    expect(capture.closure.entries.find(entry => entry.path === logical)).toEqual({path: logical, state: 'directory', mode: '040000'})
    const store = await initializeEvidence({root: join(a.root, '.claude/evidence'), repositories: [a.root], owner: 'vite'})
    const launcher = await prepareTrustedLauncher(capture, store)
    const map = JSON.parse(await readFile(join(launcher.bin, 'resolution-map.json'), 'utf8'))
    expect(map.files[cache]).toBeUndefined()
    expect(map.scopes[join(a.root, 'node_modules')]['.vite-temp']).toBeUndefined()
    expect((await launcher.run('scripts/probe.cjs', [])).stdout).toContain('CACHE_CONFIG_OK')
    const result = (await launcher.runGuidesCollector({})).value as {marker: string; pid: number}
    expect(result.marker).toBe('CACHE_CONFIG_OK')
    await assertWorkerStopped(result.pid)
  }, 60000)
  it('binds distinct absent and empty states and rejects their persistent transitions', async () => {
    const a = await fixture(), absent = await captureTrustedToolset(a), cache = cachePath(a.root)
    expect(absent.closure.entries.find(entry => entry.path === logical)).toEqual({path: logical, state: 'absent'})
    await mkdir(cache)
    await expect(verifyTrustedToolset(absent)).rejects.toThrow(/changed/)
    const present = await captureTrustedToolset(a)
    expect(present.toolsetSha256).not.toBe(absent.toolsetSha256)
    await rename(cache, join(a.root, '.claude-saved-cache'))
    await expect(verifyTrustedToolset(present)).rejects.toThrow()
  }, 30000)
  it.each(['content', 'identity', 'mode'] as const)('rejects persistent cache %s changes before either child API runs', async kind => {
    const a = await loaderFixture(), cache = cachePath(a.root), sentinel = join(a.root, '.claude/SENTINEL')
    await mkdir(cache)
    await put(a.root, 'scripts/probe.cjs', `require('node:fs').writeFileSync(${JSON.stringify(sentinel)},'executed')`)
    await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', `export function collectGuidesWorker(){require('node:fs').writeFileSync(${JSON.stringify(sentinel)},'executed');return {}}`)
    a.commit = commitAll(a.root)
    const capture = await captureTrustedToolset(a), store = await initializeEvidence({root: join(a.root, '.claude/evidence'), repositories: [a.root], owner: 'change'})
    const launcher = await prepareTrustedLauncher(capture, store)
    if (kind === 'content') await writeFile(join(cache, 'unexpected.mjs'), 'throw Error("UNMEASURED")')
    if (kind === 'identity') { await rename(cache, join(a.root, '.claude/saved-cache')); await mkdir(cache) }
    if (kind === 'mode') await chmod(cache, 0o777)
    await expect(launcher.run('scripts/probe.cjs', [])).rejects.toThrow(/empty|identity|access|Unsafe/i)
    await expect(launcher.runGuidesCollector({})).rejects.toThrow(/empty|identity|access|Unsafe/i)
    await expect(lstat(sentinel)).rejects.toMatchObject({code: 'ENOENT'})
  }, 30000)
  it.each(['file', 'symlink', 'case-alias', 'content', 'child-directory', 'child-symlink', 'other-dot', 'package-local'] as const)('refuses unsafe or out-of-scope cache shape %s', async kind => {
    const a = await fixture(), cache = cachePath(a.root)
    if (kind === 'file') await writeFile(cache, '')
    else if (kind === 'symlink') { const target = join(a.root, 'empty-target'); await mkdir(target); await symlink(target, cache) }
    else if (kind === 'case-alias') await mkdir(join(a.root, 'node_modules/.VITE-temp'))
    else if (kind === 'other-dot') await mkdir(join(a.root, 'node_modules/.unexpected-cache'))
    else if (kind === 'package-local') await mkdir(join(a.root, 'apps/docs/node_modules/.vite-temp'))
    else {
      await mkdir(cache)
      if (kind === 'content') await writeFile(join(cache, 'file.mjs'), '')
      if (kind === 'child-directory') await mkdir(join(cache, 'child'))
      if (kind === 'child-symlink') await symlink('missing', join(cache, 'child'))
    }
    await expect(captureTrustedToolset(a)).rejects.toThrow(/empty|unaliased|discovery/i)
  }, 30000)
  it('refuses a socket at the exact cache path', async () => {
    const a = await fixture(), server = createServer()
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(cachePath(a.root), resolve) })
    try { await expect(captureTrustedToolset(a)).rejects.toThrow(/empty|unaliased/) }
    finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
  }, 30000)
  it.skipIf(process.platform !== 'darwin')('applies existing ACL checks to a present empty cache and its reuse', async () => {
    const a = await fixture(), cache = cachePath(a.root)
    await mkdir(cache)
    const capture = await captureTrustedToolset(a)
    execFileSync('/bin/chmod', ['+a', 'everyone allow write', cache])
    await expect(verifyTrustedToolset(capture)).rejects.toThrow(/Unsupported ACL access/)
    await expect(captureTrustedToolset(a)).rejects.toThrow(/Unsupported ACL access/)
  }, 30000)
  it.each(['generic', 'guides'] as const)('refuses late CJS and ESM cache loads through the %s API without executing sentinels', async api => {
    // Trusted fixture code creates each cache file only AFTER launch verification.
    // This tests load refusal, not detection of every unused/transient mutation.
    const a = await loaderFixture(), cache = cachePath(a.root), sentinel = join(a.root, '.claude/SENTINEL')
    await mkdir(cache)
    const source = `
      import {writeFileSync,unlinkSync} from 'node:fs';
      import {createRequire} from 'node:module';
      const require=createRequire(import.meta.url);
      export async function probe(){
        const results=[];
        for(const extension of ['cjs','mjs']){
          const target=${JSON.stringify(cache)}+'/sentinel.'+extension;
          writeFileSync(target,extension==='cjs'
            ? 'require("node:fs").writeFileSync('+${JSON.stringify(JSON.stringify(sentinel))}+',"executed");module.exports={};'
            : 'import {writeFileSync} from "node:fs";writeFileSync('+${JSON.stringify(JSON.stringify(sentinel))}+',"executed");export default {};');
          for(const request of ['../node_modules/.vite-temp/sentinel.'+extension,target,'.vite-temp/sentinel.'+extension]){
            let message='';try{if(extension==='cjs')require(request);else await import(request)}catch(error){message=String(error)}
            results.push({extension,request,message});
          }
          unlinkSync(target);
        }
        return {results,pid:process.pid};
      }
    `
    await put(a.root, 'scripts/cache-probe.mjs', source)
    await put(a.root, 'scripts/native-import.cjs', 'module.exports=file=>import(file)')
    await put(a.root, 'scripts/probe.mjs', `import {probe} from './cache-probe.mjs';console.log(JSON.stringify(await probe()))`)
    await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', `export async function collectGuidesWorker(){const load=require('node:module').createRequire(__filename)(${JSON.stringify(join(a.root, 'scripts/native-import.cjs'))});return (await load(${JSON.stringify(join(a.root, 'scripts/cache-probe.mjs'))})).probe()}`)
    a.commit = commitAll(a.root)
    const capture = await captureTrustedToolset(a), store = await initializeEvidence({root: join(a.root, '.claude/evidence'), repositories: [a.root], owner: 'sentinel'})
    const launcher = await prepareTrustedLauncher(capture, store)
    const result = api === 'generic' ? JSON.parse((await launcher.run('scripts/probe.mjs', [])).stdout) : (await launcher.runGuidesCollector({})).value as any
    expect(result.results).toHaveLength(6)
    for (const outcome of result.results) {
      // Native ESM rejects dot-prefixed bare package names before load hooks.
      // Both relative and absolute imports must reach the unmeasured-file guard.
      const nativeBare = outcome.extension === 'mjs' && outcome.request.startsWith('.vite-temp/')
      expect(outcome.message).toMatch(nativeBare ? /Invalid module.*valid package name/ : /Unmeasured executable target/)
    }
    await expect(lstat(sentinel)).rejects.toMatchObject({code: 'ENOENT'})
    expect(await readdir(cache)).toEqual([])
    if (api === 'guides') await assertWorkerStopped(result.pid)
  }, 60000)
})

describe.skipIf(process.platform === 'linux')('fix1 executable discovery regressions',()=>{
  it('ignores poisoned actual jiti cache on generic child launches',async()=>{
    const a=await loaderFixture(), cache=await realpath(await mkdtemp(join(tmpdir(),'jiti-private-cache-')))
    await put(a.root,'scripts/cache-target.ts','export const marker="SOURCE"')
    await put(a.root,'scripts/cache-probe.cjs',`process.env.TMPDIR=${JSON.stringify(cache)};console.log(JSON.stringify(require('./lib/load-typescript.js').loadTypeScript(__dirname+'/cache-target.ts')))`)
    a.commit=commitAll(a.root);const capture=await captureTrustedToolset(a), store=await initializeEvidence({root:join(a.root,'.claude','evidence'),repositories:[a.root],owner:'cache'}), launcher=await prepareTrustedLauncher(capture,store)
    execFileSync(process.execPath,[join(a.root,'scripts/cache-probe.cjs')],{env:{...process.env,JITI_CACHE:'true'},encoding:'utf8'})
    expect(await poisonJitiCache(cache)).toBeGreaterThan(0)
    const before=git(a.root,'show-ref')+git(a.root,'count-objects','-v'), result=await launcher.run('scripts/cache-probe.cjs',[])
    expect(result.stdout).toContain('SOURCE');expect(result.stdout).not.toContain('CACHE_POISON')
    expect(git(a.root,'show-ref')+git(a.root,'count-objects','-v')).toBe(before)
  },60000)
  it('isolates fixed Guides loader temporaries and ignores a poisoned actual cache',async()=>{
    const a=await loaderFixture();await put(a.root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts','export function collectGuidesWorker(){return {marker:"SOURCE"}}');a.commit=commitAll(a.root)
    const capture=await captureTrustedToolset(a), store=await initializeEvidence({root:join(a.root,'.claude','evidence'),repositories:[a.root],owner:'cache'}), launcher=await prepareTrustedLauncher(capture,store)
    expect(launcher.environment.TMPDIR).toBeTypeOf('string')
    const script=`const load=require(${JSON.stringify(join(a.root,'scripts/lib/load-typescript.js'))}).loadTypeScript;load(${JSON.stringify(join(a.root,'packages/docs-tooling/src/shared-docs/core/updates/canonical.ts'))});load(${JSON.stringify(join(a.root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts'))});`
    execFileSync(process.execPath,['-e',script],{env:{...process.env,TMPDIR:launcher.environment.TMPDIR,JITI_CACHE:'true'},encoding:'utf8'})
    expect(await poisonJitiCache(launcher.environment.TMPDIR!)).toBeGreaterThan(0)
    expect((await launcher.runGuidesCollector({})).value).toEqual({marker:'SOURCE'})
  },60000)
  it('loads measured ESM graphs and declared packages through both guarded child APIs',async()=>{
    const a=await loaderFixture()
    await put(a.root,'apps/docs/scripts/leaf.mjs','export const marker="MEASURED_ESM"')
    const manifest=JSON.parse(await readFile(join(a.root,'package.json'),'utf8'));manifest.imports={'#local':'./apps/docs/scripts/leaf.mjs'};await put(a.root,'package.json',JSON.stringify(manifest))
    await put(a.root,'apps/docs/scripts/entry.mjs',`import jiti from 'jiti';import {marker} from './leaf.mjs';console.log(marker,typeof jiti)`)
    await put(a.root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts',`export async function collectGuidesWorker(){const value=await import('#local');return {marker:value.marker}}`)
    a.commit=commitAll(a.root);const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(a.root,'.claude','evidence'),repositories:[a.root],owner:'esm'}),launcher=await prepareTrustedLauncher(capture,store)
    expect((await launcher.run('apps/docs/scripts/entry.mjs',[])).stdout).toContain('MEASURED_ESM function')
    expect((await launcher.runGuidesCollector({environment:{JITI_CACHE:'true'}})).value).toEqual({marker:'MEASURED_ESM'})
    launcher.environment.JITI_CACHE='true';expect((await launcher.runGuidesCollector({})).value).toEqual({marker:'MEASURED_ESM'})
  },60000)
  it.each([['cjs',false],['mjs',false],['cjs',true],['mjs',true]] as const)('rejects external ancestor fallback in %s (measured alias %s) and Guides',async(extension,measured)=>{
    const a=await loaderFixture(), parent=await realpath(await mkdtemp(join(tmpdir(),'fallback-parent-'))), root=join(parent,'repo')
    await rename(a.root,root);a.root=root;a.cwd=root
    const sentinel=join(parent,'executed')
    const request=measured?'jiti':'outside'
    if(measured){await mkdir(join(parent,'node_modules'),{recursive:true});await symlink(await realpath(join(root,'apps/docs/node_modules/jiti')),join(parent,'node_modules/jiti'))}
    await put(parent,'node_modules/outside/package.json','{"name":"outside","main":"index.js"}')
    await put(parent,'node_modules/outside/index.js',`require('node:fs').writeFileSync(${JSON.stringify(sentinel)},'executed');module.exports={marker:'OUTSIDE'}`)
    await put(root,`scripts/fallback.${extension}`,extension==='cjs'?`console.log(require('${request}'))`:`import value from '${request}';console.log(value)`)
    await put(root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts',`export async function collectGuidesWorker(){return await import('${request}')}`);a.commit=commitAll(root)
    const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(root,'.claude','evidence'),repositories:[root],owner:'fallback'}),launcher=await prepareTrustedLauncher(capture,store)
    await expect(launcher.run(`scripts/fallback.${extension}`,[])).rejects.toThrow(/Unmeasured|scope|fallback/)
    await expect(launcher.runGuidesCollector({})).rejects.toThrow(/Unmeasured|scope|fallback|Cannot find/)
    await expect(readFile(sentinel)).rejects.toThrow()
  },60000)
  it('rejects legacy deep-path fallback even when the external link targets measured package bytes',async()=>{
    const a=await fixture(), parent=await realpath(await mkdtemp(join(tmpdir(),'deep-fallback-'))), root=join(parent,'repo')
    await rename(a.root,root);a.root=root;a.cwd=root
    await put(root,'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js',`module.exports={marker:'MEASURED_ALIAS_EXECUTED'}`)
    await put(root,'apps/docs/scripts/deep.cjs',`console.log(require('jiti/missing.js').marker)`)
    await mkdir(join(parent,'node_modules/jiti'),{recursive:true});await symlink(join(root,'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js'),join(parent,'node_modules/jiti/missing.js'))
    a.commit=commitAll(root);const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(root,'.claude','evidence'),repositories:[root],owner:'deep'}),launcher=await prepareTrustedLauncher(capture,store)
    await expect(launcher.run('apps/docs/scripts/deep.cjs',[])).rejects.toThrow(/scope|fallback|Cannot find/)
  },30000)
  it('rejects nonlocal package-import aliases that fall back to external metadata',async()=>{
    const a=await fixture(), parent=await realpath(await mkdtemp(join(tmpdir(),'imports-fallback-'))),root=join(parent,'repo')
    await rename(a.root,root);a.root=root;a.cwd=root
    const manifest=JSON.parse(await readFile(join(root,'package.json'),'utf8'));manifest.imports={'#escape':'outside'};await put(root,'package.json',JSON.stringify(manifest))
    await put(root,'scripts/target.cjs',`module.exports={marker:'IMPORTS_ALIAS_EXECUTED'}`);await put(root,'scripts/imports.cjs',`console.log(require('#escape').marker)`)
    await put(parent,'node_modules/outside/package.json','{"name":"outside","main":"index.js"}');await symlink(join(root,'scripts/target.cjs'),join(parent,'node_modules/outside/index.js'))
    a.commit=commitAll(root);const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(root,'.claude','evidence'),repositories:[root],owner:'imports'}),launcher=await prepareTrustedLauncher(capture,store)
    await expect(launcher.run('scripts/imports.cjs',[])).rejects.toThrow(/import|fallback|scope/i)
  },30000)
  it('holds an untracked ancestor package config that changes a captured source module format',async()=>{
    const a=await fixture();await put(a.root,'extensions/task/probe.js',`console.log(typeof require)`);a.commit=commitAll(a.root)
    const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(a.root,'.claude','evidence'),repositories:[a.root],owner:'config'}),launcher=await prepareTrustedLauncher(capture,store)
    await put(a.root,'extensions/task/package.json','{"type":"module"}')
    await expect(launcher.run('extensions/task/probe.js',[])).rejects.toThrow(/config|scope|changed/i)
  },30000)
  it('holds an undeclared escaped entry in an otherwise approved workspace scope',async()=>{
    const a=await loaderFixture(), outside=await realpath(await mkdtemp(join(tmpdir(),'scope-escape-')));a.commit=commitAll(a.root)
    const capture=await captureTrustedToolset(a)
    await put(outside,'index.js',`throw Error('UNMEASURED')`);await symlink(outside,join(a.root,'apps/docs/node_modules/unknown'))
    await expect(verifyTrustedToolset(capture)).rejects.toThrow(/escape|discovery|Unmeasured/i)
  },30000)
  it.each(['directory','escaped-link'])('holds post-capture nested %s before generic or Guides code executes',async(kind)=>{
    const a=await loaderFixture(), outside=await realpath(await mkdtemp(join(tmpdir(),'shadow-package-')))
    await put(a.root,'apps/docs/scripts/probe.cjs',`console.log(require('jiti').reviewMarker||'TRUSTED')`)
    await put(a.root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts',`export function collectGuidesWorker(){return {marker:'TRUSTED'}}`);a.commit=commitAll(a.root)
    const capture=await captureTrustedToolset(a),store=await initializeEvidence({root:join(a.root,'.claude','evidence'),repositories:[a.root],owner:'shadow'}),launcher=await prepareTrustedLauncher(capture,store)
    await put(outside,'package.json','{"name":"jiti","main":"index.js"}');await put(outside,'index.js',`console.log('SHADOW_EXECUTED');exports.reviewMarker='SHADOW'`)
    const nested=join(a.root,'apps/docs/scripts/node_modules/jiti');await mkdir(dirname(nested),{recursive:true})
    if(kind==='directory')await cp(outside,nested,{recursive:true});else await symlink(outside,nested)
    const before=git(a.root,'show-ref')+git(a.root,'count-objects','-v')
    await expect(launcher.run('apps/docs/scripts/probe.cjs',[])).rejects.toThrow(/scope|discovery|unmeasured|changed/i)
    await expect(launcher.runGuidesCollector({})).rejects.toThrow(/scope|discovery|unmeasured|changed/i)
    expect(git(a.root,'show-ref')+git(a.root,'count-objects','-v')).toBe(before)
  },60000)
})

describe.skipIf(process.platform === 'linux')('trusted closure capture', () => {
  it('captures actual committed bytes, app-local pnpm files and runtime; survives relocation; detects dependency tamper', async () => {
    const a = await fixture(), b = await fixture()
    const first = await captureTrustedToolset(a), second = await captureTrustedToolset(b)
    expect(first.bytes).toEqual(second.bytes); expect(first.toolsetSha256).toBe(second.toolsetSha256)
    expect(first.closure.entries.some(e => e.path.startsWith('deps/') && e.path.endsWith('/index.js'))).toBe(true)
    expect(first.closure.entries.some(e => e.path === 'runtime/node')).toBe(true)
    expect(Buffer.from(first.bytes).toString('utf8')).not.toMatch(/\/opt\/homebrew|\/Users\/|\/private\/var\//)
    await verifyTrustedToolset(first)
    await put(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js', 'tampered')
    await expect(verifyTrustedToolset(first)).rejects.toThrow(/changed|drift/i)
  }, 30000)
  it('resolves pnpm npm-alias dependencies to their locked package locator', async () => {
    const a = await fixture()
    const lock = await readFile(join(a.root, 'pnpm-lock.yaml'), 'utf8')
    await put(a.root, 'pnpm-lock.yaml', lock.replace('jiti: {specifier: 1.0.0, version: 1.0.0}', 'jiti: {specifier: 1.0.0, version: 1.0.0}\n      alias: {specifier: npm:jiti@1.0.0, version: jiti@1.0.0}'))
    await symlink('../../../node_modules/.pnpm/jiti@1.0.0/node_modules/jiti', join(a.root, 'apps/docs/node_modules/alias'))
    a.commit = commitAll(a.root)
    const capture = await captureTrustedToolset(a)
    expect(capture.closure.resolutions.some(r => r.specifier === 'alias' && r.target.startsWith('deps/'))).toBe(true)
  })
  it('rejects corrupted Git blob objects rather than trusting their named SHA', async () => {
    const a = await fixture(), path = 'scripts/docs-tooling.js', oid = git(a.root, 'rev-parse', `${a.commit}:${path}`)
    const data = Buffer.from('corrupted-but-same-object-name')
    await writeFile(join(a.root, path), data)
    await chmod(join(a.root, '.git/objects', oid.slice(0, 2), oid.slice(2)), 0o600)
    await writeFile(join(a.root, '.git/objects', oid.slice(0, 2), oid.slice(2)), deflateSync(Buffer.concat([Buffer.from(`blob ${data.length}\0`), data])))
    await expect(captureTrustedToolset(a)).rejects.toThrow(/object|hash/i)
  })
  it('keeps capture capabilities private and verifies an exact loader edge before use', async () => {
    const a = await fixture(), value = await captureTrustedToolset(a)
    const edge = value.closure.resolutions.find(r => r.kind === 'loader')!, target = join(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js')
    await authorizeTrustedResolution(value, edge, target)
    await expect(authorizeTrustedResolution({ ...value }, edge, target)).rejects.toThrow(/independently/)
    await expect(authorizeTrustedResolution(value, { ...edge, specifier: 'unknown' }, target)).rejects.toThrow(/Unknown/)
    await put(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js', 'altered')
    await expect(authorizeTrustedResolution(value, edge, target)).rejects.toThrow(/changed/)
  })
  it('runs legacy bare helpers only through an owned PATH with isolated Python', async () => {
    const a = await fixture(), data = await realpath(await mkdtemp(join(tmpdir(), 'candidate-python-')))
    await put(data, 'zipfile.py', 'open("SENTINEL", "w").write("executed")')
    await put(a.root, 'scripts/worker.cjs', `const {execFileSync}=require('node:child_process'); const opts={encoding:'utf8',cwd:process.argv[2]}; console.log(execFileSync('git',['--version'],opts).trim()); console.log(execFileSync('gh',['--version'],opts).split('\\n')[0]); console.log(execFileSync('python3',['-c','import sys,zipfile,tarfile,pathlib,stat,shutil; print(sys.flags.isolated,sys.flags.no_site,sys.dont_write_bytecode)'],opts).trim());`)
    a.commit = commitAll(a.root)
    const capture = await captureTrustedToolset({ ...a, helpers: ['gh', 'python3'] })
    const evidence = await initializeEvidence({ root: join(a.root, '.claude', 'evidence'), repositories: [a.root], owner: 'launcher' })
    const proof = await retainTrustedAccessEvidence(capture, evidence)
    if (process.platform === 'darwin') {
      const access = JSON.parse(await readFile(join(evidence.root, proof.path), 'utf8'))
      const pythonLexical = execFileSync('/usr/bin/xcrun', ['--find', 'python3'], {encoding:'utf8'}).trim()
      const gitLexical = execFileSync('/usr/bin/xcrun', ['--find', 'git'], {encoding:'utf8'}).trim()
      for (const path of [gitLexical, pythonLexical]) expect(access.paths.some((pin: {path: string}) => pin.path === path)).toBe(true)
    }
    await expect((await import('node:fs/promises')).lstat(join(evidence.root,proof.path)).then(st=>st.mode&0o777)).resolves.toBe(0o600)
    const launcher = await prepareTrustedLauncher(capture, evidence)
    const result = await launcher.run('scripts/worker.cjs', [data])
    expect(result.stdout).toContain('git version'); expect(result.stdout).toContain('gh version'); expect(result.stdout).toContain('1 1 True')
    await expect(readFile(join(data, 'SENTINEL'))).rejects.toThrow()
    expect(launcher.environment.PATH).toBe(launcher.bin)
    await expect(launcher.run('../candidate/worker.js', [])).rejects.toThrow()
    await writeFile(join(launcher.bin, 'python3'), 'tampered')
    await expect(launcher.run('scripts/worker.cjs', [data])).rejects.toThrow(/launcher|changed/i)
  }, 90000)
  it('rejects stale root identity even when relocated material has identical bytes', async () => {
    const a = await fixture(), capture = await captureTrustedToolset(a)
    await rename(a.root, a.root + '-original'); await cp(a.root + '-original', a.root, { recursive: true, verbatimSymlinks: true })
    await expect(verifyTrustedToolset(capture)).rejects.toThrow(/identity|root/i)
  })
  it('rejects lexically normalized but physically dangling repository symlinks', async () => {
    const a = await fixture(); await symlink('missing/../docs-tooling.js', join(a.root, 'scripts/dangling.js')); a.commit = commitAll(a.root)
    await expect(captureTrustedToolset(a)).rejects.toThrow()
  })
  it('accepts exact pinned pnpm package-script defaults and discards them', async () => {
    const directory = await realpath(await mkdtemp(join(tmpdir(), 'pnpm-guard-'))), root = process.cwd()
    await writeFile(join(directory, 'package.json'), JSON.stringify({ name: 'pnpm-guard-fixture', packageManager: 'pnpm@10.33.0', scripts: { probe: 'node probe.cjs' } }))
    await writeFile(join(directory, 'probe.cjs'), `const source=${JSON.stringify(root)},root=process.cwd(); const api=require(source+'/scripts/lib/load-typescript.js').loadTypeScript(source+'/packages/docs-tooling/src/shared-docs/adapters/updates/toolset.ts'); (async()=>{const env=await api.trustedLauncherEnvironment(root,root);if(Object.keys(env).some(k=>/^(npm_|pnpm_)/i.test(k)))throw Error('metadata leaked');for(const name of ['npm_config_npm_globalconfig','npm_config_globalconfig','npm_config_registry','npm_config__jsr_registry','PNPM_SCRIPT_SRC_DIR','npm_config_dir','npm_config_prefix','npm_config_node_gyp','npm_config_verify_deps_before_run','pnpm_config_verify_deps_before_run']){let rejected=false;try{await api.trustedLauncherEnvironment(root,root,{...process.env,[name]:'injected-override'})}catch{rejected=true}if(!rejected)throw Error('override accepted: '+name)}console.log('PINNED-PNPM-SCRIPT-GUARD-OK')})().catch(e=>{console.error(e);process.exitCode=1});`)
    // Remove the test runner's inherited manager/loader context. The fresh pnpm *script*
    // injects its full real defaults again, which the production guard must validate.
    const launchEnvironment: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(npm_|pnpm_|NODE_PATH$|NODE_OPTIONS$)/i.test(key)))
    const output = execFileSync('pnpm', ['-C', directory, 'run', 'probe'], { env: launchEnvironment, encoding: 'utf8' })
    expect(output).toContain('PINNED-PNPM-SCRIPT-GUARD-OK')
  })
  it('runs only the fixed Guides TypeScript export with bounded JSON transport', async () => {
    const a = await fixture(), original = await captureTrustedToolset(a)
    const missingStore = await initializeEvidence({ root: join(a.root, '.claude', 'missing-worker'), repositories: [a.root], owner: 'missing' })
    await expect((await prepareTrustedLauncher(original, missingStore)).runGuidesCollector({})).rejects.toThrow(/missing|unavailable/i)
    const installed = await realpath(join(process.cwd(), 'apps/docs/node_modules/jiti'))
    const packageJson = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8')), version = packageJson.version as string
    const installedLock = loadYaml(await readFile(join(process.cwd(), 'pnpm-lock.yaml'), 'utf8')) as any
    const integrity = installedLock.packages[`jiti@${version}`].resolution.integrity
    const destination = join(a.root, `node_modules/.pnpm/jiti@${version}/node_modules/jiti`)
    await cp(installed, destination, { recursive: true, verbatimSymlinks: true })
    // Keep the original unused installed locator measured too; point the declared loader at the real provisioned copy.
    const lock = await readFile(join(a.root, 'pnpm-lock.yaml'), 'utf8')
    await put(a.root, 'pnpm-lock.yaml', lock.replace('jiti: {specifier: 1.0.0, version: 1.0.0}', `jiti: {specifier: ${version}, version: ${version}}`).replace('snapshots:', `  jiti@${version}:\n    resolution: {integrity: ${integrity}}\nsnapshots:`) + `  jiti@${version}: {}\n`)
    await unlink(join(a.root, 'apps/docs/node_modules/jiti')); await symlink(`../../../node_modules/.pnpm/jiti@${version}/node_modules/jiti`, join(a.root, 'apps/docs/node_modules/jiti'))
    for (const path of ['scripts/lib/load-typescript.js', 'packages/docs-tooling/src/shared-docs/core/updates/canonical.ts']) await put(a.root, path, await readFile(join(process.cwd(), path), 'utf8'))
    await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', `import { fstatSync } from 'node:fs'
    export async function collectGuidesWorker(data: unknown, brokered: boolean) {
      if (brokered) return {token: process.env.GH_TOKEN ?? null, githubToken: process.env.GITHUB_TOKEN ?? null,
        descriptors: [4, 5].map(fd => fstatSync(fd).isSocket()), wireContainsSecret: JSON.stringify(data).includes('parent-only-marker')}
      console.log('diagnostic chatter'); return {kind:'fixed-guides-fixture',received:data,preload:process.env.NODE_OPTIONS??null,dependency:'fixed-private-dependency'} }`)
    a.commit = commitAll(a.root)
    const capture = await captureTrustedToolset(a), store = await initializeEvidence({ root: join(a.root, '.claude', 'worker'), repositories: [a.root], owner: 'worker' }), launcher = await prepareTrustedLauncher(capture, store)
    const data = { module: '/untrusted/evil.ts', export: 'evil', dependencies: { injected: true }, environment: { NODE_OPTIONS: '--import=evil' } }
    const result = await launcher.runGuidesCollector(data)
    expect(result.value).toEqual({kind:'fixed-guides-fixture',received:data,preload:null,dependency:'fixed-private-dependency'})
    expect(result.stdout).toContain('diagnostic chatter')
    const selected = {request: {kind:'guides-collection', schemaVersion:1, repositoryRoot:a.root, sourceRepository:a.root,
      devRepository:a.root, master:a.commit, configSnapshot:a.commit, dev:a.commit, trustedTools:a.commit, toolsetSha256:capture.toolsetSha256,
      pages:['fixture'], comparisonConfig:null, target:null, evidenceRun:'123', evidenceZip:null}, archives:null}
    const child = await launcher.runGuidesCollector(selected, {GH_TOKEN:'parent-only-marker'})
    expect(child.value).toEqual({token:null, githubToken:null, descriptors:[true, true], wireContainsSecret:false})
    expect(child.settlement).toMatchObject({born:true, close:{code:0}, group:'absent'})
    await expect(launcher.runGuidesCollector({...selected, request:{...selected.request, trustedTools:'f'.repeat(40)}},
      {GH_TOKEN:'parent-only-marker'})).rejects.toThrow('tool identity mismatch')
    await expect(launcher.runGuidesCollector({ text: 'x'.repeat(32 * 1024 * 1024) })).rejects.toThrow(/bound|large/i)
  }, 30000)
  it.skipIf(process.platform !== 'darwin').each([0, 0o1000])('validates complete group policy with sticky bit %i and rejects changed access before reuse', async sticky => {
    const a = await fixture(), parent = await realpath(await mkdtemp(join(tmpdir(),'access-ancestor-'))), root = join(parent,'repo')
    await rename(a.root,root); a.root=root; a.cwd=root
    await chown(parent,process.geteuid!(),80); await chmod(parent,0o775 | sticky)
    const capture = await captureTrustedToolset(a)
    await chmod(parent,0o777 | sticky)
    await expect(verifyTrustedToolset(capture)).rejects.toThrow(/access identity|Unsafe/)
  },30000)
  it.skipIf(process.platform !== 'darwin')('invalidates a captured handle when task-owned material gains an ACL', async () => {
    const a=await fixture(), capture=await captureTrustedToolset(a)
    execFileSync('/bin/chmod',['+a','everyone allow write',join(a.root,'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js')])
    await expect(verifyTrustedToolset(capture)).rejects.toThrow(/Unsupported ACL access/)
  },30000)
  it('holds group-writable installed executable material', async () => {
    const a = await fixture(); await chmod(join(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js'), 0o664)
    await expect(captureTrustedToolset(a)).rejects.toThrow(/Unsafe|access|writ/i)
  })
  it.skipIf(process.platform !== 'darwin')('holds a write-grant ACL on task-owned installed material', async () => {
    const a = await fixture(), file = join(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js')
    execFileSync('/bin/chmod', ['+a', 'everyone allow write', file])
    await expect(captureTrustedToolset(a)).rejects.toThrow(/Unsupported ACL access/)
  })
  it('binds modes, repository literal links and absent-to-empty config transitions', async () => {
    const a = await fixture(); const baseline = await captureTrustedToolset(a)
    await chmod(join(a.root, 'scripts/docs-tooling.js'), 0o755); a.commit = commitAll(a.root)
    const executable = await captureTrustedToolset(a); expect(executable.toolsetSha256).not.toBe(baseline.toolsetSha256)
    await put(a.root, '.npmrc', ''); a.commit = commitAll(a.root)
    const present = await captureTrustedToolset(a); expect(present.toolsetSha256).not.toBe(executable.toolsetSha256)
    await unlink(join(a.root, '.npmrc')); a.commit = commitAll(a.root)
    expect((await captureTrustedToolset(a)).toolsetSha256).toBe(executable.toolsetSha256)
    await symlink('docs-tooling.js', join(a.root, 'scripts/link.js')); a.commit = commitAll(a.root)
    const link = await captureTrustedToolset(a)
    await unlink(join(a.root, 'scripts/link.js')); await symlink('./docs-tooling.js', join(a.root, 'scripts/link.js')); a.commit = commitAll(a.root)
    expect((await captureTrustedToolset(a)).toolsetSha256).not.toBe(link.toolsetSha256)
  }, 30000)
  it.each(['scripts/docs-tooling.js', 'scripts/lib/load-typescript.js', 'package.json', '.pnpmfile.cjs', 'pnpm-lock.yaml', 'packages/compiler/plugin.js', '.github/actions/evil.js', '.npmrc', '.env', '.gitattributes', 'unknown-loader.cjs'])('holds candidate %s without executing sentinels or changing refs/objects', async path => {
    const a = await fixture(), trusted = await captureTrustedToolset(a), sentinel = join(a.root, 'SENTINEL')
    const payload = `require('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'executed')`
    if (path === '.gitattributes') { git(a.root, 'config', 'merge.sentinel.driver', `node -e ${JSON.stringify(payload)}`); await put(a.root, path, '* merge=sentinel\n') }
    else if (path === 'package.json') await put(a.root, path, JSON.stringify({ name: 'fixture', version: '1.0.0', scripts: { postinstall: `node -e ${JSON.stringify(payload)}` } }))
    else await put(a.root, path, payload)
    const sha = commitAll(a.root), before = git(a.root, 'show-ref') + git(a.root, 'count-objects', '-v')
    await expect(compareCandidateToolset(trusted, { root: a.root, commit: sha, dataPaths: ['content/en/page.mdx'] })).rejects.toThrow(/protected|unreviewed/i)
    await expect(readFile(sentinel)).rejects.toThrow(); expect(git(a.root, 'show-ref') + git(a.root, 'count-objects', '-v')).toBe(before)
  }, 30000)
  it('treats MDX as data and rejects submodule/symlink modes before any invocation', async () => {
    const a = await fixture(), trusted = await captureTrustedToolset(a)
    const markdown = `import fs from 'node:fs'\n\nexport const payload = fs.writeFileSync(${JSON.stringify(join(a.root, 'SENTINEL'))}, 'executed')\n\n{fs.writeFileSync(${JSON.stringify(join(a.root, 'SENTINEL'))}, 'executed')}\n`
    await put(a.root, 'content/en/page.mdx', markdown)
    const lines = markdown.split('\n')
    const compiled = await toMdx({ markdown, components: [], provenance: { inputLines: lines, outputLines: lines.map((_, i) => i + 1) } }, {})
    expect('mdx' in compiled || 'errors' in compiled).toBe(true)
    const candidate = commitAll(a.root)
    await compareCandidateToolset(trusted, { root: a.root, commit: candidate, dataPaths: ['content/en/page.mdx'] })
    await symlink('/tmp', join(a.root, 'packages/escape')); const escaped = commitAll(a.root)
    await expect(compareCandidateToolset(trusted, { root: a.root, commit: escaped, dataPaths: ['content/en/page.mdx'] })).rejects.toThrow()
    git(a.root, 'update-index', '--add', '--cacheinfo', `160000,${a.commit},packages/submodule`)
    const tree = git(a.root, 'write-tree'), submodule = git(a.root, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit-tree', tree, '-p', candidate, '-m', 'submodule')
    await expect(compareCandidateToolset(trusted, { root: a.root, commit: submodule, dataPaths: ['content/en/page.mdx'] })).rejects.toThrow()
    await expect(readFile(join(a.root, 'SENTINEL'))).rejects.toThrow()
  }, 30000)
  it('rejects uncommitted executable material and missing app-local dependency provisioning', async () => {
    const a = await fixture(); await put(a.root, 'packages/compiler/untracked.js', '')
    await expect(captureTrustedToolset(a)).rejects.toThrow(/untracked|uncommitted/i)
    await unlink(join(a.root, 'packages/compiler/untracked.js')); await unlink(join(a.root, 'apps/docs/node_modules/jiti'))
    await expect(captureTrustedToolset(a)).rejects.toThrow()
  })
})
describe('manifest and launcher contract', () => {
  it('rejects unknown/omitted fields, duplicates, out-of-order records and invalid targets', () => {
    const empty = { kind: 'shared-update-executable-closure', schemaVersion: 1, hostTcb, entries: [], packageLocators: [], resolutions: [] }
    expect(Buffer.from(serializeClosure(empty))).toEqual(Buffer.from(canonicalBytes(empty)))
    for (const value of [{ ...empty, extra: true }, { ...empty, schemaVersion: 2 }, { ...empty, entries: [{ path: 'toolset/closure-v1.json', state: 'absent' }] }, { ...empty, entries: [{ path: 'repo/z', state: 'absent' }, { path: 'repo/a', state: 'absent' }] }, { ...empty, entries: [{ path: 'repo/a', state: 'absent' }, { path: 'repo/a', state: 'absent' }] }]) expect(() => serializeClosure(value)).toThrow()
  })
  it.skipIf(process.platform === 'linux')('binds identical closure bytes in material and proof; runtime/ordered flags change the toolset digest', async () => {
    const capture = await captureTrustedToolset(await fixture()), ref = { path: 'blobs/closure', sha256: rawSha256(capture.bytes), bytes: capture.bytes.length }
    verifyClosureBinding(capture.material, ref, capture.bytes, capture.toolsetSha256)
    expect(() => verifyClosureBinding(capture.material, { ...ref, sha256: 'a'.repeat(64) }, capture.bytes, capture.toolsetSha256)).toThrow()
    const changed = bindClosure(capture.closure, { ...capture.material, runtime: { ...capture.material.runtime, version: 'different' } })
    expect(changed.toolsetSha256).not.toBe(capture.toolsetSha256)
    expect(bindClosure(capture.closure, { ...capture.material, flags: ['--no-warnings', '--enable-source-maps'] }).toolsetSha256).not.toBe(bindClosure(capture.closure, { ...capture.material, flags: ['--enable-source-maps', '--no-warnings'] }).toolsetSha256)
  })
  it.skipIf(process.platform === 'linux')('requires strict host TCB binding and captures actual Git resolution and non-system libraries', async () => {
    const value = await captureTrustedToolset(await fixture())
    expect(value.closure.hostTcb).toEqual(hostTcb)
    const changed = bindClosure({ ...value.closure, hostTcb: { ...hostTcb, release: 'another-release' } }, value.material)
    expect(changed.toolsetSha256).not.toBe(value.toolsetSha256)
    for (const invalid of [undefined, { ...hostTcb, policy: 'caller-trust' }, { ...hostTcb, extra: 'injected' }]) expect(() => serializeClosure({ ...value.closure, hostTcb: invalid })).toThrow()
    expect(() => bindClosure({ ...value.closure, hostTcb: { ...hostTcb, architecture: 'other' } }, value.material)).toThrow()
    if (process.platform === 'darwin') {
      expect(value.closure.entries.some(e => e.path === 'runtime/git-shim')).toBe(true)
      expect(value.closure.resolutions.some(r => r.from === 'runtime/git-resolver' && r.target === 'runtime/git')).toBe(true)
      expect(value.closure.entries.some(e => e.path.includes('libnode'))).toBe(true)
    }
  }, 30000)

  it.skipIf(process.platform !== 'darwin')('binds actual native-library target bytes and holds missing or unknown dependencies', async () => {
    const a = await fixture()
    const macho = (dependencies: string[]) => {
      const commands = dependencies.map(name => { const text = Buffer.from(name + '\0'); const size = Math.ceil((24 + text.length) / 8) * 8; const b = Buffer.alloc(size); b.writeUInt32LE(12, 0); b.writeUInt32LE(size, 4); b.writeUInt32LE(24, 8); text.copy(b, 24); return b })
      const header = Buffer.alloc(32); header.writeUInt32LE(0xfeedfacf, 0); header.writeUInt32LE(process.arch === 'arm64' ? 0x100000c : 0x1000007, 4); header.writeUInt32LE(commands.length, 16); header.writeUInt32LE(commands.reduce((n, b) => n + b.length, 0), 20); return Buffer.concat([header, ...commands])
    }
    const library = join(a.root, 'library.dylib'), entry = join(a.root, 'native.node')
    await writeFile(library, macho([])); await writeFile(entry, macho(['@loader_path/library.dylib']))
    const one = await captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])
    await writeFile(library, Buffer.concat([macho([]), Buffer.from('changed')]))
    const two = await captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])
    expect(canonicalBytes(one.entries)).not.toEqual(canonicalBytes(two.entries))
    await unlink(library); await expect(captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])).rejects.toThrow(/Missing/)
    await writeFile(entry, macho(['/usr/lib/not-a-system-library.dylib'])); await expect(captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])).rejects.toThrow(/Missing/)
    await writeFile(entry, macho(['unresolved.dylib'])); await expect(captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])).rejects.toThrow(/Unknown/)
    expect(() => nativeDependencies(Buffer.from('cffaedfe', 'hex'))).toThrow()
  })
  it.skipIf(process.platform !== 'darwin')('follows a writable earlier @rpath symlink target and rejects a dangling one', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'rpath-symlink-')))
    const writable = join(root, 'writable'), safe = join(root, 'safe')
    await mkdir(writable); await mkdir(safe); await chmod(writable, 0o777)
    const lcLoad = (name: string) => { const text = Buffer.from(name + '\0'); const size = Math.ceil((24 + text.length) / 8) * 8; const b = Buffer.alloc(size); b.writeUInt32LE(0xc, 0); b.writeUInt32LE(size, 4); b.writeUInt32LE(24, 8); text.copy(b, 24); return b }
    const lcRpath = (path: string) => { const text = Buffer.from(path + '\0'); const size = Math.ceil((12 + text.length) / 8) * 8; const b = Buffer.alloc(size); b.writeUInt32LE(0x8000001c, 0); b.writeUInt32LE(size, 4); b.writeUInt32LE(12, 8); text.copy(b, 12); return b }
    const macho = (deps: string[], rpaths: string[]) => { const commands = [...rpaths.map(lcRpath), ...deps.map(lcLoad)]; const header = Buffer.alloc(32); header.writeUInt32LE(0xfeedfacf, 0); header.writeUInt32LE(process.arch === 'arm64' ? 0x100000c : 0x1000007, 4); header.writeUInt32LE(commands.length, 16); header.writeUInt32LE(commands.reduce((n, b) => n + b.length, 0), 20); return Buffer.concat([header, ...commands]) }
    await writeFile(join(safe, 'libfoo.dylib'), macho([], []))
    // Earlier rpath is a symlink to a writable dir with no lib there; the measured
    // library lives in the later rpath. The writable target directory itself must be
    // bound (not just the symlink), so access inspection can reject it.
    await symlink(writable, join(root, 'early'))
    const entry = join(root, 'entry'); await writeFile(entry, macho(['@rpath/libfoo.dylib'], [join(root, 'early'), safe]))
    const result = await captureTrustedNativeFiles([{ name: 'runtime/test-rpath', path: entry }])
    // The lexical link path is bound so inspection walks both it (the holding dir)
    // and its realpath target (the writable dir).
    expect(result.accessPaths.has(join(root, 'early'))).toBe(true)
    // A dangling symlink (target absent) cannot be authenticated and is rejected.
    await symlink(join(root, 'missing'), join(root, 'dangling'))
    await writeFile(join(root, 'entry2'), macho(['@rpath/libfoo.dylib'], [join(root, 'dangling'), safe]))
    await expect(captureTrustedNativeFiles([{ name: 'runtime/test-dangling', path: join(root, 'entry2') }])).rejects.toThrow(/Dangling symbolic link/)
    // A candidate file that is itself a dangling symlink is also rejected.
    await mkdir(join(root, 'filelink'))
    await symlink(join(root, 'missing'), join(root, 'filelink', 'libfoo.dylib'))
    await writeFile(join(root, 'entry3'), macho(['@rpath/libfoo.dylib'], [join(root, 'filelink'), safe]))
    await expect(captureTrustedNativeFiles([{ name: 'runtime/test-filelink', path: join(root, 'entry3') }])).rejects.toThrow(/Dangling symbolic link/)
    // A symlink inside a writable dir (pointing at a safe dir) binds the lexical
    // link path so the holding writable dir is inspected, not only the target.
    await mkdir(join(root, 'alias-target'))
    await symlink(join(root, 'alias-target'), join(writable, 'alias'))
    await writeFile(join(root, 'entry4'), macho(['@rpath/libfoo.dylib'], [join(writable, 'alias'), safe]))
    const aliasResult = await captureTrustedNativeFiles([{ name: 'runtime/test-alias', path: join(root, 'entry4') }])
    expect(aliasResult.accessPaths.has(join(writable, 'alias'))).toBe(true)
    // A multi-level chain (start safe, middle writable, end safe) must bind the
    // intermediate hop so its writable ancestor is inspected, not just the endpoints.
    await mkdir(join(root, 'chain-start')); await mkdir(join(root, 'chain-mid')); await mkdir(join(root, 'chain-end'))
    await chmod(join(root, 'chain-mid'), 0o777)
    await symlink(join(root, 'chain-end'), join(root, 'chain-mid', 'middle'))
    await symlink(join(root, 'chain-mid', 'middle'), join(root, 'chain-start', 'chain'))
    await writeFile(join(root, 'entry5'), macho(['@rpath/libfoo.dylib'], [join(root, 'chain-start', 'chain'), safe]))
    const chainResult = await captureTrustedNativeFiles([{ name: 'runtime/test-chain', path: join(root, 'entry5') }])
    expect(chainResult.accessPaths.has(join(root, 'chain-mid', 'middle'))).toBe(true)
    // A symlink in the MIDDLE of a multi-component rpath (not the final component)
    // is followed so its writable target directory is bound.
    await mkdir(join(root, 'writable-mid', 'sub'), { recursive: true })
    await chmod(join(root, 'writable-mid'), 0o777)
    await symlink(join(root, 'writable-mid'), join(root, 'alias'))
    await writeFile(join(root, 'entry6'), macho(['@rpath/libfoo.dylib'], [join(root, 'alias', 'sub'), safe]))
    const midResult = await captureTrustedNativeFiles([{ name: 'runtime/test-mid', path: join(root, 'entry6') }])
    expect(midResult.accessPaths.has(join(root, 'writable-mid', 'sub'))).toBe(true)
    // A relative child-link target containing '..' resolves against the resolved
    // parent directory (not the lexical link location).
    await mkdir(join(root, 'real', 'deep'), { recursive: true })
    await mkdir(join(root, 'real', 'writable'))
    await chmod(join(root, 'real', 'writable'), 0o777)
    await symlink(join(root, 'real', 'deep'), join(root, 'dotdot-parent'))
    await symlink('../writable', join(root, 'real', 'deep', 'child'))
    await writeFile(join(root, 'entry7'), macho(['@rpath/libfoo.dylib'], [join(root, 'dotdot-parent', 'child'), safe]))
    const dotdotResult = await captureTrustedNativeFiles([{ name: 'runtime/test-dotdot', path: join(root, 'entry7') }])
    expect(dotdotResult.accessPaths.has(join(root, 'real', 'writable'))).toBe(true)
    // A link target that traverses a writable dir and then leaves it via '..'
    // must still record that traversed dir (it can be swapped mid-resolution).
    await mkdir(join(root, 'writable-dotdot', 'sub'), { recursive: true })
    await chmod(join(root, 'writable-dotdot'), 0o777)
    await mkdir(join(root, 'safe-end'))
    await symlink('writable-dotdot/sub/../../safe-end', join(root, 'leave-link'))
    await writeFile(join(root, 'entry8'), macho(['@rpath/libfoo.dylib'], [join(root, 'leave-link'), safe]))
    const leaveResult = await captureTrustedNativeFiles([{ name: 'runtime/test-leave', path: join(root, 'entry8') }])
    expect(leaveResult.accessPaths.has(join(root, 'writable-dotdot'))).toBe(true)
  })
  it('bypasses trusted dotenv and rejects ambient Node/package/loader settings and wrong cwd', async () => {
    const a = await fixture(); await put(a.root, '.env', 'SECRET=should-not-load')
    expect((await trustedLauncherEnvironment(a.root, a.root, { SECRET: 'ambient' }, [])).SECRET).toBeUndefined()
    for (const name of ['NODE_OPTIONS', 'NODE_PATH', 'LD_PRELOAD', 'DYLD_INSERT_LIBRARIES', 'npm_config_userconfig', 'DEVELOPER_DIR', 'SDKROOT', 'GIT_EXEC_PATH', 'PYTHONPATH', 'PYTHONHOME']) await expect(trustedLauncherEnvironment(a.root, a.root, { [name]: 'bad' }, [])).rejects.toThrow()
    await expect(trustedLauncherEnvironment(a.root, dirname(a.root), {}, [])).rejects.toThrow()
    await expect(trustedLauncherEnvironment(a.root, a.root, {}, ['--import=evil'])).rejects.toThrow()
  })
})

describe('strict access inspector evidence', () => {
  it('permits only the exact home ancestor restriction and rejects application ACLs', () => {
    const header = 'drwxr-x---+ 1 user staff 1 Nov 3 00:00 /home/user\n'
    const restriction = header + ' 0: group:everyone deny delete\n'
    expect(validateDarwinAccess(restriction, ['/home/user'], '/home/user', new Set())).toEqual({path:'/home/user',ace:'group:everyone deny delete'})
    for (const output of [header + ' 0: group:everyone allow write\n', header + ' 0: unknown syntax\n', restriction + ' 1: group:everyone deny write\n']) expect(() => validateDarwinAccess(output, ['/home/user'], '/home/user', new Set())).toThrow(/ACL/)
    expect(() => validateDarwinAccess(restriction, ['/home/user'], '/other/home', new Set())).toThrow(/ACL/)
    expect(() => validateDarwinAccess(restriction, ['/home/user'], '/home/user', new Set(['/home/user']))).toThrow(/ACL/)
  })
  it('rejects world-write and unauthenticated group-write irrespective of sticky mode', () => {
    for (const uid of [0, process.getuid!()]) for (const mode of [0o777, 0o1777, 0o775, 0o1775]) for (const material of [false, true]) expect(() => validateAccessMode({uid,mode}, 'directory', material)).toThrow(/mode/)
    expect(() => validateAccessMode({uid:0,mode:0o1755}, 'directory', false)).not.toThrow()
    expect(() => validateAccessMode({uid:4294967294,mode:0o755}, 'directory', false)).toThrow(/owner/)
    expect(() => validateAccessMode({uid:0,mode:0o4755}, 'file', true)).toThrow(/mode/)
  })
  it('parses only complete exact headers and ordered ACL evidence', () => {
    expect(parseDarwinAccess('drwxr-x---+ 1 user staff 1 Nov 3 00:00 /home/user\n 0: group:everyone deny delete\n', ['/home/user']).get('/home/user')).toEqual(['group:everyone deny delete'])
    expect(parseDarwinAccess('lrwxr-xr-x 1 user staff 1 Nov 3 00:00 /owned/git -> /system/git\n', ['/owned/git']).get('/owned/git')).toEqual([])
    expect(() => parseDarwinAccess('', ['/expected'])).toThrow(/Missing/)
    expect(() => parseDarwinAccess('drwxr-x---+ 1 user staff 1 Nov 3 00:00 /home/user\n', ['/home/user'])).toThrow(/Missing/)
    expect(() => parseDarwinAccess('unknown ACL syntax', ['/expected'])).toThrow(/Unknown/)
    expect(() => parseDarwinAccess('drwxr-x---+ 1 user staff 1 Nov 3 00:00 /home/user\n 1: group:everyone deny delete\n', ['/home/user'])).toThrow(/syntax/)
  })
})

describe('trusted local identity policy', () => {
  it('rejects truncated, ambiguous or executable identity plist input', () => {
    const prefix = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">'
    expect(parseIdentityPlist(prefix+'<array><string>root</string></array></plist>')).toEqual(['root'])
    for (const suffix of ['<array>', '<dict><key>a</key><array/><key>a</key><array/></dict></plist>', '<array><string>&external;</string></array></plist>']) expect(()=>parseIdentityPlist(prefix+suffix)).toThrow()
  })
  const snapshot = () => ({ profile: { SearchPolicy:['dsAttrTypeStandard:NSPSearchPath'], CSPSearchPath:['/Local/Default'], NSPSearchPath:['/Local/Default'], LSPSearchPath:['/Local/Default'] }, users:[{names:['root'],uid:0,gid:0,guid:'ROOT'},{names:['current'],uid:501,gid:20,guid:'CURRENT'}], groups:[{names:['writers'],gid:80,members:['root','current'],guids:['ROOT','CURRENT'],nested:[]}], userIndex:{root:0,current:501},groupIndex:{writers:80},credentials:{uid:501,euid:501,gid:20,egid:20,groups:[20,80]} })
  it('supports only independently complete local records for root/current principals', () => {
    expect(validateLocalIdentity(snapshot(), [80]).get(80)).toEqual([0,501])
    expect(()=>assertNoExtendedAccess('/fixture/node cap_dac_override=ep','')).toThrow(/capability/)
    expect(()=>assertNoExtendedAccess('','inspector failed')).toThrow(/access/)
    const changed=snapshot(); changed.groups[0].members=['root']; changed.groups[0].guids=['ROOT']; changed.credentials.groups=[20]
    expect(validateLocalIdentity(changed,[80]).get(80)).toEqual([0]); expect(()=>assertStableAccessIdentity(snapshot(),changed)).toThrow(/changed/)
    const relocated = snapshot(); relocated.users[1].uid=502; relocated.userIndex.current=502; relocated.credentials.uid=502; relocated.credentials.euid=502
    expect(validateLocalIdentity(relocated,[80]).get(80)).toEqual([0,502])
  })
  it('holds extra explicit/primary/duplicate-GID writers and inconsistent representations', () => {
    for (const variant of ['explicit','primary','duplicate','mismatch','nested','network','missing','index','credentials']) {
      const input = snapshot()
      if (['explicit','primary','duplicate'].includes(variant)) { input.users.push({names:['extra'],uid:900,gid:variant==='primary'?80:20,guid:'EXTRA'}); Object.assign(input.userIndex,{extra:900}) }
      if (variant==='explicit') { input.groups[0].members.push('extra'); input.groups[0].guids.push('EXTRA') }
      if (variant==='duplicate') { input.groups.push({names:['alias'],gid:80,members:['extra'],guids:['EXTRA'],nested:[]}); Object.assign(input.groupIndex,{alias:80}) }
      if (variant==='mismatch') input.groups[0].guids=['ROOT']
      if (variant==='nested') input.groups[0].nested=['OTHER-GROUP']
      if (variant==='network') input.profile.NSPSearchPath.push('/LDAPv3/network')
      if (variant==='missing') input.groups=[]
      if (variant==='index') input.userIndex.current=999
      if (variant==='credentials') input.credentials.uid=0
      expect(() => validateLocalIdentity(input,[80]),variant).toThrow()
    }
  })
})

// Keep process fault dispatch private to tests; ordinary calls use real spawn.
vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  const mockedExecFile = vi.fn(actual.execFile)
  const {promisify} = await import('node:util')
  Object.defineProperty(mockedExecFile, promisify.custom, {value: (...args: unknown[]) => new Promise((resolve, reject) => {
    (mockedExecFile as Function)(...args, (error: Error | null, stdout: unknown, stderr: unknown) => error ? reject(error) : resolve({stdout,stderr}))
  })})
  return {...actual, execFile: mockedExecFile, spawn: vi.fn(actual.spawn)}
})
async function ownerFixture() {
  const a = await loaderFixture(), marker = join(a.root, '.claude/owned-worker.json')
  a.flags.push('--no-warnings')
  await put(a.root, 'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts', `
    import {writeFileSync} from 'node:fs';import {spawn} from 'node:child_process';
    export async function collectGuidesWorker(data){
      let descendant=null;
      if(data.mode==='leftover'||data.mode==='ignore'){
        const code=(data.mode==='ignore'?'process.on("SIGTERM",()=>{});':'')+'process.stdout.write("DESCENDANT_READY");setInterval(()=>{},1000)';
        const child=spawn(process.execPath,['-e',code],{stdio:['ignore','pipe','inherit']});
        await new Promise(resolve=>child.stdout.once('data',resolve));
        child.stdout.pipe(process.stdout);child.unref();child.stdout.unref();descendant=child.pid;
      }
      writeFileSync(${JSON.stringify(marker)},JSON.stringify({pid:process.pid,descendant}));
      if(data.mode==='ignore')process.on('SIGTERM',()=>{});
      if(data.mode==='signal')process.kill(process.ppid,data.signal);
      if(['wait','ignore','signal'].includes(data.mode)){setInterval(()=>{},1000);await new Promise(()=>{});}
      if(data.mode==='nonzero'){process.stderr.write('FINAL_STDERR_DIAGNOSTIC',()=>process.exit(7));await new Promise(()=>{});}
      if(data.mode==='assembly')process.stdout.write('ASSEMBLY_FAULT');
      return {ok:true,pid:process.pid,descendant};
    }
  `)
  a.commit = commitAll(a.root)
  const capture = await captureTrustedToolset(a), store = await initializeEvidence({root: join(a.root, '.claude/owner'), repositories: [a.root], owner: 'owner'})
  const launcher = await prepareTrustedLauncher(capture, store)
  return {a, marker, launcher: {...launcher, async runGuidesCollector(...args: Parameters<typeof launcher.runGuidesCollector>) {
    let result: Awaited<ReturnType<typeof launcher.runGuidesCollector>> | undefined, failure: any
    try {result = await launcher.runGuidesCollector(...args)} catch (error) {failure = error}
    await writeFile(join(a.root, '.claude/owner-observation.json'), JSON.stringify({
      test: expect.getState().currentTestName, scope: 'test owner return; controlled-event/probe cases are identified by the test name',
      outcome: failure ? 'rejected' : 'returned', primary: failure?.message ?? null,
      settlement: failure?.settlement ?? result?.settlement ?? null,
    }, null, 2) + '\n', {flag: 'wx'})
    if (failure) throw failure
    return result!
  }}}
}
async function ownerMarker(path: string) {
  const deadline = performance.now() + 10000
  for (;;) {
    try {return JSON.parse(await readFile(path, 'utf8')) as {pid: number; descendant: number | null}} catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      if (performance.now() >= deadline) throw Error('Fixture worker birth was not observed')
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
}
async function assertOwnedGone(pid: number, descendant?: number | null) {
  expect(Number.isSafeInteger(pid) && pid > 1).toBe(true)
  const deadline = performance.now() + 5000
  for (;;) {
    let alive = false
    for (const id of [pid, -pid, ...(descendant ? [descendant] : [])]) {
      try {process.kill(id, 0); alive = true} catch (error) {if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error}
    }
    if (!alive) return
    if (performance.now() >= deadline) throw Error(`Owned fixture ${pid} remains alive`)
    await new Promise(resolve => setTimeout(resolve, 20))
  }
}
const ownerOutcome = <T>(promise: Promise<T>) => promise.then(value => ({value, error: null as any}), error => ({value: null, error}))
describe.skipIf(process.platform === 'linux').sequential('Guides worker owned settlement', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    vi.mocked(spawn).mockReset().mockImplementation((await vi.importActual<typeof import('node:child_process')>('node:child_process')).spawn)
  })
  it('returns an actual normal close and absent owned group', async () => {
    const f = await ownerFixture(), result = await f.launcher.runGuidesCollector({})
    expect(result.settlement).toMatchObject({born: true, close: {code: 0, signal: null}, group: 'absent', signals: [], cleanupErrors: []})
    await assertOwnedGone(result.settlement.pid!)
  }, 30000)
  it('rejects an already-aborted invocation before spawning', async () => {
    const f = await ownerFixture(), controller = new AbortController(), reason = new Error('BEFORE_BIRTH')
    controller.abort(reason); vi.mocked(spawn).mockClear()
    await expect(f.launcher.runGuidesCollector({}, {}, controller.signal)).rejects.toBe(reason)
    expect(spawn).not.toHaveBeenCalled(); await expect(lstat(f.marker)).rejects.toMatchObject({code: 'ENOENT'})
  }, 30000)
  it.each(['wait', 'ignore'] as const)('cancels the real born %s worker and joins its group with full signal grace', async mode => {
    const f = await ownerFixture(), controller = new AbortController(), reason = new Error('OWNER_ABORT')
    const pending = ownerOutcome(f.launcher.runGuidesCollector({mode}, {}, controller.signal)), actor = await ownerMarker(f.marker)
    controller.abort(reason); const {error} = await pending, receipt = error.settlement
    expect(error.cause).toBe(reason); expect(receipt).toMatchObject({pid: actor.pid, born: true, group: 'absent', cleanupErrors: []})
    expect(receipt.close).not.toBeNull(); expect(receipt.signals.map(item => item.signal)).toEqual(mode === 'ignore' ? ['SIGTERM', 'SIGKILL'] : ['SIGTERM'])
    if (mode === 'ignore') expect(receipt.signals[1].at - receipt.signals[0].at).toBeGreaterThanOrEqual(1000)
    expect(performance.now() - receipt.signals.at(-1).at).toBeGreaterThanOrEqual(1000)
    await assertOwnedGone(actor.pid, actor.descendant)
  }, 30000)
  it('fails normal leader exit with a remaining inherited-pipe descendant and settles both', async () => {
    const f = await ownerFixture(), {error} = await ownerOutcome(f.launcher.runGuidesCollector({mode: 'leftover'}))
    const actor = await ownerMarker(f.marker)
    expect(error.message).toContain('surviving process group'); expect(error.settlement).toMatchObject({close: {code: 0}, group: 'absent', cleanupErrors: []})
    expect(error.settlement.signals[0].signal).toBe('SIGTERM'); await assertOwnedGone(actor.pid, actor.descendant)
  }, 30000)
  it('retains nonzero stderr with the accepted failure prefix and real close', async () => {
    const f = await ownerFixture(), {error} = await ownerOutcome(f.launcher.runGuidesCollector({mode: 'nonzero'}))
    expect(error.message).toBe('Guides worker failed: FINAL_STDERR_DIAGNOSTIC')
    expect(error.settlement).toMatchObject({close: {code: 7, signal: null}, group: 'absent'}); await assertOwnedGone(error.settlement.pid)
  }, 30000)
  it.each(['SIGINT', 'SIGTERM'] as const)('handles ordinary %s in an isolated living launcher parent', async signal => {
    const f = await ownerFixture(), project = process.cwd()
    const script = `const load=require(${JSON.stringify(join(project, 'scripts/lib/load-typescript.js'))}).loadTypeScript;
      const api=load(${JSON.stringify(join(project, 'packages/docs-tooling/src/shared-docs/adapters/updates/toolset.ts'))});
      const evidence=load(${JSON.stringify(join(project, 'packages/docs-tooling/src/shared-docs/adapters/updates/evidence.ts'))});
      (async()=>{const before=[process.listenerCount('SIGINT'),process.listenerCount('SIGTERM')];
        const capture=await api.captureTrustedToolset(${JSON.stringify(f.a)});
        const store=await evidence.initializeEvidence({root:${JSON.stringify(join(f.a.root, '.claude/signal-parent'))},repositories:[${JSON.stringify(f.a.root)}],owner:'signal'});
        const launcher=await api.prepareTrustedLauncher(capture,store);
        try{await launcher.runGuidesCollector({mode:'signal',signal:${JSON.stringify(signal)}});throw Error('Unexpected success')}
        catch(error){console.log(JSON.stringify({message:error.message,settlement:error.settlement,before,after:[process.listenerCount('SIGINT'),process.listenerCount('SIGTERM')]}))}
      })().catch(error=>{console.error(error);process.exitCode=1});`
    const result = await promisify(execFile)(process.execPath, ['-e', script], {env: {...process.env, JITI_CACHE: 'false'}, timeout: 20000, maxBuffer: 1024 * 1024})
    await writeFile(join(f.a.root, '.claude/signal-owner-observation.json'), result.stdout, {flag: 'wx'})
    const outcome = JSON.parse(result.stdout)
    expect(outcome.message).toBe(`Guides worker interrupted: ${signal}`); expect(outcome.settlement.group).toBe('absent'); expect(outcome.after).toEqual(outcome.before)
    await assertOwnedGone(outcome.settlement.pid)
  }, 30000)
  it.each(['timeout', 'stream'] as const)('routes controlled %s dispatch through an actual born worker owner', async kind => {
    const f = await ownerFixture(), realSpawn = (await vi.importActual<typeof import('node:child_process')>('node:child_process')).spawn
    let child: ReturnType<typeof spawn> | undefined, timeout: (() => void) | undefined
    vi.mocked(spawn).mockImplementation(((...args: any[]) => {
      const value = (realSpawn as any)(...args)
      if (args[1]?.some((arg: string) => arg.endsWith('/guides-worker.cjs'))) child = value
      return value
    }) as typeof spawn)
    const original = globalThis.setTimeout
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms: number, ...args: any[]) => {
      if (ms === 600_000) timeout = fn
      return original(fn, ms, ...args)
    }) as typeof setTimeout)
    const pending = ownerOutcome(f.launcher.runGuidesCollector({mode: 'wait'})), actor = await ownerMarker(f.marker)
    if (kind === 'timeout') {expect(timeout).toBeTypeOf('function'); timeout!()} else child!.stdin!.emit('error', new Error('CONTROLLED_STDIN_ERROR'))
    const {error} = await pending
    expect(error.message).toBe(kind === 'timeout' ? 'Guides worker timeout' : 'CONTROLLED_STDIN_ERROR')
    expect(error.settlement.group).toBe('absent'); await assertOwnedGone(actor.pid)
  }, 30000)
  it.each(['normal', 'nonzero'])('reports denied group observation for %s without replacing the first failure', async mode => {
    const f = await ownerFixture(), realSpawn = (await vi.importActual<typeof import('node:child_process')>('node:child_process')).spawn
    let pid: number | undefined
    vi.mocked(spawn).mockImplementation(((...args: any[]) => {
      const child = (realSpawn as any)(...args)
      if (args[1]?.some((arg: string) => arg.endsWith('/guides-worker.cjs'))) pid = child.pid
      return child
    }) as typeof spawn)
    const kill = process.kill.bind(process)
    const spy = vi.spyOn(process, 'kill').mockImplementation((id, signal) => {
      if (pid && id === -pid && signal === 0) throw Object.assign(new Error('CONTROLLED_PROBE_DENIED'), {code: 'EPERM'})
      return kill(id, signal)
    })
    const {error} = await ownerOutcome(f.launcher.runGuidesCollector({mode}))
    spy.mockRestore()
    if (mode === 'normal') expect(error.message).toContain('unknown')
    else expect(error.message).toBe('Guides worker failed: FINAL_STDERR_DIAGNOSTIC')
    expect(error.settlement).toMatchObject({group: 'unknown', close: {code: mode === 'normal' ? 0 : 7}})
    expect(error.settlement.cleanupErrors).toContainEqual(expect.objectContaining({operation: 'probe', code: 'EPERM'}))
    await assertOwnedGone(pid!)
  }, 30000)
  it.each(['assembly', 'nonzero'] as const)('rejects a finalizer exception after %s without losing primary or invocation listeners', async mode => {
    const f = await ownerFixture(), before = [process.listenerCount('SIGINT'), process.listenerCount('SIGTERM')], unhandled: unknown[] = []
    const listener = (error: unknown) => unhandled.push(error); process.on('unhandledRejection', listener)
    const concat = Buffer.concat, fault = new Error('CONTROLLED_FINALIZER_FAILURE')
    vi.spyOn(Buffer, 'concat').mockImplementation((list, ...args) => {
      if (list.some(bytes => Buffer.from(bytes).toString() === (mode === 'assembly' ? 'ASSEMBLY_FAULT' : 'FINAL_STDERR_DIAGNOSTIC'))) throw fault
      return concat(list, ...args)
    })
    try {
      const {error} = await ownerOutcome(f.launcher.runGuidesCollector({mode}))
      if (mode === 'assembly') expect(error.cause).toBe(fault)
      else {expect(error.cause).not.toBe(fault); expect(error.cause.message).toBe('Guides worker failed:')}
      expect(error.message).toBe(mode === 'assembly' ? 'CONTROLLED_FINALIZER_FAILURE' : 'Guides worker failed:')
      expect(error.settlement.cleanupErrors).toContainEqual(expect.objectContaining({operation: 'finalize-output', message: fault.message}))
      expect(error.settlement.group).toBe('absent'); await assertOwnedGone(error.settlement.pid)
      expect([process.listenerCount('SIGINT'), process.listenerCount('SIGTERM')]).toEqual(before)
      await new Promise(resolve => setTimeout(resolve, 20)); expect(unhandled).toEqual([])
    } finally {process.removeListener('unhandledRejection', listener)}
  }, 30000)
  it.each([true, false])('bounds controlled late stderr/close delivery (close arrives: %s)', async closeArrives => {
    const f = await ownerFixture(), realSpawn = (await vi.importActual<typeof import('node:child_process')>('node:child_process')).spawn
    const fake = Object.assign(new EventEmitter(), {pid: 987654321, stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough(), stdio: [] as any[]})
    fake.stdio = [fake.stdin, fake.stdout, fake.stderr, new PassThrough()]
    vi.mocked(spawn).mockImplementation(((...args: any[]) => {
      if (!args[1]?.some((arg: string) => arg.endsWith('/guides-worker.cjs'))) return (realSpawn as any)(...args)
      setImmediate(() => {fake.emit('spawn'); fake.emit('exit', 7, null); setTimeout(() => {fake.stderr.emit('data', Buffer.from('AFTER_EXIT')); if (closeArrives) fake.emit('close', 7, null)}, 20)})
      return fake
    }) as typeof spawn)
    const kill = process.kill.bind(process)
    vi.spyOn(process, 'kill').mockImplementation((id, signal) => {
      if (id === -fake.pid) throw Object.assign(new Error('controlled group absence'), {code: 'ESRCH'})
      return kill(id, signal)
    })
    const {error} = await ownerOutcome(f.launcher.runGuidesCollector({}))
    expect(error.message).toBe('Guides worker failed: AFTER_EXIT'); expect(error.cause.message).toBe(error.message)
    expect(error.settlement).toMatchObject({close: closeArrives ? {code: 7} : null, group: 'absent'})
    if (!closeArrives) {
      expect(error.settlement.cleanupErrors).toContainEqual(expect.objectContaining({operation: 'join-close'}))
      fake.emit('close', 7, null)
      expect(error.settlement.close).toBeNull() // A late event cannot rewrite the terminal observation.
    }
    // This event-order control is synthetic. Real settlement is tested above.
  }, 30000)
})


vi.mock('node:fs/promises', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {...actual, open: vi.fn(actual.open), realpath: vi.fn(actual.realpath), readdir: vi.fn(actual.readdir)}
})
const fsPromisesOpen = vi.mocked(fsPromises.open).getMockImplementation()!
const originalRealpath = vi.mocked(fsPromises.realpath).getMockImplementation()!
const originalExecFile = vi.mocked(childProcess.execFile).getMockImplementation()!
describe.skipIf(process.platform !== 'darwin')('fixed developer tool capture provisioning', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); vi.mocked(childProcess.execFile).mockImplementation(originalExecFile); vi.mocked(fsPromises.open).mockImplementation(fsPromisesOpen); vi.mocked(fsPromises.realpath).mockImplementation(originalRealpath) })
  const profile = '/Library/Preferences/OpenDirectory/Configurations/Search.plist'
  function discover(gitPath: string, pythonPath?: string) {
    const original = originalExecFile
    vi.mocked(childProcess.execFile).mockImplementation(((file: string, args: string[], options: unknown, callback: Function) => {
      if (file === '/usr/bin/xcrun') {
        callback(null, args[1] === 'git' ? gitPath + '\n' : pythonPath + '\n', '')
        return {} as never
      }
      return (original as Function)(file, args, options, callback)
    }) as never)
  }
  it.each(['/Applications/Xcode.app/Contents/Developer', '/Applications/Xcode_16.4.app/Contents/Developer', '/Library/Developer/CommandLineTools'])('accepts %s Git location and preserves profile permission refusal', async developer => {
    const a = await fixture(), location = developer + '/usr/bin/git'
    discover(location)
    const original = originalRealpath
    vi.spyOn(fsPromises, 'realpath').mockImplementation((async path => String(path) === location ? location : original(path)) as typeof fsPromises.realpath)
    const opened = vi.spyOn(fsPromises, 'open').mockImplementation((async (path, ...args) => {
      if (String(path) === profile) throw Object.assign(new Error('profile read denied'), {code: 'EACCES'})
      return fsPromisesOpen(path, ...args)
    }) as typeof fsPromises.open)
    await expect(captureTrustedToolset(a)).rejects.toMatchObject({code: 'EACCES'})
    expect(opened).toHaveBeenCalledWith(profile, expect.any(Number))
  })
  it.each(['/Applications/Xcode_evil.app/Contents/Developer/usr/bin/git', '/Applications/Xcode_16.4.app/Contents/Developer/usr/../bin/git', '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/python3', '/Library/Developer/arbitrary/usr/bin/git', '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git\nextra', '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git\n', '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git\r'])('refuses malformed Git discovery %s before profile read', async location => {
    const a = await fixture(); discover(location)
    const opened = vi.spyOn(fsPromises, 'open')
    await expect(captureTrustedToolset(a)).rejects.toThrow('Unknown system Git provisioning')
    expect(opened.mock.calls.some(([path]) => String(path) === profile)).toBe(false)
  })
  it.each(['/Applications/Xcode.app/Contents/Developer', '/Applications/Xcode_16.4.app/Contents/Developer', '/Library/Developer/CommandLineTools'])('accepts %s Python framework layout through actual capture', async developer => {
    const a = await fixture(), location = developer + '/usr/bin/python3', binary = developer + '/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3.9', stdlib = dirname(dirname(binary)) + '/lib/python3.9'
    const gitPath = execFileSync('/usr/bin/xcrun', ['--find', 'git'], {encoding: 'utf8'}).trim()
    discover(gitPath, location)
    vi.spyOn(fsPromises, 'realpath').mockImplementation((async path => String(path) === location ? binary : [binary, stdlib].includes(String(path)) ? String(path) : originalRealpath(path)) as typeof fsPromises.realpath)
    const originalRead = vi.mocked(fsPromises.readdir).getMockImplementation()!
    const read = vi.spyOn(fsPromises, 'readdir').mockImplementation((async (path, ...args) => {
      if (String(path) === stdlib) throw new Error('MEASURE_STDLIB_SENTINEL')
      return (originalRead as Function)(path, ...args)
    }) as typeof fsPromises.readdir)
    try {
      await expect(captureTrustedToolset({...a, helpers:['python3']})).rejects.toThrow('MEASURE_STDLIB_SENTINEL')
      expect(read.mock.calls.some(([path]) => String(path) === stdlib)).toBe(true)
    } finally { read.mockRestore() }
  })
  it.each(['/Applications/Xcode_bad.app/Contents/Developer/usr/bin/python3', '/Library/Developer/other/usr/bin/python3'])('refuses unsupported Python discovery %s', async location => {
    const a = await fixture(), gitPath = execFileSync('/usr/bin/xcrun', ['--find', 'git'], {encoding:'utf8'}).trim()
    discover(gitPath, location)
    await expect(captureTrustedToolset({...a, helpers:['python3']})).rejects.toThrow('Unknown Python provisioning')
  })
  it('rejects a Python target escaping into a different developer root', async () => {
    const a = await fixture(), location = '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/python3', gitPath = execFileSync('/usr/bin/xcrun', ['--find', 'git'], {encoding:'utf8'}).trim()
    discover(gitPath, location)
    vi.spyOn(fsPromises, 'realpath').mockImplementation((async path => String(path) === location ? '/Library/Developer/CommandLineTools/usr/bin/python3' : originalRealpath(path)) as typeof fsPromises.realpath)
    await expect(captureTrustedToolset({...a, helpers:['python3']})).rejects.toThrow('Unknown Python provisioning')
  })
  it('binds original profile bytes and rejects changed bytes on verification', async () => {
    const a = await fixture(), capture = await captureTrustedToolset(a), bytes = await readFile(profile)
    expect(capture.closure.entries.find(entry => entry.path === 'runtime/identity-profile/Search.plist')).toMatchObject({sha256:rawSha256(bytes),bytes:bytes.length})
    vi.spyOn(fsPromises, 'open').mockImplementation((async (path, ...args) => {
      const handle = await fsPromisesOpen(path, ...args)
      if (String(path) === profile) {
        const originalRead = handle.read.bind(handle)
        handle.read = (async (...readArgs: Parameters<typeof handle.read>) => {
          const result = await originalRead(...readArgs)
          if (result.bytesRead) result.buffer[0] ^= 1
          return result
        }) as typeof handle.read
      }
      return handle
    }) as typeof fsPromises.open)
    await expect(verifyTrustedToolset(capture)).rejects.toThrow('Trusted runtime changed before inspection')
  })
  it('rejects a canonical Git target that escapes its selected developer root', async () => {
    const a = await fixture(), location = '/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git'
    discover(location)
    const original = originalRealpath
    vi.spyOn(fsPromises, 'realpath').mockImplementation((async path => String(path) === location ? '/Applications/Xcode.app/Contents/Developer/usr/bin/git' : original(path)) as typeof fsPromises.realpath)
    await expect(captureTrustedToolset(a)).rejects.toThrow('Unknown system Git provisioning')
  })
})
