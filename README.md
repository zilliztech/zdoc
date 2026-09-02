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
- `candidateDerivedPaths` are regenerated and validated on the exact sync candidate; do not hand-edit them.

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

The normal production entry point is [`fetch-docs.yml`](.github/workflows/fetch-docs.yml). It publishes the selected English source units to `dev`, performs final verification, and can dispatch one downstream Translation workflow. Fetch and publish-enabled Translation runs share the `docs-production-dev` concurrency group with `queue: max`; do not bypass that queue with a second manual writer.

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
- `pnpm test:replay` is the PR-level contract + Fetch + recovery gate.
- `pnpm test:replay:all` runs every hermetic replay suite before a cross-pipeline merge.

The replay harnesses use the platform system temporary directory for their isolated lanes, replicas, and evidence roots. The translation replay harness accepts an explicit override via `ZDOC_REPLAY_SAFE_ROOT` when the default is not appropriate.

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

### Start and monitor a publication

For a normal full release, dispatch `fetch lark docs` with:

- `group=all`
- `target_branch=dev`
- `publish=true`
- `media_upload_mode=write`
- `run_translations=true` when the downstream Translation handoff is required
- the intended `tooling_ref` and `source_ref` (normally `master` and `dev`)

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

### Evidence required after a successful run

Record the run URLs and retain these facts before handing off to Jenkins:

- Fetch selection and terminal results, including the runtime FIFO and final `dev` SHA;
- every successful result SHA is an ancestor of the final target;
- source publication barrier and final verification passed;
- localization input inventory and English revision inventory passed;
- Guides reports were collected for both `en` and `zh-CN`, and the final card contains exactly nine available notes with no `Unavailable` entry;
- if Translation ran, its own selection/results, reconciliation result, FIFO order, ancestry, and absence of unknown remote state;
- the exact `dev` SHA that Jenkins builds.

Jenkins should be started or inspected only after the exact SHA is known. Confirm that the build label contains that SHA and that the intended target (for example `EN+CN → UAT`) is shown. A branch name alone is not sufficient evidence.

### Failure handling and recovery

Stop at the first failed boundary and classify the failure before retrying:

- **Prepare or producer failure:** no publication writer should have run. Inspect the failed job log, selection, and checkpoint artifact preflight. Fix the local cause and rerun the same workflow inputs; do not start Translation from a partial handoff.
- **Validation or known Git publication failure:** inspect `publication-results.json`, the unit failure code, and the target tip. Ordinary unit failures may allow later ready units to continue, so use the terminal results rather than assuming that a failed producer means nothing was written.
- **`REMOTE_STATE_UNKNOWN`:** treat the run as a safe stop. Do not cancel a running production Translation, force-push, reset, rebase, or blindly rerun the writer. Inspect the remote branch, candidate/result SHAs, and the exact probe evidence first. Resume only after the remote state is known.
- **Reference reconciliation failure:** source publication may already be present. Preserve the run artifacts, verify the published ancestry, and repair or rerun only the reconciliation boundary after confirming the current target tip. Do not pay for Translation again until the source barrier and schema-v3 handoff are valid.
- **Translation unit failure:** a normal unit failure is recorded and later ready units can continue; an unknown remote state stops later writes. Inspect the child run's unit results, reports, remaining count, and reconciliation output before deciding whether recovery is needed.
- **Expired or incompatible Translation artifacts:** use [`recover-translation.yml`](.github/workflows/recover-translation.yml) with the previous Translation workflow run ID (not a job ID). First run with `publish=false` to authenticate the recovery plan and inspect rejected units. Only after the plan is compatible should you rerun with `publish=true`. `allow_full_retranslate=true` is an advanced, explicitly authorized path for the case where no retained file is compatible; it may invoke paid models and must not be enabled casually.
- **Reconciliation review:** a `translation-reconciliation-review-*.json` artifact is produced when a deletion or path change requires human authorization. Generate the deterministic approval PR with `scripts/docs-workflow/reconciliation-review-pr.js`, review the exact plan, expected mutations, source/target identities, and policy exception body, then merge only when the decision should remain standing. Do not hand-edit or push policy files directly to `dev`; after merge, run the normal master-to-dev tooling sync.
- **Card/reporting failure:** the card is observability, not the Git writer. Preserve the publication selection/results and final verification artifacts, then use the final card artifact or monitor finalization evidence to determine whether the business flow actually succeeded.

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
2. Produce `offline-reference-python-receipt.json` as canonical JSON data with `schemaVersion: 1`, `document: offline-reference-translation-receipt`, `unitKey: translation/zh-CN-reference/python`, exact `toolingSha`, `sourceCheckpointSha`, and `targetBaselineSha`, plus a sorted non-empty `files` array. Each entry contains `sourcePath`, raw `sourceSha256`, canonical `targetPath`, nullable raw `baseTargetSha256`, and raw `targetSha256`. Set `receiptSha256` to SHA-256 of the canonical receipt body without that field. Push the candidate only to the restricted staging namespace, then dispatch [`upload-offline-reference-python-receipt.yml`](.github/workflows/upload-offline-reference-python-receipt.yml) with the canonical JSON and all exact candidate/tooling/checkpoint/baseline identities. This read-only producer reauthenticates every hash and the candidate's single parent from Git before uploading the fixed receipt filename. Retain its completed run ID, artifact ID, exact name, and GitHub-reported `sha256:` digest. Local files or artifacts from unrelated runs are not valid substitutes.
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

## Containers

The runtime images contain only Nginx plus the selected static build output. Build from the repository root:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=en --build-arg JENKINS_BUILD_ID=local-preview -f deploy/en/Dockerfile -t zdoc-en .
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=zh-CN --build-arg JENKINS_BUILD_ID=local-preview -f deploy/zh-CN/Dockerfile -t zdoc-zh-cn .
```

The English image includes Japanese content. The two commands are independent; invoke only the selected target or invoke both without treating one target's failure as a repository-level requirement for the other. The Dockerfiles build the static sites internally, so Jenkins does not need to run `pnpm build:*` before these container builds. Image naming and registry tagging remain Jenkins-owned.

The site-owned Nginx configurations are `deploy/en/nginx.conf` and `deploy/zh-CN/nginx.conf`. Runtime environment rendering is owned by `deploy/runtime/40-zdoc-env.sh`.

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
