'use strict'

const fs = require('node:fs')
const path = require('node:path')

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function buildSummary({ manifest, report }) {
  const locale = manifest?.locale || report?.locale || 'unknown'
  const pending = manifest?.items?.length || 0
  const results = report?.results || []
  const translated = results.filter(item => item.status === 'translated').length
  const failed = results.filter(item => item.status !== 'translated')
  const lines = [
    '### Translation report',
    '',
    `- Locale: \`${locale}\``,
    `- Pending: ${pending}`,
    `- Translated: ${translated}`,
    `- Failed: ${failed.length}`,
  ]

  if (pending === 0) {
    lines.push('', 'No changed documents required translation.')
  } else if (failed.length) {
    lines.push('', 'Failures:')
    for (const item of failed.slice(0, 20)) {
      lines.push(`- \`${item.sourcePath || 'unknown'}\`: ${item.error || item.status || 'failed'}`)
    }
    if (failed.length > 20) lines.push(`- …and ${failed.length - 20} more failure(s).`)
  }

  return `${lines.join('\n')}\n`
}

function main() {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const manifest = readJson(args.get('--manifest') || 'tmp/translation-manifest.json')
  const report = readJson(args.get('--report') || 'tmp/translation-report.json')
  const output = args.get('--output') || 'tmp/translation-report.md'
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, buildSummary({ manifest, report }), 'utf8')
}

if (require.main === module) main()

module.exports = { buildSummary, readJson }

