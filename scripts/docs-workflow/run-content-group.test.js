const assert = require('node:assert/strict');
const { test } = require('node:test');
const { commandsFor, commandsForGuidesStage, parseArgs, runContentGroup } = require('./run-content-group');
const fetch = (manual, ...args) => ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manual, ...args];

test('python commands are exact and ordered', () => assert.deepEqual(commandsFor('python'), [
  fetch('python', '-src-only'), fetch('pymilvus25', '-src-only'), fetch('pymilvus26', '-src-only'),
  fetch('pymilvus30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('pymilvus30', '-tar', 'zilliz', '-post'),
]));
test('java commands are exact and ordered', () => assert.deepEqual(commandsFor('java'), [
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'javaV2', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'javaV225', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'javaV226', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'javaV230', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'javaV230', '-tar', 'zilliz', '-post'],
]));
test('node commands are exact and ordered', () => assert.deepEqual(commandsFor('node'), [
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'node', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs25', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs26', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs30', '-tar', 'zilliz', '-post'],
]));
test('go commands are exact and ordered', () => assert.deepEqual(commandsFor('go'), [
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'gov226', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'gov230', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'gov230', '-tar', 'zilliz', '-post'],
]));
test('cli commands are exact and ordered', () => assert.deepEqual(commandsFor('cli'), [
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'cliv13', '-src-only'],
  ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'cliv14', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'],
]));
test('SDK commands do not inherit Guides offline or table flags', () => {
  for (const group of ['python', 'java', 'node', 'go', 'cli']) {
    const flat = commandsFor(group).flat();
    for (const flag of ['--offline', '--mediaManifest', '--table', '--snapshotCandidatePath']) assert.equal(flat.includes(flag), false);
  }
});
test('guides commands preserve flags and order without reporting', () => assert.deepEqual(commandsFor('guides'), [
  fetch('guides', '-tar', 'zilliz.saas', '-s3', '--incremental', '--buildEnv', 'uat', '--auditCanonicalLinks'),
  fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'), fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS'), fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
]));
test('guides stages fetch sources once and render targets from restored sources', () => {
  assert.deepEqual(commandsForGuidesStage('source'), [fetch(
    'guides',
    '-src-only',
    '--incremental',
    '--buildEnv',
    'uat',
    '--snapshotCandidatePath',
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
  )]);
  assert.deepEqual(commandsForGuidesStage('saas'), [
    fetch('guides', '-tar', 'zilliz.saas', '-s3', '-skipS', '--buildEnv', 'uat', '--auditCanonicalLinks', '--offline', '--mediaManifest', 'plugins/lark-docs/meta/media-cache/guides.json'),
    fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'),
  ]);
  assert.deepEqual(commandsForGuidesStage('byoc'), [
    fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS', '--buildEnv', 'uat', '--skipLinkValidation', '--offline', '--mediaManifest', 'plugins/lark-docs/meta/media-cache/guides.json'),
    fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
  ]);
});
test('guides source stage supports an explicit forced-full bootstrap', () => {
  assert.deepEqual(commandsForGuidesStage('source', { forceFullFetch: true }), [fetch(
    'guides',
    '-src-only',
    '--incremental',
    '--buildEnv',
    'uat',
    '--snapshotCandidatePath',
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    '--forceFullFetch',
  )]);
  assert.deepEqual(parseArgs(['--group', 'guides', '--stage', 'source', '--force-full-fetch']), { group: 'guides', stage: 'source', forceFullFetch: true });
  assert.throws(() => parseArgs(['--group', 'guides', '--stage', 'saas', '--force-full-fetch']), /only valid.*source/i);
});
test('rest group is isolated', () => assert.deepEqual(commandsFor('rest'), [['npx', 'docusaurus', 'fetch-apifox-docs', '-s', 'plugins/apifox-docs/meta/openapi/']]));
test('commandsFor returns defensive copies', () => { const result = commandsFor('python'); result[0][0] = 'changed'; result.push(['extra']); assert.equal(commandsFor('python')[0][0], 'npx'); assert.equal(commandsFor('python').length, 5); });
test('runContentGroup executes sequentially with supplied environment', () => { const calls = []; const env = { TEST: 'yes' }; runContentGroup('go', { env, spawnSync(command, args, options) { calls.push([command, args, options]); return { status: 0 }; } }); assert.deepEqual(calls.map(([command, args]) => [command, ...args]), commandsFor('go')); assert.ok(calls.every(([, , options]) => options.stdio === 'inherit' && options.env === env)); });
test('runContentGroup stops on first failure', () => { let calls = 0; assert.throws(() => runContentGroup('go', { spawnSync() { calls += 1; return { status: calls === 1 ? 7 : 0 }; } }), /go.*npx docusaurus fetch-lark-docs.*status 7/i); assert.equal(calls, 1); });
test('runContentGroup wraps spawn errors with group, command, original message, and cause', () => {
  const cause = new Error('spawn broke');
  assert.throws(
    () => runContentGroup('rest', { spawnSync() { return { error: cause }; } }),
    (error) => {
      assert.match(error.message, /rest/);
      assert.match(error.message, /npx docusaurus fetch-apifox-docs -s plugins\/apifox-docs\/meta\/openapi\//);
      assert.match(error.message, /spawn broke/);
      assert.equal(error.cause, cause);
      return true;
    },
  );
});
test('runContentGroup rejects signal-only results descriptively', () => assert.throws(() => runContentGroup('rest', { spawnSync() { return { status: null, signal: 'SIGTERM' }; } }), /rest.*SIGTERM/i));
test('unknown groups and malformed CLI arguments fail clearly', () => { assert.throws(() => commandsFor('unknown'), /Unknown content group: unknown/); assert.deepEqual(parseArgs(['--group', 'java']), { group: 'java', stage: null }); assert.deepEqual(parseArgs(['--group', 'guides', '--stage', 'saas']), { group: 'guides', stage: 'saas' }); assert.throws(() => parseArgs([]), /--group/); assert.throws(() => parseArgs(['--group']), /--group/); assert.throws(() => parseArgs(['--wat']), /Unknown argument/); assert.throws(() => parseArgs(['--group', 'java', '--stage', 'saas']), /only valid for guides/); });
