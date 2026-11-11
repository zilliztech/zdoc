# Zilliz Documentation

This repository builds the English/Japanese and Chinese documentation sites from one audited codebase. The two sites share tooling and UI packages, but use independent site profiles and content trees. Chinese is not rebuilt through Docusaurus i18n because its product capabilities and document structure differ from English.

This file is the operator runbook: setup, branch ownership, the publication runbook, and verification. Deep-dive reference pages live under [`runbook/`](runbook/):

- [REST reference pipeline](runbook/rest-reference-pipeline.md) — editing fragments, upstream drift watchdog and refresh, availability operations
- [Replay harnesses](runbook/replay-harnesses.md) — long-form replay evidence modes
- [Translation operations](runbook/translation-operations.md) — quality assets, the scheduled dispatcher, manifest migration, fast-path precheck, reconciliation card
- [Shared Guides generation](runbook/shared-guides-generation.md) — source generation, publication evidence, requirement accounting
- [Release Channel gating](runbook/release-channel-gating.md) — CURRENT / NEXT / RETIRE-IN-NEXT and `<NextChannel>`
- [Analytics](runbook/analytics.md) — GA4 reports and console reconciliation
- [Content production recipes](runbook/content-production.md) — adding a new reference manual

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

`pnpm test:shared-docs` and `pnpm test:frontend` discover their complete Vitest
file selection and run ordinary files in parallel. Frontend (`all` scope) then runs
the complete `translationManifest.integration.test.ts` file in a separate
`reference-integration` phase. Both gates finish with the complete local-update
transaction, runner and `update-prepare.test.ts` command test files as isolated
phases (`transactions`, `local-runner`, `update-prepare`). This gives frontend five
phases and shared-docs four, including light. Each of these isolated phases
uses a separate single-worker process; shared-docs has no reference phase.
The ordinary light phase runs first and alone: when it fails, every later
file stays unrun instead of spending the remaining gate budget. The isolated
phases keep their own per-case deadlines and run in order; running them together
only adds scheduler contention against those measured deadlines.
Case deadlines are unchanged. Platform-dependent skips must be declared in
`scripts/testing/expected-platform-skips.json` per platform and per test file, as
the maximum skips that file may show there. The gate fails when an undeclared
file skips or when a file exceeds its declared maximum, so muted coverage cannot
grow silently; a file that skips less is reported, not failed.
Heavy phases override an inherited `VITEST_MAX_WORKERS` to one; ordinary files
retain their usual worker configuration. Use `pnpm test:vitest-groups` for the
supervisor's selection, reporting and actual child-process failure contracts.

Each complete gate has a 15-minute monotonic execution limit covering preflight,
discovery, all phases, validation and actual writes of every requested report.
Expired work cannot start a child or freeze a passing execution verdict; preflight
Git calls are bounded by the remaining budget. Only after all that work completes
within the limit is the measured verdict frozen. One separate terminal confirmation
attempt has at most 1 second for exclusive staging, persistence, atomic publication
and reader confirmation. This allowance runs no tests or report copies and adds no retry.
A failed test/module, invalid or incomplete report, nonzero exit, or surviving
owned process fails the gate and prevents later phases. Failed heavy work is
terminated only within that invocation's process group; tests left unrun after
failure are not ordinary skips. A failed phase prints its failing case, error and
stack to the console before the gate decides, and the site-validation workflow
publishes the retained evidence directory as an artifact for a failed gate.
The CI tooling job's existing 20-minute total
limit, which also includes installation, Translation and replay tests, is unchanged.
Denied process probes/signals stop that cleanup attempt: receipts retain the first
failure and structured cleanup errors, with settlement unknown rather than assumed
complete; a receipt-write failure is explicitly unconfirmed and remains failed.

The supervisor supports macOS and Linux. Its dedicated default parent is
`~/.cache/zdoc-vitest` on both platforms (macOS Library ancestors can have ACLs
unsupported by the existing trusted-tool policy);
`ZDOC_TEST_TMP_PARENT` can select an absolute parent. The parent must be owned by
the current user, mode 0700, and free of symlink/case aliases. Canonical paths must
not overlap or contain the checkout, actual Git/common directories, object stores
(including alternates), or the requested aggregate output. Missing directories are created privately; existing directories are
never chmodded or cleaned. Each gate gets a fresh owned0700 root and each phase a
separate temporary directory. Ancestor identities and entry counts are retained;
directory identities are checked before and after creation and phase execution.
Neither a crowded system temporary directory nor this layout is presumed equivalent
in performance to an older fixture. Global environment/permissions and older tool
proofs remain untouched.

The printed evidence directory retains discovery, raw phase logs/reports,
run-correlated reporter events, process-group receipts and the final aggregate.
An aborted gate also retains its stage and owned-group stop result. An incomplete
raw report has unknown full case counts; observed reporter failures are reported
separately and are not replaced by a misleading zero-failure total.
`--reporter=default`, `--reporter=json`, and a fresh
`--outputFile.json=/absolute/path/result.json` are supported. Aggregate and requested
JSON files are provisional and have no standalone `success` flag. The sole committed
version-2 `terminal.json` binds the run, scope, original discovery bytes, measured
execution verdict, all report identities and hashes, and each complete phase's raw
result and settled process receipt. The reader derives the ordered, exhaustive
phase selection from the scope policy and bound discovery, including isolated
worker configuration; reports cannot declare their own required phase count.
Historical version-2 evidence with the earlier three/four-phase policy must use
its matching retained reader, available at commit `21d6add193`; it cannot qualify
the new four/five-phase policy. Preserve the original artifacts unchanged.
Historical version-1 evidence must be read with its matching retained supervisor,
not treated as qualification under this new phase policy. Commit
`7e6e337b50b6aa191d12c8f9661a1d23dda5ba8d` retains the version-1 reader. To inspect
an existing version-1 aggregate without changing its artifacts or the checkout:

```bash
reader_dir=$(mktemp -d "${TMPDIR:-/tmp}/zdoc-v1-reader.XXXXXX")
git show 7e6e337b50b6aa191d12c8f9661a1d23dda5ba8d:scripts/testing/run-vitest-groups.mjs > "$reader_dir/reader.mjs"
node --input-type=module - "$reader_dir/reader.mjs" /absolute/path/version-1/aggregate.json <<'JS'
import {pathToFileURL} from 'node:url';
const {readGateReport} = await import(pathToFileURL(process.argv[2]).href);
console.log(await readGateReport(process.argv[3]));
JS
```

Use the current reader for version-2 evidence:
actual reader to qualify either report path:

```js
import {readGateReport} from './scripts/testing/run-vitest-groups.mjs';
const result = await readGateReport('/absolute/path/result.json');
console.log(result.success, result.executionStatus, result.commandStatus);
```

The CLI uses the same reader and returns zero only for an acknowledged passing
commit. Missing, partial or mismatched terminal evidence cannot qualify a report.
An error or exhausted confirmation allowance returns nonzero with settlement status
`unknown`, without rollback or retry: the terminal might already have committed.
An offline reader can verify that committed execution result, but its
`commandStatus: not-established-by-artifacts` does not prove CLI delivery or exit.
No filesystem timestamp substitutes for the measured monotonic execution budget.
All discovered files must be accounted for and every owned group settled.
Narrowing options, retries and deadline overrides
are rejected by these complete gates; use direct `pnpm exec vitest run ...` for
explicit focused diagnostics, which do not qualify the complete selection.

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

Task recipes and deep-dives live under [`runbook/`](runbook/):

- Adding a new reference manual: [runbook/content-production.md](runbook/content-production.md).
- Editing REST spec fragments, the REST upstream drift watchdog and refresh, and the REST upstream and availability operations cadence: [runbook/rest-reference-pipeline.md](runbook/rest-reference-pipeline.md).

## Production publication runbook

> Pipeline map: [`fetch-translation-pipeline-map.md`](.claude/specs/2026-08-29-fetch-translation-pipeline-map.md) — the phase-by-phase flow, artifact contracts, the 4 Git push points, and the known failure modes with their recovery entries.

The normal production entry point is [`fetch-docs.yml`](.github/workflows/fetch-docs.yml). It publishes the selected English source units to `dev`, performs final verification, and can dispatch one downstream Translation workflow. Every `dev` writer is serialized through the `docs-production-dev` concurrency group with `queue: max`; do not bypass that queue with a second manual writer. Translation and operator recovery both use the short production lock: the paid producer run stays in a unique read-only group (`translation-readonly-*` or `translation-recovery-readonly-*`), and when it finishes it dispatches [`publish-translation.yml`](.github/workflows/publish-translation.yml), which owns `docs-production-dev` only for the publication transaction (Fetch keeps its existing whole-run queue ownership). The publisher also refuses a producer selection whose units were already superseded by a successful operator recovery, so a stale retained selection cannot be re-dispatched after its recovery published.

Incremental Translation reuses unchanged published semantic-unit translations only when it is explicitly enabled. Set the Actions repository variable `TRANSLATION_SEMANTIC_SEEDS=true` to turn it on for pipeline-triggered runs (or pass the `semantic_seeds` input on a manual dispatch); remove the variable to fall back to full per-file retranslation. Each run's translation report shows `Seeded files` and `Seeded units` so the reuse rate is observable.

Japanese translation quality assets (house style guides, the translation-memory helper, the experimental agentic provider with its surgical incremental lane) and the hourly translation dispatcher (pending budgets, arming, the source build gate, dispatch backoff, guard alerts) are documented in [runbook/translation-operations.md](runbook/translation-operations.md). In short: the dispatcher dispatches only when armed with the repository variable `TRANSLATION_DISPATCHER_DISPATCH=true` (or a manual dispatch with the `dispatch` input), and a failed producer run's completed batches are usually salvageable through [`recover-translation.yml`](.github/workflows/recover-translation.yml) with `publish=false` rather than a fresh paid dispatch.

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
- `pnpm test:replay:shared-pages` includes the focused independent regeneration tests and exercises selected shared Guides generation, authenticated source artifacts, offline tables, fresh assembly, immutable image uploads and a real checkpoint transaction against a local bare remote. It also compares ordinary Feishu output with valid and malformed inactive configuration.
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

The long-form evidence procedures live in [runbook/replay-harnesses.md](runbook/replay-harnesses.md): the semantics of the `--legacy-baseline`/`--comparison-baseline-sha`/`--site` flags above, the retained-artifact recovery replay through `replay-recovery-plan.js` (snapshot-root contract, safe roots, evidence to preserve), and the step-by-step requested Guides replay against real retained artifacts.

### Diagnose shared Guides fallback failures

When a shared page cannot be generated or activated, the source job logs a
`[shared-fallback]` JSON line with its Base record ID, page, error code, reason,
and retained paths before canonical-link auditing. Start with that reason even
if the source job later fails before uploading its source artifact.

Fallback keeps the exact pinned dev record and file bytes. Explicit snapshot
`output_paths` remain authoritative; legacy Feishu records with empty paths use
the pinned publication authority's retained paths when available, with snapshot
and file-hash binding. Only the first fallback derives paths from the baseline's
navigation and Git inventory. This keeps consecutive fallbacks stable when an
ancestor is renamed or removed; safe multi-segment Slugs remain supported. Current Base edits or cached source paths cannot expand the retained set.
Source-bundle and final-publication validation use the same rule and still check
file hashes. A partial fallback run is not eligible for successful cache promotion.

A retained source bundle with a legacy empty-path fallback must include
`baseline/publication.json` if its pinned inventory contains the publication
authority. Older bundles missing that proof fail with `missing baseline
publication`; do not remove the inventory entry or bypass validation. Inspect
and regenerate the source artifact from its pinned inputs before reusing it.
Success-only bundles and explicit-path or shared-page fallbacks do not acquire
this new proof requirement.

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

Fetch and Translation runs report progress through Feishu cards created by `pnpm docs-tooling report-card`, and the scheduled watchdogs (`docs ingestion watchdog`, `external link watchdog`, `broken links report`) post alert cards only when they detect a problem. Card sending is non-essential reporting: every card step is best effort, and monitor jobs start only when a card exists.

To silence all workflow Feishu cards without touching the Feishu app credentials (which Fetch also uses to read source content), set the repository variable `FEISHU_NOTIFICATIONS_DISABLED` to `true` in GitHub Actions settings. The five card-sending workflows forward it to `docs-tooling` through their root `env`, the `report-card` command skips every action without contacting Feishu, and the resulting empty `card_id` output keeps all monitor and downstream card jobs disabled. Unset the variable, or set it to any other value, to restore notifications — no code or workflow change is required. This switch does not affect Feishu bitable reporting (`report-broken-links`, `report-external-links`) or Fetch content reads.

### Daily ops digest and the watchdog known-issues ledger

`scripts/docs-workflow/watchdog-known-issues.json` is the reviewed, machine-readable ledger of watchdog triage knowledge: for every scheduled watchdog it records the fetch channel (job logs, artifact, or conclusion), the steady-state baseline, known issues with a status (`known-expected` / `watch` / `in-progress` / `resolved`), and closed-incident history. A daily digest automation compares live watchdog output against this ledger; it also names the five `docs-production-dev` queue members and the translation producer so tooling can tell queue occupancy from an off-queue producer run.

- Validate the ledger fail-closed (schema version, referenced workflow files exist, status/cadence enums, producer stays off the production queue) with `node scripts/docs-workflow/daily-ops-summary.js --validate-ledger`; the digest consumes the ledger only after this passes.
- Get the digest's mechanical sections on demand — current production-queue occupancy (including wait times), per-workflow run statistics for yesterday (or a custom `--window`), and a watchdog run cross-check — with `node scripts/docs-workflow/daily-ops-summary.js --markdown` (add `--json` for machine consumption). The script is read-only: it lists runs through the `gh` CLI and never dispatches, reruns, or cancels anything.
- Status changes in the ledger go through reviewed changes like any other tooling. Volatile daily numbers (for example the rest-upstream drift `substantiveCount`/`diffDigest` series) deliberately stay in a local state file outside the repository — only rules, statuses, and thresholds belong in the ledger.

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

Translation-side operator procedures — the Japanese publication manifest migration, the fast-path precheck for hand-validated translated diffs, the Feishu reconciliation approval card consumer, and hosting that consumer — live in [runbook/translation-operations.md](runbook/translation-operations.md). Never infer success from a green producer job, an artifact-only run, or a Chinese Reference no-candidate Translation run. Those can be useful evidence for their own boundaries, but they do not by themselves prove a complete all-locale Translation FIFO. For workflow changes, keep the local replay root, artifact identities, logs, final SHA, and ancestry checks as the handoff package. This makes a later recovery auditable and avoids repeating paid work merely to reconstruct missing evidence.

## Analytics

Both sites measure user actions (Ask-AI chat funnel, code copy, TOC navigation, console CTA clicks, 404 landings) through GTM into GA4; theme code only pushes events to `window.dataLayer` via `trackEvent` in `packages/docs-ui/src/shared/utils/analytics.ts`. The full event schema, the GA4/GTM setup, the scheduled [search-origin 404 report](runbook/analytics.md#search-origin-404-report) and [engagement funnel report](runbook/analytics.md#engagement-funnel-report), and the monthly [GA4 console reconciliation](runbook/analytics.md#periodic-ga4-console-reconciliation) are documented in [runbook/analytics.md](runbook/analytics.md).

## Containers

The runtime images contain only Nginx plus the selected static build output. Build from the repository root:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=en --build-arg JENKINS_BUILD_ID=local-preview -f deploy/en/Dockerfile -t zdoc-en .
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=zh-CN --build-arg JENKINS_BUILD_ID=local-preview -f deploy/zh-CN/Dockerfile -t zdoc-zh-cn .
```

The English image includes Japanese content. The two commands are independent; invoke only the selected target or invoke both without treating one target's failure as a repository-level requirement for the other. The Dockerfiles build the static sites internally, so Jenkins does not need to run `pnpm build:*` before these container builds. Image naming and registry tagging remain Jenkins-owned.

The site-owned Nginx configurations are `deploy/en/nginx.conf` and `deploy/zh-CN/nginx.conf`. Runtime environment rendering is owned by `deploy/runtime/40-zdoc-env.sh`. `deploy/runtime/nginx.main.conf` replaces the stock image main config solely to `load_module` the njs module (main-context-only directive; see the cloud-data chain below).

### Release verification (UAT → production)

Jenkins pipelines are external, but the repository owns the trigger interface and the release-evidence contract. Two repo-side surfaces apply:

- **Triggering.** `scripts/doc-publish-bot` plans the Jenkins triggers (see its README for the bot flow and credentials): UAT builds go to the `zilliz-docs-dev` job with `BRANCH` (default `dev`), and production builds go to the `zilliz-docs-prod` job, which requires a `vX.X.X` release branch and accepts an optional `image_tag` to promote an already-built image instead of rebuilding. The evidence rule from the runbook applies verbatim: start or inspect Jenkins only after the exact source SHA is known (`dev` for UAT; the `vX.X.X` branch head for production), and confirm the build label carries that SHA.
- **Release records.** Every UAT and production deployment is described by a release record (`deploy/contracts/release.schema.json`, shape example in `deploy/contracts/release-record.example.json`): `site` (en/zh-CN), `environment` (uat/prod), `mode` (`rebuild` for UAT and rebuild-from-branch; `specified-image` for image-tag promotion), the 40-hex `sourceSha`, the immutable `sha256:` digests, and a `jenkinsBuildIdentity` of the form `vdc-jenkins/<english|chinese>-<uat|prod>/<build>`. Production records additionally carry `sourceUatDigest` (plus `operatorImageRef` in `specified-image` mode), and the Dockerfiles bake the build args into image labels — `ZDOC_SHA` into `org.opencontainers.image.revision` and `JENKINS_BUILD_ID` into `com.zilliz.jenkins.build-id` — binding each image to its source revision and build.

`deploy/contracts/verify-image.mjs` verifies the contract fail-closed:

```bash
node deploy/contracts/verify-image.mjs verify-record --root <dir> --record <record.json>
```

`verify-record` checks one record's shape (`--record` is a path relative to `--root`). `verify-rebuild` and `verify-specified-image` additionally prove that a production record has unique successful UAT evidence for the same site, source SHA, and digest — both read `evidence/uat-records.json` from a trusted evidence root (`VDC_JENKINS_EVIDENCE_ROOT`, kernel-read-only mounted, asserted by `VDC_JENKINS_EVIDENCE_PROTECTION=kernel-read-only-mount`; all three evidence files must exist read-only). `verify-specified-image` resolves `operatorImageRef` through `evidence/resolved-images.json` and requires the resolved digest to equal both `sourceUatDigest` and `finalDeployedDigest` — you promoted exactly the digest UAT tested. `verify-rollback` reads `evidence/prod-records.json` and accepts only a target digest that has a recorded successful production release.

### Cloud-data live tables in `.md` routes (SSI + njs)

The cloud-providers-and-regions and zilliz-cloud-ips pages carry globally registered `<CloudRegions>`/`<CloudFeatures>`/`<RegionIps>` components (HTML pages fetch the CMS JSON after mount) and standalone markers inside the Feishu source. `embed-markdown` bakes every marker into an SSI pair — a `<!--# block -->` stub rendered from the committed snapshot (`packages/docs-ui/src/shared/cloud-data/snapshots/`) plus `<!--# include virtual="/api/cloud-data/fragment.md?…&site=…" stub=… -->`. At request time nginx resolves the include through `/api/cloud-data/` (loopback proxy) → `/_njs/fragment.md` (njs renderer, the same `packages/docs-ui/src/shared/cloud-data` modules as the build) → `/api/cloud-json/*` (per-site CMS proxy: en `cms.zilliz.cc`, zh-CN `cms-cn.zilliz.cc`, 60s `proxy_cache` with stale-on-error). Any upstream failure is intercepted into an empty 200 so SSI serves the snapshot stub — the `.md` route degrades to the last committed snapshot, never to an error page.

Operational prerequisites: the container must reach the site's CMS instance at startup (static `proxy_pass` hostnames resolve at config time), and the JSON responses must stay below the 1m `subrequest_output_buffer_size`. Refresh the committed snapshots with `node scripts/docs-workflow/cloud-data-snapshot.mjs --site <en|zh-CN> --from-base <cms-origin> --out packages/docs-ui/src/shared/cloud-data/snapshots/<site>.json` and gate freshness with `--check` (the wire format for a future scheduled refresher). Verification: `pnpm test:containers` (static contract) and `pnpm test:cloud-data-nginx` (live four-scenario run in `nginx:1.28-alpine`; skipped automatically without Docker).

### Selected shared Guides source generation

English Fetch generates selected shared Guides pages (Feishu Base records whose `Docs` points at a shared source tree), including image-bed upload, first activation, alias-evidence, and ownership semantics. The full generation, publication-evidence, and requirement-accounting reference lives in [runbook/shared-guides-generation.md](runbook/shared-guides-generation.md).

### Release Channel gating (CURRENT / NEXT / RETIRE-IN-NEXT)

Guides records carry a `Release Channel` field in the Feishu Base that stages unshipped (`NEXT`) and retiring (`RETIRE-IN-NEXT`) pages per deployment channel, including block-level `<NextChannel>` gating inside otherwise-current pages. The full reference lives in [runbook/release-channel-gating.md](runbook/release-channel-gating.md).

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

Shared Guides final publication evidence and shared Fetch requirement accounting are documented in [runbook/shared-guides-generation.md](runbook/shared-guides-generation.md#shared-guides-final-publication-evidence). The REST upstream and availability operations cadence (watchdog, refresh, availability matrices, zilliz probes) lives in [runbook/rest-reference-pipeline.md](runbook/rest-reference-pipeline.md#rest-upstream-and-availability-operations).

### Inspect shared Guides upstream changes without publishing

The report-only command uses already acquired local Git repositories. Prepare
a non-shallow Milvus docs repository whose `origin` matches
`shared-docs/guides/source.yaml`, and a local zdoc repository containing the
intended dev commit. The command never fetches or changes either repository.
From the zdoc tooling checkout, run:

```bash
pnpm docs-tooling shared-docs update \
  --shared-docs shared-docs/guides \
  --repo /absolute/path/to/milvus-docs \
  --dev /absolute/path/to/zdoc \
  --out /absolute/path/to/new-report
```

Master defaults to the tooling checkout's HEAD; dev defaults to the supplied
zdoc repository's HEAD (which may not be dev). Use `--master-sha`, `--dev-sha`
and `--source-sha` to pin exact lowercase 40-character commits. Source defaults
to the configured local tracking branch head. `--comparison-master-sha`
optionally supplies earlier committed configuration for a configuration-change
comparison; otherwise both configurations use master. Upstream source/output
comparisons always use the current master configuration on both endpoints,
so a configuration-only edit cannot invent an upstream next delta. `--pages` accepts unique
comma-separated page IDs. `--mode report` is optional; write mode is rejected.
Uncommitted input edits are not included in the fixed snapshots.

Optional `--evidence-run` selects a retained production Fetch run. Read-only
GitHub authentication through `gh` must be available. The command verifies the
run, exact attempt, source job/steps and unique source artifact. It downloads
the source ZIP, or verifies a supplied `--evidence-zip` against the API digest.
Archive preflight requires Python 3. It does not start Fetch or query Base.
Without retained evidence it still analyzes pages and reports lifecycle unknown.
For a single page, pass `--pages <page-id>` and the current dev SHA. The
reader also verifies that the newest applicable Fetch observed this Base record
and that the same run published its English Guides outputs. The producer must
match the reviewed Fetch tree, or the specific historical scan with an
independent Base census documented in the shared-docs package. Check
`pages[].lifecycle` and `futureEligible` in the report before using the
proposed `next`. A newer run in progress or conflicting publication evidence
keeps the page on hold.

The absent/empty output directory must not overlap input data or Git metadata
and must have no symlink components. A separate task directory under `.claude/`
is suitable. Existing evidence is never overwritten. Outputs are `pins.json`,
`report.json`, `report.md` and `plan.json`; the plan always has an empty
operations array. It records proposed next deltas for review, never edits locks,
PRs, dev or production state, uploads images, or invokes translation. Public
image reads follow the existing generation policy.

Exit 2 means invalid arguments or unsafe/nonempty output. Exit 1 means failed
infrastructure, with partial reports retained when output validation succeeded.
Exit 0 means a complete report, including no-op, unknown lifecycle, retirement
observations or explicitly failed content generation; it does not mean every
page built successfully or authorize a mutation. Inspect per-page statuses and
reasons. Current and old-next/target observations remain distinct, including
source changes hidden by Cloud replacements and image-byte changes.

### Plan and prepare a local shared-docs update

Run the local commands from the trusted tooling checkout at the exact committed
implementation you intend to use. They validate the launcher before reading any
`.env`; unsupported Node/Git/package-manager overrides are rejected. Inputs must
be already acquired local repositories. Supply a strict JSON request with exact
master/dev/source commits and complete subjects; see the
[request and evidence contract](packages/docs-tooling/src/shared-docs/README.md#local-update-commands).
The request's master must match the independently captured tooling HEAD.

Before capturing a toolset after Vite/Vitest, wait for the owning command process
to exit: ESM config loading can unlink its temporary file asynchronously. The
checkout's exact root `node_modules/.vite-temp` must be absent or an ordinary,
canonical, empty directory with safe access; symlinks, aliases and contents are
rejected. If it remains nonempty, stop and inspect the reported paths without
deleting or ignoring them to pass validation. Capture and pre-launch verification
bind the observed directory state and access identity. Persistent changes observed
on revalidation require a fresh capture; these checks are not an atomic snapshot
or continuous monitor. Child load guards refuse unmeasured executable files,
including files introduced after verification.

```bash
pnpm docs-tooling shared-docs update-plan \
  --request /absolute/request.json --out /absolute/new-plan
pnpm docs-tooling shared-docs update-prepare \
  --request /absolute/request.json --plan /absolute/new-plan \
  --unit '<unitKey from the plan>' --out /absolute/new-candidate
```

Inspect `result.json`, `reports/` and `units/` before choosing a unit. Planning
may construct an isolated prepared base; preparation rechecks the plan, source,
configuration, authority and toolset, and creates at most one local candidate
that changes only the selected next locks. Scratch Git objects, journals and
proofs stay in the owned output. Input refs and repositories remain unchanged.
SDK subjects currently return `PROVIDER_NOT_INSTALLED`; incomplete Guides
authority remains held. Neither is permission to bypass an eligibility check.

Use absent/empty, absolute canonical output directories outside input data,
Git metadata and prior evidence; a dedicated `.claude/` directory is suitable.
Ordinary invocations never overwrite evidence. To resume an interrupted prepare,
repeat its exact command with `--resume`; only the matching owned journal is
accepted and all bindings are revalidated. For `PLAN_CHANGED`, generate a fresh
plan and use a new output. Preserve conflict/hold evidence and resolve the
reported input problem; do not reset, force-push or delete arbitrary directories.

Exit 2 means invalid arguments/request/output; exit 1 means infrastructure or
acquisition failure, retaining only safely owned partial evidence. Exit 0 means
a completed observation: inspect `status` (`planned`, `held`, `prepared`,
`reused`), `disposition` and `reasons`. A `draft-failure` candidate is not
publishable. Holds contain no candidate/proof. The result is also printed as
JSON to stdout; a hold before output ownership exists only there, with no
`result.json` or fabricated pins. External `operations` is always empty.
These commands do not publish, push, create PRs or authorize production actions.
