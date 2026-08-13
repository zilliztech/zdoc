# Agent instructions for zdoc

## Scope and source of truth

These instructions apply to the repository rooted at `/Users/anthony/Documents/projects/zdoc`.

- Read `README.md` before changing publication, build, or recovery behavior. It contains the operator-facing release runbook.
- Treat the current workflow files, publication contracts, tests, and retained-artifact tooling as the implementation source of truth. Do not infer behavior from historical run IDs or old plans without live verification.
- Keep plans and specifications in `.claude/`; create temporary worktrees only below `.claude/worktrees/`.

## Repository navigation

If `.codegraph/` exists, use CodeGraph before `rg`, `find`, or opening implementation files when locating or understanding code. Use the shell form when no CodeGraph MCP tool is available:

```bash
codegraph explore "<symbol or behavior to locate>"
```

After CodeGraph narrows the area, inspect the current source, tests, and callers before editing.

## Content and generated-file ownership

- English source: `content/en`
- Chinese source and translated content: `content/zh-CN`
- Japanese translations: `i18n/ja-JP`
- Generated sidebars and manifests: `generated/<site>`
- Site configuration: `packages/site-config`
- Docusaurus app: `apps/docs`
- Shared UI: `packages/docs-ui`
- Publication and workflow tooling: `scripts/docs-workflow` and `packages/docs-tooling`

Use the site-qualified commands and workflow contracts. Do not revive retired root Docusaurus/plugin wrappers.

Chinese REST reference content is spec-generated. Preserve formal OpenAPI generation and the minimal Chinese REST Translation exclusion; do not hand-edit generated REST MDX or expand the publication architecture without an explicit task.

Do not infer deprecated `zdoc_cn` validation or compatibility work unless the current request, code path, or explicit task places it in scope.

## Local setup and verification

Use the pinned toolchain:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Common checks:

```bash
pnpm test:translation
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
pnpm typecheck
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
pnpm build:en
pnpm build:zh-CN
git diff --check
```

Run the smallest relevant focused tests first, then the broader suite proportional to the change. Never claim a check passed if it was skipped, interrupted, or only run in a different checkout without saying so.

For an isolated Chinese build or real-artifact replay, verify the intended checkout has the app-local dependency before diagnosing content:

```bash
test -e apps/docs/node_modules/jiti
```

Root-only `node_modules` resolution is not sufficient for a pnpm workspace. Use the repository's workspace dependency-linking logic or run `pnpm install --frozen-lockfile` in the exact checkout.

## Publication workflow safety

For changes involving Fetch, Translation, checkpoint publication, reconciliation, collection, or card finalization:

1. Read the relevant workflow and contract tests before editing.
2. Use the zdoc real-artifact replay procedure. Preflight every retained checkpoint archive, use an isolated local bare Git remote, restore exact generated state, run the required inventories/builds, and preserve the evidence root.
3. Never use the real `origin` as a replay remote. A replay must not modify real `dev`.
4. Fetch and publish-enabled Translation share `concurrency.group: docs-production-dev` and `queue: max`; reusable workflows must not reacquire the production queue.
5. Treat `REMOTE_STATE_UNKNOWN` as a safe stop. Do not force-push, reset, rebase, blindly retry a writer, or cancel a running production Translation to clear uncertainty.
6. Do not start paid Translation merely to fill an evidence gap. First inspect retained artifacts and use `publish=false`/artifact-only or local replay where possible. If a new paid production run is genuinely required, report the exact missing evidence and its production impact before starting it.
7. A successful Fetch run is not proof that downstream Translation completed. Authenticate the child Translation selection/results, FIFO, reconciliation, result ancestry, and terminal state separately.

Use `.github/workflows/recover-translation.yml` for Translation recovery. Start with `publish=false` to authenticate and inspect the recovery plan; enable `publish=true` only after compatibility is established. `allow_full_retranslate` is an advanced paid-model path and requires explicit authorization.

The PR-based master-tooling sync remains the normal tooling path. Do not replace it with direct promotion, delete legacy replay/diagnostic components, or start deferred follow-up tasks unless the user explicitly requests that scope.

## Git, worktrees, and user changes

- Preserve existing user modifications, including untracked files, unless the user explicitly asks to remove them.
- Before destructive cleanup, run a dry-run such as `git clean -nd`, show the exact scope, and use explicit paths. Never clean broad directories or other worktrees by default.
- Do not use `git reset --hard`, force-push, automatic rollback, or destructive branch operations unless explicitly requested.
- Keep Task-specific worktrees isolated and remove only the worktree created for the current task after confirming it is clean. Do not remove unrelated worktrees.
- Do not commit unrelated user files or generated artifacts. Before handoff, report `git status`, relevant worktree state, tests, and any unresolved evidence gap.

## Documentation changes

Keep operator procedures in `README.md` when they describe repository-wide publication, verification, or recovery. Put package-internal implementation details next to the relevant package only when they are not useful to release operators. Prefer commands and links that exist in the current repository; do not document historical or hypothetical workflow inputs as if they were supported.
