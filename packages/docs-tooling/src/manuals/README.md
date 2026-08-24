# Manual registry

`registry.ts` is the single source of truth for the manuals the fetch pipeline publishes (Reference manuals, Guides, SDK references). `schema.ts` types the declaration shape. Adding a manual is a tooling change: it belongs on `master`, never on `dev`.

## Ownership map — the one thing that fails closed

The sync (`sync-master-tooling-to-dev.yml`) enforces ownership through `deploy/contracts/master-tooling-sync.json`. Put a file on the wrong branch and `inspectSync` fails closed. Three buckets decide where every file must land:

| Ownership | Paths | Produced by | Branch |
|---|---|---|---|
| master-authoritative | `packages/**`, `scripts/**`, `deploy/contracts/**`, `.github/**`, `config/**` | hand-written / `generate:*` | `master` |
| master-authoritative (landing pages) | the `preservedFiles` paths (e.g. `content/en/reference/api/<manual>/<manual>.md`) | hand-written | **`master`** |
| dev-owned | `content/**` (except landing pages), `generated/**`, `i18n/**`, `sidebar-overrides/en/**` | `fetch-docs.yml` | `dev` |
| candidate-derived | `deploy/contracts/localization-inputs.inventory.json` | generated on the merge candidate | both |

### The landing-page exception (the most common trap)

`preservedFiles` (typically the manual's landing page) live *under* the dev-owned `content/` root but are actually master-authored: the fetch restores them from `MASTER_SHA`. For master to touch them legally, each preserved path **must** be declared in `masterAuthoritativePaths` in `deploy/contracts/master-tooling-sync.json`. `isDevOwned()` checks `masterAuthoritativePaths` first, so a declared landing page is treated as master-owned.

When a manual declares `preservedFiles`, do **both**:

1. commit the landing page file(s) to `master`, and
2. add each preserved path to `masterAuthoritativePaths`.

If you skip (2), master's landing-page edit is rejected as "modifies dev-owned paths". If you skip (1) or delete the file from `master`, the fetch prepare step fails with `preserved path ... must be tracked on the tooling branch`.

Do **not** commit any *other* `content/...` (the fetched API pages) or any `generated/...` to `master` — those are dev-owned. Do **not** commit `sidebar-overrides/en/<manual>.json` to `master` — `sidebar-overrides/en/` is dev-owned; the override is produced by the fetch.

## Adding a new manual — full sequence

The sequence matters: tooling on master → fetch produces dev state → sync carries tooling to dev. Run it in this order.

1. **Declare** the manual in `registry.ts` (sources, publications, presentation).
2. **Regenerate derived tooling** and commit to `master`:
   - `pnpm generate:reference-presentation` — writes `packages/site-config/src/sidebars/{en,zh-CN}/reference.ts` (how the manual's `<manual>Sidebar` key gets registered) and `packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts`.
   - `pnpm generate:reconciliation-policy` — writes `config/translation/reconciliation-policy.json`.
   - `pnpm generate:lark-config` — writes `config/lark-docs.config.ts`.
   - `pnpm generate:localization-input-inventory` — writes `deploy/contracts/localization-inputs.inventory.json`.
3. **Landing page** (if `preservedFiles`): commit the file to `master` **and** add its path to `masterAuthoritativePaths`.
4. **Static contracts** (all on `master`):
   - If the manual has a generated English sidebar, add `generated/en/sidebars/<manual>.sidebar.js` to the fixed restore path list in `scripts/restore-generated-state.sh` **and** to the matching `restorePaths` array in `scripts/restore-generated-state.test.js` (the test asserts the two lists are identical).
   - Add the manual to `deploy/contracts/path-filters.json`.
   - Add the manual to the translation `GROUPS` in `scripts/translation/selection.js`.
   - Add the manual to the dispatch lists in `.github/workflows/fetch-docs.yml`.
5. **Seed `dev`** (one-time, see below).
6. **Fetch** (publish) so `dev` gains the generated state.
7. **Sync** (or let the master push trigger it) so the master tooling — including `reference.ts` — lands on `dev`.

### Ordering: fetch before sync

A brand-new manual has nothing on `dev` until it is first fetched. The sync's focused validation runs `validate-revision-inventory --site en` and a site build, both of which need files the fetch produces (`generated/en/manifests/lark-revisions/<manual>.json`, `generated/en/manifests/reference.json`, `generated/en/sidebars/<manual>.sidebar.js`). So run the **fetch first**, then the **sync**. Reversed, the sync fails because those generated files don't exist yet.

## First-publish bootstrap (new manual only)

The fetch pipeline derives each manual's content and its generated sidebars from the declared sources at build time, so a brand-new manual has nothing on `dev` until it is first fetched. That creates a bootstrap gap:

- `releaseInputDefinition('en')` treats the whole `generated/en/sidebars/` directory as a localization input root. A new manual's `generated/en/sidebars/<manual>.sidebar.js` is therefore a localization input.
- `write-provenance.mjs` requires every localization input to be `git ls-files`-tracked at build time, and throws `Localization input must be tracked: generated/en/sidebars/<manual>.sidebar.js` otherwise.
- The produce jobs restore generated state with `restore-generated-state.sh --exact --ref <source_ref>`. The `--exact` restore only re-tracks a sidebar that already exists on that ref, so the sidebar must already be committed on the branch used as `source_ref`.

Because `content/` and `generated/` are dev-owned, the tooling sync never carries this seed from `master` to `dev`. Before the first production fetch of a new manual, someone must manually seed the following onto `dev` (the production `source_ref`):

1. the manual's content (e.g. `content/en/reference/api/<manual>/...`),
2. `generated/en/sidebars/<manual>.sidebar.js`, and
3. a regenerated `deploy/contracts/localization-inputs.inventory.json` (run `pnpm generate:localization-input-inventory` after staging the sidebar).

The seed is a one-time, per-manual step. The current tooling has no automated "bootstrap a new manual" command; the `bootstrap` subcommand of `master-tooling-sync.js` only toggles the one-time `enabled` gate on the sync contract, and does not seed content. Until that command exists, treat the manual seed as a required operator step, not something the sync or the fetch will do for you.

## Pitfalls — each maps to a failure we hit

Pitfalls 1–3 are now caught at PR time by the two master gates described below; the post-merge failures they cite are the fallback.

1. **Landing page deleted from `master`, or never committed** → fetch prepare fails: `preserved path ... must be tracked on the tooling branch`. The landing page is master-owned; keep it on `master` and listed in `masterAuthoritativePaths`.
2. **Landing page not in `masterAuthoritativePaths`** → `inspectSync` fails: `modifies dev-owned paths: content/en/.../<manual>.md`. The page is under `content/`; without the declaration it is dev-owned and master may not touch it.
3. **`sidebar-overrides/en/<manual>.json` committed to `master`** → `inspectSync` fails: `modifies dev-owned paths: sidebar-overrides/en/...`. That override is dev-owned; let the fetch produce it.
4. **Sync runs before the fetch** → `validate-revision-inventory --site en` fails: `Revision inventory path is missing: generated/en/manifests/lark-revisions/<manual>.json`. `REVISION_GROUPS` is derived from `registry.ts`, so the new manual is expected immediately. Fetch first (or seed a clean-room inventory).
5. **Stale `reference.json` sourceCommit** → `Reference source commit tree path set does not match the declared snapshot`. A real fetch's reconcile step regenerates it.
6. **`reference.ts` missing the `<manual>Sidebar` key on `dev`** → site build fails: `wants to display sidebar <manual>Sidebar but a sidebar with this name doesn't exist`. `reference.ts` is a master tooling file; it is fixed by `generate:reference-presentation` on `master` **and** the sync carrying it to `dev`.

## What CI validates, and where

Content validation runs where the content is authoritative — never on `master`. `master`'s own tree keeps dev-owned leftovers (partial `content/`, stale `generated/en/manifests/reference.json`), so its site build and `validate-reference` would fail on artifacts the sync will soon overwrite. The tree that must build is the sync candidate: `dev` content merged with `master` tooling.

| Tree | Trigger | Validates |
|---|---|---|
| `master` push, PR into `master` | `site-validation.yml` | tooling-only: the four `check:*` drift checks + the two gates below |
| sync candidate (`dev` content + `master` tooling) | sync `workflow_dispatch` | full `validate-reference` + site build |
| `dev` push (after sync merges) | `site-validation.yml` | full `validate-reference` + site build |

Two lightweight gates run on every PR into `master` (and push to `master`) and fail closed, catching pitfalls 1–3 **before** merge instead of after:

- **Ownership gate** (`scripts/docs-workflow/ownership-gate.js`) diffs `base..head` and fails on any changed path that `isDevOwned()` considers dev-owned (`content/**`, `generated/**`, `sidebar-overrides/en/**`) — except the landing pages declared in `masterAuthoritativePaths`. This rejects an undeclared landing page (pitfall 2) and a committed `sidebar-overrides/en/<manual>.json` (pitfall 3).
- **Preserved-files gate** (`scripts/docs-workflow/preserved-files-gate.js`) enumerates every *English* publication's `preservedFiles` and fails unless each is (a) listed in `masterAuthoritativePaths` and (b) tracked on `master`. This rejects a landing page that is declared but never committed (pitfall 1), and a preserved file missing its `masterAuthoritativePaths` entry (pitfall 2).
