# Guides Translation Candidate Reasons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate idempotent translation-batch publication and make every Guides translation candidate explicitly report whether it is a current English change, a missing Japanese target, or a stale translation.

**Architecture:** Keep `.translation-cache/ja-JP.json` as the per-file completion record and retain full owned-tree reconciliation. Classify each pending manifest item before deterministic sorting and batching, carry the reason through translation reports, expose global reason counts from the prepare workflow, and add the counts to the aggregate Markdown consumed by the final Feishu card. Merge the existing idempotent-publication branch so repeated batch deletions become safe no-ops.

**Tech Stack:** Node.js CommonJS scripts, `node:test` and `node:assert`, Git/GitHub Actions YAML, pnpm/TypeScript validation.

---

## File Structure

- `scripts/translation/manifest.js`: decide whether a source requires translation and assign its canonical candidate reason.
- `scripts/translation/manifest.test.js`: cover reason precedence, exclusions, deterministic order, and retry/cache behavior.
- `scripts/translation/batches.js`: include reasons in pending-set identity and compute global counts by reason.
- `scripts/translation/batches.test.js`: verify count totals, identity changes, and reason preservation across batch selection.
- `scripts/translation/reportSummary.js`: render per-batch reason counts in archived translation reports.
- `scripts/translation/reportSummary.test.js`: verify human-readable candidate wording and failure retention.
- `.github/workflows/_prepare-translation-batches.yml`: expose global candidate counts as a reusable-workflow output and log the breakdown.
- `.github/workflows/fetch-docs.yml`: pass the Guides candidate counts into terminal aggregation.
- `scripts/docs-workflow/build-aggregate-input.js`: parse the workflow output into a typed optional Guides result field.
- `scripts/docs-workflow/build-aggregate-input.test.js`: test valid, absent, and malformed candidate-count input.
- `scripts/docs-workflow/aggregate-results.js`: validate and render the optional candidate breakdown used by the Feishu card.
- `scripts/docs-workflow/aggregate-results.test.js`: test schema validation and exact Markdown wording.
- `scripts/translation/workflowReporting.test.js`: enforce candidate-count output and aggregation wiring.
- `scripts/validate-workflow-policy.js`: require idempotent staging and candidate reporting in reusable workflows.
- `scripts/validate-workflow-policy.test.js`: regression-test the policy requirements.
- `scripts/docs-workflow/checkpoint-stage-paths.js`, its tests, and publisher files: arrive from `origin/fix/idempotent-batch-publication` and implement repeated-deletion safety.

### Task 1: Integrate the Existing Idempotent-Publication Fix

**Files:**
- Merge: `origin/fix/idempotent-batch-publication`
- Verify: `scripts/docs-workflow/checkpoint-stage-paths.js`
- Verify: `scripts/docs-workflow/checkpoint-stage-paths.test.js`
- Verify: `scripts/docs-workflow/publish-checkpoint.sh`
- Verify: `scripts/docs-workflow/publish-checkpoint.test.js`
- Verify: `scripts/validate-workflow-policy.js`
- Verify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Confirm the three intended commits and clean worktree**

Run:

```bash
git status --short
git log --oneline origin/master..origin/fix/idempotent-batch-publication
```

Expected: the worktree is clean and the branch contains `d213b70c5`, `d54def567`, and `93b3989f3` only.

- [ ] **Step 2: Merge the branch into the combined feature branch**

Run:

```bash
git merge --no-ff origin/fix/idempotent-batch-publication -m "merge: integrate idempotent batch publication"
```

Expected: a merge commit is created. Resolve conflicts only by retaining both the existing Guides cache/card-report requirements and the incoming scoped-staging requirements.

- [ ] **Step 3: Run the incoming focused regression tests**

Run:

```bash
node --test scripts/docs-workflow/checkpoint-stage-paths.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/validate-workflow-policy.test.js
```

Expected: all tests pass, including repeated deletion, literal pathspec, staged-scope, and workflow-policy cases.

- [ ] **Step 4: Verify the merge commit content**

Run:

```bash
git show --stat --oneline HEAD
git status --short
```

Expected: the merge contains the idempotent staging helper and tests, and the worktree is clean.

### Task 2: Classify Translation Candidates in the Manifest

**Files:**
- Modify: `scripts/translation/manifest.test.js`
- Modify: `scripts/translation/manifest.js`

- [ ] **Step 1: Write failing classification and ordering tests**

Extend `scripts/translation/manifest.test.js` with a fixture containing:

```js
const current = 'docs/tutorials/current.md'
const missing = 'docs/tutorials/missing.md'
const stale = 'docs/tutorials/stale.md'
const complete = 'docs/tutorials/complete.md'

for (const sourcePath of [current, missing, stale, complete]) {
  write(path.join(siteDir, sourcePath), `# ${sourcePath}\n`)
}
for (const sourcePath of [current, stale, complete]) {
  const targetPath = sourcePath.replace(
    'docs/tutorials/',
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/',
  )
  write(path.join(siteDir, targetPath), '# Japanese\n')
}
writeCache(siteDir, 'ja-JP', {
  files: {
    [current]: { sourceHash: 'old' },
    [stale]: { sourceHash: 'old' },
    [complete]: { sourceHash: hashContent(`# ${complete}\n`) },
  },
})

const manifest = buildManifest({
  siteDir,
  group: 'guides',
  sourceCheckpointSha: 'c'.repeat(40),
  sourceDelta: { changedEnglish: [current], deletedI18n: [], renamed: [] },
})

assert.deepEqual(
  manifest.items.map(({ sourcePath, reason }) => ({ sourcePath, reason })),
  [
    { sourcePath: current, reason: 'current_delta' },
    { sourcePath: missing, reason: 'missing_target' },
    { sourcePath: stale, reason: 'stale_source' },
  ],
)
```

Also assert that a current-delta source with a missing target receives `current_delta`, proving precedence.

- [ ] **Step 2: Run the manifest test and verify RED**

Run:

```bash
node scripts/translation/manifest.test.js
```

Expected: FAIL because manifest items do not yet contain `reason` and missing/stale items are currently ordered only by path.

- [ ] **Step 3: Implement minimal reason classification**

In `scripts/translation/manifest.js`, define:

```js
const CANDIDATE_REASON_ORDER = Object.freeze({
  current_delta: 0,
  missing_target: 1,
  stale_source: 2,
})

function candidateReason({ changedEnglish, sourcePath, targetExists }) {
  if (changedEnglish?.has(sourcePath)) return 'current_delta'
  if (!targetExists) return 'missing_target'
  return 'stale_source'
}
```

Keep the existing completion guard unchanged:

```js
if (targetExists && cached?.sourceHash === sourceHash) continue
```

Add the reason to each candidate:

```js
items.push({
  sourcePath,
  targetPath,
  sourceHash,
  locale,
  type: mapping.type,
  reason: candidateReason({ changedEnglish, sourcePath, targetExists }),
})
```

Replace current-delta-only sorting with deterministic reason sorting:

```js
items.sort((a, b) => (
  CANDIDATE_REASON_ORDER[a.reason] - CANDIDATE_REASON_ORDER[b.reason] ||
  a.sourcePath.localeCompare(b.sourcePath)
))
```

Export `CANDIDATE_REASON_ORDER` and `candidateReason` for focused validation.

- [ ] **Step 4: Run manifest tests and verify GREEN**

Run:

```bash
node scripts/translation/manifest.test.js
```

Expected: `translation manifest tests passed`.

- [ ] **Step 5: Commit manifest classification**

Run:

```bash
git add scripts/translation/manifest.js scripts/translation/manifest.test.js
git commit -m "feat(i18n): classify translation candidates"
```

### Task 3: Add Reason Counts and Durable Batch Identity

**Files:**
- Modify: `scripts/translation/batches.test.js`
- Modify: `scripts/translation/batches.js`

- [ ] **Step 1: Update fixtures and write failing count/identity tests**

Give every item produced by the `manifest()` fixture a deterministic reason:

```js
reason: index < 15 ? 'current_delta' : index < 33 ? 'missing_target' : 'stale_source',
```

Add assertions:

```js
assert.deepEqual(summary.candidateCounts, {
  total: 65,
  current_delta: 15,
  missing_target: 18,
  stale_source: 32,
})
```

Add an identity test that clones one manifest item, changes only `reason`, and expects different `pendingSetSha256` values. Assert selected batch items retain their original reasons.

- [ ] **Step 2: Run batch tests and verify RED**

Run:

```bash
node --test scripts/translation/batches.test.js
```

Expected: FAIL because `candidateCounts` is absent and `reason` is not part of canonical pending identity.

- [ ] **Step 3: Implement strict count calculation and identity inclusion**

In `scripts/translation/batches.js`, add:

```js
const CANDIDATE_REASONS = Object.freeze(['current_delta', 'missing_target', 'stale_source'])

function countCandidateReasons(manifest) {
  assertManifest(manifest)
  const counts = { total: manifest.items.length, current_delta: 0, missing_target: 0, stale_source: 0 }
  for (const item of manifest.items) {
    if (!CANDIDATE_REASONS.includes(item.reason)) throw new Error(`Unknown translation candidate reason: ${item.reason}`)
    counts[item.reason] += 1
  }
  return counts
}
```

Include `reason` in `canonicalPendingItems()`:

```js
reason: item.reason,
```

Return counts from `createBatchSummary()`:

```js
candidateCounts: countCandidateReasons(manifest),
```

Export `countCandidateReasons` and update all test manifests passed to `createBatchSummary()` so every item has a valid reason.

- [ ] **Step 4: Run batch tests and verify GREEN**

Run:

```bash
node --test scripts/translation/batches.test.js
```

Expected: all batch tests pass.

- [ ] **Step 5: Commit reason counts and identity**

Run:

```bash
git add scripts/translation/batches.js scripts/translation/batches.test.js
git commit -m "feat(i18n): count durable candidate reasons"
```

### Task 4: Report Candidate Reasons in Batch Artifacts and Workflow Outputs

**Files:**
- Modify: `scripts/translation/reportSummary.test.js`
- Modify: `scripts/translation/reportSummary.js`
- Modify: `scripts/translation/workflowReporting.test.js`
- Modify: `.github/workflows/_prepare-translation-batches.yml`

- [ ] **Step 1: Write failing report-summary tests**

Change the main report fixture to use:

```js
items: [
  { reason: 'current_delta' },
  { reason: 'missing_target' },
  { reason: 'stale_source' },
],
```

Assert:

```js
assert.match(summary, /Current English changes: 1/)
assert.match(summary, /Missing Japanese targets: 1/)
assert.match(summary, /Stale translations: 1/)
```

Update empty fixtures to remain valid with `items: []`.

- [ ] **Step 2: Write failing reusable-workflow wiring tests**

In `scripts/translation/workflowReporting.test.js`, read `_prepare-translation-batches.yml` and require:

```js
assert.match(prepare, /^      candidate_counts:/m)
assert.match(prepare, /candidate_counts: JSON\.stringify\(summary\.candidateCounts\)/)
assert.match(prepare, /translation candidates: total=/)
```

- [ ] **Step 3: Run tests and verify RED**

Run:

```bash
node --test scripts/translation/reportSummary.test.js scripts/translation/workflowReporting.test.js
```

Expected: FAIL because reason lines and workflow outputs are absent.

- [ ] **Step 4: Render per-batch reason counts**

Import `countCandidateReasons` in `reportSummary.js` and add these lines after `Pending`:

```js
const candidateCounts = countCandidateReasons(manifest || { items: [] })
// ...
`- Current English changes: ${candidateCounts.current_delta}`,
`- Missing Japanese targets: ${candidateCounts.missing_target}`,
`- Stale translations: ${candidateCounts.stale_source}`,
```

Change the empty message to:

```text
No documents require translation or translation-state reconciliation.
```

- [ ] **Step 5: Expose global candidate counts from the prepare workflow**

Add reusable and job outputs in `_prepare-translation-batches.yml`:

```yaml
candidate_counts: { value: '${{ jobs.prepare.outputs.candidate_counts }}' }
```

and:

```yaml
candidate_counts: ${{ steps.summary.outputs.candidate_counts }}
```

Add to the `lines` object:

```js
candidate_counts: JSON.stringify(summary.candidateCounts),
```

Log the exact global breakdown before writing outputs:

```js
console.log(`translation candidates: total=${summary.candidateCounts.total} current_delta=${summary.candidateCounts.current_delta} missing_target=${summary.candidateCounts.missing_target} stale_source=${summary.candidateCounts.stale_source}`)
```

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
node --test scripts/translation/reportSummary.test.js scripts/translation/workflowReporting.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit report and workflow outputs**

Run:

```bash
git add scripts/translation/reportSummary.js scripts/translation/reportSummary.test.js scripts/translation/workflowReporting.test.js .github/workflows/_prepare-translation-batches.yml
git commit -m "feat(ci): report translation candidate reasons"
```

### Task 5: Add Candidate Counts to the Aggregate Summary and Feishu Card

**Files:**
- Modify: `scripts/docs-workflow/build-aggregate-input.test.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/translation/workflowReporting.test.js`

- [ ] **Step 1: Write failing aggregate-input tests**

Add `GUIDES_TRANSLATION_CANDIDATES` to a Guides fixture:

```js
GUIDES_TRANSLATION_CANDIDATES: JSON.stringify({
  total: 163,
  current_delta: 15,
  missing_target: 18,
  stale_source: 130,
}),
```

Expect the Guides entry to contain:

```js
translationCandidates: {
  total: 163,
  current_delta: 15,
  missing_target: 18,
  stale_source: 130,
},
```

Add malformed JSON and negative-count cases that must throw with a `translation candidates` error.

- [ ] **Step 2: Write failing aggregate-rendering and schema tests**

Add the same `translationCandidates` object to the Guides entry in `payload()` and assert:

```js
assert.match(result.markdown, /Guides translation candidates: 163 total/)
assert.match(result.markdown, /15 current English changes/)
assert.match(result.markdown, /18 missing Japanese targets/)
assert.match(result.markdown, /130 stale translations/)
```

Add invalid payloads where counts are negative, non-integers, contain unknown keys, or do not sum to `total`; all must fail schema validation.

- [ ] **Step 3: Write failing workflow propagation tests**

Require `fetch-docs.yml` to pass:

```yaml
GUIDES_TRANSLATION_CANDIDATES: ${{ needs.prepare_guides_translation_batches.outputs.candidate_counts }}
```

from the aggregate job environment.

- [ ] **Step 4: Run tests and verify RED**

Run:

```bash
node --test scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js scripts/translation/workflowReporting.test.js
```

Expected: FAIL because aggregate input rejects the new field and the workflow does not propagate it.

- [ ] **Step 5: Parse and validate candidate counts at the workflow boundary**

In `build-aggregate-input.js`, add:

```js
const CANDIDATE_COUNT_KEYS = ['total', 'current_delta', 'missing_target', 'stale_source']

function parseCandidateCounts(value) {
  if (!value) return undefined
  let parsed
  try { parsed = JSON.parse(value) } catch { throw new Error('Invalid translation candidates JSON') }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid translation candidates object')
  if (Object.keys(parsed).length !== CANDIDATE_COUNT_KEYS.length || CANDIDATE_COUNT_KEYS.some(key => !Number.isSafeInteger(parsed[key]) || parsed[key] < 0)) {
    throw new Error('Invalid translation candidates counts')
  }
  if (parsed.total !== parsed.current_delta + parsed.missing_target + parsed.stale_source) throw new Error('Invalid translation candidates total')
  return parsed
}
```

For Guides only, attach the parsed value when present:

```js
if (group === 'guides') {
  const translationCandidates = parseCandidateCounts(env.GUIDES_TRANSLATION_CANDIDATES)
  if (translationCandidates) entry.translationCandidates = translationCandidates
}
```

Export `parseCandidateCounts` for direct tests.

- [ ] **Step 6: Validate and render the optional aggregate field**

Add `translationCandidates` to `ENTRY_KEYS`. Validate its exact keys, safe nonnegative integer values, and total sum. After the result table, append when present:

```js
const candidates = input.groups.guides?.translationCandidates
if (candidates) {
  details.push(
    `Guides translation candidates: ${candidates.total} total — ` +
    `${candidates.current_delta} current English changes, ` +
    `${candidates.missing_target} missing Japanese targets, ` +
    `${candidates.stale_source} stale translations.`,
  )
}
```

Insert `details` before `Final verification`. Because aggregate Markdown is already exported through `notes_json` and used to create `docs-card-report`, no separate Feishu API call or card schema is needed.

- [ ] **Step 7: Wire the reusable-workflow output into aggregation**

In the aggregate job environment in `fetch-docs.yml`, add:

```yaml
GUIDES_TRANSLATION_CANDIDATES: ${{ needs.prepare_guides_translation_batches.outputs.candidate_counts }}
```

- [ ] **Step 8: Run focused tests and verify GREEN**

Run:

```bash
node --test scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js scripts/translation/workflowReporting.test.js
```

Expected: all tests pass and aggregate Markdown contains the candidate breakdown.

- [ ] **Step 9: Commit aggregate/card reporting**

Run:

```bash
git add scripts/docs-workflow/build-aggregate-input.js scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js scripts/translation/workflowReporting.test.js .github/workflows/fetch-docs.yml
git commit -m "feat(ci): surface translation reasons in workflow cards"
```

### Task 6: Enforce Workflow Policy and Run Full Verification

**Files:**
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Verify: all files changed by Tasks 1-5

- [ ] **Step 1: Write a failing workflow-policy regression**

Require the policy validator to reject workflows missing any of:

```text
candidate_counts
summary.candidateCounts
GUIDES_TRANSLATION_CANDIDATES
checkpoint-stage-paths.js select
checkpoint-stage-paths.js verify
```

Follow the existing mutation-based policy-test pattern: load each workflow as text, remove one required token at a time, and assert the validator reports the corresponding policy error.

- [ ] **Step 2: Run policy tests and verify RED**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because candidate-count wiring is not yet enforced.

- [ ] **Step 3: Add the minimum validator requirements**

Extend the existing workflow requirement arrays in `validate-workflow-policy.js` with regex/message pairs for:

```js
[/candidate_counts/, 'must expose translation candidate counts'],
[/summary\.candidateCounts/, 'must emit classified translation candidate counts'],
[/GUIDES_TRANSLATION_CANDIDATES/, 'must pass Guides candidate counts to aggregation'],
```

Keep the incoming idempotent-publication requirements for both `checkpoint-stage-paths.js select` and `checkpoint-stage-paths.js verify`.

- [ ] **Step 4: Run policy tests and verify GREEN**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: tests pass and the validator prints its success message.

- [ ] **Step 5: Run focused translation and publisher suites**

Run:

```bash
pnpm run test:translation
node --test scripts/translation/batches.test.js scripts/docs-workflow/checkpoint-stage-paths.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js
```

Expected: all focused tests pass.

- [ ] **Step 6: Run the complete docs-workflow regression suite**

Run:

```bash
node --test scripts/docs-workflow/*.test.js scripts/translation/batches.test.js scripts/translation/chunker.test.js scripts/translation/reportSummary.test.js scripts/translation/workflowReporting.test.js scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: all tests pass with zero failures.

- [ ] **Step 7: Run static and repository checks**

Run:

```bash
pnpm run typecheck
git diff --check master...HEAD
git status --short
```

Expected: type checking succeeds, no whitespace errors are reported, and only intentional uncommitted plan-checkbox updates exist.

- [ ] **Step 8: Commit policy enforcement**

Run:

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test(ci): enforce translation candidate reporting"
```

- [ ] **Step 9: Record final verification evidence**

Run:

```bash
git log --oneline --decorate master..HEAD
git status --short --branch
```

Expected: the combined feature branch contains the earlier Guides cache/card-report fixes, the idempotent publication merge, candidate-reason commits, and a clean worktree.
