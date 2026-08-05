# Fetch Publication Ready-FIFO P0

Date: 2026-08-04

## Status and Relationship to the Full Design

This document defines the approved P0 slice of the broader Fetch and Translation publication FIFO design in:

```text
.claude/specs/2026-08-04-fetch-translation-publication-fifo-design.md
```

The broader design remains the long-term architecture. This P0 deliberately proves the lower-risk Fetch half first. Where this document narrows the delivery sequence, validation environment, or change scope, this document governs P0.

## Goal

Replace the fixed publication chain inside the Fetch workflow with a single-writer, work-conserving ready-FIFO, while preserving the current Fetch selection interface, checkpoint safety, source publication barrier, schema-v2 Translation handoff, final verification, aggregate behavior, and Feishu terminal report.

P0 must demonstrate a real performance and operational improvement without placing an unproven shadow coordinator into the production Fetch workflow.

## P0 Outcome

After P0 production cutover:

- Fetch producers still run in parallel.
- Java, Node.js, Go, CLI, REST, Python, English Guides, and Chinese Guides become independently publishable when their producers and immutable artifacts are ready.
- One Fetch publication coordinator publishes ready units in strict producer-completion FIFO order.
- The coordinator is the only Git writer in the Fetch workflow run.
- A unit failure is recorded, later ready units continue, and the workflow ultimately fails.
- Translation handoff is created and dispatched only after every required Fetch publication succeeds.
- Translation continues to consume the existing schema-v2 handoff and continues to use its existing publisher implementation.
- The Fetch Feishu card shows dynamic queue state while preserving the existing exact nine-note terminal report.

## Approved Delivery Safety Model

P0 uses three isolation gates. It does not deploy a long-running production shadow job.

```text
isolated worktree
-> local tests and real-artifact replay
-> feature-branch canary against an isolated target branch
-> review and merge
-> one manually monitored production Fetch all run
```

### Development isolation

Implementation starts only after this specification and its implementation plan are approved.

Use:

```text
worktree: .claude/worktrees/fetch-publication-fifo-p0
branch:   codex/fetch-publication-fifo-p0
```

The worktree must be based on a commit containing this P0 specification and the approved implementation plan. Development, tests, replay outputs, and canary preparation occur in that worktree. The main worktree and `master` remain unchanged until the reviewed PR is merged.

### Validation isolation

Before the PR is ready for review, the feature branch must pass:

1. local unit, contract, strategy, consumer, workflow-policy, and card tests;
2. local real-artifact replay against local bare remotes;
3. fault-injection replay;
4. an artifact-only feature-branch canary with no Git mutation;
5. a full feature-branch canary that writes only to an isolated target branch.

The canary may use temporary feature-branch-only trigger and target configuration. That configuration must:

- differ from the proposed production workflow only in trigger, isolated target selection, and suppression of real Translation dispatch;
- never target production `dev`;
- never dispatch the real Translation workflow;
- be removed before the PR is marked ready;
- leave retained run evidence tied to the tested feature-branch commit;
- be followed by static workflow-policy tests and a final diff audit after the temporary configuration is removed.

### Production isolation

There is no merge-then-observe production shadow period.

After all local and feature-branch gates pass, the PR is reviewed and merged. Production validation is one explicitly triggered Fetch `all` run monitored through terminal completion.

If production cutover fails, operators revert the Fetch cutover change and dispatch a new legacy Fetch run. A running FIFO workflow never switches to the legacy publisher chain because that would create a second writer and duplicate-publication risk.

## Scope

### Fetch units

P0 covers exactly these eight publication units:

```text
source/java
source/node
source/go
source/cli
source/rest
source/python
source/guides-en
source/guides-zh-CN
```

All eight use the checkpoint publication strategy. P0 does not implement the Japanese Guides strategy or any Translation publication strategy.

### Existing selection semantics

The Fetch workflow continues to accept only its current selection forms:

- `all`; or
- one existing source group.

Selecting Guides continues to require both English Guides and Chinese Guides publication units. P0 does not add arbitrary group lists or multi-group selection.

### Shared contracts

P0 introduces four independent publication documents:

- `publication-selection`;
- `publication-ready`;
- `publication-progress`;
- `publication-results`.

Each document starts at `schemaVersion: 1`. These versions are independent of the Translation handoff version. The handoff remains schema v2; P0 does not create schema v3.

The document and module names may remain generic so the long-term design can extend them, but P0 producers, validators, coordinators, and consumers implement and exercise only Fetch behavior. No Translation workflow wiring is added speculatively.

## Architecture

### Selection

Fetch `prepare` emits one immutable `publication-selection.json`. It binds:

- schema version;
- workflow kind `fetch`;
- repository, workflow run ID, and run attempt;
- tooling SHA;
- target branch and initial target SHA;
- current Fetch selection inputs;
- canonical selected unit list;
- expected producer logical identity for each unit;
- exact checkpoint and optional baseline artifact names;
- source and target identity requirements;
- selection SHA-256.

Canonical selection order remains the business presentation order. It is not the runtime publication order.

### Producer descriptors

Each selected Fetch producer keeps producing its existing immutable checkpoint artifacts. After every required artifact upload succeeds, it uploads one `publication-ready` descriptor.

The descriptor repeats and binds selection facts but cannot redefine them. The coordinator rejects descriptors with a mismatched repository, run, attempt, selection checksum, tooling SHA, unit, producer identity, target branch, or artifact set.

A descriptor is not sufficient by itself. The coordinator marks a unit ready only after the referenced artifacts pass the existing checkpoint preflight and identity checks.

A successful producer that emits no content uploads a descriptor with outcome `no_changes_candidate`; it does not bypass descriptor or identity validation. A failed, cancelled, or skipped selected producer becomes `producer_failed`. A successful producer whose descriptor or artifacts remain unavailable after bounded API-settling retries becomes `candidate_rejected`. Both terminal failures allow the queue to continue but make the overall Fetch run fail.

### FIFO coordinator

The Fetch workflow adds one `publish_ready` coordinator. It starts after `prepare` and observes producers while they run.

The trusted ordering key is:

```text
producer.completed_at ASC
unitKey ASC
```

`producer.completed_at` comes from the current workflow run and attempt through the GitHub Jobs API. A timestamp inside a producer-controlled descriptor is never used for ordering.

Scheduling rules are:

1. Resolve each selected unit to its effective producer job for the current run attempt.
2. Validate the unit descriptor and all declared artifacts.
3. Do not publish a later completed producer while an earlier completed producer is still awaiting descriptor or preflight resolution.
4. Resolve a completed producer's missing or invalid descriptor/artifacts to a terminal failure after bounded retries rather than blocking the queue indefinitely.
5. Do not wait for producers that are still running; they cannot later receive an earlier completion timestamp.
6. Break equal completion timestamps using lexical `unitKey` order.
7. Execute at most one publication transaction at a time.
8. Continue after ordinary unit-level terminal failures.
9. Stop further writes only when the coordinator cannot establish a safe remote target state.

The coordinator emits immutable progress snapshots after meaningful state transitions and one canonical final results document.

### Checkpoint handler

P0 implements one publication handler with only the checkpoint strategy. For each unit it:

1. downloads only the artifacts declared by the validated selection;
2. preflights every `checkpoint-group.tar` before extraction;
3. validates artifact identity and group ownership;
4. resolves the latest target tip;
5. applies the candidate using the existing three-way checkpoint behavior;
6. runs the unit's existing validation commands;
7. creates a normal commit only when changes exist;
8. pushes using compare-and-swap semantics;
9. recomposes after bounded retryable target drift;
10. reports `published`, `no_changes`, or `publish_failed`.

The implementation must reuse or extract the proven behavior in the existing checkpoint publisher. It must not weaken archive preflight, checksum validation, path ownership, three-way merging, validation, non-fast-forward handling, or ambiguous-push probing.

Chinese Guides publication explicitly uses `ZDOC_SITE=zh-CN`.

### Results consumers

The coordinator publishes one immutable `publication-results.json` in canonical business order. Each selected unit records its trusted producer completion time, actual FIFO sequence, publication timing, base SHA, result SHA, commit SHAs, attempt count, terminal status, and structured failure.

The results document records the initial and final target SHAs and one overall state:

- `success`;
- `failure` after the queue drained with a known safe target state; or
- `orchestrator_failed` when further writes stopped because target state could not be established safely.

Every successful unit `resultSha` must be an ancestor of `finalTargetSha`.

The following Fetch consumers move from fixed publisher outputs to the validated results document:

- source publication barrier;
- Translation handoff preparation;
- final target verification;
- aggregate reporting;
- Feishu progress monitoring and terminal reporting.

The separate fixed-chain final-SHA resolver becomes unnecessary after cutover.

## Translation Handoff Boundary

The handoff remains schema v2 and is prepared only after the FIFO coordinator has completed and the source publication barrier has succeeded.

For each source group:

- `sourceCheckpointSha` is the corresponding English source unit's successful `resultSha`;
- `sourceBaselineSha` remains the source baseline captured by Fetch preparation;
- global and per-unit `targetBaselineSha` use `publication-results.finalTargetSha`.

Chinese Guides success remains required by the barrier but is not a Japanese translation source checkpoint.

A failed, rejected, cancelled, or unresolved required Fetch unit blocks handoff. P0 does not change Translation selection, artifact, recovery, publisher, reconciliation, provenance, or card behavior.

## Failure and Recovery Semantics

Publication remains non-atomic:

- successful units remain published;
- failed units are recorded;
- later ready units continue;
- final verification may inspect the known final partial target for diagnostics;
- aggregate reports partial success accurately;
- the workflow fails;
- Translation handoff is blocked;
- no automatic content rollback occurs.

After a push command error, the coordinator probes the remote target:

- remote equals the candidate: report success;
- remote is known not to contain the candidate: retry or fail the unit according to the existing transaction rules;
- remote cannot be determined after bounded probing: mark `orchestrator_failed` and stop further writes.

Recovery uses the existing Fetch single-group interface. Operators start a new workflow run with complete artifacts for that run and attempt. P0 does not resume unsafe in-process coordinator state.

Rollback uses normal revert commits for already published content and never force-pushes or resets the target branch.

## Feishu Reporting

The existing Fetch monitor remains the only Feishu card writer. The publication coordinator receives no Feishu credentials and never updates the card directly.

The monitor combines:

- Jobs API producer state;
- the highest valid immutable publication progress revision;
- final aggregate/card report artifacts.

The card keeps canonical business ordering while displaying runtime queue facts such as:

```text
Ready - queue position 2
Publishing - FIFO sequence 3 - attempt 1
Published - <short SHA>
No changes
Failed - queue continued
```

A failed unit does not make the whole card terminal while the queue is still active. The final state is set only after aggregation/finalization.

The full Fetch `all` terminal report remains exactly nine notes:

- one workflow summary;
- four English Guides reports;
- four Chinese Guides reports;
- no `Unavailable` section.

FIFO details belong in the existing workflow summary and do not create a tenth note.

## Worktree, Commit, and PR Structure

P0 is developed in one isolated worktree and one feature branch. The branch should remain a draft PR, or remain unsubmitted, until the local gates pass. It is not merged until both canary gates pass.

The implementation plan should preserve reviewable commit boundaries equivalent to:

1. Fetch contracts and scheduler tests;
2. checkpoint transaction handler and replay harness;
3. producer ready descriptors;
4. results-based consumers and Fetch card state;
5. Fetch workflow FIFO cutover wiring and final documentation.

Temporary canary-only configuration may be committed for traceability, but it must be removed before the PR becomes ready. The final PR diff must contain no isolated target name, canary-only trigger, or real-Translation suppression override.

Legacy publisher implementation is not deleted in P0. Once the FIFO cutover is stable, unreachable legacy wiring and wrappers may be removed in a separate cleanup change.

## Verification Gates

Implementation follows RED -> GREEN -> refactor/verification within every commit stage.

### Local automated verification

At minimum, run:

- publication contract tests;
- FIFO scheduler tests;
- checkpoint strategy and ambiguous-push tests;
- results consumer, barrier, handoff, final verification, aggregate, and card tests;
- workflow policy tests proving a single Git writer and no fixed publisher chain after cutover;
- existing repository typecheck and relevant site validation/build tests;
- `git diff --check`;
- excluded-path and final worktree audits.

Exact repository commands belong in the implementation plan after current scripts and test ownership are mapped.

### Real-artifact replay

Use retained artifacts from representative successful full Fetch runs. At least two runs must be used to verify observed FIFO calculation. At least one complete artifact set must be replayed through both publication orders.

Create local bare remotes with branches seeded from the same recorded baseline:

```text
canonical/dev
fifo/dev
```

Replay requirements:

- preflight all eight units before extraction;
- run with the exact tooling SHA and job-level environment;
- publish the current fixed order to `canonical/dev`;
- publish recorded producer-completion FIFO order to `fifo/dev`;
- require every expected unit to end as `published` or `no_changes`;
- compare final Git trees rather than commit SHAs;
- require identical final trees;
- run the source publication barrier;
- restore the exact generated state from the final FIFO target;
- run localization input inventory and revision inventory validation;
- validate/build the English and Chinese sites required by the existing Fetch gate;
- generate and validate the unchanged schema-v2 handoff;
- replay isolated English and Chinese card collection and require exactly nine complete notes;
- retain artifacts, replay roots, logs, results, progress snapshots, validation receipts, final SHAs, and card JSON as review evidence.

### Fault-injection replay

Before canary, prove at least:

- earliest completed unit descriptor or checksum rejection followed by later-unit publication;
- middle-unit validation failure followed by later-unit publication;
- one target advance followed by successful recomposition;
- repeated target advance beyond the retry bound;
- push command error after an actual successful remote update;
- progress snapshot upload failure without publication failure;
- unknown remote target state stopping further writes;
- handoff blocked after any required unit failure.

Every scenario must leave the remote containing only commits reported as successfully published.

### Feature-branch canary

First run artifact-only mode and prove:

- all selected descriptors resolve;
- FIFO sequence matches Jobs API completion order;
- progress and results documents validate;
- no Git target branch changes occur.

Then run one full `all` canary against an isolated target branch and prove:

- exactly one Git writer is active;
- actual publication order matches trusted completion timestamps;
- every successful unit SHA is contained in the final isolated target SHA;
- results-based barrier, handoff preparation, final verification, aggregate, and card reporting succeed;
- the handoff validates as schema v2 but is not dispatched to the real Translation workflow;
- the final card report contains exactly nine complete notes.

### Production validation

After merge, manually trigger one Fetch `all` run with normal production inputs. Monitor producers, `publish_ready`, source barrier, handoff, Translation dispatch, final verification, aggregate, and card finalization through terminal completion.

Production acceptance requires:

- every selected unit is `published` or `no_changes`;
- runtime sequence exactly follows producer completion timestamps;
- every successful unit SHA is an ancestor of final production `dev`;
- Translation dispatch occurs only after the successful source barrier;
- the schema-v2 handoff is accepted by the unchanged Translation workflow;
- the Fetch card reaches an accurate terminal state with exactly nine complete notes.

## Explicitly Out of Scope

P0 does not include:

- production shadow coordinator jobs;
- `translate-codex.yml` FIFO orchestration;
- Translation producer ready descriptors;
- Translation SDK dynamic publication;
- Japanese Guides latest-tip composition or staging redesign;
- Japanese translation cache merge changes;
- Translation reconciliation changes;
- Translation card changes;
- arbitrary multi-group selection;
- Translation handoff schema v3;
- overlapping Fetch and Translation generations;
- cross-run or cross-workflow FIFO;
- atomic publication or automatic rollback;
- force pushes or target resets;
- cleanup of the legacy Fetch publisher implementation;
- deployment, release, Jenkins, image promotion, or rollback contracts;
- `scripts/doc-publish-bot/**`;
- unrelated `.github/workflows/**` changes;
- `migration/reports/**`;
- deprecated `zdoc_cn` behavior.

The user-owned `.claude/specs/2026-08-03-fetch-docs-multi-group-selection.md` remains read-only and must not be modified or committed as part of P0.

## Acceptance Criteria

P0 is complete only when:

- the worktree, local replay, fault injection, and isolated canary gates all pass before merge;
- no production shadow job is introduced;
- Fetch no longer waits on the fixed Java -> Node -> Go -> CLI -> REST -> Python -> English Guides -> Chinese Guides publisher chain;
- strict trusted producer-completion FIFO and lexical tie breaking determine runtime order;
- one Fetch workflow run has exactly one Git writer;
- ordinary unit failure does not prevent later ready units from being attempted;
- unsafe unknown remote state stops further writes;
- final successful trees match the canonical replay tree for the same artifacts;
- Fetch-to-Translation handoff remains schema v2 and stays behind the all-success source barrier;
- Translation behavior remains unchanged until the later Translation phase;
- the Feishu card reports dynamic queue state and retains the exact nine-note terminal contract;
- one manually monitored production Fetch `all` run succeeds after merge;
- multi-group publication has not started.
