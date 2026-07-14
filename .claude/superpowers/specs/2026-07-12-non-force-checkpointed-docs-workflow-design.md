# Non-Force Checkpointed Documentation Workflow Design

## Summary

Replace the monolithic documentation fetch job and force-push-derived publication model with a reusable-workflow architecture that runs expensive content producers in parallel, publishes their results to `dev` in a deterministic sequence, translates each eligible group after its source checkpoint, and preserves every validated checkpoint when later work fails.

The orchestrator workflow is loaded from `master`. Producer jobs also execute the plugins, scripts, dependencies, and configuration from a captured `master` commit. Publication never force-pushes and never creates a `dev` branch from `master`; every publication commit is based on the latest remote `dev` tip.

## Goals

- Run the current workflow, plugins, scripts, and configuration from `master`.
- Preserve successfully fetched content when later groups fail.
- Fetch independent content groups in parallel.
- Commit checkpoints to `dev` in a deterministic sequence.
- Translate each eligible source group after its source checkpoint succeeds.
- Continue unrelated groups after a fetch, validation, publication, or translation failure.
- Never use `git push --force`, `push_options: --force`, or equivalent history replacement.
- Support rerunning an individual failed content group.
- Preserve the existing Lark progress and final-status reporting.

## Non-Goals

- Parallel publication to `dev`.
- Automatic rollback of already published checkpoints.
- Rewriting the Lark fetch, Apifox, build, link-check, or translation implementations.
- Publishing unvalidated partial output from within a logical content group.
- Making every individual fetch command its own checkpoint.

## Background and Root Cause

The legacy workflows checked out the triggering branch, usually `master`, generated documentation, created a local `dev` branch from that checkout, and force-pushed it to remote `dev`. Removing the force-push option exposed that the local publication branch was not based on `origin/dev`; normal pushes were rejected as non-fast-forward.

Checking out `dev` directly would avoid that rejection but would run plugins and scripts from `dev`, which can lag behind changes on `master`. The new design separates production from publication:

- producers execute master code and emit validated artifacts;
- publishers apply owned artifacts to worktrees based on the latest `origin/dev`.

## Content Groups

The initial orchestrator supports these source groups:

1. Guides: SaaS and BYOC English documentation.
2. Python SDK: source manuals plus the active `pymilvus30` reference.
3. Java SDK: source manuals plus the active `javaV230` reference.
4. Node.js SDK: source manuals plus the active `nodejs30` reference.
5. Go SDK: source manuals plus the active `gov230` reference.
6. CLI: source manuals plus the active `cliv14` reference.
7. REST/Apifox: generated REST reference content from the configured OpenAPI inputs.

Checkpointing is per language, not per SDK version or individual command. Commands that form one logical fetch and post-processing unit must complete together before their artifact is publishable.

## Architecture

### Orchestrator

`.github/workflows/fetch-docs.yml` remains the public entry point and owns:

- `workflow_dispatch`;
- the existing schedule;
- the workflow-file push trigger;
- `contents: write` permission;
- the top-level `docs-production-dev` concurrency policy;
- capture of immutable `master_sha` and `dev_baseline_sha` values;
- creation and completion of the Lark progress card;
- parallel invocation of source producer workflows;
- the explicit sequential publication and translation dependency chain;
- final combined verification;
- aggregated success and failure reporting.

Manual dispatch accepts an optional group selection. The default selects every group. Scheduled runs always select every group.

### Reusable source producer

`_fetch-content-group.yml` accepts a typed group identifier and immutable baseline SHAs. It:

1. Checks out `master_sha`.
2. Restores generated state from `dev_baseline_sha`, using the current master version of the restoration script.
3. Installs dependencies with the existing pnpm cache.
4. Runs the current group-specific fetch and post-processing scripts.
5. Runs generated-sidebar validation and the appropriate documentation build.
6. Updates only the group-specific success snapshot after validation succeeds.
7. Creates a manifest and an artifact containing only paths owned by the group.
8. Uploads reports needed for the Lark summary.

Producer jobs never commit or push Git changes.

### Sequential source publisher

`_publish-content-group.yml` accepts the producer artifact and manifest. It:

1. Verifies the artifact checksum, group identifier, master SHA, dev baseline SHA, and path allowlist.
2. Fetches the latest `origin/dev`.
3. Creates a temporary worktree at that exact tip.
4. Applies owned files and explicit deletions from the artifact.
5. Revalidates the group in the combined latest state.
6. Creates a group-specific checkpoint commit if changes exist.
7. Pushes normally to `dev`.
8. If the remote moves, discards the temporary worktree, starts from the new tip, reapplies the artifact, revalidates, and retries a bounded number of times.
9. Returns the published commit SHA or a no-change result.

The workflow never rebases or force-pushes a generated commit. Each retry constructs a fresh commit from the newest remote tip.

### Translation workflow

`_translate-content-group.yml` runs only after the corresponding source checkpoint succeeds or reports no changes. It:

1. Starts from the source checkpoint on `dev`.
2. Uses the current translation scripts and configuration available from the approved master SHA where executable tooling is required.
3. Translates only the selected content group's eligible paths.
4. Validates translated MDX, sidebars, translation cache integrity, and the relevant build.
5. Publishes translated paths through the same non-force worktree publisher.

Translation failure does not invalidate or roll back the source checkpoint.

### Final verifier

`_verify-docs.yml` runs after every publication chain with `if: always()`. It checks out the final `dev` tip and runs:

- generated-sidebar validation;
- the complete documentation build;
- link checks;
- snapshot consistency checks;
- any existing production workflow policy tests.

Final verification failure marks the orchestrator failed but does not remove prior successful commits.

## Parallel Production and Sequential Publication

The expensive source producers run in parallel from the same captured baselines:

```text
prepare
  |-- guides producer
  |-- Python producer
  |-- Java producer
  |-- Node producer
  |-- Go producer
  |-- CLI producer
  `-- REST producer
```

Publication and translation use an explicit dependency chain:

```text
publish guides -> translate guides
      -> publish Python -> translate Python when supported
      -> publish Java -> translate Java when supported
      -> publish Node -> translate Node when supported
      -> publish Go -> translate Go when supported
      -> publish CLI -> translate CLI when supported
      -> publish REST -> translate REST when supported
      -> final verification
```

Every downstream publication job uses `if: always()` and consults its own producer result. A missing or failed artifact is recorded and skipped without preventing later groups from publishing.

GitHub concurrency groups are not used as the publication queue because they do not guarantee ordering and retain only a limited pending set. Ordering is expressed through explicit `needs` relationships.

## Output Ownership

Each artifact has a checked allowlist. The initial ownership model is:

| Group | Owned output |
| --- | --- |
| Guides | `docs/**`, `docs-byoc/**`, `config/generated/guides.sidebar.js`, `config/generated/guides-byoc.sidebar.js`, the guides snapshot, and guides-specific audit reports |
| Python | Python reference output, `config/generated/python.sidebar.js`, and the `pymilvus30` snapshot |
| Java | Java reference output, `config/generated/java.sidebar.js`, and the `javaV230` snapshot |
| Node.js | Node reference output, `config/generated/node.sidebar.js`, and the `nodejs30` snapshot |
| Go | Go reference output, `config/generated/go.sidebar.js`, and the `gov230` snapshot |
| CLI | CLI reference output, `config/generated/cli.sidebar.js`, and the `cliv14` snapshot |
| REST | REST reference output, `config/generated/restful.sidebar.js`, and intentionally published Apifox-generated metadata |
| Translation | Group-specific `i18n` output and a structurally merged translation cache update |

Before implementation, tests must confirm the exact reference subdirectories written by every configured manual in `config/lark-docs.config.ts` and the exact Apifox output set.

The following shared files must not be copied with last-writer-wins semantics:

- `.translation-cache/ja-JP.json`;
- global Lark metadata such as `docs.json`, `pages.json`, `titles.json`, or `translated.json`;
- generic link-check reports;
- any sidebar not owned by the active group.

Shared JSON state is merged structurally with tests. Global files that cannot be merged safely are regenerated during sequential publication against the latest combined `dev` state or excluded when they are runtime-only metadata.

## Artifact Contract

Each producer artifact contains:

- `manifest.json` with schema version;
- group identifier;
- `master_sha`;
- `dev_baseline_sha`;
- creation timestamp;
- owned-path allowlist identifier;
- file checksums;
- explicit deletion list;
- snapshot identifiers;
- validation commands and results;
- content payload;
- relevant report payload.

Publishers reject:

- unknown schema versions;
- mismatched groups or SHAs;
- absolute paths or path traversal;
- files outside the group allowlist;
- duplicate, overlapping, or contradictory file/deletion entries;
- checksum failures.

## Existing Implementation Integration

The refactor preserves and decomposes current behavior rather than replacing the underlying generators:

- guides continue to use the existing `fetch-lark-docs` SaaS and BYOC commands, incremental mode, post-processing, S3 behavior, and canonical-link audit;
- SDK source and active-manual commands are split from `scripts/fetch-sdk-reference-docs.sh` into language-addressable entry points or parameters;
- snapshots continue to use `scripts/update-lark-doc-snapshot.js`, with the batch wrapper split or parameterized per group;
- generated state continues to use the logic in `scripts/restore-generated-state.sh`, extended to support an immutable dev SHA rather than only a moving branch name;
- builds continue through `scripts/run-doc-build-stage.js`;
- sidebar validation continues through `scripts/validate-generated-sidebars.js`;
- Lark notes continue through `scripts/collect-build-card-notes.js`;
- Apifox continues through `fetch-apifox-docs` with its existing metadata configuration;
- translation continues through the current translation workflow scripts, cache, and validation mechanisms;
- audit and link-check reports remain available to the Lark card and as workflow artifacts.

The existing direct `git-auto-commit-action` publication steps and the special in-workflow audit-report commit block are replaced by the shared publisher.

## Failure Semantics

Each group reports one of:

- `fetch_failed`;
- `validation_failed`;
- `artifact_ready`;
- `publish_failed`;
- `source_published`;
- `translation_failed`;
- `translation_published`;
- `no_changes`;
- `skipped`.

The orchestrator continues independent groups and reports aggregate failure if any requested group fails. A successful source or translation checkpoint is durable even when a later stage fails.

## Commit Messages

Checkpoint commits identify their group and stage:

```text
docs(guides): publish fetched content
docs(python): publish SDK reference
docs(java): publish SDK reference
docs(node): publish SDK reference
docs(go): publish SDK reference
docs(cli): publish CLI reference
docs(rest): publish REST reference
i18n(guides): publish translations
```

The manifest's master SHA and originating workflow run are included in the commit body or Git notes visible in logs.

## Testing

### Unit tests

- Group command and output-ownership definitions.
- Artifact manifest creation and validation.
- Path traversal and unauthorized-path rejection.
- File checksums and explicit deletion manifests.
- Structural translation-cache merging.
- Snapshot selection per content group.
- Aggregated orchestrator status calculation.

### Git integration tests

Use a temporary bare repository to verify:

- normal fast-forward publication;
- no-change publication;
- remote `dev` moving between worktree creation and push;
- retry from the new remote tip;
- preservation of unrelated remote files and commits;
- group-owned deletions;
- refusal to force-push;
- bounded failure after repeated contention.

### Workflow policy tests

- Production workflows contain no `--force` or force push options.
- Production workflows do not use `git-auto-commit-action` to publish generated docs.
- Producer jobs have no write publication step.
- Publisher jobs form an explicit deterministic dependency chain.
- Producer jobs are independent and eligible to run in parallel.
- Translation jobs depend on their source publication.
- All downstream groups can continue after unrelated failures.

### Rollout verification

1. Run local unit and integration tests.
2. Dispatch one small group manually and inspect its artifact without publication.
3. Enable publication for that group and verify a normal dev fast-forward commit.
4. Exercise a simulated remote-move retry.
5. Run all producers with publication restricted to a test branch.
6. Run the complete orchestrator against `dev` manually.
7. Enable the schedule only after the manual full run passes.

## Operational Notes

- Artifacts have bounded retention sufficient for diagnosis and manual reruns.
- The Lark report lists source and translation status per group and links to artifacts and commits.
- A manual group selector allows rerunning only failed groups.
- The orchestrator records captured master and dev SHAs for reproducibility.
- Existing `docs-production-dev` concurrency prevents two complete orchestrators from publishing simultaneously, while publisher retry logic still protects against external dev updates.

## Success Criteria

- A late failure does not discard earlier validated source or translation checkpoints.
- All producer jobs can execute concurrently without Git writes.
- Publication order is deterministic.
- Every published commit is a descendant of the remote `dev` tip observed immediately before commit construction.
- No publication requires a force push.
- Master-only plugin or script changes are used by producers.
- Shared generated state is merged or regenerated without last-writer-wins corruption.
- A failed group can be rerun independently.
- The final Lark card reports a complete per-group outcome.
