# Lark Code Variant Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add indented, Docusaurus-style comment directives for target-specific code lines and regions while preserving intentional code whitespace and remaining compatible with existing `<include>` and `<exclude>` code tags.

**Architecture:** Introduce a pure `codeVariantFilter` module with a whole-line comment-directive pass followed by a line-aware legacy-tag pass. Call it from `larkDocWriter.__code()` before code splitting, tab construction, and fence generation; leave the generic prose filter unchanged.

**Tech Stack:** Node.js 20+, CommonJS, `node:test`, `node:assert/strict`, the existing `larkDocWriter` and MDX fence helpers.

---

## File structure

- Create `plugins/lark-docs/codeVariantFilter.js`: parse and apply comment directives and compatibility HTML tags to raw code text.
- Create `plugins/lark-docs/codeVariantFilter.test.js`: focused unit tests for selection, whitespace, nesting, wrappers, and diagnostics.
- Modify `plugins/lark-docs/larkDocWriter.js:1-15,2218-2226`: import the filter and apply it before code-block splitting/fencing.
- Modify `plugins/lark-docs/larkDocWriter.test.js:500-556,723-751`: add writer-level proof that filtered code reaches fences and language tabs without blank-line damage.
- Create `plugins/lark-docs/CODE_VARIANTS.md`: authoring contract, preferred syntax, compatibility policy, and migration guidance.
- Validate `/Users/anthony/Documents/projects/zdoc_cn/plugins/lark-docs/`: confirm the pure module and narrow writer call site can be synchronized without depending on upstream-only writer changes.

### Task 1: Build the comment-directive preprocessor

**Files:**
- Create: `plugins/lark-docs/codeVariantFilter.test.js`
- Create: `plugins/lark-docs/codeVariantFilter.js`

- [ ] **Step 1: Write failing tests for indented next-line directives**

Create `plugins/lark-docs/codeVariantFilter.test.js` with these first tests:

```javascript
'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { filterCodeVariants } = require('./codeVariantFilter')

test('filters indented hash next-line directives without blank lines', () => {
  const source = [
    'params={',
    '    "provider": "openai",',
    '    # include-next-line zilliz',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '    # include-next-line milvus',
    '    "credential": "YOUR_API_KEY",',
    '}',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'params={',
    '    "provider": "openai",',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '}',
  ].join('\n'))

  assert.equal(filterCodeVariants(source, 'milvus'), [
    'params={',
    '    "provider": "openai",',
    '    "credential": "YOUR_API_KEY",',
    '}',
  ].join('\n'))
})

test('filters indented slash next-line exclusions', () => {
  const source = [
    'client.search({',
    '    collectionName: "docs",',
    '    // exclude-next-line paas',
    '    serverlessOnly: true,',
    '    limit: 10,',
    '})',
  ].join('\n')

  assert.doesNotMatch(filterCodeVariants(source, 'zilliz.paas'), /serverlessOnly/)
  assert.match(filterCodeVariants(source, 'zilliz.saas'), /    serverlessOnly: true,/)
})
```

- [ ] **Step 2: Run the focused tests and verify they fail because the module is missing**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
```

Expected: FAIL with `Cannot find module './codeVariantFilter'`.

- [ ] **Step 3: Implement target matching and whole-line directive parsing**

Create `plugins/lark-docs/codeVariantFilter.js` with this foundation:

```javascript
'use strict'

const DIRECTIVE_BODY = '(include|exclude)-(next-line|start|end)(?:\\s+([A-Za-z0-9._-]+))?'
const COMMENT_PATTERNS = [
  new RegExp(`^(\\s*)#\\s*${DIRECTIVE_BODY}\\s*$`, 'i'),
  new RegExp(`^(\\s*)//\\s*${DIRECTIVE_BODY}\\s*$`, 'i'),
  new RegExp(`^(\\s*)/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\s*$`, 'i'),
  new RegExp(`^(\\s*)<!--\\s*${DIRECTIVE_BODY}\\s*-->\\s*$`, 'i'),
  new RegExp(`^(\\s*)\\{/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\}\\s*$`, 'i'),
]

function activeTargetParts(targets) {
  return new Set(String(targets || '')
    .toLowerCase()
    .split('.')
    .map(part => part.trim())
    .filter(Boolean))
}

function targetMatches(target, parts) {
  return parts.has(String(target || '').trim().toLowerCase())
}

function directiveEnabled(kind, target, parts) {
  const match = targetMatches(target, parts)
  return kind === 'include' ? match : !match
}

function parseCommentDirective(line, lineNumber) {
  for (const pattern of COMMENT_PATTERNS) {
    const match = line.match(pattern)
    if (!match) continue

    const [, indent, rawKind, rawOperation, rawTarget] = match
    const kind = rawKind.toLowerCase()
    const operation = rawOperation.toLowerCase()
    const target = rawTarget ? rawTarget.toLowerCase() : null

    if (operation !== 'end' && !target) {
      throw new Error(`Code variant ${kind}-${operation} requires a target at line ${lineNumber}`)
    }
    if (operation === 'end' && target) {
      throw new Error(`Code variant ${kind}-end must not specify a target at line ${lineNumber}`)
    }

    return { indent, kind, operation, target, lineNumber }
  }
  return null
}
```

- [ ] **Step 4: Implement the next-line state machine**

Add the comment pass below `parseCommentDirective()`:

```javascript
function filterCommentDirectives(content, targets) {
  const input = String(content ?? '').replace(/\r\n/g, '\n')
  const hadTrailingNewline = input.endsWith('\n')
  const lines = input.split('\n')
  if (hadTrailingNewline) lines.pop()

  const parts = activeTargetParts(targets)
  const regions = []
  const output = []
  let nextLine = null

  const regionsEnabled = () => regions.every(region => region.enabled)

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1
    const line = lines[index]
    const directive = parseCommentDirective(line, lineNumber)

    if (directive) {
      if (nextLine) {
        throw new Error(`Code variant ${nextLine.kind}-next-line at line ${nextLine.lineNumber} must be followed by a code line`)
      }

      if (directive.operation === 'next-line') {
        nextLine = {
          ...directive,
          enabled: directiveEnabled(directive.kind, directive.target, parts),
        }
        continue
      }

      if (directive.operation === 'start') {
        regions.push({
          ...directive,
          enabled: directiveEnabled(directive.kind, directive.target, parts),
        })
        continue
      }

      const current = regions.at(-1)
      if (!current || current.kind !== directive.kind) {
        throw new Error(`Code variant ${directive.kind}-end at line ${lineNumber} does not match an open ${directive.kind}-start`)
      }
      if (current.indent !== directive.indent) {
        throw new Error(`Code variant ${directive.kind}-end indentation at line ${lineNumber} does not match line ${current.lineNumber}`)
      }
      regions.pop()
      continue
    }

    const enabled = regionsEnabled() && (!nextLine || nextLine.enabled)
    if (enabled) output.push(line)
    nextLine = null
  }

  if (nextLine) {
    throw new Error(`Code variant ${nextLine.kind}-next-line at line ${nextLine.lineNumber} has no following code line`)
  }
  if (regions.length > 0) {
    const current = regions.at(-1)
    throw new Error(`Code variant ${current.kind}-start at line ${current.lineNumber} has no matching ${current.kind}-end`)
  }

  const rendered = output.join('\n')
  return hadTrailingNewline && rendered ? `${rendered}\n` : rendered
}
```

- [ ] **Step 5: Export a temporary comment-only public function**

Add this initial export at the bottom of `codeVariantFilter.js`:

```javascript
function filterCodeVariants(content, targets) {
  return filterCommentDirectives(content, targets)
}

module.exports = {
  filterCodeVariants,
}
```

- [ ] **Step 6: Run the focused tests and verify next-line behavior passes**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
```

Expected: 2 tests PASS.

- [ ] **Step 7: Commit the next-line parser**

```bash
git add plugins/lark-docs/codeVariantFilter.js plugins/lark-docs/codeVariantFilter.test.js
git commit -m "feat(lark-docs): add code variant comments"
```

### Task 2: Add regions, wrappers, whitespace guarantees, and diagnostics

**Files:**
- Modify: `plugins/lark-docs/codeVariantFilter.test.js`
- Modify: `plugins/lark-docs/codeVariantFilter.js`

- [ ] **Step 1: Add tests for nested regions and intentional blank lines**

Append:

```javascript
test('filters nested regions while preserving intentional active blank lines', () => {
  const source = [
    'client.search(',
    '    collection_name="docs",',
    '    # include-start zilliz',
    '    project_id="YOUR_PROJECT_ID",',
    '    # exclude-start paas',
    '    serverless_only=True,',
    '    # exclude-end',
    '    region_id="YOUR_REGION_ID",',
    '    # include-end',
    '',
    '    limit=10,',
    ')',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.paas'), [
    'client.search(',
    '    collection_name="docs",',
    '    project_id="YOUR_PROJECT_ID",',
    '    region_id="YOUR_REGION_ID",',
    '',
    '    limit=10,',
    ')',
  ].join('\n'))

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'client.search(',
    '    collection_name="docs",',
    '    project_id="YOUR_PROJECT_ID",',
    '    serverless_only=True,',
    '    region_id="YOUR_REGION_ID",',
    '',
    '    limit=10,',
    ')',
  ].join('\n'))
})
```

- [ ] **Step 2: Add tests for every supported comment wrapper**

Append:

```javascript
test('recognizes supported whole-line comment wrappers', () => {
  const cases = [
    ['    # include-next-line zilliz', '    python=True'],
    ['    // include-next-line zilliz', '    javascript: true,'],
    ['    /* include-next-line zilliz */', '    css: true;'],
    ['    <!-- include-next-line zilliz -->', '    <input enabled>'],
    ['    {/* include-next-line zilliz */}', '    <Widget enabled />'],
  ]

  for (const [directive, code] of cases) {
    assert.equal(filterCodeVariants(`${directive}\n${code}`, 'zilliz.saas'), code)
    assert.equal(filterCodeVariants(`${directive}\n${code}`, 'milvus'), '')
  }
})

test('does not parse directive words embedded in ordinary code or comments', () => {
  const source = [
    'message = "# include-next-line zilliz"',
    '// explain include-start zilliz in prose',
  ].join('\n')
  assert.equal(filterCodeVariants(source, 'milvus'), source)
})
```

- [ ] **Step 3: Add tests for malformed directives**

Append:

```javascript
test('rejects malformed comment directives with line diagnostics', () => {
  assert.throws(
    () => filterCodeVariants('    # include-next-line', 'zilliz.saas'),
    /requires a target at line 1/
  )
  assert.throws(
    () => filterCodeVariants('    # include-next-line zilliz', 'zilliz.saas'),
    /has no following code line/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n    value=True', 'zilliz.saas'),
    /has no matching include-end/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n    # exclude-end', 'zilliz.saas'),
    /does not match an open exclude-start/
  )
  assert.throws(
    () => filterCodeVariants('    # include-start zilliz\n  # include-end', 'zilliz.saas'),
    /indentation at line 2 does not match line 1/
  )
})
```

- [ ] **Step 4: Run all focused tests**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
```

Expected: all comment-directive tests PASS.

- [ ] **Step 5: Commit the complete comment grammar**

```bash
git add plugins/lark-docs/codeVariantFilter.js plugins/lark-docs/codeVariantFilter.test.js
git commit -m "test(lark-docs): cover code variant directive grammar"
```

### Task 3: Preserve existing HTML-like code variants without empty lines

**Files:**
- Modify: `plugins/lark-docs/codeVariantFilter.test.js`
- Modify: `plugins/lark-docs/codeVariantFilter.js`

- [ ] **Step 1: Add failing compatibility tests for standalone legacy tags**

Append:

```javascript
test('filters standalone legacy tags without directive gaps', () => {
  const source = [
    'params={',
    '<include target="zilliz">',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '</include>',
    '<include target="milvus">',
    '    "credential": "YOUR_API_KEY",',
    '</include>',
    '    "dim": "1536",',
    '}',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'params={',
    '    "integration_id": "YOUR_INTEGRATION_ID",',
    '    "dim": "1536",',
    '}',
  ].join('\n'))

  assert.equal(filterCodeVariants(source, 'milvus'), [
    'params={',
    '    "credential": "YOUR_API_KEY",',
    '    "dim": "1536",',
    '}',
  ].join('\n'))
})
```

- [ ] **Step 2: Add failing compatibility tests for inline legacy tags**

Append:

```javascript
test('removes an inline legacy parameter line without leaving indentation', () => {
  const source = [
    'search_params = {',
    '    <include target="zilliz">\'params\': {\'level\': 10},</include>',
    '}',
  ].join('\n')

  assert.equal(filterCodeVariants(source, 'zilliz.saas'), [
    'search_params = {',
    '    \'params\': {\'level\': 10},',
    '}',
  ].join('\n'))
  assert.equal(filterCodeVariants(source, 'milvus'), [
    'search_params = {',
    '}',
  ].join('\n'))
})

test('preserves mixed inline legacy fragments on retained code lines', () => {
  const source = 'token=TOKEN  # <exclude target="paas">API key or </exclude>username:password'
  assert.equal(
    filterCodeVariants(source, 'zilliz.paas'),
    'token=TOKEN  # username:password'
  )
  assert.equal(
    filterCodeVariants(source, 'zilliz.saas'),
    'token=TOKEN  # API key or username:password'
  )
})
```

- [ ] **Step 3: Run the tests and verify legacy cases fail**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
```

Expected: the new legacy-tag assertions FAIL because tags are still emitted.

- [ ] **Step 4: Implement the line-aware legacy-tag pass**

Add below `filterCommentDirectives()`:

```javascript
const LEGACY_TAG = /<\/?(?:include|exclude)(?:\s+target="[^"]+")?\s*>/gi

function parseLegacyTag(token) {
  const close = token.match(/^<\/(include|exclude)\s*>$/i)
  if (close) return { closing: true, kind: close[1].toLowerCase(), target: null }

  const open = token.match(/^<(include|exclude)\s+target="([^"]+)"\s*>$/i)
  if (!open) return null
  return {
    closing: false,
    kind: open[1].toLowerCase(),
    target: open[2].trim().toLowerCase(),
  }
}

function filterLegacyTags(content, targets) {
  const input = String(content ?? '')
  const hadTrailingNewline = input.endsWith('\n')
  const lines = input.split('\n')
  if (hadTrailingNewline) lines.pop()

  const parts = activeTargetParts(targets)
  const regions = []
  const output = []
  const regionsEnabled = () => regions.every(region => region.enabled)

  for (const line of lines) {
    LEGACY_TAG.lastIndex = 0
    let lastIndex = 0
    let rendered = ''
    let hadTag = false
    let hadActiveText = false
    let match

    while ((match = LEGACY_TAG.exec(line)) !== null) {
      hadTag = true
      const before = line.slice(lastIndex, match.index)
      if (regionsEnabled()) {
        rendered += before
        if (before.length > 0) hadActiveText = true
      }

      const tag = parseLegacyTag(match[0])
      if (!tag) {
        if (regionsEnabled()) rendered += match[0]
        lastIndex = LEGACY_TAG.lastIndex
        continue
      }

      if (tag.closing) {
        const current = regions.at(-1)
        if (!current || current.kind !== tag.kind) {
          console.warn(`Ignoring unmatched legacy </${tag.kind}> code variant tag`)
        } else {
          regions.pop()
        }
      } else {
        regions.push({
          kind: tag.kind,
          enabled: directiveEnabled(tag.kind, tag.target, parts),
        })
      }
      lastIndex = LEGACY_TAG.lastIndex
    }

    const after = line.slice(lastIndex)
    if (regionsEnabled()) {
      rendered += after
      if (after.length > 0) hadActiveText = true
    }

    if (!hadTag && line === '' && regionsEnabled()) {
      output.push(line)
    } else if (rendered.trim() !== '' || (hadActiveText && !hadTag)) {
      output.push(rendered)
    }
  }

  if (regions.length > 0) {
    console.warn(`Unclosed legacy <${regions.at(-1).kind}> code variant tag`)
  }

  const rendered = output.join('\n')
  return hadTrailingNewline && rendered ? `${rendered}\n` : rendered
}
```

- [ ] **Step 5: Compose the comment and legacy passes**

Replace `filterCodeVariants()` with:

```javascript
function filterCodeVariants(content, targets) {
  return filterLegacyTags(filterCommentDirectives(content, targets), targets)
}
```

- [ ] **Step 6: Run the complete focused suite**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
```

Expected: all tests PASS and output contains no variant warnings for the fixtures.

- [ ] **Step 7: Commit compatibility support**

```bash
git add plugins/lark-docs/codeVariantFilter.js plugins/lark-docs/codeVariantFilter.test.js
git commit -m "fix(lark-docs): compact legacy code variants"
```

### Task 4: Integrate filtering before code fencing and tabs

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js:1-15,2218-2226`
- Modify: `plugins/lark-docs/larkDocWriter.test.js:500-556,723-751`

- [ ] **Step 1: Add a failing writer integration test**

Add after `testCodeBlocksInferLanguageWhenFeishuOmitsLanguage()`:

```javascript
async function testCodeVariantsFilterBeforeFencing() {
  const blocks = [
    codeBlock('code-python', 'page', [
      'params={',
      '    "provider": "openai",',
      '    # include-next-line zilliz',
      '    "integration_id": "YOUR_INTEGRATION_ID",',
      '    # include-next-line milvus',
      '    "credential": "YOUR_API_KEY",',
      '',
      '    "dim": "1536",',
      '}',
    ].join('\n'), { language: 49 }),
  ];
  const writer = createWriter(blocks);
  writer.targets = 'zilliz.saas';

  try {
    const markdown = await writer.__markdown(blocks, 0);
    assert.match(markdown, /```python\nparams=\{\n    "provider": "openai",\n    "integration_id": "YOUR_INTEGRATION_ID",\n\n    "dim": "1536",\n\}\n```/);
    assert.doesNotMatch(markdown, /include-next-line|credential/);
    assert.doesNotMatch(markdown, /openai",\n\n    "integration_id/);
  } finally {
    writer.destroy();
  }
}
```

Add `await testCodeVariantsFilterBeforeFencing();` immediately after `await testCodeBlocksInferLanguageWhenFeishuOmitsLanguage();` in `run()`.

- [ ] **Step 2: Run the writer test and verify the directive remains**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: FAIL because the generated fenced block still contains `include-next-line`.

- [ ] **Step 3: Import the pure filter into the writer**

Add near the existing MDX patcher import:

```javascript
const { filterCodeVariants } = require('./codeVariantFilter')
```

- [ ] **Step 4: Filter raw code after language detection and before splitting/fencing**

In `__code()`, change:

```javascript
let lang = this.__code_language(code, elements) || 'plaintext'
```

to:

```javascript
let lang = this.__code_language(code, elements) || 'plaintext'
elements = filterCodeVariants(elements, this.targets)
```

Do not call the generic `__filter_content()` here. The code filter owns comment directives, legacy code tags, and code-line preservation.

- [ ] **Step 5: Run focused and writer tests**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: both commands PASS.

- [ ] **Step 6: Verify multi-language tabs remain balanced**

Run:

```bash
node plugins/lark-docs/regression.test.js
```

Expected: PASS with no new MDX, Tabs, or TabItem failures.

- [ ] **Step 7: Commit writer integration**

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js
git commit -m "feat(lark-docs): filter variants before code fences"
```

### Task 5: Document authoring and compatibility policy

**Files:**
- Create: `plugins/lark-docs/CODE_VARIANTS.md`

- [ ] **Step 1: Write the authoring guide**

Create `plugins/lark-docs/CODE_VARIANTS.md` with:

````markdown
# Code variants in Lark documents

Use comment directives for target-specific content inside code blocks. The directive must occupy its entire physical line and should use the same indentation as the code it controls. The generated code removes the complete directive line.

## One line

```python
params={
    # include-next-line zilliz
    "integration_id": "YOUR_INTEGRATION_ID",
    # include-next-line milvus
    "credential": "YOUR_API_KEY",
}
```

## A region

```javascript
client.search({
    collectionName: 'docs',
    // include-start zilliz
    projectId: 'YOUR_PROJECT_ID',
    regionId: 'YOUR_REGION_ID',
    // include-end
    limit: 10,
})
```

Available directive bodies are `include-next-line TARGET`, `exclude-next-line TARGET`, `include-start TARGET`, `include-end`, `exclude-start TARGET`, and `exclude-end`.

Use `#`, `//`, `/* ... */`, `<!-- ... -->`, or `{/* ... */}` according to the example language. The parser accepts `zilliz`, `saas`, `paas`, and `milvus` through the existing dot-separated target matching rule.

Intentional blank lines remain unchanged. Directive lines and excluded lines are removed completely, so do not add blank spacer lines merely to compensate for a directive.

Existing `<include target="..."></include>` and `<exclude target="..."></exclude>` code variants remain supported for compatibility. Do not add new HTML-like tags inside code blocks; migrate authoritative Lark examples to comment directives when editing them. HTML-like tags remain appropriate for inline filtering in prose.
````

- [ ] **Step 2: Check the guide for accidental live directives**

Run:

```bash
rg -n '^\s*(#|//|/\*|<!--|\{/\*)\s*(include|exclude)-(next-line|start|end)' plugins/lark-docs/CODE_VARIANTS.md
```

Expected: matches occur only inside the documented fenced examples.

- [ ] **Step 3: Commit the guide**

```bash
git add plugins/lark-docs/CODE_VARIANTS.md
git commit -m "docs(lark-docs): document code variant comments"
```

### Task 6: Validate real examples and downstream portability

**Files:**
- Verify: `plugins/lark-docs/meta/sources/guides/DKyXws0pXibd45kdPXPc1PV5nIb.json`
- Verify: `plugins/lark-docs/meta/sources/guides/RQTRwhOVPiwnwokqr4scAtyfnBf.json`
- Verify: `plugins/lark-docs/meta/sources/python/v3.0.x/CNQIdgQvXoux0KxpXHxca8EMnjg.json`
- Verify: `/Users/anthony/Documents/projects/zdoc_cn/plugins/lark-docs/larkDocWriter.js`

- [ ] **Step 1: Add a read-only real-source smoke check**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs')
const { filterCodeVariants } = require('./plugins/lark-docs/codeVariantFilter')

const cases = [
  ['plugins/lark-docs/meta/sources/guides/DKyXws0pXibd45kdPXPc1PV5nIb.json', 'JFevdvNpYoYmEyxKs7WcVTMSnbe'],
  ['plugins/lark-docs/meta/sources/guides/RQTRwhOVPiwnwokqr4scAtyfnBf.json', 'Nk5LdYxqVotqEuxmXjKchWgln1i'],
  ['plugins/lark-docs/meta/sources/python/v3.0.x/CNQIdgQvXoux0KxpXHxca8EMnjg.json', 'doxcnDhlPDpM3pGlnM3mEGgND9f'],
]

for (const [file, blockId] of cases) {
  const source = JSON.parse(fs.readFileSync(file, 'utf8'))
  const block = source.blocks.items.find(item => item.block_id === blockId)
  const code = block.code.elements.map(item => item.text_run?.content || '').join('')
  const rendered = filterCodeVariants(code, 'zilliz.saas')
  if (/<\/?(?:include|exclude)\b/.test(rendered)) throw new Error(`${file} retained a legacy tag`)
  if (/\n[ \t]+\n/.test(rendered)) throw new Error(`${file} produced a whitespace-only line`)
  console.log(`validated ${file}#${blockId}`)
}
NODE
```

Expected: three `validated ...` lines and exit code 0.

- [ ] **Step 2: Re-run the audited code-block count to confirm compatibility coverage**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
let blocks = 0
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.name.endsWith('.json')) {
      let source
      try { source = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { continue }
      for (const block of source.blocks?.items || []) {
        if (block.block_type !== 14) continue
        const code = (block.code?.elements || []).map(item => item.text_run?.content || '').join('')
        if (/<(?:include|exclude) target=/.test(code)) blocks += 1
      }
    }
  }
}
walk('plugins/lark-docs/meta/sources')
console.log(`legacy code variant blocks: ${blocks}`)
NODE
```

Expected for the current snapshot: `legacy code variant blocks: 45`. A changed number is acceptable only if source snapshots changed independently; every discovered block must still be processed by the compatibility pass.

- [ ] **Step 3: Verify the downstream writer has the compatible call site**

Run:

```bash
rg -n 'async __code|__code_block_split|__filter_content' /Users/anthony/Documents/projects/zdoc_cn/plugins/lark-docs/larkDocWriter.js
```

Expected: `zdoc_cn` has the same `__code()` to `__code_block_split()` path and the same later generic filtering path. The new integration requires only the new module import and the one `filterCodeVariants(elements, this.targets)` call.

- [ ] **Step 4: Record the downstream synchronization contract in the implementation handoff**

The handoff must state:

```text
Downstream impact: zdoc_cn carries the same lark-docs writer path. Synchronize codeVariantFilter.js, codeVariantFilter.test.js, CODE_VARIANTS.md, and the narrow larkDocWriter import/call-site change. Do not overwrite unrelated zdoc_cn writer drift. After synchronization, run the focused filter test and larkDocWriter test in zdoc_cn.
```

- [ ] **Step 5: Run the final upstream verification set**

Run:

```bash
node --test plugins/lark-docs/codeVariantFilter.test.js
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/regression.test.js
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: all commands PASS.

- [ ] **Step 6: Confirm only intended files changed**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected implementation changes:

```text
plugins/lark-docs/CODE_VARIANTS.md
plugins/lark-docs/codeVariantFilter.js
plugins/lark-docs/codeVariantFilter.test.js
plugins/lark-docs/larkDocWriter.js
plugins/lark-docs/larkDocWriter.test.js
```

The planning/specification files under `.claude/superpowers/` may also be present. Preserve the pre-existing untracked `.codegraph/` directory and any unrelated user changes.
