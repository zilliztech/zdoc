# Docs CI Follow-up Fixes Design

## Goal

Fix the gaps found after GitHub Actions run `28966660730`:

1. The EN docs fetch step still took more than one hour because incremental planning fell back to full fetch.
2. Link-check reports were generated but disappeared from the Feishu card after the final cross-job card update.
3. The `translate-codex.yml` localization workflow failed before translation because it checked out a stale branch name.

## Investigation Summary

Run `28966660730` succeeded, but the timing showed:

- `fetch english docs`: 73m 02s
- `build docsite`: 8m 45s
- `fetch sdk references`: 21m 29s
- `build and check sdk docs`: 1m 34s

The incremental fetch planner ran, but the generated plan was:

```json
{
  "mode": "full",
  "expanded": 370,
  "warnings": ["Changed record count 370 exceeds full-fetch threshold 93."]
}
```

The reason distribution was:

```json
{
  "source content changed": 190,
  "new canonical record": 2,
  "source file missing": 178,
  "wiki node edit time changed": 11
}
```

This means the planner is functioning mechanically, but the snapshot baseline is unstable enough that effectively all canonical docs look changed.

There is a more fundamental baseline bug: scheduled `fetch lark docs (auto)` runs execute from the default branch (`master`) because the `schedule` event checks out the workflow ref by default. The workflow writes the refreshed snapshot and fetched docs to `dev` through `stefanzweifel/git-auto-commit-action`, but the next scheduled run starts again from `master`. If `master` still contains an older `plugins/lark-docs/meta/snapshots/guides-uat-last-success.json`, every scheduled run can compare live Feishu/Base state against a stale snapshot, fall back to full fetch, then push the new snapshot only to `dev`, where the next scheduled run will not read it.

However, checking out `dev` wholesale is not the right fix. Workflow logic, plugins, and scripts should come from the workflow/default branch so CI uses the latest pipeline code. Generated docs state should come from `dev`. The fix must separate code checkout from generated-state restore.

The Feishu report card received a link-check note during the `fetch` job, and the run committed `plugins/link-checks/meta/reports/latest.md` and `latest.json` to `dev`. The later `success` job reconstructs card state from job outputs and patches the card without notes, overwriting the report content.

The localization workflow run `28973044446` failed in `actions/checkout`:

```text
A branch or tag with the name 'feat/zdoc-redesign' could not be found
```

The workflow hardcodes `ref: feat/zdoc-redesign`, while GitHub only found similarly named branches such as `feat/zdoc-redesign-dev` and `feat/zdoc-redesign-ui-updates` during that run.

## Requirements

### Incremental Fetch

The incremental planner must avoid falling back to full mode merely because source files are missing before the first incremental fetch. A source file is expected to be missing when the current checkout does not contain the previously fetched source cache. Missing local cache must not be treated as proof that the upstream Feishu doc changed.

The workflow must read incremental state from the same branch it updates, without running stale scripts from that branch. For scheduled and manual UAT fetches, the source-of-truth branch for generated docs and snapshots is `dev`; therefore the fetch job should:

1. check out the workflow/default branch for code,
2. fetch `origin/dev`,
3. restore only generated-state paths needed by the planner from `origin/dev`,
4. run scripts/plugins from the checked-out code branch,
5. push generated outputs and refreshed snapshots back to `dev`.

Generated-state paths include at least:

- `plugins/lark-docs/meta/snapshots/`
- `plugins/lark-docs/meta/sources/`
- generated docs/reference paths already written back to `dev`, if the fetch/build logic depends on them as preservation baselines.

The planner should use the previous snapshot as the stable baseline for unchanged docs:

- If current live Base metadata and wiki node metadata match the snapshot, the doc should be treated as unchanged even if the current source JSON file is absent.
- If current source JSON exists, compare its hash to `previous.source_hash`.
- If current source JSON is absent and live metadata did not change, keep the doc out of `changed_records`.
- If current source JSON is absent and live metadata changed, include the doc with the metadata change reason.

The planner must still fall back to full mode when:

- no previous snapshot exists,
- previous snapshot schema is too old for wiki metadata on the selected source-of-truth branch,
- a canonical record was removed,
- the changed count exceeds the threshold after stable missing-source handling,
- the source graph cannot be read at all.

The workflow should publish the incremental plan as a Feishu card note when the plan falls back to full mode or when the changed count exceeds a small threshold. This makes future slow runs explain themselves on the card.

The current workflow only uses `--incremental` for `guides/zilliz.saas`. The follow-up should not expand incremental fetching to SDK references in this change. It may add `--incremental` to `guides/zilliz.paas` only if it reuses the same `guides-uat-last-success.json` safely and avoids duplicate source fetch work. Otherwise leave target expansion for a separate change.

### Feishu Card Reports

The final `--card-finish` update must preserve report notes appended earlier in the fetch job.

The implementation should make note persistence explicit by passing a serialized note payload through GitHub Actions outputs instead of assuming `.build-card-state.json` exists in the `success` or `failure` job workspace.

The card must include:

- link-check report summary from `plugins/link-checks/meta/reports/latest.md`,
- canonical/broken content link report summary from `plugins/lark-docs/meta/reports/guides-canonical-link-audit.md` or a compact derived report,
- incremental fetch plan summary when the run falls back to full mode.

The note content should stay compact enough for a Feishu card. Large reports can be committed as artifacts/files, but the card should show the summary and relevant paths.

### Localization Workflow

The translation workflow must not hardcode a deleted or unstable branch.

The correct target should be configurable:

- default to `dev` unless repository variable `TRANSLATION_TARGET_BRANCH` is set,
- allow `workflow_dispatch` input `target_branch` to override the variable,
- use the same resolved branch for checkout and auto-commit.

For `workflow_run` triggers, the workflow should translate from the branch that receives fetched docs, currently `dev`, not from the upstream `master` commit that triggered the fetch workflow.

## Non-goals

- Do not redesign the whole docs fetch pipeline.
- Do not make SDK reference fetches incremental in this change.
- Do not change the translation agent prompt or review logic.
- Do not make link-check failures block successful builds unless the existing behavior already does so.

## Acceptance Criteria

1. A unit test proves missing current source files do not mark unchanged docs as changed when snapshot and wiki metadata match.
2. A unit test proves missing current source files still mark a doc changed when wiki metadata changed.
3. `fetch-docs-auto.yml` runs scripts/plugins from the workflow branch but restores generated-state paths from `dev` before fetch planning.
4. `fetch-docs-manual.yml` runs scripts/plugins from the workflow branch but restores generated-state paths from the selected generated-output branch before fetch planning.
5. A unit test proves `report-to-lark --card-finish` preserves notes passed from a prior job.
6. `fetch-docs-auto.yml` and `fetch-docs-manual.yml` pass report-note payloads from the fetch job to success/failure jobs.
7. The fetch job attaches link-check and canonical link report summaries before final card completion.
8. `translate-codex.yml` resolves the target branch from workflow input, repo variable, or `dev`, and uses that branch for both checkout and commit.
9. Local tests pass:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
node plugins/report-to-lark/reportCardState.test.js
```

10. Workflow YAML syntax remains valid enough for `git diff --check` and visual review.
