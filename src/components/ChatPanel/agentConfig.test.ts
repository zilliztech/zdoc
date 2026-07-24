import { describe, expect, it } from 'vitest';

import { getChatAgentConfigCode } from './agentConfig';

describe('getChatAgentConfigCode', () => {
  it('returns the production agent for docs.zilliz.com', () => {
    expect(getChatAgentConfigCode('docs.zilliz.com')).toBe('zilliz_agent_prod');
  });

  it('returns the development agent for UAT and preview hostnames', () => {
    expect(getChatAgentConfigCode('docs.cloud-uat3.zilliz.com')).toBe('zilliz_agent_dev');
    expect(getChatAgentConfigCode('preview.example.com')).toBe('zilliz_agent_dev');
  });

  it('returns the development agent for localhost and an empty hostname', () => {
    expect(getChatAgentConfigCode('localhost')).toBe('zilliz_agent_dev');
    expect(getChatAgentConfigCode('')).toBe('zilliz_agent_dev');
  });
});
