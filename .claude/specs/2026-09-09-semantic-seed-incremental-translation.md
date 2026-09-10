# Semantic seed incremental translation

Date: 2026-09-09
Status: Implemented (opt-in, default off; switch wired through `translate-codex.yml`)
Branch: `feat/semantic-seed-reuse`

## Real-artifact recovery replay evidence (2026-09-10)

The modified recovery planner (including the zero-work Markdown contract change) was
authenticated against the retained artifacts of the real failed production run
[zilliztech/zdoc actions run 34357014261, attempt 1](https://github.com/zilliztech/zdoc/actions/runs/34357014261)
(`translate docs with Codex agents`, `translate_guides_batches (1, 2)` producer
failure: fenced-code protected-content violations, polish truncation, provider
timeouts; unit `translation/ja-JP/guides` `producer_failed`).

Snapshot: all 11 retained artifacts downloaded into an isolated root
(`/tmp/zdoc-recovery-replay-34357014261/snapshot`, flattened `<artifact-name>/`
layout with `artifact-directories.json`), with `run.json`, `attempt.json`,
`jobs.json`, `artifacts-unique.json`. Command (worktree checkout, `publish=false`):

```bash
ZDOC_RECOVERY_REPLAY_SAFE_ROOT=/private/tmp \
node scripts/docs-workflow/replay-recovery-plan.js \
  --snapshot-root /tmp/zdoc-recovery-replay-34357014261/snapshot \
  --output-root /tmp/zdoc-recovery-replay-34357014261/output \
  --repository zilliztech/zdoc \
  --execution-tooling-sha 21d10bd00e9b2d976d0139b500fc70349559873f \
  --target-baseline-sha 48349ba0d7fff5aabe7c54fd337bdd0d88dc9faf \
  --publish false
```

Results (merge evidence):

- `recovery_plan_sha256`: `75280525de5216c9ffeb6ebba685bb7c0c29b5e07c81952effbc3012c0e7a983`
- Recovery units: `ja-JP/guides`; retained file count: 21; source candidate count: 30; rejected: 0
- Recovery map artifacts: 10110321007 (batch 1), 10114512345 (batch 2)
- Compatibility: `pending-current-contract-preflight` (expected for `publish=false`)

The failed run itself is also the motivating case for this feature: every repeat
failure came from retranslating unchanged content in oversized whole-file payloads.


## Problem

Incremental translation selects files by hash (`current_delta` / `missing_target` /
`stale_source`), but once a file enters the manifest the whole file is retranslated.
Unit-level translation reuse already exists for intra-run crash recovery
(`semanticCheckpoint`, `filterUsableSemanticCheckpoints`) and is discarded after every
successful run, so a one-paragraph English edit costs a full-document translation
every window.

## Approach

Reuse the existing semantic checkpoint pipeline instead of building a parallel
delta-plan path. Before `Run translation agents`, a planner derives per-file semantic
checkpoints ("seeds") from the published target baseline and feeds them to
`agentRunner` through the same `initialSemanticCheckpoints` input that crash recovery
uses. Everything downstream (batch skip, per-unit completion checkpoints, protected
content validation, locale contract validation, MDX patch/compile, publication,
recovery) is unchanged.

Seeds are always treated as **revalidated**-class checkpoints: their producing
identity (model, prompt contract, tooling) is not retained by the published target
baseline, so they pass only if they satisfy the current deterministic gates
(`filterUsableSemanticCheckpoints`: source hash equality, protected content, locale
contract). They never inherit review receipts.

## Seed derivation (`scripts/translation/semanticSeeds.js`)

For each manifest item:

1. Read the baseline target file at `<baseline>/<targetPath>`. Missing → fallback
   `missing_baseline_target`.
2. Resolve the old English source the target corresponds to, using the progress
   state recorded in the workspace (`.translation-cache/<locale>.json` for `ja-JP`,
   `generated/zh-CN/manifests/reference-translations.json` for `zh-CN-reference`):
   - recorded source hash equals the current source hash → old source is current;
   - recorded source hash equals `git show <source-baseline-sha>:<path>` → old
     source is that version;
   - otherwise → fallback `old_source_unavailable` (no history walk in v1).
   When no record exists, the source-baseline version is used as a best effort;
   the pairing check below still guards correctness.
3. Pair old source units with target units (both collected with `collectSemanticUnitsSync`,
   `document` prefix). Counts and kind sequence must match exactly, otherwise
   fallback `alignment_failed`.
4. Collect current units with the same chunk prefixes the runner uses
   (`chunkDocument` + `chunk.NNNN`/`document` prefixes, identical chunk limits) and
   seed every current unit whose `sha256(unit.source)` matches a paired old unit
   hash. Matching is exact-hash only; near-matches are intentionally never reused.
5. Revalidate every seed with `filterUsableSemanticCheckpoints` (drops contract or
   protected-content violations) and enforce checkpoint retention bounds
   (512 units / 4 MiB per file). Bounds exceeded → fallback `seed_too_large`
   (no silent truncation).
6. Emit one checkpoint-schema report per seeded file under `<output>/reports/`
   plus `<output>/summary.json` with per-file outcomes and counts.

Seed reports use the exact `loadSemanticCheckpoints` schema, so `agentRunner`
validates them with existing code paths.

## Runner integration (`scripts/translation/agentRunner.js`)

- New `--semantic-seeds <dir>` argument. The summary index is validated against the
  manifest identity (target, locale, group, sourceCheckpointSha) before use.
- Per pending item, seed entries merge with any recovery semantic checkpoints;
  recovery (current run) entries win per unit id.
- Seeded units flow through the existing map: batches whose units are all seeded
  make no model call; partially seeded batches send only pending units; adaptive
  subdivision, retries, and `onSemanticUnitCompleted` behave unchanged.
- On failure, seeded units may be serialized into the per-file recovery artifact
  alongside newly translated units; they are revalidated again on resume.
- Translated results record `semanticSeedUnits` (initial seeded count) for
  observability; `reportSummary.js` aggregates seeded files/units. The two new
  summary lines are part of the zero-work report contract mirrored verbatim in
  `scripts/docs-workflow/translation-recovery-planner.js`; retained markdown-only
  zero-work reports produced by older tooling fail closed in recovery planning.

## Workflow integration (`_translate-content-group.yml` / `translate-codex.yml`)

- `_translate-content-group.yml` optional input `semantic_seeds` (boolean, default `false`).
- `translate-codex.yml` exposes the same opt-in input on both `workflow_dispatch`
  and `workflow_call`. Every `_translate-content-group` producer (Guides batches
  and the SDK producer matrix) receives
  `${{ inputs.semantic_seeds || vars.TRANSLATION_SEMANTIC_SEEDS == 'true' }}`.
  The repo variable is the runtime switch for pipeline-triggered runs: the
  production entry point (`fetch-docs.yml` `dispatch_translations`) dispatches
  `translate-codex.yml` without the input, so without the variable the merged
  feature stays off everywhere. Set `TRANSLATION_SEMANTIC_SEEDS=true` (Actions
  variables) to enable, delete it or set it back to `false` to disable; manual
  dispatches can still override per run via the input.
- Step `Build semantic translation seeds` runs after `Build group translation
  manifest` when translating, in `incremental` mode, with candidates present, and
  the input enabled. It reads `$BASELINE_DIR` (published target baseline already
  materialized by `Materialize target baseline translation state`) and the source
  baseline SHA, and writes `tmp/semantic-seeds`.
- `Run translation agents` appends `--semantic-seeds tmp/semantic-seeds` only when
  the directory exists, so recovery-only runs and disabled callers are unchanged.

## Fallback policy

Any planner fallback simply produces no seeds for that file, which is exactly the
current full-retranslation behavior. Fallback reasons are recorded in
`summary.json` and surfaced in the plan step's step summary.

## Known limitations (accepted for v1)

- Glossary or prompt changes are caught per unit only when they violate the current
  locale contract deterministically; stylistic drift is not re-reviewed. A periodic
  full-refresh mode remains the operational mitigation (`mode: full`).
- Multi-window target lag older than the source baseline is not seeded
  (`old_source_unavailable`).
- Polish (`TRANSLATION_POLISH=true`) still processes reused units; skipping polish
  for seeded units is deferred until polish identity can participate in seed
  invalidation.

## Verification

- `scripts/translation/semanticSeeds.test.js`: pairing, hash matching, chunk-prefixed
  ids, all fallback reasons, contract-violating seed rejection, retention bounds,
  summary counts, report schema round-trip through `loadSemanticCheckpoints`.
- `scripts/translation/agentRunner.test.js`: seeded units make no model calls and
  land verbatim in the translated output; recovery precedence over seeds.
- `scripts/translation/loadSheddingWorkflow.test.js`: new workflow step wiring and
  the conditional `--semantic-seeds` argument.
- Matrix: `scripts/docs-workflow/test-matrix.json` entry `semantic-seed-reuse` and
  the human-readable matrix spec row; run `pnpm test:for-change` for every changed
  path.
- Gates: focused tests, then `pnpm test:translation`, `pnpm test:workflow-policy`,
  and `pnpm test:replay:translation` because workflow behavior changes.
