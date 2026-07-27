import {appendFileSync, existsSync, writeFileSync} from 'node:fs';

import {removeSecureStageTree} from './stageControl.ts';

const [root, stage, group, events, release, staleRelease, acquiredSignal, waitForAcquired, mode] = process.argv.slice(2);
if (!root || !stage || !group || !events) throw new Error('Bootstrap worker arguments are required');

removeSecureStageTree(root, stage, `Stage tree ${group}`, {
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
