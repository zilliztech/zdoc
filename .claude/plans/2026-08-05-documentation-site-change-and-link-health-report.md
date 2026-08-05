# Documentation Site Change and Link Health Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a complete plain-Markdown site-change/link-health artifact and send a bounded, explanatory Feishu report after every successful external-link watchdog scan.

**Architecture:** Keep the schema-v2 JSON report unchanged as the authoritative model. Extend the TypeScript Markdown renderer to render every URL and route, add a small CommonJS renderer for the bounded Feishu note, then wire both outputs into the existing watchdog while preserving fail-closed scan/artifact behavior and best-effort Feishu delivery.

**Tech Stack:** TypeScript, Vitest, Node.js 22 `node:test`, zod, GitHub Actions YAML, Feishu report-card CLI, actionlint.

---

## File map

- Modify `packages/docs-tooling/src/links/check.ts`: render the complete Markdown report, multiline observations, and six explanatory paragraphs without changing the JSON schema.
- Modify `packages/docs-tooling/src/links/check.test.ts`: lock the exact readable Markdown contract, prove collections larger than ten remain complete, and cover empty sections.
- Create `scripts/render-external-link-watchdog-note.js`: validate the report fields consumed by Feishu and render one bounded note from the schema-v2 JSON plus the artifact URL.
- Create `scripts/render-external-link-watchdog-note.test.js`: verify identities, counts, explanations, bounded samples, and clean/expired status selection.
- Modify `.github/workflows/external-link-watchdog.yml`: generate the note, create/attach/finish a card after every successful scan, and derive presentation only from the expired count.
- Modify `scripts/external-link-watchdog-workflow.test.js`: assert ordering, unconditional reporting, exact title, best-effort behavior, and status binding.
- Modify `scripts/validate-workflow-policy.js` and `scripts/validate-workflow-policy.test.js`: reject future regressions to expiry-only reporting, an old title, a constant failure status, or Feishu work before artifact upload.

### Task 1: Make the Markdown artifact complete and self-explanatory

**Files:**
- Modify: `packages/docs-tooling/src/links/check.ts:403-460`
- Test: `packages/docs-tooling/src/links/check.test.ts:148-218`

- [ ] **Step 1: Replace the exact-contract test with the approved readable format**

Keep the existing fixture, but change its expected Markdown to this structure and exact explanatory text:

```typescript
expect(markdown).toBe([
  '# Documentation Site Change & Link Health Report',
  '',
  'Generated: 2026-07-02T00:00:00.000Z',
  'Workflow run: https://github.com/zilliztech/zdoc/actions/runs/1',
  `Tooling SHA: ${'a'.repeat(40)}`,
  `Content SHA: ${'b'.repeat(40)}`,
  'Remote sitemap: https://docs.zilliz.com/sitemap.xml',
  'Local sitemap: build/en/sitemap.xml',
  '',
  '## Summary',
  '',
  '- Deleted routes: 1',
  '- Added routes: 1',
  '- External URLs checked: 5',
  '- Healthy external URLs: 1',
  '- Confirmed expired external URLs: 1',
  '- Blocked external URLs: 1',
  '- Transient external URLs: 1',
  '- Other external URL responses: 1',
  '',
  '## Confirmed Expired External URLs',
  '',
  '> These URLs returned HTTP 404 or 410. They are likely removed or permanently unavailable and should be corrected, replaced, or removed.',
  '',
  '- https://expired.example.com',
  '  - Result: HTTP 404',
  '  - Referring pages: docs/a.html, docs/b.html',
  '  - Pages shown: 2 of 2',
  '',
  '## Blocked External URLs',
  '',
  '> These URLs returned HTTP 401 or 403. The scanner was denied access, so this does not prove the links are broken; review them only if users also cannot open them.',
  '',
  '- https://blocked.example.com',
  '  - Result: HTTP 403',
  '  - Referring pages: docs/c.html',
  '  - Pages shown: 1 of 1',
  '',
  '## Transient External URLs',
  '',
  '> These URLs failed because of network errors, timeouts, or retryable HTTP responses such as 408, 425, 429, or 5xx. They are not confirmed broken and should be checked again in a later run.',
  '',
  '- https://transient.example.com',
  '  - Result: Error: connection reset',
  '  - Referring pages: docs/d.html',
  '  - Pages shown: 1 of 1',
  '',
  '## Other External URL Responses',
  '',
  '> These URLs returned non-success responses that are not classified as expired, blocked, or transient. Review them manually to determine whether the response is expected.',
  '',
  '- https://other.example.com',
  '  - Result: HTTP 451',
  '  - Referring pages: docs/e.html',
  '  - Pages shown: 1 of 1',
  '',
  '## Deleted Routes',
  '',
  '> These routes exist in the production sitemap but are absent from the current `dev` build. They may represent intended removals or renames, or unexpected content loss.',
  '',
  '- https://docs.zilliz.com/docs/old/',
  '',
  '## Added Routes',
  '',
  '> These routes exist in the current `dev` build but not in the production sitemap. They are expected to become public after deployment, unless they represent unintended new routes.',
  '',
  '- https://docs.zilliz.com/docs/new/',
].join('\n'));
```

- [ ] **Step 2: Add a failing completeness and empty-section test**

Build twelve observations in each non-healthy classification plus twelve deleted and twelve added routes. Assert every generated URL is present, the text does not contain `...and`, `<details>`, or `</details>`, and an empty report still renders every explanation followed by `- None`.

```typescript
it('renders every unique URL and route without folding or truncation', () => {
  const statuses = {expired: 404, blocked: 403, transient: 503, other: 451} as const;
  const observations = Object.entries(statuses).flatMap(([classification, status]) => (
    Array.from({length: 12}, (_, index) => ({
      url: `https://${classification}-${index}.example.com`,
      pages: [`docs/${classification}-${index}.html`],
      status,
      error: null,
    }))
  ));
  const remoteUrls = Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/deleted-${index}/`);
  const localUrls = Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/added-${index}/`);
  const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    toolingSha: 'a'.repeat(40),
    contentSha: 'b'.repeat(40),
    workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/en/sitemap.xml',
    remoteUrls,
    localUrls,
    checkedExternalLinks: observations.map(({url}) => ({url})),
    observations,
  }));

  for (const item of observations) expect(markdown).toContain(`- ${item.url}\n`);
  for (const url of [...remoteUrls, ...localUrls]) expect(markdown).toContain(`- ${url}`);
  expect(markdown).not.toContain('...and');
  expect(markdown).not.toContain('<details>');
});

it('keeps explanations visible when detailed sections are empty', () => {
  const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
    generatedAt: '2026-07-02T00:00:00.000Z',
    toolingSha: null,
    contentSha: null,
    workflowRunUrl: null,
    remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
    localSitemapSource: 'build/en/sitemap.xml',
    remoteUrls: ['https://docs.zilliz.com/docs/shared/'],
    localUrls: ['https://docs.zilliz.com/docs/shared/'],
    checkedExternalLinks: [],
    observations: [],
  }));

  expect(markdown.match(/^- None$/gmu)).toHaveLength(6);
  expect(markdown).toContain('These URLs returned HTTP 404 or 410.');
  expect(markdown).toContain('These routes exist in the current `dev` build but not in the production sitemap.');
});
```

- [ ] **Step 3: Run the focused test and verify the old renderer fails**

Run: `pnpm vitest run packages/docs-tooling/src/links/check.test.ts`

Expected: FAIL because the old title and one-line observations do not match, collections stop at ten, and explanations are absent.

- [ ] **Step 4: Implement the complete renderer**

Replace `listItems` and `renderLinkCheckMarkdown` with a generic unbounded list helper, stable explanation constants, and multiline observations:

```typescript
const SECTION_EXPLANATIONS = {
  expired: 'These URLs returned HTTP 404 or 410. They are likely removed or permanently unavailable and should be corrected, replaced, or removed.',
  blocked: 'These URLs returned HTTP 401 or 403. The scanner was denied access, so this does not prove the links are broken; review them only if users also cannot open them.',
  transient: 'These URLs failed because of network errors, timeouts, or retryable HTTP responses such as 408, 425, 429, or 5xx. They are not confirmed broken and should be checked again in a later run.',
  other: 'These URLs returned non-success responses that are not classified as expired, blocked, or transient. Review them manually to determine whether the response is expected.',
  deleted: 'These routes exist in the production sitemap but are absent from the current `dev` build. They may represent intended removals or renames, or unexpected content loss.',
  added: 'These routes exist in the current `dev` build but not in the production sitemap. They are expected to become public after deployment, unless they represent unintended new routes.',
} as const;

function renderItems<T>(items: readonly T[], renderItem: (item: T) => string): string {
  return items.length === 0 ? '- None' : items.map(renderItem).join('\n');
}

export function renderLinkCheckMarkdown(report: LinkCheckReport): string {
  const renderExternalItem = (item: ExternalObservation): string => {
    const result = item.status === null ? `Error: ${item.error}` : `HTTP ${item.status}`;
    return [
      `- ${item.url}`,
      `  - Result: ${result}`,
      `  - Referring pages: ${item.pages.length === 0 ? 'None' : item.pages.join(', ')}`,
      `  - Pages shown: ${item.pages.length} of ${item.page_count}`,
    ].join('\n');
  };
  const section = <T>(title: string, explanation: string, items: readonly T[], renderItem: (item: T) => string): string[] => [
    `## ${title}`,
    '',
    `> ${explanation}`,
    '',
    renderItems(items, renderItem),
  ];
  const lines = [
    '# Documentation Site Change & Link Health Report',
    '',
    `Generated: ${report.generated_at}`,
    `Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `Tooling SHA: ${report.tooling_sha ?? 'None'}`,
    `Content SHA: ${report.content_sha ?? 'None'}`,
    `Remote sitemap: ${report.remote_sitemap_source}`,
    `Local sitemap: ${report.local_sitemap_source}`,
    '',
    '## Summary',
    '',
    `- Deleted routes: ${report.summary.deleted_routes}`,
    `- Added routes: ${report.summary.added_routes}`,
    `- External URLs checked: ${report.summary.checked_external_links}`,
    `- Healthy external URLs: ${report.summary.healthy_external_links}`,
    `- Confirmed expired external URLs: ${report.summary.expired_external_links}`,
    `- Blocked external URLs: ${report.summary.blocked_external_links}`,
    `- Transient external URLs: ${report.summary.transient_external_links}`,
    `- Other external URL responses: ${report.summary.other_external_links}`,
    '',
    ...section('Confirmed Expired External URLs', SECTION_EXPLANATIONS.expired, report.expired_external_links, renderExternalItem),
    '',
    ...section('Blocked External URLs', SECTION_EXPLANATIONS.blocked, report.blocked_external_links, renderExternalItem),
    '',
    ...section('Transient External URLs', SECTION_EXPLANATIONS.transient, report.transient_external_links, renderExternalItem),
    '',
    ...section('Other External URL Responses', SECTION_EXPLANATIONS.other, report.other_external_links, renderExternalItem),
    '',
    ...section('Deleted Routes', SECTION_EXPLANATIONS.deleted, report.deleted_routes, url => `- ${url}`),
    '',
    ...section('Added Routes', SECTION_EXPLANATIONS.added, report.added_routes, url => `- ${url}`),
  ];
  return lines.join('\n');
}
```

Do not alter `LinkCheckReportSchema`, `buildLinkCheckReport`, referring-page retention, or the four-file atomic write.

- [ ] **Step 5: Run tests and commit**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
pnpm typecheck
git add packages/docs-tooling/src/links/check.ts packages/docs-tooling/src/links/check.test.ts
git commit -m "feat: render complete link health reports"
```

Expected: all link-check tests and TypeScript checks pass; the Markdown tests prove all six collections are complete and explanatory.

### Task 2: Add a bounded, testable Feishu note renderer

**Files:**
- Create: `scripts/render-external-link-watchdog-note.js`
- Create: `scripts/render-external-link-watchdog-note.test.js`

- [ ] **Step 1: Write failing renderer tests**

Create a schema-v2 fixture with twelve deleted routes, twelve added routes, twelve expired observations, one blocked observation, one transient observation, and one other observation. Test both expired and clean summaries:

```javascript
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

function fixture(expiredCount = 12) {
  const expired = Array.from({length: expiredCount}, (_, index) => ({
    url: `https://expired-${index}.example.com`,
    classification: 'expired',
    status: 404,
    error: null,
    pages: [`docs/page-${index}.html`, `docs/second-${index}.html`],
    page_count: index === 0 ? 17 : 2,
  }))
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
    blocked_external_links: [],
    transient_external_links: [],
    other_external_links: [],
  }
}

test('renders identities, all summary counts, explanations, and bounded samples', () => {
  const note = renderExternalLinkWatchdogNote(fixture(), {
    artifactUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1/artifacts/2',
  })
  assert.match(note, /^# Documentation Site Change & Link Health Report/m)
  assert.match(note, /Complete report artifact: https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/1\/artifacts\/2/)
  assert.match(note, /Tooling SHA: a{40}/)
  assert.match(note, /Content SHA: b{40}/)
  assert.match(note, /Deleted routes: 12/)
  assert.match(note, /Added routes: 12/)
  assert.match(note, /Confirmed expired external URLs: 12/)
  assert.match(note, /HTTP 401 or 403/)
  assert.match(note, /network errors, timeouts, or retryable HTTP responses/)
  assert.match(note, /production sitemap but are absent from the current `dev` build/)
  assert.match(note, /Showing 5 of 12 deleted routes/)
  assert.match(note, /Showing 5 of 12 added routes/)
  assert.match(note, /Showing 5 of 12 confirmed expired URLs/)
  assert.match(note, /Pages shown: 2 of 17/)
  assert.doesNotMatch(note, /expired-5\.example\.com/)
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
```

- [ ] **Step 2: Run the test and verify the module is absent**

Run: `node --test scripts/render-external-link-watchdog-note.test.js`

Expected: FAIL with `MODULE_NOT_FOUND` for `render-external-link-watchdog-note`.

- [ ] **Step 3: Implement the renderer and CLI**

Create the CommonJS module with fixed sample limits, defensive count/array validation, and no dependency on workflow environment variables:

```javascript
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const SAMPLE_LIMIT = 5
const PAGE_SAMPLE_LIMIT = 2

function requireCount(report, key) {
  const value = report?.summary?.[key]
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${key} must be a non-negative safe integer`)
  return value
}

function requireList(report, key) {
  const value = report?.[key]
  if (!Array.isArray(value)) throw new Error(`${key} must be an array`)
  return value
}

function cardStatus(report) {
  return requireCount(report, 'expired_external_links') === 0 ? 'success' : 'fail'
}

function sampleRoutes(lines, label, routes) {
  lines.push(`### ${label} samples`, '', `Showing ${Math.min(routes.length, SAMPLE_LIMIT)} of ${routes.length} ${label.toLowerCase()}.`)
  lines.push(...(routes.length === 0 ? ['- None'] : routes.slice(0, SAMPLE_LIMIT).map(url => `- ${url}`)), '')
}

function sampleExpired(lines, observations) {
  lines.push('### Confirmed expired URL samples', '', `Showing ${Math.min(observations.length, SAMPLE_LIMIT)} of ${observations.length} confirmed expired URLs.`)
  if (observations.length === 0) lines.push('- None')
  for (const item of observations.slice(0, SAMPLE_LIMIT)) {
    const pages = Array.isArray(item.pages) ? item.pages.slice(0, PAGE_SAMPLE_LIMIT) : []
    lines.push(
      `- ${item.url}`,
      `  - Result: ${item.status === null ? `Error: ${item.error}` : `HTTP ${item.status}`}`,
      `  - Referring pages: ${pages.length === 0 ? 'None' : pages.join(', ')}`,
      `  - Pages shown: ${pages.length} of ${item.page_count}`,
    )
  }
  lines.push('')
}

function renderExternalLinkWatchdogNote(report, {artifactUrl}) {
  if (report?.schema_version !== 2) throw new Error('schema_version must be 2')
  if (!artifactUrl) throw new Error('artifactUrl is required')
  const deletedRoutes = requireList(report, 'deleted_routes')
  const addedRoutes = requireList(report, 'added_routes')
  const expired = requireList(report, 'expired_external_links')
  const lines = [
    '# Documentation Site Change & Link Health Report',
    '',
    `- Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `- Tooling SHA: ${report.tooling_sha ?? 'None'}`,
    `- Content SHA: ${report.content_sha ?? 'None'}`,
    `- Complete report artifact: ${artifactUrl}`,
    '- Scope: The artifact contains every unique URL and route; the lists below are bounded samples.',
    '',
    '## Summary',
    '',
    `- Deleted routes: ${requireCount(report, 'deleted_routes')}`,
    `- Added routes: ${requireCount(report, 'added_routes')}`,
    `- External URLs checked: ${requireCount(report, 'checked_external_links')}`,
    `- Healthy external URLs: ${requireCount(report, 'healthy_external_links')}`,
    `- Confirmed expired external URLs: ${requireCount(report, 'expired_external_links')}`,
    `- Blocked external URLs: ${requireCount(report, 'blocked_external_links')}`,
    `- Transient external URLs: ${requireCount(report, 'transient_external_links')}`,
    `- Other external URL responses: ${requireCount(report, 'other_external_links')}`,
    '',
    '## How to interpret this report',
    '',
    '- Expired URLs returned HTTP 404 or 410 and likely need correction, replacement, or removal.',
    '- Blocked URLs returned HTTP 401 or 403; scanner denial does not prove users cannot open them.',
    '- Transient URLs had network errors, timeouts, or retryable HTTP responses and should be checked in a later run.',
    '- Other responses are non-success results outside the expired, blocked, and transient classifications and need manual review.',
    '- Deleted routes exist in the production sitemap but are absent from the current `dev` build.',
    '- Added routes exist in the current `dev` build but not in the production sitemap.',
    '',
    '## Route changes',
    '',
  ]
  sampleRoutes(lines, 'Deleted routes', deletedRoutes)
  sampleRoutes(lines, 'Added routes', addedRoutes)
  lines.push('## External link attention', '')
  sampleExpired(lines, expired)
  return `${lines.join('\n')}\n`
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!['--input', '--output', '--artifact-url'].includes(flag) || !value) throw new Error('Usage: render-external-link-watchdog-note.js --input report.json --output note.md --artifact-url URL')
    values[flag.slice(2)] = value
  }
  if (!values.input || !values.output || !values['artifact-url']) throw new Error('input, output, and artifact-url are required')
  return values
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const report = JSON.parse(fs.readFileSync(args.input, 'utf8'))
  const note = renderExternalLinkWatchdogNote(report, {artifactUrl: args['artifact-url']})
  fs.mkdirSync(path.dirname(args.output), {recursive: true})
  fs.writeFileSync(args.output, note)
  return {status: cardStatus(report), output: args.output}
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {cardStatus, main, parseArgs, renderExternalLinkWatchdogNote}
```

- [ ] **Step 4: Run tests and commit**

```bash
node --test scripts/render-external-link-watchdog-note.test.js
git add scripts/render-external-link-watchdog-note.js scripts/render-external-link-watchdog-note.test.js
git commit -m "feat: render external watchdog card notes"
```

Expected: all renderer tests pass, clean and expired reports select different presentation, and samples remain bounded while pointing to the complete artifact.

### Task 3: Send and finish the Feishu card after every successful scan

**Files:**
- Modify: `.github/workflows/external-link-watchdog.yml:56-155`
- Test: `scripts/external-link-watchdog-workflow.test.js:66-115`

- [ ] **Step 1: Replace the expiry-only workflow test**

Assert the scan emits both the validated expired count and a `card_status`; upload precedes all report steps; note/create steps have no expiry condition; attach and finish are guarded only by successful card creation; and every Feishu-related step is best effort.

```javascript
test('every successful scan sends one bounded report card with expiry-derived presentation', () => {
  const scan = stepNamed('Scan rendered external links')
  assert.match(scan.run, /cardStatus = expiredCount === 0 \? 'success' : 'fail'/)
  assert.match(scan.run, /card_status=\$\{cardStatus\}/)

  const upload = stepNamed('Upload external link report')
  const note = stepNamed('Build documentation site change and link health note')
  const create = stepNamed('Create documentation site report card')
  const attach = stepNamed('Attach documentation site report note')
  const finish = stepNamed('Finish documentation site report card')
  assert.ok(steps.indexOf(upload) < steps.indexOf(note))
  assert.ok(steps.indexOf(note) < steps.indexOf(create))
  assert.equal(note.if, undefined)
  assert.equal(create.if, undefined)
  assert.equal(note['continue-on-error'], true)
  assert.equal(create['continue-on-error'], true)
  assert.equal(attach['continue-on-error'], true)
  assert.equal(finish['continue-on-error'], true)
  assert.equal(create.id, 'report_card')
  assert.match(create.run, /report-card create --title "Documentation Site Change & Link Health Report"/)
  assert.equal(note.env.REPORT_ARTIFACT_URL, '${{ steps.report_artifact.outputs.artifact-url }}')
  assert.match(note.run, /node scripts\/render-external-link-watchdog-note\.js/)
  assert.equal(attach.if, "${{ steps.report_card.outputs.card_id != '' && steps.report_note.outcome == 'success' }}")
  assert.equal(finish.if, "${{ steps.report_card.outputs.card_id != '' }}")
  assert.equal(finish.env.CARD_STATUS, '${{ steps.scan.outputs.card_status }}')
  assert.match(finish.run, /--status "\$CARD_STATUS"/)
  assert.doesNotMatch(JSON.stringify([note, create, attach, finish]), /expired_count != '0'/)
})
```

Retain the existing artifact assertions and add `assert.ok(steps.indexOf(scan) < steps.indexOf(upload))` so a card cannot replace a missing authoritative artifact.

- [ ] **Step 2: Run the workflow test and verify expiry-only behavior fails**

Run: `pnpm test:external-link-watchdog`

Expected: FAIL because the existing steps are expiry-gated, use the old title, and always finish with `fail`.

- [ ] **Step 3: Expose the card status from the validated report**

Change the scan's inline JSON reader to append both outputs:

```javascript
const expiredCount = report.summary.expired_external_links
if (!Number.isSafeInteger(expiredCount) || expiredCount < 0) {
  throw new Error('expired_external_links must be a non-negative safe integer')
}
const cardStatus = expiredCount === 0 ? 'success' : 'fail'
fs.appendFileSync(process.env.GITHUB_OUTPUT, `expired_count=${expiredCount}\ncard_status=${cardStatus}\n`)
```

- [ ] **Step 4: Replace the four expiry-only alert steps**

Use these step contracts after `Upload external link report`:

```yaml
      - name: Build documentation site change and link health note
        id: report_note
        continue-on-error: true
        env:
          REPORT_ARTIFACT_URL: ${{ steps.report_artifact.outputs.artifact-url }}
        run: |
          node scripts/render-external-link-watchdog-note.js \
            --input tmp/external-link-watchdog/latest.json \
            --output tmp/external-link-watchdog-note.md \
            --artifact-url "$REPORT_ARTIFACT_URL"

      - name: Create documentation site report card
        id: report_card
        continue-on-error: true
        run: pnpm docs-tooling report-card create --title "Documentation Site Change & Link Health Report" --stages "Inspect site changes and link health"
        env: &report_credentials
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}

      - name: Attach documentation site report note
        if: ${{ steps.report_card.outputs.card_id != '' && steps.report_note.outcome == 'success' }}
        continue-on-error: true
        run: pnpm docs-tooling report-card note --file tmp/external-link-watchdog-note.md
        env: *report_credentials

      - name: Finish documentation site report card
        if: ${{ steps.report_card.outputs.card_id != '' }}
        continue-on-error: true
        run: |
          pnpm docs-tooling report-card finish \
            --message-id "$CARD_ID" \
            --started-at "$CARD_STARTED_AT" \
            --stages "$CARD_STAGES" \
            --title "$CARD_TITLE" \
            --status "$CARD_STATUS"
        env:
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}
          CARD_ID: ${{ steps.report_card.outputs.card_id }}
          CARD_STARTED_AT: ${{ steps.report_card.outputs.card_started_at }}
          CARD_STAGES: ${{ steps.report_card.outputs.card_stages }}
          CARD_TITLE: ${{ steps.report_card.outputs.card_title }}
          CARD_STATUS: ${{ steps.scan.outputs.card_status }}
```

The scan, report validation, and artifact upload remain authoritative and must not gain `continue-on-error`.

- [ ] **Step 5: Run tests, lint the workflow, and commit**

```bash
pnpm test:external-link-watchdog
node --test scripts/render-external-link-watchdog-note.test.js
actionlint .github/workflows/external-link-watchdog.yml
git add .github/workflows/external-link-watchdog.yml scripts/external-link-watchdog-workflow.test.js
git commit -m "feat: send link health reports after every scan"
```

Expected: both test files pass and actionlint emits no diagnostics.

### Task 4: Strengthen workflow-policy enforcement

**Files:**
- Modify: `scripts/validate-workflow-policy.js:1309-1347`
- Test: `scripts/validate-workflow-policy.test.js:122-183`

- [ ] **Step 1: Add failing mutation cases**

Replace the old `card on blocked links` mutation with four policy regressions:

```javascript
{
  label: 'expiry-only report card',
  mutate: source => source.replace(
    '      - name: Create documentation site report card',
    "      - name: Create documentation site report card\n        if: ${{ steps.scan.outputs.expired_count != '0' }}",
  ),
  expected: 'external-link-watchdog.yml: report card must run after every successful scan',
},
{
  label: 'old report title',
  mutate: source => source.replace('Documentation Site Change & Link Health Report', 'External Link Watchdog'),
  expected: 'external-link-watchdog.yml: report card must use the approved title',
},
{
  label: 'constant failure presentation',
  mutate: source => source.replace('--status "$CARD_STATUS"', '--status fail'),
  expected: 'external-link-watchdog.yml: report card presentation must derive from confirmed expiry',
},
{
  label: 'report before artifact',
  mutate: source => {
    const uploadStart = source.indexOf('      - name: Upload external link report')
    const noteStart = source.indexOf('      - name: Build documentation site change and link health note')
    const uploadBlock = source.slice(uploadStart, noteStart)
    const withoutUpload = source.slice(0, uploadStart) + source.slice(noteStart)
    const createStart = withoutUpload.indexOf('      - name: Create documentation site report card')
    return withoutUpload.slice(0, createStart) + uploadBlock + withoutUpload.slice(createStart)
  },
  expected: 'external-link-watchdog.yml: complete report upload must precede Feishu reporting',
},
```

Retain the table's existing `assert.notEqual(mutated, original, ...)` check before validation.

- [ ] **Step 2: Run the policy test and verify the new protections are absent**

Run: `pnpm test:workflow-policy`

Expected: FAIL because the validator still requires all report steps to use the old expiry-only condition.

- [ ] **Step 3: Replace the old expiry-only validator block**

Parse the named steps and enforce exact topology and presentation:

```javascript
const upload = externalLinkSteps.find(step => step?.name === 'Upload external link report')
const reportNote = externalLinkSteps.find(step => step?.name === 'Build documentation site change and link health note')
const reportCreate = externalLinkSteps.find(step => step?.name === 'Create documentation site report card')
const reportAttach = externalLinkSteps.find(step => step?.name === 'Attach documentation site report note')
const reportFinish = externalLinkSteps.find(step => step?.name === 'Finish documentation site report card')
const reportSteps = [reportNote, reportCreate, reportAttach, reportFinish]
if (reportSteps.some(step => !step) || reportNote?.if !== undefined || reportCreate?.if !== undefined ||
    String(reportAttach?.if || '') !== "${{ steps.report_card.outputs.card_id != '' && steps.report_note.outcome == 'success' }}" ||
    String(reportFinish?.if || '') !== "${{ steps.report_card.outputs.card_id != '' }}") {
  errors.push('external-link-watchdog.yml: report card must run after every successful scan')
}
if (reportSteps.some(step => step?.['continue-on-error'] !== true)) {
  errors.push('external-link-watchdog.yml: Feishu reporting must remain best effort')
}
if (!String(reportCreate?.run || '').includes('--title "Documentation Site Change & Link Health Report"')) {
  errors.push('external-link-watchdog.yml: report card must use the approved title')
}
if (!/cardStatus = expiredCount === 0 \? 'success' : 'fail'/.test(externalLinkScan?.run || '') ||
    !/card_status=\$\{cardStatus\}/.test(externalLinkScan?.run || '') ||
    reportFinish?.env?.CARD_STATUS !== '${{ steps.scan.outputs.card_status }}' ||
    !String(reportFinish?.run || '').includes('--status "$CARD_STATUS"')) {
  errors.push('external-link-watchdog.yml: report card presentation must derive from confirmed expiry')
}
if (!upload || !reportNote || externalLinkSteps.indexOf(upload) >= externalLinkSteps.indexOf(reportNote)) {
  errors.push('external-link-watchdog.yml: complete report upload must precede Feishu reporting')
}
```

Keep the existing trigger, permissions, concurrency, canonical checker, statelessness, and fail-closed scan validations unchanged.

- [ ] **Step 4: Run policy and watchdog tests, then commit**

```bash
pnpm test:workflow-policy
pnpm test:external-link-watchdog
actionlint .github/workflows/external-link-watchdog.yml
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test: enforce recurring link health reports"
```

Expected: all tests pass and each mutation produces the exact intended policy error.

### Task 5: Run the full reporting regression gate

**Files:**
- Verify only; modify files only if a test exposes a defect in Tasks 1-4.

- [ ] **Step 1: Run all focused and policy tests**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
node --test scripts/render-external-link-watchdog-note.test.js
pnpm test:external-link-watchdog
pnpm test:workflow-policy
```

Expected: every command exits zero.

- [ ] **Step 2: Run static validation**

```bash
pnpm typecheck
actionlint .github/workflows/external-link-watchdog.yml
git diff --check origin/master...HEAD
```

Expected: TypeScript and actionlint pass, and `git diff --check` prints no errors.

- [ ] **Step 3: Review the final diff and repository state**

```bash
git diff --stat origin/master...HEAD
git status --short --branch
```

Expected: the branch contains the committed design plus the four implementation commits. Only the pre-existing untracked `node_modules` links/directories remain outside version control.

- [ ] **Step 4: Push and open a pull request**

```bash
git push -u origin codex/external-link-report-readability
gh pr create --base master --head codex/external-link-report-readability --title "Improve documentation site change and link health reports" --body $'## Summary\n- render every external-link observation and route in the Markdown artifact\n- explain sections 3-8 and add a bounded site-change/link-health Feishu note\n- send and finish the Feishu card after every successful scan\n\n## Tests\n- pnpm vitest run packages/docs-tooling/src/links/check.test.ts\n- node --test scripts/render-external-link-watchdog-note.test.js\n- pnpm test:external-link-watchdog\n- pnpm test:workflow-policy\n- pnpm typecheck\n- actionlint .github/workflows/external-link-watchdog.yml'
```

Do not merge until required checks pass and the diff is reviewed.

- [ ] **Step 5: Verify the production workflow after merge**

```bash
gh workflow run external-link-watchdog.yml --ref master
run_id=$(gh run list --workflow external-link-watchdog.yml --branch master --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run_id" --exit-status
artifact_root=$(mktemp -d)
gh run download "$run_id" --name "external-link-watchdog-$run_id" --dir "$artifact_root"
```

Compare `$artifact_root/latest.md` with `$artifact_root/latest.json`; confirm every URL/route is present, no truncation marker exists, all six explanations appear, and the Feishu card title/counts/SHAs/artifact URL/status match that run.
