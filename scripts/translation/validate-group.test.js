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

test('Chinese Reference landing validation checks each canonical landing file', () => {
  assert.deepEqual(commandsForTranslationGroup({target: 'zh-CN-reference', group: 'reference-landings'}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/python/python/python.md', '--check']],
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/java/java/java.md', '--check']],
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/nodejs/nodejs/nodejs.md', '--check']],
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/go/go/go.md', '--check']],
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/cli/cli/Overview.md', '--check']],
  ]);
});

test('Japanese validation uses its existing group checks and retired Tools is rejected', () => {
  assert.throws(() => commandsForTranslationGroup({target: 'zh-CN-tools', group: 'guides'}), /unsupported/i);
  assert.deepEqual(commandsForTranslationGroup({target: 'ja-JP', group: 'java'}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', 'java']],
  ]);
});
