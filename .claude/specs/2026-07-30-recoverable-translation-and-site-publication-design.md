# Recoverable Translation and Site Publication Pipeline Design

**Date:** 2026-07-30  
**Status:** Approved design, pending written-spec review  
**Repository:** `zilliztech/zdoc`  
**Implementation branch:** `codex/unified-docs/01-foundation`  
**Pull request:** `#129`

## Summary

Split documentation production into three independently runnable pipelines:

1. **English content production** fetches and publishes canonical English documents.
2. **Translation production** translates a selected locale and content group, saves paid work as recoverable GitHub artifacts, validates it, and publishes translations atomically.
3. **Site build and publication** builds or publishes only the requested site from an immutable repository revision.

The pipelines communicate through immutable Git commit SHAs and immutable GitHub Actions artifacts. Translation never needs to fetch English source systems again, and a site build never invokes content fetching or paid translation.

Chinese Reference starts with a full bootstrap because the existing Chinese files are mostly English placeholders even though the legacy manifest marks them as translated. After a group completes one fully validated and published bootstrap, later runs become incremental. Japanese translation is decoupled through the same entry point and recovery model.

This design changes only `zdoc`. It does not modify, delete, or validate files in `zdoc_cn`; the unified repository architecture in PR #129 is the publication target.

## Problem Statement

The current `fetch-docs.yml` is an oversized orchestration graph. A publish-enabled run can fetch English source material, render documents, publish source checkpoints, translate several locales, publish translations, build both sites, and perform global verification. This coupling has produced four costly failure modes:

- validating Chinese content requires repeating unrelated English fetch work;
- a failure after paid translation can discard translated files with the temporary runner;
- per-SDK Chinese jobs perform global validation and can fail because of another SDK's stale state;
- existing English placeholder files and migration manifests make incomplete Chinese coverage look complete.

The observed Python run selected only 28 files because the selector trusted a migration-generated translation manifest. Hundreds of target files existed, so they were skipped, even though their content was still English. The same class of error applies to other SDK groups.

The retirement registry also contains stale decisions. A retirement record is meaningful only when the English source is absent and the Chinese target still exists. A record whose two sides are both absent is stale bookkeeping, not a valid retirement.

## Goals

- Run English fetch, translation, and site publication independently.
- Request one locale, one content group, or all supported selections manually.
- Resolve every supplied branch, tag, or SHA once to an immutable 40-character commit SHA.
- Translate every active English document during the first Chinese bootstrap, regardless of placeholder target existence or legacy manifest state.
- Switch a group to incremental translation only after complete validation and successful publication.
- Preserve paid translation output across job failure, cancellation, or later validation failure.
- Reuse recovery output only when its complete identity and integrity match the new run.
- Validate one translation group locally before publication and validate the complete locale only after all selected groups publish.
- Build and publish English and Chinese sites separately, or together when explicitly requested.
- Support safe PR testing even when a new top-level workflow does not yet exist on the default branch.

## Non-goals

- Changing translation prompts or translation quality policy as part of the pipeline split.
- Translating content during a site build.
- Deleting Chinese placeholder directories before their translated replacements are published.
- Using `zdoc_cn` as a runtime input or publication destination.
- Treating caches as authoritative recovery state.
- Publishing directly from an unvalidated recovery artifact.
- Force-pushing publication branches.

## Architecture

```text
source systems
     |
     v
fetch-docs.yml
English production
     |
     | atomic Git publication: source_sha
     v
translate-content.yml <------ optional recovery_run_id
translation production          |
     |                           |
     | recovery + validated artifacts
     | atomic Git publication: translated_sha
     v
site-validation.yml / reusable build workflow
site build and publication
     |
     +---- en artifact/deployment
     +---- zh-CN artifact/deployment
```

Git commits are the durable published state. Artifacts are immutable, time-limited execution checkpoints. A downstream pipeline consumes a declared commit SHA; it does not infer whichever branch head happens to exist when a job starts.

## Pipeline 1: English Content Production

### Entry point

Retain `.github/workflows/fetch-docs.yml` as the English content production entry point and remove translation and site deployment responsibilities from it.

Manual inputs:

| Input | Values | Default | Meaning |
| --- | --- | --- | --- |
| `group` | `all`, `guides`, `python`, `java`, `node`, `go`, `cli`, `rest` | `all` | English content group to produce |
| `source_ref` | branch, tag, or exact SHA | `dev` | Baseline content revision |
| `tooling_ref` | branch, tag, or exact SHA | `master` | Workflow and tooling revision |
| `target_branch` | safe existing branch | `dev` | Publication branch |
| `publish` | boolean | `false` for manual runs | Whether to publish validated English checkpoints |
| `run_translations` | boolean | `false` | Optional compatibility bridge during migration only |
| `artifact_retention_days` | positive integer | `3` | English diagnostic artifact retention |

`run_translations` is a temporary compatibility option, not the normal architecture. When true, the English run invokes the translation workflow only after successful English publication and passes the exact resulting source SHA. Scheduled production may retain this bridge during rollout. Manual translation validation should use the independent translation entry point.

### Ref resolution

The prepare job resolves `source_ref` and `tooling_ref` once. A branch, tag, or exact SHA is accepted after unsafe-ref validation. Each becomes a verified lowercase 40-character SHA. Every later checkout uses those outputs, never the original symbolic ref.

The workflow file used to construct the GitHub job graph is selected by the dispatch `--ref`. Therefore PR tests must dispatch the workflow on the PR branch and also pass the exact PR tooling SHA. Dispatching `--ref master` while supplying a PR `tooling_ref` tests master's job graph and is invalid evidence for PR workflow behavior.

### Output contract

Each selected group produces a validated checkpoint artifact. Publication serializes group commits onto `target_branch` with optimistic fast-forward retry. The workflow exposes:

- `source_sha`: exact published commit containing all successfully selected English groups;
- per-group status and checkpoint SHA;
- validation reports and provenance;
- no translation or deployment side effects unless the temporary compatibility bridge is explicitly enabled.

## Pipeline 2: Translation Production

### Entry point

Extend the existing `.github/workflows/translate-content.yml` into the sole independent translation entry point.

Manual and reusable inputs:

| Input | Values | Default | Meaning |
| --- | --- | --- | --- |
| `locale` | `ja-JP`, `zh-CN`, `all` | required | Target locale selection |
| `group` | `all`, `guides`, `python`, `java`, `node`, `go`, `cli`, `rest`, `tools` | `all` | Translation ownership group |
| `mode` | `auto`, `full`, `incremental` | `auto` | Bootstrap or incremental selection policy |
| `publish` | boolean | `false` | Publish after validation |
| `source_ref` | branch, tag, or exact SHA | `dev` | Immutable English source revision after resolution |
| `target_branch` | safe existing branch | `dev` | Translation publication branch |
| `tooling_sha` | exact SHA | required | Exact PR or production tooling revision |
| `recovery_run_id` | GitHub run ID or empty | empty | Optional recovery artifact source |
| `batch_size` | positive integer | `25` | Maximum paid translation candidates per batch |

`locale=all` expands into separate locale lanes. `group=all` expands into the groups supported by the locale. Unsupported combinations fail during free preflight before any paid agent starts.

### Immutable identities

The prepare job resolves `source_ref` to `source_sha`, verifies `tooling_sha`, captures the initial `target_branch` SHA as `target_baseline_sha`, and creates a translation execution identity. All downstream jobs use these immutable values.

The execution identity contains:

- locale and group;
- requested and effective mode;
- source SHA;
- tooling SHA;
- target baseline SHA;
- prompt contract hash;
- model identity;
- canonical pending-set hash;
- deterministic batch membership.

### Bootstrap state

Translation manifests gain explicit bootstrap state rather than inferring completion from target-file existence:

```json
{
  "schemaVersion": 1,
  "bootstrapCompletedGroups": ["python"],
  "records": []
}
```

Mode resolution is:

| Requested mode | Bootstrap marker | Effective behavior |
| --- | --- | --- |
| `full` | either | Translate every active source document in the group |
| `incremental` | present | Translate only new or changed source documents |
| `incremental` | absent | Fail preflight; do not spend translation money |
| `auto` | absent | Full bootstrap |
| `auto` | present | Incremental translation |

For a Chinese full bootstrap, the candidate set must equal the complete active English source set for that group. Existing Chinese files and legacy `translated` records do not remove candidates. The target files are overwritten in the translation workspace, not deleted in advance.

The bootstrap marker is written only after every planned document succeeds, group validation succeeds, the group is atomically published, and the published state is rechecked. A partial or artifact-only run never creates the marker.

Japanese uses the same independent entry point. Existing Japanese state may remain incremental only after an audit proves that its manifest represents genuinely translated content. `mode=full` remains available for an explicit rebuild.

### Fail-early preflight

Before starting paid translation, each group must pass free checks:

1. verify source, tooling, and target baseline SHAs;
2. enumerate the complete active source set;
3. normalize retirement records for that group;
4. resolve the effective translation mode;
5. build and canonically sort the candidate manifest;
6. in full mode, require candidate count to equal active source count;
7. verify every source path belongs to the requested group;
8. partition deterministic batches and calculate their hashes;
9. evaluate recovery artifacts and reject mismatches;
10. run source-side MDX and manifest validation.

Any failure ends the group before API-backed translation begins.

### Retirement semantics

Retirement cleanup is scoped to the selected group during preflight:

| English source | Chinese target | Meaning | Required action |
| --- | --- | --- | --- |
| exists | missing | untranslated active document | include in candidates |
| exists | exists | active document | translate according to mode; no retirement |
| missing | exists | valid retirement awaiting target cleanup | retain retirement decision |
| missing | missing | stale retirement record | remove record |

A per-group job must not fail because of another group's retirement record. Whole-locale retirement and coverage validation runs after all selected groups publish.

### Deterministic batching

Candidates are sorted by repository-relative source path and partitioned into contiguous batches of 25 by default. A batch records its index, count, ordered paths, source hashes, and `pendingSetSha256`. Reconstructing a batch from the same identity must yield byte-for-byte equivalent metadata.

Batches may translate independently, but publication of Chinese Reference groups is serialized to protect shared manifests and registries:

```text
Python -> Java -> Node -> Go -> CLI -> REST
```

Later publishers require predecessor success. Within a group, batch output is aggregated and group publication is atomic; incomplete bootstrap batches are recoverable but are not published as a completed group.

### Recovery artifacts

Every paid batch uploads a recovery artifact with `if: always()`, immediately after the translation process has produced its local checkpoint. Later validation failure must not suppress this upload.

Artifact layout:

```text
translation-recovery/
  metadata.json
  manifest.json
  report.json
  translated-files/
```

Required metadata:

```json
{
  "schemaVersion": 1,
  "locale": "zh-CN",
  "group": "python",
  "mode": "full",
  "sourceSha": "40-character SHA",
  "toolingSha": "40-character SHA",
  "targetBaselineSha": "40-character SHA",
  "batchIndex": 3,
  "batchCount": 14,
  "pendingSetSha256": "64-character SHA-256",
  "promptContractSha256": "64-character SHA-256",
  "model": "declared model identity",
  "translated": 25,
  "failed": 0
}
```

Recovery reuse requires exact equality for locale, group, effective mode, source SHA, tooling SHA, target baseline compatibility, prompt contract, model policy, pending-set hash, batch identity, ordered paths, and per-file source hashes. The downloaded artifact and every contained file must pass integrity verification.

Recovery output never publishes directly. Reused files re-enter the same per-file, batch, group, and site validation path as newly translated files. A mismatching or expired artifact is reported and ignored; the workflow rebuilds that batch instead of partially trusting it.

Recommended retention:

- recovery artifacts: 30 days;
- validated batch artifacts: 14 days;
- publication checkpoints: 14 days;
- diagnostic reports: 3 days.

### Validation and publication

Validation occurs in layers:

1. per-file syntax and translation checks;
2. batch ownership, integrity, and MDX checks;
3. group-local coverage, manifest, navigation, and build checks;
4. atomic group publication;
5. whole-locale validation after every selected group has published;
6. requested site build validation from the final published SHA.

Group-local validation must operate on the selected group's paths and manifest records only. It must not run whole-tree Reference validation. Global Reference validation is a separate final gate.

If `publish=false`, validated artifacts and reports are retained, but no Git state changes and no bootstrap marker is written. If `publish=true`, the publisher checks that `target_branch` still descends from the captured baseline, applies the validated checkpoint, reruns the publication validation contract, and pushes without force.

## Pipeline 3: Site Build and Publication

### Responsibilities

The site pipeline consumes one exact repository SHA and performs no fetch or translation. It builds the selected product site, validates the output and provenance, uploads an immutable build artifact, and optionally deploys it.

The reusable implementation should live in a workflow callable by both PR validation and the eventual production dispatch entry. During PR #129 testing, extend the already-default-branch-visible `site-validation.yml` entry point to call it. After the new top-level publication workflow is present on the default branch, operators can dispatch it directly.

Manual inputs:

| Input | Values | Default | Meaning |
| --- | --- | --- | --- |
| `site` | `auto`, `en`, `zh-CN`, `all` | `auto` | Site selection |
| `source_ref` | branch, tag, or exact SHA | `dev` | Exact build input after resolution |
| `publish` | boolean | `false` | Deploy the validated artifact |
| `environment` | allowed deployment environment | `uat` | Deployment destination |
| `artifact_retention_days` | positive integer | `7` | Build artifact retention |

Selection rules:

- `en` builds only the English site, including its Japanese locale output;
- `zh-CN` builds only the independent Chinese site;
- `all` runs both builds as separate jobs and artifacts;
- `auto` uses versioned path filters to select affected sites and fails if the filters cannot make a safe decision.

This answers the operational requirement directly: a caller can request only one locale-specific site. Producing the Chinese site does not require an English build, and producing the English site does not require a Chinese build.

### Build contract

The workflow resolves `source_ref` once to `build_sha`. Each selected site checks out that SHA and runs:

- dependency installation from the committed lockfile;
- localization input inventory validation;
- site-specific content and manifest checks;
- `pnpm build:en` or `pnpm build:zh-CN`;
- route, navigation, provenance, and deployment-contract validation;
- artifact packaging with checksums and build metadata.

English and Chinese artifacts are separate and independently deployable. A failure in one does not erase the successful artifact from the other, but `site=all,publish=true` deploys neither site unless both selected builds pass. This prevents a split release from an explicitly coupled request. Separate dispatches can intentionally release one site at a time.

### Publication contract

Deployment consumes only the previously validated build artifact. It verifies artifact checksums, `build_sha`, site identity, environment, and provenance before upload. The deployment job uses GitHub Environment protection and site-specific concurrency:

```text
docs-deploy-en-uat
docs-deploy-zh-CN-uat
```

No deployment job rebuilds the site. Rollback selects an earlier retained build artifact or rebuilds the exact earlier commit SHA and republishes it through the same validation path.

## Failure and Recovery Rules

| Failure point | Durable result | Rerun behavior |
| --- | --- | --- |
| English fetch before checkpoint | diagnostics only | rerun selected English group |
| English checkpoint validated, publication failed | checkpoint artifact | retry publication from same identities |
| paid translation process fails | recovery artifact with successes and report | reuse exact matching files; translate remaining files |
| batch validation fails | recovery artifact, no validated artifact | fix tooling or source, then revalidate only if identity remains compatible |
| later group/global validation fails | validated group artifacts and any published predecessor groups | fix failing group/global rule; do not repay for compatible batches |
| translation publication contention | validated publication checkpoint | refresh branch and retry non-force merge/application |
| site build fails | logs and any other successful site artifact | rerun only failed selected site |
| deployment fails | validated site artifact | retry deployment without rebuilding |

Cancellation is treated like failure. Recovery upload steps use `always()` and short timeouts. GitHub cannot guarantee artifact upload after force-terminating the runner process, so the translation worker also writes periodic local checkpoints and the workflow uploads at deterministic batch boundaries. The maximum paid-loss window is one in-progress batch, not an entire locale or SDK.

## Security and Permissions

- Fetch and translation workers default to `contents: read`.
- Only checkpoint publishers receive `contents: write`.
- Build jobs use `contents: read`.
- Deployment jobs receive environment-scoped credentials only after artifact validation.
- Recovery downloads require `actions: read` and are restricted to the same repository.
- Secrets are never stored in metadata, reports, caches, or artifacts.
- All repository-relative paths pass ownership and traversal validation before extraction or publication.

## Observability

Every run publishes a concise summary containing:

- resolved source, tooling, baseline, and final SHAs;
- requested and effective translation modes;
- active, planned, recovered, newly translated, failed, remaining, validated, and published counts;
- recovery artifact names and expiration dates;
- per-group and whole-locale validation results;
- selected site builds, artifact checksums, and deployment URLs.

The progress card reports the same state but is not authoritative. Machine-readable reports and Git/artifact identities are the source of truth.

## PR Testing Strategy

GitHub constructs a workflow run from the workflow file on the dispatch `--ref`. To test PR #129:

1. dispatch an existing top-level workflow with `--ref codex/unified-docs/01-foundation`;
2. pass the exact PR SHA as `tooling_sha` or `tooling_ref`;
3. use a disposable publication branch for `publish=true` tests;
4. first run `publish=false` preflight and artifact validation;
5. run one small recovered batch and prove that a later validation failure does not lose it;
6. run one full Chinese SDK bootstrap on the disposable branch;
7. rerun in `auto` mode and prove it selects zero unchanged files;
8. build `zh-CN` only from the resulting exact commit;
9. run the final full-locale validation before a complete publish-enabled test.

A newly added top-level workflow cannot be manually dispatched from a PR until the file exists on the default branch. New reusable workflow logic is therefore exercised through existing `fetch-docs.yml`, `translate-content.yml`, or `site-validation.yml` entry points during PR review.

## Testing Requirements

Unit and policy tests must cover:

- safe branch, tag, and SHA resolution;
- full, incremental, and auto mode resolution;
- Chinese placeholder targets remaining full-bootstrap candidates;
- exact candidate-count equality in full mode;
- bootstrap marker creation and refusal conditions;
- all four retirement-state combinations;
- deterministic sorting, batching, and pending-set hashes;
- recovery acceptance and every mismatch rejection dimension;
- artifact path traversal and integrity rejection;
- group-local validation isolation;
- serial Chinese Reference publication order and fail-closed dependencies;
- site selection for `auto`, `en`, `zh-CN`, and `all`;
- no fetch or translation commands in the site workflow;
- no deployment rebuild;
- PR dispatch ref policy.

Workflow tests must include interruption after paid translation, validation failure after recovery upload, expired or incompatible recovery artifacts, branch contention, a complete Chinese bootstrap, a no-change incremental rerun, locale-specific site builds, and deployment retry from an existing artifact.

## Rollout

1. Add shared immutable-ref, execution-identity, bootstrap-state, retirement-normalization, and recovery-artifact contracts behind tests.
2. Extend `translate-content.yml` with the new inputs and recovery flow while keeping current callers compatible.
3. Bootstrap one Chinese SDK group on a disposable branch; validate recovery, complete publication, and the subsequent zero-change incremental run.
4. Enable the remaining Chinese Reference groups in serialized order, then Guides and Tools according to their ownership contracts.
5. Audit Japanese state and move Japanese callers to the independent translation entry point.
6. Remove translation jobs from the normal English fetch graph; retain `run_translations` only for a short scheduled migration window.
7. Introduce the reusable site build/publish implementation and test it through `site-validation.yml` on the PR branch.
8. After merge makes the top-level publication entry visible on the default branch, enable direct manual site dispatch.
9. Run a complete publish-enabled English production, translation, whole-locale validation, and separate `en`/`zh-CN` site build before declaring migration complete.

## Acceptance Criteria

- A manual operator can fetch and publish one English content group without translation or site builds.
- A manual operator can translate one locale and one group from a custom branch, tag, or SHA without refetching English sources.
- Chinese full mode plans every active English document in the selected group even when English placeholder targets already exist.
- No group becomes incremental until its complete bootstrap is validated and published.
- A failure after paid translation leaves reusable recovery artifacts.
- Recovery artifacts are accepted only under exact identity and integrity rules and are always revalidated.
- A Python translation job cannot fail because of a Java retirement record.
- Whole-locale validation runs after all selected group publications.
- A manual operator can build or publish only `en`, only `zh-CN`, or both.
- English and Chinese build artifacts have independent provenance and deployment identities.
- PR workflow tests use the PR job graph and exact PR tooling SHA.
- No implementation step requires changes in `zdoc_cn`.

