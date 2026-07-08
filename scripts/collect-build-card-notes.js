const fs = require('node:fs')

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : ''
}

function readJsonIfExists(file) {
  const content = readIfExists(file)
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch (_) {
    return null
  }
}

function compactMarkdown(markdown, maxLines = 80) {
  const lines = markdown.split(/\r?\n/)
  if (lines.length <= maxLines) return markdown
  return [
    ...lines.slice(0, maxLines),
    '',
    `...truncated ${lines.length - maxLines} lines. See committed report file for full details.`,
  ].join('\n')
}

function linkCheckNote() {
  const file = 'plugins/link-checks/meta/reports/latest.md'
  const content = readIfExists(file)
  if (!content) return null
  return `${compactMarkdown(content, 60)}\n\nReport file: \`${file}\``
}

function canonicalLinkNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json'
  const mdFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md'
  const report = readJsonIfExists(jsonFile)
  if (!report) {
    const fallback = readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\nReport file: \`${mdFile}\`` : null
  }

  const summary = report.summary || {}
  return [
    '# Canonical Link Audit',
    '',
    `Generated: ${report.generated_at || '(unknown)'}`,
    `Target: ${report.target || '(not specified)'}`,
    '',
    '## Summary',
    '',
    `- Canonical records: ${summary.canonical_records || 0}`,
    `- Scanned canonical sources: ${summary.scanned_sources || 0}`,
    `- Internal Feishu references: ${summary.internal_references || 0}`,
    `- Valid references: ${summary.valid_references || 0}`,
    `- Broken references: ${summary.broken_references || 0}`,
    '',
    `Report file: \`${mdFile}\``,
  ].join('\n')
}

function incrementalPlanNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json'
  const mdFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md'
  const plan = readJsonIfExists(jsonFile)
  if (!plan) {
    const fallback = readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\nReport file: \`${mdFile}\`` : null
  }

  const warnings = plan.warnings || []
  return [
    '# Incremental Fetch Plan',
    '',
    `Generated: ${plan.generated_at || '(unknown)'}`,
    `Mode: ${plan.mode || '(unknown)'}`,
    `Build env: ${plan.build_env || '(not specified)'}`,
    '',
    '## Summary',
    '',
    `- Changed docs: ${(plan.changed_tokens || []).length}`,
    `- Expanded docs: ${(plan.expanded_tokens || []).length}`,
    `- Warnings: ${warnings.length}`,
    ...warnings.slice(0, 5).map(warning => `- ${warning}`),
    warnings.length > 5 ? `- ...and ${warnings.length - 5} more warnings` : null,
    '',
    `Report file: \`${mdFile}\``,
  ].filter(Boolean).join('\n')
}

function collectNotes() {
  return [
    linkCheckNote(),
    canonicalLinkNote(),
    incrementalPlanNote(),
  ].filter(Boolean)
}

function writeGithubOutput(notes) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  const value = JSON.stringify(notes)
  fs.appendFileSync(output, `card_notes_json<<CARD_NOTES_JSON\n${value}\nCARD_NOTES_JSON\n`)
}

if (require.main === module) {
  const notes = collectNotes()
  writeGithubOutput(notes)
  process.stdout.write(JSON.stringify(notes, null, 2) + '\n')
}

module.exports = {
  collectNotes,
  compactMarkdown,
}
