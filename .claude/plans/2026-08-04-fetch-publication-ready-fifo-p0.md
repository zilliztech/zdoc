# Fetch Publication Ready-FIFO P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Before edits, use `superpowers:using-git-worktrees`; use `superpowers:test-driven-development` for every code stage and `superpowers:verification-before-completion` before claiming any gate. Steps use checkbox (`- [ ]`) syntax for tracking. Do not use subagents for this plan.

**Goal:** Replace the fixed Fetch publisher chain with one checkpoint-only, single-Git-writer coordinator that publishes all eight selected Fetch units in trusted producer-completion FIFO order, while preserving the schema-v2 Translation handoff, validation strength, exact nine-note Fetch report, and safe rollback to the legacy chain.

**Architecture:** `prepare` emits an immutable Fetch selection. Each selected producer uploads its existing checkpoint plus a bound ready descriptor. A single `publish_ready` job polls the current run/attempt Jobs and Artifacts APIs, validates candidates, orders them by `producer.completed_at ASC, unitKey ASC`, invokes one extracted checkpoint transaction at a time, emits immutable progress snapshots, and uploads canonical results. Barrier, handoff, verification, aggregate, and card monitoring consume validated results/progress; the legacy reusable publisher remains present so reverting the final cutover commit restores the fixed chain.

**Tech Stack:** GitHub Actions reusable workflows, Node.js 22/CommonJS, `node:test`, `js-yaml`, `@actions/artifact`, Git/temporary worktrees, GitHub CLI/API, pnpm, existing checkpoint and docs validation tooling.

---

## Governing documents and hard boundaries

- Governing P0 specification: `.claude/specs/2026-08-04-fetch-publication-ready-fifo-p0-design.md`.
- Background architecture only: `.claude/specs/2026-08-04-fetch-translation-publication-fifo-design.md`; the P0 document overrides its shadow-migration sequence.
- Implement exactly these units, all with `strategy: checkpoint`:

```text
source/java
source/node
source/go
source/cli
source/rest
source/python
source/guides-en
source/guides-zh-CN
```

- Preserve the current Fetch input boundary: `all` or one existing source group. `guides` selects both Guides units. Do not add multi-group selection.
- Keep Translation handoff `schemaVersion: 2`; do not create schema v3.
- Do not modify `translate-codex.yml`, Translation producer/publisher behavior, Japanese Guides, reconciliation, or Translation cards.
- Do not delete `_publish-content-group.yml`, `publish-checkpoint.sh`, or other legacy publisher implementation in P0.
- Do not touch `scripts/doc-publish-bot/**`, `migration/reports/**`, Jenkins/deployment/release/image contracts, deprecated `zdoc_cn`, or unrelated workflows.
- Keep `.claude/specs/2026-08-03-fetch-docs-multi-group-selection.md` and every unrelated/untracked `.claude/plans/*` or `.claude/specs/*` read-only and out of all commits.

## Baseline decision gate before implementation

The plan commit will be on local `master`, which is currently ahead of and behind `origin/master`. Worktree creation must not silently choose how to reconcile that divergence.

- [ ] Run the worktree skill and inspect the exact base:

```bash
cd /Users/anthony/Documents/projects/zdoc
git status --short --branch
git log --oneline --decorate -8
git merge-base --is-ancestor f6dd64880 HEAD
PLAN_COMMIT=$(git rev-parse HEAD)
read AHEAD BEHIND <<EOF
$(git rev-list --left-right --count master...origin/master)
EOF
printf 'plan_commit=%s ahead=%s behind=%s\n' "$PLAN_COMMIT" "$AHEAD" "$BEHIND"
```

Expected now: the P0 spec is an ancestor, the plan is at `HEAD`, and the divergence remains nonzero.

- [ ] If `BEHIND` is nonzero, stop and ask the user which approved base to use. Do not rebase, merge, reset, cherry-pick, or rewrite existing commits without that decision.
- [ ] After the user resolves the base, require the chosen base commit to contain both `f6dd64880` and this plan, then create exactly:

```bash
git worktree add .claude/worktrees/fetch-publication-fifo-p0 -b codex/fetch-publication-fifo-p0 "$APPROVED_BASE_COMMIT"
cd .claude/worktrees/fetch-publication-fifo-p0
git status --short --branch
```

Expected: branch `codex/fetch-publication-fifo-p0`, clean worktree, and no implementation edits in the main worktree.

## File map

### New focused modules

- Create `scripts/docs-workflow/publication-contracts.js`: exact schema-v1 validators, canonical serialization/checksums, artifact naming, and safe JSON file I/O for selection, ready, progress, and results.
- Create `scripts/docs-workflow/publication-contracts.test.js`: exact-key, canonicalization, checksum, identity, transition, and mode-dependent invariant tests.
- Create `scripts/docs-workflow/fetch-publication-selection.js`: canonical eight-unit Fetch selection builder and producer ready-descriptor CLI.
- Create `scripts/docs-workflow/fetch-publication-selection.test.js`: `all`, single-group, Guides pair, artifact names, validation commands, and `ZDOC_SITE=zh-CN` tests.
- Create `scripts/docs-workflow/publication-scheduler.js`: pure current-attempt producer resolution and ready-FIFO state machine.
- Create `scripts/docs-workflow/publication-scheduler.test.js`: FIFO, tie, settling, continuation, single-active, artifact-only, and unsafe-stop tests.
- Create `scripts/docs-workflow/publication-github-client.js`: paginated Jobs/Artifacts reads, safe artifact download, and official `@actions/artifact` progress/results upload adapter.
- Create `scripts/docs-workflow/publication-github-client.test.js`: pagination, current-attempt filtering, artifact identity, archive safety, revision naming, and upload-failure behavior.
- Create `scripts/docs-workflow/checkpoint-publication.js`: callable checkpoint transaction core with structured results, CAS drift retry, and ambiguous-push probing.
- Create `scripts/docs-workflow/checkpoint-publication.test.js`: integration and injected Git/probe tests for validation, idempotence, retry, exact/descendant probe success, known failure, and unknown remote state.
- Create `scripts/docs-workflow/publication-coordinator.js`: Fetch coordinator CLI, sequential handler loop, immutable snapshots, canonical results, and GitHub outputs.
- Create `scripts/docs-workflow/publication-coordinator.test.js`: end-to-end in-memory orchestration tests and ordinary-failure/unsafe-stop semantics.
- Create `scripts/docs-workflow/fetch-publication-results.js`: Fetch-specific selection/results projections for barrier, handoff, verification, aggregate, and card consumers.
- Create `scripts/docs-workflow/fetch-publication-results.test.js`: selected-unit coverage, Guides rules, source checkpoint mapping, final ancestry, and partial-success tests.
- Create `scripts/docs-workflow/replay-fetch-publication-fifo.js`: retained-run inspection, canonical/FIFO local bare-remote replay, evidence manifest, and fault-injection entrypoints.
- Create `scripts/docs-workflow/replay-fetch-publication-fifo.test.js`: CLI/options, identical-tree, evidence completeness, and fault-injection assertions.

### Existing implementation to modify

- Modify `package.json` and `pnpm-lock.yaml`: add the pinned official `@actions/artifact` client used inside the coordinator.
- Modify `scripts/docs-workflow/publish-checkpoint.sh`: keep the legacy CLI/output contract while delegating the transaction to `checkpoint-publication.js`.
- Modify `scripts/docs-workflow/publish-checkpoint.test.js`: keep all existing behavior and add ambiguous-push coverage through the compatibility wrapper.
- Modify `.github/workflows/_fetch-content-group.yml`: accept immutable selection identity and upload one ready descriptor after the checkpoint upload.
- Modify `.github/workflows/_assemble-guides.yml`: do the same for English and Chinese Guides after checkpoint/report production, preserving site-qualified artifacts.
- Modify `scripts/docs-workflow/source-publication-barrier.js` and `.test.js`: consume selection/results instead of fixed publisher environment variables.
- Modify `scripts/docs-workflow/translation-handoff.js` and `.test.js`: derive schema-v2 source publications and `targetBaselineSha` from Fetch results.
- Modify `.github/workflows/_verify-docs.yml`: download/validate results, verify successful unit ancestry, and restore `finalTargetSha`.
- Modify `scripts/docs-workflow/build-aggregate-input.js`, `aggregate-results.js`, and their tests: project canonical results into existing group-level terminal reporting.
- Modify `scripts/docs-workflow/docs-progress-state.js` and `.test.js`: remove the fixed predecessor map and render canonical business order with FIFO state details.
- Modify `scripts/docs-workflow/monitor-docs-progress.js` and `.test.js`: select the highest valid progress revision, retain stale fallback, and keep one Feishu writer.
- Modify `.github/workflows/_monitor-docs-progress.yml`: pass run attempt and selection identity needed to authenticate progress artifacts.
- Modify `.github/workflows/fetch-docs.yml`: emit selection, pass descriptor identity to producers, add `publish_ready`, switch consumers, remove fixed publisher/`resolve_final` wiring, and retain the current dispatch/card boundary.
- Modify `scripts/validate-workflow-policy.js` and `.test.js`: enforce one Git writer, no fixed chain, ready descriptors, results consumers, schema-v2 barrier, permissions, exclusions, and temporary-canary cleanup.
- Modify `scripts/collect-build-card-notes.test.js` only if the results-based workflow summary changes fixtures; do not change the exact nine-note collector contract.

## Canonical contract shapes

Use these exact document identities and field names throughout all tasks. Canonical JSON sorts object keys recursively, preserves array order, uses UTF-8, and ends with one newline. `selectionSha256` is SHA-256 over the canonical selection with the `selectionSha256` field omitted.

```js
const DOCUMENTS = Object.freeze({
  selection: 'publication-selection',
  ready: 'publication-ready',
  progress: 'publication-progress',
  results: 'publication-results',
})

const UNIT_STATES = Object.freeze([
  'producing', 'candidate', 'ready', 'publishing',
  'producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed',
])

const RESULT_STATUSES = Object.freeze([
  'ready', 'producer_failed', 'candidate_rejected', 'published', 'no_changes', 'publish_failed',
])
```

Selection root:

```json
{
  "schemaVersion": 1,
  "document": "publication-selection",
  "workflow": "fetch",
  "repository": "owner/repository",
  "runId": 123,
  "runAttempt": 1,
  "toolingSha": "0123456789abcdef0123456789abcdef01234567",
  "targetBranch": "dev",
  "initialTargetSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceBaselineSha": "0123456789abcdef0123456789abcdef01234567",
  "inputs": {"selectedGroup":"all","publish":true,"runTranslations":false},
  "units": [],
  "selectionSha256": "64-lowercase-hex"
}
```

Each selection unit has exact keys:

```json
{
  "unitKey": "source/guides-zh-CN",
  "producerJob": "produce_zh_guides",
  "strategy": "checkpoint",
  "site": "zh-CN",
  "group": "guides",
  "translationSourceGroup": null,
  "toolingSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceBaselineSha": "0123456789abcdef0123456789abcdef01234567",
  "targetBranch": "dev",
  "artifacts": {"checkpoint":"docs-checkpoint-guides-zh-CN-123","baseline":null},
  "commitMessage": "docs(guides): publish fetched content",
  "validationCommands": [
    "node scripts/validate-generated-sidebars.js --site zh-CN",
    "pnpm run build:zh-CN:site"
  ],
  "environment": {"ZDOC_SITE":"zh-CN"}
}
```

Ready descriptor root:

```json
{
  "schemaVersion": 1,
  "document": "publication-ready",
  "workflow": "fetch",
  "repository": "owner/repository",
  "runId": 123,
  "runAttempt": 1,
  "selectionSha256": "64-lowercase-hex",
  "unitKey": "source/java",
  "producerJob": "produce_java",
  "toolingSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceBaselineSha": "0123456789abcdef0123456789abcdef01234567",
  "targetBranch": "dev",
  "artifacts": {
    "checkpoint": {
      "name": "docs-checkpoint-java-123",
      "archiveSha256": "64-lowercase-hex",
      "manifestSha256": "64-lowercase-hex"
    },
    "baseline": null
  },
  "outcome": "candidate"
}
```

Progress snapshots use `publication-progress-fetch-<run-id>-<run-attempt>-<revision>` and contain canonical unit order, monotonic `revision`, `activeUnitKey`, FIFO `queue`, and current unit facts. Results use `publication-results-fetch-<run-id>-<run-attempt>` and contain canonical unit order plus actual `sequence` values.

## Commit boundary 1: contracts, selection, scheduler, and GitHub adapter

### Task 1: Define and test the four schema-v1 publication documents

**Files:**
- Create: `scripts/docs-workflow/publication-contracts.js`
- Create: `scripts/docs-workflow/publication-contracts.test.js`

- [ ] **RED: write exact contract tests first.** Cover exact root/unit keys, independent `schemaVersion: 1`, forbidden unknown keys, run/repository/attempt mismatches, lowercase SHAs/checksums, unique units/artifacts, canonical unit order, monotonic progress revision, mode-dependent result statuses, successful `resultSha`, structured failures, and `orchestrator_failed` requiring an orchestrator failure object.

Include assertions equivalent to:

```js
test('all four publication documents start independently at schemaVersion 1', () => {
  assert.equal(validatePublicationSelection(selection()).schemaVersion, 1)
  assert.equal(validatePublicationReady(ready()).schemaVersion, 1)
  assert.equal(validatePublicationProgress(progress()).schemaVersion, 1)
  assert.equal(validatePublicationResults(results()).schemaVersion, 1)
})

test('selection checksum excludes only selectionSha256 and is canonical', () => {
  const first = finalizePublicationSelection(selection({inputs: {publish: true, runTranslations: false, selectedGroup: 'all'}}))
  const second = finalizePublicationSelection(selection({inputs: {selectedGroup: 'all', runTranslations: false, publish: true}}))
  assert.equal(first.selectionSha256, second.selectionSha256)
})
```

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/publication-contracts.test.js
```

Expected: `MODULE_NOT_FOUND` for `publication-contracts.js`.

- [ ] **GREEN: implement strict validators and canonical file helpers.** Export exactly:

```js
module.exports = {
  artifactNames,
  canonicalJson,
  finalizePublicationSelection,
  readPublicationDocument,
  unitToken,
  validatePublicationProgress,
  validatePublicationReady,
  validatePublicationResults,
  validatePublicationSelection,
  writePublicationDocument,
}
```

`artifactNames({workflow:'fetch', runId, runAttempt, unitKey, revision})` generates the four approved artifact families and rejects unsafe unit tokens. `writePublicationDocument` uses exclusive temporary creation plus atomic rename and leaves a trailing newline.

The module CLI exposes only strict validation commands used by replay/canary evidence:

```text
validate-selection <publication-selection.json>
validate-ready <publication-ready.json>
validate-progress <publication-progress.json>
validate-results <publication-results.json>
```

- [ ] **Run GREEN and refactor verification.**

```bash
node --test scripts/docs-workflow/publication-contracts.test.js
git diff --check
```

Expected: all contract tests pass; no whitespace errors.

### Task 2: Build immutable Fetch selection and producer descriptors

**Files:**
- Create: `scripts/docs-workflow/fetch-publication-selection.js`
- Create: `scripts/docs-workflow/fetch-publication-selection.test.js`

- [ ] **RED: lock the canonical selection.** Assert the exact `all` order below and prove runtime order is not derived from it:

```js
const FETCH_UNIT_KEYS = [
  'source/java', 'source/node', 'source/go', 'source/cli',
  'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
]
```

Add tests that `guides` selects the last two units, an SDK group selects one unit, unsupported/multi-group input fails, producer jobs are `produce_java`, `produce_node`, `produce_go`, `produce_cli`, `produce_rest`, `produce_python`, `produce_guides`, and `produce_zh_guides`, and all artifacts are run-scoped.

Add this Chinese ownership assertion:

```js
const chinese = buildFetchPublicationSelection(input()).units.find(unit => unit.unitKey === 'source/guides-zh-CN')
assert.deepEqual(chinese.environment, {ZDOC_SITE: 'zh-CN'})
assert.deepEqual(chinese.validationCommands, [
  'node scripts/validate-generated-sidebars.js --site zh-CN',
  'pnpm run build:zh-CN:site',
])
```

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/fetch-publication-selection.test.js
```

Expected: missing module failure.

- [ ] **GREEN: implement two CLI modes.**

```text
node scripts/docs-workflow/fetch-publication-selection.js selection --output <file>
node scripts/docs-workflow/fetch-publication-selection.js ready --selection <file> --unit-key <key> --archive <checkpoint-group.tar> --manifest <manifest.json> --output <file>
```

`selection` reads repository/run/attempt/tooling/target/source/input facts from explicit flags or named environment variables and writes the finalized selection. `ready` revalidates the selected unit, hashes the immutable tar and manifest, derives `candidate` versus `no_changes_candidate` from the validated checkpoint manifest, and refuses to redefine selection facts.

- [ ] **Run GREEN and CLI tests.**

```bash
node --test scripts/docs-workflow/publication-contracts.test.js scripts/docs-workflow/fetch-publication-selection.test.js
node scripts/docs-workflow/fetch-publication-selection.js --help
git diff --check
```

Expected: tests pass and help lists only `selection` and `ready`.

### Task 3: Implement the pure trusted FIFO scheduler

**Files:**
- Create: `scripts/docs-workflow/publication-scheduler.js`
- Create: `scripts/docs-workflow/publication-scheduler.test.js`

- [ ] **RED: add state-machine tests.** Cover `producer.completed_at ASC`, `unitKey ASC`, and these cases:

- current run attempt wins over prior attempts;
- an earlier completed producer with a settling descriptor blocks a later completed producer;
- a still-running producer does not block a completed ready producer;
- equal timestamps use lexical `unitKey`;
- producer failure/cancel/skip becomes `producer_failed` and the queue continues;
- exhausted descriptor/preflight settling becomes `candidate_rejected` and the queue continues;
- only one unit can be `publishing`;
- ordinary `publish_failed` continues;
- unsafe remote state returns `orchestrator_failed` and no further publish decision;
- artifact-only mode reaches terminal `ready` results without a publish action.

Use a deterministic clock and this public API:

```js
const scheduler = createPublicationScheduler({selection, maxCandidatePolls: 6})
scheduler.observeJobs(jobs)
scheduler.observeCandidate(unitKey, candidateResult)
const decision = scheduler.nextDecision()
scheduler.startPublication(unitKey, facts)
scheduler.finishPublication(unitKey, transactionResult)
const snapshot = scheduler.snapshot()
```

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/publication-scheduler.test.js
```

Expected: missing module failure.

- [ ] **GREEN: implement immutable snapshots and terminal result projection.** `snapshot()` returns a new deeply frozen value in canonical unit order. Queue positions are derived only from trusted completed jobs whose candidate is valid. Descriptor timestamps never participate in ordering.

- [ ] **Run GREEN and deterministic checks.**

```bash
node --test scripts/docs-workflow/publication-scheduler.test.js
node --test --test-reporter=spec scripts/docs-workflow/publication-scheduler.test.js
git diff --check
```

Expected: all scheduler tests pass twice with the same sequence.

### Task 4: Add the GitHub Jobs/Artifacts adapter and official artifact uploader

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `scripts/docs-workflow/publication-github-client.js`
- Create: `scripts/docs-workflow/publication-github-client.test.js`

- [ ] **RED: write adapter tests with injected `fetch` and artifact client.** Require paginated Jobs API reads with `filter=all`, exact run/attempt/repository filtering, non-expired artifact selection, bounded API-settling retries, zip traversal/symlink rejection, descriptor/file uniqueness, progress artifact names matching revisions, results upload being required, and progress upload being best effort.

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/publication-github-client.test.js
```

Expected: missing module failure.

- [ ] **GREEN: add the official artifact package and implement the adapter.**

```bash
pnpm add @actions/artifact@2.3.2 --save-exact
```

Export `createPublicationGitHubClient({token, repository, runId, runAttempt, fetchImpl, artifactClient, runnerTemp, sleep})`. The default `artifactClient` comes from `@actions/artifact`; tests inject a fake. Keep all API errors bounded and sanitize messages before storing them in failure objects.

- [ ] **Run GREEN, dependency, and type boundary checks.**

```bash
node --test scripts/docs-workflow/publication-github-client.test.js
pnpm test:typescript-runtime-boundary
pnpm typecheck
git diff --check
```

Expected: all pass.

- [ ] **Commit boundary 1.**

```bash
git add package.json pnpm-lock.yaml \
  scripts/docs-workflow/publication-contracts.js \
  scripts/docs-workflow/publication-contracts.test.js \
  scripts/docs-workflow/fetch-publication-selection.js \
  scripts/docs-workflow/fetch-publication-selection.test.js \
  scripts/docs-workflow/publication-scheduler.js \
  scripts/docs-workflow/publication-scheduler.test.js \
  scripts/docs-workflow/publication-github-client.js \
  scripts/docs-workflow/publication-github-client.test.js
git diff --cached --name-only
git commit -m "feat(fetch): define publication FIFO contracts"
```

Expected staged paths: exactly the ten paths above.

## Commit boundary 2: checkpoint transaction, coordinator, and replay harness

### Task 5: Extract a structured checkpoint publication transaction

**Files:**
- Create: `scripts/docs-workflow/checkpoint-publication.js`
- Create: `scripts/docs-workflow/checkpoint-publication.test.js`
- Modify: `scripts/docs-workflow/publish-checkpoint.sh`
- Modify: `scripts/docs-workflow/publish-checkpoint.test.js`
- Reuse unchanged: `scripts/docs-workflow/preflight-checkpoint-archive.js`
- Reuse unchanged: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Reuse unchanged: `scripts/docs-workflow/apply-checkpoint-artifact.js`
- Reuse unchanged: `scripts/docs-workflow/checkpoint-stage-paths.js`

- [ ] **RED: add structured transaction tests.** The returned object has:

```js
{
  status: 'published' | 'no_changes' | 'publish_failed',
  baseSha,
  resultSha,
  commitShas,
  attempts,
  failure: null | {code, phase, message, retryable},
  remoteState: 'known' | 'unknown',
}
```

Test latest-tip composition, existing three-way apply behavior, exact validation commands, scoped staging, no-change SHA, normal commit metadata, non-fast-forward recomposition, retry exhaustion, cleanup, and `ZDOC_SITE=zh-CN` propagation.

Add injected ambiguous-push cases:

```text
push reports error, remote equals candidate            -> published
push reports error, remote contains candidate          -> published
push reports error, remote known without candidate     -> retryable/terminal unit failure
push reports error, all bounded probes fail            -> remoteState=unknown
```

- [ ] **Run RED against new and existing publisher suites.**

```bash
node --test scripts/docs-workflow/checkpoint-publication.test.js scripts/docs-workflow/publish-checkpoint.test.js
```

Expected: missing module or new ambiguous-probe assertion failures; pre-existing publisher assertions remain visible.

- [ ] **GREEN: implement the transaction without weakening preflight or ownership.** The transaction:

1. accepts only an already preflighted/extracted checkpoint directory and trusted selection unit;
2. calls `validateCheckpointArtifact` again after extraction;
3. fetches the exact current target tip;
4. applies through `applyCheckpointArtifact` in detached publication and tooling-validation worktrees;
5. runs every trusted `validationCommands` entry under the unit `environment`;
6. stages only `checkpoint-stage-paths` output and verifies it;
7. creates a normal commit when needed;
8. pushes without force;
9. probes after every push error before deciding retry/failure/unsafe state;
10. cleans every temporary worktree and scratch path.

Keep `publish-checkpoint.sh` as a compatibility wrapper that maps structured JSON back to exactly one legacy `status=` and `commit_sha=` pair. Do not remove its CLI flags.

- [ ] **Run GREEN and regression suites.**

```bash
node --test \
  scripts/docs-workflow/preflight-checkpoint-archive.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/apply-checkpoint-artifact.test.js \
  scripts/docs-workflow/checkpoint-stage-paths.test.js \
  scripts/docs-workflow/checkpoint-contention.test.js \
  scripts/docs-workflow/checkpoint-publication.test.js \
  scripts/docs-workflow/publish-checkpoint.test.js
git diff --check
```

Expected: all pass; existing shell compatibility tests remain green.

### Task 6: Implement the single-writer coordinator

**Files:**
- Create: `scripts/docs-workflow/publication-coordinator.js`
- Create: `scripts/docs-workflow/publication-coordinator.test.js`

- [ ] **RED: test full orchestration with fakes.** Cover all eight selected units, earlier descriptor settling, lexical ties, one active handler, ordinary failure continuation, progress upload failure continuation, mandatory results upload, artifact-only zero-handler mode, final target SHA propagation, and unknown remote state stopping later handlers.

Add this critical call-order assertion:

```js
assert.deepEqual(publishedUnitKeys, [
  'source/rest',
  'source/java',
  'source/guides-en',
])
assert.equal(Math.max(...observedConcurrentHandlers), 1)
```

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/publication-coordinator.test.js
```

Expected: missing module failure.

- [ ] **GREEN: implement the coordinator CLI.**

```text
node scripts/docs-workflow/publication-coordinator.js \
  --selection <publication-selection.json> \
  --mode <artifact_only|publish> \
  --poll-milliseconds 10000 \
  --candidate-polls 6 \
  --max-publish-attempts 10
```

The process uploads a snapshot after every meaningful state transition, catches and records snapshot upload failures without failing publication, uploads one validated results artifact, writes `results_artifact_name`, `overall_status`, and `final_target_sha` to `GITHUB_OUTPUT`, then exits nonzero only after results are safely uploaded when overall status is not `success`.

- [ ] **Run GREEN and verify no parallel handler path exists.**

```bash
node --test scripts/docs-workflow/publication-coordinator.test.js
rg -n 'Promise\.all|allSettled|worker|concurrency' scripts/docs-workflow/publication-coordinator.js
git diff --check
```

Expected: tests pass; any concurrency match is limited to non-publication reads and not handler invocation.

### Task 7: Build the retained-artifact replay harness before workflow cutover

**Files:**
- Create: `scripts/docs-workflow/replay-fetch-publication-fifo.js`
- Create: `scripts/docs-workflow/replay-fetch-publication-fifo.test.js`

- [ ] **RED: test CLI and evidence invariants.** Require exactly eight checkpoint artifacts, preflight before extraction, one common recorded baseline, branches `canonical/dev` and `fifo/dev`, fixed canonical order, trusted FIFO order, final tree equality, complete evidence, and no remote other than the explicit local bare remote.

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/replay-fetch-publication-fifo.test.js
```

Expected: missing module failure.

- [ ] **GREEN: implement these exact subcommands.**

```text
inspect-run --run-id <id> --output-root <dir>
replay --run-root <dir> --bare-remote <path> --evidence-root <dir>
fault-inject --run-root <dir> --scenario <name> --evidence-root <dir>
verify-evidence --evidence-root <dir>
```

The harness calls production modules rather than reimplementing contract/scheduler/transaction logic. It may invoke the unchanged legacy wrapper for `canonical/dev`, and invokes the new structured transaction in trusted FIFO order for `fifo/dev`.

- [ ] **Run GREEN.**

```bash
node --test scripts/docs-workflow/replay-fetch-publication-fifo.test.js
git diff --check
```

Expected: all harness tests pass.

- [ ] **Commit boundary 2.**

```bash
git add \
  scripts/docs-workflow/checkpoint-publication.js \
  scripts/docs-workflow/checkpoint-publication.test.js \
  scripts/docs-workflow/publish-checkpoint.sh \
  scripts/docs-workflow/publish-checkpoint.test.js \
  scripts/docs-workflow/publication-coordinator.js \
  scripts/docs-workflow/publication-coordinator.test.js \
  scripts/docs-workflow/replay-fetch-publication-fifo.js \
  scripts/docs-workflow/replay-fetch-publication-fifo.test.js
git diff --cached --name-only
git commit -m "feat(fetch): add checkpoint FIFO coordinator"
```

Expected staged paths: exactly the eight paths above.

## Commit boundary 3: producer ready descriptors

### Task 8: Emit one bound ready descriptor from every Fetch producer

**Files:**
- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **RED: add workflow-policy tests first.** Assert both reusable producer workflows require `publication_selection_artifact_name`, `publication_selection_sha256`, and `publication_unit_key`, keep `contents: read`, download/validate the exact selection artifact, upload the existing checkpoint first, run the `ready` CLI against that selection plus the exact tar/manifest, and upload the exact run-attempt-scoped descriptor artifact.

Expected artifact names:

```text
publication-ready-fetch-source-java-<run-id>-<run-attempt>
publication-ready-fetch-source-guides-en-<run-id>-<run-attempt>
publication-ready-fetch-source-guides-zh-CN-<run-id>-<run-attempt>
```

Also assert no producer contains `git push`, `contents: write`, Feishu card update commands, or coordinator credentials.

- [ ] **Run RED.**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: descriptor-policy assertions fail against current workflows.

- [ ] **GREEN: add descriptor inputs and upload steps.** Each reusable producer downloads `publication_selection_artifact_name`, validates its checksum and selected unit, and never reconstructs the selection. In `_fetch-content-group.yml`, create the descriptor only after `checkpoint_upload.outcome == 'success'`. In `_assemble-guides.yml`, create it after the locale-qualified checkpoint and reports steps have completed successfully. Reuse the packed `checkpoint-group.tar`; extract only the manifest for hashing through the existing preflight helper or use the already validated manifest path before packaging.

The descriptor upload uses `if-no-files-found: error`, current `github.run_id`, current `github.run_attempt`, and the caller-provided selection checksum/unit key. Producer `status=artifact_ready` requires both checkpoint and descriptor uploads.

- [ ] **Run GREEN and producer regression tests.**

```bash
node --test \
  scripts/docs-workflow/fetch-publication-selection.test.js \
  scripts/docs-workflow/create-checkpoint-artifact.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/validate-workflow-policy.test.js
pnpm test:workflow-policy
git diff --check
```

Expected: all pass.

- [ ] **Commit boundary 3.**

```bash
git add .github/workflows/_fetch-content-group.yml .github/workflows/_assemble-guides.yml \
  scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git diff --cached --name-only
git commit -m "feat(fetch): publish ready descriptors"
```

## Commit boundary 4: results consumers and Fetch card state

### Task 9: Project canonical Fetch results for all downstream consumers

**Files:**
- Create: `scripts/docs-workflow/fetch-publication-results.js`
- Create: `scripts/docs-workflow/fetch-publication-results.test.js`
- Modify: `scripts/docs-workflow/source-publication-barrier.js`
- Modify: `scripts/docs-workflow/source-publication-barrier.test.js`
- Modify: `scripts/docs-workflow/translation-handoff.js`
- Modify: `scripts/docs-workflow/translation-handoff.test.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`
- Modify: `.github/workflows/_verify-docs.yml`

- [ ] **RED: add Fetch result projection tests.** Require exact selection checksum matching, required-unit coverage, canonical order, success status, and result SHA rules. For `guides`, require both locale units but map only `source/guides-en.resultSha` to the schema-v2 translation `sourceCheckpointSha`.

Add this handoff assertion:

```js
const handoff = buildTranslationHandoffFromFetchResults({selection, results, locale: 'all', group: 'all'})
assert.equal(handoff.schemaVersion, 2)
assert.equal(handoff.targetBaselineSha, results.finalTargetSha)
assert.equal(handoff.units.find(unit => unit.sourceGroup === 'guides').sourceCheckpointSha, englishGuidesResultSha)
assert.doesNotMatch(JSON.stringify(handoff), /source\/guides-zh-CN/)
```

Add repository verification tests that every `published`/`no_changes` `resultSha` is an ancestor of `finalTargetSha`, including a known partial final target for failed runs.

- [ ] **Run RED.**

```bash
node --test \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/source-publication-barrier.test.js \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/aggregate-results.test.js
```

Expected: new results-based tests fail while existing schema-v2 tests remain green.

- [ ] **GREEN: implement shared projections and dual-compatible consumers.** `source-publication-barrier.js` gains `--selection` and `--results`; `translation-handoff.js` gains `--fetch-selection` and `--fetch-results`; `build-aggregate-input.js` gains `--publication-selection` and `--publication-results`. Keep existing exported pure functions until the workflow cutover commit so reverting that commit restores the fixed chain without reverting consumer code.

`fetch-publication-results.js` exposes exact verification entrypoints used by replay and canary gates:

```text
verify-documents --selection <publication-selection.json> --results <publication-results.json>
verify-repository --selection <publication-selection.json> --results <publication-results.json> --repository <path>
```

`_verify-docs.yml` downloads both artifacts, validates them, fetches `finalTargetSha`, runs the ancestry verification before restore, then preserves the existing exact commands:

```bash
bash scripts/restore-generated-state.sh --exact --ref "$FINAL_TARGET_SHA"
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
```

- [ ] **Run GREEN and verify schema v2 remains exact.**

```bash
node --test \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/source-publication-barrier.test.js \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/aggregate-results.test.js
rg -n 'schemaVersion[^\n]*3|schema v3' scripts/docs-workflow .github/workflows
git diff --check
```

Expected: all tests pass; no handoff schema-v3 match.

### Task 10: Make the Fetch card consume immutable queue progress

**Files:**
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Modify: `scripts/docs-workflow/docs-progress-state.test.js`
- Modify: `scripts/docs-workflow/monitor-docs-progress.js`
- Modify: `scripts/docs-workflow/monitor-docs-progress.test.js`
- Modify: `.github/workflows/_monitor-docs-progress.yml`
- Modify: `scripts/collect-build-card-notes.test.js` only if fixture wiring changes

- [ ] **RED: replace fixed predecessor expectations with FIFO progress expectations.** Remove assertions for `Waiting for Java publisher`, `Waiting for REST API publisher`, and the `PUBLISH_PREDECESSOR` map. Add exact presentation tests:

```text
Ready - queue position 2
Publishing - FIFO sequence 3 - attempt 1
Published - abcdef1
No changes
Failed - queue continued
```

Prove canonical business order remains Java, Node, Go, CLI, REST, Python, English Guides, Chinese Guides even when sequence is different. Prove a failed unit leaves overall card state `running` while the queue still has active/waiting work. Prove the highest valid progress revision wins and a missing next revision marks progress stale without failing the monitor.

- [ ] **Run RED.**

```bash
node --test scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/monitor-docs-progress.test.js scripts/collect-build-card-notes.test.js
```

Expected: fixed predecessor tests or new progress tests fail.

- [ ] **GREEN: add authenticated progress consumption.** The monitor lists artifacts with prefix `publication-progress-fetch-<run-id>-<run-attempt>-`, validates name/revision/run/attempt/selection checksum, downloads candidates newest-first, retains the highest valid revision, and passes it to `deriveDocsProgressState`. Jobs API remains authoritative for producer state. The final card report artifact remains authoritative for terminal reports.

Keep these ownership rules unchanged:

```text
monitor_docs_progress = only live Feishu writer
finalize_card_fallback = only after monitor unsuccessful
publish_ready = no APP_ID, APP_SECRET, FEISHU_HOST, or card update command
```

- [ ] **Run GREEN and exact nine-note tests.**

```bash
node --test \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/docs-card-report.test.js \
  scripts/collect-build-card-notes.test.js
git diff --check
```

Expected: all pass; full Fetch fixture remains exactly nine notes and contains no `Unavailable` section.

- [ ] **Commit boundary 4.**

```bash
git add \
  scripts/docs-workflow/fetch-publication-results.js \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/source-publication-barrier.js \
  scripts/docs-workflow/source-publication-barrier.test.js \
  scripts/docs-workflow/translation-handoff.js \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/build-aggregate-input.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/aggregate-results.js \
  scripts/docs-workflow/aggregate-results.test.js \
  scripts/docs-workflow/docs-progress-state.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/monitor-docs-progress.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  .github/workflows/_monitor-docs-progress.yml \
  .github/workflows/_verify-docs.yml
git diff --cached --name-only
git commit -m "refactor(fetch): consume publication results"
```

If `scripts/collect-build-card-notes.test.js` changed, inspect and stage it explicitly; never stage it merely to match the file map.

## Commit boundary 5: Fetch workflow cutover and policy

### Task 11: Wire `fetch-docs.yml` to one publication coordinator

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: a previously introduced module and its test only when the final workflow interface exposes a failing contract

- [ ] **RED: replace the fixed-chain policy test.** Assert:

1. `prepare` resolves `initial_target_sha` separately from `source_sha`, writes `publication-selection.json`, uploads `publication-selection-fetch-${{ github.run_id }}-${{ github.run_attempt }}`, and exposes its artifact name/checksum.
2. Every selected producer remains parallel and receives only the immutable selection artifact name, exact unit key, and selection checksum.
3. `publish_ready.needs` is exactly `['prepare']`; it starts before producer completion and polls them through APIs.
4. top-level permissions are `contents: read` and `actions: read`; `publish_ready` is the only job with `contents: write` and the only Fetch job allowed to execute Git publication; `dispatch_translations` has only the job-level `actions: write` escalation required for workflow dispatch.
5. The fixed `publish_java`, `publish_node`, `publish_go`, `publish_cli`, `publish_rest`, `publish_python`, `publish_guides`, `publish_zh_guides`, and `resolve_final` jobs are absent.
6. `source_publication_barrier`, `prepare_translation_handoff`, `verify`, `aggregate`, and monitor wiring consume selection/results/progress artifacts.
7. `prepare_translation_handoff` still builds and validates schema-v2 JSON, writes an evidence file, and uploads `translation-handoff-v2-${{ github.run_id }}-${{ github.run_attempt }}` before any dispatch.
8. Translation dispatch remains behind successful barrier/handoff and still occurs exactly once.
9. `publish_ready` receives no Feishu credentials.
10. no list/multi-group input or `translate-codex.yml` change appears.

- [ ] **Run RED.**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: current fixed-chain assertions fail and new coordinator assertions fail.

- [ ] **GREEN: add selection creation.** In `prepare`, after immutable refs are resolved, fetch and validate the exact target branch tip into `initial_target_sha`; generate the selection using the tooling checkout; upload it before producers are eligible. Do not equate `source_sha` and target tip when an isolated target branch is used.

- [ ] **GREEN: pass exact unit identity to producers.** Keep all current source-production topology. Add only selection artifact name/checksum/unit-key inputs. Guides source/render/assembly topology stays unchanged.

- [ ] **GREEN: add `publish_ready`.** Its job-level permissions are:

```yaml
permissions:
  actions: write
  contents: write
```

It checks out `master_sha` with full history, installs dependencies, downloads and validates the selection artifact, then runs the coordinator in `artifact_only` when `publish != 'true'` and `publish` otherwise. No other job gets Git-write permissions.

Set the caller workflow default to read-only:

```yaml
permissions:
  actions: read
  contents: read
```

Give `dispatch_translations` a job-local `actions: write, contents: read` permission block; do not restore broad top-level write permissions.

- [ ] **GREEN: switch results consumers and remove fixed wiring only.** Remove the fixed publisher job blocks and `resolve_final` from `fetch-docs.yml`; do not delete their reusable workflow or scripts. Update:

```text
source_publication_barrier -> needs [prepare, publish_ready]
prepare_translation_handoff -> needs [prepare, source_publication_barrier, publish_ready]
verify -> needs [prepare, publish_ready]
aggregate -> needs [prepare, publish_ready, prepare_translation_handoff, dispatch_translations, verify]
```

All jobs that must run after a failed queue use `if: ${{ always() ... }}` and fail closed if the results artifact is missing or invalid. Aggregate still downloads English and Chinese Guides report artifacts into isolated directories before card collection.

- [ ] **GREEN: preserve failure semantics.** Ordinary unit failures cause `publish_ready` and final workflow failure only after queue drain; Translation barrier/handoff/dispatch do not run successfully. A valid known partial `finalTargetSha` may still feed final verification diagnostics. `orchestrator_failed` stops all later writes.

- [ ] **Run focused GREEN.**

```bash
node --test \
  scripts/docs-workflow/publication-contracts.test.js \
  scripts/docs-workflow/fetch-publication-selection.test.js \
  scripts/docs-workflow/publication-scheduler.test.js \
  scripts/docs-workflow/publication-coordinator.test.js \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/source-publication-barrier.test.js \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/aggregate-results.test.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/validate-workflow-policy.test.js
pnpm test:workflow-policy
git diff --check
```

Expected: all pass.

- [ ] **Commit boundary 5.**

```bash
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git diff --cached --name-only
git commit -m "feat(fetch): cut over to publication FIFO"
```

If a final interface test required a small change to one already introduced module, stage only that named module and its test after reviewing the diff. This is the rollback commit: reverting it restores the fixed Fetch chain while leaving dormant contracts/descriptors and backward-compatible consumers in place.

## Local automated verification gate

### Task 12: Run the complete local test and static policy suite

**Entry conditions:** five production commits exist; worktree is clean; no canary-only configuration exists.

- [ ] Run focused publication and consumer tests:

```bash
node --test \
  scripts/docs-workflow/publication-contracts.test.js \
  scripts/docs-workflow/fetch-publication-selection.test.js \
  scripts/docs-workflow/publication-scheduler.test.js \
  scripts/docs-workflow/publication-github-client.test.js \
  scripts/docs-workflow/preflight-checkpoint-archive.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/apply-checkpoint-artifact.test.js \
  scripts/docs-workflow/checkpoint-stage-paths.test.js \
  scripts/docs-workflow/checkpoint-contention.test.js \
  scripts/docs-workflow/checkpoint-publication.test.js \
  scripts/docs-workflow/publish-checkpoint.test.js \
  scripts/docs-workflow/publication-coordinator.test.js \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/source-publication-barrier.test.js \
  scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/aggregate-results.test.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/docs-card-report.test.js \
  scripts/docs-workflow/replay-fetch-publication-fifo.test.js \
  scripts/collect-build-card-notes.test.js \
  scripts/validate-workflow-policy.test.js
```

- [ ] Run repository checks:

```bash
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
pnpm typecheck
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
git diff --check
```

- [ ] Run explicit source exclusions:

```bash
BASE_COMMIT=$(git merge-base HEAD "$APPROVED_BASE_COMMIT")
git diff --name-only "$BASE_COMMIT"...HEAD > /tmp/fetch-fifo-p0-paths.txt
if rg -n '^(\.github/workflows/translate-codex\.yml|scripts/doc-publish-bot/|migration/reports/|\.claude/specs/2026-08-03-fetch-docs-multi-group-selection\.md)$' /tmp/fetch-fifo-p0-paths.txt; then
  echo 'Excluded path changed' >&2
  exit 1
fi
if git diff "$BASE_COMMIT"...HEAD -- . ':!.claude/plans/2026-08-04-fetch-publication-ready-fifo-p0.md' | rg -n 'zdoc_cn|schemaVersion[^\n]*3'; then
  echo 'Excluded scope marker found in implementation diff' >&2
  exit 1
fi
```

**Exit conditions:** every command passes; changed paths match the file map; no untracked user plan/spec file is staged.

**Evidence:** terminal logs, `/tmp/fetch-fifo-p0-paths.txt`, `git status --short --branch`, and five commit SHAs.

## Real-artifact replay gate

### Task 13: Inspect two retained successful Fetch runs and replay one complete artifact set twice

Use retained full-run IDs already cited by the approved design as the first evidence candidates:

```text
30873886876
30861599172
```

If either run/artifact set is unavailable, stop and request another retained successful full Fetch run; do not substitute synthetic artifacts for this gate.

- [ ] **Verify both runs and record trusted producer completion order.**

```bash
REPLAY_ROOT=$(mktemp -d /tmp/fetch-publication-fifo-p0.XXXXXX)
node scripts/docs-workflow/replay-fetch-publication-fifo.js inspect-run --run-id 30873886876 --output-root "$REPLAY_ROOT/run-30873886876"
node scripts/docs-workflow/replay-fetch-publication-fifo.js inspect-run --run-id 30861599172 --output-root "$REPLAY_ROOT/run-30861599172"
```

Expected: both evidence roots contain current-attempt Jobs JSON, trusted completion order, tooling SHA, common `devBaselineSha`, exact artifact inventory, and selection reconstruction for all eight units.

- [ ] **Create one local bare remote with two branches seeded at the same baseline.**

```bash
BARE_REMOTE="$REPLAY_ROOT/fetch-publication.git"
git init --bare "$BARE_REMOTE"
BASELINE_SHA=$(node -p 'require(process.argv[1]).devBaselineSha' "$REPLAY_ROOT/run-30873886876/run-metadata.json")
git push "$BARE_REMOTE" "$BASELINE_SHA:refs/heads/canonical/dev"
git push "$BARE_REMOTE" "$BASELINE_SHA:refs/heads/fifo/dev"
```

- [ ] **Replay fixed and FIFO orders through production modules.**

```bash
node scripts/docs-workflow/replay-fetch-publication-fifo.js replay \
  --run-root "$REPLAY_ROOT/run-30873886876" \
  --bare-remote "$BARE_REMOTE" \
  --evidence-root "$REPLAY_ROOT/evidence"
```

Expected:

- all eight `checkpoint-group.tar` files are preflighted before any extraction;
- every lane ends `published` or `no_changes`;
- canonical order is Java, Node, Go, CLI, REST, Python, English Guides, Chinese Guides;
- FIFO order exactly matches Jobs API `completed_at`, then lexical `unitKey`;
- `git rev-parse canonical/dev^{tree}` equals `git rev-parse fifo/dev^{tree}`;
- Chinese Guides transaction environment includes `ZDOC_SITE=zh-CN`.

- [ ] **Run post-publication business validation on the exact FIFO final SHA.** The replay harness executes and retains receipts for:

```bash
bash scripts/restore-generated-state.sh --exact --ref "$FIFO_FINAL_SHA"
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
node scripts/validate-generated-sidebars.js --site en
pnpm run build:en
ZDOC_SITE=zh-CN node scripts/validate-generated-sidebars.js --site zh-CN
ZDOC_SITE=zh-CN pnpm run build:zh-CN:site
```

It also runs the results-based source barrier, generates/validates the unchanged schema-v2 handoff, and collects English/Chinese Guides reports from isolated directories.

- [ ] **Verify exact card and evidence output.**

```bash
node scripts/docs-workflow/replay-fetch-publication-fifo.js verify-evidence --evidence-root "$REPLAY_ROOT/evidence"
node - "$REPLAY_ROOT/evidence/card/card-report.json" <<'NODE'
const fs = require('node:fs')
const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
if (report.reports.length !== 9) throw new Error(`expected 9 notes, got ${report.reports.length}`)
if (/Unavailable/.test(JSON.stringify(report.reports))) throw new Error('card report contains Unavailable')
NODE
```

**Exit conditions:** identical trees, all business validations pass, schema-v2 handoff validates, exact nine notes, and evidence manifest is complete.

**Evidence:** preserve the replay root path, downloaded artifact inventory, preflight logs, both branch SHAs/trees, progress/results JSON, validation/build logs, handoff JSON, and card JSON for review.

## Fault-injection replay gate

### Task 14: Prove continuation and safe-stop semantics with the retained artifact set

Run each named scenario into its own evidence directory:

```bash
for SCENARIO in \
  earliest-descriptor-rejected \
  middle-validation-failure \
  target-advance-once \
  target-advance-exhausted \
  push-error-after-remote-update \
  progress-upload-failure \
  unknown-remote-state \
  handoff-blocked-after-unit-failure
do
  node scripts/docs-workflow/replay-fetch-publication-fifo.js fault-inject \
    --run-root "$REPLAY_ROOT/run-30873886876" \
    --scenario "$SCENARIO" \
    --evidence-root "$REPLAY_ROOT/faults/$SCENARIO"
  node scripts/docs-workflow/replay-fetch-publication-fifo.js verify-evidence \
    --evidence-root "$REPLAY_ROOT/faults/$SCENARIO"
done
```

Required outcomes:

- earliest descriptor/checksum rejection is terminal for that unit and later units publish;
- a middle validation failure records `publish_failed` and later units publish;
- one target advance recomposes and succeeds;
- repeated target drift reaches the retry bound without reporting an unpushed commit;
- push error after actual remote update probes and reports success;
- progress upload failure marks snapshots stale but does not fail publication;
- unknown remote state sets `orchestrator_failed` and later transaction invocation count remains zero;
- any required unit failure blocks schema-v2 handoff generation/dispatch;
- every scenario remote contains only commits listed as successfully published.

**Exit conditions:** all eight scenarios produce expected terminal results and remote/reported-commit consistency.

**Evidence:** per-scenario results, handler call log, remote refs/tree, injected fault manifest, handoff decision, and progress upload log.

## Feature-branch canary gates

### Task 15: Add temporary canary-only Translation suppression and run artifact-only canary

Reuse the existing manual trigger and `target_branch` input. Add only the minimum temporary feature-branch input needed to suppress real Translation dispatch while still running the barrier and schema-v2 handoff preparation. Do not add a production shadow job.

- [ ] Add a temporary boolean input `canary_suppress_translation_dispatch` defaulting to `false`; gate only the real `gh workflow run translate-codex.yml` step and aggregate handoff-request accounting. Keep `prepare_translation_handoff` active when `run_translations=true`.
- [ ] Add policy tests proving the input defaults false, cannot change target selection, and is the only canary-only production-flow difference.
- [ ] Commit the traceable temporary configuration:

```bash
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "chore(canary): suppress downstream translation dispatch"
git push -u origin codex/fetch-publication-fifo-p0
```

- [ ] Seed the dedicated isolated target from the exact current production baseline before artifact-only dispatch. Refuse to reuse an existing branch:

```bash
REPOSITORY=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
FEATURE_SHA=$(git rev-parse HEAD)
DEV_BEFORE=$(gh api "repos/$REPOSITORY/git/ref/heads/dev" --jq .object.sha)
CANARY_BRANCH=codex/fetch-publication-fifo-p0-canary-dev
CANARY_EXISTING=$(gh api "repos/$REPOSITORY/git/ref/heads/$CANARY_BRANCH" --jq .object.sha 2>/dev/null || true)
test -z "$CANARY_EXISTING" || { echo 'Dedicated canary target already exists; stop for operator cleanup' >&2; exit 1; }
CANARY_BASELINE=$DEV_BEFORE
git fetch --no-tags origin "$CANARY_BASELINE"
git push origin "$CANARY_BASELINE:refs/heads/$CANARY_BRANCH"
CANARY_BEFORE=$(gh api "repos/$REPOSITORY/git/ref/heads/$CANARY_BRANCH" --jq .object.sha)
test "$CANARY_BEFORE" = "$CANARY_BASELINE"
```

- [ ] Dispatch artifact-only `all` from the feature branch:

```bash
gh workflow run fetch-docs.yml --ref codex/fetch-publication-fifo-p0 \
  -f group=all \
  -f publish=false \
  -f run_translations=false \
  -f target_branch="$CANARY_BRANCH" \
  -f tooling_ref="$FEATURE_SHA" \
  -f source_ref="$CANARY_BASELINE"
```

- [ ] Locate the run by exact `headSha`, watch it to terminal completion, download selection/progress/results, and validate them:

```bash
ARTIFACT_ONLY_RUN=$(gh run list --workflow fetch-docs.yml --branch codex/fetch-publication-fifo-p0 --event workflow_dispatch --limit 20 --json databaseId,headSha --jq ".[] | select(.headSha == \"$FEATURE_SHA\") | .databaseId" | head -1)
gh run watch "$ARTIFACT_ONLY_RUN" --exit-status
ARTIFACT_ONLY_ATTEMPT=$(gh api "repos/$REPOSITORY/actions/runs/$ARTIFACT_ONLY_RUN" --jq .run_attempt)
gh run download "$ARTIFACT_ONLY_RUN" -n "publication-selection-fetch-$ARTIFACT_ONLY_RUN-$ARTIFACT_ONLY_ATTEMPT" -D "$REPLAY_ROOT/canary-artifact-only/selection"
gh run download "$ARTIFACT_ONLY_RUN" -n "publication-results-fetch-$ARTIFACT_ONLY_RUN-$ARTIFACT_ONLY_ATTEMPT" -D "$REPLAY_ROOT/canary-artifact-only/results"
node scripts/docs-workflow/replay-fetch-publication-fifo.js inspect-run --run-id "$ARTIFACT_ONLY_RUN" --output-root "$REPLAY_ROOT/canary-artifact-only/inspection"
node scripts/docs-workflow/publication-contracts.js validate-selection "$REPLAY_ROOT/canary-artifact-only/selection/publication-selection.json"
node scripts/docs-workflow/publication-contracts.js validate-results "$REPLAY_ROOT/canary-artifact-only/results/publication-results.json"
node scripts/docs-workflow/fetch-publication-results.js verify-documents \
  --selection "$REPLAY_ROOT/canary-artifact-only/selection/publication-selection.json" \
  --results "$REPLAY_ROOT/canary-artifact-only/results/publication-results.json"
```

- [ ] Prove zero Git mutation:

```bash
DEV_AFTER=$(gh api "repos/$REPOSITORY/git/ref/heads/dev" --jq .object.sha)
CANARY_AFTER=$(gh api "repos/$REPOSITORY/git/ref/heads/$CANARY_BRANCH" --jq .object.sha 2>/dev/null || true)
test "$DEV_BEFORE" = "$DEV_AFTER"
test "$CANARY_BEFORE" = "$CANARY_AFTER"
```

**Exit conditions:** all eight descriptors resolve; computed FIFO matches Jobs API; progress/results validate; no branch changes; no Translation dispatch.

### Task 16: Run the isolated-target full `all` canary

- [ ] Reuse the unchanged dedicated branch proven by artifact-only canary; never reset it and never target production `dev`:

```bash
CANARY_START=$(gh api "repos/$REPOSITORY/git/ref/heads/$CANARY_BRANCH" --jq .object.sha)
test "$CANARY_START" = "$CANARY_BASELINE"
DEV_BEFORE_FULL=$(gh api "repos/$REPOSITORY/git/ref/heads/dev" --jq .object.sha)
```

- [ ] Dispatch full publication with handoff validation but real Translation suppression:

```bash
gh workflow run fetch-docs.yml --ref codex/fetch-publication-fifo-p0 \
  -f group=all \
  -f publish=true \
  -f run_translations=true \
  -f canary_suppress_translation_dispatch=true \
  -f target_branch="$CANARY_BRANCH" \
  -f tooling_ref="$FEATURE_SHA" \
  -f source_ref="$CANARY_BASELINE"
```

- [ ] Watch through terminal completion and retain job/artifact evidence:

```bash
FULL_CANARY_RUN=$(gh run list --workflow fetch-docs.yml --branch codex/fetch-publication-fifo-p0 --event workflow_dispatch --limit 20 --json databaseId,headSha,createdAt --jq ".[] | select(.headSha == \"$FEATURE_SHA\") | .databaseId" | head -1)
gh run watch "$FULL_CANARY_RUN" --exit-status
gh api --paginate "repos/$REPOSITORY/actions/runs/$FULL_CANARY_RUN/jobs?filter=all&per_page=100" > "$REPLAY_ROOT/canary-full-jobs.json"
FULL_CANARY_ATTEMPT=$(gh api "repos/$REPOSITORY/actions/runs/$FULL_CANARY_RUN" --jq .run_attempt)
gh run download "$FULL_CANARY_RUN" -n "publication-selection-fetch-$FULL_CANARY_RUN-$FULL_CANARY_ATTEMPT" -D "$REPLAY_ROOT/canary-full/selection"
gh run download "$FULL_CANARY_RUN" -n "publication-results-fetch-$FULL_CANARY_RUN-$FULL_CANARY_ATTEMPT" -D "$REPLAY_ROOT/canary-full/results"
gh run download "$FULL_CANARY_RUN" -n "translation-handoff-v2-$FULL_CANARY_RUN-$FULL_CANARY_ATTEMPT" -D "$REPLAY_ROOT/canary-full/handoff"
gh run download "$FULL_CANARY_RUN" -n "docs-card-report-$FULL_CANARY_RUN" -D "$REPLAY_ROOT/canary-full/card"
node scripts/docs-workflow/replay-fetch-publication-fifo.js inspect-run --run-id "$FULL_CANARY_RUN" --output-root "$REPLAY_ROOT/canary-full/inspection"
```

- [ ] Verify canary acceptance:

```bash
node scripts/docs-workflow/publication-contracts.js validate-results "$REPLAY_ROOT/canary-full/results/publication-results.json"
node scripts/docs-workflow/fetch-publication-results.js verify-documents \
  --selection "$REPLAY_ROOT/canary-full/selection/publication-selection.json" \
  --results "$REPLAY_ROOT/canary-full/results/publication-results.json"
CANARY_FINAL_SHA=$(node -p 'require(process.argv[1]).finalTargetSha' "$REPLAY_ROOT/canary-full/results/publication-results.json")
git fetch --no-tags origin "$CANARY_FINAL_SHA"
node scripts/docs-workflow/fetch-publication-results.js verify-repository \
  --selection "$REPLAY_ROOT/canary-full/selection/publication-selection.json" \
  --results "$REPLAY_ROOT/canary-full/results/publication-results.json" \
  --repository "$PWD"
node scripts/docs-workflow/translation-handoff.js \
  --handoff-json "$(cat "$REPLAY_ROOT/canary-full/handoff/translation-handoff.json")" \
  --repository "$PWD"
node - "$REPLAY_ROOT/canary-full/card/card-report.json" <<'NODE'
const fs = require('node:fs')
const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
if (report.reports.length !== 9) throw new Error(`expected 9 notes, got ${report.reports.length}`)
if (/Unavailable/.test(JSON.stringify(report.reports))) throw new Error('card report contains Unavailable')
NODE
DEV_AFTER_FULL=$(gh api "repos/$REPOSITORY/git/ref/heads/dev" --jq .object.sha)
test "$DEV_BEFORE_FULL" = "$DEV_AFTER_FULL"
```

Also prove from jobs/policy/results that exactly one Git writer existed, actual `sequence` matches producer `completed_at`, each successful unit SHA is an ancestor of the final isolated target, barrier/handoff/verify/aggregate/card succeeded, and no `translate-codex.yml` run was dispatched.

**Exit conditions:** isolated target only changed through reported FIFO commits; production `dev` stayed unchanged; all consumers succeeded; schema-v2 handoff validated; exact nine notes.

## PR-ready cleanup and final verification

### Task 17: Remove all temporary canary configuration and audit the final diff

- [ ] After retaining the full canary evidence, delete the dedicated isolated target branch and prove it is gone:

```bash
git push origin --delete "$CANARY_BRANCH"
if gh api "repos/$REPOSITORY/git/ref/heads/$CANARY_BRANCH" >/dev/null 2>&1; then
  echo 'Dedicated canary target branch still exists' >&2
  exit 1
fi
```

- [ ] Remove `canary_suppress_translation_dispatch` and every temporary conditional/configuration. Do not remove permanent handoff evidence upload or production inputs.
- [ ] RED/GREEN the policy cleanup: first make policy fail while the temporary marker exists, then remove it and pass.
- [ ] Commit cleanup:

```bash
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "chore(fetch): remove canary-only configuration"
git push
```

- [ ] Run workflow policy, full focused tests, and diff checks again after cleanup:

```bash
pnpm test:workflow-policy
node --test scripts/docs-workflow/*.test.js scripts/collect-build-card-notes.test.js scripts/validate-workflow-policy.test.js
pnpm test:typescript-runtime-boundary
pnpm typecheck
git diff --check "$APPROVED_BASE_COMMIT"...HEAD
```

- [ ] Audit canary and excluded markers:

```bash
git diff --name-only "$APPROVED_BASE_COMMIT"...HEAD > /tmp/fetch-fifo-p0-final-paths.txt
if rg -n 'canary_suppress_translation_dispatch|fetch-publication-fifo-p0-canary-dev|production shadow|publish_ready_shadow' .github/workflows; then
  echo 'Temporary canary or shadow configuration remains' >&2
  exit 1
fi
if rg -n '^(\.github/workflows/translate-codex\.yml|scripts/doc-publish-bot/|migration/reports/|\.claude/specs/2026-08-03-fetch-docs-multi-group-selection\.md)$' /tmp/fetch-fifo-p0-final-paths.txt; then
  echo 'Excluded path changed' >&2
  exit 1
fi
if git diff "$APPROVED_BASE_COMMIT"...HEAD -- . ':!.claude/plans/2026-08-04-fetch-publication-ready-fifo-p0.md' | rg -n 'zdoc_cn|schemaVersion[^\n]*3'; then
  echo 'Excluded scope marker found in final implementation diff' >&2
  exit 1
fi
git status --short --branch
```

- [ ] Open the PR only after all evidence is attached or linked. The PR description names the five production commit boundaries, the two retained runs, replay root/evidence summary, eight fault scenarios, artifact-only run, isolated-target run, final policy audit, and rollback commit.

**Exit conditions:** final PR diff contains no canary-only trigger/target/suppression, no shadow job, no excluded path, and no legacy cleanup.

## Production cutover and rollback

### Task 18: Merge, manually monitor one production Fetch `all`, and retain rollback evidence

**Entry conditions:** approved PR, all local/replay/fault/canary gates green, temporary canary configuration removed, final branch SHA reviewed.

- [ ] Merge through the normal review path. Do not directly push production workflow changes to `master`.
- [ ] Manually dispatch one production run with normal target `dev`, `group=all`, `publish=true`, and the intended normal Translation setting.
- [ ] Monitor producers, `publish_ready`, source barrier, schema-v2 handoff, Translation dispatch, final verification, aggregate, monitor, and fallback/card finalization to terminal completion. Inspect a failure immediately rather than waiting for unrelated jobs.
- [ ] Production acceptance evidence proves:

```text
all selected units = published or no_changes
sequence = producer.completed_at ASC, unitKey ASC
one Fetch Git writer
every successful resultSha ancestor of final dev
Translation dispatch only after successful barrier
unchanged Translation accepts schema-v2 handoff
Fetch terminal card = exactly nine complete notes
```

- [ ] If production cutover fails, do not switch the running workflow to legacy publication. Revert the final cutover commit with a normal revert commit, merge that rollback, and dispatch a new legacy Fetch run. Do not force-push/reset target content. Already published content remains until an explicitly reviewed normal revert commit is required.

Recommended workflow rollback command after identifying the merged cutover commit:

```bash
git switch -c codex/revert-fetch-publication-fifo-p0 origin/master
git revert "$MERGED_CUTOVER_COMMIT"
git push -u origin codex/revert-fetch-publication-fifo-p0
```

**Exit conditions:** one monitored production `all` succeeds, or a reviewed rollback restores the fixed chain and a new legacy run reaches terminal completion.

**Evidence:** production run URL/ID, jobs JSON, selection/progress/results/handoff/card artifacts, final `dev` SHA, ancestry verification log, exact nine-note assertion, and rollback PR/run if used.

## Gate summary

| Gate | Entry | Exit | Required evidence |
| --- | --- | --- | --- |
| Worktree | approved base contains spec + plan | clean approved worktree/branch | base SHA, divergence decision, status |
| Five production commits | RED tests defined | focused tests green per commit | test logs, staged path lists, commit SHAs |
| Local automated | five commits, no canary config | all focused/policy/type/inventory checks pass | command logs, exclusion audit |
| Real artifact replay | two retained full runs available | canonical/FIFO trees identical; business replay passes | artifacts, jobs, trees, results, handoff, nine-note card |
| Fault injection | successful replay root | eight scenarios prove continuation/safe stop | per-scenario refs/results/call logs |
| Artifact-only canary | feature commit pushed | all descriptors/results valid; zero Git mutation | run URL, before/after refs, artifacts |
| Isolated full canary | isolated branch seeded | one writer; results consumers pass; no Translation dispatch | run URL, jobs, results, handoff, card, ancestry |
| PR-ready cleanup | canaries pass | temporary config absent; final diff/policy clean | cleanup commit, final audit |
| Production | reviewed merge | monitored `all` accepted or rollback completed | production/rollback run evidence |

## Final implementation completion checklist

- [ ] Used the approved worktree/branch and did not alter main worktree history without user direction.
- [ ] Followed RED → GREEN → refactor/verification in every production commit.
- [ ] Implemented only the eight Fetch checkpoint units.
- [ ] Enforced trusted FIFO and lexical tie breaking.
- [ ] Kept one Git writer and continued after ordinary unit failures.
- [ ] Stopped writes on unknown remote state.
- [ ] Added four independent schema-v1 publication documents.
- [ ] Kept Translation handoff schema v2 and behind the all-success source barrier.
- [ ] Preserved preflight, checksums, ownership, three-way apply, validation, CAS, drift retry, and ambiguous-push probing.
- [ ] Explicitly set `ZDOC_SITE=zh-CN` for Chinese Guides.
- [ ] Preserved exact nine-note Fetch reporting.
- [ ] Passed local tests, real-artifact replay, fault injection, artifact-only canary, isolated-target canary, cleanup audit, and production monitoring.
- [ ] Did not introduce production shadow, multi-group, Translation FIFO, legacy cleanup, or any excluded path change.
