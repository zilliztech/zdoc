# Lark Drive Fallback Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Drive folder references and fallback document objects internally consistent when Feishu exposes a renamed or moved child in a folder listing before that child's document body is available.

**Architecture:** Treat a child token from a Drive folder listing as authoritative only after a JSON object for that token has been fetched. When the listing contains a dangling replacement token, retain the fully materialized fallback document token and replace the dangling folder edge with that fallback edge. After reconciliation, validate every touched folder edge before rendering so failures identify the inconsistent parent and child rather than surfacing later as `Cannot find <token>`.

**Tech Stack:** Node.js, Feishu Drive JSON cache, existing `larkUtils` fallback merger, `node:assert`, Docusaurus Lark-doc generation.

---

## File map

- Modify `plugins/lark-docs/larkUtils.js`: make child-token replacement materialization-aware and validate touched Drive edges.
- Modify `plugins/lark-docs/larkUtils.test.js`: reproduce the `FieldSchema` old-folder/new-folder partial snapshot and verify deterministic reconciliation.
- Verify `plugins/lark-docs/larkDriveWriter.js`: no lookup fallback or silent-skipping change is required; it should receive a consistent source graph.
- Verify `scripts/docs-workflow/run-content-group.js`: use the existing Python command sequence for live integration verification.

### Task 1: Reproduce the partial Feishu hierarchy transition

**Files:**
- Modify: `plugins/lark-docs/larkUtils.test.js:1-150`

- [ ] **Step 1: Add a regression fixture matching the failed migration shape**

Add a new test function before the preprocessing tests:

```js
function testDriveFallbackRetainsMaterializedTokenWhenReplacementBodyIsMissing() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'NEW_DOC_TOKEN', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'OLD_DOC_TOKEN', parent_token: 'OLD_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(fallbackDir, 'OLD_DOC_TOKEN', {
      token: 'OLD_DOC_TOKEN',
      name: 'construct_from_dict()',
      slug: 'FieldSchema-construct_from_dict',
      type: 'docx',
      parent_token: 'OLD_FIELD_FOLDER',
      blocks: { items: [{ block_id: 'fallback-page', block_type: 1 }] },
    });

    new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT');

    const fieldSchema = readJson(sourceDir, 'NEW_FIELD_FOLDER');
    assert.deepEqual(fieldSchema.children.map(child => child.token), ['OLD_DOC_TOKEN']);
    const document = readJson(sourceDir, 'OLD_DOC_TOKEN');
    assert.equal(document.token, 'OLD_DOC_TOKEN');
    assert.equal(document.parent_token, 'NEW_FIELD_FOLDER');
    assert.equal(fs.existsSync(path.join(sourceDir, 'NEW_DOC_TOKEN.json')), false);
  });
}
```

- [ ] **Step 2: Register the test in `run()`**

```js
testDriveFallbackRetainsMaterializedTokenWhenReplacementBodyIsMissing();
```

- [ ] **Step 3: Run the test and verify the current merger fails**

```bash
node plugins/lark-docs/larkUtils.test.js
```

Expected: FAIL because the folder edge and serialized fallback document do not retain one resolvable token identity under this partial snapshot.

- [ ] **Step 4: Commit the failing reproduction**

```bash
git add plugins/lark-docs/larkUtils.test.js
git commit -m "test(lark-docs): reproduce partial Drive token migration"
```

### Task 2: Only adopt replacement child tokens with materialized bodies

**Files:**
- Modify: `plugins/lark-docs/larkUtils.js:217-380`

- [ ] **Step 1: Index the fetched source objects once**

After `sources` is constructed, add:

```js
const sourcesByToken = new Map(sources.map(source => [source[TOKEN], source]))
```

- [ ] **Step 2: Add a materialization predicate**

Near `folderSource` and `docSource`, add:

```js
const materializedPair = pair => pair && sourcesByToken.has(pair[TOKEN])
```

- [ ] **Step 3: Keep a fallback child when the listed replacement has no fetched object**

In the loop that reconciles `fallback.children` with `source.children`, replace the unconditional `if (pair)` branch with:

```js
const pairIndex = source.children.findIndex(s => s[TITLE] === child[TITLE])
const pair = pairIndex === -1 ? null : source.children[pairIndex]

if (materializedPair(pair)) {
  recordReplacement(child[TOKEN], pair[TOKEN])
  child[PARENT] = pair[PARENT]
  child.url = pair.url
  child[TOKEN] = pair[TOKEN]
} else {
  child[PARENT] = source[TOKEN]
  if (pairIndex === -1) source.children.push(child)
  else source.children.splice(pairIndex, 1, child)
}
```

Do not record `OLD_DOC_TOKEN -> NEW_DOC_TOKEN` merely because `NEW_DOC_TOKEN` appears in folder metadata. The replacement becomes valid only when `NEW_DOC_TOKEN.json` was fetched and parsed into `sources`.

- [ ] **Step 4: Run the fallback regression suite**

```bash
node plugins/lark-docs/larkUtils.test.js
```

Expected: PASS. The existing fully materialized `ClientConfig` replacement test must also remain green, proving valid replacements still use the current source token and blocks.

- [ ] **Step 5: Commit the minimal reconciliation fix**

```bash
git add plugins/lark-docs/larkUtils.js plugins/lark-docs/larkUtils.test.js
git commit -m "fix(lark-docs): retain materialized fallback Drive tokens"
```

### Task 3: Fail early when a touched fallback folder still has a dangling child

**Files:**
- Modify: `plugins/lark-docs/larkUtils.js:268-380`
- Modify: `plugins/lark-docs/larkUtils.test.js`

- [ ] **Step 1: Track folders changed by fallback reconciliation**

Near `replacesByToken`, add:

```js
const touchedFolderTokens = new Set()
```

Whenever `sourceRoot.children` or a matched `source.children` array is changed, add its token:

```js
touchedFolderTokens.add(source[TOKEN])
```

Use `sourceRoot[TOKEN]` for root-level changes.

- [ ] **Step 2: Add a post-write Drive edge validator**

After writing fallback sources, add:

```js
if (sourceType === 'drive') {
  const merged = fs.readdirSync(docSourceDir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(node_path.join(docSourceDir, file), 'utf8')))
  const mergedByToken = new Map(merged.map(source => [source[TOKEN], source]))

  for (const folderToken of touchedFolderTokens) {
    const folder = mergedByToken.get(folderToken)
    if (!folder) throw new Error(`[fallback-source] Missing reconciled folder ${folderToken}`)
    for (const child of folder.children || []) {
      if (!mergedByToken.has(child[TOKEN])) {
        throw new Error(`[fallback-source] Unresolved child ${child[TOKEN]} under ${folderToken}`)
      }
    }
  }
}
```

This check is deliberately limited to folders touched by fallback merging; it does not broaden validation to unrelated legacy cache structures.

- [ ] **Step 3: Add a missing-both-sides diagnostic test**

Duplicate the partial-migration fixture but omit `OLD_DOC_TOKEN.json` from the fallback directory. Assert:

```js
assert.throws(
  () => new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT'),
  /\[fallback-source\] Unresolved child OLD_DOC_TOKEN under NEW_FIELD_FOLDER/,
);
```

- [ ] **Step 4: Run the utility and writer lookup tests**

```bash
node plugins/lark-docs/larkUtils.test.js
node --test plugins/lark-docs/larkSourceIndex.test.js plugins/lark-docs/larkDocWriter.test.js
```

Expected: PASS. Existing source-index ambiguity and secure file-loading tests must remain unchanged.

- [ ] **Step 5: Commit fail-fast validation**

```bash
git add plugins/lark-docs/larkUtils.js plugins/lark-docs/larkUtils.test.js
git commit -m "fix(lark-docs): validate reconciled Drive child edges"
```

### Task 4: Verify the Python production sequence

**Files:**
- Verify only: `scripts/docs-workflow/run-content-group.js:20-28`
- Verify generated sources: `plugins/lark-docs/meta/sources/python/v3.0.x`

- [ ] **Step 1: Run the complete Python producer in the implementation worktree**

With the normal Feishu and image-storage credentials available, run:

```bash
node scripts/docs-workflow/run-content-group.js --group python
```

Expected: exit 0. The output must not contain:

```text
Cannot find DCLUdOpVjohl8HxPUx1cGjokngf
```

- [ ] **Step 2: Verify the moved document resolves in the v3 cache**

```bash
node -e "const fs=require('fs'),p='plugins/lark-docs/meta/sources/python/v3.0.x'; const matches=fs.readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(p+'/'+f,'utf8'))).filter(x=>x.token==='DCLUdOpVjohl8HxPUx1cGjokngf'); if(matches.length!==1) throw new Error('expected exactly one construct_from_dict source'); console.log(matches[0].parent_token)"
```

Expected: exactly one match and a valid current `FieldSchema` parent token.

- [ ] **Step 3: Inspect generated changes rather than discarding them automatically**

```bash
git status --short
git diff --check
```

Expected: no whitespace errors. Separate source-content drift from code/test changes; do not commit live generated-doc changes unless the publication workflow requires them.

- [ ] **Step 4: Run the Python workflow command-shape tests**

```bash
node --test scripts/docs-workflow/run-content-group.test.js scripts/docs-workflow/content-groups.test.js
```

Expected: PASS; the production sequence remains v2.4/v2.5/v2.6/v3 with the existing v3 fallback source.

### Task 5: Validate downstream `zdoc_cn` compatibility

**Files:**
- Verify in downstream repository: `../zdoc_cn/upstream.lock`
- Verify in downstream repository: `../zdoc_cn/scripts/upstream/assemble.js`

- [ ] **Step 1: Make the upstream fix commit available to a disposable downstream branch**

Update `../zdoc_cn/upstream.lock` in that branch to the final upstream fix SHA. Do not include this lock change in the `zdoc` pull request.

- [ ] **Step 2: Run downstream workflow synchronization checks**

From `../zdoc_cn`:

```bash
pnpm run upstream:check-workflows
pnpm run test:docs-workflow
```

Expected: PASS, or a clearly scoped workflow snapshot update if upstream-owned workflow files are intentionally mirrored.

- [ ] **Step 3: Build the downstream assembled site against the fixed upstream commit**

```bash
pnpm run build:assembled
```

Expected: PASS. This verifies that upstream Python source reconciliation does not remove or duplicate pages consumed by the Chinese documentation assembly.

- [ ] **Step 4: Final upstream verification and review**

Back in `zdoc`, run:

```bash
node plugins/lark-docs/larkUtils.test.js
node --test plugins/lark-docs/larkSourceIndex.test.js plugins/lark-docs/larkDocWriter.test.js scripts/docs-workflow/run-content-group.test.js scripts/docs-workflow/content-groups.test.js
git diff --check
git status --short
```

Expected: all tests pass and only the planned source/test files remain changed.
