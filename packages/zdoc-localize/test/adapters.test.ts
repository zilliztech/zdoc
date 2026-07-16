import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {FeishuMdSyncAdapter} from '../src/adapters/feishu-md-sync-adapter.js';
import {LarkBaseRegistry} from '../src/adapters/lark-base-registry.js';
import {LarkDocsAdapter} from '../src/adapters/lark-docs-adapter.js';
import {LarkDriveSnapshotStore} from '../src/adapters/lark-drive-snapshots.js';
import {LarkWhiteboardAdapter} from '../src/adapters/lark-whiteboard-adapter.js';
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
    const runner = new FakeRunner([ok({
      document: {
        revision_id: 13,
        new_blocks: [{block_id: 'wb-block', block_type: 'whiteboard', block_token: 'board-target'}],
      },
      result: 'success',
      updated_blocks_count: 1,
      warnings: [],
    })]);
    const docs = new LarkDocsAdapter(runner);

    await expect(docs.replaceBlock({
      doc: 'doc-zh',
      blockId: 'blk-1',
      revisionId: 12,
      xml: '<p>更新后</p>',
    })).resolves.toMatchObject({
      revisionId: 13,
      newBlocks: [{blockId: 'wb-block', blockType: 'whiteboard', blockToken: 'board-target'}],
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

  it('queries and overwrites raw Whiteboard nodes without shell interpolation', async () => {
    const raw = {nodes: [{id: 'node-1', type: 'text', text: 'Hello'}]};
    const runner = new FakeRunner([ok(raw), ok({result: 'success'})]);
    const whiteboards = new LarkWhiteboardAdapter(runner);

    await expect(whiteboards.queryRaw('source-board')).resolves.toEqual(raw);
    await whiteboards.overwriteRaw({
      token: 'target-board', raw, idempotencyToken: 'run-1-board-1',
    });

    expect(runner.calls[0]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: ['whiteboard', '+query', '--whiteboard-token', 'source-board', '--output_as', 'raw', '--format', 'json', '--as', 'user'],
    }));
    expect(runner.calls[1]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: [
        'whiteboard', '+update', '--whiteboard-token', 'target-board', '--input_format', 'raw',
        '--source', '-', '--overwrite', '--idempotent-token', 'run-1-board-1', '--format', 'json', '--as', 'user',
      ],
      stdin: JSON.stringify(raw),
    }));
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
      sourceDocTitle: 'English Guide',
      targetDocUrl: 'https://example.feishu.cn/docx/zh',
      targetDocTitle: '中文指南',
      mode: 'mirror',
      status: 'needs_bootstrap',
    });

    expect(runner.calls[0]?.args.slice(0, 4)).toEqual(['base', '+record-list', '--base-token', 'base-token']);
    expect(runner.calls[1]).toEqual(expect.objectContaining({
      executable: 'lark-cli',
      args: expect.arrayContaining(['base', '+record-upsert', '--table-id', 'tbl-pairs', '--json']),
    }));
    const fields = JSON.parse(runner.calls[1]!.args[runner.calls[1]!.args.indexOf('--json') + 1]!) as Record<string, unknown>;
    expect(fields).toMatchObject({
      source_doc_url: '[English Guide](https://example.feishu.cn/docx/en)',
      target_doc_url: '[中文指南](https://example.feishu.cn/docx/zh)',
    });
  });

  it('parses typed Base URL and label response shapes', async () => {
    const runner = new FakeRunner([ok({items: [{fields: {
      pair_id: 'pair-1',
      source_doc_url: {text: 'English', link: 'https://example.feishu.cn/docx/en'},
      target_doc_url: {text: 'Chinese', link: 'https://example.feishu.cn/docx/zh'},
      mode: [{text: 'mirror'}],
      status: {name: 'active'},
    }}]})]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await expect(registry.getPair('pair-1')).resolves.toMatchObject({
      sourceDocUrl: 'https://example.feishu.cn/docx/en',
      sourceDocTitle: 'English',
      targetDocUrl: 'https://example.feishu.cn/docx/zh',
      targetDocTitle: 'Chinese',
      mode: 'mirror',
      status: 'active',
    });
  });

  it('parses the current lark-cli matrix record-list response', async () => {
    const runner = new FakeRunner([ok({
      data: [[
        'pair-1',
        '[English Guide](https://example.feishu.cn/docx/en)',
        '[中文指南](https://example.feishu.cn/docx/zh)',
        ['mirror'],
        ['needs_bootstrap'],
      ]],
      fields: ['pair_id', 'source_doc_url', 'target_doc_url', 'mode', 'status'],
      field_id_list: ['fld-pair', 'fld-source', 'fld-target', 'fld-mode', 'fld-status'],
      record_id_list: ['rec-pair'],
      has_more: false,
    })]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await expect(registry.getPair('pair-1')).resolves.toMatchObject({
      pairId: 'pair-1',
      sourceDocUrl: 'https://example.feishu.cn/docx/en',
      sourceDocTitle: 'English Guide',
      targetDocUrl: 'https://example.feishu.cn/docx/zh',
      targetDocTitle: '中文指南',
      mode: 'mirror',
      status: 'needs_bootstrap',
    });
  });

  it('reads human glossary variants while retaining legacy JSON support', async () => {
    const runner = new FakeRunner([ok({items: [
      {fields: {term_id: 'term-1', source_term: 'cluster', target_term: '集群', disposition: 'translate', scope_type: 'global', prohibited_variants: '群集\n集群组', status: 'approved'}},
      {fields: {term_id: 'term-2', source_term: 'node', target_term: '节点', disposition: 'translate', scope_type: 'global', prohibited_variants: '["结点"]', status: 'approved'}},
    ]})]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await expect(registry.listGlossary()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({termId: 'term-1', prohibitedVariants: ['群集', '集群组']}),
      expect.objectContaining({termId: 'term-2', prohibitedVariants: ['结点']}),
    ]));
  });

  it('keeps run rows isolated from receipt rows that share a run ID', async () => {
    const run = {
      runId: 'run-1', pairId: 'pair-1', state: 'review_required',
      createdAt: '2026-07-16T01:00:00.000Z', updatedAt: '2026-07-16T01:00:00.000Z',
    };
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
      runId: 'run-1', pairId: 'pair-1', state: 'translation_required',
      createdAt: '2026-07-16T01:00:00.000Z', updatedAt: '2026-07-16T01:00:00.000Z',
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

  it('projects typed run and receipt fields alongside authoritative payload JSON', async () => {
    const runner = new FakeRunner([
      ok({items: []}),
      ok({record: {record_id: 'run-record'}}),
      ok({items: []}),
      ok({record: {record_id: 'receipt-record'}}),
    ]);
    const registry = new LarkBaseRegistry(runner, {
      baseToken: 'base-token', documentPairsTableId: 'tbl-pairs', glossaryTableId: 'tbl-glossary', runsTableId: 'tbl-runs',
    });

    await registry.saveRun({
      runId: 'run-1', pairId: 'pair-1', state: 'blocked',
      createdAt: '2026-07-16T01:00:00.000Z', updatedAt: '2026-07-16T02:00:00.000Z',
      sourceFromRevision: 10, sourceToRevision: 11, targetPlanRevision: 7,
      errorType: 'unsupported_table', errorDetail: {block: 'table-1'},
    });
    await registry.saveReceipt({
      pairId: 'pair-1', runId: 'run-1', sourceRevision: 11, sourceHash: 'source-hash',
      sourceSnapshotRef: {kind: 'drive', path: 'snapshot.json', hash: 'snapshot-hash', token: 'snapshot-token'},
      targetRevision: 8, targetHash: 'target-hash', completedAt: '2026-07-16T03:00:00.000Z', correspondences: [],
    });

    const runFields = JSON.parse(runner.calls[1]!.args[runner.calls[1]!.args.indexOf('--json') + 1]!) as Record<string, unknown>;
    expect(runFields).toMatchObject({
      state: 'blocked', created_at: '2026-07-16 09:00:00', updated_at: '2026-07-16 10:00:00',
      source_from_revision: 10, source_to_revision: 11, target_plan_revision: 7, error_type: 'unsupported_table',
    });
    expect(JSON.parse(String(runFields.payload_json))).toMatchObject({runId: 'run-1', errorDetail: {block: 'table-1'}});

    const receiptFields = JSON.parse(runner.calls[3]!.args[runner.calls[3]!.args.indexOf('--json') + 1]!) as Record<string, unknown>;
    expect(receiptFields).toMatchObject({
      record_type: 'receipt', completed_at: '2026-07-16 11:00:00', source_to_revision: 11,
      target_verified_revision: 8, source_hash: 'source-hash', target_hash: 'target-hash',
      source_snapshot_token: 'snapshot-token',
    });
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
