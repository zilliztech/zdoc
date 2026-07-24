# Unified English and Chinese Site Profiles Design

**Date:** 2026-07-24  
**Status:** Ready for user review  
**Repositories in scope:** `zdoc`, `zdoc_cn`  
**Target repository:** `zdoc`

## Summary

Merge the English and Chinese documentation projects into `zdoc`, while preserving two independently configured and independently deployed product documentation sites.

The merged repository will contain:

- one newly structured shared Docusaurus application, dependency graph, theme, and documentation toolchain;
- an English site profile and a Chinese site profile;
- independent English and Chinese content trees that may have different structure, products, manuals, navigation, routes, and feature flags;
- one canonical English Reference source and checked-in Chinese Reference translations;
- deterministic site builds whose complete inputs are represented by one Git commit.

The design does not use Docusaurus content i18n. Docusaurus must not resolve Chinese documents from `i18n/zh-CN`, assume equivalent page trees, or fall back from missing Chinese content to English. Each site profile selects its content explicitly.

The core build invariant is:

> A clean checkout of one `zdoc` commit, plus a declared site profile and the repository lockfile, is sufficient to build the corresponding site without fetching another Git repository or downloading document content during the build.

## Context and Problem

The current Chinese workflow materializes an English `zdoc` revision, copies it into `.zdoc-assembled`, copies allowlisted files from `zdoc_cn`, applies a Chinese patch, and builds the resulting temporary tree.

This provides some provenance through `upstream.lock`, `overlay-manifest.json`, and `.zdoc-build-manifest.json`, but the deployed file tree does not correspond to a directly checkable Git commit. A reviewer must reconstruct two repositories, a copy order, and one or more patches to reproduce the build.

The overlay also combines unrelated responsibilities:

- Chinese Feishu source identifiers and manual selection;
- Chinese-only product documentation;
- Chinese Markdown normalization and REST transformations;
- storage adapters;
- UI configuration and assets;
- Nginx and CI configuration;
- patches against shared application code.

The repositories should therefore be merged at the source level, not assembled at build time.

## Confirmed Constraints

1. English and Chinese describe products with different capabilities.
2. Their manual sets, navigation, page hierarchy, and routes may differ.
3. Docusaurus content i18n is not an acceptable content architecture.
4. Both sites must use the same maintained tooling and UI foundation.
5. Build and deployment auditability require one directly buildable Git revision.
6. Final publishable `.md` and `.mdx` files remain checked into Git.
7. Reference manuals should reuse the canonical English source for the English site and use checked-in translated files for the Chinese site.
8. Missing Chinese content must not be silently replaced with English.
9. Implementation will use a clean-room worktree so the new architecture is not constrained by the current repository layout.
10. The clean-room branch must retain normal ancestry from `master`; it must not be an orphan branch.

## Goals

- Build the English and Chinese sites from the same repository.
- Preserve independent product and information architecture for each site.
- Share Docusaurus, plugins, UI components, build scripts, and dependency versions.
- Make Chinese differences explicit through typed configuration and extension points.
- Remove cross-repository materialization, tree overlays, and build-time patches.
- Keep final Markdown inputs reviewable and attributable in Git.
- Record Reference source-to-translation provenance.
- Allow English and Chinese sites to build, test, deploy, and roll back independently.
- Preserve content-group atomicity for generated documentation workflows.
- Establish explicit application, configuration, tooling, UI, adapter, content, and deployment package boundaries.
- Migrate only inventory-approved legacy files into the new project structure.

## Non-goals

- Making the English and Chinese content trees structurally identical.
- Adding a language switcher that assumes matching routes.
- Building one combined multilingual artifact.
- Translating missing pages during a production build.
- Fetching Feishu, REST specifications, or another Git repository during a site build.
- Replacing Docusaurus or rewriting the existing theme.
- Moving all existing English content directories in the first migration step.
- Retaining a generic filesystem overlay mechanism after migration.
- Preserving the current root directory organization.
- Creating an orphan branch or unrelated Git history for the replacement project.
- Bulk-copying either existing repository into the new project without an ownership decision.

## Alternatives Considered

### 1. One clean-room Docusaurus application with two site profiles

This is the selected approach. Each build resolves one profile, registers only that site's content plugins and features, and produces one deployment artifact.

Benefits:

- one source revision and lockfile;
- maximum tooling and UI reuse;
- explicit product differences;
- clean package boundaries without duplicating the application;
- no duplicated application package.

### 2. Two application packages in a monorepo

For example, `apps/docs-en` and `apps/docs-cn` could share `packages/theme` and `packages/tooling`.

This gives stronger application isolation, but duplicates Docusaurus entry points, plugin registration, configuration plumbing, and package maintenance. It is unnecessary while both sites still share the same application foundation.

This remains a future escape hatch if product behavior diverges enough that typed profile configuration becomes dominated by conditional application code.

### 3. Two repositories with a published tooling package

This would remove runtime Git assembly but preserve cross-repository release coordination. A Chinese content revision would still depend on a separately versioned UI/tooling artifact, weakening the single-revision audit model. It is not selected.

## Architecture Overview

```text
                           one zdoc Git commit
                                   |
                 +-----------------+-----------------+
                 |                                   |
          resolve profile: en                resolve profile: zh-CN
                 |                                   |
       English product graph                 Chinese product graph
       English content roots                 Chinese content roots
       English navigation                    Chinese navigation
       English integrations                  Chinese integrations
                 |                                   |
          Docusaurus build                    Docusaurus build
                 |                                   |
         English artifact                    Chinese artifact
```

The sites share implementation code but not a runtime content graph. A site profile is a complete declaration of what is built, not a set of overrides applied after an English site has been created.

## Clean-room Worktree Strategy

Implementation takes place in an isolated linked worktree:

```text
zdoc/                                            current master reference
../zdoc_cn/                                     current Chinese reference
zdoc/.claude/worktrees/unified-docs-clean-room/ replacement project worktree
```

The worktree branch is created from the reviewed design commit on `master`:

```text
codex/unified-docs-clean-room
```

It is a normal branch with shared ancestry. `git worktree add --orphan` is prohibited because an unrelated history would weaken review, merging, blame, and migration auditing.

“Clean-room” means that the target architecture is designed from an empty conceptual model. It does not mean running an unreviewed recursive delete or copying an existing tree wholesale. The sequence is:

1. verify the unmodified branch baseline;
2. create the new application and package skeleton;
3. inventory every legacy root;
4. migrate, rewrite, or reject each owned unit explicitly;
5. use `git mv` for content and reusable modules where it preserves meaningful history;
6. remove a legacy root only after its replacement or retirement is validated;
7. finish with no runtime dependency on the legacy layout.

The original `zdoc` worktree and `zdoc_cn` checkout remain read-only references during migration. Deleting files on the replacement branch does not remove them from those reference checkouts.

## Repository Layout

### Target layout

```text
apps/
  docs/
    package.json
    docusaurus.config.ts
    src/
    static/
    tests/

packages/
  site-config/
    src/
      schema.ts
      resolve.ts
      sites/
        en.ts
        zh-CN.ts
  docs-tooling/
    src/
      manuals/
        schema.ts
        registry.ts
      lark/
      reference/
      validation/
  docs-ui/
    src/
      shared/
      en/
      zh-CN/
  publication-adapters/
    src/
      registry.ts
      zh-CN/

generated/
  en/
    sidebars/
    manifests/
  zh-CN/
    sidebars/
    manifests/

sidebar-overrides/
  en/
  zh-CN/

content/
  en/
    guides/
    byoc/
    reference/
    agents/                 # only if still a distinct English product surface
  zh-CN/
    guides/
    byoc/
    reference/
    onpremise/

content-sources/
  reference/
    python/
    java/
    nodejs/
    go/
    cli/
    restful/

translations/
  zh-CN/
    reference/
      python/
      java/
      nodejs/
      go/
      cli/
      restful/

deploy/
  en/
  zh-CN/
```

`apps/docs` is the only Docusaurus application. The packages are source-level workspace packages, not separately released dependencies.

### Legacy migration manifest

The replacement project owns a checked-in migration manifest that classifies every legacy root or significant subsystem:

```ts
export interface LegacyMigrationEntry {
  sourceRepository: 'zdoc' | 'zdoc_cn';
  sourcePath: string;
  sourceCommit: string;
  disposition: 'migrate' | 'rewrite' | 'retire' | 'defer';
  targetPath?: string;
  owner: 'app' | 'site-config' | 'tooling' | 'ui' | 'adapter' | 'content' | 'deploy';
  evidence: string[];
}
```

`defer` is allowed only while the replacement branch is not a cutover candidate. Every deferred entry must become `migrate`, `rewrite`, or `retire` before production cutover.

The initial classification is:

| Legacy class | Default disposition |
| --- | --- |
| Final `.md` and `.mdx` content | migrate with history where practical |
| Stable shared UI components | migrate into `packages/docs-ui` |
| Lark and Reference generators | rewrite into `packages/docs-tooling` boundaries |
| Site config and plugin registration | rewrite from the new profile schema |
| Chinese normalizer and REST behavior | rewrite as publication adapters |
| Deployment configuration | migrate into `deploy/<site>` after validation |
| Assembly, overlay, upstream locks, patches | retire |
| Build output, caches, `node_modules` | retire and never import |

## Site Profile Model

`SiteId` represents a product documentation site. It is deliberately not named `LocaleId`.

```ts
export type SiteId = 'en' | 'zh-CN';

export interface SiteProfile {
  id: SiteId;
  language: string;
  title: string;
  tagline: string;
  url: string;
  baseUrl: string;
  outputDir: string;
  content: ContentPluginProfile[];
  manuals: string[];
  navigation: NavigationProfile;
  features: FeatureProfile;
  markdown: MarkdownProfile;
  integrations: IntegrationProfile;
  staticRoots: string[];
  redirects: RedirectProfile;
  robots: RobotsProfile;
}
```

The profile schema is closed and validated. Unknown keys fail configuration loading. Paths must be repository-relative, normalized, non-overlapping where ownership is exclusive, and confined to declared roots.

### Content plugin declaration

```ts
export interface ContentPluginProfile {
  id: 'default' | 'byoc' | 'reference' | 'agents' | 'onpremise';
  sourcePath: string;
  routeBasePath: string;
  sidebarPath: string;
  include?: string[];
  exclude?: string[];
}
```

The English and Chinese arrays may contain different plugin instances. For example, the Chinese profile may register `onpremise` while omitting an English-only product surface.

### Feature declaration

Product capability differences are expressed as named features rather than scattered checks of `process.env.ZDOC_SITE`:

```ts
export interface FeatureProfile {
  chat: boolean;
  askAi: boolean;
  feedback: boolean;
  cloudSelector: boolean;
  byoc: boolean;
  onpremise: boolean;
  agents: boolean;
  referenceKinds: Array<'python' | 'java' | 'nodejs' | 'go' | 'restful' | 'cli'>;
}
```

Application components consume the resolved feature profile through one shared site context. Direct environment checks outside configuration bootstrap are prohibited.

## Docusaurus Configuration

`apps/docs/docusaurus.config.ts` is a thin configuration factory consumer:

```ts
const site = resolveSiteProfile(process.env.ZDOC_SITE);
export default createDocusaurusConfig(site);
```

The application package exposes fixed commands, and the repository root forwards to them:

```json
{
  "build:en": "pnpm --filter @zilliz/docs-site run build:en",
  "build:zh-CN": "pnpm --filter @zilliz/docs-site run build:zh-CN",
  "start:en": "pnpm --filter @zilliz/docs-site run start:en",
  "start:zh-CN": "pnpm --filter @zilliz/docs-site run start:zh-CN"
}
```

CI and deployment must call these named commands rather than setting arbitrary profile variables.

Docusaurus may receive a single site language in each resolved configuration so that generated HTML has the correct language metadata. This is not used for document translation or locale routing:

- there is one configured language per build;
- no manual content is loaded from `i18n/<locale>`;
- no locale-prefixed content output is combined into another site;
- no Docusaurus translation fallback determines page availability.

## Manual and Content Source Model

The current `config/lark-docs.config.ts` mixes remote source identity, rendering behavior, and publication destination. It is not migrated as the new registry. Its verified data is transferred into `packages/docs-tooling/src/manuals/registry.ts`, while the merged design separates these responsibilities.

```ts
export interface ManualDefinition {
  id: string;
  kind: 'guides' | 'reference' | 'onpremise' | 'agents';
  sources: Record<string, ManualSource>;
  publications: Partial<Record<SiteId, ManualPublication>>;
}

export interface ManualSource {
  sourceType: 'wiki' | 'drive' | 'onePager' | 'rest' | 'local';
  root?: string;
  base?: string;
  version?: string;
  sourceDir: string;
  fallbackSource?: string;
}

export interface ManualPublication {
  enabled: boolean;
  source: string;
  outputDir: string;
  contentRoot: string;
  sidebarPath: string;
  overridePath?: string;
  missingContent: 'error' | 'explicitly-disabled';
  retiredPaths?: string[];
}
```

`source` references a key in `ManualDefinition.sources`; it is not a filesystem fallback chain.

### Guides and product manuals

Guides may declare separate English and Chinese remote sources because they represent different products and information architecture:

```ts
{
  id: 'guides',
  kind: 'guides',
  sources: {
    english: {sourceType: 'wiki', root: '...', base: '...', sourceDir: '...'},
    chinese: {sourceType: 'wiki', root: '...', base: '...', sourceDir: '...'},
  },
  publications: {
    en: {
      enabled: true,
      source: 'english',
      outputDir: 'docs/tutorials',
      contentRoot: 'docs',
      sidebarPath: 'generated/en/sidebars/guides.sidebar.js',
      overridePath: 'sidebar-overrides/en/guides.json',
      missingContent: 'error',
    },
    'zh-CN': {
      enabled: true,
      source: 'chinese',
      outputDir: 'content/zh-CN/guides/tutorials',
      contentRoot: 'content/zh-CN/guides',
      sidebarPath: 'generated/zh-CN/sidebars/guides.sidebar.js',
      overridePath: 'sidebar-overrides/zh-CN/guides.json',
      missingContent: 'error',
    },
  },
}
```

Chinese-only manuals, such as an independently structured On-premise manual, have only a `zh-CN` publication entry. Their absence from `en` is intentional configuration, not missing translation.

### Reference manuals

Reference has a canonical English rendered source and a checked-in Chinese translation tree.

```text
content-sources/reference/python/**       canonical English Reference input
translations/zh-CN/reference/python/**   checked-in Chinese translation
```

The publications select them explicitly:

```ts
sources: {
  canonical: {
    sourceType: 'drive',
    root: '...',
    base: '...',
    sourceDir: 'content-sources/reference/python',
  },
  chineseTranslation: {
    sourceType: 'local',
    sourceDir: 'translations/zh-CN/reference/python',
  },
}
```

Publication rules:

- `en` reads the canonical English tree;
- `zh-CN` reads the Chinese translation tree;
- a missing active Chinese page fails Reference completeness validation;
- a manual unavailable in the Chinese product must be disabled explicitly;
- retired Java or Go versions are recorded as retired paths or disabled publications;
- English is never copied into the Chinese output as a fallback.

## Checked-in Markdown Policy

Final `.md` and `.mdx` files are versioned build inputs, including files produced by automation.

The generation boundary is:

```text
remote source or translation service
  -> isolated generation workspace
  -> validate Markdown, links, assets, routes, and ownership
  -> commit generated Markdown and provenance metadata
  -> build from the committed tree without document-network access
```

Use `.md` unless the document requires MDX components. Generated content includes source metadata in a manifest rather than embedding volatile timestamps into every page.

Raw Feishu JSON is not inherently a production build input. It may remain as a cache, CI artifact, or selected source snapshot. The committed publication manifest must retain enough identity to explain how each generated Markdown file was produced.

## Translation Provenance

Each Reference group maintains a manifest with this logical shape:

```ts
export interface TranslationRecord {
  manual: string;
  sourcePath: string;
  targetPath: string;
  sourceCommit: string;
  sourceHash: string;
  targetHash: string;
  status: 'translated' | 'unchanged' | 'retired';
}
```

The manifest is deterministic: records are sorted, paths are normalized, and volatile build timestamps are excluded.

Validation requires:

- every active canonical source has a Chinese target;
- every Chinese target maps to one active or retired source;
- source hashes match the declared source revision;
- target hashes match checked-in files;
- deletes are explicit retirements or current-source deletions;
- mappings stay within the selected Reference group's roots.

## Replacing Overlay Semantics

There will be no general rule equivalent to “copy the Chinese file tree over the English file tree.” Each current overlay class receives a permanent owner.

| Current Chinese difference | Merged ownership |
| --- | --- |
| Chinese documents | `content/zh-CN/**` or `translations/zh-CN/**` |
| Feishu roots, Base IDs, manual versions | manual source and publication registry |
| Chinese navigation and sidebars | `packages/site-config/src/sites/zh-CN.ts` and `generated/zh-CN/sidebars` |
| Chinese route redirects and robots | Chinese site profile and `deploy/zh-CN` |
| Chinese UI strings and assets | `packages/docs-ui/src/zh-CN` and `apps/docs/static/zh-CN` |
| Markdown normalization | shared plugin extension point selected by profile |
| REST replacements | Reference publication adapter selected by profile |
| Aliyun OSS behavior | shared storage adapter registry selected by profile |
| Nginx and Jenkins configuration | `deploy/zh-CN` |
| Patch against upstream source | normal shared code change or typed extension point |
| `.zdoc-assembled` output | removed |

### UI override rules

UI differences must use explicit registries rather than path shadowing:

```ts
export interface SiteUiModules {
  navbar: string;
  footer: string;
  homePage: string;
  searchProvider: string;
  feedbackProvider?: string;
}
```

The profile references concrete modules. Shared modules remain the default only where the profile explicitly chooses them. A Chinese module does not replace a shared file merely by having the same relative path.

### Plugin hook rules

Chinese-only processing becomes a supported hook in shared code:

```ts
export interface PublicationAdapter {
  id: string;
  transformDocument(document: GeneratedDocument, context: PublicationContext): GeneratedDocument;
  validatePublication(root: string, context: PublicationContext): Promise<void>;
}
```

Adapters are registered by identifier and selected by manual publication or site profile. They cannot mutate files outside the declared publication root.

## Content Ownership and Collision Rules

Every generated or maintained path has exactly one owner:

- one site and one content plugin own a published content path;
- one manual publication owns generated manual output;
- one site owns a generated sidebar path;
- shared application code is not site-owned;
- deployment files are owned by one deployment target.

Configuration loading fails when:

- two publications claim overlapping output paths;
- a content plugin source overlaps another plugin unexpectedly;
- an adapter targets a path outside its publication root;
- two documents generate the same route;
- a site references a sidebar, asset root, or module that does not exist;
- a Chinese publication depends on an English content root without an explicit Reference mapping.

## Build Model

Site builds are read-only with respect to checked-in content.

```text
checkout exact SHA
  -> install frozen lockfile
  -> resolve and validate one site profile
  -> verify checked-in content manifests
  -> build one site into an empty output directory
  -> validate routes and artifacts
  -> emit build provenance manifest
```

The production build must not:

- fetch another Git repository;
- call Feishu or a translation service;
- apply Git patches;
- copy an overlay tree;
- update checked-in documents or generated sidebars;
- use an undeclared environment-selected content root.

## Build Provenance

Each artifact includes a deterministic manifest:

```json
{
  "schemaVersion": 1,
  "repository": "zdoc",
  "commit": "<40-character SHA>",
  "site": "zh-CN",
  "profileHash": "<sha256>",
  "lockfileHash": "<sha256>",
  "contentManifestHash": "<sha256>",
  "routeInventoryHash": "<sha256>",
  "toolchain": {
    "node": "<version>",
    "pnpm": "<version>"
  },
  "artifactHash": "<sha256>"
}
```

The deployed image or archive exposes the Git SHA and site ID through OCI labels or equivalent deployment metadata.

The initial merge does not require a full SLSA implementation, SBOM signing, or transparency-log integration. The manifest is designed so those can be added later without changing content ownership.

## Generation and Publication Workflows

Generation remains separate from site building.

### Guides and localized product manuals

Each site-specific content group runs independently:

```text
fetch declared remote source
  -> render in isolated staging
  -> run site-specific adapters
  -> validate complete group
  -> compare-and-swap against group baseline
  -> commit final Markdown, sidebars, assets, and source manifest
```

### Reference

Reference is a two-stage flow:

```text
fetch canonical English source
  -> render and validate canonical Markdown
  -> commit canonical source group
  -> calculate translation delta
  -> translate into isolated Chinese staging
  -> validate complete Chinese group and mapping manifest
  -> commit Chinese translation group
```

A source update may commit even when translation fails. The prior complete Chinese group remains buildable. The Chinese build fails only if its checked-in manifest claims a source revision that is incomplete or inconsistent; it does not automatically consume a newer unacknowledged English source.

### Atomicity

The publication unit remains a content group such as Guides, BYOC, Python, Java, Node.js, Go, CLI, REST, or On-premise.

- staging happens outside live roots;
- validation completes before replacement;
- a group publishes as one commit or one compare-and-swap operation;
- unrelated groups may publish independently;
- same-group concurrency uses baseline SHA checks and never force-pushes;
- a failed group preserves its previous complete checked-in output.

## CI/CD Design

### Build jobs

English and Chinese builds are separate jobs:

```text
verify-en:
  pnpm build:en
  validate English routes and artifact

verify-zh-CN:
  pnpm build:zh-CN
  validate Chinese routes and artifact
```

Path filtering may avoid unnecessary deployments, but repository-wide shared code changes must verify both sites.

Recommended trigger classes:

| Changed path | Required validation |
| --- | --- |
| shared application, tooling, lockfile | English and Chinese |
| English content/profile/deploy files | English |
| Chinese content/profile/deploy files | Chinese |
| manual registry or shared Reference generator | English and Chinese |
| Reference English source | English plus Chinese translation coverage check |
| Chinese Reference translation | Chinese |

### Deployment jobs

Each deployment checks out one immutable `zdoc` SHA and invokes one named build command. It does not perform an auxiliary checkout.

English and Chinese may deploy at different times and roll back independently, but every deployed artifact identifies:

- the same repository name;
- its exact Git SHA;
- its site profile;
- its artifact hash.

## Migration Plan

### Phase 0: Create the clean-room worktree and record baselines

- Create `.claude/worktrees/unified-docs-clean-room` from the reviewed `master` commit on branch `codex/unified-docs-clean-room`.
- Confirm `.claude/worktrees/` remains ignored.
- Install the existing project dependencies and run the agreed baseline test/build commands before deleting or moving files.
- Record the exact starting SHA and baseline results in the migration report.
- Freeze new overlay categories in `zdoc_cn`.
- Inventory all overlay copy entries, patches, direct file differences, public routes, and deployment behavior.
- Classify each difference into content, configuration, UI, adapter, or deployment ownership.
- Capture route and rendered-page baselines for both sites.

### Phase 1: Establish the replacement project skeleton

- Create the root pnpm workspace and `apps/docs` application.
- Create `packages/site-config`, `packages/docs-tooling`, `packages/docs-ui`, and `packages/publication-adapters` with explicit public APIs.
- Add the migration manifest and validate that every declared source path exists at its recorded source commit.
- Add empty but schema-valid English and Chinese profiles.
- Prohibit imports from undeclared legacy roots in the new packages.

### Phase 2: Build the first English vertical slice

- Migrate the minimum shared UI, one English content plugin, and its sidebar into the new structure.
- Implement profile resolution and the Docusaurus configuration factory.
- Build and smoke-test the slice through `pnpm build:en`.
- Expand the English profile one content group at a time until route and asset parity is reached.
- Use `git mv` for content or reusable files when target structure and file identity remain meaningful.

### Phase 3: Add shared tooling and extension points

- Convert the Chinese publication normalizer patch into a shared adapter hook.
- Add explicit REST replacement and storage adapter registries.
- Add explicit UI module selection.
- Rewrite verified Lark and Reference generator behavior behind `packages/docs-tooling` APIs.
- Verify the completed English profile continues to match the approved baseline.

### Phase 4: Import Chinese configuration and content

- Complete `packages/site-config/src/sites/zh-CN.ts`.
- Import Chinese Guides, BYOC, On-premise, Reference translations, sidebars, assets, and redirects into their declared roots.
- Import Chinese manual source identities into the unified registry.
- Preserve Git history where practical using repository history import; otherwise record the source `zdoc_cn` commit in the migration commit message and manifest.
- Do not import `.zdoc-upstream`, `.zdoc-assembled`, `node_modules`, or build outputs.

### Phase 5: Establish Reference source and translation boundaries

- Move or expose canonical English Reference content under declared source roots.
- Map the English publication to canonical content.
- Map the Chinese publication to checked-in translations.
- Generate source-to-target manifests and explicit retirement records.
- Fail closed on missing active Chinese translations.

### Phase 6: Resolve or retire every legacy subsystem

- Change every migration manifest entry from `defer` to `migrate`, `rewrite`, or `retire`.
- Scan new application and package imports for dependencies on old `src`, `plugins`, `scripts`, and `config` roots.
- Remove a legacy root only after its replacement tests or retirement evidence pass.
- Confirm no required behavior exists only in the original worktree or `zdoc_cn`.
- Keep deletion and replacement in reviewable commits grouped by subsystem rather than one repository-wide deletion commit.

### Phase 7: Dual-build comparison

- Build the existing English site and new English profile; compare routes and representative rendered pages.
- Build the existing Chinese site and new Chinese profile; compare routes, navigation, assets, metadata, and product-specific behavior.
- Allow only reviewed route removals or redirects.
- Run production Docker/Nginx smoke tests for both profiles.

### Phase 8: Cut over CI and deployment

- Change Chinese generation workflows to commit into the merged repository.
- Change Chinese Jenkins to checkout one `zdoc` SHA and run `build:zh-CN`.
- Record and verify the immutable SHA in the deployed image.
- Keep the old Chinese deployment available for immediate rollback during the observation period.

### Phase 9: Retire the split repository mechanism

- Make `zdoc_cn` read-only and archive it after production validation.
- Remove upstream materialization, assembly, overlay validation, patch application, and workflow synchronization code.
- Remove obsolete upstream locks and assembled-workspace tests.
- Retain migration provenance and route comparison reports under project documentation.
- Confirm the replacement branch still has ordinary ancestry from `master` and can merge through the normal review process.

## Validation Strategy

### Configuration tests

- Both profiles pass the same closed schema.
- Unknown site IDs fail.
- Profile paths stay within the repository.
- Output ownership does not overlap.
- Each declared module, sidebar, adapter, and content root exists.
- The Chinese profile registers no document content from `i18n/zh-CN`.
- The profiles may expose different plugins, manuals, navigation, and features.
- New workspace packages do not import undeclared legacy roots.
- Every migration manifest entry has a valid owner and source commit.
- A cutover candidate contains no `defer` migration entries.

### Manual registry tests

- A publication references an existing source key.
- Site-specific Guides resolve to their own source identifiers.
- Reference English resolves to canonical source content.
- Reference Chinese resolves only to checked-in translations.
- Disabled or retired manuals are explicit.
- Missing active translations fail coverage validation.

### Adapter tests

- The Chinese normalizer runs only for declared Chinese publications.
- REST replacement is deterministic and confined to its output root.
- Storage adapters cannot mutate documentation content.
- The English publication remains unchanged when Chinese adapters are registered.

### Build tests

- `pnpm build:en` succeeds in a clean checkout.
- `pnpm build:zh-CN` succeeds in a clean checkout.
- Builds succeed with document-network access disabled.
- Neither build creates or reads `.zdoc-assembled`.
- Neither build applies patches or reads another repository.
- Each artifact contains matching provenance metadata.
- The root commands build only through `apps/docs` and declared workspace packages.

### Route and product tests

- English route inventory matches its approved baseline.
- Chinese route inventory matches its approved baseline plus reviewed changes.
- Product capabilities exposed by navigation agree with the selected profile.
- A feature disabled for one site is absent from its routes and UI.
- Cross-site links are explicit external links, not assumed locale equivalents.

### Workflow tests

- A failed generation group leaves its prior committed output unchanged.
- Independent groups can publish without overwriting each other.
- Same-group conflicts fail or reconstruct against the current baseline.
- Shared tooling changes trigger both site validations.
- Chinese-only content changes do not deploy the English site.

## Rollout and Rollback

Rollout is profile-by-profile rather than repository-wide.

1. Create the normal-history clean-room worktree.
2. Land the replacement skeleton and first English vertical slice on the feature branch.
3. Reach English parity within the new package boundaries.
4. Land shared tooling and explicit extension points.
5. Import and validate the Chinese profile and content.
6. Resolve every legacy migration entry.
7. Run old and new Chinese builds in parallel.
8. Merge the replacement branch through normal review.
9. Switch Chinese deployment to the merged repository.
10. Observe production behavior before retiring `zdoc_cn`.

Rollback options:

- revert a profile or shared-code commit in `zdoc`;
- deploy the last known-good artifact for the affected site;
- temporarily restore the old Chinese deployment during the observation period;
- roll back one site without rolling back the other when the failure is profile-owned.

No rollback requires reconstructing a two-repository assembled workspace after cutover.

## Risks and Mitigations

### Shared code can break both sites

Mitigation: shared-code and dependency changes require both builds and smoke tests.

### Profile conditionals can spread through the application

Mitigation: environment access is confined to profile resolution; components consume typed features and explicit modules.

### Chinese content import can lose history

Mitigation: preserve history with a controlled repository-history import where practical and always record the source repository SHA and migration mapping.

### A clean-room rewrite can silently omit legacy behavior

Mitigation: require an exhaustive migration manifest, baseline route/build evidence, subsystem-level replacement commits, and zero deferred entries before cutover.

### An orphan branch would simplify an empty start but damage integration

Mitigation: use a normal branch from `master`; conceptual cleanliness comes from the new package structure and controlled retirement, not unrelated Git history.

### Reference source and translation may drift

Mitigation: deterministic translation manifests, source hashes, explicit acknowledged source revisions, and fail-closed coverage validation.

### Repository size increases

Mitigation: Markdown remains in Git; generated build artifacts, caches, and duplicate assembled trees do not. Large binary assets continue through the established asset strategy rather than being duplicated per site without need.

### Two deployments from one repository can create ambiguous status

Mitigation: independent required checks and deployment records named by site ID, each reporting commit and artifact hash.

## Acceptance Criteria

- `zdoc` contains the complete checked-in inputs needed for both sites.
- The replacement implementation was developed in `.claude/worktrees/unified-docs-clean-room` on a normal branch descended from `master`.
- The final repository uses `apps/docs`, `packages/site-config`, `packages/docs-tooling`, `packages/docs-ui`, and `packages/publication-adapters` as explicit boundaries.
- English and Chinese builds use the same package lock and shared application code.
- `pnpm build:en` and `pnpm build:zh-CN` build independent artifacts.
- Chinese content structure can differ from English without Docusaurus content i18n.
- No published manual content is loaded from `i18n/zh-CN`.
- No build fetches or checks out `zdoc_cn` or any other tooling repository.
- No build creates `.zdoc-assembled`, copies an overlay tree, or applies an upstream patch.
- English Reference uses canonical English content.
- Chinese Reference uses checked-in translated content with complete source mapping.
- Missing active Chinese Reference content fails validation rather than falling back to English.
- Chinese-only and English-only product capabilities are represented explicitly in profiles.
- Generated Markdown is validated and committed before the site build.
- Every deployed artifact identifies one `zdoc` SHA, one site profile, and one artifact hash.
- Shared-code changes validate both sites; site-owned changes validate the affected site.
- Route parity and reviewed deviations are documented before Chinese production cutover.
- `zdoc_cn` can be archived without removing any input required to build the Chinese site.
- The cutover candidate has no deferred migration entries and no runtime imports from retired legacy roots.
- No orphan branch, unrelated-history merge, bulk overlay copy, or repository-wide unreviewed deletion is required.

## External Practice References

- Docusaurus docs multi-instance: <https://docusaurus.io/docs/docs-multi-instance>
- Docusaurus internationalization: <https://docusaurus.io/docs/i18n/tutorial>
- Docusaurus locale-aware exclusion limitation discussion: <https://github.com/facebook/docusaurus/discussions/11074>
- VitePress internationalization and independent directories: <https://vitepress.dev/guide/i18n>
- Material for MkDocs language projects: <https://squidfunk.github.io/mkdocs-material/setup/changing-the-language/>
- Kubernetes localization workflow: <https://kubernetes.io/docs/contribute/localization/>
- GitLab documentation localization: <https://handbook.gitlab.com/handbook/marketing/localization/tech_docs_localization/>
- SLSA build provenance: <https://slsa.dev/spec/v1.2/build-provenance>
- Reproducible Builds: <https://reproducible-builds.org/>
