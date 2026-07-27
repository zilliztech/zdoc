# New Architecture Build and Legacy Retirement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every English, Japanese, and Chinese documentation build and publication workflow depend exclusively on the profile-driven application, site-owned content roots, unified pnpm workspace, and versioned deployment contracts, then remove the retired root application and workflow paths.

**Architecture:** Keep two deployable site identities: `en` and `zh-CN`. The `en` site is a Docusaurus multilingual build with canonical English content plus the structurally identical `ja-JP` locale under `i18n/ja-JP`; the `zh-CN` site is a single-locale product profile with an independently shaped `content/zh-CN` tree. English and Chinese source publication use `@zilliz/docs-tooling`; Japanese translation, Chinese Reference translation, and the Chinese Guides Tools chapter use one shared Agent engine with separate target contracts, prompts, validation, ownership, and publication checkpoints.

**Tech Stack:** pnpm 10.33, Node.js 22, TypeScript, Docusaurus 3.10, Vitest, Node test runner, GitHub Actions, Docker BuildKit, Nginx, JSON Schema, Agent translation and review APIs.

---

## Non-negotiable target state

- `pnpm build:en` builds English at `/` and Japanese at `/ja-JP/` in one `build/en` artifact.
- The Japanese locale reuses the English `default`, `byoc`, and `reference` plugin graph. Japanese does not get a separate product profile.
- `pnpm build:zh-CN` declares only `zh-CN` and reads no document content below `i18n/`.
- Canonical English content lives only below `content/en`; independently produced Chinese content lives only below `content/zh-CN`.
- Japanese Agent translation publishes from `content/en/**` to `i18n/ja-JP/**`.
- Chinese Reference Agent translation publishes from `content/en/reference/**` to `content/zh-CN/reference/**` and regenerates the checked-in source/translation manifests.
- Chinese Guides Tools Agent translation publishes `content/en/guides/tutorials/tools/**` to `content/zh-CN/guides/tutorials/tools/**`, including a translated Tools navigation fragment.
- Chinese Guides outside `tutorials/tools`, BYOC, and On-premise continue to be produced from their Chinese source definitions, not translated from the English information architecture.
- Source publication, Agent translation, checkpoint validation, and site builds use the same checked-out `zdoc` SHA and the same pnpm lockfile.
- No production workflow invokes the retired root Docusaurus application, `run-content-group.js`, `config/generated`, or the old `docs`, `docs-byoc`, and `reference` roots.
- The final runtime images contain only Nginx, the selected `build/<site>` output, and required Nginx runtime configuration.
- Jenkins remains external. This plan finishes with a verified repository contract that the four `vdc-jenkins` pipelines can consume.

## Target content and build graph

```text
English Feishu / REST generators
            |
            v
 content/en + generated/en
       |               |
       |               +----------------------+
       v                                      v
 Japanese Agent target                 Chinese Agent targets
 i18n/ja-JP                            content/zh-CN/reference
       |                               content/zh-CN/guides/tutorials/tools
       v                               generated/zh-CN/manifests + Tools nav
 pnpm build:en                                |
 English + Japanese image                     |
                                              v
Chinese Feishu sources ------------> remaining zh-CN guides/byoc/onpremise
                                              |
                                              v
                                      pnpm build:zh-CN
                                      Chinese image
```

## Local `master` commit audit

At planning time, local `master` is eight commits ahead of `origin/master` and seventeen commits behind it. All eight local-only commits are documentation commits, and `master` is already an ancestor of `codex/unified-docs/01-foundation`; therefore no cherry-pick is required. Treat their content as design history and migrate only the still-valid contracts:

| Commit | Content | New-architecture disposition |
|---|---|---|
| `eb353e8f9` | Docs Agent chat integration design | Retain the same-origin chat/search/feedback contract, StatefulSet affinity, SSE behavior, interrupt route, and secret boundary through `packages/docs-ui`, site-owned Nginx, and `deploy/runtime`. |
| `5e2f2d3a3` | Docs Agent chat implementation plan | Do not execute its root `Dockerfile`, root `nginx.conf`, root `docusaurus.config.ts`, or root `src` paths. Mark it historical after verifying every live contract has a new-path owner and regression test. |
| `1a4736af9` | Unified English/Chinese profile design | Retain as the approved architecture baseline, amended by Japanese-in-English and Agent-produced translation decisions in this plan. |
| `c0c92274c` | Clean-room worktree amendments | Already embodied by the current worktree and migration gates; retain the decision record. |
| `5a228363d` | Greenfield integrity controls | Carry forward clean checkout, collision, symlink, provenance, and archive-rehearsal gates. |
| `b39a609bd` | Reference root deduplication | Carry forward exactly one English Reference tree and one Chinese Reference translation tree; do not recreate staging content roots. |
| `6efb7c131` | Jenkins dual release modes | Carry forward rebuild and verified specified-image promotion in the external Jenkins contract. |
| `b20b942fa` | Unified-site implementation plan | Treat as a completed/superseded foundation plan. This retirement plan owns remaining cutover work and overrides obsolete `content/zh-CN/agents`, non-Agent Chinese Reference/Tools production, and English-only locale assumptions. |

The external Kubernetes service named `chat-proxy` is not the nonexistent local `chat-proxy/` workspace package. Remove the stale workspace entry and `npm --prefix chat-proxy` test command, but preserve the Nginx `/api/` upstream used by search and feedback.

## Phase 1: Make the target architecture executable

### Task 1: Add a retirement architecture gate before deleting anything

**Files:**
- Create: `scripts/architecture/verify-retired-layout.mjs`
- Create: `scripts/architecture/verify-retired-layout.test.mjs`
- Modify: `package.json`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`

- [ ] **Step 1: Write a failing fixture-driven architecture test**

Create fixtures in temporary directories and assert that the verifier rejects each retired dependency independently:

```js
test('rejects retired application and workflow paths', async () => {
  for (const retired of [
    'docusaurus.config.ts',
    'Dockerfile',
    'nginx.conf',
    'docker-entrypoint.d/40-zdoc-env.sh',
    'scripts/docs-workflow/run-content-group.js',
    'config/generated/guides.sidebar.js',
    'docs/tutorials/example.md',
    'docs-byoc/tutorials/example.md',
    'reference/api/example.md',
  ]) {
    const root = fixture({[retired]: 'legacy\n'});
    assert.throws(() => verifyRetiredLayout(root), new RegExp(retired.replaceAll('/', '\\/')));
  }
});

test('permits the intentional Japanese Docusaurus translation root', () => {
  const root = fixture({
    'content/en/guides/content-manifest.json': '{}\n',
    'content/zh-CN/guides/content-manifest.json': '{}\n',
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md': '# A\n',
  });
  assert.doesNotThrow(() => verifyRetiredLayout(root));
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/architecture/verify-retired-layout.test.mjs`

Expected: FAIL because `verify-retired-layout.mjs` does not exist.

- [ ] **Step 3: Implement an exact retired-path and forbidden-reference verifier**

The verifier must:

1. Reject the exact retired paths listed in the test.
2. Scan tracked `.js`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.json`, `.yml`, `.yaml`, `.sh`, and `.md` control files.
3. Reject production references to `run-content-group.js`, `config/generated`, root `docs`, root `docs-byoc`, or root `reference`.
4. Exempt migration evidence and this plan from source-reference scanning.
5. Explicitly allow `i18n/ja-JP` and reject `i18n/zh-CN`.

Export `verifyRetiredLayout(repositoryRoot)` and run it from the CLI entry point.

- [ ] **Step 4: Expose the gate through pnpm**

Add:

```json
"test:retirement": "node --test scripts/architecture/verify-retired-layout.test.mjs && node scripts/architecture/verify-retired-layout.mjs"
```

Update `site-validation-workflow.test.mjs` to require a `retirement` job in `.github/workflows/site-validation.yml` before the aggregate gate.

- [ ] **Step 5: Run the focused test**

Run: `pnpm test:retirement`

Expected: fixture tests pass; the repository scan fails and prints the currently retained legacy paths. This repository-level failure remains expected until Task 10.

- [ ] **Step 6: Commit the executable retirement contract**

```bash
git add scripts/architecture package.json deploy/contracts/site-validation-workflow.test.mjs
git commit -m "test: codify legacy layout retirement gate"
```

### Task 2: Model locales separately from deployable site identities

**Files:**
- Modify: `packages/site-config/src/schema.ts`
- Modify: `packages/site-config/src/sites/en.ts`
- Modify: `packages/site-config/src/sites/zh-CN.ts`
- Modify: `packages/site-config/src/resolve.test.ts`
- Modify: `apps/docs/src/config/createDocusaurusConfig.ts`
- Modify: `apps/docs/src/config/createDocusaurusConfig.test.ts`

- [ ] **Step 1: Write failing locale-contract tests**

Add profile expectations:

```ts
expect(enProfile.localization).toEqual({
  defaultLocale: 'en',
  translationRoot: 'i18n',
  locales: [
    {id: 'en', htmlLang: 'en', source: 'canonical'},
    {id: 'ja-JP', htmlLang: 'ja-JP', source: 'docusaurus-i18n'},
  ],
});

expect(zhCNProfile.localization).toEqual({
  defaultLocale: 'zh-CN',
  translationRoot: 'i18n',
  locales: [{id: 'zh-CN', htmlLang: 'zh-Hans', source: 'canonical'}],
});
```

Add Docusaurus config assertions:

```ts
expect(config.i18n).toEqual({
  defaultLocale: 'en',
  path: repositoryPath('i18n'),
  locales: ['en', 'ja-JP'],
  localeConfigs: {
    en: {htmlLang: 'en'},
    'ja-JP': {htmlLang: 'ja-JP'},
  },
});
```

For the Chinese profile assert `locales: ['zh-CN']` and that no content plugin path begins with `i18n/`.

- [ ] **Step 2: Run the tests and verify RED**

Run: `pnpm vitest run packages/site-config/src/resolve.test.ts apps/docs/src/config/createDocusaurusConfig.test.ts`

Expected: FAIL because `localization` is not part of `SiteProfileSchema`.

- [ ] **Step 3: Add strict localization schemas**

Add these concepts to `schema.ts`:

```ts
const LocaleProfileSchema = z.object({
  id: z.enum(['en', 'ja-JP', 'zh-CN']),
  htmlLang: z.string().min(1),
  source: z.enum(['canonical', 'docusaurus-i18n']),
}).strict();

const LocalizationProfileSchema = z.object({
  defaultLocale: z.enum(['en', 'zh-CN']),
  translationRoot: RepositoryRelativePathSchema,
  locales: z.array(LocaleProfileSchema).min(1),
}).strict();
```

Refine it so that:

- the default locale appears exactly once and is canonical;
- only `en` may include `ja-JP`;
- `zh-CN` may contain only `zh-CN`;
- `ja-JP` must use `docusaurus-i18n`;
- no locale ID is duplicated.

- [ ] **Step 4: Populate both profiles and generate Docusaurus i18n config**

Set `i18n.path` to the repository-root `i18n` directory. Keep plugin IDs `default`, `byoc`, and `reference` unchanged so the existing folders map to:

```text
i18n/ja-JP/docusaurus-plugin-content-docs/current
i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current
i18n/ja-JP/docusaurus-plugin-content-docs-reference/current
```

- [ ] **Step 5: Verify the focused tests and profile tests**

Run: `pnpm vitest run packages/site-config apps/docs/src/config/createDocusaurusConfig.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the locale model**

```bash
git add packages/site-config apps/docs/src/config
git commit -m "feat(site): include Japanese in the English profile"
```

### Task 3: Restore required build capabilities inside the new application boundary

**Files:**
- Modify: `apps/docs/src/config/createDocusaurusConfig.ts`
- Modify: `apps/docs/src/config/createDocusaurusConfig.test.ts`
- Modify: `apps/docs/plugins/embed-markdown/index.js`
- Modify: `apps/docs/plugins/llms-txt/index.js`
- Modify: `apps/docs/plugins/structured-data/index.js`
- Modify: `packages/docs-ui/src/shared/components/CopyPage/index.js`
- Modify: `packages/docs-ui/src/shared/theme/Heading/CopyPageButton.tsx`
- Modify: `migration/capabilities.json`

- [ ] **Step 1: Add failing plugin-registration tests**

For the English profile require:

```ts
expect(pluginNames(config)).toEqual(expect.arrayContaining([
  'embed-markdown',
  'llms-txt',
  'structured-data',
]));
```

Assert each plugin receives source descriptors derived from `profile.content`, not hard-coded `docs`, `docs-byoc`, or `reference` folders. Assert the Japanese locale is handled by Docusaurus and is not registered as a second content tree.

For Chinese, require `structured-data` and `llms-txt` only if the capability is intentionally shared; record any site-specific difference explicitly in the profile and tests.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run apps/docs/src/config/createDocusaurusConfig.test.ts packages/docs-ui/src/docusaurus.test.ts`

Expected: FAIL because the new config currently registers none of these plugins.

- [ ] **Step 3: Convert plugin options to profile-derived source descriptors**

Use this shape for every content source:

```ts
const sources = profile.content.map(content => ({
  id: content.id,
  folder: repositoryPath(content.sourcePath),
  route: `/${canonicalRouteKey(content.routeBasePath)}`,
  outputFile: content.id === 'default' ? 'cloud-guides' : content.id,
  label: content.id === 'default' ? 'Cloud Guides' : content.id,
}));
```

Update each plugin to accept absolute source folders and stable plugin IDs. Do not infer legacy roots from route names.

- [ ] **Step 4: Register the plugins from `createDocusaurusConfig`**

Keep build-time plugins under `apps/docs/plugins` because they are application composition units. Remove the nonexistent replacement paths from `migration/capabilities.json` and point capabilities to the actual plugin files plus their contract tests.

- [ ] **Step 5: Add output assertions**

Build tests must require:

- `build/en/llms.txt` and the per-source LLMS files;
- structured-data output for a representative English and Japanese page;
- `embed-markdown` plugin data consumed by `CopyPageButton`;
- no path in generated output mentions the old source roots.

- [ ] **Step 6: Run focused tests**

Run: `pnpm test:frontend`

Expected: all frontend tests pass.

- [ ] **Step 7: Commit restored application capabilities**

```bash
git add apps/docs packages/docs-ui migration/capabilities.json
git commit -m "feat(site): restore profile-driven build plugins"
```

### Task 4: Replace Docusaurus CLI side effects with docs-tooling commands

**Files:**
- Create: `packages/docs-tooling/src/mdx/validate.cjs`
- Create: `packages/docs-tooling/src/mdx/index.ts`
- Create: `packages/docs-tooling/src/mdx/validate.test.cjs`
- Create: `packages/docs-tooling/src/mdx/cli.test.ts`
- Create: `packages/docs-tooling/src/links/check.ts`
- Create: `packages/docs-tooling/src/links/check.test.ts`
- Create: `packages/docs-tooling/src/reporting/lark.ts`
- Create: `packages/docs-tooling/src/reporting/lark.test.ts`
- Modify: `packages/docs-tooling/src/cli-main.ts`
- Modify: `packages/docs-tooling/src/index.ts`
- Modify: `packages/docs-tooling/package.json`
- Modify: `packages/docs-tooling/src/lark/larkDocWriter.js`
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/run-doc-build-stage.js`
- Modify: `scripts/docs-workflow/report-live-card.sh`
- Modify: `.github/workflows/check-404.yml`

- [ ] **Step 1: Write failing module and CLI contract tests**

Keep the MDX patcher core in `validate.cjs`. This is an intentional CommonJS compatibility boundary because both `packages/docs-tooling/src/lark/larkDocWriter.js` (inside a nested `type: commonjs` package) and `scripts/translation/agentRunner.js` load the functions synchronously with `require()`. Export the same object through `packages/docs-tooling/src/mdx/index.ts` for the TypeScript CLI and package API:

```ts
import validator from './validate.cjs';

export const {
  applyMdxPatches,
  validateMdxStructure,
  removeTabsHallucinations,
  unescapeKnownJsxTags,
  escapeMathBraces,
  escapeHtmlElementBraces,
  normalizeNestedPlaintextFences,
  normalizeCodeTagContent,
  convertHtmlCommentsToMdx,
  escapeNonHtmlTags,
  createFenceTracker,
  getFencedCodeRanges,
  createFencedCodeBlock,
} = validator;
```

In `validate.test.cjs`, require `./validate.cjs` directly and port the current patcher regression suite. In `cli.test.ts`, import the TypeScript wrapper and prove the CLI and CommonJS consumers observe the same patch/validation results.

Cover these commands:

```text
pnpm docs-tooling validate-mdx --path <directory>
pnpm docs-tooling check-links --site <en|zh-CN> --output <report>
pnpm docs-tooling report-card <create|advance|note|finish> ...
```

Tests must reject symlinked inputs, paths outside the repository, malformed report targets, unknown sites, and missing credentials without printing secrets.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node packages/docs-tooling/src/mdx/validate.test.cjs
pnpm vitest run packages/docs-tooling/src/mdx/cli.test.ts packages/docs-tooling/src/links packages/docs-tooling/src/reporting
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Move reusable MDX validation below docs-tooling**

Move the reusable exports from `apps/docs/plugins/mdx-parse/mdxPatcher.js` into `packages/docs-tooling/src/mdx/validate.cjs`. Keep `validate.cjs` free of ESM-only imports and TypeScript syntax so these exact CommonJS imports work without a loader:

```js
// packages/docs-tooling/src/lark/larkDocWriter.js
const mdx = require('../mdx/validate.cjs')

// scripts/translation/agentRunner.js
const {
  applyMdxPatches,
  validateMdxStructure,
} = require('../../packages/docs-tooling/src/mdx/validate.cjs')
```

Expose the same functions to `cli-main.ts` and `src/index.ts` only through `packages/docs-tooling/src/mdx/index.ts`. Update the Lark writer and Agent runner so no package imports from `apps/docs`. Do not make the CommonJS consumers import `.ts`, and do not add a runtime TypeScript loader.

- [ ] **Step 4: Wrap link checking and Lark reporting in explicit CLI commands**

Port behavior and tests from `apps/docs/plugins/link-checks` and `plugins/report-to-lark`. The site build must no longer register either plugin just to expose a CLI command.

- [ ] **Step 5: Replace workflow calls**

Replace every `npx docusaurus mdx-parse`, `npx docusaurus link-checks`, and `npx docusaurus report-to-lark` call with the corresponding `pnpm docs-tooling` command.

- [ ] **Step 6: Run tooling and workflow policy tests**

Run:

```bash
node packages/docs-tooling/src/mdx/validate.test.cjs
pnpm test:frontend
pnpm test:workflow-policy
pnpm test:check-404
```

Expected: PASS; the CommonJS regression suite and TypeScript CLI adapter agree, and no production workflow invokes a Docusaurus CLI extension.

- [ ] **Step 7: Commit the explicit tooling boundary**

```bash
git add packages/docs-tooling scripts .github/workflows/check-404.yml
git commit -m "refactor(tooling): replace Docusaurus CLI side effects"
```

## Phase 2: Move all content production to the new paths

### Task 5: Replace the legacy content-group adapter with a typed publication graph

**Files:**
- Create: `packages/docs-tooling/src/workflows/groups.ts`
- Create: `packages/docs-tooling/src/workflows/groups.test.ts`
- Create: `packages/docs-tooling/src/workflows/run.ts`
- Create: `packages/docs-tooling/src/workflows/run.test.ts`
- Create: `generated/zh-CN/manifests/guides-source-publication.json`
- Modify: `packages/docs-tooling/src/cli-main.ts`
- Modify: `scripts/docs-workflow/content-groups.js`
- Modify: `scripts/docs-workflow/group-paths.js`
- Modify: `scripts/docs-workflow/prepare-content-group-workspace.js`
- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_assemble-guides.yml`

- [ ] **Step 1: Write failing site-aware group tests**

Define exact groups:

```ts
expect(resolvePublicationGroup('en', 'guides')).toEqual({
  site: 'en',
  manuals: ['guides', 'guides-byoc'],
  ownedPaths: [
    'content/en/guides',
    'content/en/byoc',
    'generated/en/sidebars/guides.sidebar.js',
    'generated/en/sidebars/guides-byoc.sidebar.js',
  ],
});

expect(resolvePublicationGroup('zh-CN', 'guides')).toEqual({
  site: 'zh-CN',
  manuals: ['guides', 'guides-byoc'],
  ownedPaths: [
    'content/zh-CN/guides',
    'content/zh-CN/byoc',
    'generated/zh-CN/sidebars/guides.sidebar.js',
    'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
  ],
  protectedPaths: [
    'content/zh-CN/guides/tutorials/tools',
    'generated/zh-CN/sidebars/tools.sidebar.js',
    'generated/zh-CN/manifests/tools-translations.json',
  ],
  publicationManifest: 'generated/zh-CN/manifests/guides-source-publication.json',
});
```

Also require `zh-CN/onpremise`, English Reference groups, and reject Chinese Reference or Chinese Tools fetch groups because both are Agent-produced.

- [ ] **Step 2: Run the tests and verify RED**

Run: `pnpm vitest run packages/docs-tooling/src/workflows`

Expected: FAIL because the typed workflow graph does not exist.

- [ ] **Step 3: Implement `docs-tooling publish-group`**

Expose:

```text
pnpm docs-tooling publish-group --site en --group guides --stage fetch
pnpm docs-tooling publish-group --site en --group guides --stage validate
pnpm docs-tooling publish-group --site en --group guides --stage publish
pnpm docs-tooling publish-group --site zh-CN --group guides --stage fetch
pnpm docs-tooling publish-group --site zh-CN --group onpremise --stage publish
```

The command must derive manuals, stages, publication ownership, generated sidebars, and source snapshots from the registry. It must not spawn another wrapper script.

Chinese Guides publication must be manifest-owned rather than a whole-directory replacement. It may create, replace, or retire only files recorded in its own Chinese-source publication manifest; it must reject any staged write or deletion below the three protected Tools paths. This is an ownership rule, not a copy-after-build overlay: the Agent-owned Tools subtree is never materialized into a Chinese Guides staging tree and never restored from an unverified snapshot.

- [ ] **Step 4: Convert existing workflow helpers into thin consumers**

Until Task 10 deletes them, legacy helper modules may import the new registry for checkpoint compatibility, but they may not contain independent path maps.

- [ ] **Step 5: Update reusable GitHub Actions workflows**

Add a required `site` input. Replace calls to `run-content-group.js` with `pnpm docs-tooling publish-group`. Replace every legacy owned path with `content/<site>` and `generated/<site>` equivalents. Add a policy fixture proving a Chinese Guides publication cannot modify, omit-delete, or claim the Agent-owned Tools subtree.

- [ ] **Step 6: Run publication and workflow tests**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/workflows packages/docs-tooling/src/validation
pnpm test:workflow-policy
node --test scripts/sdk-reference-workflow.test.js
```

Expected: PASS; no workflow contains `run-content-group.js`, `config/generated`, root `docs`, root `docs-byoc`, or root `reference` publication paths.

- [ ] **Step 7: Commit the unified production graph**

```bash
git add packages/docs-tooling scripts/docs-workflow .github/workflows generated/zh-CN/manifests/guides-source-publication.json
git commit -m "refactor(ci): publish site-owned content through docs-tooling"
```

## Phase 3: Rebase all Agent translation products on the new architecture

### Task 6: Introduce explicit Agent translation target contracts

**Files:**
- Create: `packages/docs-tooling/src/translation/schema.ts`
- Create: `packages/docs-tooling/src/translation/targets.ts`
- Create: `packages/docs-tooling/src/translation/targets.test.ts`
- Create: `packages/docs-tooling/src/translation/candidates.ts`
- Create: `packages/docs-tooling/src/translation/candidates.test.ts`
- Create: `config/tools-retirements.json`
- Create: `generated/zh-CN/manifests/tools-translations.json`
- Create: `generated/zh-CN/sidebars/tools.sidebar.js`
- Modify: `packages/docs-tooling/src/index.ts`
- Modify: `packages/site-config/src/sidebars/zh-CN/guides.ts`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/sourceDelta.js`

- [ ] **Step 1: Write failing target-contract tests**

Require these immutable contracts:

```ts
expect(resolveTranslationTarget('ja-JP')).toMatchObject({
  id: 'ja-JP',
  sourceSite: 'en',
  locale: 'ja-JP',
  state: {kind: 'cache', path: '.translation-cache/ja-JP.json'},
  validation: ['validate-mdx', 'validate-coverage', 'build:en'],
});

expect(resolveTranslationTarget('zh-CN-reference')).toMatchObject({
  id: 'zh-CN-reference',
  sourceSite: 'en',
  targetSite: 'zh-CN',
  locale: 'zh-CN',
  sourceRoot: 'content/en/reference',
  targetRoot: 'content/zh-CN/reference',
  state: {kind: 'reference-manifest', path: 'generated/zh-CN/manifests/reference-translations.json'},
  validation: ['reference-manifest', 'validate-reference', 'build:zh-CN'],
});

expect(resolveTranslationTarget('zh-CN-tools')).toMatchObject({
  id: 'zh-CN-tools',
  sourceSite: 'en',
  targetSite: 'zh-CN',
  locale: 'zh-CN',
  sourceRoot: 'content/en/guides/tutorials/tools',
  targetRoot: 'content/zh-CN/guides/tutorials/tools',
  sidebarSource: 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools',
  sidebarTarget: 'generated/zh-CN/sidebars/tools.sidebar.js',
  state: {kind: 'tools-manifest', path: 'generated/zh-CN/manifests/tools-translations.json'},
  validation: ['validate-mdx', 'validate-tools-sidebar', 'validate-coverage', 'build:zh-CN'],
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `pnpm vitest run packages/docs-tooling/src/translation`

Expected: FAIL because the target registry does not exist.

- [ ] **Step 3: Implement exact mappings**

Japanese mappings:

```text
content/en/guides/tutorials  -> i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials
content/en/byoc/tutorials    -> i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials
content/en/reference         -> i18n/ja-JP/docusaurus-plugin-content-docs-reference/current
```

Chinese Reference mapping:

```text
content/en/reference/<relative> -> content/zh-CN/reference/<relative>
```

Chinese Guides Tools mappings:

```text
content/en/guides/tutorials/tools/<relative>
  -> content/zh-CN/guides/tutorials/tools/<relative>
generated/en/sidebars/guides.sidebar.js#category:tutorials/tools
  -> generated/zh-CN/sidebars/tools.sidebar.js
```

The translated sidebar fragment preserves document IDs, hrefs, keys, and nesting while translating human-visible labels. `packages/site-config/src/sidebars/zh-CN/guides.ts` inserts the fragment at one explicitly configured Chinese navigation position; it must not replace the rest of the Chinese Guides sidebar or assume English/Chinese top-level structures match.

Require path normalization, NFC names, regular files, non-symlink ancestors, disjoint target ownership, and deterministic candidate ordering.

- [ ] **Step 4: Preserve master candidate reasons without preserving legacy paths**

Reuse `current_delta`, `missing_target`, and `stale_source`. For Japanese, compare `.translation-cache/ja-JP.json`. For Chinese Reference and Chinese Tools, compare their previous committed translation manifests to current source hashes; do not add a second Chinese translation cache.

- [ ] **Step 5: Add explicit retirement behavior**

Japanese source deletions may delete their exact mapped targets through the existing authorized source-delta mechanism.

Chinese Reference deletions and renames must emit a retirement-candidate report and stop publication until `config/reference-retirements.json` contains the exact source/target pair and reason. They must never silently delete a Chinese target.

Chinese Tools deletions, renames, and sidebar removals must follow the same stop-and-decide rule through `config/tools-retirements.json`. Automatic publication must never delete a translated Tools page or navigation node solely because an English source disappeared.

- [ ] **Step 6: Run target and Reference tests**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/translation packages/docs-tooling/src/reference packages/docs-tooling/src/validation/translation.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the translation product model**

```bash
git add packages/docs-tooling packages/site-config scripts/translation config/tools-retirements.json generated/zh-CN
git commit -m "feat(translation): define Japanese and Chinese translation targets"
```

### Task 7: Generalize the Agent engine while keeping locale-specific prompts

**Files:**
- Create: `.github/prompts/codex-translation-agent.ja-JP.md`
- Create: `.github/prompts/codex-review-agent.ja-JP.md`
- Create: `.github/prompts/codex-rest-spec-translation-agent.ja-JP.md`
- Create: `.github/prompts/codex-translation-agent.zh-CN-reference.md`
- Create: `.github/prompts/codex-review-agent.zh-CN-reference.md`
- Create: `.github/prompts/codex-rest-spec-translation-agent.zh-CN-reference.md`
- Create: `.github/prompts/codex-translation-agent.zh-CN-tools.md`
- Create: `.github/prompts/codex-review-agent.zh-CN-tools.md`
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/restSpecLocalization.js`
- Modify: `scripts/translation/restSpecLocalization.test.js`

- [ ] **Step 1: Write failing prompt-selection tests**

Require `buildTranslationMessages`, `buildReviewMessages`, and REST translation to resolve prompts from the manifest `target` field, not from a hard-coded Japanese filename.

```js
assert.equal(promptNamesFor('ja-JP').translation, 'codex-translation-agent.ja-JP.md');
assert.equal(promptNamesFor('zh-CN-reference').review, 'codex-review-agent.zh-CN-reference.md');
assert.equal(promptNamesFor('zh-CN-tools').translation, 'codex-translation-agent.zh-CN-tools.md');
assert.throws(() => promptNamesFor('zh-CN'), /Unsupported translation target/);
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run scripts/translation/agentRunner.test.js scripts/translation/restSpecLocalization.test.js`

Expected: FAIL because prompt selection is hard-coded to Japanese.

- [ ] **Step 3: Split prompts by translation product**

Japanese prompts preserve the current master behavior and terminology.

Chinese Reference prompts must additionally require:

- preservation of API names, signatures, code, anchors, IDs, and relative paths;
- natural Simplified Chinese developer-documentation prose;
- no import of English-only product claims into Chinese product documentation;
- no structural rename or move;
- exact REST structured-data round trip.

Chinese Tools prompts must require:

- natural Simplified Chinese prose for the complete Tools chapter;
- preservation of code, commands, package names, product identifiers, URLs, anchors, MDX components, and document IDs;
- translation of headings, frontmatter titles/descriptions, link text, image alt text, and sidebar labels;
- no movement outside `tutorials/tools`, no import of the removed `docs-agents` information architecture, and no restructuring of the surrounding Chinese Guides tree;
- a review failure when a page remains materially English except for intentionally preserved technical tokens.

- [ ] **Step 4: Add `target` to the exact manifest schema**

The Agent runner must reject a manifest whose `locale`, source path, target path, or prompt target disagrees with the target registry.

- [ ] **Step 5: Retain master reliability mechanisms**

Keep provider retries, file retries, timeouts, chunking, translation review, correction, MDX compilation, structural validation, partial-result reporting, and secret-safe error output unchanged unless a focused test requires an adjustment.

- [ ] **Step 6: Run all translation engine tests**

Run: `pnpm test:translation`

Expected: PASS for Japanese, Chinese Reference, and Chinese Tools fixtures.

- [ ] **Step 7: Commit the shared Agent engine**

```bash
git add .github/prompts scripts/translation
git commit -m "feat(translation): support Japanese and Chinese translation agents"
```

### Task 8: Recompose translation workflows and safe publication

**Files:**
- Modify: `.github/workflows/_prepare-translation-batches.yml`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `.github/workflows/_translate-publish-batch.yml`
- Modify: `.github/workflows/_publish-translation-batches.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/fetch-docs.yml`
- Replace: `.github/workflows/translate-codex.yml`
- Create: `.github/workflows/translate-content.yml`
- Modify: `scripts/docs-workflow/create-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/apply-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/publish-checkpoint.sh`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing workflow-policy tests**

Require every translation workflow to declare `target: ja-JP | zh-CN-reference | zh-CN-tools`, immutable `tooling_sha`, immutable `source_sha`, and an exact target ownership set.

Reject:

- a Japanese checkpoint containing `content/zh-CN`;
- a Chinese Reference checkpoint containing `i18n/ja-JP`;
- a Chinese Tools checkpoint containing any path outside its exact content subtree, translated sidebar fragment, translation manifest, and approved retirement file;
- a Chinese Reference workflow without `reference-manifest` and `validate-reference`;
- a Chinese Tools workflow without `validate-tools-sidebar` and translated-coverage validation;
- any translation workflow validating with the wrong site build;
- force pushes or unverified mutable target refs.

- [ ] **Step 2: Run policy tests and verify RED**

Run: `pnpm test:workflow-policy`

Expected: FAIL because workflows have no translation target identity.

- [ ] **Step 3: Add target identity to artifacts and publishers**

Checkpoint manifests must include:

```json
{
  "translationTarget": "ja-JP",
  "sourceSite": "en",
  "targetSite": "en",
  "sourceCheckpointSha": "<40 lowercase hex>",
  "toolingSha": "<40 lowercase hex>"
}
```

Use `targetSite: "zh-CN"` for Chinese Reference and Chinese Tools. Artifact validation must compare these fields before extracting or applying payloads.

Retain the current safe-extraction contract from `master`: reject absolute paths, `..` traversal, symlink/hardlink entries, duplicate normalized paths, paths outside the target ownership set, and payload files whose recorded digest does not match. Extract to a temporary directory, validate the full inventory, and only then apply files to the publication worktree.

- [ ] **Step 4: Create one reusable translation workflow**

`translate-content.yml` accepts `target`, `group`, `max_files`, and `target_branch`. It dispatches the same Agent engine but selects target-specific candidate generation, prompts, validation, commit messages, and owned paths.

Allowed commit messages:

```text
i18n(ja-JP): publish <group> translations
i18n(zh-CN-reference): publish <group> translations
i18n(zh-CN-tools): publish tools translations
```

- [ ] **Step 5: Trigger target-specific downstream translations from English publication**

After an English Reference group is published, schedule Japanese and Chinese Reference translation jobs from the same immutable source SHA. They may execute in parallel because their target ownership is disjoint, but publication must retain the current optimistic merge, bounded retries, checkpoint identity, and no-force-push rules from `master`.

For Japanese, preserve the durable parallel Guides batches and the current three-way translation-cache merge: merge base, current target, and batch cache entries by source-relative key; accept identical concurrent updates; reject divergent updates to the same key; never replace `.translation-cache/ja-JP.json` wholesale with a stale batch copy. For Chinese Reference, apply the same three-way rule to `generated/zh-CN/manifests/reference-translations.json`, keyed by English source-relative path, while keeping explicit retirement decisions in `config/reference-retirements.json` outside automatic merge authority.

For Chinese Tools, apply the three-way rule to `generated/zh-CN/manifests/tools-translations.json`, keyed by English Tools source-relative path plus one reserved sidebar-fragment key. Reject concurrent divergence in a page, translated label, document ID, or sidebar nesting. Keep `config/tools-retirements.json` outside automatic merge authority.

When English Guides publication changes the exact `tutorials/tools` source subtree or its sidebar node, schedule Japanese Guides translation and Chinese Tools translation from the same immutable English source SHA. Other English Guides changes schedule only Japanese translation. Chinese Guides, BYOC, and On-premise source publication never schedule a translation target and never claim the Chinese Tools-owned paths.

- [ ] **Step 6: Use target-specific validation**

Japanese:

```bash
pnpm docs-tooling validate-mdx --path i18n/ja-JP
pnpm docs-tooling validate-translation --target ja-JP --group "$GROUP"
pnpm build:en
```

Chinese Reference:

```bash
pnpm docs-tooling validate-mdx --path content/zh-CN/reference
pnpm docs-tooling reference-manifest --write
pnpm docs-tooling validate-reference --site zh-CN
pnpm build:zh-CN
```

Chinese Guides Tools:

```bash
pnpm docs-tooling validate-mdx --path content/zh-CN/guides/tutorials/tools
pnpm docs-tooling validate-translation --target zh-CN-tools --group tools
pnpm docs-tooling validate-tools-sidebar
pnpm build:zh-CN
```

- [ ] **Step 7: Run workflow, checkpoint, and contention tests**

Run:

```bash
pnpm test:workflow-policy
node --test scripts/docs-workflow/*checkpoint*.test.js scripts/docs-workflow/*translation*.test.js
```

Expected: PASS, including concurrent publication fixtures for `ja-JP`, `zh-CN-reference`, and `zh-CN-tools`, plus a collision fixture between Chinese source publication and the protected Tools subtree.

- [ ] **Step 8: Commit Agent workflow cutover**

```bash
git add .github/workflows scripts/docs-workflow scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "refactor(ci): publish all Agent translation products"
```

## Phase 4: Make build, image, and validation contracts cover the whole site

### Task 9: Extend build provenance and container smoke to Japanese

**Files:**
- Modify: `scripts/build/write-provenance.mjs`
- Modify: `scripts/build/write-provenance.test.mjs`
- Modify: `deploy/contracts/path-filters.json`
- Modify: `deploy/contracts/evaluate-path-filters.test.mjs`
- Modify: `deploy/contracts/smoke.sh`
- Modify: `deploy/contracts/container.test.mjs`
- Modify: `scripts/chat-agent-nginx.test.js`
- Modify: `.github/workflows/site-validation.yml`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`

- [ ] **Step 1: Write failing provenance and path-filter tests**

Require English provenance to hash:

- the English profile;
- all `content/en/*/content-manifest.json` files;
- the tracked `i18n/ja-JP` translation inventory;
- `.translation-cache/ja-JP.json`;
- generated English sidebars;
- final English and Japanese route inventories.

Require Chinese provenance to hash:

- `content/zh-CN/guides/tutorials/tools/**`;
- `generated/zh-CN/sidebars/tools.sidebar.js`;
- `generated/zh-CN/manifests/tools-translations.json`;
- `config/tools-retirements.json`;
- the final Chinese Tools route inventory and sidebar reachability report.

Require `i18n/ja-JP/**` changes to select only `build:en`. Changes to English `content/en/guides/tutorials/tools/**` or its source sidebar node select both builds; other English Guides changes select only `build:en`. Changes to the Chinese Tools target, manifest, sidebar fragment, or retirement decisions select only `build:zh-CN`. Shared Agent engine changes select both builds and both Chinese translation coverage gates.

Also require both site images to preserve the Docs Agent runtime contract inherited from local `master`:

- exact `/api/chat` and `/api/chat/interrupt` routes precede the generic `/api/` route;
- conversation IDs consistently select one `cloud-ai-assistant` StatefulSet pod;
- generic `/api/search` and `/api/feedback` traffic still resolves the external `chat-proxy.zdocs.svc.cluster.local:9000` service;
- browser assets contain no Kubernetes hostname, bearer token, or server-only credential;
- `packages/docs-ui` remains the owner of Chat UI and request/SSE behavior.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --test scripts/build/write-provenance.test.mjs
node --test deploy/contracts/evaluate-path-filters.test.mjs deploy/contracts/container.test.mjs
```

Expected: FAIL because Japanese input identity and smoke coverage are absent.

- [ ] **Step 3: Hash the intentional locale inputs**

Add a deterministic `localizationInputs` section to `build-provenance.json`. It must contain sorted path, mode, and SHA-256 entries and reject symlinks, untracked files, case collisions, and Unicode normalization collisions.

- [ ] **Step 4: Add Japanese route smoke**

For the English image require both:

```text
/docs/home
/ja-JP/docs/home
```

The Chinese image continues to require `/docs/home` and must return 404 for a representative `/ja-JP/docs/home` request.

- [ ] **Step 5: Update GitHub site validation**

The English build job must assert the Japanese output exists. The Chinese build job must assert every translated Tools document is reachable from the composed Chinese Guides sidebar and that no `docs-agents` route or sidebar node is reintroduced. The aggregate gate must include the retirement architecture job introduced in Task 1.

- [ ] **Step 6: Run contract tests and both builds**

Run:

```bash
pnpm test:containers
pnpm test:chat-agent-config
node --test deploy/contracts/evaluate-path-filters.test.mjs deploy/contracts/site-validation-workflow.test.mjs
pnpm build:en
pnpm build:zh-CN
test -s build/en/ja-JP/docs/home/index.html
```

Expected: PASS.

- [ ] **Step 7: Commit whole-site build contracts**

```bash
git add scripts/build deploy/contracts .github/workflows/site-validation.yml
git commit -m "feat(build): verify English Japanese and Chinese artifacts"
```

## Phase 5: Delete the retired architecture and refresh audit evidence

### Task 10: Remove legacy application entrypoints, inert artifacts, and stale workspace commands

**Files:**
- Delete: `docusaurus.config.ts`
- Delete: `Dockerfile`
- Delete: `nginx.conf`
- Delete: `docker-entrypoint.d/40-zdoc-env.sh`
- Delete: `blog/`
- Delete: `plugins/fastsearch/`
- Delete: `plugins/nb-to-mdx/`
- Delete: `plugins/vectorize-docs/`
- Delete: `plugins/report-to-lark/`
- Delete: `apps/docs/plugins/mdx-parse/`
- Delete: `apps/docs/plugins/link-checks/`
- Delete: `scripts/docs-workflow/run-content-group.js`
- Delete: `scripts/docs-workflow/run-content-group.test.js`
- Delete: `packages/docs-tooling/src/lark/meta/docs.json`
- Delete: `packages/docs-tooling/src/lark/meta/pages.json`
- Delete: `packages/docs-tooling/src/lark/meta/test.json`
- Delete: `tmp/job-83096402914.log`
- Delete: `tmp/job-83132738004.log`
- Delete historical files below: `apps/docs/plugins/link-checks/meta/reports/`
- Delete historical files below: `apps/docs/plugins/link-checks/meta/sitemaps/`
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `README.md`
- Modify: `.gitignore`
- Modify: `.dockerignore`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`
- Modify: `.claude/plans/2026-07-23-docs-agent-chat-integration.md`
- Modify: `.claude/superpowers/plans/2026-07-24-unified-en-cn-site-profiles-implementation.md`

- [ ] **Step 1: Update tests to expect only the new entrypoints**

Remove tests that intentionally preserve legacy wrappers. Add assertions that:

- `apps/docs/docusaurus.config.ts` is the only Docusaurus config;
- `deploy/en/Dockerfile` and `deploy/zh-CN/Dockerfile` are the only image definitions;
- `deploy/runtime/40-zdoc-env.sh` is the only runtime environment entrypoint;
- no package imports from `apps/docs/plugins/mdx-parse`;
- no workflow calls removed plugin commands.
- `packages/chat-ui`, `packages/docs-ui/src/shared/components/ChatPanel`, both site-owned Nginx files, `deploy/runtime/40-zdoc-env.sh`, and `scripts/chat-agent-nginx.test.js` remain live architecture;
- removing the local `chat-proxy/` workspace entry does not remove or rename the external Nginx upstream.

- [ ] **Step 2: Run the retirement gate and verify RED**

Run: `pnpm test:retirement`

Expected: FAIL and list every remaining retired file or reference.

- [ ] **Step 3: Remove inert and replaced files**

Use `git rm` only for the explicit paths above. Preserve:

- `i18n/ja-JP`;
- `.translation-cache/ja-JP.json`;
- `apps/docs/src/components/*` MDX import wrappers;
- migration evidence required for final audit;
- site-owned `deploy/en`, `deploy/zh-CN`, and `deploy/runtime` files.

Also preserve the profile-driven build plugins restored in Task 3:

- `apps/docs/plugins/embed-markdown/`;
- `apps/docs/plugins/llms-txt/`;
- `apps/docs/plugins/structured-data/`.

Only the CLI-side-effect plugins `mdx-parse` and `link-checks` are removed after their behavior and tests have moved into `packages/docs-tooling`.

Add a supersession notice to the two older implementation plans. The Chat plan must point deployment-sensitive paths to `packages/docs-ui`, `deploy/en`, `deploy/zh-CN`, and `deploy/runtime`; the unified-site foundation plan must point remaining work to this retirement plan. Keep both files as audit history rather than deleting them.

- [ ] **Step 4: Normalize the root package contract**

Keep only profile-aware commands. Replace the root script block with commands that delegate to workspace packages. Remove `chat-proxy` from `pnpm-workspace.yaml` and remove `test:all` references to it.

Required root commands include:

```json
"start:en": "pnpm --filter @zilliz/docs-site start:en",
"start:zh-CN": "pnpm --filter @zilliz/docs-site start:zh-CN",
"build": "pnpm build:en",
"build:en": "pnpm --filter @zilliz/docs-site build:en",
"build:zh-CN": "pnpm --filter @zilliz/docs-site build:zh-CN",
"docs-tooling": "node --experimental-strip-types packages/docs-tooling/src/cli-main.ts",
"test:chat-agent-config": "node --test scripts/chat-agent-nginx.test.js"
```

Remove root `docusaurus`, `start`, `deploy`, `serve`, `swizzle`, `write-translations`, and `write-heading-ids` commands unless they are replaced by an explicit site-qualified equivalent.

- [ ] **Step 5: Rewrite README as the operational contract**

Document:

- pnpm installation;
- English plus Japanese local development and build;
- independent Chinese development and build;
- content roots and generated roots;
- Agent translation targets;
- Docker commands;
- GitHub Actions ownership;
- external Jenkins handoff;
- prohibition on rebuilding Chinese from Docusaurus i18n.

- [ ] **Step 6: Run the retirement gate and clean-state tests**

Run:

```bash
pnpm test:retirement
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:frontend
pnpm test:containers
```

Expected: PASS and no retired path remains.

- [ ] **Step 7: Commit repository retirement**

```bash
git add -A
git commit -m "chore: retire legacy docs application paths"
```

### Task 11: Resolve migration dispositions and regenerate current evidence

**Files:**
- Modify: `migration/legacy-files.json`
- Modify: `migration/capabilities.json`
- Modify: `migration/dependencies.json`
- Modify: `migration/approved-differences.json`
- Modify: `migration/reports/routes-en-replacement.json`
- Modify: `migration/reports/routes-zh-CN-replacement.json`
- Modify: `migration/reports/shadow-en.json`
- Modify: `migration/reports/shadow-zh-CN.json`
- Modify: `migration/runbooks/cutover-zh-CN.md`
- Modify: `migration/runbooks/rollback-zh-CN.md`
- Create: `scripts/migration/verify-retirement-readiness.mjs`
- Create: `scripts/migration/verify-retirement-readiness.test.mjs`

- [ ] **Step 1: Write a failing zero-defer readiness test**

Require:

```js
assert.equal(summary.deferredEntries, 0);
assert.equal(summary.missingReplacementEvidence, 0);
assert.equal(summary.retiredRuntimeImports, 0);
assert.equal(summary.unverifiedCapabilities, 0);
```

Also verify that every deleted legacy provider has a replacement or an explicit reviewed retirement, and that Japanese translation is classified as a preserved English-site capability rather than a legacy tree.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/migration/verify-retirement-readiness.test.mjs`

Expected: FAIL because the current ledger contains 5,413 deferred entries.

- [ ] **Step 3: Regenerate and review the migration ledger**

Update inventory generation so current target paths resolve to `content/*`, `generated/*`, `i18n/ja-JP`, `apps/docs`, and `packages/*`. Classify every old path as `migrate`, `rewrite`, or `retire`; do not bulk-relabel unresolved entries.

- [ ] **Step 4: Refresh route evidence**

Capture English routes including `/ja-JP/**`. Compare English canonical routes to the English legacy baseline and Japanese routes to the current Japanese route inventory. Record approved differences for intentional retirement of Docusaurus sample routes such as `/markdown-page` if that page is removed.

- [ ] **Step 5: Refresh both shadow reports at the candidate SHA**

Record current image IDs, sizes, build commands, smoke results, Japanese route smoke, Chinese route smoke, and remaining external UAT evidence requirements. Do not reuse evidence from `f3c889e01` or another older SHA.

- [ ] **Step 6: Verify archive restoration remains possible**

Verify the recorded `zdoc_cn` bundle digest and restore one known legacy artifact in a temporary directory. Do not delete or reduce access to `zdoc_cn` until the external immutable archive requirement in the cutover runbook is satisfied.

- [ ] **Step 7: Run migration and retirement checks**

Run:

```bash
node --test scripts/migration/*.test.mjs
node scripts/migration/verify-retirement-readiness.mjs
pnpm test:architecture
```

Expected: PASS with zero deferred entries and no missing evidence command.

- [ ] **Step 8: Commit current audit evidence**

```bash
git add migration scripts/migration
git commit -m "docs(migration): record legacy retirement evidence"
```

### Task 12: Perform final clean-checkout and image acceptance before Jenkins changes

**Files:**
- Modify only if validation exposes a defect in files already owned by Tasks 1-11.

- [ ] **Step 1: Create a clean validation checkout**

Use a new temporary worktree at the exact candidate SHA. Do not validate from a dirty development directory or reuse existing `build`, `.docusaurus`, `node_modules`, or `tmp` output.

- [ ] **Step 2: Install from the one lockfile**

Run: `pnpm install --frozen-lockfile`

Expected: PASS with pnpm 10.33 and no npm or Yarn lockfile usage.

- [ ] **Step 3: Run the complete repository verification set**

Run:

```bash
pnpm typecheck
pnpm test:frontend
pnpm test:translation
pnpm test:workflow-policy
pnpm test:architecture
pnpm test:retirement
pnpm test:containers
pnpm test:chat-agent-config
pnpm docs-tooling validate-translation --target zh-CN-tools --group tools
pnpm docs-tooling validate-tools-sidebar
node --test scripts/migration/*.test.mjs deploy/contracts/*.test.mjs
```

Expected: all tests pass with zero skipped required gates.

- [ ] **Step 4: Build both sites from the clean checkout**

Run:

```bash
pnpm build:en
pnpm build:zh-CN
test -s build/en/docs/home/index.html
test -s build/en/ja-JP/docs/home/index.html
test -s build/zh-CN/docs/home/index.html
test -s content/zh-CN/guides/tutorials/tools/terraform-provider.md
```

Expected: PASS. English output contains Japanese; Chinese output does not contain a `ja-JP` directory; every tracked Chinese Tools translation is represented in the Chinese build and reachable through the composed Tools sidebar fragment.

- [ ] **Step 5: Build and smoke both final images**

Run:

```bash
docker build -f deploy/en/Dockerfile --build-arg ZDOC_SHA="$(git rev-parse HEAD)" --build-arg JENKINS_BUILD_ID=local-retirement-en -t zdoc-en:retirement .
docker build -f deploy/zh-CN/Dockerfile --build-arg ZDOC_SHA="$(git rev-parse HEAD)" --build-arg JENKINS_BUILD_ID=local-retirement-zh -t zdoc-zh-cn:retirement .
deploy/contracts/smoke.sh zdoc-en:retirement en
deploy/contracts/smoke.sh zdoc-zh-cn:retirement zh-CN
```

Expected: both images pass labels, health, English/Japanese/Chinese representative routes, and runtime-content restrictions.

- [ ] **Step 6: Inspect final runtime contents**

Verify neither image contains `/app`, Node.js, pnpm, `node_modules`, source Markdown, Git metadata, translation caches, reports, or migration evidence.

- [ ] **Step 7: Produce the Jenkins handoff record**

Record the candidate SHA and image digests in the migration shadow reports. The subsequent `vdc-jenkins` change must consume only:

- `deploy/en/Dockerfile` or `deploy/zh-CN/Dockerfile`;
- the candidate `zdoc` SHA;
- `ZDOC_SITE`;
- `JENKINS_BUILD_ID`;
- the release record and image-verification contracts below `deploy/contracts`.

No Jenkins pipeline may call a removed root script or reconstruct Japanese or Chinese content during the image build.

- [ ] **Step 8: Commit validation-only corrections if needed**

If the clean acceptance run required changes, commit each correction with its focused regression test. If no changes were needed, do not create an empty commit.

## Completion gate before editing `vdc-jenkins`

All of the following must be true:

- `git status --short` is empty.
- `pnpm test:retirement` passes.
- The migration ledger contains zero `defer` dispositions.
- No production workflow or package references retired roots or `run-content-group.js`.
- `pnpm build:en` produces both English and Japanese routes.
- `pnpm build:zh-CN` produces only the independent Chinese product site.
- Japanese Agent translation publishes only `i18n/ja-JP` and its cache.
- Chinese Reference Agent translation publishes only `content/zh-CN/reference`, its manifest, and explicit retirement changes.
- Chinese Tools Agent translation publishes only `content/zh-CN/guides/tutorials/tools`, its translated sidebar fragment, its manifest, and explicit retirement changes.
- Chinese Guides outside `tutorials/tools`, BYOC, and On-premise remain independent source publications and cannot delete or overwrite the Tools target.
- Both clean Docker builds and smoke tests pass at the candidate SHA.
- Shadow and route evidence refer to the candidate SHA, not an earlier commit.
- The Jenkins-facing contract contains no dependency on GitHub Actions artifacts, root Docusaurus files, overlay assembly, or `zdoc_cn` checkout.
