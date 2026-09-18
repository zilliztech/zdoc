import type {ReleaseChannel} from './releaseChannel';

// Code-block channel directives mirror the product code-variant comment
// family (#, //, /* */, <!-- -->, {/* */}) but form their own namespace so
// the product axis keeps its scrape-time filtering: `next-channel-*` lines
// are visible only on next deployments, `current-channel-*` only on current.
// The grammar is pinned by the Fetch lint, so these strict patterns are safe;
// the renderer stays forgiving (unbalanced directives just extend a region)
// because malformed input already fails the Fetch.
const DIRECTIVE_BODY = '(next|current)-channel-(next-line|start|end)';
const DIRECTIVE_PATTERNS = [
  new RegExp(`^(\\s*)#\\s*${DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^(\\s*)//\\s*${DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^(\\s*)/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\s*$`),
  new RegExp(`^(\\s*)<!--\\s*${DIRECTIVE_BODY}\\s*-->\\s*$`),
  new RegExp(`^(\\s*)\\{/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\}\\s*$`),
];

export type ChannelCodeLine = 'next' | 'current';
export type ChannelCodeOperation = 'next-line' | 'start' | 'end';

export interface ChannelCodeDirective {
  channel: ChannelCodeLine;
  operation: ChannelCodeOperation;
}

export function parseChannelCodeDirective(line: string): ChannelCodeDirective | null {
  for (const pattern of DIRECTIVE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      return {channel: match[2] as ChannelCodeLine, operation: match[3] as ChannelCodeOperation};
    }
  }
  return null;
}

export function containsChannelCodeDirectives(code: string): boolean {
  return /(next|current)-channel-(next-line|start|end)/.test(code);
}

/** Filter directive-marked lines to `channel` and strip the directive lines
 * themselves, preserving the trailing-newline shape of fenced code. */
export function resolveChannelCode(code: string, channel: ReleaseChannel): string {
  const hadTrailingNewline = code.endsWith('\n');
  const lines = code.split('\n');
  if (hadTrailingNewline) lines.pop();
  const output: string[] = [];
  let activeRegion: ChannelCodeLine | null = null;
  let pendingLine: ChannelCodeLine | null = null;
  for (const line of lines) {
    const directive = parseChannelCodeDirective(line);
    if (directive) {
      if (directive.operation === 'next-line') pendingLine = directive.channel;
      else if (directive.operation === 'start') activeRegion = directive.channel;
      else activeRegion = null;
      continue;
    }
    const lineChannel = pendingLine ?? activeRegion;
    pendingLine = null;
    if (lineChannel === null || lineChannel === channel) output.push(line);
  }
  const resolved = output.join('\n');
  return hadTrailingNewline ? `${resolved}\n` : resolved;
}
