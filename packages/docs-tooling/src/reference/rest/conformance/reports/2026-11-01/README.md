# First live round archive — 2026-11-01

Frozen evidence of the first live verification round for the REST reference:
130 param-level test cases built from the PR #1005 fragment request bodies
(pin `5f7e112`) and executed against **Milvus v2.6.26** standalone deployed on
a milvus-cell vCluster (REST v2 on `:19530`, same port as gRPC; 9091 only
serves healthz/metrics). Archived verbatim from the ephemeral `/tmp` workspace
where the round ran; this directory is now the durable home.

## Contents

| File | What it is |
|---|---|
| `rest-v2-param-tests.mjs` | The 130-case runner (data-driven request probes: positive / negative / effect verification) |
| `results.json` | Raw per-case results with verdict counts (RECORDED 10 / PASS-EFFECT 63 / REJECTED 16 / REJECTED(record) 16 / PASS 25) |
| `REPORT.md` | Human report with the three mismatch categories: 文档不符 (doc wrong), master-pin 特性未接线 (master feature absent in the release), 服务端怪象 (server quirk) |
| `attribution.json` | Case → fragment/operation attribution |
| `added-paths.json` | Routes added by the PR #1005 fragment batch |
| `skeleton-2626.json` / `skeleton-305.json` | Route skeletons extracted from upstream `milvus-io/milvus` `internal/distributed/proxy/httpserver` (`/v2/vectordb` mount): 89 operations on v2.6.26 vs 113 on v3.0.5 |
| `archive.test.js` | Integrity test pinning the frozen shape (`node --test archive.test.js`) |

## Not archived (derivable or out of scope)

- `evidence-master.json` (2.5 MB) — master-source field evidence, derivable
  from the fragment pin `5f7e112`.
- 22 upstream source checkouts (`milvus-src-v2.6.14` … `milvus-src-v3.0.5`),
  `zilliz-openapi*` snapshots, `ApikeyService.java`, `track-verify/` scratch —
  re-derivable upstream clones and scratch space.

## Role in the verification program

This round is the seed for the REST reference live-verification suites
(`suites/milvus-2.6.26`, `suites/milvus-3.0.5`, `suites/uat-dataplane`,
`suites/uat-controlplane`) and its REPORT taxonomy is the review template for
future rounds: every diff must land in exactly one of the three categories
(doc wrong → fix fragments; master-pin ahead of release → version-track
ledger; server quirk → upstream feedback).
