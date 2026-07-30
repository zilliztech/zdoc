import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {captureRoutes} from './capture-routes.mjs';
import {compareRouteInventories} from './compare-routes.mjs';

function temporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-routes-'));
}

function write(root, relativePath, contents = '<html></html>') {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function inventory(routes, site = 'en') {
  return {schemaVersion: 1, site, routes};
}

const page = route => ({route, kind: 'page'});

test('captures normalized sorted routes and redirect behavior without asset noise', () => {
  const root = temporaryDirectory();
  write(root, 'docs/start/index.html', '<link rel="canonical" href="https://docs.example.com/docs/start">');
  write(root, 'index.html');
  write(root, 'old.html', '<meta http-equiv="refresh" content="0; url=/docs/start"><link rel="canonical" href="https://docs.example.com/docs/start">');
  write(root, 'assets/app.abc123.js', 'chunk');
  write(root, 'ja-JP/docs/start.html');

  assert.deepEqual(captureRoutes({buildDirectory: root, site: 'en', excludePathPrefixes: ['ja-JP']}), {
    ...inventory([
    {route: '/', kind: 'page'},
    {route: '/docs/start', kind: 'page', canonical: 'https://docs.example.com/docs/start'},
    {route: '/old', kind: 'redirect', redirectTo: '/docs/start', canonical: 'https://docs.example.com/docs/start'},
    ]),
    excludedPathPrefixes: ['ja-JP'],
  });
});

test('rejects route collisions instead of silently collapsing them', () => {
  const root = temporaryDirectory();
  write(root, 'foo.html');
  write(root, 'foo/index.html');
  assert.throws(
    () => captureRoutes({buildDirectory: root, site: 'en'}),
    /route collision.*(?:foo\.html.*foo\/index\.html|foo\/index\.html.*foo\.html)/i,
  );
});

test('rejects symlinks and a build directory that is not a directory', () => {
  const root = temporaryDirectory();
  write(root, 'target.html');
  fs.symlinkSync('target.html', path.join(root, 'alias.html'));
  assert.throws(() => captureRoutes({buildDirectory: root, site: 'en'}), /symlink/i);
  assert.throws(() => captureRoutes({buildDirectory: path.join(root, 'target.html'), site: 'en'}), /directory/i);
});

test('accepts identical and equivalent deterministic inventories', () => {
  const routes = [page('/'), page('/docs')];
  assert.deepEqual(compareRouteInventories({
    legacy: inventory(routes), replacement: inventory([...routes]), approved: {schemaVersion: 1, differences: []}, site: 'en',
  }).differences, []);
});

test('reports unclassified missing, extra, and redirect differences', () => {
  const result = compareRouteInventories({
    legacy: inventory([page('/'), page('/missing'), {route: '/old', kind: 'redirect', redirectTo: '/docs'}]),
    replacement: inventory([page('/'), page('/extra'), {route: '/old', kind: 'redirect', redirectTo: '/new'}]),
    approved: {schemaVersion: 1, differences: []}, site: 'en',
  });
  assert.deepEqual(result.unclassified.map(item => `${item.type}:${item.route}`), [
    'extra:/extra', 'missing:/missing', 'changed:/old',
  ]);
});

test('uses only bounded matching approvals for the requested site', () => {
  const difference = {
    site: 'en', capability: 'routes.extra', matcher: 'extra:/new', category: 'intentional-change',
    reason: 'Published English landing page', approvedBy: 'docs-platform', expiresWhen: 'content launch completed',
    rationale: {type: 'addition', detail: 'Adds the reviewed English launch route /new.'},
  };
  const result = compareRouteInventories({
    legacy: inventory([]), replacement: inventory([page('/new')]),
    approved: {schemaVersion: 1, differences: [difference]}, site: 'en',
  });
  assert.equal(result.unclassified.length, 0);
  assert.deepEqual(result.approvalsUsed, ['extra:/new']);
  assert.throws(() => compareRouteInventories({
    legacy: inventory([]), replacement: inventory([page('/new')]),
    approved: {schemaVersion: 1, differences: [{...difference, site: 'zh-CN'}]}, site: 'en', failOnDifferences: true,
  }), /unclassified/i);
});

test('rejects malformed, expired, and unused approvals', () => {
  const base = {
    site: 'en', capability: 'routes.extra', matcher: 'extra:/new', category: 'intentional-change',
    reason: 'Published English landing page', approvedBy: 'docs-platform',
    rationale: {type: 'addition', detail: 'Adds the reviewed English launch route /new.'},
  };
  const args = {legacy: inventory([]), replacement: inventory([]), site: 'en'};
  assert.throws(() => compareRouteInventories({...args, approved: {schemaVersion: 1, differences: [{...base, matcher: 'extra:*'}]}}), /bounded/i);
  assert.throws(() => compareRouteInventories({...args, approved: {schemaVersion: 1, differences: [{...base, expiresWhen: '2020-01-01'}]}}), /expired/i);
  assert.throws(() => compareRouteInventories({...args, approved: {schemaVersion: 1, differences: [base]}}), /unused/i);
  assert.throws(() => compareRouteInventories({
    legacy: inventory([]), replacement: inventory([page('/new')]), site: 'en',
    approved: {schemaVersion: 1, differences: [{...base, rationale: undefined}]},
  }), /rationale/i);
  assert.throws(() => compareRouteInventories({
    legacy: inventory([page('/old')]), replacement: inventory([page('/new')]), site: 'en',
    approved: {schemaVersion: 1, differences: [
      {...base, matcher: 'missing:/old', rationale: {type: 'rename', from: '/wrong', to: '/new'}},
      {...base, matcher: 'extra:/new', rationale: {type: 'rename', from: '/old', to: '/new'}},
    ]},
  }), /rationale/i);
  assert.throws(() => compareRouteInventories({
    legacy: inventory([page('/old')]), replacement: inventory([]), site: 'en',
    approved: {schemaVersion: 1, differences: [{
      ...base,
      matcher: 'missing:/old',
      rationale: {type: 'rename', from: '/old', to: '/new'},
    }]},
  }), /paired/i);
});

test('rejects mismatched inventory sites', () => {
  assert.throws(() => compareRouteInventories({
    legacy: inventory([], 'zh-CN'), replacement: inventory([], 'en'),
    approved: {schemaVersion: 1, differences: []}, site: 'en',
  }), /site/i);
});
