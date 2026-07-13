const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { brokenContentLinksNote, collectCardNotes, collectNotes } = require('./collect-build-card-notes')

test('collectCardNotes preserves workflow summary notes before report notes', () => {
  withTempCwd(() => {
    process.env.CARD_BASE_NOTES_JSON = '["# Workflow summary"]'
    fs.mkdirSync('plugins/link-checks/meta/reports', { recursive: true })
    fs.writeFileSync('plugins/link-checks/meta/reports/latest.md', '# Link checks\n\n- Broken links: 0')

    const notes = collectCardNotes()

    assert.equal(notes[0], '# Workflow summary')
    assert.match(notes[1], /# Link checks/)
  })
})

function withTempCwd(callback) {
  const originalCwd = process.cwd()
  const originalEnv = {
    CARD_REPORT_STARTED_AT: process.env.CARD_REPORT_STARTED_AT,
    GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
    GITHUB_SERVER_URL: process.env.GITHUB_SERVER_URL,
    CARD_REPORT_REF: process.env.CARD_REPORT_REF,
    CARD_BASE_NOTES_JSON: process.env.CARD_BASE_NOTES_JSON,
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'card-notes-'))
  try {
    process.chdir(dir)
    return callback(dir)
  } finally {
    process.chdir(originalCwd)
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

test('collectNotes omits generated reports older than the current card run', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-09T11:05:28.000Z'
    writeJson('plugins/lark-docs/meta/reports/guides-broken-content-links.json', {
      generated_at: '2026-07-08T14:24:27.205Z',
      source_dir: './plugins/lark-docs/meta/sources/guides',
      summary: { broken_content_links: 137 },
      broken_content_links: [],
    })
    writeJson('plugins/lark-docs/meta/reports/guides-canonical-link-audit.json', {
      generated_at: '2026-07-08T14:24:28.441Z',
      target: 'zilliz.saas',
      summary: { broken_references: 137 },
    })
    writeJson('plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json', {
      generated_at: '2026-07-09T11:14:01.219Z',
      mode: 'incremental',
      build_env: 'uat',
      changed_tokens: ['changed'],
      expanded_tokens: ['changed'],
      removed_tokens: [],
      warnings: [],
    })

    const notes = collectNotes()

    assert.equal(notes.length, 1)
    assert.match(notes[0], /# Incremental Fetch Plan/)
    assert.doesNotMatch(notes.join('\n'), /Canonical Content Links Audit/)
    assert.doesNotMatch(notes.join('\n'), /Canonical Link Audit/)
  })
})

test('broken content link report is attached as canonical content links note', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-09T11:05:28.000Z'
    process.env.GITHUB_REPOSITORY = 'zilliztech/zdoc'
    process.env.GITHUB_SERVER_URL = 'https://github.com'
    process.env.CARD_REPORT_REF = 'dev'
    writeJson('plugins/lark-docs/meta/reports/guides-broken-content-links.json', {
      generated_at: '2026-07-09T11:14:01.219Z',
      source_dir: './plugins/lark-docs/meta/sources/guides',
      summary: {
        canonical_tokens: 370,
        scanned_sources: 369,
        skipped_noncanonical_sources: 98,
        content_links: 2089,
        broken_content_links: 1,
      },
      broken_content_links: [{
        source_title: 'Managed Volumes',
        link_text: 'Storage Cost',
        url: 'https://zilliverse.feishu.cn/wiki/Uj3wwkysGiBhfqk8jsMckyiTnBb',
      }],
    })

    const note = brokenContentLinksNote()

    assert.match(note, /# Canonical Content Links Audit/)
    assert.match(note, /- Content links: 2089/)
    assert.match(note, /- Broken content links: 1/)
    assert.match(note, /Managed Volumes: "Storage Cost"/)
    assert.match(note, /guides-canonical-link-audit\.md/)
    assert.match(note, /guides-canonical-link-audit\.csv/)
    assert.match(note, /guides-broken-content-links\.json/)
    assert.match(note, /github\.com\/zilliztech\/zdoc\/blob\/dev\/plugins\/lark-docs\/meta\/reports\/guides-canonical-link-audit\.md/)
  })
})
