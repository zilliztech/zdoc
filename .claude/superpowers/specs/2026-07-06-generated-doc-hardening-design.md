# Generated Doc Hardening Design

## Goal
Merge the PR #116 UI work while making the generated-output fixes repeatable by moving them into the Lark docs generator, sidebar generation, and build checks instead of relying on hand edits to generated markdown, generated sidebars, or static runtime config.

## Context
PR #116 includes UI changes that should be merged as product/theme work, plus several generated-output changes that will drift the next time docs are fetched or sidebars are regenerated.

The current implementation already has durable support for some PR behavior:

- `plugins/apifox-docs/templates/reference.mdx` emits `sidebar_custom_props: { badges: ['{{ page_method }}']}`.
- `plugins/lark-docs/larkDocWriter.js` emits REST API frontmatter with `sidebar_custom_props: { badges: ['${method}'] }`.
- `src/theme/DocSidebarItem/Link/index.js` already renders method badges from sidebar custom props.
- `src/components/RestSpecs/index.js` already renders Apifox `x-admonition` metadata through `Admonition`.

The work should merge the UI implementation and harden the places where PR #116 patched generator output after the fact.

## Problems

### 1. CLI links point at a stale route
Generated docs and generated sidebars still produce or preserve `/reference/cli/overview`, but the CLI output configuration writes pages under `reference/cli/cli`. Hand-editing generated files to `/reference/cli/cli/overview` will be lost.

### 2. Lark admonition semantics are too literal
The Lark writer maps callout emoji and quote titles directly to Docusaurus admonition type. That causes:

- `Warning` content rendered as `info` or `caution`
- non-destructive caution content rendered as `danger`
- long admonition sentences stored in the `title` prop instead of body text

The PR fixes several generated files manually, but those changes belong in the writer.

### 3. Scenario tabs are generated inside language tabs
The Lark code-tab writer emits language tabs first, then inner scenario tabs per language when code blocks contain split markers. The PR manually changes one page to scenario tabs first, then language tabs inside each scenario. That structure is easier to style and avoids nested-tab overlap.

### 4. Agents sidebar override is unclear
PR #116 changes an agents page from `displayed_sidebar: agentsSidebar` to `displayed_sidebar: default`, but `config/lark-docs.config.ts` still configures the whole agents manual with `agentsSidebar`. A hand edit to generated frontmatter will be overwritten unless the generator supports a page-level sidebar override.

### 5. FeatureNote JSX must survive Lark output
PR #116 introduces a global `FeatureNote` MDX component. If authors put `<FeatureNote>` blocks in Feishu/Lark source content, the writer must preserve that JSX and should not require a local MDX import.

Canonical authoring form:

```mdx
<FeatureNote variant="plan/region" titleHref="/docs/xxx">

faksdjflkadf

</FeatureNote>
```

Authors should not set `icon` or `title` in source. The component should derive display treatment from `variant`, and the body should remain plain Markdown/MDX content between the tags.

Title behavior:

- `variant="plan"` renders the title `Plan Availability`.
- `variant="region"` renders the title `Region Availability`.

### 6. Static Inkeep runtime values need a guard
PR #116 commits `static/env.js` with Inkeep identifiers, including an API-key-shaped value. Even if the key is publishable, committed runtime secrets should be blocked or consciously generated during deployment.

### 7. PR #116 UI changes need merge verification
The UI/theme changes in PR #116 are in scope and should be merged, but they need normal implementation verification. This includes the `FeatureNote` component, MDX component registration, redesigned REST/reference styling, sidebar behavior, image zoom behavior, Inkeep/Search UI styling, ChatPanel updates, and other theme/component changes from the PR.

Generated markdown and generated sidebar edits from the PR should not be accepted as the durable fix unless they are regenerated from hardened source logic.

## Design

### A. Add a Lark output hardening layer
Create focused helpers in `plugins/lark-docs/larkDocWriter.js` and small companion modules only when the logic needs isolation.

The writer should normalize output before writing generated markdown:

1. Convert known internal docs URLs to canonical paths.
2. Normalize admonition type, icon, title, and body.
3. Rewrite repeated language-first scenario tab blocks to scenario-first tab blocks.
4. Preserve allowed global MDX components, including `FeatureNote`, without requiring `icon` or `title` props. `FeatureNote` title text is derived from `variant`.
5. Apply explicit sidebar overrides from config metadata.

### B. Keep Apifox behavior unchanged
Do not add duplicate Apifox method-badge or admonition logic. Apifox already owns these through templates, metadata, and `RestSpecs`.

Apifox tests should still run after the Lark hardening work because shared UI components consume Apifox output.

### C. Add config for page-level Lark sidebar overrides
Extend each manual config with an optional `sidebarOverrides` object:

```ts
sidebarOverrides?: Record<string, string>
```

Keys should match either a page slug or sidebar key. Values should be Docusaurus sidebar names or `default`.

For PR #116, the agents landing page should be declared in config rather than edited in generated markdown:

```ts
sidebarOverrides: {
  "agents-and-prompts": "default"
}
```

### D. Add a build guard for static runtime env files
Add a small Node check that rejects committed runtime config containing populated `INKEEP_*` values in `static/env.js`. Keep `static/env.js` as an empty local placeholder:

```js
window.__ZDOC_ENV__ = {};
```

Deployment can still provide runtime values by writing `static/env.js` or serving an equivalent runtime file outside source control.

### E. Merge and verify PR #116 UI changes
Bring in the UI/theme/source-code changes from PR #116 after separating generated output from durable implementation. Keep these categories:

- Merge UI/source code: `src/components/**`, `src/theme/**`, `src/css/**`, `static/css/**`, image assets, test updates, Docusaurus config/runtime integration changes.
- Harden before accepting generated output: `docs/**` generated from Lark, `docs-agents/**`, `config/generated/**`.
- Replace committed runtime values: keep `static/env.js` as a placeholder and use deployment-time runtime config for actual values.

The merge should be verified with focused unit tests and a Docusaurus build. If feasible, run a local visual smoke test for the changed UI surfaces: docs page with `FeatureNote`, REST reference page, sidebar on desktop/mobile, search modal, and image lightbox.

## Acceptance Criteria

- Running the Lark writer tests proves warning, caution, danger, long-title, and markdown-body admonitions are normalized.
- Running the regression tests proves `/reference/cli/overview` converts to `/reference/cli/cli/overview`.
- Running the tab normalizer tests proves a language-first scenario tab block becomes scenario-first without changing code text.
- Running the frontmatter tests proves agents landing pages can use `displayed_sidebar: default` through config.
- Running an MDX preservation test proves `<FeatureNote>` survives generated markdown.
- Running a description extraction test proves `FeatureNote` is skipped and the first real prose paragraph becomes frontmatter description.
- Running the static env guard fails on populated `INKEEP_*` values and passes on `window.__ZDOC_ENV__ = {};`.
- Existing Apifox tests continue to pass without generator changes.
- PR #116 UI/source-code changes are merged and pass build plus focused UI/runtime tests.

## Out Of Scope

- Rewriting Feishu/Lark source documents automatically.
- Reworking Apifox metadata, templates, or OpenAPI source files.
- Deciding whether the Inkeep browser key is commercially safe to publish.
