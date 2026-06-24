# Actionable Localization Scan Reports

## Goal

Localization scan output should support human review and future automation. A reviewer should be able to see which docs are affected, record decisions directly in Feishu, and have future scans respect those decisions.

The scan must also report source documents edited during the previous day. This is based on Feishu document activity, not Bitable record modification time. The report should show who changed which source doc and when.

## Current Problem

The current scan summary is mostly counters and opaque identifiers:

```text
Total: 414 · NEW: 81 · UPDATE: 0 · META_ONLY: 0 · ORPHAN: 23 · Broken links: 0
```

This is useful to automation but not to the person deciding what to do. It does not list affected docs, does not explain why a doc is classified, and does not provide a durable way for the reviewer to say "ignore this next time".

## Design Summary

Each localization scan creates or updates one Feishu report document and stores machine-readable decisions in a separate decision registry.

The Feishu report is the review surface. It contains actionable tables with checkbox columns.

The decision registry is the automation source of truth. A `sync-opinions` command reads checked boxes from the Feishu report and writes stable decisions into the registry.

The chat/card message remains short and links to the detailed report.

## Chat Summary

The scan message should look like this:

```text
Localization scan completed.

New docs: 81
Updates: 0
Metadata-only updates: 0
Orphans: 23
Source docs changed yesterday: 12
Broken links: 0

Detailed report:
https://zilliverse.feishu.cn/docx/...

Recommended next step:
sync-opinions loc-scan-... 28082258114
dry-run loc-scan-... 28082258114
```

The task ID and source run ID should remain present, but they should be metadata, not the main content.

## Feishu Report Structure

Title:

```text
Localization Scan Report - 2026-06-24 - run 28082258114
```

Sections:

1. Summary
2. Source docs changed yesterday
3. New docs
4. Updates
5. Metadata-only updates
6. Orphan docs
7. Excluded by policy
8. Suppressed by prior decision
9. Reviewer decisions and command reference

## Source Doc Activity

The scan must include source docs that were changed during the previous calendar day in the configured timezone.

Definition of changed:

- A Feishu document/wiki node content edit.
- Not a Bitable record update.
- Not only metadata sync in the docs table.

Required columns:

| Needs localization review | Source title | Slug | Source table | Source URL | Last edited at | Edited by | Change signal | Target status |
|---|---|---|---|---|---|---|---|---|

`Change signal` should describe how the scanner detected the edit, for example:

- Feishu document `updated_time`.
- Feishu document revision/activity event.
- Latest editor metadata.

`Target status` should show one of:

- Missing localized doc.
- Localized doc exists and may need update.
- Localized doc up to date.
- Ignored by policy.
- Needs manual mapping.

If Feishu APIs expose only the latest editor and latest update time, the report should say that explicitly. Do not imply a precise diff or full edit history unless revision-level data was actually fetched.

## New Docs Table

Columns:

| Create | Skip this time | Ignore always | Needs review | Source title | Slug | Source table | Target parent | Source URL | Reason |
|---|---|---|---|---|---|---|---|---|---|

Rules:

- `Create` means this doc is approved for creation in a later `patch`.
- `Skip this time` suppresses it for the current task only.
- `Ignore always` stores a persistent decision in the registry.
- `Needs review` keeps it visible and blocks automatic patching for that row.

## Orphan Docs Table

Columns:

| Ignore next time | Delete candidate | Keep as locale-specific | Needs review | Target title | Slug | Target table | Target URL | Reason |
|---|---|---|---|---|---|---|---|---|

Rules:

- `Ignore next time` suppresses the same orphan in future main reports.
- `Delete candidate` marks intent only. The localization workflow must not delete docs automatically.
- `Keep as locale-specific` records that the doc intentionally exists only in the localized site.
- `Needs review` keeps the orphan visible until a later decision is made.

## Excluded And Suppressed Sections

`Excluded by policy` lists source docs omitted because of maintained localization rules, such as global-only provider docs or China-specific equivalents.

Columns:

| Rule | Source title | Slug | Source table | Reason |
|---|---|---|---|---|

`Suppressed by prior decision` lists rows hidden from the main actionable tables because the registry already contains a matching decision.

Columns:

| Decision | Title | Slug | Table | Last decided at | Report |
|---|---|---|---|---|---|

This section should be compact, but visible enough that suppressed rows are auditable.

## Decision Registry

The registry stores normalized decisions read from report checkboxes.

Preferred stable key:

```text
targetBase + targetTable + targetRecordId
```

Fallback stable key:

```text
targetTable + slug + docToken
```

Example record:

```json
{
  "kind": "orphan",
  "decision": "ignore_next_time",
  "targetBase": "I6YUb1M0JajHrqsJGcLcZNh7neP",
  "targetTable": "tblYpqCgevikMomb",
  "targetRecordId": "rec...",
  "slug": "siliconflow",
  "docToken": "wiki...",
  "sourceRun": "28082258114",
  "taskId": "loc-scan-20260624T072341Z-2e0cb1a1",
  "reportToken": "docx...",
  "decidedAt": "2026-06-24T..."
}
```

The registry can be stored as a JSON artifact, a repo-managed file, or a Feishu Base table. The implementation should choose the storage that fits the existing scan runner, but the scanner must treat it as machine-readable state rather than parsing old reports as the source of truth.

## Commands

```text
sync-opinions <task> <run>
```

Reads the Feishu report checkboxes and updates the registry.

```text
dry-run <task> <run>
```

Applies registry decisions, then previews actions without writing localized docs or records.

```text
patch <task> <run>
```

Applies approved or unambiguous actions. It must not delete orphan docs automatically.

```text
ignore <task> <run>
```

Marks the scan ignored without changing registry decisions.

```text
custom <task> <run>: <instruction>
```

Runs a scoped instruction, such as patching only selected tables or excluding a specific class of docs.

## Next-Scan Behavior

- Rows with `Ignore next time` should not appear in the main orphan table in future reports.
- Rows with `Keep as locale-specific` should be suppressed from main orphan reporting unless the target slug, doc token, or record ID changes.
- Rows with `Needs review` remain visible.
- If a previously ignored orphan later matches a source doc, mark the decision as resolved.
- If a previously ignored orphan changes identity fields, report it again as `Needs review`.

## Error Handling

- If a report document cannot be created, the scan should still emit the short summary and include a local artifact path.
- If `sync-opinions` cannot read the report, it should fail without changing the registry.
- If multiple conflicting checkboxes are checked for one row, mark the row `Needs review` and do not apply an automated action.
- If Feishu doc activity metadata is incomplete, include the doc in the activity section with `Change signal` explaining the limitation.

## Testing

Unit coverage should include:

- Rendering report tables for `NEW`, `ORPHAN`, policy-excluded, and suppressed rows.
- Converting checkbox states into registry decisions.
- Suppressing ignored orphans in a later scan.
- Detecting conflicting checkbox decisions.
- Including previous-day source doc activity based on doc update metadata, not Bitable record timestamps.

Integration verification should include:

- Creating a Feishu report doc in dry-run/test mode.
- Reading checked boxes from a report.
- Writing registry updates.
- Running a later scan that suppresses previously ignored orphans.

## Open Implementation Choice

Registry storage is intentionally not fixed in this design. The implementation should choose between repo JSON, workflow artifact, or Feishu Base after checking the current localization runner. The selected storage must be stable across workflow runs and readable before report generation.
