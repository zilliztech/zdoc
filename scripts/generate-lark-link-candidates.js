const fs = require('node:fs')

const reportPath = process.argv[2] || './packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json'

if (!fs.existsSync(reportPath)) {
  console.error(`[canonical-links] Report not found: ${reportPath}`)
  console.error('Run: pnpm docusaurus fetch-lark-docs --manual guides --auditCanonicalLinks')
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
console.log(JSON.stringify({
  message: 'Canonical link candidates are now included directly in the canonical link audit markdown and CSV reports.',
  report: reportPath,
  markdown: reportPath.replace(/\.json$/, '.md'),
  csv: reportPath.replace(/\.json$/, '.csv'),
  summary: report.summary,
}, null, 2))
