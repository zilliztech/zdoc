# Non-Force Checkpointed Documentation Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace force-derived monolithic documentation publication with parallel reusable producer workflows, sequential non-force checkpoint publication, per-group translation checkpoints, and aggregate verification/reporting.

**Architecture:** The orchestrator captures immutable `master` and `dev` SHAs, launches read-only group producers in parallel, and then invokes publishers in an explicit dependency chain. Producers upload allowlisted artifacts; publishers construct fresh commits in temporary worktrees based on the latest `origin/dev`, revalidate, and retry normal pushes when the remote moves. Translation runs after each eligible source checkpoint and uses the same publisher.

**Tech Stack:** GitHub Actions reusable workflows, Node.js 20, pnpm 9, Bash, Node's built-in test runner, Docusaurus plugins, Git worktrees, GitHub Actions artifacts, existing Lark reporting and Codex translation scripts.

---

## File map

Create these focused units:

- `scripts/docs-workflow/content-groups.js`: canonical group definitions, fetch commands, owned paths, snapshot names, translation eligibility, and commit messages.
- `scripts/docs-workflow/content-groups.test.js`: group definition and ownership overlap tests.
- `scripts/docs-workflow/run-content-group.js`: run one group's existing fetch/post-processing commands.
- `scripts/docs-workflow/run-content-group.test.js`: command selection and failure propagation tests.
- `scripts/docs-workflow/create-checkpoint-artifact.js`: build the manifest, payload, checksums, and deletion list.
- `scripts/docs-workflow/create-checkpoint-artifact.test.js`: artifact contract tests.
- `scripts/docs-workflow/validate-checkpoint-artifact.js`: reject malformed, unsafe, or unauthorized artifacts.
- `scripts/docs-workflow/validate-checkpoint-artifact.test.js`: traversal, checksum, and allowlist tests.
- `scripts/docs-workflow/apply-checkpoint-artifact.js`: apply an artifact to a target checkout, including deletions and translation-cache merge.
- `scripts/docs-workflow/apply-checkpoint-artifact.test.js`: application and shared-cache merge tests.
- `scripts/docs-workflow/publish-checkpoint.sh`: worktree-based normal-push publisher with bounded retries.
- `scripts/docs-workflow/publish-checkpoint.test.js`: temporary-bare-repository integration tests.
- `scripts/docs-workflow/aggregate-results.js`: aggregate per-group source/translation/final states for the Lark report and workflow exit status.
- `scripts/docs-workflow/aggregate-results.test.js`: continuation and final-status tests.
- `scripts/fetch-sdk-reference-docs.sh`: retain compatibility while delegating to the new group runner.
- `scripts/update-sdk-reference-snapshots.sh`: retain compatibility while accepting one language group.
- `scripts/restore-generated-state.sh`: accept an immutable Git ref as well as `dev`.
- `.github/workflows/_fetch-content-group.yml`: reusable read-only producer.
- `.github/workflows/_publish-content-group.yml`: reusable sequential source publisher.
- `.github/workflows/_translate-content-group.yml`: reusable per-group translator and translation publisher.
- `.github/workflows/_verify-docs.yml`: reusable final verifier.
- `.github/workflows/fetch-docs.yml`: lightweight orchestrator.
- `.github/workflows/translate-codex.yml`: remove legacy automatic chaining after the orchestrator owns translation; preserve explicit manual translation compatibility.
- `scripts/validate-workflow-policy.js`: enforce non-force publication and reusable workflow policy.
- `scripts/validate-workflow-policy.test.js`: policy regression tests.
- `scripts/sdk-reference-workflow.test.js`: group-oriented SDK workflow assertions.

## Task 1: Define content groups and exact output ownership

**Files:**
- Create: `scripts/docs-workflow/content-groups.js`
- Create: `scripts/docs-workflow/content-groups.test.js`

- [ ] **Step 1: Write the failing group-definition tests**

```js
const assert = require('node:assert/strict')
const test = require('node:test')
const { getContentGroup, listContentGroups, assertDisjointOwnership } = require('./content-groups')

test('defines the seven source checkpoint groups in publication order', () => {
  assert.deepEqual(listContentGroups(), ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])
})

test('maps active SDK manuals to language-owned outputs', () => {
  assert.deepEqual(getContentGroup('python').manuals, ['python', 'pymilvus25', 'pymilvus26', 'pymilvus30'])
  assert.equal(getContentGroup('python').snapshotManual, 'pymilvus30')
  assert.deepEqual(getContentGroup('python').ownedPaths, [
    'reference/api/python/python',
    'config/generated/python.sidebar.js',
    'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json',
  ])
})

test('source group ownership does not overlap', () => {
  assert.doesNotThrow(() => assertDisjointOwnership())
})

test('rejects an unknown group', () => {
  assert.throws(() => getContentGroup('ruby'), /Unknown content group: ruby/)
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/docs-workflow/content-groups.test.js`

Expected: FAIL with `Cannot find module './content-groups'`.

- [ ] **Step 3: Implement the canonical definitions**

Implement immutable definitions with these exact source outputs:

```js
'use strict'

const groups = Object.freeze({
  guides: {
    manuals: ['guides'],
    snapshotManual: 'guides',
    translate: true,
    ownedPaths: [
      'docs',
      'docs-byoc',
      'config/generated/guides.sidebar.js',
      'config/generated/guides-byoc.sidebar.js',
      'plugins/lark-docs/meta/snapshots/guides-uat-last-success.json',
      'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json',
      'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md',
      'plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv',
      'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json',
      'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md',
      'plugins/lark-docs/meta/reports/guides-broken-content-links.json',
    ],
    commitMessage: 'docs(guides): publish fetched content',
  },
  python: {
    manuals: ['python', 'pymilvus25', 'pymilvus26', 'pymilvus30'],
    snapshotManual: 'pymilvus30',
    translate: true,
    ownedPaths: ['reference/api/python/python', 'config/generated/python.sidebar.js', 'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json'],
    commitMessage: 'docs(python): publish SDK reference',
  },
  java: {
    manuals: ['javaV2', 'javaV225', 'javaV226', 'javaV230'],
    snapshotManual: 'javaV230',
    translate: true,
    ownedPaths: ['reference/api/java/java/v2', 'config/generated/java.sidebar.js', 'plugins/lark-docs/meta/snapshots/javaV230-uat-last-success.json'],
    commitMessage: 'docs(java): publish SDK reference',
  },
  node: {
    manuals: ['node', 'nodejs25', 'nodejs26', 'nodejs30'],
    snapshotManual: 'nodejs30',
    translate: true,
    ownedPaths: ['reference/api/nodejs/nodejs', 'config/generated/node.sidebar.js', 'plugins/lark-docs/meta/snapshots/nodejs30-uat-last-success.json'],
    commitMessage: 'docs(node): publish SDK reference',
  },
  go: {
    manuals: ['gov226', 'gov230'],
    snapshotManual: 'gov230',
    translate: true,
    ownedPaths: ['reference/api/go/go/v2', 'config/generated/go.sidebar.js', 'plugins/lark-docs/meta/snapshots/gov230-uat-last-success.json'],
    commitMessage: 'docs(go): publish SDK reference',
  },
  cli: {
    manuals: ['cliv13', 'cliv14'],
    snapshotManual: 'cliv14',
    translate: true,
    ownedPaths: ['reference/cli/cli', 'config/generated/cli.sidebar.js', 'plugins/lark-docs/meta/snapshots/cliv14-uat-last-success.json'],
    commitMessage: 'docs(cli): publish CLI reference',
  },
  rest: {
    manuals: [],
    snapshotManual: null,
    translate: true,
    ownedPaths: ['reference/api/restful/restful', 'config/generated/restful.sidebar.js'],
    commitMessage: 'docs(rest): publish REST reference',
  },
})
```

Export `getContentGroup`, `listContentGroups`, and `assertDisjointOwnership`. Reject prefix overlaps such as `docs` and `docs/tutorials` across different groups.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test scripts/docs-workflow/content-groups.test.js`

Expected: all four tests pass.

- [ ] **Step 5: Verify definitions against current config**

Run: `rg -n "outputDir:|sidebarPath:" config/lark-docs.config.ts`

Expected: each active manual's Zilliz output and sidebar matches the ownership table; amend the table and test if the current config proves a different exact path.

- [ ] **Step 6: Commit the content-group contract**

```bash
git add scripts/docs-workflow/content-groups.js scripts/docs-workflow/content-groups.test.js
git commit -m "define docs workflow content groups"
```

## Task 2: Split group fetch and snapshot commands without changing generators

**Files:**
- Create: `scripts/docs-workflow/run-content-group.js`
- Create: `scripts/docs-workflow/run-content-group.test.js`
- Modify: `scripts/fetch-sdk-reference-docs.sh`
- Modify: `scripts/update-sdk-reference-snapshots.sh`

- [ ] **Step 1: Write failing command-selection tests**

Test that `commandsFor('guides')` returns the four existing guides commands plus card advancement, `commandsFor('python')` returns the existing Python source and active-manual commands, and `commandsFor('rest')` returns only `fetch-apifox-docs`.

```js
test('keeps Python source and active manual commands together', () => {
  assert.deepEqual(commandsFor('python'), [
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'python', '-src-only'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'pymilvus25', '-src-only'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'pymilvus26', '-src-only'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'pymilvus30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'pymilvus30', '-tar', 'zilliz', '-post'],
  ])
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/docs-workflow/run-content-group.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement command arrays and sequential execution**

Use `spawnSync(command[0], command.slice(1), { stdio: 'inherit', env: process.env })`; stop the group on the first non-zero status and preserve the exact current command order from `scripts/fetch-sdk-reference-docs.sh` and `.github/workflows/fetch-docs.yml`.

- [ ] **Step 4: Add compatibility wrappers**

Change `scripts/fetch-sdk-reference-docs.sh` to invoke `run-content-group.js` for `python`, `java`, `node`, `go`, `cli`, and `rest` in the legacy order. Change `scripts/update-sdk-reference-snapshots.sh` to accept an optional group argument and invoke `update-lark-doc-snapshot.js` only for that group's active manual.

- [ ] **Step 5: Run focused and compatibility tests**

Run:

```bash
node --test scripts/docs-workflow/run-content-group.test.js
node --test scripts/sdk-reference-workflow.test.js
```

Expected: all tests pass without contacting Lark because tests inspect command definitions rather than execute network commands.

- [ ] **Step 6: Commit**

```bash
git add scripts/docs-workflow/run-content-group.js scripts/docs-workflow/run-content-group.test.js scripts/fetch-sdk-reference-docs.sh scripts/update-sdk-reference-snapshots.sh scripts/sdk-reference-workflow.test.js
git commit -m "split docs fetch commands by content group"
```

## Task 3: Restore generated state from immutable refs

**Files:**
- Modify: `scripts/restore-generated-state.sh`
- Modify: `scripts/restore-generated-state.test.js`

- [ ] **Step 1: Add a failing immutable-ref test**

Assert that the script accepts `--ref <sha>` and fetches the SHA before checking out owned state, while retaining `restore-generated-state.sh dev` compatibility.

```js
assert.match(script, /--ref\)/)
assert.match(script, /git fetch origin "\$target_ref" --depth=1/)
assert.match(script, /git checkout "\$resolved_ref" -- "\$\{restore_path\}"/)
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/restore-generated-state.test.js`

Expected: FAIL on the new `--ref` assertions.

- [ ] **Step 3: Implement ref parsing**

Support both:

```bash
bash scripts/restore-generated-state.sh dev
bash scripts/restore-generated-state.sh --ref "$DEV_BASELINE_SHA"
```

Resolve branch mode to `origin/dev`; resolve SHA mode to `FETCH_HEAD`. Do not change the restored path list in this task.

- [ ] **Step 4: Run tests**

Run: `node --test scripts/restore-generated-state.test.js`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/restore-generated-state.sh scripts/restore-generated-state.test.js
git commit -m "restore generated docs from immutable refs"
```

## Task 4: Create and validate checkpoint artifacts

**Files:**
- Create: `scripts/docs-workflow/create-checkpoint-artifact.js`
- Create: `scripts/docs-workflow/create-checkpoint-artifact.test.js`
- Create: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Create: `scripts/docs-workflow/validate-checkpoint-artifact.test.js`

- [ ] **Step 1: Write failing artifact contract tests**

Use temporary directories and a fake baseline tree. Verify the manifest contains schema version `1`, group, SHAs, sorted files, SHA-256 checksums, and explicit deletions for baseline-owned files absent from the producer output.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js
node --test scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: both test files fail because their modules are missing.

- [ ] **Step 3: Implement artifact creation**

CLI contract:

```bash
node scripts/docs-workflow/create-checkpoint-artifact.js \
  --group python \
  --master-sha "$MASTER_SHA" \
  --dev-baseline-sha "$DEV_BASELINE_SHA" \
  --baseline-dir "$BASELINE_DIR" \
  --workspace "$GITHUB_WORKSPACE" \
  --output "$RUNNER_TEMP/checkpoint-python"
```

Write payload files under `payload/` and `manifest.json` at the artifact root. Normalize all paths to POSIX relative paths.

- [ ] **Step 4: Implement strict validation**

Reject absolute paths, `..`, NULs, unknown groups, paths outside the allowlist, duplicate file/deletion entries, overlap between files and deletions, checksum mismatch, and unexpected manifest keys that change execution semantics.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `node --test scripts/docs-workflow/{create-checkpoint-artifact,validate-checkpoint-artifact}.test.js`

Expected: all artifact tests pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/docs-workflow/create-checkpoint-artifact.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
git commit -m "add validated docs checkpoint artifacts"
```

## Task 5: Apply artifacts and merge translation cache safely

**Files:**
- Create: `scripts/docs-workflow/apply-checkpoint-artifact.js`
- Create: `scripts/docs-workflow/apply-checkpoint-artifact.test.js`

- [ ] **Step 1: Write failing application tests**

Cover copying files, deleting owned paths, preserving unrelated files, and merging `.translation-cache/ja-JP.json` by source-document key. A cache key changed by both latest `dev` and the artifact must be rejected unless both values are deeply equal.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/docs-workflow/apply-checkpoint-artifact.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement application**

CLI contract:

```bash
node scripts/docs-workflow/apply-checkpoint-artifact.js \
  --artifact "$ARTIFACT_DIR" \
  --target "$DEV_WORKTREE"
```

Call the validator first. Apply deletions before copies. Create parent directories explicitly. For translation artifacts, read the producer baseline cache recorded in the artifact and perform a three-way key merge: baseline, artifact result, latest dev target.

- [ ] **Step 4: Run tests**

Run: `node --test scripts/docs-workflow/apply-checkpoint-artifact.test.js`

Expected: all application and cache-merge tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/apply-checkpoint-artifact.js scripts/docs-workflow/apply-checkpoint-artifact.test.js
git commit -m "apply docs checkpoint artifacts safely"
```

## Task 6: Build the non-force worktree publisher

**Files:**
- Create: `scripts/docs-workflow/publish-checkpoint.sh`
- Create: `scripts/docs-workflow/publish-checkpoint.test.js`

- [ ] **Step 1: Write failing Git integration tests**

Create a temporary bare remote and test:

1. publishing on top of `dev`;
2. preserving an unrelated remote commit;
3. retrying when a test hook advances remote `dev` immediately before the first push;
4. owned deletion;
5. no-change success;
6. bounded failure after three remote moves;
7. absence of `--force` in the script.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/docs-workflow/publish-checkpoint.test.js`

Expected: FAIL because `publish-checkpoint.sh` does not exist.

- [ ] **Step 3: Implement the publisher loop**

Required interface:

```bash
bash scripts/docs-workflow/publish-checkpoint.sh \
  --artifact "$ARTIFACT_DIR" \
  --branch dev \
  --message "docs(python): publish SDK reference" \
  --max-attempts 3 \
  --validate-command "node scripts/validate-generated-sidebars.js"
```

For each attempt:

```bash
git fetch origin "$branch"
worktree="$(mktemp -d)"
git worktree add --detach "$worktree" "origin/$branch"
node scripts/docs-workflow/apply-checkpoint-artifact.js --artifact "$artifact" --target "$worktree"
(cd "$worktree" && eval "$validate_command")
(cd "$worktree" && git add --all -- <allowlisted paths>)
```

Commit only if the index is non-empty. Push `HEAD:$branch` normally. On non-fast-forward, remove the worktree and repeat. Trap cleanup on `EXIT`, `INT`, and `TERM`. Emit `status=no_changes|published|failed` and `commit_sha` through the output file named by `GITHUB_OUTPUT` when present.

- [ ] **Step 4: Run integration tests**

Run: `node --test scripts/docs-workflow/publish-checkpoint.test.js`

Expected: all seven scenarios pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/publish-checkpoint.sh scripts/docs-workflow/publish-checkpoint.test.js
git commit -m "publish docs checkpoints without force"
```

## Task 7: Add the reusable parallel producer workflow

**Files:**
- Create: `.github/workflows/_fetch-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow-policy assertions**

Add fixture-driven tests requiring `_fetch-content-group.yml` to use `workflow_call`, `contents: read`, immutable `master_sha` and `dev_baseline_sha` inputs, artifact upload, and no `git push` or auto-commit action.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/validate-workflow-policy.test.js`

Expected: FAIL because the producer workflow is absent.

- [ ] **Step 3: Implement `_fetch-content-group.yml`**

Inputs: `group`, `master_sha`, `dev_baseline_sha`, `artifact_retention_days`, and `card_id`. Secrets inherit the existing Lark, model, AWS, and translation credentials required by current commands.

The job must:

- check out `master_sha` with `fetch-depth: 0`;
- save the baseline-owned paths before generation for deletion detection;
- restore generated state with `--ref`;
- install pnpm dependencies;
- run `run-content-group.js --group`;
- validate sidebars and run `run-doc-build-stage.js`;
- update only the group's snapshot;
- create and validate the artifact;
- upload it as `docs-checkpoint-<group>`;
- emit `artifact_ready` or the precise failure state.

- [ ] **Step 4: Run YAML and policy checks**

Run:

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/_fetch-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "add reusable docs producer workflow"
```

## Task 8: Add the reusable sequential publisher workflow

**Files:**
- Create: `.github/workflows/_publish-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing publisher policy tests**

Require `workflow_call`, `contents: write`, artifact download, invocation of `publish-checkpoint.sh`, output status/SHA, no force syntax, and no `git-auto-commit-action`.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/validate-workflow-policy.test.js`

Expected: FAIL because `_publish-content-group.yml` is absent.

- [ ] **Step 3: Implement the publisher workflow**

Inputs: `group`, `artifact_name`, `commit_message`, `should_publish`, and `validate_command`. Return `status` and `commit_sha`. If `should_publish` is false, return `skipped` successfully so the orchestrator chain continues.

- [ ] **Step 4: Run policy tests**

Run: `node --test scripts/validate-workflow-policy.test.js`

Expected: all policy tests pass.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/_publish-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "add reusable docs publisher workflow"
```

## Task 9: Refactor translation into a reusable per-group checkpoint

**Files:**
- Create: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`
- Modify: `.github/workflows/translate-codex.yml`

- [ ] **Step 1: Add failing group-filter tests to the translation manifest**

Add `--group guides|python|java|node|go|cli|rest` and assert that guide groups select `docs`/`docs-byoc`, while SDK groups select only their owned reference prefix. Keep `--include-reference` compatibility for manual legacy runs.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/translation/manifest.test.js`

Expected: the new group-filter tests fail.

- [ ] **Step 3: Implement group filtering**

Reuse `content-groups.js` ownership definitions. The manifest must record the selected group and source checkpoint SHA.

- [ ] **Step 4: Implement `_translate-content-group.yml`**

Inputs: `group`, `source_commit_sha`, `master_sha`, and `should_translate`. Reuse the current `agentRunner.js`, MDX parse checks, full build, report summary, and environment variables. Replace `git-auto-commit-action` with translation artifact creation and `publish-checkpoint.sh` using `i18n(<group>): publish translations`.

- [ ] **Step 5: Convert `translate-codex.yml` to a manual compatibility wrapper**

Remove obsolete `workflow_run.workflows` entries for the deleted auto/manual names. Preserve `workflow_dispatch`; have the manual wrapper call `_translate-content-group.yml` for the selected group or document an `all` sequence without reintroducing force publication.

- [ ] **Step 6: Run translation and workflow tests**

Run:

```bash
node --test scripts/translation/manifest.test.js scripts/translation/agentRunner.test.js
node scripts/validate-workflow-policy.js
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/_translate-content-group.yml .github/workflows/translate-codex.yml scripts/translation/manifest.js scripts/translation/manifest.test.js
git commit -m "add per-group translation checkpoints"
```

## Task 10: Add final verification and result aggregation

**Files:**
- Create: `.github/workflows/_verify-docs.yml`
- Create: `scripts/docs-workflow/aggregate-results.js`
- Create: `scripts/docs-workflow/aggregate-results.test.js`

- [ ] **Step 1: Write failing aggregation tests**

Verify that later successes are retained after an earlier failure, any requested failure makes the aggregate result `failure`, skipped unrequested groups do not fail the run, and final verification failure is reported separately.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/docs-workflow/aggregate-results.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement aggregation**

Accept a JSON file of group source/translation states and final verification state. Emit Markdown for the Lark card plus `overall_status` through `GITHUB_OUTPUT`.

- [ ] **Step 4: Implement `_verify-docs.yml`**

Check out the final `dev` ref and run:

```bash
node scripts/validate-generated-sidebars.js
node scripts/run-doc-build-stage.js --build "pnpm run build"
node scripts/validate-workflow-policy.js
node --test scripts/sdk-reference-workflow.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js
```

Upload link-check reports with `if: always()`.

- [ ] **Step 5: Run tests**

Run: `node --test scripts/docs-workflow/aggregate-results.test.js`

Expected: all aggregation tests pass.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/_verify-docs.yml scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js
git commit -m "add docs workflow final verification"
```

## Task 11: Replace the monolith with the orchestrator DAG

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/sdk-reference-workflow.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing orchestrator structure tests**

Assert:

- triggers remain `workflow_dispatch`, schedule `0 2,10,18 * * *`, and the dev workflow-file push;
- manual input `group` defaults to `all`;
- seven producer jobs depend only on `prepare`, making them parallel-eligible;
- source publishers and translations form the explicit approved sequence;
- every downstream publisher uses `if: always()`;
- final verification depends on the end of the publication chain;
- the workflow contains no direct fetch commands, force push, auto-commit action, or ad hoc report commit block.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test scripts/sdk-reference-workflow.test.js
node --test scripts/validate-workflow-policy.test.js
```

Expected: tests fail against the current monolithic workflow.

- [ ] **Step 3: Implement prepare and parallel producers**

`prepare` resolves `master_sha` from the triggering workflow commit for master dispatch/schedule and resolves `dev_baseline_sha` with `git ls-remote origin refs/heads/dev`. It creates the existing Global Docs Build card and exposes selected groups.

Create seven jobs calling `_fetch-content-group.yml`, each gated by `all` or its group name and each needing only `prepare`.

- [ ] **Step 4: Implement the publication/translation chain**

For each group, add a publisher job that needs its producer plus the previous translation/publisher tail and uses `if: always()`. Add its translation job immediately afterward when `translate` is true. Pass producer readiness explicitly; do not infer it from job success alone.

- [ ] **Step 5: Implement final verification and Lark completion**

Invoke `_verify-docs.yml`, aggregate every state, attach the Markdown summary, finish the card, and exit non-zero only after reporting when aggregate status is failure.

- [ ] **Step 6: Run all static tests**

Run:

```bash
node scripts/validate-workflow-policy.js
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/restore-generated-state.test.js scripts/docs-workflow/*.test.js
git diff --check
```

Expected: all tests pass and no whitespace errors are reported.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/fetch-docs.yml scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "orchestrate checkpointed docs publication"
```

## Task 12: Test failure continuation and shared-file safety locally

**Files:**
- Modify: `scripts/docs-workflow/content-groups.test.js`
- Modify: `scripts/docs-workflow/publish-checkpoint.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`

- [ ] **Step 1: Add an end-to-end local fixture**

Simulate parallel Python and Java artifacts produced from the same dev baseline, advance remote dev with an unrelated guides commit, publish Python then Java, and assert all three changes survive in the final dev tree.

- [ ] **Step 2: Add translation-cache contention coverage**

Create two translation artifacts from the same cache baseline with disjoint document keys. Publish them sequentially and assert the final cache contains both updates plus an unrelated remote key.

- [ ] **Step 3: Add overlapping ownership rejection**

Inject a test-only group claiming `reference/api/python` and assert definition validation rejects it before artifact creation.

- [ ] **Step 4: Run the complete local suite**

Run:

```bash
node --test scripts/docs-workflow/*.test.js scripts/translation/*.test.js scripts/sdk-reference-workflow.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js
```

Expected: zero failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/docs-workflow/aggregate-results.test.js
git commit -m "test checkpoint publication contention"
```

## Task 13: Perform staged GitHub Actions rollout

**Files:**
- Modify only if rollout reveals a verified defect in the implementation files above.

- [ ] **Step 1: Push the implementation branch and validate workflow discovery**

Run:

```bash
git push -u origin HEAD
gh workflow list | rg "fetch lark docs"
```

Expected: the orchestrator is listed and reusable workflows are accepted by GitHub.

- [ ] **Step 2: Dispatch artifact-only CLI production on a test branch configuration**

Temporarily use the publisher's branch input with a dedicated test branch created from `origin/dev`; dispatch `group=cli`; verify the producer artifact manifest and build result before enabling its publisher.

- [ ] **Step 3: Verify one normal non-force publication**

Dispatch CLI with publication enabled to the test branch. Confirm the published commit's first parent equals the test branch tip observed by the publisher attempt and that logs contain no forced update.

- [ ] **Step 4: Verify remote-move retry**

Advance the test branch after artifact production but before publication. Confirm the publisher reconstructs a new commit on the updated tip and succeeds within the configured retry bound.

- [ ] **Step 5: Run all producers and sequential publishers on the test branch**

Dispatch `group=all`; verify producers overlap in wall-clock time, publisher commits appear in the defined order, and one deliberately failed test producer does not stop later publishers.

- [ ] **Step 6: Run the full orchestrator manually from master against dev**

Run:

```bash
gh workflow run fetch-docs.yml --ref master -f group=all
gh run list --workflow fetch-docs.yml --limit 1
```

Monitor the returned run through completion. Expected: all requested groups report source and translation states, final verification runs, and every dev update is a normal fast-forward commit.

- [ ] **Step 7: Verify scheduled configuration remains disabled until manual success**

Do not change the cron expression, but do not merge the implementation to the default branch until Step 6 succeeds. Once merged, confirm the next scheduled run uses the same orchestrator and captured master SHA.

- [ ] **Step 8: Final repository verification**

Run:

```bash
git status --short
node scripts/validate-workflow-policy.js
node --test scripts/docs-workflow/*.test.js scripts/translation/*.test.js scripts/sdk-reference-workflow.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js
```

Expected: clean intended working tree and zero test failures.
