# Guides Card Report Artifact Ingestion Design

## Goal

Ensure the current run's Guides incremental-fetch and link-audit reports are
included in the final validated card-report artifact and therefore attached to
the centralized Feishu progress card in both published and artifact-only runs.

## Confirmed Failure

Workflow run `29497634909` successfully uploaded
`docs-checkpoint-guides-29497634909-reports`. The artifact contained the current
incremental plan, broken-content-link report, and canonical-link-audit outputs.

The `aggregate` job did not download that artifact. It only attempted to restore
report directories from `FINAL_DEV_SHA`. Because the run used artifact-only
mode, `resolve_final` was skipped and `FINAL_DEV_SHA` was empty. The collector
therefore saw none of the fresh Guides reports and wrote a final
`card-report.json` containing only the generic documentation workflow summary.
The central monitor behaved correctly: it downloaded and displayed the
incomplete final artifact it was given.

## Design

### Aggregate Owns Current-Run Report Composition

The centralized monitor remains unchanged. It continues to consume exactly one
validated artifact named `docs-card-report-${run_id}`. The `aggregate` job is
responsible for assembling that artifact from current-run report inputs.

The aggregate sequence becomes:

```text
build aggregate workflow summary
  -> restore committed report directories when FINAL_DEV_SHA exists
  -> download the current run's Guides reports artifact when Guides was selected
  -> collect bounded report notes
  -> create and upload validated card-report.json
```

Current-run artifacts override committed copies because they represent the run
being reported. The committed report directories remain useful for report types
that are produced only during published workflows and for durable blob links.

### Guides Artifact Download

Add an `actions/download-artifact@v4` step in `aggregate` for:

```text
docs-checkpoint-guides-${github.run_id}-reports
```

The step runs only when the selected group is `guides` or `all`, uses
`continue-on-error: true`, and downloads directly into
`plugins/lark-docs/meta/reports`. It runs after committed report restoration and
before `collect-build-card-notes.js`, so current-run files replace same-named
committed files.

The reports artifact is produced by the repository's own Guides assembly job
and already contains only `plugins/lark-docs/meta/reports`. No Feishu or source
credentials are passed to the download or collection steps.

### Report Expectations and Missing-Report Visibility

When Guides was selected and its producer reached `artifact_ready`, the
collector expects these current-run JSON inputs:

```text
guides-incremental-fetch-plan.json
guides-broken-content-links.json
guides-canonical-link-audit.json
```

The existing freshness rule remains: a report with `generated_at` older than
`CARD_REPORT_STARTED_AT` is ignored.

If none of the expected fresh Guides reports is available, the collector adds a
bounded attention note instead of silently omitting them:

```markdown
# Guides reports unavailable

The Guides producer completed, but current-run Guides reports could not be
loaded. Inspect the workflow artifacts for this run.
```

Partially available reports are included normally, followed by one attention
note listing the missing report titles. A missing report does not change the
documentation workflow's success status because report delivery is
best-effort, but the Feishu card makes the loss visible.

The collector exposes `guides_reports_found` and `guides_reports_missing`
through `GITHUB_OUTPUT` for workflow logs and tests.

### Correct Links in Published and Artifact-Only Modes

`collect-build-card-notes.js` will no longer create report blob links from
`GITHUB_REF_NAME` or `GITHUB_SHA` when `CARD_REPORT_REF` is absent. Those values
identify the tooling revision, not a commit containing artifact-only reports.

Report links follow this order:

1. When `CARD_REPORT_REF` is a valid final commit SHA, link to the report file
   under that immutable commit.
2. Otherwise, when `CARD_REPORT_ARTIFACT_URL` is available, link to the current
   workflow run's Artifacts section.
3. Otherwise, show the report path as plain code without a link.

The aggregate job supplies:

```text
CARD_REPORT_ARTIFACT_URL=${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}#artifacts
```

The report summary remains embedded in the Feishu card because Actions
artifacts expire. The artifact link is supplemental, not the only way to read
the result.

### Card Report Boundary

`docs-card-report.js` remains the fixed-schema boundary. It continues to bound
the report array, titles, Markdown size, overall status, and summary. The
monitor continues to validate the artifact before rendering it. No raw report
files, arbitrary paths, logs, or environment data are sent directly to Feishu.

For a healthy Guides-only artifact run, the final report array contains:

1. Documentation workflow summary;
2. Canonical content links audit;
3. Canonical link audit;
4. Incremental fetch plan.

## Failure Semantics

- Published run with final SHA and current artifact: use current content and
  immutable commit links.
- Artifact-only run with current artifact: use current content and the workflow
  artifacts link.
- Artifact download failure: retain the workflow summary and add a Guides
  reports unavailable attention note.
- Stale committed or workspace report: reject it using the existing timestamp
  boundary.
- Invalid final card-report artifact: the monitor retains its existing
  `Final report unavailable` fallback behavior.
- Feishu patch failure: remain non-fatal to documentation production.

## Security and Integrity

- The aggregate job receives no source Feishu credentials.
- Artifact paths and names are fixed by the workflow.
- Freshness is determined by structured `generated_at` timestamps, not file
  modification time.
- Blob links require an explicit final report ref; tooling refs are never used
  as a substitute.
- The existing card-report schema and size bounds remain authoritative.

## Testing

Automated tests will prove:

1. artifact-only collection with fresh downloaded Guides reports creates the
   workflow summary plus all three Guides notes;
2. published collection prefers current artifact content and creates final-SHA
   blob links;
3. artifact-only collection creates the workflow artifacts link and never a
   tooling-commit blob link;
4. stale report JSON is rejected;
5. missing all expected Guides reports creates one attention note;
6. partial report availability includes present reports and names missing ones;
7. workflow policy requires report download after committed restoration and
   before collection;
8. the final card-report artifact contains the expected Guides reports;
9. the monitor needs no changes and renders the structured reports from the
   final artifact.

## Rollout

Run a Guides artifact-only workflow on a disposable target branch. Confirm the
aggregate log reports three fresh Guides inputs, inspect the final
`docs-card-report-${run_id}` artifact, and verify the Feishu card contains the
three Guides report panels. Then run a published Guides workflow and confirm the
same report content uses immutable final-commit links.

## Non-Goals

- Moving report rendering into the monitor.
- Making Feishu reporting a prerequisite for documentation success.
- Extending artifact ingestion to every SDK report in this change.
- Increasing card-report size or report-count limits.
- Persisting artifact-only reports beyond the configured Actions retention.

