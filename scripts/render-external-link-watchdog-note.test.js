'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  cardStatus,
  main,
  renderExternalLinkWatchdogNote,
} = require('./render-external-link-watchdog-note')

function observation(classification, status, index = 0) {
  return {
    url: `https://${classification}-${index}.example.com`,
    classification,
    status,
    error: null,
    pages: [`docs/page-${index}.html`, `docs/second-${index}.html`],
    page_count: index === 0 ? 17 : 2,
  }
}

function fixture(expiredCount = 12) {
  const expired = Array.from({length: expiredCount}, (_, index) => observation('expired', 404, index))
  return {
    schema_version: 2,
    generated_at: '2026-08-05T01:00:00.000Z',
    tooling_sha: 'a'.repeat(40),
    content_sha: 'b'.repeat(40),
    workflow_run_url: 'https://github.com/zilliztech/zdoc/actions/runs/1',
    remote_sitemap_source: 'https://docs.zilliz.com/sitemap.xml',
    local_sitemap_source: 'build/en/sitemap.xml',
    summary: {
      deleted_routes: 12,
      added_routes: 12,
      checked_external_links: 100,
      healthy_external_links: 97 - expiredCount,
      expired_external_links: expiredCount,
      blocked_external_links: 1,
      transient_external_links: 1,
      other_external_links: 1,
    },
    deleted_routes: Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/deleted-${index}/`),
    added_routes: Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/added-${index}/`),
    expired_external_links: expired,
    blocked_external_links: [observation('blocked', 403)],
    transient_external_links: [observation('transient', 503)],
    other_external_links: [observation('other', 451)],
  }
}

test('renders identities, all summary counts, explanations, and bounded samples', () => {
  const note = renderExternalLinkWatchdogNote(fixture(), {
    artifactUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1/artifacts/2',
  })

  assert.match(note, /^# Documentation Site Change & Link Health Report/m)
  assert.match(note, /Workflow run: https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/1/)
  assert.match(note, /Complete report artifact: https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/1\/artifacts\/2/)
  assert.match(note, /Tooling SHA: a{40}/)
  assert.match(note, /Content SHA: b{40}/)
  assert.match(note, /Deleted routes: 12/)
  assert.match(note, /Added routes: 12/)
  assert.match(note, /External URLs checked: 100/)
  assert.match(note, /Healthy external URLs: 85/)
  assert.match(note, /Confirmed expired external URLs: 12/)
  assert.match(note, /Blocked external URLs: 1/)
  assert.match(note, /Transient external URLs: 1/)
  assert.match(note, /Other external URL responses: 1/)
  assert.match(note, /HTTP 401 or 403/)
  assert.match(note, /network errors, timeouts, or retryable HTTP responses/)
  assert.match(note, /production sitemap but are absent from the current `dev` build/)
  assert.match(note, /current `dev` build but not in the production sitemap/)
  assert.match(note, /Showing 5 of 12 deleted routes/)
  assert.match(note, /Showing 5 of 12 added routes/)
  assert.match(note, /Showing 5 of 12 confirmed expired URLs/)
  assert.match(note, /Pages shown: 2 of 17/)
  assert.doesNotMatch(note, /expired-5\.example\.com/)
  assert.doesNotMatch(note, /deleted-5\//)
  assert.doesNotMatch(note, /added-5\//)
  assert.match(note, /The artifact contains every unique URL and route/)
})

test('derives card presentation only from confirmed expiry', () => {
  assert.equal(cardStatus(fixture(12)), 'fail')
  assert.equal(cardStatus(fixture(0)), 'success')
})

test('writes the rendered note from command-line arguments', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'external-link-note-'))
  const input = path.join(directory, 'latest.json')
  const output = path.join(directory, 'note.md')
  fs.writeFileSync(input, JSON.stringify(fixture()))

  main(['--input', input, '--output', output, '--artifact-url', 'https://example.com/artifact'])

  assert.match(fs.readFileSync(output, 'utf8'), /Complete report artifact: https:\/\/example\.com\/artifact/)
})
