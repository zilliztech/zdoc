import {describe, expect, it} from 'vitest';

import {
  appendCanonicalRows,
  CANONICAL_TABLE_FIELDS,
  createCanonicalTable,
  findOrCreateDailyTable,
  listCanonicalTables,
  mapCanonicalReportToRows,
  parseCanonicalLinkReport,
} from './reportCanonicalLinks.ts';

function report() {
  return parseCanonicalLinkReport({
    generated_at: '2026-08-27T00:00:00.000Z',
    summary: {broken_references: 2},
    files: [
      {
        source_title: 'Configure Access Logs',
        source_slug: 'configure-access-logs',
        source_doc_url: 'https://zilliverse.feishu.cn/wiki/Wl2Pw',
        broken_references: [
          {
            source_type: 'href_link',
            block_id: 'Msm7dh',
            link_text: 'Alibaba OSS',
            raw_url: 'https://zilliverse.feishu.cn/wiki/IwAbwx',
            recommended_action: 'Edit the hyperlink URL to https://zilliverse.feishu.cn/wiki/New. ',
            candidates: [
              {confidence: 'exact', title: 'Alibaba Cloud OSS', doc_link: 'https://zilliverse.feishu.cn/wiki/New', reason: 'exact title'},
            ],
          },
          {
            source_type: 'mention_doc',
            block_id: null,
            link_text: null,
            raw_url: 'https://zilliverse.feishu.cn/wiki/Gone',
            recommended_action: 'Choose a canonical Base-listed replacement, then update the Feishu source manually.',
            candidates: [],
          },
        ],
      },
    ],
  });
}

const deps = {appToken: 'app', token: 'tenant-token', host: 'https://open.feishu.cn', now: () => new Date('2026-08-29T00:00:00.000Z')};

type RecordedCall = {url: string; options: Record<string, unknown>; label: string};

function recorder(responses: Array<Record<string, unknown> | Error>) {
  const calls: RecordedCall[] = [];
  const fetchFeishu = async (url: string, options: Record<string, unknown>, label: string) => {
    calls.push({url, options, label});
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next ?? {code: 0, msg: 'success', data: {}};
  };
  return {calls, fetchFeishu};
}

describe('mapCanonicalReportToRows', () => {
  it('maps each broken reference to a row with a #block_id jump link', () => {
    const rows = mapCanonicalReportToRows(report(), 'en', 'https://github.com/x/y/actions/runs/1');
    expect(rows).toHaveLength(2);
    expect(rows[0].源文档).toBe('Configure Access Logs');
    expect(rows[0].源文档链接).toBe('https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh');
    expect(rows[0].语言).toBe('English Guides');
    expect(rows[0].置信度).toBe('Exact');
    expect(rows[0].推荐候选).toBe('Alibaba Cloud OSS');
    expect(rows[0].处理状态).toBe('待处理');
  });

  it('falls back to 无候选 when no candidate exists', () => {
    const rows = mapCanonicalReportToRows(report(), 'zh-CN', '');
    expect(rows[1].置信度).toBe('无候选');
    expect(rows[1].推荐候选).toBe('');
    expect(rows[1].源文档链接).toBe('https://zilliverse.feishu.cn/wiki/Wl2Pw');
    expect(rows[1].语言).toBe('中文 Guides');
  });
});

describe('CANONICAL_TABLE_FIELDS', () => {
  it('uses the bitable wire format: field_name + numeric type', () => {
    for (const field of CANONICAL_TABLE_FIELDS) {
      expect(field.field_name, `field ${JSON.stringify(field)} must use field_name`).toEqual(expect.any(String));
      expect(field.type, `field ${JSON.stringify(field)} must use a numeric bitable type`).toEqual(expect.any(Number));
      expect(field.name).toBeUndefined();
      expect(field.style).toBeUndefined();
      expect(field.options).toBeUndefined();
    }
    const names = CANONICAL_TABLE_FIELDS.map(field => field.field_name);
    expect(names).toContain('源文档');
    expect(names).toContain('WorkflowRun');
  });
});

describe('listCanonicalTables', () => {
  it('sends the tenant token and fails on non-zero code', async () => {
    const {calls, fetchFeishu} = recorder([{code: 0, data: {items: [{table_id: 'tbl1', name: 'Canonical 清理项 2026-08-29'}]}}]);
    const tables = await listCanonicalTables({...deps, fetchFeishu});
    expect(tables).toEqual([{table_id: 'tbl1', name: 'Canonical 清理项 2026-08-29'}]);
    expect(calls[0].options.headers).toEqual({Authorization: 'Bearer tenant-token'});

    const failing = recorder([{code: 99991661, msg: 'Missing access token for authorization.'}]);
    await expect(listCanonicalTables({...deps, fetchFeishu: failing.fetchFeishu})).rejects.toThrow(/99991661/);
  });
});

describe('createCanonicalTable', () => {
  it('sends fields in bitable wire format and returns the table id', async () => {
    const {calls, fetchFeishu} = recorder([{code: 0, data: {table_id: 'tblNew'}}]);
    const tableId = await createCanonicalTable({...deps, fetchFeishu}, 'Canonical 清理项 2026-08-29');
    expect(tableId).toBe('tblNew');
    const body = JSON.parse(String(calls[0].options.body));
    expect(body.table.name).toBe('Canonical 清理项 2026-08-29');
    expect(body.table.fields[0]).toEqual({field_name: '源文档', type: 1});
    expect(body.table.fields).toHaveLength(CANONICAL_TABLE_FIELDS.length);
  });

  it('surfaces the API error instead of a generic message', async () => {
    const {fetchFeishu} = recorder([{code: 99992402, msg: 'field validation failed'}]);
    await expect(createCanonicalTable({...deps, fetchFeishu}, 'Canonical 清理项 2026-08-29'))
      .rejects.toThrow(/99992402.*field validation failed/);
  });
});

describe('appendCanonicalRows', () => {
  it('writes Url fields as {link, text} objects, not plain strings', async () => {
    const {calls, fetchFeishu} = recorder([{code: 0, data: {}}]);
    const rows = mapCanonicalReportToRows(report(), 'en', 'https://github.com/x/y/actions/runs/1');
    await appendCanonicalRows({...deps, fetchFeishu}, 'tbl1', rows);
    const body = JSON.parse(String(calls[0].options.body));
    expect(body.records[0].fields.源文档链接).toEqual({link: 'https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh', text: 'https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh'});
    expect(body.records[0].fields.当前失效URL).toEqual({link: 'https://zilliverse.feishu.cn/wiki/IwAbwx', text: 'https://zilliverse.feishu.cn/wiki/IwAbwx'});
    expect(body.records[0].fields.WorkflowRun).toEqual({link: 'https://github.com/x/y/actions/runs/1', text: 'https://github.com/x/y/actions/runs/1'});
  });

  it('omits empty Url values: "" fails bitable URL conversion', async () => {
    const {calls, fetchFeishu} = recorder([{code: 0, data: {}}]);
    // Row 1: no candidate (推荐候选链接 empty) and an empty workflow URL.
    const rows = mapCanonicalReportToRows(report(), 'en', '');
    await appendCanonicalRows({...deps, fetchFeishu}, 'tbl1', rows);
    const body = JSON.parse(String(calls[0].options.body));
    expect(body.records[1].fields.源文档链接).toEqual({link: 'https://zilliverse.feishu.cn/wiki/Wl2Pw', text: 'https://zilliverse.feishu.cn/wiki/Wl2Pw'});
    expect(body.records[1].fields.推荐候选链接).toBeUndefined();
    expect(body.records[1].fields.WorkflowRun).toBeUndefined();
  });

  it('fails on non-zero API code', async () => {
    const {fetchFeishu} = recorder([{code: 1254068, msg: 'URLFieldConvFail'}]);
    await expect(appendCanonicalRows({...deps, fetchFeishu}, 'tbl1', mapCanonicalReportToRows(report(), 'en', '')))
      .rejects.toThrow(/1254068/);
  });
});

describe('findOrCreateDailyTable', () => {
  it('reuses an existing table for today', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [{table_id: 'tblExisting', name: 'Canonical 清理项 2026-08-29'}]}},
    ]);
    const result = await findOrCreateDailyTable({...deps, fetchFeishu});
    expect(result.tableId).toBe('tblExisting');
    expect(result.tableUrl).toBe('https://open.feishu.cn/base/app?table=tblExisting');
    expect(calls).toHaveLength(1); // no create call
  });

  it('creates the table when today has none, then appends rows to it', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [{table_id: 'tblOld', name: 'Canonical 清理项 2026-08-28'}]}},
      {code: 0, data: {table_id: 'tblNew'}},
      {code: 0, data: {}},
    ]);
    const result = await findOrCreateDailyTable({...deps, fetchFeishu});
    expect(result.tableId).toBe('tblNew');
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toContain('/tables');
    expect(calls[1].options.method).toBe('post');
  });
});
