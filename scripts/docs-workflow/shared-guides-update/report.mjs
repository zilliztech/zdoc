// Manual read-only report entry for the json-field-overview shared update.
// Replays the #1250 offline validation against a downloaded producer archive and independently
// supplied master/dev/Milvus heads. It authenticates the archive members and reports which
// evidence is authenticated, which inputs are stale, and whether a target Check is present.
//
// Usage:
//   node scripts/docs-workflow/shared-guides-update/report.mjs <archive-dir> <master-sha> <dev-sha> <milvus-track-head-sha>
//
// No write: no Check reservation/update, no PR, no production mutation.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repo = 'zilliztech/zdoc', repoId = 660446555, page = 'json-field-overview'
const archive = process.argv[2], masterNow = process.argv[3], devNow = process.argv[4], sourceNow = process.argv[5]
if (![archive, masterNow, devNow, sourceNow].every(v => typeof v === 'string' && v.length)) {
  process.stderr.write('USAGE: report.mjs <archive-dir> <master-sha> <dev-sha> <milvus-track-head-sha>\n')
  process.exitCode = 2
  process.exit()
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const hex = v => typeof v === 'string' && /^[0-9a-f]{40}$/.test(v)

// Build the reviewed contract from this checkout (same bundle the writer uses).
const bundle = join(mkdtempSync(join(tmpdir(), 'shared-guides-report-')), 'writer-contract.mjs')
execFileSync('node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild',
  ['scripts/docs-workflow/shared-guides-update/writer-contract.ts', '--bundle', '--platform=node', '--format=esm',
    '--target=node22', '--log-level=error', '--outfile=' + bundle])
const c = await import(pathToFileURL(resolve(bundle)))
const canon = v => Buffer.from(c.canonicalBytes(v))

const planBytes = readFileSync(join(archive, 'plan.json'))
const plan = c.parseStrictJson(planBytes)
const provenance = c.parseStrictJson(readFileSync(join(archive, 'provenance.json')))
const reportName = readdirSync(join(archive, 'reports'))[0]
const reportBytes = readFileSync(join(archive, 'reports', reportName))
const report = c.parseStrictJson(reportBytes)

const authenticated = [], stale = []
const fail = message => { throw new Error(message) }

// 1. Plan canonical + digest bound to the producer provenance.
const planDigest = c.digest('plan', plan)
if (!planBytes.equals(canon(plan))) fail('PLAN_NONCANONICAL')
if (planDigest !== provenance.planSha256) fail('PLAN_DIGEST')
authenticated.push({ evidence: 'plan.json', planSha256: planDigest, matchesProvenance: true })

// 2. Report member name/path/size/SHA-256 bound to the plan reference, then canonical + validateUnitReports.
if (plan.kind !== 'shared-update-unit' || plan.subjects.length !== 1 || plan.subjects[0].pageId !== page) fail('UNIT_PAGE')
const ref = plan.reports[0]
if (ref.path !== 'blobs/' + ref.sha256) fail('REPORT_REF_PATH')
if (reportName !== ref.sha256 + '.json') fail('REPORT_MEMBER_NAME')
if (reportBytes.length !== ref.bytes) fail('REPORT_SIZE')
if (sha256(reportBytes) !== ref.sha256) fail('REPORT_DIGEST')
if (!reportBytes.equals(canon(report))) fail('REPORT_NONCANONICAL')
c.validateUnitReports(plan, [report])
authenticated.push({ evidence: reportName, sha256: ref.sha256, bytes: reportBytes.length, canonical: true, validated: true })

// 3. Producer provenance members (the six-member bundle) and its seal binding.
const names = new Set(['provenance.json'])
for (const member of provenance.members) {
  if (names.has(member.name)) fail('BUNDLE_DUPLICATE')
  names.add(member.name)
  const bytes = readFileSync(join(archive, member.name))
  if (bytes.length !== member.bytes || sha256(bytes) !== member.sha256) fail('BUNDLE_DIGEST ' + member.name)
}
authenticated.push({ evidence: 'provenance.json', members: provenance.members.length, runId: provenance.runId, runAttempt: provenance.runAttempt, requestId: provenance.requestId, workflowDefinitionSha256: provenance.workflowDefinitionSha256, seal: provenance.seal, master: provenance.master, dev: provenance.dev, unitKey: provenance.unitKey, planSha256: provenance.planSha256 })

// 4. Pilot freshness: report pins vs independently observed heads.
const pins = { master: report.pins.master, dev: report.pins.dev, source: report.pins.source.observedTrackHead }
const observed = { master: masterNow, dev: devNow, source: sourceNow }
for (const field of ['master', 'dev', 'source']) {
  if (pins[field] !== observed[field]) stale.push({ field, expected: pins[field], observed: observed[field] })
}

// 5. Target Check: this report-only entry never reserves or completes a Check.
const check = { status: 'none', reserved: false, published: false, reason: 'report-only entry does not write Checks' }

const result = {
  repository: repo, repositoryId: repoId, page,
  producer: { runId: provenance.runId, runAttempt: provenance.runAttempt, event: 'schedule', seal: provenance.seal, workflowDefinitionSha256: provenance.workflowDefinitionSha256 },
  authenticatedEvidence: authenticated,
  freshness: { pins, observed },
  staleReasons: stale.map(s => 'STALE_' + s.field.toUpperCase()),
  stale,
  check,
  summary: stale.length
    ? `HOLD: ${stale.map(s => s.field).join(', ')} moved (${stale.map(s => s.expected + ' -> ' + s.observed).join('; ')})`
    : 'FRESH: all pins match the observed heads'
}
process.stdout.write(JSON.stringify(result, null, 2) + '\n')
