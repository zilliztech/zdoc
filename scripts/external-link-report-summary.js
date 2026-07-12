'use strict'

const fs = require('node:fs')
const path = require('node:path')

function parseArgs(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--report') options.reportPath = argv[++index]
    else if (argument === '--output') options.outputPath = argv[++index]
    else if (argument === '--run-url') options.runUrl = argv[++index]
  }
  return options
}

function countResults(results, classification) {
  return results.filter(result => result.classification === classification).length
}

function buildFeishuSummary(report, options = {}) {
  const results = Array.isArray(report.results) ? report.results : []
  const newBrokenUrls = new Set(report.baseline?.newBroken || [])
  const broken = results.filter(result => result.classification === 'broken')
  const newBroken = broken.filter(result => newBrokenUrls.has(result.url))
  const knownBroken = broken.length - newBroken.length
  const healthy = countResults(results, 'ok') + countResults(results, 'redirected')
  const lines = [
    '**External link results**',
    `Checked: ${results.length}`,
    `Healthy: ${healthy}`,
    `Known broken: ${knownBroken}`,
    `New broken: ${newBroken.length}`,
    `Blocked: ${countResults(results, 'blocked')}`,
    `Transient: ${countResults(results, 'transient')}`,
  ]

  if (options.runUrl) lines.push(`[View GitHub Actions run](${options.runUrl})`)

  if (newBroken.length) {
    lines.push('', '**New broken links**')
    for (const result of newBroken.slice(0, 5)) {
      const source = result.sources?.[0]
      const location = source ? ` — ${source.file}:${source.line}` : ''
      lines.push(`- ${result.url}${location}`)
    }
    const remaining = newBroken.length - 5
    if (remaining > 0) lines.push(`- ${remaining} more new broken link${remaining === 1 ? '' : 's'} in the JSON artifact`)
  }

  if (countResults(results, 'transient')) {
    lines.push('', 'Transient means the request timed out, was rate-limited, hit a temporary server error, or could not obtain a trustworthy final response.')
  }

  return `${lines.join('\n')}\n`
}

function buildMissingReportSummary(runUrl) {
  const lines = [
    '**External link results unavailable**',
    'No structured external-link report was generated. Inspect the workflow logs for a checker or setup failure.',
  ]
  if (runUrl) lines.push(`[View GitHub Actions run](${runUrl})`)
  return `${lines.join('\n')}\n`
}

function writeGithubOutputs(metadata) {
  if (!process.env.GITHUB_OUTPUT) return
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `report_available=${metadata.reportAvailable}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_new_broken=${metadata.hasNewBroken}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_broken_count=${metadata.newBrokenCount}\n`)
}

function generateSummaryFile({ reportPath, outputPath, runUrl }) {
  let report
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch {
    const metadata = { reportAvailable: false, hasNewBroken: true, newBrokenCount: 0 }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, buildMissingReportSummary(runUrl))
    writeGithubOutputs(metadata)
    return metadata
  }

  const newBrokenCount = Array.isArray(report.baseline?.newBroken) ? report.baseline.newBroken.length : 0
  const metadata = { reportAvailable: true, hasNewBroken: newBrokenCount > 0, newBrokenCount }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buildFeishuSummary(report, { runUrl }))
  writeGithubOutputs(metadata)
  return metadata
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!options.reportPath || !options.outputPath) {
    throw new Error('Usage: node scripts/external-link-report-summary.js --report <path> --output <path> [--run-url <url>]')
  }
  const metadata = generateSummaryFile(options)
  process.stdout.write(`${JSON.stringify(metadata)}\n`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  buildFeishuSummary,
  buildMissingReportSummary,
  generateSummaryFile,
  parseArgs,
}
