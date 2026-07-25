import {spawnSync} from 'node:child_process';
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {resolveManualPublication} from '../manuals/registry.ts';
import {
  PUBLICATION_DIAGNOSTICS_FILE,
  createPublicationDiagnostics,
  readAndValidatePublicationDiagnostics,
  writePublicationDiagnostics,
} from './diagnostics.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'publication-diagnostics-'));
}

function fixture(root: string, stage = 'tmp/docs-tooling/en/python') {
  const resolved = resolveManualPublication('python', 'en');
  const stageRoot = path.join(root, stage);
  mkdirSync(stageRoot, {recursive: true});
  const identity = {
    site: 'en' as const,
    manual: 'python',
    stage,
    publication: resolved.publication,
    sourceChain: resolved.sourceChain,
  };
  const diagnostics = createPublicationDiagnostics(identity, `sha256:${'1'.repeat(64)}`);
  return {diagnostics, identity, stageRoot};
}

describe('publication diagnostics filesystem boundary', () => {
  it('publishes one complete immutable manifest exclusively and refuses replacement', () => {
    const root = temporaryRoot();
    const {diagnostics, identity, stageRoot} = fixture(root);
    const target = writePublicationDiagnostics(root, stageRoot, diagnostics);

    expect(path.basename(target)).toBe(PUBLICATION_DIAGNOSTICS_FILE);
    expect(lstatSync(target).isFile()).toBe(true);
    expect(lstatSync(target).nlink).toBe(1);
    expect(readFileSync(target, 'utf8')).toMatch(/"schemaVersion": 1/);
    expect(readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toEqual(diagnostics);
    expect(Object.isFrozen(readAndValidatePublicationDiagnostics(root, stageRoot, identity))).toBe(true);
    expect(() => writePublicationDiagnostics(root, stageRoot, diagnostics)).toThrow(/already exists/i);
    expect(readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toEqual(diagnostics);
  });

  it.each(['symlink', 'hardlink', 'fifo'] as const)('rejects a %s diagnostics entry', kind => {
    const root = temporaryRoot();
    const {identity, stageRoot} = fixture(root);
    const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);
    const external = path.join(root, 'external-diagnostics.json');
    writeFileSync(external, '{}\n');
    if (kind === 'symlink') symlinkSync(external, target);
    if (kind === 'hardlink') linkSync(external, target);
    if (kind === 'fifo') {
      const result = spawnSync('mkfifo', [target]);
      if (result.status !== 0) throw new Error(`mkfifo unavailable: ${result.stderr.toString()}`);
    }

    expect(() => readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toThrow(new RegExp(kind === 'hardlink' ? 'hard.?link' : 'regular|symlink|FIFO', 'i'));
  });

  it('rejects a stage root that escapes through a symlink ancestor without touching the destination', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/docs-tooling/en'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/en/python'));
    const {diagnostics} = fixture(root, 'safe-stage');
    const escapedStage = path.join(root, 'tmp/docs-tooling/en/python');

    expect(() => writePublicationDiagnostics(root, escapedStage, diagnostics)).toThrow(/symlink|escape|ancestor/i);
    expect(existsSync(path.join(outside, PUBLICATION_DIAGNOSTICS_FILE))).toBe(false);
  });

  it('rejects malformed and checksum-tampered manifests without rewriting them', () => {
    const root = temporaryRoot();
    const {diagnostics, identity, stageRoot} = fixture(root);
    const target = writePublicationDiagnostics(root, stageRoot, diagnostics);
    const tampered = JSON.parse(readFileSync(target, 'utf8')) as Record<string, unknown>;
    tampered.baselineCommit = `sha256:${'2'.repeat(64)}`;
    writeFileSync(target, `${JSON.stringify(tampered)}\n`);
    const bytes = readFileSync(target, 'utf8');

    expect(() => readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toThrow(/checksum/i);
    expect(readFileSync(target, 'utf8')).toBe(bytes);
    rmSync(target);
    writeFileSync(target, '{not json}\n');
    expect(() => readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toThrow(/valid JSON/i);
  });

  it('refuses to write a checksum-invalid diagnostics object', () => {
    const root = temporaryRoot();
    const {diagnostics, stageRoot} = fixture(root);
    const tampered = {...diagnostics, baselineCommit: `sha256:${'3'.repeat(64)}`};

    expect(() => writePublicationDiagnostics(root, stageRoot, tampered)).toThrow(/checksum/i);
    expect(existsSync(path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE))).toBe(false);
  });
});
