# SDD ledger — plan: docs/superpowers/plans/2026-08-24-test-governance.md

## Pre-flight scan

BASE (branch start) = 505d29365de7d72f90c14328ac28e1d256d3ae16 (`codex/master-tooling-validation`)

| # | Shared file / interface pair | Check |
|---|---|---|
| 1 | Task 1 (package.json) → Task 5 (site-validation.yml + validate-workflow-policy.test.js) | Task 5's `test_suite` job runs `pnpm test:all` produced by Task 1. Consistent. |
| 2 | Task 2 (creates test-inventory.mjs) → Task 3 (modifies it) | Task 2 `classify()` returns `{tests, orphans}`; Task 3 Interfaces block lists `{tests, orphans, untestedScripts, allowlisted}`. Interfaces ahead of Task 2 code — see R3. |
| 3 | Task 1 self-agreement | `test:all` omits test:translation/retirement/rest-publication-contract/external-link-watchdog/chat-agent-config/doc-publish-bot. Plan defect — see R2. |
| 4 | Task 2 allowlist | `tests/*.spec.ts` (Playwright e2e) not under vitest dirs nor node-test dirs → would be flagged orphan. See R4. |

## Rulings

- **R1** — Implement on current branch `codex/master-tooling-validation` (feature branch, 7 ahead of origin/master; not protected). No worktree. Cost if wrong: trivial to cherry-pick `test:` commits to a new branch later.
- **R2** — Task 1: fix `test:all` to aggregate **all** existing `test:*` scripts (frontend, containers, profiles, translation, retirement, rest-publication-contract, guides-coverage, workflow-policy, typescript-runtime-boundary, external-link-watchdog, chat-agent-config, doc-publish-bot, architecture), **exclude** `test:e2e` (Playwright, browser). Drop the plan's `test:scripts` glob — it's redundant with the per-domain scripts and misses non-test verification commands (retirement/rest-publication-contract/architecture run plain `node` scripts, not test files). Cost if wrong: if a domain script is itself broken, `test:all` inherits it — pre-existing, not introduced.
- **R3** — Task 2 returns `{tests, orphans}`; Task 3 extends to add `untestedScripts`. The Interfaces block in the plan is aspirational; execute Task 2's actual code as specified and let Task 3 extend.
- **R4** — `tests/` (Playwright `.spec.ts`) goes in the orphan-detector allowlist. `scripts/**/*.test.ts` (e.g. `scripts/translation/schema.test.ts`) is a real triage item for Task 4: `node --test` can't run `.ts` natively, so either it's covered by vitest or it's a genuine gap.

## Tasks

- Task 1: not started
- Task 2: not started
- Task 3: not started
- Task 4: not started
- Task 5: not started
