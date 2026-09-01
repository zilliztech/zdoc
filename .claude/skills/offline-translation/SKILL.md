---
name: offline-translation
description: Translate selected zdoc documents outside the paid Translation workflow, assemble an auditable candidate, and publish it through the trusted offline Translation validation, reconciliation, and publication coordinator. Use for offline ja-JP Guides translation or recovery; do not use for ordinary Fetch, Reference translation, or direct content publication.
---

# Offline Translation

Produce translations as untrusted data, then cross the repository's trusted validation and publication boundary. Never let a translation worker push `dev`, approve deletion, manufacture publication artifacts, or invoke a production workflow.

## Route the task

1. Read the repository `README.md`, live workflow, contracts, tests, and branch-ownership matrix. Historical SHAs and run IDs are evidence only. Refresh `origin/master`, `origin/dev`, workflow state, and candidate refs before every production decision.
2. If documents still need translation, read [references/subagent-translation.md](references/subagent-translation.md) and create isolated, non-overlapping worker assignments.
3. For candidate assembly, validation, reconciliation, publication, recovery, or final evidence, read [references/trusted-publication.md](references/trusted-publication.md).
4. If the requested target/group is not supported by the live offline workflow, stop before publication and propose a reviewed tooling change on `master`; do not generalize the Guides contract locally.

## Required boundaries

- Use Node 22 and the exact checkout's pnpm dependencies. For isolated builds, require `apps/docs/node_modules/jiti` before diagnosing content.
- Keep implementation/specifications below `.claude/`; use `.claude/worktrees/` for isolated Git worktrees and `.claude/evidence/` for retained evidence. Preserve unrelated user changes and worktrees.
- Translation workers may write only assigned target documents and a per-assignment receipt in an isolated workspace. They must not edit source, cache, sidebars, inventories, reconciliation policy, workflow files, or Git refs.
- Treat all worker output and offline staging as untrusted. The trusted assembler recomputes source hashes, canonical target paths, cache state, reconciliation, and validation receipts from live repository inputs.
- A missing source or changed canonical path is not permission to delete a translation. Classify it as source deletion, path replacement, generator bug, or hierarchy/configuration problem using current Fetch artifacts and source history.
- Publish tooling through a reviewed `master` PR and the standard master-to-dev sync. Publish translated content only through `.github/workflows/publish-offline-translation.yml` and its publication coordinator. Never direct-push `dev`.
- Fetch and publish-enabled Translation share `concurrency.group: docs-production-dev`. Do not bypass the queue or overlap another production writer.
- Start with `publish=false`. Use `publish=true` only after exact candidate/ref/baseline identities, reconciliation operations, seven receipts, artifacts, and remote writer state are verified. Production mutation still requires the user's authority.
- `REMOTE_STATE_UNKNOWN` is a safe stop: do not retry, force-push, reset, rebase, cancel another writer, or reinterpret it as ordinary failure.
- Do not invoke paid Translation to fill an evidence gap. Do not include deprecated `zdoc_cn` unless explicitly in scope.

## Completion standard

Do not hand off merely because a workflow is green. Report the exact candidate SHA/ref/parent, tooling SHA, initial and final `dev` SHAs, selection checksum, artifact identities, unit status, reconciliation operations, ancestry, content/cache diff, retained evidence path, active-writer check, and worktree status. Distinguish `published`, `no_changes`, unpublished, and unknown remote state.
