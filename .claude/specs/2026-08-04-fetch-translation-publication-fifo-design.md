# Fetch and Translation Publication Ready-FIFO

Date: 2026-08-04

## Goal

Replace the fixed publication chains inside the Fetch and Translation workflows with a work-conserving ready-FIFO while preserving the workflows' existing business boundary, content contracts, validation strength, and recovery semantics.

The change optimizes only publication work inside each workflow run:

- Fetch producers continue to run in parallel. A source unit becomes publishable after its producer completes, uploads its immutable candidate, and passes artifact preflight.
- Translation producers continue to run in parallel. A translation unit becomes publishable after all artifacts required by that unit are complete and pass preflight.
- Ready units are published in producer-completion order.
- Each workflow run has only one Git writer.
- A unit failure is recorded and does not prevent later ready units from being attempted.
- Fetch-to-Translation handoff still occurs only after all selected Fetch publications have reached successful terminal states.

This design does not introduce multi-group selection. The current `all` or single-group interfaces remain unchanged.

## Motivation and Evidence

The current workflows serialize publication through fixed job dependencies even though producers finish in a different order:

```text
Fetch:
Java -> Node -> Go -> CLI -> REST -> Python -> English Guides -> Chinese Guides

Translation:
Japanese Guides -> Japanese/Chinese SDK canonical chain
```

Recent successful runs showed material avoidable waits:

| Workflow | Run | Maximum observed wait | Estimated ready-FIFO improvement |
| --- | ---: | ---: | ---: |
| Fetch | `30873886876` | 12.6 minutes | 4.8 minutes |
| Fetch | `30861599172` | 13.5 minutes | 5.1 minutes |
| Fetch | `30825703087` | 26.1 minutes | 13.2 minutes |
| Translation | `30864046835` | 53.2 minutes | 21 minutes |
| Translation | `30831941226` | 69.1 minutes | 29.3 minutes |

The most visible Translation delay occurs when SDK translation artifacts are ready 24-30 minutes before Japanese Guides, but the fixed chain prevents their publication.

## Approved Behavioral Boundaries

### Workflow boundary

Fetch and Translation remain separate workflows with an explicit handoff:

```text
all selected Fetch producers and publications finish
-> source publication barrier succeeds
-> Translation handoff is created and dispatched
-> Translation producers and publications run
```

The design does not allow Fetch `N+1` and Translation `N+1` to overlap through this change. It does not coordinate publication order across Fetch and Translation runs.

### Selection boundary

The existing interfaces remain:

- Fetch: `all` or one source group.
- Translation: the existing locale/group selection resolved by the schema-v2 handoff.

This phase does not add arbitrary group lists or multi-group workflow inputs.

### Failure boundary

Publication is not atomic:

- successful units remain published;
- failed units are recorded;
- later ready units continue;
- the workflow ultimately fails if a required unit failed;
- no automatic rollback is performed;
- Translation handoff and derived-state reconciliation require their existing all-success barriers.

### Provenance boundary

Git publication SHAs and translation source provenance remain distinct:

- `baseSha` and `resultSha` describe commits in the target branch publication history;
- translation `sourceCheckpointSha` describes the immutable translated source;
- Reference Manifest `sourceCommit` continues to describe translation source provenance;
- Reference Manifest `sourceCommit` must not be replaced with a publication base, final target SHA, reconciliation SHA, or Jenkins repository SHA.

## Architecture

Each workflow adds one `publish_ready` coordinator:

```text
prepare
├── parallel producers
└── publish_ready
    ├── observe Jobs and Artifacts APIs
    ├── validate ready descriptors
    ├── preflight immutable artifacts
    ├── schedule ready units by FIFO
    ├── execute one publication handler at a time
    ├── emit immutable progress snapshots
    └── publish publication-results.json
```

The coordinator starts after `prepare`, not after the producers. It remains active while producers run and consumes units as they become ready.

The coordinator is the only Git writer in its workflow run. Producer jobs, ready fan-in jobs, monitors, aggregate jobs, and card finalizers have read-only repository permissions.

This single-writer invariant applies once a workflow cuts over to the FIFO engine. During the contract and shadow phases, the existing legacy publishers remain the only production writers and the new coordinator is strictly read-only.

## Publication Handler Boundary

The workflow exposes one publication handler with two internal strategies:

```text
publication handler
├── checkpoint strategy
│   ├── Fetch source units
│   └── SDK Translation units
└── Guides strategy
    └── Japanese Guides batch set
```

The common handler owns:

- state transitions;
- descriptor and artifact identity enforcement;
- latest-target resolution;
- single-writer serialization;
- validation invocation;
- compare-and-swap promotion;
- bounded retry after target drift;
- terminal results and diagnostics;
- progress snapshots;
- staging cleanup policy.

Each strategy implements only the behavior that cannot be shared:

```text
compose(baseSha, validatedArtifacts) -> candidate | no_changes
validate(candidate) -> validation receipts
```

The design does not force Fetch checkpoints, SDK checkpoints, and Guides batches into one artifact schema or one apply algorithm.

## Publication Selection Contract

`prepare` produces one immutable `publication-selection.json` and uploads it as:

```text
publication-selection-<workflow>-<run-id>-<run-attempt>
```

The selection binds:

- schema version;
- workflow kind (`fetch` or `translation`);
- repository, run ID, and run attempt;
- tooling SHA;
- target branch and initial target SHA;
- selected workflow inputs;
- canonical unit list;
- expected producer logical identity for each unit;
- strategy for each unit;
- exact candidate and baseline artifact names;
- source and target identity requirements;
- selection SHA-256.

Example unit:

```json
{
  "unitKey": "translation/ja-JP/python",
  "strategy": "checkpoint",
  "producerJob": "translate:ja-JP/python",
  "target": "ja-JP",
  "group": "python",
  "sourceGroup": "python",
  "toolingSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceCheckpointSha": "89abcdef0123456789abcdef0123456789abcdef",
  "targetBranch": "dev",
  "artifacts": {
    "checkpoint": "translation-checkpoint-ja-JP-python-123",
    "baseline": "translation-baseline-ja-JP-python-123"
  }
}
```

Selection order remains the canonical business presentation order. It is not the runtime publication order.

## Ready Descriptor Contract

A producer uploads its ready descriptor only after every artifact required by the unit has been uploaded successfully.

The artifact name is:

```text
publication-ready-<workflow>-<unit-token>-<run-id>-<run-attempt>
```

The descriptor repeats and binds selection facts but cannot redefine them. It includes:

- schema version;
- workflow, repository, run ID, and run attempt;
- unit key and selection SHA-256;
- producer logical identity;
- tooling SHA and source checkpoint SHA;
- target branch;
- exact artifact names;
- artifact manifest/checksum identities needed by preflight;
- producer outcome (`candidate` or `no_changes_candidate`).

The coordinator rejects descriptors from another repository, run, attempt, selection, tooling SHA, unit, source identity, target branch, or artifact set.

### Guides ready fan-in

Japanese Guides is one publication unit backed by multiple batch artifacts. A lightweight `ready_ja_guides` job:

- waits for all expected Guides translation batches;
- verifies that every batch number is present exactly once;
- binds the batch count and pending-set identity;
- uploads one unit descriptor;
- emits `no_changes_candidate` when the prepared batch count is zero.

The fan-in job never writes Git.

## FIFO Scheduling

The ordering key is:

```text
producer.completed_at ASC
unitKey ASC
```

`producer.completed_at` comes from the current workflow run's Jobs API, not from a producer-controlled timestamp in the descriptor.

The scheduler follows these rules:

1. Query all expected producer jobs for the current run and attempt.
2. Resolve retries to the effective current-attempt job identity.
3. Validate a descriptor and all referenced artifacts before marking a unit ready.
4. Do not publish a later completed unit while an earlier completed unit is still awaiting descriptor or preflight resolution.
5. Do not wait for producers that are still running; once another producer has completed, a still-running producer cannot later acquire an earlier completion timestamp.
6. Break identical completion timestamps with `unitKey` lexical order.
7. Execute at most one strategy at a time.
8. Continue after unit-level terminal failures.

The queue is work-conserving: if a valid ready unit exists and no publication is active, the coordinator starts it within the polling/setup allowance.

## Unit State Machine

```text
producing
├── producer failure/cancel/skip -> producer_failed
└── candidate observed
    ├── descriptor failure      -> candidate_rejected
    ├── artifact preflight fail -> candidate_rejected
    └── ready
        └── publishing
            ├── published
            ├── no_changes
            └── publish_failed
```

All states other than `producing`, `candidate`, `ready`, and `publishing` are terminal.

Unit failures do not terminate the queue. A run-level `orchestrator_failed` state is reserved for failures that make further writes unsafe, such as the inability to determine the remote target state after bounded probing.

## Checkpoint Strategy

The checkpoint strategy serves:

```text
source/java
source/node
source/go
source/cli
source/rest
source/python
source/guides-en
source/guides-zh-CN
translation/<target>/<sdk-or-reference-group>
```

For each unit it:

1. downloads only the candidate and optional baseline artifacts declared by the selection;
2. preflights every `checkpoint-group.tar` before extraction;
3. validates checkpoint identity and group ownership;
4. applies the candidate to the latest target tip;
5. runs the unit's existing validation commands;
6. creates a normal commit when changes exist;
7. pushes by compare-and-swap semantics;
8. recomposes after retryable target drift;
9. reports `published`, `no_changes`, or `publish_failed`.

The implementation reuses the proven behavior in `publish-checkpoint.sh` and `apply-checkpoint-artifact.js`. It may extract a callable transaction core, but it must not weaken existing artifact validation, path ownership, three-way merge, validation, or non-fast-forward handling.

SDK translation units always supply their baseline artifacts. Japanese translation cache merging remains a three-way merge:

- changes to different `sourcePath` keys are preserved;
- identical target/artifact values are idempotent;
- divergent changes to the same key fail the unit.

Chinese Guides publication explicitly sets `ZDOC_SITE=zh-CN`.

## Japanese Guides Strategy

The current Guides publisher cannot be inserted into a dynamic queue unchanged because:

- its plan pins `targetSha`;
- its target guard permits only paths from earlier Guides batches between the plan target and current HEAD;
- promotion requires the target branch to remain exactly at the original expected target;
- Japanese Guides and Japanese SDK translations share `.translation-cache/ja-JP.json`.

### Immutable plan identity

The original plan continues to bind:

- source checkpoint SHA;
- original handoff target SHA;
- master/tooling SHA;
- dev/source baseline SHA;
- pending-set SHA-256;
- baseline payload SHA-256;
- exact batch writes, deletions, and cache deltas;
- plan SHA-256.

None of those identities are relaxed or regenerated from the latest target.

### Latest-tip composition

When the Guides unit leaves the FIFO queue:

1. fetch the latest target branch SHA as `compositionBaseSha`;
2. require the original `plan.targetSha` to be an ancestor of `compositionBaseSha`;
3. create a detached staging worktree at `compositionBaseSha`;
4. apply the original batches in plan order;
5. require each batch to start at the exact captured composition head or prior batch commit;
6. validate the complete staged candidate;
7. promote by CAS against `compositionBaseSha`.

The old restriction that `plan.targetSha..HEAD` may contain only earlier Guides batch paths is removed. It is replaced by exact-head guarding plus artifact/baseline/current three-way conflict detection.

### File merge rules

For a write:

- current equals baseline: apply artifact;
- current equals artifact: idempotent;
- otherwise: composition conflict.

For a deletion:

- current is already absent: idempotent;
- current equals baseline: delete;
- otherwise: composition conflict.

### Cache merge rules

The existing semantic three-way cache merge remains:

- baseline/artifact/current are merged by `sourcePath`;
- SDK entries added after the handoff target are preserved;
- unrelated Guides entries are preserved;
- a divergent modification of the same source key fails composition.

### Validation and promotion retry

Every composition attempt runs the complete seven-receipt Guides validation against the staged candidate.

If the target moves before promotion:

1. retain or clean the prior staging ref according to its diagnostic state;
2. fetch the new target tip;
3. recheck original plan ancestry;
4. rebuild the candidate from the new tip;
5. rerun the complete validation suite;
6. retry CAS promotion up to the configured bound.

Staging refs include the run, attempt, pending-set identity, composition base, and retry number so candidates from different bases cannot alias.

Validation failures retain an exact staging ref for diagnosis. Successful promotion deletes the staging ref with a lease. Cleanup debt is reported but does not change an already confirmed publication result.

## Ambiguous Push Handling

After any push command that returns an error, the handler probes the remote target:

- remote equals the candidate: treat the unit as published;
- remote is known and does not contain the candidate: record the appropriate retryable or terminal failure;
- remote cannot be determined after bounded retry: mark the coordinator `orchestrator_failed` and stop further writes.

An unknown remote state is never treated as an ordinary unit failure followed by more writes.

## Publication Results Contract

The coordinator uploads:

```text
publication-results-<workflow>-<run-id>-<run-attempt>
```

The canonical document contains:

- schema version;
- workflow, repository, run ID, and run attempt;
- selection SHA-256;
- target branch;
- initial and final target SHA;
- coordinator start/end timestamps;
- overall status;
- canonical unit array;
- optional Translation reconciliation result;
- optional orchestrator failure.

Each unit records:

```json
{
  "unitKey": "translation/ja-JP/guides",
  "producerJobId": 123456,
  "producerCompletedAt": "2026-08-04T08:00:00.000Z",
  "readyAt": "2026-08-04T08:00:10.000Z",
  "sequence": 4,
  "publishStartedAt": "2026-08-04T08:03:00.000Z",
  "publishCompletedAt": "2026-08-04T08:18:00.000Z",
  "baseSha": "0123456789abcdef0123456789abcdef01234567",
  "resultSha": "89abcdef0123456789abcdef0123456789abcdef",
  "commitShas": ["89abcdef0123456789abcdef0123456789abcdef"],
  "attempts": 1,
  "status": "published",
  "failure": null
}
```

The canonical unit array stays in business presentation order. `sequence` records the actual FIFO publication order.

Overall status is:

- `success`: every selected unit is `published` or `no_changes`, and required finalization succeeded;
- `failure`: one or more units failed, but the coordinator retained a known safe remote state and completed the queue;
- `orchestrator_failed`: further writes stopped because safe target state could not be established;
- artifact-only success/failure is based on producer artifact readiness without Git mutation.

Every successful `resultSha` must be an ancestor of `finalTargetSha`.

## Fetch Workflow Integration

The fixed Fetch publisher jobs are replaced by `publish_ready`.

`source_publication_barrier` downloads and validates the publication results instead of consuming `needs.publish_*` outputs.

For an `all` run it requires successful terminal states for:

- Java;
- Node.js;
- Go;
- CLI;
- REST;
- Python;
- English Guides;
- Chinese Guides.

For a single-group run it requires only the selected source units. Guides still requires both English and Chinese Guides because both are part of the current Guides source publication contract.

### Translation handoff

The schema-v2 handoff remains unchanged:

- each source group's `sourceCheckpointSha` is the corresponding English source publication `resultSha`;
- `sourceBaselineSha` remains the Fetch source baseline captured at preparation;
- global and per-unit `targetBaselineSha` use the FIFO run's `finalTargetSha`;
- Chinese Guides success is required by the barrier but is not a Japanese translation source checkpoint.

Handoff preparation starts only after the coordinator has completed and the barrier has succeeded.

### Final verification and aggregate

The separate `resolve_final` job becomes unnecessary. Final verification consumes `publication-results.finalTargetSha` and verifies that every successful unit result is contained in it.

Aggregate consumes the canonical results document rather than a large set of fixed publisher environment variables. It preserves current group-level business states and successful commit SHAs.

When a source unit failed, final verification may still run on the known final partial target to collect diagnostics, but the workflow fails and Translation handoff is blocked.

## Translation Workflow Integration

The fixed Translation publisher jobs are replaced by one `publish_ready` coordinator. Translation producers remain parallel.

The coordinator consumes SDK descriptors directly and consumes the Japanese Guides fan-in descriptor when all Guides batches are complete.

### Derived-state reconciliation

The existing `reconcile_published_state` job writes Git and therefore cannot remain a separate job under the single-writer invariant.

Reconciliation becomes a queue-drained finalization step inside the publication handler:

```text
all selected translation units terminal
-> all required units are published/no_changes
-> current selection requires reconciliation
-> restore latest published target state
-> regenerate and validate derived translation state
-> CAS publish reconciliation commit
```

If any translation unit failed, reconciliation is recorded as `skipped_due_to_unit_failure`.

The reconciliation result records its base SHA, result SHA, commit list, validation status, and failure. Its Reference Manifest `sourceCommit` continues to use the source SHA from the handoff, not the latest Translation target tip.

Translation aggregate consumes publication results and reconciliation results rather than fixed publisher job names.

## Feishu Card Reporting

### Single card writer

The existing monitor remains the only Feishu card writer during a workflow run. The publication coordinator does not receive `APP_ID`, `APP_SECRET`, or direct card-write authority.

The final fallback job runs only after the monitor has failed, completed, or been cancelled, preserving non-overlapping card ownership.

### Immutable progress snapshots

The coordinator uploads an immutable progress snapshot after each meaningful state transition:

```text
publication-progress-<workflow>-<run-id>-<run-attempt>-<revision>
```

Snapshots bind:

- workflow, run, and attempt;
- selection SHA-256;
- monotonically increasing revision;
- generated timestamp;
- all current unit states;
- active unit and queue state;
- reconciliation state when applicable.

The implementation uses the official GitHub Actions artifact client from inside the coordinator process. Artifact names are unique per revision and remain below the per-job artifact limit.

Progress artifact upload is best effort. Failure to publish a progress snapshot does not fail a Git publication. The monitor retains the latest valid snapshot and marks publication progress as potentially stale.

### Monitor data sources

On every heartbeat the monitor merges:

- Jobs API state for Produce/Translate execution;
- the highest valid publication progress revision for Ready/Publish state;
- handoff metadata where applicable;
- the final validated card report after aggregate completes.

The monitor rejects snapshots with mismatched run, attempt, selection hash, revision/name, or schema.

### Presentation semantics

Cards retain canonical business ordering rather than FIFO ordering. Unit details expose runtime order:

```text
Ready - queue position 2
Publishing - FIFO sequence 3 - attempt 1
Published - <short SHA>
No changes
Failed - queue continued
```

The fixed Fetch and Translation predecessor maps are removed. The card must not display messages such as `Waiting for Japanese Guides publisher` after the migration.

A failed unit does not make the whole card terminal while the queue is still active:

- overall card state remains `running`;
- the failed unit is red;
- the Publish phase shows successful, failed, active, and waiting counts;
- aggregate completion sets the final success/failure/cancelled state.

### Terminal reports

Fetch retains its current terminal card report and fallback flow. Its full-run report remains exactly nine notes:

- one workflow summary;
- four English Guides reports;
- four Chinese Guides reports;
- no `Unavailable` section.

FIFO facts are included in the existing workflow summary, not added as a tenth note.

Translation gains an equivalent terminal card report artifact and fallback finalizer so a monitor failure cannot leave the card permanently running.

## Failure Recovery

The design does not resume unsafe in-process state after a coordinator crash.

- A Fetch unit failure is recovered through the existing single-group workflow interface.
- A Translation unit failure is recovered through the existing locale/group selection and recovery-artifact mechanism.
- A Guides validation failure retains its staging ref for diagnosis, but any new publication attempt recomposes from the latest target tip.
- A workflow rerun must provide complete artifacts and descriptors for its current run attempt.
- If GitHub's `Re-run failed jobs` does not recreate the required current-attempt artifacts, the coordinator fails closed and instructs the operator to dispatch a new workflow run.
- Translation recovery IDs may reuse retained successful translation artifacts in the new run.

Successful units are not automatically reverted when another unit fails.

## Rollback

Publication rollback uses normal revert commits, never force push or target reset.

The results document records every commit created by a unit. Checkpoint units usually create one commit; Guides may create one commit per batch; reconciliation is recorded separately.

To roll back published content:

1. revert a dependent reconciliation commit first;
2. revert the selected unit's commits in reverse order;
3. rerun the relevant validations;
4. push the rollback as a normal commit.

The workflow implementation itself is rolled back by reverting the cutover commit and starting a new run. A run that has partially used FIFO must not automatically switch to the legacy publisher chain because that would introduce a second writer and duplicate publication risk.

## Mandatory Staged Migration

The feature must not ship as one big-bang workflow replacement.

### Phase 1: contracts and descriptors, no production behavior change

Deliver:

- selection, descriptor, progress, and result schemas;
- validators and canonical serializers;
- FIFO scheduler unit tests;
- producer descriptor uploads after existing artifacts;
- strategy interfaces and fault-injection seams.

Production publishing continues through the existing fixed publisher chains. The new coordinator does not write Git or update the authoritative card state.

Exit gate:

- existing workflow tests and builds pass;
- descriptor artifacts appear for every successful producer;
- current successful Fetch and Translation behavior is unchanged.

### Phase 2: shadow observer and local transaction engine

Deliver:

- read-only `publish_ready_shadow` orchestration;
- Jobs/Artifacts polling and FIFO calculation;
- artifact preflight in shadow mode;
- common handler and both strategies behind local/test entrypoints;
- immutable progress snapshots not yet consumed by the authoritative card;
- real-artifact replay harness.

The shadow observer never composes, commits, or pushes.

Exit gate:

- at least two representative successful full runs produce complete shadow results;
- every selected unit resolves to the expected producer and artifacts;
- calculated FIFO order matches Jobs API completion order;
- local real-artifact replay and fault injection pass;
- canonical and FIFO replays produce identical final trees.

### Phase 3: Fetch canary and cutover

Deliver:

- a temporary manual FIFO canary workflow targeting an isolated branch;
- Fetch coordinator Git publication;
- results-based barrier, handoff, verification, and aggregate;
- progress-snapshot consumption by the Fetch card monitor;
- unchanged nine-note final report.

Translation remains on its current publisher implementation during this phase.

Exit gate:

- artifact-only canary passes without Git mutation;
- isolated-branch full publication passes;
- one full `all` Fetch run on `dev` completes successfully;
- every successful unit SHA is contained in final `dev`;
- Translation handoff starts only after all Fetch publications succeed;
- the final Feishu card contains exactly nine complete notes.

Rollback:

- revert only the Fetch cutover commit;
- dispatch a new run using the legacy Fetch chain;
- do not rewrite already published content automatically.

### Phase 4: Translation canary and cutover

Deliver:

- Translation progress snapshots and terminal report/fallback;
- dynamic SDK publication;
- latest-tip Japanese Guides composition;
- queue-drained reconciliation inside the handler;
- results-based Translation aggregate.

Prefer retained recovery artifacts for the canary to avoid unnecessary paid translation.

Exit gate:

- isolated-branch full Translation publication passes;
- SDK-before-Guides and Guides-after-SDK cache merge scenarios pass;
- CAS drift injection recomposes and revalidates;
- reconciliation uses the handoff source SHA for translation provenance;
- one full production Translation run completes successfully;
- the Translation card reaches an accurate terminal state.

Rollback:

- revert only the Translation cutover commit;
- dispatch a new Translation run using the legacy chain and retained recovery artifacts where valid.

### Phase 5: legacy cleanup

Only after Fetch and Translation have both demonstrated stable production runs:

- remove unreachable fixed publisher job wiring;
- remove fixed predecessor maps from progress-state code;
- remove wrappers that have been fully replaced;
- remove the temporary canary workflow;
- retain recovery components still required by the new handler.

Cleanup is a separate reviewable change and is not combined with either production cutover.

## Test Strategy

Implementation follows test-driven development within every phase.

### Contract tests

- exact selection, descriptor, progress, and result keys;
- canonical serialization and checksums;
- run/attempt/repository/tooling/source/target identity rejection;
- unique units and artifacts;
- Guides batch-set completeness;
- strict terminal-state invariants.

### Scheduler tests

- completion-time FIFO;
- lexical tie breaking;
- delayed descriptor for an earlier completed producer;
- still-running producers do not block;
- producer failure, preflight rejection, publication failure, and continuation;
- single active strategy invariant;
- safe stop after ambiguous remote state;
- artifact-only operation.

### Strategy tests

- checkpoint latest-tip composition, validation, idempotence, and retry;
- translation baseline and cache merging;
- Chinese Guides site ownership environment;
- Guides plan identity and latest-tip ancestry;
- file write/deletion conflicts;
- cache same-key conflicts and unrelated-key preservation;
- staging ref identity and cleanup debt;
- complete Guides revalidation after every recomposition;
- CAS and ambiguous push reconciliation.

### Consumer and card tests

- results-based source barrier and handoff;
- final SHA ancestry checks;
- aggregate partial-success reporting;
- reconciliation gating and provenance;
- progress snapshot selection and stale fallback;
- card canonical ordering with FIFO sequence details;
- running card state after a unit failure while work continues;
- terminal report and fallback ownership;
- Fetch exact nine-note result.

### Workflow policy tests

- one Git writer per workflow;
- no fixed publisher dependency chain after cutover;
- coordinator starts after `prepare` without producer `needs` dependencies;
- producer and monitor permissions remain read-only;
- coordinator has no Feishu credentials;
- handoff remains behind the all-success source barrier;
- multi-group inputs are not added;
- excluded paths remain unchanged.

## Real-Artifact Replay

Before either cutover, download retained artifacts from one representative full Fetch run and one representative full Translation run.

Create isolated local bare remotes with two branches seeded at the same recorded baseline:

```text
canonical/dev
fifo/dev
```

Replay the current fixed order against `canonical/dev` and the recorded producer-completion FIFO against `fifo/dev`.

Requirements:

- preflight every archive before extraction;
- use the exact tooling SHA and job-level environment;
- preserve replay roots, outputs, logs, final SHAs, validation receipts, results JSON, progress snapshots, and card JSON;
- require every expected success lane to end as `published` or `no_changes`;
- compare final Git trees, not commit SHAs;
- require canonical and FIFO final trees to be identical when the same candidates succeed;
- require canonical serialization to make merged state files byte-identical where applicable.

Fetch replay additionally runs:

- source publication barrier;
- exact generated-state restore;
- localization input inventory validation;
- revision inventory validation;
- English and Chinese site validation/builds;
- handoff generation;
- isolated English/Chinese card report collection with exactly nine notes.

Translation replay additionally runs:

- all seven Japanese Guides staging validations;
- selected Japanese SDK validations;
- selected Chinese Reference validations;
- localization inventory generation and validation;
- derived-state reconciliation;
- final site builds.

## Fault-Injection Replay

The real-artifact replay must also prove:

- earliest ready artifact checksum rejection followed by later publication;
- middle-unit validation failure followed by later publication;
- one remote target advance followed by successful recomposition;
- repeated target advance beyond retry bound;
- push command error after an actual successful remote update;
- progress artifact upload failure without publication failure;
- coordinator failure after Guides staging with recoverable staging evidence;
- reconciliation failure without rewriting prior successful units.

The final remote tree in every scenario must contain only commits reported as successfully published.

## Online Validation

### Artifact-only canary

Run a full Fetch selection with publication disabled. Validate descriptors, shadow FIFO, progress reporting, aggregate behavior, and the absence of Git writes.

### Isolated target canary

Run the FIFO workflows against an isolated target branch. Use retained Translation recovery artifacts when possible. Verify actual publication order, single-writer behavior, target ancestry, handoff timing, cache merging, reconciliation, and Feishu card state.

### Production validation

After each cutover, manually trigger the intended full workflow and monitor producers, coordinator, barrier/handoff, final verification or reconciliation, aggregate, and card finalization to terminal completion. Inspect failed logs immediately and retain the run evidence.

The run does not need to exhibit an order inversion if producers happen to complete canonically. It must prove that the recorded publication sequence exactly follows completion timestamps.

## Change Scope

Implementation may change:

- `fetch-docs.yml` and `translate-codex.yml` orchestration;
- producer and translation reusable workflows to emit descriptors;
- publication reusable workflows or their extracted transaction cores;
- checkpoint and Guides staging/publication modules;
- source barrier, handoff consumers, aggregate input, and progress-state modules;
- Fetch and Translation card monitors and finalizers;
- focused workflow, publication, recovery, aggregate, and reporting tests;
- new schema, coordinator, strategy, progress, results, replay, and canary files.

Existing artifact payload schemas should remain unchanged unless a phase-specific failing test proves a required extension. New descriptor and result artifacts wrap existing artifacts rather than replacing their content contracts.

## Explicitly Out of Scope

- arbitrary multi-group selection;
- overlapping Fetch and Translation generations;
- cross-run or cross-workflow FIFO;
- atomic publication or automatic rollback;
- force pushes or target resets;
- deployment, release records, image promotion, or rollback contracts;
- Jenkins build interfaces;
- `scripts/doc-publish-bot/**`;
- `.github/workflows/**` changes unrelated to Fetch/Translation publication and reporting;
- `migration/reports/**`;
- rewriting historical evidence;
- deprecated `zdoc_cn` behavior.

The untracked `.claude/specs/2026-08-03-fetch-docs-multi-group-selection.md` remains read-only user material and must not be modified or committed as part of this work.

## Acceptance Criteria

- Fetch and Translation publication no longer wait on fixed canonical publisher chains after their respective cutovers.
- Runtime order is strict producer-completion FIFO with deterministic tie breaking.
- A unit-level failure is terminal for that unit but later ready units continue.
- Every workflow run has one Git writer.
- Fetch-to-Translation handoff still waits for every selected source publication to succeed.
- Japanese Guides safely recomposes from the latest target tip without weakening plan, artifact, ownership, checksum, cache, or validation guarantees.
- Translation reconciliation is a queue-drained finalization owned by the same writer.
- Reference translation provenance remains distinct from publication SHAs.
- Final successful trees match canonical replay trees for the same artifacts.
- Feishu cards show real dynamic queue state, partial failures, and accurate terminal results.
- Fetch full-run card output remains exactly nine complete notes.
- Current production behavior remains unchanged through the contract and shadow phases.
- Fetch and Translation cut over independently with separate canary, evidence, and rollback points.
- Multi-group publication is not started in this phase.
