import {existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {expect, it} from 'vitest';

import {isolateZhCnGuidesSourceTools} from './zhCnGuidesToolsIsolation.ts';

const require = createRequire(import.meta.url);

function write(root: string, relativePath: string, contents: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
}

it('removes Chinese source documents and sidebar nodes shadowed by canonical English Tools', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'zh-tools-source-isolation-'));
  const canonicalToolsRoot = path.join(root, 'content/en/guides/tutorials/tools');
  const stagedOutputRoot = path.join(root, 'stage/content/zh-CN/guides/tutorials');
  const stagedSidebarPath = path.join(root, 'stage/generated/zh-CN/sidebars/guides.sidebar.js');

  write(canonicalToolsRoot, 'agents/overview.md', '# English agents\n');
  write(canonicalToolsRoot, 'terraform-provider.md', '# English Terraform\n');
  write(stagedOutputRoot, 'agents/overview.md', '# Chinese source agents\n');
  write(stagedOutputRoot, 'terraform-provider.md', '# Chinese source Terraform\n');
  write(stagedOutputRoot, 'keep.md', '# Chinese product-specific guide\n');
  mkdirSync(path.dirname(stagedSidebarPath), {recursive: true});
  writeFileSync(stagedSidebarPath, `module.exports = ${JSON.stringify([
    {
      type: 'category', label: '工具', items: [
        {type: 'category', label: '智能体', link: {type: 'doc', id: 'tutorials/agents/overview'}, items: []},
        {type: 'doc', id: 'tutorials/terraform-provider', label: 'Terraform'},
      ],
    },
    {type: 'doc', id: 'tutorials/keep', label: '保留'},
  ])}\n`);

  const result = isolateZhCnGuidesSourceTools({canonicalToolsRoot, stagedOutputRoot, stagedSidebarPath});

  expect(result.removedFiles).toEqual(['agents/overview.md', 'terraform-provider.md']);
  expect(result.removedSidebarIds).toEqual(['tutorials/agents/overview', 'tutorials/terraform-provider']);
  expect(existsSync(path.join(stagedOutputRoot, 'agents/overview.md'))).toBe(false);
  expect(existsSync(path.join(stagedOutputRoot, 'terraform-provider.md'))).toBe(false);
  expect(readFileSync(path.join(stagedOutputRoot, 'keep.md'), 'utf8')).toContain('product-specific');

  delete require.cache[require.resolve(stagedSidebarPath)];
  expect(require(stagedSidebarPath)).toEqual([{type: 'doc', id: 'tutorials/keep', label: '保留'}]);
});

it('preserves unrelated sidebar categories that were already empty', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'zh-tools-empty-sidebar-isolation-'));
  const canonicalToolsRoot = path.join(root, 'content/en/guides/tutorials/tools');
  const stagedOutputRoot = path.join(root, 'stage/content/zh-CN/guides/tutorials');
  const stagedSidebarPath = path.join(root, 'stage/generated/zh-CN/sidebars/guides.sidebar.js');

  write(canonicalToolsRoot, 'terraform-provider.md', '# English Terraform\n');
  write(stagedOutputRoot, 'terraform-provider.md', '# Chinese source Terraform\n');
  mkdirSync(path.dirname(stagedSidebarPath), {recursive: true});
  const unrelatedEmptyCategories = [
    {type: 'category', label: 'Array', items: []},
    {type: 'category', label: 'SCIM Provisioning', items: []},
    {type: 'category', label: 'Marketplace', items: []},
  ];
  writeFileSync(stagedSidebarPath, `module.exports = ${JSON.stringify([
    unrelatedEmptyCategories[0],
    {type: 'category', label: 'Tools', items: [{type: 'doc', id: 'tutorials/terraform-provider'}]},
    ...unrelatedEmptyCategories.slice(1),
  ])}\n`);

  isolateZhCnGuidesSourceTools({canonicalToolsRoot, stagedOutputRoot, stagedSidebarPath});

  delete require.cache[require.resolve(stagedSidebarPath)];
  expect(require(stagedSidebarPath)).toEqual(unrelatedEmptyCategories);
});

it('rejects a staged shadow below a symlink ancestor without deleting outside the stage', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'zh-tools-shadow-symlink-'));
  const canonicalToolsRoot = path.join(root, 'content/en/guides/tutorials/tools');
  const stagedOutputRoot = path.join(root, 'stage/content/zh-CN/guides/tutorials');
  const stagedSidebarPath = path.join(root, 'stage/generated/zh-CN/sidebars/guides.sidebar.js');
  const outside = path.join(root, 'outside');
  write(canonicalToolsRoot, 'agents/overview.md', '# English agents\n');
  write(outside, 'overview.md', '# outside sentinel\n');
  mkdirSync(stagedOutputRoot, {recursive: true});
  symlinkSync(outside, path.join(stagedOutputRoot, 'agents'));
  mkdirSync(path.dirname(stagedSidebarPath), {recursive: true});
  writeFileSync(stagedSidebarPath, 'module.exports = []\n');

  expect(() => isolateZhCnGuidesSourceTools({canonicalToolsRoot, stagedOutputRoot, stagedSidebarPath})).toThrow(/symlink/i);
  expect(readFileSync(path.join(outside, 'overview.md'), 'utf8')).toBe('# outside sentinel\n');
});
