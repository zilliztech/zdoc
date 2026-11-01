# Translation operations

Translation-side operator procedures: quality assets, the scheduled dispatcher,
manifest migration, prechecks, and the reconciliation callback consumer. The
runbook and section index live in [README.md](../README.md).

## Japanese translation quality assets

Japanese translation carries two quality assets maintained on `master`. The authoritative Japanese and Simplified Chinese house styles live in [`.github/prompts/codex-style-guide.ja-JP.md`](../.github/prompts/codex-style-guide.ja-JP.md) and [`.github/prompts/codex-style-guide.zh-CN-reference.md`](../.github/prompts/codex-style-guide.zh-CN-reference.md); each is registered as the target's `style` prompt and injected into every translation stage between the locale contract and the stage prompt, and each participates in the recovery prompt-contract hash (`promptContractSha256`), so editing one changes that target's recovery compatibility exactly like any other prompt change. A read-only translation-memory helper backs style and terminology retrieval: `node scripts/translation/tm-retrieve.js --repository <abs> --checkpoint <sha> --page <content/en/...>` returns published EN/JA neighbor pairs with anchor-aligned excerpts, and `--render-fewshot` renders them as a prompt block; it is offline tooling and no workflow invokes it yet. An experimental whole-file agentic provider is also wired behind a repository variable: setting `TRANSLATION_PROVIDER=agentic` (with `DEEPSEEK_API_KEY`/`DEEPSEEK_BASE_URL`, optionally `AGENTIC_TRANSLATION_MODEL`, default `deepseek-flash`; and `AGENTIC_REASONING_EFFORT`, one of `none|minimal|low|medium|high|xhigh|ultra|max`, default `medium`) makes the Translation producer run `scripts/translation/agenticProvider.js` — file-level agent sessions with bounded deterministic repair — instead of the unit pipeline; remove the variable to return to the default. The provider always pins the codex reasoning wire shape to `reasoning: {effort: <value>}` with summaries disabled: Responses gateways built on litellm up to v1.100 forward the whole reasoning object as `reasoning_effort` whenever it carries a `summary` key, which the DeepSeek API rejects with 422 before any paid turn. Its surgical incremental lane (`scripts/translation/surgicalUpdate.js`) updates changed files in place against the source delta — unchanged bytes pass through untouched — behind the same provider; lane selection is a deterministic section-hash classifier and a protected-token guard proves link/anchor/code updates landed. See [the design spec](../.claude/specs/2026-09-11-translation-quality-assets-design.md) for the asset roadmap.

## Scheduled translation dispatcher

An hourly [`translation-dispatcher.yml`](../.github/workflows/translation-dispatcher.yml) keeps the Japanese and Chinese reference translations aligned with published English sources. Each cycle it counts pending files per translation unit through the producer's own manifest selection, merges the result into a persisted task-list artifact (`translation-dispatch-plan-<run>`; completed items are checked off by git state, not bookkeeping), and — when no producer or publisher run is active — dispatches one `translate-codex` producer run in `mode=auto` with `publish=true` for the budgeted set of backlogged groups (default 300 pending files, largest group first; a single group larger than the budget still dispatches alone so rotation never stalls). Guides carries an additional per-run pending-file cap (`guides_max_files`, dispatcher default 150, 0 disables) that binds only in incremental mode — a capped run resumes its remainder on the next cycle. The dispatcher never owns the production queue, and it stops without dispatching whenever producer activity cannot be determined; a counting failure fails the cycle closed. Arming: set the repository variable `TRANSLATION_DISPATCHER_DISPATCH=true` to let scheduled cycles dispatch (the default is dry-run decision logs only); a manual dispatch with the `dispatch` input forces one armed cycle regardless of the variable. Disable by deleting the variable or disabling the workflow.

Armed cycles carry three guards. A **source build gate** builds the current `dev` tree (`build:en`) before dispatching and attributes failures to the dispatch set: broken English source blocks its whole group (both locale tracks ride together), while broken translated files never block — translated output is pipeline-owned, so dispatching is its only repair path. The build verdict is cached per dev HEAD; a red build whose failures cannot be attributed fails the cycle closed. Route failures are matched back to files by their slug segment, so two pending files sharing a basename across groups leave that route unattributed and the cycle skips closed (surfaced as a `build-red` alert) until dev moves or one group clears. A **dispatch backoff** blocks a unit after two failed producer conclusions on the same source checkpoint (a newer checkpoint reopens it automatically); a failed run's completed batches are usually salvageable through [`recover-translation.yml`](../.github/workflows/recover-translation.yml) with `previous_translation_run_id=<run>` and `publish=false` rather than a fresh paid dispatch. **Guard alerts** (source-gate blocks, backoff engagements, unattributable red builds, broken translated files or translated pages with no scheduled repair) land as one Feishu card per cycle, deduplicated by identity; they are governed by their own mute variable `TRANSLATION_DISPATCHER_ALERTS_DISABLED` — unset sends, `true`/`1` mutes without consuming the events (unmuting replays whatever fired while muted) — independent of the repository-wide Feishu notification kill switch.

## Migrate the Japanese publication manifest

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

## Precheck a translation diff with the fast-path validator

Before opening a PR for hand-validated translated content on top of `dev`, run the local fail-closed precheck from an isolated worktree whose `HEAD` is based on the current `origin/dev`:

```bash
node scripts/translation/fastpath-precheck.js --locale <ja-JP|zh-CN> --path <repository-relative-path>...
```

The precheck derives its scope from the [evidence equivalence groups](../.claude/specs/2026-09-04-publication-evidence-chains-unification-design.md): Japanese Guides and Japanese Reference diffs are validated against the Japanese translation manifest, Chinese non-REST Reference diffs regenerate `reference-translations.json` through `reference-manifest --write`, Chinese Guides diffs ride the fetch-group publication manifest, and Japanese REST output is checked against the per-locale `rest-derivation.json` fragment hashes. It then executes every selector command plus `validate-reference` for the affected sites, re-checks `origin/dev` for drift, and writes `report.json`/`report.md` under `tmp/translation-fastpath/<run>/`. Only `READY_FOR_PR` exits `0`; every other status is a safe stop, and the tool never commits, pushes, or acquires the production queue.

## Feishu reconciliation approval card

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

## Hosting the Feishu callback consumer

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
