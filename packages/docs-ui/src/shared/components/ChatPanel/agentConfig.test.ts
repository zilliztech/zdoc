import { describe, expect, it } from 'vitest';

import {getChatAgentConfig} from './agentConfig';

describe('getChatAgentConfig', () => {
  it('returns the English docs contract for the English site in every environment', () => {
    expect(getChatAgentConfig('en')).toEqual({
      agentConfigCode: 'zilliz_docs_agent',
      site: 'docs.zilliz.com',
    });
  });

  it('returns the Chinese docs contract for the Chinese site in every environment', () => {
    expect(getChatAgentConfig('zh-CN')).toEqual({
      agentConfigCode: 'zilliz_docs_cn_agent',
      site: 'docs.zilliz.com.cn',
    });
  });

  it('defaults unknown profiles to the English docs contract', () => {
    expect(getChatAgentConfig(undefined)).toEqual({
      agentConfigCode: 'zilliz_docs_agent',
      site: 'docs.zilliz.com',
    });
  });
});
