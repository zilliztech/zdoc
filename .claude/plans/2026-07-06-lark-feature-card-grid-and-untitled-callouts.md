# Lark Feature Card Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render explicitly marked Lark grids as feature-card grids, with icon intent supplied by readable title-to-icon mappings in the source Lark doc.

**Architecture:** Treat the Lark source as part of the contract: technical writers add `<!-- zdoc:feature-card-grid icons=Title:Icon,Title:Icon -->` immediately before a Lark grid when they want card rendering. Keep the current generic `<Grid>` path as a fallback, add a separate global MDX component, `<FeatureCardGrid>` / `<FeatureCard>`, and teach `larkDocWriter` to consume the explicit marker before rendering the next grid as cards. The source now gives the callouts explicit titles, so callout hardening is intentionally out of scope.

**Tech Stack:** Node.js CommonJS writer/tests, Docusaurus MDX global components, React/TypeScript, CSS modules, lucide-react icons, `@mdx-js/mdx` compile checks.

---

## File Structure

- Source update: `https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd` - verify explicit marker paragraphs with readable title-to-icon mappings before the two intended feature-card grids.
- Create: `src/components/FeatureCardGrid/index.tsx` - global MDX component that exports `FeatureCardGrid` as default and named `FeatureCard`.
- Create: `src/components/FeatureCardGrid/styles.module.css` - responsive card-grid styling.
- Modify: `src/theme/MDXComponents/index.tsx` - register `FeatureCardGrid` and `FeatureCard` globally.
- Modify: `plugins/mdx-parse/mdxPatcher.js` - add `FeatureCardGrid` and `FeatureCard` to allowed JSX component sets.
- Modify: `plugins/mdx-parse/mdxPatcher.test.js` - prove the new components are preserved by MDX patching.
- Modify: `plugins/lark-docs/larkDocWriter.js` - add feature-card grid marker parsing, detection/rendering, imports, JSX allowlist entries, and icon allowlist validation.
- Modify: `plugins/lark-docs/larkDocWriter.test.js` - add focused tests for feature-card grids.

### Task 0: Verify Feature-Card Grid Markers In The Source Lark Doc

**Files / Sources:**
- Source update: `https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd`

- [ ] **Step 1: Fetch the relevant source blocks with IDs**

Run:

```bash
lark-cli docs +fetch --api-version v2 \
  --doc "https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd" \
  --detail with-ids \
  --scope keyword \
  --keyword "Problem|Quality-first" \
  --context-before 1 \
  --context-after 1 \
  --format json
```

Expected: output includes the first grid block whose first column heading is `Problem`, the second grid block whose first column heading is `Quality-first`, and the marker paragraphs immediately before those grids.

- [ ] **Step 2: Verify or fix the marker before the Problem / Strategy grid**

Use the block ID of the paragraph immediately before the Problem / Strategy grid. In the full fetch from revision 53, that paragraph is:

```xml
<p id="doxcn3n4MjOscnC014KxEgHQDHe">This gives better representation power, but exact MaxSim is expensive at scale...</p>
```

Expected marker:

```md
<!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow -->
```

If the marker is missing, run:

```bash
lark-cli docs +update --api-version v2 \
  --doc "https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd" \
  --command block_insert_after \
  --block-id "doxcn3n4MjOscnC014KxEgHQDHe" \
  --content '<p>&lt;!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow --&gt;</p>'
```

Expected: exactly one marker paragraph appears immediately before the grid. If the source already has a marker there but it is malformed, update or replace that existing marker paragraph instead of inserting a duplicate.

- [ ] **Step 3: Verify or fix the marker before the Quality-first / Balanced / Compressed grid**

Use the block ID of the ordered-list item immediately before the second grid. In the full fetch from revision 53, that item is:

```xml
<li id="doxcnGglgfQlXMv1hRXJKGahnCb">Always validate on representative queries and document-length distributions...</li>
```

Expected marker:

```md
<!-- zdoc:feature-card-grid icons=Quality-first:BadgeCheck,Balanced:Scale,Compressed:Sparkles -->
```

If the marker is missing, run:

```bash
lark-cli docs +update --api-version v2 \
  --doc "https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd" \
  --command block_insert_after \
  --block-id "doxcnGglgfQlXMv1hRXJKGahnCb" \
  --content '<p>&lt;!-- zdoc:feature-card-grid icons=Quality-first:BadgeCheck,Balanced:Scale,Compressed:Sparkles --&gt;</p>'
```

Expected: exactly one marker paragraph appears immediately before the grid. If the source already has a marker there but it is malformed, update or replace that existing marker paragraph instead of inserting a duplicate.

- [ ] **Step 4: Verify the source markers**

Run:

```bash
lark-cli docs +fetch --api-version v2 \
  --doc "https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd" \
  --detail with-ids \
  --scope keyword \
  --keyword "zdoc:feature-card-grid" \
  --context-after 1 \
  --format json
```

Expected: two marker paragraphs are present. Each marker is followed by a Lark grid block and contains one `Title:Icon` pair per grid column.

### Task 1: Add Failing Writer Tests For Card Grids

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.test.js`

- [ ] **Step 1: Add grid helper functions**

Add these helpers after `bulletBlock()`:

```js
function headingBlock(block_id, parent_id, level, elements) {
  return {
    block_id,
    block_type: level + 2,
    parent_id,
    [`heading${level}`]: {
      elements,
      style: { align: 1, folded: false },
    },
  };
}

function gridBlock(block_id, children, columnSize = children.length) {
  return {
    block_id,
    block_type: 24,
    grid: { column_size: columnSize },
    children,
  };
}

function gridColumnBlock(block_id, parent_id, width_ratio, children) {
  return {
    block_id,
    block_type: 25,
    parent_id,
    grid_column: { width_ratio },
    children,
  };
}
```

- [ ] **Step 2: Add a failing feature-card grid test**

Add this test before `testBaseTablesRetriesPrematureClose()`:

```js
async function testGridWithHeadingColumnsRendersFeatureCards() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1', 'problem-2']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    bulletBlock('problem-2', 'problem-col', [textRun('Exact MaxSim over all rows is expensive.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown(blocks, 0);

  assert.match(markdown, /<FeatureCardGrid columns=\{2\}>/);
  assert.match(markdown, /<FeatureCard icon="AlertTriangle" title="Problem">/);
  assert.match(markdown, /- Each row may contain many vectors\./);
  assert.match(markdown, /<FeatureCard icon="Workflow" title="Strategy">/);
  assert.doesNotMatch(markdown, /<Grid columnSize=/);
  assert.doesNotMatch(markdown, /<h3|### Problem/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
  await assertMdxCompiles([
    "import {FeatureCard} from '@site/src/components/FeatureCardGrid';",
    "import FeatureCardGrid from '@site/src/components/FeatureCardGrid';",
    markdown,
  ].join('\n\n'));
}
```

- [ ] **Step 3: Add a fallback generic grid test**

Add this test after the feature-card grid test:

```js
async function testGridWithoutHeadingColumnKeepsGenericGrid() {
  const grid = gridBlock('grid-generic', ['left-col', 'right-col'], 2);
  const blocks = [
    grid,
    gridColumnBlock('left-col', 'grid-generic', 0.5, ['left-text']),
    textBlock('left-text', 'left-col', [textRun('Plain left column.')]),
    gridColumnBlock('right-col', 'grid-generic', 0.5, ['right-text']),
    textBlock('right-text', 'right-col', [textRun('Plain right column.')]),
  ];

  const markdown = await createWriter(blocks).__grid(grid, 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
}
```

- [ ] **Step 4: Add a malformed marked-grid fallback test**

Add this test after the generic grid test:

```js
async function testMarkedGridWithoutHeadingFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Plain:Sparkles,Other:Workflow -->')]);
  const grid = gridBlock('grid-generic', ['left-col', 'right-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('left-col', 'grid-generic', 0.5, ['left-text']),
    textBlock('left-text', 'left-col', [textRun('Plain left column.')]),
    gridColumnBlock('right-col', 'grid-generic', 0.5, ['right-text']),
    textBlock('right-text', 'right-col', [textRun('Plain right column.')]),
  ];

  const markdown = await createWriter(blocks).__markdown(blocks, 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}
```

- [ ] **Step 5: Add an invalid-icon fallback test**

Add this test after the malformed-grid test:

```js
async function testMarkedGridWithUnsupportedIconFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Problem:UnknownIcon,Strategy:Workflow -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown(blocks, 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /UnknownIcon/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}
```

- [ ] **Step 6: Add a malformed-marker fallback test**

Add this test after the invalid-icon fallback test:

```js
async function testFeatureCardMarkerWithoutIconsFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown(blocks, 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}
```

- [ ] **Step 7: Register the new tests**

Add these calls in `run()` near the other writer tests:

```js
  await testGridWithHeadingColumnsRendersFeatureCards();
  await testGridWithoutHeadingColumnKeepsGenericGrid();
  await testMarkedGridWithoutHeadingFallsBackAndSuppressesMarker();
  await testMarkedGridWithUnsupportedIconFallsBackAndSuppressesMarker();
  await testFeatureCardMarkerWithoutIconsFallsBackAndSuppressesMarker();
```

- [ ] **Step 8: Run the writer test and confirm failure**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: FAIL because `__markdown()` still emits the marker paragraph, `__grid()` still renders `<Grid>` for marked feature-card grids, and marker icon metadata is not parsed yet.

### Task 2: Implement FeatureCardGrid UI And Global MDX Registration

**Files:**
- Create: `src/components/FeatureCardGrid/index.tsx`
- Create: `src/components/FeatureCardGrid/styles.module.css`
- Modify: `src/theme/MDXComponents/index.tsx`
- Modify: `plugins/mdx-parse/mdxPatcher.js`
- Modify: `plugins/mdx-parse/mdxPatcher.test.js`

- [ ] **Step 1: Create the FeatureCardGrid component**

Create `src/components/FeatureCardGrid/index.tsx`:

```tsx
import React, {type ReactNode} from 'react';
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Scale,
  Sparkles,
  Workflow,
} from 'lucide-react';
import styles from './styles.module.css';

const ICONS = {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Scale,
  Sparkles,
  Workflow,
};

type IconName = keyof typeof ICONS;

export function FeatureCard({
  icon = 'Sparkles',
  title,
  children,
}: {
  icon?: IconName;
  title: string;
  children: ReactNode;
}): ReactNode {
  const Icon = ICONS[icon] ?? Sparkles;
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <Icon size={17} strokeWidth={1.9} />
        </span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>{children}</div>
    </article>
  );
}

export default function FeatureCardGrid({
  columns = 3,
  children,
}: {
  columns?: number;
  children: ReactNode;
}): ReactNode {
  const safeColumns = Math.min(4, Math.max(1, Number(columns) || 3));
  return (
    <div className={styles.grid} style={{'--feature-card-columns': safeColumns} as React.CSSProperties}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create FeatureCardGrid styles**

Create `src/components/FeatureCardGrid/styles.module.css`:

```css
.grid {
  --feature-card-columns: 3;
  display: grid;
  grid-template-columns: repeat(var(--feature-card-columns), minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0 24px;
}

.card {
  border: 1px solid var(--zd-surface-border, #e3e3dd);
  border-radius: 8px;
  background: var(--zd-surface-0, #fcfcfb);
  padding: 16px;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 8px;
  color: var(--ifm-color-primary, #175fff);
  background: rgba(23, 95, 255, 0.08);
}

.title {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.3;
  font-weight: 650;
}

.body {
  color: var(--zd-gray-600, #5f6368);
  font-size: 0.93rem;
  line-height: 1.55;
}

.body > :last-child {
  margin-bottom: 0;
}

.body ul,
.body ol {
  margin: 0;
  padding-left: 1.15rem;
}

@media (max-width: 996px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Register the components globally**

In `src/theme/MDXComponents/index.tsx`, add:

```tsx
import FeatureCardGrid, {FeatureCard} from '@site/src/components/FeatureCardGrid';
```

Then add both names to `MDXComponents`:

```tsx
  FeatureCardGrid,
  FeatureCard,
```

- [ ] **Step 4: Allow the components in the MDX patcher**

In `plugins/mdx-parse/mdxPatcher.js`, add `FeatureCardGrid` and `FeatureCard` anywhere `KNOWN_JSX_TAGS` and `safeUppercaseTags` list custom components:

```js
'RestSpecs', 'Stories', 'Supademo', 'FeatureNote', 'FeatureCardGrid', 'FeatureCard',
```

- [ ] **Step 5: Add an MDX patcher regression test**

In `plugins/mdx-parse/mdxPatcher.test.js`, add this fixture near `featureNote`:

```js
const featureCardGrid = [
    '<FeatureCardGrid columns={2}>',
    '<FeatureCard icon="AlertTriangle" title="Problem">',
    '',
    '- Each row may contain many vectors.',
    '',
    '</FeatureCard>',
    '</FeatureCardGrid>',
].join('\n');
```

Add this test after `testFeatureNoteIsPreservedAsGlobalMdxComponent()`:

```js
async function testFeatureCardGridIsPreservedAsGlobalMdxComponent() {
    const patched = await applyMdxPatches(featureCardGrid);
    assert.equal(patched, featureCardGrid);
    await compileToString(patched);
}
```

Register it in `run()`:

```js
    await testFeatureCardGridIsPreservedAsGlobalMdxComponent();
```

- [ ] **Step 6: Run MDX patcher tests**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: PASS after the allowlist and global JSX preservation changes.

### Task 3: Implement Explicit-Marker Writer Feature-Card Grid Rendering

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`

- [ ] **Step 1: Add component names to the writer JSX allowlist**

In `plugins/lark-docs/larkDocWriter.js`, extend `KNOWN_JSX_TAGS`:

```js
'RestSpecs', 'Stories', 'Supademo', 'FeatureNote', 'FeatureCardGrid', 'FeatureCard',
```

- [ ] **Step 2: Add feature-card imports during page writing**

After the existing `if (markdown.match(/\<Grid/g))` import block, add:

```js
        if (markdown.match(/\<FeatureCardGrid/g)) {
            imports = imports + "\n\nimport FeatureCardGrid, { FeatureCard } from '@site/src/components/FeatureCardGrid';"
        }
```

- [ ] **Step 3: Add feature-card grid helper methods before `async __grid()`**

Add these methods immediately before `async __grid(block, indent)`:

```js
    __feature_card_icon_names() {
        return new Set(['AlertTriangle', 'Archive', 'BadgeCheck', 'Scale', 'Sparkles', 'Workflow'])
    }

    __parse_feature_card_grid_marker(markdown) {
        const text = String(markdown || '').trim()
        const markerMatch = text.match(/^<!--\s*zdoc:feature-card-grid(?:\s+(.*?))?\s*-->$/)
        if (!markerMatch) return null

        const match = String(markerMatch[1] || '').match(/^icons=(.*?)$/)
        if (!match) return { valid: false, pairs: [] }

        if (!match[1].trim()) return { valid: false, pairs: [] }

        const pairs = match[1].split(',').map(pair => {
            const trimmed = pair.trim()
            const separator = trimmed.lastIndexOf(':')
            if (separator <= 0 || separator === trimmed.length - 1) return null
            return {
                title: trimmed.slice(0, separator).trim(),
                icon: trimmed.slice(separator + 1).trim(),
            }
        })

        if (pairs.length === 0 || pairs.some(pair => !pair)) return { valid: false, pairs: [] }
        return { valid: true, pairs }
    }

    __is_heading_block(block) {
        const type = this.block_types[block?.block_type - 1]
        return typeof type === 'string' && type.startsWith('heading')
    }

    async __feature_card_title(titleBlock) {
        const level = Number(this.block_types[titleBlock.block_type - 1].replace('heading', ''))
        const rawTitle = await this.__heading(titleBlock[`heading${level}`], level)
        return rawTitle.replace(/\\?\{#[^}]+\}/g, '').replace(/^#+\s*/, '').trim()
    }

    async __feature_card_grid_cards(columns, markerConfig) {
        if (!Array.isArray(columns) || columns.length < 2 || columns.length > 4) return false
        if (!markerConfig?.valid || !Array.isArray(markerConfig.pairs) || markerConfig.pairs.length !== columns.length) return false

        const allowedIcons = this.__feature_card_icon_names()
        const cards = []

        for (let idx = 0; idx < columns.length; idx++) {
            const column = columns[idx]
            const children = (column.children || []).map(child => this.__retrieve_block_by_id(child)).filter(Boolean)
            if (children.length < 2 || !this.__is_heading_block(children[0])) return false

            const title = await this.__feature_card_title(children[0])
            const pair = markerConfig.pairs[idx]
            if (pair.title !== title || !allowedIcons.has(pair.icon)) return false

            cards.push({
                title,
                icon: pair.icon,
                bodyBlocks: children.slice(1),
            })
        }

        return cards
    }

    async __feature_card_grid(cardsConfig, columnSize, indent) {
        const pad = ' '.repeat(indent)
        const cards = await Promise.all(cardsConfig.map(async card => {
            let body = await this.__markdown(card.bodyBlocks, indent + 4)
            body = body.replace(/({#[0-9a-z-]+})/g, "\\$1").trim()

            return [
                `${pad}  <FeatureCard icon="${card.icon}" title="${this.__escapeJsxAttribute(card.title)}">`,
                '',
                body ? body.split('\n').map(line => `${pad}    ${line}`).join('\n') : '',
                '',
                `${pad}  </FeatureCard>`,
            ].join('\n')
        }))

        return [
            `${pad}<FeatureCardGrid columns={${columnSize}}>`,
            cards.join('\n\n'),
            `${pad}</FeatureCardGrid>`,
        ].join('\n')
    }
```

- [ ] **Step 4: Track the marker in `__markdown()`**

In `async __markdown(blocks=null, indent=0)`, before the loop, add:

```js
        let nextGridFeatureCardConfig = null;
```

Inside the loop, immediately after the existing `console.log(...)`, compute the block type once and use it for the feature-card marker handling:

```js
            const blockType = this.block_types[block['block_type'] - 1];
```

Then use `blockType` for the existing branch checks in this method. This keeps the marker reset logic readable and avoids recomputing `this.block_types[...]` in every branch.

Inside the text-block branch, after computing `content` but before `markdown.push(content);`, add:

```js
                const featureCardGridMarker = this.__parse_feature_card_grid_marker(content);
                if (featureCardGridMarker) {
                    nextGridFeatureCardConfig = featureCardGridMarker;
                    continue;
                }

                if (content.trim() !== '') {
                    nextGridFeatureCardConfig = null;
                }
```

Inside the grid branch, replace:

```js
                markdown.push(await this.__grid(block, indent));
```

with:

```js
                markdown.push(await this.__grid(block, indent, nextGridFeatureCardConfig));
                nextGridFeatureCardConfig = null;
```

For all other branches that emit a normal block, reset the marker before pushing output. Apply this explicitly in the branch body, for example:

```js
                nextGridFeatureCardConfig = null;
                markdown.push(idt + await this.__heading(block[`heading${level}`], level));
```

Apply the same `nextGridFeatureCardConfig = null;` pattern before these existing outputs:

- unsupported block type
- heading
- bullet
- ordered list
- code
- quote container
- image
- iframe
- table
- sheet
- callout
- board
- add-ons / Supademo
- source synced
- synthetic `block_type === 999` container

Do not reset for blank text blocks. Do not let a marker survive past any non-grid visible block; the marker only applies to the immediately following rendered grid.

- [ ] **Step 5: Route explicitly marked feature-card grids before generic grid rendering**

Change the method signature:

```js
    async __grid(block, indent, featureCardGridConfig=null) {
```

At the top of `async __grid(block, indent, featureCardGridConfig=null)`, after resolving `grid_columns`, `column_size`, and `width_ratios`, add:

```js
        if (featureCardGridConfig) {
            const cardsConfig = await this.__feature_card_grid_cards(grid_columns, featureCardGridConfig)
            if (cardsConfig) {
                return this.__feature_card_grid(cardsConfig, column_size, indent)
            }

            console.warn('[feature-card-grid] Marker found before grid, but grid columns, titles, or icons do not match the feature-card contract. Falling back to generic Grid.')
        }
```

Keep the existing generic `<Grid>` rendering after this branch unchanged.

- [ ] **Step 6: Run the writer test**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
```

Expected: PASS after marker parsing, source-specified icon validation, and feature-card rendering are implemented.

### Task 4: Validate Integration

**Files:**
- No new files.

- [ ] **Step 1: Run focused MDX patcher tests**

Run:

```bash
node plugins/mdx-parse/mdxPatcher.test.js
```

Expected: PASS with `mdxPatcher regression tests passed`.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run frontend tests**

Run:

```bash
npm run test:frontend
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS. Existing Docusaurus generated-content warnings may still appear; do not treat unchanged broken-link warnings as failures.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js plugins/mdx-parse/mdxPatcher.js plugins/mdx-parse/mdxPatcher.test.js src/components/FeatureCardGrid src/theme/MDXComponents/index.tsx
git commit -m "feat(lark-docs): render source-marked feature card grids"
```

## Self-Review Notes

- Spec coverage: card-grid source marker shape, generic grid fallback, source-provided icon mapping, icon allowlist validation, and global MDX registration all have tasks.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: component names are `FeatureCardGrid` and `FeatureCard` across writer, MDX patcher, and React registration.
