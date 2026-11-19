# Daily Feishu Revision Inventory and Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an auditable per-group Feishu revision waterline to the existing scheduled documentation production workflow, verify both sites from the final immutable SHA, and alert when no complete daily ingestion succeeds.

**Architecture:** Derive revision inventories from the source snapshots already produced by each content group; do not add another Feishu metadata scan. Publish each inventory in the same checkpoint as its group content, compare it with the immutable `dev` baseline for reports, and validate all inventories plus EN/JA and ZH builds at the final SHA. Add one read-only watchdog workflow that inspects GitHub Actions run state and reuses the existing Feishu report-card command for alerts.

**Tech Stack:** Node.js 22, TypeScript, Vitest, Node test runner, pnpm, GitHub Actions, existing `@zilliz/docs-tooling` CLI and Feishu report-card integration.

---

## Scope guardrails

- Keep `.github/workflows/fetch-docs.yml` scheduled at `0 2,10,18 * * *` and keep direct grouped publication to `dev`.
- Do not add a candidate branch, whole-site atomic promotion, Feishu webhook, workflow-level automatic rerun, Jenkins change, deployment change, or `zdoc_cn` synchronization.
- Do not call Feishu a second time for revision reporting. Read the source snapshot created by `scripts/update-lark-doc-snapshot.js` or `scripts/update-sdk-reference-snapshots.sh`.
- Treat `revision_id` as the content-change signal and `obj_edit_time` only as an operational time filter.
- Never classify a missing baseline record as deleted when the candidate snapshot contains a metadata fetch error or is otherwise incomplete.
- Keep REST in the seven-group contract by producing a deterministic empty inventory with `complete: true` and no records.

## File map

- Create `packages/docs-tooling/src/lark/revisionInventory.ts`: inventory schema, snapshot projection, stable serialization, diff classification, changed-today filter, validation, and Markdown rendering.
- Create `packages/docs-tooling/src/lark/revisionInventory.test.ts`: focused domain tests, including the deletion safety invariant.
- Modify `packages/docs-tooling/src/cli-main.ts`: expose `revision-inventory build` and the design-compatible `validate-revision-inventory` command.
- Modify `packages/docs-tooling/src/cli-main.integration.test.ts`: executable-level CLI fixtures and output checks.
- Modify `packages/docs-tooling/src/workflows/groups.ts` and `groups.test.ts`: make each EN group own its inventory in the existing checkpoint.
- Modify `.github/workflows/_fetch-content-group.yml`: generate inventory and reports after snapshot generation and before checkpoint creation; upload reports for every group.
- Modify `.github/workflows/_verify-docs.yml`: validate inventories and both sites at the same final SHA.
- Modify `.github/workflows/fetch-docs.yml`, `scripts/docs-workflow/build-aggregate-input.js`, `scripts/docs-workflow/aggregate-results.js`, and their tests: expose revision reconciliation in the final result and Feishu note.
- Create `scripts/docs-workflow/docs-ingestion-watchdog.js` and `.test.js`: select and validate a recent complete production run from GitHub Actions API data.
- Create `.github/workflows/docs-ingestion-watchdog.yml`: daily read-only watchdog and Feishu failure notification.
- Modify `scripts/validate-workflow-policy.js`, `scripts/validate-workflow-policy.test.js`, `deploy/contracts/site-validation-workflow.test.mjs`, and `deploy/contracts/README.md`: pin the new workflow contract.

### Task 1: Build the revision inventory domain module

**Files:**
- Create: `packages/docs-tooling/src/lark/revisionInventory.ts`
- Create: `packages/docs-tooling/src/lark/revisionInventory.test.ts`

- [ ] **Step 1: Write failing tests for stable projection and serialization**

Create `packages/docs-tooling/src/lark/revisionInventory.test.ts` with fixtures that prove records are keyed by `doc_token`, sorted, and unaffected by run metadata:

```ts
import {describe, expect, it} from 'vitest';

import {
  buildRevisionInventory,
  serializeRevisionInventory,
  type SourceSnapshot,
} from './revisionInventory.ts';

const snapshot = (records: SourceSnapshot['records']): SourceSnapshot => ({
  schema_version: 2,
  manual: 'python',
  records,
});

describe('Feishu revision inventory', () => {
  it('projects and sorts source snapshot records by canonical token', () => {
    const inventory = buildRevisionInventory({
      group: 'python',
      sourceRunId: '30416089261',
      generatedAt: '2026-07-29T10:00:00+08:00',
      snapshots: [snapshot([
        {doc_token: 'b', title: 'B', output_paths: ['content/en/reference/api/python/b.md'], node_metadata: {obj_token: 'obj-b', parent_node_token: 'p', revision_id: '2', obj_edit_time: '1785253200'}},
        {doc_token: 'a', title: 'A', output_paths: ['content/en/reference/api/python/a.md'], node_metadata: {obj_token: 'obj-a', parent_node_token: 'p', revision_id: '1', obj_edit_time: '1785253100'}},
      ])],
    });

    expect(inventory.records.map(record => record.canonicalToken)).toEqual(['a', 'b']);
    expect(inventory.records[0]).toMatchObject({
      objectToken: 'obj-a', revisionId: '1', contentPath: 'content/en/reference/api/python/a.md',
    });
    expect(serializeRevisionInventory(inventory)).toContain('"schemaVersion": 1');
  });

  it('retains the published inventory bytes when only run metadata changes', () => {
    const first = buildRevisionInventory({group: 'rest', sourceRunId: '1', generatedAt: '2026-07-29T01:00:00Z', snapshots: []});
    const second = buildRevisionInventory({group: 'rest', sourceRunId: '2', generatedAt: '2026-07-29T02:00:00Z', snapshots: []});
    expect(serializeRevisionInventory(first, first)).toBe(serializeRevisionInventory(second, first));
  });
});
```

- [ ] **Step 2: Run the test and confirm the module is missing**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/lark/revisionInventory.test.ts
```

Expected: FAIL because `revisionInventory.ts` does not exist.

- [ ] **Step 3: Implement the schema, projection, and canonical serialization**

Create `packages/docs-tooling/src/lark/revisionInventory.ts` with these exported contracts and behavior:

```ts
export const REVISION_INVENTORY_GROUPS = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'] as const;
export type RevisionInventoryGroup = typeof REVISION_INVENTORY_GROUPS[number];

export type SourceSnapshotRecord = Readonly<{
  doc_token?: string | null;
  title?: string | null;
  output_paths?: readonly string[];
  node_metadata?: Readonly<{
    obj_token?: string | null;
    parent_node_token?: string | null;
    revision_id?: string | number | null;
    obj_edit_time?: string | number | null;
    fetch_error?: string | null;
  }> | null;
}>;

export type SourceSnapshot = Readonly<{
  schema_version: number;
  manual: string;
  records: readonly SourceSnapshotRecord[];
}>;

export type RevisionRecord = Readonly<{
  canonicalToken: string;
  objectToken: string | null;
  title: string;
  parentToken: string | null;
  revisionId: string | null;
  objectEditTime: string | null;
  contentPath: string | null;
  fetchError?: string;
}>;

export type RevisionInventory = Readonly<{
  schemaVersion: 1;
  group: RevisionInventoryGroup;
  complete: boolean;
  generatedAt: string;
  sourceRunId: string;
  records: readonly RevisionRecord[];
}>;

function text(value: unknown): string | null {
  return value === undefined || value === null || value === '' ? null : String(value);
}

export function buildRevisionInventory(input: Readonly<{
  group: RevisionInventoryGroup;
  sourceRunId: string;
  generatedAt: string;
  snapshots: readonly SourceSnapshot[];
}>): RevisionInventory {
  const records = input.snapshots.flatMap(snapshot => snapshot.records).map(record => {
    const canonicalToken = text(record.doc_token);
    if (!canonicalToken) throw new Error(`Revision inventory ${input.group} contains a record without doc_token`);
    const metadata = record.node_metadata ?? {};
    const fetchError = text(metadata.fetch_error);
    return {
      canonicalToken,
      objectToken: text(metadata.obj_token),
      title: text(record.title) ?? canonicalToken,
      parentToken: text(metadata.parent_node_token),
      revisionId: text(metadata.revision_id),
      objectEditTime: text(metadata.obj_edit_time),
      contentPath: [...(record.output_paths ?? [])].sort()[0] ?? null,
      ...(fetchError ? {fetchError} : {}),
    } satisfies RevisionRecord;
  }).sort((left, right) => left.canonicalToken.localeCompare(right.canonicalToken));
  const tokens = records.map(record => record.canonicalToken);
  if (new Set(tokens).size !== tokens.length) throw new Error(`Revision inventory ${input.group} contains duplicate canonical tokens`);
  return Object.freeze({
    schemaVersion: 1,
    group: input.group,
    complete: records.every(record => !record.fetchError),
    generatedAt: input.generatedAt,
    sourceRunId: input.sourceRunId,
    records: Object.freeze(records),
  });
}

export function serializeRevisionInventory(candidate: RevisionInventory, baseline?: RevisionInventory): string {
  const sameRecords = baseline?.schemaVersion === candidate.schemaVersion
    && baseline.group === candidate.group
    && baseline.complete === candidate.complete
    && JSON.stringify(baseline.records) === JSON.stringify(candidate.records);
  return `${JSON.stringify(sameRecords ? baseline : candidate, null, 2)}\n`;
}
```

- [ ] **Step 4: Add failing tests for all diff states and deletion safety**

Append tests that call `diffRevisionInventories()` with a baseline and candidate covering `created`, `updated`, `moved`, `renamed`, `deleted`, and `fetch_failed`. Add this explicit safety assertion:

```ts
it('never emits deletion from an incomplete candidate', () => {
  const baseline = inventory('guides', [record('kept'), record('missing')], true);
  const candidate = inventory('guides', [{...record('kept'), fetchError: 'timeout'}], false);
  expect(() => diffRevisionInventories(baseline, candidate)).toThrow(/incomplete.*deletion/i);
});
```

Use local `inventory()` and `record()` test helpers with complete concrete fields; do not use live Feishu data.

- [ ] **Step 5: Implement diffing, validation, changed-today, and report rendering**

Add these exports to `revisionInventory.ts`:

```ts
export type RevisionChangeType = 'created' | 'updated' | 'moved' | 'renamed' | 'deleted' | 'fetch_failed';
export type RevisionChange = Readonly<{
  type: RevisionChangeType;
  canonicalToken: string;
  title: string;
  previousRevisionId: string | null;
  revisionId: string | null;
  objectEditTime: string | null;
  contentPath: string | null;
}>;

export function validateRevisionInventory(value: RevisionInventory, expectedGroup?: RevisionInventoryGroup): void {
  if (value.schemaVersion !== 1) throw new Error('Revision inventory schemaVersion must be 1');
  if (!REVISION_INVENTORY_GROUPS.includes(value.group)) throw new Error(`Unknown revision inventory group: ${value.group}`);
  if (expectedGroup && value.group !== expectedGroup) throw new Error(`Expected revision inventory ${expectedGroup}, received ${value.group}`);
  const sorted = [...value.records].sort((a, b) => a.canonicalToken.localeCompare(b.canonicalToken));
  if (JSON.stringify(sorted) !== JSON.stringify(value.records)) throw new Error(`Revision inventory ${value.group} records must be sorted`);
  if (new Set(value.records.map(record => record.canonicalToken)).size !== value.records.length) throw new Error(`Revision inventory ${value.group} has duplicate canonical tokens`);
  if (value.complete && value.records.some(record => record.fetchError)) throw new Error(`Revision inventory ${value.group} cannot be complete with fetch failures`);
}

export function diffRevisionInventories(baseline: RevisionInventory | null, candidate: RevisionInventory): readonly RevisionChange[] {
  validateRevisionInventory(candidate);
  if (baseline) validateRevisionInventory(baseline, candidate.group);
  const before = new Map((baseline?.records ?? []).map(record => [record.canonicalToken, record]));
  const after = new Map(candidate.records.map(record => [record.canonicalToken, record]));
  const changes: RevisionChange[] = [];
  for (const current of candidate.records) {
    const previous = before.get(current.canonicalToken);
    const add = (type: RevisionChangeType): void => changes.push({
      type, canonicalToken: current.canonicalToken, title: current.title,
      previousRevisionId: previous?.revisionId ?? null, revisionId: current.revisionId,
      objectEditTime: current.objectEditTime, contentPath: current.contentPath,
    });
    if (current.fetchError) add('fetch_failed');
    else if (!previous) add('created');
    else if (previous.revisionId !== current.revisionId) add('updated');
    else if (previous.parentToken !== current.parentToken) add('moved');
    else if (previous.title !== current.title) add('renamed');
  }
  const missing = [...before.values()].filter(record => !after.has(record.canonicalToken));
  if (missing.length && !candidate.complete) throw new Error(`Revision inventory ${candidate.group} is incomplete; refusing to classify ${missing.length} deletion(s)`);
  for (const previous of missing) changes.push({
    type: 'deleted', canonicalToken: previous.canonicalToken, title: previous.title,
    previousRevisionId: previous.revisionId, revisionId: null,
    objectEditTime: previous.objectEditTime, contentPath: previous.contentPath,
  });
  return Object.freeze(changes.sort((a, b) => a.canonicalToken.localeCompare(b.canonicalToken) || a.type.localeCompare(b.type)));
}

export function editedToday(records: readonly RevisionRecord[], now: Date, timeZone = 'Asia/Shanghai'): readonly RevisionRecord[] {
  const day = new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
  return records.filter(record => record.objectEditTime && new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(Number(record.objectEditTime) * 1000)) === day);
}

export function renderRevisionDiffMarkdown(group: RevisionInventoryGroup, changes: readonly RevisionChange[]): string {
  const rows = changes.map(change => `| ${change.type} | ${change.title.replaceAll('|', '\\|')} | ${change.previousRevisionId ?? ''} | ${change.revisionId ?? ''} | ${change.objectEditTime ?? ''} | ${change.contentPath ?? ''} | ${change.canonicalToken} |`);
  return [`# ${group} Feishu revision changes`, '', '| Change | Title | Previous revision | Revision | Edit time | Content path | Token |', '| --- | --- | --- | --- | --- | --- | --- |', ...rows, ''].join('\n');
}
```

- [ ] **Step 6: Run the domain tests**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/lark/revisionInventory.test.ts
```

Expected: PASS, including the incomplete-candidate deletion test.

- [ ] **Step 7: Commit the domain module**

```bash
git add packages/docs-tooling/src/lark/revisionInventory.ts packages/docs-tooling/src/lark/revisionInventory.test.ts
git commit -m "feat: add Feishu revision inventory model"
```

### Task 2: Add build and validation CLI commands

**Files:**
- Modify: `packages/docs-tooling/src/cli-main.ts`
- Modify: `packages/docs-tooling/src/cli-main.integration.test.ts`

- [ ] **Step 1: Add failing executable-level tests**

Add a fixture that writes one source snapshot and one baseline inventory into a temporary repository. Spawn these exact commands:

```ts
const build = spawnSync(process.execPath, ['--experimental-strip-types', cliMain,
  'revision-inventory', 'build',
  '--group', 'python',
  '--snapshot', 'snapshots/python.json',
  '--baseline', 'baseline/python.json',
  '--output', 'generated/en/manifests/lark-revisions/python.json',
  '--report-dir', 'tmp/docs-tooling/revision-diff',
  '--source-run-id', '30416089261',
  '--generated-at', '2026-07-29T10:00:00+08:00',
], {cwd: repositoryRoot, encoding: 'utf8', env: process.env});
expect(build.status, build.stderr).toBe(0);
expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/revision-diff/python.md'), 'utf8')).toContain('| updated |');

const validate = spawnSync(process.execPath, ['--experimental-strip-types', cliMain,
  'validate-revision-inventory', '--site', 'en',
], {cwd: repositoryRoot, encoding: 'utf8', env: process.env});
expect(validate.status, validate.stderr).toBe(0);
```

Also test that `build` exits nonzero for an incomplete candidate that would imply deletion, and that `validate --site en` fails when one of the seven inventory files is absent.

- [ ] **Step 2: Run the CLI tests and confirm the command is unknown**

```bash
pnpm vitest run packages/docs-tooling/src/cli-main.integration.test.ts
```

Expected: FAIL because `revision-inventory` is not routed.

- [ ] **Step 3: Implement path-safe inventory CLI composition**

Import the Task 1 functions in `cli-main.ts`. Add `executeRevisionInventoryCommand()` immediately before `executeExplicitCommand()` and route it first:

```ts
async function executeRevisionInventoryCommand(argv: string[], repositoryRoot: string): Promise<boolean> {
  if (argv[0] === 'validate-revision-inventory') {
    const options = parseOptions(argv.slice(1));
    if (requiredOption(options, 'site') !== 'en') throw new Error('Revision inventories are owned by site en');
    for (const group of REVISION_INVENTORY_GROUPS) {
      const file = path.join(repositoryRoot, 'generated/en/manifests/lark-revisions', `${group}.json`);
      validateRevisionInventory(JSON.parse(readFileSync(file, 'utf8')) as RevisionInventory, group);
    }
    process.stdout.write('English Feishu revision inventories validated.\n');
    return true;
  }
  if (argv[0] !== 'revision-inventory') return false;
  const action = argv[1];
  const options = parseOptions(argv.slice(2));
  if (action === 'build') {
    const group = requiredOption(options, 'group') as RevisionInventoryGroup;
    if (!REVISION_INVENTORY_GROUPS.includes(group)) throw new Error(`Unknown revision inventory group: ${group}`);
    const snapshots = group === 'rest' ? [] : String(requiredOption(options, 'snapshot')).split(',').map(relativePath =>
      JSON.parse(readFileSync(resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'revision snapshot'), 'utf8')) as SourceSnapshot,
    );
    const baselinePath = requiredOption(options, 'baseline');
    const baselineAbsolute = resolveOwnedRepositoryPath(repositoryRoot, baselinePath, 'revision baseline');
    const baseline = existsSync(baselineAbsolute) ? JSON.parse(readFileSync(baselineAbsolute, 'utf8')) as RevisionInventory : null;
    const candidate = buildRevisionInventory({
      group, snapshots,
      sourceRunId: requiredOption(options, 'sourceRunId'),
      generatedAt: requiredOption(options, 'generatedAt'),
    });
    const changes = diffRevisionInventories(baseline, candidate);
    const output = resolveOwnedRepositoryPath(repositoryRoot, requiredOption(options, 'output'), 'revision inventory output');
    const reportDirectory = resolveOwnedRepositoryPath(repositoryRoot, requiredOption(options, 'reportDir'), 'revision report directory');
    mkdirSync(path.dirname(output), {recursive: true});
    mkdirSync(reportDirectory, {recursive: true});
    writeFileSync(output, serializeRevisionInventory(candidate, baseline ?? undefined));
    writeFileSync(path.join(reportDirectory, `${group}.json`), `${JSON.stringify({group, changes, editedToday: editedToday(candidate.records, new Date())}, null, 2)}\n`);
    writeFileSync(path.join(reportDirectory, `${group}.md`), renderRevisionDiffMarkdown(group, changes));
    process.stdout.write(`Revision inventory ${group} built with ${changes.length} change(s).\n`);
    return true;
  }
  throw new Error('revision-inventory action must be build');
}
```

At the start of `executeExplicitCommand()` add:

```ts
if (await executeRevisionInventoryCommand(argv, repositoryRoot)) return true;
```

Use the existing ownership helpers for every CLI path. Do not accept absolute or parent-traversal paths.

- [ ] **Step 4: Run focused CLI and domain tests**

```bash
pnpm vitest run packages/docs-tooling/src/lark/revisionInventory.test.ts packages/docs-tooling/src/cli-main.integration.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the CLI commands**

```bash
git add packages/docs-tooling/src/cli-main.ts packages/docs-tooling/src/cli-main.integration.test.ts
git commit -m "feat: expose revision inventory commands"
```

### Task 3: Put each inventory inside its content checkpoint

**Files:**
- Modify: `packages/docs-tooling/src/workflows/groups.ts`
- Modify: `packages/docs-tooling/src/workflows/groups.test.ts`

- [ ] **Step 1: Write the failing ownership test**

Extend `groups.test.ts`:

```ts
import {resolvePublicationGroupWorkflow} from './groups.ts';

it.each(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'])('owns the %s revision inventory in its English checkpoint', group => {
  const workflow = resolvePublicationGroupWorkflow('en', group);
  expect(workflow.checkpointPaths).toContain(`generated/en/manifests/lark-revisions/${group}.json`);
});

it('does not attach English revision inventories to Chinese source groups', () => {
  expect(resolvePublicationGroupWorkflow('zh-CN', 'guides').checkpointPaths)
    .not.toContain('generated/en/manifests/lark-revisions/guides.json');
});
```

- [ ] **Step 2: Run the test and confirm inventory paths are absent**

```bash
pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts
```

Expected: FAIL for all seven EN groups.

- [ ] **Step 3: Add the inventory path to the centralized workflow resolver**

In `resolvePublicationGroupWorkflow()` compute:

```ts
const revisionInventory = site === 'en'
  ? `generated/en/manifests/lark-revisions/${groupName}.json`
  : undefined;
```

Then append it to `checkpointPaths` through the existing `distinct()` helper:

```ts
checkpointPaths: distinct([
  ...group.ownedPaths,
  ...sourceSnapshots,
  ...(groupName === 'guides' ? GUIDES_CHECKPOINT_PATHS : []),
  group.publicationManifest,
  revisionInventory,
]),
```

- [ ] **Step 4: Run group and checkpoint tests**

```bash
pnpm vitest run packages/docs-tooling/src/workflows/groups.test.ts
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: PASS and existing checkpoint validation still rejects unowned paths.

- [ ] **Step 5: Commit checkpoint ownership**

```bash
git add packages/docs-tooling/src/workflows/groups.ts packages/docs-tooling/src/workflows/groups.test.ts
git commit -m "feat: checkpoint Feishu revision inventories"
```

### Task 4: Generate inventories in the existing source producer

**Files:**
- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add a failing workflow policy test**

Add a mutation-based test requiring inventory generation after `Update content snapshots` and before `Create source checkpoint artifact`:

```js
test('source producers derive revision inventories from snapshots before checkpoint creation', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_fetch-content-group.yml'), 'utf8')
  const update = source.indexOf('- name: Update content snapshots')
  const inventory = source.indexOf('- name: Build revision inventory')
  const checkpoint = source.indexOf('- name: Create source checkpoint artifact')
  assert.ok(update >= 0 && inventory > update && checkpoint > inventory)
  assert.match(source, /--baseline "tmp\/docs-tooling\/revision-baseline\/\$GROUP\.json"/)
  assert.doesNotMatch(source.slice(inventory, checkpoint), /APP_ID|APP_SECRET|fetch_wiki_node_metadata/)
})
```

Add a negative fixture that removes the inventory step and expect `validateWorkflowPolicies()` to return `_fetch-content-group.yml: revision inventory must be derived after snapshots and before checkpoint creation`.

- [ ] **Step 2: Run the policy tests and confirm failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the workflow has no inventory step or policy.

- [ ] **Step 3: Add the inventory generation step without another Feishu request**

Insert this step after `Update content snapshots`:

```yaml
      - name: Build revision inventory
        if: ${{ inputs.site == 'en' }}
        shell: bash
        run: |
          set -euo pipefail
          output="generated/en/manifests/lark-revisions/$GROUP.json"
          baseline="tmp/docs-tooling/revision-baseline/$GROUP.json"
          mkdir -p "$(dirname "$baseline")"
          if [[ -f "$BASELINE_DIR/$output" ]]; then
            cp "$BASELINE_DIR/$output" "$baseline"
          fi
          if [[ "$GROUP" == rest ]]; then
            snapshot_args=()
          else
            mapfile -t snapshots < <(node --experimental-strip-types -e '
              const {resolvePublicationGroupWorkflow} = require("./packages/docs-tooling/src/workflows/groups.ts");
              for (const value of resolvePublicationGroupWorkflow("en", process.env.GROUP).sourceSnapshots) console.log(value);
            ')
            [[ "${#snapshots[@]}" -gt 0 ]] || { echo "No source snapshots resolved for $GROUP" >&2; exit 1; }
            snapshot_args=(--snapshot "$(IFS=,; echo "${snapshots[*]}")")
          fi
          pnpm docs-tooling revision-inventory build \
            --group "$GROUP" \
            "${snapshot_args[@]}" \
            --baseline "$baseline" \
            --output "$output" \
            --report-dir tmp/docs-tooling/revision-diff \
            --source-run-id "${{ github.run_id }}" \
            --generated-at "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

This step intentionally receives no Feishu credentials and only reads repository files plus `$BASELINE_DIR`.

Add a revision-report upload for every group and keep the existing Guides audit upload as a separate step:

```yaml
      - name: Upload revision inventory report
        if: ${{ always() }}
        uses: actions/upload-artifact@v4
        with:
          name: docs-checkpoint-${{ inputs.group }}-${{ github.run_id }}-revision-report
          path: |
            tmp/docs-tooling/revision-diff/${{ inputs.group }}.json
            tmp/docs-tooling/revision-diff/${{ inputs.group }}.md
          retention-days: ${{ inputs.artifact_retention_days }}
          if-no-files-found: error

      - name: Upload Guides content reports
        if: ${{ always() && inputs.group == 'guides' }}
        uses: actions/upload-artifact@v4
        with:
          name: docs-checkpoint-${{ inputs.group }}-${{ github.run_id }}-reports
          path: packages/docs-tooling/src/lark/meta/reports/
          retention-days: ${{ inputs.artifact_retention_days }}
          if-no-files-found: ignore
```

- [ ] **Step 4: Enforce the step order in workflow policy**

Add a focused `_fetch-content-group.yml` policy in `validate-workflow-policy.js` that checks:

```js
const snapshotIndex = fetchContentGroup.indexOf('- name: Update content snapshots')
const revisionIndex = fetchContentGroup.indexOf('- name: Build revision inventory')
const checkpointIndex = fetchContentGroup.indexOf('- name: Create source checkpoint artifact')
if (!(snapshotIndex >= 0 && revisionIndex > snapshotIndex && checkpointIndex > revisionIndex)
  || !fetchContentGroup.includes('--baseline "tmp/docs-tooling/revision-baseline/$GROUP.json"')) {
  errors.push('_fetch-content-group.yml: revision inventory must be derived after snapshots and before checkpoint creation')
}
```

- [ ] **Step 5: Run workflow policy and checkpoint tests**

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit producer integration**

```bash
git add .github/workflows/_fetch-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "ci: generate revision inventory with source checkpoints"
```

### Task 5: Reconcile inventories and build both sites at the final SHA

**Files:**
- Modify: `.github/workflows/_verify-docs.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`

- [ ] **Step 1: Add failing contract tests for final verification order**

Add assertions that the final verification workflow contains these commands in this order across the revision and site-verification steps:

```js
const required = [
  'pnpm check:localization-input-inventory',
  'pnpm docs-tooling validate-revision-inventory --site en',
  'pnpm docs-tooling validate-reference --site zh-CN',
  'pnpm docs-tooling validate-translation --target zh-CN-tools --group tools',
  'pnpm docs-tooling validate-tools-sidebar',
  'pnpm run build:en',
  'pnpm run build:zh-CN',
]
let cursor = -1
for (const command of required) {
  const next = source.indexOf(command)
  assert.ok(next > cursor, `${command} must appear in final verification order`)
  cursor = next
}
```

Also assert `actions/checkout` uses `fetch-depth: 0` and the exact `FINAL_DEV_SHA` is restored before any validator runs.

- [ ] **Step 2: Run tests and confirm ZH/revision commands are missing**

```bash
node --test scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs
```

Expected: FAIL on missing revision and Chinese build commands.

- [ ] **Step 3: Give revision reconciliation its own reusable-workflow output**

Add this output to `workflow_call.outputs`:

```yaml
      revision_status:
        description: passed or failed
        value: ${{ jobs.verify.outputs.revision_status }}
```

Add it to the job outputs:

```yaml
      revision_status: ${{ steps.revision_result.outputs.status }}
```

After materializing the exact final SHA, add:

```yaml
      - name: Verify final revision waterline
        id: revision
        continue-on-error: true
        run: |
          set -euo pipefail
          mkdir -p tmp/final-verification-reports
          pnpm check:localization-input-inventory 2>&1 | tee tmp/final-verification-reports/localization-input-inventory.log
          pnpm docs-tooling validate-revision-inventory --site en 2>&1 | tee tmp/final-verification-reports/revision-inventory.log
      - name: Emit revision reconciliation result
        id: revision_result
        if: ${{ always() }}
        run: |
          if [[ "${{ steps.revision.outcome }}" == success ]]; then
            echo "status=passed" >> "$GITHUB_OUTPUT"
          else
            echo "status=failed" >> "$GITHUB_OUTPUT"
          fi
```

- [ ] **Step 4: Replace the site verification command block**

Keep the existing report directory and `continue-on-error`. Replace the validation/build portion with:

```yaml
          pnpm docs-tooling validate-reference --site zh-CN 2>&1 | tee tmp/final-verification-reports/zh-reference.log
          pnpm docs-tooling validate-translation --target zh-CN-tools --group tools 2>&1 | tee tmp/final-verification-reports/zh-tools-translation.log
          pnpm docs-tooling validate-tools-sidebar 2>&1 | tee tmp/final-verification-reports/zh-tools-sidebar.log
          node scripts/validate-generated-sidebars.js 2>&1 | tee tmp/final-verification-reports/sidebars.log
          for group in guides python java node go cli rest; do
            node scripts/validate-translated-coverage.js --group "$group"
          done 2>&1 | tee tmp/final-verification-reports/translated-coverage.log
          node scripts/run-doc-build-stage.js --build "pnpm run build:en" --skipCardReporting 2>&1 | tee tmp/final-verification-reports/build-en.log
          node scripts/run-doc-build-stage.js --build "pnpm run build:zh-CN" --skipCardReporting 2>&1 | tee tmp/final-verification-reports/build-zh-CN.log
```

Keep the existing workflow-policy, runtime-boundary, and Node test commands after the builds.

Update `Emit verification result` so overall verification passes only when both portions pass:

```bash
if [[ "${{ steps.revision.outcome }}" == success && "${{ steps.verification.outcome }}" == success ]]; then
  echo "status=passed" >> "$GITHUB_OUTPUT"
else
  echo "status=failed" >> "$GITHUB_OUTPUT"
fi
```

- [ ] **Step 5: Extend workflow policy with the same ordered contract**

In `validate-workflow-policy.js`, add an ordered-subsequence check for the seven commands. Return:

```text
_verify-docs.yml: final immutable SHA must pass revision, localization, Reference, Tools, EN, and ZH verification in order
```

when any command is absent, reordered, or duplicated in a way that bypasses the intended sequence.

- [ ] **Step 6: Run policy and contract tests**

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit final dual-site verification**

```bash
git add .github/workflows/_verify-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs
git commit -m "ci: verify revision waterline and both sites"
```

### Task 6: Surface revision reconciliation in aggregate reporting

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/docs-workflow/build-aggregate-input.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`

- [ ] **Step 1: Write failing aggregate schema tests**

Add tests proving publish-mode input requires `revisionReconciliation` and renders it:

```js
assert.equal(buildAggregateInput({...successfulEnv, REVISION_RECONCILIATION: 'passed'}).revisionReconciliation, 'passed')
assert.match(aggregateResults({...successfulInput, revisionReconciliation: 'passed'}).markdown, /Revision reconciliation: passed/)
assert.equal(aggregateResults({...successfulInput, revisionReconciliation: 'failed'}).overallStatus, 'failure')
```

Artifact-only mode must set `revisionReconciliation: 'skipped'`.

- [ ] **Step 2: Run aggregate tests and confirm the field is absent**

```bash
node --test scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js
```

Expected: FAIL because the schema has no revision reconciliation state.

- [ ] **Step 3: Add the aggregate field with a closed state set**

In `build-aggregate-input.js`, return:

```js
revisionReconciliation: mode === 'artifact_only' ? 'skipped'
  : (env.REVISION_RECONCILIATION === 'passed' ? 'passed' : 'failed'),
```

In `aggregate-results.js`:

```js
const REVISION_STATES = new Set(['passed', 'failed', 'skipped'])
```

Allow only `revisionReconciliation` as the added root property, validate it with `REVISION_STATES`, require `passed` for publish-mode success, and add this line before final verification:

```js
`Revision reconciliation: ${input.revisionReconciliation}`,
```

- [ ] **Step 4: Wire the final verification output into aggregate input**

In `fetch-docs.yml`, set the aggregate job environment to:

```yaml
          REVISION_RECONCILIATION: ${{ needs.verify_final.outputs.revision_status }}
```

The aggregate Markdown is already sent through the existing report-card note path; do not add a second Feishu card.

- [ ] **Step 5: Run aggregate and policy tests**

```bash
node --test scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js scripts/docs-workflow/docs-card-report.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS.

- [ ] **Step 6: Commit aggregate reporting**

```bash
git add .github/workflows/fetch-docs.yml scripts/docs-workflow/build-aggregate-input.js scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js
git commit -m "feat: report revision reconciliation status"
```

### Task 7: Add the 24-hour read-only ingestion watchdog

**Files:**
- Create: `scripts/docs-workflow/docs-ingestion-watchdog.js`
- Create: `scripts/docs-workflow/docs-ingestion-watchdog.test.js`
- Create: `.github/workflows/docs-ingestion-watchdog.yml`

- [ ] **Step 1: Write failing selection and freshness tests**

Create tests for a pure `evaluateRuns()` function using fixed fixtures:

```js
const recentSuccess = {
  id: 10, html_url: 'https://github.example/runs/10', created_at: '2026-07-29T01:00:00Z',
  updated_at: '2026-07-29T02:00:00Z', conclusion: 'success', event: 'schedule', head_sha: 'a'.repeat(40),
  jobs: [
    {name: 'resolve final dev state', conclusion: 'success'},
    {name: 'verify final docs state / verify', conclusion: 'success'},
    {name: 'aggregate', conclusion: 'success'},
  ],
};

assert.deepEqual(evaluateRuns([recentSuccess], new Date('2026-07-29T12:00:00Z')), {
  ok: true, runId: 10, runUrl: recentSuccess.html_url, finalSha: 'a'.repeat(40), lastSuccessfulAt: '2026-07-29T02:00:00Z', reason: 'complete success within 24 hours',
});
assert.match(evaluateRuns([recentSuccess], new Date('2026-07-30T03:00:01Z')).reason, /older than 24 hours/);
assert.match(evaluateRuns([{...recentSuccess, jobs: recentSuccess.jobs.slice(0, 2)}], new Date('2026-07-29T12:00:00Z')).reason, /aggregate/);
```

Also test that a manual run is considered only when the run-detail response contains `inputs.group === 'all'` and `inputs.publish === 'true'`; scheduled runs qualify through the workflow defaults.

- [ ] **Step 2: Run the test and confirm the helper is missing**

```bash
node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js
```

Expected: FAIL because the watchdog module does not exist.

- [ ] **Step 3: Implement API loading and pure evaluation**

Create `docs-ingestion-watchdog.js` with:

```js
'use strict'

const REQUIRED_JOBS = ['resolve final dev state', 'verify final docs state / verify', 'aggregate']

function evaluateRuns(runs, now = new Date()) {
  const ordered = [...runs].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
  const complete = ordered.find(run => run.conclusion === 'success'
    && /^[a-f0-9]{40}$/.test(run.head_sha || '')
    && REQUIRED_JOBS.every(name => run.jobs?.some(job => job.name === name && job.conclusion === 'success')))
  if (!complete) return {ok: false, runId: null, runUrl: null, finalSha: null, lastSuccessfulAt: null, reason: 'no complete successful all-group published run'}
  const age = now.getTime() - Date.parse(complete.updated_at)
  if (!Number.isFinite(age) || age > 24 * 60 * 60 * 1000) return {ok: false, runId: complete.id, runUrl: complete.html_url, finalSha: complete.head_sha, lastSuccessfulAt: complete.updated_at, reason: 'last complete success is older than 24 hours'}
  return {ok: true, runId: complete.id, runUrl: complete.html_url, finalSha: complete.head_sha, lastSuccessfulAt: complete.updated_at, reason: 'complete success within 24 hours'}
}

async function githubJson(url, token) {
  const response = await fetch(url, {headers: {Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28'}})
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`)
  return response.json()
}

async function loadRuns({repository, token}) {
  const base = `https://api.github.com/repos/${repository}`
  const listing = await githubJson(`${base}/actions/workflows/fetch-docs.yml/runs?status=completed&per_page=20`, token)
  const candidates = await Promise.all(listing.workflow_runs.map(async summary => {
    const run = await githubJson(`${base}/actions/runs/${summary.id}`, token)
    const production = run.event === 'schedule'
      || (run.event === 'workflow_dispatch' && run.inputs?.group === 'all' && String(run.inputs?.publish) === 'true')
    if (!production) return null
    return {...run, jobs: (await githubJson(`${base}/actions/runs/${run.id}/jobs?per_page=100`, token)).jobs}
  }))
  return candidates.filter(Boolean)
}
```

Add CLI parsing for `--repository`, `--output`, and environment `GITHUB_TOKEN`; write the result JSON atomically, append `ok`, `reason`, `run_url`, `last_successful_at`, and `final_sha` to `$GITHUB_OUTPUT`, and exit 1 when `ok` is false. Export `evaluateRuns` and `loadRuns` for tests.

- [ ] **Step 4: Add the scheduled watchdog workflow**

Create `.github/workflows/docs-ingestion-watchdog.yml`:

```yaml
name: docs ingestion watchdog

on:
  schedule:
    - cron: '30 19 * * *'
  workflow_dispatch:

permissions:
  actions: read
  contents: read

jobs:
  watchdog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Evaluate latest complete ingestion
        id: evaluate
        continue-on-error: true
        run: node scripts/docs-workflow/docs-ingestion-watchdog.js --repository "$GITHUB_REPOSITORY" --output tmp/docs-ingestion-watchdog.json
        env:
          GITHUB_TOKEN: ${{ github.token }}
      - name: Write watchdog failure note
        if: ${{ steps.evaluate.outcome == 'failure' }}
        run: |
          mkdir -p tmp
          printf '%s\n' \
            "${{ steps.evaluate.outputs.reason }}" \
            "Last success: ${{ steps.evaluate.outputs.last_successful_at }}" \
            "Run: ${{ steps.evaluate.outputs.run_url }}" \
            "Final SHA: ${{ steps.evaluate.outputs.final_sha }}" > tmp/docs-ingestion-watchdog-note.md
      - name: Create Feishu watchdog card
        id: watchdog_card
        if: ${{ steps.evaluate.outcome == 'failure' }}
        continue-on-error: true
        run: pnpm docs-tooling report-card create --title "Documentation ingestion watchdog" --stages "Check daily ingestion"
        env:
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}
      - name: Attach and finish Feishu watchdog card
        if: ${{ steps.evaluate.outcome == 'failure' && steps.watchdog_card.outputs.card_id != '' }}
        continue-on-error: true
        run: |
          pnpm docs-tooling report-card note --file tmp/docs-ingestion-watchdog-note.md
          pnpm docs-tooling report-card finish \
            --message-id "${{ steps.watchdog_card.outputs.card_id }}" \
            --status fail \
            --started-at "${{ steps.watchdog_card.outputs.card_started_at }}" \
            --stages "${{ steps.watchdog_card.outputs.card_stages }}" \
            --title "${{ steps.watchdog_card.outputs.card_title }}"
        env:
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}
      - uses: actions/upload-artifact@v4
        if: ${{ always() }}
        with:
          name: docs-ingestion-watchdog-${{ github.run_id }}
          path: tmp/docs-ingestion-watchdog.json
          if-no-files-found: error
      - name: Fail stale or incomplete ingestion
        if: ${{ steps.evaluate.outcome == 'failure' }}
        run: exit 1
```

Schedule it after the last regular ingestion window, while the 24-hour condition remains authoritative.

- [ ] **Step 5: Run watchdog tests**

```bash
node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js
```

Expected: PASS for recent success and FAIL evaluations for stale/missing stages.

- [ ] **Step 6: Commit the watchdog**

```bash
git add scripts/docs-workflow/docs-ingestion-watchdog.js scripts/docs-workflow/docs-ingestion-watchdog.test.js .github/workflows/docs-ingestion-watchdog.yml
git commit -m "ci: add daily docs ingestion watchdog"
```

### Task 8: Pin contracts, document operations, and run end-to-end verification

**Files:**
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`
- Modify: `deploy/contracts/README.md`

- [ ] **Step 1: Add failing policy tests for schedule and watchdog immutability**

Add tests that require:

```js
assert.match(fetchDocs, /cron: '0 2,10,18 \* \* \*'/)
assert.match(watchdog, /actions: read/)
assert.match(watchdog, /contents: read/)
assert.doesNotMatch(watchdog, /contents: write|git push|workflow_dispatch.*fetch-docs|repository_dispatch/)
assert.match(watchdog, /docs-ingestion-watchdog\.js/)
```

Mutation fixtures must fail if the existing production schedule changes, if the watchdog gains write permission, or if it triggers ingestion/deployment.

- [ ] **Step 2: Run policy tests and confirm the new contract is not yet enforced**

```bash
node --test scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs
```

Expected: FAIL on at least the watchdog contract.

- [ ] **Step 3: Add concise operational documentation**

Append to `deploy/contracts/README.md`:

```markdown
## Daily Feishu revision waterline

The production fetch workflow remains scheduled three times daily and publishes each content group directly to `dev`. Each English source checkpoint owns `generated/en/manifests/lark-revisions/<group>.json`, derived from the already generated Lark source snapshot. A checkpoint advances content and its revision waterline together; metadata failure fails the group and cannot authorize deletion.

The final immutable `dev` SHA must pass revision inventory validation, localization input validation, Chinese Reference and Tools validation, and both `build:en` and `build:zh-CN`. EN includes the Japanese site content; Japanese structure continues to follow English. Jenkins remains the only deployment owner.

`docs-ingestion-watchdog.yml` is read-only. It fails when no complete all-group published run with final verification exists within 24 hours and sends the failure through the existing Feishu report-card integration. It does not fetch content, rerun production, deploy, or modify Git.

To locate today's Feishu edits, download the `docs-checkpoint-<group>-<run-id>-revision-report` artifact and open `<group>.md`. The committed inventory comparison is authoritative for changes since the last successful publication; the edited-today list uses `Asia/Shanghai` only for operational filtering.
```

- [ ] **Step 4: Complete workflow policy implementation**

Add the schedule and watchdog read-only checks to `validate-workflow-policy.js` with stable messages:

```text
fetch-docs.yml: production ingestion schedule must remain three times daily
docs-ingestion-watchdog.yml: watchdog must remain read-only and must not trigger ingestion or deployment
```

- [ ] **Step 5: Run the focused test suite**

```bash
pnpm vitest run packages/docs-tooling/src/lark/revisionInventory.test.ts packages/docs-tooling/src/cli-main.integration.test.ts packages/docs-tooling/src/workflows/groups.test.ts
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js scripts/docs-workflow/docs-card-report.test.js scripts/docs-workflow/docs-ingestion-watchdog.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js deploy/contracts/site-validation-workflow.test.mjs
pnpm test:typescript-runtime-boundary
node scripts/validate-workflow-policy.js
```

Expected: all tests and policy checks PASS.

- [ ] **Step 6: Exercise inventory generation against repository fixtures**

Use an existing non-secret source snapshot; do not fetch Feishu:

```bash
pnpm docs-tooling revision-inventory build \
  --group guides \
  --snapshot packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json \
  --baseline generated/en/manifests/lark-revisions/guides.json \
  --output generated/en/manifests/lark-revisions/guides.json \
  --report-dir tmp/docs-tooling/revision-diff \
  --source-run-id local-acceptance \
  --generated-at 2026-07-29T00:00:00Z
pnpm docs-tooling validate-revision-inventory --site en
```

Expected: the build writes a deterministic inventory and JSON/Markdown report; validation passes after all seven group fixtures/inventories are present. Restore fixture-only generated changes before the final commit unless they are intended seed inventories.

- [ ] **Step 7: Build both sites from the same worktree state**

```bash
pnpm check:localization-input-inventory
pnpm docs-tooling validate-reference --site zh-CN
pnpm docs-tooling validate-translation --target zh-CN-tools --group tools
pnpm docs-tooling validate-tools-sidebar
pnpm build:en
pnpm build:zh-CN
```

Expected: both builds PASS. The EN build retains Japanese content and navigation checks; the ZH build retains Reference provenance and Tools sidebar coverage.

- [ ] **Step 8: Review the diff for scope creep and commit contracts**

```bash
git status --short
git diff --check
git diff --stat
git diff -- . ':!pnpm-lock.yaml'
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs deploy/contracts/README.md
git commit -m "docs: define daily ingestion operating contract"
```

Expected: no Jenkins, deployment image, `zdoc_cn`, webhook, candidate-branch, or automatic-rerun changes.

## Live acceptance after implementation

1. Edit one controlled Feishu document in a selected group.
2. Dispatch `fetch lark docs` with that group, `target_branch=dev`, and `publish=true`, or wait for the next scheduled all-group run.
3. Confirm the group report artifact classifies the token as `updated`, `moved`, or `renamed` as applicable.
4. Confirm the content and `generated/en/manifests/lark-revisions/<group>.json` are in the same published group checkpoint commit.
5. Confirm final verification uses one immutable SHA and passes revision validation, EN/JA build, and ZH build.
6. Confirm aggregate reporting includes `Revision reconciliation: passed` and the existing Feishu card finishes successfully.
7. Temporarily run the watchdog against fixed stale fixture data in its unit test; do not wait 24 hours or modify production history.

## Definition of done

- All seven English groups have committed, valid inventories; REST is deterministic and empty.
- No inventory can advance independently of its group content checkpoint.
- Incomplete metadata cannot classify or publish deletions.
- Revision reports identify changes since the last published inventory and edits today in `Asia/Shanghai`.
- The final immutable SHA passes inventory, localization, Chinese Reference, Chinese Tools, EN/JA, and ZH checks.
- The aggregate result exposes revision reconciliation without creating a second Feishu card.
- The watchdog is read-only and fails when the latest complete production waterline is older than 24 hours.
- Existing schedule, direct `dev` publication, Agent-driven JA/ZH translation, Jenkins deployment ownership, and `zdoc_cn` isolation remain unchanged.
