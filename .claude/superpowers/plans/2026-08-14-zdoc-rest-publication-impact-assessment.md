# Zdoc REST/OpenAPI Publication Change Impact Assessment

**Date:** 2026-08-14  
**Scope:** Manifest-backed data-plane/control-plane REST inputs, generated page routes, integrated artifacts, and S3 publication keys.  
**Conclusion:** Proceed with the zdoc infrastructure change only after preserving the existing `fetch-apifox-docs` behavior. No page redirect program or legacy-key consumer migration is currently justified by repository evidence.

## 1. Executive Assessment

The collection manifest is an input integrity and provenance contract between `feishu-markdown-bridge` and zdoc. By itself it does not change rendered page URLs, page bodies, sidebars, or production S3 objects. Those changes occur only when a zdoc generation or upload command explicitly consumes the collection.

The proposed control-plane page namespace has been rejected. Manifest-backed page generation must preserve the established public route:

```text
/restful/<slug>
```

It must not generate `/restful/control-plane/<serviceId>/<slug>`. Therefore the expected redirect requirement for this project is zero. A global final-route registry must block data-plane/control-plane slug collisions before files are written.

Repository and workflow inspection found no active consumer of the legacy integrated OpenAPI object names or S3 keys. The production REST workflow invokes page generation without `--upload-s3`; the flag defaults to false. Exact legacy filenames occur in historical design documents and uploader tests, not in runtime readers. On this evidence, a consumer migration or dual-write period is not required for the new, previously unlaunched `generate-integrated-spec` workflow.

However, the existing `fetch-apifox-docs --upload-s3` option is a separate legacy interface. Its behavior must remain unchanged until it is explicitly retired, even if no automated caller is currently found. The new collection publisher must not silently repurpose that command to write plane-aware keys.

## 2. Evidence Reviewed

### 2.1 Public page routes

Current generated control-plane content contains:

| Locale | Operation pages | Group pages | Total public slugs |
|---|---:|---:|---:|
| `en` | 100 | 23 | 123 |
| `zh-CN` | 96 | 22 | 118 |

All inspected pages use `/restful/<slug>`. The zdoc worktree now has a regression test requiring explicit `apiSurface=control-plane` generation to retain that route shape. Existing pages therefore require no 301 redirects.

### 2.2 Repository consumers of legacy S3 keys

Searches covered the current worktree, `origin/master`, visible remote refs, Git history, workflow files, scripts, configuration, and runtime source. They looked for:

```text
openapi-zilliz-v1-en-US.json
openapi-zilliz-v1-zh-CN.json
openapi-zilliz-v2-en-US.json
openapi-zilliz-v2-zh-CN.json
rest/openapi-zilliz...
```

Findings:

- exact filenames occur in prior design/implementation plans and `s3Uploader` tests;
- no runtime component reads those object names;
- no repository CI or publication workflow passes `--upload-s3` to `fetch-apifox-docs`;
- the normal REST source publication unit invokes REST page generation, validation, and publication without integrated-spec S3 upload;
- AWS credentials are available to broader content workflows for unrelated media/image operations, which is not evidence that REST OpenAPI objects are consumed.

### 2.3 External visibility limitation

GitHub organization code search could not be completed because the authenticated API returned HTTP 404 for code-search requests. This assessment therefore cannot prove that no inaccessible private repository or external customer references a legacy URL. S3 access logs, CDN logs, bucket inventory, and external bookmarks were not available in the workspace.

Because the old integrated publication path is not wired into the automated workflow and the new command has not launched, this residual uncertainty does not justify a mandatory dual-write migration. It does justify preserving the explicitly invoked legacy upload behavior and avoiding deletion of any existing objects as part of this change.

## 3. Impact Matrix

| Change | Current production impact | Risk | Required safeguard |
|---|---|---|---|
| Collection manifest loader | None until explicitly invoked | Low | Strict schema, SHA, digest, plane, service, and conflict validation |
| Explicit `data-plane`/`control-plane` metadata | No public route change | Low | Keep metadata out of public URL construction |
| Control-plane bilingual artifact preparation | None without upload | Low | Local dry-run first; one bilingual release manifest |
| Existing page generation | Must remain byte/route compatible where inputs are unchanged | Medium | Page-count, slug, endpoint, method, and sidebar regression tests |
| New plane-aware S3 keys | New, unconsumed namespace | Low before launch | Use only from `generate-integrated-spec`; immutable object plus guarded latest pointer |
| Existing `fetch-apifox-docs --upload-s3` | Potential manual compatibility surface | Medium | Preserve its current filename/key behavior; do not route through the new publisher |
| Removal of existing S3 objects | Not authorized | High | Do not delete or overwrite legacy objects in this project |

## 4. Recommended Zdoc Change Boundary

### Include in the next zdoc PR

- manifest-first fragment collection loading and provenance;
- homogeneous plane/source/revision/service validation;
- deterministic local integrated artifacts;
- explicit publication matrix, including latest-only Zilliz control plane;
- bilingual control-plane artifact preparation;
- immutable plane-aware keys and stale-latest protection for the new command;
- existing `/restful/<slug>` routes and existing sidebar document IDs;
- global route-collision failure before page writes;
- dry-run and local cross-repository handoff tests.

### Exclude or correct before the PR

- any `/restful/control-plane/<serviceId>/...` public route;
- changing `fetch-apifox-docs --upload-s3` to the new filenames or key layout;
- removing compatibility objects or aliases that may already exist in S3;
- production S3 upload, latest-pointer promotion, canary, or rollback execution;
- publishing services with `MAPPING_REQUIRED`, `CONTROLLER_MISSING`, or `OWNERSHIP_AMBIGUOUS`.

## 5. Release Decision

There is no evidence-backed need for two automatically running publication flows or a consumer migration campaign. The correct separation is command ownership:

1. `fetch-apifox-docs` remains the existing page-generation command and retains its optional legacy upload behavior unchanged.
2. `generate-integrated-spec` is the new manifest-backed command and uses plane-aware artifact keys from its first production launch.
3. Neither command runs an S3 upload unless explicitly requested.
4. No old key is deleted as part of introducing the new command.

Before the first production upload from `generate-integrated-spec`, perform one read-only bucket/access-log check if operational access is available. Absence of that access is not a blocker for merging local infrastructure, but it remains a blocker for deleting legacy objects.

## 6. Acceptance Criteria

- Existing English and Chinese REST slugs are unchanged; expected 301 count is zero.
- A synthetic explicit control-plane page still renders `/restful/<slug>`.
- Cross-plane duplicate final slugs fail before any file write.
- Existing page generation without `--upload-s3` has unchanged publication behavior.
- Existing `fetch-apifox-docs --upload-s3` retains its legacy key contract.
- New manifest-backed publication writes only to the new plane-aware namespace.
- No production upload or legacy-object deletion occurs in the infrastructure PR.
