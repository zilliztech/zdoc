'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {commandsForTranslationGroup} = require('./validate-group');

test('Chinese SDK validation is scoped to the selected group', () => {
  const commands = commandsForTranslationGroup({target: 'zh-CN-reference', group: 'python'});
  assert.deepEqual(commands, [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/python', '--check']],
  ]);
  assert.equal(JSON.stringify(commands).includes('validate-reference'), false);
});

test('Tools and Japanese validation use their existing group checks', () => {
  assert.deepEqual(commandsForTranslationGroup({target: 'zh-CN-tools', group: 'guides'}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/guides/tutorials/tools']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'zh-CN-tools', '--group', 'tools']],
    ['pnpm', ['docs-tooling', 'validate-tools-sidebar']],
  ]);
  assert.deepEqual(commandsForTranslationGroup({target: 'ja-JP', group: 'java'}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', 'java']],
  ]);
});
