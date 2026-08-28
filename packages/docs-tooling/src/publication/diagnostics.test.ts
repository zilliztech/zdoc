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

import {describe, expect, it, vi} from 'vitest';

import {resolveManualPublication} from '../manuals/registry.ts';
import {
  PUBLICATION_DIAGNOSTICS_FILE,
  publicationAnchorPath,
  createPublicationDiagnostics,
  localizedRestTargets,
  publicationOwnedTargets,
  readAndValidatePublicationDiagnostics,
  writePublicationAnchor,
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

function writeTrustBundle(root: string, stageRoot: string, identity: ReturnType<typeof fixture>['identity'], diagnostics: ReturnType<typeof fixture>['diagnostics']): void {
  writePublicationDiagnostics(root, stageRoot, diagnostics);
  writePublicationAnchor(root, identity, diagnostics);
}

describe('publication diagnostics filesystem boundary', () => {
  it('publishes one complete immutable manifest exclusively and refuses replacement', () => {
    const root = temporaryRoot();
    const {diagnostics, identity, stageRoot} = fixture(root);
    writeTrustBundle(root, stageRoot, identity, diagnostics);
    const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);

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
    writeTrustBundle(root, stageRoot, identity, diagnostics);
    const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);
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

  it('fails closed when the external trusted anchor is missing', () => {
    const root = temporaryRoot();
    const {diagnostics, identity, stageRoot} = fixture(root);
    writePublicationDiagnostics(root, stageRoot, diagnostics);

    expect(() => readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toThrow(/anchor.*missing/i);
    expect(readFileSync(path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE), 'utf8')).toMatch(/baselineCommit/);
  });

  it('keeps valid anchors immutable and gives each diagnostics generation a distinct path', () => {
    const root = temporaryRoot();
    const {identity} = fixture(root);
    const first = createPublicationDiagnostics(identity, `sha256:${'1'.repeat(64)}`);
    const second = createPublicationDiagnostics(identity, `sha256:${'2'.repeat(64)}`);
    const firstPath = writePublicationAnchor(root, identity, first);
    const firstBytes = readFileSync(firstPath, 'utf8');
    const firstInode = lstatSync(firstPath).ino;
    const secondPath = writePublicationAnchor(root, identity, second);

    expect(secondPath).not.toBe(firstPath);
    expect(readFileSync(firstPath, 'utf8')).toBe(firstBytes);
    expect(lstatSync(firstPath).ino).toBe(firstInode);
    expect(publicationAnchorPath(root, identity, first.manifestSha256)).toBe(firstPath);
    expect(publicationAnchorPath(root, identity, second.manifestSha256)).toBe(secondPath);
  });

  it('propagates a non-collision failure after anchor installation while preserving complete bytes', () => {
    const root = temporaryRoot();
    const {diagnostics, identity} = fixture(root);

    expect(() => writePublicationAnchor(root, identity, diagnostics, {
      testing: {
        afterRename() {
          throw new Error('Injected anchor parent fsync failure');
        },
      },
    })).toThrow(/injected anchor parent fsync failure/i);

    const target = publicationAnchorPath(root, identity, diagnostics.manifestSha256);
    expect(JSON.parse(readFileSync(target, 'utf8'))).toMatchObject({diagnosticsManifestSha256: diagnostics.manifestSha256});
    expect(lstatSync(target).nlink).toBe(1);
  });

  it('installs an anchor without exposing a hard-link count of two', () => {
    const root = temporaryRoot();
    const {diagnostics, identity} = fixture(root);
    const afterRename = vi.fn((target: string) => {
      expect(lstatSync(target).nlink).toBe(1);
    });

    writePublicationAnchor(root, identity, diagnostics, {testing: {afterRename}});

    expect(afterRename).toHaveBeenCalledOnce();
  });

  it('does not downgrade an interrupted anchor install to success until retry confirms parent durability', () => {
    const root = temporaryRoot();
    const {diagnostics, identity} = fixture(root);
    expect(() => writePublicationAnchor(root, identity, diagnostics, {
      testing: {afterRename() { throw new Error('Injected cleanup interruption'); }},
    })).toThrow(/cleanup interruption/i);
    const beforeParentFsync = vi.fn(() => { throw new Error('Injected retry durability failure'); });

    expect(() => writePublicationAnchor(root, identity, diagnostics, {
      testing: {beforeParentFsync},
    })).toThrow(/retry durability failure/i);
    expect(beforeParentFsync).toHaveBeenCalledOnce();
    const target = publicationAnchorPath(root, identity, diagnostics.manifestSha256);
    expect(lstatSync(target).nlink).toBe(1);
    expect(JSON.parse(readFileSync(target, 'utf8'))).toMatchObject({diagnosticsManifestSha256: diagnostics.manifestSha256});
  });

  it('does not accept an identical EEXIST race until the fallback confirms parent durability', () => {
    const templateRoot = temporaryRoot();
    const template = fixture(templateRoot);
    const templatePath = writePublicationAnchor(templateRoot, template.identity, template.diagnostics);
    const identicalBytes = readFileSync(templatePath);
    const root = temporaryRoot();
    const {diagnostics, identity} = fixture(root);
    const beforeParentFsync = vi.fn(() => { throw new Error('Injected EEXIST fallback durability failure'); });

    expect(() => writePublicationAnchor(root, identity, diagnostics, {
      testing: {
        beforeRename(target: string) {
          writeFileSync(target, identicalBytes, {mode: 0o600});
          throw Object.assign(new Error('Injected identical install race'), {code: 'EEXIST'});
        },
        beforeParentFsync,
      },
    })).toThrow(/EEXIST fallback durability failure/i);

    expect(beforeParentFsync).toHaveBeenCalledOnce();
  });

  it('rejects a differing pre-existing anchor collision without rewriting it', () => {
    const root = temporaryRoot();
    const {diagnostics, identity} = fixture(root);
    const anchorRoot = path.join(root, 'tmp/docs-tooling/.publication-anchors');
    mkdirSync(anchorRoot, {recursive: true});
    const target = publicationAnchorPath(root, identity, diagnostics.manifestSha256);
    writeFileSync(target, '{"foreign":true}\n');

    expect(() => writePublicationAnchor(root, identity, diagnostics)).toThrow(/different bytes|anchor/i);
    expect(readFileSync(target, 'utf8')).toBe('{"foreign":true}\n');
  });

  it('validates two interleaved fetch generations without anchor cross-contamination', () => {
    const root = temporaryRoot();
    const {identity} = fixture(root);
    const firstStage = path.join(root, 'interleaved/first');
    const secondStage = path.join(root, 'interleaved/second');
    mkdirSync(firstStage, {recursive: true});
    mkdirSync(secondStage, {recursive: true});
    const first = createPublicationDiagnostics(identity, `sha256:${'1'.repeat(64)}`);
    const second = createPublicationDiagnostics(identity, `sha256:${'2'.repeat(64)}`);

    writePublicationDiagnostics(root, firstStage, first);
    writePublicationAnchor(root, identity, first);
    writePublicationDiagnostics(root, secondStage, second);
    writePublicationAnchor(root, identity, second);

    expect(readAndValidatePublicationDiagnostics(root, firstStage, identity)).toEqual(first);
    expect(readAndValidatePublicationDiagnostics(root, secondStage, identity)).toEqual(second);
  });

  it.each(['symlink', 'hardlink', 'fifo'] as const)('rejects a %s trusted anchor entry', kind => {
    const root = temporaryRoot();
    const {diagnostics, identity, stageRoot} = fixture(root);
    writeTrustBundle(root, stageRoot, identity, diagnostics);
    const target = publicationAnchorPath(root, identity, diagnostics.manifestSha256);
    rmSync(target);
    const external = path.join(root, 'external-anchor.json');
    writeFileSync(external, '{}\n');
    if (kind === 'symlink') symlinkSync(external, target);
    if (kind === 'hardlink') linkSync(external, target);
    if (kind === 'fifo') {
      const result = spawnSync('mkfifo', [target]);
      if (result.status !== 0) throw new Error(`mkfifo unavailable: ${result.stderr.toString()}`);
    }

    expect(() => readAndValidatePublicationDiagnostics(root, stageRoot, identity)).toThrow(new RegExp(kind === 'hardlink' ? 'hard.?link' : 'regular|symlink|FIFO', 'i'));
  });

  it('rejects a symlinked trusted anchor root without writing outside the repository', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    const {diagnostics, identity} = fixture(root);
    mkdirSync(path.join(root, 'tmp/docs-tooling'), {recursive: true});
    symlinkSync(outside, path.join(root, 'tmp/docs-tooling/.publication-anchors'));

    expect(() => writePublicationAnchor(root, identity, diagnostics)).toThrow(/anchor root.*unsafe|symlink/i);
    expect(existsSync(path.join(outside, `${diagnostics.manifestSha256}.json`))).toBe(false);
  });
});

describe('localized REST publication targets', () => {
  it('derives the Japanese i18n output dir for the English REST manual only', () => {
    const rest = resolveManualPublication('rest', 'en').publication;
    const python = resolveManualPublication('python', 'en').publication;
    const zhCnRest = resolveManualPublication('rest', 'zh-CN').publication;

    expect(localizedRestTargets('en', rest)).toEqual([
      {lang: 'ja-JP', outputDir: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful'},
    ]);
    expect(localizedRestTargets('en', python)).toEqual([]);
    expect(localizedRestTargets('zh-CN', zhCnRest)).toEqual([]);
  });

  it('includes localized REST output dirs in the owned targets', () => {
    const rest = resolveManualPublication('rest', 'en').publication;
    const owned = publicationOwnedTargets('en', rest);
    expect(owned).toContain('i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful');
    expect(owned).toContain('content/en/reference/api/restful/restful');
    expect(owned).toContain('generated/en/sidebars/restful.sidebar.js');
  });
});
