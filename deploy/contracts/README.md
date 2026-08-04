# Jenkins release contracts

This directory contains repository-owned build and release data contracts consumed by the externally managed `vdc-jenkins` release system. It does not contain or replace Jenkins Groovy, credentials, registry access, approval policy, environment configuration, target orchestration, or deployment behavior.

## Repository build interface

UAT and Prod use the same repository build interface after Jenkins checks out the selected branch.

| Target | Build command | Dockerfile | Content |
| --- | --- | --- | --- |
| `en` | `pnpm build:en` | `deploy/en/Dockerfile` | English and Japanese |
| `zh-CN` | `pnpm build:zh-CN` | `deploy/zh-CN/Dockerfile` | Chinese |

Jenkins may select either target or both. The targets are independently invocable and independently failing. Repository container builds accept only `ZDOC_SHA`, `ZDOC_SITE`, and `JENKINS_BUILD_ID`; branch selection, environment selection, image naming, execution order, retry, deployment, and approval remain Jenkins-owned.

## Release records

Every record fixes `sourceRepository` to `zdoc`, uses a lowercase 40-character Git SHA, records an immutable registry digest, and identifies the producing `vdc-jenkins` build. The Chinese release contract has no build-time or runtime dependency on `zdoc_cn`.

## Prod modes

`rebuild` uses `sourceSha` as the single requested source revision, records the same-site and same-SHA UAT evidence digest, and records the resulting Prod digest. There is no second requested-SHA field that can drift. Jenkins builds the site payload using the matching command above.

`specified-image` accepts an operator-provided image reference. Before approval, Jenkins must resolve a tag to an immutable digest and verify that the digest is backed by UAT provenance for the same site and source SHA. Promotion reuses the verified image payload; it must not rebuild it. The record preserves the operator reference, UAT source digest, and final deployed digest.

Rollback is a constrained specified-image deployment. The target digest must be the final digest of an existing successful Prod release record for the same site. An arbitrary registry digest is not a valid rollback target.

## Verifier

`verify-image.mjs` exports pure verification functions that require a `trustedEvidenceProvider`. Approval code cannot pass raw UAT arrays, Prod history, or tag resolutions from the request. The provider supplies authenticated UAT records, immutable tag-to-digest resolution, and successful Prod history.

The CLI has two non-overlapping filesystem trust domains:

- `--root` is the request root. It contains only the record or rollback request awaiting approval.
- `VDC_JENKINS_EVIDENCE_ROOT` is the trusted evidence root. It is an external, kernel or container-runtime read-only mount created and permission-controlled by `vdc-jenkins`. Jenkins supplies the root and its fixed `evidence/` directory as mode `0555`, and `evidence/uat-records.json`, `evidence/resolved-images.json`, and `evidence/prod-records.json` as mode `0444`.
- `VDC_JENKINS_EVIDENCE_PROTECTION=kernel-read-only-mount` is a mandatory external attestation on every approval-verifier invocation. Any other value, including `chmod-only`, fails closed.

Before the verifier starts, `vdc-jenkins` must finish generating or replacing the evidence tree, authenticate registry resolution and release attestations, and expose it through a kernel or container-runtime enforced read-only mount. The mount parent cannot allow the verifier process or a concurrent job to write or replace entries. `chmod-only` is not sufficient: modes `0555` and `0444` are defense-in-depth checks after the mandatory external mount attestation. This repository cannot portably inspect mount flags and does not claim to do so; the exact environment value defines the externally attested invocation contract. This repository does not own registry credentials, attestation keys, Jenkins Groovy, or the evidence-store permissions.

The verifier additionally rejects any write bit on the trusted root, its internal ancestors, or the three files. A missing trust root or protection declaration, an overlap with the request root, a failed or pending UAT record, duplicate producer identity, malformed evidence, or request-side lookalike evidence fails closed.

Both roots and every JSON file are read with canonical ancestor checks and `O_NOFOLLOW`. Trusted directories and files are pinned by device, inode, and mode before use, then rechecked before and after descriptor reads. The verifier never contacts a registry or network itself.

Examples:

```sh
node deploy/contracts/verify-image.mjs verify-record \
  --root release-inputs \
  --record prod-record.json

VDC_JENKINS_EVIDENCE_ROOT=/run/vdc-jenkins/zdoc-evidence \
VDC_JENKINS_EVIDENCE_PROTECTION=kernel-read-only-mount \
node deploy/contracts/verify-image.mjs verify-specified-image \
  --root release-inputs \
  --record prod-record.json
```

`release.schema.json` is the strict machine-readable record schema. `release-record.example.json` shows a successful Chinese specified-image promotion.

## Path filters

`path-filters.json` describes the minimum validation fan-out. Repository GitHub Actions consume it through `evaluate-path-filters.mjs`; externally managed `vdc-jenkins` pipelines can consume the same versioned contract when their owners implement the cutover. Rules are mutually exclusive and use explicit precedence: canonical English Reference, Chinese Reference translation state, site-owned English, site-owned Chinese, then shared inputs. Multiple matches fail closed, and unclassified paths conservatively run both site builds.

- Shared application code, packages, `.dockerignore`, lock/workspace files, build/provenance scripts, migration dependency inventories, and the manual registry require both site builds.
- Site-owned content, profiles, sidebars, generated sidebars, and deploy files require only that site's build.
- Canonical English Reference content, manifests, tooling, translation validation, and Reference scripts require both site builds plus Chinese Reference translation-coverage validation.
- The Chinese Reference translation manifest and retirement registry require the Chinese build plus translation-coverage validation.

The `site validation` GitHub Actions workflow is a read-only build gate: it does not deploy, use deployment secrets, publish documentation, or replace Jenkins approvals. After it passes, external Jenkins UAT may invoke either selected target through the repository build interface above. Jenkins remains responsible for registry access, deployment credentials, immutable UAT evidence, environment checks, and approvals.

## Daily revision waterline

The direct, grouped publication workflow runs three times daily and publishes to `dev`. Each English group derives its revision inventory from the repository's existing source snapshot, then checkpoints content and its waterline together. A metadata fetch failure marks the inventory incomplete and cannot authorize deletion.

Final verification pins one immutable Git SHA, validates the revision inventory and localization inputs, validates Chinese Reference and Tools coverage, and builds English, Japanese, and Chinese sites. Jenkins remains the deployment owner; this repository does not synchronize these results to `zdoc_cn`.

The watchdog is a read-only 24-hour freshness alert. It does not fetch, rerun, dispatch, deploy, or write repository content. To locate changed documents, open the publication run's revision report artifact: its comparison is authoritative, and “today” is evaluated in `Asia/Shanghai`.
