# MDX Code Span Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Docusaurus SSG render failures caused by `{placeholder}` text and nested formatting tags inside JSX/HTML `<code>` spans.

**Architecture:** Add one shared normalization function in `plugins/mdx-parse/mdxPatcher.js` that operates outside fenced code blocks, strips nested tags from `<code>...</code>` spans, and escapes braces inside those spans. Use that shared function from both the mdx-parse CLI patch path and `larkDocWriter.js`, then add validation so unnormalized code spans are caught before Docusaurus SSG render time.

**Tech Stack:** Node.js CommonJS modules, `@mdx-js/mdx` dynamic import, built-in `node:assert/strict`, existing Docusaurus MDX patcher.

---

## File Structure

- Modify: `plugins/mdx-parse/mdxPatcher.js`
  - Owns shared MDX patching helpers.
  - Add `normalizeCodeTagContent(content)`.
  - Add `findUnnormalizedCodeTags(content)` for validation.
  - Call normalization inside `applyMdxPatches()` before MDX compilation.
  - Export the new helper for reuse by `larkDocWriter.js` and tests.
- Modify: `plugins/lark-docs/larkDocWriter.js`
  - Import `normalizeCodeTagContent` from `plugins/mdx-parse/mdxPatcher.js`.
  - Call it inside `__mdx_patches()` so generated Lark docs receive the same normalization as the CLI patcher.
- Create: `plugins/mdx-parse/mdxPatcher.test.js`
  - Uses Node built-in assertions.
  - Tests normalization, validation guard, MDX compiled output, fenced-code preservation, and `larkDocWriter.__mdx_patches()` integration.

Do not create a git commit during execution unless the user explicitly asks for one.

---

### Task 1: Add the failing regression test

**Files:**
- Create: `plugins/mdx-parse/mdxPatcher.test.js`

- [ ] **Step 1: Write the failing test file**

Create `plugins/mdx-parse/mdxPatcher.test.js` with this exact content:

```js
const assert = require('node:assert/strict');
const {
    applyMdxPatches,
    validateMdxStructure,
    normalizeCodeTagContent,
} = require('./mdxPatcher');
const LarkDocWriter = require('../lark-docs/larkDocWriter');

const failingCodeSpan = '<p><code><i>http</i>s://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>';
const normalizedCodeSpan = '<p><code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code></p>';

async function compileToString(content) {
    const { compile } = await import('@mdx-js/mdx');
    return String(await compile(content, { development: false }));
}

async function testNormalizeCodeTagContent() {
    assert.equal(
        normalizeCodeTagContent(failingCodeSpan),
        normalizedCodeSpan,
    );
}

async function testNormalizationPreservesFencedCodeBlocks() {
    const fenced = [
        '```mdx',
        failingCodeSpan,
        '```',
    ].join('\n');

    assert.equal(normalizeCodeTagContent(fenced), fenced);
}

async function testApplyMdxPatchesAvoidsRuntimeExpressions() {
    const patched = await applyMdxPatches(failingCodeSpan);
    assert.equal(patched, normalizedCodeSpan);

    const compiled = await compileToString(patched);
    assert.ok(!compiled.includes('cluster - id'));
    assert.ok(!compiled.includes(' region,'));
    assert.ok(compiled.includes('https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com'));
}

async function testValidationGuardFlagsUnnormalizedCodeTags() {
    const errors = validateMdxStructure(failingCodeSpan);
    assert.ok(errors.some(error => error.includes('unnormalized JSX <code> tag')));

    const normalizedErrors = validateMdxStructure(normalizedCodeSpan);
    assert.ok(!normalizedErrors.some(error => error.includes('unnormalized JSX <code> tag')));
}

async function testLarkDocWriterUsesSharedNormalization() {
    const writer = new LarkDocWriter('', '', 'pythonSidebar');
    const patched = await writer.__mdx_patches(failingCodeSpan);
    assert.equal(patched, normalizedCodeSpan);
}

async function run() {
    await testNormalizeCodeTagContent();
    await testNormalizationPreservesFencedCodeBlocks();
    await testApplyMdxPatchesAvoidsRuntimeExpressions();
    await testValidationGuardFlagsUnnormalizedCodeTags();
    await testLarkDocWriterUsesSharedNormalization();
    console.log('mdxPatcher regression tests passed');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
```

- [ ] **Step 2: Run the test and verify it fails before implementation**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: the command exits non-zero because `normalizeCodeTagContent` is not exported yet. The failure should be a `TypeError` similar to:

```text
TypeError: normalizeCodeTagContent is not a function
```

---

### Task 2: Implement shared code-span normalization and guard helpers

**Files:**
- Modify: `plugins/mdx-parse/mdxPatcher.js:77-120`
- Modify: `plugins/mdx-parse/mdxPatcher.js:228-270`
- Modify: `plugins/mdx-parse/mdxPatcher.js:280-285`
- Modify: `plugins/mdx-parse/mdxPatcher.js:450-456`
- Test: `plugins/mdx-parse/mdxPatcher.test.js`

- [ ] **Step 1: Add helpers after `escapeCurrencyDollars()`**

In `plugins/mdx-parse/mdxPatcher.js`, insert this code immediately after the closing brace of `escapeCurrencyDollars(content)`:

```js
function transformOutsideFencedCodeBlocks(content, transform) {
    const lines = content.split('\n');
    const result = [];
    let pending = [];
    let inCodeBlock = false;

    const flushPending = () => {
        if (pending.length > 0) {
            result.push(transform(pending.join('\n')));
            pending = [];
        }
    };

    for (const line of lines) {
        const stripped = line.trim();
        if (stripped.startsWith('```') || stripped.startsWith('~~~')) {
            if (!inCodeBlock) {
                flushPending();
                inCodeBlock = true;
                result.push(line);
            } else {
                result.push(line);
                inCodeBlock = false;
            }
            continue;
        }

        if (inCodeBlock) {
            result.push(line);
        } else {
            pending.push(line);
        }
    }

    flushPending();
    return result.join('\n');
}

function stripTagsFromCodeContent(inner) {
    return inner.replace(/<\/?[A-Za-z][^>]*>/g, '');
}

function escapeCodeContentBraces(inner) {
    return inner.replace(/(?<!\\)([{}])/g, '\\$1');
}

function normalizeSingleCodeTag(match, attrs = '', inner) {
    const stripped = stripTagsFromCodeContent(inner);
    const escaped = escapeCodeContentBraces(stripped);
    return `<code${attrs}>${escaped}</code>`;
}

function normalizeCodeTagContent(content) {
    return transformOutsideFencedCodeBlocks(content, segment => {
        return segment.replace(/<code(\s[^>]*)?>([\s\S]*?)<\/code>/g, normalizeSingleCodeTag);
    });
}

function findUnnormalizedCodeTags(content) {
    const findings = [];

    transformOutsideFencedCodeBlocks(content, segment => {
        segment.replace(/<code(\s[^>]*)?>([\s\S]*?)<\/code>/g, (match, attrs = '', inner) => {
            const stripped = stripTagsFromCodeContent(inner);
            const hasNestedTags = stripped !== inner;
            const hasUnescapedBraces = /(?<!\\)[{}]/.test(stripped);

            if (hasNestedTags || hasUnescapedBraces) {
                findings.push({
                    snippet: match.replace(/\s+/g, ' ').slice(0, 120),
                    hasNestedTags,
                    hasUnescapedBraces,
                });
            }

            return match;
        });

        return segment;
    });

    return findings;
}
```

- [ ] **Step 2: Add the validation guard to `validateMdxStructure()`**

In `plugins/mdx-parse/mdxPatcher.js`, inside `validateMdxStructure(content)`, place this block after the unrestored placeholder check and before the tag-balance loop:

```js
    // Check 4: JSX <code> spans must render literal code text.
    // MDX treats `{placeholder}` inside JSX children as JavaScript expressions,
    // and nested formatting tags like <i> split code text into JSX children.
    const unnormalizedCodeTags = findUnnormalizedCodeTags(content);
    if (unnormalizedCodeTags.length > 0) {
        errors.push(`unnormalized JSX <code> tag(s) found (${unnormalizedCodeTags.length} span(s) with nested tags or unescaped braces)`);
    }
```

Then change the existing nearby comment:

```js
    // Check 4: tag balance for <Tabs> and <TabItem> (outside code blocks)
```

to:

```js
    // Check 5: tag balance for <Tabs> and <TabItem> (outside code blocks)
```

- [ ] **Step 3: Call normalization inside `applyMdxPatches()`**

In `plugins/mdx-parse/mdxPatcher.js`, change this block:

```js
        let patchedContent = removeTabsHallucinations(content);
        patchedContent = unescapeKnownJsxTags(patchedContent);
        patchedContent = escapeCurrencyDollars(patchedContent);
        patchedContent = escapeNonHtmlTags(patchedContent);
```

to:

```js
        let patchedContent = removeTabsHallucinations(content);
        patchedContent = unescapeKnownJsxTags(patchedContent);
        patchedContent = normalizeCodeTagContent(patchedContent);
        patchedContent = escapeCurrencyDollars(patchedContent);
        patchedContent = escapeNonHtmlTags(patchedContent);
```

- [ ] **Step 4: Export the new helpers**

At the bottom of `plugins/mdx-parse/mdxPatcher.js`, change the export block to:

```js
module.exports = {
    applyMdxPatches,
    validateMdxStructure,
    removeTabsHallucinations,
    unescapeKnownJsxTags,
    normalizeCodeTagContent,
    findUnnormalizedCodeTags,
};
```

- [ ] **Step 5: Run the regression test**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: the command still exits non-zero because `larkDocWriter.__mdx_patches()` has not been updated yet. The failing assertion should be in `testLarkDocWriterUsesSharedNormalization()`.

---

### Task 3: Reuse the shared normalization in larkDocWriter

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js:2`
- Modify: `plugins/lark-docs/larkDocWriter.js:997-1002`
- Test: `plugins/mdx-parse/mdxPatcher.test.js`

- [ ] **Step 1: Import `normalizeCodeTagContent`**

In `plugins/lark-docs/larkDocWriter.js`, change the import at the top from:

```js
const { removeTabsHallucinations, unescapeKnownJsxTags } = require('../mdx-parse/mdxPatcher')
```

to:

```js
const { removeTabsHallucinations, unescapeKnownJsxTags, normalizeCodeTagContent } = require('../mdx-parse/mdxPatcher')
```

- [ ] **Step 2: Call the shared normalizer in `__mdx_patches()`**

In `plugins/lark-docs/larkDocWriter.js`, change this block:

```js
            let patchedContent = removeTabsHallucinations(content);
            patchedContent = unescapeKnownJsxTags(patchedContent);
            patchedContent = this.__escape_currency_dollars(patchedContent);
            patchedContent = this.__escape_non_html_tags(patchedContent);
```

to:

```js
            let patchedContent = removeTabsHallucinations(content);
            patchedContent = unescapeKnownJsxTags(patchedContent);
            patchedContent = normalizeCodeTagContent(patchedContent);
            patchedContent = this.__escape_currency_dollars(patchedContent);
            patchedContent = this.__escape_non_html_tags(patchedContent);
```

- [ ] **Step 3: Run the regression test and verify it passes**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected output:

```text
MDX compilation succeeded after 0 fixes
MDX compilation succeeded after 0 fixes
mdxPatcher regression tests passed
```

The exact number of `MDX compilation succeeded after 0 fixes` lines may vary if logging changes, but the command must exit with status 0 and print `mdxPatcher regression tests passed`.

---

### Task 4: Verify the original failing page and full build path

**Files:**
- Read-only verification against `reference/api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_alias.md`
- Test: `plugins/mdx-parse/mdxPatcher.test.js`

- [ ] **Step 1: Run the focused test again**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: exit status 0 and output includes:

```text
mdxPatcher regression tests passed
```

- [ ] **Step 2: Verify `applyMdxPatches()` transforms the original failing page in memory**

Run:

```bash
node - <<'NODE'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { applyMdxPatches } = require('./plugins/mdx-parse/mdxPatcher');

(async () => {
    const file = 'reference/api/python/python/MilvusClient/MilvusClient-Collections/Collections-describe_alias.md';
    const input = fs.readFileSync(file, 'utf8');
    const patched = await applyMdxPatches(input);

    assert.ok(patched.includes('<code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code>'));
    assert.ok(patched.includes('<code>https://\\{cluster-id\\}.\\{region\\}.vectordb.zillizcloud.com:19530</code>'));
    assert.ok(patched.includes('<code>https://\\{project-id\\}.\\{region\\}.api.zillizcloud.com</code>'));
    assert.ok(!patched.includes('<code><i>http</i>s://{cluster-id}'));

    console.log('original failing page patches correctly in memory');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
NODE
```

Expected: exit status 0 and output includes:

```text
original failing page patches correctly in memory
```

- [ ] **Step 3: Run a Docusaurus build**

Run:

```bash
npm run build
```

Expected: exit status 0. The previous error must not appear:

```text
ReferenceError: cluster is not defined
```

If the build fails for another unrelated route, preserve the full error and do not claim the MDX code-span bug is fixed until the original route is verified not to fail.

---

## Self-Review Notes

- Spec coverage: Tasks cover stripping nested tags inside `<code>`, escaping braces inside `<code>`, sharing the behavior between `mdxPatcher.js` and `larkDocWriter.js`, adding a guard in `validateMdxStructure()`, and verifying the original failing page.
- Placeholder scan: No incomplete implementation markers are present in this plan.
- Type consistency: The planned function names are consistent: `normalizeCodeTagContent`, `findUnnormalizedCodeTags`, `stripTagsFromCodeContent`, and `escapeCodeContentBraces`.
- Scope: This is one focused patcher/guard change and does not refactor unrelated MDX escaping logic.
