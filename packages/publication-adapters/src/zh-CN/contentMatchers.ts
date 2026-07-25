export const JAVASCRIPT_IDENTIFIER_CONTINUE = String.raw`\p{ID_Continue}$\u200C\u200D`;

export function normalizeDecoratedHttpSchemes(contents: string): string {
  return contents.replace(/<(i|em|strong|b)>http<\/\1>s:\/\//giu, 'https://');
}

export function replaceStandaloneEndpointToken(contents: string, token: string, replacement: string): string {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const matcher = new RegExp(
    `(?<![${JAVASCRIPT_IDENTIFIER_CONTINUE}])https?://${escaped}(?![${JAVASCRIPT_IDENTIFIER_CONTINUE}])|(?<![${JAVASCRIPT_IDENTIFIER_CONTINUE}:\\/])${escaped}(?![${JAVASCRIPT_IDENTIFIER_CONTINUE}])`,
    'gu',
  );
  return contents.replace(matcher, replacement);
}
