import {readFile, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createDocumentSnapshot,
  type DocumentSelector,
  type DocumentSnapshot,
  type ProviderBlock,
} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import type {
  LocalizationDocxEngine,
  SnapshotReference,
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
  WhiteboardGateway,
} from '../src/application/ports.js';
import {LocalizationWorkflows} from '../src/application/workflows.js';
import type {FetchedDocument} from '../src/adapters/lark-docs-adapter.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';
import {canonicalWhiteboard} from '../src/domain/whiteboard.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

class MemoryTranslationMemory implements TranslationMemory {
  readonly entries: TranslationMemoryEntry[] = [];
  constructor(private readonly example?: TranslationMemoryEntry) {}
  async recordApproved(entry: TranslationMemoryEntry): Promise<void> { this.entries.push(entry); }
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return this.example; }
  async close(): Promise<void> {}
}

class MutableDocs {
  readonly documents = new Map<string, FetchedDocument>();
  readonly fetches: string[] = [];
  async fetch(doc: string): Promise<FetchedDocument> {
    this.fetches.push(doc);
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return result;
  }
}

class MemoryEngine implements LocalizationDocxEngine {
  readonly documents = new Map<string, DocumentSnapshot>();
  readonly requests: DocumentSelector[] = [];
  async snapshot(selector: DocumentSelector): Promise<DocumentSnapshot> {
    this.requests.push(selector);
    const key = selector.kind === 'url' ? selector.url : selector.token;
    const result = this.documents.get(key);
    if (!result) throw new Error(`Missing fake engine document ${key}`);
    return result;
  }
  prepare(): never { throw new Error('not used'); }
  async apply(): Promise<never> { throw new Error('not used'); }
  async assessRecovery(): Promise<never> { throw new Error('not used'); }
}

function engineSnapshot(
  documentId: string,
  revision: string,
  title: string,
  children: ProviderBlock[] = [],
): DocumentSnapshot {
  return createDocumentSnapshot({
    documentId,
    revision,
    blocks: [{
      block_id: documentId,
      block_type: 1,
      page: {elements: [{text_run: {content: title, text_element_style: {}}}]},
      children: children
        .filter((child) => child.parent_id === documentId)
        .map((child) => child.block_id as string),
    }, ...children],
  });
}

async function supportedHuggingFaceSnapshot(): Promise<DocumentSnapshot> {
  const stored = JSON.parse(await readFile(
    fixture('hugging-face-source-snapshot.json'),
    'utf8',
  )) as DocumentSnapshot;
  const omitted = new Set([
    'note-callout',
    'callout-title',
    'callout-body',
    'synced-reference',
    'unknown-block',
  ]);
  const kept = stored.nodes.filter((node) => !omitted.has(node.blockId));
  const embedded = new Set(kept.flatMap((node) => (
    Array.isArray(node.raw.children)
      ? node.raw.children.flatMap((child) => typeof child === 'object' && child && 'block_id' in child
          ? [String(child.block_id)]
          : [])
      : []
  )));
  const blocks = kept
    .filter((node) => !embedded.has(node.blockId))
    .map((node) => structuredClone(node.raw) as ProviderBlock);
  const root = blocks.find((block) => block.block_id === stored.rootBlockId)!;
  root.children = (root.children ?? []).filter((blockId) => !omitted.has(blockId));
  return createDocumentSnapshot({
    documentId: stored.documentId,
    revision: stored.revision,
    blocks,
  });
}

class MemoryWhiteboards implements WhiteboardGateway {
  readonly values = new Map<string, unknown>();
  async queryRaw(token: string): Promise<unknown> { return this.values.get(token); }
  async overwriteRaw(input: {token: string; raw: unknown}): Promise<void> {
    this.values.set(input.token, structuredClone(input.raw));
  }
}

describe('bootstrap and planning workflows', () => {
  it('accepts an unchanged engine-backed bootstrap without crossing hash domains', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-bootstrap-'));
    const docs = new MutableDocs();
    const engine = new MemoryEngine();
    engine.documents.set('source-url', engineSnapshot('source', '44', 'Guide', [{
      block_id: 'source-body', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'English body.', text_element_style: {}}}]},
    }]));
    engine.documents.set('target-url', engineSnapshot('target', '4', '指南', [{
      block_id: 'target-body', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '中文正文。', text_element_style: {}}}]},
    }]));
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-engine-bootstrap', sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror',
      status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(),
      engine, docs, clock: {now: () => new Date('2026-07-16T00:00:00.000Z')},
      ids: {next: () => 'run-engine-bootstrap'},
    });

    const planned = await workflows.planBootstrap('pair-engine-bootstrap');
    await expect(workflows.acceptBootstrap(planned.runId)).resolves.toBeUndefined();

    expect(await registry.getReceipt('pair-engine-bootstrap')).toMatchObject({
      sourceRevision: 44,
      sourceHash: engine.documents.get('source-url')!.canonicalHash,
      targetRevision: 4,
      targetHash: engine.documents.get('target-url')!.canonicalHash,
    });
    expect(docs.fetches).toEqual([]);
  });

  it('keeps a legacy receipt in the legacy hash domain when an engine is configured', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-legacy-receipt-engine-'));
    const sourceXml = '<title id="source">Guide</title><p id="source-body">English body.</p>';
    const targetXml = '<title id="target">指南</title><p id="target-body">中文正文。</p>';
    const source = parseFeishuDocument(sourceXml, {documentId: 'source', revisionId: 3});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 8});
    const docs = new MutableDocs();
    docs.documents.set('source-url', {documentId: 'source', revisionId: 3, content: sourceXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 8, content: targetXml});
    const engine = new MemoryEngine();
    engine.documents.set('source-url', engineSnapshot('source', '3', 'Guide', [{
      block_id: 'source-body', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'English body.', text_element_style: {}}}]},
    }]));
    engine.documents.set('target-url', engineSnapshot('target', '8', '指南', [{
      block_id: 'target-body', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '中文正文。', text_element_style: {}}}]},
    }]));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const sourceSnapshotRef = await snapshots.putBundle({
      runId: 'legacy-baseline', files: {'source.xml': sourceXml},
    });
    await registry.savePair({
      pairId: 'pair-legacy-engine', sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await registry.saveReceipt({
      pairId: 'pair-legacy-engine', sourceRevision: 3, sourceHash: source.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: target.canonicalHash,
      runId: 'legacy-baseline', completedAt: '2026-07-15T00:00:00.000Z', correspondences: [],
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), engine, docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')},
      ids: {next: () => 'run-legacy-engine'},
    });

    await expect(workflows.createPlan('pair-legacy-engine')).resolves.toMatchObject({
      state: 'completed', changes: [],
    });
    expect(engine.requests).toEqual([]);
    expect(docs.fetches).toEqual(['source-url', 'target-url']);
  });

  it('plans changed native synced code as verify-only without translation requests', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-native-sync-plan-'));
    const docs = new MutableDocs();
    const baselineXml = '<title id="title">Guide</title>'
      + '<synced-source id="sync-source"><pre id="code"><code>print(1)</code></pre></synced-source>';
    const currentXml = '<title id="title">Guide</title>'
      + '<synced-source id="sync-source"><pre id="code"><code>print(2)</code></pre></synced-source>';
    const targetXml = '<title id="zh-title">指南</title>'
      + '<synced_reference id="sync-reference" src-token="source" src-block-id="sync-source"></synced_reference>';
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const baseline = parseFeishuDocument(baselineXml, {documentId: 'source', revisionId: 1});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    const sourceSync = baseline.nodes.find((node) => node.kind === 'synced_source')!;
    const targetSync = target.nodes.find((node) => node.kind === 'synced_reference')!;
    const sourceSnapshotRef = await snapshots.putBundle({runId: 'baseline', files: {'source.xml': baselineXml}});
    await registry.savePair({
      pairId: 'pair-native', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await registry.saveReceipt({
      pairId: 'pair-native', sourceRevision: 1, sourceHash: baseline.canonicalHash, sourceSnapshotRef,
      targetRevision: 5, targetHash: target.canonicalHash, runId: 'baseline', completedAt: '2026-07-15T00:00:00.000Z',
      correspondences: [{
        kind: 'native_sync', sourceNodeId: sourceSync.nodeId, targetNodeId: targetSync.nodeId,
        sourceDocumentId: 'source', sourceBlockId: 'sync-source',
      }],
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-native'},
    });

    const created = await workflows.createPlan('pair-native');
    const completed = await workflows.completePlan(created.runId, []);
    const plan = JSON.parse(await readFile(join(cwd, completed.planPath), 'utf8')) as {
      planVersion: number; operations: Array<Record<string, unknown>>;
    };

    expect(created).toMatchObject({state: 'translation_required', translationRequests: []});
    expect(plan.planVersion).toBe(3);
    expect(plan.operations).toEqual([expect.objectContaining({
      policy: 'verify_synced_reference', effect: 'verify_only', sourceDocumentId: 'source',
      sourceBlockId: 'sync-source', targetBlockId: 'sync-reference',
    })]);
  });

  it('plans a Whiteboard mirror when its raw content hash changes without a Docx XML change', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-whiteboard-plan-'));
    const docs = new MutableDocs();
    const whiteboards = new MemoryWhiteboards();
    const sourceXml = '<title id="title">Guide</title><whiteboard id="board" token="source-board"></whiteboard>';
    const targetXml = '<title id="zh-title">指南</title><whiteboard id="zh-board" token="target-board"></whiteboard>';
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: sourceXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    const oldBoard = {nodes: [{id: 'old', type: 'text', text: 'Old', x: 1}]};
    const newBoard = {nodes: [{id: 'new', type: 'text', text: 'New', x: 1}]};
    whiteboards.values.set('source-board', newBoard);
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const source = parseFeishuDocument(sourceXml, {documentId: 'source', revisionId: 1});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    const sourceBoard = source.nodes.find((node) => node.kind === 'whiteboard')!;
    const targetBoard = target.nodes.find((node) => node.kind === 'whiteboard')!;
    const sourceSnapshotRef = await snapshots.putBundle({runId: 'baseline', files: {'source.xml': sourceXml}});
    await registry.savePair({
      pairId: 'pair-board', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await registry.saveReceipt({
      pairId: 'pair-board', sourceRevision: 1, sourceHash: source.canonicalHash, sourceSnapshotRef,
      targetRevision: 5, targetHash: target.canonicalHash, runId: 'baseline', completedAt: '2026-07-15T00:00:00.000Z',
      correspondences: [{
        kind: 'copied_resource', sourceNodeId: sourceBoard.nodeId, targetNodeId: targetBoard.nodeId,
        resourceKind: 'whiteboard', sourceResourceHash: canonicalWhiteboard(oldBoard).hash,
      }],
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), docs, whiteboards,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-board'},
    });

    const created = await workflows.createPlan('pair-board');
    const completed = await workflows.completePlan(created.runId, []);
    const plan = JSON.parse(await readFile(join(cwd, completed.planPath), 'utf8')) as {
      operations: Array<Record<string, unknown>>;
    };

    expect(created).toMatchObject({state: 'translation_required', translationRequests: []});
    expect(plan.operations).toEqual([expect.objectContaining({
      policy: 'whiteboard_mirror', effect: 'mirror', kind: 'replace',
      sourceResourceToken: 'source-board', targetResourceToken: 'target-board',
      sourceResourceHash: canonicalWhiteboard(newBoard).hash,
    })]);
  });

  it('rejects an illegal workflow state transition before persisting it', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-state-transition-'));
    const registry = new LocalRegistryStore(cwd);
    const run = {
      runId: 'run-completed', pairId: 'pair-1', state: 'completed' as const,
      createdAt: '2026-07-15T00:00:00.000Z', updatedAt: '2026-07-15T00:00:00.000Z',
    };
    await registry.saveRun(run);
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs: new MutableDocs(),
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'unused'},
    });

    await expect((workflows as unknown as {
      markRun(current: typeof run, state: 'applying', metadata: Record<string, unknown>): Promise<unknown>;
    }).markRun(run, 'applying', {})).rejects.toMatchObject({
      type: 'validation', subtype: 'illegal_state_transition',
    });
    expect(await registry.getRun(run.runId)).toMatchObject({state: 'completed'});
  });

  it('does not create a new run directly in a non-initial workflow state', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-initial-state-'));
    const workflows = new LocalizationWorkflows({
      cwd, registry: new LocalRegistryStore(cwd), snapshots: new LocalSnapshotStore(cwd),
      memory: new MemoryTranslationMemory(), docs: new MutableDocs(),
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'unused'},
    });

    expect(() => (workflows as unknown as {
      newRun(runId: string, pairId: string, state: 'stale', metadata: Record<string, unknown>): unknown;
    }).newRun('run-stale', 'pair-1', 'stale', {kind: 'localization'})).toThrowError(
      expect.objectContaining({subtype: 'illegal_initial_state'}),
    );
  });

  it('rejects bootstrap acceptance when either remote document changed during review', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-stale-bootstrap-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: '<h1 id="s1">Overview</h1>'});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 1, content: '<h1 id="t1">概述</h1>'});
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-bootstrap'},
    });
    const bootstrap = await workflows.planBootstrap('pair-1');
    docs.documents.set('target-url', {documentId: 'target', revisionId: 2, content: '<h1 id="t1">新概述</h1>'});

    await expect(workflows.acceptBootstrap(bootstrap.runId)).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'bootstrap_target_changed',
    });
    expect(await registry.getReceipt('pair-1')).toBeUndefined();
  });

  it('rejects bootstrap acceptance for a title-only target', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-empty-bootstrap-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="source">Setup</title><p id="p1">English body</p>',
    });
    docs.documents.set('target-url', {
      documentId: 'target', revisionId: 1,
      content: '<title id="target">Setup</title>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-empty', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-empty-bootstrap'},
    });
    const bootstrap = await workflows.planBootstrap('pair-empty');

    await expect(workflows.acceptBootstrap(bootstrap.runId)).rejects.toMatchObject({
      type: 'validation', subtype: 'empty_target_requires_initialization',
    });
    expect(await registry.getReceipt('pair-empty')).toBeUndefined();
  });

  it('plans full initialization for a title-only existing target', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-empty-target-plan-'));
    const docs = new MutableDocs();
    const engine = new MemoryEngine();
    engine.documents.set('source-url', engineSnapshot('source', '31', 'Hugging Face', [{
      block_id: 'intro', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'English body.', text_element_style: {}}}]},
    }, {
      block_id: 'code', parent_id: 'source', block_type: 14,
      code: {
        style: {language: 49},
        elements: [{text_run: {content: 'print("hello")', text_element_style: {}}}],
      },
    }, {
      block_id: 'board', parent_id: 'source', block_type: 43,
      board: {token: 'board-source'},
    }, {
      block_id: 'sync-source', parent_id: 'source', block_type: 49,
      source_synced: {elements: [{text_run: {content: 'Synced code', text_element_style: {}}}]},
      children: ['sync-code'],
    }, {
      block_id: 'sync-code', parent_id: 'sync-source', block_type: 14,
      code: {
        style: {language: 49},
        elements: [{text_run: {content: 'print("synced")', text_element_style: {}}}],
      },
    }]));
    engine.documents.set('target-url', engineSnapshot('target', '4', 'Hugging Face'));
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-empty-plan', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(),
      engine, docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-empty-plan'},
    });

    const result = await workflows.createPlan('pair-empty-plan');
    const run = await registry.getRun(result.runId);

    expect(result).toMatchObject({state: 'translation_required'});
    expect(result.translationRequests.map((request) => request.targetNodeKind)).toEqual(['title', 'paragraph']);
    expect(run?.metadata?.initialOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({policy: 'translation', targetNodeKind: 'title', kind: 'replace'}),
      expect.objectContaining({policy: 'translation', targetNodeKind: 'paragraph', kind: 'insert'}),
      expect.objectContaining({policy: 'verbatim_code', targetNodeKind: 'code', sourceXml: expect.stringContaining('<pre')}),
      expect.objectContaining({policy: 'whiteboard_mirror', sourceResourceToken: 'board-source'}),
      expect.objectContaining({
        policy: 'manual_synced_reference', sourceDocumentId: 'source', sourceBlockId: 'sync-source',
      }),
    ]));

    const completed = await workflows.completePlan(result.runId, result.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? 'Hugging Face' : '中文正文。',
      targetNodeKind: request.targetNodeKind,
    })));
    const compiledPlan = JSON.parse(await readFile(join(cwd, completed.planPath), 'utf8')) as {
      planVersion: number;
      operations: Array<{policy?: string; proposedText: string}>;
    };
    expect(compiledPlan.planVersion).toBe(3);
    expect(compiledPlan.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({policy: 'translation', proposedText: 'Hugging Face'}),
      expect.objectContaining({policy: 'translation', proposedText: '中文正文。'}),
      expect.objectContaining({policy: 'verbatim_code', proposedText: 'print("hello")'}),
      expect.objectContaining({policy: 'whiteboard_mirror'}),
      expect.objectContaining({policy: 'manual_synced_reference'}),
    ]));
    expect(docs.fetches).toEqual([]);

    const preview = await workflows.previewApply(result.runId, completed.reviewPath);
    await expect(workflows.apply(result.runId, completed.reviewPath, preview.approvalToken))
      .rejects.toMatchObject({
        type: 'compatibility',
        subtype: 'engine_apply_pending',
      });
    expect(docs.fetches).toEqual([]);
  });

  it('plans revision 44 list and table slots for an existing empty target', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-structured-empty-target-'));
    const docs = new MutableDocs();
    const engine = new MemoryEngine();
    engine.documents.set('source-url', await supportedHuggingFaceSnapshot());
    engine.documents.set('target-url', engineSnapshot('target', '4', 'Hugging Face'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    await registry.savePair({
      pairId: 'hugging-face-en-zh', sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror',
      status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), engine, docs,
      clock: {now: () => new Date('2026-07-22T00:00:00.000Z')},
      ids: {next: () => 'run-hugging-face-structured'},
    });

    const result = await workflows.createPlan('hugging-face-en-zh');
    const list = result.translationRequests.find((request) => request.targetNodeKind === 'list');
    const table = result.translationRequests.find((request) => request.targetNodeKind === 'table');
    const run = await registry.getRun(result.runId);
    const bundle = await snapshots.getBundle(run!.metadata!.bundleRef as SnapshotReference);

    expect(result.state).toBe('translation_required');
    expect(result.blocker).toBeUndefined();
    expect(list?.structured).toMatchObject({
      kind: 'list',
      topologyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      slots: [
        expect.objectContaining({slotId: 'item-0/text', sourceText: 'Create a Hugging Face account.'}),
        expect.objectContaining({slotId: 'item-0/child-0/item-0/text', sourceText: '**Generate an access token.**'}),
      ],
    });
    expect(table?.structured).toMatchObject({
      kind: 'table',
      topologyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      slots: [
        expect.objectContaining({slotId: 'row-0/cell-0/paragraph-0', sourceText: '**Parameter**'}),
        expect.objectContaining({slotId: 'row-0/cell-1/paragraph-0', sourceText: '**Description**'}),
        expect.objectContaining({
          slotId: 'row-1/cell-1/paragraph-0',
          sourceText: 'The model used to generate embeddings.',
        }),
      ],
    });
    expect(table?.structured?.slots).not.toContainEqual(expect.objectContaining({sourceText: '`model_name`'}));
    expect(run?.metadata).toMatchObject({planVersion: 3});
    expect(bundle.files).toMatchObject({
      'source-snapshot.json': expect.stringContaining('nested-parent'),
      'target-snapshot.json': expect.stringContaining('"revision": "4"'),
      'translation-requests.json': expect.stringContaining('"topologyHash"'),
    });
    const responses = result.translationRequests.map((request) => request.structured
      ? {
          operationId: request.operationId,
          targetNodeKind: request.targetNodeKind,
          slots: request.structured.slots.map((slot) => ({
            slotId: slot.slotId,
            translatedText: slot.sourceText,
          })),
        }
      : {
          operationId: request.operationId,
          targetNodeKind: request.targetNodeKind,
          translatedText: request.sourceAfter ?? request.sourceBefore ?? '保留',
        });
    const completed = await workflows.completePlan(result.runId, responses);
    const compiledPlan = JSON.parse(await readFile(join(cwd, completed.planPath), 'utf8')) as {
      planVersion: number;
      operations: Array<{operationId: string; structured?: {kind: string; topologyHash: string; sourceStructure: unknown; slots: unknown[]}}>;
    };
    const review = await readFile(join(cwd, completed.reviewPath), 'utf8');

    expect(completed.state).toBe('review_required');
    expect(compiledPlan.planVersion).toBe(3);
    expect(compiledPlan.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({
        operationId: list!.operationId,
        structured: expect.objectContaining({kind: 'list', slots: expect.any(Array)}),
      }),
      expect.objectContaining({
        operationId: table!.operationId,
        structured: expect.objectContaining({
          kind: 'table',
          sourceStructure: expect.objectContaining({kind: 'table', rows: expect.any(Array)}),
          slots: expect.any(Array),
        }),
      }),
    ]));
    expect(review).toContain(`op:${table!.operationId} slot:row-0/cell-0/paragraph-0`);
    expect(review).toContain('### Structured list');
    expect(review).toContain('### Structured table');
    expect(review).toContain('Rows: 2');
    expect(review).toContain('Columns: 2');
    expect(review).toContain('`model_name`');
    expect(docs.fetches).toEqual([]);
  });

  it('does not auto-correspond a shifted structural group during bootstrap', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-bootstrap-shift-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: '<h1 id="s1">Overview</h1><p id="s2">Source body</p>'});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 1, content: '<h1 id="t1">概述</h1><p id="extra">人工前言</p><p id="t2">正文</p>'});
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-bootstrap'},
    });

    const bootstrap = await workflows.planBootstrap('pair-1');

    expect(bootstrap.audit.correspondences).not.toContainEqual(expect.objectContaining({sourceNodeId: 'Overview:paragraph:0'}));
    expect(bootstrap.audit.unmatchedSourceNodes).toContain('s2');
  });

  it('aggregates repeated protected tokens into one exact count', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-token-count-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><p id="p1">Run <code>curl</code>, then <code>curl</code> again.</p>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetParentToken: 'parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });

    const plan = await workflows.createPlan('pair-1');
    const paragraph = plan.translationRequests.find((request) => request.targetNodeKind === 'paragraph');

    expect(paragraph?.preserved).toEqual([{kind: 'inline_code', value: 'curl', count: 2}]);
    expect(await registry.getRun(plan.runId)).toMatchObject({
      sourceToRevision: 1,
      targetPlanRevision: 0,
    });
  });

  it('blocks missing-target creation when report-only content would be copied silently', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-unsupported-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><table id="table"><tbody><tr><td>English only</td></tr></tbody></table>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetParentToken: 'parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });

    const plan = await workflows.createPlan('pair-1');

    expect(plan).toMatchObject({state: 'blocked', blocker: expect.stringContaining('report-only')});
    expect(await registry.getRun(plan.runId)).toMatchObject({
      errorType: 'creation_report_only_content',
      errorDetail: expect.objectContaining({subtype: 'creation_report_only_content'}),
    });
  });

  it('surfaces unresolved internal link and anchor mappings in translation requests', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-link-warning-'));
    const docs = new MutableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><p id="p1">Read the <a href="https://docs.feishu.cn/docx/other#section">guide</a>.</p>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetParentToken: 'parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    await registry.savePair({
      pairId: 'other', sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'https://docs.feishu.cn/docx/other', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });

    const plan = await workflows.createPlan('pair-1');
    const paragraph = plan.translationRequests.find((request) => request.targetNodeKind === 'paragraph');

    expect(paragraph?.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('missing a Chinese document mapping'),
      expect.stringContaining('unresolved English anchor'),
    ]));
  });



  it('accepts a baseline and produces translation requests for later remote English changes', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-plan-'));
    const [baselineXml, currentXmlRaw, targetXml] = await Promise.all([
      readFile(fixture('source-baseline.xml'), 'utf8'),
      readFile(fixture('source-current.xml'), 'utf8'),
      readFile(fixture('target-current.xml'), 'utf8'),
    ]);
    const currentXml = `${currentXmlRaw}<img id="image-current" token="img-token" name="metrics.png"/>\n`;
    const docs = new MutableDocs();
    docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: baselineXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 10, content: targetXml});
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-1',
      sourceLocale: 'en',
      targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url',
      mode: 'mirror',
      status: 'needs_bootstrap',
    });
    let id = 0;
    const memoryExample: TranslationMemoryEntry = {
      sourceHash: 'example', targetLocale: 'zh-CN', glossaryHash: 'example', headingPath: ['Overview'],
      sourceText: 'Monitor metrics.', targetText: '监控指标。', pairId: 'pair-old', runId: 'run-old',
      verifiedRunId: 'run-old', approvedAt: '2026-07-14T00:00:00.000Z',
    };
    await registry.savePair({
      pairId: 'pair-console', sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'https://example.com/console', targetDocUrl: 'https://cn.example.com/console',
      mode: 'mirror', status: 'active',
    });
    const snapshots = new LocalSnapshotStore(cwd);
    const workflows = new LocalizationWorkflows({
      cwd,
      registry,
      snapshots,
      memory: new MemoryTranslationMemory(memoryExample),
      docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
      ids: {next: () => `run-${++id}`},
    });

    const bootstrap = await workflows.planBootstrap('pair-1');
    expect(bootstrap.state).toBe('review_required');
    expect(bootstrap.audit.unmatchedSourceNodes).toContain('table-1');
    expect(await registry.getPair('pair-1')).toMatchObject({
      sourceDocTitle: 'Configure metrics',
      targetDocTitle: '配置指标',
    });
    const bootstrapRun = await registry.getRun(bootstrap.runId);
    expect(bootstrapRun).toMatchObject({sourceToRevision: 1, targetPlanRevision: 10});
    const bootstrapBundle = await snapshots.getBundle(
      bootstrapRun!.metadata!.snapshotRef as Parameters<LocalSnapshotStore['getBundle']>[0],
    );
    expect(bootstrapBundle.files).toMatchObject({
      'source.md': expect.stringContaining('# Overview'),
      'target.md': expect.any(String),
    });
    await workflows.acceptBootstrap(bootstrap.runId);

    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
    const plan = await workflows.createPlan('pair-1');

    expect(plan.state).toBe('translation_required');
    expect(plan.translationRequests).toHaveLength(4);
    expect(plan.translationRequests.map((request) => request.changeKind).sort()).toEqual([
      'delete',
      'insert',
      'insert',
      'replace',
    ]);
    expect(plan.translationRequests.some((request) => request.memoryExamples.length > 0)).toBe(true);
    expect(plan.translationRequests.flatMap((request) => request.linkMappings)).toContainEqual({
      sourceUrl: 'https://example.com/console',
      targetUrl: 'https://cn.example.com/console',
    });
    expect(plan.translationRequestsPath).toContain(`.zdoc-localize/runs/${plan.runId}/translation-requests.json`);
    expect(await registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 1, targetRevision: 10});
    expect(await registry.getRun(plan.runId)).toMatchObject({
      sourceFromRevision: 1,
      sourceToRevision: 2,
      targetPlanRevision: 10,
    });
    const run = await registry.getRun(plan.runId);
    const bundle = await snapshots.getBundle(
      run!.metadata!.bundleRef as Parameters<LocalSnapshotStore['getBundle']>[0],
    );
    expect(bundle.files).toMatchObject({
      'source-current.semantic.json': expect.any(String),
      'target-current.semantic.json': expect.any(String),
      'source-current.md': expect.stringContaining('# Overview'),
      'target-current.md': expect.any(String),
    });
    await expect(readFile(join(cwd, '.zdoc-localize', 'runs', plan.runId, 'source-current.md'), 'utf8'))
      .resolves.toContain('# Overview');
  });

  it('plans a live Feishu flat-to-nested list change with every target list-item block bound', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-nested-list-plan-'));
    const docs = new MutableDocs();
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
      pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    let id = 0;
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => `run-${++id}`},
    });
    const bootstrap = await workflows.planBootstrap('pair-1');
    await workflows.acceptBootstrap(bootstrap.runId);
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 2,
      content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2-new">Review the proposed Chinese changes.<ul><li id="en-child-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-child-2">Apply only approved block-level writes.</li></ul></li></ol>',
    });

    const created = await workflows.createPlan('pair-1');
    expect(created.state).toBe('translation_required');
    const nested = created.translationRequests.find((request) => request.changeKind === 'insert');
    expect(nested?.sourceAfter).toBe('1. Scan the remote English document.\n2. Review the proposed Chinese changes.\n   - Preserve URLs and inline commands.\n   - Apply only approved block-level writes.');

    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => request.changeKind === 'delete'
      ? {operationId: request.operationId, decision: 'delete'}
      : {
          operationId: request.operationId,
          translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL 和内联 `commands`。\n   - 仅应用已批准的块级写入。',
          targetNodeKind: request.targetNodeKind,
        }));
    const plan = JSON.parse(await readFile(join(cwd, completed.planPath), 'utf8')) as {operations: Array<{kind: string; targetBlockIds?: string[]}>};
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    expect(plan.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({kind: 'delete', targetBlockIds: ['zh-bullet-1', 'zh-bullet-2']}),
      expect.objectContaining({kind: 'delete', targetBlockIds: ['zh-step-1', 'zh-step-2']}),
      expect.objectContaining({kind: 'insert', anchorBlockId: 'zh-workflow'}),
    ]));
    expect(preview.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'insert',
        compiledXml: '<ol><li>扫描远端英文文档。</li><li>审核建议的中文变更。<ul><li>保留 URL 和内联 <code>commands</code>。</li><li>仅应用已批准的块级写入。</li></ul></li></ol>',
      }),
    ]));
  });

  it('returns classification_required for a selective document before translation', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-selective-'));
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-selective',
      sourceLocale: 'en',
      targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url',
      mode: 'selective',
      status: 'active',
    });
    const snapshots = new LocalSnapshotStore(cwd);
    const baselineXml = await readFile(fixture('source-baseline.xml'), 'utf8');
    const baselineRef = await snapshots.putBundle({runId: 'bootstrap', files: {'source.xml': baselineXml}});
    await registry.saveReceipt({
      pairId: 'pair-selective',
      sourceRevision: 1,
      sourceHash: 'ignored-by-workflow-reparse',
      sourceSnapshotRef: baselineRef,
      targetRevision: 10,
      targetHash: 'target',
      runId: 'bootstrap',
      completedAt: '2026-07-15T00:00:00.000Z',
      correspondences: [{
        sourceNodeId: 'Overview/Configure monitoring:callout:0',
        targetNodeId: '概述/配置监控:callout:0',
      }],
    });
    const docs = new MutableDocs();
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: await readFile(fixture('source-current.xml'), 'utf8')});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 10, content: await readFile(fixture('target-current.xml'), 'utf8')});
    const workflows = new LocalizationWorkflows({
      cwd,
      registry,
      snapshots,
      memory: new MemoryTranslationMemory(),
      docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
      ids: {next: () => 'run-selective'},
    });

    const result = await workflows.createPlan('pair-selective');

    expect(result.state).toBe('classification_required');
    expect(result.changes.length).toBeGreaterThan(0);

    const applicable = result.changes
      .filter((change) => (change.after ?? change.before)?.writable)
      .map((change) => change.changeId);
    const classified = await workflows.classifyPlan(result.runId, applicable);

    expect(classified.state).toBe('translation_required');
    expect(classified.translationRequests).toHaveLength(applicable.length);
  });
});
