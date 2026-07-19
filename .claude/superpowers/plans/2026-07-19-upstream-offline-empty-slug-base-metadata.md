# Upstream Offline Empty-Slug Base Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix upstream `zilliztech/zdoc` so Guides offline rendering can resolve local Base metadata for section/ref nodes whose slug is intentionally empty.

**Architecture:** Keep the fix in the upstream `plugins/lark-docs` tooling. The existing metadata resolver already supports token-based lookup; the bug is that `__is_to_publish()` only calls it when `slug` is truthy, so the fix is to permit lookup when either `slug` or `token` is available.

**Tech Stack:** Node.js `node:test`, CommonJS, existing `plugins/lark-docs/larkDocWriter.js` offline rendering path.

---

## Context

The CN build failure is:

```text
Offline render metadata is missing for base:tblr7Zec2ReTfRmw:recvnetXkjza9X
```

The source artifact contains the metadata:

```json
{
  "node_token": "base:tblr7Zec2ReTfRmw:recvnetXkjza9X",
  "title": "文本嵌入模型",
  "slug": "",
  "base_nav_virtual": true,
  "base_placement_type": "section",
  "has_child": true
}
```

The current upstream code in `plugins/lark-docs/larkDocWriter.js` blocks lookup because of this guard:

```js
if (slug && fs.existsSync(this.docSourceDir)) {
    const baseSource = this.__fetch_base_source_meta(title, slug, token)
```

`__fetch_base_source_meta(title, slug, token)` already supports token lookup. The fix should remove the accidental slug-only precondition without allowing network fallback in offline mode.

## File Structure

- Modify: `plugins/lark-docs/offlineRender.test.js`
  - Add a regression test for an offline Base section node with empty slug and token metadata.
- Modify: `plugins/lark-docs/larkDocWriter.js`
  - Change the local metadata lookup condition from `slug && ...` to `(slug || token) && ...`.

No workflow or generated-content changes are part of this upstream fix.

---

### Task 1: Add Regression Test

**Files:**
- Modify: `plugins/lark-docs/offlineRender.test.js`

- [ ] **Step 1: Add the failing test**

Append this test after `offline writer rejects missing local Base metadata without querying Bitable`:

```js
test('offline writer resolves empty-slug Base section metadata by token', async () => {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-writer-section-'))
  fs.writeFileSync(path.join(sourceDir, 'section.json'), JSON.stringify({
    node_token: 'base:tblSection:recSection',
    origin_node_token: 'base:tblSection:recSection',
    title: 'Section',
    slug: '',
    base_nav_virtual: true,
    base_placement_type: 'section',
    has_child: true,
  }))
  const writer = new LarkDocWriter('root', 'base:*', 'default', sourceDir, 'static/img', 'zilliz.saas', true, false, null, {
    resolveFeishuImage() {}, resolveBoard() {}, resolveFigma() {},
  })
  let listed = false
  writer.__listed_docs = async () => { listed = true }
  try {
    const result = await writer.__is_to_publish('Section', '', 'base:tblSection:recSection')
    assert.deepEqual(result, {
      publish: true,
      title: 'Section',
      slug: '',
      beta: null,
      labels: 'Section',
    })
    assert.equal(listed, false)
  } finally {
    writer.destroy()
  }
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run from the upstream repo root:

```bash
node plugins/lark-docs/offlineRender.test.js
```

Expected before implementation: FAIL with `OFFLINE_METADATA_MISS`.

- [ ] **Step 3: Commit the failing test if using strict TDD**

```bash
git add plugins/lark-docs/offlineRender.test.js
git commit -m "test(lark-docs): cover empty slug offline base metadata"
```

If the branch convention avoids red commits, skip this commit and proceed directly to Task 2.

---

### Task 2: Allow Token-Based Offline Metadata Lookup

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`

- [ ] **Step 1: Implement the minimal fix**

Change this code in `__is_to_publish()`:

```js
if (slug && fs.existsSync(this.docSourceDir)) {
    const baseSource = this.__fetch_base_source_meta(title, slug, token)
```

to:

```js
if ((slug || token) && fs.existsSync(this.docSourceDir)) {
    const baseSource = this.__fetch_base_source_meta(title, slug, token)
```

Do not change `__fetch_base_source_meta()`. It already checks token first:

```js
if (token) {
    const tokenMatch = sources.find(source =>
        (source.base_record_id || source.base_nav_virtual) &&
        (source.node_token === token || source.origin_node_token === token || source.token === token)
    )
    if (tokenMatch) return tokenMatch
}
```

- [ ] **Step 2: Run the focused test and verify it passes**

```bash
node plugins/lark-docs/offlineRender.test.js
```

Expected: PASS.

- [ ] **Step 3: Commit the implementation**

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/offlineRender.test.js
git commit -m "fix(lark-docs): resolve offline base metadata by token"
```

If Task 1 was not committed separately, this single commit should include both the test and implementation.

---

### Task 3: Verify Related Offline and Workflow Tests

**Files:**
- No source changes.

- [ ] **Step 1: Run related plugin tests**

```bash
node plugins/lark-docs/offlineRender.test.js
node plugins/lark-docs/offlineMediaResolver.test.js
node plugins/lark-docs/larkDocWriter.media-prefetch.test.js
```

Expected: all PASS.

- [ ] **Step 2: Run Guides workflow table-render tests**

```bash
node --test scripts/docs-workflow/render-guides-table.test.js scripts/docs-workflow/guides-tables.test.js scripts/docs-workflow/guides-stage-artifact.test.js
```

Expected: all PASS.

- [ ] **Step 3: Run the broader workflow policy tests**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/generate-guides-sidebars.test.js
```

Expected: all PASS.

---

### Task 4: Reproduce the CN Failure Shape Against Upstream Tooling

**Files:**
- No committed source changes.

- [ ] **Step 1: Create a temporary fixture outside the repo**

```bash
mkdir -p /tmp/zdoc-empty-slug-offline/plugins/lark-docs/meta/sources/guides
cat > /tmp/zdoc-empty-slug-offline/plugins/lark-docs/meta/sources/guides/section.json <<'JSON'
{
  "node_token": "base:tblSection:recSection",
  "origin_node_token": "base:tblSection:recSection",
  "title": "Section",
  "slug": "",
  "base_nav_virtual": true,
  "base_placement_type": "section",
  "has_child": true
}
JSON
```

- [ ] **Step 2: Run a direct Node smoke test in upstream**

```bash
node - <<'NODE'
const assert = require('node:assert/strict')
const LarkDocWriter = require('./plugins/lark-docs/larkDocWriter')
;(async () => {
  const writer = new LarkDocWriter(
    'root',
    'base:*',
    'default',
    '/tmp/zdoc-empty-slug-offline/plugins/lark-docs/meta/sources/guides',
    'static/img',
    'zilliz.saas',
    true,
    false,
    null,
    { resolveFeishuImage() {}, resolveBoard() {}, resolveFigma() {} },
  )
  try {
    const result = await writer.__is_to_publish('Section', '', 'base:tblSection:recSection')
    assert.equal(result.publish, true)
    assert.equal(result.slug, '')
    console.log('empty slug token lookup ok')
  } finally {
    writer.destroy()
  }
})().catch(error => {
  console.error(error)
  process.exit(1)
})
NODE
```

Expected: prints `empty slug token lookup ok`.

---

### Task 5: Prepare Upstream PR Evidence

**Files:**
- No source changes.

- [ ] **Step 1: Confirm diff is minimal**

```bash
git diff --stat
git diff -- plugins/lark-docs/larkDocWriter.js plugins/lark-docs/offlineRender.test.js
```

Expected diff shape:

```text
plugins/lark-docs/larkDocWriter.js      | 2 +-
plugins/lark-docs/offlineRender.test.js | regression test added
```

- [ ] **Step 2: Draft PR summary**

Use this PR body:

```markdown
## Summary

- Allow offline Base metadata lookup when a node has a token but an intentionally empty slug.
- Add regression coverage for empty-slug Base section metadata.

## Why

Guides Base `section`/`ref` navigation rows can intentionally omit slugs. The offline renderer already supports token lookup in `__fetch_base_source_meta()`, but `__is_to_publish()` gated local metadata lookup on `slug`, so offline table rendering could throw `OFFLINE_METADATA_MISS` even when the local source artifact contained the correct Base metadata.

## Validation

- `node plugins/lark-docs/offlineRender.test.js`
- `node plugins/lark-docs/offlineMediaResolver.test.js`
- `node plugins/lark-docs/larkDocWriter.media-prefetch.test.js`
- `node --test scripts/docs-workflow/render-guides-table.test.js scripts/docs-workflow/guides-tables.test.js scripts/docs-workflow/guides-stage-artifact.test.js`
- `node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/generate-guides-sidebars.test.js`
```

---

## Self-Review

- Spec coverage: The plan fixes the exact upstream bug exposed by the CN build: offline metadata lookup for empty-slug Base section/ref nodes.
- Placeholder scan: No placeholders remain.
- Type/signature consistency: The plan uses existing `LarkDocWriter` constructor arguments and existing `__is_to_publish(title, slug, token)` signature.

