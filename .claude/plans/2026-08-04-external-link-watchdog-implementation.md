# External Link Watchdog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale Markdown 404 workflow with a daily rendered-site watchdog that repeatedly alerts on confirmed 404/410 links without failing publication or a trustworthy scan.

**Architecture:** Extend the canonical checker in `packages/docs-tooling/src/links/check.ts` so each deduplicated rendered external URL has a typed result and the report is schema validated before atomic writes. A standalone workflow checks immutable `dev` content under immutable `master` tooling, uploads every valid observation, and creates a best-effort Feishu card only when confirmed expiry exists.

**Tech Stack:** TypeScript, Vitest, Node.js 22, Docusaurus, zod, GitHub Actions, Feishu report-card CLI.

---

## File map

- Modify `packages/docs-tooling/src/links/check.ts` and `check.test.ts`: classifications, HEAD/GET probing, fail-closed scan, report schema and Markdown.
- Modify `scripts/run-doc-build-stage.js` and its test: consume the new summary fields.
- Create `.github/workflows/external-link-watchdog.yml` and `scripts/external-link-watchdog-workflow.test.js`.
- Modify `scripts/validate-workflow-policy.js`, its test, `scripts/sdk-reference-workflow.test.js`, and `package.json`.
- Delete the old `check-404` workflow, scanner, baseline, summary helper, and their tests.

### Task 1: Define classifications and the report schema

**Files:**
- Modify: `packages/docs-tooling/src/links/check.ts:1-285`
- Test: `packages/docs-tooling/src/links/check.test.ts`

- [ ] **Step 1: Write failing classification tests**

```typescript
it.each([
  [200, 'healthy'], [204, 'healthy'], [301, 'healthy'], [308, 'healthy'],
  [404, 'expired'], [410, 'expired'], [401, 'blocked'], [403, 'blocked'],
  [408, 'transient'], [425, 'transient'], [429, 'transient'], [503, 'transient'],
  [400, 'other'], [409, 'other'], [451, 'other'],
] as const)('classifies HTTP %s as %s', (status, expected) => {
  expect(classifyExternalResult({status, error: null})).toBe(expected);
});

it('classifies network errors as transient', () => {
  expect(classifyExternalResult({status: null, error: 'connection reset'})).toBe('transient');
});
```

- [ ] **Step 2: Write a failing exact-report test**

Build a fixture containing one result in every class and assert this summary exactly:

```typescript
expect(report.summary).toEqual({
  deleted_routes: 1,
  added_routes: 1,
  checked_external_links: 5,
  healthy_external_links: 1,
  expired_external_links: 1,
  blocked_external_links: 1,
  transient_external_links: 1,
  other_external_links: 1,
});
expect(() => LinkCheckReportSchema.parse(report)).not.toThrow();
```

Each non-healthy entry must assert `url`, `classification`, nullable `status`, nullable bounded `error`, at most five `pages`, and the full `page_count`.

- [ ] **Step 3: Run the test and confirm the new exports are absent**

Run: `pnpm vitest run packages/docs-tooling/src/links/check.test.ts`

Expected: FAIL because `classifyExternalResult` and `LinkCheckReportSchema` do not exist and the old report exposes only `broken_external_links`.

- [ ] **Step 4: Add the exact types and classifier**

```typescript
import {z} from 'zod';

export type ExternalClassification = 'healthy' | 'expired' | 'blocked' | 'transient' | 'other';
export type ExternalObservation = {
  url: string;
  classification: ExternalClassification;
  status: number | null;
  error: string | null;
  pages: string[];
  page_count: number;
};

export function classifyExternalResult(result: {status: number | null; error: string | null}): ExternalClassification {
  if (result.error !== null) return 'transient';
  const status = result.status;
  if (status !== null && status >= 200 && status < 400) return 'healthy';
  if (status === 404 || status === 410) return 'expired';
  if (status === 401 || status === 403) return 'blocked';
  if (status !== null && ([408, 425, 429].includes(status) || status >= 500)) return 'transient';
  return 'other';
}
```

Define and export `LinkCheckReportSchema` with `schema_version: 2`, canonical timestamp, nullable 40-character lowercase `tooling_sha` and `content_sha`, nullable workflow URL, sitemap sources, the exact summary above, `deleted_routes`, `added_routes`, and separate expired/blocked/transient/other arrays. The two SHA fields must either both be null or both be valid; the standalone watchdog always supplies both, while existing publication-stage informational checks remain compatible. Use `.strict()` at every object boundary and infer `LinkCheckReport` from the schema.

- [ ] **Step 5: Replace `buildLinkCheckReport`**

The function accepts `toolingSha`, `contentSha`, `checkedExternalLinks`, and `observations`; sorts routes and every observation bucket; counts healthy results without listing them; and returns `LinkCheckReportSchema.parse({...})`.

- [ ] **Step 6: Run and commit**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
git add packages/docs-tooling/src/links/check.ts packages/docs-tooling/src/links/check.test.ts
git commit -m "refactor: classify rendered external links"
```

Expected: the new tests pass; remaining old-shape tests are migrated in Tasks 2-3.

### Task 2: Implement bounded HEAD/GET probing

**Files:**
- Modify: `packages/docs-tooling/src/links/check.ts:149-164,227-285`
- Test: `packages/docs-tooling/src/links/check.test.ts`

- [ ] **Step 1: Add controlled failing tests**

Test all of these with injected `fetch` and no real network:

- HEAD 405 then GET 200 => healthy, methods are exactly `HEAD,GET`.
- HEAD 403 then GET 403 => blocked.
- HEAD 404/410 => expired with no GET.
- HEAD 503 twice => transient after the bounded retry count.
- timeout and connection error => bounded transient error text.
- GET receives `Range: bytes=0-0`, and neither HEAD nor GET response body is read.
- duplicate URLs are probed once while all referring pages are retained.

- [ ] **Step 2: Run tests and verify HEAD-only behavior fails**

Run: `pnpm vitest run packages/docs-tooling/src/links/check.test.ts`

Expected: FAIL because the current checker never sends GET and has no retry option.

- [ ] **Step 3: Implement the bounded request helpers**

```typescript
const FALLBACK_STATUSES = new Set([401, 403, 405, 501]);
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

async function requestExternalLink(url: string, method: 'HEAD' | 'GET', fetcher: FetchLike, timeoutMs: number): Promise<FetchResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    return await fetcher(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: method === 'GET'
        ? {'Accept-Encoding': 'identity', Range: 'bytes=0-0'}
        : {'Accept-Encoding': 'identity'},
    });
  } catch (error) {
    if (timedOut) throw new Error(`request timed out after ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
```

Add `probeExternalLink(url, fetcher, timeoutMs, attempts)`. It validates `new URL(url)`, performs one HEAD and at most one fallback GET per attempt, retries only transport errors/408/425/429/5xx, permits 1-3 attempts, and returns `{status, error}` rather than throwing for a completed network observation. Sanitize errors by replacing controls/newlines, collapsing whitespace, and truncating to 240 characters.

- [ ] **Step 4: Store typed observations**

In `checkLinks`, replace `broken` with `observations`, call `probeExternalLink`, classify the result, sort all referring pages, retain five, and record the full count. Add dependency `externalLinkAttempts?: number` with default 2.

- [ ] **Step 5: Run and commit**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
git add packages/docs-tooling/src/links/check.ts packages/docs-tooling/src/links/check.test.ts
git commit -m "feat: add bounded external link probing"
```

Expected: all fallback, timeout, retry, concurrency, classification, and deduplication tests pass.

### Task 3: Fail closed and render classified Markdown

**Files:**
- Modify: `packages/docs-tooling/src/links/check.ts:66-135,184-285`
- Test: `packages/docs-tooling/src/links/check.test.ts`

- [ ] **Step 1: Add failing invariant tests**

Add four fixtures:

1. missing build directory => reject;
2. local sitemap with zero routes => reject;
3. no HTML under configured route roots => reject;
4. valid sitemap and rendered page with zero external URLs => succeed with `checked_external_links: 0`.

Also assert malformed external URLs reject as checker infrastructure failure; one supplied SHA or any invalid SHA rejects before report creation; and no SHA environment values produce a valid informational report with both identity fields null.

- [ ] **Step 2: Run tests and verify empty scans currently pass**

Run: `pnpm vitest run packages/docs-tooling/src/links/check.test.ts`

Expected: FAIL on missing/empty build invariants.

- [ ] **Step 3: Enforce meaningful enumeration**

```typescript
const local = await listUrls(localSource, options.repositoryRoot, fetcher);
if (local.length === 0) throw new Error('Local sitemap contains no documentation routes');
const routeRoots = contentRouteRoots(profile.content.map(item => item.routeBasePath));
const renderedPages = routeRoots.flatMap(routeRoot => htmlPagesUnder(options.repositoryRoot, path.posix.join(profile.outputDir, routeRoot)));
if (renderedPages.length === 0) throw new Error('No rendered HTML pages exist below the configured content route roots');
```

Pass the page list into link collection instead of silently returning an empty scan. When either `LINK_CHECKS_TOOLING_SHA` or `LINK_CHECKS_CONTENT_SHA` is supplied, require both to match `/^[0-9a-f]{40}$/`; otherwise write both report fields as null. This preserves existing calls from `run-doc-build-stage.js` while the watchdog provides immutable identities.

- [ ] **Step 4: Render stable sections**

Render summary counts, then sections in this exact order: `Confirmed Expired External URLs`, `Blocked External URLs`, `Transient External URLs`, `Other External URL Responses`, `Deleted Routes`, `Added Routes`. Each external item shows URL, HTTP/error detail, representative pages, and total page count. Include workflow URL plus tooling/content SHA in the header.

- [ ] **Step 5: Validate before atomic writes**

Parse the final object with `LinkCheckReportSchema` before `JSON.stringify`; retain `assertSafeAtomicWriteTargets` and the four-file atomic write. A report-schema or write failure must reject the command.

- [ ] **Step 6: Run and commit**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
pnpm typecheck
git add packages/docs-tooling/src/links/check.ts packages/docs-tooling/src/links/check.test.ts
git commit -m "feat: fail closed on empty rendered link scans"
```

### Task 4: Keep publication-stage report consumption compatible

**Files:**
- Modify: `scripts/run-doc-build-stage.js:37-53,96`
- Modify: `scripts/run-doc-build-stage.test.js`

- [ ] **Step 1: Add a failing helper test**

Write a temporary `latest.json` with `blocked_external_links: 1` and other counts zero; assert `linkReportHasChanges()` returns true.

- [ ] **Step 2: Make the script importable and update fields**

```javascript
return Boolean(
  summary.deleted_routes || summary.added_routes ||
  summary.expired_external_links || summary.blocked_external_links ||
  summary.transient_external_links || summary.other_external_links
)
```

Use `if (require.main === module) main()` and export `linkReportHasChanges`, `main`, and `parseArgs`.

- [ ] **Step 3: Run and commit**

```bash
node --test scripts/run-doc-build-stage.test.js
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
git add scripts/run-doc-build-stage.js scripts/run-doc-build-stage.test.js
git commit -m "test: align build reports with link classifications"
```

### Task 5: Add the standalone watchdog workflow

**Files:**
- Create: `.github/workflows/external-link-watchdog.yml`
- Create: `scripts/external-link-watchdog-workflow.test.js`

- [ ] **Step 1: Write a failing workflow test**

Parse the workflow with `js-yaml` and assert:

- schedule is exactly `0 1 * * *`, plus `workflow_dispatch`, with no push/PR;
- permissions are exactly `actions: read` and `contents: read`;
- concurrency group is `external-link-watchdog`, `cancel-in-progress: false`;
- checkout uses `${{ github.sha }}`, dev is fetched and resolved to a SHA;
- `restore-generated-state.sh --exact`, `pnpm build:en`, and `pnpm docs-tooling check-links --site en` occur in order;
- report upload uses `if-no-files-found: error`;
- card condition is only `steps.scan.outputs.expired_count != '0'`;
- finish receives message ID, start time, stages, title, and `--status fail`;
- no cache, baseline, acknowledgement, suppression, old scanner, or `continue-on-error` on the scan.

- [ ] **Step 2: Run and confirm the workflow is missing**

Run: `node --test scripts/external-link-watchdog-workflow.test.js`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Create the workflow with exact data flow**

Implement these steps:

```yaml
on:
  schedule:
    - cron: '0 1 * * *'
  workflow_dispatch:

permissions:
  actions: read
  contents: read

concurrency:
  group: external-link-watchdog
  cancel-in-progress: false
```

The single job must:

1. checkout `${{ github.sha }}` with full history;
2. set `tooling_sha=$(git rev-parse HEAD)`, fetch `refs/heads/dev`, and set `content_sha=$(git rev-parse FETCH_HEAD)`;
3. install locked dependencies on Node 22.6;
4. run `bash scripts/restore-generated-state.sh --exact --ref "$CONTENT_SHA"`;
5. run `pnpm build:en` then the canonical checker with both SHA environment values;
6. read `latest.json` and append ``expired_count=${report.summary.expired_external_links}`` to `GITHUB_OUTPUT` after asserting it is a safe integer;
7. upload `tmp/external-link-watchdog` as `external-link-watchdog-${{ github.run_id }}` with 14-day retention;
8. when `expired_count != '0'`, build a bounded alert note containing count, ten URLs, two pages per URL, run URL, both SHAs, and `${{ steps.report_artifact.outputs.artifact-url }}`;
9. create/note/finish an `External Link Watchdog` card with every Feishu step `continue-on-error: true` and explicit finish arguments.

Do not add a preserve step: the scan/build/upload naturally fail infrastructure errors, while expiry remains a successful checker result.

- [ ] **Step 4: Run and commit**

```bash
node --test scripts/external-link-watchdog-workflow.test.js
git add .github/workflows/external-link-watchdog.yml scripts/external-link-watchdog-workflow.test.js
git commit -m "feat: add rendered external link watchdog"
```

### Task 6: Retire the stale scanner and enforce policy

**Files:**
- Delete: `.github/workflows/check-404.yml`
- Delete: `scripts/check-404.js`
- Delete: `scripts/check-404.test.js`
- Delete: `scripts/check-404-workflow.test.js`
- Delete: `scripts/external-link-report-summary.js`
- Delete: `scripts/external-link-report-summary.test.js`
- Delete: `config/link-check-baseline.json`
- Modify: `package.json`, `scripts/sdk-reference-workflow.test.js`, `scripts/validate-workflow-policy.js`, `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add policy tests first**

Require the workflow boundary from Task 5 and add mutation cases for a PR trigger, old scanner command, `actions/cache`, `cancel-in-progress: true`, card-on-blocked condition, and scan `continue-on-error`.

- [ ] **Step 2: Remove retired files and commands**

Remove package scripts `check:external-links`, `test:check-404`, and `test:external-link-report`; add `test:external-link-watchdog`. Replace `check-404.yml` with `external-link-watchdog.yml` in active-workflow and Node-runtime assertions.

- [ ] **Step 3: Prove no active old reference remains**

```bash
rg -n "check-404|external-link-report-summary|link-check-baseline" .github scripts package.json config
```

Expected: no matches.

- [ ] **Step 4: Run and commit**

```bash
node --test scripts/external-link-watchdog-workflow.test.js scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
pnpm typecheck
git add .github/workflows package.json scripts config/link-check-baseline.json
git commit -m "chore: retire stale markdown link checker"
```

### Task 7: Validate exact dev content and real network behavior

- [ ] **Step 1: Run focused gates**

```bash
pnpm vitest run packages/docs-tooling/src/links/check.test.ts
node --test scripts/run-doc-build-stage.test.js scripts/external-link-watchdog-workflow.test.js scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
pnpm typecheck
node scripts/validate-workflow-policy.js
```

- [ ] **Step 2: Materialize exact current dev and scan**

```bash
TOOLING_SHA="$(git rev-parse HEAD)"
git fetch --no-tags origin refs/heads/dev
CONTENT_SHA="$(git rev-parse FETCH_HEAD)"
bash scripts/restore-generated-state.sh --exact --ref "$CONTENT_SHA"
pnpm build:en
LINK_CHECKS_TOOLING_SHA="$TOOLING_SHA" \
LINK_CHECKS_CONTENT_SHA="$CONTENT_SHA" \
LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com \
pnpm docs-tooling check-links --site en --output tmp/external-link-watchdog-validation/latest.md
node -e "const r=require('./tmp/external-link-watchdog-validation/latest.json');if(r.summary.checked_external_links<1)throw new Error('empty real scan');console.log(r.summary)"
```

Expected: build/check exit zero, the real scan checks at least one URL, and 404/410 appear only in the expiry bucket.

## Validation boundary

This standalone watchdog does not change checkpoint production, publication ordering, localization, source barriers, or card collection in `fetch-docs.yml`. Task 7's exact `dev` materialization, English build, real-network scan, workflow contract tests, and workflow-policy tests are the complete pre-submission gate. Do not dispatch `fetch-docs.yml`, download checkpoint artifacts, create a local publication remote, or exercise publication lanes for this change.

### Task 8: Submit and verify online

- [ ] **Step 1: Check repository hygiene**

```bash
git diff --check
git status --short
git log --oneline -8
```

Expected: only planned files are committed; unrelated user-owned `.claude/` files are untouched.

- [ ] **Step 2: Dispatch and live-monitor after merge**

```bash
gh workflow run external-link-watchdog.yml --ref master
WATCHDOG_RUN_ID="$(gh run list --workflow external-link-watchdog.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$WATCHDOG_RUN_ID" --exit-status
gh run view "$WATCHDOG_RUN_ID" --json status,conclusion,jobs,artifacts,url
```

- [ ] **Step 3: Verify alert semantics**

Prove: clean and blocked/transient-only scans send no card; a controlled 404/410 sends one failure-presented card while the workflow succeeds; a second identical scan sends a second card; Feishu failure does not change the scan conclusion.

- [ ] **Step 4: Self-review**

```bash
rg -n "TBD|TODO|implement later|similar to|appropriate error handling|check-404|external-link-report-summary|link-check-baseline" .claude/plans/2026-08-04-external-link-watchdog-implementation.md .github scripts package.json config
```

Expected: only this self-review command contains those terms; all types and field names match Tasks 1-6.
