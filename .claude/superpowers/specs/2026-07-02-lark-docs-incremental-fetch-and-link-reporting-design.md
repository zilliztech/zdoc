# Lark Docs Incremental Fetch and Link Reporting Design

## Goal

Make the Lark docs pipeline do two things reliably:

1. After every fetch/build cycle, run `link-checks`, persist a machine-readable result, and report the outcome through the existing Feishu build card.
2. Before a source fetch, identify which Base-listed docs changed since the last successful build, expand that set through cross-reference links, and fetch only those source files when it is safe to do so.

## Current State

The repo already has the building blocks:

- `.github/workflows/fetch-docs-auto.yml` and `.github/workflows/fetch-docs-manual.yml` create and advance a Feishu build-progress card.
- `npx docusaurus link-checks` runs after EN docs and SDK docs builds, but currently only prints counts to stdout.
- `plugins/report-to-lark/index.js` can append notes to the progress card with `--card-advance --note` or `--note-file`.
- `plugins/lark-docs/index.js` owns the `fetch-lark-docs` CLI.
- `plugins/lark-docs/larkDocScraper.js` can load Base records, fetch individual docs by token, rewrite Base navigation, and validate canonical Feishu links.
- `plugins/lark-docs/canonicalLinkAuditor.js` already extracts `mention_doc` and Feishu `href_link` references from cached source JSON.

The missing durable layer is a per-manual build snapshot and a dependency-aware fetch planner.

## Build Environments

There are two publishing destinations, but the automated docs builds happen in UAT:

- Daily builds run from `dev`, are triggered by updates to `dev`, and publish to `https://docs.cloud-uat3.zilliz.com`.
- Production at `https://docs.zilliz.com` is promoted manually by selecting a UAT build.

Even for daily UAT builds, `link-checks` should compare the freshly built local sitemap against the production site, `https://docs.zilliz.com`, not against UAT. This makes daily builds surface route deletions or broken outgoing links relative to the public docs contract before those changes reach production.

Snapshots must be scoped by manual and build environment, not by publish target. The same source graph feeds all UAT target outputs, and one UAT build is later selected for production. Splitting snapshots by target would make incremental fetch state diverge for no source-level reason. The default snapshot key should include manual and build environment:

```text
plugins/lark-docs/meta/snapshots/<manual>-<build-env>-last-success.json
```

Examples:

```text
plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
plugins/lark-docs/meta/snapshots/agents-uat-last-success.json
```

## Recommended Approach

Use a local, committed-or-artifacted snapshot per manual as the source of truth for the last successful build, then derive incremental fetches from live Base metadata plus cached source references.

This is better than depending on git diffs alone because Feishu is the upstream source. It is also better than a pure Base `Updated time > last build` filter because cross-reference safety needs the cached source graph: if doc A changed and doc B links to A, B may need to be re-exported even when B itself did not change.

## Link-Check Reporting

Change `plugins/link-checks/index.js` so `npx docusaurus link-checks` writes:

- `plugins/link-checks/meta/reports/latest.json`
- `plugins/link-checks/meta/reports/latest.md`
- timestamped JSON/Markdown reports for historical local debugging

The JSON report should include:

- `generated_at`
- `remote_sitemap_source`
- `local_sitemap_source`
- `summary.deleted_links`
- `summary.added_links`
- `summary.external_links`
- `summary.broken_external_links`
- `deleted`
- `added`
- `broken_external_links`, with `url`, `status` or `error`, and `pages`

The Markdown report should be short enough to paste into Feishu:

- one summary line
- top deleted routes
- top added routes
- top broken external URLs grouped by URL with sample pages
- the local report path

Add a `report-to-lark` convenience mode:

```bash
npx docusaurus report-to-lark --card-note-file plugins/link-checks/meta/reports/latest.md
```

This can be implemented as an alias for the existing `--card-advance --note-file` path, or the workflows can call the existing options directly:

```bash
npx docusaurus link-checks
npx docusaurus report-to-lark --card-advance --note-file plugins/link-checks/meta/reports/latest.md
```

The workflow should run link checks after every `pnpm run build`. If link checks fail, the card should still include the report note before the job exits.

The default remote sitemap source must be production:

```text
https://docs.zilliz.com/sitemap.xml
```

`LINK_CHECKS_REMOTE_SITEMAP` and `LINK_CHECKS_REMOTE_BASE_URL` can still override the baseline for local debugging, but CI workflows for both daily UAT and production builds should set or rely on the production baseline.

## Last-Success Snapshot

Add a snapshot file per manual:

```text
plugins/lark-docs/meta/snapshots/<manual>-<build-env>-last-success.json
```

The snapshot is written only after a successful fetch, build, and link-check stage. It should contain:

- `schema_version`
- `manual`
- `targets_built`
- `build_env`
- `source_branch`
- `publish_url`
- `link_check_remote`
- `generated_at`
- `source_dir`
- `base_app_token`
- `base_table_ids`
- `records[]`

Each record entry should contain:

- `record_id`
- `table_id`
- `table_name`
- `placement_type`
- `title`
- `slug`
- `doc_token`
- `doc_link`
- `updated_time` when Base exposes it
- Feishu wiki node metadata when available:
  - `node_token`
  - `origin_node_token`
  - `obj_token`
  - `obj_type`
  - `obj_edit_time`
  - `revision_id` or equivalent revision field
- `source_file`
- `source_hash`
- `outgoing_tokens[]` extracted from `mention_doc` and Feishu hyperlinks

The first run without a snapshot must fall back to full fetch and then create the snapshot after success.

## Feishu Wiki Metadata APIs

Confirmed with `lark-cli`:

```bash
lark-cli wiki +node-get --node-token <wiki_node_token> --dry-run --json
```

Raw request:

```text
GET /open-apis/wiki/v2/spaces/get_node
```

Query params:

- `token` required. A wiki node token, or an object token when `obj_type` is provided.
- `obj_type` optional. One of `doc`, `docx`, `sheet`, `mindnote`, `bitable`, `file`, `slides`, `wiki`; defaults to `wiki`.

Response payload shape:

- `data.node.node_token`
- `data.node.node_type`
- `data.node.origin_node_token`
- `data.node.origin_space_id`
- `data.node.obj_token`
- `data.node.obj_type`
- `data.node.title`
- `data.node.space_id`
- `data.node.parent_node_token`
- `data.node.node_create_time`
- `data.node.obj_create_time`
- `data.node.obj_edit_time`

If Feishu returns a `revision_id` or equivalent revision field for the tenant/API version, persist it and prefer it over `obj_edit_time` for change detection. Otherwise use `obj_edit_time`.

Also confirmed:

```bash
lark-cli wiki +node-list --space-id <space_id> --parent-node-token <wiki_node_token> --dry-run --json
```

Raw request:

```text
GET /open-apis/wiki/v2/spaces/:space_id/nodes
```

Query params:

- `space_id` required in the path.
- `parent_node_token` optional.
- `page_size` optional, max `50`.
- `page_token` optional.

Response payload shape:

- `data.items[]` with the same node metadata fields as `get_node`, including `obj_edit_time`.
- `data.has_more`
- `data.page_token`

Because the docs listed in Base may be scattered across the wiki, incremental planning should use `get_node` for each current canonical Base record. `nodes list` is useful for subtree fetches and navigation, but it should not be the primary signal for Base-scattered incremental planning.

## Incremental Fetch Planning

Add a planner module:

```text
plugins/lark-docs/incrementalFetchPlanner.js
```

The planner should expose:

```js
planIncrementalFetch({
  manualName,
  docSourceDir,
  records,
  previousSnapshot,
  buildEnv,
  maxReferenceDepth = 1,
  forceFull = false,
})
```

It should return:

- `mode`: `full` or `incremental`
- `changed_records[]`
- `changed_tokens[]`
- `expanded_tokens[]`
- `reasons_by_token`
- `warnings[]`
- `snapshot_basis`

Change detection should mark a canonical doc changed when any of these differ from the previous snapshot:

- Base record is new or removed
- Doc token changed
- slug/title/placement changed
- Feishu wiki node `revision_id` changed when available
- Feishu wiki node `obj_edit_time` changed when no revision field is available
- no previous source file exists
- source metadata is missing or corrupt

If a previous snapshot lacks wiki node metadata, run one full fetch and write a schema-v2 snapshot before using metadata-based incremental fetches. This avoids missing remote Feishu body edits from older snapshots that only recorded Base metadata and local source hashes.

If `get_node` fails for a current canonical Base record, include that doc in the incremental fetch plan with a metadata-fetch-failed reason. The failure should be visible in the plan report; silently skipping the doc would risk missing a remote edit.

Removed records should trigger a full navigation rewrite and should be listed in the report, but no source fetch is possible for the removed doc.

## Cross-Reference Expansion

The planner should build two graphs from current cached sources:

- outgoing graph: `source_token -> referenced_target_tokens`
- incoming graph: `target_token -> source_tokens_that_reference_it`

For each changed token:

- fetch the changed token
- fetch any cached source that links to the changed token
- fetch any cached source referenced by the changed token if the reference target is canonical
- repeat up to `maxReferenceDepth`, default `1`

This catches common cases:

- doc title/slug changes may require pages linking to it to be regenerated
- doc content changes may add/remove outgoing mentions that need canonical audit validation
- docs that are tightly coupled by Feishu mentions stay coherent without full Base pulls

The expansion is intentionally conservative. It may fetch extra docs, but it should not silently skip likely affected pages.

## Fetch Execution

Add a new `fetch-lark-docs` option:

```bash
--incremental
--incrementalPlanOnly
--incrementalMaxReferenceDepth <n>
--snapshotPath <path>
--buildEnv <env>
--forceFullFetch
```

Behavior:

- `--incrementalPlanOnly` writes the plan and exits.
- `--incremental` runs the planner before fetching.
- `--buildEnv` scopes snapshot lookup and update. CI should pass `uat` for daily `dev` builds and `production` for production builds.
- if the planner returns `full`, keep today’s full fetch behavior.
- if it returns `incremental`, fetch only `expanded_tokens`.
- after partial source fetch, run Base navigation rewrite without deleting unrelated source files.
- after fetch, run canonical link audit on the changed/expanded set and the full cached graph.
- after successful downstream build/link checks, update the snapshot.

Partial fetch must not remove `docSourceDir`. The existing full-fetch paths can continue to clear the directory.

## Report Artifacts

The prefetch planner should write:

```text
plugins/lark-docs/meta/reports/<manual>-incremental-fetch-plan.json
plugins/lark-docs/meta/reports/<manual>-incremental-fetch-plan.md
```

The Markdown report should include:

- mode
- previous snapshot timestamp
- changed docs with reasons
- expanded docs grouped by reason: changed, incoming reference, outgoing reference
- warnings
- fallback reason if full fetch is required

## Feishu Reporting Flow

For each build stage:

1. run fetch or incremental fetch
2. run build
3. run link checks
4. append link-check summary to the Feishu card
5. only then advance or fail the stage
6. if the whole stage succeeds, write/update the snapshot

If link checks fail, use a shell trap or wrapper script so Feishu still receives the generated report path and summary before the workflow exits non-zero.

## Workflow Changes

Replace raw workflow command blocks with small scripts so error handling is consistent:

```text
scripts/run-doc-build-stage.js
scripts/update-lark-doc-snapshot.js
```

`run-doc-build-stage.js` should run commands in order and report link-check results even on failure.

The workflows should use:

```bash
node scripts/run-doc-build-stage.js --stage en-docs --fetch "..." --build "pnpm run build"
node scripts/update-lark-doc-snapshot.js --manual guides --targets-built zilliz.saas,zilliz.paas --build-env uat --publish-url https://docs.cloud-uat3.zilliz.com --link-check-remote https://docs.zilliz.com
```

The first implementation can keep the existing YAML mostly intact and call the scripts only around build/link-check stages. A later cleanup can de-duplicate auto/manual workflows.

Daily workflows on `dev` should use `--buildEnv uat`. Production promotion should not update the fetch snapshot unless it performs a new source fetch; it should reuse the selected UAT build artifact. Link checks for both UAT validation and production promotion should compare against `https://docs.zilliz.com`.

## Failure Policy

- Missing snapshot: full fetch.
- Base schema missing update metadata: compare record fields and existing source hashes; if uncertain, full fetch.
- Planner cannot parse source graph: full fetch and record warning.
- Changed record count above a threshold, default 25% of canonical records: full fetch.
- Canonical link audit finds broken references: report through Feishu and fail only if the workflow is configured with `--failOnBrokenCanonicalLinks`.
- Link checks find broken links: fail the stage after reporting summary.

## Testing

Add focused Node tests for:

- link-check report JSON/Markdown generation
- Feishu card note path from `report-to-lark`
- snapshot creation from records and cached sources
- changed-record detection
- incoming/outgoing reference expansion
- planner fallback to full fetch
- fetch CLI plan-only mode

Keep network calls mocked. Do not test against live Feishu or live sitemap in unit tests.

## Open Decisions

The implementation should default to updating snapshots only after successful link checks. If maintainers want snapshots committed back to the repo, the current auto-commit steps can include `plugins/lark-docs/meta/snapshots/*.json`. If snapshots should be CI artifacts instead, workflows need artifact download/upload steps before and after the build.

For this repo, committing snapshots to `dev` is the pragmatic first implementation because daily UAT builds are triggered from `dev` and existing workflows already auto-commit generated docs changes. Production promotion should not create a separate source snapshot unless the production process later becomes an independent source-fetching workflow.
