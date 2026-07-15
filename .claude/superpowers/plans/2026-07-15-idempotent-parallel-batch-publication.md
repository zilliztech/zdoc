# Idempotent Parallel Translation Batch Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve parallel translation while allowing sequential publishers to safely ignore source-reconciliation mutations already committed by earlier batches.

**Architecture:** Add a focused Node helper that validates a checkpoint, selects literal manifest paths that still exist or remain tracked at the latest target tip, and verifies the staged index remains inside manifest scope. Integrate it into the existing latest-tip publication retry loop; translation jobs and artifact production remain unchanged.

**Tech Stack:** Bash, Node.js CommonJS, `node:test`, Git pathspec-from-file, GitHub Actions workflow policy tests.

---

### Task 1: Select and verify stageable checkpoint paths

**Files:**
- Create: `scripts/docs-workflow/checkpoint-stage-paths.js`
- Create: `scripts/docs-workflow/checkpoint-stage-paths.test.js`

- [ ] **Step 1: Write failing tests for stage-path selection**

Create a temporary Git repository and validated checkpoint fixtures. Cover these cases with real Git commands:

```js
test('selects files that exist and deletions still tracked at HEAD', async () => {
  const fixture = await repoFixture({
    tracked: {
      'docs/deleted.md': 'old',
      'docs/changed.md': 'old',
    },
    artifactFiles: {
      'docs/changed.md': 'new',
      'docs/new.md': 'new',
    },
    artifactDeletions: ['docs/deleted.md'],
  })
  await fs.rm(path.join(fixture.worktree, 'docs/deleted.md'))
  await fs.writeFile(path.join(fixture.worktree, 'docs/changed.md'), 'new')
  await fs.writeFile(path.join(fixture.worktree, 'docs/new.md'), 'new')

  const result = await selectCheckpointStagePaths({
    artifactDir: fixture.artifact,
    worktree: fixture.worktree,
  })

  assert.deepEqual(result.stageable, [
    'docs/changed.md',
    'docs/deleted.md',
    'docs/new.md',
  ])
  assert.deepEqual(result.alreadyApplied, [])
})

test('classifies an absent untracked repeated deletion as already applied', async () => {
  const fixture = await repeatedDeletionFixture()
  const result = await selectCheckpointStagePaths({ artifactDir: fixture.artifact, worktree: fixture.worktree })
  assert.deepEqual(result.stageable, ['docs/batch-two.md'])
  assert.deepEqual(result.alreadyApplied, ['docs/removed.md'])
})

test('uses literal pathspecs for glob-like filenames', async () => {
  const fixture = await repoFixture({
    tracked: { 'docs/[draft].md': 'old', 'docs/d.md': 'untouched' },
    artifactFiles: { 'docs/[draft].md': 'new' },
  })
  const output = path.join(fixture.root, 'stage-paths.bin')
  await writeStagePathFile({ artifactDir: fixture.artifact, worktree: fixture.worktree, output })
  assert.deepEqual((await fs.readFile(output)).toString().split('\0').filter(Boolean), [':(literal)docs/[draft].md'])
})
```

Add tests proving a tracked directory deletion remains stageable and invalid/overlapping paths are still rejected by `validateCheckpointArtifact`.

- [ ] **Step 2: Run the helper test to verify RED**

Run:

```bash
node --test scripts/docs-workflow/checkpoint-stage-paths.test.js
```

Expected: FAIL with `Cannot find module './checkpoint-stage-paths'`.

- [ ] **Step 3: Implement stageable-path selection**

Implement the helper with these exported interfaces:

```js
async function selectCheckpointStagePaths({ artifactDir, worktree })
async function writeStagePathFile({ artifactDir, worktree, output })
async function verifyStagedCheckpointPaths({ artifactDir, worktree })
```

Selection must validate the artifact, pin the real worktree directory, and inspect each unique declared file/deletion path:

```js
async function selectCheckpointStagePaths({ artifactDir, worktree }) {
  const manifest = await validateCheckpointArtifact(artifactDir)
  const canonicalWorktree = await requireRealDirectory(worktree)
  const declared = [...new Set([
    ...manifest.files.map(entry => entry.path),
    ...manifest.deletions,
  ])].sort()
  const stageable = []
  const alreadyApplied = []

  for (const relativePath of declared) {
    const exists = Boolean(await maybeLstat(path.join(canonicalWorktree, ...relativePath.split('/'))))
    const tracked = gitMatchesHead(canonicalWorktree, relativePath)
    if (exists || tracked) stageable.push(relativePath)
    else alreadyApplied.push(relativePath)
  }

  return Object.freeze({ declared, stageable, alreadyApplied })
}
```

`gitMatchesHead` must invoke Git without a shell and use a literal pathspec:

```js
function literalPathspec(relativePath) {
  return `:(literal)${relativePath}`
}

function gitMatchesHead(worktree, relativePath) {
  const result = spawnSync('git', [
    '-C', worktree,
    'ls-files', '--error-unmatch', '--', literalPathspec(relativePath),
  ], { encoding: 'utf8' })
  if (result.status === 0) return true
  if (result.status === 1) return false
  throw new Error(`Unable to inspect tracked checkpoint path: ${relativePath}: ${result.stderr.trim()}`)
}
```

`writeStagePathFile` writes NUL-separated `:(literal)` entries to a new file using `flag: 'wx'`. Its CLI accepts exactly:

```text
select --artifact <dir> --worktree <dir> --output <file>
verify --artifact <dir> --worktree <dir>
```

The select command prints a JSON diagnostic summary containing `declared`, `stageable`, and `alreadyApplied` counts plus the skipped paths.

- [ ] **Step 4: Implement staged-scope verification**

Read cached changed paths with:

```js
const result = spawnSync('git', [
  '-C', canonicalWorktree,
  'diff', '--cached', '--name-only', '-z', '--no-renames',
])
```

Reject any cached path not covered by a declared path:

```js
function coveredByManifest(changedPath, declaredPath) {
  return changedPath === declaredPath || changedPath.startsWith(`${declaredPath}/`)
}

for (const changedPath of stagedPaths) {
  if (!declared.some(declaredPath => coveredByManifest(changedPath, declaredPath))) {
    throw new Error(`Staged path is outside checkpoint manifest scope: ${changedPath}`)
  }
}
```

Return a frozen summary of the staged paths and print it from the verify CLI.

- [ ] **Step 5: Run helper tests to verify GREEN**

Run:

```bash
node --test scripts/docs-workflow/checkpoint-stage-paths.test.js
```

Expected: all helper tests pass.

- [ ] **Step 6: Commit the helper unit**

```bash
git add scripts/docs-workflow/checkpoint-stage-paths.js scripts/docs-workflow/checkpoint-stage-paths.test.js
git commit -m "fix(ci): select idempotent checkpoint stage paths"
```

### Task 2: Integrate actual-diff staging into checkpoint publication

**Files:**
- Modify: `scripts/docs-workflow/publish-checkpoint.sh:10-75`
- Modify: `scripts/docs-workflow/publish-checkpoint.test.js:1-190`

- [ ] **Step 1: Add a failing two-batch deletion regression**

Create two artifacts from the same original baseline. The first deletes `docs/a.md`; the second repeats that deletion and adds `docs/batch-two.md`:

```js
test('publishes a later batch when its source deletion was already committed', () => {
  const fixture = setup()
  const baseline = path.join(fixture.root, 'baseline')
  const batchOne = path.join(fixture.root, 'batch-one')
  const batchTwo = path.join(fixture.root, 'batch-two')
  execFileSync('cp', ['-R', fixture.seed, baseline])
  execFileSync('cp', ['-R', fixture.seed, batchOne])
  execFileSync('cp', ['-R', fixture.seed, batchTwo])

  unlinkSync(path.join(batchOne, 'docs/a.md'))
  unlinkSync(path.join(batchTwo, 'docs/a.md'))
  writeFileSync(path.join(batchTwo, 'docs/batch-two.md'), 'translated\n')

  const firstArgs = args(artifact(fixture.root, baseline, batchOne))
  firstArgs[firstArgs.indexOf('test -f docs/a.md')] = 'test ! -e docs/a.md'
  assert.equal(publish(fixture.seed, firstArgs).status, 0)

  const secondArgs = args(artifact(fixture.root, baseline, batchTwo))
  secondArgs[secondArgs.indexOf('test -f docs/a.md')] = 'test ! -e docs/a.md && test -f docs/batch-two.md'
  const second = publish(fixture.seed, secondArgs)

  assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`)
  assert.match(second.stdout, /status=published/)
  git(fixture.seed, 'fetch', 'origin', 'dev')
  assert.equal(git(fixture.seed, 'show', 'origin/dev:docs/batch-two.md'), 'translated')
  assert.throws(() => git(fixture.seed, 'show', 'origin/dev:docs/a.md'))
})
```

Add a second regression that reapplies the already-published second artifact and expects `status=no_changes` with the current remote SHA.

- [ ] **Step 2: Run publisher tests to verify RED**

Run:

```bash
node --test scripts/docs-workflow/publish-checkpoint.test.js
```

Expected: the repeated-deletion test fails with `pathspec 'docs/a.md' did not match any files`.

- [ ] **Step 3: Replace direct manifest-path staging**

In `publish-checkpoint.sh`, remove the direct `git add --all -- "${paths[@]}"` flow. Add a temporary stage-path directory to the existing cleanup list so the helper can safely create its output file:

```bash
stage_paths_dir=$(mktemp -d "$root/docs-stage-paths.XXXXXX")
temp_files="$temp_files"$'\n'"$stage_paths_dir"
stage_paths_file="$stage_paths_dir/paths.bin"
node "$script_dir/checkpoint-stage-paths.js" select \
  --artifact "$artifact" \
  --worktree "$active_worktree" \
  --output "$stage_paths_file"

if [[ -s "$stage_paths_file" ]]; then
  git -C "$active_worktree" add --all \
    --pathspec-from-file="$stage_paths_file" \
    --pathspec-file-nul
fi

node "$script_dir/checkpoint-stage-paths.js" verify \
  --artifact "$artifact" \
  --worktree "$active_worktree"
```

Keep this sequence after artifact application and validation, and before the cached-diff `no_changes` check.

- [ ] **Step 4: Run publisher tests to verify GREEN**

Run:

```bash
node --test scripts/docs-workflow/publish-checkpoint.test.js
```

Expected: the complete publisher suite passes, including first-time deletion, repeated deletion, no-change replay, translation-cache merging, cleanup, and non-fast-forward retry tests.

- [ ] **Step 5: Commit the publisher integration**

```bash
git add scripts/docs-workflow/publish-checkpoint.sh scripts/docs-workflow/publish-checkpoint.test.js
git commit -m "fix(ci): stage only remaining checkpoint changes"
```

### Task 3: Lock in parallel workflow and scoped-staging policy

**Files:**
- Modify: `scripts/validate-workflow-policy.js:140-178`
- Modify: `scripts/validate-workflow-policy.test.js:235-280`

- [ ] **Step 1: Add failing workflow-policy assertions**

Require the publisher helper and literal pathspec-file staging while preserving the existing parallel translator and single ordered publisher assertions:

```js
const publisher = fs.readFileSync('scripts/docs-workflow/publish-checkpoint.sh', 'utf8')
assert.match(publisher, /checkpoint-stage-paths\.js" select/)
assert.match(publisher, /--pathspec-from-file="\$stage_paths_file"/)
assert.match(publisher, /--pathspec-file-nul/)
assert.match(publisher, /checkpoint-stage-paths\.js" verify/)
assert.doesNotMatch(publisher, /git add --all -- "\$\{paths\[@\]\}"/)

const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
assert.equal(workflow.jobs.translate_guides_batches.strategy['max-parallel'], undefined)
assert.equal(workflow.jobs.publish_guides_translation_batches.uses, './.github/workflows/_publish-translation-batches.yml')
```

Add equivalent required patterns to `validate-workflow-policy.js` for publishing workflows that invoke `publish-checkpoint.sh`.

- [ ] **Step 2: Run workflow-policy tests to verify RED**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the helper-based staging policy is not yet enforced.

- [ ] **Step 3: Implement the policy requirements**

Add focused required patterns for `publish-checkpoint.sh` integration without changing concurrency or translation matrix configuration. Retain the existing bans on force push and repository-wide publication behavior. Extend `validateWorkflowPolicies` with the publisher source check:

```js
const publisherPath = path.join(process.cwd(), 'scripts/docs-workflow/publish-checkpoint.sh')
const publisherSource = fs.readFileSync(publisherPath, 'utf8')
for (const [pattern, message] of [
  [/checkpoint-stage-paths\.js" select/, 'checkpoint publisher must select stageable manifest paths'],
  [/--pathspec-from-file="\$stage_paths_file"[\s\S]*--pathspec-file-nul/, 'checkpoint publisher must use NUL-delimited literal pathspec staging'],
  [/checkpoint-stage-paths\.js" verify/, 'checkpoint publisher must verify staged manifest scope'],
]) {
  if (!pattern.test(publisherSource)) errors.push(`publish-checkpoint.sh: ${message}`)
}
if (/git add --all -- "\$\{paths\[@\]\}"/.test(publisherSource)) {
  errors.push('publish-checkpoint.sh: direct manifest pathspec staging is not idempotent')
}
```

- [ ] **Step 4: Run policy tests and validator to verify GREEN**

```bash
node --test scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit policy coverage**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test(ci): require idempotent scoped publication"
```

### Task 4: Full local verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run the complete checkpoint and workflow suite**

```bash
node --test \
  scripts/docs-workflow/checkpoint-stage-paths.test.js \
  scripts/docs-workflow/create-checkpoint-artifact.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/apply-checkpoint-artifact.test.js \
  scripts/docs-workflow/publish-checkpoint.test.js \
  scripts/docs-workflow/checkpoint-contention.test.js \
  scripts/validate-workflow-policy.test.js
```

Expected: zero failed tests.

- [ ] **Step 2: Run policy, shell, and whitespace checks**

```bash
node scripts/validate-workflow-policy.js
bash -n scripts/docs-workflow/publish-checkpoint.sh
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Review scope and commit history**

```bash
git status --short --branch
git diff --stat master...HEAD
git log --oneline master..HEAD
```

Confirm translation workflow parallelism is unchanged and only the publisher, helper, and regression/policy tests changed.

### Task 5: Disposable-branch workflow verification

**Files:**
- No repository file changes.

- [ ] **Step 1: Push the implementation branch and a fresh target branch**

Use a new target branch created from the updated master/tooling commit so the source target change produces the BYOC deletion again:

```bash
git push -u origin HEAD
git push origin HEAD:refs/heads/ci/idempotent-batch-publication-test-20260715
```

- [ ] **Step 2: Dispatch the Guides workflow from the implementation ref**

```bash
gh workflow run fetch-docs.yml \
  --repo zilliztech/zdoc \
  --ref "$(git branch --show-current)" \
  -f group=guides \
  -f artifact_retention_days=3 \
  -f target_branch=ci/idempotent-batch-publication-test-20260715 \
  -f publish=true \
  -f tooling_ref="$(git branch --show-current)"
```

- [ ] **Step 3: Monitor the publication and final verification jobs**

```bash
run_id=$(gh run list --repo zilliztech/zdoc --workflow fetch-docs.yml --branch "$(git branch --show-current)" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run_id" --repo zilliztech/zdoc --exit-status
gh run view "$run_id" --repo zilliztech/zdoc --json status,conclusion,url,jobs
```

Expected:

- translation batch jobs still execute in parallel;
- batch 1 commits the source-reconciliation deletion;
- later batches log that repeated deletions are already applied;
- every non-empty batch publishes or returns `no_changes` without a pathspec failure;
- final verification passes;
- aggregate completes successfully.

- [ ] **Step 4: Record the run URL and residual risk**

Document the successful run URL in the implementation handoff. Note that the disposable target branch contains generated test content and should be removed only with explicit approval.
