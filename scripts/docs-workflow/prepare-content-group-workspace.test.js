'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { prepareContentGroupWorkspace, trackRestoredFiles } = require('./prepare-content-group-workspace');
const { getGroupPaths } = require('./group-paths');

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
      ['content/en/reference/api/python/python/python.md', '# Python SDK\n'],
      ['content/en/reference/content-manifest.json', '{"schemaVersion":1}\n'],
    ]),
  });

  assert.equal(fs.existsSync(path.join(root, 'content/en/reference/api/python/python/old.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'generated/en/sidebars/python.sidebar.js')), true);
  assert.equal(
    fs.readFileSync(path.join(root, 'content/en/reference/api/python/python/python.md'), 'utf8'),
    '# Python SDK\n',
  );
  assert.equal(
    fs.readFileSync(path.join(root, 'content/en/reference/content-manifest.json'), 'utf8'),
    '{"schemaVersion":1}\n',
  );
  assert.deepEqual(result, {
    site: 'en',
    group: 'python',
    removed: [],
    restored: [
      'content/en/reference/api/python/python/python.md',
      'content/en/reference/content-manifest.json',
    ],
  });
});

test('tracks a restored PR-owned manifest after an older baseline removed it from the index', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-reference-manifest-index-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root });
  write(path.join(root, 'content/en/guides/content-manifest.json'), '{}\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'older baseline'], { cwd: root });
  write(path.join(root, 'content/en/reference/content-manifest.json'), '{"schemaVersion":1}\n');

  trackRestoredFiles({
    root,
    relativePaths: ['content/en/reference/content-manifest.json'],
  });

  assert.equal(
    execFileSync('git', ['ls-files', '--error-unmatch', 'content/en/reference/content-manifest.json'], { cwd: root, encoding: 'utf8' }).trim(),
    'content/en/reference/content-manifest.json',
  );
});

test('restores the Reference root manifest for a Guides-only English build', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-guides-reference-manifest-'));
  const preservedContentByPath = new Map(
    getGroupPaths('guides', 'en').preservedEnglish.map(relativePath => [relativePath, `# ${relativePath}\n`]),
  );
  preservedContentByPath.set('content/en/reference/content-manifest.json', '{"schemaVersion":1}\n');
  const result = prepareContentGroupWorkspace({
    site: 'en',
    group: 'guides',
    cwd: root,
    preservedContentByPath,
  });
  assert.equal(
    fs.readFileSync(path.join(root, 'content/en/reference/content-manifest.json'), 'utf8'),
    '{"schemaVersion":1}\n',
  );
  assert.equal(result.restored.includes('content/en/reference/content-manifest.json'), true);
});
