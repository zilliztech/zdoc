# REST upstream P2 — milvus source-tree extractor and reconcile pilot (2026-10-29)

Status: implemented on `feat/rest-upstream-pipeline` (PR #906, P2 scope of
`.claude/specs/2026-10-28-rest-upstream-pipeline-design.md`). This report is the
P2 acceptance evidence: the skeleton extractor, the Node-side skeleton gate,
structure-only diffing, and a full reconcile pilot against the real pinned
milvus checkout.

## 1. What landed

| Piece | File(s) | Notes |
|---|---|---|
| Go skeleton extractor | `packages/docs-tooling/src/reference/rest/upstreamDiff/milvus/extractor.go` | Single file, stdlib-only, `go run` without a module (decision D3). Parses the route table in `(*HandlersV2) RegisterRoutesToV2` and the package structs; emits the skeleton JSON. |
| Skeleton contract | `packages/docs-tooling/src/reference/rest/contracts/rest-upstream-source-tree-skeleton.schema.json` | Draft 2020-12; structural truth only (no prose/response shapes). |
| Node gate + converter | `packages/docs-tooling/src/reference/rest/upstreamDiff/sourceTree.js` | Ajv validation, extractor invariants re-checked (ordering, ref integrity, mount prefix), converts the skeleton into the OpenAPI document shape the diff consumes (`x-milvus-handler` / `x-milvus-request-struct` evidence). |
| Structure-only diff mode | `upstreamDiff/diff.js` | `source.artifact.kind === 'source-tree'` skips summary/description/parameter/response comparison (the skeleton carries none of those; fragments win prose) and keeps operation presence, deprecation, request fields, constraints, and required membership. |
| Cross-fragment component resolution | `upstreamDiff/diff.js` | Dangling fragment `$ref`s resolve through the merged component view of all fragments, mirroring the publication assembler; variants that are API-truth equivalent (differ only in `x-*`/`description`) are tolerated with the first donor in fragment file order; API-truth conflicts fail closed (`REST_UPSTREAM_SHARED_SCHEMA_CONFLICT`). `$ref` parameters are resolved for comparison. |
| CLI wiring | `rest-upstream-diff` / `rest-upstream-prepare` | `--skeleton <path>` for source-tree sources (mutually required with the source kind); `--spec` stays required for spec-file sources (`REST_UPSTREAM_SPEC_REQUIRED`). |
| Watchdog classification | `scripts/rest-upstream/drift-watchdog.js` | The `pin-behind` placeholder is gone: on drift, source-tree sources download the non-test `.go` files of the pinned directory at HEAD, extract the skeleton with the vendored extractor, and classify through the same diff (`REST_UPSTREAM_WATCHDOG_EXTRACT_FAILED` when Go is missing). |
| Watchdog workflow | `.github/workflows/rest-upstream-drift-watchdog.yml` | `actions/setup-go@v6` pinned to 1.27, installed only here (and later in the refresh workflow), never in the regular build chain. |
| Tests | `upstreamDiff/*.test.js`, `upstreamDiff/milvus/{extractor.go,testdata/}` | 61 focused tests. The extractor suite runs the real `go run` against a hermetic fixture set with a byte-compared golden skeleton and three fail-closed negative fixtures; without Go on PATH it reports an explicit skip. |

## 2. Extractor shape decisions

- Minimal JSON schema vocabulary only: `{type}` for primitives, `{type, items}`
  for slices, `{type, properties, required}` for structs, `$ref` for named
  structs, `{}` for untyped (`interface{}`/`any`/`json.RawMessage`). Formats,
  bounds, `additionalProperties`, and map value types stay out of the skeleton:
  they are doc territory, and emitting them would flood the diff with
  doc-design noise (verified during the pilot: a first cut with
  `additionalProperties`/`format` produced 346 upstream-modified entries,
  324 of them description noise; the minimal vocabulary drops the same diff to
  22 substantive entries).
- `binding:"required"` maps to the `required` array. Unlike the cloud spec's
  suspected generator loss (decision 9), gin enforces these at runtime, so the
  signal is authoritative — but relaxation entries still carry
  `requiresConfirmation: required-relaxation`.
- Deprecation is inherited from `// deprecated` comments on the action path
  constants (one hit at the pilot pin: `get_progress`).
- Unknown path identifiers, external package types, missing route table, and
  unreachable-but-unsupported shapes in the route closure all fail closed.
  Package structs unreachable from route requests never enter the skeleton
  (the httpserver package carries helpers the API surface does not expose).
- Custom `UnmarshalJSON` implementations are out of scope (declared struct
  fields are extracted as-is); response shapes (`gin.H`) are out of scope.
  Both are recorded as P4 flow-recording candidates.

## 3. Pilot: reconcile against the real pinned checkout

Command sequence (evidence root `tmp/rest-upstream-p2-milvus/`):

```bash
go run packages/docs-tooling/src/reference/rest/upstreamDiff/milvus/extractor.go \
  --dir <checkout>/internal/distributed/proxy/httpserver --out skeleton.json
node packages/docs-tooling/src/reference/rest/index.js rest-upstream-diff \
  --source milvus-data-plane --skeleton skeleton.json --out diff-pin
node packages/docs-tooling/src/reference/rest/index.js rest-upstream-ledger-bootstrap \
  --from-diff diff-pin/diff.json --out ledger-proposal-milvus.json
```

Pin `6d833a672807e7c75c490c9383f68a42ed1142ea` (the lock's milvus pin), local
clone of `internal/distributed/proxy/httpserver` fetched at that commit. The
extractor produced **113 operations and 84 route-reachable components** — the
operation count matches the route table exactly (113 `router.*` registrations,
all POST). The diff summary:

| Category | Count | Reading |
|---|---|---|
| upstream-added | 11 | Operations in code, absent from the docs: the whole snapshots family (7), `entities/advanced_search`, `jobs/snapshot/export/describe`, `quotacenter/describe`, `segments/describe`. Ledger candidates (pending). |
| fragment-only | 13 | Exactly the v1 surface (`/v1/vector/...` import/collection/vector ops) — expected: the v2 extractor does not cover v1. Bootstrap classifies them `external`. |
| upstream-added-field | 24 | Fields the code accepts that the fragments do not document: `partitionNames` on 8 collection/partition ops, `functionChains`/`searchAggregation` on `hybrid_search`, `orderByFields` (search), `groupByFields` (query), `timestamp` (indexes describe/drop), `config` (resource groups), `description` (roles), `dbName` (users list), `privileges`, `fieldOps`, `collectionName` (import list). |
| unattributed | 9 | Union fields covered by no scenario branch: `collections/create` new fields (`externalSource`, `externalSpec`, `consistencyLevel`, `properties`, `vectorFieldType`) and all four `collections/fields/drop` fields. Branch-attribution candidates for the agent + human review. |
| upstream-modified | 22 | 19 required (15 `required-relaxation` need R&D confirmation; 4 tightenings are adoptable), 2 real type drifts (`entities/insert data` absent→array, `entities/upsert data` object→array), 1 `required-array-missing-upstream` (`jobs/import/list`). |
| zdoc-only | 48 | Fragment-side design: 23 fields the code does not declare (doc-layer extras), 21 constraint extras (default/enum/format/length), 1 type extra, 3 response-status/param shapes. Non-substantive by design. |

Diff digest: `sha256:065434aa25fbd3ceeac4882768d05d4b7e84a0dc3b04ee1bdb4574318bd67acb`.
Duplicate-looking entries (`collections/create collectionName` twice,
`jobs/import/create files` twice) are the scenario-branch pairs — one entry per
`x-tab-label` branch, ids distinct by the branch component.

The ledger bootstrap generated **26 proposals** (`ledger-proposal-milvus.json`):
13 `external` (v1 surface) + 13 `deferred` (the 11 upstream-added operations
plus the 2 unattributed-request-body groups). It is **not merged** — per the
P1 convention, the 54-entry cloud ledger merged only after human review, and
this one waits for the same.

## 4. Reconcile rule verification (design §6.2)

- Code wins structure: the two `data` type drifts and the 24 uncovered fields
  are exactly the code-side truth the fragments lacked.
- Fragments win prose/design: with the skeleton carrying no prose, zero
  description/summary entries fire for the milvus source; scenario branches
  stay untouched (`fields/drop` branch comparison kept per-branch truth);
  fragment-side constraint extras land in `zdoc-only`, never in proposals.
- Merged skeleton = branch union: `collections/create`'s branched body
  compared against the upstream union, with uncovered union fields surfacing
  once as `unattributed` (user decision 1 from 2026-10-28).

## 5. Known limitations

- **Single registration point (post-review hardening, 2026-10-29).** The
  extractor only sees routes registered inside `RegisterRoutesToV2`. A `router`
  handed to a helper from that body would silently hide those registrations
  (upstream additions never surfacing; relocated documented operations
  degrading to fragment-only and absorbed as external). That shape now fails
  closed with `REST_UPSTREAM_EXTRACT_ROUTER_DELEGATED`; the real pin was
  re-extracted after the change and is byte-identical (113 operations / 84
  components), so the current upstream shape triggers no false positive.
  A `registerGroupRoutes(router)`-style delegation in a future upstream is a
  deliberate extraction change, not a silent gap.
- The skeleton pins the source checkout by commit only (no content digest —
  the lock deliberately carries no `contentSha256` for source-tree sources).
  Digest-pinning the skeleton at bump time is a P3 option if replay needs it.
- Field/operation descriptions in Go comments are not extracted; the refresh
  agent therefore gets no upstream prose hints for the milvus source (P3 can
  attach struct/field comments to the staging evidence if the agent needs
  them).
- Watchdog source-tree classification runs `go run` (compile per invocation,
  ~2s); acceptable at daily cadence.
- `go run` in the extractor test suite is skipped where Go is absent (the
  committed golden + fixture negative tests still pin the Node-side contract;
  the watchdog/refresh lanes exercise the extractor with Go installed).

## 6. Follow-ups (P3, per design §11)

- Merge the reviewed milvus ledger bootstrap (user decision; same flow as the
  cloud 54-entry bootstrap). Until merged, the P3 T4 accounting gate fails any
  milvus refresh with the exact 11 undecided op keys — by design.
- First agent-driven milvus refresh rehearsal through `rest-upstream-prepare`
  + the codex agent (needs secrets; shared with the P1 refresh rehearsal). The
  refresh workflow gained the source-tree lane in P3, so the rehearsal is a
  plain dispatch (optionally with `lifecycle_track`).
- ~~Lifecycle attributes (`x-added-at`/`x-last-modified`/`x-deprecated-since`)
  suggestions for data-plane changes (design §6.3).~~ Done in P3
  (`--lifecycle-track`; see the P3 report).
- ~~Refresh workflow source-tree lane (checkout → extract → prepare) when the
  first real milvus adoption is scheduled.~~ Done in P3.
