const fs = require('node:fs')
const path = require('node:path')
const { guidesCanonicalIsPublishable } = require('./guidesBaseRecordSemantics')
const slugify = require('slugify')
const { parseFeishuDocumentLink, safeDecodeUrl } = require('./feishuDocumentLink')

function plainValue(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(item => plainValue(item)).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    if (value.text) return value.text
    if (value.name) return value.name
    if (value.link) return value.link
    if (value.url) return value.url
    const typedKey = value.type && value[value.type] ? value.type : null
    if (typedKey) return plainValue(value[typedKey])
  }
  return null
}

function docField(fields) {
  return fields.Doc || fields.Docs
}

function docLink(doc) {
  if (!doc) return null
  if (typeof doc === 'string') {
    const markdown = doc.match(/\[[^\]]+\]\(([^)]+)\)/)
    return markdown ? markdown[1] : doc
  }
  if (doc.link) return doc.link
  if (doc.url) return doc.url
  if (Array.isArray(doc)) return docLink(doc[0])
  return null
}

function docTitle(doc) {
  if (!doc) return null
  if (typeof doc === 'string') {
    const markdown = doc.match(/\[([^\]]+)\]\([^)]+\)/)
    return markdown ? markdown[1] : doc
  }
  return doc.text || doc.name || plainValue(doc)
}

function contentLinkTarget(url) {
  return parseFeishuDocumentLink(url)
}

function sourceTokenAliases(source) {
  return [source.node_token, source.origin_node_token, source.obj_token, source.token].filter(Boolean)
}

function walkJson(value, visit, jsonPath = '$') {
  if (!value || typeof value !== 'object') return
  visit(value, jsonPath)
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkJson(item, visit, `${jsonPath}[${index}]`))
    return
  }
  for (const [key, item] of Object.entries(value)) {
    walkJson(item, visit, `${jsonPath}.${key}`)
  }
}

function extractContentLinks(source) {
  const links = []
  const blocks = source.blocks?.items || []
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex]
    walkJson(block, (value, jsonPath) => {
      if (value.mention_doc?.url) {
        const target = contentLinkTarget(value.mention_doc.url)
        if (target) {
          links.push({
            source_type: 'mention_doc',
            source_token: source.node_token || source.origin_node_token || source.obj_token || source.token,
            source_title: source.title || source.name || null,
            source_slug: source.slug || null,
            block_id: block.block_id || null,
            json_path: `$.blocks.items[${blockIndex}]${jsonPath.slice(1)}.mention_doc`,
            link_text: value.mention_doc.title || null,
            raw_url: safeDecodeUrl(value.mention_doc.url),
            ...target,
          })
        }
      }

      const textRun = value.text_run
      const linkUrl = textRun?.text_element_style?.link?.url
      if (linkUrl) {
        const target = contentLinkTarget(linkUrl)
        if (target) {
          links.push({
            source_type: 'href_link',
            source_token: source.node_token || source.origin_node_token || source.obj_token || source.token,
            source_title: source.title || source.name || null,
            source_slug: source.slug || null,
            block_id: block.block_id || null,
            json_path: `$.blocks.items[${blockIndex}]${jsonPath.slice(1)}.text_run.text_element_style.link`,
            link_text: textRun.content || null,
            raw_url: safeDecodeUrl(linkUrl),
            ...target,
          })
        }
      }
    })
  }
  return links
}

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/node\.js/g, 'nodejs')
    .replace(/c\+\+/g, 'cpp')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function tokens(value) {
  return norm(value).split(' ').filter(word => word && word.length > 1)
}

function jaccard(a, b) {
  const left = new Set(tokens(a))
  const right = new Set(tokens(b))
  if (!left.size || !right.size) return 0
  let intersection = 0
  for (const item of left) {
    if (right.has(item)) intersection++
  }
  return intersection / (left.size + right.size - intersection)
}

function levenshteinRatio(a, b) {
  a = norm(a)
  b = norm(b)
  if (!a || !b) return 0
  const rows = a.length
  const cols = b.length
  const dp = Array.from({ length: rows + 1 }, () => Array(cols + 1))
  for (let i = 0; i <= rows; i++) dp[i][0] = i
  for (let j = 0; j <= cols; j++) dp[0][j] = j
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return 1 - dp[rows][cols] / Math.max(rows, cols)
}

function bestScore(queries, candidate) {
  let best = { score: 0, priority: 0, reason: '', query: '' }
  const fields = [
    ['title', candidate.title, 4],
    ['slug', candidate.slug, 3],
    ['label', candidate.labels, 2],
  ]
  for (const querySpec of queries.filter(query => query.value)) {
    const query = querySpec.value
    const normalizedQuery = norm(query)
    const querySlug = slugify(query, { lower: true, strict: true })
    for (const [field, value, fieldPriority] of fields) {
      const normalizedValue = norm(value)
      if (!normalizedValue) continue
      let score
      let reason
      if (normalizedValue === normalizedQuery) {
        score = 100
        reason = `exact ${field}`
      } else if (field === 'slug' && String(value || '') === querySlug) {
        score = 96
        reason = 'slug exact'
      } else if (normalizedQuery.length >= 4 && (normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(normalizedValue))) {
        score = 86
        reason = `substring ${field}`
      } else {
        const overlap = jaccard(query, value)
        const similarity = levenshteinRatio(query, value)
        score = Math.round(Math.max(overlap * 82, similarity * 70))
        reason = overlap * 82 >= similarity * 70 ? `word overlap ${field}` : `similar ${field}`
      }
      const priority = querySpec.priority + fieldPriority
      if (score > best.score || (score === best.score && priority > best.priority)) {
        best = { score, priority, reason, query }
      }
    }
  }
  return best
}

function confidenceFor(score, reason) {
  if (score >= 95 && /^(exact title|exact slug|exact label|slug exact)$/.test(reason)) return 'exact'
  if (score >= 80) return 'strong'
  if (score >= 60) return 'possible'
  if (score >= 45) return 'weak'
  return 'none'
}

function scoreCandidates({ occurrence, canonicalRecords }) {
  const queries = [
    { value: occurrence.target_source?.title, priority: 40 },
    { value: occurrence.target_source?.slug, priority: 30 },
    { value: occurrence.link_text, priority: 25 },
  ].filter(Boolean)

  return canonicalRecords
    .map(candidate => {
      const scored = bestScore(queries, candidate)
      return { ...candidate, ...scored, confidence: confidenceFor(scored.score, scored.reason) }
    })
    .filter(candidate => candidate.score >= 45)
    .sort((a, b) => b.score - a.score || b.priority - a.priority || a.title.localeCompare(b.title))
    .slice(0, 8)
}

function recordToken(record) {
  const link = docLink(docField(record.fields || {}))
  if (!link) return null
  if (link.includes('#')) return link.split('#').pop()
  try {
    return new URL(link).pathname.split('/').filter(Boolean).pop()
  } catch (_) {
    return link.startsWith('http://') || link.startsWith('https://') ? null : link
  }
}

function placementType(record) {
  const value = plainValue(record.fields?.['Placement Type'])
  const normalized = value ? value.trim().toLowerCase() : ''
  if (['canonical', 'ref', 'section', 'link'].includes(normalized)) return normalized
  return contentLinkTarget(docLink(docField(record.fields || {}))) ? 'canonical' : 'section'
}

function canonicalRecordsFrom(records, { guidesPublishableOnly = false } = {}) {
  return (records || [])
    .filter(record => placementType(record) === 'canonical')
    .filter(record => !guidesPublishableOnly || guidesCanonicalIsPublishable(record))
    .map(record => {
      const doc = docField(record.fields || {})
      const doc_token = recordToken(record)
      return {
        record_id: record.record_id,
        table_id: record.base_table_id,
        table_name: record.base_table_name,
        title: docTitle(doc),
        labels: plainValue(record.fields?.Labels) || '',
        slug: plainValue(record.fields?.Slug) || '',
        doc_token,
        doc_link: docLink(doc) || '',
      }
    })
    .filter(record => record.doc_token)
}

function loadSources(docSourceDir) {
  const sources = new Map()
  if (!fs.existsSync(docSourceDir)) return sources
  for (const file of fs.readdirSync(docSourceDir).filter(item => item.endsWith('.json'))) {
    const source = JSON.parse(fs.readFileSync(path.join(docSourceDir, file), 'utf8'))
    source.__source_file = file
    for (const token of sourceTokenAliases(source)) {
      sources.set(token, source)
    }
  }
  return sources
}

function buildCanonicalMap(records, sources) {
  const canonicalByToken = new Map()
  const canonicalRecords = canonicalRecordsFrom(records)
  const canonicalByRecordId = new Map(canonicalRecords.map(record => [record.record_id, record]))
  for (const record of canonicalRecords) {
    canonicalByToken.set(record.doc_token, record)
    const source = sources.get(record.doc_token)
    if (source) {
      for (const alias of sourceTokenAliases(source)) {
        canonicalByToken.set(alias, record)
      }
    }
  }
  for (const source of new Set(sources.values())) {
    if (source.base_placement_type !== 'canonical' || !source.base_record_id) continue
    const record = canonicalByRecordId.get(source.base_record_id)
    if (!record) continue
    for (const alias of sourceTokenAliases(source)) {
      canonicalByToken.set(alias, record)
    }
  }
  return { canonicalByToken, canonicalRecords }
}

function recommendedAction(reference, candidate) {
  if (!candidate) return 'Choose a canonical Base-listed replacement, then update the Feishu source manually.'
  if (reference.source_type === 'mention_doc') {
    return `Replace the mention_doc with a new Feishu document mention for "${candidate.title}" (${candidate.doc_link}).`
  }
  return `Edit the hyperlink URL to ${candidate.doc_link}${reference.anchor ? ' and verify whether the old anchor should be recreated on the target.' : '.'}`
}

function sourceUrlFor(source) {
  if (source.node_token || source.origin_node_token) {
    return `https://zilliverse.feishu.cn/wiki/${source.node_token || source.origin_node_token}`
  }
  if (source.obj_token || source.token) {
    return `https://zilliverse.feishu.cn/docx/${source.obj_token || source.token}`
  }
  return ''
}

function auditCanonicalLinks({ manualName, docSourceDir, records, target, sourceTokens = null }) {
  const sources = loadSources(docSourceDir)
  const { canonicalByToken, canonicalRecords } = buildCanonicalMap(records, sources)
  const canonicalRecordIds = new Set(canonicalRecords.map(record => record.record_id))
  const sourceTokenSet = sourceTokens ? new Set(sourceTokens.filter(Boolean)) : null
  const hasCanonicalSourceMetadata = Array.from(new Set(sources.values()))
    .some(source => source.base_placement_type || source.base_record_id)
  const files = fs.existsSync(docSourceDir) ? fs.readdirSync(docSourceDir).filter(file => file.endsWith('.json')) : []
  const reportFiles = []
  let scannedSources = 0
  let skippedNoncanonicalSources = 0
  let totalReferences = 0
  let validReferences = 0
  let brokenReferences = 0

  for (const file of files) {
    const source = JSON.parse(fs.readFileSync(path.join(docSourceDir, file), 'utf8'))
    if (!source.blocks?.items) continue
    if (sourceTokenSet && !sourceTokenAliases(source).some(token => sourceTokenSet.has(token))) continue
    const isCanonicalSource = hasCanonicalSourceMetadata
      ? source.base_placement_type === 'canonical' && canonicalRecordIds.has(source.base_record_id)
      : sourceTokenAliases(source).some(token => canonicalByToken.has(token))
    if (!isCanonicalSource) {
      skippedNoncanonicalSources++
      continue
    }
    scannedSources++
    const references = extractContentLinks(source)
    totalReferences += references.length
    const broken = []
    for (const reference of references) {
      if (canonicalByToken.has(reference.token)) {
        validReferences++
        continue
      }
      const targetSource = sources.get(reference.token) || null
      const occurrence = {
        ...reference,
        source_file: file,
        target_source: targetSource && {
          title: targetSource.title || targetSource.name || '',
          slug: targetSource.slug || '',
        },
      }
      const candidates = scoreCandidates({ occurrence, canonicalRecords })
      broken.push({
        ...occurrence,
        candidates,
        recommended_action: recommendedAction(reference, candidates[0]),
      })
      brokenReferences++
    }
    if (broken.length > 0) {
      const sourceDocUrl = sourceUrlFor(source)
      reportFiles.push({
        source_file: file,
        source_title: source.title || source.name || null,
        source_token: source.node_token || source.origin_node_token || source.obj_token || source.token,
        source_slug: source.slug || null,
        source_doc_url: sourceDocUrl,
        broken_references: broken,
      })
    }
  }

  return {
    generated_at: new Date().toISOString(),
    manual: manualName,
    target,
    source_dir: docSourceDir,
    summary: {
      canonical_records: canonicalRecords.length,
      scanned_sources: scannedSources,
      skipped_noncanonical_sources: skippedNoncanonicalSources,
      internal_references: totalReferences,
      valid_references: validReferences,
      broken_references: brokenReferences,
    },
    files: reportFiles,
  }
}

function markdownEscape(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function sourceDocUrl(file) {
  return file.source_doc_url || (file.source_token ? `https://zilliverse.feishu.cn/wiki/${file.source_token}` : '')
}

function sourceBlockUrl(file, reference) {
  if (file.source_block_url) return file.source_block_url
  const docUrl = sourceDocUrl(file)
  if (!docUrl || !reference.block_id) return docUrl
  return `${docUrl}#${reference.block_id}`
}

function renderMarkdown(report) {
  const lines = []
  lines.push(`# ${report.manual} Canonical Link Audit`, '')
  lines.push(`Generated: ${report.generated_at}`)
  lines.push(`Target: ${report.target || '(not specified)'}`)
  lines.push(`Source dir: \`${report.source_dir}\``, '')
  lines.push('## Summary', '')
  lines.push(`- Canonical records: ${report.summary.canonical_records}`)
  lines.push(`- Scanned canonical sources: ${report.summary.scanned_sources}`)
  lines.push(`- Skipped non-canonical sources: ${report.summary.skipped_noncanonical_sources}`)
  lines.push(`- Internal Feishu references: ${report.summary.internal_references}`)
  lines.push(`- Valid references: ${report.summary.valid_references}`)
  lines.push(`- Broken references: ${report.summary.broken_references}`, '')

  for (const file of report.files) {
    lines.push(`## ${file.source_title || file.source_file}`)
    lines.push(`- Source file: \`${file.source_file}\``)
    lines.push(`- Source token: \`${file.source_token || ''}\``)
    lines.push(`- Source slug: \`${file.source_slug || ''}\``)
    if (sourceDocUrl(file)) lines.push(`- Source doc: [open](${sourceDocUrl(file)})`)
    lines.push(`- Broken references: ${file.broken_references.length}`, '')

    file.broken_references.forEach((reference, index) => {
      const occurrenceLabel = markdownEscape(reference.link_text || reference.token)
      const occurrenceUrl = sourceBlockUrl(file, reference)
      lines.push(`### ${index + 1}. ${occurrenceUrl ? `[${occurrenceLabel}](${occurrenceUrl})` : occurrenceLabel}`)
      lines.push(`- Type: \`${reference.source_type}\``)
      lines.push(`- Block: \`${reference.block_id || ''}\``)
      if (occurrenceUrl) lines.push(`- Source location: [open block](${occurrenceUrl})`)
      lines.push(`- JSON path: \`${reference.json_path || ''}\``)
      lines.push(`- Current token: \`${reference.token}\``)
      lines.push(`- Current URL: ${reference.raw_url || reference.url || ''}`)
      if (reference.anchor) lines.push(`- Anchor: \`${reference.anchor}\``)
      lines.push(`- Recommended action: ${reference.recommended_action}`, '')

      if (reference.candidates.length > 0) {
        lines.push('| Rank | Confidence | Score | Candidate | Slug | Record | Doc | Reason |')
        lines.push('| ---: | --- | ---: | --- | --- | --- | --- | --- |')
        reference.candidates.slice(0, 5).forEach((candidate, candidateIndex) => {
          lines.push(`| ${candidateIndex + 1} | ${candidate.confidence} | ${candidate.score} | ${markdownEscape(candidate.title)} | \`${candidate.slug}\` | \`${candidate.record_id}\` | [open](${candidate.doc_link}) | ${markdownEscape(candidate.reason)}; query: ${markdownEscape(candidate.query)} |`)
        })
      } else {
        lines.push('- No candidate above threshold.')
      }
      lines.push('')
    })
  }
  return lines.join('\n')
}

function renderCsv(report) {
  const header = [
    'manual',
    'source_file',
    'source_title',
    'source_token',
    'source_slug',
    'source_doc_url',
    'source_block_url',
    'block_id',
    'json_path',
    'source_type',
    'link_text',
    'target_token',
    'target_url',
    'anchor',
    'candidate_rank',
    'candidate_score',
    'candidate_title',
    'candidate_slug',
    'candidate_doc_token',
    'candidate_doc_link',
    'candidate_record_id',
    'candidate_table_name',
    'recommended_action',
  ]
  const rows = [header]
  for (const file of report.files) {
    for (const reference of file.broken_references) {
      const candidates = reference.candidates.length ? reference.candidates : [null]
      candidates.forEach((candidate, index) => {
        rows.push([
          report.manual,
          file.source_file,
          file.source_title,
          file.source_token,
          file.source_slug,
          sourceDocUrl(file),
          sourceBlockUrl(file, reference),
          reference.block_id,
          reference.json_path,
          reference.source_type,
          reference.link_text,
          reference.token,
          reference.raw_url || reference.url,
          reference.anchor,
          candidate ? index + 1 : '',
          candidate?.score || '',
          candidate?.title || '',
          candidate?.slug || '',
          candidate?.doc_token || '',
          candidate?.doc_link || '',
          candidate?.record_id || '',
          candidate?.table_name || '',
          reference.recommended_action,
        ])
      })
    }
  }
  return rows.map(row => row.map(csvEscape).join(',')).join('\n')
}

function writeCanonicalLinkReports(report, outputPrefix) {
  fs.mkdirSync(path.dirname(outputPrefix), { recursive: true })
  removeLegacyCandidateReports(report, outputPrefix)
  const jsonPath = `${outputPrefix}.json`
  const markdownPath = `${outputPrefix}.md`
  const csvPath = `${outputPrefix}.csv`
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(markdownPath, renderMarkdown(report))
  fs.writeFileSync(csvPath, renderCsv(report))
  return { jsonPath, markdownPath, csvPath }
}

function removeLegacyCandidateReports(report, outputPrefix) {
  const outputDir = path.dirname(outputPrefix)
  const manualName = report.manual || path.basename(outputPrefix).replace(/-canonical-link-audit$/, '')
  const legacyNames = [
    `${manualName}-link-replacement-candidates.json`,
    `${manualName}-link-replacement-candidates.md`,
    `${manualName}-link-replacement-candidates.csv`,
    `${manualName}-link-replacement-shim.draft.json`,
    `${manualName}-link-replacement-shim.draft.md`,
  ]
  for (const legacyName of legacyNames) {
    const legacyPath = path.join(outputDir, legacyName)
    if (fs.existsSync(legacyPath)) fs.rmSync(legacyPath)
  }
}

function runCanonicalLinkAudit({ manualName, docSourceDir, records, target, outputPrefix, failOnBroken = false, sourceTokens = null }) {
  const report = auditCanonicalLinks({ manualName, docSourceDir, records, target, sourceTokens })
  const paths = writeCanonicalLinkReports(report, outputPrefix)
  if (failOnBroken && report.summary.broken_references > 0) {
    throw new Error(`[canonical-links] Broken canonical links found: ${report.summary.broken_references}. See ${paths.markdownPath}`)
  }
  return { report, paths }
}

module.exports = {
  auditCanonicalLinks,
  extractContentLinks,
  scoreCandidates,
  writeCanonicalLinkReports,
  runCanonicalLinkAudit,
  renderMarkdown,
  renderCsv,
  plainValue,
  docField,
  docLink,
  docTitle,
  safeDecodeUrl,
  contentLinkTarget,
  sourceTokenAliases,
  canonicalRecordsFrom,
}
