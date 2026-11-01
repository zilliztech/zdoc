# Proposal: `x-zilliz-cluster-types` custom attribute

Status: ADOPTED (2026-11-01). Documented as CUSTOM_ATTRIBUTES §1.13 with the
manifests-locked value domain; the first evidence-backed mark
(`databases/create`, serverless-denied) is landed. Per-field rendering and
the additional validation guards below remain follow-ups.

## Problem

The zdoc REST reference documents the Zilliz Cloud data plane without recording
**which cluster types an operation or parameter actually works on**. Zilliz does
not version its REST surface (publication policy `latest`), but availability
varies by:

1. release maturity — GA vs public preview vs private preview
2. deployment option — serving cluster vs on-demand compute endpoints
3. cluster type (CU category) — serverless / performance-optimized /
   capacity-optimized / cost-optimized on SaaS, and the BYOC equivalents

Dimensions 1 and 2 already have attributes (`x-beta`, `x-base-urls` +
`x-base-url-target`). Dimension 3 has nothing. Evidence from 2026-11-01:
`zilliz-cloud` and `zilliz-cloud-config` contain no central registry mapping
public endpoints to cluster types — gating lives inside individual controllers
and per-CU-type Milvus instance configuration — so the only durable way to
record the matrix is to test it and keep the result with the contract.

## Proposed attribute

```json
{
  "x-zilliz-cluster-types": ["memory", "disk", "tiered", "byoc-memory", "byoc-disk", "byoc-tiered"]
}
```

- **Name.** Follows the existing zilliz-scoped naming precedent
  (`x-base-urls` is honored only for `target === 'zilliz'`; this attribute is
  likewise zilliz-only). Kebab-case, plural, no vendor abbreviation beyond
  `zilliz` itself.
- **Value domain** (closed enum, locked to upstream taxonomy):
  `serverless`, `memory`, `disk`, `tiered`, `byoc-memory`, `byoc-disk`,
  `byoc-tiered`. Source: `zilliz-cloud-config/milvus-instance/manifests/` —
  category × deployment. BYOC has no serverless category; the manifests are
  the authority and the enum must be regenerated if the manifests change.
- **Semantics.** Whitelist array, mirroring `x-include-target`:
  - absent ⇒ available on all cluster types (fail-open default, same
    philosophy as `x-beta` defaulting to `FALSE` for v2)
  - present ⇒ the element applies only to the listed types
- **Placement scope.** Same as `x-include-target`: operations, parameters,
  and schema properties. Operation-level marks the endpoint; property-level
  marks a single parameter/field (e.g. a param honored only on serverless).
- **Build/runtime behavior.** Phase 1 (this proposal): machine-readable only —
  consumed by the availability test matrix and the static prior-derivation
  tool; stripped by the existing `x-*` public-spec stripping, so no public
  artifact changes. Phase 2 (separate decision): `RestSpecs` rendering, likely
  as a filter chip row or per-property badge; and/or `x-admonition` text in the
  interim.

## Why these values and not others

- **Not the full manifest names** (`BYOC-disk-16cu` × 16 size variants):
  size tiers are capacity, not API surface. The `category`-level taxonomy is
  what the REST surface can conceivably vary by.
- **Not a deployment enum** (`saas`/`byoc` as a separate attribute): the
  `byoc-` prefix encodes deployment in the same value, halving the attribute
  count and matching how the manifests and the console name CU types.
- **Not reuse of `x-include-target`**: that attribute filters by publication
  target at build time and is consumed today; overloading it with cluster-type
  semantics would break its contract.

## Grounding in upstream sources

| Source | Role |
|---|---|
| `zilliz-cloud-config/milvus-instance/manifests/*.yaml` | closed value domain (category, enable flag, supportedRegions) |
| `zilliz-cloud-config/milvus-instance/{category}/{cuType}/...` lookup chain | per-cluster-type Milvus parameter availability — the static prior for parameter-level marks |
| `zilliz-cloud` control-plane controllers | runtime gating that the test suite verifies (no central registry exists) |

## Validation to land with acceptance

1. Enum guard: an Ajv-validated closed enum in the fragment tooling; unknown
   values fail closed (matrix-gap style registration in the test matrix).
2. Pairing rule: the attribute is rejected on an element that also carries
   `x-include-target: ["milvus"]` (milvus-only content cannot be
   cluster-typed for zilliz).
3. Consistency rule: a property-level mark may only narrow (subset of) its
   operation's mark.
4. Test-matrix registration: the availability suite reads the attribute as the
   expected value and files diffs as review proposals, never auto-writes.

## Relationship to testing (the P1/P2 tracks)

The attribute is the **output format** of the availability test program:

- static prior: spec presence + `x-beta` + `milvus-instance` config-as-code
  produce candidate marks;
- empirical confirmation: the milvus suite (per release track, vCluster) and
  the zilliz suite (UAT + prod, read-only) run the per-parameter cases and
  confirm or refute the candidates;
- confirmed marks land through reviewed PRs exactly like lifecycle evidence.
