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
    key: 'doc:api/python/python/MilvusClient/MilvusClient-Authentication/authentication-createuser',
  }]);
}

async function testSidebarItemsDeduplicateRepeatedChildTokens() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const writer = new larkDriveWriter('', '', 'javaSidebar', dir, '/tmp', 'zilliz', true, false, 'javaV230');
  writer.__is_to_publish = async (name) => ({publish: true, labels: name});

  writeJson(dir, 'parent.json', {
    token: 'parent',
    name: 'Collections',
    type: 'folder',
    slug: 'v2-Collections',
    children: [
      { token: 'same-token', name: 'createCollectionWithSchema()', type: 'docx' },
      { token: 'same-token', name: 'addCollectionField()', type: 'docx' },
    ],
  });
  writeJson(dir, 'same-token.json', {
    token: 'same-token',
    name: 'addCollectionField()',
    type: 'docx',
    slug: 'v2-Collections-addCollectionField',
    blocks: { items: [{ block_type: 1, children: ['content'] }] },
  });

  const warnings = [];
  const originalWarn = console.warn;
  console.warn = message => warnings.push(message);
  try {
    const items = await writer.__sidebar_items('reference/api/java/java/v2/v2-Collections', 'reference', 'parent');
    assert.equal(items.length, 1);
    assert.equal(items[0].id, 'api/java/java/v2/v2-Collections/v2-Collections-addCollectionField');
    assert.match(warnings[0], /duplicate child token same-token/);
  } finally {
    console.warn = originalWarn;
  }
}

async function testWriteDocAppliesSharedMdxPatches() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-output-'));
  const writer = new larkDriveWriter('', '', 'nodeSidebar', dir, '/tmp', 'zilliz', true, false, 'nodejs30');

  writeJson(dir, 'search.json', {
    token: 'search',
    name: 'search()',
    type: 'docx',
    slug: 'Vector-search',
    blocks: {
      items: [
        {
          block_id: 'page',
          block_type: 1,
          page: {
            elements: [{
              text_run: {
                content: 'search()',
                text_element_style: {},
              },
            }],
          },
          children: ['return-type', 'example-heading'],
        },
        {
          block_id: 'return-type',
          block_type: 2,
          text: {
            elements: [{
              text_run: {
                content: '**RETURNS** *Promise<SearchResults<T>>*',
                text_element_style: {},
              },
            }],
          },
        },
        {
          block_id: 'example-heading',
          block_type: 4,
          heading2: {
            elements: [{
              text_run: {
                content: 'Example',
                text_element_style: {},
              },
            }],
          },
        },
      ],
    },
  });

  await writer.write_doc({
    path: out,
    page_title: 'search()',
    page_slug: 'Vector-search',
    page_type: 'docx',
    page_token: 'search',
    page_beta: 'false',
    notebook: 'false',
    sidebar_position: 1,
    sidebar_label: 'search()',
    doc_card_list: false,
    addedSince: 'false',
    lastModified: 'false',
    deprecateSince: 'false',
  });

  const markdown = fs.readFileSync(path.join(out, 'Vector-search.md'), 'utf8');
  assert.ok(markdown.includes('Promise&lt;SearchResults&lt;T&gt;&gt;'));
  assert.ok(markdown.includes('## Example\\{#example}'));
  assert.ok(!markdown.includes('Promise<SearchResults<T>>'));
  assert.ok(!markdown.includes('Promise<SearchResults&lt;T&gt;>'));

  const { compile } = await import('@mdx-js/mdx');
  await compile(markdown, { development: false });
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

async function testWriteSubtreeUsesDriveTokenAndParentTokenFields() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-output-'));
  const writer = new larkDriveWriter('root', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');
  const writes = [];
  writer.__is_to_publish = async () => ({ publish: true, labels: 'Leaf' });
  writer.write_doc = async options => writes.push(options);

  try {
    writeJson(dir, 'root.json', {
      token: 'root',
      name: 'Root',
      type: 'folder',
      slug: 'root',
      children: [{ token: 'parent' }],
    });
    writeJson(dir, 'parent.json', {
      token: 'parent',
      parent_token: 'root',
      name: 'Parent',
      type: 'folder',
      slug: 'parent-slug',
      children: [{ token: 'sibling' }, { token: 'leaf' }],
    });
    writeJson(dir, 'leaf.json', {
      token: 'leaf',
      parent_token: 'parent',
      name: 'Leaf',
      type: 'docx',
      slug: 'leaf-slug',
      blocks: { items: [] },
    });

    await writer.write_subtree(out, 'leaf');

    assert.equal(writes.length, 1);
    assert.equal(path.resolve(writes[0].path), path.join(out, 'parent-slug'));
    assert.equal(writes[0].page_title, 'Leaf');
    assert.equal(writes[0].page_slug, 'leaf-slug');
    assert.equal(writes[0].page_token, 'leaf');
    assert.equal(writes[0].sidebar_position, 2);
    assert.equal(writes[0].doc_card_list, false);
    assert.ok(fs.existsSync(path.join(out, 'parent-slug')));
  } finally {
    writer.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function testWriteSubtreeRendersEveryDuplicateTokenPlacement() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-output-'));
  const writer = new larkDriveWriter('root', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');
  const writes = [];
  writer.__is_to_publish = async () => ({ publish: true });
  writer.write_doc = async options => writes.push(options);

  try {
    writeJson(dir, 'root.json', {
      token: 'root', name: 'Root', type: 'folder', slug: 'root',
      children: [{ token: 'parent-a' }, { token: 'parent-b' }],
    });
    writeJson(dir, 'parent-a.json', {
      token: 'parent-a', parent_token: 'root', name: 'A', type: 'folder', slug: 'parent-a',
      children: [{ token: 'shared' }],
    });
    writeJson(dir, 'parent-b.json', {
      token: 'parent-b', parent_token: 'root', name: 'B', type: 'folder', slug: 'parent-b',
      children: [{ token: 'shared' }],
    });
    writeJson(dir, 'shared-a.json', {
      token: 'shared', parent_token: 'parent-a', name: 'Shared A', type: 'docx',
      slug: 'parent-a-shared', blocks: { items: [] },
    });
    writeJson(dir, 'shared-b.json', {
      token: 'shared', parent_token: 'parent-b', name: 'Shared B', type: 'docx',
      slug: 'parent-b-shared', blocks: { items: [] },
    });

    await writer.write_subtree(out, 'shared');

    assert.deepEqual(
      writes.map(write => [path.relative(out, write.path), write.page_slug]),
      [['parent-a', 'parent-a-shared'], ['parent-b', 'parent-b-shared']]
    );
  } finally {
    writer.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function testWriteSubtreePreservesMeaningfulCategoryMetadata() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-output-'));
  const writer = new larkDriveWriter('root', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');
  const writes = [];
  writer.__is_to_publish = async () => ({
    publish: true,
    description: 'Category description',
    tag: 'beta',
    labels: 'Category label',
    addSince: '2.5.0',
    lastModified: '2026-07-21',
    deprecateSince: 'false',
  });
  writer.write_doc = async options => writes.push(options);

  try {
    writeJson(dir, 'root.json', {
      token: 'root', name: 'Root', type: 'folder', slug: 'root', children: [{ token: 'parent' }],
    });
    writeJson(dir, 'parent.json', {
      token: 'parent', parent_token: 'root', name: 'Parent', type: 'folder', slug: 'parent-slug',
      children: [{ token: 'category' }],
    });
    writeJson(dir, 'category.json', {
      token: 'category', parent_token: 'parent', name: 'Category', type: 'folder', slug: 'category-slug',
      children: [],
      blocks: { items: [{ block_type: 1 }, { block_type: 9 }] },
    });

    await writer.write_subtree(out, 'category');

    assert.equal(writes.length, 1);
    assert.equal(path.resolve(writes[0].path), path.join(out, 'parent-slug', 'category-slug'));
    assert.equal(writes[0].page_description, 'Category description');
    assert.equal(writes[0].page_beta, 'beta');
    assert.equal(writes[0].sidebar_label, 'Category label');
    assert.equal(writes[0].addedSince, '2.5.0');
    assert.equal(writes[0].lastModified, '2026-07-21');
    assert.equal(writes[0].deprecateSince, 'false');
    assert.equal(writes[0].doc_card_list, true);
  } finally {
    writer.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function testWriteSubtreeKeepsDuplicateFolderDescendantsInTheirPlacements() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-writer-'));
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-output-'));
  const writer = new larkDriveWriter('root', '', 'pythonSidebar', dir, '/tmp', 'zilliz', true, false, 'pymilvus30');
  const writes = [];
  writer.__is_to_publish = async () => ({ publish: true });
  writer.write_doc = async options => writes.push(options);

  try {
    writeJson(dir, 'root.json', {
      token: 'root', name: 'Root', type: 'folder', slug: 'root',
      children: [{ token: 'parent-a' }, { token: 'parent-b' }],
    });
    writeJson(dir, 'parent-a.json', {
      token: 'parent-a', parent_token: 'root', name: 'A', type: 'folder', slug: 'parent-a',
      children: [{ token: 'shared-folder' }],
    });
    writeJson(dir, 'parent-b.json', {
      token: 'parent-b', parent_token: 'root', name: 'B', type: 'folder', slug: 'parent-b',
      children: [{ token: 'shared-folder' }],
    });
    writeJson(dir, 'shared-folder-a.json', {
      token: 'shared-folder', parent_token: 'parent-a', name: 'Shared A', type: 'folder',
      slug: 'parent-a-shared', children: [{ token: 'leaf-a' }],
    });
    writeJson(dir, 'shared-folder-b.json', {
      token: 'shared-folder', parent_token: 'parent-b', name: 'Shared B', type: 'folder',
      slug: 'parent-b-shared', children: [{ token: 'leaf-b' }],
    });
    writeJson(dir, 'leaf-a.json', {
      token: 'leaf-a', parent_token: 'shared-folder', name: 'Leaf A', type: 'docx',
      slug: 'parent-a-leaf', blocks: { items: [] },
    });
    writeJson(dir, 'leaf-b.json', {
      token: 'leaf-b', parent_token: 'shared-folder', name: 'Leaf B', type: 'docx',
      slug: 'parent-b-leaf', blocks: { items: [] },
    });

    await writer.write_subtree(out, 'shared-folder');

    assert.deepEqual(
      writes.map(write => [path.relative(out, write.path), write.page_slug]),
      [
        [path.join('parent-a', 'parent-a-shared'), 'parent-a-leaf'],
        [path.join('parent-b', 'parent-b-shared'), 'parent-b-leaf'],
      ]
    );
  } finally {
    writer.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function run() {
  testDuplicateTokenSourceUsesParentSlugContext();
  testDuplicateTokenSourceUsesUtilityParentContext();
  await testConvertLinkUsesCurrentParentSlugContext();
  await testSidebarItemsUseParentSlugContext();
  await testSidebarItemsDeduplicateRepeatedChildTokens();
  await testWriteDocAppliesSharedMdxPatches();
  testDuplicateRouteSlugUsesParentDirectoryName();
  await testWriteSubtreePreservesMeaningfulCategoryMetadata();
  await testWriteSubtreeUsesDriveTokenAndParentTokenFields();
  await testWriteSubtreeRendersEveryDuplicateTokenPlacement();
  await testWriteSubtreeKeepsDuplicateFolderDescendantsInTheirPlacements();
  console.log('larkDriveWriter tests passed');
}

run();
