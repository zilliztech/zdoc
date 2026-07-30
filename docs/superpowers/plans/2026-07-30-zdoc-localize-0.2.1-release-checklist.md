# ZDoc Localize 0.2.1 Structured Fidelity Release Checklist

Status: release candidate prepared locally on 2026-07-30. No push, PR, tag, npm publish, installed-Skill replacement, Base mutation, receipt mutation, or Feishu document write is authorized or performed by this checklist.

## Candidate identity

- Package and CLI: `zdoc-localize@0.2.1`.
- CLI capabilities schema: `1`.
- Skill: `zdoc-localization@1.2.0`.
- Skill CLI range: `>=0.2.1 <0.3.0`.
- Exact runtime dependency: `feishu-docx-engine: 0.2.1`.
- Engine prepared-batch schema: `2`.
- Structured topology contract: `2`.
- Branch: `codex/zdoc-localization-engine-adoption-v2`.
- Verified implementation commit: `8eee24ea2` (`fix(localize): adopt Engine 0.2.1 structured fidelity`).
- Release source commit: the future reviewed commit containing this checklist; resolve it before any external release action.

Product capabilities include `structured-list-localization-v1`, `native-table-localization-v1`, and `native-callout-localization-v1`. Required Engine capabilities include `native-table-layout-v1`, `rich-inline-composition-v1`, `typed-snapshot-decode-v1`, and `native-callout-create-v1`.

## Pinned toolchain

```text
Node.js v24.15.0
pnpm 10.11.0
npm 11.18.0
lark-cli version 1.0.73
```

The `lark-cli` fact is a local version check only. Credential-free verification does not call a Feishu mutation command.

## Project A dependency identity

| Fact | Value |
| --- | --- |
| Engine package | `feishu-docx-engine@0.2.1` |
| Engine schema | `2` |
| npm integrity | `sha512-wycMsyTiJSzZBDV8Ze0iYmHpt933lU279/0Ab9T4evHxDIYdZlX56Ika3A08mLmfClQdRTQFPzss3tC55iWg1A==` |
| npm shasum | `fa7a6ac60ef3e8da6af7ca5848fff11babde88b4` |
| Tarball SHA-256 | `0225a03e726cad480a18ca359d1d0c07c313fa20539d436878bb343ab3c9d394` |
| Released consumer | `feishu-md-sync@0.7.1` |
| Project A tag | `v0.7.1` |
| Project A commit | `7c54c210879f341cb50287a3c6aa3e5b90e12665` |

## Registry contract

The Base registry schema is unchanged from 0.2.0.

- Canonical bytes: `5773`.
- Canonical SHA-256: `792285b9e93a2f1459c8c18e532b5a5a1e395a9fa6f0769419b4e3544899a657`.
- `document_pairs`: 14 fields, 3 views.
- `glossary`: 11 fields, 3 views.
- `localization_runs`: 16 fields, 3 views.

## Candidate artifact identities

Two independent `pnpm pack` runs were byte-identical under the pinned toolchain.

| Artifact | SHA-1 | SHA-256 | Integrity / tree hash |
| --- | --- | --- | --- |
| `zdoc-localize-0.2.1.tgz` | `c8c588a318e7d7b65ee58a6c4f1ee3568676ae76` | `46e2f24e19e8edda1ac8d75351bf24abfdbe6ba0a1a942c4b288a085bb0ee11a` | `sha512-Ib95OEsWSKdaAJ+tWDJXqr7aG/UcXtD3aNboJ7v3iMRMrZKMnY6g3DdRkKJ63IvnwuqTIzjk82dADjxugmWx8A==` |
| `skills/zdoc-localization` | n/a | `cc4f433b8ef732be7d740db12239331d8f5e34c11de1aff3604660d73d4baad6` | deterministic sorted path-and-content tree hash |

The package contains 167 entries and includes `dist`, `README.md`, and `CHANGELOG.md`. It excludes tests, credentials, run state, receipts, dogfood output, and retired mutation adapters.

## Contract gates

- Lists, native tables, and Callouts use topology-v2 structured slots; legacy structured plan-v3 reviews regenerate before preview.
- Mutation roots are separate from descendant evidence, so list ranges contain only top-level siblings and Table/Callout changes target their container root.
- Subtree fingerprints detect descendant content changes without sacrificing block identity.
- Table layout, Callout presentation, continuation paragraphs, links, inline code, and combined inline marks round-trip through review and Engine compilation.
- Structured translation memory uses stable source block identity and retains fallback reads for historical 0.2.0 keys.
- Recovery accepts supported Engine 0.2.0 and 0.2.1 batches, preserves exact evidence, and rejects unknown versions.
- Whiteboards remain untranslated raw mirrors; native synced references remain manually provisioned and verify-only.

## Credential-free verification

Run from the exact candidate source with the pinned toolchain:

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize pack:check
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
node scripts/verify-zdoc-localize-release-artifacts.mjs
git diff --check
```

Expected and observed before the release metadata commit:

- 24 test files and 187 tests pass.
- Build and typecheck pass.
- Artifact guard passes with 167 tarball entries.
- Clean-consumer install resolves Engine 0.2.1 and passes capabilities, offline doctor, and Skill compatibility.
- Compatibility reports no missing command, feature, Engine capability, safety route, or version mismatch.
- Double-pack bytes and the Skill tree match the identities recorded above.

## Known limits and external-action gate

- Engine 0.2.0 and 0.2.1 expose recovery assessment but no safe resume/rebase mutation API; `resume_possible` remains read-only.
- Feishu OpenAPI still cannot create native synced-code references.
- Hugging Face dogfood review/apply remains a separate gated task after release installation.

Before any push, PR, tag, npm publish, installed-Skill replacement, Base update, or Feishu document write, review the exact commit, rerun this suite from a clean checkout, recompute hashes after any package or Skill change, and obtain explicit approval for the exact external action.
