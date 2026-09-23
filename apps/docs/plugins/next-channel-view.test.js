'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {resolveNextChannelCurrentView} = require('./next-channel-view');

test('drops include blocks and unwraps exclude blocks for the current view', () => {
  const content = [
    '# Title',
    '',
    'Always visible.',
    '',
    '<NextChannel action="include">staged for next</NextChannel>',
    '',
    '<NextChannel action="exclude">old pricing</NextChannel><NextChannel action="include">new pricing</NextChannel>',
    '',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.ok(resolved.includes('Always visible.'));
  assert.ok(!resolved.includes('staged for next'));
  assert.ok(!resolved.includes('new pricing'));
  assert.ok(resolved.includes('old pricing'));
  assert.ok(!resolved.includes('<NextChannel'));
});

test('resolves multi-line include blocks spanning sections', () => {
  const content = [
    '<NextChannel action="include">',
    '',
    '## Staged section',
    '',
    'New body.',
    '',
    '</NextChannel>',
    '',
    'Kept.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.ok(!resolved.includes('Staged section'));
  assert.ok(!resolved.includes('New body.'));
  assert.ok(resolved.includes('Kept.'));
});

test('leaves fenced code examples and tag-free content untouched', () => {
  const content = [
    'Intro.',
    '',
    '```md',
    '<NextChannel action="include">documented example</NextChannel>',
    '```',
    '',
    'Outro.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, content);
  assert.ok(resolved.includes('documented example'));
});

test('resolves inline include spans inside a prose paragraph', () => {
  const content = 'Use clusters <NextChannel action="include">with the serverless mode</NextChannel> to scale.';

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved.replace(/\s{2,}/g, ' ').trim(), 'Use clusters to scale.');
  assert.ok(!resolved.includes('serverless'));
});

test('resolves channel code directives inside fenced blocks to the current view', () => {
  const content = [
    'Intro.',
    '',
    '```python',
    'client.setup()',
    '# current-channel-start',
    'client.legacy()',
    '# current-channel-end',
    '# next-channel-start',
    'client.serverless()',
    '# next-channel-end',
    '# next-channel-next-line',
    'client.flush()',
    '```',
    '',
    'Outro.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  const expected = [
    'Intro.',
    '',
    '```python',
    'client.setup()',
    'client.legacy()',
    '```',
    '',
    'Outro.',
  ].join('\n');
  assert.equal(resolved, expected);
});

test('keeps directive-free fences byte-identical while resolving prose around them', () => {
  const content = [
    '<NextChannel action="include">staged prose</NextChannel>',
    '',
    '```python',
    '# not a channel directive',
    'plain()',
    '```',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, ['', '', '```python', '# not a channel directive', 'plain()', '```'].join('\n'));
});

test('resolves include blocks that span fenced code examples', () => {
  const content = [
    'Intro.',
    '',
    '<NextChannel action="include">',
    '',
    '## Staged section',
    '',
    '```bash',
    'curl staged-example',
    '```',
    '',
    'More staged prose.',
    '',
    '```json',
    '{"staged": true}',
    '```',
    '',
    '</NextChannel>',
    '',
    'Outro.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, ['Intro.', '', '', '', 'Outro.'].join('\n'));
  assert.ok(!resolved.includes('Staged section'));
  assert.ok(!resolved.includes('staged-example'));
  assert.ok(!resolved.includes('NextChannel'));
});

test('unwraps exclude blocks that span fenced code examples', () => {
  const content = [
    'Before.',
    '',
    '<NextChannel action="exclude">',
    'Legacy wording.',
    '',
    '```bash',
    'curl legacy-example',
    '```',
    '',
    '</NextChannel>',
    '<NextChannel action="include">',
    'Replacement.',
    '',
    '```bash',
    'curl replacement-example',
    '```',
    '',
    '</NextChannel>',
    '',
    'After.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(
    resolved,
    ['Before.', '', '', 'Legacy wording.', '', '```bash', 'curl legacy-example', '```', '', '', '', '', 'After.'].join('\n'),
  );
  assert.ok(!resolved.includes('Replacement.'));
  assert.ok(!resolved.includes('replacement-example'));
  assert.ok(!resolved.includes('NextChannel'));
});

test('drops the remainder of an unterminated include gate (fail closed)', () => {
  const content = ['Kept.', '', '<NextChannel action="include">', 'Staged without close.'].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, ['Kept.', '', ''].join('\n'));
});

test('keeps the content of an unterminated exclude gate', () => {
  const content = '<NextChannel action="exclude">current wording continues to the end';

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, 'current wording continues to the end');
});

test('resolves channel directives inside a fence that an exclude gate spans', () => {
  const content = [
    '<NextChannel action="exclude">',
    '```python',
    'client.setup()',
    '# next-channel-next-line',
    'client.staged()',
    '```',
    '</NextChannel>',
    'After.',
  ].join('\n');

  const resolved = resolveNextChannelCurrentView(content);

  assert.equal(resolved, ['', '```python', 'client.setup()', '```', '', 'After.'].join('\n'));
});
