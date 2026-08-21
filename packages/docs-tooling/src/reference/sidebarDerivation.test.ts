import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {deriveReferenceSidebar, deriveZhCnReferenceSidebarEntries} from './sidebarDerivation';

const roots: string[] = [];
const require = createRequire(import.meta.url);

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-sidebar-'));
  roots.push(root);
  return root;
}

function write(root: string, relativePath: string, contents: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, {recursive: true, force: true});
});

describe('Chinese Reference sidebar derivation', () => {
  it('preserves structure while resolving Chinese document and category labels', () => {
    const targetRoot = fixture();
    write(targetRoot, 'api/python/python/Collection/Collection.md', [
      '---',
      'sidebar_label: 集合',
      '---',
      '# Collection',
    ].join('\n'));
    write(targetRoot, 'api/python/python/Collection/create.md', [
      '---',
      'sidebar_label: 创建集合',
      'title: 不应使用的标题',
      '---',
      '# 不应使用的标题',
    ].join('\n'));
    write(targetRoot, 'api/python/python/Collection/list.md', [
      '---',
      'title: 列出集合',
      '---',
      '# 不应使用的标题',
    ].join('\n'));
    write(targetRoot, 'api/python/python/Collection/drop.md', '# 删除集合\n');

    const sidebar = deriveReferenceSidebar({
      targetRoot,
      template: [{
        type: 'category',
        label: 'Collection',
        key: 'category:api/python/python/collection',
        customProps: {badge: 'sdk'},
        items: [
          {type: 'doc', id: 'api/python/python/Collection/create', label: 'create()', key: 'doc:create', customProps: {method: 'post'}},
          {type: 'doc', id: 'api/python/python/Collection/list', label: 'list()', key: 'doc:list'},
          {type: 'doc', id: 'api/python/python/Collection/drop', label: 'drop()', key: 'doc:drop'},
        ],
      }],
    });

    expect(sidebar).toEqual([{
      type: 'category',
      label: '集合',
      key: 'category:api/python/python/collection',
      customProps: {badge: 'sdk'},
      items: [
        {type: 'doc', id: 'api/python/python/Collection/create', label: '创建集合', key: 'doc:create', customProps: {method: 'post'}},
        {type: 'doc', id: 'api/python/python/Collection/list', label: '列出集合', key: 'doc:list'},
        {type: 'doc', id: 'api/python/python/Collection/drop', label: '删除集合', key: 'doc:drop'},
      ],
    }]);
  });

  it('keeps every configured landing exactly once in the checked-in locale sidebars', () => {
    const repositoryRoot = path.resolve(import.meta.dirname, '../../../..');
    const config = require(path.join(repositoryRoot, 'config/reference-navigation.json')) as {
      targets: Array<{sidebar: string; landingPage: string}>;
    };

    for (const target of config.targets) {
      const landingId = target.landingPage.replace(/\.mdx?$/u, '');
      for (const locale of ['en', 'zh-CN']) {
        const sidebarPath = path.join(repositoryRoot, `generated/${locale}/sidebars/${target.sidebar}.sidebar.js`);
        delete require.cache[require.resolve(sidebarPath)];
        const sidebar = require(sidebarPath) as unknown;
        expect(JSON.stringify(sidebar).match(new RegExp(landingId.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'gu')))
          .toHaveLength(1);
      }
    }
  });

  it('fails when a template document has no Chinese target', () => {
    const targetRoot = fixture();

    expect(() => deriveReferenceSidebar({
      targetRoot,
      template: [{type: 'doc', id: 'api/python/python/Missing', label: 'Missing'}],
    })).toThrow(/api\/python\/python\/Missing.*Chinese/i);
  });

  it('omits only explicitly retired Chinese document ids', () => {
    const targetRoot = fixture();
    write(targetRoot, 'api/python/python/Active.md', '# 活跃\n');

    expect(deriveReferenceSidebar({
      targetRoot,
      excludedDocIds: new Set(['api/python/python/Retired']),
      template: [
        {type: 'category', label: 'Empty', items: [{type: 'doc', id: 'api/python/python/Retired', label: 'Retired'}]},
        {type: 'doc', id: 'api/python/python/Active', label: 'Active'},
      ],
    })).toEqual([{type: 'doc', id: 'api/python/python/Active', label: '活跃'}]);
  });

  it('derives all seven site-owned modules from the published English templates', () => {
    const repositoryRoot = fixture();
    const manuals = ['python', 'java', 'node', 'go', 'cpp', 'cli', 'restful'];
    for (const manual of manuals) {
      const id = `api/${manual}/${manual}/page`;
      write(repositoryRoot, `content/zh-CN/reference/${id}.md`, `# ${manual} 中文\n`);
      write(repositoryRoot, `generated/en/sidebars/${manual}.sidebar.js`, [
        `module.exports = [{type: 'doc', id: '${id}', label: '${manual} English'}]`,
        '',
      ].join('\n'));
    }

    const entries = deriveZhCnReferenceSidebarEntries(repositoryRoot);

    expect(entries.map(([relativePath]) => relativePath)).toEqual(manuals.map(
      manual => `generated/zh-CN/sidebars/${manual}.sidebar.js`,
    ));
    for (const [relativePath, contents] of entries) {
      const manual = path.basename(relativePath, '.sidebar.js');
      expect(contents).toContain(`"label": "${manual} 中文"`);
      expect(contents).toMatch(/^module\.exports = \[/u);
    }
  });
});
