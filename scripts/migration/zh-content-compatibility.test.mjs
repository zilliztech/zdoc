import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizeZhImportedContent} from './zh-content-compatibility.ts';

test('normalizes pinned Chinese source text without crossing adjacent bold spans or links', () => {
  // These are fixed excerpts from the pinned zdoc_cn source blobs, rather than
  // already-normalized target files. Keeping the fixture inline makes the
  // migration transform reproducible without a runtime dependency on zdoc_cn.
  const input = [
    '**建议：**首次注册后请尽早添加支付方式。',
    '同样的数据量只需要 12 CU 就够了，**节省 25% 的 CU 成本**。如果您的场景对 recall 要求在 90% 以上就可以接受。',
    '相邻强调：**先**与**后**保持不变。',
    '具体价格请[联系销售](https://zilliz.com.cn/contact-sales)。',
  ].join('\n');

  const output = normalizeZhImportedContent(input);

  assert.equal(output, [
    '**建议**：首次注册后请尽早添加支付方式。',
    '同样的数据量只需要 12 CU 就够了，**节省 25% 的 CU 成本**。如果您的场景对 recall 要求在 90% 以上就可以接受。',
    '相邻强调：**先**与**后**保持不变。',
    '具体价格请[联系销售](https://zilliz.com.cn/contact-sales)。',
  ].join('\n'));
});
