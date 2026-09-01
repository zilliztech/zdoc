import {describe, expect, it} from 'vitest';

import {LinkCheckReportSchema, type LinkCheckReport} from './check.ts';
import {
  EXTERNAL_LINK_TABLE_FIELDS,
  findOrCreateExternalLinksTable,
  mapLinkCheckReportToRows,
  writeExternalLinksTable,
} from './reportExternalLinks.ts';

function report(overrides: Partial<LinkCheckReport> = {}): LinkCheckReport {
  return LinkCheckReportSchema.parse({
    schema_version: 2,
    generated_at: '2026-08-27T00:00:00.000Z',
    tooling_sha: null,
    content_sha: null,
    workflow_run_url: 'https://github.com/x/y/actions/runs/1',
    remote_sitemap_source: 'https://milvus.io/sitemap.xml',
    local_sitemap_source: 'build/sitemap.xml',
    summary: {
      deleted_routes: 0,
      added_routes: 0,
      checked_external_links: 2,
      healthy_external_links: 0,
      expired_external_links: 1,
      blocked_external_links: 0,
      transient_external_links: 1,
      other_external_links: 0,
    },
    deleted_routes: [],
    added_routes: [],
    expired_external_links: [
      {url: 'https://example.com/gone', classification: 'expired', status: 404, error: null, pages: ['docs/a', 'docs/b'], page_count: 2},
    ],
    blocked_external_links: [],
    transient_external_links: [
      {url: 'https://example.com/flaky', classification: 'transient', status: null, error: 'request timed out after 15000ms', pages: ['docs/c'], page_count: 1},
    ],
    other_external_links: [],
    ...overrides,
  });
}

const deps = {appToken: 'app', token: 'tenant-token', host: 'https://open.feishu.cn', webHost: 'https://zilliverse.feishu.cn'};

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

describe('mapLinkCheckReportToRows', () => {
  it('maps expired and transient observations to rows with the right classification labels', () => {
    const rows = mapLinkCheckReportToRows(report(), 'en', 'https://github.com/x/y/actions/runs/1');
    expect(rows).toHaveLength(2);
    expect(rows[0].站点).toBe('English Guides');
    expect(rows[0].URL).toBe('https://example.com/gone');
    expect(rows[0].分类).toBe('已确认失效');
    expect(rows[0].状态).toBe('HTTP 404');
    expect(rows[0].引用页面).toBe('docs/a, docs/b');
    expect(rows[0].引用页面总数).toBe('2');
    expect(rows[0].扫描时间).toBe('2026-08-27T00:00:00.000Z');
    expect(rows[0].WorkflowRun).toBe('https://github.com/x/y/actions/runs/1');
  });

  it('renders an error-based status label when there is no HTTP status', () => {
    const rows = mapLinkCheckReportToRows(report(), 'zh-CN', '');
    expect(rows[1].站点).toBe('中文 Guides');
    expect(rows[1].分类).toBe('临时性错误');
    expect(rows[1].状态).toBe('Error: request timed out after 15000ms');
    expect(rows[1].WorkflowRun).toBe('');
  });

  it('produces no rows when every bucket is empty', () => {
    const rows = mapLinkCheckReportToRows(report({
      expired_external_links: [],
      transient_external_links: [],
      summary: {
        deleted_routes: 0, added_routes: 0, checked_external_links: 0, healthy_external_links: 0,
        expired_external_links: 0, blocked_external_links: 0, transient_external_links: 0, other_external_links: 0,
      },
    }), 'en', '');
    expect(rows).toHaveLength(0);
  });
});

describe('EXTERNAL_LINK_TABLE_FIELDS', () => {
  it('uses the bitable wire format: field_name + numeric type', () => {
    for (const field of EXTERNAL_LINK_TABLE_FIELDS) {
      expect(field.field_name, `field ${JSON.stringify(field)} must use field_name`).toEqual(expect.any(String));
      expect(field.type, `field ${JSON.stringify(field)} must use a numeric bitable type`).toEqual(expect.any(Number));
      expect(field.name).toBeUndefined();
      expect(field.style).toBeUndefined();
    }
    const names = EXTERNAL_LINK_TABLE_FIELDS.map(field => field.field_name);
    expect(names).toContain('站点');
    expect(names).toContain('URL');
    expect(names).toContain('WorkflowRun');
  });
});

describe('findOrCreateExternalLinksTable', () => {
  it('reuses an existing table named 外链健康检测', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [{table_id: 'tblExisting', name: '外链健康检测'}]}},
    ]);
    const result = await findOrCreateExternalLinksTable({...deps, fetchFeishu});
    expect(result.tableId).toBe('tblExisting');
    expect(result.tableUrl).toBe('https://zilliverse.feishu.cn/base/app?table=tblExisting');
    expect(calls).toHaveLength(1);
  });

  it('creates the table when it does not exist yet', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [{table_id: 'tblOther', name: 'Some other table'}]}},
      {code: 0, data: {table_id: 'tblNew'}},
    ]);
    const result = await findOrCreateExternalLinksTable({...deps, fetchFeishu});
    expect(result.tableId).toBe('tblNew');
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toContain('/tables');
    expect(calls[1].options.method).toBe('post');
    const body = JSON.parse(String(calls[1].options.body));
    expect(body.table.name).toBe('外链健康检测');
    expect(body.table.fields).toHaveLength(EXTERNAL_LINK_TABLE_FIELDS.length);
  });

  it('surfaces a non-zero list-tables API code', async () => {
    const {fetchFeishu} = recorder([{code: 99991661, msg: 'Missing access token for authorization.'}]);
    await expect(findOrCreateExternalLinksTable({...deps, fetchFeishu})).rejects.toThrow(/99991661/);
  });
});

describe('writeExternalLinksTable', () => {
  it('deletes existing records then batch-creates the new ones, writing Url fields as {link, text}', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [{record_id: 'rec1'}, {record_id: 'rec2'}], has_more: false}},
      {code: 0, data: {}},
      {code: 0, data: {}},
    ]);
    const rows = mapLinkCheckReportToRows(report(), 'en', 'https://github.com/x/y/actions/runs/1');
    await writeExternalLinksTable(rows, {...deps, fetchFeishu, tableId: 'tbl1'});

    expect(calls).toHaveLength(3);
    expect(calls[0].url).toContain('/records?page_size=500');
    expect(calls[1].url).toContain('/records/batch_delete');
    expect(JSON.parse(String(calls[1].options.body)).records).toEqual(['rec1', 'rec2']);
    expect(calls[2].url).toContain('/records/batch_create');
    const createBody = JSON.parse(String(calls[2].options.body));
    expect(createBody.records[0].fields.URL).toEqual({link: 'https://example.com/gone', text: 'https://example.com/gone'});
    expect(createBody.records[0].fields.WorkflowRun).toEqual({link: 'https://github.com/x/y/actions/runs/1', text: 'https://github.com/x/y/actions/runs/1'});
  });

  it('omits an empty WorkflowRun Url value instead of sending an empty string', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: [], has_more: false}},
      {code: 0, data: {}},
    ]);
    const rows = mapLinkCheckReportToRows(report(), 'en', '');
    await writeExternalLinksTable(rows, {...deps, fetchFeishu, tableId: 'tbl1'});
    const createBody = JSON.parse(String(calls[1].options.body));
    expect(createBody.records[0].fields.WorkflowRun).toBeUndefined();
  });

  it('fails on a non-zero API code', async () => {
    const {fetchFeishu} = recorder([{code: 1254068, msg: 'URLFieldConvFail'}]);
    await expect(writeExternalLinksTable(mapLinkCheckReportToRows(report(), 'en', ''), {...deps, fetchFeishu, tableId: 'tbl1'}))
      .rejects.toThrow(/1254068/);
  });
});
