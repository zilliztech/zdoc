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

function githubFileUrl(file) {
  const repository = process.env.GITHUB_REPOSITORY
  if (!repository) return null

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const ref = process.env.CARD_REPORT_REF || process.env.GITHUB_REF_NAME || process.env.GITHUB_SHA
  if (!ref) return null

  const encodedPath = file.split('/').map(encodeURIComponent).join('/')
  return `${serverUrl}/${repository}/blob/${encodeURIComponent(ref)}/${encodedPath}`
}

function reportFileLine(file) {
  const url = githubFileUrl(file)
  return url ? `Report file: [${file}](${url})` : `Report file: \`${file}\``
}

function linkCheckNote() {
  const file = 'plugins/link-checks/meta/reports/latest.md'
  const content = readIfExists(file)
  if (!content) return null
  return `${compactMarkdown(content, 60)}\n\n${reportFileLine(file)}`
}

function canonicalLinkNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json'
  const mdFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md'
  const report = readJsonIfExists(jsonFile)
  if (!report) {
    const fallback = readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\n${reportFileLine(mdFile)}` : null
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
    reportFileLine(mdFile),
  ].join('\n')
}

function brokenContentLinksNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-broken-content-links.json'
  const report = readJsonIfExists(jsonFile)
  if (!report) return null

  const summary = report.summary || {}
  const brokenLinks = report.broken_content_links || []
  const examples = brokenLinks.slice(0, 5).map((link) => {
    const title = link.source_title || link.source_slug || link.source_file || '(unknown source)'
    const text = link.link_text ? ` "${link.link_text}"` : ''
    return `- ${title}:${text} ${link.url || link.raw_url || link.token || '(unknown target)'}`
  })

  return [
    '# Broken Content Links Audit',
    '',
    `Generated: ${report.generated_at || '(unknown)'}`,
    `Source: ${report.source_dir || '(unknown)'}`,
    '',
    '## Summary',
    '',
    `- Canonical tokens: ${summary.canonical_tokens || 0}`,
    `- Scanned sources: ${summary.scanned_sources || 0}`,
    `- Skipped noncanonical sources: ${summary.skipped_noncanonical_sources || 0}`,
    `- Content links: ${summary.content_links || 0}`,
    `- Broken content links: ${summary.broken_content_links || brokenLinks.length || 0}`,
    examples.length ? '' : null,
    examples.length ? '## Examples' : null,
    ...examples,
    brokenLinks.length > examples.length ? `- ...and ${brokenLinks.length - examples.length} more broken links` : null,
    '',
    reportFileLine(jsonFile),
  ].filter(Boolean).join('\n')
}

function incrementalPlanNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json'
  const mdFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md'
  const plan = readJsonIfExists(jsonFile)
  if (!plan) {
    const fallback = readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\n${reportFileLine(mdFile)}` : null
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
    reportFileLine(mdFile),
  ].filter(Boolean).join('\n')
}

function collectNotes() {
  return [
    linkCheckNote(),
    brokenContentLinksNote(),
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
  brokenContentLinksNote,
  collectNotes,
  compactMarkdown,
  githubFileUrl,
  reportFileLine,
}
