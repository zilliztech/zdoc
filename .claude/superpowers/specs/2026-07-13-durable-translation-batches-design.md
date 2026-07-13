# Durable Translation Batches Design

## Goal

Make long-running documentation translation resumable by publishing every validated batch as its own target-branch commit. Enable the mechanism for Guides first with 30 documents per durable batch, while keeping the implementation group-agnostic so SDK and REST manuals can opt in later through configuration.

## Confirmed Problem

The current translation worker writes `.translation-cache/ja-JP.json`, translated documents, and a report every ten processed documents. Those checkpoints exist only on the temporary GitHub runner. They are useful for graceful shutdown inside one job, but they disappear when the runner is force-cancelled, crashes, or is lost.

The only durable checkpoint is created after the whole translation job finishes, validates the accumulated output, uploads one artifact, and runs one publisher. For Guides this creates a multi-hour failure domain: a late MDX or full-build failure can prevent hundreds of successful translations from being committed.

`TRANSLATION_ALLOW_PARTIAL=true` isolates model or review failures at the document level, but it does not make successful documents durable before final group validation. The current five-hour soft deadline reduces unbounded execution, yet a validation failure after the deadline can still discard the complete in-run result.

## Selected Approach

Use a generic dynamic matrix of sequential durable translation batches. A preparation job computes the pending manifest and emits deterministic batch indexes. Each matrix invocation calls a reusable batch workflow containing a read-only translation producer followed by the existing write-enabled checkpoint publisher. The matrix uses `max-parallel: 1` and `fail-fast: false`.

Guides initially configures a durable batch size of 30. Other content groups retain their current single-checkpoint workflow by configuring durable batching as disabled. The batching utilities and reusable workflow accept a content group rather than embedding Guides-specific ownership rules.

This approach deliberately accepts more GitHub Actions jobs and dependency setup in exchange for bounded loss. The Feishu card remains summarized at the manual level and reports batch counts rather than adding one top-level stage per batch.

## Translation Checkpoint Levels

The ten-document local checkpoint remains unchanged:

```text
10 documents -> local cache and report checkpoint
20 documents -> local cache and report checkpoint
30 documents -> validate and publish durable batch commit
```

The local checkpoint is diagnostic and supports graceful worker termination. It is not presented as recoverable state. The durable 30-document checkpoint is the recovery boundary and must include translated files plus the corresponding cache entries.

## Components

### Translation Batch Configuration

The content-group contract exposes a `durableTranslationBatchSize` integer. Initial values are:

```json
{
  "guides": 30,
  "python": 0,
  "java": 0,
  "node": 0,
  "go": 0,
  "cli": 0,
  "rest": 0
}
```

Zero means the existing non-batched translation path. A positive value enables deterministic batches. Enabling another manual later must require configuration, ownership-specific validation tests, and one disposable-branch workflow test, but no new batching implementation.

### Deterministic Manifest Partitioning

Manifest construction continues to sort source paths and exclude documents whose target exists with a matching source hash in the committed translation cache. Batch preparation builds the complete pending manifest from the immutable group source publication SHA, then partitions the ordered items into contiguous slices of 30.

Each batch is identified by zero-based `batchIndex`, positive `batchNumber`, `batchCount`, batch size, group, locale, and source checkpoint SHA. A batch invocation reconstructs the same complete pending manifest and selects its deterministic slice. It rejects an out-of-range index or an identity mismatch rather than silently translating a different set.

All batches in one matrix use the same source publication SHA and initial cache baseline. They modify disjoint source-path entries. The translation-cache publisher merges those entries by document path, so later batches preserve earlier batch commits.

### Batch Preparation Job

For a batching-enabled group, a read-only preparation job:

1. checks out immutable tooling;
2. materializes the exact group source publication SHA and generated-state baseline;
3. builds the complete pending translation manifest without a file limit;
4. calculates `batchCount = ceil(pendingCount / batchSize)`;
5. emits a compact JSON matrix containing batch indexes and display numbers;
6. emits pending document count and batch size for reporting.

An empty manifest emits an empty matrix and a `no_changes` terminal result. It must not create a publisher job.

### Reusable Durable Batch Workflow

Each matrix entry invokes one reusable workflow. The workflow contains two security-separated jobs:

```text
translate(group, batch) [contents: read]
          |
          v
publish(group, batch) [contents: write]
```

The translation job reuses the existing provider, review, correction, per-document validation, cache update, artifact creation, and report behavior. Artifact names include group, run ID, and batch number to prevent collisions. The checkpoint manifest retains the existing group ownership and source SHA contracts and records batch metadata for diagnostics.

The publisher uses the existing checkpoint application and optimistic fast-forward retry mechanism. Its commit message is:

```text
i18n(guides): publish batch 3 of 16
```

The batch workflow returns `published`, `no_changes`, or `failed`, its commit SHA, translated count, failed-document count, and remaining count.

### Sequential Matrix Semantics

The caller uses a dynamic matrix with:

```yaml
strategy:
  fail-fast: false
  max-parallel: 1
```

Sequential execution limits API pressure and makes the commit history easy to follow. `fail-fast: false` allows later disjoint batches to publish even if one batch fails. The overall manual result remains failed when any requested batch fails, but successful batches stay committed and are skipped by the next workflow run.

The design does not depend on execution order for correctness. Batch identity comes from the deterministic manifest slice, and cache publication merges disjoint document keys. Sequential execution is an operational choice, not an integrity assumption.

### Validation Boundary

Each document is accepted only after translation review, YAML parsing, MDX compilation, MDX structural validation, protected import/export restoration, and URL stabilization. Failed documents are excluded from the cache and checkpoint and remain eligible for the next run.

Before publication, each batch runs group-scoped MDX parsing. The publisher applies the batch to the latest target-branch tip and runs the full documentation build in its temporary validation worktree. A build failure prevents only that batch from committing; previously published batches remain durable.

Final verification still runs once against the immutable final target SHA after all requested manual lanes reach terminal state. It remains responsible for the complete English/Japanese build, generated sidebars, workflow policy, and checkpoint tests.

## Failure and Recovery Semantics

- Provider, review, timeout, or per-document validation failures do not poison valid documents in the same batch. Invalid documents are omitted and recorded in the batch report.
- If every document in a batch fails, the batch fails and publishes nothing.
- If a batch publisher fails validation, artifact application, cache merge, or push, that batch publishes nothing; earlier successful batch commits remain.
- A force-cancelled workflow loses only the active uncommitted batch. All prior batch commits remain on the target branch.
- The next workflow rebuilds its pending manifest from the target branch cache and retries failed, omitted, active-at-cancellation, and never-started documents.
- Genuine same-document cache conflicts fail closed. Disjoint cache entries merge.
- A batch matrix failure makes the requested manual terminal result fail even when some batches published, ensuring the aggregate does not claim complete success.

## Card and Diagnostics

The Feishu card keeps the existing five aggregate stages. During Guides translation it shows summarized durability information such as:

```text
Guides translation: batch 9/16
270 documents published · 210 remaining
```

Live-card reconstruction recognizes batch job names and derives Guides Translate and Translation statuses from all expected batch jobs. The translation stage is Done when every batch translator is terminal-success or no-change. The publication stage is Done when every non-empty successful batch is published. It is Failed when any batch fails and Running while at least one batch remains active or unstarted.

Each batch uploads its translation report with a unique name. The final aggregate report links or summarizes failed batches and documents. Reports stay in GitHub Actions and the repository’s existing report paths; they are never uploaded to Feishu Drive.

## Workflow Integration

The initial integration replaces only the Guides translation lane after `publish_guides`:

```text
publish_guides
    -> prepare_guides_translation_batches
    -> translate_guides_batches (dynamic matrix, max-parallel 1)
    -> finalize_guides_translation
```

The Guides batch workflow publishes internally after each translated batch. A lightweight finalizer converts matrix completion and preparation outputs into the existing aggregate contract, including whether translation was requested, whether the manifest was empty, whether all batches succeeded, and the latest target-branch SHA.

Python, Java, Node, Go, CLI, and REST keep their current `translate -> publish translation` jobs. Their workflow shape changes only when their content-group configuration later enables durable batching.

## Security and Integrity

- Translation jobs keep `contents: read` and do not push.
- Only the nested batch publisher receives `contents: write`.
- Tooling, source publication SHA, group ownership, locale, batch index, and batch size are immutable inputs validated before model calls.
- Batch artifacts use unique names, short retention, strict archive extraction, checksums, and the existing checkpoint manifest validation.
- Publishers fetch the latest target tip, apply only declared group-owned paths and the shared translation cache, validate, and push without force.
- The workflow never uploads documentation reports or translation artifacts to Feishu Drive.

## Testing

Unit tests must cover:

- batch-size configuration defaults and validation;
- deterministic partitioning, empty manifests, last partial batches, invalid indexes, and defensive copies;
- stable reconstruction of the same batch from the same source SHA and cache baseline;
- omission of failed documents from cache and checkpoint payloads;
- unique batch artifact and commit-message generation;
- disjoint cache publication across multiple batches;
- preservation of earlier batch commits when a later batch fails;
- resumability after simulated cancellation;
- live-card aggregation for pending, running, published, partially failed, and no-change batch sets;
- unchanged legacy behavior for groups with batching disabled;
- workflow-policy enforcement of read-only translators and write-only publishers.

Disposable-branch workflow verification must demonstrate:

1. at least two Guides batches publish separate commits;
2. the second batch preserves the first batch’s translations and cache entries;
3. force-cancelling during a later batch leaves prior commits intact;
4. the resumed run skips committed documents;
5. a malformed document fails only its batch while later disjoint batches can continue;
6. the Feishu card reports published batch/document counts accurately;
7. final verification passes after all pending Guides documents are eventually published.

## Rollout

1. Introduce generic batching utilities and reusable batch workflow with batching disabled for every group.
2. Enable `durableTranslationBatchSize: 30` for Guides on the disposable publication-test branch.
3. Run cancellation, resume, batch-failure, and final-green tests.
4. Merge only after a complete publish-enabled run is green.
5. Extend batching to another manual by configuration and a disposable-branch verification run; do not fork the implementation.

## Non-Goals

- Parallel translation batches in the initial rollout.
- Cross-run recovery from expiring GitHub artifacts instead of Git commits.
- Separate SaaS and BYOC translation ownership or publication lanes.
- Changing the ten-document local progress checkpoint interval.
- Enabling batching for non-Guides manuals in the first rollout.
- Hiding batch commits through squashing or force-pushing.
