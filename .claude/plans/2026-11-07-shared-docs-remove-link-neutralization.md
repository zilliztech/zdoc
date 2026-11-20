# Design (v2): shared-docs self-link projection anchor guard

Date: 2026-11-07 (v2 — revised after code-reviewer review; v1 hook-point and Layer-2 diagnosis were wrong, see Review trail)
Status: **implemented as zdoc PR #1149** (branch `fix/shared-autoid-anchor-guard`, stacked on #1147; commit 92036c7b8d). Implemented scope = the "Proposed change" section below; non-goals remain future increments.
Motivating incident: broken-links run 42150109577 — 4 broken anchors on primary-field-auto-id (en/ja × guides/byoc self-linking `#ensure-global-autoid-uniqueness-across-clusters`). Manual fix already landed: milvus-docs#3818 (v3.0.x `df73cf22`, `autoid-reference-intro` markers) + zdoc PR #1147 (page.yaml remove + lock repin).

## Corrected pipeline facts (verified against master)

All paths relative to `packages/docs-tooling/src/shared-docs/`.

1. `applyPlan` + `stripMappedMarkers` run in `adapters/inspect-page.ts:97`; `buildPage` only sees post-preprocess content. The v1 hook ("build-page.ts after applyPlan") does not exist.
2. Pure `#anchor` links are **already fail-closed against the projected output**: `core/links/rewrite.ts:48` sets `target = input.markdown` for kind `anchor`, and missing headings fail with `ANCHOR_NOT_FOUND` (`rewrite.ts:72-81`).
3. The real hole: **page-kind links (`file.md#anchor`) validate against the raw upstream blob** — `input.targets.get(file)` from `adapters/links-input.ts` `readTargetIndex` (lock-commit original). A heading removed by the page's own `remove` transform still exists there, so validation passes and the orphaned anchor ships. This is exactly how the incident escaped.
4. Production failure semantics: a page build error becomes a **fallback freeze + watchdog entry** (`scripts/docs-workflow/guides-shared-sources.js:289-292` → `SHARED_BUILD_FAILED` + `[shared-fallback]`), not a red pipeline. The true fail-closed gate is the `shared-docs-validate` PR check.
5. `spec/requirements.json` is a byte-for-byte copy from the design repository (header `generated_by: tools/export_requirements.py` + `prd_commit`). Adding a new error code requires the design-repo sync; reusing the existing `ANCHOR_NOT_FOUND` requires zero spec changes (unknown codes fail coverage as "Unknown requirement", `spec/coverage.test.ts:86-87`).
6. Attribution is sound without span surgery: source lines can only disappear between raw target and projected output via the plan's `remove`/`replace` (`core/transforms/filter.ts:11` never deletes source lines; md2md expansion failure fails the whole page; absent channel fails earlier at `TRANSFORM_CHANNEL_INVALID`). So "anchor present in raw target, absent in own projected output" is sufficient evidence of projection removal for self-links.

## Proposed change (minimal — one file, ~20 lines, zero spec edits)

In `core/links/rewrite.ts`, for **page-kind links whose destination resolves to the current page itself** (`input.sharedPages.get(file)` equals the current page's output id, or the `cloudPages` branch matches the current page id):

- Validate the fragment against `input.markdown` (projected output) instead of `input.targets.get(file)` (raw), using the existing `collectHeadings(...).find(heading => heading.milvus === anchor)` matching.
- On miss: fail with the **existing `ANCHOR_NOT_FOUND`** code; the detail already carries `target`/`anchor` — extend the message to state the anchor exists in the raw upstream target and was removed by this page's projection (attribution per fact 6).
- No `TransformPlan` plumbing, no new error code, no span extension.

Deployment semantics: fail-closed from day one through the `shared-docs-validate` PR gate. In production Fetch this manifests as the page falling back (frozen) + a `SHARED_BUILD_FAILED` watchdog entry — same shape as today's `LINK_UNRESOLVED`, which operators already know how to clear (upstream `doc:block` markers + page.yaml rule, the #3818/#1147 pattern).

**First-run blast radius (reviewer-measured, all 62 shared pages at their lock commits):** 10 pages carry remove transforms, 8 have headings inside removed blocks, and exactly **1 live inbound link** into a removed heading existed — the incident self-link itself, already deleted by the fix. (jieba-tokenizer has a same-shape link but link and target live inside the same removed block — removed together, consistent with the upstream marker pattern.) Residual risk ≈ 0; no warn-only cycle needed.

## Tests

- Error fixture via the existing `loadErrorCases` pattern (`testing/links/errors.test.ts`): page-kind self-link whose anchor exists in the raw target but not in projected output → `ANCHOR_NOT_FOUND` (code already coverage-recognized — zero spec changes).
- Positive: same link when the anchor survives the projection → passes.
- Cross-page link into a removed heading of ANOTHER page: stays validated against the raw target (current behavior; measured 0 live cases) — documented as a known limitation, not silently changed.
- Live golden: primary-field-auto-id at the post-#3818 pin builds clean (no orphan, no error) — covered by the local build already run for PR #1147.

## Explicit non-goals / future increments

- **Unwrap/neutralize instead of failing** — needs full-span link handling in `core/links/references.ts` (current `LinkRef` span covers only the destination, not `[label](url)`), a new `Notice` variant, and a `[shared-anchor]` watchdog channel (new marker + parser section in `docs-ingestion-watchdog.js` + workflow-policy touch). Only if silent neutralization is ever wanted; fail-closed matches the house pattern (upstream markers + projection rule).
- **`removedSpans`/`replacedSpans` on the plan** for richer diagnostics and `replace` symmetry (replace orphans are the same class; measured 0 today).
- **Cross-page projected-inventory validation** — pages build independently, so other pages' projected headings need on-demand projection (`inventoryBlocks + planTransforms` per target page via the `sharedDocs.pages` registry, cached on `BuildRuntime`). Worth it only if a cross-page case ever appears.
- Watchdog channel work is intentionally out of the minimal scope; `SHARED_BUILD_FAILED` entries already surface through the existing `shared_fallback` section.

## Sizing

- Minimal (this design): ~0.5 day — one file + error/positive fixtures + green PR validation.
- Increments if ever needed: unwrap ~1 day; cross-page inventory ~1 day; watchdog channel ~0.5 day.

## Review trail (why v1 was rewritten)

v1 proposed (a) hooking in `build-page.ts` after `applyPlan` — hook point does not exist (P0-1, see fact 1); (b) a Layer 2 "validate same-page anchors against the post-transform heading inventory" as new machinery — that already exists for pure `#anchor` links, while the actual gap (page-kind links vs raw targets) went unnamed (P0-2, fact 3); (c) a new `ANCHOR_UNRESOLVED` code — blocked by the byte-for-byte spec constraint (P1-3, fact 5); (d) unwrap based on link spans that don't exist yet (P1-4). Alternatives md2md-layer and Docusaurus `onBrokenLinks: 'throw'` were evaluated and rejected (frozen pinned engine / too late and too broad). Reconciliation conflict check came back clean (`core/updates/anchors.ts` attribution only binds confirmed-unique matches; a neutralized/failed link produces no forged evidence).
