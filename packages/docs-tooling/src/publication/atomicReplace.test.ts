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
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import * as atomicPublication from './atomicReplace.ts';

const {atomicReplace, ownedTreeCommit} = atomicPublication;

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
  it('fences a real multi-target reader across the complete publication window', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    let releaseRename!: () => void;
    const renamePaused = new Promise<void>(resolve => { releaseRename = resolve; });
    let enteredRename!: () => void;
    const renameEntered = new Promise<void>(resolve => { enteredRename = resolve; });
    let renameCount = 0;

    const publication = atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ownedPaths),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      testing: {
        afterRename: async () => {
          renameCount += 1;
          if (renameCount === 1) {
            enteredRename();
            await renamePaused;
          }
        },
      },
    } as never);
    await vi.waitFor(() => expect(renameCount).toBe(1), {timeout: 250});
    await renameEntered;

    let readerEntered = false;
    const read = (atomicPublication as unknown as {
      withAtomicPublicationRead<T>(root: string, paths: readonly string[], reader: (canonicalRoot: string) => Promise<T> | T): Promise<T>;
    }).withAtomicPublicationRead(root, ownedPaths, canonicalRoot => {
      readerEntered = true;
      return [
        readFileSync(path.join(canonicalRoot, 'content/manual/version.txt'), 'utf8'),
        readFileSync(path.join(canonicalRoot, 'generated/sidebar.js'), 'utf8'),
      ] as const;
    });

    await new Promise(resolve => setTimeout(resolve, 25));
    expect(readerEntered).toBe(false);
    releaseRename();
    await publication;
    expect(await read).toEqual(['new\n', 'new\n']);
  });

  it.each([1, 2, 3, 4])('recovers a SIGKILL after commit rename %s before starting the next publication', async crashAfterRename => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    const baselineCommit = ownedTreeCommit(root, ownedPaths);
    const worker = path.join(import.meta.dirname, 'atomicReplace.crash-worker.ts');
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types',
      worker,
      root,
      stagedDirectory,
      stagedFile,
      baselineCommit,
      String(crashAfterRename),
    ], {encoding: 'utf8'});

    expect(result.signal).toBe('SIGKILL');
    await atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
    });

    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('new\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('completes cleanup after a SIGKILL following the durable committed marker', () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    const baselineCommit = ownedTreeCommit(root, ownedPaths);
    const worker = path.join(import.meta.dirname, 'atomicReplace.crash-worker.ts');
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, stagedDirectory, stagedFile, baselineCommit, 'committed',
    ], {encoding: 'utf8'});

    expect(result.signal).toBe('SIGKILL');
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('new\n');
    expect(ownedTreeCommit(root, ownedPaths)).toMatch(/^sha256:/);
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('cleans up when the first durable journal callback throws', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        afterJournal: event => {
          if (event.phase === 'preparing') throw new Error('simulated journal callback failure');
        },
      },
    })).rejects.toThrow(/simulated journal callback failure/i);

    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('recovers a journal renamed into place when the journal directory fsync fails', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    let failed = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        beforeControlFsync: event => {
          if (!failed && event.kind === 'journal-root') {
            failed = true;
            throw new Error('simulated journal fsync failure');
          }
        },
      },
    })).rejects.toThrow(/simulated journal fsync failure/i);

    expect(failed).toBe(true);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('recovers a valid transaction journal even when its writer lock is missing', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    const baselineCommit = ownedTreeCommit(root, ownedPaths);
    const worker = path.join(import.meta.dirname, 'atomicReplace.crash-worker.ts');
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, stagedDirectory, stagedFile, baselineCommit, 'preparing',
    ], {encoding: 'utf8'});

    expect(result.signal).toBe('SIGKILL');
    const writerLock = readdirSync(root).find(name => name.endsWith('.lock'));
    expect(writerLock).toBeTruthy();
    unlinkSync(path.join(root, writerLock!));

    await atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
    });

    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('new\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('validates the snapshot through an independent reader lock without reentering the live writer', () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const baselineCommit = ownedTreeCommit(root, ['content/manual']);
    const worker = path.join(import.meta.dirname, 'atomicReplace.reentrant-worker.ts');
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, stagedDirectory, baselineCommit,
    ], {encoding: 'utf8', timeout: 1_000});

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('new\n');
    expect(readdirSync(root).filter(name => name.includes('atomic-publication'))).toEqual([]);
  });

  it('validates the immutable transaction snapshot instead of a mutable staged source', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedFile = writeTree(root, 'stage/content/manual/version.txt', 'validated\n');
    const stagedDirectory = path.dirname(stagedFile);
    let journalCount = 0;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      validatePublication: async snapshot => {
        if (readFileSync(path.join(snapshot.publicationRoot, snapshot.ownedPaths[0], 'version.txt'), 'utf8') !== 'validated\n') {
          throw new Error('snapshot validation rejected attacker content');
        }
      },
      testing: {
        afterJournal: event => {
          if (event.phase !== 'preparing' || journalCount++ > 0) return;
          writeFileSync(stagedFile, 'attacker\n');
        },
      },
    })).rejects.toThrow(/snapshot validation rejected attacker content/i);

    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
  });

  it('revalidates each snapshot content version after validation and immediately before install', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'validated\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'validated\n');
    let corrupted = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual', 'generated/sidebar.js']),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      validatePublication: async snapshot => {
        expect(readFileSync(path.join(snapshot.publicationRoot, 'generated/sidebar.js'), 'utf8')).toBe('validated\n');
      },
      testing: {
        afterRename: event => {
          if (corrupted || !event.from?.includes('.atomic-publication-state') || !event.to?.endsWith('/content/manual')) return;
          const transactionRoot = event.from.slice(0, event.from.indexOf('/publication/') + '/publication'.length);
          writeFileSync(path.join(transactionRoot, 'generated/sidebar.js'), 'attacker\n');
          corrupted = true;
        },
      },
    })).rejects.toThrow(/snapshot|prepared|content|version|changed/i);

    expect(corrupted).toBe(true);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('old\n');
  });

  it('preserves an in-place concurrent edit made after CAS and before the backup rename', async () => {
    const root = temporaryRoot();
    const liveFile = writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    let edited = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        afterJournal: event => {
          if (edited || event.phase !== 'backup') return;
          writeFileSync(liveFile, 'concurrent\n');
          edited = true;
        },
      },
    })).rejects.toThrow(/concurrent|content|version|baseline|changed/i);

    expect(edited).toBe(true);
    expect(readFileSync(liveFile, 'utf8')).toBe('concurrent\n');
  });

  it('preserves a concurrently created target that appears after CAS and before install', async () => {
    const root = temporaryRoot();
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    let created = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        afterJournal: event => {
          if (created || event.phase !== 'install') return;
          writeTree(root, 'content/manual/version.txt', 'concurrent\n');
          created = true;
        },
      },
    })).rejects.toThrow(/concurrent|destination|target|appeared|changed/i);

    expect(created).toBe(true);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('concurrent\n');
  });

  it('does not recursively delete a replacement transaction state inode during cleanup', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const attackerState = path.dirname(writeTree(root, 'attacker-state/sentinel.txt', 'keep\n'));
    let swappedState = '';

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        afterJournal: event => {
          if (event.phase !== 'committed' || swappedState) return;
          const stateRoot = path.join(root, '.atomic-publication-state');
          const transactionKey = readdirSync(stateRoot)[0];
          swappedState = path.join(stateRoot, transactionKey, event.transactionId);
          renameSync(swappedState, `${swappedState}-original`);
          renameSync(attackerState, swappedState);
        },
      },
    })).rejects.toThrow(/state|identity|transaction|cleanup|recovery/i);

    expect(swappedState).not.toBe('');
    expect(readFileSync(path.join(swappedState, 'sentinel.txt'), 'utf8')).toBe('keep\n');
    expect(readdirSync(root).some(name => name.endsWith('.journal.json'))).toBe(true);
  });

  it('rejects a cross-device snapshot layout before mutating any live target', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        pathDevice: (target, actualDevice) => target.includes('.atomic-publication-state') ? actualDevice + 1 : actualDevice,
      },
    })).rejects.toThrow(/same filesystem|cross-device|device|EXDEV/i);

    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
    expect(readdirSync(root).filter(name => name.includes('publication-backup'))).toEqual([]);
  });

  it('does not delete a non-transaction inode swapped into an installed target before crash recovery', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    const baselineCommit = ownedTreeCommit(root, ownedPaths);
    const worker = path.join(import.meta.dirname, 'atomicReplace.crash-worker.ts');
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', worker, root, stagedDirectory, stagedFile, baselineCommit, '3',
    ], {encoding: 'utf8'});
    expect(result.signal).toBe('SIGKILL');

    rmSync(path.join(root, 'content/manual'), {recursive: true});
    writeTree(root, 'content/manual/version.txt', 'attacker\n');
    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
    })).rejects.toThrow(/identity|transaction|recovery|changed/i);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('attacker\n');
  });

  it('revalidates the complete target ancestor chain after an adversarial swap and before rename', async () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(outside, 'sentinel.txt', 'outside\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const baselineCommit = ownedTreeCommit(root, ['content/manual']);
    let swapped = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit,
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        beforeFilesystemOperation: (event: {kind: string; from?: string; to?: string}) => {
          if (swapped || event.kind !== 'rename' || event.from !== path.join(realpathSync(root), 'content/manual')) return;
          renameSync(path.join(root, 'content'), path.join(root, 'content-original'));
          symlinkSync(outside, path.join(root, 'content'));
          swapped = true;
        },
      },
    } as never)).rejects.toThrow(/ancestor|identity|symlink|changed|unsafe/i);

    expect(swapped).toBe(true);
    expect(readFileSync(path.join(outside, 'sentinel.txt'), 'utf8')).toBe('outside\n');
    expect(existsSync(path.join(outside, 'manual'))).toBe(false);
    expect(readFileSync(path.join(root, 'content-original/manual/version.txt'), 'utf8')).toBe('old\n');
  });

  it('rejects a staged source inode swap before copying the immutable transaction snapshot', async () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    writeTree(outside, 'version.txt', 'outside\n');
    let swapped = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        beforeFilesystemOperation: event => {
          if (swapped || event.kind !== 'copy' || event.from !== realpathSync(stagedDirectory)) return;
          renameSync(stagedDirectory, `${stagedDirectory}-original`);
          symlinkSync(outside, stagedDirectory);
          swapped = true;
        },
      },
    })).rejects.toThrow(/source.*identity|symlink|changed|unsafe/i);

    expect(swapped).toBe(true);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
    expect(readFileSync(path.join(outside, 'version.txt'), 'utf8')).toBe('outside\n');
  });

  it('never follows or removes an attacker-swapped transaction temporary during rollback cleanup', async () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const sentinel = writeTree(outside, 'sentinel.txt', 'outside\n');
    let swapped = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        beforeFilesystemOperation: event => {
          if (swapped || event.kind !== 'rename' || !event.from?.includes('.atomic-publication-state')) return;
          rmSync(event.from, {recursive: true});
          symlinkSync(outside, event.from);
          swapped = true;
        },
      },
    })).rejects.toThrow(/source.*identity|symlink|changed|unsafe/i);

    expect(swapped).toBe(true);
    expect(readFileSync(sentinel, 'utf8')).toBe('outside\n');
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
  });

  it('does not write outside the repository when a recursive snapshot destination ancestor is swapped', async () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    const stagedDirectory = path.dirname(path.dirname(writeTree(root, 'stage/content/manual/nested/page.md', 'new\n')));
    let swapped = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual']),
      replacements: [{source: stagedDirectory, target: 'content/manual'}],
      testing: {
        beforeFilesystemOperation: event => {
          if (swapped || event.kind !== 'copy' || !event.from?.endsWith('/nested')) return;
          const snapshotRoot = path.dirname(event.to!);
          renameSync(snapshotRoot, `${snapshotRoot}-original`);
          symlinkSync(outside, snapshotRoot);
          swapped = true;
        },
      },
    })).rejects.toThrow(/destination|ancestor|identity|symlink|changed|unsafe/i);

    expect(swapped).toBe(true);
    expect(existsSync(path.join(outside, 'nested'))).toBe(false);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('old\n');
  });

  it('revalidates every installed replacement inode before writing the committed marker', async () => {
    const root = temporaryRoot();
    writeTree(root, 'content/manual/version.txt', 'old\n');
    writeTree(root, 'generated/sidebar.js', 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, 'stage/content/manual/version.txt', 'new\n'));
    const stagedFile = writeTree(root, 'stage/generated/sidebar.js', 'new\n');
    const ownedPaths = ['content/manual', 'generated/sidebar.js'] as const;
    let replaced = false;

    await expect(atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ownedPaths),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      testing: {
        afterRename: event => {
          if (replaced || !event.from?.includes('.atomic-publication-state') || !event.to?.endsWith('/content/manual')) return;
          rmSync(event.to, {recursive: true});
          writeTree(root, 'content/manual/version.txt', 'attacker\n');
          replaced = true;
        },
      },
    })).rejects.toThrow(/installed|identity|transaction|committed|changed/i);

    expect(replaced).toBe(true);
    expect(readFileSync(path.join(root, 'content/manual/version.txt'), 'utf8')).toBe('attacker\n');
    expect(readdirSync(root).some(name => name.endsWith('.journal.json'))).toBe(true);
  });

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
    const renameEvents: Array<readonly [string, string, number, number]> = [];
    const canonicalRoot = realpathSync(root);

    await atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ['content/manual', 'generated/sidebar.js']),
      replacements: [
        {source: stagedDirectory, target: 'content/manual'},
        {source: stagedFile, target: 'generated/sidebar.js'},
      ],
      testing: {
        afterRename: event => {
          renameEvents.push([
            event.from!,
            event.to!,
            statSync(path.dirname(event.from!)).dev,
            statSync(path.dirname(event.to!)).dev,
          ]);
        },
      },
    });

    expect(readFileSync(path.join(root, 'content/manual/new.md'), 'utf8')).toBe('# new\n');
    expect(readFileSync(path.join(root, 'generated/sidebar.js'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(stagedDirectory, 'new.md'), 'utf8')).toBe('# new\n');
    expect(readFileSync(stagedFile, 'utf8')).toBe('new\n');
    expect(renameEvents.some(([from, to]) => from.includes('.atomic-publication-state') && to === path.join(canonicalRoot, 'content/manual'))).toBe(true);
    for (const [, , sourceDevice, destinationDevice] of renameEvents) {
      expect(sourceDevice).toBe(destinationDevice);
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
      testing: {
        beforeFilesystemOperation: event => {
          if (event.from?.includes('.atomic-publication-state') && event.to?.endsWith('sidebar.js')) throw new Error('simulated rename failure');
        },
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
      testing: {
        afterJournal: async event => {
          if (event.phase !== 'preparing') return;
          entered();
          await paused;
        },
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
