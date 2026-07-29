import {existsSync, linkSync, mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {publicationStagePaths, type CliDependencies, type CommandContext} from '../cli.ts';
import {resolveManualPublication} from '../manuals/registry.ts';
import {ownedTreeCommit} from '../publication/atomicReplace.ts';
import {
  capturePublicationDiagnostics,
  writePublicationAnchor,
  writePublicationDiagnostics,
  type PublicationDiagnosticsIdentity,
} from '../publication/diagnostics.ts';
import {
  executePublicationGroup,
  parsePublishGroupArgs,
  serializeSourcePublicationManifest,
  writePublicationGroupDiagnostics,
} from './run.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-group-'));
}

function write(root: string, relative: string, contents = 'x\n'): void {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
}

function unsafeManifest(files: readonly string[]): string {
  return `${JSON.stringify({schemaVersion: 1, site: 'zh-CN', group: 'guides', files}, null, 2)}\n`;
}

const guidesAttestation = 'tmp/docs-tooling/zh-CN/groups/guides/.docs-tooling-validated-stage.json';

function preparedGuidesStage(root: string): Readonly<{
  stagedFile: string;
  stagedManifest: string;
  diagnostics: string;
}> {
  const stagedFile = 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/a.md';
  const byocFile = 'content/zh-CN/byoc/tutorials/b.md';
  const sidebar = 'generated/zh-CN/sidebars/guides.sidebar.js';
  const byocSidebar = 'generated/zh-CN/sidebars/guides-byoc.sidebar.js';
  const files = ['content/zh-CN/guides/tutorials/a.md', byocFile, sidebar, byocSidebar];
  for (const file of files) write(root, file, `live ${file}\n`);
  write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(files));
  write(root, stagedFile, 'staged a\n');
  write(root, `tmp/docs-tooling/zh-CN/guides-byoc/${byocFile}`, 'staged b\n');
  write(root, `tmp/docs-tooling/zh-CN/guides/${sidebar}`, 'staged sidebar\n');
  write(root, `tmp/docs-tooling/zh-CN/guides-byoc/${byocSidebar}`, 'staged byoc sidebar\n');
  const stagedManifest = 'tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json';
  write(root, stagedManifest, serializeSourcePublicationManifest(files));
  writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
  return {
    stagedFile,
    stagedManifest,
    diagnostics: 'tmp/docs-tooling/zh-CN/groups/guides/.docs-tooling-publication-group.json',
  };
}

async function validatePreparedGuides(root: string): Promise<void> {
  writeManualStageDiagnostics(root, 'zh-CN', 'guides', 'guides');
  writeManualStageDiagnostics(root, 'zh-CN', 'guides', 'guides-byoc');
  await executePublicationGroup(
    {site: 'zh-CN', group: 'guides', stage: 'validate'},
    {repositoryRoot: root, aliyunOssValidator: {validatePublication: vi.fn().mockResolvedValue(undefined)}},
  );
}

function writeManualStageDiagnostics(root: string, site: 'en' | 'zh-CN', group: string, manual: string): void {
  const resolved = resolveManualPublication(manual, site);
  const stage = `tmp/docs-tooling/${site}/${manual}`;
  const identity: PublicationDiagnosticsIdentity = {
    site,
    manual,
    stage,
    publication: resolved.publication,
    sourceChain: resolved.sourceChain,
  };
  const diagnostics = capturePublicationDiagnostics(root, identity);
  writePublicationDiagnostics(root, stage, diagnostics);
  writePublicationAnchor(root, identity, diagnostics);
}

function writeFetchedStage(context: CommandContext): void {
  const staged = publicationStagePaths(context);
  mkdirSync(staged.outputPath, {recursive: true});
  writeFileSync(path.join(staged.outputPath, 'index.md'), '# Staged\n');
  mkdirSync(path.dirname(staged.sidebarPath), {recursive: true});
  writeFileSync(staged.sidebarPath, 'module.exports = []\n');
}

function prepareManualStage(root: string, site: 'en' | 'zh-CN', group: string, manual: string): void {
  const {publication} = resolveManualPublication(manual, site);
  write(root, `${publication.outputDir}/index.md`, '# Live\n');
  write(root, publication.sidebarPath, 'module.exports = []\n');
  write(root, `tmp/docs-tooling/${site}/${manual}/${publication.outputDir}/index.md`, '# Staged\n');
  write(root, `tmp/docs-tooling/${site}/${manual}/${publication.sidebarPath}`, 'module.exports = []\n');
  writeManualStageDiagnostics(root, site, group, manual);
}

describe('publish-group argument parsing', () => {
  it('requires a site, group, and closed stage', () => {
    expect(parsePublishGroupArgs(['publish-group', '--site', 'en', '--group', 'guides', '--stage', 'fetch'])).toEqual({
      site: 'en', group: 'guides', stage: 'fetch',
    });
    expect(() => parsePublishGroupArgs(['publish-group', '--group', 'guides', '--stage', 'fetch'])).toThrow(/--site/);
    expect(() => parsePublishGroupArgs(['publish-group', '--site', 'en', '--group', 'guides', '--stage', 'build'])).toThrow(/fetch.*validate.*publish/i);
  });
});

describe('typed publication group execution', () => {
  it('does not allow a dependency to replace the callback-scoped already-fenced executor', async () => {
    const fetch = vi.fn(async () => undefined);
    const bypass = vi.fn(async () => undefined);

    await executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: temporaryRoot(),
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'},
        fetch,
        ...({executeManual: bypass} as unknown as CliDependencies),
      },
    );

    expect(fetch).toHaveBeenCalledOnce();
    expect(bypass).not.toHaveBeenCalled();
  });

  it('dispatches manual stages in-process using registry-derived canonical stages', async () => {
    const root = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# Home\n');
    write(root, 'content/en/byoc/tutorials/home.md', '# BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = []\n');
    const beforeManual = vi.fn(async (_argv: readonly string[], _dependencies: CliDependencies) => undefined);
    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: root, environment: {BASE: 'yes'}, fetch: writeFetchedStage, testing: {beforeManual}},
    );

    expect(beforeManual).toHaveBeenCalledTimes(2);
    expect(beforeManual.mock.calls[0][0]).toEqual([
      'fetch', '--manual', 'guides', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides',
    ]);
    expect(beforeManual.mock.calls[1][0]).toEqual([
      'fetch', '--manual', 'guides-byoc', '--group', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides-byoc',
    ]);
    expect(beforeManual.mock.calls[0][1].environment).toEqual({BASE: 'yes'});
    expect(beforeManual.mock.calls[1][1].environment).toEqual({BASE: 'yes', DOCS_TOOLING_REUSE_LARK_SOURCE: '1'});
  });

  it('gives beforeManual frozen deep copies that cannot mutate runtime arguments', async () => {
    const root = temporaryRoot();
    const environment = {BASE: 'yes'};
    write(root, 'content/en/guides/tutorials/home.md', '# Home\n');
    write(root, 'content/en/byoc/tutorials/home.md', '# BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = []\n');
    const beforeManual = vi.fn((argv: readonly string[], dependencies: CliDependencies) => {
      expect(Object.isFrozen(argv)).toBe(true);
      expect(Object.isFrozen(dependencies)).toBe(true);
      expect(Object.isFrozen(dependencies.environment)).toBe(true);
      expect(dependencies.environment).not.toBe(environment);
      expect(() => { (argv as string[])[0] = 'publish'; }).toThrow();
      expect(() => { dependencies.environment!.BASE = 'mutated'; }).toThrow();
    });

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: root, environment, fetch: writeFetchedStage, testing: {beforeManual}},
    );

    expect(beforeManual).toHaveBeenCalledTimes(2);
    expect(environment).toEqual({BASE: 'yes'});
    expect(beforeManual.mock.calls[1][0][0]).toBe('fetch');
    expect(beforeManual.mock.calls[1][1].environment).toEqual({BASE: 'yes', DOCS_TOOLING_REUSE_LARK_SOURCE: '1'});
  });

  it('keeps the shared Guides source fetch as a single manual operation', async () => {
    const beforeManual = vi.fn(async (_argv: readonly string[], _dependencies: CliDependencies) => undefined);
    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: temporaryRoot(),
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'},
        fetch: vi.fn(async () => undefined),
        testing: {beforeManual},
      },
    );
    expect(beforeManual).toHaveBeenCalledOnce();
    expect(beforeManual.mock.calls[0][0]).toContain('guides');
    expect(beforeManual.mock.calls[0][0]).not.toContain('guides-byoc');
  });

  it('derives source snapshots without exposing legacy generator path maps', async () => {
    const root = temporaryRoot();
    prepareManualStage(root, 'en', 'python', 'python');
    const result = await executePublicationGroup(
      {site: 'en', group: 'python', stage: 'validate'},
      {repositoryRoot: root},
    );
    expect(result.sourceSnapshots).toEqual(['packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json']);
  });

  it('rejects a validated-stage attestation replayed across group, manual, and stage identity', async () => {
    const root = temporaryRoot();
    prepareManualStage(root, 'en', 'python', 'python');
    await executePublicationGroup(
      {site: 'en', group: 'python', stage: 'validate'},
      {repositoryRoot: root},
    );
    mkdirSync(path.join(root, 'tmp/docs-tooling/en/java'), {recursive: true});
    write(
      root,
      'tmp/docs-tooling/en/groups/java/.docs-tooling-validated-stage.json',
      readFileSync(path.join(root, 'tmp/docs-tooling/en/groups/python/.docs-tooling-validated-stage.json'), 'utf8'),
    );
    const beforeManual = vi.fn();

    await expect(executePublicationGroup(
      {site: 'en', group: 'java', stage: 'publish'},
      {repositoryRoot: root, testing: {beforeManual}},
    )).rejects.toThrow(/identity|site.*group.*manual.*stage|request/i);
    expect(beforeManual).not.toHaveBeenCalled();
  });

  it('seeds canonical Guides stages from the immutable live baseline without publishing', async () => {
    const root = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# Home\n');
    write(root, 'content/en/guides/tutorials/a.md', '# A\n');
    write(root, 'content/en/byoc/tutorials/b.md', '# B\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = []\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: root, environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline'}},
    );

    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/a.md'), 'utf8')).toBe('# A\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/b.md'), 'utf8')).toBe('# B\n');
    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/a.md'), 'utf8')).toBe('# A\n');
  });

  it('prepares drifted English Guides publication targets from the immutable baseline before seeding', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# Current home\n');
    write(root, 'content/en/guides/tutorials/current.md', '# Current\n');
    write(root, 'content/en/byoc/tutorials/current.md', '# Current BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["current"]\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["current"]\n');
    write(baselineRoot, 'content/en/guides/tutorials/home.md', '# Baseline home\n');
    write(baselineRoot, 'content/en/guides/tutorials/baseline.md', '# Baseline\n');
    write(baselineRoot, 'content/en/byoc/tutorials/baseline.md', '# Baseline BYOC\n');
    write(baselineRoot, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["baseline"]\n');
    write(baselineRoot, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["baseline"]\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/baseline.md'), 'utf8')).toBe('# Baseline\n');
    expect(() => readFileSync(path.join(root, 'content/en/guides/tutorials/current.md'), 'utf8')).toThrow();
    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/home.md'), 'utf8')).toBe('# Current home\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/baseline.md'), 'utf8')).toBe('# Baseline\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/home.md'), 'utf8')).toBe('# Current home\n');
  });

  it('retains a preserved Guides landing page that is absent from the immutable baseline', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# PR home\n');
    write(root, 'content/en/guides/tutorials/current.md', '# Current\n');
    write(root, 'content/en/byoc/tutorials/current.md', '# Current BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["current"]\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["current"]\n');
    write(baselineRoot, 'content/en/guides/tutorials/baseline.md', '# Baseline\n');
    write(baselineRoot, 'content/en/byoc/tutorials/baseline.md', '# Baseline BYOC\n');
    write(baselineRoot, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["baseline"]\n');
    write(baselineRoot, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["baseline"]\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/home.md'), 'utf8')).toBe('# PR home\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/home.md'), 'utf8')).toBe('# PR home\n');
  });

  it('retains live Guides targets when the immutable baseline predates their publication paths', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# PR home\n');
    write(root, 'content/en/guides/tutorials/current.md', '# Current\n');
    write(root, 'content/en/byoc/tutorials/current.md', '# Current BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["current"]\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["current"]\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/current.md'), 'utf8')).toBe('# Current\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/current.md'), 'utf8')).toBe('# Current\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/generated/en/sidebars/guides.sidebar.js'), 'utf8')).toContain('current');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/current.md'), 'utf8')).toBe('# Current BYOC\n');
  });
});

describe('Chinese Guides source publication', () => {
  it('rejects an ordinary staged file changed after validate before atomic replacement', async () => {
    const root = temporaryRoot();
    const {stagedFile} = preparedGuidesStage(root);
    await validatePreparedGuides(root);
    write(root, stagedFile, 'tampered after validate\n');
    const atomicReplace = vi.fn(async () => undefined);

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace},
    )).rejects.toThrow(/validated stage|attestation|changed after validate|stale/i);

    expect(atomicReplace).not.toHaveBeenCalled();
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/a.md'), 'utf8')).toContain('live');
  });

  it('rejects a hard-linked inventoried staged file even when its bytes still match the attestation', async () => {
    const root = temporaryRoot();
    const {stagedFile} = preparedGuidesStage(root);
    await validatePreparedGuides(root);
    const stagedPath = path.join(root, stagedFile);
    const outside = path.join(temporaryRoot(), 'staged.md');
    writeFileSync(outside, readFileSync(stagedPath));
    rmSync(stagedPath);
    linkSync(outside, stagedPath);
    const atomicReplace = vi.fn(async () => undefined);

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace},
    )).rejects.toThrow(/hard.?link|linked|validated stage|attestation/i);
    expect(atomicReplace).not.toHaveBeenCalled();
    expect(readFileSync(outside, 'utf8')).toBe('staged a\n');
  });

  it('rejects an extra file added anywhere under the group stage after validate', async () => {
    const root = temporaryRoot();
    preparedGuidesStage(root);
    await validatePreparedGuides(root);
    write(root, 'tmp/docs-tooling/zh-CN/groups/guides/unattested-extra.txt', 'added after validate\n');
    const atomicReplace = vi.fn(async () => undefined);

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace},
    )).rejects.toThrow(/validated stage|attestation|changed after validate|stale/i);
    expect(atomicReplace).not.toHaveBeenCalled();
  });

  it.each(['manifest', 'diagnostics'] as const)(
    'rejects staged %s changed after validate before atomic replacement',
    async kind => {
      const root = temporaryRoot();
      const fixture = preparedGuidesStage(root);
      await validatePreparedGuides(root);
      write(root, fixture[kind === 'manifest' ? 'stagedManifest' : 'diagnostics'], '{}\n');
      const atomicReplace = vi.fn(async () => undefined);

      await expect(executePublicationGroup(
        {site: 'zh-CN', group: 'guides', stage: 'publish'},
        {repositoryRoot: root, atomicReplace},
      )).rejects.toThrow(/validated stage|attestation|changed after validate|stale/i);
      expect(atomicReplace).not.toHaveBeenCalled();
    },
  );

  it.each(['added', 'deleted', 'renamed'] as const)(
    'rejects a staged file that was %s after validate',
    async mutation => {
      const root = temporaryRoot();
      const {stagedFile} = preparedGuidesStage(root);
      await validatePreparedGuides(root);
      if (mutation === 'added') write(root, `${path.dirname(stagedFile)}/added.md`, 'added\n');
      if (mutation === 'deleted') rmSync(path.join(root, stagedFile));
      if (mutation === 'renamed') renameSync(path.join(root, stagedFile), path.join(root, `${path.dirname(stagedFile)}/renamed.md`));
      const atomicReplace = vi.fn(async () => undefined);

      await expect(executePublicationGroup(
        {site: 'zh-CN', group: 'guides', stage: 'publish'},
        {repositoryRoot: root, atomicReplace},
      )).rejects.toThrow(/validated stage|attestation|changed after validate|stale/i);
      expect(atomicReplace).not.toHaveBeenCalled();
    },
  );

  it.each(['missing', 'malformed', 'symlinked', 'hard-linked'] as const)(
    'fails closed when the staged inventory attestation is %s',
    async kind => {
      const root = temporaryRoot();
      preparedGuidesStage(root);
      await validatePreparedGuides(root);
      const attestation = path.join(root, guidesAttestation);
      if (kind === 'missing') rmSync(attestation);
      if (kind === 'malformed') writeFileSync(attestation, '{}\n');
      if (kind === 'symlinked') {
        const outside = path.join(temporaryRoot(), 'attestation.json');
        writeFileSync(outside, readFileSync(attestation));
        rmSync(attestation);
        symlinkSync(outside, attestation);
      }
      if (kind === 'hard-linked') {
        const outside = path.join(temporaryRoot(), 'attestation.json');
        rmSync(attestation);
        writeFileSync(outside, '{}\n');
        linkSync(outside, attestation);
      }
      const atomicReplace = vi.fn(async () => undefined);

      await expect(executePublicationGroup(
        {site: 'zh-CN', group: 'guides', stage: 'publish'},
        {repositoryRoot: root, atomicReplace},
      )).rejects.toThrow(/attestation|validated stage|symlink|hard.?link|linked/i);
      expect(atomicReplace).not.toHaveBeenCalled();
    },
  );

  it('rejects a symlinked group diagnostics ancestor without writing outside the repository', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    write(outside, 'sentinel', 'keep\n');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/zh-CN/groups'));

    expect(() => writePublicationGroupDiagnostics(root, 'zh-CN', 'guides')).toThrow(/symlink|ancestor|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'sentinel'), 'utf8')).toBe('keep\n');
    expect(existsSync(path.join(outside, 'guides/.docs-tooling-publication-group.json'))).toBe(false);
  });

  it('rejects a symlinked staged manifest ancestor for both write and read', async () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    const files = [
      'content/zh-CN/guides/tutorials/a.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    for (const file of files) write(root, file, `live ${file}\n`);
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(files));
    write(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/a.md', 'staged a\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides/generated/zh-CN/sidebars/guides.sidebar.js', 'staged sidebar\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'staged byoc sidebar\n');
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN/groups/guides'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/zh-CN/groups/guides/generated'));
    write(outside, 'zh-CN/manifests/sentinel', 'keep\n');

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'validate'},
      {repositoryRoot: root, environment: {DOCS_TOOLING_GUIDES_STAGE: 'assembled'}},
    )).rejects.toThrow(/symlink|ancestor|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'zh-CN/manifests/sentinel'), 'utf8')).toBe('keep\n');

    write(outside, 'zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(files));
    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace: vi.fn(async () => undefined)},
    )).rejects.toThrow(/symlink|ancestor|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'zh-CN/manifests/sentinel'), 'utf8')).toBe('keep\n');
  });

  it('rejects a symlinked baseline restore ancestor without deleting or copying outside', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const outside = temporaryRoot();
    const manifest = serializeSourcePublicationManifest([]);
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', manifest);
    write(baselineRoot, 'generated/zh-CN/manifests/guides-source-publication.json', manifest);
    write(outside, 'baseline-restore/sentinel', 'keep\n');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/zh-CN/groups'));

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline', DOCS_TOOLING_BASELINE_ROOT: baselineRoot},
      },
    )).rejects.toThrow(/symlink|ancestor|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'baseline-restore/sentinel'), 'utf8')).toBe('keep\n');
    expect(existsSync(path.join(root, 'tmp/docs-tooling/zh-CN/guides'))).toBe(false);
  });

  it('rejects a symlinked baseline restore final entry without deleting or copying outside', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const outside = temporaryRoot();
    const manifest = serializeSourcePublicationManifest([]);
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', manifest);
    write(baselineRoot, 'generated/zh-CN/manifests/guides-source-publication.json', manifest);
    write(outside, 'sentinel', 'keep\n');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN/groups/guides'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/zh-CN/groups/guides/baseline-restore'));

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline', DOCS_TOOLING_BASELINE_ROOT: baselineRoot},
      },
    )).rejects.toThrow(/symlink|stage|unsafe/i);
    expect(readFileSync(path.join(outside, 'sentinel'), 'utf8')).toBe('keep\n');
  });

  it('rejects a baseline manifest entry that resolves to a directory', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const directoryEntry = 'content/zh-CN/guides/tutorials/directory.md';
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([]));
    write(baselineRoot, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([directoryEntry]));
    write(baselineRoot, `${directoryEntry}/child.md`, 'not a regular manifest file\n');
    const atomicReplace = vi.fn(async () => {
      throw new Error('Atomic replacement must not run for a directory manifest entry');
    });

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline', DOCS_TOOLING_BASELINE_ROOT: baselineRoot},
        atomicReplace,
      },
    )).rejects.toThrow(/regular file|must be a file/i);
    expect(atomicReplace).not.toHaveBeenCalled();
  });

  it('cleans a partial baseline restore stage when manifest file copying fails', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const copiedFile = 'content/zh-CN/guides/tutorials/a.md';
    const missingFile = 'content/zh-CN/guides/tutorials/z.md';
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([]));
    write(baselineRoot, copiedFile, 'copied before failure\n');
    write(
      baselineRoot,
      'generated/zh-CN/manifests/guides-source-publication.json',
      serializeSourcePublicationManifest([copiedFile, missingFile]),
    );
    const atomicReplace = vi.fn(async () => undefined);

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline', DOCS_TOOLING_BASELINE_ROOT: baselineRoot},
        atomicReplace,
      },
    )).rejects.toThrow(/regular file|missing/i);

    expect(atomicReplace).not.toHaveBeenCalled();
    expect(existsSync(path.join(root, 'tmp/docs-tooling/zh-CN/groups/guides/baseline-restore'))).toBe(false);
  });

  it('prepares a drifted live baseline from manifest-owned files without touching protected Tools content', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const currentFiles = [
      'content/zh-CN/guides/tutorials/home.md',
      'content/zh-CN/guides/tutorials/current.md',
      'content/zh-CN/byoc/current.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    const baselineFiles = [
      'content/zh-CN/guides/tutorials/home.md',
      'content/zh-CN/guides/tutorials/baseline.md',
      'content/zh-CN/byoc/baseline.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    for (const file of currentFiles) write(root, file, `current ${file}\n`);
    for (const file of baselineFiles) write(baselineRoot, file, `baseline ${file}\n`);
    write(root, 'generated/zh-CN/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(baselineRoot, 'generated/zh-CN/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(root, 'content/en/guides/tutorials/tools/keep.md', 'canonical English Tools content\n');
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent-owned live content\n');
    write(baselineRoot, 'content/zh-CN/guides/tutorials/tools/keep.md', 'stale protected baseline content\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    write(baselineRoot, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(baselineFiles));

    await executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/baseline.md'), 'utf8')).toContain('baseline');
    expect(() => readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/current.md'), 'utf8')).toThrow();
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent-owned live content\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/baseline.md'), 'utf8')).toContain('baseline');
  });

  it('publishes only manifest-owned files and preserves the Agent-owned Tools subtree', async () => {
    const root = temporaryRoot();
    const groupStage = 'tmp/docs-tooling/zh-CN/groups/guides';
    write(root, 'content/zh-CN/guides/tutorials/old.md', 'old\n');
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent\n');
    write(root, 'content/zh-CN/byoc/old.md', 'old\n');
    write(root, 'generated/zh-CN/sidebars/guides.sidebar.js', 'old sidebar\n');
    write(root, 'generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'old byoc sidebar\n');
    write(root, 'generated/zh-CN/manifests/tools-translations.json', '{}\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([
      'content/zh-CN/guides/tutorials/old.md',
      'content/zh-CN/byoc/old.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ]));
    write(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/new.md', 'new\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides/generated/zh-CN/sidebars/guides.sidebar.js', 'new sidebar\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials/new.md', 'new\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'new byoc sidebar\n');
    const nextFiles = [
      'content/zh-CN/guides/tutorials/new.md',
      'content/zh-CN/byoc/tutorials/new.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    write(root, `${groupStage}/generated/zh-CN/manifests/guides-source-publication.json`, serializeSourcePublicationManifest(nextFiles));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent updated after fetch\n');
    await validatePreparedGuides(root);

    await executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root},
    );

    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/new.md'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'content/zh-CN/byoc/tutorials/new.md'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent updated after fetch\n');
    expect(readFileSync(path.join(root, 'generated/zh-CN/manifests/tools-translations.json'), 'utf8')).toBe('{}\n');
    expect(() => readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/old.md'), 'utf8')).toThrow();
    expect(ownedTreeCommit(root, nextFiles)).toMatch(/^sha256:/);
  });

  it('rejects an ordinary Chinese Guides mutation after fetch diagnostics', async () => {
    const root = temporaryRoot();
    const currentFiles = [
      'content/zh-CN/guides/tutorials/ordinary.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    for (const file of currentFiles) write(root, file, `current ${file}\n`);
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    write(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/ordinary.md', 'staged ordinary\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides/generated/zh-CN/sidebars/guides.sidebar.js', 'staged guides sidebar\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'staged byoc sidebar\n');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials'), {recursive: true});
    write(root, 'tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await validatePreparedGuides(root);
    write(root, 'content/zh-CN/guides/tutorials/ordinary.md', 'changed after fetch\n');

    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root},
    )).rejects.toThrow(/stale.*publication baseline|live owned files changed/i);
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/ordinary.md'), 'utf8')).toBe('changed after fetch\n');
  });

  it('serializes different Chinese Guides manifest sets under one stable site and group fence', async () => {
    const root = temporaryRoot();
    const shared = 'content/zh-CN/guides/tutorials/a.md';
    const sidebar = 'generated/zh-CN/sidebars/guides.sidebar.js';
    const byocSidebar = 'generated/zh-CN/sidebars/guides-byoc.sidebar.js';
    const currentFiles = [shared, sidebar, byocSidebar];
    for (const file of currentFiles) write(root, file, `current ${file}\n`);
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    write(root, `tmp/docs-tooling/zh-CN/guides/${shared}`, 'candidate A\n');
    write(root, `tmp/docs-tooling/zh-CN/guides/${sidebar}`, 'candidate sidebar\n');
    write(root, `tmp/docs-tooling/zh-CN/guides-byoc/${byocSidebar}`, 'candidate byoc sidebar\n');
    mkdirSync(path.join(root, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials'), {recursive: true});
    write(root, 'tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await validatePreparedGuides(root);

    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>(resolve => { releaseFirst = resolve; });
    let firstEntered!: () => void;
    const firstStarted = new Promise<void>(resolve => { firstEntered = resolve; });
    const firstReplace = vi.fn(async () => {
      firstEntered();
      await firstBlocked;
      write(root, shared, 'published by A,B\n');
      write(root, 'content/zh-CN/guides/tutorials/b.md', 'published B\n');
      write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([
        shared, 'content/zh-CN/guides/tutorials/b.md', sidebar, byocSidebar,
      ]));
    });
    const secondReplace = vi.fn(async () => undefined);

    const first = executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace: firstReplace},
    );
    await firstStarted;
    const second = executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace: secondReplace},
    );
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(secondReplace).not.toHaveBeenCalled();

    releaseFirst();
    await first;
    await expect(second).rejects.toThrow(/stale.*publication baseline|live owned files changed/i);
    expect(secondReplace).not.toHaveBeenCalled();
    expect(readFileSync(path.join(root, shared), 'utf8')).toBe('published by A,B\n');
  });

  it('rechecks the attestation inside the stable fence before a waiting atomic replacement', async () => {
    const root = temporaryRoot();
    const {stagedFile} = preparedGuidesStage(root);
    await validatePreparedGuides(root);
    const liveBefore = readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/a.md'), 'utf8');
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>(resolve => { releaseFirst = resolve; });
    let firstEntered!: () => void;
    const firstStarted = new Promise<void>(resolve => { firstEntered = resolve; });
    const firstReplace = vi.fn(async () => {
      firstEntered();
      await firstBlocked;
    });
    const secondReplace = vi.fn(async () => undefined);

    const first = executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace: firstReplace},
    );
    await firstStarted;
    const second = executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, atomicReplace: secondReplace},
    );
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(secondReplace).not.toHaveBeenCalled();
    write(root, stagedFile, 'tampered while waiting for fence\n');
    releaseFirst();
    await first;
    await expect(second).rejects.toThrow(/changed after validate|attestation|validated stage/i);
    expect(secondReplace).not.toHaveBeenCalled();
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/a.md'), 'utf8')).toBe(liveBefore);
  });

  it.each([
    'content/zh-CN/guides/tutorials/tools/new.md',
    'generated/zh-CN/sidebars/tools.sidebar.js',
    'generated/zh-CN/manifests/tools-translations.json',
  ])('rejects a staged write under protected Tools ownership: %s', async protectedPath => {
    const root = temporaryRoot();
    prepareManualStage(root, 'zh-CN', 'guides', 'guides');
    prepareManualStage(root, 'zh-CN', 'guides', 'guides-byoc');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([]));
    write(root, `tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json`, unsafeManifest([protectedPath]));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'validate'},
      {repositoryRoot: root, aliyunOssValidator: {validatePublication: vi.fn().mockResolvedValue(undefined)}},
    )).rejects.toThrow(/protected.*Tools|Tools.*protected/i);
  });

  it('rejects an omit-delete claim inherited from a poisoned source manifest', async () => {
    const root = temporaryRoot();
    const stagedFiles = [
      'content/zh-CN/guides/tutorials/a.md',
      'content/zh-CN/byoc/tutorials/b.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', unsafeManifest([
      'content/zh-CN/guides/tutorials/tools/keep.md',
    ]));
    for (const file of stagedFiles) {
      const manual = file.startsWith('content/zh-CN/byoc/') || file.includes('guides-byoc') ? 'guides-byoc' : 'guides';
      write(root, `tmp/docs-tooling/zh-CN/${manual}/${file}`, `staged ${file}\n`);
    }
    write(
      root,
      'tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json',
      serializeSourcePublicationManifest(stagedFiles),
    );
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await validatePreparedGuides(root);
    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root},
    )).rejects.toThrow(/protected.*Tools|Tools.*protected/i);
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent\n');
  });
});
