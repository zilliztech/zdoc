// Standalone read-only discovery. Neither mode grants publication or collector qualification.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { constants, openSync, closeSync, readSync, fstatSync, lstatSync, realpathSync, readdirSync,
  mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { basename, dirname, join, resolve, parse, relative, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')
const INPUT_LIMIT = 1024 * 1024, OUTPUT_LIMIT = 16 * 1024 * 1024
const oid = /^[0-9a-f]{40}$/
class Diagnostic extends Error {}
const fail = code => { throw new Diagnostic(code) }
const fixed = (code, operation) => { try { return operation() } catch (error) { if (error instanceof Diagnostic) throw error; fail(code) } }
const hash = value => createHash('sha256').update(value).digest('hex')
const same = (a, b) => a.dev === b.dev && a.ino === b.ino

function args(argv) {
  if (argv.length !== 4 || !['--source-repo', '--replay'].includes(argv[0]) || argv[2] !== '--out' ||
      !argv[1] || !argv[3] || argv[1].startsWith('--') || argv[3].startsWith('--') || argv.some(v => v.includes('\0'))) {
    process.stderr.write('USAGE: batch-report.mjs --source-repo <existing-local-store> --out <empty-directory> | --replay <fixture-json> --out <empty-directory>\n')
    return null
  }
  return { replay: argv[0] === '--replay', input: resolve(argv[1]), output: resolve(argv[3]) }
}

// Reject links in every component, including links to otherwise regular files/directories.
function pathStamp(path, allowAbsent = false) {
  const root = parse(path).root
  let cursor = root, info = lstatSync(root)
  for (const part of path.slice(root.length).split(sep).filter(Boolean)) {
    if (!info.isDirectory()) fail('UNSAFE_PATH')
    cursor = join(cursor, part)
    try { info = lstatSync(cursor) } catch (error) {
      if (allowAbsent && cursor === path && error.code === 'ENOENT') return null
      throw error
    }
    if (info.isSymbolicLink()) fail('UNSAFE_PATH')
  }
  return info
}

function readFixture(path) {
  return fixed('REPLAY_INPUT_INVALID', () => {
    const before = pathStamp(path)
    const fd = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK | constants.O_NOFOLLOW)
    try {
      const opened = fstatSync(fd)
      if (!opened.isFile() || !same(before, opened)) fail('REPLAY_INPUT_INVALID')
      if (opened.size > INPUT_LIMIT) fail('REPLAY_INPUT_LIMIT')
      const bytes = Buffer.alloc(INPUT_LIMIT + 1)
      let length = 0
      while (length < bytes.length) {
        const count = readSync(fd, bytes, length, bytes.length - length, length)
        if (!count) break
        length += count
      }
      if (length > INPUT_LIMIT) fail('REPLAY_INPUT_LIMIT')
      const after = fstatSync(fd)
      if (!same(opened, after) || opened.size !== after.size || opened.mtimeMs !== after.mtimeMs || opened.ctimeMs !== after.ctimeMs) fail('REPLAY_INPUT_CHANGED')
      return bytes.subarray(0, length)
    } finally { closeSync(fd) }
  })
}

function preflightOutput(path) {
  return fixed('OUTPUT_UNSAFE', () => {
    const parent = dirname(path), parentInfo = pathStamp(parent)
    if (!parentInfo.isDirectory() || path === parse(path).root) fail('OUTPUT_UNSAFE')
    const info = pathStamp(path, true)
    if (info && (!info.isDirectory() || readdirSync(path).length)) fail('OUTPUT_UNSAFE')
    return { path, parent, parentInfo, info }
  })
}

// Build without tokens or ambient Git configuration. Tool identity is independent of data M/D/T.
function toolEnvironment() {
  return { PATH: process.env.PATH, LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_ALLOW_PROTOCOL: '', GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' }
}
function toolCommit() {
  return fixed('TOOLS_IDENTITY_UNAVAILABLE', () => {
    const value = execFileSync('git', ['--no-replace-objects', '-C', repoRoot, 'rev-parse', '--verify', 'HEAD^{commit}'],
      { env: toolEnvironment(), encoding: 'utf8', timeout: 30_000, maxBuffer: 4096, stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    if (!oid.test(value)) fail('TOOLS_IDENTITY_UNAVAILABLE')
    return value
  })
}
// This function also runs in the isolated builder. Give esbuild the exact bytes checked against Git.
function verifiedBytes(root, tools, path, env) {
  const name = relative(root, path)
  if (!name || name.startsWith('..') || realpathSync(path) !== path) throw Error()
  const bytes = readFileSync(path)
  const committed = execFileSync('git', ['--no-replace-objects', '-C', root, 'cat-file', 'blob', tools + ':' + name],
    { env, timeout: 5000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
  if (!bytes.equals(committed)) throw Error()
  return bytes
}

// Isolate esbuild and its service from observation credentials. Third-party dependencies
// resolve from the existing installation; every first-party module goes through verifiedBytes.
async function buildContract() {
  const { build } = require('./node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild')
  const { extname, sep } = require('node:path')
  const [tools, entry, outfile] = process.argv.slice(1), root = process.cwd()
  const deps = realpathSync('node_modules') + sep
  let identityFailed = false
  try {
    await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', target: 'node22',
      logLevel: 'silent', outfile, tsconfigRaw: {}, preserveSymlinks: true, plugins: [{ name: 'committed-inputs', setup(build) {
        build.onLoad({ filter: /.*/ }, ({ path }) => {
          if (path.split(sep).includes('node_modules') && realpathSync(path).startsWith(deps)) return
          try {
            const contents = verifiedBytes(root, tools, path, process.env)
            return { contents, loader: extname(path).slice(1) }
          } catch { identityFailed = true; throw Error() }
        })
      } }] })
  } catch { process.exitCode = identityFailed ? 2 : 1 }
}
async function contract(tools) {
  const checked = path => fixed('TOOLS_IDENTITY_UNAVAILABLE', () => verifiedBytes(repoRoot, tools, path, toolEnvironment()))
  checked(fileURLToPath(import.meta.url))
  const publisher = checked(join(moduleRoot, 'batch-publish.mjs')).toString('utf8')
  const directory = fixed('TOOL_BUILD_FAILED', () => mkdtempSync(join(realpathSync(tmpdir()), 'guides-batch-tool-')))
  try {
    const bundle = join(directory, 'batch-contract.mjs')
    const program = `const { readFileSync, realpathSync } = require('node:fs');
      const { relative } = require('node:path'); const { execFileSync } = require('node:child_process');
      ${verifiedBytes.toString()}
(${buildContract.toString()})().catch(() => { process.exitCode = 1 });`
    try {
      execFileSync(process.execPath, ['--input-type=commonjs', '-e', program, tools, join(moduleRoot, 'batch-contract.ts'), bundle],
        { cwd: repoRoot, env: toolEnvironment(), timeout: 30_000, maxBuffer: 4096, stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (error) { fail(error.status === 2 ? 'TOOLS_IDENTITY_UNAVAILABLE' : 'TOOL_BUILD_FAILED') }
    try { return { c: await import(pathToFileURL(bundle).href), publisher } } catch { fail('TOOL_BUILD_FAILED') }
  } finally { rmSync(directory, { recursive: true, force: true }) }
}

function replayReport(c, bytes, tools) {
  return fixed('REPLAY_FIXTURE_INVALID', () => {
    const fixture = c.parseStrictJson(bytes)
    if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture) ||
        Object.keys(fixture).sort().join(',') !== 'input,provenance' ||
        !fixture.provenance || typeof fixture.provenance !== 'object' || Array.isArray(fixture.provenance)) fail('REPLAY_FIXTURE_INVALID')
    const input = c.BatchDiscoveryInputSchema.parse(fixture.input)
    if (input.observation !== 'replay') fail('REPLAY_FIXTURE_INVALID')
    return { report: c.discoverBatches({ ...input, tools }), fixture: { sha256: hash(bytes), tools: input.tools } }
  })
}

function markdown(report, fixture) {
  const lines = ['# Guides batch discovery', '',
    'Direct source mappings and dependency clues awaiting collector validation.', '',
    `Observation: **${report.observation}**. Status: **${report.status}**. **writeEligible: false**.`, '',
    'Every group has pending-collector closure. This report grants no publication authority or final independence conclusion.', '',
    'Published inventory describes committed snapshot, ownership and target-file evidence; full Fetch receipt qualification is deferred.', '',
    `Tools: ${report.tools}`, '', `M: ${report.pins.master}`, `D: ${report.pins.dev}`, `T: ${report.pins.source}`, '',
    `Inventory: ${report.inventory.configured} configured; ${report.inventory.active} active; ${report.inventory.published} published; ` +
      `${report.inventory.activeUnknown} active unknown; ${report.inventory.publishedUnknown} published unknown.`, '']
  if (fixture) lines.push('Replay uses historical fixture assertions, without live ref or lifecycle authentication. The fixture may contain an open PR and only a partial lock-to-target delta; the report retains every resulting hold reason.', '',
    `Fixture SHA-256: ${fixture.sha256}`, `Fixture-declared tools: ${fixture.tools}; tools above identify this CLI checkout.`, '',
    'Raw fixture provenance is not rendered. Its bytes are bound by the fixture digest; JSON contains the complete validated discovery evidence.', '')
  lines.push('Reasons: ' + (report.reasons.join(', ') || 'none') + '.', '',
    `Groups: ${report.groups.length}. Full page intervals, changed paths, unmapped/deleted/renamed paths, seeds, dependency clues and evidence references are in [batch-report.json](batch-report.json).`, '')
  for (const group of report.groups) lines.push(`- ${group.id}: ${group.pageIds.join(', ')}; seeds: ${group.seedKeys.join(', ') || 'none'}; closure: pending-collector.`,
    `  Reasons: ${group.reasons.join(', ') || 'none'}.`)
  return Buffer.from(lines.join('\n') + '\n')
}

function publish(state, json, md, publisher) {
  if (json.length > OUTPUT_LIMIT || md.length > OUTPUT_LIMIT) fail('REPORT_OUTPUT_LIMIT')
  const identity = info => info ? { dev: info.dev, ino: info.ino } : null
  const metadata = Buffer.from(JSON.stringify({ parent: state.parent, target: basename(state.path),
    parentIdentity: identity(state.parentInfo), targetIdentity: identity(state.info), jsonBytes: json.length, markdownBytes: md.length }))
  const header = Buffer.alloc(4); header.writeUInt32BE(metadata.length)
  try {
    // Child cwd is a kernel-held directory reference. The helper binds its identity before
    // any write and never resolves an absolute pathname for a filesystem mutation.
    execFileSync(process.execPath, ['--input-type=module', '-e', publisher], { cwd: state.parent,
      env: toolEnvironment(), input: Buffer.concat([header, metadata, json, md]),
      timeout: 30_000, maxBuffer: 4096, stdio: ['pipe', 'pipe', 'pipe'] })
  } catch (error) {
    const code = error.stderr?.toString()
    fail(code === 'OUTPUT_CHANGED\n' ? 'OUTPUT_CHANGED' : 'OUTPUT_WRITE_FAILED')
  }
}

async function main() {
  const options = args(process.argv.slice(2))
  if (!options) { process.exitCode = 2; return }
  const output = preflightOutput(options.output)
  const bytes = options.replay ? readFixture(options.input) : null
  if (!options.replay && !process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) fail('GITHUB_CREDENTIAL_REQUIRED')
  const tools = toolCommit(), { c, publisher } = await contract(tools)
  let result
  if (options.replay) result = replayReport(c, bytes, tools)
  else {
    try { result = { report: await c.collectBatchDiscovery({ zdocRepository: repoRoot, sourceRepository: options.input, tools }) } }
    catch (error) {
      // Classifier recognizes only adapter-owned diagnostic objects; never echo exception text.
      const code = c.batchDiscoveryFailureCode(error)
      fail(/^[A-Z][A-Z0-9_]{0,127}$/.test(code) ? code : 'BATCH_DISCOVERY_FAILED')
    }
  }
  const report = fixed('REPORT_INVALID', () => c.BatchDiscoveryReportSchema.parse(result.report))
  if (report.observation !== (options.replay ? 'replay' : 'observed') || report.tools !== tools || report.writeEligible !== false) fail('REPORT_INVALID')
  // Reject secret-bearing strings before JSON escaping can obscure their literal bytes.
  const tokens = [process.env.GH_TOKEN, process.env.GITHUB_TOKEN].filter(Boolean)
  const inspect = value => {
    if (typeof value === 'string' && tokens.some(token => value.includes(token))) fail('REPORT_CREDENTIAL_REJECTED')
    if (value && typeof value === 'object') for (const child of Object.values(value)) inspect(child)
  }
  inspect(report)
  // Serialize only after safe output preflight; reject oversized reports before publication.
  const json = fixed('REPORT_INVALID', () => c.canonicalBytes(report)), md = markdown(report, result.fixture)
  // Fixture text and upstream path claims are untrusted, even after structural validation.
  for (const token of tokens) {
    if (Buffer.from(json).includes(Buffer.from(token)) || md.includes(Buffer.from(token))) fail('REPORT_CREDENTIAL_REJECTED')
  }
  publish(output, json, md, publisher)
  process.exitCode = report.status === 'held' ? 1 : 0
}

main().catch(error => {
  process.stderr.write((error instanceof Diagnostic ? error.message : 'BATCH_REPORT_FAILED') + '\n')
  process.exitCode = 1
})
