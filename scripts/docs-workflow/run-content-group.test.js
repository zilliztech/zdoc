const assert = require('node:assert/strict');
const { test } = require('node:test');
const { commandsFor, commandsForGuidesStage, parseArgs, runContentGroup } = require('./run-content-group');

const tooling = (action, manual, stage = `tmp/docs-tooling/en/${manual}`) => [
  'pnpm', 'docs-tooling', action,
  '--manual', manual,
  '--site', 'en',
  '--stage', stage,
];
const pipeline = manual => [tooling('fetch', manual), tooling('validate', manual), tooling('publish', manual)];

for (const manual of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
  test(`${manual} commands use the docs-tooling compatibility CLI`, () => {
    assert.deepEqual(commandsFor(manual), pipeline(manual));
  });
}

test('guides publishes the SaaS and BYOC manuals through disjoint stages', () => {
  assert.deepEqual(commandsFor('guides'), [...pipeline('guides'), ...pipeline('guides-byoc')]);
});

test('guides stages preserve the existing split workflow boundary', () => {
  assert.deepEqual(commandsForGuidesStage('source'), [tooling('fetch', 'guides')]);
  assert.deepEqual(commandsForGuidesStage('saas'), [tooling('validate', 'guides'), tooling('publish', 'guides')]);
  assert.deepEqual(commandsForGuidesStage('byoc'), [tooling('validate', 'guides-byoc'), tooling('publish', 'guides-byoc')]);
});

test('guides source stage preserves the forced-full bootstrap signal', () => {
  assert.deepEqual(commandsForGuidesStage('source', { forceFullFetch: true }), [tooling('fetch', 'guides')]);
  assert.deepEqual(parseArgs(['--group', 'guides', '--stage', 'source', '--force-full-fetch']), { group: 'guides', stage: 'source', forceFullFetch: true });
  assert.throws(() => parseArgs(['--group', 'guides', '--stage', 'saas', '--force-full-fetch']), /only valid.*source/i);
});

test('commandsFor returns defensive copies', () => {
  const result = commandsFor('python');
  result[0][0] = 'changed';
  result.push(['extra']);
  assert.equal(commandsFor('python')[0][0], 'pnpm');
  assert.equal(commandsFor('python').length, 3);
});

test('runContentGroup executes sequentially with supplied environment', () => {
  const calls = [];
  const env = { TEST: 'yes' };
  runContentGroup('go', {
    env,
    spawnSync(command, args, options) {
      calls.push([command, args, options]);
      return { status: 0 };
    },
  });
  assert.deepEqual(calls.map(([command, args]) => [command, ...args]), commandsFor('go'));
  assert.ok(calls.every(([, , options]) => options.stdio === 'inherit' && options.env === env));
});

test('runContentGroup forwards forced-full bootstrap through a narrow environment flag', () => {
  const calls = [];
  runContentGroup('guides', {
    stage: 'source',
    forceFullFetch: true,
    env: { BASE: 'yes' },
    spawnSync(command, args, options) {
      calls.push([command, args, options]);
      return {status: 0};
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].env.DOCS_TOOLING_FORCE_FULL_FETCH, '1');
  assert.equal(calls[0][2].env.DOCS_TOOLING_GUIDES_STAGE, 'source');
  assert.equal(calls[0][2].env.BASE, 'yes');
});

test('runContentGroup stops on first failure', () => {
  let calls = 0;
  assert.throws(() => runContentGroup('go', {
    spawnSync() {
      calls += 1;
      return { status: calls === 1 ? 7 : 0 };
    },
  }), /go.*pnpm docs-tooling fetch.*status 7/i);
  assert.equal(calls, 1);
});

test('runContentGroup wraps spawn errors with group, command, original message, and cause', () => {
  const cause = new Error('spawn broke');
  assert.throws(
    () => runContentGroup('rest', { spawnSync() { return { error: cause }; } }),
    error => {
      assert.match(error.message, /rest/);
      assert.match(error.message, /pnpm docs-tooling fetch --manual rest --site en --stage tmp\/docs-tooling\/en\/rest/);
      assert.match(error.message, /spawn broke/);
      assert.equal(error.cause, cause);
      return true;
    },
  );
});

test('runContentGroup rejects signal-only results descriptively', () => {
  assert.throws(() => runContentGroup('rest', { spawnSync() { return { status: null, signal: 'SIGTERM' }; } }), /rest.*SIGTERM/i);
});

test('unknown groups and malformed CLI arguments fail clearly', () => {
  assert.throws(() => commandsFor('unknown'), /Unknown content group: unknown/);
  assert.deepEqual(parseArgs(['--group', 'java']), { group: 'java', stage: null });
  assert.deepEqual(parseArgs(['--group', 'guides', '--stage', 'saas']), { group: 'guides', stage: 'saas' });
  assert.throws(() => parseArgs([]), /--group/);
  assert.throws(() => parseArgs(['--group']), /--group/);
  assert.throws(() => parseArgs(['--wat']), /Unknown argument/);
  assert.throws(() => parseArgs(['--group', 'java', '--stage', 'saas']), /only valid for guides/);
});
