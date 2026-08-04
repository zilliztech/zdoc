# Fail-Closed Translation Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate immutable `master` tooling from `dev` publication identities, converge translation candidate and retirement handling on one fail-closed implementation, repair all Guides publisher faults together, and prove the result with a complete real-artifact local replay before online validation.

**Architecture:** `master` supplies workflow code, ownership contracts, schemas, and retirement policy; `dev` supplies the source baseline, per-group source checkpoints, target baseline, translations, and generated publication state. A schema-v2 handoff binds every selected translation unit to `sourceBaselineSha`, `sourceCheckpointSha`, and `targetBaselineSha`; the shared TypeScript candidate engine performs group-scoped state reconciliation, while `manifest.js` remains only a CLI/serialization adapter. Translation artifacts exclude master-owned policy, and the Guides publisher validates locale-qualified artifacts, no-rename staging paths, source authority, canonical roots, full site build, coverage, and links before promotion.

**Tech Stack:** GitHub Actions reusable workflows, Node.js 22 CommonJS, TypeScript, Zod, Vitest, `node:test`, Git plumbing, actionlint, pnpm, real GitHub Actions artifacts, isolated local bare remotes.

---

## File map and ownership boundaries

**Handoff and workflow identity**

- Modify `scripts/docs-workflow/translation-handoff.js` — schema-v2 construction, exact key validation, Git commit/ancestry validation, deterministic unit ordering.
- Modify `scripts/docs-workflow/translation-handoff.test.js` — baseline/checkpoint/target identity, ancestry, duplicate, and cross-group failures.
- Modify `.github/workflows/fetch-docs.yml` — construct and dispatch the complete handoff after the source publication barrier.
- Modify `.github/workflows/translate-codex.yml` — consume the validated handoff and expose source baseline/checkpoint fields to every selected unit.
- Modify `.github/workflows/_prepare-translation-batches.yml` — pass both Guides source identities into the preparation producer.
- Modify `.github/workflows/_translate-content-group.yml` — validate both source identities before any paid agent call.

**Group delta and candidate reconciliation**

- Preserve and finish the existing uncommitted edits in `scripts/docs-workflow/group-paths.js` and `scripts/docs-workflow/group-paths.test.js` — canonical source ownership and preserved landing paths.
- Preserve and finish the existing uncommitted edits in `scripts/translation/sourceDelta.js` and `scripts/translation/sourceDelta.test.js` — group scoping and preserved-path behavior.
- Modify `packages/docs-tooling/src/translation/candidates.ts` — the single group-scoped candidate and historical-orphan engine.
- Modify `packages/docs-tooling/src/translation/candidates.test.ts` — current delta, stale/missing target, historical orphan, group isolation, and preserved landing coverage.
- Modify `scripts/translation/manifest.js` and `scripts/translation/manifest.test.js` — thin adapter over the shared engine.

**Retirement policy and checkpoint ownership**

- Modify `packages/docs-tooling/src/reference/translationManifest.ts` and its unit/integration tests — schema-v2 retirement policy with reviewed and unreviewed records.
- Modify `config/reference-retirements.json` — structural schema migration; only exact engine-emitted tuples receive authorization.
- Modify `scripts/translation/bootstrap-state.js` and `scripts/translation/bootstrap-state.test.js` — bootstrap state only; no policy rewrite.
- Modify `scripts/docs-workflow/validate-checkpoint-artifact.js` and tests — registry excluded from translation ownership.
- Modify `scripts/docs-workflow/apply-checkpoint-artifact.js` and tests — merge translation state only, never policy.

**Guides publisher**

- Modify `packages/docs-tooling/src/workflows/groups.ts` and `packages/docs-tooling/src/workflows/groups.test.ts` — English-only shared Guides assembly/report checkpoint paths.
- Create `scripts/docs-workflow/translation-artifact-pairs.js` and `scripts/docs-workflow/translation-artifact-pairs.test.js` — strict locale-qualified result/baseline pairing.
- Modify `.github/workflows/_publish-translation-batches.yml` — use the pairing helper and keep all publisher gates fail-closed.
- Modify `scripts/docs-workflow/translation-staging.js` and `scripts/docs-workflow/translation-staging.test.js` — disable rename detection in changed/staged path comparison.
- Modify `scripts/docs-workflow/translation-publication-report.js` and tests — canonical validation command receipts.
- Modify `scripts/docs-workflow/validate-guides-translation-staging.js` and tests — canonical required roots, exact restored-state proof, site build, coverage, and link checks.

**Policy and final verification**

- Modify `scripts/validate-workflow-policy.js` and `scripts/validate-workflow-policy.test.js` — enforce identity separation, fail-early ordering, locale-qualified pairing, and no policy publication.
- Reuse `scripts/docs-workflow/preflight-checkpoint-archive.js`, `scripts/docs-workflow/publish-checkpoint.sh`, `scripts/docs-workflow/source-publication-barrier.js`, `scripts/restore-generated-state.sh`, and card collection without weakening their contracts.

## Non-negotiable invariants

- Never run `git diff` between `toolingSha` and a `dev` source SHA.
- Every selected unit has one exact `sourceBaselineSha`, `sourceCheckpointSha`, and `targetBaselineSha` before paid work.
- Source delta is `dev` baseline to `dev` checkpoint, scoped by the selected group, with `--no-renames`.
- `python.md` and every declared preserved path may be translated but may never become a retirement candidate.
- Retirement authorization is the exact tuple `manual`, `sourcePath`, `targetPath`, `changeKind`; rationale is never machine authority.
- `config/reference-retirements.json` remains immutable master policy and never enters a translation checkpoint or `dev` merge.
- Chinese Guides cannot publish English-owned assembly or report paths.
- Every Guides batch number resolves to exactly one locale-qualified result artifact and one locale-qualified baseline artifact.
- Local real-artifact replay must finish every required lane and validation gate before commit/push and online `run_translations=true` validation.
- Deprecated `zdoc_cn` remains out of scope.

### Task 1: Introduce the schema-v2 immutable translation handoff

**Files:**

- Modify: `scripts/docs-workflow/translation-handoff.test.js`
- Modify: `scripts/docs-workflow/translation-handoff.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `.github/workflows/_prepare-translation-batches.yml`
- Modify: `.github/workflows/_translate-content-group.yml`

- [ ] **Step 1: Write failing schema-v2 construction tests**

Replace `sourceShas` fixtures with exact publication identities:

```js
const publications = {
  python: {sourceBaselineSha: SHA_A, sourceCheckpointSha: SHA_B},
}
const value = buildTranslationHandoff({
  locale: 'all',
  group: 'python',
  toolingSha: SHA_C,
  targetBranch: 'dev',
  targetBaselineSha: SHA_D,
  sourcePublications: publications,
})
assert.equal(value.schemaVersion, 2)
assert.deepEqual(value.units.map(unit => ({
  target: unit.target,
  group: unit.group,
  sourceBaselineSha: unit.sourceBaselineSha,
  sourceCheckpointSha: unit.sourceCheckpointSha,
  targetBaselineSha: unit.targetBaselineSha,
})), [
  {target: 'ja-JP', group: 'python', sourceBaselineSha: SHA_A, sourceCheckpointSha: SHA_B, targetBaselineSha: SHA_D},
  {target: 'zh-CN-reference', group: 'python', sourceBaselineSha: SHA_A, sourceCheckpointSha: SHA_B, targetBaselineSha: SHA_D},
])
```

Add failures for a missing baseline, missing checkpoint, invalid target baseline, duplicate `target/group`, noncanonical publication order, and an unexpected publication key.

- [ ] **Step 2: Write failing Git identity tests**

Create a temporary repository with baseline, Python checkpoint, and unrelated sibling commits. Assert:

```js
assert.doesNotThrow(() => validateTranslationHandoffRepository({repository, handoff}))
assert.throws(
  () => validateTranslationHandoffRepository({repository, handoff: withCheckpoint(siblingSha)}),
  /source baseline.*ancestor|non-ancestral/i,
)
assert.throws(
  () => validateTranslationHandoffRepository({repository, handoff: withTargetBaseline('f'.repeat(40))}),
  /target baseline.*commit|reachable/i,
)
```

- [ ] **Step 3: Run the focused handoff tests and confirm RED**

```bash
node --test scripts/docs-workflow/translation-handoff.test.js
```

Expected: FAIL because the current schema has only `sourceSha` and no repository ancestry gate.

- [ ] **Step 4: Implement exact schema-v2 validation**

Use these exact shapes:

```js
const HANDOFF_KEYS = ['schemaVersion', 'locale', 'group', 'toolingSha', 'targetBranch', 'targetBaselineSha', 'units']
const UNIT_KEYS = [
  'target', 'group', 'sourceGroup', 'sourceBaselineSha',
  'sourceCheckpointSha', 'targetBaselineSha', 'publicationOrder',
]

function unitFromSelection(selected, publication, targetBaselineSha) {
  return {
    target: selected.target,
    group: selected.group,
    sourceGroup: selected.sourceGroup,
    sourceBaselineSha: publication.sourceBaselineSha,
    sourceCheckpointSha: publication.sourceCheckpointSha,
    targetBaselineSha,
    publicationOrder: selected.publicationOrder,
  }
}
```

Validate exact keys, lowercase 40-character SHAs, unique `target/group`, identical unit/global target baseline, and the ordering returned by `buildTranslationSelection`.

- [ ] **Step 5: Add repository reachability and ancestry validation**

Use argument arrays, not shell interpolation:

```js
function git(repository, args) {
  return spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
}

function assertCommit(repository, sha, label) {
  const result = git(repository, ['cat-file', '-e', `${sha}^{commit}`])
  if (result.status !== 0) throw new Error(`${label} is not a reachable commit`)
}

function assertAncestor(repository, baseline, checkpoint, label) {
  const result = git(repository, ['merge-base', '--is-ancestor', baseline, checkpoint])
  if (result.status !== 0) throw new Error(`${label} source baseline is not an ancestor of its source checkpoint`)
}
```

- [ ] **Step 6: Produce the complete handoff only after the source barrier**

In `fetch-docs.yml`, build `source-publications.json` from the common `DEV_BASELINE_SHA` plus every exact publisher result. Fetch the exact target branch head after the barrier, use it as `targetBaselineSha`, call `translation-handoff.js`, and expose `handoff_json` rather than a bare SHA map.

For a `no_changes` publisher, record the publisher's exact result SHA when present; otherwise bind `sourceCheckpointSha` to `DEV_BASELINE_SHA`. Never substitute `TOOLING_SHA`.

- [ ] **Step 7: Consume and revalidate the complete handoff in translation prepare**

Change `translate-codex.yml` to:

```yaml
handoff_json: { description: Complete schema-v2 translation handoff, required: true, type: string }
```

After checking out exact tooling, fetch every unique source baseline/checkpoint and the target branch, require the remote target head to equal `handoff.targetBaselineSha`, then call repository validation before producing any matrix output.

Expose SDK matrix entries with `sourceBaselineSha` and `sourceCheckpointSha`; expose the Guides unit as an exact object rather than a single SHA.

- [ ] **Step 8: Thread both source identities through reusable producers**

Add required `source_baseline_sha` inputs to `_prepare-translation-batches.yml` and `_translate-content-group.yml`. Rename workflow environment variables to:

```yaml
SOURCE_BASELINE_SHA: ${{ inputs.source_baseline_sha }}
SOURCE_CHECKPOINT_SHA: ${{ inputs.source_checkpoint_sha }}
TOOLING_SHA: ${{ inputs.tooling_sha }}
```

Keep checkpoint artifact `devBaselineSha` equal to `sourceCheckpointSha`; the new source baseline is candidate provenance, not the artifact application baseline.

- [ ] **Step 9: Run focused tests**

```bash
node --test scripts/docs-workflow/translation-handoff.test.js scripts/translation/selection.test.js
```

Expected: PASS.

- [ ] **Step 10: Commit the handoff contract**

```bash
git add scripts/docs-workflow/translation-handoff.js scripts/docs-workflow/translation-handoff.test.js .github/workflows/fetch-docs.yml .github/workflows/translate-codex.yml .github/workflows/_prepare-translation-batches.yml .github/workflows/_translate-content-group.yml
git commit -m "fix(workflow): bind translations to dev source identities"
```

### Task 2: Compute a group-scoped dev-to-dev source delta

**Files:**

- Modify: `scripts/docs-workflow/group-paths.test.js`
- Modify: `scripts/docs-workflow/group-paths.js`
- Modify: `scripts/translation/sourceDelta.test.js`
- Modify: `scripts/translation/sourceDelta.js`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Preserve the four existing worktree edits and add missing RED cases**

Do not restore or overwrite the current edits. Extend them with tests proving:

```js
assert.equal(getGroupPaths('python').preservedEnglish.includes(
  'content/en/reference/api/python/python/python.md',
), true)

assert.deepEqual(classifySourceDelta({
  group: 'python',
  target: 'zh-CN-reference',
  changes: [
    {status: 'D', path: 'content/en/reference/api/python/python/python.md'},
    {status: 'D', path: 'content/en/reference/api/python/python/removed.md'},
  ],
}).retirementCandidates, [{
  sourcePath: 'content/en/reference/api/python/python/removed.md',
  targetPath: 'content/zh-CN/reference/api/python/python/removed.md',
  changeKind: 'source_deleted',
}])
```

- [ ] **Step 2: Add a real Git no-rename test**

Create baseline/checkpoint commits where nine files move to new names. Call the new Git-backed delta function and assert it returns nine `D` plus nine `A` records, never `Rnnn`.

- [ ] **Step 3: Run source-delta tests and confirm RED**

```bash
node --test scripts/docs-workflow/group-paths.test.js scripts/translation/sourceDelta.test.js
```

Expected: FAIL until preservation and no-rename Git collection are complete.

- [ ] **Step 4: Make the delta CLI own Git collection**

Add required CLI flags:

```text
--repository <absolute-repository-root>
--source-baseline-sha <sha>
--source-checkpoint-sha <sha>
--target <target>
--group <group>
--output <file>
```

Collect the diff with:

```js
const args = [
  '-C', repository,
  'diff', '--no-renames', '--name-status', '-z',
  sourceBaselineSha, sourceCheckpointSha,
  '--', ...ownedSourcePaths,
]
```

Parse NUL-delimited `A`, `M`, and `D` entries only. Treat any rename-form status as a contract failure because the command must disable rename detection.

- [ ] **Step 5: Exclude preserved paths from retirement effects**

Keep preserved paths eligible for active translation candidates, but skip them when populating `deletedI18n` or `retirementCandidates`. Rename the retirement field from `reason` to `changeKind` throughout the delta document.

- [ ] **Step 6: Remove the tooling-to-source diff from the workflow**

Replace:

```bash
git diff --name-status "$MASTER_SHA" "$SOURCE_COMMIT_SHA"
```

with the new CLI invocation using `SOURCE_BASELINE_SHA` and `SOURCE_CHECKPOINT_SHA`. No workflow command may compare tooling SHA with publication SHA.

- [ ] **Step 7: Add workflow policy assertions**

Require `_translate-content-group.yml` to contain both source identities and `--no-renames` through the helper contract, and reject any `git diff` containing `TOOLING_SHA`, `MASTER_SHA`, or `tooling_sha` as an endpoint.

- [ ] **Step 8: Verify the exact Python replay identities**

```bash
node scripts/translation/sourceDelta.js \
  --repository "$PWD" \
  --source-baseline-sha ea092fd4b1ef1e25d91e3af3b2d2a35efd623a2d \
  --source-checkpoint-sha 2ac2a6ba1a7fc04725abb8b4919159cf8777e760 \
  --target zh-CN-reference \
  --group python \
  --output /private/tmp/python-source-delta.json
jq '{changedEnglish,retirementCandidates}' /private/tmp/python-source-delta.json
```

Expected: no fabricated Python document changes or current-publication retirements.

- [ ] **Step 9: Commit the source identity correction**

```bash
git add scripts/docs-workflow/group-paths.js scripts/docs-workflow/group-paths.test.js scripts/translation/sourceDelta.js scripts/translation/sourceDelta.test.js .github/workflows/_translate-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix(translation): diff dev source checkpoints by group"
```

### Task 3: Converge production manifest generation on the shared candidate engine

**Files:**

- Modify: `packages/docs-tooling/src/translation/candidates.test.ts`
- Modify: `packages/docs-tooling/src/translation/candidates.ts`
- Modify: `packages/docs-tooling/src/translation/schema.ts`
- Modify: `scripts/translation/manifest.test.js`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/docs-workflow/translation-batch-input.js`
- Modify: `scripts/docs-workflow/translation-batch-input.test.js`

- [ ] **Step 1: Write failing group-scoping and historical-orphan tests**

Use a fixture containing Python and Java sources plus Chinese translation-state records. Assert a Python call emits only Python candidates and discovers a source-absent/target-present Python record:

```ts
const result = buildTranslationCandidates({
  repositoryRoot,
  targetId: 'zh-CN-reference',
  group: 'python',
  ownedSourcePaths: ['content/en/reference/api/python/python'],
  preservedSourcePaths: ['content/en/reference/api/python/python/python.md'],
  changedSourcePaths: [],
  mode: 'incremental',
  retirementRegistry,
});
expect(result.retirementCandidates).toEqual([{
  manual: 'python',
  sourcePath: orphanSource,
  targetPath: orphanTarget,
  changeKind: 'source_deleted',
}]);
```

Add tests that the same Java record is ignored, `python.md` is never retired, and an active preserved landing can still be emitted as a translation candidate.

- [ ] **Step 2: Write failing full/incremental behavior tests**

Require `mode: 'full'` to emit every active selected-group source and `mode: 'incremental'` to emit only current-delta, missing-target, stale-source, or forced paths.

- [ ] **Step 3: Run the TypeScript candidate tests and confirm RED**

```bash
pnpm exec vitest run packages/docs-tooling/src/translation/candidates.test.ts
```

Expected: FAIL because the current engine scans the entire target and drops approved retirement candidates from its return value.

- [ ] **Step 4: Extend the shared engine options and output**

Use this public contract:

```ts
export type CandidateBuildOptions = Readonly<{
  repositoryRoot: string;
  targetId: TranslationTargetId;
  group: string;
  ownedSourcePaths: readonly string[];
  preservedSourcePaths: readonly string[];
  forceTranslationPaths?: readonly string[];
  changedSourcePaths?: readonly string[];
  mode: 'full' | 'incremental';
  retirementRegistry?: ReferenceRetirementRegistry;
}>;
```

Filter both active sources and previous records through exact group ownership. Remove target-wide registry suppression. A reviewed retirement policy authorizes an emitted retirement; it does not suppress an active source.

- [ ] **Step 5: Return deterministic authorized retirement effects**

The engine returns all emitted retirement candidates after policy validation:

```ts
return deepFreeze({
  candidates: candidates.sort(compareCandidates),
  retirementCandidates: retirementCandidates.sort(compareRetirements),
});
```

Throw `TranslationRetirementRequiredError` before returning if any emitted tuple lacks exact authorization.

- [ ] **Step 6: Make `manifest.js` a thin adapter**

Retain CLI parsing, batching, item `type` derivation, and manifest serialization. Remove duplicate source walking, hashing, cache interpretation, retirement normalization, and approval matching. Load the shared engine with `loadTypeScript`, pass `getGroupPaths(group)` ownership metadata, and serialize `changeKind` unchanged.

- [ ] **Step 7: Update batch-input retirement schemas**

Change:

```js
const RETIREMENT_KEYS = ['manual', 'sourcePath', 'targetPath', 'changeKind']
```

Require `changeKind` from the approved enum and update canonical sort/duplicate keys accordingly. Guides should normally carry an empty retirement list, but malformed cross-target retirement input must still fail closed.

- [ ] **Step 8: Run focused tests**

```bash
pnpm exec vitest run packages/docs-tooling/src/translation/candidates.test.ts
node --test scripts/translation/manifest.test.js scripts/docs-workflow/translation-batch-input.test.js scripts/translation/batches.test.js
```

Expected: PASS.

- [ ] **Step 9: Commit candidate convergence**

```bash
git add packages/docs-tooling/src/translation/candidates.ts packages/docs-tooling/src/translation/candidates.test.ts packages/docs-tooling/src/translation/schema.ts scripts/translation/manifest.js scripts/translation/manifest.test.js scripts/docs-workflow/translation-batch-input.js scripts/docs-workflow/translation-batch-input.test.js scripts/translation/batches.js scripts/translation/batches.test.js
git commit -m "fix(translation): use one group candidate engine"
```

### Task 4: Make retirement policy exact, reviewed, and master-owned

**Files:**

- Modify: `packages/docs-tooling/src/reference/translationManifest.ts`
- Modify: `packages/docs-tooling/src/reference/translationManifest.test.ts`
- Modify: `packages/docs-tooling/src/reference/translationManifest.integration.test.ts`
- Modify: `packages/docs-tooling/src/validation/referenceNavigation.test.ts`
- Modify: `packages/docs-tooling/src/cli.ts`
- Modify: `packages/docs-tooling/src/translation/candidates.ts`
- Modify: `packages/docs-tooling/src/translation/candidates.test.ts`
- Modify: `config/reference-retirements.json`
- Modify: `scripts/translation/bootstrap-state.js`
- Modify: `scripts/translation/bootstrap-state.test.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/apply-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/apply-checkpoint-artifact.test.js`

- [ ] **Step 1: Write failing schema-v2 policy tests**

Use an explicit nullable authorization marker for structurally migrated legacy records:

```ts
const RetirementRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  targetPath: RepositoryPathSchema,
  changeKind: z.enum(['source_deleted', 'source_renamed', 'sidebar_removed']).nullable(),
  rationale: z.string().min(1),
}).strict();
```

`changeKind: null` preserves an existing Reference retirement record for manifest/navigation validation but grants no translation-agent authorization. A non-null value is exact authority.

Add tests rejecting schema 1 at runtime, `reason`, missing rationale, unknown change kind, wrong manual ownership, duplicate tuples, and unsorted records.

- [ ] **Step 2: Write failing exact-authorization tests**

Assert that rationale text never authorizes a candidate and that `changeKind: null` remains non-authorizing:

```ts
expect(() => buildTranslationCandidates({...options, retirementRegistry: {
  schemaVersion: 2,
  retirements: [{manual: 'python', sourcePath, targetPath, changeKind: null, rationale: 'source_deleted'}],
}})).toThrow(TranslationRetirementRequiredError);
```

- [ ] **Step 3: Write failing checkpoint ownership tests**

Require Chinese Reference translation artifacts containing `config/reference-retirements.json` to fail validation. Replace the current merge test with an assertion that policy bytes in the target directory are unchanged after applying a valid translation checkpoint.

- [ ] **Step 4: Write failing bootstrap immutability test**

Run `bootstrap-state.js mark` in a fixture and assert the retirement registry bytes are byte-for-byte unchanged while `bootstrapCompletedGroups` is updated.

- [ ] **Step 5: Run focused tests and confirm RED**

```bash
pnpm exec vitest run \
  packages/docs-tooling/src/reference/translationManifest.test.ts \
  packages/docs-tooling/src/reference/translationManifest.integration.test.ts \
  packages/docs-tooling/src/translation/candidates.test.ts \
  packages/docs-tooling/src/validation/referenceNavigation.test.ts
node --test scripts/translation/bootstrap-state.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/apply-checkpoint-artifact.test.js
```

- [ ] **Step 6: Migrate registry structure without inventing authority**

Transform every record:

```json
{
  "manual": "python",
  "sourcePath": "content/en/reference/...",
  "targetPath": "content/zh-CN/reference/...",
  "changeKind": null,
  "rationale": "Imported baseline retirement from the clean-room Reference migration"
}
```

Then run the corrected engine against the immutable `dev` state. Set `changeKind` only for exact currently emitted tuples already reviewed by the user or already verified as an active registry decision. Specifically verify, rather than force, the four approved Python paths and the existing `Vector-GroupBy.md` record. `python.md` must remain absent from emitted retirements.

- [ ] **Step 7: Stop bootstrap from rewriting policy**

Delete `normalizeRetirements`, `normalizeReferenceRetirements`, and the call from `mark`. Keep only state-mode resolution and bootstrap completion markers.

- [ ] **Step 8: Exclude policy from translation artifacts**

Remove `config/reference-retirements.json` from `translationOwnedPaths()` in `validate-checkpoint-artifact.js`. Artifact creation then cannot collect it, validation rejects it, and checkpoint application has only the target's translation state path to three-way merge.

- [ ] **Step 9: Remove policy merge logic**

Change `apply-checkpoint-artifact.js` to:

```js
const statePaths = statePath && manifest.files.some(entry => entry.path === statePath)
  ? [statePath]
  : []
```

Delete the `mergePath === 'config/reference-retirements.json'` branch.

- [ ] **Step 10: Run registry and checkpoint verification**

```bash
pnpm docs-tooling validate-reference --site zh-CN
pnpm exec vitest run \
  packages/docs-tooling/src/reference/translationManifest.test.ts \
  packages/docs-tooling/src/reference/translationManifest.integration.test.ts \
  packages/docs-tooling/src/translation/candidates.test.ts \
  packages/docs-tooling/src/validation/referenceNavigation.test.ts
node --test scripts/translation/bootstrap-state.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/apply-checkpoint-artifact.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js
```

Expected: PASS; `git diff -- config/reference-retirements.json` shows only the intentional schema/authorization migration.

- [ ] **Step 11: Commit the policy boundary**

```bash
git add packages/docs-tooling/src/reference/translationManifest.ts packages/docs-tooling/src/reference/translationManifest.test.ts packages/docs-tooling/src/reference/translationManifest.integration.test.ts packages/docs-tooling/src/validation/referenceNavigation.test.ts packages/docs-tooling/src/cli.ts packages/docs-tooling/src/translation/candidates.ts packages/docs-tooling/src/translation/candidates.test.ts config/reference-retirements.json scripts/translation/bootstrap-state.js scripts/translation/bootstrap-state.test.js scripts/docs-workflow/validate-checkpoint-artifact.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/apply-checkpoint-artifact.js scripts/docs-workflow/apply-checkpoint-artifact.test.js
git commit -m "fix(translation): keep retirement policy on master"
```

### Task 5: Correct Guides source ownership and locale-qualified artifact pairing

**Files:**

- Modify: `packages/docs-tooling/src/workflows/groups.test.ts`
- Modify: `packages/docs-tooling/src/workflows/groups.ts`
- Create: `scripts/docs-workflow/translation-artifact-pairs.test.js`
- Create: `scripts/docs-workflow/translation-artifact-pairs.js`
- Modify: `.github/workflows/_publish-translation-batches.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing English/Chinese checkpoint ownership tests**

Assert English Guides contains every `GUIDES_CHECKPOINT_PATHS` entry and Chinese Guides contains none:

```ts
const shared = 'packages/docs-tooling/src/lark/meta/assembly/guides.json';
expect(resolvePublicationGroupWorkflow('en', 'guides').checkpointPaths).toContain(shared);
expect(resolvePublicationGroupWorkflow('zh-CN', 'guides').checkpointPaths).not.toContain(shared);
```

Repeat for the Guides report prefix.

- [ ] **Step 2: Implement English-only shared diagnostics**

Change the checkpoint path expression to:

```ts
...(site === 'en' && groupName === 'guides' ? GUIDES_CHECKPOINT_PATHS : []),
```

- [ ] **Step 3: Write failing artifact-pairing tests using the real naming shape**

Create direct child directories named:

```text
translation-checkpoint-ja-JP-guides-30738338949-batch-1
translation-baseline-ja-JP-guides-30738338949-batch-1
```

Assert ordered pairs for batches 1 through 11. Add failures for an omitted locale, duplicate batch, missing batch, wrong target, wrong group, wrong run ID, extra directory, symlink directory, and missing `checkpoint-group.tar`.

- [ ] **Step 4: Implement the strict pairing helper**

Expose:

```js
function resolveTranslationArtifactPairs({
  checkpointsRoot, baselinesRoot, target, group, runId, batchCount,
})
```

Match exact basenames with escaped literals and `batchNumber` in `1..batchCount`. Return:

```js
{
  schemaVersion: 1,
  target,
  group,
  runId,
  batchCount,
  pairs: [{batchNumber, resultArchive, baselineArchive}],
}
```

Reject all unexpected children rather than ignoring them.

- [ ] **Step 5: Replace reconstructed shell directory names**

In `_publish-translation-batches.yml`, invoke the helper immediately after download. Iterate over its ordered output, preflight each archive with `preflight-checkpoint-archive.js`, extract beneath the private trusted root, and then run the existing semantic `validateTranslationBatch` pair validation.

- [ ] **Step 6: Add policy enforcement**

Require the helper before extraction and reject literal publisher paths that omit `${{ inputs.target }}`. Keep artifact download patterns target-qualified.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run packages/docs-tooling/src/workflows/groups.test.ts
node --test scripts/docs-workflow/translation-artifact-pairs.test.js scripts/validate-workflow-policy.test.js
```

- [ ] **Step 8: Commit Guides ownership and artifact identity**

```bash
git add packages/docs-tooling/src/workflows/groups.ts packages/docs-tooling/src/workflows/groups.test.ts scripts/docs-workflow/translation-artifact-pairs.js scripts/docs-workflow/translation-artifact-pairs.test.js .github/workflows/_publish-translation-batches.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix(guides): bind locale artifacts and source ownership"
```

### Task 6: Make Guides staging and combined validation deterministic

**Files:**

- Modify: `scripts/docs-workflow/translation-staging.test.js`
- Modify: `scripts/docs-workflow/translation-staging.js`
- Modify: `scripts/docs-workflow/translation-publication-report.test.js`
- Modify: `scripts/docs-workflow/translation-publication-report.js`
- Modify: `scripts/docs-workflow/validate-guides-translation-staging.test.js`
- Modify: `scripts/docs-workflow/validate-guides-translation-staging.js`

- [ ] **Step 1: Write the 106-versus-97 rename-collapse regression test**

Create nine old/new path pairs plus 88 independent mutations in a staging worktree. Configure Git rename detection, run `commitAppliedBatch`, and require all 106 changed paths to match the validated set and commit successfully.

- [ ] **Step 2: Disable rename detection in both comparisons**

Use:

```js
git(worktree, ['diff', '--no-renames', '--name-only', '-z', 'HEAD', '--'], {buffer: true})
git(worktree, ['diff', '--cached', '--no-renames', '--name-only', '-z'], {buffer: true})
```

Keep the exact set equality and fixed translation-root checks.

- [ ] **Step 3: Write failing canonical-root validation tests**

Change the fixture to omit `docs`, `docs-byoc`, `reference`, and `config/generated`. Seed only canonical tracked roots:

```text
content/en/guides
content/en/byoc
content/en/reference
i18n/ja-JP/docusaurus-plugin-content-docs/current
i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current
i18n/ja-JP/docusaurus-plugin-content-docs-reference/current
.translation-cache/ja-JP.json
generated/en/sidebars
generated/en/manifests/lark-revisions
packages/docs-tooling/src/lark/meta/snapshots
packages/docs-tooling/src/lark/meta/assembly
packages/docs-tooling/src/lark/meta/reports
```

Assert legacy compatibility roots are not required. Keep tests for wrong HEAD, forged bytes, untracked state, symlinks, mode drift, and fail-first command receipts.

- [ ] **Step 4: Split allowed restored roots from required proof roots**

Define:

```js
const REQUIRED_ROOTS = Object.freeze([
  'content/en/guides',
  'content/en/byoc',
  'i18n/ja-JP/docusaurus-plugin-content-docs/current',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current',
  '.translation-cache/ja-JP.json',
  'generated/en/sidebars',
])
```

Use canonical publication paths for exact index/blob proof. Legacy roots may be restored by the general compatibility script but are never required for validation success.

- [ ] **Step 5: Replace validation receipts with canonical commands**

Use this exact order:

```js
const VALIDATION_SPECS = Object.freeze([
  {id: 'english-saas-mdx', executable: 'pnpm', args: ['docs-tooling', 'validate-mdx', '--path', 'content/en/guides']},
  {id: 'english-byoc-mdx', executable: 'pnpm', args: ['docs-tooling', 'validate-mdx', '--path', 'content/en/byoc']},
  {id: 'ja-saas-mdx', executable: 'pnpm', args: ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP/docusaurus-plugin-content-docs/current']},
  {id: 'ja-byoc-mdx', executable: 'pnpm', args: ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current']},
  {id: 'sidebars', executable: 'node', args: ['scripts/validate-generated-sidebars.js', '--site', 'en']},
  {id: 'coverage', executable: 'node', args: ['scripts/validate-translated-coverage.js', '--group', 'guides']},
  {id: 'build-and-links', executable: 'node', args: ['scripts/run-doc-build-stage.js', '--build', 'pnpm run build', '--skipCardReporting']},
])
```

Render `command` from `executable` plus quoted args so report validation and execution share one source of truth.

- [ ] **Step 6: Run focused Guides publisher tests**

```bash
node --test scripts/docs-workflow/translation-staging.test.js scripts/docs-workflow/translation-publication-report.test.js scripts/docs-workflow/validate-guides-translation-staging.test.js scripts/docs-workflow/translation-batch-set.test.js scripts/docs-workflow/translation-staging-publisher.test.js
```

Expected: PASS, including 106/106 path equality and seven successful validation receipts.

- [ ] **Step 7: Commit deterministic Guides validation**

```bash
git add scripts/docs-workflow/translation-staging.js scripts/docs-workflow/translation-staging.test.js scripts/docs-workflow/translation-publication-report.js scripts/docs-workflow/translation-publication-report.test.js scripts/docs-workflow/validate-guides-translation-staging.js scripts/docs-workflow/validate-guides-translation-staging.test.js
git commit -m "fix(guides): validate canonical staged translations"
```

### Task 7: Lock fail-early and fail-closed workflow policy

**Files:**

- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Verify: all changed `.github/workflows/*.yml`

- [ ] **Step 1: Add mutation tests for every repaired boundary**

Add policy fixtures that independently remove or corrupt:

- source baseline input;
- target baseline equality check;
- source ancestry validation;
- group-scoped source delta;
- no-rename behavior;
- shared candidate engine invocation;
- retirement approval before agent execution;
- policy exclusion from checkpoints;
- locale-qualified Guides artifact pairing;
- English-only shared Guides checkpoint paths;
- canonical Guides validation roots;
- promotion-after-full-validation ordering.

Each mutation must produce one stable error string naming the violated boundary.

- [ ] **Step 2: Enforce paid-work ordering**

Require these steps, in order, before `Run translation agents`:

```text
Validate immutable inputs
Materialize source checkpoint and baseline
Apply source translation delta
Resolve effective translation mode
Build group translation manifest
Run translation agents
```

Also require the complete handoff repository validation to finish in `translate-codex.yml:prepare` before either matrix reusable workflow can start.

- [ ] **Step 3: Run policy and workflow schema checks**

```bash
pnpm test:workflow-policy
actionlint .github/workflows/fetch-docs.yml \
  .github/workflows/translate-codex.yml \
  .github/workflows/_prepare-translation-batches.yml \
  .github/workflows/_translate-content-group.yml \
  .github/workflows/_publish-content-group.yml \
  .github/workflows/_publish-translation-batches.yml
```

Expected: all policy tests pass and actionlint exits 0.

- [ ] **Step 4: Run all affected unit suites**

```bash
node --test \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/group-paths.test.js \
  scripts/translation/sourceDelta.test.js \
  scripts/translation/manifest.test.js \
  scripts/translation/bootstrap-state.test.js \
  scripts/docs-workflow/translation-artifact-pairs.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/apply-checkpoint-artifact.test.js \
  scripts/docs-workflow/translation-staging.test.js \
  scripts/docs-workflow/translation-publication-report.test.js \
  scripts/docs-workflow/validate-guides-translation-staging.test.js
pnpm exec vitest run \
  packages/docs-tooling/src/translation/candidates.test.ts \
  packages/docs-tooling/src/reference/translationManifest.test.ts \
  packages/docs-tooling/src/reference/translationManifest.integration.test.ts \
  packages/docs-tooling/src/validation/referenceNavigation.test.ts \
  packages/docs-tooling/src/workflows/groups.test.ts
pnpm test:translation
```

- [ ] **Step 5: Commit policy coverage**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test(workflow): enforce fail-closed translation gates"
```

### Task 8: Perform the complete real-artifact local replay

**Files:**

- Read: `/private/tmp/zdoc-complete-replay.z7VeRp/artifacts/`
- Read: `/private/tmp/zdoc-guides-publisher-91473491454.jvB4Sp/downloads/`
- Create outside repository: `/private/tmp/zdoc-fail-closed-translation-replay.<random>/`
- Preserve outside repository: replay logs, manifests, receipts, final SHAs, and card JSON.

- [ ] **Step 1: Create a new isolated replay root and record immutable identities**

```bash
replay_root=$(mktemp -d /private/tmp/zdoc-fail-closed-translation-replay.XXXXXX)
chmod 700 "$replay_root"
printf '%s\n' "$replay_root" > /private/tmp/zdoc-last-fail-closed-replay-root.txt
git rev-parse HEAD > "$replay_root/tooling-sha.txt"
```

Record source run `30736591241`, translation run `30738338949`, source `devBaselineSha`, every source publisher result SHA, the translation target baseline, and the exact Guides source checkpoint.

- [ ] **Step 2: Preflight every source checkpoint archive before extraction**

For Java, Node, Go, CLI, REST, Python, English Guides, and Chinese Guides, run:

```bash
node scripts/docs-workflow/preflight-checkpoint-archive.js \
  --archive "/private/tmp/zdoc-complete-replay.z7VeRp/artifacts/<artifact>/checkpoint-group.tar" \
  --output "$replay_root/preflight/source-<lane>.json"
```

Expected: eight successful preflight receipts; no extraction occurs before its receipt exists.

- [ ] **Step 3: Seed a local bare remote at the source-run dev baseline**

Clone the current tooling commit into `$replay_root/tooling`, initialize `$replay_root/remote.git`, and set its `dev` ref to the recorded source-run baseline. Point only the replay clone's `origin` at this bare remote.

- [ ] **Step 4: Publish all eight source lanes in production order**

Run `publish-checkpoint.sh` against the local remote in this exact order:

```text
java -> node -> go -> cli -> rest -> python -> guides-en -> guides-zh-CN
```

Use each workflow commit message and validation command. Set `ZDOC_SITE=zh-CN` only for Chinese Guides. Capture one log and one result JSON per lane.

Expected: every lane is `published` or `no_changes`; any other status stops the replay.

- [ ] **Step 5: Run the source publication barrier and exact final restore**

Feed all eight lane results to `source-publication-barrier.js`. Resolve the final local `dev` SHA, then run:

```bash
bash scripts/restore-generated-state.sh --exact --ref "$final_source_sha"
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
```

Expected: barrier PASS, exact restore PASS, both inventory commands PASS.

- [ ] **Step 6: Replay the complete schema-v2 handoff**

Build the exact source-publication map from the replay lane receipts, bind the local final source SHA as `targetBaselineSha`, run `translation-handoff.js`, and validate all reachable commits and ancestry in the replay repository.

Expected: 13 selected units for `locale=all, group=all`, with no tooling/content SHA comparison.

- [ ] **Step 7: Replay all Japanese and Chinese SDK preparation/publication units**

For `python`, `java`, `node`, `go`, `cli`, and `rest`:

1. materialize the exact source checkpoint and target baseline;
2. run the group source delta from baseline to checkpoint;
3. build the shared-engine manifest for `ja-JP` and `zh-CN-reference`;
4. require zero unapproved retirements before any agent stub;
5. apply the retained real translation checkpoint artifacts where available, or verify `no_changes` when the exact manifest is empty;
6. validate each target/group with `validate-group.js`;
7. publish only to the local bare remote.

Replay `reference-landings` as the final Chinese Reference unit and prove `python.md` is present and never retired.

- [ ] **Step 8: Preflight and replay all eleven Japanese Guides batches**

Use the real locale-qualified artifacts under `/private/tmp/zdoc-guides-publisher-91473491454.jvB4Sp/downloads`. Run the new pairing helper for `target=ja-JP`, `group=guides`, `runId=30738338949`, and `batchCount=11`. Preflight all 22 archives, extract beneath the private replay root, validate every result/baseline pair, create the batch-set plan, apply batches to a detached staging worktree, and commit each nonempty batch with `--no-renames` path comparison.

Expected: exactly 11 ordered pairs, source authority PASS, 106 validated paths equal 106 staged paths, and no unexpected artifact directory.

- [ ] **Step 9: Run combined Guides validation and local promotion**

Push the deterministic staging ref only to the local bare remote. Run `validate-guides-translation-staging.js` and require seven successful receipts, including:

```text
content/en/guides MDX
content/en/byoc MDX
Japanese SaaS MDX
Japanese BYOC MDX
sidebars
coverage 651/651
full Japanese site build and link check
```

Promote the exact validated staging SHA to local `dev` with a normal fast-forward push, then delete the staging ref with lease.

- [ ] **Step 10: Restore and validate the final translated dev state**

```bash
bash scripts/restore-generated-state.sh --exact --ref "$final_translation_sha"
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
pnpm docs-tooling validate-reference --site zh-CN
node scripts/validate-translated-coverage.js --group guides
node scripts/run-doc-build-stage.js --build 'pnpm run build' --skipCardReporting
```

Expected: every command exits 0. Pre-existing warnings may be recorded but cannot replace a failed exit status.

- [ ] **Step 11: Replay card collection with isolated locale reports**

Restore English reports under `$replay_root/card-reports/en` and Chinese reports under `$replay_root/card-reports/zh-CN`. Run `collect-build-card-notes.js` with both expected flags enabled.

Expected: exactly nine notes — one workflow summary, four English Guides sections, four Chinese Guides sections — and no `Unavailable` section.

- [ ] **Step 12: Preserve replay evidence and stop on any missing gate**

Write `$replay_root/replay-summary.json` containing tooling SHA, initial/final local dev SHAs, all lane statuses, all unit statuses, 11 Guides pair identities, validation receipts, coverage count, build/link exit status, and card note count. Do not report later phases as evidence if an earlier phase failed.

### Task 9: Commit, push, and run online validation only after local completion

**Files:**

- Verify: repository worktree and complete replay summary.
- External state: `origin/master`, GitHub Actions `fetch-docs.yml`, downstream `translate-codex.yml`.

- [ ] **Step 1: Review the final diff and preserve unrelated work**

```bash
git status --short
git diff --check
git diff --stat origin/master...HEAD
git log --oneline origin/master..HEAD
```

Confirm the original four uncommitted files are now intentionally included in the relevant implementation commits, no generated documentation mass-change is present, and `zdoc_cn` is untouched.

- [ ] **Step 2: Run the complete local verification gate once more**

```bash
pnpm test:workflow-policy
pnpm test:translation
pnpm exec vitest run packages/docs-tooling/src
actionlint .github/workflows/fetch-docs.yml \
  .github/workflows/translate-codex.yml \
  .github/workflows/_prepare-translation-batches.yml \
  .github/workflows/_translate-content-group.yml \
  .github/workflows/_publish-content-group.yml \
  .github/workflows/_publish-translation-batches.yml
```

Expected: all commands PASS and the Task 8 replay summary is complete.

- [ ] **Step 3: Push the reviewed master commits**

```bash
git push origin master
```

Do not push if any local gate is incomplete.

- [ ] **Step 4: Dispatch online source plus translation validation**

```bash
gh workflow run fetch-docs.yml \
  --repo zilliztech/zdoc \
  --ref master \
  -f group=all \
  -f target_branch=dev \
  -f publish=true \
  -f run_translations=true \
  -f tooling_ref=master \
  -f source_ref=dev
```

- [ ] **Step 5: Monitor the source run to terminal completion**

Require all eight source producers/publishers, source barrier, handoff preparation, downstream dispatch, final verification, aggregate, and card finalization to reach terminal success. Record the run URL, source handoff artifact/JSON, and downstream run ID.

- [ ] **Step 6: Monitor every downstream translation job**

Watch all SDK producers/publishers and all eleven Guides batches. For `publish_ja_guides / publish`, inspect:

```text
locale-qualified artifact pairing
source authority
11 batch identities
106/106 staging comparison
seven combined validation receipts
staging promotion
leased cleanup
```

Any failure is investigated from exact logs and artifacts before another code change.

- [ ] **Step 7: Preserve terminal online evidence**

Save run URLs, job IDs, terminal conclusions, handoff JSON, publication reports, validation receipts, and card JSON. Completion requires both workflows terminal-success and the final card containing nine notes with no `Unavailable` section.

## Self-review against the approved design

- Spec coverage: Tasks 1-4 implement identity separation, one candidate engine, exact retirement authority, and master-owned policy; Tasks 5-6 repair all four Guides faults; Tasks 7-9 enforce fail-early/fail-closed behavior, full local replay, and gated online validation.
- Existing worktree safety: the four pre-existing modified files are explicitly preserved and assigned to Task 2.
- Type consistency: the plan uses `sourceBaselineSha`, `sourceCheckpointSha`, `targetBaselineSha`, and `changeKind` consistently from handoff through manifests, batch input, policy matching, and replay evidence.
- Scope: deprecated `zdoc_cn`, translation prompts/models, and unrelated content ownership remain excluded.
