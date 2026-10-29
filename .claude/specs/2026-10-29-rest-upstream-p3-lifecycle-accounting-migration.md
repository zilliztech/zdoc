# REST upstream P3 — lifecycle suggestions, T4 ledger accounting, migration gate (2026-10-29)

Status: implemented on `feat/rest-upstream-pipeline` (PR #906, P3 scope of
`.claude/specs/2026-10-28-rest-upstream-pipeline-design.md` §11). This report is
the P3 acceptance evidence: data-plane lifecycle suggestions bound into the
change-set contract, the T4 ledger accounting gate behind the schemaVersion 2
completeness receipt, the machine-checked fragment-migration state machine, and
the milvus source-tree lane in the refresh workflow.

## 1. What landed

| Piece | File(s) | Notes |
|---|---|---|
| Lifecycle suggestions | `upstreamDiff/lifecycle.js` + diff integration | `--lifecycle-track <major.minor.x>` (diff/prepare CLIs) attaches `x-added-at`/`x-last-modified`/`x-deprecated-since` suggestions to contract drift on data-plane sources. Only contract drift earns suggestions: additions (operation/field/param) take the full triple (deprecation seeded from the upstream node), `constraint`/`required` drift takes `x-last-modified`, deprecation flips take `x-last-modified` + `x-deprecated-since`. Prose-only, `unattributed`, and `zdoc-only` entries get none; un-deprecating stays a human decision. Fragment-side timeline is validated before attaching (`REST_UPSTREAM_LIFECYCLE_ORDER`): a suggestion never moves an element backwards and never pushes `x-last-modified` past `x-deprecated-since` (CUSTOM_ATTRIBUTES §1.10 order). Control-plane sources reject the track outright. |
| Applier lifecycle binding | `upstreamDiff/applier.js`, `upstreamDiff/changeSet.js` | A lifecycle write whose leaf the diff derived binds to the suggested value exactly (deviation ⇒ `REST_UPSTREAM_APPLY_VALUE_UNBOUND` unless `override` + reason); un-derived leaves still require the override. Change-set uniqueness relaxed from one entry per diff id to one entry per (diff id, kind, locus) so a constraint fix and its lifecycle bump ride the same drift; reconcile uses the same key. |
| T4 accounting | `upstreamDiff/accounting.js` + CLI `rest-upstream-accounting` | Every `upstream-added` operation in a diff must carry a ledger entry (any classification — the gate proves a human decision exists). Output is a digest-bound statement (`diffDigest` = the change-set binding digest); strict mode fails with the exact undecided op keys, `--report-only` inspects, `--out` writes the statement. |
| Receipt schemaVersion 2 | `restCompletenessReceipt.js` | `createRestCompletenessReceipt` takes `upstreamAccounting`; v2 receipts embed the accounting statement and refuse to validate while `unaccounted > 0` (a completeness receipt with undecided upstream operations is not complete). v1 stays byte-compatible (no accounting field ⇒ schemaVersion 1). |
| Migration gate | `upstreamDiff/migration.js` + contract `rest-fragment-migration.schema.json` + CLI `rest-upstream-migration` | Always: the bookkeeping validates against its contract, files exist, names are unique, declared `operationCount` equals the real operation inventory. With `--canonical-ready`: each canonical surface needs a loadable fragment collection (`loadFragmentCollection`: manifest, identity stamps, digests, refs) whose services join the canonical fragments **by service id** (canonical collections name fragments `*.openapi.json`; the legacy tree keeps `NN-name.json`), byte-identical with the tree, and the surface's T4 accounting must be complete. Nothing canonical ⇒ `REST_UPSTREAM_MIGRATION_NOTHING_CANONICAL`. |
| Refresh workflow lanes | `.github/workflows/rest-upstream-refresh.yml` | Split into resolve (any kind) → spec fetch (spec-file) or setup-go 1.27 + vendored extractor (source-tree) → prepare (`--lifecycle-track` passthrough). The lock bump keeps the content SHA only for spec-file sources (source-tree pins the commit, per the lock contract). New T4 accounting gate runs after the pin bump; the agent's ledger drafts land in `ledger.json` as conservative `deferred` entries in the same commit (existing decisions never overwritten; human review reclassifies in the PR), so adoption stays atomic and the gate can actually pass. |

Agent-facing: the instruction pack (rule 10) and `refresh-rules.json` policy
`lifecycle-binds-to-diff` now describe the binding; the ruleset itself is
machine-enforced by the applier, so prompt drift cannot widen it.

## 2. Ledger drafts land in the refresh PR (design decision)

The design left ledger drafts as proposals "for human review". Landing them as
`deferred` entries inside the refresh commit resolves the T4 deadlock without
weakening the gate: the accounting gate would otherwise reject every refresh
that discovers a new operation, forcing a second, separate ledger PR that
breaks the single-PR atomicity contract (design §3.1/§5). The gate still
proves the decision exists; the PR review is where the classification is
debated, exactly like the 54-entry cloud bootstrap was reviewed before merge.
`adopted` drafts are demoted to `deferred` on landing — adoption is what the
fragment edits already prove, and the reviewer promotes it deliberately.

## 3. Current ledger state (user-visible)

The committed milvus diff at pin `6d833a67` reports 11 undecided
`upstream-added` operations (snapshots family, `entities/advanced_search`,
`jobs/snapshot/export/describe`, `quotacenter/describe`, `segments/describe`).
`rest-upstream-accounting --diff tmp/rest-upstream-p2-milvus/diff-6d833a67.json`
fails with all 11 names; the 26-entry bootstrap proposal
(`tmp/rest-upstream-p2-milvus/ledger-proposal-milvus.json`) is still unmerged
pending human review. A real milvus refresh dispatch (or the first
`lifecycle_track` rehearsal) needs those classifications merged first, or the
refresh run's own T4 gate will fail closed with the same list.

## 4. Test coverage

61 focused tests before P3 → **82 after** (all in `pnpm test:rest-upstream`):
`lifecycle.test.js` (track parsing/ordering, suggestion matrix, override-free
binding source), diff tests (suggestion attachment, byte-identical output
without the track, fail-closed ordering, control-plane rejection), applier
tests (binding without override, deviation ⇒ override, un-derived leaf ⇒
override, locus binding), change-set duplicate-key shape, accounting
(`accounting.test.js`: frontier accounting, classification-agnostic gate,
fail-closed naming, malformed inputs), migration (`migration.test.js`:
contract/duplicates, consistency, canonical readiness happy + stale/undeclared/
undecided/nothing-canonical paths), receipt v2 (round trip, v1 compatibility,
incomplete accounting, op-key ordering), and a CLI wiring test
(lifecycle-track diff → accounting strict/report → migration consistency →
canonical-ready input enforcement) against the real committed meta.

Real-data smoke (not committed): the committed migration bookkeeping passes
`rest-upstream-migration` (`canonical=2, legacy-shadow-required=36`); the
committed milvus diff fails the strict accounting gate with the exact 11
undecided op keys and passes `--report-only`.

## 5. Known limitations / follow-ups

- The skeleton still pins by commit only; digest-pinning the skeleton at bump
  time remains a P4 option if replay needs it.
- ja lifecycle notes: fragments carry `x-added-at` on the en canonical nodes
  only; the zh/ja generated pages inherit through the generator. No new lane.
- `x-deprecated-since` suggestions for `deprecated` flips assume the flip
  lands in the current track; a delayed adoption needs the reviewer to lower
  the value via override (the applier allows it with a reason).
- First real milvus adoption (with lifecycle_track) and the first canonical
  collection bootstrap (producing `collection-manifest.json` for
  `37-file-resource-operations-v2.json` + `38-snapshot-operations-v2.json`,
  the two already-canonical fragments) remain the operator rehearsals that
  exercise these gates against production content.
