import {createHash} from 'node:crypto';
import {lstatSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';

const WINDOWS_RESERVED_NAME = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/iu;

export type StageFile = Readonly<{
  path: string;
  size: number;
  sha256: string;
}>;

export type StageInventory = Readonly<{
  root: string;
  files: readonly StageFile[];
}>;

export function assertPathSetIntegrity(paths: readonly string[]): void {
  const caseKeys = new Map<string, string>();
  const unicodeKeys = new Map<string, string>();
  for (const relative of paths) {
    const caseKey = relative.toLocaleLowerCase('en-US');
    const priorCase = caseKeys.get(caseKey);
    if (priorCase && priorCase !== relative) throw new Error(`Stage path case collision: ${priorCase} and ${relative}`);
    caseKeys.set(caseKey, relative);
    const unicodeKey = relative.normalize('NFC');
    const priorUnicode = unicodeKeys.get(unicodeKey);
    if (priorUnicode && priorUnicode !== relative) throw new Error(`Stage path Unicode normalization collision: ${priorUnicode} and ${relative}`);
    unicodeKeys.set(unicodeKey, relative);
  }
}

export function validateStageFilesystem(
  rootInput: string,
  options: {maxFileSize?: number; maxPathLength?: number} = {},
): StageInventory {
  const root = path.resolve(rootInput);
  const rootStat = lstatSync(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`Stage root must be a non-symlink directory: ${root}`);
  const maxFileSize = options.maxFileSize ?? 20 * 1024 * 1024;
  const maxPathLength = options.maxPathLength ?? 240;
  const files: StageFile[] = [];
  const discoveredPaths: string[] = [];

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      const stats = lstatSync(absolute);
      if (stats.isSymbolicLink()) throw new Error(`Stage contains a symlink: ${relative}`);
      if (relative.length > maxPathLength) throw new Error(`Stage path exceeds maximum length ${maxPathLength}: ${relative}`);
      for (const segment of relative.split('/')) {
        if (WINDOWS_RESERVED_NAME.test(segment) || /[. ]$/u.test(segment)) throw new Error(`Stage path contains a reserved name: ${relative}`);
      }

      discoveredPaths.push(relative);

      if (stats.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!stats.isFile()) throw new Error(`Stage contains a non-regular file: ${relative}`);
      if (stats.nlink !== 1) throw new Error(`Stage file must not be hard-linked: ${relative}`);
      if ((stats.mode & 0o111) !== 0) throw new Error(`Stage file has an unexpected executable bit: ${relative}`);
      if (stats.size > maxFileSize) throw new Error(`Stage file size exceeds limit ${maxFileSize}: ${relative}`);
      const bytes = readFileSync(absolute);
      if (bytes.includes(Buffer.from('\r\n'))) throw new Error(`Stage file contains unauthorized CRLF line endings: ${relative}`);
      files.push(Object.freeze({
        path: relative,
        size: stats.size,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      }));
    }
  }

  visit(root);
  assertPathSetIntegrity(discoveredPaths);
  files.sort((left, right) => left.path.localeCompare(right.path, 'en'));
  return Object.freeze({root, files: Object.freeze(files)});
}
