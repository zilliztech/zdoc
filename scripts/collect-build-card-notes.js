const fs = require('node:fs')
const path = require('node:path')

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

function reportStartedAt() {
  const raw = process.env.CARD_REPORT_STARTED_AT || ''
  const timestamp = Date.parse(raw)
  return Number.isNaN(timestamp) ? null : timestamp
}

function isFreshGeneratedAt(value) {
  const startedAt = reportStartedAt()
  if (startedAt === null) return true
  if (typeof value !== 'string' || !value) return false
  const generatedAt = Date.parse(value)
  if (Number.isNaN(generatedAt)) return false
  return generatedAt >= startedAt
}

function freshJsonReport(file) {
  const report = readJsonIfExists(file)
  if (!report) return null
  return isFreshGeneratedAt(report.generated_at) ? report : null
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
  const ref = (process.env.CARD_REPORT_REF || '').trim()
  if (!repository || !/^[0-9a-f]{40}$/.test(ref)) return null

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const encodedPath = file.split('/').map(encodeURIComponent).join('/')
  return `${serverUrl}/${repository}/blob/${ref}/${encodedPath}`
}

function reportFileLine(file) {
  const url = githubFileUrl(file)
  if (url) return `Report file: [${file}](${url})`
  const artifactUrl = (process.env.CARD_REPORT_ARTIFACT_URL || '').trim()
  if (/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+#artifacts$/.test(artifactUrl)) {
    return `Current-run reports: [workflow artifacts](${artifactUrl})`
  }
  return `Report file: \`${file}\``
}

function reportFileLines(files) {
  return files.map(reportFileLine)
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
  const report = freshJsonReport(jsonFile)
  if (!report) {
    const fallback = reportStartedAt() ? '' : readIfExists(mdFile)
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
  const report = freshJsonReport(jsonFile)
  if (!report) return null

  const summary = report.summary || {}
  const brokenLinks = report.broken_content_links || []
  const examples = brokenLinks.slice(0, 5).map((link) => {
    const title = link.source_title || link.source_slug || link.source_file || '(unknown source)'
    const text = link.link_text ? ` "${link.link_text}"` : ''
    return `- ${title}:${text} ${link.url || link.raw_url || link.token || '(unknown target)'}`
  })
  const canonicalMdFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md'
  const canonicalCsvFile = 'plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv'

  return [
    '# Canonical Content Links Audit',
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
    '## Reports',
    ...reportFileLines([
      canonicalMdFile,
      canonicalCsvFile,
      jsonFile,
    ]),
  ].filter(Boolean).join('\n')
}

function incrementalPlanNote() {
  const jsonFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json'
  const mdFile = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md'
  const plan = freshJsonReport(jsonFile)
  if (!plan) {
    const fallback = reportStartedAt() ? '' : readIfExists(mdFile)
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
    `- Removed docs: ${(plan.removed_tokens || []).length}`,
    `- Warnings: ${warnings.length}`,
    ...warnings.slice(0, 5).map(warning => `- ${warning}`),
    warnings.length > 5 ? `- ...and ${warnings.length - 5} more warnings` : null,
    '',
    reportFileLine(mdFile),
  ].filter(Boolean).join('\n')
}

const GUIDES_REPORTS = Object.freeze([
  { key: 'content-links', title: 'Canonical content links audit', collect: brokenContentLinksNote },
  { key: 'canonical-links', title: 'Canonical link audit', collect: canonicalLinkNote },
  { key: 'incremental-plan', title: 'Incremental fetch plan', collect: incrementalPlanNote },
])

function guidesReportNotes() {
  const found = []
  const notes = []
  for (const report of GUIDES_REPORTS) {
    const note = report.collect()
    if (!note) continue
    found.push(report.key)
    notes.push(note)
  }
  const expected = process.env.CARD_EXPECT_GUIDES_REPORTS === 'true'
  const missing = expected ? GUIDES_REPORTS.filter(report => !found.includes(report.key)) : []
  if (missing.length) {
    notes.push([
      '# Guides reports unavailable',
      '',
      'The Guides producer completed, but these current-run reports could not be loaded:',
      '',
      ...missing.map(report => `- ${report.title}`),
      '',
      'Inspect the workflow artifacts for this run.',
    ].join('\n'))
  }
  return { notes, found, missing: missing.map(report => report.key) }
}

function collectNotesWithDiagnostics() {
  const guides = guidesReportNotes()
  return {
    notes: [linkCheckNote(), ...guides.notes].filter(Boolean),
    diagnostics: { found: guides.found, missing: guides.missing },
  }
}

function collectNotes() {
  return collectNotesWithDiagnostics().notes
}

function collectCardNotesWithDiagnostics() {
  let baseNotes = []
  try {
    const parsed = JSON.parse(process.env.CARD_BASE_NOTES_JSON || '[]')
    if (Array.isArray(parsed)) baseNotes = parsed.filter(note => typeof note === 'string' && note.trim())
  } catch (_) {}
  const collected = collectNotesWithDiagnostics()
  const notes = [...baseNotes, ...collected.notes]
    .filter(note => typeof note === 'string' && note.trim())
    .slice(0, 12)
    .map(note => note.trim().slice(0, 12000))
  return { notes, diagnostics: collected.diagnostics }
}

function collectCardNotes() {
  return collectCardNotesWithDiagnostics().notes
}

function writeGithubOutput(notes, diagnostics = { found: [], missing: [] }) {
  const output = process.env.GITHUB_OUTPUT
  const notesFile = path.resolve(process.env.CARD_NOTES_FILE || 'tmp/card-notes.json')
  fs.mkdirSync(path.dirname(notesFile), { recursive: true })
  fs.writeFileSync(notesFile, `${JSON.stringify(notes, null, 2)}\n`)
  if (!output) return notesFile
  const value = JSON.stringify(notes)
  fs.appendFileSync(output, `card_notes_json<<CARD_NOTES_JSON\n${value}\nCARD_NOTES_JSON\n`)
  fs.appendFileSync(output, `card_notes_file=${notesFile}\n`)
  fs.appendFileSync(output, `guides_reports_found=${diagnostics.found.join(',')}\n`)
  fs.appendFileSync(output, `guides_reports_missing=${diagnostics.missing.join(',')}\n`)
  return notesFile
}

if (require.main === module) {
  const { notes, diagnostics } = collectCardNotesWithDiagnostics()
  writeGithubOutput(notes, diagnostics)
  process.stdout.write(JSON.stringify(notes, null, 2) + '\n')
}

module.exports = {
  brokenContentLinksNote,
  canonicalLinkNote,
  collectCardNotes,
  collectNotes,
  compactMarkdown,
  freshJsonReport,
  githubFileUrl,
  isFreshGeneratedAt,
  reportFileLine,
}
