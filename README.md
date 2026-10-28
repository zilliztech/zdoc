# Zilliz Documentation

This repository builds the English/Japanese and Chinese documentation sites from one audited codebase. The two sites share tooling and UI packages, but use independent site profiles and content trees. Chinese is not rebuilt through Docusaurus i18n because its product capabilities and document structure differ from English.

## Prerequisites

- Node.js 22 or newer
- pnpm 10.33.0 (`corepack enable`)

Install dependencies with:

```bash
pnpm install --frozen-lockfile
```

## Local development and builds

English includes the Japanese translation tree:

```bash
pnpm start:en
pnpm build:en
```

Preview Japanese locally with `pnpm start:en --locale ja-JP`. The English build includes both locales and writes Japanese pages below `build/en/ja-JP`.

Chinese is an independent site profile:

```bash
pnpm start:zh-CN
pnpm build:zh-CN
```

Build output is written to `build/en` and `build/zh-CN`.

## Content ownership

- English source content: `content/en`
- Chinese source and translated content: `content/zh-CN`
- Japanese translations: `i18n/ja-JP`
- Generated sidebars and manifests: `generated/<site>`
- Site configuration: `packages/site-config`
- Docusaurus application: `apps/docs`
- Shared and site-specific UI: `packages/docs-ui`
- Content production and publication CLI: `packages/docs-tooling`

Japanese content follows the English document structure and ships as part of the English site. Agent-driven translation has three explicit targets: `ja-JP`, `zh-CN-reference`, and `zh-CN-tools`. Chinese source publication must preserve the Agent-owned `content/zh-CN/guides/tutorials/tools` subtree.

### Branch ownership

Logical content ownership above is distinct from Git branch ownership. [`deploy/contracts/master-tooling-sync.json`](deploy/contracts/master-tooling-sync.json) is authoritative:

- `master` owns reviewed tooling: workflows, scripts, apps, ordinary packages, tests, repository configuration, and prose. Merge changes through a master PR, then use the validated master-to-dev sync PR when production needs them.
- `dev` owns generated publication state under the contract's `devOwnedPaths`, including the main `content`, `generated`, `i18n`, cache, snapshot/report, legacy publication, and sidebar-override roots. Only serialized publication/reconciliation workflows should update those paths.
- `masterAuthoritativePaths` are exact policy or preserved-content exceptions inside otherwise dev-owned roots. They remain master-owned and are carried into dev by the sync workflow.
- `candidateDerivedPaths` are regenerated and validated on the exact sync candidate; do not hand-edit them. They are the localization input inventory and the REST reference derivation set (generated REST pages for en/zh-CN/ja-JP, `restful.sidebar.js`, the per-locale `rest-derivation.json` manifests, and the Reference manifest pair). They may sit below dev-owned roots and stay dev-owned for every other gate, so `master` still may not edit them; the preserved REST landing pages inside the REST output directory stay master-authoritative.

See the [code-to-test and branch-ownership matrix](.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md), or run `pnpm test:for-change -- <repository-relative-path>...` to print both branch policy and required tests. For the complete committed diff, use `pnpm test:for-change -- --base origin/master --head HEAD`.

## Content production

Use the site-qualified docs tooling commands and workflows. Do not publish by invoking retired root Docusaurus or plugin wrappers.

```bash
pnpm test:workflow-policy
pnpm test:retirement
```

GitHub Actions owns source production, translation, validation, and image build orchestration. English/Japanese and Chinese production remain independently addressable. External Jenkins UAT and Prod pipelines consume the selected repository branch through the same site-qualified build interface; Jenkins configuration is maintained outside this repository.

### Adding a new reference manual

Reference manuals (SDK/API docs such as python, java, node, go, cli, rest) are
single-sourced from `packages/docs-tooling/src/manuals/registry.ts`. Adding a
new manual is a registry change plus generated-artifact regeneration; do not
hand-edit navigation, sidebars, validation sets, or translation policy.

1. Add a definition to `packages/docs-tooling/src/manuals/registry.ts` with
   `kind: 'reference'`, the remote/local `sources`, `publications`, and a
   `presentation` block (see an existing manual such as node). The registry
   validator requires
   `presentation` for reference manuals and cross-checks sidebar,
   `documentIdPrefix`, and `landingPage` consistency.

2. Regenerate all derived artifacts and run the drift checks:

   ```bash
   pnpm generate:lark-config
   pnpm generate:reconciliation-policy
   pnpm generate:reference-presentation
   pnpm check:lark-config
   pnpm check:reconciliation-policy
   pnpm check:reference-presentation
   pnpm check:localization-input-inventory
   ```

   This updates `config/lark-docs.config.ts`,
   `config/translation/reconciliation-policy.json`,
   `config/reference-navigation.json`, the generated site-config fragments
   (`packages/site-config/src/generated/referencePresentation.ts`, sidebars
   `{en,zh-CN}/reference.ts`), and the docs-ui reference targets module
   (`packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts`).

3. Update the static deploy contract `deploy/contracts/path-filters.json`: add
   `generated/en/sidebars/<sidebar>.sidebar.js` (where `<sidebar>` is the manual's
   `presentation.sidebar`) to `canonicalEnglishReference.include` and to
   `siteOwned.en.exclude`. `check:reference-presentation` fails with a drift
   error until this is done.

4. Update the static CI input list in `.github/workflows/fetch-docs.yml`: the
   `group` input description lists valid groups, and the `prepare` job's `case`
   enumerates known groups. Add the new manual id to both (GitHub Actions
   workflow_dispatch inputs cannot be derived from the registry).

5. Update test fixtures that hard-code the group list
   (`['guides','python','java','node','go','cli','rest']`) to include the new
   manual id. These live in `scripts/docs-workflow/*.test.js`,
   `scripts/translation/*.test.js`, `scripts/*.test.js`, and
   `packages/docs-tooling/src/**/*.test.ts`; run the affected suites after
   updating them.

6. Verify: `pnpm typecheck`, `pnpm test:workflow-policy`,
   `pnpm vitest run packages/docs-tooling/src/manuals`, the docs-workflow and
   translation node:test suites, and `pnpm build:en`. For a first real fetch,
   dispatch `fetch-docs.yml` with `publish=false` and
   `run_translations=false` to validate the matrix and selection before any
   production publish.

### Editing REST spec fragments

REST interfaces are generated from the OpenAPI fragments under
`packages/docs-tooling/src/reference/rest/meta/openapi/`. Treat a fragment
change as a source-and-contract change; do not hand-edit generated REST MDX,
Chinese REST sidebars, or Japanese REST translation files.

When adding an operation:

1. Add or update the operation in the correct fragment, including its HTTP
   method, path, tag, `summary`, request/response schemas, and localized
   `x-i18n` fields. Keep the fragment registered in
   `meta/fragment-migration.json` when it is part of the formal REST
   publication set.
2. For every operation generated for `zh-CN`, add the exact page title used by
   the Chinese generator as an entry to
   `packages/docs-tooling/src/reference/rest/meta/titles.json`. The value is
   the stable English slug without the automatic `-v2` suffix. For example,
   `创建 Spark 回填任务` maps to
   `create-spark-backfill-job`. Missing this entry fails Chinese REST
   generation before the site build.
3. Check whether the change affects lifecycle evidence, manifest inputs,
   generated sidebars, or translation ownership. These are derived outputs
   and must be regenerated by the supported tooling, not edited manually.
4. Run `pnpm test:for-change -- <changed-path>...` for every changed source,
   metadata, workflow, or test path. A selector failure means the code-to-test
   matrix is missing an entry and must be handled in the same PR.
5. Before submitting, run the selector's full command union,
   `pnpm test:rest-publication-contract`, `pnpm test:workflow-policy`, and
   `git diff --check`. Also run the Chinese REST generator in a temporary
   output directory and confirm the expected MDX filenames, titles, and slugs.

When deleting or renaming an operation, remove it from the source fragment and
update the corresponding fragment migration/lifecycle evidence and any
explicit navigation or manifest contract that refers to it. Verify the
generated diff contains the expected deletion or rename and no unrelated
generated files. A deleted generated page may also leave a translation input
or cache entry; let the reconciliation tooling classify and handle that
change rather than deleting translation files directly.

REST publication also produces one `generated/<locale>/manifests/rest-derivation.json`
for each generated locale. The English REST lane owns the `en` and `ja-JP`
manifests; the Chinese REST lane owns `zh-CN`. Each manifest binds the complete
OpenAPI fragment set by SHA-256 to the exact generator tooling commit, and the
Fetch validation, the atomic publication boundary, and `write-provenance.mjs`
at the end of every site build recheck those fragment hashes
(`REST_DERIVATION_FRAGMENT_DRIFT`). These files are dev-owned publication state
and must never be edited on `master`.

Because the fragments are master tooling while the generated pages and
manifests live on `dev`, the master-to-dev sync regenerates the whole REST
derivation set on its exact merge candidate
(`scripts/docs-workflow/regenerate-sync-candidate.js`, see
[the sync specification](.claude/specs/2026-08-03-master-tooling-dev-sync.md)).
After a fragment PR merges, expect the resulting sync PR to carry the
regenerated REST pages, sidebars, and manifests, plus a child commit that
reconciles the Reference manifests and localization inventory when the pages
changed; the sync does not wait for the next Fetch. Fetch's REST lanes keep
publishing the same bytes on their schedule.

The English build runs both English and Japanese locales. A new REST operation
can therefore fail later, during `Validate and build generated docs`, if its
generated Japanese localization input is untracked or lacks valid candidate
provenance, even when English generation succeeded. The Chinese producer has a
separate `build:zh-CN` path and the Chinese `titles.json` check happens earlier,
but it must still pass its own validation and build stage after generation.

For a new interface, the minimum review checklist is: source operation and
`x-i18n`; Chinese title mapping; fragment/lifecycle/manifest contracts; test
matrix coverage; generated English/Chinese output; and the English build's
Japanese localization provenance.

## Production publication runbook

> Pipeline map: [`fetch-translation-pipeline-map.md`](.claude/specs/2026-08-29-fetch-translation-pipeline-map.md) — the phase-by-phase flow, artifact contracts, the 4 Git push points, and the known failure modes with their recovery entries.

The normal production entry point is [`fetch-docs.yml`](.github/workflows/fetch-docs.yml). It publishes the selected English source units to `dev`, performs final verification, and can dispatch one downstream Translation workflow. Every `dev` writer is serialized through the `docs-production-dev` concurrency group with `queue: max`; do not bypass that queue with a second manual writer. Translation and operator recovery both use the short production lock: the paid producer run stays in a unique read-only group (`translation-readonly-*` or `translation-recovery-readonly-*`), and when it finishes it dispatches [`publish-translation.yml`](.github/workflows/publish-translation.yml), which owns `docs-production-dev` only for the publication transaction (Fetch and offline publication keep their existing whole-run queue ownership). The publisher also refuses a producer selection whose units were already superseded by a successful operator recovery, so a stale retained selection cannot be re-dispatched after its recovery published.

Incremental Translation reuses unchanged published semantic-unit translations only when it is explicitly enabled. Set the Actions repository variable `TRANSLATION_SEMANTIC_SEEDS=true` to turn it on for pipeline-triggered runs (or pass the `semantic_seeds` input on a manual dispatch); remove the variable to fall back to full per-file retranslation. Each run's translation report shows `Seeded files` and `Seeded units` so the reuse rate is observable.

Japanese translation also carries two quality assets maintained on `master`. The authoritative Japanese and Simplified Chinese house styles live in [`.github/prompts/codex-style-guide.ja-JP.md`](.github/prompts/codex-style-guide.ja-JP.md) and [`.github/prompts/codex-style-guide.zh-CN-reference.md`](.github/prompts/codex-style-guide.zh-CN-reference.md); each is registered as the target's `style` prompt and injected into every translation stage between the locale contract and the stage prompt, and each participates in the recovery prompt-contract hash (`promptContractSha256`), so editing one changes that target's recovery compatibility exactly like any other prompt change. A read-only translation-memory helper backs style and terminology retrieval: `node scripts/translation/tm-retrieve.js --repository <abs> --checkpoint <sha> --page <content/en/...>` returns published EN/JA neighbor pairs with anchor-aligned excerpts, and `--render-fewshot` renders them as a prompt block; it is offline tooling and no workflow invokes it yet. An experimental whole-file agentic provider is also wired behind a repository variable: setting `TRANSLATION_PROVIDER=agentic` (with `DEEPSEEK_API_KEY`/`DEEPSEEK_BASE_URL`, optionally `AGENTIC_TRANSLATION_MODEL`, default `deepseek-flash`; and `AGENTIC_REASONING_EFFORT`, one of `none|minimal|low|medium|high|xhigh|ultra|max`, default `medium`) makes the Translation producer run `scripts/translation/agenticProvider.js` — file-level agent sessions with bounded deterministic repair — instead of the unit pipeline; remove the variable to return to the default. The provider always pins the codex reasoning wire shape to `reasoning: {effort: <value>}` with summaries disabled: Responses gateways built on litellm up to v1.100 forward the whole reasoning object as `reasoning_effort` whenever it carries a `summary` key, which the DeepSeek API rejects with 422 before any paid turn. Its surgical incremental lane (`scripts/translation/surgicalUpdate.js`) updates changed files in place against the source delta — unchanged bytes pass through untouched — behind the same provider; lane selection is a deterministic section-hash classifier and a protected-token guard proves link/anchor/code updates landed. See [the design spec](.claude/specs/2026-09-11-translation-quality-assets-design.md) for the asset roadmap.

An hourly [`translation-dispatcher.yml`](.github/workflows/translation-dispatcher.yml) keeps the Japanese and Chinese reference translations aligned with published English sources. Each cycle it counts pending files per translation unit through the producer's own manifest selection, merges the result into a persisted task-list artifact (`translation-dispatch-plan-<run>`; completed items are checked off by git state, not bookkeeping), and — when no producer or publisher run is active — dispatches one `translate-codex` producer run in `mode=auto` with `publish=true` for the budgeted set of backlogged groups (default 300 pending files, largest group first; a single group larger than the budget still dispatches alone so rotation never stalls). Guides carries an additional per-run pending-file cap (`guides_max_files`, dispatcher default 150, 0 disables) that binds only in incremental mode — a capped run resumes its remainder on the next cycle. The dispatcher never owns the production queue, and it stops without dispatching whenever producer activity cannot be determined; a counting failure fails the cycle closed. Arming: set the repository variable `TRANSLATION_DISPATCHER_DISPATCH=true` to let scheduled cycles dispatch (the default is dry-run decision logs only); a manual dispatch with the `dispatch` input forces one armed cycle regardless of the variable. Disable by deleting the variable or disabling the workflow.

Armed cycles carry three guards. A **source build gate** builds the current `dev` tree (`build:en`) before dispatching and attributes failures to the dispatch set: broken English source blocks its whole group (both locale tracks ride together), while broken translated files never block — translated output is pipeline-owned, so dispatching is its only repair path. The build verdict is cached per dev HEAD; a red build whose failures cannot be attributed fails the cycle closed. Route failures are matched back to files by their slug segment, so two pending files sharing a basename across groups leave that route unattributed and the cycle skips closed (surfaced as a `build-red` alert) until dev moves or one group clears. A **dispatch backoff** blocks a unit after two failed producer conclusions on the same source checkpoint (a newer checkpoint reopens it automatically); a failed run's completed batches are usually salvageable through [`recover-translation.yml`](.github/workflows/recover-translation.yml) with `previous_translation_run_id=<run>` and `publish=false` rather than a fresh paid dispatch. **Guard alerts** (source-gate blocks, backoff engagements, unattributable red builds, broken translated files or translated pages with no scheduled repair) land as one Feishu card per cycle, deduplicated by identity; they are governed by their own mute variable `TRANSLATION_DISPATCHER_ALERTS_DISABLED` — unset sends, `true`/`1` mutes without consuming the events (unmuting replays whatever fired while muted) — independent of the repository-wide Feishu notification kill switch.

### Before publishing

1. Confirm that the intended tooling is already on `dev` through the PR-based [`sync-master-tooling-to-dev.yml`](.github/workflows/sync-master-tooling-to-dev.yml) workflow. The candidate must be an exact master commit and the resulting merge must be identifiable in the workflow and PR history.
2. Check the current `dev` tip and make sure no production Fetch, Translation, or tooling run is already active.
3. For a risky workflow or artifact change, run the repository tests and a local real-artifact replay first. A replay must use real retained checkpoint archives, a local bare Git remote, the exact validation commands and site environment, and an isolated dependency layout. It must never push to the real `origin`.

### Replay harnesses

Use the [docs-workflow code-to-test matrix](.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md) to map changed files to focused tests, replay harnesses, and broader gates. `pnpm test:for-change -- <repository-relative-path>...` prints the required command union and fails when a workflow path is not mapped.

Use the stable package scripts so local development and CI exercise the same suites:

- `pnpm test:replay:fetch` covers Fetch FIFO publication, fault injection, final business evidence, and local-remote safety.
- `pnpm test:replay:recovery` covers retained Translation selection/results/progress authentication, legacy REST exclusion, recovery-map construction, and non-mutating fault overlays.
- `pnpm test:replay:translation` covers Translation FIFO publication and monitor artifact authentication; it is slower and runs on the scheduled replay workflow.
- `pnpm test:replay:requested` covers the requested Guides fetch surfaces (planner closure, state-merge receipts, checkpoint scope) against a committed real-data slice extracted from retained production artifacts.
- `pnpm test:replay:shared-pages` exercises selected shared Guides generation, authenticated source artifacts, offline tables, fresh assembly, immutable image uploads and a real checkpoint transaction against a local bare remote. It also compares ordinary Feishu output with valid and malformed inactive configuration.
- `pnpm test:replay` is the PR-level contract + Fetch + recovery + requested Guides + shared-pages gate.
- `pnpm test:replay:all` runs every hermetic replay suite before a cross-pipeline merge.

The replay harnesses use the platform system temporary directory for their isolated lanes, replicas, and evidence roots. The translation replay harness accepts an explicit override via `ZDOC_REPLAY_SAFE_ROOT` when the default is not appropriate.

Before accepting shared Fetch publication changes, additionally run the full local evidence mode:

```bash
node scripts/docs-workflow/replay-shared-pages.js \
  --evidence-root /absolute/path/to/shared-pages-evidence \
  --legacy-baseline --site \
  --site-baseline-repository /absolute/path/to/local-retained-replay-repository \
  --site-baseline-sha <exact-successful-local-replay-commit>
```

`--legacy-baseline` executes the exact pre-WP9 implementation at
`5cbe28d2ade931d242b4443547002c6670cf0c92` against the same fixed-time ordinary
Feishu inputs, including an anchored Base ref. It compares every emitted
content/sidebar/snapshot blob and source file, and fails if that commit is
unavailable locally. The PR suite uses only current code and does not claim
this historical comparison. To compare a newer locally available upstream commit,
use `--comparison-baseline-sha <exact-40-character-commit>`; this also enables
exact comparison. If that commit contains `shared-docs/guides`, both lanes copy
its actual inactive configuration tree unchanged (and separately corrupt one
inactive page for the malformed case). The evidence records the consumed tree
and every configuration file's SHA256. For the onboarded Delete Entities case,
the reviewed baseline is `ecad317f6ce55270bdcc5be49f5f7d6becbf7d8a` (#861).
This never fetches history or generates from that real upstream content.
`--site` requires an installed Google Chrome and
linked workspace dependencies. Supply a local repository and exact successful
retained replay commit; the mode restores its complete generated state with
the supported exact restore command, then overlays synthetic shared outputs
and regenerates/tracks the localization inventory. It builds this isolated site with
`pnpm build:en` (including Japanese), then uses an isolated browser profile to
serve the assembled site, switch Python/Java Tabs, follow a body link and Base ref,
and check headings, edit URLs and decoded images served from the fixture store. It contacts no
Feishu or image-store service. Coordinate this memory-intensive mode with
other site builds. The site fixture uses CURRENT pages with identical current/next
locks and an ungated heading initially below the viewport, matching the pilot's
shape. Acceptance requires actual ref navigation to bring that heading into view;
it does not manually scroll or require an arbitrary pixel alignment. NEXT channel
preservation remains covered by the focused replay. The separately preserved
NEXT-heading timing probe is an existing deferred site-UI issue, not this gate.

The command preserves `shared-pages-report.json`, `shared-site-build.log`,
`shared-site-browser.json`, screenshots, the synthetic source/assembly roots,
and its local bare remote. Temporary historical source and site checkouts
are restricted to `.claude/worktrees/`. The report explicitly labels these
fixtures as synthetic regression evidence. Keep the site checkout until the
browser evidence has been reviewed; remove only that clean task-owned copy.
The separate retained-artifact replay below is still required.

These hermetic suites are regression harnesses; they do not replace a real retained-artifact replay. For a recovery change, prepare an isolated snapshot root containing `run.json`, `attempt.json`, `jobs.json`, `artifacts-unique.json`, `artifact-directories.json`, and the mapped artifact directories, then run:

```bash
node scripts/docs-workflow/replay-recovery-plan.js \
  --snapshot-root "$ZDOC_RECOVERY_SNAPSHOT" \
  --output-root "$ZDOC_RECOVERY_OUTPUT" \
  --repository zilliztech/zdoc \
  --execution-tooling-sha "$ZDOC_RECOVERY_TOOLING_SHA" \
  --target-baseline-sha "$ZDOC_RECOVERY_TARGET_SHA" \
  --publish false
```

The snapshot and output roots must be distinct absolute paths below the platform's system temporary directory (or the safe root explicitly set with `ZDOC_RECOVERY_REPLAY_SAFE_ROOT`), and the output root must be empty. The harness authenticates the original retained identity, never pushes Git state, never invokes paid Translation, and writes fault injection to a separate overlay. Use `--simulate-failure` only for synthetic regression scenarios, for example `translation/ja-JP/guides,translation/zh-CN-reference/python`. Preserve the generated `recovery-plan.json`, selection SHA, target baseline, recovery units, rejected units, retained-file count, and source-candidate count as merge evidence.

### Replay the requested Guides workflow against real retained artifacts

`pnpm test:replay:requested` runs hermetically against a committed real-data slice. Before enabling or changing `publish=true` behavior in `fetch-guides-requested.yml`, additionally replay the complete retained artifacts of a recent successful Fetch run:

1. Pick a successful `fetch lark docs` run on `dev`, note its run ID, attempt, `masterSha`, and `devBaselineSha` from the checkpoint manifest.
2. Download the retained `guides-sources-en-<run>` artifact, the `docs-checkpoint-guides-en-<run>` artifact, and the Guides table artifacts for the run's affected tables into an isolated evidence root (never the real `origin`), recording each artifact ID and `sha256` in a `manifest.txt` line format `<id> <name> <sha256>`.
3. Extract `guides-source.tar` and the checkpoint/table archives below `artifacts/` in that root and write a `real-context.json` describing the run identity, the baseline snapshot path (from `git show <devBaselineSha>:packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json`), the candidate snapshot path, the source directory, the site root token, and the table artifact manifest directories.
4. Run `REPLAY_REQUESTED_GUIDES_ROOT=<evidence-root> pnpm test:replay:requested`. The harness verifies every recorded digest, preflights the checkpoint archive, replays the stable-table, outline-change, cross-table-move, and closure-external-conflict scenarios, and proves the ordinary automatic planner still detects the external change after a blocked requested run.
5. Preserve the generated `replay-report.json` (run identity, artifact digests, checkpoint file count, per-scenario plan/receipt hashes, isolation results) as the merge and rollout evidence.

### Start and monitor a publication

For a normal full release, dispatch `fetch lark docs` with:

- `group=all`
- `target_branch=dev`
- `publish=true`
- `media_upload_mode=write`
- `run_translations=true` when the downstream Translation handoff is required
- the intended `tooling_ref` and `source_ref` (normally `master` and `dev`)
- `force_full_fetch=true` only for a manual full Guides re-fetch; it bypasses incremental planning for the en and zh-CN Guides source stages (scheduled runs always stay incremental)

Use `publish=false` only for an artifact-only validation. `media_upload_mode=skip` is restricted to the controlled artifact-only Guides validation contract; it is not a production publish mode.

Monitor the parent run through these boundaries, in order:

1. producer jobs create and validate the immutable checkpoint artifacts;
2. `publish_ready` consumes the immutable selection and publishes in producer-completion FIFO order;
3. `reconcile_reference_state` performs the allowed generated-state reconciliation;
4. `source_publication_barrier` proves every required source group succeeded before paid Translation is dispatched;
5. `prepare_translation_handoff` writes the schema-v3 handoff bound to the exact source commits and reconciled target SHA;
6. `dispatch_translations` starts the single child Translation run;
7. `verify`, `aggregate`, and card finalization reach terminal state.

Do not treat a successful parent run as proof that Translation finished. When Translation is requested, open the child run from the parent handoff metadata and wait for its own terminal `aggregate`/`publish_ready` evidence. The final production identity is the reconciled `dev` SHA, not merely the last producer result.

### Feishu progress cards and the notification kill switch

Fetch and Translation runs report progress through Feishu cards created by `pnpm docs-tooling report-card`, and the scheduled watchdogs (`docs ingestion watchdog`, `External Link Watchdog`, `Broken Links Report`) post alert cards only when they detect a problem. Card sending is non-essential reporting: every card step is best effort, and monitor jobs start only when a card exists.

To silence all workflow Feishu cards without touching the Feishu app credentials (which Fetch also uses to read source content), set the repository variable `FEISHU_NOTIFICATIONS_DISABLED` to `true` in GitHub Actions settings. The five card-sending workflows forward it to `docs-tooling` through their root `env`, the `report-card` command skips every action without contacting Feishu, and the resulting empty `card_id` output keeps all monitor and downstream card jobs disabled. Unset the variable, or set it to any other value, to restore notifications — no code or workflow change is required. This switch does not affect Feishu bitable reporting (`report-broken-links`, `report-external-links`) or Fetch content reads.

### Evidence required after a successful run

Record the run URLs and retain these facts before handing off to Jenkins:

- Fetch selection and terminal results, including the runtime FIFO and final `dev` SHA;
- every successful result SHA is an ancestor of the final target;
- source publication barrier and final verification passed;
- localization input inventory and English revision inventory passed;
- Guides reports were collected for both `en` and `zh-CN`, and the final card contains exactly nine available notes with no `Unavailable` entry;
- if Translation ran, its own selection/results, reconciliation result, FIFO order, ancestry, and absence of unknown remote state — for a split run, the selection/results live in the producer run while the publication progress/results artifacts are uploaded by the publisher run (linked from the producer's `dispatch_publication` job and the `docs-translation-publication-handoff-*` metadata artifact);
- the exact `dev` SHA that Jenkins builds.

Jenkins should be started or inspected only after the exact SHA is known. Confirm that the build label contains that SHA and that the intended target (for example `EN+CN → UAT`) is shown. A branch name alone is not sufficient evidence.

### Failure handling and recovery

Stop at the first failed boundary and classify the failure before retrying:

- **Prepare or producer failure:** no publication writer should have run. Inspect the failed job log, selection, and checkpoint artifact preflight. Fix the local cause and rerun the same workflow inputs; do not start Translation from a partial handoff.
- **Validation or known Git publication failure:** inspect `publication-results.json`, the unit failure code, and the target tip. Ordinary unit failures may allow later ready units to continue, so use the terminal results rather than assuming that a failed producer means nothing was written.
- **`REMOTE_STATE_UNKNOWN`:** treat the run as a safe stop. Do not cancel a running production Translation, force-push, reset, rebase, or blindly rerun the writer. Inspect the remote branch, candidate/result SHAs, and the exact probe evidence first. Resume only after the remote state is known.
- **Reference reconciliation failure:** source publication may already be present. Preserve the run artifacts, verify the published ancestry, and repair or rerun only the reconciliation boundary after confirming the current target tip. Do not pay for Translation again until the source barrier and schema-v3 handoff are valid.
- **Translation unit failure:** a normal unit failure is recorded and later ready units can continue; an unknown remote state stops later writes. Inspect the child run's unit results, reports, remaining count, and reconciliation output before deciding whether recovery is needed.
- **Expired or incompatible Translation artifacts:** use [`recover-translation.yml`](.github/workflows/recover-translation.yml) with the previous Translation producer workflow run ID (not a job ID, and not the `publish translation` publisher run ID). For a split run the planner reads the `docs-translation-publication-handoff-*` metadata artifact to discover and authenticate the publisher run's progress/results evidence automatically. First run with `publish=false` to authenticate the recovery plan and inspect rejected units. Only after the plan is compatible should you rerun with `publish=true`; the recovery run translates on its own read-only concurrency group and publishes through the `publish-translation.yml` short lock like any other producer. The plan excludes units whose retained files are already superseded on `dev` by a newer published source generation (listed under rejected units with reason `superseded source generation`); those units belong to a fresh translation, not to recovery. `allow_full_retranslate=true` is an advanced, explicitly authorized path for the case where no retained file is compatible; it may invoke paid models and must not be enabled casually. Prompt-contract changes (for example, editing the Japanese style guide or advancing the locale contract) do not invalidate retained artifacts outright: records downgrade from `strict` to `revalidated` and are restored or resumed after passing the current deterministic gates, while review receipts are not inherited across the boundary.
- **Reconciliation review:** a `translation-reconciliation-review-*.json` artifact is produced when a deletion or path change requires human authorization. Generate the deterministic approval PR with `scripts/docs-workflow/reconciliation-review-pr.js`, review the exact plan, expected mutations, source/target identities, and policy exception body, then merge only when the decision should remain standing. Do not hand-edit or push policy files directly to `dev`; after merge, run the normal master-to-dev tooling sync.
- **Card/reporting failure:** the card is observability, not the Git writer. Preserve the publication selection/results and final verification artifacts, then use the final card artifact or monitor finalization evidence to determine whether the business flow actually succeeded.
- **Every `build:en`-gated publication fails on a file already on `dev`:** pipeline-owned output (translated pages, generated state) can deadlock the whole pipeline — see [Unlock dev when pipeline-owned output blocks every build](#unlock-dev-when-pipeline-owned-output-blocks-every-build).

### Unlock dev when pipeline-owned output blocks every build

A broken file that is already published on `dev` (for example invalid YAML front matter in a translated reference page — incident 2026-10-24, commit `460f7d921`) deadlocks the pipeline: every `build:en`-gated validation fails, so Fetch cannot publish the source change that would trigger retranslation, and no workflow can repair the file by itself. A manual hotfix commit to `dev` is then the only repair path, and it must follow this exact pattern. `dev` currently has no branch protection, so the guardrails are procedural:

1. **Confirm the true fatal cause before touching anything.** Publication failure messages carry only the first 500 characters of stderr and can mislabel the cause (the 2026-10-24 incident surfaced as "Docusaurus found broken links" — a perennial non-fatal warning — while the fatal error was a YAML exception). Reproduce the failing gate locally on the failing tree, or validate the suspect file directly, before concluding.
2. **Verify the deadlock actually holds.** The pattern applies only when no normal path can self-heal: the broken file is pipeline-owned (translated output or generated state, never hand-authored source), the pending source change would have to land through the same failing gate, and no retained recovery artifact can republish a good version. If the English source can still land or a recovery run covers it, use the normal paths instead.
3. **Repair in an isolated worktree, broken bytes only.** Start from the current `origin/dev` tip in a detached worktree, change exactly the broken bytes in exactly the broken file, and do not "improve" anything else in the same commit.
4. **Run the failing gate locally before pushing.** Install in the worktree and run the gate that was failing in CI (for a `build:en` deadlock, `pnpm run build`). Never push an unverified hotfix — a hotfix that fails the next run doubles the incident.
5. **Confirm no production writer is active, then push forward-only.** Check that no Fetch/Translation producer or publisher run is in flight (a manual push bypasses the `docs-production-dev` queue), then `git push origin HEAD:dev` from the worktree. Any rejection (non-fast-forward) is a safe stop: stop and re-diagnose. Never force-push, reset, or rebase `dev`.
6. **Close the loop.** Watch the next Fetch run land the previously blocked units, and file the tooling gate that would have caught the file class at the publication boundary as a `master` PR, so the manual unlock stays a last resort.

```bash
git fetch origin dev
git worktree add --detach .claude/worktrees/dev-hotfix origin/dev
cd .claude/worktrees/dev-hotfix && pnpm install --frozen-lockfile
# fix only the broken bytes in the one broken file, then:
pnpm run build                     # the exact gate that was failing in CI
git commit -am "hotfix(dev): repair <path> (<incident reference>)"
git push origin HEAD:dev
```

### Migrate the Japanese publication manifest

After the migration tooling has reached `dev` through the normal master-to-dev sync, run the migration against an isolated checkout of the exact current `dev` commit. The retained-report receipt binds legacy cache entries to authenticated Translation run artifacts and source checkpoints; the command still verifies every checkpoint source blob and current Japanese target hash before writing the manifest.

```bash
node scripts/translation/migrate-ja-publication-manifest.js \
  --repository <isolated-dev-checkout> \
  --source-commit <exact-dev-sha> \
  --revision HEAD \
  --source-evidence deploy/evidence/ja-publication-source-checkpoints-2026-09-08.json \
  --audit-output <absolute-audit-output>
```

A nonzero rejected count is a safe stop. Do not edit the generated Japanese manifest or substitute a newer source hash. Preserve the audit output, receipt checksum, exact `dev` SHA, and subsequent Japanese validation/build logs with the migration PR.

### Precheck a translation diff with the fast-path validator

Before opening a PR for hand-validated translated content on top of `dev`, run the local fail-closed precheck from an isolated worktree whose `HEAD` is based on the current `origin/dev`:

```bash
node scripts/translation/fastpath-precheck.js --locale <ja-JP|zh-CN> --path <repository-relative-path>...
```

The precheck derives its scope from the [evidence equivalence groups](.claude/specs/2026-09-04-publication-evidence-chains-unification-design.md): Japanese Guides and Japanese Reference diffs are validated against the Japanese translation manifest, Chinese non-REST Reference diffs regenerate `reference-translations.json` through `reference-manifest --write`, Chinese Guides diffs ride the fetch-group publication manifest, and Japanese REST output is checked against the per-locale `rest-derivation.json` fragment hashes. It then executes every selector command plus `validate-reference` for the affected sites, re-checks `origin/dev` for drift, and writes `report.json`/`report.md` under `tmp/translation-fastpath/<run>/`. Only `READY_FOR_PR` exits `0`; every other status is a safe stop, and the tool never commits, pushes, or acquires the production queue.

### Publish retained Japanese Guides offline

Use [`publish-offline-translation.yml`](.github/workflows/publish-offline-translation.yml) only when authenticated Japanese Guides output already exists but cannot truthfully satisfy the schema-v2/v3 Translation batch-set contract. This path does not invoke Translation or review agents and does not synthesize `translation-guides-batch-set` evidence. It validates one exact candidate commit and promotes it through the normal publication coordinator.

Prepare the candidate only after the reviewed workflow tooling has been synced to `dev`:

1. Refresh `origin/dev` and record its exact SHA as `target_baseline_sha`. Create `refs/heads/offline-translation-candidates/<name>` as one commit whose only parent is that SHA.
2. Limit the commit to Japanese Guides Markdown under the two `current/tutorials` roots, `.translation-cache/ja-JP.json`, and, when regenerated, the two exact sibling locale files:
   - `i18n/ja-JP/docusaurus-plugin-content-docs/current.json`
   - `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json`
3. Update one cache entry for every changed translated file. Its `sourceHash` must equal the raw source bytes at `source_checkpoint_sha`; unrelated cache mutations, symlinks, executable files, and paths outside the fixed allowlist are rejected. Supply `reconciliation_source_checkpoint_sha` as the exact published English Guides checkpoint that follows the retained Translation checkpoint. The workflow generates a standard `ja-JP/guides` reconciliation plan from `source_checkpoint_sha` to that checkpoint. Every target deletion must match that plan. An orphan deletion removes every exact cache entry for the deleted target. A canonical replacement reviewed in [`offline-guides-canonical-replacements.json`](deploy/contracts/offline-guides-canonical-replacements.json) must atomically remove the old target/cache keys, add the new target/cache keys, preserve the Japanese bytes and cache provenance exactly, and change only each migrated cache entry's key and `targetPath`. A preserved old `sourceHash` intentionally keeps later Translation source-drift detection active.
4. Push the candidate ref without rewriting it. Record both tooling identities separately: `source_tooling_sha` is the tooling used by the retained Translation run, while `execution_tooling_sha` is the reviewed master commit containing the offline validator. The former must be an ancestor of the latter.

### Validate retained Chinese Python Reference translations offline

Use [`publish-offline-reference-python.yml`](.github/workflows/publish-offline-reference-python.yml) only after its tooling has landed on `master` and reached `dev` through the standard master-to-dev sync. The MVP is fixed to `translation/zh-CN-reference/python`; it does not accept REST, Reference landing pages, another SDK group, deletions, renames, or worker-generated manifests and sidebars. Chinese REST remains spec-generated.

1. Refresh `origin/dev`. The MVP requires `source_checkpoint_sha` and `target_baseline_sha` to be the same exact current `dev` SHA. Create one candidate commit whose only parent is that SHA and whose diff contains only `content/zh-CN/reference/api/python/**/*.md` or `.mdx` additions/modifications.
2. Produce `offline-reference-python-receipt.json` as canonical JSON data with `schemaVersion: 1`, `document: offline-reference-translation-receipt`, `unitKey: translation/zh-CN-reference/python`, exact `toolingSha`, `sourceCheckpointSha`, and `targetBaselineSha`, plus a sorted non-empty `files` array. Each entry contains `sourcePath`, raw `sourceSha256`, canonical `targetPath`, nullable raw `baseTargetSha256`, and raw `targetSha256`. Set `receiptSha256` to SHA-256 of the canonical receipt body without that field. Upload the file as one immutable artifact and retain its source workflow run ID, artifact ID, exact name, and GitHub-reported `sha256:` digest.
3. Push the one-commit candidate only to `refs/heads/offline-reference-candidates/python/<name>`. Dispatch the workflow with that exact ref and SHA, exact tooling/source/target SHAs, and all four receipt artifact identities, initially with `publish=false`. The trusted producer explicitly fetches the restricted ref and requires it to resolve to the supplied SHA, authenticates the completed receipt source run and exact artifact before downloading it, re-reads all bytes from Git, rejects source drift or target divergence, rebuilds both Reference manifests and sidebars with the formal tool, packages only Python-owned Chinese paths into the standard checkpoint/baseline pair, and routes it through the publication coordinator in artifact-only mode. Publication-time validation rebuilds the formal derived state again and requires a clean generated-state diff, so the coordinator cannot silently rely on uncommitted manifest or sidebar drift.
4. Authenticate selection, ready, checkpoint, baseline, and terminal results artifacts. A passing artifact-only run is invalid after candidate, tooling, source checkpoint, or target baseline drift. `publish=true` is a separate production mutation requiring explicit authorization and the `docs-production-dev` queue. On `REMOTE_STATE_UNKNOWN`, stop without retrying or mutating Git state.

Recovery for this MVP is reassembly from the retained candidate and receipt after refreshing every identity, beginning again with `publish=false`. Do not claim compatibility with `recover-translation.yml`, and do not use paid Translation to replace missing evidence.

Dispatch the workflow first with `publish=false`. Supply the exact candidate ref/SHA, source tooling/baseline/checkpoint SHAs, reconciliation source checkpoint SHA, execution tooling SHA, current target baseline, and expected Markdown count. The read-only run must produce an immutable Translation selection, checkpoint and baseline tar archives, authenticated reconciliation plan, publication-ready document, seven successful Guides validation receipts, publication progress, and terminal artifact-only results.

If every identity and receipt is correct and `origin/dev` is still exactly `target_baseline_sha`, rerun the same inputs with `publish=true`. The workflow owns `docs-production-dev`, allows only `publish_ready` to write, pushes one authenticated `docs-translation-staging/guides/**` ref, promotes by normal fast-forward, and deletes that staging ref with an exact SHA lease only after publication is confirmed. Target drift fails closed; prepare a new one-commit candidate instead of merging, rebasing, force-pushing, or reusing stale evidence. Preserve the terminal selection/results, final SHA, seven receipts, and staging cleanup evidence.

#### Feishu reconciliation approval card

When a Translation unit enters reconciliation review, the monitor reads `translation-reconciliation-review-state-<target>-<group>-<run_id>-<batch>.json` and renders Approve / Reject buttons on the Feishu progress card.

Run one long-lived consumer to handle those callbacks:

```bash
node scripts/docs-workflow/reconciliation-card-action-consumer.js \
  --repository zilliztech/zdoc \
  --token-env GITHUB_TOKEN \
  --evidence-root tmp/reconciliation-card-actions \
  --durable-pr
```

The consumer uses `lark-cli event consume card.action.trigger --as bot`; the Feishu app must be the same app that sent the card and must have the `card.action.trigger` callback enabled. `GITHUB_TOKEN` needs `actions:read`; when `--durable-pr` is enabled it also needs `contents:write` and `pull_requests:write`.

Pass `--durable-pr` when Approve should also create a durable policy-exception PR against `master`. The PR updates `config/translation/reconciliation-policy-exceptions.json` and follows the normal master-to-dev tooling sync path. Without that flag, Approve only writes the run-scoped receipt and updates the card.

For a newly processed callback, the consumer downloads and validates both the standalone review state and the full review artifact before writing evidence:

- `approve`: writes a run-scoped human approval receipt bound to `planSha256`, source/target/tooling identities, reviewer, and expiry; the card is updated to `approved`. With `--durable-pr`, it also creates a PR adding the matching durable policy exception.
- `reject`: writes run-scoped rejection evidence and updates the card to `rejected`; no policy file is modified and no PR is created.

Evidence is written atomically below `<evidence-root>/<target>/<group>/<run_id>/<batch>/<action>-<event_id>.json`. The same Feishu `event_id` is idempotent.

For a durable decision, the generated PR targets `master`. Merge it and run the normal master-to-dev tooling sync; never hand-edit or push policy files directly to `dev`.

#### Hosting the Feishu callback consumer

A systemd unit template is provided at `deploy/systemd/reconciliation-card-action-consumer.service`:

```bash
sudo install -o root -g root -m 0644 \
  deploy/systemd/reconciliation-card-action-consumer.service \
  /etc/systemd/system/reconciliation-card-action-consumer.service
sudo install -o root -g zdoc -m 0600 \
  deploy/systemd/reconciliation-card-action-consumer.env.example \
  /etc/zdoc/reconciliation-card-action-consumer.env
sudo systemctl daemon-reload
sudo systemctl enable --now reconciliation-card-action-consumer
```

Adjust `User`, `Group`, `WorkingDirectory`, `ReadWritePaths`, and the env file path for the actual host. The service keeps the `lark-cli` bot identity from the host and never receives Feishu credentials through the unit file.

Never infer success from a green producer job, an artifact-only run, or a Chinese Reference no-candidate Translation run. Those can be useful evidence for their own boundaries, but they do not by themselves prove a complete all-locale Translation FIFO.

For workflow changes, keep the local replay root, artifact identities, logs, final SHA, and ancestry checks as the handoff package. This makes a later recovery auditable and avoids repeating paid work merely to reconstruct missing evidence.

## Analytics

Both sites measure user actions (Ask-AI chat funnel, code copy, TOC navigation, console CTA clicks, 404 landings) through GTM into GA4. Theme code only pushes events to `window.dataLayer` via `trackEvent` in `packages/docs-ui/src/shared/utils/analytics.ts`; consent gating, trigger/tag wiring, custom definitions, and key events live in the GTM containers (en `GTM-MBBF2KR`, zh-CN `GTM-MBBL6Z9Q`) and the GA4 properties. The English site's search events (`search_performed`, `search_result_clicked`) come from Inkeep's modal through the `baseSettings.onEvent` bridge in `packages/docs-ui/src/en/inkeepEventBridge.ts` — the docs-ui search modal swizzle is not part of either production bundle. The full event schema, the GA4/GTM setup steps, and the container-side Consent Mode decision are specified in `.claude/specs/2026-09-20-docs-analytics-and-search-404-design.md` and `.claude/specs/2026-10-14-docs-behavior-analytics-phase2.md`.

### Search-origin 404 report

`GA4 Search 404 Report` (`.github/workflows/ga4-search-404-report.yml`) lists the pages that Google search results still point at which now return 404 — the `page_not_found` events whose referrer was Google, per site, for a sliding window. It is scheduled daily at 03:17 UTC and can also be dispatched manually. Until the GA4 access below is configured, every run degrades to a notice instead of failing:

1. Create a service account with read-only access to both GA4 properties and store its JSON key in the repository secret `GA4_SERVICE_ACCOUNT_JSON`.
2. Add the repository variables `GA4_PROPERTY_ID_EN` and `GA4_PROPERTY_ID_ZH_CN` (numeric GA4 property IDs); at least one is required.
3. Dispatch the workflow once and verify the Feishu card and the report artifact — the daily schedule then picks up the same configuration automatically.

Without the secret and property variables the run degrades to a notice instead of failing. Remediation for recurring paths is an nginx `return 301` in `deploy/{en,zh-CN}/nginx.conf` with a matching redirect assertion in `deploy/contracts/container.test.mjs` — the same pattern as the existing "Analytics-derived 404 cleanup" blocks.

## Containers

The runtime images contain only Nginx plus the selected static build output. Build from the repository root:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=en --build-arg JENKINS_BUILD_ID=local-preview -f deploy/en/Dockerfile -t zdoc-en .
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=zh-CN --build-arg JENKINS_BUILD_ID=local-preview -f deploy/zh-CN/Dockerfile -t zdoc-zh-cn .
```

The English image includes Japanese content. The two commands are independent; invoke only the selected target or invoke both without treating one target's failure as a repository-level requirement for the other. The Dockerfiles build the static sites internally, so Jenkins does not need to run `pnpm build:*` before these container builds. Image naming and registry tagging remain Jenkins-owned.

The site-owned Nginx configurations are `deploy/en/nginx.conf` and `deploy/zh-CN/nginx.conf`. Runtime environment rendering is owned by `deploy/runtime/40-zdoc-env.sh`. `deploy/runtime/nginx.main.conf` replaces the stock image main config solely to `load_module` the njs module (main-context-only directive; see the cloud-data chain below).

### Cloud-data live tables in `.md` routes (SSI + njs)

The cloud-providers-and-regions and zilliz-cloud-ips pages carry globally registered `<CloudRegions>`/`<CloudFeatures>`/`<RegionIps>` components (HTML pages fetch the CMS JSON after mount) and standalone markers inside the Feishu source. `embed-markdown` bakes every marker into an SSI pair — a `<!--# block -->` stub rendered from the committed snapshot (`packages/docs-ui/src/shared/cloud-data/snapshots/`) plus `<!--# include virtual="/api/cloud-data/fragment.md?…&site=…" stub=… -->`. At request time nginx resolves the include through `/api/cloud-data/` (loopback proxy) → `/_njs/fragment.md` (njs renderer, the same `packages/docs-ui/src/shared/cloud-data` modules as the build) → `/api/cloud-json/*` (per-site CMS proxy: en `cms.zilliz.cc`, zh-CN `cms-cn.zilliz.cc`, 60s `proxy_cache` with stale-on-error). Any upstream failure is intercepted into an empty 200 so SSI serves the snapshot stub — the `.md` route degrades to the last committed snapshot, never to an error page.

Operational prerequisites: the container must reach the site's CMS instance at startup (static `proxy_pass` hostnames resolve at config time), and the JSON responses must stay below the 1m `subrequest_output_buffer_size`. Refresh the committed snapshots with `node scripts/docs-workflow/cloud-data-snapshot.mjs --site <en|zh-CN> --from-base <cms-origin> --out packages/docs-ui/src/shared/cloud-data/snapshots/<site>.json` and gate freshness with `--check` (the wire format for a future scheduled refresher). Verification: `pnpm test:containers` (static contract) and `pnpm test:cloud-data-nginx` (live four-scenario run in `nginx:1.28-alpine`; skipped automatically without Docker).

### Selected shared Guides source generation

English Fetch prepares shared-page routing against its pinned master configuration
and exact dev baseline before ordinary Feishu body reads. After source fetching,
`Generate selected shared Guides sources` builds each selected record's Guides and
BYOC outputs together. Current Base navigation, publish targets and release channel
are checked before rendering; an existing `.md` or `.mdx` extension is retained,
and a new page uses `.mdx`. Unselected page configurations are not loaded by Fetch;
the default `shared-docs build` command still validates the whole group.

The source job writes its draft bundle to
`tmp/docs-tooling/en/shared-pages/guides/bundle.json`. It records actual pinned input
digests, output/receipt drafts and one success or baseline-fallback outcome per
page. Accepted image bytes remain in the source job's scratch directory for the
upload step beside media prefetch. That step validates and deduplicates accepted bytes,
reads existing objects, conditionally creates absent objects with `If-None-Match: *`,
and reads them back to verify SHA-256. It never overwrites, resets ACLs or deletes
shared objects. `media_upload_mode=skip` performs no storage calls and retains full
image-bed URLs. `PUBLISH_IMAGE_UPLOAD_FAILED` fails the source job through its
existing artifact gate, preventing new English Guides/BYOC publication from that
job. The existing translation-enabled reconciliation producer gate remains unchanged.

The source artifact binds the bounded bundle to master/dev SHAs, sizes and hashes,
including raw Base routing evidence, both successful outputs and exact historical
fallback bytes. Offline table jobs place prebuilt bytes and repeat writer path and
front-matter checks; they do not generate shared pages or upload images. Fallbacks
are restored within their existing table owner even when current traversal omits
the old record or path. Image bodies are excluded from source and table artifacts.
Final receipt/activation publication and successful cache promotion remain separate
publication gates; the draft bundle alone does not authorize them. Before a pilot,
the owner must verify real-bucket conditional-create support and retain lifecycle
evidence that `shared/` objects referenced by published or recoverable receipts
cannot expire or be deleted, including bucket-wide/noncurrent rules and external
cleanup jobs. The owner must also make an unauthenticated GET of
`IMAGE_BED_URL/shared/<key>` and verify that the downloaded body's SHA256 equals
the accepted object's digest. Use no credentials or signed URL for this check;
authenticated SDK readback verifies stored bytes but does not prove public read
access. Record the HTTP result and digest with the pilot evidence. These checks
gate the first image-bearing activation; a page without images can be activated
before them.

On first activation, the job reads the old document once at its current
revision and checks current inbound heading references against both generated
manuals; `ACTIVATE_CHECK_FAILED` retains both baseline outputs. Existing active
pages reuse their retained anchor map. A run with no shared records and no active
shared state creates no shared bundle and keeps the legacy source payload unchanged.

To activate a page, switch its record's `Docs` to the page directory URL, wait
for a successful Fetch and confirm its entry in dev's
`generated/en/manifests/shared-pages/guides/active.json`, then retire the old
Feishu document. The old document must exist until that activation Fetch
succeeds; afterwards links are resolved from `active.json` alone, and a retired
document stops new block-ID links that the frozen anchor map cannot resolve.
Retiring the old document is a content-hygiene step, not a pipeline
requirement: once the record is activated, Fetch skips the old document's wiki
node and never refetches its blocks, so a legacy document left in the tree (or
already deleted) cannot block scheduled runs — its cached legacy body stays
frozen beside the shared source.

Once a page is active, its Base record must stay a publishable canonical row
whose `Docs` points to the page directory. Switching `Docs` back to Feishu,
deleting the record, changing its placement type or moving its Progress outside
the publishable set fails Fetch with `OWNERSHIP_REVERTED` and leaves the Git
version in place. Restore the record; retirement of shared pages is not supported
yet.

### Release Channel gating (CURRENT / NEXT / RETIRE-IN-NEXT)

Guides records carry a `Release Channel` field in the Feishu Base. `CURRENT` is the default and the fallback for records without the field; `NEXT` marks documentation for a feature that has not shipped yet; `RETIRE-IN-NEXT` is the mirror — a live page that the upcoming release removes, used to stage a split or restructure without touching production.

- Fetch renders the channel into the page front matter (`channel: next` or `channel: retire-in-next`, each with the matching `sidebar_custom_props: {channel}` — Docusaurus's official bridge onto runtime sidebar link items) and `customProps: {channel}` onto generated sidebar entries, and persists `release_channel` in the source snapshot so a channel flip re-renders the page even when the document itself is unchanged.
- Both environments deploy the same image. The deployment's channel is injected at container start: `deploy/runtime/40-zdoc-env.sh` writes `ZDOC_RELEASE_CHANNEL` (default `current`, fail closed) into `window.__ZDOC_ENV__.RELEASE_CHANNEL` via `/env.js`.
- On a `next` deployment, NEXT pages render normally with a dismissible unreleased-feature floating notice (toast) in the site's locale. On a `current` deployment, the docs shell swaps the entire page for the shared 404 page (no sidebar, chrome-less — the exact presentation of a native miss under `/docs`, resolved through the sidebar entry's runtime channel); NEXT entries also disappear from sidebars and DocCard lists, the pages carry `noindex` (which also excludes the routes from the sitemap), they are skipped in `llms.txt`, structured data, and `.md` build copies, and the routes listed in `release-channel-routes.txt` are additionally blocked with Nginx 404s that serve the styled 404 page.
- RETIRE-IN-NEXT inverts every one of those directions: the page serves normally on `current` deployments (it is still the live production page — it stays out of `noindex` and stays listed in `llms.txt` and `.md` copies, which render the CURRENT view), while `next` deployments hide it exactly as `current` deployments hide NEXT pages: sidebar/DocCard removal, pagination pruning, the chrome-less 404 swap, and Nginx 404s from the `release-channel-retired-routes.txt` listing (with the same token propagation to stale translations). The runtime-injection fallback fails toward `current`, so a missing injection serves a retired page — the safe direction, since that content is already live in production; the trade-off is that a `next` deployment's prerendered HTML shows the entry until hydration replaces it, while direct access is server-blocked.
- To promote a page, flip `Release Channel` from `NEXT` to `CURRENT` in the Base; the next Fetch re-renders the page and every environment picks it up on its next deployment. The new-record default of `NEXT` means every newly created record must be promoted explicitly before it reaches production.
- `<NextChannel>` block tags are rejected on RETIRE-IN-NEXT records at Fetch: the page ships its final CURRENT wording and is removed wholesale.

#### Staging and promoting a split or restructure (RETIRE-IN-NEXT)

To split one legacy page into two new pages (or restructure a section) without disturbing production URLs:

1. Stage: create the new records as `NEXT` with their own fresh slugs (never reuse the legacy slug — the retired page still occupies that route in the shared build until its record is removed), and flip the legacy record to `RETIRE-IN-NEXT`. One Fetch run captures both states, so the UAT (next) channel previews exactly the post-split world while production keeps serving the legacy page.
2. Promote: flip the new records from `NEXT` to `CURRENT` and delete the legacy record's row (or move it out of a publishable Progress state) as one Base edit batch, then trigger the Fetch. The record removal flows through the normal incremental reconciliation (source JSON, generated MDX, and translation outputs are deleted), and the same build both drops the legacy route and un-gates the new pages.
3. Redirect: add the legacy slug's `return 301` to the site's hand-maintained Nginx map (`deploy/en/nginx.conf`, `deploy/zh-CN/nginx.conf` — for example `location = /docs/legacy-slug { return 301 /docs/successor-slug; }`) via a master PR synced to dev. Order matters: the deletion Fetch must deploy first and the 301 second. Deploying the 301 early sends production visitors to a still-gated NEXT page; the reverse order merely leaves the legacy path returning 404 for one deployment cycle. Never deploy the 301 before the record is gone.

The promotion is two independent Base edits (flip plus delete) plus one repository edit (the 301 map). If a Fetch runs between the flip and the delete, the intermediate build is wrong in one of two ways, so complete both Base edits before triggering the Fetch.

#### Block-level channel gating (`<NextChannel>`)

Untagged content is `CURRENT` by convention; only staged blocks inside an otherwise-current page are tagged in the Feishu document:

```text
<NextChannel action="include">Ships with the next release: visible on next deployments only.</NextChannel>

<NextChannel action="exclude">Current wording, removed once next ships.</NextChannel><NextChannel action="include">Its replacement.</NextChannel>
```

- The tags pass through Fetch untouched and compile to the globally registered `NextChannel` MDX component (`packages/docs-ui/src/shared/components/NextChannel`), which resolves the deployment channel from the same `window.__ZDOC_ENV__.RELEASE_CHANNEL` signal as page-level gating. `action="include"` blocks render only on `next` deployments; `action="exclude"` blocks only on `current`.
- Prerendering and hydration resolve to `current` (fail closed), so `include` blocks are absent from the static HTML and appear after mount on `next`. The right-rail "On this page" TOC is generated at build time, so the TOC wrapper (`packages/docs-ui/src/shared/theme/TOCItems`) filters it after mount, dropping entries whose heading anchor the deployment channel hides — a gated heading never leaves a dead TOC link on either channel. The product/edition `include`/`exclude` tags are unaffected: they keep their scrape-time filtering, and channel values on that axis (`target="next"`/`target="current"`) are rejected at Fetch with repair guidance, as are malformed, nested, or NEXT-page-redundant `<NextChannel>` usage.
- Translation treats the tags as protected JSX spans and the output validator asserts tag/action parity against the source, so a dropped or flipped gate fails the Translation check instead of leaking staged prose to production.
- Static build capabilities cannot evaluate the runtime channel and therefore render the CURRENT view, matching the prerendered page: the `.md` copies and llms.txt summaries resolve include blocks away and unwrap exclude blocks (`apps/docs/plugins/next-channel-view.js`), and the Fetch description front matter (consumed by structured data and llms.txt) applies the same resolution to inline gates.
- Inside code blocks, use the comment directives `# next-channel-start/next-line` and `# current-channel-start/next-line` (same five comment styles as the product variants, see `packages/docs-tooling/src/lark/CODE_VARIANTS.md`). Both variants ship in the shared build; the code renderer filters them per deployment channel before client-side highlighting, so directive lines never render or copy and next-only lines are absent from the prerendered HTML. Whole examples can instead be wrapped in `<NextChannel action="include">` around the fenced block.
- Promotion is tag removal: unwrap `action="include"` blocks (keep the inner text), delete `action="exclude"` blocks, and let the next Fetch re-render; existing translations seed-match the unchanged prose.

Deployment overlays own the runtime value: set `ZDOC_RELEASE_CHANNEL: next` on the UAT overlays (`vdc-deploy` → `zdocs/overlays/uat3`, `zdocs-cn/overlays/ali-vdc-uat`) and `ZDOC_RELEASE_CHANNEL: current` on the production overlays (`vdc-deploy-prod` → `zdocs/overlays/vdc-global`, `zdocs-cn/vdc-ali-global`). An overlay without the variable behaves as `current`.

Known limitation: the Chinese site's client-side search index is built from source folders and still lists NEXT titles (and, symmetrically, RETIRE-IN-NEXT titles surface in the index on `next` deployments); results resolve to the gated page. Server-side Nginx blocking and the client gate remain in force. Likewise, existing Japanese translations only gain the `channel` front matter the next time Translation regenerates them; until then their pages rely on the token-based Nginx blocking (route listings propagate the channel through the shared Feishu `token`) and show no unreleased-feature notice on NEXT deployments. Block-level gating inherits the soft-hiding posture of page-level gating: `include` block text still ships inside the production **browser JS chunks** (it is absent from the static HTML, the `.md` copies, and llms.txt, which all render the CURRENT view) because the shared build needs it to reveal the blocks on `next` deployments; the page TOC — built from the prerendered heading tree — does not list NEXT-only sections until promotion. The same secrets-driven dual-build fallback applies if content must not ship at all.

## Verification

Run proportional checks while developing. Before a repository-wide retirement or release change, run:

```bash
pnpm test:retirement
pnpm typecheck
pnpm test:frontend
pnpm test:containers
pnpm build:en
pnpm build:zh-CN
```

#### Shared Guides final publication evidence

English Guides source artifacts retain the observed candidate and authenticated
paired outcomes. Assembly derives a separate effective snapshot: successful
shared records use the emitted output paths; failed transitions retain their exact
pinned dev record and historical outputs; failed new records remain absent.
Combined sidebars include those authenticated old paths even when a stable table
ID has been renamed. Coverage and source-contract validation remain required.

After complete table restore and canonical publication, assembly verifies the
actual output hashes and tokens, writes final page receipts with the full immutable
Base navigation projection, and appends only successful first activations to
`generated/en/manifests/shared-pages/guides/active.json`. Existing activation
entries and anchors remain unchanged. The same checkpoint owns MDX, receipts,
active state, and `_publication.json`; its underscore prefix cannot collide with
a valid page slug. This last file binds the observed/effective snapshot hashes,
active state, and exact prior snapshot bytes and output digests for fallback.
Checkpoint validation reads the original local dev Git commit to authenticate that
fallback evidence, so source-job scratch is not required. Missing pinned objects
or mismatched bytes fail validation. Legacy checkpoints without shared state
remain accepted without creating empty shared manifests.

An unrelated requested Guides Fetch carries existing shared receipts, activation
and output bytes from its pinned dev tree in a bounded `continuation.json` source
handoff. The requested CLI authenticates those bytes before merging sources;
fresh workers recheck them against pinned Git before restore, and assembly binds
publication authority to the new effective snapshot. It does not regenerate shared
pages or call the image store. A requested closure touching a shared owner, its
alias or its table still requires ordinary Guides Fetch. The page name `active`
is reserved for activation metadata and produces a page-local
`OWNERSHIP_PATH_MISMATCH` before generation; valid siblings continue.


A source-stage receipt draft cannot authorize a saved source cache. Final cache
manifests carry validated final receipts, and any shared page failure suppresses
cache generation so the next Fetch retries it. Build notes report page failures
and unknown post-activation anchors with the referring page and source URL. Old
Feishu token links resolve to the shared page; known heading blocks use the
activation anchor map, while unknown blocks resolve to the page top. WP9 does not
change Translation/recovery cache identities or adopt recorded images.


#### Shared Fetch requirement accounting

The shared-pages replay covers the Fetch portions of `3-6`, `5-3`, `9-1`,
`9-2`, `9-3`, `9-6`, `9-9`, `ACTIVATE_CHECK_FAILED`,
`PUBLISH_IMAGE_UPLOAD_FAILED`, `OWNERSHIP_PATH_MISMATCH`,
`OWNERSHIP_CONFIG_MISSING` and `OWNERSHIP_REVERTED`. The requirement tests close
only `3-6`, `5-3` and `9-9`; the other entries retain their WP14 pending marker
for the dev-PR, old-writer and recovery ownership checks. `T06` retains its
pending marker: the optional real site/browser mode supplies Tabs, languages,
links, anchors, image and edit-entry evidence, while recorded-image change
semantics remain deferred. `PUBLISH_REGEN_MISMATCH` and `IMAGE_SOURCE_CHANGED`
remain WP9b work; receipt/output tamper rejection is not clean regeneration.
