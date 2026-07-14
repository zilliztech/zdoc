'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { outputDirsForTargets } = require('./lark-snapshot-output-paths');

test('outputDirsForTargets resolves nested guides and SDK target paths', () => {
  const guides = {
    targets: {
      zilliz: {
        saas: { outputDir: 'docs/tutorials' },
        paas: { outputDir: 'docs-byoc/tutorials' },
      },
    },
  };
  const sdk = { targets: { zilliz: { outputDir: 'reference/api/python/python' } } };

  assert.deepEqual(outputDirsForTargets(guides, ['zilliz.saas', 'zilliz.paas']), [
    'docs/tutorials',
    'docs-byoc/tutorials',
  ]);
  assert.deepEqual(outputDirsForTargets(sdk, ['zilliz']), ['reference/api/python/python']);
});

test('outputDirsForTargets rejects unknown or incomplete targets', () => {
  const manual = { targets: { zilliz: { outputDir: 'reference/api/python/python' } } };

  assert.throws(() => outputDirsForTargets(manual, ['milvus']), /unknown snapshot target/i);
  assert.throws(() => outputDirsForTargets({ targets: { zilliz: {} } }, ['zilliz']), /output directory/i);
});
