# External Link Watchdog Design

## Goal

Replace the stale `check 404` workflow with a non-blocking external-link watchdog that checks the current rendered English documentation site and sends a Feishu alert every time a scan still finds confirmed expired links.

The watchdog is observational:

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

## Workflow Boundary

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

## Relationship to Publishing Workflows

The standalone watchdog owns recurring external-link expiry notification.

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

## Validation and Rollout

Before submission:

1. run the canonical link-check unit and CLI integration tests;
2. run workflow-policy and workflow-contract tests;
3. build the English site from an exact current `dev` state;
4. run the checker against controlled local fixtures for every classification;
5. run one real-network observation and retain its Markdown and JSON reports;
6. replay the affected documentation workflow contract with real artifacts because the canonical checker is shared with publication-stage builds;
7. verify no unrelated user files are staged.

After submission:

1. manually dispatch `external-link-watchdog.yml`;
2. monitor materialization, build, check, artifact upload, and card steps to terminal completion;
3. inspect the uploaded JSON and Markdown reports;
4. prove a controlled expired-link case sends a card without failing the workflow;
5. prove a clean case sends no card;
6. confirm the next scheduled run repeats an unresolved expiry alert.

Keep the old workflow disabled or removed during online validation so one scan cannot generate duplicate cards from two implementations.

## Out of Scope

- Making external-link health a pull-request required check.
- Blocking documentation publication on third-party link status.
- Alert acknowledgement, snoozing, ownership routing, or deduplication across runs.
- Adding Chinese-site external-link scanning in the first cutover.
- Changing documentation ingestion, translation, or publication behavior.
- Repairing `docs-ingestion-watchdog.yml`; its run classification, final-SHA ingestion, and Feishu completion issues are a separate change.
- Assessing or modifying the deprecated `zdoc_cn` repository.
