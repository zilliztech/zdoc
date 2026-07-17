# Guides Media Generations and Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Guides media-cache recovery durable across identical runs and report exactly how every final media reference was obtained.

**Architecture:** Keep source and media validity independent. Restore a v4 candidate into an isolated payload, validate it before promotion, retain exact v3/v2/v1 fallbacks, rebuild complete canonical media coverage when media is invalid, and save repaired or migrated state under a unique immutable generation. Produce strict run reports consumed by the existing centralized card pipeline.

**Tech Stack:** Node.js CommonJS, Node test runner, GitHub Actions YAML, `actions/cache@v4`, existing Guides checkpoint/report infrastructure.

**Prerequisite:** Approved design at `.claude/specs/2026-07-17-guides-pipeline-reuse-staging-and-reporting-design.md`.

---

## File structure

- Create `scripts/docs-workflow/guides-source-cache-generation.js`: v4 key generation, isolated payload creation/validation/promotion, and CLI.
- Create `scripts/docs-workflow/guides-source-cache-generation.test.js`: payload safety, key, and round-trip tests.
- Modify `scripts/docs-workflow/guides-source-cache.js`: retain legacy validation and expose v4-compatible canonical snapshot hash behavior.
- Modify `scripts/docs-workflow/guides-source-cache.test.js`: v4 key migration tests.
- Modify `scripts/docs-workflow/guides-media-prefetch.js`: provenance-aware final inventory, pruning, metrics, and report output.
- Modify `scripts/docs-workflow/guides-media-prefetch.test.js`: disposition reconciliation and stale-entry tests.
- Modify `scripts/docs-workflow/guides-stage-artifact.js`: carry the media report through the source artifact.
- Modify `scripts/docs-workflow/guides-stage-artifact.test.js`: require and validate the media report.
- Modify `.github/workflows/_fetch-guides-sources.yml`: isolated v4 restore, validated legacy fallbacks, full recovery, and outputs.
- Modify `.github/workflows/_assemble-guides.yml`: create/save v4 payload after combined validation and record persistence outcome.
- Modify `.github/workflows/fetch-docs.yml`: pass cache persistence outputs only if reusable-workflow wiring requires them.
- Modify `scripts/collect-build-card-notes.js`: render bounded media/cache terminal notes.
- Modify `scripts/collect-build-card-notes.test.js`: fresh/missing/invalid report cases.
- Modify `scripts/docs-workflow/docs-progress-state.js`: normalize the exact media/cache workflow steps.
- Modify `scripts/docs-workflow/docs-progress-state.test.js`: live task labels.
- Modify `scripts/validate-workflow-policy.js` and `.test.js`: lock in the single safe restore prefix and validation order.

### Task 1: Add provenance-aware media inventory and metrics

**Files:**
- Modify: `scripts/docs-workflow/guides-media-prefetch.js`
- Test: `scripts/docs-workflow/guides-media-prefetch.test.js`

- [ ] **Step 1: Write failing reconciliation tests**

Add tests that call `prefetchGuidesMedia()` with a canonical source set larger than the selected incremental set. Assert the returned shape and exact equation:

```js
const result = await prefetchGuidesMedia({
  sourceDir,
  output,
  reportPath,
  downloader,
  sourceFiles: ['changed.json'],
  canonicalSourceFiles: ['changed.json', 'unchanged.json'],
  previousManifestPath: previous,
})

assert.deepEqual(result.metrics, {
  canonicalReferencesRequired: 2,
  selectedReferences: 1,
  resolvedByNetwork: 1,
  validatedManifestReuse: 1,
  committedDocsReconstruction: 0,
  staleEntriesDropped: 1,
  finalManifestEntries: 2,
})
assert.equal(
  result.metrics.finalManifestEntries,
  result.metrics.validatedManifestReuse +
    result.metrics.committedDocsReconstruction +
    result.metrics.resolvedByNetwork,
)
```

Also add cases for full recovery from committed Markdown, no network work on a valid empty delta, and a stale previous entry absent from the canonical final manifest.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/guides-media-prefetch.test.js
```

Expected: FAIL because `canonicalSourceFiles`, metrics, pruning, and `reportPath` are not implemented.

- [ ] **Step 3: Implement disjoint provenance accounting**

Refactor the reusable-entry construction so every canonical ID receives exactly one final provenance. Add these helpers and exports:

```js
function validateMediaPrefetchMetrics(metrics) {
  const keys = [
    'canonicalReferencesRequired', 'selectedReferences', 'resolvedByNetwork',
    'validatedManifestReuse', 'committedDocsReconstruction',
    'staleEntriesDropped', 'finalManifestEntries',
  ]
  if (!metrics || Object.keys(metrics).sort().join('\n') !== [...keys].sort().join('\n')) {
    throw new Error('Invalid Guides media prefetch metrics keys')
  }
  for (const key of keys) {
    if (!Number.isSafeInteger(metrics[key]) || metrics[key] < 0) {
      throw new Error(`Invalid Guides media prefetch metric: ${key}`)
    }
  }
  if (metrics.finalManifestEntries !== metrics.canonicalReferencesRequired) {
    throw new Error('Guides media final inventory does not match canonical coverage')
  }
  if (metrics.finalManifestEntries !== metrics.validatedManifestReuse + metrics.committedDocsReconstruction + metrics.resolvedByNetwork) {
    throw new Error('Guides media provenance counters do not reconcile')
  }
  return metrics
}
```

Use separate maps for validated-manifest and committed-doc candidates. Build the final manifest only from `collectMediaReferences(sourceDir, canonicalSourceFiles)`. Selected references may resolve over the network; unselected references must come from a validated prior manifest or committed-doc reconstruction. Do not copy unrelated prior entries into the final map.

- [ ] **Step 4: Write and validate the run report**

Add `writeMediaPrefetchReport(reportPath, value)` with schema:

```js
{
  schemaVersion: 1,
  generated_at: new Date().toISOString(),
  mode: 'incremental' | 'recovery',
  cacheState: 'valid' | 'invalid' | 'missing' | 'legacy',
  metrics: validateMediaPrefetchMetrics(metrics),
}
```

The CLI must require `--report`, `--mode <incremental|recovery>`, and `--cache-state <valid|invalid|missing|legacy>`, pass the complete snapshot-derived source list as `canonicalSourceFiles`, and log separate counters rather than manifest length as “prefetched.”

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test scripts/docs-workflow/guides-media-prefetch.test.js
node --check scripts/docs-workflow/guides-media-prefetch.js
```

Expected: all tests PASS.

Commit:

```bash
git add scripts/docs-workflow/guides-media-prefetch.js scripts/docs-workflow/guides-media-prefetch.test.js
git commit -m "feat(ci): report guides media cache disposition"
```

### Task 2: Carry the required media report through the source artifact

**Files:**
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Test: `scripts/docs-workflow/guides-stage-artifact.test.js`

- [ ] **Step 1: Add a failing required-report test**

Extend the source fixture with:

```js
json(workspace, 'plugins/lark-docs/meta/reports/guides-media-prefetch.json', {
  schemaVersion: 1,
  generated_at: '2026-07-17T00:00:00.000Z',
  mode: 'recovery',
  cacheState: 'invalid',
  metrics: {
    canonicalReferencesRequired: 1,
    selectedReferences: 1,
    resolvedByNetwork: 1,
    validatedManifestReuse: 0,
    committedDocsReconstruction: 0,
    staleEntriesDropped: 0,
    finalManifestEntries: 1,
  },
})
```

Assert source artifact creation fails when this file is missing or has non-reconciling counters.

- [ ] **Step 2: Run the test and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/guides-stage-artifact.test.js
```

Expected: FAIL because the report is not in the source-stage contract.

- [ ] **Step 3: Add fixed allowlist and semantic validation**

Add `plugins/lark-docs/meta/reports/guides-media-prefetch.json` to `STAGE_PATHS.source` and `REQUIRED_STAGE_FILES.source`. Import `validateMediaPrefetchMetrics` and validate the exact report schema during source creation and artifact validation; a checksum alone is not sufficient.

- [ ] **Step 4: Re-run and commit**

Run:

```bash
node --test scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/guides-media-prefetch.test.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/guides-stage-artifact.js scripts/docs-workflow/guides-stage-artifact.test.js
git commit -m "feat(ci): require guides media disposition report"
```

### Task 3: Add the isolated v4 cache-generation helper

**Files:**
- Create: `scripts/docs-workflow/guides-source-cache-generation.js`
- Create: `scripts/docs-workflow/guides-source-cache-generation.test.js`
- Modify: `scripts/docs-workflow/guides-source-cache.js`
- Test: `scripts/docs-workflow/guides-source-cache.test.js`

- [ ] **Step 1: Write failing key and payload tests**

Cover canonical snapshot hashing, bounded run identity, cross-snapshot isolation, rejected payload non-mutation, symlink rejection, stale live-file removal, and create→validate→promote round trip. The key assertion is:

```js
assert.deepEqual(generationKeys({ snapshotPath, runId: 42, runAttempt: 3 }), {
  prefix: `guides-source-v4-${hashSnapshot(snapshot)}-`,
  lookupKey: `guides-source-v4-${hashSnapshot(snapshot)}-lookup-42-3`,
  saveKey: `guides-source-v4-${hashSnapshot(snapshot)}-42-3`,
})
```

- [ ] **Step 2: Run tests and confirm missing module failure**

Run:

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.test.js
```

Expected: FAIL because the generation module and v4 contract do not exist.

- [ ] **Step 3: Implement fixed-layout generation functions**

Export exactly:

```js
module.exports = {
  createGenerationPayload,
  generationKeys,
  promoteGenerationPayload,
  validateGenerationPayload,
}
```

Use only these payload children:

```js
const PAYLOAD_PATHS = Object.freeze({
  sources: 'sources',
  sourceManifest: 'source-manifest.json',
  mediaManifest: 'media-manifest.json',
})
```

`validateGenerationPayload()` delegates source completeness and media coverage to the existing `validateSourceCache()` and `validateMediaCache()`. `createGenerationPayload()` builds in a sibling temporary directory, validates it, then renames it to the requested output. `promoteGenerationPayload()` validates first, journals the three live paths, installs only regular files, and rolls back byte-for-byte on failure.

- [ ] **Step 4: Add CLI operations**

Support:

```text
keys --snapshot <file> --run-id <id> --run-attempt <attempt>
validate --payload <dir> --snapshot <file> --root-token <token>
promote --payload <dir> --workspace <dir> --snapshot <file> --root-token <token>
create --workspace <dir> --output <dir> --snapshot <file> --root-token <token>
```

`keys` writes one compact JSON object. Unknown, duplicate, missing, unsafe, or out-of-range arguments fail closed.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.test.js
node --check scripts/docs-workflow/guides-source-cache-generation.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/guides-source-cache.js scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.js scripts/docs-workflow/guides-source-cache-generation.test.js
git commit -m "feat(ci): add guides cache generations"
```

### Task 4: Wire validated v4 restore and clean legacy fallback

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow policy assertions**

Require this order and naming:

```text
Compute Guides cache generation keys
Restore Guides v4 cache candidate
Validate and promote Guides v4 cache candidate
Restore Guides v3 cache candidate
Validate Guides v3 cache candidate
Restore Guides v2 cache candidate
Validate Guides v2 cache candidate
Restore Guides v1 cache candidate
Validate Guides v1 cache candidate
```

Assert exactly one `restore-keys:` exists and matches the full snapshot-scoped v4 prefix. Assert every legacy restore is conditioned on the preceding `source_valid != 'true'`, not on `cache-hit`. Assert rejected candidates are completely removed before the next restore.

- [ ] **Step 2: Run policy tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL against the current exact-hit v3→v2→v1 flow.

- [ ] **Step 3: Rewrite source cache restore orchestration**

Use the v4 lookup key as `key`, the exact snapshot prefix as the sole `restore-keys` value, and `tmp/guides-source-cache-v4` as the cached path. Validate and promote it before setting `source_valid=true` or `media_valid=true`.

For v3/v2/v1, restore into historical live paths only after all residue from the rejected prior candidate is removed. Validate each candidate immediately. Stop fallback after valid sources; invalid media with valid sources selects full media recovery rather than another source fallback.

Emit final outputs:

```text
source_valid
media_valid
cache_version: v4 | v3 | v2 | v1 | none
cache_save_required: true when legacy/recovery/source-change must persist
```

After the candidate snapshot exists, calculate `cache_save_required` as true when `cache_version != v4`, prefetch ran in recovery mode, or the candidate canonical snapshot hash differs from the committed baseline snapshot hash. Otherwise emit false.

- [ ] **Step 4: Feed canonical media scope and report path**

For valid media, update the prefetch invocation to include:

```bash
--snapshot plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json \
--report plugins/lark-docs/meta/reports/guides-media-prefetch.json \
--mode incremental \
--cache-state valid
```

For invalid, missing, or legacy media, use the same snapshot/report arguments with `--mode recovery --cache-state "$cache_state"`. The script derives canonical files from the candidate snapshot. Invalid media omits `--plan` and rebuilds complete coverage. Valid media keeps the incremental selected scope and validated previous manifest.

- [ ] **Step 5: Validate YAML/policy and commit**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
node -e "const fs=require('node:fs'),yaml=require('js-yaml'); yaml.load(fs.readFileSync('.github/workflows/_fetch-guides-sources.yml','utf8'))"
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_fetch-guides-sources.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(ci): restore validated guides cache generations"
```

### Task 5: Save repaired, migrated, or changed v4 state after validation

**Files:**
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `.github/workflows/fetch-docs.yml` if output wiring is required
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing save-order and no-churn policy tests**

Assert `Create Guides v4 generation payload` runs after `Validate combined guides output` and promoted snapshot creation. Assert `Save Guides v4 generation` uses the candidate snapshot v4 save key, has `continue-on-error: true`, and is skipped for an unchanged run that restored valid v4.

- [ ] **Step 2: Run policy tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because assembly still saves the immutable v3 exact key.

- [ ] **Step 3: Replace v3 save with conditional v4 save**

After combined validation and snapshot promotion:

1. create the promoted source-cache manifest;
2. compute `generationKeys()` from the promoted snapshot and current run ID/attempt;
3. build and revalidate `tmp/guides-source-cache-v4`;
4. invoke `actions/cache/save@v4` only when `cache_save_required == 'true'`;
5. record `saved`, `skipped-valid-v4`, or `save-failed` in `plugins/lark-docs/meta/reports/guides-cache-generation.json`.

The report schema is exact:

```js
{
  schemaVersion: 1,
  generated_at: 'ISO timestamp',
  sourceCacheVersion: 'v4' | 'v3' | 'v2' | 'v1' | 'none',
  saveRequired: true,
  persistence: 'saved' | 'skipped-valid-v4' | 'save-failed',
  saveKey: 'guides-source-v4-...' | null,
}
```

- [ ] **Step 4: Validate and commit**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/guides-source-cache-generation.test.js
node scripts/validate-workflow-policy.js
node -e "const fs=require('node:fs'),yaml=require('js-yaml'); for (const f of ['.github/workflows/_assemble-guides.yml','.github/workflows/fetch-docs.yml']) yaml.load(fs.readFileSync(f,'utf8'))"
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_assemble-guides.yml .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(ci): persist repaired guides cache generations"
```

### Task 6: Surface media and persistence facts on the centralized card

**Files:**
- Modify: `scripts/collect-build-card-notes.js`
- Test: `scripts/collect-build-card-notes.test.js`
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Test: `scripts/docs-workflow/docs-progress-state.test.js`
- Modify: `.github/workflows/_assemble-guides.yml` if report upload ordering needs adjustment

- [ ] **Step 1: Add failing terminal-note tests**

Add a fresh report fixture and assert text such as:

```text
# Guides media

- Required: 472
- Reused from validated manifest: 450
- Reconstructed from committed docs: 12
- Freshly resolved over network: 10
- Stale entries dropped: 3
- Final manifest entries: 472
- Cache persistence: saved
```

Add invalid reconciliation, stale timestamp, missing persistence report, and `save-failed` cases. Missing reporting remains best-effort and does not change workflow status.

- [ ] **Step 2: Run report tests and confirm failure**

Run:

```bash
node --test scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.test.js
```

Expected: FAIL because the collectors and task names do not exist.

- [ ] **Step 3: Implement strict collectors and live task normalization**

Add `mediaPrefetchNote()` and `cacheGenerationNote()` using freshness checks and exact-key validation. Add their keys/titles to `GUIDES_REPORTS`.

Normalize these workflow step names:

```js
['restore guides v4 cache candidate', 'Restore Guides v4 cache candidate'],
['validate and promote guides v4 cache candidate', 'Validate Guides media cache'],
['prefetch shared guides media', 'Prefetch shared Guides media'],
['save guides v4 generation', 'Save Guides media cache'],
```

Do not add Feishu credentials or worker-side card calls.

- [ ] **Step 4: Run tests and commit**

Run:

```bash
node --test scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.test.js scripts/validate-workflow-policy.test.js
```

Expected: PASS.

Commit:

```bash
git add scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js .github/workflows/_assemble-guides.yml
git commit -m "feat(ci): report guides cache recovery state"
```

### Task 7: Milestone verification and two-run recovery drill

**Files:**
- Modify only if verification reveals a defect in the files already listed.

- [ ] **Step 1: Run the complete automated milestone suite**

Run:

```bash
node --test \
  scripts/docs-workflow/guides-media-prefetch.test.js \
  scripts/docs-workflow/guides-source-cache.test.js \
  scripts/docs-workflow/guides-source-cache-generation.test.js \
  scripts/docs-workflow/guides-stage-artifact.test.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/collect-build-card-notes.test.js \
  scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
git diff --check
```

Expected: all tests PASS and policy exits 0.

- [ ] **Step 2: Run a disposable recovery workflow**

Trigger a Guides workflow on a disposable target where media validation is forced invalid. Record the run URL and verify:

```text
source_valid=true
media_valid=false before recovery
selectedReferences=canonicalReferencesRequired
persistence=saved
save key starts with guides-source-v4-<exact snapshot hash>-
```

- [ ] **Step 3: Run an identical second workflow**

Verify it restores the newest v4 generation, validates before promotion, uses incremental media handling, and reports `persistence=skipped-valid-v4` without creating a duplicate generation.

- [ ] **Step 4: Ask Hooke to review evidence and commit drill-only fixes separately**

If no fixes are required, do not create an empty commit. If a defect is found, add a focused failing test, fix it, rerun the full suite, and commit only that fix.
