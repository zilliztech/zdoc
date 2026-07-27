# ZDoc Localize 0.2.0 Engine Integration Release Checklist

Status: release candidate prepared locally on 2026-07-27. Tasks 7–12 are in scope. Tasks 13–14 dogfood have not run. No Git tag, push, npm publish, Base mutation, receipt mutation, or Feishu document write is authorized or performed by this checklist.

The concrete Engine `0.1.1` / schema-1 references in the original adoption plan were superseded before implementation by the released Project A contract `feishu-docx-engine@0.2.0` / schema 2.

## Candidate identity

- Package and CLI: `zdoc-localize@0.2.0`.
- CLI capabilities schema: `1`.
- Skill: `zdoc-localization@1.1.0`.
- Skill CLI range: `>=0.2.0 <0.3.0`.
- Exact runtime dependency: `feishu-docx-engine: 0.2.0`.
- Engine prepared-batch schema: `2`.
- Branch: `codex/zdoc-localization-engine-adoption-v2`.
- Task 12 base commit: `bdb381e17` (`docs(localize): document shared Docx engine workflow`).
- Release source commit: the future reviewed commit or tag containing this checklist; resolve it before any external release action.

Supported Engine capabilities:

- `nested-list-create-v1`
- `native-table-create-v1`
- `whiteboard-overwrite-v1`
- `partial-write-evidence-v1`
- `batch-operation-output-refs-v1`
- `whiteboard-create-copy-v1`
- `contiguous-range-replace-v1`

## Pinned toolchain and external dependency facts

Candidate packages were generated twice with:

```text
Node.js v24.15.0
pnpm 10.11.0
npm 11.18.0
lark-cli version 1.0.73
```

The `lark-cli` fact is a local version check only. Credential-free verification used offline doctor and did not call a Feishu mutation command.

Project A Engine release identity:

| Fact | Value |
| --- | --- |
| Package | `feishu-docx-engine@0.2.0` |
| Engine schema | `2` |
| npm integrity | `sha512-gwPzPTPj2/uZqo+pft9Az5hUb+66Aapg/9dP/IB7MTScALtKpGtcSzPRDRUUUbPpQcNDHgBYF6s85D2Ao0R2iQ==` |
| npm shasum (SHA-1) | `b415ea6bbfb5cab12138408628c4c55e1a0bd3ee` |
| Tarball SHA-256 | `a2aedf2a04ca554a8ca92aed448c28c6a73fb4add8f1c54b9fe86f29596512ff` |
| Project A tag | `v0.7.0` |
| Project A commit | `4cd53ad235c0ce6e05e01f2fc931194414b14d03` |

## Registry contract

The registry schema has no independent version field. Its release identity is the SHA-256 of the canonical JSON for `registry schema --format json`'s `data` value, excluding the success envelope and output whitespace.

- Canonical bytes: `5773`.
- Canonical SHA-256: `792285b9e93a2f1459c8c18e532b5a5a1e395a9fa6f0769419b4e3544899a657`.
- `document_pairs`: 14 fields, 3 views.
- `glossary`: 11 fields, 3 views.
- `localization_runs`: 16 fields, 3 views.

The exact hash is pinned by `lark-base-schema.test.ts`.

## Candidate artifact identities

Two independent `pnpm pack` runs were byte-identical under the pinned toolchain.

The tarball format is toolchain-sensitive: the repository's default Node 23/npm 10 installation produces different bytes. `scripts/verify-zdoc-localize-release-artifacts.mjs` therefore rejects any toolchain other than the exact versions above before comparing real double-pack output with these identities.

| Artifact | SHA-1 | SHA-256 | Integrity / tree hash |
| --- | --- | --- | --- |
| `zdoc-localize-0.2.0.tgz` | `f6e21188aea88952d0c2c2ae3d36f3b79369e35d` | `74d66198476bb69dfcb78398bcabe381e8593b2d46d8f33af2bf915368ff475c` | `sha512-iykpK+U8mKaEE2KXI1myS20Rj6GSb9jCJDwZi8diHXF/ARv9A3JBmn9SkdSK88NF+JAGEOsJdmDoppDnUBMkCg==` |
| `skills/zdoc-localization` | n/a | `d5d6b46f8eb1fd96a0f2ca515d3760d45079b7d6d6ea9796b02f0ce29c004f53` | deterministic sorted path-and-content tree hash |

The package includes `dist`, `README.md`, and `CHANGELOG.md`. It excludes tests, run state, credentials, receipts, dogfood output, and the retired compatibility adapters.

## Contract gates

- Every document and Whiteboard mutation is owned by `feishu-docx-engine`; no compatibility writer or localization-internal `feishu-md-sync` executable path remains.
- Direct `lark-cli` document access is limited to a create-only target gateway, a legacy DocxXML reader, and a Whiteboard raw reader. Base, Drive, and doctor retain their scoped calls.
- Remote English and remote Chinese snapshots plus block correspondences form the localization baseline; local Markdown is not a localization state input.
- Lists and native tables use immutable topology plus editable structured slots.
- Apply approval binds the reviewed content to the exact Engine schema-v2 batch fingerprint and current target snapshot.
- Partial writes preserve the prepared batch, immutable pre-write snapshot, per-operation journal, verified evidence, and checkpoint.
- Legacy receipt migration and reverse planning fail closed and route writes through separately previewed Engine batches.
- Native synced references remain manually provisioned and verify-only. Whiteboards remain untranslated raw mirrors with canonical-hash verification.

## Credential-free verification

Run from the exact candidate source with the pinned toolchain:

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize pack:check
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
node scripts/hash-skill-tree.mjs skills/zdoc-localization
node scripts/verify-zdoc-localize-release-artifacts.mjs
git diff --check
```

Expected and observed:

- Typecheck passes.
- 24 test files and 173 tests pass.
- Build passes after cleaning ignored `dist` output.
- Artifact guard passes with 167 tarball entries.
- Clean-consumer install resolves `feishu-docx-engine@0.2.0`, reports Engine schema 2, and passes offline doctor/capabilities checks.
- Skill compatibility reports no missing command, feature, safety route, or version-contract mismatch.
- The release artifact verifier performs two real packs, rejects a mismatched toolchain, and compares the tarball and Skill bytes with the recorded hashes.
- No `zdoc-localize-*.tgz` candidate remains in the repository working tree.

## Known limits and deferred work

- Engine `0.2.0` has no safe resume/rebase mutation API; `resume_possible` remains read-only recovery guidance.
- Feishu OpenAPI does not create native synced-code references; users replace protected placeholders before `manual verify`.
- Tasks 13–14 remain pending: no Hugging Face review/apply dogfood has run against this candidate.
- This repository does not yet contain a complete protected npm publishing workflow, provenance manifest, or tag policy for `zdoc-localize`.

## External-action gate

Before any tag, push, npm publication, installed-Skill replacement, Base update, or Feishu document write:

1. Review the exact candidate commit and rerun the credential-free suite from a clean checkout.
2. Recompute and compare package and Skill hashes after any source or documentation change.
3. Complete Tasks 13–14 through their independent review and apply approval gates.
4. Obtain separate explicit user approval for the exact external action.

Do not infer release, dogfood, or Feishu-write approval from completion of Tasks 7–12.
