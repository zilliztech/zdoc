# Fail-Closed Translation Ownership and Replay

**Date:** 2026-08-02  
**Status:** Approved design, pending written-spec review  
**Repository:** `zilliztech/zdoc`

## Summary

Repair the translation handoff and publication pipeline by separating immutable tooling policy from mutable documentation publication state, converging translation candidate selection on one implementation, and making every pre-publication decision fail early and fail closed.

`master` supplies workflow code, validators, schemas, ownership definitions, and explicit retirement approvals. `dev` supplies English source content, translated targets, translation state, generated sidebars, and other publication state. The workflow must never compare the tooling commit to the source publication commit as if both were content revisions.

Before any paid translation agent starts, the workflow will validate the complete handoff, calculate a group-scoped source delta between two `dev` identities, reconcile it with the existing translation state, and require exact retirement approvals. Translation artifacts will contain publication mutations only; tooling policy such as `config/reference-retirements.json` will not be copied or merged into `dev` by a translation checkpoint.

The same change set repairs all four Guides publisher failures exposed by the real artifacts from run `30738338949`, then runs a complete local real-artifact replay before any new online validation.

## Evidence and Root Causes

### Tooling and source content are compared as peer revisions

`_translate-content-group.yml` checks out `tooling_sha`, restores publication paths from `source_sha`, and then runs:

```bash
git diff --name-status "$MASTER_SHA" "$SOURCE_COMMIT_SHA"
```

This compares unrelated ownership domains. In run `30738338949`, it made the Chinese Python producer report 136 retirement candidates from several SDK groups. Group scoping reduced the visible set, but it did not correct the invalid baseline.

The Python source publication commit was `2ac2a6ba1a7fc04725abb8b4919159cf8777e760`, with source-run `devBaselineSha` `ea092fd4b1ef1e25d91e3af3b2d2a35efd623a2d`. A group-scoped comparison of those two `dev` identities contains no Python content deletion. The four approved Python paths are historical source/target reconciliation cases, not deletions introduced by that source publication.

### Translation candidate selection has two implementations

The production workflow calls `scripts/translation/manifest.js`. It discovers active candidates from source files and target state, but it receives retirement candidates only from the externally generated source delta.

`packages/docs-tooling/src/translation/candidates.ts` already reconciles current source files with previous translation records and can discover missing-source retirement candidates independently of a Git delta. It is not the implementation used by the production translation workflow.

This divergence allows Git-diff mistakes to change retirement behavior and makes unit coverage for one implementation insufficient evidence for the other.

### Retirement policy has dual ownership

The translation workspace reads `config/reference-retirements.json` from the immutable tooling checkout because `restore-generated-state.sh` does not restore that file from `dev`. That makes the registry a master-owned approval policy.

However, Chinese Reference checkpoint validation also includes the registry as a translation state path, and `apply-checkpoint-artifact.js` three-way merges it into the target branch. `bootstrap-state.js` can normalize and rewrite it during translation completion. The same file is therefore treated as both tooling policy and publication state.

### Guides publisher has four sequential contract failures

The exact artifacts from job `91473491454` revealed four independent failures:

1. Downloaded Guides artifact directories include `ja-JP`; the publisher's loop constructs paths without the locale.
2. Chinese Guides publication includes shared English Guides assembly and diagnostic files, so the translation source-authority tree changes between the English source checkpoint and the final source branch.
3. Staged batch path comparison permits Git rename detection to collapse nine old/new path pairs, producing 97 staged paths for 106 validated mutations.
4. Combined validation requires retired roots such as `docs`, `docs-byoc`, `reference`, and `config/generated` instead of the tracked canonical content and i18n roots.

After diagnostic-only corrections, all eleven Guides batches composed, 651 of 651 translated pages passed coverage, and the complete Japanese site build and link check exited successfully.

## Ownership Contract

### Master-owned control plane

The immutable `tooling_sha` owns:

- GitHub Actions workflow definitions;
- scripts and packages that build, validate, publish, and report documentation;
- publication-group ownership and preserved-path definitions;
- validation schemas and policy configuration;
- `config/reference-retirements.json` as explicit human approval policy.

Master-owned files are never interpreted as a previous documentation publication snapshot.

### Dev-owned publication state

The target branch owns:

- `content/en` and `content/zh-CN`;
- Japanese files under `i18n/ja-JP`;
- translation caches and translation manifests;
- generated source and translated sidebars;
- source snapshots, assembly output, and publication reports that are explicitly owned by the corresponding source group.

Translation artifacts may mutate only the selected translation group's target paths and its translation state. They may not carry master-owned policy files.

### Shared Guides diagnostics

English Guides owns the shared Guides assembly and diagnostic paths under `packages/docs-tooling/src/lark/meta`. Chinese Guides may consume them but may not publish them. Chinese Guides checkpoint paths contain only Chinese-owned content, sidebars, manifests, and Chinese-specific reports.

## Translation Handoff Contract

The handoff schema will move from a bare source-SHA map to immutable per-group source identities:

```json
{
  "schemaVersion": 2,
  "toolingSha": "...",
  "targetBranch": "dev",
  "targetBaselineSha": "...",
  "units": [
    {
      "target": "zh-CN-reference",
      "group": "python",
      "sourceGroup": "python",
      "sourceBaselineSha": "...",
      "sourceCheckpointSha": "...",
      "publicationOrder": 1
    }
  ]
}
```

`fetch-docs.yml` already has the source run's exact `dev_baseline_sha` and each publisher's exact result SHA. It will pass both identities to the translation handoff. A `no_changes` group binds both source identities to the same immutable content state or records an empty group delta explicitly.

The translation prepare job validates before paid work that:

- every SHA is a lowercase, reachable commit;
- the source baseline is an ancestor of the source checkpoint;
- the source checkpoint belongs to the declared group result from the handoff;
- the target baseline is the exact target branch head captured by translation prepare;
- every selected unit has a unique target/group identity and canonical publication order.

Missing, ambiguous, non-ancestral, or cross-group identities stop the workflow before candidate preparation.

## Candidate and Retirement Reconciliation

### One candidate implementation

Production manifest generation will use one shared candidate engine. The shared engine will be responsible for:

- walking only the selected group's owned source roots;
- excluding preserved landing pages from retirement;
- comparing current source hashes with committed translation state;
- identifying missing targets and stale translations;
- identifying translation-state records whose source no longer exists;
- returning deterministic, canonically sorted translation and retirement candidates.

`scripts/translation/manifest.js` will become a thin CLI adapter over the shared implementation rather than maintaining a second selection algorithm.

### Group-scoped source delta

Source delta is calculated only between `sourceBaselineSha` and `sourceCheckpointSha`, using the selected group's master-defined owned paths. The diff disables heuristic rename detection. A move is represented deterministically as one deletion and one addition; the new path is translated and the old path enters retirement reconciliation.

The delta is diagnostic and provides current-publication provenance. Candidate correctness does not depend solely on the delta: previous translation-state records are always reconciled against the current source tree.

No path outside the selected ownership group may appear in the delta. Preserved paths may appear as active translation inputs but may not become retirement candidates.

### Fail-closed retirement approval

The registry schema separates machine identity from human explanation:

```json
{
  "schemaVersion": 2,
  "retirements": [
    {
      "manual": "python",
      "sourcePath": "content/en/reference/...",
      "targetPath": "content/zh-CN/reference/...",
      "changeKind": "source_deleted",
      "rationale": "Approved removal of an orphaned translated target."
    }
  ]
}
```

Approval matching uses the exact tuple `manual`, `sourcePath`, `targetPath`, and `changeKind`. Free-text rationale never participates in machine matching.

The gate runs before translation agents. An unapproved candidate, a preserved-path candidate, a group mismatch, an unknown change kind, or an approval-path ownership mismatch stops the selected producer immediately.

The four Python paths approved in this investigation are historical reconciliation candidates. They will be added only if the corrected shared candidate engine still emits the same exact tuples from the immutable `dev` source and translation state. Approval does not force a retirement that the corrected engine does not produce.

Legacy registry records are migrated structurally, but migration does not infer new approval authority from their human-readable reason. Records that already match a currently emitted candidate can be upgraded after exact verification. Unused legacy records remain non-authorizing until reviewed; they are not bulk-deleted based on a master-versus-dev tree comparison.

### Registry is not publication state

Translation agents and bootstrap completion do not rewrite the retirement registry. Chinese Reference checkpoints exclude it, and checkpoint application does not merge it into `dev`.

Retirement effects are represented in dev-owned translation state and group validation output. The approval policy remains immutable for the duration of a run and is identified by `toolingSha`.

## Guides Publisher Corrections

### Artifact identity

The Guides publisher derives checkpoint/baseline pairs from validated artifact manifests and the declared `target`, `group`, run ID, batch number, and batch count. It does not reconstruct an artifact directory name that omits locale.

Every batch number must resolve to exactly one result and one baseline artifact. Missing, duplicate, wrong-locale, or wrong-group artifacts fail before extraction.

### Source authority

Chinese Guides no longer publishes English-owned assembly or diagnostic paths. The strict source-authority comparison remains unchanged: the target branch must preserve the exact English Guides authority tree from the translation source checkpoint.

### Batch composition

All staged mutation comparisons use `git diff --no-renames` so the staged path set is compared to the validated old/new path set without heuristic collapsing.

### Combined validation

The validation proof and commands use only tracked canonical roots:

- `content/en/guides`;
- `content/en/byoc`;
- `i18n/ja-JP/docusaurus-plugin-content-docs/current`;
- `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current`;
- the applicable sidebars, translation cache, manifests, and explicitly owned generated paths.

Retired compatibility roots are rejected as validation requirements.

## Failure Semantics

The workflow stops at the first invalid boundary:

1. invalid handoff or immutable identity;
2. source baseline/checkpoint ancestry or ownership mismatch;
3. unsafe artifact archive or duplicate artifact identity;
4. unapproved retirement or preserved-path retirement attempt;
5. batch identity, source authority, or staged path mismatch;
6. group validation, inventory, site build, or publication conflict.

No paid translation begins after failures 1 through 4. No publisher promotion occurs after failures 5 or 6. Successful paid batch artifacts remain recoverable and are never promoted without the full combined validation receipt.

## Test Strategy

Tests are written before production changes and prove each observed failure independently.

### Handoff and ownership

- reject a tooling/source content diff;
- require source baseline and checkpoint identities for every selected group;
- reject non-ancestral or cross-group source identities;
- prove master policy remains present after dev publication state is restored;
- prove translation artifacts exclude retirement policy.

### Candidate and retirement behavior

- use the exact Python replay identities to prove no Python current-source delta is fabricated;
- discover historical missing-source translation records through state reconciliation;
- restrict candidates and retirements to the selected SDK group;
- exclude preserved Reference landing pages;
- require exact `changeKind` approval and reject free-text-only matches;
- prove registry normalization cannot rewrite the master-owned policy during translation.

### Guides publisher

- resolve locale-qualified artifact directories;
- reject missing or duplicate batch artifacts;
- prove Chinese Guides excludes English shared diagnostics;
- reproduce the 106-versus-97 rename-collapse case and require 106-versus-106 matching;
- reject retired validation roots and accept canonical tracked roots.

### Regression and policy

- workflow policy tests cover the new handoff schema and fail-early ordering;
- actionlint validates every changed workflow;
- all affected Node and TypeScript unit suites pass;
- the existing workflow policy, localization inventory, revision inventory, and source publication barrier remain green.

## Complete Local Replay Gate

The implementation is not ready for submission until a new isolated replay root proves all of the following with real artifacts:

1. preflight every source and translation `checkpoint-group.tar` before extraction;
2. seed a local bare remote at the recorded source-run `devBaselineSha`;
3. publish Java, Node, Go, CLI, REST, Python, English Guides, and Chinese Guides in production order;
4. require every source lane to finish as `published` or `no_changes`;
5. pass the source publication barrier;
6. replay Japanese and Chinese Reference SDK candidate preparation and publication for every selected group;
7. replay all eleven Japanese Guides batches, combined publisher, staging ref, validation, and promotion;
8. restore the exact final local `dev` state;
9. pass localization input inventory and revision inventory;
10. build the Japanese site and run translated coverage and link checks;
11. replay card collection with isolated English and Chinese report roots;
12. require exactly nine card notes and no `Unavailable` section.

The replay preserves artifact manifests, logs, final SHAs, validation receipts, card JSON, and the replay root path. Any failure stops the replay; later phases are not reported as evidence.

## Online Validation Gate

Only after the complete local replay passes may the implementation be committed and pushed for production validation. The online sequence is:

1. dispatch `fetch-docs.yml` with `run_translations=true` and the intended publish inputs;
2. monitor every source producer and publisher to terminal completion;
3. verify the downstream translation handoff identities;
4. monitor all SDK producers/publishers and all eleven Guides batches;
5. inspect Guides checkpoint pairing, source authority, staging comparison, combined validation, and promotion receipts;
6. monitor final verification, aggregate, and card finalization;
7. preserve the terminal run URLs and artifacts.

Online artifact-only execution is not a substitute for the local real-artifact replay.

## Out of Scope

- Changing translation prompts, models, or quality policy.
- Translating Chinese Guides.
- Modifying or validating the deprecated `zdoc_cn` repository.
- Reclassifying unrelated content ownership outside the translation and Guides publication contracts.
- Weakening source authority, checkpoint integrity, target-branch concurrency, or exact retirement approval.
