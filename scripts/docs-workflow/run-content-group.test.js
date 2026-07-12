const assert = require('node:assert/strict');
const { test } = require('node:test');
const { commandsFor, parseArgs, runContentGroup } = require('./run-content-group');
const fetch = (manual, ...args) => ['npx', 'docusaurus', 'fetch-lark-docs', '-man', manual, ...args];

test('python commands are exact and ordered', () => assert.deepEqual(commandsFor('python'), [
  fetch('python', '-src-only'), fetch('pymilvus25', '-src-only'), fetch('pymilvus26', '-src-only'),
  fetch('pymilvus30', '-tar', 'zilliz', '-s3', '--incremental', '--buildEnv', 'uat'), fetch('pymilvus30', '-tar', 'zilliz', '-post'),
]));
test('guides commands preserve flags and order without reporting', () => assert.deepEqual(commandsFor('guides'), [
  fetch('guides', '-tar', 'zilliz.saas', '-s3', '--incremental', '--buildEnv', 'uat', '--auditCanonicalLinks'),
  fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'), fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS'), fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
]));
test('rest group is isolated', () => assert.deepEqual(commandsFor('rest'), [['npx', 'docusaurus', 'fetch-apifox-docs', '-s', 'plugins/apifox-docs/meta/openapi/']]));
test('commandsFor returns defensive copies', () => { const result = commandsFor('python'); result[0][0] = 'changed'; result.push(['extra']); assert.equal(commandsFor('python')[0][0], 'npx'); assert.equal(commandsFor('python').length, 5); });
test('runContentGroup executes sequentially with supplied environment', () => { const calls = []; const env = { TEST: 'yes' }; runContentGroup('go', { env, spawnSync(command, args, options) { calls.push([command, args, options]); return { status: 0 }; } }); assert.deepEqual(calls.map(([command, args]) => [command, ...args]), commandsFor('go')); assert.ok(calls.every(([, , options]) => options.stdio === 'inherit' && options.env === env)); });
test('runContentGroup stops on first failure', () => { let calls = 0; assert.throws(() => runContentGroup('go', { spawnSync() { calls += 1; return { status: calls === 1 ? 7 : 0 }; } }), /go.*npx docusaurus fetch-lark-docs.*status 7/i); assert.equal(calls, 1); });
test('runContentGroup throws spawn errors', () => { const cause = new Error('spawn broke'); assert.throws(() => runContentGroup('rest', { spawnSync() { return { error: cause }; } }), (error) => error === cause); });
test('runContentGroup rejects signal-only results descriptively', () => assert.throws(() => runContentGroup('rest', { spawnSync() { return { status: null, signal: 'SIGTERM' }; } }), /rest.*SIGTERM/i));
test('unknown groups and malformed CLI arguments fail clearly', () => { assert.throws(() => commandsFor('unknown'), /Unknown content group: unknown/); assert.deepEqual(parseArgs(['--group', 'java']), { group: 'java' }); assert.throws(() => parseArgs([]), /--group/); assert.throws(() => parseArgs(['--group']), /--group/); assert.throws(() => parseArgs(['--wat']), /Unknown argument/); });
