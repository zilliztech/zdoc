# Shared Guides bundle storage plan

Baseline: origin/master d65f6fcc33d4c9f13241b1330a153467b59af2f1, fetched 2026-10-30.
Branch: claude/shared-guides-bundle. Only this isolated checkout may change.

## Confirmed scope

The retained successful source artifact (run 41034927510, artifact 12968866205) has 21 outcomes and a 30,577,935-byte bundle. The failed run 41039179712 reports 33,966,386 bytes, but its complete source bundle was not retained. Existing compact JSON is insufficient. Keep the 32 MiB file, 256 MiB payload and 8192-file bounds.

## Implementation

1. Introduce bundle schema v2 only at the storage boundary. Intern exact JSON evidence objects in a SHA-256 keyed common_evidence table; preparation inputs and successful outcome contexts reference entries. Preserve per-page upstream context. Never canonicalize/reorder identity evidence or change receipt/hash semantics.
2. Decode v1 unchanged and v2 to the same v1 memory shape before existing identity, alias provenance, receipt, frozen target, regeneration proof and output checks. Validate table hashes, strict wrappers, missing/unused references, counts, per-entry bytes and expanded logical payload <=256 MiB before restoring. References are one-level, never recursive. Distinct evidence bytes retain distinct entries.
3. Producer writes v2; production consumers stay on the shared validator. Document old-reader rejection and normal tooling-sync rollout. Do not alter permanent publication/translation contracts.
4. Add production-path tests for v1/v2 exact restoration, tampering and missing/extra references, bounds, mixed fallback and paired output. Exercise synthetic 21/23/50/100-page loads separately from real retained verification.
5. Replay retained source through legacy load, v2 serialization and production validation, compare every restored field and output/receipt byte. Download corresponding checkpoint/table evidence read-only if available; preflight checkpoints, use local bare remotes and supported retained replay procedures. Record exact commands, IDs, digests and limitations. No production writes or paid calls.
6. Run selector union (including matrix/README), focused regeneration tests, full selected replay/workflow/shared/type gates and relevant inventories/builds against exact restored state. Preserve logs and local evidence. Prepare English PR draft, commits, status and rollout advice without pushing or creating a PR.

## Self-review before implementation

- Storage schema changes must not leak into receipt identity or consumer semantics: decoder returns v1 and preserves JSON field order.
- Deduplication is exact-byte equality, not an assumption that all pages share inventories.
- A hash is corruption detection, not new authority: existing provenance/receipt checks remain mandatory.
- Size limits apply to disk files and aggregate payload as before, plus a bounded expanded logical payload to prevent reference amplification. No nested references.
- v2 requires the new reader; rollback uses a retained v1 artifact or reproduction with old tooling and the original size limit. Never relabel a v2 bundle as v1.
- Source tar is not a checkpoint. Missing failed bundle cannot be reconstructed or claimed as tested.
- Main checkout and unrelated worktrees/files remain untouched. Final evidence remains local for review.
