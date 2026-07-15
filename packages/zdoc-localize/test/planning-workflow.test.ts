import {readFile, mkdtemp} from 'node:fs/promises';
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
import type {FetchedDocument} from '../src/adapters/lark-docs-adapter.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

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
  async fetch(doc: string): Promise<FetchedDocument> {
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return result;
  }
}

describe('bootstrap and planning workflows', () => {
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
    const workflows = new LocalizationWorkflows({
      cwd,
      registry,
      snapshots: new LocalSnapshotStore(cwd),
      memory: new MemoryTranslationMemory(memoryExample),
      docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
      ids: {next: () => `run-${++id}`},
    });

    const bootstrap = await workflows.planBootstrap('pair-1');
    expect(bootstrap.state).toBe('review_required');
    expect(bootstrap.audit.unmatchedSourceNodes).toContain('table-1');
    await workflows.acceptBootstrap(bootstrap.runId);

    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
    const plan = await workflows.createPlan('pair-1');

    expect(plan.state).toBe('translation_required');
    expect(plan.translationRequests).toHaveLength(3);
    expect(plan.translationRequests.map((request) => request.changeKind).sort()).toEqual([
      'insert',
      'replace',
      'replace',
    ]);
    expect(plan.translationRequests.some((request) => request.memoryExamples.length > 0)).toBe(true);
    expect(plan.translationRequests.flatMap((request) => request.linkMappings)).toContainEqual({
      sourceUrl: 'https://example.com/console',
      targetUrl: 'https://cn.example.com/console',
    });
    expect(plan.translationRequestsPath).toContain(`.zdoc-localize/runs/${plan.runId}/translation-requests.json`);
    expect(await registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 1, targetRevision: 10});
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
