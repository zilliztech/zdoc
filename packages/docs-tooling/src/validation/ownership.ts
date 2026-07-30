import path from 'node:path';

import type {ManualPublication, SiteId} from '../manuals/schema.ts';

const WINDOWS_RESERVED_NAME = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/iu;

export function assertSafeRepositoryRelativePath(value: string, label = 'path'): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is unsafe: path is required`);
  const segments = value.split('/');
  const unsafe =
    value !== value.trim() ||
    path.posix.isAbsolute(value) ||
    /^[A-Za-z]:\//u.test(value) ||
    value.includes('\\') ||
    value.includes('\0') ||
    path.posix.normalize(value) !== value ||
    segments.some(segment => segment === '' || segment === '.' || segment === '..');
  if (unsafe) throw new Error(`${label} is unsafe and must be a normalized repository-relative path: ${JSON.stringify(value)}`);
  for (const segment of segments) {
    if (WINDOWS_RESERVED_NAME.test(segment) || /[. ]$/u.test(segment)) {
      throw new Error(`${label} contains a reserved path segment: ${JSON.stringify(segment)}`);
    }
  }
  return value;
}

function assertOwned(root: string, value: string, label: string): void {
  assertSafeRepositoryRelativePath(value, label);
  if (value !== root && !value.startsWith(`${root}/`)) {
    throw new Error(`${label} must be site-owned under ${root}: ${value}`);
  }
}

export function assertPublicationOwnership(site: SiteId, publication: ManualPublication): void {
  assertOwned(`content/${site}`, publication.outputDir, 'Publication outputDir');
  assertOwned(`content/${site}`, publication.contentRoot, 'Publication contentRoot');
  assertOwned(`generated/${site}`, publication.sidebarPath, 'Publication sidebarPath');
  if (publication.overridePath) assertOwned(`sidebar-overrides/${site}`, publication.overridePath, 'Publication overridePath');
  for (const retiredPath of publication.retiredPaths ?? []) assertSafeRepositoryRelativePath(retiredPath, 'Publication retiredPath');
}

export function resolveOwnedRepositoryPath(repositoryRoot: string, relativePath: string, label = 'path'): string {
  assertSafeRepositoryRelativePath(relativePath, label);
  const root = path.resolve(repositoryRoot);
  const target = path.resolve(root, relativePath);
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository root`);
  return target;
}
