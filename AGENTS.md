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

For REST spec fragment changes, edit the authoritative OpenAPI fragment under
`packages/docs-tooling/src/reference/rest/meta/openapi/` and preserve its tag,
operation summary, schemas, and `x-i18n` fields. When adding or renaming an
operation, add the exact Chinese generated page title to
`packages/docs-tooling/src/reference/rest/meta/titles.json`; its value is the
stable slug before the generator adds `-v2`. A missing mapping fails Chinese
REST generation before `Validate and build generated docs`. Do not hand-edit
generated REST MDX, sidebars, manifests, or `i18n/ja-JP` output.

For additions, deletions, or renames, inspect and update the relevant
`fragment-migration.json`, lifecycle-evidence, manifest, and navigation
contracts, then regenerate through the supported tooling. Run
`pnpm test:for-change -- <changed-path>...` for every changed path; an unmapped
path is a matrix gap. Verify the expected generated files in a temporary
directory, run the selector command union plus
`pnpm test:rest-publication-contract`, `pnpm test:workflow-policy`, and
`git diff --check`. Remember that `build:en` includes `ja-JP` and can fail at
the build/provenance stage because a newly generated Japanese input is not
tracked, even after English REST generation succeeds; Chinese has its own
`build:zh-CN` stage and must be validated separately.

Do not infer deprecated `zdoc_cn` validation or compatibility work unless the current request, code path, or explicit task places it in scope.

### Master/dev branch ownership

Before editing, query the [code-to-test and branch-ownership matrix](.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md) with `pnpm test:for-change -- <repository-relative-path>...`. For a complete PR diff, use `pnpm test:for-change -- --base origin/master --head HEAD` so no changed workflow path is omitted manually.

- Tooling, workflows, tests, apps, ordinary packages, repository configuration, and prose are developed through reviewed `master` PRs. Production receives them only through the validated master-to-dev sync PR workflow.
- Paths listed in `devOwnedPaths` in `deploy/contracts/master-tooling-sync.json` are publication state owned by `dev`; Fetch, Translation, reconciliation, or repair workflows update them. Do not edit them on `master`.
- Exact `masterAuthoritativePaths` override a broader dev-owned root. Modify those preserved policy/landing files on `master`, then sync normally.
- `candidateDerivedPaths` are regenerated on the exact sync candidate and must not be hand-edited on either branch.
- When ownership is unclear, read the live contract and run the selector. Do not infer ownership from the top-level directory alone.

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

### Replay harness selection

Start with the living [docs-workflow code-to-test matrix](.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md). Run `pnpm test:for-change -- <repository-relative-path>...` for every changed workflow/tooling path and use the union of returned commands. An unmapped path is a matrix gap that must be fixed in the same change.

Use the smallest matching harness while developing, then expand coverage before handoff:

- Fetch selection, scheduler, coordinator, checkpoint publication, reconciliation, or Fetch card evidence: run `pnpm test:replay:fetch`.
- Recovery planner, retained Translation results/progress, legacy artifact compatibility, or `recover-translation.yml`: run `pnpm test:replay:recovery` together with the relevant focused contract test.
- Translation FIFO publication, monitor artifact authentication, or Translation card/progress behavior: run `pnpm test:replay:translation`. This is the slower scheduled suite.
- Cross-boundary changes spanning Fetch, Translation, recovery, shared publication contracts, or harness wiring: run `pnpm test:replay:all` and `pnpm test:workflow-policy`.
- `pnpm test:replay` is the PR-level replay gate. It validates harness wiring and runs the hermetic Fetch and recovery suites; it intentionally does not run the slower Translation publication replay.

When adding a new replay surface, update the machine-readable test matrix and its human-readable specification, add a focused `*.test.js` harness, expose it through a stable `test:replay:*` package script, assign it to PR or scheduled CI based on runtime, and update the replay contract test and operator prose in the same change. Synthetic fixtures and fault injection are regression tests, not substitutes for the required real retained-artifact replay. Preserve the real replay output root and report its exact command, artifact identity, and result counts.

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
