import {spawnSync} from 'node:child_process';
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {atomicReplace, ownedTreeCommit} from './atomicReplace.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'atomic-publication-'));
}

function writeTree(root: string, relative: string, contents: string): string {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
  return target;
}

describe('atomic publication replacement', () => {
  it('leaves the prior target inode and staged diagnostics unchanged when validation fails', async () => {
    const root = temporaryRoot();
    const targetFile = writeTree(root, 'content/manual/old.md', '# old\n');
    const stage = writeTree(root, 'stage/content/manual/new.md', '# new\n');
    const diagnostics = writeTree(root, 'stage/diagnostics.json', '{"failed":true}\n');
    const inode = lstatSync(targetFile).ino;
    const baselineCommit = ownedTreeCommit(root, ['content/manual']);

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [{source: path.dirname(stage), target: 'content/manual'}],
      validatePublication: async () => {
        throw new Error('invalid publication');
      },
    })).rejects.toThrow(/invalid publication/i);

    expect(readFileSync(targetFile, 'utf8')).toBe('# old\n');
    expect(lstatSync(targetFile).ino).toBe(inode);
    expect(readFileSync(diagnostics, 'utf8')).toBe('{"failed":true}\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('publishes directories and files through same-filesystem sibling renames while retaining the stage', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/old.md', '# old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/new.md', '# new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const renameEvents: Array<readonly [string, string]> = [];
    const canonicalRoot = realpathSync(root);

    await atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual', 'generated/sidebar.js']),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      rename: (from, to) => {
        renameEvents.push([from, to]);
        renameSync(from, to);
      },
    });

    expect(readFileSync(path.join(root, 'content/manual/new.md'), 'utf8')).toBe('# new\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(stagedDirectory, 'new.md'), 'utf8')).toBe('# new\n');
    expect(readFileSync(stagedFile, 'utf8')).toBe('new\n');
    expect(renameEvents.some(([from, to]) => from.includes('.publication-tmp-') && to === path.join(canonicalRoot, 'content/manual'))).toBe(true);
    for (const [from, to] of renameEvents) {
      expect(path.dirname(from)).toBe(path.dirname(to));
      expect(statSync(path.dirname(from)).dev).toBe(statSync(path.dirname(to)).dev);
    }
  });

  it('rejects a stale owned-tree baseline without changing live files or staged diagnostics', async () => {
    const root = temporaryRoot();
    const target = writeTree(root, 'content/manual/page.md', '# original\n');
    const staged = path.dirname(writeTree(root, 'stage/content/manual/page.md', '# staged\n'));
    const diagnostics = writeTree(root, 'stage/diagnostics.json', '{"keep":true}\n');
    const baselineCommit = ownedTreeCommit(root, ['content/manual']);

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [{source: staged, target: 'content/manual'}],
      validatePublication: async () => {
        writeFileSync(target, '# concurrent edit\n');
      },
    })).rejects.toThrow(/baseline|compare-and-swap|stale/i);

    expect(readFileSync(target, 'utf8')).toBe('# concurrent edit\n');
    expect(readFileSync(diagnostics, 'utf8')).toBe('{"keep":true}\n');
  });

  it('rolls back every owned target if a commit rename fails after backups begin', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/old.md', '# old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/new.md', '# new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual', 'generated/sidebar.js']),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      rename: (from, to) => {
        if (from.includes('.publication-tmp-') && to.endsWith('sidebar.js')) throw new Error('simulated rename failure');
        renameSync(from, to);
      },
    })).rejects.toThrow(/simulated rename failure/i);

    expect(readFileSync(path.join(root, 'content/manual/old.md'), 'utf8')).toBe('# old\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('old\n');
    expect(readFileSync(path.join(stagedDirectory, 'new.md'), 'utf8')).toBe('# new\n');
    expect(readFileSync(stagedFile, 'utf8')).toBe('new\n');
  });

  it('fails closed when a concurrent publisher already owns the publication lock', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/page.md', '# old\n');
    const staged = path.dirname(writeTree(root, 'stage/content/manual/page.md', '# new\n'));
    const baselineCommit = ownedTreeCommit(root, ['content/manual']);
    let release!: () => void;
    const paused = new Promise<void>(resolve => { release = resolve; });
    const entered = vi.fn();
    const first = atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [{source: staged, target: 'content/manual'}],
      validatePublication: async () => {
        entered();
        await paused;
      },
    });
    await vi.waitFor(() => expect(entered).toHaveBeenCalledOnce());

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [{source: staged, target: 'content/manual'}],
    })).rejects.toThrow(/lock|concurrent publication/i);
    release();
    await first;
    expect(readFileSync(path.join(root, 'content/manual/page.md'), 'utf8')).toBe('# new\n');
  });

  it.each(['symlink', 'hardlink', 'fifo'] as const)('rejects unsafe %s targets before any owned tree changes', async kind => {
    const root = temporaryRoot();
    const safeTarget = writeTree(root, 'content/manual/old.md', '# old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/new.md', '# new\n'));
    mkdirSync(path.join(root, 'generated'), {recursive: true});
    const unsafeTarget = path.join(root, 'generated/sidebar.js');
    if (kind === 'symlink') symlinkSync(path.join(root, 'outside'), unsafeTarget);
    if (kind === 'hardlink') {
      const sentinel = writeTree(root, 'outside/sidebar.js', 'old\n');
      linkSync(sentinel, unsafeTarget);
    }
    if (kind === 'fifo') {
      const result = spawnSync('mkfifo', [unsafeTarget]);
      if (result.status !== 0) throw new Error(`mkfifo unavailable: ${result.stderr.toString()}`);
    }

    expect(() => ownedTreeCommit(root, ['content/manual', 'generated/sidebar.js'])).toThrow(new RegExp(kind === 'hardlink' ? 'hard.?link' : kind, 'i'));
    expect(readFileSync(safeTarget, 'utf8')).toBe('# old\n');
    expect(readFileSync(path.join(stagedDirectory, 'new.md'), 'utf8')).toBe('# new\n');
  });

  it('rejects overlapping owned paths even when another lexical path sorts between them', () => {
    const root = temporaryRoot();
    expect(() => ownedTreeCommit(root, ['content/a', 'content/a-b/manual', 'content/a/manual'])).toThrow(/overlap/i);
  });
});
