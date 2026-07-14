# External Link Check Feishu Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send concise Feishu progress cards for production link checks and failed pull-request link checks without changing or masking the checker’s CI result.

**Architecture:** Add a pure summary formatter that converts the JSON link report into bounded Feishu Markdown. Update the workflow to create cards immediately for push runs, defer pull-request cards until a new broken link is confirmed, and finalize existing cards under `always()` while preserving the original checker exit status.

**Tech Stack:** Node.js built-in test runner, GitHub Actions, Docusaurus `report-to-lark` CLI, Feishu interactive cards.

---

### Task 1: Add failing summary-format tests

**Files:**
- Create: `scripts/external-link-report-summary.test.js`
- Create: `scripts/external-link-report-summary.js`

- [ ] **Step 1: Write the summary count test**

Create a fixture containing two healthy links, one known broken link, one new broken link, one blocked link, and one transient link. Assert that the Markdown contains:

```text
Checked: 6
Healthy: 2
Known broken: 1
New broken: 1
Blocked: 1
Transient: 1
```

- [ ] **Step 2: Write the truncation test**

Create six new-broken results with source locations. Assert that the summary lists the first five URLs, omits the sixth URL, and includes `1 more new broken link`.

- [ ] **Step 3: Write the missing-report fallback test**

Call the summary generator with a missing report and assert that it returns a failure summary stating that no structured report was generated.

- [ ] **Step 4: Run tests to verify RED**

Run:

```bash
node --test scripts/external-link-report-summary.test.js
```

Expected: FAIL because the formatter API is not implemented.

### Task 2: Implement bounded Feishu summary generation

**Files:**
- Modify: `scripts/external-link-report-summary.js`
- Test: `scripts/external-link-report-summary.test.js`
- Modify: `package.json`

- [ ] **Step 1: Implement `buildFeishuSummary(report, options)`**

The returned Markdown must include the six result counts and `options.runUrl`. Determine known versus new broken links using `report.baseline.newBroken`.

- [ ] **Step 2: Implement five-item failure details**

For each of the first five new broken links, include the URL and its first source location. Add a remainder line when more than five exist.

- [ ] **Step 3: Implement CLI file handling**

Support:

```bash
node scripts/external-link-report-summary.js \
  --report tmp/external-link-report.json \
  --output tmp/external-link-summary.md \
  --run-url "$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
```

If the report is missing or invalid, write a red-status fallback summary and exit successfully so the final reporting step can still run.

- [ ] **Step 4: Add the package test command**

Add:

```json
"test:external-link-report": "node --test scripts/external-link-report-summary.test.js"
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
npm run test:external-link-report
```

Expected: all summary tests pass.

### Task 3: Add failing workflow reporting tests

**Files:**
- Create: `scripts/check-404-workflow.test.js`
- Modify: `.github/workflows/check-404.yml`

- [ ] **Step 1: Test push card creation**

Assert that the workflow creates an `External Link Check` card when `github.event_name == 'push'` and exports the card outputs.

- [ ] **Step 2: Test PR failure-only card creation**

Assert that deferred card creation is guarded by pull-request event plus a non-empty new-broken result.

- [ ] **Step 3: Test unconditional summary and finalization**

Assert that summary generation and card finalization use `if: always()` with a card-ID guard.

- [ ] **Step 4: Test Feishu credentials and report preservation**

Assert that reporting steps receive `APP_ID`, `APP_SECRET`, and `FEISHU_HOST`, and that the JSON artifact upload remains in the workflow.

- [ ] **Step 5: Run tests to verify RED**

Run:

```bash
node --test scripts/check-404-workflow.test.js
```

Expected: FAIL because the workflow has no Feishu reporting lifecycle.

### Task 4: Integrate the Feishu card lifecycle

**Files:**
- Modify: `.github/workflows/check-404.yml`
- Test: `scripts/check-404-workflow.test.js`

- [ ] **Step 1: Create a push card before checking links**

Add a step guarded by `github.event_name == 'push'`:

```bash
npx docusaurus report-to-lark --card-create \
  --title "External Link Check" \
  --stages "Check external links"
```

- [ ] **Step 2: Preserve the checker result**

Give the checker step an ID and `continue-on-error: true`. Write its outcome to a later guard rather than allowing reporting commands to replace the check result.

- [ ] **Step 3: Generate the Markdown summary**

Run the summary generator under `if: always()` after the checker completes.

- [ ] **Step 4: Create a deferred PR failure card**

When the event is `pull_request` and the report contains new broken links, create the same card after summary generation.

- [ ] **Step 5: Attach the summary**

When a card ID exists, run:

```bash
npx docusaurus report-to-lark --card-note-file tmp/external-link-summary.md
```

- [ ] **Step 6: Finish the card**

Finish green when no new broken links exist and red otherwise. Supply the message ID, start time, stage list, and title from the appropriate card-creation step.

- [ ] **Step 7: Restore the CI exit status**

Add a final shell step that exits non-zero when the checker outcome was failure. Feishu reporting errors must be logged but must not convert a successful link check into failure or a failed link check into success.

- [ ] **Step 8: Run workflow tests**

Run:

```bash
node --test scripts/check-404-workflow.test.js
```

Expected: all workflow reporting assertions pass.

### Task 5: Verify existing report-card compatibility

**Files:**
- Test: `plugins/report-to-lark/reportCardState.test.js`
- Test: `scripts/translation/workflowReporting.test.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Run report-card tests**

```bash
node --test plugins/report-to-lark/reportCardState.test.js
```

- [ ] **Step 2: Run translation reporting tests**

```bash
node --test scripts/translation/workflowReporting.test.js
```

- [ ] **Step 3: Run workflow-policy tests**

```bash
npm run test:workflow-policy
```

Expected: all tests pass without changing fetch or translation reporting behavior.

### Task 6: Full verification

**Files:**
- No additional production files expected.

- [ ] **Step 1: Run all focused tests**

```bash
node --test \
  scripts/check-404.test.js \
  scripts/external-link-report-summary.test.js \
  scripts/check-404-workflow.test.js \
  scripts/validate-workflow-policy.test.js \
  plugins/report-to-lark/reportCardState.test.js
```

- [ ] **Step 2: Run type checking**

```bash
npm run typecheck
```

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

- [ ] **Step 4: Review the final workflow data flow**

Confirm:

- Push success creates and finishes a green card.
- Push failure creates and finishes a red card.
- Pull-request success sends no card.
- Pull-request failure creates and finishes a red card.
- The JSON artifact is uploaded in every non-cancelled run.
- The checker’s original success or failure remains the workflow result.
