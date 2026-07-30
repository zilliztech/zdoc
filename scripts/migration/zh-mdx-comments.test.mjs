import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizeZhMdxComments} from './zh-mdx-comments.mjs';

test('converts only prose HTML comments to MDX comments', () => {
  const input = ['---', 'note: "<!-- keep -->"', '---', '', '<!-- prose -->', '', '```xml', '<!-- fence -->', '```', '', '`<!-- inline -->`', '', '<Widget value="<!-- expression -->" />'].join('\n');
  const output = normalizeZhMdxComments(input);
  assert.match(output, /\{\/\* prose \*\/\}/);
  assert.match(output, /<!-- fence -->/);
  assert.match(output, /`<!-- inline -->`/);
  assert.match(output, /<Widget value="<!-- expression -->"/);
});
