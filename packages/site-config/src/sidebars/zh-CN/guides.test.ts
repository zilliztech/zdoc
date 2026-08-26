import {describe, expect, it} from 'vitest';

import {insertToolsSidebarFragment} from './guides-layout.ts';

describe('Chinese Guides Tools navigation position', () => {
  it('replaces the thin base Tools slot with the owned fragment without moving other sections', () => {
    const base = [
      {label: '从这里开始'},
      {label: '开发指南'},
      {label: '运维指南'},
      {label: '客户端参考'},
      {label: '工具'},
      {label: 'AI 模型'},
    ];
    const fragment = [{label: '工具（完整）'}];

    expect(insertToolsSidebarFragment(base, fragment).map(item => item.label)).toEqual([
      '从这里开始', '开发指南', '运维指南', '客户端参考', '工具（完整）', 'AI 模型',
    ]);
    expect(base.map(item => item.label)).toEqual([
      '从这里开始', '开发指南', '运维指南', '客户端参考', '工具', 'AI 模型',
    ]);
  });
});
