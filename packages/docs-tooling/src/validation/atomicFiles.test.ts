import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {writeAtomicRepositoryFiles} from './atomicFiles.ts';

const linkPaths = ['tmp/link-report.md', 'tmp/link-report.json', 'tmp/report_1.md', 'tmp/report_1.json'];
const cardPaths = ['.build-card-state.json'];

function crashPoints(count: number): string[] {
  return [
    'journal:prepared:none',
    ...Array.from({length: count}, (_, index) => [`journal:backup:${index}`, `rename:backup:${index}`]).flat(),
    ...Array.from({length: count}, (_, index) => [`journal:install:${index}`, `rename:install:${index}`]).flat(),
    'journal:committed:none',
  ];
}

function temporaryRoot(paths: readonly string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), 'atomic-report-files-'));
  for (const relativePath of paths) {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), {recursive: true});
    writeFileSync(target, `old:${relativePath}\n`);
  }
  return root;
}

function assertClean(root: string): void {
  const visit = (directory: string): string[] => readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? [target, ...visit(target)] : [target];
  });
  const leftovers = visit(root).map(target => path.relative(root, target)).filter(relative => (
    relative.includes('.tmp') || relative.includes('.bak') || relative.includes('.journal') || relative.includes('.docs-tooling-transactions')
  ));
  expect(leftovers).toEqual([]);
}

describe.each([
  ['link report', 'link', linkPaths],
  ['card state', 'card', cardPaths],
] as const)('crash-safe atomic %s transaction', (_label, mode, paths) => {
  it.each(crashPoints(paths.length))('recovers after SIGKILL at %s', crashPoint => {
    const root = temporaryRoot(paths);
    const worker = path.join(import.meta.dirname, 'atomicFiles.crash-worker.ts');
    const result = spawnSync(process.execPath, ['--experimental-strip-types', worker, root, mode, crashPoint], {encoding: 'utf8'});

    expect(result.signal).toBe('SIGKILL');
    writeAtomicRepositoryFiles(root, paths.map(relativePath => ({
      path: relativePath,
      contents: `final:${relativePath}\n`,
    })), 'Crash-test output');

    for (const relativePath of paths) {
      expect(existsSync(path.join(root, relativePath))).toBe(true);
      expect(readFileSync(path.join(root, relativePath), 'utf8')).toBe(`final:${relativePath}\n`);
    }
    assertClean(root);
  });
});

it('refuses recovery when an installed target is replaced by a foreign inode', () => {
  const root = temporaryRoot(cardPaths);
  const worker = path.join(import.meta.dirname, 'atomicFiles.crash-worker.ts');
  const result = spawnSync(process.execPath, [
    '--experimental-strip-types', worker, root, 'card', 'rename:install:0',
  ], {encoding: 'utf8'});
  expect(result.signal).toBe('SIGKILL');

  const target = path.join(root, cardPaths[0]);
  unlinkSync(target);
  writeFileSync(target, 'foreign\n');

  expect(() => writeAtomicRepositoryFiles(root, [{path: cardPaths[0], contents: 'final\n'}], 'Crash-test output'))
    .toThrow(/foreign inode/i);
  expect(readFileSync(target, 'utf8')).toBe('foreign\n');
});

it('refuses recovery through a symlink swap without touching its referent', () => {
  const root = temporaryRoot(cardPaths);
  const outsideRoot = mkdtempSync(path.join(tmpdir(), 'atomic-report-outside-'));
  const outside = path.join(outsideRoot, 'sentinel.json');
  writeFileSync(outside, 'outside sentinel\n');
  const worker = path.join(import.meta.dirname, 'atomicFiles.crash-worker.ts');
  const result = spawnSync(process.execPath, [
    '--experimental-strip-types', worker, root, 'card', 'rename:install:0',
  ], {encoding: 'utf8'});
  expect(result.signal).toBe('SIGKILL');

  const target = path.join(root, cardPaths[0]);
  unlinkSync(target);
  symlinkSync(outside, target);

  expect(() => writeAtomicRepositoryFiles(root, [{path: cardPaths[0], contents: 'final\n'}], 'Crash-test output'))
    .toThrow(/non-symlink|symlink/i);
  expect(readFileSync(outside, 'utf8')).toBe('outside sentinel\n');
});
