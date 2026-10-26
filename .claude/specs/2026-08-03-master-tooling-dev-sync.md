# Master tooling to dev synchronization

## Decision

The first synchronization is a reviewed pull request that merges one exact master SHA into the current dev baseline. Later master pushes run an automated, fail-closed PR workflow.

## Ownership

- Dev owns published content, generated sidebars and manifests, translation state, fetched source snapshots/reports, and English source sidebar overrides.
- Master owns tooling, workflows, applications, packages, deployment contracts, `config/reference-retirements.json`, and the preserved landing pages declared in `masterAuthoritativePaths` (which live under the otherwise dev-owned `content/` root and override it).
- Candidate-derived paths are deterministic outputs of the exact merge candidate. They are `deploy/contracts/localization-inputs.inventory.json` plus the REST reference derivation set regenerated from the candidate's OpenAPI fragments: the English, Chinese, and Japanese REST output directories, `generated/{en,zh-CN}/sidebars/restful.sidebar.js`, `generated/{en,ja-JP,zh-CN}/manifests/rest-derivation.json`, and the Reference manifest pair `generated/en/manifests/reference.json` / `generated/zh-CN/manifests/reference-translations.json` (see "Candidate-derived REST derivation").
- Candidate-derived paths may sit beneath a dev-owned root. They stay dev-owned for master-history inspection and the site-validation ownership gate, so master still may not hand-edit them; only candidate verification exempts them. A candidate-derived directory may contain master-authoritative files (the preserved REST landing pages), which keep winning and must still match master byte-for-byte, but a candidate-derived path may never be or sit below a master-authoritative path.
- A master history that changes a dev-owned path is not synchronizable automatically, except for declared master-authoritative paths.
- A merge candidate must preserve every dev-owned path from the exact dev baseline and match the exact master SHA everywhere except explicitly declared candidate-derived paths.
- Candidate-derived paths must be regenerated and checked on the exact merge candidate; declaring one does not bypass its freshness validation.

## Bootstrap

The automated workflow remains inert until `deploy/contracts/master-tooling-sync.json` exists and is enabled on dev. This makes the initial synchronization manual and reviewed.

## Automated transaction

1. Acquire the shared `docs-production-dev` single-writer concurrency group.
2. Resolve exact master and dev SHAs and verify master ancestry.
3. Reject master changes to dev-owned paths except declared master-authoritative paths.
4. Create a normal merge commit from the exact dev baseline and exact master SHA.
5. Install dependencies and run `scripts/docs-workflow/regenerate-sync-candidate.js`, which regenerates the declared candidate-derived files on the exact merge candidate in two phases: it regenerates the REST reference publication and amends the original merge commit while preserving both parents, then reconciles the Reference manifests and the localization inventory against that committed REST candidate in one child commit (omitted when nothing changes).
6. Recompute the final candidate SHA and verify path ownership in both directions against that final commit.
7. Run focused repository validation.
8. Recheck dev, push the immutable final candidate branch, and create a PR.
9. Dispatch `site-validation.yml` for both sites against the final candidate SHA and wait for success.
10. Recheck the dev baseline and PR head against the final candidate SHA, then merge the PR.

Conflicts, validation failures, moved refs, or ownership drift leave an unmerged evidence-bearing PR and fail the workflow.

## Candidate-derived REST derivation

Added 2026-10-20 after the sync for PR #783 (run 39413945887) failed. REST reference pages are generated from the OpenAPI fragments under `packages/docs-tooling/src/reference/rest/meta/openapi/`, which are master tooling, while the generated pages, sidebars, and per-locale `rest-derivation.json` manifests are dev-owned publication state that only Fetch's REST lanes used to rewrite. A fragment change on master therefore produced a candidate whose fragments disagreed with dev's manifests, and `write-provenance.mjs` failed both site builds with `REST_DERIVATION_FRAGMENT_DRIFT` until the next Fetch regenerated the manifests (the same window had opened for PR #655 on 2026-09-17). The sync now closes that window itself instead of weakening the drift check:

- Phase 1 runs `pnpm docs-tooling publish-group --site en --group rest` and `--site zh-CN --group rest` through `fetch`, `validate`, and `publish`, exactly like `_fetch-content-group.yml`, with `ZDOC_REST_TOOLING_SHA` set to the exact master tooling SHA so the manifests never record the pre-amend merge commit. The Chinese lane needs `DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER` and `IMAGE_BED_URL` (`vars.ZH_CN_IMAGE_BED_URL`) because the zh-CN publication adapters always run, even though spec-generated REST pages carry no images. The candidate already holds the exact dev state, so the Fetch lane's baseline worktree, `restore-generated-state.sh`, and `prepare-content-group-workspace.js` steps are not needed. Any change outside the REST derivation set fails closed before anything is committed.
- Phase 2 runs `pnpm docs-tooling reference-manifest --source content/en/reference --target content/zh-CN/reference --source-commit <REST candidate> --write` only when the REST candidate changed a Reference page relative to the dev baseline, because the manifests record a source commit whose `content/en/reference` tree must match exactly and site validation checks that commit out fresh; a reachable parent commit is the same shape Fetch's `reconcile Fetch Reference state` commits use. It then regenerates and checks the localization inventory. These outputs land in one child commit; the final candidate SHA is that commit, or the REST candidate when nothing changed.
- Regeneration runs on every sync. Generation is a pure function of the fragments, the REST metadata, and the generator, so an unchanged input only refreshes `toolingSha`/`generatedAt` in the three manifests, which Fetch already does three times a day. Fetch's REST lanes remain the publication path and converge on identical bytes.

## Candidate-derived publication recovery

The localization inventory is master tooling whose contents are derived from dev-owned localization inputs. Publication recovery keeps candidate-derived inventory and Reference state convergent at these boundaries:

- `translate-codex.yml` independently reconciles and publishes only the inventory after all selected translation publishers reach a terminal state, even when another translation lane fails.
- After inventory reconciliation reaches a terminal state, `translate-codex.yml` independently reconciles Chinese Reference manifests and generated Reference sidebars whenever the selected locale and group can publish Chinese Reference. This recovery boundary also runs after partial publication when another translation lane fails.
- The all-groups derived-state reconciliation remains a separate fail-closed gate downstream of both independent recovery boundaries.
- `fetch-docs.yml` restores the exact immutable dev baseline and checks the inventory before card creation, producers, or paid work. A stale target fails early without repairing or publishing anything.
- `restore-generated-state.sh --exact` restores the inventory from the selected dev commit together with the other dev-owned generated state. Final verification can then combine immutable master tooling with the exact candidate-derived file published on dev.

Inventory reconciliation commits must change only `deploy/contracts/localization-inputs.inventory.json`. They do not authorize source publication, site deployment, S3 writes, or OSS writes.

Reference reconciliation commits must change only the English and Chinese Reference manifests and the generated Python, Java, Node, Go, CLI, and RESTful Reference sidebars for both locales. They do not authorize Guides state, source publication, site deployment, S3 writes, or OSS writes.

## Deferred follow-up: deduplicate site validation

Do not change validation triggers until the current translation workflow and its real-artifact verification are complete.

Current `site-validation.yml` runs for pull requests into `master` and for pushes to `master` and `dev`. For a normal PR into `master`, this performs the expensive site validation before merge and starts it again after merge. Recent evidence includes PR #137 (`pull_request` run `30781527865`, successful) followed by master `push` run `30782402026`; the post-merge run for PR #136 (`30781937769`) was cancelled when the next master update superseded it.

Pull requests into `dev` are excluded from the `pull_request` trigger. Every dev PR on record was created by the GITHUB_TOKEN sync bot, and GitHub holds such pull_request runs for manual approval without ever scheduling them, then discards them as failed when the sync workflow merges. A dev pull_request trigger therefore only ever produced that red phantom run; the dispatched exact-candidate validation below remains the authoritative gate for sync candidates. If a human ever needs to open a dev PR, run `site-validation.yml` manually via `workflow_dispatch` against the PR head SHA.

After translation completion, review and implement the following boundary:

- Keep full validation for pull requests into `master`; keep `dev` out of the `pull_request` trigger because sync-bot PRs are the only dev PRs and GitHub approval-holds their GITHUB_TOKEN-triggered runs (see above).
- Keep `workflow_dispatch` as the authoritative exact-candidate gate used by master-tooling synchronization.
- Keep validation for pushes to `dev`, because source and translation publication can update `dev` without a PR.
- Remove or reduce validation for pushes to `master` to lightweight tooling and contract checks, assuming protected `master` continues to require the pre-merge PR gate.
- Confirm that direct or emergency pushes to `master` have an explicit fallback before removing the full push trigger.

Acceptance evidence should show that a normal master PR receives one full pre-merge site gate, a direct publication to dev remains validated, and an exact tooling-sync candidate cannot merge without its immutable dispatched validation.
