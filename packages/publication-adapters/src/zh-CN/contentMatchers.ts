const IDENTIFIER = 'A-Za-z0-9_';

export function normalizeDecoratedHttpSchemes(contents: string): string {
  return contents.replace(/<(i|em|strong|b)>http<\/\1>s:\/\//giu, 'https://');
}

export function replaceStandaloneEndpointToken(contents: string, token: string, replacement: string): string {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const matcher = new RegExp(`(?<![${IDENTIFIER}])https?://${escaped}(?![${IDENTIFIER}])|(?<![${IDENTIFIER}:\\/])${escaped}(?![${IDENTIFIER}])`, 'gu');
  return contents.replace(matcher, replacement);
}
