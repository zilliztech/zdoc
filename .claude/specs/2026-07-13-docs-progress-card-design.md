# Documentation Progress Card Design

## Goal

Show the live documentation workflow lifecycle on one Lark card without resetting its start time, stage list, or completed progress across jobs.

## Design

Add a stateless cross-job card phase update to `report-to-lark`. The caller supplies the original message ID, title, start time, complete stage list, stage index, status, and optional note. The command reconstructs a deterministic state, marks prior stages done, marks the selected stage done or failed, and marks the next stage running when appropriate.

For a publish-enabled single-group run, stages are `Produce <group>`, `Publish <group>`, `Translate <group>`, `Publish <group> translation`, and `Verify`. Artifact-only runs contain only `Produce <group>`. Each reusable workflow receives optional card metadata and owns updates for its phase. Reporting failures remain non-fatal.

## Security

Lark credentials remain scoped to individual reporting steps. Publisher, translator, and verifier workflows accept only the two reporting secrets they need. Their build, artifact, and publication steps do not receive those credentials.

## Verification

Unit-test deterministic phase-state construction, statically verify workflow inputs and phase mappings, and run the workflow-focused suite.
