# Documentation Site Change and Link Health Report Design

## Goal

Make the external-link watchdog report complete and readable for humans while expanding its Feishu card from an expiry-only alert into a recurring documentation site observation report.

Every successful scan must provide two complementary outputs:

- a complete plain-Markdown artifact for local review;
- a concise Feishu card for daily awareness, including both production-versus-`dev` route differences and external-link health.

The authoritative JSON report remains the machine-readable source of truth.

## Confirmed Current-State Problem

The first production run of the merged watchdog, GitHub Actions run `30958773225`, produced a valid schema-v2 JSON report with:

- 501 checked external URLs;
- 21 confirmed expired URLs;
- 22 blocked URLs;
- 66 transient failures;
- 1 other response;
- 487 deleted routes;
- 237 added routes.

The generated Markdown did not contain those complete collections. `renderLinkCheckMarkdown()` sends every report section through a shared `listItems()` helper whose default limit is 10. The artifact therefore replaced most entries with lines such as `...and 477 more`, forcing readers to inspect the JSON to recover the omitted URLs and routes.

The Markdown is downloaded and opened in a local editor. HTML disclosure elements would not improve that workflow, so the complete report must use ordinary Markdown headings and lists with no folding or hidden sections.

The Feishu workflow currently creates a card only when confirmed expired URLs exist and titles it `External Link Watchdog`. That hides useful route-difference and non-expiry health information on otherwise clean runs.

## Scope

This change covers:

- complete Markdown rendering for every report collection;
- explanatory text for every detailed report section;
- a recurring Feishu report on every successful scan;
- a broader card title and summary that includes route differences and link classifications;
- tests and workflow-policy assertions for the new report contract.

This change does not:

- change external-link probing or classification rules;
- change the schema-v2 JSON report;
- retain every referring page for a URL;
- make route differences, blocked URLs, or transient failures fail the workflow;
- modify documentation publication, checkpoint production, translation, or source barriers.

## Artifact Contract

The workflow continues to upload the report directory containing stable `latest.md` and `latest.json` files plus timestamped copies.

### JSON

The schema-v2 JSON remains unchanged. It continues to provide exact counts, complete unique URL and route collections, immutable tooling and content SHAs, and bounded referring-page samples.

Each external-link observation retains at most five sorted referring-page examples and the complete `page_count`. This prevents a single common URL from adding hundreds or thousands of repeated page paths to every report while preserving the scale of its impact.

### Markdown

The Markdown is a complete human-readable rendering of the JSON report. It must not emit `...and N more` or otherwise omit unique URLs or routes.

The report order is:

1. title and immutable run identity;
2. summary statistics;
3. confirmed expired external URLs;
4. blocked external URLs;
5. transient external URLs;
6. other external URL responses;
7. deleted routes;
8. added routes.

The report uses plain Markdown only. It does not use `<details>`, embedded HTML, or a separate summary/full pair.

External-link entries use a multiline list format:

```markdown
- https://example.com/path
  - Result: HTTP 404
  - Referring pages: docs/a.html, docs/b.html
  - Pages shown: 2 of 17
```

When no referring pages are retained, the report says `Referring pages: None`. When all referring pages are retained, the shown and total counts remain explicit. Route entries remain one URL per bullet.

## Section Explanations

Each detailed section begins with a stable explanation of what its count means and how readers should interpret it.

### Confirmed Expired External URLs

> These URLs returned HTTP 404 or 410. They are likely removed or permanently unavailable and should be corrected, replaced, or removed.

### Blocked External URLs

> These URLs returned HTTP 401 or 403. The scanner was denied access, so this does not prove the links are broken; review them only if users also cannot open them.

### Transient External URLs

> These URLs failed because of network errors, timeouts, or retryable HTTP responses such as 408, 425, 429, or 5xx. They are not confirmed broken and should be checked again in a later run.

### Other External URL Responses

> These URLs returned non-success responses that are not classified as expired, blocked, or transient. Review them manually to determine whether the response is expected.

### Deleted Routes

> These routes exist in the production sitemap but are absent from the current `dev` build. They may represent intended removals or renames, or unexpected content loss.

### Added Routes

> These routes exist in the current `dev` build but not in the production sitemap. They are expected to become public after deployment, unless they represent unintended new routes.

The Feishu card uses shorter one-sentence versions of the same definitions where space permits. The Markdown remains the complete explanatory report.

## Feishu Report Contract

Every successful scan creates and explicitly finishes one Feishu card, regardless of whether confirmed expired URLs exist.

The title is:

```text
Documentation Site Change & Link Health Report
```

The card note contains:

- the workflow run URL;
- the immutable tooling SHA and exact `dev` content SHA;
- the report artifact URL;
- deleted-route and added-route counts with bounded representative samples;
- checked, healthy, expired, blocked, transient, and other external-link counts;
- bounded confirmed-expired URL examples and representative referring pages;
- concise interpretation text for the classifications and route differences.

The Feishu note remains bounded because the artifact is the complete report. The card must state that the linked artifact contains every URL and route rather than implying the samples are complete.

Card presentation depends only on confirmed expiry:

- `expired_external_links == 0`: finish the card with success presentation;
- `expired_external_links > 0`: finish the card with failure/attention presentation;
- blocked, transient, other, added-route, and deleted-route counts are informational and do not change the card conclusion.

## Data Flow

```text
scheduled or manual workflow run
  -> resolve immutable master tooling SHA and dev content SHA
  -> restore exact dev-owned content
  -> build the English site
  -> scan rendered external links and compare sitemaps
  -> validate the schema-v2 JSON report
  -> render complete plain Markdown from the validated report
  -> atomically write stable and timestamped JSON/Markdown files
  -> upload the complete report artifact
  -> render one bounded Feishu note from the validated report
  -> create, attach, and finish one Feishu card
```

The JSON report remains the only data model. Markdown and Feishu presentation are separate renderers of the same validated state so their counts and terminology cannot drift independently.

## Failure Semantics

The watchdog remains observational:

- a trustworthy scan succeeds even when expired URLs or route differences exist;
- build, restoration, scan, schema validation, Markdown generation, or artifact upload failures fail the workflow because no trustworthy report exists;
- Feishu create, note, or finish failures remain best effort and do not replace the authoritative scan conclusion;
- the artifact is uploaded before Feishu reporting so a card failure cannot discard the complete report.

If the Feishu create step fails, later card steps may also fail best effort, but the workflow must not claim that a report card was delivered. Step conclusions remain visible in GitHub Actions.

## Test Strategy

Implementation follows test-driven development.

### Markdown renderer tests

- more than ten entries in every report collection are all rendered;
- no `...and N more` marker is emitted;
- all six explanatory paragraphs appear beneath the correct headings;
- external observations use the multiline format;
- bounded referring pages display both the retained count and complete `page_count`;
- empty sections render `None` without losing their explanations;
- stable and timestamped Markdown outputs remain identical.

### Feishu note tests

- the note includes route and link-health summaries;
- route and URL samples are explicitly identified as samples;
- the artifact, workflow, tooling SHA, and content SHA links/identities are present;
- expired and clean reports select attention and success presentation respectively.

### Workflow contract tests

- create, note, and finish steps run after every successful scan rather than only when expiry exists;
- the card title is exactly `Documentation Site Change & Link Health Report`;
- the finish status derives from the validated expired count;
- report upload remains required and precedes Feishu steps;
- Feishu failures remain `continue-on-error` while scan and artifact failures remain authoritative.

### Regression gates

- focused link-check tests;
- external-link-watchdog workflow tests;
- workflow-policy validation;
- TypeScript type checking;
- `actionlint` and `git diff --check`.

## Rollout Verification

This reporting-only change does not touch publication lanes, so checkpoint publication replay is outside scope.

After submission:

1. verify the pull-request site-validation checks;
2. after merge, manually dispatch `external-link-watchdog.yml` on `master`;
3. monitor the run through build, scan, artifact upload, card creation, note attachment, and card finish;
4. download the artifact and confirm that Markdown contains every JSON URL and route with no truncation marker;
5. verify the Feishu card appears on the clean or attention path as dictated by `expired_external_links`;
6. confirm the card title, counts, SHA identities, samples, and artifact URL match the downloaded report.
