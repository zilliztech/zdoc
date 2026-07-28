import {createRequire} from 'node:module';
import {lstatSync, readdirSync, renameSync, rmdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

import {removeSecureFile, securePathExists} from './stageControl.ts';

const require = createRequire(import.meta.url);

export type ZhCnGuidesToolsIsolationOptions = Readonly<{
  canonicalToolsRoot: string;
  stagedOutputRoot: string;
  stagedSidebarPath: string;
}>;

export type ZhCnGuidesToolsIsolationResult = Readonly<{
  removedFiles: readonly string[];
  removedSidebarIds: readonly string[];
}>;

type SidebarItem = {
  type?: string;
  id?: string;
  link?: {type?: string; id?: string};
  items?: SidebarItem[];
  [key: string]: unknown;
};

function compareText(left: string, right: string): number {
  return Buffer.from(left).compare(Buffer.from(right));
}

function markdownFiles(root: string, current = root, files: string[] = []): string[] {
  const stat = lstatSync(current);
  if (stat.isSymbolicLink()) throw new Error(`Canonical English Tools must not contain symlinks: ${current}`);
  if (stat.isDirectory()) {
    for (const child of readdirSync(current).sort(compareText)) markdownFiles(root, path.join(current, child), files);
  } else if (stat.isFile() && /\.mdx?$/u.test(current)) {
    files.push(path.relative(root, current).split(path.sep).join('/'));
  }
  return files;
}

function removeEmptyParents(start: string, root: string): void {
  let current = path.dirname(start);
  const boundary = path.resolve(root);
  while (current !== boundary) {
    try {
      rmdirSync(current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOTEMPTY') return;
      throw error;
    }
    current = path.dirname(current);
  }
}

function filterSidebar(
  items: readonly SidebarItem[],
  shadowIds: ReadonlySet<string>,
  removed: Set<string>,
): {items: SidebarItem[]; removedShadowedDescendant: boolean} {
  const filtered: SidebarItem[] = [];
  let removedShadowedDescendant = false;
  for (const item of items) {
    if (item.type === 'doc' && item.id && shadowIds.has(item.id)) {
      removed.add(item.id);
      removedShadowedDescendant = true;
      continue;
    }
    const next: SidebarItem = {...item};
    let itemLostShadowedDescendant = false;
    if (next.link?.type === 'doc' && next.link.id && shadowIds.has(next.link.id)) {
      removed.add(next.link.id);
      delete next.link;
      itemLostShadowedDescendant = true;
      removedShadowedDescendant = true;
    }
    if (Array.isArray(next.items)) {
      const nested = filterSidebar(next.items, shadowIds, removed);
      next.items = nested.items;
      itemLostShadowedDescendant ||= nested.removedShadowedDescendant;
      removedShadowedDescendant ||= nested.removedShadowedDescendant;
    }
    if (next.type === 'category' && itemLostShadowedDescendant && !next.link && (!next.items || next.items.length === 0)) continue;
    filtered.push(next);
  }
  return {items: filtered, removedShadowedDescendant};
}

export function isolateZhCnGuidesSourceTools(
  options: ZhCnGuidesToolsIsolationOptions,
): ZhCnGuidesToolsIsolationResult {
  const relativeFiles = markdownFiles(options.canonicalToolsRoot).sort(compareText);
  const removedFiles: string[] = [];
  for (const relativeFile of relativeFiles) {
    const label = `Chinese Guides Tools shadow ${relativeFile}`;
    if (!securePathExists(options.stagedOutputRoot, relativeFile, label)) continue;
    removeSecureFile(options.stagedOutputRoot, relativeFile, label);
    const shadow = path.join(options.stagedOutputRoot, ...relativeFile.split('/'));
    removeEmptyParents(shadow, options.stagedOutputRoot);
    removedFiles.push(relativeFile);
  }

  const shadowIds = new Set(relativeFiles.map(relativeFile => (
    `tutorials/${relativeFile.replace(/\.mdx?$/u, '')}`
  )));
  const resolvedSidebar = require.resolve(options.stagedSidebarPath);
  delete require.cache[resolvedSidebar];
  const sidebar = require(resolvedSidebar) as unknown;
  if (!Array.isArray(sidebar)) throw new Error('Chinese Guides source sidebar must export an array');
  const removedSidebarIds = new Set<string>();
  const filteredSidebar = filterSidebar(sidebar as SidebarItem[], shadowIds, removedSidebarIds).items;
  const temporary = `${options.stagedSidebarPath}.${process.pid}.tmp`;
  writeFileSync(temporary, `'use strict';\n\nmodule.exports = ${JSON.stringify(filteredSidebar, null, 2)};\n`, {flag: 'wx'});
  renameSync(temporary, options.stagedSidebarPath);
  delete require.cache[resolvedSidebar];

  return {
    removedFiles: removedFiles.sort(compareText),
    removedSidebarIds: [...removedSidebarIds].sort(compareText),
  };
}
