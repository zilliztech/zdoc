'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {commandsForTranslationGroup, parseArgs} = require('./validate-group');

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
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'content/zh-CN/reference/api/cpp/cpp/cpp.md', '--check']],
  ]);
});

test('Japanese validation uses its existing group checks and retired Tools is rejected', () => {
  assert.throws(() => commandsForTranslationGroup({target: 'zh-CN-tools', group: 'guides'}), /unsupported/i);
  assert.deepEqual(commandsForTranslationGroup({target: 'ja-JP', group: 'java'}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', 'java']],
  ]);
});

test('Japanese partial validation keeps MDX safety checks while explicitly allowing authenticated pending candidates', () => {
  assert.deepEqual(commandsForTranslationGroup({target: 'ja-JP', group: 'guides', allowPending: true}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
  ]);
  assert.deepEqual(commandsForTranslationGroup({target: 'ja-JP', group: 'guides', allowPending: false}), [
    ['pnpm', ['docs-tooling', 'validate-mdx', '--path', 'i18n/ja-JP']],
    ['pnpm', ['docs-tooling', 'validate-translation', '--target', 'ja-JP', '--group', 'guides']],
  ]);
  assert.throws(
    () => commandsForTranslationGroup({target: 'zh-CN-reference', group: 'python', allowPending: true}),
    /allow-pending.*Japanese|Japanese.*allow-pending/i,
  );
});

test('validate-group CLI requires an explicit standalone allow-pending flag', () => {
  assert.deepEqual(parseArgs(['--target', 'ja-JP', '--group', 'guides']), {
    target: 'ja-JP',
    group: 'guides',
    allowPending: false,
  });
  assert.deepEqual(parseArgs(['--target', 'ja-JP', '--group', 'guides', '--allow-pending']), {
    target: 'ja-JP',
    group: 'guides',
    allowPending: true,
  });
  assert.throws(() => parseArgs(['--target', 'ja-JP', '--group', 'guides', '--allow-pending', 'true']), /argument|allow-pending/i);
  assert.throws(() => parseArgs(['--target', 'ja-JP', '--group', 'guides', '--unknown']), /unknown|argument/i);
});
