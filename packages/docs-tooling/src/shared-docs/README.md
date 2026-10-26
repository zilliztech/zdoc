# Shared docs readers and test support

Run `pnpm test:shared-docs` from the repository root. Tests use the Node
environment and local fixtures; no credentials or network access are needed.
The Git reader implements the MilvusDocsReader contract against a local checkout;
the other external integrations remain substitutes. `index.ts` exports types only.
Core parses caller-supplied YAML and plans locks without I/O. Its boundary test
rejects filesystem, process, network, Git and source-adapter dependencies.

## Reading a page

- `parseSourceConfig(text, context?)` validates the shared repository and tracking
  branch. `parsePageConfig(pageId, text, context)` validates the page fields. The
  caller supplies `manuals` and `betaValues`; core never imports the registry or UI.
  `FALSE` (including the YAML boolean spelling) means no tag; `BYOC` is rejected.
  `transforms` must be a list, but its entries are opaque until WP10.
- `parseLock(text, context?)` validates the format and complete lowercase SHA-1
  values. Missing generation locks, malformed YAML and reserved Phase 1 `none`
  fail. `planLock({ existing, trackedHead, fromFork }, context?)` preserves an
  existing valid lock or plans both channels at the supplied tracking head. It
  rejects creating a lock for a fork PR and never writes a file or commit.
- `GitMilvusDocsReader(checkout)` reads regular files from committed objects and
  checks ancestry. Branch arguments are local branch names such as `v3.0.x`.
  The caller must supply the checkout and complete local history; this adapter
  never fetches, changes refs, or changes the working tree. Missing commits,
  branches, files, invalid arguments, and Git failures have distinct error codes.
  Incomplete (shallow) history is an infrastructure failure, not false ancestry.
- `readPageSources(input, reader)` combines the parsers, branch/ancestry checks,
  and exact source reads for both channels. It collects page diagnostics with
  file, one-based line, page and channel, returning no partial Markdown on failure.
  Missing branches and operational failures propagate as reader errors so a
  caller cannot mistake an unavailable checkout for bad page content.

WP3b will add block inventories, preprocessing, and `shared-docs inspect`.
Until then, run the valid Delete Entities reads and configuration/lock error examples:

```sh
pnpm vitest run packages/docs-tooling/src/shared-docs/testing/read-page.test.ts
```

## Requirements

`spec/requirements.json` is copied byte-for-byte from the design repository.
Its `source.prd_commit` identifies the design revision. `pending.json` lists
requirements whose assigned work package has not yet supplied coverage.
Ownership uses behaviour and acceptance IDs and error `area_id` values, never display labels or
descriptions. Ownership follows guide 2.1; work packages follow section 4.
For requirements spanning packages,
T06 is assigned to WP5 (with WP4), T08/T10 to WP15, and T12 to WP8 for its
candidate journey. The owner-approved WP8 ledger closes T12 on the candidate
boundary tested here: lock-only commit, exact pushed SHA, explicit validation
dispatch and authenticated child result. This does not claim the complete
publication/adoption/recovery journey; those stages remain later work packages.
`MERGE_NESTED_CHANNEL` belongs to WP11 and `RECOVER_INPUT_MISSING` to WP15.
Other spanning entries stay pending until their assigned coverage is complete.
WP8 also closes 3-2 (initial NEXT snapshot) and 3-3 (every changed shared-input
PR generates all pages). Requirement 3-6 remains assigned to WP14.

Put IDs in literal `it`/`test` titles in `*.test.ts` or `*.test.tsx` under this
directory, e.g. `it('[4-3][LINE_NOT_FOUND] ...', ...)`. Multiple IDs and literal
titles on `test.each` are supported. Comments, assertion strings and canned
error responses do not count. Skipped/todo/conditional tests cannot close a
gap. Helpers with generated titles must have a literal tagged test in the
calling test file; interpolation is not a coverage declaration. Unknown IDs,
unowned pending IDs, missing entries and already-covered pending IDs fail.

## Fixtures and helpers

- `fixtures/pilots/SOURCE.md` pins all three originals and their SHA-256 sums.
  Upstream trailing whitespace is preserved; fixture-local `.gitattributes`
  exempts only imported Markdown from end-of-line/end-of-file whitespace checks.
  These are unaligned development inputs, not approved golden output. Each
  pilot has an isolated copy of the global variables and link-map examples.
  All three pages reuse whole sources; no transforms or Tabs rules are added.
  Delete Entities follows PRD scenario 3; other output paths follow the
  existing English Guides sidebars at the WP0 base commit.
- `buildMilvusDocs('01-base' | '02-paragraph')` overlays snapshots into a
  temporary Git repository with fixed commit metadata. It returns real commit
  IDs; callers must remove the returned directory. Only the first two fixture
  commits exist. The fragment and Variables.json are synthetic; pilot originals
  are unmodified. `02-paragraph` changes prose and adds a parameter explanation.
- `expectGolden(relativePath, actual)` compares text with Vitest's diff. Local
  `UPDATE_GOLDEN=1` writes it; a set CI flag prevents updates. Helper self-tests
  use `goldenAt(temporaryDirectory)` so the real golden directory stays empty.
- `loadErrorCases(root)` reads directories containing `input/` and an array of
  errors in `expected.json`. Use `expectErrorCase(fixture, run)` to compare each
  result (including count and source location). WP3a uses `fixtures/read-errors/`
  and `fixtures/lock-planning-errors/`. Business test titles must explicitly
  declare their IDs as above. The original `fixtures/errors/example/` tests
  the runner with a canned response; it is not a configuration validator.
- `adapters/contract/suites.ts` exports factories for all five interfaces.
  Both fake and real Git reader contracts run on every invocation against
  deterministic local repositories. Other real providers remain L3/L4 work. Md2md's
  signatures follow design 03; the substitute returns configured results and
  does not parse blocks or expand variables. Provider semantic cases arrive
  with WP1/WP2 and the pinned md2md release.
- `fixtures/guides-base.json` is a synthetic normalized snapshot with the six
  fields requested in the plan review. It exercises CURRENT/NEXT/RETIRE-IN-NEXT
  records. The production snapshot on the WP0 base does not yet expose all
  those normalized fields; production adaptation is left to WP8.

## Group directories and local commands

Each group owns its `source.yaml`, `Variables.json`, `links.yaml`,
`product-names.yaml`, `presentation/`, and `pages/<page>/` below
`shared-docs/guides/`. All four commands require `--shared-docs` to select
that group directory. The directory basename must be `guides`; other names,
including the old flat `shared-docs` root, fail with `CONFIG_FIELD_MISSING`
before any input/output or Git access. `lock --from-fork` always reports
`LOCK_FORK_PR` first.

Custom parents such as `inputs/guides` and absolute group paths are supported.
Diagnostics use the selected directory's path relative to the repository root
(the CLI working directory) when it is inside that root, and its absolute path
otherwise. Source Markdown and fragment diagnostics keep
their upstream `site/en/...` paths.

```sh
pnpm docs-tooling shared-docs inspect --shared-docs shared-docs/guides --page delete-entities --repo /path/to/milvus-docs
pnpm docs-tooling shared-docs links-seed --shared-docs shared-docs/guides --repo /path/to/milvus-docs --dev /path/to/zdoc-dev --out /tmp/candidate-links.yaml
pnpm docs-tooling shared-docs build --shared-docs shared-docs/guides --repo /path/to/milvus-docs --dev /path/to/zdoc-dev --out /tmp/shared-docs-build
```

`inspect` selects the group with `--shared-docs` instead of `--pages`.
`links-seed` reads the selected group's `source.yaml` unless `--commit` supplies
an exact source commit; the group option is required in both cases. With
`--commit`, the group directory does not need to exist yet, so the initial link
map can be seeded before the first page creates `shared-docs/guides/`. Its
candidate output must be outside both input checkouts, the selected group,
and the repository-root `shared-docs/` tree. Build output remains an empty or
absent directory outside all inputs.

## Initial locks and PR validation (WP8b)

Create missing initial source locks with a complete local Milvus checkout:

```sh
pnpm docs-tooling shared-docs lock --shared-docs shared-docs/guides --repo /path/to/milvus-docs
```

The command validates page/source configuration before writing. Every new
`shared-docs/guides/pages/<page>/lock.yaml` pins both `current` and `next` to the
tracking branch head; existing lock bytes, including invalid locks, are
preserved. `--page <id>` selects one page; `--from-fork` rejects onboarding
without writes. Exit codes are 0 for success, 1 for input/configuration errors,
and 2 for operational Git/filesystem failures. Lock files created outside CI
are still checked by all-page generation.

`shared-docs-lock.yml` handles changes under `shared-docs/*/pages/**` in PRs
targeting `master`. Its writer runs only for PRs from a branch in the same
repository. A fork receives an Actions warning and summary: `LOCK_FORK_PR:
Please submit this onboarding PR from a branch in this repository`. It
performs no fork checkout or write.
The writer rejects unsupported or ungrouped changed inputs as content failures
before cloning source history. Only `guides` is supported. It parses
`shared-docs/guides/source.yaml`, restricts the source URL
to credential-free GitHub HTTPS, and clones only the tracking branch with its
complete history. It passes `shared-docs/guides` to the lock command, creates
missing locks, and stages only new regular files matching
`shared-docs/guides/pages/<page-id>/lock.yaml`. It
rechecks the expected PR head with `git ls-remote`, and performs an ordinary
fast-forward push. Branch drift or a failed query stops the writer. A no-op
creates no commit, push or child dispatch. Lock jobs use a separate per-PR
concurrency group without cancelling an active writer.

After an actual push, the writer explicitly dispatches
`shared-docs-validate.yml` on the PR branch, passes the new complete SHA and
comparison base, and discovers the child using the branch, dispatch event,
exact SHA and unique `lock-<run-id>-<attempt>` request ID. It records the pushed
SHA and child run URL in its summary, waits for the child, and propagates its
failure. Dispatched validation runs the PR head's copy of
`shared-docs-validate.yml`, which relies on same-repository branches being
limited to people with write access. This dispatch is necessary because
pushes using `GITHUB_TOKEN` do not trigger another ordinary PR workflow.
GitHub may reject dispatch until the validation workflow has been registered
on the default branch; that rejection
is an operational failure with its original CLI error retained. Installing
this change through a reviewed master PR is the prerequisite for the first
complete onboarding demonstration; changing fork defaults or settings is not
part of this workflow.

`shared-docs-validate.yml` always creates the stable `shared-docs-validate`
check for a PR targeting `master`. It has no trigger path filter, uses
read-only permissions and no secrets, and checks out the exact PR head without
persisted credentials.
A fail-closed merge-base comparison and NUL-delimited, no-renames diff cover
added, modified, renamed and deleted `shared-docs/` inputs. With no changed
shared inputs, it succeeds before installing packages or reading external
sources. Otherwise it deduplicates affected groups from both rename sides and
deletions, and rejects unsupported groups or directly ungrouped files before
installation or external reads. Only `guides` is supported. It reads
`shared-docs/guides/source.yaml`, clones complete single-branch source history, resolves
an exact upstream `zilliztech/zdoc` dev SHA, sparsely checks out only English
Guides/BYOC and the Guides snapshot, and runs `shared-docs build` for every page
in each affected group with `--shared-docs shared-docs/<group>` and a separate
`$RUNNER_TEMP/shared-docs-output/<group>` directory. It never filters to only
changed pages.
Generation diagnostics retain file/line locations in logs and in a bounded
job summary. It generates a temporary candidate; it does not publish pages.
Maintainers must configure the stable check as required in branch protection;
the repository workflows do not change that setting. Both PR triggers are
limited to `master`; explicit validation dispatch remains available on the
requested branch.

For an explicit validation run, dispatch on the branch whose head equals
`source_sha` (SHA identities must be complete lowercase SHA-1 values):

```sh
gh workflow run shared-docs-validate.yml --repo OWNER/zdoc --ref PR_BRANCH \
  -f pr_number=123 -f source_sha=FULL_PR_HEAD_SHA -f base_sha=FULL_PR_BASE_SHA \
  -f request_id=manual-review-123
```

`request_id` is optional for manual callers. Validation uses a separate
concurrency group per PR and event, with cancellation enabled within each
group so a PR event cannot cancel a watched dispatch. Dispatch rejects a branch
that moved away from `source_sha`, so the check always binds to the actual
validated head. A later lock run can safely retry after branch drift is resolved.

Content errors and failed child validation fail the check without Feishu
notification. Operational lock/clone/push/dispatch failures, including a
cancelled validation child, select a separate read-only reporting job checked
out from the trusted PR base SHA. Only its best-effort card create/note/finish
steps receive Feishu credentials; each
honors `FEISHU_NOTIFICATIONS_DISABLED`. No reporting internals or production
publication workflows are changed.

Run the offline workflow regression and policy checks with:

```sh
pnpm vitest run packages/docs-tooling/src/shared-docs/testing/workflows.test.ts
pnpm test:workflow-policy
pnpm test:workflow-matrix
```

The workflow tests execute their actual shell blocks with local temporary Git
repositories and stub GitHub/package-manager commands. They cover the WP8
candidate boundary, not live GitHub dispatch registration, branch-protection
configuration or the later publish/recover journey.
