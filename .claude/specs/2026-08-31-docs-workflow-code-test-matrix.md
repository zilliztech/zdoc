# Docs workflow code-to-test matrix

This is the living development map for Fetch, Translation, publication, recovery, and replay changes. Its machine-readable source is [`scripts/docs-workflow/test-matrix.json`](../../scripts/docs-workflow/test-matrix.json). Keep both representations aligned in the same change.

## How an Agent uses the matrix

Pass every changed repository-relative path to the selector before editing tests:

```bash
pnpm test:for-change -- \
  scripts/docs-workflow/publication-contracts.js \
  scripts/docs-workflow/translation-recovery-planner.js
```

For a PR-sized change, let the selector derive the complete affected file set from immutable Git endpoints:

```bash
pnpm test:for-change -- --base origin/master --head HEAD
```

The selector returns the union of matched areas in execution order: focused unit/contract tests, hermetic replay harnesses, broader gates, and `git diff --check`. Use `--json` after the package-script separator when structured output is needed:

```bash
pnpm test:for-change -- --json scripts/docs-workflow/translation-recovery-planner.js
```

An unmapped path fails instead of silently suggesting incomplete coverage. Add or refine a matrix entry when introducing a new workflow surface.

## Master/dev branch and path ownership

[`deploy/contracts/master-tooling-sync.json`](../../deploy/contracts/master-tooling-sync.json) is the executable source of truth. The selector reads it directly and prints one branch policy for every input path.

| Owner | Primary directories and files | How changes reach production |
|---|---|---|
| `master-tooling` | `.github/workflows`, `scripts`, `apps`, most of `packages`, `.claude`, `deploy`, root configuration, `README.md`, `AGENTS.md`, and `package.json` | Develop on a feature branch from `master`, merge a reviewed PR to `master`, then run the validated `sync-master-tooling-to-dev.yml` PR flow when production needs the tooling. Never directly promote by pushing to `dev`. |
| `dev-published-state` | `.translation-cache`, `config/generated`, `content`, `docs`, `docs-byoc`, `generated`, `i18n`, `reference`, `sidebar-overrides/en`, and `packages/docs-tooling/src/lark/meta/{assembly,reports,snapshots}` | Fetch, Translation, reconciliation, and repair workflows update these paths under the serialized `docs-production-dev` queue. Treat them as runtime publication state and do not edit them on `master`. |
| `master-authoritative-exception` | The exact retirement/policy files and preserved landing pages listed in `masterAuthoritativePaths`, even though some live below `content` | Modify in a reviewed `master` PR. The sync contract preserves these exact files while retaining all other dev-owned publication state. |
| `sync-candidate-derived` | `deploy/contracts/localization-inputs.inventory.json` | Do not hand-edit. The master-to-dev sync workflow regenerates it on the exact merge candidate, amends the candidate commit, validates it, and only then opens/merges the dev PR. |

The current master-authoritative exceptions are:

- `config/reference-retirements.json`
- `config/translation/reconciliation-policy.json`
- `config/translation/reconciliation-policy-exceptions.json`
- `content/en/guides/tutorials/home.md`
- the preserved C++, Go, Java, Node.js, Python, REST, and CLI landing/error/versioning files enumerated by `masterAuthoritativePaths`

Do not infer ownership merely from the top-level directory: `content/**` is normally dev-owned, but the exact preserved files above are master-owned; most of `packages/**` is master-owned, but the three Lark metadata roots are dev-owned. If the ownership contract changes, update its tests, this table, and the selector in the same PR. Jenkins and release verification must use the final exact `dev` SHA, not the `master` tooling SHA or a branch name.

## Matrix

| Code surface | Modify or add tests here | Required replay harness | Broader gates |
|---|---|---|---|
| Publication diagnostics and exact owned targets (`packages/docs-tooling/src/publication/diagnostics*`) | `pnpm vitest run packages/docs-tooling/src/publication/diagnostics.test.ts`; cover identity hashing and every separately replaced path | `pnpm test:replay:fetch` | `pnpm test:workflow-policy` + `git diff --check` |
| REST OpenAPI fragments and fragment migration inventory (`packages/docs-tooling/src/reference/rest/meta/openapi/**`, `fragment-migration.json`) | `integratedSpecBuilder`, `integratedSpecArtifacts`, `fragmentCollection`, integrated-spec CLI, and completeness-receipt tests | `pnpm test:rest-publication-contract` | `pnpm test:workflow-matrix` + `git diff --check` |
| Reference navigation validation (`packages/docs-tooling/src/validation/referenceNavigation*`) | `pnpm vitest run packages/docs-tooling/src/validation/referenceNavigation.test.ts`; ordinary locales remain fail-closed, while independently generated REST navigation is validated per site without an English-structure dependency | — | `pnpm test:workflow-policy` + `git diff --check` |
| Reference Translation manifest (`packages/docs-tooling/src/reference/translationManifest*`) | Focused manifest unit and integration tests; preserve generic Translation pairing, REST generation ownership, and explicit language exclusions | — | `pnpm test:rest-publication-contract` |
| Shared Grid component (`packages/docs-ui/src/shared/components/Grid/**`) | Preserve column geometry and test the first-heading spacing behavior through the component's supported build path | — | `pnpm test:workflow-matrix` + `git diff --check` |
| Shared docs navigation, mobile drawer, embedded demos, and document-shell layout (`packages/docs-ui/src/en/theme/Navbar/{Content,MobileSidebar}/**`, `packages/docs-ui/src/shared/components/Supademo/**`, `packages/docs-ui/src/shared/theme/DocRoot/Layout/**`, `packages/docs-ui/src/shared/theme/DocItem/Layout/**`, `apps/docs/src/css/custom.css`) | Verify responsive control geometry, React-valid iframe markup, and that the document shell retains its bounded internal scroller | — | `pnpm test:workflow-matrix` + `git diff --check` |
| Shared publication schemas and adapters: `publication-contracts*`, `publication-workflow-adapters*`, Fetch/Translation/tooling adapters | Corresponding `publication-*.test.js` and adapter tests; add legacy-shape fixtures for compatibility changes | `pnpm test:replay:all` | `pnpm test:workflow-policy` |
| Shared publication runtime: scheduler, coordinator, transaction, GitHub client, strategy registry, checkpoint publication | Same-name unit tests; add fault cases at the first component that owns the behavior | `pnpm test:replay:all` | `pnpm test:workflow-policy` |
| Fetch selection, results, reconciliation, source barrier, or repair | Same-name Fetch tests and a negative identity/baseline case when contracts change | `pnpm test:replay:fetch` | workflow policy + `deploy/contracts/fetch-translation-workflow.test.mjs` |
| Translation selection, results, reconciliation, reports, and publication strategies | `pnpm test:translation` plus the closest same-name test | `pnpm test:replay:translation` | workflow policy + Fetch/Translation workflow contract |
| Offline Japanese Guides validation/publication: `offline-guides-publication*`, `prepare-offline-translation-publication*`, `offline-guides-canonical-replacements.json`, `publish-offline-translation.yml` | `node --test scripts/docs-workflow/offline-guides-publication.test.js scripts/docs-workflow/publication-coordinator.test.js`; cover exact source/execution/reconciliation checkpoints, candidate parent, target drift, cache hash, orphan deletion, canonical replacement byte preservation, symlink/path rejection, artifact pair, staging lease, and terminal coordinator routing | `pnpm test:replay:translation` plus a real retained-artifact replay against a local bare remote | `pnpm test:workflow-policy` and scoped `actionlint` |
| Offline Chinese Python Reference validation/publication: `offline-reference-python-publication*`, `prepare-offline-reference-python-publication*`, `publish-offline-reference-python.yml` | Both same-name tests plus publication coordinator/contracts; cover exact one-commit candidate parent, receipt checksum and canonical source/target hashes, no deletion or out-of-Python path, trusted manifest/sidebar derivation, standard checkpoint/baseline pair, artifact-only default, and terminal coordinator routing | `pnpm test:replay:translation` plus a live-source candidate replay against a local bare remote; retain exact SHA and archive hashes | `pnpm test:workflow-policy`, Fetch/Translation workflow contract, and scoped `actionlint` |
| Recovery planner, schema-v3 handoff, retained artifact pairs/batches, or `recover-translation.yml` | Recovery planner/workflow/handoff/artifact/batch tests; include retained legacy and rejection fixtures | `pnpm test:replay:recovery` | `pnpm test:translation` + workflow policy |
| Docs/Translation progress, cards, aggregation, and monitor state | Same-name progress/card/aggregate tests with incomplete, retry, and terminal fixtures | `pnpm test:replay:all` | workflow policy |
| Checkpoint archive construction/application, preflight, ownership, and preserved-file gates | `pnpm test:checkpoint-workflow`; add unsafe archive/path and ownership-boundary negatives | `pnpm test:replay:fetch` | workflow policy |
| Guides source cache, assembly, render, table artifacts, and sidebars | `pnpm test:guides-workflow`; update both `en` and `zh-CN` site-qualified fixtures | `pnpm test:replay:fetch` | workflow policy |
| Japanese sidebar label dictionary and generator (`config/translation/ja-JP-sidebar-labels.json`, `scripts/docs-workflow/generate-ja-sidebar-labels*`) | `node --test scripts/docs-workflow/generate-ja-sidebar-labels.test.js`; cover ordering, missing-key, and literal-label edge cases | — | — |
| Reconciliation review, generated policy (`config/translation/reconciliation-policy.json`), approval actions, policy exceptions, and mutation application | `pnpm test:reconciliation-workflow`; cover approve/reject/idempotency and exact plan identity | `pnpm test:replay:translation` | workflow policy + reconciliation-policy check |
| Manual registry, derived workflow units, content groups, or group paths | `pnpm vitest run packages/docs-tooling/src/manuals`; update cardinality/order fixtures | `pnpm test:replay:all` | workflow policy + Fetch/Translation workflow contract |
| Guides Lark source semantics, revision-pinned Docx fetch, CLI entrypoint, and sidebar writer (`packages/docs-tooling/src/lark/{guidesBaseRecordSemantics,index,larkDocScraper,larkDocWriter}.*`) | `node packages/docs-tooling/src/lark/larkDocScraper.test.js`, `node packages/docs-tooling/src/lark/larkDocWriter.beta.test.js`, `node packages/docs-tooling/src/lark/larkDocWriter.test.js`, and relevant Lark tests | `pnpm test:replay:fetch` | `pnpm test:workflow-policy` |
| Docs-tooling CLI dispatch, secure staging, validation, and atomic publication (`packages/docs-tooling/src/cli-main*`, `packages/docs-tooling/src/cli.ts`, `packages/docs-tooling/src/validation/validation.test.ts`) | `pnpm vitest run packages/docs-tooling/src/cli-main.integration.test.ts packages/docs-tooling/src/validation/validation.test.ts`; cover exact preserved paths as independent replacements when they live outside the generated output directory | — | `pnpm test:workflow-policy` |
| Shared MDX normalization (`packages/docs-tooling/src/mdx/validate*`) | `node packages/docs-tooling/src/mdx/validate.test.cjs`; preserve math delimiters and LaTeX grouping while escaping only non-math prose placeholders | `pnpm test:replay:all` | `pnpm test:workflow-policy` |
| Docusaurus config, build capability plugins, and site profiles (`apps/docs/**`, `packages/site-config/**`) | `pnpm vitest run apps/docs/src/config/createDocusaurusConfig.test.ts` and `pnpm test:profiles`; update both `en` and `zh-CN` plugin registration fixtures | — | — |
| Broken-link and canonical-link report writers (`packages/docs-tooling/src/links/**`) | `pnpm vitest run packages/docs-tooling/src/links` | — | `pnpm test:workflow-policy` |
| GitHub Actions workflow YAML | The closest workflow-specific test and deploy contract; add a negative structural assertion | The matching Fetch, recovery, or Translation harness when behavior changes | `pnpm test:workflow-policy` and scoped `actionlint` |
| Replay scripts, test matrix, package entrypoints, replay CI, README, or AGENTS | Replay harness contract and matrix selector tests | `pnpm test:replay:all` | workflow policy |
| Translation agent, chunking, review, or recovery-artifact runtime under `scripts/translation` | The closest Translation unit test plus `pnpm test:translation` | Add a publication replay only when artifact or workflow behavior changes | Change-proportional workflow gates |

## Coverage levels

1. **Focused unit/contract test:** proves the owning function rejects bad input and preserves exact output shape. Modify this test whenever code behavior changes.
2. **Hermetic integration harness:** composes real production modules with temporary repositories/artifacts and fault injection. Use the matrix-selected `test:replay:*` command.
3. **Workflow structure gate:** proves YAML job topology, permissions, concurrency, artifact names, and dispatch contracts remain connected.
4. **Real retained-artifact replay:** authenticates an actual retained run and exact artifact payloads. It is mandatory for publication/recovery behavior changes and cannot be replaced by synthetic fixtures.

For a new behavior, put the narrow assertion at level 1, the cross-module scenario at level 2, and only add a level-3 assertion when workflow wiring is involved. Preserve real replay evidence at level 4 before merge.

## Maintenance contract

- `pnpm test:workflow-matrix` validates matrix shape, path coverage, selector behavior, and fail-closed handling.
- `pnpm test:replay:contract` validates stable replay commands, CI routing, and prose entrypoints.
- `pnpm test:replay` runs both contracts before the PR-level Fetch and recovery harnesses.
- When a new production file is not matched, update the machine matrix, this document, the closest focused test, and the appropriate replay/CI tier together.

## Drift-prevention principles

- **Affected selection is graph-like, not a hand-picked test list.** The selector takes all changed files and returns the union of every matched area, following the same changed-files plus dependency-graph principle documented by [Nx affected](https://nx.dev/docs/features/ci-features/affected). Overlapping shared contracts therefore expand coverage instead of allowing a narrower row to hide downstream impact.
- **Harnesses are hermetic by default.** Temporary repositories, local artifact roots, pinned tooling, and declared inputs keep results reproducible. This follows Bazel's definition that tests should access only declared resources so failures remain attributable and auditable; see the [Bazel Test Encyclopedia](https://bazel.build/reference/test-encyclopedia) and [Hermeticity](https://bazel.build/basics/hermeticity).
- **Executable prose is tested.** Package commands, CI routing, required headings, matrix paths, and examples are checked by contract tests. This applies the same principle as Rust documentation tests, where examples compile during normal tests to keep docs and code synchronized; see [Rust documentation testing](https://doc.rust-lang.org/rust-by-example/testing/doc_testing.html).
- **Keep one stable aggregate PR check.** Fine-grained harnesses may be selected internally, but the required check should remain the stable `Site validation gate`. GitHub documents that a workflow skipped by path filtering can leave an associated required check Pending, so do not make each path-filtered harness an independent required check; see [Triggering a workflow](https://docs.github.com/actions/using-workflows/triggering-a-workflow).
- **Protect high-risk ownership files explicitly when maintainers are known.** GitHub recommends CODEOWNERS for workflow files and for CODEOWNERS itself. Add this only with verified repository teams; do not invent an owner identity. See GitHub's [secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) and [About code owners](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).
