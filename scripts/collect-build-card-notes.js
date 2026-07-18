const fs = require('node:fs')
const path = require('node:path')
const { assemblyDecisionSha256, validateAssemblyDecision, validateAssemblyResult } = require('./docs-workflow/guides-assembly-identity')
const { readPublicationReport } = require('./docs-workflow/translation-publication-report')
const { deterministicStagingRef } = require('./docs-workflow/translation-staging')

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

function hasExactKeys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length === expected.length && keys.every(key => expected.includes(key))
}

function isExactIsoTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value
}

function mediaPrefetchNote() {
  try {
    const report = freshJsonReport('plugins/lark-docs/meta/reports/guides-media-prefetch.json')
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
      '# Guides media',
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

function cacheGenerationNote() {
  try {
    const report = freshJsonReport('plugins/lark-docs/meta/reports/guides-cache-generation.json')
    if (!report || !hasExactKeys(report, ['schemaVersion', 'generated_at', 'sourceCacheVersion', 'saveRequired', 'persistence', 'saveKey']) ||
        report.schemaVersion !== 1 || !isExactIsoTimestamp(report.generated_at) ||
        !['v4', 'v3', 'v2', 'v1', 'none'].includes(report.sourceCacheVersion) || typeof report.saveRequired !== 'boolean' ||
        !['saved', 'skipped-valid-v4', 'save-failed'].includes(report.persistence)) return null
    const saveKeyValid = typeof report.saveKey === 'string' && /^guides-source-v4-[0-9a-f]{64}-[1-9][0-9]*-[1-9][0-9]*$/.test(report.saveKey)
    if (report.persistence === 'skipped-valid-v4') {
      if (report.sourceCacheVersion !== 'v4' || report.saveRequired !== false || report.saveKey !== null) return null
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

function boundedText(value) {
  return String(value || '').replace(/[\0-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replace(/[\\`*_{}\[\]()#+.!|]/g, '\\$&')
}

function publicationReportNote(env = process.env) {
  if (env.CARD_EXPECT_GUIDES_PUBLICATION_REPORT !== 'true') {
    if (env.CARD_GUIDES_FINAL_PUBLISHER_STATUS !== 'no_changes') return null
    const lines = ['# Guides translation publication', '', '- Status: No translation changes']
    if (/^[0-9a-f]{40}$/.test(env.CARD_GUIDES_FINAL_COMMIT_SHA || '')) lines.push(`- Result SHA: ${env.CARD_GUIDES_FINAL_COMMIT_SHA}`)
    return lines.join('\n')
  }
  const unavailable = () => {
    let candidate = null
    if (env.CARD_GUIDES_PUBLISHER_RESULT === 'cancelled' && /^[0-9a-f]{64}$/.test(env.CARD_GUIDES_PENDING_SET_SHA256 || '')) {
      try { candidate = deterministicStagingRef({ runId: env.CARD_GUIDES_RUN_ID, runAttempt: env.CARD_GUIDES_RUN_ATTEMPT, pendingSetSha256: env.CARD_GUIDES_PENDING_SET_SHA256 }) } catch {}
    }
    return [
      '# Guides translation publication', '',
      `- Status: ${env.CARD_GUIDES_PUBLISHER_RESULT === 'cancelled' ? 'Cancelled' : 'Evidence unavailable'}`,
      '- Publication report unavailable or invalid for this run.',
      ...(candidate ? [`- Unconfirmed recovery candidate: ${candidate}`] : []),
    ].join('\n')
  }
  try {
    const runId = Number(env.CARD_GUIDES_RUN_ID)
    const runAttempt = Number(env.CARD_GUIDES_RUN_ATTEMPT)
    const report = readPublicationReport(env.CARD_GUIDES_PUBLICATION_REPORT, {
      expectedRunId: runId,
      expectedRunAttempt: runAttempt,
      expectedMasterSha: env.CARD_GUIDES_MASTER_SHA,
      expectedSourceCheckpointSha: env.CARD_GUIDES_SOURCE_SHA,
      expectedTargetSha: env.CARD_GUIDES_TARGET_SHA,
      expectedStagingSha: env.CARD_GUIDES_STAGING_SHA || undefined,
    })
    const label = report.status === 'published' ? 'Published' : report.status === 'no_changes' ? 'No translation changes' : report.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
    const lines = ['# Guides translation publication', '', `- Status: ${label}`]
    if (report.resultSha) lines.push(`- Result SHA: ${report.resultSha}`)
    if (report.stagingRef) lines.push(`- Staging ref: ${report.stagingRef}`, `- Staging SHA: ${report.stagingSha}`)
    if (report.failure.detail) lines.push(`- Failure: ${boundedText(report.failure.detail)}`, `- Recovery: ${boundedText(report.failure.recovery)}`)
    if (report.cleanup.detail) lines.push(`- Cleanup debt: ${boundedText(report.cleanup.detail)}`)
    return lines.join('\n').slice(0, 12000)
  } catch (_) {
    return unavailable()
  }
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

function runtimeReportFileLine(file) {
  const artifactUrl = (process.env.CARD_REPORT_ARTIFACT_URL || '').trim()
  if (/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+#artifacts$/.test(artifactUrl)) {
    return `Current-run report: [${file}](${artifactUrl})`
  }
  return `Current-run report: \`${file}\``
}

function assemblyIdentityNote() {
  try {
    const decisionFile = 'plugins/lark-docs/meta/reports/guides-assembly-decision.json'
    const resultFile = 'plugins/lark-docs/meta/reports/guides-assembly-result.json'
    const decision = freshJsonReport(decisionFile)
    if (!decision) return null
    validateAssemblyDecision(decision)
    const lines = ['# Guides assembly', '']
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
    lines.push('', runtimeReportFileLine(decisionFile))
    if (result) lines.push(runtimeReportFileLine(resultFile))
    return lines.join('\n')
  } catch (_) {
    return null
  }
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
  { key: 'media-prefetch', title: 'Guides media prefetch report', collect: mediaPrefetchNote },
  { key: 'cache-generation', title: 'Guides cache persistence report', collect: cacheGenerationNote },
  { key: 'content-links', title: 'Canonical content links audit', collect: brokenContentLinksNote },
  { key: 'canonical-links', title: 'Canonical link audit', collect: canonicalLinkNote },
  { key: 'incremental-plan', title: 'Incremental fetch plan', collect: incrementalPlanNote },
  { key: 'assembly', title: 'Guides assembly decision and result', collect: assemblyIdentityNote },
])

function guidesReportNotes() {
  const found = []
  const collected = new Map()
  for (const report of GUIDES_REPORTS) {
    const note = report.collect()
    if (!note) continue
    found.push(report.key)
    collected.set(report.key, note)
  }
  const notes = []
  const media = collected.get('media-prefetch')
  const persistence = collected.get('cache-generation')
  if (media || persistence) notes.push(media ? `${media}${persistence ? `\n${persistence}` : ''}` : `# Guides media\n\n${persistence}`)
  for (const report of GUIDES_REPORTS) {
    if (report.key === 'media-prefetch' || report.key === 'cache-generation') continue
    if (collected.has(report.key)) notes.push(collected.get(report.key))
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
  const publication = publicationReportNote()
  const retainedBaseNotes = baseNotes.slice(0, publication ? 11 : 12)
  const notes = [...retainedBaseNotes, publication, ...collected.notes]
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
  publicationReportNote,
  reportFileLine,
}
