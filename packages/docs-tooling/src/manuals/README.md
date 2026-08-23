# Manual registry

`registry.ts` is the single source of truth for the manuals the fetch pipeline publishes (Reference manuals, Guides, SDK references). `schema.ts` types the declaration shape. Adding a manual is a tooling change: it belongs on `master`, never on `dev`.

## Adding a new manual

1. Declare the manual in `registry.ts` (sources, publications, presentation).
2. If the manual has a generated English sidebar, add `generated/en/sidebars/<manual>.sidebar.js` to the fixed restore path list in `scripts/restore-generated-state.sh` **and** to the matching `restorePaths` array in `scripts/restore-generated-state.test.js` (the test asserts the two lists are identical).

Do **not** commit the manual's content (`content/...`) or its generated sidebars (`generated/...`) to `master`. `content/` and `generated/` are `devOwnedPaths` in `deploy/contracts/master-tooling-sync.json`; `inspectSync` fails closed if master's history modifies a dev-owned path.

## First-publish bootstrap (new manual only)

The fetch pipeline derives each manual's content and its generated sidebars from the declared sources at build time, so a brand-new manual has nothing on `dev` until it is first fetched. That creates a bootstrap gap:

- `releaseInputDefinition('en')` treats the whole `generated/en/sidebars/` directory as a localization input root. A new manual's `generated/en/sidebars/<manual>.sidebar.js` is therefore a localization input.
- `write-provenance.mjs` requires every localization input to be `git ls-files`-tracked at build time, and throws `Localization input must be tracked: generated/en/sidebars/<manual>.sidebar.js` otherwise.
- The produce jobs restore generated state with `restore-generated-state.sh --exact --ref <source_ref>`. The `--exact` restore only re-tracks a sidebar that already exists on that ref, so the sidebar must already be committed on the branch used as `source_ref`.

Because `content/` and `generated/` are dev-owned, the tooling sync (`sync-master-tooling-to-dev.yml`) never carries this seed from `master` to `dev`. Before the first production fetch of a new manual, someone must manually seed the following onto `dev` (the production `source_ref`):

1. the manual's content (e.g. `content/en/reference/api/<manual>/...`),
2. `generated/en/sidebars/<manual>.sidebar.js`, and
3. a regenerated `deploy/contracts/localization-inputs.inventory.json` (run `pnpm generate:localization-input-inventory` after staging the sidebar).

The seed is a one-time, per-manual step. The current tooling has no automated "bootstrap a new manual" command; the `bootstrap` subcommand of `master-tooling-sync.js` only toggles the one-time `enabled` gate on the sync contract, and does not seed content. Until that command exists, treat the manual seed as a required operator step, not something the sync or the fetch will do for you.
