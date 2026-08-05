'use strict'

const fs = require('node:fs')
const path = require('node:path')

const SAMPLE_LIMIT = 5
const PAGE_SAMPLE_LIMIT = 2

function requireCount(report, key) {
  const value = report?.summary?.[key]
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${key} must be a non-negative safe integer`)
  return value
}

function requireList(report, key) {
  const value = report?.[key]
  if (!Array.isArray(value)) throw new Error(`${key} must be an array`)
  return value
}

function cardStatus(report) {
  return requireCount(report, 'expired_external_links') === 0 ? 'success' : 'fail'
}

function sampleRoutes(lines, label, routes) {
  lines.push(`### ${label} samples`, '', `Showing ${Math.min(routes.length, SAMPLE_LIMIT)} of ${routes.length} ${label.toLowerCase()}.`)
  lines.push(...(routes.length === 0 ? ['- None'] : routes.slice(0, SAMPLE_LIMIT).map(url => `- ${url}`)), '')
}

function sampleExpired(lines, observations) {
  lines.push('### Confirmed expired URL samples', '', `Showing ${Math.min(observations.length, SAMPLE_LIMIT)} of ${observations.length} confirmed expired URLs.`)
  if (observations.length === 0) lines.push('- None')
  for (const item of observations.slice(0, SAMPLE_LIMIT)) {
    const pages = Array.isArray(item.pages) ? item.pages.slice(0, PAGE_SAMPLE_LIMIT) : []
    lines.push(
      `- ${item.url}`,
      `  - Result: ${item.status === null ? `Error: ${item.error}` : `HTTP ${item.status}`}`,
      `  - Referring pages: ${pages.length === 0 ? 'None' : pages.join(', ')}`,
      `  - Pages shown: ${pages.length} of ${item.page_count}`,
    )
  }
  lines.push('')
}

function renderExternalLinkWatchdogNote(report, {artifactUrl}) {
  if (report?.schema_version !== 2) throw new Error('schema_version must be 2')
  if (!artifactUrl) throw new Error('artifactUrl is required')
  const deletedRoutes = requireList(report, 'deleted_routes')
  const addedRoutes = requireList(report, 'added_routes')
  const expired = requireList(report, 'expired_external_links')
  const lines = [
    '# Documentation Site Change & Link Health Report',
    '',
    `- Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `- Tooling SHA: ${report.tooling_sha ?? 'None'}`,
    `- Content SHA: ${report.content_sha ?? 'None'}`,
    `- Complete report artifact: ${artifactUrl}`,
    '- Scope: The artifact contains every unique URL and route; the lists below are bounded samples.',
    '',
    '## Summary',
    '',
    `- Deleted routes: ${requireCount(report, 'deleted_routes')}`,
    `- Added routes: ${requireCount(report, 'added_routes')}`,
    `- External URLs checked: ${requireCount(report, 'checked_external_links')}`,
    `- Healthy external URLs: ${requireCount(report, 'healthy_external_links')}`,
    `- Confirmed expired external URLs: ${requireCount(report, 'expired_external_links')}`,
    `- Blocked external URLs: ${requireCount(report, 'blocked_external_links')}`,
    `- Transient external URLs: ${requireCount(report, 'transient_external_links')}`,
    `- Other external URL responses: ${requireCount(report, 'other_external_links')}`,
    '',
    '## How to interpret this report',
    '',
    '- Expired URLs returned HTTP 404 or 410 and likely need correction, replacement, or removal.',
    '- Blocked URLs returned HTTP 401 or 403; scanner denial does not prove users cannot open them.',
    '- Transient URLs had network errors, timeouts, or retryable HTTP responses and should be checked in a later run.',
    '- Other responses are non-success results outside the expired, blocked, and transient classifications and need manual review.',
    '- Deleted routes exist in the production sitemap but are absent from the current `dev` build.',
    '- Added routes exist in the current `dev` build but not in the production sitemap.',
    '',
    '## Route changes',
    '',
  ]
  sampleRoutes(lines, 'Deleted routes', deletedRoutes)
  sampleRoutes(lines, 'Added routes', addedRoutes)
  lines.push('## External link attention', '')
  sampleExpired(lines, expired)
  return `${lines.join('\n')}\n`
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!['--input', '--output', '--artifact-url'].includes(flag) || !value) {
      throw new Error('Usage: render-external-link-watchdog-note.js --input report.json --output note.md --artifact-url URL')
    }
    values[flag.slice(2)] = value
  }
  if (!values.input || !values.output || !values['artifact-url']) throw new Error('input, output, and artifact-url are required')
  return values
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const report = JSON.parse(fs.readFileSync(args.input, 'utf8'))
  const note = renderExternalLinkWatchdogNote(report, {artifactUrl: args['artifact-url']})
  fs.mkdirSync(path.dirname(args.output), {recursive: true})
  fs.writeFileSync(args.output, note)
  return {status: cardStatus(report), output: args.output}
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {cardStatus, main, parseArgs, renderExternalLinkWatchdogNote}
