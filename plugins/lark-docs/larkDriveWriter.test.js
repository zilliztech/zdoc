const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const larkDriveWriter = require('./larkDriveWriter');

function writeJson(dir, file, source) {
  fs.writeFileSync(path.join(dir, file), JSON.stringify(source, null, 2));
}

function testDuplicateTokenSourceUsesParentSlugContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');

  writeJson(dir, 'EglSdm1jkozDSlxq6SEc4CRonVe.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'utility-create_user',
    blocks: { items: [] },
  });
  writeJson(dir, 'S5rRdLq3moeQ7XxY89bcjJOAn1d.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'Authentication-create_user',
    blocks: { items: [] },
  });

  const source = writer.__drive_source_for_child(
    { token: 'EglSdm1jkozDSlxq6SEc4CRonVe', name: 'create_user()', type: 'docx' },
    'MilvusClient-Authentication'
  );

  assert.equal(source.slug, 'Authentication-create_user');
}

function testDuplicateTokenSourceUsesUtilityParentContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');

  writeJson(dir, 'EglSdm1jkozDSlxq6SEc4CRonVe.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'utility-create_user',
    blocks: { items: [] },
  });
  writeJson(dir, 'S5rRdLq3moeQ7XxY89bcjJOAn1d.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'Authentication-create_user',
    blocks: { items: [] },
  });

  const source = writer.__drive_source_for_child(
    { token: 'EglSdm1jkozDSlxq6SEc4CRonVe', name: 'create_user()', type: 'docx' },
    'ORM-utility'
  );

  assert.equal(source.slug, 'utility-create_user');
}

async function testConvertLinkUsesCurrentParentSlugContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');

  writeJson(dir, 'EglSdm1jkozDSlxq6SEc4CRonVe.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'utility-create_user',
    blocks: { items: [] },
  });
  writeJson(dir, 'S5rRdLq3moeQ7XxY89bcjJOAn1d.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'Authentication-create_user',
    blocks: { items: [] },
  });

  writer.currentParentSlug = 'MilvusClient-Authentication';

  assert.equal(
    await writer.__convert_link('https://zilliverse.feishu.cn/docx/EglSdm1jkozDSlxq6SEc4CRonVe'),
    './Authentication-create_user'
  );
}

async function testSidebarItemsUseParentSlugContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');
  writer.__is_to_publish = async (name) => ({publish: true, labels: name});

  writeJson(dir, 'parent.json', {
    token: 'parent',
    name: 'Authentication',
    type: 'folder',
    slug: 'MilvusClient-Authentication',
    children: [
      { token: 'EglSdm1jkozDSlxq6SEc4CRonVe', name: 'create_user()', type: 'docx' },
    ],
  });
  writeJson(dir, 'EglSdm1jkozDSlxq6SEc4CRonVe.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'utility-create_user',
    blocks: { items: [] },
  });
  writeJson(dir, 'S5rRdLq3moeQ7XxY89bcjJOAn1d.json', {
    token: 'EglSdm1jkozDSlxq6SEc4CRonVe',
    name: 'create_user()',
    type: 'docx',
    slug: 'Authentication-create_user',
    blocks: { items: [] },
  });

  const items = await writer.__sidebar_items(
    'reference/api/python/python/MilvusClient/MilvusClient-Authentication',
    'reference',
    'parent'
  );

  assert.deepEqual(items, [{
    type: 'doc',
    id: 'api/python/python/MilvusClient/MilvusClient-Authentication/Authentication-create_user',
    label: 'create_user()',
  }]);
}

function testDuplicateRouteSlugUsesParentDirectoryName() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'goSidebar', dir, '/tmp', 'zilliz', true, false, 'gov230');

  assert.equal(
    writer.__route_slug('reference/api/go/go/v2/v2-Client-ClientConfig.md', 'v2-Client-ClientConfig'),
    'go/v2-Client-ClientConfig'
  );
  assert.equal(
    writer.__route_slug('reference/api/go/go/v2/v2-Client/v2-Client-ClientConfig.md', 'v2-Client-ClientConfig'),
    'go/v2-Client/v2-Client-ClientConfig'
  );
}

async function run() {
  testDuplicateTokenSourceUsesParentSlugContext();
  testDuplicateTokenSourceUsesUtilityParentContext();
  await testConvertLinkUsesCurrentParentSlugContext();
  await testSidebarItemsUseParentSlugContext();
  testDuplicateRouteSlugUsesParentDirectoryName();
  console.log('larkDriveWriter tests passed');
}

run();
