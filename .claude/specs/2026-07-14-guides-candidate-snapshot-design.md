# Guides Candidate Snapshot Design

## Goal

Scan the Guides Feishu Base tables and Wiki metadata once per workflow run while preserving the rule that the last-success snapshot advances only after the combined SaaS/BYOC output passes validation.

## Chosen approach

The Guides source-fetch stage creates a complete candidate source snapshot after its incremental/full source download finishes. The source-stage artifact carries this candidate into assembly. Assembly validates and promotes the candidate to `plugins/lark-docs/meta/snapshots/guides-uat-last-success.json` only after the combined build succeeds.

This is preferred over embedding the complete snapshot in the incremental-plan report, which would mix diagnostic and durable-state contracts, or keeping the assembly rescan as a fallback, which would retain the performance cost and point-in-time consistency race.

## Data flow

1. The source-fetch stage performs its existing Base scan and Wiki metadata resolution.
2. It retains the resolved `records` and `nodeMetadataByToken` used by incremental planning.
3. After changed/full source files are downloaded and removals are applied, it calls `createSourceSnapshot()` so hashes reflect the exact source files placed in the source artifact.
4. It writes `plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json`.
5. `guides-stage-artifact.js` includes that file in the source-stage artifact contract.
6. Assembly restores the source, SaaS, and BYOC artifacts and runs the combined validation/build.
7. A promotion command validates candidate identity and writes the last-success snapshot with final run metadata: targets built, target branch, publish URL, and link-check URL.
8. Assembly creates and publishes the combined Guides checkpoint containing the promoted last-success snapshot.

## Candidate contract

The candidate uses source snapshot schema version 2 and must match:

- manual: `guides`
- build environment: `uat`
- configured source directory and Base application token
- a non-empty, uniquely keyed canonical record list
- valid source hashes for every fetched source file represented by the snapshot

Promotion preserves the candidate's scan timestamp, record data, Wiki node metadata, source hashes, and outgoing-token graph. It changes only publication metadata known after assembly.

## Failure behavior

- Missing, malformed, mismatched, or stale candidate data fails assembly.
- Assembly does not silently rescan Feishu.
- A failed combined build does not promote or publish the candidate.
- Existing last-success state on the target branch remains unchanged on any failure.

## Testing

- Source snapshot tests cover candidate validation and promotion metadata.
- Lark fetch tests prove incremental source fetch writes the candidate from the already-loaded Base/Wiki data without another scan.
- Guides stage artifact tests require the candidate in source artifacts.
- Workflow tests prove assembly promotes the candidate and no longer runs `update-lark-doc-snapshot.js` or logs a second Base scan.
- Full workflow policy, translation, shell, and documentation build verification remain required.
