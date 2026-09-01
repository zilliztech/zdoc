# Trusted Candidate and Publication Flow

This is the production-adjacent path for the currently supported offline workflow. Treat current repository code and contracts as authoritative; use names below as discovery anchors, not permission to bypass their checks.

## 1. Reconnaissance

- Read `README.md`, `.github/workflows/publish-offline-translation.yml`, `scripts/docs-workflow/prepare-offline-translation-publication.js`, `scripts/docs-workflow/offline-guides-publication.js`, their contract tests, and the code-to-test matrix. Use CodeGraph first when `.codegraph/` exists.
- Refresh `origin/master` and `origin/dev`. Record exact tooling SHA, target baseline SHA, source baseline/checkpoint SHA, and relevant Fetch artifact identities. Confirm no queued or running Fetch, publish-enabled Translation, offline publication, or tooling sync writer.
- If Fetch has changed since translation began, rebase/rebuild the candidate from the refreshed `dev` baseline and reauthenticate every source/target mapping. Never reuse a green `publish=false` run after baseline drift.
- Determine whether required tooling is already on `dev`. Tooling/workflow fixes go through a reviewed `master` PR and `sync-master-tooling-to-dev.yml`; candidate content remains dev-owned.

## 2. Assemble an exact candidate

- Create an isolated candidate worktree below `.claude/worktrees/`, based on the exact current `dev`. Preserve the accepted translation bytes while applying only current canonical target mappings.
- The candidate may contain only the paths allowed by the live offline Guides contract. Recompute `.translation-cache/ja-JP.json` deterministically from current source hashes and accepted targets. Do not import worker-edited cache or generated policy state.
- Investigate every apparent orphan. For a path migration, require old/new English identities and prove whether the translated bytes are preserved. For deletion, require the live reconciliation contract and evidence. Do not extend deletion semantics merely to make validation pass.
- Commit the candidate as a single auditable descendant of the exact target baseline. Push only an exact `refs/heads/offline-translation-candidates/*` ref; record its full SHA and parent. A candidate ref is staging evidence, not a content PR and not authorization to publish.

## 3. Validate before dispatch

Run `pnpm test:for-change -- <all changed workflow/tooling paths>` for tooling changes. Use the union returned by the matrix. For the current offline Guides surface this includes focused offline publication/coordinator tests, workflow policy, Translation replay, and a real retained-artifact replay against a local bare remote. Never use real `origin` as a replay remote.

Validate the candidate using the live seven-command set emitted by the workflow/report tooling. Currently this covers English Guides and BYOC MDX, Japanese Guides and BYOC MDX, generated English sidebars, Guides translated coverage, and the English build/link stage. Verify Node 22 and app-local dependencies in the exact worktree. Preserve the real replay evidence root.

Before dispatch, compare remote identities again:

- candidate ref resolves to the recorded SHA and its parent equals current `dev`;
- execution tooling equals the reviewed tooling on `dev`/master as required by the workflow;
- source/checkpoint artifacts are immutable and authenticated;
- no production writer is active;
- candidate diff contains no unauthorized content, symlink, cache rollback, or unrelated generated state.

## 4. Artifact-only rehearsal

Dispatch `.github/workflows/publish-offline-translation.yml` with the exact live inputs and `publish=false`. At the time this skill was written, the identity set is `candidate_ref`, `candidate_sha`, `source_tooling_sha`, `execution_tooling_sha`, `source_baseline_sha`, `source_checkpoint_sha`, `target_baseline_sha`, and `expected_mdx_count`; re-read the workflow before dispatch because it is authoritative. Do not omit or approximate an identity, use a branch name where a SHA is required, or copy historical values.

Wait for terminal state and download every artifact to `.claude/evidence/<descriptive-run-id>/`. Authenticate:

- selection checksum and exact repository/run/attempt identities;
- baseline/checkpoint archive manifests and file counts;
- `mode=artifact_only`, successful unit status, unchanged initial/final target SHA;
- all seven receipts and their staged/baseline identities;
- reconciliation plan contains only reviewed operations such as an exact `replace_path` or authorized `delete_target`;
- terminal verification succeeds and no `REMOTE_STATE_UNKNOWN` appears.

Refresh refs and writer state afterward. Any `dev`, candidate, tooling, or source drift invalidates this rehearsal for production. Rebuild or rerun rather than extrapolating.

## 5. Production publication

After the user has authorized publication and the rehearsal remains current, re-resolve all eight identities/counts and require them to equal the rehearsal values, then dispatch the same exact workflow inputs with `publish=true`. Do not start paid Translation. Let `docs-production-dev` serialize the writer; do not cancel or bypass it.

Monitor, in order:

1. `prepare_offline_candidate` authenticates, validates, packages selection/checkpoint/baseline/publication-ready/reconciliation artifacts.
2. `publish_ready` consumes the immutable selection and routes the unit through the standard publication coordinator.
3. Publication-time validation emits a projection bound to the staged SHA.
4. `verify_terminal_results` authenticates selection/results identities and ancestry.

On ordinary failure, inspect artifacts and remote state before deciding whether retry is safe. On `REMOTE_STATE_UNKNOWN`, stop exactly as required by the skill entrypoint.

## 6. Content-level acceptance

Download formal artifacts and inspect `publication-results.json`; require `mode=publish`, `overallStatus=success`, `orchestratorFailure=null`, the expected initial/final SHAs, published/no-changes unit status, exact result/commit SHAs, selection checksum match, and verified ancestry. Account for any final derived-state reconciliation commit rather than assuming the candidate tree is the final tree.

Compare final `dev` against the pre-publication baseline and candidate:

- every intended translation exists with the accepted byte/hash identity;
- every path replacement preserves the reviewed content identity and removes only its old path;
- every deletion and cache-key removal matches the reconciliation plan;
- new canonical cache keys carry the correct source hash, target path, and translation timestamp;
- generated inventories reflect the final tree;
- no unrelated locale, Reference cache, source content, tooling, or policy changed.

Confirm final `dev` remotely, staging cleanup/retention according to the contract, absence of active production writers, and clean/known worktree state. Retain evidence and report exact URLs, SHAs, artifact names, operation counts, file counts/hashes, and unresolved gaps.

## Recovery decision

- `published`: verify ancestry and content; do not republish.
- `no_changes`: prove the target already contains the intended tree.
- failed before writer: repair the authenticated cause and rerun only after identities are refreshed.
- partially published or terminal evidence unclear: preserve artifacts and classify unit statuses before recovery.
- `REMOTE_STATE_UNKNOWN`: safe stop; resolve remote state without mutation.

Use `.github/workflows/recover-translation.yml` only when its live contract applies to retained Translation artifacts. Start with `publish=false`; `allow_full_retranslate` is a paid path and requires explicit authorization.
