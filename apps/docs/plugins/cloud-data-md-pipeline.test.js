'use strict';

// Integration test: cloud-data markers flow through the embed-markdown and
// llms-txt plugins. Run with `node --test apps/docs/plugins/`.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const embedMarkdown = require('./embed-markdown');
const llmsTxt = require('./llms-txt');
const {resolveCloudDataSite, resolveForSite} = require('./cloud-data-model');

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-data-md-'));
  const sourceFolder = path.join(root, 'content');
  fs.mkdirSync(sourceFolder);
  fs.writeFileSync(path.join(sourceFolder, 'regions.md'), [
    '---',
    'title: Cloud providers and regions',
    'slug: cloud-providers-and-regions',
    '---',
    '',
    '## Supported regions',
    '',
    '### AWS',
    '',
    '<CloudRegions provider="aws" />',
    '',
    '### Google Cloud',
    '',
    '<CloudRegions provider="gcp" />',
    '',
    '## Feature support',
    '',
    '<CloudFeatures matrix="features" />',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(sourceFolder, 'plain.md'), [
    '---',
    'title: Plain page',
    'slug: plain-page',
    '---',
    '',
    'Just prose, no markers.',
    '',
  ].join('\n'));

  const lifecycle = {
    outDir: path.join(root, 'build'),
    routesPaths: ['/docs/cloud-providers-and-regions', '/docs/plain-page'],
    baseUrl: '/',
    siteConfig: {url: 'https://docs.example.test', baseUrl: '/', title: 'T', customFields: {site: 'en'}},
  };
  const sources = [{id: 'default', folder: sourceFolder, route: '/docs', outputFile: 'cloud-guides', label: 'Cloud Guides'}];
  return {root, sourceFolder, lifecycle, sources};
}

test('cloud-data site resolution follows the site profile, not the locale', () => {
  assert.equal(resolveCloudDataSite({siteConfig: {customFields: {site: 'zh-CN'}}}), 'zh-CN');
  assert.equal(resolveCloudDataSite({siteConfig: {customFields: {site: 'en'}}}), 'en');
  assert.equal(resolveCloudDataSite({siteConfig: {customFields: {}}}), 'en');
  assert.equal(resolveCloudDataSite({}), 'en');
});

test('resolveForSite bakes snapshot tables in snapshot mode', () => {
  const result = resolveForSite('<CloudRegions provider="aws" />\n', 'en', 'snapshot');
  assert.equal(result.resolved.length, 1);
  assert.ok(result.content.includes('<td><p>us-west-2</p></td>'), 'live-page-shaped table bytes');
  assert.ok(!result.content.includes('<!--#'));
});

test('embed-markdown postBuild emits SSI stub+include pairs for markers only', async () => {
  const fixture = makeFixture();
  try {
    const plugin = embedMarkdown(fixture.lifecycle, {sources: fixture.sources});
    await plugin.postBuild(fixture.lifecycle);

    const written = fs.readFileSync(path.join(fixture.lifecycle.outDir, 'docs/cloud-providers-and-regions.md'), 'utf-8');
    const lines = written.split('\n');
    const blockIndex = lines.indexOf('<!--# block name="clouddata-regions-aws" -->');
    const includeIndex = lines.findIndex((line) => line.startsWith('<!--# include virtual="/api/cloud-data/fragment.md?section=regions&provider=aws&site=en" stub='));

    assert.ok(blockIndex > -1, 'snapshot stub block must be present');
    assert.ok(includeIndex > -1, 'live include directive must be present');
    assert.ok(blockIndex < includeIndex, 'the block MUST precede its include (SSI order)');
    assert.ok(written.includes('<!--# endblock -->'));
    assert.ok(written.includes('stub="clouddata-regions-aws"'));
    assert.ok(written.includes('<td><p>us-west-2</p></td>'), 'stub is the baked snapshot table');
    assert.ok(written.includes('section=features'), 'matrix markers resolve too');
    assert.ok(!written.includes('<CloudRegions'), 'no bare marker may leak');

    const plain = fs.readFileSync(path.join(fixture.lifecycle.outDir, 'docs/plain-page.md'), 'utf-8');
    assert.equal(plain, fs.readFileSync(path.join(fixture.sourceFolder, 'plain.md'), 'utf-8'), 'marker-free pages stay byte-identical');
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true});
  }
});

test('llms-txt postBuild bakes snapshot tables and never leaks tags or directives', async () => {
  const fixture = makeFixture();
  try {
    const plugin = llmsTxt(fixture.lifecycle, {sources: fixture.sources});
    await plugin.postBuild(fixture.lifecycle);

    const summary = fs.readFileSync(path.join(fixture.lifecycle.outDir, 'llms/cloud-guides.txt'), 'utf-8');
    // llms.txt is a summary-only index: the marker must not leak as a bare tag
    // and the baked table must not become the page description.
    assert.ok(!summary.includes('<CloudRegions'), 'no bare marker may leak into llms.txt');
    assert.ok(!summary.includes('<CloudFeatures'), 'no bare marker may leak into llms.txt');
    assert.ok(!summary.includes('<!--#'), 'no SSI directive may leak into llms.txt');
    assert.ok(!summary.includes('> <tr>'), 'a baked table must not become the page description');
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true});
  }
});

test('stripMdxBody drops SSI directive lines as a hard guard', async () => {
  // The llms plugin resolves markers in snapshot mode upstream; the directive
  // rule guards any raw-artifact input path. Exercise it through postBuild by
  // pre-writing an SSI-bearing source file.
  const fixture = makeFixture();
  try {
    fs.writeFileSync(path.join(fixture.sourceFolder, 'raw-ssi.md'), [
      '---',
      'title: Raw SSI',
      'slug: raw-ssi',
      '---',
      '',
      '<!--# block name="x" -->',
      '| a |',
      '<!--# endblock -->',
      '<!--# include virtual="/api/cloud-data/fragment.md" stub="x" -->',
      '',
    ].join('\n'));
    const lifecycle = {
      ...fixture.lifecycle,
      routesPaths: ['/docs/raw-ssi'],
    };
    const plugin = llmsTxt(lifecycle, {sources: [{id: 'default', folder: fixture.sourceFolder, route: '/docs', outputFile: 'cloud-guides', label: 'g'}]});
    await plugin.postBuild(lifecycle);
    const summary = fs.readFileSync(path.join(lifecycle.outDir, 'llms/cloud-guides.txt'), 'utf-8');
    assert.ok(!summary.includes('<!--#'), 'directive lines must be dropped');
    assert.ok(summary.includes('| a |'), 'table content lines survive');
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true});
  }
});
