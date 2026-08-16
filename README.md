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

## Content production

Use the site-qualified docs tooling commands and workflows. Do not publish by invoking retired root Docusaurus or plugin wrappers.

```bash
pnpm test:workflow-policy
pnpm test:retirement
```

GitHub Actions owns source production, translation, validation, and image build orchestration. English/Japanese and Chinese production remain independently addressable. External Jenkins UAT and Prod pipelines consume the selected repository branch through the same site-qualified build interface; Jenkins configuration is maintained outside this repository.

## Production publication runbook

The normal production entry point is [`fetch-docs.yml`](.github/workflows/fetch-docs.yml). It publishes the selected English source units to `dev`, performs final verification, and can dispatch one downstream Translation workflow. Fetch and publish-enabled Translation runs share the `docs-production-dev` concurrency group with `queue: max`; do not bypass that queue with a second manual writer.

### Before publishing

1. Confirm that the intended tooling is already on `dev` through the PR-based [`sync-master-tooling-to-dev.yml`](.github/workflows/sync-master-tooling-to-dev.yml) workflow. The candidate must be an exact master commit and the resulting merge must be identifiable in the workflow and PR history.
2. Check the current `dev` tip and make sure no production Fetch, Translation, or tooling run is already active.
3. For a risky workflow or artifact change, run the repository tests and a local real-artifact replay first. A replay must use real retained checkpoint archives, a local bare Git remote, the exact validation commands and site environment, and an isolated dependency layout. It must never push to the real `origin`.

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
5. `prepare_translation_handoff` writes the schema-v2 handoff bound to the exact source commits and reconciled target SHA;
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
- **Reference reconciliation failure:** source publication may already be present. Preserve the run artifacts, verify the published ancestry, and repair or rerun only the reconciliation boundary after confirming the current target tip. Do not pay for Translation again until the source barrier and schema-v2 handoff are valid.
- **Translation unit failure:** a normal unit failure is recorded and later ready units can continue; an unknown remote state stops later writes. Inspect the child run's unit results, reports, remaining count, and reconciliation output before deciding whether recovery is needed.
- **Expired or incompatible Translation artifacts:** use [`recover-translation.yml`](.github/workflows/recover-translation.yml) with the previous Translation workflow run ID (not a job ID). First run with `publish=false` to authenticate the recovery plan and inspect rejected units. Only after the plan is compatible should you rerun with `publish=true`. `allow_full_retranslate=true` is an advanced, explicitly authorized path for the case where no retained file is compatible; it may invoke paid models and must not be enabled casually.
- **Reconciliation review:** a `translation-reconciliation-review-*.json` artifact is produced when a deletion or path change requires human authorization. Generate the deterministic approval PR with `scripts/docs-workflow/reconciliation-review-pr.js`, review the exact plan, expected mutations, source/target identities, and policy exception body, then merge only when the decision should remain standing. Do not hand-edit or push policy files directly to `dev`; after merge, run the normal master-to-dev tooling sync.
- **Card/reporting failure:** the card is observability, not the Git writer. Preserve the publication selection/results and final verification artifacts, then use the final card artifact or monitor finalization evidence to determine whether the business flow actually succeeded.

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
