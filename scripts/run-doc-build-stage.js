const fs = require('node:fs')
const { spawnSync } = require('node:child_process')

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i]
    if (!item.startsWith('--')) continue
    const key = item.slice(2)
    const next = argv[i + 1]
    args[key] = next && !next.startsWith('--') ? argv[++i] : true
  }
  return args
}

function run(command, env = {}) {
  console.log(`$ ${command}`)
  const result = spawnSync(command, {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
  return result.status || 0
}

function isTruthy(value) {
  return value === true || value === 'true' || value === '1' || value === 'yes'
}

function reportCard(status, reportPath) {
  if (reportPath && fs.existsSync(reportPath)) {
    return run(`npx docusaurus report-to-lark --card-advance --status ${status} --note-file ${reportPath}`)
  }
  return run(`npx docusaurus report-to-lark --card-advance --status ${status}`)
}

function linkReportHasChanges(reportPath) {
  const reportJsonPath = reportPath.replace(/\.md$/, '.json')
  if (!fs.existsSync(reportJsonPath)) return fs.existsSync(reportPath)

  try {
    const report = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'))
    const summary = report.summary || {}
    return Boolean(
      summary.deleted_links ||
      summary.added_links ||
      summary.broken_external_links
    )
  } catch (error) {
    console.warn(`Could not read link-check summary from ${reportJsonPath}: ${error.message}`)
    return fs.existsSync(reportPath)
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const buildCommand = args.build || 'pnpm run build'
  const reportPath = args.reportPath || 'plugins/link-checks/meta/reports/latest.md'
  const skipCardReporting = isTruthy(args.skipCardReporting) || isTruthy(process.env.SKIP_CARD_REPORTING)

  const buildStatus = run(buildCommand)
  if (buildStatus !== 0) {
    if (!skipCardReporting) reportCard('fail', fs.existsSync(reportPath) ? reportPath : null)
    process.exit(buildStatus)
  }

  if (isTruthy(args.skipLinkChecks) || isTruthy(process.env.SKIP_LINK_CHECKS)) {
    console.log('Skipping link checks because skipLinkChecks is enabled.')
    if (skipCardReporting) return
    const advanceStatus = run('npx docusaurus report-to-lark --card-advance --status done')
    if (advanceStatus !== 0) process.exit(advanceStatus)
    return
  }

  const linkStatus = run('npx docusaurus link-checks', {
    LINK_CHECKS_REMOTE_BASE_URL: process.env.LINK_CHECKS_REMOTE_BASE_URL || 'https://docs.zilliz.com',
  })
  if (linkStatus !== 0) {
    if (!skipCardReporting) reportCard('fail', reportPath)
    process.exit(linkStatus)
  }

  if (skipCardReporting) return

  if (linkReportHasChanges(reportPath)) {
    const noteStatus = run(`npx docusaurus report-to-lark --card-note-file ${reportPath}`)
    if (noteStatus !== 0) process.exit(noteStatus)
  } else {
    console.log('Link-check report is clean; no report note will be attached to the card.')
  }

  const advanceStatus = run('npx docusaurus report-to-lark --card-advance --status done')
  if (advanceStatus !== 0) process.exit(advanceStatus)
}

main()
