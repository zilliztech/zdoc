# ZDoc Localization Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a versioned `zdoc-localize` CLI and compatible `zdoc-localization` Codex Skill that create reviewable, stale-safe, block-level Chinese localization plans from remote English Feishu changes.

**Architecture:** A TypeScript CLI owns deterministic domain logic, workflow state, storage contracts, process adapters, and validation. The Codex Skill owns natural-language routing and translation generation through a structured request/response protocol. Shared Feishu Base/Drive integrations are adapters around `lark-cli`; tests use local stores and fake subprocesses.

**Tech Stack:** Node.js 20+, TypeScript, Commander, Vitest, `saxes`, `sqlite3`, `lark-cli`, `feishu-md-sync`, Markdown, JSON.

---

## File Map

### Workspace and package

- Modify `pnpm-workspace.yaml` to include `packages/zdoc-localize`.
- Create `packages/zdoc-localize/package.json` for the publishable CLI.
- Create `packages/zdoc-localize/tsconfig.json` and `vitest.config.ts` for Node-targeted TypeScript and tests.
- Create `packages/zdoc-localize/src/cli/index.ts` as the executable entry point.
- Create `packages/zdoc-localize/src/cli/program.ts` to register commands without process-global side effects.

### Domain

- Create `src/domain/model.ts` for semantic documents, changes, plans, pairs, runs, glossary entries, and receipts.
- Create `src/domain/errors.ts` for stable machine errors and exit codes.
- Create `src/domain/hash.ts` for canonical JSON and SHA-256 helpers.
- Create `src/domain/state-machine.ts` for legal run transitions.
- Create `src/domain/xml-parser.ts` for Feishu XML to semantic document conversion.
- Create `src/domain/markdown-renderer.ts` for readable snapshot/review rendering.
- Create `src/domain/diff.ts` for semantic insert/replace/delete/move classification.
- Create `src/domain/alignment.ts` for source-change to target-node correspondence.
- Create `src/domain/glossary.ts` for scoped terminology resolution.
- Create `src/domain/translation.ts` for request building and response validation.
- Create `src/domain/review.ts` for protected review Markdown compilation/parsing.

### Application and storage

- Create `src/application/ports.ts` for registry, snapshot, process, clock, ID, and translation-memory interfaces.
- Create `src/application/workflows.ts` for bootstrap, plan, complete, apply, status, and recovery orchestration.
- Create `src/storage/config-store.ts` for `.zdoc-localize/config.json`.
- Create `src/storage/local-registry-store.ts` for deterministic tests and offline development.
- Create `src/storage/local-snapshot-store.ts` for immutable run bundles.
- Create `src/storage/sqlite-translation-memory.ts` for approved translation memory.
- Create `src/adapters/process-runner.ts` for safe argv-based subprocess calls.
- Create `src/adapters/lark-docs-adapter.ts` for Feishu document fetch/update commands.
- Create `src/adapters/lark-base-registry.ts` for Base-backed pair/glossary/run records.
- Create `src/adapters/lark-drive-snapshots.ts` for shared snapshot upload/download.
- Create `src/adapters/feishu-md-sync-adapter.ts` for optional read-only English source status.

### Tests, fixtures, Skill, and release checks

- Create focused `test/*.test.ts` files matching each domain/application module.
- Create `test/fixtures/*.xml` and `test/fixtures/*.json` for pilot documents and process envelopes.
- Create `skills/zdoc-localization/SKILL.md` and references.
- Create `scripts/check-zdoc-localize-skill-compat.mjs`.
- Modify `.gitignore` for `.zdoc-localize/`.
- Modify root `package.json` with CLI build/test/compatibility scripts.
- Create `packages/zdoc-localize/README.md` with command contracts and development instructions.

## Task 1: Scaffold the CLI package and compatibility envelope

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `packages/zdoc-localize/package.json`
- Create: `packages/zdoc-localize/tsconfig.json`
- Create: `packages/zdoc-localize/vitest.config.ts`
- Create: `packages/zdoc-localize/src/cli/index.ts`
- Create: `packages/zdoc-localize/src/cli/program.ts`
- Test: `packages/zdoc-localize/test/cli-contract.test.ts`

- [ ] **Step 1: Write the failing CLI contract test**

```ts
import {describe, expect, it} from 'vitest';
import {runCli} from '../src/cli/program.js';

describe('CLI contract', () => {
  it('returns versioned capabilities as a JSON success envelope', async () => {
    const result = await runCli(['capabilities', '--format', 'json']);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      data: {
        cliVersion: '0.1.0',
        schemaVersion: 1,
        commands: expect.arrayContaining(['doctor', 'pair', 'bootstrap', 'plan', 'apply', 'status', 'recover']),
        features: expect.arrayContaining(['external-translation-provider', 'review-markdown-v1']),
      },
    });
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm --filter zdoc-localize test -- cli-contract.test.ts`

Expected: FAIL because the package and `runCli` do not exist.

- [ ] **Step 3: Add the package and minimal program**

Use Commander with an injectable output collector. `runCli(argv)` must return `{exitCode, stdout, stderr}` for tests, while `src/cli/index.ts` forwards real `process.argv` and writes exactly one envelope.

```ts
export const CLI_VERSION = '0.1.0';
export const SCHEMA_VERSION = 1;

export async function runCli(argv: string[]): Promise<CliResult> {
  const io = new MemoryIo();
  const program = createProgram(io);
  try {
    await program.parseAsync(['node', 'zdoc-localize', ...argv]);
    return io.result(0);
  } catch (error) {
    return io.failure(error);
  }
}
```

Add root scripts:

```json
{
  "zdoc-localize:build": "pnpm --filter zdoc-localize build",
  "zdoc-localize:test": "pnpm --filter zdoc-localize test",
  "zdoc-localize:check-skill": "node scripts/check-zdoc-localize-skill-compat.mjs"
}
```

Add `.zdoc-localize/` to `.gitignore`.

- [ ] **Step 4: Install dependencies and run the package test**

Run: `pnpm install`

Run: `pnpm --filter zdoc-localize test -- cli-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the scaffold**

```bash
git add pnpm-workspace.yaml package.json pnpm-lock.yaml .gitignore packages/zdoc-localize
git commit -m "feat(localize): scaffold localization CLI"
```

## Task 2: Add stable errors, canonical hashing, and run state transitions

**Files:**
- Create: `packages/zdoc-localize/src/domain/errors.ts`
- Create: `packages/zdoc-localize/src/domain/hash.ts`
- Create: `packages/zdoc-localize/src/domain/model.ts`
- Create: `packages/zdoc-localize/src/domain/state-machine.ts`
- Test: `packages/zdoc-localize/test/domain-foundation.test.ts`

- [ ] **Step 1: Write failing foundation tests**

```ts
import {describe, expect, it} from 'vitest';
import {canonicalHash} from '../src/domain/hash.js';
import {transitionRun} from '../src/domain/state-machine.js';
import {LocalizeError} from '../src/domain/errors.js';

it('hashes object keys canonically', () => {
  expect(canonicalHash({b: 2, a: 1})).toBe(canonicalHash({a: 1, b: 2}));
});

it('allows review_required to applying', () => {
  expect(transitionRun('review_required', 'applying')).toBe('applying');
});

it('rejects completed to applying', () => {
  expect(() => transitionRun('completed', 'applying')).toThrowError(LocalizeError);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- domain-foundation.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 3: Define the domain types and legal state graph**

Use discriminated unions for `SemanticNode`, `SemanticChange`, `PlanOperation`, and `RunState`. Define states exactly as:

```ts
export type RunState =
  | 'scanning'
  | 'classification_required'
  | 'translation_required'
  | 'review_required'
  | 'stale'
  | 'applying'
  | 'verifying'
  | 'completed'
  | 'blocked'
  | 'partial'
  | 'recovering';
```

`LocalizeError` carries `type`, `subtype`, `message`, `hint`, `retryable`, `details`, and mapped exit code. Canonical hashing recursively sorts object keys and preserves array order.

- [ ] **Step 4: Run foundation tests**

Run: `pnpm --filter zdoc-localize test -- domain-foundation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit domain foundations**

```bash
git add packages/zdoc-localize/src/domain packages/zdoc-localize/test/domain-foundation.test.ts
git commit -m "feat(localize): add domain state and error contracts"
```

## Task 3: Parse Feishu XML into a canonical semantic document

**Files:**
- Create: `packages/zdoc-localize/src/domain/xml-parser.ts`
- Create: `packages/zdoc-localize/src/domain/markdown-renderer.ts`
- Create: `packages/zdoc-localize/test/fixtures/source-baseline.xml`
- Create: `packages/zdoc-localize/test/fixtures/source-current.xml`
- Create: `packages/zdoc-localize/test/fixtures/target-current.xml`
- Test: `packages/zdoc-localize/test/xml-parser.test.ts`

- [ ] **Step 1: Add a representative XML fixture and failing parser test**

The fixture must contain a title, two heading levels, paragraphs, a list, inline code, a link, a callout, a code block, a table, an image, and block IDs.

```ts
const document = parseFeishuDocument(xml, {documentId: 'doc-en', revisionId: 12});
expect(document.title).toBe('Configure metrics');
expect(document.sections[0].headingPath).toEqual(['Overview']);
expect(document.nodes.find((node) => node.kind === 'image')?.writable).toBe(false);
expect(document.canonicalHash).toMatch(/^[a-f0-9]{64}$/);
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- xml-parser.test.ts`

Expected: FAIL because the parser is missing.

- [ ] **Step 3: Implement SAX parsing and canonical rendering**

Use `saxes` to build a small internal XML tree, then normalize it into semantic nodes. Strip `id` and volatile remote attributes from canonical hashes while retaining them in `remote` metadata. Treat tables, images, Whiteboards, Sheets, Base embeds, and synchronized references as non-writable opaque nodes.

The Markdown renderer is diagnostic only and must visibly mark unsupported nodes rather than omit them:

```md
<!-- unsupported:image block=blk_image token=img_token -->
```

- [ ] **Step 4: Run parser tests and typecheck**

Run: `pnpm --filter zdoc-localize test -- xml-parser.test.ts`

Run: `pnpm --filter zdoc-localize typecheck`

Expected: PASS.

- [ ] **Step 5: Commit semantic parsing**

```bash
git add packages/zdoc-localize/src/domain/xml-parser.ts packages/zdoc-localize/src/domain/markdown-renderer.ts packages/zdoc-localize/test
git commit -m "feat(localize): parse Feishu documents semantically"
```

## Task 4: Implement semantic diff and target alignment

**Files:**
- Create: `packages/zdoc-localize/src/domain/diff.ts`
- Create: `packages/zdoc-localize/src/domain/alignment.ts`
- Test: `packages/zdoc-localize/test/diff-alignment.test.ts`

- [ ] **Step 1: Write failing diff and alignment tests**

```ts
const changes = diffDocuments(baseline, current);
expect(changes.map((change) => change.kind)).toEqual(['replace', 'insert', 'delete']);

const aligned = alignChanges(changes, target, []);
expect(aligned[0]).toMatchObject({confidence: 'high', targetNodeId: 'zh-overview-p1'});
expect(aligned.find((item) => item.change.kind === 'insert')?.anchorNodeId).toBe('zh-overview-p2');
```

Add tests for heading rename, duplicate paragraph candidates, historical correspondence, move detection, and unsupported changed blocks.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- diff-alignment.test.ts`

Expected: FAIL with missing functions.

- [ ] **Step 3: Implement deterministic diffing and scored alignment**

Diff within normalized heading paths using longest-common-subsequence matching on node fingerprints, then classify unmatched nodes. Detect a move only when an identical fingerprint appears once in both documents under a different sibling position or section.

Alignment scoring:

```ts
const score =
  exactHistoricalMatch * 100 +
  exactHeadingPath * 40 +
  sameNodeKind * 20 +
  uniqueSiblingPosition * 10 +
  textSimilarity * 20;
```

Map `score >= 80` to high, `55..79` to medium, and lower scores or tied winners to low. Low confidence is a blocking result.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter zdoc-localize test -- diff-alignment.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit diff and alignment**

```bash
git add packages/zdoc-localize/src/domain/diff.ts packages/zdoc-localize/src/domain/alignment.ts packages/zdoc-localize/test/diff-alignment.test.ts
git commit -m "feat(localize): add semantic diff and alignment"
```

## Task 5: Add glossary resolution and the external translation protocol

**Files:**
- Create: `packages/zdoc-localize/src/domain/glossary.ts`
- Create: `packages/zdoc-localize/src/domain/translation.ts`
- Test: `packages/zdoc-localize/test/translation-protocol.test.ts`

- [ ] **Step 1: Write failing glossary and translation tests**

```ts
expect(resolveGlossary(entries, context).get('cluster')).toEqual({
  target: '集群',
  scopeType: 'product',
});

expect(() => resolveGlossary(conflictingEntries, context)).toThrowError(
  expect.objectContaining({type: 'configuration', subtype: 'glossary_conflict'}),
);

expect(validateTranslations(requests, responses)).toEqual([
  expect.objectContaining({operationId: 'op-1', translatedText: '更新后的说明'}),
]);
```

Include failures for missing operation IDs, unknown IDs, changed URLs, changed inline code, lost resource tokens, prohibited variants, and wrong node kind.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- translation-protocol.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement glossary priority and request validation**

Build each request with:

```ts
export interface TranslationRequest {
  operationId: string;
  changeKind: 'insert' | 'replace' | 'delete' | 'move';
  sourceBefore?: string;
  sourceAfter?: string;
  targetCurrent?: string;
  sectionContext: {source: string; target: string};
  glossary: ResolvedGlossaryTerm[];
  memoryExamples: TranslationMemoryExample[];
  preserved: PreservedToken[];
  linkMappings: LinkMapping[];
  targetNodeKind: WritableNodeKind;
}
```

Deletion operations require an explicit `{decision: 'delete'}` response rather than translated text. Move operations remain report-only in the first release and block executable plan completion.

- [ ] **Step 4: Run protocol tests**

Run: `pnpm --filter zdoc-localize test -- translation-protocol.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit translation protocol**

```bash
git add packages/zdoc-localize/src/domain/glossary.ts packages/zdoc-localize/src/domain/translation.ts packages/zdoc-localize/test/translation-protocol.test.ts
git commit -m "feat(localize): add glossary and translation protocol"
```

## Task 6: Compile and parse tamper-resistant review Markdown

**Files:**
- Create: `packages/zdoc-localize/src/domain/review.ts`
- Test: `packages/zdoc-localize/test/review.test.ts`

- [ ] **Step 1: Write failing review round-trip tests**

```ts
const review = compileReview(plan);
const edited = review.replace('建议中文', '人工修改后的中文');
const approved = parseReview(edited, plan);
expect(approved.operations[0].approvedText).toBe('人工修改后的中文');
```

Add tests that reject removed markers, duplicate operation IDs, reordered markers, unknown markers, edits to non-editable metadata, missing changes, and blank replacement text.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- review.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement protected review markers**

Use markers with a plan hash and operation ID:

```md
<!-- ZDOC-LOCALIZE PLAN sha256:<plan-hash> -->
<!-- BEGIN EDITABLE TRANSLATION op:<operation-id> -->
译文
<!-- END EDITABLE TRANSLATION op:<operation-id> -->
```

Hash all non-editable review segments and store the hashes in `plan.json`. Parsing must compare those segments exactly and return only approved text/decisions.

- [ ] **Step 4: Run review tests**

Run: `pnpm --filter zdoc-localize test -- review.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit review compiler**

```bash
git add packages/zdoc-localize/src/domain/review.ts packages/zdoc-localize/test/review.test.ts
git commit -m "feat(localize): add protected review artifacts"
```

## Task 7: Implement local configuration, snapshot bundles, and SQLite translation memory

**Files:**
- Create: `packages/zdoc-localize/src/application/ports.ts`
- Create: `packages/zdoc-localize/src/storage/config-store.ts`
- Create: `packages/zdoc-localize/src/storage/local-registry-store.ts`
- Create: `packages/zdoc-localize/src/storage/local-snapshot-store.ts`
- Create: `packages/zdoc-localize/src/storage/sqlite-translation-memory.ts`
- Test: `packages/zdoc-localize/test/storage.test.ts`

- [ ] **Step 1: Write failing storage contract tests**

Use a temporary directory and assert:

```ts
await registry.savePair(pair);
expect(await registry.getPair(pair.pairId)).toEqual(pair);

const reference = await snapshots.putBundle(runId, bundle);
expect(await snapshots.getBundle(reference)).toEqual(bundle);

await memory.recordApproved(entry);
expect(await memory.findExact(entry.sourceHash, entry.glossaryHash)).toEqual(entry);
```

Also verify immutable snapshot writes reject different bytes at an existing path and that unverified translations cannot be recorded.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- storage.test.ts`

Expected: FAIL.

- [ ] **Step 3: Define ports and implement local stores**

`RegistryStore` exposes pairs, glossary, runs, and successful receipt updates. `SnapshotStore` addresses bundles by SHA-256. `TranslationMemory` requires `verifiedRunId` when recording.

SQLite tables:

```sql
CREATE TABLE IF NOT EXISTS translation_memory (
  source_hash TEXT NOT NULL,
  target_locale TEXT NOT NULL,
  glossary_hash TEXT NOT NULL,
  heading_path TEXT NOT NULL,
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  pair_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  approved_at TEXT NOT NULL,
  PRIMARY KEY (source_hash, target_locale, glossary_hash, heading_path)
);
```

- [ ] **Step 4: Run storage tests**

Run: `pnpm --filter zdoc-localize test -- storage.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit local persistence**

```bash
git add packages/zdoc-localize/src/application/ports.ts packages/zdoc-localize/src/storage packages/zdoc-localize/test/storage.test.ts
git commit -m "feat(localize): add localization persistence"
```

## Task 8: Add safe subprocess and Feishu adapters

**Files:**
- Create: `packages/zdoc-localize/src/adapters/process-runner.ts`
- Create: `packages/zdoc-localize/src/adapters/lark-docs-adapter.ts`
- Create: `packages/zdoc-localize/src/adapters/lark-base-registry.ts`
- Create: `packages/zdoc-localize/src/adapters/lark-drive-snapshots.ts`
- Create: `packages/zdoc-localize/src/adapters/feishu-md-sync-adapter.ts`
- Test: `packages/zdoc-localize/test/adapters.test.ts`
- Fixtures: `packages/zdoc-localize/test/fixtures/lark-*.json`

- [ ] **Step 1: Write failing adapter contract tests with a fake process runner**

```ts
await docs.fetch('https://example.feishu.cn/docx/source', {detail: 'full'});
expect(fake.calls[0]).toEqual({
  executable: 'lark-cli',
  args: ['docs', '+fetch', '--doc', 'https://example.feishu.cn/docx/source', '--detail', 'full', '--format', 'json', '--as', 'user'],
  env: expect.objectContaining({LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1'}),
});
```

Test success envelopes, stderr error envelopes, exit `10`, `partial_success`, revision forwarding, no shell use, and version range parsing for `feishu-md-sync >=0.3.0 <0.4.0`.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- adapters.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement adapters against stable argv contracts**

The document adapter exposes `fetch`, `replaceBlock`, `insertAfter`, `deleteBlocks`, and `createDocument`. It must use XML for writes and pass `--revision-id` from the plan.

The Base and Drive adapters implement application ports through isolated command-builder functions. Keep every command builder separately unit-testable; do not concatenate shell strings.

- [ ] **Step 4: Run adapter tests**

Run: `pnpm --filter zdoc-localize test -- adapters.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit adapters**

```bash
git add packages/zdoc-localize/src/adapters packages/zdoc-localize/test/adapters.test.ts packages/zdoc-localize/test/fixtures/lark-*.json
git commit -m "feat(localize): add Feishu process adapters"
```

## Task 9: Implement bootstrap and planning workflows

**Files:**
- Create: `packages/zdoc-localize/src/application/workflows.ts`
- Create: `packages/zdoc-localize/src/application/runtime.ts`
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Test: `packages/zdoc-localize/test/planning-workflow.test.ts`

- [ ] **Step 1: Write failing end-to-end planning tests with local stores**

Test the sequence:

```ts
const bootstrapRun = await workflows.planBootstrap(pairId);
await workflows.acceptBootstrap(bootstrapRun.runId);
const planRun = await workflows.createPlan(pairId);
expect(planRun.state).toBe('translation_required');
expect(planRun.translationRequests).toHaveLength(3);
```

Add cases for no changes, excluded/independent modes, selective classification, low-confidence alignment, unsupported content, missing baseline, and glossary conflict.

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- planning-workflow.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement workflows and register commands**

Commands write all generated artifacts to `.zdoc-localize/runs/<run-id>/` and snapshot them through the configured store. `bootstrap accept` writes the first successful baseline without changing remote content. `plan create` always fetches current remote English and Chinese; it never trusts local Markdown.

CLI success results return paths and state:

```json
{
  "ok": true,
  "data": {
    "runId": "...",
    "state": "translation_required",
    "translationRequestsPath": ".zdoc-localize/runs/.../translation-requests.json"
  }
}
```

- [ ] **Step 4: Run planning tests and CLI help smoke test**

Run: `pnpm --filter zdoc-localize test -- planning-workflow.test.ts`

Run: `pnpm --filter zdoc-localize build && node packages/zdoc-localize/dist/cli/index.js --help`

Expected: tests pass and help lists all planned commands.

- [ ] **Step 5: Commit planning workflows**

```bash
git add packages/zdoc-localize/src/application packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/planning-workflow.test.ts
git commit -m "feat(localize): add bootstrap and planning workflows"
```

## Task 10: Complete plans, apply safe patches, verify, and recover

**Files:**
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Test: `packages/zdoc-localize/test/apply-workflow.test.ts`

- [ ] **Step 1: Write failing apply workflow tests**

Cover:

- `plan complete` creates `review.md` and state `review_required`.
- Edited review text is applied.
- Changed source revision returns `stale_plan` before writes.
- Changed target block hash returns `stale_plan` before writes.
- Replacement plus insertion re-fetches the affected section before the next structural write.
- `partial_success` yields `partial`, preserves the pre-write snapshot, and does not update the receipt.
- Successful verification updates the receipt and translation memory.
- Verification mismatch yields `verification_failed` and no receipt update.

```ts
expect(await workflows.apply(runId, reviewPath)).toMatchObject({state: 'completed'});
expect(registry.receipts).toHaveLength(1);
expect(memory.entries).toHaveLength(2);
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- apply-workflow.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement complete/apply/status/recovery orchestration**

Before writes, re-fetch both documents, compare source revision/hash and every target block hash, then save a pre-write target snapshot. Compile all review edits before the first write. Apply operations in document order, re-fetching after structural ID-invalidating operations. Verify affected semantic nodes and only then persist receipt/TM entries.

`recover inspect` is read-only. `recover reverse` emits `confirmation_required` unless invoked with the exact reviewed run confirmation token. `recover accept-current` starts a new scan and leaves the partial run unchanged.

- [ ] **Step 4: Run apply tests and the full package suite**

Run: `pnpm --filter zdoc-localize test -- apply-workflow.test.ts`

Run: `pnpm --filter zdoc-localize test`

Expected: PASS.

- [ ] **Step 5: Commit apply and recovery**

```bash
git add packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/apply-workflow.test.ts
git commit -m "feat(localize): apply and verify localization plans"
```

## Task 11: Create the Codex Skill and compatibility checker

**Files:**
- Create: `skills/zdoc-localization/SKILL.md`
- Create: `skills/zdoc-localization/references/workflow.md`
- Create: `skills/zdoc-localization/references/errors.md`
- Create: `scripts/check-zdoc-localize-skill-compat.mjs`
- Test: `packages/zdoc-localize/test/skill-compatibility.test.ts`

- [ ] **Step 1: Write a failing compatibility test**

The test loads the Skill metadata and asserts that the supported CLI range contains package version `0.1.0`, every referenced command exists in `capabilities`, and all write commands require an explicit approval stage in the Skill.

```ts
expect(report).toEqual({compatible: true, missingCommands: [], unsafeRoutes: []});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- skill-compatibility.test.ts`

Expected: FAIL because the Skill and checker are missing.

- [ ] **Step 3: Write the Skill and checker**

Skill frontmatter:

```yaml
---
name: zdoc-localization
version: 1.0.0
description: Localize registered ZDoc English Feishu documents into Chinese through the zdoc-localize CLI with document-level review and stale-safe block writes.
metadata:
  requires:
    bins: ["zdoc-localize", "lark-cli"]
---
```

The Skill must:

- Require CLI `>=0.1.0 <0.2.0`.
- Run version/capability/doctor checks.
- Route English publication to `feishu-md-sync`, not the localization CLI.
- Use CLI-generated translation requests and return structured translations.
- Present the review file and wait for explicit document-level approval.
- Never add confirmation flags automatically.
- Treat stale, partial, low-confidence, unsupported, and authentication outcomes according to structured error fields.
- Verify completion through CLI status and validation report.

- [ ] **Step 4: Run compatibility tests and checker**

Run: `pnpm --filter zdoc-localize test -- skill-compatibility.test.ts`

Run: `node scripts/check-zdoc-localize-skill-compat.mjs`

Expected: PASS and a JSON report with `compatible: true`.

- [ ] **Step 5: Commit the Skill**

```bash
git add skills/zdoc-localization scripts/check-zdoc-localize-skill-compat.mjs packages/zdoc-localize/test/skill-compatibility.test.ts
git commit -m "feat(localize): add Codex localization skill"
```

## Task 12: Package smoke test, documentation, and validation report generation

**Files:**
- Create: `packages/zdoc-localize/README.md`
- Create: `packages/zdoc-localize/scripts/package-smoke.mjs`
- Create: `packages/zdoc-localize/src/application/validation-report.ts`
- Modify: `packages/zdoc-localize/package.json`
- Modify: `package.json`
- Test: `packages/zdoc-localize/test/validation-report.test.ts`

- [ ] **Step 1: Write a failing validation report test**

```ts
const report = buildValidationReport(results);
expect(report.summary).toEqual({passed: 8, failed: 0, skipped: 1});
expect(report.checks.find((check) => check.id === 'live-feishu-write')).toMatchObject({
  status: 'skipped',
  reason: 'No production pair or registry target configured',
});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm --filter zdoc-localize test -- validation-report.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement report generation and package smoke test**

The package smoke script must pack the package, install it in a temporary directory, run `--version`, `capabilities --format json`, `doctor --offline --format json`, and validate the Skill compatibility script against the packed executable.

README sections must cover architecture, setup, command examples, local/offline mode, shared Feishu configuration, review/apply safety, recovery, version compatibility, and live-test opt-in.

- [ ] **Step 4: Run complete validation**

Run:

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
```

Expected: all commands pass. Live Feishu checks are reported as skipped unless explicit test targets are configured.

- [ ] **Step 5: Commit documentation and validation tooling**

```bash
git add packages/zdoc-localize package.json pnpm-lock.yaml scripts/check-zdoc-localize-skill-compat.mjs
git commit -m "docs(localize): add package and validation guidance"
```

## Task 13: Final self-review and branch validation

**Files:**
- Modify only files required by findings from the checks below.

- [ ] **Step 1: Check plan/spec coverage in the implementation**

Compare the diff against `docs/superpowers/specs/2026-07-15-zdoc-localization-agent-design.md`. Confirm every first-slice requirement has a corresponding module, test, or explicitly skipped live validation.

- [ ] **Step 2: Run repository safety checks**

Run:

```bash
git diff --check cedf3d26a..HEAD
git status --short
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
```

Expected: clean diff checks, no uncommitted generated artifacts, and all CLI/Skill checks pass.

- [ ] **Step 3: Inspect package contents**

Run: `pnpm --filter zdoc-localize pack --pack-destination /tmp/zdoc-localize-pack`

Expected: archive contains `dist`, `README.md`, and package metadata, and excludes tests, local runs, SQLite files, and secrets.

- [ ] **Step 4: Write the final validation report**

Generate `.zdoc-localize/validation/final-report.json` and summarize it for the user with separate sections for automated tests, package/Skill compatibility, live Feishu checks, and remaining operational setup.

- [ ] **Step 5: Commit any final corrections**

If self-review required changes:

```bash
git add <only-the-corrected-files>
git commit -m "fix(localize): address final validation findings"
```

If no corrections are needed, do not create an empty commit.
