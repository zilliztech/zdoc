# Guides Card Report Artifact Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Include fresh current-run Guides reports in the final validated card-report artifact and render correct report links for both published and artifact-only Feishu cards.

**Architecture:** The aggregate job restores committed reports when available, downloads the current run's Guides reports artifact over them, and then invokes the existing bounded collector. The collector uses an explicit final commit for durable blob links, falls back to the workflow artifacts page in artifact-only mode, and emits an attention note when expected Guides reports are unavailable; the central monitor remains unchanged.

**Tech Stack:** Node.js 20 CommonJS, `node:test`, GitHub Actions upload/download artifact v4, fixed-schema `card-report.json`, Feishu Card JSON V2.

---

## File map and invariants

**Modify**

- `scripts/collect-build-card-notes.js` — explicit report location selection, expected Guides report diagnostics, and missing-report note.
- `scripts/collect-build-card-notes.test.js` — published, artifact-only, stale, partial, and missing-report cases.
- `.github/workflows/fetch-docs.yml` — committed report restore, current Guides artifact download, and collector environment.
- `scripts/validate-workflow-policy.js` — enforce download ordering and credential boundaries.
- `scripts/validate-workflow-policy.test.js` — workflow structure and final artifact composition assertions.
- `scripts/sdk-reference-workflow.test.js` — preserve the centralized final report contract.

**Do not modify**

- `scripts/docs-workflow/monitor-docs-progress.js`; it already downloads and validates the final report artifact.
- `scripts/docs-workflow/docs-card-report.js`; its schema and bounds already support the required notes.
- Feishu Card V2 rendering; report panels are already driven by `state.reports`.

**Non-negotiable invariants**

- Current-run Guides artifact content overrides committed copies.
- Artifact-only runs never create blob links to the tooling commit.
- Missing report delivery is visible but does not fail documentation production.
- The monitor consumes only `docs-card-report-${run_id}`.
- Aggregate report steps receive no Feishu source credentials.

### Task 1: Define explicit report locations and missing-report diagnostics

**Files:**

- Modify: `scripts/collect-build-card-notes.test.js`
- Modify: `scripts/collect-build-card-notes.js`

- [ ] **Step 1: Add a test helper for a complete current-run Guides report set**

Add:

```js
function writeFreshGuidesReports(generatedAt = '2026-07-17T01:05:00.000Z') {
  writeJson('plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json', {
    generated_at: generatedAt,
    mode: 'incremental',
    build_env: 'uat',
    changed_tokens: ['doc-a'],
    expanded_tokens: ['doc-a'],
    removed_tokens: [],
    warnings: [],
  })
  writeJson('plugins/lark-docs/meta/reports/guides-broken-content-links.json', {
    generated_at: generatedAt,
    source_dir: './plugins/lark-docs/meta/sources/guides',
    summary: { canonical_tokens: 1, scanned_sources: 1, content_links: 1, broken_content_links: 0 },
    broken_content_links: [],
  })
  writeJson('plugins/lark-docs/meta/reports/guides-canonical-link-audit.json', {
    generated_at: generatedAt,
    target: 'zilliz.saas',
    summary: { canonical_records: 1, scanned_sources: 1, internal_references: 1, valid_references: 1, broken_references: 0 },
  })
}
```

Use the test's existing temporary working-directory isolation.

- [ ] **Step 2: Write a failing artifact-only link test**

Set:

```js
process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
process.env.CARD_REPORT_REF = ''
process.env.GITHUB_SHA = 'tooling-sha-that-does-not-contain-reports'
process.env.CARD_REPORT_ARTIFACT_URL = 'https://github.com/zilliztech/zdoc/actions/runs/123#artifacts'
process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
```

Assert the collected notes contain the artifacts URL and do not contain
`/blob/tooling-sha-that-does-not-contain-reports/`.

- [ ] **Step 3: Write a failing published-link test**

Set `CARD_REPORT_REF` to a 40-character lowercase SHA and assert report lines
use `/blob/<sha>/plugins/lark-docs/meta/reports/...` even when
`CARD_REPORT_ARTIFACT_URL` is also set.

- [ ] **Step 4: Write failing missing and partial report tests**

For no fresh files, assert one note contains:

```text
# Guides reports unavailable
```

For only the incremental plan, assert the plan note is present and one attention
note names `Canonical content links audit` and `Canonical link audit` as missing.
Do not mark the incremental plan missing.

- [ ] **Step 5: Run focused tests and verify failure**

```bash
node --test scripts/collect-build-card-notes.test.js
```

Expected: FAIL because the collector falls back to `GITHUB_SHA` and does not
create missing-report notes.

- [ ] **Step 6: Restrict blob links to an explicit final ref**

Replace the fallback ref selection with:

```js
function reportCommitRef() {
  const ref = (process.env.CARD_REPORT_REF || '').trim()
  return /^[0-9a-f]{40}$/.test(ref) ? ref : null
}

function githubFileUrl(file) {
  const repository = process.env.GITHUB_REPOSITORY
  const ref = reportCommitRef()
  if (!repository || !ref) return null
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const encodedPath = file.split('/').map(encodeURIComponent).join('/')
  return `${serverUrl}/${repository}/blob/${ref}/${encodedPath}`
}
```

- [ ] **Step 7: Add an artifact fallback to report location lines**

Implement:

```js
function reportFileLine(file) {
  const url = githubFileUrl(file)
  if (url) return `Report file: [${file}](${url})`
  const artifactUrl = (process.env.CARD_REPORT_ARTIFACT_URL || '').trim()
  if (/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+#artifacts$/.test(artifactUrl)) {
    return `Current-run reports: [workflow artifacts](${artifactUrl})`
  }
  return `Report file: \`${file}\``
}
```

Do not accept arbitrary schemes or hosts for the artifact URL.

- [ ] **Step 8: Track expected Guides report categories**

Define:

```js
const GUIDES_REPORTS = Object.freeze([
  { key: 'content-links', title: 'Canonical content links audit', collect: brokenContentLinksNote },
  { key: 'canonical-links', title: 'Canonical link audit', collect: canonicalLinkNote },
  { key: 'incremental-plan', title: 'Incremental fetch plan', collect: incrementalPlanNote },
])

function guidesReportNotes() {
  const found = []
  const notes = []
  for (const report of GUIDES_REPORTS) {
    const note = report.collect()
    if (note) {
      found.push(report.key)
      notes.push(note)
    }
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
```

Update `collectNotes()` to use `guidesReportNotes().notes` after the link-check
note. Preserve the existing 12-note and 12,000-character bounds.

- [ ] **Step 9: Emit diagnostic outputs**

Pass the Guides diagnostics into `writeGithubOutput` and append:

```js
fs.appendFileSync(output, `guides_reports_found=${diagnostics.found.join(',')}\n`)
fs.appendFileSync(output, `guides_reports_missing=${diagnostics.missing.join(',')}\n`)
```

Keep `card_notes_json` and `card_notes_file` unchanged for existing callers.

- [ ] **Step 10: Run focused tests**

```bash
node --test scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-card-report.test.js
```

Expected: PASS. The card-report tests prove the new attention note remains
inside existing title, Markdown, and report-count bounds.

- [ ] **Step 11: Commit the collector behavior**

```bash
git add scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js
git commit -m "fix: preserve current Guides reports for Feishu cards"
```

### Task 2: Download the current Guides report artifact before collection

**Files:**

- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Write failing workflow ordering assertions**

In the central report artifact test, isolate the aggregate section and assert:

```js
const aggregate = workflow.slice(workflow.indexOf('  aggregate:'), workflow.indexOf('  finalize_card_fallback:'))
const restoreIndex = aggregate.indexOf('name: Restore committed report directories')
const downloadIndex = aggregate.indexOf('name: Download current Guides reports')
const collectIndex = aggregate.indexOf('name: Collect card report summaries')
assert.ok(restoreIndex >= 0)
assert.ok(downloadIndex > restoreIndex)
assert.ok(collectIndex > downloadIndex)
assert.match(aggregate, /name: docs-checkpoint-guides-\$\{\{ github\.run_id \}\}-reports/)
assert.match(aggregate, /path: plugins\/lark-docs\/meta\/reports/)
assert.match(aggregate, /CARD_EXPECT_GUIDES_REPORTS:.*produce_guides\.outputs\.status.*artifact_ready/)
assert.match(aggregate, /CARD_REPORT_ARTIFACT_URL:/)
```

- [ ] **Step 2: Run the workflow test and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because committed restoration and collection are currently one
step and no artifact download exists.

- [ ] **Step 3: Split committed report restoration into its own step**

Add before download:

```yaml
      - name: Restore committed report directories
        if: ${{ always() }}
        continue-on-error: true
        env:
          FINAL_DEV_SHA: ${{ needs.resolve_final.outputs.final_dev_sha }}
        run: |
          set -euo pipefail
          if [[ "$FINAL_DEV_SHA" =~ ^[0-9a-f]{40}$ ]]; then
            git fetch --no-tags origin "$FINAL_DEV_SHA"
            for report_dir in plugins/lark-docs/meta/reports plugins/link-checks/meta/reports; do
              if git cat-file -e "$FINAL_DEV_SHA:$report_dir" 2>/dev/null; then
                rm -rf "$report_dir"
                git checkout "$FINAL_DEV_SHA" -- "$report_dir"
              fi
            done
          fi
```

- [ ] **Step 4: Download the current run's Guides reports after committed restoration**

Add:

```yaml
      - name: Download current Guides reports
        if: ${{ always() && (needs.prepare.outputs.selected_group == 'all' || needs.prepare.outputs.selected_group == 'guides') }}
        continue-on-error: true
        uses: actions/download-artifact@v4
        with:
          name: docs-checkpoint-guides-${{ github.run_id }}-reports
          path: plugins/lark-docs/meta/reports
```

Because this step runs after committed restoration, extracted current-run files
replace same-named committed files.

- [ ] **Step 5: Simplify the collection step and pass explicit reporting context**

Remove Git commands from `Collect card report summaries`. Use:

```yaml
        env:
          CARD_REPORT_STARTED_AT: ${{ needs.prepare.outputs.card_started_at }}
          CARD_REPORT_REF: ${{ needs.resolve_final.outputs.final_dev_sha }}
          CARD_REPORT_ARTIFACT_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}#artifacts
          CARD_EXPECT_GUIDES_REPORTS: ${{ (needs.prepare.outputs.selected_group == 'all' || needs.prepare.outputs.selected_group == 'guides') && needs.produce_guides.outputs.status == 'artifact_ready' }}
          CARD_BASE_NOTES_JSON: ${{ steps.aggregate.outputs.notes_json }}
        run: node scripts/collect-build-card-notes.js
```

Use the actual aggregate dependency output name for the assembled Guides
producer. In the current workflow that is `needs.produce_guides.outputs.status`,
not the source-only `produce_guides_sources` status, because the reports artifact
is uploaded by `_assemble-guides.yml`.

- [ ] **Step 6: Run workflow and collector tests**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/collect-build-card-notes.test.js scripts/sdk-reference-workflow.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit artifact ingestion**

```bash
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.test.js
git commit -m "fix: ingest Guides report artifacts before card finalization"
```

### Task 3: Enforce current-run report ingestion in workflow policy

**Files:**

- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/validate-workflow-policy.js`

- [ ] **Step 1: Add failing validator cases**

Build temporary `fetch-docs.yml` variants that:

1. remove the Guides download step;
2. move collection before artifact download;
3. download into a directory other than `plugins/lark-docs/meta/reports`;
4. remove `CARD_REPORT_ARTIFACT_URL`;
5. add `APP_ID` to the report download or collection steps.

Assert the validator returns these messages:

```text
fetch-docs.yml: aggregate must download current Guides reports
fetch-docs.yml: current Guides reports must be downloaded before card collection
fetch-docs.yml: Guides reports must restore into the collector report directory
fetch-docs.yml: artifact-only card reports require a workflow artifact URL
fetch-docs.yml: aggregate report ingestion must not receive Feishu credentials
```

- [ ] **Step 2: Run policy tests and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the policy validator does not enforce artifact ingestion.

- [ ] **Step 3: Add aggregate report-ingestion policy checks**

Within the existing aggregate-source validation, calculate step indexes and add
the exact messages above. Restrict the credential scan to the substring from
`Restore committed report directories` through `Create final card report artifact`
so unrelated source jobs do not create false positives.

Use structural checks equivalent to:

```js
const restore = aggregateSource.indexOf('name: Restore committed report directories')
const download = aggregateSource.indexOf('name: Download current Guides reports')
const collect = aggregateSource.indexOf('name: Collect card report summaries')
if (download < 0) errors.push('fetch-docs.yml: aggregate must download current Guides reports')
if (!(restore >= 0 && download > restore && collect > download)) {
  errors.push('fetch-docs.yml: current Guides reports must be downloaded before card collection')
}
if (!/name: Download current Guides reports[\s\S]*path: plugins\/lark-docs\/meta\/reports/.test(aggregateSource)) {
  errors.push('fetch-docs.yml: Guides reports must restore into the collector report directory')
}
if (!/CARD_REPORT_ARTIFACT_URL:/.test(aggregateSource)) {
  errors.push('fetch-docs.yml: artifact-only card reports require a workflow artifact URL')
}
const reportIngestion = aggregateSource.slice(restore, aggregateSource.indexOf('name: Create final card report artifact'))
if (/APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY/.test(reportIngestion)) {
  errors.push('fetch-docs.yml: aggregate report ingestion must not receive Feishu credentials')
}
```

- [ ] **Step 4: Run policy validation**

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: all tests PASS and the validator prints its success message.

- [ ] **Step 5: Commit policy enforcement**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
git commit -m "test: require current Guides reports in final card artifacts"
```

### Task 4: Verify final artifact composition locally

**Files:**

- Modify only if a regression is found: `scripts/docs-workflow/docs-card-report.test.js`

- [ ] **Step 1: Run the collector in an isolated fixture directory**

Create fresh Guides report fixtures using the same shapes as Task 1, then run:

```bash
CARD_REPORT_STARTED_AT=2026-07-17T01:00:00.000Z \
CARD_REPORT_REF= \
CARD_REPORT_ARTIFACT_URL=https://github.com/zilliztech/zdoc/actions/runs/123#artifacts \
CARD_EXPECT_GUIDES_REPORTS=true \
CARD_BASE_NOTES_JSON='["# Documentation workflow summary\n\nOverall status: success"]' \
CARD_NOTES_FILE=tmp/card-notes.json \
node scripts/collect-build-card-notes.js
```

Expected: `tmp/card-notes.json` contains four notes: one workflow summary and
three Guides notes.

- [ ] **Step 2: Create and validate a final card report from those notes**

```bash
printf '%s\n' 'Documentation workflow succeeded.' > tmp/card-summary.txt
node scripts/docs-workflow/docs-card-report.js create \
  --run-id 123 \
  --overall-status success \
  --summary-file tmp/card-summary.txt \
  --reports-json tmp/card-notes.json \
  --output tmp/docs-card-report/card-report.json
node scripts/docs-workflow/docs-card-report.js validate \
  --input tmp/docs-card-report/card-report.json \
  --run-id 123
```

Expected: both commands exit 0 and `card-report.json` has `reports.length === 4`.

- [ ] **Step 3: Run the complete reporting regression set**

```bash
node --test \
  scripts/collect-build-card-notes.test.js \
  scripts/docs-workflow/docs-card-report.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/sdk-reference-workflow.test.js \
  scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: all tests PASS. No monitor implementation change should appear in the
diff.

- [ ] **Step 4: Inspect the final diff**

```bash
git diff --check
git diff -- .github/workflows/fetch-docs.yml scripts/collect-build-card-notes.js scripts/validate-workflow-policy.js
```

Expected: no whitespace errors, report ingestion occurs before collection, and
no Feishu credentials are present in aggregate report steps.

### Task 5: Disposable workflow verification

**Files:**

- No repository files expected.

- [ ] **Step 1: Dispatch a Guides artifact-only run**

Use:

```text
group=guides
publish=false
target_branch=<disposable branch>
tooling_ref=<implementation branch>
```

Expected aggregate log:

```text
guides_reports_found=content-links,canonical-links,incremental-plan
guides_reports_missing=
```

- [ ] **Step 2: Inspect the final card-report artifact**

Download `docs-card-report-${run_id}` and verify:

```bash
jq '{overallStatus, reportCount:(.reports|length), titles:[.reports[].title]}' card-report.json
```

Expected report count: 4. Expected titles include `Documentation workflow
summary`, `Canonical Content Links Audit`, `Canonical Link Audit`, and
`Incremental Fetch Plan`.

- [ ] **Step 3: Inspect the Feishu card**

Expected: all three Guides panels are present. Report links point to the
workflow Artifacts section and contain no `/blob/<tooling-sha>/` URL.

- [ ] **Step 4: Dispatch a published Guides run on the disposable branch**

Expected: the same report panels appear, and their file links use the immutable
final published commit SHA.

- [ ] **Step 5: Record both workflow URLs in the pull request description**

Include the final artifact report counts and link modes. Do not commit generated
documentation from the disposable verification branch into the implementation
branch.
