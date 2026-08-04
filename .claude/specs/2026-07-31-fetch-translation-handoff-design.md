# Fetch-to-Translation Workflow Handoff

## Goal

Separate source production from translation execution:

- `fetch-docs.yml` owns source fetch, render, assembly, validation, and optional source publication.
- `translate-codex.yml` is the only workflow that performs translation, restores translation recovery artifacts, validates translated output, and publishes translations.
- When requested, `fetch-docs.yml` triggers one downstream `translate-codex.yml` orchestration after all selected source publications succeed.

## Workflow boundary

`fetch-docs.yml` must not contain translation producers, translation batch preparation, translation publishers, translation recovery, or translated-site verification jobs. Its translation-related responsibility is limited to validating handoff inputs, dispatching `translate-codex.yml`, and recording the downstream run identity.

The handoff passes exact immutable identities:

- tooling SHA used by the translation workflow;
- final source publication SHA for each selected content group;
- target branch;
- selected group;
- publish intent;
- optional recovery run IDs when explicitly supplied by a manual caller.

The handoff occurs only after selected source publication succeeds or reports `no_changes`. A failed or incomplete source publication must prevent translation dispatch.

## Translation selection

For SDK groups `python`, `java`, `node`, `go`, `cli`, and `rest`, one downstream orchestration selects both:

- `ja-JP/<group>`;
- `zh-CN-reference/<group>`.

For `guides`, it selects only `ja-JP/guides`. Chinese Cloud and BYOC Guides are fetched directly from the Chinese Feishu source and must never enter paid translation.

For `all`, the orchestration expands to Japanese Guides plus both Japanese and Chinese Reference targets for every selected SDK group.

## Parallel translation and serial publication

Translation producer jobs run in parallel whenever they do not depend on one another. Producers are read-only with respect to the target branch and upload checkpoint, baseline, report, and per-file recovery artifacts.

Publication begins only after the corresponding producer succeeds. All publishers form one deterministic queue and write to the target branch serially. The default order is:

1. Japanese Guides, when selected.
2. Japanese SDK group.
3. Chinese Reference SDK group.
4. Repeat the Japanese/Chinese pair in canonical group order: `python`, `java`, `node`, `go`, `cli`, `rest`.

Each publisher must authenticate the current target SHA, apply its exact checkpoint with three-way state merging, run its group-scoped validation, and retry or fail with recoverable artifacts when the target branch advances. Translation producers must not be rerun merely because publication was delayed or conflicted.

## Downstream orchestration

`translate-codex.yml` accepts a selection capable of representing both locales in one run. It expands the selection before paid work, runs the required producers in parallel, then serializes publishers through explicit dependencies.

`fetch-docs.yml` dispatches this workflow once rather than dispatching independent locale runs. This keeps publication order, aggregate status, recovery instructions, and cost reporting in one downstream run.

The fetch workflow records the dispatched run ID and URL in its final report. Translation failure does not rewrite the already published source result; recovery is performed by rerunning `translate-codex.yml` with the recorded recovery artifacts.

## Manual operation

`translate-codex.yml` remains directly dispatchable. A manual caller can select one target or both targets, one group or all supported groups, choose bootstrap or incremental mode, enable publication, and provide recovery run IDs.

`run_translations=true` in `fetch-docs.yml` means only “dispatch the downstream translation orchestration after source publication.” It does not authorize translation code to execute inside `fetch-docs.yml`.

## Failure handling

- Invalid target/group combinations fail before paid work.
- Missing or non-immutable source identities fail before paid work.
- A producer failure prevents only its dependent publisher; independent producers may finish and preserve artifacts.
- A publisher failure stops later publishers to preserve deterministic branch state.
- Completed producer artifacts remain reusable, so recovery does not repeat successful model calls.
- The final downstream report distinguishes translation failure, validation failure, publication conflict, and successful publication.

## Verification

Tests must enforce:

- no translation implementation jobs remain in `fetch-docs.yml`;
- the handoff waits for successful selected source publication and passes exact SHAs;
- Chinese Guides can never be selected for translation;
- Japanese and Chinese SDK producers are parallel;
- all publishers are explicitly serialized in canonical order;
- publication can reuse existing producer artifacts without invoking the model again;
- workflow policy and exact group validation continue to pass.

## Out of scope

- Changing translation prompts or models.
- Changing translation quality rules.
- Translating Chinese Guides.
- Redesigning source fetch, Guides render, or site deployment beyond removing their embedded translation responsibilities.
