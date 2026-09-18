'use strict';

// Static build capabilities (.md copies, llms.txt) cannot evaluate the runtime
// release channel, so they must render the CURRENT view of block-level gates —
// the same view prerendering produces: `action="include"` content is dropped,
// `action="exclude"` content is unwrapped. Inside fenced code the channel
// directives (`(next|current)-channel-(next-line|start|end)`, any of the five
// product comment styles) resolve the same way and the directive comment lines
// themselves are removed; fences without directives stay byte-identical (tags
// shown there are literal examples). NEXT-channel pages are skipped upstream
// by the page-level front-matter gate; this resolver handles the blocks that
// remain inside CURRENT pages. Both grammars are fixed by the Fetch lint, so
// strict patterns are safe.
const NEXT_CHANNEL_INCLUDE = /<NextChannel action="include">[\s\S]*?<\/NextChannel>/g;
const NEXT_CHANNEL_EXCLUDE = /<NextChannel action="exclude">([\s\S]*?)<\/NextChannel>/g;
const FENCED_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;

const CHANNEL_DIRECTIVE_BODY = '(next|current)-channel-(next-line|start|end)';
const CHANNEL_DIRECTIVE_PATTERNS = [
  new RegExp(`^(\\s*)#\\s*${CHANNEL_DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^(\\s*)//\\s*${CHANNEL_DIRECTIVE_BODY}\\s*$`),
  new RegExp(`^(\\s*)/\\*\\s*${CHANNEL_DIRECTIVE_BODY}\\s*\\*/\\s*$`),
  new RegExp(`^(\\s*)<!--\\s*${CHANNEL_DIRECTIVE_BODY}\\s*-->\\s*$`),
  new RegExp(`^(\\s*)\\{/\\*\\s*${CHANNEL_DIRECTIVE_BODY}\\s*\\*/\\}\\s*$`),
];

function parseChannelDirective(line) {
  for (const pattern of CHANNEL_DIRECTIVE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return {channel: match[2], operation: match[3]};
  }
  return null;
}

function resolveFenceToCurrentView(fence) {
  if (!/(next|current)-channel-(next-line|start|end)/.test(fence)) return fence;
  const output = [];
  let activeRegion = null;
  let pendingLine = null;
  for (const line of fence.split('\n')) {
    const directive = parseChannelDirective(line);
    if (directive) {
      if (directive.operation === 'next-line') pendingLine = directive.channel;
      else if (directive.operation === 'start') activeRegion = directive.channel;
      else activeRegion = null;
      continue;
    }
    const lineChannel = pendingLine ?? activeRegion;
    pendingLine = null;
    if (lineChannel === null || lineChannel === 'current') output.push(line);
  }
  return output.join('\n');
}

function resolveCurrentViewSegment(segment) {
  return segment.replace(NEXT_CHANNEL_INCLUDE, '').replace(NEXT_CHANNEL_EXCLUDE, '$1');
}

function resolveNextChannelCurrentView(content) {
  const text = String(content);
  if (!text.includes('<NextChannel') && !/(next|current)-channel-(next-line|start|end)/.test(text)) return text;
  return text
    .split(FENCED_SEGMENT)
    .map((segment, index) => (index % 2 === 1 ? resolveFenceToCurrentView(segment) : resolveCurrentViewSegment(segment)))
    .join('');
}

module.exports = {resolveNextChannelCurrentView};
