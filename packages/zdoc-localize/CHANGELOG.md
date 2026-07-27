# Changelog

All notable changes to the published `zdoc-localize` package are recorded here.

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
