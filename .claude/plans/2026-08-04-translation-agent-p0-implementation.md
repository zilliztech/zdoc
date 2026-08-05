# Translation Agent P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Implement deterministic protected-content recovery, versioned Chinese/Japanese locale contracts, evidence-gated review correction, and recovery-contract invalidation for Translation Agent P0 without changing handoff schema v2, checkpoint schemas, source fetch, or publication ordering.

**Architecture:** Keep scripts/translation/agentRunner.js as the orchestration boundary. Add three focused modules: protectedContent.js owns byte-preserving marker transport and structural comparison; localeContract.js owns exact versioned locale policy and deterministic terminology findings; reviewEvidence.js owns strict Reviewer JSON parsing, quote validation, deduplication, and locale-conflict filtering. Translation, Review, Correction, and REST localization receive the compact locale contract; every Translation and Correction result is restored and validated before another model or filesystem write can observe it.

**Tech Stack:** Node.js CommonJS, node:test, node:assert/strict, js-yaml, existing MDX validation helpers, GitHub Actions translation workflows, pnpm.

---

## File map and interfaces

Create scripts/translation/protectedContent.js.

Public interface:

~~~javascript
protectTranslationInput(sourceContent)
// => Object.freeze({content, manifest})

restoreProtectedContent(modelContent, manifest)
// => restored string; throws on missing, altered, duplicated, reordered, or invented markers

validateProtectedContent(sourceContent, targetContent)
// => frozen array of category-specific error strings
~~~

The manifest contains ordered immutable entries with marker, transport text, original bytes, category, and source offsets. It protects complete fenced blocks, inline code, ESM statements, HTML comments, URLs, Markdown destinations, repository paths, placeholders and MDX expressions, JSX tags, heading anchors, and frontmatter delimiters/keys/non-human-readable values. Human-readable scalar title, sidebar_label, description, and keywords values remain visible.

Create scripts/translation/localeContract.js.

Public interface:

~~~javascript
loadLocaleContract(target, repositoryRoot)
validateLocaleContract(contract, expectedTarget)
formatLocaleContract(contract)
validateLocaleContractDraft(sourceContent, draftContent, contract)
issueConflictsWithLocaleContract(issue, contract)
localeContractPathFor(target)
~~~

The validator enforces an exact JSON schema and deep-freezes the result. validateLocaleContractDraft returns exact evidence issues using real source_quote and draft_quote substrings. Mandatory term occurrence checks enforce Compaction without globally banning the ordinary translation of compression.

Create scripts/translation/reviewEvidence.js.

Public interface:

~~~javascript
parseReviewEvidence(text)
validateReviewEvidence(review, {
  sourceContent,
  draftContent,
  localeContract,
})
parseAndValidateReviewEvidence(text, options)
~~~

The exact Reviewer schema is pass plus issues. Each issue contains exactly severity, type, location, source_quote, draft_quote, and comment. The result separates validated issues, unsupported issues, reviewerPass, fatal schema errors, and correction authorization.

Create config/translation/zh-CN-reference.json and config/translation/ja-JP.json.

Exact root keys:

~~~json
{
  "schemaVersion": 1,
  "contractId": "locale-version",
  "target": "translation-target",
  "locale": "locale",
  "styleRules": [],
  "mandatoryTerms": [],
  "forbiddenTranslations": [],
  "doNotTranslate": [],
  "examples": []
}
~~~

The Chinese contract requires Compaction -> Compaction and records 压缩 and 压实 as forbidden replacements for that product concept. It separately includes an approved compression -> 压缩 example. The Japanese contract uses the approved Japanese terminology from the guide.

Create .github/prompts/codex-correction-agent.zh-CN-reference.md and update the five existing Translation/Review/Correction prompts so code comments are explicitly protected, source/draft/review boundaries are explicit, terminology defers to the injected contract, and Reviewer output matches the exact evidence schema.

Modify scripts/translation/restSpecLocalization.js so promptNamesFor exposes correction, REST prompts include the locale contract, and REST prose uses protectedContent restoration/validation plus locale validation.

Modify scripts/translation/recovery-artifact.js so promptContractSha256 includes all target prompts, the target locale contract, the dedicated Chinese correction prompt, and the existing Chinese reference-navigation contract.

The three confirmed guide/design inputs are tracked unchanged:

- .claude/specs/2026-08-04-zh-cn-translation-agent-guide.md
- .claude/specs/2026-08-04-ja-jp-translation-agent-guide.md
- .claude/specs/2026-08-04-translation-agent-p0-design.md

## Task 1: Protected fenced content and marker integrity

**Files:**

- Create: scripts/translation/protectedContent.test.js
- Create: scripts/translation/protectedContent.js

- [ ] **Step 1: RED — add the minimal fenced-block regression**

Add a node:test case whose source contains a Java or CLI fenced block with an English natural-language comment, blank lines, strings, and example output. Simulate a model response that replaces the comment with Chinese while preserving the marker. Assert restoreProtectedContent returns the source fenced block byte-for-byte.

- [ ] **Step 2: Run RED**

Run:

~~~bash
node --test scripts/translation/protectedContent.test.js
~~~

Expected failure: MODULE_NOT_FOUND for ./protectedContent because production code does not exist.

- [ ] **Step 3: GREEN — implement the minimal fenced-block transport**

Implement reserved markers shaped as HTML comments with a deterministic index and content digest. Scan fenced blocks line-by-line, replace each complete block with one marker transport, freeze the manifest, and restore the exact original bytes.

- [ ] **Step 4: Run GREEN**

Run the focused test again. Expected: 1 test passes and no marker remains in output.

- [ ] **Step 5: RED — marker corruption cases**

Add independent tests for missing, altered, duplicated, reordered, and invented markers. Each assertion must expect a fail-closed category-specific error.

Expected failures: restore currently accepts or misclassifies at least one invalid transport.

- [ ] **Step 6: GREEN — exact marker sequence verification**

Before replacement, scan every reserved marker token, reject malformed reserved namespace text, compare the actual marker sequence to manifest order, require each exact transport once, then restore.

- [ ] **Step 7: RED — remaining protected categories**

Add focused tests for inline code, ESM import/export, HTML comments, URLs, Markdown link destinations, repository paths, anchors/IDs, double-brace and dollar-brace placeholders, MDX expressions, JSX tags/attributes/nesting, and frontmatter. Verify title and description prose can change while slug, token, type, booleans, dates, delimiters, keys, and YAML structure remain exact.

Expected failures: unimplemented categories remain visible or validateProtectedContent misses changes.

- [ ] **Step 8: GREEN — prioritized non-overlapping span extraction**

Implement prioritized span collectors, sort by source offset, discard lower-priority overlaps, and reuse the same extraction for validation. Error messages identify category and ordinal plus source/target digests; they never report identical text as changed.

- [ ] **Step 9: RED/GREEN — Go frontmatter false positive**

Add a regression where source and draft frontmatter token values are exactly identical. First confirm the test fails against a deliberately asserted mismatch, then implement/verify that validation returns an empty array and never emits changed from X to X.

- [ ] **Step 10: Refactor and verify**

Run:

~~~bash
node --test scripts/translation/protectedContent.test.js
~~~

Expected: all protected-content tests pass.

## Task 2: Versioned locale contracts and Compaction

**Files:**

- Create: config/translation/zh-CN-reference.json
- Create: config/translation/ja-JP.json
- Create: scripts/translation/localeContract.test.js
- Create: scripts/translation/localeContract.js

- [ ] **Step 1: RED — exact schema and immutable load**

Add tests that load both target contracts, reject unknown root/item fields, reject duplicate mandatory terms, reject a target mismatch, and verify every nested object/array is frozen.

Expected failure: MODULE_NOT_FOUND for ./localeContract.

- [ ] **Step 2: GREEN — validator, loader, formatter**

Implement target-to-config mapping, exact key validation, enum/type checks, duplicate checks, recursive freezing, and stable compact formatting.

- [ ] **Step 3: RED — Compaction and ordinary compression**

Add tests:

~~~javascript
source = 'Compaction plans merge segments.'
badDrafts = ['压缩计划会合并 Segment。', '压实计划会合并 Segment。']
goodDraft = 'Compaction 计划会合并 Segment。'
ordinarySource = 'Enable response compression.'
ordinaryDraft = '启用响应压缩。'
~~~

Assert both bad drafts produce a terminology issue with real quotes, the good draft produces none, and ordinary compression produces none.

Expected failure: no deterministic terminology validation exists.

- [ ] **Step 4: GREEN — occurrence-based mandatory terms**

Count exact mandatory source terms and required target terms. Emit an issue only when the required target occurrence count is lower. Use a real forbidden draft substring when present; otherwise use bounded real draft context. Do not globally reject 压缩.

- [ ] **Step 5: RED/GREEN — Japanese terminology and prompt formatting**

Verify collection, cluster, vector, index, and Compaction mappings appear in the formatted Japanese contract and that ordinary English technical concepts are not listed as blanket do-not-translate entries.

- [ ] **Step 6: Verify**

Run:

~~~bash
node --test scripts/translation/localeContract.test.js
~~~

Expected: all locale contract tests pass.

## Task 3: Strict Reviewer evidence and contract-conflict filtering

**Files:**

- Create: scripts/translation/reviewEvidence.test.js
- Create: scripts/translation/reviewEvidence.js

- [ ] **Step 1: RED — exact evidence schema**

Add cases for source_quote absent, draft_quote absent, pass=true with issues, pass=false with no issues, unknown root fields, unknown issue fields, invalid severity/type, empty strings, and malformed JSON.

Expected failure: MODULE_NOT_FOUND for ./reviewEvidence.

- [ ] **Step 2: GREEN — strict parser**

Strip only an optional outer JSON code fence, parse JSON, validate exact keys and enums, bound raw schema-error text, and deep-freeze parsed data.

- [ ] **Step 3: RED — quote validation, identical-token allegation, and deduplication**

Add tests that reject absent quotes, mark protected_content or link_or_path allegations unsupported when source_quote and draft_quote are identical, and collapse exact duplicate issues deterministically.

Expected failure: the parser alone trusts all structurally valid issues.

- [ ] **Step 4: GREEN — evidence validation**

Validate contiguous substrings against the exact model-visible source/draft. Return validatedIssues and unsupportedIssues separately. pass=false with no validated issue does not authorize Correction. pass=true with issues and malformed schema are fatal review failures.

- [ ] **Step 5: RED — Compaction contract conflict**

Use the Chinese contract with source_quote Compaction plans, draft_quote Compaction 计划, and a comment demanding 压实. Assert the allegation is unsupported and cannot authorize Correction. Also assert a valid issue against draft_quote 压缩计划 is accepted when its comment demands Compaction 计划.

Expected failure: contract conflicts are not filtered.

- [ ] **Step 6: GREEN — locale conflict filtering**

Use forbiddenTranslations only in the context of the corresponding source term and reviewer comment. Preserve valid ordinary compression findings.

- [ ] **Step 7: Verify**

Run:

~~~bash
node --test scripts/translation/reviewEvidence.test.js
~~~

Expected: all evidence tests pass.

## Task 4: Prompt contracts and prompt-contract hashing

**Files:**

- Create: .github/prompts/codex-correction-agent.zh-CN-reference.md
- Modify: .github/prompts/codex-translation-agent.zh-CN-reference.md
- Modify: .github/prompts/codex-review-agent.zh-CN-reference.md
- Modify: .github/prompts/codex-translation-agent.ja-JP.md
- Modify: .github/prompts/codex-review-agent.ja-JP.md
- Modify: .github/prompts/codex-correction-agent.md
- Modify: scripts/translation/restSpecLocalization.js
- Modify: scripts/translation/recovery-artifact.test.js
- Modify: scripts/translation/recovery-artifact.js

- [ ] **Step 1: RED — independent Chinese Correction Prompt**

Extend agentRunner prompt-selection tests to require promptNamesFor('zh-CN-reference').correction to equal codex-correction-agent.zh-CN-reference.md and require correction messages to identify the Chinese Correction Agent rather than the Translation Agent.

Expected failure: promptNamesFor has no correction field and correctionPromptFor reuses Translation Prompt.

- [ ] **Step 2: GREEN — prompt map and prompt files**

Add correction to both target prompt maps. Write the dedicated Chinese correction prompt and align Japanese correction. Update Review prompts to demand the exact evidence JSON fields and no unknown fields. Add explicit source/draft/review tags to message builders and prompt instructions.

- [ ] **Step 3: RED — locale contract in system messages and REST**

Assert Translation, Review, Correction, and REST system messages contain the target contractId and the Compaction rule.

Expected failure: locale contracts are not injected.

- [ ] **Step 4: GREEN — compact contract injection**

Append formatLocaleContract(loadLocaleContract(target)) to each system message. REST localization loads the same contract and validates every restored translated entry.

- [ ] **Step 5: RED — recovery hash changes**

In a temporary repository fixture, compute promptContractSha256, mutate the locale JSON, and require a new hash. Restore it, mutate the target correction prompt, and require another new hash.

Expected failure: current hashing excludes the locale contract and Chinese correction prompt.

- [ ] **Step 6: GREEN — complete contract hashing**

Hash target, sorted prompt filenames and bytes, locale contract relative path and bytes, plus config/reference-navigation.json for zh-CN-reference. Keep the public recovery schema unchanged.

- [ ] **Step 7: Verify**

Run:

~~~bash
node --test scripts/translation/recovery-artifact.test.js
node --test scripts/translation/restSpecLocalization.test.js
~~~

Expected: all tests pass.

## Task 5: Runner integration and regression flow

**Files:**

- Modify: scripts/translation/agentRunner.test.js
- Modify: scripts/translation/agentRunner.js
- Modify: scripts/translation/restSpecLocalization.js

- [ ] **Step 1: RED — Translation restores fenced code bytes**

Add a processManifestItem regression whose source contains a Java or CLI fenced block with an English comment. The mocked Translation Agent returns a Chinese comment. Assert the final written file still contains the complete original fenced block byte-for-byte.

Expected failure: current runner sends fenced code directly and writes the translated comment.

- [ ] **Step 2: GREEN — protect/restore after Translation**

Replace the ESM-only transport in translateAndReviewUnit with protectTranslationInput and restoreProtectedContent. Run validateProtectedContent immediately after restoration; throw before Review on marker or protected-content failure.

- [ ] **Step 3: RED — restore/validate after every Correction**

Add a two-round case where Correction attempts to alter an inline code span or code comment. Assert the protected bytes remain exact after each round.

Expected failure: current Correction output is not restored until the end and only ESM is protected.

- [ ] **Step 4: GREEN — protect current draft for Correction**

Before Correction, protect the current restored draft, send its model-facing form, restore from its manifest, validate against original source, then continue.

- [ ] **Step 5: RED — only validated evidence reaches Correction**

Add runner cases for absent source_quote, absent draft_quote, identical token claims, pass=true with issues, pass=false without a valid issue, unknown issue fields, and locale-conflicting Compaction allegations. Record Correction calls and message JSON. Assert only validated issues are present and no Correction call occurs when none remain.

Expected failure: current runner forwards every issue returned by parseReview.

- [ ] **Step 6: GREEN — evidence-gated review loop**

Parse and validate the Reviewer response against the exact model-visible source/draft. Combine validated Reviewer issues with deterministic locale issues. Call Correction only when the combined issue array is non-empty. Unsupported-only pass=false responses accept the unchanged deterministic-valid draft; fatal schema responses fail the unit without Correction.

- [ ] **Step 7: RED/GREEN — Compaction correction**

Add three regressions:

1. Source Compaction plans plus draft 压缩计划 produces a deterministic issue and corrects to Compaction 计划.
2. Source Compaction plans plus draft 压实计划 produces the same correction.
3. Correct draft Compaction 计划 plus Reviewer demand for 压实 does not call Correction and remains unchanged.

Also assert source compression plus draft 压缩 remains valid.

- [ ] **Step 8: RED/GREEN — Go frontmatter false positive in runner**

Mock a Reviewer allegation where source_quote and draft_quote are the same token. Assert no Correction call, no false validation error, and unchanged valid draft.

- [ ] **Step 9: RED/GREEN — REST protected strings**

Update REST tests so existing inline code/URL/placeholders are restored byte-identically, invented protected structures fail, and locale terminology is validated without changing non-locale JSON data.

- [ ] **Step 10: Refactor**

Remove obsolete protectEsmStatements, restoreProtectedEsm, restoreEsmStatements, heading-only identity code when fully subsumed by protectedContent. Keep agentRunner sequencing-focused and maintain current public exports only where existing tests/callers require them.

- [ ] **Step 11: Focused verification**

Run:

~~~bash
node --test scripts/translation/protectedContent.test.js
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/reviewEvidence.test.js
node --test scripts/translation/restSpecLocalization.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
~~~

Expected: all focused suites pass.

## Task 6: Full local validation and local P0 commit

**Files:**

- All modified files above
- Create local evidence under /private/tmp/zdoc-translation-agent-p0-validation; do not add replay outputs to Git

- [ ] **Step 1: Full translation and workflow gates**

Run and preserve complete output:

~~~bash
pnpm test:translation
pnpm test:workflow-policy
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
git diff --check
git status --short
~~~

- [ ] **Step 2: Verify prompt-contract sensitivity explicitly**

Run the focused recovery hash test by name and record the before/after hashes produced by a small read-only Node invocation against temporary copied prompt/contract fixtures.

- [ ] **Step 3: Review scope**

Confirm no changes to handoff schema v2, checkpoint schema, fetch-docs.yml source fetch semantics, or publication ordering. Confirm zdoc_cn is absent from the diff.

- [ ] **Step 4: Local commit**

Stage only the plan, three design documents, new modules/contracts/tests, prompt files, and the three intended integration files. Create a local commit named feat(i18n): harden translation agent contracts. Do not push.

## Task 7: Real artifact replay

**Inputs:**

- Fetch run: 30873886876
- Failed translation run for evidence: 30879406091
- Public source baseline: 478aac6970af6ef944efb8c5df9a05f9444898da
- Guides checkpoint: 2fbcd74fd0ae4a203ac5866d05cc0cddabb152ae
- Python checkpoint: ab1eb027ce3b2a991032d6c75e062c5a7bac5d4a
- Java checkpoint: 7222c14ba96d432c67f9d38020d5c6bdb019ee09
- Node checkpoint: 0cd0dafb2b28f92afba45e2b4add537cabd7982b
- Go checkpoint: fcb668907995304d21f6afd65b3be60cc79d30ae
- CLI/REST checkpoint: 8ded19dc9c3a65284757f6030b2ba40bd2408c39

- [ ] **Step 1: Inspect exact workflow evidence**

Use gh run view 30879406091 --repo zilliztech/zdoc --json jobs and download failed job logs. Record the Java Compaction allegation, Go identical-token allegation, and Java/CLI code-comment mutation evidence.

- [ ] **Step 2: Download real retained artifacts**

Use gh run download 30873886876 --repo zilliztech/zdoc into /private/tmp/zdoc-translation-agent-p0-replay/fetch-30873886876. List artifact names first and download the source/checkpoint artifacts for Guides, Python, Java, Node, Go, CLI, and REST.

- [ ] **Step 3: Preflight every checkpoint archive**

Run scripts/docs-workflow/preflight-checkpoint-archive.js against each checkpoint-group.tar before extraction. Verify the manifest identity uses the immutable source baseline/checkpoint pairs above.

- [ ] **Step 4: Build an isolated local replay workspace**

Create /private/tmp/zdoc-translation-agent-p0-replay, a local bare Git remote, and a tooling checkout at the local P0 commit. Reuse the worktree dependency store but do not alter the real origin remote. Materialize each real checkpoint in workflow production order.

- [ ] **Step 5: Replay the translation gate**

Run the same manifest validation and translation runner commands used by .github/workflows/_translate-content-group.yml for zh-CN/java, zh-CN/cli, zh-CN/go, and ja-JP/guides with publish disabled. Do not supply recovery run IDs. If provider credentials are unavailable, stop at the exact credential boundary and report which deterministic replay stages passed; do not substitute artifact-only dispatch.

- [ ] **Step 6: Validate replay outputs**

For every produced translation checkpoint, run validate-checkpoint-artifact.js with the P0 tooling SHA and exact source checkpoint SHA. Inspect reports for unsupported Reviewer allegations, protected-content mismatch, Compaction violations, and rewritten code comments. Preserve commands, logs, manifests, and output SHA under the replay root.

## Task 8: Prepare, but do not dispatch, publish=false canaries

- [ ] **Step 1: Re-read current dev SHA immediately before handoff generation**

Use:

~~~bash
git ls-remote origin refs/heads/dev
~~~

Do not reuse the failed run target baseline.

- [ ] **Step 2: Generate a new schema-v2 handoff locally**

Set toolingSha to the local P0 commit. Set global and every unit targetBaselineSha to the newly read dev SHA. Keep source baseline/checkpoint identities from fetch run 30873886876. Set publish=false. Omit all recovery run IDs.

- [ ] **Step 3: Validate handoff locally**

Run the repository handoff validator used by the manual translation workflow and retain the generated JSON plus validator output outside Git.

- [ ] **Step 4: Record canary sequence**

Prepare units in this order:

1. zh-CN/java
2. zh-CN/cli
3. zh-CN/go
4. ja-JP/guides

Do not run gh workflow run, push, create a PR, or publish without separate authorization.

## Final verification checklist

- [ ] Every new behavior was observed failing before production implementation.
- [ ] Every Translation and Correction output restores and validates protected bytes.
- [ ] Missing, changed, duplicated, reordered, and invented markers fail closed.
- [ ] Go identical frontmatter token produces no false positive.
- [ ] Compaction remains English; 压缩 and 压实 replacements are corrected; ordinary compression may be 压缩.
- [ ] Only evidence-valid, locale-compatible issues reach Correction.
- [ ] Unsupported-only review does not rewrite a deterministic-valid draft.
- [ ] Chinese uses its dedicated Correction Prompt.
- [ ] Prompt, Correction Prompt, and locale contract bytes affect promptContractSha256.
- [ ] Focused tests, pnpm test:translation, pnpm test:workflow-policy, git diff --check, and status review pass.
- [ ] Real artifact replay evidence is preserved.
- [ ] Canary handoff is prepared but not dispatched.
