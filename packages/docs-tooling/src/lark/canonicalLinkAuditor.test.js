const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  auditCanonicalLinks,
  canonicalRecordsFrom,
  extractContentLinks,
  scoreCandidates,
  writeCanonicalLinkReports,
} = require('./canonicalLinkAuditor')

test('canonicalRecordsFrom respects explicit placement and infers Feishu docs without requiring slug', () => {
  const records = [
    {
      record_id: 'guide-section',
      fields: {
        'Placement Type': 'section',
        Doc: { text: 'Guide section', link: 'https://example.feishu.cn/wiki/guide-section-token' },
      },
    },
    {
      record_id: 'guide-canonical',
      fields: {
        'Placement Type': 'canonical',
        Doc: { text: 'Guide canonical', link: 'https://example.feishu.cn/wiki/guide-canonical-token' },
        Slug: 'guide-canonical',
      },
    },
    {
      record_id: 'sdk-doc',
      fields: {
        Doc: { text: 'SDK method', link: 'https://example.feishu.cn/docx/sdk-doc-token' },
      },
    },
    {
      record_id: 'sdk-section',
      fields: { Title: 'Collection operations' },
    },
    {
      record_id: 'external-link',
      fields: {
        Doc: { text: 'External', link: 'https://example.com/reference' },
      },
    },
  ]

  assert.deepEqual(
    canonicalRecordsFrom(records).map(record => record.record_id),
    ['guide-canonical', 'sdk-doc'],
  )
})

test('canonicalRecordsFrom can restrict Guides sources to publishable canonical records', () => {
  const records = [
    {
      record_id: 'draft',
      fields: {
        Docs: { text: 'Draft', link: 'https://example.feishu.cn/wiki/draft-token' },
        Progress: 'Draft',
        'Placement Type': 'canonical',
      },
    },
    {
      record_id: 'empty-progress',
      fields: {
        Docs: { text: 'Hidden', link: 'https://example.feishu.cn/wiki/hidden-token' },
        Progress: '',
        'Placement Type': 'canonical',
      },
    },
  ]

  assert.deepEqual(canonicalRecordsFrom(records).map(record => record.record_id), ['draft', 'empty-progress'])
  assert.deepEqual(
    canonicalRecordsFrom(records, { guidesPublishableOnly: true }).map(record => record.record_id),
    ['draft'],
  )
})

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
  const sourceDoc = source()
  sourceDoc.base_record_id = 'rec-source'
  sourceDoc.base_placement_type = 'canonical'
  sourceDoc.blocks.items[0].text.elements.push({
    mention_doc: {
      title: 'Valid Alias Target',
      url: 'https://zilliverse.feishu.cn/wiki/valid-alias-target-token',
    },
  })
  writeJson(dir, 'source-token.json', sourceDoc)
  writeJson(dir, 'valid-target-token.json', source({
    title: 'Valid Target',
    slug: 'valid-target',
    node_token: 'valid-target-token',
    origin_node_token: 'valid-origin-token',
    base_record_id: 'rec-valid',
    base_placement_type: 'canonical',
    blocks: { items: [] },
  }))
  writeJson(dir, 'valid-alias-target-token.json', source({
    title: 'Valid Alias Target',
    slug: 'valid-alias-target',
    node_token: 'valid-alias-target-token',
    origin_node_token: 'valid-alias-origin-token',
    base_record_id: 'rec-valid-alias',
    base_placement_type: 'canonical',
    blocks: { items: [] },
  }))
  writeJson(dir, 'non-canonical-source.json', source({
    title: 'Non Canonical',
    slug: 'non-canonical',
    node_token: 'non-canonical-source-token',
    origin_node_token: 'non-canonical-origin-token',
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
    {
      record_id: 'rec-valid-alias',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Valid Alias Target', link: 'https://zilliverse.feishu.cn/wiki/old-valid-alias-target-token' },
        Slug: 'valid-alias-target',
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

  assert.equal(report.summary.scanned_sources, 3)
  assert.equal(report.summary.skipped_noncanonical_sources, 1)
  assert.equal(report.summary.broken_references, 2)
  assert.equal(report.files.length, 1)
  assert.equal(report.files[0].source_file, 'source-token.json')
  assert.deepEqual(report.files[0].broken_references.map(item => item.source_type), ['mention_doc', 'href_link'])
})

test('auditCanonicalLinks can scope validation to incremental source tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-link-audit-scope-'))
  const changed = source({
    title: 'Changed Source',
    slug: 'changed-source',
    node_token: 'changed-token',
    origin_node_token: 'changed-origin-token',
    base_record_id: 'rec-changed',
    base_placement_type: 'canonical',
  })
  const unchanged = source({
    title: 'Unchanged Source',
    slug: 'unchanged-source',
    node_token: 'unchanged-token',
    origin_node_token: 'unchanged-origin-token',
    base_record_id: 'rec-unchanged',
    base_placement_type: 'canonical',
  })
  writeJson(dir, 'changed-token.json', changed)
  writeJson(dir, 'unchanged-token.json', unchanged)

  const records = [
    {
      record_id: 'rec-changed',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Changed Source', link: 'https://zilliverse.feishu.cn/wiki/changed-token' },
        Slug: 'changed-source',
      },
    },
    {
      record_id: 'rec-unchanged',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Unchanged Source', link: 'https://zilliverse.feishu.cn/wiki/unchanged-token' },
        Slug: 'unchanged-source',
      },
    },
  ]

  const report = auditCanonicalLinks({
    manualName: 'guides',
    docSourceDir: dir,
    records,
    target: 'zilliz.saas',
    sourceTokens: ['changed-token'],
  })

  assert.equal(report.summary.scanned_sources, 1)
  assert.equal(report.summary.broken_references, 2)
  assert.deepEqual(report.files.map(file => file.source_file), ['changed-token.json'])
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

test('writeCanonicalLinkReports writes JSON, markdown, and CSV repair guides', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-link-reports-'))
  const prefix = path.join(dir, 'guides-canonical-link-audit')
  const staleReportPaths = [
    path.join(dir, 'guides-link-replacement-candidates.json'),
    path.join(dir, 'guides-link-replacement-candidates.md'),
    path.join(dir, 'guides-link-replacement-shim.draft.json'),
  ]
  staleReportPaths.forEach(file => fs.writeFileSync(file, 'stale'))
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
  staleReportPaths.forEach(file => assert.equal(fs.existsSync(file), false))
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /## Source Doc/)
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /\[Old Mention\]\(https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token#block-1\)/)
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /Replace the mention_doc/)
  assert.match(fs.readFileSync(csvPath, 'utf8'), /source-token\.json,Source Doc,source-token,source-doc,https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token,https:\/\/zilliverse\.feishu\.cn\/wiki\/source-token#block-1/)
})
