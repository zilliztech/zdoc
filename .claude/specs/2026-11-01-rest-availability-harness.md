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
  `pnpm rest:availability` (operator script, deliberately not under the test:* prefix) — operator-triggered, live endpoints only:
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

## P2 (landed 2026-11-01, same day)

- `rest-zilliz-priors` CLI: static prior matrix from fragments (x-beta,
  x-include-target) + zilliz-cloud spec presence (control plane only —
  /v2/vectordb/* is cluster-served and never in the control spec) + the
  release-notes tier survey. First derivation: GA 149, PUBLIC_PREVIEW 10,
  NOT_AVAILABLE (milvus-only) 12, ON_REQUEST 3, PRIVATE_PREVIEW 1,
  control-plane CANDIDATE_NOT_IN_SPEC 65 (legacy v1 surface, review list).
- `rest-availability-zilliz --env uat3|prod`: read-only control-plane probes
  (projects, clusters, on-demand list, negative control). Both environments:
  0 FAIL; on-demand (x-beta PUBLIC) confirmed reachable from an ordinary key;
  **finding: GET /v2/projects/{projectId}/regions returns an internal error
  on BOTH environments** (kept as a recorded observation — spec-documented
  endpoint, worth a bug report to the cloud team).
- Transport note: the zilliz gateway rejects Node's TLS fingerprint with 401
  (curl passes on h1 and h2), so zilliz probes ride a curl-backed fetchImpl
  with credentials in a 0600 curl config file — never argv.
- Data-plane vehicle RESOLVED (user confirmation: UAT3 incurs no cost, all
  plans creatable): dedicated cluster `in01-f93145f52dca837`
  (Capacity-optimized 1CU, aws-us-west-2) created via `createDedicated` and
  reached RUNNING; data-plane endpoint
  `https://<id>.aws-us-west-2.vectordb-uat3.zillizcloud.com:19539` (UAT port
  19539) with Bearer API-key auth via the curl transport.
- `rest-availability --zilliz uat3` runs the full data-plane suite against a
  zilliz cluster. First matrix `zilliz-uat3-dedicated-v26`: 130 cases,
  0 FAIL, 0 NO-EFFECT — verdict distribution identical to the self-hosted
  milvus-2.6.26 run (130/130 identical verdicts), and differing from
  milvus-3.0.5 in exactly the 7-case 3.0 feature set. This is the first
  machine confirmation that the self-hosted vCluster environment is a
  faithful proxy for the zilliz data plane at the same Milvus version.
- Serverless matrix point not creatable on UAT3: aws-us-west-2 rejects
  `createServerless` with "region does not support serverless plan" (96020);
  the gcp playground project lacks the create ACL. Prod-side serverless
  probing stays read-only.
- Milvus v3.0.x preview on zilliz: no upgrade/preview endpoint exists in the
  spec — "Try Preview Features" (release-notes-2610) is console-side, so the
  3.0-preview data-plane matrix needs console access or an internal API;
  recorded as the next vehicle decision.

## Serverless matrix point (landed same day, cluster deleted after use)

User-provided project `proj-03b45fcdd7d4f3784e6dd0` (Default Project,
Enterprise, regions aws-us-west-2 + gcp-us-west1) accepted the key's
`createServerless` — cluster `in05-9c8bfa8775548f9` @ gcp-us-west1, endpoint
`https://<id>.serverless.gcp-us-west1.cloud-uat3.zilliz.com` (no port).
Suite adaptations landed with this run: rate-limit retry in the runner call
layer (serverless throttles writes), DB2-optional suite (databases/create is
denied on serverless even for the cluster admin account —
PrivilegeCreateDatabase), and a `ZILLIZ_DP_TOKEN` bearer override for
cluster-account credentials.

Matrix `zilliz-uat3-serverless-v26` — headline finding: **the serverless data
plane is Milvus 3.0-generation**, not 2.6.x:

- vs `milvus-3.0.5`: 123/130 identical verdicts; the 7 deltas are 5× the
  dbName family (platform denies multi-database on serverless) + hybrid
  `functionChains` explicitly rejected ("not supported for hybrid search
  yet" — a 3.0-line message; open-source 3.0.5 supports it) + the setup row
- vs `zilliz-uat3-dedicated-v26` (2.6.x): orderByFields actually sorts,
  searchAggregation returns buckets, functionChains limit op applies,
  groupByFields aggregation works — the whole 3.0 feature set lights up

First `x-zilliz-cluster-types` evidence set (same REST surface, cluster type
decides generation and limits):

| capability | dedicated (default) | serverless |
|---|---|---|
| Milvus data-plane generation | 2.6.x | **3.0-generation** |
| databases/create (dbName) | ✓ | ✗ platform-denied (even cluster admin) |
| ANN nq upper bound | 16384 | **10** |
| hybrid functionChains | unsupported (2.6 silent) | explicit "not supported yet" |

Cluster deleted via `DELETE /v2/clusters/{id}/drop` (30-day recycle bin).
Note: the spec has no plain `DELETE /v2/clusters/{id}` route — drop is the
documented form.


## P3 (landed 2026-11-01): release-track coverage in the drift watchdog

The daily drift watchdog now derives the managed minor-track set from the
lifecycle values the fragments actually carry and compares it with milvus
upstream tags. A minor line newer than the oldest managed track that no
fragment manages (a future `3.1.x`, or a `2.7.x` between managed lines)
turns the report card red with an adoption action — adopt the lifecycle
track and add an availability matrix before refresh lanes attribute content
to it. Historical lines below the managed floor (2.5.x and older) are
expected to stay unmanaged and never alert. Live suites remain
operator-triggered by design; CI only guards the hermetic machinery.
