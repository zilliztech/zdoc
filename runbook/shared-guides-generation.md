# Selected shared Guides generation and evidence

How selected shared Guides pages are generated, published, and evidenced.
The runbook and section index live in [README.md](../README.md); the replay
evidence modes live in [replay-harnesses.md](replay-harnesses.md).

## Selected shared Guides source generation

English Fetch prepares shared-page routing against its pinned master configuration
and exact dev baseline before ordinary Feishu body reads. After source fetching,
`Generate selected shared Guides sources` builds exactly the nonempty target set selected by the Base record and page
configuration: Guides, BYOC, or both. These sets must match without duplicates;
paired pages still require both outputs together. Current Base navigation, publish targets and release channel
are checked before rendering; an existing `.md` or `.mdx` extension is retained,
and a new page uses `.mdx`. `IMAGE_BED_URL` must be a valid HTTPS image-bed base
when shared work is selected, including artifact-only skip mode; a missing or invalid
value fails Guides as an infrastructure error before generation or image services.
Confirm the repository variable is set before merge. Ordinary-only runs do not
require it. Unselected page configurations are not loaded by Fetch;
the default `shared-docs build` command still validates the whole group.

The source job writes its draft bundle to
`tmp/docs-tooling/en/shared-pages/guides/bundle.json`. It records actual pinned input
digests, output/receipt drafts and one success or baseline-fallback outcome per
page. Accepted image bytes remain in the source job's scratch directory for the
upload step beside media prefetch. That step validates and deduplicates accepted bytes,
reads existing objects, conditionally creates absent objects with `If-None-Match: *`,
and reads them back to verify SHA-256. It never overwrites, resets ACLs or deletes
shared objects. `media_upload_mode=skip` performs no storage calls and retains full
image-bed URLs. `PUBLISH_IMAGE_UPLOAD_FAILED` fails the source job through its
existing artifact gate, preventing new English Guides/BYOC publication from that
job. The existing translation-enabled reconciliation producer gate remains unchanged.

The source artifact binds the bounded bundle to master/dev SHAs, sizes and hashes,
including raw Base routing evidence, all selected successful outputs and exact historical
fallback bytes. Offline table jobs place prebuilt bytes and repeat writer path and
front-matter checks; they do not generate shared pages or upload images. Fallbacks
are restored within their existing table owner even when current traversal omits
the old record or path. Image bodies are excluded from source and table artifacts.
Final receipt/activation publication and successful cache promotion remain separate
publication gates; the draft bundle alone does not authorize them. Before a pilot,
the owner must verify real-bucket conditional-create support and retain lifecycle
evidence that `shared/` objects referenced by published or recoverable receipts
cannot expire or be deleted, including bucket-wide/noncurrent rules and external
cleanup jobs. The owner must also make an unauthenticated GET of
`IMAGE_BED_URL/shared/<key>` and verify that the downloaded body's SHA256 equals
the accepted object's digest. Use no credentials or signed URL for this check;
authenticated SDK readback verifies stored bytes but does not prove public read
access. Record the HTTP result and digest with the pilot evidence. These checks
gate the first image-bearing activation; a page without images can be activated
before them.

Shared-page links resolve both Markdown heading anchors and static IDs on authored
`<a id="...">` and `<details id="...">` elements. Heading fragments use the Cloud
heading slug; explicit IDs retain their case and are URL-encoded in links. Code,
comments and component props do not declare anchors. A projected-away anchor or
an ambiguous emitted ID fails validation rather than falling back to the page top.
For standalone compatibility anchors/disclosures, adaptation also retains the
lowercase Cloud heading URL when it is distinct and does not collide with an
existing heading or explicit ID.

When a heading moves or changes depth between CURRENT and NEXT, the adapter can
give the NEXT heading a unique rendering ID and retain its public ID as a nearby
HTML anchor. CURRENT headings stay unchanged. This applies only to one heading
per channel with no existing alias conflict; the merger still rejects duplicate
IDs within a channel, unsafe markup and other structural errors.

PR validation can also check a newly added Guides page before it has dev output.
The validation workflow makes a separate, explicitly labeled fixture for page
configs added by that PR whose targets and snapshot identity are all absent.
It requires equal initial source pins and adds temporary NEXT metadata, then
runs the same whole-group generator. Existing or partially present pages cannot
use this fixture. The real dev checkout stays read-only; these results do not
establish Base registration, navigation or activation.

On first activation, the job reads the old document at its current revision only
when a current body link or Base ref requires a heading anchor. Page-top-only
references do not require that read. It checks required anchors against every
selected manual; `ACTIVATE_CHECK_FAILED` retains the exact baseline outputs. Existing
active pages reuse their retained anchor map. A run with no shared records and no
active shared state creates no shared bundle and keeps the legacy source payload
unchanged.

To activate a page, switch its record's `Docs` to the page directory URL, wait
for a successful Fetch and confirm its entry in dev's
`generated/en/manifests/shared-pages/guides/active.json`, then retire the old
Feishu document. The old document must exist until that activation Fetch
succeeds; afterwards links are resolved from `active.json` alone, and a retired
document stops new block-ID links that the frozen anchor map cannot resolve.
Retiring the old document is a content-hygiene step, not a pipeline
requirement: once the record is activated, Fetch skips the old document's wiki
node and never refetches its blocks, so a legacy document left in the tree (or
already deleted) cannot block scheduled runs — its cached legacy body stays
frozen beside the shared source.

Activated entries retain every known `feishu_aliases` token, including a non-null
`feishu_token`. Recover additional aliases only from that entry, authenticated
same-record frozen legacy cache evidence, and snapshot history reachable from the
pinned dev commit. Cache hashes alone do not authorize aliases. Missing independent
proof or shallow history produces an informational evidence-gap line in the run
summary and `guides-shared-publication.json`; known aliases remain and the page can
publish. Fetch does not retrieve more history or call Feishu to recover aliases.
The source-contract validator uses this validated alias set in its canonical-token
index and active-target lookup, including `docx/<obj_token>#heading` Base refs.

Once a page is active, its Base record must stay a publishable canonical row
whose `Docs` points to the page directory. Switching `Docs` back to Feishu,
deleting the record, changing its placement type or moving its Progress outside
the publishable set fails Fetch with `OWNERSHIP_REVERTED` and leaves the Git
version in place. Restore the record; retirement of shared pages is not supported
yet. Changing the target set of an already active page likewise fails with
`OWNERSHIP_PATH_MISMATCH` and retains its historical outputs; single-target first
activation does not authorize retiring an existing target.

## Shared Guides final publication evidence

English Guides source artifacts retain the observed candidate and authenticated
selected-target outcomes. Assembly derives a separate effective snapshot: successful
shared records use the emitted output paths; failed transitions retain their exact
pinned dev record and historical outputs; failed new records remain absent.
Combined sidebars include those authenticated old paths even when a stable table
ID has been renamed. Coverage and source-contract validation remain required.

After complete table restore and canonical publication, assembly verifies the
actual output hashes and tokens, writes final page receipts with the full immutable
Base navigation projection, and appends only successful first activations to
`generated/en/manifests/shared-pages/guides/active.json`. Existing activation
entries preserve their page, record, Feishu token, anchors and activation identity;
only evidenced alias additions may enrich a successful existing entry. The same
checkpoint owns MDX, receipts,
active state, and `_publication.json`; its underscore prefix cannot collide with
a valid page slug. This last file binds the observed/effective snapshot hashes,
active state, and exact prior snapshot bytes and output digests for fallback.
Checkpoint validation reads the original local dev Git commit to authenticate that
fallback evidence, so source-job scratch is not required. Missing pinned objects
or mismatched bytes fail validation. Legacy checkpoints without shared state
remain accepted without creating empty shared manifests.

An unrelated requested Guides Fetch carries existing shared receipts, activation
and output bytes from its pinned dev tree in a bounded `continuation.json` source
handoff. The requested CLI authenticates those bytes before merging sources;
fresh workers recheck them against pinned Git before restore, and assembly binds
publication authority to the new effective snapshot. It does not regenerate shared
pages or call the image store. A requested closure touching a shared owner, its
alias or its table still requires ordinary Guides Fetch. The page name `active`
is reserved for activation metadata and produces a page-local
`OWNERSHIP_PATH_MISMATCH` before generation; valid siblings continue.

A source-stage receipt draft cannot authorize a saved source cache. Final cache
manifests carry validated final receipts, and any shared page failure suppresses
cache generation so the next Fetch retries it. Build notes report page failures
and unknown post-activation anchors with the referring page and source URL. Old
Feishu token links resolve to the shared page; known heading blocks use the
activation anchor map, while unknown blocks resolve to the page top. Translation
and recovery cache identities remain unchanged.

For a recorded image digest, generation reuses hash-verified accepted bytes. If an
origin read succeeds with changed bytes, `IMAGE_SOURCE_CHANGED` reports the old and
observed digests while the accepted image and all selected manual outputs remain unchanged.
Missing or corrupt accepted objects fail the page; an unreadable origin retains
its existing failure behavior. Typed notices flow through the existing build card.
Receipt merge notes serialize deterministically into the existing `notes: string[]`.

Before sealing a successful source, an independent clean generation uses the new
candidate receipt's pinned inputs, frozen render targets and accepted images under
the same tooling. It compares the exact output path set, bytes and hashes;
`PUBLISH_REGEN_MISMATCH` retains that page's exact baseline outputs while valid siblings
continue. Checkpoint validation verifies the bound replay proof and rejects output
or proof mutation. A historical receipt replayed by newer tooling is an upgrade
comparison and never a publication veto; changed inputs are not compared with old
output hashes.

New receipts carry optional `inputs.fetch.render_targets` version 1 with only the
manual, path, extension, label, position and channel consumed by generation. Legacy
receipts without it remain readable, but cannot supply new exact replay evidence.
Older strict-key tooling rejects receipts containing this new field, so rolling
back the tooling after such receipts publish requires a compatible receipt reader.
Future target changes must use explicit version handling rather than silently
adding keys to an existing version.

## Shared Fetch requirement accounting

Requirement discovery recursively scans shared-docs `.test.ts`/`.test.tsx` files
and exactly eight explicit shared Fetch JavaScript suites in `spec/coverage.ts`.
It resolves from the module/repository root, fails on a missing allowlisted file,
and counts literal IDs in executable declarations, excluding skipped/todo cases.
This closes the Fetch accounting for `9-1`, `9-2`, `9-3`, `9-6`, `T06`,
`ACTIVATE_CHECK_FAILED`, `OWNERSHIP_REVERTED`, `OWNERSHIP_PATH_MISMATCH`,
`OWNERSHIP_CONFIG_MISSING`, `PUBLISH_IMAGE_UPLOAD_FAILED`, `PUBLISH_REGEN_MISMATCH`
and `IMAGE_SOURCE_CHANGED`. Existing `4-3`, `3-6`, `5-3` and `9-9` stay covered.
The default replay asserts generated Tabs/languages, links, anchors, images and
edit entries; it is synthetic regression evidence, not a browser run. `T06` still
requires the separate real site/browser evidence in
[replay-harnesses.md](replay-harnesses.md#full-local-evidence-mode-for-shared-fetch-publication).
WP14 dev-PR and old-writer ownership cases, retirement, `T07`, `T08`, `T09` and
`T10` remain deferred.

Before WP9b-2 merges, the maintainer must supply artifact-only Fetch evidence for
Guides and one SDK group, since link resolution is shared by every group. Run the
SDK Fetch with `group=<one SDK group>`, `publish=false`, `run_translations=false`
and the default `media_upload_mode=write`. For Guides, use `group=guides`,
`publish=false`, `run_translations=false` and `media_upload_mode=skip`. The SDK
skip incompatibility is not an implementation blocker, and no workflow change is
needed. The maintainer must check link conversion through `larkDocWriter.js`,
confirm there are no new errors, and verify outputs are unchanged except for
WP9b's intended behavior. If zero-upload SDK evidence is desired, enabling skip
is a separate maintainer-owned workflow change outside WP9b.
Retained regeneration comparisons must use real receipts from the first Fetch
with merged WP9b-1; missing retained inputs, accepted objects or Git history are
evidence gaps. Preflight every retained checkpoint, authenticate run/attempt,
artifact digests and pinned identities, restore exact generated state, and use an
isolated bare remote with production push targets absent. Compare every successful
receipt-declared output path byte-for-byte to retained post-WP9b-1 output and the
pre-WP9b-2 lane. Expect no WP9b-2 MDX changes; the only accepted delivery changes
are WP9b-1's six manual outputs with enumerated LF removals (Lindera 1, Stop 2,
Decompounder 3 per manual). Report alias, input/tool identity, notes and notice
metadata differences separately. Preserve commands, baseline/candidate SHAs,
artifact identities, verified input/page/file counts, success/fallback/mismatch
counts and every mismatch. Run the exact pre-WP9b-2 upstream comparison containing
WP9b-1 with `--comparison-baseline-sha`, fixed inputs and time, valid/malformed
inactive configs and cold/warm caches; ordinary lanes must have identical path
sets and bytes, zero shared generation/image-store calls and no empty authority
directory. Separate site/browser and retained-artifact inventory/build gates remain
required; the default suite and requirement tags cannot replace them.

## Screen the scope of an upstream Guides change

Start with the merged Milvus PR numbers and the exact Zdoc master, published dev
and Milvus track commits used for the comparison. With Git objects for those
commits available locally and a read-only GitHub token, run:

```sh
node scripts/docs-workflow/shared-guides-update/batch-scope.cjs \
  --zdoc-repo "$ZDOC_REPOSITORY" --source-repo "$MILVUS_DOCS_REPOSITORY" \
  --master "$MASTER_SHA" --dev "$DEV_SHA" --source "$SOURCE_SHA" \
  --pulls 3842,3861 > batch-scope.json
```

The report lists each page's own old `next`, the upstream merge identities and
the disposition for the requested batch. `full` means a source change or
dependency needs further verification. A link from a published page can put
that page on the verification list without requiring a lock update.
`excluded` requires affirmative evidence. `unknown` records the missing
evidence. The separate `sourceCounts` summarize root and fragment dependencies.
The report has `writeEligible: false`. Use the production qualification below
to obtain an acceptance ID and the exact set of locks eligible for a Draft.

## Qualify a production batch on demand

Use [fetch lark docs](../.github/workflows/fetch-docs.yml) on protected `master`.
Select `group=guides`, `target_branch=dev`, `publish=true`,
`tooling_ref=master`, and `source_ref=dev`. Keep `run_translations=false`,
`media_upload_mode=write`, and `force_full_fetch=false`. A matching first
attempt records the **Qualify exact manual Guides dispatch inputs** step in
`prepare` alongside the immutable Fetch publication selection.

After Fetch completes, run [Shared Guides upstream update](../.github/workflows/shared-guides-update.yml)
on protected `master` with `scope=batch` and `create_draft=false` to inspect
the preparation decision. The qualifier checks the latest normal Fetch run on
`master`, including scheduled runs. It verifies the reviewed producer tree,
the retained English source and publication results, and the published page
outputs against current `dev`. For manual Fetch it also verifies the selection
against the preparation step and the terminal publication results.

A newer unfinished or incompatible Fetch can hold the batch. Check the
reported reason and the producer's retained selection, source, and publication
artifacts before continuing. The daily single-page pilot uses scheduled Fetch
evidence.

The selector keeps pages linked by the same upstream change or a proven
dependency in one group. It first looks for a complete group with at least
two advancing locks, then a multi-page group with one advancing lock. A group
with a known historical rendering failure can wait while a
separate group advances, provided the evidence accounts for their shared
inputs and references. An unresolved dependency between the groups pauses
selection. Each Draft contains the pages from one accepted group.

To create the Draft, open the completed read-only run of **Shared Guides
upstream update**. Check that **Confirm read-only batch acceptance** succeeded.
Review the selected pages in the handoff manifest and the lock changes in its
plan. Keep the run ID shown in the URL. Dispatch the same workflow on
`master` with `scope=batch`, `create_draft=true`, and that ID in
`accepted_run_id`. The writer authenticates the archived handoff from the
first attempt and rechecks the live inputs before using that candidate.
A changed input requires a new read-only run. To check repeat delivery, use
the same accepted run ID and check the writer's result and the open PR list.

## Manual target Check validation and finalization

The single-page target Check path uses two independently dispatched runs on
`master`. The installed
[`reviewed-check.json`](../scripts/docs-workflow/shared-guides-update/reviewed-check.json)
is **registered for the manual verification slice**: a `workflow_dispatch`
producer followed by manually dispatched validation and finalization. The
approved run actor is `liyun95` (`105278390`) for all three workflows:

| Role | Workflow ID | Event |
|---|---:|---|
| Producer | 414826845 | workflow_dispatch |
| Validate | 419995175 | workflow_dispatch |
| Finalize | 419995174 | workflow_dispatch |

Registration establishes trusted identities; it does not prove a hosted Check
was accepted. A CLI invocation without the trusted Actions runtime still
holds before credentialed acquisition or Check writes. Missing, unregistered
and incomplete policies also remain held. The existing scheduled producer and
historical read-only `reviewed-producer.json` policy are unchanged. A scheduled
producer does not satisfy this dispatch-only Check policy; authenticating
scheduled producers and automatically triggering the Check path require a
separate reviewed change.

At the 2026-11-16 activation review, old-next
`ccc847315b9e0c8f7bfac0c6cb0e7725c2647425` and source target
`5479f04fcf7c379ede9548be1d917795eb4646b3` consumed identical
`json-field-overview.md` bytes (blob
`6162f57c5196b806e487eeaf87269f09a6200f9f`, 51,913 bytes), with no consumed
fragments or images. The same local variables produced identical preprocessed
content. A moved tracking commit alone cannot authorize a new `lock.next`.
After Fetch qualification, the permitted result is a no-op or report-only
observation without next edits. **Normal positive hosted Check verification
remains pending a genuine change to consumed upstream source or fragments.**
Do not invent a lock update, broaden the pilot or relax the source gate to
produce a candidate.

Fetch qualification is an independent prerequisite. A completed/successful
Fetch run does not by itself establish this page's lifecycle or publication
ancestry. The original source outcome and publication receipt input identities
must satisfy the current verifier. A single-run producer registration alone
does not authenticate reused page results or stale receipt inputs; keep
unproven evidence held and review any compatibility change separately.

An enabled registration requires review of `status: registered`,
`policy` conforming to `RemotePolicySchema`, and a `finalizer` identity with
`actorId`, `workflowId`, `workflowPath`, `workflowDefinitionSha256`, and
`event: workflow_dispatch`. The producer/validator identities are nested under
`policy.producer` and `policy.validator` with the same five fields. Register
the actual **run actor**, separately from writer actor `41898282` and platform
signer `19864447`. The fixed production repository is `zilliztech/zdoc`
(`660446555`), Check App `15368`, and Check name
`shared-update-exact-validation`. Artifact names are exactly
`shared-guides-update-producer` and `shared-guides-validation`. The approved
workflow paths are `.github/workflows/shared-guides-update.yml`,
`.github/workflows/shared-guides-validate.yml`, and
`.github/workflows/shared-guides-finalize.yml` respectively. Review the full
producer definition, event, run actor and workflow ID; historical IDs alone
do not approve the current producer.

Compute each `workflowDefinitionSha256` over the original workflow bytes,
for example:

```bash
shasum -a 256 .github/workflows/shared-guides-update.yml \
  .github/workflows/shared-guides-validate.yml \
  .github/workflows/shared-guides-finalize.yml
```

Workflow IDs and actor IDs must be independently observed and approved before
registration. Do not install placeholder IDs or zero digests. Registry approval
pins workflow content, not its containing commit's own SHA, avoiding a
self-referential commit. At runtime the independently checked Actions context,
checkout HEAD, `GITHUB_SHA` and `GITHUB_WORKFLOW_SHA` must agree on immutable
M; the approved producer definition's `tools` is derived from that M. The
producer, validator, finalizer and signed intent must all bind the same M.
Changing master, the approved workflow bytes, actor, or definition requires
fresh evidence and may require renewed registration review. Installing a
registry does not authorize dispatch by itself.

When a fresh genuine candidate is available, dispatch **Shared Guides target
Check validate** on `master` with `producer_run_id`, `producer_attempt`, `pr_number`, and a unique
bounded `request_id` (1–200 characters; letters, digits, `/_.:-`, starting with
a letter or digit). The producer must already be completed/successful with
its original unexpired archive. Do not reuse the historical sample as fresh
production evidence. The producer must be a successful `workflow_dispatch`
run with `create_draft=true` at the same immutable M; a no-op/read-only
producer has no signed candidate archive to validate. Run 1 has two jobs:

- `reserve` authenticates the producer run, raw definition and original bounded
  ZIP; verifies the canonical plan, proof, report, exact lock.next object delta
  and signed seal; observes PR/head and master/dev/Milvus `v3.0.x` refs; and
  creates one in-progress Check on **signed seal S**. Only this job has
  `checks:write`. Its read-back Check ID/suite are outputs, and its external ID
  binds the actual validator run/attempt/request. Any existing target-name
  Check, ambiguous read, or partial prior reservation holds before another POST.
- `validate` has read permissions only, independently repeats authentication,
  binds the live Check to the reserve outputs and actual run/request, and
  formally encodes the canonical receipt and output. It runs only after a
  `reserved` result. Its exact `shared-guides-validation` artifact contains
  **only `receipt.json` and `output.json`**; separate observation artifacts
  retain reports and acquisition evidence. The output binds the producer
  run/attempt and original archive digest. The workflow suite remains on M;
  the target Check suite is on S.

Wait for the **whole run** to complete successfully, including artifact upload.
Then dispatch **Shared Guides target Check finalize** with `validator_run_id`,
`validator_attempt`, and the same `request_id`. Run 2 independently downloads
and authenticates run 1's original archive and producer material, reads the PR,
refs and reserved Check, runs formal prepublish against that exact live Check,
then PATCHes that Check once. It reads the completed Check back and formally
accepts the result. A repeated finalizer authenticates an already-completed
success read-only; it cannot create another Check. Still-running, failed,
cancelled, wrong-attempt, malformed, stale or moved-head evidence holds.

Both manual workflows use the fixed
`shared-guides-json-field-overview-target-check` concurrency group with
`cancel-in-progress: false`. Request IDs cannot bypass that serialization.
This is separate from the production Fetch/Translation queue. Never cancel a
writer merely to clear uncertainty.

The workflow commands are:

```bash
# Run 1, separately in the reserve and read-only validate jobs:
node scripts/docs-workflow/shared-guides-update/validate.mjs
# Run 2, after the entire validator run succeeds:
node scripts/docs-workflow/shared-guides-update/finalize.mjs
```

These entrypoints accept no arguments or registry overrides. They require the
registered trusted Actions repository/ref/job/event/attempt/actor context and
job `GITHUB_TOKEN` (the workflows expose it as `GH_TOKEN`). Workflow inputs are
passed through environment variables: `PRODUCER_RUN_ID`, `PRODUCER_ATTEMPT`,
`PR_NUMBER`, `REQUEST_ID`, reserve outputs `RESERVED_CHECK_ID` and
`RESERVED_SUITE_ID`, or finalizer inputs `VALIDATOR_RUN_ID`,
`VALIDATOR_ATTEMPT`, `REQUEST_ID`. Output paths are `VALIDATE_OUTPUT` or
`FINALIZE_OUTPUT`, with the acquisition evidence in the sibling `-evidence`
directory. Existing output/evidence is never overwritten. No candidate/seal
checkout, hook, import or candidate process is permitted; candidate Git bytes
are inspected in isolated object storage by trusted M tooling.

Inspect the separate reserve/validation/finalize observation artifacts and
`result.json` before acting. `held` means no mutation was requested in that
invocation; `unknown` means a mutation was requested but its final authorization
or response/read-back could not be established. The journal records `before`
and acknowledged `after` events without tokens. Preserve both the original
journal and evidence root. After a lost POST/PATCH response, inspect the live
run, PR, refs and Check id/suite/App/name/head/external ID read-only; do not
retry a writer to clear uncertainty. An existing reservation holds a new
reserve run; a complete formal success may be reauthenticated by the
finalizer without another PATCH. Partial runs without an authenticated
receipt require operator reconciliation, not a fabricated receipt or Check.

The hermetic CLI integration gate is included in `pnpm test:shared-guides-update`.
It runs the actual CLI orchestration in subprocesses using local bare Git,
original fixture ZIP bytes, fixed synthetic production wire identities and
loopback-only transports. It uses no real credential or GitHub mutation.

Before either Check write, the driver also authenticates complete, twice-read
history for the approved operation workflow at exact M, without filtering by
request title. The current run must be present. Keep rejection tests local or
hermetic: a deliberately failed hosted validator on the final M becomes a
prior-run veto and may require a new reviewed M before a later genuine
positive run. A prior validator run that
failed, was cancelled, is incomplete, or lacks an authenticated original
receipt/output archive vetoes a new reservation even while its Check is
invisible. A successful prior validator archive may be excluded only when
its authenticated receipt proves a different S. A same-S operation always
holds a new reserve.

Successful finalizers additionally retain the stable
`shared-guides-finalization` artifact with exactly `operation.json`. Its
canonical association binds repository, M, finalizer run/attempt/workflow
path and raw definition digest, validator run/attempt/request, receipt/output
digests, and the exact Check ID/suite/App/name/head. The full finalizer
observations remain in the separately named artifact. Before PATCH, previous
finalizer runs are authenticated under their separately approved identity;
missing or failed uploads and unknown/incomplete outcomes hold. Excluding a
successful different-target finalizer requires its original operation archive
and independently authenticated validator archive with matching receipt digest
and exact target tuple. Current apparent `in_progress` state cannot resolve an
older uncertain PATCH. Independently authenticated completed exact successes
remain eligible for read-only acceptance without another write.

History veto reasons such as `PRIOR_VALIDATOR_OUTCOME_UNKNOWN`,
`PRIOR_VALIDATOR_ARCHIVE_UNKNOWN`, `PRIOR_FINALIZER_OUTCOME_UNKNOWN`, and
`PRIOR_FINALIZER_ARCHIVE_UNKNOWN` identify the missing outcome/evidence for
operator inspection. Inspect the original run and authenticated artifacts;
there is no request or environment bypass. A complete history exceeding the
bounded inspection budget also holds. Resolve missing or ambiguous evidence
through reviewed operator reconciliation or a fresh approved tooling context;
do not retry the writer or manufacture a successful report.

The selected PR must use the producer's exact branch:
`shared-update/` followed by SHA-256 of canonical
`{"kind":"remote-unit","unitKey":"<authenticated unitKey>"}`. A same-seal
alias in the allowed namespace is held. Finalization preserves the first
constructor-authenticated Check inventory: an unknown, ambiguous, or conflicting
target observation stops before PATCH and cannot be cleared by a later read.
An unrelated Check's empty external ID is treated as absent; the target Check
still requires its exact nonempty run/attempt/request correlation.
