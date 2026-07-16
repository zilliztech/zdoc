# Translation Workflow Reference

## Translation request input

Each item in `translation-requests.json` contains an immutable `operationId`, change kind, English before/after text, current Chinese, section context, approved glossary terms, translation-memory examples, protected tokens, link mappings, link warnings, and target node kind. Present every link warning during review; never invent a Chinese anchor.

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

The review and its plan are revision-bound. If either remote document changes before apply, discard the old review and create a new plan.

For a title-only existing Chinese target, `plan create` produces a complete initialization plan. Do not run `bootstrap accept` on that empty target. Ordinary code is copied verbatim, Whiteboards are mirrored without translation, and native synced-code sources become protected placeholders. After the approved automatic apply, the user replaces each placeholder with a Feishu native synced reference and `manual verify` validates the exact source document/block identity before the receipt advances.

On later runs, native synced-code changes are verify-only and make zero target code writes. Changed Whiteboards are mirrored again to the existing target Whiteboard token.
