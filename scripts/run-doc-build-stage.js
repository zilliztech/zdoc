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

function main() {
  const args = parseArgs(process.argv.slice(2))
  const buildCommand = args.build || 'pnpm run build'
  const reportPath = args.reportPath || 'plugins/link-checks/meta/reports/latest.md'

  const buildStatus = run(buildCommand)
  if (buildStatus !== 0) {
    reportCard('fail', fs.existsSync(reportPath) ? reportPath : null)
    process.exit(buildStatus)
  }

  if (isTruthy(args.skipLinkChecks) || isTruthy(process.env.SKIP_LINK_CHECKS)) {
    console.log('Skipping link checks because skipLinkChecks is enabled.')
    const advanceStatus = run('npx docusaurus report-to-lark --card-advance --status done')
    if (advanceStatus !== 0) process.exit(advanceStatus)
    return
  }

  const linkStatus = run('npx docusaurus link-checks', {
    LINK_CHECKS_REMOTE_BASE_URL: process.env.LINK_CHECKS_REMOTE_BASE_URL || 'https://docs.zilliz.com',
  })
  if (linkStatus !== 0) {
    reportCard('fail', reportPath)
    process.exit(linkStatus)
  }

  const noteStatus = run(`npx docusaurus report-to-lark --card-note-file ${reportPath}`)
  if (noteStatus !== 0) process.exit(noteStatus)

  const advanceStatus = run('npx docusaurus report-to-lark --card-advance --status done')
  if (advanceStatus !== 0) process.exit(advanceStatus)
}

main()
