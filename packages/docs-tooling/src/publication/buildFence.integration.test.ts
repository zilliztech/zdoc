import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {withSitePublicationReadFence} from '../../../../scripts/build/run-with-publication-read-fence.mjs';
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
});
