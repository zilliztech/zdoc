# Milvus Data-Plane Minor-Track Bootstrap Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap lifecycle metadata and latest-per-minor snapshots for the existing Milvus data-plane corpus, then enable required validation and publish localized `2.6.x`/`3.0.x` artifacts without changing zdoc's latest-only page publication.

**Architecture:** This is a data migration that starts only after the `api-reference-sync` and zdoc tooling plans are implemented. It first collects approval-grade Git/source evidence and emits one candidate unit per `(versionTrack, endpoint, method)`. After exact grouping approval, it creates a deterministic spec-write batch; only a separate exact write approval permits edits to canonical fragments and track snapshots. Required lifecycle enforcement and production artifact publication are enabled only after the full migration validates.

**Tech Stack:** Refreshed `api-reference-sync:rest-review` CLI, zdoc integrated-spec CLI, Node.js JSON patch tooling using repository modules, Git source evidence, SHA256 manifests, focused REST tests.

**Approved design:** `.claude/superpowers/specs/2026-08-14-milvus-rest-track-publication-design.md`

**Hard prerequisites:**

- The skill branch from `2026-08-14-api-reference-sync-rest-track-plan.md` is implemented and verified.
- The zdoc tooling branch from `2026-08-14-zdoc-integrated-openapi-plan.md` is implemented and verified.
- No production fragment write begins from this plan until both approval gates below are satisfied with exact current digests.

---

## Migration Gates

### Gate 1: Grouping review

Bound artifact: complete candidate manifest with one unit per `(versionTrack, endpoint, method)`.

Required command:

```text
The literal prefix `APPROVE_GROUPING sha256:` followed immediately by the current 64-character manifest digest
```

This authorizes creation of the reviewed write plan only. It does not authorize edits.

### Gate 2: Spec write approval

Bound artifact: deterministic execution batch listing every exact fragment, snapshot, manifest, and generated metadata action.

Required command:

```text
The literal prefix `APPROVE_WRITES sha256:` followed immediately by the current 64-character execution-batch digest
```

This authorizes only the exact files and semantic patches in that batch. Any source, proposal, snapshot, or patch change invalidates the digest.

## Task 1: Freeze the real release scope for both tracks

**Files:**
- Create: `tmp/rest-bootstrap/source-scope-2.6.x.json`
- Create: `tmp/rest-bootstrap/source-scope-3.0.x.json`
- Create: `tmp/rest-bootstrap/source-evidence.md`
- Do not commit: raw source checkout or temporary scan output.

- [ ] **Step 1: Resolve exact latest tags**

In the read-only Milvus source checkout at `/Users/anthony/Documents/projects/feishu-markdown-bridge/repos/milvus`, fetch tags and identify the latest patch tag reachable for each managed track. Record the tag, commit SHA, commit date, and selection command. Do not rely on the values from the earlier discussion without live verification. All zdoc and skill code changes still remain in their approved isolated worktrees.

Required evidence commands include:

```bash
git fetch --tags --prune
git tag --list 'v2.6.*' --sort=-version:refname
git tag --list 'v3.0.*' --sort=-version:refname
TRACK_TAG=$(jq -r .selectedTag tmp/rest-bootstrap/source-scope-2.6.x.json)
git rev-parse "${TRACK_TAG}^{commit}"
```

- [ ] **Step 2: Inspect Git log and diff for both scopes**

For each track, collect:

- the log from the previous accepted/baseline tag to the selected latest patch;
- the diff for `internal/distributed/proxy/httpserver/` across that range;
- route-registration changes;
- request/response struct changes;
- deprecation evidence.

The initial 2.6 bootstrap uses the earliest managed 2.6 evidence available plus the latest 2.6 state. The 3.0 scope compares latest 2.6 state to latest 3.0 state.

- [ ] **Step 3: Write deterministic scope artifacts**

Each JSON contains these concrete fields populated from the selected live tag and Git evidence:

```json
{
  "schemaVersion": 1,
  "repository": "milvus-io/milvus",
  "versionTrack": "2.6.x",
  "selectedTag": "the selected full Milvus tag",
  "selectedCommit": "the selected tag's full commit SHA",
  "baselineTag": "the verified baseline tag or the literal managed-floor marker",
  "logCommand": "the exact command executed for the recorded log",
  "diffCommand": "the exact command executed for the recorded diff",
  "changedFiles": [],
  "evidenceDigest": "the digestSemantic value calculated from the other fields"
}
```

Sort file paths and exclude collection timestamps from the semantic digest.

- [ ] **Step 4: Verify scope stability**

Rerun the commands, compare selected tags/SHAs, and regenerate the scope. Stop if remote tags moved or evidence digests change.

## Task 2: Build latest-per-minor snapshot candidates

**Files:**
- Generate: `tmp/rest-bootstrap/snapshots/2.6.x/openapi.json`
- Generate: `tmp/rest-bootstrap/snapshots/2.6.x/manifest.json`
- Generate: `tmp/rest-bootstrap/snapshots/3.0.x/openapi.json`
- Generate: `tmp/rest-bootstrap/snapshots/3.0.x/manifest.json`
- Create: `packages/docs-tooling/src/reference/rest/scripts/build-track-snapshot.js`
- Test: `packages/docs-tooling/src/reference/rest/buildTrackSnapshot.test.js`

- [ ] **Step 1: Write a failing snapshot-source test**

Assert the builder accepts canonical fragments plus reviewed upstream changes and emits only Milvus-target data-plane operations. It must exclude Zilliz-only control-plane operations by `x-include-target` and plane classification rather than fragment filename.

- [ ] **Step 2: Generate the 2.6 candidate**

Construct the complete latest 2.6 contract from current reviewed public fragments plus source-backed corrections needed to match the selected 2.6 tag. Do not preserve older 2.6 patch shapes.

- [ ] **Step 3: Generate the 3.0 candidate**

Construct the complete latest 3.0 contract from current canonical fragments plus source-backed 3.0 additions/changes. Include all reviewed new operations and field changes.

- [ ] **Step 4: Validate candidates**

For each candidate:

- parse as OpenAPI 3.x;
- assert every retained operation targets Milvus data-plane;
- assert no dangling local refs;
- assert operation count equals the scanner inventory;
- record selected upstream tag/commit and content SHA256;
- prove a second build is byte-identical.

Do not copy candidates into `meta/releases/` yet.

## Task 3: Produce the complete grouping manifest

**Files:**
- Generate: `tmp/rest-bootstrap/review-manifest.json`
- Generate: `tmp/rest-bootstrap/review-summary.md`

- [ ] **Step 1: Run the refreshed skill CLI**

Run the CLI from the isolated `api-reference-sync` worktree. Keep the candidate specs and generated review artifacts in the isolated zdoc worktree so the two repositories exchange files without importing implementation code:

```bash
cd /private/tmp/feishu-markdown-bridge-api-reference-sync-rest
npm run api-reference-sync:rest-review -- \
  --track-spec 2.6.x=/Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/snapshots/2.6.x/openapi.json \
  --track-spec 3.0.x=/Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/snapshots/3.0.x/openapi.json \
  --source-revision "2.6.x=milvus-io/milvus@$(jq -r .selectedTag /Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/source-scope-2.6.x.json)" \
  --source-revision "3.0.x=milvus-io/milvus@$(jq -r .selectedTag /Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/source-scope-3.0.x.json)" \
  --managed-floor 2.6.x \
  --output /Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/review-manifest.json \
  --json
```

- [ ] **Step 2: Enrich units with zdoc placement evidence**

For each unit, record:

- current fragment path;
- operation JSON pointer;
- current target/plane classification;
- proposed lifecycle values;
- request/response/parameter/schema-property changes;
- shared component owners and digest;
- source file and Git evidence;
- action and blockers.

No review unit may contain more than one endpoint/method.

- [ ] **Step 3: Validate complete coverage**

Require:

```text
manifest unit set == union of all 2.6.x and 3.0.x operation identities
duplicate unit count == 0
unknown shared-component owner count == 0
unresolved source evidence count == 0
```

If any count is nonzero, stop before approval.

- [ ] **Step 4: Calculate the proposal digest**

```bash
node /private/tmp/feishu-markdown-bridge-api-reference-sync-rest/.claude/skills/api-reference-sync/scripts/review-artifact-digest.js \
  /Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi/tmp/rest-bootstrap/review-manifest.json
```

Record the full digest in `review-summary.md`. The summary generator reads it directly from `review-manifest.json`; it does not accept a caller-supplied digest.

- [ ] **Step 5: Stop at GROUPING_REVIEW**

Report phase, status, complete artifact paths, track/unit/action counts, blockers, and the exact full command:

```text
Construct the command from the literal prefix `APPROVE_GROUPING sha256:` and the full current `manifestDigest` read from `tmp/rest-bootstrap/review-manifest.json`; print the resulting command once with no placeholder.
```

Do not write canonical fragments or release snapshots in the same turn.

## Task 4: Build the deterministic spec execution batch after grouping approval

**Files:**
- Create: `packages/docs-tooling/src/reference/rest/scripts/plan-lifecycle-bootstrap.js`
- Create: `packages/docs-tooling/src/reference/rest/scripts/apply-lifecycle-bootstrap.js`
- Test: `packages/docs-tooling/src/reference/rest/lifecycleBootstrap.test.js`
- Generate: `tmp/rest-bootstrap/execution-batch.json`
- Generate: `tmp/rest-bootstrap/rollback-capsule.json`

- [ ] **Step 1: Verify the exact grouping approval**

Require the submitted digest to equal the current manifest digest. Recalculate the manifest digest immediately before planning. If it changed, return to Task 3.

- [ ] **Step 2: Write failing planner tests**

Given a mini fragment corpus and approved manifest, assert the planner emits:

- one semantic patch per affected operation/component;
- exact before-file SHA256 preconditions;
- exact output-file SHA256 postconditions;
- creation actions for `meta/releases/milvus/2.6.x/openapi.json`, `meta/releases/milvus/2.6.x/manifest.json`, `meta/releases/milvus/3.0.x/openapi.json`, and `meta/releases/milvus/3.0.x/manifest.json`;
- no changes to generated MDX/content/sidebar files;
- no Cloud control-plane edits;
- a deterministic rollback capsule containing complete original bytes for every modified existing file and absence assertions for new files.

- [ ] **Step 3: Implement read-only planning**

The planner consumes only the approved manifest and current files. It must fail on:

- manifest digest mismatch;
- fragment precondition drift;
- operation pointer mismatch;
- shared component digest mismatch;
- proposed edit outside managed Milvus data-plane scope;
- an action not present in the approved manifest.

- [ ] **Step 4: Generate the full execution batch**

The batch includes:

```json
{
  "schemaVersion": 1,
  "proposalDigest": "the exact approved review-manifest digest",
  "actions": [],
  "targets": [],
  "preconditions": [],
  "postconditions": [],
  "rollbackCapsuleDigest": "the calculated rollback-capsule digest",
  "batchDigest": "the calculated digest of this batch without this field"
}
```

The digest excludes only its own `batchDigest` field.

- [ ] **Step 5: Dry-run the executor**

Apply the batch to a temporary copy of the exact fragment tree. Parse every JSON file, run lifecycle validation, build both track artifacts and latest zdoc artifacts, and compare expected postcondition digests.

- [ ] **Step 6: Stop at WRITE_APPROVAL**

Report the exact files/actions and command:

```text
Construct the command from the literal prefix `APPROVE_WRITES sha256:` and the full current `batchDigest` read from `tmp/rest-bootstrap/execution-batch.json`; print the resulting command once with no placeholder.
```

Do not execute on the worktree without this separate approval.

## Task 5: Apply the approved bootstrap batch

**Files:**
- Modify: approved Milvus data-plane files under `packages/docs-tooling/src/reference/rest/meta/openapi/`
- Create/Modify: `packages/docs-tooling/src/reference/rest/meta/releases/milvus/2.6.x/openapi.json`
- Create/Modify: `packages/docs-tooling/src/reference/rest/meta/releases/milvus/2.6.x/manifest.json`
- Create/Modify: `packages/docs-tooling/src/reference/rest/meta/releases/milvus/3.0.x/openapi.json`
- Create/Modify: `packages/docs-tooling/src/reference/rest/meta/releases/milvus/3.0.x/manifest.json`
- Generate: `tmp/rest-bootstrap/execution-journal.json`

- [ ] **Step 1: Revalidate approval and preconditions**

Recalculate batch digest, current file hashes, approved manifest digest, and snapshot source digests. Stop on any mismatch.

- [ ] **Step 2: Persist rollback data before each mutation**

Write a journal prepared entry with the original file hash/content or the new-file absence assertion, then fsync/close it before applying that action.

- [ ] **Step 3: Apply only planned semantic patches**

Rules:

- keep existing formatting/property order where practical;
- add lifecycle attributes only to approved operation/contract-element objects;
- preserve `x-i18n`, examples, and unrelated authoring extensions;
- never edit generated MDX;
- create track snapshots from the approved candidate bytes.

- [ ] **Step 4: Verify each action and finish the journal**

After every write, refetch file bytes, parse JSON, compare expected SHA256, and append an observed journal entry. End with a durable completion sentinel only after all actions verify.

- [ ] **Step 5: Run immediate validation**

```bash
node packages/docs-tooling/src/reference/rest/scripts/validate-lifecycle.js \
  --mode audit \
  --specifications packages/docs-tooling/src/reference/rest/meta/openapi
git diff --check
```

Expected: no missing/invalid lifecycle entries in managed Milvus scope and no out-of-scope files changed.

## Task 6: Validate all latest and track outputs

**Files:**
- Generate: `/private/tmp/rest-bootstrap-artifacts/`

- [ ] **Step 1: Generate Milvus track artifacts**

Generate:

```text
openapi-milvus-2.6.x-en-US.json
openapi-milvus-2.6.x-zh-CN.json
openapi-milvus-3.0.x-en-US.json
openapi-milvus-3.0.x-zh-CN.json
```

using `publication-policy track` and the committed snapshots.

- [ ] **Step 2: Generate latest zdoc artifacts**

Generate the latest zdoc/Zilliz integrated specs for both `api-version v1` and `api-version v2`, in both `en-US` and `zh-CN`, from canonical fragments using `publication-policy latest`.

- [ ] **Step 3: Validate artifact contracts**

For every output:

- parse as complete OpenAPI;
- assert no dangling refs;
- compare endpoint/method inventory to its source policy;
- verify language localization samples;
- verify public lifecycle extensions are stripped;
- verify standard deprecated flags are retained;
- verify file SHA256 equals its manifest;
- rerun and compare byte identity.

- [ ] **Step 4: Regenerate latest-only REST pages**

```bash
node packages/docs-tooling/src/reference/rest/index.js fetch-apifox-docs \
  --specifications packages/docs-tooling/src/reference/rest/meta/openapi \
  --output_path /private/tmp/zdoc-api-ref-bootstrap \
  --lang en-US \
  --target zilliz
```

Assert no versioned page tree or sidebar is introduced.

- [ ] **Step 5: Run proportional repository checks**

```bash
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
pnpm typecheck
git diff --check
```

Run Chinese generation/build checks proportional to touched localization behavior and first verify `apps/docs/node_modules/jiti` exists in the exact worktree before a Chinese build.

## Task 7: Enable required lifecycle enforcement

**Files:**
- Modify: lifecycle validation configuration chosen by the tooling plan.
- Modify/Create: relevant validation and workflow-policy tests.

- [ ] **Step 1: Add failing enforcement tests**

Copy a managed Milvus operation fixture, remove one required lifecycle attribute, and assert required mode fails with the exact JSON pointer. Copy a Cloud control-plane operation without lifecycle metadata and assert it remains out of scope.

- [ ] **Step 2: Switch managed Milvus scope from audit to required**

Do this only after Task 6 passes. Latest page generation may still accept out-of-scope legacy Cloud operations, while every managed Milvus operation and contract element becomes mandatory.

- [ ] **Step 3: Add CI command**

Add or wire a site-independent validation command that runs before integrated spec publication. It must not generate or modify content.

- [ ] **Step 4: Run enforcement and regression tests**

Expected: missing managed metadata fails; the complete migrated corpus passes; latest-only page publication is unchanged.

## Task 8: Publish artifacts and complete the migration

**Files:**
- Generate: upload result manifest and final migration evidence under `tmp/rest-bootstrap/`.

- [ ] **Step 1: Upload prepared artifact bytes**

Use the integrated-spec publisher with S3 enabled. Upload exactly the locally validated bytes; do not rebuild during upload.

- [ ] **Step 2: Verify remote objects**

For each object, verify filename, content length, content hash or downloaded SHA256, content type, and public URL. Confirm a repeated upload skips unchanged bytes.

- [ ] **Step 3: Verify latest zdoc behavior**

Confirm zdoc REST pages and sidebars still represent only the latest canonical contract. Confirm the latest integrated zdoc spec links and Milvus versioned links are distinct and correctly labeled.

- [ ] **Step 4: Produce final evidence**

Report:

- source tags/SHAs for both tracks;
- grouping manifest path/digest and approval;
- execution batch path/digest and approval;
- execution journal path/digest;
- modified fragment/snapshot inventory;
- validation/test results;
- local and S3 artifact URLs/digests;
- confirmation that patch history was not retained;
- confirmation that zdoc pages remain latest-only.

- [ ] **Step 5: Commit migration and enforcement separately**

Use at least two commits:

```bash
git commit -m "docs(rest): bootstrap Milvus lifecycle tracks"
git commit -m "ci(rest): require Milvus lifecycle metadata"
```

This keeps the data migration reviewable apart from the enforcement switch.
