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
  write(path.join(root, 'reference/api/restful/restful/v2/control-plane/cluster-operations-v2/create-on-demand-cluster-v2.mdx'));
  write(path.join(root, 'config/generated/restful.sidebar.js'), 'module.exports=[]\n');
  write(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md'));

  const result = prepareContentGroupWorkspace({ group: 'rest', cwd: root });

  assert.equal(fs.existsSync(path.join(root, 'reference/api/restful/restful')), false);
  assert.equal(fs.existsSync(path.join(root, 'config/generated/restful.sidebar.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/old.md')), true);
  assert.deepEqual(result.removed.sort(), [
    'config/generated/restful.sidebar.js',
    'reference/api/restful/restful',
  ]);
});

test('non-rest groups keep restored outputs before incremental reconciliation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-python-prepare-'));
  write(path.join(root, 'reference/api/python/python/old.md'));
  write(path.join(root, 'config/generated/python.sidebar.js'), 'module.exports=[]\n');

  const result = prepareContentGroupWorkspace({ group: 'python', cwd: root });

  assert.equal(fs.existsSync(path.join(root, 'reference/api/python/python/old.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'config/generated/python.sidebar.js')), true);
  assert.deepEqual(result.removed, []);
});
