import {spawnSync as childSpawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, linkSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {executeDocsToolingCommand, parseCliArgs, publicationStagePaths} from '../cli';
import {resolveManualPublication} from '../manuals/registry';
import {atomicReplace as realAtomicReplace, ownedTreeCommit} from '../publication/atomicReplace';
import {
  createPublicationDiagnostics,
  publicationOwnedTargets,
  writePublicationAnchor,
  writePublicationDiagnostics,
} from '../publication/diagnostics';
import {assertPublicationOwnership, assertSafeRepositoryRelativePath} from './ownership';
import {assertPathSetIntegrity, validateStageFilesystem} from './filesystem';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-validation-'));
}

function seedEnglishPythonLanding(repositoryRoot: string): void {
  const landing = path.join(repositoryRoot, 'content/en/reference/api/python/python/python.md');
  mkdirSync(path.dirname(landing), {recursive: true});
  writeFileSync(landing, '# Python landing\n');
}

function seedEnglishRestPreservedFiles(repositoryRoot: string): void {
  const output = path.join(repositoryRoot, 'content/en/reference/api/restful/restful');
  for (const [relativePath, contents] of [
    ['restful.md', '# REST API\n'],
    ['versioning.md', '# Versioning\n'],
    ['v1/error-codes.md', '# V1 errors\n'],
    ['v2/error-codes-v2.md', '# V2 errors\n'],
  ] as const) {
    const target = path.join(output, relativePath);
    mkdirSync(path.dirname(target), {recursive: true});
    writeFileSync(target, contents);
  }
}

function seedLocalizedRestPreservedFiles(repositoryRoot: string): void {
  const output = path.join(repositoryRoot, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful');
  for (const [relativePath, contents] of [
    ['restful.md', '# REST API\n'],
    ['versioning.md', '# Versioning\n'],
    ['v1/error-codes.md', '# V1 errors\n'],
    ['v2/error-codes-v2.md', '# V2 errors\n'],
  ] as const) {
    const target = path.join(output, relativePath);
    mkdirSync(path.dirname(target), {recursive: true});
    writeFileSync(target, contents);
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function canonicalSha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function writeDiagnosticsFixture(
  repositoryRoot: string,
  manual: string,
  site: 'en' | 'zh-CN',
  stage: string,
  baselineCommit?: string,
): void {
  const resolved = resolveManualPublication(manual, site);
  const identity = {
    site,
    manual,
    stage,
    publication: resolved.publication,
    sourceChain: resolved.sourceChain,
  };
  const diagnostics = createPublicationDiagnostics(identity, baselineCommit ?? ownedTreeCommit(repositoryRoot, publicationOwnedTargets(site, resolved.publication)));
  writePublicationDiagnostics(repositoryRoot, path.join(repositoryRoot, stage), diagnostics);
  writePublicationAnchor(repositoryRoot, identity, diagnostics);
}

describe('path ownership validation', () => {
  it.each([
    '/absolute',
    '../escape',
    'safe/../../escape',
    'safe\\windows',
    'safe//empty',
    'safe/./dot',
    'safe/NUL',
  ])('rejects unsafe repository paths: %s', value => {
    expect(() => assertSafeRepositoryRelativePath(value, 'fixture')).toThrow(/unsafe|normalized|reserved/i);
  });

  it('rejects publication ownership outside the selected site', () => {
    expect(() => assertPublicationOwnership('en', {
      enabled: true,
      source: 'canonical',
      generatorTarget: 'zilliz',
      outputDir: 'content/zh-CN/reference/python',
      contentRoot: 'content/en/reference',
      sidebarPath: 'generated/en/sidebars/python.sidebar.js',
      missingContent: 'error',
    })).toThrow(/site-owned/i);
  });
});

describe('stage filesystem validation', () => {
  it('returns a stable sorted inventory for an ordinary stage', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'nested'));
    writeFileSync(path.join(root, 'z.mdx'), '# Z\n');
    writeFileSync(path.join(root, 'nested/a.md'), '# A\n');

    expect(validateStageFilesystem(root).files.map(file => file.path)).toEqual(['nested/a.md', 'z.mdx']);
  });

  it('fails closed on symlinks and filesystem collisions', () => {
    const symlinkRoot = temporaryRoot();
    writeFileSync(path.join(symlinkRoot, 'target.md'), '# Target\n');
    symlinkSync('target.md', path.join(symlinkRoot, 'alias.md'));
    expect(() => validateStageFilesystem(symlinkRoot)).toThrow(/symlink/i);

    expect(() => assertPathSetIntegrity(['Guide.md', 'guide.md'])).toThrow(/case collision/i);
  });

  it('rejects a hard-linked inventoried stage file without changing its outside peer', () => {
    const root = temporaryRoot();
    const outside = path.join(temporaryRoot(), 'outside.md');
    writeFileSync(outside, '# outside\n');
    linkSync(outside, path.join(root, 'page.md'));

    expect(() => validateStageFilesystem(root)).toThrow(/hard.?link|linked/i);
    expect(readFileSync(outside, 'utf8')).toBe('# outside\n');
  });

  it('rejects executable drift, CRLF, reserved names, and oversized files', () => {
    const executableRoot = temporaryRoot();
    writeFileSync(path.join(executableRoot, 'page.md'), '# page\n', {mode: 0o755});
    expect(() => validateStageFilesystem(executableRoot)).toThrow(/executable/i);

    const crlfRoot = temporaryRoot();
    writeFileSync(path.join(crlfRoot, 'page.md'), '# page\r\n');
    expect(() => validateStageFilesystem(crlfRoot)).toThrow(/CRLF/i);

    const reservedRoot = temporaryRoot();
    writeFileSync(path.join(reservedRoot, 'CON.md'), '# page\n');
    expect(() => validateStageFilesystem(reservedRoot)).toThrow(/reserved/i);

    const largeRoot = temporaryRoot();
    writeFileSync(path.join(largeRoot, 'page.md'), '12345');
    expect(() => validateStageFilesystem(largeRoot, {maxFileSize: 4})).toThrow(/size/i);
  });

  it('checks path collisions once after discovery instead of rescanning the accumulated set', () => {
    const root = temporaryRoot();
    for (let index = 0; index < 12; index += 1) writeFileSync(path.join(root, `page-${index}.md`), `# ${index}\n`);
    const lowerCase = vi.spyOn(String.prototype, 'toLocaleLowerCase');
    try {
      validateStageFilesystem(root);
      expect(lowerCase).toHaveBeenCalledTimes(12);
    } finally {
      lowerCase.mockRestore();
    }
  });
});

describe('docs-tooling CLI boundary', () => {
  it('seeds declared site-owned Guides files into a clean publication stage before rendering', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/en/guides/tutorials');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'home.md'), '# Site-owned home\n');
    const fetch = (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      const paths = publicationStagePaths(context);
      expect(readFileSync(path.join(paths.outputPath, 'home.md'), 'utf8')).toBe('# Site-owned home\n');
      writeFileSync(path.join(paths.outputPath, 'generated.md'), '# Generated\n');
      mkdirSync(path.dirname(paths.sidebarPath), {recursive: true});
      writeFileSync(paths.sidebarPath, 'module.exports = []\n');
    };

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides'],
      {repositoryRoot, fetch},
    );

    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/home.md'), 'utf8'))
      .toBe('# Site-owned home\n');
  });

  it('restores a declared preserved Reference landing after generator cleanup', async () => {
    const repositoryRoot = temporaryRoot();
    const landing = 'content/en/reference/api/python/python/python.md';
    const liveLanding = path.join(repositoryRoot, landing);
    mkdirSync(path.dirname(liveLanding), {recursive: true});
    writeFileSync(liveLanding, '# Hand-authored Python landing\n');
    const fetch = (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      const paths = publicationStagePaths(context);
      expect(readFileSync(path.join(paths.outputPath, 'python.md'), 'utf8')).toBe('# Hand-authored Python landing\n');
      rmSync(paths.outputPath, {recursive: true, force: true});
      mkdirSync(paths.outputPath, {recursive: true});
      writeFileSync(path.join(paths.outputPath, 'generated.md'), '# Generated\n');
      mkdirSync(path.dirname(paths.sidebarPath), {recursive: true});
      writeFileSync(paths.sidebarPath, 'module.exports = []\n');
    };

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, fetch},
    );

    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python', landing), 'utf8'))
      .toBe('# Hand-authored Python landing\n');
  });

  it('uses the selected Chinese adapters for staged Markdown and validates Aliyun through injection', async () => {
    const repositoryRoot = temporaryRoot();
    const aliyunOssValidator = {validatePublication: vi.fn().mockResolvedValue(undefined)};
    const fetch = (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      const paths = publicationStagePaths(context);
      mkdirSync(paths.outputPath, {recursive: true});
      writeFileSync(
        path.join(paths.outputPath, 'page.md'),
        'Sales: https://www.zilliz.com/contact-sales\nEndpoint: YOUR_CLUSTER_ENDPOINT\n',
      );
      mkdirSync(path.dirname(paths.sidebarPath), {recursive: true});
      writeFileSync(paths.sidebarPath, 'module.exports = []\n');
    };
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];

    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot, fetch, aliyunOssValidator});

    const staged = readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/content/zh-CN/reference/api/python/python/page.md'), 'utf8');
    expect(staged).toContain('https://zilliz.com.cn/contact-sales');
    expect(staged).toContain('YOUR_CLUSTER_ENDPOINT');

    await executeDocsToolingCommand(['validate', ...args], {repositoryRoot, aliyunOssValidator});
    expect(aliyunOssValidator.validatePublication).toHaveBeenCalledOnce();
  });

  it('requires injected Aliyun storage for Chinese validation and publication but not fetch transforms', async () => {
    const repositoryRoot = temporaryRoot();
    const fetch = (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      const paths = publicationStagePaths(context);
      mkdirSync(paths.outputPath, {recursive: true});
      writeFileSync(paths.outputPath + '/page.md', 'Sales: https://www.zilliz.com/contact-sales\n');
      mkdirSync(path.dirname(paths.sidebarPath), {recursive: true});
      writeFileSync(paths.sidebarPath, 'module.exports = []\n');
    };
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];

    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot, fetch});
    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/content/zh-CN/reference/api/python/python/page.md'), 'utf8'))
      .toBe('Sales: https://zilliz.com.cn/contact-sales\n');

    await expect(executeDocsToolingCommand(['validate', ...args], {repositoryRoot}))
      .rejects.toThrow(/Aliyun OSS validator injection/i);
    await expect(executeDocsToolingCommand(['publish', ...args], {repositoryRoot}))
      .rejects.toThrow(/Aliyun OSS validator injection/i);
    expect(existsSync(path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python'))).toBe(false);
  });

  it('revalidates Chinese publication from the immutable atomic snapshot before installation', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    const stageRoot = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# old\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["old"]\n');
    mkdirSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python/page.md'), '# fresh\n');
    mkdirSync(path.join(stageRoot, 'generated/zh-CN/sidebars'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'generated/zh-CN/sidebars/python.sidebar.js'), 'module.exports = ["fresh"]\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'zh-CN', 'tmp/docs-tooling/zh-CN/python');
    const roots: string[] = [];
    const aliyunOssValidator = {
      validatePublication: vi.fn(async (root: string, context: {publicationRoot: string}) => {
        roots.push(root);
        expect(context.publicationRoot).toBe(root);
      }),
    };

    await executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'],
      {repositoryRoot, aliyunOssValidator} as never,
    );

    expect(roots).toHaveLength(2);
    expect(roots[0]).toBe(realpathSync(stageRoot));
    expect(roots[1]).not.toBe(realpathSync(stageRoot));
    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# fresh\n');
  });

  it('rejects snapshot validation failures before atomic installation', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    const stageRoot = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# old\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["old"]\n');
    mkdirSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python/page.md'), '# fresh\n');
    mkdirSync(path.join(stageRoot, 'generated/zh-CN/sidebars'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'generated/zh-CN/sidebars/python.sidebar.js'), 'module.exports = ["fresh"]\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'zh-CN', 'tmp/docs-tooling/zh-CN/python');
    const aliyunOssValidator = {
      validatePublication: vi.fn(async (root: string) => {
        if (root !== stageRoot) throw new Error('snapshot validator rejection');
      }),
    };

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'],
      {repositoryRoot, aliyunOssValidator} as never,
    )).rejects.toThrow('snapshot validator rejection');

    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# old\n');
  });

  it('does not let custom internal publication hooks bypass selected validation', async () => {
    const repositoryRoot = temporaryRoot();
    const stageRoot = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python');
    mkdirSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python/page.md'), '# staged\n');
    mkdirSync(path.join(stageRoot, 'generated/zh-CN/sidebars'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'generated/zh-CN/sidebars/python.sidebar.js'), 'module.exports = []\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'zh-CN', 'tmp/docs-tooling/zh-CN/python');
    const publish = vi.fn();
    const aliyunOssValidator = {validatePublication: vi.fn(async () => { throw new Error('validator rejection'); })};

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'],
      {repositoryRoot, aliyunOssValidator, publish},
    )).rejects.toThrow('validator rejection');

    expect(aliyunOssValidator.validatePublication).toHaveBeenCalledOnce();
    expect(publish).not.toHaveBeenCalled();
  });

  it('applies REST replacements only to the REST manual and leaves English publication unchanged', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishPythonLanding(repositoryRoot);
    mkdirSync(path.join(repositoryRoot, 'content/zh-CN/reference/api/restful/restful'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'content/zh-CN/reference/api/restful/restful/restful.md'), '# REST API\n');
    const fetch = (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      const paths = publicationStagePaths(context);
      mkdirSync(paths.outputPath, {recursive: true});
      writeFileSync(path.join(paths.outputPath, 'page.md'), 'Sales: https://www.zilliz.com/contact-sales\nEndpoint: YOUR_CLUSTER_ENDPOINT\n');
      mkdirSync(path.dirname(paths.sidebarPath), {recursive: true});
      writeFileSync(paths.sidebarPath, 'module.exports = []\n');
    };

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'rest', '--group', 'rest', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/rest'],
      {repositoryRoot, fetch},
    );
    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, fetch},
    );

    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/rest/content/zh-CN/reference/api/restful/restful/page.md'), 'utf8'))
      .toContain('https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530');
    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/page.md'), 'utf8'))
      .toBe('Sales: https://www.zilliz.com/contact-sales\nEndpoint: YOUR_CLUSTER_ENDPOINT\n');
  });

  it('persists the fetch-time baseline across independent validate and publish invocations', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# fetched baseline\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["baseline"]\n');
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];
    const aliyunOssValidator = {validatePublication: vi.fn().mockResolvedValue(undefined)};

    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot});
    const diagnosticsPath = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/.publication-diagnostics.json');
    const diagnostics = readFileSync(diagnosticsPath, 'utf8');
    await executeDocsToolingCommand(['validate', ...args], {repositoryRoot, aliyunOssValidator});

    writeFileSync(path.join(liveOutput, 'page.md'), '# newer live publication\n');
    await expect(executeDocsToolingCommand(['publish', ...args], {repositoryRoot, aliyunOssValidator})).rejects.toThrow(/baseline|compare-and-swap|stale/i);

    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# newer live publication\n');
    expect(readFileSync(diagnosticsPath, 'utf8')).toBe(diagnostics);
    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/content/zh-CN/reference/api/python/python/page.md'), 'utf8')).toBe('# fetched baseline\n');
  });

  it('rejects coordinated stage diagnostics tampering that rebases a stale stage onto newer live content', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# baseline A\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["A"]\n');
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];
    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot});
    const stageRoot = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python');
    const diagnosticsPath = path.join(stageRoot, '.publication-diagnostics.json');

    writeFileSync(path.join(liveOutput, 'page.md'), '# newer live B\n');
    const tampered = JSON.parse(readFileSync(diagnosticsPath, 'utf8')) as Record<string, unknown>;
    tampered.baselineCommit = ownedTreeCommit(repositoryRoot, [
      'content/zh-CN/reference/api/python/python',
      'generated/zh-CN/sidebars/python.sidebar.js',
    ]);
    const {manifestSha256: _oldManifestSha256, ...manifest} = tampered;
    tampered.manifestSha256 = canonicalSha256(manifest);
    writeFileSync(diagnosticsPath, `${JSON.stringify(tampered, null, 2)}\n`);
    const tamperedBytes = readFileSync(diagnosticsPath, 'utf8');

    await expect(executeDocsToolingCommand(['validate', ...args], {repositoryRoot})).rejects.toThrow(/anchor|diagnostics|trusted|baseline/i);
    await expect(executeDocsToolingCommand(['publish', ...args], {repositoryRoot})).rejects.toThrow(/anchor|diagnostics|trusted|baseline/i);
    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# newer live B\n');
    expect(readFileSync(path.join(stageRoot, 'content/zh-CN/reference/api/python/python/page.md'), 'utf8')).toBe('# baseline A\n');
    expect(readFileSync(diagnosticsPath, 'utf8')).toBe(tamperedBytes);
  });

  it('publishes a fresh independently validated stage using its persisted baseline', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# old\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["old"]\n');
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];
    const aliyunOssValidator = {validatePublication: vi.fn().mockResolvedValue(undefined)};

    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/content/zh-CN/reference/api/python/python/page.md'), '# fresh stage\n');
    await executeDocsToolingCommand(['validate', ...args], {repositoryRoot, aliyunOssValidator});
    await executeDocsToolingCommand(['publish', ...args], {repositoryRoot, aliyunOssValidator});

    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# fresh stage\n');
    expect(existsSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/.publication-diagnostics.json'))).toBe(true);
  });

  it('rejects stage content tampered after CLI validation by validating the immutable atomic snapshot', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/en/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/en/sidebars/python.sidebar.js');
    const stageRoot = path.join(repositoryRoot, 'tmp/docs-tooling/en/python');
    const stagedOutput = path.join(stageRoot, 'content/en/reference/api/python/python');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# old\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = ["old"]\n');
    mkdirSync(stagedOutput, {recursive: true});
    writeFileSync(path.join(stagedOutput, 'page.md'), '# validated\n');
    mkdirSync(path.join(stageRoot, 'generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(stageRoot, 'generated/en/sidebars/python.sidebar.js'), 'module.exports = ["validated"]\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python');
    const diagnosticsPath = path.join(stageRoot, '.publication-diagnostics.json');
    const diagnosticsBytes = readFileSync(diagnosticsPath, 'utf8');

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {
        repositoryRoot,
        atomicReplace: async options => {
          writeFileSync(path.join(stagedOutput, '.env.production'), 'SECRET=attacker\n');
          const validateSnapshot = options.validatePublication;
          expect(validateSnapshot).toEqual(expect.any(Function));
          await realAtomicReplace({
            ...options,
            validatePublication: async snapshot => {
              expect(existsSync(path.join(snapshot.publicationRoot, '.publication-diagnostics.json'))).toBe(false);
              await validateSnapshot!(snapshot);
            },
          });
        },
      },
    )).rejects.toThrow(/credential|secret|integrity|environment|\.env/i);

    expect(readFileSync(path.join(liveOutput, 'page.md'), 'utf8')).toBe('# old\n');
    expect(readFileSync(liveSidebar, 'utf8')).toBe('module.exports = ["old"]\n');
    expect(readFileSync(diagnosticsPath, 'utf8')).toBe(diagnosticsBytes);
  });

  it.each([
    ['missing', (diagnosticsPath: string) => rmSync(diagnosticsPath, {force: true})],
    ['tampered', (diagnosticsPath: string) => {
      const diagnostics = JSON.parse(readFileSync(diagnosticsPath, 'utf8')) as Record<string, unknown>;
      diagnostics.baselineCommit = 'sha256:tampered';
      writeFileSync(diagnosticsPath, `${JSON.stringify(diagnostics)}\n`);
    }],
    ['mismatched', (diagnosticsPath: string) => {
      const diagnostics = JSON.parse(readFileSync(diagnosticsPath, 'utf8')) as Record<string, unknown>;
      diagnostics.manual = 'rest';
      writeFileSync(diagnosticsPath, `${JSON.stringify(diagnostics)}\n`);
    }],
  ] as const)('rejects a %s publication diagnostics manifest without rewriting it', async (_kind, mutate) => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'page.md'), '# live\n');
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = []\n');
    const args = ['--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'];
    await executeDocsToolingCommand(['fetch', ...args], {repositoryRoot});
    const diagnosticsPath = path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/.publication-diagnostics.json');
    mutate(diagnosticsPath);
    const bytes = existsSync(diagnosticsPath) ? readFileSync(diagnosticsPath, 'utf8') : null;

    await expect(executeDocsToolingCommand(['validate', ...args], {repositoryRoot})).rejects.toThrow(/diagnostics|manifest|baseline|manual|missing/i);
    if (bytes === null) expect(existsSync(diagnosticsPath)).toBe(false);
    else expect(readFileSync(diagnosticsPath, 'utf8')).toBe(bytes);
  });

  it('does not create publication diagnostics for a Guides source-only cache stage', async () => {
    const repositoryRoot = temporaryRoot();
    const sourceDir = path.join(repositoryRoot, 'packages/docs-tooling/src/lark/meta/sources/guides');
    mkdirSync(sourceDir, {recursive: true});
    writeFileSync(path.join(sourceDir, 'source.json'), '{}\n');
    const spawnSync = vi.fn(() => ({status: 0}));

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides'],
      {repositoryRoot, environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'}, spawnSync},
    );

    expect(existsSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/guides/.publication-diagnostics.json'))).toBe(false);
    expect(existsSync(path.join(repositoryRoot, 'tmp/docs-tooling/.publication-anchors'))).toBe(false);
  });

  it('parses only the closed command shape', () => {
    expect(parseCliArgs(['validate', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'])).toEqual({
      command: 'validate',
      manual: 'python',
      group: 'python',
      site: 'en',
      stage: 'tmp/docs-tooling/en/python',
    });
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'])).toThrow(/group|usage/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'])).toThrow(/canonical group|mismatch/i);
    expect(() => parseCliArgs(['remove', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'])).toThrow(/unknown command/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--group', 'python', '--site', 'fr', '--stage', 'tmp/docs-tooling/en/python'])).toThrow(/unknown site/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', '../escape'])).toThrow(/unsafe|normalized/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python', '--extra'])).toThrow(/unknown argument|usage/i);
    expect(parseCliArgs(['validate', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python/render'])).toMatchObject({stage: 'tmp/docs-tooling/en/python/render'});
    for (const unsafeStage of [
      '.git',
      '/tmp/absolute',
      'tmp\\docs-tooling\\en\\python',
      'tmp/docs-tooling/en/python/../escape',
      'tmp/docs-tooling/zh-CN/python',
      'tmp/docs-tooling/en/java',
      'content/en/reference/api/python/python',
      'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
    ]) {
      expect(() => parseCliArgs(['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', unsafeStage])).toThrow(/stage|unsafe|canonical|normalized/i);
    }
  });

  it('serializes concurrent direct CLI commands through the canonical site and group fence', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishPythonLanding(repositoryRoot);
    const argv = ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'];
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>(resolve => { releaseFirst = resolve; });
    let firstEntered!: () => void;
    const firstStarted = new Promise<void>(resolve => { firstEntered = resolve; });
    let active = 0;
    let maximumActive = 0;
    const fetch = vi.fn(async (context: Parameters<NonNullable<Parameters<typeof executeDocsToolingCommand>[1]>['fetch']>[0]) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      if (fetch.mock.calls.length === 1) {
        firstEntered();
        await firstBlocked;
      }
      const staged = publicationStagePaths(context);
      mkdirSync(staged.outputPath, {recursive: true});
      writeFileSync(path.join(staged.outputPath, 'page.md'), '# staged\n');
      mkdirSync(path.dirname(staged.sidebarPath), {recursive: true});
      writeFileSync(staged.sidebarPath, 'module.exports = []\n');
      active -= 1;
    });

    const first = executeDocsToolingCommand(argv, {repositoryRoot, fetch});
    await firstStarted;
    const second = executeDocsToolingCommand(argv, {repositoryRoot, fetch});
    await new Promise(resolve => setTimeout(resolve, 40));
    expect(fetch).toHaveBeenCalledTimes(1);
    releaseFirst();
    await Promise.all([first, second]);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(maximumActive).toBe(1);
  });

  it('fails closed on unknown manuals and missing local sources', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/unknown'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/unknown/page.md'), '# page\n');

    await expect(executeDocsToolingCommand(
      ['validate', '--manual', 'unknown', '--group', 'unknown', '--site', 'en', '--stage', 'tmp/docs-tooling/en/unknown'],
      {repositoryRoot},
    )).rejects.toThrow(/unknown manual/i);

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'],
      {repositoryRoot},
    )).rejects.toThrow(/source.*missing/i);
  });

  it('dispatches remote Lark sources to the moved generator with explicit identity and stage', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishPythonLanding(repositoryRoot);
    const spawnSync = vi.fn((command: string, args: readonly string[], options: {cwd: string}) => {
      expect(command).toBe(process.execPath);
      expect(args[0]).toBe(path.join(repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'));
      expect(options.cwd).toBe(repositoryRoot);
      const sourceDir = args[args.indexOf('--source-dir') + 1];
      mkdirSync(path.join(repositoryRoot, sourceDir), {recursive: true});
      writeFileSync(path.join(repositoryRoot, sourceDir, 'source.json'), '{}\n');
      if (args.includes('--source-only')) return {status: 0};
      expect(args).toEqual(expect.arrayContaining([
        '--manual', 'python',
        '--site', 'en',
        '--source', 'english-v3.0',
        '--generator-manual', 'pymilvus30',
        '--snapshot-path', 'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
        '--generator-target', 'zilliz',
        '--source-type', 'drive',
        '--root', 'UxyTfjS3wl0TF8dn9tZcRT39nUe',
        '--base', 'Hk05b5eI6aXXSSsd6j9cqwwMn5a',
        '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
        '--stage', 'tmp/docs-tooling/en/python',
        '--output-dir', 'content/en/reference/api/python/python',
        '--content-root', 'content/en/reference',
        '--sidebar-path', 'generated/en/sidebars/python.sidebar.js',
        '--override-path', 'sidebar-overrides/en/python.json',
      ]));
      mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
      writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/page.md'), '# generated\n');
      mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
      writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = []\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).toHaveBeenCalledTimes(4);
  });

  it('fetches the full ordered fallback source chain before rendering the active SDK publication', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishPythonLanding(repositoryRoot);
    const calls: readonly string[][] = [];
    const spawnSync = vi.fn((_command: string, args: readonly string[]) => {
      (calls as string[][]).push([...args]);
      const sourceDir = args[args.indexOf('--source-dir') + 1];
      mkdirSync(path.join(repositoryRoot, sourceDir), {recursive: true});
      writeFileSync(path.join(repositoryRoot, sourceDir, 'source.json'), '{}\n');
      if (!args.includes('--source-only')) {
        mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
        writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/page.md'), '# generated\n');
        mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
        writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = []\n');
      }
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, spawnSync},
    );

    expect(calls.map(args => args[args.indexOf('--source') + 1])).toEqual([
      'english-v2.4',
      'english-v2.5',
      'english-v2.6',
      'english-v3.0',
    ]);
    expect(calls.map(args => args[args.indexOf('--generator-manual') + 1])).toEqual(['python', 'pymilvus25', 'pymilvus26', 'pymilvus30']);
    expect(calls.map(args => args[args.indexOf('--snapshot-path') + 1])).toEqual([
      'packages/docs-tooling/src/lark/meta/snapshots/python-uat-last-success.json',
      'packages/docs-tooling/src/lark/meta/snapshots/pymilvus25-uat-last-success.json',
      'packages/docs-tooling/src/lark/meta/snapshots/pymilvus26-uat-last-success.json',
      'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
    ]);
    expect(calls.slice(0, -1).every(args => args.includes('--source-only'))).toBe(true);
    expect(calls.at(-1)).not.toContain('--source-only');
    expect(calls.map(args => args.includes('--fallback-source-dir')
      ? args[args.indexOf('--fallback-source-dir') + 1]
      : null)).toEqual([
      null,
      'packages/docs-tooling/src/lark/meta/sources/python/v2.4.x',
      'packages/docs-tooling/src/lark/meta/sources/python/v2.5.x',
      'packages/docs-tooling/src/lark/meta/sources/python/v2.6.x',
    ]);
  });

  it('preserves the Guides source-only snapshot stage without requiring a preexisting cache', async () => {
    const repositoryRoot = temporaryRoot();
    const sourceDir = path.join(repositoryRoot, 'packages/docs-tooling/src/lark/meta/sources/guides');
    const spawnSync = vi.fn((_command: string, args: readonly string[]) => {
      expect(args).toEqual(expect.arrayContaining([
        '--manual', 'guides',
        '--source-only',
        '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
      ]));
      mkdirSync(sourceDir, {recursive: true});
      writeFileSync(path.join(sourceDir, 'source.json'), '{}\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides/source'],
      {
        repositoryRoot,
        spawnSync,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'},
      },
    );

    expect(spawnSync).toHaveBeenCalledOnce();
    expect(() => validateStageFilesystem(path.join(repositoryRoot, 'tmp/docs-tooling/en/guides/source'))).not.toThrow();
  });

  it('renders SaaS and BYOC from one shared Guides source and snapshot identity', async () => {
    const repositoryRoot = temporaryRoot();
    const guidesOutput = path.join(repositoryRoot, 'content/en/guides/tutorials');
    mkdirSync(guidesOutput, {recursive: true});
    writeFileSync(path.join(guidesOutput, 'home.md'), '# Home\n');
    const calls: string[][] = [];
    const spawnSync = vi.fn((_command: string, args: readonly string[]) => {
      calls.push([...args]);
      const sourceDir = args[args.indexOf('--source-dir') + 1];
      mkdirSync(path.join(repositoryRoot, sourceDir), {recursive: true});
      writeFileSync(path.join(repositoryRoot, sourceDir, 'source.json'), '{}\n');
      if (args.includes('--source-only')) return {status: 0};
      const stage = args[args.indexOf('--stage') + 1];
      const outputDir = args[args.indexOf('--output-dir') + 1];
      const sidebarPath = args[args.indexOf('--sidebar-path') + 1];
      mkdirSync(path.join(repositoryRoot, stage, outputDir), {recursive: true});
      writeFileSync(path.join(repositoryRoot, stage, outputDir, 'page.md'), '# generated\n');
      mkdirSync(path.dirname(path.join(repositoryRoot, stage, sidebarPath)), {recursive: true});
      writeFileSync(path.join(repositoryRoot, stage, sidebarPath), 'module.exports = []\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides'], {repositoryRoot, spawnSync});
    await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides-byoc', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides-byoc'],
      {repositoryRoot, spawnSync, environment: {DOCS_TOOLING_REUSE_LARK_SOURCE: '1'}},
    );

    expect(calls).toHaveLength(3);
    const value = (args: string[], flag: string) => args[args.indexOf(flag) + 1];
    expect(calls.map(args => value(args, '--source-dir'))).toEqual([
      'packages/docs-tooling/src/lark/meta/sources/guides',
      'packages/docs-tooling/src/lark/meta/sources/guides',
      'packages/docs-tooling/src/lark/meta/sources/guides',
    ]);
    expect(calls.map(args => value(args, '--snapshot-path'))).toEqual([
      'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
      'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
      'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
    ]);
    expect(calls.map(args => value(args, '--generator-target'))).toEqual(['zilliz.saas', 'zilliz.saas', 'zilliz.paas']);
    expect(calls[0]).toEqual(expect.arrayContaining([
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
    ]));
    expect(calls[0]).not.toContain('--reuse-source');
    expect(calls[1]).toContain('--reuse-source');
    expect(calls[2]).toContain('--reuse-source');
  });

  it('lets the Chinese Guides source replace live Tools content', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/guides/tutorials');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/guides.sidebar.js');
    const translatedTools = Buffer.from('---\ntitle: 已翻译工具\n---\n\n# 已翻译工具\n');
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'home.md'), '# 首页\n');
    mkdirSync(path.join(liveOutput, 'tools'), {recursive: true});
    writeFileSync(path.join(liveOutput, 'tools/translated.md'), translatedTools);
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = []\n');
    const canonicalTool = path.join(repositoryRoot, 'content/en/guides/tutorials/tools/terraform-provider.md');
    mkdirSync(path.dirname(canonicalTool), {recursive: true});
    writeFileSync(canonicalTool, '# Terraform\n');

    const context = await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/guides'],
      {
        repositoryRoot,
        async fetch(fetchContext) {
          const staged = publicationStagePaths(fetchContext);
          expect(existsSync(path.join(staged.outputPath, 'tools/translated.md'))).toBe(false);
          mkdirSync(staged.outputPath, {recursive: true});
          mkdirSync(path.join(staged.outputPath, 'tools'), {recursive: true});
          writeFileSync(path.join(staged.outputPath, 'tools/source-owned.md'), '# source-owned Tools\n');
          writeFileSync(path.join(staged.outputPath, 'terraform-provider.md'), '# 旧中文来源\n');
          writeFileSync(path.join(staged.outputPath, 'keep.md'), '# 中文产品文档\n');
          mkdirSync(path.dirname(staged.sidebarPath), {recursive: true});
          writeFileSync(staged.sidebarPath, `module.exports = ${JSON.stringify([
            {type: 'category', label: '工具', items: [{type: 'doc', id: 'tutorials/terraform-provider'}]},
            {type: 'doc', id: 'tutorials/keep'},
          ])}\n`);
        },
      },
    );

    const staged = publicationStagePaths(context);
    expect(readFileSync(path.join(staged.outputPath, 'terraform-provider.md'), 'utf8')).toContain('旧中文来源');
    expect(readFileSync(path.join(staged.outputPath, 'keep.md'), 'utf8')).toContain('中文产品文档');
    expect(readFileSync(path.join(staged.outputPath, 'tools/source-owned.md'), 'utf8')).toContain('source-owned Tools');
    expect(existsSync(path.join(staged.outputPath, 'tools/translated.md'))).toBe(false);
    const require = createRequire(import.meta.url);
    delete require.cache[require.resolve(staged.sidebarPath)];
    expect(require(staged.sidebarPath)).toEqual([
      {type: 'category', label: '工具', items: [{type: 'doc', id: 'tutorials/terraform-provider'}]},
      {type: 'doc', id: 'tutorials/keep'},
    ]);

    const replace = vi.fn(async options => {
      const contentReplacement = options.replacements.find(replacement => replacement.target === 'content/zh-CN/guides/tutorials');
      expect(contentReplacement).toBeDefined();
      expect(readFileSync(path.join(contentReplacement!.source, 'tools/source-owned.md'), 'utf8')).toContain('source-owned Tools');
    });
    await executeDocsToolingCommand(
      ['publish', '--manual', 'guides', '--group', 'guides', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/guides'],
      {repositoryRoot, atomicReplace: replace, aliyunOssValidator: {validatePublication: vi.fn().mockResolvedValue(undefined)}},
    );
    expect(replace).toHaveBeenCalledOnce();
  });

  it('rejects symlinked live Chinese Tools translations before running the Guides generator', async () => {
    const repositoryRoot = temporaryRoot();
    const liveOutput = path.join(repositoryRoot, 'content/zh-CN/guides/tutorials');
    const liveSidebar = path.join(repositoryRoot, 'generated/zh-CN/sidebars/guides.sidebar.js');
    const outside = temporaryRoot();
    mkdirSync(liveOutput, {recursive: true});
    writeFileSync(path.join(liveOutput, 'home.md'), '# 首页\n');
    writeFileSync(path.join(outside, 'translated.md'), '# outside\n');
    symlinkSync(outside, path.join(liveOutput, 'tools'));
    mkdirSync(path.dirname(liveSidebar), {recursive: true});
    writeFileSync(liveSidebar, 'module.exports = []\n');
    const fetch = vi.fn();

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/guides'],
      {repositoryRoot, fetch},
    )).rejects.toThrow(/symlink/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('stops a Guides clean run when the shared source fetch fails before either render', async () => {
    const repositoryRoot = temporaryRoot();
    const guidesOutput = path.join(repositoryRoot, 'content/en/guides/tutorials');
    mkdirSync(guidesOutput, {recursive: true});
    writeFileSync(path.join(guidesOutput, 'home.md'), '# Home\n');
    const spawnSync = vi.fn((_command: string, _args: readonly string[]) => ({status: 9}));

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides'],
      {repositoryRoot, spawnSync},
    )).rejects.toThrow(/guides.*generator.*status 9/i);
    expect(spawnSync).toHaveBeenCalledOnce();
    expect(spawnSync.mock.calls[0][1]).toContain('--source-only');
  });

  it('propagates remote generator failures without falling back to a cache copy', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishPythonLanding(repositoryRoot);
    const spawnSync = vi.fn(() => ({status: 7}));

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, spawnSync},
    )).rejects.toThrow(/python.*generator.*status 7/i);
    expect(spawnSync).toHaveBeenCalledOnce();
  });

  it('rejects symlink ancestors before clearing a stage and leaves the link target untouched', async () => {
    const repositoryRoot = temporaryRoot();
    const outside = temporaryRoot();
    writeFileSync(path.join(outside, 'sentinel'), 'keep\n');
    symlinkSync(outside, path.join(repositoryRoot, 'tmp'));

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, spawnSync: vi.fn()},
    )).rejects.toThrow(/symlink|ancestor|stage/i);
    expect(readFileSync(path.join(outside, 'sentinel'), 'utf8')).toBe('keep\n');
  });

  it('rejects a symlinked manual stage root before reset and leaves its outside target untouched', async () => {
    const repositoryRoot = temporaryRoot();
    const outside = temporaryRoot();
    writeFileSync(path.join(outside, 'sentinel'), 'keep\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en'), {recursive: true});
    symlinkSync(outside, path.join(repositoryRoot, 'tmp/docs-tooling/en/python'));

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, spawnSync: vi.fn()},
    )).rejects.toThrow(/symlink|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'sentinel'), 'utf8')).toBe('keep\n');
    expect(existsSync(path.join(outside, '.publication-diagnostics.json'))).toBe(false);
  });

  it('rejects destructive stage aliases before touching repository metadata, source, or publication trees', async () => {
    const repositoryRoot = temporaryRoot();
    const protectedPaths = [
      '.git/sentinel',
      'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x/sentinel',
      'content/en/reference/api/python/python/sentinel',
      'generated/en/sidebars/sentinel',
    ];
    for (const protectedPath of protectedPaths) {
      mkdirSync(path.dirname(path.join(repositoryRoot, protectedPath)), {recursive: true});
      writeFileSync(path.join(repositoryRoot, protectedPath), 'keep\n');
    }
    for (const stage of ['.git', 'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x', 'content/en/reference/api/python/python', 'generated/en/sidebars']) {
      await expect(executeDocsToolingCommand(['fetch', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', stage], {repositoryRoot})).rejects.toThrow(/stage|canonical|unsafe/i);
    }
    for (const protectedPath of protectedPaths) expect(readFileSync(path.join(repositoryRoot, protectedPath), 'utf8')).toBe('keep\n');
  });

  it('dispatches the English REST source to the moved REST generator', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishRestPreservedFiles(repositoryRoot);
    seedLocalizedRestPreservedFiles(repositoryRoot);
    writeFileSync(
      path.join(repositoryRoot, 'content/en/reference/api/restful/restful/restful.md'),
      '---\nsidebar_label: RESTful API Reference\nsidebar_position: 0\n---\n\n# RESTful API Overview\n',
    );
    mkdirSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi/spec.json'), '{}\n');
    mkdirSync(path.join(repositoryRoot, 'generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'generated/en/sidebars/restful.sidebar.js'), `module.exports = ${JSON.stringify([{
      type: 'category',
      label: 'Role Operations (V2)',
      items: [{
        type: 'doc',
        id: 'api/restful/restful/v2/data-plane/role-operations-v2/create-role-v2',
      }],
    }])}\n`);
    const spawnSync = vi.fn((command: string, args: readonly string[]) => {
      expect(command).toBe(process.execPath);
      const lang = args[args.indexOf('--lang') + 1];
      const output = lang === 'en-US'
        ? path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/content/en/reference/api/restful/restful')
        : path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful');
      expect(args).toEqual([
        path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/index.js'),
        '--specifications', path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'),
        '--output_path', output,
        '--lang', lang,
        '--target', 'zilliz',
      ]);
      expect(args).not.toContain('--publication-policy');
      expect(args).not.toContain('--release-track');
      if (lang === 'en-US') {
        const pages = [
          ['v2/v2.mdx', '---\nslug: /restful/v2\nsidebar_position: 1\n---\n\n# V2\n'],
          ['v2/control-plane/control-plane.mdx', '---\nslug: /restful/control-plane-v2\nsidebar_position: 1\n---\n\n# Control Plane (V2)\n'],
          ['v2/control-plane/cloud-access-control-operations-v2/cloud-access-control-operations-v2.mdx', '---\nslug: /restful/cloud-access-control-operations-v2\nsidebar_position: 20\n---\n\n# Cloud Access Control Operations (V2)\n'],
          ['v2/control-plane/cloud-access-control-operations-v2/create-cloud-role-v2.mdx', '---\nsidebar_label: Create Cloud Role (V2)\nsidebar_position: 0\n---\n\n# Create Cloud Role (V2)\n'],
          ['v2/control-plane/cloud-api-key-operations-v2/cloud-api-key-operations-v2.mdx', '---\nslug: /restful/cloud-api-key-operations-v2\nsidebar_position: 21\n---\n\n# Cloud API Key Operations (V2)\n'],
          ['v2/control-plane/cloud-api-key-operations-v2/create-api-key-v2.mdx', '---\nsidebar_label: Create API Key (V2)\nsidebar_position: 0\n---\n\n# Create API Key (V2)\n'],
          ['v2/data-plane/data-plane.mdx', '---\nslug: /restful/data-plane-v2\nsidebar_position: 2\n---\n\n# Data Plane (V2)\n'],
          ['v2/data-plane/cluster-role-operations-v2/cluster-role-operations-v2.mdx', '---\nslug: /restful/cluster-role-operations-v2\nsidebar_position: 8\n---\n\n# Cluster Role Operations (V2)\n'],
          ['v2/data-plane/cluster-role-operations-v2/create-role-v2.mdx', '---\nsidebar_label: Create Role (V2)\nsidebar_position: 0\n---\n\n# Create Role (V2)\n'],
        ] as const;
        for (const [relativePath, contents] of pages) {
          const target = path.join(output, relativePath);
          mkdirSync(path.dirname(target), {recursive: true});
          writeFileSync(target, contents);
        }
      }
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'rest', '--group', 'rest', '--site', 'en', '--stage', 'tmp/docs-tooling/en/rest'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).toHaveBeenCalledTimes(2);
    const stagedSidebarPath = path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/generated/en/sidebars/restful.sidebar.js');
    const require = createRequire(import.meta.url);
    delete require.cache[require.resolve(stagedSidebarPath)];
    const stagedSidebar = require(stagedSidebarPath);
    const ids = new Set<string>();
    const labels = new Set<string>();
    const visit = (items: readonly Record<string, unknown>[]): void => {
      for (const item of items) {
        if (typeof item.id === 'string') ids.add(item.id);
        if (typeof item.label === 'string') labels.add(item.label);
        if (Array.isArray(item.items)) visit(item.items as readonly Record<string, unknown>[]);
      }
    };
    visit(stagedSidebar);
    expect(ids).toContain('api/restful/restful/v2/data-plane/cluster-role-operations-v2/create-role-v2');
    expect(ids).toContain('api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/create-cloud-role-v2');
    expect(ids).toContain('api/restful/restful/v2/control-plane/cloud-api-key-operations-v2/create-api-key-v2');
    expect(ids).not.toContain('api/restful/restful/v2/data-plane/role-operations-v2/create-role-v2');
    expect(labels).toContain('Cloud Access Control Operations (V2)');
    expect(labels).toContain('Cloud API Key Operations (V2)');
  });

  it('copies committed local sources without invoking a generator', async () => {
    const repositoryRoot = temporaryRoot();
    const source = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    mkdirSync(source, {recursive: true});
    writeFileSync(path.join(source, 'page.md'), '# translated\n');
    mkdirSync(path.join(repositoryRoot, 'generated/zh-CN/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'generated/zh-CN/sidebars/python.sidebar.js'), 'module.exports = []\n');
    const spawnSync = vi.fn();

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).not.toHaveBeenCalled();
  });

  it('validates stage integrity before invoking publication', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/target.md'), '# Target\n');
    symlinkSync('target.md', path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/alias.md'));
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = []\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python');
    const publish = vi.fn();

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, publish},
    )).rejects.toThrow(/symlink/i);
    expect(publish).not.toHaveBeenCalled();
  });

  it('publishes staged content and sidebar artifacts to separate owned targets', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/page.md'), '# staged\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = ["staged"]\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python');

    await executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot},
    );

    expect(readFileSync(path.join(repositoryRoot, 'content/en/reference/api/python/python/page.md'), 'utf8')).toBe('# staged\n');
    expect(readFileSync(path.join(repositoryRoot, 'generated/en/sidebars/python.sidebar.js'), 'utf8')).toBe('module.exports = ["staged"]\n');
    expect(existsSync(path.join(repositoryRoot, 'content/en/reference/api/python/python/content'))).toBe(false);
  });

  it('routes the default publication through the atomic owned-tree boundary', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/page.md'), '# staged\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = ["staged"]\n');
    mkdirSync(path.join(repositoryRoot, 'content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'content/en/reference/api/python/python/page.md'), '# old\n');
    mkdirSync(path.join(repositoryRoot, 'generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'generated/en/sidebars/python.sidebar.js'), 'module.exports = ["old"]\n');
    const expectedBaseline = ownedTreeCommit(repositoryRoot, [
      'content/en/reference/api/python/python',
      'generated/en/sidebars/python.sidebar.js',
    ]);
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python', expectedBaseline);
    const replace = vi.fn(realAtomicReplace);

    await executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, atomicReplace: replace},
    );

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith(expect.objectContaining({
      publicationRoot: expect.any(String),
      baselineCommit: expectedBaseline,
      validatePublication: expect.any(Function),
      replacements: expect.arrayContaining([
        expect.objectContaining({target: 'content/en/reference/api/python/python'}),
        expect.objectContaining({target: 'generated/en/sidebars/python.sidebar.js'}),
      ]),
    }));
  });

  it('publishes an exact owned tree and removes declared retired paths', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/cli/content/en/reference/cli/cli'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/cli/content/en/reference/cli/cli/fresh.md'), '# fresh\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/cli/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/cli/generated/en/sidebars/cli.sidebar.js'), 'module.exports = ["fresh"]\n');
    mkdirSync(path.join(repositoryRoot, 'content/en/reference/cli/cli'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'content/en/reference/cli/cli/stale.md'), '# stale\n');
    for (const retired of ['content/en/reference/cli/v0.1', 'content/en/reference/cli/v1.3']) {
      mkdirSync(path.join(repositoryRoot, retired), {recursive: true});
      writeFileSync(path.join(repositoryRoot, retired, 'retired.md'), '# retired\n');
    }
    writeDiagnosticsFixture(repositoryRoot, 'cli', 'en', 'tmp/docs-tooling/en/cli');

    await executeDocsToolingCommand(['publish', '--manual', 'cli', '--group', 'cli', '--site', 'en', '--stage', 'tmp/docs-tooling/en/cli'], {repositoryRoot});

    expect(existsSync(path.join(repositoryRoot, 'content/en/reference/cli/cli/stale.md'))).toBe(false);
    expect(readFileSync(path.join(repositoryRoot, 'content/en/reference/cli/cli/fresh.md'), 'utf8')).toBe('# fresh\n');
    expect(existsSync(path.join(repositoryRoot, 'content/en/reference/cli/v0.1'))).toBe(false);
    expect(existsSync(path.join(repositoryRoot, 'content/en/reference/cli/v1.3'))).toBe(false);
  });

  it('fails exact publication preflight before mutating hard-linked owned targets', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python/fresh.md'), '# fresh\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = ["fresh"]\n');
    mkdirSync(path.join(repositoryRoot, 'content/en/reference/api/python/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'content/en/reference/api/python/python/old.md'), '# old\n');
    mkdirSync(path.join(repositoryRoot, 'generated/en/sidebars'), {recursive: true});
    const external = path.join(repositoryRoot, 'sidebar-hardlink-sentinel');
    writeFileSync(external, 'module.exports = ["old"]\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python');
    linkSync(external, path.join(repositoryRoot, 'generated/en/sidebars/python.sidebar.js'));

    await expect(executeDocsToolingCommand(['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'], {repositoryRoot})).rejects.toThrow(/hard.?link|link count|owned target/i);
    expect(readFileSync(path.join(repositoryRoot, 'content/en/reference/api/python/python/old.md'), 'utf8')).toBe('# old\n');
    expect(readFileSync(external, 'utf8')).toBe('module.exports = ["old"]\n');
  });

  it('rejects credential markers and traversal links before publication mutation', async () => {
    const repositoryRoot = temporaryRoot();
    const output = path.join(repositoryRoot, 'tmp/docs-tooling/en/python/content/en/reference/api/python/python');
    mkdirSync(output, {recursive: true});
    writeFileSync(path.join(output, '.env.production'), 'placeholder\n');
    writeFileSync(path.join(output, 'token.md'), '[escape](../../../../../../../../.env)\nghp_123456789012345678901234567890123456\n-----BEGIN PRIVATE KEY-----\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js'), 'module.exports = []\n');
    writeDiagnosticsFixture(repositoryRoot, 'python', 'en', 'tmp/docs-tooling/en/python');
    const publish = vi.fn();

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--group', 'python', '--site', 'en', '--stage', 'tmp/docs-tooling/en/python'],
      {repositoryRoot, publish},
    )).rejects.toThrow(/secret|credential|private key|token|traversal|integrity/i);
    expect(publish).not.toHaveBeenCalled();
    expect(existsSync(path.join(repositoryRoot, 'content/en/reference/api/python/python'))).toBe(false);
  });

  it('clears stale REST stages before generation and leaves failures unpublishable', async () => {
    const repositoryRoot = temporaryRoot();
    seedEnglishRestPreservedFiles(repositoryRoot);
    seedLocalizedRestPreservedFiles(repositoryRoot);
    mkdirSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi/spec.json'), '{}\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/content/en/reference/api/restful/restful'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/content/en/reference/api/restful/restful/stale.md'), '# stale\n');
    mkdirSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/generated/en/sidebars'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/generated/en/sidebars/restful.sidebar.js'), 'module.exports = []\n');

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'rest', '--group', 'rest', '--site', 'en', '--stage', 'tmp/docs-tooling/en/rest'],
      {repositoryRoot, spawnSync: vi.fn(() => ({status: 9}))},
    )).rejects.toThrow(/rest.*status 9/i);
    expect(existsSync(path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/content/en/reference/api/restful/restful/stale.md'))).toBe(false);

    const publish = vi.fn();
    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'rest', '--group', 'rest', '--site', 'en', '--stage', 'tmp/docs-tooling/en/rest'],
      {repositoryRoot, publish},
    )).rejects.toThrow(/content artifact|sidebar artifact|missing/i);
    expect(publish).not.toHaveBeenCalled();
  });
});

describe('moved generator module boundaries', () => {
  it('keeps the Lark and REST internals loadable as CommonJS', () => {
    const require = createRequire(import.meta.url);
    expect(() => require('../lark/index.js')).not.toThrow();
    expect(() => require('../lark/cli.js')).not.toThrow();
    expect(() => require('../reference/rest/index.js')).not.toThrow();
  });

  it('makes the standalone REST generator exit nonzero on specification load errors', () => {
    const result = childSpawnSync(process.execPath, [
      path.resolve('packages/docs-tooling/src/reference/rest/index.js'),
      '--specifications', path.join(temporaryRoot(), 'missing-specifications'),
      '--output_path', path.join(temporaryRoot(), 'rest-output'),
    ], {encoding: 'utf8'});

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/failed to read openapi|specification|enoent/i);
  });

  it('allows a full Lark source fetch to start without a preexisting cache directory', () => {
    const require = createRequire(import.meta.url);
    const {resetSourceDirectory} = require('../lark/index.js');
    const sourceDir = path.join(temporaryRoot(), 'missing/source-cache');

    expect(() => resetSourceDirectory(sourceDir)).not.toThrow();
    writeFileSync(path.join(sourceDir, 'stale.json'), '{}\n');
    expect(() => resetSourceDirectory(sourceDir)).not.toThrow();
    expect(() => validateStageFilesystem(sourceDir)).not.toThrow();
  });

  it('keeps Lark stage paths repository-relative and rejects wrapper path escapes', () => {
    const require = createRequire(import.meta.url);
    const {parseArgs, runtimeInvocation, runtimeManual} = require('../lark/cli.js');
    const values = [
      '--manual', 'python',
      '--site', 'en',
      '--source', 'english-v3.0',
      '--generator-manual', 'pymilvus30',
      '--snapshot-path', 'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
      '--generator-target', 'zilliz',
      '--source-type', 'drive',
      '--root', 'root-token',
      '--base', 'base-token',
      '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
      '--fallback-source-dir', 'packages/docs-tooling/src/lark/meta/sources/python/v2.6.x',
      '--stage', 'tmp/docs-tooling/en/python',
      '--output-dir', 'content/en/reference/api/python/python',
      '--content-root', 'content/en/reference',
      '--sidebar-path', 'generated/en/sidebars/python.sidebar.js',
      '--override-path', 'sidebar-overrides/en/python.json',
    ];
    const manual = runtimeManual(parseArgs(values));

    expect(manual.docSourceDir).toBe('packages/docs-tooling/src/lark/meta/sources/python/v3.0.x');
    expect(manual.fallbackSourceDir).toBe('packages/docs-tooling/src/lark/meta/sources/python/v2.6.x');
    expect(manual.contentRoot).toBe('tmp/docs-tooling/en/python/content/en/reference');
    expect(manual.sidebarPath).toBe('tmp/docs-tooling/en/python/generated/en/sidebars/python.sidebar.js');
    expect(manual.overridePath).toBe('sidebar-overrides/en/python.json');
    expect(manual.targets.zilliz.outputDir).toBe('tmp/docs-tooling/en/python/content/en/reference/api/python/python');
    expect(manual.targets.zilliz.imageDir).toBe('tmp/docs-tooling/en/python/.assets');
    expect(runtimeInvocation(parseArgs(values))).toEqual({
      manualIdentity: 'pymilvus30',
      generatorArgs: [
        'fetch-lark-docs',
        '--manual', 'pymilvus30',
        '--pubTarget', 'zilliz',
        '--uploadToS3',
        '--buildEnv', 'uat',
        '--snapshotPath', 'packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json',
      ],
    });
    expect(() => parseArgs([...values, '--reuse-source'])).toThrow(/guides-byoc|reuse/i);
    const reusedByoc = [...values, '--reuse-source'];
    reusedByoc[reusedByoc.indexOf('python')] = 'guides-byoc';
    reusedByoc[reusedByoc.indexOf('pymilvus30')] = 'guides';
    reusedByoc[reusedByoc.indexOf('packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json')] = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json';
    reusedByoc[reusedByoc.indexOf('zilliz')] = 'zilliz.paas';
    const reusedInvocation = runtimeInvocation(parseArgs(reusedByoc)).generatorArgs;
    expect(reusedInvocation).toContain('--skipSourceDown');
    expect(reusedInvocation).not.toContain('--incremental');
    const escaped = [...values];
    escaped[escaped.indexOf('tmp/docs-tooling/en/python')] = '../escape';
    expect(() => parseArgs(escaped)).toThrow(/repository-relative|escape/i);

    const sourceOnly = parseArgs([
      '--manual', 'guides',
      '--site', 'en',
      '--source', 'english',
      '--generator-manual', 'guides',
      '--snapshot-path', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
      '--generator-target', 'zilliz.saas',
      '--source-type', 'wiki',
      '--root', 'root-token',
      '--base', 'base-token:*',
      '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/guides',
      '--stage', 'tmp/docs-tooling/en/guides',
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
      '--force-full-fetch',
    ]);
    expect(runtimeInvocation(sourceOnly)).toEqual({
      manualIdentity: 'guides',
      generatorArgs: [
        'fetch-lark-docs',
        '--manual', 'guides',
        '--sourceOnly',
        '--incremental',
        '--buildEnv', 'uat',
        '--snapshotPath', 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json',
        '--snapshotCandidatePath', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
        '--forceFullFetch',
      ],
    });
  });

  it('constructs nested dotted generator target configuration', () => {
    const require = createRequire(import.meta.url);
    const {runtimeManual} = require('../lark/cli.js');
    const runtimeOptions = {
      manual: 'guides',
      generatorTarget: 'zilliz.saas',
      stage: 'tmp/docs-tooling/en/guides',
      root: 'root-token',
      base: 'base-token:*',
      sourceType: 'wiki',
      sourceDir: 'packages/docs-tooling/src/lark/meta/sources/guides',
      outputDir: 'content/en/guides/tutorials',
      contentRoot: 'content/en/guides',
      sidebarPath: 'generated/en/sidebars/guides.sidebar.js',
    };
    const saas = runtimeManual(runtimeOptions);
    const paas = runtimeManual({...runtimeOptions, generatorTarget: 'zilliz.paas'});
    expect(saas.targets.zilliz.saas.outputDir).toBe('tmp/docs-tooling/en/guides/content/en/guides/tutorials');
    expect(paas.targets.zilliz.paas.outputDir).toBe('tmp/docs-tooling/en/guides/content/en/guides/tutorials');
  });
});
