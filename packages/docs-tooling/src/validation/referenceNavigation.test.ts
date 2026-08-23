import {mkdtempSync, mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {validateReferenceNavigation} from './referenceNavigation';

const targets = [
  {manual: 'python', sidebarKey: 'pythonSidebar', sidebar: 'python', documentIdPrefix: 'api/python/python', landingPage: 'api/python/python/python.md', minimumProseCharacters: 300, minimumHeadingCount: 2, requireSourceDifference: true},
  {manual: 'java', sidebarKey: 'javaSidebar', sidebar: 'java', documentIdPrefix: 'api/java/java', landingPage: 'api/java/java/java.md', minimumProseCharacters: 300, minimumHeadingCount: 2, requireSourceDifference: true},
  {manual: 'node', sidebarKey: 'nodeSidebar', sidebar: 'node', documentIdPrefix: 'api/nodejs/nodejs', landingPage: 'api/nodejs/nodejs/nodejs.md', minimumProseCharacters: 300, minimumHeadingCount: 2, requireSourceDifference: true},
  {manual: 'go', sidebarKey: 'goSidebar', sidebar: 'go', documentIdPrefix: 'api/go/go', landingPage: 'api/go/go/go.md', minimumProseCharacters: 250, minimumHeadingCount: 2, requireSourceDifference: true},
  {manual: 'cpp', sidebarKey: 'cppSidebar', sidebar: 'cpp', documentIdPrefix: 'api/cpp/cpp', landingPage: 'api/cpp/cpp/cpp.md', minimumProseCharacters: 300, minimumHeadingCount: 2, requireSourceDifference: true},
  {manual: 'rest', sidebarKey: 'restfulSidebar', sidebar: 'restful', documentIdPrefix: 'api/restful/restful', landingPage: 'api/restful/restful/restful.md', minimumProseCharacters: 500, minimumHeadingCount: 3, requireSourceDifference: true},
  {manual: 'cli', sidebarKey: 'cliSidebar', sidebar: 'cli', documentIdPrefix: 'cli/cli', landingPage: 'cli/cli/Overview.md', minimumProseCharacters: 400, minimumHeadingCount: 3, requireSourceDifference: true},
] as const;

type Target = typeof targets[number];

function write(root: string, relativePath: string, contents: string): void {
  const absolutePath = path.join(root, relativePath);
  mkdirSync(path.dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, contents);
}

function writeJson(root: string, relativePath: string, value: unknown): void {
  write(root, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function documentId(relativePath: string): string {
  return relativePath.replace(/\.mdx?$/u, '');
}

function strongLanding(locale: 'en' | 'zh-CN', target: Target): string {
  const prose = locale === 'en'
    ? `The ${target.manual} reference explains supported operations, configuration choices, compatibility expectations, and practical workflows for production applications. `
    : `${target.manual} 参考文档详细说明受支持的操作、配置选择、兼容性要求和生产环境工作流程，帮助开发者安全地构建、验证并维护应用程序。`;
  return [
    '---',
    `displayed_sidebar: ${target.sidebarKey}`,
    '---',
    '',
    "import DocCardList from '@theme/DocCardList';",
    '',
    `# ${locale === 'en' ? 'Reference overview' : '参考概览'}`,
    '',
    prose.repeat(8),
    '',
    `## ${locale === 'en' ? 'Core workflows' : '核心工作流程'}`,
    '',
    prose.repeat(6),
    '',
    `### ${locale === 'en' ? 'Next steps' : '后续步骤'}`,
    '',
    '<DocCardList />',
    '',
    '```md',
    '# This fenced heading and prose must not count',
    'fenced content '.repeat(100),
    '```',
    '',
  ].join('\n');
}

function sidebarFor(target: Target, extraId = `${target.documentIdPrefix}/operation`): unknown[] {
  return [{
    type: 'category',
    label: 'English label',
    items: [
      {type: 'doc', id: documentId(target.landingPage), label: 'Landing'},
      {type: 'category', label: 'Operations', items: [{type: 'doc', id: extraId, label: 'Operation'}]},
    ],
  }];
}

function writeSidebar(root: string, site: 'en' | 'zh-CN', target: Target, sidebar: unknown[]): void {
  write(root, `generated/${site}/sidebars/${target.sidebar}.sidebar.js`, `module.exports = ${JSON.stringify(sidebar, null, 2)}\n`);
}

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-navigation-'));
  writeJson(root, 'config/reference-navigation.json', {schemaVersion: 1, targets});
  writeJson(root, 'config/reference-retirements.json', {schemaVersion: 2, retirements: []});
  for (const target of targets) {
    const extraId = `${target.documentIdPrefix}/operation`;
    for (const site of ['en', 'zh-CN'] as const) {
      writeSidebar(root, site, target, sidebarFor(target, extraId));
      write(root, `content/${site}/reference/${target.landingPage}`, strongLanding(site, target));
      write(root, `content/${site}/reference/${extraId}.md`, `# ${site} operation\n\nUseful ${site} operation details.\n`);
    }
  }
  return root;
}

function targetError(target: Target, invariant: RegExp, document = /documentId=/): RegExp {
  return new RegExp(
    `site=zh-CN.*manual=${target.manual}.*sidebar=generated/zh-CN/sidebars/${target.sidebar}\\.sidebar\\.js.*${document.source}.*invariant=${invariant.source}`,
    'is',
  );
}

describe('validateReferenceNavigation', () => {
  it('accepts all seven isolated sidebars and translated landing pages with meaningful prose and headings', () => {
    const root = fixture();
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'})).not.toThrow();
  });

  it('strictly rejects unknown navigation config fields', () => {
    const root = fixture();
    const config = JSON.parse(readFileSync(path.join(root, 'config/reference-navigation.json'), 'utf8')) as {targets: Record<string, unknown>[]};
    config.targets[0].unexpected = true;
    writeJson(root, 'config/reference-navigation.json', config);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(/site=zh-CN.*manual=config.*sidebar=config\/reference-navigation\.json.*documentId=\(none\).*invariant=config-schema/is);
  });

  it('rejects a missing site-owned sidebar with complete error context', () => {
    const root = fixture();
    const target = targets[0];
    unlinkSync(path.join(root, `generated/zh-CN/sidebars/${target.sidebar}.sidebar.js`));
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /sidebar-file/, /documentId=\(none\)/));
  });

  it('rejects a sidebar symlink instead of loading through it', () => {
    const root = fixture();
    const target = targets[0];
    const sidebarPath = path.join(root, `generated/zh-CN/sidebars/${target.sidebar}.sidebar.js`);
    unlinkSync(sidebarPath);
    symlinkSync(path.join(root, `generated/en/sidebars/${target.sidebar}.sidebar.js`), sidebarPath);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /sidebar-file/, /documentId=\(none\)/));
  });

  it('rejects an empty sidebar', () => {
    const root = fixture();
    const target = targets[0];
    writeSidebar(root, 'zh-CN', target, []);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /non-empty-sidebar/, /documentId=\(none\)/));
  });

  it('tolerates an empty zh-CN sidebar when every English document is unavailable', () => {
    const root = fixture();
    const target = targets.find(candidate => candidate.manual === 'rest')!;
    const unavailableIds = new Set([
      documentId(target.landingPage),
      `${target.documentIdPrefix}/operation`,
    ]);
    writeSidebar(root, 'zh-CN', target, []);
    expect(() => validateReferenceNavigation({
      repositoryRoot: root,
      site: 'zh-CN',
      excludedDocumentIds: unavailableIds,
    })).not.toThrow();
  });

  it('still rejects an empty zh-CN sidebar when some English documents await translation', () => {
    const root = fixture();
    const target = targets.find(candidate => candidate.manual === 'rest')!;
    // Only the landing page is marked unavailable; the operation doc is still
    // expected to be translated, so an empty sidebar is a real wipe.
    const unavailableIds = new Set([documentId(target.landingPage)]);
    writeSidebar(root, 'zh-CN', target, []);
    expect(() => validateReferenceNavigation({
      repositoryRoot: root,
      site: 'zh-CN',
      excludedDocumentIds: unavailableIds,
    }))
      .toThrow(targetError(target, /non-empty-sidebar/, /documentId=\(none\)/));
  });

  it('rejects a Python sidebar containing a Java document ID', () => {
    const root = fixture();
    const target = targets[0];
    const foreignId = 'api/java/java/foreign';
    writeSidebar(root, 'zh-CN', target, [documentId(target.landingPage), foreignId]);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /document-ownership/, new RegExp(`documentId=${foreignId}`)));
  });

  it('rejects a document ID that does not resolve to exactly one Markdown file', () => {
    const root = fixture();
    const target = targets[0];
    const missingId = `${target.documentIdPrefix}/missing`;
    writeSidebar(root, 'zh-CN', target, [documentId(target.landingPage), missingId]);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /document-resolution/, new RegExp(`documentId=${missingId}`)));
  });

  it('requires each configured landing document ID to appear in its sidebar', () => {
    const root = fixture();
    const target = targets[0];
    const extraId = `${target.documentIdPrefix}/operation`;
    writeSidebar(root, 'zh-CN', target, [extraId]);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /landing-in-sidebar/, new RegExp(`documentId=${documentId(target.landingPage)}`)));
  });

  it('rejects a placeholder landing made only of metadata, imports, JSX, and one sentence', () => {
    const root = fixture();
    const target = targets[0];
    write(root, `content/zh-CN/reference/${target.landingPage}`, [
      '---',
      `displayed_sidebar: ${target.sidebarKey}`,
      '---',
      "import DocCardList from '@theme/DocCardList';",
      '# Python SDK 参考',
      '只有一句简短说明。',
      '<DocCardList />',
      '```md',
      '## Fenced heading',
      'This code-like content must not satisfy prose thresholds. '.repeat(100),
      '```',
    ].join('\n'));
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /meaningful-prose|heading-count/, new RegExp(`documentId=${documentId(target.landingPage)}`)));
  });

  it('counts Han characters as two and a half meaningful prose units for Chinese landing pages', () => {
    const root = fixture();
    const target = targets.find(candidate => candidate.manual === 'rest')!;
    write(root, `content/zh-CN/reference/${target.landingPage}`, [
      '---',
      `displayed_sidebar: ${target.sidebarKey}`,
      '---',
      '# RESTful API 概览',
      '中'.repeat(75),
      '## 控制平面 API',
      '文'.repeat(60),
      '## 数据平面 API',
      '档'.repeat(55),
    ].join('\n'));

    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'})).not.toThrow();
  });

  it('rejects a Chinese landing page byte-identical to its English source', () => {
    const root = fixture();
    const target = targets[0];
    const english = readFileSync(path.join(root, `content/en/reference/${target.landingPage}`));
    writeFileSync(path.join(root, `content/zh-CN/reference/${target.landingPage}`), english);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /source-difference/, new RegExp(`documentId=${documentId(target.landingPage)}`)));
  });

  it('rejects structural drift that is not explicitly retired', () => {
    const root = fixture();
    const target = targets[0];
    writeSidebar(root, 'zh-CN', target, [{
      type: 'category',
      label: '已翻译标签',
      items: [{type: 'doc', id: documentId(target.landingPage), label: '首页'}],
    }]);
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /locale-structure/, /documentId=\(structure\)/));
  });

  it('allows an English-only document declared by the language-excluded manifest state', () => {
    const root = fixture();
    const target = targets.find(candidate => candidate.manual === 'rest')!;
    const excludedId = `${target.documentIdPrefix}/operation`;
    writeSidebar(root, 'zh-CN', target, [{
      type: 'category',
      label: '已翻译标签',
      items: [{type: 'doc', id: documentId(target.landingPage), label: '首页'}],
    }]);
    unlinkSync(path.join(root, `content/zh-CN/reference/${excludedId}.md`));

    expect(() => validateReferenceNavigation({
      repositoryRoot: root,
      site: 'zh-CN',
      excludedDocumentIds: new Set([excludedId]),
    })).not.toThrow();
  });

  it('allows structural differences only for explicit retirement paths', () => {
    const root = fixture();
    const target = targets[0];
    const retiredId = `${target.documentIdPrefix}/operation`;
    writeSidebar(root, 'zh-CN', target, [{
      type: 'category',
      label: '已翻译标签',
      items: [{type: 'doc', id: documentId(target.landingPage), label: '首页'}],
    }]);
    writeJson(root, 'config/reference-retirements.json', {
      schemaVersion: 2,
      retirements: [{
        manual: target.manual,
        sourcePath: `content/en/reference/${retiredId}.md`,
        targetPath: `content/zh-CN/reference/${retiredId}.md`,
        changeKind: null,
        rationale: 'Deliberate fixture retirement',
      }],
    });
    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'})).not.toThrow();
  });

  it('still resolves a retired document ID when it remains in the selected sidebar', () => {
    const root = fixture();
    const target = targets[0];
    const retiredId = `${target.documentIdPrefix}/operation`;
    writeJson(root, 'config/reference-retirements.json', {
      schemaVersion: 2,
      retirements: [{
        manual: target.manual,
        sourcePath: `content/en/reference/${retiredId}.md`,
        targetPath: `content/zh-CN/reference/${retiredId}.md`,
        changeKind: null,
        rationale: 'Deliberate fixture retirement',
      }],
    });
    unlinkSync(path.join(root, `content/zh-CN/reference/${retiredId}.md`));

    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'}))
      .toThrow(targetError(target, /document-resolution/, new RegExp(`documentId=${retiredId}`)));
  });

  it('resolves retired document IDs that remain only in the English comparison sidebar', () => {
    const root = fixture();
    const target = targets[0];
    const retiredId = `${target.documentIdPrefix}/operation`;
    writeSidebar(root, 'zh-CN', target, [{
      type: 'category',
      label: '已翻译标签',
      items: [{type: 'doc', id: documentId(target.landingPage), label: '首页'}],
    }]);
    writeJson(root, 'config/reference-retirements.json', {
      schemaVersion: 2,
      retirements: [{
        manual: target.manual,
        sourcePath: `content/en/reference/${retiredId}.md`,
        targetPath: `content/zh-CN/reference/${retiredId}.md`,
        changeKind: null,
        rationale: 'Deliberate fixture retirement',
      }],
    });
    unlinkSync(path.join(root, `content/en/reference/${retiredId}.md`));

    expect(() => validateReferenceNavigation({repositoryRoot: root, site: 'zh-CN'})).toThrow(
      new RegExp(
        `site=en.*manual=${target.manual}.*sidebar=generated/en/sidebars/${target.sidebar}\\.sidebar\\.js.*documentId=${retiredId}.*invariant=document-resolution`,
        'is',
      ),
    );
  });
});
