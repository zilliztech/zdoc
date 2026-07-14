# External Link Check Feishu Reporting Design

## Goal

Add concise Feishu reporting to the external-link GitHub Actions workflow, following the progress-card pattern already used by the Feishu fetch and translation workflows.

## Notification policy

- Send a card for every `dev` or `master` push run.
- For pull-request runs, send a card only when the checker finds one or more new broken links.
- Do not send Feishu messages for successful pull-request runs.
- A Feishu API or reporting failure must not replace, suppress, or change the underlying link-check result.

## Result definitions

- **Healthy:** The target returned a successful response.
- **Known broken:** The target returned a confirmed 404 or 410 and is already recorded in the shrinking baseline.
- **New broken:** The target returned a confirmed 404 or 410 and is not in the baseline. This fails the workflow.
- **Blocked:** The target rejected automated access, normally with 401 or 403. This does not prove the user-facing link is broken and does not fail the workflow.
- **Transient:** The checker could not obtain a trustworthy final result because of a temporary or environmental condition, such as a timeout, DNS interruption, HTTP 429 rate limiting, or a 5xx server response. This is reported as a warning and does not fail the workflow.

## Card design

Use the existing `report-to-lark` progress-card lifecycle.

- Title: `External Link Check`
- Stage: `Check external links`
- Green completion: no new broken links
- Red completion: one or more new broken links, or the checker itself could not run

The note contains:

- Total external links checked
- Healthy count
- Known broken count
- New broken count
- Blocked count
- Transient count
- GitHub Actions run URL

When new broken links exist, append at most five URL and source-location examples. The complete result remains available in the uploaded JSON artifact.

## Components

### Summary generator

A focused Node.js script reads `tmp/external-link-report.json` and writes a compact Feishu Markdown summary. It owns presentation only; it does not reclassify results or decide whether CI passes.

### GitHub Actions integration

The workflow determines whether a card should be created from the event type:

- Push: create the card before the external check.
- Pull request: run the check first and create a card only if the report contains new broken links.

The final reporting step runs with `always()` when a card exists, reads the checker outcome, attaches the summary note, and finishes the card with the corresponding status.

### Existing reporting plugin

Reuse `report-to-lark --card-create`, `--card-note-file`, and `--card-finish`. No specialized card template or plugin extension is required.

## Data flow

1. GitHub Actions starts the external-link workflow.
2. Push runs create a Feishu card immediately; pull-request runs defer creation.
3. `scripts/check-404.js` writes `tmp/external-link-report.json` and returns the link-check exit status.
4. The summary generator writes a compact Markdown note.
5. A failed pull-request check creates a card after the report exists.
6. The workflow appends the note and finishes the card green or red.
7. The JSON report is uploaded as the authoritative detailed artifact.

## Error handling

- Preserve the link-check exit code separately from Feishu reporting commands.
- Run report generation and final card updates even when the checker reports new broken links.
- If the report file is absent because the checker crashed, produce a red card stating that no structured report was generated.
- Limit card content to avoid Feishu payload limits.
- Do not include credentials, request headers, or full error stacks in the card.

## Testing

- Unit-test summary counts and status wording.
- Unit-test the five-item truncation for new broken links.
- Unit-test missing-report fallback output.
- Add workflow tests for push notification, PR failure-only notification, `always()` finalization, required Feishu environment variables, and report artifact preservation.
- Run existing report-card state tests and workflow-policy tests.
