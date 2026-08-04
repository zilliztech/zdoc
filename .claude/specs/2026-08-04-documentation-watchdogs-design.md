# Documentation Watchdogs Design

## Goal

Restore trustworthy documentation observability through two independent watchdogs:

- replace the stale `check 404` workflow with a non-blocking external-link watchdog that checks the current rendered English documentation site and repeatedly reports confirmed expired links;
- retain and repair `docs ingestion watchdog` so it reliably reports when no qualifying full production ingestion has completed successfully within 24 hours.

The two workflows share reporting conventions but have different business conclusions. External-link expiry is an informational documentation finding and does not fail its workflow. Missing production ingestion is an operational failure and continues to fail the ingestion-watchdog workflow.

The external-link watchdog is observational:

- confirmed expired links do not block pull requests, documentation publication, or the watchdog workflow itself;
- each scheduled scan that still finds expired links sends another alert;
- a clean scan sends no success card, so alerts stop naturally when all expired links are fixed;
- build, checkout, report-generation, or artifact failures remain workflow failures because they mean the watchdog did not produce a trustworthy observation.

## Confirmed Current-State Problems

The existing `.github/workflows/check-404.yml` no longer observes current documentation content:

1. `scripts/check-404.js` scans only `docs`, `docs-byoc`, and `reference`.
2. Those directories no longer exist on either `master` or `dev`; current English content is under `content/en` and is rendered through `apps/docs`.
3. A current successful `check 404` artifact contains zero files and zero links, so the workflow reports false health.
4. The repository already has a newer rendered-site checker at `packages/docs-tooling/src/links/check.ts`, exposed as `pnpm docs-tooling check-links`.
5. The newer checker operates on built HTML and the local sitemap, so repairing the retired Markdown scanner would preserve duplicate implementations and a less accurate input boundary.
6. The newer checker currently treats every HTTP or network problem as one `broken_external_links` bucket, uses `HEAD` only, and does not distinguish confirmed expiry from access blocking or transient failure.

The design therefore retires the old checker and makes the rendered-site checker the only external-link observation implementation.

The existing `docs ingestion watchdog` observes the correct production workflow, but parts of its implementation no longer satisfy their intended contracts:

1. It correctly queries `fetch-docs.yml` and still checks the current required jobs: `resolve_final`, `verify / verify`, and `aggregate`.
2. Its 24-hour freshness failure in run `30854402640` was a real signal: the most recent scheduled production attempts after the last success failed or were cancelled.
3. It attempts to classify `workflow_dispatch` runs from `GET /actions/runs/{id}` response `inputs`, but the current GitHub API response supplies `inputs: null`. Manual full-production recovery runs therefore cannot clear the watchdog.
4. Even if those inputs were available, the predicate checks only `group=all` and `publish=true`; it does not require `target_branch=dev`, so a successful drill publication could be misclassified as production.
5. It creates `reportsByRunId` but never downloads any report artifacts. The expected `final_sha` is therefore always unavailable.
6. The current `docs-card-report` schema contains no final SHA or production-selection identity, so simply downloading that artifact would still not satisfy the watchdog contract.
7. The Feishu completion step does not pass the created card message ID through the current report-card interface. Run `30854402640` logged `message id is required` during finalization.

The ingestion workflow's core purpose remains valid. The design repairs its evidence and reporting contracts rather than replacing or disabling it.

## Watchdog Separation

The repository keeps two standalone workflows:

| Workflow | Observation | Alert condition | Workflow conclusion |
| --- | --- | --- | --- |
| `external-link-watchdog.yml` | Rendered external links in current `dev` documentation | One or more confirmed HTTP 404/410 URLs | Success when the scan itself is trustworthy |
| `docs-ingestion-watchdog.yml` | Freshness of qualifying full production ingestion | No qualifying successful production run within 24 hours | Failure until production freshness is restored |

Neither watchdog is a dependency of `fetch-docs.yml`, translation workflows, pull-request checks, or publication jobs. A failure or delay in either watchdog cannot block documentation publication. Their Feishu cards use independent titles, artifacts, and run links.

## External-Link Workflow Boundary

Create `.github/workflows/external-link-watchdog.yml` as a standalone workflow owned by documentation observability rather than by pull-request validation or publication orchestration.

Triggers:

- one daily `schedule` run at `0 1 * * *` (09:00 Asia/Shanghai);
- `workflow_dispatch` for investigation and validation;
- no `pull_request` trigger;
- no required-check or publication dependency.

The daily schedule provides the recurring scan required for repeated notifications. The notification frequency is exactly the scan frequency: the workflow stores no suppression, acknowledgement, or previously-alerted state.

Use one workflow-level concurrency group with `cancel-in-progress: false` so scheduled and manual scans do not overlap or cancel an observation that may need to send an alert.

The workflow reads tooling from the current default-branch commit and documentation state from the current `dev` commit. It must resolve and record both immutable SHAs before building so every report identifies the exact checker implementation and exact documentation state that were observed.

## Data Flow

```text
scheduled or manual run
  -> resolve immutable master tooling SHA and dev content SHA
  -> check out master tooling
  -> materialize the exact dev-owned documentation state
  -> install locked dependencies
  -> build the English site
  -> run the canonical rendered-site link checker
  -> classify external results
  -> write Markdown and JSON reports
  -> upload the reports on every completed scan
  -> if confirmed expired links exist, create and finish a Feishu alert card
  -> otherwise finish without a card
```

The workflow must use the same owned-state restoration contract as final documentation verification. It must not run directly from an arbitrary mutable working tree or assume that the default branch contains current published content.

## Canonical Link Checker

Keep `packages/docs-tooling/src/links/check.ts` and `pnpm docs-tooling check-links` as the canonical implementation.

The checker continues to:

- load the configured remote production sitemap;
- load the locally built sitemap;
- report added and deleted routes;
- scan rendered HTML under the site profile's content route roots;
- deduplicate external URLs while preserving the pages that reference them;
- write stable `latest.md` and `latest.json` reports plus timestamped copies.

The watchdog uses the route and external-link observations, but only confirmed expired external links trigger the repeated Feishu alert.

## External Result Classification

Replace the single broken-link bucket with explicit classifications:

- `healthy`: successful 2xx or redirect response;
- `expired`: HTTP 404 or 410;
- `blocked`: HTTP 401 or 403 after request fallback;
- `transient`: timeout, connection failure, HTTP 408, 425, 429, or 5xx;
- `other`: other non-success HTTP responses that require inspection but do not prove expiry.

Only `expired` entries generate the external-link-expiry alert.

The JSON summary contains independent counts for checked, healthy, expired, blocked, transient, and other URLs. Each non-healthy entry records:

- the normalized external URL;
- the classification;
- HTTP status or bounded error text;
- up to a bounded number of referring rendered pages;
- the total number of referring pages.

The Markdown report shows confirmed expired links first, followed by blocked, transient, and other observations. Route additions and deletions remain informational sections and do not trigger this alert.

## Request Strategy

Use a bounded two-stage request strategy to reduce false expiry reports:

1. Send `HEAD` with the existing timeout and user-agent policy.
2. Fall back to a bounded `GET` request when `HEAD` is rejected or is not representative, including HTTP 403, 405, and 501.

The fallback should request a minimal response body where supported and must not buffer arbitrary response bodies. Both stages share one bounded timeout/retry policy. A failed fallback is classified rather than thrown as a checker infrastructure error.

Malformed URLs, unreadable build output, a missing sitemap, or an inability to enumerate rendered pages are checker infrastructure failures. They fail the command and therefore fail the workflow.

## Fail-Closed Observation Contract

A successful observation must prove that meaningful content was scanned. The checker fails when any of these invariants is violated:

- the local build directory does not exist;
- the local sitemap does not exist or contains no documentation routes;
- no rendered HTML pages exist below the configured content route roots;
- the report cannot be written atomically;
- the generated JSON report does not satisfy its schema.

An empty external-link set is allowed only when rendered pages and sitemap routes were successfully enumerated. This distinguishes a genuinely link-free site from the old workflow's missing-directory false success.

## Alert Semantics

When `expired_external_links > 0`, the workflow creates one `External Link Watchdog` Feishu card for that run.

The card includes:

- the number of confirmed expired URLs;
- a bounded list of expired URLs and representative referring pages;
- the exact workflow run URL;
- the immutable `master` tooling SHA;
- the immutable `dev` content SHA;
- the exact report artifact URL when it can be resolved.

The card is completed with failure presentation because attention is required, but card creation, attachment, or completion errors remain best effort and do not change the trustworthy scan result.

The workflow does not persist notification state. If the same URL remains expired tomorrow, tomorrow's scan sends another card. Once a scan no longer classifies it as expired, no card is sent.

Blocked and transient observations remain in the artifact report without producing an expiry card. This prevents authentication rules, rate limits, and temporary third-party outages from being reported as confirmed stale documentation links.

## Workflow Conclusion Semantics

The workflow conclusion distinguishes documentation observations from watchdog operability:

- scan succeeds with no expired links: workflow succeeds, no card;
- scan succeeds with expired links: workflow succeeds, failure-presented Feishu alert card;
- scan succeeds with only blocked or transient links: workflow succeeds, artifact report only;
- build, materialization, checker, schema, or upload failure: workflow fails;
- Feishu API failure: workflow still follows the scan result and logs the reporting failure.

This preserves the requested non-blocking behavior while making a green workflow mean that the watchdog completed a valid scan, not that every external link was healthy.

## Cleanup

Remove the retired implementation and its dedicated compatibility surface:

- `.github/workflows/check-404.yml`;
- `scripts/check-404.js`;
- `scripts/check-404.test.js`;
- `scripts/check-404-workflow.test.js`;
- `scripts/external-link-report-summary.js`;
- `scripts/external-link-report-summary.test.js`;
- `config/link-check-baseline.json`;
- retired package scripts that invoke or test those files.

Update workflow-policy and active-workflow assertions that name `check-404.yml` so they describe `external-link-watchdog.yml` and its non-blocking alert contract instead.

No baseline of accepted expired links is retained. The requested behavior is to notify on every scan until a link stops being expired; suppressing known expired URLs would contradict that requirement.

## Docs Ingestion Watchdog Repair

Keep the existing daily schedule at `0 21 * * *`. It runs three hours after the final scheduled `fetch-docs.yml` window at `18:00` UTC, so the 24-hour threshold represents multiple missed or unsuccessful production opportunities rather than one isolated run failure.

The watchdog continues to support `workflow_dispatch` for manual investigation. Use one concurrency group with `cancel-in-progress: false` so a manual investigation cannot cancel the scheduled freshness decision.

### Explicit Production Result Artifact

Add a dedicated, validated `docs-production-result-<run_id>` artifact to `fetch-docs.yml`. Do not overload `docs-card-report`, whose schema and consumers are presentation-oriented and currently contain neither production selection nor final publication identity.

The artifact contains one exact JSON file with this contract:

```json
{
  "schemaVersion": 1,
  "runId": 123,
  "event": "schedule",
  "selectedGroup": "all",
  "publishEnabled": true,
  "targetBranch": "dev",
  "toolingSha": "<40-character SHA>",
  "sourceSha": "<40-character SHA>",
  "finalDevSha": "<40-character SHA>",
  "overallStatus": "success",
  "generatedAt": "<ISO timestamp>"
}
```

Validation is exact and fail closed:

- unknown keys are rejected;
- `runId` must match the containing workflow run;
- `event` is `schedule` or `workflow_dispatch`;
- `selectedGroup` is one of the supported content groups;
- booleans are real booleans rather than truthy strings;
- branch names are bounded single-line Git branch names;
- SHA fields are lowercase 40-character commit IDs;
- `overallStatus` is `success`, `failure`, or `cancelled`;
- `generatedAt` is a canonical ISO timestamp.

The `aggregate` job creates and uploads the artifact under `if: always()`. A successful production result requires a non-empty validated `finalDevSha`. Failure and cancellation artifacts may use `finalDevSha: null`, with the schema allowing null only when `overallStatus` is not `success`.

The artifact retention must be at least seven days, independent of short-lived checkpoint retention, so the daily watchdog can inspect multiple production windows after transient GitHub delays.

### Production Qualification

A run qualifies as production only when its validated result artifact states all of the following:

- `selectedGroup` is `all`;
- `publishEnabled` is `true`;
- `targetBranch` is exactly `dev`;
- `overallStatus` is `success`;
- `finalDevSha` is present and valid.

Both scheduled and manually dispatched runs use the same artifact-based predicate. GitHub event type alone does not prove production, and REST run-detail inputs are not used for qualification.

The watchdog independently cross-checks that `resolve_final`, `verify / verify`, and `aggregate` all completed successfully. Artifact identity and job conclusions must agree; disagreement is treated as invalid production evidence rather than as a successful run.

This allows a manually dispatched full `dev` recovery run to restore health while excluding artifact-only runs, partial group runs, integration drills, alternate target branches, and malformed or missing evidence.

### Freshness Evaluation

Inspect a bounded, paginated set of recent completed `fetch-docs.yml` runs and their exact artifacts. Select the newest qualifying successful production result by completion time.

The consumer is enabled only after one successful full `dev` production run has uploaded and validated the new artifact contract. After that activation point, a completed run that exposes the exact production-result artifact name but contains malformed evidence is an observer infrastructure failure. A scheduled run completed after activation without its required artifact is `result_artifact_missing`. Failed or cancelled runs remain non-qualifying production attempts and do not erase an earlier valid success, but their metadata may be included in diagnostics.

The result is healthy only when:

- a qualifying successful run exists;
- it completed no more than 24 hours before the watchdog evaluation time;
- required jobs and artifact identity agree.

The watchdog output contains:

- `ok`;
- bounded reason code and human-readable reason;
- qualifying production run ID and URL;
- completion timestamp;
- final `dev` SHA;
- tooling SHA and source SHA from the evidence artifact;
- evidence artifact ID and exact artifact URL.

Use stable reason codes such as `healthy`, `no_qualifying_success`, `success_too_old`, `required_job_missing`, `required_job_failed`, `result_artifact_missing`, and `result_artifact_invalid`. Feishu text is derived from these codes rather than parsed from arbitrary errors.

### Artifact Download Contract

Reuse the hardened GitHub artifact adapter pattern already implemented by `monitor-docs-progress.js`:

- authenticate with the workflow token;
- resolve an exact artifact name for the expected run ID;
- reject zero or multiple matching live artifacts;
- download to a fresh temporary directory;
- reject archive traversal, symlinks, duplicate files, and unexpected filenames;
- validate the JSON before using any field;
- remove temporary files after inspection.

API or download failures are bounded and reported as watchdog infrastructure failures. They must not silently turn into `no qualifying success`, because that would confuse an unavailable observer with a real production outage.

### Ingestion Alert Semantics

When freshness evaluation is unhealthy, create one `Docs Ingestion Watchdog` Feishu card for that watchdog run. Each later scheduled scan that remains unhealthy creates another card; a healthy scan creates no card.

The card includes:

- stable reason and human-readable detail;
- last qualifying production completion time when available;
- qualifying production run URL when available;
- exact final `dev` SHA when available;
- watchdog run URL;
- evidence artifact URL when available.

Create, note, and finish operations use the current report-card outputs explicitly. The finish command receives `--message-id`, `--started-at`, `--stages`, and `--title` from the create step, matching the working workflow contract. Reporting remains best effort, but the final preserve step fails the workflow whenever freshness is unhealthy.

The watchdog uploads its own validated JSON decision artifact on every run, including healthy runs and infrastructure failures when a bounded decision can be produced.

### Ingestion Workflow Conclusion Semantics

- qualifying success within 24 hours: workflow succeeds, no card;
- no qualifying success or success older than 24 hours: workflow fails and sends a repeated failure card;
- required-job/artifact disagreement: workflow fails and sends a failure card;
- GitHub API, artifact download, or schema-validation failure: workflow fails as observer infrastructure failure;
- Feishu API failure: workflow still follows the freshness decision and logs the reporting failure.

## Relationship to Publishing Workflows

The external-link watchdog owns recurring external-link expiry notification. The ingestion watchdog owns production freshness notification. Neither owns publication itself.

Existing calls to `run-doc-build-stage.js` inside publication workflows may continue generating informational link reports during the first migration step, but they do not own repeated notification and must not create duplicate expiry cards. Once the watchdog is proven online, a follow-up cleanup may set publication-stage builds to skip external network checks and leave structural build validation in place. That optimization is intentionally separate so the initial cutover does not change publication behavior and observability simultaneously.

The final `fetch-docs.yml` verification contract remains unchanged by this design. The external-link watchdog observes the current `dev` state independently and cannot block source production, publication, translation handoff, or final revision verification.

## Testing

Automated tests must prove:

1. 2xx and redirects classify as healthy.
2. 404 and 410 classify as expired.
3. 401 and 403 classify as blocked after fallback.
4. 408, 425, 429, 5xx, timeout, and connection errors classify as transient.
5. rejected `HEAD` requests fall back to bounded `GET` requests.
6. duplicate external URLs are checked once while retaining all referring pages.
7. the JSON and Markdown reports separate expired, blocked, transient, and other observations.
8. route additions and deletions remain informational.
9. zero rendered pages or zero sitemap routes fail closed.
10. a valid rendered site with zero external URLs succeeds.
11. expired links do not set a failing process exit code.
12. infrastructure failures do set a failing process exit code.
13. the workflow creates a Feishu card only when confirmed expired links exist.
14. repeated runs with the same expired link each create a card because no suppression state exists.
15. card failures do not change the scan conclusion.
16. the workflow uploads reports for clean, expired, blocked, and transient outcomes.
17. no active workflow or package command invokes the retired Markdown scanner.

Ingestion-watchdog tests must prove:

1. the production-result schema rejects unknown fields, invalid identities, and run-ID mismatches;
2. scheduled and manual runs use the same artifact-based qualification predicate;
3. a full published `dev` run qualifies;
4. partial groups, artifact-only runs, drill branches, alternate target branches, failed runs, and cancelled runs do not qualify;
5. a successful manual full `dev` recovery can restore freshness;
6. `resolve_final`, `verify / verify`, and `aggregate` must all agree with the success artifact;
7. the newest qualifying success is selected by completion time;
8. exactly 24 hours is healthy and any greater age is stale;
9. final `dev`, tooling, and source SHAs come from the validated artifact;
10. missing and malformed artifacts produce distinct stable reason codes;
11. API failure is reported as observer infrastructure failure rather than production staleness;
12. archive traversal, symlinks, duplicate files, and unexpected filenames are rejected;
13. an unhealthy scan creates and explicitly finalizes one Feishu card;
14. repeated unhealthy scans each create a card;
15. a healthy scan creates no card;
16. Feishu failure does not replace the authoritative freshness conclusion;
17. the watchdog decision artifact is uploaded for healthy and unhealthy results.

## Validation and Rollout

Before submission:

1. run the canonical link-check unit and CLI integration tests;
2. run the production-result, artifact-adapter, and ingestion-watchdog unit tests;
3. run workflow-policy and both watchdog workflow-contract tests;
4. build the English site from an exact current `dev` state;
5. run the checker against controlled local fixtures for every classification;
6. run one real-network observation and retain its Markdown and JSON reports;
7. replay the affected documentation workflow contract with real artifacts because the canonical checker and new production-result artifact are shared with publication-stage builds;
8. prove a successful full manual `dev` result and a scheduled result are classified identically;
9. verify no unrelated user files are staged.

After submission:

1. enable production-result artifact emission while retaining the existing ingestion-watchdog consumer;
2. manually dispatch `fetch-docs.yml` with `group=all`, `publish=true`, and `target_branch=dev` using the intended production inputs;
3. monitor producer, publisher, final verification, aggregate, production-result upload, and card finalization to terminal completion;
4. inspect and validate the exact production-result artifact, then record that run as the consumer activation point;
5. enable the repaired ingestion-watchdog consumer and manually dispatch it;
6. prove it selects the exact bootstrap production run and final `dev` SHA;
7. prove a controlled stale fixture creates and explicitly finalizes an ingestion failure card;
8. manually dispatch `external-link-watchdog.yml`;
9. monitor materialization, build, check, artifact upload, and card steps to terminal completion;
10. inspect the uploaded JSON and Markdown reports;
11. prove a controlled expired-link case sends a card without failing the workflow;
12. prove a clean case sends no card;
13. confirm the next scheduled run repeats an unresolved expiry alert.

Keep the old workflow disabled or removed during online validation so one scan cannot generate duplicate cards from two implementations.

## Out of Scope

- Making external-link health a pull-request required check.
- Blocking documentation publication on third-party link status.
- Alert acknowledgement, snoozing, ownership routing, or deduplication across runs.
- Adding Chinese-site external-link scanning in the first cutover.
- Changing documentation ingestion, translation, or publication behavior.
- Changing `fetch-docs.yml` schedules, publication groups, translation handoff, or final verification criteria beyond emitting the validated production-result artifact.
- Assessing or modifying the deprecated `zdoc_cn` repository.
