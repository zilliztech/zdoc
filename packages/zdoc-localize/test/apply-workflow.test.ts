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
  failWrites = false;
  async recordApproved(entry: TranslationMemoryEntry): Promise<void> {
    if (this.failWrites) throw new Error('translation memory unavailable');
    this.entries.push(entry);
  }
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return undefined; }
  async close(): Promise<void> {}
}

class FailOnceReceiptRegistry extends LocalRegistryStore {
  failNextReceipt = false;
  failPendingRun = false;
  failCreatedRun = false;
  override async saveReceipt(receipt: Parameters<LocalRegistryStore['saveReceipt']>[0]): Promise<void> {
    if (this.failNextReceipt) {
      this.failNextReceipt = false;
      throw new Error('registry temporarily unavailable');
    }
    await super.saveReceipt(receipt);
  }
  override async saveRun(run: Parameters<LocalRegistryStore['saveRun']>[0]): Promise<void> {
    if (this.failPendingRun && run.state === 'verifying' && run.metadata?.pendingReceipt) {
      this.failPendingRun = false;
      throw new Error('pending receipt metadata unavailable');
    }
    if (this.failCreatedRun && run.state === 'verifying' && run.metadata?.createdDocumentId) {
      this.failCreatedRun = false;
      throw new Error('created document registry unavailable');
    }
    await super.saveRun(run);
  }
}

class WritableDocs {
  readonly documents = new Map<string, FetchedDocument>();
  readonly writes: string[] = [];
  failAtWrite?: number;
  failureSubtype = 'fake_partial';
  corruptWrites = false;
  corruptCreates = false;
  misrouteFirstReplace = false;
  readonly creates: Array<{title: string; parentToken?: string; xml: string}> = [];

  async fetch(doc: string): Promise<FetchedDocument> {
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return {...result};
  }

  async replaceBlock(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    const blockId = this.misrouteFirstReplace && this.writes.length === 0 ? 'zh-overview-h1' : input.blockId;
    return this.write(input.doc, `replace:${input.blockId}`, (content) =>
      replaceBlock(content, blockId, this.corruptWrites ? '<p>错误内容</p>' : input.xml),
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

  async createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{documentId: string; revisionId: number}> {
    this.creates.push(input);
    const body = this.corruptCreates ? '<p>corrupt creation</p>' : input.xml;
    this.documents.set('created-target', {documentId: 'created-target', revisionId: 1, content: `<title>${input.title}</title>${body}`});
    return {documentId: 'created-target', revisionId: 1};
  }

  protected async write(doc: string, label: string, mutate: (content: string) => string): Promise<WriteResult> {
    this.writes.push(label);
    if (this.failAtWrite === this.writes.length) {
      throw new LocalizeError({type: 'partial_write', subtype: this.failureSubtype, message: 'Fake partial write.'});
    }
    const current = this.documents.get(doc)!;
    const revisionId = current.revisionId + 1;
    this.documents.set(doc, {...current, revisionId, content: mutate(current.content)});
    return {revisionId, updatedBlocksCount: 1, warnings: []};
  }
}

class LiveListDocs extends WritableDocs {
  override async insertAfter(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    let item = 0;
    const liveXml = input.xml.replace(/<li>/g, () => `<li id="live-list-${++item}">`);
    return this.write(input.doc, `insert:${input.blockId}`, (content) =>
      content.replace(blockPattern(input.blockId), (match) => `${match}\n${liveXml}`),
    );
  }

  override async deleteBlocks(input: WriteInput & {blockIds: string[]}): Promise<WriteResult> {
    return this.write(input.doc, `delete:${input.blockIds.join(',')}`, (content) =>
      input.blockIds
        .reduce((value, blockId) => removeBlock(value, blockId), content)
        .replace(/<(ol|ul)>\s*<\/\1>/g, ''),
    );
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

async function preparedWorkflow(options: {failAtWrite?: number; corruptWrites?: boolean; misrouteFirstReplace?: boolean; failMemory?: boolean; failReceipt?: boolean; failPendingRun?: boolean; secondInsertion?: boolean} = {}) {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-apply-'));
  const [baselineXml, currentXmlRaw, targetXml] = await Promise.all([
    readFile(fixture('source-baseline.xml'), 'utf8'),
    readFile(fixture('source-current.xml'), 'utf8'),
    readFile(fixture('target-current.xml'), 'utf8'),
  ]);
  const withOptionalInsertion = options.secondInsertion
    ? currentXmlRaw.replace(
      '<p id="p-alerts-new">Review alert delivery after saving the integration.</p>',
      '<p id="p-alerts-new">Review alert delivery after saving the integration.</p><p id="p-alerts-followup">Confirm alerts in the dashboard.</p>',
    )
    : currentXmlRaw;
  const currentXml = `${withOptionalInsertion}<img id="image-current" token="img-token" name="metrics.png"/>\n`;
  const docs = new WritableDocs();
  docs.failAtWrite = options.failAtWrite;
  docs.corruptWrites = options.corruptWrites ?? false;
  docs.misrouteFirstReplace = options.misrouteFirstReplace ?? false;
  docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: baselineXml});
  docs.documents.set('target-url', {documentId: 'target', revisionId: 10, content: targetXml});
  const registry = options.failReceipt || options.failPendingRun ? new FailOnceReceiptRegistry(cwd) : new LocalRegistryStore(cwd);
  const snapshots = new LocalSnapshotStore(cwd);
  const memory = new MemoryTranslationMemory();
  memory.failWrites = options.failMemory ?? false;
  await registry.savePair({
    pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
    targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
  });
  await registry.savePair({
    pairId: 'pair-console', sourceLocale: 'en', targetLocale: 'zh-CN',
    sourceDocUrl: 'https://example.com/console', targetDocUrl: 'https://cn.example.com/console',
    mode: 'mirror', status: 'active',
  });
  let id = 0;
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots, memory, docs,
    clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
    ids: {next: () => `run-${++id}`},
  });
  const bootstrap = await workflows.planBootstrap('pair-1');
  await workflows.acceptBootstrap(bootstrap.runId);
  if (registry instanceof FailOnceReceiptRegistry) {
    registry.failNextReceipt = options.failReceipt ?? false;
    registry.failPendingRun = options.failPendingRun ?? false;
  }
  docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
  const created = await workflows.createPlan('pair-1');
  const responses = created.translationRequests.map((request) => {
    if (request.changeKind === 'delete') {
      return {operationId: request.operationId, decision: 'delete' as const};
    }
    if (request.sourceAfter?.includes('metrics and alerts')) {
      return {operationId: request.operationId, translatedText: '使用 **Zilliz Cloud** 和 `Prometheus` 监控指标和告警。', targetNodeKind: request.targetNodeKind};
    }
    if (request.sourceAfter?.includes('Copy the endpoint')) {
      return {operationId: request.operationId, translatedText: '1. 打开[控制台](https://cn.example.com/console)。\n2. 创建集成。\n3. 复制端点。', targetNodeKind: request.targetNodeKind};
    }
    if (request.sourceAfter?.includes('Confirm alerts')) {
      return {operationId: request.operationId, translatedText: '然后在控制面板中确认告警。', targetNodeKind: request.targetNodeKind};
    }
    return {operationId: request.operationId, translatedText: '保存集成后，检查告警发送情况。', targetNodeKind: request.targetNodeKind};
  });
  const completed = await workflows.completePlan(created.runId, responses);
  return {cwd, docs, registry, snapshots, memory, workflows, created, completed};
}

async function preparedLiveListWorkflow(failAtWrite?: number) {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-live-list-recovery-'));
  const docs = new LiveListDocs();
  docs.failAtWrite = failAtWrite;
  docs.documents.set('source-url', {
    documentId: 'source', revisionId: 1,
    content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2">Review the proposed Chinese changes.</li></ol><ul><li id="en-bullet-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-bullet-2">Apply only approved block-level writes.</li></ul>',
  });
  docs.documents.set('target-url', {
    documentId: 'target', revisionId: 3,
    content: '<h1 id="zh-workflow">工作流程</h1><ol><li id="zh-step-1" seq="1">扫描远端英文文档。</li><li id="zh-step-2">审核建议的中文变更。</li></ol><ul><li id="zh-bullet-1">保留 URL 和内联 <code>commands</code>。</li><li id="zh-bullet-2">仅应用已批准的块级写入。</li></ul>',
  });
  const registry = new LocalRegistryStore(cwd);
  await registry.savePair({
    pairId: 'pair-list', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
    targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
  });
  let id = 0;
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
    clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => `run-list-${++id}`},
  });
  const bootstrap = await workflows.planBootstrap('pair-list');
  await workflows.acceptBootstrap(bootstrap.runId);
  docs.documents.set('source-url', {
    documentId: 'source', revisionId: 2,
    content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2-new">Review the proposed Chinese changes.<ul><li id="en-child-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-child-2">Apply only approved block-level writes.</li></ul></li></ol>',
  });
  const created = await workflows.createPlan('pair-list');
  const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => request.changeKind === 'delete'
    ? {operationId: request.operationId, decision: 'delete'}
    : {
        operationId: request.operationId,
        translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL 和内联 `commands`。\n   - 仅应用已批准的块级写入。',
        targetNodeKind: request.targetNodeKind,
      }));
  return {cwd, docs, registry, workflows, created, completed};
}

describe('plan completion and apply', () => {
  it('applies a live Feishu flat-to-nested list change with atomic list-item groups', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-live-list-'));
    const docs = new LiveListDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2">Review the proposed Chinese changes.</li></ol><ul><li id="en-bullet-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-bullet-2">Apply only approved block-level writes.</li></ul>',
    });
    docs.documents.set('target-url', {
      documentId: 'target', revisionId: 3,
      content: '<h1 id="zh-workflow">工作流程</h1><ol><li id="zh-step-1" seq="1">扫描远端英文文档。</li><li id="zh-step-2">审核建议的中文变更。</li></ol><ul><li id="zh-bullet-1">保留 URL 和内联 <code>commands</code>。</li><li id="zh-bullet-2">仅应用已批准的块级写入。</li></ul>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-list', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    let id = 0;
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => `run-list-${++id}`},
    });
    const bootstrap = await workflows.planBootstrap('pair-list');
    await workflows.acceptBootstrap(bootstrap.runId);
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 2,
      content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2-new">Review the proposed Chinese changes.<ul><li id="en-child-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-child-2">Apply only approved block-level writes.</li></ul></li></ol>',
    });
    const created = await workflows.createPlan('pair-list');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => request.changeKind === 'delete'
      ? {operationId: request.operationId, decision: 'delete'}
      : {
          operationId: request.operationId,
          translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL 和内联 `commands`。\n   - 仅应用已批准的块级写入。',
          targetNodeKind: request.targetNodeKind,
        }));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).resolves.toMatchObject({state: 'completed'});
    expect(docs.writes).toEqual([
      'delete:zh-step-1,zh-step-2',
      'insert:zh-workflow',
      'delete:zh-bullet-1,zh-bullet-2',
    ]);
    expect(docs.documents.get('target-url')?.content).toContain('<ol><li id="live-list-1">扫描远端英文文档。</li><li id="live-list-2">审核建议的中文变更。<ul><li id="live-list-3">保留 URL 和内联 <code>commands</code>。</li><li id="live-list-4">仅应用已批准的块级写入。</li></ul></li></ol>');
  });

  it('previews reversal of every top-level block created by a partial nested-list apply', async () => {
    const context = await preparedLiveListWorkflow(3);
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write',
    });

    const reverse = await context.workflows.previewReverse(context.created.runId);

    expect(reverse.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({kind: 'delete', blockIds: ['live-list-1', 'live-list-2']}),
    ]));
  });

  it('creates a missing Chinese document only after full review and preview approval', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-'));
    const docs = new WritableDocs();
    docs.documents.set('https://example.feishu.cn/docx/source', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><h1 id="h1">Start</h1><p id="p1">Run `curl`.</p><pre id="code"><code>curl</code></pre>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'https://example.feishu.cn/docx/source',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });

    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? '配置' : request.targetNodeKind === 'heading' ? '开始' : '运行 `curl`。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);
    expect(preview.creationDraftXml).toContain('<pre><code>curl</code></pre>');
    const result = await workflows.apply(created.runId, completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(docs.creates).toHaveLength(1);
    expect(docs.creates[0]?.xml).toContain('<pre><code>curl</code></pre>');
    expect(await registry.getPair('new-pair')).toMatchObject({
      targetDocUrl: 'https://example.feishu.cn/docx/created-target', targetDocToken: 'created-target', status: 'active',
    });
    expect(await registry.getReceipt('new-pair')).toMatchObject({sourceRevision: 1, targetRevision: 1});
  });

  it('records creation verification failures in typed run fields', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-mismatch-'));
    const docs = new WritableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><p id="p1">Run <code>curl</code>.</p>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create-mismatch'},
    });
    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? '配置' : '运行 `curl`。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);
    docs.corruptCreates = true;

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed', subtype: 'created_document_mismatch',
    });
    expect(await registry.getRun(created.runId)).toMatchObject({
      state: 'partial', errorType: 'created_document_mismatch',
    });
  });

  it('recovers a created document ID from the local journal when registry persistence fails', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-journal-'));
    const docs = new WritableDocs();
    docs.documents.set('https://example.feishu.cn/docx/source', {
      documentId: 'source', revisionId: 1, content: '<title id="title">Setup</title><p id="p1">Run `curl`.</p>',
    });
    const registry = new FailOnceReceiptRegistry(cwd);
    registry.failCreatedRun = true;
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'https://example.feishu.cn/docx/source',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });
    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId, translatedText: request.targetNodeKind === 'title' ? '配置' : '运行 `curl`。', targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).rejects.toThrow('created document registry unavailable');
    expect((await registry.getRun(created.runId))?.state).toBe('applying');

    await expect(workflows.finalizeVerified(created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getPair('new-pair')).toMatchObject({targetDocToken: 'created-target'});
  });

  it('applies an approved document, re-fetches, verifies, and advances the receipt', async () => {
    const context = await preparedWorkflow();
    const absoluteReviewPath = join(context.cwd, context.completed.reviewPath);
    const review = await readFile(absoluteReviewPath, 'utf8');
    await writeFile(absoluteReviewPath, review.replace('检查告警发送情况', '确认告警发送情况'), 'utf8');

    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const result = await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(context.docs.writes).toHaveLength(4);
    expect(context.memory.entries).toHaveLength(3);
    const receipt = await context.registry.getReceipt('pair-1');
    expect(receipt).toMatchObject({sourceRevision: 2, runId: context.created.runId});
    const baseline = await context.snapshots.getBundle(receipt!.sourceSnapshotRef);
    expect(baseline.files).toMatchObject({
      'source.semantic.json': expect.any(String),
      'source.md': expect.stringContaining('# Overview'),
      'target.semantic.json': expect.any(String),
      'target.md': expect.any(String),
    });
    expect(context.docs.documents.get('target-url')?.content).toContain('确认告警发送情况');
    expect(context.docs.documents.get('target-url')?.content).toContain('复制端点');
  });

  it('requires the exact preview token before any write', async () => {
    const context = await preparedWorkflow();

    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    expect(preview).toMatchObject({
      sourceRevision: 2,
      targetRevision: 10,
      sourceHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      targetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      operations: expect.arrayContaining([
        expect.objectContaining({approvedText: expect.any(String), compiledXml: expect.stringContaining('<')}),
      ]),
    });

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'apply_approval_token_required',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('chains consecutive insertions so their approved source order is preserved', async () => {
    const context = await preparedWorkflow({secondInsertion: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    const content = context.docs.documents.get('target-url')!.content;
    expect(content.indexOf('保存集成后，检查告警发送情况')).toBeLessThan(content.indexOf('然后在控制面板中确认告警'));
  });

  it('invalidates the plan before writes when the English revision changes', async () => {
    const context = await preparedWorkflow();
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const source = context.docs.documents.get('source-url')!;
    context.docs.documents.set('source-url', {...source, revisionId: 3, content: `${source.content}<p id="late">Late edit</p>`});

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'stale_plan',
      subtype: 'source_changed',
    });
    expect(context.docs.writes).toHaveLength(0);
    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'stale',
      errorType: 'source_changed',
      errorDetail: expect.objectContaining({subtype: 'source_changed'}),
    });
  });

  it('invalidates the plan before writes when a planned target block ID is rebound', async () => {
    const context = await preparedWorkflow();
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const target = context.docs.documents.get('target-url')!;
    context.docs.documents.set('target-url', {
      ...target,
      content: target.content.replace('id="zh-overview-p1"', 'id="rebound-overview-p1"'),
    });

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'target_block_changed',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('revalidates preserved tokens after a human edits the review', async () => {
    const context = await preparedWorkflow();
    const absoluteReviewPath = join(context.cwd, context.completed.reviewPath);
    const review = await readFile(absoluteReviewPath, 'utf8');
    await writeFile(absoluteReviewPath, review.replace('https://cn.example.com/console', '#'), 'utf8');

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'validation',
      subtype: 'internal_link_not_localized',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('records a partial run without advancing the receipt', async () => {
    const context = await preparedWorkflow({failAtWrite: 2});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const receiptBefore = await context.registry.getReceipt('pair-1');

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write',
    });

    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'partial',
      errorType: 'fake_partial',
      errorDetail: expect.objectContaining({subtype: 'fake_partial'}),
    });
    expect(await context.registry.getReceipt('pair-1')).toEqual(receiptBefore);
    const inspection = await context.workflows.inspectRecovery(context.created.runId);
    expect(inspection).toMatchObject({
      state: 'partial',
      appliedOperations: 1,
      safeToRecover: true,
      currentTargetHashMatchesLastVerified: true,
      recoveryToken: expect.any(String),
    });
    await expect(context.workflows.restartFromCurrent(context.created.runId)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'partial_recovery_required',
    });
    const reversePreview = await context.workflows.previewReverse(context.created.runId);
    expect(reversePreview.operations).toHaveLength(1);
    await context.workflows.reversePartial(context.created.runId, reversePreview.approvalToken);
    expect(context.docs.documents.get('target-url')?.content).toContain('监控指标。</p>');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('blocked');
  });

  it('records the latest error subtype when reverse recovery fails', async () => {
    const context = await preparedWorkflow({failAtWrite: 2});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken))
      .rejects.toMatchObject({subtype: 'fake_partial'});
    const reverse = await context.workflows.previewReverse(context.created.runId);
    context.docs.failureSubtype = 'fake_reverse';
    context.docs.failAtWrite = 3;

    await expect(context.workflows.reversePartial(context.created.runId, reverse.approvalToken))
      .rejects.toMatchObject({subtype: 'fake_reverse'});
    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'partial',
      errorType: 'fake_reverse',
    });
  });

  it('does not advance the receipt when readback verification fails', async () => {
    const context = await preparedWorkflow({corruptWrites: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed',
    });
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('partial');
  });

  it('rejects a write that places approved text in the wrong block', async () => {
    const context = await preparedWorkflow({misrouteFirstReplace: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed', subtype: 'operation_progression_mismatch',
    });
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 1});
  });

  it('treats translation-memory persistence as rebuildable after verified remote writes', async () => {
    const context = await preparedWorkflow({failMemory: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    const result = await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
    expect((await context.registry.getRun(context.created.runId))?.metadata).toMatchObject({translationMemoryWarning: expect.any(String)});
  });

  it('can idempotently finalize a verified write after a transient receipt failure', async () => {
    const context = await preparedWorkflow({failReceipt: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('registry temporarily unavailable');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('verifying');

    await expect(context.workflows.finalizeVerified(context.created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
  });

  it('reconstructs finalization when persisting pending receipt metadata itself fails', async () => {
    const context = await preparedWorkflow({failPendingRun: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('pending receipt metadata unavailable');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('verifying');
    const source = context.docs.documents.get('source-url')!;
    context.docs.documents.set('source-url', {...source, revisionId: 3, content: `${source.content}<p id="later">Later source edit</p>`});

    await expect(context.workflows.finalizeVerified(context.created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
  });

  it('refuses reconstructed finalization after an unrelated target edit', async () => {
    const context = await preparedWorkflow({failPendingRun: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('pending receipt metadata unavailable');
    const target = context.docs.documents.get('target-url')!;
    context.docs.documents.set('target-url', {...target, revisionId: target.revisionId + 1, content: `${target.content}<p id="human">人工编辑</p>`});

    await expect(context.workflows.finalizeVerified(context.created.runId)).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'finalization_target_changed',
    });
  });
});
