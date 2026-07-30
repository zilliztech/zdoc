export type ChatAgentConfigCode = 'zilliz_agent_dev' | 'zilliz_agent_prod';

export function getChatAgentConfigCode(hostname?: string): ChatAgentConfigCode {
  const resolvedHostname = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);
  return resolvedHostname === 'docs.zilliz.com' ? 'zilliz_agent_prod' : 'zilliz_agent_dev';
}
