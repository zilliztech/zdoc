# web-content RESTful mirror sync

The milvus.io RESTful reference (`API_Reference_MDX/milvus-restful/{v2.6.x,v3.0.x}`) is maintained in `milvus-io/web-content` by regenerating it from the zdoc fragments: that repo vendors this pipeline as `scripts/apifox-docs` (generator subset + a `meta/` mirror of the fragment inputs). Accepted sync PRs: #1250, #1252, #1254, #1260, #1265, and #1300 (2026-11-16). The channel is human-reviewed — web-content runs no CI on pull requests.

## What syncs and what never syncs

Sync set (generation inputs only):

| zdoc | web-content vendored copy |
|---|---|
| `packages/docs-tooling/src/reference/rest/meta/openapi/**` | `scripts/apifox-docs/meta/openapi/**` |
| `meta/titles.json` | `meta/titles.json` |
| `meta/descriptions.json` | `meta/descriptions.json` |
| `meta/fragment-migration.json` | `meta/fragment-migration.json` |

Never synced (zdoc-internal state the milvus.io publication does not read): `meta/lifecycle-evidence/**`, `meta/upstream/**` (ledger + lock), `conformance/**`, the generator `.js` files unless a generation behavior change is deliberately being shipped (that is a separate, reviewer-visible decision — the vendored copy has web-content-specific wiring, so do not wholesale-copy it).

## Drift detection

```bash
node scripts/rest-upstream/webcontent-sync-drift.js                     # working tree vs web-content@master
node scripts/rest-upstream/webcontent-sync-drift.js --at origin/master  # scheduled form: compare the fetched master, not the checkout
```

Compares git blob hashes of the sync set against `milvus-io/web-content@master` via `gh api`, and prints the pending file list. Report-only by default; `--gate` exits non-zero on drift. The daily watchdog digest runs the `--at origin/master` form (a stale or detached checkout would skew the working-tree variant).

## Procedure (every sync PR)

Work in a checkout of `milvus-io/web-content` (push branch directly; collaborators have push rights).

1. **Baseline first, always.** On the clean tree, regenerate both tracks and require zero diff — this proves the invocation matches the maintainers' pipeline before any input changes:
   ```bash
   npm install --no-save nunjucks @aws-sdk/client-s3 ali-oss ajv   # one command; repeat installs prune earlier no-save packages
   git checkout -- yarn.lock 2>/dev/null || true                  # npm touches the lockfile even with --no-save
   node scripts/fetch-restful-docs.js --entry milvus-v3.0.x
   node scripts/fetch-restful-docs.js --entry milvus-v2.6.x
   git status --short -- API_Reference_MDX                        # must be empty
   ```
   `nunjucks`/`@aws-sdk/client-s3`/`ali-oss`/`ajv`/`commander` are ambient dependencies no manifest declares; install them `--no-save` and keep them out of the diff.

2. **Pin order.** Every zdoc-side fragment fix that the sync should carry must already be **merged to zdoc master** before the sync PR is cut — the vendored meta must be byte-identical to a zdoc master SHA, never locally patched. A local patch survives at most one sync and then silently reverts (the `Eventually` spelling carried a local re-apply from #1260/#1265 until zdoc#1291 fixed the fragment upstream). Record the pin range (`<previous> → <zdoc master SHA>`) in the PR description.

3. **Sync and regenerate.** Copy the drifted files from the zdoc pin, then rerun both `--entry` commands from step 1.

4. **Sanity gates** (script or by hand; every one has caught a real defect):
   - **No page adds/renames/removes.** Page-set changes are not auto-shippable: route them through maintainer coordination (the Spark→batch-jobs fragment rename never touches milvus.io because the operation set is zilliz-only; a real milvus.io rename needs the nginx-style redirect two-step agreed with maintainers).
   - **Cloud-field token delta**: for each modified page, count `"clusterId"|"projectId"|"regionId"|"objectUrls"|"stageName"|"currentPage"|"pageSize"|"volumeName"|"dataPaths"|"externalSpec"` tokens before vs after (`grep -o | wc -l` — the specs JSON is one line, `grep -c` counts lines and hides multi-token drift). Request-side increases are leaks unless they are milvus-upstream API truth with evidence (e.g. create's top-level `externalSource`, verified against a 3.0 cluster 2026-11-13). Known trap: **`Get Progress.mdx` renders `jobs/import/describe`; `Get Import Job Progress.mdx` renders `jobs/import/get_progress`** — check `operationId`, not the file name.
   - **Track scoping**: release-track additions must only surface on tracks that serve them (`fields/drop` is v3.0.x-only; public 2.6.x has no external-collection surface).
   - Run the vendored suite (`find scripts/apifox-docs -name '*.test.js' | xargs node --test`), and disclose the failures that also fail on clean `master` as pre-existing.

5. **PR body conventions**: pin range, per-page change audit grouped by operation, sanity-gate results, test counts with pre-existing failures disclosed, and the upstream zdoc PR references (e.g. #1300 references zdoc#1256/#1291/#1294).

## Dual-track model (why import does not leak)

Both publications render from the same merged fragments; the `x-include-target` projection splits them. Import `create`/`list`/`describe` are branched operations with per-branch targets (e.g. describe: `[zilliz] jobId+clusterId`, `[zilliz] jobId+projectId+regionId`, `[milvus] jobId`). `get_progress` is an **operation-level `[milvus]`** deprecated alias of describe (zdoc#1294 removed three unmarked cloud-only parameters from it — CUSTOM_ATTRIBUTES §1.2 forbids foreign-target nodes inside explicitly scoped subtrees). The zilliz projection never renders get_progress; the cloud progress-query surface is describe's zilliz branches. A fragment change that adds a parameter to a flat, target-pinned operation is a modeling smell — resolve it in zdoc (scope or delete per §1.2) before syncing.
