'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const spaRedirectMapPlugin = require('./index');

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');

function buildPlugin(rules, context = {}) {
  return spaRedirectMapPlugin(context, {rules});
}

const EN_JA_I18N = {currentLocale: 'en', defaultLocale: 'en', locales: ['en', 'ja-JP']};
const JA_I18N = {currentLocale: 'ja-JP', defaultLocale: 'en', locales: ['en', 'ja-JP']};
const MIXED_RULES = [
  {from: '/docs/old', to: '/docs/new'},
  {from: '/ja-JP/docs/setup-a-private-link', to: '/ja-JP/docs/setup-a-private-link-aws'},
];
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

test('locale-prefixed targets validate against prefix-less locale build routes', async () => {
  // Regression x2: postBuild hands out routes WITHOUT the locale prefix in
  // every locale build, so both the en and the ja-JP build must compare the
  // /ja-JP target after stripping its prefix. Untranslated pages fall back to
  // the default locale's content, so the route inventories are equivalent.
  for (const i18n of [EN_JA_I18N, JA_I18N]) {
    const plugin = buildPlugin(MIXED_RULES, {i18n});
    await plugin.postBuild({routesPaths: ['/docs/new', '/docs/setup-a-private-link-aws'], baseUrl: '/'});
  }
});

test('a missing target still fails in any locale build', async () => {
  for (const i18n of [EN_JA_I18N, JA_I18N]) {
    const plugin = buildPlugin(MIXED_RULES, {i18n});
    await assert.rejects(
      () => plugin.postBuild({routesPaths: ['/docs/new'], baseUrl: '/'}),
      /redirect \/ja-JP\/docs\/setup-a-private-link -> \/ja-JP\/docs\/setup-a-private-link-aws targets a route/,
    );
  }
});

test('global data keeps the full map in every locale build', async () => {
  for (const i18n of [EN_JA_I18N, JA_I18N]) {
    const plugin = buildPlugin(MIXED_RULES, {i18n});
    let globalData;
    plugin.contentLoaded({
      content: await plugin.loadContent(),
      actions: {setGlobalData: data => {
        globalData = data;
      }},
    });
    assert.deepEqual(globalData, MIXED_RULES);
  }
});
