'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { prepareContentGroupWorkspace } = require('./prepare-content-group-workspace');

function write(file, text = 'x') {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

test('rest preparation removes restored English REST outputs and preserves i18n', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-rest-prepare-'));
  write(path.join(root, 'content/en/reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'));
  write(path.join(root, 'content/en/reference/api/restful/restful/versioning.md'), '# Versioning\n');
  write(path.join(root, 'generated/en/sidebars/restful.sidebar.js'), 'module.exports=["stale"]\n');
  write(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md'));

  const result = prepareContentGroupWorkspace({
    site: 'en', group: 'rest',
    cwd: root,
    restSidebarContent: 'module.exports=["master"]\n',
    preservedContentByPath: new Map([
      ['content/en/reference/api/restful/restful/restful.md', '# REST API\n'],
      ['content/en/reference/content-manifest.json', '{"schemaVersion":1}\n'],
    ]),
  });

  assert.equal(fs.existsSync(path.join(root, 'content/en/reference/api/restful')), true);
  assert.equal(fs.existsSync(path.join(root, 'content/en/reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx')), false);
  assert.equal(fs.readFileSync(path.join(root, 'content/en/reference/api/restful/restful/versioning.md'), 'utf8'), '# Versioning\n');
  assert.equal(fs.readFileSync(path.join(root, 'content/en/reference/api/restful/restful/restful.md'), 'utf8'), '# REST API\n');
  assert.equal(fs.readFileSync(path.join(root, 'generated/en/sidebars/restful.sidebar.js'), 'utf8'), 'module.exports=["master"]\n');
  assert.equal(fs.existsSync(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md')), true);
  assert.deepEqual(result.removed.sort(), [
    'content/en/reference/api/restful/restful',
    'generated/en/sidebars/restful.sidebar.js',
  ]);
  assert.deepEqual(result.restored.sort(), [
    'content/en/reference/api/restful/restful/restful.md',
    'content/en/reference/content-manifest.json',
    'generated/en/sidebars/restful.sidebar.js',
  ]);
});

test('non-rest groups keep generated outputs and restore landing pages from master', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-python-prepare-'));
  write(path.join(root, 'content/en/reference/api/python/python/old.md'));
  write(path.join(root, 'generated/en/sidebars/python.sidebar.js'), 'module.exports=[]\n');

  const result = prepareContentGroupWorkspace({
    site: 'en', group: 'python', cwd: root,
    preservedContentByPath: new Map([
      ['content/en/reference/content-manifest.json', '{"schemaVersion":1}\n'],
    ]),
  });

  assert.equal(fs.existsSync(path.join(root, 'content/en/reference/api/python/python/old.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'generated/en/sidebars/python.sidebar.js')), true);
  assert.equal(
    fs.readFileSync(path.join(root, 'content/en/reference/content-manifest.json'), 'utf8'),
    '{"schemaVersion":1}\n',
  );
  assert.deepEqual(result, {
    site: 'en',
    group: 'python',
    removed: [],
    restored: ['content/en/reference/content-manifest.json'],
  });
});
