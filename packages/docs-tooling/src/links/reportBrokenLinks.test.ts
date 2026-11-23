import {describe, expect, it} from 'vitest';

import {buildReportRows, categoryLabel, KNOWN_ITEM_LABEL, listRecordIds, renderCombinedNote, reportTableUrl, writeBrokenLinksTable} from './reportBrokenLinks.ts';
import {parseBrokenLinkAnalysisReport} from './brokenLinkAnalysis.ts';
import {parseBrokenLinksLedger} from './brokenLinksLedger.ts';

function analysis() {
  return parseBrokenLinkAnalysisReport({
    schema_version: 1,
    generated_at: '2026-08-26T00:00:00.000Z',
    site: 'en',
    summary: {broken_links: 2, broken_anchors: 0, target_missing_group: 1, target_missing: 1, reference: 0},
    items: [
      {
        category: 'target-missing-group',
        source: {path: '/docs/byoc/configure-access-logs', slug: 'configure-access-logs', group: 'paas', title: 'Configure Access Logs', docLink: 'https://zilliverse.feishu.cn/wiki/Wl2Pw'},
        target: {path: '/docs/byoc/integrate-with-alibaba-cloud-oss', slug: 'integrate-with-alibaba-cloud-oss', group: 'paas', title: 'Alibaba OSS', docLink: 'https://zilliverse.feishu.cn/wiki/IwAbwx'},
        reason: '目标 Targets=["zilliz.saas"]，不含源发布组 zilliz.paas',
      },
      {
        category: 'target-missing',
        source: {path: '/docs/home', slug: 'home', group: 'saas', title: null, docLink: null},
        target: {path: '/docs/connect-to-cluster', slug: 'connect-to-cluster', group: 'saas', title: null, docLink: null},
        reason: '目标 slug 不在源清单中',
      },
    ],
  });
}

describe('categoryLabel', () => {
  it('maps each category to its Chinese label', () => {
    expect(categoryLabel('target-missing-group')).toBe('分类一：目标在当前发布组不存在');
    expect(categoryLabel('target-missing')).toBe('分类二：目标文档不存在');
    expect(categoryLabel('reference')).toBe('自动生成 reference/agents');
    expect(categoryLabel('anchor')).toBe('断锚（锚点缺失）');
  });
});

describe('buildReportRows', () => {
  it('maps analysis items to table rows with jump links and scan time', () => {
    const rows = buildReportRows(analysis(), new Map([['/docs/byoc/configure-access-logs', 'Msm7dh']]), '2026-08-26T00:00:00.000Z');
    expect(rows).toHaveLength(2);
    expect(rows[0].站点).toBe('英文站');
    expect(rows[0].分类).toBe('分类一：目标在当前发布组不存在');
    expect(rows[0].源文档链接).toBe('https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh');
    expect(rows[0].扫描时间).toBe('2026-08-26T00:00:00.000Z');
    expect(rows[1].源文档链接).toBe('');
  });

  it('labels ledger-decided rows as known while keeping the rest untouched', () => {
    const known = new Set(['en\n/docs/home\n/docs/connect-to-cluster']);
    const rows = buildReportRows(analysis(), new Map(), '2026-08-26T00:00:00.000Z', known);
    expect(rows[0].分类).toBe('分类一：目标在当前发布组不存在');
    expect(rows[1].分类).toBe(KNOWN_ITEM_LABEL);
  });
});

describe('renderCombinedNote', () => {
  it('renders the per-site summary without a ledger section by default', () => {
    const note = renderCombinedNote([analysis()], 'https://example.feishu.cn/base/app?table=tbl');
    expect(note).toContain('- 英文站：断链 2，断锚 0，组缺失 1，目标缺失 1，自动生成 0');
    expect(note).not.toContain('已知项');
  });

  it('appends the ledger coverage section with unseen entries for closure review', () => {
    const coverage = {
      matched: [parseBrokenLinksLedger({schema_version: 1, entries: [{site: 'en', source_path: '/docs/home', target: '/docs/connect-to-cluster', note: '', decided_at: '2026-11-23T00:00:00.000Z'}]}).entries[0]],
      unseen: [parseBrokenLinksLedger({schema_version: 1, entries: [{site: 'zh-CN', source_path: '/docs/gone', target: '/docs/also-gone', note: '', decided_at: '2026-11-23T00:00:00.000Z'}]}).entries[0]],
    };
    const note = renderCombinedNote([analysis()], 'https://example.feishu.cn/base/app?table=tbl', coverage);
    expect(note).toContain('- 已知项（ledger）：1 条已抑制标注，1 条本轮未再现');
    expect(note).toContain('  - 未再现：`zh-CN` `/docs/gone` → `/docs/also-gone`（考虑评审移除 ledger 条目）');
  });
});

describe('reportTableUrl', () => {
  it('builds a web-accessible Feishu base URL from the web host', () => {
    expect(reportTableUrl('app', 'tbl', 'https://zilliverse.feishu.cn')).toBe('https://zilliverse.feishu.cn/base/app?table=tbl');
    expect(reportTableUrl('app', 'tbl', 'https://zilliverse.feishu.cn/')).toBe('https://zilliverse.feishu.cn/base/app?table=tbl');
  });
});

const writeDeps = {appToken: 'app', tableId: 'tbl', token: 'tenant-token', host: 'https://open.feishu.cn'};

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

describe('listRecordIds', () => {
  it('sends the tenant token and fails on non-zero code', async () => {
    const {calls, fetchFeishu} = recorder([{code: 0, data: {items: [{record_id: 'rec1'}, {record_id: 'rec2'}]}}]);
    const ids = await listRecordIds({...writeDeps, fetchFeishu});
    expect(ids).toEqual(['rec1', 'rec2']);
    expect(calls[0].options.headers).toEqual({Authorization: 'Bearer tenant-token'});

    const failing = recorder([{code: 99991661, msg: 'Missing access token for authorization.'}]);
    await expect(listRecordIds({...writeDeps, fetchFeishu: failing.fetchFeishu})).rejects.toThrow(/99991661/);
  });
});

describe('writeBrokenLinksTable', () => {
  it('writes Url fields as {link, text} objects and omits empty ones', async () => {
    const {calls, fetchFeishu} = recorder([
      {code: 0, data: {items: []}}, // list records
      {code: 0, data: {}}, // create records
    ]);
    const rows = buildReportRows(analysis(), new Map([['/docs/byoc/configure-access-logs', 'Msm7dh']]), '2026-08-26T00:00:00.000Z');
    await writeBrokenLinksTable(rows, {...writeDeps, fetchFeishu});
    const createCall = calls.find(call => call.url.endsWith('/records/batch_create'));
    expect(createCall).toBeDefined();
    const body = JSON.parse(String(createCall!.options.body));
    expect(body.records[0].fields.源文档链接).toEqual({link: 'https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh', text: 'https://zilliverse.feishu.cn/wiki/Wl2Pw#Msm7dh'});
    expect(body.records[1].fields.源文档链接).toBeUndefined(); // empty string omitted
    expect(body.records[1].fields.目标文档链接).toBeUndefined();
  });

  it('fails on non-zero API code from record creation', async () => {
    const {fetchFeishu} = recorder([
      {code: 0, data: {items: []}},
      {code: 1254068, msg: 'URLFieldConvFail'},
    ]);
    const rows = buildReportRows(analysis(), new Map(), '2026-08-26T00:00:00.000Z');
    await expect(writeBrokenLinksTable(rows, {...writeDeps, fetchFeishu})).rejects.toThrow(/1254068/);
  });
});
