# Unified English and Chinese Site Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-repository English/Chinese assembly workflow with one auditable `zdoc` repository that independently builds and deploys English and Chinese product-documentation sites from explicit site profiles.

**Architecture:** Build one Docusaurus application in `apps/docs` and select a closed, typed `en` or `zh-CN` profile from `packages/site-config`. Move reusable generation into `packages/docs-tooling`, shared and site-owned UI into `packages/docs-ui`, and Chinese publication transforms into `packages/publication-adapters`; keep one committed Markdown tree per site and retain Jenkins orchestration in `vdc-jenkins` behind versioned deployment contracts.

**Tech Stack:** pnpm workspaces, Node.js 22, TypeScript 5.6, Docusaurus 3.10.1, Zod, Vitest, Node test runner, Playwright, Docker, Nginx, Git worktrees, OCI image digests.

**Approved design:** `.claude/superpowers/specs/2026-07-24-unified-en-cn-site-profiles-design.md`

---

## Execution model

This plan is one migration program split into seven independently reviewable milestones. Execute milestones in order. Each milestone starts from the latest reviewed `master`, uses the persistent `.claude/worktrees/unified-docs-clean-room` worktree, leaves the repository installable, and commits all evidence needed by the next milestone.

Do not delete a legacy provider in the same step that first introduces its replacement. First make the replacement pass its contract and differential checks, then retire the legacy provider in a later commit.

Before milestones 2-7, merge the completed prior milestone through normal review, fetch the reviewed `master`, and switch the persistent worktree to the next branch with `git switch -c <milestone-branch> master`. Record the new merge base in `migration/reports/baseline.json` and run the affected site baseline before changing files.

### Milestone branches

| Milestone | Branch | Completion gate |
| --- | --- | --- |
| 1. Controls and skeleton | `codex/unified-docs/01-foundation` | Both empty profiles validate; inventories cover both repositories |
| 2. English site | `codex/unified-docs/02-english-site` | `pnpm build:en` passes and approved English route comparison is clean |
| 3. Shared tooling | `codex/unified-docs/03-shared-tooling` | Registry and publication APIs preserve English generation contracts |
| 4. Chinese site | `codex/unified-docs/04-chinese-site` | `pnpm build:zh-CN` passes without assembly or patching |
| 5. Reference boundary | `codex/unified-docs/05-reference-boundary` | English/Chinese Reference manifests are complete and deterministic |
| 6. CI/CD cutover | `codex/unified-docs/06-cicd-cutover` | Four Jenkins pipelines satisfy the versioned contract and shadow checks |
| 7. Retirement | `codex/unified-docs/07-retirement` | No deferred migration entries or runtime legacy-layout dependencies remain |

## Target file map

### Application and configuration

- `apps/docs/package.json` — named English and Chinese Docusaurus commands.
- `apps/docs/docusaurus.config.ts` — thin site-profile bootstrap.
- `apps/docs/src/config/createDocusaurusConfig.ts` — maps a resolved profile to Docusaurus plugins and theme configuration.
- `apps/docs/src/site/SiteProfileContext.tsx` — exposes the resolved profile to UI code without direct environment reads.
- `scripts/build/write-provenance.mjs` — writes the deterministic manifest into each completed site artifact.
- `packages/site-config/src/schema.ts` — closed Zod schemas and exported profile types.
- `packages/site-config/src/sites/en.ts` — complete English product graph.
- `packages/site-config/src/sites/zh-CN.ts` — complete Chinese product graph.
- `packages/site-config/src/resolve.ts` — only supported `ZDOC_SITE` resolution point.

### Content, tooling, and adapters

- `content/en/{guides,byoc,reference}` — committed English build inputs.
- `content/zh-CN/{guides,byoc,reference,onpremise,agents}` — committed Chinese build inputs.
- `generated/{en,zh-CN}/{sidebars,manifests}` — committed deterministic navigation and provenance files.
- `sidebar-overrides/{en,zh-CN}` — hand-maintained site-specific sidebar overlays.
- `packages/docs-tooling/src/manuals/{schema,registry}.ts` — separates remote sources from per-site publications.
- `packages/docs-tooling/src/publication/atomicReplace.ts` — validates staged output before replacing an owned committed tree.
- `packages/docs-tooling/src/validation/{ownership,filesystem,translation}.ts` — fail-closed repository and content checks.
- `packages/publication-adapters/src/{types,registry}.ts` — bounded publication hook API.
- `packages/publication-adapters/src/zh-CN/{normalizer,restReplacements,aliyunOss}.ts` — explicit Chinese publication behavior.
- `packages/docs-ui/src/{shared,en,zh-CN}` — shared and explicitly selected site UI modules.

### Migration and deployment evidence

- `migration/legacy-files.json` — path-level source commit/blob/disposition ledger.
- `migration/capabilities.json` — observable behavior inventory and acceptance evidence.
- `migration/dependencies.json` — direct-dependency allowlist and ownership.
- `migration/approved-differences.json` — reviewed differential-build exceptions.
- `migration/reports/` — baseline, route, filesystem, archive, and cutover reports.
- `scripts/migration/` — deterministic inventory, drift, route, and integrity checks.
- `deploy/en/` and `deploy/zh-CN/` — site-owned Docker/Nginx packaging.
- `deploy/contracts/{schema,verify-image,release-record}.ts` — Jenkins-facing immutable release contract.

---

## Milestone 1: Migration controls and repository skeleton

### Task 1: Create the isolated worktree and record immutable baselines

**Files:**
- Create: `.claude/worktrees/unified-docs-clean-room` (Git worktree, ignored)
- Create locally: `.claude/archives/zdoc-cn-pre-merge.bundle` (ignored, mode 0600)
- Create: `migration/reports/baseline.json`
- Create: `migration/reports/zdoc-cn-archive.json`
- Modify: `.gitignore`

- [ ] **Step 1: Verify both reference repositories are clean**

Run:

```bash
git status --short
git -C ../zdoc_cn status --short
```

Expected: no output from either command. Stop and ask the owner before continuing if either repository has uncommitted changes.

- [ ] **Step 2: Create the normal-history worktree**

Use `superpowers:using-git-worktrees`, then run:

```bash
git worktree add .claude/worktrees/unified-docs-clean-room -b codex/unified-docs/01-foundation master
git -C .claude/worktrees/unified-docs-clean-room merge-base --is-ancestor master HEAD
```

Expected: the second command exits 0. Do not use `--orphan`.

- [ ] **Step 3: Capture baseline identities and checks**

From the new worktree, run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:frontend
pnpm build
npm ci --prefix ../../../../zdoc_cn
pnpm --dir ../../../../zdoc_cn test:cn-publish-normalizer
pnpm --dir ../../../../zdoc_cn test:docs-workflow
(
  cd ../../../../zdoc_cn
  npm run assemble
  node scripts/upstream/validate-assembled.js
  pnpm --dir .zdoc-assembled install --frozen-lockfile
  pnpm --dir .zdoc-assembled run build
)
```

Record the two repository SHAs, command, exit status, Node version, pnpm version, and artifact path in `migration/reports/baseline.json`; do not record secrets or complete environment dumps. `npm ci` is used only to reproduce the legacy `zdoc_cn` package-lock/CI baseline; it is not a unified-target dependency or build path. The unified workspace, both replacement-site builds, and Jenkins use pnpm only.

- [ ] **Step 4: Create and verify the Chinese repository archive**

Run outside the archive target directory:

```bash
mkdir -p .claude/archives
git -C ../../../../zdoc_cn bundle create "$PWD/.claude/archives/zdoc-cn-pre-merge.bundle" HEAD refs/remotes/origin/master refs/remotes/origin/dev '--glob=refs/remotes/origin/v*' --tags
chmod 600 .claude/archives/zdoc-cn-pre-merge.bundle
git bundle verify .claude/archives/zdoc-cn-pre-merge.bundle
git bundle list-heads .claude/archives/zdoc-cn-pre-merge.bundle
shasum -a 256 .claude/archives/zdoc-cn-pre-merge.bundle
```

Expected: bundle verification succeeds and list-heads contains only the explicit checked-out source HEAD, the two approved published branches, published version refs, and tags. Store the source URL, source HEAD, exact included refs, ref policy, file mode, retention class, bundle SHA-256, creation command, and controlled archive location in `migration/reports/zdoc-cn-archive.json`; do not commit the bundle. Copy it to approved immutable archival storage and re-verify its SHA-256 before retiring `zdoc_cn`.

- [ ] **Step 5: Commit the baseline evidence**

```bash
git add .gitignore migration/reports/baseline.json migration/reports/zdoc-cn-archive.json
git commit -m "chore: record unified docs migration baselines"
```

### Task 2: Build file, capability, and dependency inventories

**Files:**
- Create: `scripts/migration/inventory.mjs`
- Create: `scripts/migration/inventory.test.mjs`
- Create: `scripts/migration/integrity.mjs`
- Create: `scripts/migration/integrity.test.mjs`
- Create: `migration/legacy-files.json`
- Create: `migration/capabilities.json`
- Create: `migration/dependencies.json`
- Create: `migration/approved-differences.json`

- [ ] **Step 1: Write failing inventory tests**

Test these contracts with `node:test`:

```js
test('rejects a migration entry without immutable source identity', () => {
  assert.throws(() => validateLegacyEntry({sourceRepository: 'zdoc', sourcePath: 'docs'}), /sourceCommit/);
});

test('rejects deferred entries in cutover mode', () => {
  assert.throws(() => validateManifest([{...validEntry, disposition: 'defer'}], {cutover: true}), /defer/);
});

test('requires every capability to name acceptance evidence', () => {
  assert.throws(() => validateCapability({...validCapability, acceptanceEvidence: []}), /acceptanceEvidence/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/migration/inventory.test.mjs`

Expected: FAIL because `scripts/migration/inventory.mjs` does not exist.

- [ ] **Step 3: Implement the inventory validator and generator**

Export `validateLegacyEntry`, `validateManifest`, `validateCapability`, and `generateInventory`. The generator must:

```js
const EXCLUDED_ROOTS = new Set([
  '.git', '.docusaurus', '.zdoc-assembled', '.zdoc-upstream',
  'build', 'node_modules', 'playwright-report', 'test-results',
]);
```

For every included path, record `sourceRepository`, `sourcePath`, `sourceCommit`, `sourceBlobId`, `disposition`, `owner`, `evidence`, and optional `targetPath`. Seed capabilities for build commands, Docusaurus plugins, routes, sidebars, search, generated Markdown, translation, Docker/Nginx, Jenkins inputs, assembly, overlay validation, and rollback.

- [ ] **Step 4: Generate and review inventories**

Run:

```bash
node scripts/migration/inventory.mjs --zdoc . --zdoc-cn ../../../../zdoc_cn --write
node --test scripts/migration/inventory.test.mjs
```

Expected: tests pass; generated JSON is sorted; no excluded build/cache root appears; every `overlay-manifest.json` copy and patch entry has a migration disposition.

- [ ] **Step 5: Implement and run repository-integrity scans**

Test fixtures must prove detection of case-folded path collisions, NFC/NFD collisions, unapproved symlinks, executable-bit drift, CRLF outside the `.gitattributes` policy, absolute/path-traversal links, files above the declared size limit, `.env`/credential filenames, and common embedded token/private-key markers. The scanner emits sorted JSON findings and hashes bytes without following symlinks.

Run:

```bash
node --test scripts/migration/integrity.test.mjs
node scripts/migration/integrity.mjs --root . --report migration/reports/integrity-zdoc.json
node scripts/migration/integrity.mjs --root ../../../../zdoc_cn --report migration/reports/integrity-zdoc-cn.json
```

Expected: fixture tests pass; repository reports contain no unreviewed critical finding. Add explicit allowlist entries with owner and reason for every retained exception.

- [ ] **Step 6: Commit the inventories**

```bash
git add scripts/migration migration
git commit -m "chore: inventory unified docs migration scope"
```

### Task 3: Create workspace packages and closed profile schemas

**Files:**
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Create: `apps/docs/package.json`
- Create: `packages/site-config/package.json`
- Create: `packages/site-config/src/schema.ts`
- Create: `packages/site-config/src/resolve.ts`
- Create: `packages/site-config/src/sites/en.ts`
- Create: `packages/site-config/src/sites/zh-CN.ts`
- Create: `packages/site-config/src/resolve.test.ts`
- Create: `packages/{docs-tooling,docs-ui,publication-adapters}/package.json`

- [ ] **Step 1: Write failing profile-resolution tests**

```ts
it('resolves only named site profiles', () => {
  expect(resolveSiteProfile('en').id).toBe('en');
  expect(resolveSiteProfile('zh-CN').id).toBe('zh-CN');
  expect(() => resolveSiteProfile(undefined)).toThrow(/ZDOC_SITE/);
  expect(() => resolveSiteProfile('fr')).toThrow(/Unsupported site/);
});

it('rejects overlapping output and content ownership', () => {
  expect(() => SiteProfileSchema.parse({...enProfile, outputDir: 'content/en'})).toThrow();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run packages/site-config/src/resolve.test.ts`

Expected: FAIL because the package and resolver do not exist.

- [ ] **Step 3: Implement the closed schemas**

Define `SiteIdSchema = z.enum(['en', 'zh-CN'])`, strict schemas for content plugins, features, integrations, redirects, and `SiteProfile`, plus a repository-relative path refinement that rejects absolute paths, `..`, backslashes, and empty path segments. Export inferred TypeScript types from the schemas.

The initial profiles must use different output roots and explicit content graphs:

```ts
export const enProfile = SiteProfileSchema.parse({
  id: 'en', language: 'en', title: 'Zilliz Cloud Developer Hub',
  url: 'https://docs.zilliz.com', baseUrl: '/', outputDir: 'build/en',
  content: [], manuals: [], staticRoots: ['apps/docs/static/shared', 'apps/docs/static/en'],
  features: {chat: true, askAi: true, feedback: true, cloudSelector: true, byoc: true, onpremise: false, agents: false, referenceKinds: []},
  navigation: {items: []}, markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {}, redirects: {rules: []}, robots: {index: true},
});
```

Create the equivalent schema-valid `zh-CN` profile with `language: 'zh-Hans'`, `url: 'https://docs.zilliz.com.cn'`, `outputDir: 'build/zh-CN'`, and explicit Chinese features.

- [ ] **Step 4: Add named root commands and workspace packages**

Root scripts must be exactly:

```json
{
  "build:en": "pnpm --filter @zilliz/docs-site run build:en",
  "build:zh-CN": "pnpm --filter @zilliz/docs-site run build:zh-CN",
  "start:en": "pnpm --filter @zilliz/docs-site run start:en",
  "start:zh-CN": "pnpm --filter @zilliz/docs-site run start:zh-CN",
  "test:profiles": "pnpm vitest run packages/site-config"
}
```

Add `apps/*` and `packages/*` to `pnpm-workspace.yaml`. Each new package exports only its `src/index.ts` public API.

- [ ] **Step 5: Verify and commit the skeleton**

Run:

```bash
pnpm install
pnpm install --frozen-lockfile
pnpm test:profiles
pnpm typecheck
```

Expected: all commands exit 0.

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml apps packages
git commit -m "feat: add unified site profile workspace"
```

---

## Milestone 2: English site vertical migration

### Task 4: Create the profile-driven Docusaurus application

**Files:**
- Create: `apps/docs/docusaurus.config.ts`
- Create: `apps/docs/src/config/createDocusaurusConfig.ts`
- Create: `apps/docs/src/config/createDocusaurusConfig.test.ts`
- Create: `apps/docs/src/site/SiteProfileContext.tsx`
- Create: `scripts/migration/check-profile-env.mjs`
- Create: `scripts/build/write-provenance.mjs`
- Create: `scripts/build/write-provenance.test.mjs`
- Move: `src/clientModules` to `apps/docs/src/clientModules`
- Move: `src/css` to `apps/docs/src/css`
- Move: `plugins/{embed-markdown,llms-txt,structured-data,link-checks,mdx-parse}` to `apps/docs/plugins/`

- [ ] **Step 1: Write failing configuration-factory tests**

Verify that an English profile registers only its declared content plugins, returns `i18n.locales: ['en']`, uses `build/en`, and never points to `i18n/zh-CN`. Verify a Chinese profile can register `onpremise` and `agents` without adding them to English.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run apps/docs/src/config/createDocusaurusConfig.test.ts`

Expected: FAIL because the factory does not exist.

- [ ] **Step 3: Implement the thin bootstrap and factory**

`apps/docs/docusaurus.config.ts` contains only:

```ts
import {resolveSiteProfile} from '@zilliz/site-config';
import {createDocusaurusConfig} from './src/config/createDocusaurusConfig';

export default createDocusaurusConfig(resolveSiteProfile(process.env.ZDOC_SITE));
```

The factory maps each `ContentPluginProfile` to `@docusaurus/plugin-content-docs`, wires shared Markdown plugins once, and uses the profile for title, URL, output directory, navigation, redirects, static roots, and integrations. No file outside `packages/site-config/src/resolve.ts` may read `ZDOC_SITE`.

- [ ] **Step 4: Add an environment-access guard**

Create `scripts/migration/check-profile-env.mjs` that scans tracked `.js/.ts/.tsx` source files and fails if `process.env.ZDOC_SITE` occurs outside the two allowed bootstrap files. Add `test:architecture` to the root scripts.

- [ ] **Step 5: Add deterministic build provenance**

Write a failing `node:test` fixture first. The writer hashes the strict site profile, `pnpm-lock.yaml`, `migration/dependencies.json`, `migration/legacy-files.json`, selected content manifests, normalized route inventory, allowlisted non-secret build-environment fields, and artifact bytes excluding the provenance file itself. It writes `build/<site>/build-provenance.json` with schema version, repository, 40-character commit, site, all component hashes, Node/pnpm versions, and artifact hash; sorted JSON and repeated runs must be byte-identical.

The app package scripts become:

```json
{
  "build:en": "ZDOC_SITE=en docusaurus build --out-dir ../../build/en && node ../../scripts/build/write-provenance.mjs --site en --build ../../build/en",
  "build:zh-CN": "ZDOC_SITE=zh-CN docusaurus build --out-dir ../../build/zh-CN && node ../../scripts/build/write-provenance.mjs --site zh-CN --build ../../build/zh-CN",
  "start:en": "ZDOC_SITE=en docusaurus start",
  "start:zh-CN": "ZDOC_SITE=zh-CN docusaurus start"
}
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm vitest run apps/docs/src/config/createDocusaurusConfig.test.ts
node --test scripts/build/write-provenance.test.mjs
pnpm test:architecture
pnpm typecheck
```

Expected: all commands exit 0.

```bash
git add apps/docs packages/site-config scripts/migration package.json
git commit -m "feat: create profile-driven docs application"
```

### Task 5: Move the English content graph and shared UI

**Files:**
- Move: `docs` to `content/en/guides`
- Move: `docs-byoc` to `content/en/byoc`
- Move: `reference` to `content/en/reference`
- Move: `config/generated` to `generated/en/sidebars`
- Move: `config/sidebar-overrides` to `sidebar-overrides/en`
- Move: `sidebarsTutorial.ts`, `sidebarsByoc.ts`, `sidebarsReference.ts` to `packages/site-config/src/sidebars/en/`
- Move: `src/theme` and reusable `src/components` to `packages/docs-ui/src/shared/`
- Move: English-only home/navigation modules to `packages/docs-ui/src/en/`
- Move: `static` to `apps/docs/static/shared`
- Modify: `packages/site-config/src/sites/en.ts`
- Create: `scripts/migration/capture-routes.mjs`
- Create: `scripts/migration/compare-routes.mjs`
- Create: `scripts/migration/compare-routes.test.mjs`

- [ ] **Step 1: Capture the legacy English route baseline**

Create `scripts/migration/capture-routes.mjs` and run it against the existing `build` output before moving content. Commit the sorted result as `migration/reports/routes-en-legacy.json`; exclude hashes, timestamps, and chunk filenames.

- [ ] **Step 2: Move one English plugin tree at a time**

Use `git mv` in this order: Guides, BYOC, Reference. After each move, update only the corresponding profile entry and sidebar path, then run the focused Docusaurus build. Do not move all three trees before the first build succeeds.

After each focused build passes, commit that content-plugin move separately with `feat: migrate English Guides content`, `feat: migrate English BYOC content`, and `feat: migrate English Reference content`. This preserves rename evidence and makes each route delta independently reviewable.

English profile content entries end as:

```ts
content: [
  {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'docs', sidebarPath: 'generated/en/sidebars/guides.sidebar.js'},
  {id: 'byoc', sourcePath: 'content/en/byoc', routeBasePath: 'docs/byoc', sidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js'},
  {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: 'packages/site-config/src/sidebars/en/reference.ts'},
],
```

- [ ] **Step 3: Move UI with explicit exports**

`packages/docs-ui/src/index.ts` exports `sharedUiModules` and `englishUiModules`; the application selects modules by profile configuration. Preserve existing Vitest tests beside the moved components and update aliases instead of copying components.

- [ ] **Step 4: Compare English outputs**

Run:

```bash
pnpm build:en
node scripts/migration/capture-routes.mjs --build build/en --output migration/reports/routes-en-replacement.json
node scripts/migration/compare-routes.mjs --legacy migration/reports/routes-en-legacy.json --replacement migration/reports/routes-en-replacement.json --approved migration/approved-differences.json --site en
pnpm test:frontend
pnpm typecheck
```

Expected: build and tests pass; comparison reports no unclassified route difference.

- [ ] **Step 5: Commit the English vertical slice**

```bash
git add apps packages content generated sidebar-overrides migration scripts package.json pnpm-lock.yaml
git commit -m "feat: migrate English site to unified profile"
```

---

## Milestone 3: Shared documentation tooling and extension points

### Task 6: Replace `config/lark-docs.config.ts` with a typed manual registry

**Files:**
- Create: `packages/docs-tooling/src/manuals/schema.ts`
- Create: `packages/docs-tooling/src/manuals/registry.ts`
- Create: `packages/docs-tooling/src/manuals/registry.test.ts`
- Create: `packages/docs-tooling/src/validation/ownership.ts`
- Create: `packages/docs-tooling/src/validation/filesystem.ts`
- Create: `packages/docs-tooling/src/validation/validation.test.ts`
- Move: `plugins/lark-docs` to `packages/docs-tooling/src/lark`
- Move: `plugins/apifox-docs` to `packages/docs-tooling/src/reference/rest`
- Modify: `scripts/docs-workflow/run-content-group.js`

- [ ] **Step 1: Write failing registry tests**

Cover: publication source keys must exist; output roots must be site-owned; active publications use `missingContent: 'error'`; Reference Chinese sources are local committed content; disabled manuals have no implicit fallback; publication outputs are disjoint.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run packages/docs-tooling/src/manuals/registry.test.ts`

Expected: FAIL because the registry does not exist.

- [ ] **Step 3: Transfer verified source data into the registry**

Define `ManualDefinition`, `ManualSource`, and `ManualPublication` from the approved design. Transfer current English roots/base IDs/versions and Chinese roots/base IDs/versions from both repositories. Do not carry forward destination paths such as `.zdoc-assembled`; every publication targets `content/<site>` and `generated/<site>`.

- [ ] **Step 4: Introduce a compatibility CLI before moving internals**

Add `packages/docs-tooling/src/cli.ts` with commands:

```text
docs-tooling fetch --manual <id> --site <en|zh-CN> --stage <dir>
docs-tooling validate --manual <id> --site <en|zh-CN> --stage <dir>
docs-tooling publish --manual <id> --site <en|zh-CN> --stage <dir>
```

Keep `run-content-group.js` as a temporary adapter that calls these commands. Record the adapter in `migration/capabilities.json` with removal milestone 7.

Add the root command:

```json
{
  "docs-tooling": "node --experimental-strip-types packages/docs-tooling/src/cli.ts"
}
```

Port the proven path-ownership and repository-integrity rules from milestone 1 into `packages/docs-tooling/src/validation`. The CLI must call them before publication; the migration scripts remain thin command wrappers until milestone 7.

- [ ] **Step 5: Run contract and English regression checks**

Run:

```bash
pnpm vitest run packages/docs-tooling
node --test scripts/docs-workflow/*.test.js
pnpm build:en
```

Expected: all commands exit 0 and generated English owned paths match the recorded baseline.

- [ ] **Step 6: Commit the tooling boundary**

```bash
git add packages/docs-tooling scripts/docs-workflow migration package.json pnpm-lock.yaml
git commit -m "refactor: isolate documentation tooling and registry"
```

### Task 7: Add atomic publication and bounded adapters

**Files:**
- Create: `packages/docs-tooling/src/publication/atomicReplace.ts`
- Create: `packages/docs-tooling/src/publication/atomicReplace.test.ts`
- Create: `packages/publication-adapters/src/types.ts`
- Create: `packages/publication-adapters/src/registry.ts`
- Create: `packages/publication-adapters/src/registry.test.ts`

- [ ] **Step 1: Write failing atomicity and sandbox tests**

Verify a failed validation leaves the prior target unchanged, successful publication uses a same-filesystem rename, a stale baseline SHA fails compare-and-swap without changing live files, adapters cannot write outside the declared root, duplicate adapter IDs fail, and an undeclared adapter ID fails closed.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/publication/atomicReplace.test.ts
pnpm vitest run packages/publication-adapters/src/registry.test.ts
```

Expected: both fail because implementations do not exist.

- [ ] **Step 3: Implement the public contracts**

```ts
export interface PublicationAdapter {
  id: string;
  transformDocument(document: GeneratedDocument, context: PublicationContext): GeneratedDocument;
  validatePublication(root: string, context: PublicationContext): Promise<void>;
}
```

`PublicationContext` contains `site`, `manual`, `publicationRoot`, `baselineCommit`, and immutable source identity. Resolve every path under `publicationRoot` before adapter execution and reject escapes. Before replacement, compare `baselineCommit` with the current owned-tree commit/hash; a mismatch aborts publication and preserves both the live tree and staged diagnostics.

**Atomic publication threat model and audit:**

- The atomic boundary is a cooperative writer protocol. Every supported in-place writer for the same owned path set must use `atomicReplace`, and therefore the same transaction-key writer lock. Official Docusaurus builds use the corresponding read fence.
- Snapshot validation runs against the immutable transaction snapshot's publication-shaped root, never against the mutable stage. The CLI validates snapshot content and sidebar artifacts with the same filesystem and integrity checks used during stage validation; diagnostics and anchors remain read-only evidence outside the owned snapshot.
- Node exposes no portable conditional directory rename. The implementation performs content, inode, ancestor, CAS, and destination checks immediately before `renameSync`, but a non-cooperative same-UID process mutating the filesystem in the final check-to-syscall gap is outside the lock-free guarantee. No unaudited native helper is introduced.
- Repository writer audit: `packages/docs-tooling/src/cli.ts` is the supported in-place publication path and uses `atomicReplace`. Lark/REST generators write canonical staging roots before publication. Docs workflow assembly and translation helpers write isolated or detached CI worktrees that are committed through Git rather than concurrently replacing a served publication tree. `scripts/build/write-provenance.mjs` writes only the selected build output. No second supported in-place publication writer was found.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run packages/docs-tooling packages/publication-adapters`

Expected: all tests pass.

```bash
git add packages/docs-tooling packages/publication-adapters
git commit -m "feat: add atomic publication adapter boundary"
```

---

## Milestone 4: Chinese site and publication adapters

### Task 8: Port Chinese transforms as named adapters

**Files:**
- Create: `packages/publication-adapters/src/zh-CN/normalizer.ts`
- Create: `packages/publication-adapters/src/zh-CN/normalizer.test.ts`
- Create: `packages/publication-adapters/src/zh-CN/restReplacements.ts`
- Create: `packages/publication-adapters/src/zh-CN/restReplacements.test.ts`
- Create: `packages/publication-adapters/src/zh-CN/aliyunOss.ts`
- Modify: `packages/publication-adapters/src/registry.ts`

- [ ] **Step 1: Copy behavioral fixtures, not implementation trees**

Move representative input/output fixtures from `../zdoc_cn/plugins/cn-publish-normalizer/*.test.js`, `../zdoc_cn/config/cn-publish-replacements.js`, and REST reconciliation tests into package test fixtures. Record each source path, `zdoc_cn` commit, and blob ID in `migration/legacy-files.json`.

- [ ] **Step 2: Write failing adapter tests**

Verify deterministic Markdown normalization, table/slug behavior, Chinese REST replacement scope, idempotence, and that English publication receives no Chinese transform.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `pnpm vitest run packages/publication-adapters/src/zh-CN`

Expected: FAIL because adapters are not implemented.

- [ ] **Step 4: Implement and register adapters**

Register stable IDs `zh-CN.markdown-normalizer`, `zh-CN.rest-replacements`, and `zh-CN.aliyun-oss`. Keep storage I/O behind an injected interface so unit tests use an in-memory fake and builds require no network.

- [x] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run packages/publication-adapters
pnpm build:en
```

Expected: adapter tests pass and the English route/artifact comparison remains unchanged.

```bash
git add packages/publication-adapters migration
git commit -m "feat: port Chinese publication adapters"
```

### Task 9: Import the Chinese product graph without Docusaurus content i18n

**Files:**
- Modify: `packages/site-config/src/sites/zh-CN.ts`
- Create: `packages/site-config/src/sidebars/zh-CN/`
- Create: `packages/docs-ui/src/zh-CN/`
- Create: `apps/docs/static/zh-CN/`
- Create: `content/zh-CN/{guides,byoc,onpremise,agents,reference}`
- Create: `generated/zh-CN/{sidebars,manifests}`
- Create: `sidebar-overrides/zh-CN/`

- [x] **Step 1: Capture and classify the legacy Chinese route baseline**

Build the unchanged deployed `zdoc_cn` Chinese site with `npm run build`, then run `capture-routes.mjs` against its canonical root `zh-Hans` output and commit `migration/reports/routes-zh-CN-legacy.json`. Separately reproduce `npm run build:assembled` and record its locales and route tree in `migration/reports/routes-zh-CN-legacy-context.json`: the assembled workflow is an overlay integration check, not the Chinese baseline when it emits no Chinese tree. Do not relabel standalone output as assembled; the context report must preserve the exact commands, source SHAs, and the reason the deployed Chinese build is canonical.

- [x] **Step 2: Import content in owned batches**

Import Guides, BYOC, On-premise, Agents, and Reference separately. Exclude `.zdoc-upstream`, `.zdoc-assembled`, `build`, `.docusaurus`, `node_modules`, caches, and CI logs. After each batch run the secret, symlink, case, Unicode, mode, line-ending, large-file, and relative-link scans; record the source commit/blob IDs in the migration ledger.

Commit each passing batch with its ledger update before importing the next content owner. Never combine a failed or unclassified batch with a later successful batch.

- [x] **Step 3: Complete the Chinese profile**

The Chinese profile explicitly registers its five content plugin roots and selects Chinese UI modules, navigation, redirects, robots, integrations, and publication adapters. Configure exactly one Docusaurus language for the build and assert that no content path starts with `i18n/`.

- [x] **Step 4: Build and compare Chinese output**

Run:

```bash
pnpm build:zh-CN
node scripts/migration/capture-routes.mjs --build build/zh-CN --output migration/reports/routes-zh-CN-replacement.json --site zh-CN
node scripts/migration/compare-routes.mjs --legacy migration/reports/routes-zh-CN-legacy.json --replacement migration/reports/routes-zh-CN-replacement.json --approved migration/approved-differences.json --site zh-CN
pnpm build:en
```

Expected: both site builds pass and route comparison has no unclassified difference.

- [x] **Step 5: Prove assembly independence**

Temporarily make `../../../../zdoc_cn` unavailable to the build command and run `pnpm build:zh-CN` from a clean checkout with document-network access disabled. Expected: build passes and neither `.zdoc-upstream` nor `.zdoc-assembled` is created.

- [x] **Step 6: Commit the Chinese vertical slice**

```bash
git add apps packages content generated sidebar-overrides migration
git commit -m "feat: add independent Chinese site profile"
```

---

## Milestone 5: Reference source and translation boundary

### Task 10: Add deterministic Reference translation provenance

**Files:**
- Create: `packages/docs-tooling/src/reference/translationManifest.ts`
- Create: `packages/docs-tooling/src/reference/translationManifest.test.ts`
- Create: `packages/docs-tooling/src/validation/translation.ts`
- Create: `generated/en/manifests/reference.json`
- Create: `generated/zh-CN/manifests/reference-translations.json`

- [x] **Step 1: Write failing completeness tests**

Cover active source without target, orphan target, mismatched source hash, mismatched target hash, path escape, duplicate target, explicit retirement, deterministic sorting, and absence of volatile timestamps.

- [x] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run packages/docs-tooling/src/reference/translationManifest.test.ts`

Expected: FAIL because the manifest builder does not exist.

- [x] **Step 3: Implement the manifest record**

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

Hash file bytes with SHA-256, normalize paths to repository-relative POSIX form, sort by manual/sourcePath/targetPath, and reject fields not present in the schema.

- [x] **Step 4: Generate manifests from the only committed Reference trees**

Run:

```bash
pnpm docs-tooling reference-manifest --source content/en/reference --target content/zh-CN/reference --source-commit HEAD --write
pnpm docs-tooling validate-reference --site en
pnpm docs-tooling validate-reference --site zh-CN
```

Expected: manifests are written only under `generated/*/manifests`; no `content-sources/reference` or `translations/zh-CN/reference` directory is created.

- [x] **Step 5: Verify deterministic regeneration and commit**

Run the generation command twice, then run `git diff --exit-code` after the second run. Expected: no diff.

```bash
git add packages/docs-tooling generated content/en/reference content/zh-CN/reference
git commit -m "feat: enforce Reference translation provenance"
```

---

## Milestone 6: CI/CD contracts, differential validation, and cutover

### Task 11: Add site-owned container packaging

**Files:**
- Create: `deploy/en/Dockerfile`
- Create: `deploy/en/nginx.conf`
- Create: `deploy/zh-CN/Dockerfile`
- Create: `deploy/zh-CN/nginx.conf`
- Create: `deploy/contracts/image-labels.schema.json`
- Create: `deploy/contracts/smoke.sh`
- Create: `deploy/contracts/container.test.mjs`
- Modify: `package.json`

- [x] **Step 1: Write container-contract tests**

Create `deploy/contracts/container.test.mjs` that verifies both Dockerfiles accept `ZDOC_SHA`, `ZDOC_SITE`, and `JENKINS_BUILD_ID`, invoke only `pnpm build:<site>`, copy the matching output root, and declare OCI labels for source repository, revision, site, and Jenkins build identity.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test deploy/contracts/container.test.mjs`

Expected: FAIL because site-owned Dockerfiles do not exist.

- [x] **Step 3: Implement site-owned Docker and Nginx files**

Use one dependency installation layer and one site build per Dockerfile. English redirects come from the verified current `nginx.conf`; Chinese redirects and runtime behavior come from the verified `zdoc_cn` configuration. Do not copy Jenkins Groovy, build output, credentials, or mutable state into `deploy/`.

- [x] **Step 4: Build and smoke-test both images**

Run:

```bash
docker build -f deploy/en/Dockerfile --build-arg ZDOC_SHA=$(git rev-parse HEAD) --build-arg JENKINS_BUILD_ID=local-en -t zdoc-en:test .
docker build -f deploy/zh-CN/Dockerfile --build-arg ZDOC_SHA=$(git rev-parse HEAD) --build-arg JENKINS_BUILD_ID=local-zh -t zdoc-zh-cn:test .
deploy/contracts/smoke.sh zdoc-en:test en
deploy/contracts/smoke.sh zdoc-zh-cn:test zh-CN
```

Expected: both images build, labels validate, health checks pass, and representative routes return expected status codes.

Validation note (2026-07-26, local Docker Desktop): both images built from revision `2baf97a007a34b10dde9412263101f5846cd9b85`; `zdoc-en:test` is `sha256:b13b3e0d4ee3fda92318168311876687cea9453b990e3041dc57093d493ff3ff` and `zdoc-zh-cn:test` is `sha256:9873df7373ba6e32f8d0d1a51ae11018deded7580d9010bb04237f917b0f44f2`. Both smoke checks passed their label, health, and representative-route contracts, and their temporary containers were removed. The Chinese Docker build required an explicit 4 GiB Node heap; the prior default heap failed at approximately 2 GiB and an 8 GiB heap caused severe pressure in the 8.39 GB Docker VM.

- [x] **Step 5: Commit packaging**

```bash
git add deploy package.json
git commit -m "feat: add independent site container packaging"
```

### Task 12: Codify the four-pipeline Jenkins release contract

**Files:**
- Create: `deploy/contracts/release.schema.json`
- Create: `deploy/contracts/verify-image.mjs`
- Create: `deploy/contracts/verify-image.test.mjs`
- Create: `deploy/contracts/path-filters.json`
- Create: `deploy/contracts/release-record.example.json`
- Create: `deploy/contracts/README.md`

- [x] **Step 1: Write failing release-mode tests**

Cover English/Chinese site identity, UAT producer identity, repository `zdoc`, immutable source SHA, registry digest format, `rebuild` required fields, `specified-image` required fields, wrong-site rejection, non-UAT rejection, tag-to-digest resolution, and rollback to a recorded Prod digest.

- [x] **Step 2: Run the test and verify RED**

Run: `node --test deploy/contracts/verify-image.test.mjs`

Expected: FAIL because the verifier does not exist.

- [x] **Step 3: Implement the release record and verifier**

The release record contains:

```json
{
  "site": "zh-CN",
  "environment": "prod",
  "mode": "specified-image",
  "sourceRepository": "zdoc",
  "sourceSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceUatDigest": "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "finalDeployedDigest": "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "jenkinsBuildIdentity": "job-name#build-number"
}
```

`rebuild` requires the requested SHA, linked same-site/same-SHA UAT evidence, and resulting digest. `specified-image` accepts the existing operator image reference, resolves it before approval, verifies corresponding UAT provenance, and records immutable source/final digests without rebuilding the application payload.

- [x] **Step 4: Document the externally owned pipeline matrix**

`deploy/contracts/README.md` names English UAT, English Prod, Chinese UAT, and Chinese Prod; maps each to `pnpm build:en` or `pnpm build:zh-CN`; documents current `rebuild` and `specified-image` Prod paths; and states that Groovy, credentials, registry access, approvals, and environment configuration remain in `vdc-jenkins`.

`path-filters.json` requires both site checks for shared application, package, lockfile, manual-registry, or shared Reference-generator changes; requires only the owned site for site content/profile/deploy changes; and adds Chinese translation coverage validation when canonical English Reference changes.

- [x] **Step 5: Verify and commit**

Run:

```bash
node --test deploy/contracts/*.test.mjs
pnpm build:en
pnpm build:zh-CN
```

Expected: all tests and builds pass.

Validation note (2026-07-26): all 35 release/container contract tests pass, followed by successful `pnpm build:en` and `pnpm build:zh-CN` runs in the ordinary host Terminal under Node `v26.3.0`. The prior Chinese status 13 was isolated to Docusaurus `mdxCrossCompilerCache`: with the cache enabled, the server compiler promise could remain unsettled after the client compiler completed; disabling only that cache preserves the SWC/HTML/CSS acceleration paths and makes both Node 22 and Node 26 workspace builds complete. Existing broken-link, broken-anchor, and one-page HTML-minifier diagnostics remain non-blocking warnings.

```bash
git add deploy/contracts
git commit -m "feat: define Jenkins dual-mode release contract"
```

### Task 13: Run shadow validation and execute cutover gates

**Files:**
- Create: `migration/runbooks/cutover-zh-CN.md`
- Create: `migration/runbooks/rollback-zh-CN.md`
- Create: `migration/reports/shadow-en.json`
- Create: `migration/reports/shadow-zh-CN.json`
- Modify: `migration/capabilities.json`
- Modify: `migration/approved-differences.json`

- [x] **Step 1: Synchronize the branch and run clean builds**

Rebase or merge the latest reviewed `master` according to repository policy, update migration drift records, install from a frozen lockfile in a fresh checkout, and run both named builds with document-network access disabled.

Validation note (2026-07-26): merged reviewed `origin/master` at `9ae596fd95b092d07f146aacb45d6ef52e934f2c`; clean Node 22 Docker builds at `f3c889e01e6e462156e3080ce46baeb394364805` performed `pnpm install --frozen-lockfile` and ran the publication read fence. The merged agent-chat frontend exposed single-renderer Chinese SSG memory accumulation; the validated fix retains a 4096 MiB heap and uses two Docusaurus SSG worker threads with built-in recycling for `zh-CN` only.

- [ ] **Step 2: Run differential artifact checks**

Compare routes, navigation, redirects, canonical URLs, metadata, static assets, search/LLM/structured-data outputs, Docker labels, health behavior, and representative rendered pages. Classify every difference as intentional, fixed legacy defect, or reviewed nondeterminism in `migration/approved-differences.json`.

Partial validation note (2026-07-26): exhaustive route/canonical comparisons are clean (English 1868/1868, Chinese 1686/1686, zero differences); both local images pass immutable-label, health, representative-route, chat-routing contract, and cleanup checks. Production-equivalent CDN metadata, full asset/search/LLM/structured-data sampling, and rendered-page checks remain part of the external shadow deployment gate.

- [ ] **Step 3: Deploy non-mutating shadows**

Deploy English and Chinese candidate digests on non-production hostnames with production-equivalent Nginx/CDN settings. Synthetic checks must not publish content, mutate translation state, send user notifications, or write production integrations.

- [ ] **Step 4: Rehearse both Prod modes and rollback**

For each site, exercise a `rebuild` candidate and a `specified-image` candidate from the corresponding UAT pipeline. Confirm the release record resolves tags to digests and rollback can redeploy a previously recorded Prod digest without rebuilding.

- [ ] **Step 5: Record go/no-go evidence and commit**

Every capability must have acceptance evidence, every migration entry required for cutover must be non-deferred, and both runbooks must name exact SHAs, digests, owners, commands, recovery time, observation window, and archive location.

```bash
git add migration deploy/contracts
git commit -m "docs: record unified docs cutover evidence"
```

---

## Milestone 7: Legacy retirement and archive rehearsal

### Task 14: Remove assembly, overlay, and transitional compatibility paths

**Files:**
- Remove after replacement gates: legacy root `docusaurus.config.ts`, `config/lark-docs.config.ts`, migrated entries under `src/` and `plugins/`, obsolete root sidebars, and superseded content-workflow scripts recorded in the migration ledger
- Remove from `zdoc_cn` only in its separately reviewed retirement change: `scripts/upstream/`, `upstream.lock`, `overlay-manifest.json`, `patches/upstream/`, `.zdoc-assembled` workflow references
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `migration/legacy-files.json`
- Modify: `migration/capabilities.json`
- Create: `scripts/migration/check-retirement.mjs`
- Create: `scripts/migration/check-retirement.test.mjs`

- [ ] **Step 1: Write failing retirement tests**

Verify: no `defer` entries; no imports from paths marked retired under the legacy `src`, `plugins`, `scripts`, or `config` roots; no `upstream:materialize`, `assemble`, `build:assembled`, `.zdoc-upstream`, `.zdoc-assembled`, overlay copy, or patch application in active build/workflow files; no undeclared direct dependency remains. Retained `scripts/build` and `scripts/migration` files are validated replacement entry points, not legacy-root exceptions.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/migration/check-retirement.test.mjs`

Expected: FAIL and list every remaining transitional dependency.

- [ ] **Step 3: Retire providers in subsystem commits**

Remove one already-replaced provider at a time. After each removal run its replacement unit tests plus both site builds when shared code changed. Update its file and capability disposition/evidence in the same commit. Do not use one repository-wide deletion commit.

- [ ] **Step 4: Remove unused dependencies and regenerate the lockfile**

For each removed direct dependency, cite the retired capability in `migration/dependencies.json`, run `pnpm remove --filter <owning-package> <dependency>`, and verify frozen installation from a clean checkout.

- [ ] **Step 5: Run the complete final gate**

Run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:profiles
pnpm test:architecture
pnpm test:frontend
node --test scripts/migration/*.test.mjs
node --test deploy/contracts/*.test.mjs
pnpm build:en
pnpm build:zh-CN
node scripts/migration/check-retirement.mjs --cutover
git diff --check
```

Expected: every command exits 0; the retirement check reports zero deferred entries, zero active legacy-layout imports, and zero assembly/overlay references in production paths.

- [ ] **Step 6: Rehearse archive restoration**

Restore the recorded `zdoc_cn` bundle into a temporary directory, verify its SHA-256, check out the recorded source commit, and reproduce one known legacy artifact using the archived runbook. Record result, duration, operator, and artifact digest in `migration/reports/archive-restoration.json`.

- [ ] **Step 7: Commit final retirement evidence**

```bash
git add -A
git commit -m "refactor: retire split repository assembly"
```

---

## Final acceptance checklist

### Design-to-plan traceability

| Design area | Implemented and verified by |
| --- | --- |
| Normal-history clean-room worktree, drift, and inventories | Tasks 1-3, 13-14 |
| Closed site profiles and non-i18n content graphs | Tasks 3-5, 9 |
| Shared application and explicit UI selection | Tasks 4-5, 8-9 |
| Manual registry and publication ownership | Tasks 2, 6-7 |
| Chinese normalizer, REST, and storage behavior | Tasks 7-9 |
| One English and one Chinese Reference tree | Task 10 |
| Atomic group publication and translation provenance | Tasks 7, 10 |
| Dependency, secret, and filesystem integrity | Tasks 2, 6, 14 |
| Deterministic build and artifact provenance | Tasks 4, 11-12 |
| Differential builds and non-mutating shadows | Tasks 5, 9, 13 |
| Four Jenkins pipelines and two existing Prod modes | Tasks 11-13 |
| Rollback, archive preservation, and split-repository retirement | Tasks 1, 13-14 |

- [ ] One `zdoc` SHA and lockfile build either site without fetching another Git repository or document content.
- [ ] `pnpm build:en` and `pnpm build:zh-CN` produce separate artifacts from the same application.
- [ ] Chinese manuals, navigation, routes, and feature graph may differ from English without Docusaurus document i18n.
- [ ] English and Chinese Reference each have exactly one committed Markdown tree.
- [ ] Missing active Chinese Reference content fails validation; no English fallback occurs.
- [ ] Generated Markdown and provenance are committed before builds.
- [ ] Every imported `zdoc_cn` unit records repository, commit, path, and blob identity.
- [ ] Four `vdc-jenkins` pipelines remain independently owned and both Prod pipelines preserve rebuild and specified-image modes.
- [ ] Specified-image releases verify corresponding UAT provenance and record immutable digests.
- [ ] Rollback can deploy a previous Prod digest independently for either site.
- [ ] No production build or workflow uses assembly, overlay copying, upstream locks, or patches.
- [ ] No migration entry is deferred and every capability is preserved, intentionally changed, or retired with evidence.
- [ ] Secret, dependency, symlink, case, Unicode, mode, line-ending, large-file, route, artifact, and shadow validations pass.
- [ ] The `zdoc_cn` archive and one legacy artifact have been restored successfully before access is reduced.
