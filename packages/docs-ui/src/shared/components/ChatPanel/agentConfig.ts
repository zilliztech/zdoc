export type ChatAgentConfigCode = 'zilliz_docs_agent' | 'zilliz_docs_cn_agent';
export type ChatRequestSite = 'docs.zilliz.com' | 'docs.zilliz.com.cn';

export interface ChatAgentConfig {
  agentConfigCode: ChatAgentConfigCode;
  site: ChatRequestSite;
}

const ENGLISH_AGENT_CONFIG: ChatAgentConfig = Object.freeze({
  agentConfigCode: 'zilliz_docs_agent',
  site: 'docs.zilliz.com',
});

const CHINESE_AGENT_CONFIG: ChatAgentConfig = Object.freeze({
  agentConfigCode: 'zilliz_docs_cn_agent',
  site: 'docs.zilliz.com.cn',
});

export function getChatAgentConfig(site: unknown): ChatAgentConfig {
  return site === 'zh-CN' ? CHINESE_AGENT_CONFIG : ENGLISH_AGENT_CONFIG;
}
