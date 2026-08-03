# Master tooling to dev synchronization

## Decision

The first synchronization is a reviewed pull request that merges one exact master SHA into the current dev baseline. Later master pushes run an automated, fail-closed PR workflow.

## Ownership

- Dev owns published content, generated sidebars and manifests, translation state, fetched source snapshots/reports, and English source sidebar overrides.
- Master owns tooling, workflows, applications, packages, deployment contracts, and `config/reference-retirements.json`.
- A master history that changes a dev-owned path is not synchronizable automatically.
- A merge candidate must preserve every dev-owned path from the exact dev baseline and match the exact master SHA everywhere else.

## Bootstrap

The automated workflow remains inert until `deploy/contracts/master-tooling-sync.json` exists and is enabled on dev. This makes the initial synchronization manual and reviewed.

## Automated transaction

1. Acquire the shared `docs-production-dev` single-writer concurrency group.
2. Resolve exact master and dev SHAs and verify master ancestry.
3. Reject master changes to dev-owned paths.
4. Create a normal merge commit from the exact dev baseline and exact master SHA.
5. Verify path ownership in both directions.
6. Run focused repository validation.
7. Recheck dev, push an immutable candidate branch, and create a PR.
8. Dispatch `site-validation.yml` for both sites against the exact candidate SHA and wait for success.
9. Recheck the dev baseline and PR head, then merge the PR.

Conflicts, validation failures, moved refs, or ownership drift leave an unmerged evidence-bearing PR and fail the workflow.
