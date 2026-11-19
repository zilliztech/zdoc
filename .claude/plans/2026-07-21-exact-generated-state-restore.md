# Exact Generated-State Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `restore-generated-state.sh --exact` reproduce the selected commit's generated index and working tree exactly, including deletions, while preventing the shell restore roots and Guides validator roots from drifting apart again.

**Architecture:** Keep `HEAD` pinned to the immutable master/tooling commit, but restore every managed generated root into both the Git index and working tree from the selected source commit. Preserve the existing non-exact branch behavior. Use cross-file tests to make the restore script's path list and the Guides validator's `RESTORE_PATHS` an enforced contract.

**Tech Stack:** Bash, Git pathspec operations, Node.js `node:test`, existing Guides staging validator.

---

## File map

- Modify `scripts/restore-generated-state.sh`: use deletion-aware index and worktree restoration in exact mode.
- Modify `scripts/restore-generated-state.test.js`: reproduce staged deletions, verify exact index equality, and enforce restore-root parity.
- Verify `scripts/docs-workflow/validate-guides-translation-staging.js`: no behavioral change expected; its strict inventory comparison remains the final proof.
- Modify `scripts/docs-workflow/validate-guides-translation-staging.test.js`: prove the restored deletion state is accepted without manually repairing the index.

### Task 1: Lock the shell and validator restore roots together

**Files:**
- Modify: `scripts/restore-generated-state.test.js:8-25`
- Verify: `scripts/docs-workflow/validate-guides-translation-staging.js:11-21`

- [ ] **Step 1: Import the validator's public restore-path list**

Add this import beside the existing checkpoint import:

```js
const { RESTORE_PATHS } = require('./docs-workflow/validate-guides-translation-staging')
```

- [ ] **Step 2: Add a parity assertion to the fixed-path test**

Extend `source preserves the fixed restore path list exactly` with:

```js
assert.deepEqual(actualPaths, RESTORE_PATHS)
```

This makes a future addition such as `plugins/lark-docs/meta/reports` fail locally unless both restore and validation surfaces are updated.

- [ ] **Step 3: Run the parity test**

```bash
node --test --test-name-pattern='fixed restore path list' scripts/restore-generated-state.test.js
```

Expected: PASS against the current tree, which already contains the reports allowlist fix from `113f8555c`.

- [ ] **Step 4: Commit the contract test**

```bash
git add scripts/restore-generated-state.test.js
git commit -m "test(ci): lock generated restore roots to validator"
```

### Task 2: Reproduce the stale-index deletion bug

**Files:**
- Modify: `scripts/restore-generated-state.test.js:25-125`

- [ ] **Step 1: Add inventory helpers**

Add these helpers after `git()`:

```js
function lines(value) {
  return value ? value.split('\n') : []
}

function indexInventory(cwd, relativePath) {
  return lines(git(cwd, 'ls-files', '-s', '--', relativePath))
    .map(entry => entry.replace(/ 0\t/, '\t'))
}

function treeInventory(cwd, commit, relativePath) {
  return lines(git(cwd, 'ls-tree', '-r', commit, '--', relativePath))
    .map(entry => entry.replace(' blob ', ' '))
}
```

- [ ] **Step 2: Add a failing exact-deletion regression test**

Add this test after `exact immutable ref mode removes managed paths absent from the source commit`:

```js
test('exact immutable ref mode makes the index equal a source tree that deletes files', () => {
  const fixture = createFixture()
  try {
    write(fixture.source, 'docs/keep.md', 'kept from source\n')
    fs.rmSync(path.join(fixture.source, 'docs/state.txt'))
    git(fixture.source, 'add', '-A', 'docs')
    git(fixture.source, 'commit', '-m', 'replace generated docs inventory')
    const sourceSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'dev')

    const result = run(fixture.work, ['--exact', '--ref', sourceSha])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.existsSync(path.join(fixture.work, 'docs/state.txt')), false)
    assert.equal(fs.readFileSync(path.join(fixture.work, 'docs/keep.md'), 'utf8'), 'kept from source\n')
    assert.deepEqual(
      indexInventory(fixture.work, 'docs'),
      treeInventory(fixture.work, sourceSha, 'docs'),
    )
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})
```

- [ ] **Step 3: Run the regression and verify the current implementation fails**

```bash
node --test --test-name-pattern='index equal a source tree' scripts/restore-generated-state.test.js
```

Expected: FAIL because `docs/state.txt` remains in `git ls-files -s` even though the source commit deleted it.

- [ ] **Step 4: Commit the failing test**

```bash
git add scripts/restore-generated-state.test.js
git commit -m "test(ci): reproduce stale exact-restore index"
```

### Task 3: Restore exact state into both index and working tree

**Files:**
- Modify: `scripts/restore-generated-state.sh:96-104`
- Modify: `scripts/restore-generated-state.test.js:60-72`

- [ ] **Step 1: Replace exact-mode checkout with deletion-aware restore**

Replace the restore loop with:

```bash
for restore_path in "${paths[@]}"; do
  source_has_path=false
  if git ls-tree --name-only "${resolved_ref}" -- "${restore_path}" | grep -Fxq "${restore_path}"; then
    source_has_path=true
  fi

  if [ "$exact" = true ]; then
    rm -rf -- "$restore_path"
    if [ "$source_has_path" = true ] || git ls-files -- "$restore_path" | grep -q .; then
      git restore --source="${resolved_ref}" --staged --worktree -- "$restore_path"
    else
      echo "[restore-generated-state] ${restore_path} not found on ${resolved_ref}; skipping"
    fi
  elif [ "$source_has_path" = true ]; then
    git checkout "${resolved_ref}" -- "$restore_path"
  else
    echo "[restore-generated-state] ${restore_path} not found on ${resolved_ref}; skipping"
  fi
done
```

`rm -rf` continues to remove untracked residue. `git restore --staged --worktree` then adds, updates, and deletes tracked entries so the index matches the selected tree. Non-exact mode retains the existing merge-like checkout behavior.

- [ ] **Step 2: Update the source-shape test**

Keep the assertion for the non-exact `git checkout`, and add:

```js
assert.match(script, /git restore --source="\$\{?resolved_ref\}?" --staged --worktree -- "\$\{?restore_path\}?"/)
```

Retain the existing `eval` prohibition.

- [ ] **Step 3: Run the focused restore suite**

```bash
node --test scripts/restore-generated-state.test.js
```

Expected: PASS, including deletion of an entire absent root, deletion within an existing root, immutable ancestry, unsafe ref rejection, and non-exact compatibility.

- [ ] **Step 4: Commit the implementation**

```bash
git add scripts/restore-generated-state.sh scripts/restore-generated-state.test.js
git commit -m "fix(ci): restore exact generated index with deletions"
```

### Task 4: Exercise the real Guides validator against script-restored deletions

**Files:**
- Modify: `scripts/docs-workflow/validate-guides-translation-staging.test.js:20-160`

- [ ] **Step 1: Add the restore script path and runner**

Add:

```js
const restoreScript = path.resolve('scripts/restore-generated-state.sh')

function restoreExact(repository, stagedSha) {
  return spawnSync('bash', [restoreScript, '--exact', '--ref', stagedSha], {
    cwd: repository,
    encoding: 'utf8',
    env: ENV,
  })
}
```

In the fixture, add a local `origin` pointing to the fixture repository so `--ref` can fetch the staged SHA:

```js
git(repository, 'remote', 'add', 'origin', repository)
```

- [ ] **Step 2: Replace the manually repaired deletion test with the production restore path**

Replace the manual checkout/unlink/add sequence for `deletion` with:

```js
git(deletion.repository, 'switch', '--detach', deletion.masterSha)
const restored = restoreExact(deletion.repository, deletion.stagedSha)
assert.equal(restored.status, 0, restored.stderr)
assert.equal(fs.existsSync(path.join(deletion.repository, 'reference', 'index.md')), false)
assert.equal(
  runGuidesTranslationValidation({
    ...deletion,
    executor() { return { status: 0, signal: null, stderr: '' } },
  }).result,
  'success',
)
```

- [ ] **Step 3: Run both affected suites**

```bash
node --test scripts/restore-generated-state.test.js scripts/docs-workflow/validate-guides-translation-staging.test.js
```

Expected: PASS. The strict validator must accept the script-produced index without test-only cleanup.

- [ ] **Step 4: Commit the integration regression**

```bash
git add scripts/docs-workflow/validate-guides-translation-staging.test.js
git commit -m "test(ci): validate restored Guides deletions end to end"
```

### Task 5: Run upstream and downstream verification

**Files:**
- Verify only: `.github/workflows/fetch_docs.yml`
- Verify only: downstream `../zdoc_cn`

- [ ] **Step 1: Run workflow-policy coverage**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: PASS; the workflow still invokes `restore-generated-state.sh --exact --ref` at the protected staging boundaries.

- [ ] **Step 2: Run the complete affected upstream test set**

```bash
node --test scripts/restore-generated-state.test.js scripts/docs-workflow/validate-guides-translation-staging.test.js scripts/validate-workflow-policy.test.js
```

Expected: PASS with zero skipped deletion regressions.

- [ ] **Step 3: Check downstream workflow compatibility**

From `../zdoc_cn`, run:

```bash
pnpm run upstream:check-workflows
pnpm run test:workflow-policy
```

Expected: PASS. If workflow synchronization reports a difference because the upstream helper is mirrored downstream, update the downstream workflow snapshot in a separate `zdoc_cn` change rather than mixing it into this upstream commit.

- [ ] **Step 4: Review the final diff**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only the planned upstream files changed.
