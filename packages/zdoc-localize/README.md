# zdoc-localize

`zdoc-localize` is the deterministic engine behind the `zdoc-localization` Codex Skill. It compares the current remote English Feishu document with the English baseline last synchronized to Chinese, creates a protected document-level review, and applies approved Chinese changes through block-level Feishu writes.

## Safety model

- Remote English and Chinese Feishu documents are the content sources of truth.
- Existing Chinese documents are never updated with whole-document overwrite.
- Plans bind source/target revisions, canonical hashes, target block IDs, and block hashes.
- Any remote edit during review invalidates the plan.
- A localization receipt advances only after readback verification succeeds.
- Partial writes retain pre-write evidence and require recovery inspection.
- Title-only existing Chinese targets are initialized through the normal review and preview gates; they are never accepted as empty baselines.
- Native Feishu synced-code references are never flattened into ordinary code blocks.
- Whiteboards are mirrored as independent raw resources and verified by canonical hash.

## Development setup

```bash
pnpm install
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
```

Initialize local/offline state:

```bash
zdoc-localize init --mode local --format json
zdoc-localize doctor --offline --format json
```

Configure an existing shared Feishu Base and Drive folder with resolved tokens and table IDs:

```bash
zdoc-localize init --mode feishu \
  --registry <base-url> --registry-token <base-token> \
  --pairs-table <table-id> --glossary-table <table-id> --runs-table <table-id> \
  --state-folder <folder-url> --state-folder-token <folder-token> \
  --format json
```

The CLI does not store application secrets or access tokens. Feishu authentication remains owned by `lark-cli`.

## Typed Feishu registry

Print the exact Base table, field, Label option, and view contract before provisioning a shared registry:

```bash
zdoc-localize registry schema --format json
```

Controlled workflow values such as document mode, pair status, terminology disposition, and run state are single-select Label fields. Document locations use URL-styled text, timestamps use date-time fields, revisions use numbers, and IDs, tokens, hashes, dynamic scopes, and recovery JSON remain text. The CLI writes searchable run and receipt projections while preserving complete recovery state in `payload_json` and immutable Drive snapshots.

For a live pilot, use an explicitly approved isolated Drive root containing one registry Base, one machine-managed `state` folder, and a dedicated English/Chinese document pair. Provision and inspect all resources with the authenticated user identity before running `init` in Feishu mode.

## Core workflow

```bash
zdoc-localize pair add --pair <id> --source <english-url> --target <chinese-url> --mode mirror --format json
zdoc-localize bootstrap plan --pair <id> --format json
zdoc-localize bootstrap accept --run <run-id> --format json
zdoc-localize plan create --pair <id> --format json
zdoc-localize plan complete --run <run-id> --translations <relative-json> --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --preview --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --approval-token <preview-token> --format json
zdoc-localize manual verify --run <run-id> --format json
zdoc-localize status --run <run-id> --format json
```

The Codex Skill supplies `translations.json` from the CLI-generated translation requests. The user may edit only marked translation regions in `review.md` before approving the document-level apply.

If a pair has no Chinese target, register `--target-parent-token`. The same planning and full-document review flow creates the Chinese document directly in Feishu, verifies it, updates the pair, and records the initial receipt.

If the registered Chinese target already exists but contains only its title node, `plan create` safely initializes that exact document in `mirror` mode. Translatable blocks enter `translations.json`; ordinary code is copied verbatim; Whiteboards are mirrored without translation. Native synced-code sources produce protected placeholders because Feishu OpenAPI cannot create synced references. Apply pauses in `manual_action_required` until the user replaces those placeholders in Feishu and `manual verify` confirms the exact source document/block identities. No receipt is created before that verification.

For incremental runs, existing native synced-code references are verify-only and receive no target code writes. A changed source Whiteboard is mirrored into the existing target Whiteboard token and its new source hash is recorded in the receipt.

## Recovery

```bash
zdoc-localize recover inspect --run <run-id> --format json
zdoc-localize recover reverse --run <run-id> --preview --format json
zdoc-localize recover reverse --run <run-id> --approval-token <preview-token> --format json
zdoc-localize recover accept-current --run <run-id> --format json
zdoc-localize recover finalize --run <run-id> --format json
```

`recover inspect` compares the current remote target with the last verified partial-write state. It also validates exact manual synced-reference replacements and independently checks Whiteboard hashes. Partial or manual-action runs cannot be reversed blindly. A reverse patch is available only when that proof succeeds and requires its own exact preview token. Whiteboard reverse operations restore the durable pre-write raw snapshot and verify its canonical hash. Receipt persistence failures after verified writes can be completed idempotently with `recover finalize`.

## Version compatibility

CLI `0.1.x` is compatible with Skill `1.0.0`. Validate the checked-in pairing with:

```bash
node scripts/check-zdoc-localize-skill-compat.mjs
```

Live Feishu tests are opt-in and require dedicated test documents. Default tests never write remote documents.
