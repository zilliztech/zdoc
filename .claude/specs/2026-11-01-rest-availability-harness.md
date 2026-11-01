# REST data-plane availability harness (P1)

Landed 2026-11-01. Companion to `.claude/specs/2026-11-01-x-zilliz-cluster-types-proposal.md`
(the attribute this program ultimately feeds) and to the release-track
attribution commit on the milvus refresh branch (x-added-at marks).

## What landed

- `packages/docs-tooling/src/reference/rest/availability/suite.js` — the
  130-case data-plane suite (insert/upsert/delete/get/query/search/hybrid_search,
  one case per request parameter: positive, boundary, mutual-exclusion,
  required-violation, and observation-only "record" cases). Environment-
  agnostic: the runner injects `call`/`rec`; effects read back with Strong
  consistency and retry.
- `.../availability/runner.js` — call layer, verdict recorder, matrix writer.
  Verdict taxonomy: PASS-EFFECT / PASS / RECORDED / REJECTED(record) /
  REJECTED / NO-EFFECT / FAIL. Matrices are JSON documents keyed
  `{op, param, verdict, effect}` per case plus counts.
- `.../availability/cli.js` + `rest-availability` command on the REST CLI and
  `pnpm test:rest-availability` — operator-triggered, live endpoints only:
  `node packages/docs-tooling/src/reference/rest/index.js rest-availability
  --base http://127.0.0.1:19530 --label milvus-3.0.5 --out tmp/rest-availability`.
- `.../availability/availability.test.js` — hermetic: verdict mapping, effect
  retry, matrix shape, suite wiring. CI-safe (no network).

## Procedure (milvus track)

1. milvus-cell vCluster + helm standalone pinned to the release under test.
   v3.0.x needs resources above the vCluster LimitRange defaults
   (working set: requests 1c/2Gi, limits 4c/8Gi) and benefits from
   `extraConfig.http.requestTimeoutMs=120000`; v2.6.x runs on defaults.
2. `kubectl port-forward svc/milvus 19530:19530`.
3. Run the CLI with `--label milvus-<tag>`; the suite is idempotent (drops and
   recreates its fixtures, ~90 s).
4. Matrices land in `tmp/rest-availability/availability-<label>.json`
   (gitignored evidence root); cross-version transitions are diffed by
   `{op, param}`.

## Acceptance evidence (2026-11-01)

- milvus-2.6.26 (recorded before the harness landed, normalized into the same
  matrix shape): 130 cases, 0 FAIL, 0 NO-EFFECT.
- milvus-3.0.5: 130 cases, 0 FAIL, 0 NO-EFFECT.
- Transition diff 2.6.26 → 3.0.5: exactly 7 verdict flips, all in the
  3.0-marked feature set — machine confirmation of the `x-added-at: 3.0.x`
  attribution:
  - REJECTED(record) → PASS-EFFECT: `query groupByFields(+aggregation)`,
    `hybrid_search functionChains(merge chain)`
  - PASS-EFFECT → REJECTED(record) (silent acceptance → correct validation):
    `orderByFields(badField)`, `groupByFields(no agg output)`,
    `functionScore+functionChains(mutual)`, `functionChains(badStage)`,
    `searchAggregation(+offset)`
  - Same-verdict behavior flips recorded in the matrices: orderByFields desc
    now sorts, functionChains limit op now trims, searchAggregation now
    returns buckets/aggTopks, insert fieldOps PATH_REPLACE accepted.
- Behavioral notes captured for the fragment review: v3.0.5 insert/upsert
  partial-update still requires full rows (clearer errors than 2.6.26);
  upsert `fieldOps.path` rejects with a path-format error while insert accepts
  it (asymmetry to raise with upstream).

## Next (P2)

Zilliz track on the same runner: control-plane/data-plane endpoints from the
`.env` `# Zilliz` block (UAT3 + prod, prod read-only), matrices labeled by
`{env, deployment, clusterType}`, feeding `x-beta` confirmation and the
proposed `x-zilliz-cluster-types`.
