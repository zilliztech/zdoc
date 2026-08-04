# Guides Build Convergence Minimal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the current Guides worktree with strict Base metadata validation, correct section/ref navigation, symmetric locale validation, and a single current cache format without expanding into Feishu body-link cleanup or source write-back.

**Architecture:** Keep the existing shared fetch/render/assemble workflows and extend their locale-parameterized contracts. Reuse the current Base snapshot and writer instead of introducing a second metadata model. Keep `canonicalLinkAuditor` report generation as an existing diagnostic hook only; richer link classification, baseline cleanup, and Feishu mutation are explicitly deferred.

**Tech Stack:** Node.js 22, CommonJS Guides tooling, Docusaurus sidebars, GitHub Actions reusable workflows, `node:test`.

---

## Scope boundaries

Included:

- Preserve and finish the uncommitted Chinese bootstrap, source-contract, coverage, and sidebar fixes already present in this worktree.
- Strict and actionable Base preflight for `canonical`, `section`, `ref`, and `link`.
- `section + Docs` index pages and strict `ref -> unique canonical` anchor links.
- Equivalent en/zh-CN assemble validation.
- Correct v5 cache selection; retain v4 only as a temporary read-only fallback.
- Enable the already-implemented canonical-link audit report after source fetch without changing its classification or writing to Feishu.

Deferred to a separate project:

- Cleaning and rewriting links inside Feishu page bodies.
- Historical unresolved-link baselines and replacement approval workflows.
- Any automatic or approved Feishu write-back.
- Broader redirect/SEO migration work.

### Task 1: Lock the current worktree baseline

**Files:**
- Test existing modified files only; no production edits.

- [ ] **Step 1: Run the focused tests that cover current uncommitted fixes**

```bash
node --test \
  packages/docs-tooling/src/lark/guidesBasePreflight.test.js \
  packages/docs-tooling/src/lark/guidesBaseRecordSemantics.test.js \
  packages/docs-tooling/src/lark/larkDocScraper.test.js \
  scripts/docs-workflow/prepare-guides-bootstrap-stage.test.js \
  scripts/validate-guides-source-contract.test.js \
  scripts/validate-guides-coverage.test.js \
  scripts/validate-generated-sidebars.test.js
```

Expected: all tests pass before new behavior is added.

- [ ] **Step 2: Record the existing diff and do not rewrite unrelated fixes**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; the existing modified/new file set remains intact.

### Task 2: Make Base preflight strict and actionable

**Files:**
- Modify: `packages/docs-tooling/src/lark/guidesBasePreflight.js`
- Modify: `packages/docs-tooling/src/lark/guidesBasePreflight.test.js`
- Modify: `packages/docs-tooling/src/lark/guidesBaseRecordSemantics.js`
- Modify: `packages/docs-tooling/src/lark/guidesBaseRecordSemantics.test.js`

- [ ] **Step 1: Add failing tests for the accepted record contracts**

Cover these exact cases:

```text
canonical: requires unique Docs token, Slug, supported Targets, and publish metadata when publishable
section: requires Slug; Docs is optional; a supplied Docs value must be a valid Feishu document
ref: requires Ref Target Doc resolving to exactly one canonical; may include an anchor fragment
link: requires a usable URL
all: reject unknown placement, missing parent, parent cycle, duplicate sibling route, and unsupported target
```

Each error assertion must match site, table/record identity, invalid field, and a `How to fix:` instruction.

- [ ] **Step 2: Run the tests and verify the new cases fail**

```bash
node --test packages/docs-tooling/src/lark/guidesBasePreflight.test.js packages/docs-tooling/src/lark/guidesBaseRecordSemantics.test.js
```

Expected: failures for the newly specified contracts only.

- [ ] **Step 3: Implement the minimal validation in the existing preflight module**

Use one diagnostic formatter with this stable shape:

```text
[Guides Base preflight] <problem>
Site: <en|zh-CN>
Table: <name or id>
Record: <record id>
Title: <title>
Field: <field>
Current value: <value>
How to fix: <single concrete edit instruction>
```

Do not add content-body or remote-anchor validation here; Base preflight must remain metadata-only and run before source fetch.

- [ ] **Step 4: Run the focused tests**

```bash
node --test packages/docs-tooling/src/lark/guidesBasePreflight.test.js packages/docs-tooling/src/lark/guidesBaseRecordSemantics.test.js
```

Expected: all tests pass for both `en` and `zh-CN` fixtures.

### Task 3: Implement section indexes and strict ref anchors

**Files:**
- Modify: `packages/docs-tooling/src/lark/larkDocWriter.js`
- Modify: `packages/docs-tooling/src/lark/larkDocWriter.test.js`
- Modify: `packages/docs-tooling/src/lark/sourceSnapshot.js`
- Modify: `packages/docs-tooling/src/lark/sourceSnapshot.test.js`
- Modify: `scripts/validate-guides-source-contract.js`
- Modify: `scripts/validate-guides-source-contract.test.js`
- Modify: `scripts/validate-guides-coverage.js`
- Modify: `scripts/validate-guides-coverage.test.js`

- [ ] **Step 1: Add failing writer tests**

Assert the exact sidebar semantics:

```js
// section without Docs
{type: 'category', label: 'Section', key: 'category:<path>', items: []}

// section with Docs
{
  type: 'category',
  label: 'Section',
  key: 'category:<path>',
  link: {type: 'doc', id: '<section-index-id>'},
  items: [],
}

// ref to canonical
{type: 'link', label: '<ref label>', href: '<canonical route><optional resolved anchor>', key: 'ref:<path>'}
```

Also assert that a ref is omitted when its canonical target is not publishable for the current target.

- [ ] **Step 2: Run the writer and contract tests and verify failure**

```bash
node --test \
  packages/docs-tooling/src/lark/larkDocWriter.test.js \
  packages/docs-tooling/src/lark/sourceSnapshot.test.js \
  scripts/validate-guides-source-contract.test.js \
  scripts/validate-guides-coverage.test.js
```

Expected: failures show that sections currently forbid landing pages and refs currently behave as doc aliases.

- [ ] **Step 3: Implement the minimal shared route resolution**

Rules:

```text
section without Docs -> category only
section with Docs -> generate one index document and attach it as the category link
ref -> resolve only a unique canonical target
ref without fragment -> link to canonical route
ref with fragment -> link to canonical route plus resolved Docusaurus heading ID
unpublished canonical -> omit ref
published canonical with unresolved fragment -> fail before assemble publication
```

Do not allow `ref -> section`, `ref -> ref`, or `ref -> link`.

- [ ] **Step 4: Update contract and coverage validation to match writer output**

The source contract must require a category link only for `section + Docs`; pure sections must still reject a landing link. Ref validation must compare the final href rather than a duplicated generated document ID.

- [ ] **Step 5: Run the focused tests**

```bash
node --test \
  packages/docs-tooling/src/lark/larkDocWriter.test.js \
  packages/docs-tooling/src/lark/sourceSnapshot.test.js \
  scripts/validate-guides-source-contract.test.js \
  scripts/validate-guides-coverage.test.js
```

Expected: all tests pass.

### Task 4: Make assemble validation locale-symmetric

**Files:**
- Modify: `scripts/validate-generated-sidebars.js`
- Modify: `scripts/validate-generated-sidebars.test.js`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing locale-specific validator tests**

Assert:

```text
--site en scans generated/en and English-only landing/reference checks
--site zh-CN scans generated/zh-CN and does not inspect unrelated English output
both locales reject duplicate sidebar id/key values
```

- [ ] **Step 2: Implement `--site en|zh-CN` in the existing validator**

Keep English landing/reference checks behind `site === 'en'`. Do not create a second Chinese validator.

- [ ] **Step 3: Replace duplicate assemble validation steps with one shared sequence**

For either locale run:

```bash
node scripts/validate-guides-source-contract.js --site "$ZDOC_SITE" --snapshot packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json
node scripts/validate-guides-coverage.js --site "$ZDOC_SITE"
node scripts/validate-generated-sidebars.js --site "$ZDOC_SITE"
node scripts/run-doc-build-stage.js --build "$ZDOC_BUILD_COMMAND" --skipLinkChecks --skipCardReporting
```

- [ ] **Step 4: Run validator and workflow-policy tests**

```bash
node --test scripts/validate-generated-sidebars.test.js scripts/validate-workflow-policy.test.js
```

Expected: both locale paths use the same validation depth and pass policy checks.

### Task 5: Reduce Guides source cache compatibility to v5 plus temporary v4

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify only if required by existing accepted-version lists: `scripts/docs-workflow/guides-cache-save-decision.js`
- Modify only if required by existing accepted-version tests: `scripts/docs-workflow/guides-cache-save-decision.test.js`

- [ ] **Step 1: Replace legacy-chain policy expectations with v5/v4 expectations**

Tests must require:

```text
valid v5 -> cache_version=v5, cache_state=valid
invalid/missing v5 + valid v4 -> cache_version=v4, cache_state=legacy
invalid/missing v5 and v4 -> no source cache
no v1, v2, or v3 restore/check steps remain
only v5 is saved
```

- [ ] **Step 2: Run the policy test and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: failure because the workflow still contains v1-v3 and the selector omits a v5 branch.

- [ ] **Step 3: Simplify the workflow**

Add v5 as the first selector branch, retain v4 restore/promotion as read-only migration input, and delete v1-v3 key generation, restore, validation, cleanup, and selection branches. Preserve the current fallback to full source fetch when neither candidate validates.

- [ ] **Step 4: Run cache and policy tests**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/guides-cache-save-decision.test.js
```

Expected: all tests pass and no test expects v1-v3 recovery.

### Task 6: Enable the existing canonical-link report without expanding link cleanup

**Files:**
- Modify: `packages/docs-tooling/src/lark/cli.js`
- Modify: `packages/docs-tooling/src/lark/cli.integration.test.js`
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add a failing runtime-invocation test**

The Guides source-only invocation must include:

```text
--auditCanonicalLinks
--canonicalLinkReportPrefix packages/docs-tooling/src/lark/meta/reports/guides-<site>-canonical-link-audit
```

- [ ] **Step 2: Pass the site-specific report prefix through the existing runtime**

Run the audit once after source fetch. Do not run it in each table-render job, change scoring/classification, fail on historical broken links, or mutate Feishu.

- [ ] **Step 3: Include the three report files in the source artifact**

Expected files:

```text
guides-en-canonical-link-audit.json/.md/.csv
guides-zh-CN-canonical-link-audit.json/.md/.csv
```

- [ ] **Step 4: Run focused tests**

```bash
node --test packages/docs-tooling/src/lark/cli.integration.test.js packages/docs-tooling/src/lark/canonicalLinkAuditor.test.js scripts/validate-workflow-policy.test.js
```

Expected: reports are always generated after a source fetch, while broken historical links remain report-only.

### Task 7: Refresh real en and zh-CN source baselines by replay

**Files:**
- Candidate: `packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json`
- Promote after validation: `packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json`
- Promote after validation: `packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json`
- Generate locally, do not commit: `$english_replay/guides-source-cache-v5`
- Generate locally, do not commit: `$chinese_replay/guides-source-cache-v5`

#### SHA validation contract

The replay must distinguish three identities:

```text
Git commit SHA-1 (40 hex): tooling commit and dev baseline commit
File/payload SHA-256 (64 hex): source files, manifests, artifacts, decisions, sidebars, snapshots, and v5 payloads
Feishu revision identity: document revision/node metadata recorded in the source snapshot; never treated as a Git SHA
```

- [ ] **SHA Step 1: Replay only a clean, committed tooling revision**

```bash
test -z "$(git status --porcelain)"
tooling_sha=$(git rev-parse 'HEAD^{commit}')
dev_baseline_sha=$(git rev-parse 'origin/dev^{commit}')
printf '%s\n' "$tooling_sha" | grep -Eq '^[0-9a-f]{40}$'
printf '%s\n' "$dev_baseline_sha" | grep -Eq '^[0-9a-f]{40}$'
```

Expected: replay refuses to establish a new baseline from an uncommitted tree. Store both SHAs in each locale replay result.

- [ ] **SHA Step 2: Validate source bytes against snapshot and manifest hashes**

For every snapshot record with `source_file` and `source_hash`, recompute SHA-256 from the exact source bytes and require equality. Run the existing source completeness and media coverage validators; they must also verify that the source manifest and media manifest describe the same snapshot and root token.

- [ ] **SHA Step 3: Bind every table artifact to the exact source artifact**

Compute SHA-256 of the source artifact manifest once:

```bash
# Set locale_replay to "$english_replay" for en and "$chinese_replay" for zh-CN.
source_artifact_sha256=$(shasum -a 256 "$locale_replay/guides-source/manifest.json" | awk '{print $1}')
printf '%s\n' "$source_artifact_sha256" | grep -Eq '^[0-9a-f]{64}$'
```

Pass that value into every `guides-table-artifact.js --operation create` call. During restore, reject any table artifact whose recorded `masterSha`, `devBaselineSha`, or `sourceArtifactSha256` differs.

- [ ] **SHA Step 4: Validate the assembly decision and output identity**

Recompute the canonical assembly decision SHA-256 and require it to equal the value handed to assemble. The committed descriptor must match the decision for:

```text
semanticSourceGraphSha256
navigationOwnershipSha256
generatorFingerprintSha256
saasSidebarSha256
byocSidebarSha256
```

Any mismatch stops the replay before snapshot promotion.

- [ ] **SHA Step 5: Validate the promoted snapshot and v5 payload from a clean restore**

After candidate promotion:

```bash
# Set promoted_snapshot to the locale's copied last-success snapshot inside its replay directory.
snapshot_sha256=$(shasum -a 256 "$promoted_snapshot" | awk '{print $1}')
printf '%s\n' "$snapshot_sha256" | grep -Eq '^[0-9a-f]{64}$'
```

Create the v5 payload, validate every payload manifest entry, restore it into a separate empty replay workspace, and rerun source completeness/media validation there. Record the promoted snapshot SHA-256 and v5 payload manifest SHA-256 in the locale replay result.

- [ ] **SHA Step 6: Compare the post-restore identity, not just file counts**

Require the restored snapshot SHA-256, semantic source graph SHA-256, navigation ownership SHA-256, source manifest SHA-256, media manifest SHA-256, and sidebar SHA-256 values to equal the pre-archive values. English and Chinese hashes are not expected to equal each other; each locale is checked only against its own recorded identity.

- [ ] **Step 1: Create isolated replay directories under `/tmp` and preserve the current tracked baselines**

Create one temporary root and separate locale workspaces:

```bash
replay_root_link=$(mktemp -d /tmp/zdoc-guides-replay.XXXXXX)
replay_root=$(cd "$replay_root_link" && pwd -P)
english_replay="$replay_root/en"
chinese_replay="$replay_root/zh-CN"
mkdir -p "$english_replay" "$chinese_replay"
```

On macOS, `pwd -P` normally resolves `/tmp/...` to `/private/tmp/...`; all scripts must use the resolved `replay_root` so path-containment checks do not reject the `/tmp` symlink. Run the English and Chinese replays sequentially so their shared candidate/report paths cannot overwrite one another. Copy each completed replay result into its locale directory before starting the other locale.

- [ ] **Step 2: Force one real full English source fetch**

With the repository's approved Feishu and English media environment loaded, run:

```bash
ZDOC_SITE=en \
DOCS_BUILD_ENV=uat \
DOCS_TOOLING_FORCE_FULL_FETCH=1 \
DOCS_TOOLING_GUIDES_STAGE=source \
pnpm docs-tooling publish-group --site en --group guides --stage fetch
```

Expected: all English Base-owned source documents are present, the source snapshot candidate is schema-valid, and the canonical audit report records a nonzero `scanned_sources` count.

- [ ] **Step 3: Complete the English offline render and assemble replay**

Use the same table matrix, isolated table artifact directories, source contract, coverage, sidebar validation, and `build:en` commands used by the reusable workflows. Do not promote the snapshot if any stage fails.

- [ ] **Step 4: Promote the validated English candidate and create a v5 payload**

```bash
english_source_config="$english_replay/source-config.env"
pnpm docs-tooling guides-source-config --site en --github-output "$english_source_config"
set -a
source "$english_source_config"
set +a
node scripts/promote-lark-doc-snapshot.js \
  --candidate packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json \
  --output packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json \
  --manual guides --build-env uat \
  --source-dir packages/docs-tooling/src/lark/meta/sources/guides \
  --targets-built zilliz.saas,zilliz.paas \
  --source-branch dev \
  --publish-url https://docs.cloud-uat3.zilliz.com \
  --link-check-remote https://docs.zilliz.com
node scripts/docs-workflow/guides-source-cache-generation.js create \
  --site en --workspace "$PWD" --output "$english_replay/guides-source-cache-v5" \
  --snapshot packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json \
  --root-token "$root_token"
node scripts/docs-workflow/guides-source-cache-generation.js validate \
  --site en --payload "$english_replay/guides-source-cache-v5" \
  --snapshot packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json \
  --root-token "$root_token"
```

Expected: the promoted snapshot and self-contained v5 payload validate against the exact fetched English sources.

- [ ] **Step 5: Force one real Chinese source fetch and replay**

After archiving the English replay outputs and loading the approved Feishu/OSS environment, run:

```bash
ZDOC_SITE=zh-CN \
DOCS_BUILD_ENV=uat \
DOCS_TOOLING_FORCE_FULL_FETCH=1 \
DOCS_TOOLING_GUIDES_STAGE=source \
pnpm docs-tooling publish-group --site zh-CN --group guides --stage fetch
```

Then execute the same isolated table render and assemble gates using `build:zh-CN`. Expected: Chinese source completeness, media manifest, Cloud/BYOC coverage, sidebars, full build, and canonical audit report all pass.

- [ ] **Step 6: Promote the validated Chinese candidate and create a v5 payload**

Resolve the Chinese source configuration, promote the candidate, and validate a separate payload:

```bash
chinese_source_config="$chinese_replay/source-config.env"
pnpm docs-tooling guides-source-config --site zh-CN --github-output "$chinese_source_config"
set -a
source "$chinese_source_config"
set +a
node scripts/promote-lark-doc-snapshot.js \
  --candidate packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json \
  --output packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json \
  --manual guides --build-env uat \
  --source-dir packages/docs-tooling/src/lark/meta/sources/guides-zh-CN \
  --targets-built zilliz.saas,zilliz.paas \
  --source-branch dev \
  --publish-url https://docs.cloud-uat3.zilliz.com \
  --link-check-remote https://docs.zilliz.com
node scripts/docs-workflow/guides-source-cache-generation.js create \
  --site zh-CN --workspace "$PWD" --output "$chinese_replay/guides-source-cache-v5" \
  --snapshot packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json \
  --root-token "$root_token"
node scripts/docs-workflow/guides-source-cache-generation.js validate \
  --site zh-CN --payload "$chinese_replay/guides-source-cache-v5" \
  --snapshot packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json \
  --root-token "$root_token"
```

Expected: the Chinese snapshot and payload validate independently without overwriting the archived English payload.

- [ ] **Step 7: Compare the new baselines with the fetched source inventories**

For each locale, require:

```text
every publishable canonical/section Docs source is represented
no missing source file or media entry
snapshot site/root/table identity matches the locale
v5 payload validates from an empty workspace restore
the next incremental plan selects zero changes when Base revisions are unchanged
```

Only after both locales pass should the new last-success snapshots be included in the implementation branch and later promoted to `dev` by the normal publication workflow.

- [ ] **Step 8: Preserve evidence and remove the temporary replay root only after handoff**

Keep the following under each locale directory until the results have been reviewed:

```text
source tree
source and media manifests
snapshot candidate and promoted snapshot copy
canonical audit reports
table matrix and isolated table artifacts
assembled content and sidebars
v5 payload
build logs and validation summaries
```

Do not delete the replay root during implementation. Report its resolved path at handoff so it can be inspected or removed explicitly afterward.

### Task 8: Final verification

**Files:**
- Verify all modified files; no new feature scope.

- [ ] **Step 1: Run the complete focused suite**

```bash
node --test \
  packages/docs-tooling/src/lark/guidesBasePreflight.test.js \
  packages/docs-tooling/src/lark/guidesBaseRecordSemantics.test.js \
  packages/docs-tooling/src/lark/larkDocScraper.test.js \
  packages/docs-tooling/src/lark/larkDocWriter.test.js \
  packages/docs-tooling/src/lark/sourceSnapshot.test.js \
  packages/docs-tooling/src/lark/canonicalLinkAuditor.test.js \
  packages/docs-tooling/src/lark/cli.integration.test.js \
  scripts/docs-workflow/prepare-guides-bootstrap-stage.test.js \
  scripts/docs-workflow/guides-cache-save-decision.test.js \
  scripts/validate-guides-source-contract.test.js \
  scripts/validate-guides-coverage.test.js \
  scripts/validate-generated-sidebars.test.js \
  scripts/validate-workflow-policy.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Replay the local en and zh-CN assemble gates with isolated table artifacts**

Expected for both locales:

```text
Base preflight -> source restore/fetch -> canonical audit report -> table render -> assemble -> source contract -> coverage -> sidebar validation -> full site build -> checkpoint/cache validation
```

- [ ] **Step 3: Run final hygiene checks**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and no generated replay artifacts are included in the production diff.
