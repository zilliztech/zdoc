# Centralized Documentation Progress Card Design

## Goal

Make the Feishu Card V2 progress card reflect the complete documentation workflow in near real time, including long-running Guides source work, parallel Guides table rendering, queued SDK publication, translation, verification, and final reports.

The card must update at least once every 60 seconds while the workflow is active, remain readable at the actual Feishu desktop card width, and never require producer or render workers to receive Feishu credentials.

## Confirmed Failure

The current progress card is created in `prepare`, but a single-group Guides run selects `ordered` card mode while the custom Guides source/render/assemble path does not emit ordered phase updates. `_fetch-guides-sources.yml` only reports when `card_mode == aggregate`, `_render-guides-table.yml` intentionally has no Feishu secrets, and `_assemble-guides.yml` does not report intermediate progress.

Consequently, the card remains at its creation state throughout a long Guides run. The header elapsed time remains at zero until another job patches the card, and the user cannot distinguish source fetching, media prefetch, table rendering, or assembly.

The reporting architecture is also fragmented. Reusable producers, publishers, translators, verification, and the final aggregate job each contain partial card-update logic. A custom workflow path can therefore omit updates even when the derived state builder already understands its jobs.

## Architecture

### Central Monitor

Add a `monitor_docs_progress` job that starts after `prepare` and runs concurrently with documentation production. It owns all normal card updates from the first heartbeat through the terminal report.

Every 60 seconds the monitor:

1. reads the current workflow jobs and steps through the GitHub Actions Jobs API;
2. derives a complete card state from that authoritative snapshot;
3. patches the Feishu card, refreshing the elapsed time even when the workflow state has not changed;
4. records a bounded diagnostic summary without exposing job logs, tokens, or environment values.

The monitor has `actions: read` and `contents: read`. It receives the Feishu application credentials, card message ID, start time, target branch, selected group, and publish mode. Documentation producers, Guides table renderers, and artifact assemblers remain credential-free unless they already require Feishu credentials for their primary business operation.

Card update failures are non-fatal to documentation production. The monitor job may fail, but it must not become a dependency of any producer, publisher, translator, assembler, or verifier.

### Single Card Owner and Fallback

Intermediate card PATCH calls are removed from reusable producer, publisher, translator, and verification workflows. Those jobs continue to generate their domain reports and expose their normal artifacts and outputs, but they no longer own presentation state.

The terminal `aggregate` job stops patching the card directly. Instead, it always attempts to create and upload a small `docs-card-report-<run_id>` artifact containing the final structured result and bounded report content.

The monitor waits for `aggregate` to complete, downloads and validates that artifact, applies the terminal card state and reports, and exits successfully.

A `finalize_card_fallback` job depends on both `aggregate` and `monitor_docs_progress`. It runs only when the monitor did not complete successfully and performs one best-effort terminal update from the final report artifact or, if necessary, from the terminal GitHub job snapshot.

### Final Report Ownership

Report generation remains with the job that understands the report. Report presentation moves into the central monitor.

The aggregate job materializes the final published report directories when a final target SHA exists, collects the current bounded summaries, combines them with terminal workflow results, and writes a fixed-schema `card-report.json`. Artifact-only runs use reports produced in the current run where available and do not pretend that an unpublished final SHA exists.

The report artifact contains no credentials, raw environment values, complete job logs, or arbitrary paths. Markdown fields and collection sizes are bounded before upload.

## State Model

The monitor derives a complete state on every poll instead of applying deltas to the previous card:

```js
{
  overallStatus: 'running',
  phases: [
    { key: 'produce', label: 'Produce', done: 4, total: 7, status: 'running' },
    { key: 'publish', label: 'Publish', done: 1, total: 7, status: 'running' },
    { key: 'translate', label: 'Translate', done: 0, total: 7, status: 'pending' },
    { key: 'translation', label: 'Publish translations', done: 0, total: 7, status: 'pending' },
    { key: 'verify', label: 'Verify', done: 0, total: 1, status: 'pending' },
  ],
  manuals: [
    {
      group: 'guides',
      phase: 'produce',
      status: 'running',
      currentTask: 'Render Guides tables',
      detail: '8/14 complete · 4 active · 2 pending · 0 failed',
    },
    {
      group: 'java',
      phase: 'publish',
      status: 'waiting',
      currentTask: 'Waiting for Python publisher',
    },
  ],
  reports: [],
}
```

Allowed manual statuses are `failed`, `running`, `waiting`, and `completed`. Card ordering is deterministic:

1. failed manuals, preserving the failed current task;
2. actively running manuals;
3. waiting manuals in workflow dependency order;
4. completed manuals in a collapsed section at the bottom.

The state is reconstructible after a monitor restart because GitHub Actions is the source of truth. The existing card contents are never used as workflow state.

## Job and Task Derivation

### Guides

Guides production is derived from:

- `produce_guides_sources / fetch` and its named steps;
- every `render_guides_tables / <target> / <table> / render` matrix job;
- `produce_guides / assemble` and its named steps.

The current task progresses through:

1. restore or bootstrap source cache;
2. fetch shared Guides sources;
3. prefetch shared Guides media;
4. build the table matrix and source artifact;
5. render Guides tables with `completed / total`, active, pending, and failed counts;
6. restore table artifacts;
7. generate combined sidebars;
8. validate and build the combined output;
9. prepare and upload the Guides checkpoint.

Matrix retries are grouped by logical target/table identity. Only the latest effective attempt contributes to the current status, while any final failed identity is listed in the failed detail.

### SDK and Other Manuals

Each selected manual is derived from its logical jobs:

- `produce_<group>`;
- `publish_<group>`;
- `translate_<group>` or Guides translation batch jobs;
- `publish_<group>_translation` or Guides translation batch publishers.

The running GitHub step becomes `currentTask` after setup, checkout, dependency installation, post-job cleanup, and other infrastructure-only steps are normalized or suppressed.

Waiting tasks are derived from the explicit workflow dependencies. For example:

- `Java SDK · Publish` — `Waiting for Python publisher`;
- `Go SDK · Publish` — `Waiting for Java publisher`;
- `CLI · Publish` — `Waiting for Go publisher`.

This makes the existing publisher queue visible without inventing progress that has not started.

Artifact-only mode includes only the phases that the run requested. Publish and translation stages are not shown as failed or permanently pending when `publish=false`.

## Card V2 Presentation

### Header and Aggregate Phases

The Card V2 header uses semantic templates and native status tags:

- blue and `Running` while active;
- green and `Succeeded` after success;
- red and `Failed` after failure;
- red and `Cancelled` after cancellation when a cancellation update succeeds.

The subtitle contains the target branch and elapsed time. A 60-second heartbeat guarantees that elapsed time remains current during long source fetches, render jobs, and site builds.

Aggregate phases use two root-level `column_set` rows to remain readable at the observed Feishu card width:

- first row: Produce, Publish, Translate;
- second row: Publish translations, Verify.

Artifact-only or single-purpose runs omit irrelevant phases rather than showing them indefinitely pending.

### Manual-Centric Blocks

The native manual table is retired because its five status columns overflow the practical Feishu card width and hide the translation status behind horizontal scrolling.

Every active or waiting manual is rendered as a native Card V2 `column_set` containing a padded column:

- running blocks use `blue-50`;
- waiting blocks use `grey-50`;
- failed blocks use `red-50`;
- status uses a native `text_tag`;
- `CURRENT TASK` uses notation-sized muted text;
- the task description and bounded quantitative detail appear beneath it.

There is no separate publisher queue panel. A queued manual owns its waiting reason through `CURRENT TASK`.

Completed manuals move to a grey, collapsed `collapsible_panel` at the bottom. Its header shows the completed count, and the expanded content lists the completed phase or final task for each manual.

### Reports and Footer

Final reports use one `collapsible_panel` per report. Healthy reports are collapsed by default. Reports containing failures, warnings, errors, broken links, or broken references are expanded by default.

The footer uses a native divider and notation-sized Markdown containing the start time, elapsed time, target branch, and immutable workflow link.

The production Card JSON uses only supported Card V2 components and properties. It does not depend on custom CSS, HTML layout, a horizontally scrolling table, or deeply nested tables and panels.

## Lifecycle and Polling

The monitor polls once every 60 seconds. It patches on every heartbeat so elapsed time remains fresh. A content hash may be logged to distinguish a pure heartbeat from a state change, but it does not suppress the heartbeat PATCH.

GitHub API and Feishu PATCH requests use bounded retries with exponential backoff. A failed poll retains the last successfully displayed card and retries on the next interval.

When `aggregate` completes, the monitor stops normal polling, fetches the final report artifact, performs one terminal PATCH, and exits. The aggregate result and validated report artifact determine the terminal status; a stale running job snapshot cannot overwrite the terminal card.

On SIGTERM or SIGINT, the monitor makes one best-effort cancellation PATCH using the latest derived state before exiting. GitHub may terminate a cancelled job before the request completes, so `finalize_card_fallback` remains the terminal recovery path for non-cancellation failures.

## Failure Semantics

- GitHub Jobs API failure: retry, then continue at the next heartbeat without changing documentation jobs.
- Feishu PATCH failure: retry and report a bounded warning; do not fail documentation production.
- Monitor failure: allow the workflow to continue and invoke the terminal fallback after aggregate.
- Missing or invalid report artifact: finish from GitHub job state and add `Final report unavailable`.
- Manual failure: pin the manual block at the top in `red-50`, show the failed current task, and retain the workflow link.
- Report warnings: keep the workflow result unchanged unless the aggregate result failed, but expand the affected report panel.
- Cache, producer, publisher, translator, or verifier cancellation: map to a failed or cancelled presentation instead of leaving the card running.

## Security and Integrity

- Feishu credentials are limited to `prepare`, `monitor_docs_progress`, and `finalize_card_fallback`.
- GitHub render matrix jobs remain read-only and credential-free.
- The monitor has read-only repository and Actions permissions.
- Card updates are non-fatal to documentation production.
- `card-report.json` has a fixed schema, bounded arrays and text fields, and no arbitrary file paths.
- The monitor never renders raw job logs, environment variables, API responses, or secrets into the card.
- Workflow and report links use immutable run or commit identities where available.

## Testing

### Pure State Tests

Fixture-driven tests cover:

- Guides source fetch, media prefetch, table matrix creation, `8/14` rendering, and assembly;
- an empty Guides matrix;
- failed and retried target/table jobs;
- SDK producers running in parallel;
- ordered SDK publisher dependencies and waiting descriptions;
- source publication, translation, and translation publication;
- artifact-only runs omitting irrelevant phases;
- failed, running, waiting, and completed ordering;
- infrastructure step suppression and human-readable `currentTask` normalization;
- duplicate job names and final-attempt selection.

### Card V2 Tests

Card builder tests require:

- schema `2.0`;
- semantic header template and status tag;
- two phase `column_set` rows instead of five compressed columns;
- no native manual `table`;
- running, waiting, and failed manual blocks with legal backgrounds and native tags;
- notation-sized `CURRENT TASK` labels;
- a collapsed Completed panel;
- report panels with attention-based expansion;
- a native divider and compact footer;
- no prohibited table nesting or unsupported custom layout fields.

### Monitor and Workflow Tests

Monitor tests use injected GitHub and Feishu clients to prove:

- a 60-second heartbeat patches an unchanged state;
- state changes are reflected on the next poll;
- transient API failures retry and recover;
- aggregate completion triggers final artifact validation and one terminal update;
- invalid reports fall back to terminal job state;
- signal handling attempts a cancellation update.

Workflow policy tests require:

- monitor startup after `prepare`;
- no producer or Guides render Feishu credentials;
- removal of distributed real-time PATCH ownership;
- an always-attempted final card-report artifact;
- a conditional fallback updater;
- card reporting failures remaining non-fatal.

Sanitized job snapshots from recent successful and failed documentation runs are replayed to validate long source fetches, fourteen Guides table renders, SDK publisher queues, verification failures, and final report presentation.

## Rollout

1. Run the updated workflow with `publish=false` on a disposable target branch.
2. Confirm card heartbeats update elapsed time during a long source fetch.
3. Confirm Guides displays source, media, table `completed / total`, active, pending, and failed counts.
4. Confirm SDK producers appear concurrently and publishers show explicit waiting dependencies.
5. Confirm completed manuals move into the collapsed grey panel.
6. Confirm a successful aggregate loads the final report artifact and produces one terminal card.
7. Run a controlled failure and confirm the failed manual is pinned at the top with the failed task.
8. Verify the fallback terminal updater by forcing the monitor to fail in a disposable test run.
9. Enable the design for scheduled production only after both success and failure paths are verified.

## Non-Goals

- Giving Feishu credentials to producer, renderer, or table-matrix workers.
- Streaming raw workflow logs into Feishu.
- Replacing GitHub Actions as the authoritative execution state.
- Changing documentation production, publication, or translation ordering.
- Adding an external monitoring service.
- Making card reporting failures block documentation publication.
