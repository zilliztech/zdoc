# zdoc-localize

`zdoc-localize` is the deterministic engine behind the `zdoc-localization` Codex Skill. It compares the current remote English Feishu document with the English baseline last synchronized to Chinese, creates a protected document-level review, and applies approved Chinese changes through block-level Feishu writes.

## Safety model

- Remote English and Chinese Feishu documents are the content sources of truth.
- Existing Chinese documents are never updated with whole-document overwrite.
- Plans bind source/target revisions, canonical hashes, target block IDs, and block hashes.
- Any remote edit during review invalidates the plan.
- A localization receipt advances only after readback verification succeeds.
- Partial writes retain pre-write evidence and require recovery inspection.

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

## Core workflow

```bash
zdoc-localize pair add --pair <id> --source <english-url> --target <chinese-url> --mode mirror --format json
zdoc-localize bootstrap plan --pair <id> --format json
zdoc-localize bootstrap accept --run <run-id> --format json
zdoc-localize plan create --pair <id> --format json
zdoc-localize plan complete --run <run-id> --translations <relative-json> --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --preview --format json
zdoc-localize apply --run <run-id> --review <relative-review-md> --approval-token <preview-token> --format json
zdoc-localize status --run <run-id> --format json
```

The Codex Skill supplies `translations.json` from the CLI-generated translation requests. The user may edit only marked translation regions in `review.md` before approving the document-level apply.

If a pair has no Chinese target, register `--target-parent-token`. The same planning and full-document review flow creates the Chinese document directly in Feishu, verifies it, updates the pair, and records the initial receipt.

## Recovery

```bash
zdoc-localize recover inspect --run <run-id> --format json
zdoc-localize recover reverse --run <run-id> --preview --format json
zdoc-localize recover reverse --run <run-id> --approval-token <preview-token> --format json
zdoc-localize recover accept-current --run <run-id> --format json
zdoc-localize recover finalize --run <run-id> --format json
```

`recover inspect` compares the current remote target with the last verified partial-write state. Partial runs cannot be replanned blindly. A reverse patch is available only when that proof succeeds and requires its own exact preview token. Receipt persistence failures after verified writes can be completed idempotently with `recover finalize`.

## Version compatibility

CLI `0.1.x` is compatible with Skill `1.0.0`. Validate the checked-in pairing with:

```bash
node scripts/check-zdoc-localize-skill-compat.mjs
```

Live Feishu tests are opt-in and require dedicated test documents. Default tests never write remote documents.
