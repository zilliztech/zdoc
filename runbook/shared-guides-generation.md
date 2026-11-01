# Selected shared Guides generation and evidence

How selected shared Guides pages are generated, published, and evidenced.
The runbook and section index live in [README.md](../README.md); the replay
evidence modes live in [replay-harnesses.md](replay-harnesses.md).

## Selected shared Guides source generation

English Fetch prepares shared-page routing against its pinned master configuration
and exact dev baseline before ordinary Feishu body reads. After source fetching,
`Generate selected shared Guides sources` builds each selected record's Guides and
BYOC outputs together. Current Base navigation, publish targets and release channel
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
including raw Base routing evidence, both successful outputs and exact historical
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

On first activation, the job reads the old document at its current revision only
when a current body link or Base ref requires a heading anchor. Page-top-only
references do not require that read. It checks required anchors against both
generated manuals; `ACTIVATE_CHECK_FAILED` retains both baseline outputs. Existing
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
yet.

## Shared Guides final publication evidence

English Guides source artifacts retain the observed candidate and authenticated
paired outcomes. Assembly derives a separate effective snapshot: successful
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
observed digests while the accepted image and both manual outputs remain unchanged.
Missing or corrupt accepted objects fail the page; an unreadable origin retains
its existing failure behavior. Typed notices flow through the existing build card.
Receipt merge notes serialize deterministically into the existing `notes: string[]`.

Before sealing a successful source, an independent clean generation uses the new
candidate receipt's pinned inputs, frozen render targets and accepted images under
the same tooling. It compares the exact output path set, bytes and hashes;
`PUBLISH_REGEN_MISMATCH` retains that page's baseline pair while valid siblings
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
