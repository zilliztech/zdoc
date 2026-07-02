# Lark Docs Incremental Fetch and Link Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Feishu-reported link-check results after every build and introduce a snapshot-based incremental Lark docs fetch planner that fetches changed docs plus cross-reference neighbors.

**Architecture:** Keep `fetch-lark-docs` as the orchestration entry point, but move planning and reporting into small modules. `link-checks` emits JSON/Markdown reports and always compares the local build against the production docs baseline in CI; `report-to-lark` posts those reports to the existing card; `incrementalFetchPlanner` computes changed and reference-expanded source tokens from Base records, cached sources, and a manual-plus-environment-scoped last-success snapshot.

**2026-07-02 amendment:** `lark-cli` confirmed the wiki metadata endpoints used by the planner:

- `GET /open-apis/wiki/v2/spaces/get_node` with query `token` and optional `obj_type`; response `data.node` includes `node_token`, `origin_node_token`, `obj_token`, `obj_type`, `obj_edit_time`, and related node fields.
- `GET /open-apis/wiki/v2/spaces/:space_id/nodes` with `parent_node_token`, `page_size`, and `page_token`; response `data.items[]` includes the same node metadata for subtree listings.

Because Base-listed docs can be scattered, the implementation uses `get_node` per current canonical Base record before fetching sources. Snapshot schema v2 stores wiki node metadata and the planner compares `revision_id` when present, falling back to `obj_edit_time`. Older snapshots without node metadata force one full fetch to establish the new baseline.

**Tech Stack:** Node.js CommonJS, Docusaurus CLI plugins, existing Feishu/Lark token fetcher, GitHub Actions, local JSON/Markdown report artifacts.

---

## File Structure

- Create: `plugins/link-checks/linkCheckReporter.js`
  - Pure helpers for summarizing sitemap diffs and broken external links into JSON and Markdown.
- Modify: `plugins/link-checks/index.js`
  - Use the reporter, collect page locations for broken external URLs, write `latest.json`, `latest.md`, and timestamped reports.
- Modify: `plugins/report-to-lark/index.js`
  - Add `--card-note-file` as a convenience mode that appends a note to the current card without advancing the stage, or documentably maps to existing state update behavior.
- Create: `plugins/lark-docs/sourceSnapshot.js`
  - Create/read/write build-environment-scoped last-success snapshots from Base records and cached source JSON.
- Create: `plugins/lark-docs/incrementalFetchPlanner.js`
  - Detect changed docs and expand through incoming/outgoing cross-reference links.
- Modify: `plugins/lark-docs/larkDocScraper.js`
  - Add a method to fetch a list of source tokens without clearing `docSourceDir`.
- Modify: `plugins/lark-docs/index.js`
  - Add CLI options and wire planner/fetch/audit behavior.
- Create: `plugins/lark-docs/incrementalFetchPlanner.test.js`
  - Unit tests for changed detection and cross-reference expansion.
- Create: `plugins/lark-docs/sourceSnapshot.test.js`
  - Unit tests for snapshot creation and source hashes.
- Create: `plugins/link-checks/linkCheckReporter.test.js`
  - Unit tests for report shaping.
- Create: `scripts/run-doc-build-stage.js`
  - Runs build and link checks, reports link-check summary to Feishu even on failure.
- Create: `scripts/update-lark-doc-snapshot.js`
  - Writes snapshots after successful workflow stages.
- Modify: `.github/workflows/fetch-docs-auto.yml`
  - Call incremental fetch and link-check reporting wrappers.
- Modify: `.github/workflows/fetch-docs-manual.yml`
  - Same as auto workflow, preserving `target_branch`.

## Task 1: Link-Check Report Helpers

**Files:**
- Create: `plugins/link-checks/linkCheckReporter.js`
- Create: `plugins/link-checks/linkCheckReporter.test.js`

- [ ] **Step 1: Write failing reporter tests**

Create `plugins/link-checks/linkCheckReporter.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  buildLinkCheckReport,
  renderLinkCheckMarkdown,
} = require('./linkCheckReporter')

test('buildLinkCheckReport groups broken external links with pages', () => {
  const report = buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/sitemap.xml',
    remoteUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/old/'],
    localUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/new/'],
    externalLinks: [
      { url: 'https://bad.example.com', page: 'docs/a.html', status: 404 },
      { url: 'https://bad.example.com', page: 'docs/b.html', status: 404 },
      { url: 'https://timeout.example.com', page: 'reference/c.html', error: 'timeout' },
    ],
  })

  assert.equal(report.summary.deleted_links, 1)
  assert.equal(report.summary.added_links, 1)
  assert.equal(report.summary.external_links, 2)
  assert.equal(report.summary.broken_external_links, 2)
  assert.deepEqual(report.deleted, ['https://docs.zilliz.com/docs/old/'])
  assert.deepEqual(report.added, ['https://docs.zilliz.com/docs/new/'])
  assert.equal(report.broken_external_links[0].url, 'https://bad.example.com')
  assert.deepEqual(report.broken_external_links[0].pages, ['docs/a.html', 'docs/b.html'])
})

test('renderLinkCheckMarkdown includes compact Feishu-ready summary', () => {
  const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/sitemap.xml',
    remoteUrls: ['https://docs.zilliz.com/docs/old/'],
    localUrls: ['https://docs.zilliz.com/docs/new/'],
    externalLinks: [{ url: 'https://bad.example.com', page: 'docs/a.html', status: 404 }],
  }))

  assert.match(markdown, /Link Checks/)
  assert.match(markdown, /Deleted routes: 1/)
  assert.match(markdown, /Added routes: 1/)
  assert.match(markdown, /Broken external URLs: 1/)
  assert.match(markdown, /https:\/\/bad\.example\.com/)
})
```

- [ ] **Step 2: Run reporter tests and verify failure**

Run:

```bash
node plugins/link-checks/linkCheckReporter.test.js
```

Expected: fail with `Cannot find module './linkCheckReporter'`.

- [ ] **Step 3: Implement reporter helper**

Create `plugins/link-checks/linkCheckReporter.js`:

```js
function groupBrokenExternalLinks(externalLinks) {
  const byUrl = new Map()
  for (const item of externalLinks) {
    const entry = byUrl.get(item.url) || {
      url: item.url,
      status: item.status || null,
      error: item.error || null,
      pages: [],
    }
    if (!entry.status && item.status) entry.status = item.status
    if (!entry.error && item.error) entry.error = item.error
    if (item.page && !entry.pages.includes(item.page)) entry.pages.push(item.page)
    byUrl.set(item.url, entry)
  }
  return [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url))
}

function buildLinkCheckReport({
  generatedAt = new Date().toISOString(),
  remoteSitemapSource,
  localSitemapSource,
  remoteUrls,
  localUrls,
  externalLinks,
}) {
  const deleted = remoteUrls.filter(url => !localUrls.includes(url))
  const added = localUrls.filter(url => !remoteUrls.includes(url))
  const brokenExternalLinks = groupBrokenExternalLinks(externalLinks)
  return {
    generated_at: generatedAt,
    remote_sitemap_source: remoteSitemapSource,
    local_sitemap_source: localSitemapSource,
    summary: {
      deleted_links: deleted.length,
      added_links: added.length,
      external_links: new Set(externalLinks.map(item => item.url)).size,
      broken_external_links: brokenExternalLinks.length,
    },
    deleted,
    added,
    broken_external_links: brokenExternalLinks,
  }
}

function listItems(items, renderItem, limit = 10) {
  if (!items.length) return '- None'
  const visible = items.slice(0, limit).map(renderItem)
  const hidden = items.length - visible.length
  if (hidden > 0) visible.push(`- ...and ${hidden} more`)
  return visible.join('\n')
}

function renderLinkCheckMarkdown(report) {
  const lines = []
  lines.push('# Link Checks', '')
  lines.push(`Generated: ${report.generated_at}`)
  lines.push(`Remote sitemap: ${report.remote_sitemap_source}`)
  lines.push(`Local sitemap: ${report.local_sitemap_source}`, '')
  lines.push('## Summary', '')
  lines.push(`- Deleted routes: ${report.summary.deleted_links}`)
  lines.push(`- Added routes: ${report.summary.added_links}`)
  lines.push(`- External URLs checked: ${report.summary.external_links}`)
  lines.push(`- Broken external URLs: ${report.summary.broken_external_links}`, '')
  lines.push('## Deleted Routes', '')
  lines.push(listItems(report.deleted, url => `- ${url}`), '')
  lines.push('## Added Routes', '')
  lines.push(listItems(report.added, url => `- ${url}`), '')
  lines.push('## Broken External URLs', '')
  lines.push(listItems(report.broken_external_links, item => {
    const status = item.status ? `HTTP ${item.status}` : item.error
    const pages = item.pages.slice(0, 3).join(', ')
    const suffix = item.pages.length > 3 ? `, ...and ${item.pages.length - 3} more` : ''
    return `- ${item.url} (${status}) on ${pages}${suffix}`
  }))
  return lines.join('\n')
}

module.exports = {
  buildLinkCheckReport,
  renderLinkCheckMarkdown,
}
```

- [ ] **Step 4: Verify reporter tests pass**

Run:

```bash
node plugins/link-checks/linkCheckReporter.test.js
```

Expected: all tests pass.

## Task 2: Make `link-checks` Persist Reports

**Files:**
- Modify: `plugins/link-checks/index.js`
- Test: `plugins/link-checks/linkCheckReporter.test.js`

- [ ] **Step 1: Refactor link collection to retain pages**

In `plugins/link-checks/index.js`, import helpers:

```js
const { buildLinkCheckReport, renderLinkCheckMarkdown } = require('./linkCheckReporter')
```

Change external link collection from a string array to entries:

```js
function htmlPagesUnder(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(dir, file))
}

function collectExternalLinkEntries() {
  const pages = [
    ...htmlPagesUnder('build/docs'),
    ...htmlPagesUnder('build/reference'),
  ]
  const entries = []
  for (const page of pages) {
    const content = fs.readFileSync(page, 'utf8')
    for (const match of content.matchAll(/<a .* href="([^"]+)"/g)) {
      const url = match[1]
      if (url.startsWith('http')) {
        entries.push({ url, page: page.replace(/^build\//, '') })
      }
    }
  }
  return entries
}
```

- [ ] **Step 2: Write reports after checks**

Inside `.action(async (opts) => { ... })`, after checking external URLs, write:

```js
const report = buildLinkCheckReport({
  remoteSitemapSource: resolveRemoteSitemapSource(),
  localSitemapSource: resolveLocalSitemapSource(),
  remoteUrls: remote,
  localUrls: local,
  externalLinks: brokenLinks,
})

const reportsDir = path.join(context.siteDir, 'plugins/link-checks/meta/reports')
fs.mkdirSync(reportsDir, { recursive: true })
const stamp = Date.now()
const latestJson = path.join(reportsDir, 'latest.json')
const latestMd = path.join(reportsDir, 'latest.md')
fs.writeFileSync(latestJson, JSON.stringify(report, null, 2))
fs.writeFileSync(latestMd, renderLinkCheckMarkdown(report))
fs.writeFileSync(path.join(reportsDir, `report_${stamp}.json`), JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(reportsDir, `report_${stamp}.md`), renderLinkCheckMarkdown(report))
console.log(`Link-check report written to ${latestMd}`)

if (report.summary.deleted_links > 0 || report.summary.broken_external_links > 0) {
  process.exitCode = 1
}
```

- [ ] **Step 3: Verify syntax and tests**

Run:

```bash
node -c plugins/link-checks/index.js
node plugins/link-checks/linkCheckReporter.test.js
```

Expected: syntax check passes and reporter tests pass.

- [ ] **Step 4: Set production as the CI baseline**

In `plugins/link-checks/index.js`, keep env overrides but make production the default remote baseline:

```js
const PRODUCTION_DOCS_URL = 'https://docs.zilliz.com/'

function resolveRemoteSitemapSource () {
  if (process.env.LINK_CHECKS_REMOTE_SITEMAP) {
    return process.env.LINK_CHECKS_REMOTE_SITEMAP
  }
  const remoteBaseUrl = process.env.LINK_CHECKS_REMOTE_BASE_URL || PRODUCTION_DOCS_URL
  return normalizeUrl(remoteBaseUrl)
}
```

Expected: daily UAT builds and production builds both compare local `build/sitemap.xml` against production unless an explicit local override is supplied.

## Task 3: Add Feishu Card Note Convenience

**Files:**
- Modify: `plugins/report-to-lark/index.js`

- [ ] **Step 1: Add CLI option**

Add an option next to existing card options:

```js
.option('--card-note-file <path>', 'Append a note file to the current progress card without advancing the stage')
```

- [ ] **Step 2: Implement note-only update**

Before the `--card-advance` branch, add:

```js
if (opts.cardNoteFile) {
  const state = loadState(context.siteDir)
  if (!state) {
    process.stderr.write('[report-to-lark] no card state — skipping note update\n')
    return
  }
  const note = fs.readFileSync(opts.cardNoteFile, 'utf8').trim()
  if (note) state.notes.push(note)
  saveState(context.siteDir, state)
  await patchCard(token, state.messageId, state, FEISHU_HOST)
  return
}
```

- [ ] **Step 3: Verify syntax**

Run:

```bash
node -c plugins/report-to-lark/index.js
```

Expected: no syntax errors.

## Task 4: Snapshot Module

**Files:**
- Create: `plugins/lark-docs/sourceSnapshot.js`
- Create: `plugins/lark-docs/sourceSnapshot.test.js`

- [ ] **Step 1: Write failing snapshot tests**

Create `plugins/lark-docs/sourceSnapshot.test.js`:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  createSourceSnapshot,
  readSnapshot,
  writeSnapshot,
} = require('./sourceSnapshot')

test('createSourceSnapshot records hashes and outgoing tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'))
  fs.writeFileSync(path.join(dir, 'source-token.json'), JSON.stringify({
    title: 'Source',
    slug: 'source',
    node_token: 'source-token',
    base_record_id: 'rec-source',
    base_placement_type: 'canonical',
    blocks: { items: [{
      block_id: 'b1',
      text: { elements: [{ mention_doc: { title: 'Target', url: 'https://zilliverse.feishu.cn/wiki/target-token' } }] },
    }] },
  }))

  const snapshot = createSourceSnapshot({
    manualName: 'guides',
    targetsBuilt: ['zilliz.saas', 'zilliz.paas'],
    buildEnv: 'uat',
    sourceBranch: 'dev',
    publishUrl: 'https://docs.cloud-uat3.zilliz.com',
    linkCheckRemote: 'https://docs.zilliz.com',
    docSourceDir: dir,
    baseAppToken: 'base-token',
    records: [{
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Development',
      fields: {
        Docs: { text: 'Source', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source',
        'Placement Type': 'canonical',
      },
    }],
  })

  assert.equal(snapshot.manual, 'guides')
  assert.deepEqual(snapshot.targets_built, ['zilliz.saas', 'zilliz.paas'])
  assert.equal(snapshot.build_env, 'uat')
  assert.equal(snapshot.source_branch, 'dev')
  assert.equal(snapshot.publish_url, 'https://docs.cloud-uat3.zilliz.com')
  assert.equal(snapshot.link_check_remote, 'https://docs.zilliz.com')
  assert.equal(snapshot.records.length, 1)
  assert.equal(snapshot.records[0].source_file, 'source-token.json')
  assert.equal(snapshot.records[0].outgoing_tokens[0], 'target-token')
  assert.match(snapshot.records[0].source_hash, /^[a-f0-9]{64}$/)
})

test('writeSnapshot and readSnapshot round trip JSON', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'))
  const file = path.join(dir, 'guides-last-success.json')
  const snapshot = { schema_version: 1, manual: 'guides', records: [] }
  writeSnapshot(file, snapshot)
  assert.deepEqual(readSnapshot(file), snapshot)
})
```

- [ ] **Step 2: Run snapshot tests and verify failure**

Run:

```bash
node plugins/lark-docs/sourceSnapshot.test.js
```

Expected: fail with `Cannot find module './sourceSnapshot'`.

- [ ] **Step 3: Implement snapshot module**

Create `plugins/lark-docs/sourceSnapshot.js` with:

```js
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {
  extractContentLinks,
  canonicalRecordsFrom,
  sourceTokenAliases,
} = require('./canonicalLinkAuditor')

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function readSnapshot(file) {
  return readJsonIfExists(file)
}

function writeSnapshot(file, snapshot) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2))
}

function sourceFilesByToken(docSourceDir) {
  const byToken = new Map()
  if (!fs.existsSync(docSourceDir)) return byToken
  for (const file of fs.readdirSync(docSourceDir).filter(item => item.endsWith('.json'))) {
    const filePath = path.join(docSourceDir, file)
    const raw = fs.readFileSync(filePath, 'utf8')
    const source = JSON.parse(raw)
    source.__source_file = file
    source.__source_hash = hashText(raw)
    for (const token of sourceTokenAliases(source)) byToken.set(token, source)
  }
  return byToken
}

function createSourceSnapshot({
  manualName,
  targetsBuilt,
  buildEnv,
  sourceBranch,
  publishUrl,
  linkCheckRemote,
  docSourceDir,
  baseAppToken,
  records,
}) {
  const sourceByToken = sourceFilesByToken(docSourceDir)
  const canonicalRecords = canonicalRecordsFrom(records)
  return {
    schema_version: 1,
    manual: manualName,
    targets_built: targetsBuilt || [],
    build_env: buildEnv || null,
    source_branch: sourceBranch || null,
    publish_url: publishUrl || null,
    link_check_remote: linkCheckRemote || 'https://docs.zilliz.com',
    generated_at: new Date().toISOString(),
    source_dir: docSourceDir,
    base_app_token: baseAppToken || null,
    records: canonicalRecords.map(record => {
      const source = sourceByToken.get(record.doc_token)
      const outgoingTokens = source ? extractContentLinks(source).map(link => link.token) : []
      return {
        record_id: record.record_id,
        table_id: record.table_id,
        table_name: record.table_name,
        placement_type: 'canonical',
        title: record.title,
        slug: record.slug,
        doc_token: record.doc_token,
        doc_link: record.doc_link,
        source_file: source?.__source_file || null,
        source_hash: source?.__source_hash || null,
        outgoing_tokens: [...new Set(outgoingTokens)].sort(),
      }
    }),
  }
}

module.exports = {
  createSourceSnapshot,
  readSnapshot,
  writeSnapshot,
  sourceFilesByToken,
}
```

- [ ] **Step 4: Verify snapshot tests pass**

Run:

```bash
node plugins/lark-docs/sourceSnapshot.test.js
```

Expected: all tests pass.

## Task 5: Incremental Fetch Planner

**Files:**
- Create: `plugins/lark-docs/incrementalFetchPlanner.js`
- Create: `plugins/lark-docs/incrementalFetchPlanner.test.js`

- [ ] **Step 1: Write failing planner tests**

Create `plugins/lark-docs/incrementalFetchPlanner.test.js` with tests for:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { planIncrementalFetch } = require('./incrementalFetchPlanner')

function writeSource(dir, token, outgoingTokens = []) {
  fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify({
    title: token,
    slug: token,
    node_token: token,
    base_record_id: `rec-${token}`,
    base_placement_type: 'canonical',
    blocks: { items: outgoingTokens.map((target, index) => ({
      block_id: `b${index}`,
      text: { elements: [{ mention_doc: { title: target, url: `https://zilliverse.feishu.cn/wiki/${target}` } }] },
    })) },
  }))
}

function record(token, title = token) {
  return {
    record_id: `rec-${token}`,
    base_table_id: 'tbl',
    base_table_name: 'Guides',
    fields: {
      Docs: { text: title, link: `https://zilliverse.feishu.cn/wiki/${token}` },
      Slug: token,
      'Placement Type': 'canonical',
    },
  }
}

test('planIncrementalFetch detects changed title and expands incoming and outgoing refs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))
  writeSource(dir, 'a', ['b'])
  writeSource(dir, 'b')
  writeSource(dir, 'c', ['a'])

  const previousSnapshot = {
    schema_version: 1,
    manual: 'guides',
    records: [
      { record_id: 'rec-a', doc_token: 'a', title: 'Old A', slug: 'a', source_hash: 'old' },
      { record_id: 'rec-b', doc_token: 'b', title: 'b', slug: 'b', source_hash: 'old' },
      { record_id: 'rec-c', doc_token: 'c', title: 'c', slug: 'c', source_hash: 'old' },
    ],
  }

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a', 'New A'), record('b'), record('c')],
    previousSnapshot,
    maxReferenceDepth: 1,
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.deepEqual(new Set(plan.expanded_tokens), new Set(['a', 'b', 'c']))
  assert.match(plan.reasons_by_token.a.join(' '), /title changed/)
  assert.match(plan.reasons_by_token.b.join(' '), /outgoing reference/)
  assert.match(plan.reasons_by_token.c.join(' '), /incoming reference/)
})

test('planIncrementalFetch falls back to full without previous snapshot', () => {
  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: '/missing',
    records: [record('a')],
    previousSnapshot: null,
  })
  assert.equal(plan.mode, 'full')
  assert.match(plan.warnings.join(' '), /No previous snapshot/)
})
```

- [ ] **Step 2: Run planner tests and verify failure**

Run:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
```

Expected: fail with `Cannot find module './incrementalFetchPlanner'`.

- [ ] **Step 3: Implement planner**

Create `plugins/lark-docs/incrementalFetchPlanner.js` with logic that:

- converts current canonical records using `canonicalRecordsFrom(records)`
- indexes previous snapshot records by `record_id`
- marks changed records for new record, title change, slug change, doc token change, missing source file
- builds outgoing graph from cached sources using `extractContentLinks`
- builds incoming graph by reversing outgoing references
- expands changed tokens through incoming and outgoing graph up to `maxReferenceDepth`
- returns `full` if no snapshot, parse failure, or changed count exceeds threshold

- [ ] **Step 4: Verify planner tests pass**

Run:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
```

Expected: all tests pass.

## Task 6: Partial Source Fetch Execution

**Files:**
- Modify: `plugins/lark-docs/larkDocScraper.js`
- Modify: `plugins/lark-docs/larkDocScraper.test.js`

- [ ] **Step 1: Add test for fetching selected Base tokens**

Extend `plugins/lark-docs/larkDocScraper.test.js` with a test that stubs `scraper.fetch(true, token)` and verifies `fetch_source_tokens(['a', 'b'])` calls it twice without deleting the source directory.

- [ ] **Step 2: Implement selected-token fetch helper**

Add to `larkDocScraper`:

```js
async fetch_source_tokens(tokens) {
  const uniqueTokens = [...new Set(tokens)].filter(Boolean)
  for (const token of uniqueTokens) {
    await this.fetch(true, token)
  }
  if (this.use_all_base_tables) {
    await this.__apply_base_navigation({ partialTables: true })
  }
}
```

- [ ] **Step 3: Verify scraper tests pass**

Run:

```bash
node plugins/lark-docs/larkDocScraper.test.js
```

Expected: all tests pass.

## Task 7: Wire Incremental CLI Options

**Files:**
- Modify: `plugins/lark-docs/index.js`

- [ ] **Step 1: Add options**

Add:

```js
.option('--incremental', 'Fetch only changed Base docs and cross-reference neighbors when a last-success snapshot exists')
.option('--incrementalPlanOnly', 'Write the incremental fetch plan and exit without fetching')
.option('--incrementalMaxReferenceDepth <n>', 'Reference expansion depth for --incremental', '1')
.option('--snapshotPath <path>', 'Override last-success snapshot path')
.option('--buildEnv <env>', 'Build environment for snapshot scoping: uat or production', process.env.DOCS_BUILD_ENV || 'local')
.option('--forceFullFetch', 'Ignore incremental planning and force a full source fetch')
```

- [ ] **Step 2: Load planner and snapshot helpers**

At top:

```js
const path = require('node:path')
const { planIncrementalFetch, writeIncrementalFetchPlanReports } = require('./incrementalFetchPlanner')
const { readSnapshot } = require('./sourceSnapshot')
```

- [ ] **Step 3: Integrate before full source fetch**

In source fetch branches that currently clear `docSourceDir`, insert:

```js
const snapshotEnv = opts.buildEnv || 'local'
const snapshotPath = opts.snapshotPath || `./plugins/lark-docs/meta/snapshots/${manualName}-${snapshotEnv}-last-success.json`
if (opts.incremental || opts.incrementalPlanOnly) {
  if (!scraper.records) await scraper.__base()
  const plan = planIncrementalFetch({
    manualName,
    docSourceDir,
    records: scraper.records,
    previousSnapshot: readSnapshot(snapshotPath),
    buildEnv: snapshotEnv,
    maxReferenceDepth: Number(opts.incrementalMaxReferenceDepth || 1),
    forceFull: !!opts.forceFullFetch,
  })
  writeIncrementalFetchPlanReports(plan, `./plugins/lark-docs/meta/reports/${manualName}-incremental-fetch-plan`)
  if (opts.incrementalPlanOnly) return
  if (plan.mode === 'incremental') {
    await scraper.fetch_source_tokens(plan.expanded_tokens)
  } else {
    fs.rmSync(docSourceDir, { recursive: true })
    fs.mkdirSync(docSourceDir, { recursive: true })
    await scraper.fetch(true)
  }
} else {
  fs.rmSync(docSourceDir, { recursive: true })
  fs.mkdirSync(docSourceDir, { recursive: true })
  await scraper.fetch(true)
}
```

- [ ] **Step 4: Verify syntax**

Run:

```bash
node -c plugins/lark-docs/index.js
```

Expected: no syntax errors.

## Task 8: Snapshot Update Script

**Files:**
- Create: `scripts/update-lark-doc-snapshot.js`

- [ ] **Step 1: Implement script**

Create a script that:

- parses `--manual`, `--targets-built`, `--build-env`, `--source-branch`, `--publish-url`, `--link-check-remote`, `--snapshotPath`
- loads `config/lark-docs.config.ts` through the same Docusaurus config path if possible, or accepts explicit `--sourceDir` and `--baseAppToken`
- instantiates `larkDocScraper`
- calls `__base()`
- calls `createSourceSnapshot`
- writes snapshot to `plugins/lark-docs/meta/snapshots/<manual>-<build-env>-last-success.json` by default

- [ ] **Step 2: Verify syntax**

Run:

```bash
node -c scripts/update-lark-doc-snapshot.js
```

Expected: no syntax errors.

## Task 9: Build Stage Wrapper

**Files:**
- Create: `scripts/run-doc-build-stage.js`

- [ ] **Step 1: Implement wrapper**

Create a script that runs:

1. build command
2. `npx docusaurus link-checks` with `LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com`
3. `npx docusaurus report-to-lark --card-note-file plugins/link-checks/meta/reports/latest.md`
4. `npx docusaurus report-to-lark --card-advance --status done`

If build or link checks fail:

- still try to post `latest.md` when it exists
- run `report-to-lark --card-advance --status fail --note-file ...`
- exit non-zero with the original failure code

- [ ] **Step 2: Verify syntax**

Run:

```bash
node -c scripts/run-doc-build-stage.js
```

Expected: no syntax errors.

## Task 10: Workflow Integration

**Files:**
- Modify: `.github/workflows/fetch-docs-auto.yml`
- Modify: `.github/workflows/fetch-docs-manual.yml`

- [ ] **Step 1: Use incremental fetch for source stages**

For the daily UAT workflow triggered from `dev`, set:

```yaml
env:
  DOCS_BUILD_ENV: uat
  DOCS_PUBLISH_URL: https://docs.cloud-uat3.zilliz.com
  LINK_CHECKS_REMOTE_BASE_URL: https://docs.zilliz.com
```

Change guide fetch commands to:

```bash
npx docusaurus fetch-lark-docs -man guides -tar zilliz.saas -s3 --incremental --buildEnv uat --auditCanonicalLinks
npx docusaurus fetch-lark-docs -man guides -tar zilliz.saas -post -skipS
npx docusaurus fetch-lark-docs -man guides -tar zilliz.paas -s3 -skipS
npx docusaurus fetch-lark-docs -man guides -tar zilliz.paas -post -skipS
```

Keep SDK source-only commands full fetch until the incremental planner supports non-Base drive manuals safely.

- [ ] **Step 2: Replace build/link-check pairs**

Replace:

```bash
pnpm run build
npx docusaurus report-to-lark --card-advance
...
npx docusaurus link-checks
npx docusaurus report-to-lark --card-advance
```

with:

```bash
node scripts/run-doc-build-stage.js --build "pnpm run build"
```

- [ ] **Step 3: Update snapshot after successful link checks**

After the EN docs build wrapper succeeds, add:

```bash
node scripts/update-lark-doc-snapshot.js --manual guides --targets-built zilliz.saas,zilliz.paas --build-env uat --source-branch dev --publish-url https://docs.cloud-uat3.zilliz.com --link-check-remote https://docs.zilliz.com
```

Production is promoted from a selected UAT build. Do not update the source snapshot during production promotion unless that process later performs a new source fetch. Keep `LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com` in both daily validation and production promotion workflows.

- [ ] **Step 4: Validate workflow YAML shape**

Run:

```bash
node -e "require('fs').readFileSync('.github/workflows/fetch-docs-auto.yml','utf8'); require('fs').readFileSync('.github/workflows/fetch-docs-manual.yml','utf8'); console.log('workflow files readable')"
```

Expected: prints `workflow files readable`.

## Task 11: End-to-End Local Verification

**Files:**
- No new files.

- [ ] **Step 1: Run unit tests**

Run:

```bash
node plugins/link-checks/linkCheckReporter.test.js
node plugins/lark-docs/sourceSnapshot.test.js
node plugins/lark-docs/incrementalFetchPlanner.test.js
node plugins/lark-docs/canonicalLinkAuditor.test.js
node plugins/lark-docs/larkDocScraper.test.js
```

Expected: all pass.

- [ ] **Step 2: Run plan-only incremental fetch**

Run:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --incrementalPlanOnly
```

Expected:

- writes `plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json`
- writes `plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md`
- does not modify source JSON files

- [ ] **Step 3: Run link-check report generation after build**

Run:

```bash
pnpm run build
pnpm docusaurus link-checks
```

Expected:

- writes `plugins/link-checks/meta/reports/latest.json`
- writes `plugins/link-checks/meta/reports/latest.md`
- exits non-zero if deleted routes or broken external links exist
- records `https://docs.zilliz.com` as the remote sitemap baseline unless `LINK_CHECKS_REMOTE_BASE_URL` or `LINK_CHECKS_REMOTE_SITEMAP` is explicitly set

## Self-Review

- Spec coverage: The plan covers link-check persistence, Feishu card reporting, snapshots, changed-doc detection, cross-reference expansion, partial fetch, workflow integration, and tests.
- Placeholder scan: No placeholder markers or unspecified “add tests” steps remain. Complex implementation sections name concrete files, functions, and expected behavior.
- Type consistency: The plan consistently uses `planIncrementalFetch`, `createSourceSnapshot`, `readSnapshot`, `writeSnapshot`, `buildLinkCheckReport`, and `renderLinkCheckMarkdown`.
