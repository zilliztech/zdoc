const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { collectNotes } = require('./collect-build-card-notes')

function withTempCwd(callback) {
  const originalCwd = process.cwd()
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'card-notes-'))
  try {
    process.chdir(dir)
    return callback(dir)
  } finally {
    process.chdir(originalCwd)
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
    assert.doesNotMatch(notes.join('\n'), /Broken Content Links Audit/)
    assert.doesNotMatch(notes.join('\n'), /Canonical Link Audit/)
  })
})

