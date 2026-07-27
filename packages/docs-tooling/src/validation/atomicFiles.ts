import {randomUUID} from 'node:crypto';
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './ownership.ts';

export type AtomicRepositoryFile = Readonly<{path: string; contents: string | Buffer}>;

type ResolvedFile = AtomicRepositoryFile & Readonly<{finalPath: string}>;
type ResolvedTarget = Readonly<{path: string; finalPath: string}>;

function assertRepositoryRoot(repositoryRoot: string, label: string): string {
  const unresolvedRoot = path.resolve(repositoryRoot);
  const stats = lstatSync(unresolvedRoot);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`${label} repository root must be a non-symlink directory`);
  return realpathSync(unresolvedRoot);
}

function collisionMessage(label: string, kind: string, left: string, right: string): Error {
  return new Error(`${label} ${kind} collision: ${left} and ${right}`);
}

function assertNoAncestorTargets(paths: readonly string[], label: string): void {
  const sorted = [...paths].sort((left, right) => left.localeCompare(right, 'en'));
  for (let index = 0; index < sorted.length; index += 1) {
    for (let next = index + 1; next < sorted.length; next += 1) {
      if (sorted[next].startsWith(`${sorted[index]}/`)) {
        throw collisionMessage(label, 'file/directory type', sorted[index], sorted[next]);
      }
    }
  }
}

function assertNoPortablePathCollisions(paths: readonly string[], label: string): void {
  const caseKeys = new Map<string, string>();
  const unicodeKeys = new Map<string, string>();
  for (const relativePath of paths) {
    const caseKey = relativePath.toLocaleLowerCase('en-US');
    const priorCase = caseKeys.get(caseKey);
    if (priorCase && priorCase !== relativePath) throw collisionMessage(label, 'case', priorCase, relativePath);
    caseKeys.set(caseKey, relativePath);
    const unicodeKey = relativePath.normalize('NFC');
    const priorUnicode = unicodeKeys.get(unicodeKey);
    if (priorUnicode && priorUnicode !== relativePath) throw collisionMessage(label, 'Unicode normalization', priorUnicode, relativePath);
    unicodeKeys.set(unicodeKey, relativePath);
  }
}

function assertPathChain(root: string, relativePath: string, label: string): void {
  const segments = relativePath.split('/');
  let current = root;
  for (const [index, segment] of segments.entries()) {
    const entries = readdirSync(current, {withFileTypes: true});
    const caseMatch = entries.find(entry => entry.name.toLocaleLowerCase('en-US') === segment.toLocaleLowerCase('en-US'));
    if (caseMatch && caseMatch.name !== segment) {
      throw collisionMessage(label, 'case', path.relative(root, path.join(current, caseMatch.name)), relativePath);
    }
    const unicodeMatch = entries.find(entry => entry.name.normalize('NFC') === segment.normalize('NFC'));
    if (unicodeMatch && unicodeMatch.name !== segment) {
      throw collisionMessage(label, 'Unicode normalization', path.relative(root, path.join(current, unicodeMatch.name)), relativePath);
    }
    const exact = entries.find(entry => entry.name === segment);
    if (!exact) return;
    current = path.join(current, segment);
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`${label} must not use symlinks: ${relativePath}`);
    const final = index === segments.length - 1;
    if (final && !stats.isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`);
    if (!final && !stats.isDirectory()) throw new Error(`${label} ancestor must be a directory: ${relativePath}`);
    const resolved = realpathSync(current);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
      throw new Error(`${label} escapes the repository root: ${relativePath}`);
    }
  }
}

export function assertSafeAtomicWriteTargets(
  repositoryRoot: string,
  relativePaths: readonly string[],
  label = 'Output',
): readonly ResolvedTarget[] {
  const root = assertRepositoryRoot(repositoryRoot, label);
  for (const relativePath of relativePaths) assertSafeRepositoryRelativePath(relativePath, label);
  if (new Set(relativePaths).size !== relativePaths.length) {
    throw new Error(`${label} exact path collision`);
  }
  assertNoPortablePathCollisions(relativePaths, label);
  assertNoAncestorTargets(relativePaths, label);
  for (const relativePath of relativePaths) assertPathChain(root, relativePath, label);
  return relativePaths.map(relativePath => ({path: relativePath, finalPath: resolveOwnedRepositoryPath(root, relativePath, label)}));
}

function ensureParents(repositoryRoot: string, files: readonly ResolvedFile[], label: string): void {
  const parents = [...new Set(files.map(file => path.posix.dirname(file.path)))]
    .filter(parent => parent !== '.')
    .sort((left, right) => left.split('/').length - right.split('/').length || left.localeCompare(right, 'en'));
  for (const parent of parents) {
    assertPathChain(repositoryRoot, `${parent}/.atomic-parent-probe`, label);
    mkdirSync(path.join(repositoryRoot, parent), {recursive: true});
    assertPathChain(repositoryRoot, `${parent}/.atomic-parent-probe`, label);
  }
}

function temporaryPath(finalPath: string, suffix: string): string {
  return path.join(path.dirname(finalPath), `.${path.basename(finalPath)}.${process.pid}.${randomUUID()}.${suffix}`);
}

function stageFile(file: ResolvedFile): string {
  const temporary = temporaryPath(file.finalPath, 'tmp');
  const noFollow = typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0;
  const descriptor = openSync(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | noFollow, 0o600);
  let complete = false;
  try {
    writeFileSync(descriptor, file.contents);
    fsyncSync(descriptor);
    complete = true;
  } finally {
    closeSync(descriptor);
    if (!complete && existsSync(temporary)) unlinkSync(temporary);
  }
  return temporary;
}

function fsyncDirectories(files: readonly ResolvedFile[]): void {
  for (const directory of new Set(files.map(file => path.dirname(file.finalPath)))) {
    const descriptor = openSync(directory, constants.O_RDONLY);
    try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
  }
}

export function writeAtomicRepositoryFiles(
  repositoryRoot: string,
  entries: readonly AtomicRepositoryFile[],
  label = 'Output',
): void {
  const root = assertRepositoryRoot(repositoryRoot, label);
  const targets = assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label)
    .map((target, index) => ({...entries[index], finalPath: target.finalPath}));
  ensureParents(root, targets, label);
  assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label);

  const staged: Array<ResolvedFile & {temporaryPath: string; backupPath?: string; installed: boolean}> = [];
  let committed = false;
  try {
    for (const file of targets) {
      assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label);
      staged.push({...file, temporaryPath: stageFile(file), installed: false});
    }
    assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label);
    for (const entry of staged) {
      if (!existsSync(entry.finalPath)) continue;
      entry.backupPath = temporaryPath(entry.finalPath, 'bak');
      renameSync(entry.finalPath, entry.backupPath);
    }
    for (const entry of staged) {
      assertPathChain(root, entry.path, label);
      renameSync(entry.temporaryPath, entry.finalPath);
      entry.installed = true;
    }
    fsyncDirectories(targets);
    committed = true;
  } finally {
    if (!committed) {
      for (const entry of [...staged].reverse()) {
        if (entry.installed && existsSync(entry.finalPath)) unlinkSync(entry.finalPath);
        if (entry.backupPath && existsSync(entry.backupPath)) renameSync(entry.backupPath, entry.finalPath);
      }
    }
    for (const entry of staged) if (existsSync(entry.temporaryPath)) unlinkSync(entry.temporaryPath);
    for (const entry of staged) if (entry.backupPath && existsSync(entry.backupPath)) unlinkSync(entry.backupPath);
  }
}
