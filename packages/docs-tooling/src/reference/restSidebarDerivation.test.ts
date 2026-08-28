import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {deriveRestSidebar} from './restSidebarDerivation.ts';

const require = createRequire(import.meta.url);
const RefGen = require('./rest/refGen.js');
const {loadSpecifications} = require('./rest/specLoader.js');
const {
  collectSidebarDocIds,
  validateRestSidebarCoverage,
  validateSidebar,
  validateSidebarDocTargets,
} = require('../../../../scripts/validate-generated-sidebars.js');

const OPENAPI_DIR = path.join(import.meta.dirname, 'rest/meta/openapi');
const ID_PREFIX = 'api/restful/restful';
const SPECIFICATIONS = loadSpecifications(OPENAPI_DIR);

function writeRootLanding(output: string, label: string): void {
  mkdirSync(output, {recursive: true});
  writeFileSync(
    path.join(output, 'restful.md'),
    `---\nsidebar_label: ${label}\nsidebar_position: 0\n---\n\n# RESTful API Overview\n`,
  );
}

async function generateSidebar(root: string, lang: 'en-US' | 'zh-CN') {
  const contentRoot = path.join(root, lang, 'content/reference');
  const output = path.join(contentRoot, ID_PREFIX);
  writeRootLanding(output, lang === 'en-US' ? 'RESTful API Reference' : 'RESTful API 参考');
  const generator = new RefGen({
    specifications: SPECIFICATIONS,
    lang,
    target: 'zilliz',
    target_path: output,
  });
  generator.make_groups();
  await generator.write_refs();
  const sidebar = deriveRestSidebar({targetRoot: output, idPrefix: ID_PREFIX});
  validateSidebar(sidebar, `${lang} restful.sidebar.js`);
  validateSidebarDocTargets({outputDir: contentRoot, sidebar, idPrefix: ID_PREFIX, label: `${lang} restful.sidebar.js`});
  validateRestSidebarCoverage({outputDir: contentRoot, sidebar, idPrefix: ID_PREFIX, label: `${lang} restful.sidebar.js`});
  return new Set<string>(collectSidebarDocIds(sidebar));
}

describe('REST staged sidebar derivation', () => {
  it('derives stable category keys from landing slugs and endpoint IDs from generated paths', () => {
    const output = path.join(mkdtempSync(path.join(tmpdir(), 'rest-sidebar-derivation-')), 'api/restful/restful');
    writeRootLanding(output, 'RESTful API Reference');
    const pages = [
      ['v2/v2.mdx', '---\nslug: /restful/v2\nsidebar_position: 1\n---\n\n# V2\n'],
      ['v2/control-plane/control-plane.mdx', '---\nslug: /restful/control-plane-v2\nsidebar_position: 1\n---\n\n# Control Plane (V2)\n'],
      ['v2/control-plane/backup-and-restore-v2/backup-and-restore-v2.mdx', '---\nslug: /restful/backup-restore-v2\nsidebar_position: 2\n---\n\n# Backup & Restore (V2)\n'],
      ['v2/control-plane/backup-and-restore-v2/create-backup-v2.mdx', '---\nsidebar_label: Create Backup (V2)\nsidebar_position: 1\n---\n\n# Create Backup (V2)\n'],
    ] as const;
    for (const [relativePath, contents] of pages) {
      const target = path.join(output, relativePath);
      mkdirSync(path.dirname(target), {recursive: true});
      writeFileSync(target, contents);
    }

    expect(deriveRestSidebar({targetRoot: output, idPrefix: ID_PREFIX})).toEqual([
      {type: 'doc', id: `${ID_PREFIX}/restful`, label: 'RESTful API Reference'},
      {
        type: 'category',
        label: 'V2',
        key: 'category:v2',
        items: [{
          type: 'category',
          label: 'Control Plane (V2)',
          key: 'category:v2/control-plane-v2',
          items: [{
            type: 'category',
            label: 'Backup & Restore (V2)',
            key: 'category:v2/control-plane-v2/backup-restore-v2',
            items: [{
              type: 'doc',
              id: `${ID_PREFIX}/v2/control-plane/backup-and-restore-v2/create-backup-v2`,
              label: 'Create Backup (V2)',
              key: `doc:${ID_PREFIX}/v2/control-plane/backup-and-restore-v2/create-backup-v2`,
            }],
          }],
        }],
      },
    ]);
  });

  it('keeps the complete English and Chinese generated inventories aligned except for Upgrade Project', {timeout: 30000}, async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const root = mkdtempSync(path.join(tmpdir(), 'rest-sidebar-language-inventory-'));
      const english = await generateSidebar(root, 'en-US');
      const chinese = await generateSidebar(root, 'zh-CN');
      const englishOnly = [...english].filter(id => !chinese.has(id)).sort();
      const chineseOnly = [...chinese].filter(id => !english.has(id)).sort();

      expect(englishOnly).toEqual([
        `${ID_PREFIX}/v2/control-plane/project-operations-v2/upgrade-project-v2`,
      ]);
      expect(chineseOnly).toEqual([]);
      expect(english.size).toBe(chinese.size + 1);
      expect(SPECIFICATIONS.paths['/v2/projects/{projectId}/plan'].patch['x-include-langs']).toEqual(['en-US']);

      for (const id of [
        `${ID_PREFIX}/v2/control-plane/on-demand-cluster-operations-v2/create-on-demand-cluster-v2`,
        `${ID_PREFIX}/v2/control-plane/on-demand-cluster-operations-v2/list-on-demand-clusters-v2`,
        `${ID_PREFIX}/v2/control-plane/on-demand-cluster-operations-v2/delete-on-demand-cluster-v2`,
      ]) {
        expect(english).toContain(id);
        expect(chinese).toContain(id);
      }
      expect(english).toContain(`${ID_PREFIX}/v2/data-plane/cluster-role-operations-v2/create-role-v2`);
      expect(english).toContain(`${ID_PREFIX}/v2/control-plane/cloud-access-control-operations-v2/create-cloud-role-v2`);
      expect(english).toContain(`${ID_PREFIX}/v2/control-plane/cloud-api-key-operations-v2/create-api-key-v2`);
      expect(english).not.toContain(`${ID_PREFIX}/v2/data-plane/role-operations-v2/create-role-v2`);
      expect(english).not.toContain(`${ID_PREFIX}/v2/data-plane/user-operations-v2/create-user-v2`);
    } finally {
      log.mockRestore();
      warn.mockRestore();
    }
  });
});
