# Shared-docs variants: adopting upstream PR content

A shared page's `lock.yaml` pins `current`/`next` to on-branch commits only; unmerged upstream work can never be pinned. When Milvus and Zilliz must publish the same documentation at the same time, an unmerged upstream PR is adopted instead as **Zilliz-owned variant content**: the PR's source file is copied verbatim into the page directory, consumed through the existing NEXT-channel gating, and re-pinned onto the merge commit once the upstream PR lands. Until that merge the content's identity is Zilliz-owned (a human-reviewed master PR is the adoption gate); after it, the content is shared again. This page is the operator procedure for that lifecycle.

## File layout and rules

Per page (`shared-docs/guides/pages/<page>/`):

- `variant-next.md` — feeds the NEXT channel only. May exist alone (UAT preview).
- `variant-current.md` — feeds the CURRENT channel. Requires `variant-next.md` to exist; the build rejects a current-only adoption (production must never run ahead of UAT).
- `variant-<channel>.provenance.json` — strict sidecar: `pull`, `head_sha`, `adopted_at`, optional `adopted_via`. Required next to every variant file.

Content bytes stay identical to the upstream file; adaptation happens at build time exactly as for pinned reads. Lock validation is unaffected: an unusable pin stays unusable even when a variant exists. If `variant-current.md` and `variant-next.md` differ, the normal dual-channel gating applies — production keeps the released version while UAT shows the newer adoption, which is the expected rhythm when an upstream PR is re-adopted between releases.

Receipts record the adoption (`inputs.variants` with the file digest and PR provenance) and the regeneration replay recomputes it from the pinned master tree; a receipt that claims a different variant set than the pinned tree fails closed with `PUBLISH_REGEN_MISMATCH` ("Variant identity differs").

## Lifecycle

1. **Adopt** (needs an unmerged upstream PR touching an existing shared page's `source.file`):
   - Dry run first: `pnpm docs-tooling shared-docs adopt-variant --shared-docs shared-docs/guides --page <page> --pull <N> --dry-run`.
   - Or dispatch [`shared-docs-adopt-variant.yml`](../.github/workflows/shared-docs-adopt-variant.yml) (`page`, `pull`, optional `promote`, `dry_run`). The workflow opens a master PR; `shared-docs-validate` runs full generation on it — that run is the adoption evidence. Requires `SHARED_DOCS_ADOPT_PAT` (contents:write + pull_requests:write); without it the run fails closed after committing locally.
   - `--ref <sha>` pins the expected PR head and fails closed if the PR moved since.
2. **Zilliz releases first** (upstream PR still open): dispatch the workflow again with `promote=true`, or run the command with `--promote`. Both channels then render the adopted bytes (no gating), and the next production build ships them.
3. **Upstream merges first**: reconcile — delete the page's `variant-*` files and re-pin `current`+`next` onto the merge commit (the #1151-style PR). Watchdog reconciliation notes preview the variant-vs-upstream diff; keep any Zilliz-only delta as a transform or contribute it upstream first.
4. **Upstream PR updated after adoption**: re-run the adoption (identical content reports `Unchanged`; new content reports `Updated` and re-adopts at the new head).

## Watchdog

[`shared-docs-pin-drift-watchdog.yml`](../.github/workflows/shared-docs-pin-drift-watchdog.yml) (daily 04:47 UTC, dispatch-only on demand) audits every page: pin drift (`git log next..head -- <file>`), pin health (`PIN_OFF_BRANCH`, `UPSTREAM_FILE_MISSING`), and variant health against the live upstream PR state. Artifact: `shared-docs-pin-drift-<run_id>` (14 days) with `watchdog-report.json`/`.md`; the digest (`summary.diffDigest`) is what the daily ops digest compares day over day.

Card status: **fail** only when `unhealthyCount > 0` (off-branch pins and unavailable variant state — both mean the next scheduled Fetch silently degrades those pages to baseline fallback) or `errorCount > 0` (configuration parse failures). Plain drift and `RECONCILIATION_PENDING`/`PR_HEAD_MOVED`/`PR_CLOSED` are informational.

Responses:

- `PIN_OFF_BRANCH` — the pin points outside the track history (usually an upstream force-push or rewrite). Open a re-pin PR immediately; until it lands, Fetch serves the page from the previous baseline.
- `RECONCILIATION_PENDING` — the upstream PR merged but the variant is still in place. Do step 3 of the lifecycle; the message includes the variant-vs-upstream line diff.
- `PR_HEAD_MOVED` — upstream pushed new commits; re-adopt when the content should track them.
- `VARIANT_STATE_UNAVAILABLE` — the GitHub API read failed; the watchdog run itself usually shows why. Retry before treating it as content work.

## Limitations

- Adoption only covers pages that already exist upstream and in the shared page pool. A PR that adds a brand-new page keeps the existing paths: Feishu-owned page first, shared onboarding after the upstream merge.
- Variant content is read at the PR head, but fragments, variables and image assets still resolve from the pinned commits. A PR whose content depends on new images or fragments absent from the pin needs the pin advanced first (or the assets externalized); the build fails closed when preparation cannot find them.
- `<NextChannel>`-gated text ships in the production browser bundle by design (see [Release Channel gating](release-channel-gating.md)); variant adoption changes nothing about that.
