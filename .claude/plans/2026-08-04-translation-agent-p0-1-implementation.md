# Translation Agent P0.1 Failure-Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the 19-file Java canary failure set without weakening protected-content integrity by allowing natural inline-code order changes inside one source segment, producing non-positional protected-content diagnostics, scoping ambiguous terminology, and giving retry attempts actionable validator feedback.

**Architecture:** Keep `agentRunner.js` as orchestration. `protectedContent.js` will distinguish exact marker identity/inventory from marker ordering: fixed entries retain unique order groups, while multiple inline-code entries on the same source line share a reorder group. Restoration validates the exact marker multiset and the order-group sequence before restoring by marker identity; post-restoration validation compares category/value inventories rather than global array indexes. `localeContract.js` will add context-scoped do-not-translate terms and source-aligned draft evidence. Reviewer schema-constrained output remains optional per provider capability, with deterministic quote and locale checks authoritative.

**Tech Stack:** Node.js CommonJS, `node:test`, `node:assert/strict`, existing OpenAI-compatible `/chat/completions` transport, MDX validation, JSON locale contracts, pnpm.

---

## File map and interfaces

Modify `scripts/translation/protectedContent.js`.

```javascript
protectTranslationInput(sourceContent)
// => {content, manifest: {schemaVersion: 2, entries}}

// Each entry adds:
// orderGroup: string              unique for fixed entries; shared by reorderable inline code
// reorderPolicy: 'fixed' | 'within_group'

restoreProtectedContent(modelContent, manifest)
// Validates exact marker membership/counts and order-group sequence.
// Allows permutations only inside one within_group run.

validateProtectedContent(sourceContent, targetContent)
// Cancels exact category/value matches, then reports only real changed,
// missing, or unexpected protected entries without positional cascades.
```

Modify `scripts/translation/localeContract.js` and both locale JSON files.

```javascript
// Locale contract root adds contextualTerms.
contextualTerms: [{
  source: 'Dedicated',
  target: 'Dedicated',
  caseSensitive: true,
  sourceContexts: ['Dedicated cluster', 'Dedicated deployment', 'Dedicated plan', 'Dedicated tier']
}]

validateLocaleContractDraft(sourceContent, draftContent, contract)
// Enforces contextualTerms only when a declared source context occurs.
// Every deterministic draft_quote is an actual offending term or the
// non-empty draft line corresponding to the source occurrence.
```

Modify `scripts/translation/reviewEvidence.js`.

```javascript
REVIEW_RESPONSE_JSON_SCHEMA
// Frozen strict JSON Schema matching the existing pass/issues contract.
```

Modify `scripts/translation/agentRunner.js`.

```javascript
buildTranslationMessages({...existing, retryFeedback})
// Adds <retry_feedback> only on a retry caused by protected transport/content.

processItemWithRetry(item, options)
// Calls options.processItem(item, attempt, retryFeedback).

createProviderCall(agentConfigs, options)
// Adds response_format=json_schema for configs with structuredOutput: true.
```

Modify the Chinese/Japanese translation and correction prompts so they require exact marker identity/counts, allow only necessary same-segment inline-code ordering, and continue to prohibit marker movement across structure.

No handoff schema, checkpoint schema, source-fetch behavior, recovery-artifact schema, target mapping, or publication ordering changes.

## Task 1: Segment-scoped marker reordering

**Files:**

- Modify: `scripts/translation/protectedContent.test.js`
- Modify: `scripts/translation/protectedContent.js`

- [ ] **Step 1: RED — accept natural inline-code order within one line**

Add a test with source prose containing `` `VarChar` `` followed by `` `maxLength` `` on the same line. Protect the source, swap only those two exact marker transports, restore, and assert that the restored Chinese-order sentence contains both original inline-code byte strings in the swapped order.

Run:

```bash
node --test --test-name-pattern='same-line inline code' scripts/translation/protectedContent.test.js
```

Expected failure: `restoreProtectedContent` throws `Protected markers were altered or reordered during translation` because the current implementation requires global marker order.

- [ ] **Step 2: GREEN — add order groups**

Assign each fixed entry a unique `fixed:<index>` order group. Assign two or more `inline_code` entries on the same source line a shared `inline-line:<line-index>` group with `reorderPolicy: 'within_group'`. Validate marker membership/counts first, then compare the compressed expected and actual order-group sequences. Restore each marker by identity.

- [ ] **Step 3: Verify GREEN**

Run the same focused command. Expected: the new test passes.

- [ ] **Step 4: RED — reject crossing a fixed boundary or another line**

Add independent cases that swap inline-code markers across a heading anchor, across a fenced code block, and across source lines. Assert each throws an order-group error.

Expected failure: the first implementation is too permissive if it only compares marker multisets.

- [ ] **Step 5: GREEN — enforce group-run order**

Map every actual marker back to its manifest entry and require the compressed order-group list to equal the source list. Keep fixed entries unique. Do not add document-global `allowReorder` behavior.

- [ ] **Step 6: RED/GREEN — preserve fail-closed membership errors**

Split the existing combined marker test into missing, duplicate, forged/unknown, malformed, allowed same-group reorder, and forbidden cross-group reorder assertions. Error text must identify the relevant marker index when available.

Run:

```bash
node --test scripts/translation/protectedContent.test.js
```

Expected: all marker integrity and fenced-code byte-preservation tests pass.

## Task 2: Non-positional protected-content diagnostics

**Files:**

- Modify: `scripts/translation/protectedContent.test.js`
- Modify: `scripts/translation/protectedContent.js`

- [ ] **Step 1: RED — one inserted anchor must not shift every later diagnostic**

Add a source containing inline code, a heading anchor, and a fenced block. Add exactly one new target heading anchor before them. Assert `validateProtectedContent` returns one `Unexpected protected heading_anchor` error and does not report the unchanged fenced block or inline code.

Expected failure: the current positional array comparison emits multiple cascading mismatches.

- [ ] **Step 2: GREEN — cancel exact inventory entries**

Build multisets keyed by `category + NUL + original`. Cancel exact source/target occurrences. Group the remaining entries by category. Pair one unmatched source and target entry of the same category as a real changed-value diagnostic; emit leftovers as missing or unexpected entries.

- [ ] **Step 3: RED — distinguish changed, missing, and unexpected values**

Add tests for changing `` `client.search()` `` to `` `client.query()` ``, deleting an anchor, and adding inline code that did not exist in source. Assert concise category-specific diagnostics with digests and no unrelated entries.

- [ ] **Step 4: GREEN/refactor — deterministic diagnostic ordering**

Sort diagnostics by category and source/target occurrence order, keep the result frozen, and retain the Go identical-frontmatter regression.

- [ ] **Step 5: Verify**

Run:

```bash
node --test scripts/translation/protectedContent.test.js
```

Expected: all tests pass with no positional cascade.

## Task 3: Context-scoped terminology and real evidence

**Files:**

- Modify: `config/translation/zh-CN-reference.json`
- Modify: `config/translation/ja-JP.json`
- Modify: `scripts/translation/localeContract.test.js`
- Modify: `scripts/translation/localeContract.js`
- Modify: `scripts/translation/recovery-artifact.test.js`

- [ ] **Step 1: RED — ordinary Dedicated adjective is translatable**

Add assertions that `Dedicated builder methods` translated as `专用构建方法` produces no issue, while `Dedicated deployment` translated as `专用部署` produces an issue whose required target is `Dedicated`.

Expected failure: `Dedicated` is currently a global `doNotTranslate` token and flags both contexts.

- [ ] **Step 2: GREEN — add contextualTerms schema**

Add exact validation for `contextualTerms` and `sourceContexts`; require every context to contain its source token under the declared case sensitivity. Remove `Dedicated` from global `doNotTranslate` and declare only product-context phrases in Chinese `contextualTerms`. Use an empty contextual list for Japanese unless a confirmed ambiguous term exists.

- [ ] **Step 3: RED — deterministic evidence must point to the actual draft line**

Use multi-line protected-marker-like source/draft text where a do-not-translate violation occurs late in the document. Assert `draft_quote` equals a substring from the corresponding violating draft line and is not the document-opening marker.

Expected failure: `boundedDraftQuote` currently falls back to the first 160 trimmed characters.

- [ ] **Step 4: GREEN — source-aligned draft evidence**

Prefer an exact forbidden target. Otherwise locate the source occurrence line number and return the non-empty draft line at the same index, bounded to 160 characters. If no truthful non-empty draft quote can be located, do not emit a correction-authorizing deterministic issue.

- [ ] **Step 5: Verify Compaction and prompt hash**

Run:

```bash
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/recovery-artifact.test.js
```

Expected: `Compaction` remains mandatory English; `compression` remains ordinary `压缩`; Dedicated behavior is context-scoped; locale contract changes alter `promptContractSha256`.

## Task 4: Optional strict Reviewer schema and actionable retry feedback

**Files:**

- Modify: `scripts/translation/reviewEvidence.test.js`
- Modify: `scripts/translation/reviewEvidence.js`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/agentRunner.js`
- Modify: `.github/prompts/codex-translation-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-translation-agent.ja-JP.md`
- Modify: `.github/prompts/codex-correction-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-correction-agent.md`

- [ ] **Step 1: RED — strict schema is exact**

Add a test that `REVIEW_RESPONSE_JSON_SCHEMA` requires exactly `pass` and `issues`, rejects additional properties at both levels, carries the existing enums, and requires all evidence fields.

Expected failure: no exported provider schema exists.

- [ ] **Step 2: GREEN — export frozen JSON Schema**

Define the schema next to the runtime parser so the provider contract and deterministic parser cannot drift independently.

- [ ] **Step 3: RED — provider capability controls response_format**

Capture mocked fetch bodies. Assert a review config with `structuredOutput: true` sends `{type:'json_schema', json_schema: REVIEW_RESPONSE_JSON_SCHEMA}` and that translation or an unsupported review provider sends no `response_format`.

Expected failure: `createProviderCall` currently sends only model, messages, and temperature.

- [ ] **Step 4: GREEN — capability-gated request body**

Read `REVIEW_AGENT_STRUCTURED_OUTPUT=true` in `loadAgentConfigsFromEnv`; do not auto-enable it for unknown OpenAI-compatible providers. Keep runtime `parseAndValidateReviewEvidence` checks unchanged and authoritative.

- [ ] **Step 5: RED — protected failures feed the next translation attempt**

Have `processItemWithRetry` return a protected marker failure once and succeed on retry. Assert the second callback receives a bounded retry feedback string. Assert an ordinary semantic review failure does not become transport feedback.

Expected failure: retry callbacks currently receive only the item.

- [ ] **Step 6: GREEN — pass typed retry feedback**

Classify only `Protected marker...` and `Protected content...` failures as actionable transport feedback. Pass the previous failure to the next callback and append it inside a `<retry_feedback>` block in Translation messages. Never send a corrupted draft to Correction.

- [ ] **Step 7: Update marker prompt language**

Require exact marker identity and counts, prohibit cross-structure movement, and permit necessary reordering only among inline-code markers in the same prose segment. Keep fenced code byte preservation and `Compaction` rules unchanged.

- [ ] **Step 8: Verify**

Run:

```bash
node --test scripts/translation/reviewEvidence.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
```

Expected: all tests pass; only provider-declared strict output receives `response_format`; only protected transport/content failures produce retry feedback.

## Task 5: Canary 19-file local replay

**Files:**

- Read only: `/private/tmp/zdoc-translation-agent-p0-online-canary-30873886876-3/artifacts/translation-report-zh-CN-reference-java-30892090555/translation-report.json`
- Generated temporary manifest: `<replay-root>/tmp/translation-p0-1-failed-19-manifest.json`
- Generated report: `<replay-root>/tmp/translation-p0-1-failed-19-report.json`

- [ ] **Step 1: Verify immutable input identity**

For all failed report entries, hash the corresponding worktree source and require equality with `sourceHash`. Require exactly 19 entries and source checkpoint `7222c14ba96d432c67f9d38020d5c6bdb019ee09`.

- [ ] **Step 2: Create an isolated replay root**

Create a resolved `mktemp -d` root, export the committed worktree with `git archive HEAD`, and link the existing `node_modules`. Do not run the translation against the development worktree because successful files write target content and manifests.

- [ ] **Step 3: Generate the 19-item manifest from the retained report**

Select only failed results and retain exactly `sourcePath`, `targetPath`, `sourceHash`, `locale`, `type`, and `reason`. Set target `zh-CN-reference`, locale `zh-CN`, group `java`, and the immutable Java source checkpoint SHA.

- [ ] **Step 4: Run real translation-review-correction locally**

Load credentials from the main workspace `.env` without printing them. Use conservative concurrency and retain all outputs:

```bash
TRANSLATION_CONCURRENCY=2 \
TRANSLATION_FILE_RETRIES=1 \
TRANSLATION_MAX_REVIEW_ROUNDS=2 \
TRANSLATION_ALLOW_PARTIAL=true \
node scripts/translation/agentRunner.js \
  --manifest tmp/translation-p0-1-failed-19-manifest.json \
  --report tmp/translation-p0-1-failed-19-report.json
```

Expected: all 19 files are attempted; no publish command or remote mutation occurs. Record translated/failed counts and every residual failure category rather than assuming all files pass.

- [ ] **Step 5: Validate successful replay outputs**

For every translated result, verify target file existence, source protected-content preservation, MDX compilation/structure, locale contract, fenced-code byte identity, and `Compaction` preservation. Confirm failed items did not overwrite their replay baseline target.

## Task 6: Occurrence-aligned mandatory-term evidence

**Files:**

- Modify: `scripts/translation/localeContract.test.js`
- Modify: `scripts/translation/localeContract.js`
- Modify: `config/translation/zh-CN-reference.json` and `config/translation/ja-JP.json` only to advance both contract IDs after the shared validator semantics change

- [ ] **Step 1: RED — repeated mandatory terms must cite every still-invalid occurrence**

Add a regression with two source lines containing `database`. The first draft line already contains `Database`; the second still contains `数据库`. Assert that validation returns exactly one issue, that its `draft_quote` is the second line, and that its location identifies that source line.

Run:

```bash
node --test --test-name-pattern='still-invalid mandatory-term occurrence' scripts/translation/localeContract.test.js
```

Expected failure: the current validator compares document-wide counts and always derives evidence from the first source occurrence, so it reports the already-correct first draft line.

- [ ] **Step 2: GREEN — align mandatory-term deficits by source/draft line**

When a mandatory term is globally deficient, inspect each corresponding source/draft line. Emit one issue for every line whose required target count is below that line's source occurrence count. Include the one-based source line in `location`, keep `source_quote` and `draft_quote` as real contiguous substrings, and retain the existing bounded fallback only when line-aligned evidence is unavailable.

- [ ] **Step 3: Verify the full locale contract suite**

Run:

```bash
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/reviewEvidence.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
```

Expected: repeated occurrences authorize correction at the actual remaining line; `Compaction`, `Dedicated`, review-evidence, and prompt-contract hash regressions remain green.

- [ ] **Step 4: Replay the exact residual file**

Export the updated commit into a new isolated `/tmp` replay root, reuse the verified source/checkpoint and baseline from the 19-file replay, and create a one-item manifest for:

`content/en/reference/api/java/java/v2/v2-FileResources/v2-FileResources-listFileResources.md`

Run the real translation-review-correction chain with `publish=false` semantics and the same conservative limits. Expected: one translated result, zero failures, byte-identical protected content, valid MDX, and no remaining locale-contract issues.

## Task 7: Full local verification

**Files:** all modified files above.

- [ ] **Step 1: Focused and runner tests**

```bash
node --test scripts/translation/protectedContent.test.js
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/reviewEvidence.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
node --test scripts/translation/restSpecLocalization.test.js
```

- [ ] **Step 2: Repository gates**

```bash
pnpm test:translation
pnpm test:workflow-policy
git diff --check
```

- [ ] **Step 3: Hash and status audit**

Record the prior and new `promptContractSha256`, confirm the new locale/prompt bytes changed it, then inspect:

```bash
git status --short
git diff --stat
git diff -- scripts/translation config/translation .github/prompts .claude/plans/2026-08-04-translation-agent-p0-1-implementation.md
```

Expected: only P0.1 plan, tests, implementation, locale contracts, and marker prompt files are changed. No online workflow dispatch, publication, PR, or push is part of this plan.
