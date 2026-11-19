# Canonical Lark Link Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a durable file-centric audit workflow that lists invalid Feishu/Lark `mention_doc` and hyperlink references in Base-listed docs, suggests only current-Base canonical replacements, and guides authors to fix Feishu source content.

**Architecture:** Extract canonical-link scanning, scoring, and report generation into a focused auditor module used by the existing scraper and CLI command. Keep the current export shim as an explicit compatibility mechanism, but make the new audit reports the primary repair workflow. Reports are generated from cached source JSON and Base records, so they can run after a fetch, before export, or as a standalone check.

**Tech Stack:** Node.js CommonJS, Docusaurus CLI plugin hooks, Feishu/Lark Base records, cached `plugins/lark-docs/meta/sources/**/*.json`, built-in `node:test`/`assert`, existing lark-docs regression test style.

---

## File Structure

- Create: `plugins/lark-docs/canonicalLinkAuditor.js` — scans source JSON, builds canonical maps, scores replacement candidates, and writes JSON/Markdown/CSV reports.
- Create: `plugins/lark-docs/canonicalLinkAuditor.test.js` — focused unit tests for extraction, validity, candidate scoring, and report rendering.
- Modify: `plugins/lark-docs/larkDocScraper.js` — delegate `validate_content_links()` to the auditor while preserving the old report shape.
- Modify: `plugins/lark-docs/index.js` — add CLI options and wire the audit into source-only and publish-target flows.
- Modify: `scripts/generate-lark-link-candidates.js` — either wrap the new auditor output or print a deprecation message that points to the new report.
- Use: `plugins/lark-docs/regression.test.js` and `plugins/lark-docs/larkDocScraper.test.js` — verify existing behavior still passes.

### Task 1: Add the canonical link auditor module

**Files:**
- Create: `plugins/lark-docs/canonicalLinkAuditor.js`
- Test: `plugins/lark-docs/canonicalLinkAuditor.test.js`

- [ ] **Step 1: Write failing extraction and validity tests**

Create `plugins/lark-docs/canonicalLinkAuditor.test.js` with these tests:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  auditCanonicalLinks,
  extractContentLinks,
  scoreCandidates,
} = require('./canonicalLinkAuditor')

function writeJson(dir, file, value) {
  fs.writeFileSync(path.join(dir, file), JSON.stringify(value, null, 2))
}

function source(overrides = {}) {
  return {
    title: 'Source Doc',
    slug: 'source-doc',
    node_token: 'source-token',
    origin_node_token: 'source-origin-token',
    blocks: {
      items: [
        {
          block_id: 'block-1',
          block_type: 2,
          text: {
            elements: [
              {
                mention_doc: {
                  title: 'Old Mention',
                  url: 'https://zilliverse.feishu.cn/wiki/old-target-token',
                },
              },
              {
                text_run: {
                  content: 'Old Link',
                  text_element_style: {
                    link: {
                      url: 'https%3A%2F%2Fzilliverse.feishu.cn%2Fdocx%2Fold-docx-token%23heading-block',
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
    ...overrides,
  }
}

test('extractContentLinks returns mention_doc and href_link occurrences with block id and JSON path', () => {
  const links = extractContentLinks(source())
  assert.equal(links.length, 2)
  assert.deepEqual(
    links.map(link => ({
      source_type: link.source_type,
      block_id: link.block_id,
      link_text: link.link_text,
      token: link.token,
      anchor: link.anchor,
      json_path: link.json_path,
    })),
    [
      {
        source_type: 'mention_doc',
        block_id: 'block-1',
        link_text: 'Old Mention',
        token: 'old-target-token',
        anchor: null,
        json_path: '$.blocks.items[0].text.elements[0].mention_doc',
      },
      {
        source_type: 'href_link',
        block_id: 'block-1',
        link_text: 'Old Link',
        token: 'old-docx-token',
        anchor: 'heading-block',
        json_path: '$.blocks.items[0].text.elements[1].text_run.text_element_style.link',
      },
    ]
  )
})

test('auditCanonicalLinks scans canonical sources and reports non-canonical targets by source file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-link-audit-'))
  writeJson(dir, 'source-token.json', source())
  writeJson(dir, 'valid-target-token.json', source({
    title: 'Valid Target',
    slug: 'valid-target',
    node_token: 'valid-target-token',
    origin_node_token: 'valid-origin-token',
    blocks: { items: [] },
  }))
  writeJson(dir, 'non-canonical-source.json', source({
    title: 'Non Canonical',
    slug: 'non-canonical',
    node_token: 'non-canonical-source-token',
  }))

  const records = [
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source-doc',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
    {
      record_id: 'rec-valid',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Valid Target', link: 'https://zilliverse.feishu.cn/wiki/valid-target-token' },
        Slug: 'valid-target',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
  ]

  const report = auditCanonicalLinks({
    manualName: 'guides',
    docSourceDir: dir,
    records,
    target: 'zilliz.saas',
  })

  assert.equal(report.summary.scanned_sources, 2)
  assert.equal(report.summary.skipped_noncanonical_sources, 1)
  assert.equal(report.summary.broken_references, 2)
  assert.equal(report.files.length, 1)
  assert.equal(report.files[0].source_file, 'source-token.json')
  assert.deepEqual(report.files[0].broken_references.map(item => item.source_type), ['mention_doc', 'href_link'])
})

test('scoreCandidates limits replacements to canonical Base records and ranks exact title first', () => {
  const candidates = scoreCandidates({
    occurrence: { link_text: 'Data Transfer Cost', target_source: null },
    canonicalRecords: [
      {
        record_id: 'rec-1',
        table_name: 'Guides',
        title: 'Data Transfer Cost',
        labels: '',
        slug: 'data-transfer-cost',
        doc_token: 'canonical-token',
        doc_link: 'https://zilliverse.feishu.cn/wiki/canonical-token',
      },
      {
        record_id: 'rec-2',
        table_name: 'Guides',
        title: 'Unrelated Page',
        labels: '',
        slug: 'unrelated-page',
        doc_token: 'other-token',
        doc_link: 'https://zilliverse.feishu.cn/wiki/other-token',
      },
    ],
  })
  assert.equal(candidates[0].doc_token, 'canonical-token')
  assert.equal(candidates[0].confidence, 'exact')
})
```

- [ ] **Step 2: Run tests and confirm the module is missing**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
```

Expected: FAIL with an error like `Cannot find module './canonicalLinkAuditor'`.

- [ ] **Step 3: Implement the auditor module**

Create `plugins/lark-docs/canonicalLinkAuditor.js`:

```js
const fs = require('node:fs')
const path = require('node:path')
const slugify = require('slugify')

function plainValue(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(plainValue).filter(Boolean).join(', ')
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

function safeDecodeUrl(value) {
  if (!value) return null
  let decoded = String(value)
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch (_) {
      break
    }
  }
  return decoded
}

function contentLinkTarget(url) {
  const decoded = safeDecodeUrl(url)
  if (!decoded) return null
  const linkMatch = decoded.match(/https?:\/\/\S+/)
  const link = linkMatch ? linkMatch[0] : decoded.trim()
  let parsed
  try {
    parsed = new URL(link)
  } catch (_) {
    return null
  }
  const host = parsed.hostname.toLowerCase()
  if (!host.includes('feishu.cn') && !host.includes('larksuite.com')) return null
  const segments = parsed.pathname.split('/').filter(Boolean)
  const kind = segments[0]
  if (!['wiki', 'doc', 'docs', 'docx'].includes(kind)) return null
  const token = segments[segments.length - 1]
  if (!token) return null
  return { url: decoded, token, kind, anchor: parsed.hash ? parsed.hash.slice(1) : null }
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
  return recordToken(record) && record.fields?.Slug ? 'canonical' : 'section'
}

function canonicalRecordsFrom(records) {
  return (records || [])
    .filter(record => placementType(record) === 'canonical')
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
  for (const record of canonicalRecords) {
    canonicalByToken.set(record.doc_token, record)
    const source = sources.get(record.doc_token)
    if (source) {
      for (const alias of sourceTokenAliases(source)) {
        canonicalByToken.set(alias, record)
      }
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

function auditCanonicalLinks({ manualName, docSourceDir, records, target }) {
  const sources = loadSources(docSourceDir)
  const { canonicalByToken, canonicalRecords } = buildCanonicalMap(records, sources)
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
    const isCanonicalSource = sourceTokenAliases(source).some(token => canonicalByToken.has(token))
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
      const occurrence = { ...reference, source_file: file, target_source: targetSource && {
        title: targetSource.title || targetSource.name || '',
        slug: targetSource.slug || '',
      }}
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

module.exports = {
  auditCanonicalLinks,
  extractContentLinks,
  scoreCandidates,
  plainValue,
  docField,
  docLink,
  docTitle,
  safeDecodeUrl,
  contentLinkTarget,
}
```

- [ ] **Step 4: Run focused tests and fix any path mismatch**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
```

Expected: PASS. If the JSON path differs, update the implementation so it matches the tested paths because the report needs stable author-facing locations.

- [ ] **Step 5: Commit the auditor module**

Run:

```bash
git add plugins/lark-docs/canonicalLinkAuditor.js plugins/lark-docs/canonicalLinkAuditor.test.js
git commit -m "feat: add canonical lark link auditor"
```

Expected: one commit containing only the new auditor and tests.

### Task 2: Add markdown and CSV report writers

**Files:**
- Modify: `plugins/lark-docs/canonicalLinkAuditor.js`
- Modify: `plugins/lark-docs/canonicalLinkAuditor.test.js`

- [ ] **Step 1: Add failing report rendering tests**

Append this test to `plugins/lark-docs/canonicalLinkAuditor.test.js`:

```js
test('writeCanonicalLinkReports writes JSON, markdown, and CSV repair guides', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-link-reports-'))
  const prefix = path.join(dir, 'guides-canonical-link-audit')
  const report = {
    generated_at: '2026-07-02T00:00:00.000Z',
    manual: 'guides',
    target: 'zilliz.saas',
    source_dir: '/sources/guides',
    summary: {
      canonical_records: 1,
      scanned_sources: 1,
      skipped_noncanonical_sources: 0,
      internal_references: 1,
      valid_references: 0,
      broken_references: 1,
    },
    files: [
      {
        source_file: 'source-token.json',
        source_title: 'Source Doc',
        source_token: 'source-token',
        source_slug: 'source-doc',
        source_doc_url: 'https://zilliverse.feishu.cn/wiki/source-token',
        source_block_url: 'https://zilliverse.feishu.cn/wiki/source-token#block-1',
        broken_references: [
          {
            source_type: 'mention_doc',
            block_id: 'block-1',
            json_path: '$.blocks.items[0].text.elements[0].mention_doc',
            link_text: 'Old Mention',
            token: 'old-target-token',
            raw_url: 'https://zilliverse.feishu.cn/wiki/old-target-token',
            anchor: null,
            candidates: [
              {
                score: 100,
                confidence: 'exact',
                title: 'Canonical Doc',
                slug: 'canonical-doc',
                doc_token: 'canonical-token',
                doc_link: 'https://zilliverse.feishu.cn/wiki/canonical-token',
                record_id: 'rec-canonical',
                table_name: 'Guides',
                reason: 'exact title',
                query: 'Canonical Doc',
              },
            ],
            recommended_action: 'Replace the mention_doc with a new Feishu document mention for "Canonical Doc" (https://zilliverse.feishu.cn/wiki/canonical-token).',
          },
        ],
      },
    ],
  }

  const { jsonPath, markdownPath, csvPath } = writeCanonicalLinkReports(report, prefix)
  assert.ok(fs.existsSync(jsonPath))
  assert.ok(fs.existsSync(markdownPath))
  assert.ok(fs.existsSync(csvPath))
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /## Source Doc/)
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /\[Old Mention\]\(https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token#block-1\)/)
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /Replace the mention_doc/)
  assert.match(fs.readFileSync(csvPath, 'utf8'), /source-token\.json,Source Doc,source-token,source-doc,https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token,https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token#block-1/)
})
```

Also update the import at the top:

```js
const {
  auditCanonicalLinks,
  extractContentLinks,
  scoreCandidates,
  writeCanonicalLinkReports,
} = require('./canonicalLinkAuditor')
```

- [ ] **Step 2: Run focused tests and confirm the writer is missing**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
```

Expected: FAIL with `writeCanonicalLinkReports is not a function`.

- [ ] **Step 3: Implement report writers**

Add these functions to `plugins/lark-docs/canonicalLinkAuditor.js` before `module.exports`:

```js
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
  const jsonPath = `${outputPrefix}.json`
  const markdownPath = `${outputPrefix}.md`
  const csvPath = `${outputPrefix}.csv`
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  fs.writeFileSync(markdownPath, renderMarkdown(report))
  fs.writeFileSync(csvPath, renderCsv(report))
  return { jsonPath, markdownPath, csvPath }
}
```

Export the new functions:

```js
module.exports = {
  auditCanonicalLinks,
  extractContentLinks,
  scoreCandidates,
  writeCanonicalLinkReports,
  renderMarkdown,
  renderCsv,
  plainValue,
  docField,
  docLink,
  docTitle,
  safeDecodeUrl,
  contentLinkTarget,
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit report writers**

Run:

```bash
git add plugins/lark-docs/canonicalLinkAuditor.js plugins/lark-docs/canonicalLinkAuditor.test.js
git commit -m "feat: write canonical link repair reports"
```

Expected: one commit with report rendering and tests.

### Task 3: Wire the scraper compatibility layer

**Files:**
- Modify: `plugins/lark-docs/larkDocScraper.js`
- Modify: `plugins/lark-docs/larkDocScraper.test.js`

- [ ] **Step 1: Add a compatibility test for the old report shape**

Append a test in `plugins/lark-docs/larkDocScraper.test.js` that constructs a scraper with mocked `records` and source JSON, then calls `validate_content_links()` and verifies `broken_content_links` still exists:

```js
test('validate_content_links preserves legacy broken_content_links report shape', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-content-links-'))
  fs.writeFileSync(path.join(dir, 'source-token.json'), JSON.stringify({
    title: 'Source Doc',
    slug: 'source-doc',
    node_token: 'source-token',
    blocks: {
      items: [
        {
          block_id: 'block-1',
          block_type: 2,
          text: {
            elements: [
              {
                mention_doc: {
                  title: 'Missing Doc',
                  url: 'https://zilliverse.feishu.cn/wiki/missing-token',
                },
              },
            ],
          },
        },
      ],
    },
  }, null, 2))

  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', dir)
  scraper.records = [
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source-doc',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
  ]
  scraper.base_tables = [{ table_id: 'tbl', name: 'Guides', index: 0 }]

  const reportPath = path.join(dir, 'legacy-report.json')
  const report = await scraper.validate_content_links({ reportPath })
  assert.equal(report.summary.broken_content_links, 1)
  assert.equal(report.broken_content_links.length, 1)
  assert.equal(report.broken_content_links[0].source_file, 'source-token.json')
})
```

- [ ] **Step 2: Run the scraper test and confirm current behavior still passes or exposes the integration gap**

Run:

```bash
node plugins/lark-docs/larkDocScraper.test.js
```

Expected: PASS before refactor if the old implementation handles the fixture; after refactor it must continue to pass.

- [ ] **Step 3: Import the auditor in `larkDocScraper.js`**

Add near the top:

```js
const { auditCanonicalLinks } = require('./canonicalLinkAuditor')
```

- [ ] **Step 4: Replace the body of `validate_content_links()` with an auditor-backed legacy adapter**

Keep the method name and signature, but make it produce the old report:

```js
async validate_content_links({ reportPath = null, failOnBroken = false } = {}) {
  if (!this.records) {
    await this.__base()
  }

  const canonicalReport = auditCanonicalLinks({
    manualName: 'legacy',
    docSourceDir: this.doc_source_dir,
    records: this.records,
    target: null,
  })

  const brokenContentLinks = []
  for (const file of canonicalReport.files) {
    for (const reference of file.broken_references) {
      brokenContentLinks.push({
        reason: 'missing canonical',
        source_file: file.source_file,
        source_type: reference.source_type,
        source_token: reference.source_token,
        source_title: reference.source_title,
        source_slug: reference.source_slug,
        block_id: reference.block_id,
        link_text: reference.link_text,
        raw_url: reference.raw_url,
        url: reference.url,
        token: reference.token,
        kind: reference.kind,
        anchor: reference.anchor,
      })
    }
  }

  const report = {
    generated_at: canonicalReport.generated_at,
    source_dir: this.doc_source_dir,
    base_app_token: this.base_app_token,
    base_table_id: this.base_table_id,
    summary: {
      canonical_tokens: canonicalReport.summary.canonical_records,
      scanned_sources: canonicalReport.summary.scanned_sources,
      skipped_noncanonical_sources: canonicalReport.summary.skipped_noncanonical_sources,
      content_links: canonicalReport.summary.internal_references,
      broken_content_links: canonicalReport.summary.broken_references,
    },
    broken_content_links: brokenContentLinks,
  }

  const output = reportPath || this.__content_link_report_path()
  fs.mkdirSync(node_path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(report, null, 2))

  if (brokenContentLinks.length > 0) {
    console.warn(`[content-links] Found ${brokenContentLinks.length} Feishu doc link(s) without canonical Base records. Report written to ${output}`)
    if (failOnBroken) {
      throw new Error(`[content-links] Broken content links found: ${brokenContentLinks.length}. See ${output}`)
    }
  } else {
    console.log(`[content-links] No broken Feishu doc links found. Report written to ${output}`)
  }

  return report
}
```

- [ ] **Step 5: Run scraper and focused tests**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
node plugins/lark-docs/larkDocScraper.test.js
```

Expected: both commands PASS.

- [ ] **Step 6: Commit scraper integration**

Run:

```bash
git add plugins/lark-docs/larkDocScraper.js plugins/lark-docs/larkDocScraper.test.js
git commit -m "refactor: route content link validation through canonical auditor"
```

Expected: one commit containing the compatibility integration.

### Task 4: Add CLI options and report generation

**Files:**
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/canonicalLinkAuditor.js`
- Test: manual command with existing source files

- [ ] **Step 1: Export a helper for running and writing reports from scraper records**

Add to `plugins/lark-docs/canonicalLinkAuditor.js`:

```js
function runCanonicalLinkAudit({ manualName, docSourceDir, records, target, outputPrefix, failOnBroken = false }) {
  const report = auditCanonicalLinks({ manualName, docSourceDir, records, target })
  const paths = writeCanonicalLinkReports(report, outputPrefix)
  if (failOnBroken && report.summary.broken_references > 0) {
    throw new Error(`[canonical-links] Broken canonical links found: ${report.summary.broken_references}. See ${paths.markdownPath}`)
  }
  return { report, paths }
}
```

Add it to `module.exports`.

- [ ] **Step 2: Import the helper in `plugins/lark-docs/index.js`**

Add near the existing imports:

```js
const { runCanonicalLinkAudit } = require('./canonicalLinkAuditor')
```

- [ ] **Step 3: Add CLI options**

Add options after the current link validation options:

```js
.option('--auditCanonicalLinks', 'Write file-centric canonical mention_doc and Feishu link audit reports')
.option('--canonicalLinkReportPrefix <path>', 'Output prefix for canonical link audit reports')
.option('--failOnBrokenCanonicalLinks', 'Fail when canonical link audit finds links or mention_docs outside the current Base')
```

- [ ] **Step 4: Add an audit helper inside the command action**

After `validateContentLinks` is defined, add:

```js
const auditCanonicalLinks = async ({ fresh = false } = {}) => {
  if (!opts.auditCanonicalLinks && !opts.failOnBrokenCanonicalLinks) return null
  const auditScraper = fresh ? new docScraper(root, base, sourceType, docSourceDir) : scraper
  if (!auditScraper.records) {
    await auditScraper.__base()
  }
  const prefix = opts.canonicalLinkReportPrefix ||
    `./plugins/lark-docs/meta/reports/${manualName}-canonical-link-audit`
  const { report, paths } = runCanonicalLinkAudit({
    manualName,
    docSourceDir,
    records: auditScraper.records,
    target: opts.pubTarget || null,
    outputPrefix: prefix,
    failOnBroken: !!opts.failOnBrokenCanonicalLinks,
  })
  console.log(`[canonical-links] Report written to ${paths.markdownPath}`)
  return report
}
```

- [ ] **Step 5: Call the audit in source-only mode after sources are fetched**

In the `opts.sourceOnly` branches, call:

```js
await auditCanonicalLinks({ fresh: true })
```

Place it after `validateContentLinks(...)` so both old and new reports can be generated in one run.

- [ ] **Step 6: Call the audit in publish-target mode before writing docs**

In the main publish-target flow, after `validateContentLinks(...)` and before `writer.write_docs(outputDir, root)`, add:

```js
await auditCanonicalLinks()
```

Expected: `--failOnBrokenCanonicalLinks` stops before export when broken references exist.

- [ ] **Step 7: Add standalone audit behavior**

Near the existing standalone `--validateLinks` guard, add:

```js
if ((opts.auditCanonicalLinks || opts.failOnBrokenCanonicalLinks) && opts.pubTarget === undefined && !opts.sourceOnly && opts.docToken === undefined) {
  await auditCanonicalLinks()
  return
}
```

Expected: maintainers can audit existing source files without publishing.

- [ ] **Step 8: Run syntax and focused tests**

Run:

```bash
node -c plugins/lark-docs/index.js
node -c plugins/lark-docs/canonicalLinkAuditor.js
node plugins/lark-docs/canonicalLinkAuditor.test.js
node plugins/lark-docs/larkDocScraper.test.js
```

Expected: all commands PASS.

- [ ] **Step 9: Commit CLI wiring**

Run:

```bash
git add plugins/lark-docs/index.js plugins/lark-docs/canonicalLinkAuditor.js
git commit -m "feat: expose canonical link audit reports"
```

Expected: one commit with CLI behavior and helper export.

### Task 5: Migrate the old candidate script to the new report

**Files:**
- Modify: `scripts/generate-lark-link-candidates.js`

- [ ] **Step 1: Replace the script body with a compatibility wrapper**

Change `scripts/generate-lark-link-candidates.js` so it reads the new JSON report when available and writes a short guidance message:

```js
const fs = require('node:fs')

const reportPath = process.argv[2] || './plugins/lark-docs/meta/reports/guides-canonical-link-audit.json'

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
```

- [ ] **Step 2: Run the wrapper against an existing or synthetic report**

Run:

```bash
node scripts/generate-lark-link-candidates.js plugins/lark-docs/meta/reports/guides-canonical-link-audit.json
```

Expected: If the report exists, it prints the guidance JSON. If it does not exist, it exits with the documented command to generate it.

- [ ] **Step 3: Commit script migration**

Run:

```bash
git add scripts/generate-lark-link-candidates.js
git commit -m "chore: point lark link candidate script to canonical audit"
```

Expected: one commit containing only the compatibility wrapper.

### Task 6: Verify against real guide sources

**Files:**
- Generated: `plugins/lark-docs/meta/reports/guides-canonical-link-audit.json`
- Generated: `plugins/lark-docs/meta/reports/guides-canonical-link-audit.md`
- Generated: `plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv`

- [ ] **Step 1: Run the audit using existing guide sources**

Run:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --auditCanonicalLinks
```

Expected: command writes the three canonical audit reports. If local Base credentials are missing, rerun in an environment with `APP_ID`, `APP_SECRET`, `FEISHU_HOST`, and any existing repo-required Feishu variables configured.

- [ ] **Step 2: Inspect the markdown guide**

Run:

```bash
sed -n '1,120p' plugins/lark-docs/meta/reports/guides-canonical-link-audit.md
```

Expected: the top of the report shows summary counts, followed by source-file sections with broken `mention_doc` and `href_link` occurrences.

- [ ] **Step 3: Verify candidates are Base-listed canonical records**

Run:

```bash
node -e "const r=require('./plugins/lark-docs/meta/reports/guides-canonical-link-audit.json'); for (const f of r.files) for (const b of f.broken_references) for (const c of b.candidates) if (!c.record_id || !c.doc_token) throw new Error('bad candidate'); console.log('candidate records verified')"
```

Expected: prints `candidate records verified`.

- [ ] **Step 4: Verify fail mode**

Run:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --auditCanonicalLinks --failOnBrokenCanonicalLinks
```

Expected: if broken references exist, command exits non-zero and names the markdown report path. If no broken references exist, command exits zero.

- [ ] **Step 5: Run regression tests**

Run:

```bash
node plugins/lark-docs/canonicalLinkAuditor.test.js
node plugins/lark-docs/larkDocScraper.test.js
node plugins/lark-docs/regression.test.js
```

Expected: all tests PASS.

- [ ] **Step 6: Commit generated reports only if the repo policy keeps reports under version control**

Run:

```bash
git status --short plugins/lark-docs/meta/reports
```

Expected: decide based on existing repo practice. Existing report files are tracked today, so committing refreshed reports is acceptable when they are useful for review.

If committing:

```bash
git add plugins/lark-docs/meta/reports/guides-canonical-link-audit.json plugins/lark-docs/meta/reports/guides-canonical-link-audit.md plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv
git commit -m "chore: add guides canonical link audit report"
```

Expected: report artifacts are available for maintainers to review.

## Self-Review

- Spec coverage: The plan covers extraction, validity, file-centric reporting, replacement candidates, repair guidance, CLI behavior, compatibility, and verification.
- Placeholder scan: The plan contains concrete file paths, commands, and code snippets. It avoids deferred implementation notes.
- Type consistency: The shared report shape uses `summary`, `files`, `broken_references`, `candidates`, and `recommended_action` consistently across tests, implementation, and CLI integration.
