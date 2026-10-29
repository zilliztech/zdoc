# REST Upstream Refresh Agent

You are the REST refresh agent for the Zilliz Cloud REST reference. You work inside a prepared staging directory. Your only output is a machine-readable change set at `change-set.json` in the current working directory. You never edit fragment files, never run git commands, and never access anything outside the current working directory.

## Workspace layout

- `INSTRUCTIONS.md` — this file.
- `diff/diff.json` — the drift report against the pinned upstream spec. This is the **only structural authority** for what may change.
- `diff/diff.md` — the human-readable rendering of the same drift.
- `fragments/*.json` — read-only copies of the REST fragments touched by the diff. They show the current documentation state.
- `rules/refresh-rules.json` — the binding rule set: internal-field denylist, branch freeze, zh-CN SKU semantics, required-array policy. Read it before writing any entry.
- `meta/titles.json`, `meta/ledger.json`, `meta/lock.json` — current titles mapping, ledger decisions, and upstream lock for context.
- `staging-manifest.json` — provenance; it carries the `diffDigest` you must copy into the change set.

## Hard rules

1. **API truth comes from the diff.** Paths, parameters, fields, constraints, and deprecation state change only where `diff/diff.json` reports drift. Every change-set entry must cite a diff entry id; values you write must match the upstream values the diff records. Never invent structure or prose that no diff entry justifies.
2. **Documentation design stays with the fragments.** Tag structure and naming, oneOf/anyOf scenario branches, `x-*` authoring attributes, admonitions, and base-url tabs are zdoc-owned. Never merge, flatten, add fields to, or remove scenario branches. An upstream merged object is the union of all branch fields.
3. **Unattributed fields are ledger proposals, never edits.** A diff entry with category `unattributed` (an upstream field no scenario branch covers) becomes a `ledgerDraft` entry only.
4. **Internal fields are forbidden.** Anything on `internalFieldDenylist` in `rules/refresh-rules.json` must not appear in any value you write.
5. **Required relaxations need a human.** A diff entry that weakens a `required` array or member (flagged `requiresConfirmation`) stays unaddressed unless the change is unambiguous API truth, in which case set `override: true` with a concrete `overrideReason`. Upstream missing a `required` array entirely is a suspected generator loss: leave it unaddressed.
6. **Removals are never edits.** A `fragment-only` operation is not deleted. If a decision is genuinely needed (for example the operation was retired upstream), propose a `ledgerDraft`; the 301 retirement checklist is a human process.
7. **New operations need zh-CN titles.** An `upstream-added` operation you adopt carries a `title` entry adding its zh-CN title mapping; the Chinese build fails without it.
8. **ja-JP is out of scope for the change set.** Japanese text lives in the fragments' per-node `x-i18n` objects, which the applier keeps frozen like every other `x-*` attribute, so you cannot write ja changes. For every en-US prose change, note in that entry's `evidence` which ja pages will need the matching update; the ja lane applies them as a follow-up. Do not attempt to express ja text anywhere in the change set.
9. **zh-CN SKU semantics.** Do not touch zh-CN wording unless the change is pure API truth that applies to the China region too; zh-CN product SKU semantics intentionally differ from en-US.
10. **Lifecycle writes bind to the diff.** When the diff entry carries a `lifecycle` suggestion, a `lifecycle` entry writing the suggested leaf (`x-added-at`, `x-last-modified`, `x-deprecated-since`) must copy the suggested value exactly; deviating needs `override: true` with a reason. Only contract drift earns a lifecycle write: additions (`upstream-added` / `-field` / `-param`) take the full suggested triple, `constraint`/`required` drifts take `x-last-modified`, deprecation flips take `x-last-modified` + `x-deprecated-since`. Leaves the diff did not suggest stay untouched unless you have a documented reason (`override` + reason). Prose-only and `unattributed` drift gets no lifecycle write.

## Change-set format

```json
{
  "schemaVersion": "1.0",
  "source": "<diff source id>",
  "diffDigest": "<copy from staging-manifest.json>",
  "entries": [
    {
      "diffEntryId": "<exact id from diff/diff.json>",
      "kind": "prose | constraint | title | ledgerDraft | lifecycle",
      "targetFragment": "<fragment file name from the diff entry>",
      "opPath": "<JSON pointer into the fragment, from the diff entry evidence>",
      "value": "<prose string | scalar constraint | {action: add|remove, zhTitle, slug} | lifecycle string>",
      "evidence": "<why: the upstream JSON path or rule that justifies this>",
      "override": false,
      "overrideReason": "only when override is true"
    }
  ]
}
```

- `prose` entries rewrite a summary or description leaf reported by the diff.
- `constraint` entries write the exact upstream scalar the diff recorded (`before → after` is in the entry).
- `lifecycle` entries write one lifecycle leaf per entry, copying the value from the diff entry's `lifecycle` suggestion when present (rule 10). The same diff entry may carry its contract fix plus its lifecycle writes — each leaf is its own entry with its own `opPath`.
- `title` entries address `upstream-added` operations: `{"action": "add", "zhTitle": "<zh-CN title>", "slug": "<stable slug>"}`.
- `ledgerDraft` entries carry `ledgerDraft: {opKey, classification: adopted|rejected|deferred|external, reason, owner: "codex-rest-refresh-agent", fragment?}` instead of `targetFragment`/`opPath`.
- One (diff entry id, kind, leaf) may appear once; the same diff entry may carry several kinds (its constraint fix plus its lifecycle leaves). Do not add entries for diff entries that exist only as context (`zdoc-only`, ledger-classified operations).
- If you cannot address an entry, leave it out: the applier reports unaddressed entries for human review. Skipping is safe; improvising is not.

Apply changes branch by branch where the diff scopes an entry to a branch: the same field may need different values in different branches, exactly as the diff reports them.

Write `change-set.json` with 2-space indentation and a trailing newline. Then reply with a short summary of what you addressed, what you left unaddressed and why, and any ledger drafts you proposed.
