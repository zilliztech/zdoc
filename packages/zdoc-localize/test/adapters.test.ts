import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {FeishuMdSyncAdapter} from '../src/adapters/feishu-md-sync-adapter.js';
import {LarkBaseRegistry} from '../src/adapters/lark-base-registry.js';
import {LarkDocsAdapter} from '../src/adapters/lark-docs-adapter.js';
import {LarkDriveSnapshotStore} from '../src/adapters/lark-drive-snapshots.js';
import type {ProcessCall, ProcessResult, ProcessRunner} from '../src/adapters/process-runner.js';

class FakeRunner implements ProcessRunner {
  readonly calls: ProcessCall[] = [];
  private readonly results: ProcessResult[];

  constructor(results: ProcessResult[]) {
    this.results = [...results];
  }

  async run(call: ProcessCall): Promise<ProcessResult> {
    this.calls.push(call);
    return this.results.shift() ?? {exitCode: 0, stdout: '{"ok":true,"data":{}}\n', stderr: ''};
  }
}

const ok = (data: unknown): ProcessResult => ({
  exitCode: 0,
  stdout: `${JSON.stringify({ok: true, data})}\n`,
  stderr: '',
});

describe('Lark document adapter', () => {
  it('fetches full XML with user identity and stable JSON output', async () => {
    const runner = new FakeRunner([ok({document: {document_id: 'doc-en', revision_id: 12, content: '<p id="p1">Hello</p>'}})]);
    const docs = new LarkDocsAdapter(runner);

    await expect(docs.fetch('https://example.feishu.cn/docx/source')).resolves.toEqual({
      documentId: 'doc-en',
      revisionId: 12,
      content: '<p id="p1">Hello</p>',
    });
    expect(runner.calls[0]).toEqual({
      executable: 'lark-cli',
      args: ['docs', '+fetch', '--doc', 'https://example.feishu.cn/docx/source', '--detail', 'full', '--doc-format', 'xml', '--format', 'json', '--as', 'user'],
      env: expect.objectContaining({
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
      }),
    });
  });

  it('writes XML through stdin with the planned revision', async () => {
    const runner = new FakeRunner([ok({document: {revision_id: 13}, result: 'success', updated_blocks_count: 1, warnings: []})]);
    const docs = new LarkDocsAdapter(runner);

    await docs.replaceBlock({
      doc: 'doc-zh',
      blockId: 'blk-1',
      revisionId: 12,
      xml: '<p>更新后</p>',
    });

    expect(runner.calls[0]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: ['docs', '+update', '--doc', 'doc-zh', '--command', 'block_replace', '--block-id', 'blk-1', '--revision-id', '12', '--doc-format', 'xml', '--content', '-', '--format', 'json', '--as', 'user'],
      stdin: '<p>更新后</p>',
    }));
  });

  it('maps confirmation and partial-write results to stable errors', async () => {
    const confirmation = new FakeRunner([{
      exitCode: 10,
      stdout: '',
      stderr: JSON.stringify({ok: false, error: {type: 'confirmation_required', message: 'confirm', risk: {action: 'docs +update'}}}),
    }]);
    await expect(new LarkDocsAdapter(confirmation).deleteBlocks({
      doc: 'doc-zh',
      blockIds: ['blk-1'],
      revisionId: 12,
    })).rejects.toMatchObject({type: 'confirmation_required', exitCode: 10});

    const partial = new FakeRunner([ok({result: 'partial_success', updated_blocks_count: 1, warnings: ['one failed']})]);
    await expect(new LarkDocsAdapter(partial).deleteBlocks({
      doc: 'doc-zh',
      blockIds: ['blk-1', 'blk-2'],
      revisionId: 12,
    })).rejects.toMatchObject({type: 'partial_write', subtype: 'lark_partial_success'});
  });
});

describe('supporting adapters', () => {
  it('requires a compatible feishu-md-sync version', async () => {
    const compatible = new FakeRunner([{exitCode: 0, stdout: '0.3.0\n', stderr: ''}]);
    await expect(new FeishuMdSyncAdapter(compatible).checkCompatibility()).resolves.toBe('0.3.0');

    const incompatible = new FakeRunner([{exitCode: 0, stdout: '0.4.0\n', stderr: ''}]);
    await expect(new FeishuMdSyncAdapter(incompatible).checkCompatibility()).rejects.toMatchObject({
      type: 'compatibility',
      subtype: 'feishu_md_sync_version',
    });
  });

  it('constructs Base record list and upsert calls without shell interpolation', async () => {
    const runner = new FakeRunner([
      ok({items: []}),
      ok({record: {record_id: 'rec-1'}, created: true}),
    ]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token',
      documentPairsTableId: 'tbl-pairs',
      glossaryTableId: 'tbl-glossary',
      runsTableId: 'tbl-runs',
    });

    await registry.savePair({
      pairId: 'pair-1',
      sourceLocale: 'en',
      targetLocale: 'zh-CN',
      sourceDocUrl: 'https://example.feishu.cn/docx/en',
      targetDocUrl: 'https://example.feishu.cn/docx/zh',
      mode: 'mirror',
      status: 'needs_bootstrap',
    });

    expect(runner.calls[0]?.args.slice(0, 4)).toEqual(['base', '+record-list', '--base-token', 'base-token']);
    expect(runner.calls[1]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: expect.arrayContaining(['base', '+record-upsert', '--table-id', 'tbl-pairs', '--json']),
    }));
  });

  it('keeps run rows isolated from receipt rows that share a run ID', async () => {
    const run = {runId: 'run-1', pairId: 'pair-1', state: 'review_required', createdAt: 'now', updatedAt: 'now'};
    const receipt = {pairId: 'pair-1', runId: 'run-1', sourceRevision: 1};
    const runner = new FakeRunner([
      ok({items: [
        {record_id: 'receipt-record', fields: {record_type: 'receipt', run_id: 'run-1', payload_json: JSON.stringify(receipt)}},
        {record_id: 'run-record', fields: {record_type: 'run', run_id: 'run-1', payload_json: JSON.stringify(run)}},
      ]}),
      ok({items: [
        {record_id: 'receipt-record', fields: {record_type: 'receipt', run_id: 'run-1', payload_json: JSON.stringify(receipt)}},
        {record_id: 'run-record', fields: {record_type: 'run', run_id: 'run-1', payload_json: JSON.stringify(run)}},
      ]}),
      ok({record: {record_id: 'run-record'}}),
    ]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await expect(registry.getRun('run-1')).resolves.toMatchObject({state: 'review_required'});
    await registry.saveRun({...run, state: 'completed'} as never);

    expect(runner.calls[2]?.args).toEqual(expect.arrayContaining(['--record-id', 'run-record']));
  });

  it('paginates Base records instead of silently truncating shared state', async () => {
    const runner = new FakeRunner([
      ok({items: [{fields: {pair_id: 'pair-1', source_doc_url: 'en-1', target_doc_url: 'zh-1', mode: 'mirror', status: 'active'}}], has_more: true}),
      ok({items: [{fields: {pair_id: 'pair-2', source_doc_url: 'en-2', target_doc_url: 'zh-2', mode: 'mirror', status: 'active'}}], has_more: false}),
    ]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await expect(registry.listPairs()).resolves.toHaveLength(2);
    expect(runner.calls[1]?.args).toEqual(expect.arrayContaining(['--offset', '1']));
  });

  it('stores only compact run metadata in Base and leaves document bodies in snapshot bundles', async () => {
    const runner = new FakeRunner([ok({items: []}), ok({record: {record_id: 'run-record'}})]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });
    await registry.saveRun({
      runId: 'run-1', pairId: 'pair-1', state: 'translation_required', createdAt: 'now', updatedAt: 'now',
      metadata: {
        bundleRef: {kind: 'drive', token: 'snapshot-token', sha256: 'hash'},
        changes: [{before: {xml: '<p>very large source body</p>'}}],
        aligned: [{change: {after: {xml: '<p>very large current body</p>'}}}],
      },
    });

    const jsonArg = runner.calls[1]!.args[runner.calls[1]!.args.indexOf('--json') + 1]!;
    expect(jsonArg).toContain('snapshot-token');
    expect(jsonArg).not.toContain('very large');
  });

  it('uploads immutable snapshot bundles through a relative outbox path', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-drive-adapter-'));
    const runner = new FakeRunner([ok({file_token: 'box-snapshot'})]);
    const store = new LarkDriveSnapshotStore(runner, {cwd, folderToken: 'fld-state'});

    const reference = await store.putBundle({runId: 'run-1', files: {'plan.json': '{}'}});

    expect(reference).toMatchObject({kind: 'drive', token: 'box-snapshot'});
    expect(runner.calls[0]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: expect.arrayContaining(['drive', '+upload', '--folder-token', 'fld-state', '--as', 'user']),
    }));
    const fileArgument = runner.calls[0]!.args[runner.calls[0]!.args.indexOf('--file') + 1];
    expect(fileArgument).toMatch(/^\.zdoc-localize\/outbox\//);
  });
});
