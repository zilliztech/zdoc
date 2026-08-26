import {describe, expect, it} from 'vitest';

import {buildReportRows, categoryLabel} from './reportBrokenLinks.ts';
import {parseBrokenLinkAnalysisReport} from './brokenLinkAnalysis.ts';

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
});
