---
name: zdoc-local-doc-ops
description: Use when a ZDoc request asks to sync SDK docs, draft a source-verified doc, verify Feishu doc code, or plan code-example patches.
---

# ZDoc Local Doc Ops

Use these intents for bridge planning and reports. They never deploy docs. After content is updated and approved, a later explicit `publish_docs` request must use `zdoc-feishu-doc-publish` as the final deployment stage.

## Routing Contract

For each received message, return exactly one skill and one intent: `skill: "zdoc-local-doc-ops"` plus one intent below. Bridge intents are never made live by `approved` or `needsApproval`. Feishu links must be HTTPS `/wiki/<token>` or `/docx/<token>` URLs on `feishu.cn` or a subdomain. For link-based intents, put at least one link in `docLinks`; the bridge uses the first link.

| Intent | Required fields | Behavior |
|---|---|---|
| `sync_sdk_docs` | `language`, `sdkVersion` | SDK sync plan with `--dry-run`. Languages: `python`, `java`, `node`, `go`, `cpp`, `zilliz-cli`. Version must start alphanumeric and contain only letters, numbers, `.`, `_`, `+`, or `-`. |
| `draft_verified_doc` | `docLinks`, `references` when sources are supplied | Runs a read-only Codex draft plan. References may only be credential-free HTTPS URLs or existing canonical paths under the sibling bridge's `repos/` directory. |
| `verify_doc_code` | `docLinks` | Read-only code verification report. |
| `patch_doc_code_examples` | `docLinks` | Patch plan with `--apply false`. |

`environment`, `branch`, `targetDoc`, and `notes` may be returned by the router schema, but they do not make a bridge operation live. Do not supply `sdkDir` or `sdkName`; the bridge selects allowlisted repositories.

## Current Boundary

Bridge operations run from sibling `../feishu-markdown-bridge`. Current behavior performs no live Feishu patch, Bitable write, git push, or Jenkins trigger. Do not claim that a plan updates Feishu automatically.

Decompose mixed requests across separate messages/runs. Select only the earliest safe prerequisite intent for the current message. Do not queue, return, or imply that later intents will execute automatically. After the first report and any required approval, the user must send the next explicit bridge-intent request. `publish_docs` is a final, separate explicit request after all content work is approved.

## Examples

- "Verify code in `https://zilliverse.feishu.cn/wiki/abc`" -> `verify_doc_code` with that URL in `docLinks`.
- "Dry-run Python SDK docs for 2.6.1" -> `sync_sdk_docs`, `language: "python"`, `sdkVersion: "2.6.1"`.
- "Draft from `https://example.com/spec` into this Feishu doc" -> `draft_verified_doc` with `docLinks` and `references`.
- Mixed "sync Python 2.6.1, patch examples, then publish" -> select only `sync_sdk_docs`. After its report, the user explicitly requests `patch_doc_code_examples`; after that report and approval, the user separately requests `publish_docs`.

## Common Mistakes

- Routing `rest` SDK sync; it is in the router schema but not the bridge allowlist.
- Using HTTP, `/doc/`, local absolute paths, nonexistent `repos/...` paths, or URLs with credentials.
- Combining bridge work and publishing into one decision or promising automatic writes.
