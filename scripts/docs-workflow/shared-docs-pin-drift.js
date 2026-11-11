#!/usr/bin/env node
'use strict'

// Shared-docs pin-drift and variant-health watchdog core. Read-only: for every
// shared page it compares the track head with each lock pin, reports drift, and
// audits adopted variants against the live upstream pull-request state. Nothing
// here writes locks or variants: pins move only through reviewed re-pin PRs and
// reconciliation stays a deliberate human step.

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const {loadTypeScript} = require('../lib/load-typescript')

const core = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'shared-docs', 'core')
const {parsePageConfig, parseSourceConfig} = loadTypeScript(path.join(core, 'config.ts'))
const {parseLock} = loadTypeScript(path.join(core, 'lock.ts'))
const {parseVariants, variantFileName, variantSidecarName} = loadTypeScript(path.join(core, 'variants.ts'))
const manualRegistry = loadTypeScript(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'manuals', 'registry.ts')).manualRegistry
const {DOC_HEADING_TAGS} = loadTypeScript(path.join(__dirname, '..', '..', 'packages', 'docs-ui', 'src', 'shared', 'utils', 'docHeadingTags.ts'))

function git(repo, ...args) {
  try { return execFileSync('git', ['-C', repo, ...args], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024}) }
  catch (error) { return null }
}

function fail(message) { throw new Error(message) }

function defaultFetchPullState(pull) {
  const result = execFileSync('gh', ['api', `repos/milvus-io/milvus-docs/pulls/${pull}`,
    '--jq', '{state: .state, merged: .merged, head: .head.sha}'], {encoding: 'utf8', maxBuffer: 1024 * 1024})
  const state = JSON.parse(result)
  if (!['open', 'closed'].includes(state.state) || typeof state.head !== 'string') fail(`Unexpected pull request state for #${pull}`)
  return state
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

/** Full read-only scan. `fetchPullState` is injectable for hermetic tests. */
async function scan({sharedDocsRoot, upstreamRepo, headSha, fetchPullState}) {
  if (!fs.existsSync(path.join(sharedDocsRoot, 'source.yaml'))) fail(`Missing shared-docs group root: ${sharedDocsRoot}`)
  const head = (git(upstreamRepo, 'rev-parse', headSha) || '').trim()
  if (!/^[a-f0-9]{40}$/.test(head)) fail(`Upstream head is unavailable in the audit clone: ${headSha}`)
  const pages = fs.readdirSync(path.join(sharedDocsRoot, 'pages'), {withFileTypes: true})
    .filter(entry => entry.isDirectory() && !entry.isSymbolicLink()).map(entry => entry.name).sort()
  const report = {schemaVersion: '1.0', generatedOn: new Date().toISOString(), head, pages: []}
  for (const name of pages) report.pages.push(await pageReport({name, repositoryRoot: sharedDocsRoot, upstreamRepo, headSha: head, fetchPullState}))
  const driftPages = report.pages.filter(page => page.drifted?.length)
  const unhealthy = report.pages.filter(page => page.pinIssue || page.variant?.issues.some(issue => issue.severity === 'unhealthy'))
  const errors = report.pages.filter(page => page.error || page.errors?.length)
  const pending = report.pages.filter(page => page.variant?.issues.some(issue => issue.code === 'RECONCILIATION_PENDING'))
  const digest = crypto.createHash('sha256').update(JSON.stringify({
    drifted: driftPages.map(page => ({page: page.page, commits: page.drifted})),
    variantIssues: report.pages.filter(page => page.variant?.issues.length)
      .map(page => ({page: page.page, issues: page.variant.issues.map(issue => issue.code)})),
  })).digest('hex')
  report.summary = {scannedPages: pages.length, driftedCount: driftPages.length, unhealthyCount: unhealthy.length,
    pendingReconciliationCount: pending.length, errorCount: errors.length, diffDigest: digest}
  return report
}

function renderMarkdown(report) {
  const lines = [`## Shared-docs pin drift (${report.summary.scannedPages} pages, head ${report.head.slice(0, 12)})`, '',
    `Drifted: ${report.summary.driftedCount}; unhealthy: ${report.summary.unhealthyCount}; pending reconciliation: ${report.summary.pendingReconciliationCount}; errors: ${report.summary.errorCount}`,
    `diffDigest: \`${report.summary.diffDigest}\``, '']
  for (const page of report.pages) {
    const notes = []
    if (page.error) notes.push(page.error)
    if (page.errors?.length) notes.push(...page.errors)
    if (page.pinIssue) notes.push(page.pinIssue)
    for (const commit of page.drifted || []) notes.push(`drift: ${commit}`)
    for (const issue of page.variant?.issues || []) notes.push(`${issue.severity}: ${issue.message}`)
    if (notes.length) {
      lines.push(`- **${page.page}**: ${notes.join('; ')}`)
    }
  }
  if (lines.length === 5) lines.push('- No drift, unhealthy pins or variant issues.')
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

module.exports = {scan, renderMarkdown, watchdogCardStatus, main}
