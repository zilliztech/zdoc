import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {EventEmitter} from 'node:events';

import {describe, expect, it, vi} from 'vitest';

import {
  runBuildWithPublicationReadFence,
  withSitePublicationReadFence,
} from '../../../../scripts/build/run-with-publication-read-fence.mjs';
import {resolveManualPublication} from '../manuals/registry.ts';
import {atomicReplace, ownedTreeCommit} from './atomicReplace.ts';
import {publicationOwnedTargets} from './diagnostics.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'publication-build-reader-'));
}

function writeTree(root: string, relative: string, contents: string): string {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
  return target;
}

describe('official Docusaurus build publication reader', () => {
  it('holds the site read fence for the complete source-tree read window', async () => {
    const root = temporaryRoot();
    const resolved = resolveManualPublication('python', 'en');
    const ownedPaths = publicationOwnedTargets('en', resolved.publication);
    writeTree(root, `${resolved.publication.outputDir}/version.txt`, 'old\n');
    writeTree(root, resolved.publication.sidebarPath, 'old\n');
    const stagedDirectory = path.dirname(writeTree(root, `stage/${resolved.publication.outputDir}/version.txt`, 'new\n'));
    const stagedSidebar = writeTree(root, `stage/${resolved.publication.sidebarPath}`, 'new\n');
    let releaseRename!: () => void;
    const paused = new Promise<void>(resolve => { releaseRename = resolve; });
    const entered = vi.fn();
    let renameCount = 0;

    const publication = atomicReplace({
      publicationRoot: root,
      baselineCommit: ownedTreeCommit(root, ownedPaths),
      replacements: [
        {source: stagedDirectory, target: resolved.publication.outputDir},
        {source: stagedSidebar, target: resolved.publication.sidebarPath},
      ],
      removals: ownedPaths.filter(target => target !== resolved.publication.outputDir && target !== resolved.publication.sidebarPath),
      testing: {
        afterRename: async () => {
          renameCount += 1;
          if (renameCount === 1) await paused;
        },
      },
    });
    await vi.waitFor(() => expect(renameCount).toBe(1));

    const buildRead = withSitePublicationReadFence(root, 'en', () => {
      entered();
      return [
        readFileSync(path.join(root, resolved.publication.outputDir, 'version.txt'), 'utf8'),
        readFileSync(path.join(root, resolved.publication.sidebarPath), 'utf8'),
      ] as const;
    });
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(entered).not.toHaveBeenCalled();
    releaseRename();
    await publication;
    expect(await buildRead).toEqual(['new\n', 'new\n']);
  });

  it('forwards termination and holds the fence until the build child exits', async () => {
    const root = temporaryRoot();
    const signalSource = new EventEmitter();
    const child = new EventEmitter() as EventEmitter & {kill: ReturnType<typeof vi.fn>};
    child.kill = vi.fn(() => true);
    const spawnProcess = vi.fn(() => child);
    let settled = false;

    const build = runBuildWithPublicationReadFence({
      root,
      site: 'en',
      command: 'docusaurus',
      spawnProcess: spawnProcess as unknown as typeof import('node:child_process').spawn,
      signalSource: signalSource as unknown as NodeJS.Process,
    });
    void build.then(
      () => { settled = true; },
      () => { settled = true; },
    );
    await vi.waitFor(() => expect(signalSource.listenerCount('SIGTERM')).toBe(1));

    signalSource.emit('SIGTERM');
    expect(child.kill).toHaveBeenCalledOnce();
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    await Promise.resolve();
    expect(settled).toBe(false);

    child.emit('exit', null, 'SIGTERM');
    await expect(build).rejects.toThrow('Build command terminated by SIGTERM');
    expect(signalSource.listenerCount('SIGINT')).toBe(0);
    expect(signalSource.listenerCount('SIGTERM')).toBe(0);
  });

  it('removes temporary termination handlers when child startup fails', async () => {
    const root = temporaryRoot();
    const signalSource = new EventEmitter();
    const child = new EventEmitter();

    const build = runBuildWithPublicationReadFence({
      root,
      site: 'en',
      command: 'docusaurus',
      spawnProcess: (() => child) as unknown as typeof import('node:child_process').spawn,
      signalSource: signalSource as unknown as NodeJS.Process,
    });
    await vi.waitFor(() => expect(signalSource.listenerCount('SIGINT')).toBe(1));

    child.emit('error', new Error('spawn failed'));
    await expect(build).rejects.toThrow('spawn failed');
    expect(signalSource.listenerCount('SIGINT')).toBe(0);
    expect(signalSource.listenerCount('SIGTERM')).toBe(0);
  });
});
