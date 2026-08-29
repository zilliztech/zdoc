import {describe, expect, it} from 'vitest';

import {mapCanonicalReportToRows, parseCanonicalLinkReport} from './reportCanonicalLinks.ts';

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
