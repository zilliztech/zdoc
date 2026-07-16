import {mkdtemp, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';
import {SqliteTranslationMemory} from '../src/storage/sqlite-translation-memory.js';
import {ConfigStore} from '../src/storage/config-store.js';

const memories: SqliteTranslationMemory[] = [];
afterEach(async () => {
  await Promise.all(memories.splice(0).map((memory) => memory.close()));
});

describe('local persistence', () => {
  it('round-trips non-secret workspace configuration', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-config-'));
    const store = new ConfigStore(cwd);
    const config = {
      mode: 'local' as const,
      registryUrl: 'https://example.feishu.cn/base/registry',
      stateFolderUrl: 'https://example.feishu.cn/drive/state',
    };

    await store.write(config);

    expect(await store.read()).toEqual(config);
  });

  it('round-trips document pairs and run records', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-registry-'));
    const registry = new LocalRegistryStore(cwd);
    const pair = {
      pairId: 'pair-1',
      sourceLocale: 'en' as const,
      targetLocale: 'zh-CN' as const,
      sourceDocUrl: 'https://example.feishu.cn/docx/en',
      targetDocUrl: 'https://example.feishu.cn/docx/zh',
      mode: 'mirror' as const,
      status: 'needs_bootstrap' as const,
    };
    const run = {
      runId: 'run-1',
      pairId: pair.pairId,
      state: 'scanning' as const,
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: '2026-07-15T00:00:00.000Z',
    };

    await registry.savePair(pair);
    await registry.saveRun(run);

    expect(await registry.getPair(pair.pairId)).toEqual(pair);
    expect(await registry.getRun(run.runId)).toEqual(run);
    expect(await registry.listPairs()).toEqual([pair]);
  });

  it('round-trips typed localization receipt correspondences', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-receipt-'));
    const registry = new LocalRegistryStore(cwd);
    const receipt = {
      pairId: 'pair-1',
      sourceRevision: 4,
      sourceHash: 'source-hash',
      sourceSnapshotRef: {kind: 'local' as const, path: 'snapshot.json', hash: 'snapshot-hash'},
      targetRevision: 7,
      targetHash: 'target-hash',
      runId: 'run-1',
      completedAt: '2026-07-16T00:00:00.000Z',
      correspondences: [{
        kind: 'native_sync' as const,
        sourceNodeId: 'source:sync:0',
        targetNodeId: 'target:sync:0',
        sourceDocumentId: 'source-doc',
        sourceBlockId: 'source-block',
      }],
    };

    await registry.saveReceipt(receipt);

    expect(await registry.getReceipt(receipt.pairId)).toEqual(receipt);
  });

  it('stores immutable snapshot bundles by content hash', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-snapshots-'));
    const snapshots = new LocalSnapshotStore(cwd);
    const bundle = {runId: 'run-1', files: {'source.xml': '<p>hello</p>'}};

    const reference = await snapshots.putBundle(bundle);

    expect(reference.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(await snapshots.getBundle(reference)).toEqual(bundle);
    expect(JSON.parse(await readFile(join(cwd, reference.path), 'utf8'))).toEqual(bundle);
  });

  it('records only verified approved translations', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-memory-'));
    const memory = new SqliteTranslationMemory(join(cwd, 'translation-memory.db'));
    memories.push(memory);
    const entry = {
      sourceHash: 'source-hash',
      targetLocale: 'zh-CN',
      glossaryHash: 'glossary-hash',
      headingPath: ['Overview'],
      sourceText: 'Monitor metrics.',
      targetText: '监控指标。',
      pairId: 'pair-1',
      runId: 'run-1',
      verifiedRunId: 'run-1',
      approvedAt: '2026-07-15T00:00:00.000Z',
    };

    await memory.recordApproved(entry);

    expect(await memory.findExact({
      sourceHash: entry.sourceHash,
      targetLocale: entry.targetLocale,
      glossaryHash: entry.glossaryHash,
      headingPath: entry.headingPath,
    })).toEqual(entry);

    await expect(memory.recordApproved({...entry, runId: 'run-2'})).rejects.toMatchObject({
      type: 'validation',
      subtype: 'unverified_translation_memory',
    });
  });
});
