import {createHash, createHmac, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import {assertSafeRepositoryRelativePath} from '../validation/ownership.ts';

type PathIdentity = Readonly<{dev: number; ino: number; kind: 'file' | 'directory'; mode: number; nlink: number}>;
type BoundPath = Readonly<{path: string; identity: PathIdentity}>;
type BoundTreeEntry = Readonly<{relative: string; identity: PathIdentity}>;
type RemovalJournalPayload = Readonly<{
  version: 2;
  kind: 'docs-tooling-stage-removal';
  repositoryRoot: string;
  repositoryIdentity: PathIdentity;
  relative: string;
  quarantineRelative: string;
  treeBinding: readonly BoundTreeEntry[];
}>;
type ChecksummedRemovalJournal = RemovalJournalPayload & Readonly<{checksum: string}>;
type RemovalJournal = ChecksummedRemovalJournal & Readonly<{hmac: string}>;

const REMOVAL_JOURNAL_DIRECTORY = 'tmp/docs-tooling/.stage-removal-journals';
const REMOVAL_CONTROL_DIRECTORY = 'tmp/docs-tooling/.stage-removal-control';
const REMOVAL_CONTROL_KEY = `${REMOVAL_CONTROL_DIRECTORY}/recovery-hmac.key`;
const REMOVAL_CONTROL_FENCE = 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock';
const REMOVAL_JOURNAL_HMAC_DOMAIN = 'docs-tooling-stage-removal-journal\0v2\0';
const REMOVAL_CONTROL_FENCE_TIMEOUT_MS = 30_000;
const REMOVAL_CONTROL_FENCE_POLL_MS = 10;

export type SecureInventoryEntry = Readonly<{
  path: string;
  size: number;
  sha256: string;
}>;

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function identityOf(target: string, label: string): PathIdentity {
  const stats = lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`${label} must not use symlinks: ${target}`);
  if (stats.isFile()) {
    if (stats.nlink !== 1) throw new Error(`${label} file must not be hard-linked: ${target}`);
    return {dev: stats.dev, ino: stats.ino, kind: 'file', mode: stats.mode, nlink: stats.nlink};
  }
  if (stats.isDirectory()) return {dev: stats.dev, ino: stats.ino, kind: 'directory', mode: stats.mode, nlink: stats.nlink};
  throw new Error(`${label} must contain only regular files and directories: ${target}`);
}

function sameIdentity(left: PathIdentity, right: PathIdentity): boolean {
  return sameNode(left, right) && left.mode === right.mode;
}

function sameNode(left: PathIdentity, right: PathIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.kind === right.kind
    && (left.kind === 'directory' || left.nlink === right.nlink);
}

function canonicalRoot(repositoryRootInput: string, label: string): string {
  const repositoryRoot = path.resolve(repositoryRootInput);
  const identity = identityOf(repositoryRoot, `${label} repository root`);
  if (identity.kind !== 'directory') throw new Error(`${label} repository root must be a directory`);
  return realpathSync(repositoryRoot);
}

function relativeBelowRoot(root: string, target: string): string | undefined {
  const relative = path.relative(root, target).split(path.sep).join('/');
  if (!relative || relative.startsWith('../') || path.posix.isAbsolute(relative)) return undefined;
  return relative;
}

function relativeBelowEquivalentRoot(root: string, target: string): string | undefined {
  let current = target;
  const suffix: string[] = [];
  while (true) {
    if (pathEntryExists(current)) {
      const stats = lstatSync(current);
      if (!stats.isSymbolicLink() && stats.isDirectory() && realpathSync(current) === root && suffix.length > 0) {
        return suffix.join('/');
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    suffix.unshift(path.basename(current));
    current = parent;
  }
}

function relativePath(root: string, input: string, label: string, repositoryRootInput = root): string {
  if (!path.isAbsolute(input)) {
    const relative = relativeBelowRoot(root, path.resolve(root, input));
    if (relative) return assertSafeRepositoryRelativePath(relative, label);
  } else {
    const target = path.resolve(input);
    const lexicalRelative = relativeBelowRoot(path.resolve(repositoryRootInput), target);
    if (lexicalRelative) return assertSafeRepositoryRelativePath(lexicalRelative, label);
    const canonicalRelative = relativeBelowRoot(root, target);
    if (canonicalRelative) return assertSafeRepositoryRelativePath(canonicalRelative, label);
    const equivalentRelative = relativeBelowEquivalentRoot(root, target);
    if (equivalentRelative) return assertSafeRepositoryRelativePath(equivalentRelative, label);
  }
  throw new Error(`${label} must stay below the repository root`);
}

function bindPath(root: string, relative: string, label: string, allowMissing: boolean): readonly BoundPath[] {
  const bound: BoundPath[] = [{path: root, identity: identityOf(root, `${label} root`)}];
  let current = root;
  const segments = relative.split('/');
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) {
      if (!allowMissing) throw new Error(`${label} is missing: ${relative}`);
      break;
    }
    const identity = identityOf(current, label);
    if (index < segments.length - 1 && identity.kind !== 'directory') {
      throw new Error(`${label} has a non-directory ancestor: ${path.relative(root, current)}`);
    }
    bound.push({path: current, identity});
  }
  return Object.freeze(bound);
}

function revalidate(bound: readonly BoundPath[], label: string): void {
  for (const entry of bound) {
    if (!pathEntryExists(entry.path) || !sameIdentity(identityOf(entry.path, label), entry.identity)) {
      throw new Error(`${label} identity changed: ${entry.path}`);
    }
  }
}

function fsyncDirectory(directory: string): void {
  const descriptor = openSync(directory, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    fsyncSync(descriptor);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EINVAL' && code !== 'EBADF' && code !== 'EISDIR') throw error;
  } finally {
    closeSync(descriptor);
  }
}

export function resolveSecureRepositoryPath(
  repositoryRootInput: string,
  pathInput: string,
  label: string,
  options: Readonly<{allowMissing?: boolean; finalKind?: 'file' | 'directory'}> = {},
): string {
  const root = canonicalRoot(repositoryRootInput, label);
  const relative = relativePath(root, pathInput, label, repositoryRootInput);
  const target = path.join(root, ...relative.split('/'));
  const bound = bindPath(root, relative, label, options.allowMissing === true);
  revalidate(bound, label);
  if (pathEntryExists(target) && options.finalKind && identityOf(target, label).kind !== options.finalKind) {
    throw new Error(`${label} must be a ${options.finalKind}`);
  }
  return path.join(path.resolve(repositoryRootInput), ...relative.split('/'));
}

export function securePathExists(repositoryRoot: string, pathInput: string, label: string): boolean {
  const target = resolveSecureRepositoryPath(repositoryRoot, pathInput, label, {allowMissing: true});
  return pathEntryExists(target);
}

export function ensureSecureDirectory(
  repositoryRootInput: string,
  pathInput: string,
  label: string,
  mode = 0o700,
  testing?: Readonly<{
    beforeMkdir?: (target: string) => void;
    afterParentRevalidate?: (parent: string, created: string) => void;
    afterParentFsync?: (parent: string, created: string) => void;
  }>,
): string {
  const root = canonicalRoot(repositoryRootInput, label);
  const relative = relativePath(root, pathInput, label, repositoryRootInput);
  let current = root;
  let parentBinding = bindPath(root, '.', `${label} parent`, true);
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) {
      revalidate(parentBinding, `${label} parent`);
      testing?.beforeMkdir?.(current);
      let created = false;
      try {
        mkdirSync(current, {mode});
        created = true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
      revalidate(parentBinding, `${label} parent`);
      if (created) {
        const parent = path.dirname(current);
        testing?.afterParentRevalidate?.(parent, current);
        fsyncDirectory(parent);
        testing?.afterParentFsync?.(parent, current);
        revalidate(parentBinding, `${label} parent`);
      }
    }
    const identity = identityOf(current, label);
    if (identity.kind !== 'directory') throw new Error(`${label} has a non-directory ancestor: ${current}`);
    parentBinding = [...parentBinding, {path: current, identity}];
  }
  revalidate(parentBinding, label);
  return current;
}

export function readSecureFile(repositoryRoot: string, pathInput: string, label: string): Buffer {
  const target = resolveSecureRepositoryPath(repositoryRoot, pathInput, label, {finalKind: 'file'});
  const root = canonicalRoot(repositoryRoot, label);
  const relative = relativePath(root, target, label, repositoryRoot);
  const ancestors = bindPath(root, path.posix.dirname(relative), `${label} ancestors`, false);
  const before = identityOf(target, label);
  const descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino || opened.nlink !== 1) {
      throw new Error(`${label} identity changed while opening`);
    }
    const contents = readFileSync(descriptor);
    revalidate(ancestors, `${label} ancestors`);
    if (!sameIdentity(identityOf(target, label), before)) throw new Error(`${label} identity changed while reading`);
    return contents;
  } finally {
    closeSync(descriptor);
  }
}

function captureSecureTreeInventory(
  root: string,
  relative: string,
  label: string,
  excluded: ReadonlySet<string>,
): SecureInventoryEntry[] {
  if (excluded.has(relative)) return [];
  const target = resolveSecureRepositoryPath(root, relative, label);
  const before = identityOf(target, label);
  if (before.kind === 'file') {
    const contents = readSecureFile(root, relative, label);
    return [{path: relative, size: contents.byteLength, sha256: createHash('sha256').update(contents).digest('hex')}];
  }
  const entries = readdirSync(target).sort((left, right) => left.localeCompare(right, 'en'));
  const inventory = entries.flatMap(entry => (
    captureSecureTreeInventory(root, path.posix.join(relative, entry), label, excluded)
  ));
  if (!sameIdentity(identityOf(target, label), before)) throw new Error(`${label} directory changed while inventorying: ${relative}`);
  return inventory;
}

export function captureSecureInventory(
  repositoryRootInput: string,
  roots: readonly string[],
  label: string,
  options: Readonly<{exclude?: readonly string[]}> = {},
): readonly SecureInventoryEntry[] {
  const root = canonicalRoot(repositoryRootInput, label);
  const normalizedRoots = roots.map(value => relativePath(root, value, label, repositoryRootInput));
  const excluded = new Set((options.exclude ?? []).map(value => relativePath(root, value, `${label} exclusion`, repositoryRootInput)));
  const entries = normalizedRoots
    .sort((left, right) => left.localeCompare(right, 'en'))
    .flatMap(relative => captureSecureTreeInventory(root, relative, label, excluded))
    .sort((left, right) => left.path.localeCompare(right.path, 'en'));
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1].path === entries[index].path) throw new Error(`${label} roots overlap: ${entries[index].path}`);
  }
  return Object.freeze(entries.map(entry => Object.freeze(entry)));
}

/**
 * Rejects pre-existing and deterministically observed repository-path attacks.
 * Hostile same-UID syscall races after the final checks are outside this helper's threat model;
 * supported concurrent publishers must serialize through the stable publication-group fence.
 */
export function writeSecureAtomicFile(
  repositoryRoot: string,
  pathInput: string,
  contents: string | Buffer,
  label: string,
  options: Readonly<{
    replace?: boolean;
    mode?: number;
    testing?: Readonly<{
      beforeRename?: (target: string) => void;
      afterPrivateDirectoryCreate?: (directory: string) => void;
      afterRename?: (target: string) => void;
      beforeParentFsync?: (parent: string) => void;
      afterTemporaryOpen?: (temporary: string) => void;
      privateDirectoryName?: string;
    }>;
  }> = {},
): string {
  const root = canonicalRoot(repositoryRoot, label);
  const relative = relativePath(root, pathInput, label, repositoryRoot);
  const parentRelative = path.posix.dirname(relative);
  const parent = ensureSecureDirectory(root, parentRelative, `${label} parent`);
  const target = path.join(root, ...relative.split('/'));
  const parentBinding = bindPath(root, parentRelative, `${label} parent`, false);
  const privateDirectoryName = options.testing?.privateDirectoryName
    ?? `.docs-tooling-stage-control-${process.pid}-${randomUUID()}`;
  if (privateDirectoryName.length === 0 || privateDirectoryName === '.' || privateDirectoryName === '..'
    || path.basename(privateDirectoryName) !== privateDirectoryName || privateDirectoryName.includes('\0')) {
    throw new Error(`${label} private temporary directory name is unsafe`);
  }
  const privateDirectory = path.join(parent, privateDirectoryName);
  const temporary = path.join(privateDirectory, 'payload');
  let destinationIdentity: PathIdentity | null = null;
  let privateDirectoryOwned = false;
  let privateDirectoryIdentity: PathIdentity | null = null;
  let temporaryIdentity: PathIdentity | null = null;

  function revalidateDestination(): void {
    if (destinationIdentity) {
      if (!pathEntryExists(target) || !sameIdentity(identityOf(target, label), destinationIdentity)) {
        throw new Error(`${label} replacement target identity changed before replacement`);
      }
    } else if (pathEntryExists(target)) {
      throw new Error(`${label} replacement target appeared before replacement`);
    }
  }

  try {
    revalidate(parentBinding, `${label} parent`);
    if (pathEntryExists(target)) {
      if (!options.replace) throw new Error(`${label} already exists: ${relative}`);
      destinationIdentity = identityOf(target, label);
      if (destinationIdentity.kind !== 'file') throw new Error(`${label} replacement target must be a regular file`);
      revalidate(parentBinding, `${label} parent`);
      revalidateDestination();
    }
    options.testing?.beforeRename?.(target);

    revalidate(parentBinding, `${label} parent`);
    revalidateDestination();
    mkdirSync(privateDirectory, {mode: 0o700});
    privateDirectoryIdentity = identityOf(privateDirectory, `${label} private temporary directory`);
    if (privateDirectoryIdentity.kind !== 'directory') throw new Error(`${label} private temporary path must be a directory`);
    privateDirectoryOwned = true;
    setDirectoryMode(privateDirectory, `${label} private temporary directory`, 0o700);
    options.testing?.afterPrivateDirectoryCreate?.(privateDirectory);

    revalidate(parentBinding, `${label} parent`);
    if (!sameNode(identityOf(privateDirectory, `${label} private temporary directory`), privateDirectoryIdentity)) {
      throw new Error(`${label} private temporary directory identity changed before replacement`);
    }
    revalidateDestination();
    const descriptor = openSync(
      temporary,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      options.mode ?? 0o600,
    );
    try {
      const opened = fstatSync(descriptor);
      if (!opened.isFile() || opened.nlink !== 1) throw new Error(`${label} temporary path must be a regular file`);
      temporaryIdentity = {
        dev: opened.dev,
        ino: opened.ino,
        kind: 'file',
        mode: opened.mode,
        nlink: opened.nlink,
      };
      options.testing?.afterTemporaryOpen?.(temporary);
      writeFileSync(descriptor, contents);
      if (options.mode !== undefined) fchmodSync(descriptor, options.mode);
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }

    revalidate(parentBinding, `${label} parent`);
    if (!sameNode(identityOf(privateDirectory, `${label} private temporary directory`), privateDirectoryIdentity)) {
      throw new Error(`${label} private temporary directory identity changed before replacement`);
    }
    revalidateDestination();
    if (!sameNode(identityOf(temporary, `${label} temporary file`), temporaryIdentity)) {
      throw new Error(`${label} temporary file identity changed before replacement`);
    }
    renameSync(temporary, target);
    revalidate(parentBinding, `${label} parent`);
    options.testing?.beforeParentFsync?.(parent);
    fsyncDirectory(parent);
    options.testing?.afterRename?.(target);
    cleanupPrivateDirectory(parentBinding, privateDirectory, privateDirectoryIdentity, `${label} private temporary directory`);
    privateDirectoryOwned = false;
    return target;
  } catch (error) {
    if (privateDirectoryOwned && privateDirectoryIdentity) {
      cleanupPrivateDirectory(parentBinding, privateDirectory, privateDirectoryIdentity, `${label} private temporary directory`);
      privateDirectoryOwned = false;
    }
    throw error;
  }
}

/** The caller must hold the stable site/group fence for the full existence-check and install sequence. */
export function writeSecureFencedImmutableFile(
  repositoryRoot: string,
  pathInput: string,
  contents: string | Buffer,
  label: string,
  mode = 0o600,
  options: Readonly<{
    testing?: Readonly<{
      afterRename?: (target: string) => void;
      beforeRename?: (target: string) => void;
      beforeParentFsync?: (parent: string) => void;
    }>;
  }> = {},
): string {
  return writeSecureAtomicFile(repositoryRoot, pathInput, contents, label, {
    mode,
    testing: options.testing,
  });
}

export function confirmSecureFileDurability(
  repositoryRoot: string,
  pathInput: string,
  label: string,
  testing?: Readonly<{beforeParentFsync?: (parent: string) => void}>,
): void {
  const target = resolveSecureRepositoryPath(repositoryRoot, pathInput, label, {finalKind: 'file'});
  const root = canonicalRoot(repositoryRoot, label);
  const relative = relativePath(root, target, label, repositoryRoot);
  const parentRelative = path.posix.dirname(relative);
  const parent = path.dirname(target);
  const parentBinding = bindPath(root, parentRelative, `${label} parent`, false);
  revalidate(parentBinding, `${label} parent`);
  testing?.beforeParentFsync?.(parent);
  fsyncDirectory(parent);
  revalidate(parentBinding, `${label} parent`);
  resolveSecureRepositoryPath(repositoryRoot, target, label, {finalKind: 'file'});
}

function cleanupPrivateDirectory(
  parentBinding: readonly BoundPath[],
  privateDirectory: string,
  expectedIdentity: PathIdentity,
  label: string,
): void {
  revalidate(parentBinding, `${label} parent`);
  if (!pathEntryExists(privateDirectory)) return;
  const stats = lstatSync(privateDirectory);
  if (stats.isSymbolicLink()) {
    unlinkSync(privateDirectory);
  } else {
    if (!stats.isDirectory()) throw new Error(`${label} cleanup target must be a directory`);
    if (!sameNode(identityOf(privateDirectory, label), expectedIdentity)) {
      throw new Error(`${label} identity changed before cleanup`);
    }
    rmSync(privateDirectory, {recursive: true, force: false});
  }
  revalidate(parentBinding, `${label} parent`);
}

function setDirectoryMode(target: string, label: string, mode: number): void {
  const before = identityOf(target, label);
  if (before.kind !== 'directory') throw new Error(`${label} must be a directory`);
  const descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isDirectory() || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`${label} identity changed while opening`);
    }
    fchmodSync(descriptor, mode);
  } finally {
    closeSync(descriptor);
  }
  if (!sameNode(identityOf(target, label), before)) throw new Error(`${label} identity changed while setting its mode`);
}

function captureBoundTree(root: string, label: string, relative = '.'): readonly BoundTreeEntry[] {
  const target = relative === '.' ? root : path.join(root, ...relative.split('/'));
  const identity = identityOf(target, label);
  const entries: BoundTreeEntry[] = [{relative, identity}];
  if (identity.kind === 'directory') {
    for (const name of readdirSync(target).sort((left, right) => left.localeCompare(right, 'en'))) {
      entries.push(...captureBoundTree(root, label, relative === '.' ? name : path.posix.join(relative, name)));
    }
    if (!sameIdentity(identityOf(target, label), identity)) throw new Error(`${label} directory identity changed while binding: ${target}`);
  }
  return entries;
}

function assertBoundTree(root: string, expected: readonly BoundTreeEntry[], label: string): void {
  const current = captureBoundTree(root, label);
  if (current.length !== expected.length) throw new Error(`${label} identity changed before recursive removal`);
  for (let index = 0; index < expected.length; index += 1) {
    if (current[index].relative !== expected[index].relative || !sameIdentity(current[index].identity, expected[index].identity)) {
      throw new Error(`${label} identity changed before recursive removal`);
    }
  }
}

function sameRemovalIdentity(current: PathIdentity, expected: PathIdentity): boolean {
  if (sameIdentity(current, expected)) return true;
  // A failed authenticated walk may leave a surviving directory at the one tool-controlled
  // mode used to make child unlink/rmdir operations possible. Its node identity must still match.
  return expected.kind === 'directory' && sameNode(current, expected) && (current.mode & 0o777) === 0o700;
}

function assertBoundTreeSubset(root: string, expected: readonly BoundTreeEntry[], label: string): void {
  const expectedByRelative = new Map(expected.map(entry => [entry.relative, entry.identity]));
  for (const current of captureBoundTree(root, label)) {
    const expectedIdentity = expectedByRelative.get(current.relative);
    if (!expectedIdentity || !sameRemovalIdentity(current.identity, expectedIdentity)) {
      throw new Error(`${label} contains an added or replaced entry outside the authenticated removal tree`);
    }
  }
}

type RemovalWalkTesting = Readonly<{beforeBoundEntryRemoval?: (relative: string, target: string) => void}>;

function removeBoundTree(
  root: string,
  expected: ReadonlyMap<string, PathIdentity>,
  label: string,
  relative = '.',
  testing?: RemovalWalkTesting,
): void {
  const target = relative === '.' ? root : path.join(root, ...relative.split('/'));
  const identity = expected.get(relative);
  if (!identity || !sameRemovalIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed during recursive removal`);
  if (identity.kind === 'file') {
    testing?.beforeBoundEntryRemoval?.(relative, target);
    unlinkSync(target);
    return;
  }
  if ((identityOf(target, label).mode & 0o777) !== 0o700) {
    if (!sameIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed before making directory writable`);
    setDirectoryMode(target, `${label} writable directory`, 0o700);
  }
  for (const name of readdirSync(target).sort((left, right) => left.localeCompare(right, 'en'))) {
    removeBoundTree(root, expected, label, relative === '.' ? name : path.posix.join(relative, name), testing);
  }
  if (!sameRemovalIdentity(identityOf(target, label), identity)) throw new Error(`${label} identity changed during recursive removal`);
  testing?.beforeBoundEntryRemoval?.(relative, target);
  rmdirSync(target);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort((left, right) => left.localeCompare(right, 'en'));
  const expected = [...keys].sort((left, right) => left.localeCompare(right, 'en'));
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJournalIdentity(value: unknown, label: string): PathIdentity {
  if (!isRecord(value) || !hasExactKeys(value, ['dev', 'ino', 'kind', 'mode', 'nlink'])) {
    throw new Error(`${label} has an invalid identity record`);
  }
  if (!Number.isSafeInteger(value.dev) || (value.dev as number) < 0
    || !Number.isSafeInteger(value.ino) || (value.ino as number) < 0
    || (value.kind !== 'file' && value.kind !== 'directory')
    || !Number.isSafeInteger(value.mode) || (value.mode as number) < 0
    || !Number.isSafeInteger(value.nlink) || (value.nlink as number) < 1) {
    throw new Error(`${label} has invalid identity values`);
  }
  return {
    dev: value.dev as number,
    ino: value.ino as number,
    kind: value.kind,
    mode: value.mode as number,
    nlink: value.nlink as number,
  };
}

function removalJournalChecksum(payload: RemovalJournalPayload): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function removalJournalHmac(value: ChecksummedRemovalJournal, key: Buffer): string {
  return createHmac('sha256', key)
    .update(REMOVAL_JOURNAL_HMAC_DOMAIN)
    .update(JSON.stringify(value))
    .digest('hex');
}

type RecoveryHmacAuthority = Readonly<{key: Buffer; binding: readonly BoundPath[]}>;
type RecoveryBootstrapTesting = Readonly<{
  afterRecoveryControlFenceAcquired?: () => void;
  afterRecoveryControlFenceBootstrapDirectoryCreate?: (directory: string) => void;
  afterRecoveryControlFenceObservedStale?: () => void;
  afterRecoveryControlFenceQuarantineRename?: (quarantine: string) => void;
  afterRecoveryControlFenceStaleClaimAcquired?: () => void;
  afterRecoveryBootstrapDirectoryCreate?: (directory: string) => void;
  afterRecoveryBootstrapKeyPrepared?: (directory: string) => void;
  beforeRecoveryControlFenceRelease?: () => void;
  beforeRecoveryControlInstall?: () => void;
  duringRecoveryBootstrapKeyWrite?: (descriptor: number, key: Buffer) => void;
  preserveRecoveryBootstrapOnFailure?: boolean;
  preserveRecoveryControlFenceBootstrapOnFailure?: boolean;
}>;
type RecoveryControlFence = Readonly<{
  version: 2;
  kind: 'docs-tooling-recovery-control-fence';
  pid: number;
  token: string;
  checksum: string;
}>;
type ObservedRecoveryControlFence = Readonly<{
  directory: string;
  directoryIdentity: PathIdentity;
  owner: string;
  ownerIdentity: PathIdentity;
  record: RecoveryControlFence;
}>;
type RecoveryControlFenceClaim = Readonly<{
  version: 1;
  kind: 'docs-tooling-recovery-control-stale-claim';
  pid: number;
  token: string;
  directoryIdentity: PathIdentity;
  ownerIdentity: PathIdentity;
  ownerToken: string;
  ownerChecksum: string;
  checksum: string;
}>;

const RECOVERY_CONTROL_FENCE_OWNER = 'owner.json';
const RECOVERY_CONTROL_FENCE_CLAIM = 'stale-removal.claim';

function sleepSync(duration: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration);
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

function sameExactIdentity(left: PathIdentity, right: PathIdentity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.kind === right.kind
    && left.mode === right.mode && (left.kind === 'directory' || left.nlink === right.nlink);
}

function checksumRecord(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function readRecoveryControlFence(root: string, label: string): ObservedRecoveryControlFence {
  const directory = path.join(root, ...REMOVAL_CONTROL_FENCE.split('/'));
  const directoryIdentity = identityOf(directory, `${label} recovery control fence directory`);
  if (directoryIdentity.kind !== 'directory' || (directoryIdentity.mode & 0o777) !== 0o700) {
    throw new Error(`${label} recovery control fence must be a mode-0700 directory`);
  }
  const ownerRelative = path.posix.join(REMOVAL_CONTROL_FENCE, RECOVERY_CONTROL_FENCE_OWNER);
  const owner = path.join(root, ...ownerRelative.split('/'));
  if (!pathEntryExists(owner)) throw new Error(`${label} recovery control fence is missing its owned owner record`);
  const ownerIdentity = identityOf(owner, `${label} recovery control fence owner`);
  if (ownerIdentity.kind !== 'file' || (ownerIdentity.mode & 0o777) !== 0o600 || ownerIdentity.nlink !== 1) {
    throw new Error(`${label} recovery control fence owner must be a mode-0600 regular file with one link`);
  }
  const contents = readSecureFile(root, ownerRelative, `${label} recovery control fence owner`);
  if (contents.byteLength > 4096) throw new Error(`${label} recovery control fence exceeds the size limit`);
  let value: unknown;
  try {
    value = JSON.parse(contents.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} recovery control fence is malformed`, {cause: error});
  }
  if (!isRecord(value) || !hasExactKeys(value, ['version', 'kind', 'pid', 'token', 'checksum'])
    || value.version !== 2 || value.kind !== 'docs-tooling-recovery-control-fence'
    || !Number.isSafeInteger(value.pid) || (value.pid as number) < 1
    || typeof value.token !== 'string' || !/^[0-9]+-[0-9a-f-]{36}$/u.test(value.token)
    || typeof value.checksum !== 'string' || !/^[0-9a-f]{64}$/u.test(value.checksum)) {
    throw new Error(`${label} recovery control fence record is invalid`);
  }
  const payload = {version: 2 as const, kind: 'docs-tooling-recovery-control-fence' as const, pid: value.pid as number, token: value.token};
  if (checksumRecord(payload) !== value.checksum) throw new Error(`${label} recovery control fence checksum is invalid`);
  if (!sameExactIdentity(identityOf(directory, `${label} recovery control fence directory`), directoryIdentity)
    || !sameExactIdentity(identityOf(owner, `${label} recovery control fence owner`), ownerIdentity)) {
    throw new Error(`${label} recovery control fence identity changed while reading`);
  }
  return {directory, directoryIdentity, owner, ownerIdentity, record: {...payload, checksum: value.checksum}};
}

function parseRecoveryControlFenceClaim(contents: Buffer, label: string): RecoveryControlFenceClaim {
  if (contents.byteLength > 8192) throw new Error(`${label} recovery control fence claim exceeds the size limit`);
  let value: unknown;
  try {
    value = JSON.parse(contents.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} recovery control fence claim is malformed`, {cause: error});
  }
  if (!isRecord(value) || !hasExactKeys(value, [
    'version', 'kind', 'pid', 'token', 'directoryIdentity', 'ownerIdentity', 'ownerToken', 'ownerChecksum', 'checksum',
  ]) || value.version !== 1 || value.kind !== 'docs-tooling-recovery-control-stale-claim'
    || !Number.isSafeInteger(value.pid) || (value.pid as number) < 1
    || typeof value.token !== 'string' || !/^[0-9]+-[0-9a-f-]{36}$/u.test(value.token)
    || typeof value.ownerToken !== 'string' || !/^[0-9]+-[0-9a-f-]{36}$/u.test(value.ownerToken)
    || typeof value.ownerChecksum !== 'string' || !/^[0-9a-f]{64}$/u.test(value.ownerChecksum)
    || typeof value.checksum !== 'string' || !/^[0-9a-f]{64}$/u.test(value.checksum)) {
    throw new Error(`${label} recovery control fence claim record is invalid`);
  }
  const payload = {
    version: 1 as const,
    kind: 'docs-tooling-recovery-control-stale-claim' as const,
    pid: value.pid as number,
    token: value.token,
    directoryIdentity: parseJournalIdentity(value.directoryIdentity, `${label} recovery control fence claim directory`),
    ownerIdentity: parseJournalIdentity(value.ownerIdentity, `${label} recovery control fence claim owner`),
    ownerToken: value.ownerToken,
    ownerChecksum: value.ownerChecksum,
  };
  if (checksumRecord(payload) !== value.checksum) throw new Error(`${label} recovery control fence claim checksum is invalid`);
  return {...payload, checksum: value.checksum};
}

function removeExactFile(target: string, expected: PathIdentity, label: string): void {
  if (!pathEntryExists(target) || !sameExactIdentity(identityOf(target, label), expected)) {
    throw new Error(`${label} identity changed before removal`);
  }
  unlinkSync(target);
}

function quarantineAndRemoveRecoveryControlFence(
  root: string,
  label: string,
  directory: string,
  directoryIdentity: PathIdentity,
  owner: Readonly<{path: string; identity: PathIdentity}> | undefined,
  claim: Readonly<{path: string; identity: PathIdentity}> | undefined,
  testing?: RecoveryBootstrapTesting,
): void {
  const parent = path.dirname(directory);
  const parentRelative = relativePath(root, parent, `${label} recovery control fence parent`, root);
  const parentBinding = bindPath(root, parentRelative, `${label} recovery control fence parent`, false);
  const quarantine = path.join(parent, `.stage-removal-control-bootstrap.quarantine-${process.pid}-${randomUUID()}`);
  const expectedEntries = [owner && path.basename(owner.path), claim && path.basename(claim.path)].filter((value): value is string => Boolean(value)).sort();
  revalidate(parentBinding, `${label} recovery control fence parent`);
  if (!sameExactIdentity(identityOf(directory, `${label} recovery control fence directory`), directoryIdentity)) {
    throw new Error(`${label} recovery control fence directory changed before quarantine`);
  }
  if (owner && !sameExactIdentity(identityOf(owner.path, `${label} recovery control fence owner`), owner.identity)) {
    throw new Error(`${label} recovery control fence owner changed before quarantine`);
  }
  if (claim && !sameExactIdentity(identityOf(claim.path, `${label} recovery control fence claim`), claim.identity)) {
    throw new Error(`${label} recovery control fence claim changed before quarantine`);
  }
  if (readdirSync(directory).sort().join('\0') !== expectedEntries.join('\0')) {
    throw new Error(`${label} recovery control fence contains unexpected entries`);
  }
  if (pathEntryExists(quarantine)) throw new Error(`${label} recovery control fence quarantine collision already exists`);
  renameSync(directory, quarantine);
  if (!sameExactIdentity(identityOf(quarantine, `${label} recovery control fence quarantine`), directoryIdentity)) {
    throw new Error(`${label} recovery control fence identity changed during quarantine`);
  }
  revalidate(parentBinding, `${label} recovery control fence parent`);
  fsyncDirectory(parent);
  testing?.afterRecoveryControlFenceQuarantineRename?.(quarantine);
  if (owner) removeExactFile(path.join(quarantine, path.basename(owner.path)), owner.identity, `${label} quarantined recovery control fence owner`);
  if (claim) removeExactFile(path.join(quarantine, path.basename(claim.path)), claim.identity, `${label} quarantined recovery control fence claim`);
  if (readdirSync(quarantine).length !== 0
    || !sameExactIdentity(identityOf(quarantine, `${label} recovery control fence quarantine`), directoryIdentity)) {
    throw new Error(`${label} recovery control fence quarantine changed before cleanup`);
  }
  rmdirSync(quarantine);
  fsyncDirectory(parent);
}

function recoverExistingFenceClaim(
  root: string,
  label: string,
  directory: string,
  directoryIdentity: PathIdentity,
  observed?: ObservedRecoveryControlFence,
): 'wait' | 'retry' {
  const claimRelative = path.posix.join(REMOVAL_CONTROL_FENCE, RECOVERY_CONTROL_FENCE_CLAIM);
  const claimPath = path.join(root, ...claimRelative.split('/'));
  const claimIdentity = identityOf(claimPath, `${label} recovery control fence claim`);
  if (claimIdentity.kind !== 'file' || (claimIdentity.mode & 0o777) !== 0o600 || claimIdentity.nlink !== 1) {
    throw new Error(`${label} recovery control fence claim must be a mode-0600 regular file with one link`);
  }
  const claim = parseRecoveryControlFenceClaim(readSecureFile(root, claimRelative, `${label} recovery control fence claim`), label);
  if (processIsAlive(claim.pid)) return 'wait';
  if (!sameExactIdentity(identityOf(directory, `${label} recovery control fence directory`), directoryIdentity)
    || !sameExactIdentity(directoryIdentity, claim.directoryIdentity)) {
    removeExactFile(claimPath, claimIdentity, `${label} mismatched recovery control fence claim`);
    fsyncDirectory(directory);
    return 'retry';
  }
  const owner = path.join(directory, RECOVERY_CONTROL_FENCE_OWNER);
  let ownedOwner: Readonly<{path: string; identity: PathIdentity}> | undefined;
  if (pathEntryExists(owner)) {
    if (!observed) observed = readRecoveryControlFence(root, label);
    if (!observed || !sameExactIdentity(observed.ownerIdentity, claim.ownerIdentity)
      || observed.record.token !== claim.ownerToken || observed.record.checksum !== claim.ownerChecksum) {
      throw new Error(`${label} claimed recovery control fence owner changed`);
    }
    ownedOwner = {path: observed.owner, identity: observed.ownerIdentity};
  }
  quarantineAndRemoveRecoveryControlFence(
    root,
    label,
    directory,
    directoryIdentity,
    ownedOwner,
    {path: claimPath, identity: claimIdentity},
  );
  return 'retry';
}

function claimAndRemoveStaleRecoveryControlFence(
  root: string,
  label: string,
  observed: ObservedRecoveryControlFence,
  testing?: RecoveryBootstrapTesting,
): 'wait' | 'retry' {
  const claimRelative = path.posix.join(REMOVAL_CONTROL_FENCE, RECOVERY_CONTROL_FENCE_CLAIM);
  const claimPath = path.join(root, ...claimRelative.split('/'));
  if (pathEntryExists(claimPath)) {
    return recoverExistingFenceClaim(root, label, observed.directory, observed.directoryIdentity, observed);
  }
  const payload = {
    version: 1 as const,
    kind: 'docs-tooling-recovery-control-stale-claim' as const,
    pid: process.pid,
    token: `${process.pid}-${randomUUID()}`,
    directoryIdentity: observed.directoryIdentity,
    ownerIdentity: observed.ownerIdentity,
    ownerToken: observed.record.token,
    ownerChecksum: observed.record.checksum,
  };
  const record: RecoveryControlFenceClaim = {...payload, checksum: checksumRecord(payload)};
  const claimDirectoryIdentity = identityOf(observed.directory, `${label} recovery control fence claim directory`);
  let claimIdentity: PathIdentity | undefined;
  try {
    const descriptor = openSync(claimPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
    try {
      const opened = fstatSync(descriptor);
      if (!opened.isFile() || opened.nlink !== 1) throw new Error(`${label} recovery control fence claim must be a regular file`);
      writeFileSync(descriptor, `${JSON.stringify(record)}\n`);
      fchmodSync(descriptor, 0o600);
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    claimIdentity = identityOf(claimPath, `${label} recovery control fence claim`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return 'retry';
    throw error;
  }
  fsyncDirectory(path.dirname(claimPath));
  testing?.afterRecoveryControlFenceStaleClaimAcquired?.();
  if (!sameExactIdentity(identityOf(observed.directory, `${label} recovery control fence claim directory`), claimDirectoryIdentity)
    || !sameExactIdentity(claimDirectoryIdentity, observed.directoryIdentity)) {
    removeExactFile(claimPath, claimIdentity, `${label} replacement recovery control fence claim`);
    fsyncDirectory(observed.directory);
    return 'retry';
  }
  const current = readRecoveryControlFence(root, label);
  if (!current || !sameExactIdentity(current.ownerIdentity, observed.ownerIdentity)
    || current.record.token !== observed.record.token || current.record.checksum !== observed.record.checksum) {
    removeExactFile(claimPath, claimIdentity, `${label} changed recovery control fence claim`);
    fsyncDirectory(observed.directory);
    return 'retry';
  }
  quarantineAndRemoveRecoveryControlFence(
    root,
    label,
    observed.directory,
    observed.directoryIdentity,
    {path: current.owner, identity: current.ownerIdentity},
    {path: claimPath, identity: claimIdentity},
    testing,
  );
  return 'retry';
}

function acquireRecoveryControlFence(root: string, label: string, testing?: RecoveryBootstrapTesting): Readonly<{
  observed: ObservedRecoveryControlFence;
}> {
  const parentRelative = path.posix.dirname(REMOVAL_CONTROL_FENCE);
  const parent = ensureSecureDirectory(root, parentRelative, `${label} recovery control fence parent`);
  const parentBinding = bindPath(root, parentRelative, `${label} recovery control fence parent`, false);
  const target = path.join(root, ...REMOVAL_CONTROL_FENCE.split('/'));
  const deadline = Date.now() + REMOVAL_CONTROL_FENCE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    revalidate(parentBinding, `${label} recovery control fence parent`);
    if (pathEntryExists(target)) {
      const owner = path.join(target, RECOVERY_CONTROL_FENCE_OWNER);
      const claim = path.join(target, RECOVERY_CONTROL_FENCE_CLAIM);
      if (!pathEntryExists(owner) && pathEntryExists(claim)) {
        recoverExistingFenceClaim(root, label, target, identityOf(target, `${label} recovery control fence directory`));
        continue;
      }
      const current = readRecoveryControlFence(root, label);
      if (current.record.pid === process.pid) throw new Error(`${label} recovery control fence is not reentrant`);
      if (processIsAlive(current.record.pid)) {
        sleepSync(REMOVAL_CONTROL_FENCE_POLL_MS);
        continue;
      }
      testing?.afterRecoveryControlFenceObservedStale?.();
      if (claimAndRemoveStaleRecoveryControlFence(root, label, current, testing) === 'wait') {
        sleepSync(REMOVAL_CONTROL_FENCE_POLL_MS);
      }
      continue;
    }
    const payload = {version: 2 as const, kind: 'docs-tooling-recovery-control-fence' as const, pid: process.pid, token: `${process.pid}-${randomUUID()}`};
    const record: RecoveryControlFence = {...payload, checksum: checksumRecord(payload)};
    const bootstrap = path.join(parent, `.stage-removal-control-bootstrap.pending-${process.pid}-${randomUUID()}`);
    const owner = path.join(bootstrap, RECOVERY_CONTROL_FENCE_OWNER);
    let directoryIdentity: PathIdentity | undefined;
    let ownerIdentity: PathIdentity | undefined;
    let bootstrapOwned = false;
    try {
      mkdirSync(bootstrap, {mode: 0o700});
      bootstrapOwned = true;
      setDirectoryMode(bootstrap, `${label} recovery control fence bootstrap`, 0o700);
      directoryIdentity = identityOf(bootstrap, `${label} recovery control fence bootstrap`);
      testing?.afterRecoveryControlFenceBootstrapDirectoryCreate?.(bootstrap);
      const descriptor = openSync(owner, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
      try {
        const opened = fstatSync(descriptor);
        if (!opened.isFile() || opened.nlink !== 1) throw new Error(`${label} recovery control fence owner must be a regular file`);
        writeFileSync(descriptor, `${JSON.stringify(record)}\n`);
        fchmodSync(descriptor, 0o600);
        fsyncSync(descriptor);
      } finally {
        closeSync(descriptor);
      }
      ownerIdentity = identityOf(owner, `${label} recovery control fence owner`);
      fsyncDirectory(bootstrap);
      revalidate(parentBinding, `${label} recovery control fence parent`);
      if (!sameExactIdentity(identityOf(bootstrap, `${label} recovery control fence bootstrap`), directoryIdentity)
        || !sameExactIdentity(identityOf(owner, `${label} recovery control fence owner`), ownerIdentity)) {
        throw new Error(`${label} recovery control fence bootstrap identity changed before install`);
      }
      if (pathEntryExists(target)) {
        cleanupPrivateDirectory(parentBinding, bootstrap, directoryIdentity, `${label} recovery control fence bootstrap`);
        bootstrapOwned = false;
        fsyncDirectory(parent);
        continue;
      }
      try {
        renameSync(bootstrap, target);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if ((code === 'EEXIST' || code === 'ENOTEMPTY') && pathEntryExists(target)) {
          cleanupPrivateDirectory(parentBinding, bootstrap, directoryIdentity, `${label} recovery control fence bootstrap`);
          bootstrapOwned = false;
          fsyncDirectory(parent);
          continue;
        }
        throw error;
      }
      bootstrapOwned = false;
      // Supported contenders only publish complete non-empty directories, so the last absence check
      // plus this rename serializes them. Hostile same-UID check-to-rename mutation remains out of scope.
      revalidate(parentBinding, `${label} recovery control fence parent`);
      fsyncDirectory(parent);
      const observed = readRecoveryControlFence(root, label);
      if (!sameExactIdentity(observed.directoryIdentity, directoryIdentity)
        || !sameExactIdentity(observed.ownerIdentity, ownerIdentity)
        || observed.record.token !== record.token || observed.record.checksum !== record.checksum) {
        throw new Error(`${label} recovery control fence identity changed during acquisition`);
      }
      return {observed};
    } catch (error) {
      if (bootstrapOwned && directoryIdentity && !testing?.preserveRecoveryControlFenceBootstrapOnFailure) {
        cleanupPrivateDirectory(parentBinding, bootstrap, directoryIdentity, `${label} recovery control fence bootstrap`);
        fsyncDirectory(parent);
      }
      throw error;
    }
  }
  throw new Error(`${label} timed out waiting for the recovery control fence`);
}

function releaseRecoveryControlFence(root: string, label: string, owned: Readonly<{observed: ObservedRecoveryControlFence}>): void {
  const claimPath = path.join(owned.observed.directory, RECOVERY_CONTROL_FENCE_CLAIM);
  while (pathEntryExists(claimPath)) {
    const claimIdentity = identityOf(claimPath, `${label} recovery control fence claim`);
    const claim = parseRecoveryControlFenceClaim(
      readSecureFile(root, path.posix.join(REMOVAL_CONTROL_FENCE, RECOVERY_CONTROL_FENCE_CLAIM), `${label} recovery control fence claim`),
      label,
    );
    if (processIsAlive(claim.pid)) sleepSync(REMOVAL_CONTROL_FENCE_POLL_MS);
    else {
      removeExactFile(claimPath, claimIdentity, `${label} abandoned recovery control fence claim`);
      fsyncDirectory(owned.observed.directory);
    }
  }
  const current = readRecoveryControlFence(root, label);
  if (!current || current.record.pid !== owned.observed.record.pid || current.record.token !== owned.observed.record.token
    || current.record.checksum !== owned.observed.record.checksum
    || !sameExactIdentity(current.directoryIdentity, owned.observed.directoryIdentity)
    || !sameExactIdentity(current.ownerIdentity, owned.observed.ownerIdentity)) {
    throw new Error(`${label} recovery control fence identity changed before release`);
  }
  quarantineAndRemoveRecoveryControlFence(
    root,
    label,
    current.directory,
    current.directoryIdentity,
    {path: current.owner, identity: current.ownerIdentity},
    undefined,
  );
}

function readPersistedRecoveryHmacAuthority(root: string, label: string): RecoveryHmacAuthority {
  const controlDirectory = path.join(root, ...REMOVAL_CONTROL_DIRECTORY.split('/'));
  const keyPath = path.join(root, ...REMOVAL_CONTROL_KEY.split('/'));
  const controlIdentity = identityOf(controlDirectory, `${label} recovery control directory`);
  if (controlIdentity.kind !== 'directory' || (controlIdentity.mode & 0o777) !== 0o700) {
    throw new Error(`${label} recovery control directory must be a mode-0700 directory`);
  }
  if (!pathEntryExists(keyPath)) throw new Error(`${label} recovery key collision is missing the owned key`);
  const keyIdentity = identityOf(keyPath, `${label} recovery key`);
  if (keyIdentity.kind !== 'file' || (keyIdentity.mode & 0o777) !== 0o600 || keyIdentity.nlink !== 1) {
    throw new Error(`${label} recovery key must be a mode-0600 regular file with one link`);
  }
  const key = readSecureFile(root, REMOVAL_CONTROL_KEY, `${label} recovery key`);
  if (key.byteLength !== 32) throw new Error(`${label} recovery key must contain exactly 32 bytes`);
  const binding = bindPath(root, REMOVAL_CONTROL_KEY, `${label} recovery authority`, false);
  revalidate(binding, `${label} recovery authority`);
  return {key, binding};
}

/**
 * The persistent key prevents repository-content forgery of recovery authority. Its first successful
 * exclusive creation is a trust-on-first-use boundary; later uses require the exact private path shape.
 * Theft or replacement of this mode-0600 key by a hostile process already running as the same OS user
 * is outside this helper's threat model.
 */
function recoveryHmacAuthorityUnfenced(
  root: string,
  label: string,
  testing?: RecoveryBootstrapTesting,
): RecoveryHmacAuthority {
  const controlParentRelative = path.posix.dirname(REMOVAL_CONTROL_DIRECTORY);
  const controlParent = ensureSecureDirectory(root, controlParentRelative, `${label} recovery control parent`);
  const parentBinding = bindPath(root, controlParentRelative, `${label} recovery control parent`, false);
  const controlDirectory = path.join(root, ...REMOVAL_CONTROL_DIRECTORY.split('/'));
  if (pathEntryExists(controlDirectory)) return readPersistedRecoveryHmacAuthority(root, label);

  const bootstrapDirectory = path.join(
    controlParent,
    `.stage-removal-control.bootstrap-${process.pid}-${randomUUID()}`,
  );
  const bootstrapKey = path.join(bootstrapDirectory, path.posix.basename(REMOVAL_CONTROL_KEY));
  let bootstrapIdentity: PathIdentity | null = null;
  let bootstrapKeyIdentity: PathIdentity | null = null;
  let bootstrapOwned = false;

  try {
    revalidate(parentBinding, `${label} recovery control parent`);
    if (pathEntryExists(controlDirectory)) return readPersistedRecoveryHmacAuthority(root, label);
    mkdirSync(bootstrapDirectory, {mode: 0o700});
    bootstrapIdentity = identityOf(bootstrapDirectory, `${label} recovery bootstrap directory`);
    if (bootstrapIdentity.kind !== 'directory') throw new Error(`${label} recovery bootstrap must be a directory`);
    bootstrapOwned = true;
    setDirectoryMode(bootstrapDirectory, `${label} recovery bootstrap directory`, 0o700);
    if ((identityOf(bootstrapDirectory, `${label} recovery bootstrap directory`).mode & 0o777) !== 0o700) {
      throw new Error(`${label} recovery bootstrap directory must use mode 0700`);
    }
    testing?.afterRecoveryBootstrapDirectoryCreate?.(bootstrapDirectory);

    revalidate(parentBinding, `${label} recovery control parent`);
    if (!sameNode(identityOf(bootstrapDirectory, `${label} recovery bootstrap directory`), bootstrapIdentity)) {
      throw new Error(`${label} recovery bootstrap directory identity changed before key creation`);
    }

    const key = randomBytes(32);
    const descriptor = openSync(
      bootstrapKey,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      0o600,
    );
    try {
      const opened = fstatSync(descriptor);
      if (!opened.isFile() || opened.nlink !== 1) throw new Error(`${label} recovery key must be a private regular file`);
      bootstrapKeyIdentity = {
        dev: opened.dev,
        ino: opened.ino,
        kind: 'file',
        mode: opened.mode,
        nlink: opened.nlink,
      };
      if (testing?.duringRecoveryBootstrapKeyWrite) testing.duringRecoveryBootstrapKeyWrite(descriptor, key);
      else writeFileSync(descriptor, key);
      fchmodSync(descriptor, 0o600);
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    const keyIdentity = identityOf(bootstrapKey, `${label} recovery bootstrap key`);
    if (keyIdentity.kind !== 'file' || (keyIdentity.mode & 0o777) !== 0o600 || keyIdentity.nlink !== 1) {
      throw new Error(`${label} recovery key must use mode 0600 and have one link`);
    }
    if (!sameNode(keyIdentity, bootstrapKeyIdentity)) throw new Error(`${label} recovery bootstrap key identity changed`);
    fsyncDirectory(bootstrapDirectory);
    testing?.afterRecoveryBootstrapKeyPrepared?.(bootstrapDirectory);

    revalidate(parentBinding, `${label} recovery control parent`);
    if (!sameNode(identityOf(bootstrapDirectory, `${label} recovery bootstrap directory`), bootstrapIdentity)
      || !sameNode(identityOf(bootstrapKey, `${label} recovery bootstrap key`), bootstrapKeyIdentity)) {
      throw new Error(`${label} recovery bootstrap identity changed before install`);
    }
    testing?.beforeRecoveryControlInstall?.();
    // Node has no portable rename-with-NOREPLACE for directories. This final check plus the stable
    // repository-wide recovery-control fence serializes supported publishers. A hostile same-UID
    // mutation in the remaining check-to-rename syscall gap is outside this helper's threat model.
    if (pathEntryExists(controlDirectory)) {
      cleanupPrivateDirectory(parentBinding, bootstrapDirectory, bootstrapIdentity, `${label} recovery bootstrap directory`);
      bootstrapOwned = false;
      fsyncDirectory(controlParent);
      return readPersistedRecoveryHmacAuthority(root, label);
    }
    try {
      renameSync(bootstrapDirectory, controlDirectory);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if ((code === 'EEXIST' || code === 'ENOTEMPTY') && pathEntryExists(controlDirectory)) {
        cleanupPrivateDirectory(parentBinding, bootstrapDirectory, bootstrapIdentity, `${label} recovery bootstrap directory`);
        bootstrapOwned = false;
        fsyncDirectory(controlParent);
        return readPersistedRecoveryHmacAuthority(root, label);
      }
      throw error;
    }
    bootstrapOwned = false;
    revalidate(parentBinding, `${label} recovery control parent`);
    fsyncDirectory(controlParent);
    if (!sameNode(identityOf(controlDirectory, `${label} recovery control directory`), bootstrapIdentity)) {
      throw new Error(`${label} recovery control directory identity changed during install`);
    }
    const installedKey = path.join(controlDirectory, path.basename(bootstrapKey));
    if (!sameNode(identityOf(installedKey, `${label} recovery key`), bootstrapKeyIdentity)) {
      throw new Error(`${label} recovery key identity changed during install`);
    }
  } catch (error) {
    if (bootstrapOwned && bootstrapIdentity && !testing?.preserveRecoveryBootstrapOnFailure) {
      cleanupPrivateDirectory(parentBinding, bootstrapDirectory, bootstrapIdentity, `${label} recovery bootstrap directory`);
      fsyncDirectory(controlParent);
    }
    throw error;
  }
  return readPersistedRecoveryHmacAuthority(root, label);
}

function recoveryHmacAuthority(
  root: string,
  label: string,
  testing?: RecoveryBootstrapTesting,
): RecoveryHmacAuthority {
  const ownedFence = acquireRecoveryControlFence(root, label, testing);
  try {
    testing?.afterRecoveryControlFenceAcquired?.();
    return recoveryHmacAuthorityUnfenced(root, label, testing);
  } finally {
    try {
      testing?.beforeRecoveryControlFenceRelease?.();
    } finally {
      releaseRecoveryControlFence(root, label, ownedFence);
    }
  }
}

function removalJournalRelative(relative: string): string {
  const name = `${createHash('sha256').update(relative).digest('hex')}.json`;
  return path.posix.join(REMOVAL_JOURNAL_DIRECTORY, name);
}

function parseRemovalJournal(contents: Buffer, root: string, relative: string, label: string, key: Buffer): RemovalJournal {
  let value: unknown;
  try {
    value = JSON.parse(contents.toString('utf8'));
  } catch (error) {
    throw new Error(`${label} recovery journal is malformed JSON`, {cause: error});
  }
  if (!isRecord(value) || !hasExactKeys(value, [
    'version', 'kind', 'repositoryRoot', 'repositoryIdentity', 'relative', 'quarantineRelative', 'treeBinding', 'checksum', 'hmac',
  ])) {
    throw new Error(`${label} recovery journal authentication schema is invalid`);
  }
  if (value.version !== 2 || value.kind !== 'docs-tooling-stage-removal'
    || typeof value.repositoryRoot !== 'string' || typeof value.relative !== 'string'
    || typeof value.quarantineRelative !== 'string' || typeof value.checksum !== 'string'
    || typeof value.hmac !== 'string'
    || !Array.isArray(value.treeBinding) || value.treeBinding.length === 0) {
    throw new Error(`${label} recovery journal has invalid values`);
  }
  const repositoryIdentity = parseJournalIdentity(value.repositoryIdentity, `${label} recovery journal repository`);
  const treeBinding = value.treeBinding.map((entry, index): BoundTreeEntry => {
    if (!isRecord(entry) || !hasExactKeys(entry, ['relative', 'identity']) || typeof entry.relative !== 'string') {
      throw new Error(`${label} recovery journal has an invalid tree entry`);
    }
    const entryRelative = entry.relative === '.'
      ? '.'
      : assertSafeRepositoryRelativePath(entry.relative, `${label} recovery tree entry`);
    return {relative: entryRelative, identity: parseJournalIdentity(entry.identity, `${label} recovery tree entry ${index}`)};
  });
  if (treeBinding[0].relative !== '.' || new Set(treeBinding.map(entry => entry.relative)).size !== treeBinding.length) {
    throw new Error(`${label} recovery journal tree binding is invalid`);
  }
  const payload: RemovalJournalPayload = {
    version: 2,
    kind: 'docs-tooling-stage-removal',
    repositoryRoot: value.repositoryRoot,
    repositoryIdentity,
    relative: value.relative,
    quarantineRelative: value.quarantineRelative,
    treeBinding,
  };
  if (payload.repositoryRoot !== root || payload.relative !== relative
    || payload.relative !== assertSafeRepositoryRelativePath(payload.relative, `${label} recovery target`)) {
    throw new Error(`${label} recovery journal does not match the requested repository target`);
  }
  const quarantineRelative = assertSafeRepositoryRelativePath(payload.quarantineRelative, `${label} recovery quarantine`);
  if (path.posix.dirname(quarantineRelative) !== path.posix.dirname(relative)
    || path.posix.basename(quarantineRelative) === path.posix.basename(relative)) {
    throw new Error(`${label} recovery journal quarantine is outside the target parent`);
  }
  if (!/^[a-f0-9]{64}$/.test(value.checksum) || removalJournalChecksum(payload) !== value.checksum) {
    throw new Error(`${label} recovery journal checksum is invalid`);
  }
  const checksummed: ChecksummedRemovalJournal = {...payload, checksum: value.checksum};
  const expectedHmac = removalJournalHmac(checksummed, key);
  if (!/^[a-f0-9]{64}$/.test(value.hmac)
    || !timingSafeEqual(Buffer.from(value.hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
    throw new Error(`${label} recovery journal HMAC authentication is invalid`);
  }
  return {...checksummed, hmac: value.hmac};
}

function removeSecureFile(repositoryRoot: string, relative: string, label: string): void {
  const root = canonicalRoot(repositoryRoot, label);
  const target = resolveSecureRepositoryPath(root, relative, label, {finalKind: 'file'});
  const parentRelative = path.posix.dirname(relative);
  const parent = path.dirname(target);
  const parentBinding = bindPath(root, parentRelative, `${label} parent`, false);
  const expected = identityOf(target, label);
  if (expected.kind !== 'file') throw new Error(`${label} must be a regular file`);
  const descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || opened.dev !== expected.dev || opened.ino !== expected.ino || opened.nlink !== 1) {
      throw new Error(`${label} identity changed while opening`);
    }
  } finally {
    closeSync(descriptor);
  }
  revalidate(parentBinding, `${label} parent`);
  if (!sameIdentity(identityOf(target, label), expected)) throw new Error(`${label} identity changed before removal`);
  unlinkSync(target);
  revalidate(parentBinding, `${label} parent`);
  fsyncDirectory(parent);
}

function recoverPersistentRemovalDebris(
  root: string,
  relative: string,
  label: string,
  testing?: RecoveryBootstrapTesting,
): void {
  const authority = recoveryHmacAuthority(root, label, testing);
  const journalDirectory = ensureSecureDirectory(root, REMOVAL_JOURNAL_DIRECTORY, `${label} recovery journal directory`);
  const journalDirectoryIdentity = identityOf(journalDirectory, `${label} recovery journal directory`);
  if (journalDirectoryIdentity.kind !== 'directory' || (journalDirectoryIdentity.mode & 0o777) !== 0o700) {
    throw new Error(`${label} recovery journal directory must be a mode-0700 directory`);
  }
  const journalRelative = removalJournalRelative(relative);
  const journal = path.join(root, ...journalRelative.split('/'));
  if (!pathEntryExists(journal)) return;
  const record = parseRemovalJournal(
    readSecureFile(root, journalRelative, `${label} recovery journal`),
    root,
    relative,
    label,
    authority.key,
  );
  revalidate(authority.binding, `${label} recovery authority`);
  if (!sameIdentity(identityOf(root, `${label} recovery repository root`), record.repositoryIdentity)) {
    throw new Error(`${label} recovery journal repository identity changed`);
  }
  const quarantine = resolveSecureRepositoryPath(root, record.quarantineRelative, `${label} recovery quarantine`, {allowMissing: true});
  const target = resolveSecureRepositoryPath(root, relative, `${label} recovery target`, {allowMissing: true});
  const quarantineExists = pathEntryExists(quarantine);
  const targetExists = pathEntryExists(target);
  if (quarantineExists && targetExists) throw new Error(`${label} recovery target and quarantine both exist`);
  if (quarantineExists) {
    const parentRelative = path.posix.dirname(relative);
    const parent = path.dirname(quarantine);
    const parentBinding = bindPath(root, parentRelative, `${label} recovery parent`, false);
    revalidate(parentBinding, `${label} recovery parent`);
    revalidate(authority.binding, `${label} recovery authority`);
    assertBoundTreeSubset(quarantine, record.treeBinding, `${label} recovery`);
    removeBoundTree(
      quarantine,
      new Map(record.treeBinding.map(entry => [entry.relative, entry.identity])),
      `${label} recovery`,
    );
    revalidate(parentBinding, `${label} recovery parent`);
    fsyncDirectory(parent);
  } else if (targetExists) {
    assertBoundTree(target, record.treeBinding, `${label} recovery target`);
  }
  removeSecureFile(root, journalRelative, `${label} recovery journal`);
  if (readdirSync(journalDirectory).length === 0) fsyncDirectory(journalDirectory);
}

export function removeSecureStageTree(
  repositoryRoot: string,
  pathInput: string,
  label: string,
  options: Readonly<{
    testing?: Readonly<{
      afterQuarantineRename?: (quarantine: string) => void;
      afterRecoveryControlFenceAcquired?: () => void;
      afterRecoveryControlFenceBootstrapDirectoryCreate?: (directory: string) => void;
      afterRecoveryControlFenceObservedStale?: () => void;
      afterRecoveryControlFenceQuarantineRename?: (quarantine: string) => void;
      afterRecoveryControlFenceStaleClaimAcquired?: () => void;
      afterRecoveryBootstrapDirectoryCreate?: (directory: string) => void;
      afterRecoveryBootstrapKeyPrepared?: (directory: string) => void;
      beforeBoundEntryRemoval?: (relative: string, target: string) => void;
      beforeRecoveryControlFenceRelease?: () => void;
      beforeRecoveryControlInstall?: () => void;
      duringRecoveryBootstrapKeyWrite?: (descriptor: number, key: Buffer) => void;
      preserveRecoveryBootstrapOnFailure?: boolean;
      preserveRecoveryControlFenceBootstrapOnFailure?: boolean;
      quarantineName?: string;
    }>;
  }> = {},
): void {
  const root = canonicalRoot(repositoryRoot, label);
  const relative = relativePath(root, pathInput, label, repositoryRoot);
  recoverPersistentRemovalDebris(root, relative, label, options.testing);
  const target = resolveSecureRepositoryPath(root, relative, label, {allowMissing: true});
  if (!pathEntryExists(target)) return;
  const targetIdentity = identityOf(target, label);
  if (targetIdentity.kind !== 'directory') throw new Error(`${label} must be a directory before recursive removal`);
  const treeBinding = captureBoundTree(target, label);
  const parentRelative = path.posix.dirname(relative);
  const parent = resolveSecureRepositoryPath(root, parentRelative, `${label} parent`, {finalKind: 'directory'});
  const parentBinding = bindPath(root, parentRelative, `${label} parent`, false);
  const quarantineName = options.testing?.quarantineName ?? `.${path.basename(target)}.remove-${process.pid}-${randomUUID()}`;
  if (!quarantineName || quarantineName === '.' || quarantineName === '..' || path.basename(quarantineName) !== quarantineName || quarantineName.includes('\0')) {
    throw new Error(`${label} quarantine name is unsafe`);
  }
  const quarantine = path.join(parent, quarantineName);
  revalidate(parentBinding, `${label} parent`);
  if (!sameIdentity(identityOf(target, label), targetIdentity)) throw new Error(`${label} identity changed before removal`);
  assertBoundTree(target, treeBinding, label);
  if (pathEntryExists(quarantine)) throw new Error(`${label} quarantine collision already exists`);
  const authority = recoveryHmacAuthority(root, label);
  const quarantineRelative = path.posix.join(parentRelative, quarantineName);
  const journalPayload: RemovalJournalPayload = {
    version: 2,
    kind: 'docs-tooling-stage-removal',
    repositoryRoot: root,
    repositoryIdentity: identityOf(root, `${label} repository root`),
    relative,
    quarantineRelative,
    treeBinding,
  };
  const checksummedJournal: ChecksummedRemovalJournal = {
    ...journalPayload,
    checksum: removalJournalChecksum(journalPayload),
  };
  const journalRelative = removalJournalRelative(relative);
  revalidate(authority.binding, `${label} recovery authority`);
  writeSecureAtomicFile(
    root,
    journalRelative,
    `${JSON.stringify({...checksummedJournal, hmac: removalJournalHmac(checksummedJournal, authority.key)})}\n`,
    `${label} recovery journal`,
    {mode: 0o600},
  );
  revalidate(authority.binding, `${label} recovery authority`);
  revalidate(parentBinding, `${label} parent`);
  if (!sameIdentity(identityOf(target, label), targetIdentity)) throw new Error(`${label} identity changed before quarantine rename`);
  assertBoundTree(target, treeBinding, label);
  renameSync(target, quarantine);
  if (!sameIdentity(identityOf(quarantine, label), targetIdentity)) throw new Error(`${label} identity changed during removal`);
  revalidate(parentBinding, `${label} parent`);
  fsyncDirectory(parent);
  options.testing?.afterQuarantineRename?.(quarantine);
  assertBoundTree(quarantine, treeBinding, label);
  removeBoundTree(
    quarantine,
    new Map(treeBinding.map(entry => [entry.relative, entry.identity])),
    label,
    '.',
    options.testing,
  );
  revalidate(parentBinding, `${label} parent`);
  fsyncDirectory(parent);
  removeSecureFile(root, journalRelative, `${label} recovery journal`);
}

export function copySecureTree(sourceRoot: string, sourceInput: string, targetRoot: string, targetInput: string, label: string): void {
  const source = resolveSecureRepositoryPath(sourceRoot, sourceInput, `${label} source`);
  const sourceIdentity = identityOf(source, `${label} source`);
  if (sourceIdentity.kind === 'file') {
    writeSecureAtomicFile(
      targetRoot,
      targetInput,
      readSecureFile(sourceRoot, sourceInput, `${label} source`),
      `${label} target`,
      {replace: true, mode: sourceIdentity.mode & 0o777},
    );
    return;
  }
  const target = ensureSecureDirectory(targetRoot, targetInput, `${label} target`, 0o700);
  setDirectoryMode(target, `${label} target`, 0o700);
  try {
    for (const entry of readdirSync(source).sort((left, right) => left.localeCompare(right, 'en'))) {
      copySecureTree(
        sourceRoot,
        path.posix.join(sourceInput, entry),
        targetRoot,
        path.posix.join(targetInput, entry),
        label,
      );
    }
    if (!sameIdentity(identityOf(source, `${label} source`), sourceIdentity)) throw new Error(`${label} source changed while copying`);
  } finally {
    setDirectoryMode(target, `${label} target`, sourceIdentity.mode & 0o777);
  }
}
