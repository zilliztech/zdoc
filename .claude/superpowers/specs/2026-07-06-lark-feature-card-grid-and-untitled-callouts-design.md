# Lark Feature Card Grid Design

## Source Page Evaluated

- Feishu page: `https://zilliverse.feishu.cn/wiki/QpNQwO0uKiPVIdkaC2tcpO21nQd`
- Title: `Choose an EmbeddingList Search Strategy`
- Lark document token: `QpNQwO0uKiPVIdkaC2tcpO21nQd`
- Fetched with: `lark-cli docs +fetch --api-version v2 --doc <url> --detail full --format json`

## Observed Source Patterns

### Feature-card grids

The page contains two Lark `<grid>` blocks that are not generic layout grids. They are semantic card groups:

1. A two-column grid under `Why Search Strategies Exist`.
   - Column 1:
     - `h3`: `Problem`
     - bullet list:
       - `Each row may contain many vectors.`
       - `Exact MaxSim over all rows is expensive.`
       - `Index size and search latency can grow quickly.`
   - Column 2:
     - `h3`: `Strategy`
     - bullet list:
       - `Use an approximate first-stage retrieval method.`
       - `Retrieve more candidates than the requested topK.`
       - `Rerank candidates with exact MaxSim.`

2. A three-column grid under `Suggested Evaluation Workflow`.
   - Column 1:
     - `h3`: `Quality-first`
     - paragraph: `Start with tokenann...`
   - Column 2:
     - `h3`: `Balanced`
     - paragraph: `Try muvera...`
   - Column 3:
     - `h3`: `Compressed`
     - paragraph: `Try lemur...`

The current `larkDocWriter.__grid()` renders every Lark grid as:

```mdx
<Grid columnSize="..." widthRatios="...">

    <div>...</div>

</Grid>
```

That is useful for old generated layout grids but wrong for this source. These grids should render as first-class feature cards with icons, titles, and card body content.

The first implementation plan originally considered detecting this shape implicitly from "each column starts with a heading." That is too hard to explain to technical writers and too easy to trigger accidentally. The durable rule should be explicit in the Lark source.

### Callouts

The page originally contained several callouts whose first child looked like body content rather than a separate title:

```xml
<callout emoji="✅">
  <p><b>Use TokenANN when quality is the first priority.</b> It is the closest approximation...</p>
</callout>
```

Similar callouts:

- `Use MUVERA when TokenANN is too heavy but you do not want a training step.`
- `Use LEMUR when learned compression is worth the training cost.`
- `Prefer per-index params for strategy selection.`
- `Compatibility notes:`
- `Publishing note:`

The source Lark doc has since been updated so these callouts have explicit titles. Because the source now matches the current writer contract, no `larkDocWriter` callout hardening is required in this implementation.

## Desired Behavior

### Feature-card grid output

Writers should mark a feature-card grid explicitly by placing a marker paragraph immediately before the Lark grid. The marker must include readable title-to-icon pairs:

```md
<!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow -->
```

Authoring rule to share with technical writers:

1. Add `<!-- zdoc:feature-card-grid icons=Title:Icon,Title:Icon -->` as its own paragraph immediately before the grid.
2. Create a Lark grid with 2-4 columns.
3. Start each column with an H3. That heading becomes the card title.
4. Put the card body below the H3 as normal Lark paragraphs, bullets, or inline code.
5. Add one `Title:Icon` pair for each grid column. The `Title` must match the column H3 exactly after trimming.
6. Use only supported icon names.
7. Do not add the marker before ordinary layout grids.

For the evaluated page, the intended source markers are:

```md
<!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow -->
```

```md
<!-- zdoc:feature-card-grid icons=Quality-first:BadgeCheck,Balanced:Scale,Compressed:Sparkles -->
```

When a Lark grid is preceded by the explicit marker and each column matches the card pattern, generate:

```mdx
<FeatureCardGrid columns={2}>
  <FeatureCard icon="AlertTriangle" title="Problem">

- Each row may contain many vectors.
- Exact MaxSim over all rows is expensive.
- Index size and search latency can grow quickly.

  </FeatureCard>
  <FeatureCard icon="Workflow" title="Strategy">

- Use an approximate first-stage retrieval method.
- Retrieve more candidates than the requested topK.
- Rerank candidates with exact MaxSim.

  </FeatureCard>
</FeatureCardGrid>
```

The exact icon names should use an allowlisted subset of `lucide-react` icons already present in the project:

- `AlertTriangle`
- `Archive`
- `BadgeCheck`
- `Scale`
- `Sparkles`
- `Workflow`

Icon selection should come from the source marker, not from hidden title-to-icon logic. If a marker is missing icons, has the wrong number of icons, references a title that does not match the grid H3s, or uses an unsupported icon, the writer should warn and fall back to the generic `<Grid>` renderer while suppressing the marker from generated MDX.

The new component must be visually card-like and distinct from the old generic `Grid` component:

- responsive CSS grid: 1 column on mobile, `columns` on desktop
- subtle border/background
- 8px border radius maximum
- icon chip in the upper-left
- title line rendered by the component, not by nested Markdown headings
- body preserves Markdown paragraphs/lists/code spans from the Lark column content

### Existing generic grid output

Do not break existing generated docs that already use `<Grid>`.

Keep the current `<Grid>` renderer as fallback for grids that are not card-grid shaped. Examples already in generated docs include:

- `docs/tutorials/architecture/best-practices/perf-benchmark-vectordb.md`
- `docs/tutorials/development/schema/structarray/use-array-of-structs.md`
- `docs/tutorials/management/billing-management/set-up-payment-method/marketplace-subscription/subscribe-on-azure-marketplace.md`

### Card-grid detection

A Lark grid is a feature-card grid only when all of the following are true:

- The immediately preceding rendered block is a marker paragraph matching `<!-- zdoc:feature-card-grid icons=Title:Icon,Title:Icon -->`.
- Each grid column has a first child that is a heading block (`heading1` through `heading6`), expected to be `heading3` in this page.
- Each column has at least one body child after the heading.
- The column count is between 2 and 4.
- The marker provides exactly one `Title:Icon` pair per column.
- Each marker title matches the corresponding column heading exactly after trimming.
- Each marker icon is in the supported icon allowlist.

The writer should suppress the marker paragraph from generated MDX. If the marker is present but the next grid is malformed, the writer should fall back to the generic `<Grid>` output and print a warning; the marker should still not appear in the generated docs.

## Implementation Boundary

Make the source Lark doc, generator, and UI support agree on an explicit authoring contract. The source change is to add readable marker paragraphs with title-to-icon pairs before the intended feature-card grids. The durable generated-doc fix belongs in `larkDocWriter` and the global MDX components; do not manually edit generated `.md`/`.mdx` docs for this page.

Expected files:

- `plugins/lark-docs/larkDocWriter.js`
- `plugins/lark-docs/larkDocWriter.test.js`
- `plugins/mdx-parse/mdxPatcher.js`
- `plugins/mdx-parse/mdxPatcher.test.js`
- `src/components/FeatureCardGrid/index.tsx`
- `src/components/FeatureCardGrid/styles.module.css`
- `src/theme/MDXComponents/index.tsx`

## Verification

Minimum checks:

```bash
node plugins/lark-docs/larkDocWriter.test.js
node plugins/mdx-parse/mdxPatcher.test.js
npm run typecheck
npm run test:frontend
npm run build
```

Optional page-level check after implementation:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --docToken QpNQwO0uKiPVIdkaC2tcpO21nQd --pubTarget zilliz.saas --skipSourceDown --skipSidebar
```

Then inspect the generated page for `<FeatureCardGrid>` with the source-specified icons.
