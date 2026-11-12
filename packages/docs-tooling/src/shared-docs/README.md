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
  `transforms` validates the operation, target, content, position and channel fields described below.
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
WP11 closes 6-1 through 6-7, T13 and `MERGE_NESTED_CHANNEL` through literal
merge, build, runtime-rendering and isolated CLI tests. This covers local
generation and restoration; publication, promotion and recovery remain assigned
to their later work packages. `RECOVER_INPUT_MISSING` belongs to WP15.
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

## Cloud content transforms

`shared-docs build` applies optional `page.yaml` transforms to the marker-bearing
source after block inventory, before removing markers and preprocessing the whole
page. Both channel plans must validate before any edits are applied. Every target
refers to the original source; a rule cannot transform another rule's inserted
content. `shared-docs inspect` remains source-only and does not apply transforms.

```yaml
transforms:
  - operation: replace
    target: {block: introduction}
    content: {file: cloud-introduction.md}
  - operation: add
    target: {block: connect, language: shell}
    content: {file: cloud-cli.md}
  - operation: replace
    target:
      block: connect
      language: python
      lines: |
        connect("localhost:19530")
    content:
      lines: |
        connect("{{var.cloud.endpoint}}")
```

Use `add`, `replace` or `remove` at the block, language or code-line level.
Block and code-line additions require `position: before` or `after`; language
additions append a fence, and WP4 orders and labels the resulting Tabs from the
fences rather than the old switcher text. Languages are added only by explicit
rules. Aliases from `presentation/cloud-sdk-tabs.yaml` normalize selectors and
fence names. Duplicate canonical languages fail at the second fence. Removing the
last language fails with `TRANSFORM_TARGET_KIND`; remove the whole block instead.
WP4 still checks required languages for multilingual groups and chooses the first
available language when the configured default is absent.

Block-level additions stay separate Markdown blocks: each boundary against
nonblank content has exactly one blank line, including between additions at the
same boundary. Existing edge blanks are reused, and filtering cannot leave double
separators. Internal content spacing and code-line additions remain unchanged.

Block/language content comes from a regular file in the page directory. A
language file contains exactly one fence of that language; replacing a code group
requires a complete group, including its switcher when multilingual. File paths
cannot escape the page directory, including through symlinks. Content files
cannot contain named-block markers, authored import statements, local images, or
components the generator cannot import. Registered components are allowed and
their imports are emitted once into the generated page: `Tabs`, `TabItem` and
`Admonition` (from `@theme/*`) plus Cloud-only `Supademo` (from
`@site/src/components/Supademo`). Do not write the import line yourself; the
generator injects it. Unknown components, named markers and page-directory
images fail with `TRANSFORM_CONTENT_MARKUP` at their content-file line. Milvus
alerts go through the existing site adapter. External image URLs go through the
existing image stage.

Code-line selectors contain one to five consecutive, nonblank lines inside the
chosen fence. Matching ignores leading/trailing indentation only, preserving
internal spacing and comments. Missing or multiple matches fail. Inline
`content.lines` shares the selected line's original indentation and preserves its
own relative indentation, including Tabs. One YAML scalar terminal newline is
removed; extra blank lines and fence/marker syntax fail. Remove accepts no
content. Repeated block-adjacent additions and additions around the same line
anchor preserve list order. Duplicate language additions, duplicate consuming
rules, intersecting selections and parent/child edits fail with
`TRANSFORM_CONFLICT`.

Optional `channel: current` or `channel: next` selects that channel and must refer
to a channel where the page exists. Unqualified rules apply to both channels;
conflicts are checked separately for each. Adapted current and next bodies are
merged according to the two-version rules below, even when equal source locks
produce different output because of a channel-specific transform.

Inserted content uses the Cloud variables, fragment expansion, links, Tabs and
product-name checks. Standalone `<include target="paas">` / `</include>` and
`<exclude target="saas">` / `</exclude>` tags support properly nested regions.
Targets are individual tokens in Guides `zilliz.saas` or BYOC `zilliz.paas`;
dotted full-target tags are rejected. Filtering applies only to inserted content.

Diagnostics retain an origin for each line through edits, marker removal and
product filtering. Content-file errors point to that file; inline-content errors
point to the YAML scalar item. The normal md2md call owns validation, dependencies
and limits. A second call to the same public engine carries origin boundaries
through expansion, and its decoded bytes must equal the normal result. No
variable/fragment expansion grammar is reimplemented. Expanded fragment lines
retain their inclusion-site origin; exact locations inside multiline expansions
remain a follow-up requiring an md2md output source map.

An internal carrier/decode/byte-equality error fails the selected page through
the existing build-command catch. Fetch builds each selected page independently;
its source job retains that page's current dev bytes and receipt while continuing
other pages. Fault-injection tests exercise the real source generator and bundle
validation against a locally retained successful publication.

The OpenAI assertion fixture copies the retained Python source with only named
markers added. Its separately labeled synthetic multi-language examples cover
Java, C++ aliases and selector failures; real multi-language evidence awaits C3
content alignment. These fixtures do not establish new golden outputs.

Run the isolated CLI demonstration from the repository root:

```sh
node -e 'const path = require("node:path"); const {loadTypeScript} = require("./scripts/lib/load-typescript"); loadTypeScript(path.resolve("packages/docs-tooling/src/shared-docs/testing/transforms/demo.ts")).runTransformDemo(path.resolve("tmp/wp10-demo")).then(result => console.log(JSON.stringify(result, null, 2)))'
```

Use a fresh destination directory each time. The demo builds a synthetic page
with an introduction-block replacement and a Python code-line replacement in
both manuals. It then deliberately changes the selector to `stale_selector()`;
the second CLI invocation must report `LINE_NOT_FOUND` and create no failed output
directory. Everything uses local fixture repositories and scratch output.


## Two-version generation (WP11)

Each channel reads its exact lock and validates its transform plan independently.
Markers are removed and each complete channel is preprocessed before adaptation:
Cloud variables, fragments, product filtering for inserted content, links, images,
alerts and SDK Tabs use their existing adapters. Merging never preprocesses partial
changed regions. MDX patching, compilation and the product-name check run on the
merged result once per manual. Channel origins survive diagnostics.

Equal adapted channel bytes use the unchanged output path, regardless of lock SHA.
Equality is decided before final MDX patches; two bodies that become equal only
through patching can still emit a pair. For unequal bodies, common complete blocks
are emitted once; maximal changed runs use `NextChannel action="exclude"` for
current and `action="include"` for next. Lists, tables, fences, alerts and Tabs
remain indivisible. Restoring either view preserves its standalone body blocks
and their order; only parser-owned empty inter-block separators may differ.
Current front matter is retained separately, and the required theme imports form
one canonical union outside every gate. Metadata differences produce one
`MERGE_FRONT_MATTER_CURRENT` note per manual with sorted field names.

NEXT pages emit only the next body; RETIRE-IN-NEXT pages emit only current. Both
plans still validate, and the existing Fetch page/sidebar metadata remains intact.
These whole-page channels are tested through Fetch's context seam; standalone
CLI channel propagation is outside this checkpoint.

Authored gates and all supported code-comment channel directives are compatibility
syntax: unchanged blocks preserve their bytes and their existing deployment
semantics. They are never interpreted for alignment or generated as authoring
instructions. A changed block containing an authored gate fails with
`MERGE_NESTED_CHANNEL`; use a channel transform or change the source structure.
A generated paired region containing fenced literal `<NextChannel` text fails
closed with `ADAPT_UNSUPPORTED_MARKUP` at that source line because the unchanged
Fetch lint scans literal tags inside fences. The same conservative guard also
covers other literal channel-tag spellings in a paired region. Unclosed fences,
ambiguous markup and incompatible global reference bindings fail closed as well.
The unchanged static CURRENT resolver scans fixed triple backtick/tilde segments,
so even valid long fences can hide generated gates when a literal shorter marker
inside one fence shifts that scan into a later block. The complete assembled page
is checked, including common blocks and both generated opening and closing tags.
A hidden boundary fails with `ADAPT_UNSUPPORTED_MARKUP` at the original marker
that starts the unsafe resolver segment; rewrite the fence example using
indentation or different markers, or use a channel transform. Ordinary fences
whose scan leaves all generated boundaries visible remain supported. Equal-input
and whole-page output retain their existing paths without generated gates.

Explicit heading IDs remain global in MDX. A duplicate ID across retained blocks
fails with `ADAPT_UNSUPPORTED_MARKUP`, naming both origins and suggesting a
`channel` transform or heading change. No automatic suffix or link rewrite is
introduced. Implicit heading anchors continue to use the existing adapter's
rules; this does not promise a new cross-channel anchor namespace.

Run the isolated Delete Entities demonstration from the repository root:

```sh
node -e 'const path = require("node:path"); const {loadTypeScript} = require("./scripts/lib/load-typescript"); loadTypeScript(path.resolve("packages/docs-tooling/src/shared-docs/testing/merge/demo.ts")).runMergeDemo(path.resolve("tmp/wp11-demo")).then(result => console.log(JSON.stringify(result, null, 2)))'
```

Use a fresh destination directory. The demo commits the pinned original and a
clearly labeled synthetic next source into a local fixture repository, copies the
necessary group configuration, and creates minimal local dev navigation. It runs
the real `shared-docs build` CLI three times: one two-version build and two
independent equal-lock standalone builds. It needs no credentials, uploads, Base
writes or services. [Fixture provenance](fixtures/merge/delete-entities/SOURCE.md)
records the original commit and raw hash; pilot and golden files are unchanged.

For each of `guides` and `guides-byoc`, inspect these retained files:

- `tmp/wp11-demo/merged/<manual>/tutorials/delete-entities.mdx`
- `tmp/wp11-demo/views/current/<manual>/tutorials/delete-entities.mdx`
- `tmp/wp11-demo/views/next/<manual>/tutorials/delete-entities.mdx`
- `tmp/wp11-demo/standalone-current/<manual>/tutorials/delete-entities.mdx`
- `tmp/wp11-demo/standalone-next/<manual>/tutorials/delete-entities.mdx`

The current body contains `You can delete the entities that are no longer needed`
and the primary-key Python line `ids=[18, 19]`. Next instead contains
`Synthetic next: remove obsolete entities`, the added
`Synthetic next: the partition_name parameter limits deletion to the named partition.`
and `ids=[118, 119]`. Both expand `YOUR_CLUSTER_ENDPOINT`, resolve the filtering
link, and retain SDK Tabs. `evidence.json` records the exact local commits, CLI
arguments and summaries. The demo's projection helper is limited to its generated
gates; independent standalone builds provide the restoration expectations.
Runtime rendering tests compile each complete generated MDX body and use the real
NextChannel component with a mocked channel hook. Explicit theme substitutes for
Admonition, Tabs and TabItem exercise content and gate visibility, not Docusaurus
styling or browser hydration. The local demo does not cover later publication or
recovery journeys.

## Fixed-input impact analysis (internal)

The `core/updates` interfaces are internal version-1 JSON contracts. They analyze
fixed observations and render local JSON or Markdown; they do not publish, change
locks, rewrite links, or read lifecycle snapshots. `old-next-to-target` describes
source impact independently from `current-to-candidate-next` promotion evidence.
Every observation retains its source commit/repository/track, exact source and
local configuration digests, and the observed preprocessing engine. Build evidence
also records the exact current/next lock pair; no lock file is written.

`adapters/update-inputs.ts` exports `readUpdateConfiguration(directory,
repositoryRoot)` and `collectUpdateInputs({ versions, pages, reader, md2md,
build? })`. Read configuration through the existing shared-docs parser. Collection
copies caller inputs, reads exact source commits, and returns a deeply frozen
`UpdateInput`. Missing committed source files become located diagnostics; Git,
snapshot, or other infrastructure failures reject collection. Raw named blocks
and preprocessing dependencies are retained before transforms. When build evidence
is supplied, dependencies actually consumed by transforms are included too.
Unreferenced variables/fragments and irrelevant upstream commits do not create
source candidates; overwritten raw source changes remain candidates even when
Cloud output is equal.

Each page request supplies `pageId` and three `{ commit, configuration }` values:
`oldNext`, `current`, and `candidateNext`. `versions` supplies full `master` and
`dev` SHAs plus named tool versions. The optional build callback receives
`{ pageId, sharedDocs, observe }`; it must run the real `buildPage` with that
configuration and observer. The caller owns its runtime, pinned local dev inputs,
image policy and reader lifetime. For example, after creating those dependencies:

```ts
const configuration = await readUpdateConfiguration(groupDirectory, repositoryRoot)
if ('errors' in configuration) throw new Error(JSON.stringify(configuration.errors))
const fixed = await collectUpdateInputs({
  versions: { master: masterSha, dev: devSha, tools: { zdoc: toolSha, md2md: md2mdVersion } },
  reader, md2md,
  pages: [{ pageId,
    oldNext: { commit: oldNextSha, configuration },
    current: { commit: currentSha, configuration },
    candidateNext: { commit: targetSha, configuration },
  }],
  build: ({ pageId, sharedDocs, observe }) => buildPage({ pageId, sharedDocs, reader, md2md,
    runtime: createBuildRuntime({ sharedDocs, reader, fetcher, zdoc, guides }), observe }),
})
const report = analyzeUpdates(fixed)
const json = renderImpactJson(report)
const markdown = renderImpactMarkdown(report)
```

The report/render functions are exported by `core/updates/impact.ts`. Missing or
duplicate input identities fail validation. `outputChanged` compares independently
finalized complete per-channel MDX from the actual builder adapters; it is
`unknown` without complete successful build evidence. The optional `buildPage`
observer is detached from generation state and leaves the default result shape,
merged bytes, errors, image reads and command output transaction unchanged.
Observation additionally transports exact preprocessing boundaries through the
existing provenance carrier and finalizes complete channel bodies with `toMdx`.
An observer exception cannot change generation; unavailable observation evidence
is reported conservatively. Existing publication bundle fields are unchanged.

`observeManualAnchors` uses the existing heading/reference parsers and Cloud
slug/suffix rules per manual. It exposes raw file spans only when the original
source parser verifies the attribution; expanded fragment origins are never
invented. A rename is confirmed only for a unique stable named block with
unchanged nonempty context. Repeated, ambiguous, deleted or filtered headings
remain advisory. `promotionEligibility` permits differing source SHAs or actual
channel-qualified transform rules. Authored `NextChannel` markup alone does not
qualify an equal-SHA promotion.

`computeUpdateUnits` closes evidenced anchor-adoption dependencies and optional
existing unit membership. Reports derive dependencies only from actual candidate
references to confirmed renamed target anchors on the promotion axis. Explicit
additional evidence must match those fixed observations. Destination paths and
full page/manual/path identities are validated. Both publish manuals of one
shared page stay together because they share a lock; a shared fragment alone
never couples different pages. There is no PR transaction API in this slice.

The opt-in synthetic update history and its provenance are under
[`fixtures/updates`](fixtures/updates/SOURCE.md). The default fixture's three
legacy commit IDs remain unchanged through `10-image-changed`.

Raw preprocessing diagnostics are retained in each observation's `rawErrors` and
separately in each page report. Dependencies have `state: resolved | unresolved`;
a missing raw variable is `unresolved` with `sha256: null`, never a fabricated hash
or an infrastructure exception. Changes include explicit `beforeState`/`afterState`
(`absent`, `unresolved`, or `resolved`). Raw diagnostics do not invalidate successful
Cloud generation when a transform removes the offending content. Actual builder
failures remain in `errors` and keep `outputChanged: unknown`. Infrastructure failures
still reject collection. Raw source diagnostics map stripped marker lines back to
the actual source file; fragment attribution retains its existing inclusion-site
limitations.

Image evidence concerns actual emitted channel uses. `images` retains each original
reference, preparation `origin`, observed byte digest/length, emitted record digest
and address, and per-manual/channel uses. Repository origins are the exact commit/path
from actual preparation `readBytes` calls, correlated with the preparer's ordered
successful results; paths are not reconstructed from source-relative guesses.
External origins record the URI and `policy: paired-read`: the existing injected
image fetcher supplied the stable byte pair, potentially replayed from the runtime
cache. This does not claim a separate HTTP request for each manual/channel or pin the
external URI for future runs. No additional fetch, repository image read or upload is
performed for observation. Observed bytes and the emitted retained record remain
separate when the existing policy selects an older accepted digest.

Only references that survive adaptation and complete channel finalization count as
emitted image uses. Raw hidden image bytes are not fetched for impact analysis.
`imageStatus: observed | unavailable` describes completeness of emitted-use evidence;
`origin.kind: unavailable` separately marks a missing preparation trace, and
`observed: null` never claims authenticated raw bytes. Raw source spans on image uses
are supplied only when the original parser verifies their attribution. Image changes
include before/after evidence in JSON and readable origin/digest/use details in
Markdown. Their dependency identity excludes the observation commit, so identical
image bytes at an unrelated source commit do not create a candidate. Without build
evidence, images remain unavailable; absence is not treated as a proven image deletion.

### Read-only upstream reports (WP12-B1)

`shared-docs update` resolves committed master/dev/source inputs and reuses
`collectUpdateInputs`, the build observer and `analyzeUpdates`. It writes only
four new report files. `core/updates/discovery.ts` separates proposed forward
next deltas from configuration-only changes and lifecycle eligibility;
`core/updates/lifecycle.ts` classifies positive observations with an explicit
36-hour age / five-minute future-skew policy. Neither core module performs I/O.

The Git adapter reads local objects and exports regular committed blobs to a
private temporary directory. It never fetches or changes input refs. The
GitHub adapter exposes only bounded GET reads and artifact downloads. The
lifecycle adapter binds repository/run/attempt/job/step/artifact identity,
verifies ZIP digest and preflights ZIP/tar members, then uses existing stage
and raw-snapshot validators. Python 3 standard library is required to preflight
and extract an optional retained source artifact. No extraction follows links.

For a single selected Guides page, the reader can verify that a scheduled
Fetch read the canonical Base record during its source step. It matches the
record to the generated outputs, the same attempt's English Guides publication
result, and the receipt and output bytes on the pinned dev commit. It checks
for a newer Guides observation and a changed dev tip before returning the
page's lifecycle state. The report records the run, artifact and Git identities
used for that decision.

The English shared source scan checks distinct IDs, totals and pagination for
all Base tables and their unfiltered records. The verifier authenticates every
entry in the Fetch producer's Git tree. A new tree requires review and a new
fingerprint in `adapters/updates/reviewed-fetch-tree.json`. The fingerprint
uses `git ls-tree -r -t -z --full-tree <producer>` and
`producerInventoryDigest`; the verifier checks the policy blob itself against
its trusted local copy. Commits that share the same tree qualify.

One earlier scan has an independent membership census. For
`json-field-overview` on scheduled run 42944655729, attempt 1, the authenticated
Base scan read all nine tables, enumerated 497 distinct record IDs, checked each
table's revision before and after the scan, and matched the selected record.
The verifier binds this evidence to the precise producer, source archive,
page and record. It recomputes the census from the archive by hashing the
newline-joined sorted IDs of each table, then hashing the JSON array of
`[table ID, count, hash]` tuples sorted by table ID. The latest-observation,
maximum age and publication checks also apply to this historical scan.

Other pages require their own observations. Incomplete or conflicting evidence
keeps the page on hold. A missing record cannot establish deletion. All
configured pages remain in the inventory, including unselected pages and pages
without retained/dev mapping. Analysis availability and lifecycle eligibility
are reported separately. Full 7-9 and all requirement pending IDs remain intact.

`reportUpdates(options, repositoryRoot, dependencies)` and `runUpdate` accept
internal test dependencies for GET-only API/image readers and an explicitly
marked `{kind: 'offline-replay', now}` clock. The public CLI has no clock or
provenance override. Offline replay outputs are labeled. An optional comparison master affects only the configuration-change envelope;
source/output endpoint comparisons hold the current master configuration fixed.
No writer API,
persistent update manifest, workflow dispatch or PR transaction exists in B1.
See the repository README for options, output protection and exit semantics.

The report command inventories committed page directories before parsing page
configuration. Invalid page YAML or missing replacement content remains visible
as a page-level content failure; independently buildable pages continue, even
when selected with `--pages`. Group configuration diagnostics are reported in
`configurationErrors`, separately from Git/API `infrastructureErrors`. A complete
content-failure report returns 0; an infrastructure failure returns 1. The
normal build and publication parsers remain strict and unchanged.

If any page configuration is invalid, its public-ID mapping cannot be trusted.
The report adapter therefore marks generated page-link observations with
`UPDATE_CONFIGURATION_DEPENDENCY_UNAVAILABLE`, including the invalid page IDs,
instead of allowing missing shared mappings to fall through to Cloud/link-map
resolution. Pages without such cross-page links can still be analyzed. This
conservative limitation applies only to reports with invalid configuration.

Output protection resolves each participating repository's actual Git directory
and common directory, covering bare repositories, separate Git directories and
linked worktrees. Metadata overlap is rejected with exit 2 before writes;
disjoint `.claude/` report destinations remain supported.

### Local update commands

`shared-docs update-plan` and `shared-docs update-prepare` are thin command
adapters over `createLocalUpdateRunner`. Their strict options reject unknown,
duplicate and missing flags. Only prepare accepts `--resume`. They use a
separate pre-dotenv dispatch path; legacy `shared-docs update` keeps its parser,
report detail serialization, four filenames and empty operations unchanged.

The request file is bounded to 1 MiB and parsed by `parseLocalUpdateRequest`:

```ts
{
  kind: 'shared-update-local-request'; schemaVersion: 1;
  repository: string; devRepository: string; sourceRepository: string;
  master: string; dev: string; sourceTarget: string;
  comparisonConfig: string | null;
  subjects: (
    | {kind: 'guides-page'; group: 'guides'; pageId: string}
    | {kind: 'sdk-manual'; group: string; manualId: string}
  )[];
  existing: null | {head: string; donorHeads: string[]; localEvidence: string[]};
  lifecycle: null | {runId: number; archive: string | null};
}
```

Use canonical absolute paths and exact lowercase SHA-1 commits. The current
schema permits 1–64 unique complete subjects, up to 8 distinct donors and 256
prior local evidence roots. Unknown and duplicate JSON keys are errors. There
is no page subset within a manual, public provider module, authority override,
clock, writer or trusted-toolset argument. `existing.localEvidence` names owned
local outputs whose journals, objects and proofs are independently verified;
copied evidence never supplies fresh remote identity or access authority.

For a single Guides page with a retained Fetch run, set `GH_TOKEN` on the
command to give the coordinator Actions read access to `zilliztech/zdoc`.
The coordinator can download the two archives or use local copies. To supply
both locally, set `lifecycle.archive` to the source ZIP and put
`publication-results-fetch-<runId>-<attempt>.zip` beside it. Both archives
must match their GitHub identities, sizes and SHA-256 digests.

With a token, the coordinator reads the selected run, its jobs and artifacts,
both Guides workflow histories and the current dev tip. The worker receives
the response bodies over private pipes and checks them against the archives
and pinned Git objects. The token stays in the coordinator. Each collection
reads live metadata, including the checks before candidate creation and
installation. Without a token, a worker with both local archives can read
public metadata directly, subject to GitHub's anonymous rate limit.

The implementation root is derived from the executing command module. Canonical
cwd must match it. Bootstrap reads bounded, no-follow files to resolve HEAD in
ordinary or linked-worktree SHA-1 files-backend checkouts, including loose and
packed branch refs. Unborn, malformed, cyclic, unsafe or unsupported metadata
fails closed. The independently observed commit goes to `captureTrustedToolset`;
HEAD is rechecked afterward. The request's master is never a fallback. Current
launcher/access policy still governs the actual Node/Git/helpers/dependencies
and fixed Guides worker. `GH_TOKEN` is a separate secret input, never semantic
material. Host/access observations remain private evidence.

Owned outputs contain normalized `request.json`, `pins.json`, `snapshot.json`,
`reports/<hash>.json`, `units/<hash>.json`, referenced `blobs/<sha256>`,
`result.json` and `scratch.git/`. Subject/unit identities live inside the JSON,
not arbitrary filenames. Prepare adds `journal.json` and, only after validated
candidate creation, `proof.json`. `LocalRunResult` carries status, selected unit,
disposition, plan digest, candidate, reasons, validation/proof references and
`operations: []`. A pre-ownership `LocalTransactionHold` is emitted only to
stdout, with null candidate/proof/pins-dependent fields; no output is invented
by the command's exception handler. Only `LocalInputError` maps to exit 2 and
only explicit transaction holds map to completed exit 0; other failures exit 1.

`LocalCommandDependencies` is an internal library seam for tests. Production
always uses the fixed factory and registry; no CLI option selects dependencies.
Command tests exercise the actual local runner with isolated Git fixtures,
including next-only candidates, stale plans, output protection and resume.
Those synthetic fixtures do not establish measured production-worker or SDK
integration qualification. Operator commands and recovery rules are in the
repository README.

### Remote update library (not activated)

`createRemoteUpdateRunner({capture, reads, policy, writerCapability?,
transactionEvidence?})` is an internal library entry. There is no public remote
write command or workflow installation. Capture still comes from
`captureTrustedToolset`, including its Linux refusal. Requests cannot install a
runtime, provider, trusted flag or writer. The executable fixture seams establish
test behavior only; they do not qualify a production runner.

`observe(request, preparationRoot, inspectionRoot)` accepts a strict local input
pin record plus producer run/attempt/request identity and a validation request
identity. Those identities are claims, not producer attestations. Observation
rechecks repository identity, current master/dev, authenticated namespace PRs and
exact refs. It returns `held`, `noop` or `planned`, always with `operations: []`.
A planned intent derives its repository from policy and its plan, proof, P/K and
refs from authenticated observations; callers cannot override an intent or proof.

P is the ordinary prepared merge base, K is a deterministic next-only candidate,
and S is the independently authenticated remote seal. Remote history capabilities
are bound to the exact read adapter, policy and current M/H/donor set. Historical
S may attest an older M. Its raw objects, producer bundle and historical proof
remain historical evidence; the bridge prepares a new P, recollects under today's
captured M, and creates a fresh K/proof. The old K is `previousBotCommit`; the old
S is an ordinary ancestor of P and becomes `previousSeal` only in the next intent
and seal. Separate `remote-origin` evidence never impersonates an owned B2 local
journal. `existing.localEvidence` continues to accept only verified owned local
journals. Human data/configuration changes are preserved, while execution changes
and `BOTH_SIDES_LOCK_CHANGED` stop preparation. A noop creates neither K nor S nor
a PR. Draft failures cannot produce ready or donor-close proposals here.

For a new PR that advances one Guides page, the receiver can reuse its verified
master history. The transfer planner compares the raw Git trees from the root
down to the lock file. At each level, all bytes outside the selected entry's
object ID must match. It checks the lock edit against the plan and proof, then
returns the new blob, its enclosing trees and the candidate commit in dependency
order. The receiving adapter must establish baseline identity and connectivity
before relying on inherited objects.

For a Draft PR on an isolated base, the trusted workflow can run
`adapters/updates/exact-guides-report.mjs` with a JSON document on stdin.
The workflow authenticates the original producer and retained proof, reads
the PR and both Git refs, and supplies the pinned target separately from its
observations. It passes the before and after blobs and the complete, unfiltered
NUL-delimited raw Git diff as base64. The reader checks the single parent,
path, modes, blob identities and proof digest and writes a JSON report for the
observed head. The caller must check the live target again before publishing
that report. This evidence covers the single lock update. Production
exact-validation receipts also require a signed seal and a target check.

For the signed Draft qualification, `adapters/updates/sealed-guides-check.mjs`
links that archived report to a signed, single-parent commit with the same tree
as the candidate. The trusted caller supplies the expected seal message and
independently authenticates the producer, report bytes, current refs and
GitHub API responses. Stage verification checks the private staging ref
while the PR still points at the candidate. After the PR advances, the reader
verifies the seal at its head. It then matches the reserved check ID, app,
suite, target SHA, request identifier and validator run URL. The final
readback requires that same check to have completed successfully. The reader
only consumes JSON on stdin and writes verified observations on stdout.

The private formal-contract qualification uses `adapters/updates/formal-validation.ts`
to encode the existing `Shared-Update-Seal: v1` message, verify its Git
signature and produce canonical producer and validator receipts. The canonical
seal message ends with LF. GitHub's `createCommitOnBranch` takes a headline and
a body and stores the message without that LF. Readers authenticate the exact
raw commit, OID and signed payload before accepting either spelling. Both
forms must otherwise match the re-encoded v1 message byte for byte.

The private plan projects one real Guides page onto an isolated master and source snapshot.
Its domain-separated plan digest enters the seal. The validator compares the
plan's master, dev and observed source tip with freshly read refs, the receipt
and the hashed output. The source tip can differ from the lock target.
A changed input yields a hold carrying the expected and observed SHAs.

Before publishing success, the trusted caller authenticates the completed
producer and validator artifacts and inspects the reserved Check on the signed
head. A matching in-progress Check yields `ready-to-publish`. After updating
it, the caller reads the refs and Check again. Only a completed, successful
Check can yield `accepted`. Both decisions use the product's exact-validation
rules. The caller obtains fresh observations before each remote write and owns
the network credentials. This stdin reader performs no writes to GitHub.

Preparation and inspection use new, disjoint evidence roots. Persistent transaction
attempt evidence is constructor-bound and separate; selecting a fresh preparation
root cannot clear an earlier dispatch-attempt veto. `apply` remains report-only
with `WRITER_DISABLED`, regardless of capability-shaped input. Unclassified write
outcomes in the underlying transaction stop later mutations and permit read-only
reconciliation only. A new invocation must authenticate fresh facts; journal
phase never authorizes work.

`reconcile(retainedIntent)` treats the retained intent as a claim and reconstructs
remote state read-only. It preserves raw-object and exact-validation-receipt holds;
this unqualified production bridge cannot certify completion. Missing local output,
missing raw objects, unknown remote state, stale identity or missing exact receipt
must not become a new-PR fallback. Replanning an unchanged completed content state
produces no new candidate. Production activation, real runner/capture qualification,
trusted validation producer, external CAS/dispatch evidence and rollout policy
remain B4 work; local synthetic tests do not close those gaps.
