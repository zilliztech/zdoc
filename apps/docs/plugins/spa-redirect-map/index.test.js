'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const spaRedirectMapPlugin = require('./index');

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');

function buildPlugin(rules) {
  return spaRedirectMapPlugin({}, {rules});
}

test('keeps the plugin name in sync with the docs-ui redirect helper', () => {
  const helper = fs.readFileSync(
    path.join(REPO_ROOT, 'packages', 'docs-ui', 'src', 'shared', 'theme', 'NotFound', 'Content', 'spaRedirectMap.ts'),
    'utf8',
  );
  assert.match(helper, /export const SPA_REDIRECT_MAP_PLUGIN_NAME = 'zdoc-spa-redirect-map';/);
});

test('publishes the rules through global data', async () => {
  const rules = [{from: '/docs/old', to: '/docs/new'}];
  const plugin = buildPlugin(rules);
  let globalData;
  plugin.contentLoaded({
    content: await plugin.loadContent(),
    actions: {setGlobalData: data => {
      globalData = data;
    }},
  });
  assert.deepEqual(globalData, [{from: '/docs/old', to: '/docs/new'}]);
});

test('strips option extras so only from/to reach the client bundle', async () => {
  const plugin = buildPlugin([{from: '/docs/old', to: '/docs/new', permanent: true}]);
  assert.deepEqual(await plugin.loadContent(), [{from: '/docs/old', to: '/docs/new'}]);
});

test('rejects malformed rules at config time', () => {
  assert.throws(() => buildPlugin('nope'), /rules option must be an array/);
  assert.throws(() => buildPlugin([{from: '/docs/old'}]), /string "from" and "to"/);
  assert.throws(() => buildPlugin([{from: '/docs/old', to: '/docs/old'}]), /targets itself/);
  assert.throws(
    () => buildPlugin([{from: '/docs/a', to: '/docs/b'}, {from: '/docs/a', to: '/docs/c'}]),
    /duplicate redirect source/,
  );
});

test('rejects redirect cycles that would bounce visitors between 404s', () => {
  assert.throws(
    () => buildPlugin([{from: '/docs/a', to: '/docs/b'}, {from: '/docs/b', to: '/docs/a'}]),
    /cycle through/,
  );
  assert.throws(
    () => buildPlugin([{from: '/docs/a', to: '/docs/b'}, {from: '/docs/b', to: '/docs/c'}, {from: '/docs/c', to: '/docs/a'}]),
    /cycle through/,
  );
});

test('requires every target to be a served route, even one that chains into another rule', async () => {
  const plugin = buildPlugin([{from: '/docs/a', to: '/docs/b'}, {from: '/docs/b', to: '/docs/c'}]);
  await assert.rejects(
    () => plugin.postBuild({routesPaths: ['/docs/c'], baseUrl: '/'}),
    new RegExp(`\\[${spaRedirectMapPlugin.PluginName}\\] redirect /docs/a -> /docs/b targets a route the site does not serve`),
  );
});

test('fails the build when a target route is not served', async () => {
  const plugin = buildPlugin([{from: '/docs/old', to: '/docs/retired-target'}]);
  await assert.rejects(
    () => plugin.postBuild({routesPaths: ['/docs/home'], baseUrl: '/'}),
    /targets a route the site does not serve/,
  );
});

test('resolves targets against routes under a non-root baseUrl', async () => {
  const plugin = buildPlugin([{from: '/docs/old', to: '/docs/new'}]);
  await plugin.postBuild({routesPaths: ['/preview/', '/preview/docs/new/'], baseUrl: '/preview/'});
  await assert.rejects(
    () => plugin.postBuild({routesPaths: ['/preview/docs/other'], baseUrl: '/preview/'}),
    /targets a route the site does not serve/,
  );
});
