const fs = require('node:fs')
const path = require('node:path')
const { assemblyDecisionSha256, validateAssemblyDecision, validateAssemblyResult } = require('./docs-workflow/guides-assembly-identity')

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

const LEGACY_GUIDES_REPORTS_DIRECTORY = 'packages/docs-tooling/src/lark/meta/reports'

function guidesReportFile(directory, file) {
  return path.join(directory || LEGACY_GUIDES_REPORTS_DIRECTORY, file)
}

function guidesHeading(label, suffix) {
  return `# ${label || 'Guides'} ${suffix}`
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

function hasExactKeys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length === expected.length && keys.every(key => expected.includes(key))
}

function isExactIsoTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value
}

function mediaPrefetchNote({ directory, label } = {}) {
  try {
    const report = freshJsonReport(guidesReportFile(directory, 'guides-media-prefetch.json'))
    if (!report || !hasExactKeys(report, ['schemaVersion', 'generated_at', 'mode', 'cacheState', 'metrics']) ||
        report.schemaVersion !== 1 || !isExactIsoTimestamp(report.generated_at) ||
        !['incremental', 'recovery'].includes(report.mode) || !['valid', 'invalid', 'missing', 'legacy'].includes(report.cacheState)) return null
    const metrics = report.metrics
    const metricKeys = [
      'canonicalReferencesRequired', 'selectedReferences', 'validatedManifestReuse',
      'committedDocsReconstruction', 'resolvedByNetwork', 'staleEntriesDropped', 'finalManifestEntries',
    ]
    if (!hasExactKeys(metrics, metricKeys) || metricKeys.some(key => !Number.isSafeInteger(metrics[key]) || metrics[key] < 0)) return null
    if (metrics.selectedReferences > metrics.canonicalReferencesRequired ||
        metrics.finalManifestEntries !== metrics.canonicalReferencesRequired ||
        metrics.finalManifestEntries !== metrics.validatedManifestReuse + metrics.committedDocsReconstruction + metrics.resolvedByNetwork) return null
    return [
      guidesHeading(label, 'media'),
      '',
      `- Required: ${metrics.canonicalReferencesRequired}`,
      `- Reused from validated manifest: ${metrics.validatedManifestReuse}`,
      `- Reconstructed from committed docs: ${metrics.committedDocsReconstruction}`,
      `- Freshly resolved over network: ${metrics.resolvedByNetwork}`,
      `- Stale entries dropped: ${metrics.staleEntriesDropped}`,
      `- Final manifest entries: ${metrics.finalManifestEntries}`,
    ].join('\n')
  } catch (_) {
    return null
  }
}

function cacheGenerationNote({ directory } = {}) {
  try {
    const report = freshJsonReport(guidesReportFile(directory, 'guides-cache-generation.json'))
    if (!report || !hasExactKeys(report, ['schemaVersion', 'generated_at', 'sourceCacheVersion', 'saveRequired', 'persistence', 'saveKey']) ||
        report.schemaVersion !== 1 || !isExactIsoTimestamp(report.generated_at) ||
        !['v5', 'v4', 'v3', 'v2', 'v1', 'none'].includes(report.sourceCacheVersion) || typeof report.saveRequired !== 'boolean' ||
        !['saved', 'skipped-valid-v5', 'skipped-valid-v4', 'save-failed'].includes(report.persistence)) return null
    const saveKeyValid = typeof report.saveKey === 'string' && /^guides-source-(?:(?:en|zh-CN)-)?v(?:4|5)-[0-9a-f]{64}-[1-9][0-9]*-[1-9][0-9]*$/.test(report.saveKey)
    if (report.persistence === 'skipped-valid-v5' || report.persistence === 'skipped-valid-v4') {
      const version = report.persistence === 'skipped-valid-v5' ? 'v5' : 'v4'
      if (report.sourceCacheVersion !== version || report.saveRequired !== false || report.saveKey !== null) return null
    } else if (report.saveRequired !== true || !saveKeyValid) {
      return null
    }
    return `- Cache persistence: ${report.persistence}`
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
  const ref = (process.env.CARD_REPORT_REF || '').trim()
  if (!repository || !/^[0-9a-f]{40}$/.test(ref)) return null

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const encodedPath = file.split('/').map(encodeURIComponent).join('/')
  return `${serverUrl}/${repository}/blob/${ref}/${encodedPath}`
}

function exactArtifactUrl(value) {
  const url = String(value || '').trim()
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/[1-9][0-9]*\/artifacts\/[1-9][0-9]*$/.test(url) ? url : null
}

function reportFileLine(file, artifactUrl = '') {
  const url = githubFileUrl(file)
  if (url) return `Report file: [${file}](${url})`
  const exactUrl = exactArtifactUrl(artifactUrl)
  if (exactUrl) return `Current-run report: [${file}](${exactUrl})`
  return `Report file: \`${file}\``
}

function reportFileLines(files, artifactUrl = '') {
  return files.map(file => reportFileLine(file, artifactUrl))
}

function runtimeReportFileLine(file, artifactUrl = '') {
  const exactUrl = exactArtifactUrl(artifactUrl)
  if (exactUrl) return `Current-run report: [${file}](${exactUrl})`
  return `Current-run report: \`${file}\``
}

function assemblyIdentityNote({ directory, label, site, artifactUrl } = {}) {
  try {
    const decisionFile = guidesReportFile(directory, 'guides-assembly-decision.json')
    const resultFile = guidesReportFile(directory, 'guides-assembly-result.json')
    const decision = freshJsonReport(decisionFile)
    if (!decision) return null
    validateAssemblyDecision(decision)
    const lines = [guidesHeading(label, 'assembly'), '']
    if (decision.mode === 'reuse') lines.push('- Decision: Reuse eligible (observe-only)')
    else lines.push(`- Decision: Regeneration required (observe-only): ${decision.reasons.join(', ')}`)
    let result = freshJsonReport(resultFile)
    if (result) {
      try {
        validateAssemblyResult(result, decision)
        if (result.decisionSha256 !== assemblyDecisionSha256(decision)) result = null
      } catch (_) { result = null }
    }
    if (result) {
      if (result.mode === 'reuse_observed') lines.push('- Result: Sidebar reuse eligible; regenerated bytes matched baseline')
      else lines.push(`- Result: Regenerated: ${result.reasons.join(', ')}`)
    }
    const displayedDecisionFile = site ? path.basename(decisionFile) : decisionFile
    const displayedResultFile = site ? path.basename(resultFile) : resultFile
    lines.push('', runtimeReportFileLine(displayedDecisionFile, artifactUrl))
    if (result) lines.push(runtimeReportFileLine(displayedResultFile, artifactUrl))
    return lines.join('\n')
  } catch (_) {
    return null
  }
}

function linkCheckNote() {
  const file = 'packages/docs-tooling/src/links/meta/reports/latest.md'
  const content = readIfExists(file)
  if (!content) return null
  return `${compactMarkdown(content, 60)}\n\n${reportFileLine(file)}`
}

function canonicalLinkNote({ directory, label, site, artifactUrl } = {}) {
  const prefix = site ? `guides-${site}-canonical-link-audit` : 'guides-canonical-link-audit'
  const jsonFile = guidesReportFile(directory, `${prefix}.json`)
  const mdFile = guidesReportFile(directory, `${prefix}.md`)
  const report = freshJsonReport(jsonFile)
  if (!report) {
    const fallback = reportStartedAt() ? '' : readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\n${reportFileLine(mdFile)}` : null
  }

  const summary = report.summary || {}
  return [
    guidesHeading(label, 'canonical link audit'),
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
    site ? runtimeReportFileLine(`${prefix}.md`, artifactUrl) : reportFileLine(mdFile, artifactUrl),
  ].join('\n')
}

function brokenContentLinksNote() {
  const jsonFile = 'packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json'
  const report = freshJsonReport(jsonFile)
  if (!report) return null

  const summary = report.summary || {}
  const brokenLinks = report.broken_content_links || []
  const examples = brokenLinks.slice(0, 5).map((link) => {
    const title = link.source_title || link.source_slug || link.source_file || '(unknown source)'
    const text = link.link_text ? ` "${link.link_text}"` : ''
    return `- ${title}:${text} ${link.url || link.raw_url || link.token || '(unknown target)'}`
  })
  const canonicalMdFile = 'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.md'
  const canonicalCsvFile = 'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.csv'

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

function incrementalPlanNote({ directory, label, site, artifactUrl } = {}) {
  const jsonFile = guidesReportFile(directory, 'guides-incremental-fetch-plan.json')
  const mdFile = guidesReportFile(directory, 'guides-incremental-fetch-plan.md')
  const plan = freshJsonReport(jsonFile)
  if (!plan) {
    const fallback = reportStartedAt() ? '' : readIfExists(mdFile)
    return fallback ? `${compactMarkdown(fallback, 40)}\n\n${reportFileLine(mdFile)}` : null
  }

  const warnings = plan.warnings || []
  return [
    label ? guidesHeading(label, 'incremental fetch plan') : '# Incremental Fetch Plan',
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
    site ? runtimeReportFileLine('guides-incremental-fetch-plan.md', artifactUrl) : reportFileLine(mdFile, artifactUrl),
  ].filter(Boolean).join('\n')
}

const GUIDES_REPORTS = Object.freeze([
  { key: 'media-prefetch', title: 'Guides media prefetch report', collect: mediaPrefetchNote },
  { key: 'cache-generation', title: 'Guides cache persistence report', collect: cacheGenerationNote },
  { key: 'content-links', title: 'Canonical content links audit', collect: brokenContentLinksNote },
  { key: 'canonical-links', title: 'Canonical link audit', collect: canonicalLinkNote },
  { key: 'incremental-plan', title: 'Incremental fetch plan', collect: incrementalPlanNote },
  { key: 'assembly', title: 'Guides assembly decision and result', collect: assemblyIdentityNote },
])

const CURRENT_GUIDES_REPORTS = Object.freeze([
  { key: 'media-prefetch', title: 'media prefetch report', collect: mediaPrefetchNote },
  { key: 'cache-generation', title: 'cache persistence report', collect: cacheGenerationNote },
  { key: 'canonical-links', title: 'canonical link audit', collect: canonicalLinkNote },
  { key: 'incremental-plan', title: 'incremental fetch plan', collect: incrementalPlanNote },
  { key: 'assembly', title: 'assembly decision and result', collect: assemblyIdentityNote },
])

function collectGuidesReportSet({ reports, expected, directory, label, site, artifactUrl, diagnosticPrefix = '' }) {
  const found = []
  const collected = new Map()
  for (const report of reports) {
    const note = report.collect({ directory, label, site, artifactUrl })
    if (!note) continue
    found.push(report.key)
    collected.set(report.key, note)
  }
  const notes = []
  const media = collected.get('media-prefetch')
  const persistence = collected.get('cache-generation')
  if (media || persistence) notes.push(media ? `${media}${persistence ? `\n${persistence}` : ''}` : `${guidesHeading(label, 'media')}\n\n${persistence}`)
  for (const report of reports) {
    if (report.key === 'media-prefetch' || report.key === 'cache-generation') continue
    if (collected.has(report.key)) notes.push(collected.get(report.key))
  }
  const missing = expected ? reports.filter(report => !found.includes(report.key)) : []
  if (missing.length) {
    notes.push([
      guidesHeading(label, 'reports unavailable'),
      '',
      `The ${label || 'Guides'} producer completed, but these current-run reports could not be loaded:`,
      '',
      ...missing.map(report => `- ${label ? `${label} ${report.title}` : report.title}`),
      '',
      'Inspect the workflow artifacts for this run.',
    ].join('\n'))
  }
  if (site && expected && found.length && !exactArtifactUrl(artifactUrl)) {
    notes.push([
      guidesHeading(label, 'report links need attention'),
      '',
      `The ${label} reports were collected, but their exact current-run artifact link could not be resolved.`,
      'Open the workflow run and inspect the locale-qualified report artifact.',
    ].join('\n'))
  }
  const qualify = key => diagnosticPrefix ? `${diagnosticPrefix}:${key}` : key
  return { notes, found: found.map(qualify), missing: missing.map(report => qualify(report.key)) }
}

function currentGuidesReportSets() {
  const root = (process.env.CARD_GUIDES_REPORTS_ROOT || '').trim()
  const explicit = root || process.env.CARD_EXPECT_EN_GUIDES_REPORTS !== undefined || process.env.CARD_EXPECT_ZH_GUIDES_REPORTS !== undefined
  if (!explicit) return null
  return [
    { site: 'en', label: 'English Guides', expected: process.env.CARD_EXPECT_EN_GUIDES_REPORTS === 'true', artifactUrl: process.env.CARD_REPORT_ARTIFACT_URL_EN },
    { site: 'zh-CN', label: 'Chinese Guides', expected: process.env.CARD_EXPECT_ZH_GUIDES_REPORTS === 'true', artifactUrl: process.env.CARD_REPORT_ARTIFACT_URL_ZH_CN },
  ].filter(config => config.expected || fs.existsSync(path.join(root, config.site)))
    .map(config => ({ ...config, directory: path.join(root, config.site) }))
}

function guidesReportNotes() {
  const sites = currentGuidesReportSets()
  if (sites) {
    const results = sites.map(config => collectGuidesReportSet({
      ...config,
      reports: CURRENT_GUIDES_REPORTS,
      diagnosticPrefix: config.site,
    }))
    return {
      notes: results.flatMap(result => result.notes),
      found: results.flatMap(result => result.found),
      missing: results.flatMap(result => result.missing),
    }
  }
  return collectGuidesReportSet({
    reports: GUIDES_REPORTS,
    expected: process.env.CARD_EXPECT_GUIDES_REPORTS === 'true',
    artifactUrl: process.env.CARD_REPORT_ARTIFACT_URL_EN,
  })
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
  const notes = [...baseNotes.slice(0, 12), ...collected.notes]
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
  assemblyIdentityNote,
  brokenContentLinksNote,
  cacheGenerationNote,
  canonicalLinkNote,
  collectCardNotes,
  collectNotes,
  compactMarkdown,
  freshJsonReport,
  githubFileUrl,
  isFreshGeneratedAt,
  mediaPrefetchNote,
  reportFileLine,
}
