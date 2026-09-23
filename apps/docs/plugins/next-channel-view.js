'use strict';

// Static build capabilities (.md copies, llms.txt) cannot evaluate the runtime
// release channel, so they must render the CURRENT view of block-level gates —
// the same view prerendering produces: `action="include"` content is dropped,
// `action="exclude"` content is unwrapped. Gate blocks may themselves contain
// fenced code examples, so gate state must carry across fence segments: an
// include gate drops the fences it spans, an exclude gate keeps them. An
// unterminated include gate drops the remainder (fail closed: staged prose must
// never leak into a static artifact); an unterminated exclude gate keeps its
// content, matching the CURRENT view. Inside fenced code the channel
// directives (`(next|current)-channel-(next-line|start|end)`, any of the five
// product comment styles) resolve the same way and the directive comment lines
// themselves are removed; fences without directives stay byte-identical (tags
// shown there are literal examples). NEXT-channel pages are skipped upstream
// by the page-level front-matter gate; this resolver handles the blocks that
// remain inside CURRENT pages. Both grammars are fixed by the Fetch lint, so
// strict patterns are safe.
const FENCED_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;
const GATE_OPEN_TAG = /<NextChannel action="(include|exclude)">/;
const GATE_CLOSE_TAG = '</NextChannel>';
const CHANNEL_DIRECTIVE_HINT = /(next|current)-channel-(next-line|start|end)/;

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

// Scan one prose segment for gate tags, carrying gate state in and out so a
// gate that spans fenced segments resolves as a single block.
function resolveProseSegment(segment, gate) {
  let output = '';
  let cursor = 0;
  let activeGate = gate;
  while (cursor < segment.length) {
    if (activeGate === null) {
      const open = segment.slice(cursor).match(GATE_OPEN_TAG);
      if (!open) {
        output += segment.slice(cursor);
        break;
      }
      output += segment.slice(cursor, cursor + open.index);
      activeGate = open[1];
      cursor += open.index + open[0].length;
      continue;
    }
    const closeIndex = segment.indexOf(GATE_CLOSE_TAG, cursor);
    if (closeIndex === -1) {
      if (activeGate === 'exclude') output += segment.slice(cursor);
      break;
    }
    if (activeGate === 'exclude') output += segment.slice(cursor, closeIndex);
    cursor = closeIndex + GATE_CLOSE_TAG.length;
    activeGate = null;
  }
  return {output, gate: activeGate};
}

function resolveNextChannelCurrentView(content) {
  const text = String(content);
  if (!text.includes('<NextChannel') && !CHANNEL_DIRECTIVE_HINT.test(text)) return text;
  const parts = [];
  let gate = null;
  const segments = text.split(FENCED_SEGMENT);
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (index % 2 === 1) {
      if (gate !== 'include') parts.push(resolveFenceToCurrentView(segment));
      continue;
    }
    const resolved = resolveProseSegment(segment, gate);
    parts.push(resolved.output);
    gate = resolved.gate;
  }
  return parts.join('');
}

module.exports = {resolveNextChannelCurrentView};
