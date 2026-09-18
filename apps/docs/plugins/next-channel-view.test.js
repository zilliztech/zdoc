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
