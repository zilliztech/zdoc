# ZDoc Localization Feishu Registry Design

**Date:** 2026-07-16

**Status:** Approved in conversation; awaiting written-spec confirmation before implementation

## Objective

Provision an isolated Feishu test environment for `zdoc-localize` under the user-provided `zdoc-localization` Drive folder. The environment must be understandable and filterable by people while remaining deterministic and recoverable for the CLI.

The test environment contains:

- one Feishu Base named `ZDoc Localization Registry`;
- one Drive folder named `state` for immutable machine-managed snapshot bundles;
- one English pilot document named `pilot-en`;
- one Chinese pilot document named `pilot-zh`.

All provisioning and live tests are restricted to the supplied empty Drive folder.

## Chosen Approach

Use a mixed typed Base schema:

- controlled enumerations use single-select Label fields;
- timestamps use date-time fields;
- document locations use URL fields;
- revisions use number fields;
- stable identifiers, tokens, and hashes use single-line text;
- notes and opaque recovery payloads use multiline text;
- human ownership uses a person field where available.

This gives editors useful filters and views without converting Base into the sole recovery store. Complete machine state remains available in `payload_json` and immutable Drive snapshots.

### Alternatives considered

1. **All-text schema.** It is closest to the current adapter, but makes operational filtering and reviewing error-prone.
2. **Mixed typed schema.** Chosen because it balances human usability with deterministic serialization.
3. **Fully relational schema.** Linked tables for snapshots, errors, receipts, and approvals would be more expressive, but add unnecessary first-version complexity and stronger coupling to Base record IDs.

## Drive Layout

```text
zdoc-localization/
├── ZDoc Localization Registry  (Base)
├── state/                       (immutable JSON snapshot bundles)
├── pilot-en                     (English Feishu document)
└── pilot-zh                     (Chinese Feishu document)
```

The root folder is a test boundary. The CLI writes snapshot bundles only to `state`. Pilot document writes are allowed only after preview generation and exact approval-token validation.

## Base Schema

### `document_pairs`

| Field | Type | Required | Values or purpose |
|---|---|---:|---|
| `pair_id` | Single-line text, primary | Yes | Stable unique pair ID |
| `source_locale` | Single select | Yes | `en` |
| `target_locale` | Single select | Yes | `zh-CN` |
| `mode` | Single select | Yes | `mirror`, `selective`, `independent`, `excluded` |
| `status` | Single select | Yes | `active`, `needs_bootstrap`, `blocked`, `disabled` |
| `source_doc_url` | URL | Yes | English Feishu document URL |
| `source_doc_token` | Single-line text | No | Resolved English document token |
| `target_doc_url` | URL | No | Chinese Feishu document URL |
| `target_doc_token` | Single-line text | No | Resolved Chinese document token |
| `target_parent_url` | URL | No | Approved parent for Chinese creation |
| `target_parent_token` | Single-line text | No | Resolved parent token |
| `product_scope` | Single-line text | No | Product identifier |
| `version_scope` | Single-line text | No | Version identifier |
| `environment_scope` | Single-line text | No | Environment identifier |

Scope fields remain text because their vocabularies are expected to grow independently of CLI releases. They can still be filtered without forcing Base option provisioning for every new product or version.

### `glossary`

| Field | Type | Required | Values or purpose |
|---|---|---:|---|
| `source_term` | Single-line text, primary | Yes | Human-readable English term |
| `term_id` | Single-line text | Yes | Stable unique term ID |
| `target_term` | Single-line text | No | Approved Chinese translation; empty for keep-as-is |
| `disposition` | Single select | Yes | `translate`, `keep_as_is`, `deprecated` |
| `scope_type` | Single select | Yes | `global`, `product`, `environment`, `version`, `document` |
| `scope_value` | Single-line text | No | Identifier for the selected scope |
| `status` | Single select | Yes | `candidate`, `approved`, `deprecated` |
| `prohibited_variants` | Multiline text | No | One prohibited translation per line |
| `notes` | Multiline text | No | Human guidance and examples |
| `approved_by` | Person | No | Human reviewer |
| `updated_at` | Date-time | No | Last glossary update |

The adapter must accept both the new newline-delimited `prohibited_variants` format and the legacy JSON-array representation during migration. It writes the newline-delimited format after provisioning.

### `localization_runs`

| Field | Type | Required | Values or purpose |
|---|---|---:|---|
| `run_id` | Single-line text, primary | Yes | Stable run ID |
| `record_type` | Single select | Yes | `run`, `receipt` |
| `pair_id` | Single-line text | Yes | Stable pair ID |
| `state` | Single select | Yes | See workflow states below |
| `created_at` | Date-time | No | Run creation time |
| `updated_at` | Date-time | Yes | Last state change |
| `completed_at` | Date-time | No | Verified completion time |
| `source_from_revision` | Number | No | Previous synchronized English revision |
| `source_to_revision` | Number | No | English revision used by the plan |
| `target_plan_revision` | Number | No | Chinese revision bound to the plan |
| `target_verified_revision` | Number | No | Chinese revision verified after apply |
| `source_hash` | Single-line text | No | Canonical English semantic hash |
| `target_hash` | Single-line text | No | Canonical Chinese semantic hash |
| `source_snapshot_token` | Single-line text | No | Drive file token for the baseline bundle |
| `error_type` | Single-line text | No | Stable error subtype for diagnosis |
| `payload_json` | Multiline text | Yes | Complete compact run or receipt payload |

Run-state Label options are:

- `scanning`
- `classification_required`
- `translation_required`
- `review_required`
- `stale`
- `applying`
- `verifying`
- `completed`
- `blocked`
- `partial`
- `recovering`

`error_type` remains text because error subtypes can expand without a Base schema migration.

## Default Views

### Document pairs

- **Active:** `status = active`
- **Needs Bootstrap:** `status = needs_bootstrap`
- **Blocked:** `status = blocked`

### Glossary

- **Candidates:** `status = candidate`
- **Approved:** `status = approved`
- **Deprecated:** `status = deprecated`

### Localization runs

- **Needs Review:** `state` is one of `classification_required`, `translation_required`, `review_required`
- **Blocked or Partial:** `state` is one of `blocked`, `partial`, `stale`
- **Completed:** `state = completed`

If the available Base API cannot create filtered views reliably, provisioning creates the tables and fields first and reports view creation as a non-blocking follow-up. Missing fields or incompatible field types are blocking.

## Adapter Changes

The Feishu registry adapter must match the typed schema instead of relying on implicit text coercion.

1. Serialize and parse URL fields using the representation required by the current `lark-cli` Base API.
2. Serialize ISO timestamps to Base date-time values and parse them back to ISO strings.
3. Treat single-select values as domain strings while tolerating the actual API response envelope.
4. Write key run and receipt attributes to typed columns in addition to `payload_json`.
5. Read `prohibited_variants` from newline-delimited text or legacy JSON arrays.
6. Preserve unknown human-managed glossary columns when updating a record.
7. Block provisioning when an existing field has the correct name but an incompatible type.

`payload_json` remains authoritative for complete run recovery. Typed columns are operational projections for filtering and inspection.

## Provisioning and Test Flow

1. Verify the supplied root folder remains accessible.
2. Obtain only the Drive and Base write scopes required for provisioning and test writes.
3. Create the Base and the three tables with the approved schema.
4. Create the `state` folder and the two pilot documents.
5. Configure `zdoc-localize` with the resolved Base token, table IDs, and state-folder token.
6. Run `doctor` in Feishu mode.
7. Register the pilot document pair in `mirror` mode.
8. Bootstrap and explicitly accept the initial English/Chinese correspondence baseline.
9. Make a controlled English-only change in `pilot-en`.
10. Generate a localization plan, translation request, Chinese review, and deterministic apply preview.
11. Apply the reviewed block-level Chinese update with the exact approval token.
12. Re-fetch and verify the Chinese document, Base records, and Drive snapshot bundle.
13. Produce a live validation report with created resource URLs, tested behavior, warnings, and any unsupported content.

## Pilot Content

The pilot pair uses only content supported for writes in version 0.1:

- title and headings;
- paragraphs with bold text and links;
- ordered and unordered lists;
- inline code and a fenced code block;
- repeated sibling paragraphs to exercise stable alignment.

The initial live test does not include complex tables, images, Whiteboards, nested rich markup, underline, italics, strike-through, or opaque embedded resources. Those remain report-only or blocking according to the existing safety model.

## Failure and Safety Rules

- No resource outside the supplied root folder may be created or modified.
- Existing Chinese documents are never whole-document overwritten.
- Any remote revision change after planning invalidates the plan.
- A write is successful only after readback verification and receipt persistence.
- If a partial write occurs, the run retains its evidence and enters recovery inspection.
- Base provisioning is idempotent by resource name and stored token; retries must not create duplicate tables or documents.
- Missing permissions, incompatible Base fields, or uncertain document correspondence block the workflow rather than triggering guessed writes.

## Acceptance Criteria

The live pilot is successful when:

- the Base, tables, typed fields, views where supported, state folder, and pilot documents exist in the test root;
- `doctor` reports usable Feishu registry, snapshot storage, document access, and local SQLite;
- the pair can be bootstrapped without modifying either document;
- an English-only change produces the expected Chinese translation review;
- preview approval leads to exact block-level writes in `pilot-zh`;
- readback verification succeeds;
- the Base shows filterable Label and date-time values;
- the Drive state folder contains a retrievable, hash-verified snapshot bundle;
- a final validation report distinguishes verified live behavior from untested or unsupported behavior.
