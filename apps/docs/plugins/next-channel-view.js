'use strict';

// Static build capabilities (.md copies, llms.txt) cannot evaluate the runtime
// release channel, so they must render the CURRENT view of block-level gates —
// the same view prerendering produces: `action="include"` content is dropped,
// `action="exclude"` content is unwrapped. Fenced code stays untouched (tags
// shown there are literal examples). NEXT-channel pages are skipped upstream
// by the page-level front-matter gate; this resolver handles the blocks that
// remain inside CURRENT pages. The tag grammar is fixed by the Fetch lint
// (exactly one action attribute), so strict patterns are safe.
const NEXT_CHANNEL_INCLUDE = /<NextChannel action="include">[\s\S]*?<\/NextChannel>/g;
const NEXT_CHANNEL_EXCLUDE = /<NextChannel action="exclude">([\s\S]*?)<\/NextChannel>/g;
const FENCED_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;

function resolveCurrentViewSegment(segment) {
  return segment.replace(NEXT_CHANNEL_INCLUDE, '').replace(NEXT_CHANNEL_EXCLUDE, '$1');
}

function resolveNextChannelCurrentView(content) {
  const text = String(content);
  if (!text.includes('<NextChannel')) return text;
  return text
    .split(FENCED_SEGMENT)
    .map((segment, index) => (index % 2 === 1 ? segment : resolveCurrentViewSegment(segment)))
    .join('');
}

module.exports = {resolveNextChannelCurrentView};
