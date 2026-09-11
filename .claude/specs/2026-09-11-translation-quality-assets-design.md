# Translation quality assets

Date: 2026-09-11
Status: Implemented (assets + ja-JP wiring; TM retrieval is offline-only tooling)
Branch: `feat/translation-quality-assets`

## Problem

The ja-JP translation pipeline had no explicit house-style asset: style knowledge was split
between four prompt files, the locale contract's four `styleRules`, and the implicit habits of
published translations. Incremental translation also retranslated whole pages without any
translation-memory reuse. Separately, an agentic (whole-file, Codex-SDK-style) translation
prototype was validated offline; this change lands the reusable quality assets that both the
current pipeline and the future agentic provider consume.

## Assets

1. **Japanese style guide** — `.github/prompts/codex-style-guide.ja-JP.md`, registered as the
   `style` prompt for the `ja-JP` target in `scripts/translation/prompts.js`.
   `agentRunner.loadSystemPrompt` now composes locale contract → style guide → stage prompt,
   keeping the shared stable prefix (prompt-cache friendly) for all four stages. Content: 55
   scenario rules distilled from 12 published parallel pages plus 12 resolved editorial
   decisions (D1–D12) with corpus examples.
2. **TM layer 1** — `scripts/translation/tm-retrieve.js`: deterministic, read-only retrieval of
   published EN/JA parallel pages for a target page by path adjacency (same directory → parent
   chain → similarity-gated domain fallback), with heading-anchor-aligned section excerpts and
   a `--render-fewshot` renderer. No LLM, no network; output/cache under `tmp/tm-retrieve/`.
   Not yet wired into any runner; it is an offline asset for prompts and future providers.
3. **Contract linkage** — `config/translation/ja-JP.json` `styleRules` gains a pointer to the
   injected guide; `contractId` advances to `ja-JP-2026-09-11-p0.5`. The zh-CN-reference
   contract is untouched.

## Prompt-contract compatibility impact

Registering the style prompt changes `promptContractSha256` for `ja-JP` only (zh-CN-reference
has no `style` entry). Retained ja-JP recovery artifacts therefore cross a prompt-contract
boundary. The recovery machinery is designed for this: records downgrade `strict →
`revalidated` and are restored/resumed after passing the **current** deterministic gates
(`recovery-artifact.js`, `chunkRecovery.js`, `semanticRecovery.js`). Existing tests already pin
this behavior (`chunkRecovery.test.js` "revalidates a partial prefix after prompt or model
changes", `recovery-preflight.test.js` prompt-mismatch case). No override flag is required;
review receipts are intentionally not inherited across the boundary, per the same policy as
semantic seeds.

## D2 terminology whitelist decision

The resolved whitelist mechanism is documented in style guide §5: product terms with approved
Japanese renderings are always translated; English retention is reserved for UI element names
(menu paths, buttons, dashboard metric names) and unratified new-feature names, which are
registered case by case. This PR deliberately adds **no** `doNotTranslate` tokens: that list is
also consumed as protected `literalTokens`, and the candidate words (Usage, Dependencies, …)
are common English words whose global protection is untested. Token ratification lands as
follow-up contract bumps.

## Roadmap (unit pipeline retirement)

- Phase A (first commit): assets + ja-JP wiring; unit pipeline and semantic seeds unchanged.
- Phase B (second commit, implemented): `scripts/translation/agenticProvider.js` — a
  locale-agnostic whole-file provider over the Codex SDK with bounded repair rounds and the
  shared deterministic validator (`scripts/translation/validate-translation-file.js`). It emits
  the agentRunner-compatible report envelope with file-level results only (no unit
  checkpoints) and ignores in-flight unit recovery inputs by design. The producer step in
  `_translate-content-group.yml` branches on the `TRANSLATION_PROVIDER` repo variable
  (default `unit-pipeline`; `agentic` uses `DEEPSEEK_API_KEY`/`DEEPSEEK_BASE_URL`/optional
  `AGENTIC_TRANSLATION_MODEL`). The surgical incremental lane lands as
  `scripts/translation/surgicalUpdate.js`: a deterministic section-hash classifier routes
  changed files between surgical in-place updates and full retranslation, and a
  protected-token coverage guard verifies that link/anchor/code changes in the source are
  reflected in the target without demanding arbitrary rewording (validated on a real
  historical one-link change: the published target that already carried the new link passes
  with zero edits, which requires the shared deterministic gates to ignore protected bytes —
  a link destination or heading anchor such as `./manage-cluster` or
  `{#cluster-level-isolation}` carries a locale-contract term but cannot be localized, so it
  is neither a terminology obligation nor a repair site). Remaining Phase B work: wiring the
  lane into the incremental manifest selection; consuming the retained ja-JP recovery backlog.
- Phase C: zh-CN-reference follows the same route (zh style-guide distillation, contract
  expansion, provider reuse — the provider must stay locale-agnostic).
- Phase D: retire the unit translation path in a dedicated PR once both lanes are migrated,
  keeping the file-level manifest/report/recovery contracts.

## Evidence summary (offline, 7-page benchmark)

Agentic whole-file mode with these assets vs the production pipeline under a segmented
third-family judge (glm): 2 : 2 : 3 (prod : agent : tie), 38/38 segment margins small; earlier
stages scored 5:1 and 4:1 without the style guide and polish pass. Cost ¥0.77/page off-peak
(flash translate + v4-pro polish, 97% input cache), 4–15 min/page wall, 14/14 deterministic
gate passes. Judge layer: model-level nondeterminism exists (~1 segment flip per rerun);
automated judging is directional only until calibrated against human MQM sampling.

## Verification

Selector union for every changed path, beginning with focused tests:

```bash
node --test scripts/translation/tm-retrieve.test.js
pnpm test:translation
pnpm test:workflow-matrix
pnpm test:workflow-policy
git diff --check
```
