# Daily Feishu Revision Inventory and Ingestion Design

**Date:** 2026-07-29

**Status:** Approved for implementation planning

## Objective

Ensure that Feishu documentation changes are discoverable, auditable, published into the repository, and buildable for both documentation sites within the existing scheduled content-production workflow.

The first implementation phase prioritizes the working main flow. It retains direct grouped publication to `dev`, the existing three scheduled daily runs, current checkpoint publication, agent-driven translations, and Jenkins ownership of deployment. It does not introduce candidate branches, atomic whole-site promotion, webhook ingestion, or changes to `zdoc_cn`.

## Current State

`.github/workflows/fetch-docs.yml` already runs three times per day and defaults scheduled runs to:

- `group=all`
- `target_branch=dev`
- `publish=true`
- tooling from `master`

The workflow serializes publication with the `docs-production-dev` concurrency group, fetches English source content, publishes grouped checkpoints, drives Japanese and Chinese translations, resolves an immutable final `dev` SHA, and performs final verification.

The current final verification builds the English site only. It does not prove that the final SHA builds the Chinese site, and it does not persist an authoritative comparison between Feishu document revisions and repository content.

Existing Feishu metadata collection already exposes the fields needed for a low-cost revision inventory:

- requested token
- node token
- origin node token
- object token
- title
- parent node token
- object edit time
- revision ID

## Design Principles

1. Persist a revision snapshot rather than relying only on modification timestamps.
2. Compare the candidate snapshot with the last successfully published snapshot.
3. Update a group's revision waterline in the same checkpoint as that group's content.
4. Do not interpret metadata-fetch failures as deletions.
5. Run full metadata enumeration on existing scheduled runs to reconcile missed changes, moves, and deletions.
6. Validate the same immutable final Git SHA for revision coverage and both site builds.
7. Preserve existing workflow grouping, retries, publication adapters, translation workflows, and reporting.
8. Prefer visible failure and scheduled compensation over complex automatic workflow reruns.

These principles follow common incremental-sync practice: persist opaque or stable source revisions, advance checkpoints only after successful processing, make processing idempotent, and use periodic full reconciliation as a correctness fallback.

## Main Flow

```text
scheduled or manual fetch-docs run
  -> resolve immutable tooling and dev baseline SHAs
  -> enumerate Feishu metadata for selected content groups
  -> generate candidate per-group revision inventories
  -> compare baseline and candidate inventories
  -> fetch and generate selected content
  -> publish content and matching inventory in the same checkpoint
  -> run existing Japanese and Chinese translations
  -> resolve the immutable final dev SHA
  -> validate revision reconciliation against that SHA
  -> build English and Japanese output
  -> build Chinese output
  -> aggregate status and report to Feishu
```

GitHub Actions validates content production and buildability. It does not deploy either site. Existing Jenkins UAT and production pipelines remain responsible for deployment.

## Revision Inventory

### Storage layout

Store one committed inventory per content group:

```text
generated/en/manifests/lark-revisions/
  guides.json
  python.json
  java.json
  node.json
  go.json
  cli.json
  rest.json
```

Per-group files align with current parallel producers and checkpoint ownership, avoiding a shared all-site file that would create publication contention.

### Inventory schema

Each inventory has this logical structure:

```json
{
  "schemaVersion": 1,
  "group": "guides",
  "generatedAt": "2026-07-29T10:00:00+08:00",
  "sourceRunId": "30416089261",
  "records": [
    {
      "canonicalToken": "wiki-node-token",
      "objectToken": "docx-object-token",
      "title": "Create Collections",
      "parentToken": "parent-node-token",
      "revisionId": "42",
      "objectEditTime": "1785253200",
      "contentPath": "content/en/guides/create-collection.md"
    }
  ]
}
```

Records are sorted by stable canonical token. JSON serialization is canonical so repeated no-change runs do not produce Git noise. `generatedAt` and `sourceRunId` must not force publication when record content is unchanged; publication comparison ignores run metadata or retains the previous inventory for no-change groups.

`canonicalToken` is the stable source identity. Resolved shortcuts retain both the requested canonical token and underlying object token so a shortcut change does not silently change document ownership.

### Snapshot comparison

Compare the candidate inventory with the inventory restored from the immutable `dev` baseline:

| Status | Rule |
|---|---|
| `created` | Candidate contains a canonical token absent from baseline. |
| `updated` | The same canonical token has a different revision ID. |
| `moved` | Parent token changed while revision ID did not. |
| `renamed` | Title changed while revision ID did not. |
| `deleted` | Baseline contains a token absent from a successful complete candidate enumeration. |
| `fetch_failed` | The document is known but its current metadata could not be obtained. |

Revision ID is the primary content-change signal. Object edit time supports reporting and time-based filtering but is not the only correctness signal.

Deletion classification is permitted only when the selected group's full enumeration completes successfully. A partial enumeration or any unresolved metadata error makes deletion status indeterminate and fails reconciliation without deleting content.

### Locating documents changed today

Generate non-committed JSON and Markdown diff reports under:

```text
tmp/docs-tooling/revision-diff/<group>.json
tmp/docs-tooling/revision-diff/<group>.md
```

Two filters are distinct:

- Since the last successful publication: inventory comparison is authoritative.
- Edited today: filter candidate `objectEditTime` from midnight in `Asia/Shanghai` for operational reporting.

The report lists title, change type, old and new revision, edit time, content path, and source token. It is uploaded as a workflow artifact and summarized in the existing Feishu result card.

## Publication Semantics

Candidate inventory generation happens in the existing source-production jobs after metadata enumeration and before checkpoint creation.

The content group checkpoint contains both:

- generated source/publication content owned by the group
- `generated/en/manifests/lark-revisions/<group>.json`

Checkpoint validation verifies that the inventory group matches the selected group, paths remain within declared ownership, records are uniquely keyed and sorted, and every active inventory record maps to a generated content path or an explicitly non-page source record supported by that group.

Publishing the inventory with its content ensures the committed waterline cannot advance independently of generated documentation.

## Final Reconciliation and Site Verification

After translation publication, `resolve_final` identifies one immutable final `dev` SHA. Final verification materializes exactly that SHA and runs:

```bash
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
pnpm docs-tooling validate-reference --site zh-CN
pnpm docs-tooling validate-translation --target zh-CN-tools --group tools
pnpm docs-tooling validate-tools-sidebar
pnpm build:en
pnpm build:zh-CN
```

Revision validation requires:

- every created, updated, moved, or renamed record to be present at its declared final content path
- the published inventory to contain the candidate revision
- deleted content to be absent from publication and navigation, or covered by an explicit retirement decision where required
- every selected group to have either a reconciled published inventory or an explicit no-change result

The English build retains its Japanese-home assertion. The Chinese build retains Reference provenance and Tools sidebar reachability checks.

## Failure and Compensation

Existing request-level retry and rate-limit handling remains the first recovery layer.

Failure behavior is deliberately simple:

- Metadata enumeration failure fails the selected producer and does not advance its inventory.
- A failed group does not publish its candidate inventory.
- Translation failure is surfaced by the existing aggregate result.
- Final revision reconciliation or either site build failure makes the full run unsuccessful.
- The next scheduled run compares against the last successfully published group inventory, rediscovering revisions that were not published in the failed run.
- Operators retain `workflow_dispatch` for a selected failed group or `all`.

The first phase does not add workflow-level automatic reruns because source translation and publication are already durable and retry-aware, and automatic reruns could duplicate costly translation work. Scheduled compensation plus explicit manual rerun provides better operational clarity for the initial implementation.

## Daily Watchdog

Add a lightweight scheduled, read-only watchdog. It does not fetch Feishu content or rebuild sites. It checks that the repository has a successful complete production waterline within the last 24 hours.

The watchdog requires the most recent `group=all`, `publish=true` production result to record:

- aggregate success
- revision reconciliation success
- English build success
- Chinese build success
- completion less than 24 hours ago
- final immutable Git SHA

On failure it:

- fails visibly in GitHub Actions
- creates or updates an existing Feishu report card with the last successful time, failed stage, run URL, and final SHA when available
- does not create a GitHub issue in the first phase
- does not mutate content or trigger Jenkins

The watchdog queries GitHub's Actions API for recent `fetch lark docs` runs, then inspects the selected run's named jobs and aggregate conclusion. Stable job names provide the success contract for revision reconciliation and both site builds. This reuses GitHub's retained run state and existing Feishu reporting primitives without introducing an external state service or another committed status file.

## Testing Strategy

Unit and contract tests cover:

- canonical inventory serialization and stable sorting
- created, updated, moved, renamed, deleted, and fetch-failed classification
- metadata failure never producing deletion
- no-change inventories avoiding publication noise
- checkpoint ownership including the matching group inventory
- final workflow containing revision validation before both site builds
- watchdog accepting a recent complete success and rejecting stale or incomplete status

Integration-level fixtures simulate:

1. A document revision change appears as `updated` and updates the published inventory.
2. A document move without a content revision appears as `moved`.
3. A partial metadata fetch fails without deleting a missing record.
4. A failed run leaves the baseline inventory unchanged, and the next run rediscovers the revision.
5. Final English, Japanese, and Chinese outputs build from the same immutable final SHA.

Live acceptance uses one controlled Feishu test document. An edit must appear in the next scheduled or manual run report, inventory, generated content commit, and successful dual-site verification.

## Scope Boundaries

Included in the first phase:

- per-group revision inventories
- revision diff and changed-today reports
- inventory publication with existing group checkpoints
- final revision reconciliation
- final English and Chinese builds
- 24-hour success watchdog and Feishu alert
- tests and workflow policy enforcement

Excluded from the first phase:

- Feishu webhook or event-subscription ingestion
- candidate publication branches
- whole-site atomic promotion
- automatic workflow-level reruns
- GitHub issue creation
- Jenkins pipeline changes
- `zdoc_cn` changes
- production deployment changes

## Acceptance Criteria

The design is complete when implementation demonstrates:

1. A controlled Feishu edit is classified and reported by the next run.
2. The new revision and its generated content are published together.
3. The final immutable SHA passes revision reconciliation and both named site builds.
4. Metadata failure cannot cause an unintended deletion.
5. A failed run does not lose its unapplied revision on the next run.
6. The watchdog fails when no complete successful all-group run exists within 24 hours.
7. Existing scheduled frequency, grouped publication, translations, Jenkins responsibilities, and `zdoc_cn` isolation remain unchanged.

## Research References

- [Google Drive changes and revisions overview](https://developers.google.com/workspace/drive/api/guides/change-overview)
- [Google Drive changes.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/changes/list)
- [Microsoft Graph delta query overview](https://learn.microsoft.com/en-us/graph/delta-query-overview)
- [OneDrive discovering files and detecting changes at scale](https://learn.microsoft.com/en-us/onedrive/developer/rest-api/concepts/scan-guidance?view=odsp-graph-online)
- [Microsoft Graph driveItem delta](https://learn.microsoft.com/en-us/graph/api/driveitem-delta?view=graph-rest-1.0)
- [Feishu Docs overview and revision field](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs-doc-overview)
- [Feishu event overview](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)
