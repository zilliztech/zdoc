# Translation Agent P0.4 Semantic-Unit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate coherent MDX/Markdown documents with full context while using stable semantic units as the only model output and patch boundary, allow protected-marker reordering only inside one unit or REST string, and correct the confirmed Endpoint leakage and standalone-term false positives without weakening fail-closed protection.

**Architecture:** Add `scripts/translation/semanticUnits.js` as the MDX/Markdown unit boundary. It parses only to obtain byte offsets, extracts frontmatter scalars, heading text, paragraphs/list paragraphs, and table cells, protects every unit independently, validates exact response IDs, reconstructs source/draft context without AST serialization, and patches accepted units from highest offset to lowest. `agentRunner.js` remains orchestration: one Translation call sees the complete document or coherent chunk plus all units, Reviewer sees reconstructed source/draft context plus unit IDs, and Correction may return only the validated unit IDs. REST remains JSON-path based and gains unit-local protected-marker ordering inside each string.

**Tech Stack:** Node.js CommonJS, dynamic import of the existing `@mdx-js/mdx` parser, `node:test`, `node:assert/strict`, existing protected-content/locale/reviewer modules, existing REST structured localization, pnpm.

---

## File map and public interfaces

Create `scripts/translation/semanticUnits.js`.

```javascript
async function collectSemanticUnits(sourceContent, {idPrefix = 'document'} = {})
// => deeply frozen [{id, kind, start, end, source}]
// kind is frontmatter-scalar, heading, paragraph, or table-cell.
// start/end are UTF-16 string offsets used by slice, matching existing runner offsets.

function protectSemanticUnits(units, textForUnit = unit => unit.source)
// => units plus protection created with protectTranslationInput(text, {reorderWithin: unit.id})

function parseSemanticUnitResponse(modelText, {field, expectedUnits})
// => exact ID-aligned [{id, text}].
// Root contains exactly `field`; entries contain exactly id/text; no missing,
// duplicate, unknown, or extra IDs/fields are accepted.

function restoreSemanticUnitResponse(modelText, {field, protectedUnits})
// => restored units after marker inventory validation and validateProtectedContent.

function patchSemanticUnits(sourceContent, units, translatedUnits)
// => source with translated ranges patched from highest start offset to lowest.

function bindSemanticReviewEvidence(evidence, sourceUnits, draftUnits)
// => evidence with only issues whose location names one exact unit ID and whose
// source_quote/draft_quote occur in the corresponding source/draft unit.

function deterministicSemanticIssues(sourceUnits, draftUnits, localeContract)
// => locale issues prefixed with the exact unit ID and an internal issue-to-unit map.
```

Modify `scripts/translation/protectedContent.js`.

```javascript
protectTranslationInput(sourceContent, options = {})
// options.reorderWithin is an optional stable semantic-unit/REST-entry ID.
// When present, all markers in this one input share one order group. Exact marker
// identity and count remain mandatory; missing, duplicate, forged, or cross-unit
// movement still fails closed.
```

Modify `scripts/translation/agentRunner.js`.

```javascript
async function translateAndReviewSemanticUnits({...existing})
// Extracts units once, sends one joint Translation request, reconstructs the draft,
// reviews the reconstructed context, corrects only authorized IDs, and returns
// {translatedContent, review, semanticUnits}.

buildTranslationMessages({...existing, sourceDocument, semanticUnits})
// Translation response schema: {"translations":[{"id":"...","text":"..."}]}

buildReviewMessages({...existing, sourceDocument, draftDocument, sourceUnits, draftUnits})
// Reviewer location must contain one exact semantic unit ID.

buildCorrectionMessages({...existing, sourceDocument, draftDocument, authorizedUnits})
// Correction response schema: {"corrections":[{"id":"...","text":"..."}]}
```

Modify `scripts/translation/restSpecLocalization.js` so `protectRestEntries` uses `reorderWithin: entry.id`; keep `collectLocalizableEntries`, `applyLocaleEntries`, `removeLocale`, and `assert.deepEqual` unchanged.

Modify `scripts/translation/localeContract.js` so ASCII mandatory terminology uses standalone lexical occurrences, with an optional English plural suffix, instead of matching inside larger identifiers or words. Update `config/translation/zh-CN-reference.json` with case-sensitive `endpoint -> Endpoint` and advance its contract ID.

Modify the six document Translation/Review/Correction prompts and the two REST Translation plus shared REST Correction prompts to describe exact semantic-unit/entry JSON and unit-local marker ordering. Prompt edits and the locale-contract edit must change recovery `promptContractSha256`; no recovery schema changes.

No handoff schema v2, checkpoint schema, source fetch, publication order, publication code, or deprecated `zdoc_cn` changes are allowed.

## Task 1: Standalone terminology and Endpoint leakage

**Files:**

- Modify: `scripts/translation/localeContract.test.js`
- Modify: `scripts/translation/localeContract.js`
- Modify: `config/translation/zh-CN-reference.json`
- Modify: `scripts/translation/recovery-artifact.test.js`

- [ ] **Step 1: RED — reproduce `entity` inside `identity` false positives**

Add:

```javascript
test('matches mandatory ASCII terms as standalone concepts, not word substrings', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  assert.deepEqual(validateLocaleContractDraft(
    'Azure workload identity client ID.',
    'Azure 工作负载身份客户端 ID。',
    contract,
  ), [])
  assert.equal(validateLocaleContractDraft(
    'Each entity has an ID.',
    '每个实体都有一个 ID。',
    contract,
  ).length, 1)
  assert.deepEqual(validateLocaleContractDraft(
    'The entities have IDs.',
    '这些 Entity 都有 ID。',
    contract,
  ), [])
})
```

Run:

```bash
node --test --test-name-pattern='standalone concepts' scripts/translation/localeContract.test.js
```

Expected RED: the first assertion receives an `entity` terminology issue because current substring counting matches `identity`.

- [ ] **Step 2: GREEN — add lexical occurrence matching**

Replace document-wide substring counting for mandatory terms with deterministic occurrence ranges. For ASCII letter/digit/underscore terms, require non-word boundaries and allow only a terminal English `s` or `es`; use the same boundary logic for the required English target. Keep phrase terms and do-not-translate product names exact. Preserve real source/draft quote generation.

- [ ] **Step 3: RED — reproduce the pilot Endpoint leakage**

Add:

```javascript
test('requires the Chinese Endpoint form in ordinary endpoint prose', () => {
  const contract = loadLocaleContract('zh-CN-reference')
  const source = 'This operation creates a PrivateLink endpoint.'
  const leaked = '此操作会创建一个 PrivateLink endpoint。'
  const issues = validateLocaleContractDraft(source, leaked, contract)
  assert.equal(issues.length, 1)
  assert.equal(issues[0].source_quote, 'endpoint')
  assert.equal(issues[0].draft_quote, leaked)
  assert.deepEqual(validateLocaleContractDraft(
    source,
    '此操作会创建一个 PrivateLink Endpoint。',
    contract,
  ), [])
})
```

Expected RED: no issue exists because the current contract has no Endpoint entry.

- [ ] **Step 4: GREEN — version the Chinese contract**

Advance `contractId` to `zh-CN-reference-2026-08-04-p0.4` and add:

```json
{"source":"endpoint","target":"Endpoint","caseSensitive":true}
```

Use `caseSensitive: true` so lowercase `endpoint` in the draft does not satisfy the required official `Endpoint` form. Existing `Compaction`, `compression`, `Dedicated`, and Japanese tests must remain unchanged.

- [ ] **Step 5: GREEN verification and hash sensitivity**

Run:

```bash
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/recovery-artifact.test.js
```

Expected GREEN: `identity` is not flagged, standalone singular/plural `entity` remains enforced, Endpoint leakage is detected, and the locale contract mutation changes `promptContractSha256`.

## Task 2: Explicit unit-local protected marker ordering

**Files:**

- Modify: `scripts/translation/protectedContent.test.js`
- Modify: `scripts/translation/protectedContent.js`

- [ ] **Step 1: RED — allow arbitrary protected-token order inside one declared unit**

Add a test using inline code, a URL, and an anchor in one paragraph:

```javascript
const input = protectTranslationInput(
  'Use `alpha` at https://example.com. See \\{#usage}.',
  {reorderWithin: 'paragraph.0001'},
)
const [inline, url, anchor] = input.manifest.entries
const reordered = input.content
  .replace(inline.transport, '__A__')
  .replace(url.transport, '__B__')
  .replace(anchor.transport, inline.transport)
  .replace('__B__', anchor.transport)
  .replace('__A__', url.transport)
assert.doesNotThrow(() => restoreProtectedContent(reordered, input.manifest))
```

Run:

```bash
node --test --test-name-pattern='declared semantic unit' scripts/translation/protectedContent.test.js
```

Expected RED: current order groups permit only same-line inline-code permutations; moving URL/anchor markers crosses fixed groups.

- [ ] **Step 2: GREEN — optional reorder scope**

Accept only an optional non-empty string `options.reorderWithin`. When present, set every manifest entry to `orderGroup: semantic-unit:<scope>` and `reorderPolicy: within_semantic_unit` before deep freeze. Do not change the default same-line inline-code behavior.

- [ ] **Step 3: RED/GREEN — retain exact inventory and cross-unit failure**

Add missing, duplicate, forged, and foreign-marker cases using two separately protected units. A marker copied from unit A into unit B must produce missing/unknown errors. Expected GREEN: valid within-unit reorder passes; every identity/count mutation fails.

- [ ] **Step 4: Verify**

```bash
node --test scripts/translation/protectedContent.test.js
```

## Task 3: Deterministic semantic-unit extraction and byte-offset patching

**Files:**

- Create: `scripts/translation/semanticUnits.test.js`
- Create: `scripts/translation/semanticUnits.js`

- [ ] **Step 1: RED — module and extraction contract**

Create a fixture containing quoted frontmatter `title`, `sidebar_label`, `description`, keyword list items, an ESM import, heading anchors, ordinary paragraphs, nested list paragraphs, fenced code, and a GFM table. Assert exact unit kinds, stable IDs, source slices, and offsets. Assert no unit overlaps fenced code or ESM.

Run:

```bash
node --test scripts/translation/semanticUnits.test.js
```

Expected RED: `MODULE_NOT_FOUND` for `./semanticUnits`.

- [ ] **Step 2: GREEN — parse without serializing**

Implement:

1. a deterministic frontmatter boundary scanner;
2. allowlisted scalar ranges for `title`, `sidebar_label`, `description`, and each `keywords` scalar while leaving quotes, keys, delimiters, indentation, and line endings outside ranges;
3. cached dynamic import of `@mdx-js/mdx`, parsing only the body after frontmatter;
4. heading text ranges that exclude `#` prefixes and optional `\\{#anchor}` suffixes;
5. paragraph positions from MDAST, including paragraphs nested in list items and JSX containers;
6. a table scanner that respects escaped pipes and backtick code spans, emits trimmed header/data cell ranges, skips delimiter rows, and suppresses the overlapping paragraph node;
7. stable type-local ordinal IDs and frozen offsets.

Do not call any MDAST stringifier.

- [ ] **Step 3: RED — exact Translation/Correction response identity**

Add tests for valid reordered response entries and for missing, duplicate, unknown, extra-field, wrong-root-field, and non-string responses. Translation uses root `translations`; Correction uses root `corrections` and may expect a strict subset of authorized units.

Expected RED: no response parser exists.

- [ ] **Step 4: GREEN — strict response transport and restoration**

Implement exact root/entry schemas, normalize output order to the expected unit order, protect each unit with `reorderWithin: unit.id`, restore by marker identity, and run `validateProtectedContent(unit.source, restoredText)` before accepting a unit.

- [ ] **Step 5: RED — descending patch preserves all non-unit bytes**

Translate only selected frontmatter values, headings, paragraph text, list paragraphs, and table cells. Assert byte-identical ESM, code fences, list markers, table pipes/alignment row, anchors, quotes, indentation, blank lines, and final newline.

Expected RED: patching/reconstruction is absent.

- [ ] **Step 6: GREEN — source-offset patching**

Reject overlapping or unknown unit IDs, then patch from highest `start` to lowest. Preserve source bytes outside unit ranges exactly.

- [ ] **Step 7: RED/GREEN — same-unit Reviewer binding**

Create two units with different source/draft quotes. Assert a cross-unit issue and a location without the exact ID become unsupported. Assert a same-unit issue is validated and mapped to that unit ID. Deterministic locale issues must be generated per unit and have locations prefixed by the exact ID.

- [ ] **Step 8: Verify**

```bash
node --test scripts/translation/semanticUnits.test.js
```

## Task 4: Semantic Translation–Review–Correction runner

**Files:**

- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/agentRunner.js`
- Modify: `.github/prompts/codex-translation-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-review-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-correction-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-translation-agent.ja-JP.md`
- Modify: `.github/prompts/codex-review-agent.ja-JP.md`
- Modify: `.github/prompts/codex-correction-agent.md`

- [ ] **Step 1: RED — one joint call sees coherent context and returns units**

Add a `processManifestItem` regression with frontmatter, headings, paragraphs, list items, inline code, anchor, and fenced code. The mocked Translation call must receive `<document_context>` containing the complete protected chunk and `<semantic_units>` containing every exact ID once. Return the JSON `translations` object in a different array order. Assert reconstruction uses IDs, not array position.

Expected RED: current runner expects a complete Markdown string and has no semantic-unit payload.

- [ ] **Step 2: GREEN — semantic Translation path**

Replace the document-string implementation of `translateAndReviewUnit` with `translateAndReviewSemanticUnits`. Extract units once per chunk, return source unchanged without a model call when no translatable unit exists, send one Translation call for all units, restore every unit, reconstruct the full draft, and run whole-document protected validation.

- [ ] **Step 3: RED — Reviewer sees reconstructed documents and exact IDs**

Assert Reviewer receives `<source_document>`, `<draft_document>`, `<source_units>`, and `<draft_units>`. Return one valid same-unit issue and one cross-unit allegation. Assert only the valid issue can authorize Correction.

Expected RED: current Reviewer has no unit identity and global evidence can authorize a whole-document rewrite.

- [ ] **Step 4: GREEN — bind review and deterministic issues to units**

Parse generic strict JSON against the exact unit JSON strings, bind evidence to the same unit and location ID, generate deterministic locale issues per unit, deduplicate issues, and retain unsupported allegations for diagnostics. Fatal reviewer schema remains a failed review without Correction.

- [ ] **Step 5: RED — Correction returns only authorized units**

Authorize one paragraph ID. Test missing, duplicate, invented, unrelated, and extra-field correction responses. Assert each fails closed. In the valid case, assert all unmentioned unit text and all non-unit bytes remain byte-identical.

Expected RED: current Correction rewrites the whole document/chunk.

- [ ] **Step 6: GREEN — surgical unit correction loop**

Send full reconstructed context plus only authorized source/draft units and validated issues. Parse exact `corrections` IDs, restore protected bytes per corrected unit, merge only those IDs into the current unit map, reconstruct, and review again. If no validated issue exists, do not call Correction and do not rewrite the draft.

- [ ] **Step 7: RED — pilot PrivateLink Endpoint regression**

Use the real shape:

```markdown
---
description: "This operation creates a PrivateLink endpoint. | Cloud"
---

# create

This operation creates a PrivateLink endpoint.

## Usage\{#usage}
```

Mock Translation returning lowercase `endpoint` in both translatable units and Reviewer returning pass=true. Assert deterministic issues authorize only the two affected IDs, Correction returns `PrivateLink Endpoint`, `# create` remains unchanged as the CLI command heading, and `\\{#usage}` remains byte-identical.

Expected RED: current contract/runner accepts the leaked lowercase endpoint or rewrites a whole document.

- [ ] **Step 8: RED/GREEN — within-unit reorder and cross-unit movement**

Return a natural target-language reordering of multiple protected markers inside one paragraph and assert success. Move one marker into another paragraph and assert missing/unknown marker failure before Review.

- [ ] **Step 9: RED/GREEN — complete code block byte preservation**

Return no fenced code unit at all and assert the complete source fenced block, including English comments and output, remains byte-identical after Translation and two Correction rounds.

- [ ] **Step 10: Refactor and focused runner verification**

Keep `processManifestItem` sequencing-focused. Preserve chunking, source/target paths, validation order, file writes, reports, retries, and exports required by existing tests.

Run:

```bash
node --test scripts/translation/semanticUnits.test.js
node scripts/translation/agentRunner.test.js
```

## Task 5: REST unit-local marker ordering without architecture changes

**Files:**

- Modify: `scripts/translation/restSpecLocalization.test.js`
- Modify: `scripts/translation/restSpecLocalization.js`
- Modify: `.github/prompts/codex-rest-spec-translation-agent.zh-CN-reference.md`
- Modify: `.github/prompts/codex-rest-spec-translation-agent.ja-JP.md`
- Modify: `.github/prompts/codex-rest-spec-correction-agent.md`

- [ ] **Step 1: RED — reorder protected markers inside one REST string**

Use one description containing two inline-code tokens, a URL, and `<br/>`. Return a Chinese/Japanese order that permutes the exact marker transports inside the same entry. Assert the restored locale string contains the exact protected bytes in the returned order.

Expected RED: current same-line inline-code grouping still treats URL/JSX markers as fixed and throws an order-group error.

- [ ] **Step 2: GREEN — protect each REST entry as one reorder scope**

Change only `protectRestEntries` to call:

```javascript
protectTranslationInput(protectedText, {reorderWithin: entry.id})
```

Keep exact entry ID schemas, correction identity, `applyLocaleEntries`, `removeLocale`, and the non-locale `assert.deepEqual` unchanged.

- [ ] **Step 3: RED/GREEN — movement across REST IDs and invented markup stay closed**

Copy a marker from one REST entry into another and assert missing/unknown failure. Retain the existing invented inline-code tests and add the canary-style unknown marker case. No test may relax unexpected inline-code rejection.

- [ ] **Step 4: Verify**

```bash
node --test scripts/translation/restSpecLocalization.test.js
```

## Task 6: Prompt contract and recovery identity

**Files:**

- Modify: the nine prompt files listed above
- Modify: `scripts/translation/recovery-artifact.test.js`

- [ ] **Step 1: RED — prompts declare exact semantic schemas**

Add prompt-selection assertions that document Translation requires `translations`, document Correction requires `corrections`, Reviewer requires an exact semantic unit ID in `location`, and REST prompts permit protected marker permutations only within one entry.

Expected RED: current prompts request complete Markdown documents and prohibit broader valid within-unit ordering.

- [ ] **Step 2: GREEN — update prompt contracts**

Document prompts must say the complete document is context only and every supplied unit ID must be returned exactly once for Translation or every authorized ID exactly once for Correction. Review prompts must use reconstructed documents for discourse context but cite same-unit evidence. REST prompts retain arrays and JSON paths.

- [ ] **Step 3: RED/GREEN — prompt-contract hash changes**

Extend the temporary-fixture test to mutate one semantic Translation/Correction prompt and the Chinese Endpoint contract entry independently. Assert each mutation changes `promptContractSha256` while recovery artifact schema and identity fields remain unchanged.

Run:

```bash
node --test scripts/translation/recovery-artifact.test.js
```

## Task 7: Full local verification

**Files:** all modified files above.

- [ ] **Step 1: Focused suites**

```bash
node --test scripts/translation/semanticUnits.test.js
node --test scripts/translation/protectedContent.test.js
node --test scripts/translation/localeContract.test.js
node --test scripts/translation/reviewEvidence.test.js
node --test scripts/translation/restSpecLocalization.test.js
node scripts/translation/agentRunner.test.js
node --test scripts/translation/recovery-artifact.test.js
```

- [ ] **Step 2: Repository gates**

```bash
pnpm test:translation
pnpm test:workflow-policy
git diff --check
git status --short --branch
```

- [ ] **Step 3: Scope and identity audit**

```bash
git diff --stat
git diff -- scripts/translation config/translation .github/prompts .claude/plans/2026-08-04-translation-agent-p0-4-implementation.md
git diff --name-only | rg 'handoff|checkpoint|fetch-docs|publish|zdoc_cn' && exit 1 || true
```

Record before/after `promptContractSha256` for both targets. Confirm no handoff schema, checkpoint schema, source-fetch, publication order, or unrelated user file changed.

## Task 8: Real 36-failure replay plus successful controls

**Inputs:**

- Retained replay root with preflight manifests, extracted Java artifacts, manifests, reports, and logs: `/private/tmp/zdoc-p0-4-replay.9ac9oi`
- Java historical failure run: `30892090555`
- Java source checkpoint: `7222c14ba96d432c67f9d38020d5c6bdb019ee09`
- Java selected manifest: `/private/tmp/zdoc-p0-4-replay.9ac9oi/site/tmp/p0-4-java-manifest.json` (19 historical failures plus 2 translated controls)
- Java baseline/checkpoint preflight evidence: `/private/tmp/zdoc-p0-4-replay.9ac9oi/preflight/java-baseline.json` and `/private/tmp/zdoc-p0-4-replay.9ac9oi/preflight/java-checkpoint.json`
- CLI canary report: `/private/tmp/zdoc-cli-canary.A7EPbO/translation-report-zh-CN-reference-cli-30907382038/translation-report.json`
- CLI checkpoint: `/private/tmp/zdoc-cli-canary.A7EPbO/translation-checkpoint-zh-CN-reference-cli-30907382038/checkpoint-group.tar`
- CLI baseline: `/private/tmp/zdoc-cli-canary.A7EPbO/translation-baseline-zh-CN-reference-cli-30907382038/checkpoint-group.tar`
- REST canary report: `/private/tmp/zdoc-rest-canary.4dtzX4/translation-report-zh-CN-reference-rest-30907388504/translation-report.json`
- REST checkpoint: `/private/tmp/zdoc-rest-canary.4dtzX4/translation-checkpoint-zh-CN-reference-rest-30907388504/checkpoint-group.tar`
- REST baseline: `/private/tmp/zdoc-rest-canary.4dtzX4/translation-baseline-zh-CN-reference-rest-30907388504/checkpoint-group.tar`
- Immutable source baseline/checkpoint: `478aac6970af6ef944efb8c5df9a05f9444898da` / `8ded19dc9c3a65284757f6030b2ba40bd2408c39`

- [ ] **Step 1: Verify retained identities and exact failure set**

Require 19 failed Java entries, 5 failed CLI entries, and 12 failed REST entries. Re-run checkpoint archive preflight before extraction. Verify every selected source hash against the retained report and immutable checkpoint. Retain two previously translated controls for each group, producing 21 Java, 7 CLI, and 14 REST manifest items.

- [ ] **Step 2: Create an isolated replay workspace**

Create a resolved `mktemp -d` root, export the P0.4 worktree snapshot or local commit, link the verified dependency store, seed baseline/source checkpoint content, and generate three manifests containing all 36 failed files plus two previously translated controls from each group. Do not write replay outputs into the development worktree.

- [ ] **Step 3: Run real local Translation–Review–Correction**

Load `/Users/anthony/Documents/projects/zdoc/.env` without printing it. Run Java, CLI, then REST with conservative concurrency:

```bash
TRANSLATION_CONCURRENCY=1 \
TRANSLATION_FILE_RETRIES=1 \
TRANSLATION_MAX_REVIEW_ROUNDS=2 \
TRANSLATION_ALLOW_PARTIAL=true \
node scripts/translation/agentRunner.js --manifest tmp/p0-4-java-manifest.json --report tmp/p0-4-java-report.json

TRANSLATION_CONCURRENCY=1 \
TRANSLATION_FILE_RETRIES=1 \
TRANSLATION_MAX_REVIEW_ROUNDS=2 \
TRANSLATION_ALLOW_PARTIAL=true \
node scripts/translation/agentRunner.js --manifest tmp/p0-4-cli-manifest.json --report tmp/p0-4-cli-report.json

TRANSLATION_CONCURRENCY=1 \
TRANSLATION_FILE_RETRIES=1 \
TRANSLATION_MAX_REVIEW_ROUNDS=2 \
TRANSLATION_ALLOW_PARTIAL=true \
node scripts/translation/agentRunner.js --manifest tmp/p0-4-rest-manifest.json --report tmp/p0-4-rest-report.json
```

No publish command, remote mutation, recovery run ID, or artifact-only workflow dispatch is allowed.

- [ ] **Step 4: Validate actual outcomes**

For every translated file, run MDX/YAML validation, locale-contract validation, protected-content comparison, and source-hash checks. Specifically record:

- all 19 historical Java failures individually, including `v2-Management-refreshLoad.md` and the `bulkImport request` frontmatter evidence;
- Java fenced code comments byte-identical to source and `Compaction` retained in English;
- the five prior marker-order files;
- the `identity`/`entity` false-positive files;
- PrivateLink Endpoint output;
- files that still fail because the model invented inline code or markers;
- REST `removeLocale(...)/deepEqual` preservation;
- code fences and comments byte-identical to source.

Do not weaken fail-closed checks to make residual invented-markup files pass. Preserve replay root, manifests, reports, and complete logs under `/private/tmp`.

### Replay-driven follow-up evidence (executed 2026-08-04)

- Final isolated replay root: `/private/tmp/zdoc-p0-4-final.ylKMvp`.
- All six retained Java/CLI/REST baseline and checkpoint archives were re-preflighted before replay; all 42 selected source hashes matched their manifests.
- Java final: 21/21 translated (19/19 historical failures plus 2/2 controls). `v2-Management-refreshLoad.md` contains `bulkImport 请求` in both frontmatter and body.
- CLI first replay exposed deterministic `endpoint -> Endpoint` normalization incorrectly changing `--endpoint` and `--endpoint-id`. RED tests now require long CLI options to be protected and deterministic prose repair to leave them unchanged. CLI final: 7/7 translated (5/5 historical failures plus 2/2 controls).
- REST first replay reproduced 5 marker failures. Raw-response diagnosis proved Translation was valid; draft re-protection renumbered markers after a legal within-entry reorder, producing false Reviewer evidence and a destructive Correction. RED tests now require source marker identity to remain bound to the protected value after reordering. REST final: 14/14 translated (12/12 historical failures plus 2/2 controls).
- Independent replay verification reported zero bad items for Java 21, CLI 7, and REST 14 after checking source hashes, protected bytes, semantic-unit locale issues, and REST `removeLocale(...)/deepEqual` preservation.
- Final replay logs contain no retry events and terminate at Java 21/0, CLI 7/0, and REST 14/0.

- [ ] **Step 5: Local commit only**

After all required gates and replay evidence are recorded, stage only the P0.4 plan, semantic-unit module/tests, intended runner/protection/locale/REST files, contracts, and prompts. Create a local commit such as:

```bash
git commit -m "feat(i18n): translate documents by semantic unit"
```

Do not push, create a PR, publish, or dispatch a workflow.

## Online `publish=false` canary preparation

After local gates pass, prepare but do not dispatch a new schema-v2 handoff:

1. `toolingSha`: the P0.4 commit.
2. Re-read current `refs/heads/dev` immediately before handoff generation.
3. Use that same latest `dev` SHA for global and every unit `targetBaselineSha`.
4. Keep source baseline `478aac6970af6ef944efb8c5df9a05f9444898da` and CLI/REST checkpoint `8ded19dc9c3a65284757f6030b2ba40bd2408c39` from fetch run `30873886876`.
5. Set `publish=false`.
6. Omit recovery run IDs so the new prompts, locale contract, semantic runner, and REST behavior execute.
7. Recommended order: `zh-CN/cli`, then `zh-CN/rest`.
8. Validate the generated handoff locally with the repository validator and retain JSON/output outside Git.

No `gh workflow run`, push, PR, or publication occurs without separate authorization.

## Final verification checklist

- [ ] Every new production behavior had an observed expected RED first.
- [ ] Agents receive coherent full-document/chunk context, not isolated AST text fragments.
- [ ] Translation returns every stable semantic unit ID exactly once.
- [ ] Reviewer evidence binds source/draft quotes to the same exact unit ID.
- [ ] Correction returns only authorized unit IDs and cannot rewrite unrelated units.
- [ ] Source offsets patch from highest to lowest; AST is never stringified.
- [ ] Fenced code, ESM, anchors, list/table structure, and non-unit bytes remain exact.
- [ ] Protected markers may reorder only within one semantic unit or REST string.
- [ ] Missing, duplicate, forged, cross-unit, and invented markers still fail closed.
- [ ] `identity` no longer triggers the `entity` contract; standalone entity/entities still do.
- [ ] PrivateLink prose uses `Endpoint`; the CLI command heading `create` remains unchanged.
- [ ] `Compaction` remains English and ordinary `compression` may remain `压缩`.
- [ ] REST stays JSON-path based and non-locale data remains deeply equal.
- [ ] Focused tests, full translation tests, workflow policy, diff check, status audit, and real artifact replay are recorded.
- [ ] Online CLI/REST canary handoff is only prepared, not dispatched.
