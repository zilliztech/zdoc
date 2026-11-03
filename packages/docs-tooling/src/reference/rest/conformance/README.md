# REST reference live-verification conformance

Live verification for the REST reference produced by the rest-upstream
pipeline: the fragments (and the pages generated from them) are checked
against **real running systems**, not just source-derived expectations — the
2026-11-03 PR #3801 round proved that GA images can diverge from their own
tag's source, so every response-side expectation here is **captured from a
live system and frozen after human review** (W4 goldens), never derived from
source code.

## Layout

| Path | Contents |
|---|---|
| `suites/_shared/` | Shared (read-only) case catalogs: `catalog.mjs` = the 2026-11-01 first round (130 param-level cases) + admin families; `control-cases.mjs` = cloud-track control plane; `fixtures.mjs` = seeded world recipes |
| `suites/milvus-2.6.26/` | Suite for the v2.6.26 anchor: `config.json` (auth profile, resource prefix) + `cases.mjs` (catalog + `overrides.json` deltas) + `goldens/` (frozen response shapes) |
| `suites/milvus-3.0.5/` | Same catalog against the v3.0.5 anchor; overrides pin known divergences |
| `suites/uat-dataplane/` | Same catalog against the Zilliz Cloud UAT3 dataplane; verdict/shape diffs vs a milvus suite = the **M/Z incompatibility list** |
| `suites/uat-controlplane/` | Cloud-track control plane on UAT3 (clusters, projects, api-keys, storage integrations, backups) |
| `lib/case-runner.mjs` | Generic executor: `plain` / `capture` (freeze goldens) / `verify` (assert frozen shapes); ghost-param detection; effect checks with retry; volatile-field stripping |
| `inventory/` | `generate-inventory.mjs` → `schema-inventory.json`: per-operation parameter/field attribution + request/response shape tables generated from the fragments (committed; regeneration must be byte-identical) |
| `diff/mz-diff.mjs` | M/Z incompatibility report from a milvus round vs a uat-dataplane round |
| `diff/cross-track.mjs` | fragments vs v2.6.26/v3.0.5 route skeletons vs live verdicts (feeds the version-track decision) |
| `runner/cell_round.sh` | One round on milvus-cell: create-per-round → helm per anchor → probe → **delete-after** (no idle). User's own vCluster is only woken, never deleted |
| `runner/uat_round.sh` | One round on UAT3 from `.env` `ZILLIZ_UAT3_*` (control plane + dataplane with endpoint discovery + stale sweep) |
| `reports/<date>/` | Per-round evidence: results JSON, image digests, diffs, generated reports (first round: `2026-11-01`) |

## Discipline

- **Expectations**: existence/acceptance expectations come from the shared
  catalog (v2.6.26 reference behavior, ported from the first round). Suites may
  diverge **only** through `overrides.json` — every override is visible in git
  and echoed in round results.
- **Goldens**: response *shapes* of **accepted responses only** (envelope
  `code === 0`; recursive key sets + types, volatile fields stripped) — never
  raw values, never rejection envelopes (error text drifts across versions and
  products; rejections live in the round results). Enforced by
  `suites/goldens-integrity.test.mjs`. Frozen only after a capture round is
  reviewed; `verify` mode treats any drift as a finding.
- **Credentials**: `ZILLIZ_UAT3_API_KEY` etc. are read from the environment and
  never printed, logged, or persisted into results.
- **UAT safety**: only resources named with the suite prefix (`uatdp_*`,
  `cpz_*`) are created and deleted inside a round; pre-existing clusters,
  projects, integrations are read-only. Residual sweep at round start removes
  prefixed leftovers from crashed rounds.
- **milvus-cell lifecycle**: each round creates its vCluster (if absent) and
  deletes it afterwards; auth failures exit 10 (`TOKEN_EXPIRED`) and never
  retry — re-login (`milvus-cell status` + browser) is manual.

## Running a round

```bash
# milvus anchors (capture first round of a suite; verify afterwards)
runner/cell_round.sh --mode capture --anchors v2.6.26,v3.0.5
runner/cell_round.sh --mode verify  --anchors v3.0.5

# UAT3 (control plane + dataplane)
runner/uat_round.sh --mode capture

# M/Z incompatibility list + cross-track quantification
diff/mz-diff.mjs --milvus reports/<date>/results-milvus-v2.6.26.json \
  --uat reports/<date>/results-uat-dataplane.json \
  --out reports/<date>/mz-incompat.json --md reports/<date>/mz-incompat.md
diff/cross-track.mjs --inventory inventory/schema-inventory.json \
  --skeleton-2626 reports/2026-11-01/skeleton-2626.json \
  --skeleton-305 reports/2026-11-01/skeleton-305.json \
  --milvus-results reports/<date>/results-milvus-v2.6.26.json \
  --out reports/<date>/cross-track.json --md reports/<date>/cross-track.md
```

Schedule: weekly full round (Tuesday) + a daily check that runs affected
families for any open PR touching `meta/openapi/**` fragments (see the
`.zcode` automations; wired in 2026-11-04).
