import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import {spawn} from 'node:child_process';
import {createHash, createHmac} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {copySecureTree, ensureSecureDirectory, removeSecureStageTree, resolveSecureRepositoryPath, writeSecureAtomicFile} from './stageControl.ts';

function temporaryRoot(prefix = path.join(tmpdir(), 'docs-tooling-stage-control-')): string {
  return mkdtempSync(prefix);
}

function permissions(target: string): number {
  return lstatSync(target).mode & 0o777;
}

function recoveryJournal(root: string): string {
  const directory = path.join(root, 'tmp/docs-tooling/.stage-removal-journals');
  const entries = readdirSync(directory);
  if (entries.length !== 1) throw new Error(`Expected one recovery journal, found ${entries.length}`);
  return path.join(directory, entries[0]);
}

function journalIdentity(target: string): Readonly<{dev: number; ino: number; kind: 'file' | 'directory'; mode: number; nlink: number}> {
  const stats = lstatSync(target);
  return {
    dev: stats.dev,
    ino: stats.ino,
    kind: stats.isDirectory() ? 'directory' : 'file',
    mode: stats.mode,
    nlink: stats.nlink,
  };
}

function recoveryFenceOwner(pid: number, token: string): Record<string, unknown> {
  const payload = {version: 2, kind: 'docs-tooling-recovery-control-fence', pid, token};
  return {...payload, checksum: createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
}

describe('secure stage control', () => {
  it('revalidates and fsyncs each parent after creating every missing directory segment', () => {
    const root = temporaryRoot();
    const canonicalRoot = realpathSync(root);
    const events: string[] = [];

    ensureSecureDirectory(root, 'tmp/docs-tooling/journals', 'Journal directory', 0o700, {
      afterParentRevalidate(parent, created) {
        events.push(`revalidated:${path.relative(canonicalRoot, parent)}:${path.relative(canonicalRoot, created)}`);
      },
      afterParentFsync(parent, created) {
        events.push(`fsynced:${path.relative(canonicalRoot, parent)}:${path.relative(canonicalRoot, created)}`);
      },
    });

    expect(events).toEqual([
      'revalidated::tmp',
      'fsynced::tmp',
      'revalidated:tmp:tmp/docs-tooling',
      'fsynced:tmp:tmp/docs-tooling',
      'revalidated:tmp/docs-tooling:tmp/docs-tooling/journals',
      'fsynced:tmp/docs-tooling:tmp/docs-tooling/journals',
    ]);
  });

  it('securely accepts a concurrent creator that wins the mkdir race', () => {
    const root = temporaryRoot();
    const beforeMkdir = vi.fn((target: string) => mkdirSync(target, {mode: 0o700}));

    expect(ensureSecureDirectory(root, 'tmp', 'Concurrent directory', 0o700, {beforeMkdir}))
      .toBe(path.join(realpathSync(root), 'tmp'));
    expect(beforeMkdir).toHaveBeenCalledOnce();
    expect(lstatSync(path.join(root, 'tmp')).isDirectory()).toBe(true);
  });

  it('accepts lexical and canonical macOS temporary-path aliases in both directions without changing root spelling', () => {
    const lexicalRoot = temporaryRoot('/tmp/docs-tooling-stage-control-alias-');
    const canonicalRoot = realpathSync(lexicalRoot);

    expect(resolveSecureRepositoryPath(lexicalRoot, path.join(canonicalRoot, 'stage'), 'Stage', {allowMissing: true}))
      .toBe(path.join(lexicalRoot, 'stage'));
    expect(resolveSecureRepositoryPath(canonicalRoot, path.join(lexicalRoot, 'stage'), 'Stage', {allowMissing: true}))
      .toBe(path.join(canonicalRoot, 'stage'));
    expect(() => resolveSecureRepositoryPath(canonicalRoot, path.join(path.dirname(lexicalRoot), 'escape'), 'Stage', {allowMissing: true}))
      .toThrow(/below the repository root/i);
  });

  it('atomically replaces an existing regular file without unlinking it first', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));
    writeFileSync(path.join(root, 'stage/value.txt'), 'old\n');
    const beforeRename = vi.fn((target: string) => {
      expect(readFileSync(target, 'utf8')).toBe('old\n');
    });

    writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      replace: true,
      testing: {beforeRename},
    });

    expect(readFileSync(path.join(root, 'stage/value.txt'), 'utf8')).toBe('new\n');
    expect(beforeRename).toHaveBeenCalledOnce();
  });

  it('rejects a parent swap before rename without overwriting outside or leaving a temporary stage file', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    const stage = path.join(root, 'stage');
    const displacedStage = path.join(root, 'displaced-stage');
    mkdirSync(stage);
    writeFileSync(path.join(stage, 'value.txt'), 'old\n');
    writeFileSync(path.join(outside, 'value.txt'), 'sentinel\n');

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      replace: true,
      testing: {
        beforeRename(target) {
          renameSync(path.dirname(target), displacedStage);
          symlinkSync(outside, path.dirname(target));
        },
      },
    })).toThrow(/identity|changed|unsafe|symlink/i);

    expect(readFileSync(path.join(outside, 'value.txt'), 'utf8')).toBe('sentinel\n');
    expect(readdirSync(outside)).toEqual(['value.txt']);
    expect(readdirSync(displacedStage).sort()).toEqual(['value.txt']);
    expect(existsSync(path.join(root, 'stage/value.txt'))).toBe(true);
  });

  it('rejects replacement of the opened temporary pathname and cleans its private preparation directory', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));
    writeFileSync(path.join(root, 'stage/value.txt'), 'old\n');
    let attackerPath = '';

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      replace: true,
      testing: {
        afterTemporaryOpen(temporary) {
          attackerPath = temporary;
          unlinkSync(temporary);
          writeFileSync(temporary, 'attacker\n');
        },
      },
    })).toThrow(/temporary file identity changed/i);

    expect(readFileSync(path.join(root, 'stage/value.txt'), 'utf8')).toBe('old\n');
    expect(existsSync(attackerPath)).toBe(false);
    expect(readdirSync(path.join(root, 'stage'))).toEqual(['value.txt']);
  });

  it('cleans the bound temporary pathname when preparation fails after opening it', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      testing: {
        afterTemporaryOpen() {
          throw new Error('Injected temporary preparation failure');
        },
      },
    })).toThrow(/injected temporary preparation failure/i);

    expect(readdirSync(path.join(root, 'stage'))).toEqual([]);
  });

  it('uses a private mode-0700 directory for atomic-write preparation and removes it after success', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));
    let privateDirectory = '';
    const afterPrivateDirectoryCreate = vi.fn((directory: string) => {
      privateDirectory = directory;
      expect(permissions(directory)).toBe(0o700);
    });

    writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      testing: {afterPrivateDirectoryCreate},
    });

    expect(afterPrivateDirectoryCreate).toHaveBeenCalledOnce();
    expect(existsSync(privateDirectory)).toBe(false);
    expect(readdirSync(path.join(root, 'stage'))).toEqual(['value.txt']);
  });

  it('removes its private preparation directory when preparation fails', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));
    let privateDirectory = '';

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      testing: {
        afterPrivateDirectoryCreate(directory) {
          privateDirectory = directory;
          throw new Error('Injected private directory failure');
        },
      },
    })).toThrow(/injected private directory failure/i);

    expect(existsSync(privateDirectory)).toBe(false);
    expect(readdirSync(path.join(root, 'stage'))).toEqual([]);
  });

  it.each(['directory', 'symlink'] as const)(
    'leaves a pre-existing private-name collision %s unchanged when creation fails',
    kind => {
      const root = temporaryRoot();
      const stage = path.join(root, 'stage');
      const privateDirectoryName = '.docs-tooling-stage-control-collision';
      const collision = path.join(stage, privateDirectoryName);
      mkdirSync(stage);
      if (kind === 'directory') {
        mkdirSync(collision);
      } else {
        const foreign = temporaryRoot();
        symlinkSync(foreign, collision);
      }
      writeFileSync(path.join(collision, 'sentinel.txt'), 'sentinel\n');

      expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
        testing: {privateDirectoryName},
      })).toThrow(/exist|collision/i);

      expect(readFileSync(path.join(collision, 'sentinel.txt'), 'utf8')).toBe('sentinel\n');
      expect(lstatSync(collision).isSymbolicLink()).toBe(kind === 'symlink');
    },
  );

  it('rejects an empty test-controlled private directory name as unsafe', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'stage'));

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file', {
      testing: {privateDirectoryName: ''},
    })).toThrow(/name is unsafe/i);

    expect(readdirSync(path.join(root, 'stage'))).toEqual([]);
  });

  it('rejects a pre-existing symlinked destination parent without changing its outside target', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeFileSync(path.join(outside, 'sentinel.txt'), 'sentinel\n');
    symlinkSync(outside, path.join(root, 'stage'));

    expect(() => writeSecureAtomicFile(root, 'stage/value.txt', 'new\n', 'Stage file'))
      .toThrow(/symlink|unsafe/i);

    expect(readFileSync(path.join(outside, 'sentinel.txt'), 'utf8')).toBe('sentinel\n');
    expect(readdirSync(outside)).toEqual(['sentinel.txt']);
  });

  it('fails closed when a quarantined descendant identity changes before recursive cleanup', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage/nested'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/nested/value.txt'), 'stage\n');
    writeFileSync(path.join(outside, 'sentinel.txt'), 'outside\n');
    let quarantine = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterQuarantineRename(quarantinePath: string) {
          quarantine = quarantinePath;
          renameSync(path.join(quarantine, 'nested/value.txt'), path.join(quarantine, 'nested/displaced.txt'));
          symlinkSync(path.join(outside, 'sentinel.txt'), path.join(quarantine, 'nested/value.txt'));
        },
      },
    })).toThrow(/identity changed|symlink|unsafe/i);

    expect(readFileSync(path.join(outside, 'sentinel.txt'), 'utf8')).toBe('outside\n');
    expect(existsSync(quarantine)).toBe(true);
    expect(lstatSync(path.join(quarantine, 'nested/value.txt')).isSymbolicLink()).toBe(true);
  });

  it('leaves a foreign quarantine-name collision unchanged', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const quarantineName = '.stage.remove-collision';
    const collision = path.join(root, 'tmp', quarantineName);
    mkdirSync(collision);
    writeFileSync(path.join(collision, 'sentinel.txt'), 'foreign\n');

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {quarantineName},
    })).toThrow(/exist|collision/i);

    expect(readFileSync(path.join(collision, 'sentinel.txt'), 'utf8')).toBe('foreign\n');
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
  });

  it('recovers only known intact quarantine debris after the stage-control module is reloaded', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const foreign = path.join(root, 'tmp/.stage.remove-foreign');
    mkdirSync(foreign);
    writeFileSync(path.join(foreign, 'sentinel.txt'), 'foreign\n');
    let quarantine = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterQuarantineRename(quarantinePath: string) {
          quarantine = quarantinePath;
          throw new Error('Injected interruption after quarantine');
        },
      },
    })).toThrow(/injected interruption/i);
    expect(existsSync(quarantine)).toBe(true);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree');

    expect(existsSync(quarantine)).toBe(false);
    expect(readFileSync(path.join(foreign, 'sentinel.txt'), 'utf8')).toBe('foreign\n');
  });

  it('authenticates and resumes a partially deleted quarantine after module reload', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    for (const name of ['a.txt', 'b.txt', 'c.txt']) writeFileSync(path.join(root, 'tmp/stage', name), `${name}\n`);
    let quarantine = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterQuarantineRename(value) { quarantine = value; },
        beforeBoundEntryRemoval(relative) {
          if (relative === 'b.txt') throw new Error('Injected ordinary mid-walk deletion failure');
        },
      },
    })).toThrow(/ordinary mid-walk deletion failure/i);
    expect(existsSync(path.join(quarantine, 'a.txt'))).toBe(false);
    expect(readFileSync(path.join(quarantine, 'b.txt'), 'utf8')).toBe('b.txt\n');
    expect(readFileSync(path.join(quarantine, 'c.txt'), 'utf8')).toBe('c.txt\n');

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree');

    expect(existsSync(quarantine)).toBe(false);
    expect(readdirSync(path.join(root, 'tmp/docs-tooling/.stage-removal-journals'))).toEqual([]);
  });

  it.each(['addition', 'replacement'] as const)(
    'fails closed when partial recovery observes an unauthenticated %s',
    async attack => {
      const root = temporaryRoot();
      mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
      for (const name of ['a.txt', 'b.txt', 'c.txt']) writeFileSync(path.join(root, 'tmp/stage', name), `${name}\n`);
      let quarantine = '';
      expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
        testing: {
          afterQuarantineRename(value) { quarantine = value; },
          beforeBoundEntryRemoval(relative) {
            if (relative === 'b.txt') throw new Error('interrupt');
          },
        },
      })).toThrow(/interrupt/i);
      if (attack === 'addition') {
        writeFileSync(path.join(quarantine, 'added.txt'), 'foreign\n');
      } else {
        unlinkSync(path.join(quarantine, 'b.txt'));
        writeFileSync(path.join(quarantine, 'b.txt'), 'replacement\n');
      }

      vi.resetModules();
      const reloadedStageControl = await import('./stageControl.ts');
      expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
        .toThrow(/added|replaced|identity|authenticated/i);

      expect(existsSync(quarantine)).toBe(true);
      expect(readFileSync(path.join(quarantine, attack === 'addition' ? 'added.txt' : 'b.txt'), 'utf8'))
        .toContain(attack === 'addition' ? 'foreign' : 'replacement');
    },
  );

  it('fails closed and leaves quarantine untouched when the persistent recovery journal is malformed', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    let quarantine = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterQuarantineRename(quarantinePath: string) {
          quarantine = quarantinePath;
          throw new Error('Injected interruption after quarantine');
        },
      },
    })).toThrow(/injected interruption/i);
    const journal = recoveryJournal(root);
    writeFileSync(journal, '{"version":1}\n');

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/journal.*schema|journal.*invalid/i);

    expect(readFileSync(path.join(quarantine, 'value.txt'), 'utf8')).toBe('stage\n');
    expect(readFileSync(journal, 'utf8')).toBe('{"version":1}\n');
  });

  it('rejects a forged journal with valid paths, exact tree identities, and a recomputed public checksum', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    let originalQuarantine = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterQuarantineRename(quarantinePath: string) {
          originalQuarantine = quarantinePath;
          throw new Error('Injected interruption after quarantine');
        },
      },
    })).toThrow(/injected interruption/i);

    const foreignQuarantine = path.join(root, 'tmp/.stage.remove-forged');
    mkdirSync(path.join(foreignQuarantine, 'nested'), {recursive: true});
    writeFileSync(path.join(foreignQuarantine, 'nested/value.txt'), 'foreign\n');
    const journal = recoveryJournal(root);
    const forgedPayload = {
      version: 1,
      kind: 'docs-tooling-stage-removal',
      repositoryRoot: realpathSync(root),
      repositoryIdentity: journalIdentity(realpathSync(root)),
      relative: 'tmp/stage',
      quarantineRelative: 'tmp/.stage.remove-forged',
      treeBinding: [
        {relative: '.', identity: journalIdentity(foreignQuarantine)},
        {relative: 'nested', identity: journalIdentity(path.join(foreignQuarantine, 'nested'))},
        {relative: 'nested/value.txt', identity: journalIdentity(path.join(foreignQuarantine, 'nested/value.txt'))},
      ],
    };
    const checksum = createHash('sha256').update(JSON.stringify(forgedPayload)).digest('hex');
    writeFileSync(journal, `${JSON.stringify({...forgedPayload, checksum})}\n`);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/journal.*authentication|journal.*hmac|recovery key/i);

    expect(readFileSync(path.join(foreignQuarantine, 'nested/value.txt'), 'utf8')).toBe('foreign\n');
    expect(existsSync(originalQuarantine)).toBe(true);
    expect(existsSync(journal)).toBe(true);
  });

  it('leaves a complete private recovery bootstrap unpublished after an interrupted install and ignores it on retry', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const finalControl = path.join(root, 'tmp/docs-tooling/.stage-removal-control');
    let interruptedBootstrap = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterRecoveryBootstrapKeyPrepared(directory) {
          interruptedBootstrap = directory;
          expect(existsSync(finalControl)).toBe(false);
          throw new Error('Injected crash before recovery control install');
        },
        preserveRecoveryBootstrapOnFailure: true,
      },
    })).toThrow(/injected crash before recovery control install/i);

    expect(existsSync(finalControl)).toBe(false);
    expect(existsSync(interruptedBootstrap)).toBe(true);
    const interruptedKey = path.join(interruptedBootstrap, 'recovery-hmac.key');
    expect(readFileSync(interruptedKey)).toHaveLength(32);
    expect(permissions(interruptedBootstrap)).toBe(0o700);
    expect(permissions(interruptedKey)).toBe(0o600);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree');

    const finalKey = path.join(finalControl, 'recovery-hmac.key');
    expect(readFileSync(finalKey)).toHaveLength(32);
    expect(permissions(finalControl)).toBe(0o700);
    expect(permissions(finalKey)).toBe(0o600);
    expect(existsSync(interruptedBootstrap)).toBe(true);
  });

  it('cleans only its owned private recovery bootstrap after a partial key write fails', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const finalControl = path.join(root, 'tmp/docs-tooling/.stage-removal-control');
    let bootstrap = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterRecoveryBootstrapDirectoryCreate(directory) { bootstrap = directory; },
        duringRecoveryBootstrapKeyWrite(descriptor, key) {
          writeFileSync(descriptor, key.subarray(0, 8));
          throw new Error('Injected partial recovery key write failure');
        },
      },
    })).toThrow(/injected partial recovery key write failure/i);

    expect(existsSync(finalControl)).toBe(false);
    expect(existsSync(bootstrap)).toBe(false);
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree');
    expect(readFileSync(path.join(finalControl, 'recovery-hmac.key'))).toHaveLength(32);
  });

  it('fails closed when a key path collision appears inside its private recovery bootstrap', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    let bootstrap = '';
    const injected = vi.fn((bootstrapDirectory: string) => {
      bootstrap = bootstrapDirectory;
      const key = path.join(bootstrapDirectory, 'recovery-hmac.key');
      writeFileSync(key, Buffer.alloc(32, 7), {mode: 0o600});
      chmodSync(key, 0o600);
    });

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {afterRecoveryBootstrapDirectoryCreate: injected},
    })).toThrow(/recovery key|exist|collision/i);

    expect(injected).toHaveBeenCalledOnce();
    expect(existsSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control'))).toBe(false);
    expect(existsSync(bootstrap)).toBe(false);
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
  });

  it('serializes first-use recovery control across concurrent publication groups', async () => {
    const root = temporaryRoot();
    for (const group of ['guides', 'python']) {
      mkdirSync(path.join(root, `tmp/${group}`), {recursive: true});
      writeFileSync(path.join(root, `tmp/${group}/value.txt`), `${group}\n`);
    }
    const events = path.join(root, 'bootstrap-events.log');
    writeFileSync(events, '');
    const release = path.join(root, 'release-guides');
    const worker = path.join(import.meta.dirname, 'stageControl.bootstrap-worker.ts');
    const runWorker = (group: string, hold: boolean) => new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [
        '--experimental-strip-types', worker, root, `tmp/${group}`, group, events, hold ? release : '',
      ], {stdio: ['ignore', 'pipe', 'pipe']});
      let stderr = '';
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.once('error', reject);
      child.once('exit', code => {
        if (code === 0) resolve();
        else reject(new Error(`Bootstrap worker ${group} exited ${code}: ${stderr}`));
      });
    });

    const guides = runWorker('guides', true);
    await vi.waitFor(() => expect(readFileSync(events, 'utf8').trim().split('\n')).toEqual(['enter:guides']), {timeout: 2_000});
    const python = runWorker('python', false);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(readFileSync(events, 'utf8').trim().split('\n')).toEqual(['enter:guides']);
    writeFileSync(release, 'release\n');
    await Promise.all([guides, python]);

    const lines = readFileSync(events, 'utf8').trim().split('\n');
    let active = 0;
    let maxActive = 0;
    for (const line of lines) {
      if (line.startsWith('enter:')) active += 1;
      else active -= 1;
      maxActive = Math.max(maxActive, active);
    }
    expect(maxActive).toBe(1);
    expect(active).toBe(0);
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key'))).toHaveLength(32);
    expect(existsSync(path.join(root, 'tmp/guides'))).toBe(false);
    expect(existsSync(path.join(root, 'tmp/python'))).toBe(false);
  });

  it('never publishes an empty recovery fence when interrupted before owner preparation', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const finalFence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
    let bootstrap = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterRecoveryControlFenceBootstrapDirectoryCreate(directory) {
          bootstrap = directory;
          expect(existsSync(finalFence)).toBe(false);
          throw new Error('Injected recovery fence bootstrap crash');
        },
        preserveRecoveryControlFenceBootstrapOnFailure: true,
      },
    })).toThrow(/injected recovery fence bootstrap crash/i);

    expect(existsSync(finalFence)).toBe(false);
    expect(existsSync(bootstrap)).toBe(true);
    expect(readdirSync(bootstrap)).toEqual([]);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree');
    expect(existsSync(path.join(root, 'tmp/stage'))).toBe(false);
    expect(existsSync(finalFence)).toBe(false);
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key'))).toHaveLength(32);
    expect(existsSync(bootstrap)).toBe(true);
  });

  it('fails closed without overwriting a foreign empty final recovery fence', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const fence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
    mkdirSync(fence, {recursive: true, mode: 0o700});
    chmodSync(fence, 0o700);

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/recovery control fence.*missing.*owner/i);

    expect(readdirSync(fence)).toEqual([]);
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
  });

  it('does not let a delayed stale-fence contender unlink a replacement live fence', async () => {
    const root = temporaryRoot();
    for (const group of ['guides', 'python']) {
      mkdirSync(path.join(root, `tmp/${group}`), {recursive: true});
      writeFileSync(path.join(root, `tmp/${group}/value.txt`), `${group}\n`);
    }
    const fence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
    const stalePid = 2_147_483_647;
    mkdirSync(fence, {recursive: true, mode: 0o700});
    chmodSync(fence, 0o700);
    writeFileSync(
      path.join(fence, 'owner.json'),
      `${JSON.stringify(recoveryFenceOwner(stalePid, `${stalePid}-00000000-0000-4000-8000-000000000000`))}\n`,
      {mode: 0o600},
    );

    const events = path.join(root, 'stale-fence-events.log');
    const staleRelease = path.join(root, 'release-stale-observers');
    const acquiredSignal = path.join(root, 'guides-acquired');
    const guidesRelease = path.join(root, 'release-guides');
    const worker = path.join(import.meta.dirname, 'stageControl.bootstrap-worker.ts');
    writeFileSync(events, '');
    const runWorker = (group: string, hold: boolean, waitForAcquired: boolean) => new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [
        '--experimental-strip-types', worker, root, `tmp/${group}`, group, events,
        hold ? guidesRelease : '', staleRelease, acquiredSignal, waitForAcquired ? 'wait' : '', '',
      ], {stdio: ['ignore', 'pipe', 'pipe']});
      let stderr = '';
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.once('error', reject);
      child.once('exit', code => {
        if (code === 0) resolve();
        else reject(new Error(`Stale-fence worker ${group} exited ${code}: ${stderr}`));
      });
    });

    const guides = runWorker('guides', true, false);
    const python = runWorker('python', false, true);
    await vi.waitFor(() => {
      const staleObservers = readFileSync(events, 'utf8').trim().split('\n').filter(line => line.startsWith('stale:'));
      expect(staleObservers.sort()).toEqual(['stale:guides', 'stale:python']);
    }, {timeout: 2_000});
    writeFileSync(staleRelease, 'release\n');
    await vi.waitFor(() => expect(existsSync(acquiredSignal)).toBe(true), {timeout: 2_000});
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(readFileSync(events, 'utf8').trim().split('\n').filter(line => line.startsWith('enter:'))).toEqual(['enter:guides']);
    writeFileSync(guidesRelease, 'release\n');
    await Promise.all([guides, python]);

    const activity = readFileSync(events, 'utf8').trim().split('\n').filter(line => /^(?:enter|exit):/.test(line));
    let active = 0;
    let maxActive = 0;
    for (const line of activity) {
      active += line.startsWith('enter:') ? 1 : -1;
      maxActive = Math.max(maxActive, active);
    }
    expect(maxActive).toBe(1);
    expect(active).toBe(0);
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key'))).toHaveLength(32);
  });

  it('recovers a stale-removal claim whose owner crashed after acquiring it', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/guides'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/guides/value.txt'), 'guides\n');
    const fence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
    const stalePid = 2_147_483_647;
    mkdirSync(fence, {recursive: true, mode: 0o700});
    chmodSync(fence, 0o700);
    writeFileSync(
      path.join(fence, 'owner.json'),
      `${JSON.stringify(recoveryFenceOwner(stalePid, `${stalePid}-00000000-0000-4000-8000-000000000000`))}\n`,
      {mode: 0o600},
    );
    const events = path.join(root, 'claim-crash-events.log');
    writeFileSync(events, '');
    const worker = path.join(import.meta.dirname, 'stageControl.bootstrap-worker.ts');
    const crashed = spawn(process.execPath, [
      '--experimental-strip-types', worker, root, 'tmp/guides', 'guides', events, '', '', '', '', 'crash-claim',
    ], {stdio: ['ignore', 'pipe', 'pipe']});
    const crashResult = await new Promise<{code: number | null; signal: NodeJS.Signals | null}>((resolve, reject) => {
      crashed.once('error', reject);
      crashed.once('exit', (code, signal) => resolve({code, signal}));
    });
    expect(crashResult.signal).toBe('SIGKILL');
    expect(existsSync(path.join(fence, 'stale-removal.claim'))).toBe(true);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/guides', 'Stage tree guides');

    expect(existsSync(path.join(root, 'tmp/guides'))).toBe(false);
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key'))).toHaveLength(32);
  });

  it('publishes stale-fence removal by quarantine rename before destructive cleanup', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/guides'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/guides/value.txt'), 'guides\n');
    const controlParent = path.join(root, 'tmp/docs-tooling');
    const fence = path.join(controlParent, '.stage-removal-control-bootstrap.lock');
    const foreignQuarantine = path.join(controlParent, '.stage-removal-control-bootstrap.quarantine-foreign');
    const stalePid = 2_147_483_647;
    mkdirSync(fence, {recursive: true, mode: 0o700});
    chmodSync(fence, 0o700);
    writeFileSync(
      path.join(fence, 'owner.json'),
      `${JSON.stringify(recoveryFenceOwner(stalePid, `${stalePid}-00000000-0000-4000-8000-000000000000`))}\n`,
      {mode: 0o600},
    );
    mkdirSync(foreignQuarantine);
    writeFileSync(path.join(foreignQuarantine, 'sentinel.txt'), 'foreign\n');
    const events = path.join(root, 'quarantine-crash-events.log');
    writeFileSync(events, '');
    const worker = path.join(import.meta.dirname, 'stageControl.bootstrap-worker.ts');
    const crashed = spawn(process.execPath, [
      '--experimental-strip-types', worker, root, 'tmp/guides', 'guides', events, '', '', '', '', 'crash-quarantine',
    ], {stdio: ['ignore', 'pipe', 'pipe']});
    const crashResult = await new Promise<{code: number | null; signal: NodeJS.Signals | null}>((resolve, reject) => {
      crashed.once('error', reject);
      crashed.once('exit', (code, signal) => resolve({code, signal}));
    });

    expect(crashResult.signal).toBe('SIGKILL');
    expect(existsSync(fence)).toBe(false);
    const crashQuarantines = readdirSync(controlParent).filter(name => name.startsWith('.stage-removal-control-bootstrap.quarantine-') && name !== path.basename(foreignQuarantine));
    expect(crashQuarantines).toHaveLength(1);
    expect(readFileSync(path.join(foreignQuarantine, 'sentinel.txt'), 'utf8')).toBe('foreign\n');

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    reloadedStageControl.removeSecureStageTree(root, 'tmp/guides', 'Stage tree guides');
    expect(existsSync(path.join(root, 'tmp/guides'))).toBe(false);
    expect(readFileSync(path.join(foreignQuarantine, 'sentinel.txt'), 'utf8')).toBe('foreign\n');
    expect(existsSync(path.join(controlParent, crashQuarantines[0]))).toBe(true);
  });

  it('rejects an empty final recovery-control collision immediately before install without overwriting it', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    const finalControl = path.join(root, 'tmp/docs-tooling/.stage-removal-control');
    let bootstrap = '';

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {
        afterRecoveryBootstrapDirectoryCreate(directory) { bootstrap = directory; },
        beforeRecoveryControlInstall() { mkdirSync(finalControl, {mode: 0o700}); },
      },
    })).toThrow(/recovery key|collision|missing/i);

    expect(existsSync(finalControl)).toBe(true);
    expect(readdirSync(finalControl)).toEqual([]);
    expect(existsSync(bootstrap)).toBe(false);
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
  });

  it('rejects a journal whose payload and public checksum were tampered without the recovery HMAC key', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    let quarantine = '';
    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {afterQuarantineRename(value) { quarantine = value; throw new Error('interrupt'); }},
    })).toThrow(/interrupt/i);
    const journal = recoveryJournal(root);
    const forged = JSON.parse(readFileSync(journal, 'utf8'));
    forged.treeBinding[0].identity.mode += 1;
    const {checksum: _checksum, hmac, ...payload} = forged;
    forged.checksum = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    forged.hmac = hmac;
    writeFileSync(journal, `${JSON.stringify(forged)}\n`);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/HMAC|authentication/i);
    expect(readFileSync(path.join(quarantine, 'value.txt'), 'utf8')).toBe('stage\n');
  });

  it('rejects an intact journal when the persistent recovery key is replaced', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    let quarantine = '';
    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {afterQuarantineRename(value) { quarantine = value; throw new Error('interrupt'); }},
    })).toThrow(/interrupt/i);
    const key = path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key');
    writeFileSync(key, Buffer.alloc(32, 9));
    chmodSync(key, 0o600);

    vi.resetModules();
    const reloadedStageControl = await import('./stageControl.ts');
    expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/HMAC|authentication/i);
    expect(readFileSync(path.join(quarantine, 'value.txt'), 'utf8')).toBe('stage\n');
  });

  it.each(['symlink', 'hardlink', 'directory', 'wrong-mode'] as const)(
    'fails closed on a pre-existing recovery key %s collision',
    kind => {
      const root = temporaryRoot();
      const control = path.join(root, 'tmp/docs-tooling/.stage-removal-control');
      const key = path.join(control, 'recovery-hmac.key');
      mkdirSync(control, {recursive: true, mode: 0o700});
      chmodSync(control, 0o700);
      const external = path.join(root, 'external-key');
      writeFileSync(external, Buffer.alloc(32, 3));
      if (kind === 'symlink') symlinkSync(external, key);
      if (kind === 'hardlink') linkSync(external, key);
      if (kind === 'directory') mkdirSync(key);
      if (kind === 'wrong-mode') {
        writeFileSync(key, Buffer.alloc(32, 3));
        chmodSync(key, 0o644);
      }
      mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
      writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');

      expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
        .toThrow(/recovery key|symlink|hard-linked|mode-0600|regular file/i);
      expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
    },
  );

  it.each(['symlink', 'wrong-mode', 'file'] as const)(
    'fails closed on a pre-existing recovery control directory %s collision',
    kind => {
      const root = temporaryRoot();
      const parent = path.join(root, 'tmp/docs-tooling');
      const control = path.join(parent, '.stage-removal-control');
      mkdirSync(parent, {recursive: true});
      if (kind === 'symlink') symlinkSync(temporaryRoot(), control);
      if (kind === 'wrong-mode') {
        mkdirSync(control);
        chmodSync(control, 0o755);
      }
      if (kind === 'file') writeFileSync(control, 'collision\n');
      mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
      writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');

      expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
        .toThrow(/recovery control directory|symlink|directory|mode-0700/i);
      expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
    },
  );

  it('fails closed on an existing recovery journal directory that is not mode 0700', () => {
    const root = temporaryRoot();
    const journals = path.join(root, 'tmp/docs-tooling/.stage-removal-journals');
    mkdirSync(journals, {recursive: true});
    chmodSync(journals, 0o755);
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');

    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
      .toThrow(/journal directory.*0700|mode-0700/i);
    expect(readFileSync(path.join(root, 'tmp/stage/value.txt'), 'utf8')).toBe('stage\n');
  });

  it('domains the journal HMAC with its fixed protocol and schema version', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
    writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
    expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
      testing: {afterQuarantineRename() { throw new Error('interrupt'); }},
    })).toThrow(/interrupt/i);
    const journal = JSON.parse(readFileSync(recoveryJournal(root), 'utf8'));
    const {hmac, ...authenticated} = journal;
    const key = readFileSync(path.join(root, 'tmp/docs-tooling/.stage-removal-control/recovery-hmac.key'));
    const expected = createHmac('sha256', key)
      .update('docs-tooling-stage-removal-journal\0v2\0')
      .update(JSON.stringify(authenticated))
      .digest('hex');

    expect(hmac).toBe(expected);
  });

  it.each(['symlink', 'hardlink'] as const)(
    'fails closed and leaves quarantine untouched when the persistent recovery journal is a %s',
    async kind => {
      const root = temporaryRoot();
      mkdirSync(path.join(root, 'tmp/stage'), {recursive: true});
      writeFileSync(path.join(root, 'tmp/stage/value.txt'), 'stage\n');
      let quarantine = '';

      expect(() => removeSecureStageTree(root, 'tmp/stage', 'Stage tree', {
        testing: {
          afterQuarantineRename(quarantinePath: string) {
            quarantine = quarantinePath;
            throw new Error('Injected interruption after quarantine');
          },
        },
      })).toThrow(/injected interruption/i);
      const journal = recoveryJournal(root);
      const foreign = path.join(root, `foreign-${kind}-journal`);
      writeFileSync(foreign, readFileSync(journal));
      unlinkSync(journal);
      if (kind === 'symlink') symlinkSync(foreign, journal);
      else linkSync(foreign, journal);

      vi.resetModules();
      const reloadedStageControl = await import('./stageControl.ts');
      expect(() => reloadedStageControl.removeSecureStageTree(root, 'tmp/stage', 'Stage tree'))
        .toThrow(/symlink|hard-linked/i);

      expect(readFileSync(path.join(quarantine, 'value.txt'), 'utf8')).toBe('stage\n');
      expect(existsSync(journal)).toBe(true);
    },
  );

  it('preserves exact source file and directory modes under a restrictive umask', () => {
    const sourceRoot = temporaryRoot();
    const targetRoot = temporaryRoot();
    mkdirSync(path.join(sourceRoot, 'tree'));
    writeFileSync(path.join(sourceRoot, 'tree/value.txt'), 'value\n');
    chmodSync(path.join(sourceRoot, 'tree'), 0o755);
    chmodSync(path.join(sourceRoot, 'tree/value.txt'), 0o644);
    const priorUmask = process.umask(0o077);
    try {
      copySecureTree(sourceRoot, 'tree', targetRoot, 'copy', 'Stage copy');
    } finally {
      process.umask(priorUmask);
    }

    expect(permissions(path.join(targetRoot, 'copy'))).toBe(0o755);
    expect(permissions(path.join(targetRoot, 'copy/value.txt'))).toBe(0o644);
  });

  it('populates a read-only source directory before applying its exact destination mode', () => {
    const sourceRoot = temporaryRoot();
    const targetRoot = temporaryRoot();
    mkdirSync(path.join(sourceRoot, 'tree'));
    writeFileSync(path.join(sourceRoot, 'tree/value.txt'), 'value\n');
    chmodSync(path.join(sourceRoot, 'tree'), 0o555);

    copySecureTree(sourceRoot, 'tree', targetRoot, 'copy', 'Stage copy');

    expect(readFileSync(path.join(targetRoot, 'copy/value.txt'), 'utf8')).toBe('value\n');
    expect(permissions(path.join(targetRoot, 'copy'))).toBe(0o555);
  });

  it('removes a securely copied mode-0555 directory tree containing a child', () => {
    const sourceRoot = temporaryRoot();
    const root = temporaryRoot();
    mkdirSync(path.join(sourceRoot, 'tree/nested'), {recursive: true});
    writeFileSync(path.join(sourceRoot, 'tree/nested/value.txt'), 'value\n');
    chmodSync(path.join(sourceRoot, 'tree/nested'), 0o555);
    copySecureTree(sourceRoot, 'tree', root, 'tmp/stage', 'Stage copy');

    removeSecureStageTree(root, 'tmp/stage', 'Stage tree');

    expect(existsSync(path.join(root, 'tmp/stage'))).toBe(false);
  });
});
