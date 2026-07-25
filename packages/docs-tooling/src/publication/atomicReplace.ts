import {spawnSync} from 'node:child_process';
import {createHash, randomUUID} from 'node:crypto';
import {
  constants,
  closeSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

export type AtomicReplacement = Readonly<{
  source: string;
  target: string;
}>;

export type AtomicFilesystemEvent = Readonly<{
  kind: 'copy' | 'rename' | 'remove';
  transactionId: string;
  from?: string;
  to?: string;
}>;

export type AtomicJournalEvent = Readonly<{
  transactionId: string;
  phase: 'preparing' | 'backup' | 'install' | 'committed';
  operationIndex: number | null;
}>;

export type AtomicControlFsyncEvent = Readonly<{
  kind: 'journal-root';
  transactionId: string;
}>;

export type AtomicValidationSnapshot = Readonly<{
  publicationRoot: string;
  ownedPaths: readonly string[];
}>;

export type AtomicReplaceOptions = Readonly<{
  publicationRoot: string;
  baselineCommit: string;
  replacements: readonly AtomicReplacement[];
  removals?: readonly string[];
  validatePublication?: (snapshot: AtomicValidationSnapshot) => void | Promise<void>;
  testing?: Readonly<{
    beforeFilesystemOperation?: (event: AtomicFilesystemEvent) => void | Promise<void>;
    afterRename?: (event: AtomicFilesystemEvent) => void | Promise<void>;
    afterJournal?: (event: AtomicJournalEvent) => void | Promise<void>;
    beforeControlFsync?: (event: AtomicControlFsyncEvent) => void;
    pathDevice?: (target: string, actualDevice: number) => number;
  }>;
}>;

type PathIdentity = Readonly<{
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  kind: 'file' | 'directory';
}>;

type BoundPath = Readonly<{path: string; identity: PathIdentity}>;

type TransactionOperation = Readonly<{
  target: string;
  replacement: boolean;
  hadTarget: boolean;
  originalIdentity?: PathIdentity;
}>;

type JournalOperation = TransactionOperation & Readonly<{
  preparedIdentity?: PathIdentity;
  preparedVersion?: string;
  liveVersion?: string;
}>;

type WriterLock = Readonly<{
  schemaVersion: 1;
  kind: 'writer';
  transactionKey: string;
  transactionId: string;
  pid: number;
  ownerIdentity: string | null;
  createdAt: string;
  ownedPaths: readonly string[];
  operations: readonly TransactionOperation[];
  checksum: string;
}>;

type ReaderLock = Readonly<{
  schemaVersion: 1;
  kind: 'reader';
  transactionKey: string;
  token: string;
  pid: number;
  ownerIdentity: string | null;
  createdAt: string;
  checksum: string;
}>;

type JournalPhase = 'preparing' | 'backup' | 'install' | 'committed';

type TransactionJournal = Readonly<{
  schemaVersion: 1;
  kind: 'journal';
  transactionKey: string;
  transactionId: string;
  baselineCommit: string;
  phase: JournalPhase;
  operationIndex: number | null;
  stateIdentity: PathIdentity;
  operations: readonly JournalOperation[];
  checksum: string;
}>;

const LOCK_WAIT_TIMEOUT_MS = 30_000;
const LOCK_POLL_MS = 10;
const CONTROL_FILE_LIMIT = 1024 * 1024;

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function sleep(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function sleepSync(duration: number): void {
  const state = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(state, 0, 0, duration);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function checksummed<T extends Record<string, unknown>>(value: T): T & {checksum: string} {
  return {...value, checksum: sha256(value)};
}

function assertChecksum(value: Record<string, unknown>, label: string): void {
  const {checksum, ...contents} = value;
  if (typeof checksum !== 'string' || checksum !== sha256(contents)) throw new Error(`${label} checksum mismatch`);
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

function identityOf(target: string, label: string): PathIdentity {
  const stats = lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`${label} must not be a symlink`);
  if (stats.isFile()) {
    if (stats.nlink !== 1) throw new Error(`${label} must not be hard-linked`);
    return {dev: stats.dev, ino: stats.ino, mode: stats.mode, nlink: stats.nlink, kind: 'file'};
  }
  if (stats.isDirectory()) return {dev: stats.dev, ino: stats.ino, mode: stats.mode, nlink: stats.nlink, kind: 'directory'};
  throw new Error(`${label} must be a regular file or directory; FIFO and device entries are forbidden`);
}

function sameIdentity(left: PathIdentity, right: PathIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.kind === right.kind
    && (left.kind === 'directory' || left.nlink === right.nlink);
}

function isPathIdentity(value: unknown): value is PathIdentity {
  if (!value || typeof value !== 'object') return false;
  const identity = value as Record<string, unknown>;
  return typeof identity.dev === 'number' && typeof identity.ino === 'number' && typeof identity.mode === 'number'
    && typeof identity.nlink === 'number' && (identity.kind === 'file' || identity.kind === 'directory');
}

function bindExistingAncestors(root: string, target: string, label: string): readonly BoundPath[] {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} escapes the publication root`);
  const bound: BoundPath[] = [{path: root, identity: identityOf(root, `${label} root`)}];
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) break;
    const identity = identityOf(current, `${label} ancestor`);
    if (current !== target && identity.kind !== 'directory') throw new Error(`${label} has a non-directory ancestor`);
    bound.push({path: current, identity});
  }
  return Object.freeze(bound);
}

function revalidateBoundPaths(bound: readonly BoundPath[], label: string): void {
  for (const entry of bound) {
    if (!pathEntryExists(entry.path)) throw new Error(`${label} identity changed: ${entry.path} is missing`);
    const current = identityOf(entry.path, label);
    if (!sameIdentity(current, entry.identity)) throw new Error(`${label} identity changed: ${entry.path}`);
  }
}

function assertSafeTree(target: string, label: string): void {
  const identity = identityOf(target, label);
  if (identity.kind === 'file') return;
  for (const entry of readdirSync(target).sort((left, right) => left.localeCompare(right, 'en'))) {
    assertSafeTree(path.join(target, entry), label);
  }
  if (!sameIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed while traversing`);
}

function hashTree(hash: ReturnType<typeof createHash>, absolute: string, relative: string): void {
  const identity = identityOf(absolute, `Owned tree ${relative}`);
  frame(hash, relative);
  frame(hash, String(identity.mode & 0o777));
  if (identity.kind === 'file') {
    const descriptor = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const opened = fstatSync(descriptor);
      if (opened.dev !== identity.dev || opened.ino !== identity.ino || opened.nlink !== 1) throw new Error(`Owned tree identity changed while opening: ${relative}`);
      frame(hash, 'file');
      frame(hash, readFileSync(descriptor));
    } finally {
      closeSync(descriptor);
    }
    if (!sameIdentity(identityOf(absolute, `Owned tree ${relative}`), identity)) throw new Error(`Owned tree identity changed while reading: ${relative}`);
    return;
  }
  frame(hash, 'directory');
  for (const entry of readdirSync(absolute).sort((left, right) => left.localeCompare(right, 'en'))) {
    hashTree(hash, path.join(absolute, entry), `${relative}/${entry}`);
  }
  if (!sameIdentity(identityOf(absolute, `Owned tree ${relative}`), identity)) throw new Error(`Owned tree identity changed while traversing: ${relative}`);
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

function transactionKey(ownedPaths: readonly string[]): string {
  return createHash('sha256').update(normalizedOwnedPaths(ownedPaths).join('\0')).digest('hex').slice(0, 24);
}

function ownedTreeCommitUnfenced(root: string, ownedPaths: readonly string[]): string {
  const hash = createHash('sha256');
  frame(hash, 'zdoc-owned-tree-v1');
  for (const relative of normalizedOwnedPaths(ownedPaths)) {
    const target = resolveTarget(root, relative, 'Owned tree path');
    bindExistingAncestors(root, target, `Owned tree ${relative}`);
    frame(hash, relative);
    if (!pathEntryExists(target)) {
      frame(hash, 'missing');
      continue;
    }
    hashTree(hash, target, '.');
  }
  return `sha256:${hash.digest('hex')}`;
}

function ownedPathVersion(root: string, relative: string): string {
  return ownedTreeCommitUnfenced(root, [relative]);
}

function deepestExistingDirectory(root: string, target: string): string {
  let current = target;
  while (!pathEntryExists(current)) {
    const parent = path.dirname(current);
    if (parent === current || (parent !== root && !parent.startsWith(`${root}${path.sep}`))) {
      throw new Error('Publication target parent escapes the publication root');
    }
    current = parent;
  }
  if (identityOf(current, 'Publication filesystem parent').kind !== 'directory') current = path.dirname(current);
  return current;
}

function pathDevice(target: string, testing?: AtomicReplaceOptions['testing']): number {
  const actualDevice = identityOf(target, 'Publication filesystem path').dev;
  return testing?.pathDevice?.(target, actualDevice) ?? actualDevice;
}

function fsyncPath(target: string): void {
  let descriptor: number | undefined;
  try {
    descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
    fsyncSync(descriptor);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EINVAL' && code !== 'EBADF' && code !== 'EISDIR') throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function fsyncTree(target: string): void {
  const identity = identityOf(target, 'Prepared publication');
  if (identity.kind === 'directory') {
    for (const entry of readdirSync(target)) fsyncTree(path.join(target, entry));
  }
  fsyncPath(target);
}

function processIdentity(pid: number): string | null {
  const result = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], {encoding: 'utf8'});
  if (result.status !== 0) return null;
  const value = result.stdout.trim();
  return value || null;
}

function processOwnsRecord(pid: number, ownerIdentity: string | null): boolean {
  try {
    process.kill(pid, 0);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ESRCH') return false;
    if (code !== 'EPERM') throw error;
  }
  if (ownerIdentity === null) return true;
  return processIdentity(pid) === ownerIdentity;
}

function writerLockPath(root: string, key: string): string {
  return path.join(root, `.atomic-publication-${key}.lock`);
}

function journalPath(root: string, key: string): string {
  return path.join(root, `.atomic-publication-${key}.journal.json`);
}

function readerPrefix(key: string): string {
  return `.atomic-publication-${key}.reader-`;
}

function readControlFile(target: string, label: string): Record<string, unknown> {
  const before = identityOf(target, label);
  if (before.kind !== 'file') throw new Error(`${label} must be a regular file`);
  const stats = lstatSync(target);
  if (stats.size > CONTROL_FILE_LIMIT) throw new Error(`${label} exceeds the size limit`);
  const descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (opened.dev !== before.dev || opened.ino !== before.ino || opened.nlink !== 1) throw new Error(`${label} identity changed while opening`);
    const parsed = JSON.parse(readFileSync(descriptor, 'utf8')) as Record<string, unknown>;
    assertChecksum(parsed, label);
    if (!sameIdentity(identityOf(target, label), before)) throw new Error(`${label} identity changed while reading`);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`${label} is not valid JSON`, {cause: error});
    throw error;
  } finally {
    closeSync(descriptor);
  }
}

function writeExclusiveControlFile(target: string, value: Record<string, unknown>): void {
  const descriptor = openSync(target, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
  try {
    writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  fsyncPath(path.dirname(target));
}

function writeJournal(root: string, journal: TransactionJournal, testing?: AtomicReplaceOptions['testing']): void {
  const target = journalPath(root, journal.transactionKey);
  if (pathEntryExists(target)) {
    const current = readJournal(target);
    if (current.transactionId !== journal.transactionId) throw new Error('Publication journal belongs to another transaction');
  }
  const temporary = path.join(root, `.${path.basename(target)}.tmp-${process.pid}-${randomUUID()}`);
  writeExclusiveControlFile(temporary, journal as unknown as Record<string, unknown>);
  renameSync(temporary, target);
  testing?.beforeControlFsync?.({kind: 'journal-root', transactionId: journal.transactionId});
  fsyncPath(root);
}

function readWriterLock(target: string): WriterLock {
  const value = readControlFile(target, 'Publication writer lock');
  if (value.schemaVersion !== 1 || value.kind !== 'writer' || typeof value.transactionKey !== 'string' || typeof value.transactionId !== 'string'
    || typeof value.pid !== 'number' || !(typeof value.ownerIdentity === 'string' || value.ownerIdentity === null)
    || !Array.isArray(value.ownedPaths) || !Array.isArray(value.operations)) throw new Error('Publication writer lock schema validation failed');
  return value as unknown as WriterLock;
}

function readReaderLock(target: string): ReaderLock {
  const value = readControlFile(target, 'Publication reader lock');
  if (value.schemaVersion !== 1 || value.kind !== 'reader' || typeof value.transactionKey !== 'string' || typeof value.token !== 'string'
    || typeof value.pid !== 'number' || !(typeof value.ownerIdentity === 'string' || value.ownerIdentity === null)) throw new Error('Publication reader lock schema validation failed');
  return value as unknown as ReaderLock;
}

function readJournal(target: string): TransactionJournal {
  const value = readControlFile(target, 'Publication transaction journal');
  if (value.schemaVersion !== 1 || value.kind !== 'journal' || typeof value.transactionKey !== 'string' || typeof value.transactionId !== 'string'
    || typeof value.baselineCommit !== 'string' || !['preparing', 'backup', 'install', 'committed'].includes(String(value.phase))
    || !isPathIdentity(value.stateIdentity)
    || !(typeof value.operationIndex === 'number' || value.operationIndex === null) || !Array.isArray(value.operations)) {
    throw new Error('Publication transaction journal schema validation failed');
  }
  return value as unknown as TransactionJournal;
}

function operationPaths(root: string, lock: WriterLock, operation: TransactionOperation, index: number): {target: string; temporary: string; backup: string} {
  const target = resolveTarget(root, operation.target);
  const token = lock.transactionId;
  return {
    target,
    temporary: resolveTarget(snapshotPublicationRoot(root, lock), operation.target, 'Prepared publication target'),
    backup: path.join(path.dirname(target), `.${path.basename(target)}.publication-backup-${token}-${index}`),
  };
}

function transactionStatePath(root: string, lock: WriterLock): string {
  return path.join(root, '.atomic-publication-state', lock.transactionKey, lock.transactionId);
}

function snapshotPublicationRoot(root: string, lock: WriterLock): string {
  return path.join(transactionStatePath(root, lock), 'publication');
}

function assertTransactionEntry(target: string, expected: string, label: string): void {
  if (target !== expected) {
    throw new Error(`${label} is not owned by the publication transaction`);
  }
}

function ensureControlledDirectory(root: string, target: string, mode = 0o700): void {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Publication transaction state escapes the publication root');
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) mkdirSync(current, {mode});
    if (identityOf(current, 'Publication transaction state').kind !== 'directory') throw new Error('Publication transaction state must use non-symlink directories');
  }
  revalidateBoundPaths(bindExistingAncestors(root, target, 'Publication transaction state'), 'Publication transaction state');
}

function ensureTransactionState(root: string, lock: WriterLock): PathIdentity {
  const transactionRoot = transactionStatePath(root, lock);
  if (pathEntryExists(transactionRoot)) throw new Error('Publication transaction state already exists');
  ensureControlledDirectory(root, path.dirname(transactionRoot));
  const parentBinding = bindExistingAncestors(root, path.dirname(transactionRoot), 'Publication transaction state parent');
  revalidateBoundPaths(parentBinding, 'Publication transaction state parent');
  mkdirSync(transactionRoot, {mode: 0o700});
  const stateIdentity = identityOf(transactionRoot, 'Publication transaction state');
  ensureControlledDirectory(root, snapshotPublicationRoot(root, lock));
  if (!sameIdentity(identityOf(transactionRoot, 'Publication transaction state'), stateIdentity)) {
    throw new Error('Publication transaction state identity changed during creation');
  }
  return stateIdentity;
}

function ensureSnapshotParent(root: string, lock: WriterLock, stateIdentity: PathIdentity, target: string): void {
  ensureControlledDirectory(root, path.dirname(target));
  if (!sameIdentity(identityOf(transactionStatePath(root, lock), 'Publication transaction state'), stateIdentity)) {
    throw new Error('Publication transaction state identity changed while preparing snapshot paths');
  }
}

type RenameBinding = Readonly<{
  source: string;
  destination: string;
  sourceIdentity: PathIdentity;
  sourceAncestors: readonly BoundPath[];
  destinationAncestors: readonly BoundPath[];
  destinationIdentity: PathIdentity | null;
}>;

function bindRename(root: string, source: string, destination: string, label: string): RenameBinding {
  const sourceIdentity = identityOf(source, `${label} source`);
  const sourceAncestors = bindExistingAncestors(root, path.dirname(source), `${label} source`);
  const destinationAncestors = bindExistingAncestors(root, path.dirname(destination), `${label} destination`);
  const destinationIdentity = pathEntryExists(destination) ? identityOf(destination, `${label} destination`) : null;
  return {source, destination, sourceIdentity, sourceAncestors, destinationAncestors, destinationIdentity};
}

function executeBoundRename(binding: RenameBinding, label: string): void {
  revalidateBoundPaths(binding.sourceAncestors, `${label} source ancestors`);
  revalidateBoundPaths(binding.destinationAncestors, `${label} destination ancestors`);
  if (!sameIdentity(identityOf(binding.source, `${label} source`), binding.sourceIdentity)) throw new Error(`${label} source identity changed before rename`);
  if (binding.destinationIdentity === null) {
    if (pathEntryExists(binding.destination)) throw new Error(`${label} destination appeared before rename`);
  } else if (!sameIdentity(identityOf(binding.destination, `${label} destination`), binding.destinationIdentity)) {
    throw new Error(`${label} destination identity changed before rename`);
  }
  renameSync(binding.source, binding.destination);
  revalidateBoundPaths(binding.destinationAncestors, `${label} destination ancestors`);
  if (pathEntryExists(binding.source)) throw new Error(`${label} source still exists after rename`);
  if (!sameIdentity(identityOf(binding.destination, `${label} destination`), binding.sourceIdentity)) throw new Error(`${label} destination identity changed after rename`);
}

async function performRename(
  root: string,
  source: string,
  destination: string,
  transactionId: string,
  testing?: AtomicReplaceOptions['testing'],
  revalidateSource?: () => void,
): Promise<void> {
  const event = Object.freeze({kind: 'rename' as const, transactionId, from: source, to: destination});
  const binding = bindRename(root, source, destination, 'Publication rename');
  await testing?.beforeFilesystemOperation?.(event);
  revalidateSource?.();
  executeBoundRename(binding, 'Publication rename');
  fsyncPath(path.dirname(destination));
  await testing?.afterRename?.(event);
}

function restoreRename(root: string, source: string, destination: string, expectedSourceIdentity?: PathIdentity): void {
  const binding = bindRename(root, source, destination, 'Publication recovery rename');
  if (expectedSourceIdentity && !sameIdentity(binding.sourceIdentity, expectedSourceIdentity)) {
    throw new Error('Publication recovery backup identity does not match the transaction journal');
  }
  executeBoundRename(binding, 'Publication recovery rename');
  fsyncPath(path.dirname(destination));
}

function removeTransactionEntry(
  root: string,
  target: string,
  expected: string,
  label: string,
  requireTransactionName = true,
  expectedIdentity?: PathIdentity,
): void {
  if (!pathEntryExists(target)) return;
  if (requireTransactionName) assertTransactionEntry(target, expected, label);
  else if (target !== expected) throw new Error(`${label} path does not match its journal target`);
  const ancestors = bindExistingAncestors(root, path.dirname(target), label);
  const identity = identityOf(target, label);
  if (expectedIdentity && !sameIdentity(identity, expectedIdentity)) throw new Error(`${label} identity does not match the transaction journal`);
  revalidateBoundPaths(ancestors, `${label} ancestors`);
  if (!sameIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed before cleanup`);
  rmSync(target, {recursive: true, force: false});
  revalidateBoundPaths(ancestors, `${label} ancestors`);
  if (pathEntryExists(target)) throw new Error(`${label} still exists after cleanup`);
  fsyncPath(path.dirname(target));
}

function rollbackTransaction(root: string, lock: WriterLock, journal: TransactionJournal): void {
  for (let index = lock.operations.length - 1; index >= 0; index -= 1) {
    const operation = lock.operations[index];
    const journalOperation = journal.operations[index];
    const paths = operationPaths(root, lock, operation, index);
    if (pathEntryExists(paths.backup)) {
      if (pathEntryExists(paths.target)) {
        if (!journalOperation?.preparedIdentity) throw new Error('Installed publication target is missing its transaction identity');
        removeTransactionEntry(root, paths.target, paths.target, 'Installed publication target', false, journalOperation.preparedIdentity);
      }
      restoreRename(root, paths.backup, paths.target, operation.originalIdentity);
    } else if (!operation.hadTarget && pathEntryExists(paths.target) && !pathEntryExists(paths.temporary)) {
      if (!journalOperation?.preparedIdentity) throw new Error('Installed publication target is missing its transaction identity');
      removeTransactionEntry(root, paths.target, paths.target, 'Installed publication target', false, journalOperation.preparedIdentity);
    }
    removeTransactionEntry(root, paths.temporary, paths.temporary, 'Prepared publication temporary');
  }
  removeTransactionState(root, lock, journal.stateIdentity);
}

function completeCommittedCleanup(root: string, lock: WriterLock, stateIdentity: PathIdentity): void {
  for (const [index, operation] of lock.operations.entries()) {
    const paths = operationPaths(root, lock, operation, index);
    removeTransactionEntry(root, paths.backup, paths.backup, 'Publication backup', true, operation.originalIdentity);
    removeTransactionEntry(root, paths.temporary, paths.temporary, 'Prepared publication temporary');
  }
  removeTransactionState(root, lock, stateIdentity);
}

function removeTransactionState(root: string, lock: WriterLock, expectedIdentity: PathIdentity): void {
  const transactionRoot = transactionStatePath(root, lock);
  if (pathEntryExists(transactionRoot)) {
    removeTransactionEntry(root, transactionRoot, transactionRoot, 'Publication transaction state', true, expectedIdentity);
  }
  for (const directory of [path.dirname(transactionRoot), path.dirname(path.dirname(transactionRoot))]) {
    if (pathEntryExists(directory) && identityOf(directory, 'Publication transaction state parent').kind === 'directory' && readdirSync(directory).length === 0) {
      rmdirSync(directory);
      fsyncPath(path.dirname(directory));
    }
  }
}

function baseOperations(operations: readonly JournalOperation[]): readonly TransactionOperation[] {
  return operations.map(({target, replacement, hadTarget, originalIdentity}) => ({target, replacement, hadTarget, ...(originalIdentity ? {originalIdentity} : {})}));
}

function removeControlFile(root: string, target: string, label: string): void {
  if (!pathEntryExists(target)) return;
  const ancestors = bindExistingAncestors(root, path.dirname(target), label);
  const identity = identityOf(target, label);
  if (identity.kind !== 'file') throw new Error(`${label} must be a regular file`);
  revalidateBoundPaths(ancestors, `${label} ancestors`);
  if (!sameIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed before removal`);
  unlinkSync(target);
  fsyncPath(path.dirname(target));
}

function recoverStaleWriter(root: string, key: string): void {
  const lockTarget = writerLockPath(root, key);
  const journalTarget = journalPath(root, key);
  if (!pathEntryExists(lockTarget)) {
    if (!pathEntryExists(journalTarget)) return;
    const journal = readJournal(journalTarget);
    const ownedPaths = normalizedOwnedPaths(journal.operations.map(operation => operation.target));
    if (journal.transactionKey !== key || transactionKey(ownedPaths) !== key) throw new Error('Publication orphan journal transaction key mismatch');
    const lock = {
      schemaVersion: 1 as const,
      kind: 'writer' as const,
      transactionKey: key,
      transactionId: journal.transactionId,
      pid: 0,
      ownerIdentity: null,
      createdAt: '',
      ownedPaths,
      operations: baseOperations(journal.operations),
      checksum: '',
    } satisfies WriterLock;
    if (journal.phase === 'committed') completeCommittedCleanup(root, lock, journal.stateIdentity);
    else rollbackTransaction(root, lock, journal);
    removeControlFile(root, journalTarget, 'Publication transaction journal');
    return;
  }
  const lock = readWriterLock(lockTarget);
  if (lock.transactionKey !== key || transactionKey(lock.ownedPaths) !== key) throw new Error('Publication writer lock transaction key mismatch');
  if (processOwnsRecord(lock.pid, lock.ownerIdentity)) throw new Error(`Concurrent publication lock already exists: ${lockTarget}`);
  if (pathEntryExists(journalTarget)) {
    const journal = readJournal(journalTarget);
    if (journal.transactionId !== lock.transactionId || journal.transactionKey !== key || canonicalJson(baseOperations(journal.operations)) !== canonicalJson(lock.operations)) {
      throw new Error('Publication transaction journal does not match its stale writer lock');
    }
    if (journal.phase === 'committed') completeCommittedCleanup(root, lock, journal.stateIdentity);
    else rollbackTransaction(root, lock, journal);
    removeControlFile(root, journalTarget, 'Publication transaction journal');
  }
  removeControlFile(root, lockTarget, 'Publication writer lock');
}

function cleanupStaleReaders(root: string, key: string): number {
  let active = 0;
  for (const entry of readdirSync(root).filter(name => name.startsWith(readerPrefix(key)))) {
    const target = path.join(root, entry);
    const reader = readReaderLock(target);
    if (reader.transactionKey !== key) throw new Error('Publication reader lock transaction key mismatch');
    if (processOwnsRecord(reader.pid, reader.ownerIdentity)) active += 1;
    else removeControlFile(root, target, 'Stale publication reader lock');
  }
  return active;
}

function createReaderLock(root: string, key: string): {path: string; record: ReaderLock} {
  const token = `${process.pid}-${randomUUID()}`;
  const record = checksummed({
    schemaVersion: 1 as const,
    kind: 'reader' as const,
    transactionKey: key,
    token,
    pid: process.pid,
    ownerIdentity: processIdentity(process.pid),
    createdAt: new Date().toISOString(),
  }) as ReaderLock;
  const target = path.join(root, `${readerPrefix(key)}${token}.lock`);
  writeExclusiveControlFile(target, record as unknown as Record<string, unknown>);
  return {path: target, record};
}

async function acquireReader(root: string, key: string): Promise<string> {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const writer = writerLockPath(root, key);
    if (pathEntryExists(writer)) {
      try {
        recoverStaleWriter(root, key);
      } catch (error) {
        if (!String((error as Error).message).match(/concurrent publication lock/i)) throw error;
        await sleep(LOCK_POLL_MS);
        continue;
      }
    }
    const reader = createReaderLock(root, key);
    if (!pathEntryExists(writer)) return reader.path;
    removeControlFile(root, reader.path, 'Publication reader lock');
    await sleep(LOCK_POLL_MS);
  }
  throw new Error(`Timed out waiting for publication writer fence: ${key}`);
}

function acquireReaderSync(root: string, key: string): string {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const writer = writerLockPath(root, key);
    if (pathEntryExists(writer)) {
      try {
        recoverStaleWriter(root, key);
      } catch (error) {
        if (!String((error as Error).message).match(/concurrent publication lock/i)) throw error;
        sleepSync(LOCK_POLL_MS);
        continue;
      }
    }
    const reader = createReaderLock(root, key);
    if (!pathEntryExists(writer)) return reader.path;
    removeControlFile(root, reader.path, 'Publication reader lock');
    sleepSync(LOCK_POLL_MS);
  }
  throw new Error(`Timed out waiting for publication writer fence: ${key}`);
}

export async function withAtomicPublicationRead<T>(
  publicationRoot: string,
  ownedPaths: readonly string[],
  reader: (canonicalPublicationRoot: string) => T | Promise<T>,
): Promise<T> {
  const root = canonicalRoot(publicationRoot);
  const normalized = normalizedOwnedPaths(ownedPaths);
  const lock = await acquireReader(root, transactionKey(normalized));
  try {
    return await reader(root);
  } finally {
    removeControlFile(root, lock, 'Publication reader lock');
  }
}

export async function withAtomicPublicationReads<T>(
  publicationRoot: string,
  publicationSets: readonly (readonly string[])[],
  reader: (canonicalPublicationRoot: string) => T | Promise<T>,
): Promise<T> {
  const root = canonicalRoot(publicationRoot);
  const sets = publicationSets
    .map(paths => ({paths: normalizedOwnedPaths(paths), key: transactionKey(paths)}))
    .sort((left, right) => left.key.localeCompare(right.key, 'en'));
  const unique = sets.filter((entry, index) => index === 0 || entry.key !== sets[index - 1].key);
  const locks: string[] = [];
  try {
    for (const entry of unique) locks.push(await acquireReader(root, entry.key));
    return await reader(root);
  } finally {
    for (const lock of locks.reverse()) removeControlFile(root, lock, 'Publication reader lock');
  }
}

export function ownedTreeCommit(publicationRoot: string, ownedPaths: readonly string[]): string {
  const root = canonicalRoot(publicationRoot);
  const normalized = normalizedOwnedPaths(ownedPaths);
  const lock = acquireReaderSync(root, transactionKey(normalized));
  try {
    return ownedTreeCommitUnfenced(root, normalized);
  } finally {
    removeControlFile(root, lock, 'Publication reader lock');
  }
}

function ensureParent(root: string, target: string): void {
  const parent = path.dirname(target);
  const relative = path.relative(root, parent);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) mkdirSync(current, {mode: 0o755});
    const identity = identityOf(current, 'Publication target parent');
    if (identity.kind !== 'directory') throw new Error(`Publication target parent is unsafe: ${current}`);
  }
  bindExistingAncestors(root, parent, 'Publication target parent');
}

async function copyImmutableTree(
  root: string,
  source: string,
  destination: string,
  transactionId: string,
  testing?: AtomicReplaceOptions['testing'],
): Promise<void> {
  const sourceAncestors = bindExistingAncestors(root, path.dirname(source), 'Publication source');
  const destinationAncestors = bindExistingAncestors(root, path.dirname(destination), 'Prepared publication destination');
  const sourceIdentity = identityOf(source, 'Publication source');
  const event = Object.freeze({kind: 'copy' as const, transactionId, from: source, to: destination});
  await testing?.beforeFilesystemOperation?.(event);
  revalidateBoundPaths(sourceAncestors, 'Publication source ancestors');
  revalidateBoundPaths(destinationAncestors, 'Prepared publication destination ancestors');
  if (!sameIdentity(identityOf(source, 'Publication source'), sourceIdentity)) throw new Error('Publication source identity changed before snapshot');
  if (pathEntryExists(destination)) throw new Error('Prepared publication destination appeared before snapshot copy');
  if (sourceIdentity.kind === 'file') {
    const sourceDescriptor = openSync(source, constants.O_RDONLY | constants.O_NOFOLLOW);
    const destinationDescriptor = openSync(destination, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, sourceIdentity.mode & 0o777);
    try {
      const opened = fstatSync(sourceDescriptor);
      if (opened.dev !== sourceIdentity.dev || opened.ino !== sourceIdentity.ino || opened.nlink !== 1) throw new Error('Publication source identity changed while opening snapshot');
      writeFileSync(destinationDescriptor, readFileSync(sourceDescriptor));
      fsyncSync(destinationDescriptor);
    } finally {
      closeSync(destinationDescriptor);
      closeSync(sourceDescriptor);
    }
  } else {
    mkdirSync(destination, {mode: sourceIdentity.mode & 0o777});
    const destinationIdentity = identityOf(destination, 'Prepared publication destination');
    revalidateBoundPaths(destinationAncestors, 'Prepared publication destination ancestors');
    const entries = readdirSync(source).sort((left, right) => left.localeCompare(right, 'en'));
    if (!sameIdentity(identityOf(source, 'Publication source'), sourceIdentity)) throw new Error('Publication source identity changed while listing snapshot');
    for (const entry of entries) await copyImmutableTree(root, path.join(source, entry), path.join(destination, entry), transactionId, testing);
    if (!sameIdentity(identityOf(destination, 'Prepared publication destination'), destinationIdentity)) throw new Error('Prepared publication destination identity changed while copying snapshot');
  }
  if (!sameIdentity(identityOf(source, 'Publication source'), sourceIdentity)) throw new Error('Publication source identity changed while copying snapshot');
  revalidateBoundPaths(destinationAncestors, 'Prepared publication destination ancestors');
  bindExistingAncestors(root, destination, 'Prepared publication');
}

function createWriterLock(root: string, key: string, ownedPaths: readonly string[], operations: readonly TransactionOperation[], transactionId: string): WriterLock {
  const lock = checksummed({
    schemaVersion: 1 as const,
    kind: 'writer' as const,
    transactionKey: key,
    transactionId,
    pid: process.pid,
    ownerIdentity: processIdentity(process.pid),
    createdAt: new Date().toISOString(),
    ownedPaths,
    operations,
  }) as WriterLock;
  const target = writerLockPath(root, key);
  try {
    writeExclusiveControlFile(target, lock as unknown as Record<string, unknown>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error(`Concurrent publication lock already exists: ${target}`);
    throw error;
  }
  return lock;
}

async function waitForReaders(root: string, key: string): Promise<void> {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;
  while (cleanupStaleReaders(root, key) > 0) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for publication readers: ${key}`);
    await sleep(LOCK_POLL_MS);
  }
}

function journalRecord(
  lock: WriterLock,
  baselineCommit: string,
  stateIdentity: PathIdentity,
  phase: JournalPhase,
  operationIndex: number | null,
  operations: readonly JournalOperation[] = lock.operations,
): TransactionJournal {
  return checksummed({
    schemaVersion: 1 as const,
    kind: 'journal' as const,
    transactionKey: lock.transactionKey,
    transactionId: lock.transactionId,
    baselineCommit,
    stateIdentity,
    phase,
    operationIndex,
    operations,
  }) as TransactionJournal;
}

export async function atomicReplace(options: AtomicReplaceOptions): Promise<void> {
  const root = canonicalRoot(options.publicationRoot);
  const replacementTargets = options.replacements.map(replacement => replacement.target);
  const removalTargets = options.removals ?? [];
  const ownedPaths = normalizedOwnedPaths([...replacementTargets, ...removalTargets]);
  if (ownedPaths.length === 0) throw new Error('Atomic publication requires at least one owned target');
  if (typeof options.baselineCommit !== 'string' || !/^sha256:[0-9a-f]{64}$/u.test(options.baselineCommit)) {
    throw new Error('Atomic publication baselineCommit must be an owned-tree sha256 commit');
  }

  const sources = options.replacements.map(replacement => {
    const source = path.resolve(replacement.source);
    if (!pathEntryExists(source)) throw new Error(`Publication source does not exist: ${source}`);
    return realpathSync(source);
  });
  for (const source of sources) {
    if (source === root || !source.startsWith(`${root}${path.sep}`)) throw new Error(`Publication source escapes the publication root: ${source}`);
    assertSafeTree(source, 'Publication source');
  }
  for (const relative of ownedPaths) {
    const target = resolveTarget(root, relative);
    bindExistingAncestors(root, target, `Publication target ${relative}`);
    if (pathEntryExists(target)) assertSafeTree(target, `Publication target ${relative}`);
  }

  const key = transactionKey(ownedPaths);
  recoverStaleWriter(root, key);
  const transactionId = `${process.pid}-${randomUUID()}`;
  const operations: TransactionOperation[] = [
    ...replacementTargets.map(target => {
      const absolute = resolveTarget(root, target);
      const hadTarget = pathEntryExists(absolute);
      return {target, replacement: true, hadTarget, ...(hadTarget ? {originalIdentity: identityOf(absolute, `Publication target ${target}`)} : {})};
    }),
    ...removalTargets.map(target => {
      const absolute = resolveTarget(root, target);
      const hadTarget = pathEntryExists(absolute);
      return {target, replacement: false, hadTarget, ...(hadTarget ? {originalIdentity: identityOf(absolute, `Publication target ${target}`)} : {})};
    }),
  ];
  const lock = createWriterLock(root, key, ownedPaths, operations, transactionId);
  const lockTarget = writerLockPath(root, key);
  const journalTarget = journalPath(root, key);
  let journalCreated = false;
  let stateIdentity: PathIdentity | undefined;
  try {
    await waitForReaders(root, key);
    for (const source of sources) assertSafeTree(source, 'Publication source');
    for (const relative of ownedPaths) {
      const target = resolveTarget(root, relative);
      bindExistingAncestors(root, target, `Publication target ${relative}`);
      if (pathEntryExists(target)) assertSafeTree(target, `Publication target ${relative}`);
    }
    stateIdentity = ensureTransactionState(root, lock);
    writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'preparing', null), options.testing);
    journalCreated = true;
    await options.testing?.afterJournal?.({transactionId, phase: 'preparing', operationIndex: null});

    for (const [index, source] of sources.entries()) {
      const paths = operationPaths(root, lock, operations[index], index);
      ensureSnapshotParent(root, lock, stateIdentity, paths.temporary);
      if (pathEntryExists(paths.temporary) || pathEntryExists(paths.backup)) throw new Error('Publication transaction entry already exists');
      await copyImmutableTree(root, source, paths.temporary, transactionId, options.testing);
      assertSafeTree(paths.temporary, 'Prepared publication');
      fsyncTree(paths.temporary);
      fsyncPath(path.dirname(paths.temporary));
    }

    const journalOperations: JournalOperation[] = operations.map((operation, index) => ({
      ...operation,
      ...(operation.replacement ? {
        preparedIdentity: identityOf(operationPaths(root, lock, operation, index).temporary, 'Prepared publication'),
        preparedVersion: ownedPathVersion(snapshotPublicationRoot(root, lock), operation.target),
      } : {}),
    }));
    writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'preparing', null, journalOperations), options.testing);
    await options.testing?.afterJournal?.({transactionId, phase: 'preparing', operationIndex: null});

    for (const [index, operation] of operations.entries()) {
      if (!operation.replacement) continue;
      const paths = operationPaths(root, lock, operation, index);
      const snapshotDevice = pathDevice(path.dirname(paths.temporary), options.testing);
      const targetParent = deepestExistingDirectory(root, path.dirname(paths.target));
      const targetDevice = pathDevice(targetParent, options.testing);
      if (snapshotDevice !== targetDevice) {
        throw new Error(`Prepared publication and target must use the same filesystem: ${operation.target}`);
      }
    }

    const validationRoot = snapshotPublicationRoot(root, lock);
    const validatedSnapshotCommit = ownedTreeCommitUnfenced(validationRoot, ownedPaths);
    await options.validatePublication?.(Object.freeze({
      publicationRoot: validationRoot,
      ownedPaths: Object.freeze([...ownedPaths]),
    }));
    if (ownedTreeCommitUnfenced(validationRoot, ownedPaths) !== validatedSnapshotCommit) {
      throw new Error('Prepared publication snapshot changed during validation');
    }

    for (const [index, operation] of operations.entries()) {
      if (operation.replacement) ensureParent(root, operationPaths(root, lock, operation, index).target);
    }

    const currentCommit = ownedTreeCommitUnfenced(root, ownedPaths);
    if (currentCommit !== options.baselineCommit) {
      throw new Error(`Stale publication baseline compare-and-swap: expected ${options.baselineCommit}, found ${currentCommit}`);
    }

    const versionedJournalOperations: JournalOperation[] = journalOperations.map(operation => ({
      ...operation,
      liveVersion: ownedPathVersion(root, operation.target),
    }));
    writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'preparing', null, versionedJournalOperations), options.testing);
    await options.testing?.afterJournal?.({transactionId, phase: 'preparing', operationIndex: null});

    for (const [index, operation] of operations.entries()) {
      if (!operation.hadTarget) continue;
      const paths = operationPaths(root, lock, operation, index);
      const expectedLiveVersion = versionedJournalOperations[index].liveVersion;
      if (!expectedLiveVersion || ownedPathVersion(root, operation.target) !== expectedLiveVersion) {
        throw new Error(`Concurrent publication target content changed before backup intent: ${operation.target}`);
      }
      writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'backup', index, versionedJournalOperations), options.testing);
      await options.testing?.afterJournal?.({transactionId, phase: 'backup', operationIndex: index});
      await performRename(root, paths.target, paths.backup, transactionId, options.testing, () => {
        if (ownedPathVersion(root, operation.target) !== expectedLiveVersion) {
          throw new Error(`Concurrent publication target content changed before backup rename: ${operation.target}`);
        }
      });
    }
    if (ownedTreeCommitUnfenced(validationRoot, ownedPaths) !== validatedSnapshotCommit) {
      throw new Error('Prepared publication snapshot changed before install');
    }
    for (const [index, operation] of operations.entries()) {
      if (!operation.replacement) continue;
      const paths = operationPaths(root, lock, operation, index);
      const preparedVersion = versionedJournalOperations[index].preparedVersion;
      if (!preparedVersion || ownedPathVersion(validationRoot, operation.target) !== preparedVersion) {
        throw new Error(`Prepared publication snapshot content changed before install intent: ${operation.target}`);
      }
      if (pathEntryExists(paths.target)) {
        throw new Error(`Concurrent publication target appeared before install intent: ${operation.target}`);
      }
      writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'install', index, versionedJournalOperations), options.testing);
      await options.testing?.afterJournal?.({transactionId, phase: 'install', operationIndex: index});
      await performRename(root, paths.temporary, paths.target, transactionId, options.testing, () => {
        if (ownedPathVersion(validationRoot, operation.target) !== preparedVersion) {
          throw new Error(`Prepared publication snapshot content changed before install rename: ${operation.target}`);
        }
        if (pathEntryExists(paths.target)) {
          throw new Error(`Concurrent publication target appeared before install rename: ${operation.target}`);
        }
      });
    }
    for (const [index, operation] of operations.entries()) {
      if (!operation.replacement) continue;
      const installed = operationPaths(root, lock, operation, index).target;
      const preparedIdentity = versionedJournalOperations[index].preparedIdentity;
      if (!preparedIdentity || !pathEntryExists(installed) || !sameIdentity(identityOf(installed, 'Installed publication target'), preparedIdentity)) {
        throw new Error(`Installed publication target identity changed before committed marker: ${operation.target}`);
      }
      revalidateBoundPaths(bindExistingAncestors(root, installed, 'Installed publication target'), 'Installed publication target ancestors');
    }
    writeJournal(root, journalRecord(lock, options.baselineCommit, stateIdentity, 'committed', null, versionedJournalOperations), options.testing);
    await options.testing?.afterJournal?.({transactionId, phase: 'committed', operationIndex: null});
    completeCommittedCleanup(root, lock, stateIdentity);
    removeControlFile(root, journalTarget, 'Publication transaction journal');
    journalCreated = false;
  } catch (error) {
    if (pathEntryExists(journalTarget)) {
      const journal = readJournal(journalTarget);
      if (journal.transactionId !== transactionId) throw error;
      journalCreated = true;
      try {
        if (journal.phase === 'committed') {
          completeCommittedCleanup(root, lock, journal.stateIdentity);
        } else {
          rollbackTransaction(root, lock, journal);
        }
        removeControlFile(root, journalTarget, 'Publication transaction journal');
        journalCreated = false;
      } catch (recoveryError) {
        if (pathEntryExists(lockTarget)) removeControlFile(root, lockTarget, 'Publication writer lock');
        throw new Error(`Publication transaction recovery failed and its journal was preserved: ${(recoveryError as Error).message}`, {cause: error});
      }
    }
    throw error;
  } finally {
    if (!journalCreated && pathEntryExists(lockTarget)) removeControlFile(root, lockTarget, 'Publication writer lock');
  }
}
