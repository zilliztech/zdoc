import {createHash, randomUUID} from 'node:crypto';
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './ownership.ts';

export type AtomicRepositoryFile = Readonly<{path: string; contents: string | Buffer}>;

export type AtomicFileRenameEvent = Readonly<{kind: 'backup' | 'install'; operationIndex: number}>;
export type AtomicFileJournalEvent = Readonly<{
  phase: 'prepared' | 'backup' | 'install' | 'committed';
  operationIndex: number | null;
}>;
export type AtomicRepositoryFileTesting = Readonly<{
  afterRename?: (event: AtomicFileRenameEvent) => void;
  afterJournal?: (event: AtomicFileJournalEvent) => void;
}>;

type ResolvedFile = AtomicRepositoryFile & Readonly<{finalPath: string}>;
type ResolvedTarget = Readonly<{path: string; finalPath: string}>;
type PathIdentity = Readonly<{dev: number; ino: number; mode: number; nlink: number; kind: 'file'}>;
type JournalPhase = AtomicFileJournalEvent['phase'];
type JournalOperation = Readonly<{
  path: string;
  temporaryPath: string;
  backupPath: string;
  hadTarget: boolean;
  originalIdentity?: PathIdentity;
  stagedIdentity: PathIdentity;
  backupIdentity?: PathIdentity;
  installedIdentity: PathIdentity;
}>;
type JournalPayload = Readonly<{
  schemaVersion: 1;
  transactionId: string;
  phase: JournalPhase;
  operationIndex: number | null;
  operations: readonly JournalOperation[];
}>;
type TransactionJournal = JournalPayload & Readonly<{checksum: string}>;

const CONTROL_DIRECTORY = '.docs-tooling-transactions';
const JOURNAL_PREFIX = 'atomic-files-';
const CONTROL_FILE_LIMIT = 1024 * 1024;

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

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function pathIdentity(target: string, label: string): PathIdentity {
  const stats = lstatSync(target);
  if (stats.isSymbolicLink() || !stats.isFile()) throw new Error(`${label} must remain a regular non-symlink file`);
  return {dev: stats.dev, ino: stats.ino, mode: stats.mode, nlink: stats.nlink, kind: 'file'};
}

function sameIdentity(left: PathIdentity, right: PathIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode
    && left.nlink === right.nlink && left.kind === right.kind;
}

function assertIdentity(target: string, expected: PathIdentity, label: string): void {
  if (!sameIdentity(pathIdentity(target, label), expected)) throw new Error(`${label} identity changed unexpectedly`);
}

function fsyncDirectory(directory: string): void {
  const descriptor = openSync(directory, constants.O_RDONLY);
  try { fsyncSync(descriptor); } finally { closeSync(descriptor); }
}

function ensureControlDirectory(root: string): string {
  const controlDirectory = path.join(root, CONTROL_DIRECTORY);
  if (pathEntryExists(controlDirectory)) {
    const stats = lstatSync(controlDirectory);
    if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error('Atomic report control directory must be a non-symlink directory');
  } else {
    mkdirSync(controlDirectory, {mode: 0o700});
    fsyncDirectory(root);
  }
  return controlDirectory;
}

function repositoryRelative(root: string, target: string): string {
  return path.relative(root, target).split(path.sep).join('/');
}

function resolveJournalPath(root: string, relativePath: string, label: string): string {
  assertSafeRepositoryRelativePath(relativePath, label);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes the repository root`);
  return target;
}

function artifactPath(finalPath: string, transactionId: string, operationIndex: number, suffix: 'tmp' | 'bak'): string {
  return path.join(path.dirname(finalPath), `.${path.basename(finalPath)}.${transactionId}.${operationIndex}.${suffix}`);
}

function stageFile(file: ResolvedFile, temporary: string): PathIdentity {
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
  return pathIdentity(temporary, 'Staged report output');
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, item]) => item !== undefined).sort(([left], [right]) => left.localeCompare(right, 'en'));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function checksum(payload: JournalPayload): string {
  return createHash('sha256').update(canonicalJson(payload)).digest('hex');
}

function serializeJournal(payload: JournalPayload): string {
  return JSON.stringify({...payload, checksum: checksum(payload)}, null, 2);
}

function parseIdentity(value: unknown, label: string): PathIdentity {
  if (!value || typeof value !== 'object') throw new Error(`${label} identity is invalid`);
  const identity = value as Partial<PathIdentity>;
  if (![identity.dev, identity.ino, identity.mode, identity.nlink].every(item => typeof item === 'number' && Number.isSafeInteger(item))) {
    throw new Error(`${label} identity is invalid`);
  }
  if (identity.kind !== 'file') throw new Error(`${label} identity kind is invalid`);
  return identity as PathIdentity;
}

function parseJournal(contents: string): TransactionJournal {
  if (Buffer.byteLength(contents) > CONTROL_FILE_LIMIT) throw new Error('Atomic report journal is too large');
  const parsed: unknown = JSON.parse(contents);
  if (!parsed || typeof parsed !== 'object') throw new Error('Atomic report journal is invalid');
  const value = parsed as Partial<TransactionJournal>;
  if (value.schemaVersion !== 1 || typeof value.transactionId !== 'string' || !value.transactionId) throw new Error('Atomic report journal header is invalid');
  if (value.phase !== 'prepared' && value.phase !== 'backup' && value.phase !== 'install' && value.phase !== 'committed') throw new Error('Atomic report journal phase is invalid');
  if (value.operationIndex !== null && (!Number.isInteger(value.operationIndex) || Number(value.operationIndex) < 0)) throw new Error('Atomic report journal operation index is invalid');
  if (!Array.isArray(value.operations)) throw new Error('Atomic report journal operations are invalid');
  const operations = value.operations.map((operation, index): JournalOperation => {
    if (!operation || typeof operation !== 'object') throw new Error(`Atomic report journal operation ${index} is invalid`);
    const item = operation as Partial<JournalOperation>;
    if (typeof item.path !== 'string' || typeof item.temporaryPath !== 'string' || typeof item.backupPath !== 'string' || typeof item.hadTarget !== 'boolean') {
      throw new Error(`Atomic report journal operation ${index} is invalid`);
    }
    return {
      path: item.path,
      temporaryPath: item.temporaryPath,
      backupPath: item.backupPath,
      hadTarget: item.hadTarget,
      ...(item.originalIdentity ? {originalIdentity: parseIdentity(item.originalIdentity, `Original ${index}`)} : {}),
      stagedIdentity: parseIdentity(item.stagedIdentity, `Staged ${index}`),
      ...(item.backupIdentity ? {backupIdentity: parseIdentity(item.backupIdentity, `Backup ${index}`)} : {}),
      installedIdentity: parseIdentity(item.installedIdentity, `Installed ${index}`),
    };
  });
  const payload: JournalPayload = {
    schemaVersion: 1,
    transactionId: value.transactionId,
    phase: value.phase,
    operationIndex: value.operationIndex ?? null,
    operations,
  };
  if (typeof value.checksum !== 'string' || value.checksum !== checksum(payload)) throw new Error('Atomic report journal checksum is invalid');
  return {...payload, checksum: value.checksum};
}

function writeJournal(
  controlDirectory: string,
  journalPath: string,
  payload: JournalPayload,
  testing: AtomicRepositoryFileTesting,
): void {
  const temporary = path.join(controlDirectory, `.${path.basename(journalPath)}.${randomUUID()}.tmp`);
  const descriptor = openSync(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
  let renamed = false;
  try {
    writeFileSync(descriptor, serializeJournal(payload));
    fsyncSync(descriptor);
    closeSync(descriptor);
    renameSync(temporary, journalPath);
    renamed = true;
    fsyncDirectory(controlDirectory);
  } finally {
    if (!renamed) {
      try { closeSync(descriptor); } catch {}
      if (pathEntryExists(temporary)) unlinkSync(temporary);
    }
  }
  testing.afterJournal?.({phase: payload.phase, operationIndex: payload.operationIndex});
}

function removeVerified(target: string, identity: PathIdentity, label: string): void {
  if (!pathEntryExists(target)) return;
  assertIdentity(target, identity, label);
  unlinkSync(target);
  fsyncDirectory(path.dirname(target));
}

function recoverJournal(root: string, journalPath: string, journal: TransactionJournal): void {
  const operations = journal.operations.map(operation => ({
    ...operation,
    finalPath: resolveJournalPath(root, operation.path, 'Atomic report target'),
    stagedPath: resolveJournalPath(root, operation.temporaryPath, 'Atomic report staged path'),
    savedPath: resolveJournalPath(root, operation.backupPath, 'Atomic report backup path'),
  }));

  if (journal.phase === 'committed') {
    for (const operation of operations) {
      if (!pathEntryExists(operation.finalPath)) throw new Error(`Committed atomic report target is missing: ${operation.path}`);
      assertIdentity(operation.finalPath, operation.installedIdentity, `Committed atomic report target ${operation.path}`);
      removeVerified(operation.stagedPath, operation.stagedIdentity, `Committed staged output ${operation.path}`);
      if (operation.backupIdentity) removeVerified(operation.savedPath, operation.backupIdentity, `Committed backup ${operation.path}`);
    }
  } else {
    for (const operation of [...operations].reverse()) {
      if (pathEntryExists(operation.finalPath)) {
        const actual = pathIdentity(operation.finalPath, `Atomic report target ${operation.path}`);
        if (sameIdentity(actual, operation.installedIdentity)) {
          unlinkSync(operation.finalPath);
          fsyncDirectory(path.dirname(operation.finalPath));
        } else if (!operation.originalIdentity || !sameIdentity(actual, operation.originalIdentity)) {
          throw new Error(`Atomic report target ${operation.path} was replaced by a foreign inode`);
        }
      }
      if (operation.hadTarget) {
        if (!operation.originalIdentity || !operation.backupIdentity) throw new Error(`Atomic report backup metadata is missing: ${operation.path}`);
        if (pathEntryExists(operation.savedPath)) {
          assertIdentity(operation.savedPath, operation.backupIdentity, `Atomic report backup ${operation.path}`);
          if (pathEntryExists(operation.finalPath)) throw new Error(`Atomic report original and backup both exist: ${operation.path}`);
          renameSync(operation.savedPath, operation.finalPath);
          fsyncDirectory(path.dirname(operation.finalPath));
        } else if (!pathEntryExists(operation.finalPath)) {
          throw new Error(`Atomic report original is missing: ${operation.path}`);
        } else {
          assertIdentity(operation.finalPath, operation.originalIdentity, `Atomic report original ${operation.path}`);
        }
      } else if (pathEntryExists(operation.savedPath)) {
        throw new Error(`Unexpected atomic report backup exists: ${operation.path}`);
      }
      removeVerified(operation.stagedPath, operation.stagedIdentity, `Atomic report staged output ${operation.path}`);
    }
  }

  unlinkSync(journalPath);
  fsyncDirectory(path.dirname(journalPath));
}

function recoverPendingTransactions(root: string, selectedPaths?: ReadonlySet<string>): void {
  const controlDirectory = path.join(root, CONTROL_DIRECTORY);
  if (!pathEntryExists(controlDirectory)) return;
  const stats = lstatSync(controlDirectory);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error('Atomic report control directory must be a non-symlink directory');
  const entries = readdirSync(controlDirectory, {withFileTypes: true});
  for (const entry of entries) {
    const target = path.join(controlDirectory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Atomic report control files must not be symlinks');
    if (entry.name.startsWith(JOURNAL_PREFIX) && entry.name.endsWith('.journal.json')) {
      if (!entry.isFile()) throw new Error('Atomic report journal must be a regular file');
      const journal = parseJournal(readFileSync(target, 'utf8'));
      if (!selectedPaths || journal.operations.some(operation => selectedPaths.has(operation.path))) {
        recoverJournal(root, target, journal);
      }
    } else if (!selectedPaths && entry.name.endsWith('.tmp') && entry.isFile()) {
      unlinkSync(target);
      fsyncDirectory(controlDirectory);
    } else if (selectedPaths && entry.name.endsWith('.tmp') && entry.isFile()) {
      continue;
    } else {
      throw new Error(`Unexpected atomic report control entry: ${entry.name}`);
    }
  }
  if (readdirSync(controlDirectory).length === 0) {
    rmdirSync(controlDirectory);
    fsyncDirectory(root);
  }
}

export function recoverPendingAtomicWrites(
  repositoryRoot: string,
  relativePaths: readonly string[],
  label = 'Output',
): void {
  const root = assertRepositoryRoot(repositoryRoot, label);
  if (relativePaths.length === 0) throw new Error(`${label} recovery requires at least one target`);
  for (const relativePath of relativePaths) assertSafeRepositoryRelativePath(relativePath, label);
  recoverPendingTransactions(root, new Set(relativePaths));
}

function cleanupControlDirectory(root: string, controlDirectory: string): void {
  if (pathEntryExists(controlDirectory) && readdirSync(controlDirectory).length === 0) {
    rmdirSync(controlDirectory);
    fsyncDirectory(root);
  }
}

export function writeAtomicRepositoryFiles(
  repositoryRoot: string,
  entries: readonly AtomicRepositoryFile[],
  label = 'Output',
  testing: AtomicRepositoryFileTesting = {},
): void {
  const root = assertRepositoryRoot(repositoryRoot, label);
  recoverPendingTransactions(root);
  const targets = assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label)
    .map((target, index) => ({...entries[index], finalPath: target.finalPath}));
  ensureParents(root, targets, label);
  assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label);
  if (targets.length === 0) return;

  const transactionId = randomUUID();
  const controlDirectory = ensureControlDirectory(root);
  const journalPath = path.join(controlDirectory, `${JOURNAL_PREFIX}${transactionId}.journal.json`);
  const stagedPaths: Array<{path: string; identity: PathIdentity}> = [];
  let payload: JournalPayload | null = null;
  try {
    const operations = targets.map((file, operationIndex): JournalOperation => {
      assertSafeAtomicWriteTargets(root, entries.map(entry => entry.path), label);
      const temporary = artifactPath(file.finalPath, transactionId, operationIndex, 'tmp');
      const backup = artifactPath(file.finalPath, transactionId, operationIndex, 'bak');
      if (pathEntryExists(temporary) || pathEntryExists(backup)) throw new Error(`${label} transaction artifact already exists`);
      const stagedIdentity = stageFile(file, temporary);
      stagedPaths.push({path: temporary, identity: stagedIdentity});
      const hadTarget = pathEntryExists(file.finalPath);
      const originalIdentity = hadTarget ? pathIdentity(file.finalPath, `${label} target`) : undefined;
      return {
        path: file.path,
        temporaryPath: repositoryRelative(root, temporary),
        backupPath: repositoryRelative(root, backup),
        hadTarget,
        ...(originalIdentity ? {originalIdentity, backupIdentity: originalIdentity} : {}),
        stagedIdentity,
        installedIdentity: stagedIdentity,
      };
    });
    payload = {schemaVersion: 1, transactionId, phase: 'prepared', operationIndex: null, operations};
    writeJournal(controlDirectory, journalPath, payload, testing);

    for (const [operationIndex, operation] of operations.entries()) {
      payload = {...payload, phase: 'backup', operationIndex};
      writeJournal(controlDirectory, journalPath, payload, testing);
      if (!operation.hadTarget) continue;
      const finalPath = resolveJournalPath(root, operation.path, label);
      const backupPath = resolveJournalPath(root, operation.backupPath, label);
      assertIdentity(finalPath, operation.originalIdentity!, `${label} target`);
      renameSync(finalPath, backupPath);
      fsyncDirectory(path.dirname(finalPath));
      testing.afterRename?.({kind: 'backup', operationIndex});
    }

    for (const [operationIndex, operation] of operations.entries()) {
      payload = {...payload, phase: 'install', operationIndex};
      writeJournal(controlDirectory, journalPath, payload, testing);
      const finalPath = resolveJournalPath(root, operation.path, label);
      const temporary = resolveJournalPath(root, operation.temporaryPath, label);
      assertPathChain(root, operation.path, label);
      assertIdentity(temporary, operation.stagedIdentity, `${label} staged output`);
      renameSync(temporary, finalPath);
      fsyncDirectory(path.dirname(finalPath));
      testing.afterRename?.({kind: 'install', operationIndex});
    }

    payload = {...payload, phase: 'committed', operationIndex: null};
    writeJournal(controlDirectory, journalPath, payload, testing);
    recoverJournal(root, journalPath, {...payload, checksum: checksum(payload)});
    cleanupControlDirectory(root, controlDirectory);
  } catch (error) {
    if (pathEntryExists(journalPath)) {
      recoverJournal(root, journalPath, parseJournal(readFileSync(journalPath, 'utf8')));
    } else {
      for (const staged of stagedPaths) {
        if (pathEntryExists(staged.path)) removeVerified(staged.path, staged.identity, `${label} staged output`);
      }
    }
    cleanupControlDirectory(root, controlDirectory);
    throw error;
  }
}
