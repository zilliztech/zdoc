# Changelog

All notable changes to the published `zdoc-localize` package are recorded here.

## [0.2.1] - 2026-07-30

### Added

- Native Callout translation as immutable title/body slots while preserving presentation metadata.
- Engine-supported list continuation paragraphs as ordered structured slots.
- Subtree-aware semantic fingerprints so nested list, table, and Callout descendant edits cannot be missed.

### Changed

- Pinned the released `feishu-docx-engine@0.2.1` contract, including typed snapshot decode, native table layout, rich inline composition, and native Callout creation.
- Preserved table column widths/header-row settings and link-wrapped inline code with combined marks through review and apply.
- Separated mutation roots from descendant evidence so incremental structured replacement keeps block identity without crossing parent boundaries.
- Stabilized structured-slot translation-memory keys by source block identity, with fallback reads for historical `0.2.0` keys.

### Compatibility and recovery

- Structured plans created before topology contract version 2 fail with `structured_plan_requires_regeneration` before preview.
- Recovery accepts supported Engine `0.2.0` and `0.2.1` schema-v2 batches; unknown Engine versions still fail closed.

## [0.2.0] - 2026-07-27

### Added

- Structured translation, review, and apply support for recursive lists and native Feishu tables without flattening their topology.
- Exact `feishu-docx-engine` schema-v2 batch fingerprints in apply and recovery previews.
- Immutable Engine preview bundles, per-operation journals, verified write evidence, checkpoints, and partial-write recovery assessment.
- Safe initialization of an existing title-only Chinese target through the standard translation review and exact-preview approval gates.

### Changed

- Delegated all Feishu document and Whiteboard mutation ownership to exact dependency `feishu-docx-engine@0.2.0`.
- Defined the localization baseline as verified remote-English and remote-Chinese snapshots plus their block correspondences.
- Removed the localization-internal `feishu-md-sync` executable path; that CLI remains a separate route for English Markdown publication.
- Reduced direct `lark-cli` document access to a create-only gateway and narrowly scoped legacy DocxXML and Whiteboard readers.

### Compatibility and recovery

- Legacy receipts migrate to Engine snapshot identities only when revisions and correspondences can be proven unchanged; ambiguous state fails closed.
- Unapplied legacy reviews must be regenerated, while lossless legacy reversal is compiled into a separately approved Engine batch.
- Engine `0.2.0` can assess resume safety but exposes no safe resume/rebase mutation API, so resume remains read-only guidance.
- Native synced-code references remain manually provisioned and verify-only; Whiteboards remain untranslated raw mirrors with canonical-hash verification.
