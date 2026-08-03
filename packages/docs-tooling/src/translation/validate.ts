import {createRequire} from 'node:module';
import {existsSync, lstatSync, readdirSync} from 'node:fs';
import path from 'node:path';

import {assertSafeRepositoryPathChain} from '../reference/translationManifest.ts';
import {resolvePublicationGroup, resolvePublicationGroupWorkflow} from '../workflows/groups.ts';
import {buildTranslationCandidates} from './candidates.ts';
import {resolveTranslationTarget} from './targets.ts';
import type {TranslationTargetId} from './schema.ts';

const REFERENCE_LANDING_SOURCE_PATHS = Object.freeze([
  'content/en/reference/api/python/python/python.md',
  'content/en/reference/api/java/java/java.md',
  'content/en/reference/api/nodejs/nodejs/nodejs.md',
  'content/en/reference/api/go/go/go.md',
  'content/en/reference/cli/cli/Overview.md',
]);

function ownedTranslationSourcePaths(targetId: TranslationTargetId, group: string): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  return resolvePublicationGroup('en', group).ownedPaths.filter(candidate => candidate.startsWith('content/en/'));
}

function preservedTranslationSourcePaths(group: string): readonly string[] {
  if (group === 'reference-landings') return REFERENCE_LANDING_SOURCE_PATHS;
  return resolvePublicationGroupWorkflow('en', group).preservedPaths.filter(candidate => candidate.startsWith('content/en/'));
}

function loadSidebarModule(repositoryRoot: string, relativePath: string, label: string): unknown {
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, label);
  if (!existsSync(absolutePath) || !lstatSync(absolutePath).isFile()) {
    throw new Error(`${label} must be a regular file: ${relativePath}`);
  }
  const require = createRequire(import.meta.url);
  const resolved = require.resolve(absolutePath);
  delete require.cache[resolved];
  const loaded = require(resolved) as {default?: unknown} | unknown;
  return loaded && typeof loaded === 'object' && 'default' in loaded ? loaded.default : loaded;
}

function findSidebarNode(value: unknown, key: string): unknown {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findSidebarNode(child, key);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  const node = value as {key?: unknown; items?: unknown};
  if (node.key === key) return value;
  return findSidebarNode(node.items, key);
}

function sidebarDocIds(value: unknown, ids = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const child of value) sidebarDocIds(child, ids);
    return ids;
  }
  if (!value || typeof value !== 'object') return ids;
  const node = value as {type?: unknown; id?: unknown; link?: unknown; items?: unknown};
  if (node.type === 'doc' && typeof node.id === 'string') ids.add(node.id);
  if (node.type === 'category' && node.link && typeof node.link === 'object') {
    const link = node.link as {type?: unknown; id?: unknown};
    if (link.type === 'doc' && typeof link.id === 'string') ids.add(link.id);
  }
  sidebarDocIds(node.items, ids);
  return ids;
}

function targetDocIds(repositoryRoot: string, relativeRoot: string): Set<string> {
  const absoluteRoot = assertSafeRepositoryPathChain(repositoryRoot, relativeRoot, 'Chinese Tools target root');
  if (!existsSync(absoluteRoot)) return new Set();
  if (!lstatSync(absoluteRoot).isDirectory()) throw new Error('Chinese Tools target root must be a directory');
  const ids = new Set<string>();
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Chinese Tools target must not contain symlinks: ${absolutePath}`);
      if (entry.isDirectory()) visit(absolutePath);
      else if (entry.isFile() && /\.mdx?$/u.test(entry.name)) {
        ids.add(path.relative(path.join(repositoryRoot, 'content/zh-CN/guides'), absolutePath)
          .split(path.sep).join('/').replace(/\.mdx?$/u, ''));
      }
    }
  };
  visit(absoluteRoot);
  return ids;
}

export function validateTranslationCoverage(options: Readonly<{
  repositoryRoot: string;
  targetId: TranslationTargetId;
  group: string;
}>): void {
  if (!options.group) throw new Error('Translation coverage group is required');
  resolveTranslationTarget(options.targetId);
  const ownership = ownedTranslationSourcePaths(options.targetId, options.group);
  const {candidates} = buildTranslationCandidates({
    repositoryRoot: options.repositoryRoot,
    targetId: options.targetId,
    group: options.group,
    ownedSourcePaths: ownership,
    preservedSourcePaths: preservedTranslationSourcePaths(options.group),
    changedSourcePaths: [],
    mode: 'incremental',
  });
  if (candidates.length > 0) {
    const reasonCounts = new Map<string, number>();
    for (const candidate of candidates) {
      reasonCounts.set(candidate.reason, (reasonCounts.get(candidate.reason) ?? 0) + 1);
    }
    const reasons = [...reasonCounts].map(([reason, count]) => `${reason}=${count}`).join(', ');
    throw new Error(
      `Translation coverage incomplete for ${options.targetId}/${options.group}: ` +
      `${candidates.length} candidate(s) (${reasons}); first=${candidates[0].sourcePath}`,
    );
  }
}

export function validateToolsSidebar(repositoryRoot: string): void {
  const targetRoot = 'content/zh-CN/guides/tutorials/tools';
  const sidebarPath = 'generated/zh-CN/sidebars/tools.sidebar.js';
  const translatedFragment = loadSidebarModule(repositoryRoot, sidebarPath, 'Chinese Tools sidebar');

  const sidebarIds = sidebarDocIds(translatedFragment);
  const targetIds = targetDocIds(repositoryRoot, targetRoot);
  const missingFromSidebar = [...targetIds].filter(id => !sidebarIds.has(id)).sort();
  const missingTarget = [...sidebarIds].filter(id => !targetIds.has(id)).sort();
  if (missingFromSidebar.length > 0 || missingTarget.length > 0) {
    throw new Error(
      `Chinese Tools sidebar reachability mismatch: ` +
      `unreachable=${missingFromSidebar.join(',') || 'none'} missing=${missingTarget.join(',') || 'none'}`,
    );
  }
}
