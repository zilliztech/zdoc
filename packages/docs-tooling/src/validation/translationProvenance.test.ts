import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {executeReferenceDocsToolingCommand} from '../cli.ts';
import {EMPTY_FILE_SHA256} from '../reference/translationManifest.ts';

const sourcePath = 'content/en/reference/api/python/page.md';
const targetPath = 'content/zh-CN/reference/api/python/page.md';
const sourceContents = '# source\n';
const targetContents = '# target\n';

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function git(repositoryRoot: string, args: readonly string[]): string {
  const result = spawnSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
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
}> = {}): ProvenanceFixture {
  const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'reference-translation-provenance-'));
  const retiredMissingSource = options.retiredMissingSource ?? false;
  const initialSource = options.initialSource ?? (retiredMissingSource ? '' : sourceContents);
  const currentSource = options.currentSource ?? sourceContents;
  mkdirSync(path.join(repositoryRoot, path.dirname(sourcePath)), {recursive: true});
  mkdirSync(path.join(repositoryRoot, path.dirname(targetPath)), {recursive: true});
  writeFileSync(path.join(repositoryRoot, targetPath), targetContents);
  if (initialSource !== '') writeFileSync(path.join(repositoryRoot, sourcePath), initialSource);
  git(repositoryRoot, ['init', '--quiet']);
  git(repositoryRoot, ['config', 'user.email', 'reference-test@example.invalid']);
  git(repositoryRoot, ['config', 'user.name', 'Reference Test']);
  git(repositoryRoot, ['add', '.']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Python source checkpoint']);
  const sourceCheckpoint = git(repositoryRoot, ['rev-parse', 'HEAD']);

  if (retiredMissingSource) {
    rmSync(path.join(repositoryRoot, sourcePath), {force: true});
  } else {
    if (currentSource === '') rmSync(path.join(repositoryRoot, sourcePath));
    else writeFileSync(path.join(repositoryRoot, sourcePath), currentSource);
  }
  mkdirSync(path.join(repositoryRoot, 'content/en/guides'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'content/en/guides/overview.md'), '# Guides publication\n');
  git(repositoryRoot, ['add', '-A']);
  git(repositoryRoot, ['commit', '--quiet', '-m', 'Later unrelated Guides publication']);
  const sourceManifestCommit = git(repositoryRoot, ['rev-parse', 'HEAD']);

  const sourceHash = retiredMissingSource ? EMPTY_FILE_SHA256 : sha256(currentSource);
  const targetHash = sha256(targetContents);
  mkdirSync(path.join(repositoryRoot, 'generated/en/manifests'), {recursive: true});
  mkdirSync(path.join(repositoryRoot, 'generated/zh-CN/manifests'), {recursive: true});
  writeFileSync(path.join(repositoryRoot, 'generated/en/manifests/reference.json'), `${JSON.stringify({
    schemaVersion: 1,
    sourceCommit: sourceManifestCommit,
    records: retiredMissingSource ? [] : [{manual: 'python', sourcePath, sourceHash}],
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
      status: retiredMissingSource ? 'retired' : 'translated',
    }],
  }, null, 2)}\n`);
  return {repositoryRoot, sourceCheckpoint, sourceManifestCommit, sourceHash, targetHash};
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

function validateChinese(fixture: ProvenanceFixture, retired = false): Promise<void> {
  return executeReferenceDocsToolingCommand(['validate-reference', '--site', 'zh-CN'], {
    repositoryRoot: fixture.repositoryRoot,
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

  it('still rejects an unknown checkpoint for a target-only retirement', async () => {
    const fixture = provenanceFixture({retiredMissingSource: true});
    writeTranslationRecord(fixture, {sourceCommit: 'f'.repeat(40), status: 'retired'});

    await expect(validateChinese(fixture, true)).rejects.toThrow(/source commit.*unknown/i);
  });

  it('rejects a target-only retirement whose claimed missing source existed at its checkpoint', async () => {
    const fixture = provenanceFixture({retiredMissingSource: true, initialSource: sourceContents});

    await expect(validateChinese(fixture, true)).rejects.toThrow(/historical retired source path.*must be missing/i);
  });
});
