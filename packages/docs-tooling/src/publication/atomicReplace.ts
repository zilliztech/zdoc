import {createHash, randomUUID} from 'node:crypto';
import {
  constants,
  closeSync,
  copyFileSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

export type AtomicReplacement = Readonly<{
  source: string;
  target: string;
}>;

export type AtomicReplaceOptions = Readonly<{
  publicationRoot: string;
  baselineCommit: string;
  replacements: readonly AtomicReplacement[];
  removals?: readonly string[];
  validatePublication?: (sources: readonly string[]) => void | Promise<void>;
  rename?: (from: string, to: string) => void;
}>;

type PreparedOperation = {
  source?: string;
  target: string;
  temporary?: string;
  backup?: string;
  installed: boolean;
};

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function frame(hash: ReturnType<typeof createHash>, value: string | Buffer): void {
  const bytes = typeof value === 'string' ? Buffer.from(value) : value;
  hash.update(String(bytes.length));
  hash.update(':');
  hash.update(bytes);
  hash.update(';');
}

function assertSafeRelativePath(value: string, label: string): string {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value !== value.trim()
    || value.includes('\\')
    || value.includes('\0')
    || path.posix.isAbsolute(value)
    || /^[A-Za-z]:\//u.test(value)
    || path.posix.normalize(value) !== value
    || value.split('/').some(segment => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`${label} is unsafe: ${JSON.stringify(value)}`);
  }
  return value;
}

function canonicalRoot(rootInput: string): string {
  const root = path.resolve(rootInput);
  if (!pathEntryExists(root)) throw new Error(`Publication root does not exist: ${root}`);
  const stats = lstatSync(root);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`Publication root must be a non-symlink directory: ${root}`);
  return realpathSync(root);
}

function resolveTarget(root: string, relative: string, label = 'Publication target'): string {
  assertSafeRelativePath(relative, label);
  const target = path.resolve(root, ...relative.split('/'));
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the publication root`);
  return target;
}

function assertAncestorSafety(root: string, target: string, label: string): void {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} escapes the publication root`);
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) continue;
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`${label} has a symlink ancestor: ${path.relative(root, current)}`);
    const currentReal = realpathSync(current);
    if (currentReal !== root && !currentReal.startsWith(`${root}${path.sep}`)) {
      throw new Error(`${label} escapes the publication root through an ancestor`);
    }
    if (current !== target && !stats.isDirectory()) throw new Error(`${label} has a non-directory ancestor`);
  }
}

function assertSafeTree(target: string, label: string): void {
  const stats = lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`${label} must not be a symlink`);
  if (stats.isFile()) {
    if (stats.nlink > 1) throw new Error(`${label} must not be hard-linked`);
    return;
  }
  if (!stats.isDirectory()) throw new Error(`${label} must be a regular file or directory; FIFO and device targets are forbidden`);
  for (const entry of readdirSync(target).sort((left, right) => left.localeCompare(right, 'en'))) {
    assertSafeTree(path.join(target, entry), label);
  }
}

function hashTree(hash: ReturnType<typeof createHash>, absolute: string, relative: string): void {
  const stats = lstatSync(absolute);
  if (stats.isSymbolicLink()) throw new Error(`Owned tree must not contain a symlink: ${relative}`);
  frame(hash, relative);
  frame(hash, String(stats.mode & 0o777));
  if (stats.isFile()) {
    if (stats.nlink > 1) throw new Error(`Owned tree must not contain a hard-linked file: ${relative}`);
    frame(hash, 'file');
    frame(hash, readFileSync(absolute));
    return;
  }
  if (!stats.isDirectory()) throw new Error(`Owned tree must not contain a FIFO or device: ${relative}`);
  frame(hash, 'directory');
  for (const entry of readdirSync(absolute).sort((left, right) => left.localeCompare(right, 'en'))) {
    hashTree(hash, path.join(absolute, entry), `${relative}/${entry}`);
  }
}

function normalizedOwnedPaths(paths: readonly string[]): string[] {
  const normalized = paths.map(value => assertSafeRelativePath(value, 'Owned tree path'));
  if (new Set(normalized).size !== normalized.length) throw new Error('Owned tree paths must be unique');
  const sorted = [...normalized].sort((left, right) => left.localeCompare(right, 'en'));
  for (let leftIndex = 0; leftIndex < sorted.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < sorted.length; rightIndex += 1) {
      if (sorted[rightIndex].startsWith(`${sorted[leftIndex]}/`)) {
        throw new Error(`Owned tree paths must not overlap: ${sorted[leftIndex]} and ${sorted[rightIndex]}`);
      }
    }
  }
  return sorted;
}

export function ownedTreeCommit(publicationRoot: string, ownedPaths: readonly string[]): string {
  const root = canonicalRoot(publicationRoot);
  const hash = createHash('sha256');
  frame(hash, 'zdoc-owned-tree-v1');
  for (const relative of normalizedOwnedPaths(ownedPaths)) {
    const target = resolveTarget(root, relative, 'Owned tree path');
    assertAncestorSafety(root, target, `Owned tree ${relative}`);
    frame(hash, relative);
    if (!pathEntryExists(target)) {
      frame(hash, 'missing');
      continue;
    }
    hashTree(hash, target, '.');
  }
  return `sha256:${hash.digest('hex')}`;
}

function ensureParent(root: string, target: string, createdDirectories: string[]): void {
  const parent = path.dirname(target);
  const relative = path.relative(root, parent);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) {
      mkdirSync(current, {mode: 0o755});
      createdDirectories.push(current);
    }
    const stats = lstatSync(current);
    if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`Publication target parent is unsafe: ${current}`);
  }
  assertAncestorSafety(root, target, 'Publication target');
}

function copySafeTree(source: string, destination: string): void {
  const stats = lstatSync(source);
  if (stats.isSymbolicLink()) throw new Error(`Publication source must not be a symlink: ${source}`);
  if (stats.isFile()) {
    if (stats.nlink > 1) throw new Error(`Publication source must not be hard-linked: ${source}`);
    copyFileSync(source, destination, constants.COPYFILE_EXCL);
    return;
  }
  if (!stats.isDirectory()) throw new Error(`Publication source must be a regular file or directory: ${source}`);
  mkdirSync(destination, {mode: stats.mode & 0o777});
  for (const entry of readdirSync(source).sort((left, right) => left.localeCompare(right, 'en'))) {
    copySafeTree(path.join(source, entry), path.join(destination, entry));
  }
}

function fsyncPath(target: string): void {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(target, 'r');
    fsyncSync(descriptor);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EINVAL' && code !== 'EBADF' && code !== 'EISDIR') throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function fsyncTree(target: string): void {
  const stats = lstatSync(target);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(target)) fsyncTree(path.join(target, entry));
  }
  fsyncPath(target);
}

function removeIfPresent(target: string): void {
  if (pathEntryExists(target)) rmSync(target, {recursive: true, force: true});
}

function cleanupCreatedDirectories(createdDirectories: readonly string[]): void {
  for (const directory of [...createdDirectories].reverse()) {
    if (pathEntryExists(directory) && readdirSync(directory).length === 0) rmSync(directory, {recursive: false});
  }
}

export async function atomicReplace(options: AtomicReplaceOptions): Promise<void> {
  const root = canonicalRoot(options.publicationRoot);
  const replacementTargets = options.replacements.map(replacement => replacement.target);
  const removalTargets = options.removals ?? [];
  const ownedPaths = normalizedOwnedPaths([...replacementTargets, ...removalTargets]);
  if (ownedPaths.length === 0) throw new Error('Atomic publication requires at least one owned target');
  if (typeof options.baselineCommit !== 'string' || !options.baselineCommit.startsWith('sha256:')) {
    throw new Error('Atomic publication baselineCommit must be an owned-tree sha256 commit');
  }

  const operations: PreparedOperation[] = [];
  const createdDirectories: string[] = [];
  const rename = options.rename ?? renameSync;
  for (const replacement of options.replacements) {
    const source = path.resolve(replacement.source);
    if (!pathEntryExists(source)) throw new Error(`Publication source does not exist: ${source}`);
    assertSafeTree(source, 'Publication source');
    const target = resolveTarget(root, replacement.target);
    assertAncestorSafety(root, target, `Publication target ${replacement.target}`);
    if (pathEntryExists(target)) assertSafeTree(target, `Publication target ${replacement.target}`);
    operations.push({source, target, installed: false});
  }
  for (const relative of removalTargets) {
    const target = resolveTarget(root, relative, 'Publication removal');
    assertAncestorSafety(root, target, `Publication removal ${relative}`);
    if (pathEntryExists(target)) assertSafeTree(target, `Publication removal ${relative}`);
    operations.push({target, installed: false});
  }

  const transactionKey = createHash('sha256').update(ownedPaths.join('\0')).digest('hex').slice(0, 24);
  const lockPath = path.join(root, `.atomic-publication-${transactionKey}.lock`);
  let lockDescriptor: number;
  try {
    lockDescriptor = openSync(lockPath, 'wx', 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error(`Concurrent publication lock already exists: ${lockPath}`);
    throw error;
  }
  writeFileSync(lockDescriptor, `${process.pid}\n`);
  fsyncSync(lockDescriptor);
  fsyncPath(root);

  const token = `${process.pid}-${randomUUID()}`;
  let committed = false;
  try {
    await options.validatePublication?.(Object.freeze(options.replacements.map(replacement => path.resolve(replacement.source))));

    for (const [index, replacement] of options.replacements.entries()) {
      const operation = operations[index];
      assertSafeTree(operation.source!, 'Publication source');
      ensureParent(root, operation.target, createdDirectories);
      const temporary = path.join(path.dirname(operation.target), `.${path.basename(operation.target)}.publication-tmp-${token}-${index}`);
      operation.temporary = temporary;
      copySafeTree(operation.source!, temporary);
      assertSafeTree(temporary, 'Prepared publication');
      fsyncTree(temporary);
      fsyncPath(path.dirname(temporary));
    }

    const currentCommit = ownedTreeCommit(root, ownedPaths);
    if (currentCommit !== options.baselineCommit) {
      throw new Error(`Stale publication baseline compare-and-swap: expected ${options.baselineCommit}, found ${currentCommit}`);
    }

    try {
      for (const [index, operation] of operations.entries()) {
        if (!pathEntryExists(operation.target)) continue;
        const backup = path.join(path.dirname(operation.target), `.${path.basename(operation.target)}.publication-backup-${token}-${index}`);
        operation.backup = backup;
        rename(operation.target, backup);
        fsyncPath(path.dirname(operation.target));
      }
      for (const operation of operations.slice(0, options.replacements.length)) {
        rename(operation.temporary!, operation.target);
        operation.temporary = undefined;
        operation.installed = true;
        fsyncPath(path.dirname(operation.target));
      }
      committed = true;
    } catch (error) {
      for (const operation of [...operations].reverse()) {
        if (operation.installed) {
          removeIfPresent(operation.target);
          operation.installed = false;
        }
        if (operation.backup && pathEntryExists(operation.backup)) {
          rename(operation.backup, operation.target);
          operation.backup = undefined;
          fsyncPath(path.dirname(operation.target));
        }
      }
      throw error;
    }

    for (const operation of operations) {
      if (operation.backup) {
        removeIfPresent(operation.backup);
        operation.backup = undefined;
        fsyncPath(path.dirname(operation.target));
      }
    }
  } finally {
    for (const operation of operations) {
      if (operation.temporary) removeIfPresent(operation.temporary);
      if (!committed && operation.backup && pathEntryExists(operation.backup) && !pathEntryExists(operation.target)) {
        rename(operation.backup, operation.target);
      }
    }
    if (!committed) cleanupCreatedDirectories(createdDirectories);
    closeSync(lockDescriptor);
    if (pathEntryExists(lockPath)) unlinkSync(lockPath);
    fsyncPath(root);
  }
}
