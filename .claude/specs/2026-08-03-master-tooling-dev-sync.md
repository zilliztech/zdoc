# Master tooling to dev synchronization

## Decision

The first synchronization is a reviewed pull request that merges one exact master SHA into the current dev baseline. Later master pushes run an automated, fail-closed PR workflow.

## Ownership

- Dev owns published content, generated sidebars and manifests, translation state, fetched source snapshots/reports, and English source sidebar overrides.
- Master owns tooling, workflows, applications, packages, deployment contracts, and `config/reference-retirements.json`.
- Candidate-derived paths are deterministic outputs of the exact merge candidate. The only current candidate-derived path is `deploy/contracts/localization-inputs.inventory.json`.
- A master history that changes a dev-owned path is not synchronizable automatically.
- A merge candidate must preserve every dev-owned path from the exact dev baseline and match the exact master SHA everywhere except explicitly declared candidate-derived paths.
- Candidate-derived paths must be regenerated and checked on the exact merge candidate; declaring one does not bypass its freshness validation.

## Bootstrap

The automated workflow remains inert until `deploy/contracts/master-tooling-sync.json` exists and is enabled on dev. This makes the initial synchronization manual and reviewed.

## Automated transaction

1. Acquire the shared `docs-production-dev` single-writer concurrency group.
2. Resolve exact master and dev SHAs and verify master ancestry.
3. Reject master changes to dev-owned paths.
4. Create a normal merge commit from the exact dev baseline and exact master SHA.
5. Install dependencies, regenerate and check declared candidate-derived files on the exact merge candidate, then amend the original merge commit while preserving both parents.
6. Recompute the final candidate SHA and verify path ownership in both directions against that final commit.
7. Run focused repository validation.
8. Recheck dev, push the immutable final candidate branch, and create a PR.
9. Dispatch `site-validation.yml` for both sites against the final candidate SHA and wait for success.
10. Recheck the dev baseline and PR head against the final candidate SHA, then merge the PR.

Conflicts, validation failures, moved refs, or ownership drift leave an unmerged evidence-bearing PR and fail the workflow.

## Deferred follow-up: deduplicate site validation

Do not change validation triggers until the current translation workflow and its real-artifact verification are complete.

Current `site-validation.yml` runs for both pull requests and pushes to `master` and `dev`. For a normal PR into `master`, this performs the expensive site validation before merge and starts it again after merge. Recent evidence includes PR #137 (`pull_request` run `30781527865`, successful) followed by master `push` run `30782402026`; the post-merge run for PR #136 (`30781937769`) was cancelled when the next master update superseded it.

After translation completion, review and implement the following boundary:

- Keep full validation for pull requests into `master` and `dev`.
- Keep `workflow_dispatch` as the authoritative exact-candidate gate used by master-tooling synchronization.
- Keep validation for pushes to `dev`, because source and translation publication can update `dev` without a PR.
- Remove or reduce validation for pushes to `master` to lightweight tooling and contract checks, assuming protected `master` continues to require the pre-merge PR gate.
- Confirm that direct or emergency pushes to `master` have an explicit fallback before removing the full push trigger.

Acceptance evidence should show that a normal master PR receives one full pre-merge site gate, a direct publication to dev remains validated, and an exact tooling-sync candidate cannot merge without its immutable dispatched validation.
