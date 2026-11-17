import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, symlinkSync, rmSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const cli = join(root, 'scripts/docs-workflow/shared-guides-update/batch-report.mjs')
const fixture = join(root, 'packages/docs-tooling/src/shared-docs/testing/updates/fixtures/upstream-batch-3848.json')
const scratch = mkdtempSync(join(realpathSync(tmpdir()), 'batch-report-tests-'))
after(() => rmSync(scratch, { recursive: true, force: true }))
let sequence = 0
const area = () => { const p = join(scratch, String(++sequence)); mkdirSync(p); return p }
const environment = { ...process.env, GH_TOKEN: '', GITHUB_TOKEN: '' }
for (const key of Object.keys(environment)) if (key.startsWith('GIT_')) delete environment[key]
const run = (argv, options = {}) => spawnSync(process.execPath, [options.cli ?? cli, ...argv],
  { cwd: options.cwd ?? root, env: { ...environment, ...options.env }, encoding: 'utf8', timeout: 30_000, maxBuffer: 128 * 1024 })
const outputFiles = out => readdirSync(out).sort()
const expectedFiles = ['batch-report.json', 'batch-report.md']
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { env: environment, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const toolHead = git(root, 'rev-parse', 'HEAD')
function assertFailure(result, code, exit = 1) {
  assert.equal(result.error, undefined)
  assert.equal(result.status, exit)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, code + '\n')
}
function completeInput() {
  const sha = 'a'.repeat(40)
  return { observation: 'replay', tools: 'b'.repeat(40), pins: { master: sha, dev: 'c'.repeat(40), source: sha },
    pages: [{ pageId: 'example', sourceFile: 'site/en/example.md', publish: [{ manual: 'guides', path: 'tutorials/example' }],
      active: true, published: true, current: sha, oldNext: sha, target: sha, intervals: [], seedKeys: [], evidence: ['fixture:example'], reasons: [] }],
    seeds: [], changes: [], dependencies: [], reasons: [] }
}
function inputFile(directory, mutate = () => {}) {
  const value = { provenance: { scope: 'historical assertions only' }, input: completeInput() }
  mutate(value)
  const path = join(directory, 'fixture.json'); writeFileSync(path, JSON.stringify(value)); return path
}

test('strict CLI forms reject wrong order, missing, duplicate and override flags before build or network', () => {
  const p = area()
  const invalid = [[], ['--help'], ['--out', p, '--replay', fixture], ['--replay', fixture],
    ['--replay', fixture, '--out', p, '--out', p], ['--source-repo', p, '--out', p, '--token', 'private-secret'],
    ['--replay', fixture, '--out', '--out'], ['--source-repo', p, '--network-origin', p],
    ['--replay', fixture, '--out', p, '--master', 'a'.repeat(40)], ['--test', p, '--out', p]]
  for (const argv of invalid) {
    const result = run(argv, { env: { GH_TOKEN: 'private-secret', GIT_DIR: '/missing-git-store' } })
    assert.equal(result.status, 2)
    assert.match(result.stderr, /^USAGE: batch-report\.mjs /)
    assert.doesNotMatch(result.stderr, /private-secret|missing-git-store/)
    assert.equal(result.stdout, '')
  }
  assert.deepEqual(readdirSync(p), [])
})

test('actual fixed3848 replay publishes a full held pair and computes inventory/mapping', () => {
  const p = area(), out = join(p, 'out'), result = run(['--replay', fixture, '--out', out])
  assert.equal(result.error, undefined); assert.equal(result.status, 1); assert.equal(result.stderr, ''); assert.equal(result.stdout, '')
  assert.deepEqual(outputFiles(out), expectedFiles)
  const report = JSON.parse(readFileSync(join(out, 'batch-report.json')))
  const sample = JSON.parse(readFileSync(fixture))
  assert.equal(report.inventory.configured, sample.input.pages.length)
  assert.equal(report.changes.length, 22); assert.equal(report.groups[0].pageIds.length, 12)
  assert.equal(report.observation, 'replay'); assert.equal(report.status, 'held'); assert.equal(report.writeEligible, false)
  assert.equal(report.tools, toolHead); assert.ok(report.reasons.includes('UPSTREAM_UNMERGED'))
  assert.ok(report.reasons.includes('INCOMPLETE_SOURCE_INTERVAL'))
  assert.equal(report.groups.every(group => group.closure === 'pending-collector'), true)
  assert.match(readFileSync(join(out, 'batch-report.md'), 'utf8'), /Status: \*\*held\*\*/)
  const before = expectedFiles.map(name => readFileSync(join(out, name)))
  assertFailure(run(['--replay', fixture, '--out', out]), 'OUTPUT_UNSAFE')
  expectedFiles.forEach((name, index) => assert.deepEqual(readFileSync(join(out, name)), before[index]))
})

test('complete historical replay is provisional, canonical and independent of foreign cwd and ambient Git', () => {
  const p = area(), input = inputFile(p, value => { value.provenance.secret = 'private-credential-value' })
  const other = join(p, 'foreign'); mkdirSync(other)
  git(other, 'init', '-b', 'fixture'); git(other, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-m', 'fixture')
  const a = join(p, 'one'), b = join(p, 'two'); mkdirSync(b)
  for (const [out, cwd, env] of [[a, root, {}], [b, other, { GIT_DIR: join(other, '.git'), GIT_WORK_TREE: other, GH_TOKEN: 'private-credential-value' }]]) {
    const result = run(['--replay', input, '--out', out], { cwd, env })
    assert.equal(result.status, 0); assert.equal(result.stderr, ''); assert.equal(result.stdout, '')
    assert.deepEqual(outputFiles(out), expectedFiles)
    const report = JSON.parse(readFileSync(join(out, 'batch-report.json')))
    assert.equal(report.observation, 'replay'); assert.equal(report.tools, toolHead); assert.equal(report.status, 'provisional')
    assert.equal(report.writeEligible, false); assert.equal(report.inventory.configured, 1)
    const md = readFileSync(join(out, 'batch-report.md'), 'utf8')
    assert.match(md, /historical fixture assertions/); assert.match(md, /Fixture-declared tools: b{40}/)
    assert.doesNotMatch(md, /private-credential-value|foreign|fixture\.json/)
  }
  for (const name of expectedFiles) assert.deepEqual(readFileSync(join(a, name)), readFileSync(join(b, name)))
})

test('observed form diagnoses missing credentials before build/network and never creates a business report', () => {
  const p = area(), out = join(p, 'out')
  assertFailure(run(['--source-repo', p, '--out', out]), 'GITHUB_CREDENTIAL_REQUIRED')
  assert.equal(existsSync(out), false)
})

test('replay input is a same-fd bounded regular file: FIFO, links, directory and oversized input reject promptly', () => {
  const p = area(), ordinary = inputFile(p), fifo = join(p, 'fifo'), link = join(p, 'link'), large = join(p, 'large')
  execFileSync('mkfifo', [fifo]); symlinkSync(ordinary, link); writeFileSync(large, Buffer.alloc(1024 * 1024 + 1))
  const ancestorLink = join(p, 'linked-parent'); symlinkSync(p, ancestorLink)
  for (const input of [fifo, link, p, join(ancestorLink, 'fixture.json'), join(p, 'missing')]) {
    const out = join(p, 'out')
    const result = run(['--replay', input, '--out', out])
    assert.equal(result.error, undefined); assert.equal(result.status, 1)
    assert.match(result.stderr, /^(REPLAY_INPUT_INVALID|UNSAFE_PATH)\n$/)
    assert.equal(existsSync(out), false)
  }
  assertFailure(run(['--replay', large, '--out', join(p, 'out')]), 'REPLAY_INPUT_LIMIT')
})

test('strict replay parsing rejects duplicate keys, BOM, observed claims, schema extras and malformed provenance without leaking bytes', () => {
  const p = area(), path = join(p, 'bad.json')
  const cases = [Buffer.from('{"input":null,"input":"private-secret","provenance":{}}'), Buffer.from('\ufeff{}'),
    Buffer.from('private-secret'), JSON.stringify({ ...{ input: completeInput(), provenance: {} }, extra: 'private-secret' }),
    JSON.stringify({ input: { ...completeInput(), observation: 'observed' }, provenance: {} }),
    JSON.stringify({ input: { ...completeInput(), writeEligible: true }, provenance: {} }),
    JSON.stringify({ input: completeInput(), provenance: [] })]
  for (const value of cases) {
    writeFileSync(path, value)
    const out = join(p, 'out')
    assertFailure(run(['--replay', path, '--out', out]), 'REPLAY_FIXTURE_INVALID')
    assert.equal(existsSync(out), false)
  }
})

test('output preflight rejects content, files, links and linked ancestors before reading replay input', () => {
  const p = area(), dir = join(p, 'used'); mkdirSync(dir); writeFileSync(join(dir, 'keep'), 'unchanged')
  const file = join(p, 'file'); writeFileSync(file, 'unchanged')
  const empty = join(p, 'empty'); mkdirSync(empty)
  const link = join(p, 'link'); symlinkSync(empty, link)
  const parentLink = join(p, 'parent-link'); symlinkSync(p, parentLink)
  for (const out of [dir, file, link, join(parentLink, 'output'), join(p, 'missing-parent', 'output')]) {
    const result = run(['--replay', join(p, 'nonexistent'), '--out', out])
    assert.equal(result.status, 1); assert.match(result.stderr, /^(OUTPUT_UNSAFE|UNSAFE_PATH)\n$/)
    assert.equal(result.stdout, '')
  }
  assert.equal(readFileSync(join(dir, 'keep'), 'utf8'), 'unchanged')
  assert.equal(readFileSync(file, 'utf8'), 'unchanged'); assert.deepEqual(readdirSync(empty), [])
})

// Synthetic tool checkouts exercise the real executable's build/publication failure paths.
// These are packaging fixtures, not observed upstream or lifecycle evidence, and add no CLI override.
function commitFixture(f) {
  git(f.p, 'add', 'scripts')
  git(f.p, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture inputs')
  f.tools = git(f.p, 'rev-parse', 'HEAD')
}
function packagingFixture(source) {
  const p = area(), scriptDirectory = join(p, 'scripts/docs-workflow/shared-guides-update'); mkdirSync(scriptDirectory, { recursive: true })
  copyFileSync(cli, join(scriptDirectory, 'batch-report.mjs'))
  copyFileSync(join(root, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs'), join(scriptDirectory, 'batch-publish.mjs'))
  writeFileSync(join(scriptDirectory, 'batch-contract.ts'), source)
  symlinkSync(join(root, 'node_modules'), join(p, 'node_modules'))
  git(p, 'init', '-b', 'fixture'); git(p, 'add', 'scripts')
  git(p, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'packaging fixture')
  return { p, cli: join(scriptDirectory, 'batch-report.mjs'), tools: git(p, 'rev-parse', 'HEAD') }
}
const stub = body => `export const canonicalBytes = x => Buffer.from(JSON.stringify(x));
export const BatchDiscoveryReportSchema = { parse: x => x };
export const batchDiscoveryFailureCode = () => 'BATCH_DISCOVERY_FAILED';
export async function collectBatchDiscovery(options) { ${body} }
`
const observed = tools => ({ ...completeInput(), observation: 'observed', tools, schema: 'guides-batch-discovery-v1', writeEligible: false,
  status: 'provisional', inventory: { configured: 1, active: 1, published: 1, activeUnknown: 0, publishedUnknown: 0 }, groups: [] })

test('observed executable wiring uses one options argument and the module checkout/tools, without exposing test overrides', () => {
  const f = packagingFixture(stub("throw Error('uninitialized packaging fixture')"))
  const contract = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-contract.ts')
  writeFileSync(contract, stub(`if (arguments.length !== 1 || Object.keys(options).sort().join(',') !== 'sourceRepository,tools,zdocRepository' || options.zdocRepository !== ${JSON.stringify(f.p)}) throw Error('private-secret'); return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
  commitFixture(f)
  const out = join(f.p, 'out'), result = run(['--source-repo', f.p, '--out', out], { cli: f.cli, cwd: scratch, env: { GH_TOKEN: 'private-secret' } })
  assert.equal(result.status, 0); assert.equal(result.stderr, '')
  const report = JSON.parse(readFileSync(join(out, 'batch-report.json')))
  assert.equal(report.observation, 'observed'); assert.equal(report.tools, f.tools); assert.equal(report.writeEligible, false)
})

test('dirty CLI, publisher, contract and transitive first-party inputs reject the claimed tool identity', () => {
  for (const name of ['batch-report.mjs', 'batch-publish.mjs', 'batch-contract.ts', 'fixture-helper.ts']) {
    const f = packagingFixture("export { collectBatchDiscovery } from './fixture-helper'")
    const dir = dirname(f.cli), helper = join(dir, 'fixture-helper.ts')
    writeFileSync(helper, stub("throw Error('original committed fixture')")); commitFixture(f)
    const file = join(dir, name); writeFileSync(file, readFileSync(file, 'utf8') + '\n// uncommitted source')
    const out = join(f.p, 'out')
    assertFailure(run(['--source-repo', f.p, '--out', out], { cli: f.cli, cwd: scratch, env: { GH_TOKEN: 'private-secret' } }), 'TOOLS_IDENTITY_UNAVAILABLE')
    assert.equal(existsSync(out), false)
  }
})

test('oversized output and builder/reader failures leave no partial pair and emit only fixed diagnostics', () => {
  const cases = [
    [stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools, reasons: ['X'.repeat(16 * 1024 * 1024)] };`), 'REPORT_OUTPUT_LIMIT'],
    ['invalid private-secret source', 'TOOL_BUILD_FAILED'],
    [stub("throw Error('private-secret /Users/private-local-path')"), 'BATCH_DISCOVERY_FAILED'],
  ]
  for (const [source, code] of cases) {
    const f = packagingFixture(source), out = join(f.p, 'out'); mkdirSync(out)
    assertFailure(run(['--source-repo', f.p, '--out', out], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } }), code)
    assert.deepEqual(readdirSync(out), [])
    assert.equal(readdirSync(f.p).some(name => name.startsWith('.guides-batch-report-')), false)
  }
})

test('preflight identity/content recheck rejects an output directory changed during observation', () => {
  for (const mutation of ['content', 'link']) {
    const f = packagingFixture(stub("throw Error('uninitialized packaging fixture')")), out = join(f.p, 'out')
    const destination = join(f.p, 'other'); mkdirSync(out); mkdirSync(destination)
    const action = mutation === 'content' ? `writeFileSync(${JSON.stringify(join(out, 'keep'))}, 'unchanged')` :
      `rmdirSync(${JSON.stringify(out)}); symlinkSync(${JSON.stringify(destination)}, ${JSON.stringify(out)})`
    writeFileSync(join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-contract.ts'),
      `import { writeFileSync, rmdirSync, symlinkSync } from 'node:fs';\n` +
      stub(`${action}; return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
    commitFixture(f)
    const result = run(['--source-repo', f.p, '--out', out], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } })
    assert.equal(result.status, 1); assert.match(result.stderr, /^(OUTPUT_CHANGED|UNSAFE_PATH)\n$/)
    if (mutation === 'content') assert.equal(readFileSync(join(out, 'keep'), 'utf8'), 'unchanged')
    assert.deepEqual(readdirSync(destination), [])
    assert.equal(existsSync(join(out, 'batch-report.json')), false)
    assert.equal(readdirSync(f.p).some(name => name.startsWith('.guides-batch-report-')), false)
  }
})

test('output file syscalls stay anchored after parent replacement and leave the private output in place', () => {
  for (const replacement of ['original', 'other']) {
    const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
    const parent = join(f.p, 'reports'), moved = join(f.p, 'reports-moved'), other = join(f.p, 'other')
    mkdirSync(parent); mkdirSync(other)
    const helper = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs')
    // Instrument the copied packaging helper, without introducing any production option/seam.
    // Interleave immediately before the first exclusive file-open syscall in the bound writer.
    const attack = `import fixtureFs from 'node:fs'; import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureOpen = fixtureFs.openSync;
fixtureFs.openSync = (name, ...args) => {
  if (name === 'batch-report.json') {
    fixtureFs.renameSync(${JSON.stringify(parent)}, ${JSON.stringify(moved)});
    fixtureFs.symlinkSync(${JSON.stringify(replacement === 'original' ? moved : other)}, ${JSON.stringify(parent)});
    fixtureFs.writeFileSync(${JSON.stringify(join(other, 'keep'))}, 'unrelated');
  }
  return fixtureOpen(name, ...args);
}; fixtureSync();
`
    const prelude = `import fixtureChild from 'node:child_process'; import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureExec = fixtureChild.execFileSync;
fixtureChild.execFileSync = (file, args, options) => {
  if (args[2]?.startsWith('// Owned-directory writes')) args[2] = ${JSON.stringify(attack)} + args[2];
  return fixtureExec(file, args, options);
}; fixtureSync();
`
    writeFileSync(helper, prelude + readFileSync(helper, 'utf8'))
    commitFixture(f)
    const result = run(['--source-repo', f.p, '--out', join(parent, 'out')], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } })
    assertFailure(result, 'OUTPUT_CHANGED')
    assert.deepEqual(outputFiles(join(moved, 'out')), expectedFiles)
    assert.equal(existsSync(join(parent, 'out')), replacement === 'original')
    assert.deepEqual(readdirSync(other), ['keep'])
    assert.equal(readFileSync(join(other, 'keep'), 'utf8'), 'unrelated')
  }
})

test('publisher rejects a cwd redirected before spawn before any writes and receives no credentials', () => {
  const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
  const parent = join(f.p, 'reports'), moved = join(f.p, 'reports-moved'), other = join(f.p, 'other')
  mkdirSync(parent); mkdirSync(other)
  const script = readFileSync(f.cli, 'utf8')
  const prelude = `import fixtureFs from 'node:fs'; import fixtureChild from 'node:child_process';
import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureExec = fixtureChild.execFileSync;
fixtureChild.execFileSync = (file, args, options) => {
  if (args?.[0] === '--input-type=module' && args[1] === '-e') {
    if (options.env.GH_TOKEN || options.env.GITHUB_TOKEN || options.env.NODE_OPTIONS) throw Error('credential leak');
    fixtureFs.renameSync(${JSON.stringify(parent)}, ${JSON.stringify(moved)});
    fixtureFs.symlinkSync(${JSON.stringify(other)}, ${JSON.stringify(parent)});
  }
  return fixtureExec(file, args, options);
}; fixtureSync();
`
  writeFileSync(f.cli, prelude + script)
  commitFixture(f)
  assertFailure(run(['--source-repo', f.p, '--out', join(parent, 'out')], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } }), 'OUTPUT_CHANGED')
  assert.deepEqual(readdirSync(other), []); assert.deepEqual(readdirSync(moved), [])
})

test('failed publication preserves both replacement files and replacement empty directories', () => {
  for (const replacement of ['file', 'directory']) {
    const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
    const helper = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs')
    // Force the second writer to fail, and interleave a replacement before control returns to the publisher.
    const prelude = `import fixtureFs from 'node:fs'; import fixtureChild from 'node:child_process';
import { syncBuiltinESMExports as sync } from 'node:module';
const original = fixtureChild.execFileSync;
fixtureChild.execFileSync = (file, args, options) => {
  if (!args[2]?.startsWith('// Owned-directory writes')) return original(file, args, options);
  args[2] = args[2].replace("const bytes = read(length), fd", "if (name === 'batch-report.md') throw Error(); const bytes = read(length), fd");
  const result = original(file, args, options);
  ${replacement === 'file' ?
    "fixtureFs.renameSync('out/batch-report.json', 'owned-json'); fixtureFs.writeFileSync('out/batch-report.json', 'foreign');" :
    "fixtureFs.renameSync('out', 'owned-out'); fixtureFs.mkdirSync('out');"}
  return result;
}; sync();
`
    writeFileSync(helper, prelude + readFileSync(helper, 'utf8'))
    commitFixture(f)
    const out = join(f.p, 'out')
    assertFailure(run(['--source-repo', f.p, '--out', out], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } }), 'OUTPUT_WRITE_FAILED')
    if (replacement === 'file') assert.equal(readFileSync(join(out, 'batch-report.json'), 'utf8'), 'foreign')
    else { assert.deepEqual(readdirSync(out), []); assert.deepEqual(readdirSync(join(f.p, 'owned-out')), ['batch-report.json']) }
  }
})

test('final output writes bind their own cwd identity before opening either output file', () => {
  const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
  const parent = join(f.p, 'reports'), foreign = join(f.p, 'foreign')
  mkdirSync(parent); mkdirSync(foreign); writeFileSync(join(foreign, 'keep'), 'unrelated')
  const helper = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs')
  const prelude = `import fixtureFs from 'node:fs'; import fixtureChild from 'node:child_process';
import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureExec = fixtureChild.execFileSync;
fixtureChild.execFileSync = (file, args, options) => {
  if (args[0] === '--input-type=module' && args[2].startsWith('// Owned-directory writes')) {
    fixtureFs.renameSync(options.cwd, 'owned-kept');
    fixtureFs.symlinkSync(${JSON.stringify(foreign)}, options.cwd);
  }
  return fixtureExec(file, args, options);
}; fixtureSync();
`
  writeFileSync(helper, prelude + readFileSync(helper, 'utf8'))
  commitFixture(f)
  assertFailure(run(['--source-repo', f.p, '--out', join(parent, 'out')], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } }), 'OUTPUT_WRITE_FAILED')
  assert.deepEqual(readdirSync(foreign), ['keep']); assert.equal(readFileSync(join(foreign, 'keep'), 'utf8'), 'unrelated')
  assert.deepEqual(readdirSync(join(parent, 'owned-kept')), [])
  assert.equal(existsSync(join(parent, 'out/batch-report.json')), false)
})

test('foreign staging directories are never adopted into the final output', () => {
  const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
  const parent = join(f.p, 'reports'), foreign = join(parent, '.guides-batch-report-foreign')
  mkdirSync(parent); mkdirSync(foreign); writeFileSync(join(foreign, 'keep'), 'unrelated')
  const helper = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs')
  const prelude = `import fixtureFs from 'node:fs'; import { syncBuiltinESMExports as fixtureSync } from 'node:module';
fixtureFs.mkdtempSync = () => ${JSON.stringify(foreign)};
fixtureFs.renameSync = () => { throw Error('directory adoption forbidden'); }; fixtureSync();
`
  writeFileSync(helper, prelude + readFileSync(helper, 'utf8'))
  commitFixture(f)
  const out = join(parent, 'out'), result = run(['--source-repo', f.p, '--out', out], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } })
  assert.equal(result.status, 0); assert.equal(result.stderr, '')
  assert.deepEqual(outputFiles(out), expectedFiles); assert.deepEqual(readdirSync(foreign), ['keep'])
  assert.equal(readFileSync(join(foreign, 'keep'), 'utf8'), 'unrelated')
})

test('partial and interrupted writes cannot produce successful reports or clobber a conflicting file', () => {
  for (const failure of ['short-write', 'second-write', 'conflict']) {
    const f = packagingFixture(stub(`return { ...${JSON.stringify(observed('unused'))}, tools: options.tools };`))
    const helper = join(f.p, 'scripts/docs-workflow/shared-guides-update/batch-publish.mjs')
    const attack = `import fixtureFs from 'node:fs'; import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureWrite = fixtureFs.writeFileSync; let calls = 0;
fixtureFs.writeFileSync = (fd, bytes, ...args) => {
  calls++;
  ${failure === 'short-write' ? "if (calls === 1) return fixtureWrite(fd, bytes.subarray(0, Math.floor(bytes.length / 2)), ...args);" : ''}
  ${failure === 'second-write' ? "if (calls === 2) throw Error('interrupted write');" : ''}
  const result = fixtureWrite(fd, bytes, ...args);
  ${failure === 'conflict' ? "if (calls === 1) fixtureWrite('batch-report.md', 'foreign-keep');" : ''}
  return result;
}; fixtureSync();
`
    const prelude = `import fixtureChild from 'node:child_process'; import { syncBuiltinESMExports as fixtureSync } from 'node:module';
const fixtureExec = fixtureChild.execFileSync;
fixtureChild.execFileSync = (file, args, options) => {
  if (args[2]?.startsWith('// Owned-directory writes')) args[2] = ${JSON.stringify(attack)} + args[2];
  return fixtureExec(file, args, options);
}; fixtureSync();
`
    writeFileSync(helper, prelude + readFileSync(helper, 'utf8'))
    commitFixture(f)
    const out = join(f.p, 'out')
    assertFailure(run(['--source-repo', f.p, '--out', out], { cli: f.cli, env: { GH_TOKEN: 'private-secret' } }), 'OUTPUT_WRITE_FAILED')
    if (failure === 'conflict') {
      assert.deepEqual(outputFiles(out), expectedFiles); assert.equal(readFileSync(join(out, 'batch-report.md'), 'utf8'), 'foreign-keep')
    } else if (failure === 'second-write') {
      assert.deepEqual(outputFiles(out), expectedFiles); assert.equal(readFileSync(join(out, 'batch-report.md')).length, 0)
    } else {
      assert.deepEqual(readdirSync(out), ['batch-report.json'])
      assert.throws(() => JSON.parse(readFileSync(join(out, 'batch-report.json'))))
    }
  }
})

test('credentials smuggled into structurally valid replay evidence cannot enter either artifact', () => {
  for (const token of ['private-credential-value', 'private"credential']) {
    const p = area(), input = inputFile(p, value => { value.input.pages[0].sourceFile = `site/en/${token}.md` }), out = join(p, 'out')
    assertFailure(run(['--replay', input, '--out', out], { env: { GH_TOKEN: token } }), 'REPORT_CREDENTIAL_REJECTED')
    assert.equal(existsSync(out), false)
  }
})

test('dedicated actual bundle exports only the minimal read-only contract with no optional second argument', async () => {
  const p = area(), bundle = join(p, 'contract.mjs')
  execFileSync(join(root, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
    [join(root, 'scripts/docs-workflow/shared-guides-update/batch-contract.ts'), '--bundle', '--platform=node', '--format=esm', '--target=node22', '--log-level=silent', '--outfile=' + bundle],
    { cwd: scratch, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const c = await import(pathToFileURL(bundle).href)
  assert.deepEqual(Object.keys(c).sort(), ['BatchDiscoveryInputSchema', 'BatchDiscoveryReportSchema', 'batchDiscoveryFailureCode', 'canonicalBytes', 'collectBatchDiscovery', 'discoverBatches', 'parseStrictJson'].sort())
  assert.equal(c.collectBatchDiscovery.length, 1)
  assert.equal(c.batchDiscoveryFailureCode(new Error('private-secret')), 'BATCH_DISCOVERY_FAILED')
  const out = join(p, 'report'), input = inputFile(p)
  assert.equal(run(['--replay', input, '--out', out]).status, 0)
  const bytes = readFileSync(join(out, 'batch-report.json'))
  assert.deepEqual(bytes, Buffer.from(c.canonicalBytes(c.parseStrictJson(bytes))))
})
