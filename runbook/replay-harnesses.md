# Replay harnesses and real-artifact evidence

Deep-dive evidence procedures behind the replay suites listed in the
[README runbook](../README.md#replay-harnesses). The suite list and the stable
package scripts stay in the README; this page carries the long-form evidence
modes. Use the [docs-workflow code-to-test matrix](../.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md)
to map changed files to focused tests, replay harnesses, and broader gates.

## Full local evidence mode for shared Fetch publication

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

## Replay the requested Guides workflow against real retained artifacts

`pnpm test:replay:requested` runs hermetically against a committed real-data slice. Before enabling or changing `publish=true` behavior in `fetch-guides-requested.yml`, additionally replay the complete retained artifacts of a recent successful Fetch run:

1. Pick a successful `fetch lark docs` run on `dev`, note its run ID, attempt, `masterSha`, and `devBaselineSha` from the checkpoint manifest.
2. Download the retained `guides-sources-en-<run>` artifact, the `docs-checkpoint-guides-en-<run>` artifact, and the Guides table artifacts for the run's affected tables into an isolated evidence root (never the real `origin`), recording each artifact ID and `sha256` in a `manifest.txt` line format `<id> <name> <sha256>`.
3. Extract `guides-source.tar` and the checkpoint/table archives below `artifacts/` in that root and write a `real-context.json` describing the run identity, the baseline snapshot path (from `git show <devBaselineSha>:packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json`), the candidate snapshot path, the source directory, the site root token, and the table artifact manifest directories.
4. Run `REPLAY_REQUESTED_GUIDES_ROOT=<evidence-root> pnpm test:replay:requested`. The harness verifies every recorded digest, preflights the checkpoint archive, replays the stable-table, outline-change, cross-table-move, and closure-external-conflict scenarios, and proves the ordinary automatic planner still detects the external change after a blocked requested run.
5. Preserve the generated `replay-report.json` (run identity, artifact digests, checkpoint file count, per-scenario plan/receipt hashes, isolation results) as the merge and rollout evidence.
