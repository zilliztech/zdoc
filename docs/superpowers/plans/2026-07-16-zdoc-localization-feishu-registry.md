# ZDoc Localization Feishu Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a typed Feishu Base registry contract to `zdoc-localize`, provision an isolated live Feishu test environment, and verify a complete English-to-Chinese localization run.

**Architecture:** A small schema module defines the Base tables, field types, Label options, and operational views. A separate cell codec adapts domain strings, URLs, timestamps, and glossary lists to Feishu Base values, while `LarkBaseRegistry` projects searchable fields alongside authoritative compact JSON. Provisioning uses `lark-cli` under the approved Drive folder; the existing CLI and Skill then run the live pilot.

**Tech Stack:** TypeScript 5.6, Vitest, Commander, Node.js 20+, `lark-cli`, Feishu Base/Drive/Docx, pnpm.

---

## File Map

- Create `packages/zdoc-localize/src/adapters/lark-base-schema.ts`: typed Base table, field, option, and view definitions.
- Create `packages/zdoc-localize/src/adapters/lark-base-cells.ts`: Feishu cell serialization and tolerant parsing helpers.
- Modify `packages/zdoc-localize/src/adapters/lark-base-registry.ts`: use typed cell helpers and project run/receipt fields.
- Modify `packages/zdoc-localize/src/cli/program.ts`: expose the exact registry schema through `registry schema`.
- Create `packages/zdoc-localize/test/lark-base-schema.test.ts`: schema and Label option contract tests.
- Create `packages/zdoc-localize/test/lark-base-cells.test.ts`: URL, select, date, and glossary codec tests.
- Modify `packages/zdoc-localize/test/adapters.test.ts`: adapter projections and compatibility tests.
- Modify `packages/zdoc-localize/test/cli-contract.test.ts`: `registry schema` CLI contract.
- Modify `packages/zdoc-localize/README.md`: typed Base setup and live-pilot instructions.
- Modify `skills/zdoc-localization/SKILL.md`: registry-schema preflight and live-pilot safeguards.
- Create `.zdoc-localize/validation/live-feishu-report.json`: final live validation evidence; keep this runtime artifact uncommitted.

### Task 1: Define the typed Base schema contract

**Files:**
- Create: `packages/zdoc-localize/src/adapters/lark-base-schema.ts`
- Create: `packages/zdoc-localize/test/lark-base-schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import {describe, expect, it} from 'vitest';
import {feishuRegistrySchema} from '../src/adapters/lark-base-schema.js';

describe('Feishu registry schema', () => {
  it('uses filterable labels for controlled workflow values', () => {
    const pairs = feishuRegistrySchema.tables.documentPairs.fields;
    const runs = feishuRegistrySchema.tables.localizationRuns.fields;
    expect(pairs.find((field) => field.name === 'status')).toMatchObject({type: 'select', multiple: false});
    expect(pairs.find((field) => field.name === 'mode')).toMatchObject({type: 'select', multiple: false});
    expect(runs.find((field) => field.name === 'state')).toMatchObject({
      type: 'select',
      options: expect.arrayContaining([expect.objectContaining({name: 'review_required'}), expect.objectContaining({name: 'partial'})]),
    });
  });

  it('keeps machine payloads and dynamic scopes out of fixed labels', () => {
    const pairs = feishuRegistrySchema.tables.documentPairs.fields;
    const runs = feishuRegistrySchema.tables.localizationRuns.fields;
    expect(pairs.find((field) => field.name === 'version_scope')).toMatchObject({type: 'text'});
    expect(runs.find((field) => field.name === 'payload_json')).toMatchObject({type: 'text'});
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `pnpm --filter zdoc-localize test -- lark-base-schema.test.ts`

Expected: FAIL because `lark-base-schema.ts` does not exist.

- [ ] **Step 3: Implement the schema module**

Define exported `BaseFieldSpec`, `BaseViewSpec`, and `feishuRegistrySchema`. The first field in each table is the primary field. Use these exact types and options:

```ts
export interface BaseOptionSpec {
  name: string;
  hue?: 'Red' | 'Orange' | 'Yellow' | 'Lime' | 'Green' | 'Turquoise' | 'Wathet' | 'Blue' | 'Carmine' | 'Purple' | 'Gray';
  lightness?: 'Lighter' | 'Light' | 'Standard' | 'Dark' | 'Darker';
}

export interface BaseFieldSpec {
  name: string;
  type: 'text' | 'number' | 'select' | 'datetime' | 'user';
  multiple?: boolean;
  options?: BaseOptionSpec[];
  style?: Record<string, unknown>;
}

export interface BaseViewSpec {
  name: string;
  type: 'grid';
  filter: {logic: 'and'; conditions: Array<[string, '==' | 'intersects', string | string[]]>};
}

const options = (...names: string[]): BaseOptionSpec[] =>
  names.map((name) => ({name, hue: 'Blue', lightness: 'Lighter'}));

const runStates = [
  'scanning', 'classification_required', 'translation_required', 'review_required',
  'stale', 'applying', 'verifying', 'completed', 'blocked', 'partial', 'recovering',
] as const;

const integerStyle = {
  type: 'plain', precision: 0, percentage: false, thousands_separator: false,
} as const;

export const feishuRegistrySchema = {
  baseName: 'ZDoc Localization Registry',
  timeZone: 'Asia/Shanghai',
  tables: {
    documentPairs: {
      name: 'document_pairs',
      fields: [
        {name: 'pair_id', type: 'text'},
        {name: 'source_locale', type: 'select', multiple: false, options: options('en')},
        {name: 'target_locale', type: 'select', multiple: false, options: options('zh-CN')},
        {name: 'mode', type: 'select', multiple: false, options: options('mirror', 'selective', 'independent', 'excluded')},
        {name: 'status', type: 'select', multiple: false, options: options('active', 'needs_bootstrap', 'blocked', 'disabled')},
        {name: 'source_doc_url', type: 'text', style: {type: 'url'}},
        {name: 'source_doc_token', type: 'text'},
        {name: 'target_doc_url', type: 'text', style: {type: 'url'}},
        {name: 'target_doc_token', type: 'text'},
        {name: 'target_parent_url', type: 'text', style: {type: 'url'}},
        {name: 'target_parent_token', type: 'text'},
        {name: 'product_scope', type: 'text'},
        {name: 'version_scope', type: 'text'},
        {name: 'environment_scope', type: 'text'},
      ],
    },
    glossary: {
      name: 'glossary',
      fields: [
        {name: 'source_term', type: 'text'},
        {name: 'term_id', type: 'text'},
        {name: 'target_term', type: 'text'},
        {name: 'disposition', type: 'select', multiple: false, options: options('translate', 'keep_as_is', 'deprecated')},
        {name: 'scope_type', type: 'select', multiple: false, options: options('global', 'product', 'environment', 'version', 'document')},
        {name: 'scope_value', type: 'text'},
        {name: 'status', type: 'select', multiple: false, options: options('candidate', 'approved', 'deprecated')},
        {name: 'prohibited_variants', type: 'text'},
        {name: 'notes', type: 'text'},
        {name: 'approved_by', type: 'user', multiple: false},
        {name: 'updated_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
      ],
    },
    localizationRuns: {
      name: 'localization_runs',
      fields: [
        {name: 'run_id', type: 'text'},
        {name: 'record_type', type: 'select', multiple: false, options: options('run', 'receipt')},
        {name: 'pair_id', type: 'text'},
        {name: 'state', type: 'select', multiple: false, options: options(...runStates)},
        {name: 'created_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
        {name: 'updated_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
        {name: 'completed_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
        {name: 'source_from_revision', type: 'number', style: integerStyle},
        {name: 'source_to_revision', type: 'number', style: integerStyle},
        {name: 'target_plan_revision', type: 'number', style: integerStyle},
        {name: 'target_verified_revision', type: 'number', style: integerStyle},
        {name: 'source_hash', type: 'text'},
        {name: 'target_hash', type: 'text'},
        {name: 'source_snapshot_token', type: 'text'},
        {name: 'error_type', type: 'text'},
        {name: 'payload_json', type: 'text'},
      ],
    },
  },
} as const;
```

Include the approved view definitions as data:

```ts
views: {
  documentPairs: [
    {name: 'Active', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'active']]}},
    {name: 'Needs Bootstrap', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'needs_bootstrap']]}},
    {name: 'Blocked', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'blocked']]}},
  ],
  glossary: [
    {name: 'Candidates', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'candidate']]}},
    {name: 'Approved', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'approved']]}},
    {name: 'Deprecated', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'deprecated']]}},
  ],
  localizationRuns: [
    {name: 'Needs Review', type: 'grid', filter: {logic: 'and', conditions: [['state', 'intersects', ['classification_required', 'translation_required', 'review_required']]]}},
    {name: 'Blocked or Partial', type: 'grid', filter: {logic: 'and', conditions: [['state', 'intersects', ['blocked', 'partial', 'stale']]]}},
    {name: 'Completed', type: 'grid', filter: {logic: 'and', conditions: [['state', '==', 'completed']]}},
  ],
}
```

- [ ] **Step 4: Run the schema test**

Run: `pnpm --filter zdoc-localize test -- lark-base-schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/zdoc-localize/src/adapters/lark-base-schema.ts packages/zdoc-localize/test/lark-base-schema.test.ts
git commit -m "feat(localize): define typed Feishu registry schema"
```

### Task 2: Add Base cell codecs

**Files:**
- Create: `packages/zdoc-localize/src/adapters/lark-base-cells.ts`
- Create: `packages/zdoc-localize/test/lark-base-cells.test.ts`

- [ ] **Step 1: Write failing codec tests**

Cover these exact cases:

```ts
expect(readBaseText('mirror')).toBe('mirror');
expect(readBaseText({text: 'Chinese', link: 'https://example.feishu.cn/docx/zh'})).toBe('https://example.feishu.cn/docx/zh');
expect(readBaseText([{text: 'active'}])).toBe('active');
expect(writeBaseDateTime('2026-07-16T01:02:03.000Z')).toMatch(/^2026-07-16 \d{2}:02:03$/);
expect(readProhibitedVariants('["群集","集群组"]')).toEqual(['群集', '集群组']);
expect(readProhibitedVariants('群集\n集群组\n')).toEqual(['群集', '集群组']);
expect(writeProhibitedVariants(['群集', '集群组'])).toBe('群集\n集群组');
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- lark-base-cells.test.ts`

Expected: FAIL because the codec module is missing.

- [ ] **Step 3: Implement tolerant codecs**

Implement:

- `readBaseText(value)` for strings, URL objects, single-select arrays, and `{name}` objects;
- `writeBaseUrl(value)` returning a URL string or `null`;
- `writeBaseDateTime(iso)` returning an Asia/Shanghai `YYYY-MM-DD HH:mm:ss` wall-clock string or `null`;
- `readProhibitedVariants(value)` supporting newline text and legacy JSON arrays;
- `writeProhibitedVariants(values)` returning trimmed newline-delimited text.

Reject invalid non-empty timestamps with `LocalizeError` subtype `base_datetime_invalid` instead of emitting `Invalid Date`.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter zdoc-localize test -- lark-base-cells.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/zdoc-localize/src/adapters/lark-base-cells.ts packages/zdoc-localize/test/lark-base-cells.test.ts
git commit -m "feat(localize): add typed Base cell codecs"
```

### Task 3: Upgrade the registry adapter projections

**Files:**
- Modify: `packages/zdoc-localize/src/adapters/lark-base-registry.ts`
- Modify: `packages/zdoc-localize/test/adapters.test.ts`

- [ ] **Step 1: Add failing adapter tests**

Assert that:

- URL-shaped Base response objects parse back to document URLs;
- glossary newline values parse while legacy JSON remains supported;
- `saveRun` writes date-time projections, source revisions, and `error_type` without large document bodies;
- `saveReceipt` writes `completed_at`, source/target revisions, hashes, and snapshot token;
- `payload_json` still round-trips the complete compact run or receipt.

- [ ] **Step 2: Run the adapter tests**

Run: `pnpm --filter zdoc-localize test -- adapters.test.ts`

Expected: FAIL on typed URL/date/glossary/projection assertions.

- [ ] **Step 3: Implement the adapter changes**

Use the Task 2 codecs in `savePair`, `parsePair`, `listGlossary`, and `saveGlossary`. Expand `saveRun` with:

```ts
created_at: writeBaseDateTime(run.createdAt),
updated_at: writeBaseDateTime(run.updatedAt),
source_from_revision: run.sourceFromRevision ?? null,
source_to_revision: run.sourceToRevision ?? null,
target_plan_revision: run.targetPlanRevision ?? null,
error_type: run.errorType ?? null,
```

Expand `saveReceipt` with:

```ts
completed_at: writeBaseDateTime(receipt.completedAt),
updated_at: writeBaseDateTime(receipt.completedAt),
source_to_revision: receipt.sourceRevision,
target_verified_revision: receipt.targetRevision,
source_hash: receipt.sourceHash,
target_hash: receipt.targetHash,
source_snapshot_token: receipt.sourceSnapshotRef.token ?? null,
```

Keep `payload_json` authoritative and do not parse runs from typed projections when the payload is missing.

- [ ] **Step 4: Run focused and full tests**

Run:

```bash
pnpm --filter zdoc-localize test -- adapters.test.ts
pnpm --filter zdoc-localize test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/zdoc-localize/src/adapters/lark-base-registry.ts packages/zdoc-localize/test/adapters.test.ts
git commit -m "feat(localize): project typed Feishu registry fields"
```

### Task 4: Expose and document the schema

**Files:**
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Modify: `packages/zdoc-localize/test/cli-contract.test.ts`
- Modify: `packages/zdoc-localize/README.md`
- Modify: `skills/zdoc-localization/SKILL.md`

- [ ] **Step 1: Add a failing CLI contract test**

Add a test that runs `registry schema --format json` and asserts the three table names, Base name, time zone, and the `state` single-select field.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- cli-contract.test.ts`

Expected: FAIL because `registry` is not a command.

- [ ] **Step 3: Add the command**

Add `registry` to the capabilities command list. Register:

```ts
const registry = program.command('registry').description('Inspect the shared Feishu registry contract');
formatOption(registry.command('schema'))
  .description('Print the exact Base table, field, option, and view schema')
  .action((options: {format: string}) => emit(io, feishuRegistrySchema, options.format));
```

- [ ] **Step 4: Update user guidance**

Document:

- `zdoc-localize registry schema --format json` as the schema source of truth;
- controlled values as single-select Labels;
- URLs, dates, revisions, and opaque payload types;
- the required live-test root folder, Base, state folder, and pilot pair;
- that provisioning is performed with user identity and requires explicit target approval.

Update the Skill to require `registry schema` plus live field inspection before the first production-mode `init`.

- [ ] **Step 5: Run tests and compatibility checks**

Run:

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
node scripts/check-zdoc-localize-skill-compat.mjs
```

Expected: all commands succeed.

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/cli-contract.test.ts packages/zdoc-localize/README.md skills/zdoc-localization/SKILL.md
git commit -m "feat(localize): expose Feishu registry schema"
```

### Task 5: Provision the isolated Feishu resources

**Files:**
- Runtime resources only; no repository file changes.

- [ ] **Step 1: Verify user identity and the approved empty folder**

Run `lark-cli auth status --json --verify`, inspect the supplied folder URL, and list its direct children. Continue only when the active user is 李鋆 and the folder token is `BZACfxoaTlFpKldL8Z0cPR1ZnVf`.

- [ ] **Step 2: Request missing write scopes through split-flow authorization**

Attempt dry-run creation commands first. For user-identity `missing_scope` errors, request only the reported scopes with `lark-cli auth login --scope "<reported-scope>" --no-wait --json`, display the exact URL and QR code, and resume with the returned device code after user confirmation. Never switch silently to bot identity.

- [ ] **Step 3: Create the Base with the first table**

Use the JSON from `zdoc-localize registry schema --format json` and run:

```bash
lark-cli base +base-create --name "ZDoc Localization Registry" --time-zone Asia/Shanghai --folder-token BZACfxoaTlFpKldL8Z0cPR1ZnVf --table-name document_pairs --fields '<document_pairs.fields JSON>' --as user --format json
```

Capture the returned Base URL/token and first table ID.

- [ ] **Step 4: Create the remaining tables**

Create `glossary` and `localization_runs` using `base +table-create` and their exact field arrays. List fields after every create and block if a field name or type differs from the schema.

- [ ] **Step 5: Create operational views**

Use `base +view-create` followed by `base +view-set-filter` for the approved views. If a view filter is unsupported by the available API, record a warning and continue; table/field mismatches remain blocking.

- [ ] **Step 6: Create the state folder**

Run:

```bash
lark-cli drive +create-folder --name state --folder-token BZACfxoaTlFpKldL8Z0cPR1ZnVf --as user --format json
```

Capture the returned folder URL and token.

- [ ] **Step 7: Create pilot documents serially**

Read the current `lark-doc` XML and create-workflow guides. Create `pilot-en` and `pilot-zh` under the approved root folder with equivalent supported structures: title, headings, paragraphs, bold text, link, ordered/unordered lists, inline code, code block, and repeated sibling paragraphs. Use `docs +fetch --scope full` after each creation to verify content.

### Task 6: Configure and bootstrap the live pilot

**Files:**
- Runtime only: `.zdoc-localize/config.json`, run artifacts, local SQLite.

- [ ] **Step 1: Build and initialize Feishu mode**

Run the built CLI with the captured Base URL/token, three table IDs, and state folder URL/token:

```bash
zdoc-localize init --mode feishu --registry '<base-url>' --registry-token '<base-token>' --pairs-table '<pairs-table-id>' --glossary-table '<glossary-table-id>' --runs-table '<runs-table-id>' --state-folder '<state-folder-url>' --state-folder-token '<state-folder-token>' --format json
```

- [ ] **Step 2: Run production diagnostics**

Run `zdoc-localize doctor --format json`. Require passing Lark version/auth, Base registry access, state-folder access, SQLite, and document capabilities. Treat optional `feishu-md-sync` incompatibility as a reported limitation only when localization does not invoke it.

- [ ] **Step 3: Register the pilot pair**

Run `pair add` with pair ID `pilot-en-zh`, the created document URLs, `--mode mirror`, and JSON output. Confirm the Base row contains Label values for mode/status and URL fields open correctly.

- [ ] **Step 4: Bootstrap without writes**

Run `bootstrap plan`, inspect the audit, then run `bootstrap accept` only when correspondence confidence is sufficient and no unsupported structure is present. Re-fetch both pilot documents and confirm no content or revision change was caused by bootstrap.

### Task 7: Execute and validate one real localization update

**Files:**
- Create runtime artifact: `.zdoc-localize/validation/live-feishu-report.json`

- [ ] **Step 1: Apply a controlled English-only change**

Use a block-level Feishu document update to change one paragraph, insert one list item, and update one link label in `pilot-en`. Re-fetch and record the new English revision.

- [ ] **Step 2: Generate and complete the localization plan**

Run `plan create`, generate `translations.json` through the `zdoc-localization` Skill, and run `plan complete`. Verify code, URLs, bold spans, and glossary constraints in the review.

- [ ] **Step 3: Generate the immutable preview**

Run `apply --preview`, record the exact block-level operations and approval token, and verify the preview only targets `pilot-zh`.

- [ ] **Step 4: Apply and verify**

Use the exact approval token. Require successful remote readback verification, a completed receipt row, and a retrievable hash-valid snapshot in `state`.

- [ ] **Step 5: Validate typed Base behavior**

List the pair and run records. Confirm that `mode`, `status`, `record_type`, and `state` are Label fields; timestamps are date-time fields; revisions are numeric; and `payload_json` remains complete.

- [ ] **Step 6: Write the live report**

Write `.zdoc-localize/validation/live-feishu-report.json` with:

- resource URLs and tokens with secrets excluded;
- authorization identity and tested scopes;
- automated test/build/package results;
- live bootstrap, planning, preview, apply, readback, Base, and Drive results;
- warnings for view creation or optional tooling;
- unsupported content not covered by the pilot;
- final `passed`, `failed`, or `blocked` status.

- [ ] **Step 7: Run final verification and commit code/docs**

Run:

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
python3 /Users/liyun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/zdoc-localization
git diff --check
git status --short
```

Expected: all automated validation succeeds; only ignored runtime artifacts may remain outside Git.

Commit any final code or documentation adjustments with:

```bash
git add packages/zdoc-localize skills/zdoc-localization
git commit -m "test(localize): validate typed Feishu pilot"
```
