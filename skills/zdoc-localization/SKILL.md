---
name: zdoc-localization
description: Localize registered ZDoc English Feishu documents into Chinese with the zdoc-localize CLI. Use when a user wants to bootstrap an English/Chinese Feishu pair, detect remote English changes, generate or edit a Chinese translation review, apply approved block-level Chinese updates, inspect localization status, or recover a stale or partial localization run. Do not use it to publish local English Markdown; route that work to feishu-md-sync.
---

# ZDoc Localization

Use `zdoc-localize` as the deterministic engine. Generate translations conversationally, but leave document state, diffing, alignment, plan validation, writes, and verification to the CLI.

Skill version: `1.0.0`. Compatible CLI: `>=0.1.0 <0.2.0`.

## Check Compatibility

Resolve one executable path and check it before any workflow:

```bash
ZL="$(command -v zdoc-localize)"
test -n "$ZL" && test -x "$ZL"
"$ZL" --version
"$ZL" capabilities --format json
"$ZL" doctor --format json
```

Stop when the version is outside the supported range or required capabilities are absent. Do not guess renamed commands or JSON fields.

## Route the Request

- Local English Markdown publication or English local/remote reconciliation → use `$feishu-md-sync`.
- Registered remote English → remote Chinese localization → continue here.
- Ad hoc remote-only Chinese editing unrelated to an English diff → use `$lark-doc`.
- Authentication, user identity, or missing scopes → use `$lark-shared`.

## Run the Workflow

1. Register a confirmed pair with `pair add`, or inspect existing pairs with `pair list/show`.
2. For an untracked pair, run `bootstrap plan`. Present the structural audit and wait for explicit baseline acceptance before `bootstrap accept`.
3. Run `plan create --pair <id> --format json`.
4. If state is `classification_required`, present every English change and obtain applicability decisions. Continue with `plan classify --run <id> --applicable <comma-separated-change-ids>`. Do not classify selective content silently.
5. If state is `translation_required`, read the generated `translation-requests.json`. Read [references/workflow.md](references/workflow.md) before generating `translations.json`.
6. Run `plan complete --run <id> --translations <relative-file> --format json`.
7. Present the generated `review.md`. The user may edit only the marked translation regions.
8. Never run `apply` without explicit document-level approval of the current review file.
9. After approval, run `apply --run <id> --review <relative-file> --format json`.
10. Verify `state=completed` and report the validation path. Do not claim completion from a successful write call alone.

All file arguments must remain inside the current workspace. Use JSON output for machine decisions.

## Generate Translations

- Return exactly one response for every operation ID and no unknown IDs.
- Preserve code, commands, variables, URLs, citations, and resource tokens exactly.
- Apply approved glossary terms; treat candidate terms as suggestions only.
- Translate a whole paragraph or list block while using full section context.
- For deletion requests, return the explicit `delete` decision instead of translated prose.
- Do not invent operations, targets, block IDs, or anchors.

## Handle Errors

Read [references/errors.md](references/errors.md) when a command fails or returns a blocked workflow state.

- Never retry `confirmation_required` with a confirmation flag automatically.
- Treat `stale_plan` as an invalidated review and regenerate it.
- Treat low-confidence alignment and unsupported changed content as valid stop states.
- On `partial_write`, inspect recovery evidence before proposing any reversal.
- Do not update the English local Markdown during a localization task.
