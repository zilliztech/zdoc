# Publisher Job Gating Design

## Problem

The checkpointed documentation workflow correctly limits producer jobs to the selected content group, but every source publisher reusable workflow is invoked with a caller-level `if: ${{ always() }}`. Artifact-only and single-group runs therefore allocate publisher runners that immediately emit `status=skipped`, creating unnecessary cost and misleading workflow results.

## Root cause

The publication chain is deliberately serialized through translation publisher dependencies. `always()` is required so a selected later group can proceed when earlier, unselected dependencies are skipped. The caller condition lacks the positive eligibility checks that distinguish a selected, publish-enabled, artifact-ready group.

## Approved approach

Keep `always()` and add three caller-side gates to each of the seven source publisher jobs:

1. Publication mode is enabled.
2. The requested group is `all` or matches the publisher's group.
3. The matching producer returned `artifact_ready`.

Keep the reusable publisher's existing `should_publish` input as defense in depth.

## Testing

Add one policy regression test that parses `.github/workflows/fetch-docs.yml` and checks the complete caller condition for all seven source publishers. Verify the test fails before changing the workflow, then passes afterward. Run the existing workflow-focused suite for regression coverage.

## Runtime validation

After the patch is reviewed and pushed with authorization, dispatch one publish-enabled CLI run against a disposable branch copied from `dev`. Confirm only CLI source production/publication runs and final verification succeeds.

## Non-goals

- Redesigning checkpoint artifacts or publication serialization.
- Running an expensive `group=all` production rehearsal.
- Changing translation publisher conditions.
- Modifying unrelated local changes.
