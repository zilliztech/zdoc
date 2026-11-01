# Content production recipes

Task recipes for producing source content. The runbook and section index live in [README.md](../README.md).

## Adding a new reference manual

Reference manuals (SDK/API docs such as python, java, node, go, cli, rest) are
single-sourced from `packages/docs-tooling/src/manuals/registry.ts`. Adding a
new manual is a registry change plus generated-artifact regeneration; do not
hand-edit navigation, sidebars, validation sets, or translation policy.

1. Add a definition to `packages/docs-tooling/src/manuals/registry.ts` with
   `kind: 'reference'`, the remote/local `sources`, `publications`, and a
   `presentation` block (see an existing manual such as node). The registry
   validator requires
   `presentation` for reference manuals and cross-checks sidebar,
   `documentIdPrefix`, and `landingPage` consistency.

2. Regenerate all derived artifacts and run the drift checks:

   ```bash
   pnpm generate:lark-config
   pnpm generate:reconciliation-policy
   pnpm generate:reference-presentation
   pnpm check:lark-config
   pnpm check:reconciliation-policy
   pnpm check:reference-presentation
   pnpm check:localization-input-inventory
   ```

   This updates `config/lark-docs.config.ts`,
   `config/translation/reconciliation-policy.json`,
   `config/reference-navigation.json`, the generated site-config fragments
   (`packages/site-config/src/generated/referencePresentation.ts`, sidebars
   `{en,zh-CN}/reference.ts`), and the docs-ui reference targets module
   (`packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts`).

3. Update the static deploy contract `deploy/contracts/path-filters.json`: add
   `generated/en/sidebars/<sidebar>.sidebar.js` (where `<sidebar>` is the manual's
   `presentation.sidebar`) to `canonicalEnglishReference.include` and to
   `siteOwned.en.exclude`. `check:reference-presentation` fails with a drift
   error until this is done.

4. Update the static CI input list in `.github/workflows/fetch-docs.yml`: the
   `group` input description lists valid groups, and the `prepare` job's `case`
   enumerates known groups. Add the new manual id to both (GitHub Actions
   workflow_dispatch inputs cannot be derived from the registry).

5. Update test fixtures that hard-code the group list
   (`['guides','python','java','node','go','cli','rest']`) to include the new
   manual id. These live in `scripts/docs-workflow/*.test.js`,
   `scripts/translation/*.test.js`, `scripts/*.test.js`, and
   `packages/docs-tooling/src/**/*.test.ts`; run the affected suites after
   updating them.

6. Verify: `pnpm typecheck`, `pnpm test:workflow-policy`,
   `pnpm vitest run packages/docs-tooling/src/manuals`, the docs-workflow and
   translation node:test suites, and `pnpm build:en`. For a first real fetch,
   dispatch `fetch-docs.yml` with `publish=false` and
   `run_translations=false` to validate the matrix and selection before any
   production publish.
