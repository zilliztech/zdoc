import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  createGitTranslationSourceProvenanceVerifier,
  executeReferenceDocsToolingCommand,
  type ReferenceGitRunner,
} from '../cli.ts';
import {
  EMPTY_FILE_SHA256,
  type ReferenceSourceManifest,
  type ReferenceTranslationManifest,
} from '../reference/translationManifest.ts';
import {validateReferenceTranslation} from './translation.ts';

const sourcePath = 'content/en/reference/api/python/page.md';
const targetPath = 'content/zh-CN/reference/api/python/page.md';
const sourceContents = '# source\n';
const targetContents = '# target\n';
const sourceRoot = 'content/en/reference';
const targetRoot = 'content/zh-CN/reference';
const externalTrackedInputs = 'deploy/contracts/localization-inputs.inventory.json';
const temporaryRepositories = new Set<string>();

afterEach(() => {
  for (const repositoryRoot of temporaryRepositories) rmSync(repositoryRoot, {recursive: true, force: true});
  temporaryRepositories.clear();
});

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function git(repositoryRoot: string, args: readonly string[]): string {
  const result = spawnSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

function temporaryRepository(prefix: string): string {
  const repositoryRoot = mkdtempSync(path.join(tmpdir(), prefix));
  temporaryRepositories.add(repositoryRoot);
  return repositoryRoot;
}

function initializeGitRepository(repositoryRoot: string): void {
  git(repositoryRoot, ['init', '--quiet']);
  git(repositoryRoot, ['config', 'user.email', 'reference-test@example.invalid']);
  git(repositoryRoot, ['config', 'user.name', 'Reference Test']);
}

function addSubmoduleEntry(repositoryRoot: string, entryPath: string): void {
  const submodule = temporaryRepository('reference-provenance-submodule-');
  initializeGitRepository(submodule);
  writeFileSync(path.join(submodule, 'README.md'), '# submodule\n');
  git(submodule, ['add', '.']);
  git(submodule, ['commit', '--quiet', '-m', 'Submodule fixture']);
  git(repositoryRoot, ['-c', 'protocol.file.allow=always', 'submodule', 'add', '--quiet', submodule, entryPath]);
}

function writeExternalTrackedInputs(repositoryRoot: string): void {
  mkdirSync(path.join(repositoryRoot, path.dirname(externalTrackedInputs)), {recursive: true});
  writeFileSync(path.join(repositoryRoot, externalTrackedInputs), '{\n  "schemaVersion": 1,\n  "paths": []\n}\n');
}

type ProvenanceFixture = Readonly<{
  repositoryRoot: string;
  sourceCheckpoint: string;
  sourceManifestCommit: string;
  sourceHash: string;
  targetHash: string;
}>;

function provenanceFixture(options: Readonly<{
  initialSource?: string;
  currentSource?: string;
  retiredMissingSource?: boolean;
  retiredMissingTarget?: boolean;
  historicalEntry?: 'regular' | 'executable' | 'symlink' | 'tree' | 'submodule' | 'missing';
}> = {}): ProvenanceFixture {
  const repositoryRoot = temporaryRepository('reference-translation-provenance-');
  const retiredMissingSource = options.retiredMissingSource ?? false;
  const retiredMissingTarget = options.retiredMissingTarget ?? false;
  const initialSource = options.initialSource ?? (retiredMissingSource ? '' : sourceContents);
  const currentSource = options.currentSource ?? sourceContents;
  const historicalEntry = options.historicalEntry ?? (initialSource === '' ? 'missing' : 'regular');
  mkdirSync(path.join(repositoryRoot, path.dirname(sourcePath)), {recursive: true});
  mkdirSync(path.join(repositoryRoot, path.dirname(targetPath)), {recursive: true});
  writeFileSync(path.join(repositoryRoot, targetPath), targetContents);
  if (historicalEntry === 'regular' || historicalEntry === 'executable') {
    writeFileSync(path.join(repositoryRoot, sourcePath), initialSource);
    if (historicalEntry === 'executable') chmodSync(path.join(repositoryRoot, sourcePath), 0o755);
  } else if (historicalEntry === 'symlink') {
    symlinkSync('historical-target.md', path.join(repositoryRoot, sourcePath));
  } else if (historicalEntry === 'tree') {
    mkdirSync(path.join(repositoryRoot, sourcePath), {recursive: true});
    writeFileSync(path.join(repositoryRoot, sourcePath, 'child.md'), '# historical tree\n');
  }
  initializeGitRepository(repositoryRoot);
  if (historicalEntry === 'submodule') addSubmoduleEntry(repositoryRoot, sourcePath);
  git(repositoryRoot, ['add', '.']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Python source checkpoint']);
  const sourceCheckpoint = git(repositoryRoot, ['rev-parse', 'HEAD']);

  rmSync(path.join(repositoryRoot, sourcePath), {recursive: true, force: true});
  if (!retiredMissingSource && currentSource !== '') writeFileSync(path.join(repositoryRoot, sourcePath), currentSource);
  if (retiredMissingTarget) rmSync(path.join(repositoryRoot, targetPath));
  mkdirSync(path.join(repositoryRoot, 'content/en/guides'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'content/en/guides/overview.md'), '# Guides publication\n');
  git(repositoryRoot, ['add', '-A']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Later unrelated Guides publication']);
  const sourceManifestCommit = git(repositoryRoot, ['rev-parse', 'HEAD']);

  const sourceHash = retiredMissingSource || currentSource === '' ? EMPTY_FILE_SHA256 : sha256(currentSource);
  const targetHash = retiredMissingTarget ? EMPTY_FILE_SHA256 : sha256(targetContents);
  const retired = retiredMissingSource || retiredMissingTarget;
  mkdirSync(path.join(repositoryRoot, 'generated/en/manifests'), {recursive: true});
  mkdirSync(path.join(repositoryRoot, 'generated/zh-CN/manifests'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'generated/en/manifests/reference.json'), `${JSON.stringify({
    schemaVersion: 1,
    sourceCommit: sourceManifestCommit,
    records: retiredMissingSource || currentSource === '' ? [] : [{manual: 'python', sourcePath, sourceHash}],
  }, null, 2)}\n`);
  writeFileSync(path.join(repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json'), `${JSON.stringify({
    schemaVersion: 1,
    records: [{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: sourceCheckpoint,
      sourceHash,
      targetHash,
      status: retired ? 'retired' : 'translated',
    }],
  }, null, 2)}\n`);
  return {repositoryRoot, sourceCheckpoint, sourceManifestCommit, sourceHash, targetHash};
}

function manyRecordFixture(recordCount = 12): Readonly<{
  repositoryRoot: string;
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
}> {
  const repositoryRoot = temporaryRepository('reference-translation-batch-');
  mkdirSync(path.join(repositoryRoot, sourceRoot, 'api/python'), {recursive: true});
  mkdirSync(path.join(repositoryRoot, targetRoot, 'api/python'), {recursive: true});
  const records = Array.from({length: recordCount}, (_, index) => {
    const suffix = String(index).padStart(2, '0');
    const recordSourcePath = `${sourceRoot}/api/python/page-${suffix}.md`;
    const recordTargetPath = `${targetRoot}/api/python/page-${suffix}.md`;
    const contents = `# source ${suffix}\n`;
    const target = `# target ${suffix}\n`;
    writeFileSync(path.join(repositoryRoot, recordSourcePath), contents);
    writeFileSync(path.join(repositoryRoot, recordTargetPath), target);
    return {recordSourcePath, recordTargetPath, sourceHash: sha256(contents), targetHash: sha256(target)};
  });
  initializeGitRepository(repositoryRoot);
  git(repositoryRoot, ['add', '.']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Shared Python source checkpoint']);
  const sourceCheckpoint = git(repositoryRoot, ['rev-parse', 'HEAD']);
  mkdirSync(path.join(repositoryRoot, 'content/en/guides'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'content/en/guides/overview.md'), '# Later Guides publication\n');
  git(repositoryRoot, ['add', '.']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Advance global source manifest']);
  const sourceManifestCommit = git(repositoryRoot, ['rev-parse', 'HEAD']);
  return {
    repositoryRoot,
    sourceManifest: {
      schemaVersion: 1,
      sourceCommit: sourceManifestCommit,
      records: records.map(record => ({manual: 'python', sourcePath: record.recordSourcePath, sourceHash: record.sourceHash})),
    },
    translationManifest: {
      schemaVersion: 1,
      records: records.map(record => ({
        manual: 'python',
        sourcePath: record.recordSourcePath,
        targetPath: record.recordTargetPath,
        sourceCommit: sourceCheckpoint,
        sourceHash: record.sourceHash,
        targetHash: record.targetHash,
        status: 'translated' as const,
      })),
    },
  };
}

function writeTranslationRecord(fixture: ProvenanceFixture, overrides: Readonly<Record<string, unknown>>): void {
  writeFileSync(path.join(fixture.repositoryRoot, 'generated/zh-CN/manifests/reference-translations.json'), `${JSON.stringify({
    schemaVersion: 1,
    records: [{
      manual: 'python',
      sourcePath,
      targetPath,
      sourceCommit: fixture.sourceCheckpoint,
      sourceHash: fixture.sourceHash,
      targetHash: fixture.targetHash,
      status: 'translated',
      ...overrides,
    }],
  }, null, 2)}\n`);
}

function validateChinese(
  fixture: ProvenanceFixture,
  retired = false,
  environment?: NodeJS.ProcessEnv,
): Promise<void> {
  return executeReferenceDocsToolingCommand(['validate-reference', '--site', 'zh-CN'], {
    repositoryRoot: fixture.repositoryRoot,
    environment,
    manualForPath: () => 'python',
    retirementRegistry: {
      schemaVersion: 2,
      retirements: retired ? [{
        manual: 'python',
        sourcePath,
        targetPath,
        changeKind: null,
        rationale: 'Canonical source was retired',
      }] : [],
    },
    validateReferenceNavigation: vi.fn(),
  });
}

describe('Reference translation source checkpoint provenance', () => {
  it('collects all mismatched records before invoking one batch verifier', () => {
    const fixture = manyRecordFixture();
    const verifier = vi.fn();

    validateReferenceTranslation({
      repositoryRoot: fixture.repositoryRoot,
      sourceRoot,
      targetRoot,
      sourceManifest: fixture.sourceManifest,
      translationManifest: fixture.translationManifest,
      verifyFiles: false,
      verifySourceProvenance: verifier,
    });

    expect(verifier).toHaveBeenCalledOnce();
    expect(verifier).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({sourcePath: `${sourceRoot}/api/python/page-00.md`}),
      expect.objectContaining({sourcePath: `${sourceRoot}/api/python/page-11.md`}),
    ]));
  });

  it('uses bounded Git batches for many records sharing one checkpoint', () => {
    const fixture = manyRecordFixture();
    const commands: readonly string[][] = [];
    const verifier = createGitTranslationSourceProvenanceVerifier(
      fixture.repositoryRoot,
      sourceRoot,
      (args, options) => {
        (commands as string[][]).push([...args]);
        return spawnSync('git', args, {cwd: fixture.repositoryRoot, ...options});
      },
    );

    validateReferenceTranslation({
      repositoryRoot: fixture.repositoryRoot,
      sourceRoot,
      targetRoot,
      sourceManifest: fixture.sourceManifest,
      translationManifest: fixture.translationManifest,
      verifyFiles: false,
      verifySourceProvenance: verifier,
    });

    expect(commands.filter(args => args[0] === 'merge-base')).toHaveLength(1);
    expect(commands.filter(args => args[0] === 'ls-tree')).toHaveLength(1);
    expect(commands.filter(args => args[0] === 'cat-file' && args[1] === '--batch')).toHaveLength(1);
    expect(commands.filter(args => args[0] === 'cat-file' && args[1] === 'blob')).toHaveLength(0);
    expect(commands.length).toBeLessThan(10);
  });

  it.each([
    ['spawn error', {
      error: new Error('spawn failed'), status: null, signal: null, stdout: '', stderr: `${'x'.repeat(2_000)}TAIL`,
    }, /could not start Git.*spawn failed/i],
    ['signal', {
      status: null, signal: 'SIGTERM' as const, stdout: '', stderr: 'terminated',
    }, /terminated by signal SIGTERM/i],
  ] as const)('distinguishes a Git commit lookup %s from an unknown commit', (_label, result, expected) => {
    const fixture = manyRecordFixture(1);
    const runner: ReferenceGitRunner = () => result;
    const verifier = createGitTranslationSourceProvenanceVerifier(fixture.repositoryRoot, sourceRoot, runner);

    expect(() => validateReferenceTranslation({
      repositoryRoot: fixture.repositoryRoot,
      sourceRoot,
      targetRoot,
      sourceManifest: fixture.sourceManifest,
      translationManifest: fixture.translationManifest,
      verifyFiles: false,
      verifySourceProvenance: verifier,
    })).toThrow(expected);
    try {
      validateReferenceTranslation({
        repositoryRoot: fixture.repositoryRoot,
        sourceRoot,
        targetRoot,
        sourceManifest: fixture.sourceManifest,
        translationManifest: fixture.translationManifest,
        verifyFiles: false,
        verifySourceProvenance: verifier,
      });
    } catch (error) {
      expect(String(error)).not.toContain('TAIL');
    }
  });

  it('accepts an earlier source checkpoint when a later unrelated publication leaves the source blob unchanged', async () => {
    const fixture = provenanceFixture();

    await expect(validateChinese(fixture)).resolves.toBeUndefined();
  });

  it('rejects an unknown translation source commit', async () => {
    const fixture = provenanceFixture();
    writeTranslationRecord(fixture, {sourceCommit: 'f'.repeat(40)});

    await expect(validateChinese(fixture)).rejects.toThrow(/source commit.*unknown/i);
  });

  it('rejects a translation source commit that is not an ancestor of the source manifest commit', async () => {
    const fixture = provenanceFixture();
    const checkpointTree = git(fixture.repositoryRoot, ['rev-parse', `${fixture.sourceCheckpoint}^{tree}`]);
    const nonAncestorCommit = git(fixture.repositoryRoot, ['commit-tree', checkpointTree, '-m', 'Independent source checkpoint']);
    writeTranslationRecord(fixture, {sourceCommit: nonAncestorCommit});

    await expect(validateChinese(fixture)).rejects.toThrow(/not an ancestor/i);
  });

  it('rejects a translation checkpoint where the historical source path is missing', async () => {
    const fixture = provenanceFixture({initialSource: '', currentSource: sourceContents});

    await expect(validateChinese(fixture)).rejects.toThrow(/historical source path.*missing|regular git blob/i);
  });

  it('rejects a translation checkpoint whose historical blob hash differs from the declared source hash', async () => {
    const fixture = provenanceFixture({initialSource: '# old source\n', currentSource: sourceContents});

    await expect(validateChinese(fixture)).rejects.toThrow(/historical source hash mismatch/i);
  });

  it('keeps the current source manifest hash check authoritative', async () => {
    const fixture = provenanceFixture();
    writeTranslationRecord(fixture, {sourceHash: 'b'.repeat(64)});

    await expect(validateChinese(fixture)).rejects.toThrow(/declared source hash mismatch/i);
  });

  it('preserves a target-only retirement without requiring a nonexistent historical source blob', async () => {
    const fixture = provenanceFixture({retiredMissingSource: true});

    await expect(validateChinese(fixture, true)).resolves.toBeUndefined();
  });

  it('preserves a source-only retirement and verifies its historical source blob', async () => {
    const fixture = provenanceFixture({retiredMissingTarget: true});

    await expect(validateChinese(fixture, true)).resolves.toBeUndefined();
  });

  it('still rejects an unknown checkpoint for a target-only retirement', async () => {
    const fixture = provenanceFixture({retiredMissingSource: true});
    writeTranslationRecord(fixture, {sourceCommit: 'f'.repeat(40), status: 'retired'});

    await expect(validateChinese(fixture, true)).rejects.toThrow(/source commit.*unknown/i);
  });

  it('rejects a target-only retirement whose claimed missing source existed at its checkpoint', async () => {
    const fixture = provenanceFixture({retiredMissingSource: true, initialSource: sourceContents});

    await expect(validateChinese(fixture, true)).rejects.toThrow(/historical retired source path.*must be missing/i);
  });

  it('accepts an executable historical source blob', async () => {
    const fixture = provenanceFixture({historicalEntry: 'executable'});

    await expect(validateChinese(fixture)).resolves.toBeUndefined();
  });

  it.each(['symlink', 'tree', 'submodule'] as const)('rejects a historical %s entry as a non-regular source blob', async (historicalEntry) => {
    const fixture = provenanceFixture({historicalEntry});

    await expect(validateChinese(fixture)).rejects.toThrow(/not a regular Git blob/i);
  });

  it('accepts a mismatched checkpoint in a Git-less immutable external snapshot with complete identity', async () => {
    const fixture = provenanceFixture();
    writeExternalTrackedInputs(fixture.repositoryRoot);
    rmSync(path.join(fixture.repositoryRoot, '.git'), {recursive: true});

    await expect(validateChinese(fixture, false, {
      ZDOC_PROVENANCE_COMMIT: fixture.sourceManifestCommit,
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    })).resolves.toBeUndefined();
  });

  it('keeps exact-match validation working in a complete Git-less external snapshot', async () => {
    const fixture = provenanceFixture();
    writeTranslationRecord(fixture, {sourceCommit: fixture.sourceManifestCommit});
    writeExternalTrackedInputs(fixture.repositoryRoot);
    rmSync(path.join(fixture.repositoryRoot, '.git'), {recursive: true});

    await expect(validateChinese(fixture, false, {
      ZDOC_PROVENANCE_COMMIT: fixture.sourceManifestCommit,
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    })).resolves.toBeUndefined();
  });

  it.each([
    ['missing commit', {
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    }, /requires.*commit|complete.*identity/i],
    ['malformed commit', {
      ZDOC_PROVENANCE_COMMIT: 'not-a-sha',
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    }, /40-character lowercase Git SHA|commit.*invalid/i],
    ['missing tracked inputs', {
      ZDOC_PROVENANCE_COMMIT: 'a'.repeat(40),
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
    }, /tracked.*inputs|inventory.*required/i],
    ['wrong worktree mode', {
      ZDOC_PROVENANCE_COMMIT: 'a'.repeat(40),
      ZDOC_PROVENANCE_WORKTREE: 'clean',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    }, /worktree mode must be external-snapshot/i],
  ] as const)('rejects external snapshot identity with %s', async (_label, environment, expected) => {
    const fixture = provenanceFixture();
    writeExternalTrackedInputs(fixture.repositoryRoot);
    rmSync(path.join(fixture.repositoryRoot, '.git'), {recursive: true});

    await expect(validateChinese(fixture, false, environment)).rejects.toThrow(expected);
  });

  it('rejects external-snapshot ancestry bypass when Git metadata is present', async () => {
    const fixture = provenanceFixture();
    writeExternalTrackedInputs(fixture.repositoryRoot);

    await expect(validateChinese(fixture, false, {
      ZDOC_PROVENANCE_COMMIT: fixture.sourceManifestCommit,
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      ZDOC_PROVENANCE_TRACKED_INPUTS: externalTrackedInputs,
    })).rejects.toThrow(/external snapshot.*Git metadata|Git-backed.*cannot.*external/i);
  });
});
