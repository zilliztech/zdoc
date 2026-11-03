import { describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, symlink, chmod, realpath, unlink } from 'node:fs/promises'
import { tmpdir, release } from 'node:os'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { canonicalBytes } from '../../core/updates/canonical'
import { captureTrustedToolset, compareCandidateToolset, verifyTrustedToolset, serializeClosure, bindClosure, verifyClosureBinding, trustedLauncherEnvironment, captureTrustedNativeFiles, nativeDependencies } from '../../adapters/updates/toolset'
import { rawSha256 } from '../../adapters/updates/evidence'
const hostTcb = { kind: 'host-os-tcb', schemaVersion: 1, policy: 'host-os-tcb-v1', platform: process.platform, release: release(), architecture: process.arch, systemLibraries: 'trusted-host-unmeasured' }
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
async function put(root: string, path: string, text: string) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text) }
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'update-toolset-')))
  git(root, 'init', '-q')
  for (const [path, text] of Object.entries({ 'scripts/docs-tooling.js': 'throw new Error("must not execute")', 'scripts/lib/load-typescript.js': 'throw new Error("must not load")', 'packages/compiler/index.js': 'throw new Error("must not compile")', 'apps/docs/package.json': '{"name":"docs","version":"1.0.0","dependencies":{"jiti":"1.0.0"}}', 'package.json': '{"name":"fixture","version":"1.0.0","packageManager":"pnpm@10.33.0"}', 'pnpm-workspace.yaml': 'packages: ["apps/*", "packages/*"]', 'pnpm-lock.yaml': 'lockfileVersion: "9.0"\nimporters:\n  apps/docs:\n    dependencies:\n      jiti: {specifier: 1.0.0, version: 1.0.0}\npackages:\n  jiti@1.0.0:\n    resolution: {integrity: sha512-fixture}\nsnapshots:\n  jiti@1.0.0: {}\n', 'content/en/page.mdx': '# data\n' })) await put(root, path, text)
  await put(root, '.gitignore', 'node_modules/\n'); git(root, 'add', '.'); git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'trusted fixture')
  const commit = git(root, 'rev-parse', 'HEAD')
  await put(root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/package.json', '{"name":"jiti","version":"1.0.0","main":"index.js"}')
  await put(root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js', 'throw new Error("dependency must not execute")')
  await mkdir(join(root, 'apps/docs/node_modules')); await symlink('../../../node_modules/.pnpm/jiti@1.0.0/node_modules/jiti', join(root, 'apps/docs/node_modules/jiti'))
  return { root, commit, cwd: root, environment: {}, flags: [] }
}
const commitAll = (root: string) => { git(root, 'add', '.'); git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'candidate'); return git(root, 'rev-parse', 'HEAD') }
describe('trusted closure capture', () => {
  it('captures actual committed bytes, app-local pnpm files and runtime; survives relocation; detects dependency tamper', async () => {
    const a = await fixture(), b = await fixture()
    const first = await captureTrustedToolset(a), second = await captureTrustedToolset(b)
    expect(first.bytes).toEqual(second.bytes); expect(first.toolsetSha256).toBe(second.toolsetSha256)
    expect(first.closure.entries.some(e => e.path.startsWith('deps/') && e.path.endsWith('/index.js'))).toBe(true)
    expect(first.closure.entries.some(e => e.path === 'runtime/node')).toBe(true)
    await verifyTrustedToolset(first)
    await put(a.root, 'node_modules/.pnpm/jiti@1.0.0/node_modules/jiti/index.js', 'tampered')
    await expect(verifyTrustedToolset(first)).rejects.toThrow(/changed|drift/i)
  }, 30000)
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
    await put(a.root, path, `require('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'executed')`)
    const sha = commitAll(a.root), before = git(a.root, 'show-ref') + git(a.root, 'count-objects', '-v')
    await expect(compareCandidateToolset(trusted, { root: a.root, commit: sha, dataPaths: ['content/en/page.mdx'] })).rejects.toThrow(/protected|unreviewed/i)
    await expect(readFile(sentinel)).rejects.toThrow(); expect(git(a.root, 'show-ref') + git(a.root, 'count-objects', '-v')).toBe(before)
  }, 30000)
  it('treats MDX as data and rejects submodule/symlink modes before any invocation', async () => {
    const a = await fixture(), trusted = await captureTrustedToolset(a)
    await put(a.root, 'content/en/page.mdx', 'import fs from "node:fs"\n\n{fs.writeFileSync("SENTINEL", "executed")}')
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
  it('binds identical closure bytes in material and proof; runtime/ordered flags change the toolset digest', async () => {
    const capture = await captureTrustedToolset(await fixture()), ref = { path: 'blobs/closure', sha256: rawSha256(capture.bytes), bytes: capture.bytes.length }
    verifyClosureBinding(capture.material, ref, capture.bytes, capture.toolsetSha256)
    expect(() => verifyClosureBinding(capture.material, { ...ref, sha256: 'a'.repeat(64) }, capture.bytes, capture.toolsetSha256)).toThrow()
    const changed = bindClosure(capture.closure, { ...capture.material, runtime: { ...capture.material.runtime, version: 'different' } })
    expect(changed.toolsetSha256).not.toBe(capture.toolsetSha256)
    expect(bindClosure(capture.closure, { ...capture.material, flags: ['--no-warnings', '--enable-source-maps'] }).toolsetSha256).not.toBe(bindClosure(capture.closure, { ...capture.material, flags: ['--enable-source-maps', '--no-warnings'] }).toolsetSha256)
  })
  it('requires strict host TCB binding and captures actual Git resolution and non-system libraries', async () => {
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

  it('binds actual native-library target bytes and holds missing or unknown dependencies', async () => {
    if (process.platform !== 'darwin') return
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
    await writeFile(entry, macho(['unresolved.dylib'])); await expect(captureTrustedNativeFiles([{ name: 'runtime/test-native', path: entry }])).rejects.toThrow(/Unknown/)
    expect(() => nativeDependencies(Buffer.from('cffaedfe', 'hex'))).toThrow()
  })
  it('bypasses trusted dotenv and rejects ambient Node/package/loader settings and wrong cwd', async () => {
    const a = await fixture(); await put(a.root, '.env', 'SECRET=should-not-load')
    expect((await trustedLauncherEnvironment(a.root, a.root, { SECRET: 'ambient' }, [])).SECRET).toBeUndefined()
    for (const name of ['NODE_OPTIONS', 'NODE_PATH', 'LD_PRELOAD', 'DYLD_INSERT_LIBRARIES', 'npm_config_userconfig', 'DEVELOPER_DIR', 'SDKROOT', 'GIT_EXEC_PATH']) await expect(trustedLauncherEnvironment(a.root, a.root, { [name]: 'bad' }, [])).rejects.toThrow()
    await expect(trustedLauncherEnvironment(a.root, dirname(a.root), {}, [])).rejects.toThrow()
    await expect(trustedLauncherEnvironment(a.root, a.root, {}, ['--import=evil'])).rejects.toThrow()
  })
})
