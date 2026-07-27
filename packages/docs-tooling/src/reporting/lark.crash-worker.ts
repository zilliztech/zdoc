import {writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

const [repositoryRoot, crashPoint] = process.argv.slice(2);
if (!repositoryRoot || !crashPoint) throw new Error('repository root and crash point are required');

const state = {
  schemaVersion: 1,
  variant: 'ordered',
  state: {
    messageId: 'om_1',
    title: 'Build',
    stages: ['Fetch', 'Build'],
    statuses: ['done', 'running'],
    currentIndex: 1,
    notes: ['crashed generation'],
    startedAt: '2026-07-16T10:00:00.000Z',
  },
};

writeAtomicRepositoryFiles(
  repositoryRoot,
  [{path: '.build-card-state.json', contents: JSON.stringify(state, null, 2)}],
  'Card state',
  {
    afterRename: event => {
      if (`rename:${event.kind}:${event.operationIndex}` === crashPoint) process.kill(process.pid, 'SIGKILL');
    },
    afterJournal: event => {
      if (`journal:${event.phase}:${event.operationIndex ?? 'none'}` === crashPoint) process.kill(process.pid, 'SIGKILL');
    },
  },
);
