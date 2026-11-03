import fs, {appendFileSync, existsSync, writeFileSync} from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';

import {removeSecureStageTree} from './stageControl.ts';

const [root, stage, group, events, release, staleRelease, acquiredSignal, waitForAcquired, mode] = process.argv.slice(2);
if (!root || !stage || !group || !events) throw new Error('Bootstrap worker arguments are required');

// Test-process scheduling only: pause after real filesystem operations. Production
// has no CLI/environment seam, and every builtin binding is restored before exit.
function releaseReadRace(): void {
  const directory = path.dirname(events);
  const fence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
  const originalStat = fs.lstatSync;
  const originalRename = fs.renameSync;
  const marker = (name: string, value: unknown = {}) => writeFileSync(path.join(directory, name), JSON.stringify(value), {flag: 'wx'});
  const trace = (kind: string, value: object = {}) => appendFileSync(events, `${JSON.stringify({kind, pid: process.pid, ...value})}\n`);
  const wait = (name: string) => {
    const until = Date.now() + 4_000;
    while (!existsSync(path.join(directory, name))) {
      if (Date.now() >= until) throw new Error(`Race worker handshake expired: ${name}`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5);
    }
  };
  let pausedRelease = false, pausedRead = false;
  try {
    if (mode === 'race-second') {
      fs.renameSync = ((from, to) => {
        const result = originalRename(from, to);
        if (from === fence && !pausedRelease) {
          pausedRelease = true;
          trace('reader-first-release-renamed');
          marker('reader-first-release-renamed');
          wait('reader-continue-first-release');
        }
        return result;
      }) as typeof fs.renameSync;
    }
    if (mode !== 'race-holder') {
      Object.defineProperty(fs, 'lstatSync', {value: ((target, options) => {
        const result = originalStat(target, options);
        if (target === fence && !pausedRead && new Error().stack?.includes('at readRecoveryControlFence')) {
          const owner = JSON.parse(fs.readFileSync(path.join(fence, 'owner.json'), 'utf8'));
          if (owner.pid !== process.pid) {
            pausedRead = true;
            const observation = {dev: result.dev.toString(), ino: result.ino.toString(), owner, stack: new Error().stack};
            trace('reader-directory-observed', observation);
            marker('reader-directory-observed', observation);
            wait('reader-resume');
          }
        }
        return result;
      }) as typeof fs.lstatSync});
    }
    syncBuiltinESMExports();
    removeSecureStageTree(root, stage, `Stage tree ${group}`, mode === 'race-holder' ? {testing: {
      afterRecoveryControlFenceAcquired() {
        const identity = originalStat(fence);
        marker('holder-acquired', {dev: identity.dev.toString(), ino: identity.ino.toString(), owner: JSON.parse(fs.readFileSync(path.join(fence, 'owner.json'), 'utf8'))});
        wait('holder-release');
      },
    }} : undefined);
    if (mode !== 'race-holder' && !pausedRead) throw new Error('Reader did not reach the scheduled observation');
    marker(`${group}-result.json`, {success: true, pausedRead, pausedRelease, stageRemoved: !existsSync(path.join(root, stage))});
  } catch (error) {
    marker(`${group}-result.json`, {success: false, message: (error as Error).message, stack: (error as Error).stack});
    process.exitCode = 1;
  } finally {
    Object.defineProperty(fs, 'lstatSync', {value: originalStat}); fs.renameSync = originalRename; syncBuiltinESMExports();
  }
}

function observationBoundaryControl(): void {
  const fence = path.join(root, 'tmp/docs-tooling/.stage-removal-control-bootstrap.lock');
  const owner = path.join(fence, 'owner.json');
  const originalStat = fs.lstatSync, originalNow = Date.now;
  const start = originalNow();
  let clock = start, observations = 0;
  const record = (pid: number) => {
    const payload = {version: 2, kind: 'docs-tooling-recovery-control-fence', pid, token: `${pid}-${randomUUID()}`};
    return {...payload, checksum: createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
  };
  const install = (pid: number) => {
    fs.mkdirSync(fence, {recursive: true, mode: 0o700});
    fs.chmodSync(fence, 0o700);
    writeFileSync(owner, JSON.stringify(record(pid)), {mode: 0o600});
    fs.chmodSync(owner, 0o600);
  };
  install(process.ppid);
  const originalDirectory = originalStat(fence).ino.toString();
  let outcome: Record<string, unknown>;
  try {
    if (mode === 'observe-deadline') Date.now = () => clock;
    Object.defineProperty(fs, 'lstatSync', {value: ((target, options) => {
      const value = originalStat(target, options);
      const stack = new Error().stack ?? '';
      const selected = mode === 'observe-owner-replaced' ? owner : fence;
      if (target === selected && stack.includes('at identityOf') && stack.includes('at readRecoveryControlFence') && !stack.includes('at checkGeneration')
        && (observations === 0 || mode === 'observe-deadline')) {
        observations++;
        if (mode === 'observe-replacement' || mode === 'observe-replacement-corrupt' || mode === 'observe-deadline') {
          fs.renameSync(fence, `${fence}.retained-${observations}`);
          install(mode === 'observe-deadline' ? process.ppid : process.pid);
          if (mode === 'observe-replacement-corrupt') writeFileSync(owner, '{');
          if (mode === 'observe-deadline') clock += 10_001;
        } else if (mode === 'observe-missing') fs.unlinkSync(owner);
        else if (mode === 'observe-malformed') writeFileSync(owner, '{');
        else if (mode === 'observe-schema') writeFileSync(owner, JSON.stringify({version: 2}));
        else if (mode === 'observe-checksum') writeFileSync(owner, JSON.stringify({...record(process.ppid), checksum: '0'.repeat(64)}));
        else if (mode === 'observe-mode') fs.chmodSync(fence, 0o750);
        else if (mode === 'observe-owner-mode') fs.chmodSync(owner, 0o640);
        else if (mode === 'observe-hardlink') fs.linkSync(owner, path.join(root, 'owner-link'));
        else if (mode === 'observe-owner-alias') {fs.renameSync(owner, path.join(root, 'owner-sentinel'));fs.symlinkSync(path.join(root, 'owner-sentinel'), owner);}
        else if (mode === 'observe-directory-alias') {fs.renameSync(fence, `${fence}.retained`);fs.symlinkSync(`${fence}.retained`, fence);}
        else if (mode === 'observe-parent-disappeared') fs.renameSync(path.dirname(fence), `${path.dirname(fence)}.retained`);
        else if (mode === 'observe-owner-replaced') {fs.renameSync(owner, path.join(root, 'old-owner'));writeFileSync(owner, JSON.stringify(record(process.pid)), {mode: 0o600});}
      }
      return value;
    }) as typeof fs.lstatSync});
    syncBuiltinESMExports();
    removeSecureStageTree(root, stage, 'Observation control');
    outcome = {rejected: false};
  } catch (error) {
    outcome = {rejected: true, message: (error as Error).message, stack: (error as Error).stack};
  } finally {
    Object.defineProperty(fs, 'lstatSync', {value: originalStat}); Date.now = originalNow; syncBuiltinESMExports();
  }
  writeFileSync(path.join(path.dirname(events), 'observation-result.json'), JSON.stringify({
    ...outcome, observations, clockAdvance: clock - start, originalDirectory,
    currentDirectory: existsSync(fence) ? originalStat(fence).ino.toString() : null,
    stagePreserved: existsSync(path.join(root, stage, 'value.txt')),
  }));
}

if (mode?.startsWith('race-')) releaseReadRace();
else if (mode?.startsWith('observe-')) observationBoundaryControl();
else removeSecureStageTree(root, stage, `Stage tree ${group}`, {
  testing: {
    afterRecoveryControlFenceObservedStale() {
      appendFileSync(events, `stale:${group}\n`);
      while (staleRelease && !existsSync(staleRelease)) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
      }
      while (waitForAcquired && acquiredSignal && !existsSync(acquiredSignal)) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
      }
    },
    afterRecoveryControlFenceStaleClaimAcquired() {
      if (mode === 'crash-claim') process.kill(process.pid, 'SIGKILL');
    },
    afterRecoveryControlFenceQuarantineRename() {
      if (mode === 'crash-quarantine') process.kill(process.pid, 'SIGKILL');
    },
    afterRecoveryControlFenceAcquired() {
      if (acquiredSignal && !waitForAcquired) writeFileSync(acquiredSignal, 'acquired\n');
      appendFileSync(events, `enter:${group}\n`);
      while (release && !existsSync(release)) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
      }
    },
    beforeRecoveryControlFenceRelease() {
      appendFileSync(events, `exit:${group}\n`);
    },
  },
});
