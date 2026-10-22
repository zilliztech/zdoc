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
Its `source.prd_commit` identifies the design revision. WP3a covers 14 IDs;
111 zdoc-owned IDs remain in `pending.json`, including the three WP3b IDs.
Ownership uses behaviour and acceptance IDs and error `area_id` values, never display labels or
descriptions. Ownership follows guide 2.1; work packages follow section 4.
For requirements spanning packages,
T06 is assigned to WP5 (with WP4), T08/T10 to WP15, and T12 to WP8 for its
candidate journey. `MERGE_NESTED_CHANNEL` belongs to WP11 and
`RECOVER_INPUT_MISSING` to WP15. These entries stay pending until the complete
requirement has tests, even when a package supplies partial coverage.

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
