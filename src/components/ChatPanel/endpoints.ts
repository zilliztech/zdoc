export const DEFAULT_CHAT_ENDPOINT = '/api/chat';

export function getChatApiBase(chatEndpoint: string): string {
  const normalized = chatEndpoint.replace(/\/+$/, '');
  if (normalized.endsWith('/chat')) return normalized.slice(0, -'/chat'.length);
  return normalized;
}

export function getSearchEndpoint(chatEndpoint: string): string {
  return `${getChatApiBase(chatEndpoint)}/search`;
}

export function getFeedbackEndpoint(chatEndpoint: string): string {
  return `${getChatApiBase(chatEndpoint)}/feedback`;
}
