# Feishu native synced blocks research

Date: 2026-07-16

Scope: determine whether `zdoc-localize` can preserve code as a Feishu-native synced block when initializing a Chinese document, using only supported `lark-cli` and Feishu OpenAPI capabilities. No remote document was modified.

## Conclusion

Feishu exposes native synced blocks for reading, but the supported OpenAPI and the installed `lark-cli 1.0.67` do **not** expose a supported way to create a source synced block or a reference synced block.

- Block type `49` (`source_synced`) and block type `50` (`reference_synced`) are documented as query-only.
- `lark-cli docs +fetch` can discover and normalize both block types.
- The CLI's embedded DocxXML contract says `synced_reference` and `synced_source` cannot be created, and neither type can be copied by `block_copy_insert_after`; existing blocks can only participate in generic move operations.
- Supplying `<synced_reference ...>` to `docs +update --dry-run` only echoes the unvalidated request. It does not establish server support and conflicts with both the CLI contract and the public OpenAPI contract.

Therefore, `zdoc-localize` cannot create the native reference needed by an empty Chinese target today. A safe product workflow must make the missing reference an explicit manual action, withhold the localization receipt, and verify the exact source document/block identity after a human inserts the reference in the Feishu UI. The human action may be pre-seeded before automatic writes or completed after the CLI inserts a reviewed placeholder. Copying the code text as an ordinary `<pre>` block is technically possible, but it loses native synchronization and is not equivalent.

## Real document evidence

The user-provided Chinese example is [this Feishu section](https://zilliverse.feishu.cn/wiki/SQQowEMkwiwYvWkwETbczgj8nUh#KtpOdQzgfoRx2VxlRKLcjexDnNg).

Fetching that section with full block metadata returned:

```xml
<synced_reference
  id="TojWdBeYioJ3oUxmrYCcpRUMnee"
  src-block-id="KntZdQnJSssie5b9jB6cmfBanJc"
  src-token="Ei8mdoiEgou7ZexX4KjcbL8Qnhg">
</synced_reference>
```

The corresponding raw OpenAPI object is:

```json
{
  "block_id": "TojWdBeYioJ3oUxmrYCcpRUMnee",
  "block_type": 50,
  "parent_id": "DHgJdinTZoIEkOxtOQGcp56Onzf",
  "reference_synced": {
    "source_block_id": "KntZdQnJSssie5b9jB6cmfBanJc",
    "source_document_id": "Ei8mdoiEgou7ZexX4KjcbL8Qnhg"
  }
}
```

Fetching the referenced source block returned a type `49` container:

```xml
<synced-source id="KntZdQnJSssie5b9jB6cmfBanJc">
  <pre lang="Python">...</pre>
  <pre lang="Java">...</pre>
  <pre lang="JavaScript">...</pre>
  <pre lang="Go">...</pre>
  <pre lang="Bash">...</pre>
  <pre lang="C++">...</pre>
</synced-source>
```

The raw source block contains six child block IDs, each a normal type `14` code block. The reference block itself does not contain or duplicate those code children; it stores only the source document/block identity.

This matches Feishu's official FAQ: a block created directly in a document is a source synced block, while a copy-pasted instance is a reference synced block. The reference must be dereferenced through `source_document_id` and `source_block_id`, then read with the source block's children endpoint. See [FAQ: source and reference synced blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq.md#21-%E5%A6%82%E4%BD%95%E8%8E%B7%E5%8F%96%E6%BA%90%E5%90%8C%E6%AD%A5%E5%9D%97%E7%9A%84%E5%86%85%E5%AE%B9).

## Supported read and verification path

The supported verification chain is:

1. Read the target reference block:

   `GET /open-apis/docx/v1/documents/:target_document_id/blocks/:reference_block_id`

2. Assert `block_type == 50` and compare both `reference_synced.source_document_id` and `reference_synced.source_block_id` with the approved source identity.

3. Read the source container:

   `GET /open-apis/docx/v1/documents/:source_document_id/blocks/:source_block_id`

4. Assert `block_type == 49`.

5. Read its complete contents:

   `GET /open-apis/docx/v1/documents/:source_document_id/blocks/:source_block_id/children?with_descendants=true`

The block-get API and children API are both officially supported, accept a revision selector, and are limited to 5 requests per second per application. See [Get a block](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get.md) and [Get all child blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get-2.md).

`lark-cli docs +fetch --detail full` provides a higher-level equivalent:

- The target returns `<synced_reference src-token="..." src-block-id="...">` and does not inline the source code.
- Fetching `src-token` at `src-block-id` returns `<synced-source>` with the source descendants.

This lets `zdoc-localize` verify an already-existing native reference without changing it.

## Creation and update capability

### Creating the synced relationship

There is no supported creation API:

- Feishu's [Block data structure](https://open.feishu.cn/document/docs/docs/data-structure/block.md) says `ReferenceSynced` is read-only and cannot be created, and says the same for `SourceSynced`.
- Feishu's [Create blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create.md) lists type `49` and type `50` as query-only even though they appear in the shared block schema.
- The installed CLI's version-matched `lark-doc` XML guide says `synced_reference` and `synced_source` are not creatable. It also excludes them from `block_copy_insert_after`; generic moving of an already-existing block is supported.

There is also no cross-document source identity in the CLI copy command. `docs +update --command block_copy_insert_after` accepts only the target document, target anchor, and source block IDs, while its documented resource whitelist explicitly excludes both synced block types.

### Updating source content

The synced containers and their source mapping are read-only. However, descendants inside a source synced block are ordinary blocks. In the real example they are type `14` code blocks, and the official [Update a block](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/patch.md) API supports updating Code block text and style. The [Batch update blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_update.md) endpoint supports up to 200 distinct block updates per request.

That does not solve localization initialization:

- Updating source descendants changes the English source of truth, which `zdoc-localize` must not do.
- It cannot create the missing reference in the Chinese target.
- Native propagation from an edited source to existing references is Feishu product behavior, but it was not mutated or empirically tested during this read-only research.

Write APIs are limited to 3 requests per second per application and 3 concurrent edits per second per document. They support `document_revision_id` and optional idempotency tokens, but there is no atomic transaction spanning the source and target documents.

## Identity and permission requirements

For current-version reads, one of these API scopes is required:

- `docx:document:readonly`
- `docx:document`

For writes to ordinary child blocks, one of these is required:

- `docx:document:write_only`
- `docx:document`

Scopes alone are insufficient. The calling identity must also have resource-level access:

- With `user_access_token`, the user must be able to read the reference and the source synced block. Editing the target requires target edit permission. Reading historical revisions requires edit permission.
- With `tenant_access_token`, the app must have document access to both the target and source documents, typically by being added as a document application.
- Feishu's FAQ explicitly requires the app to have source-document read permission when dereferencing as an app, and requires the user to have synced-block read permission when dereferencing as a user.

The current authenticated user successfully read both real blocks. The current bot identity received error `1770032 forbidden` when reading the target reference, demonstrating that bot scopes do not automatically grant document-level access.

## Current `zdoc-localize` support and gaps

### Parsing

The semantic model has only broad `resource` and `opaque` kinds; it has no dedicated synced-source or synced-reference identity. See [`model.ts`](../src/domain/model.ts).

The parser maps `synced_reference` and `synced_source` to `resource`, but the real CLI output uses an underscore for the reference tag and a hyphen for the source tag:

- actual reference: `<synced_reference>`
- actual source: `<synced-source>`

Because [`xml-parser.ts`](../src/domain/xml-parser.ts) recognizes `synced_source` but not `synced-source`, a real source container is currently classified as `opaque`. Both outcomes are non-writable and neither captures typed `sourceDocumentId` / `sourceBlockId` fields.

### Planning and creation

Only titles, headings, paragraphs, lists, quotes, and restricted callouts are structurally writable. Ordinary `<pre>` code blocks are non-writable but receive a special creation exception: they bypass the report-only blocker and are copied verbatim into the new target. See [`xml-parser.ts`](../src/domain/xml-parser.ts) and [`workflows.ts`](../src/application/workflows.ts).

A synced-source container does not get that exception. It becomes `resource` or, with the current real tag spelling, `opaque`, so new-target creation is blocked as report-only content. This is safer than silently flattening the synced relationship.

The document adapter supports fetch, ordinary block replace/insert/delete, and full document creation through `lark-cli`; it has no method to create or bind a synced reference. See [`lark-docs-adapter.ts`](../src/adapters/lark-docs-adapter.ts).

### Recommended design behavior

For the existing-empty-target design, model native synced content explicitly:

```text
source_synced(documentId, blockId, descendants)
        |
        | required native relationship
        v
reference_synced(sourceDocumentId, sourceBlockId)
```

Recommended rules:

1. Parse both `<synced-source>` and any legacy/alternate `<synced_source>` spelling, plus `<synced_reference>`, into explicit semantic kinds.
2. Preserve the exact source document ID and source block ID as protected identity fields.
3. Show a review/preview operation such as `ensure_native_synced_reference`, including the exact source document and block IDs.
4. If the target already contains a matching reference, treat the operation as verified passthrough and do not rewrite it.
5. If the matching reference is absent, emit a protected manual action. The approved workflow may insert a placeholder at the exact target position, but it must not save a receipt or report completion until a human replaces it with the native reference and verification succeeds.
6. Offer only these deliberate next steps:
   - a human creates/pastes the synced reference in Feishu and the CLI verifies it;
   - Feishu/lark-cli adds a supported creation API and the adapter is extended;
   - the product owner explicitly accepts a non-synced verbatim code copy as a different fallback policy.
7. Never emulate a synced block by writing ordinary `<pre>` blocks while claiming native synchronization.

This means Whiteboard verbatim copy and native synced code should be separate operation types. Whiteboard may have a supported copy path; native synced code currently has a supported read/verify path but no supported create path.
