# Parallel Translation Bootstrap Design

## Goal

Complete the initial Japanese translation backlog within GitHub-hosted runner limits while preserving the existing incremental translation model for later runs.

## Architecture

Use one GitHub Actions job and one Node.js coordinator with four in-process file workers. Workers process different manifest items concurrently, but each document keeps its own translation, review, correction, validation, and write sequence. The coordinator owns shared report and cache updates so parallel workers never write shared JSON state concurrently.

## Concurrency

- Default `TRANSLATION_CONCURRENCY` to `4`.
- Allow repository variables to lower concurrency if the model provider rate-limits requests.
- Do not run translation and review simultaneously for the same document.
- Permit translation or review calls for different documents to overlap.
- Keep per-provider retries, per-request timeouts, and per-file timeouts independent for each worker.

## Persistence

- Write each successfully translated target file immediately.
- Update in-memory cache state when a file succeeds.
- Checkpoint the combined translation cache and partial report after a configurable number of completed files and on a periodic timer.
- Handle termination signals by stopping new assignments, waiting briefly for active workers, flushing cache/report state, and exiting.
- Change workflow commit conditions so partial successful output is committed even if some files fail or the runner approaches its deadline.

## Time budget

The observed sequential rate was 34.6 files per hour. Four workers project to approximately 138 files per hour, or 4.2 hours for 582 files. A five-hour soft processing deadline leaves roughly one hour for provider slowdown, validation, reporting, and commit within GitHub's 360-minute hard limit.

## Incremental behavior

The manifest continues to compare English source hashes with `.translation-cache/ja-JP.json`. Once the bootstrap translations and cache are committed, later runs include only new or changed source files. Parallelism remains enabled but small manifests naturally use fewer than four workers.

## Failure policy

- A failed document is recorded in the report and does not cancel other workers when partial translation is allowed.
- Provider rate limits and temporary errors retain current retry behavior.
- The coordinator stops assigning new work at the soft deadline and checkpoints completed files.
- Validation runs against completed translations before commit.
- The workflow reports partial completion clearly in Feishu and artifacts.

## Testing

- Prove worker concurrency never exceeds the configured limit.
- Prove each manifest item is processed exactly once.
- Prove failed files do not prevent other files from completing.
- Prove cache writes are serialized and contain all completed files.
- Prove checkpoint recovery excludes already completed source hashes from the next manifest.
- Prove soft-deadline handling stops new assignments and flushes state.
- Prove workflow commits partial translations and cache before restoring the appropriate final status.
