# Translation Agent P0 Design

## 1. Goal

Make the Chinese and Japanese translation agents fail closed on protected MDX content, follow versioned locale terminology rules, accept only evidence-backed reviewer findings, and apply corrections surgically. The design must reproduce and prevent the concrete failures observed in translation run `30879406091` while preserving the existing translation workflow, manifests, recovery artifacts, and publication contracts.

## 2. Scope

P0 includes:

- deterministic protection of fenced code blocks, inline code, URLs, repository paths, heading anchors, placeholders, MDX/JSX syntax, and protected frontmatter structure or values;
- source/target protected-content comparison after the initial translation and after every correction;
- compact runtime guidance for `zh-CN-reference` and `ja-JP`, backed by versioned glossary and do-not-translate data;
- a dedicated Simplified Chinese correction prompt;
- reviewer JSON with source and draft evidence, plus runner-side validation that evidence is real before correction;
- regression fixtures derived from the Go frontmatter-token false positive, the Java reviewer incorrectly requiring `Compaction` to become `压实`, and the Java/CLI code-comment failures from run `30879406091`;
- recovery prompt-contract hashing that changes whenever a prompt, glossary, or correction contract changes.

P0 does not include:

- changing translation handoff schema v2, checkpoint schema, publication ordering, or source-fetch behavior;
- translating Chinese Guides into another locale;
- broad editorial cleanup of existing translated content;
- automatic publication during the first online canary.

## 3. Considered approaches

### 3.1 Prompt-only enforcement

Expand the four existing translation/review prompts and rely on the models to preserve protected content and provide valid evidence.

This is the smallest change, but it does not fail closed. The observed code-comment and frontmatter-token failures already show that prompt instructions and reviewer assertions are not reliable enough on their own.

### 3.2 Add all checks directly to `agentRunner.js`

Implement protected-token extraction, glossary formatting, review validation, and correction filtering in the existing runner.

This would work, but it would further mix provider orchestration, document parsing, validation, and locale policy in one large file. It would also make the protected-content contract harder to test independently.

### 3.3 Recommended: modular deterministic guard plus versioned locale contracts

Add focused modules for protected MDX content, locale guidance, and reviewer evidence. Keep `agentRunner.js` responsible for sequencing only. The model sees placeholders for content that must remain byte-identical; the runner restores the original bytes and rejects marker changes, extra markers, missing markers, or protected-content mismatches.

This approach gives deterministic safety for P0 failures while keeping locale policy and reviewer trust boundaries explicit and testable.

## 4. Architecture

### 4.1 Protected-content module

Create `scripts/translation/protectedContent.js` with a small public interface:

- `protectTranslationInput(sourceContent)` returns model-facing content and an immutable protection manifest;
- `restoreProtectedContent(modelContent, manifest)` restores original bytes and rejects changed, missing, duplicated, reordered, or invented markers;
- `validateProtectedContent(sourceContent, targetContent)` compares protected structures after restoration and returns concrete validation errors.

Protection covers:

- complete fenced code blocks, including fence lines, code, comments, strings, output, blank lines, indentation, and final newline;
- inline code spans;
- ESM import/export statements;
- URLs, repository-relative paths, heading anchor IDs, and recognized placeholders;
- MDX/JSX tag names, attribute names, non-human-readable attribute values, expressions, and nesting tokens;
- frontmatter delimiters and keys, plus values that are identifiers or protected metadata. Human-readable fields such as `title`, `sidebar_label`, `description`, and `keywords` remain translatable.

Markers are internal transport syntax and must not survive in final output. The protection manifest records the original bytes and category for every marker so error messages name the exact protected category without claiming two identical strings differ.

### 4.2 Locale contracts

Create versioned JSON contracts:

- `config/translation/zh-CN-reference.json`
- `config/translation/ja-JP.json`

Each contract has an exact schema containing:

- `schemaVersion`;
- concise style rules;
- mandatory term mappings;
- forbidden translations;
- do-not-translate tokens;
- a small set of approved examples for the real P0 failure modes.

Create `scripts/translation/localeContract.js` to validate, deeply freeze, load, and format these contracts for prompts. The runner appends the formatted contract to Translation, Review, and Correction system messages. The Chinese contract mandates preserving `Compaction` exactly and forbids replacing it with `压缩`, `压实`, or another Chinese term. The Japanese contract replaces the current blanket rule that keeps ordinary concepts such as `collection`, `cluster`, `vector`, and `index` in English with the approved Japanese terminology from the Japanese guide.

The two detailed guide documents remain maintainers' references. Runtime prompts receive only the compact contract needed for deterministic, low-noise agent behavior.

### 4.3 Prompt separation

Update the existing Chinese and Japanese Translation and Review prompts to:

- explicitly state that fenced code comments are protected bytes;
- use explicit `<source>` and `<draft>` boundaries;
- defer terminology decisions to the injected locale contract;
- prohibit unsupported reviewer claims.

Create `.github/prompts/codex-correction-agent.zh-CN-reference.md`. Chinese correction no longer reuses the translation prompt. It must modify only runner-validated issues, preserve all other draft content, and return the draft unchanged when no validated issue remains.

The existing Japanese correction prompt is retained but aligned with the same evidence and surgical-correction contract.

### 4.4 Evidence-backed reviewer contract

Reviewer output uses an exact JSON schema:

```json
{
  "pass": false,
  "issues": [
    {
      "severity": "medium",
      "type": "terminology",
      "location": "paragraph containing Compaction",
      "source_quote": "Compaction plans",
      "draft_quote": "压缩计划",
      "comment": "Preserve the product term Compaction; use Compaction 计划."
    }
  ]
}
```

Create `scripts/translation/reviewEvidence.js` to parse an exact schema and validate each issue:

- `source_quote` must be a non-empty contiguous substring of the model-visible source;
- `draft_quote` must be a non-empty contiguous substring of the current draft;
- omission findings must cite an existing source substring and real nearby draft context;
- severity and type must be allowed enum values;
- duplicate issues are removed deterministically;
- a reviewer response with `pass: true` must contain no issues;
- a response with `pass: false` but no validated issues is treated as an unsupported review and does not authorize correction.

Unsupported issues are recorded in the report for diagnosis but are not sent to the Correction Agent. If all allegations are unsupported, the runner performs deterministic validation and accepts or rejects the unchanged draft based on actual evidence rather than reviewer confidence.

### 4.5 Translation and correction flow

For each complete file or chunk:

1. Protect the source and send only model-facing content to the Translation Agent.
2. Restore protected bytes and fail the attempt immediately if marker integrity is broken.
3. Run deterministic protected-content validation.
4. Send explicitly delimited source and draft to the Review Agent.
5. Parse and validate reviewer evidence against the exact strings supplied in that round.
6. If validated issues remain and review rounds are available, send only those issues to the locale-specific Correction Agent.
7. Restore and validate protected content again after correction.
8. Repeat review, then run the existing YAML, MDX compilation, structural, anchor, and group validation before writing the target.

This ordering prevents the Correction Agent from acting on hallucinated evidence and prevents any model round from changing protected bytes.

## 5. Error handling and reporting

- Marker corruption, protected-content mismatch, malformed locale contracts, and malformed reviewer schemas fail closed with category-specific errors.
- Provider timeouts retain the existing retry behavior.
- Reviewer parse failures remain review failures, but their raw text is bounded in reports.
- Unsupported reviewer allegations are represented separately from confirmed issues so reports do not claim a token changed when source and draft are identical.
- No target file is written until all deterministic and model review gates pass.

## 6. Tests

Use Node's existing test style and TDD.

Unit tests cover:

- byte-identical fenced code restoration, including natural-language comments;
- inline code, URL, path, anchor, placeholder, ESM, JSX, and frontmatter protection;
- missing, changed, duplicated, reordered, and invented markers;
- locale-contract schema, formatting, mandatory terminology, and forbidden translations;
- exact reviewer schema and evidence-substring validation;
- false allegations where `source_quote` or `draft_quote` is absent;
- independent Chinese correction prompt selection;
- prompt-contract hash changes when locale contracts or correction prompts change.

Runner regression tests reproduce:

- identical frontmatter tokens must not produce a false "changed from X to X" failure;
- Java/CLI code comments remain byte-identical even if the model attempts to translate them;
- `Compaction` remains `Compaction`; drafts using `压缩` or `压实` are rejected or corrected, while reviewer instructions that require either Chinese replacement do not trigger an incorrect rewrite;
- protected content remains unchanged across multiple correction rounds and chunk assembly.

The final local gate runs the focused tests, `pnpm test:translation`, and the relevant workflow-policy tests.

## 7. Online validation

After the P0 commit is available to GitHub Actions, create a new schema-v2 handoff rather than reusing the old handoff verbatim:

- use the new P0 commit as `toolingSha`;
- use the current `dev` SHA as global and unit `targetBaselineSha`;
- retain the immutable source baseline/checkpoint pairs from fetch run `30873886876`;
- set `publish=false`;
- omit recovery run IDs so the new prompt contract and runner execute.

Run canaries for `zh-CN/java`, `zh-CN/cli`, `zh-CN/go`, and `ja-JP/guides`. Only after these pass should a separate full publication run be authorized.

## 8. Acceptance criteria

P0 is locally complete when:

- all protected categories are enforced deterministically before and after correction;
- Chinese and Japanese runtime contracts are loaded and included in prompt-contract hashing;
- Chinese correction uses its own prompt;
- reviewer findings cannot authorize correction without valid source and draft evidence;
- `Compaction` remains unchanged wherever it is used as the Milvus/Zilliz product concept;
- all regression and existing translation tests pass;
- the implementation plan's local real-artifact replay gate is satisfied.

P0 is production-validated when all four `publish=false` canaries based on fetch run `30873886876` complete successfully and their reports show no protected-content mismatch, unsupported reviewer allegation causing correction, or mandatory terminology violation.
