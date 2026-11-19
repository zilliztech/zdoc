#!/usr/bin/env node
'use strict'

// Shared-docs pin-drift and variant-health watchdog core. Read-only: it compares
// the track head with each lock pin, reports drift, and audits adopted variants
// against the live upstream pull-request state. Nothing here writes locks or
// variants: pins move only through reviewed re-pin PRs and reconciliation stays
// a deliberate human step.
//
// Both layouts are audited. Page-layout groups (shared-docs/<group>/pages/) are
// scanned page by page; manual-layout groups (shared-docs/<group>/manual.yaml)
// are audited as one manual: group lock pins, the upstream source directory, and
// the cloud_pages content references. Declared transform targets are additionally
// asserted against the upstream head (WP-3b third layer), which also covers
// reserved named markers that have no content wired yet.

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const {loadTypeScript} = require('../lib/load-typescript')

const core = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'shared-docs', 'core')
const {parsePageConfig, parseSourceConfig} = loadTypeScript(path.join(core, 'config.ts'))
const {parseLock} = loadTypeScript(path.join(core, 'lock.ts'))
const {parseVariants, variantFileName, variantSidecarName} = loadTypeScript(path.join(core, 'variants.ts'))
// Reuse the build's own manual-input reader so the watchdog audits exactly what
// the build would consume, including cloud_pages path safety.
const {readManualSharedDocs} = loadTypeScript(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'shared-docs', 'commands', 'build.ts'))
const manualRegistry = loadTypeScript(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'manuals', 'registry.ts')).manualRegistry
const {DOC_HEADING_TAGS} = loadTypeScript(path.join(__dirname, '..', '..', 'packages', 'docs-ui', 'src', 'shared', 'utils', 'docHeadingTags.ts'))

function git(repo, ...args) {
  try { return execFileSync('git', ['-C', repo, ...args], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024}) }
  catch (error) { return null }
}

function fail(message) { throw new Error(message) }

function defaultFetchPullState(repository, pull) {
  const result = execFileSync('gh', ['api', `repos/${repository}/pulls/${pull}`,
    '--jq', '{state: .state, merged: .merged, head: .head.sha}'], {encoding: 'utf8', maxBuffer: 1024 * 1024})
  const state = JSON.parse(result)
  if (!['open', 'closed'].includes(state.state) || typeof state.head !== 'string') fail(`Unexpected pull request state for #${pull}`)
  return state
}

/** Wire live upstream pull-request reads from the group's source repository.
 *  Returns undefined for a non-GitHub repository; callers must say so out loud. */
function resolveFetchPullState(sharedDocsRoot) {
  const source = parseSourceConfig(fs.readFileSync(path.join(sharedDocsRoot, 'source.yaml'), 'utf8'), {})
  if ('errors' in source) fail(`Cannot audit variant pull-request state: ${JSON.stringify(source.errors)}`)
  const match = /^https:\/\/github\.com\/([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(source.config.repository)
  if (!match) return undefined
  const repository = `${match[1]}/${match[2]}`
  return pull => defaultFetchPullState(repository, pull)
}

function diffSummary(left, right) {
  const leftLines = left.split('\n'), rightLines = right.split('\n')
  const counts = new Map()
  for (const line of leftLines) counts.set(line, (counts.get(line) || 0) - 1)
  for (const line of rightLines) counts.set(line, (counts.get(line) || 0) + 1)
  let changed = 0
  for (const value of counts.values()) changed += Math.abs(value)
  return {variantLines: leftLines.length, upstreamLines: rightLines.length, changedLines: changed}
}

function pageReport({name, repositoryRoot, upstreamRepo, headSha, fetchPullState}) {
  const pageDirectory = path.join(repositoryRoot, 'pages', name)
  const location = {file: `pages/${name}/page.yaml`, page: name, channel: 'both'}
  const context = {manuals: manualRegistry.map(manual => manual.id), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC')}
  const entry = {page: name, drifted: [], variant: null}
  const readConfig = name_ => { try { return fs.readFileSync(path.join(pageDirectory, name_), 'utf8') } catch { return undefined } }
  const pageYaml = readConfig('page.yaml'), lockYaml = readConfig('lock.yaml')
  const errors = []
  if (pageYaml === undefined || lockYaml === undefined) {
    return {page: name, error: `missing ${pageYaml === undefined ? 'page.yaml' : 'lock.yaml'}`}
  }
  const source = parseSourceConfig(fs.readFileSync(path.join(repositoryRoot, 'source.yaml'), 'utf8'), location)
  const config = parsePageConfig(name, pageYaml, {...context, ...location})
  const lock = parseLock(lockYaml, {...location, file: `pages/${name}/lock.yaml`})
  for (const parsed of [source, config, lock]) if ('errors' in parsed) errors.push(...parsed.errors)
  if (errors.length) return {page: name, errors: errors.map(error => `${error.code}: ${error.message}`)}
  const sourceFile = config.config.source.file
  if (git(upstreamRepo, 'cat-file', '-e', `${headSha}:${sourceFile}`) === null) entry.pinIssue = 'UPSTREAM_FILE_MISSING'
  for (const channel of ['current', 'next']) {
    if (git(upstreamRepo, 'merge-base', '--is-ancestor', lock.lock[channel], headSha) === null) {
      entry.pinIssue = entry.pinIssue === 'UPSTREAM_FILE_MISSING' ? entry.pinIssue : 'PIN_OFF_BRANCH'
    }
  }
  const log = git(upstreamRepo, 'log', '--format=%H %s', `${lock.lock.next}..${headSha}`, '--', sourceFile)
  entry.drifted = (log || '').trim().split('\n').filter(Boolean)
  // WP-3b third layer: every transform target declared in page.yaml must still be a
  // named block at the upstream head. Upstream deletions of markers are otherwise
  // silent for reserved targets that have no content wired yet. An unreadable
  // source blob (lazy fetch on a blobless clone) never silently passes: it is
  // reported as informational-unverified so the next run must still see the marker.
  const declaredTargets = [...new Set((config.config.transforms ?? []).map(transform => transform.target?.block).filter(Boolean))]
  if (declaredTargets.length) {
    const upstreamBytes = git(upstreamRepo, 'show', `${headSha}:${sourceFile}`)
    if (upstreamBytes === null) entry.transformIssue = 'TRANSFORM_TARGET_UNVERIFIED'
    else if (declaredTargets.some(block => !upstreamBytes.includes(`doc:block:start id="${block}"`))) {
      entry.transformIssue = 'TRANSFORM_TARGET_MISSING'
    }
  }
  const rawVariants = {}
  for (const channel of ['current', 'next']) {
    const text = readConfig(variantFileName(channel)), provenanceText = readConfig(variantSidecarName(channel))
    if (text !== undefined) rawVariants[channel] = {text, provenanceText: provenanceText ?? ''}
    else if (provenanceText !== undefined) entry.variantIssue = 'VARIANT_SIDECAR_ORPHAN'
  }
  const parsedVariants = parseVariants(Object.keys(rawVariants).length ? rawVariants : undefined, location)
  if ('errors' in parsedVariants) entry.variantIssue = entry.variantIssue ?? 'VARIANT_INVALID'
  if (Object.keys(rawVariants).length) {
    entry.variant = {channels: Object.keys(parsedVariants.errors ? rawVariants : parsedVariants.variants), issues: []}
    if ('errors' in parsedVariants) {
      entry.variant.issues.push({code: 'VARIANT_INVALID', severity: 'unhealthy', message: JSON.stringify(parsedVariants.errors)})
    } else {
      for (const [channel, variant] of Object.entries(parsedVariants.variants)) {
        let state
        try { state = fetchPullState ? fetchPullState(variant.provenance.pull) : undefined }
        catch (error) {
          entry.variant.issues.push({code: 'VARIANT_STATE_UNAVAILABLE', severity: 'unhealthy',
            message: `pull #${variant.provenance.pull}: ${error instanceof Error ? error.message : String(error)}`})
          continue
        }
        if (!state) continue
        if (state.head !== variant.provenance.head_sha) {
          entry.variant.issues.push({code: 'PR_HEAD_MOVED', severity: 'info',
            message: `pull #${variant.provenance.pull} moved from ${variant.provenance.head_sha.slice(0, 12)} to ${state.head.slice(0, 12)}; re-adoption is available`})
        }
        if (state.merged) {
          const upstreamBytes = git(upstreamRepo, 'show', `${headSha}:${sourceFile}`)
          const marker = upstreamBytes === null ? 'upstream file missing at head'
            : JSON.stringify(diffSummary(variant.text, upstreamBytes))
          entry.variant.issues.push({code: 'RECONCILIATION_PENDING', severity: 'info',
            message: `pull #${variant.provenance.pull} merged; delete the variants and re-pin (${marker})`})
        } else if (state.state === 'closed') {
          entry.variant.issues.push({code: 'PR_CLOSED', severity: 'info',
            message: `pull #${variant.provenance.pull} closed without merging; retire the variant or adopt a different source`})
        }
      }
    }
  }
  return entry
}

/** Manual-layout audit: one whole-manual entry per group. Configuration errors
 *  (including cloud_pages content references, validated with the build's own
 *  reader) count as errors; pins off the tracking branch and a vanished upstream
 *  source directory are unhealthy; plain drift is informational. */
async function manualScan({sharedDocsRoot, upstreamRepo, headSha}) {
  const loaded = await readManualSharedDocs(sharedDocsRoot)
  const report = {schemaVersion: '1.0', layout: 'manual', group: path.basename(sharedDocsRoot), manual: undefined,
    generatedOn: new Date().toISOString(), head: headSha, drifted: [], issues: []}
  if ('errors' in loaded) {
    report.errors = loaded.errors.map(error => `${error.code}: ${error.message}`)
    return report
  }
  report.manual = loaded.manualConfig.publish.manual
  const sourceDir = loaded.manualConfig.source.dir
  if (git(upstreamRepo, 'cat-file', '-e', `${headSha}:${sourceDir}`) === null) {
    report.issues.push({code: 'UPSTREAM_SOURCE_DIR_MISSING', severity: 'unhealthy',
      message: `source.dir ${sourceDir} is missing at the upstream head`})
  }
  for (const [channel, commit] of [['current', loaded.lock.current], ['next', loaded.lock.next]]) {
    // One unhealthy entry for the whole manual, matching the page layout's single pinIssue.
    if (git(upstreamRepo, 'merge-base', '--is-ancestor', commit, headSha) === null
      && !report.issues.some(issue => issue.code === 'PIN_OFF_BRANCH')) {
      report.issues.push({code: 'PIN_OFF_BRANCH', severity: 'unhealthy',
        message: `locked ${channel} ${commit} is missing from or off the tracking branch`})
    }
  }
  if (!report.issues.some(issue => issue.code === 'UPSTREAM_SOURCE_DIR_MISSING' || issue.code === 'PIN_OFF_BRANCH')) {
    const log = git(upstreamRepo, 'log', '--format=%H %s', `${loaded.lock.next}..${headSha}`, '--', sourceDir)
    report.drifted = (log || '').trim().split('\n').filter(Boolean)
  }
  // WP-3b third layer, manual layout: every transform target declared in manual.yaml must
  // still be a named block at the upstream head, mirroring the pages-layout audit. The
  // manual has no per-page entries, so each transformed page's bytes are read at the head.
  const declaredTargets = new Map()
  for (const [key, rules] of Object.entries(loaded.manualConfig.transforms ?? {})) {
    for (const rule of rules) {
      const block = rule?.target?.block
      if (block && !declaredTargets.get(key)?.includes(block)) {
        if (!declaredTargets.has(key)) declaredTargets.set(key, [])
        declaredTargets.get(key).push(block)
      }
    }
  }
  if (declaredTargets.size && !report.issues.some(issue => issue.severity === 'unhealthy')) {
    for (const [key, blocks] of [...declaredTargets.entries()].sort()) {
      const bytes = git(upstreamRepo, 'show', `${headSha}:${sourceDir}/${key}`)
      if (bytes === null) {
        report.issues.push({code: 'TRANSFORM_TARGET_UNVERIFIED', severity: 'info',
          message: `Cannot read upstream file ${key} at the head (lazy clone); transform targets stay unverified`})
        continue
      }
      const missing = blocks.filter(block => !bytes.includes(`doc:block:start id="${block}"`))
      if (missing.length) {
        report.issues.push({code: 'TRANSFORM_TARGET_MISSING', severity: 'unhealthy',
          message: `Transform target(s) ${missing.join(', ')} missing from ${key} at the upstream head`})
      }
    }
  }
  return report
}

function summarize(report, driftCount) {
  const unhealthyCount = report.layout === 'manual'
    ? report.issues.filter(issue => issue.severity === 'unhealthy').length
    : report.pages.filter(page => page.pinIssue || page.transformIssue === 'TRANSFORM_TARGET_MISSING'
      || page.variant?.issues.some(issue => issue.severity === 'unhealthy')).length
  const errors = report.layout === 'manual'
    ? (report.errors?.length ?? 0)
    : report.pages.filter(page => page.error || page.errors?.length).length
  const digest = crypto.createHash('sha256').update(JSON.stringify({
    drifted: report.layout === 'manual'
      ? report.drifted
      : report.pages.filter(page => page.drifted?.length).map(page => ({page: page.page, commits: page.drifted})),
    transformIssues: report.layout === 'manual' ? [] : report.pages.filter(page => page.transformIssue)
      .map(page => ({page: page.page, issue: page.transformIssue})),
    variantIssues: report.layout === 'manual'
      ? report.issues.map(issue => issue.code)
      : report.pages.filter(page => page.variant?.issues.length).map(page => ({page: page.page, issues: page.variant.issues.map(issue => issue.code)})),
  })).digest('hex')
  report.summary = {scannedPages: report.layout === 'manual' ? 1 : report.pages.length,
    driftedCount: driftCount, unhealthyCount, pendingReconciliationCount: report.layout === 'manual' ? 0
      : report.pages.filter(page => page.variant?.issues.some(issue => issue.code === 'RECONCILIATION_PENDING')).length,
    errorCount: errors, diffDigest: digest}
}

/** Full read-only scan of one group. `fetchPullState` is injectable for hermetic tests. */
async function scan({sharedDocsRoot, upstreamRepo, headSha, fetchPullState}) {
  if (!fs.existsSync(path.join(sharedDocsRoot, 'source.yaml'))) fail(`Missing shared-docs group root: ${sharedDocsRoot}`)
  const head = (git(upstreamRepo, 'rev-parse', headSha) || '').trim()
  if (!/^[a-f0-9]{40}$/.test(head)) fail(`Upstream head is unavailable in the audit clone: ${headSha}`)
  let report
  if (fs.existsSync(path.join(sharedDocsRoot, 'manual.yaml'))) {
    report = await manualScan({sharedDocsRoot, upstreamRepo, headSha: head})
    summarize(report, report.drifted.length ? 1 : 0)
  } else if (fs.existsSync(path.join(sharedDocsRoot, 'pages'))) {
    const pages = fs.readdirSync(path.join(sharedDocsRoot, 'pages'), {withFileTypes: true})
      .filter(entry => entry.isDirectory() && !entry.isSymbolicLink()).map(entry => entry.name).sort()
    report = {schemaVersion: '1.0', layout: 'pages', group: path.basename(sharedDocsRoot),
      generatedOn: new Date().toISOString(), head, pages: []}
    for (const name of pages) report.pages.push(await pageReport({name, repositoryRoot: sharedDocsRoot, upstreamRepo, headSha: head, fetchPullState}))
    summarize(report, report.pages.filter(page => page.drifted?.length).length)
  } else {
    fail(`Unsupported shared-docs layout for ${sharedDocsRoot}: neither manual.yaml nor pages/ is present`)
  }
  return report
}

function manualMarkdown(report) {
  const lines = [`## Shared-docs pin drift (${report.group} manual ${report.manual ?? '(invalid config)'}, head ${report.head.slice(0, 12)})`, '',
    `Drifted: ${report.summary.driftedCount}; unhealthy: ${report.summary.unhealthyCount}; pending reconciliation: 0; errors: ${report.summary.errorCount}`,
    `diffDigest: \`${report.summary.diffDigest}\``, '']
  const notes = [...(report.errors ?? []), ...report.issues.map(issue => `${issue.severity}: ${issue.message}`),
    ...report.drifted.map(commit => `drift: ${commit}`)]
  if (notes.length) lines.push(`- **${report.manual ?? report.group}**: ${notes.join('; ')}`)
  else lines.push('- No drift, unhealthy pins or configuration errors.')
  return lines.join('\n') + '\n'
}

function renderMarkdown(report) {
  if (report.layout === 'manual') return manualMarkdown(report)
  const lines = [`## Shared-docs pin drift (${report.group}, ${report.summary.scannedPages} pages, head ${report.head.slice(0, 12)})`, '',
    `Drifted: ${report.summary.driftedCount}; unhealthy: ${report.summary.unhealthyCount}; pending reconciliation: ${report.summary.pendingReconciliationCount}; errors: ${report.summary.errorCount}`,
    `diffDigest: \`${report.summary.diffDigest}\``, '']
  for (const page of report.pages) {
    const notes = []
    if (page.error) notes.push(page.error)
    if (page.errors?.length) notes.push(...page.errors)
    if (page.pinIssue) notes.push(page.pinIssue)
    if (page.transformIssue) notes.push(page.transformIssue)
    for (const commit of page.drifted || []) notes.push(`drift: ${commit}`)
    for (const issue of page.variant?.issues || []) notes.push(`${issue.severity}: ${issue.message}`)
    if (notes.length) {
      lines.push(`- **${page.page}**: ${notes.join('; ')}`)
    }
  }
  if (lines.length === 5) lines.push('- No drift, unhealthy pins, transform targets or variant issues.')
  return lines.join('\n') + '\n'
}

function watchdogCardStatus(report) {
  return report.summary.unhealthyCount === 0 && report.summary.errorCount === 0 ? 'success' : 'fail'
}

async function main(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index]
    if (key === '--shared-docs') options.sharedDocsRoot = argv[++index]
    else if (key === '--upstream') options.upstreamRepo = argv[++index]
    else if (key === '--head') options.headSha = argv[++index]
    else if (key === '--out') options.out = argv[++index]
    else fail(`Unknown argument: ${key}`)
  }
  for (const required of ['sharedDocsRoot', 'upstreamRepo', 'headSha', 'out']) {
    if (!options[required]) fail(`Missing required argument: --${required.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`)
  }
  const fetchPullState = resolveFetchPullState(options.sharedDocsRoot)
  if (!fetchPullState) {
    console.warn('[pin-drift] variant pull-request state audit is disabled: the source repository is not a github.com HTTPS URL')
  } else options.fetchPullState = fetchPullState
  const report = await scan(options)
  fs.mkdirSync(options.out, {recursive: true})
  fs.writeFileSync(path.join(options.out, 'watchdog-report.json'), JSON.stringify(report, null, 2) + '\n')
  fs.writeFileSync(path.join(options.out, 'watchdog-report.md'), renderMarkdown(report))
  console.log(JSON.stringify(report.summary))
  return 0
}

if (require.main === module) main(process.argv.slice(2)).catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})

module.exports = {scan, renderMarkdown, watchdogCardStatus, main, resolveFetchPullState}
