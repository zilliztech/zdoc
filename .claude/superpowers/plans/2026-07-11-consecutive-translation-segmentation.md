# Consecutive Translation Segmentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lossless, consecutive, structure-aware segmentation so long MDX documents are translated and reviewed chunk by chunk, then assembled and validated as a complete document.

**Architecture:** A new `chunker.js` module scans source text linearly, records only safe boundaries outside protected Markdown/MDX structures, and packs exact source ranges to configurable character budgets. `agentRunner.js` retains its short-document path, adds sequential chunk translation with continuity metadata for long documents, assembles accepted chunks in order, and writes/cache-marks a file only after deterministic whole-document validation.

**Tech Stack:** Node.js CommonJS, built-in `node:test`/`assert`, existing `@mdx-js/mdx`, `js-yaml`, Docusaurus MDX validation, GitHub Actions YAML.

---

## File Structure

- Create `scripts/translation/chunker.js`: lossless scanner, safe-boundary detection, section packing, and exported `chunkDocument()` API.
- Create `scripts/translation/chunker.test.js`: focused scanner and packing regression tests.
- Modify `scripts/translation/agentRunner.js`: chunk configuration, prompt metadata, sequential chunk orchestration, assembly, validation, and chunk-aware failure reporting.
- Modify `scripts/translation/agentRunner.test.js`: short-path compatibility, sequential chunk flow, failure atomicity, assembly, prompt context, and response-fence regressions.
- Modify `.github/prompts/codex-translation-agent.md`: rules for consecutive document sections.
- Modify `.github/prompts/codex-review-agent.md`: chunk-aware comparison wording.
- Modify `.github/prompts/codex-correction-agent.md`: chunk-aware surgical correction wording.
- Modify `.github/workflows/translate-codex.yml`: expose target and maximum chunk character settings.
- Modify `package.json`: include `chunker.test.js` in `test:translation`.

### Task 1: Preserve legitimate document code fences

**Files:**
- Modify: `scripts/translation/agentRunner.js:33-35`
- Modify: `scripts/translation/agentRunner.test.js:6,144-160`

- [ ] **Step 1: Write failing response-fence tests**

Import `stripCodeFence` and add tests that distinguish an actual document-ending fence from an outer model-response wrapper:

```js
function testStripCodeFencePreservesDocumentClosingFence() {
  const document = '---\ntitle: Test\n---\n\n```text\nexpected output\n```'
  assert.equal(stripCodeFence(document), document)
}

function testStripCodeFenceRemovesResponseWrapper() {
  const wrapped = '```markdown\n---\ntitle: Test\n---\n\n```text\nexpected output\n```\n```'
  const document = '---\ntitle: Test\n---\n\n```text\nexpected output\n```'
  assert.equal(stripCodeFence(wrapped), document)
}
```

- [ ] **Step 2: Run the runner test and verify the regression fails**

Run: `node scripts/translation/agentRunner.test.js`

Expected: FAIL because the current trailing-fence regex removes the document's legitimate closing fence.

- [ ] **Step 3: Restrict stripping to a complete outer wrapper**

Replace `stripCodeFence()` with:

```js
function stripCodeFence(text) {
  const trimmed = String(text || '').trim()
  const wrapped = trimmed.match(/^```(?:json|markdown|mdx)?[\t ]*\r?\n([\s\S]*)\r?\n```$/i)
  return wrapped ? wrapped[1].trim() : trimmed
}
```

- [ ] **Step 4: Run the runner test and verify it passes**

Run: `node scripts/translation/agentRunner.test.js`

Expected: PASS with `translation agent runner tests passed`.

- [ ] **Step 5: Commit the fence prerequisite**

```bash
git add scripts/translation/agentRunner.js scripts/translation/agentRunner.test.js
git commit -m "Fix translation response fence handling"
```

### Task 2: Build the lossless consecutive scanner

**Files:**
- Create: `scripts/translation/chunker.js`
- Create: `scripts/translation/chunker.test.js`

- [ ] **Step 1: Write failing tests for lossless and heading-first slicing**

Create tests using deliberately small budgets:

```js
const assert = require('node:assert/strict')
const test = require('node:test')
const { chunkDocument } = require('./chunker')

test('keeps a short document in one lossless chunk', () => {
  const source = '---\ntitle: Test\n---\n\n# Intro\n\nBody.\n'
  const chunks = chunkDocument(source, { targetChars: 1000, maxChars: 1200 })
  assert.equal(chunks.length, 1)
  assert.equal(chunks.map(chunk => chunk.source).join(''), source)
  assert.deepEqual([chunks[0].start, chunks[0].end], [0, source.length])
})

test('packs consecutive heading sections without losing bytes', () => {
  const source = '# One\n\n1111\n\n## Two\n\n2222\n\n## Three\n\n3333\n'
  const chunks = chunkDocument(source, { targetChars: 24, maxChars: 32 })
  assert.ok(chunks.length > 1)
  assert.equal(chunks.map(chunk => chunk.source).join(''), source)
  assert.equal(chunks[1].source.startsWith('## '), true)
})
```

- [ ] **Step 2: Run chunker tests and verify module-not-found failure**

Run: `node --test scripts/translation/chunker.test.js`

Expected: FAIL because `chunker.js` does not exist.

- [ ] **Step 3: Implement line offsets and protected-state tracking**

Create `chunker.js` with constants and helpers:

```js
'use strict'

const DEFAULT_TARGET_CHARS = 24000
const DEFAULT_MAX_CHARS = 32000

function splitLinesWithOffsets(source) {
  const lines = []
  let start = 0
  for (const match of source.matchAll(/.*(?:\r?\n|$)/g)) {
    if (!match[0]) continue
    const end = start + match[0].length
    lines.push({ text: match[0], start, end })
    start = end
  }
  return lines
}

function createScannerState() {
  return {
    frontmatter: false,
    frontmatterSeen: false,
    fence: null,
    jsxStack: [],
    table: false,
    listIndent: null,
    blockquote: false,
    admonition: false,
  }
}
```

Implement updates for `---` frontmatter at byte zero, backtick/tilde fences with matching marker length, JSX open/close/self-closing tags, tables, list continuations, blockquotes, and admonition markers. Expose a boundary only before a heading or after a blank-line-terminated complete block while all protected state is closed.

- [ ] **Step 4: Implement exact-range chunk construction**

Add:

```js
function makeChunk(source, start, end, index) {
  const chunkSource = source.slice(start, end)
  const heading = chunkSource.match(/^#{1,6}[\t ]+(.+)$/m)?.[1]?.trim() || null
  return { index, start, end, source: chunkSource, heading }
}

function assertLossless(source, chunks) {
  const assembled = chunks.map(chunk => chunk.source).join('')
  if (assembled !== source) throw new Error('Chunking was not lossless')
}
```

Build preliminary heading sections, pack adjacent ranges until `targetChars`, and refuse to add another section when it would exceed `maxChars`. For an oversized preliminary section, use safe fallback block boundaries. Keep a single indivisible block intact even when it exceeds `maxChars`.

- [ ] **Step 5: Run heading and lossless tests**

Run: `node --test scripts/translation/chunker.test.js`

Expected: PASS for the initial two tests.

- [ ] **Step 6: Commit the scanner foundation**

```bash
git add scripts/translation/chunker.js scripts/translation/chunker.test.js
git commit -m "Add lossless translation document chunker"
```

### Task 3: Protect Markdown and MDX structures

**Files:**
- Modify: `scripts/translation/chunker.js`
- Modify: `scripts/translation/chunker.test.js`

- [ ] **Step 1: Add failing protected-structure fixtures**

Add separate tests proving no boundary appears inside:

```js
const fixtures = [
  '```python\nprint("# not a heading")\n```\n',
  '~~~text\n# not a heading\n~~~\n',
  '| A | B |\n|---|---|\n| 1 | 2 |\n',
  '- first\n  continued text\n  - nested\n',
  '> quoted\n> continuation\n',
  ':::note\n# nested heading text\n:::\n',
  'import Tabs from "@theme/Tabs";\n',
  '<Tabs>\n<TabItem value="a">\n# Nested\n</TabItem>\n</Tabs>\n',
]

for (const protectedBlock of fixtures) {
  const source = `# Before\n\n${protectedBlock}\n# After\n\nEnd.\n`
  const chunks = chunkDocument(source, { targetChars: 20, maxChars: 30 })
  assert.equal(chunks.map(chunk => chunk.source).join(''), source)
  assert.equal(chunks.some(chunk => chunk.start > source.indexOf(protectedBlock) && chunk.start < source.indexOf(protectedBlock) + protectedBlock.length), false)
}
```

- [ ] **Step 2: Run tests and verify at least one protected fixture fails**

Run: `node --test scripts/translation/chunker.test.js`

Expected: FAIL showing a boundary inside a protected block before all scanner states are implemented.

- [ ] **Step 3: Complete protected-state transitions**

Implement these rules in `chunker.js`:

- Fence opener: up to three leading spaces followed by at least three matching backticks or tildes.
- Fence closer: same marker character and at least opener length.
- JSX: push non-self-closing opening tag names and pop matching closing tags; ignore tags inside fences.
- Table: treat a header row plus delimiter row and subsequent pipe rows as one block.
- List: retain blank lines followed by indented continuation or another list item in the same block.
- Blockquote: retain consecutive `>` lines and their blank-line continuations.
- Admonition: retain `:::` or `::::` blocks until a matching closing marker.
- ESM: retain contiguous `import`/`export` declarations, including multiline braces.

- [ ] **Step 4: Add an oversized indivisible-block test**

```js
test('allows one indivisible block to exceed the maximum', () => {
  const code = `\`\`\`text\n${'x'.repeat(80)}\n\`\`\`\n`
  const chunks = chunkDocument(code, { targetChars: 20, maxChars: 30 })
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0].source, code)
})
```

- [ ] **Step 5: Run all chunker tests**

Run: `node --test scripts/translation/chunker.test.js`

Expected: all tests PASS and every fixture remains lossless.

- [ ] **Step 6: Commit protected structure handling**

```bash
git add scripts/translation/chunker.js scripts/translation/chunker.test.js
git commit -m "Protect MDX structures during translation chunking"
```

### Task 4: Add chunk-aware prompt construction

**Files:**
- Modify: `scripts/translation/agentRunner.js:144-172`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `.github/prompts/codex-translation-agent.md`
- Modify: `.github/prompts/codex-review-agent.md`
- Modify: `.github/prompts/codex-correction-agent.md`

- [ ] **Step 1: Write failing prompt metadata tests**

Add tests calling all three message builders with:

```js
const chunkContext = {
  index: 1,
  total: 3,
  documentTitle: 'Analyzer overview',
  previousTranslatedHeading: '概要',
}
```

Assert the user messages contain `Chunk: 2 of 3`, `Document title: Analyzer overview`, `Previous translated heading: 概要`, and `Translate this consecutive MDX/Markdown section` while the short-document call still contains `Translate this complete MDX/Markdown file`.

- [ ] **Step 2: Run the runner tests and verify metadata assertions fail**

Run: `node scripts/translation/agentRunner.test.js`

Expected: FAIL because the builders do not accept chunk context.

- [ ] **Step 3: Add a shared context formatter**

Implement:

```js
function formatDocumentContext({ chunkContext }) {
  if (!chunkContext) return ''
  const lines = [
    `Chunk: ${chunkContext.index + 1} of ${chunkContext.total}`,
    chunkContext.documentTitle ? `Document title: ${chunkContext.documentTitle}` : null,
    chunkContext.previousTranslatedHeading ? `Previous translated heading: ${chunkContext.previousTranslatedHeading}` : null,
  ].filter(Boolean)
  return `${lines.join('\n')}\n`
}
```

Pass `chunkContext` through translation, review, and correction builders. Keep the exact existing short-document wording when no context is supplied.

- [ ] **Step 4: Update system prompt rules**

Add explicit consecutive-section rules:

- Return only the translated or corrected section.
- Do not add frontmatter, imports, headings, or component tags absent from the section.
- Preserve leading/trailing structural content exactly as represented by the section.
- Treat chunk metadata as continuity context, not source text to translate.

- [ ] **Step 5: Run prompt and runner tests**

Run: `node scripts/translation/agentRunner.test.js`

Expected: PASS for both complete-document and chunk message cases.

- [ ] **Step 6: Commit prompt support**

```bash
git add scripts/translation/agentRunner.js scripts/translation/agentRunner.test.js .github/prompts/codex-translation-agent.md .github/prompts/codex-review-agent.md .github/prompts/codex-correction-agent.md
git commit -m "Add chunk context to translation prompts"
```

### Task 5: Orchestrate sequential chunk translation atomically

**Files:**
- Modify: `scripts/translation/agentRunner.js:174-236,258-340`
- Modify: `scripts/translation/agentRunner.test.js`

- [ ] **Step 1: Write a failing sequential assembly test**

Create a long source fixture and inject small chunk limits through `processManifestItem`:

```js
const calls = []
const callModel = async ({ agent, messages }) => {
  calls.push({ agent, body: messages.at(-1).content })
  if (agent === 'review') return '{"pass":true,"issues":[]}'
  const source = messages.at(-1).content.split('\n\n').at(-1)
  return source.replace(/Section/g, 'セクション')
}

const result = await processManifestItem({
  siteDir,
  item,
  callModel,
  maxReviewRounds: 0,
  chunkTargetChars: 40,
  chunkMaxChars: 60,
  validate: async content => content.includes('セクション') ? [] : ['assembly failed'],
})

assert.equal(result.status, 'translated')
assert.ok(result.chunks.total > 1)
assert.deepEqual(calls.map(call => call.agent), ['translation', 'review', 'translation', 'review'])
```

Use enough source sections for the expected call list to reflect the actual chunk count rather than hard-coding two if the fixture produces more.

- [ ] **Step 2: Run the runner tests and verify the chunk test fails**

Run: `node scripts/translation/agentRunner.test.js`

Expected: FAIL because `processManifestItem` still makes one full-document request.

- [ ] **Step 3: Extract reusable translation/review of one unit**

Create:

```js
async function translateAndReviewUnit({
  sourcePath,
  sourceContent,
  locale,
  callModel,
  maxReviewRounds,
  chunkContext,
}) {
  let translatedContent = stripCodeFence(await callModel({
    agent: 'translation',
    messages: buildTranslationMessages({ sourcePath, sourceContent, locale, chunkContext }),
  }))
  let review = { pass: false, issues: [] }
  for (let round = 0; round <= maxReviewRounds; round++) {
    review = parseReview(await callModel({
      agent: 'review',
      messages: buildReviewMessages({ sourcePath, sourceContent, translatedContent, locale, chunkContext }),
    }))
    if (review.pass || round === maxReviewRounds) break
    translatedContent = stripCodeFence(await callModel({
      agent: 'correction',
      messages: buildCorrectionMessages({ sourcePath, sourceContent, translatedContent, review, locale, chunkContext }),
    }))
  }
  return { translatedContent, review }
}
```

- [ ] **Step 4: Implement short and segmented paths**

In `processManifestItem`:

```js
const chunks = chunkDocument(sourceContent, {
  targetChars: chunkTargetChars,
  maxChars: chunkMaxChars,
})

const translatedChunks = []
let previousTranslatedHeading = null
for (const chunk of chunks) {
  const unit = await translateAndReviewUnit({
    sourcePath: item.sourcePath,
    sourceContent: chunk.source,
    locale: item.locale,
    callModel,
    maxReviewRounds,
    chunkContext: chunks.length > 1 ? {
      index: chunk.index,
      total: chunks.length,
      documentTitle,
      previousTranslatedHeading,
    } : null,
  })
  if (!unit.review.pass) {
    return {
      ...item,
      status: 'failed',
      chunk: { index: chunk.index, total: chunks.length, start: chunk.start, end: chunk.end },
      review: unit.review,
      validationErrors: [],
    }
  }
  translatedChunks.push(unit.translatedContent)
  previousTranslatedHeading = extractFirstHeading(unit.translatedContent) || previousTranslatedHeading
}
const translatedContent = translatedChunks.join('')
```

Preserve the exact existing no-extra-newline behavior by requiring chunk prompts to retain each source chunk's boundary whitespace and joining with an empty separator.

- [ ] **Step 5: Write a failing atomic failure test**

Make the second chunk review fail and assert:

```js
assert.equal(result.status, 'failed')
assert.equal(result.chunk.index, 1)
assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
```

- [ ] **Step 6: Implement final whole-document validation and result metadata**

Validate only after all chunks pass. On success return:

```js
return {
  ...item,
  status: 'translated',
  review: { pass: true, issues: [] },
  validationErrors: [],
  chunks: { total: chunks.length },
}
```

On final validation failure return `status: 'failed'`, `chunks.total`, and the deterministic validation errors without writing the target file.

- [ ] **Step 7: Run runner tests**

Run: `node scripts/translation/agentRunner.test.js`

Expected: PASS for short documents, sequential chunks, assembly, and atomic failure.

- [ ] **Step 8: Commit orchestration**

```bash
git add scripts/translation/agentRunner.js scripts/translation/agentRunner.test.js
git commit -m "Translate long documents in consecutive chunks"
```

### Task 6: Wire configuration into local and CI execution

**Files:**
- Modify: `scripts/translation/agentRunner.js:9-12,258-295`
- Modify: `.github/workflows/translate-codex.yml:124-138`
- Modify: `scripts/translation/workflowReporting.test.js`

- [ ] **Step 1: Add failing configuration tests**

Test exported defaults or injected parsing so missing values resolve to 24000/32000, positive environment values are accepted, and `maxChars < targetChars` throws a clear configuration error.

Add workflow assertions:

```js
assert.match(workflow, /TRANSLATION_CHUNK_TARGET_CHARS:/)
assert.match(workflow, /TRANSLATION_CHUNK_MAX_CHARS:/)
```

- [ ] **Step 2: Run tests and verify missing configuration fails**

Run: `node scripts/translation/agentRunner.test.js && node --test scripts/translation/workflowReporting.test.js`

Expected: FAIL because chunk environment values are not loaded or passed.

- [ ] **Step 3: Load and validate chunk limits**

Add:

```js
const DEFAULT_CHUNK_TARGET_CHARS = 24000
const DEFAULT_CHUNK_MAX_CHARS = 32000

function loadChunkLimits(env = process.env) {
  const targetChars = parsePositiveInteger(env.TRANSLATION_CHUNK_TARGET_CHARS, DEFAULT_CHUNK_TARGET_CHARS)
  const maxChars = parsePositiveInteger(env.TRANSLATION_CHUNK_MAX_CHARS, DEFAULT_CHUNK_MAX_CHARS)
  if (maxChars < targetChars) throw new Error('TRANSLATION_CHUNK_MAX_CHARS must be greater than or equal to TRANSLATION_CHUNK_TARGET_CHARS')
  return { targetChars, maxChars }
}
```

Load once in `main()` and pass both values into `processManifestItem`.

- [ ] **Step 4: Add workflow environment mappings**

Under the translation step environment add:

```yaml
TRANSLATION_CHUNK_TARGET_CHARS: ${{ vars.TRANSLATION_CHUNK_TARGET_CHARS || 24000 }}
TRANSLATION_CHUNK_MAX_CHARS: ${{ vars.TRANSLATION_CHUNK_MAX_CHARS || 32000 }}
```

- [ ] **Step 5: Run configuration and workflow tests**

Run: `node scripts/translation/agentRunner.test.js && node --test scripts/translation/workflowReporting.test.js`

Expected: PASS.

- [ ] **Step 6: Commit configuration wiring**

```bash
git add scripts/translation/agentRunner.js scripts/translation/agentRunner.test.js .github/workflows/translate-codex.yml scripts/translation/workflowReporting.test.js
git commit -m "Configure translation chunk size limits"
```

### Task 7: Integrate tests and perform full verification

**Files:**
- Modify: `package.json:19`
- Modify: `scripts/translation/chunker.test.js`
- Modify: `scripts/translation/agentRunner.test.js`

- [ ] **Step 1: Add chunker tests to the standard translation suite**

Change `test:translation` so it includes:

```json
"node --test scripts/translation/chunker.test.js scripts/translation/reportSummary.test.js scripts/translation/workflowReporting.test.js"
```

Keep the existing sidebar, manifest, and runner test commands.

- [ ] **Step 2: Run the full translation suite**

Run: `pnpm test:translation`

Expected: all translation, chunker, reporting, manifest, and sidebar tests PASS.

- [ ] **Step 3: Run representative MDX assembly validation**

Use the test helper to assemble a fixture containing frontmatter, imports, Tabs/TabItem, a table, list, blockquote, admonition, backtick fence, and tilde fence. Pass the assembled text to `validateTranslatedContent` and assert an empty error list.

Run: `node scripts/translation/agentRunner.test.js`

Expected: PASS with no MDX or structural errors.

- [ ] **Step 4: Validate workflow YAML and whitespace**

Run:

```bash
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/translate-codex.yml'); puts 'workflow YAML parsed'"
git diff --check
```

Expected: `workflow YAML parsed` and exit code 0 from `git diff --check`.

- [ ] **Step 5: Run a dry local manifest and one-file smoke translation only when provider credentials are available**

Generate one pending file:

```bash
node scripts/translation/manifest.js --locale ja-JP --output tmp/translation-manifest-smoke.json --max-files 1 --include-reference false
```

If the selected source is shorter than 32,000 characters, create a temporary test manifest pointing at a known long source without editing tracked files. Run:

```bash
node scripts/translation/agentRunner.js --manifest tmp/translation-manifest-smoke.json --report tmp/translation-report-smoke.json
```

Expected: report status `translated`, chunk count greater than one for the long fixture, generated target passes MDX validation, and no credentials appear in logs.

- [ ] **Step 6: Commit suite integration**

```bash
git add package.json scripts/translation/chunker.test.js scripts/translation/agentRunner.test.js
git commit -m "Test consecutive translation segmentation"
```

- [ ] **Step 7: Review the final change set**

Run:

```bash
git status --short
git log --oneline --max-count=8
git diff HEAD~6..HEAD --stat
```

Expected: only the planned chunker, runner, prompts, workflow, tests, and package script changes are present.
