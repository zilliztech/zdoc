# Generated Doc Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge PR #116 UI changes and move generated-output fixes into repeatable generator logic, config, and build guards.

**Architecture:** Keep hardening close to the generator that owns each output while merging UI/source-code changes through normal review and verification. Add focused Lark writer helpers for links, admonitions, tabs, sidebar overrides, description extraction, and allowed global MDX components; keep Apifox unchanged because it already emits method badges and admonition metadata; add a source-control guard for static runtime env placeholders.

**Tech Stack:** Node.js CommonJS, TypeScript config typing, Docusaurus plugin config, existing `node:assert` test style, existing shell/npm test commands.

---

## File Structure

- Modify: `plugins/lark-docs/larkDocWriter.js` - add link canonicalization, admonition normalization, FeatureNote preservation, sidebar override support, and scenario-tab normalization call site.
- Modify: `plugins/lark-docs/larkDocWriter.test.js` - add focused unit tests for admonitions, FeatureNote preservation, description extraction, and scenario-tab normalization.
- Modify: `plugins/lark-docs/regression.test.js` - add regression coverage for canonical CLI links and sidebar overrides.
- Modify: `plugins/lark-docs/index.js` - pass optional manual `sidebarOverrides` into the writer.
- Modify: `config/lark-docs.config.ts` - add optional `sidebarOverrides` type and configure the agents landing page override.
- Create: `plugins/lark-docs/scenarioTabsNormalizer.js` - transform writer-produced language-first scenario tabs into scenario-first tabs.
- Create: `plugins/lark-docs/scenarioTabsNormalizer.test.js` - test the tab transformation in isolation.
- Create: `scripts/check-static-env-placeholder.js` - fail when `static/env.js` contains populated `INKEEP_*` runtime values.
- Modify: `package.json` - add a standalone `check:static-env` script.
- Merge/modify: PR #116 UI/source-code files under `src/components/**`, `src/theme/**`, `src/css/**`, `static/css/**`, `docusaurus.config.ts`, `playwright.config.ts`, and related tests/assets.
- Use: `plugins/apifox-docs/refGen.lang-filter.test.js`, `plugins/apifox-docs/issues-10717-10802.test.js`, and `plugins/apifox-docs/sync-candidates-volume-and-vector.test.js` for regression verification only.

### Task 1: Harden Lark admonition normalization

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.test.js`

- [ ] **Step 1: Add failing tests for warning, danger, and long-title normalization**

Add these helper tests to `plugins/lark-docs/larkDocWriter.test.js` before `testListedDocsRetriesPrematureClose()`:

```js
async function testCalloutWarningUsesWarningType() {
  const callout = {
    block_id: 'callout-warning',
    block_type: 19,
    callout: { emoji_id: 'construction' },
    children: ['title', 'body'],
  };
  const blocks = [
    callout,
    textBlock('title', 'callout-warning', [textRun('Warning')]),
    textBlock('body', 'callout-warning', [textRun('Nullable StructArray fields are available only in clusters compatible with Milvus v3.0.x.')]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="warning" icon="🚧" title="Warning">/);
  assert.match(markdown, /Nullable StructArray fields are available only/);
  await assertMdxCompiles(markdown);
}

async function testCalloutDestructiveSentenceKeepsDangerAndMovesTitleToBody() {
  const callout = {
    block_id: 'callout-danger',
    block_type: 19,
    callout: { emoji_id: 'construction' },
    children: ['sentence'],
  };
  const blocks = [
    callout,
    textBlock('sentence', 'callout-danger', [textRun('Once you drop a database, it is removed immediately and cannot be recovered. This action cannot be undone.')]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="danger" icon="🚧" title="Danger">/);
  assert.match(markdown, /Once you drop a database, it is removed immediately and cannot be recovered/);
  assert.doesNotMatch(markdown, /title="Once you drop a database/);
  await assertMdxCompiles(markdown);
}

async function testQuoteWarningUsesWarningType() {
  const quote = {
    block_id: 'quote-warning',
    block_type: 34,
    children: ['title', 'body'],
  };
  const blocks = [
    quote,
    textBlock('title', 'quote-warning', [textRun('Warning')]),
    textBlock('body', 'quote-warning', [textRun('Deleted files and folders cannot be recovered.')]),
  ];

  const markdown = await createWriter(blocks).__quote(quote, 0);

  assert.match(markdown, /<Admonition type="warning" icon="🚧" title="Warning">/);
  assert.match(markdown, /Deleted files and folders cannot be recovered/);
  await assertMdxCompiles(markdown);
}
```

Add these calls in `run()`:

```js
  await testCalloutWarningUsesWarningType();
  await testCalloutDestructiveSentenceKeepsDangerAndMovesTitleToBody();
  await testQuoteWarningUsesWarningType();
```

- [ ] **Step 2: Run the focused writer test and confirm failure**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: FAIL because current output still uses `danger` for construction callouts and `caution` for quote warnings.

- [ ] **Step 3: Add admonition normalization helpers**

Add these methods inside the `LarkDocWriter` class before `async __callout(block, indent)`:

```js
    __normalize_admonition_title(rawTitle, bodyLines) {
        const title = String(rawTitle || '').trim();
        const body = Array.isArray(bodyLines) ? [...bodyLines] : [];
        const titleLooksLikeSentence = title.length > 72 || /[.!?]$/.test(title) || /\[[^\]]+\]\([^)]+\)/.test(title) || /`/.test(title);

        if (titleLooksLikeSentence) {
            return {
                title: '',
                body: [title, ...body].filter(line => line !== undefined && line !== null),
            };
        }

        return { title, body };
    }

    __is_destructive_admonition(text) {
        return /cannot be recovered|cannot be undone|removed immediately|deleted .*cannot|drop .*database|delete .*volume/i.test(String(text || ''));
    }

    __admonition_meta({ emoji, rawTitle, bodyLines }) {
        const normalized = this.__normalize_admonition_title(rawTitle, bodyLines);
        const titleText = normalized.title;
        const combinedText = [titleText, ...normalized.body].join(' ');
        const lowerTitle = titleText.toLowerCase();

        if (this.__is_destructive_admonition(combinedText)) {
            return {
                type: 'danger',
                icon: '🚧',
                title: titleText && !['warning', 'warn', 'caution'].includes(lowerTitle) ? titleText : 'Danger',
                body: normalized.body,
            };
        }

        if (emoji === 'construction' || ['warning', 'warn', 'caution', '警告'].includes(lowerTitle)) {
            return {
                type: 'warning',
                icon: '🚧',
                title: titleText && !['warn'].includes(lowerTitle) ? titleText : 'Warning',
                body: normalized.body,
            };
        }

        return {
            type: 'info',
            icon: '📘',
            title: titleText || 'Note',
            body: normalized.body,
        };
    }

    __render_admonition({ indent, type, icon, title, bodyLines }) {
        const opening = `${' '.repeat(indent)}<Admonition type="${type}" icon="${icon}" title="${title}">`;
        let body = Array.isArray(bodyLines) ? bodyLines : [];
        while (body.length && String(body[0]).trim() === '') body.shift();
        while (body.length && String(body[body.length - 1]).trim() === '') body.pop();
        const raw = opening + '\n\n' + body.join('\n') + '\n\n' + ' '.repeat(indent) + '</Admonition>';
        return raw.replace(/(\s*\n){3,}/g, `\n${' '.repeat(indent)}\n`);
    }
```

- [ ] **Step 4: Route callout and quote rendering through the helper**

Replace the type switch and body assembly in `__callout()` with:

```js
        const meta = this.__admonition_meta({
            emoji,
            rawTitle: children[0],
            bodyLines: children.slice(1),
        });

        return this.__render_admonition({
            indent,
            type: meta.type,
            icon: meta.icon,
            title: meta.title,
            bodyLines: meta.body,
        });
```

Replace the title/type assembly in `__quote()` with:

```js
        const meta = this.__admonition_meta({
            emoji: '',
            rawTitle: res[0],
            bodyLines: res.slice(1),
        });

        return this.__render_admonition({
            indent,
            type: meta.type,
            icon: meta.icon,
            title: meta.title,
            bodyLines: meta.body,
        });
```

- [ ] **Step 5: Run the focused test and commit**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: PASS with `larkDocWriter tests passed`.

Commit:

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js
git commit -m "fix(lark-docs): normalize generated admonitions"
```

### Task 2: Canonicalize generated internal CLI links

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/regression.test.js`

- [ ] **Step 1: Add a failing regression test**

Add this function in `plugins/lark-docs/regression.test.js` after `testConvertLinkResolvesWikiByOriginTokenForBackwardCompatibility()`:

```js
async function testConvertLinkCanonicalizesCliOverviewRoute() {
  const writer = new larkDocWriter('', '', '', '/tmp');

  assert.equal(
    await writer.__convert_link('/reference/cli/overview'),
    '/reference/cli/cli/overview'
  );
  assert.equal(
    await writer.__convert_link('https://docs.zilliz.com/reference/cli/overview'),
    '/reference/cli/cli/overview'
  );
}
```

Add this call in `run()`:

```js
  await testConvertLinkCanonicalizesCliOverviewRoute();
```

- [ ] **Step 2: Run the regression test and confirm failure**

Run:

```bash
node plugins/lark-docs/regression.test.js
```

Expected: FAIL because `/reference/cli/overview` is returned unchanged.

- [ ] **Step 3: Add canonical internal URL mapping**

Add this method before `async __convert_link(url)`:

```js
    __canonical_internal_url(url) {
        if (!url) return url;
        const text = String(url);
        const replacements = new Map([
            ['/reference/cli/overview', '/reference/cli/cli/overview'],
        ]);

        for (const [from, to] of replacements.entries()) {
            if (text === from) return to;
            if (text.startsWith(`${from}#`)) return text.replace(from, to);
        }

        return text;
    }
```

Then update the end of `__convert_link()`:

```js
        if (url?.startsWith('https://docs.zilliz.com/')) {
            url = url.replace('https://docs.zilliz.com/', '/');
        }

        url = this.__canonical_internal_url(url);

        return url;
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
node plugins/lark-docs/regression.test.js
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: both PASS.

Commit:

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/regression.test.js
git commit -m "fix(lark-docs): canonicalize CLI reference links"
```

### Task 3: Support page-level sidebar overrides

**Files:**
- Modify: `config/lark-docs.config.ts`
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/regression.test.js`

- [ ] **Step 1: Add failing frontmatter coverage**

Add this test function in `plugins/lark-docs/regression.test.js` after `testFrontMatterEscapesYamlDoubleQuotedBackslashes()`:

```js
function testFrontMatterUsesSidebarOverrideForGeneratedSlug() {
  const writer = new larkDocWriter('', '', 'agentsSidebar', '/tmp');
  writer.sidebarOverrides = {
    'agents-and-prompts': 'default',
  };

  const frontMatter = writer.__front_matters(
    'Agents and Prompts',
    'Cloud',
    'agents-and-prompts',
    false,
    false,
    'docx',
    'AgentsToken',
    1,
    'Agents and Prompts',
    '',
    'agentsSidebar',
    'Curated prompt library'
  );

  const parsed = matter(`${frontMatter}\n\n# Agents and Prompts`);
  assert.equal(parsed.data.displayed_sidebar, undefined);
  assert.equal(parsed.data.slug, '/agents-and-prompts');
}
```

Add this call in `run()`:

```js
  testFrontMatterUsesSidebarOverrideForGeneratedSlug();
```

- [ ] **Step 2: Run and confirm failure**

Run:

```bash
node plugins/lark-docs/regression.test.js
```

Expected: FAIL because `displayed_sidebar` remains `agentsSidebar` and slug is prefixed with `/agents/`.

- [ ] **Step 3: Add writer support**

In the `LarkDocWriter` constructor, add:

```js
        this.sidebarOverrides = {};
```

At the start of `__front_matters()`, before the `displayed_sidebar === 'default'` branch, add:

```js
        const originalSlug = slug;
        const sidebarOverride = this.sidebarOverrides?.[originalSlug] || this.sidebarOverrides?.[sidebar_label] || null;
        if (sidebarOverride) {
            displayed_sidebar = sidebarOverride;
        }
```

- [ ] **Step 4: Pass config from plugin index**

In `plugins/lark-docs/index.js`, update manual destructuring:

```js
const { root, base, sourceType, displayedSidebar, docSourceDir, fallbackSourceDir, targets, sidebarOverrides } = manual
```

After constructing `writer`, set:

```js
writer.sidebarOverrides = sidebarOverrides || {};
```

- [ ] **Step 5: Add config typing and agents override**

In `config/lark-docs.config.ts`, add this property to `Manual`:

```ts
    sidebarOverrides?: Record<string, string>;
```

In the `agents` manual, add:

```ts
    sidebarOverrides: {
        'agents-and-prompts': 'default',
    },
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
node plugins/lark-docs/regression.test.js
```

Expected: PASS.

Commit:

```bash
git add config/lark-docs.config.ts plugins/lark-docs/index.js plugins/lark-docs/larkDocWriter.js plugins/lark-docs/regression.test.js
git commit -m "fix(lark-docs): support page sidebar overrides"
```

### Task 4: Normalize language-first scenario tabs

**Files:**
- Create: `plugins/lark-docs/scenarioTabsNormalizer.js`
- Create: `plugins/lark-docs/scenarioTabsNormalizer.test.js`
- Modify: `plugins/lark-docs/larkDocWriter.js`

- [ ] **Step 1: Add failing normalizer tests**

Create `plugins/lark-docs/scenarioTabsNormalizer.test.js`:

```js
const assert = require('node:assert/strict');
const { normalizeScenarioTabs } = require('./scenarioTabsNormalizer');

function compact(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function testConvertsLanguageOuterTabsToScenarioOuterTabs() {
  const input = `<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>
<Tabs groupId="python" defaultValue='python' values={[{"label":"AWS S3/GCS","value":"python"},{"label":"Azure Blob Storage","value":"python_1"}]}>
<TabItem value='python'>

\`\`\`python
aws-python()
\`\`\`

</TabItem>
<TabItem value='python_1'>

\`\`\`python
azure-python()
\`\`\`

</TabItem>
</Tabs>
</TabItem>
<TabItem value='java'>
<Tabs groupId="java" defaultValue='java' values={[{"label":"AWS S3/GCS","value":"java"},{"label":"Azure Blob Storage","value":"java_1"}]}>
<TabItem value='java'>

\`\`\`java
awsJava();
\`\`\`

</TabItem>
<TabItem value='java_1'>

\`\`\`java
azureJava();
\`\`\`

</TabItem>
</Tabs>
</TabItem>
</Tabs>`;

  const output = normalizeScenarioTabs(input);

  assert.match(output, /<Tabs groupId="storage" defaultValue='aws'/);
  assert.match(output, /<TabItem value='aws'>/);
  assert.match(output, /<Tabs groupId="code" defaultValue='python'/);
  assert.match(output, /aws-python\(\)/);
  assert.match(output, /awsJava\(\);/);
  assert.match(output, /<TabItem value='azure'>/);
  assert.match(output, /azure-python\(\)/);
  assert.match(output, /azureJava\(\);/);
  assert.doesNotMatch(output, /groupId="python"/);
  assert.doesNotMatch(output, /groupId="java"/);
  assert.notEqual(compact(output), compact(input));
}

function testLeavesSingleLanguageTabsUnchanged() {
  const input = `<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"}]}>
<TabItem value='python'>

\`\`\`python
client.list_collections()
\`\`\`

</TabItem>
</Tabs>`;

  assert.equal(normalizeScenarioTabs(input), input);
}

testConvertsLanguageOuterTabsToScenarioOuterTabs();
testLeavesSingleLanguageTabsUnchanged();
console.log('scenario tabs normalizer tests passed');
```

- [ ] **Step 2: Run and confirm failure**

Run:

```bash
node plugins/lark-docs/scenarioTabsNormalizer.test.js
```

Expected: FAIL with `Cannot find module './scenarioTabsNormalizer'`.

- [ ] **Step 3: Implement the normalizer module**

Create `plugins/lark-docs/scenarioTabsNormalizer.js` with a scanner that only transforms the writer-produced pattern:

```js
function parseValues(source) {
  try {
    return Function(`"use strict"; return (${source});`)();
  } catch {
    return null;
  }
}

function scenarioValue(label) {
  const text = String(label || '').toLowerCase();
  if (text.includes('azure')) return 'azure';
  if (text.includes('aws') || text.includes('gcs') || text.includes('s3')) return 'aws';
  return text.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scenario';
}

function extractTabs(markdown) {
  const outerMatch = markdown.match(/^<Tabs groupId="code" defaultValue='([^']+)' values=\{(\[[^\n]+\])\}>\n([\s\S]*)\n<\/Tabs>$/);
  if (!outerMatch) return null;
  const languages = parseValues(outerMatch[2]);
  if (!Array.isArray(languages) || languages.length < 2) return null;

  const languageBlocks = [];
  const itemPattern = /<TabItem value='([^']+)'>\n([\s\S]*?)\n<\/TabItem>/g;
  let match;
  while ((match = itemPattern.exec(outerMatch[3])) !== null) {
    const inner = match[2].match(/^<Tabs groupId="([^"]+)" defaultValue='([^']+)' values=\{(\[[^\n]+\])\}>\n([\s\S]*)\n<\/Tabs>$/);
    if (!inner) return null;
    const scenarios = parseValues(inner[3]);
    if (!Array.isArray(scenarios) || scenarios.length < 2) return null;
    const scenarioBlocks = [];
    const scenarioPattern = /<TabItem value='([^']+)'>\n([\s\S]*?)\n<\/TabItem>/g;
    let scenarioMatch;
    while ((scenarioMatch = scenarioPattern.exec(inner[4])) !== null) {
      scenarioBlocks.push({ value: scenarioMatch[1], content: scenarioMatch[2] });
    }
    languageBlocks.push({ value: match[1], label: languages.find(lang => lang.value === match[1])?.label || match[1], scenarios, scenarioBlocks });
  }

  if (languageBlocks.length !== languages.length) return null;
  return { languages, languageBlocks };
}

function normalizeScenarioTabs(markdown) {
  const parsed = extractTabs(markdown);
  if (!parsed) return markdown;

  const firstScenarioSet = parsed.languageBlocks[0].scenarios.map(item => item.label);
  const allMatch = parsed.languageBlocks.every(block =>
    block.scenarios.length === firstScenarioSet.length &&
    block.scenarios.every((item, index) => item.label === firstScenarioSet[index])
  );
  if (!allMatch) return markdown;

  const scenarios = parsed.languageBlocks[0].scenarios.map(item => ({
    label: item.label,
    value: scenarioValue(item.label),
  }));

  const outerStart = `<Tabs groupId="storage" defaultValue='${scenarios[0].value}' values={${JSON.stringify(scenarios)}}>`;
  const outerItems = scenarios.map((scenario, scenarioIndex) => {
    const languageValues = parsed.languages.map(lang => ({ label: lang.label, value: lang.value }));
    const innerStart = `<Tabs groupId="code" defaultValue='${languageValues[0].value}' values={${JSON.stringify(languageValues)}}>`;
    const innerItems = parsed.languageBlocks.map(block => {
      const content = block.scenarioBlocks[scenarioIndex]?.content || '';
      return `<TabItem value='${block.value}'>\n${content}\n</TabItem>`;
    }).join('\n');
    return `<TabItem value='${scenario.value}'>\n\n${innerStart}\n${innerItems}\n</Tabs>\n\n</TabItem>`;
  }).join('\n');

  return `${outerStart}\n${outerItems}\n</Tabs>`;
}

module.exports = { normalizeScenarioTabs };
```

- [ ] **Step 4: Call the normalizer from generated page content**

In `plugins/lark-docs/larkDocWriter.js`, add near the top:

```js
const { normalizeScenarioTabs } = require('./scenarioTabsNormalizer')
```

In `plugins/lark-docs/larkDocWriter.js`, inside `__write_page()`, insert this line immediately after the existing `markdown = await this.__mdx_patches(markdown)` line:

```js
        markdown = normalizeScenarioTabs(markdown)
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node plugins/lark-docs/scenarioTabsNormalizer.test.js
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: both PASS.

Commit:

```bash
git add plugins/lark-docs/scenarioTabsNormalizer.js plugins/lark-docs/scenarioTabsNormalizer.test.js plugins/lark-docs/larkDocWriter.js
git commit -m "fix(lark-docs): normalize nested scenario tabs"
```

### Task 5: Preserve global FeatureNote MDX from Lark sources

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.test.js`

- [ ] **Step 1: Add failing preservation test**

Add this test to `plugins/lark-docs/larkDocWriter.test.js`:

```js
function testFeatureNoteIsKnownJsxComponent() {
  const writer = createWriter([]);
  const source = '<FeatureNote variant="region" titleHref="/docs/pricing">\\n\\nfaksdjflkadf\\n\\n</FeatureNote>';
  const result = writer.__filter_content(source, 'zilliz');

  assert.equal(result, source);
}
```

Add this call in `run()`:

```js
  testFeatureNoteIsKnownJsxComponent();
```

- [ ] **Step 2: Run and confirm failure if the component is escaped or filtered**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: FAIL if `FeatureNote` is not included in known JSX component handling.

- [ ] **Step 3: Add FeatureNote to known component handling**

In `plugins/lark-docs/larkDocWriter.js`, extend the `KNOWN_JSX_TAGS` list:

```js
    'Admonition', 'Tabs', 'TabItem', 'DocCard', 'DocCardList',
    'FeatureNote',
```

Do not add an import for `FeatureNote`; PR #116 registers it globally in `src/theme/MDXComponents/index.tsx`. Source docs should use this canonical form without `icon` or `title` props:

```mdx
<FeatureNote variant="plan/region" titleHref="/docs/xxx">

faksdjflkadf

</FeatureNote>
```

The `FeatureNote` component contract should derive the title from `variant`:

```js
const FEATURE_NOTE_TITLES = {
  plan: 'Plan Availability',
  region: 'Region Availability',
};
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: PASS.

Commit:

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js
git commit -m "fix(lark-docs): preserve FeatureNote MDX"
```

### Task 6: Extract descriptions from first meaningful prose paragraph

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.test.js`

- [ ] **Step 1: Add failing description extraction tests**

Add these tests to `plugins/lark-docs/larkDocWriter.test.js` after `testFeatureNoteIsKnownJsxComponent()`:

```js
function testDescriptionSkipsFeatureNote() {
  const writer = createWriter([]);
  const markdown = `# Connect for On-Demand Search

<FeatureNote variant="region" titleHref="/docs/pricing">

Available in AWS us-west-2.

</FeatureNote>

Use a project endpoint when you want to run on-demand search.
`;

  assert.equal(
    writer.__extract_description(markdown),
    'Use a project endpoint when you want to run on-demand search.'
  );
}

function testDescriptionSkipsImportsExportsAndAdmonitions() {
  const writer = createWriter([]);
  const markdown = `# Database

import Tabs from '@theme/Tabs';
export const metadata = {};

<Admonition type="info" icon="📘" title="Note">

This callout should not become the SEO description.

</Admonition>

A database is a logical container for collections.
`;

  assert.equal(
    writer.__extract_description(markdown),
    'A database is a logical container for collections.'
  );
}

function testDescriptionKeepsExistingFirstParagraphBehavior() {
  const writer = createWriter([]);
  const markdown = `# Use BulkWriter

If your data format does not meet the requirements, you can use **BulkWriter** to prepare your data.
`;

  assert.equal(
    writer.__extract_description(markdown),
    'If your data format does not meet the requirements, you can use **BulkWriter** to prepare your data.'
  );
}
```

Add these calls in `run()`:

```js
  testDescriptionSkipsFeatureNote();
  testDescriptionSkipsImportsExportsAndAdmonitions();
  testDescriptionKeepsExistingFirstParagraphBehavior();
```

- [ ] **Step 2: Run and confirm failure**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: FAIL because current `__extract_description()` returns the line two lines after H1, including `<FeatureNote ...>` when present.

- [ ] **Step 3: Replace the description extractor**

Replace `__extract_description(markdown)` in `plugins/lark-docs/larkDocWriter.js` with:

```js
    __extract_description(markdown) {
        const lines = markdown.split('\n');
        const titleIndex = lines.findIndex(line => line.startsWith('# '));
        if (titleIndex === -1) return '(placeholder)';

        const skipBlockTags = new Set([
            'FeatureNote',
            'Admonition',
            'Tabs',
            'TabItem',
            'Grid',
            'Procedures',
            'DocCardList',
        ]);

        let skippingTag = null;

        for (const line of lines.slice(titleIndex + 1)) {
            let trimmed = line.trim();
            if (!trimmed) continue;
            if (/^(import|export)\s/.test(trimmed)) continue;
            if (/^#{1,6}\s/.test(trimmed)) continue;

            if (skippingTag) {
                if (trimmed.includes(`</${skippingTag}>`)) {
                    skippingTag = null;
                }
                continue;
            }

            const openTag = trimmed.match(/^<([A-Z][A-Za-z0-9]*)\b/);
            if (openTag && skipBlockTags.has(openTag[1])) {
                if (!trimmed.includes(`</${openTag[1]}>`) && !trimmed.endsWith('/>')) {
                    skippingTag = openTag[1];
                }
                continue;
            }

            if (/^[-*]\s+/.test(trimmed)) continue;

            trimmed = trimmed
                .replace(/^<p>|<\/p>$/g, '')
                .replace(/<\/?[^>]+>/g, '')
                .trim();

            return trimmed || '(placeholder)';
        }

        return '(placeholder)';
    }
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: PASS.

Commit:

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js
git commit -m "fix(lark-docs): skip MDX components in descriptions"
```

### Task 7: Merge PR #116 UI/source-code changes

**Files:**
- Modify/merge: `src/components/**`
- Modify/merge: `src/theme/**`
- Modify/merge: `src/css/custom.css`
- Modify/merge: `static/css/**`
- Modify/merge: `static/img/inkeep-logo.svg`
- Modify/merge: `static/img/inkeep-wordmark.svg`
- Modify/merge: `static/inkeep-runtime-config.js`
- Modify/merge: `config/inkeep.config.ts`
- Modify/merge: `docusaurus.config.ts`
- Modify/merge: `playwright.config.ts`
- Modify/merge: component tests touched by PR #116
- Do not merge as durable source: generated `docs/**`, `docs-agents/**`, `config/generated/**`, populated `static/env.js`

- [ ] **Step 1: Inspect PR #116 file categories**

Run:

```bash
gh pr diff 116 --name-only
```

Expected: output includes UI/source-code files and generated docs/sidebar files. Classify files into:

```text
merge-ui-source: src/**, static/css/**, static/img/**, config/inkeep.config.ts, docusaurus.config.ts, playwright.config.ts
generator-owned: docs/**, docs-agents/**, config/generated/**
runtime-placeholder: static/env.js
```

- [ ] **Step 2: Apply UI/source-code changes only**

Use `git checkout refs/tmp/pr-116 -- <path>` or `git restore --source=refs/tmp/pr-116 -- <path>` for UI/source files only. Apply these categories:

```bash
git restore --source=refs/tmp/pr-116 -- src/components
git restore --source=refs/tmp/pr-116 -- src/theme
git restore --source=refs/tmp/pr-116 -- src/css/custom.css
git restore --source=refs/tmp/pr-116 -- static/css
git restore --source=refs/tmp/pr-116 -- static/img/inkeep-logo.svg
git restore --source=refs/tmp/pr-116 -- static/img/inkeep-wordmark.svg
git restore --source=refs/tmp/pr-116 -- static/inkeep-runtime-config.js
git restore --source=refs/tmp/pr-116 -- config/inkeep.config.ts
git restore --source=refs/tmp/pr-116 -- docusaurus.config.ts
git restore --source=refs/tmp/pr-116 -- playwright.config.ts
```

Expected: generated markdown/sidebar files are not modified by this step.

- [ ] **Step 3: Keep `static/env.js` as a placeholder**

Verify `static/env.js` remains:

```js
window.__ZDOC_ENV__ = {};
```

Do not apply PR #116 populated `INKEEP_*` values to this file.

- [ ] **Step 4: Review UI merge conflicts and generated-output overlap**

Run:

```bash
git status --short
git diff --name-only
```

Expected: changed files are UI/source-code files plus hardening implementation files. If `docs/**`, `docs-agents/**`, or `config/generated/**` appear, inspect them and revert the generated file changes unless a previous hardening task intentionally changed generator code instead.

- [ ] **Step 5: Run UI and build verification**

Run:

```bash
npm run build
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/regression.test.js
node plugins/apifox-docs/specLoader.test.js
node plugins/apifox-docs/refGen.lang-filter.test.js
```

Expected: all PASS. If `npm run build` fails due to missing PR dependency changes, inspect `package.json`/lockfile from PR #116 and merge only the dependency entries required by UI/source code.

- [ ] **Step 6: Visual smoke test changed UI surfaces**

Start the dev server:

```bash
npm run dev
```

Open representative pages and verify:

```text
/docs/data/data-import-export/data-import/prepare-data-import/use-bulkwriter
/reference/restful/list-collections-v2
/docs/get-started/quick-start-to-on-demand-search
```

Expected:

- sidebar renders without overlap on desktop and mobile
- REST method badges appear in API sidebar and header
- REST tabs switch without scroll jump
- image lightbox opens and closes
- search modal opens and Inkeep styling is present
- `FeatureNote` renders when present in MDX

- [ ] **Step 7: Commit UI merge**

Commit:

```bash
git add src config/inkeep.config.ts docusaurus.config.ts playwright.config.ts static/css static/img/inkeep-logo.svg static/img/inkeep-wordmark.svg static/inkeep-runtime-config.js
git commit -m "feat(redesign): merge PR 116 UI updates"
```

### Task 8: Guard static runtime env placeholders

**Files:**
- Create: `scripts/check-static-env-placeholder.js`
- Modify: `package.json`
- Verify: `static/env.js`

- [ ] **Step 1: Create the guard script**

Create `scripts/check-static-env-placeholder.js`:

```js
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(process.cwd(), 'static', 'env.js');
const source = fs.readFileSync(envPath, 'utf8');

const populatedInkeep = source.match(/INKEEP_[A-Z_]+\s*:\s*["'][^"']+["']/g) || [];

if (populatedInkeep.length > 0) {
  console.error('static/env.js must remain a source-control placeholder. Found populated Inkeep runtime values:');
  for (const entry of populatedInkeep) {
    console.error(`- ${entry.replace(/(["']).*\1/, '$1[redacted]$1')}`);
  }
  console.error('Use deployment-time runtime config injection instead of committing these values.');
  process.exit(1);
}

console.log('static env placeholder check passed');
```

- [ ] **Step 2: Add package script**

In `package.json`, add:

```json
"check:static-env": "node scripts/check-static-env-placeholder.js"
```

Keep this script standalone because the current `package.json` has no combined validation script.

- [ ] **Step 3: Ensure placeholder content is empty**

Verify `static/env.js` is:

```js
window.__ZDOC_ENV__ = {};
```

- [ ] **Step 4: Run and commit**

Run:

```bash
npm run check:static-env
```

Expected: PASS with `static env placeholder check passed`.

Commit:

```bash
git add package.json scripts/check-static-env-placeholder.js static/env.js
git commit -m "chore: guard static runtime env placeholder"
```

### Task 9: Run cross-plugin regression checks

**Files:**
- Use: `plugins/lark-docs/larkDocWriter.test.js`
- Use: `plugins/lark-docs/regression.test.js`
- Use: `plugins/lark-docs/index.test.js`
- Use: `plugins/apifox-docs/refGen.lang-filter.test.js`
- Use: `plugins/apifox-docs/issues-10717-10802.test.js`
- Use: `plugins/apifox-docs/sync-candidates-volume-and-vector.test.js`
- Use: `plugins/apifox-docs/specLoader.test.js`
- Use: `npm run build`

- [ ] **Step 1: Run Lark tests**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/regression.test.js
node plugins/lark-docs/index.test.js
```

Expected: all PASS.

- [ ] **Step 2: Run Apifox tests**

Run:

```bash
node plugins/apifox-docs/specLoader.test.js
node plugins/apifox-docs/refGen.lang-filter.test.js
node plugins/apifox-docs/issues-10717-10802.test.js
node plugins/apifox-docs/sync-candidates-volume-and-vector.test.js
```

Expected: all PASS.

- [ ] **Step 3: Run static env guard**

Run:

```bash
npm run check:static-env
```

Expected: PASS.

- [ ] **Step 4: Run Docusaurus build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Inspect generated-output risk**

Run:

```bash
git status --short
```

Expected: only intentional implementation files are modified. Generated docs and generated sidebars should not be edited by these tasks unless an explicit generation step is requested and reviewed.

Commit any remaining test-only corrections with:

```bash
git add plugins/lark-docs plugins/apifox-docs scripts package.json static/env.js config/lark-docs.config.ts src config/inkeep.config.ts docusaurus.config.ts playwright.config.ts static/css static/img static/inkeep-runtime-config.js
git commit -m "test: verify generated doc hardening"
```

## Self-Review

- Spec coverage: CLI route canonicalization is covered by Task 2; admonition semantics by Task 1; scenario tabs by Task 4; agents sidebar override by Task 3; FeatureNote preservation by Task 5; description extraction by Task 6; PR #116 UI merge by Task 7; Inkeep runtime placeholder guard by Task 8; Apifox non-regression and build verification by Task 9.
- Placeholder scan: this plan contains no implementation placeholders. Each code-producing step includes exact code or exact command expectations.
- Type consistency: `sidebarOverrides` is consistently a `Record<string, string>` in config and a plain object on `LarkDocWriter`; `normalizeScenarioTabs` is exported and imported with the same name.
