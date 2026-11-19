# Parallel Documentation Orchestration and Guides Split Design

## Goal

Make an all-manual documentation run report truthful live progress, allow each completed manual to enter publication and translation without waiting for `guides`, and shorten the `guides` critical path by fetching its shared Feishu sources once and rendering SaaS and BYOC in parallel.

## Confirmed Problems

The all-groups card is intentionally disconnected from reusable job updates. `prepare` currently emits an empty `phase_card_id` when `selected_group == 'all'`, so successful producer jobs skip their progress-reporting steps. Re-enabling the existing ordered phase updater would be incorrect because parallel completions can overwrite one another and imply that earlier unrelated stages are complete.

The workflow also contains a single cross-group chain. Python source publication depends on guides translation publication, Java depends on Python translation publication, and the remaining manuals continue in the same pattern. Consequently, a slow guides producer prevents already completed REST, Go, CLI, Node, and Java producers from publishing or starting translation.

Finally, the existing guides producer performs one source download followed by two target renders in one runner. BYOC already uses `-skipS`, so the source download is not duplicated, but SaaS and BYOC rendering remain sequential and keep the runner occupied for the sum of both render durations.

## Architecture

### Independent Manual Lanes

Each content group becomes an independent lane:

```text
produce(group) -> publish source(group) -> translate(group) -> publish translation(group)
```

There are no dependencies on another content group's translation publication. Source and translation publishers may become ready concurrently. The existing `publish-checkpoint.sh` is the write-conflict mechanism: it fetches the latest target branch, applies only the checkpoint's declared disjoint ownership, validates, attempts a fast-forward push, and retries a non-fast-forward rejection from a fresh target head.

This design relies on the existing content ownership invariant enforced by `content-groups.js`. Publication retries remain bounded. A publication that cannot push after the configured attempts fails visibly rather than silently dropping a checkpoint.

Translation generation starts from the exact source publication SHA emitted by that group. Translation publication retains the baseline artifact used to merge the shared translation cache. A multi-group publish-enabled test must prove concurrent translation publications before the change is considered merge-ready.

### Authoritative All-Groups Card State

For `group=all`, progress is reconstructed from GitHub Actions job state rather than inferred from an ordered stage index. A reporter obtains the current run's complete job list through the GitHub Actions API, maps reusable job names to group and phase, and builds an exact card state.

The card uses five aggregate stages:

- Produce manuals: completed/requested, with failures called out.
- Publish sources: completed/eligible, with failures called out.
- Translate manuals: completed/eligible, with failures called out.
- Publish translations: completed/eligible, with failures called out.
- Verify: pending, running, passed, or failed.

A bounded per-manual Markdown table shows the latest source and translation status for every requested group. The update replaces the complete derived state, so it does not use the single-group assumption that all preceding stages are complete. Reporting remains non-fatal. Concurrent reporters can temporarily race, but every reporter reads the authoritative run state and the final aggregate performs a final exact update, preventing a stale terminal card.

Single-group workflows keep the existing detailed ordered phases because their jobs are sequential and the stateless phase updater is correct for that topology.

### Shared Guides Source Artifact

The guides producer is decomposed into three reusable units:

```text
fetch shared guides sources
           |
           +--> render SaaS --+
           |                  +--> assemble and validate guides checkpoint
           +--> render BYOC --+
```

The source job runs the shared Feishu/Base fetch once in source-only mode. It creates a per-run Actions artifact containing:

- `plugins/lark-docs/meta/sources/guides/**`;
- the incremental fetch plan;
- the broken-content-link report when the shared source scan produces one;
- a manifest containing schema version, manual, master SHA, dev baseline SHA, build environment, file hashes, and creation time.

The artifact contains no credentials, generated documentation, translation cache, or Git metadata. Archive paths and file hashes are validated before either renderer consumes it.

The SaaS and BYOC renderers both restore the same immutable dev baseline, download and validate the same source artifact, and render with `-skipS`:

- SaaS owns `docs`, `config/generated/guides.sidebar.js`, and the target-scoped canonical-link audit reports.
- BYOC owns `docs-byoc` and `config/generated/guides-byoc.sidebar.js`.

The source stage owns the incremental plan and shared broken-content-link report. The SaaS renderer runs the canonical audit against the restored common sources with `zilliz.saas` as the target, preserving the current report semantics without making BYOC regenerate or overwrite those reports.

Each renderer uploads a target-scoped render artifact. An assembler downloads both artifacts, validates their disjoint manifests, overlays them on one baseline, performs the full guides validation/build, updates the single shared `guides-uat-last-success.json` with both targets, and emits the existing `guides` source checkpoint. Publication and translation therefore retain one atomic guides group: neither a partial SaaS-only nor a partial BYOC-only guides update reaches the target branch.

The shared source artifact is intentionally scoped to one workflow run. Cross-run caching is excluded because freshness, retention, and invalidation are unnecessary for the requested efficiency improvement.

## Failure Semantics

- A shared source fetch failure skips both guides renderers and emits `fetch_failed` for guides.
- A single renderer failure prevents guides assembly and publication; the successful render artifact remains available for diagnostics.
- A guides assembly or validation failure prevents guides publication.
- A failure in one manual lane does not prevent unrelated lanes from publishing and translating.
- Final verification runs after all requested lanes reach terminal states and evaluates the final immutable target SHA.
- Aggregate status remains failed if any requested producer, publisher, translator, translation publisher, or final verification fails.

## Security and Integrity

- Source artifacts use Actions artifact storage with short per-run retention and are never committed to the repository.
- Artifact extraction rejects absolute paths, traversal, links, devices, and unexpected archive roots.
- Every manifest file is checked for size and SHA-256 before rendering or assembly.
- Feishu, model, and AWS secrets remain confined to the jobs and steps that require them.
- Publishers continue to check out immutable master tooling and apply artifacts to the configured target branch.
- Reports remain committed through the final guides checkpoint and are linked from the final Feishu card; they are not uploaded to Feishu Drive.

## Verification

Unit and static workflow tests must cover:

- absence of cross-group `needs` dependencies;
- preservation of each group's internal produce/publish/translate order;
- exact all-groups card-state derivation from representative GitHub job lists;
- failure and skipped-job card mappings;
- source artifact manifest creation, validation, tamper rejection, and path safety;
- disjoint SaaS and BYOC render ownership;
- assembly rejection when either target artifact is missing, stale, overlapping, or tied to a different source artifact;
- a combined guides checkpoint containing both outputs, reports, and one shared snapshot.

End-to-end validation requires one publish-enabled disposable-branch run with at least guides plus two inexpensive manuals. Acceptance criteria are:

1. a completed non-guides producer publishes and starts translation while guides is still rendering;
2. the Feishu card advances aggregate counters before all producers finish;
3. SaaS and BYOC render jobs overlap in time and consume the same source artifact identity;
4. only one atomic guides source checkpoint is published;
5. the final target branch contains all successful source and translation checkpoints;
6. final verification and the terminal Feishu card agree with the GitHub run conclusion.

## Non-Goals

- Reusing guides source artifacts across workflow runs.
- Publishing SaaS and BYOC as separate target-branch commits.
- Uploading reports to Feishu Drive.
- Replacing the existing bounded optimistic publication retry mechanism with an external lock service.
