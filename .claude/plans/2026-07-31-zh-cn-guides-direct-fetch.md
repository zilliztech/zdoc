# Chinese Guides Direct Fetch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch Chinese Cloud and BYOC Guides directly from their Chinese Feishu source, publish them atomically, and retire the paid `zh-CN-tools` translation route while keeping Tools as first-level Cloud navigation.

**Architecture:** Reuse the existing Guides fetch/render/assemble workflows twice, once per site, but make every source identity, cache, and artifact site-qualified. The Chinese Guides checkpoint owns Cloud, BYOC, and Tools together; Reference Chinese localization and Japanese translation remain unchanged.

**Tech Stack:** GitHub Actions reusable workflows, TypeScript/Zod, Node.js workflow helpers and tests, pnpm/Vitest, Docusaurus site builds.

---

## File map

- Source contract: `packages/docs-tooling/src/manuals/registry.ts`, `packages/docs-tooling/src/workflows/groups.ts`.
- Site identity: the manual registry/CLI, Guides cache/stage/table helpers, and the three reusable Guides workflows.
- Orchestration: `.github/workflows/fetch-docs.yml` and its workflow-policy tests.
- Legacy removal: translation target/schema/helpers, translation workflows, provenance/path-filter contracts, and their tests.
- Validation: Chinese Guides completeness/media/navigation checks plus exact-SHA `build:zh-CN` rollout.

### Task 1: Make the Chinese Guides group the sole Tools owner

**Files:**
- Modify: `packages/docs-tooling/src/workflows/groups.ts`
- Modify: `packages/docs-tooling/src/workflows/groups.test.ts`
- Modify: `packages/docs-tooling/src/workflows/run.test.ts`
- Delete: `packages/docs-tooling/src/publication/zhCnGuidesToolsIsolation.ts`
- Delete: `packages/docs-tooling/src/publication/zhCnGuidesToolsIsolation.test.ts`
- Modify: `packages/docs-tooling/src/cli.ts`

- [ ] **Step 1: Change the ownership tests first**

Assert that `resolvePublicationGroup('zh-CN', 'guides')` owns Cloud, BYOC, both normal sidebars, and the source publication manifest without any protected Tools paths:

```ts
expect(resolvePublicationGroup('zh-CN', 'guides')).toEqual({
  site: 'zh-CN',
  manuals: ['guides', 'guides-byoc'],
  ownedPaths: [
    'content/zh-CN/guides',
    'content/zh-CN/byoc',
    'generated/zh-CN/sidebars/guides.sidebar.js',
    'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    'generated/zh-CN/sidebars/tools.sidebar.js',
  ],
  publicationManifest: 'generated/zh-CN/manifests/guides-source-publication.json',
});
expect(resolvePublicationGroupWorkflow('zh-CN', 'guides').checkpointPaths).toContain(
  'content/zh-CN/guides',
);
```

Replace isolation tests in `run.test.ts` with a publication test proving that `content/zh-CN/guides/tutorials/tools/**` is copied by the normal Guides group while unrelated Chinese Reference files remain untouched.

- [ ] **Step 2: Run the focused tests and confirm the old contract fails**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts packages/docs-tooling/src/workflows/run.test.ts packages/docs-tooling/src/publication/zhCnGuidesToolsIsolation.test.ts
```

Expected: FAIL because Tools is still protected and the isolation module still exists.

- [ ] **Step 3: Remove protected ownership and isolation**

Delete `ZH_CN_GUIDES_PROTECTED_PATHS`, `zhCnGuidesProtectedPaths`, and the `protectedPaths` branch. Keep the source manifest:

```ts
const ZH_CN_GUIDES_PUBLICATION_MANIFEST = 'generated/zh-CN/manifests/guides-source-publication.json';

function createGroup(site: SiteId, group: string): PublicationGroup {
  const manuals = groupManuals(site, group);
  return deepFreeze({
    site,
    manuals: Object.freeze([...manuals]),
    ownedPaths: Object.freeze([
      ...ownedPaths(site, manuals),
      ...(site === 'zh-CN' && group === 'guides'
        ? ['generated/zh-CN/sidebars/tools.sidebar.js']
        : []),
    ]),
    ...(site === 'zh-CN' && group === 'guides'
      ? {publicationManifest: ZH_CN_GUIDES_PUBLICATION_MANIFEST}
      : {}),
  });
}
```

Remove `isolateZhCnGuidesSourceTools` from `cli.ts` and delete its implementation/tests. The normal Chinese Cloud sidebar generator must write `tools.sidebar.js` from the `tutorials/tools` category, so the existing first-level site navigation keeps working without a translation-owned fragment. Do not alter the Chinese manual registry entries: both already select the Chinese root `XyeFwdx6kiK9A6kq3yIcLNdEnDd` and Base `I6YUb1M0JajHrqsJGcLcZNh7neP:*`.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/manuals/registry.test.ts packages/docs-tooling/src/workflows/groups.test.ts packages/docs-tooling/src/workflows/run.test.ts
```

Expected: PASS; Chinese Guides has one publication owner and Tools is part of Cloud.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-tooling/src/manuals/registry.ts packages/docs-tooling/src/workflows/groups.ts packages/docs-tooling/src/workflows/groups.test.ts packages/docs-tooling/src/workflows/run.test.ts packages/docs-tooling/src/cli.ts packages/docs-tooling/src/publication/zhCnGuidesToolsIsolation.ts packages/docs-tooling/src/publication/zhCnGuidesToolsIsolation.test.ts
git commit -m "refactor(guides): make cloud own Chinese tools"
```

### Task 2: Site-qualify Guides source, cache, and artifact identities

**Files:**
- Modify: `packages/docs-tooling/src/manuals/registry.ts`
- Modify: `packages/docs-tooling/src/manuals/registry.test.ts`
- Modify: `packages/docs-tooling/src/cli-main.ts`
- Modify: `packages/docs-tooling/src/cli-main.integration.test.ts`
- Modify: `scripts/docs-workflow/guides-source-cache.js`
- Modify: `scripts/docs-workflow/guides-source-cache.test.js`
- Modify: `scripts/docs-workflow/guides-source-cache-generation.js`
- Modify: `scripts/docs-workflow/guides-source-cache-generation.test.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.test.js`
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_render-guides-table.yml`
- Modify: `.github/workflows/_assemble-guides.yml`

- [ ] **Step 1: Add failing identity tests**

Test an explicit resolver and reject cross-site restoration:

```js
expect(resolveGuidesSourceConfig('zh-CN')).toEqual({
  site: 'zh-CN',
  rootToken: 'XyeFwdx6kiK9A6kq3yIcLNdEnDd',
  sourceDir: 'packages/docs-tooling/src/lark/meta/sources/guides-zh-CN',
  snapshotPath: 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
  mediaManifestPath: 'packages/docs-tooling/src/lark/meta/media-cache/guides-zh-CN.json',
});
assert.notEqual(sourceCacheKey(enSnapshot, {site: 'en'}), sourceCacheKey(zhSnapshot, {site: 'zh-CN'}));
await assert.rejects(
  restoreGuidesStageArtifact({artifact: chineseArtifact, expectedSite: 'en'}),
  /site identity mismatch/i,
);
```

Also assert artifact names contain the site:

```js
assert.match(fetchWorkflow, /guides-sources-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/);
assert.match(renderWorkflow, /guides-table-\$\{\{ inputs\.site \}\}-/);
assert.match(assembleWorkflow, /docs-checkpoint-guides-\$\{\{ inputs\.site \}\}-/);
```

- [ ] **Step 2: Run the identity tests and confirm failure**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/manuals/registry.test.ts packages/docs-tooling/src/cli-main.integration.test.ts
node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.test.js scripts/docs-workflow/guides-stage-artifact.test.js
```

Expected: FAIL because cache keys/manifests and stage artifacts do not yet bind the site.

- [ ] **Step 3: Implement the source resolver and bind identities**

Implement the resolver from the manual registry:

```js
export function resolveGuidesSourceConfig(site: SiteId) {
  if (!['en', 'zh-CN'].includes(site)) throw new Error(`Unsupported Guides site: ${site}`);
  const {source} = resolveManualPublication('guides', site);
  return Object.freeze({
    site,
    rootToken: source.root,
    sourceDir: source.sourceDir,
    snapshotPath: source.snapshotPath,
    mediaManifestPath: `${larkSourceRoot}/../media-cache/guides-${site}.json`,
  });
}
```

Add `site` to cache keys and persisted manifests:

```js
return `guides-source-${site}-v${version}-${hashSnapshot(readSnapshot(snapshotPath))}`;
```

Require `manifest.site === expectedSite` in source-cache, generation, stage, and table artifact validation. Keep per-file SHA-256 validation unchanged.

- [ ] **Step 4: Wire reusable workflows to the resolved site config**

In `_fetch-guides-sources.yml`, resolve the config once and expose shell outputs:

```yaml
- id: source_config
  name: Resolve site-owned Guides source
  run: pnpm docs-tooling guides-source-config --site "${{ inputs.site }}" --github-output "$GITHUB_OUTPUT"
```

Replace hard-coded source directory, snapshot, media manifest, and root token arguments with `steps.source_config.outputs.*`. Change artifact identities to:

```yaml
artifact_name: guides-sources-${{ inputs.site }}-${{ github.run_id }}
name: guides-table-${{ inputs.site }}-${{ inputs.target_name }}-${{ inputs.table_slug }}-${{ github.run_id }}
artifact_name: docs-checkpoint-guides-${{ inputs.site }}-${{ github.run_id }}
```

Pass `--site "${{ inputs.site }}"` to every cache/stage create or validation command, and download only `guides-table-${{ inputs.site }}-*-${{ github.run_id }}` during assembly.

- [ ] **Step 5: Run focused workflow/helper tests**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/manuals/registry.test.ts packages/docs-tooling/src/cli-main.integration.test.ts
node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/guides-table-artifact.test.js scripts/docs-workflow/restore-guides-table-artifacts.test.js
pnpm test:workflow-policy
```

Expected: PASS, including explicit EN-to-zh-CN and zh-CN-to-EN restore rejection.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-tooling/src/manuals/registry.ts packages/docs-tooling/src/manuals/registry.test.ts packages/docs-tooling/src/cli-main.ts packages/docs-tooling/src/cli-main.integration.test.ts scripts/docs-workflow/guides-source-cache.js scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-source-cache-generation.js scripts/docs-workflow/guides-source-cache-generation.test.js scripts/docs-workflow/guides-stage-artifact.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/guides-table-artifact.js scripts/docs-workflow/guides-table-artifact.test.js scripts/docs-workflow/restore-guides-table-artifacts.js scripts/docs-workflow/restore-guides-table-artifacts.test.js .github/workflows/_fetch-guides-sources.yml .github/workflows/_render-guides-table.yml .github/workflows/_assemble-guides.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(guides): isolate source artifacts by site"
```

### Task 3: Add the Chinese Guides lane and atomic publisher

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/docs-workflow/content-groups.test.js`

- [ ] **Step 1: Add failing orchestration policy tests**

Require two complete lanes and publication ordering:

```js
for (const site of ['en', 'zh-CN']) {
  assert.equal(workflow.jobs[`produce_${site === 'en' ? 'en' : 'zh'}_guides_sources`].with.site, site);
  assert.equal(workflow.jobs[`produce_${site === 'en' ? 'en' : 'zh'}_guides`].with.site, site);
}
assert.deepEqual(workflow.jobs.publish_zh_guides.needs, ['prepare', 'produce_zh_guides', 'publish_guides']);
assert.equal(workflow.jobs.publish_zh_guides.with.group, 'guides');
assert.match(workflow.jobs.publish_zh_guides.with.validate_command, /build:zh-CN/);
```

The Chinese publisher must depend on the English publisher so both commits use the existing serialized/retry-safe checkpoint publisher rather than racing on the shared target branch.

- [ ] **Step 2: Run the policy test and confirm failure**

Run:

```bash
pnpm test:workflow-policy
```

Expected: FAIL because only the English lane exists.

- [ ] **Step 3: Duplicate the Guides producer lane with explicit site names**

Rename the existing jobs to `produce_en_guides_sources`, `render_en_guides_tables`, and `produce_en_guides`. Add matching Chinese jobs using the same reusable workflows with `site: zh-CN`. Keep render matrices independent and pass each source job's own artifact name, table matrix, cache version, and decision hash.

Publish the two atomic checkpoints in order:

```yaml
publish_guides:
  needs: [prepare, produce_en_guides, publish_python]
  uses: ./.github/workflows/_publish-content-group.yml
  with:
    group: guides
    artifact_name: ${{ needs.produce_en_guides.outputs.artifact_name || 'unavailable' }}
    commit_message: 'docs(guides): publish fetched English content'
    validate_command: 'node "$GITHUB_WORKSPACE/scripts/validate-generated-sidebars.js"'

publish_zh_guides:
  needs: [prepare, produce_zh_guides, publish_guides]
  uses: ./.github/workflows/_publish-content-group.yml
  with:
    group: guides
    artifact_name: ${{ needs.produce_zh_guides.outputs.artifact_name || 'unavailable' }}
    commit_message: 'docs(guides): publish fetched Chinese content'
    validate_command: 'node "$GITHUB_WORKSPACE/scripts/validate-generated-sidebars.js" && pnpm run build:zh-CN'
```

Keep Japanese Guides translation sourced from `publish_guides.outputs.commit_sha`. Make final verification and progress reporting depend on and report both publishers.

- [ ] **Step 4: Run orchestration tests**

Run:

```bash
pnpm test:workflow-policy
node --test scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/docs-workflow/checkpoint-contention.test.js
```

Expected: PASS; both sites produce one Cloud+BYOC checkpoint and publication remains serialized.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/content-groups.test.js
git commit -m "feat(workflow): fetch and publish Chinese guides"
```

### Task 4: Remove every executable `zh-CN-tools` translation route

**Files:**
- Modify: `packages/docs-tooling/src/translation/schema.ts`
- Modify: `packages/docs-tooling/src/translation/targets.ts`
- Modify: translation target/helper tests under `packages/docs-tooling/src/translation/` and `scripts/translation/`
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/translate-content.yml`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `.github/workflows/_translate-selected-group.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/_verify-docs.yml`
- Modify: `.github/workflows/site-validation.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`
- Modify: `deploy/contracts/path-filters.json`
- Modify: `deploy/contracts/localization-inputs.inventory.json`
- Modify: `deploy/contracts/evaluate-path-filters.test.mjs`

- [ ] **Step 1: Invert the policy test before deleting code**

Replace tests that require Tools translation with a repository-wide executable-route ban:

```js
const forbidden = [
  ['translate-codex.yml', /zh-CN-tools/],
  ['fetch-docs.yml', /translate_guides_zh_tools|detect_guides_tools_translation|target:\s*zh-CN-tools/],
  ['site-validation.yml', /validate-translation --target zh-CN-tools/],
  ['_verify-docs.yml', /validate-translation --target zh-CN-tools/],
];
for (const [file, pattern] of forbidden) {
  assert.doesNotMatch(fs.readFileSync(path.join(workflowDirectory, file), 'utf8'), pattern);
}
assert.deepEqual(translationTargets.map(target => target.id), ['ja-JP', 'zh-CN-reference']);
```

Keep `generated/zh-CN/sidebars/tools.sidebar.js` as a generated Cloud Guides compatibility output because the current site navigation imports it; remove `tools-translations.json` from active localization inventories and path filters.

- [ ] **Step 2: Run translation and policy tests and confirm failure**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/translation/targets.test.ts
pnpm test:translation
pnpm test:workflow-policy
node --test deploy/contracts/site-validation-workflow.test.mjs deploy/contracts/evaluate-path-filters.test.mjs
```

Expected: FAIL while the legacy target and jobs remain reachable.

- [ ] **Step 3: Remove the target from production code**

Reduce the target ID schema to the two supported products, then delete the complete `zh-CN-tools` object from `TARGETS` without changing the existing `ja-JP` and `zh-CN-reference` objects:

```ts
export const TranslationTargetIdSchema = z.enum(['ja-JP', 'zh-CN-reference']);
```

Delete `zh-CN-tools` branches from candidate selection, source deltas, manifests, bootstrap/recovery, agent-runner sidebar pseudo-path handling, validation routing, provenance, and workflow target allowlists. Delete tests/fixtures that only exercise the retired product; update shared tests to assert that resolving it returns `Unknown translation target`.

- [ ] **Step 4: Remove workflow jobs and active contracts**

Remove `detect_guides_tools_translation` and `translate_guides_zh_tools` from `fetch-docs.yml` and all `needs` lists. Remove `zh-CN-tools` from manual dispatch choices and compatibility workflow cases. Replace the old site validation commands with source-owned checks:

```yaml
- name: Validate Chinese Guides and Tools navigation
  run: |
    pnpm docs-tooling validate-group --site zh-CN --group guides
    node scripts/validate-generated-sidebars.js
    pnpm run build:zh-CN
```

Remove `generated/zh-CN/manifests/tools-translations.json` from active localization inventories and filters. Preserve historical files only where a retirement/migration fixture explicitly needs them; they must not be read by a production workflow.

- [ ] **Step 5: Run the removal test suite**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/translation packages/docs-tooling/src/workflows
pnpm test:translation
pnpm test:workflow-policy
node --test deploy/contracts/site-validation-workflow.test.mjs deploy/contracts/evaluate-path-filters.test.mjs scripts/build/write-provenance.test.mjs
rg -n "zh-CN-tools|translate_guides_zh_tools|detect_guides_tools_translation" .github/workflows packages/docs-tooling/src scripts deploy/contracts
```

Expected: tests PASS; `rg` returns only deliberate historical/retirement fixtures or no matches, with no executable workflow route.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-tooling/src/translation scripts/translation scripts/build/write-provenance.mjs scripts/build/write-provenance.test.mjs .github/workflows deploy/contracts scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "refactor(translation): retire Chinese tools target"
```

### Task 5: Validate Chinese completeness, Tools navigation, and rollout

**Files:**
- Modify: `scripts/validate-guides-coverage.js`
- Modify: `scripts/validate-guides-coverage.test.js`
- Modify: `scripts/validate-guides-source-contract.js`
- Modify: `scripts/validate-guides-source-contract.test.js`
- Modify: `scripts/docs-workflow/generate-guides-sidebars.js`
- Modify: `scripts/docs-workflow/generate-guides-sidebars.test.js`
- Modify: `packages/site-config/src/sidebars/zh-CN/guides.test.ts`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add Chinese Cloud/BYOC/Tools assertions**

Add a `--site` mapping, generate the Tools fragment from the Chinese Cloud sidebar, and test both publication units:

```js
const targets = {
  'zh-CN': [
    {outputDir: 'content/zh-CN/guides/tutorials', sidebarPath: 'generated/zh-CN/sidebars/guides.sidebar.js'},
    {outputDir: 'content/zh-CN/byoc/tutorials', sidebarPath: 'generated/zh-CN/sidebars/guides-byoc.sidebar.js'},
  ],
};
assert.ok(files.some(file => file.startsWith('content/zh-CN/guides/tutorials/tools/')));
assert.ok(JSON.stringify(guidesSidebar).includes('tutorials/tools'));
assert.deepEqual(toolsSidebar, extractSidebarCategory(guidesSidebar, 'category:tutorials/tools'));
```

Implement and export `extractSidebarCategory(sidebar, key)` in `generate-guides-sidebars.js`; it recursively returns exactly one matching category and throws when the category is missing or duplicated. Write that extracted category to the group-owned `generated/zh-CN/sidebars/tools.sidebar.js`, preserving the current `packages/site-config/src/sidebars/zh-CN/guides.ts` first-level insertion behavior.

Test missing Chinese BYOC, missing Tools content, unreachable Tools navigation, duplicate sidebar production, incomplete source snapshot, and missing media as separate failures.

- [ ] **Step 2: Run tests and confirm missing validation fails**

Run:

```bash
node --test scripts/validate-guides-coverage.test.js scripts/validate-guides-source-contract.test.js scripts/docs-workflow/generate-guides-sidebars.test.js
pnpm vitest run packages/site-config/src/sidebars/zh-CN/guides.test.ts
```

Expected: FAIL until validation supports the Chinese site contract.

- [ ] **Step 3: Implement and wire the checks**

Make coverage/site selection explicit and invoke it in Chinese assembly before checkpoint creation:

```yaml
- name: Validate Chinese Guides publication
  if: ${{ inputs.site == 'zh-CN' }}
  run: |
    node scripts/validate-guides-source-contract.js --site zh-CN
    node scripts/validate-guides-coverage.js --site zh-CN
    node scripts/validate-generated-sidebars.js
```

Reuse the existing source-completeness and media-manifest validators; do not create a second validation implementation.

- [ ] **Step 4: Run local regression checks**

Run:

```bash
node --test scripts/validate-guides-coverage.test.js scripts/validate-guides-source-contract.test.js scripts/docs-workflow/generate-guides-sidebars.test.js scripts/docs-workflow/guides-media-prefetch.test.js
pnpm vitest run packages/site-config/src/sidebars/zh-CN/guides.test.ts
pnpm vitest run packages/docs-tooling/src/manuals packages/docs-tooling/src/workflows packages/docs-tooling/src/translation
pnpm test:workflow-policy
pnpm test:retirement
pnpm run build:zh-CN
```

Expected: all PASS. `zdoc_cn` is intentionally unchanged; its compatibility risk is limited to consuming the same published Chinese paths, which the exact Chinese build verifies upstream.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-guides-coverage.js scripts/validate-guides-coverage.test.js scripts/validate-guides-source-contract.js scripts/validate-guides-source-contract.test.js scripts/docs-workflow/generate-guides-sidebars.js scripts/docs-workflow/generate-guides-sidebars.test.js packages/site-config/src/sidebars/zh-CN/guides.test.ts .github/workflows/_assemble-guides.yml scripts/validate-workflow-policy.test.js
git commit -m "test(guides): enforce Chinese publication completeness"
```

- [ ] **Step 6: Run artifact-only GitHub validation**

Push the implementation branch, resolve its exact SHA, and dispatch without publication:

```bash
git push -u origin codex/zh-cn-guides-direct-fetch
tooling_sha=$(git rev-parse HEAD)
gh workflow run fetch-docs.yml --ref codex/zh-cn-guides-direct-fetch -f group=guides -f publish=false -f run_translations=false -f tooling_ref="$tooling_sha" -f source_ref=dev -f target_branch=dev
gh run list --workflow fetch-docs.yml --branch codex/zh-cn-guides-direct-fetch --limit 1
```

Expected: both EN and zh-CN Guides checkpoints succeed; no translation job runs.

- [ ] **Step 7: Publish to a temporary branch and validate the exact candidate SHA**

```bash
git push origin dev:refs/heads/release/zh-cn-guides-direct-fetch-20260731
gh workflow run fetch-docs.yml --ref codex/zh-cn-guides-direct-fetch -f group=guides -f publish=true -f run_translations=false -f tooling_ref="$tooling_sha" -f source_ref=dev -f target_branch=release/zh-cn-guides-direct-fetch-20260731
gh run list --workflow fetch-docs.yml --branch codex/zh-cn-guides-direct-fetch --limit 1
git fetch origin release/zh-cn-guides-direct-fetch-20260731
candidate_sha=$(git rev-parse origin/release/zh-cn-guides-direct-fetch-20260731)
gh workflow run site-validation.yml --ref master -f source_ref="$candidate_sha" -f site=zh-CN
```

Expected: Chinese Cloud, BYOC, media, Tools navigation, single-producer policy, `build:zh-CN`, and Check-404 validations pass from the exact candidate SHA. Only after that result should the same `tooling_sha` flow publish to `dev`.
