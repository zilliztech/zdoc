// Standalone read-only discovery. Neither mode grants publication or collector qualification.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { constants, openSync, closeSync, readSync, fstatSync, lstatSync, realpathSync, readdirSync,
  mkdtempSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { dirname, join, resolve, parse, sep } from 'node:path'
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

function verifyOutput(state) {
  const parent = pathStamp(state.parent), now = pathStamp(state.path, true)
  if (!same(parent, state.parentInfo) || Boolean(now) !== Boolean(state.info) ||
      now && (!same(now, state.info) || !now.isDirectory() || readdirSync(state.path).length)) fail('OUTPUT_CHANGED')
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
async function contract() {
  const directory = fixed('TOOL_BUILD_FAILED', () => mkdtempSync(join(realpathSync(tmpdir()), 'guides-batch-tool-')))
  try {
    const bundle = join(directory, 'batch-contract.mjs')
    fixed('TOOL_BUILD_FAILED', () => execFileSync(
      join(repoRoot, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
      [join(moduleRoot, 'batch-contract.ts'), '--bundle', '--platform=node', '--format=esm', '--target=node22', '--log-level=silent', '--outfile=' + bundle],
      { env: toolEnvironment(), timeout: 30_000, maxBuffer: 4096, stdio: ['ignore', 'pipe', 'pipe'] }))
    try { return await import(pathToFileURL(bundle).href) } catch { fail('TOOL_BUILD_FAILED') }
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

function publish(state, json, md) {
  if (json.length > OUTPUT_LIMIT || md.length > OUTPUT_LIMIT) fail('REPORT_OUTPUT_LIMIT')
  fixed('OUTPUT_WRITE_FAILED', () => {
    verifyOutput(state)
    const staging = mkdtempSync(join(state.parent, '.guides-batch-report-'))
    try {
      writeFileSync(join(staging, 'batch-report.json'), json, { flag: 'wx', mode: 0o600 })
      writeFileSync(join(staging, 'batch-report.md'), md, { flag: 'wx', mode: 0o600 })
      // Only a fully written, bounded pair is published. rename refuses a nonempty destination.
      verifyOutput(state)
      renameSync(staging, state.path)
    } finally { rmSync(staging, { recursive: true, force: true }) }
  })
}

async function main() {
  const options = args(process.argv.slice(2))
  if (!options) { process.exitCode = 2; return }
  const output = preflightOutput(options.output)
  const bytes = options.replay ? readFixture(options.input) : null
  if (!options.replay && !process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) fail('GITHUB_CREDENTIAL_REQUIRED')
  const tools = toolCommit(), c = await contract()
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
  publish(output, json, md)
  process.exitCode = report.status === 'held' ? 1 : 0
}

main().catch(error => {
  process.stderr.write((error instanceof Diagnostic ? error.message : 'BATCH_REPORT_FAILED') + '\n')
  process.exitCode = 1
})
