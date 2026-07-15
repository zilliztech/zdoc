import {mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import type {
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
} from '../src/application/ports.js';
import {LocalizationWorkflows} from '../src/application/workflows.js';
import type {FetchedDocument, WriteInput, WriteResult} from '../src/adapters/lark-docs-adapter.js';
import {LocalizeError} from '../src/domain/errors.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

class MemoryTranslationMemory implements TranslationMemory {
  readonly entries: TranslationMemoryEntry[] = [];
  async recordApproved(entry: TranslationMemoryEntry): Promise<void> { this.entries.push(entry); }
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return undefined; }
  async close(): Promise<void> {}
}

class WritableDocs {
  readonly documents = new Map<string, FetchedDocument>();
  readonly writes: string[] = [];
  failAtWrite?: number;
  corruptWrites = false;

  async fetch(doc: string): Promise<FetchedDocument> {
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return {...result};
  }

  async replaceBlock(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    return this.write(input.doc, `replace:${input.blockId}`, (content) =>
      replaceBlock(content, input.blockId, this.corruptWrites ? '<p>错误内容</p>' : input.xml),
    );
  }

  async insertAfter(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    return this.write(input.doc, `insert:${input.blockId}`, (content) =>
      insertAfter(content, input.blockId, this.corruptWrites ? '<p>错误内容</p>' : input.xml),
    );
  }

  async deleteBlocks(input: WriteInput & {blockIds: string[]}): Promise<WriteResult> {
    return this.write(input.doc, `delete:${input.blockIds.join(',')}`, (content) =>
      input.blockIds.reduce((value, blockId) => removeBlock(value, blockId), content),
    );
  }

  private async write(doc: string, label: string, mutate: (content: string) => string): Promise<WriteResult> {
    this.writes.push(label);
    if (this.failAtWrite === this.writes.length) {
      throw new LocalizeError({type: 'partial_write', subtype: 'fake_partial', message: 'Fake partial write.'});
    }
    const current = this.documents.get(doc)!;
    const revisionId = current.revisionId + 1;
    this.documents.set(doc, {...current, revisionId, content: mutate(current.content)});
    return {revisionId, updatedBlocksCount: 1, warnings: []};
  }
}

function blockPattern(blockId: string): RegExp {
  return new RegExp(`<([a-zA-Z0-9_]+)([^>]*\\sid="${blockId}"[^>]*)>[\\s\\S]*?<\\/\\1>`);
}

function withId(xml: string, blockId: string): string {
  return xml.replace(/^<([a-zA-Z0-9_]+)/, `<$1 id="${blockId}"`);
}

function replaceBlock(content: string, blockId: string, xml: string): string {
  return content.replace(blockPattern(blockId), withId(xml, blockId));
}

function insertAfter(content: string, blockId: string, xml: string): string {
  return content.replace(blockPattern(blockId), (match) => `${match}\n${withId(xml, `new-${blockId}`)}`);
}

function removeBlock(content: string, blockId: string): string {
  return content.replace(blockPattern(blockId), '');
}

async function preparedWorkflow(options: {failAtWrite?: number; corruptWrites?: boolean} = {}) {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-apply-'));
  const [baselineXml, currentXmlRaw, targetXml] = await Promise.all([
    readFile(fixture('source-baseline.xml'), 'utf8'),
    readFile(fixture('source-current.xml'), 'utf8'),
    readFile(fixture('target-current.xml'), 'utf8'),
  ]);
  const currentXml = `${currentXmlRaw}<img id="image-current" token="img-token" name="metrics.png"/>\n`;
  const docs = new WritableDocs();
  docs.failAtWrite = options.failAtWrite;
  docs.corruptWrites = options.corruptWrites ?? false;
  docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: baselineXml});
  docs.documents.set('target-url', {documentId: 'target', revisionId: 10, content: targetXml});
  const registry = new LocalRegistryStore(cwd);
  const snapshots = new LocalSnapshotStore(cwd);
  const memory = new MemoryTranslationMemory();
  await registry.savePair({
    pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
    targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
  });
  let id = 0;
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots, memory, docs,
    clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
    ids: {next: () => `run-${++id}`},
  });
  const bootstrap = await workflows.planBootstrap('pair-1');
  await workflows.acceptBootstrap(bootstrap.runId);
  docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
  const created = await workflows.createPlan('pair-1');
  const responses = created.translationRequests.map((request) => {
    if (request.sourceAfter?.includes('metrics and alerts')) {
      return {operationId: request.operationId, translatedText: '使用 Zilliz Cloud 和 `Prometheus` 监控指标和告警。', targetNodeKind: request.targetNodeKind};
    }
    if (request.sourceAfter?.includes('Copy the endpoint')) {
      return {operationId: request.operationId, translatedText: '- 打开[控制台](https://example.com/console)。\n- 创建集成。\n- 复制端点。', targetNodeKind: request.targetNodeKind};
    }
    return {operationId: request.operationId, translatedText: '保存集成后，检查告警发送情况。', targetNodeKind: request.targetNodeKind};
  });
  const completed = await workflows.completePlan(created.runId, responses);
  return {cwd, docs, registry, memory, workflows, created, completed};
}

describe('plan completion and apply', () => {
  it('applies an approved document, re-fetches, verifies, and advances the receipt', async () => {
    const context = await preparedWorkflow();
    const absoluteReviewPath = join(context.cwd, context.completed.reviewPath);
    const review = await readFile(absoluteReviewPath, 'utf8');
    await writeFile(absoluteReviewPath, review.replace('检查告警发送情况', '确认告警发送情况'), 'utf8');

    const result = await context.workflows.apply(context.created.runId, context.completed.reviewPath);

    expect(result.state).toBe('completed');
    expect(context.docs.writes).toHaveLength(3);
    expect(context.memory.entries).toHaveLength(3);
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2, runId: context.created.runId});
    expect(context.docs.documents.get('target-url')?.content).toContain('确认告警发送情况');
  });

  it('invalidates the plan before writes when the English revision changes', async () => {
    const context = await preparedWorkflow();
    const source = context.docs.documents.get('source-url')!;
    context.docs.documents.set('source-url', {...source, revisionId: 3, content: `${source.content}<p id="late">Late edit</p>`});

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'stale_plan',
      subtype: 'source_changed',
    });
    expect(context.docs.writes).toHaveLength(0);
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('stale');
  });

  it('records a partial run without advancing the receipt', async () => {
    const context = await preparedWorkflow({failAtWrite: 2});
    const receiptBefore = await context.registry.getReceipt('pair-1');

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'partial_write',
    });

    expect((await context.registry.getRun(context.created.runId))?.state).toBe('partial');
    expect(await context.registry.getReceipt('pair-1')).toEqual(receiptBefore);
    expect(await context.workflows.inspectRecovery(context.created.runId)).toMatchObject({
      state: 'partial',
      appliedOperations: 1,
    });
  });

  it('does not advance the receipt when readback verification fails', async () => {
    const context = await preparedWorkflow({corruptWrites: true});

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'verification_failed',
    });
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('blocked');
  });
});
