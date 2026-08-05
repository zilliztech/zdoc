# Translation Agent P0.3 REST Review/Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give structured REST specification prose the same evidence-gated Translation–Review–Correction behavior as document prose while preserving exact REST JSON, endpoint metadata, protected tokens, and locale-only mutation.

**Architecture:** Keep REST parsing, localizable-field discovery, locale application, and exact non-locale comparison in `restSpecLocalization.js`. Add a structured batch review loop there: every model-facing REST entry remains `{id,text}`, Reviewer issues must cite source and draft substrings from the same entry and identify that entry ID, and Correction must return the exact same ID inventory. Reuse `protectedContent.js`, `localeContract.js`, and `reviewEvidence.js`; keep `agentRunner.js` responsible only for selecting the REST path and handling the resulting pass/fail status.

**Tech Stack:** Node.js CommonJS, `node:test`, strict JSON model responses, existing OpenAI-compatible agent transport, locale contracts, protected-content markers, existing MDX validation, pnpm.

---

## File map and interfaces

Modify `scripts/translation/restSpecLocalization.js`.

```javascript
parseRestEntryResponse(modelText, expectedEntries)
// => expected entries plus raw `translation` strings.
// Requires exact entry count, unique known IDs, and no missing IDs.

restoreRestEntries(parsedEntries)
// Restores each entry's marker manifest and validates protected-content bytes.

validateRestReviewEvidence(evidence, sourceEntries, draftEntries)
// Keeps only generic Reviewer issues whose source_quote and draft_quote occur
// in the same REST entry and whose location names that exact entry ID.

reviewAndCorrectRestBatch({entries, target, locale, callModel, maxReviewRounds})
// => {entries, review}
// Runs Reviewer, combines validated Reviewer issues with deterministic locale
// issues, authorizes Correction only for the combined validated set, restores
// and validates every Correction response, and fails closed at the round limit.

translateRestSpecs({sourceSpecs, target, locale, callModel, maxReviewRounds = 2})
// => {localized, translatedCount, review}
```

Modify `scripts/translation/agentRunner.js`.

```javascript
translateRestSpecs({...existing, maxReviewRounds})
// A failed REST spec review returns a failed item before assembly or write.
// A successful result records `restSpecReview` without changing report schema.
```

Add prompts:

- `.github/prompts/codex-rest-spec-review-agent.md`
- `.github/prompts/codex-rest-spec-correction-agent.md`

Both targets reference these shared structured prompts through `promptNamesFor`. `recovery-artifact.js` already hashes every prompt name returned by that map, so adding the names changes `promptContractSha256` without changing the recovery schema.

No handoff schema v2, checkpoint schema, source fetch, manifest schema, target mapping, or publication order changes.

## Task 1: Strict structured REST response transport

**Files:**

- Modify: `scripts/translation/restSpecLocalization.test.js`
- Modify: `scripts/translation/restSpecLocalization.js`

- [ ] **Step 1: RED — reject changed REST entry identity**

Add focused cases where a model response has a missing ID, duplicate ID, unknown replacement ID, or changed entry count. Use `translateRestSpecs` with a one-batch source and assert rejection before locale application.

Run:

```bash
node --test --test-name-pattern='REST response identity' scripts/translation/restSpecLocalization.test.js
```

Expected failure: the current parser rejects several malformed cases indirectly but has no explicit reusable transport function or Correction-path coverage.

- [ ] **Step 2: GREEN — split parsing from restoration**

Implement `parseRestEntryResponse` and `restoreRestEntries`. Preserve expected source metadata rather than spreading model-returned objects. Reordering may be normalized by ID, but membership and count must be exact.

- [ ] **Step 3: Verify GREEN**

Run the focused command and the complete REST test file. Expected: malformed identities fail closed and existing protected-token tests remain green.

## Task 2: Evidence-bound REST Reviewer

**Files:**

- Create: `.github/prompts/codex-rest-spec-review-agent.md`
- Modify: `scripts/translation/restSpecLocalization.test.js`
- Modify: `scripts/translation/restSpecLocalization.js`
- Modify: `scripts/translation/agentRunner.test.js`

- [ ] **Step 1: RED — source and draft quotes must belong to one entry**

Create two REST entries. Return a Reviewer issue whose `source_quote` exists only in entry A, whose `draft_quote` exists only in entry B, and whose location names entry A. Assert the issue is unsupported, no Correction call occurs, and an otherwise valid draft is accepted unchanged.

Run:

```bash
node --test --test-name-pattern='same REST entry' scripts/translation/restSpecLocalization.test.js
```

Expected failure: REST batches currently never call Reviewer and cannot enforce same-entry evidence.

- [ ] **Step 2: RED — location must name the matching entry ID**

Return real same-entry quotes but an empty/generic location that does not contain the entry ID. Assert no Correction authorization and record the allegation as unsupported.

Expected failure: no REST-specific evidence binding exists.

- [ ] **Step 3: GREEN — add structured review messages and filtering**

Add `restReview` to `promptNamesFor`. Reviewer receives JSON arrays inside explicit `<source>` and `<draft>` boundaries plus the locale contract. Parse with `parseAndValidateReviewEvidence`, then require a common matching entry and an exact entry ID in `location`. Preserve rejected allegations in `unsupportedIssues` with a bounded reason.

- [ ] **Step 4: RED/GREEN — contradictory and fatal Reviewer results**

Assert `pass=true` with issues and malformed/unknown-field JSON fail the REST batch without Correction. Assert `pass=false` with no validated issues leaves the valid draft unchanged, matching document-runner semantics.

## Task 3: Structured Correction and deterministic locale issues

**Files:**

- Create: `.github/prompts/codex-rest-spec-correction-agent.md`
- Modify: `scripts/translation/restSpecLocalization.test.js`
- Modify: `scripts/translation/restSpecLocalization.js`

- [ ] **Step 1: RED — deterministic Compaction issue drives REST Correction**

Translate `Compaction plans merge segments.` as `压实计划会合并 Segment。`. Have Reviewer return `pass=true`; assert the deterministic locale issue still invokes Correction, the Correction prompt receives only validated issues, and the final translation is `Compaction 计划会合并 Segment。`.

Run:

```bash
node --test --test-name-pattern='deterministic REST terminology' scripts/translation/restSpecLocalization.test.js
```

Expected failure: the current REST path throws immediately on the locale issue and has no Correction loop.

- [ ] **Step 2: GREEN — implement review/correction rounds**

Add `restCorrection` to `promptNamesFor`. For every round, protect the current translated entries, review their JSON form, merge same-entry Reviewer issues with entry-scoped deterministic locale issues, and call Correction only when validated issues remain and rounds are available.

- [ ] **Step 3: RED — Correction may change only text for exact IDs**

Add cases where Correction removes an ID, duplicates an ID, invents an ID, changes a protected inline-code token, or inserts new inline-code structure. Assert fail closed before applying `x-i18n`.

- [ ] **Step 4: GREEN — restore and revalidate every Correction**

Parse Correction with the same identity transport, restore against each current draft manifest, run `validateProtectedContent`, and rerun locale validation on the next review round. Do not write partial locale output on failure.

- [ ] **Step 5: RED/GREEN — only validated issues reach Correction**

Return one same-entry issue and one cross-entry issue. Inspect `<review_json>` and assert Correction receives only the same-entry issue; the unsupported issue remains diagnostic metadata.

## Task 4: Runner integration and recovery identity

**Files:**

- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/recovery-artifact.test.js`

- [ ] **Step 1: RED — REST process runs Translation, Review, Correction, Review**

Extend `testRestSpecsUseStructuredLocaleTranslation` so the structured spec batch first receives a valid Reviewer issue, is corrected, and passes a second review. Assert the spec call sequence is exactly `translation, review, correction, review`; the shell continues to use its independent document review.

Expected failure: current REST spec batches call only `translation`.

- [ ] **Step 2: GREEN — pass review limits and stop before write on failure**

Pass `maxReviewRounds` into `translateRestSpecs`. If `specResult.review.pass` is false, return a failed item with `restSpecEntries` and no target write. On success retain the shell review in `review` and add `restSpecReview` for structured diagnostics.

- [ ] **Step 3: RED/GREEN — REST prompt changes alter recovery hash**

In a temporary repository fixture, mutate `codex-rest-spec-review-agent.md` and then `codex-rest-spec-correction-agent.md`; assert each mutation changes `promptContractSha256` for both targets.

- [ ] **Step 4: Verify runner integration**

Run:

```bash
node --test scripts/translation/restSpecLocalization.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
```

## Task 5: Real REST checkpoint replay

**Inputs:**

- Fetch run: `30873886876`
- Source baseline: `478aac6970af6ef944efb8c5df9a05f9444898da`
- CLI/REST checkpoint: `8ded19dc9c3a65284757f6030b2ba40bd2408c39`
- Retained preflighted artifact: `/private/tmp/zdoc-translation-agent-p0-replay-30873886876/extracted/rest`

- [ ] **Step 1: Verify retained artifact identity**

Read its checkpoint manifest and require group `rest`, the source baseline/checkpoint pair above, and successful retained preflight evidence at `/private/tmp/zdoc-translation-agent-p0-replay-30873886876/preflight/rest.json`.

- [ ] **Step 2: Create isolated replay root**

Export the P0.3 commit with `git archive`, reuse the worktree dependency symlinks, and copy only the retained REST checkpoint source and baseline target state into a resolved `mktemp -d` root.

- [ ] **Step 3: Build a bounded real manifest**

Use the existing REST manifest builder and immutable checkpoint SHA. Select a representative bounded set containing multiple `summary`/`description` entries, protected tokens, examples/defaults, and at least one mandatory locale term when present. Record the exact selected paths and source hashes.

- [ ] **Step 4: Run local Translation–Review–Correction**

Load `.env` without printing credentials and run with conservative limits:

```bash
TRANSLATION_CONCURRENCY=1 \
TRANSLATION_FILE_RETRIES=1 \
TRANSLATION_MAX_REVIEW_ROUNDS=2 \
TRANSLATION_ALLOW_PARTIAL=true \
node scripts/translation/agentRunner.js \
  --manifest tmp/translation-p0-3-rest-manifest.json \
  --report tmp/translation-p0-3-rest-report.json
```

Expected: every selected file reaches a terminal result; successful files contain only locale additions, unchanged example/default/enum/value/endpoint/method data, valid protected content, and a passing `restSpecReview`. Record failures by actual category rather than weakening the contract.

## Task 6: Full local verification

- [ ] **Step 1: Focused tests**

```bash
node --test scripts/translation/restSpecLocalization.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/reviewEvidence.test.js
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/protectedContent.test.js
node --test scripts/translation/recovery-artifact.test.js
```

- [ ] **Step 2: Repository gates**

```bash
pnpm test:translation
pnpm test:workflow-policy
git diff --check
git status --short --branch
```

- [ ] **Step 3: Prompt-contract and scope audit**

Record the prior and new hashes for `zh-CN-reference` and `ja-JP`. Inspect the branch diff and require that only the P0.3 plan, REST prompts, REST localization/tests, runner/tests, and recovery hash tests changed. Confirm no handoff, checkpoint, source-fetch, or publication workflow file changed.

## Online canary preparation

Do not dispatch without a separate online step. After local gates pass, generate a schema-v2 `zh-CN/rest` handoff using the P0.3 commit as `toolingSha`, a freshly read `dev` SHA as every `targetBaselineSha`, source baseline `478aac6970af6ef944efb8c5df9a05f9444898da`, source checkpoint `8ded19dc9c3a65284757f6030b2ba40bd2408c39`, no recovery run IDs, and `publish=false`.
