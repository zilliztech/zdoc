# Translation Workflow Reference

## Translation request input

Each item in `translation-requests.json` contains an immutable `operationId`, change kind, English before/after text, current Chinese, section context, approved glossary terms, translation-memory examples, protected tokens, link mappings, link warnings, and target node kind. Present every link warning during review; never invent a Chinese anchor.

For lists and native tables, the request contains an immutable topology hash and editable structured slots instead of one flattened text field. Slot IDs are stable structural paths such as `item-0/text` and `row-1/cell-0/paragraph-0`. Each slot carries its own source text, current Chinese, protected inline tokens, and translation-memory suggestions. Return every requested slot exactly once; do not change list nesting/order, table rows/columns/cell placement, code tokens, links, or inline formatting topology.

## Translation response output

Write a JSON array to a relative workspace file.

For insert or replace:

```json
{
  "operationId": "<exact request operationId>",
  "translatedText": "审核前的建议中文",
  "targetNodeKind": "paragraph"
}
```

For delete:

```json
{
  "operationId": "<exact request operationId>",
  "decision": "delete"
}
```

For a list or native table:

```json
{
  "operationId": "<exact request operationId>",
  "slots": [
    {"slotId": "<exact slotId>", "translatedText": "审核前的建议中文"}
  ],
  "targetNodeKind": "list"
}
```

Use Markdown only for inline formatting that must survive review, such as `` `code` ``, `**bold**`, and `[visible text](URL)`. Keep URLs unchanged unless the request supplies a registered Chinese link mapping.

## Command sequence

```bash
zdoc-localize plan create --pair <pair-id> --format json
zdoc-localize plan classify --run <run-id> --applicable <change-id,change-id> --format json
zdoc-localize plan complete --run <run-id> --translations <relative-json> --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --preview --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --approval-token <token> --format json
zdoc-localize manual verify --run <run-id> --format json
zdoc-localize status --run <run-id> --format json
```

The review and its plan are revision-bound. If either remote document changes before apply, discard the old review and create a new plan. Structured review sections show the protected source topology, a proposed target rendering, and one editable region per slot. Editing outside those regions or changing the topology hash invalidates the review.

The apply preview contains the exact Engine batch fingerprint. Present `docxEngineVersion`, `engineSchemaVersion`, `batchFingerprint`, all operation summaries, and the approval token together, alongside every planning warning already reported to the user. Approval applies only to that fingerprint. The CLI stores the schema-v2 prepared batch and approved review in an immutable preview bundle, regenerates the batch before write, and rejects any fingerprint change.

For a title-only existing Chinese target, `plan create` produces a complete initialization plan. Do not run `bootstrap accept` on that empty target. Ordinary code is copied verbatim, Whiteboards are mirrored without translation, and native synced-code sources become protected placeholders. After the approved automatic apply, the user replaces each placeholder with a Feishu native synced reference and `manual verify` validates the exact source document/block identity before the receipt advances.

On later runs, native synced-code changes are verify-only and make zero target code writes. Changed Whiteboards are mirrored again to the existing target Whiteboard token.

The localization baseline is remote-to-remote: the receipt binds the last verified remote English snapshot to the corresponding remote Chinese snapshot and block correspondences. `plan create` reads both current documents, migrates a safe legacy receipt when needed, and computes only the English delta since that verified point. A separate local-English publishing task may use `$feishu-md-sync`, but `zdoc-localize` never invokes that executable as part of planning, apply, or recovery.
