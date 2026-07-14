# Canonical Lark Link Audit Design

## Goal
Give doc maintainers a repeatable way to find every `mention_doc` and Feishu/Lark hyperlink inside Base-listed docs whose target is not also listed as a canonical doc in the current Base, then guide them to replace each broken reference with a valid Base-listed document.

## Context
The `lark-docs` plugin already has most of the raw ingredients:

- `plugins/lark-docs/larkDocScraper.js` can load the current Base records and build a canonical token map.
- `validate_content_links()` already scans canonical source files and extracts both `mention_doc` references and text-run `href_link` references.
- `scripts/generate-lark-link-candidates.js` groups broken target tokens and suggests canonical replacement candidates.
- `--linkShim` can rewrite export-time links, but that only hides the problem during export. It does not fix Feishu content, and it is easy for stale shims to become a second source of truth.

The real source of truth should be: a valid internal Feishu/Lark link or `mention_doc` points to a doc represented by a canonical record in the same manual's current Base.

## Problem
The docs listed in Base are scattered across the Feishu wiki. Authors often link or mention docs that exist somewhere in Feishu but are not listed in the current Base. During export, those references cannot be reliably converted to Docusaurus routes because the target is outside the canonical Base graph.

The current reports are useful but not sufficient:

- The JSON report is target-centric, not file-centric.
- The markdown candidate report is grouped by missing target token, so it does not directly tell an author which source doc/file to edit first.
- It does not distinguish the author action for `mention_doc` versus normal hyperlink edits.
- The shim workflow encourages temporary export rewriting instead of updating source content.

## Design

### 1. Canonical link audit as first-class workflow
Add a durable audit command path that produces file-centric reports from existing source JSON:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --auditCanonicalLinks
pnpm docusaurus fetch-lark-docs --manual guides --pubTarget zilliz.saas --auditCanonicalLinks
```

The command should work after a fresh fetch and also with existing sources when paired with `--skipSourceDown`.

### 2. Validity rule
A reference is valid when all of the following are true:

- the source file is itself canonical for the current Base
- the reference target is a Feishu/Lark `wiki`, `doc`, `docs`, or `docx` URL
- the extracted target token is present in the canonical token map built from the same Base

The canonical token map should include direct Base `Docs` tokens and aliases found in fetched source JSON, such as `node_token`, `origin_node_token`, `obj_token`, and `token`.

Virtual navigation records, `ref` records, and external URLs are not valid canonical doc targets unless they resolve to a canonical target token.

### 3. Reports
The audit should write three report artifacts under `plugins/lark-docs/meta/reports/`:

- `<manual>-canonical-link-audit.json`
- `<manual>-canonical-link-audit.md`
- `<manual>-canonical-link-audit.csv`

The JSON report is for automation. It should include:

- summary counts
- canonical record count
- scanned source count
- skipped non-canonical source count
- total internal Feishu references
- valid reference count
- broken reference count
- broken references grouped by source file
- candidate replacements for each broken occurrence

The markdown report is for human repair. It should be grouped by source file and source title. Each broken occurrence should show:

- source title
- source file path
- source token
- block id
- JSON path to the element
- clickable source document URL
- clickable source block URL when both source token and block id are available
- reference type: `mention_doc` or `href_link`
- current display text
- current target token and URL
- top replacement candidates from the current Base
- exact recommended author action

For each occurrence, the markdown heading should be a link to the source block, for example:

```markdown
### 1. [Old Mention](https://zilliverse.feishu.cn/wiki/<source-token>#<block-id>)
```

If Feishu does not scroll to the exact block for a particular document type, the link still opens the correct source document and the report's block id plus JSON path provide the fallback locator.

The CSV report is for spreadsheet review. It should have one row per broken occurrence with columns:

```text
manual,source_file,source_title,source_token,source_slug,source_doc_url,source_block_url,block_id,json_path,source_type,link_text,target_token,target_url,anchor,candidate_rank,candidate_score,candidate_title,candidate_slug,candidate_doc_token,candidate_doc_link,candidate_record_id,candidate_table_name,recommended_action
```

### 4. Candidate generation
Replacement candidates must only come from canonical records in the current Base.

Candidate scoring should reuse and generalize the existing script logic:

- exact title match
- exact slug match
- label match
- substring match
- word-overlap score
- edit-distance score

The search query set should be occurrence-aware:

- linked or mentioned text
- broken target source title when fetched source exists
- broken target source slug when fetched source exists
- anchor text or heading text when available

The report must mark confidence as:

- `exact`: exact title, slug, or label match
- `strong`: score >= 80
- `possible`: score >= 60
- `weak`: score >= 45
- `none`: no candidate

### 5. Repair guidance
The markdown report should guide edits differently by reference type:

- For `mention_doc`: open the source doc in Feishu, find the block, delete the invalid mention, and insert a new document mention pointing to the selected canonical candidate.
- For `href_link`: open the source doc in Feishu, edit the hyperlink URL to the selected candidate's `doc_link`, preserving the anchor only when the candidate has a matching heading or the maintainer explicitly accepts the anchor risk.

The tool should not automatically edit Feishu docs in the first implementation. Feishu mutation is higher risk because `mention_doc` objects and plain hyperlinks have different block structures.

### 6. Shim policy
Keep `--linkShim` as an emergency export option, but stop positioning it as the normal repair workflow.

The new audit should be able to emit a draft replacement manifest for review, but that manifest is a repair guide, not an automatically enabled export shim. Export rewriting should require explicit opt-in and approved entries, as it does today.

### 7. CLI behavior
Add these options to `fetch-lark-docs`:

```text
--auditCanonicalLinks
--canonicalLinkReportPrefix <path>
--failOnBrokenCanonicalLinks
```

Behavior:

- `--auditCanonicalLinks` runs the audit after sources exist.
- If no `--pubTarget` is provided, the command audits existing or freshly fetched sources and exits.
- If `--pubTarget` is provided, the command can fetch, audit, and then continue export unless `--failOnBrokenCanonicalLinks` is set and broken references exist.
- `--canonicalLinkReportPrefix` overrides the default `plugins/lark-docs/meta/reports/<manual>-canonical-link-audit` prefix.

### 8. Compatibility
Keep the existing `--validateLinks`, `--skipLinkValidation`, `--failOnBrokenContentLinks`, and `--linkShim` options working during migration.

Internally, `validate_content_links()` can delegate to the new auditor and continue writing the old `<manual>-broken-content-links.json` shape for compatibility.

## Testing
Add focused Node tests around the auditor:

- extracts `mention_doc` and text-run links from nested block JSON
- includes JSON paths and block IDs in occurrences
- treats canonical target tokens and aliases as valid
- reports non-canonical target tokens as broken
- skips source files that are not canonical in the current Base
- generates file-centric markdown sections
- generates CSV rows with candidate data
- limits candidates to canonical Base records only

Run the existing lark-docs regression tests after the focused tests.

## Risks
- A candidate with a high text score can still be semantically wrong.
- Anchors may not exist on the candidate target even when the doc replacement is correct.
- Some Feishu document types may not deep-link perfectly to a block id, even when the source block URL includes the anchor.
- Treating all Base-listed canonical records as valid may include docs that are listed but not currently publishable.

## Risk Mitigation
- Never auto-apply replacements in Feishu for the first implementation.
- Keep confidence labels visible and require human selection.
- Include multiple candidates, not only the top one.
- Include a clickable source block URL, source title, block id, JSON path, and display text so authors can locate the reference.
- Preserve the old shim only as an explicit temporary export option.

## Success Criteria
- Maintainers can run one command per manual and get a file-by-file list of invalid `mention_doc` and Feishu hyperlinks.
- Every suggested replacement candidate is a canonical doc from the current Base.
- The markdown report tells authors exactly whether to replace a mention or edit a hyperlink.
- The audit can fail CI or local export when broken canonical links remain.
- Existing `--linkShim` behavior remains available but is no longer required for normal cleanup.
