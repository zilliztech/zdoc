# Zilliz Cloud Docs Report Cards Redesign

## Goal

Make Feishu reporting reflect the actual two-workflow documentation pipeline:

- `fetch-docs.yml` owns source production, source publication, verification, and optional translation handoff.
- `translate-codex.yml` owns downstream translation and translated-content publication.
- Each workflow owns one independently terminal Feishu card.
- Live progress, final reports, links, and failure semantics must describe real jobs rather than retired inline translation stages.

The cards are titled:

- `Zilliz Cloud Docs Build`
- `Zilliz Cloud Docs Translation`

## Confirmed Business Mismatches

The existing reporting path no longer matches the workflow topology:

1. The source live-state model represents one `guides` lane and ignores the `produce_zh_guides_*`, `render_zh_guides_*`, and `publish_zh_guides` jobs. Chinese Guides therefore have no independent live progress.
2. Source reporting still models inline `Translate` and `Publish translations` phases even though translation moved to `translate-codex.yml` behind a handoff.
3. A successful handoff records the child run but no Feishu card monitors the downstream run.
4. Artifact-only report paths link to the parent run's entire `#artifacts` list instead of the exact report artifact.
5. English and Chinese Guides progress metadata use a shared identity even though their table totals are independent.
6. Initial card creation can fail the workflow even though reporting is an observational, best-effort concern.
7. Retired inline Guides translation reporting code and tests remain coupled to the source monitor.

The current baseline test suite has one expected failure in `scripts/docs-workflow/monitor-docs-progress.test.js`: it still expects the removed inline Guides translation publication report. The implementation will replace that assertion with the new workflow boundary rather than preserving retired behavior.

## Card Boundary

### Source Card

`fetch-docs.yml` creates and updates `Zilliz Cloud Docs Build`.

It reports only:

- source production;
- source publication when enabled;
- final source verification when enabled;
- translation handoff when requested.

If `run_translations=false`, the handoff phase is omitted. If handoff is requested, dispatch failure is a source-workflow failure because the requested source orchestration did not complete. Once dispatch succeeds, later child translation failure must not rewrite the already terminal source card.

### Translation Card

`translate-codex.yml` creates and updates `Zilliz Cloud Docs Translation`. A dedicated best-effort card-initialization job starts with the child workflow, before the translation `prepare` job is known to have succeeded. This allows invalid handoffs and other preparation failures to reach a red terminal Translation card.

It reports only:

- handoff preparation and validation;
- Guides batch translation;
- SDK translation matrix progress;
- the serial translated-content publication queue;
- child aggregate status.

The translation card reaches a terminal state only when the child `aggregate` job is complete. Its success or failure is independent of the source card after handoff succeeds.

### Correlation

The source card includes the authenticated child workflow URL returned by the handoff dispatcher. The translation card includes the parent source workflow URL derived from the validated `request_id` correlation value. Both cards remain separate Feishu messages in the same configured chat.

The design does not depend on a Feishu card-to-card deep link because the current card API exposes a message ID, not a stable browser URL. The workflow links are the durable bidirectional correlation mechanism.

## Source Card Design

### Source Lanes

An `all` build has eight independent source lanes:

1. English Guides;
2. Chinese Guides;
3. Python SDK;
4. Java SDK;
5. Node.js SDK;
6. Go SDK;
7. Zilliz CLI;
8. REST API.

English and Chinese Guides are not aliases of one logical lane. Each has its own source-fetch job, render matrix, assembly job, publisher, stable table denominator, current task, and failure detail.

### Layout

The source card uses the approved bilingual Guides layout:

- English Guides and Chinese Guides appear side by side.
- Each Guides panel shows table progress and publication state.
- SDK lanes that are running, waiting, failed, or cancelled appear independently.
- Only completed SDK lanes are placed in a collapsed `Completed SDK publications` panel.
- A requested successful handoff appears as `Translation dispatched` with the exact child workflow link.
- Healthy final report panels remain collapsed; attention reports expand automatically.

The `SUCCEEDED` header tag uses a green background with white text.

### Source Phases

The phase row is derived from jobs that actually exist:

- `Produce` counts selected source lanes.
- `Publish` counts selected source lanes and is omitted in artifact-only mode.
- `Verify` is shown only for published runs.
- `Handoff` is shown only when `run_translations=true`.

There are no source-card `Translate` or `Publish translations` phases.

### Guides Progress Metadata

English and Chinese Guides upload separate validated metadata artifacts. Their identities include both locale and source run ID. The payload includes an exact locale and non-negative table total.

The monitor downloads both artifacts independently. A missing locale artifact degrades only that locale to visible-job counting and logs a bounded warning; it must not overwrite or supply the other locale's denominator.

## Translation Card Design

### Phases

The translation card has four real phases:

- `Prepare`;
- `Translate`;
- `Publish`;
- `Aggregate`.

Translate and Publish totals count selected logical translation units. Japanese Guides count as one logical unit whose detail exposes the actual batch denominator, such as `3/4 batches`. SDK units are identified by target and group. This keeps the top-level denominator stable after handoff while preserving batch detail.

### Target Summaries

The translation card groups progress into three target summaries when selected:

- Japanese Guides;
- Japanese SDKs;
- Chinese Reference SDKs.

Each summary shows translation completion and publication completion. Unselected targets are omitted rather than rendered as skipped.

### Active Units

Running, waiting, failed, and cancelled translation units remain individually visible, for example:

- `Japanese Guides · Translate`;
- `Japanese Java · Publish`;
- `Chinese Python · Publish`.

Completed units move into a collapsed `Completed translation units` panel. Failure detail identifies the failing target/group or Guides batch and the current or last failed step. The publication presentation preserves the workflow's actual serial order instead of implying parallel publication.

## State and Rendering Contracts

Replace the source-only exact state shape with a tagged card-state union:

- a source state contains source phases, two locale-specific Guides lanes, SDK lanes, reports, and workflow links;
- a translation state contains translation phases, target summaries, translation units, and workflow links.

Shared fields remain bounded and validated: title, start time, target branch, overall status, message ID, and links. The renderer dispatches by card kind so source-specific and translation-specific layout rules do not leak into job classification.

Job interpretation stays outside the Feishu renderer:

- source job classification produces a validated source card state;
- translation job classification produces a validated translation card state;
- the renderer accepts either exact state and emits Card V2 elements.

Retries continue to collapse to the newest effective logical job. Unknown jobs are ignored unless they are required to determine an aggregate terminal result.

## Monitoring and Data Flow

### Source

```text
create source card best effort
  -> source monitor polls parent Jobs API
  -> load English and Chinese progress metadata independently
  -> patch source card from exact source state
  -> parent aggregate completes
  -> load validated final source report
  -> patch terminal source card and exit
```

### Translation

```text
child workflow starts
  -> create translation card best effort in an independent initialization job
  -> translation monitor polls child Jobs API
  -> patch translation card from exact translation state
  -> child aggregate completes
  -> patch terminal translation card and exit
```

The initialization job and translation `prepare` job may run in parallel. The monitor waits only for the initialization output, then observes all child jobs including `prepare`. The monitor job must not be a dependency of the aggregate job it watches. Card creation and patch failures are bounded, logged, and non-fatal to content production, translation, validation, and publication. An unavailable card ID disables later patches without failing the workflow.

## Exact Report Links

Published report files continue to use immutable blob URLs at the final published commit when that file exists in the commit.

For current-run artifact reports, the aggregate resolves the exact artifact ID by its fixed artifact name through the GitHub Actions API and constructs the direct artifact URL:

```text
https://github.com/<owner>/<repo>/actions/runs/<run_id>/artifacts/<artifact_id>
```

This downloads or opens the exact containing artifact instead of the run-wide artifact list. GitHub Actions does not expose a stable browser URL for an individual file inside an artifact ZIP, so artifact-only report paths link to their exact locale report artifact, while the report contents remain embedded in the card.

English and Chinese report artifacts remain isolated. A report must never inherit the other locale's artifact URL.

## Failure Semantics

- Source build succeeds and translation succeeds: both cards are green.
- Source build succeeds and translation fails: Build remains green; Translation is red.
- Requested handoff cannot be prepared or dispatched: Build is red; no misleading Translation card is created.
- Translation card creation fails: child translation continues and its workflow result remains authoritative.
- Source card creation fails: source build continues and later finalization is skipped safely.
- A locale progress artifact is missing: live detail degrades for that locale only; workflow execution continues.
- An exact report artifact cannot be resolved: the report is still embedded, its path is plain text, and an attention note identifies the missing download link.
- Card patch or GitHub polling transiently fails: retry with bounded backoff and continue on the next heartbeat.

## Cleanup

Remove source-monitor code, fixtures, and assertions that model inline translation or inline translation publication. Translation publication reporting belongs to the child translation state and card. Compatibility code for the legacy ordered card format may remain only where it is still used outside these workflows.

## Testing

Automated tests must prove:

1. English and Chinese Guides are classified as separate source lanes.
2. Their render denominators come from separate locale-bound metadata artifacts.
3. Source phases never invent inline translation work.
4. Handoff is omitted when not requested and terminal when dispatch succeeds or fails.
5. Translation state maps `prepare`, Guides batches, SDK matrix jobs, the serial publisher chain, and `aggregate` to real targets and units.
6. Translation retry attempts collapse to the newest logical unit.
7. Source and translation cards have the approved titles and independent terminal colors.
8. The Build `SUCCEEDED` tag renders white text on green.
9. Active and failed SDK or translation units stay expanded while completed units collapse.
10. Source and child workflow links are exact and correlation-safe.
11. Current-run report paths use exact artifact-ID URLs rather than `#artifacts`.
12. Card creation and patch failures do not fail either workflow's business jobs.
13. Workflow-policy tests require one monitor per workflow and forbid retired inline translation reporting in `fetch-docs.yml`.

## Local Replay Gate

After implementation, run the real-artifact local publication replay for:

- Java;
- Node.js;
- Go;
- CLI;
- REST;
- Python;
- English Guides;
- Chinese Guides with `ZDOC_SITE=zh-CN`.

Use isolated English and Chinese report directories, preflight every checkpoint archive, publish through a local bare remote seeded at the recorded baseline, enforce the source publication barrier, materialize the exact final state, and run localization-input and revision-inventory validation.

The source report replay must produce exactly nine notes: one workflow summary, four English Guides sections, and four Chinese Guides sections, with no `Unavailable` section. Preserve replay outputs, final SHA, validation logs, generated source and translation card JSON, and exact artifact-link evidence.

## Out of Scope

- Changing translation prompts, models, selection, recovery, or publication order.
- Translating Chinese Guides.
- Making Feishu availability a prerequisite for documentation publication.
- Adding a Feishu card-to-card deep link without a stable API-provided URL.
- Assessing or modifying the deprecated `zdoc_cn` repository.
