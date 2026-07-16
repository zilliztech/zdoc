import {describe, expect, it} from 'vitest';

import {
  readBaseText,
  readProhibitedVariants,
  writeBaseDateTime,
  writeBaseUrl,
  writeProhibitedVariants,
} from '../src/adapters/lark-base-cells.js';

describe('Feishu Base cell codecs', () => {
  it('reads text, label, and URL response shapes', () => {
    expect(readBaseText('mirror')).toBe('mirror');
    expect(readBaseText({text: 'Chinese', link: 'https://example.feishu.cn/docx/zh'}))
      .toBe('https://example.feishu.cn/docx/zh');
    expect(readBaseText([{text: 'active'}])).toBe('active');
    expect(readBaseText({name: 'review_required'})).toBe('review_required');
    expect(readBaseText('[https://example.feishu.cn/docx/en](https://example.feishu.cn/docx/en)'))
      .toBe('https://example.feishu.cn/docx/en');
  });

  it('writes URL strings without inventing a display label', () => {
    expect(writeBaseUrl('https://example.feishu.cn/docx/en')).toBe('https://example.feishu.cn/docx/en');
    expect(writeBaseUrl(undefined)).toBeNull();
  });

  it('writes ISO timestamps as Asia/Shanghai Base date-time values', () => {
    expect(writeBaseDateTime('2026-07-16T01:02:03.000Z')).toBe('2026-07-16 09:02:03');
    expect(writeBaseDateTime(undefined)).toBeNull();
    expect(() => writeBaseDateTime('not-a-date')).toThrow(expect.objectContaining({subtype: 'base_datetime_invalid'}));
  });

  it('supports legacy JSON and human-readable glossary variants', () => {
    expect(readProhibitedVariants('["群集","集群组"]')).toEqual(['群集', '集群组']);
    expect(readProhibitedVariants('群集\n集群组\n')).toEqual(['群集', '集群组']);
    expect(writeProhibitedVariants(['群集', '集群组'])).toBe('群集\n集群组');
  });
});
