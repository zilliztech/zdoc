import {describe, expect, it} from 'vitest';

import {insertToolsSidebarFragment} from './guides-layout.ts';

describe('Chinese Guides Tools navigation position', () => {
  it('inserts the owned fragment after the existing Chinese Tools slot without replacing other sections', () => {
    const base = ['开始', '开发', '运维', '参考', '现有工具', 'AI'];
    const fragment = ['Agent 工具'];

    expect(insertToolsSidebarFragment(base, fragment)).toEqual([
      '开始', '开发', '运维', '参考', '现有工具', 'Agent 工具', 'AI',
    ]);
    expect(base).toEqual(['开始', '开发', '运维', '参考', '现有工具', 'AI']);
  });
});
