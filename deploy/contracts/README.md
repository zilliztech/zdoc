# Jenkins release contracts

This directory defines the auditable data boundary between this repository and the externally managed `vdc-jenkins` release system. It does not contain or replace Jenkins Groovy, credentials, registry access, approval policy, or environment configuration; those remain owned by `vdc-jenkins`.

## Four pipelines

| External pipeline | Site | Build command | Responsibility |
| --- | --- | --- | --- |
| English UAT | `en` | `pnpm build:en` | Build and publish immutable UAT evidence |
| English Prod | `en` | `pnpm build:en` when rebuilding | Rebuild a requested SHA or promote a verified UAT image |
| Chinese UAT | `zh-CN` | `pnpm build:zh-CN` | Build and publish immutable UAT evidence |
| Chinese Prod | `zh-CN` | `pnpm build:zh-CN` when rebuilding | Rebuild a requested SHA or promote a verified UAT image |

Every record fixes `sourceRepository` to `zdoc`, uses a lowercase 40-character Git SHA, records an immutable registry digest, and identifies the producing `vdc-jenkins` build. The Chinese release contract has no build-time or runtime dependency on `zdoc_cn`.

## Prod modes

`rebuild` records the requested source SHA, same-site and same-SHA UAT evidence digest, and the resulting Prod digest. Jenkins builds the site payload using the matching command above.

`specified-image` accepts an operator-provided image reference. Before approval, Jenkins must resolve a tag to an immutable digest and verify that the digest is backed by UAT provenance for the same site and source SHA. Promotion reuses the verified image payload; it must not rebuild it. The record preserves the operator reference, UAT source digest, and final deployed digest.

Rollback is a constrained specified-image deployment. The target digest must be the final digest of an existing successful Prod release record for the same site. An arbitrary registry digest is not a valid rollback target.

## Verifier

`verify-image.mjs` exports pure verification functions with an injectable image-reference resolver. Its CLI accepts only JSON files beneath an explicit `--root`; absolute paths, path traversal, unknown options, extra record fields, and malformed identities fail closed. The CLI's specified-image command consumes a checked-in or Jenkins-generated resolution map and never contacts a registry or network itself.

Examples:

```sh
node deploy/contracts/verify-image.mjs verify-record \
  --root release-inputs \
  --record prod-record.json

node deploy/contracts/verify-image.mjs verify-specified-image \
  --root release-inputs \
  --record prod-record.json \
  --uat-records uat-records.json \
  --resolutions resolved-images.json
```

`release.schema.json` is the strict machine-readable record schema. `release-record.example.json` shows a successful Chinese specified-image promotion.

## Path filters

`path-filters.json` describes the minimum validation fan-out used by `vdc-jenkins`:

- Shared application code, packages, lock/workspace files, the manual registry, and shared Reference generator changes require both site checks.
- Site-owned content, profile, and deploy changes require only that site's checks.
- Canonical English Reference changes require the English check plus Chinese Reference translation-coverage validation.

The filters are auditable policy data. Jenkins remains responsible for evaluating them and applying credentials and approvals.
